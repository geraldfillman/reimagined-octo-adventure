/**
 * agent-interactions.mjs - Vault-native agent message/thread contract.
 *
 * This module intentionally has no TradingAgents runtime dependency. It stores
 * interaction sidecars and renders durable Obsidian pull notes.
 */

import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getPullsDir } from './config.mjs';
import { buildNote, buildTable, today, writeNote } from './markdown.mjs';

export const VALID_MESSAGE_TYPES = Object.freeze(['observation', 'challenge', 'handoff', 'decision']);
export const VALID_SIGNAL_STATUSES = Object.freeze(['clear', 'watch', 'alert', 'critical']);
export const VALID_THREAD_STATUSES = Object.freeze(['resolved', 'unresolved']);

const STATUS_RANK = Object.freeze({ clear: 0, watch: 1, alert: 2, critical: 3 });
const THREAD_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.cache', 'orchestrator', 'agent-threads');

export function normalizeAgentMessage(input = {}) {
  const runId = requiredString(input.run_id, 'run_id');
  const fromAgent = requiredString(input.from_agent, 'from_agent');
  const topic = requiredString(input.topic, 'topic');
  const summary = requiredString(input.summary, 'summary');
  const messageType = normalizeEnum(input.message_type || 'observation', VALID_MESSAGE_TYPES, 'message_type');
  const signalStatus = normalizeEnum(input.signal_status || 'clear', VALID_SIGNAL_STATUSES, 'signal_status');
  const threadId = String(input.thread_id || `${runId}_${slugify(topic)}`);

  return Object.freeze({
    message_id: String(input.message_id || `${threadId}_${slugify(fromAgent)}_${slugify(messageType)}_${shortHash(summary)}`),
    run_id: runId,
    thread_id: threadId,
    from_agent: fromAgent,
    to_agent: String(input.to_agent || 'orchestrator'),
    message_type: messageType,
    topic,
    summary,
    evidence_paths: normalizeStringArray(input.evidence_paths, 8),
    confidence: clamp(Number(input.confidence ?? 0), 0, 1),
    signal_status: signalStatus,
    created_at: normalizeIso(input.created_at),
  });
}

export function messageFromLedgerEntry(entry = {}, { runId, includeClear = false } = {}) {
  const status = String(entry.status || '').toLowerCase();
  const signalStatus = String(entry.signal_status || 'clear').toLowerCase();
  const activeSignal = ['watch', 'alert', 'critical'].includes(signalStatus);
  const failed = status === 'failed' || status === 'blocked';

  if (!failed && !activeSignal && !includeClear) return null;

  const agentId = String(entry.agent_id || entry.agentId || 'unknown');
  const agentName = String(entry.agent_name || entry.agentName || agentId);
  const puller = String(entry.puller || 'unknown-puller');
  const topic = topicFromLedgerEntry(entry);
  const artifact = entry.artifact ? [String(entry.artifact)] : [];
  const messageType = failed ? 'challenge' : 'observation';
  const toAgent = Array.isArray(entry.handoff_to) && entry.handoff_to.length
    ? String(entry.handoff_to[0])
    : 'orchestrator';
  const summary = failed
    ? `${agentName} ${puller} ${status || 'failed'}: ${entry.error || 'no error detail'}`
    : `${agentName} ${puller} produced ${signalStatus} evidence${entry.artifact ? ` at ${entry.artifact}` : ''}.`;

  return normalizeAgentMessage({
    run_id: runId || entry.run_id || 'orchestrator-run',
    from_agent: agentId,
    to_agent: toAgent,
    message_type: messageType,
    topic,
    summary,
    evidence_paths: artifact,
    confidence: entry.confidence ?? confidenceForStatus(failed ? 'watch' : signalStatus),
    signal_status: failed ? 'watch' : signalStatus,
    created_at: entry.recorded_at,
  });
}

export function messagesFromLedger(ledger = {}, options = {}) {
  const runId = options.runId || ledger.run_id || 'orchestrator-run';
  return (ledger.entries || [])
    .map(entry => messageFromLedgerEntry(entry, { ...options, runId }))
    .filter(Boolean);
}

