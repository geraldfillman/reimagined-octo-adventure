import assert from 'node:assert/strict';

import {
  buildDryRunPlan,
  buildInboxIngestionSchemaStatements,
  buildWriteInboxIngestionCypher,
  extractNeo4jTransferPayload,
  normalizeInboxIngestionPayload,
} from '../lib/neo4j-inbox-ingestion.mjs';

const markdown = `---
type: observation
neo4j_import_ready: true
---

# 2026-06-02 - Inbox Ingestion Batch

## Neo4j Transfer Block

\`\`\`json
{
  "schema": "neo4j_inbox_ingestion_v1",
  "batch": {
    "id": "world:inbox-ingestion-batch:2026-06-02",
    "date": "2026-06-02",
    "title": "2026-06-02 - Inbox Ingestion Batch",
    "source": "ingest-world-inbox",
    "source_vault": "World_Machine",
    "source_rel_path": "Reports/Inbox Reports/2026-06-02 - Inbox Ingestion Batch.md",
    "archive_root_rel_path": "500-archive/Inbox/2026-06-02",
    "import_status": "review",
    "processed_item_count": 1,
    "event_trend_count": 1,
    "candidate_link_count": 2
  },
  "items": [
    {
      "id": "world:inbox-item:2026-06-02:fed-oil-fragility",
      "title": "Fed Oil Fragility",
      "source_rel_path": "Fed Oil Fragility.md",
      "archive_rel_path": "500-archive/Inbox/2026-06-02/Fed Oil Fragility.md",
      "suggested_route": "03_Macro_and_Economy/Observations",
      "excerpt": "Fed rates and oil shock pressure are converging.",
      "source_url": "https://example.com/fed-oil"
    }
  ],
  "trends": [
    {
      "id": "world:event-trend:2026-06-02:rates-oil",
      "label": "Rates And Oil",
      "score": 3,
      "matched_terms": ["fed", "oil"],
      "matched_item_ids": ["world:inbox-item:2026-06-02:fed-oil-fragility"],
      "related_scenarios": ["2026-leverage-oil-fed-policy-fragility"],
      "read": "Rates and oil shock pressure overlap."
    }
  ],
  "candidate_links": [
    {
      "id": "candidate:world-inbox:known-scenario",
      "type": "inbox_event_connection",
      "candidate_type": "existing_scenario_connection",
      "status": "candidate",
      "reviewState": "needs_review",
      "method": "world_machine_inbox_ingestion",
      "source": "ingest-world-inbox",
      "from_id": "world:event-trend:2026-06-02:rates-oil",
      "from_label": "EventTrend",
      "to_id": "scenario:2026-leverage-oil-fed-policy-fragility",
      "to_label": "Scenario",
      "score": 0.8,
      "reason": "Inbox trend maps to seeded scenario.",
      "evidence_item_ids": ["world:inbox-item:2026-06-02:fed-oil-fragility"]
    },
    {
      "id": "candidate:world-inbox:source-gap",
      "type": "inbox_event_connection",
      "candidate_type": "source_gap_followup",
      "status": "candidate",
      "reviewState": "needs_review",
      "method": "world_machine_inbox_ingestion",
      "source": "ingest-world-inbox",
      "from_id": "world:event-trend:2026-06-02:rates-oil",
      "from_label": "EventTrend",
      "to_id": "unresolved:inbox-event:rates-oil-gap",
      "to_label": "UnresolvedTarget",
      "score": 0.4,
      "reason": "Needs a canonical target before promotion.",
      "evidence_item_ids": ["world:inbox-item:2026-06-02:fed-oil-fragility"]
    }
  ],
  "review_commands": ["node run.mjs pull event-research --scenario 2026-leverage-oil-fed-policy-fragility --dry-run"]
}
\`\`\`
`;

function runTest(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

runTest('extracts the Neo4j transfer payload from an inbox batch observation', () => {
  const payload = extractNeo4jTransferPayload(markdown);
  assert.equal(payload.schema, 'neo4j_inbox_ingestion_v1');
  assert.equal(payload.batch.id, 'world:inbox-ingestion-batch:2026-06-02');
  assert.equal(payload.items.length, 1);
  assert.equal(payload.candidate_links.length, 2);
});

runTest('normalizes payload arrays and rejects raw clipping bodies', () => {
  const payload = normalizeInboxIngestionPayload(extractNeo4jTransferPayload(markdown));
  assert.equal(payload.items[0].raw_body, undefined);
  assert.deepEqual(payload.trends[0].matched_item_ids, ['world:inbox-item:2026-06-02:fed-oil-fragility']);
  assert.deepEqual(payload.candidate_links[1].evidence_item_ids, ['world:inbox-item:2026-06-02:fed-oil-fragility']);
});

runTest('builds a dry-run plan from the transfer payload without Neo4j writes', () => {
  const plan = buildDryRunPlan(normalizeInboxIngestionPayload(extractNeo4jTransferPayload(markdown)));
  assert.equal(plan.dryRun, true);
  assert.equal(plan.batch.id, 'world:inbox-ingestion-batch:2026-06-02');
  assert.deepEqual(plan.nodes, {
    batches: 1,
    items: 1,
    trends: 1,
    candidateLinks: 2,
    unresolvedTargets: 1,
  });
  assert.deepEqual(plan.relationships, {
    ingestedItems: 1,
    identifiedTrends: 1,
    supportedBy: 1,
    proposedBy: 2,
    proposes: 2,
    evidenceFor: 2,
  });
});

runTest('builds schema statements and write cypher for reviewable inbox import', () => {
  const schemaStatements = buildInboxIngestionSchemaStatements();
  assert.ok(schemaStatements.some(statement => statement.includes('InboxIngestionBatch')));
  assert.ok(schemaStatements.some(statement => statement.includes('EventTrend')));
  assert.ok(schemaStatements.some(statement => statement.includes('UnresolvedTarget')));

  const cypher = buildWriteInboxIngestionCypher();
  assert.match(cypher, /MERGE \(batch:Observation:InboxIngestionBatch \{id: \$batch\.id\}\)/);
  assert.match(cypher, /MERGE \(item:SourceItem:InboxItem \{id: row\.id\}\)/);
  assert.match(cypher, /MERGE \(trend:EventTrend \{id: row\.id\}\)/);
  assert.match(cypher, /MERGE \(candidate:CandidateLink \{id: row\.id\}\)/);
  assert.match(cypher, /MERGE \(candidate\)-\[:PROPOSES\]->\(target\)/);
  assert.match(cypher, /intended_label: row\.to_label/);
  assert.match(cypher, /evidence_links: \[link IN row\.evidence_links/);
  assert.doesNotMatch(cypher, /FAVORS_|PRESSURES_|INDICATES_|AFFECTS_/);
});
