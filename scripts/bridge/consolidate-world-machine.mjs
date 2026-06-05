/**
 * consolidate-world-machine.mjs - move World_Machine report/research ownership to My_Data.
 *
 * Dry-run prints the planned copy/archive/keep set. Live mode copies first,
 * verifies hash/size, rewrites exact Obsidian World_Machine URLs in migrated
 * markdown, writes manifests, then archives disallowed World_Machine originals.
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';

import { getEngineRoot, getWorldMachineRoot } from '../lib/config.mjs';

const MIGRATION_ROOT_REL = '14_Review_and_Research/World_Machine';
const MANIFEST_ROOT_REL = '99_System/migration/world-machine-consolidation';
const INVENTORY_ROOT_REL = 'Reports/System/inventory';
const ARCHIVE_ROOT_REL = '500-archive/Consolidated_To_My_Data';

const KEEP_FILES = new Set([
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
]);

const KEEP_DIR_PREFIXES = [
  '.obsidian/',
  '.claude/',
  '.playwright-mcp/',
  '_Inbox/',
  '500-archive/',
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeRel(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '');
}

function boolFlag(flags, camel, kebab) {
  return Boolean(flags?.[camel] ?? flags?.[kebab]);
}

function normalizeFlags(flags = {}) {
  return {
    dryRun: boolFlag(flags, 'dryRun', 'dry-run'),
    printFiles: boolFlag(flags, 'printFiles', 'print-files'),
    date: String(flags.date || todayIso()).slice(0, 10),
    engineRoot: flags['engine-root'] || flags.engineRoot || getEngineRoot(),
    worldRoot: flags['world-root'] || flags.worldRoot || getWorldMachineRoot(),
  };
}

function walkFiles(root) {
  if (!existsSync(root)) return [];
  const files = [];
  const entries = readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function sha256(filePath) {
  const hash = createHash('sha256');
  hash.update(readFileSync(filePath));
  return hash.digest('hex');
}

function fileMeta(filePath) {
  const stat = statSync(filePath);
  return {
    bytes: stat.size,
    sha256: sha256(filePath),
  };
}

export function classifyWorldMachineRelPath(relPath) {
  const rel = normalizeRel(relPath);
  if (!rel) return { action: 'keep', reason: 'root' };
  if (KEEP_FILES.has(rel)) return { action: 'keep', reason: 'vault metadata document' };
  if (KEEP_DIR_PREFIXES.some(prefix => rel.startsWith(prefix))) {
    return { action: 'keep', reason: 'World_Machine exception surface' };
  }
  return { action: 'migrate', reason: rel.startsWith('Reports/') ? 'report output' : 'review/research content' };
}

function destinationRelFor(relPath) {
  const rel = normalizeRel(relPath);
  if (rel.startsWith('Reports/')) return rel;
  return `${MIGRATION_ROOT_REL}/${rel}`;
}

function archiveRelFor(relPath, date) {
  return `${ARCHIVE_ROOT_REL}/${date}/${normalizeRel(relPath)}`;
}

export function buildConsolidationPlan(options = {}) {
  const engineRoot = resolve(options.engineRoot || getEngineRoot());
  const worldRoot = resolve(options.worldRoot || getWorldMachineRoot());
  const date = String(options.date || todayIso()).slice(0, 10);
  const files = walkFiles(worldRoot);
  const items = [];
  const linkRewriteMap = new Map();

  for (const sourcePath of files) {
    const relPath = normalizeRel(relative(worldRoot, sourcePath));
    const classification = classifyWorldMachineRelPath(relPath);
    const source = fileMeta(sourcePath);

    if (classification.action === 'keep') {
      items.push({
        relPath,
        action: 'keep',
        reason: classification.reason,
        sourcePath,
        source,
      });
      continue;
    }

    const destRelPath = destinationRelFor(relPath);
    const destPath = join(engineRoot, ...destRelPath.split('/'));
    const archiveRelPath = archiveRelFor(relPath, date);
    const archivePath = join(worldRoot, ...archiveRelPath.split('/'));
    const destExists = existsSync(destPath);
    const dest = destExists ? fileMeta(destPath) : null;
    const conflict = Boolean(dest && dest.sha256 !== source.sha256);
    const sameDestination = Boolean(dest && dest.sha256 === source.sha256);

    linkRewriteMap.set(relPath, destRelPath);
    items.push({
      relPath,
      action: 'migrate',
      reason: classification.reason,
      sourcePath,
      destRelPath,
      destPath,
      archiveRelPath,
      archivePath,
      source,
      dest,
      conflict,
      sameDestination,
    });
  }

  return {
    schema_version: 1,
    generated_on: date,
    engineRoot,
    worldRoot,
    counts: countItems(items),
    items,
    linkRewriteMap: Object.fromEntries(linkRewriteMap),
  };
}

function countItems(items) {
  const counts = {
    keep: 0,
    migrate: 0,
    conflicts: 0,
    reports: 0,
    research: 0,
  };
  for (const item of items) {
    counts[item.action] = (counts[item.action] || 0) + 1;
    if (item.conflict) counts.conflicts += 1;
    if (item.action === 'migrate' && item.destRelPath?.startsWith('Reports/')) counts.reports += 1;
    if (item.action === 'migrate' && !item.destRelPath?.startsWith('Reports/')) counts.research += 1;
  }
  return counts;
}

function assertContained(rootPath, targetPath, label) {
  const root = resolve(rootPath);
  const target = resolve(targetPath);
  const rel = relative(root, target);
  if (rel !== '' && (rel.startsWith('..') || rel.includes(`..${sep}`))) {
    throw new Error(`${label} must stay inside ${root}: ${target}`);
  }
  return target;
}

function ensureParent(filePath) {
  mkdirSync(dirname(filePath), { recursive: true });
}

function replaceExactWorldMachineUrls(markdown, linkRewriteMap) {
  let replacements = 0;
  const next = String(markdown || '').replace(
    /obsidian:\/\/open\?vault=World_Machine&file=([^\s)\]]+)/g,
    (match, encodedPath) => {
      let decoded;
      try {
        decoded = normalizeRel(decodeURIComponent(encodedPath));
      } catch {
        return match;
      }
      const mapped = linkRewriteMap[decoded];
      if (!mapped) return match;
      replacements += 1;
      return `obsidian://open?vault=My_Data&file=${encodeURIComponent(mapped)}`;
    }
  );
  return { text: next, replacements };
}

function applyLinkRewriteIfMarkdown(item, linkRewriteMap) {
  if (extname(item.destPath).toLowerCase() !== '.md') return 0;
  const raw = readFileSync(item.destPath, 'utf-8');
  const { text, replacements } = replaceExactWorldMachineUrls(raw, linkRewriteMap);
  if (replacements > 0 && text !== raw) {
    writeFileSync(item.destPath, text, 'utf-8');
  }
  return replacements;
}

function writeManifest(plan, result) {
  const date = plan.generated_on;
  const manifestPath = join(plan.engineRoot, ...MANIFEST_ROOT_REL.split('/'), `${date}_manifest.json`);
  const inventoryPath = join(plan.engineRoot, ...INVENTORY_ROOT_REL.split('/'), `world-machine-consolidation-${date}.md`);

  const serializable = {
    ...plan,
    result,
    items: plan.items.map(item => ({
      relPath: item.relPath,
      action: item.action,
      reason: item.reason,
      destRelPath: item.destRelPath || null,
      archiveRelPath: item.archiveRelPath || null,
      source: item.source,
      dest: item.dest || null,
      conflict: Boolean(item.conflict),
      sameDestination: Boolean(item.sameDestination),
      archived: Boolean(result.archived.includes(item.relPath)),
      copied: Boolean(result.copied.includes(item.relPath)),
      kept: item.action === 'keep',
    })),
  };

  ensureParent(manifestPath);
  ensureParent(inventoryPath);
  writeFileSync(manifestPath, `${JSON.stringify(serializable, null, 2)}\n`, 'utf-8');
  writeFileSync(inventoryPath, renderInventoryMarkdown(serializable), 'utf-8');
  return { manifestPath, inventoryPath };
}

function renderInventoryMarkdown(payload) {
  const rows = payload.items
    .filter(item => item.action === 'migrate' || item.conflict)
    .slice(0, 200)
    .map(item => [
      item.conflict ? 'conflict' : item.archived ? 'archived' : item.copied ? 'copied' : item.action,
      item.relPath,
      item.destRelPath || '',
      item.archiveRelPath || '',
      item.reason,
    ]);

  return [
    '---',
    'type: world_machine_consolidation_inventory',
    `date: ${payload.generated_on}`,
    'source: consolidate-world-machine',
    '---',
    '',
    `# World_Machine Consolidation - ${payload.generated_on}`,
    '',
    `- Kept in World_Machine: ${payload.counts.keep}`,
    `- Migrated candidates: ${payload.counts.migrate}`,
    `- Conflicts skipped: ${payload.counts.conflicts}`,
    `- Copied: ${payload.result.copied.length}`,
    `- Archived: ${payload.result.archived.length}`,
    `- Link rewrites: ${payload.result.linkRewrites}`,
    '',
    '| Status | Source | My_Data Destination | World_Machine Archive | Reason |',
    '|---|---|---|---|---|',
    ...rows.map(row => `| ${row.map(escapeCell).join(' | ')} |`),
    '',
  ].join('\n');
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function applyLivePlan(plan) {
  const result = {
    copied: [],
    archived: [],
    conflicts: [],
    kept: plan.items.filter(item => item.action === 'keep').map(item => item.relPath),
    linkRewrites: 0,
    manifestPath: null,
    inventoryPath: null,
  };

  for (const item of plan.items.filter(row => row.action === 'migrate')) {
    assertContained(plan.worldRoot, item.sourcePath, `source ${item.relPath}`);
    assertContained(plan.engineRoot, item.destPath, `destination ${item.destRelPath}`);
    assertContained(plan.worldRoot, item.archivePath, `archive ${item.archiveRelPath}`);

    if (item.conflict) {
      result.conflicts.push(item.relPath);
      continue;
    }

    if (!item.sameDestination) {
      ensureParent(item.destPath);
      copyFileSync(item.sourcePath, item.destPath);
      const copied = fileMeta(item.destPath);
      if (copied.sha256 !== item.source.sha256 || copied.bytes !== item.source.bytes) {
        throw new Error(`Copy verification failed for ${item.relPath}`);
      }
      result.copied.push(item.relPath);
    }

    result.linkRewrites += applyLinkRewriteIfMarkdown(item, plan.linkRewriteMap);

    ensureParent(item.archivePath);
    renameSync(item.sourcePath, item.archivePath);
    const archived = fileMeta(item.archivePath);
    if (archived.sha256 !== item.source.sha256 || archived.bytes !== item.source.bytes) {
      throw new Error(`Archive verification failed for ${item.relPath}`);
    }
    result.archived.push(item.relPath);
  }

  const manifest = writeManifest(plan, result);
  result.manifestPath = manifest.manifestPath;
  result.inventoryPath = manifest.inventoryPath;
  return result;
}

function printPlan(plan, result, { dryRun, printFiles }) {
  const prefix = dryRun ? '[consolidate-world-machine] [dry-run]' : '[consolidate-world-machine]';
  console.log(`${prefix} world root: ${plan.worldRoot}`);
  console.log(`${prefix} engine root: ${plan.engineRoot}`);
  console.log(`${prefix} keep=${plan.counts.keep} migrate=${plan.counts.migrate} reports=${plan.counts.reports} research=${plan.counts.research} conflicts=${plan.counts.conflicts}`);

  const conflicts = plan.items.filter(item => item.conflict);
  if (conflicts.length) {
    console.log(`${prefix} conflicts:`);
    for (const item of conflicts.slice(0, 25)) {
      console.log(`  - ${item.relPath} -> ${item.destRelPath}`);
    }
    if (conflicts.length > 25) console.log(`  ... ${conflicts.length - 25} more`);
  }

  if (printFiles) {
    for (const item of plan.items) {
      if (item.action === 'keep') {
        console.log(`  keep    ${item.relPath} (${item.reason})`);
      } else {
        console.log(`  migrate ${item.relPath} -> ${item.destRelPath} | archive ${item.archiveRelPath}`);
      }
    }
  }

  if (result) {
    console.log(`${prefix} copied=${result.copied.length} archived=${result.archived.length} skipped_conflicts=${result.conflicts.length} link_rewrites=${result.linkRewrites}`);
    console.log(`${prefix} manifest: ${result.manifestPath}`);
    console.log(`${prefix} inventory: ${result.inventoryPath}`);
  }
}

export async function run(flags = {}) {
  const options = normalizeFlags(flags);
  const plan = buildConsolidationPlan(options);

  if (options.dryRun) {
    printPlan(plan, null, options);
    return { source: 'consolidate-world-machine', dryRun: true, plan };
  }

  const result = applyLivePlan(plan);
  printPlan(plan, result, options);
  return { source: 'consolidate-world-machine', dryRun: false, plan, result };
}

if (process.argv[1]?.endsWith('consolidate-world-machine.mjs')) {
  const flags = {};
  for (let i = 2; i < process.argv.length; i += 1) {
    const arg = process.argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = process.argv[i + 1];
    if (next && !next.startsWith('--')) {
      flags[key] = next;
      i += 1;
    } else {
      flags[key] = true;
    }
  }
  run(flags).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
