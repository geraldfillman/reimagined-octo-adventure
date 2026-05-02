/**
 * agent-run.mjs — Orchestrated multi-agent daily run.
 *
 * Reads 16_Agents/agent-manifest.json, resolves execution order via topological
 * sort (orchestrator always runs last), runs each agent's daily pullers, records
 * timing and status in a run ledger, then runs streamline-report to produce
 * the day's decision brief.
 *
 * The run ledger JSON is written to:
 *   scripts/.cache/orchestrator/run-ledgers/YYYY-MM-DD.json
 *
 * A vault note is written to:
 *   05_Data_Pulls/Orchestrator/YYYY-MM-DD_Run_Ledger.md
 *
 * Usage:
 *   node run.mjs pull agent-run
 *   node run.mjs pull agent-run --agents market,macro,fundamentals
 *   node run.mjs pull agent-run --cadence weekly
 *   node run.mjs pull agent-run --dry-run
 *   node run.mjs pull agent-run --skip-report
 *   node run.mjs pull agent-run --interactions --skip-llm
 */

import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { buildInteractionThreads } from '../lib/agent-debate-engine.mjs';
import { emitAgentThreads, messagesFromLedger } from '../lib/agent-interactions.mjs';
import { resolveRunOrder } from '../lib/agent-registry.mjs';
import { today } from '../lib/markdown.mjs';
import {
  createLedger,
  emitLedger,
  finalizeLedger,
  recordEntry,
} from '../lib/run-ledger.mjs';

const PULLERS_DIR = resolve(dirname(fileURLToPath(import.meta.url)));
const MAX_RETRIES  = 1;

// Pullers to run per agent in the default daily automated run.
// If an agent has a `daily_pullers` field in the manifest, that takes precedence.
const DEFAULT_DAILY_PULLERS = {
  market:       ['cboe', 'entropy-monitor', 'dilution-monitor', 'auction-features', 'pead-watch', 'pair-metrics'],
  macro:        ['fred', 'macro-volatility'],
  thesis:       ['convergence-scan', 'opportunity-viewpoints'],
  fundamentals: [],              // cash-flow-quality is quarterly data — runs in weekly/quarterly cadence
  biotech:      ['clinicaltrials', 'fda'],
  government:   ['openfema', 'federalregister'],
  housing:      ['nahb'],
  energy:       ['eia'],
  research:     ['arxiv'],
  sectors:      ['sector-scan'],
  osint:        [],          // manual only — excluded from automated runs
  vc:           ['capital-raise'],
  news:         ['newsapi', 'gdelt'],
  positioning:  [],
  legal:        [],          // weekly manual — excluded from daily automated runs
  orchestrator: ['agent-analyst', 'streamline-report', 'confluence-scan'], // always last
};

const DEFAULT_PULLER_FLAGS = Object.freeze({
  fda: Object.freeze({ 'recent-approvals': true }),
  openfema: Object.freeze({ recent: true }),
  federalregister: Object.freeze({ 'faa-uas': true }),
  nahb: Object.freeze({ 'builder-confidence': true }),
});

