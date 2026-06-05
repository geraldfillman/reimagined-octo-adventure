import { CONFIDENCE, withProvenance } from './positioning-provenance.mjs';

export function calculateCotPositioning(rows = [], {
  market,
  category = 'leveraged_funds',
  window = 156,
} = {}) {
  const filtered = rows
    .filter(row => !market || String(row.market || row.market_and_exchange_names || '').toLowerCase().includes(String(market).toLowerCase()))
    .map(row => normalizeRow(row, category))
    .filter(row => row.open_interest > 0)
    .sort((a, b) => String(b.report_date).localeCompare(String(a.report_date)))
    .slice(0, window);

  const latest = filtered[0] ?? null;
  const history = [...filtered].reverse();
  const values = history.map(row => row.net_pct_oi);
  const mean = average(values);
  const sd = standardDeviation(values, mean);
  const latestWithZ = latest ? {
    ...latest,
    positioning_z: sd ? (latest.net_pct_oi - mean) / sd : 0,
  } : null;

  return withProvenance({
    market: market ?? latest?.market ?? '',
    category,
    latest: latestWithZ,
    crowding_extreme_flag: latestWithZ ? Math.abs(latestWithZ.positioning_z) >= 2 : false,
    observations: filtered.length,
  }, {
    sourceName: 'CFTC Commitments of Traders',
    asOfDate: latestWithZ?.report_date ?? '',
    signalConfidence: CONFIDENCE.observed,
    knownLimitations: [
      'COT is weekly and aggregated by trader category.',
      'Category-level futures positioning can hide cross-market hedges and basis trades.',
    ],
  });
}

function normalizeRow(row, category) {
  const prefix = category;
  const long = Number(row[`${prefix}_long`] ?? row[`${prefix}_long_all`] ?? row.long) || 0;
  const short = Number(row[`${prefix}_short`] ?? row[`${prefix}_short_all`] ?? row.short) || 0;
  const openInterest = Number(row.open_interest ?? row.open_interest_all) || 0;
  const net = long - short;
  return {
    market: row.market || row.market_and_exchange_names || '',
    report_date: row.report_date || row.report_date_as_yyyy_mm_dd || row.date || '',
    long,
    short,
    net,
    open_interest: openInterest,
    net_pct_oi: openInterest ? net / openInterest : 0,
  };
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values, mean) {
  if (values.length < 2) return 0;
  const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}
