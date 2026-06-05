/**
 * update-world-machine-indicators.mjs
 *
 * Reads the latest FRED/Vol pull files from My_Data and updates frontmatter
 * fields (current_value, trend, last_updated) in My_Data indicator notes.
 *
 * Compatibility alias: prefer `node run.mjs pull update-my-data-indicators`.
 *
 * Usage:
 *   node run.mjs pull update-world-machine-indicators
 *   node run.mjs pull update-world-machine-indicators --dry-run
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const MY_DATA_ROOT = join(HERE, '..', '..');
const INDICATORS_DIR = join(MY_DATA_ROOT, '09_Macro', 'Indicators');
const REGIMES_DIR = join(MY_DATA_ROOT, '09_Macro', 'Regimes');
const MACRO_PULLS_DIR = join(MY_DATA_ROOT, '05_Data_Pulls', 'Macro');
const VOL_PULLS_DIR = join(MY_DATA_ROOT, '05_Data_Pulls', 'Vol');

// ── Helpers ───────────────────────────────────────────────────────────────────

/** "2026-05-13" → "May 2026" */
function fmtDate(iso) {
  if (!iso) return '';
  const [year, month] = iso.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

/** Return path of most recent file matching pattern (YYYY-MM-DD prefix sorts correctly). */
function findLatestPull(dir, pattern) {
  try {
    const files = readdirSync(dir)
      .filter(f => f.match(pattern))
      .sort()
      .reverse();
    return files.length ? join(dir, files[0]) : null;
  } catch {
    return null;
  }
}

/** Parse the summary markdown table row by row. Returns Map<series, {latestDate, latestValue, priorValue, change}>. */
function parseFredTable(text) {
  const results = new Map();
  const lines = text.split('\n');
  // Find the first summary table header (Series | Name | Latest Date | Latest Value | ...)
  let inTable = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) { inTable = false; continue; }
    // Detect header row
    if (trimmed.includes('Series') && trimmed.includes('Latest Date')) { inTable = true; continue; }
    // Skip separator row
    if (trimmed.match(/^\|[\s\-|]+\|$/)) continue;
    if (!inTable) continue;
    const cols = trimmed.split('|').map(c => c.trim()).filter((_, i, a) => i > 0 && i < a.length - 1);
    if (cols.length < 6) continue;
    const [series, , latestDate, latestValueRaw, priorValueRaw, changeRaw] = cols;
    if (!series || series === 'Series') continue;
    const latestValue = parseFloat(latestValueRaw);
    const priorValue = parseFloat(priorValueRaw);
    const change = parseFloat(changeRaw);
    results.set(series, { latestDate, latestValue, priorValue, change: isNaN(change) ? latestValue - priorValue : change });
  }
  return results;
}

/** Parse the Vol Indices table from a yfinance vol pull. Returns Map<ticker, {close, change, pctChange, last}>. */
function parseVolTable(text) {
  const results = new Map();
  const lines = text.split('\n');
  let inTable = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) { inTable = false; continue; }
    if (trimmed.includes('Index') && trimmed.includes('Ticker') && trimmed.includes('Close')) { inTable = true; continue; }
    if (trimmed.match(/^\|[\s\-|]+\|$/)) continue;
    if (!inTable) continue;
    const cols = trimmed.split('|').map(c => c.trim()).filter((_, i, a) => i > 0 && i < a.length - 1);
    // cols: Index | Ticker | Close | Change | % Change | High / Low | Last
    if (cols.length < 6) continue;
    const [index, ticker, closeRaw, changeRaw, pctChangeRaw, , lastRaw] = cols;
    if (!ticker || ticker === 'Ticker') continue;
    results.set(ticker.replace('^', ''), { index, close: parseFloat(closeRaw), change: parseFloat(changeRaw), pctChange: pctChangeRaw, last: lastRaw });
  }
  return results;
}

