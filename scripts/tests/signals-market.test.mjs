import assert from 'node:assert/strict';

import {
  evaluatePutCallRatio,
  evaluateVIXTermStructure,
} from '../lib/signals/market.mjs';

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

// --- evaluatePutCallRatio ---

await runTest('evaluatePutCallRatio returns alert when ratio is above 1.2 (extreme fear)', () => {
  const signal = evaluatePutCallRatio(1.35);

  assert.ok(signal !== null, 'should return a signal');
  assert.equal(signal.severity, 'alert');
  assert.equal(signal.id, 'PUT_CALL_EXTREME_FEAR');
  assert.equal(signal.domain, 'market');
  assert.equal(signal.value, 1.35);
  assert.equal(signal.threshold, 1.2);
  assert.ok(Object.isFrozen(signal), 'signal should be frozen');
});

await runTest('evaluatePutCallRatio returns alert when ratio is below 0.5 (extreme greed)', () => {
  const signal = evaluatePutCallRatio(0.4);

  assert.ok(signal !== null);
  assert.equal(signal.severity, 'alert');
  assert.equal(signal.id, 'PUT_CALL_EXTREME_GREED');
  assert.equal(signal.threshold, 0.5);
});

await runTest('evaluatePutCallRatio returns watch when ratio is elevated (0.9 to 1.2)', () => {
  const signal = evaluatePutCallRatio(1.0);

  assert.ok(signal !== null);
  assert.equal(signal.severity, 'watch');
  assert.equal(signal.id, 'PUT_CALL_ELEVATED_FEAR');
});

await runTest('evaluatePutCallRatio returns watch when ratio is low (0.5 to 0.6)', () => {
  const signal = evaluatePutCallRatio(0.55);

  assert.ok(signal !== null);
  assert.equal(signal.severity, 'watch');
  assert.equal(signal.id, 'PUT_CALL_LOW_HEDGING');
});

await runTest('evaluatePutCallRatio returns null for normal ratio (0.6 to 0.9)', () => {
  const signal = evaluatePutCallRatio(0.75);
  assert.equal(signal, null);
});

await runTest('evaluatePutCallRatio returns null when ratio is null', () => {
  assert.equal(evaluatePutCallRatio(null), null);
});

await runTest('evaluatePutCallRatio returns null when ratio is undefined', () => {
  assert.equal(evaluatePutCallRatio(undefined), null);
});

await runTest('evaluatePutCallRatio handles boundary at exactly 1.2 (alert threshold)', () => {
  // ratio > 1.2 triggers extreme fear; ratio === 1.2 does not
  const atBoundary = evaluatePutCallRatio(1.2);
  // 1.2 is not > 1.2 but IS > 0.9, so should be watch
  assert.ok(atBoundary !== null);
  assert.equal(atBoundary.severity, 'watch');
});

// --- evaluateVIXTermStructure ---

await runTest('evaluateVIXTermStructure returns alert signal for backwardation (slope < -2)', () => {
  // VIX = 30, VIX3M = 25 → slope = 25 - 30 = -5 (deep backwardation)
  const signal = evaluateVIXTermStructure(30, 25);

  assert.ok(signal !== null, 'should return a signal');
  assert.equal(signal.severity, 'alert');
  assert.equal(signal.id, 'VIX_BACKWARDATION');
  assert.equal(signal.domain, 'market');
  assert.ok(signal.value < -2, 'value should be the slope (< -2)');
  assert.equal(signal.threshold, -2);
  assert.ok(Object.isFrozen(signal), 'signal should be frozen');
});

await runTest('evaluateVIXTermStructure returns watch signal for mild inversion (-2 <= slope < 0)', () => {
  // VIX = 22, VIX3M = 21 → slope = -1 (slightly inverted)
  const signal = evaluateVIXTermStructure(22, 21);

  assert.ok(signal !== null);
  assert.equal(signal.severity, 'watch');
  assert.equal(signal.id, 'VIX_FLAT_TERM');
  assert.ok(signal.value >= -2 && signal.value < 0);
});

await runTest('evaluateVIXTermStructure returns null when term structure is normal (slope >= 0)', () => {
  // VIX = 18, VIX3M = 22 → slope = 4 (contango — normal)
  const signal = evaluateVIXTermStructure(18, 22);
  assert.equal(signal, null);
});

await runTest('evaluateVIXTermStructure returns null when vix is null', () => {
  assert.equal(evaluateVIXTermStructure(null, 22), null);
});

await runTest('evaluateVIXTermStructure returns null when vix3m is null', () => {
  assert.equal(evaluateVIXTermStructure(20, null), null);
});

await runTest('evaluateVIXTermStructure returns null when both inputs are null', () => {
  assert.equal(evaluateVIXTermStructure(null, null), null);
});

await runTest('evaluateVIXTermStructure handles slope exactly at 0 (boundary)', () => {
  // VIX = 20, VIX3M = 20 → slope = 0 → not < 0 → null
  const signal = evaluateVIXTermStructure(20, 20);
  assert.equal(signal, null);
});

await runTest('evaluateVIXTermStructure handles slope exactly at -2 (boundary)', () => {
  // VIX = 22, VIX3M = 20 → slope = -2 → not < -2 → watch
  const signal = evaluateVIXTermStructure(22, 20);
  assert.ok(signal !== null);
  assert.equal(signal.severity, 'watch');
  assert.equal(signal.id, 'VIX_FLAT_TERM');
});
