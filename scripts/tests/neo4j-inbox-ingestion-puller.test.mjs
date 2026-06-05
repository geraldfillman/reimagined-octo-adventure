import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { runNeo4jInboxIngestionPull } from '../pullers/neo4j-inbox-ingestion.mjs';
import { resolveObservationFile } from '../lib/neo4j-inbox-ingestion.mjs';

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

runTest('neo4j inbox ingestion puller supports dry-run json without Neo4j writes', async () => {
  const root = mkdtempSync(join(tmpdir(), 'neo4j-inbox-ingestion-puller-'));
  try {
    const file = join(root, '2026-06-02 - Inbox Ingestion Batch.md');
    writeFileSync(file, `# Inbox

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
    "import_status": "review"
  },
  "items": [],
  "trends": [],
  "candidate_links": [],
  "review_commands": []
}
\`\`\`
`, 'utf-8');

    const result = await runNeo4jInboxIngestionPull({ flags: { file, 'dry-run': true, json: true } });

    assert.equal(result.dryRun, true);
    assert.equal(result.batch.id, 'world:inbox-ingestion-batch:2026-06-02');
    assert.equal(result.nodes.batches, 1);
    assert.equal(result.nodes.candidateLinks, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

runTest('default file resolution skips older batch notes without transfer blocks', () => {
  const worldRoot = mkdtempSync(join(tmpdir(), 'neo4j-inbox-ingestion-latest-'));
  try {
    const observationRoot = join(worldRoot, 'Reports', 'Inbox Reports');
    mkdirSync(observationRoot, { recursive: true });
    writeFileSync(join(observationRoot, '2026-06-03 - Inbox Ingestion Batch.md'), '# No transfer block yet', 'utf-8');
    writeFileSync(join(observationRoot, '2026-06-02 - Inbox Ingestion Batch.md'), `# Inbox

## Neo4j Transfer Block

\`\`\`json
{
  "schema": "neo4j_inbox_ingestion_v1",
  "batch": {
    "id": "world:inbox-ingestion-batch:2026-06-02",
    "date": "2026-06-02"
  }
}
\`\`\`
`, 'utf-8');

    const resolved = resolveObservationFile({ worldRoot });
    assert.equal(resolved.endsWith('2026-06-02 - Inbox Ingestion Batch.md'), true);
  } finally {
    rmSync(worldRoot, { recursive: true, force: true });
  }
});
