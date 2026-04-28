/**
 * Tests for lib/prediction-market-client.mjs - relevance gates, no network.
 */

import assert from 'node:assert/strict';
import { isRelevantMarket } from '../lib/prediction-market-client.mjs';

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

runTest('BTC query accepts bitcoin aliases', () => {
  assert.equal(isRelevantMarket({ title: "Will Satoshi's identity be revealed?" }, 'BTC'), true);
  assert.equal(isRelevantMarket({ title: 'Will Bitcoin hit 150k?' }, 'BTC'), true);
});

runTest('BTC query rejects unrelated high-volume markets', () => {
  assert.equal(isRelevantMarket({ title: 'Will a candidate win the 2028 US election?' }, 'BTC'), false);
  assert.equal(isRelevantMarket({ title: 'Will West Ham be relegated?' }, 'BTC'), false);
});

runTest('SPY query accepts broad index aliases', () => {
  assert.equal(isRelevantMarket({ title: 'Will the S&P 500 close above 7000?' }, 'SPY'), true);
  assert.equal(isRelevantMarket({ title: 'Will SPX make a new all time high?' }, 'SPY'), true);
});
