import assert from 'node:assert/strict';

import { buildPositioningReportNote, buildPositioningWatchlistNote } from '../pullers/positioning-report.mjs';

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

const sampleSignal = {
  rank: 1,
  asset: 'XOM',
  theme: 'Energy institutional accumulation',
  relationship: 'Institutions buying / retail ignoring',
  institutional_bias: 'accumulating',
  retail_bias: 'neglect',
  score: 7,
  confidence: 'Medium',
  strategy_role: 'Accumulation Setup',
  action_classification: 'Needs confirmation',
  matched_strategy: 'Commodity Ladder Strategy',
  vault_update_needed: 'No',
  monitoring_triggers: ['Energy ETF inflows continue', 'COT crude positioning confirms'],
  evidence: ['FMP institutional ownership', 'COT crude oil', 'technical snapshot'],
  risks: ['13F data is delayed and incomplete.'],
  firm_markers: [],
};

runTest('positioning report includes required sections and frontmatter', () => {
  const note = buildPositioningReportNote({
    date: '2026-05-02',
    marketRegime: 'Risk-on',
    overallConfidence: 'Medium',
    signals: [sampleSignal],
    sourceGaps: ['No retail order-flow feed configured'],
  });

  assert.match(note, /data_type: "positioning_report"/);
  assert.match(note, /## Executive Summary/);
  assert.match(note, /## Top Divergence Signals/);
  assert.match(note, /## Signal Deep Dives/);
  assert.match(note, /## Vault Strategy Alignment/);
  assert.match(note, /## Risk Notes/);
  assert.match(note, /13F data is delayed and incomplete/);
});

runTest('positioning watchlist uses allowed statuses', () => {
  const note = buildPositioningWatchlistNote({
    date: '2026-05-02',
    signals: [sampleSignal],
  });

  assert.match(note, /data_type: "positioning_watchlist"/);
  assert.match(note, /Needs confirmation/);
  assert.doesNotMatch(note, /Actionable now/);
});
