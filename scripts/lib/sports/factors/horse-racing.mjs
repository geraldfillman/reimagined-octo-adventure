/**
 * horse-racing.mjs — Horse-racing factor declarations.
 *
 * Sport key: 'horse_racing'.
 *
 * This is a FIELD EVENT module (like golf and motor racing): the
 * `model_probability` produced by the scoring engine represents the focal
 * horse's probability of OUTPERFORMING THE FIELD AVERAGE (not a head-to-head
 * win probability). To convert to absolute win probability, downstream code
 * must combine field-event scores via softmax / Plackett-Luce in Phase 3.
 *
 * Domain notes:
 *   - Speed figures (Beyer / Equibase / Timeform) are the single most
 *     predictive horse-racing input. They normalise final times across
 *     conditions and tracks.
 *   - Class change is the second-largest documented edge: dropping in class
 *     historically over-performs the market; rising in class under-performs.
 *   - Suitability triads (distance × surface × going) capture sport-specific
 *     conditions that don't exist in other sports.
 *   - Pace fit is non-linear: front-runners need slow projected pace,
 *     closers need fast projected pace. The factor is a single composite
 *     score from the focal horse's POV.
 *
 * Per-horse factors use scope: 'player'. Per-race context factors use
 * scope: 'event'.
 *
 * @typedef {Object} HorseRacingEvent
 * @property {object} horse                          - the focal horse
 * @property {string} [horse.id]
 * @property {('dirt'|'turf'|'synthetic')} surface
 * @property {('firm'|'good'|'yielding'|'soft'|'heavy'|'fast'|'sloppy'|'muddy'|'frozen')} going
 * @property {number} distanceFurlongs
 * @property {number} fieldSize
 * @property {number} [postPosition]                  - 1..N
 * @property {('slow'|'average'|'fast')} [paceProjection]
 * @property {string} [trackId]
 * @property {string} [classLevel]                    - free-form class label, used to derive change
 *
 * @typedef {Object} HorseRacingHistory
 * @property {Array<{speedFigure: number, date: string, classLevel?: string}>} [recentRuns]
 * @property {{ winRate30d?: number, strikeRateAtTrack?: number }} [trainer]
 * @property {{ winRate30d?: number }} [jockey]
 * @property {{ winRate?: number, runs?: number }} [jockeyTrainerCombo]
 * @property {{ wins: number, runs: number }} [distanceRecord]
 * @property {{ wins: number, runs: number }} [surfaceRecord]
 * @property {{ wins: number, runs: number }} [goingRecord]
 * @property {{ paceStyle: 'front'|'press'|'stalk'|'closer' }} [runningStyle]
 * @property {Object<string, number>} [postBiasByTrack]   - { trackId: bias_in_winrate_pp }
 * @property {{ pounds: number, fieldAvgPounds: number }} [weight]
 */

import { restDays, bayesianShrink } from './_common.mjs';

export const SPORT = 'horse_racing';

/** Approximate suitability score from a (wins, runs) record, shrunk to a 0.10 prior. */
function suitabilityScore(record) {
  if (!record || !Number.isFinite(record.runs) || record.runs <= 0) return null;
  const winRate = record.wins / record.runs;
  const shrunk = bayesianShrink({
    observed: winRate,
    prior: 0.10,
    n: record.runs,
    priorWeight: 6,
  });
  // Re-center on the field-average win rate (1 / fieldSize) approximated as 0.10.
  // Result range roughly [-1, +2]; clamp to [-2, 2].
  const raw = (shrunk - 0.10) * 8;
  return Math.max(-2, Math.min(2, raw));
}

/** Map running-style + pace projection to a fit score in [-1, 1]. */
function paceFit(runningStyle, paceProjection) {
  if (!runningStyle || !paceProjection) return null;
  const matrix = {
    front:   { slow:  1.0, average:  0.2, fast: -0.8 },
    press:   { slow:  0.5, average:  0.1, fast: -0.3 },
    stalk:   { slow: -0.1, average:  0.2, fast:  0.3 },
    closer:  { slow: -0.8, average:  0.0, fast:  0.9 },
  };
  const row = matrix[runningStyle];
  if (!row) return null;
  const v = row[paceProjection];
  return v ?? null;
}

