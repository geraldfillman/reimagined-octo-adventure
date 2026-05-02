/**
 * server.mjs — Local operator dashboard HTTP server
 *
 * Serves a single-page dashboard at http://localhost:3737 that reads
 * vault files directly and exposes JSON API endpoints + SSE streaming
 * for live puller output. No external dependencies beyond Node built-ins.
 *
 * Usage: node run.mjs dashboard
 */

import { createServer } from 'http';
import { readFile, readdir, stat, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { spawn } from 'child_process';
import { join, resolve, dirname, basename, relative } from 'path';
import { fileURLToPath } from 'url';

const STREAMLINE_SIDECAR_DIR    = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.cache', 'orchestrator', 'streamline-reports');
const CONFLUENCE_SIDECAR_DIR    = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.cache', 'orchestrator', 'confluence-scans');
const POSITIONING_SIDECAR_DIR   = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.cache', 'positioning');
const RUN_LEDGER_DIR            = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.cache', 'orchestrator', 'run-ledgers');
const SIGNAL_QUALITY_SIDECAR_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.cache', 'orchestrator', 'signal-quality');
const AGENT_MANIFEST_PATH    = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '16_Agents', 'agent-manifest.json');

import { getVaultRoot, getLearningRoot, getPullsDir, getSignalsDir, listSources, SOURCES } from '../lib/config.mjs';
import { readFolder, readNote } from '../lib/frontmatter.mjs';
import {
  controlWorkflowRun,
  getWorkflowRunGraph,
  handleRoutines,
  handleRuns,
  startWorkflowRun,
  streamWorkflowRunEvents,
} from './workflow-runs.mjs';
import { loadAgentThreads, loadLatestAgentThreads } from '../lib/agent-interactions.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPTS_DIR = resolve(__dirname, '..');

// ─── Job store for SSE streaming ─────────────────────────────────────────────

/** @type {Map<string, { process: import('child_process').ChildProcess, buffer: string[], listeners: Set<Function>, exitCode: number|null }>} */
const jobs = new Map();

function makeJobId() {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function makeRunId(cadence = 'routine') {
  return `run_${cadence}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

const SIGNAL_STATUS_ORDER = Object.freeze({
  critical: 0,
  alert: 1,
  watch: 2,
  clear: 3,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sendJson(res, data, status = 200) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
  });
  res.end(body);
}

function sendError(res, message, status = 500) {
  sendJson(res, { error: message }, status);
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

function compareFilenameDesc(left, right) {
  if (left.filename === right.filename) return 0;
  return left.filename > right.filename ? -1 : 1;
}

function normalizeSignalList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(item => String(item));
  if (value == null || value === '') return [];
  return [String(value)];
}

function slugifyThreadId(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseNumericValue(value) {
  if (value == null || value === '' || value === 'N/A') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const normalized = String(value).replace(/[$,%]/g, '').replace(/,/g, '').trim();
  if (!normalized || normalized === 'N/A') return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function splitMarkdownTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim().replace(/\\\|/g, '|'));
}

function parseMarkdownTable(content, heading) {
  if (!content) return [];

  const lines = String(content).split(/\r?\n/);
  let startIndex = 0;
  if (heading) {
    const headingIndex = lines.findIndex(line => line.trim() === `## ${heading}`);
    if (headingIndex === -1) return [];
    startIndex = headingIndex + 1;
  }

  let tableStart = -1;
  for (let index = startIndex; index < lines.length; index += 1) {
    if (lines[index].trim().startsWith('|')) {
      tableStart = index;
      break;
    }
  }
  if (tableStart === -1 || tableStart + 1 >= lines.length) return [];

  const tableLines = [];
  for (let index = tableStart; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line.startsWith('|')) break;
    tableLines.push(line);
  }
  if (tableLines.length < 2) return [];

  const headers = splitMarkdownTableRow(tableLines[0]);
  return tableLines.slice(2)
    .map(line => splitMarkdownTableRow(line))
    .filter(cells => cells.some(Boolean))
    .map(cells => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])));
}

function extractSectionBullets(content, heading, limit = 6) {
  if (!content) return [];
  const lines = String(content).split(/\r?\n/);
  const headingIndex = lines.findIndex(line => line.trim() === `## ${heading}`);
  if (headingIndex === -1) return [];

  const bullets = [];
  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (line.startsWith('## ')) break;
    if (!line.startsWith('- ')) continue;
    bullets.push(line.slice(2).replace(/\*\*/g, ''));
    if (bullets.length >= limit) break;
  }
  return bullets;
}

function getTableMetric(rows, label) {
  return rows.find(row => row.Metric === label)?.Value ?? null;
}

function calculatePercentDifference(price, baseline) {
  if (!Number.isFinite(price) || !Number.isFinite(baseline) || baseline === 0) return null;
  return ((price - baseline) / baseline) * 100;
}

function resolveMomentumState(rsi14) {
  if (!Number.isFinite(rsi14)) return 'unknown';
  if (rsi14 >= 70) return 'overbought';
  if (rsi14 <= 30) return 'oversold';
  if (rsi14 >= 55) return 'positive';
  if (rsi14 <= 45) return 'soft';
  return 'neutral';
}

function resolveTechnicalBias({ close, sma50, sma200, rsi14 }) {
  if (!Number.isFinite(close) || !Number.isFinite(sma50) || !Number.isFinite(sma200)) return 'mixed';
  if (close < sma200 || (close < sma50 && (rsi14 ?? 50) < 45)) return 'bearish';
  if (close > sma50 && close > sma200 && (rsi14 ?? 50) >= 55) return 'bullish';
  return 'mixed';
}

function extractCalendarRange(title) {
  const match = String(title ?? '').match(/\((\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})\)/);
  if (!match) return { from: null, to: null };
  return { from: match[1], to: match[2] };
}

function compareSignalStatus(left, right) {
  return (SIGNAL_STATUS_ORDER[left] ?? 99) - (SIGNAL_STATUS_ORDER[right] ?? 99);
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(item => String(item));
  if (value == null || value === '') return [];
  return [String(value)];
}

function stripWiki(value) {
  if (value == null) return '';
  return String(value)
    .replace(/^\[\[/, '')
    .replace(/\]\]$/, '')
    .replace(/\|.*$/, '')
    .trim();
}

function cleanTableLink(value) {
  if (value == null) return '';
  const text = String(value).trim();
  const wiki = text.match(/^\[\[(.+?)\]\]$/);
  if (wiki) return stripWiki(wiki[1]);
  return text;
}

function normalizeSymbol(value) {
  return String(value ?? '').trim().toUpperCase();
}

function latestNotesBy(notes, keyFn) {
  const map = new Map();
  for (const note of notes.sort(compareFilenameDesc)) {
    const key = keyFn(note);
    if (!key || map.has(key)) continue;
    map.set(key, note);
  }
  return map;
}

function priorityScore(priority) {
  return { high: 30, medium: 18, watch: 9, low: 4 }[String(priority ?? '').toLowerCase()] ?? 0;
}

function convictionScore(conviction) {
  return { high: 22, medium: 13, low: 5 }[String(conviction ?? '').toLowerCase()] ?? 0;
}

function monitorScore(status) {
  return {
    strengthening: 12,
    'on-track': 9,
    mixed: 3,
    watch: 1,
    'not-seen': 0,
    printing: -8,
  }[String(status ?? '').toLowerCase()] ?? 0;
}

function technicalScore(status, bias, momentum) {
  const statusScore = { clear: 8, watch: 3, alert: -5, critical: -10 }[String(status ?? '').toLowerCase()] ?? 0;
  const biasScore = { bullish: 5, mixed: 0, bearish: -5 }[String(bias ?? '').toLowerCase()] ?? 0;
  const momentumScore = { positive: 3, neutral: 0, soft: -2, overbought: -2, oversold: -1 }[String(momentum ?? '').toLowerCase()] ?? 0;
  return statusScore + biasScore + momentumScore;
}

