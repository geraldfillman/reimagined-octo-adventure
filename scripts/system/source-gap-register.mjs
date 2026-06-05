/**
 * source-gap-register.mjs - Build the World_Machine Source Gap Register.
 *
 * Reads <ReviewVaultRoot>/Reports/System/run_summaries/*.md, aggregates failed
 * pullers, extracts readiness refresh commands, and writes:
 *   <ReviewVaultRoot>/Reports/Source Gap Register.md
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getReviewVaultRoot } from '../lib/config.mjs';

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

function computeSeverity(failureCount, ageDays) {
  if (failureCount >= 5 || ageDays >= 7) return 'critical';
  if (failureCount >= 3 || ageDays >= 3) return 'high';
  if (failureCount >= 2) return 'medium';
  return 'low';
}

function dateFromFilename(filename) {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function parsePullerRows(content) {
  const rows = [];
  for (const line of content.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').map(cell => cell.trim()).filter(Boolean);
    if (cells.length < 2) continue;

    const [name, status] = cells;
    if (!name || name.toLowerCase() === 'puller' || name === '---') continue;
    if (status === '---') continue;

    rows.push({ name, status: normalizeStatus(status) });
  }
  return rows;
}

function parseErrorSections(content) {
  const sections = new Map();
  const matches = Array.from(content.matchAll(/^###\s+(.+?)\s*$/gm));

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const name = match[1].trim();
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? content.length;
    const body = content.slice(start, end).trim();
    if (body) sections.set(name, body);
  }

  return sections;
}

function normalizeStatus(status) {
  const value = String(status || '').trim().toLowerCase();
  if (value === 'failed' || value.includes('failed') || value.includes('error')) return 'failed';
  if (value === 'ok' || value.includes('ok')) return 'ok';
  return value;
}

export function extractRefreshCommands(text) {
  const commands = [];
  for (const match of String(text || '').matchAll(/^\s*refresh:\s*(.+?)\s*$/gm)) {
    const command = match[1].trim();
    if (command && !commands.includes(command)) commands.push(command);
  }
  return commands;
}

export function summarizeError(text) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && line !== '```' && !line.startsWith('at '));

  const cleaned = lines
    .slice(0, 6)
    .map(line => line.replace(/^\*\*Error\s+\d+:\*\*\s*/i, ''))
    .join(' ');

  return cleaned.length > 240 ? `${cleaned.slice(0, 237)}...` : cleaned;
}

export function buildGapRecords(summariesDir, { now = new Date() } = {}) {
  if (!existsSync(summariesDir)) {
    console.warn(`[source-gap-register] WARNING: run_summaries dir not found: ${summariesDir}`);
    return [];
  }

  const files = readdirSync(summariesDir)
    .filter(file => file.endsWith('.md'))
    .sort();

  const byPuller = new Map();

  for (const filename of files) {
    const runDate = dateFromFilename(filename);
    if (!runDate) continue;

    const content = readFileSync(join(summariesDir, filename), 'utf-8');
    const rows = parsePullerRows(content);
    const errorSections = parseErrorSections(content);

    for (const row of rows) {
      const existing = byPuller.get(row.name) || {
        puller: row.name,
        failure_count: 0,
        first_failed: null,
        last_seen: null,
        last_success: null,
        latest_error: '',
        refresh_commands: [],
      };

      if (row.status === 'ok') {
        existing.last_success = maxDate(existing.last_success, runDate);
        byPuller.set(row.name, existing);
        continue;
      }

      if (row.status !== 'failed') continue;

      const section = errorSections.get(row.name) || '';
      existing.failure_count += 1;
      existing.first_failed = minDate(existing.first_failed, runDate);
      existing.last_seen = maxDate(existing.last_seen, runDate);
      existing.latest_error = summarizeError(section) || existing.latest_error;
      existing.refresh_commands = mergeUnique(existing.refresh_commands, extractRefreshCommands(section));
      byPuller.set(row.name, existing);
    }
  }

  const today = now.toISOString().slice(0, 10);
  return Array.from(byPuller.values())
    .filter(record => record.failure_count > 0)
    .map(record => {
      const ageDays = Math.max(0, Math.round((new Date(today) - new Date(record.first_failed)) / 86_400_000));
      return Object.freeze({
        ...record,
        age_days: ageDays,
        severity: computeSeverity(record.failure_count, ageDays),
      });
    })
    .sort((a, b) => {
      const severityDiff = SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
      if (severityDiff !== 0) return severityDiff;
      return b.age_days - a.age_days;
    });
}

function buildRegisterMarkdown(records, updatedAt) {
  const frontmatter = ['---', 'type: source_gap_register', `updated: ${updatedAt}`, '---'].join('\n');

  const rows = records.map(record => [
    record.puller,
    record.failure_count,
    record.first_failed,
    record.last_seen,
    record.last_success || 'none',
    record.age_days,
    record.severity,
    record.refresh_commands.length ? record.refresh_commands.map(command => `\`${command}\``).join('<br>') : 'none',
    record.latest_error || 'none',
  ]);

  return [
    frontmatter,
    '',
    '# Source Gap Register',
    '',
    records.length
      ? mdTable(['Puller', 'Failures', 'First Failed', 'Last Seen', 'Last Success', 'Age (days)', 'Severity', 'Refresh Commands', 'Latest Error'], rows)
      : '_No failed pullers found in run summaries._',
    '',
  ].join('\n');
}

export async function run(flags = {}) {
  const dryRun = Boolean(flags['dry-run'] ?? flags.dryRun);
  const reviewRoot = getReviewVaultRoot();
  if (!reviewRoot) {
    throw new Error('[source-gap-register] reports vault root is not set and no default resolved.');
  }

  const summariesDir = join(reviewRoot, 'Reports', 'System', 'run_summaries');
  const records = buildGapRecords(summariesDir);
  const updatedAt = new Date().toISOString().slice(0, 10);
  const content = buildRegisterMarkdown(records, updatedAt);
  const outPath = join(reviewRoot, 'Reports', 'Source Gap Register.md');

  if (dryRun) {
    console.log(`[source-gap-register] DRY RUN - would write to: ${outPath}\n`);
    console.log(content);
    return { records, path: outPath, dryRun: true };
  }

  mkdirSync(join(reviewRoot, 'Reports'), { recursive: true });
  writeFileSync(outPath, content, 'utf-8');

  console.log(`[source-gap-register] Wrote ${records.length} gap record(s) -> ${outPath}`);
  if (records.length > 0) {
    const bySeverity = Object.fromEntries(
      SEVERITY_ORDER.map(severity => [severity, records.filter(record => record.severity === severity).length])
    );
    console.log('[source-gap-register] Severity breakdown:', bySeverity);
  }

  return { records, path: outPath, dryRun: false };
}

function mdTable(headers, rows) {
  const head = `| ${headers.join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map(row => `| ${row.map(escapeCell).join(' | ')} |`);
  return [head, sep, ...body].join('\n');
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function minDate(left, right) {
  if (!left) return right;
  return left < right ? left : right;
}

function maxDate(left, right) {
  if (!left) return right;
  return left > right ? left : right;
}

function mergeUnique(left, right) {
  const merged = [...left];
  for (const item of right) {
    if (!merged.includes(item)) merged.push(item);
  }
  return merged;
}
