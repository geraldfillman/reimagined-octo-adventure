/**
 * factor-registry.mjs — Sport-agnostic Factor declaration registry.
 *
 * Phase 1b of the sports prediction framework. Pure registry: no I/O, no
 * external state. Mirrors the shape-then-helpers pattern of `lib/signals.mjs`
 * (id-keyed records, frozen results, pure evaluators) but generalised so any
 * per-sport module in Phase 2 can register a factor declaration and have it
 * orchestrated through `extractAllForSport`.
 *
 * @typedef {Object} FactorDeclaration
 * @property {string} id              stable snake_case id, e.g. 'mlb_park_factor_runs'
 * @property {('mlb'|'nba'|'nfl'|'nhl'|'soccer'|'rugby'|'tennis'|'golf'|'cricket'|'combat'|'racing'|'esports'|'horse_racing')} sport
 * @property {('team'|'player'|'event'|'market')} scope
 * @property {(event: object, history?: object) => number|null} extract
 * @property {number} prior           league-baseline value for Bayesian shrinkage
 * @property {[number, number]} range [min, max] sane bounds for validation
 * @property {number} weight          default rule-based weight (>=0)
 * @property {string} [description]
 *
 * @typedef {Object} ExtractionResult
 * @property {string} id
 * @property {string} sport
 * @property {string} scope
 * @property {number|null} value
 * @property {boolean} [withinRange]
 * @property {string} [error]
 */

/** Frozen list of supported sport keys (13 sports per the framework plan). */
export const SUPPORTED_SPORTS = Object.freeze([
  'mlb',
  'nba',
  'nfl',
  'nhl',
  'soccer',
  'rugby',
  'tennis',
  'golf',
  'cricket',
  'combat',
  'racing',
  'esports',
  'horse_racing',
]);

/** Frozen list of supported scopes. */
export const SUPPORTED_SCOPES = Object.freeze(['team', 'player', 'event', 'market']);

const SUPPORTED_SPORTS_SET = new Set(SUPPORTED_SPORTS);
const SUPPORTED_SCOPES_SET = new Set(SUPPORTED_SCOPES);
const SNAKE_CASE_RE = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;

/**
 * Validate a single factor declaration. Throws on the first violation with a
 * descriptive message. Returns the factor on success (for chaining).
 *
 * @param {FactorDeclaration} factor
 * @returns {FactorDeclaration}
 */
export function validateFactor(factor) {
  if (factor == null || typeof factor !== 'object') {
    throw new Error('Factor must be a non-null object');
  }

  // id
  if (typeof factor.id !== 'string' || factor.id.length === 0) {
    throw new Error('Factor.id must be a non-empty string');
  }
  if (!SNAKE_CASE_RE.test(factor.id)) {
    throw new Error(`Factor.id "${factor.id}" must be snake_case (lowercase letters, digits, underscores; cannot start with digit or underscore)`);
  }

  // sport
  if (!SUPPORTED_SPORTS_SET.has(factor.sport)) {
    throw new Error(`Factor.sport "${factor.sport}" not in supported set: ${SUPPORTED_SPORTS.join(', ')}`);
  }

  // scope
  if (!SUPPORTED_SCOPES_SET.has(factor.scope)) {
    throw new Error(`Factor.scope "${factor.scope}" not in supported set: ${SUPPORTED_SCOPES.join(', ')}`);
  }

  // extract
  if (typeof factor.extract !== 'function') {
    throw new Error(`Factor.extract for "${factor.id}" must be a function`);
  }

  // range
  if (!Array.isArray(factor.range) || factor.range.length !== 2) {
    throw new Error(`Factor.range for "${factor.id}" must be a [min, max] tuple`);
  }
  const [min, max] = factor.range;
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new Error(`Factor.range for "${factor.id}" must contain finite numbers`);
  }
  if (min >= max) {
    throw new Error(`Factor.range for "${factor.id}" requires range[0] < range[1] (got [${min}, ${max}])`);
  }

  // prior
  if (!Number.isFinite(factor.prior)) {
    throw new Error(`Factor.prior for "${factor.id}" must be a finite number`);
  }
  if (factor.prior < min || factor.prior > max) {
    throw new Error(`Factor.prior (${factor.prior}) for "${factor.id}" must lie within range [${min}, ${max}]`);
  }

  // weight
  if (!Number.isFinite(factor.weight)) {
    throw new Error(`Factor.weight for "${factor.id}" must be a finite number`);
  }
  if (factor.weight < 0) {
    throw new Error(`Factor.weight for "${factor.id}" must be >= 0 (got ${factor.weight})`);
  }

  return factor;
}

