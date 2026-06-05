import assert from 'node:assert/strict';
import { existsSync, rmSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import {
  buildBlindSpotGraph,
  normalizeConceptKey,
  renderCsv,
  validateGraph,
  writeExportPackage,
} from '../lib/neo4j-blind-spot-graph.mjs';
import { runNeo4jBlindSpotGraphPull } from '../pullers/neo4j-blind-spot-graph.mjs';

const SCRATCH = resolve('99_System', 'exports', 'neo4j', '.test_blind_spot_graph');

function runTest(name, fn) {
  Promise.resolve()
    .then(fn)
    .then(() => console.log(`ok - ${name}`))
    .catch(error => {
      console.error(`not ok - ${name}`);
      console.error(error);
      process.exitCode = 1;
    });
}

function cleanScratch() {
  if (existsSync(SCRATCH)) rmSync(SCRATCH, { recursive: true, force: true });
}

function note({ vault = 'World_Machine', relativePath, data = {}, content = '' }) {
  return { vault, relativePath, data, content, path: `${vault}/${relativePath}` };
}

runTest('normalizes wikilink aliases and title-only entity references to one concept key', () => {
  assert.equal(normalizeConceptKey('[[Gold]]'), 'gold');
  assert.equal(normalizeConceptKey('[[Entities/Commodities/Gold|Gold]]'), 'gold');
  assert.equal(normalizeConceptKey('Entities/Commodities/Gold.md'), 'gold');
  assert.equal(normalizeConceptKey('Tech Sector'), 'tech-sector');
});

runTest('builds typed concept nodes and explicit relationships from both vaults', () => {
  const graph = buildBlindSpotGraph({
    date: '2026-06-01',
    notes: [
      note({
        relativePath: 'Entities/Stocks/NVDA.md',
        data: {
          node_type: 'stock',
          ticker: 'NVDA',
          exchange: 'NASDAQ',
          sector: '[[Tech Sector]]',
          related_entities: ['[[MSFT]]', '[[GOOGL]]'],
          tags: ['stock', 'ai'],
        },
      }),
      note({
        relativePath: 'Macro/Regimes/Geopolitical Escalation.md',
        data: {
          node_type: 'regime',
          status: 'Active',
          key_indicators: ['[[Defense Budget]]'],
          favors_sectors: ['[[Aerospace & Defense]]', '[[Energy]]'],
          hurts_sectors: ['[[Consumer Discretionary]]'],
          related_entities: ['[[Entities/Commodities/Gold|Gold]]', '[[Oil]]'],
        },
      }),
      note({
        vault: 'My_Data',
        relativePath: '10_Theses/Drone Autonomous Systems Revolution.md',
        data: {
          node_type: 'thesis',
          conviction: 'high',
          core_entities: ['[[NVDA]]', '[[Aerospace & Defense]]'],
          supporting_regimes: ['[[Geopolitical Escalation]]'],
        },
      }),
    ],
  });

  assert.ok(graph.nodes.some(node => node.id === 'world:stock:NVDA' && node.labels.includes('Stock') && !node.labels.includes('Company')));
  assert.ok(graph.nodes.some(node => node.id === 'world:company:nvda' && node.labels.includes('Company') && !node.labels.includes('Stock')));
  assert.ok(graph.nodes.some(node => node.id === 'world:sector:tech-sector' && node.labels.includes('Sector')));
  assert.ok(graph.nodes.some(node => node.id === 'world:regime:geopolitical-escalation' && node.labels.includes('Regime')));
  assert.ok(graph.nodes.some(node => node.id === 'mydata:thesis:drone-autonomous-systems-revolution' && node.labels.includes('Thesis')));
  assert.ok(graph.nodes.every(node => !node.labels.includes('VaultNote')));

  assert.ok(graph.relationships.some(rel => rel.type === 'BELONGS_TO_DOMAIN' && rel.sourceId === 'world:stock:NVDA' && rel.targetId === 'domain:entities'));
  assert.ok(graph.relationships.some(rel => rel.type === 'ISSUED_BY' && rel.sourceId === 'world:stock:NVDA' && rel.targetId === 'world:company:nvda'));
  assert.ok(graph.relationships.every(rel => rel.type !== 'DERIVED_FROM_NOTE'));
  assert.ok(graph.relationships.some(rel => rel.type === 'AFFECTS_STOCK' && rel.sourceId === 'world:sector:tech-sector' && rel.targetId === 'world:stock:NVDA'));
  assert.ok(graph.relationships.some(rel => rel.type === 'FAVORS_SECTOR' && rel.sourceId === 'world:regime:geopolitical-escalation' && rel.targetId === 'world:sector:aerospace-defense'));
  assert.ok(graph.relationships.some(rel => rel.type === 'SUPPORTS_THESIS' && rel.sourceId === 'mydata:thesis:drone-autonomous-systems-revolution' && rel.targetId === 'world:regime:geopolitical-escalation'));

  assert.deepEqual(validateGraph(graph).errors, []);
});

runTest('creates reviewable candidate links for blind spots with evidence metadata', () => {
  const graph = buildBlindSpotGraph({
    date: '2026-06-01',
    notes: [
      note({
        relativePath: 'Entities/Stocks/KTOS.md',
        data: { node_type: 'stock', ticker: 'KTOS', sector: '[[Aerospace & Defense]]' },
      }),
      note({
        relativePath: 'Macro/Regimes/Geopolitical Escalation.md',
        data: {
          node_type: 'regime',
          favors_sectors: ['[[Aerospace & Defense]]'],
        },
      }),
      note({
        relativePath: 'Policy/Bills/Federal/Defense Drone Bill.md',
        data: {
          type: 'bill',
          sectors: ['defense'],
          jurisdiction: 'federal',
          status: 'introduced',
        },
        content: 'Drone procurement policy likely touches Aerospace & Defense and Geopolitical Escalation.',
      }),
      note({
        relativePath: '_Inbox/10_Themes/Geopolitics and Capital Flows/Hormuz Risk.md',
        data: { title: 'Hormuz Risk', source: 'newsletter' },
        content: 'Hormuz oil shock and Geopolitical Escalation could affect Oil and Energy.',
      }),
    ],
  });

  const candidateLinks = graph.nodes.filter(node => node.labels.includes('CandidateLink'));
  const proposedBy = graph.relationships.filter(rel => rel.type === 'PROPOSED_BY');
  const proposes = graph.relationships.filter(rel => rel.type === 'PROPOSES');
  assert.ok(candidateLinks.length >= 2);
  assert.equal(proposedBy.length, candidateLinks.length);
  assert.equal(proposes.length, candidateLinks.length);
  assert.ok(graph.relationships.every(rel => rel.type !== 'CANDIDATE_LINK'));
  assert.ok(candidateLinks.every(node => node.properties.status === 'candidate'));
  assert.ok(candidateLinks.every(node => node.properties.reviewState === 'needs_review'));
  assert.ok(candidateLinks.some(node => node.properties.method === 'frontmatter_gap' && /stock has sector exposure/i.test(node.properties.reason)));
  assert.ok(candidateLinks.some(node => node.properties.method === 'source_gap' && /news/i.test(node.properties.reason)));
  assert.ok(candidateLinks.some(node => node.properties.missingEvidence));
});

runTest('stores provenance directly on typed nodes with snake_case keys', () => {
  const graph = buildBlindSpotGraph({
    date: '2026-06-01',
    notes: [
      note({
        vault: 'My_Data',
        relativePath: '05_Data_Pulls/Market/2026-06-01_Test_Pull.md',
        data: { source: 'manual', date_pulled: '2026-06-01' },
      }),
    ],
  });

  const pull = graph.nodes.find(node => node.id === 'mydata:pull:2026-06-01-test-pull');
  assert.ok(pull);
  assert.equal(pull.properties.source_path, 'My_Data/05_Data_Pulls/Market/2026-06-01_Test_Pull.md');
  assert.equal(pull.properties.source_rel_path, '05_Data_Pulls/Market/2026-06-01_Test_Pull.md');
  assert.equal(pull.properties.source_vault, 'My_Data');
  assert.equal(pull.properties.source_folder, '05_Data_Pulls');
  assert.match(pull.properties.source_url, /^obsidian:\/\/open\?vault=My_Data&file=/);
  assert.ok(graph.nodes.every(node => !node.labels.includes('VaultNote')));
  assert.ok(graph.relationships.every(rel => rel.type !== 'DERIVED_FROM_NOTE'));
});

runTest('renders compact and split CSV package with candidate review file and loader', async () => {
  cleanScratch();
  const graph = buildBlindSpotGraph({
    date: '2026-06-01',
    notes: [
      note({
        relativePath: 'Macro/Indicators/10Y Treasury.md',
        data: {
          node_type: 'indicator',
          name: '10-Year Treasury Yield',
          parent_regimes: ['[[Rate Hike Cycle]]'],
          affects_sectors: ['[[Tech Sector]]'],
          current_value: '4.59%',
          trend: 'Rising',
        },
      }),
      note({
        relativePath: 'Macro/Regimes/Rate Hike Cycle.md',
        data: { node_type: 'regime', status: 'Active' },
      }),
    ],
  });

  const csv = renderCsv(graph.nodes, 'node');
  assert.match(csv.split('\n')[0], /id,labels,name,canonicalName/);
  assert.match(csv, /world:macroindicator:10y-treasury/);

  const summary = await writeExportPackage({ graph, outDir: SCRATCH, date: '2026-06-01' });
  assert.equal(summary.nodeCount, graph.nodes.length);
  assert.equal(summary.relationshipCount, graph.relationships.length);
  assert.ok(existsSync(join(SCRATCH, 'nodes.csv')));
  assert.ok(existsSync(join(SCRATCH, 'relationships.csv')));
  assert.ok(existsSync(join(SCRATCH, 'candidate_links.csv')));
  assert.ok(existsSync(join(SCRATCH, 'load_blind_spot_graph.cypher')));
  assert.ok(existsSync(join(SCRATCH, 'data-importer', 'nodes_MacroIndicator.csv')));
  assert.ok(existsSync(join(SCRATCH, 'data-importer', 'rel_INDICATES_REGIME.csv')));
  assert.match(readFileSync(join(SCRATCH, 'README.md'), 'utf8'), /Neo4j Blind-Spot Graph Export/);
  assert.match(readFileSync(join(SCRATCH, 'load_blind_spot_graph.cypher'), 'utf8'), /CREATE CONSTRAINT blind_spot_node_id/);
  assert.match(readFileSync(join(SCRATCH, 'load_blind_spot_graph.cypher'), 'utf8'), /CREATE CONSTRAINT candidatelink_id_unique/);
  assert.doesNotMatch(readFileSync(join(SCRATCH, 'load_blind_spot_graph.cypher'), 'utf8'), /SET n:VaultNote/);
  assert.doesNotMatch(readFileSync(join(SCRATCH, 'load_blind_spot_graph.cypher'), 'utf8'), /CANDIDATE_LINK/);
  assert.doesNotMatch(readFileSync(join(SCRATCH, 'load_blind_spot_graph.cypher'), 'utf8'), /apoc\./i);
  cleanScratch();
});

runTest('puller dry-run summarizes graph without writing export files', async () => {
  cleanScratch();
  const result = await runNeo4jBlindSpotGraphPull({
    flags: { 'dry-run': true },
    date: '2026-06-01',
    outDir: SCRATCH,
    notes: [
      note({
        relativePath: 'Entities/Stocks/NVDA.md',
        data: { node_type: 'stock', ticker: 'NVDA', sector: '[[Tech Sector]]' },
      }),
    ],
  });

  assert.equal(result.summary.dryRun, true);
  assert.equal(result.summary.validation.errors.length, 0);
  assert.equal(existsSync(join(SCRATCH, 'nodes.csv')), false);
});
