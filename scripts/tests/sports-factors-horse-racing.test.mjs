/**
 * Tests for lib/sports/factors/horse-racing.mjs.
 * Pure: no I/O, no fixtures. Same runTest pattern as the other sport modules.
 */

import assert from 'node:assert/strict';
import { factors, SPORT } from '../lib/sports/factors/horse-racing.mjs';
import { buildRegistry, validateFactor, extractAllForSport } from '../lib/sports/factor-registry.mjs';

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

// ── smoke ────────────────────────────────────────────────────────────────────

runTest('horse_racing: SPORT key is "horse_racing"', () => {
  assert.equal(SPORT, 'horse_racing');
});

runTest('horse_racing: factors array is non-empty and frozen', () => {
  assert.ok(Array.isArray(factors));
  assert.ok(factors.length >= 12, `expected >=12 factors, got ${factors.length}`);
  assert.ok(Object.isFrozen(factors));
});

runTest('horse_racing: every factor declares sport=horse_racing', () => {
  for (const f of factors) {
    assert.equal(f.sport, 'horse_racing', `${f.id}: wrong sport ${f.sport}`);
  }
});

runTest('horse_racing: every id is unique', () => {
  const ids = factors.map(f => f.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert.equal(dupes.length, 0, `duplicates: ${[...new Set(dupes)].join(', ')}`);
});

runTest('horse_racing: every id starts with horse_racing_', () => {
  for (const f of factors) {
    assert.ok(f.id.startsWith('horse_racing_'),
      `id ${f.id} does not start with horse_racing_`);
  }
});

runTest('horse_racing: every factor passes validateFactor', () => {
  for (const f of factors) {
    validateFactor(f);   // throws on invalid
  }
});

// ── defensive null behaviour ────────────────────────────────────────────────

runTest('horse_racing: every extract returns null on empty event {}', () => {
  for (const f of factors) {
    const v = f.extract({}, {});
    assert.ok(v === null,
      `${f.id}: expected null on empty event, got ${v}`);
  }
});

runTest('horse_racing: every extract returns null on undefined history', () => {
  for (const f of factors) {
    const v = f.extract({ fieldSize: 8 }, undefined);
    // event-scoped factors may extract from event alone; player-scoped should be null.
    if (f.scope === 'player') {
      assert.ok(v === null,
        `${f.id}: player-scoped factor returned non-null with no history`);
    }
  }
});

// ── realistic event extraction ──────────────────────────────────────────────

const realisticEvent = Object.freeze({
  date: '2026-04-27',
  surface: 'dirt',
  going: 'fast',
  distanceFurlongs: 8.5,
  fieldSize: 10,
  postPosition: 4,
  paceProjection: 'fast',
  trackId: 'AQU',
  classLevel: 'allowance',
});

const realisticHistory = Object.freeze({
  recentRuns: [
    { speedFigure: 88, date: '2026-04-01', classLevel: 'allowance' },
    { speedFigure: 85, date: '2026-03-08', classLevel: 'starter_allowance' },
    { speedFigure: 90, date: '2026-02-12', classLevel: 'allowance' },
  ],
  trainer: { winRate30d: 0.18, strikeRateAtTrack: 0.16 },
  jockey:  { winRate30d: 0.15 },
  jockeyTrainerCombo: { winRate: 0.22, runs: 18 },
  distanceRecord: { wins: 3, runs: 9 },
  surfaceRecord:  { wins: 5, runs: 18 },
  goingRecord:    { wins: 4, runs: 12 },
  runningStyle:   { paceStyle: 'closer' },
  postBiasByTrack: { AQU: { 4: 0.02 } },
  weight: { pounds: 120, fieldAvgPounds: 122 },
});

runTest('horse_racing: realistic event extracts numeric values for >=80% of factors', () => {
  let withValue = 0;
  const errors = [];
  for (const f of factors) {
    try {
      const v = f.extract(realisticEvent, realisticHistory);
      if (v !== null) {
        if (typeof v !== 'number' || !Number.isFinite(v)) {
          errors.push(`${f.id}: returned non-finite ${v}`);
          continue;
        }
        if (v < f.range[0] || v > f.range[1]) {
          errors.push(`${f.id}: ${v} outside range ${JSON.stringify(f.range)}`);
        }
        withValue += 1;
      }
    } catch (e) {
      errors.push(`${f.id}: threw — ${e.message}`);
    }
  }
  assert.equal(errors.length, 0, errors.join('\n'));
  const ratio = withValue / factors.length;
  assert.ok(ratio >= 0.80,
    `expected >=80% factor coverage on realistic event, got ${(ratio * 100).toFixed(0)}% (${withValue}/${factors.length})`);
});

// ── domain sanity checks ────────────────────────────────────────────────────

runTest('horse_racing: speed-figure factor averages last 3', () => {
  const f = factors.find(x => x.id === 'horse_racing_speed_figure_last3_avg');
  const v = f.extract({}, {
    recentRuns: [
      { speedFigure: 100, date: '2026-04-01' },
      { speedFigure: 90,  date: '2026-03-15' },
      { speedFigure: 80,  date: '2026-02-28' },
      { speedFigure: 50,  date: '2026-02-01' },  // should be ignored
    ],
  });
  assert.equal(v, 90);
});

runTest('horse_racing: class drop returns positive integer step', () => {
  const f = factors.find(x => x.id === 'horse_racing_class_change_indicator');
  const v = f.extract(
    { classLevel: 'allowance' },
    { recentRuns: [{ classLevel: 'group2', date: '2026-04-01' }] },
  );
  assert.ok(v > 0, `expected positive class drop, got ${v}`);
});

runTest('horse_racing: class rise returns negative step', () => {
  const f = factors.find(x => x.id === 'horse_racing_class_change_indicator');
  const v = f.extract(
    { classLevel: 'group1' },
    { recentRuns: [{ classLevel: 'allowance', date: '2026-04-01' }] },
  );
  assert.ok(v < 0, `expected negative class rise, got ${v}`);
});

runTest('horse_racing: pace fit favours closer when pace projection is fast', () => {
  const f = factors.find(x => x.id === 'horse_racing_pace_fit_score');
  const closerFastPace = f.extract({ paceProjection: 'fast' },  { runningStyle: { paceStyle: 'closer' } });
  const closerSlowPace = f.extract({ paceProjection: 'slow' },  { runningStyle: { paceStyle: 'closer' } });
  assert.ok(closerFastPace > closerSlowPace,
    `closer should favour fast pace: fast=${closerFastPace} slow=${closerSlowPace}`);
});

runTest('horse_racing: pace fit favours front-runner when pace projection is slow', () => {
  const f = factors.find(x => x.id === 'horse_racing_pace_fit_score');
  const frontSlow = f.extract({ paceProjection: 'slow' }, { runningStyle: { paceStyle: 'front' } });
  const frontFast = f.extract({ paceProjection: 'fast' }, { runningStyle: { paceStyle: 'front' } });
  assert.ok(frontSlow > frontFast,
    `front-runner should favour slow pace: slow=${frontSlow} fast=${frontFast}`);
});

runTest('horse_racing: distance suitability is positive when win rate >> baseline', () => {
  const f = factors.find(x => x.id === 'horse_racing_distance_suitability');
  // 6 wins from 12 runs at this distance = 50% strike rate vs 10% baseline; should be strongly positive.
  const v = f.extract({}, { distanceRecord: { wins: 6, runs: 12 } });
  assert.ok(v > 0.5, `expected strongly positive suitability, got ${v}`);
});

runTest('horse_racing: distance suitability is null with zero runs at the distance', () => {
  const f = factors.find(x => x.id === 'horse_racing_distance_suitability');
  const v = f.extract({}, { distanceRecord: { wins: 0, runs: 0 } });
  assert.equal(v, null);
});

runTest('horse_racing: post-position bias accepts both per-post object and bare number', () => {
  const f = factors.find(x => x.id === 'horse_racing_post_position_bias');
  const objForm = f.extract({ postPosition: 4, trackId: 'AQU' }, { postBiasByTrack: { AQU: { 4: 0.03 } } });
  const numForm = f.extract({ postPosition: 4, trackId: 'AQU' }, { postBiasByTrack: { AQU: 0.03 } });
  assert.ok(Math.abs(objForm - 0.03) < 1e-9);
  assert.ok(Math.abs(numForm - 0.03) < 1e-9);
});

// ── registry integration ────────────────────────────────────────────────────

runTest('horse_racing: buildRegistry succeeds', () => {
  const reg = buildRegistry(factors);
  assert.equal(reg.factors.length, factors.length);
  const subset = reg.bySport('horse_racing');
  assert.equal(subset.length, factors.length);
});

runTest('horse_racing: extractAllForSport on realistic event yields >=80% with-value coverage', () => {
  const reg = buildRegistry(factors);
  const extractions = extractAllForSport(reg, 'horse_racing', realisticEvent, realisticHistory);
  const withValue = extractions.filter(e => e.value !== null && !e.error).length;
  assert.ok(withValue / extractions.length >= 0.80,
    `coverage ${withValue}/${extractions.length} below 80%`);
  // Errors must be empty on a well-formed event.
  for (const e of extractions) {
    assert.ok(!e.error, `${e.id}: errored on realistic event — ${e.error}`);
  }
});
