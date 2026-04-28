/**
 * Tests for lib/sports/factor-registry.mjs - pure registry, no I/O.
 * Stub factors are built inline; we do NOT depend on _common.mjs or per-sport
 * modules.
 */

import assert from 'node:assert/strict';
import {
  SUPPORTED_SPORTS,
  validateFactor,
  buildRegistry,
  extractOne,
  extractAllForSport,
  summarizeExtraction,
} from '../lib/sports/factor-registry.mjs';

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

// --- Stub factory --------------------------------------------------------

function stubFactor(overrides = {}) {
  return {
    id: 'mlb_park_factor_runs',
    sport: 'mlb',
    scope: 'event',
    extract: (event) => (event && typeof event.value === 'number' ? event.value : null),
    prior: 1.0,
    range: [0.5, 1.5],
    weight: 1.0,
    description: 'stub',
    ...overrides,
  };
}

// ── SUPPORTED_SPORTS ────────────────────────────────────────────────────────

runTest('SUPPORTED_SPORTS contains the 13 expected sports and is frozen', () => {
  assert.equal(SUPPORTED_SPORTS.length, 13);
  for (const s of ['mlb','nba','nfl','nhl','soccer','rugby','tennis','golf','cricket','combat','racing','esports','horse_racing']) {
    assert.ok(SUPPORTED_SPORTS.includes(s), `missing sport: ${s}`);
  }
  assert.ok(Object.isFrozen(SUPPORTED_SPORTS), 'SUPPORTED_SPORTS must be frozen');
});

// ── validateFactor ──────────────────────────────────────────────────────────

runTest('validateFactor: accepts a well-formed factor', () => {
  const f = stubFactor();
  assert.equal(validateFactor(f), f);
});

runTest('validateFactor: rejects missing id', () => {
  assert.throws(() => validateFactor(stubFactor({ id: '' })), /non-empty string/);
  assert.throws(() => validateFactor(stubFactor({ id: undefined })), /non-empty string/);
});

runTest('validateFactor: rejects non-snake_case id', () => {
  assert.throws(() => validateFactor(stubFactor({ id: 'MLB_Park_Factor' })), /snake_case/);
  assert.throws(() => validateFactor(stubFactor({ id: 'mlb-park-factor' })), /snake_case/);
  assert.throws(() => validateFactor(stubFactor({ id: '_mlb_park' })), /snake_case/);
  assert.throws(() => validateFactor(stubFactor({ id: '1mlb' })), /snake_case/);
});

runTest('validateFactor: rejects bad sport', () => {
  assert.throws(() => validateFactor(stubFactor({ sport: 'curling' })), /not in supported set/);
});

runTest('validateFactor: rejects bad scope', () => {
  assert.throws(() => validateFactor(stubFactor({ scope: 'galaxy' })), /not in supported set/);
});

runTest('validateFactor: rejects non-function extract', () => {
  assert.throws(() => validateFactor(stubFactor({ extract: 42 })), /must be a function/);
  assert.throws(() => validateFactor(stubFactor({ extract: null })), /must be a function/);
});

runTest('validateFactor: rejects range[0] >= range[1]', () => {
  assert.throws(() => validateFactor(stubFactor({ range: [1, 1], prior: 1 })), /range\[0\] < range\[1\]/);
  assert.throws(() => validateFactor(stubFactor({ range: [2, 1], prior: 1.5 })), /range\[0\] < range\[1\]/);
});

runTest('validateFactor: rejects prior outside range', () => {
  assert.throws(() => validateFactor(stubFactor({ prior: 5.0 })), /must lie within range/);
  assert.throws(() => validateFactor(stubFactor({ prior: -1 })), /must lie within range/);
});

runTest('validateFactor: rejects negative weight', () => {
  assert.throws(() => validateFactor(stubFactor({ weight: -0.1 })), />= 0/);
});

runTest('validateFactor: rejects non-finite numeric fields', () => {
  assert.throws(() => validateFactor(stubFactor({ prior: NaN })), /finite number/);
  assert.throws(() => validateFactor(stubFactor({ weight: Infinity })), /finite number/);
  assert.throws(() => validateFactor(stubFactor({ range: [NaN, 1] })), /finite numbers/);
});

// ── buildRegistry ───────────────────────────────────────────────────────────

runTest('buildRegistry: accepts a valid set of factors', () => {
  const reg = buildRegistry([
    stubFactor({ id: 'mlb_park_factor_runs' }),
    stubFactor({ id: 'mlb_bullpen_fatigue', sport: 'mlb', scope: 'team' }),
    stubFactor({ id: 'nba_rest_days', sport: 'nba', scope: 'team' }),
  ]);
  assert.equal(reg.factors.length, 3);
  assert.ok(Object.isFrozen(reg), 'registry must be frozen');
  assert.ok(Object.isFrozen(reg.factors), 'factors array must be frozen');
  assert.ok(Object.isFrozen(reg.byId), 'byId must be frozen');
});

runTest('buildRegistry: byId lookup works', () => {
  const reg = buildRegistry([stubFactor({ id: 'mlb_park_factor_runs' })]);
  assert.equal(reg.byId['mlb_park_factor_runs'].id, 'mlb_park_factor_runs');
  assert.equal(reg.byId['nope'], undefined);
});

