#!/usr/bin/env node
/**
 * streamline-audit.mjs — Phase A deep scan of My_Data + World_Machine vaults.
 *
 * Reads-only. Walks both vaults (excluding archives + node_modules + .git + .obsidian),
 * inventories schemas / dead-links / path debt / .env API surface / ledger reality,
 * and writes a single STREAMLINE_AUDIT.md to World_Machine/ for review.
 *
 * Usage:
 *   node scripts/agents/streamline-audit.mjs
 *   node scripts/agents/streamline-audit.mjs --out=/path/to/audit.md
 */

import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, basename, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const MY_DATA_ROOT = resolveMyDataRoot();
const WM_ROOT      = resolveWMRoot();
const OUT_PATH     = parseOutArg() || join(WM_ROOT, 'STREAMLINE_AUDIT.md');

const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', '.obsidian', '.claude', '500-archive',
  '.cache', 'dist', 'build', '_archive',
]);

const STALE_DAYS = 30;
const NOW = new Date();

function resolveMyDataRoot() {
  // Script lives at scripts/agents/streamline-audit.mjs → root is ../..
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, '..', '..');
}

function resolveWMRoot() {
  // World_Machine is a sibling vault.
  return join(MY_DATA_ROOT, '..', 'World_Machine');
}

function parseOutArg() {
  const arg = process.argv.find(a => a.startsWith('--out='));
  return arg ? arg.slice(6) : null;
}

async function walk(root, accept) {
  const out = [];
  async function inner(dir) {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      if (e.isDirectory()) {
        if (EXCLUDE_DIRS.has(e.name)) continue;
        await inner(join(dir, e.name));
      } else if (e.isFile()) {
        const full = join(dir, e.name);
        if (accept(full)) out.push(full);
      }
    }
  }
  await inner(root);
  return out;
}

