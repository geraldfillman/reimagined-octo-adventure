import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { getWorldMachineRoot } from './config.mjs';

const SUPPORTED_SCHEMA = 'neo4j_inbox_ingestion_v1';
const TARGET_LABELS = ['Scenario', 'Regime', 'Sector', 'MacroIndicator', 'Commodity', 'Stock'];

export function extractNeo4jTransferPayload(markdown = '') {
  const blocks = String(markdown).matchAll(/```json\s*([\s\S]*?)```/gi);
  for (const match of blocks) {
    const parsed = JSON.parse(match[1]);
    if (parsed?.schema === SUPPORTED_SCHEMA) return parsed;
  }
  throw new Error(`No ${SUPPORTED_SCHEMA} JSON block found`);
}

export function normalizeInboxIngestionPayload(raw = {}) {
  if (raw.schema !== SUPPORTED_SCHEMA) {
    throw new Error(`Unsupported inbox ingestion schema: ${raw.schema || 'missing'}`);
  }
  if (!raw.batch?.id) throw new Error('Inbox ingestion payload missing batch.id');

  const batch = {
    id: String(raw.batch.id),
    date: String(raw.batch.date || ''),
    title: String(raw.batch.title || raw.batch.id),
    source: String(raw.batch.source || 'ingest-world-inbox'),
    source_vault: String(raw.batch.source_vault || 'World_Machine'),
    source_rel_path: String(raw.batch.source_rel_path || ''),
    archive_root_rel_path: String(raw.batch.archive_root_rel_path || raw.batch.archive_root || ''),
    import_status: String(raw.batch.import_status || raw.batch.status || 'review'),
    processed_item_count: numberOrZero(raw.batch.processed_item_count),
    event_trend_count: numberOrZero(raw.batch.event_trend_count),
    candidate_link_count: numberOrZero(raw.batch.candidate_link_count),
  };

  const items = arrayFrom(raw.items).map(item => ({
    id: requiredString(item.id, 'items[].id'),
    title: String(item.title || item.id),
    source_rel_path: String(item.source_rel_path || ''),
    archive_rel_path: String(item.archive_rel_path || ''),
    suggested_route: String(item.suggested_route || ''),
    excerpt: String(item.excerpt || ''),
    source_url: String(item.source_url || ''),
    tags: arrayFrom(item.tags).map(String),
  }));

  const trends = arrayFrom(raw.trends).map(trend => ({
    id: requiredString(trend.id, 'trends[].id'),
    label: String(trend.label || trend.id),
    score: numberOrZero(trend.score),
    matched_terms: arrayFrom(trend.matched_terms).map(String),
    matched_item_ids: arrayFrom(trend.matched_item_ids).map(String),
    related_scenarios: arrayFrom(trend.related_scenarios).map(String),
    read: String(trend.read || ''),
  }));

  const candidate_links = arrayFrom(raw.candidate_links).map(link => {
    const toLabel = String(link.to_label || 'UnresolvedTarget');
    if (![...TARGET_LABELS, 'UnresolvedTarget'].includes(toLabel)) {
      throw new Error(`Unsupported inbox CandidateLink target label: ${toLabel}`);
    }
    return {
      id: requiredString(link.id, 'candidate_links[].id'),
      type: String(link.type || 'inbox_event_connection'),
      candidate_type: String(link.candidate_type || 'inbox_event_connection'),
      status: String(link.status || 'candidate'),
      reviewState: String(link.reviewState || 'needs_review'),
      method: String(link.method || 'world_machine_inbox_ingestion'),
      source: String(link.source || 'ingest-world-inbox'),
      from_id: requiredString(link.from_id, 'candidate_links[].from_id'),
      from_label: String(link.from_label || 'EventTrend'),
      to_id: requiredString(link.to_id, 'candidate_links[].to_id'),
      to_label: toLabel,
      score: numberOrZero(link.score),
      reason: String(link.reason || ''),
      suggested_route: String(link.suggested_route || ''),
      matched_trends: arrayFrom(link.matched_trends).map(String),
      matched_terms: arrayFrom(link.matched_terms).map(String),
      related_scenarios: arrayFrom(link.related_scenarios).map(String),
      evidence_item_ids: arrayFrom(link.evidence_item_ids).map(String),
      evidence_links: arrayFrom(link.evidence_links).map(linkRow => ({
        label: String(linkRow.label || linkRow.rel_path || ''),
        rel_path: String(linkRow.rel_path || ''),
      })),
      review_commands: arrayFrom(link.review_commands).map(String),
    };
  });

  return {
    schema: SUPPORTED_SCHEMA,
    generated_at: String(raw.generated_at || ''),
    batch,
    items,
    trends,
    candidate_links,
    review_commands: arrayFrom(raw.review_commands).map(String),
  };
}

