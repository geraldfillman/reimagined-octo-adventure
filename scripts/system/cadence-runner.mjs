/**
 * cadence-runner.mjs - Scheduled review/analysis cadence orchestrator
 *
 * Loads cadences.json and runs the declared puller list for a named cadence.
 * Each puller is dynamic-imported from scripts/pullers/<name>.mjs and called
 * with pull(flags). Failures are isolated per puller; one error does not stop
 * the rest.
 *
 * Commands:
 *   list              Print all cadence names and descriptions.
 *   show <name>       Print the review/analysis puller list for a cadence.
 *   run  <name>       Execute all review/analysis pullers in a cadence sequentially.
 *
 * Options (run only):
 *   --dry-run         Print what would run without importing or calling pullers.
 *   --json            Emit machine-readable summary to stdout on completion.
 *   --skip-summary    Do not write a run_summaries file.
 *   --allow-stale     Continue after BLOCKED readiness only with explicit approval.
 *
 * Exit codes:
 *   0  All pullers succeeded (or dry-run).
 *   1  One or more pullers failed.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { normalizeEnvelope, writeRunSummary } from '../lib/run-envelope.mjs';
import { evaluateReadiness, formatReadinessText } from './readiness.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CADENCES_PATH = join(__dirname, '..', '..', '99_System', 'config', 'cadences.json');
const PULLERS_DIR   = join(__dirname, '..', 'pullers');

// ── Config loader ─────────────────────────────────────────────────────────────

function loadCadences() {
  let raw;
  try {
    raw = readFileSync(CADENCES_PATH, 'utf-8');
  } catch (err) {
    throw new Error(`Cannot read cadences config at ${CADENCES_PATH}: ${err.message}`);
  }
  const parsed = JSON.parse(raw);
  if (!parsed.cadences || typeof parsed.cadences !== 'object') {
    throw new Error('cadences.json must have a top-level "cadences" object.');
  }
  return parsed.cadences;
}

// ── Subcommand handlers ───────────────────────────────────────────────────────

function cmdList() {
  const cadences = loadCadences();
  const names = Object.keys(cadences);
  if (names.length === 0) {
    console.log('No cadences defined in cadences.json.');
    return;
  }
  const maxLen = Math.max(...names.map(n => n.length));
  console.log('\nCadences (edit 99_System/config/cadences.json to change):\n');
  for (const name of names) {
    const desc = cadences[name].description ?? '';
    console.log(`  ${name.padEnd(maxLen + 2)} ${desc}`);
  }
  console.log('');
}

function cmdShow(name) {
  if (!name) {
    console.error('Error: cadence show requires a cadence name. Example: node run.mjs cadence show daily');
    process.exit(1);
  }
  const cadences = loadCadences();
  const cadence  = cadences[name];
  if (!cadence) {
    console.error(`Error: Unknown cadence "${name}". Run "node run.mjs cadence list" to see all cadences.`);
    process.exit(1);
  }

  console.log(`\nCadence: ${name}`);
  console.log(`Description: ${cadence.description ?? '(none)'}`);
  console.log(`\nPullers (${cadence.pullers?.length ?? 0}):\n`);
  for (const entry of cadence.pullers ?? []) {
    const argsStr = (entry.args ?? []).join(' ') || '(no args)';
    console.log(`  ${entry.name}  ${argsStr}`);
  }
  console.log('');
}

async function cmdRun(name, flags) {
  if (!name) {
    console.error('Error: cadence run requires a cadence name. Example: node run.mjs cadence run daily');
    process.exit(1);
  }

  const cadences = loadCadences();
  const cadence  = cadences[name];
  if (!cadence) {
    console.error(`Error: Unknown cadence "${name}". Run "node run.mjs cadence list" to see all cadences.`);
    process.exit(1);
  }

  const pullers   = cadence.pullers ?? [];
  const isDryRun  = Boolean(flags['dry-run']);
  const isJson    = Boolean(flags.json);
  const skipSummary = Boolean(flags['skip-summary']);

  if (!isJson) {
    console.log(`\n[cadence] ${name} — ${pullers.length} puller(s)${isDryRun ? ' (dry-run)' : ''}`);
  }

  if (isDryRun) {
    console.log('\nWould run:');
    for (const entry of pullers) {
      const argsStr = (entry.args ?? []).join(' ') || '(no args)';
      console.log(`  ${entry.name}  ${argsStr}`);
    }
    console.log('');
    return;
  }

  const readiness = await evaluateReadiness({ cadence: name });
  const readinessDecision = classifyReadinessForCadence(readiness, flags);

  if (isJson) {
    if (readinessDecision.blocked) {
      console.log(JSON.stringify({
        cadence: name,
        ok: false,
        reason: readinessDecision.reason,
        readiness,
        pullers: [],
      }, null, 2));
      process.exitCode = 1;
      return;
    }
  } else {
    console.log('\n[readiness]');
    console.log(formatReadinessText(readiness));
    if (readinessDecision.override) {
      console.log('[readiness] stale override accepted via --allow-stale / --stale-ok');
    }
    if (readinessDecision.blocked) {
      console.error('\n[cadence] blocked by readiness. Refresh the listed inputs or rerun with --allow-stale if the stale-data run is explicitly approved.');
      process.exitCode = 1;
      return;
    }
  }

  const envelopes = [];

  for (const entry of pullers) {
    const pullerName = entry.name;
    const pullerArgs = entry.args ?? [];

    // Build a flags object from the puller's declared args list.
    // Declared args use "--key=value" or "--flag" form.
    const pullerFlags = parsePullerArgs(pullerArgs);

    const t0 = Date.now();
    let raw       = null;
    let caughtErr = null;

    if (!isJson) {
      console.log(`\n[run] ${pullerName}${pullerArgs.length ? '  ' + pullerArgs.join(' ') : ''}`);
    }

    try {
      const modulePath = pathToFileURL(join(PULLERS_DIR, `${pullerName}.mjs`)).href;
      let mod;
      try {
        mod = await import(modulePath);
      } catch (importErr) {
        if (importErr.code === 'ERR_MODULE_NOT_FOUND') {
          throw new Error(`Puller "${pullerName}" not found at scripts/pullers/${pullerName}.mjs`);
        }
        throw importErr;
      }

      if (typeof mod.pull !== 'function') {
        throw new Error(`Puller "${pullerName}" does not export a pull() function.`);
      }

      raw = await mod.pull(pullerFlags);
    } catch (err) {
      caughtErr = err;
      if (!isJson) {
        console.error(`  FAILED [${pullerName}]: ${err.message}`);
        if (process.env.DEBUG) console.error(err.stack);
      }
    }

    const envelope = normalizeEnvelope(pullerName, raw, caughtErr, Date.now() - t0);
    envelopes.push(envelope);

    if (!isJson) {
      const statusLine = envelope.ok
        ? `  [ok] wrote=${envelope.wrote.length} skipped=${envelope.skipped.length} (${(envelope.durationMs / 1000).toFixed(1)}s)`
        : `  [error] ${envelope.errors.map(e => e.message).join('; ')}`;
      console.log(statusLine);
    }
  }

  // Write run summary unless --skip-summary.
  let summaryPath = null;
  if (!skipSummary) {
    try {
      summaryPath = writeRunSummary(envelopes, { label: `cadence:${name}` });
      if (!isJson) {
        console.log(`\n[run-summary] ${summaryPath}`);
      }
    } catch (err) {
      if (!isJson) {
        console.warn(`[run-summary] Could not write summary: ${err.message}`);
      }
    }
  }

  const okCount  = envelopes.filter(e => e.ok).length;
  const anyFailed = envelopes.some(e => !e.ok);
  const totalMs  = envelopes.reduce((sum, e) => sum + e.durationMs, 0);

  if (isJson) {
    console.log(JSON.stringify({
      cadence: name,
      ok: !anyFailed,
      okCount,
      total: envelopes.length,
      durationMs: totalMs,
      summaryPath,
      readiness,
      readinessDecision,
      pullers: envelopes,
    }, null, 2));
  } else {
    const elapsed = (totalMs / 1000).toFixed(1);
    console.log(`\n[done] ${okCount}/${envelopes.length} ok in ${elapsed}s`);
  }

  if (anyFailed) {
    process.exitCode = 1;
  }
}

// ── Arg parsing ───────────────────────────────────────────────────────────────

/**
 * Convert a puller's declared args array (["--scope=all", "--dry-run"]) into
 * a flags object compatible with what run.mjs passes to pull().
 * Immutable — returns a new object each time.
 */
