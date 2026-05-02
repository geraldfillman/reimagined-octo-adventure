import assert from 'node:assert/strict';

import { scoreSetup } from '../lib/confluence-scorer.mjs';

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

runTest('zero-coverage review item cannot be promoted to limited-risk tier', () => {
  const scored = scoreSetup({
    title: 'Generic Alert',
    domain: 'Government',
    edge_type: 'review required',
    strategy_family: 'unclassified',
    signal_status: 'alert',
    severity: 'MED',
    confidence: '50%',
    freshness: 'Fresh',
    coverage: '0/4',
    invalidation: 'Review source note before acting',
  }, {
    regimeLabel: 'Risk-On Trend',
    stressRegime: 'low',
    stressPct: 7,
    crowdingSignal: 'clear',
    moduleStatuses: {
      'auction feature engine': 'active',
    },
  });

  assert.equal(scored.score_tier, 'watchlist');
  assert.equal(scored.disposition, 'watchlist');
  assert.ok(scored.setup_score <= 18);
  assert.ok(scored.vetoes.some(v => /corroborating module coverage/i.test(v)));
});
