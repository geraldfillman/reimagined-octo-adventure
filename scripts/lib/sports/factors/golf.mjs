/**
 * golf.mjs — Per-sport factor declarations for professional golf (PGA / DP World).
 *
 * Pure: no I/O. Each `extract` is defensive and returns null on missing data.
 *
 * Golf is a field event, not a head-to-head matchup. Factors here are
 * **target-specific**: each event provides data for a single focal competitor
 * relative to the field. The downstream `model_probability` therefore
 * represents P(focal player outperforms an average competitor in the field) —
 * not P(player wins outright). Field-level factors (course, weather, field
 * strength) carry `scope: 'event'` and apply uniformly; player-specific
 * factors carry `scope: 'player'` and depend on the focal competitor.
 *
 * Factor IDs are snake_case and sport-prefixed (`golf_*`). Weights are
 * hand-tuned defaults; Phase 4 will refit from data.
 *
 * @typedef {Object} GolfEvent
 * @property {string}  [playerId]              focal competitor identifier
 * @property {number}  [sgTotal30d]            strokes-gained total per round, last 30 days
 * @property {number}  [sgOffTee30d]           strokes-gained off-the-tee per round, last 30 days
 * @property {number}  [sgApproach30d]         strokes-gained approach per round, last 30 days
 * @property {number}  [sgPutting30d]          strokes-gained putting per round, last 30 days
 * @property {number}  [courseFitScore]        course-type weighted SG history (-2..2)
 * @property {number}  [cutsMadePct10]         cuts made fraction (0..1) over last 10 events
 * @property {number}  [fieldStrengthAvgSg]    average field SG-total (40..100, OWGR-style)
 * @property {number}  [weatherWindAvgMph]     average wind speed at venue
 * @property {number}  [worldRanking]          OWGR ranking (1..500); lower is better
 *
 * @typedef {Object} GolfHistory  reserved for Phase 3 (rolling caches)
 */

// eslint-disable-next-line no-unused-vars
import { restDays, travelDistance, bayesianShrink } from './_common.mjs';

export const SPORT = 'golf';

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
    id: 'golf_sg_total_30d',
    sport: SPORT,
    scope: 'player',
    range: [-3, 3],
    weight: 1.5,
    prior: 0,
    description: 'Strokes-gained total per round over the last 30 days. Headline player-quality signal.',
    extract: (event) => {
      const v = num(event && event.sgTotal30d);
      if (v === null) return null;
      return clamp(v, -3, 3);
    },
  },
  {
    id: 'golf_sg_off_tee_30d',
    sport: SPORT,
    scope: 'player',
    range: [-2, 2],
    weight: 0.7,
    prior: 0,
    description: 'Strokes-gained off-the-tee, last 30 days.',
    extract: (event) => {
      const v = num(event && event.sgOffTee30d);
      if (v === null) return null;
      return clamp(v, -2, 2);
    },
  },
  {
    id: 'golf_sg_approach_30d',
    sport: SPORT,
    scope: 'player',
    range: [-2, 2],
    weight: 1.0,
    prior: 0,
    description: 'Strokes-gained approach-the-green, last 30 days. Strongest of the SG components.',
    extract: (event) => {
      const v = num(event && event.sgApproach30d);
      if (v === null) return null;
      return clamp(v, -2, 2);
    },
  },
  {
    id: 'golf_sg_putting_30d',
    sport: SPORT,
    scope: 'player',
    range: [-2, 2],
    weight: 0.6,
    prior: 0,
    description: 'Strokes-gained putting, last 30 days.',
    extract: (event) => {
      const v = num(event && event.sgPutting30d);
      if (v === null) return null;
      return clamp(v, -2, 2);
    },
  },
  {
    id: 'golf_course_fit_score',
    sport: SPORT,
    scope: 'event',
    range: [-2, 2],
    weight: 1.0,
    prior: 0,
    description: 'Derived course-fit: SG history weighted by course type (links/parkland/desert/altitude). Range matches SG.',
    extract: (event) => {
      const v = num(event && event.courseFitScore);
      if (v === null) return null;
      return clamp(v, -2, 2);
    },
  },
  {
    id: 'golf_recent_cuts_made_pct',
    sport: SPORT,
    scope: 'player',
    range: [0, 1],
    weight: 0.3,
    prior: 0.6,
    description: 'Cuts-made fraction over the last 10 events. Coarse reliability proxy.',
    extract: (event) => {
      const v = num(event && event.cutsMadePct10);
      if (v === null) return null;
      return clamp(v, 0, 1);
    },
  },
  {
    id: 'golf_field_strength',
    sport: SPORT,
    scope: 'event',
    range: [40, 100],
    weight: 0.2,
    prior: 70,
    description: 'Average field SG-total (OWGR-style scale). Higher = harder field; small weight, treated mostly as a context variable.',
    extract: (event) => {
      const v = num(event && event.fieldStrengthAvgSg);
      if (v === null) return null;
      return clamp(v, 40, 100);
    },
  },
  {
    id: 'golf_weather_wind_avg',
    sport: SPORT,
    scope: 'event',
    range: [0, 30],
    weight: 0.4,
    prior: 8,
    description: 'Average wind speed (mph) at venue. High winds amplify variance and reward ball-strikers.',
    extract: (event) => {
      const v = num(event && event.weatherWindAvgMph);
      if (v === null) return null;
      return clamp(v, 0, 30);
    },
  },
  {
    id: 'golf_player_world_ranking',
    sport: SPORT,
    scope: 'player',
    range: [1, 500],
    weight: 0.5,
    prior: 100,
    description: 'OWGR world ranking (1..500). Sign convention: lower rank is *better* — z-score against prior 100 makes top-10 negative-direction; the weights JSON in Phase 4 is expected to flip the sign as needed.',
    extract: (event) => {
      const v = num(event && event.worldRanking);
      if (v === null) return null;
      return clamp(v, 1, 500);
    },
  },
]);
