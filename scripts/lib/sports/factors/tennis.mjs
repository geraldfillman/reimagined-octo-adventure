/**
 * tennis.mjs — Per-sport factor declarations for professional tennis.
 *
 * Pure: no I/O. Each `extract` is defensive and returns null on missing data.
 *
 * Tennis is a head-to-head sport, so the "home/away" framing breaks down.
 * Convention: every event compares `player_a` (the favourite-by-Elo or the
 * listed-first competitor) against `player_b`. Diff factors are computed as
 * `player_a - player_b`, so positive contributions favour player_a. The
 * downstream `model_probability` represents P(player_a wins).
 *
 * Factor IDs are snake_case and sport-prefixed (`tennis_*`). Weights are
 * hand-tuned defaults; Phase 4 will refit from data.
 *
 * @typedef {Object} TennisEvent
 * @property {string}  [playerA]              identifier for player_a (favourite-by-Elo)
 * @property {string}  [playerB]              identifier for player_b
 * @property {number}  [surfaceEloA]          surface-specific Elo for player_a
 * @property {number}  [surfaceEloB]          surface-specific Elo for player_b
 * @property {number}  [overallEloA]          overall (all-surface) Elo for player_a
 * @property {number}  [overallEloB]          overall (all-surface) Elo for player_b
 * @property {number}  [recentForm8mA]        last-8-match win rate (0..1) for player_a
 * @property {number}  [recentForm8mB]        last-8-match win rate (0..1) for player_b
 * @property {number}  [h2hWinsA]             head-to-head wins for player_a
 * @property {number}  [h2hWinsB]             head-to-head wins for player_b
 * @property {number}  [restDaysA]            days of rest for player_a
 * @property {number}  [restDaysB]            days of rest for player_b
 * @property {number}  [altitudeMeters]       venue altitude above sea level
 * @property {number}  [firstServeWinPctA]    first-serve points won fraction (0..1) for player_a
 * @property {number}  [firstServeWinPctB]    first-serve points won fraction (0..1) for player_b
 * @property {number}  [breakPointSavePctA]   break-point save rate (0..1) for player_a
 * @property {number}  [breakPointSavePctB]   break-point save rate (0..1) for player_b
 * @property {number}  [matchFormatBestOf]    3 (best-of-3) or 5 (best-of-5)
 *
 * @typedef {Object} TennisHistory  reserved for Phase 3 (rolling history caches)
 */

// eslint-disable-next-line no-unused-vars
import { restDays, travelDistance, bayesianShrink } from './_common.mjs';

export const SPORT = 'tennis';

/** Safe finite-number guard. */
function num(v) {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/** Difference helper: returns (a - b) when both are finite numbers, else null. */
function diff(a, b) {
  const av = num(a);
  const bv = num(b);
  if (av === null || bv === null) return null;
  return av - bv;
}

/** Clamp a value into [min, max]. */
function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export const factors = Object.freeze([
  {
    id: 'tennis_player_a_indicator',
    sport: SPORT,
    scope: 'event',
    range: [0, 1],
    weight: 0,
    prior: 1,
    description: 'Info-only marker that the model probability refers to player_a winning. Always 1 when an event is supplied.',
    extract: (event) => {
      if (!event || typeof event !== 'object') return null;
      return 1;
    },
  },
  {
    id: 'tennis_surface_elo_diff',
    sport: SPORT,
    scope: 'event',
    range: [-400, 400],
    weight: 1.6,
    prior: 0,
    description: 'Surface-specific Elo difference (player_a - player_b). Strongest single predictor in tennis.',
    extract: (event) => diff(event && event.surfaceEloA, event && event.surfaceEloB),
  },
  {
    id: 'tennis_overall_elo_diff',
    sport: SPORT,
    scope: 'event',
    range: [-400, 400],
    weight: 0.8,
    prior: 0,
    description: 'Overall Elo difference (player_a - player_b). Surface-agnostic baseline strength.',
    extract: (event) => diff(event && event.overallEloA, event && event.overallEloB),
  },
  {
    id: 'tennis_recent_form_diff_8m',
    sport: SPORT,
    scope: 'event',
    range: [-1, 1],
    weight: 0.6,
    prior: 0,
    description: 'Last-8-match win-rate difference (player_a - player_b).',
    extract: (event) => diff(event && event.recentForm8mA, event && event.recentForm8mB),
  },
  {
    id: 'tennis_h2h_diff',
    sport: SPORT,
    scope: 'event',
    range: [-1, 1],
    weight: 0.4,
    prior: 0,
    description: 'Head-to-head record difference normalised on a ±5-game cap (player_a - player_b).',
    extract: (event) => {
      const winsA = num(event && event.h2hWinsA);
      const winsB = num(event && event.h2hWinsB);
      if (winsA === null || winsB === null) return null;
      // Normalize to [-1, 1] by capping the meaningful range at ±5 games.
      const raw = winsA - winsB;
      return clamp(raw / 5, -1, 1);
    },
  },
  {
    id: 'tennis_rest_diff_days',
    sport: SPORT,
    scope: 'event',
    range: [-7, 7],
    weight: 0.5,
    prior: 0,
    description: 'Rest-days difference (player_a - player_b). Positive favours a fresher player_a.',
    extract: (event) => {
      const a = num(event && event.restDaysA);
      const b = num(event && event.restDaysB);
      if (a === null || b === null) return null;
      return clamp(a - b, -7, 7);
    },
  },
  {
    id: 'tennis_altitude_meters',
    sport: SPORT,
    scope: 'event',
    range: [0, 3000],
    weight: 0.2,
    prior: 100,
    description: 'Venue altitude in meters. High altitude (e.g. Bogotá) favours big servers via faster ball flight.',
    extract: (event) => {
      const v = num(event && event.altitudeMeters);
      if (v === null) return null;
      return clamp(v, 0, 3000);
    },
  },
  {
    id: 'tennis_serve_dominance_diff',
    sport: SPORT,
    scope: 'event',
    range: [-0.2, 0.2],
    weight: 0.7,
    prior: 0,
    description: 'First-serve points-won percentage difference (player_a - player_b).',
    extract: (event) => {
      const d = diff(event && event.firstServeWinPctA, event && event.firstServeWinPctB);
      if (d === null) return null;
      return clamp(d, -0.2, 0.2);
    },
  },
  {
    id: 'tennis_break_point_save_diff',
    sport: SPORT,
    scope: 'event',
    range: [-0.2, 0.2],
    weight: 0.4,
    prior: 0,
    description: 'Break-point save rate difference (player_a - player_b).',
    extract: (event) => {
      const d = diff(event && event.breakPointSavePctA, event && event.breakPointSavePctB);
      if (d === null) return null;
      return clamp(d, -0.2, 0.2);
    },
  },
  {
    id: 'tennis_match_format',
    sport: SPORT,
    scope: 'event',
    range: [3, 5],
    weight: 0.3,
    prior: 3,
    description: 'Best-of-N format (3 or 5). Longer matches favour the fitter player; weight is small because direction is data-conditional.',
    extract: (event) => {
      const v = num(event && event.matchFormatBestOf);
      if (v === null) return null;
      if (v !== 3 && v !== 5) return null;
      return v;
    },
  },
]);
