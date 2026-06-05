/**
 * run-envelope.mjs — Per-puller result normalization and run-summary writer.
 *
 * Defines the canonical envelope shape returned from every puller invocation:
 *   { ok, name, wrote, skipped, errors, durationMs }
 *
 * Pullers return heterogeneous shapes; normalizeEnvelope() wraps whatever a
 * puller returns into the standard envelope without mutating the original.
 *
 * writeRunSummary() writes a markdown summary to:
 *   <ReportsVaultRoot>/Reports/System/run_summaries/YYYY-MM-DD_HH-MM.md
 */

import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { getReviewVaultRoot } from './config.mjs';

// ── Envelope shape ────────────────────────────────────────────────────────────

/**
 * Build a clean envelope from parts. Immutable — returns a frozen object.
 *
 * @param {object} parts
 * @param {string}   parts.name        — puller name (e.g. "signal-intelligence")
 * @param {boolean}  parts.ok          — true if no errors
 * @param {string[]} parts.wrote       — file paths written
 * @param {string[]} parts.skipped     — items skipped
 * @param {Array<{message:string,stack?:string}>} parts.errors
 * @param {number}   parts.durationMs  — wall-clock ms
 * @returns {Readonly<object>}
 */
export function makeEnvelope({
  name,
  ok,
  wrote,
  skipped,
  errors,
  durationMs,
  warnings = [],
  reason = '',
  readinessStatus = '',
  refreshCommands = [],
  artifacts = [],
}) {
  return Object.freeze({
    name: String(name),
    ok: Boolean(ok),
    wrote: Array.isArray(wrote) ? [...wrote] : [],
    skipped: Array.isArray(skipped) ? [...skipped] : [],
    errors: Array.isArray(errors) ? [...errors] : [],
    durationMs: typeof durationMs === 'number' ? durationMs : 0,
    warnings: Array.isArray(warnings) ? [...warnings] : [],
    reason: String(reason || ''),
    readinessStatus: String(readinessStatus || ''),
    refreshCommands: Array.isArray(refreshCommands) ? [...refreshCommands] : [],
    artifacts: Array.isArray(artifacts) ? [...artifacts] : [],
  });
}

/**
 * Wrap a puller's raw return value (or a caught error) into an envelope.
 *
 * Pullers can return anything — an object with {filePath, wrote[], errors[]},
 * undefined, or throw. This function normalises all cases without mutating
 * the puller's original result.
 *
 * @param {string}  name        — puller name
 * @param {unknown} raw         — puller return value (may be undefined/null)
 * @param {Error|null} caughtErr — set if the puller threw; null otherwise
 * @param {number}  durationMs  — elapsed time
 * @returns {Readonly<object>}
 */
export function normalizeEnvelope(name, raw, caughtErr, durationMs) {
  // Puller threw — wrap the error.
  if (caughtErr) {
    const serialized = serializeError(caughtErr);
    return makeEnvelope({
      name,
      ok: false,
      wrote: [],
      skipped: [],
      errors: [serialized],
      durationMs,
      reason: serialized.message,
      refreshCommands: extractRefreshCommands(serialized.message),
    });
  }

  // Puller returned nothing — treat as success with no files.
  if (raw == null) {
    return makeEnvelope({ name, ok: true, wrote: [], skipped: [], errors: [], durationMs });
  }

  // Extract known fields from the raw result (immutably).
  const rawErrors = Array.isArray(raw.errors) ? raw.errors.map(serializeError) : [];
  const rawWrote = collectWrote(raw);
  const rawSkipped = Array.isArray(raw.skipped) ? [...raw.skipped] : [];
  const warnings = Array.isArray(raw.warnings) ? raw.warnings.map(String) : [];
  const readinessStatus = raw.readinessStatus || raw.readiness?.status || raw.readiness?.status_text || '';
  const refreshCommands = collectRefreshCommands(raw, rawErrors);
  const artifacts = collectArtifacts(raw, rawWrote);

  const ok = rawErrors.length === 0 && raw.ok !== false;

  return makeEnvelope({
    name,
    ok,
    wrote: rawWrote,
    skipped: rawSkipped,
    errors: rawErrors,
    durationMs,
    warnings,
    reason: raw.reason || raw.status_reason || '',
    readinessStatus,
    refreshCommands,
    artifacts,
  });
}

// ── Run summary writer ────────────────────────────────────────────────────────

/**
 * Write a run summary markdown file to the active reports vault.
 *
 * Path: <ReportsVaultRoot>/Reports/System/run_summaries/YYYY-MM-DD_HH-MM.md
 *
 * @param {ReadonlyArray<object>} envelopes — array of makeEnvelope() results
 * @param {object} [options]
 * @param {string} [options.label]  — optional run label (e.g. cadence name)
 * @param {Date}   [options.date]   — override timestamp (default: now)
 * @returns {string} — absolute path of the written file
 */
export function writeRunSummary(envelopes, options = {}) {
  const date = options.date instanceof Date ? options.date : new Date();
  const stamp = formatStamp(date);
  const isoDate = date.toISOString().slice(0, 10);
  const label = options.label ?? 'multi-puller run';

  const dir = join(getReviewVaultRoot(), 'Reports', 'System', 'run_summaries');
  const filePath = join(dir, `${stamp}.md`);

  const content = buildSummaryMarkdown({ envelopes, stamp, isoDate, label });

  mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, content, 'utf-8');

  return filePath;
}

