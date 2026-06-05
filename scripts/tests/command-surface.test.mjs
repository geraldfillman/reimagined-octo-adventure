import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const SCRIPTS_DIR = resolve(TEST_DIR, '..');
const VAULT_ROOT = resolve(SCRIPTS_DIR, '..');
const RESEARCH_ROOT = resolve(VAULT_ROOT, '..', 'The Research Spine');
const todayStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');

function runCli(args) {
  return spawnSync(process.execPath, ['run.mjs', ...args], {
    cwd: SCRIPTS_DIR,
    encoding: 'utf-8',
  });
}

function fileMtime(path) {
  return existsSync(path) ? statSync(path).mtimeMs : null;
}

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

await runTest('cadence group is routed and can list configured cadences', () => {
  const result = runCli(['cadence', 'list']);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Cadences/);
  assert.match(result.stdout, /premarket/);
});

await runTest('dashboard manifest dry-run is routed and does not write manifest', () => {
  const manifestPath = join(VAULT_ROOT, '00_Dashboard', '.manifest.json');
  const before = fileMtime(manifestPath);

  const result = runCli(['system', 'dashboard-manifest', 'generate', '--dry-run']);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /dashboard-manifest/);
  assert.match(result.stdout, /Dry run/i);
  assert.equal(fileMtime(manifestPath), before);
});

await runTest('readiness command is routed and supports stale override', () => {
  const result = runCli(['system', 'readiness', '--cadence', 'midday', '--json', '--stale-ok']);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.cadence, 'midday');
  assert.match(parsed.status, /READY|WARN|BLOCKED/);
});

await runTest('coverage audit supports dry-run and json without writing inventory', () => {
  const reportPath = join(VAULT_ROOT, '99_System', 'inventory', `coverage-audit-${todayStamp}.md`);
  const before = fileMtime(reportPath);

  const dryRun = runCli(['system', 'coverage-audit', '--dry-run']);
  assert.equal(dryRun.status, 0, dryRun.stderr || dryRun.stdout);
  assert.match(dryRun.stdout, /dry-run/i);
  assert.equal(fileMtime(reportPath), before);

  const jsonRun = runCli(['system', 'coverage-audit', '--json', '--dry-run']);
  assert.equal(jsonRun.status, 0, jsonRun.stderr || jsonRun.stdout);
  const parsed = JSON.parse(jsonRun.stdout);
  assert.ok(parsed.summary);
  assert.ok(parsed.gaps);
  assert.ok(parsed.intentional);
  assert.equal(fileMtime(reportPath), before);
});

await runTest('top-level help advertises readiness preflight', () => {
  const result = runCli(['help']);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /system\s+.*readiness/i);
  assert.match(result.stdout, /node run\.mjs system readiness --cadence eod/);
  assert.match(result.stdout, /bridge\s+.*My_Data reports, World_Machine ledger\/inbox exceptions/i);
  assert.match(result.stdout, /node run\.mjs bridge my-data-report-pull --dry-run/);
  assert.match(result.stdout, /my-data-report-pull --full-source-refresh --dry-run/);
  assert.match(result.stdout, /node run\.mjs bridge world-machine-pull --dry-run/);
  assert.match(result.stdout, /node run\.mjs bridge daily --dry-run/);
  assert.match(result.stdout, /node run\.mjs bridge ingest-world-inbox --dry-run/);
  assert.match(result.stdout, /node run\.mjs bridge ingest-world-inbox --from-archive --date YYYY-MM-DD --update-existing/);
  assert.match(result.stdout, /node run\.mjs bridge market-positioning-ledger --dry-run/);
  assert.match(result.stdout, /node run\.mjs bridge consolidate-world-machine --dry-run/);
  assert.match(result.stdout, /node run\.mjs pull my-data-report-flow --all --dry-run/);
  assert.match(result.stdout, /node run\.mjs pull world-machine-flow --approved-only --dry-run/);
  assert.match(result.stdout, /node run\.mjs pull update-my-data-indicators --dry-run/);
  assert.match(result.stdout, /node run\.mjs pull update-world-machine-indicators --dry-run/);
  assert.match(result.stdout, /node run\.mjs pull event-research --scenario fertilizer-shortage --dry-run/);
  assert.match(result.stdout, /--handoff-limit <n>/);
  assert.match(result.stdout, /invoke-inbox-ingest\.ps1 -DryRun/);
  assert.match(result.stdout, /fmp-screener-batch/);
  assert.match(result.stdout, /fmp-harvest/);
  assert.match(result.stdout, /forensic-risk/);
  assert.match(result.stdout, /neo4j-scenario-theory/);
  assert.match(result.stdout, /neo4j-inbox-ingestion/);
  assert.match(result.stdout, /cash-box-with-a-pulse/);
  assert.match(result.stdout, /--group <deep-value\|quality\|momentum\|distress\|events\|financials\|reit\|etf\|healthcare\|commodities>/);
  assert.match(result.stdout, /--sector <name>/);
  assert.match(result.stdout, /--industry <name>/);
});

