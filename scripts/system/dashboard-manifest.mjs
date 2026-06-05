#!/usr/bin/env node
/**
 * dashboard-manifest.mjs — Generate 00_Dashboard/.manifest.json
 *
 * Walks every .md file under 00_Dashboard/, extracts all Dataview blocks,
 * parses FROM clauses and WHERE-referenced frontmatter fields, and writes a
 * regenerable manifest.
 *
 * Usage (via run.mjs):
 *   node run.mjs system dashboard-manifest generate
 *   node run.mjs system dashboard-manifest generate --dry-run
 *
 * The manifest is a regenerable artifact — never hand-edit it.
 * It is listed in .gitignore so it does not pollute version control.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE      = dirname(fileURLToPath(import.meta.url));
const VAULT     = join(HERE, '..', '..');
const DASH_DIR  = join(VAULT, '00_Dashboard');
const MANIFEST  = join(DASH_DIR, '.manifest.json');

// ── Regex ─────────────────────────────────────────────────────────────────────

// Capture entire dataview code block (multi-line, non-greedy)
const BLOCK_RE = /```dataview\r?\n([\s\S]*?)```/gi;

// FROM clause — capture until newline; tolerate multi-word combinators (AND/OR)
// Matches:  FROM "path/here"   FROM #tag   FROM [[note]]
// Captures each individual token after FROM (split on AND/OR for multi-path)
const FROM_LINE_RE = /\bFROM\s+((?:"[^"\r\n]*"|'[^'\r\n]*'|#[\w/-]+|\[\[[^\]\r\n]+\]\]|[^\r\n#"'\[,]+?)(?:\s+(?:AND|OR)\s+(?:"[^"\r\n]*"|'[^'\r\n]*'|#[\w/-]+|\[\[[^\]\r\n]+\]\]|[^\r\n#"'\[,]+?))*)/gi;

// Split compound FROM on AND / OR separators
const COMBINATOR_RE = /\s+(?:AND|OR)\s+/i;

// WHERE field references — capture bare identifiers that look like frontmatter keys
// Strategy: grab every word that follows WHERE/AND/OR that isn't a Dataview keyword
const WHERE_FIELD_RE = /\b(?:WHERE|AND|OR)\s+([\w_]+)\s*[!=<>]/gi;

// Known Dataview built-ins to exclude from field lists
const DATAVIEW_BUILTINS = new Set([
  'file', 'date', 'today', 'now', 'elink', 'link', 'null', 'true', 'false',
  'dur', 'choice', 'contains', 'icontains', 'econtains', 'startswith',
  'endswith', 'string', 'number', 'list', 'object', 'typeof', 'len',
  'extract', 'sort', 'reverse', 'flat', 'filter', 'map', 'nonnull',
  'all', 'any', 'none', 'join', 'sum', 'product', 'min', 'max', 'average',
  'minby', 'maxby', 'regexmatch', 'regexreplace', 'replace', 'lower',
  'upper', 'split', 'round', 'floor', 'ceil', 'trunc', 'padleft', 'padright',
  'striptime', 'localtime', 'timestamp',
]);

// ── Walk ──────────────────────────────────────────────────────────────────────

function walkMd(dir) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkMd(full));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

// ── Parse YAML frontmatter ────────────────────────────────────────────────────

function parseFrontmatter(text) {
  const fm = {};
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return fm;
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w_]+)\s*:\s*(.*)$/);
    if (kv) {
      fm[kv[1].trim()] = kv[2].trim().replace(/^["']|["']$/g, '');
    }
  }
  return fm;
}

// ── Parse one dashboard ───────────────────────────────────────────────────────

function parseDashboard(filePath) {
  const text = readFileSync(filePath, 'utf-8');
  const fromSet   = new Set();
  const fieldSet  = new Set();

  // Extract tier fields from frontmatter
  const fm = parseFrontmatter(text);
  const tierRaw = fm['tier'];
  const tier = tierRaw !== undefined ? Number(tierRaw) : null;
  const tier_label = fm['tier_label'] || null;

  let blockMatch;
  BLOCK_RE.lastIndex = 0;

  while ((blockMatch = BLOCK_RE.exec(text)) !== null) {
    const block = blockMatch[1];

    // Extract FROM tokens
    FROM_LINE_RE.lastIndex = 0;
    let fromMatch;
    while ((fromMatch = FROM_LINE_RE.exec(block)) !== null) {
      const compound = fromMatch[1].trim();
      for (const part of compound.split(COMBINATOR_RE)) {
        const token = part.trim();
        if (token) fromSet.add(token);
      }
    }

    // Extract WHERE-referenced field names
    WHERE_FIELD_RE.lastIndex = 0;
    let whereMatch;
    while ((whereMatch = WHERE_FIELD_RE.exec(block)) !== null) {
      const field = whereMatch[1].toLowerCase();
      if (!DATAVIEW_BUILTINS.has(field)) {
        fieldSet.add(field);
      }
    }
  }

  return {
    tier,
    tier_label,
    from: [...fromSet].sort(),
    fields_referenced: [...fieldSet].sort(),
  };
}

// ── Main: generate ────────────────────────────────────────────────────────────

export async function run(flags = {}) {
  const subcommand = flags._subcommand ?? 'generate';
  const isDryRun = Boolean(flags['dry-run'] || flags.dryRun);

  if (subcommand !== 'generate') {
    console.error(`Unknown subcommand "${subcommand}". Use: node run.mjs system dashboard-manifest generate`);
    process.exit(1);
  }

  const files = walkMd(DASH_DIR).sort();
  const dashboards = {};

  for (const filePath of files) {
    const key = relative(DASH_DIR, filePath).replace(/\\/g, '/');
    dashboards[key] = parseDashboard(filePath);
  }

  const manifest = {
    generated_at: new Date().toISOString(),
    vault_root: VAULT,
    dashboard_dir: '00_Dashboard',
    dashboards,
  };

  const total     = Object.keys(dashboards).length;
  const withFrom  = Object.values(dashboards).filter(d => d.from.length > 0).length;
  const fromCount = Object.values(dashboards).reduce((n, d) => n + d.from.length, 0);

  if (!isDryRun) {
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2), 'utf-8');
  }

  console.log(`[dashboard-manifest] ${isDryRun ? 'Dry run - manifest not written' : 'Generated manifest'}`);
  console.log(`  Dashboards scanned : ${total}`);
  console.log(`  With FROM clauses  : ${withFrom}`);
  console.log(`  Total FROM tokens  : ${fromCount}`);
  console.log(`  ${isDryRun ? 'Would write to' : 'Written to'}         : ${MANIFEST}`);

  return { manifest, total, withFrom, fromCount, dryRun: isDryRun };
}