function positionStance(score, signalStatus) {
  if (signalStatus === 'critical') return 'Event risk';
  if (score >= 62) return 'Core research';
  if (score >= 46) return 'Active review';
  if (score >= 32) return 'Watchlist';
  return 'Risk review';
}

function sortRelatedTheses(left, right) {
  return (
    priorityScore(right.allocation_priority) - priorityScore(left.allocation_priority) ||
    convictionScore(right.conviction) - convictionScore(left.conviction) ||
    (Number(left.allocation_rank ?? 999) - Number(right.allocation_rank ?? 999)) ||
    left.name.localeCompare(right.name)
  );
}

// ─── API handlers ─────────────────────────────────────────────────────────────

/** GET /api/status — API key check */
async function handleStatus() {
  const sources = listSources();
  return sources.map(s => ({
    id: s.id,
    name: s.name,
    requiresKey: s.requiresKey,
    hasKey: s.hasKey,
    status: s.requiresKey ? (s.hasKey ? 'ok' : 'missing') : 'no-key',
  }));
}

/** GET /api/theses — all thesis frontmatter summaries */
async function handleTheses() {
  const dir = join(getVaultRoot(), '10_Theses');
  const notes = await readFolder(dir, false);
  return notes
    .filter(n => n.data.node_type === 'thesis' || n.data.conviction)
    .map(n => ({
      filename: n.filename.replace('.md', ''),
      name: n.data.name ?? n.filename.replace('.md', ''),
      conviction: n.data.conviction ?? null,
      allocation_priority: n.data.allocation_priority ?? null,
      allocation_rank: n.data.allocation_rank ?? 999,
      monitor_status: n.data.monitor_status ?? null,
      monitor_last_review: n.data.monitor_last_review ?? null,
      break_risk_status: n.data.break_risk_status ?? null,
      why_now: n.data.why_now ?? null,
      next_catalyst: n.data.next_catalyst ?? null,
      tags: n.data.tags ?? [],
    }))
    .sort((a, b) => (a.allocation_rank ?? 999) - (b.allocation_rank ?? 999));
}

