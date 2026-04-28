/**
 * End-to-end integration test for Phase 1 modules.
 *
 * Wires _common → factor-registry → scoring against a minimal two-factor
 * stub for a fictional sport. If this passes, the contracts compose.
 *
 * Pure: no I/O, no fixtures. Stubs the event/history shape inline.
 */

import assert from 'node:assert/strict';
import {
  homeAdvantageBaseline,
  bayesianShrink,
  eloUpdate,
  restDays,
} from '../lib/sports/factors/_common.mjs';
import {
  buildRegistry,
  extractAllForSport,
  summarizeExtraction,
} from '../lib/sports/factor-registry.mjs';
import {
  scoreEvent,
  defaultConfigFor,
  blendWithMarketConsensus,
} from '../lib/sports/scoring.mjs';

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

// ── stub: a fictional NBA-style sport with two factors ──────────────────────
// Use an existing supported sport key so factor-registry accepts it.
const factorDecls = [
  {
    id: 'nba_home_advantage',
    sport: 'nba',
    scope: 'team',
    extract: (event) => event.isHome ? 1 : 0,
    prior: 0.5,
    range: [0, 1],
    weight: 1.5,
    description: 'Home indicator',
  },
  {
    id: 'nba_net_rating_diff',
    sport: 'nba',
    scope: 'team',
    extract: (event) => event.netRatingDiff ?? null,
    prior: 0,
    range: [-15, 15],
    weight: 0.8,
    description: 'Home minus away net rating',
  },
  {
    id: 'nba_rest_diff_days',
    sport: 'nba',
    scope: 'team',
    extract: (event) => {
      if (!event.homeLastGame || !event.awayLastGame || !event.gameDate) return null;
      return restDays(event.homeLastGame, event.gameDate)
        - restDays(event.awayLastGame, event.gameDate);
    },
    prior: 0,
    range: [-3, 3],
    weight: 0.4,
    description: 'Home rest minus away rest',
  },
];

const registry = buildRegistry(factorDecls);

// ── full-pipeline scoring ────────────────────────────────────────────────────

runTest('pipeline: home favourite with positive net-rating produces P > 0.5', () => {
  const event = {
    isHome: true,
    netRatingDiff: 4,
    homeLastGame: '2026-04-25',
    awayLastGame: '2026-04-26',
    gameDate: '2026-04-27',
  };
  const extractions = extractAllForSport(registry, 'nba', event);
  assert.equal(extractions.length, 3);
  const config = defaultConfigFor(registry.bySport('nba'));
  const result = scoreEvent(extractions, registry.bySport('nba'), config);
  assert.ok(result.modelProbability > 0.5,
    `expected favourite > 0.5, got ${result.modelProbability}`);
  assert.ok(result.modelProbability <= 1);
  assert.equal(result.coverage.total, 3);
  assert.equal(result.coverage.used, 3);
  assert.ok(result.confidence > 0 && result.confidence <= 1);
});

runTest('pipeline: away underdog with negative net-rating produces P < 0.5', () => {
  const event = {
    isHome: false,
    netRatingDiff: -6,
    homeLastGame: '2026-04-26',
    awayLastGame: '2026-04-25',
    gameDate: '2026-04-27',
  };
  const extractions = extractAllForSport(registry, 'nba', event);
  const config = defaultConfigFor(registry.bySport('nba'));
  const result = scoreEvent(extractions, registry.bySport('nba'), config);
  assert.ok(result.modelProbability < 0.5,
    `expected underdog < 0.5, got ${result.modelProbability}`);
  assert.ok(result.modelProbability >= 0);
});

runTest('pipeline: missing data degrades coverage but does not crash', () => {
  const event = { isHome: true };  // netRatingDiff and rest data missing
  const extractions = extractAllForSport(registry, 'nba', event);
  const summary = summarizeExtraction(extractions);
  assert.equal(summary.total, 3);
  assert.equal(summary.withValue, 1);
  assert.equal(summary.coverageRatio, 1 / 3);

  const config = defaultConfigFor(registry.bySport('nba'));
  const result = scoreEvent(extractions, registry.bySport('nba'), config);
  assert.ok(Number.isFinite(result.modelProbability));
  assert.ok(result.confidence < 1, 'confidence should drop with sparse data');
});

runTest('pipeline: extraction error in one factor is isolated, others still score', () => {
  const explosiveDecl = [
    ...factorDecls,
    {
      id: 'nba_blow_up',
      sport: 'nba',
      scope: 'team',
      extract: () => { throw new Error('boom'); },
      prior: 0,
      range: [-1, 1],
      weight: 0.5,
    },
  ];
  const reg = buildRegistry(explosiveDecl);
  const event = { isHome: true, netRatingDiff: 2 };
  const extractions = extractAllForSport(reg, 'nba', event);
  const blowUp = extractions.find(e => e.id === 'nba_blow_up');
  assert.equal(blowUp.value, null);
  assert.match(blowUp.error, /boom/);

  const config = defaultConfigFor(reg.bySport('nba'));
  const result = scoreEvent(extractions, reg.bySport('nba'), config);
  assert.ok(Number.isFinite(result.modelProbability));
  assert.equal(result.coverage.error, 1);
});

runTest('pipeline: market blend pulls a confident model toward consensus when blendWeight > 0', () => {
  const event = { isHome: true, netRatingDiff: 8, homeLastGame: '2026-04-25', awayLastGame: '2026-04-25', gameDate: '2026-04-27' };
  const extractions = extractAllForSport(registry, 'nba', event);
  const config = defaultConfigFor(registry.bySport('nba'));
  const result = scoreEvent(extractions, registry.bySport('nba'), config);

  const blended = blendWithMarketConsensus(result.modelProbability, 0.5, 0.5);
  assert.ok(blended > 0.5);
  assert.ok(blended < result.modelProbability,
    `blended (${blended}) should be between market 0.5 and model ${result.modelProbability}`);
});

// ── _common primitives still wired correctly ────────────────────────────────

runTest('_common: homeAdvantageBaseline still works after Phase 1 (smoke)', () => {
  const nba = homeAdvantageBaseline('nba');
  assert.ok(nba.homeWinRate > 0.5 && nba.homeWinRate < 0.7);
  const dflt = homeAdvantageBaseline('zorbball');
  assert.ok(dflt.homeWinRate >= 0.5 && dflt.homeWinRate <= 0.55);
});

runTest('_common: eloUpdate sanity (1500 vs 1500, draw → no change)', () => {
  const out = eloUpdate({ eloA: 1500, eloB: 1500, result: 0.5 });
  assert.ok(Math.abs(out.newEloA - 1500) < 1e-6);
  assert.ok(Math.abs(out.newEloB - 1500) < 1e-6);
});

runTest('_common: bayesianShrink with n=0 returns prior', () => {
  const out = bayesianShrink({ observed: 0.8, prior: 0.5, n: 0 });
  assert.equal(out, 0.5);
});
