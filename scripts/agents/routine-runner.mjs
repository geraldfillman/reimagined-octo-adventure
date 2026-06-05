#!/usr/bin/env node
// Routine Runner — single entry for all 6 daily slots.
// Reads AGENT_RUNBOOK.md indirectly via runner-slots.mjs and FRESHNESS_POLICY.md
// indirectly via _state/run-state.json.
//
// Usage:
//   node scripts/agents/routine-runner.mjs --slot=S1
//   node scripts/agents/routine-runner.mjs --slot=S6 --dry-run
//   node scripts/agents/routine-runner.mjs --slot=auto      # picks slot by clock
//
// Exit codes:
//   0  slot completed (possibly degraded)
//   1  hard failure (state load/save, unknown slot)
//   2  slot did not run (e.g., outside trading day, --no-weekend)

import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pullersForSlot, getSlot, SLOT_ORDER } from '../lib/runner-slots.mjs';
import {
  loadState, saveState, freshnessOf, withSourceResult, withSlotHistory,
  hashFile, fileExists, appendLog, newRunId,
} from '../lib/runner-state.mjs';
import { invokeAgent } from '../lib/runner-synthesis.mjs';
import { applyLedgerUpdates } from '../lib/runner-reconciler.mjs';
import {
  appendPromotionHistory,
  finalizePromotionRecords,
  guardLedgerPromotions,
  loadPromotionHistory,
  POSITIONS_PATH,
} from '../lib/ledger-promotion-guard.mjs';
import {
  LEDGER_PATH,
  writeOutcomeReviewPacket,
} from '../lib/runner-outcome-packets.mjs';

const VAULT_ROOT     = resolve(fileURLToPath(import.meta.url), '../../..');
const STATE_PATH     = join(VAULT_ROOT, '_state', 'run-state.json');
const LOG_PATH       = join(VAULT_ROOT, '_state', 'run-log.md');
const DISPATCHER     = join(VAULT_ROOT, 'scripts', 'run.mjs');

const args = parseArgs(process.argv.slice(2));
main().catch(err => { console.error(err); process.exit(1); });

function parseArgs(argv) {
  const out = { slot: null, dryRun: false, noWeekend: false, llm: null, force: false };
  for (const a of argv) {
    if (a.startsWith('--slot='))     out.slot = a.slice(7);
    else if (a === '--dry-run')      out.dryRun = true;
    else if (a === '--no-weekend')   out.noWeekend = true;
    else if (a.startsWith('--llm=')) out.llm = a.slice(6);
    else if (a === '--force')        out.force = true;
  }
  if (!out.slot) { console.error('Missing --slot=<S1..S6|auto>'); process.exit(1); }
  return out;
}

function resolveAutoSlot(now = new Date()) {
  // Approximate ET → local; user runs on the same box, scheduler triggers at local ET.
  const hhmm = now.getHours() * 100 + now.getMinutes();
  if (hhmm < 730)  return 'S1';
  if (hhmm < 1115) return 'S2';
  if (hhmm < 1400) return 'S3';
  if (hhmm < 1600) return 'S4';
  if (hhmm < 1730) return 'S5';
  return 'S6';
}

