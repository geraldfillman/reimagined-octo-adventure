/**
 * Tests for lib/dilution-rules.mjs — pure rule engine, no I/O.
 *
 * TDD: these assertions define the contract. Anything failing here
 * is a rule-engine bug, not a data bug.
 */

import assert from 'node:assert/strict';
import {
  computeCashRunway,
  computeShelfCapacity,
  computeAtmToFloat,
  classifyOverallRisk,
  evaluateDilutionSignals,
  detectStateTransitions,
  RUNWAY_THRESHOLDS,
  ATM_FLOAT_THRESHOLDS,
} from '../lib/dilution-rules.mjs';

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

// ── computeCashRunway ────────────────────────────────────────────────────────
// Input: { cash, shortTermInvestments, quarterlyOperatingCashFlow: [q1..q4] }
// Output: months of runway (positive numeric) or Infinity when net-positive.

runTest('runway: infinite when operating cash flow is positive', () => {
  const result = computeCashRunway({
    cash: 10_000_000,
    shortTermInvestments: 0,
    quarterlyOperatingCashFlow: [1_000_000, 2_000_000, 1_500_000, 800_000],
  });
  assert.equal(result, Infinity);
});

runTest('runway: computes months from avg quarterly burn', () => {
  // $30M on hand, burning $6M/quarter → $2M/mo → 15 months
  const result = computeCashRunway({
    cash: 20_000_000,
    shortTermInvestments: 10_000_000,
    quarterlyOperatingCashFlow: [-6_000_000, -6_000_000, -6_000_000, -6_000_000],
  });
  assert.equal(result, 15);
});

runTest('runway: handles null / missing short-term investments', () => {
  const result = computeCashRunway({
    cash: 12_000_000,
    shortTermInvestments: null,
    quarterlyOperatingCashFlow: [-3_000_000, -3_000_000, -3_000_000, -3_000_000],
  });
  assert.equal(result, 12); // 12M / (9M avg /3mo) = 12 months
});

runTest('runway: null when no cash flow history', () => {
  const result = computeCashRunway({
    cash: 5_000_000,
    shortTermInvestments: 0,
    quarterlyOperatingCashFlow: [],
  });
  assert.equal(result, null);
});

// ── computeShelfCapacity ─────────────────────────────────────────────────────
// shelf_max − Σ(takedown_proceeds_last_24mo)

runTest('shelf capacity: returns remaining headroom', () => {
  const result = computeShelfCapacity({
    shelfMaxUsd: 300_000_000,
    takedowns: [
      { proceedsUsd: 50_000_000, date: '2025-10-01' },
      { proceedsUsd: 75_000_000, date: '2026-01-15' },
    ],
  });
  assert.equal(result, 175_000_000);
});

runTest('shelf capacity: ignores takedowns older than 24 months', () => {
  // "Today" defaults to when shelf was effective; pass explicit today for determinism.
  const result = computeShelfCapacity({
    shelfMaxUsd: 100_000_000,
    takedowns: [
      { proceedsUsd: 40_000_000, date: '2023-01-01' }, // >24mo old → excluded
      { proceedsUsd: 20_000_000, date: '2026-01-01' },
    ],
    today: '2026-04-23',
  });
  assert.equal(result, 80_000_000);
});

runTest('shelf capacity: zero when exhausted', () => {
  const result = computeShelfCapacity({
    shelfMaxUsd: 50_000_000,
    takedowns: [{ proceedsUsd: 60_000_000, date: '2026-03-01' }],
    today: '2026-04-23',
  });
  assert.equal(result, 0); // clamped; can't go negative
});

// ── computeAtmToFloat ────────────────────────────────────────────────────────

runTest('atm-to-float: ratio when both present', () => {
  const result = computeAtmToFloat({ atmCapacityUsd: 50_000_000, floatShares: 20_000_000, price: 5 });
  // float market value = $100M; atm / float = 0.5
  assert.equal(result, 0.5);
});

runTest('atm-to-float: null when float missing', () => {
  const result = computeAtmToFloat({ atmCapacityUsd: 50_000_000, floatShares: null, price: 5 });
  assert.equal(result, null);
});

// ── classifyOverallRisk ─────────────────────────────────────────────────────
// Input: metrics object; Output: 'low' | 'medium' | 'high' | 'critical'

runTest('classify: critical when runway < 3 months', () => {
  const r = classifyOverallRisk({ cashRunwayMonths: 2, atmToFloat: 0, shelfHeadroomUsd: 0, nasdaqCompliant: true });
  assert.equal(r, 'critical');
});

runTest('classify: high when runway 3–6 OR atm>50% float', () => {
  const fromRunway = classifyOverallRisk({ cashRunwayMonths: 5, atmToFloat: 0, shelfHeadroomUsd: 0, nasdaqCompliant: true });
  assert.equal(fromRunway, 'high');
  const fromAtm = classifyOverallRisk({ cashRunwayMonths: 24, atmToFloat: 0.6, shelfHeadroomUsd: 0, nasdaqCompliant: true });
  assert.equal(fromAtm, 'high');
});

