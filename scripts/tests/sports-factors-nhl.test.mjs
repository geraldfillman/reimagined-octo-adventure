/**
 * Tests for lib/sports/factors/nhl.mjs — pure declarations, no I/O.
 */

import assert from 'node:assert/strict';
import { factors, SPORT } from '../lib/sports/factors/nhl.mjs';
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

const SPORT_KEY = 'nhl';

// ── 1. Smoke ────────────────────────────────────────────────────────────────

runTest('nhl: SPORT key is "nhl"', () => {
  assert.equal(SPORT, SPORT_KEY);
});

runTest('nhl: factors is a non-empty frozen array', () => {
  assert.ok(Array.isArray(factors));
  assert.ok(factors.length > 0);
  assert.ok(Object.isFrozen(factors));
});

runTest('nhl: every factor has correct sport key', () => {
  for (const f of factors) {
    assert.equal(f.sport, SPORT_KEY, `factor ${f.id} has wrong sport`);
  }
});

// ── 2. Validity ──────────────────────────────────────────────────────────────

runTest('nhl: every factor passes validateFactor', () => {
  for (const f of factors) {
    assert.doesNotThrow(() => validateFactor(f), `factor ${f.id} failed validation`);
  }
});

// ── 3. Defensive on empty event ─────────────────────────────────────────────

runTest('nhl: every extract returns null on empty event {}', () => {
  for (const f of factors) {
    const v = f.extract({});
    assert.equal(v, null, `factor ${f.id} did not return null on empty event (got ${v})`);
  }
});

runTest('nhl: every extract returns null on null event', () => {
  for (const f of factors) {
    const v = f.extract(null);
    assert.equal(v, null, `factor ${f.id} did not return null on null event (got ${v})`);
  }
});

// ── 4. Realistic event coverage ─────────────────────────────────────────────

const realisticEvent = {
  isHome: true,
  homeCorsiForPct30d: 0.525,
  awayCorsiForPct30d: 0.495,
  homeFenwickForPct30d: 0.520,
  awayFenwickForPct30d: 0.498,
  homeGoalieSavePct10g: 0.918,
  awayGoalieSavePct10g: 0.902,
  homeOnB2B: false,
  awayOnB2B: true,
  homePowerPlayPct: 23.5,
  awayPowerPlayPct: 19.0,
  homePenaltyKillPct: 81.0,
  awayPenaltyKillPct: 78.5,
  homeTravelKm: 0,
  awayTravelKm: 1500,
  homeRestDays: 2,
  awayRestDays: 1,
};

runTest('nhl: realistic event yields >=80% numeric in-range coverage', () => {
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

runTest('nhl: all factor ids are distinct', () => {
  const ids = factors.map((f) => f.id);
  const set = new Set(ids);
  assert.equal(set.size, ids.length, `duplicate ids in: ${ids.join(',')}`);
});

// ── 6. ID prefix ────────────────────────────────────────────────────────────

runTest('nhl: every id starts with "nhl_"', () => {
  for (const f of factors) {
    assert.ok(f.id.startsWith(`${SPORT_KEY}_`), `factor id ${f.id} missing sport prefix`);
  }
});

// ── 7. Build into registry ──────────────────────────────────────────────────

runTest('nhl: buildRegistry(factors) succeeds', () => {
  const reg = buildRegistry([...factors]);
  assert.ok(reg);
  assert.equal(reg.factors.length, factors.length);
  assert.equal(reg.bySport(SPORT_KEY).length, factors.length);
});
