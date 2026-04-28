/**
 * Tests for computeCalibration() in sports-backtest.mjs.
 * Pure function over an array of {probability, result} rows. No I/O.
 */

import assert from 'node:assert/strict';
import { computeCalibration } from '../pullers/sports-backtest.mjs';

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

const APPROX = 1e-6;
function approxEqual(a, b, tol = APPROX) {
  return Math.abs(a - b) <= tol;
}

function row(probability, result) {
  return { probability, result };
}

// ── empty / no-label cases ───────────────────────────────────────────────────

runTest('empty input: returns nulls and zero sample size', () => {
  const out = computeCalibration([]);
  assert.equal(out.brierScore, null);
  assert.equal(out.logLoss, null);
  assert.equal(out.sampleSize, 0);
  assert.equal(out.miscalibrated, false);
  assert.deepEqual(out.reliabilityBins, []);
});

runTest('all pushes/pending: ignored, returns nulls', () => {
  const out = computeCalibration([
    row(0.6, 'push'),
    row(0.4, 'pending'),
  ]);
  assert.equal(out.sampleSize, 0);
  assert.equal(out.brierScore, null);
});

// ── Brier score sanity ─────────────────────────────────────────────────────

runTest('Brier: a perfect predictor scores 0', () => {
  const out = computeCalibration([
    row(1.0 - 1e-9, 'win'),
    row(1e-9, 'loss'),
  ]);
  assert.ok(out.brierScore < 1e-6);
});

runTest('Brier: a uniformly 0.5 predictor on a balanced sample scores 0.25', () => {
  const out = computeCalibration([
    row(0.5, 'win'),
    row(0.5, 'win'),
    row(0.5, 'loss'),
    row(0.5, 'loss'),
  ]);
  assert.ok(approxEqual(out.brierScore, 0.25));
});

runTest('Brier: a max-wrong predictor scores 1', () => {
  const out = computeCalibration([
    row(1.0 - 1e-9, 'loss'),
    row(1e-9, 'win'),
  ]);
  assert.ok(out.brierScore > 1 - 1e-6);
});

// ── Log loss sanity ──────────────────────────────────────────────────────────

runTest('LogLoss: a uniformly 0.5 predictor scores ~ln(2) (~0.6931)', () => {
  const out = computeCalibration([
    row(0.5, 'win'),
    row(0.5, 'loss'),
  ]);
  assert.ok(approxEqual(out.logLoss, Math.log(2), 1e-6));
});

runTest('LogLoss: clamps probabilities so 1.0/0.0 do not blow up', () => {
  const out = computeCalibration([
    row(1.0, 'win'),
    row(0.0, 'loss'),
  ]);
  assert.ok(Number.isFinite(out.logLoss));
  assert.ok(out.logLoss < 1e-6);
});

// ── Reliability bins ─────────────────────────────────────────────────────────

runTest('reliability bins: places probabilities in correct buckets', () => {
  const out = computeCalibration([
    row(0.05, 'win'),
    row(0.15, 'loss'),
    row(0.95, 'win'),
  ]);
  assert.equal(out.reliabilityBins.length, 10);
  assert.equal(out.reliabilityBins[0].count, 1);
  assert.equal(out.reliabilityBins[1].count, 1);
  assert.equal(out.reliabilityBins[9].count, 1);
});

runTest('reliability bins: probability of exactly 1.0 falls in the top bucket', () => {
  const out = computeCalibration([row(1.0, 'win')]);
  assert.equal(out.reliabilityBins[9].count, 1);
});

runTest('reliability bins: deviation is observed - predicted', () => {
  const out = computeCalibration(
    Array.from({ length: 10 }, () => row(0.55, 'win'))
  );
  const bin = out.reliabilityBins[5];
  assert.equal(bin.count, 10);
  assert.ok(approxEqual(bin.meanPredicted, 0.55));
  assert.ok(approxEqual(bin.observedRate, 1.0));
  assert.ok(approxEqual(bin.deviation, 0.45));
});

// ── Miscalibration flag ─────────────────────────────────────────────────────

runTest('miscalibrated: false when all buckets are below sample floor (n<30)', () => {
  const out = computeCalibration(
    Array.from({ length: 10 }, () => row(0.55, 'win'))
  );
  assert.equal(out.miscalibrated, false);
});

runTest('miscalibrated: true when a populated bucket deviates >10% from diagonal', () => {
  const out = computeCalibration(
    Array.from({ length: 50 }, () => row(0.55, 'win'))
  );
  assert.equal(out.miscalibrated, true);
});

runTest('miscalibrated: false for a well-calibrated bucket at n>=30', () => {
  const rows = [
    ...Array.from({ length: 27 }, () => row(0.55, 'win')),
    ...Array.from({ length: 23 }, () => row(0.55, 'loss')),
  ];
  const out = computeCalibration(rows);
  assert.equal(out.miscalibrated, false);
});
