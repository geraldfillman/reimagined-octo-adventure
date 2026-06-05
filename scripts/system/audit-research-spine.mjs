#!/usr/bin/env node
/**
 * audit-research-spine.mjs - Read-only inventory + link audit for The Research Spine vault.
 *
 * The Research Spine is a soft archive. This audit remains available for
 * historical health checks. Generated review queues are retired; follow-up
 * decisions now stay in reports, triage packets, or chat review.
 *
 * Walks every .md file in the research vault and reports:
 *   - broken [[wiki-links]] (with shortname resolution)
 *   - broken Dataview FROM "path" clauses (folder existence)
 *   - orphan folders (no .md or only README.md)
 *   - cache-leakage source notes (e.g. cache-scripts-.cache-fmp-...)
 *   - frontmatter coverage for the dashboards' Dataview queries
 *   - source-note domain distribution and hostile filenames
 *   - reports tree: live (Briefings/Monitoring) vs orphan (Daily/Weekly/Monthly)
 *   - raw-data leakage in 05_Data_Pulls (files without raw_data_policy: link_only)
 *   - referenced PowerShell scripts that do not exist on disk
 *   - plugin-usage signals (templater templates, obsidian-tasks items, dataview blocks)
 *
 * Writes <vault>/99_System/inventory/research-spine-audit-YYYYMMDD.md and prints
 * a one-screen summary to stdout. Read-only: never moves or deletes anything.
 *
 * Use --write-archive-inbox to append actionable findings to the archived
 * <spine>/04_Human_Notes/Inbox.md. Idempotent: re-runs replace the section,
 * not append.
 * Use --dry-run or --no-write to scan and print the summary without writing
 * either the inventory report or Inbox.md.
 *
 *   node scripts/system/audit-research-spine.mjs [--no-inbox] [--dry-run]
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getResearchVaultRoot } from '../lib/config.mjs';

const VAULT = getResearchVaultRoot();
const HERE = dirname(fileURLToPath(import.meta.url));

// ── CLI flags ─────────────────────────────────────────────────────────────────
const NO_WRITE = process.argv.includes('--dry-run') || process.argv.includes('--no-write');
const WRITE_INBOX = !NO_WRITE && process.argv.includes('--write-archive-inbox');

if (!existsSync(VAULT)) {
  console.error(`Research vault root does not exist: ${VAULT}`);
  process.exit(1);
}

const SKIP_DIRS = new Set(['.obsidian', '.makemd', '.space', '.git', '.trash']);
const ARCHIVE_PREFIX = '99_System/archive/';

// ── Walk ──────────────────────────────────────────────────────────────────────

function walkMd(root) {
  const out = [];
  (function recur(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      if (e.name.startsWith('.') && SKIP_DIRS.has(e.name)) continue;
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name)) continue;
        recur(full);
      } else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) {
        out.push(full);
      }
    }
  })(root);
  return out;
}

function vaultRel(p) {
  return relative(VAULT, p).split(sep).join('/');
}

// ── Parse ─────────────────────────────────────────────────────────────────────

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function parseFrontmatter(text) {
  // Strip UTF-8 BOM if present — many Obsidian-written files include it.
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const m = text.match(FRONTMATTER_RE);
  if (!m) return { fm: {}, body: text };
  const fm = {};
  for (const raw of m[1].split(/\r?\n/)) {
    const kv = raw.match(/^\s*([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    fm[kv[1]] = kv[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return { fm, body: text.slice(m[0].length) };
}

const WIKILINK_RE = /\[\[([^\[\]\n|#^]+)(?:[#^][^\[\]\n|]*)?(?:\|[^\]\n]*)?\]\]/g;
const DATAVIEW_BLOCK_RE = /```dataview\r?\n([\s\S]*?)```/g;
const DATAVIEW_FROM_RE = /\bFROM\s+("([^"]+)"|'([^']+)'|([^\s"'][^\n]*))/gi;
const TASK_RE = /^\s*[-*]\s+\[[ xX/\-]\]\s+/;

function extractWikilinks(body) {
  const links = [];
  let m;
  while ((m = WIKILINK_RE.exec(body))) links.push(m[1].trim());
  return links;
}

function extractDataviewFroms(body) {
  const froms = [];
  let block;
  while ((block = DATAVIEW_BLOCK_RE.exec(body))) {
    const src = block[1];
    let m;
    while ((m = DATAVIEW_FROM_RE.exec(src))) {
      const target = (m[2] || m[3] || m[4] || '').trim();
      if (target && target.startsWith('"') === false) froms.push(target);
    }
  }
  return froms;
}

function countTasks(body) {
  let n = 0;
  for (const line of body.split(/\r?\n/)) if (TASK_RE.test(line)) n++;
  return n;
}

// ── Index for resolution ──────────────────────────────────────────────────────

const files = walkMd(VAULT);

const byVaultPath = new Map();        // 'rel/path/Note.md' -> abs
const byShortname = new Map();        // 'Note' -> [abs,...]
for (const abs of files) {
  const rel = vaultRel(abs);
  byVaultPath.set(rel, abs);
  byVaultPath.set(rel.replace(/\.md$/i, ''), abs);
  const short = basename(rel, '.md');
  if (!byShortname.has(short)) byShortname.set(short, []);
  byShortname.get(short).push(abs);
}

function resolveWikilink(target, fromAbs) {
  const cleaned = target.replace(/\\/g, '/').trim();
  if (!cleaned) return { ok: false, reason: 'empty' };

  // Relative path
  if (cleaned.startsWith('./') || cleaned.startsWith('../')) {
    const candidate = resolve(dirname(fromAbs), cleaned + (cleaned.toLowerCase().endsWith('.md') ? '' : '.md'));
    if (existsSync(candidate)) return { ok: true, abs: candidate };
    const noExt = resolve(dirname(fromAbs), cleaned);
    if (existsSync(noExt)) return { ok: true, abs: noExt };
    // Maybe it's a non-md file like .base / .canvas
    for (const ext of ['', '.base', '.canvas', '.md']) {
      const c = resolve(dirname(fromAbs), cleaned + ext);
      if (existsSync(c)) return { ok: true, abs: c };
    }
    return { ok: false, reason: 'relative-not-found' };
  }

  // Absolute vault path
  if (cleaned.includes('/')) {
    const a = byVaultPath.get(cleaned) || byVaultPath.get(cleaned + '.md');
    if (a) return { ok: true, abs: a };
    // Try filesystem path under vault for non-md
    const fs1 = join(VAULT, cleaned);
    const fs2 = join(VAULT, cleaned + '.md');
    if (existsSync(fs1)) return { ok: true, abs: fs1 };
    if (existsSync(fs2)) return { ok: true, abs: fs2 };
    return { ok: false, reason: 'path-not-found' };
  }

  // Shortname
  const hits = byShortname.get(cleaned);
  if (hits && hits.length > 0) return { ok: true, abs: hits[0], ambiguous: hits.length > 1 };
  return { ok: false, reason: 'shortname-not-found' };
}

// ── Audit pass ────────────────────────────────────────────────────────────────

const findings = {
  brokenWikilinks: [],
  ambiguousWikilinks: [],
  brokenDataviewFroms: [],
  orphanFolders: [],
  cacheLeakSources: [],
  hostileFilenames: [],
  sourceDomainCounts: {},
  sourceFmCoverage: { freshness_item: 0, has_date_pulled: 0, total: 0 },
  reportsLive: {
    'Briefings/Daily': 0,
    'Briefings/EndOfDay': 0,
    'Monitoring/Premarket': 0,
    'Monitoring/Daily': 0,
    'Monitoring/Midday': 0,
    'Monitoring/Preclose': 0,
    'Monitoring/EndOfDay': 0,
  },
  reportsOrphan: { 'Daily': 0, 'Weekly': 0, 'Monthly': 0 },
  rawLeakage: [],
  missingPsScripts: [],
  pluginSignals: { dataviewBlocks: 0, taskItems: 0, templaterTemplates: 0 },
  fileSummary: { total: files.length, byTopFolder: {} },
};

const PS_RE = /([A-Z][A-Za-z0-9_-]+\.ps1)/g;

function topFolder(rel) {
  const parts = rel.split('/');
  return parts.length > 1 ? parts[0] : '(root)';
}

for (const abs of files) {
  const rel = vaultRel(abs);
  const top = topFolder(rel);
  findings.fileSummary.byTopFolder[top] = (findings.fileSummary.byTopFolder[top] || 0) + 1;

  // Skip link/coverage checks inside archive — historical content has acceptably stale references.
  const isArchived = rel.startsWith(ARCHIVE_PREFIX);

  let raw;
  try { raw = readFileSync(abs, 'utf-8'); }
  catch { continue; }

  const { fm, body } = parseFrontmatter(raw);

  // Wikilinks (skip archived content)
  if (!isArchived) {
    for (const target of extractWikilinks(body)) {
      const r = resolveWikilink(target, abs);
      if (!r.ok) findings.brokenWikilinks.push({ from: rel, target, reason: r.reason });
      else if (r.ambiguous) findings.ambiguousWikilinks.push({ from: rel, target, hits: byShortname.get(target.split('|')[0])?.length || 0 });
    }
  }

  // Dataview FROM
  const dvFroms = extractDataviewFroms(body);
  if (dvFroms.length) findings.pluginSignals.dataviewBlocks++;
  for (const target of dvFroms) {
    const dirAbs = join(VAULT, target);
    if (!existsSync(dirAbs)) findings.brokenDataviewFroms.push({ from: rel, target });
  }

  // Tasks
  findings.pluginSignals.taskItems += countTasks(body);

  // Source-note specifics
  if (rel.startsWith('01_Freshness/Sources/')) {
    findings.sourceFmCoverage.total++;
    if ((fm.type || '').toLowerCase() === 'freshness_item') findings.sourceFmCoverage.freshness_item++;
    if (fm.date_pulled) findings.sourceFmCoverage.has_date_pulled++;
    const fname = basename(rel, '.md');
    const domain = fname.split('-')[0] || 'unknown';
    findings.sourceDomainCounts[domain] = (findings.sourceDomainCounts[domain] || 0) + 1;
    if (fname.startsWith('cache-scripts-')) findings.cacheLeakSources.push(rel);
    if (/[()+]|--|\.(?!md$)/.test(fname)) findings.hostileFilenames.push(rel);
  }

  // Reports tree: classify under 02_Reports
  if (rel.startsWith('02_Reports/')) {
    const sub = rel.slice('02_Reports/'.length);
    for (const live of Object.keys(findings.reportsLive)) {
      if (sub.startsWith(live + '/')) findings.reportsLive[live]++;
    }
    for (const orphan of Object.keys(findings.reportsOrphan)) {
      if (sub.startsWith(orphan + '/') && !sub.startsWith('Briefings/' + orphan + '/') && !sub.startsWith('Monitoring/' + orphan + '/')) {
        findings.reportsOrphan[orphan]++;
      }
    }
  }

  // Raw-data leakage rule: 05_Data_Pulls must not exist in The Research Spine.
  // Any file under that path violates the link-only contract regardless of frontmatter.
  if (rel.startsWith('05_Data_Pulls/')) {
    const policy = (fm.raw_data_policy || '').toLowerCase();
    findings.rawLeakage.push({ rel, policy: policy || '(none)' });
  }

  // PowerShell scripts referenced (in body or fenced blocks)
  let m;
  PS_RE.lastIndex = 0;
  while ((m = PS_RE.exec(body))) {
    const name = m[1];
    if (!findings.missingPsScripts.find(x => x.name === name && x.from === rel)) {
      // Try a few common locations
      const candidates = [
        join(VAULT, '99_System', 'scripts', name),
        join(VAULT, '99_System', name),
        join(VAULT, name),
      ];
      if (!candidates.some(existsSync)) findings.missingPsScripts.push({ name, from: rel });
    }
  }

  // Templater templates folder hint
  if (rel.startsWith('_templates/') || rel.startsWith('99_System/templates/')) {
    findings.pluginSignals.templaterTemplates++;
  }
}

// Orphan folder pass: any directory under vault whose only .md files are README.md or none.
function listDirs(root) {
  const out = [];
  (function recur(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      if (SKIP_DIRS.has(e.name)) continue;
      const full = join(dir, e.name);
      out.push(full);
      recur(full);
    }
  })(root);
  return out;
}

for (const dirAbs of listDirs(VAULT)) {
  const rel = vaultRel(dirAbs);
  // Skip top-level structural folders we expect to be empty placeholders
  let entries;
  try { entries = readdirSync(dirAbs, { withFileTypes: true }); }
  catch { continue; }
  const mdFiles = entries.filter(e => e.isFile() && e.name.toLowerCase().endsWith('.md'));
  const subDirs = entries.filter(e => e.isDirectory() && !SKIP_DIRS.has(e.name));
  if (mdFiles.length === 0 && subDirs.length === 0) {
    findings.orphanFolders.push({ rel, kind: 'empty' });
  } else if (mdFiles.length === 1 && mdFiles[0].name.toLowerCase() === 'readme.md' && subDirs.length === 0) {
    findings.orphanFolders.push({ rel, kind: 'readme-only' });
  }
}

// ── Report ────────────────────────────────────────────────────────────────────

const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const outDir = join(VAULT, '99_System', 'inventory');
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, `research-spine-audit-${today}.md`);

function table(headers, rows) {
  const head = `| ${headers.join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map(r => `| ${r.map(c => String(c).replace(/\|/g, '\\|')).join(' | ')} |`).join('\n');
  return [head, sep, body].join('\n');
}

function section(title, body) { return `\n## ${title}\n\n${body}\n`; }

const lines = [];
lines.push('---');
lines.push('type: research_spine_audit');
lines.push(`title: Research Spine Audit ${today}`);
lines.push(`date: ${new Date().toISOString().slice(0, 10)}`);
lines.push(`vault_root: ${VAULT}`);
lines.push('tags:');
lines.push('  - research-spine');
lines.push('  - audit');
lines.push('---');
lines.push('');
lines.push(`# Research Spine Audit - ${today}`);
lines.push('');
lines.push(`Vault: ${VAULT}`);
lines.push(`Total markdown files: ${findings.fileSummary.total}`);

lines.push(section('Files By Top Folder', table(
  ['Folder', 'Markdown Files'],
  Object.entries(findings.fileSummary.byTopFolder).sort((a, b) => b[1] - a[1]),
)));

lines.push(section('Reports Tree (02_Reports)', [
  'Live tree (script-written by `research-spine-flow.mjs`):',
  '',
  table(['Path', 'File Count'], Object.entries(findings.reportsLive)),
  '',
  'Orphan tree (not written by current flow; candidate for archive/delete):',
  '',
  table(['Path', 'File Count'], Object.entries(findings.reportsOrphan)),
].join('\n')));

lines.push(section('Source Note Frontmatter Coverage (01_Freshness/Sources)', table(
  ['Field', 'Count', 'Coverage'],
  [
    ['total source notes', findings.sourceFmCoverage.total, '100%'],
    ['type = freshness_item', findings.sourceFmCoverage.freshness_item, pct(findings.sourceFmCoverage.freshness_item, findings.sourceFmCoverage.total)],
    ['has date_pulled', findings.sourceFmCoverage.has_date_pulled, pct(findings.sourceFmCoverage.has_date_pulled, findings.sourceFmCoverage.total)],
  ],
)));

lines.push(section('Source Notes By Domain Prefix', table(
  ['Domain', 'Count'],
  Object.entries(findings.sourceDomainCounts).sort((a, b) => b[1] - a[1]),
)));

lines.push(section(`Cache Leakage In Sources (${findings.cacheLeakSources.length})`,
  findings.cacheLeakSources.length
    ? findings.cacheLeakSources.map(p => `- ${p}`).join('\n')
    : 'None.'));

lines.push(section(`Hostile Filenames (${findings.hostileFilenames.length})`,
  findings.hostileFilenames.length
    ? findings.hostileFilenames.map(p => `- ${p}`).join('\n')
    : 'None.'));

lines.push(section(`Broken Wiki-Links (${findings.brokenWikilinks.length})`,
  findings.brokenWikilinks.length
    ? table(['From', 'Target', 'Reason'], findings.brokenWikilinks.map(x => [x.from, x.target, x.reason]))
    : 'None.'));

lines.push(section(`Ambiguous Wiki-Links (${findings.ambiguousWikilinks.length})`,
  findings.ambiguousWikilinks.length
    ? table(['From', 'Target', 'Match Count'], findings.ambiguousWikilinks.map(x => [x.from, x.target, x.hits]))
    : 'None.'));

lines.push(section(`Broken Dataview FROM Clauses (${findings.brokenDataviewFroms.length})`,
  findings.brokenDataviewFroms.length
    ? table(['From', 'FROM Target'], findings.brokenDataviewFroms.map(x => [x.from, x.target]))
    : 'None.'));

lines.push(section(`Orphan Folders (${findings.orphanFolders.length})`,
  findings.orphanFolders.length
    ? table(['Folder', 'Kind'], findings.orphanFolders.map(x => [x.rel || '(root)', x.kind]))
    : 'None.'));

lines.push(section(`Raw Data Leakage In 05_Data_Pulls (${findings.rawLeakage.length})`,
  findings.rawLeakage.length
    ? table(['File', 'raw_data_policy'], findings.rawLeakage.map(x => [x.rel, x.policy]))
    : 'None.'));

lines.push(section(`Missing PowerShell Scripts Referenced (${findings.missingPsScripts.length})`,
  findings.missingPsScripts.length
    ? table(['Referenced From', 'Script Name'], findings.missingPsScripts.map(x => [x.from, x.name]))
    : 'None.'));

lines.push(section('Plugin Usage Signals', table(
  ['Signal', 'Count'],
  [
    ['Dataview blocks', findings.pluginSignals.dataviewBlocks],
    ['Open task items (- [ ])', findings.pluginSignals.taskItems],
    ['Templater templates', findings.pluginSignals.templaterTemplates],
  ],
)));

if (!NO_WRITE) {
  writeFileSync(outFile, lines.join('\n'), 'utf-8');
}

function pct(a, b) {
  if (!b) return 'n/a';
  return Math.round((100 * a) / b) + '%';
}

// ── Stdout summary ────────────────────────────────────────────────────────────

console.log(`Research Spine root: ${VAULT}`);
console.log(`Markdown files: ${findings.fileSummary.total}`);
console.log(`Broken wiki-links: ${findings.brokenWikilinks.length}`);
console.log(`Ambiguous wiki-links: ${findings.ambiguousWikilinks.length}`);
console.log(`Broken Dataview FROM clauses: ${findings.brokenDataviewFroms.length}`);
console.log(`Cache-leak source notes: ${findings.cacheLeakSources.length}`);
console.log(`Hostile filenames: ${findings.hostileFilenames.length}`);
console.log(`Orphan folders: ${findings.orphanFolders.length}`);
console.log(`Raw-data leakage in 05_Data_Pulls: ${findings.rawLeakage.length}`);
console.log(`Missing PowerShell scripts referenced: ${findings.missingPsScripts.length}`);
console.log(`Source notes total / typed / dated: ${findings.sourceFmCoverage.total} / ${findings.sourceFmCoverage.freshness_item} / ${findings.sourceFmCoverage.has_date_pulled}`);
console.log(`Reports live (Briefings+Monitoring): ${Object.values(findings.reportsLive).reduce((a, b) => a + b, 0)}`);
console.log(`Reports orphan (Daily+Weekly+Monthly): ${Object.values(findings.reportsOrphan).reduce((a, b) => a + b, 0)}`);
console.log('');
if (NO_WRITE) {
  console.log(`Dry-run: would write ${outFile}`);
} else {
  console.log(`Wrote: ${outFile}`);
}

// ── Inbox write ───────────────────────────────────────────────────────────────

if (NO_WRITE) {
  console.log('dry-run: skipping report and Inbox.md writes.');
} else if (!WRITE_INBOX) {
  console.log('Archive audit: skipping Research Spine Inbox write. Use --write-archive-inbox to update the archived inbox.');
} else {
  const inboxPath = join(VAULT, '04_Human_Notes', 'Inbox.md');
  if (!existsSync(inboxPath)) {
    console.warn(`Warning: Inbox.md not found at ${inboxPath} — skipping Inbox write.`);
  } else {
    const todayIso = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const heading = `## Audit Findings — ${todayIso}`;

    // ── Build actionable findings list ─────────────────────────────────────────
    // Severity: critical | high | medium | low
    // Each entry: { severity, text, link? }
    const actionable = [];

    // Broken wiki-links → high (each individual link is actionable)
    for (const bwl of findings.brokenWikilinks) {
      actionable.push({
        severity: 'high',
        text: `Fix broken wiki-link [[${bwl.target}]] (${bwl.reason})`,
        link: bwl.from,
      });
    }

    // Broken Dataview FROM clauses → high
    for (const dvf of findings.brokenDataviewFroms) {
      actionable.push({
        severity: 'high',
        text: `Fix broken Dataview FROM "${dvf.target}"`,
        link: dvf.from,
      });
    }

    // Cache-leak source notes → critical
    for (const cl of findings.cacheLeakSources) {
      actionable.push({
        severity: 'critical',
        text: `Remove cache-leak source note`,
        link: cl,
      });
    }

    // Raw-data leakage → critical
    for (const rl of findings.rawLeakage) {
      actionable.push({
        severity: 'critical',
        text: `Raw data leakage in 05_Data_Pulls (policy: ${rl.policy}) — move or delete`,
        link: rl.rel,
      });
    }

    // Hostile filenames → medium
    for (const hf of findings.hostileFilenames) {
      actionable.push({
        severity: 'medium',
        text: `Rename hostile filename (special chars in name)`,
        link: hf,
      });
    }

    // Orphan folders → medium
    for (const of_ of findings.orphanFolders) {
      actionable.push({
        severity: 'medium',
        text: `Clean up orphan folder (${of_.kind})`,
        link: of_.rel,
      });
    }

    // Missing PowerShell scripts → low
    for (const ps of findings.missingPsScripts) {
      actionable.push({
        severity: 'low',
        text: `Remove stale PowerShell reference to ${ps.name}`,
        link: ps.from,
      });
    }

    // Frontmatter coverage gaps → medium (summarised, not per-file)
    const { total, freshness_item, has_date_pulled } = findings.sourceFmCoverage;
    if (total > 0) {
      const missingType = total - freshness_item;
      const missingDate = total - has_date_pulled;
      if (missingType > 0) {
        actionable.push({
          severity: 'medium',
          text: `${missingType} source note(s) missing type: freshness_item — update frontmatter`,
          link: '01_Freshness/Sources',
        });
      }
      if (missingDate > 0) {
        actionable.push({
          severity: 'medium',
          text: `${missingDate} source note(s) missing date_pulled — update frontmatter`,
          link: '01_Freshness/Sources',
        });
      }
    }

    // Orphan reports subfolders → low (aggregate)
    const orphanReportCount = Object.values(findings.reportsOrphan).reduce((a, b) => a + b, 0);
    if (orphanReportCount > 0) {
      actionable.push({
        severity: 'low',
        text: `${orphanReportCount} file(s) in orphan 02_Reports subfolders (Daily/Weekly/Monthly) — archive or delete`,
        link: '02_Reports',
      });
    }

    // ── Format task lines ───────────────────────────────────────────────────────
    const taskLines = actionable.map(({ severity, text, link }) => {
      const linkPart = link ? ` - \`${link}\`` : '';
      return `- [ ] [audit/${severity}] ${text}${linkPart}`;
    });

    const sectionBlock = [
      heading,
      '',
      taskLines.length > 0
        ? taskLines.join('\n')
        : '_No actionable findings._',
      '',
    ].join('\n');

    // ── Idempotent replace or append ────────────────────────────────────────────
    let inboxRaw = readFileSync(inboxPath, 'utf-8');
    // Strip BOM
    if (inboxRaw.charCodeAt(0) === 0xFEFF) inboxRaw = inboxRaw.slice(1);

    // Match an existing section for today's date (heading up to next ## or EOF)
    const sectionRe = new RegExp(
      `(${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})[\\s\\S]*?(?=\\n## |$)`,
      'g',
    );

    let newInbox;
    if (sectionRe.test(inboxRaw)) {
      // Replace existing section in place — preserves position, keeps idempotent.
      sectionRe.lastIndex = 0;
      newInbox = inboxRaw.replace(sectionRe, sectionBlock.trimEnd());
    } else {
      // Insert above the `<!-- AUTO-INSERT-ABOVE -->` marker so the newest
      // dated section sits on top. Fall back to end-append when the marker is
      // absent (pre-marker Inboxes or minimal test fixtures).
      const marker = '<!-- AUTO-INSERT-ABOVE';
      const markerIdx = inboxRaw.indexOf(marker);
      if (markerIdx >= 0) {
        const before = inboxRaw.slice(0, markerIdx).replace(/\s+$/, '');
        const after = inboxRaw.slice(markerIdx);
        newInbox = `${before}\n\n${sectionBlock.trimEnd()}\n\n${after}`;
      } else {
        newInbox = inboxRaw.trimEnd() + '\n\n' + sectionBlock.trimEnd() + '\n';
      }
    }

    writeFileSync(inboxPath, newInbox, 'utf-8');
    console.log(`Inbox: wrote ${actionable.length} finding(s) to ${inboxPath}`);
    console.log(`  critical: ${actionable.filter(a => a.severity === 'critical').length}`);
    console.log(`  high:     ${actionable.filter(a => a.severity === 'high').length}`);
    console.log(`  medium:   ${actionable.filter(a => a.severity === 'medium').length}`);
    console.log(`  low:      ${actionable.filter(a => a.severity === 'low').length}`);
  }
}