async function handleInvestmentSummary() {
  const vaultRoot = getVaultRoot();
  const thesisDir = join(vaultRoot, '10_Theses');
  const marketDir = join(getPullsDir(), 'Market');
  const thesisNotes = await readFolder(thesisDir, false);
  const marketNotes = await readFolder(marketDir, false);

  const activeThesisNotes = thesisNotes
    .filter(note => note.data.node_type === 'thesis' || note.data.conviction)
    .sort((left, right) =>
      (Number(left.data.allocation_rank ?? 999) - Number(right.data.allocation_rank ?? 999)) ||
      left.filename.localeCompare(right.filename)
    );

  const latestCatalysts = latestNotesBy(
    marketNotes.filter(note => note.data.data_type === 'catalyst_note'),
    note => normalizeSymbol(note.data.symbol)
  );
  const latestTechnicals = latestNotesBy(
    marketNotes.filter(note => note.data.data_type === 'technical_snapshot'),
    note => normalizeSymbol(note.data.symbol)
  );
  const latestWatchlists = latestNotesBy(
    marketNotes.filter(note => note.data.data_type === 'watchlist_report'),
    note => String(note.data.thesis ?? '').trim()
  );

  const positions = new Map();
  const thesisSummaries = [];

  function ensurePosition(symbol) {
    const ticker = normalizeSymbol(symbol);
    if (!ticker) return null;
    if (!positions.has(ticker)) {
      positions.set(ticker, {
        symbol: ticker,
        price: null,
        change: null,
        volume: null,
        technical_status: null,
        technical_bias: null,
        momentum_state: null,
        rsi14: null,
        price_vs_sma200_pct: null,
        market_cap: null,
        trailing_pe: null,
        ev_to_sales: null,
        roe_pct: null,
        target_upside_pct: null,
        next_earnings_date: null,
        days_to_earnings: null,
        catalyst_score: 0,
        catalyst_urgency: null,
        signal_status: 'clear',
        signals: [],
        related_theses: [],
        summary: '',
        score: 0,
        stance: 'Watchlist',
      });
    }
    return positions.get(ticker);
  }

  for (const note of activeThesisNotes) {
    const data = note.data;
    const name = data.name ?? note.filename.replace('.md', '');
    const symbols = normalizeArray(data.fmp_watchlist_symbols).map(normalizeSymbol).filter(Boolean);
    const thesis = {
      filename: note.filename,
      name,
      status: data.status ?? 'Active',
      conviction: data.conviction ?? null,
      timeframe: data.timeframe ?? null,
      allocation_priority: data.allocation_priority ?? null,
      allocation_rank: data.allocation_rank ?? null,
      position_sizing: data.position_sizing ?? null,
      monitor_status: data.monitor_status ?? null,
      monitor_last_review: data.monitor_last_review ?? null,
      monitor_action: data.monitor_action ?? null,
      monitor_change: data.monitor_change ?? null,
      break_risk_status: data.break_risk_status ?? null,
      why_now: data.why_now ?? null,
      variant_perception: data.variant_perception ?? null,
      next_catalyst: data.next_catalyst ?? null,
      disconfirming_evidence: data.disconfirming_evidence ?? null,
      expected_upside: data.expected_upside ?? null,
      expected_downside: data.expected_downside ?? null,
      core_entities: normalizeArray(data.core_entities).map(stripWiki),
      required_sources: normalizeArray(data.required_sources).map(stripWiki),
      tags: normalizeArray(data.tags),
      symbols,
      fmp: {
        primary_symbol: normalizeSymbol(data.fmp_primary_symbol),
        technical_status: data.fmp_primary_technical_status ?? null,
        technical_bias: data.fmp_primary_technical_bias ?? null,
        momentum_state: data.fmp_primary_momentum_state ?? null,
        rsi14: parseNumericValue(data.fmp_primary_rsi14),
        price_vs_sma200_pct: parseNumericValue(data.fmp_primary_price_vs_sma200_pct),
        market_cap: parseNumericValue(data.fmp_primary_market_cap),
        trailing_pe: parseNumericValue(data.fmp_primary_trailing_pe),
        ev_to_sales: parseNumericValue(data.fmp_primary_ev_to_sales),
        roe_pct: parseNumericValue(data.fmp_primary_roe_pct),
        target_upside_pct: parseNumericValue(data.fmp_primary_target_upside_pct),
        nonclear_count: parseNumericValue(data.fmp_technical_nonclear_count),
        next_earnings_date: data.fmp_next_earnings_date ?? null,
        next_earnings_symbols: normalizeArray(data.fmp_next_earnings_symbols).map(normalizeSymbol),
        last_sync: data.fmp_last_sync ?? null,
      },
    };

    thesis.summary = [
      thesis.why_now,
      thesis.next_catalyst ? `Next catalyst: ${thesis.next_catalyst}` : '',
      thesis.position_sizing ? `Sizing: ${thesis.position_sizing}` : '',
    ].filter(Boolean).join(' ');

    thesisSummaries.push(thesis);

    for (const symbol of symbols) {
      const position = ensurePosition(symbol);
      if (!position) continue;
      position.related_theses.push({
        name: thesis.name,
        allocation_priority: thesis.allocation_priority,
        allocation_rank: thesis.allocation_rank,
        conviction: thesis.conviction,
        monitor_status: thesis.monitor_status,
        break_risk_status: thesis.break_risk_status,
      });
    }
  }

  for (const note of latestWatchlists.values()) {
    const quoteRows = parseMarkdownTable(note.content, 'Quote Snapshot');
    const technicalRows = parseMarkdownTable(note.content, 'Technical Tape');
    const fundamentalsRows = parseMarkdownTable(note.content, 'Fundamentals Snapshot');
    const earningsRows = parseMarkdownTable(note.content, 'Earnings Window');

    for (const row of quoteRows) {
      const position = positions.get(normalizeSymbol(row.Symbol));
      if (!position) continue;
      position.price = row.Price || position.price;
      position.change = row.Change || position.change;
      position.volume = row.Volume || position.volume;
    }

    for (const row of technicalRows) {
      const position = positions.get(normalizeSymbol(row.Symbol));
      if (!position) continue;
      position.technical_status = row.Status || position.technical_status;
      position.technical_bias = row.Bias || position.technical_bias;
      position.momentum_state = row.Momentum || position.momentum_state;
      position.rsi14 = parseNumericValue(row['RSI 14']) ?? position.rsi14;
      position.price_vs_sma200_pct = parseNumericValue(row['Vs 200D %']) ?? position.price_vs_sma200_pct;
    }

    for (const row of fundamentalsRows) {
      const position = positions.get(normalizeSymbol(row.Symbol));
      if (!position) continue;
      position.market_cap = row['Market Cap'] || position.market_cap;
      position.trailing_pe = parseNumericValue(row['P/E']) ?? position.trailing_pe;
      position.ev_to_sales = parseNumericValue(row['EV/Sales']) ?? position.ev_to_sales;
      position.roe_pct = parseNumericValue(row['ROE %']) ?? position.roe_pct;
      position.target_upside_pct = parseNumericValue(row['Target Upside %']) ?? position.target_upside_pct;
    }

    for (const row of earningsRows) {
      const position = positions.get(normalizeSymbol(row.Symbol));
      if (!position) continue;
      if (!position.next_earnings_date || row.Date < position.next_earnings_date) {
        position.next_earnings_date = row.Date || position.next_earnings_date;
      }
    }
  }

  for (const [symbol, note] of latestTechnicals.entries()) {
    const position = positions.get(symbol);
    if (!position) continue;
    position.technical_status = note.data.signal_status ?? position.technical_status;
    position.technical_bias = note.data.technical_bias ?? position.technical_bias;
    position.momentum_state = note.data.momentum_state ?? position.momentum_state;
    position.rsi14 = parseNumericValue(note.data.rsi14) ?? position.rsi14;
    position.price_vs_sma200_pct = parseNumericValue(note.data.price_vs_sma200_pct) ?? position.price_vs_sma200_pct;
  }

  for (const [symbol, note] of latestCatalysts.entries()) {
    const position = positions.get(symbol);
    if (!position) continue;
    position.catalyst_score = parseNumericValue(note.data.catalyst_score) ?? position.catalyst_score;
    position.catalyst_urgency = note.data.catalyst_urgency ?? position.catalyst_urgency;
    position.signal_status = note.data.signal_status ?? position.signal_status;
    position.signals = normalizeArray(note.data.signals);
    position.next_earnings_date = note.data.next_earnings_date ?? position.next_earnings_date;
    position.days_to_earnings = parseNumericValue(note.data.days_to_earnings) ?? position.days_to_earnings;
  }

  const positionSummaries = Array.from(positions.values()).map(position => {
    position.related_theses = position.related_theses
      .filter((thesis, index, list) => list.findIndex(item => item.name === thesis.name) === index)
      .sort(sortRelatedTheses);
    const primary = position.related_theses[0] ?? null;
    const thesisBaseScore = position.related_theses.reduce((total, thesis) => (
      total + priorityScore(thesis.allocation_priority) + convictionScore(thesis.conviction) + monitorScore(thesis.monitor_status)
    ), 0);
    const cappedThesisScore = Math.min(thesisBaseScore, 58);
    const targetScore = Math.max(-10, Math.min(12, (parseNumericValue(position.target_upside_pct) ?? 0) / 4));
    position.score = Math.round(
      cappedThesisScore +
      (parseNumericValue(position.catalyst_score) ?? 0) +
      technicalScore(position.technical_status, position.technical_bias, position.momentum_state) +
      targetScore
    );
    position.stance = positionStance(position.score, position.signal_status);
    position.primary_thesis = primary?.name ?? cleanTableLink(latestCatalysts.get(position.symbol)?.data.primary_thesis);
    position.summary = [
      primary ? `${position.symbol} anchors ${primary.name}.` : `${position.symbol} is on the investment watchlist.`,
      position.catalyst_urgency ? `Catalyst: ${position.catalyst_urgency}.` : '',
      position.technical_status ? `Tape: ${position.technical_status}/${position.technical_bias ?? 'mixed'}.` : '',
      position.target_upside_pct != null ? `Target upside: ${position.target_upside_pct}%.` : '',
    ].filter(Boolean).join(' ');
    return position;
  }).sort((left, right) =>
    right.score - left.score ||
    compareSignalStatus(left.signal_status, right.signal_status) ||
    left.symbol.localeCompare(right.symbol)
  );

  const staleReviewCutoff = new Date();
  staleReviewCutoff.setDate(staleReviewCutoff.getDate() - 7);
  const staleReviews = thesisSummaries.filter(thesis => {
    if (!thesis.monitor_last_review) return true;
    return new Date(thesis.monitor_last_review) < staleReviewCutoff;
  }).length;

  return {
    asOf: new Date().toISOString(),
    dataFreshness: {
      latestFmpSync: thesisSummaries
        .map(thesis => thesis.fmp.last_sync)
        .filter(Boolean)
        .sort()
        .at(-1) ?? null,
      latestCatalystDate: Array.from(latestCatalysts.values())
        .map(note => note.data.date_pulled)
        .filter(Boolean)
        .sort()
        .at(-1) ?? null,
    },
    metrics: {
      thesisCount: thesisSummaries.length,
      highPriorityTheses: thesisSummaries.filter(thesis => thesis.allocation_priority === 'high').length,
      mediumPriorityTheses: thesisSummaries.filter(thesis => thesis.allocation_priority === 'medium').length,
      watchPriorityTheses: thesisSummaries.filter(thesis => thesis.allocation_priority === 'watch').length,
      positionCount: positionSummaries.length,
      alertPositions: positionSummaries.filter(position => ['critical', 'alert'].includes(position.signal_status)).length,
      nearTermEarnings: positionSummaries.filter(position => Number(position.days_to_earnings) >= 0 && Number(position.days_to_earnings) <= 14).length,
      staleReviews,
    },
    theses: thesisSummaries,
    positions: positionSummaries,
  };
}

/** GET /api/signals — all signal notes sorted newest first */
async function handleSignals() {
  const dir = getSignalsDir();
  const notes = await readFolder(dir, false);
  return notes
    .map(n => {
      const stem = n.filename.replace('.md', '');
      const dateMatch = stem.match(/^(\d{4}-\d{2}-\d{2})_(.+)$/);
      return {
        filename: stem,
        date: dateMatch ? dateMatch[1] : null,
        event: dateMatch ? dateMatch[2] : stem,
        signal_status: n.data.signal_status ?? 'clear',
        domain: n.data.domain ?? null,
        source: n.data.source ?? null,
        signals: n.data.signals ?? [],
        tags: n.data.tags ?? [],
      };
    })
    .sort((a, b) => (b.filename > a.filename ? 1 : -1));
}

