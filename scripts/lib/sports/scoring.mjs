/**
 * scoring.mjs - sport-agnostic scoring engine for the factor framework.
 *
 * Pure, side-effect-free. No I/O, no mutation. Combines factor extractions
 * (from factor-registry.extractAllForSport) into a probability that the
 * "home" / "selection A" side wins via a logistic blend with z-score
 * normalization.
 *
 * Pipeline:
 *   contribution_i  = weight_i * zScore(value_i, prior_i, stdev_i)
 *   linearSum       = intercept + Σ contribution_i  (skipping null/error/zero-weight)
 *   modelProbability = sigmoid(linearSum)
 *
 * Confidence formula (also documented in agents.md spec):
 *   coverageRatio       = used / total
 *   dispersionPenalty   = 1 - tanh( sd(contributions) / max(1e-9, mean(|contributions|)) )
 *     - When all contributions point the same way with similar magnitudes,
 *       sd is small relative to |mean| → tanh ≈ 0 → penalty ≈ 1.
 *     - When contributions disagree wildly, sd dominates → tanh ≈ 1 → penalty ≈ 0.
 *   sampleFloorPenalty  = min(1, used / 5)   // need ≥5 firing factors to avoid penalty
 *   confidence          = coverageRatio * dispersionPenalty * sampleFloorPenalty   // ∈ [0, 1]
 */

import { sigmoid, zScore, bayesianShrink } from './factors/_common.mjs';

// ── default config ──────────────────────────────────────────────────────────

/**
 * Build a FactorWeightConfig from a factor declaration array. Defaults:
 *   weight = factor.defaultWeight ?? 1
 *   prior  = factor.prior ?? 0
 *   stdev  = (factor.range[1] - factor.range[0]) / 4   (≈ 95% within ±2σ)
 *            falling back to 1 when no range.
 *   intercept = 0
 *
 * @param {Array<Object>} factorsForSport
 * @returns {{weights: Object<string,number>, priors: Object<string,number>, stdevs: Object<string,number>, intercept: number}}
 */
export function defaultConfigFor(factorsForSport) {
  const weights = {};
  const priors = {};
  const stdevs = {};
  if (Array.isArray(factorsForSport)) {
    for (const f of factorsForSport) {
      if (!f || typeof f.id !== 'string') continue;
      weights[f.id] = Number.isFinite(f.defaultWeight) ? f.defaultWeight : 1;
      priors[f.id] = Number.isFinite(f.prior) ? f.prior : 0;
      stdevs[f.id] = deriveStdev(f);
    }
  }
  return { weights, priors, stdevs, intercept: 0 };
}

function deriveStdev(factor) {
  if (Array.isArray(factor.range) && factor.range.length === 2) {
    const [lo, hi] = factor.range;
    if (Number.isFinite(lo) && Number.isFinite(hi) && hi > lo) {
      return (hi - lo) / 4;
    }
  }
  return 1;
}

// ── core scoring ────────────────────────────────────────────────────────────

/**
 * Score an event by combining factor extractions into a model probability.
 *
 * @param {Array<{id:string, sport:string, scope:string, value:any, withinRange:boolean, error?:string}>} extractions
 * @param {Array<Object>} factorsForSport - registry's factors for the sport (for defaults)
 * @param {Object} [config] - { weights, priors, stdevs, intercept }
 * @returns {{
 *   modelProbability: number,
 *   linearSum: number,
 *   contributions: Array<{id:string, weight:number, zScore:number|null, contribution:number, used:boolean, reason?:string}>,
 *   coverage: { total:number, used:number, missing:number, error:number },
 *   confidence: number,
 *   confidenceComponents: { coverageRatio:number, dispersionPenalty:number, sampleFloorPenalty:number }
 * }}
 */
