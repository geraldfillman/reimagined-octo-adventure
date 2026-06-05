import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { run } from '../system/source-gap-register.mjs';

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

await runTest('source gap register reads and writes the reports root', async () => {
  const previousReportsRoot = process.env.REPORTS_VAULT_ROOT;
  const previousResearchRoot = process.env.RESEARCH_VAULT_ROOT;
  const reportsRoot = mkdtempSync(join(tmpdir(), 'my-data-reports-'));
  const researchRoot = mkdtempSync(join(tmpdir(), 'archived-research-spine-'));

  try {
    process.env.REPORTS_VAULT_ROOT = reportsRoot;
    process.env.RESEARCH_VAULT_ROOT = researchRoot;

    const summaryDir = join(reportsRoot, 'Reports', 'System', 'run_summaries');
    mkdirSync(summaryDir, { recursive: true });
    writeFileSync(join(summaryDir, '2026-05-15_09-30.md'), [
      '| Puller | Status |',
      '|---|---|',
      '| gdelt | FAILED |',
    ].join('\n'), 'utf-8');

    await run({});

    const outPath = join(reportsRoot, 'Reports', 'Source Gap Register.md');
    assert.equal(existsSync(outPath), true);
    assert.match(readFileSync(outPath, 'utf-8'), /gdelt/);
    assert.equal(existsSync(join(researchRoot, '99_System', 'Source_Gap_Register.md')), false);
  } finally {
    restoreEnv('REPORTS_VAULT_ROOT', previousReportsRoot);
    restoreEnv('RESEARCH_VAULT_ROOT', previousResearchRoot);
    rmSync(reportsRoot, { recursive: true, force: true });
    rmSync(researchRoot, { recursive: true, force: true });
  }
});

await runTest('source gap register includes latest error, last success, and refresh commands', async () => {
  const previousReportsRoot = process.env.REPORTS_VAULT_ROOT;
  const reportsRoot = mkdtempSync(join(tmpdir(), 'my-data-gap-detail-'));

  try {
    process.env.REPORTS_VAULT_ROOT = reportsRoot;

    const summaryDir = join(reportsRoot, 'Reports', 'System', 'run_summaries');
    mkdirSync(summaryDir, { recursive: true });

    writeFileSync(join(summaryDir, '2026-05-20_09-45.md'), [
      '| Puller | Status | Wrote | Errors | Duration |',
      '| --- | --- | --- | --- | --- |',
      '| research-spine-flow | ok | 2 | 0 | 1.0s |',
    ].join('\n'), 'utf-8');

    writeFileSync(join(summaryDir, '2026-05-22_09-45.md'), [
      '| Puller | Status | Wrote | Errors | Duration |',
      '| --- | --- | --- | --- | --- |',
      '| research-spine-flow | FAILED | 0 | 1 | 1.2s |',
      '',
      '## Error Details',
      '',
      '### research-spine-flow',
      '',
      '**Error 1:** BLOCKED data readiness for daily',
      'BLOCKED FMP Market Performance: stale (144.0h old)',
      '  refresh: node run.mjs pull fmp --market-performance',
      'WARN General Market News: stale (144.0h old)',
      '  refresh: node run.mjs pull fmp --general-news --limit=25',
      'Use the listed refresh command(s), rerun readiness, then generate the report.',
    ].join('\n'), 'utf-8');

    await run({});

    const content = readFileSync(join(reportsRoot, 'Reports', 'Source Gap Register.md'), 'utf-8');
    assert.match(content, /Last Success/);
    assert.match(content, /2026-05-20/);
    assert.match(content, /BLOCKED data readiness for daily/);
    assert.match(content, /node run\.mjs pull fmp --market-performance/);
    assert.match(content, /node run\.mjs pull fmp --general-news --limit=25/);
  } finally {
    restoreEnv('REPORTS_VAULT_ROOT', previousReportsRoot);
    rmSync(reportsRoot, { recursive: true, force: true });
  }
});

function restoreEnv(name, value) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}
