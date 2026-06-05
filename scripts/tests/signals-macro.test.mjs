import assert from 'node:assert/strict';

import {
  evaluateYieldCurve,
  evaluateUnemploymentSpike,
} from '../lib/signals/macro.mjs';

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

// --- evaluateYieldCurve ---

await runTest('evaluateYieldCurve returns critical signal when spread < 0 (inverted)', () => {
  // 10Y at 4.0, 2Y at 4.5 → spread = -0.5 (inverted)
  const signal = evaluateYieldCurve(4.0, 4.5);

  assert.ok(signal !== null, 'should return a signal');
  assert.equal(signal.severity, 'critical');
  assert.equal(signal.id, 'YIELD_CURVE_INVERSION');
  assert.equal(signal.domain, 'macro');
  assert.ok(signal.value < 0, 'value should be the negative spread');
  assert.equal(signal.threshold, 0);
  assert.ok(Object.isFrozen(signal), 'signal should be frozen');
});

await runTest('evaluateYieldCurve returns watch signal when spread is between 0 and 0.5 (flattening)', () => {
  // 10Y at 4.2, 2Y at 4.0 → spread = 0.2 (flattening)
  const signal = evaluateYieldCurve(4.2, 4.0);

  assert.ok(signal !== null, 'should return a signal');
  assert.equal(signal.severity, 'watch');
  assert.equal(signal.id, 'YIELD_CURVE_FLATTENING');
  assert.ok(signal.value >= 0 && signal.value < 0.5, 'value should be in flattening range');
  assert.equal(signal.threshold, 0.5);
});

await runTest('evaluateYieldCurve returns null when spread > 0.5 (healthy curve)', () => {
  // 10Y at 5.0, 2Y at 4.0 → spread = 1.0 (healthy)
  const signal = evaluateYieldCurve(5.0, 4.0);
  assert.equal(signal, null);
});

await runTest('evaluateYieldCurve returns null when yield10y is null', () => {
  assert.equal(evaluateYieldCurve(null, 4.0), null);
});

await runTest('evaluateYieldCurve returns null when yield2y is null', () => {
  assert.equal(evaluateYieldCurve(4.0, null), null);
});

await runTest('evaluateYieldCurve returns null when both inputs are null', () => {
  assert.equal(evaluateYieldCurve(null, null), null);
});

await runTest('evaluateYieldCurve handles spread exactly at 0 (boundary: inverted threshold)', () => {
  // spread = 0 → not < 0, but < 0.5 → should be flattening/watch
  const signal = evaluateYieldCurve(4.0, 4.0);
  assert.ok(signal !== null);
  assert.equal(signal.severity, 'watch');
});

await runTest('evaluateYieldCurve handles spread exactly at 0.5 (boundary: flattening threshold)', () => {
  // 10Y = 4.5, 2Y = 4.0 → spread = 0.5 → not < 0.5 → null
  const signal = evaluateYieldCurve(4.5, 4.0);
  assert.equal(signal, null);
});

// --- evaluateUnemploymentSpike ---

await runTest('evaluateUnemploymentSpike returns critical signal when change >= 0.5 (Sahm Rule)', () => {
  const signal = evaluateUnemploymentSpike(4.5, 4.0);

  assert.ok(signal !== null, 'should return a signal');
  assert.equal(signal.severity, 'critical');
  assert.equal(signal.id, 'UNEMPLOYMENT_SPIKE');
  assert.equal(signal.domain, 'macro');
  assert.ok(signal.value >= 0.5, 'value should be the change amount');
  assert.equal(signal.threshold, 0.5);
  assert.ok(Object.isFrozen(signal), 'signal should be frozen');
});

await runTest('evaluateUnemploymentSpike returns alert signal when change is 0.3 to 0.49', () => {
  const signal = evaluateUnemploymentSpike(4.3, 4.0);

  assert.ok(signal !== null);
  assert.equal(signal.severity, 'alert');
  assert.equal(signal.id, 'UNEMPLOYMENT_RISING');
  assert.ok(signal.value >= 0.3 && signal.value < 0.5);
});

await runTest('evaluateUnemploymentSpike returns null when change is below threshold', () => {
  const signal = evaluateUnemploymentSpike(4.1, 4.0);
  assert.equal(signal, null);
});

await runTest('evaluateUnemploymentSpike returns null when currentRate is null', () => {
  assert.equal(evaluateUnemploymentSpike(null, 4.0), null);
});

await runTest('evaluateUnemploymentSpike returns null when priorRate is null', () => {
  assert.equal(evaluateUnemploymentSpike(4.5, null), null);
});

await runTest('evaluateUnemploymentSpike returns null when unemployment is falling', () => {
  // Unemployment dropped — no signal
  const signal = evaluateUnemploymentSpike(3.8, 4.5);
  assert.equal(signal, null);
});
