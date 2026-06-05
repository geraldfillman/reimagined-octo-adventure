import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getEngineRoot, getWorldMachineRoot } from '../lib/config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_DATE = new Date().toISOString().slice(0, 10);

export function run(flags = {}) {
  const date = String(flags.date || flags['date'] || DEFAULT_DATE).slice(0, 10);
  const engineRoot = getEngineRoot();
  const worldRoot = getWorldMachineRoot();
  const artifactPath = resolve(worldRoot, '500-archive/Inbox/Event_Connections', `${date}_Inbox_Event_Connections.html`);
  const outDir = resolve(engineRoot, '99_System/exports/neo4j', `inbox-event-connections-${date}`);

  const payload = readPayload(artifactPath);
  const graph = buildNeo4jGraph(payload, { date, engineRoot, worldRoot, artifactPath });

  mkdirSync(outDir, { recursive: true });
  const importerDir = join(outDir, 'data-importer');
  mkdirSync(importerDir, { recursive: true });
  writeFileSync(join(outDir, 'nodes.csv'), renderCsv(graph.nodes, NODE_COLUMNS));
  writeFileSync(join(outDir, 'relationships.csv'), renderCsv(graph.relationships, REL_COLUMNS));
  writeFileSync(join(outDir, 'inbox_event_graph.json'), `${JSON.stringify(graph, null, 2)}\n`);
  writeFileSync(join(outDir, 'load_inbox_event_graph.cypher'), renderCypher({ date, graph }));
  writeFileSync(join(outDir, 'README.md'), renderReadme({ date, graph, outDir, artifactPath }));
  const splitFiles = writeSplitImporterFiles({ graph, importerDir });

  const summary = {
    outDir,
    files: ['nodes.csv', 'relationships.csv', 'inbox_event_graph.json', 'load_inbox_event_graph.cypher', 'README.md'],
    importerDir,
    importerFiles: splitFiles,
    nodeCount: graph.nodes.length,
    relationshipCount: graph.relationships.length,
    labels: countBy(graph.nodes, 'label'),
    relationshipTypes: countBy(graph.relationships, 'type'),
  };

  if (flags.json) console.log(JSON.stringify(summary, null, 2));
  else {
    console.log(`Wrote Neo4j inbox event graph export: ${outDir}`);
    console.log(`Nodes: ${summary.nodeCount}; relationships: ${summary.relationshipCount}`);
  }
  return summary;
}

const NODE_COLUMNS = [
  'id',
  'label',
  'name',
  'date',
  'kind',
  'status',
  'score',
  'route',
  'source_count',
  'evidence_count',
  'summary',
  'vault',
  'relative_path',
  'obsidian_url',
  'command',
  'tags',
];

const REL_COLUMNS = [
  'id',
  'source_id',
  'target_id',
  'type',
  'weight',
  'status',
  'summary',
  'command',
];

function readPayload(artifactPath) {
  const html = readFileSync(artifactPath, 'utf8');
  const match = html.match(/window\.INBOX_EVENT_CONNECTIONS = (.*);/);
  if (!match) throw new Error(`Could not find INBOX_EVENT_CONNECTIONS payload in ${artifactPath}`);
  return JSON.parse(match[1]);
}

