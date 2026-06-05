#!/usr/bin/env node
/**
 * run.mjs - CLI entry point
 *
 * New grouped grammar:
 *   node run.mjs <group> <command> [options]
 *
 * Examples:
 *   node run.mjs system status
 *   node run.mjs scan sectors --dry-run
 *   node run.mjs pull fred --group housing
 *
 * Legacy flat commands still work but print a deprecation notice.
 * Run "node run.mjs help" for a full overview.
 */

import { listSources } from './lib/config.mjs';
import { isGroupCommand, routeGrouped, printGroupHelp } from './cmd/router.mjs';
import { normalizeEnvelope, writeRunSummary } from './lib/run-envelope.mjs';

const [, , command, ...args] = process.argv;

if (!command || command === 'help') {
  printHelp();
  process.exit(0);
}

// New grouped grammar: node run.mjs <group> <subcommand> [options]
if (isGroupCommand(command)) {
  const groupStartTime = Date.now();
  const flags = parseArgs(args);
  const subcommand = args.find(a => !a.startsWith('--')) ?? null;

  if (flags.help) {
    printGroupHelp(command);
    process.exit(0);
  }

  const rawAfterSub = subcommand ? args.slice(args.indexOf(subcommand) + 1) : args;

  try {
    const result = await routeGrouped(command, subcommand, rawAfterSub, flags);
    await applyAutomaticRetention(result, flags);
    if (command !== 'system' && !flags.json) {
      const elapsed = ((Date.now() - groupStartTime) / 1000).toFixed(1);
      console.log(`\n[done] Done in ${elapsed}s`);
    }
  } catch (err) {
    console.error(`\nError: ${err.message}`);
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(1);
  }
  process.exit(process.exitCode ?? 0);
}

// Compat aliases: legacy flat commands print a deprecation notice, then run.
function deprecated(oldCmd, newCmd) {
  console.warn(`[deprecated] use "node run.mjs ${newCmd}" instead of "${oldCmd}"`);
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
  console.error('The local web dashboard has been retired. Use the Obsidian dashboards in 00_Dashboard/ instead.');
  process.exit(1);
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
  console.error('Qlib has been retired from this vault. Reinstall or restore it only when a concrete quant use case returns.');
  process.exit(1);
}