/** GET /api/signal-board — pull notes grouped by signal_status */
async function handleSignalBoard() {
  const pullsDir = getPullsDir();
  let allNotes = [];

  // Read top-level domain subfolders only (not recursive into each file)
  let domains;
  try { domains = await readdir(pullsDir); } catch { domains = []; }

  for (const domain of domains) {
    const domainPath = join(pullsDir, domain);
    let info;
    try { info = await stat(domainPath); } catch { continue; }
    if (!info.isDirectory()) continue;

    const notes = await readFolder(domainPath, false);
    // Sort newest first, take last 30 per domain
    const sorted = notes
      .filter(n => n.data.signal_status)
      .sort((a, b) => (b.filename > a.filename ? 1 : -1))
      .slice(0, 30);
    allNotes.push(...sorted);
  }

  const board = { critical: [], alert: [], watch: [], clear: [], asOf: new Date().toISOString() };

  for (const n of allNotes) {
    const status = n.data.signal_status ?? 'clear';
    const entry = {
      filename: n.filename.replace('.md', ''),
      title: n.data.title ?? n.filename.replace('.md', ''),
      date: n.data.date_pulled ?? null,
      domain: n.data.domain ?? null,
      source: n.data.source ?? null,
      signals: n.data.signals ?? [],
    };
    if (board[status]) board[status].push(entry);
  }

  // Sort each bucket newest first
  for (const key of Object.keys(board)) {
    if (Array.isArray(board[key])) {
      board[key].sort((a, b) => (b.filename > a.filename ? 1 : -1));
    }
  }

  return board;
}

/** GET /api/pull-health — per-puller staleness */
async function handlePullHealth() {
  const pullsDir = getPullsDir();
  const today = new Date().toISOString().slice(0, 10);

  // Build reverse map: display name → slug
  const nameToSlug = {};
  for (const [slug, src] of Object.entries(SOURCES)) {
    nameToSlug[src.name.toLowerCase()] = slug;
  }

  // Collect latest pull date per domain subfolder
  const domainLatest = {};
  let domains;
  try { domains = await readdir(pullsDir); } catch { domains = []; }

  for (const domain of domains) {
    const domainPath = join(pullsDir, domain);
    let info;
    try { info = await stat(domainPath); } catch { continue; }
    if (!info.isDirectory()) continue;

    let files;
    try { files = await readdir(domainPath); } catch { continue; }
    const mdFiles = files.filter(f => f.endsWith('.md')).sort().reverse();

    for (const file of mdFiles.slice(0, 5)) {
      const note = await readNote(join(domainPath, file));
      if (!note?.data?.source) continue;
      const src = note.data.source.toLowerCase();
      const slug = nameToSlug[src];
      if (slug && !domainLatest[slug]) {
        domainLatest[slug] = note.data.date_pulled ?? file.slice(0, 10);
      }
    }
  }

  // Build health report for each registered source
  return Object.entries(SOURCES).map(([slug, src]) => {
    const lastRun = domainLatest[slug] ?? null;
    let daysStale = null;
    let status = 'never';

    if (lastRun) {
      const diff = Math.floor(
        (new Date(today) - new Date(lastRun)) / (1000 * 60 * 60 * 24)
      );
      daysStale = diff;
      status = diff <= 1 ? 'fresh' : 'stale';
    }

    return { slug, name: src.name, lastRun, daysStale, status };
  });
}

/** POST /api/run — spawn a puller command, return jobId */
/** GET /api/technical-risk â€” latest daily technical snapshots */
async function handleTechnicalRisk() {
  const dir = join(getPullsDir(), 'Market');
  const notes = await readFolder(dir, false);
  const latestBySymbol = new Map();

  for (const note of notes
    .filter(n => n.data.data_type === 'technical_snapshot')
    .filter(n => (n.data.interval ?? 'daily') === 'daily')
    .sort(compareFilenameDesc)) {
    const symbol = String(note.data.symbol ?? '').toUpperCase();
    if (!symbol || latestBySymbol.has(symbol)) continue;
    latestBySymbol.set(symbol, note);
  }

  const items = Array.from(latestBySymbol.values())
    .map(note => {
      const metrics = parseMarkdownTable(note.content, 'Technical Snapshot');
      const close = parseNumericValue(note.data.close ?? getTableMetric(metrics, 'Last Close'));
      const sma50 = parseNumericValue(note.data.sma50 ?? getTableMetric(metrics, 'SMA 50'));
      const sma200 = parseNumericValue(note.data.sma200 ?? getTableMetric(metrics, 'SMA 200'));
      const rsi14 = parseNumericValue(note.data.rsi14 ?? getTableMetric(metrics, 'RSI 14'));
      const signals = normalizeSignalList(note.data.signals);

      return {
        symbol: String(note.data.symbol ?? '').toUpperCase(),
        date: note.data.date_pulled ?? null,
        signal_status: note.data.signal_status ?? 'clear',
        close,
        sma50,
        sma200,
        rsi14,
        price_vs_50dma_pct: parseNumericValue(note.data.price_vs_sma50_pct) ?? calculatePercentDifference(close, sma50),
        price_vs_200dma_pct: parseNumericValue(note.data.price_vs_sma200_pct) ?? calculatePercentDifference(close, sma200),
        momentum_state: note.data.momentum_state ?? resolveMomentumState(rsi14),
        technical_bias: note.data.technical_bias ?? resolveTechnicalBias({ close, sma50, sma200, rsi14 }),
        signal_count: parseNumericValue(note.data.technical_signal_count) ?? signals.length,
        signals,
      };
    })
    .sort((left, right) =>
      compareSignalStatus(left.signal_status, right.signal_status) ||
      ((left.price_vs_200dma_pct ?? 999) - (right.price_vs_200dma_pct ?? 999)) ||
      left.symbol.localeCompare(right.symbol)
    );

  return {
    asOf: items[0]?.date ?? null,
    items,
  };
}

/** GET /api/earnings-calendar â€” latest earnings calendar note */
async function handleEarningsCalendar() {
  const dir = join(getPullsDir(), 'Market');
  const notes = await readFolder(dir, false);
  const latest = notes
    .filter(note => note.data.data_type === 'calendar')
    .sort(compareFilenameDesc)[0];

  if (!latest) {
    return {
      asOf: null,
      from: null,
      to: null,
      rowCount: 0,
      rows: [],
    };
  }

  const range = extractCalendarRange(latest.data.title);
  const rows = parseMarkdownTable(latest.content, 'Upcoming / Recent Earnings')
    .map(row => ({
      date: row.Date || null,
      symbol: row.Symbol || null,
      eps_est: row['EPS Est'] || null,
      eps_act: row['EPS Act'] || null,
      revenue_est: row['Revenue Est'] || null,
      revenue_act: row['Revenue Act'] || null,
      last_updated: row['Last Updated'] || null,
    }));

  return {
    asOf: latest.data.date_pulled ?? null,
    from: latest.data.calendar_from ?? range.from,
    to: latest.data.calendar_to ?? range.to,
    rowCount: parseNumericValue(latest.data.earnings_row_count) ?? rows.length,
    rows,
  };
}

