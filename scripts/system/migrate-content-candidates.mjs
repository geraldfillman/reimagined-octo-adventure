#!/usr/bin/env node
/**
 * migrate-content-candidates.mjs - Idempotent one-time migration for
 * The Research Spine/03_References/Content_Candidates/.
 *
 * Three passes:
 *   1. Strip BOM and HTML numeric entities (8216-8221, 8211-8212) from filenames.
 *   2. Sub-folder by content_type frontmatter:
 *        source_post              → Posts/
 *        book, book_search        → Books/
 *        paper_search             → Papers/
 *        video_search             → Videos/
 *        case_search              → Cases/
 *        report_search            → Reports/
 *        official_*               → Official/
 *        (anything else)          → Other/
 *   3. Add published_at: null to frontmatter if missing (placeholder; future
 *      publisher runs should populate from upstream feed metadata).
 *
 * Read-only frontmatter parsing; full file rewrite to normalize line endings
 * and strip BOM. Run twice and the output is identical.
 *
 *   node scripts/system/migrate-content-candidates.mjs [--dry-run]
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';

import { getResearchVaultRoot } from '../lib/config.mjs';

const VAULT = getResearchVaultRoot();
const ROOT = join(VAULT, '03_References', 'Content_Candidates');
const DRY_RUN = process.argv.includes('--dry-run');

const TYPE_TO_FOLDER = Object.freeze({
  source_post: 'Posts',
  book: 'Books',
  book_search: 'Books',
  paper_search: 'Papers',
  video_search: 'Videos',
  case_search: 'Cases',
  report_search: 'Reports',
  official_report: 'Official',
  official_report_search: 'Official',
  official_data_reference: 'Official',
});

if (!existsSync(ROOT)) {
  console.error(`Content_Candidates folder not found: ${ROOT}`);
  process.exit(1);
}

// ── Walk all .md files (including pre-existing subfolders) ────────────────────

function walkMd(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...walkMd(full));
    else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) out.push(full);
  }
  return out;
}

// ── Parse and normalize frontmatter ───────────────────────────────────────────

function stripBom(text) {
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function parseFrontmatterBlock(text) {
  const m = stripBom(text).match(FRONTMATTER_RE);
  if (!m) return { fmText: '', body: text, ordered: [] };
  const fmText = m[1];
  const ordered = [];
  for (const raw of fmText.split(/\r?\n/)) {
    const kv = raw.match(/^\s*([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (kv) ordered.push({ key: kv[1], rawValue: kv[2], rawLine: raw });
    else ordered.push({ rawLine: raw, key: null, rawValue: '' });
  }
  return { fmText, body: stripBom(text).slice(m[0].length), ordered };
}

function getFmValue(ordered, key) {
  for (const item of ordered) if (item.key === key) return item.rawValue.trim().replace(/^['"]|['"]$/g, '');
  return null;
}

function ensurePublishedAt(ordered) {
  if (ordered.some(item => item.key === 'published_at')) return ordered;
  const next = [];
  let inserted = false;
  for (const item of ordered) {
    next.push(item);
    if (!inserted && item.key === 'generated_on') {
      next.push({ key: 'published_at', rawValue: '', rawLine: 'published_at: null' });
      inserted = true;
    }
  }
  if (!inserted) {
    // Fallback: insert before tags or at end
    const tagsIdx = next.findIndex(item => item.key === 'tags');
    const insertAt = tagsIdx >= 0 ? tagsIdx : next.length;
    next.splice(insertAt, 0, { key: 'published_at', rawValue: '', rawLine: 'published_at: null' });
  }
  return next;
}

function rebuildFrontmatter(ordered) {
  return ['---', ...ordered.map(item => item.rawLine), '---'].join('\n');
}

// ── Filename slug normalization ───────────────────────────────────────────────

const HTML_ENTITY_RE = /-?\b(8216|8217|8218|8219|8220|8221|8222|8211|8212|8213)\b-?/g;

function cleanSlug(stem) {
  return stem
    .replace(HTML_ENTITY_RE, '-')         // strip embedded HTML numeric entities
    .replace(/[^a-z0-9_]+/gi, '-')        // collapse non-word to single dash
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

// ── Migration pass ────────────────────────────────────────────────────────────

const all = walkMd(ROOT);
const stats = { read: all.length, moved: 0, renamed: 0, addedPublishedAt: 0, bomStripped: 0, errored: 0, byFolder: {} };
const usedTargets = new Set();

for (const oldPath of all) {
  let raw;
  try { raw = readFileSync(oldPath, 'utf-8'); }
  catch (e) { stats.errored++; continue; }

  const hadBom = raw.charCodeAt(0) === 0xFEFF;
  const { ordered, body } = parseFrontmatterBlock(raw);
  if (!ordered.length) { stats.errored++; console.warn('No frontmatter:', relative(ROOT, oldPath)); continue; }

  const contentType = (getFmValue(ordered, 'content_type') || '').toLowerCase();
  const subfolder = TYPE_TO_FOLDER[contentType] || 'Other';
  const newOrdered = ensurePublishedAt(ordered);
  const addedPublishedAt = newOrdered.length !== ordered.length;

  const oldStem = basename(oldPath, '.md');
  const newStem = cleanSlug(oldStem);
  let newName = `${newStem}.md`;
  let newPath = join(ROOT, subfolder, newName);

  // Disambiguate if collision after slugifying
  let counter = 1;
  while ((newPath !== oldPath && existsSync(newPath)) || usedTargets.has(newPath.toLowerCase())) {
    newName = `${newStem}-${counter}.md`;
    newPath = join(ROOT, subfolder, newName);
    counter++;
  }
  usedTargets.add(newPath.toLowerCase());

  const newRaw = rebuildFrontmatter(newOrdered) + '\n' + (body.startsWith('\n') ? body : '\n' + body);
  const isMove = oldPath !== newPath;
  const willRewrite = isMove || hadBom || addedPublishedAt || newRaw !== raw;

  stats.byFolder[subfolder] = (stats.byFolder[subfolder] || 0) + 1;

  if (DRY_RUN) {
    if (isMove) console.log(`[dry-run] move ${relative(ROOT, oldPath)} → ${relative(ROOT, newPath)}`);
    else if (willRewrite) console.log(`[dry-run] rewrite ${relative(ROOT, oldPath)} (bom=${hadBom} addPubAt=${addedPublishedAt})`);
    continue;
  }

  if (willRewrite) {
    mkdirSync(dirname(newPath), { recursive: true });
    writeFileSync(newPath, newRaw, 'utf-8');
    if (isMove && existsSync(oldPath)) {
      try { unlinkSync(oldPath); }
      catch { /* ignore */ }
      stats.moved++;
    } else if (oldStem !== newStem) {
      stats.renamed++;
    }
    if (hadBom) stats.bomStripped++;
    if (addedPublishedAt) stats.addedPublishedAt++;
  }
}

// Clean up any now-empty Content_Candidates root or stray empty subdirs
function pruneEmptyDirs(dir) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) pruneEmptyDirs(join(dir, e.name));
  }
  try {
    const remaining = readdirSync(dir);
    if (remaining.length === 0 && dir !== ROOT) {
      // not deleting; just informational. Empty folders are non-harmful.
    }
  } catch { /* ignore */ }
}
pruneEmptyDirs(ROOT);

console.log(`Migrated ${stats.read} candidate(s).`);
console.log(`  moved (path changed): ${stats.moved}`);
console.log(`  renamed (slug changed): ${stats.renamed}`);
console.log(`  bom stripped: ${stats.bomStripped}`);
console.log(`  added published_at: ${stats.addedPublishedAt}`);
console.log(`  errored: ${stats.errored}`);
console.log('  by folder:');
for (const [k, v] of Object.entries(stats.byFolder).sort((a, b) => b[1] - a[1])) console.log(`    ${k.padEnd(10)} ${v}`);
