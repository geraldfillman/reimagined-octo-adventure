import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const SCRIPTS_DIR = resolve(TEST_DIR, '..');
const VAULT_ROOT = resolve(SCRIPTS_DIR, '..');
const WRAPPER = join(SCRIPTS_DIR, 'invoke-scheduled-cadence.ps1');
const INSTALLER = join(SCRIPTS_DIR, 'install-data-freshness-tasks.ps1');
const INBOX_INSTALLER = join(SCRIPTS_DIR, 'install-inbox-ingest-tasks.ps1');
const INBOX_WRAPPER = join(SCRIPTS_DIR, 'invoke-inbox-ingest.ps1');
const ROUTINE_RUNNER = join(SCRIPTS_DIR, 'agents', 'routine-runner.mjs');
const CADENCES_CONFIG = join(VAULT_ROOT, '99_System', 'config', 'cadences.json');

function runPowerShell(args) {
  return spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', ...args], {
    cwd: SCRIPTS_DIR,
    encoding: 'utf-8',
  });
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

await runTest('scheduled cadence wrapper has a dry-run mode', () => {
  assert.equal(existsSync(WRAPPER), true, 'missing invoke-scheduled-cadence.ps1');

  const result = runPowerShell([
    '-File',
    WRAPPER,
    '-CommandType',
    'cadence',
    '-Name',
    'eod',
    '-DryRun',
  ]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /node .*run\.mjs cadence run eod/i);
  assert.match(result.stdout, /dry-run/i);
});

await runTest('scheduled cadence wrapper rejects broad routine commands', () => {
  assert.equal(existsSync(WRAPPER), true, 'missing invoke-scheduled-cadence.ps1');

  const result = runPowerShell([
    '-File',
    WRAPPER,
    '-CommandType',
    'routine',
    '-Name',
    'weekly',
    '-DryRun',
  ]);

  assert.notEqual(result.status, 0, 'routine weekly should not be allowed through the scheduled wrapper');
  assert.match(result.stderr || result.stdout, /manual-only|raw source/i);
});

await runTest('scheduler installer dry-run advertises only review and analysis tasks', () => {
  assert.equal(existsSync(INSTALLER), true, 'missing install-data-freshness-tasks.ps1');

  const result = runPowerShell(['-File', INSTALLER, '-DryRun']);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /My_Data - Premarket Cadence/i);
  assert.match(result.stdout, /My_Data - Daily Cadence/i);
  assert.match(result.stdout, /My_Data - Midday Cadence/i);
  assert.match(result.stdout, /My_Data - Preclose Cadence/i);
  assert.match(result.stdout, /My_Data - EOD Cadence/i);
  assert.match(result.stdout, /My_Data - Post-Close Validate/i);
  assert.doesNotMatch(result.stdout, /My_Data - Weekly Deep Refresh/i);
  assert.match(result.stdout, /07:00/);
  assert.match(result.stdout, /16:30/);
});

await runTest('configured scheduled cadences exclude raw source pullers', () => {
  const config = JSON.parse(readFileSync(CADENCES_CONFIG, 'utf-8'));
  const allowed = new Set([
    'signal-intelligence',
    'market-cycle-monitor',
    'freshness-source-writer',
    'streamline-report',
    'my-data-report-flow',
    'knowledge-gap-tasks',
  ]);

  for (const [cadenceName, cadence] of Object.entries(config.cadences)) {
    for (const puller of cadence.pullers || []) {
      assert.ok(
        allowed.has(puller.name),
        `${cadenceName} schedules raw or manual-only puller "${puller.name}"`
      );
    }
  }
});

await runTest('scheduler installer uses the supported non-elevated run level', () => {
  const content = readFileSync(INSTALLER, 'utf-8');

  assert.match(content, /-RunLevel\s+Limited/);
  assert.doesNotMatch(content, /LeastPrivilege/);
});

await runTest('scheduler installer removes retired weekly deep refresh task', () => {
  const content = readFileSync(INSTALLER, 'utf-8');

  assert.match(content, /\$retiredTaskNames\s*=\s*@\(/);
  assert.match(content, /'My_Data - Weekly Deep Refresh'/);
  assert.match(content, /Unregister-RetiredTask/);
  assert.doesNotMatch(content, /CommandType\s*=\s*'routine'/);
});

await runTest('inbox scheduler is named as a World packet writer and removes legacy ingest task names', () => {
  assert.equal(existsSync(INBOX_INSTALLER), true, 'missing install-inbox-ingest-tasks.ps1');

  const result = runPowerShell(['-File', INBOX_INSTALLER, '-DryRun']);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /World Packet Writer 0900/);
  assert.match(result.stdout, /World Packet Writer 1200/);
  assert.match(result.stdout, /World Packet Writer 1700/);
  assert.doesNotMatch(result.stdout, /Inbox Ingest 09:00/);
  assert.doesNotMatch(result.stdout, /Inbox Ingest 0900/);

  const content = readFileSync(INBOX_INSTALLER, 'utf-8');
  assert.match(content, /legacyTaskNames/);
  assert.match(content, /My_Data - Inbox Ingest 0900/);
  assert.match(content, /My_Data - Inbox Ingest 09:00/);
});

await runTest('inbox wrapper is explicitly an approved World packet writer', () => {
  const content = readFileSync(INBOX_WRAPPER, 'utf-8');

  assert.match(content, /world-machine-flow --approved-only/);
  assert.match(content, /World_Machine approved packet writer/i);
  assert.doesNotMatch(content, /bridge ingest-world-inbox/);
});

await runTest('routine runner dry-run does not persist run-state or append run-log', () => {
  const content = readFileSync(ROUTINE_RUNNER, 'utf-8');

  assert.match(content, /const\s+persistRun\s*=\s*!args\.dryRun/);
  assert.match(content, /if\s*\(\s*persistRun\s*\)\s*{\s*await appendLog/);
  assert.match(content, /if\s*\(\s*persistRun\s*\)\s*{[\s\S]*await saveState\(STATE_PATH, state\)/);
});
