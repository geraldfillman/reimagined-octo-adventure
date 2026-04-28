/**
 * racing.mjs — Per-sport factor declarations for motor racing (F1, NASCAR,
 * IndyCar, MotoGP).
 *
 * Pure: no I/O. Each `extract` is defensive and returns null on missing data.
 *
 * Racing is a field event, not a head-to-head matchup. Factors here are
 * **target-specific**: each event provides data for a single focal driver
 * relative to the field. The downstream `model_probability` represents
 * P(focal driver outperforms an average competitor in the field) — not
 * P(driver wins outright). Driver-specific factors carry `scope: 'player'`;
 * track / weather / field-context factors carry `scope: 'event'`.
 *
 * Domain note: different series weight these factors differently —
 * qualifying matters more in F1, equipment more in NASCAR. The
 * `racing_series_indicator` factor is info-only (weight 0); series-specific
 * weighting will live in the Phase 4 weights JSON.
 *
 * Factor IDs are snake_case and sport-prefixed (`racing_*`). Weights are
 * hand-tuned defaults; Phase 4 will refit from data.
 *
 * @typedef {Object} RacingEvent
 * @property {string}  [driverId]              focal driver identifier
 * @property {number}  [seriesCode]            0=F1, 1=NASCAR, 2=IndyCar, 3=MotoGP
 * @property {number}  [qualifyingPosition]    grid position (1..40); lower is better
 * @property {number}  [trackTypeFitScore]     driver's history at this track type (-2..2)
 * @property {number}  [recentFinishAvg5r]     average finish position over last 5 races (1..40)
 * @property {number}  [dnfRateRecent]         DNF rate over recent window (0..0.5)
 * @property {number}  [equipmentQualityScore] team/manufacturer quality score (0..1)
 * @property {number}  [practiceSpeedRank]     practice-session speed rank (1..40)
 * @property {boolean|number} [isWet]          wet-conditions indicator (boolean or 0/1)
 * @property {number}  [fieldSize]             number of competitors (10..40)
 * @property {number}  [trackAvgLeadChanges]   historical average lead changes at this track (0..80)
 *
 * @typedef {Object} RacingHistory  reserved for Phase 3 (rolling caches)
 */

// eslint-disable-next-line no-unused-vars
import { restDays, travelDistance, bayesianShrink } from './_common.mjs';

export const SPORT = 'racing';

/** Safe finite-number guard. */
function num(v) {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/** Clamp a value into [min, max]. */
function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export const factors = Object.freeze([
  {
    id: 'racing_series_indicator',
    sport: SPORT,
    scope: 'event',
    range: [0, 3],
    weight: 0,
    prior: 1,
    description: 'Info-only series code (0=F1, 1=NASCAR, 2=IndyCar, 3=MotoGP). Series-specific weighting lives in the Phase 4 weights JSON.',
    extract: (event) => {
      const v = num(event && event.seriesCode);
      if (v === null) return null;
      if (v !== 0 && v !== 1 && v !== 2 && v !== 3) return null;
      return v;
    },
  },
  {
    id: 'racing_qualifying_position',
    sport: SPORT,
    scope: 'player',
    range: [1, 40],
    weight: 1.0,
    prior: 15,
    description: 'Grid position (1..40); lower is better. Especially predictive in F1 / road-course series.',
    extract: (event) => {
      const v = num(event && event.qualifyingPosition);
      if (v === null) return null;
      return clamp(v, 1, 40);
    },
  },
  {
    id: 'racing_track_type_fit_score',
    sport: SPORT,
    scope: 'player',
    range: [-2, 2],
    weight: 0.9,
    prior: 0,
    description: 'Driver-specific history at this track type (oval, road, street, superspeedway). Positive = strong fit.',
    extract: (event) => {
      const v = num(event && event.trackTypeFitScore);
      if (v === null) return null;
      return clamp(v, -2, 2);
    },
  },
  {
    id: 'racing_recent_finish_avg_5r',
    sport: SPORT,
    scope: 'player',
    range: [1, 40],
    weight: 0.7,
    prior: 15,
    description: 'Average finish position over last 5 races (1..40); lower is better.',
    extract: (event) => {
      const v = num(event && event.recentFinishAvg5r);
      if (v === null) return null;
      return clamp(v, 1, 40);
    },
  },
  {
    id: 'racing_dnf_rate_recent',
    sport: SPORT,
    scope: 'player',
    range: [0, 0.5],
    weight: 0.4,
    prior: 0.1,
    description: 'DNF rate over recent window (0..0.5). High = reliability concern.',
    extract: (event) => {
      const v = num(event && event.dnfRateRecent);
      if (v === null) return null;
      return clamp(v, 0, 0.5);
    },
  },
  {
    id: 'racing_equipment_quality_score',
    sport: SPORT,
    scope: 'player',
    range: [0, 1],
    weight: 0.8,
    prior: 0.5,
    description: 'Team/manufacturer-equipment quality score on a 0..1 scale.',
    extract: (event) => {
      const v = num(event && event.equipmentQualityScore);
      if (v === null) return null;
      return clamp(v, 0, 1);
    },
  },
  {
    id: 'racing_practice_speed_rank',
    sport: SPORT,
    scope: 'player',
    range: [1, 40],
    weight: 0.5,
    prior: 15,
    description: 'Practice-session speed rank (1..40); lower is better.',
    extract: (event) => {
      const v = num(event && event.practiceSpeedRank);
      if (v === null) return null;
      return clamp(v, 1, 40);
    },
  },
  {
    id: 'racing_weather_wet_indicator',
    sport: SPORT,
    scope: 'event',
    range: [0, 1],
    weight: 0.3,
    prior: 0,
    description: 'Wet-conditions indicator (0/1). Wet conditions amplify driver-skill differential and randomness.',
    extract: (event) => {
      if (!event) return null;
      const v = event.isWet;
      if (v === true) return 1;
      if (v === false) return 0;
      const n = num(v);
      if (n === null) return null;
      if (n !== 0 && n !== 1) return null;
      return n;
    },
  },
  {
    id: 'racing_field_size',
    sport: SPORT,
    scope: 'event',
    range: [10, 40],
    weight: 0.2,
    prior: 22,
    description: 'Number of competitors (10..40). Larger field → harder for any one driver to win.',
    extract: (event) => {
      const v = num(event && event.fieldSize);
      if (v === null) return null;
      return clamp(v, 10, 40);
    },
  },
  {
    id: 'racing_track_avg_lead_changes',
    sport: SPORT,
    scope: 'event',
    range: [0, 80],
    weight: 0.2,
    prior: 20,
    description: 'Historical average lead changes at this track. High → outcomes more random; small weight, treated as a context variable.',
    extract: (event) => {
      const v = num(event && event.trackAvgLeadChanges);
      if (v === null) return null;
      return clamp(v, 0, 80);
    },
  },
]);
