import assert from 'node:assert/strict';

import { highestSeverity, formatSignalsSection } from '../lib/signals/utils.mjs';

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

// --- highestSeverity ---

await runTest('highestSeverity returns critical when any signal is critical', () => {
  const signals = [
    { severity: 'watch' },
    { severity: 'critical' },
    { severity: 'alert' },
  ];
  assert.equal(highestSeverity(signals), 'critical');
});

await runTest('highestSeverity returns alert when highest is alert', () => {
  const signals = [
    { severity: 'watch' },
    { severity: 'alert' },
    { severity: 'watch' },
  ];
  assert.equal(highestSeverity(signals), 'alert');
});

await runTest('highestSeverity returns watch when all signals are watch', () => {
  const signals = [
    { severity: 'watch' },
    { severity: 'watch' },
  ];
  assert.equal(highestSeverity(signals), 'watch');
});

await runTest('highestSeverity returns clear for empty array', () => {
  assert.equal(highestSeverity([]), 'clear');
});

await runTest('highestSeverity returns clear for null input', () => {
  assert.equal(highestSeverity(null), 'clear');
});

await runTest('highestSeverity returns clear for undefined input', () => {
  assert.equal(highestSeverity(undefined), 'clear');
});

await runTest('highestSeverity handles single-element array', () => {
  assert.equal(highestSeverity([{ severity: 'alert' }]), 'alert');
});

// --- formatSignalsSection ---

await runTest('formatSignalsSection returns clear status string for empty array', () => {
  const result = formatSignalsSection([]);
  assert.ok(typeof result === 'string', 'result should be a string');
  assert.ok(result.length > 0, 'result should not be empty');
  assert.match(result, /[Cc]lear/, 'result should mention "clear"');
});

await runTest('formatSignalsSection returns clear status string for null input', () => {
  const result = formatSignalsSection(null);
  assert.ok(typeof result === 'string');
  assert.match(result, /[Cc]lear/);
});

await runTest('formatSignalsSection formats one signal correctly', () => {
  const signals = [
    {
      id: 'YIELD_CURVE_INVERSION',
      name: 'Yield Curve Inverted',
      domain: 'macro',
      severity: 'critical',
      value: -0.25,
      threshold: 0,
      message: 'Yield curve inverted: 10Y-2Y spread at -0.25%',
      implications: ['Recession risk elevated', 'Reduce cyclical equity exposure'],
      related_domains: ['housing', 'equities'],
    },
  ];

  const result = formatSignalsSection(signals);

  assert.ok(typeof result === 'string', 'result should be a string');
  assert.match(result, /Yield Curve Inverted/, 'result should include signal name');
  assert.match(result, /CRITICAL|critical/, 'result should include severity');
  assert.match(result, /Recession risk elevated/, 'result should include implications');
  assert.match(result, /Reduce cyclical equity exposure/, 'result should include all implications');
});

await runTest('formatSignalsSection formats multiple signals in order', () => {
  const signals = [
    {
      id: 'SIG_A',
      name: 'Signal Alpha',
      domain: 'macro',
      severity: 'critical',
      value: 1,
      threshold: 0,
      message: 'Alpha message',
      implications: ['Alpha implication'],
      related_domains: [],
    },
    {
      id: 'SIG_B',
      name: 'Signal Beta',
      domain: 'market',
      severity: 'watch',
      value: 2,
      threshold: 1,
      message: 'Beta message',
      implications: ['Beta implication'],
      related_domains: [],
    },
  ];

  const result = formatSignalsSection(signals);

  const alphaPos = result.indexOf('Signal Alpha');
  const betaPos = result.indexOf('Signal Beta');
  assert.ok(alphaPos !== -1, 'Signal Alpha should appear in output');
  assert.ok(betaPos !== -1, 'Signal Beta should appear in output');
  assert.ok(alphaPos < betaPos, 'Signal Alpha should appear before Signal Beta');
});
