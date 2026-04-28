/**
 * Tests for lib/technical-indicators.mjs - pure math, no I/O.
 */

import assert from 'node:assert/strict';
import {
  computeBollinger,
  computeEMA,
  computeMACD,
  computeRSI,
  computeSMA,
  maxDrawdown,
  normalizePriceSeries,
  percentChange,
  realizedVolatility,
} from '../lib/technical-indicators.mjs';

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

function bars(closes) {
  return closes.map((close, index) => ({
    date: `2026-01-${String(index + 1).padStart(2, '0')}`,
    open: close - 0.5,
    high: close + 1,
    low: close - 1,
    close,
    volume: 1000 + index,
  }));
}

runTest('normalizePriceSeries sorts ascending and ignores missing close', () => {
  const rows = normalizePriceSeries([
    { date: '2026-01-03', close: 3 },
    { date: '2026-01-01', close: 1 },
    { date: '2026-01-02', close: null },
  ]);
  assert.deepEqual(rows.map(row => row.date), ['2026-01-01', '2026-01-03']);
});

runTest('SMA and EMA return finite values on enough bars', () => {
  const rows = bars([1, 2, 3, 4, 5]);
  assert.equal(computeSMA(rows, 3), 4);
  assert.ok(Number.isFinite(computeEMA(rows, 3)));
});

runTest('RSI rises on persistent gains', () => {
  const rows = bars(Array.from({ length: 25 }, (_, index) => index + 10));
  assert.ok(computeRSI(rows, 14) > 90);
});

runTest('MACD detects positive trend on rising series', () => {
  const rows = bars(Array.from({ length: 60 }, (_, index) => 20 + index + index * index * 0.03));
  const macd = computeMACD(rows);
  assert.ok(macd.macd > 0);
  assert.ok(['positive', 'bullish_cross'].includes(macd.crossover));
});

runTest('Bollinger position is between lower and upper band', () => {
  const rows = bars(Array.from({ length: 30 }, (_, index) => 100 + Math.sin(index)));
  const band = computeBollinger(rows, 20);
  assert.ok(band.position >= 0 && band.position <= 1);
});

runTest('percentChange computes lookback percent', () => {
  const rows = bars([100, 102, 105, 110]);
  assert.equal(Number(percentChange(rows, 3).toFixed(2)), 10);
});

runTest('maxDrawdown reports worst peak-to-trough loss percent', () => {
  const rows = bars([100, 120, 90, 95]);
  assert.equal(Number(maxDrawdown(rows).toFixed(2)), -25);
});

runTest('realizedVolatility is finite for moving series', () => {
  const rows = bars(Array.from({ length: 40 }, (_, index) => 100 + index + Math.sin(index)));
  assert.ok(Number.isFinite(realizedVolatility(rows, 30)));
});