export function buildDryRunPlan(payload) {
  const normalized = normalizeInboxIngestionPayload(payload);
  const supportedBy = normalized.trends.reduce((sum, trend) => sum + trend.matched_item_ids.length, 0);
  const evidenceFor = normalized.candidate_links.reduce((sum, link) => sum + link.evidence_item_ids.length, 0);
  return {
    dryRun: true,
    schema: normalized.schema,
    batch: normalized.batch,
    nodes: {
      batches: 1,
      items: normalized.items.length,
      trends: normalized.trends.length,
      candidateLinks: normalized.candidate_links.length,
      unresolvedTargets: normalized.candidate_links.filter(link => link.to_label === 'UnresolvedTarget').length,
    },
    relationships: {
      ingestedItems: normalized.items.length,
      identifiedTrends: normalized.trends.length,
      supportedBy,
      proposedBy: normalized.candidate_links.length,
      proposes: normalized.candidate_links.length,
      evidenceFor,
    },
    reviewCommands: normalized.review_commands,
  };
}

export function buildInboxIngestionSchemaStatements() {
  return [
    'CYPHER 25 CREATE CONSTRAINT inboxingestionbatch_id_unique IF NOT EXISTS FOR (b:InboxIngestionBatch) REQUIRE b.id IS UNIQUE',
    'CYPHER 25 CREATE CONSTRAINT inboxitem_id_unique IF NOT EXISTS FOR (i:InboxItem) REQUIRE i.id IS UNIQUE',
    'CYPHER 25 CREATE CONSTRAINT eventtrend_id_unique IF NOT EXISTS FOR (t:EventTrend) REQUIRE t.id IS UNIQUE',
    'CYPHER 25 CREATE CONSTRAINT unresolvedtarget_id_unique IF NOT EXISTS FOR (u:UnresolvedTarget) REQUIRE u.id IS UNIQUE',
    'CYPHER 25 CREATE CONSTRAINT candidatelink_id_unique IF NOT EXISTS FOR (c:CandidateLink) REQUIRE c.id IS UNIQUE',
    'CYPHER 25 CREATE INDEX inboxingestionbatch_date IF NOT EXISTS FOR (b:InboxIngestionBatch) ON (b.date)',
    'CYPHER 25 CREATE INDEX candidatelink_source IF NOT EXISTS FOR (c:CandidateLink) ON (c.source)',
  ];
}

