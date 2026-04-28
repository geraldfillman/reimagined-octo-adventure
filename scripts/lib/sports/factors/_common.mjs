/**
 * _common.mjs - sport-agnostic primitive functions for the factor framework.
 *
 * Pure, side-effect-free. No I/O, no external deps, no mutation. All exports
 * are deterministic functions of their inputs. Sibling modules (factor-registry,
 * scoring) consume these primitives to assemble per-sport factor pipelines.
 *
 * Provides:
 *   - restDays(a, b): integer day delta between two dates
 *   - travelDistance(from, to): great-circle km via haversine
 *   - homeAdvantageBaseline(sport, league): league-baseline home edge
 *   - eloUpdate({...}): Elo rating update with optional MOV multiplier
 *   - bayesianShrink({...}): shrink an observed mean toward a prior
 *   - sigmoid(x), zScore(value, mean, stdDev): small numeric helpers
 *   - HOME_ADVANTAGE_TABLE: frozen lookup of league-baseline home edges
 */

const EARTH_RADIUS_KM = 6371.0088;
const MS_PER_DAY = 86_400_000;
const DEG_TO_RAD = Math.PI / 180;

/**
 * Frozen table of league-baseline home-side edges, keyed by lowercase sport.
 * homePointShift is null when point spreads aren't a natural unit for the sport.
 */
export const HOME_ADVANTAGE_TABLE = Object.freeze({
  nba:     Object.freeze({ homeWinRate: 0.58, homePointShift: 0.6 }),
  nfl:     Object.freeze({ homeWinRate: 0.56, homePointShift: 2.5 }),
  mlb:     Object.freeze({ homeWinRate: 0.54, homePointShift: null }),
  nhl:     Object.freeze({ homeWinRate: 0.55, homePointShift: null }),
  soccer:  Object.freeze({ homeWinRate: 0.46, homePointShift: null }),
  rugby:   Object.freeze({ homeWinRate: 0.59, homePointShift: null }),
  tennis:  Object.freeze({ homeWinRate: 0.53, homePointShift: null }),
  default: Object.freeze({ homeWinRate: 0.52, homePointShift: null }),
});

/**
 * Days between two ISO date strings (or Date objects). Positive when
 * `currentEventDate` is after `lastEventDate`. Throws on invalid input.
 */
export function restDays(lastEventDate, currentEventDate) {
  const a = toDate(lastEventDate, 'lastEventDate');
  const b = toDate(currentEventDate, 'currentEventDate');
  return (b.getTime() - a.getTime()) / MS_PER_DAY;
}

/**
 * Great-circle distance in kilometers between two {lat, lon} venues.
 * Uses the haversine formula. Returns 0 for identical coordinates.
 * Throws on missing or non-finite coordinates.
 */
