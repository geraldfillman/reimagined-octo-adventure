import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  evaluateReadiness,
  formatReadinessText,
  run,
} from '../system/readiness.mjs';

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

function makeWorkspace() {
  const root = join(tmpdir(), `readiness-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const pullsRoot = join(root, '05_Data_Pulls');
  const policyPath = join(root, 'freshness-policies.json');
  mkdirSync(pullsRoot, { recursive: true });
  writeFileSync(policyPath, JSON.stringify(testPolicy(), null, 2));
  return { root, pullsRoot, policyPath };
}

function testPolicy() {
  const market = {
    id: 'market-snapshot',
    label: 'Market Snapshot',
    required: true,
    stale_after_hours: 6,
    refresh_command: 'node run.mjs pull market-cycle-monitor',
    match: { domain: 'market', data_type: 'market_snapshot', source: 'fmp' },
  };
  const news = {
    id: 'news-monitor',
    label: 'News Monitor',
    required: true,
    stale_after_hours: 12,
    refresh_command: 'node run.mjs pull news',
    match: { domain: 'news', data_type: 'news_monitor', puller: 'gdelt' },
  };
  const supporting = {
    id: 'supporting-context',
    label: 'Supporting Context',
    required: true,
    stale_after_hours: 12,
    severity: 'warn',
    refresh_command: 'node run.mjs pull signal-intelligence',
    match: { domain: 'signals', data_type: 'signal_intelligence' },
  };

  return {
    cadences: {
      daily: { stale_required: 'blocked', inputs: [market] },
      premarket: { stale_required: 'blocked', inputs: [market] },
      midday: { stale_required: 'warn', inputs: [market] },
      preclose: { stale_required: 'blocked', inputs: [market, supporting] },
      eod: { stale_required: 'blocked', inputs: [market, news] },
    },
  };
}

function writePull(pullsRoot, relativePath, frontmatter) {
  const target = join(pullsRoot, relativePath);
  mkdirSync(join(target, '..'), { recursive: true });
  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n');
  writeFileSync(target, `---\n${yaml}\n---\n\n# ${frontmatter.title}\n`);
}

async function withWorkspace(fn) {
  const workspace = makeWorkspace();
  try {
    await fn(workspace);
  } finally {
    await rm(workspace.root, { recursive: true, force: true });
  }
}

await runTest('evaluateReadiness returns READY when required inputs are fresh', async () => {
  await withWorkspace(async ({ pullsRoot, policyPath }) => {
    writePull(pullsRoot, 'Market/fresh.md', {
      title: 'Fresh Market Snapshot',
      domain: 'market',
      data_type: 'market_snapshot',
      source: 'fmp',
      date_pulled: '2026-05-07T08:00:00-04:00',
    });

    const result = await evaluateReadiness({
      cadence: 'daily',
      now: '2026-05-07T10:00:00-04:00',
      policyPath,
      pullsRoot,
    });

    assert.equal(result.status, 'READY');
    assert.equal(result.items[0].status, 'READY');
  });
});

await runTest('date-only pull notes stay fresh for the whole matching calendar day', async () => {
  await withWorkspace(async ({ pullsRoot, policyPath }) => {
    writePull(pullsRoot, 'Market/fresh-date-only.md', {
      title: 'Fresh Market Snapshot',
      domain: 'market',
      data_type: 'market_snapshot',
      source: 'fmp',
      date_pulled: '2026-05-07',
    });

    const result = await evaluateReadiness({
      cadence: 'daily',
      now: '2026-05-07T23:30:00-04:00',
      policyPath,
      pullsRoot,
    });

    assert.equal(result.status, 'READY');
    assert.equal(result.items[0].age_hours, 0);
  });
});

await runTest('evaluateReadiness returns WARN for stale midday required inputs', async () => {
  await withWorkspace(async ({ pullsRoot, policyPath }) => {
    writePull(pullsRoot, 'Market/stale.md', {
      title: 'Stale Market Snapshot',
      domain: 'market',
      data_type: 'market_snapshot',
      source: 'fmp',
      date_pulled: '2026-05-06T20:00:00-04:00',
    });

    const result = await evaluateReadiness({
      cadence: 'midday',
      now: '2026-05-07T10:00:00-04:00',
      policyPath,
      pullsRoot,
    });

    assert.equal(result.status, 'WARN');
    assert.equal(result.items[0].status, 'WARN');
    assert.match(formatReadinessText(result), /node run\.mjs pull market-cycle-monitor/);
  });
});

await runTest('evaluateReadiness returns BLOCKED for missing daily required inputs', async () => {
  await withWorkspace(async ({ pullsRoot, policyPath }) => {
    const result = await evaluateReadiness({
      cadence: 'daily',
      now: '2026-05-07T10:00:00-04:00',
      policyPath,
      pullsRoot,
    });

    assert.equal(result.status, 'BLOCKED');
    assert.equal(result.items[0].status, 'BLOCKED');
    assert.equal(result.items[0].reason, 'missing');
  });
});

await runTest('evaluateReadiness blocks stale preclose market data but only warns on stale supporting data', async () => {
  await withWorkspace(async ({ pullsRoot, policyPath }) => {
    writePull(pullsRoot, 'Market/stale.md', {
      title: 'Stale Market Snapshot',
      domain: 'market',
      data_type: 'market_snapshot',
      source: 'fmp',
      date_pulled: '2026-05-06T20:00:00-04:00',
    });
    writePull(pullsRoot, 'Signals/stale.md', {
      title: 'Stale Signal Intelligence',
      domain: 'signals',
      data_type: 'signal_intelligence',
      source: 'local',
      date_pulled: '2026-05-06T20:00:00-04:00',
    });

    const result = await evaluateReadiness({
      cadence: 'preclose',
      now: '2026-05-07T10:00:00-04:00',
      policyPath,
      pullsRoot,
    });

    assert.equal(result.status, 'BLOCKED');
    assert.equal(result.items.find(item => item.id === 'market-snapshot').status, 'BLOCKED');
    assert.equal(result.items.find(item => item.id === 'supporting-context').status, 'WARN');
  });
});

await runTest('run does not set exitCode for BLOCKED results when stale-ok is enabled', async () => {
  await withWorkspace(async ({ pullsRoot, policyPath }) => {
    const originalExitCode = process.exitCode;
    process.exitCode = undefined;
    const output = [];

    const result = await run({
      cadence: 'daily',
      now: '2026-05-07T10:00:00-04:00',
      policyPath,
      pullsRoot,
      staleOk: true,
      write: line => output.push(line),
    });

    assert.equal(result.status, 'BLOCKED');
    assert.equal(process.exitCode, undefined);
    assert.match(output.join('\n'), /^BLOCKED/m);
    process.exitCode = originalExitCode;
  });
});
