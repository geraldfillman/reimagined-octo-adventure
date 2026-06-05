#!/usr/bin/env node
/**
 * coverage-audit.mjs - Pull-system control-plane coverage audit.
 *
 * Verifies source notes, puller modules, dashboard visibility, and catalog
 * metadata without mutating source notes or puller code.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  loadPullerCatalog,
  normalizeCatalogEntry,
  normalizeLinkedPullers,
  resolveCatalogEntry,
} from '../lib/puller-catalog.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_VAULT_ROOT = join(HERE, '..', '..');
const DEFAULT_SCRIPTS_ROOT = join(HERE, '..');
const SKIP_DIRS = new Set(['.obsidian', '.makemd', '.space', '.git', '.trash', 'node_modules', '.cache']);
const RETIRED_STATUSES = new Set(['archived', 'deprecated', 'retired']);
const NON_SOURCE_MODES = new Set(['synthesis', 'review', 'bridge', 'maintenance', 'agent']);

export function buildCoverageAudit({
  vaultRoot = DEFAULT_VAULT_ROOT,
  scriptsRoot = DEFAULT_SCRIPTS_ROOT,
  catalog = loadPullerCatalog(),
  now = new Date(),
} = {}) {
  const normalizedCatalog = catalog.map(normalizeCatalogEntry);
  const catalogByName = new Map(normalizedCatalog.map(entry => [entry.name, entry]));

  const sourcesDir = join(vaultRoot, '01_Data_Sources');
  const dashboardDir = join(vaultRoot, '00_Dashboard');
  const pullersDir = join(scriptsRoot, 'pullers');

  const sourceFiles = walkMd(sourcesDir);
  const sources = sourceFiles.map(file => readSourceNote(file, vaultRoot));
  const sourceFileSet = new Set(sources.map(source => source.file));
  const pullerFiles = walkMjs(pullersDir);
  const pullerNames = new Set(pullerFiles.map(file => basename(file, '.mjs')));
  const dashboard = readDashboardCoverage(dashboardDir);

  const gaps = {
    sourcePuller: [],
    pullerSource: [],
    outputDashboard: [],
    catalogModule: [],
  };
  const intentional = {
    manualOnly: [],
    synthesisOnly: [],
    retired: [],
    unautomated: [],
  };

  const linkedSourcesByPuller = new Map();

  for (const source of sources) {
    const linked = normalizeLinkedPullers(source.linked_puller);
    source.linked_pullers = linked;

    if (RETIRED_STATUSES.has(source.status)) {
      intentional.retired.push(source);
      continue;
    }

    if (linked.length === 0) {
      const intent = sourceAutomationIntent(source);
      if (intent === 'manualOnly') {
        intentional.manualOnly.push(source);
      } else if (intent === 'unautomated') {
        intentional.unautomated.push(source);
      } else {
        gaps.sourcePuller.push({ ...source, reason: 'integrated source has no linked_puller field' });
      }
      continue;
    }

    for (const pullerName of linked) {
      addMapValue(linkedSourcesByPuller, pullerName, source.file);
      const entry = catalogByName.get(pullerName) || resolveCatalogEntry(normalizedCatalog, pullerName);
      if (!entry && !pullerNames.has(pullerName)) {
        gaps.sourcePuller.push({
          ...source,
          linked_puller: pullerName,
          reason: `linked_puller "${pullerName}" has no catalog entry or scripts/pullers/${pullerName}.mjs`,
        });
      }
    }
  }

  for (const entry of normalizedCatalog) {
    for (const sourceNote of entry.source_notes) {
      if (sourceFileSet.has(sourceNote)) addMapValue(linkedSourcesByPuller, entry.name, sourceNote);
    }

    const moduleName = basename(entry.module, '.mjs');
    if (!pullerNames.has(moduleName) && !pullerNames.has(entry.name)) {
      gaps.catalogModule.push({
        puller: entry.name,
        module: entry.module,
        reason: `catalog module not found at scripts/pullers/${entry.module}`,
      });
    }
  }

  for (const pullerName of pullerNames) {
    const entry = catalogByName.get(pullerName) || resolveCatalogEntry(normalizedCatalog, pullerName);
    const sourceRefs = linkedSourcesByPuller.get(pullerName) || [];
    const mode = entry?.mode || 'uncataloged';

    if (sourceRefs.length === 0) {
      if (entry && NON_SOURCE_MODES.has(mode)) {
        intentional.synthesisOnly.push({ puller: pullerName, mode, reason: 'does not represent an external source' });
      } else {
        gaps.pullerSource.push({
          puller: pullerName,
          mode,
          reason: entry ? 'no source note links to this source-bearing puller' : 'puller is not in puller-catalog.json',
        });
      }
    }

    const domains = entry?.domains?.length ? entry.domains : [inferCategoryForPuller(pullerName, sourceRefs)];
    if (shouldCheckDashboard(entry) && !dashboardMentions(dashboard, pullerName, domains)) {
      gaps.outputDashboard.push({
        puller: pullerName,
        domains,
        mode,
        reason: 'no dashboard appears to reference this puller or output domain',
      });
    }
  }

  const date = yyyymmdd(now);
  const summary = {
    date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
    sources_scanned: sources.length,
    pullers_scanned: pullerNames.size,
    dashboards_scanned: dashboard.fileCount,
    catalog_entries: normalizedCatalog.length,
    source_puller_gaps: gaps.sourcePuller.length,
    puller_source_gaps: gaps.pullerSource.length,
    output_dashboard_gaps: gaps.outputDashboard.length,
    catalog_module_gaps: gaps.catalogModule.length,
    manual_only_sources: intentional.manualOnly.length,
    unautomated_sources: intentional.unautomated.length,
    synthesis_only_pullers: intentional.synthesisOnly.length,
    retired_sources: intentional.retired.length,
  };

  return {
    summary,
    gaps,
    intentional,
    sources,
    pullers: Array.from(pullerNames).sort(),
    catalog: normalizedCatalog,
  };
}

export function renderCoverageAuditMarkdown(audit) {
  const { summary, gaps, intentional } = audit;
  const lines = [
    '---',
    'type: coverage_audit',
    `date: ${summary.date}`,
    `sources_scanned: ${summary.sources_scanned}`,
    `pullers_scanned: ${summary.pullers_scanned}`,
    `dashboards_scanned: ${summary.dashboards_scanned}`,
    `catalog_entries: ${summary.catalog_entries}`,
    '---',
    '',
    `# Coverage Audit - ${summary.date}`,
    '',
    `**Summary:** ${summary.source_puller_gaps} source-to-puller gaps | ${summary.puller_source_gaps} puller-to-source gaps | ${summary.output_dashboard_gaps} output-to-dashboard gaps | ${summary.catalog_module_gaps} catalog module gaps`,
    '',
    '## 1. Source To Puller Gaps',
    '',
    tableOrEmpty(
      ['Source Name', 'Category', 'Status', 'linked_puller', 'Reason', 'File'],
      gaps.sourcePuller.map(source => [
        source.name,
        source.category,
        source.status || '(none)',
        source.linked_puller || '(none)',
        source.reason,
        source.file,
      ])
    ),
    '',
    '## 2. Puller To Source Gaps',
    '',
    tableOrEmpty(
      ['Puller', 'Mode', 'Reason'],
      gaps.pullerSource.map(row => [row.puller, row.mode, row.reason])
    ),
    '',
    '## 3. Output To Dashboard Gaps',
    '',
    tableOrEmpty(
      ['Puller', 'Domains', 'Mode', 'Reason'],
      gaps.outputDashboard.map(row => [row.puller, row.domains.join(', '), row.mode, row.reason])
    ),
    '',
    '## 4. Catalog Module Gaps',
    '',
    tableOrEmpty(
      ['Puller', 'Module', 'Reason'],
      gaps.catalogModule.map(row => [row.puller, row.module, row.reason])
    ),
    '',
    '## Intentional Non-Gaps',
    '',
    `- Manual-only sources: ${intentional.manualOnly.length}`,
    `- Intentionally unautomated sources: ${intentional.unautomated.length}`,
    `- Synthesis/review pullers without source notes: ${intentional.synthesisOnly.length}`,
    `- Retired sources: ${intentional.retired.length}`,
    '',
    '### Manual-Only Sources',
    '',
    tableOrEmpty(
      ['Source Name', 'Category', 'File'],
      intentional.manualOnly.map(source => [source.name, source.category, source.file])
    ),
    '',
    '### Intentionally Unautomated Sources',
    '',
    tableOrEmpty(
      ['Source Name', 'Category', 'File'],
      intentional.unautomated.map(source => [source.name, source.category, source.file])
    ),
    '',
    '---',
    `_Generated by \`node run.mjs system coverage-audit\` on ${summary.date}_`,
    '',
  ];

  return lines.join('\n');
}

export async function run(flags = {}) {
  const options = normalizeFlags(flags);
  const audit = buildCoverageAudit();
  const markdown = renderCoverageAuditMarkdown(audit);
  const dateStamp = audit.summary.date.replace(/-/g, '');
  const outFile = join(DEFAULT_VAULT_ROOT, '99_System', 'inventory', `coverage-audit-${dateStamp}.md`);

  if (options.json) {
    console.log(JSON.stringify(audit, null, 2));
    return audit;
  }

  if (options.dryRun) {
    console.log(`Coverage Audit dry-run - would write ${relative(DEFAULT_VAULT_ROOT, outFile).split(sep).join('/')}`);
    console.log('');
    console.log(markdown);
    return audit;
  }

  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, markdown, 'utf8');
  printSummary(audit, outFile);
  return audit;
}

function normalizeFlags(flags = {}) {
  return {
    dryRun: Boolean(flags['dry-run'] || flags.dryRun),
    json: Boolean(flags.json),
  };
}

function readSourceNote(absPath, vaultRoot) {
  const raw = readFileSync(absPath, 'utf8');
  const { fm } = parseFrontmatter(raw);
  const file = vaultRel(vaultRoot, absPath);
  return {
    name: fm.name || fm.title || basename(absPath, '.md'),
    category: fm.category || fm.domain || 'unknown',
    linked_puller: fm.linked_puller || fm.puller || '',
    status: String(fm.status || '').toLowerCase(),
    integrated: String(fm.integrated || '').toLowerCase(),
    automation_status: String(fm.automation_status || fm.automation || '').toLowerCase(),
    file,
  };
}

function sourceAutomationIntent(source) {
  const marker = source.automation_status;
  if (marker.includes('manual')) return 'manualOnly';
  if (marker.includes('no') || marker.includes('unautomated') || marker.includes('not automated')) return 'unautomated';
  if (source.integrated === 'false') return 'unautomated';
  if (source.integrated !== 'true') return 'unautomated';
  return 'gap';
}

function shouldCheckDashboard(entry) {
  if (!entry) return true;
  if (['review', 'bridge', 'maintenance', 'agent'].includes(entry.mode)) return false;
  return true;
}

function readDashboardCoverage(root) {
  const mdFiles = walkMd(root);
  const canvasFiles = walkFiles(root, file => file.toLowerCase().endsWith('.canvas'));
  const texts = [];

  for (const file of [...mdFiles, ...canvasFiles]) {
    try {
      texts.push(readFileSync(file, 'utf8'));
    } catch {
      // Ignore unreadable dashboard files.
    }
  }

  const combined = texts.join('\n').toLowerCase();
  const fromPaths = new Set();
  const fromPattern = /\bFROM\s+["']?([^"'\n]+)["']?/gi;
  let match;
  while ((match = fromPattern.exec(combined))) {
    fromPaths.add(match[1].trim().replace(/^["']|["']$/g, ''));
  }

  return {
    text: combined,
    fromPaths,
    fileCount: mdFiles.length + canvasFiles.length,
  };
}

function dashboardMentions(dashboard, pullerName, domains) {
  const tokens = new Set([
    pullerName.toLowerCase(),
    ...domains.map(domain => String(domain).toLowerCase()),
  ]);

  for (const fromPath of dashboard.fromPaths) {
    for (const part of fromPath.split(/[\\/]/)) {
      if (tokens.has(part.toLowerCase())) return true;
    }
  }

  for (const token of tokens) {
    if (dashboard.text.includes(token)) return true;
  }

  return false;
}

function inferCategoryForPuller(pullerName, sourceRefs) {
  if (sourceRefs.length > 0) {
    const parts = sourceRefs[0].split('/');
    if (parts.length > 1) return parts[1];
  }
  return pullerName;
}

function printSummary(audit, outFile) {
  const { summary } = audit;
  console.log('\nCoverage Audit\n');
  console.log(`  Sources scanned:    ${summary.sources_scanned}`);
  console.log(`  Pullers scanned:    ${summary.pullers_scanned}`);
  console.log(`  Dashboards scanned: ${summary.dashboards_scanned}`);
  console.log(`  Catalog entries:    ${summary.catalog_entries}`);
  console.log('');
  console.log(`  [Gap 1] Source -> Puller:    ${summary.source_puller_gaps}`);
  console.log(`  [Gap 2] Puller -> Source:    ${summary.puller_source_gaps}`);
  console.log(`  [Gap 3] Output -> Dashboard: ${summary.output_dashboard_gaps}`);
  console.log(`  [Gap 4] Catalog -> Module:   ${summary.catalog_module_gaps}`);
  console.log('');
  console.log(`  Report: ${relative(DEFAULT_VAULT_ROOT, outFile).split(sep).join('/')}\n`);
}

function walkMd(root) {
  return walkFiles(root, file => file.toLowerCase().endsWith('.md'));
}

function walkMjs(root) {
  return walkFiles(root, file => file.toLowerCase().endsWith('.mjs'));
}

function walkFiles(root, predicate) {
  const out = [];
  if (!existsSync(root)) return out;

  (function recur(dir) {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
        recur(full);
      } else if (entry.isFile() && predicate(full)) {
        out.push(full);
      }
    }
  })(root);

  return out;
}

function parseFrontmatter(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { fm: {}, body: text };

  const fm = {};
  for (const rawLine of match[1].split(/\r?\n/)) {
    const kv = rawLine.match(/^\s*([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    fm[kv[1]] = kv[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return { fm, body: text.slice(match[0].length) };
}

function tableOrEmpty(headers, rows) {
  if (rows.length === 0) return '_No issues found._\n';
  const head = `| ${headers.join(' | ')} |`;
  const sepLine = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map(row => `| ${row.map(cell => String(cell ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ')} |`);
  return [head, sepLine, ...body].join('\n');
}

function addMapValue(map, key, value) {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(value);
}

function vaultRel(root, filePath) {
  return relative(root, filePath).split(sep).join('/');
}

function yyyymmdd(date = new Date()) {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await run({
    'dry-run': process.argv.includes('--dry-run'),
    json: process.argv.includes('--json'),
  });
}