// Shared utilities
function parseArgs(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith('--')) continue;

    const rawKey = args[i].slice(2);
    const eqIndex = rawKey.indexOf('=');
    if (eqIndex >= 0) {
      flags[rawKey.slice(0, eqIndex)] = rawKey.slice(eqIndex + 1);
      continue;
    }

    const next = args[i + 1];
    if (next && !next.startsWith('--')) {
      flags[rawKey] = next;
      i++;
    } else {
      flags[rawKey] = true;
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

// Dynamic puller / playbook loader for legacy flat command fallthrough.
async function run() {
  const startTime = Date.now();

  // ── Multi-puller mode ────────────────────────────────────────────────────
  // Activated when the legacy flat command is a puller and --pullers=a,b,c
  // or --all is provided.  Each puller runs in its own try/catch; failures
  // are captured in the envelope and do not abort downstream pullers.
  // A run summary is written to the active review vault after all pullers finish.
  //
  // Single-puller invocations are unaffected unless --summary is also passed.

  const pullerListRaw = flags.pullers;
  const isMultiPuller = Boolean(pullerListRaw || flags.all);

  if (command === 'playbook') {
    // Playbooks are never batched via this path — run single.
    await runSinglePlaybook(flags, startTime);
    return;
  }

  if (isMultiPuller) {
    // Build the list of puller names to run.
    let pullerNames;
    if (pullerListRaw) {
      pullerNames = String(pullerListRaw).split(',').map(s => s.trim()).filter(Boolean);
    } else {
      // --all with a single command means run just the one named command;
      // callers that want a true batch should pass --pullers=a,b,c.
      pullerNames = [command];
    }

    const envelopes = [];

    for (const name of pullerNames) {
      const t0 = Date.now();
      let raw = null;
      let caughtErr = null;

      console.log(`\n[run] ${name}`);

      try {
        let mod;
        try {
          mod = await import(`./pullers/${name}.mjs`);
        } catch (importErr) {
          if (importErr.code === 'ERR_MODULE_NOT_FOUND') {
            throw new Error(`Unknown puller "${name}". Run "node run.mjs help" for available commands.`);
          }
          throw importErr;
        }
        raw = await mod.pull(flags);
        await applyAutomaticRetention(raw, flags);
      } catch (err) {
        caughtErr = err;
        console.error(`  FAILED [${name}]: ${err.message}`);
        if (process.env.DEBUG) console.error(err.stack);
      }

      const envelope = normalizeEnvelope(name, raw, caughtErr, Date.now() - t0);
      envelopes.push(envelope);

      const statusLine = envelope.ok
        ? `  [ok] wrote=${envelope.wrote.length} skipped=${envelope.skipped.length}`
        : `  [error] ${envelope.errors.map(e => e.message).join('; ')}`;
      console.log(statusLine);
    }

    // Always write summary for multi-puller runs (or if --summary passed).
    const summaryPath = writeRunSummary(envelopes, { label: pullerListRaw ? 'multi-puller' : command });
    console.log(`\n[run-summary] ${summaryPath}`);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const anyFailed = envelopes.some(e => !e.ok);
    const okCount = envelopes.filter(e => e.ok).length;
    console.log(`\n[done] ${okCount}/${envelopes.length} ok in ${elapsed}s`);

    if (anyFailed) {
      process.exitCode = 1;
    }
    return;
  }

  // ── Single-puller mode (legacy behaviour, now with per-puller envelope) ──
  await runSinglePuller(command, flags, startTime, Boolean(flags.summary));
}

/**
 * Run a single named puller with a per-puller try/catch.
 * Exits with code 1 on failure.  Writes a summary file only when
 * writeSummary=true (--summary flag).
 */
async function runSinglePuller(name, flags, startTime, writeSummary) {
  const t0 = Date.now();
  let raw = null;
  let caughtErr = null;

  try {
    let puller;
    try {
      puller = await import(`./pullers/${name}.mjs`);
    } catch (err) {
      if (err.code === 'ERR_MODULE_NOT_FOUND') {
        console.error(`Error: Unknown command "${name}". Run "node run.mjs help" for available commands.`);
        process.exit(1);
      }
      throw err;
    }
    raw = await puller.pull(flags);
    await applyAutomaticRetention(raw, flags);
  } catch (err) {
    caughtErr = err;
    console.error(`\nError: ${err.message}`);
    if (process.env.DEBUG) console.error(err.stack);
  }

  const envelope = normalizeEnvelope(name, raw, caughtErr, Date.now() - t0);

  if (writeSummary) {
    const summaryPath = writeRunSummary([envelope], { label: name });
    console.log(`\n[run-summary] ${summaryPath}`);
  }

  if (!envelope.ok) {
    process.exitCode = 1;
    return;
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n[done] Done in ${elapsed}s`);
}

/**
 * Run a single playbook (unchanged behaviour).
 */
async function runSinglePlaybook(flags, startTime) {
  const playbookName = flags.name || args[0]?.replace('--', '') || args.find(a => !a.startsWith('--'));
  if (!playbookName) {
    console.error('Error: Specify a playbook name.');
    process.exit(1);
  }
  try {
    const playbook = await import(`./playbooks/${playbookName}.mjs`);
    const result = await playbook.run(flags);
    await applyAutomaticRetention(result, flags);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n[done] Done in ${elapsed}s`);
  } catch (err) {
    console.error(`\nError: ${err.message}`);
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(1);
  }
}

