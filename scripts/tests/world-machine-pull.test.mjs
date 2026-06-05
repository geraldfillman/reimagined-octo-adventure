import assert from 'node:assert/strict';

import {
  DEFAULT_REVIEW_TARGETS,
  run,
} from '../bridge/world-machine-pull.mjs';

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

function createSteps(readinessStatus = 'READY') {
  const calls = [];
  const steps = {
    async readiness({ cadence }) {
      calls.push(['readiness', cadence]);
      return { cadence, status: readinessStatus, items: [] };
    },
    async sourceRefresh({ cadence, dryRun }) {
      calls.push(['sourceRefresh', cadence, dryRun]);
      return { artifacts: ['My_Data/05_Data_Pulls'] };
    },
    async reviewCadence({ cadence, dryRun }) {
      calls.push(['reviewCadence', cadence, dryRun]);
      return { artifacts: [`World_Machine/Reports/${cadence}`] };
    },
    async indicators({ dryRun }) {
      calls.push(['indicators', dryRun]);
      return { updated: ['Macro/Indicators/CPI.md'], skipped: [], errors: [] };
    },
    async packets({ dryRun }) {
      calls.push(['packets', dryRun]);
      return { written: ['World_Machine/_Inbox/World Machine Candidate Packets/example.md'] };
    },
    async sourceGap({ dryRun }) {
      calls.push(['sourceGap', dryRun]);
      return { path: 'World_Machine/Reports/Source Gap Register.md' };
    },
    async validate() {
      calls.push(['validate']);
      return {};
    },
  };
  return { calls, steps };
}

await runTest('safe default does not invoke raw source refresh', async () => {
  const { calls, steps } = createSteps();

  const result = await run({ dryRun: true }, { steps, write() {} });

  assert.equal(result.mode, 'review-only');
  assert.deepEqual(calls.map(call => call[0]), [
    'readiness',
    'reviewCadence',
    'indicators',
    'packets',
    'sourceGap',
    'validate',
  ]);
});

await runTest('full source refresh invokes source step only with explicit flag', async () => {
  const { calls, steps } = createSteps();

  const result = await run({ 'full-source-refresh': true, dryRun: true }, { steps, write() {} });

  assert.equal(result.mode, 'full-source-refresh');
  assert.deepEqual(calls.map(call => call[0]), [
    'readiness',
    'sourceRefresh',
    'reviewCadence',
    'indicators',
    'packets',
    'sourceGap',
    'validate',
  ]);
});

await runTest('blocked readiness stops without allow-stale', async () => {
  const { calls, steps } = createSteps('BLOCKED');

  await assert.rejects(
    () => run({ dryRun: true }, { steps, write() {} }),
    /readiness is BLOCKED/i
  );
  assert.deepEqual(calls.map(call => call[0]), ['readiness']);
});

await runTest('blocked readiness continues with allow-stale and records warning', async () => {
  const { calls, steps } = createSteps('BLOCKED');

  const result = await run({ dryRun: true, 'allow-stale': true }, { steps, write() {} });

  assert.equal(result.readiness.status, 'BLOCKED');
  assert.ok(result.warnings.some(line => /allow-stale/i.test(line)));
  assert.equal(calls.some(call => call[0] === 'reviewCadence'), true);
});

await runTest('default cadence is daily and review targets are present', async () => {
  const { calls, steps } = createSteps();

  const result = await run({}, { steps, write() {} });

  assert.equal(calls[0][1], 'daily');
  assert.deepEqual(result.reviewTargets, DEFAULT_REVIEW_TARGETS);
});
