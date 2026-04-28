/**
 * Tests for lib/sports/scoring.mjs - pure scoring engine, no I/O.
 *
 * Builds a tiny stub `factorsForSport` array per test rather than importing
 * the real factor-registry sibling. This isolates scoring from registry
 * shipping order during Phase 1.
 */

import assert from 'node:assert/strict';
import {
  scoreEvent,
  blendWithMarketConsensus,
  defaultConfigFor,
} from '../lib/sports/scoring.mjs';

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
  return Math.abs(a - b) <= tol;
}

// ── stub factor declarations ────────────────────────────────────────────────

function makeFactor(id, { prior = 0, range = [-1, 1], defaultWeight = 1 } = {}) {
  return { id, sport: 'test', scope: 'event', prior, range, defaultWeight };
}

// ── empty / degenerate cases ────────────────────────────────────────────────

runTest('empty extractions → 0.5 probability and 0 confidence', () => {
  const result = scoreEvent([], [makeFactor('a'), makeFactor('b')]);
  assert.equal(result.modelProbability, 0.5);
  assert.equal(result.confidence, 0);
  assert.equal(result.coverage.total, 2);
  assert.equal(result.coverage.used, 0);
  assert.equal(result.coverage.missing, 0);
  assert.equal(result.coverage.error, 0);
});

runTest('all extractions error → 0.5 probability, 0 confidence', () => {
  const factors = [makeFactor('a'), makeFactor('b'), makeFactor('c')];
  const extractions = [
    { id: 'a', sport: 'test', scope: 'event', value: null, withinRange: false, error: 'boom' },
    { id: 'b', sport: 'test', scope: 'event', value: null, withinRange: false, error: 'boom' },
    { id: 'c', sport: 'test', scope: 'event', value: null, withinRange: false, error: 'boom' },
  ];
  const result = scoreEvent(extractions, factors);
  assert.equal(result.modelProbability, 0.5);
  assert.equal(result.confidence, 0);
  assert.equal(result.coverage.error, 3);
  assert.equal(result.coverage.used, 0);
});

// ── single-factor cases ─────────────────────────────────────────────────────

runTest('single factor exactly at prior (z=0) → contribution 0, prob = sigmoid(intercept) = 0.5', () => {
  // range [-2,2] → stdev = 1. value = prior = 0 → z = 0 → contribution = 0.
  const factors = [makeFactor('a', { prior: 0, range: [-2, 2] })];
  const extractions = [{ id: 'a', sport: 'test', scope: 'event', value: 0, withinRange: true }];
  const result = scoreEvent(extractions, factors);
  assert.ok(approxEqual(result.linearSum, 0));
  assert.ok(approxEqual(result.modelProbability, 0.5));
  assert.equal(result.contributions.length, 1);
  assert.equal(result.contributions[0].used, true);
  assert.ok(approxEqual(result.contributions[0].contribution, 0));
});

runTest('single factor 2σ above prior, weight 1 → linearSum = 2, prob ≈ 0.881', () => {
  // range [-2,2] → stdev = 1. value = 2 → z = 2 → contribution = 2.
  const factors = [makeFactor('a', { prior: 0, range: [-2, 2], defaultWeight: 1 })];
  const extractions = [{ id: 'a', sport: 'test', scope: 'event', value: 2, withinRange: true }];
  const result = scoreEvent(extractions, factors);
  assert.ok(approxEqual(result.linearSum, 2));
  assert.ok(approxEqual(result.modelProbability, 1 / (1 + Math.exp(-2))));
  assert.ok(Math.abs(result.modelProbability - 0.881) < 0.01);
});

// ── dispersion behaviour ────────────────────────────────────────────────────

