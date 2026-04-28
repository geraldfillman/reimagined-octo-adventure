/**
 * mlb.mjs — Per-sport factor declarations for Major League Baseball.
 *
 * Pure: no I/O. Each `extract` is defensive and returns null on missing data
 * rather than throwing. Numeric outputs aim to fall within the declared
 * `range` for the typical case; outliers are flagged downstream by the
 * registry's `withinRange` envelope rather than rejected.
 *
 * Factor IDs are snake_case and sport-prefixed (`mlb_*`). Weights are
 * hand-tuned defaults — Phase 4 will refit from data.
 *
 * @typedef {Object} MlbEvent
 * @property {boolean} [isHome]                    whether team-of-interest is home
 * @property {number}  [homeStarterEra30d]         home starter ERA last 30 days
 * @property {number}  [awayStarterEra30d]         away starter ERA last 30 days
 * @property {number}  [homeStarterFip30d]         home starter FIP last 30 days
 * @property {number}  [awayStarterFip30d]         away starter FIP last 30 days
 * @property {number}  [homeLineupWoba30d]         home lineup wOBA last 30 days
 * @property {number}  [awayLineupWoba30d]         away lineup wOBA last 30 days
 * @property {number}  [parkFactorRuns]            run park factor (1.0 = neutral)
 * @property {number}  [windSpeedMph]              wind speed in mph (raw)
 * @property {number}  [windOutfieldComponent]     [-1..1] cosine alignment with outfield
 * @property {number}  [temperatureF]              ambient temperature, Fahrenheit
 * @property {number}  [homeRestDays]              home team rest days
 * @property {number}  [awayRestDays]              away team rest days
 * @property {number}  [homeBullpenHighLevUsedYday]    fraction (0..1) high-leverage relievers used yesterday
 * @property {number}  [awayBullpenHighLevUsedYday]    fraction (0..1) high-leverage relievers used yesterday
 * @property {number}  [homeTravelKm]              km travelled to reach this venue
 * @property {number}  [awayTravelKm]              km travelled to reach this venue
 *
 * @typedef {Object} MlbHistory  reserved for Phase 3 (rolling history caches)
 */

import { homeAdvantageBaseline } from './_common.mjs';

export const SPORT = 'mlb';

const MLB_HOME_BASELINE = homeAdvantageBaseline(SPORT).homeWinRate; // 0.54

/** Safe finite-number guard. */
function num(v) {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/** Outfield-direction-adjusted wind: speed * max(0, outfield-component). */
function outfieldWind(event) {
  const speed = num(event && event.windSpeedMph);
  if (speed === null) return null;
  const cosine = num(event && event.windOutfieldComponent);
  // If we have no outfield-direction info, treat raw speed as the proxy.
  if (cosine === null) return speed;
  // Negative cosine means wind is blowing in toward the plate; clamp to 0.
  const aligned = Math.max(0, cosine);
  return speed * aligned;
}

export const factors = Object.freeze([
  {
    id: 'mlb_home_indicator',
    sport: SPORT,
    scope: 'event',
    range: [0, 1],
    weight: 0.6,
    prior: MLB_HOME_BASELINE,
    description: 'Indicator (0/1) for whether team-of-interest is home; prior is MLB league baseline.',
    extract: (event) => {
      if (!event || typeof event.isHome !== 'boolean') return null;
      return event.isHome ? 1 : 0;
    },
  },
  {
    id: 'mlb_starter_era_diff_30d',
    sport: SPORT,
    scope: 'team',
    range: [-3, 3],
    weight: 1.2,
    prior: 0,
    description: 'Away starter ERA minus home starter ERA over the last 30 days. Positive favours home (lower ERA is better).',
    extract: (event) => {
      const home = num(event && event.homeStarterEra30d);
      const away = num(event && event.awayStarterEra30d);
      if (home === null || away === null) return null;
      return away - home;
    },
  },
  {
    id: 'mlb_starter_fip_diff_30d',
    sport: SPORT,
    scope: 'team',
    range: [-3, 3],
    weight: 1.0,
    prior: 0,
    description: 'Away starter FIP minus home starter FIP over the last 30 days. Sign-flipped so positive favours home.',
    extract: (event) => {
      const home = num(event && event.homeStarterFip30d);
      const away = num(event && event.awayStarterFip30d);
      if (home === null || away === null) return null;
      return away - home;
    },
  },
  {
    id: 'mlb_lineup_woba_diff_30d',
    sport: SPORT,
    scope: 'team',
    range: [-0.05, 0.05],
    weight: 0.8,
    prior: 0,
    description: 'Home lineup wOBA minus away lineup wOBA over the last 30 days.',
    extract: (event) => {
      const home = num(event && event.homeLineupWoba30d);
      const away = num(event && event.awayLineupWoba30d);
      if (home === null || away === null) return null;
      return home - away;
    },
  },
  {
    id: 'mlb_park_factor_runs',
    sport: SPORT,
    scope: 'event',
    range: [0.85, 1.15],
    weight: 0.3,
    prior: 1.0,
    description: 'Park factor for runs (1.0 = neutral). >1 = hitter-friendly venue.',
    extract: (event) => num(event && event.parkFactorRuns),
  },
  {
    id: 'mlb_wind_speed_oof',
    sport: SPORT,
    scope: 'event',
    range: [0, 40],
    weight: 0.2,
    prior: 6,
    description: 'Outfield-direction-adjusted wind speed in mph (>15 mph is meaningful for HR rates).',
    extract: outfieldWind,
  },
  {
    id: 'mlb_temperature_f',
    sport: SPORT,
    scope: 'event',
    range: [30, 110],
    weight: 0.1,
    prior: 70,
    description: 'Ambient game-time temperature in Fahrenheit; warmer air boosts ball flight.',
    extract: (event) => num(event && event.temperatureF),
  },
  {
    id: 'mlb_rest_diff_days',
    sport: SPORT,
    scope: 'team',
    range: [-3, 3],
    weight: 0.2,
    prior: 0,
    description: 'Home rest days minus away rest days.',
    extract: (event) => {
      const h = num(event && event.homeRestDays);
      const a = num(event && event.awayRestDays);
      if (h === null || a === null) return null;
      return h - a;
    },
  },
  {
    id: 'mlb_bullpen_fatigue_diff',
    sport: SPORT,
    scope: 'team',
    range: [-1, 1],
    weight: 0.4,
    prior: 0,
    description: 'Away high-leverage reliever-usage rate yesterday minus home rate. Positive = fresher home bullpen.',
    extract: (event) => {
      const h = num(event && event.homeBullpenHighLevUsedYday);
      const a = num(event && event.awayBullpenHighLevUsedYday);
      if (h === null || a === null) return null;
      return a - h;
    },
  },
  {
    id: 'mlb_travel_diff_km',
    sport: SPORT,
    scope: 'team',
    range: [-5000, 5000],
    weight: 0.15,
    prior: 0,
    description: 'Away travel km minus home travel km. Positive = away team travelled further.',
    extract: (event) => {
      const h = num(event && event.homeTravelKm);
      const a = num(event && event.awayTravelKm);
      if (h === null || a === null) return null;
      return a - h;
    },
  },
]);
