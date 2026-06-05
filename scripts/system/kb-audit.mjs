#!/usr/bin/env node
/**
 * kb-audit.mjs — Read-only parity audit between My_Data's 12_Knowledge_Bases/raw/
 * mirrors and the canonical KB vault routed via KB_VAULT_ROOT env var.
 *
 * Reports four sections:
 *   1. Raw → Canonical missing  (files in raw/ not present in canonical)
 *   2. Canonical → Raw orphan   (files in canonical with no matching raw mirror)
 *   3. Hash mismatch            (same relative path, different body content)
 *   4. Internal duplicates      (same category+name under multiple dates in raw/)
 *
 * Writes: 99_System/inventory/kb-audit-YYYYMMDD.md
 * Read-only: never moves, copies, or syncs files.
 *
 * Usage:
 *   node run.mjs system kb-audit
 *   KB_VAULT_ROOT=/path/to/Oy node run.mjs system kb-audit
 *
 * When KB_VAULT_ROOT is unset, only internal raw/ consistency is checked
 * (sections 1, 2, and 3 are skipped; section 4 always runs).
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, posix, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// ── Roots ─────────────────────────────────────────────────────────────────────

const HERE        = dirname(fileURLToPath(import.meta.url));
const ENGINE_ROOT = resolve(HERE, '..', '..');
const RAW_ROOT    = join(ENGINE_ROOT, '12_Knowledge_Bases', 'raw');

// KB_VAULT_ROOT may point to a sibling vault (e.g. "Oy"). When unset, default
// is ENGINE_ROOT itself — meaning the canonical KB tree is ENGINE_ROOT/12_Knowledge_Bases.
// Per AGENTS.md: getKBVaultRoot() returns process.env.KB_VAULT_ROOT || ENGINE_ROOT.
const KB_VAULT_ROOT_ENV = process.env.KB_VAULT_ROOT?.trim() || null;
const CANONICAL_KB_ROOT = KB_VAULT_ROOT_ENV
  ? join(resolve(KB_VAULT_ROOT_ENV), '12_Knowledge_Bases')
  : null;

// ── Utilities ─────────────────────────────────────────────────────────────────

/** Walk a directory tree, returning all .md files. */
function walkMd(root) {
  const out = [];
  const SKIP = new Set(['.obsidian', '.git', '.trash', '.makemd', '.space', 'node_modules']);
  (function recur(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      if (e.name.startsWith('.') && SKIP.has(e.name)) continue;
      if (SKIP.has(e.name)) continue;
      const full = join(dir, e.name);
      if (e.isDirectory()) recur(full);
      else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) out.push(full);
    }
  })(root);
  return out;
}

/** Strip UTF-8 BOM if present. */
function stripBom(text) {
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}

/** Extract body after closing frontmatter `---`. Hash only this. */
function extractBody(raw) {
  const text = stripBom(raw);
  const m = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return m ? text.slice(m[0].length) : text;
}