runTest('two opposing factors → probability near 0.5, dispersion penalty < 0.5', () => {
  const factors = [
    makeFactor('a', { prior: 0, range: [-2, 2] }),
    makeFactor('b', { prior: 0, range: [-2, 2] }),
  ];
  const extractions = [
    { id: 'a', sport: 'test', scope: 'event', value: 2, withinRange: true },   // z = +2
    { id: 'b', sport: 'test', scope: 'event', value: -2, withinRange: true },  // z = -2
  ];
  const result = scoreEvent(extractions, factors);
  assert.ok(approxEqual(result.linearSum, 0));
  assert.ok(approxEqual(result.modelProbability, 0.5));
  assert.ok(result.confidenceComponents.dispersionPenalty < 0.5,
    `expected dispersion penalty < 0.5, got ${result.confidenceComponents.dispersionPenalty}`);
});

runTest('two same-direction factors → high probability, dispersion penalty close to 1', () => {
  const factors = [
    makeFactor('a', { prior: 0, range: [-2, 2] }),
    makeFactor('b', { prior: 0, range: [-2, 2] }),
  ];
  const extractions = [
    { id: 'a', sport: 'test', scope: 'event', value: 1.5, withinRange: true },
    { id: 'b', sport: 'test', scope: 'event', value: 1.5, withinRange: true },
  ];
  const result = scoreEvent(extractions, factors);
  assert.ok(result.modelProbability > 0.9, `expected >0.9, got ${result.modelProbability}`);
  assert.ok(result.confidenceComponents.dispersionPenalty > 0.99,
    `expected dispersion ≈ 1, got ${result.confidenceComponents.dispersionPenalty}`);
});

// ── coverage ────────────────────────────────────────────────────────────────

runTest('coverage: 5 declared, 3 fired → coverageRatio = 0.6', () => {
  const factors = [
    makeFactor('a', { prior: 0, range: [-2, 2] }),
    makeFactor('b', { prior: 0, range: [-2, 2] }),
    makeFactor('c', { prior: 0, range: [-2, 2] }),
    makeFactor('d', { prior: 0, range: [-2, 2] }),
    makeFactor('e', { prior: 0, range: [-2, 2] }),
  ];
  const extractions = [
    { id: 'a', sport: 'test', scope: 'event', value: 1, withinRange: true },
    { id: 'b', sport: 'test', scope: 'event', value: 1, withinRange: true },
    { id: 'c', sport: 'test', scope: 'event', value: 1, withinRange: true },
    { id: 'd', sport: 'test', scope: 'event', value: null, withinRange: false },
    { id: 'e', sport: 'test', scope: 'event', value: null, withinRange: false, error: 'x' },
  ];
  const result = scoreEvent(extractions, factors);
  assert.equal(result.coverage.total, 5);
  assert.equal(result.coverage.used, 3);
  assert.equal(result.coverage.missing, 1);
  assert.equal(result.coverage.error, 1);
  assert.ok(approxEqual(result.confidenceComponents.coverageRatio, 0.6));
});

// ── reason flags ────────────────────────────────────────────────────────────

runTest('zero stdev (prior == range bound) → contribution 0, reason zero_stdev', () => {
  // Pass an explicit stdev of 0 via config to simulate a degenerate factor.
  const factors = [makeFactor('a', { prior: 0, range: [-2, 2] })];
  const extractions = [{ id: 'a', sport: 'test', scope: 'event', value: 1, withinRange: true }];
  const result = scoreEvent(extractions, factors, {
    weights: { a: 1 }, priors: { a: 0 }, stdevs: { a: 0 }, intercept: 0,
  });
  assert.equal(result.contributions[0].used, false);
  assert.equal(result.contributions[0].reason, 'zero_stdev');
  assert.ok(approxEqual(result.linearSum, 0));
});

runTest('zero weight → contribution 0, used false, reason zero_weight', () => {
  const factors = [makeFactor('a', { prior: 0, range: [-2, 2] })];
  const extractions = [{ id: 'a', sport: 'test', scope: 'event', value: 2, withinRange: true }];
  const result = scoreEvent(extractions, factors, {
    weights: { a: 0 }, priors: { a: 0 }, stdevs: { a: 1 }, intercept: 0,
  });
  assert.equal(result.contributions[0].used, false);
  assert.equal(result.contributions[0].reason, 'zero_weight');
  assert.ok(approxEqual(result.linearSum, 0));
});

// ── modelProbability finiteness ─────────────────────────────────────────────

