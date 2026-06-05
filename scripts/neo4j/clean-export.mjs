#!/usr/bin/env node
// Clean a Neo4j export dump into a neo4j-admin import-ready bundle.
//
// Input:  <exportDir>/{manifest.json, nodes.csv, relationships.csv}
//   nodes.csv         columns: elementId,id,labels,properties_json
//   relationships.csv columns: elementId,type,startElementId,startId,startLabels,
//                              endElementId,endId,endLabels,properties_json
//
// Output: <exportDir>/clean/
//   nodes/<Label>.csv         header: id:ID,<props...>,:LABEL
//   relationships/<TYPE>.csv  header: :START_ID,:END_ID,<props...>,:TYPE
//   manifest.json             per-bucket counts + relative paths
//   import.ps1                neo4j-admin database import command
//
// Usage:
//   node clean-export.mjs <exportDir>
//   node clean-export.mjs <exportDir> --drop-label BlindSpotNode

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

// --- args ---
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('usage: clean-export.mjs <exportDir> [--drop-label NAME ...]');
  process.exit(1);
}
const exportDir = resolve(args[0]);
const dropLabels = new Set();
for (let i = 1; i < args.length; i++) {
  if (args[i] === '--drop-label' && args[i + 1]) {
    dropLabels.add(args[++i]);
  }
}
if (dropLabels.size === 0) dropLabels.add('BlindSpotNode');

// Specificity priority for primary-label selection (first match wins).
// More specific / domain-meaningful labels come earlier.
const LABEL_PRIORITY = [
  'Stock', 'Company', 'Bill', 'Senator', 'Politician', 'Person',
  'MacroIndicator', 'Sector', 'Country', 'Regime', 'ShockVector',
  'Thesis', 'Dashboard', 'Playbook', 'Observation',
  'DataPull', 'DataSource', 'EvidenceArtifact', 'SourceItem',
  'CandidateLink', 'InboxBatch',
  'Entity', 'Domain',
];

