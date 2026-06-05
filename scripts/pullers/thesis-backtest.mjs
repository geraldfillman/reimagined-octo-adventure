/**
 * thesis-backtest.mjs — Phase 1 historical-calibration puller.
 *
 * Reads agent thesis rollup files under 05_Data_Pulls/Theses/, pulls FMP
 * historical prices for each (date, symbol) pair, and grades each verdict
 * deterministically with a return-threshold + window rule. Writes records
 * to _state/thesis-calibration.json — a SEPARATE file from the forward-loop
 * _state/calibration.json so the corpora never mix.
 *
 * Usage:
 *   node run.mjs pull thesis-backtest --dry-run --json
 *   node run.mjs pull thesis-backtest --limit=3 --dry-run --json
 *   node run.mjs pull thesis-backtest --window=10 --threshold=3
 *   node run.mjs pull thesis-backtest                 # writes calibration + report
 */

import { existsSync, readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { getEngineRoot, resolveWorldMachinePath, getPullsDir } from '../lib/config.mjs';
import { buildNote, buildTable, today } from '../lib/markdown.mjs';
import { fetchDailyPricesFull } from '../lib/fmp-client.mjs';

const THESIS_DIR = join(getPullsDir(), 'Theses');
const CALIBRATION_PATH = join(getEngineRoot(), '_state', 'thesis-calibration.json');
const REPORT_PATH = (date) => resolveWorldMachinePath('Reports', 'Regime', `${date}-thesis-backtest.md`);

const DEFAULT_WINDOW = 10;
const DEFAULT_THRESHOLD = 3.0;
const FILE_PATTERN = /_Agent_Analysis_All_Theses\.md$/;

const LABELS = Object.freeze({
  PLAYED_OUT: 'Played out',
  DIRECTIONAL: 'Directionally right / poorly timed',
  NOISY: 'Noisy',
  MISSED: 'Missed',
  STALE: 'Stale',
  REBUILD: 'Rebuild',
});

export async function pull(flags = {}) {
  const asOfDate = String(flags.date || today()).slice(0, 10);
  const params = {
    window_days: Number(flags.window ?? DEFAULT_WINDOW),
    threshold_pct: Number(flags.threshold ?? DEFAULT_THRESHOLD),
    label_rule: 'return-threshold',
  };
  const limit = flags.limit ? Number(flags.limit) : Infinity;
  const dateFrom = flags['date-from'] ? String(flags['date-from']) : null;
  const dateTo = flags['date-to'] ? String(flags['date-to']) : null;

  const observations = collectObservations({ dateFrom, dateTo });
  const subset = observations.slice(0, limit);

  if (!subset.length) {
    const empty = { schema_version: 1, source: 'thesis-backtest', asOfDate, params, records: [], summary: emptySummary() };
    if (flags['dry-run']) console.log(JSON.stringify(empty, null, 2));
    return empty;
  }

  const priceCache = new Map();
  const records = [];
  let priceErrors = 0;

  for (const obs of subset) {
    const cacheKey = `${obs.symbol}::${obs.thesis_date}::${params.window_days}`;
    let history = priceCache.get(cacheKey);
    if (!history) {
      try {
        history = await fetchPriceWindow(obs.symbol, obs.thesis_date, params.window_days);
        priceCache.set(cacheKey, history);
      } catch (err) {
        priceErrors++;
        records.push(buildFailedRecord(obs, params, err.message));
        continue;
      }
    }
    records.push(buildGradedRecord(obs, history, params));
  }

  const payload = {
    schema_version: 1,
    source: 'thesis-backtest',
    asOfDate,
    params,
    record_count: records.length,
    observation_count: subset.length,
    price_error_count: priceErrors,
    records,
    summary: summarize(records),
  };

  if (flags['dry-run']) {
    if (flags.json) console.log(JSON.stringify(payload, null, 2));
    else console.log(renderReportMarkdown(payload));
    return payload;
  }

  saveCalibration(payload);
  const reportPath = REPORT_PATH(asOfDate);
  mkdirSync(join(reportPath, '..'), { recursive: true });
  writeFileSync(reportPath, renderReportMarkdown(payload), 'utf8');

  if (flags.json) {
    console.log(JSON.stringify({
      asOfDate,
      calibrationPath: CALIBRATION_PATH,
      reportPath,
      record_count: payload.record_count,
      price_error_count: priceErrors,
      summary: payload.summary,
    }, null, 2));
  } else {
    console.log(`[thesis-backtest] Records:    ${payload.record_count}`);
    console.log(`[thesis-backtest] Errors:     ${priceErrors}`);
    console.log(`[thesis-backtest] Calibration: ${CALIBRATION_PATH}`);
    console.log(`[thesis-backtest] Report:      ${reportPath}`);
  }
  return payload;
}

// ─── Collect observations from thesis rollup files ──────────────────────────

export function collectObservations({ dateFrom = null, dateTo = null } = {}) {
  if (!existsSync(THESIS_DIR)) return [];
  const files = readdirSync(THESIS_DIR)
    .filter(f => FILE_PATTERN.test(f))
    .sort();
  const observations = [];
  for (const file of files) {
    const filePath = join(THESIS_DIR, file);
    const text = readFileSync(filePath, 'utf8');
    const thesisDate = (text.match(/^date_pulled:\s*["']?([0-9-]+)["']?/m) || [])[1];
    if (!thesisDate) continue;
    if (dateFrom && thesisDate < dateFrom) continue;
    if (dateTo && thesisDate > dateTo) continue;
    const rows = parseRollupTable(text);
    for (const row of rows) {
      observations.push({ ...row, thesis_date: thesisDate, source_file: file });
    }
  }
  return observations;
}

function parseRollupTable(text) {
  const lines = text.split(/\r?\n/);
  const headerIdx = lines.findIndex(l => /^\|\s*Symbol\s*\|\s*Verdict\s*\|/i.test(l));
  if (headerIdx === -1) return [];
  const rows = [];
  for (let i = headerIdx + 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith('|')) break;
    if (/^\|\s*-+/.test(line)) continue;
    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    if (cells.length < 4) continue;
    const symbol = cells[0];
    if (!/^[A-Z][A-Z0-9.-]{0,9}$/.test(symbol)) continue;
    const verdict = cells[1].toUpperCase();
    if (!['BULLISH', 'BEARISH', 'NEUTRAL'].includes(verdict)) continue;
    const confidence_pct = Number((cells[2] || '').replace(/[^0-9.]/g, '')) || null;
    rows.push({
      symbol,
      verdict,
      confidence_pct,
      entropy: cells[3] || '',
      status: cells[4] || '',
    });
  }
  return rows;
}

// ─── Price fetch + grading ──────────────────────────────────────────────────

async function fetchPriceWindow(symbol, thesisDate, windowDays) {
  // FMP returns calendar daily bars; ask for windowDays * 2 calendar days then take first + last trading day
  const from = thesisDate;
  const toDate = new Date(thesisDate);
  toDate.setUTCDate(toDate.getUTCDate() + Math.max(windowDays * 2, 14));
  const to = toDate.toISOString().slice(0, 10);
  const history = await fetchDailyPricesFull(symbol, { from, to });
  if (!Array.isArray(history) || !history.length) {
    throw new Error(`no price data for ${symbol} ${from}..${to}`);
  }
  // FMP returns newest-first by default; normalize to oldest-first
  const normalized = [...history].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  return normalized;
}

function buildGradedRecord(obs, history, params) {
  const startBar = history.find(bar => String(bar.date) >= obs.thesis_date) || history[0];
  // pick the trading-day bar closest to thesis_date + window_days
  const targetDate = new Date(obs.thesis_date);
  targetDate.setUTCDate(targetDate.getUTCDate() + params.window_days);
  const targetISO = targetDate.toISOString().slice(0, 10);
  let endBar = startBar;
  for (const bar of history) {
    if (String(bar.date) <= targetISO) endBar = bar;
    else break;
  }
  const price_start = Number(startBar.adjClose ?? startBar.close);
  const price_end = Number(endBar.adjClose ?? endBar.close);
  const return_pct = price_start ? ((price_end - price_start) / price_start) * 100 : 0;
  const label = gradeReturn({ verdict: obs.verdict, return_pct, threshold: params.threshold_pct, confidence_pct: obs.confidence_pct });
  return {
    thesis_date: obs.thesis_date,
    symbol: obs.symbol,
    verdict: obs.verdict,
    confidence_pct: obs.confidence_pct,
    entropy: obs.entropy,
    window_start: startBar.date,
    window_end: endBar.date,
    price_start,
    price_end,
    return_pct: round2(return_pct),
    label,
    source_file: obs.source_file,
    backtested_at: new Date().toISOString(),
    fmp_data_ok: true,
  };
}

function buildFailedRecord(obs, params, errorMessage) {
  return {
    thesis_date: obs.thesis_date,
    symbol: obs.symbol,
    verdict: obs.verdict,
    confidence_pct: obs.confidence_pct,
    entropy: obs.entropy,
    window_start: null,
    window_end: null,
    price_start: null,
    price_end: null,
    return_pct: null,
    label: LABELS.REBUILD,
    source_file: obs.source_file,
    backtested_at: new Date().toISOString(),
    fmp_data_ok: false,
    error: errorMessage,
  };
}

export function gradeReturn({ verdict, return_pct, threshold, confidence_pct }) {
  const t = Number(threshold);
  const r = Number(return_pct);
  const lowConfidence = (confidence_pct ?? 0) < 20;
  switch (verdict) {
    case 'BULLISH':
      if (r >= t) return LABELS.PLAYED_OUT;
      if (r > 0) return LABELS.DIRECTIONAL;
      if (r > -t) return lowConfidence ? LABELS.NOISY : LABELS.STALE;
      return LABELS.MISSED;
    case 'BEARISH':
      if (r <= -t) return LABELS.PLAYED_OUT;
      if (r < 0) return LABELS.DIRECTIONAL;
      if (r < t) return lowConfidence ? LABELS.NOISY : LABELS.STALE;
      return LABELS.MISSED;
    case 'NEUTRAL':
      if (Math.abs(r) < t) return LABELS.PLAYED_OUT;
      if (Math.abs(r) < t * 2) return lowConfidence ? LABELS.NOISY : LABELS.STALE;
      return LABELS.MISSED;
    default:
      return LABELS.REBUILD;
  }
}

// ─── Summary + persistence ──────────────────────────────────────────────────

function summarize(records) {
  const ok = records.filter(r => r.fmp_data_ok);
  const byLabel = {};
  const byVerdict = {};
  for (const r of records) {
    byLabel[r.label] = (byLabel[r.label] || 0) + 1;
    byVerdict[r.verdict] = (byVerdict[r.verdict] || 0) + 1;
  }
  const correct = ok.filter(r => r.label === LABELS.PLAYED_OUT || r.label === LABELS.DIRECTIONAL).length;
  const accuracy_pct = ok.length ? round2((correct / ok.length) * 100) : null;
  return {
    total_records: records.length,
    graded_records: ok.length,
    by_label: byLabel,
    by_verdict: byVerdict,
    accuracy_pct,
    by_symbol: summarizeBySymbol(ok),
    by_verdict_accuracy: summarizeByVerdictAccuracy(ok),
  };
}

function summarizeBySymbol(records) {
  const grouped = {};
  for (const r of records) {
    if (!grouped[r.symbol]) grouped[r.symbol] = { symbol: r.symbol, n: 0, correct: 0, missed: 0, mean_abs_return: 0, _abs_sum: 0 };
    const g = grouped[r.symbol];
    g.n++;
    if (r.label === LABELS.PLAYED_OUT || r.label === LABELS.DIRECTIONAL) g.correct++;
    if (r.label === LABELS.MISSED) g.missed++;
    g._abs_sum += Math.abs(r.return_pct ?? 0);
  }
  return Object.values(grouped)
    .map(g => ({
      symbol: g.symbol,
      n: g.n,
      correct: g.correct,
      missed: g.missed,
      accuracy_pct: round2((g.correct / g.n) * 100),
      mean_abs_return_pct: round2(g._abs_sum / g.n),
    }))
    .sort((a, b) => b.accuracy_pct - a.accuracy_pct);
}

function summarizeByVerdictAccuracy(records) {
  const grouped = {};
  for (const r of records) {
    if (!grouped[r.verdict]) grouped[r.verdict] = { verdict: r.verdict, n: 0, correct: 0 };
    const g = grouped[r.verdict];
    g.n++;
    if (r.label === LABELS.PLAYED_OUT || r.label === LABELS.DIRECTIONAL) g.correct++;
  }
  return Object.values(grouped).map(g => ({
    verdict: g.verdict,
    n: g.n,
    correct: g.correct,
    accuracy_pct: round2((g.correct / g.n) * 100),
  }));
}

function emptySummary() {
  return { total_records: 0, graded_records: 0, by_label: {}, by_verdict: {}, accuracy_pct: null };
}

function saveCalibration(payload) {
  mkdirSync(join(CALIBRATION_PATH, '..'), { recursive: true });
  writeFileSync(CALIBRATION_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');
}

function renderReportMarkdown(payload) {
  const summary = payload.summary;
  const labelRows = Object.entries(summary.by_label).map(([k, v]) => [k, String(v)]);
  const verdictRows = Object.entries(summary.by_verdict).map(([k, v]) => [k, String(v)]);
  const sampleRows = payload.records.slice(0, 30).map(r => [
    r.thesis_date, r.symbol, r.verdict, String(r.confidence_pct ?? '—'),
    r.return_pct !== null ? `${r.return_pct}%` : '—', r.label,
  ]);
  return buildNote({
    frontmatter: {
      title: 'Thesis Backtest Calibration Report',
      source: 'thesis-backtest',
      date_pulled: payload.asOfDate,
      domain: 'positioning',
      data_type: 'thesis_backtest_report',
      record_count: payload.record_count,
      graded_records: summary.graded_records,
      accuracy_pct: summary.accuracy_pct,
      window_days: payload.params.window_days,
      threshold_pct: payload.params.threshold_pct,
      tags: ['thesis-backtest', 'phase-1', 'calibration', 'historical'],
    },
    sections: [
      {
        heading: 'Parameters',
        content: `- Window: ${payload.params.window_days} trading days\n- Threshold: ±${payload.params.threshold_pct}%\n- Label rule: ${payload.params.label_rule}`,
      },
      {
        heading: 'Summary',
        content: `- Total records: ${summary.total_records}\n- Graded (price data ok): ${summary.graded_records}\n- Accuracy (Played out + Directional / Graded): ${summary.accuracy_pct ?? '—'}%`,
      },
      { heading: 'Distribution by Label', content: labelRows.length ? buildTable(['Label', 'Count'], labelRows) : '_none_' },
      { heading: 'Distribution by Verdict', content: verdictRows.length ? buildTable(['Verdict', 'Count'], verdictRows) : '_none_' },
      {
        heading: 'Per-Symbol Accuracy (sorted desc)',
        content: (summary.by_symbol || []).length
          ? buildTable(
              ['Symbol', 'N', 'Correct', 'Missed', 'Accuracy %', 'Mean |return| %'],
              summary.by_symbol.map(s => [s.symbol, String(s.n), String(s.correct), String(s.missed), `${s.accuracy_pct}%`, `${s.mean_abs_return_pct}%`]),
            )
          : '_none_',
      },
      {
        heading: 'Per-Verdict Accuracy',
        content: (summary.by_verdict_accuracy || []).length
          ? buildTable(
              ['Verdict', 'N', 'Correct', 'Accuracy %'],
              summary.by_verdict_accuracy.map(v => [v.verdict, String(v.n), String(v.correct), `${v.accuracy_pct}%`]),
            )
          : '_none_',
      },
      { heading: 'Sample (first 30 records)', content: sampleRows.length ? buildTable(['Date', 'Symbol', 'Verdict', 'Conf%', 'Return', 'Label'], sampleRows) : '_none_' },
    ],
  });
}

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}
