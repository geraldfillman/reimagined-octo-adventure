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
 *
 * Legacy flat aliases were retired 2026-08 (they now print the grouped
 * replacement and exit). Flat puller names still resolve via the dynamic
 * fallthrough (used by task-orb.ps1 and dashboard run-buttons).
 * Run "node run.mjs help" for a full overview.
 */

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

  // Raw args after subcommand are forwarded as-is to grouped handlers.
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

// ── Retired-command tombstones ─────────────────────────────────────────────────

const RETIRED_ALIASES = {
  'status': 'system status',
  'validate': 'system validate',
  'learning-session': 'learn session',
  'cleanup': 'system cleanup',
  'infranodus': 'system infranodus',
  'dashboard': 'system dashboard',
  'conviction-delta': 'scan conviction',
  'thesis-fmp-sync': 'thesis sync',
  'thesis-catalysts': 'thesis catalysts',
  'thesis-full-picture': 'thesis full-picture',
};

if (RETIRED_ALIASES[command]) {
  console.error(`Removed: "${command}" — use "node run.mjs ${RETIRED_ALIASES[command]}" instead.`);
  process.exit(1);
}

if (command === 'qlib') {
  console.error('Qlib has been retired from this vault. Reinstall or restore it only when a concrete quant use case returns.');
  process.exit(1);
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
  routine   Daily, weekly, monthly, quarterly, yearly pull cadences
  kb        Knowledge base pipeline (ingest → normalize → classify → compile → query)
  edgar     Company Intel: dossier scaffold, filing baseline, XBRL financial skeleton

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
  node run.mjs routine daily --dry-run
  node run.mjs kb ingest --file ./article.md --kind article
  node run.mjs kb query --query "What is the energy regime?" --save
  node run.mjs edgar baseline --ticker NVDA

Run "node run.mjs <group> --help" for group detail.

Note: Legacy flat aliases (thesis-fmp-sync, conviction-delta, etc.) were
      retired — the CLI prints the grouped replacement if you use one.
`);
}

run();
