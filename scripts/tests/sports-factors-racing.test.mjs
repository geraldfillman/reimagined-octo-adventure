/**
 * Tests for lib/sports/factors/racing.mjs - per-sport factor declarations.
 *
 * Pure: no I/O. Stubbed events only.
 */

import assert from 'node:assert/strict';
import { factors, SPORT } from '../lib/sports/factors/racing.mjs';
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

// ── 1. Smoke ────────────────────────────────────────────────────────────────

runTest('racing: SPORT key is "racing"', () => {
  assert.equal(SPORT, 'racing');
});

runTest('racing: factors array is non-empty and frozen', () => {
  assert.ok(Array.isArray(factors));
  assert.ok(factors.length > 0);
  assert.ok(Object.isFrozen(factors));
});

runTest('racing: every factor has sport === "racing"', () => {
  for (const f of factors) {
    assert.equal(f.sport, 'racing', `factor ${f.id} has wrong sport`);
  }
});

// ── 2. Validity ─────────────────────────────────────────────────────────────

runTest('racing: every factor passes validateFactor', () => {
  for (const f of factors) {
    assert.doesNotThrow(() => validateFactor(f), `validateFactor failed for ${f.id}`);
  }
});

runTest('racing: buildRegistry succeeds on the full factor list', () => {
  const registry = buildRegistry([...factors]);
  assert.equal(registry.factors.length, factors.length);
  assert.equal(registry.bySport('racing').length, factors.length);
});

// ── 3. Defensive: extract returns null on {} ────────────────────────────────

runTest('racing: every extract returns null on empty event', () => {
  for (const f of factors) {
    const v = f.extract({});
    assert.equal(v, null, `factor ${f.id} returned ${v} on empty event, expected null`);
  }
});

runTest('racing: every extract returns null on empty event with history arg', () => {
  for (const f of factors) {
    const v = f.extract({}, {});
    assert.equal(v, null, `factor ${f.id} returned ${v}`);
  }
});

// ── 4. Realistic event ──────────────────────────────────────────────────────

const REALISTIC_EVENT = Object.freeze({
  driverId: 'verstappen',
  seriesCode: 0, // F1
  qualifyingPosition: 2,
  trackTypeFitScore: 1.2,
  recentFinishAvg5r: 3.4,
  dnfRateRecent: 0.05,
  equipmentQualityScore: 0.92,
  practiceSpeedRank: 1,
  isWet: false,
  fieldSize: 20,
  trackAvgLeadChanges: 18,
});

runTest('racing: ≥80% of factors return numeric value within range on realistic event', () => {
  let withinRange = 0;
  for (const f of factors) {
    const v = f.extract(REALISTIC_EVENT);
    if (typeof v === 'number' && Number.isFinite(v)) {
      const [min, max] = f.range;
      if (v >= min && v <= max) {
        withinRange += 1;
      } else {
        throw new Error(`factor ${f.id} returned ${v} outside [${min}, ${max}]`);
      }
    }
  }
  const ratio = withinRange / factors.length;
  assert.ok(ratio >= 0.8, `expected ≥80% coverage, got ${ratio.toFixed(2)}`);
});

runTest('racing: weather wet indicator accepts boolean and 0/1', () => {
  const f = factors.find((x) => x.id === 'racing_weather_wet_indicator');
  assert.equal(f.extract({ isWet: true }), 1);
  assert.equal(f.extract({ isWet: false }), 0);
  assert.equal(f.extract({ isWet: 1 }), 1);
  assert.equal(f.extract({ isWet: 0 }), 0);
  assert.equal(f.extract({ isWet: 'rainy' }), null);
  assert.equal(f.extract({ isWet: 2 }), null);
});

runTest('racing: series indicator rejects out-of-set codes', () => {
  const f = factors.find((x) => x.id === 'racing_series_indicator');
  assert.equal(f.extract({ seriesCode: 0 }), 0);
  assert.equal(f.extract({ seriesCode: 3 }), 3);
  assert.equal(f.extract({ seriesCode: 4 }), null);
  assert.equal(f.extract({ seriesCode: -1 }), null);
});

// ── 5. ID uniqueness + sport prefix ─────────────────────────────────────────

runTest('racing: factor IDs are unique', () => {
  const ids = new Set();
  for (const f of factors) {
    assert.ok(!ids.has(f.id), `duplicate id ${f.id}`);
    ids.add(f.id);
  }
});

runTest('racing: every factor id is sport-prefixed (racing_*)', () => {
  for (const f of factors) {
    assert.ok(f.id.startsWith('racing_'), `factor ${f.id} missing racing_ prefix`);
  }
});
