/**
 * freshness-source-writer.mjs - Generates link-only freshness source notes for My_Data reports.
 *
 * Walks My_Data/05_Data_Pulls/ (raw pull notes), groups by (domain, source, data_type),
 * and writes one summary note per group to:
 *
 *   <REVIEW_VAULT>/Reports/Freshness/Sources/<domain>__<source>__<data_type>.md
 *
 * Idempotent: deterministic filenames, full overwrite. Skips .cache/, _archive/, and other
 * non-pull paths. Pass --prune to delete any Sources note not produced this run (cleans up
 * stale outputs from earlier generators with hostile filenames).
 *
 * Output frontmatter uses link-only freshness fields:
 * type=freshness_item, date_pulled, domain, source, signal_status.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { basename, dirname, extname, join, relative, sep } from 'path';

import { getPullsDir, getReviewVaultRoot, toEngineRelative } from '../lib/config.mjs';
import { buildNote } from '../lib/markdown.mjs';

const SKIP_PATH_PARTS = new Set(['.cache', '_archive', '_archived', 'node_modules', '.git']);
const SOURCES_SUBPATH = ['Reports', 'Freshness', 'Sources'];

export async function pull(flags = {}) {
  const pullsDir = getPullsDir();
  const reviewRoot = getReviewVaultRoot();
  const sourcesDir = join(reviewRoot, ...SOURCES_SUBPATH);
  const dryRun = Boolean(flags['dry-run']);
  const prune = Boolean(flags.prune);

  if (!existsSync(pullsDir)) {
    console.log(`Pulls directory not found: ${pullsDir}`);
    return { source: 'freshness-source-writer', wrote: 0, pruned: 0 };
  }

  const pullFiles = walkMd(pullsDir);
  const groups = groupPulls(pullFiles, pullsDir);
  const notes = Array.from(groups.values()).map(buildSourceNote);

  if (dryRun) {
    for (const note of notes) console.log(`[dry-run] would write ${note.filename} (${note.pullCount} pulls)`);
    return { source: 'freshness-source-writer', dryRun: true, groups: notes.length };
  }

  mkdirSync(sourcesDir, { recursive: true });
  const writtenNames = new Set();
  for (const note of notes) {
    const path = join(sourcesDir, note.filename);
    writeFileSync(path, note.markdown, 'utf-8');
    writtenNames.add(note.filename);
  }
  console.log(`Wrote ${writtenNames.size} freshness source note(s) to ${sourcesDir}`);

  let prunedCount = 0;
  if (prune) {
    for (const entry of readdirSync(sourcesDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (!entry.name.toLowerCase().endsWith('.md')) continue;
      if (writtenNames.has(entry.name)) continue;
      unlinkSync(join(sourcesDir, entry.name));
      prunedCount++;
    }
    console.log(`Pruned ${prunedCount} stale source note(s).`);
  }

  return { source: 'freshness-source-writer', wrote: writtenNames.size, pruned: prunedCount };
}

// ── Walk + parse ──────────────────────────────────────────────────────────────

function walkMd(root) {
  const out = [];
  (function recur(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      if (SKIP_PATH_PARTS.has(e.name)) continue;
      if (e.name.startsWith('.')) continue;
      const full = join(dir, e.name);
      if (e.isDirectory()) recur(full);
      else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) out.push(full);
    }
  })(root);
  return out;
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function parseFrontmatter(text) {
  const match = text.match(FRONTMATTER_RE);
  if (!match) return null;
  const fm = {};
  for (const raw of match[1].split(/\r?\n/)) {
    const kv = raw.match(/^\s*([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    fm[kv[1]] = kv[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return fm;
}

function inferDomainFromPath(filePath, pullsRoot) {
  const rel = relative(pullsRoot, filePath);
  const top = rel.split(/[\\/]/)[0] || 'unknown';
  return top.toLowerCase();
}

function groupPulls(filePaths, pullsRoot) {
  const groups = new Map();
  for (const filePath of filePaths) {
    let text;
    try { text = readFileSync(filePath, 'utf-8'); }
    catch { continue; }
    const fm = parseFrontmatter(text) || {};
    const stat = statSync(filePath);

    const source = (fm.source || basename(dirname(filePath))).trim();
    const domain = (fm.domain || inferDomainFromPath(filePath, pullsRoot)).toLowerCase();
    const dataType = (fm.data_type || 'pull_note').toLowerCase();
    const cadence = fm.cadence || fm.frequency || 'on-demand';
    const datePulled = fm.date_pulled || stat.mtime.toISOString().slice(0, 10);
    const signalStatus = (fm.signal_status || 'unknown').toLowerCase();
    const dateSort = Date.parse(`${datePulled}T00:00:00`) || stat.mtime.getTime();

    const key = `${domain}::${source}::${dataType}`;
    const prev = groups.get(key);
    if (!prev || dateSort > prev.dateSort) {
      groups.set(key, {
        source,
        domain,
        dataType,
        cadence,
        datePulled,
        signalStatus,
        dateSort,
        latestFilePath: filePath,
        latestRel: toEngineRelative(filePath).replace(/\\/g, '/'),
        pullCount: (prev?.pullCount || 0) + 1,
        title: fm.title || basename(filePath, '.md'),
      });
    } else {
      prev.pullCount++;
    }
  }
  return groups;
}

// ── Build note ────────────────────────────────────────────────────────────────

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function buildSourceNote(group) {
  const filename = `${slug(group.domain)}__${slug(group.source)}__${slug(group.dataType)}.md`;
  const obsidianUrl = `obsidian://open?vault=My_Data&file=${encodeURIComponent(group.latestRel)}`;

  const markdown = buildNote({
    frontmatter: {
      type: 'freshness_item',
      title: `${group.source} - ${group.dataType}`,
      source: group.source,
      domain: group.domain,
      data_type: group.dataType,
      cadence: group.cadence,
      date_pulled: group.datePulled,
      signal_status: group.signalStatus,
      source_rel_path: group.latestRel,
      obsidian_url: obsidianUrl,
      pull_count: group.pullCount,
      freshness_kind: 'pull_note',
      tags: ['world-machine-review', 'freshness'],
    },
    sections: [
      {
        heading: `${group.source} - ${group.dataType}`,
        content: [
          `- Source: ${group.source}`,
          `- Domain: ${group.domain}`,
          `- Data type: ${group.dataType}`,
          `- Cadence: ${group.cadence}`,
          `- Last pull: ${group.datePulled}`,
          `- Signal status: ${group.signalStatus}`,
          `- Pull count in group: ${group.pullCount}`,
          `- Latest pull: [${group.title}](${obsidianUrl})`,
          `- My_Data path: \`${group.latestRel}\``,
          '',
          'This is a generated freshness note. Edit the linked source material in `My_Data` or human notes; not this file.',
        ].join('\n'),
      },
    ],
  });

  return { filename, markdown, pullCount: group.pullCount };
}
