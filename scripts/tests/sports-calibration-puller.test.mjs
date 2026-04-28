/**
 * Tests for scripts/pullers/sports-calibration.mjs — pure functions only.
 * No disk I/O, no fixtures: synthetic in-memory rows feed summarizeFromRows
 * and the helper exports.
 */

import assert from 'node:assert/strict';
import {
  spearmanCorrelation,
  averageRanks,
  isEligibleForCalibration,
  recommendWeight,
  computePerFactorIc,
  summarizeCalibration,
  summarizeFromRows,
} from '../pullers/sports-calibration.mjs';

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
  if (a === null || b === null) return a === b;
  return Math.abs(a - b) <= tol;
}

// Stub registry for IC lookups: returns weights so recommendation can fire.
const stubRegistry = {
  byId: {
    'mlb-pitcher-fip':  { id: 'mlb-pitcher-fip',  sport: 'mlb', weight: 1.0 },
    'mlb-park-factor':  { id: 'mlb-park-factor',  sport: 'mlb', weight: 0.5 },
    'nba-net-rating':   { id: 'nba-net-rating',   sport: 'nba', weight: 1.2 },
  },
  bySport(sport) {
    return Object.values(this.byId).filter(f => f.sport === sport);
  },
};

function row({ sport = 'mlb', result = 'win', factors = [], coverage = 0.8, modelVersion = 'multi-factor-v1', date = '2026-04-15' } = {}) {
  return {
    predictionId: 'p',
    date,
    sport: 'baseball',
    league: 'MLB',
    probability: 0.55,
    result,
    modelVersion,
    factorKey: sport,
    factorCoverageRatio: coverage,
    factorCountTotal: factors.length,
    factorCountUsed: factors.length,
    factorContributions: factors,
  };
}

// ── Spearman / averageRanks ─────────────────────────────────────────────────

runTest('spearman: known negative correlation pair gives negative IC', () => {
  // Higher contribution → loss; lower contribution → win
  const xs = [1, 2, 3, 4]; // contributions
  const ys = [1, 1, 0, 0]; // outcomes
  const ic = spearmanCorrelation(xs, ys);
  assert.ok(ic < 0, `expected negative IC, got ${ic}`);
});

runTest('spearman: identical y-values returns 0 (zero variance in ranks)', () => {
  const ic = spearmanCorrelation([1, 2, 3, 4], [1, 1, 1, 1]);
  assert.equal(ic, 0);
});

runTest('spearman: requires at least 2 paired observations', () => {
  assert.equal(spearmanCorrelation([1], [1]), null);
  assert.equal(spearmanCorrelation([], []), null);
});

runTest('spearman: mismatched array lengths return null', () => {
  assert.equal(spearmanCorrelation([1, 2, 3], [1, 0]), null);
});

runTest('averageRanks: handles ties via average ranks', () => {
  // values [1, 1, 2, 2] → ranks averaged: positions 1,2 average to 1.5; 3,4 → 3.5
  const ranks = averageRanks([1, 1, 2, 2]);
  assert.deepEqual(ranks, [1.5, 1.5, 3.5, 3.5]);
});

runTest('spearman: ties at the same x with mixed y produce IC ~ 0', () => {
  // (1,1), (1,0), (2,1), (2,0) — perfectly balanced → near-zero correlation
  const ic = spearmanCorrelation([1, 1, 2, 2], [1, 0, 1, 0]);
  assert.ok(approxEqual(ic, 0), `expected ~0, got ${ic}`);
});

// ── Row eligibility ─────────────────────────────────────────────────────────

runTest('eligibility: only multi-factor-v1 rows count', () => {
  const r = row({ result: 'win', factors: [{ id: 'mlb-pitcher-fip', contribution: 0.1 }], modelVersion: 'market-consensus-v1' });
  assert.equal(isEligibleForCalibration(r), false);
});

runTest('eligibility: rows with empty factor_contributions_top5 are skipped', () => {
  const r = row({ result: 'win', factors: [] });
  assert.equal(isEligibleForCalibration(r), false);
});

runTest('eligibility: pending and push results are skipped', () => {
  const pending = row({ result: 'pending', factors: [{ id: 'x', contribution: 0.1 }] });
  const push    = row({ result: 'push',    factors: [{ id: 'x', contribution: 0.1 }] });
  assert.equal(isEligibleForCalibration(pending), false);
  assert.equal(isEligibleForCalibration(push), false);
});

