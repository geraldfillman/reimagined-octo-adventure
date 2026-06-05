import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = resolve(TEST_DIR, '..', '..');
const METRIC_CADENCES_PATH = resolve(VAULT_ROOT, '99_System', 'config', 'neo4j-metric-cadences.json');
const REVIEW_CADENCES_PATH = resolve(VAULT_ROOT, '99_System', 'config', 'cadences.json');

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

runTest('neo4j metric cadences are manual-only BOD/EOD puller definitions', () => {
  const config = JSON.parse(readFileSync(METRIC_CADENCES_PATH, 'utf8'));
  const bod = config.cadences['neo4j-metrics-bod'];
  const eod = config.cadences['neo4j-metrics-eod'];

  assert.equal(bod.manual_only, true);
  assert.equal(eod.manual_only, true);
  assert.equal(bod.scheduled_allowed, false);
  assert.equal(eod.scheduled_allowed, false);
  assert.equal(bod.puller.name, 'neo4j-fmp-metric-snapshots');
  assert.equal(eod.puller.name, 'neo4j-fmp-metric-snapshots');
  assert.ok(bod.puller.args.includes('--cadence=bod'));
  assert.ok(eod.puller.args.includes('--cadence=eod'));
  assert.ok(bod.metrics.includes('price_premarket'));
  assert.ok(eod.metrics.includes('price_close'));
});

runTest('scheduled review cadences do not run raw neo4j metric acquisition', () => {
  const reviewConfig = JSON.parse(readFileSync(REVIEW_CADENCES_PATH, 'utf8'));
  const scheduledPullers = Object.values(reviewConfig.cadences)
    .flatMap(cadence => cadence.pullers ?? [])
    .map(puller => puller.name);

  assert.equal(scheduledPullers.includes('neo4j-fmp-metric-snapshots'), false);
});
