/**
 * Cross-sport integration: combine all 12 per-sport factor modules into one
 * registry and exercise the full pipeline. Catches id collisions, registry
 * build errors, and any sport whose extract chain crashes on an empty event.
 */

import assert from 'node:assert/strict';
import { buildRegistry, extractAllForSport, SUPPORTED_SPORTS } from '../lib/sports/factor-registry.mjs';
import { factors as mlbFactors }     from '../lib/sports/factors/mlb.mjs';
import { factors as nbaFactors }     from '../lib/sports/factors/nba.mjs';
import { factors as nflFactors }     from '../lib/sports/factors/nfl.mjs';
import { factors as nhlFactors }     from '../lib/sports/factors/nhl.mjs';
import { factors as soccerFactors }  from '../lib/sports/factors/soccer.mjs';
import { factors as rugbyFactors }   from '../lib/sports/factors/rugby.mjs';
import { factors as tennisFactors }  from '../lib/sports/factors/tennis.mjs';
import { factors as golfFactors }    from '../lib/sports/factors/golf.mjs';
import { factors as cricketFactors } from '../lib/sports/factors/cricket.mjs';
import { factors as combatFactors }  from '../lib/sports/factors/combat.mjs';
import { factors as racingFactors }  from '../lib/sports/factors/racing.mjs';
import { factors as esportsFactors } from '../lib/sports/factors/esports.mjs';
import { factors as horseRacingFactors } from '../lib/sports/factors/horse-racing.mjs';

function runTest(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

const allModules = {
  mlb: mlbFactors, nba: nbaFactors, nfl: nflFactors, nhl: nhlFactors,
  soccer: soccerFactors, rugby: rugbyFactors, tennis: tennisFactors,
  golf: golfFactors, cricket: cricketFactors, combat: combatFactors,
  racing: racingFactors, esports: esportsFactors,
  horse_racing: horseRacingFactors,
};

const allFactors = Object.values(allModules).flat();

runTest('combined: every sport module exports a frozen non-empty factors array', () => {
  for (const [sport, factors] of Object.entries(allModules)) {
    assert.ok(Array.isArray(factors), `${sport}: factors not an array`);
    assert.ok(factors.length > 0, `${sport}: empty factors array`);
    assert.ok(Object.isFrozen(factors), `${sport}: factors not frozen`);
  }
});

runTest('combined: all 13 supported sports have a module', () => {
  const expected = ['mlb','nba','nfl','nhl','soccer','rugby','tennis','golf','cricket','combat','racing','esports','horse_racing'];
  for (const s of expected) {
    assert.ok(allModules[s], `missing module for ${s}`);
  }
  assert.equal(Object.keys(allModules).length, expected.length);
});

runTest('combined: every factor declares a sport in SUPPORTED_SPORTS', () => {
  for (const f of allFactors) {
    assert.ok(SUPPORTED_SPORTS.includes(f.sport), `${f.id}: sport ${f.sport} not in SUPPORTED_SPORTS`);
  }
});

runTest('combined: factor ids are globally unique across all sports', () => {
  const ids = allFactors.map(f => f.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert.equal(dupes.length, 0, `duplicate ids: ${[...new Set(dupes)].join(', ')}`);
});

runTest('combined: every id starts with its sport key + underscore', () => {
  for (const f of allFactors) {
    assert.ok(f.id.startsWith(`${f.sport}_`),
      `id ${f.id} does not start with ${f.sport}_`);
  }
});

runTest('combined: buildRegistry succeeds with all 12 sports merged', () => {
  const registry = buildRegistry(allFactors);
  assert.equal(registry.factors.length, allFactors.length);
  for (const sport of Object.keys(allModules)) {
    const subset = registry.bySport(sport);
    assert.equal(subset.length, allModules[sport].length,
      `bySport(${sport}) returned wrong size`);
  }
});

runTest('combined: every extract is defensive on empty event {} (no throws, returns null or numeric)', () => {
  const registry = buildRegistry(allFactors);
  for (const sport of Object.keys(allModules)) {
    const extractions = extractAllForSport(registry, sport, {}, {});
    assert.equal(extractions.length, allModules[sport].length, `${sport}: missing extractions`);
    for (const e of extractions) {
      assert.ok(
        e.value === null || (typeof e.value === 'number' && Number.isFinite(e.value)),
        `${sport}/${e.id}: non-null non-numeric value: ${e.value}`,
      );
      assert.ok(!e.error, `${sport}/${e.id}: threw on empty event: ${e.error}`);
    }
  }
});

runTest('combined: registry size & per-sport coverage report', () => {
  const registry = buildRegistry(allFactors);
  const sizes = Object.fromEntries(
    Object.keys(allModules).map(s => [s, registry.bySport(s).length])
  );
  console.log('       per-sport factor counts:', JSON.stringify(sizes));
  console.log('       total factors:', registry.factors.length);
  assert.ok(registry.factors.length >= 100, `expected >=100 total factors, got ${registry.factors.length}`);
});