/** GET /api/streamline-report - latest orchestrator streamline report */
async function handleStreamlineReport() {
  const dir = join(getPullsDir(), 'Orchestrator');
  const notes = await readFolder(dir, false);
  const latest = notes
    .filter(note => note.data.data_type === 'streamline_report')
    .sort(compareFilenameDesc)[0];

  if (!latest) {
    return {
      available: false,
      summary: 'No streamline report generated yet.',
      executive: [],
      questions: [],
      reviewQueue: [],
      fullReviewQueue: [],
      coverage: [],
      coverageAll: [],
    };
  }

  const activeReviewCount = parseNumericValue(latest.data.active_review_count) ?? 0;
  const quietDay = activeReviewCount === 0;

  const severityOrder = { HIGH: 0, MED: 1, LOW: 2, '—': 3 };
  const allReviewRows = parseMarkdownTable(latest.content, 'Active Alerts And Review Queue');
  const sortedReviewRows = [...allReviewRows].sort((a, b) => {
    const sa = severityOrder[a.Severity] ?? 9;
    const sb = severityOrder[b.Severity] ?? 9;
    if (sa !== sb) return sa - sb;
    const ca = Number(String(a.Confidence ?? '0').replace('%', '')) || 0;
    const cb = Number(String(b.Confidence ?? '0').replace('%', '')) || 0;
    return cb - ca;
  });
  const reviewQueue = sortedReviewRows.slice(0, 5);

  const allCoverageRows = parseMarkdownTable(latest.content, 'Coverage Gaps From Guide');

  const staleSummary = quietDay ? {
    coverageGapCount: parseNumericValue(latest.data.coverage_gap_count) ?? 0,
    message: 'No active queue. Focus on filling module gaps and running daily pulls.',
  } : null;

  return {
    available: true,
    title: latest.data.title ?? latest.filename.replace('.md', ''),
    date: latest.data.date_pulled ?? latest.filename.slice(0, 10),
    cadence: latest.data.cadence ?? 'daily',
    focus: latest.data.focus ?? 'all',
    signal_status: latest.data.signal_status ?? 'clear',
    active_review_count: activeReviewCount,
    coverage_gap_count: parseNumericValue(latest.data.coverage_gap_count) ?? 0,
    new_since_last_report: parseNumericValue(latest.data.new_since_last_report) ?? 0,
    resolved_since_last_report: parseNumericValue(latest.data.resolved_since_last_report) ?? 0,
    report_since: latest.data.report_since ?? null,
    report_window_days: parseNumericValue(latest.data.report_window_days),
    signals: normalizeSignalList(latest.data.signals),
    path: relative(getVaultRoot(), latest.path).replace(/\\/g, '/'),
    quiet_day: quietDay,
    staleSummary,
    executive: extractSectionBullets(latest.content, 'Executive Brief', 6),
    questions: parseMarkdownTable(latest.content, 'Daily Operating Questions').slice(0, 10),
    reviewQueue,
    fullReviewQueue: sortedReviewRows,
    learning: parseMarkdownTable(latest.content, 'Deeper Learning Queue').slice(0, 8),
    coverage: allCoverageRows.slice(0, 8),
    coverageAll: allCoverageRows,
  };
}

/** GET /api/signal-quality?date=YYYY-MM-DD — signal quality scores for a given date (defaults to today) */
async function handleSignalQuality(req) {
  const url  = new URL(req.url, 'http://localhost');
  const date = url.searchParams.get('date') ?? new Date().toISOString().slice(0, 10);
  if (!existsSync(SIGNAL_QUALITY_SIDECAR_DIR)) return { available: false, error: 'no signal quality data yet' };
  const filePath = join(SIGNAL_QUALITY_SIDECAR_DIR, `${date}.json`);
  if (!existsSync(filePath)) {
    // Fall back to the most recent file
    let files;
    try {
      files = (await readdir(SIGNAL_QUALITY_SIDECAR_DIR))
        .filter(f => f.endsWith('.json'))
        .sort()
        .reverse();
    } catch { return { available: false, error: 'no signal quality data yet' }; }
    if (!files.length) return { available: false, error: 'no signal quality data yet' };
    try {
      const raw = JSON.parse(await readFile(join(SIGNAL_QUALITY_SIDECAR_DIR, files[0]), 'utf8'));
      return { available: true, ...raw };
    } catch { return { available: false, error: 'failed to parse signal quality data' }; }
  }
  try {
    const raw = JSON.parse(await readFile(filePath, 'utf8'));
    return { available: true, ...raw };
  } catch { return { available: false, error: 'failed to parse signal quality data' }; }
}

/** GET /api/confluence — latest confluence scan sidecar */
async function handleConfluence() {
  if (!existsSync(CONFLUENCE_SIDECAR_DIR)) return { available: false };
  let files;
  try {
    files = (await readdir(CONFLUENCE_SIDECAR_DIR))
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse();
  } catch { return { available: false }; }
  if (!files.length) return { available: false };
  try {
    const raw = JSON.parse(await readFile(join(CONFLUENCE_SIDECAR_DIR, files[0]), 'utf8'));
    return { available: true, ...raw };
  } catch { return { available: false }; }
}

/** GET /api/positioning - latest big money vs retail positioning sidecar */
async function handlePositioning() {
  if (!existsSync(POSITIONING_SIDECAR_DIR)) return { available: false };
  let files;
  try {
    files = (await readdir(POSITIONING_SIDECAR_DIR))
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse();
  } catch { return { available: false }; }
  if (!files.length) return { available: false };
  try {
    const raw = JSON.parse(await readFile(join(POSITIONING_SIDECAR_DIR, files[0]), 'utf8'));
    return { available: true, ...raw };
  } catch { return { available: false }; }
}

/** GET /api/streamline-report/history?limit=N — last N sidecar summaries */
async function handleStreamlineReportHistory(req) {
  const url = new URL(req.url, 'http://localhost');
  const limit = Math.max(1, Math.min(60, parseInt(url.searchParams.get('limit') ?? '30', 10)));
  if (!existsSync(STREAMLINE_SIDECAR_DIR)) return { items: [] };
  let files;
  try {
    files = (await readdir(STREAMLINE_SIDECAR_DIR))
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, limit);
  } catch { return { items: [] }; }
  const items = await Promise.all(files.map(async file => {
    try {
      const raw = await readFile(join(STREAMLINE_SIDECAR_DIR, file), 'utf-8');
      const d = JSON.parse(raw);
      return {
        date: d.date,
        run_id: d.run_id ?? null,
        signal_status: d.signal_status ?? 'clear',
        active_review_count: d.active_review_count ?? 0,
        coverage_gap_count: d.coverage_gap_count ?? 0,
        new_since_last_report: d.new_since_last_report ?? 0,
        resolved_since_last_report: d.resolved_since_last_report ?? 0,
        cadence: d.cadence ?? 'daily',
        focus: d.focus ?? 'all',
      };
    } catch { return null; }
  }));
  return { items: items.filter(Boolean) };
}

/** GET /api/streamline-report/full?date=YYYY-MM-DD — full sidecar for a specific date */
async function handleStreamlineReportFull(req) {
  const url = new URL(req.url, 'http://localhost');
  const date = url.searchParams.get('date') ?? new Date().toISOString().slice(0, 10);
  const filePath = join(STREAMLINE_SIDECAR_DIR, `${date}.json`);
  if (!existsSync(filePath)) return { error: `No sidecar found for ${date}` };
  try {
    return JSON.parse(await readFile(filePath, 'utf-8'));
  } catch {
    return { error: `Failed to read sidecar for ${date}` };
  }
}