function hasFiniteFredRow(row) {
  return Boolean(
    row &&
    row.latestDate &&
    Number.isFinite(row.latestValue) &&
    Number.isFinite(row.priorValue)
  );
}

/** Trend from numeric change (for most series). */
function numericTrend(change) {
  if (isNaN(change)) return 'Stable';
  if (change > 0.05) return 'Rising';
  if (change < -0.05) return 'Falling';
  return 'Stable';
}

/** Trend for yield curve spread. */
function spreadTrend(change) {
  if (isNaN(change)) return 'Flat';
  if (change > 0.02) return 'Steepening';
  if (change < -0.02) return 'Flattening';
  return 'Flat';
}

/** VIX trend by level. */
function vixTrend(close) {
  if (isNaN(close)) return 'Unknown';
  if (close >= 30) return 'Elevated — panic zone';
  if (close >= 20) return 'Rising — elevated fear';
  if (close >= 15) return 'Normal range';
  return 'Low — complacency';
}

/**
 * Replace or insert a frontmatter field between the first two `---` delimiters.
 * Returns new text (no mutation of input).
 */
function updateFrontmatterField(text, key, value) {
  const lines = text.split('\n');
  const fmStart = lines.indexOf('---');
  if (fmStart === -1) return text;
  const fmEnd = lines.indexOf('---', fmStart + 1);
  if (fmEnd === -1) return text;

  const newLines = [...lines];
  const pattern = new RegExp(`^${key}:`);
  let found = false;
  for (let i = fmStart + 1; i < fmEnd; i++) {
    if (pattern.test(newLines[i])) {
      newLines[i] = `${key}: ${value}`;
      found = true;
      break;
    }
  }
  if (!found) {
    // Insert before closing ---
    newLines.splice(fmEnd, 0, `${key}: ${value}`);
  }
  return newLines.join('\n');
}

/** Read, apply field updates, write only if changed. Returns 'updated' | 'skipped' | 'error'. */
function applyUpdates(filePath, updates, dryRun) {
  let text;
  try {
    text = readFileSync(filePath, 'utf-8');
  } catch {
    return 'missing';
  }
  let next = text;
  for (const [key, value] of Object.entries(updates)) {
    next = updateFrontmatterField(next, key, value);
  }
  if (next === text) return 'skipped';
  if (!dryRun) writeFileSync(filePath, next, 'utf-8');
  return 'updated';
}

// ── Series map ────────────────────────────────────────────────────────────────

const SERIES_MAP = [
  // Interest Rates pull
  { series: 'DFF',      pullGroup: 'Interest_Rates', file: 'Fed Funds Rate.md',    formatValue: (v, d) => `${v}% (${fmtDate(d)})`,                         trendFn: numericTrend },
  { series: 'T10Y2Y',   pullGroup: 'Interest_Rates', file: 'Yield Curve.md',       formatValue: (v, d) => `${v}% 10Y-2Y spread (${fmtDate(d)})`,           trendFn: spreadTrend },
  { series: 'DGS10',    pullGroup: 'Interest_Rates', file: '10Y Treasury.md',      formatValue: (v, d) => `${v}% (${fmtDate(d)})`,                         trendFn: numericTrend },
  // Inflation pull
  { series: 'CPIAUCSL', pullGroup: 'Inflation',      file: 'CPI.md',               formatValue: (v, d) => `${v} index (${fmtDate(d)})`,                   trendFn: numericTrend },
  { series: 'PCEPILFE', pullGroup: 'Inflation',      file: 'Core PCE.md',          formatValue: (v, d) => `${v} index (${fmtDate(d)})`,                   trendFn: numericTrend },
  { series: 'PPIACO',   pullGroup: 'Inflation',      file: 'PPI.md',               formatValue: (v, d) => `${v} index (${fmtDate(d)})`,                   trendFn: numericTrend },
  // Labor Market pull
  { series: 'UNRATE',   pullGroup: 'Labor_Market',   file: 'Unemployment Rate.md', formatValue: (v, d) => `${v}% (${fmtDate(d)})`,                         trendFn: numericTrend },
  { series: 'PAYEMS',   pullGroup: 'Labor_Market',   file: 'NFP.md',               formatValue: (v, d) => `${(v / 1000).toFixed(0)}K payrolls (${fmtDate(d)})`, trendFn: numericTrend },
  { series: 'ICSA',     pullGroup: 'Labor_Market',   file: 'Initial Claims.md',    formatValue: (v, d) => `${Math.round(v).toLocaleString()} initial claims (${fmtDate(d)})`, trendFn: (ch) => ch > 5000 ? 'Rising' : ch < -5000 ? 'Falling' : 'Stable' },
];

