/**
 * Tests for lib/sports/factors/cricket.mjs. Pure: no I/O.
 */

import assert from 'node:assert/strict';
import { factors, SPORT } from '../lib/sports/factors/cricket.mjs';
import { validateFactor, buildRegistry } from '../lib/sports/factor-registry.mjs';

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

// ── 1. smoke ────────────────────────────────────────────────────────────────
runTest('cricket: factors is non-empty and frozen', () => {
  assert.ok(Array.isArray(factors));
  assert.ok(factors.length > 0);
  assert.ok(Object.isFrozen(factors));
});

runTest('cricket: every factor has sport=cricket', () => {
  for (const f of factors) {
    assert.equal(f.sport, 'cricket');
  }
  assert.equal(SPORT, 'cricket');
});

// ── 2. validity ─────────────────────────────────────────────────────────────
runTest('cricket: every factor passes validateFactor', () => {
  for (const f of factors) {
    assert.doesNotThrow(() => validateFactor(f), `validateFactor failed for ${f.id}`);
  }
});

// ── 3. defensive ────────────────────────────────────────────────────────────
runTest('cricket: every extract returns null on empty event', () => {
  for (const f of factors) {
    const v = f.extract({});
    assert.equal(v, null, `factor ${f.id} should return null, got ${v}`);
  }
});

// ── 4. realistic event ──────────────────────────────────────────────────────
runTest('cricket: realistic Test event yields >=80% in-range coverage', () => {
  const event = {
    format: 'Test',
    isHome: true,
    homeBattingAvgFormat: 38.4,
    awayBattingAvgFormat: 32.1,
    homeBowlingEconFormat: 2.9,
    awayBowlingEconFormat: 3.4,
    homeBowlingStrikeRateFormat: 52.0,
    awayBowlingStrikeRateFormat: 60.0,
    tossWinner: 'home',
    groundAvgRuns: 290,
    pitchSeamIndex: 0.2,
    homeRecentForm5m: 0.6,
    awayRecentForm5m: -0.1,
  };
  let withValue = 0;
  for (const f of factors) {
    const v = f.extract(event);
    if (typeof v === 'number' && Number.isFinite(v)) {
      const [lo, hi] = f.range;
      assert.ok(v >= lo && v <= hi, `factor ${f.id} value ${v} outside [${lo},${hi}]`);
      withValue += 1;
    }
  }
  const ratio = withValue / factors.length;
  assert.ok(ratio >= 0.8, `expected >=80% coverage, got ${(ratio * 100).toFixed(1)}%`);
});

runTest('cricket: format indicator maps T20=0, ODI=1, Test=2', () => {
  const fmt = factors.find((f) => f.id === 'cricket_format_indicator');
  assert.ok(fmt);
  assert.equal(fmt.extract({ format: 'T20' }), 0);
  assert.equal(fmt.extract({ format: 'ODI' }), 1);
  assert.equal(fmt.extract({ format: 'Test' }), 2);
  assert.equal(fmt.extract({ format: 'bogus' }), null);
});

// ── 5. registry & uniqueness ────────────────────────────────────────────────
runTest('cricket: ids unique and cricket-prefixed', () => {
  const seen = new Set();
  for (const f of factors) {
    assert.ok(!seen.has(f.id));
    seen.add(f.id);
    assert.ok(f.id.startsWith('cricket_'));
  }
});

runTest('cricket: buildRegistry succeeds', () => {
  const registry = buildRegistry([...factors]);
  assert.equal(registry.factors.length, factors.length);
  assert.equal(registry.bySport('cricket').length, factors.length);
});
