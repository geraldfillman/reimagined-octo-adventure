/**
 * combat.mjs — Per-sport factor declarations for combat sports (MMA, boxing).
 *
 * Pure: no I/O. Each `extract` is defensive and returns null on missing data.
 *
 * Combat is a head-to-head sport. Convention: every event compares
 * `player_a` (the favourite-by-Elo or the listed-first competitor) against
 * `player_b`. Diff factors are computed as `player_a - player_b`, so
 * positive contributions favour player_a. The downstream
 * `model_probability` represents P(player_a wins).
 *
 * Factor IDs are snake_case and sport-prefixed (`combat_*`). Weights are
 * hand-tuned defaults; Phase 4 will refit from data.
 *
 * @typedef {Object} CombatEvent
 * @property {string}  [playerA]                   identifier for player_a
 * @property {string}  [playerB]                   identifier for player_b
 * @property {number}  [reachInchesA]              reach in inches for player_a
 * @property {number}  [reachInchesB]              reach in inches for player_b
 * @property {number}  [ageA]                      age (years) for player_a
 * @property {number}  [ageB]                      age (years) for player_b
 * @property {number}  [layoffMonthsA]             months since last fight for player_a
 * @property {number}  [layoffMonthsB]             months since last fight for player_b
 * @property {number}  [recentForm5fA]             last-5-fight win rate (0..1) for player_a
 * @property {number}  [recentForm5fB]             last-5-fight win rate (0..1) for player_b
 * @property {number}  [finishRateA]               KO+sub rate (0..1) for player_a
 * @property {number}  [finishRateB]               KO+sub rate (0..1) for player_b
 * @property {number}  [strikeAccuracyA]           significant-strike accuracy (0..1) for player_a
 * @property {number}  [strikeAccuracyB]           significant-strike accuracy (0..1) for player_b
 * @property {number}  [takedownDefenseA]          takedown defense rate (0..1) for player_a
 * @property {number}  [takedownDefenseB]          takedown defense rate (0..1) for player_b
 * @property {number}  [weightCutHistoryScoreA]    bad-weight-cut indicator (-1..1) for player_a; positive = recent miss/extreme cut
 * @property {number}  [weightCutHistoryScoreB]    same for player_b
 * @property {number}  [styleMatchupScore]         composite striker-vs-grappler score (-1..1) from player_a's perspective
 * @property {number}  [championshipRoundsBestOf]  3 (standard) or 5 (championship-rounds)
 *
 * @typedef {Object} CombatHistory  reserved for Phase 3 (rolling caches)
 */

// eslint-disable-next-line no-unused-vars
import { restDays, travelDistance, bayesianShrink } from './_common.mjs';

export const SPORT = 'combat';

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
    id: 'combat_player_a_indicator',
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
    id: 'combat_reach_diff_inches',
    sport: SPORT,
    scope: 'event',
    range: [-15, 15],
    weight: 0.6,
    prior: 0,
    description: 'Reach difference in inches (player_a - player_b). Positive favours player_a.',
    extract: (event) => {
      const d = diff(event && event.reachInchesA, event && event.reachInchesB);
      if (d === null) return null;
      return clamp(d, -15, 15);
    },
  },
  {
    id: 'combat_age_diff_years',
    sport: SPORT,
    scope: 'event',
    range: [-15, 15],
    weight: 0.4,
    prior: 0,
    description: 'Age difference in years (player_a - player_b). Sign convention: positive = player_a is older. Older fighters past ~32 typically decline; downstream weights JSON will sign this appropriately.',
    extract: (event) => {
      const d = diff(event && event.ageA, event && event.ageB);
      if (d === null) return null;
      return clamp(d, -15, 15);
    },
  },
  {
    id: 'combat_layoff_diff_months',
    sport: SPORT,
    scope: 'event',
    range: [-24, 24],
    weight: 0.5,
    prior: 0,
    description: 'Layoff difference in months (player_a - player_b). Long layoffs typically hurt; sign handled downstream.',
    extract: (event) => {
      const d = diff(event && event.layoffMonthsA, event && event.layoffMonthsB);
      if (d === null) return null;
      return clamp(d, -24, 24);
    },
  },
  {
    id: 'combat_recent_form_diff_5f',
    sport: SPORT,
    scope: 'event',
    range: [-1, 1],
    weight: 1.0,
    prior: 0,
    description: 'Last-5-fight win-rate difference (player_a - player_b). Positive favours player_a.',
    extract: (event) => {
      const d = diff(event && event.recentForm5fA, event && event.recentForm5fB);
      if (d === null) return null;
      return clamp(d, -1, 1);
    },
  },
  {
    id: 'combat_finish_rate_diff',
    sport: SPORT,
    scope: 'event',
    range: [-0.5, 0.5],
    weight: 0.5,
    prior: 0,
    description: 'Finish-rate (KO+submission) difference (player_a - player_b).',
    extract: (event) => {
      const d = diff(event && event.finishRateA, event && event.finishRateB);
      if (d === null) return null;
      return clamp(d, -0.5, 0.5);
    },
  },
  {
    id: 'combat_strike_accuracy_diff',
    sport: SPORT,
    scope: 'event',
    range: [-0.3, 0.3],
    weight: 0.7,
    prior: 0,
    description: 'Significant-strike accuracy difference (player_a - player_b).',
    extract: (event) => {
      const d = diff(event && event.strikeAccuracyA, event && event.strikeAccuracyB);
      if (d === null) return null;
      return clamp(d, -0.3, 0.3);
    },
  },
  {
    id: 'combat_takedown_defense_diff',
    sport: SPORT,
    scope: 'event',
    range: [-0.5, 0.5],
    weight: 0.6,
    prior: 0,
    description: 'Takedown-defense rate difference (player_a - player_b).',
    extract: (event) => {
      const d = diff(event && event.takedownDefenseA, event && event.takedownDefenseB);
      if (d === null) return null;
      return clamp(d, -0.5, 0.5);
    },
  },
  {
    id: 'combat_weight_cut_history_diff',
    sport: SPORT,
    scope: 'event',
    range: [-1, 1],
    weight: 0.4,
    prior: 0,
    description: 'Bad-weight-cut indicator difference (player_a - player_b). Higher score = recent miss/extreme cut; positive diff means player_a had the worse cut.',
    extract: (event) => {
      const d = diff(event && event.weightCutHistoryScoreA, event && event.weightCutHistoryScoreB);
      if (d === null) return null;
      return clamp(d, -1, 1);
    },
  },
  {
    id: 'combat_style_matchup_score',
    sport: SPORT,
    scope: 'event',
    range: [-1, 1],
    weight: 0.7,
    prior: 0,
    description: 'Composite style-matchup score (striker vs grappler etc.) from player_a\'s perspective. Positive favours player_a.',
    extract: (event) => {
      const v = num(event && event.styleMatchupScore);
      if (v === null) return null;
      return clamp(v, -1, 1);
    },
  },
  {
    id: 'combat_championship_rounds_indicator',
    sport: SPORT,
    scope: 'event',
    range: [3, 5],
    weight: 0.2,
    prior: 3,
    description: 'Best-of-N round count (3 standard, 5 championship). Five-round fights change pacing and reward conditioning.',
    extract: (event) => {
      const v = num(event && event.championshipRoundsBestOf);
      if (v === null) return null;
      if (v !== 3 && v !== 5) return null;
      return v;
    },
  },
]);