async function main() {
  const now = new Date();
  const slotKey = args.slot === 'auto' ? resolveAutoSlot(now) : args.slot;

  if (args.noWeekend) {
    const dow = now.getDay();
    if (dow === 0 || dow === 6) {
      console.log(`[skip] weekend (dow=${dow}); use S8 weekly when implemented`);
      process.exit(2);
    }
  }

  const slot = getSlot(slotKey); // throws if unknown
  const runId = newRunId(slotKey, now);
  const state0 = await loadState(STATE_PATH);
  const persistRun = !args.dryRun;

  if (persistRun) {
    await appendLog(LOG_PATH, {
      slot: slotKey, event: 'slot.start', target: slot.label,
      status: 'live', note: `run_id=${runId}`,
    });
  }

  const pullers = pullersForSlot(slotKey, now);
  const results = [];
  let degraded = false;
  let state = state0;

  for (const puller of pullers) {
    const fresh = args.force ? 'stale' : freshnessOf(state, puller.key, now);
    if (fresh === 'fresh') {
      if (persistRun) {
        await appendLog(LOG_PATH, { slot: slotKey, event: 'source.skipped-fresh', target: puller.key, status: 'ok' });
      }
      results.push({ key: puller.key, status: 'skipped-fresh' });
      continue;
    }
    if (fresh === 'unknown-source') {
      if (persistRun) {
        await appendLog(LOG_PATH, { slot: slotKey, event: 'source.error', target: puller.key, status: 'unknown-source',
                                    note: 'Add to FRESHNESS_POLICY.md and run-state.json' });
      }
      if (puller.tier === 'critical') degraded = true;
      continue;
    }

    if (args.dryRun) {
      results.push({ key: puller.key, status: 'dry-run' });
      continue;
    }

    const outcome = await runPuller(puller);
    const lastPath = outcome.outputPaths?.at(-1) ?? null;
    const hash = lastPath ? await hashFile(lastPath) : null;
    state = withSourceResult(state, puller.key, {
      timestamp: new Date().toISOString(),
      status: outcome.status,
      hash,
    });

    const outputNote = outcome.outputPaths?.length
      ? `outputs=${outcome.outputPaths.length}`
      : '';
    await appendLog(LOG_PATH, {
      slot: slotKey,
      event: outcome.status === 'ok' ? 'source.pulled' : 'source.error',
      target: puller.key,
      status: outcome.status,
      note: outcome.note ?? outputNote,
    });

    if (outcome.status !== 'ok' && puller.tier === 'critical') degraded = true;
    results.push({
      key: puller.key,
      status: outcome.status,
      outputPaths: outcome.outputPaths ?? [],
    });
  }

  // Synthesis pass — invoke domain agents for this slot, if any.
  const synthesisResults = await runSynthesis({
    slotKey, slot, runId, pullerResults: results, dryRun: args.dryRun, prefer: args.llm, persistRun,
  });

  let outcomePacket = null;
  if (slotKey === 'S6' && !args.dryRun) {
    outcomePacket = await writeS6OutcomePacket({ runId });
  }

  const summary = {
    slot: slotKey,
    run_id: runId,
    started: now.toISOString(),
    ended: new Date().toISOString(),
    status: degraded ? 'degraded' : 'ok',
    dry_run: args.dryRun,
    results,
    synthesis: synthesisResults,
    outcome_packet: outcomePacket,
  };
  if (persistRun) {
    state = withSlotHistory(state, summary);
    await saveState(STATE_PATH, state);

    await appendLog(LOG_PATH, {
      slot: slotKey,
      event: degraded ? 'slot.degraded' : 'slot.end',
      target: slot.label,
      status: summary.status,
      note: `pulled=${results.filter(r => r.status === 'ok').length} skipped=${results.filter(r => r.status === 'skipped-fresh').length} errors=${results.filter(r => r.status === 'error').length}`,
    });
  }

  console.log(`[${slotKey}] ${summary.status} (${results.length} sources)`);
  process.exit(0);
}

async function writeS6OutcomePacket({ runId }) {
  try {
    const result = await writeOutcomeReviewPacket({ runId });
    if (result.written) {
      await appendLog(LOG_PATH, {
        slot: 'S6',
        event: 'outcome-packet.written',
        target: 'Market Positioning Ledger',
        status: 'ok',
        note: `eligible=${result.eligible_count} candidates=${result.candidate_count}`,
      });
      return {
        written: true,
        jsonPath: result.jsonPath,
        markdownPath: result.markdownPath,
        eligible_count: result.eligible_count,
        candidate_count: result.candidate_count,
      };
    }
    await appendLog(LOG_PATH, {
      slot: 'S6',
      event: 'outcome-packet.skipped',
      target: 'Market Positioning Ledger',
      status: 'ok',
      note: result.reason,
    });
    return { written: false, reason: result.reason };
  } catch (err) {
    await appendLog(LOG_PATH, {
      slot: 'S6',
      event: 'outcome-packet.error',
      target: 'Market Positioning Ledger',
      status: 'error',
      note: err.message.slice(0, 180),
    });
    return { written: false, reason: `error: ${err.message.slice(0, 180)}` };
  }
}

