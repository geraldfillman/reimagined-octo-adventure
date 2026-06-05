/**
 * eod-digest.mjs — Write a structured end-of-day markdown digest to My_Data reports.
 *
 * Called by the bridge daily chain at Step 6:
 *   import('../bridge/eod-digest.mjs').then(m => m.run(flags))
 *
 * Output: <REPORTS_VAULT_ROOT>/Reports/EOD/Briefings/<today>_EOD_Digest.md
 */

import { existsSync, readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { getEngineRoot, getReviewVaultRoot } from '../lib/config.mjs';

const TODAY = new Date().toISOString().slice(0, 10);
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const SIGNAL_DIRS = ['06_Signals', '10_Theses'];

// ── Frontmatter parser (same pattern as approve-queue.mjs) ────────────────────

function parseFrontmatter(text) {
  if (!text.startsWith('---')) return null;
  const secondDash = text.indexOf('\n---', 3);
  if (secondDash === -1) return null;
  const block = text.slice(3, secondDash).trim();
  const fields = {};
  for (const line of block.split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    if (key) fields[key] = value;
  }
  return fields;
}

// ── File collector (same pattern as approve-queue.mjs) ───────────────────────

function collectMdFiles(dir) {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...collectMdFiles(full));
    else if (entry.isFile() && extname(entry.name) === '.md') results.push(full);
  }
  return results;
}

// ── Section 1: Signals fired today ───────────────────────────────────────────

function collectSignalsToday(engineRoot) {
  const dir = join(engineRoot, '06_Signals');
  const files = collectMdFiles(dir);
  const results = [];
  for (const fp of files) {
    try {
      const text = readFileSync(fp, 'utf-8');
      const fields = parseFrontmatter(text);
      if (!fields) continue;
      const dateVal = fields.created || fields.date || '';
      if (!dateVal.startsWith(TODAY)) continue;
      results.push({
        name: basename(fp, '.md'),
        type: fields.type || fields.signal_type || '',
        severity: fields.severity || '',
      });
    } catch { /* skip unreadable files */ }
    if (results.length >= 20) break;
  }
  return results;
}

// ── Section 2: Packets promoted today ────────────────────────────────────────

function collectPromotedToday(engineRoot) {
  const results = [];
  for (const dir of SIGNAL_DIRS) {
    for (const fp of collectMdFiles(join(engineRoot, dir))) {
      try {
        const text = readFileSync(fp, 'utf-8');
        const fields = parseFrontmatter(text);
        if (!fields) continue;
        if (!(fields.promoted_at || '').startsWith(TODAY)) continue;
        results.push({
          packet_id: fields.packet_id || '',
          type: fields.type || '',
          name: basename(fp, '.md'),
        });
      } catch { /* skip */ }
    }
  }
  return results;
}

// ── Section 3: Source gaps (critical + high) ─────────────────────────────────

function collectSourceGaps(reviewRoot) {
  const gapPath = join(reviewRoot, 'Reports', 'Source Gap Register.md');
  if (!existsSync(gapPath)) return null;
  const lines = readFileSync(gapPath, 'utf-8').split('\n');
  const results = [];
  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length < 3) continue;
    const severity = cells[cells.length - 1].toLowerCase();
    if (severity !== 'critical' && severity !== 'high') continue;
    if (cells[0] === 'Puller' || cells[0] === '---') continue;
    results.push({ puller: cells[0], failure_count: cells[1], severity });
  }
  return results;
}

// ── Section 4: Stale unreviewed packets ──────────────────────────────────────

function collectStaleUnreviewed(engineRoot) {
  const now = Date.now();
  const results = [];
  for (const dir of SIGNAL_DIRS) {
    for (const fp of collectMdFiles(join(engineRoot, dir))) {
      try {
        const text = readFileSync(fp, 'utf-8');
        const fields = parseFrontmatter(text);
        if (!fields || fields.review_status !== 'unreviewed') continue;
        const mtime = statSync(fp).mtime.getTime();
        const ageDays = Math.floor((now - mtime) / (1000 * 60 * 60 * 24));
        if (ageDays <= 3) continue;
        results.push({ name: basename(fp, '.md'), packet_id: fields.packet_id || '', ageDays });
      } catch { /* skip */ }
    }
  }
  return results;
}

// ── Section 5: Failed cadence tasks from today's run summaries ───────────────

