/**
 * rugby.mjs - Per-sport factor declarations for rugby union (15s).
 *
 * Tuned for Premiership / URC / Top 14 / Six Nations style rugby — NOT 7s.
 * Pure: every `extract` is defensive and returns null when required data is
 * missing. No I/O, no mutation. _common primitives wired for restDays / travel
 * / shrinkage when callers want them.
 *
 * @typedef {Object} RugbyEvent
 * @property {boolean} [isHome]
 * @property {number}  [homeTryRatePer80]
 * @property {number}  [awayTryRatePer80]
 * @property {number}  [homeLineoutRetentionPct]   own-lineout success ratio (0..1)
 * @property {number}  [awayLineoutRetentionPct]
 * @property {number}  [homeScrumPenaltiesWon]
 * @property {number}  [homeScrumPenaltiesConceded]
 * @property {number}  [awayScrumPenaltiesWon]
 * @property {number}  [awayScrumPenaltiesConceded]
 * @property {number}  [homeMetresPerCarry]
 * @property {number}  [awayMetresPerCarry]
 * @property {number}  [homeCardRate]              cards (yellow+red) per match
 * @property {number}  [awayCardRate]
 * @property {number}  [refereeMeanCardsPerMatch]
 * @property {boolean} [isRaining]
 * @property {{lat:number,lon:number}} [homeVenueCoords]
 * @property {{lat:number,lon:number}} [awayHomeCoords]
 * @property {('north'|'south')} [homeHemisphere]
 * @property {('north'|'south')} [awayHemisphere]
 * @property {number}  [homeSetPieceDominance]     composite score in [-1,1]
 * @property {number}  [awaySetPieceDominance]
 *
 * @typedef {Object} RugbyHistory
 */

import { restDays, travelDistance, homeAdvantageBaseline, bayesianShrink } from './_common.mjs';

export const SPORT = 'rugby';

// keep _common imports live so consumers can rely on the rugby module re-exporting them
const _ha = homeAdvantageBaseline('rugby');
const _shrunk = bayesianShrink({ observed: _ha.homeWinRate, prior: 0.59, n: 0 });
void restDays; void _shrunk;

