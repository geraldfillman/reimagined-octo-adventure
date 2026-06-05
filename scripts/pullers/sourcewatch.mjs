#!/usr/bin/env node
/**
 * sourcewatch.mjs — S1 news-scan entrypoint for the routine runner.
 *
 * Thin wrapper over the existing pullers/source-watch.mjs library. Translates
 * the runbook's --since=<window> argument into a lookback and writes a
 * slot-tailored "overnight digest" at 04_News/_runs/<date>/overnight.md
 * grouped by source category, in addition to the canonical SourceWatch_Posts
 * note that source-watch.mjs writes.
 *
 * Usage:
 *   node scripts/pullers/sourcewatch.mjs --since=overnight
 *   node scripts/pullers/sourcewatch.mjs --since=24h --include-disabled
 *   node scripts/pullers/sourcewatch.mjs --since=3d  --limit=30
 *   node scripts/pullers/sourcewatch.mjs --dry-run
 *
 * Exit codes:
 *   0  digest written (possibly with manual-review notices)
 *   1  hard error (registry load failure, etc.)
 */

import { join } from 'node:path';

import { pull as pullSourceWatch } from './source-watch.mjs';
import { getEngineRoot } from '../lib/config.mjs';
import { buildNote, buildTable, writeNote } from '../lib/markdown.mjs';

const DEFAULT_LIMIT = 50;

const argv = parseArgs(process.argv.slice(2));
main().catch(err => { console.error(err?.stack || err?.message || err); process.exit(1); });

function parseArgs(args) {
  const out = { since: 'overnight', dryRun: false, includeDisabled: false, limit: DEFAULT_LIMIT, json: false };
  for (const a of args) {
    if (a.startsWith('--since=')) out.since = a.slice(8);
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--include-disabled') out.includeDisabled = true;
    else if (a.startsWith('--limit=')) out.limit = Math.max(1, Number(a.slice(8)) || DEFAULT_LIMIT);
    else if (a === '--json') out.json = true;
  }
  return out;
}

// Translate slot-friendly windows to lookback days.
// overnight = since previous close (treat as 1 day to keep simple); 24h same; today same.
// Nd/Nh/Nw allowed.
function sinceToLookbackDays(since) {
  const s = String(since || '').toLowerCase().trim();
  if (!s || s === 'overnight' || s === 'today' || s === '24h' || s === '1d') return 1;
  const m = s.match(/^(\d+)([dhw])$/);
  if (!m) return 1;
  const n = Number(m[1]);
  if (m[2] === 'd') return Math.max(1, n);
  if (m[2] === 'h') return Math.max(1, Math.ceil(n / 24));
  if (m[2] === 'w') return Math.max(1, n * 7);
  return 1;
}

const CATEGORY_ORDER = [
  'central-bank',
  'fiscal',
  'regulator',
  'macro',
  'energy',
  'biotech',
  'defense',
  'tech',
  'markets',
  'flow',
  'narrative',
  'other',
];

function groupByCategory(posts) {
  const buckets = new Map();
  for (const p of posts) {
    const cat = (p.category || 'other').toLowerCase();
    if (!buckets.has(cat)) buckets.set(cat, []);
    buckets.get(cat).push(p);
  }
  // sort by configured order, unknowns at end alphabetically
  const known = CATEGORY_ORDER.filter(c => buckets.has(c));
  const unknown = [...buckets.keys()].filter(c => !CATEGORY_ORDER.includes(c)).sort();
  return [...known, ...unknown].map(cat => ({ category: cat, posts: buckets.get(cat) }));
}

function buildDigestNote({ posts, statuses, sinceLabel, lookbackDays, limit }) {
  const today = new Date().toISOString().slice(0, 10);
  const trimmed = posts.slice(0, limit);
  const grouped = groupByCategory(trimmed);
  const manualReviewCount = statuses.filter(s => s.status !== 'ok').length;

  const frontmatter = {
    type: 'news-overnight-digest',
    source_vault: 'My_Data',
    generated_by: 'S1',
    generator_script: 'scripts/pullers/sourcewatch.mjs',
    created: today,
    since: sinceLabel,
    lookback_days: lookbackDays,
    selected_sources: statuses.length,
    posts_total: posts.length,
    posts_in_digest: trimmed.length,
    manual_review_count: manualReviewCount,
    signal_status: posts.length > 0 ? 'watch' : 'clear',
    tags: ['news', 'overnight', 'automation', 's1'],
  };

  const sections = [];

  const summary = `# Overnight Source Watch — ${today}

Window: **${sinceLabel}** (lookback ${lookbackDays}d) · sources ${statuses.length} · new posts ${posts.length} · digest top ${trimmed.length}.

${manualReviewCount > 0 ? `> ${manualReviewCount} source(s) need manual review (see Source Status below).\n` : ''}`;
  sections.push({ content: summary });

  if (trimmed.length === 0) {
    sections.push({ heading: 'Headlines', content: '_No new posts in window._' });
  } else {
    for (const group of grouped) {
      const rows = group.posts.map(p => [
        formatDateOnly(p.publishedAt),
        truncate(p.title || '(untitled)', 140),
        p.source || '',
        p.url ? `[link](${p.url})` : '',
      ]);
      sections.push({
        heading: `Headlines — ${formatCategory(group.category)} (${group.posts.length})`,
        content: buildTable(['Date', 'Title', 'Source', 'URL'], rows),
      });
    }
  }

  const statusRows = statuses
    .slice()
    .sort((a, b) => (a.status === 'ok' ? 1 : -1) - (b.status === 'ok' ? 1 : -1))
    .map(s => [s.source || s.id || '?', s.status || '?', truncate(s.note || s.error || '', 120)]);
  sections.push({
    heading: 'Source Status',
    content: buildTable(['Source', 'Status', 'Note'], statusRows),
  });

  return buildNote({ frontmatter, sections });
}

function formatCategory(cat) {
  return String(cat || 'other').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatDateOnly(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso).slice(0, 10) : d.toISOString().slice(0, 10);
}

function truncate(s, n) {
  const str = String(s ?? '');
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

async function main() {
  const lookbackDays = sinceToLookbackDays(argv.since);
  const flags = {
    'lookback-days': lookbackDays,
    'dry-run': argv.dryRun,
    'include-disabled': argv.includeDisabled,
    includePosts: true,
    // Do not request JSON output from inner pull — we own the stdout contract.
  };

  console.log(`sourcewatch: since=${argv.since} → lookback=${lookbackDays}d limit=${argv.limit} dryRun=${argv.dryRun}`);

  const result = await pullSourceWatch(flags);
  if (argv.dryRun) {
    if (argv.json) console.log(JSON.stringify(result, null, 2));
    return; // dry run already short-circuited inside source-watch
  }

  const posts    = Array.isArray(result?.posts) ? result.posts : [];
  const statuses = Array.isArray(result?.statuses) ? result.statuses : [];

  const today = new Date().toISOString().slice(0, 10);
  const digestPath = join(getEngineRoot(), '04_News', '_runs', today, 'overnight.md');
  const note = buildDigestNote({
    posts,
    statuses,
    sinceLabel: argv.since,
    lookbackDays,
    limit: argv.limit,
  });
  writeNote(digestPath, note); // emits OUTPUT: automatically

  if (argv.json) {
    console.log(JSON.stringify({
      digestPath,
      sourceWatchPath: result?.filePath,
      postsInDigest: Math.min(posts.length, argv.limit),
      postsTotal: posts.length,
      manualReviewCount: statuses.filter(s => s.status !== 'ok').length,
    }, null, 2));
  }
}
