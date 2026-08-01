/**
 * commodity-transmission.mjs — Commodity → company transmission scanner.
 *
 * Reads scripts/config/transmission-map.json, pulls each commodity's FRED
 * series, measures the recent move against a baseline window, and when an
 * edge's threshold trips, emits signal notes routed to the affected theses,
 * sectors, and tickers.
 *
 * Windows: daily series compare 20-obs avg vs prior 40-obs avg;
 *          monthly series compare 3-obs avg vs prior 9-obs avg.
 * Severity: watch at 1x threshold, alert at 2x threshold.
 *
 * Usage:
 *   node run.mjs pull commodity-transmission
 *   node run.mjs pull commodity-transmission --commodity copper
 *   node run.mjs pull commodity-transmission --dry-run
 *
 * Output:
 *   05_Data_Pulls/Commodities/YYYY-MM-DD_Commodity_Transmission_Scan.md
 *   06_Signals/YYYY-MM-DD_COMMODITY_TRANSMISSION_<KEY>.md (per tripped commodity)
 */

import { join, dirname } from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { getApiKey, getBaseUrl, getPullsDir, getSignalsDir } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import {
  buildNote, buildTable, writeNote, formatNumber,
  today, dateStampedFilename,
} from '../lib/markdown.mjs';
import { readFolderWhere } from '../lib/frontmatter.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MAP_PATH = join(__dirname, '..', 'config', 'transmission-map.json');

const WINDOWS = {
  daily:   { recent: 20, prior: 40, obsLimit: 90 },
  monthly: { recent: 3,  prior: 9,  obsLimit: 24 },
};

export async function pull(flags = {}) {
  const map = loadTransmissionMap();
  const apiKey = getApiKey('fred');
  const baseUrl = getBaseUrl('fred');

  let entries = Object.entries(map.commodities);
  if (flags.commodity) {
    entries = entries.filter(([key]) => key === flags.commodity);
    if (entries.length === 0) {
      throw new Error(
        `Unknown commodity "${flags.commodity}". Available: ${Object.keys(map.commodities).join(', ')}`
      );
    }
  }

  console.log(`🔗 Commodity Transmission: scanning ${entries.length} commodities...\n`);

  const curves = await latestCurveStates();
  const scanned = [];
  for (const [key, commodity] of entries) {
    const row = await scanCommodity({ key, commodity, apiKey, baseUrl });
    row.curve = curves[key] ?? null;
    scanned.push(row);
    logRow(row);
  }

  const tripped = scanned.filter(r => r.trippedEdges.length > 0 && !r.error);
  const errored = scanned.filter(r => r.error);
  // A run with fetch/coverage errors must never read as all-clear: floor at watch.
  const overallStatus = tripped.some(r => r.severity === 'alert') ? 'alert'
    : (tripped.length > 0 || errored.length > 0) ? 'watch' : 'clear';

  console.log(`\n${tripped.length} commodities tripped edges | ${errored.length} scan errors | status: ${overallStatus}`);

  const note = buildScanNote({ scanned, tripped, overallStatus });
  const filePath = join(getPullsDir(), 'Commodities', dateStampedFilename('Commodity_Transmission_Scan'));

  if (flags['dry-run']) {
    console.log(note);
    return { filePath: null, tripped: tripped.length, signal_status: overallStatus };
  }

  writeNote(filePath, note);
  console.log(`\n📝 Wrote: ${filePath}`);

  for (const row of tripped) {
    const signalPath = writeTransmissionSignal(row);
    console.log(`⚡ Signal logged: ${signalPath}`);
  }

  return { filePath, tripped: tripped.length, signal_status: overallStatus };
}

// ─── Futures curve context ──────────────────────────────────────────────────────

