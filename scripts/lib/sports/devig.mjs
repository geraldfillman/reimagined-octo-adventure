/**
 * devig.mjs - remove the bookmaker overround (vig) from a set of decimal odds.
 *
 * Pure, side-effect-free. No I/O, no external deps. All inputs are arrays of
 * decimal odds for the outcomes of a single market (must be > 1.0 each, length
 * >= 2). All methods return an array of no-vig probabilities that sum to 1.
 *
 * Three methods are provided:
 *   - multiplicative (default): scale raw implied probabilities to sum to 1.
 *   - power: find k such that sum((1/o_i)^k) == 1.
 *   - shin: solve Shin (1992) insider-trading model for the unique z in [0,1).
 *
 * Helper: noVigImpliedProbability(selectionOdds, marketOdds, method) returns
 * just the no-vig probability for a single selection within a market.
 */

const POWER_TOLERANCE = 1e-9;
const POWER_MAX_ITERATIONS = 100;
const SHIN_TOLERANCE = 1e-9;
const SHIN_MAX_ITERATIONS = 200;

export const DEFAULT_METHOD = 'multiplicative';

export function devig(decimalOdds, method = DEFAULT_METHOD) {
  validateOdds(decimalOdds);
  switch (method) {
    case 'multiplicative':
      return devigMultiplicative(decimalOdds);
    case 'power':
      return devigPower(decimalOdds);
    case 'shin':
      return devigShin(decimalOdds);
    default:
      throw new Error(`Unknown de-vig method: ${method}`);
  }
}

export function devigMultiplicative(decimalOdds) {
  validateOdds(decimalOdds);
  const raw = decimalOdds.map(o => 1 / o);
  const total = raw.reduce((a, b) => a + b, 0);
  if (total <= 0) throw new Error('Sum of implied probabilities must be positive');
  return raw.map(p => p / total);
}

export function devigPower(decimalOdds) {
  validateOdds(decimalOdds);
  const raw = decimalOdds.map(o => 1 / o);

  let lo = 0.5;
  let hi = 2.0;
  while (sumPow(raw, hi) > 1 && hi < 64) hi *= 2;
  while (sumPow(raw, lo) < 1 && lo > 1e-6) lo /= 2;

  let k = 1;
  for (let i = 0; i < POWER_MAX_ITERATIONS; i++) {
    k = (lo + hi) / 2;
    const s = sumPow(raw, k);
    if (Math.abs(s - 1) < POWER_TOLERANCE) break;
    if (s > 1) lo = k; else hi = k;
  }

  const probs = raw.map(p => p ** k);
  const total = probs.reduce((a, b) => a + b, 0);
  return probs.map(p => p / total);
}

export function devigShin(decimalOdds) {
  validateOdds(decimalOdds);
  const raw = decimalOdds.map(o => 1 / o);
  const booksum = raw.reduce((a, b) => a + b, 0);

  if (booksum <= 1 + SHIN_TOLERANCE) {
    const total = booksum || 1;
    return raw.map(pi => pi / total);
  }

  let lo = 0;
  let hi = 0.999;
  let best = null;
  for (let i = 0; i < SHIN_MAX_ITERATIONS; i++) {
    const z = (lo + hi) / 2;
    const probs = raw.map(pi => shinAdjust(pi, booksum, z));
    const s = probs.reduce((a, b) => a + b, 0);
    best = probs;
    if (Math.abs(s - 1) < SHIN_TOLERANCE) break;
    if (s > 1) lo = z; else hi = z;
  }
  const total = best.reduce((a, b) => a + b, 0);
  return best.map(p => p / total);
}

export function noVigImpliedProbability(selectionOdds, marketOdds, method = DEFAULT_METHOD) {
  if (!Number.isFinite(selectionOdds) || selectionOdds <= 1) {
    throw new Error(`Invalid selection odds: ${selectionOdds}`);
  }
  validateOdds(marketOdds);
  const idx = marketOdds.findIndex(o => Math.abs(o - selectionOdds) < 1e-9);
  if (idx === -1) {
    throw new Error('Selection odds not found in market odds array');
  }
  return devig(marketOdds, method)[idx];
}

export function bookmakerOverround(decimalOdds) {
  validateOdds(decimalOdds);
  return decimalOdds.reduce((acc, o) => acc + 1 / o, 0) - 1;
}

function validateOdds(decimalOdds) {
  if (!Array.isArray(decimalOdds) || decimalOdds.length < 2) {
    throw new Error('decimalOdds must be an array of length >= 2');
  }
  for (const o of decimalOdds) {
    if (!Number.isFinite(o) || o <= 1) {
      throw new Error(`Invalid decimal odds in market: ${o}`);
    }
  }
}

function sumPow(raw, k) {
  return raw.reduce((acc, p) => acc + p ** k, 0);
}

function shinAdjust(pi, booksum, z) {
  const inner = z ** 2 + 4 * (1 - z) * (pi ** 2 / booksum);
  return (Math.sqrt(inner) - z) / (2 * (1 - z));
}
