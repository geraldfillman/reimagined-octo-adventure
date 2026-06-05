#!/usr/bin/env node
/**
 * audit-scripts.mjs — One-shot audit of scripts/.
 *
 * Walks pullers/, lib/, kb/, routines/, and root *.ps1 wrappers; cross-
 * references router.mjs and routines/cadence.mjs to flag orphans, duplicate
 * patterns, .bak artifacts, and ad-hoc rate-limit handling. Writes
 * scripts/_AUDIT.md.
 *
 * Read-only. Run from anywhere:
 *   node scripts/system/audit-scripts.mjs
 */

import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'fs';
import { join, basename, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPTS_DIR = join(HERE, '..');

const RETRY_HINTS = [
  /\bbackoff\b/i,
  /\bretry\b/i,
  /\b429\b/,
  /rate.?limit/i,
  /Retry-After/i,
  /setTimeout\s*\(\s*[^,]+,\s*\d{3,}/,
];

function read(path) {
  try { return readFileSync(path, 'utf8'); } catch { return ''; }
}

function listFiles(dir, ext) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => !ext || f.endsWith(ext))
    .map(f => {
      const full = join(dir, f);
      const st = statSync(full);
      return {
        name: f,
        full,
        size: st.size,
        mtime: st.mtime.toISOString().slice(0, 10),
      };
    });
}

function fileLines(path) {
  return read(path).split('\n').length;
}

