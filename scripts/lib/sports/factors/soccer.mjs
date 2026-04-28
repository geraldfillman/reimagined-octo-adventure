/**
 * soccer.mjs - Per-sport factor declarations for association football (soccer).
 *
 * Pure: every `extract` is a function of (event, history?) and returns either a
 * finite number or null. No I/O, no mutation. Defensive against missing fields.
 *
 * @typedef {Object} SoccerEvent
 * @property {boolean} [isHome]                 home flag for the "selection A" side
 * @property {number}  [homeXgRolling10]        home rolling xG-for over last 10 matches
 * @property {number}  [awayXgRolling10]        away rolling xG-for over last 10 matches
 * @property {number}  [homeXgAgainstRolling10] home rolling xG-against over last 10
 * @property {number}  [awayXgAgainstRolling10] away rolling xG-against over last 10
 * @property {number}  [homeFormHomeSplit]      home team's home-only form (PPG-style, last 10)
 * @property {number}  [awayFormAwaySplit]      away team's away-only form
 * @property {string}  [homeLastMatchDate]      ISO date of home team's previous match
 * @property {string}  [awayLastMatchDate]      ISO date of away team's previous match
 * @property {string}  [matchDate]              ISO date of this match
 * @property {number}  [refereeYellowCardRate]  referee mean yellow cards / match
 * @property {{lat:number,lon:number}} [homeVenueCoords]
 * @property {{lat:number,lon:number}} [awayHomeCoords]
 * @property {number}  [homeTier]               numeric divisional tier (1=top)
 * @property {number}  [awayTier]
 * @property {number}  [homeXiChanges]          # XI rotations vs previous match
 * @property {number}  [awayXiChanges]
 *
 * @typedef {Object} SoccerHistory
 * @property {object} [_unused] reserved for future per-team time series
 */

import { restDays, travelDistance, homeAdvantageBaseline, bayesianShrink } from './_common.mjs';

export const SPORT = 'soccer';

const _ha = homeAdvantageBaseline('soccer');
const _shrunk = bayesianShrink({ observed: _ha.homeWinRate, prior: 0.46, n: 0 });
void _shrunk; // demonstrate _common imports are wired without altering exported declarations

/** @type {ReadonlyArray<import('../factor-registry.mjs').FactorDeclaration>} */
export const factors = Object.freeze([
  {
    id: 'soccer_home_indicator',
    sport: 'soccer',
    scope: 'event',
    extract: (e) => {
      if (!e || typeof e !== 'object') return null;
      if (typeof e.isHome !== 'boolean') return null;
      return e.isHome ? 1 : 0;
    },
    prior: 0.46,
    range: [0, 1],
    weight: 0.7,
    description: 'Home indicator (home advantage smaller in soccer than US sports).',
  },
  {
    id: 'soccer_xg_diff_rolling_10',
    sport: 'soccer',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.homeXgRolling10) || !Number.isFinite(e.awayXgRolling10)) return null;
      return e.homeXgRolling10 - e.awayXgRolling10;
    },
    prior: 0,
    range: [-2, 2],
    weight: 1.4,
    description: 'Home rolling xG (last 10) minus away rolling xG (last 10).',
  },
  {
    id: 'soccer_xg_against_diff_rolling_10',
    sport: 'soccer',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.homeXgAgainstRolling10) || !Number.isFinite(e.awayXgAgainstRolling10)) return null;
      // sign-flipped: positive when home concedes less than away
      return e.awayXgAgainstRolling10 - e.homeXgAgainstRolling10;
    },
    prior: 0,
    range: [-2, 2],
    weight: 1.0,
    description: 'Away xGA - home xGA over last 10 (positive favours home).',
  },
  {
    id: 'soccer_home_form_split',
    sport: 'soccer',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.homeFormHomeSplit)) return null;
      return e.homeFormHomeSplit;
    },
    prior: 0,
    range: [-2, 2],
    weight: 0.6,
    description: 'Home team form when playing at home (last 10 home matches).',
  },
  {
    id: 'soccer_away_form_split',
    sport: 'soccer',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.awayFormAwaySplit)) return null;
      // sign-flipped so positive helps home
      return -e.awayFormAwaySplit;
    },
    prior: 0,
    range: [-2, 2],
    weight: 0.6,
    description: 'Away team form when on the road (sign-flipped so positive helps home).',
  },
  {
    id: 'soccer_congestion_diff_days',
    sport: 'soccer',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      if (!e.homeLastMatchDate || !e.awayLastMatchDate || !e.matchDate) return null;
      try {
        const homeRest = restDays(e.homeLastMatchDate, e.matchDate);
        const awayRest = restDays(e.awayLastMatchDate, e.matchDate);
        const diff = homeRest - awayRest;
        if (!Number.isFinite(diff)) return null;
        // clamp to declared range
        return Math.max(-4, Math.min(4, diff));
      } catch {
        return null;
      }
    },
    prior: 0,
    range: [-4, 4],
    weight: 0.5,
    description: 'Home rest days minus away rest days (<=4 days = congestion).',
  },
  {
    id: 'soccer_referee_yellow_card_rate',
    sport: 'soccer',
    scope: 'event',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.refereeYellowCardRate)) return null;
      return e.refereeYellowCardRate;
    },
    prior: 3.5,
    range: [1, 8],
    weight: 0.2,
    description: 'Referee mean yellow cards per match (proxies a physical match).',
  },
  {
    id: 'soccer_travel_diff_km',
    sport: 'soccer',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      const home = e.homeVenueCoords;
      const away = e.awayHomeCoords;
      if (!home || !away) return null;
      try {
        // home plays at home (zero travel); away travels from their home base.
        const awayTravel = travelDistance(away, home);
        // sign convention: positive when home travelled less than away (favours home)
        const diff = awayTravel - 0;
        return Math.max(-15000, Math.min(15000, diff));
      } catch {
        return null;
      }
    },
    prior: 0,
    range: [-15000, 15000],
    weight: 0.2,
    description: 'Travel km difference (away travel minus home travel).',
  },
  {
    id: 'soccer_league_quality_gap',
    sport: 'soccer',
    scope: 'event',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.homeTier) || !Number.isFinite(e.awayTier)) return null;
      // tier 1 is highest; if home tier is lower number, home is in a higher tier (positive).
      const gap = e.awayTier - e.homeTier;
      return Math.max(-3, Math.min(3, gap));
    },
    prior: 0,
    range: [-3, 3],
    weight: 0.3,
    description: 'Divisional gap; positive = home is in a higher tier than away.',
  },
  {
    id: 'soccer_starting_xi_change_diff',
    sport: 'soccer',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.homeXiChanges) || !Number.isFinite(e.awayXiChanges)) return null;
      // more rotation = less cohesion. positive favours home → away has more rotation
      const diff = e.awayXiChanges - e.homeXiChanges;
      return Math.max(-5, Math.min(5, diff));
    },
    prior: 0,
    range: [-5, 5],
    weight: 0.4,
    description: 'XI rotation count difference (away changes minus home changes).',
  },
]);