export function buildWriteInboxIngestionCypher() {
  return `CYPHER 25
MERGE (batch:Observation:InboxIngestionBatch {id: $batch.id})
SET batch += {
  date: date($batch.date),
  title: $batch.title,
  source: $batch.source,
  source_vault: $batch.source_vault,
  source_rel_path: $batch.source_rel_path,
  archive_root_rel_path: $batch.archive_root_rel_path,
  import_status: $batch.import_status,
  processed_item_count: $batch.processed_item_count,
  event_trend_count: $batch.event_trend_count,
  candidate_link_count: $batch.candidate_link_count,
  importedAt: datetime()
}
WITH batch
UNWIND $items AS row
MERGE (item:SourceItem:InboxItem {id: row.id})
SET item += {
  title: row.title,
  source: 'ingest-world-inbox',
  source_vault: 'World_Machine',
  source_rel_path: row.source_rel_path,
  archive_rel_path: row.archive_rel_path,
  suggested_route: row.suggested_route,
  excerpt: row.excerpt,
  source_url: row.source_url,
  tags: row.tags,
  importedAt: datetime()
}
MERGE (batch)-[:INGESTED_ITEM]->(item)
WITH DISTINCT batch
UNWIND $trends AS row
MERGE (trend:EventTrend {id: row.id})
SET trend += {
  label: row.label,
  name: row.label,
  source: 'ingest-world-inbox',
  score: toFloat(row.score),
  matched_terms: row.matched_terms,
  related_scenarios: row.related_scenarios,
  read: row.read,
  importedAt: datetime()
}
MERGE (batch)-[:IDENTIFIED_TREND]->(trend)
WITH DISTINCT batch
UNWIND $trendItemLinks AS row
MATCH (trend:EventTrend {id: row.trend_id})
MATCH (item:InboxItem {id: row.item_id})
MERGE (trend)-[:SUPPORTED_BY]->(item)
WITH DISTINCT batch
UNWIND $candidate_links AS row
MERGE (candidate:CandidateLink {id: row.id})
SET candidate += {
  type: row.type,
  candidate_type: row.candidate_type,
  status: row.status,
  reviewState: row.reviewState,
  method: row.method,
  source: row.source,
  from_id: row.from_id,
  from_label: row.from_label,
  to_id: row.to_id,
  to_label: row.to_label,
  reason: row.reason,
  suggested_route: row.suggested_route,
  score: toFloat(row.score),
  matched_trends: row.matched_trends,
  matched_terms: row.matched_terms,
  related_scenarios: row.related_scenarios,
  evidence_item_ids: row.evidence_item_ids,
  evidence_links: [link IN row.evidence_links | coalesce(link.label, '') + ' :: ' + coalesce(link.rel_path, '')],
  review_commands: row.review_commands,
  importedAt: datetime()
}
WITH candidate, row
CALL (candidate, row) {
  WITH candidate, row WHERE row.from_label = 'EventTrend'
  MATCH (source:EventTrend {id: row.from_id})
  MERGE (source)-[:PROPOSED_BY]->(candidate)
  RETURN count(*) AS sourceLinked
  UNION
  WITH candidate, row WHERE row.from_label = 'InboxIngestionBatch'
  MATCH (source:InboxIngestionBatch {id: row.from_id})
  MERGE (source)-[:PROPOSED_BY]->(candidate)
  RETURN count(*) AS sourceLinked
}
WITH candidate, row
CALL (row) {
  WITH row WHERE row.to_label = 'Scenario'
  OPTIONAL MATCH (targetNode:Scenario {id: row.to_id})
  RETURN targetNode
  UNION
  WITH row WHERE row.to_label = 'Regime'
  OPTIONAL MATCH (targetNode:Regime {id: row.to_id})
  RETURN targetNode
  UNION
  WITH row WHERE row.to_label = 'Sector'
  OPTIONAL MATCH (targetNode:Sector {id: row.to_id})
  RETURN targetNode
  UNION
  WITH row WHERE row.to_label = 'MacroIndicator'
  OPTIONAL MATCH (targetNode:MacroIndicator {id: row.to_id})
  RETURN targetNode
  UNION
  WITH row WHERE row.to_label = 'Commodity'
  OPTIONAL MATCH (targetNode:Commodity {id: row.to_id})
  RETURN targetNode
  UNION
  WITH row WHERE row.to_label = 'Stock'
  OPTIONAL MATCH (targetNode:Stock {id: row.to_id})
  RETURN targetNode
  UNION
  WITH row WHERE row.to_label = 'UnresolvedTarget'
  RETURN null AS targetNode
}
WITH candidate, row, targetNode
CALL (candidate, row, targetNode) {
  WITH candidate, row, targetNode WHERE targetNode IS NOT NULL
  MERGE (candidate)-[:PROPOSES]->(targetNode)
  RETURN count(*) AS targetLinked
  UNION
  WITH candidate, row, targetNode WHERE targetNode IS NULL
  MERGE (target:UnresolvedTarget {id: row.to_id})
  SET target += {
    name: row.to_id,
    source: 'ingest-world-inbox',
    status: 'unresolved',
    intended_label: row.to_label,
    importedAt: datetime()
  }
  MERGE (candidate)-[:PROPOSES]->(target)
  RETURN count(*) AS targetLinked
}
WITH candidate, row
UNWIND row.evidence_item_ids AS itemId
MATCH (item:InboxItem {id: itemId})
MERGE (item)-[:EVIDENCE_FOR]->(candidate)
RETURN count(DISTINCT candidate) AS candidateLinks`;
}