// Note: PPIACO may not be present in the Inflation pull (which has PPIACO absent).
// The parser will simply not find it and skip gracefully.

// ── Core run ──────────────────────────────────────────────────────────────────

/**
 * @param {{ dryRun?: boolean }} flags
 * @returns {Promise<{ updated: string[], skipped: string[], errors: string[] }>}
 */
export async function run(flags = {}) {
  const dryRun = Boolean(flags.dryRun || flags['dry-run']);
  const updated = [];
  const skipped = [];
  const errors = [];
  const todayStr = new Date().toISOString().slice(0, 10);

  // Load all needed pull files once per group
  const pullCache = new Map(); // group → Map<series, data>

  function getPullData(group) {
    if (pullCache.has(group)) return pullCache.get(group);
    const filePath = findLatestPull(MACRO_PULLS_DIR, new RegExp(`^\\d{4}-\\d{2}-\\d{2}_FRED_${group}\\.md$`));
    if (!filePath) {
      console.warn(`[wm-indicators] No FRED ${group} pull found — skipping.`);
      pullCache.set(group, new Map());
      return new Map();
    }
    let text;
    try { text = readFileSync(filePath, 'utf-8'); } catch {
      console.warn(`[wm-indicators] Could not read ${filePath}`);
      pullCache.set(group, new Map());
      return new Map();
    }
    // Extract signal_status from pull frontmatter
    const signalMatch = text.match(/^signal_status:\s*["']?(\w+)["']?/m);
    const pullSignal = signalMatch ? signalMatch[1] : null;
    const seriesData = parseFredTable(text);
    seriesData.set('__signal_status__', pullSignal);
    pullCache.set(group, seriesData);
    console.log(`[wm-indicators] Loaded ${group}: ${filePath} (${seriesData.size - 1} series)`);
    return seriesData;
  }

  // ── FRED series updates ────────────────────────────────────────────────────
  for (const entry of SERIES_MAP) {
    const pullData = getPullData(entry.pullGroup);
    const row = pullData.get(entry.series);
    if (!row) {
      console.log(`[wm-indicators] Series ${entry.series} not found in ${entry.pullGroup} pull — skipping.`);
      skipped.push(`${entry.file} (${entry.series} missing)`);
      continue;
    }
    if (!hasFiniteFredRow(row)) {
      console.warn(`[wm-indicators] Series ${entry.series} has incomplete data in ${entry.pullGroup} pull - skipping.`);
      skipped.push(`${entry.file} (${entry.series} incomplete)`);
      continue;
    }

    const indicatorPath = join(INDICATORS_DIR, entry.file);
    const currentValue = entry.formatValue(row.latestValue, row.latestDate);
    const trend = entry.trendFn(row.change);

    const updates = {
      current_value: `"${currentValue}"`,
      trend: `"${trend}"`,
      last_updated: todayStr,
    };

    // Only propagate signal_status if the pull itself fired a non-clear signal
    const pullSignal = pullData.get('__signal_status__');
    if (pullSignal && pullSignal !== 'clear') {
      updates.signal_status = `"${pullSignal}"`;
    }

    const result = applyUpdates(indicatorPath, updates, dryRun);
    if (result === 'updated') {
      console.log(`[wm-indicators] ${dryRun ? '(dry) ' : ''}updated ${entry.file} ← ${entry.series}: ${currentValue}`);
      updated.push(entry.file);
    } else if (result === 'missing') {
      console.warn(`[wm-indicators] ${entry.file} not found at ${indicatorPath}`);
      errors.push(`${entry.file} (file missing)`);
    } else {
      skipped.push(`${entry.file} (no change)`);
    }
  }

  // ── VIX update from yfinance vol pull ──────────────────────────────────────
  const volPath = findLatestPull(VOL_PULLS_DIR, /^\d{4}-\d{2}-\d{2}_yfinance_vol_1d\.md$/);
  if (volPath) {
    try {
      const volText = readFileSync(volPath, 'utf-8');
      const volData = parseVolTable(volText);
      const vix = volData.get('VIX');
      if (vix) {
        const lastDate = vix.last ? vix.last.slice(0, 10) : todayStr;
        const vixValue = `${vix.close} (${fmtDate(lastDate)})`;
        const vixTrendStr = vixTrend(vix.close);
        const vixPath = join(INDICATORS_DIR, 'VIX.md');
        const result = applyUpdates(vixPath, {
          current_value: `"${vixValue}"`,
          trend: `"${vixTrendStr}"`,
          last_updated: todayStr,
        }, dryRun);
        if (result === 'updated') {
          console.log(`[wm-indicators] ${dryRun ? '(dry) ' : ''}updated VIX.md ← ${vixValue}`);
          updated.push('VIX.md');
        } else if (result === 'missing') {
          errors.push('VIX.md (file missing)');
        } else {
          skipped.push('VIX.md (no change)');
        }
      }
    } catch (err) {
      console.error(`[wm-indicators] VIX update failed: ${err.message}`);
      errors.push(`VIX.md (${err.message})`);
    }
  } else {
    console.warn('[wm-indicators] No yfinance vol pull found — VIX not updated.');
    skipped.push('VIX.md (no vol pull)');
  }

  // ── Regime status updates ──────────────────────────────────────────────────
  if (updated.length > 0) {
    let regimeFiles = [];
    try { regimeFiles = readdirSync(REGIMES_DIR).filter(f => f.endsWith('.md')); } catch { /* no regimes dir */ }

    const updatedSet = new Set(updated);
    const summaryLine = `Indicators updated: ${updated.join(', ')}`;

    for (const regimeFile of regimeFiles) {
      const regimePath = join(REGIMES_DIR, regimeFile);
      let regimeText;
      try { regimeText = readFileSync(regimePath, 'utf-8'); } catch { continue; }

      // Check if any of the updated indicators are linked in this regime file
      const linked = updated.filter(ind => regimeText.includes(`[[${ind.replace('.md', '')}]]`));
      if (linked.length === 0) continue;

      const sectionHeader = `## Regime Status Update`;
      const newBlock = `\n### Regime Status Update (${todayStr})\n${linked.map(i => `- [[${i.replace('.md', '')}]] updated`).join('\n')}\n`;

      let nextText;
      if (regimeText.includes(sectionHeader)) {
        // Append after existing section header
        nextText = regimeText.replace(sectionHeader, `${sectionHeader}${newBlock}`);
      } else {
        nextText = regimeText.trimEnd() + `\n\n${sectionHeader}${newBlock}`;
      }

      if (nextText !== regimeText) {
        if (!dryRun) writeFileSync(regimePath, nextText, 'utf-8');
        console.log(`[wm-indicators] ${dryRun ? '(dry) ' : ''}appended regime status → ${regimeFile}`);
      }
    }
  }

  console.log(`[wm-indicators] done — updated=${updated.length} skipped=${skipped.length} errors=${errors.length}`);
  return { updated, skipped, errors };
}

/** Compatibility alias for routePull (calls pull → run). */
export async function pull(flags = {}) {
  return run(flags);
}