export function travelDistance(fromVenue, toVenue) {
  const { lat: lat1, lon: lon1 } = validateVenue(fromVenue, 'fromVenue');
  const { lat: lat2, lon: lon2 } = validateVenue(toVenue, 'toVenue');
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const phi1 = lat1 * DEG_TO_RAD;
  const phi2 = lat2 * DEG_TO_RAD;
  const dPhi = (lat2 - lat1) * DEG_TO_RAD;
  const dLambda = (lon2 - lon1) * DEG_TO_RAD;

  const h = Math.sin(dPhi / 2) ** 2
          + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * League-baseline home-side win-probability (and point-shift, when applicable)
 * for a given sport. Sport key is matched case-insensitively. The optional
 * `league` argument is reserved for future per-league overrides; today we fall
 * back to the sport-level baseline.
 */
export function homeAdvantageBaseline(sport, _league = null) {
  const key = typeof sport === 'string' ? sport.toLowerCase() : '';
  const entry = HOME_ADVANTAGE_TABLE[key] || HOME_ADVANTAGE_TABLE.default;
  return { homeWinRate: entry.homeWinRate, homePointShift: entry.homePointShift };
}

/**
 * Elo rating update with optional margin-of-victory (MOV) multiplier.
 *
 *   expectedA = 1 / (1 + 10^((eloB - eloA) / 400))
 *   delta     = kFactor * movMult * (result - expectedA)
 *
 * `result` is 1 (A wins), 0.5 (draw), 0 (B wins).
 * `mov` (optional) is the absolute final score difference; when provided we
 * apply the FiveThirtyEight-style multiplier
 *   movMult = ln(mov + 1) * (2.2 / (eloDiff*0.001 + 2.2))
 * which inflates updates after big upsets and dampens them after favourite
 * blowouts. When `mov` is null/undefined the multiplier is 1.
 */
export function eloUpdate({ eloA, eloB, result, kFactor = 20, mov = null }) {
  if (!Number.isFinite(eloA) || !Number.isFinite(eloB)) {
    throw new Error(`eloUpdate: eloA and eloB must be finite numbers (got ${eloA}, ${eloB})`);
  }
  if (!Number.isFinite(result) || result < 0 || result > 1) {
    throw new Error(`eloUpdate: result must be in [0, 1] (got ${result})`);
  }
  if (!Number.isFinite(kFactor) || kFactor <= 0) {
    throw new Error(`eloUpdate: kFactor must be > 0 (got ${kFactor})`);
  }

  const expectedA = 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
  let movMult = 1;
  if (mov !== null && mov !== undefined) {
    if (!Number.isFinite(mov) || mov < 0) {
      throw new Error(`eloUpdate: mov must be a non-negative finite number (got ${mov})`);
    }
    const eloDiffWinner = result >= 0.5 ? eloA - eloB : eloB - eloA;
    movMult = Math.log(mov + 1) * (2.2 / (eloDiffWinner * 0.001 + 2.2));
  }

  const delta = kFactor * movMult * (result - expectedA);
  return {
    newEloA: eloA + delta,
    newEloB: eloB - delta,
    expectedA,
  };
}

/**
 * Bayesian shrinkage of an observed sample-mean toward a prior:
 *   posterior = (priorWeight * prior + n * observed) / (priorWeight + n)
 *
 * `n` is the observed sample size. `priorWeight` (default 10) controls how
 * many observations are required before the posterior breaks free of the
 * prior. n=0 returns the prior; large n approaches the observed value.
 */
export function bayesianShrink({ observed, prior, n, priorWeight = 10 }) {
  if (!Number.isFinite(observed)) {
    throw new Error(`bayesianShrink: observed must be finite (got ${observed})`);
  }
  if (!Number.isFinite(prior)) {
    throw new Error(`bayesianShrink: prior must be finite (got ${prior})`);
  }
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`bayesianShrink: n must be a non-negative finite number (got ${n})`);
  }
  if (!Number.isFinite(priorWeight) || priorWeight < 0) {
    throw new Error(`bayesianShrink: priorWeight must be non-negative (got ${priorWeight})`);
  }
  const denom = priorWeight + n;
  if (denom === 0) return observed;
  return (priorWeight * prior + n * observed) / denom;
}

/** Logistic sigmoid: 1 / (1 + e^-x). */
export function sigmoid(x) {
  if (!Number.isFinite(x)) {
    throw new Error(`sigmoid: x must be finite (got ${x})`);
  }
  // Numerically stable form for large |x|.
  if (x >= 0) {
    const z = Math.exp(-x);
    return 1 / (1 + z);
  }
  const z = Math.exp(x);
  return z / (1 + z);
}

/** Standard z-score. Returns null when stdDev is 0 (or non-finite). */
export function zScore(value, mean, stdDev) {
  if (!Number.isFinite(value) || !Number.isFinite(mean) || !Number.isFinite(stdDev)) {
    return null;
  }
  if (stdDev === 0) return null;
  return (value - mean) / stdDev;
}

// ── internal helpers ────────────────────────────────────────────────────────

function toDate(input, label) {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) {
      throw new Error(`${label}: invalid Date`);
    }
    return input;
  }
  if (typeof input === 'string' && input.length > 0) {
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) {
      throw new Error(`${label}: invalid date string "${input}"`);
    }
    return d;
  }
  throw new Error(`${label}: expected ISO date string or Date (got ${typeof input})`);
}

function validateVenue(venue, label) {
  if (!venue || typeof venue !== 'object') {
    throw new Error(`${label}: expected {lat, lon} object`);
  }
  const { lat, lon } = venue;
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new Error(`${label}.lat must be a finite number in [-90, 90] (got ${lat})`);
  }
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    throw new Error(`${label}.lon must be a finite number in [-180, 180] (got ${lon})`);
  }
  return { lat, lon };
}
