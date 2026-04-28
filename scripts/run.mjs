#!/usr/bin/env node
/**
 * run.mjs — CLI entry point
 *
 * New grouped grammar:
 *   node run.mjs <group> <command> [options]
 *
 * Examples:
 *   node run.mjs system status
 *   node run.mjs scan sectors --dry-run
 *   node run.mjs pull fred --group housing
 *   node run.mjs quant sim --thesis "Housing Supply Correction" --summary-only
 *
 * Legacy flat commands still work but print a deprecation notice.
 * Run "node run.mjs help" for a full overview.
 */

import { listSources } from './lib/config.mjs';
import { isGroupCommand, routeGrouped, printGroupHelp } from './cmd/router.mjs';

const [, , command, ...args] = process.argv;

if (!command || command === 'help') {
  printHelp();
  process.exit(0);
}

// ── New grouped grammar: node run.mjs <group> <subcommand> [options] ──────────
if (isGroupCommand(command)) {
  const groupStartTime = Date.now();
  const flags = parseArgs(args);
  const subcommand = args.find(a => !a.startsWith('--')) ?? null;

  // "node run.mjs <group> --help" → show group help
  if (flags.help) {
    printGroupHelp(command);
    process.exit(0);
  }

  // Raw args after subcommand — forwarded as-is to Python (quant group)
  const rawAfterSub = subcommand ? args.slice(args.indexOf(subcommand) + 1) : args;

  try {
    await routeGrouped(command, subcommand, rawAfterSub, flags);
    if (command !== 'system') {
      const elapsed = ((Date.now() - groupStartTime) / 1000).toFixed(1);
      console.log(`\n✅ Done in ${elapsed}s`);
    }
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(1);
  }
  process.exit(process.exitCode ?? 0);
}

// ── Compat aliases — legacy flat commands (print deprecation notice, then run) ─

function deprecated(oldCmd, newCmd) {
  console.warn(`⚠  Deprecated: use "node run.mjs ${newCmd}" instead of "${oldCmd}"`);
}

if (command === 'status') {
  deprecated('status', 'system status');
  printStatus();
  process.exit(0);
}

if (command === 'validate') {
  deprecated('validate', 'system validate');
  const validator = await import('./validate-vault.mjs');
  await validator.run();
  process.exit(process.exitCode ?? 0);
}

if (command === 'learning-session') {
  deprecated('learning-session', 'learn session');
  const { pathToFileURL } = await import('url');
  const { join } = await import('path');
  const { getLearningVaultRoot } = await import('./lib/config.mjs');
  const learningSession = await import(pathToFileURL(join(getLearningVaultRoot(), 'scripts', 'learning-session.mjs')).href);
  const flags = parseArgs(args);
  await learningSession.run(flags);
  process.exit(process.exitCode ?? 0);
}

if (command === 'cleanup') {
  deprecated('cleanup', 'system cleanup');
  const cleanup = await import('./cleanup.mjs');
  const flags = parseArgs(args);
  await cleanup.run(flags);
  process.exit(process.exitCode ?? 0);
}

if (command === 'infranodus') {
  deprecated('infranodus', 'system infranodus');
  const measurement = await import('./infranodus.mjs');
  const flags = parseArgs(args);
  await measurement.run(flags);
  process.exit(process.exitCode ?? 0);
}

if (command === 'dashboard') {
  deprecated('dashboard', 'system dashboard');
  const { startServer } = await import('./dashboard/server.mjs');
  const port = parseInt(process.env.DASHBOARD_PORT ?? '3737', 10);
  startServer(port);
}

if (command === 'conviction-delta') {
  deprecated('conviction-delta', 'scan conviction');
  const tracker = await import('./lib/conviction-tracker.mjs');
  const flags = parseArgs(args);
  const result = await tracker.run(flags);
  if (flags.json) {
    console.log(JSON.stringify(result, null, 2));
  }
  process.exit(process.exitCode ?? 0);
}

if (command === 'thesis-fmp-sync') {
  deprecated('thesis-fmp-sync', 'thesis sync');
  const sync = await import('./sync-thesis-fmp.mjs');
  const flags = parseArgs(args);
  await sync.run(flags);
  process.exit(process.exitCode ?? 0);
}

if (command === 'thesis-catalysts') {
  deprecated('thesis-catalysts', 'thesis catalysts');
  const catalysts = await import('./thesis-catalysts.mjs');
  const flags = parseArgs(args);
  await catalysts.run(flags);
  process.exit(process.exitCode ?? 0);
}

if (command === 'thesis-full-picture') {
  deprecated('thesis-full-picture', 'thesis full-picture');
  const reports = await import('./thesis-full-picture.mjs');
  const flags = parseArgs(args);
  await reports.run(flags);
  process.exit(process.exitCode ?? 0);
}

