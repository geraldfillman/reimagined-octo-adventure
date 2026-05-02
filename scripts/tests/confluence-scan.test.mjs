import assert from 'node:assert/strict';

import { buildConfluenceNote } from '../pullers/confluence-scan.mjs';

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

runTest('renders confluence scan body sections from scored setups', () => {
  const note = buildConfluenceNote({
    date: '2026-05-02',
    regime: { label: 'Risk-On Trend', confidence: 2, basis: 'macro-vol stress 7% (low)' },
    ctx: { stressRegime: 'low', stressPct: 7, crowdingSignal: 'clear' },
    cotSignal: 'clear',
    approvedCount: 0,
    watchlistCount: 1,
    rejectedCount: 0,
    overallStatus: 'watch',
    scored: [{
      title: 'Pair Metrics',
      domain: 'Market',
      strategy: 'pairs',
      edge_type: 'statistical / relative value',
      strategy_family: 'pair mean reversion',
      signal_status: 'alert',
      severity: 'MED',
      setup_score: 19,
      raw_score: 19,
      score_tier: 'limited-risk',
      disposition: 'watchlist',
      regime_cap: null,
      vetoes: [],
      markers: {
        regime: { score: 2, status: 'WATCH', note: 'Risk-On Trend x pairs' },
        macro: { score: 3, status: 'PASS', note: 'low stress' },
        strategy: { score: 2, status: 'WATCH', note: 'alert / MED' },
        fundamental: { score: 1, status: 'WATCH', note: 'domain: Market' },
        auction: { score: 2, status: 'WATCH', note: 'module: active' },
        volume: { score: 2, status: 'WATCH', note: 'confidence 50%' },
        liquidity: { score: 2, status: 'WATCH', note: 'manual review' },
        options: { score: 0, status: 'MISSING', note: 'manual options review' },
        crowding: { score: 3, status: 'PASS', note: 'crowding: clear' },
        risk: { score: 2, status: 'WATCH', note: 'Invalidation defined' },
      },
    }],
  });

  assert.match(note, /## Regime/);
  assert.match(note, /## Summary/);
  assert.match(note, /Pair Metrics/);
  assert.match(note, /## Marker Grid/);
});
