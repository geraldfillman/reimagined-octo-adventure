/**
 * cricket.mjs - Per-sport factor declarations for cricket (T20 / ODI / Test).
 *
 * Pure / defensive / no I/O. The format indicator is carried as a coverage
 * factor (weight=0) so downstream consumers can use it for context without it
 * leaking into the rule-based linear sum.
 *
 * @typedef {Object} CricketEvent
 * @property {('T20'|'ODI'|'Test')} [format]
 * @property {boolean} [isHome]
 * @property {number}  [homeBattingAvgFormat]   format-specific batting avg
 * @property {number}  [awayBattingAvgFormat]
 * @property {number}  [homeBowlingEconFormat]  lower is better
 * @property {number}  [awayBowlingEconFormat]
 * @property {number}  [homeBowlingStrikeRateFormat]
 * @property {number}  [awayBowlingStrikeRateFormat]
 * @property {('home'|'away'|null)} [tossWinner]
 * @property {number}  [groundAvgRuns]                venue mean innings runs
 * @property {number}  [pitchSeamIndex]               in [-1,1] (positive = seam-friendly)
 * @property {number}  [homeRecentForm5m]
 * @property {number}  [awayRecentForm5m]
 *
 * @typedef {Object} CricketHistory
 */

import { restDays, travelDistance, homeAdvantageBaseline, bayesianShrink } from './_common.mjs';

export const SPORT = 'cricket';

// _common wiring (kept live for tests / future enhancement).
const _ha = homeAdvantageBaseline('cricket');
const _shrunk = bayesianShrink({ observed: _ha.homeWinRate, prior: 0.55, n: 0 });
void restDays; void travelDistance; void _shrunk;

const FORMAT_VALUE = Object.freeze({ T20: 0, ODI: 1, Test: 2 });

/** @type {ReadonlyArray<import('../factor-registry.mjs').FactorDeclaration>} */
export const factors = Object.freeze([
  {
    id: 'cricket_format_indicator',
    sport: 'cricket',
    scope: 'event',
    extract: (e) => {
      if (!e || !e.format) return null;
      const v = FORMAT_VALUE[e.format];
      if (typeof v !== 'number') return null;
      return v;
    },
    prior: 1,
    range: [0, 2],
    weight: 0,
    description: 'Format indicator (0=T20, 1=ODI, 2=Test). Info only (weight=0).',
  },
  {
    id: 'cricket_home_indicator',
    sport: 'cricket',
    scope: 'event',
    extract: (e) => {
      if (!e || typeof e.isHome !== 'boolean') return null;
      return e.isHome ? 1 : 0;
    },
    prior: 0.55,
    range: [0, 1],
    weight: 0.6,
    description: 'Home indicator (cricket home edge ~0.55, lower than NBA/NFL).',
  },
  {
    id: 'cricket_batting_avg_diff_format',
    sport: 'cricket',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.homeBattingAvgFormat) || !Number.isFinite(e.awayBattingAvgFormat)) return null;
      const diff = e.homeBattingAvgFormat - e.awayBattingAvgFormat;
      return Math.max(-15, Math.min(15, diff));
    },
    prior: 0,
    range: [-15, 15],
    weight: 1.2,
    description: 'Format-specific batting avg, home minus away.',
  },
  {
    id: 'cricket_bowling_econ_diff_format',
    sport: 'cricket',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.homeBowlingEconFormat) || !Number.isFinite(e.awayBowlingEconFormat)) return null;
      // sign-flipped: lower econ is better, so positive (away_econ - home_econ) favours home
      const diff = e.awayBowlingEconFormat - e.homeBowlingEconFormat;
      return Math.max(-3, Math.min(3, diff));
    },
    prior: 0,
    range: [-3, 3],
    weight: 1.0,
    description: 'Bowling economy diff (sign-flipped, positive favours home).',
  },
  {
    id: 'cricket_bowling_strike_rate_diff_format',
    sport: 'cricket',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.homeBowlingStrikeRateFormat) || !Number.isFinite(e.awayBowlingStrikeRateFormat)) return null;
      // bowling strike rate: lower is better. sign-flip so positive helps home.
      const diff = e.awayBowlingStrikeRateFormat - e.homeBowlingStrikeRateFormat;
      return Math.max(-15, Math.min(15, diff));
    },
    prior: 0,
    range: [-15, 15],
    weight: 0.8,
    description: 'Bowling strike rate diff (sign-flipped; positive favours home).',
  },
  {
    id: 'cricket_toss_won_indicator',
    sport: 'cricket',
    scope: 'team',
    extract: (e) => {
      if (!e || !e.tossWinner) return null;
      const w = String(e.tossWinner).toLowerCase();
      if (w === 'home') return 1;
      if (w === 'away') return -1;
      return 0;
    },
    prior: 0,
    range: [-1, 1],
    weight: 0.3,
    description: 'Toss outcome (+1 home won, -1 away won, 0 neutral).',
  },
  {
    id: 'cricket_ground_avg_runs',
    sport: 'cricket',
    scope: 'event',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.groundAvgRuns)) return null;
      return Math.max(50, Math.min(400, e.groundAvgRuns));
    },
    prior: 250,
    range: [50, 400],
    weight: 0.2,
    description: 'Venue mean innings runs (high = batting-friendly).',
  },
  {
    id: 'cricket_pitch_type_seam_index',
    sport: 'cricket',
    scope: 'event',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.pitchSeamIndex)) return null;
      return Math.max(-1, Math.min(1, e.pitchSeamIndex));
    },
    prior: 0,
    range: [-1, 1],
    weight: 0.4,
    description: 'Pitch seam-friendliness in [-1,1]; positive favours bowling sides.',
  },
  {
    id: 'cricket_recent_form_diff_5m',
    sport: 'cricket',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.homeRecentForm5m) || !Number.isFinite(e.awayRecentForm5m)) return null;
      const diff = e.homeRecentForm5m - e.awayRecentForm5m;
      return Math.max(-2, Math.min(2, diff));
    },
    prior: 0,
    range: [-2, 2],
    weight: 0.7,
    description: 'Recent form differential over last 5 matches (home minus away).',
  },
]);
