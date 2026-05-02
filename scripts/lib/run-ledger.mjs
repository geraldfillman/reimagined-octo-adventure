/**
 * run-ledger.mjs — Workflow run ledger writer and reader.
 *
 * Each orchestrated run produces two artifacts:
 *   - JSON: scripts/.cache/orchestrator/run-ledgers/YYYY-MM-DD.json
 *   - Vault note: 05_Data_Pulls/Orchestrator/YYYY-MM-DD_Run_Ledger.md
 *
 * The ledger records per-agent, per-puller execution status, timing, artifacts,
 * and any blocking issues. streamline-report.mjs reads it to populate
 * agent_handoffs[] in the sidecar.
 */

import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getPullsDir } from './config.mjs';
import { buildNote, buildTable, today, writeNote } from './markdown.mjs';

const LEDGER_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..', '.cache', 'orchestrator', 'run-ledgers'
);

// ─── Factory ─────────────────────────────────────────────────────────────────

/**
 * Create a new empty ledger object for the given run.
 *
 * @param {{ runId: string, date: string, cadence?: string }} options
 * @returns {object}
 */
export function createLedger({ runId, date, cadence = 'daily' }) {
  return {
    ledger_version: 1,
    run_id: runId,
    date,
    cadence,
    started_at: new Date().toISOString(),
    completed_at: null,
    total_duration_ms: null,
    agent_count: 0,
    success_count: 0,
    failed_count: 0,
    blocked_count: 0,
    entries: [],
  };
}

/**
 * Record a single puller execution into the ledger (mutates in place).
 *
 * @param {object} ledger
 * @param {{ agentId, agentName, puller, status, artifact, signalStatus, confidence, durationMs, blockingIssues, handoffTo, error }} entry
 * @returns {void}
 */
export function recordEntry(ledger, {
  agentId,
  agentName,
  puller,
  status,          // 'success' | 'failed' | 'blocked' | 'skipped'
  artifact = null, // vault-relative path to the note written
  signalStatus = 'clear',
  confidence = null,
  durationMs = null,
  blockingIssues = [],
  handoffTo = [],
  error = null,
}) {
  ledger.entries.push({
    agent_id: agentId,
    agent_name: agentName,
    puller,
    status,
    artifact,
    signal_status: signalStatus,
    confidence,
    duration_ms: durationMs,
    blocking_issues: blockingIssues,
    handoff_to: handoffTo,
    error: error ? String(error).slice(0, 200) : null,
    recorded_at: new Date().toISOString(),
  });

  ledger.agent_count = new Set(ledger.entries.map(e => e.agent_id)).size;
  ledger.success_count = ledger.entries.filter(e => e.status === 'success').length;
  ledger.failed_count  = ledger.entries.filter(e => e.status === 'failed').length;
  ledger.blocked_count = ledger.entries.filter(e => e.status === 'blocked').length;
}

/**
 * Finalize the ledger (record end time and total duration).
 * @param {object} ledger
 */
export function finalizeLedger(ledger) {
  ledger.completed_at = new Date().toISOString();
  const start = new Date(ledger.started_at).getTime();
  const end   = new Date(ledger.completed_at).getTime();
  ledger.total_duration_ms = end - start;
}

// ─── Persistence ─────────────────────────────────────────────────────────────

/**
 * Write the ledger JSON sidecar and a human-readable vault note.
 *
 * @param {object} ledger
 * @param {{ dryRun?: boolean }} options
 */
export async function emitLedger(ledger, { dryRun = false } = {}) {
  const note = buildLedgerNote(ledger);

  if (dryRun) {
    console.log(note);
    return;
  }

  // JSON sidecar
  await mkdir(LEDGER_DIR, { recursive: true });
  await writeFile(
    join(LEDGER_DIR, `${ledger.date}.json`),
    JSON.stringify(ledger, null, 2),
    'utf-8'
  );

  // Vault markdown note
  const notePath = join(getPullsDir(), 'Orchestrator', `${ledger.date}_Run_Ledger.md`);
  writeNote(notePath, note);
  console.log(`Run Ledger: wrote ${notePath}`);
}

/**
 * Load the latest run ledger JSON, or null if none exists.
 *
 * @returns {Promise<object|null>}
 */
export async function loadLatestLedger() {
  if (!existsSync(LEDGER_DIR)) return null;
  try {
    const files = (await readdir(LEDGER_DIR))
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse();
    if (!files.length) return null;
    return JSON.parse(await readFile(join(LEDGER_DIR, files[0]), 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * Load a run ledger for a specific date, or null.
 *
 * @param {string} date — YYYY-MM-DD
 * @returns {Promise<object|null>}
 */
export async function loadLedger(date) {
  const filePath = join(LEDGER_DIR, `${date}.json`);
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(await readFile(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

// ─── Note builder ────────────────────────────────────────────────────────────

export function buildLedgerNote(ledger) {
  const overallStatus =
    ledger.failed_count >= 3 ? 'alert' :
    ledger.failed_count >= 1 ? 'watch' : 'clear';

  const rows = ledger.entries.map(e => [
    e.agent_name ?? e.agent_id,
    e.puller,
    e.status,
    e.signal_status ?? '—',
    e.duration_ms != null ? `${(e.duration_ms / 1000).toFixed(1)}s` : '—',
    e.artifact ? e.artifact.replace(/^.*05_Data_Pulls\//, '') : '—',
    [
      ...(e.blocking_issues ?? []),
      e.error ? `Error: ${e.error}` : null,
    ].filter(Boolean).join('; ') || '—',
  ]);

  const duration = ledger.total_duration_ms != null
    ? `${(ledger.total_duration_ms / 1000).toFixed(1)}s`
    : 'in progress';

  return buildNote({
    frontmatter: {
      title:         'Run Ledger',
      source:        'Vault Orchestrator',
      date_pulled:   ledger.date,
      domain:        'orchestrator',
      data_type:     'run_ledger',
      frequency:     ledger.cadence || 'ad hoc',
      run_id:        ledger.run_id,
      cadence:       ledger.cadence,
      agent_count:   ledger.agent_count,
      success_count: ledger.success_count,
      failed_count:  ledger.failed_count,
      blocked_count: ledger.blocked_count,
      signal_status: overallStatus,
      signals:       overallStatus === 'clear' ? [] : ['run-ledger-review'],
      tags:          ['run-ledger', 'orchestrator', 'agent-status'],
    },
    sections: [
      {
        heading: 'Run Summary',
        content: [
          `**Run ID**: ${ledger.run_id}`,
          `**Started**: ${ledger.started_at}`,
          `**Duration**: ${duration}`,
          `**Agents**: ${ledger.agent_count} | **Success**: ${ledger.success_count} | **Failed**: ${ledger.failed_count} | **Blocked**: ${ledger.blocked_count}`,
        ].join('\n'),
      },
      {
        heading: 'Agent Run Log',
        content: rows.length
          ? buildTable(
              ['Agent', 'Puller', 'Status', 'Signal', 'Duration', 'Artifact', 'Issues'],
              rows
            )
          : '_No entries recorded._',
      },
    ],
  });
}