runTest('eligibility: a fully-formed multi-factor-v1 win row passes', () => {
  const r = row({ result: 'win', factors: [{ id: 'mlb-pitcher-fip', contribution: 0.1 }] });
  assert.equal(isEligibleForCalibration(r), true);
});

// ── Weight recommendation formula ───────────────────────────────────────────

runTest('recommendWeight: applies (1+IC) when |IC| >= 0.05 and N >= 100', () => {
  const proposed = recommendWeight(1.0, 0.10, 150);
  assert.ok(approxEqual(proposed, 1.10), `expected 1.10, got ${proposed}`);
});

runTest('recommendWeight: clamps at the floor (0.1)', () => {
  // Strongly negative IC trying to push the weight below 0.1
  const proposed = recommendWeight(0.2, -0.95, 200);
  assert.ok(proposed >= 0.1 - 1e-9, `expected >= 0.1, got ${proposed}`);
});

runTest('recommendWeight: clamps at 3x the current weight', () => {
  const proposed = recommendWeight(0.5, 5.0, 200);
  assert.ok(approxEqual(proposed, 1.5), `expected 1.5 (3 * 0.5), got ${proposed}`);
});

runTest('recommendWeight: returns null when |IC| < 0.05', () => {
  assert.equal(recommendWeight(1.0, 0.04, 200), null);
});

runTest('recommendWeight: returns null when N < 100', () => {
  assert.equal(recommendWeight(1.0, 0.20, 99), null);
});

runTest('recommendWeight: returns null when weight is missing', () => {
  assert.equal(recommendWeight(null, 0.20, 200), null);
});

// ── Per-sport bucketing by factor_key ───────────────────────────────────────

runTest('per-sport summary buckets by factorKey, not the CSV sport column', () => {
  // Two rows whose CSV sport is "baseball" but whose factorKey is "mlb"
  // (this is exactly the prediction puller's mapping) — they should land
  // in the "mlb" bucket of the summary, not "baseball".
  const rows = [
    row({ sport: 'mlb', result: 'win',  factors: [{ id: 'mlb-pitcher-fip', contribution: 0.2 }] }),
    row({ sport: 'mlb', result: 'loss', factors: [{ id: 'mlb-pitcher-fip', contribution: -0.1 }] }),
    row({ sport: 'nba', result: 'win',  factors: [{ id: 'nba-net-rating', contribution: 0.3 }] }),
    row({ sport: 'nba', result: 'win',  factors: [{ id: 'nba-net-rating', contribution: 0.4 }] }),
  ];
  const summary = summarizeFromRows(rows, stubRegistry);
  const sports = summary.perSport.map(s => s.sport).sort();
  assert.deepEqual(sports, ['mlb', 'nba']);
});

// ── Empty / malformed input ─────────────────────────────────────────────────

runTest('summarize: empty input returns an empty summary without crashing', () => {
  const summary = summarizeCalibration([], stubRegistry);
  assert.equal(summary.perSport.length, 0);
  assert.equal(summary.icTable.length, 0);
  assert.deepEqual(summary.weightRecommendations, {});
  assert.equal(summary.overall.sampleSize, 0);
  assert.equal(summary.miscalibrationAlerts.length, 0);
});

runTest('summarize: factor with N below 30 is excluded from IC table', () => {
  const rows = Array.from({ length: 20 }, (_, i) => row({
    sport: 'mlb',
    result: i % 2 === 0 ? 'win' : 'loss',
    factors: [{ id: 'mlb-park-factor', contribution: i / 20 }],
  }));
  const summary = summarizeFromRows(rows, stubRegistry);
  assert.equal(summary.icTable.length, 0, 'fewer than 30 paired observations should drop the factor');
});

runTest('summarize: factor with N >= 30 produces an IC entry', () => {
  // Build 40 rows of mlb-pitcher-fip; positive contribution → win, negative → loss
  const rows = Array.from({ length: 40 }, (_, i) => row({
    sport: 'mlb',
    result: i % 2 === 0 ? 'win' : 'loss',
    factors: [{ id: 'mlb-pitcher-fip', contribution: (i % 2 === 0 ? 1 : -1) * (i + 1) }],
  }));
  const summary = summarizeFromRows(rows, stubRegistry);
  const entry = summary.icTable.find(e => e.factorId === 'mlb-pitcher-fip');
  assert.ok(entry, 'expected entry for mlb-pitcher-fip');
  assert.equal(entry.sampleSize, 40);
  assert.ok(entry.ic > 0, `expected positive IC, got ${entry.ic}`);
  assert.equal(entry.currentWeight, 1.0, 'should pick up weight from stub registry');
});

