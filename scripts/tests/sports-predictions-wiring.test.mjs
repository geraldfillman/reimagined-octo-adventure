/**
 * Phase 3 wiring tests for sports-predictions.mjs.
 *
 * Pure unit tests — no ESPN fetcher, no odds cache, no network. We import
 * the registry helpers and the extracted `computeMultiFactorPrediction`
 * helper directly and exercise their behavior on stubbed events and
 * markets.
 */

import assert from 'node:assert/strict';
import {
  registry,
  mapEspnSportToFactorKey,
  ESPN_SPORT_TO_FACTOR_KEY,
} from '../lib/sports/registry-all.mjs';
import {
  cleanOddsRecordsForDate,
  computeMultiFactorPrediction,
  dedupePredictionRows,
} from '../pullers/sports-predictions.mjs';

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

// ── mapEspnSportToFactorKey ─────────────────────────────────────────────────

runTest('mapEspnSportToFactorKey: baseball/mlb → mlb', () => {
  assert.equal(mapEspnSportToFactorKey('baseball', 'mlb'), 'mlb');
});

runTest('mapEspnSportToFactorKey: baseball-f5/mlb → mlb (first-five same factors)', () => {
  assert.equal(mapEspnSportToFactorKey('baseball-f5', 'mlb'), 'mlb');
});

runTest('mapEspnSportToFactorKey: basketball/nba → nba', () => {
  assert.equal(mapEspnSportToFactorKey('basketball', 'nba'), 'nba');
});

runTest('mapEspnSportToFactorKey: ice-hockey/nhl → nhl', () => {
  assert.equal(mapEspnSportToFactorKey('ice-hockey', 'nhl'), 'nhl');
});

runTest('mapEspnSportToFactorKey: field-event sports return null (golf)', () => {
  assert.equal(mapEspnSportToFactorKey('golf', 'pga'), null);
});

runTest('mapEspnSportToFactorKey: field-event sports return null (horse-racing)', () => {
  assert.equal(mapEspnSportToFactorKey('horse-racing', 'whatever'), null);
});

runTest('mapEspnSportToFactorKey: field-event sports return null (motor racing)', () => {
  assert.equal(mapEspnSportToFactorKey('racing', 'f1'), null);
});

runTest('mapEspnSportToFactorKey: unknown sport returns null', () => {
  assert.equal(mapEspnSportToFactorKey('quidditch', 'imaginary'), null);
});

runTest('mapEspnSportToFactorKey: unknown sport with valid league hint falls through to league', () => {
  assert.equal(mapEspnSportToFactorKey('mystery-sport', 'soccer'), 'soccer');
});

// ── registry singleton ──────────────────────────────────────────────────────

runTest('registry-all: combined registry is built once and cached at module load', async () => {
  const a = await import('../lib/sports/registry-all.mjs');
  const b = await import('../lib/sports/registry-all.mjs');
  assert.strictEqual(a.registry, b.registry);
  assert.strictEqual(a.registry, registry);
});

runTest('registry-all: combined registry contains the full factor count from all 13 sports', () => {
  const sports = ['mlb','nba','nfl','nhl','soccer','rugby','tennis','golf','cricket','combat','racing','esports','horse_racing'];
  let perSportTotal = 0;
  for (const s of sports) {
    const subset = registry.bySport(s);
    assert.ok(subset.length > 0, `${s}: no factors registered`);
    perSportTotal += subset.length;
  }
  assert.equal(registry.factors.length, perSportTotal,
    'registry total should equal sum of per-sport subsets');
  assert.ok(registry.factors.length >= 100,
    `expected >= 100 factors, got ${registry.factors.length}`);
});

runTest('registry-all: ESPN_SPORT_TO_FACTOR_KEY is frozen', () => {
  assert.ok(Object.isFrozen(ESPN_SPORT_TO_FACTOR_KEY));
});

// ── computeMultiFactorPrediction (the new wiring) ───────────────────────────

const stubMarket = {
  homeNoVigProbability: 0.58,
  awayNoVigProbability: 0.42,
};

const stubEvent = {
  id: 'evt-1',
  event: 'TeamA at TeamB',
  home: { displayName: 'TeamB' },
  away: { displayName: 'TeamA' },
  probables: [],
  // No history-derived fields — Day 1 reality.
};

runTest('computeMultiFactorPrediction: with no history, blended prob equals market consensus (Day 1)', () => {
  const out = computeMultiFactorPrediction({
    event: stubEvent,
    history: null,
    market: stubMarket,
    factorKey: 'mlb',
  });
  // Confidence is 0 with no factors firing → blendWeight = 1 → result is market.
  assert.ok(out.scoringDetail, 'scoringDetail should be present for supported sport');
  assert.equal(out.scoringDetail.confidence, 0, 'confidence should be 0 on empty history');
  assert.ok(Math.abs(out.modelHome - stubMarket.homeNoVigProbability) < 1e-9,
    `expected modelHome=${stubMarket.homeNoVigProbability}, got ${out.modelHome}`);
  assert.ok(Math.abs(out.modelAway - stubMarket.awayNoVigProbability) < 1e-9,
    `expected modelAway=${stubMarket.awayNoVigProbability}, got ${out.modelAway}`);
});