/** POST /api/streamline-report/acknowledge — write ack_status to vault note frontmatter */
async function handleStreamlineReportAcknowledge(body) {
  const { note_path, ack_status } = body;
  if (!note_path || !ack_status) return { error: 'note_path and ack_status required' };
  const validStatuses = ['unreviewed', 'reviewed', 'journaled', 'ignored'];
  if (!validStatuses.includes(ack_status)) return { error: `ack_status must be one of: ${validStatuses.join(', ')}` };

  // Resolve wikilink to file path: [[2026-05-01_FEMA_Declarations]] -> filename
  const stem = note_path.replace(/^\[\[/, '').replace(/\]\]$/, '').trim();
  const filename = stem.endsWith('.md') ? stem : `${stem}.md`;

  // Search pulls and signals directories
  const searchDirs = [getPullsDir(), getSignalsDir()];
  let foundPath = null;

  for (const baseDir of searchDirs) {
    if (!existsSync(baseDir)) continue;
    let domains;
    try { domains = await readdir(baseDir); } catch { continue; }
    for (const domain of domains) {
      const domainPath = join(baseDir, domain);
      let info;
      try { info = await stat(domainPath); } catch { continue; }
      if (info.isDirectory()) {
        const candidate = join(domainPath, filename);
        if (existsSync(candidate)) { foundPath = candidate; break; }
      }
    }
    if (foundPath) break;
    // Also check direct children (signals dir has no subfolders)
    const directCandidate = join(baseDir, filename);
    if (existsSync(directCandidate)) { foundPath = directCandidate; break; }
  }

  if (!foundPath) return { error: `Could not resolve ${note_path} to a vault file` };

  // Read the file, update frontmatter, write back
  try {
    const raw = await readFile(foundPath, 'utf-8');
    let updated;
    if (raw.startsWith('---')) {
      const closeIdx = raw.indexOf('\n---', 3);
      if (closeIdx === -1) return { error: 'Malformed frontmatter' };
      const fmBlock = raw.slice(0, closeIdx);
      const afterFm = raw.slice(closeIdx);
      // Remove existing ack_status line if present
      const cleanedFm = fmBlock.split('\n').filter(line => !line.startsWith('ack_status:')).join('\n');
      updated = cleanedFm + `\nack_status: "${ack_status}"` + afterFm;
    } else {
      // No frontmatter — prepend it
      updated = `---\nack_status: "${ack_status}"\n---\n${raw}`;
    }
    await writeFile(foundPath, updated, 'utf-8');
    return { success: true, path: foundPath, ack_status };
  } catch (err) {
    return { error: `Failed to write: ${err.message}` };
  }
}

/** GET /api/streamline-report/diff?from=YYYY-MM-DD&to=YYYY-MM-DD */
async function handleStreamlineReportDiff(req) {
  const url = new URL(req.url, 'http://localhost');
  const fromDate = url.searchParams.get('from');
  const toDate = url.searchParams.get('to') ?? new Date().toISOString().slice(0, 10);
  if (!fromDate) return { error: 'from parameter required (YYYY-MM-DD)' };

  async function loadSidecar(date) {
    const filePath = join(STREAMLINE_SIDECAR_DIR, `${date}.json`);
    if (!existsSync(filePath)) return null;
    try { return JSON.parse(await readFile(filePath, 'utf-8')); } catch { return null; }
  }

  const [fromSidecar, toSidecar] = await Promise.all([loadSidecar(fromDate), loadSidecar(toDate)]);
  if (!fromSidecar && !toSidecar) return { error: `No sidecars found for ${fromDate} or ${toDate}` };

  const fromItems = fromSidecar?.review_items ?? [];
  const toItems = toSidecar?.review_items ?? [];
  const fromPaths = new Set(fromItems.map(i => i.note_path));
  const toPaths = new Set(toItems.map(i => i.note_path));

  return {
    from: fromDate,
    to: toDate,
    from_status: fromSidecar?.signal_status ?? null,
    to_status: toSidecar?.signal_status ?? null,
    new_alerts: toItems.filter(i => !fromPaths.has(i.note_path)),
    resolved_alerts: fromItems.filter(i => !toPaths.has(i.note_path)),
    from_coverage_gaps: fromSidecar?.coverage_gap_count ?? null,
    to_coverage_gaps: toSidecar?.coverage_gap_count ?? null,
  };
}

/** GET /api/run-ledger?date=YYYY-MM-DD — latest (or specific) run ledger summary */
async function handleRunLedger(req) {
  const url  = new URL(req.url, 'http://localhost');
  const date = url.searchParams.get('date');

  if (!existsSync(RUN_LEDGER_DIR)) return { ledger: null, message: 'No run ledgers found. Run `node run.mjs pull agent-run` first.' };

  let files;
  try {
    files = (await readdir(RUN_LEDGER_DIR)).filter(f => f.endsWith('.json')).sort().reverse();
  } catch { return { ledger: null }; }

  const target = date ? `${date}.json` : files[0];
  if (!target || !files.includes(target)) return { ledger: null, message: `No ledger for ${date ?? 'today'}` };

  try {
    const ledger = JSON.parse(await readFile(join(RUN_LEDGER_DIR, target), 'utf-8'));
    return {
      run_id:        ledger.run_id,
      date:          ledger.date,
      cadence:       ledger.cadence,
      started_at:    ledger.started_at,
      completed_at:  ledger.completed_at,
      total_duration_ms: ledger.total_duration_ms,
      agent_count:   ledger.agent_count,
      success_count: ledger.success_count,
      failed_count:  ledger.failed_count,
      blocked_count: ledger.blocked_count,
      entries:       ledger.entries ?? [],
    };
  } catch { return { ledger: null }; }
}

/** GET /api/agent-threads?date=YYYY-MM-DD&limit=N - latest interaction threads */
async function handleAgentThreads(req) {
  const url = new URL(req.url, 'http://localhost');
  const date = url.searchParams.get('date') ?? new Date().toISOString().slice(0, 10);
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get('limit')) || 25));
  const threads = await loadLatestAgentThreads({ date, limit });
  return {
    date,
    count: threads.length,
    unresolved_count: threads.filter(thread => thread.status === 'unresolved').length,
    threads,
  };
}

/** GET /api/agent-threads/:id?date=YYYY-MM-DD - one interaction thread by id or slug */
async function handleAgentThread(req, id) {
  const url = new URL(req.url, 'http://localhost');
  const date = url.searchParams.get('date') ?? new Date().toISOString().slice(0, 10);
  const needle = decodeURIComponent(id || '').toLowerCase();
  const threads = await loadAgentThreads(date);
  const thread = threads.find(item =>
    String(item.thread_id || '').toLowerCase() === needle ||
    slugifyThreadId(item.thread_id).toLowerCase() === needle ||
    slugifyThreadId(item.topic).toLowerCase() === needle
  );
  return thread ? { date, thread } : { error: `No agent thread found for ${id}`, date };
}

