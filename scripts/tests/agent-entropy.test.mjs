/**
 * Tests for agents/marketmind/entropy.mjs.
 */

import assert from 'node:assert/strict';
import { makeAgentSignal } from '../agents/marketmind/schemas.mjs';
import { computeAgentSignalEntropy, computeTransitionEntropyFromBars } from '../agents/marketmind/entropy.mjs';
import { normalizeIntradayBars } from '../lib/bars.mjs';

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

runTest('agent entropy is compressed when specialists cluster', () => {
  const entropy = computeAgentSignalEntropy([
    makeAgentSignal({ agent: 'price', signal: 'BULLISH', confidence: 0.8 }),
    makeAgentSignal({ agent: 'fundamentals', signal: 'BULLISH', confidence: 0.7 }),
    makeAgentSignal({ agent: 'macro', signal: 'BULLISH', confidence: 0.6 }),
  ]);
  assert.equal(entropy.level, 'compressed');
  assert.equal(entropy.dominant_signal, 'bullish');
});

runTest('agent entropy rises when specialists split across buckets', () => {
  const entropy = computeAgentSignalEntropy([
    makeAgentSignal({ agent: 'price', signal: 'BULLISH', confidence: 0.8 }),
    makeAgentSignal({ agent: 'risk', signal: 'BEARISH', confidence: 0.8 }),
    makeAgentSignal({ agent: 'macro', signal: 'NEUTRAL', confidence: 0.8 }),
  ]);
  assert.equal(entropy.level, 'diffuse');
  assert.ok(entropy.score > 0.9);
});

runTest('transition entropy detects repeated sign-volume states', () => {
  const rows = Array.from({ length: 80 }, (_, index) => ({
    date: `2026-01-01 10:${String(index).padStart(2, '0')}:00`,
    close: 100 + index,
    volume: 1000,
  }));
  const entropy = computeTransitionEntropyFromBars(rows, { lookback: 60 });
  assert.equal(entropy.level, 'compressed');
  assert.ok(entropy.score < 0.1);
});

runTest('transition entropy is available on varied states', () => {
  const rows = Array.from({ length: 120 }, (_, index) => ({
    date: `2026-01-01 11:${String(index).padStart(2, '0')}:00`,
    close: 100 + Math.sin(index) + (index % 3 === 0 ? 0.5 : -0.5),
    volume: 1000 + ((index * 37) % 5000),
  }));
  const entropy = computeTransitionEntropyFromBars(rows, { lookback: 100 });
  assert.notEqual(entropy.level, 'unknown');
  assert.ok(entropy.score >= 0 && entropy.score <= 1);
});

runTest('normalizeIntradayBars sorts FMP newest-first bars to oldest-first', () => {
  const newestFirst = [
    { date: '2026-01-01 10:05:00', close: 105, volume: 1000 },
    { date: '2026-01-01 10:03:00', close: 103, volume: 800 },
    { date: '2026-01-01 10:01:00', close: 101, volume: 600 },
    { date: '2026-01-01 10:00:00', close: 100, volume: 500 },
  ];
  const normalized = normalizeIntradayBars(newestFirst);
  assert.equal(normalized[0].date, '2026-01-01 10:00:00');
  assert.equal(normalized.at(-1).date, '2026-01-01 10:05:00');
});

runTest('FMP newest-first bars must be normalized before scoring (regression)', () => {
  // bars 0-60: alternating close, low volume (1000)
  // bars 61-79: alternating close, HIGH volume (9000)
  //
  // Sorted window (last 61 = bars 19-79): contains the high-vol section.
  // Q0.8 threshold shifts to 9000, so bars 61-79 land in a different volumeBucket
  // than bars 19-60. That boundary creates a unique cross-state transition → score > 0.
  //
  // Unsorted window (last 61 of newestFirst = bars 0-60 reversed): all vol=1000 only.
  // All quintile thresholds collapse to 1000, two states alternate deterministically → score = 0.
  const ascending = Array.from({ length: 80 }, (_, i) => ({
    date: `2026-01-01 10:${String(i).padStart(2, '0')}:00`,
    close: i % 2 === 0 ? 101 : 99,
    volume: i < 61 ? 1000 : 9000,
  }));
  const newestFirst = [...ascending].reverse();

  const withNorm    = computeTransitionEntropyFromBars(normalizeIntradayBars(newestFirst), { lookback: 60 });
  const withoutNorm = computeTransitionEntropyFromBars(newestFirst, { lookback: 60 });

  assert.notEqual(withNorm.score, withoutNorm.score,
    'normalized (high-vol bars included) must score differently from unsorted (only low-vol bars seen)');
});