// ── Markdown builder ──────────────────────────────────────────────────────────

function buildSummaryMarkdown({ envelopes, stamp, isoDate, label }) {
  const totalOk = envelopes.filter(e => e.ok).length;
  const totalErr = envelopes.filter(e => !e.ok).length;
  const totalMs = envelopes.reduce((sum, e) => sum + e.durationMs, 0);

  const frontmatter = [
    '---',
    `type: run_summary`,
    `date: ${isoDate}`,
    `label: "${label}"`,
    `total_pullers: ${envelopes.length}`,
    `ok: ${totalOk}`,
    `errors: ${totalErr}`,
    `duration_ms: ${totalMs}`,
    '---',
  ].join('\n');

  const tableHeader = '| Puller | Status | Wrote | Errors | Duration |';
  const tableSep    = '| --- | --- | --- | --- | --- |';
  const tableRows = envelopes.map(e => {
    const status = e.ok ? 'ok' : 'FAILED';
    const wrote  = e.wrote.length;
    const errors = e.errors.length;
    const dur    = `${(e.durationMs / 1000).toFixed(1)}s`;
    return `| ${e.name} | ${status} | ${wrote} | ${errors} | ${dur} |`;
  });

  const table = [tableHeader, tableSep, ...tableRows].join('\n');

  const errorSections = envelopes
    .filter(e => !e.ok && e.errors.length > 0)
    .map(e => {
      const errBlocks = e.errors.map((err, i) => {
        const stack = err.stack ? `\n\`\`\`\n${err.stack}\n\`\`\`` : '';
        return `**Error ${i + 1}:** ${err.message}${stack}`;
      }).join('\n\n');
      return `### ${e.name}\n\n${errBlocks}`;
    });

  const parts = [
    frontmatter,
    '',
    `# Run Summary — ${stamp}`,
    '',
    `**Label:** ${label}  `,
    `**Result:** ${totalErr === 0 ? 'All ok' : `${totalErr} failed`} (${totalOk}/${envelopes.length} ok)  `,
    `**Total duration:** ${(totalMs / 1000).toFixed(1)}s`,
    '',
    '## Puller Results',
    '',
    table,
  ];

  if (errorSections.length > 0) {
    parts.push('', '## Error Details', '', ...errorSections);
  }

  parts.push('');
  return parts.join('\n');
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Serialize an Error (or plain string/object) into {message, stack?}.
 * Immutable — never mutates the input.
 */
function serializeError(err) {
  if (err instanceof Error) {
    return { message: err.message, stack: err.stack ?? null };
  }
  if (err && typeof err === 'object' && 'message' in err) {
    return { message: String(err.message), stack: err.stack ?? null };
  }
  return { message: String(err), stack: null };
}

/**
 * Collect "wrote" paths from a heterogeneous puller result.
 * Handles: result.wrote[], result.filePath, result.files[].
 * Immutable — never mutates raw.
 */
function collectWrote(raw) {
  if (Array.isArray(raw.wrote)) return [...raw.wrote];

  const paths = [];
  if (typeof raw.filePath === 'string') paths.push(raw.filePath);
  if (typeof raw.sidecarPath === 'string') paths.push(raw.sidecarPath);
  if (Array.isArray(raw.files)) {
    for (const f of raw.files) {
      if (typeof f === 'string') paths.push(f);
      else if (f && typeof f.path === 'string') paths.push(f.path);
    }
  }
  return paths;
}

function collectArtifacts(raw, wrote) {
  const artifacts = new Set(wrote);
  for (const key of ['artifact', 'path', 'summaryPath', 'reportPath', 'watchlistPath']) {
    if (typeof raw[key] === 'string') artifacts.add(raw[key]);
  }
  if (Array.isArray(raw.artifacts)) {
    for (const item of raw.artifacts) {
      if (typeof item === 'string') artifacts.add(item);
    }
  }
  if (Array.isArray(raw.outputs)) {
    for (const item of raw.outputs) {
      if (typeof item === 'string') artifacts.add(item);
      else if (item && typeof item.path === 'string') artifacts.add(item.path);
    }
  }
  return Array.from(artifacts);
}

function collectRefreshCommands(raw, errors) {
  const commands = [];
  const explicit = raw.refreshCommands || raw.refresh_commands;
  if (Array.isArray(explicit)) commands.push(...explicit.map(String));

  for (const err of errors) {
    commands.push(...extractRefreshCommands(err.message));
  }

  return Array.from(new Set(commands.filter(Boolean)));
}

function extractRefreshCommands(text) {
  const commands = [];
  for (const match of String(text || '').matchAll(/^\s*refresh:\s*(.+?)\s*$/gm)) {
    const command = match[1].trim();
    if (command) commands.push(command);
  }
  return commands;
}

/**
 * Format a Date as YYYY-MM-DD_HH-MM.
 */
function formatStamp(date) {
  const pad = n => String(n).padStart(2, '0');
  return [
    date.getFullYear(),
    '-', pad(date.getMonth() + 1),
    '-', pad(date.getDate()),
    '_', pad(date.getHours()),
    '-', pad(date.getMinutes()),
  ].join('');
}
