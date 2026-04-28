/**
 * Tests for lib/sports/factors/nfl.mjs — pure declarations, no I/O.
 */

import assert from 'node:assert/strict';
import { factors, SPORT } from '../lib/sports/factors/nfl.mjs';
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

const SPORT_KEY = 'nfl';

// ── 1. Smoke ────────────────────────────────────────────────────────────────

runTest('nfl: SPORT key is "nfl"', () => {
  assert.equal(SPORT, SPORT_KEY);
});

runTest('nfl: factors is a non-empty frozen array', () => {
  assert.ok(Array.isArray(factors));
  assert.ok(factors.length > 0);
  assert.ok(Object.isFrozen(factors));
});

runTest('nfl: every factor has correct sport key', () => {
  for (const f of factors) {
    assert.equal(f.sport, SPORT_KEY, `factor ${f.id} has wrong sport`);
  }
});

// ── 2. Validity ──────────────────────────────────────────────────────────────

runTest('nfl: every factor passes validateFactor', () => {
  for (const f of factors) {
    assert.doesNotThrow(() => validateFactor(f), `factor ${f.id} failed validation`);
  }
});

// ── 3. Defensive on empty event ─────────────────────────────────────────────

runTest('nfl: every extract returns null on empty event {}', () => {
  for (const f of factors) {
    const v = f.extract({});
    assert.equal(v, null, `factor ${f.id} did not return null on empty event (got ${v})`);
  }
});

runTest('nfl: every extract returns null on null event', () => {
  for (const f of factors) {
    const v = f.extract(null);
    assert.equal(v, null, `factor ${f.id} did not return null on null event (got ${v})`);
  }
});

// ── 4. Realistic event coverage ─────────────────────────────────────────────

const realisticEvent = {
  isHome: true,
  homeEpaPerPlay8w: 0.12,
  awayEpaPerPlay8w: -0.04,
  homeDvoaProxy: 8.5,
  awayDvoaProxy: -2.0,
  windSpeedMph: 9,
  precipitation: false,
  isDome: false,
  homeQbRestDays: 7,
  awayQbRestDays: 7,
  isDivisional: true,
  openingSpread: -3.0,
  currentSpread: -3.5,
  openingTotalLine: 47.5,
  currentTotalLine: 46.5,
};

runTest('nfl: realistic event yields >=80% numeric in-range coverage', () => {
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

runTest('nfl: all factor ids are distinct', () => {
  const ids = factors.map((f) => f.id);
  const set = new Set(ids);
  assert.equal(set.size, ids.length, `duplicate ids in: ${ids.join(',')}`);
});

// ── 6. ID prefix ────────────────────────────────────────────────────────────

runTest('nfl: every id starts with "nfl_"', () => {
  for (const f of factors) {
    assert.ok(f.id.startsWith(`${SPORT_KEY}_`), `factor id ${f.id} missing sport prefix`);
  }
});

// ── 7. Build into registry ──────────────────────────────────────────────────

runTest('nfl: buildRegistry(factors) succeeds', () => {
  const reg = buildRegistry([...factors]);
  assert.ok(reg);
  assert.equal(reg.factors.length, factors.length);
  assert.equal(reg.bySport(SPORT_KEY).length, factors.length);
});

// ── Bonus: dome neutralises wind/precip ─────────────────────────────────────

runTest('nfl: dome auto-zeroes wind and precipitation', () => {
  const wind = factors.find((f) => f.id === 'nfl_wind_speed_mph');
  const precip = factors.find((f) => f.id === 'nfl_precipitation_indicator');
  assert.ok(wind && precip);
  const domeEvent = { isDome: true, windSpeedMph: 25, precipitation: true };
  assert.equal(wind.extract(domeEvent), 0);
  assert.equal(precip.extract(domeEvent), 0);
});
