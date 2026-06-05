import assert from 'node:assert/strict';

import { buildInstitutionalPositioningReportNote } from '../pullers/institutional-positioning.mjs';

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

runTest('institutional positioning report has pull-note frontmatter and limitation labels', () => {
  const note = buildInstitutionalPositioningReportNote({
    date: '2026-05-13',
    symbols: ['SPY'],
    freshness: [{ source: 'SEC 13F', latestAsOf: '2026Q1', status: 'OK', notes: 'Delayed filing data' }],
    dealerGamma: [{ symbol: 'SPY', totalGammaExposure: 123, gammaFlip: null, signal_confidence: 'derived_low_confidence' }],
    shortStress: [{ symbol: 'SPY', score: 2, label: 'watch', signal_confidence: 'derived_low_confidence' }],
    crowding: [{ symbol: 'SPY', manager_count: 2, signal_confidence: 'derived_low_confidence' }],
    cot: [{ market: 'S&P 500', latest: { net: 300, net_pct_oi: 0.3, positioning_z: 1.2 }, signal_confidence: 'observed' }],
    otc: [{ source: 'FINRA', status: 'manual/API setup required', notes: 'FINRA credentials not configured' }],
    warnings: ['Dealer gamma is an OI-only model.'],
  });

  assert.match(note, /data_type: "institutional_positioning_report"/);
  assert.match(note, /## Data Freshness/);
  assert.match(note, /## Dealer Gamma/);
  assert.match(note, /## Prime-Broker Proxy Limitations/);
  assert.match(note, /derived_low_confidence/);
  assert.match(note, /Action Label: Observe/);
});
