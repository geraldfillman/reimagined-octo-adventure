import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { today } from '../lib/markdown.mjs';
import {
  getReviewVaultRoot,
  resolveReviewPath,
} from '../lib/config.mjs';
import { pull } from '../pullers/research-spine-flow.mjs';

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

await runTest('dry-run resolves premarket and preclose monitoring documents', async () => {
  const result = await pull({
    documents: 'premarket-monitoring,preclose-monitoring',
    'dry-run': true,
  });

  assert.deepEqual(result.documents, ['premarket-monitoring', 'preclose-monitoring']);
  assert.equal(result.dryRun, true);
});

await runTest('dry-run resolves strategy register document', async () => {
  const result = await pull({
    documents: 'strategy-register',
    'dry-run': true,
  });

  assert.deepEqual(result.documents, ['strategy-register']);
  assert.equal(result.dryRun, true);
});

await runTest('review vault compatibility root resolves to reports root', async () => {
  const previousReportsRoot = process.env.REPORTS_VAULT_ROOT;
  const previousReviewRoot = process.env.REVIEW_VAULT_ROOT;
  const tempRoot = mkdtempSync(join(tmpdir(), 'my-data-reports-'));

  try {
    process.env.REPORTS_VAULT_ROOT = tempRoot;
    delete process.env.REVIEW_VAULT_ROOT;

    assert.equal(getReviewVaultRoot(), tempRoot);
    assert.equal(resolveReviewPath('Reports', 'Daily'), join(tempRoot, 'Reports', 'Daily'));
  } finally {
    restoreEnv('REPORTS_VAULT_ROOT', previousReportsRoot);
    restoreEnv('REVIEW_VAULT_ROOT', previousReviewRoot);
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

await runTest('eod briefing links to the end-of-day monitoring snapshot', async () => {
  const previousRoot = process.env.REPORTS_VAULT_ROOT;
  const tempRoot = mkdtempSync(join(tmpdir(), 'research-spine-flow-'));

  try {
    process.env.REPORTS_VAULT_ROOT = tempRoot;

    const result = await pull({ documents: 'eod-briefing', 'stale-ok': true });
    assert.equal(result.documents.length, 1);
    assert.equal(result.documents[0], join(tempRoot, 'Reports', 'EOD', 'Briefings', `${today()} End Of Day Briefing.md`));

    const content = readFileSync(result.documents[0], 'utf-8');
    assert.match(content, new RegExp(`\\[\\[${today()} End Of Day Monitoring Snapshot\\]\\]`));
    assert.doesNotMatch(content, new RegExp(`\\[\\[${today()} Daily Monitoring Snapshot\\]\\]`));
  } finally {
    restoreEnv('REPORTS_VAULT_ROOT', previousRoot);
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

await runTest('monitoring snapshots include evidence confidence and trigger context', async () => {
  const previousRoot = process.env.REPORTS_VAULT_ROOT;
  const tempRoot = mkdtempSync(join(tmpdir(), 'research-spine-flow-'));

  try {
    process.env.REPORTS_VAULT_ROOT = tempRoot;

    const result = await pull({ documents: 'eod-monitoring', 'stale-ok': true });
    assert.equal(result.documents.length, 1);
    assert.equal(result.documents[0], join(tempRoot, 'Reports', 'EOD', 'Monitoring', `${today()} End Of Day Monitoring Snapshot.md`));

    const content = readFileSync(result.documents[0], 'utf-8');
    assert.match(content, /my-data-report/);
    assert.doesNotMatch(content, /research-spine/);
    assert.match(content, /## Evidence, Confidence, And Trigger Conditions/);
    assert.match(content, /### Active Data Alerts/);
    assert.match(content, /### Strategy And Thesis Confidence Basis/);
    assert.match(content, /### Mechanism Conditions/);
    assert.match(content, /Confidence Basis/);
    assert.match(content, /Normal Or Fade Condition/);
  } finally {
    restoreEnv('REPORTS_VAULT_ROOT', previousRoot);
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

await runTest('generated reports do not create an Inbox review queue', async () => {
  const previousRoot = process.env.REPORTS_VAULT_ROOT;
  const tempRoot = mkdtempSync(join(tmpdir(), 'research-spine-flow-'));
  const inboxPath = join(tempRoot, '_Inbox', 'Review Queue.md');

  try {
    process.env.REPORTS_VAULT_ROOT = tempRoot;

    const result = await pull({
      documents: 'eod-monitoring,eod-briefing',
      'stale-ok': true,
    });

    assert.equal(result.documents.length, 2);
    assert.equal(result.inboxReviewQueue, null);
    assert.equal(result.worldMachinePromotionQueue, null);
    assert.equal(existsSync(inboxPath), false);

    await pull({
      documents: 'eod-monitoring,eod-briefing',
      'stale-ok': true,
    });

    assert.equal(existsSync(inboxPath), false);
    assert.equal(existsSync(join(tempRoot, '04_Human_Notes')), false);
    assert.equal(existsSync(join(tempRoot, '_Inbox', 'Inbox.md')), false);
  } finally {
    restoreEnv('REPORTS_VAULT_ROOT', previousRoot);
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

await runTest('no-inbox does not create report review queue', async () => {
  const previousRoot = process.env.REPORTS_VAULT_ROOT;
  const tempRoot = mkdtempSync(join(tmpdir(), 'research-spine-flow-'));
  const inboxPath = join(tempRoot, '_Inbox', 'Review Queue.md');

  try {
    process.env.REPORTS_VAULT_ROOT = tempRoot;

    await pull({
      documents: 'eod-monitoring',
      'stale-ok': true,
      'no-inbox': true,
    });

    assert.equal(existsSync(inboxPath), false);
  } finally {
    restoreEnv('REPORTS_VAULT_ROOT', previousRoot);
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

await runTest('end-of-day reports are blocked when required readiness inputs are missing', async () => {
  const previousRoot = process.env.REPORTS_VAULT_ROOT;
  const tempRoot = mkdtempSync(join(tmpdir(), 'research-spine-flow-'));
  const pullsRoot = join(tempRoot, 'pulls');
  const policyPath = join(tempRoot, 'freshness-policies.json');

  try {
    process.env.REPORTS_VAULT_ROOT = tempRoot;
    mkdirSync(pullsRoot, { recursive: true });
    writeFileSync(policyPath, JSON.stringify({
      cadences: {
        eod: {
          stale_required: 'blocked',
          inputs: [
            {
              id: 'required-signal',
              label: 'Required Signal',
              required: true,
              stale_after_hours: 24,
              refresh_command: 'node run.mjs pull signal-intelligence --scope all',
              match: { domain: 'signals', data_type: 'signal_intelligence' },
            },
          ],
        },
      },
    }, null, 2));

    await assert.rejects(
      () => pull({
        documents: 'eod-monitoring',
        'readiness-policy': policyPath,
        'readiness-pulls-root': pullsRoot,
      }),
      /BLOCKED data readiness for eod/
    );
  } finally {
    restoreEnv('REPORTS_VAULT_ROOT', previousRoot);
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

function restoreEnv(name, value) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}
