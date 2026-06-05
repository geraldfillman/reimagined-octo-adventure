import assert from 'node:assert/strict';

import {
  blackScholesGamma,
  estimateDealerGamma,
  findGammaFlip,
} from '../lib/dealer-gamma-model.mjs';

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

runTest('black-scholes gamma matches a known at-the-money sample', () => {
  const gamma = blackScholesGamma({
    spot: 100,
    strike: 100,
    timeToExpiryYears: 30 / 365,
    volatility: 0.20,
    riskFreeRate: 0.05,
  });

  assert.equal(Number(gamma.toFixed(4)), 0.0692);
});

runTest('expired or invalid options return zero gamma', () => {
  assert.equal(blackScholesGamma({ spot: 100, strike: 100, timeToExpiryYears: 0, volatility: 0.2 }), 0);
  assert.equal(blackScholesGamma({ spot: 0, strike: 100, timeToExpiryYears: 0.1, volatility: 0.2 }), 0);
});

runTest('dealer gamma aggregates by strike and expiry with confidence labels', () => {
  const estimate = estimateDealerGamma({
    symbol: 'SPY',
    spot: 500,
    asOfDate: '2026-05-13',
    contracts: [
      { type: 'call', strike: 505, expiration: '2026-05-20', openInterest: 1000, impliedVolatility: 0.20 },
      { type: 'put', strike: 495, expiration: '2026-05-20', openInterest: 800, impliedVolatility: 0.22 },
      { type: 'call', strike: 510, expiration: '2026-05-27', openInterest: 500, impliedVolatility: 0.21 },
    ],
  });

  assert.equal(estimate.symbol, 'SPY');
  assert.equal(estimate.signal_confidence, 'derived_low_confidence');
  assert.equal(estimate.byStrike.length, 3);
  assert.equal(estimate.byExpiry.length, 2);
  assert.equal(estimate.callWall.strike, 505);
  assert.equal(estimate.putWall.strike, 495);
});

runTest('gamma flip root finder returns null if no crossing exists', () => {
  const flip = findGammaFlip([
    { strike: 95, gammaExposure: 10 },
    { strike: 100, gammaExposure: 20 },
    { strike: 105, gammaExposure: 30 },
  ]);

  assert.equal(flip, null);
});
