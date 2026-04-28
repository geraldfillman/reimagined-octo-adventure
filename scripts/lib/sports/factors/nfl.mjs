/**
 * nfl.mjs — Per-sport factor declarations for the NFL.
 *
 * Pure: no I/O. Each `extract` is defensive and returns null on missing data
 * rather than throwing. Numeric outputs aim to fall within the declared
 * `range` for the typical case; outliers are flagged downstream by the
 * registry's `withinRange` envelope rather than rejected.
 *
 * @typedef {Object} NflEvent
 * @property {boolean} [isHome]
 * @property {number}  [homeEpaPerPlay8w]      home offensive EPA/play, last 8 weeks
 * @property {number}  [awayEpaPerPlay8w]      away offensive EPA/play, last 8 weeks
 * @property {number}  [homeDvoaProxy]         home DVOA proxy (composite efficiency, season-to-date)
 * @property {number}  [awayDvoaProxy]         away DVOA proxy
 * @property {number}  [windSpeedMph]          wind speed in mph at kickoff
 * @property {boolean} [precipitation]         any precipitation expected (rain or snow)
 * @property {boolean} [isDome]                indoor/dome venue
 * @property {number}  [homeQbRestDays]        days since the home QB last started
 * @property {number}  [awayQbRestDays]        days since the away QB last started
 * @property {boolean} [isDivisional]          is this a divisional matchup
 * @property {number}  [openingTotalLine]      total line at open
 * @property {number}  [currentTotalLine]      current total line
 * @property {number}  [openingSpread]         opening spread (home perspective; negative = home favoured)
 * @property {number}  [currentSpread]         current spread (home perspective)
 *
 * @typedef {Object} NflHistory  reserved for Phase 3
 */

import { homeAdvantageBaseline } from './_common.mjs';

export const SPORT = 'nfl';

const NFL_HOME_BASELINE = homeAdvantageBaseline(SPORT).homeWinRate; // 0.56

function num(v) {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function clamp(v, lo, hi) {
  if (v === null) return null;
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v;
}

export const factors = Object.freeze([
  {
    id: 'nfl_home_indicator',
    sport: SPORT,
    scope: 'event',
    range: [0, 1],
    weight: 1.0,
    prior: NFL_HOME_BASELINE,
    description: 'Indicator (0/1) for whether team-of-interest is home; prior is NFL baseline.',
    extract: (event) => {
      if (!event || typeof event.isHome !== 'boolean') return null;
      return event.isHome ? 1 : 0;
    },
  },
  {
    id: 'nfl_epa_per_play_diff_8w',
    sport: SPORT,
    scope: 'team',
    range: [-0.4, 0.4],
    weight: 1.5,
    prior: 0,
    description: 'Home EPA/play minus away EPA/play, trailing 8 weeks.',
    extract: (event) => {
      const h = num(event && event.homeEpaPerPlay8w);
      const a = num(event && event.awayEpaPerPlay8w);
      if (h === null || a === null) return null;
      return h - a;
    },
  },
  {
    id: 'nfl_dvoa_proxy_diff',
    sport: SPORT,
    scope: 'team',
    range: [-30, 30],
    weight: 1.0,
    prior: 0,
    description: 'Home DVOA proxy minus away DVOA proxy.',
    extract: (event) => {
      const h = num(event && event.homeDvoaProxy);
      const a = num(event && event.awayDvoaProxy);
      if (h === null || a === null) return null;
      return h - a;
    },
  },
  {
    id: 'nfl_wind_speed_mph',
    sport: SPORT,
    scope: 'event',
    range: [0, 40],
    weight: 0.6,
    prior: 6,
    description: 'Wind speed at kickoff in mph; penalty kicks in above ~15 mph. Auto-zeroed in domes.',
    extract: (event) => {
      // Domes neutralise wind regardless of forecast.
      if (event && event.isDome === true) return 0;
      return num(event && event.windSpeedMph);
    },
  },
  {
    id: 'nfl_precipitation_indicator',
    sport: SPORT,
    scope: 'event',
    range: [0, 1],
    weight: 0.3,
    prior: 0,
    description: 'Indicator (0/1) for any precipitation expected at game time. Domes auto-zero.',
    extract: (event) => {
      if (!event) return null;
      if (event.isDome === true) return 0;
      if (typeof event.precipitation !== 'boolean') return null;
      return event.precipitation ? 1 : 0;
    },
  },
  {
    id: 'nfl_dome_indicator',
    sport: SPORT,
    scope: 'event',
    range: [0, 1],
    weight: 0.1,
    prior: 0,
    description: 'Indicator (0/1) for indoor/dome venue; neutralises weather factors.',
    extract: (event) => {
      if (!event || typeof event.isDome !== 'boolean') return null;
      return event.isDome ? 1 : 0;
    },
  },
  {
    id: 'nfl_qb_rest_diff_days',
    sport: SPORT,
    scope: 'team',
    range: [-7, 7],
    weight: 0.4,
    prior: 0,
    description: 'Home QB rest days minus away QB rest days.',
    extract: (event) => {
      const h = num(event && event.homeQbRestDays);
      const a = num(event && event.awayQbRestDays);
      if (h === null || a === null) return null;
      return clamp(h - a, -7, 7);
    },
  },
  {
    id: 'nfl_divisional_indicator',
    sport: SPORT,
    scope: 'event',
    range: [0, 1],
    weight: 0.2,
    prior: 0,
    description: 'Indicator (0/1) for divisional matchup; divisional games skew closer (acts on confidence).',
    extract: (event) => {
      if (!event || typeof event.isDivisional !== 'boolean') return null;
      return event.isDivisional ? 1 : 0;
    },
  },
  {
    id: 'nfl_line_movement_signal',
    sport: SPORT,
    scope: 'market',
    range: [-7, 7],
    weight: 0.5,
    prior: 0,
    description: 'Spread movement (opening minus current) from the home perspective; positive = market moved toward home.',
    extract: (event) => {
      const opening = num(event && event.openingSpread);
      const current = num(event && event.currentSpread);
      if (opening === null || current === null) return null;
      // Spread is home perspective: more negative means home is favoured harder.
      // opening - current is positive when current dropped (home favoured more).
      return clamp(opening - current, -7, 7);
    },
  },
]);
