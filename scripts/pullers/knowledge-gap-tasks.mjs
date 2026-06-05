/**
 * knowledge-gap-tasks.mjs - Generate knowledge-gap candidates from My_Data
 * report evidence (market cycle status, freshness sources, research content
 * candidates) and print a concise chat-review summary.
 *
 * Flags:
 *   --dry-run        Print candidate examples; no vault writes are performed
 *   --no-inbox       Compatibility no-op; no Inbox write is configured
 *   --max-cycles N   Cap cycle tasks (default: all gap/degraded/stale/partial)
 *   --max-fresh N    Cap freshness tasks (default: 20)
 *   --max-cand N     Cap content candidate tasks (default: 16)
 *   --max-alert N    Cap alert-ticker tasks (default: 10)
 *   --max-conv N     Cap conviction-research tasks (default: 8)
 */

import { existsSync, statSync } from 'fs';
import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getReviewVaultRoot } from '../lib/config.mjs';
import { parseFrontmatter } from '../lib/frontmatter.mjs';

// Engine vault root (My_Data) â€” two levels up from scripts/pullers/
const ENGINE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const SEVERITY_ORDER = { critical: 1, alert: 2 };

const FRESHNESS_DAYS = {
  '15min': 1,
  hourly: 1,
  daily: 2,
  weekly: 10,
  monthly: 40,
  quarterly: 110,
  'on-demand': 14,
};

function freshnessStatus(datePulled, cadence) {
  if (!datePulled) return 'Never';
  const date = new Date(datePulled);
  if (Number.isNaN(date.getTime())) return 'Never';
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  const allowed = FRESHNESS_DAYS[cadence] ?? 999;
  if (days <= allowed) return 'Fresh';
  if (days <= allowed * 2) return 'Aging';
  return 'Stale';
}

async function listMd(dir, recursive = false) {
  if (!existsSync(dir)) return [];
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (recursive) out.push(...(await listMd(p, true)));
    } else if (e.isFile() && e.name.endsWith('.md')) {
      out.push(p);
    }
  }
  return out;
}

async function readFm(path) {
  const text = await readFile(path, 'utf-8');
  const { data } = parseFrontmatter(text);
  return data || {};
}

function safe(v) {
  return String(v ?? '').replace(/[\r\n|]/g, ' ').trim();
}

async function gatherCycleTasks(reviewRoot, max) {
  const dir = join(reviewRoot, 'Reports', 'Freshness', 'Market_Cycles');
  const files = await listMd(dir);
  const tasks = [];
  for (const f of files) {
    const fm = await readFm(f);
    if (fm.type !== 'market_cycle_status') continue;
    const coverage = String(fm.coverage_status ?? '').toLowerCase();
    if (!['gap', 'degraded', 'stale', 'partial'].includes(coverage)) continue;
    const layer = safe(fm.cycle_layer) || '<unknown layer>';
    const state = safe(fm.cycle_state) || 'â€”';
    const transition = safe(fm.transition) || 'â€”';
    const missing = safe(fm.missing_inputs) || 'â€”';
    const url = String(fm.obsidian_url ?? '');
    const src = url ? ` ([source](${url}))` : '';
    tasks.push(
      `- [ ] [knowledge-gap/cycle] ${layer} coverage **${coverage}** (state: ${state}, transition: ${transition}) â€” missing: ${missing}${src}`
    );
  }
  tasks.sort();
  return max ? tasks.slice(0, max) : tasks;
}