runTest('modelProbability is always finite and in [0, 1] across extreme inputs', () => {
  const factors = [makeFactor('a', { prior: 0, range: [-2, 2], defaultWeight: 1 })];
  // Huge value → linearSum huge → sigmoid saturates to 1.
  const big = scoreEvent(
    [{ id: 'a', sport: 'test', scope: 'event', value: 1e6, withinRange: true }],
    factors,
  );
  assert.ok(Number.isFinite(big.modelProbability));
  assert.ok(big.modelProbability >= 0 && big.modelProbability <= 1);
  assert.ok(big.modelProbability > 0.999);

  // Hugely negative.
  const small = scoreEvent(
    [{ id: 'a', sport: 'test', scope: 'event', value: -1e6, withinRange: true }],
    factors,
  );
  assert.ok(Number.isFinite(small.modelProbability));
  assert.ok(small.modelProbability >= 0 && small.modelProbability <= 1);
  assert.ok(small.modelProbability < 0.001);
});

// ── blendWithMarketConsensus ────────────────────────────────────────────────

runTest('blendWithMarketConsensus: weight 0 returns model', () => {
  assert.equal(blendWithMarketConsensus(0.7, 0.4, 0), 0.7);
});

runTest('blendWithMarketConsensus: weight 1 returns market', () => {
  assert.equal(blendWithMarketConsensus(0.7, 0.4, 1), 0.4);
});

runTest('blendWithMarketConsensus: weight 0.5 returns midpoint', () => {
  assert.ok(approxEqual(blendWithMarketConsensus(0.7, 0.4, 0.5), 0.55));
});

runTest('blendWithMarketConsensus: clamps to [0, 1]', () => {
  // Even if a caller passes 1.2 by accident, output is clamped.
  assert.equal(blendWithMarketConsensus(1.2, 0.5, 0), 1);
  assert.equal(blendWithMarketConsensus(-0.2, 0.5, 0), 0);
});

// ── defaultConfigFor ────────────────────────────────────────────────────────

runTest('defaultConfigFor: weights match declared, stdevs = range/4, priors match', () => {
  const factors = [
    { id: 'a', prior: 0.5, range: [-2, 2], defaultWeight: 1.5 },
    { id: 'b', prior: -0.25, range: [0, 4], defaultWeight: 2 },
  ];
  const cfg = defaultConfigFor(factors);
  assert.equal(cfg.weights.a, 1.5);
  assert.equal(cfg.weights.b, 2);
  assert.equal(cfg.priors.a, 0.5);
  assert.equal(cfg.priors.b, -0.25);
  assert.ok(approxEqual(cfg.stdevs.a, 4 / 4));   // range 4 → stdev 1
  assert.ok(approxEqual(cfg.stdevs.b, 4 / 4));   // range 4 → stdev 1
  assert.equal(cfg.intercept, 0);
});

runTest('defaultConfigFor: missing fields fall back to safe defaults', () => {
  const factors = [{ id: 'a' }];
  const cfg = defaultConfigFor(factors);
  assert.equal(cfg.weights.a, 1);
  assert.equal(cfg.priors.a, 0);
  assert.equal(cfg.stdevs.a, 1);
});

// ── confidence sample-floor ─────────────────────────────────────────────────

runTest('sampleFloorPenalty: 1 firing factor → 0.2; 5+ firing → 1', () => {
  const oneFactor = [makeFactor('a', { prior: 0, range: [-2, 2] })];
  const oneFire = scoreEvent(
    [{ id: 'a', sport: 'test', scope: 'event', value: 1, withinRange: true }],
    oneFactor,
  );
  assert.ok(approxEqual(oneFire.confidenceComponents.sampleFloorPenalty, 0.2));

  const fiveFactors = ['a','b','c','d','e'].map((id) => makeFactor(id, { prior: 0, range: [-2, 2] }));
  const fiveFire = scoreEvent(
    fiveFactors.map((f) => ({ id: f.id, sport: 'test', scope: 'event', value: 1, withinRange: true })),
    fiveFactors,
  );
  assert.equal(fiveFire.confidenceComponents.sampleFloorPenalty, 1);
});