/** Extract simple frontmatter key-value pairs. */
function parseFrontmatter(raw) {
  const text = stripBom(raw);
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^\s*([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return fm;
}

/** SHA-256 of body text (body-only, so timestamp-only frontmatter diffs don't fire). */
function hashBody(body) {
  return createHash('sha256').update(body, 'utf8').digest('hex');
}

/** Convert absolute path to a posix-normalised key relative to a root. */
function toKey(absPath, root) {
  const rel = relative(root, absPath);
  return posix.normalize(rel.split(sep).join('/'));
}

// ── Build map: key → { absPath, hash, title, date_pulled } ────────────────────

function buildMap(root) {
  const map = new Map();
  if (!existsSync(root)) return map;
  for (const absPath of walkMd(root)) {
    let raw;
    try { raw = readFileSync(absPath, 'utf-8'); }
    catch { continue; }
    const body  = extractBody(raw);
    const fm    = parseFrontmatter(raw);
    const hash  = hashBody(body);
    const key   = toKey(absPath, root);
    map.set(key, { absPath, hash, title: fm.title || '', date_pulled: fm.date_pulled || '' });
  }
  return map;
}

// ── Internal duplicate detection ───────────────────────────────────────────────
// A "duplicate" is multiple files with the same (category, base-name-without-date) pair.
// Pattern: raw/<category>/YYYY-MM-DD_<name>.md
// Key: category + '_' + name-without-leading-date.

function detectInternalDuplicates(rawMap) {
  // fingerprint: category/name_stem → [key, ...]
  const groups = new Map();
  for (const key of rawMap.keys()) {
    // key looks like: articles/2026-01-01_Foo_Bar.md  (posix relative to RAW_ROOT)
    const parts  = key.split('/');
    if (parts.length < 2) continue;
    const category = parts[0];
    const filename  = parts[parts.length - 1]; // last segment
    // Strip leading YYYY-MM-DD_ prefix if present
    const stem = filename.replace(/^\d{4}-\d{2}-\d{2}[_-]/, '').replace(/\.md$/i, '');
    const fingerprint = `${category}/${stem}`;
    if (!groups.has(fingerprint)) groups.set(fingerprint, []);
    groups.get(fingerprint).push(key);
  }
  // Report groups with more than one entry
  const dupes = [];
  for (const [fp, keys] of groups) {
    if (keys.length > 1) dupes.push({ fingerprint: fp, files: keys.sort() });
  }
  return dupes;
}

// ── Report helpers ─────────────────────────────────────────────────────────────

function mdTable(headers, rows) {
  if (rows.length === 0) return '_None._';
  const head = `| ${headers.join(' | ')} |`;
  const sep2  = `| ${headers.map(() => '---').join(' | ')} |`;
  const body  = rows.map(r => `| ${r.map(c => String(c).replace(/\|/g, '\\|')).join(' | ')} |`).join('\n');
  return [head, sep2, body].join('\n');
}

function section(title, content) {
  return `\n## ${title}\n\n${content}\n`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const today     = new Date().toISOString().slice(0, 10);
const todayStamp = today.replace(/-/g, '');

console.log('KB Audit — starting');
console.log(`Raw mirror root : ${RAW_ROOT}`);
console.log(`KB_VAULT_ROOT   : ${KB_VAULT_ROOT_ENV || '(unset — canonical cross-check skipped)'}`);
if (CANONICAL_KB_ROOT) console.log(`Canonical KB    : ${CANONICAL_KB_ROOT}`);
console.log('');

// Build raw map
const rawMap = buildMap(RAW_ROOT);
console.log(`Raw mirror files: ${rawMap.size}`);

// Optionally build canonical map
let canonicalMap = new Map();
let canonicalReachable = false;
if (CANONICAL_KB_ROOT && existsSync(CANONICAL_KB_ROOT)) {
  canonicalMap      = buildMap(CANONICAL_KB_ROOT);
  canonicalReachable = true;
  console.log(`Canonical files : ${canonicalMap.size}`);
} else if (CANONICAL_KB_ROOT) {
  console.warn(`Warning: KB_VAULT_ROOT set but canonical KB path does not exist: ${CANONICAL_KB_ROOT}`);
}

// ── Compute parity ────────────────────────────────────────────────────────────

const missing   = [];  // raw key not in canonical
const orphaned  = [];  // canonical key not in raw
const drifted   = [];  // same key, different hash

if (canonicalReachable) {
  for (const [key, rawEntry] of rawMap) {
    const canEntry = canonicalMap.get(key);
    if (!canEntry) {
      missing.push({ key, title: rawEntry.title, date_pulled: rawEntry.date_pulled });
    } else if (rawEntry.hash !== canEntry.hash) {
      drifted.push({ key, rawHash: rawEntry.hash.slice(0, 12), canHash: canEntry.hash.slice(0, 12) });
    }
  }
  for (const [key, canEntry] of canonicalMap) {
    if (!rawMap.has(key)) {
      orphaned.push({ key, title: canEntry.title, date_pulled: canEntry.date_pulled });
    }
  }
}

const dupes = detectInternalDuplicates(rawMap);

// ── Build report ───────────────────────────────────────────────────────────────

const lines = [];
lines.push('---');
lines.push('type: kb_audit');
lines.push(`title: KB Audit ${todayStamp}`);
lines.push(`date: ${today}`);
lines.push(`raw_root: "${RAW_ROOT.replace(/\\/g, '/')}"`);
lines.push(`canonical_root: "${CANONICAL_KB_ROOT ? CANONICAL_KB_ROOT.replace(/\\/g, '/') : 'N/A'}"`);
lines.push(`kb_vault_root_set: ${!!KB_VAULT_ROOT_ENV}`);
lines.push(`canonical_reachable: ${canonicalReachable}`);
lines.push(`raw_file_count: ${rawMap.size}`);
lines.push(`canonical_file_count: ${canonicalMap.size}`);
lines.push('tags:');
lines.push('  - kb-audit');
lines.push('  - system');
lines.push('---');
lines.push('');
lines.push(`# KB Audit — ${today}`);
lines.push('');
lines.push(`| Field | Value |`);
lines.push(`| --- | --- |`);
lines.push(`| Raw mirror root | \`${RAW_ROOT.replace(/\\/g, '/')}\` |`);
lines.push(`| Canonical KB root | \`${CANONICAL_KB_ROOT ? CANONICAL_KB_ROOT.replace(/\\/g, '/') : 'N/A (KB_VAULT_ROOT unset)'}\` |`);
lines.push(`| Raw file count | ${rawMap.size} |`);
lines.push(`| Canonical file count | ${canonicalMap.size} |`);
lines.push(`| Canonical reachable | ${canonicalReachable} |`);
lines.push('');

if (!canonicalReachable) {
  lines.push('> **Note:** `KB_VAULT_ROOT` is unset or the canonical path does not exist.');
  lines.push('> Sections 1-3 (cross-vault parity) are skipped. Only internal raw/ consistency is reported.');
  lines.push('');
}

// Section 1 — Raw → Canonical missing
if (canonicalReachable) {
  lines.push(section(
    `1. Raw → Canonical Missing (${missing.length})`,
    missing.length
      ? mdTable(
          ['Raw Key', 'Title', 'Date Pulled'],
          missing.map(x => [x.key, x.title || '(none)', x.date_pulled || '(none)'])
        )
      : '_None — all raw files are present in canonical._'
  ));
} else {
  lines.push(section('1. Raw → Canonical Missing', '_Skipped — canonical KB not reachable._'));
}

// Section 2 — Canonical → Raw orphan
if (canonicalReachable) {
  lines.push(section(
    `2. Canonical → Raw Orphan (${orphaned.length})`,
    orphaned.length
      ? mdTable(
          ['Canonical Key', 'Title', 'Date Pulled'],
          orphaned.map(x => [x.key, x.title || '(none)', x.date_pulled || '(none)'])
        )
      : '_None — all canonical files have a matching raw mirror._'
  ));
} else {
  lines.push(section('2. Canonical → Raw Orphan', '_Skipped — canonical KB not reachable._'));
}

// Section 3 — Hash mismatch / content drift
if (canonicalReachable) {
  lines.push(section(
    `3. Hash Mismatch / Content Drift (${drifted.length})`,
    drifted.length
      ? mdTable(
          ['Key', 'Raw SHA-256 (12)', 'Canonical SHA-256 (12)'],
          drifted.map(x => [x.key, x.rawHash, x.canHash])
        )
      : '_None — all shared files have identical body content._'
  ));
} else {
  lines.push(section('3. Hash Mismatch / Content Drift', '_Skipped — canonical KB not reachable._'));
}

// Section 4 — Internal duplicates within raw/
lines.push(section(
  `4. Internal Duplicates Within raw/ (${dupes.length})`,
  dupes.length
    ? dupes.map(d =>
        `**${d.fingerprint}** (${d.files.length} files):\n` +
        d.files.map(f => `- \`${f}\``).join('\n')
      ).join('\n\n')
    : '_None — no (category, name) pairs appear under more than one date._'
));

// ── Write report ───────────────────────────────────────────────────────────────

const outDir  = join(ENGINE_ROOT, '99_System', 'inventory');
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, `kb-audit-${todayStamp}.md`);
writeFileSync(outFile, lines.join('\n'), 'utf-8');

// ── Stdout summary ─────────────────────────────────────────────────────────────

console.log(`Raw mirror files         : ${rawMap.size}`);
console.log(`Canonical files          : ${canonicalMap.size}`);
console.log(`Canonical reachable      : ${canonicalReachable}`);
if (canonicalReachable) {
  console.log(`Raw → Canonical missing  : ${missing.length}`);
  console.log(`Canonical → Raw orphan   : ${orphaned.length}`);
  console.log(`Hash mismatch / drift    : ${drifted.length}`);
}
console.log(`Internal duplicates      : ${dupes.length}`);
console.log('');
console.log(`Wrote: ${outFile}`);
