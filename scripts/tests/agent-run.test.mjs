import assert from 'node:assert/strict';

import {
  getPullersForAgent,
  resolvePullerFlags,
  shouldEmitInteractionsBeforePuller,
} from '../pullers/agent-run.mjs';

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

runTest('adds required default flags for orchestrated pullers', () => {
  assert.equal(resolvePullerFlags('fda', {}, { id: 'biotech' })['recent-approvals'], true);
  assert.equal(resolvePullerFlags('openfema', {}, { id: 'government' }).recent, true);
  assert.equal(resolvePullerFlags('federalregister', {}, { id: 'government' })['faa-uas'], true);
  assert.equal(resolvePullerFlags('nahb', {}, { id: 'housing' })['builder-confidence'], true);
});

runTest('does not override explicit puller mode flags', () => {
  const flags = resolvePullerFlags('fda', { 'recent-approvals': false, json: true }, { id: 'biotech' });
  assert.equal(flags['recent-approvals'], false);
  assert.equal(flags.json, true);
});

runTest('passes include-interactions to streamline-report during interaction runs', () => {
  const flags = resolvePullerFlags('streamline-report', { interactions: true, ledger_run_id: 'run-1' }, { id: 'orchestrator' });
  assert.equal(flags['include-interactions'], true);
  assert.equal(flags.ledger_run_id, 'run-1');
});

runTest('emits interaction threads before streamline-report only when requested', () => {
  assert.equal(shouldEmitInteractionsBeforePuller('streamline-report', true), true);
  assert.equal(shouldEmitInteractionsBeforePuller('confluence-scan', true), false);
  assert.equal(shouldEmitInteractionsBeforePuller('streamline-report', false), false);
});

runTest('uses full puller list for non-daily cadences even when daily pullers are configured', () => {
  const agent = {
    id: 'positioning',
    pullers: ['positioning-report'],
    daily_pullers: [],
  };

  assert.deepEqual(getPullersForAgent(agent, 'daily'), []);
  assert.deepEqual(getPullersForAgent(agent, 'weekly'), ['positioning-report']);
});
