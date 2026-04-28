/**
 * sports-backtest.mjs - deterministic local sports betting ledger backtest
 *
 * Usage:
 *   node run.mjs pull sports-backtest --init-ledger
 *   node run.mjs pull sports-backtest --ledger scripts/.cache/sports/backtests/sample-ledger.csv
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { basename, dirname, join, relative, resolve } from 'path';
import { getPullsDir, getVaultRoot } from '../lib/config.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';

const BACKTEST_CACHE_DIR = join(getVaultRoot(), 'scripts', '.cache', 'sports', 'backtests');
const SAMPLE_LEDGER_PATH = join(BACKTEST_CACHE_DIR, 'sample-ledger.csv');
const DEFAULT_PAPER_BANKROLL = 1000;
const DEFAULT_PAPER_UNIT = 10;
const SAMPLE_LEDGER = `date,sport,league,event,market,selection,odds_decimal,model_probability,result,stake,closing_odds_decimal,notes
2026-04-01,baseball,MLB,Example A @ Example B,home_away,Example B,1.91,0.55,win,1,1.83,Sample positive edge
2026-04-02,basketball,NBA,Example C @ Example D,home_away,Example C,2.25,0.42,loss,1,2.10,Sample underdog edge
2026-04-03,ice-hockey,NHL,Example E @ Example F,home_away,Example F,1.80,0.54,push,1,1.78,Sample push
`;

export async function pull(flags = {}) {
  if (flags['init-ledger']) {
    mkdirSync(dirname(SAMPLE_LEDGER_PATH), { recursive: true });
    writeFileSync(SAMPLE_LEDGER_PATH, SAMPLE_LEDGER, 'utf8');
    console.log(`Sports backtest sample ledger: ${SAMPLE_LEDGER_PATH}`);
    return { filePath: SAMPLE_LEDGER_PATH, signals: [] };
  }

  if (!flags.ledger) {
    throw new Error('sports-backtest requires --ledger <csv>. Use --init-ledger to create a template.');
  }

  const ledgerPath = resolveLedgerPath(String(flags.ledger), flags);
  const paper = resolvePaperTracker(flags);
  const rows = parseCsv(readFileSync(ledgerPath, 'utf8')).map(normalizeLedgerRow);
  const settled = rows.filter(row => row.result !== 'pending');
  if (rows.length === 0) throw new Error(`No rows found in ${ledgerPath}`);

  const summary = summarizeBacktest(rows, settled, paper);
  const byMarket = groupSummaries(settled, row => `${row.sport} / ${row.league} / ${row.market}`);
  const byConfidence = groupSummaries(settled, row => confidenceBucket(row.confidenceScore));
  const byWeather = groupSummaries(settled, row => row.weatherRisk || 'Unknown');
  const byAvailability = groupSummaries(settled, row => row.availabilityQuality || 'Unknown');
  const byVenue = groupSummaries(settled, row => row.venueBucket || 'Unknown');
  const byEdge = groupSummaries(settled, row => edgeBucket(row.edge));
  const topEdges = [...rows].sort((a, b) => b.edge - a.edge).slice(0, 20);
  const worstSettled = [...settled].sort((a, b) => a.pnl - b.pnl).slice(0, 10);

  const note = buildBacktestNote({
    ledgerPath,
    rows,
    settled,
    summary,
    byMarket,
    byConfidence,
    byWeather,
    byAvailability,
    byVenue,
    byEdge,
    topEdges,
    worstSettled,
    paper,
  });
  const label = `Sports_Backtest_${sanitizeFilename(basename(ledgerPath, '.csv'))}`;
  const filePath = join(getPullsDir(), 'Sports', dateStampedFilename(label));

  const signals = collectBacktestSignals(summary);

  if (flags['dry-run']) {
    console.log(`[dry-run] Would write: ${filePath}`);
    console.log(JSON.stringify(summary, null, 2));
    return { filePath: null, summary, signals };
  }

  writeNote(filePath, note);
  console.log(`Sports backtest wrote: ${filePath}`);
  return { filePath, summary, signals };
}

function collectBacktestSignals(summary) {
  const signals = [];
  if (summary.roi < 0) signals.push('sports_backtest_negative_roi');
  if (summary.miscalibrated) signals.push('sports_backtest_miscalibrated');
  return signals;
}

function resolveLedgerPath(value, flags) {
  const resolved = resolve(getVaultRoot(), value);
  if (!resolved.startsWith(getVaultRoot()) && !flags['allow-outside-vault']) {
    throw new Error('Ledger path must be inside the vault unless --allow-outside-vault is set.');
  }
  if (!existsSync(resolved)) throw new Error(`Ledger not found: ${resolved}`);
  return resolved;
}

function normalizeLedgerRow(row) {
  const snapshot = parseSnapshot(row.variable_snapshot);
  const oddsDecimal = parseOdds(row.odds_decimal || row.odds || row.decimal_odds, row.odds_american || row.american_odds);
  const probability = parseProbability(row.model_probability || row.probability || row.p);
  const stake = parseOptionalNumber(row.stake, 1);
  const closingOdds = row.closing_odds_decimal || row.closing_odds
    ? parseOdds(row.closing_odds_decimal || row.closing_odds, row.closing_odds_american)
    : null;
  const result = normalizeResult(row.result || row.outcome);

  const impliedProbability = 1 / oddsDecimal;
  const edge = probability - impliedProbability;
  const expectedValue = stake * ((probability * (oddsDecimal - 1)) - (1 - probability));
  const pnl = result === 'win' ? stake * (oddsDecimal - 1)
    : result === 'loss' ? -stake
      : 0;
  const clv = closingOdds ? ((oddsDecimal / closingOdds) - 1) * 100 : null;

  return {
    date: requireText(row.date, 'date'),
    sport: row.sport || '',
    league: row.league || '',
    event: requireText(row.event, 'event'),
    market: requireText(row.market, 'market'),
    selection: requireText(row.selection, 'selection'),
    oddsDecimal,
    probability,
    impliedProbability,
    edge,
    expectedValue,
    result,
    stake,
    pnl,
    closingOdds,
    clv,
    confidenceScore: parseOptionalNumber(row.confidence_score || snapshot.confidence_score, null),
    weatherRisk: snapshot.weather_risk || row.weather_risk || '',
    availabilityQuality: snapshot.availability_quality || row.availability_quality || '',
    venue: snapshot.venue || row.venue || '',
    environment: snapshot.environment || row.environment || '',
    venueBucket: venueBucket(snapshot, row),
    snapshot,
    notes: row.notes || '',
  };
}

function summarizeBacktest(rows, settled, paper = { bankroll: DEFAULT_PAPER_BANKROLL, unit: DEFAULT_PAPER_UNIT }) {
  const totalStake = sum(settled, row => row.stake);
  const totalPnl = sum(settled, row => row.pnl);
  const wins = settled.filter(row => row.result === 'win').length;
  const losses = settled.filter(row => row.result === 'loss').length;
  const pushes = settled.filter(row => row.result === 'push').length;
  const avgEdge = average(rows, row => row.edge);
  const avgEv = average(rows, row => row.expectedValue);
  const avgClv = average(settled.filter(row => row.clv !== null), row => row.clv);
  const paperPnl = totalPnl * paper.unit;
  const calibration = computeCalibration(settled);

  return {
    rows: rows.length,
    settled: settled.length,
    pending: rows.length - settled.length,
    wins,
    losses,
    pushes,
    totalStake,
    totalPnl,
    roi: totalStake ? (totalPnl / totalStake) * 100 : 0,
    hitRate: wins + losses ? (wins / (wins + losses)) * 100 : 0,
    averageEdge: avgEdge * 100,
    averageExpectedValue: avgEv,
    averageClv: avgClv,
    brierScore: calibration.brierScore,
    logLoss: calibration.logLoss,
    reliabilityBins: calibration.reliabilityBins,
    miscalibrated: calibration.miscalibrated,
    calibrationSampleSize: calibration.sampleSize,
    paperBankroll: paper.bankroll,
    paperUnit: paper.unit,
    paperStake: totalStake * paper.unit,
    paperPnl,
    paperEndingBankroll: paper.bankroll + paperPnl,
    paperBankrollReturn: paper.bankroll ? (paperPnl / paper.bankroll) * 100 : 0,
  };
}

const RELIABILITY_BUCKET_COUNT = 10;
const MISCALIBRATION_SAMPLE_FLOOR = 30;
const MISCALIBRATION_DEVIATION = 0.10;
const LOG_LOSS_CLAMP = 1e-9;

export function computeCalibration(settled) {
  const labelled = settled
    .filter(row => row.result === 'win' || row.result === 'loss')
    .map(row => ({
      probability: row.probability,
      outcome: row.result === 'win' ? 1 : 0,
    }));

  if (labelled.length === 0) {
    return {
      brierScore: null,
      logLoss: null,
      reliabilityBins: [],
      miscalibrated: false,
      sampleSize: 0,
    };
  }

  const brierScore = labelled.reduce(
    (acc, row) => acc + (row.probability - row.outcome) ** 2,
    0,
  ) / labelled.length;

  const logLoss = -labelled.reduce((acc, row) => {
    const p = Math.min(Math.max(row.probability, LOG_LOSS_CLAMP), 1 - LOG_LOSS_CLAMP);
    return acc + (row.outcome === 1 ? Math.log(p) : Math.log(1 - p));
  }, 0) / labelled.length;

  const buckets = Array.from({ length: RELIABILITY_BUCKET_COUNT }, (_, i) => ({
    lower: i / RELIABILITY_BUCKET_COUNT,
    upper: (i + 1) / RELIABILITY_BUCKET_COUNT,
    count: 0,
    predictedSum: 0,
    observedSum: 0,
  }));

  for (const row of labelled) {
    const idx = Math.min(
      Math.floor(row.probability * RELIABILITY_BUCKET_COUNT),
      RELIABILITY_BUCKET_COUNT - 1,
    );
    buckets[idx].count += 1;
    buckets[idx].predictedSum += row.probability;
    buckets[idx].observedSum += row.outcome;
  }

  const reliabilityBins = buckets.map(bucket => ({
    lower: bucket.lower,
    upper: bucket.upper,
    count: bucket.count,
    meanPredicted: bucket.count ? bucket.predictedSum / bucket.count : null,
    observedRate: bucket.count ? bucket.observedSum / bucket.count : null,
    deviation: bucket.count
      ? (bucket.observedSum / bucket.count) - (bucket.predictedSum / bucket.count)
      : null,
  }));

  const miscalibrated = reliabilityBins.some(
    bin => bin.count >= MISCALIBRATION_SAMPLE_FLOOR
      && bin.deviation !== null
      && Math.abs(bin.deviation) > MISCALIBRATION_DEVIATION,
  );

  return {
    brierScore,
    logLoss,
    reliabilityBins,
    miscalibrated,
    sampleSize: labelled.length,
  };
}

function groupSummaries(rows, keyFn) {
  const groups = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  return [...groups.entries()]
    .map(([key, groupRows]) => ({ key, ...summarizeBacktest(groupRows, groupRows) }))
    .sort((a, b) => b.totalPnl - a.totalPnl);
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

function confidenceBucket(value) {
  if (!Number.isFinite(value)) return 'Unknown';
  if (value < 25) return '00-24';
  if (value < 50) return '25-49';
  if (value < 75) return '50-74';
  return '75-100';
}

function edgeBucket(edge) {
  if (!Number.isFinite(edge)) return 'Unknown';
  const pct = edge * 100;
  if (pct < -2) return '< -2.00%';
  if (pct < -1) return '-2.00% to -1.00%';
  if (pct < 0) return '-1.00% to 0.00%';
  if (pct < 0.5) return '0.00% to 0.50%';
  if (pct < 1) return '0.50% to 1.00%';
  if (pct < 2) return '1.00% to 2.00%';
  return '>= 2.00%';
}

function venueBucket(snapshot, row) {
  const environment = snapshot.environment || row.environment || '';
  const venue = snapshot.venue || row.venue || '';
  if (environment) return environment;
  if (!venue) return '';
  if (/indoor|dome|covered/i.test(venue)) return 'Indoor/controlled';
  if (/outdoor|stadium|field|park/i.test(venue)) return 'Outdoor';
  return venue;
}

function buildBacktestNote({
  ledgerPath,
  rows,
  settled,
  summary,
  byMarket,
  byConfidence,
  byWeather,
  byAvailability,
  byVenue,
  byEdge,
  topEdges,
  worstSettled,
  paper,
}) {
  return buildNote({
    frontmatter: {
      title: `Sports Backtest - ${basename(ledgerPath)}`,
      source: 'Local sports betting ledger',
      date_pulled: today(),
      domain: 'sports',
      data_type: 'sports_backtest',
      frequency: 'on-demand',
      signal_status: summary.roi < 0 || summary.miscalibrated ? 'watch' : 'clear',
      signals: collectBacktestSignals(summary),
      row_count: summary.rows,
      settled_count: summary.settled,
      pending_count: summary.pending,
      roi: round(summary.roi, 4),
      hit_rate: round(summary.hitRate, 4),
      average_edge: round(summary.averageEdge, 4),
      average_clv: summary.averageClv === null ? null : round(summary.averageClv, 4),
      brier_score: summary.brierScore === null ? null : round(summary.brierScore, 6),
      log_loss: summary.logLoss === null ? null : round(summary.logLoss, 6),
      tags: ['sports', 'backtest', 'betting-ledger'],
    },
    sections: [
      {
        heading: 'Executive Summary',
        content: [
          `Ledger: ${relative(getVaultRoot(), ledgerPath)}`,
          `Rows: ${summary.rows}`,
          `Settled: ${summary.settled}`,
          `Pending: ${summary.pending}`,
          `P/L: ${formatMoney(summary.totalPnl)} on ${formatMoney(summary.totalStake)} staked`,
          `ROI: ${formatPercent(summary.roi)}`,
          `Hit rate: ${formatPercent(summary.hitRate)}`,
          `Average model edge: ${formatPercent(summary.averageEdge)}`,
          `Average expected value per bet: ${formatMoney(summary.averageExpectedValue)}`,
          `Average CLV: ${summary.averageClv === null ? 'N/A' : formatPercent(summary.averageClv)}`,
          `Brier score: ${formatBrier(summary.brierScore)} (n=${summary.calibrationSampleSize}; lower is better, market 50/50 baseline ~0.250)`,
          `Log loss: ${formatBrier(summary.logLoss)} (lower is better, baseline ~0.693 for uninformative model)`,
          `Calibration: ${summary.miscalibrated ? 'WATCH - one or more buckets deviate >10% from diagonal with n>=30' : 'within tolerance'}`,
        ].join('\n'),
      },
      {
        heading: 'Calibration (Reliability Buckets)',
        content: summary.calibrationSampleSize > 0
          ? buildTable(['Bucket', 'n', 'Mean Predicted', 'Observed Win Rate', 'Deviation'], summary.reliabilityBins.map(bin => [
            `[${(bin.lower * 100).toFixed(0)}%-${(bin.upper * 100).toFixed(0)}%)`,
            bin.count,
            bin.meanPredicted === null ? 'N/A' : formatPercent(bin.meanPredicted * 100),
            bin.observedRate === null ? 'N/A' : formatPercent(bin.observedRate * 100),
            bin.deviation === null ? 'N/A' : formatPercent(bin.deviation * 100),
          ]))
          : 'No win/loss settled rows yet; calibration cannot be computed.',
      },
      {
        heading: 'Paper Money Tracker',
        content: [
          `Starting paper bankroll: ${formatPaper(summary.paperBankroll)}`,
          `Paper unit size: ${formatPaper(paper.unit)} per ledger stake unit`,
          `Paper stake settled: ${formatPaper(summary.paperStake)}`,
          `Paper P/L: ${formatPaper(summary.paperPnl)}`,
          `Ending paper bankroll: ${formatPaper(summary.paperEndingBankroll)}`,
          `Paper bankroll return: ${formatPercent(summary.paperBankrollReturn)}`,
          '',
          'This is fake-money tracking only. The ledger `stake` field is treated as paper units for calibration and process review.',
        ].join('\n'),
      },
      {
        heading: 'By Sport / League / Market',
        content: byMarket.length
          ? buildBacktestGroupTable(byMarket)
          : 'No settled rows available.',
      },
      {
        heading: 'By Confidence Bucket',
        content: byConfidence.length
          ? buildBacktestGroupTable(byConfidence)
          : 'No settled rows available.',
      },
      {
        heading: 'By Weather Risk',
        content: byWeather.length
          ? buildBacktestGroupTable(byWeather)
          : 'No settled rows available.',
      },
      {
        heading: 'By Availability Quality',
        content: byAvailability.length
          ? buildBacktestGroupTable(byAvailability)
          : 'No settled rows available.',
      },
      {
        heading: 'By Venue / Environment',
        content: byVenue.length
          ? buildBacktestGroupTable(byVenue)
          : 'No settled rows available.',
      },
      {
        heading: 'By Edge Bucket',
        content: byEdge.length
          ? buildBacktestGroupTable(byEdge)
          : 'No settled rows available.',
      },
      {
        heading: 'Top Model Edges',
        content: buildTable(['Date', 'Event', 'Market', 'Selection', 'Odds', 'Model P', 'Edge', 'EV', 'Result', 'P/L'], topEdges.map(row => [
          row.date,
          row.event,
          row.market,
          row.selection,
          row.oddsDecimal.toFixed(3),
          formatPercent(row.probability * 100),
          formatPercent(row.edge * 100),
          formatMoney(row.expectedValue),
          row.result,
          row.result === 'pending' ? 'Pending' : formatMoney(row.pnl),
        ])),
      },
      {
        heading: 'Worst Settled Bets',
        content: worstSettled.length
          ? buildTable(['Date', 'Event', 'Selection', 'Odds', 'Result', 'P/L', 'CLV', 'Notes'], worstSettled.map(row => [
            row.date,
            row.event,
            row.selection,
            row.oddsDecimal.toFixed(3),
            row.result,
            formatMoney(row.pnl),
            row.clv === null ? 'N/A' : formatPercent(row.clv),
            row.notes,
          ]))
          : 'No settled losses yet.',
      },
      {
        heading: 'Ledger Contract',
        content: [
          'Required columns: `date`, `event`, `market`, `selection`, `model_probability`, `result`, plus `odds_decimal` or `odds_american`.',
          'Optional columns: `sport`, `league`, `stake`, `closing_odds_decimal`, `closing_odds_american`, `notes`.',
          '`stake` is interpreted as paper units. Use `--paper-bankroll <amount>` and `--paper-unit <amount>` to change fake-money reporting scale.',
          'Result values: `win`, `loss`, `push`, or `pending`.',
          'This backtester does not load Python config files, model pickles, or third-party serialized objects.',
        ].join('\n'),
      },
    ],
  });
}

function buildBacktestGroupTable(groups) {
  return buildTable(['Bucket', 'Bets', 'P/L', 'ROI', 'Hit Rate', 'Avg Edge', 'Avg CLV', 'Brier'], groups.map(row => [
    row.key,
    row.settled,
    formatMoney(row.totalPnl),
    formatPercent(row.roi),
    formatPercent(row.hitRate),
    formatPercent(row.averageEdge),
    row.averageClv === null ? 'N/A' : formatPercent(row.averageClv),
    formatBrier(row.brierScore),
  ]));
}

function parseCsv(raw) {
  const rows = [];
  const records = parseCsvRecords(raw);
  if (records.length === 0) return rows;
  const headers = records[0].map(header => header.trim());
  for (const record of records.slice(1)) {
    if (record.every(cell => cell.trim() === '')) continue;
    const row = {};
    headers.forEach((header, index) => {
      row[header] = record[index] ?? '';
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

function parseOdds(decimalValue, americanValue) {
  if (decimalValue !== undefined && decimalValue !== '') {
    const parsed = Number(decimalValue);
    if (!Number.isFinite(parsed) || parsed <= 1) throw new Error(`Invalid decimal odds: ${decimalValue}`);
    return parsed;
  }

  const american = Number(americanValue);
  if (!Number.isFinite(american) || american === 0) throw new Error(`Invalid American odds: ${americanValue}`);
  return american > 0 ? 1 + (american / 100) : 1 + (100 / Math.abs(american));
}

function parseProbability(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid model probability: ${value}`);
  const probability = parsed > 1 ? parsed / 100 : parsed;
  if (probability <= 0 || probability >= 1) throw new Error(`Model probability must be between 0 and 1: ${value}`);
  return probability;
}

function parseOptionalNumber(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid number: ${value}`);
  return parsed;
}

function resolvePaperTracker(flags) {
  return {
    bankroll: parsePositiveNumber(flags['paper-bankroll'], DEFAULT_PAPER_BANKROLL, '--paper-bankroll'),
    unit: parsePositiveNumber(flags['paper-unit'], DEFAULT_PAPER_UNIT, '--paper-unit'),
  };
}

function parsePositiveNumber(value, fallback, label) {
  if (value === undefined || value === null || value === true) return fallback;
  const parsed = Number(String(value));
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`${label} must be a positive number`);
  return parsed;
}

function normalizeResult(value) {
  const normalized = String(value || 'pending').trim().toLowerCase();
  if (['w', 'won', 'win', '1', 'true'].includes(normalized)) return 'win';
  if (['l', 'lost', 'loss', '0', 'false'].includes(normalized)) return 'loss';
  if (['p', 'push', 'void', 'refund'].includes(normalized)) return 'push';
  if (['pending', 'open', ''].includes(normalized)) return 'pending';
  throw new Error(`Invalid result: ${value}`);
}

function requireText(value, field) {
  const text = String(value || '').trim();
  if (!text) throw new Error(`Ledger row missing required field: ${field}`);
  return text;
}

function sum(rows, fn) {
  return rows.reduce((total, row) => total + fn(row), 0);
}

function average(rows, fn) {
  return rows.length ? sum(rows, fn) / rows.length : null;
}

function formatMoney(value) {
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

function formatBrier(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  return value.toFixed(4);
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