/** Latest futures_curve note → {commodity_key: 'backwardation'|'contango'|'flat'}. */
async function latestCurveStates() {
  try {
    const notes = await readFolderWhere(
      join(getPullsDir(), 'Commodities'),
      d => d.data_type === 'futures_curve'
    );
    if (!notes.length) return {};
    const latest = notes.reduce((a, b) =>
      String(a.data.date_pulled) > String(b.data.date_pulled) ? a : b);
    if (latest.data.curves && typeof latest.data.curves === 'object') return latest.data.curves;
    if (!latest.data.curves_json) return {};
    for (const candidate of [latest.data.curves_json, latest.data.curves_json.replace(/\\"/g, '"')]) {
      try { return JSON.parse(candidate); } catch { /* try next */ }
    }
    return {};
  } catch {
    return {};
  }
}

// ─── Map loading ────────────────────────────────────────────────────────────────

function loadTransmissionMap() {
  let raw;
  try {
    raw = readFileSync(MAP_PATH, 'utf8');
  } catch (err) {
    throw new Error(`Cannot read transmission map at ${MAP_PATH}: ${err.message}`);
  }
  const map = JSON.parse(raw);
  if (!map.commodities || Object.keys(map.commodities).length === 0) {
    throw new Error('Transmission map has no commodities defined');
  }
  for (const [key, c] of Object.entries(map.commodities)) {
    if (!c.fred_series || !WINDOWS[c.frequency]) {
      throw new Error(`Commodity "${key}" needs fred_series and frequency of daily|monthly`);
    }
    if (!Array.isArray(c.edges) || c.edges.length === 0) {
      throw new Error(`Commodity "${key}" has no transmission edges`);
    }
  }
  return map;
}

// ─── Scanning ───────────────────────────────────────────────────────────────────

async function scanCommodity({ key, commodity, apiKey, baseUrl }) {
  const windows = WINDOWS[commodity.frequency];
  const url = `${baseUrl}/series/observations?series_id=${commodity.fred_series}` +
    `&api_key=${apiKey}&file_type=json&sort_order=desc&limit=${windows.obsLimit}`;

  const base = { key, label: commodity.label, series: commodity.fred_series, unit: commodity.unit, commodity };

  let observations;
  try {
    const data = await getJson(url);
    observations = (data.observations || [])
      .filter(o => o.value !== '.')
      .map(o => ({ date: o.date, value: parseFloat(o.value) }));
  } catch (err) {
    return { ...base, error: err.message, trippedEdges: [] };
  }

  if (observations.length < windows.recent + windows.prior) {
    return {
      ...base,
      error: `only ${observations.length} observations (need ${windows.recent + windows.prior})`,
      trippedEdges: [],
    };
  }

  const recentAvg = avg(observations.slice(0, windows.recent));
  const priorAvg  = avg(observations.slice(windows.recent, windows.recent + windows.prior));
  const movePct   = priorAvg !== 0 ? ((recentAvg - priorAvg) / priorAvg) * 100 : 0;
  const direction = movePct >= 0 ? 'rise' : 'fall';

  const trippedEdges = commodity.edges.filter(
    e => e.on === direction && Math.abs(movePct) >= e.threshold_pct
  );
  const severity = trippedEdges.some(e => Math.abs(movePct) >= e.threshold_pct * 2)
    ? 'alert' : trippedEdges.length > 0 ? 'watch' : 'clear';

  return {
    ...base,
    latest: observations[0],
    recentAvg, priorAvg,
    movePct: Math.round(movePct * 10) / 10,
    direction,
    trippedEdges,
    severity,
  };
}

function avg(observations) {
  return observations.reduce((s, o) => s + o.value, 0) / observations.length;
}

function logRow(row) {
  if (row.error) {
    console.log(`  ⚠️ ${row.label}: ${row.error}`);
    return;
  }
  const icon = { alert: '🟠', watch: '🟡', clear: '⚪' }[row.severity];
  console.log(
    `  ${icon} ${row.label}: ${row.movePct > 0 ? '+' : ''}${row.movePct}% (${row.direction})` +
    (row.trippedEdges.length ? ` — ${row.trippedEdges.length} edge(s) tripped` : '')
  );
}

// ─── Note builders ──────────────────────────────────────────────────────────────

function buildScanNote({ scanned, tripped, overallStatus }) {
  const summaryRows = scanned.map(r => r.error
    ? [r.label, r.series, 'ERROR', r.error, '—', '—']
    : [
        r.label,
        r.series,
        formatNumber(r.latest.value, { decimals: 2 }),
        `${r.movePct > 0 ? '+' : ''}${r.movePct}%`,
        r.direction,
        r.trippedEdges.length > 0 ? `${r.trippedEdges.length} (${r.severity})` : 'none',
      ]);

  const edgeSections = tripped.map(r => ({
    heading: `${r.label} — ${r.direction} ${Math.abs(r.movePct)}%`,
    content: r.trippedEdges.map(e => [
      `- **${e.effect === '+' ? 'Benefits' : 'Hurts'}** ${e.sectors.join(', ')} (lag ~${e.lag_quarters}q)`,
      `  - ${e.mechanism}`,
      `  - Tickers: ${e.tickers.join(', ') || '—'}`,
      e.theses.length ? `  - Theses: ${e.theses.map(t => `[[${t}]]`).join(', ')}` : null,
    ].filter(Boolean).join('\n')).join('\n'),
  }));

  return buildNote({
    frontmatter: {
      title: 'Commodity Transmission Scan',
      source: 'FRED API + transmission-map.json',
      date_pulled: today(),
      domain: 'commodities',
      data_type: 'transmission_scan',
      frequency: 'daily',
      signal_status: overallStatus,
      signals: tripped.map(r => r.key),
      scan_errors: scanned.filter(r => r.error).map(r => r.key),
      tripped_commodities: tripped.map(r => r.key),
      moves: Object.fromEntries(scanned.filter(r => !r.error).map(r => [r.key, r.movePct])),
      curves: Object.fromEntries(scanned.filter(r => r.curve).map(r => [r.key, r.curve])),
      // JSON twins: the vault frontmatter parser returns null for nested maps,
      // so script consumers read these; Dataview reads the nested forms above.
      moves_json: JSON.stringify(Object.fromEntries(scanned.filter(r => !r.error).map(r => [r.key, r.movePct]))),
      tags: ['commodities', 'transmission', 'scan'],
      related_pulls: [],
    },
    sections: [
      {
        heading: 'Which input costs are moving, and who inherits them?',
        content: buildTable(
          ['Commodity', 'Series', 'Latest', 'Move (recent vs baseline)', 'Direction', 'Edges Tripped'],
          summaryRows
        ),
      },
      ...edgeSections,
      {
        heading: 'Method',
        content: [
          '- Daily series: 20-obs average vs prior 40-obs average.',
          '- Monthly series: 3-obs average vs prior 9-obs average.',
          '- Edges trip when the move direction matches and magnitude ≥ edge threshold.',
          '- Map: `scripts/config/transmission-map.json` — edit edges there.',
        ].join('\n'),
      },
    ],
  });
}

function writeTransmissionSignal(row) {
  const affectedTheses = [...new Set(row.trippedEdges.flatMap(e => e.theses))];
  const affectedTickers = [...new Set(row.trippedEdges.flatMap(e => e.tickers))];
  const signalId = `COMMODITY_TRANSMISSION_${row.key.toUpperCase()}`;

  const signalNote = buildNote({
    frontmatter: {
      signal_id: signalId,
      signal_name: `${row.label} ${row.direction} ${Math.abs(row.movePct)}% — transmission edges tripped`,
      domain: 'commodities',
      severity: row.severity,
      value: row.movePct,
      threshold: Math.min(...row.trippedEdges.map(e => e.threshold_pct)),
      date: today(),
      source_pull: 'Commodity_Transmission_Scan',
      commodity: row.key,
      theses: affectedTheses,
      tickers: affectedTickers,
      tags: ['signal', 'commodities', row.severity, 'transmission'],
    },
    sections: [
      {
        heading: `${row.label} moved ${row.movePct > 0 ? '+' : ''}${row.movePct}%`,
        content: `Recent average ${formatNumber(row.recentAvg, { decimals: 2 })} vs baseline ` +
          `${formatNumber(row.priorAvg, { decimals: 2 })} ${row.unit}. ` +
          `${row.trippedEdges.length} transmission edge(s) tripped.` +
          (row.curve
            ? ` Futures curve: **${row.curve}**${row.curve === 'backwardation' && row.direction === 'rise' ? ' — physical tightness confirms the move; higher confidence.' : '.'}`
            : ''),
      },
      {
        heading: 'Implications',
        content: row.trippedEdges.map(e =>
          `- ${e.effect === '+' ? '✅' : '❌'} ${e.mechanism} (${e.sectors.join(', ')}; lag ~${e.lag_quarters}q)`
        ).join('\n'),
      },
      {
        heading: 'Affected',
        content: [
          affectedTheses.length ? `- Theses: ${affectedTheses.map(t => `[[${t}]]`).join(', ')}` : '- Theses: none mapped',
          `- Tickers: ${affectedTickers.join(', ') || 'none mapped'}`,
        ].join('\n'),
      },
    ],
  });

  const signalPath = join(getSignalsDir(), dateStampedFilename(signalId));
  writeNote(signalPath, signalNote);
  return signalPath;
}
