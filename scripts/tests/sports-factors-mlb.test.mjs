/**
 * Tests for lib/sports/factors/mlb.mjs — pure declarations, no I/O.
 */

import assert from 'node:assert/strict';
import { factors, SPORT } from '../lib/sports/factors/mlb.mjs';
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

const SPORT_KEY = 'mlb';

// ── 1. Smoke ────────────────────────────────────────────────────────────────

runTest('mlb: SPORT key is "mlb"', () => {
  assert.equal(SPORT, SPORT_KEY);
});

runTest('mlb: factors is a non-empty frozen array', () => {
  assert.ok(Array.isArray(factors));
  assert.ok(factors.length > 0);
  assert.ok(Object.isFrozen(factors));
});

runTest('mlb: every factor has correct sport key', () => {
  for (const f of factors) {
    assert.equal(f.sport, SPORT_KEY, `factor ${f.id} has wrong sport`);
  }
});

// ── 2. Validity ──────────────────────────────────────────────────────────────

runTest('mlb: every factor passes validateFactor', () => {
  for (const f of factors) {
    assert.doesNotThrow(() => validateFactor(f), `factor ${f.id} failed validation`);
  }
});

// ── 3. Defensive on empty event ─────────────────────────────────────────────

runTest('mlb: every extract returns null on empty event {}', () => {
  for (const f of factors) {
    const v = f.extract({});
    assert.equal(v, null, `factor ${f.id} did not return null on empty event (got ${v})`);
  }
});

runTest('mlb: every extract returns null on null event', () => {
  for (const f of factors) {
    const v = f.extract(null);
    assert.equal(v, null, `factor ${f.id} did not return null on null event (got ${v})`);
  }
});

// ── 4. Realistic event coverage ─────────────────────────────────────────────

const realisticEvent = {
  isHome: true,
  homeStarterEra30d: 3.40,
  awayStarterEra30d: 4.10,
  homeStarterFip30d: 3.60,
  awayStarterFip30d: 4.20,
  homeLineupWoba30d: 0.330,
  awayLineupWoba30d: 0.315,
  parkFactorRuns: 1.04,
  windSpeedMph: 12,
  windOutfieldComponent: 0.7,
  temperatureF: 75,
  homeRestDays: 1,
  awayRestDays: 0,
  homeBullpenHighLevUsedYday: 0.2,
  awayBullpenHighLevUsedYday: 0.6,
  homeTravelKm: 0,
  awayTravelKm: 1800,
};

runTest('mlb: realistic event yields >=80% numeric in-range coverage', () => {
  let withValue = 0;
  let inRange = 0;
  for (const f of factors) {
    const v = f.extract(realisticEvent);
    if (typeof v === 'number' && Number.isFinite(v)) {
      withValue += 1;
      if (v >= f.range[0] && v <= f.range[1]) inRange += 1;
    }
  }
  const ratio = withValue / factors.length;
  assert.ok(ratio >= 0.8, `coverage ${ratio} below 0.8 threshold`);
  assert.equal(inRange, withValue, `${withValue - inRange} factors out of range`);
});

// ── 5. ID uniqueness ────────────────────────────────────────────────────────

runTest('mlb: all factor ids are distinct', () => {
  const ids = factors.map((f) => f.id);
  const set = new Set(ids);
  assert.equal(set.size, ids.length, `duplicate ids in: ${ids.join(',')}`);
});

// ── 6. ID prefix ────────────────────────────────────────────────────────────

runTest('mlb: every id starts with "mlb_"', () => {
  for (const f of factors) {
    assert.ok(f.id.startsWith(`${SPORT_KEY}_`), `factor id ${f.id} missing sport prefix`);
  }
});

// ── 7. Build into registry ──────────────────────────────────────────────────

runTest('mlb: buildRegistry(factors) succeeds', () => {
  const reg = buildRegistry([...factors]);
  assert.ok(reg);
  assert.equal(reg.factors.length, factors.length);
  assert.equal(reg.bySport(SPORT_KEY).length, factors.length);
});
