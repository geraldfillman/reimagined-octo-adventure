/**
 * sports-settle.mjs - settle sports prediction ledgers from ESPN final scores
 *
 * Usage:
 *   node run.mjs pull sports-settle --date 2026-04-27
 *   node run.mjs pull sports-settle --ledger scripts/.cache/sports/predictions/2026-04-27_predictions.csv
 *   node run.mjs pull sports-settle --from 2026-04-27 --to 2026-04-28 --dry-run
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { basename, dirname, join, relative, resolve } from 'path';
import { getPullsDir, getVaultRoot } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';
const PREDICTION_CACHE_DIR = join(getVaultRoot(), 'scripts', '.cache', 'sports', 'predictions');
const ODDS_CACHE_DIR = join(getVaultRoot(), 'scripts', '.cache', 'sports', 'odds');
const DEFAULT_PAPER_BANKROLL = 1000;
const DEFAULT_PAPER_UNIT = 10;

const SPORT_PATHS = Object.freeze({
  baseball: Object.freeze({ path: 'baseball/mlb', label: 'MLB' }),
  basketball: Object.freeze({ path: 'basketball/nba', label: 'NBA' }),
  'ice-hockey': Object.freeze({ path: 'hockey/nhl', label: 'NHL' }),
});

const REQUIRED_COLUMNS = Object.freeze([
  'prediction_id',
  'event_id',
  'date',
  'sport',
  'league',
  'event',
  'market',
  'selection',
  'side',
  'odds_american',
  'odds_decimal',
  'implied_probability',
  'model_probability',
  'edge',
  'confidence_score',
  'status',
  'model_version',
  'stake',
  'variable_snapshot',
  'result',
  'closing_odds_decimal',
  'closing_odds_american',
  'closing_bookmaker',
  'closing_odds_captured_at',
  'closing_odds_source',
  'actual_home_score',
  'actual_away_score',
  'notes',
]);

export async function pull(flags = {}) {
  const ledgerPaths = resolveLedgerPaths(flags);
  const paper = resolvePaperTracker(flags);
  const results = [];

  for (const ledgerPath of ledgerPaths) {
    results.push(await settleLedger(ledgerPath, paper, flags));
  }

  if (flags.json) {
    console.log(JSON.stringify(results, null, 2));
  }

  return results.length === 1
    ? results[0]
    : { filePaths: results.map(result => result.notePath).filter(Boolean), results, signals: collectSignals(results) };
}

async function settleLedger(ledgerPath, paper, flags) {
  console.log(`Sports settle: ${relative(getVaultRoot(), ledgerPath)}`);

  const parsed = parseCsv(readFileSync(ledgerPath, 'utf8'));
  if (parsed.rows.length === 0) throw new Error(`No rows found in ${ledgerPath}`);

  warnOnMissingFactorContributions(parsed.rows, ledgerPath);

  const eventsBySport = await fetchEventsForLedger(parsed.rows);
  const closingLines = flags['capture-closing-lines'] ? loadClosingLineIndex(parsed.rows, flags) : null;
  const updates = parsed.rows.map(row => settleRow(row, eventsBySport, flags, closingLines));
  const summary = summarizeSettlement(updates, paper);
  const note = buildSettlementNote({ ledgerPath, updates, summary, paper });
  const notePath = join(getPullsDir(), 'Sports', dateStampedFilename(`Sports_Settlement_${sanitizeFilename(basename(ledgerPath, '.csv'))}`));

  if (flags['dry-run']) {
    console.log(`  [dry-run] Would update ledger: ${ledgerPath}`);
    console.log(`  [dry-run] Would write note: ${notePath}`);
    console.log(JSON.stringify(summary, null, 2));
    return { ledgerPath, notePath: null, summary, signals: summary.losses > summary.wins ? ['sports_settlement_negative_result'] : [] };
  }

  const outputRows = updates.map(update => update.row);
  writeFileSync(ledgerPath, toCsv(mergeHeaders(parsed.headers, REQUIRED_COLUMNS), outputRows), 'utf8');
  writeNote(notePath, note);
  console.log(`  Updated ledger: ${ledgerPath}`);
  console.log(`  Note: ${notePath}`);

  return { ledgerPath, notePath, summary, signals: summary.losses > summary.wins ? ['sports_settlement_negative_result'] : [] };
}

async function fetchEventsForLedger(rows) {
  const datesBySport = new Map();
  for (const row of rows) {
    const sport = String(row.sport || '').toLowerCase();
    const date = row.date;
    if (!SPORT_PATHS[sport] || !date) continue;
    const key = `${sport}:${date}`;
    if (!datesBySport.has(key)) datesBySport.set(key, { sport, date });
  }

  const eventsBySport = new Map();
  for (const item of datesBySport.values()) {
    const config = SPORT_PATHS[item.sport];
    const url = `${ESPN_BASE}/${config.path}/scoreboard?dates=${item.date.replaceAll('-', '')}&limit=500`;
    const data = await getJson(url);
    const events = Array.isArray(data.events) ? data.events.map(normalizeEvent) : [];
    eventsBySport.set(`${item.sport}:${item.date}`, events);
  }
  return eventsBySport;
}

function loadClosingLineIndex(rows, flags) {
  const paths = resolveClosingOddsFiles(rows, flags);
  const records = [];
  for (const filePath of paths) {
    try {
      const parsed = JSON.parse(readFileSync(filePath, 'utf8'));
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item && typeof item === 'object') {
          records.push({ ...item, __source: relative(getVaultRoot(), filePath) });
        }
      }
    } catch (error) {
      console.warn(`  warning: could not parse closing odds cache ${filePath}: ${error.message}`);
    }
  }
  console.log(`  Closing-line cache records loaded: ${records.length} from ${paths.length} file(s)`);
  return records;
}

function resolveClosingOddsFiles(rows, flags) {
  if (flags['closing-odds-cache']) {
    const explicit = resolve(getVaultRoot(), String(flags['closing-odds-cache']));
    if (!existsSync(explicit)) throw new Error(`Closing odds cache not found: ${explicit}`);
    if (statSync(explicit).isDirectory()) return jsonFilesInDirectory(explicit);
    return [explicit];
  }

  const dates = [...new Set(rows.map(row => row.date).filter(Boolean))];
  const files = [];
  for (const date of dates) {
    const dir = join(ODDS_CACHE_DIR, date);
    if (!existsSync(dir)) continue;
    files.push(...jsonFilesInDirectory(dir));
  }
  return files;
}

function jsonFilesInDirectory(dir) {
  return readdirSync(dir)
    .filter(name => name.toLowerCase().endsWith('.json'))
    .map(name => join(dir, name));
}

function findClosingLine(row, closingRecords, flags) {
  const snapshot = parseSnapshot(row.variable_snapshot);
  const home = snapshot.home_team || '';
  const away = snapshot.away_team || '';
  if (!home || !away) return null;

  const record = closingRecords.find(item =>
    normalizeText(item.home_team) === normalizeText(home)
    && normalizeText(item.away_team) === normalizeText(away)
  );
  if (!record) return null;

  const marketRows = Array.isArray(record.home_away_market)
    ? record.home_away_market
    : Array.isArray(record[row.market])
      ? record[row.market]
      : [];
  if (marketRows.length === 0) return null;

  const sideKey = row.side === 'home' ? '1' : row.side === 'away' ? '2' : '';
  if (!sideKey) return null;

  const candidates = marketRows
    .map(price => ({
      bookmaker: price.bookmaker_name || price.bookmaker || '',
      american: formatAmericanString(price[sideKey]),
      decimal: americanToDecimal(parseAmericanOdds(price[sideKey])),
      scrapedDate: record.scraped_date || '',
      matchDate: record.match_date || '',
      source: record.__source || '',
    }))
    .filter(candidate => Number.isFinite(candidate.decimal));

  if (candidates.length === 0) return null;

  const mode = String(flags['closing-line-mode'] || 'selected').toLowerCase();
  const selectedBookmaker = snapshot.selected_bookmaker || row.selected_bookmaker || '';
  if (mode === 'selected' && selectedBookmaker) {
    const selected = candidates.find(candidate => normalizeText(candidate.bookmaker) === normalizeText(selectedBookmaker));
    if (selected) return selected;
  }

  if (mode === 'average') {
    const avgImplied = average(candidates, candidate => 1 / candidate.decimal);
    return {
      ...candidates[0],
      bookmaker: 'market-average',
      american: '',
      decimal: 1 / avgImplied,
    };
  }

  return candidates.reduce((best, candidate) => candidate.decimal > best.decimal ? candidate : best, candidates[0]);
}

function normalizeEvent(event) {
  const competition = event.competitions?.[0] ?? {};
  const competitors = Array.isArray(competition.competitors) ? competition.competitors : [];
  const home = competitors.find(c => c.homeAway === 'home') ?? competitors[0] ?? null;
  const away = competitors.find(c => c.homeAway === 'away') ?? competitors.find(c => c !== home) ?? null;
  return {
    id: String(event.id ?? competition.id ?? ''),
    name: event.shortName || event.name || '',
    state: event.status?.type?.state || competition.status?.type?.state || '',
    detail: event.status?.type?.shortDetail || event.status?.type?.detail || '',
    home: normalizeCompetitor(home),
    away: normalizeCompetitor(away),
  };
}

function normalizeCompetitor(competitor) {
  return {
    name: competitor?.team?.displayName || competitor?.displayName || 'Unknown',
    abbreviation: competitor?.team?.abbreviation || '',
    score: parseScore(competitor?.score),
    firstFiveScore: sumLinescore(competitor?.linescores, 5),
  };
}

export function settleRow(row, eventsBySport, flags, closingLines = null) {
  const originalResult = normalizeResult(row.result || 'pending');
  const key = `${String(row.sport || '').toLowerCase()}:${row.date}`;
  const events = eventsBySport.get(key) ?? [];
  const event = findEvent(row, events);
  const next = { ...row };
  const messages = [];

  const closingLine = closingLines ? findClosingLine(row, closingLines, flags) : null;
  let closingLineChanged = false;
  if (closingLine && (!next.closing_odds_decimal || flags['force-closing-lines'])) {
    next.closing_odds_decimal = formatDecimal(closingLine.decimal);
    next.closing_odds_american = closingLine.american;
    next.closing_bookmaker = closingLine.bookmaker;
    next.closing_odds_captured_at = closingLine.scrapedDate;
    next.closing_odds_source = closingLine.source;
    closingLineChanged = true;
    messages.push(`Closing line captured: ${closingLine.bookmaker} ${closingLine.american || formatDecimal(closingLine.decimal)}`);
  } else if (closingLines && !closingLine) {
    messages.push('No closing-line match in local odds cache');
  } else if (closingLine && next.closing_odds_decimal) {
    messages.push('Closing line already present; pass --force-closing-lines to overwrite');
  }

  if (!event) {
    messages.push('No ESPN event match for settlement');
    return { row: next, event: null, previousResult: originalResult, changed: closingLineChanged, settlementStatus: 'unmatched', messages };
  }

  next.event_id = next.event_id || event.id;
  const scoreScope = scoreScopeForRow(row);
  const homeScore = scoreScope === 'first_5_innings' ? event.home.firstFiveScore : event.home.score;
  const awayScore = scoreScope === 'first_5_innings' ? event.away.firstFiveScore : event.away.score;

  next.actual_home_score = homeScore === null ? '' : String(homeScore);
  next.actual_away_score = awayScore === null ? '' : String(awayScore);

  if (originalResult !== 'pending' && !flags.force) {
    messages.push(`Already settled as ${originalResult}; pass --force to recompute`);
    return { row: next, event, previousResult: originalResult, changed: closingLineChanged, settlementStatus: 'already_settled', messages };
  }

  if (event.state !== 'post' || homeScore === null || awayScore === null) {
    next.result = 'pending';
    next.status = 'pending';
    messages.push(scoreScope === 'first_5_innings' ? 'First-five linescore not final/available' : (event.detail || 'Event not final'));
    return { row: next, event, previousResult: originalResult, changed: originalResult !== 'pending' || closingLineChanged, settlementStatus: 'pending', messages };
  }

  const result = resultForSide(row.side, homeScore, awayScore);
  next.result = result;
  next.status = 'settled';
  messages.push(`${scoreScope === 'first_5_innings' ? 'First 5' : 'Final'}: ${event.away.name} ${awayScore}, ${event.home.name} ${homeScore}`);

  return {
    row: next,
    event,
    previousResult: originalResult,
    changed: originalResult !== result || row.actual_home_score !== next.actual_home_score || row.actual_away_score !== next.actual_away_score || closingLineChanged,
    settlementStatus: result,
    messages,
  };
}

function findEvent(row, events) {
  const eventId = String(row.event_id || '').trim();
  if (eventId) {
    const byId = events.find(event => event.id === eventId);
    if (byId) return byId;
  }

  const target = normalizeText(row.event);
  return events.find(event => normalizeText(event.name) === target) ?? null;
}

function resultForSide(side, homeScore, awayScore) {
  if (homeScore === awayScore) return 'push';
  const homeWon = homeScore > awayScore;
  if (side === 'home') return homeWon ? 'win' : 'loss';
  if (side === 'away') return homeWon ? 'loss' : 'win';
  return 'pending';
}

function summarizeSettlement(updates, paper) {
  const rows = updates.map(update => update.row);
  const settled = rows.filter(row => normalizeResult(row.result) !== 'pending');
  const pending = rows.length - settled.length;
  const wins = settled.filter(row => normalizeResult(row.result) === 'win').length;
  const losses = settled.filter(row => normalizeResult(row.result) === 'loss').length;
  const pushes = settled.filter(row => normalizeResult(row.result) === 'push').length;
  const totalStake = sum(settled, row => parseNumber(row.stake, 1));
  const totalPnl = sum(settled, row => pnlForRow(row));
  const paperPnl = totalPnl * paper.unit;

  return {
    rows: rows.length,
    changed: updates.filter(update => update.changed).length,
    settled: settled.length,
    pending,
    wins,
    losses,
    pushes,
    unmatched: updates.filter(update => update.settlementStatus === 'unmatched').length,
    alreadySettled: updates.filter(update => update.settlementStatus === 'already_settled').length,
    totalStake,
    totalPnl,
    roi: totalStake ? (totalPnl / totalStake) * 100 : 0,
    paperBankroll: paper.bankroll,
    paperUnit: paper.unit,
    paperStake: totalStake * paper.unit,
    paperPnl,
    paperEndingBankroll: paper.bankroll + paperPnl,
    paperBankrollReturn: paper.bankroll ? (paperPnl / paper.bankroll) * 100 : 0,
  };
}

function buildSettlementNote({ ledgerPath, updates, summary, paper }) {
  const rows = updates.map(update => [
    update.row.date,
    update.row.event,
    update.row.selection,
    update.row.side || '',
    update.row.odds_american || update.row.odds_decimal || '',
    update.row.closing_odds_american || update.row.closing_odds_decimal || '',
    update.row.closing_bookmaker || '',
    update.row.result || 'pending',
    scoreText(update),
    update.messages.join('; '),
  ]);

  return buildNote({
    frontmatter: {
      title: `Sports Settlement - ${basename(ledgerPath)}`,
      source: 'ESPN public scoreboard API',
      date_pulled: today(),
      domain: 'sports',
      data_type: 'sports_settlement',
      frequency: 'on-demand',
      signal_status: summary.losses > summary.wins ? 'watch' : 'clear',
      signals: summary.losses > summary.wins ? ['sports_settlement_negative_result'] : [],
      row_count: summary.rows,
      changed_count: summary.changed,
      settled_count: summary.settled,
      pending_count: summary.pending,
      wins: summary.wins,
      losses: summary.losses,
      pushes: summary.pushes,
      roi: round(summary.roi, 4),
      tags: ['sports', 'settlement', 'paper-bankroll'],
    },
    sections: [
      {
        heading: 'Executive Summary',
        content: [
          `Ledger: ${relative(getVaultRoot(), ledgerPath)}`,
          `Rows: ${summary.rows}`,
          `Changed: ${summary.changed}`,
          `Settled: ${summary.settled}`,
          `Pending: ${summary.pending}`,
          `Wins/Losses/Pushes: ${summary.wins}/${summary.losses}/${summary.pushes}`,
          `Unit P/L: ${formatNumber(summary.totalPnl)} on ${formatNumber(summary.totalStake)} units staked`,
          `Unit ROI: ${formatPercent(summary.roi)}`,
          '',
          `Paper bankroll: ${formatPaper(summary.paperBankroll)} starting`,
          `Paper unit: ${formatPaper(paper.unit)} per ledger stake unit`,
          `Paper stake settled: ${formatPaper(summary.paperStake)}`,
          `Paper P/L: ${formatPaper(summary.paperPnl)}`,
          `Paper ending bankroll: ${formatPaper(summary.paperEndingBankroll)} (${formatPercent(summary.paperBankrollReturn)} on bankroll)`,
        ].join('\n'),
      },
      {
        heading: 'Settlement Rows',
        content: buildTable(['Date', 'Event', 'Selection', 'Side', 'Open Odds', 'Closing Odds', 'Closing Book', 'Result', 'Score', 'Notes'], rows),
      },
      {
        heading: 'Paper Money Guardrail',
        content: [
          'This tracker uses fake money only. `stake` is interpreted as a paper unit count.',
          'Use `--paper-bankroll <amount>` and `--paper-unit <amount>` to change reporting scale without changing prediction logic.',
          'Settlement updates only pending rows unless `--force` is passed.',
        ].join('\n'),
      },
    ],
  });
}

function scoreText(update) {
  if (!update.event) return 'N/A';
  const home = update.row.actual_home_score || '';
  const away = update.row.actual_away_score || '';
  if (home === '' || away === '') return 'Pending';
  const scope = scoreScopeForRow(update.row) === 'first_5_innings' ? 'F5 ' : '';
  return `${scope}${update.event.away.abbreviation || update.event.away.name} ${away} @ ${update.event.home.abbreviation || update.event.home.name} ${home}`;
}

function resolveLedgerPaths(flags) {
  if (flags.ledger) return [resolveLedgerPath(String(flags.ledger), flags)];
  const dates = resolveDates(flags);
  return dates.map(date => {
    const path = join(PREDICTION_CACHE_DIR, `${date}_predictions.csv`);
    if (!existsSync(path)) throw new Error(`Prediction ledger not found: ${path}`);
    return path;
  });
}

function resolveLedgerPath(value, flags) {
  const resolved = resolve(getVaultRoot(), value);
  if (!resolved.startsWith(getVaultRoot()) && !flags['allow-outside-vault']) {
    throw new Error('Ledger path must be inside the vault unless --allow-outside-vault is set.');
  }
  if (!existsSync(resolved)) throw new Error(`Ledger not found: ${resolved}`);
  return resolved;
}

function resolveDates(flags) {
  if (flags.date) return [validateDate(String(flags.date))];
  const from = flags.from ? validateDate(String(flags.from)) : today();
  if (flags.to) return dateRange(from, validateDate(String(flags.to)));
  const days = flags.days ? parseInt(String(flags.days), 10) : 1;
  if (!Number.isInteger(days) || days < 1 || days > 14) throw new Error('--days must be an integer from 1 to 14');
  const dates = [];
  let cursor = parseDate(from);
  for (let i = 0; i < days; i++) {
    dates.push(formatDate(cursor));
    cursor = addDays(cursor, 1);
  }
  return dates;
}

function resolvePaperTracker(flags) {
  return {
    bankroll: parsePositiveNumber(flags['paper-bankroll'], DEFAULT_PAPER_BANKROLL, '--paper-bankroll'),
    unit: parsePositiveNumber(flags['paper-unit'], DEFAULT_PAPER_UNIT, '--paper-unit'),
  };
}

export function parseCsv(raw) {
  const records = parseCsvRecords(raw);
  if (records.length === 0) return { headers: [], rows: [] };
  const headers = records[0].map(header => header.trim());
  const rows = records.slice(1)
    .filter(record => !record.every(cell => cell.trim() === ''))
    .map(record => {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = record[index] ?? '';
      });
      return row;
    });
  return { headers, rows };
}

function parseCsvRecords(raw) {
  const records = [];
  let record = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    const next = raw[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      record.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      record.push(field);
      records.push(record);
      record = [];
      field = '';
      continue;
    }

    field += char;
  }

  if (field.length > 0 || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  return records;
}

export function toCsv(headers, rows) {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map(header => csvCell(row[header] ?? '')).join(','));
  }
  return `${lines.join('\n')}\n`;
}

function csvCell(value) {
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function mergeHeaders(headers, required) {
  const result = [...headers];
  for (const header of required) {
    if (!result.includes(header)) result.push(header);
  }
  return result;
}

function pnlForRow(row) {
  const result = normalizeResult(row.result);
  const stake = parseNumber(row.stake, 1);
  const odds = parseNumber(row.odds_decimal, null);
  if (result === 'win' && odds) return stake * (odds - 1);
  if (result === 'loss') return -stake;
  return 0;
}

function parseScore(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sumLinescore(linescores, count) {
  if (!Array.isArray(linescores) || linescores.length < count) return null;
  const values = linescores.slice(0, count).map(item => parseScore(item.value ?? item.displayValue));
  if (values.some(value => value === null)) return null;
  return values.reduce((sum, value) => sum + value, 0);
}

function scoreScopeForRow(row) {
  if (String(row.market || '').includes('1st_half')) return 'first_5_innings';
  try {
    const snapshot = JSON.parse(row.variable_snapshot || '{}');
    if (snapshot.scoring_window === 'first_5_innings') return 'first_5_innings';
  } catch {
    // Keep full-game fallback.
  }
  return 'full_game';
}

/**
 * Multi-factor-v1 rows are expected to carry factor_contributions_top5 in their
 * variable_snapshot so downstream calibration can attribute edge to factors.
 * Older pre-Phase-3 ledgers (no factor_key) are tolerated silently.
 */