// Help and status
function printHelp() {
  console.log(`
My_Data CLI
===========

Usage:
  node run.mjs <group> <command> [options]

Groups:
  system    Status, validation, readiness, cleanup, audits, infranodus
  learn     Daily learning sessions
  scan      Sector scan, company-risk, conviction delta, OSINT
  thesis    FMP sync, catalysts, full-picture reports
  pull      External data pullers (fred, fmp, sec, arxiv, ...)
  playbook  Multi-step workflows
  routine   Manual broad source-refresh cadences
  cadence   Scheduled review/analysis runner with per-puller run summaries
  kb        Knowledge base pipeline (ingest -> normalize -> classify -> compile -> query)
  bridge    My_Data reports, World_Machine ledger/inbox exceptions, and packet flow

Examples:
  node run.mjs system status
  node run.mjs system validate
  node run.mjs system readiness --cadence eod
  node run.mjs learn session --candidate 5 --topic-id macro-rate-transmission
  node run.mjs scan sectors --sector industrials --dry-run
  node run.mjs scan company-risk --watchlist --update-score
  node run.mjs thesis sync --dry-run
  node run.mjs pull fmp --quote AAPL,MSFT
  node run.mjs pull fmp-harvest --stage all --scope hybrid --resume --json
  node run.mjs pull fmp-harvest --stage prices-bulk --from 2020-06-01 --to 2026-06-01 --dry-run
  node run.mjs pull forensic-risk --symbols AAPL,MSFT --dry-run
  node run.mjs pull forensic-risk --watchlist cash_flow_quality --diff-risk-factors --dry-run
  node run.mjs pull neo4j-scenario-theory --scenario 2026-leverage-oil-fed-policy-fragility --dry-run --json
  node run.mjs pull neo4j-inbox-ingestion --date YYYY-MM-DD --dry-run --json
  node run.mjs pull event-research --scenario fertilizer-shortage --dry-run
  node run.mjs pull event-research --scenario hormuz-oil-shock --dry-run --handoff-limit <n>
  node run.mjs pull fmp-screener-batch --preset cash-box-with-a-pulse
  node run.mjs pull fmp-screener-batch --group <deep-value|quality|momentum|distress|events|financials|reit|etf|healthcare|commodities> --sector <name> --industry <name>
  node run.mjs pull fred --group housing
  node run.mjs routine premarket --dry-run
  node run.mjs routine daily --dry-run
  node run.mjs routine midday --dry-run
  node run.mjs routine preclose --dry-run
  node run.mjs routine endofday --as-dow=fri --dry-run
  node run.mjs cadence list
  node run.mjs cadence run premarket --dry-run
  node run.mjs bridge my-data-report-pull --dry-run
  node run.mjs bridge my-data-report-pull --full-source-refresh --dry-run
  node run.mjs bridge world-machine-pull --dry-run
  node run.mjs bridge daily --dry-run
  node run.mjs bridge approve-queue --dry-run
  node run.mjs bridge ingest-world-inbox --dry-run
  node run.mjs bridge ingest-world-inbox --from-archive --date YYYY-MM-DD --update-existing
  node run.mjs bridge eod-digest --dry-run
  node run.mjs bridge market-positioning-ledger --dry-run
  node run.mjs bridge consolidate-world-machine --dry-run
  node run.mjs pull my-data-report-flow --all --dry-run
  node run.mjs pull research-spine-flow --all --dry-run  # compatibility name; writes My_Data report output
  node run.mjs pull world-machine-flow --approved-only --dry-run
  node run.mjs pull update-my-data-indicators --dry-run
  node run.mjs pull update-world-machine-indicators --dry-run
  powershell -ExecutionPolicy Bypass -File .\\invoke-inbox-ingest.ps1 -DryRun
  node run.mjs kb ingest --file ./article.md --kind article
  node run.mjs kb query --query "What is the energy regime?" --save

Run "node run.mjs <group> --help" for group detail.

Note: Legacy flat commands (sector-scan, thesis-fmp-sync, etc.) still work
      but print a deprecation hint. See 90_System/CLI Command Audit.md.
`);
}

function printStatus() {
  console.log('\nAPI Key Status\n');
  const sources = listSources();
  const maxName = Math.max(...sources.map(s => s.name.length));

  for (const s of sources) {
    const status = s.requiresKey
      ? (s.hasKey ? '[configured]' : '[missing]')
      : '[no key needed]';
    console.log(`  ${s.name.padEnd(maxName + 2)} ${status}`);
  }

  const configured = sources.filter(s => s.hasKey).length;
  console.log(`\n  ${configured}/${sources.length} sources ready\n`);
}

if (command !== 'dashboard') {
  run();
}