/** GET /api/lineage?title=...&note_path=... — trace why a review item is in the queue */
async function handleLineage(req) {
  const url      = new URL(req.url, 'http://localhost');
  const title    = url.searchParams.get('title');
  const notePath = url.searchParams.get('note_path');
  if (!title && !notePath) return { error: 'Provide title or note_path query parameter.' };

  // Load latest sidecar
  let sidecar = null;
  try {
    const files = (await readdir(STREAMLINE_SIDECAR_DIR)).filter(f => f.endsWith('.json')).sort().reverse();
    if (files.length) sidecar = JSON.parse(await readFile(join(STREAMLINE_SIDECAR_DIR, files[0]), 'utf-8'));
  } catch { /* no sidecar */ }

  if (!sidecar) return { error: 'No streamline report sidecar found.' };

  // Find the matching review item
  const item = (sidecar.review_items ?? []).find(r =>
    (title    && r.title?.toLowerCase().includes(title.toLowerCase())) ||
    (notePath && r.note_path?.includes(notePath))
  );
  if (!item) return { error: `No review item found matching "${title ?? notePath}"`, available_count: sidecar.review_items?.length ?? 0 };

  // Load agent manifest to resolve which agent produced this note
  let agents = [];
  try {
    const manifest = JSON.parse(await readFile(AGENT_MANIFEST_PATH, 'utf-8'));
    agents = manifest.agents ?? [];
  } catch { /* manifest unavailable */ }

  function agentForNote(notePathStr) {
    if (!notePathStr) return null;
    const normalized = notePathStr.replace(/\[\[|\]\]/g, '').replace(/\\/g, '/');
    return agents.find(a => (a.output_dirs ?? []).some(d => normalized.includes(d))) ?? null;
  }

  // Load latest run ledger entry for cross-reference
  let ledgerEntry = null;
  try {
    const lFiles = (await readdir(RUN_LEDGER_DIR)).filter(f => f.endsWith('.json')).sort().reverse();
    if (lFiles.length) {
      const ledger = JSON.parse(await readFile(join(RUN_LEDGER_DIR, lFiles[0]), 'utf-8'));
      const ownerAgent = agentForNote(item.note_path);
      if (ownerAgent) {
        ledgerEntry = (ledger.entries ?? []).find(e => e.agent_id === ownerAgent.id) ?? null;
      }
    }
  } catch { /* no ledger */ }

  const producerAgent = agentForNote(item.note_path);

  const explanation = [
    `**${item.title}** entered the review queue on ${sidecar.date}.`,
    producerAgent ? `Produced by: **${producerAgent.name}** (output dir: ${(producerAgent.output_dirs ?? []).join(', ')}).` : 'Producing agent unknown — note may be from a manual pull.',
    `Edge type: ${item.edge_type ?? 'unclassified'}. Strategy: ${item.strategy_family ?? 'unclassified'}.`,
    `Signal status: **${item.signal_status}** | Disposition: ${item.disposition ?? 'Review'}.`,
    `Invalidation: ${item.invalidation ?? 'not specified'}.`,
    item.signals?.length ? `Signals: ${item.signals.slice(0, 5).join(', ')}.` : null,
  ].filter(Boolean).join(' ');

  return {
    item,
    producer_agent:  producerAgent ? { id: producerAgent.id, name: producerAgent.name, output_dirs: producerAgent.output_dirs } : null,
    ledger_entry:    ledgerEntry,
    report_date:     sidecar.date,
    report_run_id:   sidecar.run_id,
    explanation,
    lineage: [
      { stage: 'source_pull', label: item.note_path ?? 'unknown note', agent: producerAgent?.id ?? 'unknown' },
      { stage: 'streamline_report', label: `orchestrator-${sidecar.cadence}-${sidecar.date}`, agent: 'orchestrator' },
      { stage: 'review_queue', label: `${item.disposition ?? 'Review'} — ${item.severity ?? 'MED'}`, agent: 'operator' },
    ],
  };
}

async function handleRun(body) {
  const command = (body.command ?? '').trim();
  if (!command) return { error: 'command required' };

  const args = command.split(/\s+/);
  const jobId = makeJobId();

  const proc = spawn('node', ['run.mjs', ...args], {
    cwd: SCRIPTS_DIR,
    shell: true,
    env: { ...process.env },
  });

  const job = { process: proc, buffer: [], listeners: new Set(), exitCode: null };
  jobs.set(jobId, job);

  function pushLine(text, stream) {
    const line = JSON.stringify({ text: text.replace(/\n$/, ''), stream });
    job.buffer.push(line);
    for (const send of job.listeners) send(`event: line\ndata: ${line}\n\n`);
  }

  proc.stdout.on('data', chunk => pushLine(chunk.toString(), 'stdout'));
  proc.stderr.on('data', chunk => pushLine(chunk.toString(), 'stderr'));

  proc.on('exit', code => {
    job.exitCode = code ?? 0;
    const exitMsg = JSON.stringify({ code: job.exitCode });
    for (const send of job.listeners) send(`event: exit\ndata: ${exitMsg}\n\n`);
    // Clean up after 60s
    setTimeout(() => jobs.delete(jobId), 60_000);
  });

  return { jobId };
}

// ─── SSE stream handler ───────────────────────────────────────────────────────

