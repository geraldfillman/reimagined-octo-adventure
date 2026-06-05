import assert from 'node:assert/strict';

import {
  classifyReadinessForCadence,
} from '../system/cadence-runner.mjs';

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

await runTest('cadence readiness gate blocks BLOCKED live runs unless stale override is explicit', () => {
  const blocked = classifyReadinessForCadence({
    cadence: 'preclose',
    status: 'BLOCKED',
    items: [],
  }, {});

  assert.equal(blocked.blocked, true);
  assert.equal(blocked.reason, 'readiness-blocked');

  const overridden = classifyReadinessForCadence({
    cadence: 'preclose',
    status: 'BLOCKED',
    items: [],
  }, { 'allow-stale': true });

  assert.equal(overridden.blocked, false);
  assert.equal(overridden.override, true);
});

await runTest('cadence readiness gate allows WARN runs and marks midday WARN as policy-allowed', () => {
  const midday = classifyReadinessForCadence({
    cadence: 'midday',
    status: 'WARN',
    items: [],
  }, {});

  assert.equal(midday.blocked, false);
  assert.equal(midday.warning, true);
  assert.equal(midday.policyAllowedWarn, true);

  const preclose = classifyReadinessForCadence({
    cadence: 'preclose',
    status: 'WARN',
    items: [],
  }, {});

  assert.equal(preclose.blocked, false);
  assert.equal(preclose.warning, true);
  assert.equal(preclose.policyAllowedWarn, false);
});