function buildNeo4jGraph(payload, { date, engineRoot, worldRoot, artifactPath }) {
  const nodes = new Map();
  const relationships = new Map();

  const addNode = row => {
    const id = String(row.id || '').trim();
    if (!id) return;
    if (!nodes.has(id)) nodes.set(id, normalizeNode(row));
  };
  const addRel = row => {
    const id = String(row.id || '').trim();
    if (!id || !nodes.has(row.source_id) || !nodes.has(row.target_id)) return;
    if (!relationships.has(id)) relationships.set(id, normalizeRel(row));
  };

  const artifactRel = slash(relative(worldRoot, artifactPath));
  const batchId = `batch:${date}`;
  addNode({
    id: batchId,
    label: 'InboxBatch',
    name: `World_Machine inbox batch ${date}`,
    date,
    kind: 'batch',
    summary: `${payload.candidates?.length || 0} synthesized event candidates from World_Machine inbox ingestion.`,
    vault: 'World_Machine',
    relative_path: artifactRel,
    obsidian_url: obsidianUrl('World_Machine', artifactRel),
    tags: 'world-machine;inbox;event-connections',
  });

  const artifactId = `artifact:${date}:plotly`;
  addNode({
    id: artifactId,
    label: 'VisualArtifact',
    name: `${date} Inbox Event Connections Plotly`,
    date,
    kind: 'plotly-html',
    summary: 'Interactive review artifact generated from World_Machine inbox event connection candidates.',
    vault: 'World_Machine',
    relative_path: artifactRel,
    obsidian_url: obsidianUrl('World_Machine', artifactRel),
    tags: 'plotly;network;review-artifact',
  });
  addRel({
    id: `rel:${batchId}:HAS_ARTIFACT:${artifactId}`,
    source_id: batchId,
    target_id: artifactId,
    type: 'HAS_ARTIFACT',
    weight: 1,
    summary: 'Batch writes the interactive Plotly review artifact.',
  });

  for (const candidate of payload.candidates || []) {
    const candidateId = `candidate:${candidate.id}`;
    addNode({
      id: candidateId,
      label: 'EventCandidate',
      name: candidate.label || candidate.title,
      date,
      kind: candidate.type,
      status: candidate.status,
      score: candidate.score,
      route: candidate.route,
      source_count: candidate.source_count,
      evidence_count: candidate.evidence_count,
      summary: `${candidate.title}. Sources: ${candidate.source_summary || 'none'}. Evidence: ${candidate.evidence_summary || 'none'}.`,
      vault: 'World_Machine',
      relative_path: artifactRel,
      obsidian_url: obsidianUrl('World_Machine', artifactRel),
      tags: `candidate;${candidate.type};${candidate.status}`,
    });
    addRel({
      id: `rel:${batchId}:HAS_CANDIDATE:${candidateId}`,
      source_id: batchId,
      target_id: candidateId,
      type: 'HAS_CANDIDATE',
      weight: scoreWeight(candidate.score),
      status: candidate.status,
      summary: 'Inbox batch produced this synthesized event candidate.',
    });

    for (const trend of candidate.trends || []) {
      const trendId = `trend:${slug(trend)}`;
      addNode({
        id: trendId,
        label: 'Trend',
        name: trend,
        date,
        kind: 'trend-cluster',
        summary: `Synthesized trend cluster from inbox items: ${trend}`,
        tags: 'trend;cluster',
      });
      addRel({
        id: `rel:${trendId}:SYNTHESIZES:${candidateId}`,
        source_id: trendId,
        target_id: candidateId,
        type: 'SYNTHESIZES',
        weight: scoreWeight(candidate.score),
        status: candidate.status,
        summary: 'Trend cluster synthesizes into this candidate.',
      });
    }

    for (const scenario of candidate.scenarios || []) {
      const scenarioId = `scenario:${slug(scenario)}`;
      addNode({
        id: scenarioId,
        label: 'Scenario',
        name: scenario,
        date,
        kind: 'seeded-event-scenario',
        summary: `Seeded event research scenario: ${scenario}`,
        command: `node run.mjs pull event-research --scenario ${scenario} --dry-run`,
        tags: 'scenario;event-research',
      });
      addRel({
        id: `rel:${candidateId}:MAPS_TO_SCENARIO:${scenarioId}`,
        source_id: candidateId,
        target_id: scenarioId,
        type: 'MAPS_TO_SCENARIO',
        weight: 2,
        status: candidate.status,
        command: `node run.mjs pull event-research --scenario ${scenario} --dry-run`,
        summary: 'Candidate maps to an existing seeded event-research scenario.',
      });
    }

    const routeId = `route:${slug(candidate.route || 'review')}`;
    addNode({
      id: routeId,
      label: 'ReviewRoute',
      name: candidate.route || 'Review route',
      date,
      kind: 'review-route',
      route: candidate.route,
      summary: `Suggested World_Machine review route: ${candidate.route || 'Review route'}`,
      tags: 'review-route;world-machine',
    });
    addRel({
      id: `rel:${candidateId}:ROUTES_TO:${routeId}`,
      source_id: candidateId,
      target_id: routeId,
      type: 'ROUTES_TO',
      weight: 1,
      status: candidate.status,
      summary: 'Human review should route the candidate here if accepted.',
    });

    for (const item of candidate.source_items || []) {
      const sourceId = `source:${slug(item.relative_path || item.title)}`;
      addNode({
        id: sourceId,
        label: 'SourceItem',
        name: item.title || item.relative_path,
        date,
        kind: 'world-machine-inbox-source',
        route: item.route,
        summary: `Archived World_Machine inbox source item routed to ${item.route || 'unknown route'}.`,
        vault: 'World_Machine',
        relative_path: item.relative_path,
        obsidian_url: obsidianUrl('World_Machine', item.relative_path),
        tags: 'source-item;world-machine-inbox',
      });
      addRel({
        id: `rel:${candidateId}:SUMMARIZES_SOURCE:${sourceId}`,
        source_id: candidateId,
        target_id: sourceId,
        type: 'SUMMARIZES_SOURCE',
        weight: 1,
        status: candidate.status,
        summary: 'Candidate summarizes this World_Machine inbox source item.',
      });
    }

    for (const evidence of candidate.evidence_links || []) {
      const evidenceId = `evidence:${slug(evidence.rel_path || evidence.label)}`;
      addNode({
        id: evidenceId,
        label: 'Evidence',
        name: evidence.label || evidence.rel_path,
        date,
        kind: 'my-data-evidence',
        summary: `Local My_Data evidence link: ${evidence.label || evidence.rel_path}`,
        vault: 'My_Data',
        relative_path: evidence.rel_path,
        obsidian_url: evidence.url || obsidianUrl('My_Data', evidence.rel_path),
        tags: 'evidence;my-data;local-only',
      });
      addRel({
        id: `rel:${candidateId}:SUPPORTED_BY:${evidenceId}`,
        source_id: candidateId,
        target_id: evidenceId,
        type: 'SUPPORTED_BY',
        weight: 1,
        status: candidate.status,
        summary: 'Candidate is supported by local My_Data evidence.',
      });
    }

    for (const command of candidate.commands || []) {
      const commandId = `command:${slug(command)}`;
      addNode({
        id: commandId,
        label: 'Command',
        name: command,
        date,
        kind: 'dry-run-command',
        summary: 'Dry-run command for human review; does not acquire or promote automatically.',
        command,
        tags: 'command;dry-run;review',
      });
      addRel({
        id: `rel:${candidateId}:HAS_REVIEW_COMMAND:${commandId}`,
        source_id: candidateId,
        target_id: commandId,
        type: 'HAS_REVIEW_COMMAND',
        weight: 1,
        status: candidate.status,
        command,
        summary: 'Candidate exposes this dry-run review command.',
      });
    }
  }

  return {
    exported_at: new Date().toISOString(),
    source_artifact: artifactPath,
    engine_root: engineRoot,
    world_machine_root: worldRoot,
    nodes: [...nodes.values()],
    relationships: [...relationships.values()],
    sample_queries: sampleQueries(),
  };
}

