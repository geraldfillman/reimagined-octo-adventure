/**
 * Tests for the Corporate Health, Integrity & Market-Behavior marker layer.
 *
 * Pure-function coverage only — no network, no writes:
 *   - lib/health-markers.mjs band classification (§5.3–§5.7, §9.2)
 *   - bank/REIT leverage suppression (§14)
 *   - signal rollup (summarizeMarkers)
 *   - pullers/edgar-health.mjs series extraction from a company-facts fixture
 *
 * Run: node scripts/tests/edgar-health.test.mjs
 */

import assert from 'node:assert/strict';

import {
  BAND,
  computeHealthMarkers,
  computeRelativeReturn,
  relativePerformanceMarker,
  summarizeMarkers,
} from '../lib/health-markers.mjs';
import { buildHealthSeries, markerTableRows } from '../pullers/edgar-health.mjs';
import { fiscalYearValues } from '../pullers/edgar-company.mjs';

let failures = 0;
function runTest(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (err) {
    failures++;
    console.error(`not ok - ${name}`);
    console.error(`  ${err.message}`);
  }
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

const ENDS = ['2026-01-31', '2025-01-31', '2024-01-31', '2023-01-31', '2022-01-31'];

/** Newest-first fiscal-year series entries with aligned period ends. */
function fy(values) {
  return values.map((value, i) => Object.freeze({ value, end: ENDS[i], form: '10-K' }));
}

function markerByKey(markers, key) {
  const m = markers.find(x => x.key === key);
  assert.ok(m, `marker ${key} missing`);
  return m;
}

/** Healthy non-financial filer: every §5 marker should land constructive. */
const HEALTHY_SERIES = Object.freeze({
  revenue: fy([1000, 900]),
  netIncome: fy([100, 90, 80, 70, 60]),
  operatingCashFlow: fy([120, 110, 100, 90, 80]),
  capex: fy([20, 20, 20, 20, 20]),
  receivables: fy([100, 95]),
  inventory: fy([50, 48]),
  costOfRevenue: fy([500, 460]),
  operatingIncome: fy([200]),
  depreciationAmortization: fy([50]),
  interestExpense: fy([10]),
  cash: fy([300]),
  shortTermInvestments: fy([50]),
  debtLongTerm: fy([100]),
  debtCurrent: fy([0]),
  dilutedShares: fy([990, 1000]),
  sbc: fy([30]),
  dividendsPaid: fy([40]),
  buybacks: fy([50]),
});

/** Deteriorating filer: every computable §5 marker should land concern. */
const CONCERN_SERIES = Object.freeze({
  revenue: fy([1050, 1000]),
  netIncome: fy([100, 90, 80]),
  operatingCashFlow: fy([50, 60, 70]),
  capex: fy([40, 40, 40]),
  receivables: fy([200, 100]),
  inventory: fy([200, 100]),
  costOfRevenue: fy([500, 490]),
  operatingIncome: fy([100]),
  depreciationAmortization: fy([20]),
  interestExpense: fy([60]),
  cash: fy([50]),
  shortTermInvestments: fy([0]),
  debtLongTerm: fy([600]),
  debtCurrent: fy([0]),
  dilutedShares: fy([1100, 1000]),
  sbc: fy([200]),
  dividendsPaid: fy([100]),
  buybacks: fy([50]),
});

// ─── §5 band classification ──────────────────────────────────────────────────

runTest('healthy series classifies every marker constructive', () => {
  const markers = computeHealthMarkers(HEALTHY_SERIES, { profileKey: 'general' });
  for (const m of markers) {
    assert.equal(m.band, BAND.CONSTRUCTIVE, `${m.key} → ${m.band} (${m.detail})`);
  }
});

runTest('deteriorating series classifies every marker concern', () => {
  const markers = computeHealthMarkers(CONCERN_SERIES, { profileKey: 'general' });
  for (const m of markers) {
    assert.equal(m.band, BAND.CONCERN, `${m.key} → ${m.band} (${m.detail})`);
  }
});

runTest('FCF conversion uses cumulative multi-year window', () => {
  // 5y: FCF = 500-100 = 400 vs NI 400 → 1.0 constructive
  const m = markerByKey(computeHealthMarkers(HEALTHY_SERIES), 'fcf_conversion');
  assert.ok(Math.abs(m.value - 1.0) < 1e-9, `expected 1.0, got ${m.value}`);
});

runTest('FCF conversion with cumulative losses is an explicit gap, not a score', () => {
  const series = {
    ...HEALTHY_SERIES,
    netIncome: fy([-10, -20, -30, -40, -50]),
  };
  const m = markerByKey(computeHealthMarkers(series), 'fcf_conversion');
  assert.equal(m.band, BAND.NA);
  assert.match(m.detail, /net income ≤ 0/);
});

runTest('receivable divergence: 5–10pp lands investigate', () => {
  const series = {
    ...HEALTHY_SERIES,
    revenue: fy([1100, 1000]),      // +10%
    receivables: fy([118, 100]),    // +18% → divergence 8pp
  };
  const m = markerByKey(computeHealthMarkers(series), 'receivable_divergence');
  assert.equal(m.band, BAND.INVESTIGATE);
});

runTest('missing inventory is n/a (asset-light), not concern', () => {
  const series = { ...HEALTHY_SERIES, inventory: [] };
  const m = markerByKey(computeHealthMarkers(series), 'inventory_divergence');
  assert.equal(m.band, BAND.NA);
});

runTest('bank profile suppresses §5.5 leverage bands per §14', () => {
  const markers = computeHealthMarkers(CONCERN_SERIES, { profileKey: 'bank' });
  for (const key of ['net_debt_ebitda', 'interest_coverage']) {
    const m = markerByKey(markers, key);
    assert.equal(m.band, BAND.NA, `${key} should be suppressed for banks`);
    assert.match(m.detail, /§14/);
  }
});

runTest('reit profile suppresses leverage and annotates payout with AFFO note', () => {
  const markers = computeHealthMarkers(CONCERN_SERIES, { profileKey: 'reit' });
  assert.equal(markerByKey(markers, 'net_debt_ebitda').band, BAND.NA);
  assert.match(markerByKey(markers, 'dividend_to_fcf').detail, /AFFO/);
});

runTest('net cash position is constructive regardless of EBITDA size', () => {
  const series = {
    ...CONCERN_SERIES,
    cash: fy([2000]),
  };
  const m = markerByKey(computeHealthMarkers(series), 'net_debt_ebitda');
  assert.equal(m.band, BAND.CONSTRUCTIVE);
  assert.equal(m.display, 'net cash');
});

runTest('no dividend and no buybacks are explicit gaps, not judgments', () => {
  const series = { ...HEALTHY_SERIES, dividendsPaid: [], buybacks: [] };
  const markers = computeHealthMarkers(series);
  assert.equal(markerByKey(markers, 'dividend_to_fcf').band, BAND.NA);
  assert.equal(markerByKey(markers, 'buyback_offset').band, BAND.NA);
});

runTest('dividend paid against non-positive FCF is a concern', () => {
  const series = {
    ...HEALTHY_SERIES,
    operatingCashFlow: fy([10, 110, 100, 90, 80]),
    capex: fy([20, 20, 20, 20, 20]),
  };
  const m = markerByKey(computeHealthMarkers(series), 'dividend_to_fcf');
  assert.equal(m.band, BAND.CONCERN);
});

runTest('buybacks that fail to offset issuance are a concern (§5.6)', () => {
  const series = {
    ...HEALTHY_SERIES,
    buybacks: fy([500]),
    dilutedShares: fy([1050, 1000]), // +5% despite buybacks
  };
  const m = markerByKey(computeHealthMarkers(series), 'buyback_offset');
  assert.equal(m.band, BAND.CONCERN);
});

// ─── Stale-tag guards (retired XBRL concepts must not mix periods) ───────────

/** Entries whose latest end predates the core series by `yearsBehind`. */
function staleFy(values, yearsBehind = 3) {
  return values.map((value, i) => Object.freeze({
    value,
    end: `${2026 - yearsBehind - i}-01-31`,
    form: '10-K',
  }));
}

runTest('stale debt tags produce an explicit gap, not a fabricated ratio', () => {
  const series = { ...CONCERN_SERIES, debtLongTerm: staleFy([600]), debtCurrent: [] };
  const m = markerByKey(computeHealthMarkers(series), 'net_debt_ebitda');
  assert.equal(m.band, BAND.NA);
  assert.match(m.detail, /last reported FY2023/);
});

runTest('stale interest tag produces a gap instead of period-mixed coverage', () => {
  const series = { ...CONCERN_SERIES, interestExpense: staleFy([60]) };
  const m = markerByKey(computeHealthMarkers(series), 'interest_coverage');
  assert.equal(m.band, BAND.NA);
  assert.match(m.detail, /last tagged FY2023/);
});

runTest('stale buyback and dividend tags read as "stopped", not current activity', () => {
  const series = {
    ...HEALTHY_SERIES,
    buybacks: staleFy([50]),
    dividendsPaid: staleFy([40]),
  };
  const markers = computeHealthMarkers(series);
  assert.equal(markerByKey(markers, 'buyback_offset').band, BAND.NA);
  assert.equal(markerByKey(markers, 'dividend_to_fcf').band, BAND.NA);
  assert.match(markerByKey(markers, 'dividend_to_fcf').detail, /cut or suspended/);
});

runTest('EBITDA components reporting different periods produce a gap', () => {
  const series = {
    ...CONCERN_SERIES,
    depreciationAmortization: [{ value: 20, end: '2025-01-31', form: '10-K' }], // one year behind opInc
  };
  const m = markerByKey(computeHealthMarkers(series), 'net_debt_ebitda');
  assert.equal(m.band, BAND.NA);
  assert.match(m.detail, /different periods/);
});

runTest('FCF conversion shrinks to the period-aligned window and gaps below 2 years', () => {
  // capex retired after FY2024: only 2024/2023/2022 align with nothing at index 0 → aligned prefix 0
  const series = {
    ...HEALTHY_SERIES,
    capex: [
      { value: 20, end: '2024-01-31', form: '10-K' },
      { value: 20, end: '2023-01-31', form: '10-K' },
    ],
  };
  const m = markerByKey(computeHealthMarkers(series), 'fcf_conversion');
  assert.equal(m.band, BAND.NA);
  assert.match(m.detail, /period-aligned/);
});

runTest('growth across a filing-gap year is not treated as one-year growth', () => {
  const series = {
    ...HEALTHY_SERIES,
    receivables: [
      { value: 200, end: '2026-01-31', form: '10-K' },
      { value: 100, end: '2024-01-31', form: '10-K' }, // 2025 missing
    ],
  };
  const m = markerByKey(computeHealthMarkers(series), 'receivable_divergence');
  assert.equal(m.band, BAND.NA, `expected gap, got ${m.band} (${m.detail})`);
});

runTest('dividend payout gaps when capex reports a different period than OCF', () => {
  const series = {
    ...HEALTHY_SERIES,
    capex: [{ value: 20, end: '2025-01-31', form: '10-K' }],
  };
  const m = markerByKey(computeHealthMarkers(series), 'dividend_to_fcf');
  assert.equal(m.band, BAND.NA);
  assert.match(m.detail, /different periods/);
});

runTest('stale cash components are excluded from net debt', () => {
  // Fresh debt, stale cash: net debt must not be reduced by a years-old cash balance.
  const series = {
    ...CONCERN_SERIES,
    cash: staleFy([5000]),
    shortTermInvestments: [],
  };
  const m = markerByKey(computeHealthMarkers(series), 'net_debt_ebitda');
  assert.equal(m.band, BAND.CONCERN, `expected concern, got ${m.band} (${m.detail})`);
});

// ─── §9.2 relative performance ───────────────────────────────────────────────

runTest('relative return computes from oldest→newest closes', () => {
  const stock = [{ close: 100 }, { close: 105 }, { close: 110 }];
  const bench = [{ close: 100 }, { close: 140 }];
  const rel = computeRelativeReturn(stock, bench);
  assert.ok(Math.abs(rel.stockPct - 10) < 1e-9);
  assert.ok(Math.abs(rel.benchmarkPct - 40) < 1e-9);
  assert.ok(Math.abs(rel.relativePp - -30) < 1e-9);
});

runTest('relative return is null on unusable input', () => {
  assert.equal(computeRelativeReturn([{ close: 100 }], [{ close: 100 }, { close: 110 }]), null);
  assert.equal(computeRelativeReturn(null, [{ close: 100 }, { close: 110 }]), null);
});

runTest('≥20pp underperformance triggers the §9.2 investigate prompt', () => {
  const rel = { stockPct: 5, benchmarkPct: 30, relativePp: -25 };
  assert.equal(relativePerformanceMarker(rel, 'SPY').band, BAND.INVESTIGATE);
  const ok = { stockPct: 5, benchmarkPct: 10, relativePp: -5 };
  assert.equal(relativePerformanceMarker(ok, 'SPY').band, BAND.CONSTRUCTIVE);
  assert.equal(relativePerformanceMarker(null, 'SPY').band, BAND.NA);
});

// ─── Signal rollup ───────────────────────────────────────────────────────────

runTest('summarizeMarkers: clear when nothing is a concern', () => {
  const markers = computeHealthMarkers(HEALTHY_SERIES);
  const summary = summarizeMarkers(markers, 'TST');
  assert.equal(summary.status, 'clear');
  assert.equal(summary.signals.length, 0);
});

runTest('summarizeMarkers: 1–2 concerns → watch, 3+ → alert, signals namespaced', () => {
  const one = summarizeMarkers([
    { key: 'a', band: BAND.CONCERN }, { key: 'b', band: BAND.CONSTRUCTIVE },
  ], 'TST');
  assert.equal(one.status, 'watch');
  assert.deepEqual([...one.signals], ['health:tst:a:concern']);

  const many = summarizeMarkers(computeHealthMarkers(CONCERN_SERIES), 'TST');
  assert.equal(many.status, 'alert');
  assert.ok(many.signals.every(s => /^health:tst:[a-z_]+:concern$/.test(s)));
});

// ─── Series extraction from company-facts ────────────────────────────────────

function annualFact(val, fyEndYear, endMonthDay = '01-31') {
  const end = `${fyEndYear}-${endMonthDay}`;
  const start = `${fyEndYear - 1}-02-01`;
  return { val, start, end, fy: fyEndYear, fp: 'FY', form: '10-K', filed: `${fyEndYear}-03-15` };
}

const FACTS_FIXTURE = {
  facts: {
    'us-gaap': {
      NetIncomeLoss: { units: { USD: [2022, 2023, 2024, 2025, 2026].map(y => annualFact(y * 10, y)) } },
      Revenues: { units: { USD: [2025, 2026].map(y => annualFact(y * 100, y)) } },
      WeightedAverageNumberOfDilutedSharesOutstanding: {
        units: { shares: [2025, 2026].map(y => annualFact(1_000_000 + y, y)) },
      },
    },
  },
};

runTest('fiscalYearValues honors the new limit option (default stays 2)', () => {
  const spec = ['NetIncomeLoss'];
  assert.equal(fiscalYearValues(FACTS_FIXTURE, spec).length, 2);
  const six = fiscalYearValues(FACTS_FIXTURE, spec, { limit: 6 });
  assert.equal(six.length, 5);
  assert.equal(six[0].end, '2026-01-31'); // newest-first
  assert.equal(six[4].end, '2022-01-31');
});

runTest('buildHealthSeries extracts multi-year series and shares unit', () => {
  const series = buildHealthSeries(FACTS_FIXTURE);
  assert.equal(series.netIncome.length, 5);
  assert.equal(series.revenue.length, 2);
  assert.equal(series.dilutedShares.length, 2);
  assert.equal(series.inventory.length, 0); // absent concept → empty, not fabricated
});

runTest('markerTableRows renders one row per marker with band icon', () => {
  const rows = markerTableRows(computeHealthMarkers(HEALTHY_SERIES));
  assert.equal(rows.length, 10);
  assert.ok(rows.every(r => r.length === 5));
  assert.match(rows[0][0], /constructive/);
});

if (failures > 0) {
  process.exitCode = 1;
  console.error(`\n${failures} test(s) failed`);
} else {
  console.log('\nall tests passed');
}