export function cypherParamsFromPayload(payload) {
  const normalized = normalizeInboxIngestionPayload(payload);
  return {
    ...normalized,
    trendItemLinks: normalized.trends.flatMap(trend =>
      trend.matched_item_ids.map(itemId => ({ trend_id: trend.id, item_id: itemId }))),
  };
}

export function loadPayloadFromObservationFile(filePath) {
  const raw = readFileSync(filePath, 'utf-8');
  return normalizeInboxIngestionPayload(extractNeo4jTransferPayload(raw));
}

export function resolveObservationFile(flags = {}) {
  if (flags.file) return resolve(String(flags.file));
  if (flags.path) return resolve(String(flags.path));

  const date = flags.date ? String(flags.date).slice(0, 10) : null;
  const worldRoot = flags.worldRoot || flags['world-root']
    ? resolve(String(flags.worldRoot || flags['world-root']))
    : getWorldMachineRoot();
  const observationRoots = inboxReportRoots(worldRoot);

  if (date) {
    for (const observationRoot of observationRoots) {
      const candidate = join(observationRoot, `${date} - Inbox Ingestion Batch.md`);
      if (existsSync(candidate)) return candidate;
    }
    return join(observationRoots[0], `${date} - Inbox Ingestion Batch.md`);
  }

  const latest = findLatestInboxObservation(observationRoots);
  if (!latest) throw new Error(`No Inbox Ingestion Batch observation found in ${observationRoots.join(', ')}`);
  return latest;
}

export async function writeInboxIngestionPayload(session, payload) {
  const params = cypherParamsFromPayload(payload);
  for (const statement of buildInboxIngestionSchemaStatements()) {
    await session.run(statement);
  }
  const result = await session.run(buildWriteInboxIngestionCypher(), params);
  const candidateLinks = numericValue(result.records[0]?.get('candidateLinks'));
  return {
    dryRun: false,
    batch: params.batch,
    nodes: buildDryRunPlan(params).nodes,
    relationships: buildDryRunPlan(params).relationships,
    candidateLinks,
  };
}

function inboxReportRoots(worldRoot) {
  return [
    join(worldRoot, 'Reports', 'Inbox Reports'),
    join(worldRoot, '500-archive', 'Inbox', 'Observations'),
  ];
}

function findLatestInboxObservation(observationRoots) {
  const candidates = observationRoots.filter(root => existsSync(root)).flatMap(observationRoot =>
    readdirSync(observationRoot, { withFileTypes: true })
      .filter(entry => entry.isFile() && /^\d{4}-\d{2}-\d{2} - Inbox Ingestion Batch(?: \d+)?\.md$/i.test(entry.name))
      .map(entry => join(observationRoot, entry.name)))
    .sort((a, b) => b.localeCompare(a));

  return candidates.find(filePath =>
    readFileSync(filePath, 'utf-8').includes(`"schema": "${SUPPORTED_SCHEMA}"`)) || null;
}

function numericValue(value) {
  if (typeof value?.toNumber === 'function') return value.toNumber();
  return Number(value ?? 0);
}

function numberOrZero(value) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function requiredString(value, field) {
  const text = String(value || '').trim();
  if (!text) throw new Error(`Inbox ingestion payload missing ${field}`);
  return text;
}

function arrayFrom(value) {
  return Array.isArray(value) ? value : [];
}