export function classifyReadinessForCadence(result, flags = {}) {
  const status = String(result?.status || '').toUpperCase();
  const cadence = String(result?.cadence || '').toLowerCase();
  const override = Boolean(flags['allow-stale'] || flags.allowStale || flags['stale-ok'] || flags.staleOk);

  if (status === 'BLOCKED') {
    return {
      blocked: !override,
      reason: override ? 'readiness-override' : 'readiness-blocked',
      override,
      warning: false,
      policyAllowedWarn: false,
    };
  }

  if (status === 'WARN') {
    return {
      blocked: false,
      reason: 'readiness-warning',
      override: false,
      warning: true,
      policyAllowedWarn: cadence === 'midday',
    };
  }

  return {
    blocked: false,
    reason: 'readiness-ready',
    override: false,
    warning: false,
    policyAllowedWarn: false,
  };
}

function parsePullerArgs(args) {
  const flags = {};
  for (const arg of args) {
    if (!arg.startsWith('--')) continue;
    const body = arg.slice(2);
    const eqIdx = body.indexOf('=');
    if (eqIdx >= 0) {
      flags[body.slice(0, eqIdx)] = body.slice(eqIdx + 1);
    } else {
      flags[body] = true;
    }
  }
  return flags;
}

// ── Public entry point ────────────────────────────────────────────────────────

/**
 * Main entry point called by the router.
 *
 * @param {string}  sub   — 'list' | 'show' | 'run'
 * @param {string}  name  — cadence name (for show/run)
 * @param {object}  flags — parsed CLI flags
 */
export async function run(sub, name, flags = {}) {
  switch (sub) {
    case 'list':
      cmdList();
      return;
    case 'show':
      cmdShow(name);
      return;
    case 'run':
      await cmdRun(name, flags);
      return;
    default:
      printHelp();
      if (sub && sub !== 'help') {
        console.error(`\nError: Unknown cadence subcommand "${sub}".`);
        process.exit(1);
      }
  }
}

function printHelp() {
  console.log(`
cadence - Scheduled review/analysis cadence orchestrator

Commands:
  list              Print all cadences and descriptions
  show <name>       Print the review/analysis puller list for a cadence
  run  <name>       Execute all review/analysis pullers in a cadence

Options (run only):
  --dry-run         Print what would run without calling pullers
  --json            Emit machine-readable JSON summary
  --skip-summary    Skip writing the run_summaries file
  --allow-stale     Continue after BLOCKED readiness only with explicit approval

Cadences are declared in:
  99_System/config/cadences.json

Examples:
  node run.mjs cadence list
  node run.mjs cadence show daily
  node run.mjs cadence run premarket --dry-run
  node run.mjs cadence run daily
  node run.mjs cadence run eod --json
`);
}