/** @type {ReadonlyArray<import('../factor-registry.mjs').FactorDeclaration>} */
export const factors = Object.freeze([
  {
    id: 'rugby_home_indicator',
    sport: 'rugby',
    scope: 'event',
    extract: (e) => {
      if (!e || typeof e.isHome !== 'boolean') return null;
      return e.isHome ? 1 : 0;
    },
    prior: 0.59,
    range: [0, 1],
    weight: 0.7,
    description: 'Home indicator. Rugby has the largest home edge of major team sports.',
  },
  {
    id: 'rugby_try_rate_per_80_diff',
    sport: 'rugby',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.homeTryRatePer80) || !Number.isFinite(e.awayTryRatePer80)) return null;
      const diff = e.homeTryRatePer80 - e.awayTryRatePer80;
      return Math.max(-3, Math.min(3, diff));
    },
    prior: 0,
    range: [-3, 3],
    weight: 1.2,
    description: 'Home try rate per 80min minus away try rate per 80min.',
  },
  {
    id: 'rugby_lineout_pct_diff',
    sport: 'rugby',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.homeLineoutRetentionPct) || !Number.isFinite(e.awayLineoutRetentionPct)) return null;
      const diff = e.homeLineoutRetentionPct - e.awayLineoutRetentionPct;
      return Math.max(-0.3, Math.min(0.3, diff));
    },
    prior: 0,
    range: [-0.3, 0.3],
    weight: 0.7,
    description: 'Own-lineout retention ratio diff (home minus away). Set-piece dominance.',
  },
  {
    id: 'rugby_scrum_penalty_diff',
    sport: 'rugby',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      const haveHome = Number.isFinite(e.homeScrumPenaltiesWon) && Number.isFinite(e.homeScrumPenaltiesConceded);
      const haveAway = Number.isFinite(e.awayScrumPenaltiesWon) && Number.isFinite(e.awayScrumPenaltiesConceded);
      if (!haveHome || !haveAway) return null;
      const homeNet = e.homeScrumPenaltiesWon - e.homeScrumPenaltiesConceded;
      const awayNet = e.awayScrumPenaltiesWon - e.awayScrumPenaltiesConceded;
      const diff = homeNet - awayNet;
      return Math.max(-5, Math.min(5, diff));
    },
    prior: 0,
    range: [-5, 5],
    weight: 0.6,
    description: 'Scrum penalties net (won minus conceded), home minus away.',
  },
  {
    id: 'rugby_metres_per_carry_diff',
    sport: 'rugby',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.homeMetresPerCarry) || !Number.isFinite(e.awayMetresPerCarry)) return null;
      const diff = e.homeMetresPerCarry - e.awayMetresPerCarry;
      return Math.max(-3, Math.min(3, diff));
    },
    prior: 0,
    range: [-3, 3],
    weight: 0.8,
    description: 'Metres-per-carry differential (home gain-line dominance).',
  },
  {
    id: 'rugby_discipline_card_rate_diff',
    sport: 'rugby',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.homeCardRate) || !Number.isFinite(e.awayCardRate)) return null;
      // sign convention per spec: away minus home → positive favours home (away has more cards)
      const diff = e.awayCardRate - e.homeCardRate;
      return Math.max(-2, Math.min(2, diff));
    },
    prior: 0,
    range: [-2, 2],
    weight: 0.5,
    description: 'Yellow+red card rate (away minus home, positive favours home).',
  },
  {
    id: 'rugby_referee_card_profile',
    sport: 'rugby',
    scope: 'event',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.refereeMeanCardsPerMatch)) return null;
      return Math.max(0, Math.min(5, e.refereeMeanCardsPerMatch));
    },
    prior: 1.5,
    range: [0, 5],
    weight: 0.2,
    description: 'Referee profile: high mean cards/match → variance, more upset risk.',
  },
  {
    id: 'rugby_weather_rain_indicator',
    sport: 'rugby',
    scope: 'event',
    extract: (e) => {
      if (!e || typeof e.isRaining !== 'boolean') return null;
      return e.isRaining ? 1 : 0;
    },
    prior: 0,
    range: [0, 1],
    weight: 0.3,
    description: 'Rain indicator (baseline; favours pack-heavy sides downstream).',
  },
  {
    id: 'rugby_travel_diff_km',
    sport: 'rugby',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      if (!e.homeVenueCoords || !e.awayHomeCoords) return null;
      try {
        const awayTravel = travelDistance(e.awayHomeCoords, e.homeVenueCoords);
        const diff = awayTravel - 0;
        return Math.max(-15000, Math.min(15000, diff));
      } catch {
        return null;
      }
    },
    prior: 0,
    range: [-15000, 15000],
    weight: 0.3,
    description: 'Away travel km minus home travel km (positive favours home).',
  },
  {
    id: 'rugby_hemisphere_bias',
    sport: 'rugby',
    scope: 'event',
    extract: (e) => {
      if (!e || !e.homeHemisphere || !e.awayHemisphere) return null;
      const h = String(e.homeHemisphere).toLowerCase();
      const a = String(e.awayHemisphere).toLowerCase();
      if (h !== 'north' && h !== 'south') return null;
      if (a !== 'north' && a !== 'south') return null;
      if (h === a) return 0;
      // Northern host vs Southern visitor → +1 (home advantage compounded by travel/hemisphere)
      return h === 'north' ? 1 : -1;
    },
    prior: 0,
    range: [-1, 1],
    weight: 0.2,
    description: 'Northern host vs Southern visitor (and vice versa) — hemisphere bias.',
  },
  {
    id: 'rugby_set_piece_dominance_diff',
    sport: 'rugby',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.homeSetPieceDominance) || !Number.isFinite(e.awaySetPieceDominance)) return null;
      const diff = e.homeSetPieceDominance - e.awaySetPieceDominance;
      return Math.max(-1, Math.min(1, diff));
    },
    prior: 0,
    range: [-1, 1],
    weight: 0.5,
    description: 'Composite set-piece (lineout+scrum) dominance differential.',
  },
]);