async function gatherFreshnessTasks(reviewRoot, max) {
  const dir = join(reviewRoot, 'Reports', 'Freshness', 'Sources');
  const files = await listMd(dir);
  const rows = [];
  for (const f of files) {
    const fm = await readFm(f);
    if (fm.type !== 'freshness_item') continue;
    const status = freshnessStatus(fm.date_pulled, fm.cadence);
    if (!['Aging', 'Stale', 'Never'].includes(status)) continue;
    rows.push({
      status,
      domain: safe(fm.domain),
      source: safe(fm.source) || '<unnamed>',
      data_type: safe(fm.data_type) || 'â€”',
      cadence: safe(fm.cadence) || 'unknown',
      datePulled: safe(fm.date_pulled) || 'â€”',
    });
  }
  const order = { Stale: 0, Never: 1, Aging: 2 };
  rows.sort((a, b) =>
    (order[a.status] ?? 9) - (order[b.status] ?? 9)
    || a.domain.localeCompare(b.domain)
    || a.source.localeCompare(b.source)
  );
  const limited = rows.slice(0, max ?? 20);
  return limited.map(r =>
    `- [ ] [knowledge-gap/freshness/${r.status.toLowerCase()}] Refresh **${r.source}** (${r.domain} / ${r.data_type}, cadence: ${r.cadence}) â€” last pulled: ${r.datePulled}`
  );
}

async function gatherCandidateTasks(reviewRoot, max) {
  const dir = join(reviewRoot, '_Inbox', '90_Ready_to_Route', 'Content_Candidates');
  const files = await listMd(dir, true);
  const candidates = [];
  for (const f of files) {
    const fm = await readFm(f);
    if (fm.type !== 'research_content_candidate') continue;
    candidates.push({ mtime: statSync(f).mtimeMs, fm });
  }
  candidates.sort((a, b) => b.mtime - a.mtime);
  const limited = candidates.slice(0, max ?? 16);
  return limited.map(({ fm }) => {
    const title = safe(fm.title) || '<untitled>';
    const topic = safe(fm.topic) || 'â€”';
    const type = safe(fm.content_type) || 'â€”';
    const source = safe(fm.source) || 'â€”';
    const url = String(fm.url ?? '');
    const link = url ? ` ([open](${url}))` : '';
    return `- [ ] [knowledge-gap/candidate] Review **${title}** (${topic} / ${type}) â€” ${source}${link}`;
  });
}

// Biotech/pharma sectors that warrant automatic PubMed/arXiv research refresh
const BIOTECH_SECTORS = new Set([
  'alzheimers', 'alzheimer', 'glp1', 'glp-1', 'antimicrobial', 'psychedelic',
  'biotech', 'biopharma', 'pharma', 'oncology', 'immunology', 'gene-therapy',
  'genetherapy', 'raredisease', 'rare-disease', 'neurology', 'cardiology',
]);

/**
 * Gather PubMed/arXiv refresh tasks for biotech/pharma conviction viewpoints.
 * Reads the most recent opportunity_viewpoints file from {engineRoot}/05_Data_Pulls/Theses/,
 * parses viewpoint sections, and emits one task per unique biotech/pharma sector found.
 * @param {string} engineRoot â€” My_Data vault root
 * @param {number|null} max â€” cap on returned tasks (null = all)
 * @returns {Promise<string[]>}
 */