// --- minimal RFC 4180 CSV parser (header + rows) ---
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else inQuotes = false;
      } else cell += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\r') { /* skip */ }
      else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += c;
    }
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function readCsv(path) {
  const raw = readFileSync(path, 'utf8');
  const rows = parseCsv(raw);
  const header = rows.shift();
  return rows
    .filter(r => r.length === header.length)
    .map(r => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

// --- CSV cell encoder (RFC 4180) ---
function enc(v) {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'string' ? v : (typeof v === 'object' ? JSON.stringify(v) : String(v));
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// --- safe filename per label/type ---
function safe(name) {
  return String(name || '_Unlabeled').replace(/[^A-Za-z0-9_.-]/g, '_');
}

function parseLabels(s) {
  return String(s || '').split(';').filter(Boolean);
}

function pickPrimary(labels) {
  for (const p of LABEL_PRIORITY) if (labels.includes(p)) return p;
  return labels[0] || '_Unlabeled';
}

function parseProps(s) {
  if (!s) return {};
  try { return JSON.parse(s); } catch { return { _raw: s }; }
}

// --- load ---
const manifestPath = join(exportDir, 'manifest.json');
const nodesCsvPath = join(exportDir, 'nodes.csv');
const relsCsvPath = join(exportDir, 'relationships.csv');
for (const p of [manifestPath, nodesCsvPath, relsCsvPath]) {
  if (!existsSync(p)) { console.error(`missing: ${p}`); process.exit(1); }
}

console.log(`reading ${nodesCsvPath} ...`);
const nodes = readCsv(nodesCsvPath);
console.log(`  ${nodes.length} node rows`);

console.log(`reading ${relsCsvPath} ...`);
const rels = readCsv(relsCsvPath);
console.log(`  ${rels.length} relationship rows`);

// --- bucket nodes by primary label ---
const nodeBuckets = new Map();  // primaryLabel -> { rows: [], propKeys: Set }
const seenIds = new Set();
let dupCount = 0;
let droppedAllLabels = 0;

for (const n of nodes) {
  const allLabels = parseLabels(n.labels).filter(l => !dropLabels.has(l));
  if (allLabels.length === 0) droppedAllLabels++;
  const primary = pickPrimary(allLabels);
  const id = n.id;
  if (!id) continue;
  if (seenIds.has(id)) { dupCount++; continue; }
  seenIds.add(id);

  const props = parseProps(n.properties_json);
  // strip props that conflict with reserved columns
  delete props.id;

  if (!nodeBuckets.has(primary)) nodeBuckets.set(primary, { rows: [], propKeys: new Set() });
  const b = nodeBuckets.get(primary);
  for (const k of Object.keys(props)) b.propKeys.add(k);
  b.rows.push({ id, labels: allLabels, props });
}

// --- bucket relationships by type ---
const relBuckets = new Map();
let relMissingId = 0;
for (const r of rels) {
  const t = r.type;
  if (!t || !r.startId || !r.endId) { relMissingId++; continue; }
  const props = parseProps(r.properties_json);
  if (!relBuckets.has(t)) relBuckets.set(t, { rows: [], propKeys: new Set() });
  const b = relBuckets.get(t);
  for (const k of Object.keys(props)) b.propKeys.add(k);
  b.rows.push({ startId: r.startId, endId: r.endId, props });
}

// --- write output ---
const cleanDir = join(exportDir, 'clean');
const nodesOutDir = join(cleanDir, 'nodes');
const relsOutDir = join(cleanDir, 'relationships');
mkdirSync(nodesOutDir, { recursive: true });
mkdirSync(relsOutDir, { recursive: true });

const nodeFiles = [];
for (const [label, { rows, propKeys }] of nodeBuckets) {
  const cols = [...propKeys].sort();
  const header = ['id:ID', ...cols, ':LABEL'];
  const lines = [header.join(',')];
  for (const { id, labels, props } of rows) {
    const cells = [enc(id)];
    for (const k of cols) cells.push(enc(props[k]));
    cells.push(enc(labels.join(';')));
    lines.push(cells.join(','));
  }
  const file = join(nodesOutDir, `${safe(label)}.csv`);
  writeFileSync(file, lines.join('\n') + '\n', 'utf8');
  nodeFiles.push({ label, file: `nodes/${safe(label)}.csv`, count: rows.length, propCount: cols.length });
}

const relFiles = [];
for (const [type, { rows, propKeys }] of relBuckets) {
  const cols = [...propKeys].sort();
  const header = [':START_ID', ':END_ID', ...cols, ':TYPE'];
  const lines = [header.join(',')];
  for (const { startId, endId, props } of rows) {
    const cells = [enc(startId), enc(endId)];
    for (const k of cols) cells.push(enc(props[k]));
    cells.push(enc(type));
    lines.push(cells.join(','));
  }
  const file = join(relsOutDir, `${safe(type)}.csv`);
  writeFileSync(file, lines.join('\n') + '\n', 'utf8');
  relFiles.push({ type, file: `relationships/${safe(type)}.csv`, count: rows.length, propCount: cols.length });
}

// --- clean manifest ---
const cleanManifest = {
  sourceExport: basename(exportDir),
  cleanedAt: new Date().toISOString(),
  droppedLabels: [...dropLabels],
  totals: {
    nodes: nodes.length - dupCount,
    duplicatesSkipped: dupCount,
    nodesWithAllLabelsDropped: droppedAllLabels,
    relationships: rels.length - relMissingId,
    relationshipsMissingId: relMissingId,
  },
  nodeFiles: nodeFiles.sort((a, b) => b.count - a.count),
  relationshipFiles: relFiles.sort((a, b) => b.count - a.count),
};
writeFileSync(join(cleanDir, 'manifest.json'), JSON.stringify(cleanManifest, null, 2));

// --- import script ---
const nodeArgs = nodeFiles.map(n => `  --nodes=${n.file}`).join(" \`\n");
const relArgs = relFiles.map(r => `  --relationships=${r.file}`).join(" \`\n");
const ps1 = `# Generated by clean-export.mjs
# Run from this directory (clean/) against a STOPPED Neo4j database.
# Replace <DB_NAME> with your target database (e.g. neo4j).
neo4j-admin database import full \`
  --overwrite-destination=true \`
${nodeArgs} \`
${relArgs} \`
  <DB_NAME>
`;
writeFileSync(join(cleanDir, 'import.ps1'), ps1);

// --- summary ---
console.log('');
console.log(`clean bundle written to: ${cleanDir}`);
console.log(`  node files: ${nodeFiles.length}`);
console.log(`  rel files:  ${relFiles.length}`);
console.log(`  dropped labels: ${[...dropLabels].join(', ')}`);
if (dupCount) console.log(`  duplicate node ids skipped: ${dupCount}`);
if (droppedAllLabels) console.log(`  nodes whose ONLY label was dropped: ${droppedAllLabels}`);
if (relMissingId) console.log(`  rels missing startId/endId: ${relMissingId}`);