export async function pull(flags = {}) {
  const cadence   = String(flags.cadence ?? 'daily');
  const dryRun    = Boolean(flags['dry-run']);
  const skipReport = Boolean(flags['skip-report']);
  const interactions = Boolean(flags.interactions || flags['agent-interactions']);

  const agentFilter = flags.agents
    ? String(flags.agents).split(',').map(s => s.trim()).filter(Boolean)
    : null;

  const runId  = `orchestrator-${cadence}-${today()}`;
  const ledger = createLedger({ runId, date: today(), cadence });

  console.log(`\nAgent Run: ${runId}`);
  console.log(`Mode: ${dryRun ? 'dry-run' : 'live'} | Cadence: ${cadence}`);

  const allAgents = await resolveRunOrder(agentFilter);
  // Always ensure orchestrator runs last; separate it from specialist agents
  const specialists   = allAgents.filter(a => a.id !== 'orchestrator');
  const orchestrator  = allAgents.find(a => a.id === 'orchestrator');

  const failedAgents = new Set();
  let interactionsEmitted = false;
  let interactionThreadCount = 0;
  let unresolvedInteractionCount = 0;

  async function emitInteractionsOnce() {
    if (!interactions || interactionsEmitted) return;
    const messages = messagesFromLedger(ledger);
    const threads = buildInteractionThreads({ runId, date: today(), messages });
    const emitted = await emitAgentThreads(threads, { dryRun, replaceDate: true });
    interactionThreadCount = emitted.length;
    unresolvedInteractionCount = emitted.filter(thread => thread.status === 'unresolved').length;
    interactionsEmitted = true;
    console.log(`\nAgent Interactions: ${interactionThreadCount} thread(s), ${unresolvedInteractionCount} unresolved.`);
  }

  // ── Run specialist agents ──────────────────────────────────────────────────
  for (const agent of specialists) {
    const pullers = getPullersForAgent(agent, cadence);
    if (!pullers.length) {
      console.log(`\n[${agent.name}] — no daily pullers configured, skipping.`);
      continue;
    }

    // Check if any blocking dependency failed
    const blockedBy = (agent.depends_on ?? []).filter(dep => failedAgents.has(dep));
    if (blockedBy.length > 0) {
      console.log(`\n[${agent.name}] — blocked by failed dependencies: ${blockedBy.join(', ')}`);
      for (const puller of pullers) {
        recordEntry(ledger, {
          agentId: agent.id, agentName: agent.name, puller,
          status: 'blocked', blockingIssues: blockedBy,
          handoffTo: agent.handoff_to ?? [],
        });
      }
      if (agent.blocking) failedAgents.add(agent.id);
      continue;
    }

    console.log(`\n[${agent.name}] running ${pullers.length} puller(s): ${pullers.join(', ')}`);

    for (const puller of pullers) {
      const entry = await runPuller(puller, flags, agent);
      recordEntry(ledger, {
        agentId: agent.id, agentName: agent.name, puller,
        status: entry.status,
        artifact: entry.artifact,
        signalStatus: entry.signalStatus,
        confidence: entry.confidence,
        durationMs: entry.durationMs,
        blockingIssues: entry.blockingIssues,
        handoffTo: agent.handoff_to ?? [],
        error: entry.error,
      });

      if (entry.status === 'failed' && agent.blocking) {
        failedAgents.add(agent.id);
        console.log(`  [${puller}] marked agent as blocking-failed`);
        break;
      }
    }
  }

  // ── Run orchestrator (streamline-report) ──────────────────────────────────
  if (!skipReport && orchestrator) {
    const orchPullers = getPullersForAgent(orchestrator, cadence);
    console.log(`\n[Orchestrator] running: ${orchPullers.join(', ')}`);

    for (const puller of orchPullers) {
      if (shouldEmitInteractionsBeforePuller(puller, interactions)) {
        await emitInteractionsOnce();
      }

      const entry = await runPuller(puller, { ...flags, ledger_run_id: runId }, orchestrator);
      recordEntry(ledger, {
        agentId: 'orchestrator', agentName: 'Orchestrator Agent', puller,
        status: entry.status,
        artifact: entry.artifact,
        signalStatus: entry.signalStatus,
        durationMs: entry.durationMs,
        blockingIssues: entry.blockingIssues,
        handoffTo: [],
        error: entry.error,
      });
    }
  } else if (skipReport) {
    console.log('\n[Orchestrator] skipped (--skip-report)');
  }

  // ── Finalize and emit ledger ───────────────────────────────────────────────
  finalizeLedger(ledger);

  await emitInteractionsOnce();

  await emitLedger(ledger, { dryRun });

  const elapsed = ((ledger.total_duration_ms ?? 0) / 1000).toFixed(1);
  console.log(`\nAgent Run complete: ${ledger.success_count} success, ${ledger.failed_count} failed, ${ledger.blocked_count} blocked (${elapsed}s)`);

  return {
    runId,
    successCount: ledger.success_count,
    failedCount:  ledger.failed_count,
    blockedCount: ledger.blocked_count,
    totalDurationMs: ledger.total_duration_ms,
    interactionThreadCount,
    unresolvedInteractionCount,
  };
}

// ─── Puller executor ─────────────────────────────────────────────────────────

async function runPuller(pullerName, flags, agent) {
  const pullerPath = pathToFileURL(join(PULLERS_DIR, `${pullerName}.mjs`)).href;
  let attempts = 0;

  while (attempts <= MAX_RETRIES) {
    const start = Date.now();
    try {
      const mod = await import(pullerPath);
      if (typeof mod.pull !== 'function') {
        return { status: 'skipped', artifact: null, signalStatus: 'clear', durationMs: 0, blockingIssues: [`${pullerName}.mjs has no export async function pull()`], error: null };
      }

      const result = await mod.pull(resolvePullerFlags(pullerName, flags, agent));
      const durationMs = Date.now() - start;

      if (attempts > 0) console.log(`  [${pullerName}] succeeded on retry ${attempts}`);

      return {
        status: 'success',
        artifact: result?.filePath ?? null,
        signalStatus: result?.signal_status ?? result?.overallStatus ?? 'clear',
        confidence: result?.confidence ?? null,
        durationMs,
        blockingIssues: [],
        error: null,
      };
    } catch (err) {
      const durationMs = Date.now() - start;
      attempts++;

      if (attempts <= MAX_RETRIES) {
        console.warn(`  [${pullerName}] failed (attempt ${attempts}/${MAX_RETRIES + 1}), retrying — ${err.message}`);
      } else {
        console.error(`  [${pullerName}] failed after ${MAX_RETRIES + 1} attempt(s): ${err.message}`);
        return {
          status: 'failed',
          artifact: null,
          signalStatus: 'clear',
          confidence: null,
          durationMs,
          blockingIssues: [],
          error: err.message,
        };
      }
    }
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getPullersForAgent(agent, cadence) {
  const defaults = DEFAULT_DAILY_PULLERS[agent.id] ?? [];

  // For non-daily cadences, run all listed pullers (weekly, monthly runs need full coverage).
  if (cadence !== 'daily') {
    return agent.pullers ?? defaults;
  }

  // Agent manifest may define daily_pullers explicitly
  if (Array.isArray(agent.daily_pullers)) return agent.daily_pullers;

  return defaults;
}

export function resolvePullerFlags(pullerName, flags = {}, agent = {}) {
  const resolved = { ...flags };
  const defaults = DEFAULT_PULLER_FLAGS[pullerName] ?? {};

  for (const [key, value] of Object.entries(defaults)) {
    if (!Object.prototype.hasOwnProperty.call(resolved, key)) {
      resolved[key] = value;
    }
  }

  if (pullerName === 'streamline-report' && (resolved.interactions || resolved['agent-interactions'])) {
    resolved['include-interactions'] = true;
  }

  if (agent?.id) resolved.agent_id = resolved.agent_id ?? agent.id;
  return resolved;
}

export function shouldEmitInteractionsBeforePuller(pullerName, interactions) {
  return Boolean(interactions && pullerName === 'streamline-report');
}
