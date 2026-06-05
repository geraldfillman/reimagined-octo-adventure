import assert from 'node:assert/strict';

import {
  calculateMasterScore,
  scoreOptionsGate,
  scoreShortInterestRow,
  scoreSourceCoverage,
} from '../lib/positioning-checklist/scoring.mjs';
import {
  buildPositioningChecklistNote,
  buildPositioningChecklistPayload,
} from '../pullers/positioning-checklist.mjs';

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

runTest('source coverage labels observed, derived, manual-required, and unavailable inputs', () => {
  const coverage = scoreSourceCoverage([
    { id: 'cot', label: 'CFTC COT positioning', value: 0.25, source: 'CFTC' },
    { id: 'dealer-gamma', label: 'Dealer gamma', value: null, source: 'FMP options', derived: true },
    { id: 'uw-flow', label: 'Unusual Whales flow', manualRequired: true },
    { id: 'survey', label: 'Fund manager survey' },
  ]);

  assert.deepEqual(coverage.map(item => item.status), [
    'observed',
    'derived',
    'manual_required',
    'unavailable',
  ]);
  assert.equal(coverage[2].scoreContribution, 0);
});

runTest('options gate trips hard stops for illiquid chains and rich IV', () => {
  const result = scoreOptionsGate({
    bidAskSpreadPct: 0.14,
    strikeOpenInterest: 300,
    ivPercentile: 82,
    daysToExpiration: 6,
    expectedMovePct: 0.04,
    thesisRequiredMovePct: 0.08,
    hasDirection: true,
    hasCatalyst: true,
  });

  assert.equal(result.module, 'Options / volatility quality');
  assert.equal(result.read, 'No options - use shares/ETF or wait');
  assert.equal(result.score, -1);
  assert.ok(result.hardStops.some(stop => stop.id === 'options-chain-illiquid'));
  assert.ok(result.hardStops.some(stop => stop.id === 'iv-rich-naked-premium'));
  assert.ok(result.hardStops.some(stop => stop.id === 'expiration-too-short'));
  assert.match(result.evidence.join(' '), /spread 14\.0%/);
});

runTest('options gate labels missing chain data as unavailable', () => {
  const result = scoreOptionsGate({});

  assert.equal(result.status, 'unavailable');
  assert.equal(result.score, 0);
  assert.deepEqual(result.hardStops, []);
  assert.equal(result.read, 'Options data unavailable - source refresh/manual check required');
});

runTest('short interest scoring distinguishes fuel from confirmed squeeze risk', () => {
  const result = scoreShortInterestRow({
    symbol: 'FCX',
    shortPercentFloat: 0.22,
    daysToCover: 6.4,
    borrowFeePct: 0.08,
    reportDate: '2026-05-15',
    asOfDate: '2026-05-30',
    priceConfirming: true,
  });

  assert.equal(result.status, 'observed');
  assert.equal(result.score, 1);
  assert.equal(result.read, 'High squeeze fuel - price confirming');
  assert.equal(result.ageDays, 15);
});

runTest('master score uses workbook weights and downgrades on hard stops', () => {
  const result = calculateMasterScore([
    { module: 'CFTC / positioning', score: 1, weight: 0.2 },
    { module: 'Market regime', score: 1, weight: 0.15 },
    { module: 'Catalyst timing', score: 0, weight: 0.15 },
    { module: 'ETF / vehicle quality', score: 1, weight: 0.15 },
    { module: 'Options / volatility quality', score: -1, weight: 0.15 },
    { module: 'Breadth / cross-market confirmation', score: 0, weight: 0.1 },
    { module: 'Risk-reward / execution', score: 0, weight: 0.1 },
  ], [
    { id: 'options-chain-illiquid', label: 'Options chain is illiquid / spread too wide' },
    { id: 'missing-invalidation', label: 'No invalidation level defined' },
  ]);

  assert.equal(result.weightCheck, 1);
  assert.equal(result.rawWeightedRead, 0.35);
  assert.equal(result.conviction, 68);
  assert.equal(result.directionalBias, 'Conditional long / watch');
  assert.equal(result.finalVerdict, 'No-trade / research only');
});

runTest('positioning checklist payload and note expose coverage gaps and schema fields', () => {
  const payload = buildPositioningChecklistPayload({
    date: '2026-05-30',
    modules: [
      { module: 'CFTC / positioning', score: 1, weight: 0.2, read: 'Crowded short squeeze fuel', status: 'observed', evidence: ['CFTC current row'] },
      { module: 'Options / volatility quality', score: -1, weight: 0.15, read: 'No options - use shares/ETF or wait', status: 'observed', evidence: ['spread 14.0%'] },
    ],
    coverage: [
      { id: 'cot', label: 'CFTC COT positioning', status: 'observed', source: 'CFTC' },
      { id: 'uw-flow', label: 'Unusual Whales flow alerts', status: 'manual_required', source: 'Unusual Whales' },
    ],
    hardStops: [{ id: 'options-chain-illiquid', label: 'Options chain is illiquid / spread too wide' }],
    sourceGaps: ['Unusual Whales flow alerts require paid API/manual input.'],
    warnings: ['COT freshness must be verified before trade use.'],
  });
  const note = buildPositioningChecklistNote(payload);

  assert.equal(payload.schema_version, 1);
  assert.equal(payload.score.finalVerdict, 'Lean shares/ETF or wait');
  assert.match(note, /data_type: "positioning_checklist"/);
  assert.match(note, /## Source Coverage/);
  assert.match(note, /manual_required/);
  assert.match(note, /No trade recommendations/);
});