/** Coerce a class-change descriptor into a numeric step. */
function classChangeStep(prevLevel, currentLevel) {
  if (!prevLevel || !currentLevel) return null;
  const tiers = ['maiden', 'claiming', 'allowance', 'starter_allowance', 'listed', 'group3', 'group2', 'group1'];
  const prevIdx = tiers.indexOf(String(prevLevel).toLowerCase());
  const currIdx = tiers.indexOf(String(currentLevel).toLowerCase());
  if (prevIdx === -1 || currIdx === -1) return null;
  // Positive value = class drop (easier field) — favourable.
  return Math.max(-3, Math.min(3, prevIdx - currIdx));
}

export const factors = Object.freeze([
  {
    id: 'horse_racing_speed_figure_last3_avg',
    sport: SPORT,
    scope: 'player',
    extract: (event, history) => {
      const runs = history?.recentRuns;
      if (!Array.isArray(runs) || runs.length === 0) return null;
      const figs = runs.slice(0, 3).map(r => r.speedFigure).filter(Number.isFinite);
      if (figs.length === 0) return null;
      return figs.reduce((a, b) => a + b, 0) / figs.length;
    },
    prior: 80,
    range: [40, 130],
    weight: 1.4,
    description: 'Mean speed figure (Beyer / Equibase / Timeform-style) across the last 3 starts. Higher is better.',
  },
  {
    id: 'horse_racing_class_change_indicator',
    sport: SPORT,
    scope: 'player',
    extract: (event, history) => {
      const lastRun = history?.recentRuns?.[0];
      const lastLevel = lastRun?.classLevel;
      const currentLevel = event?.classLevel;
      return classChangeStep(lastLevel, currentLevel);
    },
    prior: 0,
    range: [-3, 3],
    weight: 0.8,
    description: 'Step change in class level vs last start. Positive = class drop (easier field), negative = class rise.',
  },
  {
    id: 'horse_racing_days_since_last_race',
    sport: SPORT,
    scope: 'player',
    extract: (event, history) => {
      const last = history?.recentRuns?.[0];
      if (!last?.date || !event?.date) return null;
      const days = restDays(last.date, event.date);
      if (!Number.isFinite(days) || days < 0) return null;
      return Math.min(365, days);
    },
    prior: 28,
    range: [0, 365],
    weight: 0.4,
    description: 'Days since last race. Sweet spot is typically 21–45 days; long layoffs and quick turnarounds both flag.',
  },
  {
    id: 'horse_racing_jockey_winrate_30d',
    sport: SPORT,
    scope: 'player',
    extract: (event, history) => {
      const v = history?.jockey?.winRate30d;
      if (!Number.isFinite(v)) return null;
      return Math.max(0, Math.min(0.5, v));
    },
    prior: 0.12,
    range: [0, 0.5],
    weight: 0.6,
    description: "Jockey's win rate, last 30 days.",
  },
  {
    id: 'horse_racing_trainer_winrate_30d',
    sport: SPORT,
    scope: 'player',
    extract: (event, history) => {
      const v = history?.trainer?.winRate30d;
      if (!Number.isFinite(v)) return null;
      return Math.max(0, Math.min(0.5, v));
    },
    prior: 0.12,
    range: [0, 0.5],
    weight: 0.6,
    description: "Trainer's win rate, last 30 days.",
  },
  {
    id: 'horse_racing_jockey_trainer_combo_winrate',
    sport: SPORT,
    scope: 'player',
    extract: (event, history) => {
      const combo = history?.jockeyTrainerCombo;
      if (!combo || !Number.isFinite(combo.winRate)) return null;
      const runs = Number.isFinite(combo.runs) ? combo.runs : 0;
      // Shrink toward 0.12 baseline; only meaningful with sample size.
      const shrunk = bayesianShrink({
        observed: combo.winRate,
        prior: 0.12,
        n: runs,
        priorWeight: 8,
      });
      return Math.max(0, Math.min(0.5, shrunk));
    },
    prior: 0.12,
    range: [0, 0.5],
    weight: 0.5,
    description: "Combined jockey-trainer win rate when paired (Bayesian-shrunk to baseline).",
  },
  {
    id: 'horse_racing_post_position_bias',
    sport: SPORT,
    scope: 'player',
    extract: (event, history) => {
      const post = event?.postPosition;
      const trackId = event?.trackId;
      if (!post || !trackId) return null;
      const biasByPost = history?.postBiasByTrack?.[trackId];
      // Allow either a per-post object or a single number.
      let bias;
      if (typeof biasByPost === 'number') bias = biasByPost;
      else if (biasByPost && typeof biasByPost === 'object') bias = biasByPost[post];
      if (!Number.isFinite(bias)) return null;
      return Math.max(-0.10, Math.min(0.10, bias));
    },
    prior: 0,
    range: [-0.10, 0.10],
    weight: 0.5,
    description: 'Track-specific post-position win-rate delta (vs all posts at this track).',
  },
  {
    id: 'horse_racing_distance_suitability',
    sport: SPORT,
    scope: 'player',
    extract: (event, history) => suitabilityScore(history?.distanceRecord),
    prior: 0,
    range: [-2, 2],
    weight: 0.9,
    description: 'Composite suitability for the race distance, derived from the horse record at this distance band.',
  },
  {
    id: 'horse_racing_surface_suitability',
    sport: SPORT,
    scope: 'player',
    extract: (event, history) => suitabilityScore(history?.surfaceRecord),
    prior: 0,
    range: [-2, 2],
    weight: 0.8,
    description: 'Composite suitability for the surface (dirt / turf / synthetic).',
  },
  {
    id: 'horse_racing_going_suitability',
    sport: SPORT,
    scope: 'player',
    extract: (event, history) => suitabilityScore(history?.goingRecord),
    prior: 0,
    range: [-2, 2],
    weight: 0.6,
    description: 'Composite suitability for similar going (firm / good / yielding / soft / heavy).',
  },
  {
    id: 'horse_racing_pace_fit_score',
    sport: SPORT,
    scope: 'player',
    extract: (event, history) => paceFit(history?.runningStyle?.paceStyle, event?.paceProjection),
    prior: 0,
    range: [-1, 1],
    weight: 0.7,
    description: 'Running-style fit to projected pace: front-runners favour slow pace, closers favour fast pace.',
  },
  {
    id: 'horse_racing_weight_diff_field',
    sport: SPORT,
    scope: 'player',
    extract: (event, history) => {
      const w = history?.weight;
      if (!w || !Number.isFinite(w.pounds) || !Number.isFinite(w.fieldAvgPounds)) return null;
      const diff = w.pounds - w.fieldAvgPounds;
      // Sign: lighter than field average = negative diff = favourable.
      // We expose the raw diff; weight in Phase 4 handles the sign.
      return Math.max(-15, Math.min(15, diff));
    },
    prior: 0,
    range: [-15, 15],
    weight: 0.3,
    description: 'Pounds carried minus field-average pounds. Negative = lighter than field (favourable).',
  },
  {
    id: 'horse_racing_field_size',
    sport: SPORT,
    scope: 'event',
    extract: (event) => {
      const n = event?.fieldSize;
      if (!Number.isFinite(n) || n < 2) return null;
      return Math.max(2, Math.min(24, n));
    },
    prior: 10,
    range: [2, 24],
    weight: 0.2,
    description: 'Field size. Bigger fields make any single horse less likely to win (acts as a confidence dampener).',
  },
  {
    id: 'horse_racing_connections_strike_rate_track',
    sport: SPORT,
    scope: 'player',
    extract: (event, history) => {
      const v = history?.trainer?.strikeRateAtTrack;
      if (!Number.isFinite(v)) return null;
      return Math.max(0, Math.min(0.5, v));
    },
    prior: 0.10,
    range: [0, 0.5],
    weight: 0.4,
    description: "Trainer's strike rate at this specific track.",
  },
]);