export function buildAgentThread({
  run_id,
  date = today(),
  topic,
  messages = [],
  decision = null,
  thread_id = null,
} = {}) {
  const normalized = messages.map(message => normalizeAgentMessage({ ...message, run_id: message.run_id || run_id }));
  const runId = run_id || normalized[0]?.run_id || 'orchestrator-run';
  const resolvedTopic = topic || normalized[0]?.topic || 'Agent interaction';
  const resolvedThreadId = thread_id || normalized[0]?.thread_id || `${runId}_${slugify(resolvedTopic)}`;
  const participants = unique(normalized.flatMap(message => [message.from_agent, message.to_agent]).filter(Boolean));
  const worst = worstSignalStatus(normalized.map(message => message.signal_status));
  const status = decision?.status || (normalized.some(message => message.message_type === 'challenge') ? 'unresolved' : 'resolved');

  if (!VALID_THREAD_STATUSES.includes(status)) {
    throw new Error(`Invalid thread status: ${status}`);
  }

  return Object.freeze({
    thread_id: resolvedThreadId,
    run_id: runId,
    date,
    topic: resolvedTopic,
    participants,
    phase: decision ? 'decide' : 'collect',
    status,
    signal_status: decision?.rating || worst,
    messages: normalized,
    decision,
  });
}

export function renderAgentThreadNote(thread) {
  const messageRows = thread.messages.map(message => [
    message.from_agent,
    message.to_agent,
    message.message_type,
    message.signal_status,
    formatConfidence(message.confidence),
    message.summary,
  ]);
  const evidenceRows = unique(thread.messages.flatMap(message => message.evidence_paths || []))
    .map(path => [path]);

  return buildNote({
    frontmatter: {
      title: `Agent Thread: ${thread.topic}`,
      source: 'Vault Orchestrator',
      date_pulled: thread.date,
      domain: 'orchestrator',
      data_type: 'agent_thread',
      frequency: 'ad hoc',
      run_id: thread.run_id,
      thread_id: thread.thread_id,
      thread_status: thread.status,
      phase: thread.phase,
      participant_count: thread.participants.length,
      signal_status: thread.signal_status,
      signals: thread.signal_status === 'clear' ? [] : ['agent-interaction-review'],
      participants: thread.participants,
      tags: ['agent-thread', 'orchestrator', 'agent-interaction'],
    },
    sections: [
      {
        heading: 'Thread Summary',
        content: [
          `- **Topic**: ${thread.topic}`,
          `- **Status**: ${thread.status}`,
          `- **Participants**: ${thread.participants.join(', ') || 'N/A'}`,
          '- **Execution rail**: Research and manual review only. No broker-write action is generated.',
        ].join('\n'),
      },
      {
        heading: 'Decision',
        content: thread.decision
          ? [
            `- **Type**: ${thread.decision.decision_type}`,
            `- **Rating**: ${thread.decision.rating}`,
            `- **Owner**: ${thread.decision.owner}`,
            `- **Rationale**: ${thread.decision.rationale}`,
            '- **Action items**:',
            ...thread.decision.action_items.map(item => `  - ${item}`),
          ].join('\n')
          : '_No decision recorded._',
      },
      {
        heading: 'Agent Messages',
        content: messageRows.length
          ? buildTable(['From', 'To', 'Type', 'Signal', 'Confidence', 'Summary'], messageRows)
          : '_No messages recorded._',
      },
      {
        heading: 'Evidence',
        content: evidenceRows.length
          ? buildTable(['Path'], evidenceRows)
          : '_No evidence paths were attached._',
      },
    ],
  });
}