export async function gatherConvictionTasks(engineRoot, max) {
  const dir = join(engineRoot, '05_Data_Pulls', 'Theses');
  const files = await listMd(dir);
  if (files.length === 0) return [];

  // Most-recent file: sort by mtime descending, break ties by filename descending
  // (files are date-prefixed YYYY-MM-DD so lexicographic order = chronological order)
  const sorted = files
    .map(f => ({ path: f, mtime: statSync(f).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime || b.path.localeCompare(a.path));
  const latest = sorted[0].path;

  const text = await readFile(latest, 'utf-8');
  const seenSectors = new Set();
  const tasks = [];

  // Split on '### ' section headers; first chunk is preamble
  const sections = text.split(/^### /m).slice(1);
  for (const section of sections) {
    // Extract "Thesis / Sector" line: **Thesis / Sector**: {thesis} / {sector}
    const match = section.match(/\*\*Thesis\s*\/\s*Sector\*\*\s*:\s*([^\n/]+?)\s*\/\s*([^\n]+)/i);
    if (!match) continue;
    const thesis = match[1].trim().toLowerCase();
    const sector = match[2].trim().toLowerCase();

    const key = BIOTECH_SECTORS.has(sector) ? sector : BIOTECH_SECTORS.has(thesis) ? thesis : null;
    if (!key || seenSectors.has(key)) continue;
    seenSectors.add(key);

    tasks.push(
      `- [ ] [knowledge-gap/conviction-research/${key}] Refresh PubMed/arXiv for **${key}** â€” viewpoint active, research cadence may lag`
    );
  }

  tasks.sort();
  return max ? tasks.slice(0, max) : tasks;
}

/**
 * Gather refresh tasks for tickers whose signal_status is 'alert' or 'critical'.
 * Reads markdown files from {engineRoot}/05_Data_Pulls/Market/ â€” one task per
 * unique symbol, keeping the highest severity when duplicates exist.
 * @param {string} engineRoot â€” My_Data vault root
 * @param {number|null} max â€” cap on returned tasks (null = all)
 * @returns {Promise<string[]>}
 */
export async function gatherAlertTickerTasks(engineRoot, max) {
  const dir = join(engineRoot, '05_Data_Pulls', 'Market');
  const files = await listMd(dir);
  const bySymbol = new Map();

  for (const f of files) {
    const fm = await readFm(f);
    const status = String(fm.signal_status ?? '').toLowerCase();
    if (status !== 'alert' && status !== 'critical') continue;
    const symbol = safe(fm.symbol).toUpperCase();
    if (!symbol) continue;
    const existing = bySymbol.get(symbol);
    // Lower SEVERITY_ORDER number = higher severity; critical (1) beats alert (2)
    if (!existing || (SEVERITY_ORDER[status] ?? 9) < (SEVERITY_ORDER[existing.severity] ?? 9)) {
      bySymbol.set(symbol, { symbol, severity: status });
    }
  }

  const rows = [...bySymbol.values()];
  rows.sort(
    (a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9) ||
      a.symbol.localeCompare(b.symbol)
  );
  const limited = max ? rows.slice(0, max) : rows;
  return limited.map(
    ({ symbol, severity }) =>
      `- [ ] [knowledge-gap/alert-ticker/${severity}] Refresh **${symbol}** data sources â€” signal fired ${severity}`
  );
}

export async function pull(flags = {}) {
  const dryRun = !!(flags['dry-run'] || flags.dryRun);
  const skipInbox = !!(flags['no-inbox'] || flags.noInbox);
  const maxCycles = Number(flags['max-cycles'] ?? flags.maxCycles ?? 0) || null;
  const maxFresh = Number(flags['max-fresh'] ?? flags.maxFresh ?? 20) || null;
  const maxCand = Number(flags['max-cand'] ?? flags.maxCand ?? 16) || null;
  const maxAlert = Number(flags['max-alert'] ?? flags.maxAlert ?? 10) || null;
  const maxConv = Number(flags['max-conv'] ?? flags.maxConv ?? 8) || null;

  const reviewRoot = getReviewVaultRoot();

  const [cycleTasks, freshTasks, candTasks, alertTasks, convTasks] = await Promise.all([
    gatherCycleTasks(reviewRoot, maxCycles),
    gatherFreshnessTasks(reviewRoot, maxFresh),
    gatherCandidateTasks(reviewRoot, maxCand),
    gatherAlertTickerTasks(ENGINE_ROOT, maxAlert),
    gatherConvictionTasks(ENGINE_ROOT, maxConv),
  ]);

  const tasks = [...cycleTasks, ...freshTasks, ...candTasks, ...alertTasks, ...convTasks];
  console.log(
    `knowledge-gap-tasks: cycle=${cycleTasks.length} freshness=${freshTasks.length} candidates=${candTasks.length} alert-tickers=${alertTasks.length} conviction=${convTasks.length} total=${tasks.length}`
  );

  if (skipInbox) {
    console.log('--no-inbox: knowledge-gap candidates do not write generated Inbox tasks.');
  }

  if (dryRun || tasks.length) {
    const prefix = dryRun ? '[dry-run] ' : '';
    console.log(`${prefix}knowledge-gap-tasks: chat-review candidates only; no vault write is performed.`);
    for (const t of tasks.slice(0, 5)) console.log(t);
    if (tasks.length > 5) console.log(`... (${tasks.length - 5} more)`);
  }

  return { source: 'knowledge-gap-tasks', dryRun, tasks: tasks.length, wrote: false };
}

