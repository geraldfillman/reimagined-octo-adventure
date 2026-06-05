import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

import { readFolder } from '../lib/frontmatter.mjs';
import { getPullsDir } from '../lib/config.mjs';
import {
  getCadencePolicy,
  getDefaultPolicyPath,
  loadReadinessPolicy,
} from '../lib/readiness-policy.mjs';

const STATUS_RANK = { READY: 0, WARN: 1, BLOCKED: 2 };

export async function evaluateReadiness({
  cadence = 'daily',
  now = new Date(),
  policyPath = getDefaultPolicyPath(),
  pullsRoot = getPullsDir(),
} = {}) {
  const policy = await loadReadinessPolicy(policyPath);
  const cadencePolicy = getCadencePolicy(policy, cadence);
  const notes = await readFolder(pullsRoot, true);
  const asOf = toDate(now);
  const nowDateKey = dateKey(now, asOf);
  const items = cadencePolicy.inputs.map(input => evaluateInput(input, cadencePolicy, notes, asOf, nowDateKey));
  const status = items.reduce((current, item) => (
    STATUS_RANK[item.status] > STATUS_RANK[current] ? item.status : current
  ), 'READY');

  return {
    cadence,
    status,
    as_of: asOf.toISOString(),
    items,
  };
}

export function formatReadinessText(result) {
  const lines = [`${result.status} data readiness for ${result.cadence}`];
  for (const item of result.items) {
    if (item.status === 'READY') {
      lines.push(`READY ${item.label}: ${item.latest?.date_pulled || 'fresh'}`);
      continue;
    }
    const age = Number.isFinite(item.age_hours) ? ` (${item.age_hours.toFixed(1)}h old)` : '';
    lines.push(`${item.status} ${item.label}: ${item.reason}${age}`);
    if (item.refresh_command) {
      lines.push(`  refresh: ${item.refresh_command}`);
    }
  }
  return lines.join('\n');
}

export async function run(flags = process.argv.slice(2)) {
  const options = Array.isArray(flags) ? parseArgs(flags) : { ...flags };
  const write = options.write || (line => console.log(line));
  const result = await evaluateReadiness({
    cadence: options.cadence || 'daily',
    now: options.now,
    policyPath: options.policyPath,
    pullsRoot: options.pullsRoot,
  });

  if (options.json) {
    write(JSON.stringify(result, null, 2));
  } else {
    write(formatReadinessText(result));
  }

  if (result.status === 'BLOCKED' && !options.staleOk && !options.allowStale) {
    process.exitCode = 1;
  }
  return result;
}

function evaluateInput(input, cadencePolicy, notes, now, nowDateKey) {
  const latest = findLatestMatch(notes, input.match || {});
  const staleAfterHours = Number(input.stale_after_hours);
  const base = {
    id: input.id,
    label: input.label || input.id,
    required: input.required !== false,
    stale_after_hours: staleAfterHours,
    refresh_command: input.refresh_command || '',
    latest,
  };

  if (!latest) {
    return {
      ...base,
      status: severityFor(input, cadencePolicy),
      reason: 'missing',
      age_hours: null,
    };
  }

  const ageHours = latest.granularity === 'day'
    ? calendarDayDiff(nowDateKey, latest.date_key) * 24
    : (now.getTime() - toDate(latest.date_pulled).getTime()) / 36e5;
  if (Number.isFinite(staleAfterHours) && ageHours > staleAfterHours) {
    return {
      ...base,
      status: severityFor(input, cadencePolicy),
      reason: 'stale',
      age_hours: ageHours,
    };
  }

  return {
    ...base,
    status: 'READY',
    reason: 'fresh',
    age_hours: ageHours,
  };
}

function findLatestMatch(notes, match) {
  let latest = null;
  for (const note of notes) {
    if (!matchesNote(note.data, match)) continue;
    const pulled = getPulledAt(note.data);
    if (!pulled) continue;
    const candidate = {
      title: note.data.title || note.filename,
      path: note.path,
      date_pulled: pulled.raw,
      date_key: pulled.dateKey,
      granularity: pulled.granularity,
      domain: note.data.domain || '',
      data_type: note.data.data_type || '',
      source: note.data.source || '',
      puller: note.data.puller || note.data.puller_id || '',
    };
    if (!latest || pulled.date.getTime() > toDate(latest.date_pulled).getTime()) {
      latest = candidate;
    }
  }
  return latest;
}

function matchesNote(data, match) {
  return Object.entries(match).every(([key, expected]) => {
    const expectedValue = normalize(expected);
    return fieldValues(data, key).some(value => normalize(value) === expectedValue);
  });
}

function fieldValues(data, key) {
  if (key === 'puller') return [data.puller, data.puller_id, data.source, data.source_id];
  if (key === 'source') return [data.source, data.source_id, data.provider, data.puller, data.puller_id];
  if (key === 'data_type') return [data.data_type, data.type];
  return [data[key]];
}

function severityFor(input, cadencePolicy) {
  if (input.required === false) return 'WARN';
  if (input.severity) return String(input.severity).toUpperCase();
  return cadencePolicy.stale_required === 'warn' ? 'WARN' : 'BLOCKED';
}

function getPulledAt(data) {
  for (const key of ['date_pulled', 'pulled_at', 'last_updated', 'updated_at', 'date']) {
    const value = data[key];
    if (!value) continue;
    const raw = String(value);
    const parsed = toDate(raw);
    if (!Number.isNaN(parsed.getTime())) {
      const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(raw);
      return {
        date: parsed,
        raw,
        dateKey: raw.slice(0, 10),
        granularity: isDateOnly ? 'day' : 'time',
      };
    }
  }
  return null;
}

function toDate(value) {
  return value instanceof Date ? value : new Date(value);
}

function dateKey(raw, date) {
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const value = date instanceof Date ? date : toDate(raw);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calendarDayDiff(leftKey, rightKey) {
  const left = Date.parse(`${leftKey}T00:00:00Z`);
  const right = Date.parse(`${rightKey}T00:00:00Z`);
  if (!Number.isFinite(left) || !Number.isFinite(right)) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.floor((left - right) / 86_400_000));
}

function normalize(value) {
  return String(value ?? '').trim().toLowerCase();
}

function parseArgs(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--cadence') options.cadence = args[++i];
    else if (arg === '--policy') options.policyPath = args[++i];
    else if (arg === '--pulls-root') options.pullsRoot = args[++i];
    else if (arg === '--json') options.json = true;
    else if (arg === '--stale-ok' || arg === '--allow-stale') options.staleOk = true;
  }
  return options;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath && invokedPath === fileURLToPath(import.meta.url)) {
  await run();
}
