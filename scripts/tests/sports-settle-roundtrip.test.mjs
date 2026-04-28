/**
 * Tests for scripts/pullers/sports-settle.mjs CSV round-trip and defensive
 * handling of variable_snapshot in the multi-factor-v1 prediction schema.
 *
 * Pure parsing / serialisation tests — no network, no fs writes.
 */

import assert from 'node:assert/strict';
import {
  parseCsv,
  toCsv,
  mergeHeaders,
  settleRow,
  warnOnMissingFactorContributions,
} from '../pullers/sports-settle.mjs';

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

const REQUIRED_COLUMNS = [
  'prediction_id', 'event_id', 'date', 'sport', 'league', 'event',
  'market', 'selection', 'side', 'odds_american', 'odds_decimal',
  'implied_probability', 'model_probability', 'edge', 'confidence_score',
  'status', 'model_version', 'stake', 'variable_snapshot',
  'result', 'closing_odds_decimal', 'closing_odds_american', 'closing_bookmaker',
  'closing_odds_captured_at', 'closing_odds_source', 'actual_home_score', 'actual_away_score',
  'notes',
];

function makeMultiFactorSnapshot(overrides = {}) {
  return {
    factor_key: 'mlb',
    factor_count_total: 12,
    factor_count_used: 9,
    factor_coverage_ratio: 0.75,
    model_confidence: 0.62,
    model_probability_raw: 0.5421,
    model_probability_blended: 0.5310,
    market_blend_weight: 0.38,
    factor_contributions_top5: [
      { id: 'starter_era', contribution: 0.041 },
      { id: 'bullpen_xfip', contribution: 0.022 },
      { id: 'park_factor', contribution: 0.011 },
    ],
    devig_method: 'multiplicative',
    book_overround: 0.045,
    scoring_window: 'full_game',
    ...overrides,
  };
}

function makeRow(overrides = {}) {
  return {
    prediction_id: 'mlb-2026-04-27-NYY-BOS',
    event_id: '401584321',
    date: '2026-04-27',
    sport: 'baseball',
    league: 'mlb',
    event: 'New York Yankees @ Boston Red Sox',
    market: 'home_away',
    selection: 'Boston Red Sox',
    side: 'home',
    odds_american: '-110',
    odds_decimal: '1.91',
    implied_probability: '0.5238',
    model_probability: '0.5310',
    edge: '0.0072',
    confidence_score: '0.62',
    status: 'pending',
    model_version: 'multi-factor-v1',
    stake: '1',
    variable_snapshot: JSON.stringify(makeMultiFactorSnapshot()),
    result: 'pending',
    closing_odds_decimal: '',
    closing_odds_american: '',
    closing_bookmaker: '',
    closing_odds_captured_at: '',
    closing_odds_source: '',
    actual_home_score: '',
    actual_away_score: '',
    notes: '',
    ...overrides,
  };
}

// ── 1. CSV round-trip preserves variable_snapshot byte-for-byte ──────────────

runTest('round-trip: parse → toCsv → parse yields identical rows incl. snapshot', () => {
  const original = makeRow();
  const csv = toCsv(REQUIRED_COLUMNS, [original]);
  const parsed = parseCsv(csv);
  assert.equal(parsed.rows.length, 1);
  const replayed = parsed.rows[0];
  for (const col of REQUIRED_COLUMNS) {
    assert.equal(replayed[col], original[col], `column ${col} differs`);
  }
  // And the snapshot JSON parses back to the exact same object shape.
  const before = JSON.parse(original.variable_snapshot);
  const after = JSON.parse(replayed.variable_snapshot);
  assert.deepEqual(after, before);
});

runTest('round-trip: settled row preserves variable_snapshot exactly', () => {
  const row = makeRow();
  // Simulate what settle does to a pending row when ESPN reports a final score.
  // We bypass network by constructing the eventsBySport directly.
  const eventsBySport = new Map([
    ['baseball:2026-04-27', [{
      id: '401584321',
      name: 'New York Yankees @ Boston Red Sox',
      shortName: 'NYY @ BOS',
      state: 'post',
      detail: 'Final',
      home: { name: 'Boston Red Sox', abbreviation: 'BOS', score: 5, firstFiveScore: null },
      away: { name: 'New York Yankees', abbreviation: 'NYY', score: 3, firstFiveScore: null },
    }]],
  ]);
  const update = settleRow(row, eventsBySport, {});
  assert.equal(update.row.result, 'win');
  assert.equal(update.row.status, 'settled');
  assert.equal(update.row.actual_home_score, '5');
  assert.equal(update.row.actual_away_score, '3');
  // Critical: variable_snapshot must be byte-identical to the input.
  assert.equal(update.row.variable_snapshot, row.variable_snapshot);

  // And it survives a CSV round-trip after settlement.
  const csv = toCsv(REQUIRED_COLUMNS, [update.row]);
  const reparsed = parseCsv(csv).rows[0];
  assert.equal(reparsed.variable_snapshot, row.variable_snapshot);
  assert.deepEqual(JSON.parse(reparsed.variable_snapshot), JSON.parse(row.variable_snapshot));
});

// ── 2. Defensive: missing factor_contributions_top5 warns, doesn't throw ─────

runTest('defensive: multi-factor-v1 row without factor_contributions_top5 logs warning', () => {
  const snap = makeMultiFactorSnapshot();
  delete snap.factor_contributions_top5;
  const row = makeRow({ variable_snapshot: JSON.stringify(snap) });
  const warnings = [];
  const origWarn = console.warn;
  console.warn = (...args) => warnings.push(args.join(' '));
  try {
    const missing = warnOnMissingFactorContributions([row], 'fixture.csv');
    assert.equal(missing, 1);
    assert.ok(warnings.length === 1, 'expected exactly one warning');
    assert.match(warnings[0], /multi-factor-v1.*factor_contributions_top5/);
  } finally {
    console.warn = origWarn;
  }
});

