/**
 * Tests for lib/sports/devig.mjs - pure math, no I/O.
 */

import assert from 'node:assert/strict';
import {
  devig,
  devigMultiplicative,
  devigPower,
  devigShin,
  noVigImpliedProbability,
  bookmakerOverround,
} from '../lib/sports/devig.mjs';

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

// ── multiplicative ───────────────────────────────────────────────────────────

runTest('multiplicative: a fair 2-way market (no vig) returns 0.5/0.5', () => {
  const probs = devigMultiplicative([2.0, 2.0]);
  assert.equal(probs.length, 2);
  assert.ok(approxEqual(probs[0], 0.5));
  assert.ok(approxEqual(probs[1], 0.5));
  assert.ok(approxEqual(probs[0] + probs[1], 1));
});

runTest('multiplicative: a typical -110/-110 US market sums to 1', () => {
  const probs = devigMultiplicative([1.909, 1.909]);
  assert.ok(approxEqual(probs[0] + probs[1], 1));
  assert.ok(approxEqual(probs[0], 0.5));
});

runTest('multiplicative: an asymmetric two-way market', () => {
  const probs = devigMultiplicative([1.5, 3.0]);
  assert.ok(approxEqual(probs[0] + probs[1], 1));
  const raw = [1 / 1.5, 1 / 3.0];
  const total = raw[0] + raw[1];
  assert.ok(approxEqual(probs[0], raw[0] / total));
  assert.ok(approxEqual(probs[1], raw[1] / total));
});

runTest('multiplicative: 3-way market (e.g. soccer 1X2) sums to 1', () => {
  const probs = devigMultiplicative([2.10, 3.50, 4.00]);
  assert.ok(approxEqual(probs.reduce((a, b) => a + b, 0), 1));
  assert.equal(probs.length, 3);
});

// ── power ────────────────────────────────────────────────────────────────────

runTest('power: fair market returns the same answer as multiplicative', () => {
  const probs = devigPower([2.0, 2.0]);
  assert.ok(approxEqual(probs[0] + probs[1], 1));
  assert.ok(approxEqual(probs[0], 0.5));
});

runTest('power: vigged market sums to 1 within tolerance', () => {
  const probs = devigPower([1.91, 1.91]);
  assert.ok(approxEqual(probs[0] + probs[1], 1, 1e-5));
});

runTest('power: 3-way market converges and sums to 1', () => {
  const probs = devigPower([2.10, 3.50, 4.00]);
  const total = probs.reduce((a, b) => a + b, 0);
  assert.ok(approxEqual(total, 1, 1e-5));
});

// ── shin ─────────────────────────────────────────────────────────────────────

runTest('shin: fair market returns 0.5/0.5', () => {
  const probs = devigShin([2.0, 2.0]);
  assert.ok(approxEqual(probs[0] + probs[1], 1));
  assert.ok(approxEqual(probs[0], 0.5));
});

runTest('shin: 2-way market sums to 1', () => {
  const probs = devigShin([1.91, 1.91]);
  assert.ok(approxEqual(probs[0] + probs[1], 1, 1e-5));
});

runTest('shin: differs from multiplicative on an asymmetric market', () => {
  const odds = [1.20, 5.00];
  const mult = devigMultiplicative(odds);
  const shin = devigShin(odds);
  assert.ok(approxEqual(mult[0] + mult[1], 1));
  assert.ok(approxEqual(shin[0] + shin[1], 1, 1e-5));
  assert.ok(Math.abs(shin[0] - mult[0]) > 1e-3,
    `Shin (${shin[0]}) and multiplicative (${mult[0]}) should differ on an asymmetric market`);
});

runTest('shin: pushes heavy favorite up vs multiplicative (insider correction loads on longshot)', () => {
  const odds = [1.20, 5.00];
  const mult = devigMultiplicative(odds);
  const shin = devigShin(odds);
  assert.ok(shin[0] > mult[0],
    `Shin favourite (${shin[0]}) should exceed multiplicative favourite (${mult[0]})`);
  assert.ok(shin[1] < mult[1],
    `Shin longshot (${shin[1]}) should be below multiplicative longshot (${mult[1]})`);
});

// ── dispatcher and helpers ───────────────────────────────────────────────────

runTest('devig dispatcher honours method selection', () => {
  const odds = [1.91, 1.91];
  const m = devig(odds, 'multiplicative');
  const p = devig(odds, 'power');
  const s = devig(odds, 'shin');
  assert.ok(approxEqual(m[0] + m[1], 1));
  assert.ok(approxEqual(p[0] + p[1], 1, 1e-5));
  assert.ok(approxEqual(s[0] + s[1], 1, 1e-5));
});

runTest('devig dispatcher rejects unknown method', () => {
  assert.throws(() => devig([2, 2], 'bogus'), /Unknown de-vig method/);
});

runTest('noVigImpliedProbability returns the correct outcome probability', () => {
  const market = [1.91, 1.91];
  const p = noVigImpliedProbability(1.91, market, 'multiplicative');
  assert.ok(approxEqual(p, 0.5));
});

runTest('noVigImpliedProbability errors when selection is not in market', () => {
  assert.throws(
    () => noVigImpliedProbability(2.0, [1.91, 1.91]),
    /Selection odds not found/,
  );
});

runTest('bookmakerOverround is positive for vigged markets, ~0 for fair', () => {
  assert.ok(approxEqual(bookmakerOverround([2.0, 2.0]), 0, 1e-9));
  const v = bookmakerOverround([1.91, 1.91]);
  assert.ok(v > 0 && v < 0.10);
});

// ── input validation ────────────────────────────────────────────────────────

runTest('rejects markets with fewer than 2 outcomes', () => {
  assert.throws(() => devig([2.0]), /array of length >= 2/);
  assert.throws(() => devig([]), /array of length >= 2/);
});

runTest('rejects non-numeric or sub-1 odds', () => {
  assert.throws(() => devig([2.0, 1.0]), /Invalid decimal odds/);
  assert.throws(() => devig([2.0, NaN]), /Invalid decimal odds/);
  assert.throws(() => devig([2.0, 'abc']), /Invalid decimal odds/);
});