function collectFailedTasks(reviewRoot) {
  const summariesDir = join(reviewRoot, 'Reports', 'System', 'run_summaries');
  if (!existsSync(summariesDir)) return [];
  const todayFiles = readdirSync(summariesDir).filter(f => f.startsWith(TODAY) && f.endsWith('.md'));
  const results = [];
  for (const filename of todayFiles) {
    try {
      const content = readFileSync(join(summariesDir, filename), 'utf-8');
      for (const line of content.split('\n')) {
        if (!line.startsWith('|')) continue;
        const cells = line.split('|').map(c => c.trim()).filter(Boolean);
        if (cells.length < 2) continue;
        const status = cells[1];
        if (status !== 'FAILED' && !status.includes('❌') && !status.includes('✗')) continue;
        if (cells[0] === 'Puller' || cells[0] === '---') continue;
        results.push({ puller: cells[0], step: filename.replace('.md', '') });
      }
    } catch { /* skip */ }
  }
  return results;
}

// ── Markdown builder ──────────────────────────────────────────────────────────

function buildDigest({ signals, promoted, gaps, stale, failures }) {
  const fmt = (rows, header, sep, mapRow, emptyMsg) =>
    rows.length === 0 ? `_${emptyMsg}_` : [header, sep, ...rows.map(mapRow)].join('\n');

  const gapSection = gaps === null
    ? '_No gap register found_'
    : fmt(
        gaps,
        '| Puller | Failures | Severity |',
        '|---|---|---|',
        r => `| ${r.puller} | ${r.failure_count} | ${r.severity} |`,
        'None'
      );

  const parts = [
    '---',
    'type: eod_digest',
    `date: ${TODAY}`,
    'run_id: null',
    `signals_count: ${signals.length}`,
    `promoted_count: ${promoted.length}`,
    `gaps_count: ${gaps ? gaps.length : 0}`,
    `stale_count: ${stale.length}`,
    `failures_count: ${failures.length}`,
    '---',
    '',
    `# EOD Digest — ${TODAY}`,
    '',
    `## Signals Fired Today (${signals.length})`,
    fmt(
      signals,
      '| Signal | Type | Severity |',
      '|---|---|---|',
      r => `| ${r.name} | ${r.type} | ${r.severity} |`,
      'None'
    ),
    '',
    `## Packets Promoted (${promoted.length})`,
    fmt(
      promoted,
      '| Packet ID | Type | File |',
      '|---|---|---|',
      r => `| ${r.packet_id} | ${r.type} | ${r.name} |`,
      'None'
    ),
    '',
    `## Source Gaps — Critical & High (${gaps ? gaps.length : 0})`,
    gapSection,
    '',
    `## Stale Unreviewed (${stale.length})`,
    fmt(
      stale,
      '| File | Packet ID | Age (days) |',
      '|---|---|---|',
      r => `| ${r.name} | ${r.packet_id} | ${r.ageDays} |`,
      'None'
    ),
    '',
    `## Failed Cadence Tasks (${failures.length})`,
    fmt(
      failures,
      '| Puller | Run |',
      '|---|---|',
      r => `| ${r.puller} | ${r.step} |`,
      'None'
    ),
    '',
  ];

  return parts.join('\n');
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function run(flags = {}) {
  const dryRun = Boolean(flags.dryRun ?? flags['dry-run']);
  const reviewRoot = getReviewVaultRoot();
  const engineRoot = flags.engineRoot || getEngineRoot();

  const signals  = collectSignalsToday(engineRoot);
  const promoted = collectPromotedToday(engineRoot);
  const gaps     = collectSourceGaps(reviewRoot);
  const stale    = collectStaleUnreviewed(engineRoot);
  const failures = collectFailedTasks(reviewRoot);

  const content = buildDigest({ signals, promoted, gaps, stale, failures });

  const outDir  = join(reviewRoot, 'Reports', 'EOD', 'Briefings');
  const outFile = `${TODAY}_EOD_Digest.md`;
  const outputPath = join(outDir, outFile);

  if (dryRun) {
    console.log(`[eod-digest] DRY RUN — would write to: ${outputPath}\n`);
    console.log(content);
  } else {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(outputPath, content, 'utf-8');
    console.log(`[eod-digest] Wrote → ${outputPath}`);
  }

  return {
    outputPath,
    counts: {
      signals:  signals.length,
      promoted: promoted.length,
      gaps:     gaps ? gaps.length : 0,
      stale:    stale.length,
      failures: failures.length,
    },
  };
}

// Allow direct invocation: node scripts/bridge/eod-digest.mjs [--dry-run]
if (process.argv[1]?.endsWith('eod-digest.mjs')) {
  const dryRun = process.argv.includes('--dry-run');
  run({ dryRun }).catch(err => { console.error(err); process.exit(1); });
}
