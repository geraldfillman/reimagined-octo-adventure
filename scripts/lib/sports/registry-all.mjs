/**
 * registry-all.mjs — single import surface for the combined 13-sport factor
 * registry.
 *
 * Builds the combined registry exactly once at module load (ES module
 * top-level evaluation is cached by the runtime, so importers all share the
 * same frozen registry instance). Exposes:
 *
 *   - registry                     the combined factor registry
 *   - mapEspnSportToFactorKey(...) translates the ESPN-style sport keys used
 *                                  by the prediction puller (`'baseball'`,
 *                                  `'basketball'`, `'ice-hockey'`, ...) into
 *                                  the league keys the factor framework
 *                                  expects (`'mlb'`, `'nba'`, `'nhl'`, ...).
 *
 * Field-event sports (golf, motor racing, horse racing) are not currently
 * runnable through the home/away two-way scoring path used by Phase 3.
 * They intentionally return null from the mapper so the prediction puller
 * falls back to its market-consensus codepath until a future phase
 * introduces a Plackett-Luce / multi-runner step.
 */

import { buildRegistry, SUPPORTED_SPORTS } from './factor-registry.mjs';
import { factors as mlbFactors }         from './factors/mlb.mjs';
import { factors as nbaFactors }         from './factors/nba.mjs';
import { factors as nflFactors }         from './factors/nfl.mjs';
import { factors as nhlFactors }         from './factors/nhl.mjs';
import { factors as soccerFactors }      from './factors/soccer.mjs';
import { factors as rugbyFactors }       from './factors/rugby.mjs';
import { factors as tennisFactors }      from './factors/tennis.mjs';
import { factors as golfFactors }        from './factors/golf.mjs';
import { factors as cricketFactors }     from './factors/cricket.mjs';
import { factors as combatFactors }      from './factors/combat.mjs';
import { factors as racingFactors }      from './factors/racing.mjs';
import { factors as esportsFactors }     from './factors/esports.mjs';
import { factors as horseRacingFactors } from './factors/horse-racing.mjs';

/**
 * Frozen mapping from ESPN-style sport keys (as used in the prediction
 * puller's `SPORTS` const) to factor-framework league keys. Listed
 * explicitly so misspellings fail loudly. Field-event sports map to null
 * — see the note at the top of this file.
 */
export const ESPN_SPORT_TO_FACTOR_KEY = Object.freeze({
  // Two-way home/away markets — fully wired into Phase 3 multi-factor scoring.
  'baseball':       'mlb',
  'baseball-f5':    'mlb',
  'basketball':     'nba',
  'football':       'nfl',
  'ice-hockey':     'nhl',
  'soccer':         'soccer',
  'rugby':          'rugby',
  'tennis':         'tennis',
  'cricket':        'cricket',
  'combat':         'combat',
  'esports':        'esports',
  // Field events — multi-runner markets, no two-way home/away shape today.
  // TODO(Phase 4+): introduce a Plackett-Luce step and route these through it.
  'golf':           null,
  'racing':         null,
  'horse-racing':   null,
});

const allFactors = [
  ...mlbFactors,
  ...nbaFactors,
  ...nflFactors,
  ...nhlFactors,
  ...soccerFactors,
  ...rugbyFactors,
  ...tennisFactors,
  ...golfFactors,
  ...cricketFactors,
  ...combatFactors,
  ...racingFactors,
  ...esportsFactors,
  ...horseRacingFactors,
];

/**
 * The combined registry covering all 13 supported sports. Built once at
 * module load and shared across importers.
 */
export const registry = buildRegistry(allFactors);

/**
 * Translate the ESPN-style sport key (and optional league hint) used by
 * `sports-predictions.mjs` into the factor-framework's league key. Returns
 * null for any sport that isn't wired into the multi-factor home/away
 * scoring path; callers should treat null as "fall back to market
 * consensus".
 *
 * @param {string} sportKey - ESPN-style key from SPORTS const, e.g. 'baseball-f5'
 * @param {string} [league] - league hint (e.g. 'mlb'); used as last-resort fallback
 * @returns {string|null} factor-framework league key, or null if unsupported
 */
export function mapEspnSportToFactorKey(sportKey, league) {
  if (typeof sportKey === 'string' && Object.prototype.hasOwnProperty.call(ESPN_SPORT_TO_FACTOR_KEY, sportKey)) {
    return ESPN_SPORT_TO_FACTOR_KEY[sportKey];
  }
  // Last-resort: if a caller supplied a league that itself is a supported
  // factor sport key (e.g. someone added a new entry to SPORTS without
  // updating the table), accept it rather than silently failing.
  if (typeof league === 'string' && SUPPORTED_SPORTS.includes(league)) {
    return league;
  }
  return null;
}