if (command === 'qlib') {
  deprecated('qlib', 'quant');
  const { spawnSync } = await import('child_process');
  const { join } = await import('path');

  const qlibDir = join(import.meta.dirname, 'qlib');
  const qlibCli = join(qlibDir, 'cli.py');
  const subcommand = args[0];
  if (!subcommand) {
    console.error('Error: Specify a qlib subcommand. Example: node scripts/run.mjs qlib setup');
    console.log('\nAvailable subcommands: setup, status, universe, factors, backtest, sim, score, refresh, update-theses');
    process.exit(1);
  }

  const { existsSync } = await import('fs');
  const venvPython = join(qlibDir, '.venv', 'Scripts', 'python.exe');
  const python = existsSync(venvPython) ? venvPython : 'python';

  const pythonArgs = [qlibCli, ...args];
  const result = spawnSync(python, pythonArgs, {
    cwd: import.meta.dirname,
    stdio: 'inherit',
    env: { ...process.env },
  });

  if (result.error) {
    console.error(`\n❌ Failed to run Python: ${result.error.message}`);
    console.error('Ensure Python 3.8+ is installed and on PATH.');
    process.exit(1);
  }
  process.exit(result.status ?? 0);
}

// ── Shared utilities ───────────────────────────────────────────────────────────

function parseArgs(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    }
  }
  return flags;
}

const flags = parseArgs(args);

function normalizeRetentionJobs(result) {
  if (!Array.isArray(result?.retention)) return [];

  const seenPolicies = new Set();
  const jobs = [];

  for (const job of result.retention) {
    const normalized = typeof job === 'string' ? { policy: job } : job;
    const policy = normalized?.policy;
    if (!policy || seenPolicies.has(policy)) continue;
    seenPolicies.add(policy);
    jobs.push(normalized);
  }

  return jobs;
}

async function applyAutomaticRetention(result, flags) {
  if (flags['skip-retention']) return;

  const jobs = normalizeRetentionJobs(result);
  if (jobs.length === 0) return;

  const retention = await import('./lib/retention.mjs');

  for (const job of jobs) {
    if (job.policy !== 'market-history') continue;

    const summary = retention.formatMarketHistoryRetentionSummary(
      retention.pruneMarketHistory({
        keepDaily: job.keepDaily,
        keepQuotes: job.keepQuotes,
      }),
      {
        label: 'Auto cleanup: Market history retention',
        verbose: false,
      }
    );

    for (const line of summary) {
      console.log(line);
    }
  }
}

// ── Dynamic puller / playbook loader (legacy flat command fallthrough) ─────────
async function run() {
  const startTime = Date.now();
  let result;

  try {
    if (command === 'playbook') {
      const playbookName = flags.name || args[0]?.replace('--', '') || args.find(a => !a.startsWith('--'));
      if (!playbookName) {
        console.error('Error: Specify a playbook name. Example: node run.mjs playbook housing-cycle');
        process.exit(1);
      }
      const playbook = await import(`./playbooks/${playbookName}.mjs`);
      result = await playbook.run(flags);
    } else {
      let puller;
      try {
        puller = await import(`./pullers/${command}.mjs`);
      } catch (err) {
        if (err.code === 'ERR_MODULE_NOT_FOUND') {
          console.error(`Error: Unknown command "${command}". Run "node run.mjs help" for available commands.`);
          process.exit(1);
        }
        throw err;
      }
      result = await puller.pull(flags);
    }

    await applyAutomaticRetention(result, flags);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Done in ${elapsed}s`);
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(1);
  }
}

// ── Help & status ──────────────────────────────────────────────────────────────

function printHelp() {
  console.log(`
My_Data CLI
===========

Usage:
  node run.mjs <group> <command> [options]

Groups:
  system    Status, validation, dashboard, cleanup, infranodus
  learn     Daily learning sessions
  scan      Sector scan, company-risk, conviction delta
  thesis    FMP sync, catalysts, full-picture reports
  pull      External data pullers (fred, fmp, sec, arxiv, ...)
  playbook  Multi-step workflows
  quant     Quantitative analysis (Qlib)
  kb        Knowledge base pipeline (ingest → normalize → classify → compile → query)

Examples:
  node run.mjs system status
  node run.mjs system validate
  node run.mjs learn session --candidate 5 --topic-id macro-rate-transmission
  node run.mjs scan sectors --sector industrials --dry-run
  node run.mjs scan company-risk --watchlist --update-score
  node run.mjs thesis sync --dry-run
  node run.mjs pull fmp --quote AAPL,MSFT
  node run.mjs pull fred --group housing
  node run.mjs playbook housing-cycle
  node run.mjs quant sim --thesis "Housing Supply Correction" --summary-only
  node run.mjs kb ingest --file ./article.md --kind article
  node run.mjs kb query --query "What is the energy regime?" --save

Run "node run.mjs <group> --help" for group detail.

Note: Legacy flat commands (sector-scan, thesis-fmp-sync, qlib, etc.) still work
      but print a deprecation hint. See 90_System/CLI Command Audit.md.
`);
}

function printStatus() {
  console.log('\n📊 API Key Status\n');
  const sources = listSources();
  const maxName = Math.max(...sources.map(s => s.name.length));

  for (const s of sources) {
    const status = s.requiresKey
      ? (s.hasKey ? '✅ Configured' : '❌ Missing')
      : '⚪ No key needed';
    console.log(`  ${s.name.padEnd(maxName + 2)} ${status}`);
  }

  const configured = sources.filter(s => s.hasKey).length;
  console.log(`\n  ${configured}/${sources.length} sources ready\n`);
}

if (command !== 'dashboard') {
  run();
}
