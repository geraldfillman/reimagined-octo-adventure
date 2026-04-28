/**
 * nhl.mjs — Per-sport factor declarations for the NHL.
 *
 * Pure: no I/O. Each `extract` is defensive and returns null on missing data
 * rather than throwing. Numeric outputs aim to fall within the declared
 * `range` for the typical case; outliers are flagged downstream by the
 * registry's `withinRange` envelope rather than rejected.
 *
 * @typedef {Object} NhlEvent
 * @property {boolean} [isHome]
 * @property {number}  [homeCorsiForPct30d]            home CF% (5v5) last 30 days
 * @property {number}  [awayCorsiForPct30d]            away CF% (5v5) last 30 days
 * @property {number}  [homeFenwickForPct30d]          home FF% (5v5) last 30 days
 * @property {number}  [awayFenwickForPct30d]          away FF% (5v5) last 30 days
 * @property {number}  [homeGoalieSavePct10g]          home confirmed-starter SV% last 10 games
 * @property {number}  [awayGoalieSavePct10g]          away confirmed-starter SV% last 10 games
 * @property {boolean} [homeOnB2B]
 * @property {boolean} [awayOnB2B]
 * @property {number}  [homePowerPlayPct]              home PP% (percentage points, e.g. 22.5)
 * @property {number}  [awayPowerPlayPct]
 * @property {number}  [homePenaltyKillPct]            home PK%
 * @property {number}  [awayPenaltyKillPct]
 * @property {number}  [homeTravelKm]
 * @property {number}  [awayTravelKm]
 * @property {number}  [homeRestDays]
 * @property {number}  [awayRestDays]
 *
 * @typedef {Object} NhlHistory  reserved for Phase 3
 */

import { homeAdvantageBaseline } from './_common.mjs';

export const SPORT = 'nhl';

const NHL_HOME_BASELINE = homeAdvantageBaseline(SPORT).homeWinRate; // 0.55

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
    id: 'nhl_home_indicator',
    sport: SPORT,
    scope: 'event',
    range: [0, 1],
    weight: 0.5,
    prior: NHL_HOME_BASELINE,
    description: 'Indicator (0/1) for whether team-of-interest is home; prior is NHL baseline.',
    extract: (event) => {
      if (!event || typeof event.isHome !== 'boolean') return null;
      return event.isHome ? 1 : 0;
    },
  },
  {
    id: 'nhl_corsi_for_pct_diff_30d',
    sport: SPORT,
    scope: 'team',
    range: [-0.15, 0.15],
    weight: 1.2,
    prior: 0,
    description: 'Home CF% minus away CF% over the last 30 days (proxy for territorial play).',
    extract: (event) => {
      const h = num(event && event.homeCorsiForPct30d);
      const a = num(event && event.awayCorsiForPct30d);
      if (h === null || a === null) return null;
      return clamp(h - a, -0.15, 0.15);
    },
  },
  {
    id: 'nhl_fenwick_for_pct_diff_30d',
    sport: SPORT,
    scope: 'team',
    range: [-0.15, 0.15],
    weight: 1.0,
    prior: 0,
    description: 'Home FF% minus away FF% over the last 30 days (unblocked-shot share).',
    extract: (event) => {
      const h = num(event && event.homeFenwickForPct30d);
      const a = num(event && event.awayFenwickForPct30d);
      if (h === null || a === null) return null;
      return clamp(h - a, -0.15, 0.15);
    },
  },
  {
    id: 'nhl_goalie_save_pct_diff_10g',
    sport: SPORT,
    scope: 'team',
    range: [-0.05, 0.05],
    weight: 1.5,
    prior: 0,
    description: 'Confirmed starter SV% diff (home minus away) over the last 10 games.',
    extract: (event) => {
      const h = num(event && event.homeGoalieSavePct10g);
      const a = num(event && event.awayGoalieSavePct10g);
      if (h === null || a === null) return null;
      return clamp(h - a, -0.05, 0.05);
    },
  },
  {
    id: 'nhl_b2b_indicator',
    sport: SPORT,
    scope: 'team',
    range: [-1, 1],
    weight: 0.5,
    prior: 0,
    description: '+1 if away on B2B, -1 if home on B2B, 0 otherwise. Positive favours home.',
    extract: (event) => {
      const h = event && event.homeOnB2B;
      const a = event && event.awayOnB2B;
      if (typeof h !== 'boolean' && typeof a !== 'boolean') return null;
      const homeFlag = h === true ? 1 : 0;
      const awayFlag = a === true ? 1 : 0;
      return awayFlag - homeFlag;
    },
  },
  {
    id: 'nhl_special_teams_diff',
    sport: SPORT,
    scope: 'team',
    range: [-15, 15],
    weight: 0.6,
    prior: 0,
    description: '(home PP% + home PK%) minus (away PP% + away PK%). Net special-teams edge.',
    extract: (event) => {
      const hPP = num(event && event.homePowerPlayPct);
      const hPK = num(event && event.homePenaltyKillPct);
      const aPP = num(event && event.awayPowerPlayPct);
      const aPK = num(event && event.awayPenaltyKillPct);
      if (hPP === null || hPK === null || aPP === null || aPK === null) return null;
      return clamp((hPP + hPK) - (aPP + aPK), -15, 15);
    },
  },
  {
    id: 'nhl_travel_diff_km',
    sport: SPORT,
    scope: 'team',
    range: [-5000, 5000],
    weight: 0.2,
    prior: 0,
    description: 'Away travel km minus home travel km.',
    extract: (event) => {
      const h = num(event && event.homeTravelKm);
      const a = num(event && event.awayTravelKm);
      if (h === null || a === null) return null;
      return a - h;
    },
  },
  {
    id: 'nhl_rest_diff_days',
    sport: SPORT,
    scope: 'team',
    range: [-3, 3],
    weight: 0.3,
    prior: 0,
    description: 'Home rest days minus away rest days.',
    extract: (event) => {
      const h = num(event && event.homeRestDays);
      const a = num(event && event.awayRestDays);
      if (h === null || a === null) return null;
      return clamp(h - a, -3, 3);
    },
  },
]);
