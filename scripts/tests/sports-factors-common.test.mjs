/**
 * Tests for lib/sports/factors/_common.mjs - pure primitives, no I/O.
 */

import assert from 'node:assert/strict';
import {
  restDays,
  travelDistance,
  homeAdvantageBaseline,
  eloUpdate,
  bayesianShrink,
  sigmoid,
  zScore,
  HOME_ADVANTAGE_TABLE,
} from '../lib/sports/factors/_common.mjs';

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

// ── restDays ─────────────────────────────────────────────────────────────────

runTest('restDays: same day returns 0', () => {
  assert.equal(restDays('2026-04-01', '2026-04-01'), 0);
});

runTest('restDays: forward gap is positive', () => {
  assert.equal(restDays('2026-04-01', '2026-04-08'), 7);
});

runTest('restDays: backward gap is negative', () => {
  assert.equal(restDays('2026-04-10', '2026-04-03'), -7);
});

runTest('restDays: accepts Date objects', () => {
  const a = new Date('2026-04-01T00:00:00Z');
  const b = new Date('2026-04-04T00:00:00Z');
  assert.equal(restDays(a, b), 3);
});

runTest('restDays: throws on invalid date string', () => {
  assert.throws(() => restDays('not-a-date', '2026-04-01'), /invalid date string/);
});

runTest('restDays: throws on missing input', () => {
  assert.throws(() => restDays(null, '2026-04-01'), /expected ISO date string/);
  assert.throws(() => restDays('2026-04-01', undefined), /expected ISO date string/);
});

// ── travelDistance ───────────────────────────────────────────────────────────

runTest('travelDistance: same coords returns 0', () => {
  assert.equal(travelDistance({ lat: 40, lon: -74 }, { lat: 40, lon: -74 }), 0);
});

runTest('travelDistance: LAX to JFK ≈ 3974 km within 1%', () => {
  const lax = { lat: 33.9416, lon: -118.4085 };
  const jfk = { lat: 40.6413, lon: -73.7781 };
  const km = travelDistance(lax, jfk);
  const expected = 3974;
  assert.ok(Math.abs(km - expected) / expected < 0.01,
    `LAX→JFK got ${km} km, expected ~${expected} ±1%`);
});

runTest('travelDistance: symmetric (A→B equals B→A)', () => {
  const a = { lat: 51.5074, lon: -0.1278 };  // London
  const b = { lat: 35.6762, lon: 139.6503 }; // Tokyo
  assert.ok(approxEqual(travelDistance(a, b), travelDistance(b, a), 1e-9));
});

runTest('travelDistance: throws on missing coords', () => {
  assert.throws(() => travelDistance({ lat: 40 }, { lat: 41, lon: -74 }), /lon must be a finite number/);
  assert.throws(() => travelDistance(null, { lat: 41, lon: -74 }), /expected \{lat, lon\}/);
});

runTest('travelDistance: throws on out-of-range coords', () => {
  assert.throws(() => travelDistance({ lat: 91, lon: 0 }, { lat: 0, lon: 0 }), /lat must be a finite number/);
  assert.throws(() => travelDistance({ lat: 0, lon: -181 }, { lat: 0, lon: 0 }), /lon must be a finite number/);
});

// ── homeAdvantageBaseline ────────────────────────────────────────────────────

runTest('homeAdvantageBaseline: known sports return expected values', () => {
  assert.equal(homeAdvantageBaseline('nba').homePointShift, 0.6);
  assert.equal(homeAdvantageBaseline('nba').homeWinRate, 0.58);
  assert.equal(homeAdvantageBaseline('nfl').homePointShift, 2.5);
  assert.equal(homeAdvantageBaseline('nfl').homeWinRate, 0.56);
  assert.equal(homeAdvantageBaseline('mlb').homeWinRate, 0.54);
  assert.equal(homeAdvantageBaseline('mlb').homePointShift, null);
  assert.equal(homeAdvantageBaseline('nhl').homeWinRate, 0.55);
  assert.equal(homeAdvantageBaseline('soccer').homeWinRate, 0.46);
  assert.equal(homeAdvantageBaseline('rugby').homeWinRate, 0.59);
  assert.equal(homeAdvantageBaseline('tennis').homeWinRate, 0.53);
});

