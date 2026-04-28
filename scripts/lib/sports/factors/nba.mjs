/**
 * nba.mjs — Per-sport factor declarations for the NBA.
 *
 * Pure: no I/O. Each `extract` is defensive and returns null on missing data
 * rather than throwing. Numeric outputs aim to fall within the declared
 * `range` for the typical case; outliers are flagged downstream by the
 * registry's `withinRange` envelope rather than rejected.
 *
 * @typedef {Object} NbaEvent
 * @property {boolean} [isHome]
 * @property {number}  [homeNetRating30d]              home Net Rating last 30 days
 * @property {number}  [awayNetRating30d]              away Net Rating last 30 days
 * @property {number}  [homePace30d]                   home pace last 30 days
 * @property {number}  [awayPace30d]                   away pace last 30 days
 * @property {number}  [homeThreePtVar30d]             home 3pt% variance (stdev) last 30 days
 * @property {number}  [awayThreePtVar30d]             away 3pt% variance (stdev) last 30 days
 * @property {boolean} [homeOnB2B]                     home team is on a back-to-back
 * @property {boolean} [awayOnB2B]                     away team is on a back-to-back
 * @property {boolean} [homeOnThreeInFour]             home team is on 3 games in 4 nights
 * @property {boolean} [awayOnThreeInFour]             away team is on 3 games in 4 nights
 * @property {number}  [homeTravelKm]
 * @property {number}  [awayTravelKm]
 * @property {number}  [homeStarsAvailable]            count of star players (top-3 by usage) available for home
 * @property {number}  [awayStarsAvailable]            count of star players (top-3 by usage) available for away
 * @property {number}  [homeOffRating30d]              home offensive rating last 30 days
 * @property {number}  [awayOffRating30d]              away offensive rating last 30 days
 * @property {number}  [homeOppDefRatingAllowed30d]    def rating home team's opponents allowed (proxy for SOS)
 * @property {number}  [awayOppDefRatingAllowed30d]    def rating away team's opponents allowed (proxy for SOS)
 *
 * @typedef {Object} NbaHistory  reserved for Phase 3
 */

import { homeAdvantageBaseline } from './_common.mjs';

export const SPORT = 'nba';

const NBA_HOME_BASELINE = homeAdvantageBaseline(SPORT).homeWinRate; // 0.58

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
    id: 'nba_home_indicator',
    sport: SPORT,
    scope: 'event',
    range: [0, 1],
    weight: 0.6,
    prior: NBA_HOME_BASELINE,
    description: 'Indicator (0/1) for whether team-of-interest is home; prior is NBA league baseline.',
    extract: (event) => {
      if (!event || typeof event.isHome !== 'boolean') return null;
      return event.isHome ? 1 : 0;
    },
  },
  {
    id: 'nba_net_rating_diff_30d',
    sport: SPORT,
    scope: 'team',
    range: [-15, 15],
    weight: 1.5,
    prior: 0,
    description: 'Home Net Rating minus away Net Rating over the last 30 days.',
    extract: (event) => {
      const h = num(event && event.homeNetRating30d);
      const a = num(event && event.awayNetRating30d);
      if (h === null || a === null) return null;
      return h - a;
    },
  },
  {
    id: 'nba_pace_combined',
    sport: SPORT,
    scope: 'event',
    range: [85, 110],
    weight: 0.2,
    prior: 99,
    description: 'Average of both teams pace; high pace amplifies underlying edges.',
    extract: (event) => {
      const h = num(event && event.homePace30d);
      const a = num(event && event.awayPace30d);
      if (h === null || a === null) return null;
      return (h + a) / 2;
    },
  },
  {
    id: 'nba_three_point_variance',
    sport: SPORT,
    scope: 'event',
    range: [0, 0.1],
    weight: 0.3,
    prior: 0.04,
    description: 'Combined recent 3-point variance; high variance noisier outcomes (acts as confidence dampener).',
    extract: (event) => {
      const h = num(event && event.homeThreePtVar30d);
      const a = num(event && event.awayThreePtVar30d);
      if (h === null || a === null) return null;
      return (h + a) / 2;
    },
  },
  {
    id: 'nba_b2b_indicator',
    sport: SPORT,
    scope: 'team',
    range: [-1, 1],
    weight: 0.6,
    prior: 0,
    description: '+1 if away on B2B, -1 if home on B2B, 0 otherwise. Positive favours home.',
    extract: (event) => {
      const h = event && event.homeOnB2B;
      const a = event && event.awayOnB2B;
      if (typeof h !== 'boolean' && typeof a !== 'boolean') return null;
      const homeB2B = h === true ? 1 : 0;
      const awayB2B = a === true ? 1 : 0;
      return awayB2B - homeB2B;
    },
  },
  {
    id: 'nba_three_in_four_indicator',
    sport: SPORT,
    scope: 'team',
    range: [-1, 1],
    weight: 0.4,
    prior: 0,
    description: '+1 if away is on 3-in-4, -1 if home is on 3-in-4, 0 otherwise.',
    extract: (event) => {
      const h = event && event.homeOnThreeInFour;
      const a = event && event.awayOnThreeInFour;
      if (typeof h !== 'boolean' && typeof a !== 'boolean') return null;
      const homeFlag = h === true ? 1 : 0;
      const awayFlag = a === true ? 1 : 0;
      return awayFlag - homeFlag;
    },
  },
  {
    id: 'nba_travel_diff_km',
    sport: SPORT,
    scope: 'team',
    range: [-5000, 5000],
    weight: 0.2,
    prior: 0,
    description: 'Away travel km minus home travel km. Positive = away team travelled further.',
    extract: (event) => {
      const h = num(event && event.homeTravelKm);
      const a = num(event && event.awayTravelKm);
      if (h === null || a === null) return null;
      return a - h;
    },
  },
  {
    id: 'nba_key_player_availability_diff',
    sport: SPORT,
    scope: 'team',
    range: [-3, 3],
    weight: 1.0,
    prior: 0,
    description: 'Star players available: home count minus away count (top-3 by usage).',
    extract: (event) => {
      const h = num(event && event.homeStarsAvailable);
      const a = num(event && event.awayStarsAvailable);
      if (h === null || a === null) return null;
      return clamp(h - a, -3, 3);
    },
  },
  {
    id: 'nba_opp_def_rating_vs_home_off_30d',
    sport: SPORT,
    scope: 'team',
    range: [-15, 15],
    weight: 0.8,
    prior: 0,
    description: 'Strength-of-schedule-adjusted offensive edge: (home off vs away opp-def) minus (away off vs home opp-def).',
    extract: (event) => {
      const homeOff = num(event && event.homeOffRating30d);
      const awayOff = num(event && event.awayOffRating30d);
      const homeOppDef = num(event && event.homeOppDefRatingAllowed30d);
      const awayOppDef = num(event && event.awayOppDefRatingAllowed30d);
      if (homeOff === null || awayOff === null || homeOppDef === null || awayOppDef === null) {
        return null;
      }
      // Positive when home team's offensive edge against the average defence
      // they've faced exceeds the away team's same edge.
      const homeEdge = homeOff - awayOppDef;
      const awayEdge = awayOff - homeOppDef;
      return clamp(homeEdge - awayEdge, -15, 15);
    },
  },
]);