runTest('computePerFactorIc: returns sorted by |IC| descending', () => {
  // Strong factor (perfect rank correlation) and weak factor (mixed)
  const strongRows = Array.from({ length: 40 }, (_, i) => row({
    sport: 'mlb',
    result: i < 20 ? 'win' : 'loss',
    factors: [{ id: 'mlb-pitcher-fip', contribution: 40 - i }],
  }));
  const weakRows = Array.from({ length: 40 }, (_, i) => row({
    sport: 'mlb',
    result: i % 2 === 0 ? 'win' : 'loss',
    factors: [{ id: 'mlb-park-factor', contribution: (i * 7) % 13 }],
  }));
  const ic = computePerFactorIc([...strongRows, ...weakRows], stubRegistry);
  assert.ok(ic.length >= 2);
  assert.ok(Math.abs(ic[0].ic) >= Math.abs(ic[1].ic), 'expected sorted by |IC| desc');
});

// ── Malformed snapshot is skipped (simulated by missing factors) ────────────

runTest('rows with no factor_contributions are skipped from IC entirely', () => {
  // Row that "looks" eligible by version+result but has no contributions
  // (this is what enrichRow returns when JSON.parse fails or the array is empty
  //  — ineligible by isEligibleForCalibration; but if it leaks in, it must
  //  not blow up the IC computation).
  const rows = [
    row({ sport: 'mlb', result: 'win',  factors: [] }),
    row({ sport: 'mlb', result: 'loss', factors: [] }),
  ];
  const summary = summarizeFromRows(rows.filter(isEligibleForCalibration), stubRegistry);
  assert.equal(summary.icTable.length, 0);
  assert.equal(summary.predictionCountEligible || 0, 0);
});

// ── Coverage trend ──────────────────────────────────────────────────────────

runTest('weekly coverage groups by ISO week start (Monday, UTC)', () => {
  // 2026-04-15 is a Wednesday → week starts Monday 2026-04-13
  // 2026-04-22 is a Wednesday → week starts Monday 2026-04-20
  const rows = [
    row({ sport: 'mlb', result: 'win',  factors: [{ id: 'mlb-pitcher-fip', contribution: 0.1 }], coverage: 0.8, date: '2026-04-15' }),
    row({ sport: 'mlb', result: 'loss', factors: [{ id: 'mlb-pitcher-fip', contribution: 0.0 }], coverage: 0.6, date: '2026-04-15' }),
    row({ sport: 'mlb', result: 'win',  factors: [{ id: 'mlb-pitcher-fip', contribution: 0.1 }], coverage: 1.0, date: '2026-04-22' }),
  ];
  const summary = summarizeFromRows(rows, stubRegistry);
  assert.equal(summary.weeklyCoverage.length, 2);
  assert.equal(summary.weeklyCoverage[0].weekStart, '2026-04-13');
  assert.equal(summary.weeklyCoverage[1].weekStart, '2026-04-20');
  assert.ok(approxEqual(summary.weeklyCoverage[0].meanCoverage, 0.7), 'mean of 0.8 and 0.6');
  assert.ok(approxEqual(summary.weeklyCoverage[1].meanCoverage, 1.0));
});

// ── Miscalibration alerts ───────────────────────────────────────────────────

runTest('miscalibration alert fires when sport Brier exceeds market baseline', () => {
  // Construct rows with very wrong probabilities so Brier blows past 0.247.
  // probability=0.95 then result=loss → squared error 0.9025 per row.
  const rows = Array.from({ length: 20 }, () => ({
    ...row({ sport: 'mlb', result: 'loss', factors: [{ id: 'mlb-pitcher-fip', contribution: 0.1 }] }),
    probability: 0.95,
  }));
  const summary = summarizeFromRows(rows, stubRegistry);
  const alerts = summary.miscalibrationAlerts.filter(a => a.kind === 'brier_above_market_baseline');
  assert.ok(alerts.length > 0, 'expected at least one Brier-above-baseline alert');
});
