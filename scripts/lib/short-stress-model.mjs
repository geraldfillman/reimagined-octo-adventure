import { CONFIDENCE, withProvenance } from './positioning-provenance.mjs';

export function scoreShortStress({
  symbol,
  shortInterest = {},
  shortSaleVolume = {},
  ftd = {},
  thresholdDays = 0,
  gamma = {},
  borrow = null,
} = {}) {
  const currentShortShares = num(shortInterest.currentShortShares ?? shortInterest.shortInterest);
  const previousShortShares = num(shortInterest.previousShortShares ?? shortInterest.shortPriorMonth);
  const freeFloatShares = num(shortInterest.freeFloatShares ?? shortInterest.floatShares);
  const averageDailyVolume = num(shortInterest.averageDailyVolume ?? shortInterest.averageDailyVolumeShares);
  const shortSaleVol = num(shortSaleVolume.shortSaleVolume);
  const totalVolume = num(shortSaleVolume.totalVolume);
  const quantityFails = num(ftd.quantityFails);

  const metrics = {
    short_interest_float_pct: ratio(currentShortShares, freeFloatShares),
    days_to_cover: ratio(currentShortShares, averageDailyVolume),
    short_interest_change_adv: previousShortShares ? ratio(currentShortShares - previousShortShares, averageDailyVolume) : null,
    short_volume_share: ratio(shortSaleVol, totalVolume),
    ftd_float: ratio(quantityFails, freeFloatShares),
    ftd_adv: ratio(quantityFails, averageDailyVolume),
    threshold_days: Number(thresholdDays) || 0,
    call_gamma_concentration: num(gamma.callGammaConcentration),
  };

  const score =
    bounded(metrics.short_interest_float_pct, 0.05, 0.30) +
    bounded(metrics.days_to_cover, 1, 10) +
    bounded(metrics.short_interest_change_adv, 0, 3) +
    bounded(metrics.ftd_float, 0.001, 0.05) +
    bounded(metrics.threshold_days, 1, 13) +
    bounded(metrics.call_gamma_concentration, 0.2, 0.8) +
    (borrow?.borrowFee ? bounded(num(borrow.borrowFee), 0.02, 1.0) : 0);

  const hasPublicStack = Boolean(currentShortShares && (quantityFails || thresholdDays || shortSaleVol || gamma.callGammaConcentration));
  const signalConfidence = borrow?.borrowFee
    ? CONFIDENCE.high
    : hasPublicStack
      ? CONFIDENCE.medium
      : CONFIDENCE.low;

  return withProvenance({
    symbol: String(symbol || '').toUpperCase(),
    metrics,
    score: Number(score.toFixed(2)),
    label: score >= 5 ? 'alert' : score >= 2 ? 'watch' : 'clear',
  }, {
    sourceName: 'Public short-stress proxy model',
    signalConfidence,
    knownLimitations: [
      'Daily short-sale volume is not short interest.',
      'FTDs are aggregate settlement fails, not daily new fails.',
      'Borrow fee and utilization are unavailable unless a paid/manual securities-lending source is connected.',
    ],
  });
}

export function countThresholdDays(rows = [], symbol, asOfDate) {
  const target = String(symbol || '').toUpperCase();
  const active = new Set(rows
    .filter(row => String(row.symbol || '').toUpperCase() === target && row.threshold_flag !== false)
    .map(row => row.date));
  let cursor = new Date(`${asOfDate}T00:00:00Z`);
  let count = 0;
  while (active.has(cursor.toISOString().slice(0, 10))) {
    count += 1;
    cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
  }
  return count;
}

function ratio(a, b) {
  return b ? a / b : null;
}

function num(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function bounded(value, low, high) {
  if (value == null || !Number.isFinite(Number(value))) return 0;
  if (value <= low) return 0;
  if (value >= high) return 1;
  return (value - low) / (high - low);
}