runTest('classify: high when nasdaq non-compliant', () => {
  const r = classifyOverallRisk({ cashRunwayMonths: 24, atmToFloat: 0, shelfHeadroomUsd: 0, nasdaqCompliant: false });
  assert.equal(r, 'high');
});

runTest('classify: medium when runway 6–12 or large shelf available', () => {
  const r = classifyOverallRisk({ cashRunwayMonths: 9, atmToFloat: 0.1, shelfHeadroomUsd: 0, nasdaqCompliant: true });
  assert.equal(r, 'medium');
});

runTest('classify: low when runway >12 and no offering pressure', () => {
  const r = classifyOverallRisk({ cashRunwayMonths: 36, atmToFloat: 0.05, shelfHeadroomUsd: 0, nasdaqCompliant: true });
  assert.equal(r, 'low');
});

// ── evaluateDilutionSignals ─────────────────────────────────────────────────
// Output: array of { code, severity, message } — consumable by lib/signals.mjs formatter.

runTest('signals: emits critical for sub-3-month runway', () => {
  const signals = evaluateDilutionSignals({
    cashRunwayMonths: 2,
    atmToFloat: 0,
    shelfHeadroomUsd: 0,
    newShelfEffective: false,
    nasdaqCompliant: true,
  });
  const runwaySignal = signals.find(s => s.code === 'cash_runway');
  assert.ok(runwaySignal, 'expected a cash_runway signal');
  assert.equal(runwaySignal.severity, 'critical');
});

runTest('signals: alert on new shelf effective', () => {
  const signals = evaluateDilutionSignals({
    cashRunwayMonths: 24,
    atmToFloat: 0,
    shelfHeadroomUsd: 200_000_000,
    newShelfEffective: true,
    nasdaqCompliant: true,
  });
  const shelf = signals.find(s => s.code === 'shelf_new');
  assert.ok(shelf);
  assert.equal(shelf.severity, 'alert');
});

runTest('signals: alert on ATM > 50% of float', () => {
  const signals = evaluateDilutionSignals({
    cashRunwayMonths: 24,
    atmToFloat: 0.55,
    shelfHeadroomUsd: 0,
    newShelfEffective: false,
    nasdaqCompliant: true,
  });
  const atm = signals.find(s => s.code === 'atm_capacity');
  assert.ok(atm);
  assert.equal(atm.severity, 'alert');
});

runTest('signals: alert on nasdaq non-compliance', () => {
  const signals = evaluateDilutionSignals({
    cashRunwayMonths: 24,
    atmToFloat: 0,
    shelfHeadroomUsd: 0,
    newShelfEffective: false,
    nasdaqCompliant: false,
  });
  const nc = signals.find(s => s.code === 'nasdaq_compliance');
  assert.ok(nc);
  assert.equal(nc.severity, 'alert');
});

runTest('signals: empty (clear) when all metrics healthy', () => {
  const signals = evaluateDilutionSignals({
    cashRunwayMonths: 36,
    atmToFloat: 0.05,
    shelfHeadroomUsd: 0,
    newShelfEffective: false,
    nasdaqCompliant: true,
  });
  assert.equal(signals.length, 0);
});

// ── detectStateTransitions ──────────────────────────────────────────────────
// Given prior and current risk-class, return transition signal code or null.
// Only upgrades (worsening) should alert; downgrades are informational.

runTest('transitions: low → medium emits watch', () => {
  const t = detectStateTransitions({ prior: 'low', current: 'medium' });
  assert.equal(t?.code, 'risk_upgrade');
  assert.equal(t?.severity, 'watch');
});

runTest('transitions: medium → high emits alert', () => {
  const t = detectStateTransitions({ prior: 'medium', current: 'high' });
  assert.equal(t?.severity, 'alert');
});

runTest('transitions: any → critical emits critical', () => {
  const t = detectStateTransitions({ prior: 'medium', current: 'critical' });
  assert.equal(t?.severity, 'critical');
});

runTest('transitions: high → medium returns null (no downgrade alert)', () => {
  const t = detectStateTransitions({ prior: 'high', current: 'medium' });
  assert.equal(t, null);
});

runTest('transitions: no change returns null', () => {
  const t = detectStateTransitions({ prior: 'medium', current: 'medium' });
  assert.equal(t, null);
});

runTest('transitions: missing prior (first run) returns null', () => {
  const t = detectStateTransitions({ prior: null, current: 'high' });
  assert.equal(t, null);
});

// ── Thresholds exposed as named constants ───────────────────────────────────

runTest('thresholds exported and immutable', () => {
  assert.ok(RUNWAY_THRESHOLDS.critical <= 3);
  assert.ok(RUNWAY_THRESHOLDS.high <= 6);
  assert.ok(ATM_FLOAT_THRESHOLDS.alert <= 0.5);
  assert.throws(() => { RUNWAY_THRESHOLDS.critical = 99; });
});
