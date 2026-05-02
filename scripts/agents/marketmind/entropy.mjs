import { clamp, normalizeAgentSignal } from './schemas.mjs';

const SIGNAL_BUCKETS = Object.freeze(['BULLISH', 'BEARISH', 'NEUTRAL']);
const TRANSITION_STATE_COUNT = 15;

export function computeAgentSignalEntropy(agentSignals = []) {
  const usable = agentSignals.filter(Boolean);
  const active = usable.filter(signal => Number(signal.confidence) > 0);
  if (!active.length) {
    return Object.freeze({
      score: null,
      level: 'unknown',
      dominant_signal: 'unknown',
      distribution: { bullish: 0, bearish: 0, neutral: 0 },
      interpretation: 'No active agent confidence was available for entropy scoring.',
    });
  }

  const mass = { BULLISH: 0, BEARISH: 0, NEUTRAL: 0 };
  for (const signal of active) {
    const bucket = normalizeAgentSignal(signal.signal);
    mass[bucket] += clamp(Number(signal.confidence) || 0, 0, 1);
  }

  const total = Object.values(mass).reduce((sum, value) => sum + value, 0);
  const score = normalizedEntropy(Object.values(mass), SIGNAL_BUCKETS.length);
  const distribution = Object.fromEntries(
    SIGNAL_BUCKETS.map(bucket => [bucket.toLowerCase(), total ? Number((mass[bucket] / total).toFixed(2)) : 0])
  );
  const dominantSignal = SIGNAL_BUCKETS.reduce((best, bucket) => mass[bucket] > mass[best] ? bucket : best, 'NEUTRAL');
  const level = classifyEntropyLevel(score);

  return Object.freeze({
    score: Number(score.toFixed(2)),
    level,
    dominant_signal: dominantSignal.toLowerCase(),
    distribution,
    interpretation: entropyInterpretation(level, 'agent'),
  });
}

export function computeTransitionEntropyFromBars(rows = [], options = {}) {
  const lookback = Math.max(20, Number(options.lookback) || 120);
  const sample = rows
    .filter(row => Number.isFinite(Number(row.close)) && Number.isFinite(Number(row.volume)))
    .slice(-(lookback + 1));

  if (sample.length < 21) {
    return Object.freeze({
      score: null,
      level: 'unknown',
      transitions: 0,
      method: '15-state sign-volume transition entropy',
      interpretation: 'Insufficient intraday bars for transition entropy.',
    });
  }

  const volumes = sample.map(row => Number(row.volume)).filter(Number.isFinite);
  const thresholds = volumeQuintileThresholds(volumes);
  const states = [];

  for (let index = 1; index < sample.length; index++) {
    const previous = Number(sample[index - 1].close);
    const current = Number(sample[index].close);
    const sign = Math.sign(current - previous);
    const signBucket = sign < 0 ? 0 : sign > 0 ? 2 : 1;
    const volumeBucket = volumeQuintile(Number(sample[index].volume), thresholds) - 1;
    states.push(signBucket * 5 + volumeBucket);
  }

  if (states.length < 20) {
    return Object.freeze({
      score: null,
      level: 'unknown',
      transitions: 0,
      method: '15-state sign-volume transition entropy',
      interpretation: 'Insufficient state transitions for entropy scoring.',
    });
  }

  const matrix = Array.from({ length: TRANSITION_STATE_COUNT }, () => Array(TRANSITION_STATE_COUNT).fill(0));
  for (let index = 1; index < states.length; index++) {
    matrix[states[index - 1]][states[index]] += 1;
  }

  const rowTotals = matrix.map(row => row.reduce((sum, value) => sum + value, 0));
  const totalTransitions = rowTotals.reduce((sum, value) => sum + value, 0);
  if (!totalTransitions) {
    return Object.freeze({
      score: null,
      level: 'unknown',
      transitions: 0,
      method: '15-state sign-volume transition entropy',
      interpretation: 'No usable transition counts for entropy scoring.',
    });
  }

  let weightedEntropy = 0;
  for (let rowIndex = 0; rowIndex < matrix.length; rowIndex++) {
    const rowTotal = rowTotals[rowIndex];
    if (!rowTotal) continue;
    weightedEntropy += (rowTotal / totalTransitions) * normalizedEntropy(matrix[rowIndex], TRANSITION_STATE_COUNT);
  }

  const level = classifyEntropyLevel(weightedEntropy);
  return Object.freeze({
    score: Number(weightedEntropy.toFixed(2)),
    level,
    transitions: totalTransitions,
    states: states.length,
    lookback_bars: sample.length,
    method: '15-state sign-volume transition entropy over 1-minute bars',
    interpretation: entropyInterpretation(level, 'order_flow'),
  });
}

export function classifyEntropyLevel(score) {
  if (!Number.isFinite(score)) return 'unknown';
  if (score <= 0.25) return 'compressed';
  if (score <= 0.5) return 'ordered';
  if (score <= 0.75) return 'mixed';
  return 'diffuse';
}

/**
 * Five-tier strategy bucket for trading decisions.
 * Finer-grained than classifyEntropyLevel — distinguishes watch/near-watch/baseline
 * for position sizing and setup filtering.
 */
export function classifyBucket(score) {
  if (score <= 0.25) return 'compressed';
  if (score <= 0.50) return 'low-entropy-watch';
  if (score <= 0.60) return 'near-low-watch';
  if (score <= 0.75) return 'mixed';
  return 'baseline';
}

export function entropyInterpretation(level, source = 'agent') {
  const orderFlow = source === 'order_flow';
  switch (level) {
    case 'compressed':
      return orderFlow
        ? 'Low transition entropy: structured order flow may indicate elevated magnitude risk without directional information.'
        : 'Low agent entropy: specialists are clustered, so treat the verdict as a higher-conviction but still non-guaranteed state.';
    case 'ordered':
      return orderFlow
        ? 'Below-average transition entropy: order flow is more structured than random, but not an extreme compression.'
        : 'Below-average agent entropy: the stack has a clear lean with some counter-evidence.';
    case 'mixed':
      return orderFlow
        ? 'Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.'
        : 'Mid-range agent entropy: the stack is partially split and needs thesis context.';
    case 'diffuse':
      return orderFlow
        ? 'High transition entropy: order flow is diffuse and offers little magnitude-timing signal.'
        : 'High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.';
    default:
      return 'Entropy level unavailable.';
  }
}

function normalizedEntropy(values, bucketCount) {
  const total = values.reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
  if (!total) return 0;

  let entropy = 0;
  for (const value of values) {
    const p = Math.max(0, Number(value) || 0) / total;
    if (p > 0) entropy -= p * Math.log(p);
  }

  const maxEntropy = Math.log(Math.max(2, bucketCount));
  return clamp(entropy / maxEntropy, 0, 1);
}

function volumeQuintileThresholds(values) {
  const sorted = [...values].sort((left, right) => left - right);
  return [0.2, 0.4, 0.6, 0.8].map(q => quantile(sorted, q));
}

function volumeQuintile(value, thresholds) {
  for (let index = 0; index < thresholds.length; index++) {
    if (value <= thresholds[index]) return index + 1;
  }
  return 5;
}

function quantile(sortedValues, q) {
  if (!sortedValues.length) return 0;
  const index = (sortedValues.length - 1) * q;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sortedValues[lower];
  const weight = index - lower;
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}
