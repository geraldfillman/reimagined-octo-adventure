import assert from 'node:assert/strict';

import {
  countThresholdDays,
  scoreShortStress,
} from '../lib/short-stress-model.mjs';

function runTest(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

runTest('short stress keeps short-sale volume separate from short interest', () => {
  const score = scoreShortStress({
    symbol: 'XYZ',
    shortInterest: { currentShortShares: 1_000_000, previousShortShares: 800_000, freeFloatShares: 10_000_000, averageDailyVolume: 500_000 },
    shortSaleVolume: { shortSaleVolume: 5_000_000, totalVolume: 10_000_000 },
    ftd: { quantityFails: 100_000 },
    thresholdDays: 3,
    gamma: { callGammaConcentration: 0.4 },
  });

  assert.equal(score.symbol, 'XYZ');
  assert.equal(score.metrics.short_interest_float_pct, 0.10);
  assert.equal(score.metrics.short_volume_share, 0.50);
  assert.notEqual(score.metrics.short_volume_share, score.metrics.short_interest_float_pct);
  assert.equal(score.signal_confidence, 'derived_medium_confidence');
});

runTest('missing borrow data lowers confidence and records a limitation', () => {
  const score = scoreShortStress({
    symbol: 'XYZ',
    shortInterest: { currentShortShares: 500_000, freeFloatShares: 10_000_000, averageDailyVolume: 1_000_000 },
  });

  assert.equal(score.signal_confidence, 'derived_low_confidence');
  assert.match(score.known_limitations.join(' '), /Borrow fee/);
});

runTest('threshold-day persistence counts consecutive dates through the as-of date', () => {
  const days = countThresholdDays([
    { symbol: 'XYZ', date: '2026-05-11', threshold_flag: true },
    { symbol: 'XYZ', date: '2026-05-12', threshold_flag: true },
    { symbol: 'XYZ', date: '2026-05-13', threshold_flag: true },
    { symbol: 'ABC', date: '2026-05-13', threshold_flag: true },
  ], 'XYZ', '2026-05-13');

  assert.equal(days, 3);
});