await runTest('FMP harvest dry-run is routed without requiring live API access', () => {
  const result = runCli(['pull', 'fmp-harvest', '--stage', 'foundation', '--dry-run', '--json']);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.source, 'fmp-harvest');
  assert.equal(parsed.dryRun, true);
  assert.ok(parsed.workUnits.length > 0);
  assert.equal(JSON.stringify(parsed).includes('apikey='), false);
});

await runTest('My_Data report flow and compatibility alias dry-run to report paths', () => {
  const primary = runCli(['pull', 'my-data-report-flow', '--all', '--dry-run']);
  assert.equal(primary.status, 0, primary.stderr || primary.stdout);
  assert.match(primary.stdout, /My_Data report root/);
  assert.match(primary.stdout, /Reports[\\/]/);

  const alias = runCli(['pull', 'research-spine-flow', '--all', '--dry-run']);
  assert.equal(alias.status, 0, alias.stderr || alias.stdout);
  assert.match(alias.stdout, /My_Data report root/);
  assert.match(alias.stdout, /Reports[\\/]/);
});

await runTest('bridge help advertises World Machine output locations', () => {
  const result = runCli(['bridge', '--help']);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /approve-queue/);
  assert.match(result.stdout, /my-data-report-pull/);
  assert.match(result.stdout, /world-machine-pull/);
  assert.match(result.stdout, /Safe default/i);
  assert.match(result.stdout, /--full-source-refresh/);
  assert.match(result.stdout, /bridge daily --dry-run/);
  assert.match(result.stdout, /World_Machine\/_Inbox/);
  assert.match(result.stdout, /ingest-world-inbox/);
  assert.match(result.stdout, /500-archive\/Inbox\/YYYY-MM-DD/);
  assert.match(result.stdout, /event trend synthesis/);
  assert.match(result.stdout, /--from-archive/);
  assert.match(result.stdout, /--update-existing/);
  assert.match(result.stdout, /--connection-limit <n>/);
  assert.match(result.stdout, /--no-event-connections/);
  assert.doesNotMatch(result.stdout, /--no-review-queue/);
  assert.match(result.stdout, /--no-plotly/);
  assert.match(result.stdout, /market-positioning-ledger/);
  assert.match(result.stdout, /Market Positioning Ledger/);
  assert.match(result.stdout, /500-archive\/Stale/);
  assert.match(result.stdout, /consolidate-world-machine/);
  assert.match(result.stdout, /Consolidated_To_My_Data/);
  assert.match(result.stdout, /world-machine-bridge/);
  assert.match(result.stdout, /invoke-inbox-ingest\.ps1 -DryRun/);
});

await runTest('market positioning ledger bridge supports dry-run without writing', () => {
  const result = runCli(['bridge', 'market-positioning-ledger', '--dry-run']);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /\[market-positioning-ledger\] \[dry-run\]/);
  assert.match(result.stdout, /_Inbox\/Market Positioning Ledger\.md/);
  assert.match(result.stdout, /500-archive\/Stale\/Positioning/);
});

