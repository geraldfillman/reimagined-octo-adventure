/**
 * sports-calibration.mjs — paper-only calibration loop for the multi-factor
 * sports prediction ledger.
 *
 * Reads every settled prediction CSV under
 *   scripts/.cache/sports/predictions/<date>_predictions.csv
 *
 * Parses the `variable_snapshot` JSON column, computes:
 *   - per-sport Brier / log-loss / reliability bins (via shared
 *     computeCalibration math)
 *   - per-factor information coefficient (Spearman) using
 *     factor_contributions_top5 vs binary outcome
 *   - weight-tuning recommendations (current_weight × (1 + IC))
 *   - miscalibration alerts vs market baseline
 *   - factor_coverage_ratio trend per ISO week
 *
 * Paper-only. Pure data analysis over local CSVs — no network, no fixtures.
 *
 * Usage:
 *   node run.mjs pull sports-calibration
 *   node run.mjs pull sports-calibration --since 2026-01-01
 *   node run.mjs pull sports-calibration --sport mlb
 *   node run.mjs pull sports-calibration --dry-run
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';
import { getPullsDir, getVaultRoot } from '../lib/config.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';
import { computeCalibration } from '../lib/sports/calibration-math.mjs';
import { registry } from '../lib/sports/registry-all.mjs';

const PREDICTION_CACHE_DIR = join(getVaultRoot(), 'scripts', '.cache', 'sports', 'predictions');
const REQUIRED_MODEL_VERSION = 'multi-factor-v1';
const MARKET_BASELINE_BRIER = 0.247;
const MISCALIBRATION_DEVIATION = 0.10;
const MISCALIBRATION_SAMPLE_FLOOR = 30;
const IC_MIN_SAMPLE = 30;
const RECOMMENDATION_MIN_SAMPLE = 100;
const RECOMMENDATION_MIN_ABS_IC = 0.05;
const WEIGHT_FLOOR = 0.1;
const WEIGHT_CEIL_MULTIPLIER = 3;

// ── public entry point ───────────────────────────────────────────────────────

export async function pull(flags = {}) {
  const sourceLog = [];
  const rawRows = readAllLedgerRows(flags, sourceLog);
  const eligibleRows = rawRows.filter(isEligibleForCalibration);
  const filteredRows = applySportFilter(eligibleRows, flags.sport ? String(flags.sport) : null);

  const summary = summarizeCalibration(filteredRows, registry);
  summary.predictionCountTotal = rawRows.length;
  summary.predictionCountEligible = filteredRows.length;
  summary.sourceLog = sourceLog;

  const signals = collectSignals(summary);
  const filePath = join(getPullsDir(), 'Sports', dateStampedFilename('Sports_Calibration'));

  if (flags['dry-run']) {
    console.log(`[dry-run] Would write: ${filePath}`);
    console.log(JSON.stringify({
      predictionCountTotal: summary.predictionCountTotal,
      predictionCountEligible: summary.predictionCountEligible,
      perSport: summary.perSport.map(s => ({
        sport: s.sport,
        n: s.sampleSize,
        brier: s.brierScore,
        logLoss: s.logLoss,
      })),
      topFactors: summary.icTable.slice(0, 5),
      signals,
    }, null, 2));
    return { filePath: null, summary, signals };
  }

  const note = buildCalibrationNote({ summary, signals });
  writeNote(filePath, note);
  console.log(`Sports calibration wrote: ${filePath}`);
  return { filePath, summary, signals };
}

// ── ledger loading ───────────────────────────────────────────────────────────

function readAllLedgerRows(flags, sourceLog) {
  if (!existsSync(PREDICTION_CACHE_DIR)) {
    sourceLog.push({ file: PREDICTION_CACHE_DIR, rows: 0, note: 'cache directory missing' });
    return [];
  }

  const since = flags.since ? String(flags.since) : null;
  const files = readdirSync(PREDICTION_CACHE_DIR)
    .filter(name => name.endsWith('_predictions.csv'))
    .filter(name => !since || extractDateFromFilename(name) >= since)
    .sort();

  const rows = [];
  for (const file of files) {
    const fullPath = join(PREDICTION_CACHE_DIR, file);
    let parsed;
    try {
      parsed = parseCsv(readFileSync(fullPath, 'utf8'));
    } catch (err) {
      sourceLog.push({ file, rows: 0, note: `parse error: ${err.message}` });
      continue;
    }
    let parseErrors = 0;
    for (const row of parsed) {
      const enriched = enrichRow(row);
      if (!enriched) {
        parseErrors++;
        continue;
      }
      rows.push(enriched);
    }
    sourceLog.push({
      file,
      rows: parsed.length,
      kept: parsed.length - parseErrors,
      note: parseErrors ? `${parseErrors} row(s) skipped (malformed variable_snapshot)` : 'ok',
    });
  }
  return rows;
}

function extractDateFromFilename(filename) {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})_/);
  return match ? match[1] : '';
}

function enrichRow(row) {
  const probability = parseProbability(row.model_probability);
  if (probability === null) return null;

  let snapshot = {};
  if (row.variable_snapshot && row.variable_snapshot.trim() !== '') {
    try {
      snapshot = JSON.parse(row.variable_snapshot);
    } catch (err) {
      console.warn(`sports-calibration: malformed variable_snapshot for ${row.prediction_id || '?'}: ${err.message}`);
      return null;
    }
  }

  const result = normalizeResult(row.result);
  return {
    predictionId: row.prediction_id || '',
    date: row.date || '',
    sport: row.sport || '',
    league: row.league || '',
    probability,
    result,
    modelVersion: row.model_version || snapshot.model_version || '',
    factorKey: snapshot.factor_key || null,
    factorCoverageRatio: numericOrNull(snapshot.factor_coverage_ratio),
    factorCountTotal: numericOrNull(snapshot.factor_count_total),
    factorCountUsed: numericOrNull(snapshot.factor_count_used),
    factorContributions: Array.isArray(snapshot.factor_contributions_top5)
      ? snapshot.factor_contributions_top5.filter(c => c && typeof c.id === 'string')
      : [],
  };
}

// ── eligibility / filtering ──────────────────────────────────────────────────

export function isEligibleForCalibration(row) {
  if (!row) return false;
  if (row.modelVersion !== REQUIRED_MODEL_VERSION) return false;
  if (row.result !== 'win' && row.result !== 'loss') return false;
  if (!Array.isArray(row.factorContributions) || row.factorContributions.length === 0) return false;
  return true;
}

function applySportFilter(rows, sportFilter) {
  if (!sportFilter) return rows;
  const wanted = sportFilter.toLowerCase();
  return rows.filter(row => (row.factorKey || '').toLowerCase() === wanted);
}

// ── summarization ────────────────────────────────────────────────────────────

export function summarizeCalibration(rows, registryParam) {
  const empty = {
    perSport: [],
    icTable: [],
    weightRecommendations: {},
    weeklyCoverage: [],
    overall: emptyOverall(),
    miscalibrationAlerts: [],
    modelVersionCoverage: {},
  };
  if (!rows || rows.length === 0) return empty;

  const overall = calibrationFromRows(rows);
  const perSport = computePerSportCalibration(rows);
  const icTable = computePerFactorIc(rows, registryParam);
  const weightRecommendations = buildWeightRecommendations(icTable);
  const weeklyCoverage = computeWeeklyCoverage(rows);
  const miscalibrationAlerts = collectMiscalibrationAlerts(perSport);
  const modelVersionCoverage = countByField(rows, 'modelVersion');

  return {
    perSport,
    icTable,
    weightRecommendations,
    weeklyCoverage,
    overall,
    miscalibrationAlerts,
    modelVersionCoverage,
  };
}

function emptyOverall() {
  return {
    sampleSize: 0,
    brierScore: null,
    logLoss: null,
    reliabilityBins: [],
    miscalibrated: false,
  };
}

function calibrationFromRows(rows) {
  const settledShape = rows.map(row => ({ probability: row.probability, result: row.result }));
  return computeCalibration(settledShape);
}

function computePerSportCalibration(rows) {
  const groups = groupBy(rows, row => row.factorKey || '(unmapped)');
  return [...groups.entries()]
    .map(([sport, sportRows]) => {
      const calibration = calibrationFromRows(sportRows);
      const beatsBaseline = calibration.brierScore !== null && calibration.brierScore < MARKET_BASELINE_BRIER;
      return {
        sport,
        sampleSize: calibration.sampleSize,
        brierScore: calibration.brierScore,
        logLoss: calibration.logLoss,
        reliabilityBins: calibration.reliabilityBins,
        miscalibrated: calibration.miscalibrated,
        beatsMarketBaseline: beatsBaseline,
      };
    })
    .sort((a, b) => b.sampleSize - a.sampleSize);
}

// ── per-factor IC ────────────────────────────────────────────────────────────

export function computePerFactorIc(rows, registryParam) {
  const pairsByKey = new Map(); // `${sport}::${factorId}` → [{ contribution, outcome }]
  for (const row of rows) {
    const sport = row.factorKey || '(unmapped)';
    for (const contribution of row.factorContributions) {
      if (!Number.isFinite(contribution.contribution)) continue;
      const key = `${sport}::${contribution.id}`;
      if (!pairsByKey.has(key)) pairsByKey.set(key, []);
      pairsByKey.get(key).push({
        contribution: contribution.contribution,
        outcome: row.result === 'win' ? 1 : 0,
      });
    }
  }

  const out = [];
  for (const [key, pairs] of pairsByKey.entries()) {
    if (pairs.length < IC_MIN_SAMPLE) continue;
    const [sport, factorId] = key.split('::');
    const ic = spearmanCorrelation(
      pairs.map(p => p.contribution),
      pairs.map(p => p.outcome),
    );
    if (ic === null) continue;
    out.push({
      sport,
      factorId,
      sampleSize: pairs.length,
      ic,
      currentWeight: lookupCurrentWeight(registryParam, sport, factorId),
    });
  }
  return out.sort((a, b) => Math.abs(b.ic) - Math.abs(a.ic));
}

function lookupCurrentWeight(registryParam, sport, factorId) {
  if (!registryParam) return null;
  try {
    if (registryParam.byId && registryParam.byId[factorId]) {
      const factor = registryParam.byId[factorId];
      if (factor.sport === sport && Number.isFinite(factor.weight)) return factor.weight;
    }
    if (typeof registryParam.bySport === 'function') {
      const factors = registryParam.bySport(sport);
      const match = factors.find(f => f.id === factorId);
      return match && Number.isFinite(match.weight) ? match.weight : null;
    }
  } catch {
    return null;
  }
  return null;
}

// ── weight recommendations ───────────────────────────────────────────────────

export function recommendWeight(currentWeight, ic, sampleSize) {
  if (!Number.isFinite(currentWeight)) return null;
  if (!Number.isFinite(ic)) return null;
  if (Math.abs(ic) < RECOMMENDATION_MIN_ABS_IC) return null;
  if (!Number.isFinite(sampleSize) || sampleSize < RECOMMENDATION_MIN_SAMPLE) return null;
  const proposed = currentWeight * (1 + ic);
  const ceiling = currentWeight * WEIGHT_CEIL_MULTIPLIER;
  return clamp(proposed, WEIGHT_FLOOR, ceiling);
}

function buildWeightRecommendations(icTable) {
  const out = {};
  for (const entry of icTable) {
    const recommended = recommendWeight(entry.currentWeight, entry.ic, entry.sampleSize);
    if (recommended === null) continue;
    if (!out[entry.sport]) out[entry.sport] = {};
    out[entry.sport][entry.factorId] = round(recommended, 4);
  }
  return out;
}

// ── miscalibration alerts ────────────────────────────────────────────────────

function collectMiscalibrationAlerts(perSport) {
  const alerts = [];
  for (const sport of perSport) {
    if (sport.brierScore !== null && sport.brierScore > MARKET_BASELINE_BRIER) {
      alerts.push({
        sport: sport.sport,
        kind: 'brier_above_market_baseline',
        value: sport.brierScore,
        threshold: MARKET_BASELINE_BRIER,
      });
    }
    for (const bin of sport.reliabilityBins || []) {
      if (bin.count >= MISCALIBRATION_SAMPLE_FLOOR
          && bin.deviation !== null
          && Math.abs(bin.deviation) > MISCALIBRATION_DEVIATION) {
        alerts.push({
          sport: sport.sport,
          kind: 'reliability_bin_off_diagonal',
          bucket: `[${(bin.lower * 100).toFixed(0)}%-${(bin.upper * 100).toFixed(0)}%)`,
          deviation: bin.deviation,
          count: bin.count,
        });
      }
    }
  }
  return alerts;
}

// ── coverage trend ───────────────────────────────────────────────────────────

function computeWeeklyCoverage(rows) {
  const groups = new Map();
  for (const row of rows) {
    if (!Number.isFinite(row.factorCoverageRatio)) continue;
    const week = isoWeekStart(row.date);
    if (!week) continue;
    if (!groups.has(week)) groups.set(week, []);
    groups.get(week).push(row.factorCoverageRatio);
  }
  return [...groups.entries()]
    .map(([week, values]) => ({
      weekStart: week,
      n: values.length,
      meanCoverage: values.reduce((a, b) => a + b, 0) / values.length,
    }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

function isoWeekStart(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const d = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  const day = d.getUTCDay() || 7; // Sun=0 → 7
  d.setUTCDate(d.getUTCDate() - (day - 1)); // back to Monday
  return d.toISOString().slice(0, 10);
}

// ── Spearman correlation ─────────────────────────────────────────────────────

export function spearmanCorrelation(xs, ys) {
  if (!Array.isArray(xs) || !Array.isArray(ys)) return null;
  if (xs.length !== ys.length) return null;
  if (xs.length < 2) return null;
  const xRanks = averageRanks(xs);
  const yRanks = averageRanks(ys);
  return pearsonCorrelation(xRanks, yRanks);
}

export function averageRanks(values) {
  const indexed = values.map((value, index) => ({ value, index }));
  indexed.sort((a, b) => a.value - b.value);
  const ranks = new Array(values.length);
  let i = 0;
  while (i < indexed.length) {
    let j = i;
    while (j + 1 < indexed.length && indexed[j + 1].value === indexed[i].value) j++;
    const avgRank = ((i + 1) + (j + 1)) / 2; // 1-based ranks, averaged on ties
    for (let k = i; k <= j; k++) ranks[indexed[k].index] = avgRank;
    i = j + 1;
  }
  return ranks;
}

function pearsonCorrelation(xs, ys) {
  const n = xs.length;
  let sumX = 0, sumY = 0;
  for (let i = 0; i < n; i++) { sumX += xs[i]; sumY += ys[i]; }
  const meanX = sumX / n;
  const meanY = sumY / n;
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  if (denX === 0 || denY === 0) return 0;
  return num / Math.sqrt(denX * denY);
}

// ── note rendering ───────────────────────────────────────────────────────────

function buildCalibrationNote({ summary, signals }) {
  const sections = [];
  const eligibleN = summary.predictionCountEligible || 0;

  sections.push({
    heading: 'Executive Summary',
    content: buildExecutiveSummary(summary).join('\n'),
  });

  sections.push({
    heading: 'Per-Sport Calibration',
    content: summary.perSport.length
      ? buildTable(
        ['Sport', 'N', 'Brier', 'Log Loss', 'Max |Reliability Dev|', 'Beats Market Baseline?', 'Miscalibrated?'],
        summary.perSport.map(row => [
          row.sport,
          row.sampleSize,
          formatBrier(row.brierScore),
          formatBrier(row.logLoss),
          formatPercent(maxAbsDeviation(row.reliabilityBins) * 100),
          row.beatsMarketBaseline === null ? 'N/A' : row.beatsMarketBaseline ? 'yes' : 'no',
          row.miscalibrated ? 'yes' : 'no',
        ]),
      )
      : 'No eligible multi-factor-v1 settled rows yet.',
  });

  sections.push({
    heading: 'Per-Factor Information Coefficient',
    content: summary.icTable.length
      ? buildTable(
        ['Sport', 'Factor', 'N', 'IC', 'Current Weight', 'Recommended Weight'],
        summary.icTable.map(row => [
          row.sport,
          row.factorId,
          row.sampleSize,
          formatIc(row.ic),
          row.currentWeight === null ? 'N/A' : row.currentWeight.toFixed(3),
          formatRecommendation(row, summary.weightRecommendations),
        ]),
      )
      : 'No factor IC entries (need >= 30 paired observations per factor).',
  });

  sections.push({
    heading: 'Weight-Tuning Recommendations (paste into weights/<sport>.json)',
    content: Object.keys(summary.weightRecommendations).length
      ? '```json\n' + JSON.stringify(summary.weightRecommendations, null, 2) + '\n```'
      : 'No recommendations yet (need |IC| >= 0.05 and N >= 100).',
  });

  sections.push({
    heading: 'Reliability Buckets (Combined)',
    content: summary.overall.sampleSize > 0
      ? buildTable(
        ['Bucket', 'n', 'Mean Predicted', 'Observed Win Rate', 'Deviation'],
        summary.overall.reliabilityBins.map(bin => [
          `[${(bin.lower * 100).toFixed(0)}%-${(bin.upper * 100).toFixed(0)}%)`,
          bin.count,
          bin.meanPredicted === null ? 'N/A' : formatPercent(bin.meanPredicted * 100),
          bin.observedRate === null ? 'N/A' : formatPercent(bin.observedRate * 100),
          bin.deviation === null ? 'N/A' : formatPercent(bin.deviation * 100),
        ]),
      )
      : 'No combined reliability data yet.',
  });

  sections.push({
    heading: 'Coverage Trend (factor_coverage_ratio mean by ISO week)',
    content: summary.weeklyCoverage.length
      ? buildTable(
        ['Week Start (Mon, UTC)', 'N', 'Mean Coverage Ratio'],
        summary.weeklyCoverage.map(row => [
          row.weekStart,
          row.n,
          formatPercent(row.meanCoverage * 100),
        ]),
      )
      : 'No coverage data captured (factor_coverage_ratio missing or no rows).',
  });

  sections.push({
    heading: 'Source Log',
    content: summary.sourceLog.length
      ? buildTable(
        ['File', 'Rows', 'Kept', 'Note'],
        summary.sourceLog.map(entry => [
          entry.file,
          entry.rows ?? 0,
          entry.kept ?? entry.rows ?? 0,
          entry.note || '',
        ]),
      )
      : 'No CSVs found in scripts/.cache/sports/predictions/.',
  });

  return buildNote({
    frontmatter: {
      title: `Sports Calibration - ${today()}`,
      source: 'Sports prediction ledger calibration',
      date_pulled: today(),
      domain: 'sports',
      data_type: 'sports_calibration',
      frequency: 'on-demand',
      signal_status: signals.length ? 'watch' : 'clear',
      signals,
      tags: ['sports', 'calibration', 'model-evaluation'],
      prediction_count_total: summary.predictionCountTotal || 0,
      prediction_count_settled: eligibleN,
    },
    sections,
  });
}

function buildExecutiveSummary(summary) {
  const lines = [];
  lines.push(`Total prediction rows scanned: ${summary.predictionCountTotal || 0}`);
  lines.push(`Eligible (multi-factor-v1, settled win/loss, with factor contributions): ${summary.predictionCountEligible || 0}`);
  if (summary.overall.sampleSize > 0) {
    lines.push(`Combined Brier: ${formatBrier(summary.overall.brierScore)} (market baseline ~${MARKET_BASELINE_BRIER})`);
    lines.push(`Combined Log Loss: ${formatBrier(summary.overall.logLoss)}`);
  } else {
    lines.push('No eligible settled multi-factor-v1 predictions yet — calibration cannot be computed. The note below is an empty-state placeholder; rerun once predictions settle.');
  }

  const top = summary.icTable.slice(0, 5);
  const bottom = [...summary.icTable]
    .sort((a, b) => Math.abs(a.ic) - Math.abs(b.ic))
    .slice(0, 5);
  if (top.length) {
    lines.push('');
    lines.push('Top factors by |IC|:');
    for (const row of top) {
      lines.push(`  - ${row.sport} / ${row.factorId}: IC=${formatIc(row.ic)} (n=${row.sampleSize})`);
    }
  }
  if (bottom.length && bottom !== top) {
    lines.push('');
    lines.push('Lowest-impact factors by |IC|:');
    for (const row of bottom) {
      lines.push(`  - ${row.sport} / ${row.factorId}: IC=${formatIc(row.ic)} (n=${row.sampleSize})`);
    }
  }

  if (summary.miscalibrationAlerts.length) {
    lines.push('');
    lines.push('Miscalibration alerts:');
    for (const alert of summary.miscalibrationAlerts) {
      if (alert.kind === 'brier_above_market_baseline') {
        lines.push(`  - ${alert.sport}: Brier ${formatBrier(alert.value)} exceeds market baseline ${alert.threshold}`);
      } else {
        lines.push(`  - ${alert.sport}: bucket ${alert.bucket} off-diagonal by ${formatPercent(alert.deviation * 100)} (n=${alert.count})`);
      }
    }
  }

  if (Object.keys(summary.modelVersionCoverage || {}).length) {
    lines.push('');
    lines.push('Model version coverage among eligible rows:');
    for (const [version, count] of Object.entries(summary.modelVersionCoverage)) {
      lines.push(`  - ${version}: ${count}`);
    }
  }
  return lines;
}

// ── signal collection ───────────────────────────────────────────────────────

function collectSignals(summary) {
  const signals = [];
  if (summary.miscalibrationAlerts.length > 0) signals.push('sports_calibration_miscalibrated');
  if (summary.predictionCountEligible === 0) signals.push('sports_calibration_no_eligible_rows');
  if (Object.keys(summary.weightRecommendations).length > 0) signals.push('sports_calibration_weight_update_available');
  return signals;
}

// ── small utilities ─────────────────────────────────────────────────────────

function parseProbability(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const p = n > 1 ? n / 100 : n;
  if (p <= 0 || p >= 1) return null;
  return p;
}

function normalizeResult(value) {
  const v = String(value || '').trim().toLowerCase();
  if (['w', 'won', 'win', '1', 'true'].includes(v)) return 'win';
  if (['l', 'lost', 'loss', '0', 'false'].includes(v)) return 'loss';
  if (['p', 'push', 'void', 'refund'].includes(v)) return 'push';
  return 'pending';
}

function numericOrNull(value) {
  if (value === undefined || value === null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function groupBy(rows, keyFn) {
  const out = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!out.has(key)) out.set(key, []);
    out.get(key).push(row);
  }
  return out;
}

function countByField(rows, field) {
  const out = {};
  for (const row of rows) {
    const k = row[field] || '(unknown)';
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}

function maxAbsDeviation(bins) {
  if (!Array.isArray(bins) || bins.length === 0) return 0;
  return bins.reduce((max, bin) => {
    if (bin.deviation === null) return max;
    return Math.max(max, Math.abs(bin.deviation));
  }, 0);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value, decimals) {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

function formatBrier(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  return value.toFixed(4);
}

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  return `${value.toFixed(2)}%`;
}

function formatIc(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  return value.toFixed(4);
}

function formatRecommendation(entry, recommendationsBySport) {
  const sportRecs = recommendationsBySport[entry.sport];
  if (!sportRecs || sportRecs[entry.factorId] === undefined) return '—';
  return sportRecs[entry.factorId].toFixed(3);
}

// ── CSV parsing (RFC 4180-ish; matches sports-backtest.mjs style) ───────────

function parseCsv(raw) {
  const records = parseCsvRecords(raw);
  if (records.length === 0) return [];
  const headers = records[0].map(h => h.trim());
  const rows = [];
  for (const record of records.slice(1)) {
    if (record.every(cell => cell.trim() === '')) continue;
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = record[idx] ?? '';
    });
    rows.push(row);
  }
  return rows;
}

function parseCsvRecords(raw) {
  const records = [];
  let record = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    const next = raw[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') { field += '"'; i++; }
      else { inQuotes = !inQuotes; }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      record.push(field);
      field = '';
      continue;
    }
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i++;
      record.push(field);
      records.push(record);
      record = [];
      field = '';
      continue;
    }
    field += ch;
  }
  if (field.length > 0 || record.length > 0) {
    record.push(field);
    records.push(record);
  }
  return records;
}

// Re-export for tests so they can use the shared computation without any I/O.
export { computeCalibration };

// Test seam: lets unit tests feed in synthetic rows without touching disk.
export function summarizeFromRows(rows, registryParam = registry) {
  return summarizeCalibration(rows, registryParam);
}
