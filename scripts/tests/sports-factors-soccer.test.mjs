/**
 * Tests for lib/sports/factors/soccer.mjs.
 * Pure: no I/O. Uses the runTest harness pattern from sports-devig.test.mjs.
 */

import assert from 'node:assert/strict';
import { factors, SPORT } from '../lib/sports/factors/soccer.mjs';
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
runTest('soccer: factors is non-empty and frozen', () => {
  assert.ok(Array.isArray(factors));
  assert.ok(factors.length > 0, 'expected at least one factor');
  assert.ok(Object.isFrozen(factors), 'factors array must be frozen');
});

runTest('soccer: every factor has sport=soccer', () => {
  for (const f of factors) {
    assert.equal(f.sport, 'soccer', `factor ${f.id} has wrong sport ${f.sport}`);
  }
  assert.equal(SPORT, 'soccer');
});

// ── 2. validity ─────────────────────────────────────────────────────────────
runTest('soccer: every factor passes validateFactor', () => {
  for (const f of factors) {
    assert.doesNotThrow(() => validateFactor(f), `validateFactor failed for ${f.id}`);
  }
});

// ── 3. defensive ────────────────────────────────────────────────────────────
runTest('soccer: every extract returns null on empty event', () => {
  for (const f of factors) {
    const v = f.extract({});
    assert.equal(v, null, `factor ${f.id} should return null on empty event, got ${v}`);
  }
});

runTest('soccer: every extract returns null on null/undefined event', () => {
  for (const f of factors) {
    assert.equal(f.extract(null), null, `factor ${f.id} on null`);
    assert.equal(f.extract(undefined), null, `factor ${f.id} on undefined`);
  }
});

// ── 4. realistic event ──────────────────────────────────────────────────────
runTest('soccer: realistic event yields >=80% factors with in-range numeric values', () => {
  const event = {
    isHome: true,
    homeXgRolling10: 1.7,
    awayXgRolling10: 1.2,
    homeXgAgainstRolling10: 0.9,
    awayXgAgainstRolling10: 1.4,
    homeFormHomeSplit: 0.3,
    awayFormAwaySplit: -0.2,
    homeLastMatchDate: '2026-04-23',
    awayLastMatchDate: '2026-04-21',
    matchDate: '2026-04-27',
    refereeYellowCardRate: 4.1,
    homeVenueCoords: { lat: 51.5, lon: -0.12 },
    awayHomeCoords: { lat: 53.48, lon: -2.27 },
    homeTier: 1,
    awayTier: 2,
    homeXiChanges: 1,
    awayXiChanges: 3,
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

// ── 5. registry & uniqueness ────────────────────────────────────────────────
runTest('soccer: ids are unique and snake-case sport-prefixed', () => {
  const seen = new Set();
  for (const f of factors) {
    assert.ok(!seen.has(f.id), `duplicate id ${f.id}`);
    seen.add(f.id);
    assert.ok(f.id.startsWith('soccer_'), `id ${f.id} missing soccer_ prefix`);
  }
});

runTest('soccer: buildRegistry succeeds', () => {
  const registry = buildRegistry([...factors]);
  assert.equal(registry.factors.length, factors.length);
  assert.equal(registry.bySport('soccer').length, factors.length);
});