function handleStream(res, jobId) {
  const job = jobs.get(jobId);
  if (!job) {
    res.writeHead(404);
    res.end('Job not found');
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Replay buffered output
  for (const line of job.buffer) {
    res.write(`event: line\ndata: ${line}\n\n`);
  }

  // If already exited, send exit immediately
  if (job.exitCode !== null) {
    res.write(`event: exit\ndata: ${JSON.stringify({ code: job.exitCode })}\n\n`);
    res.end();
    return;
  }

  // Subscribe to live output
  const send = chunk => res.write(chunk);
  job.listeners.add(send);

  res.on('close', () => {
    job.listeners.delete(send);
  });
}

// ─── Static file server ───────────────────────────────────────────────────────

async function serveStatic(res, filename) {
  const filePath = join(__dirname, filename);
  if (!existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = filename.split('.').pop();
  const types = { html: 'text/html', css: 'text/css', js: 'application/javascript' };
  const content = await readFile(filePath);
  res.writeHead(200, { 'Content-Type': types[ext] ?? 'text/plain' });
  res.end(content);
}


// ─── Learning API handlers ───────────────────────────────────────────────────

async function handleLearningStatus() {
  const date = new Date().toISOString().slice(0, 10);
  const dailyPath = join(getLearningRoot(), '01_Daily', `${date}.md`);
  
  if (!existsSync(dailyPath)) {
    return { status: 'Needs Daily Note', date };
  }

  const dailyNote = await readNote(dailyPath);
  const dailyCheckStatus = dailyNote.data.daily_check_status ?? 'Pending';
  const wildcardStatus = dailyNote.data.wildcard_status ?? 'Locked';
  
  if (dailyCheckStatus !== 'Completed' && dailyCheckStatus !== 'Complete') {
    return { status: 'Pending Knowledge Lock', date, dailyCheckStatus };
  }
  
  return { status: 'Wildcard Active', date, dailyCheckStatus, wildcardStatus };
}


async function handleActiveWildcard() {
  const date = new Date().toISOString().slice(0, 10);
  const wildcardsDir = join(getLearningRoot(), '03_Wildcards');
  if (!existsSync(wildcardsDir)) return { error: 'No wildcards dir' };
  const files = await readdir(wildcardsDir);
  const targetFiles = files.filter(f => f.startsWith(date) && f.endsWith('Wildcard.md'));
  if (targetFiles.length === 0) return { error: 'No wildcard for today' };
  
  const stats = await Promise.all(targetFiles.map(f => stat(join(wildcardsDir, f))));
  const sorted = targetFiles.map((f, i) => ({ f, mtime: stats[i].mtime.getTime() })).sort((a, b) => b.mtime - a.mtime);
  const todayFile = sorted[0].f;
  
  const content = await readFile(join(wildcardsDir, todayFile), 'utf8');
  return { filename: todayFile, content };
}

async function handleSaveWildcard(body) {
  const { filename, content } = body;
  if (!filename || !content) return { error: 'Missing data' };
  const filePath = join(getLearningRoot(), '03_Wildcards', filename);
  if (!existsSync(filePath)) return { error: 'File not found' };
  await writeFile(filePath, content, 'utf8');
  return { success: true };
}


async function handleActiveCheck(req) {
  const url = new URL(req.url, 'http://localhost');
  const type = url.searchParams.get('type') || 'daily';
  
  const date = new Date().toISOString().slice(0, 10);
  const checksDir = join(getLearningRoot(), '02_Checks');
  if (!existsSync(checksDir)) return { error: 'No checks dir' };
  
  const files = await readdir(checksDir);
  let targetFiles = [];
  
  if (type === 'daily') {
    targetFiles = files.filter(f => f.startsWith(date) && f.endsWith('Daily Check.md'));
  } else {
    targetFiles = files.filter(f => f.startsWith(date) && f.endsWith('Knowledge Check.md'));
  }
  
  if (targetFiles.length === 0) return { error: 'No active check found' };
  
  const stats = await Promise.all(targetFiles.map(f => stat(join(checksDir, f))));
  const sorted = targetFiles.map((f, i) => ({ f, mtime: stats[i].mtime.getTime() })).sort((a, b) => b.mtime - a.mtime);
  const targetFile = sorted[0].f;
  
  const content = await readFile(join(checksDir, targetFile), 'utf8');
  return { filename: targetFile, content };
}

async function handleSaveCheck(body) {
  const { filename, content } = body;
  if (!filename || !content) return { error: 'Missing data' };
  const filePath = join(getLearningRoot(), '02_Checks', filename);
  if (!existsSync(filePath)) return { error: 'File not found' };
  await writeFile(filePath, content, 'utf8');
  return { success: true };
}

async function handleLearningScaffold(body) {
  const command = 'learning-session';
  const args = [command];
  if (body.topic) args.push('--topic', `"${body.topic}"`);
  if (body.topicId) args.push('--topic-id', body.topicId);
  
  const jobId = makeJobId();
  const proc = spawn('node', ['run.mjs', ...args], {
    cwd: SCRIPTS_DIR,
    shell: true,
    env: { ...process.env },
  });

  const job = { process: proc, buffer: [], listeners: new Set(), exitCode: null };
  jobs.set(jobId, job);

  function pushLine(text, stream) {
    const line = JSON.stringify({ text: text.replace(/\n$/, ''), stream });
    job.buffer.push(line);
    for (const send of job.listeners) send(`event: line\ndata: ${line}\n\n`);
  }

  proc.stdout.on('data', chunk => pushLine(chunk.toString(), 'stdout'));
  proc.stderr.on('data', chunk => pushLine(chunk.toString(), 'stderr'));

  proc.on('exit', code => {
    job.exitCode = code ?? 0;
    const exitMsg = JSON.stringify({ code: job.exitCode });
    for (const send of job.listeners) send(`event: exit\ndata: ${exitMsg}\n\n`);
    setTimeout(() => jobs.delete(jobId), 60_000);
  });

  return { jobId };
}

// ─── Request dispatcher ───────────────────────────────────────────────────────

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost`);
  const path = url.pathname;
  const method = req.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.end();
    return;
  }

  try {
    if (path === '/' && method === 'GET') {
      return serveStatic(res, 'index.html');
    }

    if (path === '/investments' && method === 'GET') {
      return serveStatic(res, 'investments.html');
    }

    
    if (path === '/api/learning/status' && method === 'GET') {
      return sendJson(res, await handleLearningStatus());
    }
    
    
    if (path === '/api/learning/active-check' && method === 'GET') {
      return sendJson(res, await handleActiveCheck(req));
    }
    if (path === '/api/learning/save-check' && method === 'POST') {
      const body = await readBody(req);
      return sendJson(res, await handleSaveCheck(body));
    }
    if (path === '/api/learning/active-wildcard' && method === 'GET') {
      return sendJson(res, await handleActiveWildcard());
    }
    if (path === '/api/learning/save-wildcard' && method === 'POST') {
      const body = await readBody(req);
      return sendJson(res, await handleSaveWildcard(body));
    }
    if (path === '/api/learning/scaffold' && method === 'POST') {
      const body = await readBody(req);
      return sendJson(res, await handleLearningScaffold(body));
    }
    if (path === '/api/status' && method === 'GET') {
      return sendJson(res, await handleStatus());
    }

    if (path === '/api/theses' && method === 'GET') {
      return sendJson(res, await handleTheses());
    }

    if (path === '/api/investment-summary' && method === 'GET') {
      return sendJson(res, await handleInvestmentSummary());
    }

    if (path === '/api/signals' && method === 'GET') {
      return sendJson(res, await handleSignals());
    }

    if (path === '/api/signal-board' && method === 'GET') {
      return sendJson(res, await handleSignalBoard());
    }

    if (path === '/api/pull-health' && method === 'GET') {
      return sendJson(res, await handlePullHealth());
    }

    if (path === '/api/technical-risk' && method === 'GET') {
      return sendJson(res, await handleTechnicalRisk());
    }

    if (path === '/api/earnings-calendar' && method === 'GET') {
      return sendJson(res, await handleEarningsCalendar());
    }

    if (path === '/api/streamline-report' && method === 'GET') {
      return sendJson(res, await handleStreamlineReport());
    }

    if (path === '/api/streamline-report/history' && method === 'GET') {
      return sendJson(res, await handleStreamlineReportHistory(req));
    }

    if (path === '/api/streamline-report/full' && method === 'GET') {
      return sendJson(res, await handleStreamlineReportFull(req));
    }

    if (path === '/api/streamline-report/acknowledge' && method === 'POST') {
      const body = await readBody(req);
      return sendJson(res, await handleStreamlineReportAcknowledge(body));
    }

    if (path === '/api/streamline-report/diff' && method === 'GET') {
      return sendJson(res, await handleStreamlineReportDiff(req));
    }

    if (path === '/api/signal-quality' && method === 'GET') {
      return sendJson(res, await handleSignalQuality(req));
    }

    if (path === '/api/run-ledger' && method === 'GET') {
      return sendJson(res, await handleRunLedger(req));
    }

    if (path === '/api/agent-threads' && method === 'GET') {
      return sendJson(res, await handleAgentThreads(req));
    }

    if (path.startsWith('/api/agent-threads/') && method === 'GET') {
      const id = path.slice('/api/agent-threads/'.length);
      return sendJson(res, await handleAgentThread(req, id));
    }

    if (path === '/api/confluence' && method === 'GET') {
      return sendJson(res, await handleConfluence());
    }

    if (path === '/api/positioning' && method === 'GET') {
      return sendJson(res, await handlePositioning());
    }

    if (path === '/api/lineage' && method === 'GET') {
      return sendJson(res, await handleLineage(req));
    }

    if (path === '/api/routines' && method === 'GET') {
      return sendJson(res, handleRoutines());
    }

    if (path === '/api/runs' && method === 'GET') {
      return sendJson(res, handleRuns());
    }

    if (path === '/api/runs' && method === 'POST') {
      const body = await readBody(req);
      return sendJson(res, startWorkflowRun(body));
    }

    if (path.startsWith('/api/runs/') && method === 'GET') {
      const parts = path.split('/').filter(Boolean);
      const runId = parts[2];
      const action = parts[3];
      if (action === 'events') return streamWorkflowRunEvents(res, runId);
      if (action === 'graph') {
        const graph = getWorkflowRunGraph(runId);
        return graph ? sendJson(res, graph) : sendError(res, 'Run not found', 404);
      }
    }

    if (path.startsWith('/api/runs/') && method === 'POST') {
      const parts = path.split('/').filter(Boolean);
      const runId = parts[2];
      const action = parts[3];
      const graph = controlWorkflowRun(runId, action);
      return graph ? sendJson(res, graph) : sendError(res, 'Run not found', 404);
    }

    if (path === '/api/run' && method === 'POST') {
      const body = await readBody(req);
      return sendJson(res, await handleRun(body));
    }

    if (path.startsWith('/api/stream/') && method === 'GET') {
      const jobId = path.slice('/api/stream/'.length);
      return handleStream(res, jobId);
    }

    res.writeHead(404);
    res.end('Not found');
  } catch (err) {
    console.error('[dashboard]', err);
    sendError(res, err.message);
  }
}

// ─── Server start ─────────────────────────────────────────────────────────────

export function startServer(port = 3737) {
  const server = createServer(handleRequest);
  server.listen(port, '127.0.0.1', () => {
    console.log(`\n  My_Data Operator Dashboard`);
    console.log(`  http://localhost:${port}\n`);
    console.log(`  Press Ctrl+C to stop\n`);
  });
  server.on('error', err => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[dashboard] Port ${port} in use. Set DASHBOARD_PORT to use a different port.`);
    } else {
      console.error('[dashboard] Server error:', err.message);
    }
    process.exit(1);
  });
}