export function warnOnMissingFactorContributions(rows, ledgerPath = '') {
  let missing = 0;
  for (const row of rows) {
    if (row.model_version !== 'multi-factor-v1') continue;
    let snapshot = null;
    try { snapshot = JSON.parse(row.variable_snapshot || '{}'); } catch { snapshot = null; }
    if (!snapshot) continue;
    if (!Array.isArray(snapshot.factor_contributions_top5)) missing += 1;
  }
  if (missing > 0) {
    const where = ledgerPath ? ` in ${ledgerPath}` : '';
    console.warn(`  warning: ${missing} multi-factor-v1 row(s)${where} missing variable_snapshot.factor_contributions_top5; calibration may skip these rows.`);
  }
  return missing;
}

function normalizeResult(value) {
  const normalized = String(value || 'pending').trim().toLowerCase();
  if (['w', 'won', 'win', '1', 'true'].includes(normalized)) return 'win';
  if (['l', 'lost', 'loss', '0', 'false'].includes(normalized)) return 'loss';
  if (['p', 'push', 'void', 'refund'].includes(normalized)) return 'push';
  if (['pending', 'open', ''].includes(normalized)) return 'pending';
  return normalized;
}

function parseNumber(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseSnapshot(value) {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function parseAmericanOdds(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(String(value).replace('+', '').trim());
  if (!Number.isFinite(parsed) || parsed === 0) return null;
  return parsed;
}

function americanToDecimal(american) {
  if (!Number.isFinite(american) || american === 0) return null;
  return american > 0 ? 1 + (american / 100) : 1 + (100 / Math.abs(american));
}

function formatAmericanString(value) {
  const parsed = parseAmericanOdds(value);
  if (!Number.isFinite(parsed)) return '';
  return parsed > 0 ? `+${parsed}` : String(parsed);
}

function formatDecimal(value) {
  if (!Number.isFinite(value)) return '';
  return String(Math.round(value * 10_000) / 10_000);
}

function parsePositiveNumber(value, fallback, label) {
  if (value === undefined || value === null || value === true) return fallback;
  const parsed = Number(String(value));
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`${label} must be a positive number`);
  return parsed;
}

function sum(rows, fn) {
  return rows.reduce((total, row) => total + fn(row), 0);
}

function average(rows, fn) {
  return rows.length ? sum(rows, fn) / rows.length : null;
}

function collectSignals(results) {
  return results.flatMap(result => result.signals ?? []);
}

function validateDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`Invalid date "${value}". Use YYYY-MM-DD.`);
  const parsed = parseDate(value);
  if (formatDate(parsed) !== value) throw new Error(`Invalid date "${value}". Use a real calendar date.`);
  return value;
}

function dateRange(from, to) {
  const start = parseDate(from);
  const end = parseDate(to);
  if (end < start) throw new Error('--to must be on or after --from');
  const dates = [];
  let cursor = start;
  while (cursor <= end) {
    dates.push(formatDate(cursor));
    cursor = addDays(cursor, 1);
    if (dates.length > 14) throw new Error('Date ranges are capped at 14 days');
  }
  return dates;
}

function parseDate(value) {
  return new Date(`${value}T00:00:00Z`);
}

function addDays(date, days) {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  return value.toFixed(2);
}

function formatPaper(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  return `$${value.toFixed(2)} paper`;
}

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  return `${value.toFixed(2)}%`;
}

function round(value, decimals) {
  if (!Number.isFinite(value)) return value;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function sanitizeFilename(value) {
  return String(value)
    .replace(/[<>:"/\\|?*]+/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}