/**
 * Build an immutable registry from an array of factor declarations.
 * Validates each, throws on duplicate ids, and returns a frozen object.
 *
 * @param {FactorDeclaration[]} declarations
 * @returns {{
 *   factors: ReadonlyArray<FactorDeclaration>,
 *   byId: Readonly<Record<string, FactorDeclaration>>,
 *   bySport: (sport: string) => ReadonlyArray<FactorDeclaration>,
 *   bySportScope: (sport: string, scope: string) => ReadonlyArray<FactorDeclaration>,
 * }}
 */
export function buildRegistry(declarations) {
  if (!Array.isArray(declarations)) {
    throw new Error('buildRegistry requires an array of FactorDeclaration');
  }

  const seen = new Set();
  const validated = [];
  const byIdMap = Object.create(null);

  for (const decl of declarations) {
    validateFactor(decl);
    if (seen.has(decl.id)) {
      throw new Error(`Duplicate factor id "${decl.id}" in registry`);
    }
    seen.add(decl.id);
    // Freeze each declaration shallowly so callers cannot mutate it post-build.
    const frozen = Object.freeze({
      ...decl,
      range: Object.freeze([decl.range[0], decl.range[1]]),
    });
    validated.push(frozen);
    byIdMap[decl.id] = frozen;
  }

  const factors = Object.freeze(validated);
  const byId = Object.freeze(byIdMap);

  const bySport = (sport) =>
    Object.freeze(factors.filter((f) => f.sport === sport));

  const bySportScope = (sport, scope) =>
    Object.freeze(factors.filter((f) => f.sport === sport && f.scope === scope));

  return Object.freeze({
    factors,
    byId,
    bySport,
    bySportScope,
  });
}

/**
 * Extract a single factor against an event/history. Catches throws from the
 * extract function and reports them in the result envelope. Coerces NaN /
 * non-finite numeric returns to null.
 *
 * @param {FactorDeclaration} factor
 * @param {object} event
 * @param {object} [history]
 * @returns {ExtractionResult}
 */
export function extractOne(factor, event, history) {
  const base = {
    id: factor.id,
    sport: factor.sport,
    scope: factor.scope,
  };

  let raw;
  try {
    raw = factor.extract(event, history);
  } catch (err) {
    return Object.freeze({
      ...base,
      value: null,
      error: err && err.message ? String(err.message) : String(err),
    });
  }

  // Allow null/undefined to mean "data missing"
  if (raw === null || raw === undefined) {
    return Object.freeze({ ...base, value: null });
  }

  if (typeof raw !== 'number' || !Number.isFinite(raw)) {
    // Clamp NaN / Infinity / non-numeric to null per contract.
    return Object.freeze({ ...base, value: null });
  }

  const [min, max] = factor.range;
  const withinRange = raw >= min && raw <= max;
  return Object.freeze({ ...base, value: raw, withinRange });
}

/**
 * Extract every factor in the registry that matches `sport`, in registry
 * insertion order. Unknown sports yield an empty array.
 *
 * @param {ReturnType<typeof buildRegistry>} registry
 * @param {string} sport
 * @param {object} event
 * @param {object} [history]
 * @returns {ExtractionResult[]}
 */
export function extractAllForSport(registry, sport, event, history) {
  if (!registry || !Array.isArray(registry.factors)) {
    throw new Error('extractAllForSport requires a registry built by buildRegistry');
  }
  if (!SUPPORTED_SPORTS_SET.has(sport)) {
    return [];
  }
  const results = [];
  for (const factor of registry.factors) {
    if (factor.sport !== sport) continue;
    results.push(extractOne(factor, event, history));
  }
  return results;
}

/**
 * Summarize coverage for an array of extraction results. Used by Phase 1c
 * scoring to derive a confidence multiplier from data-completeness.
 *
 * @param {ExtractionResult[]} extractions
 * @returns {{
 *   total: number,
 *   withValue: number,
 *   missingIds: string[],
 *   errorIds: string[],
 *   coverageRatio: number,
 * }}
 */
export function summarizeExtraction(extractions) {
  if (!Array.isArray(extractions)) {
    throw new Error('summarizeExtraction requires an array');
  }
  const total = extractions.length;
  const missingIds = [];
  const errorIds = [];
  let withValue = 0;

  for (const r of extractions) {
    if (r && r.error) {
      errorIds.push(r.id);
      missingIds.push(r.id);
    } else if (r == null || r.value === null || r.value === undefined) {
      missingIds.push(r && r.id);
    } else {
      withValue += 1;
    }
  }

  const coverageRatio = total === 0 ? 0 : withValue / total;
  return Object.freeze({
    total,
    withValue,
    missingIds: Object.freeze(missingIds),
    errorIds: Object.freeze(errorIds),
    coverageRatio,
  });
}