runTest('buildRegistry: bySport and bySportScope filter correctly', () => {
  const reg = buildRegistry([
    stubFactor({ id: 'mlb_park_factor_runs', sport: 'mlb', scope: 'event' }),
    stubFactor({ id: 'mlb_bullpen_fatigue', sport: 'mlb', scope: 'team' }),
    stubFactor({ id: 'nba_rest_days', sport: 'nba', scope: 'team' }),
  ]);
  assert.equal(reg.bySport('mlb').length, 2);
  assert.equal(reg.bySport('nba').length, 1);
  assert.equal(reg.bySport('nfl').length, 0);
  assert.equal(reg.bySportScope('mlb', 'team').length, 1);
  assert.equal(reg.bySportScope('mlb', 'team')[0].id, 'mlb_bullpen_fatigue');
});

runTest('buildRegistry: throws on duplicate id', () => {
  assert.throws(
    () => buildRegistry([
      stubFactor({ id: 'mlb_park_factor_runs' }),
      stubFactor({ id: 'mlb_park_factor_runs' }),
    ]),
    /Duplicate factor id/,
  );
});

runTest('buildRegistry: throws on non-array input', () => {
  assert.throws(() => buildRegistry(null), /requires an array/);
  assert.throws(() => buildRegistry({}), /requires an array/);
});

// ── extractOne ──────────────────────────────────────────────────────────────

runTest('extractOne: returns value and withinRange flag on success', () => {
  const f = stubFactor();
  const r = extractOne(f, { value: 1.1 });
  assert.equal(r.value, 1.1);
  assert.equal(r.withinRange, true);
  assert.equal(r.id, f.id);
  assert.equal(r.sport, f.sport);
  assert.equal(r.scope, f.scope);
  assert.equal(r.error, undefined);
});

runTest('extractOne: withinRange=false when value outside [min,max]', () => {
  const f = stubFactor();
  const r = extractOne(f, { value: 99 });
  assert.equal(r.value, 99);
  assert.equal(r.withinRange, false);
});

runTest('extractOne: returns {value:null, error} when extract throws', () => {
  const f = stubFactor({
    extract: () => { throw new Error('boom'); },
  });
  const r = extractOne(f, {});
  assert.equal(r.value, null);
  assert.equal(r.error, 'boom');
  assert.equal(r.withinRange, undefined);
});

runTest('extractOne: clamps NaN / Infinity / non-number return to null', () => {
  const cases = [NaN, Infinity, -Infinity, 'oops', { x: 1 }, true];
  for (const bad of cases) {
    const f = stubFactor({ extract: () => bad });
    const r = extractOne(f, {});
    assert.equal(r.value, null, `expected null for ${String(bad)}`);
    assert.equal(r.error, undefined);
  }
});

runTest('extractOne: passes null through when extract returns null/undefined', () => {
  const f = stubFactor({ extract: () => null });
  assert.equal(extractOne(f, {}).value, null);

  const g = stubFactor({ extract: () => undefined });
  assert.equal(extractOne(g, {}).value, null);
});

// ── extractAllForSport ──────────────────────────────────────────────────────

runTest('extractAllForSport: filters by sport and preserves insertion order', () => {
  const reg = buildRegistry([
    stubFactor({ id: 'mlb_a', sport: 'mlb', extract: () => 1.0 }),
    stubFactor({ id: 'nba_x', sport: 'nba', extract: () => 0.9 }),
    stubFactor({ id: 'mlb_b', sport: 'mlb', extract: () => 1.2 }),
  ]);
  const got = extractAllForSport(reg, 'mlb', {}, {});
  assert.equal(got.length, 2);
  assert.equal(got[0].id, 'mlb_a');
  assert.equal(got[1].id, 'mlb_b');
});

runTest('extractAllForSport: returns [] for unknown sport', () => {
  const reg = buildRegistry([stubFactor({ id: 'mlb_a' })]);
  assert.deepEqual(extractAllForSport(reg, 'curling', {}), []);
});

runTest('extractAllForSport: returns [] when no matching sport in registry', () => {
  const reg = buildRegistry([stubFactor({ id: 'mlb_a', sport: 'mlb' })]);
  assert.deepEqual(extractAllForSport(reg, 'nba', {}), []);
});

// ── summarizeExtraction ─────────────────────────────────────────────────────

runTest('summarizeExtraction: counts total/withValue/missing/error correctly', () => {
  const extractions = [
    { id: 'a', sport: 'mlb', scope: 'event', value: 1.0, withinRange: true },
    { id: 'b', sport: 'mlb', scope: 'event', value: null },
    { id: 'c', sport: 'mlb', scope: 'event', value: null, error: 'boom' },
    { id: 'd', sport: 'mlb', scope: 'event', value: 0.9, withinRange: true },
  ];
  const s = summarizeExtraction(extractions);
  assert.equal(s.total, 4);
  assert.equal(s.withValue, 2);
  assert.equal(s.missingIds.length, 2); // b and c are both missing
  assert.ok(s.missingIds.includes('b'));
  assert.ok(s.missingIds.includes('c'));
  assert.deepEqual([...s.errorIds], ['c']);
});

runTest('summarizeExtraction: coverageRatio is 0..1 and 0 for empty input', () => {
  const empty = summarizeExtraction([]);
  assert.equal(empty.total, 0);
  assert.equal(empty.coverageRatio, 0);

  const allHit = summarizeExtraction([
    { id: 'a', sport: 'mlb', scope: 'event', value: 1, withinRange: true },
    { id: 'b', sport: 'mlb', scope: 'event', value: 2, withinRange: true },
  ]);
  assert.equal(allHit.coverageRatio, 1);

  const half = summarizeExtraction([
    { id: 'a', sport: 'mlb', scope: 'event', value: 1, withinRange: true },
    { id: 'b', sport: 'mlb', scope: 'event', value: null },
  ]);
  assert.equal(half.coverageRatio, 0.5);
});

runTest('summarizeExtraction: throws on non-array input', () => {
  assert.throws(() => summarizeExtraction(null), /requires an array/);
});