runTest('computeMultiFactorPrediction: factorKey=null falls back to market consensus, scoringDetail=null', () => {
  const out = computeMultiFactorPrediction({
    event: stubEvent,
    history: null,
    market: stubMarket,
    factorKey: null,
  });
  assert.equal(out.scoringDetail, null);
  assert.equal(out.modelHome, stubMarket.homeNoVigProbability);
  assert.equal(out.modelAway, stubMarket.awayNoVigProbability);
});

runTest('computeMultiFactorPrediction: every supported factorKey returns a valid blended probability', () => {
  const supported = ['mlb','nba','nfl','nhl','soccer','rugby','tennis','cricket','combat','esports'];
  for (const key of supported) {
    const out = computeMultiFactorPrediction({
      event: stubEvent,
      history: null,
      market: stubMarket,
      factorKey: key,
    });
    assert.ok(out.scoringDetail, `${key}: missing scoringDetail`);
    assert.ok(Number.isFinite(out.modelHome), `${key}: modelHome not finite`);
    assert.ok(out.modelHome >= 0 && out.modelHome <= 1, `${key}: modelHome out of [0,1]`);
    assert.ok(Math.abs((out.modelHome + out.modelAway) - 1) < 1e-9,
      `${key}: probabilities should sum to 1`);
  }
});

// ── shape assertions on the variable_snapshot extension ─────────────────────
// Build a row-shaped snapshot using the same logic the puller uses, without
// going through buildPredictionRow (which needs an oddsRecord and oddsPath).

runTest('variable_snapshot shape: model_version, factor_key, model_probability_blended populated correctly', () => {
  const factorKey = mapEspnSportToFactorKey('basketball', 'nba');
  const out = computeMultiFactorPrediction({
    event: stubEvent,
    history: null,
    market: stubMarket,
    factorKey,
  });
  // Mimic the puller's snapshot extension on Day 1.
  const snapshot = {
    model_version: 'multi-factor-v1',
    factor_key: factorKey,
    factor_count_total: out.scoringDetail?.coverage.total ?? 0,
    factor_count_used: out.scoringDetail?.coverage.used ?? 0,
    model_confidence: out.scoringDetail?.confidence ?? 0,
    model_probability_raw: out.scoringDetail?.modelProbability ?? null,
    model_probability_blended: out.modelHome,
    market_blend_weight: out.scoringDetail ? 1 - out.scoringDetail.confidence : 1,
  };
  assert.equal(snapshot.model_version, 'multi-factor-v1');
  assert.equal(snapshot.factor_key, 'nba');
  assert.equal(snapshot.factor_count_used, 0, 'no history → no factors used');
  assert.equal(snapshot.market_blend_weight, 1, 'no confidence → full market blend');
  assert.ok(Math.abs(snapshot.model_probability_blended - stubMarket.homeNoVigProbability) < 1e-9,
    'blended probability should equal market consensus on Day 1');
});

runTest('dedupePredictionRows: repeated odds records collapse to one stable prediction row', () => {
  const rows = [
    {
      prediction_id: 'same',
      event: 'A @ B',
      market: 'home_away',
      side: 'home',
      selection: 'B',
      edge: -0.02,
      confidence_score: 50,
      odds_decimal: 1.8,
      odds_american: '-125',
    },
    {
      prediction_id: 'same',
      event: 'A @ B',
      market: 'home_away',
      side: 'home',
      selection: 'B',
      edge: -0.01,
      confidence_score: 50,
      odds_decimal: 1.9,
      odds_american: '-111',
    },
    {
      prediction_id: 'other',
      event: 'C @ D',
      market: 'home_away',
      side: 'away',
      selection: 'C',
      edge: -0.03,
      confidence_score: 60,
      odds_decimal: 2.1,
      odds_american: '+110',
    },
  ];

  const deduped = dedupePredictionRows(rows);
  assert.equal(deduped.length, 2);
  assert.equal(deduped[0].prediction_id, 'same');
  assert.equal(deduped[0].odds_american, '-111');
});

runTest('cleanOddsRecordsForDate: mixed-date odds are rejected and duplicate events dedupe', () => {
  const sport = { sport: 'baseball', marketKey: 'home_away_market' };
  const records = [
    {
      home_team: 'Blue Jays',
      away_team: 'Red Sox',
      match_date: '2026-04-27 23:07:00 UTC',
      scraped_date: '2026-04-27 12:00:00 UTC',
      home_away_market: [{ bookmaker_name: 'Book A' }],
    },
    {
      home_team: 'Blue Jays',
      away_team: 'Red Sox',
      match_date: '2026-04-27 23:07:00 UTC',
      scraped_date: '2026-04-27 13:00:00 UTC',
      home_away_market: [{ bookmaker_name: 'Book A' }, { bookmaker_name: 'Book B' }],
    },
    {
      home_team: 'Braves',
      away_team: 'Tigers',
      match_date: '2026-04-28 23:15:00 UTC',
      scraped_date: '2026-04-27 13:00:00 UTC',
      home_away_market: [{ bookmaker_name: 'Book A' }],
    },
  ];

  const cleaned = cleanOddsRecordsForDate(records, '2026-04-27', sport);
  assert.equal(cleaned.records.length, 1);
  assert.equal(cleaned.records[0].home_away_market.length, 2);
  assert.equal(cleaned.rejected.length, 1);
  assert.match(cleaned.rejected[0].reason, /2026-04-28/);
});