runTest('homeAdvantageBaseline: unknown sport falls back to default', () => {
  assert.equal(homeAdvantageBaseline('curling').homeWinRate, 0.52);
  assert.equal(homeAdvantageBaseline('curling').homePointShift, null);
});

runTest('homeAdvantageBaseline: case-insensitive sport key', () => {
  assert.equal(homeAdvantageBaseline('NBA').homePointShift, 0.6);
  assert.equal(homeAdvantageBaseline('Soccer').homeWinRate, 0.46);
  assert.equal(homeAdvantageBaseline('RUGBY').homeWinRate, 0.59);
});

runTest('homeAdvantageBaseline: handles null/empty sport', () => {
  assert.equal(homeAdvantageBaseline(null).homeWinRate, 0.52);
  assert.equal(homeAdvantageBaseline('').homeWinRate, 0.52);
});

runTest('HOME_ADVANTAGE_TABLE is frozen', () => {
  assert.ok(Object.isFrozen(HOME_ADVANTAGE_TABLE));
  assert.throws(() => { HOME_ADVANTAGE_TABLE.nba = { homeWinRate: 0.99 }; }, TypeError);
});

// ── eloUpdate ────────────────────────────────────────────────────────────────

runTest('eloUpdate: equal ratings + draw → no rating change', () => {
  const r = eloUpdate({ eloA: 1500, eloB: 1500, result: 0.5 });
  assert.ok(approxEqual(r.newEloA, 1500));
  assert.ok(approxEqual(r.newEloB, 1500));
  assert.ok(approxEqual(r.expectedA, 0.5));
});

runTest('eloUpdate: 1500 vs 1500 → expectedA = 0.5', () => {
  const r = eloUpdate({ eloA: 1500, eloB: 1500, result: 1 });
  assert.ok(approxEqual(r.expectedA, 0.5));
  // delta = 20 * (1 - 0.5) = 10
  assert.ok(approxEqual(r.newEloA, 1510));
  assert.ok(approxEqual(r.newEloB, 1490));
});

runTest('eloUpdate: 1600 vs 1500 → expectedA ≈ 0.6400 (±0.001)', () => {
  const r = eloUpdate({ eloA: 1600, eloB: 1500, result: 1 });
  assert.ok(Math.abs(r.expectedA - 0.6400) < 0.001,
    `expectedA was ${r.expectedA}, expected ~0.6400`);
});

runTest('eloUpdate: rating change is conservative (newA + newB = oldA + oldB)', () => {
  const r = eloUpdate({ eloA: 1600, eloB: 1500, result: 1 });
  assert.ok(approxEqual(r.newEloA + r.newEloB, 1600 + 1500));
});

runTest('eloUpdate: kFactor scales the update', () => {
  const r10 = eloUpdate({ eloA: 1500, eloB: 1500, result: 1, kFactor: 10 });
  const r40 = eloUpdate({ eloA: 1500, eloB: 1500, result: 1, kFactor: 40 });
  assert.ok(approxEqual(r10.newEloA, 1505));
  assert.ok(approxEqual(r40.newEloA, 1520));
});

runTest('eloUpdate: MOV multiplier > 1 for big upset', () => {
  // Underdog (1400) beats favourite (1700) by 20 points - big upset.
  const noMov = eloUpdate({ eloA: 1400, eloB: 1700, result: 1 });
  const withMov = eloUpdate({ eloA: 1400, eloB: 1700, result: 1, mov: 20 });
  const deltaNo = withMov.newEloA - 1400;
  const deltaPlain = noMov.newEloA - 1400;
  assert.ok(deltaNo > deltaPlain,
    `MOV update (${deltaNo}) should exceed plain update (${deltaPlain}) for an upset`);
});