export async function emitAgentThreads(threads = [], { dryRun = false, replaceDate = false } = {}) {
  if (!threads.length) {
    if (!dryRun && replaceDate) await clearAgentThreadSidecars(today());
    return [];
  }
  const emitted = [];

  if (!dryRun) await mkdir(THREAD_DIR, { recursive: true });

  if (!dryRun && replaceDate) {
    const dates = [...new Set(threads.map(thread => thread.date || today()))];
    for (const date of dates) await clearAgentThreadSidecars(date);
  }

  for (const thread of threads) {
    const normalized = buildAgentThread(thread);
    const note = renderAgentThreadNote(normalized);
    const notePath = join(getPullsDir(), 'Orchestrator', `${normalized.date}_Agent_Thread_${slugify(normalized.topic)}.md`);
    const sidecarPath = join(THREAD_DIR, `${normalized.date}_${slugify(normalized.thread_id)}.json`);

    const sidecar = { ...normalized, note_path: notePath, emitted_at: new Date().toISOString() };

    if (dryRun) {
      console.log(note);
    } else {
      await writeFile(sidecarPath, JSON.stringify(sidecar, null, 2), 'utf-8');
      writeNote(notePath, note);
    }

    emitted.push({ ...sidecar, note_path: dryRun ? null : notePath, sidecar_path: dryRun ? null : sidecarPath });
  }

  return emitted;
}

export async function clearAgentThreadSidecars(date = today()) {
  if (!existsSync(THREAD_DIR)) return 0;
  const files = (await readdir(THREAD_DIR))
    .filter(file => file.endsWith('.json') && file.startsWith(`${date}_`));
  let removed = 0;
  for (const file of files) {
    await unlink(join(THREAD_DIR, file));
    removed += 1;
  }
  return removed;
}

export async function loadAgentThreads(date = today()) {
  if (!existsSync(THREAD_DIR)) return [];
  const files = (await readdir(THREAD_DIR))
    .filter(file => file.endsWith('.json') && file.startsWith(`${date}_`))
    .sort();
  const threads = [];
  for (const file of files) {
    try {
      threads.push(JSON.parse(await readFile(join(THREAD_DIR, file), 'utf-8')));
    } catch {
      // Ignore malformed sidecars; the report should remain readable.
    }
  }
  return threads;
}

export async function loadLatestAgentThreads({ date = today(), limit = 8 } = {}) {
  const threads = await loadAgentThreads(date);
  return threads
    .sort((a, b) =>
      (STATUS_RANK[String(b.signal_status || 'clear').toLowerCase()] ?? 0) -
      (STATUS_RANK[String(a.signal_status || 'clear').toLowerCase()] ?? 0) ||
      String(a.topic).localeCompare(String(b.topic))
    )
    .slice(0, limit);
}

export function worstSignalStatus(statuses = []) {
  return statuses.reduce((worst, status) => {
    const normalized = VALID_SIGNAL_STATUSES.includes(String(status).toLowerCase())
      ? String(status).toLowerCase()
      : 'clear';
    return STATUS_RANK[normalized] > STATUS_RANK[worst] ? normalized : worst;
  }, 'clear');
}

function topicFromLedgerEntry(entry) {
  if (entry.topic) return String(entry.topic);
  if (entry.artifact) {
    const file = String(entry.artifact).split(/[\\/]/).pop() || '';
    return file
      .replace(/\.md$/i, '')
      .replace(/^\d{4}-\d{2}-\d{2}_/, '')
      .replace(/_/g, ' ')
      .trim() || String(entry.puller || 'agent output');
  }
  return `${entry.agent_name || entry.agent_id || 'Agent'} ${entry.puller || 'output'}`;
}

function requiredString(value, name) {
  const text = String(value || '').trim();
  if (!text) throw new Error(`${name} is required`);
  return text;
}

function normalizeEnum(value, allowed, name) {
  const text = String(value || '').trim().toLowerCase();
  if (!allowed.includes(text)) throw new Error(`Invalid ${name}: ${value}`);
  return text;
}

function normalizeStringArray(values, limit) {
  return (Array.isArray(values) ? values : values ? [values] : [])
    .map(value => String(value || '').trim())
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeIso(value) {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function confidenceForStatus(status) {
  return { clear: 0.1, watch: 0.45, alert: 0.7, critical: 0.9 }[status] ?? 0.25;
}

function formatConfidence(value) {
  return `${Math.round(clamp(Number(value) || 0, 0, 1) * 100)}%`;
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function unique(values) {
  return [...new Set(values.map(value => String(value || '').trim()).filter(Boolean))];
}

function slugify(value) {
  return String(value || 'agent-thread')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'agent-thread';
}

function shortHash(value) {
  let hash = 0;
  const text = String(value || '');
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36).slice(0, 8);
}
