#!/usr/bin/env node
/**
 * phase-c-refresh.mjs — Force-refresh every critical-tier puller across all slots.
 *
 * Orchestrates the runner to fire S1, S2, S4, S5, S6 in sequence with --force --llm=none.
 * Synthesis is deferred to Phase D (regime-bootstrap.mjs) so we get a clean evidence base
 * before any agent reads it.
 *
 * Usage:
 *   node scripts/agents/phase-c-refresh.mjs              # run all 5 slots
 *   node scripts/agents/phase-c-refresh.mjs --slots=S1,S6 # run a subset
 *   node scripts/agents/phase-c-refresh.mjs --dry-run    # show what would run
 */

import { spawn } from 'node:child_process';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const VAULT_ROOT = resolve(fileURLToPath(import.meta.url), '../../..');
const RUNNER     = join(VAULT_ROOT, 'scripts', 'agents', 'routine-runner.mjs');

const DEFAULT_SLOTS = ['S1', 'S2', 'S4', 'S5', 'S6'];

const args = parseArgs(process.argv.slice(2));
main().catch(err => { console.error(err); process.exit(1); });

function parseArgs(argv) {
  const out = { slots: DEFAULT_SLOTS, dryRun: false };
  for (const a of argv) {
    if (a.startsWith('--slots=')) out.slots = a.slice(8).split(',').map(s => s.trim()).filter(Boolean);
    else if (a === '--dry-run')    out.dryRun = true;
  }
  return out;
}

function runSlot(slot) {
  return new Promise(resolveP => {
    const slotArgs = [RUNNER, `--slot=${slot}`, '--force', '--llm=none'];
    const start = Date.now();
    console.log(`\n[phase-c] ▶ ${slot} (${new Date().toISOString()})`);
    const child = spawn(process.execPath, slotArgs, {
      cwd: VAULT_ROOT,
      env: process.env,
      stdio: ['ignore', 'inherit', 'inherit'],
    });
    child.on('close', code => {
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      console.log(`[phase-c] ◀ ${slot} exit=${code} elapsed=${elapsed}s`);
      resolveP({ slot, code, elapsedSec: Number(elapsed) });
    });
    child.on('error', err => {
      console.error(`[phase-c] ${slot} error: ${err.message}`);
      resolveP({ slot, code: -1, error: err.message });
    });
  });
}

async function main() {
  console.log(`Phase C — force refresh of slots: ${args.slots.join(', ')}`);
  console.log(`Runner: ${RUNNER}`);
  if (args.dryRun) {
    for (const s of args.slots) console.log(`[dry-run] would spawn: node ${RUNNER} --slot=${s} --force --llm=none`);
    return;
  }

  const totalStart = Date.now();
  const results = [];
  for (const slot of args.slots) {
    results.push(await runSlot(slot));
  }
  const totalElapsed = ((Date.now() - totalStart) / 1000).toFixed(1);

  console.log('\n[phase-c] Summary:');
  for (const r of results) {
    const status = r.code === 0 ? 'ok' : `FAIL(${r.code})`;
    console.log(`  ${r.slot}: ${status} (${r.elapsedSec ?? '?'}s)${r.error ? ' — ' + r.error : ''}`);
  }
  console.log(`\n[phase-c] Total elapsed: ${totalElapsed}s`);

  const failures = results.filter(r => r.code !== 0);
  if (failures.length) {
    console.log(`\n[phase-c] ${failures.length} slot(s) failed. Inspect _state/run-log.md for source.error entries before running Phase D.`);
    process.exit(2);
  }
  console.log('\n[phase-c] All slots completed. Ready for Phase D (regime-bootstrap).');
}