runTest('defensive: well-formed multi-factor-v1 row produces no warning', () => {
  const row = makeRow();
  const warnings = [];
  const origWarn = console.warn;
  console.warn = (...args) => warnings.push(args.join(' '));
  try {
    const missing = warnOnMissingFactorContributions([row]);
    assert.equal(missing, 0);
    assert.equal(warnings.length, 0);
  } finally {
    console.warn = origWarn;
  }
});

// ── 3. Pre-Phase-3 row (no factor_key) settles cleanly ───────────────────────

runTest('pre-Phase-3 row (no factor_key, old model_version) settles without crashing', () => {
  const oldRow = makeRow({
    model_version: 'market-consensus-v1',
    variable_snapshot: JSON.stringify({ scoring_window: 'full_game' }),
  });
  const eventsBySport = new Map([
    ['baseball:2026-04-27', [{
      id: '401584321',
      name: 'New York Yankees @ Boston Red Sox',
      state: 'post',
      detail: 'Final',
      home: { name: 'Boston Red Sox', abbreviation: 'BOS', score: 2, firstFiveScore: null },
      away: { name: 'New York Yankees', abbreviation: 'NYY', score: 7, firstFiveScore: null },
    }]],
  ]);
  const update = settleRow(oldRow, eventsBySport, {});
  // Yankees won (away 7, home 2), so home side loses.
  assert.equal(update.row.result, 'loss');
  assert.equal(update.row.status, 'settled');
  assert.equal(update.row.variable_snapshot, oldRow.variable_snapshot);
  // Warning helper should not flag this row (model_version differs).
  const warnings = [];
  const origWarn = console.warn;
  console.warn = (...args) => warnings.push(args.join(' '));
  try {
    const missing = warnOnMissingFactorContributions([oldRow]);
    assert.equal(missing, 0);
    assert.equal(warnings.length, 0);
  } finally {
    console.warn = origWarn;
  }
});

// ── 4. CSV escaping: commas, quotes, and newlines round-trip cleanly ─────────

runTest('CSV escape: snapshot containing comma/quote/newline survives round-trip', () => {
  const tricky = {
    factor_key: 'mlb',
    factor_count_total: 4,
    factor_count_used: 4,
    factor_coverage_ratio: 1.0,
    model_confidence: 0.5,
    model_probability_raw: 0.5,
    model_probability_blended: 0.5,
    market_blend_weight: 0.5,
    factor_contributions_top5: [
      { id: 'note_with_comma', contribution: 0.01, note: 'Hello, world' },
      { id: 'note_with_quote', contribution: 0.02, note: 'Say "hi" please' },
      { id: 'note_with_newline', contribution: 0.03, note: 'Line1\nLine2' },
    ],
    devig_method: 'multiplicative',
    book_overround: 0.04,
    scoring_window: 'full_game',
  };
  const row = makeRow({ variable_snapshot: JSON.stringify(tricky) });
  const csv = toCsv(REQUIRED_COLUMNS, [row]);
  const reparsed = parseCsv(csv);
  assert.equal(reparsed.rows.length, 1);
  assert.equal(reparsed.rows[0].variable_snapshot, row.variable_snapshot);
  assert.deepEqual(JSON.parse(reparsed.rows[0].variable_snapshot), tricky);
});

runTest('CSV header merge: missing required columns get appended', () => {
  const merged = mergeHeaders(['prediction_id', 'event_id'], REQUIRED_COLUMNS);
  // First two stay first
  assert.equal(merged[0], 'prediction_id');
  assert.equal(merged[1], 'event_id');
  // All required columns are present
  for (const col of REQUIRED_COLUMNS) assert.ok(merged.includes(col));
  // No duplicates
  assert.equal(new Set(merged).size, merged.length);
});

runTest('closing-line capture stamps selected-book price before settlement output', () => {
  const snapshot = makeMultiFactorSnapshot({
    home_team: 'Boston Red Sox',
    away_team: 'New York Yankees',
    selected_bookmaker: 'DraftKings',
  });
  const row = makeRow({ variable_snapshot: JSON.stringify(snapshot) });
  const eventsBySport = new Map([
    ['baseball:2026-04-27', [{
      id: '401584321',
      name: 'New York Yankees @ Boston Red Sox',
      state: 'pre',
      detail: 'Scheduled',
      home: { name: 'Boston Red Sox', abbreviation: 'BOS', score: null, firstFiveScore: null },
      away: { name: 'New York Yankees', abbreviation: 'NYY', score: null, firstFiveScore: null },
    }]],
  ]);
  const closingRecords = [{
    home_team: 'Boston Red Sox',
    away_team: 'New York Yankees',
    scraped_date: '2026-04-27 22:55:00 UTC',
    __source: 'scripts/.cache/sports/odds/2026-04-27/fixture.json',
    home_away_market: [
      { '1': '-105', '2': '-115', bookmaker_name: 'DraftKings' },
      { '1': '-102', '2': '-118', bookmaker_name: 'Fanduel' },
    ],
  }];
  const update = settleRow(row, eventsBySport, { 'capture-closing-lines': true }, closingRecords);
  assert.equal(update.row.closing_odds_american, '-105');
  assert.equal(update.row.closing_bookmaker, 'DraftKings');
  assert.equal(update.row.closing_odds_captured_at, '2026-04-27 22:55:00 UTC');
  assert.equal(update.row.closing_odds_source, 'scripts/.cache/sports/odds/2026-04-27/fixture.json');
  assert.equal(update.row.result, 'pending');
  assert.ok(update.changed);
});