function normalizeNode(row) {
  const out = {};
  for (const key of NODE_COLUMNS) out[key] = row[key] ?? '';
  out.score = row.score === undefined || row.score === '' ? '' : Number(row.score);
  out.source_count = row.source_count === undefined || row.source_count === '' ? '' : Number(row.source_count);
  out.evidence_count = row.evidence_count === undefined || row.evidence_count === '' ? '' : Number(row.evidence_count);
  return out;
}

function normalizeRel(row) {
  const out = {};
  for (const key of REL_COLUMNS) out[key] = row[key] ?? '';
  out.weight = row.weight === undefined || row.weight === '' ? 1 : Number(row.weight);
  return out;
}

function renderCsv(rows, columns) {
  return `${columns.join(',')}\n${rows.map(row => columns.map(column => csvCell(row[column])).join(',')).join('\n')}\n`;
}

function csvCell(value) {
  if (value === null || value === undefined) return '';
  const text = Array.isArray(value) ? value.join(';') : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function renderCypher({ date }) {
  return `// Neo4j load script for World_Machine inbox event graph (${date})
// Upload nodes.csv and relationships.csv somewhere Neo4j can read, then replace the two file:/// URLs if needed.
// Aura Data Importer users can upload the CSV files directly instead of running this script.

CREATE CONSTRAINT neo4j_node_id IF NOT EXISTS FOR (n:Neo4jImportNode) REQUIRE n.id IS UNIQUE;

LOAD CSV WITH HEADERS FROM 'file:///nodes.csv' AS row
MERGE (n:Neo4jImportNode {id: row.id})
SET n.name = row.name,
    n.date = row.date,
    n.kind = row.kind,
    n.status = row.status,
    n.score = CASE row.score WHEN '' THEN null ELSE toFloat(row.score) END,
    n.route = row.route,
    n.source_count = CASE row.source_count WHEN '' THEN null ELSE toInteger(row.source_count) END,
    n.evidence_count = CASE row.evidence_count WHEN '' THEN null ELSE toInteger(row.evidence_count) END,
    n.summary = row.summary,
    n.vault = row.vault,
    n.relative_path = row.relative_path,
    n.obsidian_url = row.obsidian_url,
    n.command = row.command,
    n.tags = CASE row.tags WHEN '' THEN [] ELSE split(row.tags, ';') END,
    n.import_label = row.label
FOREACH (_ IN CASE row.label WHEN 'InboxBatch' THEN [1] ELSE [] END | SET n:InboxBatch)
FOREACH (_ IN CASE row.label WHEN 'VisualArtifact' THEN [1] ELSE [] END | SET n:VisualArtifact)
FOREACH (_ IN CASE row.label WHEN 'EventCandidate' THEN [1] ELSE [] END | SET n:EventCandidate)
FOREACH (_ IN CASE row.label WHEN 'Trend' THEN [1] ELSE [] END | SET n:Trend)
FOREACH (_ IN CASE row.label WHEN 'Scenario' THEN [1] ELSE [] END | SET n:Scenario)
FOREACH (_ IN CASE row.label WHEN 'ReviewRoute' THEN [1] ELSE [] END | SET n:ReviewRoute)
FOREACH (_ IN CASE row.label WHEN 'SourceItem' THEN [1] ELSE [] END | SET n:SourceItem)
FOREACH (_ IN CASE row.label WHEN 'Evidence' THEN [1] ELSE [] END | SET n:Evidence)
FOREACH (_ IN CASE row.label WHEN 'Command' THEN [1] ELSE [] END | SET n:Command);

LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
MATCH (source:Neo4jImportNode {id: row.source_id})
MATCH (target:Neo4jImportNode {id: row.target_id})
CALL {
  WITH source, target, row
  WITH source, target, row WHERE row.type = 'HAS_ARTIFACT'
  MERGE (source)-[r:HAS_ARTIFACT {id: row.id}]->(target)
  SET r.weight = toFloat(row.weight), r.status = row.status, r.summary = row.summary, r.command = row.command
}
CALL {
  WITH source, target, row
  WITH source, target, row WHERE row.type = 'HAS_CANDIDATE'
  MERGE (source)-[r:HAS_CANDIDATE {id: row.id}]->(target)
  SET r.weight = toFloat(row.weight), r.status = row.status, r.summary = row.summary, r.command = row.command
}
CALL {
  WITH source, target, row
  WITH source, target, row WHERE row.type = 'SYNTHESIZES'
  MERGE (source)-[r:SYNTHESIZES {id: row.id}]->(target)
  SET r.weight = toFloat(row.weight), r.status = row.status, r.summary = row.summary, r.command = row.command
}
CALL {
  WITH source, target, row
  WITH source, target, row WHERE row.type = 'MAPS_TO_SCENARIO'
  MERGE (source)-[r:MAPS_TO_SCENARIO {id: row.id}]->(target)
  SET r.weight = toFloat(row.weight), r.status = row.status, r.summary = row.summary, r.command = row.command
}
CALL {
  WITH source, target, row
  WITH source, target, row WHERE row.type = 'ROUTES_TO'
  MERGE (source)-[r:ROUTES_TO {id: row.id}]->(target)
  SET r.weight = toFloat(row.weight), r.status = row.status, r.summary = row.summary, r.command = row.command
}
CALL {
  WITH source, target, row
  WITH source, target, row WHERE row.type = 'SUMMARIZES_SOURCE'
  MERGE (source)-[r:SUMMARIZES_SOURCE {id: row.id}]->(target)
  SET r.weight = toFloat(row.weight), r.status = row.status, r.summary = row.summary, r.command = row.command
}
CALL {
  WITH source, target, row
  WITH source, target, row WHERE row.type = 'SUPPORTED_BY'
  MERGE (source)-[r:SUPPORTED_BY {id: row.id}]->(target)
  SET r.weight = toFloat(row.weight), r.status = row.status, r.summary = row.summary, r.command = row.command
}
CALL {
  WITH source, target, row
  WITH source, target, row WHERE row.type = 'HAS_REVIEW_COMMAND'
  MERGE (source)-[r:HAS_REVIEW_COMMAND {id: row.id}]->(target)
  SET r.weight = toFloat(row.weight), r.status = row.status, r.summary = row.summary, r.command = row.command
};

// Starter exploration
MATCH p=(b:InboxBatch)-[:HAS_CANDIDATE]->(c:EventCandidate)-[*1..2]->()
RETURN p
LIMIT 150;
`;
}

function renderReadme({ date, graph, outDir, artifactPath }) {
  return `# Neo4j Inbox Event Graph Export - ${date}

This export is built from:

- Source artifact: \`${artifactPath}\`
- Nodes: \`${graph.nodes.length}\`
- Relationships: \`${graph.relationships.length}\`

## Files

- \`nodes.csv\` - one node table for Neo4j Data Importer.
- \`relationships.csv\` - one relationship table with \`source_id\` and \`target_id\`.
- \`inbox_event_graph.json\` - detailed graph data with sample queries.
- \`load_inbox_event_graph.cypher\` - Cypher loader for environments that can read CSV files.
- \`data-importer/\` - split node-label and relationship-type CSVs for the visual Neo4j Data Importer.

## Suggested Data Importer Mapping

Fastest visual path: upload the split files in \`data-importer/\`. Each \`nodes_*.csv\` file maps to its matching node label. Each \`rel_*.csv\` file maps to its matching relationship type. Use \`id\` as the node key, and map relationship \`source_id\` / \`target_id\` to node \`id\`.

Alternative compact path: upload \`nodes.csv\` as one generic node table and \`relationships.csv\` as one relationship table. Use \`label\` and \`type\` as guide columns while mapping.

Neo4j Aura Data Importer is CSV-oriented, while \`LOAD CSV\` can also load small and medium CSV datasets when the files are reachable by the database.

## Starter Queries

\`\`\`cypher
MATCH p=(b:InboxBatch)-[:HAS_CANDIDATE]->(c:EventCandidate)-[*1..2]->()
RETURN p
LIMIT 150;
\`\`\`

\`\`\`cypher
MATCH (c:EventCandidate)-[:SUPPORTED_BY]->(e:Evidence)
RETURN c.name, c.status, collect(e.name) AS evidence
ORDER BY c.status, c.score DESC;
\`\`\`

\`\`\`cypher
MATCH (c:EventCandidate)-[:MAPS_TO_SCENARIO]->(s:Scenario)
RETURN s.name, collect(c.name) AS candidates, count(*) AS candidate_count
ORDER BY candidate_count DESC;
\`\`\`

\`\`\`cypher
MATCH (c:EventCandidate)-[:HAS_REVIEW_COMMAND]->(cmd:Command)
RETURN c.name, collect(cmd.command) AS dry_run_commands;
\`\`\`

Local path:

\`${outDir}\`
`;
}

function sampleQueries() {
  return [
    'MATCH p=(b:InboxBatch)-[:HAS_CANDIDATE]->(c:EventCandidate)-[*1..2]->() RETURN p LIMIT 150;',
    'MATCH (c:EventCandidate)-[:SUPPORTED_BY]->(e:Evidence) RETURN c.name, c.status, collect(e.name) AS evidence ORDER BY c.status, c.score DESC;',
    'MATCH (c:EventCandidate)-[:MAPS_TO_SCENARIO]->(s:Scenario) RETURN s.name, collect(c.name) AS candidates, count(*) AS candidate_count ORDER BY candidate_count DESC;',
    'MATCH (c:EventCandidate)-[:HAS_REVIEW_COMMAND]->(cmd:Command) RETURN c.name, collect(cmd.command) AS dry_run_commands;',
  ];
}

function writeSplitImporterFiles({ graph, importerDir }) {
  const files = [];
  const nodesByLabel = groupBy(graph.nodes, 'label');
  for (const [label, rows] of Object.entries(nodesByLabel)) {
    const file = `nodes_${safeFilePart(label)}.csv`;
    writeFileSync(join(importerDir, file), renderCsv(rows, NODE_COLUMNS));
    files.push(`data-importer/${file}`);
  }

  const relsByType = groupBy(graph.relationships, 'type');
  for (const [type, rows] of Object.entries(relsByType)) {
    const file = `rel_${safeFilePart(type)}.csv`;
    writeFileSync(join(importerDir, file), renderCsv(rows, REL_COLUMNS));
    files.push(`data-importer/${file}`);
  }
  return files.sort();
}

function groupBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || 'unknown';
    if (!acc[value]) acc[value] = [];
    acc[value].push(row);
    return acc;
  }, {});
}

function scoreWeight(score) {
  const value = Number(score || 0);
  return Math.max(1, Math.round(Math.log10(value + 10)));
}

function obsidianUrl(vault, relPath) {
  return relPath ? `obsidian://open?vault=${encodeURIComponent(vault)}&file=${encodeURIComponent(relPath)}` : '';
}

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96) || 'node';
}

function slash(value) {
  return String(value || '').replace(/\\/g, '/');
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function safeFilePart(value) {
  return String(value || 'unknown').replace(/[^A-Za-z0-9_]+/g, '_');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const flags = {};
  for (let i = 2; i < process.argv.length; i += 1) {
    const arg = process.argv[i];
    if (arg === '--json') flags.json = true;
    if (arg === '--date') flags.date = process.argv[i + 1];
  }
  run(flags);
}
