/**
 * Tests for lib/sports/factors/tennis.mjs - per-sport factor declarations.
 *
 * Pure: no I/O. Stubbed events only. Uses the same custom runTest pattern as
 * sports-devig.test.mjs and sports-pipeline.integration.test.mjs.
 */

import assert from 'node:assert/strict';
import { factors, SPORT } from '../lib/sports/factors/tennis.mjs';
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

runTest('tennis: SPORT key is "tennis"', () => {
  assert.equal(SPORT, 'tennis');
});

runTest('tennis: factors array is non-empty and frozen', () => {
  assert.ok(Array.isArray(factors));
  assert.ok(factors.length > 0, 'expected at least one factor');
  assert.ok(Object.isFrozen(factors), 'factors must be frozen');
});

runTest('tennis: every factor has sport === "tennis"', () => {
  for (const f of factors) {
    assert.equal(f.sport, 'tennis', `factor ${f.id} has wrong sport`);
  }
});

// ── 2. Validity ─────────────────────────────────────────────────────────────

runTest('tennis: every factor passes validateFactor', () => {
  for (const f of factors) {
    assert.doesNotThrow(() => validateFactor(f), `validateFactor failed for ${f.id}`);
  }
});

runTest('tennis: buildRegistry succeeds on the full factor list', () => {
  const registry = buildRegistry([...factors]);
  assert.equal(registry.factors.length, factors.length);
  assert.equal(registry.bySport('tennis').length, factors.length);
});

// ── 3. Defensive: extract returns null on {} ────────────────────────────────

runTest('tennis: every extract returns null on empty event', () => {
  for (const f of factors) {
    // tennis_player_a_indicator returns 1 even for {}, since the event exists.
    if (f.id === 'tennis_player_a_indicator') {
      assert.equal(f.extract({}), 1);
      continue;
    }
    const v = f.extract({});
    assert.equal(v, null, `factor ${f.id} returned ${v} on empty event, expected null`);
  }
});

runTest('tennis: every extract returns null on {} history-arg', () => {
  for (const f of factors) {
    if (f.id === 'tennis_player_a_indicator') continue;
    const v = f.extract({}, {});
    assert.equal(v, null, `factor ${f.id} returned ${v}`);
  }
});

// ── 4. Realistic event ──────────────────────────────────────────────────────

const REALISTIC_EVENT = Object.freeze({
  playerA: 'alice',
  playerB: 'bob',
  surfaceEloA: 1900,
  surfaceEloB: 1750,
  overallEloA: 1850,
  overallEloB: 1800,
  recentForm8mA: 0.75,
  recentForm8mB: 0.5,
  h2hWinsA: 4,
  h2hWinsB: 2,
  restDaysA: 3,
  restDaysB: 1,
  altitudeMeters: 600,
  firstServeWinPctA: 0.78,
  firstServeWinPctB: 0.72,
  breakPointSavePctA: 0.65,
  breakPointSavePctB: 0.55,
  matchFormatBestOf: 5,
});

runTest('tennis: ≥80% of factors return numeric value within range on realistic event', () => {
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

runTest('tennis: surface_elo_diff returns positive when player_a stronger', () => {
  const f = factors.find((x) => x.id === 'tennis_surface_elo_diff');
  assert.ok(f);
  assert.ok(f.extract(REALISTIC_EVENT) > 0);
});

// ── 5. ID uniqueness + sport prefix ─────────────────────────────────────────

runTest('tennis: factor IDs are unique', () => {
  const ids = new Set();
  for (const f of factors) {
    assert.ok(!ids.has(f.id), `duplicate id ${f.id}`);
    ids.add(f.id);
  }
});

runTest('tennis: every factor id is sport-prefixed (tennis_*)', () => {
  for (const f of factors) {
    assert.ok(f.id.startsWith('tennis_'), `factor ${f.id} missing tennis_ prefix`);
  }
});
