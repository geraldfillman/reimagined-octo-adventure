/**
 * Tests for lib/sports/factors/combat.mjs - per-sport factor declarations.
 *
 * Pure: no I/O. Stubbed events only.
 */

import assert from 'node:assert/strict';
import { factors, SPORT } from '../lib/sports/factors/combat.mjs';
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

runTest('combat: SPORT key is "combat"', () => {
  assert.equal(SPORT, 'combat');
});

runTest('combat: factors array is non-empty and frozen', () => {
  assert.ok(Array.isArray(factors));
  assert.ok(factors.length > 0);
  assert.ok(Object.isFrozen(factors));
});

runTest('combat: every factor has sport === "combat"', () => {
  for (const f of factors) {
    assert.equal(f.sport, 'combat', `factor ${f.id} has wrong sport`);
  }
});

// ── 2. Validity ─────────────────────────────────────────────────────────────

runTest('combat: every factor passes validateFactor', () => {
  for (const f of factors) {
    assert.doesNotThrow(() => validateFactor(f), `validateFactor failed for ${f.id}`);
  }
});

runTest('combat: buildRegistry succeeds on the full factor list', () => {
  const registry = buildRegistry([...factors]);
  assert.equal(registry.factors.length, factors.length);
  assert.equal(registry.bySport('combat').length, factors.length);
});

// ── 3. Defensive: extract returns null on {} ────────────────────────────────

runTest('combat: every extract returns null on empty event (except indicator)', () => {
  for (const f of factors) {
    if (f.id === 'combat_player_a_indicator') {
      assert.equal(f.extract({}), 1);
      continue;
    }
    const v = f.extract({});
    assert.equal(v, null, `factor ${f.id} returned ${v}, expected null`);
  }
});

runTest('combat: every extract returns null on empty event with history arg', () => {
  for (const f of factors) {
    if (f.id === 'combat_player_a_indicator') continue;
    const v = f.extract({}, {});
    assert.equal(v, null, `factor ${f.id} returned ${v}`);
  }
});

// ── 4. Realistic event ──────────────────────────────────────────────────────

const REALISTIC_EVENT = Object.freeze({
  playerA: 'champ',
  playerB: 'challenger',
  reachInchesA: 76,
  reachInchesB: 72,
  ageA: 30,
  ageB: 28,
  layoffMonthsA: 4,
  layoffMonthsB: 6,
  recentForm5fA: 0.8,
  recentForm5fB: 0.6,
  finishRateA: 0.55,
  finishRateB: 0.4,
  strikeAccuracyA: 0.5,
  strikeAccuracyB: 0.45,
  takedownDefenseA: 0.78,
  takedownDefenseB: 0.65,
  weightCutHistoryScoreA: -0.1,
  weightCutHistoryScoreB: 0.4,
  styleMatchupScore: 0.3,
  championshipRoundsBestOf: 5,
});

runTest('combat: ≥80% of factors return numeric value within range on realistic event', () => {
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

runTest('combat: reach diff returns positive when player_a has longer reach', () => {
  const f = factors.find((x) => x.id === 'combat_reach_diff_inches');
  assert.equal(f.extract(REALISTIC_EVENT), 4);
});

runTest('combat: championship rounds rejects an invalid format value', () => {
  const f = factors.find((x) => x.id === 'combat_championship_rounds_indicator');
  assert.equal(f.extract({ championshipRoundsBestOf: 7 }), null);
  assert.equal(f.extract({ championshipRoundsBestOf: 3 }), 3);
  assert.equal(f.extract({ championshipRoundsBestOf: 5 }), 5);
});

// ── 5. ID uniqueness + sport prefix ─────────────────────────────────────────

runTest('combat: factor IDs are unique', () => {
  const ids = new Set();
  for (const f of factors) {
    assert.ok(!ids.has(f.id), `duplicate id ${f.id}`);
    ids.add(f.id);
  }
});

runTest('combat: every factor id is sport-prefixed (combat_*)', () => {
  for (const f of factors) {
    assert.ok(f.id.startsWith('combat_'), `factor ${f.id} missing combat_ prefix`);
  }
});