function extractImports(src) {
  const imports = [];
  const re = /import\s+(?:[^'"\n]+from\s+)?['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(src))) imports.push(m[1]);
  const dyn = /import\(\s*['"`]([^'"`]+)['"`]/g;
  while ((m = dyn.exec(src))) imports.push(m[1]);
  return imports;
}

function bytesToKB(n) {
  return (n / 1024).toFixed(1) + ' KB';
}

// ── Read cross-reference sources once ─────────────────────────────────────────

const routerSrc  = read(join(SCRIPTS_DIR, 'cmd', 'router.mjs'));
const cadenceSrc = read(join(SCRIPTS_DIR, 'routines', 'cadence.mjs'));
const runSrc     = read(join(SCRIPTS_DIR, 'run.mjs'));

function refsInRouter(stem)  { return routerSrc.includes(`pullers/${stem}.mjs`) || routerSrc.includes(`'${stem}'`); }
function refsInCadence(stem) { return cadenceSrc.includes(stem); }

// ── Pullers ───────────────────────────────────────────────────────────────────

const pullers = listFiles(join(SCRIPTS_DIR, 'pullers'), null).map(f => {
  const stem = basename(f.name, '.mjs');
  const isMjs = f.name.endsWith('.mjs');
  const isBak = f.name.includes('.bak') || f.name.includes('.backup');
  const src = isMjs ? read(f.full) : '';
  const lines = isMjs ? src.split('\n').length : 0;
  const imports = isMjs ? extractImports(src) : [];
  const hasRetry = RETRY_HINTS.some(rx => rx.test(src));
  return {
    ...f,
    stem,
    isMjs,
    isBak,
    lines,
    imports,
    hasRetry,
    inRouter: isMjs && refsInRouter(stem),
    inCadence: isMjs && refsInCadence(stem),
  };
});

// ── Lib modules ────────────────────────────────────────────────────────────────

const libs = listFiles(join(SCRIPTS_DIR, 'lib'), '.mjs').map(f => ({
  ...f,
  stem: basename(f.name, '.mjs'),
  lines: fileLines(f.full),
}));

// Importer count per lib
const allMjs = [
  ...pullers.filter(p => p.isMjs).map(p => p.full),
  ...libs.map(l => l.full),
  join(SCRIPTS_DIR, 'cmd', 'router.mjs'),
  join(SCRIPTS_DIR, 'routines', 'cadence.mjs'),
  join(SCRIPTS_DIR, 'run.mjs'),
];

for (const lib of libs) {
  let importers = 0;
  for (const file of allMjs) {
    if (file === lib.full) continue;
    const src = read(file);
    if (src.includes(`lib/${lib.stem}.mjs`) || src.includes(`/${lib.stem}.mjs`)) importers++;
  }
  lib.importers = importers;
}

// ── PowerShell wrappers ────────────────────────────────────────────────────────

const psFiles = listFiles(SCRIPTS_DIR, '.ps1').map(f => {
  const src = read(f.full);
  const lines = src.split('\n').length;
  const cmds = [...src.matchAll(/node\s+(?:run\.mjs|\$\w*Run\w*)\s+([^\r\n"]*)/g)]
    .map(m => m[1].trim())
    .filter(Boolean);
  const isScheduled = /Register-ScheduledTask|Task Scheduler/i.test(src) || /schedule-orb-tasks/i.test(f.name);
  return { ...f, lines, cmds, isScheduled };
});

// ── Stale / candidate detection ────────────────────────────────────────────────

const bakFiles = pullers.filter(p => p.isBak);
const orphanPullers = pullers.filter(p => p.isMjs && !p.inRouter && !p.inCadence);
const retryCandidates = pullers.filter(p => p.isMjs && p.hasRetry);
const orphanLibs = libs.filter(l => l.importers === 0);
const heavyPullers = pullers.filter(p => p.isMjs).sort((a, b) => b.lines - a.lines).slice(0, 10);

// OSINT cluster
const osintPullers = pullers.filter(p => p.isMjs && (p.stem.startsWith('osint-') || p.stem === 'snscrape'));

// Detect duplicate-ish names (e.g. thesis-* family)
const families = {};
for (const p of pullers.filter(x => x.isMjs)) {
  const fam = p.stem.split('-')[0];
  (families[fam] ||= []).push(p.stem);
}
const bigFamilies = Object.entries(families)
  .filter(([, names]) => names.length >= 3)
  .sort((a, b) => b[1].length - a[1].length);

// Legacy compat block in run.mjs
const legacyShimLines = (() => {
  const start = runSrc.indexOf('// ── Compat aliases');
  const end = runSrc.indexOf('// ── Shared utilities');
  if (start < 0 || end < 0) return null;
  const before = runSrc.slice(0, start).split('\n').length;
  const after = runSrc.slice(0, end).split('\n').length;
  return { start: before, end: after, count: after - before };
})();

// ── Render report ──────────────────────────────────────────────────────────────

function md_table(rows, headers) {
  const lines = [];
  lines.push('| ' + headers.join(' | ') + ' |');
  lines.push('|' + headers.map(() => '---').join('|') + '|');
  for (const r of rows) lines.push('| ' + r.map(c => String(c ?? '')).join(' | ') + ' |');
  return lines.join('\n');
}

const today = new Date().toISOString().slice(0, 10);

const out = [];
out.push(`# scripts/ Audit — ${today}`);
out.push('');
out.push('Generated by `scripts/system/audit-scripts.mjs`. Read-only inventory.');
out.push('');
out.push('## Summary');
out.push('');
out.push(md_table([
  ['Pullers (.mjs)',          pullers.filter(p => p.isMjs).length],
  ['Pullers total LOC',       pullers.filter(p => p.isMjs).reduce((s, p) => s + p.lines, 0)],
  ['Pullers in router or cadence', pullers.filter(p => p.isMjs && (p.inRouter || p.inCadence)).length],
  ['Orphan pullers',          orphanPullers.length],
  ['Stale .bak files',        bakFiles.length],
  ['Lib modules',             libs.length],
  ['Orphan libs (no importer)', orphanLibs.length],
  ['Retry/rate-limit candidates', retryCandidates.length],
  ['PowerShell wrappers',     psFiles.length],
  ['OSINT scan branches in router (target for table dispatch)', osintPullers.length],
], ['Metric', 'Value']));
out.push('');

out.push('## Stage 2 — Stale Artifacts (safe to delete)');
out.push('');
if (bakFiles.length === 0) {
  out.push('_None found._');
} else {
  out.push(md_table(
    bakFiles.map(f => [f.name, bytesToKB(f.size), f.mtime]),
    ['File', 'Size', 'Last modified']
  ));
}
out.push('');

out.push('## Stage 2 — Orphan Pullers');
out.push('');
out.push('Pullers whose stem does not appear in `cmd/router.mjs` or `routines/cadence.mjs`.');
out.push('Verify each before deletion — some may be invoked dynamically by `node run.mjs pull <stem>` and');
out.push('are reachable through `routePull`\'s dynamic import path.');
out.push('');
if (orphanPullers.length === 0) {
  out.push('_None found._');
} else {
  out.push(md_table(
    orphanPullers.map(p => [p.stem, p.lines, p.mtime]),
    ['Puller', 'LOC', 'Last modified']
  ));
}
out.push('');

out.push('## Stage 3 — Legacy Flat CLI Shim');
out.push('');
if (legacyShimLines) {
  out.push(`\`scripts/run.mjs\` lines ${legacyShimLines.start}–${legacyShimLines.end} contain ${legacyShimLines.count} lines of legacy compat shims that mirror dispatch already done in router.mjs.`);
} else {
  out.push('_Legacy shim markers not found in run.mjs — Stage 3 may already be partially applied._');
}
out.push('');

out.push('## Stage 4 — OSINT Scanner Cluster');
out.push('');
out.push('All OSINT pullers (target for table-driven dispatch in `routeScan`):');
out.push('');
out.push(md_table(
  osintPullers.map(p => [p.stem, p.lines, p.mtime, p.inRouter ? 'yes' : '⚠ no']),
  ['Puller', 'LOC', 'Last modified', 'In router']
));
out.push('');

out.push('## Stage 5 — Retry / Rate-Limit Candidates');
out.push('');
out.push('Pullers whose source contains backoff/retry/429/rate-limit/long-setTimeout patterns.');
out.push('Stage 5 proceeds only if this list has 3 or more entries.');
out.push('');
if (retryCandidates.length === 0) {
  out.push('_No matches — Stage 5 should be deferred._');
} else {
  out.push(md_table(
    retryCandidates.map(p => [p.stem, p.lines, p.mtime]),
    ['Puller', 'LOC', 'Last modified']
  ));
  out.push('');
  out.push(retryCandidates.length >= 3
    ? '**Decision:** ≥3 candidates → Stage 5 is in scope.'
    : `**Decision:** only ${retryCandidates.length} candidate(s) → defer Stage 5.`);
}
out.push('');

out.push('## Heaviest Pullers (top 10 by LOC)');
out.push('');
out.push(md_table(
  heavyPullers.map(p => [p.stem, p.lines, bytesToKB(p.size), p.mtime, p.inRouter ? 'router' : (p.inCadence ? 'cadence' : 'dynamic')]),
  ['Puller', 'LOC', 'Size', 'Last modified', 'Reachable via']
));
out.push('');

out.push('## Lib Modules');
out.push('');
out.push(md_table(
  libs.sort((a, b) => b.importers - a.importers).map(l => [l.stem, l.lines, l.importers]),
  ['Module', 'LOC', 'Importers']
));
out.push('');
if (orphanLibs.length > 0) {
  out.push('**Orphan libs (no importers):** ' + orphanLibs.map(l => `\`${l.stem}\``).join(', '));
  out.push('');
  out.push('Review each — may be reserved for an upcoming feature, dynamically imported by string, or genuinely dead.');
  out.push('');
}

out.push('## Puller Families (≥3 siblings)');
out.push('');
out.push('Naming-prefix clusters that may share logic and benefit from extraction.');
out.push('');
out.push(md_table(
  bigFamilies.map(([fam, names]) => [fam + '-*', names.length, names.slice(0, 6).join(', ') + (names.length > 6 ? ', …' : '')]),
  ['Prefix', 'Count', 'Members (first 6)']
));
out.push('');

out.push('## PowerShell Wrappers');
out.push('');
out.push(md_table(
  psFiles.map(p => [
    p.name,
    p.lines,
    p.isScheduled ? 'scheduled' : 'manual',
    p.cmds.length > 0 ? p.cmds.slice(0, 2).map(c => '`' + c.slice(0, 60) + '`').join('<br>') : '—',
  ]),
  ['Wrapper', 'Lines', 'Caller', 'CLI calls']
));
out.push('');

out.push('## Notes');
out.push('');
out.push('- Cross-reference is by string match. Pullers reached only via `node run.mjs pull <stem>` (dynamic import) are flagged orphan even though they are reachable.');
out.push('- Verify each Stage 2 deletion candidate by hand before removing.');
out.push('- This file is generated; rerun `node scripts/system/audit-scripts.mjs` after any change.');
out.push('');

writeFileSync(join(SCRIPTS_DIR, '_AUDIT.md'), out.join('\n'), 'utf8');
console.log(`Wrote ${join(SCRIPTS_DIR, '_AUDIT.md')}`);
console.log(`  ${pullers.filter(p => p.isMjs).length} pullers · ${libs.length} libs · ${psFiles.length} ps1 wrappers`);
console.log(`  ${bakFiles.length} stale .bak · ${orphanPullers.length} orphan pullers · ${retryCandidates.length} retry candidates`);
