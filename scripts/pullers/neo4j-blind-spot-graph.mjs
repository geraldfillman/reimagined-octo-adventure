import { resolve } from 'node:path';

import { getEngineRoot, getWorldMachineRoot } from '../lib/config.mjs';
import {
  buildBlindSpotGraph,
  collectBlindSpotNotes,
  runBlindSpotGraphExport,
  validateGraph,
  writeExportPackage,
} from '../lib/neo4j-blind-spot-graph.mjs';

export async function pull(flags = {}) {
  const result = await runNeo4jBlindSpotGraphPull({ flags });

  if (flags.json) {
    console.log(JSON.stringify(result.summary, null, 2));
    return result;
  }

  console.log(`Neo4j blind-spot graph notes scanned: ${result.summary.noteCount}`);
  console.log(`Nodes: ${result.summary.nodeCount}; relationships: ${result.summary.relationshipCount}; candidate links: ${result.summary.candidateLinkCount}`);
  if (result.summary.validation.errors.length) {
    console.log('Validation errors:');
    for (const error of result.summary.validation.errors) console.log(`- ${error}`);
    return result;
  }
  if (result.summary.dryRun) {
    console.log(`Dry run only. Planned export path: ${result.summary.outDir}`);
  } else {
    console.log(`Wrote Neo4j blind-spot graph export: ${result.summary.outDir}`);
  }
  return result;
}

export async function runNeo4jBlindSpotGraphPull({
  flags = {},
  date = String(flags.date || new Date().toISOString().slice(0, 10)).slice(0, 10),
  engineRoot = getEngineRoot(),
  worldRoot = getWorldMachineRoot(),
  outDir = flags['out-dir'] ? resolve(String(flags['out-dir'])) : undefined,
  notes = null,
} = {}) {
  const dryRun = Boolean(flags['dry-run'] || flags.dryRun);

  if (notes) {
    const graph = buildBlindSpotGraph({ notes, date });
    const validation = validateGraph(graph);
    const outputDir = outDir ?? resolve(engineRoot, '99_System', 'exports', 'neo4j', `blind-spot-graph-${date}`);
    const summary = {
      outDir: outputDir,
      dryRun,
      noteCount: notes.length,
      nodeCount: graph.nodes.length,
      relationshipCount: graph.relationships.length,
      candidateLinkCount: graph.nodes.filter(node => node.labels?.includes('CandidateLink')).length,
      validation,
    };
    if (!dryRun && validation.errors.length === 0) {
      summary.export = await writeExportPackage({ graph, outDir: outputDir, date });
    }
    return { graph, summary };
  }

  return runBlindSpotGraphExport({
    date,
    dryRun,
    engineRoot,
    worldRoot,
    outDir,
    includeArchives: Boolean(flags['include-archives']),
  });
}
