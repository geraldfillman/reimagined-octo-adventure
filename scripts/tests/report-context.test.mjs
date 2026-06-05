import assert from 'node:assert/strict';
import {
  buildCadenceChecklist,
  loadMechanismMap,
  loadStrategyCatalog,
  selectMechanismsForCadence,
  strategyRowsForRegister,
} from '../lib/report-context.mjs';

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

runTest('loads mechanism and strategy catalogs', () => {
  const mechanisms = loadMechanismMap();
  const strategies = loadStrategyCatalog();
  assert.equal(mechanisms.length, 32);
  assert.equal(strategies.length, 20);
  assert.ok(mechanisms.some(item => item.id === 'vol_control_deleveraging'));
  assert.ok(strategies.some(item => item.id === 'quality_compounders'));
});

runTest('formats strategy register rows from strategy catalog', () => {
  const rows = strategyRowsForRegister({ limit: 3 });
  assert.equal(rows.length, 3);
  assert.ok(rows.every(row => row.length === 5));
  assert.match(rows[0][0], /Quality|Deep Value|GARP|Momentum|Low Vol|Hard Asset|PEAD|Insider|Credit|Relative|Tail|Volatility|Trend|Breadth|FOMC|Options|Short|Sector|Defensive|Dispersion/);
});

runTest('selects cadence-specific mechanisms', () => {
  const premarket = selectMechanismsForCadence('premarket', { limit: 8 });
  const preclose = selectMechanismsForCadence('preclose', { limit: 8 });
  assert.ok(premarket.length > 0);
  assert.ok(preclose.length > 0);
  assert.ok(preclose.some(item => item.category === 'microstructure' || item.tags.includes('options')));
});

runTest('builds cadence checklist rows', () => {
  const rows = buildCadenceChecklist('endofday');
  assert.ok(rows.some(row => row[0] === 'Volatility close'));
  assert.ok(rows.some(row => row[0] === 'COT / positioning'));
});