await runTest('research spine audit dry-run avoids inventory and active queue writes', () => {
  const reportPath = join(RESEARCH_ROOT, '99_System', 'inventory', `research-spine-audit-${todayStamp}.md`);
  const inboxPath = join(RESEARCH_ROOT, '04_Human_Notes', 'Inbox.md');
  const reportBefore = fileMtime(reportPath);
  const inboxBefore = fileMtime(inboxPath);

  const result = runCli(['system', 'audit-research-spine', '--dry-run', '--no-inbox']);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /dry-run/i);
  assert.doesNotMatch(result.stdout, /Review Queue\.md/);
  assert.equal(fileMtime(reportPath), reportBefore);
  assert.equal(fileMtime(inboxPath), inboxBefore);
});

await runTest('retired dashboard command fails clearly without importing deleted server', () => {
  const result = runCli(['system', 'dashboard']);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /retired|abandoned/i);
  assert.doesNotMatch(result.stderr, /ERR_MODULE_NOT_FOUND/);
});

await runTest('playbook help does not advertise housing-cycle test playbook', () => {
  const result = runCli(['playbook', '--help']);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.doesNotMatch(result.stdout, /housing-cycle/);
});

await runTest('retired and non-puller modules are absent from active puller surface', async () => {
  const help = runCli(['pull', '--help']);
  assert.equal(help.status, 0, help.stderr || help.stdout);
  assert.doesNotMatch(help.stdout, /cot-report/);
  assert.doesNotMatch(help.stdout, /vault-process-canvas/);
  assert.doesNotMatch(help.stdout, /thesis-canvas/);
  assert.match(help.stdout, /cftc-cot/);
  assert.match(help.stdout, /positioning-checklist/);
  assert.match(help.stdout, /market-positioning-outcomes/);
  assert.match(help.stdout, /weekly-research-scout/);
  assert.match(help.stdout, /forensic-risk/);
  assert.match(help.stdout, /neo4j-blind-spot-graph/);
  assert.match(help.stdout, /neo4j-scenario-theory/);
  assert.match(help.stdout, /neo4j-inbox-ingestion/);
  assert.match(help.stdout, /2026-leverage-oil-fed-policy-fragility/);
  assert.match(help.stdout, /--diff-risk-factors/);
  assert.match(help.stdout, /--out-dir <path>/);
  assert.match(help.stdout, /--preset workbook-core/);
  assert.match(help.stdout, /event-research/);
  assert.match(help.stdout, /--scenario <id>/);
  assert.match(help.stdout, /--handoff-limit <n>/);

  const weekly = runCli(['routine', 'weekly', '--dry-run']);
  assert.equal(weekly.status, 0, weekly.stderr || weekly.stdout);
  assert.doesNotMatch(weekly.stdout, /cot-report/);
  assert.match(weekly.stdout, /weekly-research-scout/);

  const canvasPath = join(SCRIPTS_DIR, 'pullers', 'vault-process-canvas.mjs');
  const canvasSource = await readFile(canvasPath, 'utf8');
  assert.match(canvasSource, /export\s+async\s+function\s+pull|export\s+function\s+build/i);
  assert.doesNotMatch(canvasSource, /^const outPath = resolve/m);
  const canvasModule = await import(`${pathToFileURL(canvasPath).href}?t=${Date.now()}`);
  assert.equal(typeof canvasModule.pull, 'function');
  assert.equal(typeof canvasModule.buildVaultProcessCanvas, 'function');
});

await runTest('event research unknown scenario fails with available ids', () => {
  const result = runCli(['pull', 'event-research', '--scenario', 'copper-bottleneck', '--dry-run']);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown event scenario "copper-bottleneck"/);
  assert.match(result.stderr, /Available: fertilizer-shortage/);
});

await runTest('event research json exposes research handoff queue', () => {
  const result = runCli(['pull', 'event-research', '--scenario', 'fertilizer-shortage', '--json', '--handoff-limit', '3']);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.scenario, 'fertilizer-shortage');
  assert.equal(parsed.research_handoff_count, 3);
  assert.equal(parsed.research_handoffs.length, 3);
  assert.ok(parsed.top_research_targets.length > 0);
  assert.ok(parsed.research_handoffs.every(handoff => Array.isArray(handoff.commands) && handoff.commands.every(command => command.includes('--dry-run'))));
});