export function scoreEvent(extractions, factorsForSport, config = {}) {
  const declared = Array.isArray(factorsForSport) ? factorsForSport : [];
  const totalDeclared = declared.length;
  const safeExtractions = Array.isArray(extractions) ? extractions : [];

  const defaults = defaultConfigFor(declared);
  const weights = { ...defaults.weights, ...(config.weights || {}) };
  const priors = { ...defaults.priors, ...(config.priors || {}) };
  const stdevs = { ...defaults.stdevs, ...(config.stdevs || {}) };
  const intercept = Number.isFinite(config.intercept) ? config.intercept : 0;

  const contributions = [];
  let usedCount = 0;
  let errorCount = 0;
  let missingCount = 0;
  let linearSum = intercept;

  for (const ex of safeExtractions) {
    if (!ex || typeof ex.id !== 'string') continue;
    const id = ex.id;
    const weight = Number.isFinite(weights[id]) ? weights[id] : 1;

    if (ex.error) {
      errorCount += 1;
      contributions.push({
        id, weight, zScore: null, contribution: 0,
        used: false, reason: 'extraction_error',
      });
      continue;
    }

    if (ex.value === null || ex.value === undefined || !Number.isFinite(ex.value)) {
      missingCount += 1;
      contributions.push({
        id, weight, zScore: null, contribution: 0,
        used: false, reason: 'missing_value',
      });
      continue;
    }

    if (weight === 0) {
      contributions.push({
        id, weight, zScore: null, contribution: 0,
        used: false, reason: 'zero_weight',
      });
      continue;
    }

    const prior = Number.isFinite(priors[id]) ? priors[id] : 0;
    const stdev = Number.isFinite(stdevs[id]) ? stdevs[id] : 0;

    if (stdev === 0) {
      contributions.push({
        id, weight, zScore: null, contribution: 0,
        used: false, reason: 'zero_stdev',
      });
      continue;
    }

    const z = zScore(ex.value, prior, stdev);
    if (z === null || !Number.isFinite(z)) {
      contributions.push({
        id, weight, zScore: null, contribution: 0,
        used: false, reason: 'zscore_undefined',
      });
      continue;
    }

    const contribution = weight * z;
    linearSum += contribution;
    usedCount += 1;
    contributions.push({
      id, weight, zScore: z, contribution, used: true,
    });
  }

  // If no extractions at all (or none usable) → neutral output, zero confidence.
  const totalForCoverage = totalDeclared > 0 ? totalDeclared : safeExtractions.length;
  const totalErrors = errorCount;
  const totalMissing = missingCount;

  let modelProbability;
  if (safeExtractions.length === 0) {
    modelProbability = 0.5;
  } else {
    modelProbability = sigmoid(linearSum);
  }

  const coverageRatio = totalForCoverage > 0 ? usedCount / totalForCoverage : 0;
  const dispersionPenalty = computeDispersionPenalty(contributions);
  const sampleFloorPenalty = Math.min(1, usedCount / 5);
  let confidence = coverageRatio * dispersionPenalty * sampleFloorPenalty;
  if (!Number.isFinite(confidence)) confidence = 0;
  confidence = clamp01(confidence);

  // Special-case: zero usable contributions → neutral and zero confidence.
  if (usedCount === 0) {
    confidence = 0;
    if (safeExtractions.length === 0) {
      modelProbability = 0.5;
    } else {
      // No factors fired but extractions present: probability defined by intercept alone.
      modelProbability = sigmoid(intercept);
    }
  }

  // Numerical safety - clamp to [0, 1].
  modelProbability = clamp01(modelProbability);

  return {
    modelProbability,
    linearSum,
    contributions,
    coverage: {
      total: totalForCoverage,
      used: usedCount,
      missing: totalMissing,
      error: totalErrors,
    },
    confidence,
    confidenceComponents: {
      coverageRatio: clamp01(coverageRatio),
      dispersionPenalty: clamp01(dispersionPenalty),
      sampleFloorPenalty: clamp01(sampleFloorPenalty),
    },
  };
}

/**
 * Compute dispersionPenalty across the *used* contributions.
 *   penalty = 1 - tanh( sd / max(1e-9, mean(|c|)) )
 * Returns 1 when fewer than 2 used contributions (sd is undefined).
 */
function computeDispersionPenalty(contributions) {
  const used = contributions.filter((c) => c.used).map((c) => c.contribution);
  if (used.length === 0) return 1;
  if (used.length === 1) return 1;

  const meanAbs = used.reduce((acc, v) => acc + Math.abs(v), 0) / used.length;
  const mean = used.reduce((acc, v) => acc + v, 0) / used.length;
  const variance = used.reduce((acc, v) => acc + (v - mean) ** 2, 0) / used.length;
  const sd = Math.sqrt(variance);
  const ratio = sd / Math.max(1e-9, meanAbs);
  return 1 - Math.tanh(ratio);
}

function clamp01(x) {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

// ── market blending ─────────────────────────────────────────────────────────

/**
 * Linear blend of model probability with market no-vig consensus.
 *
 *   blended = (1 - w) * model + w * market
 *
 * Defaults to pure model (blendWeight = 0). Phase 3 will set blendWeight > 0
 * to "shrink toward market" for low-confidence predictions.
 *
 * @param {number} modelProbability - in [0, 1]
 * @param {number} marketNoVigImplied - in [0, 1]
 * @param {number} [blendWeight=0] - in [0, 1]
 * @returns {number} blended probability, clamped to [0, 1]
 */
export function blendWithMarketConsensus(modelProbability, marketNoVigImplied, blendWeight = 0.0) {
  if (!Number.isFinite(modelProbability)) {
    throw new Error(`blendWithMarketConsensus: modelProbability must be finite (got ${modelProbability})`);
  }
  if (!Number.isFinite(marketNoVigImplied)) {
    throw new Error(`blendWithMarketConsensus: marketNoVigImplied must be finite (got ${marketNoVigImplied})`);
  }
  if (!Number.isFinite(blendWeight) || blendWeight < 0 || blendWeight > 1) {
    throw new Error(`blendWithMarketConsensus: blendWeight must be in [0, 1] (got ${blendWeight})`);
  }
  const m = clamp01(modelProbability);
  const k = clamp01(marketNoVigImplied);
  return clamp01((1 - blendWeight) * m + blendWeight * k);
}

// ── re-exports ──────────────────────────────────────────────────────────────

/**
 * Re-export of _common.bayesianShrink for callers wiring posterior-style
 * shrinkage (e.g. shrinking a small-sample team metric toward a league prior)
 * before factor extraction. Kept as a thin re-export so the scoring API is
 * the single import point for downstream Phase 3 callers.
 */
export { bayesianShrink };
