import 'dotenv/config';

import {
  buildDryRunPlan,
  loadPayloadFromObservationFile,
  resolveObservationFile,
  writeInboxIngestionPayload,
} from '../lib/neo4j-inbox-ingestion.mjs';

export async function pull(flags = {}) {
  const result = await runNeo4jInboxIngestionPull({ flags });
  if (flags.json) {
    console.log(JSON.stringify(result, null, 2));
    return result;
  }

  if (result.dryRun) {
    console.log(`Neo4j inbox ingestion dry-run: ${result.batch.id}`);
    console.log(`Planned nodes: ${result.nodes.batches} batch, ${result.nodes.items} item(s), ${result.nodes.trends} trend(s), ${result.nodes.candidateLinks} CandidateLink(s)`);
    console.log(`Planned relationships: ${Object.values(result.relationships).reduce((sum, count) => sum + count, 0)}`);
    return result;
  }

  console.log(`Neo4j inbox ingestion imported ${result.batch.id}.`);
  console.log(`CandidateLinks proposed: ${result.candidateLinks}`);
  return result;
}

export async function runNeo4jInboxIngestionPull({ flags = {} } = {}) {
  const filePath = resolveObservationFile(flags);
  const payload = loadPayloadFromObservationFile(filePath);
  const dryRun = Boolean(flags['dry-run'] || flags.dryRun);
  const plan = buildDryRunPlan(payload);

  if (dryRun) {
    return {
      ...plan,
      file: filePath,
    };
  }

  const password = process.env.NEO4J_PASSWORD;
  if (!password) throw new Error('NEO4J_PASSWORD is required for live inbox ingestion graph imports');

  const neo4jModule = await import('neo4j-driver');
  const neo4j = neo4jModule.default ?? neo4jModule;
  const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
  const username = process.env.NEO4J_USERNAME || process.env.NEO4J_USER || 'neo4j';
  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  const session = driver.session({ database: process.env.NEO4J_DATABASE || 'neo4j' });

  try {
    const result = await writeInboxIngestionPayload(session, payload);
    return {
      ...result,
      file: filePath,
    };
  } finally {
    await session.close();
    await driver.close();
  }
}