function parseFrontmatter(text) {
  if (!text.startsWith('---\n') && !text.startsWith('---\r\n')) return null;
  const end = text.indexOf('\n---', 4);
  if (end === -1) return null;
  const block = text.slice(4, end);
  const out = {};
  for (const line of block.split(/\r?\n/)) {
    const m = line.match(/^(\w[\w_-]*):\s*(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

function extractWikilinks(text) {
  const re = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g;
  const out = new Set();
  let m;
  while ((m = re.exec(text)) !== null) out.add(m[1].trim());
  return [...out];
}

function looksLikeDeprecatedPath(link) {
  return /^(08_Entities|09_Macro|07_Policy|10_Politics)\//.test(link);
}

async function buildNameIndex(files) {
  // Map: bare filename (without .md) → array of full paths
  const idx = new Map();
  for (const f of files) {
    const base = basename(f, '.md');
    if (!idx.has(base)) idx.set(base, []);
    idx.get(base).push(f);
  }
  return idx;
}

function resolveLink(link, vaultRoot, nameIndex) {
  // Strip trailing alias / heading, take first segment of path
  const cleaned = link.replace(/^\.+\//, '');
  // Direct path test
  const direct = join(vaultRoot, cleaned + '.md');
  if (existsSync(direct)) return direct;
  // Direct without .md (already has extension or it's a folder)
  if (existsSync(join(vaultRoot, cleaned))) return join(vaultRoot, cleaned);
  // Name-only match
  const base = basename(cleaned, '.md');
  const hits = nameIndex.get(base);
  if (hits && hits.length === 1) return hits[0];
  if (hits && hits.length > 1) return 'ambiguous';
  return null;
}

async function inventoryVault(vaultRoot, label) {
  const files = await walk(vaultRoot, p => p.endsWith('.md'));
  const nameIndex = await buildNameIndex(files);

  const folderCounts = new Map();
  const typeCounts   = new Map();
  const ageBuckets   = { 'last_7d': 0, 'last_30d': 0, 'last_90d': 0, 'older': 0 };
  const deadLinks    = []; // { file, link }
  const ambiguous    = []; // { file, link, candidates }
  const pathDebt     = []; // { file, link }
  const orphans      = []; // files no one links to
  const inboundCount = new Map();

  for (const f of files) {
    const rel = relative(vaultRoot, f);
    const topFolder = rel.split(sep)[0];
    folderCounts.set(topFolder, (folderCounts.get(topFolder) ?? 0) + 1);

    let text;
    try { text = await readFile(f, 'utf8'); } catch { continue; }

    const fm = parseFrontmatter(text);
    const type = fm?.type ?? '(no-frontmatter)';
    typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);

    const st = await stat(f);
    const ageDays = (NOW - st.mtime) / 86_400_000;
    if (ageDays <= 7) ageBuckets.last_7d++;
    else if (ageDays <= 30) ageBuckets.last_30d++;
    else if (ageDays <= 90) ageBuckets.last_90d++;
    else ageBuckets.older++;

    const links = extractWikilinks(text);
    for (const link of links) {
      if (looksLikeDeprecatedPath(link)) {
        pathDebt.push({ file: rel, link });
      }
      const target = resolveLink(link, vaultRoot, nameIndex);
      if (target === null) {
        deadLinks.push({ file: rel, link });
      } else if (target === 'ambiguous') {
        ambiguous.push({ file: rel, link });
      } else {
        const rel2 = relative(vaultRoot, target);
        inboundCount.set(rel2, (inboundCount.get(rel2) ?? 0) + 1);
      }
    }
  }

  for (const f of files) {
    const rel = relative(vaultRoot, f);
    if (!inboundCount.has(rel) && !rel.endsWith('README.md') && !rel.endsWith('AGENTS.md') && !rel.endsWith('CLAUDE.md')) {
      // Skip auto-generated dated run files from orphan detection
      if (/_runs[\\/]/.test(rel) || /\d{4}-\d{2}-\d{2}/.test(rel)) continue;
      orphans.push(rel);
    }
  }

  return {
    label, root: vaultRoot, fileCount: files.length,
    folderCounts, typeCounts, ageBuckets,
    deadLinks, ambiguous, pathDebt, orphans,
  };
}

async function inventoryEnv() {
  const envPath = join(MY_DATA_ROOT, '.env');
  if (!existsSync(envPath)) return { present: false, keys: [], comments: [] };
  const text = await readFile(envPath, 'utf8');
  const keys = [];
  const comments = [];
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith('#')) {
      const c = line.replace(/^#+\s*/, '').trim();
      if (c) comments.push(c.slice(0, 120));
      continue;
    }
    const m = line.match(/^([A-Z][A-Z0-9_]+)\s*=\s*(.+)$/);
    if (m) {
      const key = m[1];
      const val = m[2].trim();
      keys.push({ key, configured: val.length > 0 && val !== '""' && val !== "''" });
    }
  }
  return { present: true, keys, comments };
}

async function ledgerRealityCheck() {
  const ledgerPath = join(WM_ROOT, '_Inbox', 'Market Positioning Ledger.md');
  if (!existsSync(ledgerPath)) return { present: false };
  const text = await readFile(ledgerPath, 'utf8');
  const activeMatch = text.match(/^## Active Ledger\s*$([\s\S]*?)^## /m);
  if (!activeMatch) return { present: true, rows: [], note: 'Active Ledger section not located' };

  const rows = [];
  for (const line of activeMatch[1].split('\n')) {
    if (!line.startsWith('|') || line.includes('---') || /^\|\s*Signal\s*\/\s*Theme/i.test(line)) continue;
    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    if (cells.length < 8) continue;
    const [signal, stance, gate, gateDelta, sourceRef, watchpoint, posBlock] = cells;
    rows.push({ signal, stance, gate, gateDelta, sourceRef, watchpoint, posBlock });
  }

  const issues = [];
  for (const row of rows) {
    const r = row.sourceRef.replace(/^`|`$/g, '');
    if (r && !r.startsWith('_pending') && !r.startsWith('_archived')) {
      const abs = join(MY_DATA_ROOT, r);
      if (!existsSync(abs)) issues.push({ row: row.signal, kind: 'source-ref-missing', value: r });
    }
    if (row.watchpoint.startsWith('[[') && !row.watchpoint.startsWith('[[_')) {
      const link = row.watchpoint.replace(/^\[\[/, '').replace(/\]\]$/, '').split('|')[0];
      const abs = join(WM_ROOT, link + '.md');
      if (!existsSync(abs)) issues.push({ row: row.signal, kind: 'watchpoint-missing', value: link });
    }
  }
  return { present: true, rowCount: rows.length, issues };
}

function fmtTable(rows, headers) {
  if (rows.length === 0) return '_(none)_\n';
  const lines = [];
  lines.push('| ' + headers.join(' | ') + ' |');
  lines.push('|' + headers.map(() => '---').join('|') + '|');
  for (const r of rows) lines.push('| ' + r.map(c => String(c).replace(/\|/g, '\\|')).join(' | ') + ' |');
  return lines.join('\n') + '\n';
}

function fmtMapTable(map, label, valueLabel = 'Count', sortDesc = true) {
  const entries = [...map.entries()].sort((a, b) => sortDesc ? b[1] - a[1] : a[0].localeCompare(b[0]));
  return fmtTable(entries.map(([k, v]) => [k, v]), [label, valueLabel]);
}

async function main() {
  console.log(`Auditing My_Data: ${MY_DATA_ROOT}`);
  console.log(`Auditing World_Machine: ${WM_ROOT}`);

  const [myData, wm, env, ledger] = await Promise.all([
    inventoryVault(MY_DATA_ROOT, 'My_Data'),
    inventoryVault(WM_ROOT, 'World_Machine'),
    inventoryEnv(),
    ledgerRealityCheck(),
  ]);

  const date = NOW.toISOString().slice(0, 10);
  const md = [];
  md.push(`---`);
  md.push(`type: streamline-audit`);
  md.push(`created: ${date}`);
  md.push(`scope: routine-affecting surfaces (excludes 500-archive, node_modules, .git, .obsidian)`);
  md.push(`tags: [audit, streamline, phase-a]`);
  md.push(`---\n`);
  md.push(`# Streamline Audit — ${date}\n`);
  md.push(`Phase A read-only inventory of My_Data + World_Machine. Generated by \`scripts/agents/streamline-audit.mjs\`. Excludes archives, node_modules, .git, .obsidian.\n`);

  // Summary
  md.push(`## Summary\n`);
  md.push(fmtTable([
    ['My_Data files',     myData.fileCount],
    ['World_Machine files', wm.fileCount],
    ['Dead wikilinks',    myData.deadLinks.length + wm.deadLinks.length],
    ['Ambiguous wikilinks', myData.ambiguous.length + wm.ambiguous.length],
    ['Path debt (deprecated 08_/09_/10_)', myData.pathDebt.length + wm.pathDebt.length],
    ['Orphan notes (no inbound link)', myData.orphans.length + wm.orphans.length],
    ['Ledger active rows',  ledger.rowCount ?? 0],
    ['Ledger issues',       ledger.issues?.length ?? 0],
    ['.env keys',           env.keys.length],
    ['.env configured keys', env.keys.filter(k => k.configured).length],
  ], ['Metric', 'Value']));

  for (const vault of [myData, wm]) {
    md.push(`## ${vault.label}\n`);
    md.push(`Root: \`${vault.root}\`\n`);
    md.push(`### Folder distribution\n`);
    md.push(fmtMapTable(vault.folderCounts, 'Folder', 'Files'));
    md.push(`### Frontmatter \`type:\` usage\n`);
    md.push(fmtMapTable(vault.typeCounts, 'Type', 'Count'));
    md.push(`### Age buckets (by mtime)\n`);
    md.push(fmtTable([
      ['Last 7 days',  vault.ageBuckets.last_7d],
      ['Last 30 days', vault.ageBuckets.last_30d],
      ['Last 90 days', vault.ageBuckets.last_90d],
      ['Older than 90 days', vault.ageBuckets.older],
    ], ['Bucket', 'Files']));
    md.push(`### Path debt (deprecated paths)\n`);
    md.push(fmtTable(vault.pathDebt.slice(0, 50).map(p => [p.file, p.link]), ['File', 'Deprecated link']));
    if (vault.pathDebt.length > 50) md.push(`_… ${vault.pathDebt.length - 50} more_\n`);
    md.push(`### Dead wikilinks (sample, top 50)\n`);
    md.push(fmtTable(vault.deadLinks.slice(0, 50).map(p => [p.file, p.link]), ['File', 'Dead link']));
    if (vault.deadLinks.length > 50) md.push(`_… ${vault.deadLinks.length - 50} more_\n`);
    md.push(`### Ambiguous wikilinks (sample, top 30)\n`);
    md.push(fmtTable(vault.ambiguous.slice(0, 30).map(p => [p.file, p.link]), ['File', 'Ambiguous link']));
    if (vault.ambiguous.length > 30) md.push(`_… ${vault.ambiguous.length - 30} more_\n`);
    md.push(`### Orphan notes (no inbound links, sample top 50)\n`);
    md.push(fmtTable(vault.orphans.slice(0, 50).map(o => [o]), ['File']));
    if (vault.orphans.length > 50) md.push(`_… ${vault.orphans.length - 50} more_\n`);
  }

  // .env
  md.push(`## .env API Surface\n`);
  if (!env.present) {
    md.push(`_(.env not present at \`${join(MY_DATA_ROOT, '.env')}\`)_\n`);
  } else {
    md.push(fmtTable(
      env.keys.map(k => [k.key, k.configured ? 'set' : 'empty']),
      ['Key', 'State'],
    ));
    if (env.comments.length) {
      md.push(`### Comment hints from .env (top 20)\n`);
      md.push(env.comments.slice(0, 20).map(c => `- ${c}`).join('\n') + '\n');
    }
  }

  // Ledger reality check
  md.push(`## Positioning Ledger Reality Check\n`);
  if (!ledger.present) {
    md.push(`_(ledger not found at \`World_Machine/_Inbox/Market Positioning Ledger.md\`)_\n`);
  } else {
    md.push(`Active rows: **${ledger.rowCount}**. Issues: **${ledger.issues.length}**.\n`);
    if (ledger.issues.length) {
      md.push(fmtTable(ledger.issues.map(i => [i.row, i.kind, i.value]), ['Row', 'Issue', 'Value']));
    } else {
      md.push(`_(no broken Source Ref or Watchpoint links)_\n`);
    }
  }

  // Suggested actions
  md.push(`## Suggested Phase B Streamline Actions\n`);
  md.push(`Based on this audit, the following actions are candidates for Phase B (destructive, gated):\n`);
  const actions = [];
  if (myData.pathDebt.length + wm.pathDebt.length > 0) {
    actions.push(`- Rewrite ${myData.pathDebt.length + wm.pathDebt.length} deprecated path references (\`08_Entities/\` → \`Entities/\`, etc.).`);
  }
  if (myData.deadLinks.length + wm.deadLinks.length > 0) {
    actions.push(`- Triage ${myData.deadLinks.length + wm.deadLinks.length} dead wikilinks: fix typos, restore archived targets, or remove the link.`);
  }
  if (myData.ambiguous.length + wm.ambiguous.length > 0) {
    actions.push(`- Disambiguate ${myData.ambiguous.length + wm.ambiguous.length} multi-target wikilinks by switching to path-qualified form.`);
  }
  if (ledger.issues?.length) {
    actions.push(`- Resolve ${ledger.issues.length} ledger reality issues — missing Source Ref files, missing Watchpoint notes.`);
  }
  if (myData.orphans.length + wm.orphans.length > 30) {
    actions.push(`- Review ${myData.orphans.length + wm.orphans.length} orphan notes for archive/delete candidacy.`);
  }
  if (myData.ageBuckets.older + wm.ageBuckets.older > 0) {
    actions.push(`- Sweep ${myData.ageBuckets.older + wm.ageBuckets.older} files unmodified for >90 days — most are likely archive candidates.`);
  }
  md.push(actions.join('\n') + '\n');

  await writeFile(OUT_PATH, md.join('\n'), 'utf8');
  console.log(`OUTPUT: ${OUT_PATH}`);
  console.log(`Audit complete. Wrote ${md.join('\n').length} bytes to ${OUT_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