function runPuller(puller) {
  return new Promise((resolveP) => {
    const cliArgs = puller.args ?? [];
    // Two invocation modes:
    //   direct:true       — spawn the script file directly (for runnable wrappers).
    //   default           — invoke through scripts/run.mjs `pull <key>` so library-style
    //                       pullers (export pull(flags)) actually execute.
    const useDirect = !!puller.direct;
    const scriptPath = useDirect ? join(VAULT_ROOT, puller.script) : DISPATCHER;
    const spawnArgs  = useDirect
      ? [scriptPath, ...cliArgs]
      : [scriptPath, 'pull', puller.key, ...cliArgs];

    fileExists(scriptPath).then(exists => {
      if (!exists) {
        return resolveP({ status: 'error', note: `script-missing: ${useDirect ? puller.script : 'scripts/run.mjs'}`, outputPaths: [] });
      }
      const child = spawn(process.execPath, spawnArgs, {
        cwd: VAULT_ROOT,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let stdout = '', stderr = '';
      child.stdout.on('data', d => { stdout += d.toString(); });
      child.stderr.on('data', d => { stderr += d.toString(); });
      child.on('close', code => {
        if (code === 0) {
          const outputPaths = parseOutputPaths(stdout);
          resolveP({ status: 'ok', outputPaths });
        } else {
          const note = (stderr.split('\n').find(l => l.trim()) || `exit=${code}`).slice(0, 200);
          resolveP({ status: 'error', note, outputPaths: [] });
        }
      });
      child.on('error', err => resolveP({ status: 'error', note: err.message, outputPaths: [] }));
    });
  });
}

async function runSynthesis({ slotKey, slot, runId, pullerResults, dryRun, prefer, persistRun = true }) {
  const agents = slot.synthesisAgents ?? [];
  if (!agents.length) return [];

  // Collect output paths from successful pullers (relative to vault root) for the agent context.
  const outputPaths = pullerResults
    .filter(r => r.status === 'ok' && r.outputPaths?.length)
    .flatMap(r => r.outputPaths)
    .map(abs => abs.startsWith(VAULT_ROOT) ? abs.slice(VAULT_ROOT.length + 1).split('\\').join('/') : abs);

  const results = [];
  for (const agent of agents) {
    if (dryRun) {
      if (persistRun) {
        await appendLog(LOG_PATH, {
          slot: slotKey, event: 'synthesis.skipped', target: agent, status: 'dry-run',
        });
      }
      results.push({ agent, status: 'dry-run' });
      continue;
    }

    const outcome = await invokeAgent({
      agent,
      slot: { key: slotKey, label: slot.label },
      runId,
      outputPaths,
      prefer,
    });

    await appendLog(LOG_PATH, {
      slot: slotKey,
      event: outcome.status === 'ok'
        ? 'synthesis.completed'
        : outcome.status === 'skipped-no-llm' ? 'synthesis.skipped' : 'synthesis.error',
      target: agent,
      status: outcome.status,
      note: outcome.note ?? '',
    });

    const entry = {
      agent,
      status: outcome.status,
      outputs: outcome.outputs?.length ?? 0,
      provider: outcome.provider ?? null,
    };

    // Ledger reconciliation — gated by slot.mayMutateLedger and agent identity.
    if (slot.mayMutateLedger && agent === 'Positioning Agent' && outcome.status === 'ok') {
      const candidates = outcome.data?.gate_delta_candidates ?? [];
      if (candidates.length) {
        const recon = await reconcileGuardedLedgerCandidates({ candidates, runId, agent });
        await appendLog(LOG_PATH, {
          slot: slotKey,
          event: recon.applied.length ? 'ledger.updated' : 'ledger.proposed',
          target: 'Market Positioning Ledger',
          status: 'ok',
          note: `applied=${recon.applied.length} skipped=${recon.skipped.length}`,
        });
        entry.ledger_applied = recon.applied.length;
        entry.ledger_skipped = recon.skipped.length;
        entry.ledger_guard_blocked = recon.guard_blocked ?? 0;
        if (recon.checklist_status) entry.checklist_status = recon.checklist_status;
      }
    }

    results.push(entry);
  }
  return results;
}

async function reconcileGuardedLedgerCandidates({ candidates, runId, agent }) {
  const ledgerMarkdown = await readFile(LEDGER_PATH(), 'utf8');
  const positionsMarkdown = await readFile(POSITIONS_PATH(), 'utf8').catch(() => '');
  const promotionHistory = await loadPromotionHistory();
  const liveRefutation = /^(1|true|yes)$/i.test(process.env.REFUTATION_LIVE || '');

  const guard = await guardLedgerPromotions({
    candidates,
    ledgerMarkdown,
    positionsMarkdown,
    promotionHistory,
    runId,
    agent,
    liveRefutation,
  });

  let recon = { applied: [], skipped: [], path: LEDGER_PATH() };
  if (guard.allowed.length) {
    recon = await applyLedgerUpdates({ candidates: guard.allowed, runId, agent });
  }
  recon.skipped = [...guard.blocked, ...(recon.skipped ?? [])];
  recon.guard_blocked = guard.blocked.length;

  let checklistPath = null;
  const appliedGate3 = (recon.applied ?? []).filter(item => Number(item.to_gate) === 3);
  if (appliedGate3.length) {
    const checklist = await runPuller({
      key: 'positioning-checklist',
      script: 'scripts/pullers/positioning-checklist.mjs',
      args: ['--preset=workbook-core'],
    });
    recon.checklist_status = checklist.status;
    checklistPath = checklist.outputPaths?.[0] ?? null;
    await appendLog(LOG_PATH, {
      slot: 'S6',
      event: checklist.status === 'ok' ? 'checklist.generated' : 'checklist.error',
      target: 'positioning-checklist',
      status: checklist.status,
      note: checklistPath ? `output=${checklistPath}` : (checklist.note ?? ''),
    });
  }

  const records = finalizePromotionRecords({
    guardRecords: guard.records,
    reconciliation: recon,
    checklistPath,
  });
  await appendPromotionHistory(records);
  return recon;
}

// Convention: pullers print `OUTPUT: <relative path>` for each file written.
// Emitted automatically by lib/markdown.mjs::writeNote.
function parseOutputPaths(stdout) {
  const paths = [];
  for (const line of stdout.split('\n')) {
    const m = line.match(/^OUTPUT:\s*(.+)$/);
    if (m) paths.push(join(VAULT_ROOT, m[1].trim()));
  }
  return paths;
}