runTest('eloUpdate: throws on invalid inputs', () => {
  assert.throws(() => eloUpdate({ eloA: NaN, eloB: 1500, result: 1 }), /finite numbers/);
  assert.throws(() => eloUpdate({ eloA: 1500, eloB: 1500, result: 2 }), /result must be in/);
  assert.throws(() => eloUpdate({ eloA: 1500, eloB: 1500, result: 1, kFactor: 0 }), /kFactor must be > 0/);
  assert.throws(() => eloUpdate({ eloA: 1500, eloB: 1500, result: 1, mov: -3 }), /mov must be a non-negative/);
});

// ── bayesianShrink ───────────────────────────────────────────────────────────

runTest('bayesianShrink: n=0 returns the prior', () => {
  assert.equal(bayesianShrink({ observed: 0.8, prior: 0.5, n: 0 }), 0.5);
});

runTest('bayesianShrink: very large n approaches observed', () => {
  const out = bayesianShrink({ observed: 0.8, prior: 0.5, n: 10000 });
  assert.ok(Math.abs(out - 0.8) < 1e-3, `posterior ${out} should be ~0.8 for n=10000`);
});

runTest('bayesianShrink: priorWeight=0 returns observed (when n>0)', () => {
  assert.equal(bayesianShrink({ observed: 0.7, prior: 0.4, n: 5, priorWeight: 0 }), 0.7);
});

runTest('bayesianShrink: balanced case (n=priorWeight) is midpoint', () => {
  const out = bayesianShrink({ observed: 0.8, prior: 0.4, n: 10, priorWeight: 10 });
  assert.ok(approxEqual(out, 0.6));
});

runTest('bayesianShrink: throws on negative n', () => {
  assert.throws(() => bayesianShrink({ observed: 0.5, prior: 0.5, n: -1 }), /n must be a non-negative/);
});

runTest('bayesianShrink: throws on non-finite inputs', () => {
  assert.throws(() => bayesianShrink({ observed: NaN, prior: 0.5, n: 5 }), /observed must be finite/);
  assert.throws(() => bayesianShrink({ observed: 0.5, prior: Infinity, n: 5 }), /prior must be finite/);
});

// ── sigmoid ──────────────────────────────────────────────────────────────────

runTest('sigmoid: sigmoid(0) = 0.5', () => {
  assert.ok(approxEqual(sigmoid(0), 0.5));
});

runTest('sigmoid: large positive → ~1', () => {
  assert.ok(sigmoid(20) > 0.999999);
  assert.ok(sigmoid(20) <= 1);
});

runTest('sigmoid: large negative → ~0', () => {
  assert.ok(sigmoid(-20) < 1e-6);
  assert.ok(sigmoid(-20) >= 0);
});

runTest('sigmoid: symmetric around 0', () => {
  assert.ok(approxEqual(sigmoid(2) + sigmoid(-2), 1));
});

runTest('sigmoid: throws on non-finite input', () => {
  assert.throws(() => sigmoid(NaN), /must be finite/);
});

// ── zScore ───────────────────────────────────────────────────────────────────

runTest('zScore: returns null when stdDev=0', () => {
  assert.equal(zScore(5, 5, 0), null);
});

runTest('zScore: simple case (10, mean=5, sd=2.5) → 2', () => {
  assert.equal(zScore(10, 5, 2.5), 2);
});

runTest('zScore: value below mean is negative', () => {
  assert.equal(zScore(0, 5, 2.5), -2);
});

runTest('zScore: returns null on non-finite input', () => {
  assert.equal(zScore(NaN, 5, 1), null);
  assert.equal(zScore(5, NaN, 1), null);
  assert.equal(zScore(5, 5, NaN), null);
});
