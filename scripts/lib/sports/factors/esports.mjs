/**
 * esports.mjs - Per-sport factor declarations for esports (CS / LoL / Dota / Valorant).
 *
 * Pure / defensive / no I/O. Esports have stable home/away semantics only at LAN
 * events; for online matches the home/away convention is the bracket-side
 * mapping the caller provides.
 *
 * @typedef {Object} EsportsEvent
 * @property {string}  [matchDate]                  ISO date of match
 * @property {string}  [patchReleaseDate]           ISO date current patch dropped
 * @property {number}  [homeMapWinrate30d]          0..1
 * @property {number}  [awayMapWinrate30d]          0..1
 * @property {number}  [homeOverallWinrate30d]      0..1
 * @property {number}  [awayOverallWinrate30d]      0..1
 * @property {number}  [sidePickAdvantage]          in [-0.1, 0.1]; positive favours home
 * @property {boolean} [isLan]
 * @property {number}  [homeLanEdge]                in [-1,1]; positive = home stronger on LAN
 * @property {('home'|'away'|null)} [recentRosterChangeSide]
 * @property {number}  [h2hHomeWinrate12m]          0..1; home's win rate in direct H2H
 * @property {boolean} [isPlayoff]
 *
 * @typedef {Object} EsportsHistory
 */

import { restDays, travelDistance, homeAdvantageBaseline, bayesianShrink } from './_common.mjs';

export const SPORT = 'esports';

const _ha = homeAdvantageBaseline('esports');
const _shrunk = bayesianShrink({ observed: _ha.homeWinRate, prior: 0.5, n: 0 });
void restDays; void travelDistance; void _shrunk;

const PATCH_STABLE_DAYS = 14;

/** @type {ReadonlyArray<import('../factor-registry.mjs').FactorDeclaration>} */
export const factors = Object.freeze([
  {
    id: 'esports_patch_stable_indicator',
    sport: 'esports',
    scope: 'event',
    extract: (e) => {
      if (!e) return null;
      if (!e.matchDate || !e.patchReleaseDate) return null;
      try {
        const days = restDays(e.patchReleaseDate, e.matchDate);
        if (!Number.isFinite(days)) return null;
        return days >= PATCH_STABLE_DAYS ? 1 : 0;
      } catch {
        return null;
      }
    },
    prior: 1,
    range: [0, 1],
    weight: 0.3,
    description: 'Patch stable for >=14 days (meta has settled).',
  },
  {
    id: 'esports_map_winrate_diff_30d',
    sport: 'esports',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.homeMapWinrate30d) || !Number.isFinite(e.awayMapWinrate30d)) return null;
      const diff = e.homeMapWinrate30d - e.awayMapWinrate30d;
      return Math.max(-0.4, Math.min(0.4, diff));
    },
    prior: 0,
    range: [-0.4, 0.4],
    weight: 1.4,
    description: 'Current-map winrate diff over last 30 days (home minus away).',
  },
  {
    id: 'esports_overall_winrate_diff_30d',
    sport: 'esports',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.homeOverallWinrate30d) || !Number.isFinite(e.awayOverallWinrate30d)) return null;
      const diff = e.homeOverallWinrate30d - e.awayOverallWinrate30d;
      return Math.max(-0.4, Math.min(0.4, diff));
    },
    prior: 0,
    range: [-0.4, 0.4],
    weight: 0.8,
    description: 'Overall winrate diff over last 30 days (home minus away).',
  },
  {
    id: 'esports_side_pick_advantage',
    sport: 'esports',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.sidePickAdvantage)) return null;
      return Math.max(-0.1, Math.min(0.1, e.sidePickAdvantage));
    },
    prior: 0,
    range: [-0.1, 0.1],
    weight: 0.4,
    description: 'Side-pick advantage (when sides are predetermined).',
  },
  {
    id: 'esports_lan_vs_online_indicator',
    sport: 'esports',
    scope: 'event',
    extract: (e) => {
      if (!e) return null;
      if (typeof e.isLan !== 'boolean') return null;
      if (!e.isLan) return 0;
      // LAN: shift toward team with stronger LAN history
      if (!Number.isFinite(e.homeLanEdge)) return 0;
      return Math.max(-1, Math.min(1, e.homeLanEdge));
    },
    prior: 0,
    range: [-1, 1],
    weight: 0.3,
    description: 'LAN-vs-online: shifts advantage to teams with strong LAN history.',
  },
  {
    id: 'esports_recent_roster_change_indicator',
    sport: 'esports',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      // null/undefined = no change (treat as missing? caller-controlled).
      if (e.recentRosterChangeSide === null || e.recentRosterChangeSide === undefined) return null;
      const s = String(e.recentRosterChangeSide).toLowerCase();
      if (s === 'home') return -1;  // home roster change hurts home
      if (s === 'away') return 1;   // away roster change favours home
      if (s === 'none') return 0;
      return null;
    },
    prior: 0,
    range: [-1, 1],
    weight: 0.4,
    description: 'Roster change in last 30d (+1 away changed, -1 home changed).',
  },
  {
    id: 'esports_h2h_winrate_diff',
    sport: 'esports',
    scope: 'team',
    extract: (e) => {
      if (!e) return null;
      if (!Number.isFinite(e.h2hHomeWinrate12m)) return null;
      // map 0..1 to -0.5..+0.5 (centered on parity)
      const v = e.h2hHomeWinrate12m - 0.5;
      return Math.max(-0.5, Math.min(0.5, v));
    },
    prior: 0,
    range: [-0.5, 0.5],
    weight: 0.4,
    description: 'Direct head-to-head winrate diff over last 12 months (centered).',
  },
  {
    id: 'esports_event_stage_indicator',
    sport: 'esports',
    scope: 'event',
    extract: (e) => {
      if (!e || typeof e.isPlayoff !== 'boolean') return null;
      return e.isPlayoff ? 1 : 0;
    },
    prior: 0,
    range: [0, 1],
    weight: 0.1,
    description: 'Playoff/elimination flag (info; tighter outcomes).',
  },
]);
