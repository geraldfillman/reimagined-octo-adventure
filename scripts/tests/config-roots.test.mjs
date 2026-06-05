import assert from 'node:assert/strict';
import { join, resolve } from 'node:path';

import {
  getEngineRoot,
  getReportsVaultRoot,
  getReviewVaultRoot,
  getWorldMachineRoot,
  resolveReportsPath,
  resolveReviewPath,
  toReportsRelative,
} from '../lib/config.mjs';

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

await runTest('reports root defaults to My_Data engine root', () => {
  const previousReportsRoot = process.env.REPORTS_VAULT_ROOT;
  const previousReviewRoot = process.env.REVIEW_VAULT_ROOT;

  try {
    delete process.env.REPORTS_VAULT_ROOT;
    delete process.env.REVIEW_VAULT_ROOT;

    assert.equal(getReportsVaultRoot(), getEngineRoot());
    assert.equal(getReviewVaultRoot(), getEngineRoot());
    assert.equal(resolveReportsPath('Reports', 'Daily'), join(getEngineRoot(), 'Reports', 'Daily'));
    assert.equal(resolveReviewPath('Reports', 'Daily'), join(getEngineRoot(), 'Reports', 'Daily'));
    assert.equal(toReportsRelative(join(getEngineRoot(), 'Reports', 'Daily')), 'Reports/Daily');
  } finally {
    restoreEnv('REPORTS_VAULT_ROOT', previousReportsRoot);
    restoreEnv('REVIEW_VAULT_ROOT', previousReviewRoot);
  }
});

await runTest('reports root override does not change World_Machine root', () => {
  const previousReportsRoot = process.env.REPORTS_VAULT_ROOT;
  const previousWorldRoot = process.env.WORLD_MACHINE_ROOT;
  const reportsRoot = resolve('C:/tmp/my-data-report-root-test');
  const worldRoot = resolve('C:/tmp/world-machine-root-test');

  try {
    process.env.REPORTS_VAULT_ROOT = reportsRoot;
    process.env.WORLD_MACHINE_ROOT = worldRoot;

    assert.equal(getReportsVaultRoot(), reportsRoot);
    assert.equal(getReviewVaultRoot(), reportsRoot);
    assert.equal(getWorldMachineRoot(), worldRoot);
  } finally {
    restoreEnv('REPORTS_VAULT_ROOT', previousReportsRoot);
    restoreEnv('WORLD_MACHINE_ROOT', previousWorldRoot);
  }
});

await runTest('legacy review root env no longer overrides reports root', () => {
  const previousReportsRoot = process.env.REPORTS_VAULT_ROOT;
  const previousReviewRoot = process.env.REVIEW_VAULT_ROOT;

  try {
    delete process.env.REPORTS_VAULT_ROOT;
    process.env.REVIEW_VAULT_ROOT = resolve('C:/tmp/legacy-world-machine-review-root');

    assert.equal(getReportsVaultRoot(), getEngineRoot());
    assert.equal(getReviewVaultRoot(), getEngineRoot());
  } finally {
    restoreEnv('REPORTS_VAULT_ROOT', previousReportsRoot);
    restoreEnv('REVIEW_VAULT_ROOT', previousReviewRoot);
  }
});

function restoreEnv(name, value) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}
