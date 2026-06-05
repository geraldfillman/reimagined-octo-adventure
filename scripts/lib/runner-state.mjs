// State + freshness helpers for routine-runner.mjs.
// Pure functions where possible. Immutable updates: every mutator returns a new state object.

import { readFile, writeFile, mkdir, appendFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname } from 'node:path';

const TTL_MS = Object.freeze({
  'intraday-5m':  5 * 60 * 1000,
  'intraday-30m': 30 * 60 * 1000,
  'intraday-2h':  2 * 60 * 60 * 1000,
  daily:          24 * 60 * 60 * 1000,
  weekday:        24 * 60 * 60 * 1000, // simplified: same as daily, runner skips on weekends if it cares
  weekly:         7 * 24 * 60 * 60 * 1000,
  monthly:        30 * 24 * 60 * 60 * 1000,
  'on-event':     Infinity,             // never auto-pull
  manual:         Infinity,
});

export async function loadState(statePath) {
  const raw = await readFile(statePath, 'utf8');
  return JSON.parse(raw);
}

export async function saveState(statePath, state) {
  const next = { ...state, last_updated: new Date().toISOString() };
  await mkdir(dirname(statePath), { recursive: true });
  await writeFile(statePath, JSON.stringify(next, null, 2) + '\n', 'utf8');
  return next;
}

// Returns 'stale' | 'fresh' | 'unknown-source'.
export function freshnessOf(state, sourceKey, now = new Date()) {
  const entry = state.sources?.[sourceKey];
  if (!entry) return 'unknown-source';
  if (!entry.last_run) return 'stale';
  const ttlMs = TTL_MS[entry.ttl];
  if (ttlMs === undefined) return 'stale';
  if (ttlMs === Infinity) return 'fresh'; // on-event / manual: never auto-pull
  const age = now.getTime() - new Date(entry.last_run).getTime();
  return age >= ttlMs ? 'stale' : 'fresh';
}

// Immutable update of one source's last_run/last_status/last_hash.
export function withSourceResult(state, sourceKey, result) {
  const prev = state.sources?.[sourceKey];
  if (!prev) return state;
  const nextSource = {
    ...prev,
    last_run: result.timestamp,
    last_status: result.status,
    last_hash: result.hash ?? prev.last_hash,
  };
  return {
    ...state,
    sources: { ...state.sources, [sourceKey]: nextSource },
  };
}

// Append a slot summary to slot_history (capped to 200 entries).
export function withSlotHistory(state, summary) {
  const history = [...(state.slot_history ?? []), summary];
  const trimmed = history.length > 200 ? history.slice(-200) : history;
  return {
    ...state,
    last_slot: summary.slot,
    last_run_id: summary.run_id,
    slot_history: trimmed,
  };
}

export async function hashFile(path) {
  try {
    const buf = await readFile(path);
    return createHash('sha256').update(buf).digest('hex').slice(0, 16);
  } catch {
    return null;
  }
}

export async function fileExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

// Append one event line to run-log.md.
export async function appendLog(logPath, fields) {
  const line = [
    fields.timestamp ?? new Date().toISOString(),
    fields.slot ?? '-',
    fields.event,
    fields.target ?? '-',
    fields.status ?? '-',
    fields.note ?? '',
  ].join(' | ');
  await appendFile(logPath, line + '\n', 'utf8');
}

export function newRunId(slot, now = new Date()) {
  return `${slot}-${now.toISOString().replace(/[:.]/g, '-')}`;
}
