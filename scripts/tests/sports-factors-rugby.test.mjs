/**
 * Tests for lib/sports/factors/rugby.mjs.
 * Tuned for 15s union (Premiership/URC/Six Nations). Pure: no I/O.
 */

import assert from 'node:assert/strict';
import { factors, SPORT } from '../lib/sports/factors/rugby.mjs';
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
runTest('rugby: factors is non-empty and frozen', () => {
  assert.ok(Array.isArray(factors));
  assert.ok(factors.length > 0);
  assert.ok(Object.isFrozen(factors));
});

runTest('rugby: every factor has sport=rugby', () => {
  for (const f of factors) {
    assert.equal(f.sport, 'rugby', `factor ${f.id} has wrong sport`);
  }
  assert.equal(SPORT, 'rugby');
});

// ── 2. validity ─────────────────────────────────────────────────────────────
runTest('rugby: every factor passes validateFactor', () => {
  for (const f of factors) {
    assert.doesNotThrow(() => validateFactor(f), `validateFactor failed for ${f.id}`);
  }
});

// ── 3. defensive ────────────────────────────────────────────────────────────
runTest('rugby: every extract returns null on empty event', () => {
  for (const f of factors) {
    const v = f.extract({});
    assert.equal(v, null, `factor ${f.id} should return null, got ${v}`);
  }
});

runTest('rugby: every extract returns null on null event', () => {
  for (const f of factors) {
    assert.equal(f.extract(null), null);
  }
});

// ── 4. realistic event ──────────────────────────────────────────────────────
runTest('rugby: realistic Premiership-style event yields >=80% in-range coverage', () => {
  const event = {
    isHome: true,
    homeTryRatePer80: 3.2,
    awayTryRatePer80: 2.4,
    homeLineoutRetentionPct: 0.92,
    awayLineoutRetentionPct: 0.85,
    homeScrumPenaltiesWon: 4,
    homeScrumPenaltiesConceded: 1,
    awayScrumPenaltiesWon: 2,
    awayScrumPenaltiesConceded: 3,
    homeMetresPerCarry: 4.6,
    awayMetresPerCarry: 3.8,
    homeCardRate: 0.4,
    awayCardRate: 0.7,
    refereeMeanCardsPerMatch: 1.8,
    isRaining: false,
    homeVenueCoords: { lat: 51.45, lon: -0.34 },     // Twickenham-ish
    awayHomeCoords:  { lat: -33.87, lon: 151.21 },   // Sydney
    homeHemisphere: 'north',
    awayHemisphere: 'south',
    homeSetPieceDominance: 0.4,
    awaySetPieceDominance: -0.1,
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
runTest('rugby: ids unique and rugby-prefixed', () => {
  const seen = new Set();
  for (const f of factors) {
    assert.ok(!seen.has(f.id), `duplicate id ${f.id}`);
    seen.add(f.id);
    assert.ok(f.id.startsWith('rugby_'), `id ${f.id} missing rugby_ prefix`);
  }
});

runTest('rugby: buildRegistry succeeds', () => {
  const registry = buildRegistry([...factors]);
  assert.equal(registry.factors.length, factors.length);
  assert.equal(registry.bySport('rugby').length, factors.length);
});
