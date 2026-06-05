import assert from 'node:assert/strict';

import {
  normalizeLinkedPullerName,
  normalizeLinkedPullers,
  resolveCatalogEntry,
} from '../lib/puller-catalog.mjs';
import { loadPullerCatalog } from '../lib/puller-catalog.mjs';

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

runTest('normalizes single linked_puller command and path formats', () => {
  assert.equal(normalizeLinkedPullerName('pull semantic-scholar'), 'semantic-scholar');
  assert.equal(normalizeLinkedPullerName('scripts/pullers/gdelt.mjs'), 'gdelt');
  assert.equal(normalizeLinkedPullerName('pullers/reddit.mjs'), 'reddit');
  assert.equal(normalizeLinkedPullerName('pubmed.mjs'), 'pubmed');
});

runTest('normalizes multi-puller linked_puller fields', () => {
  assert.deepEqual(normalizeLinkedPullers('arxiv, biofood'), ['arxiv', 'biofood']);
  assert.deepEqual(
    normalizeLinkedPullers('pullers/dilution-monitor.mjs + pullers/dd-report.mjs + pullers/filing-digest.mjs + pullers/capital-raise.mjs + pullers/smallcap-screen.mjs'),
    ['dilution-monitor', 'dd-report', 'filing-digest', 'capital-raise', 'smallcap-screen']
  );
});

runTest('resolves catalog aliases and module paths to one canonical entry', () => {
  const catalog = [
    {
      name: 'semantic-scholar',
      module: 'semantic-scholar.mjs',
      aliases: ['pull semantic-scholar', 'scripts/pullers/semantic-scholar.mjs'],
    },
  ];

  assert.equal(resolveCatalogEntry(catalog, 'pull semantic-scholar')?.name, 'semantic-scholar');
  assert.equal(resolveCatalogEntry(catalog, 'scripts/pullers/semantic-scholar.mjs')?.name, 'semantic-scholar');
});

runTest('catalog registers fmp-harvest as manual-only dry-run capable raw acquisition', () => {
  const catalog = loadPullerCatalog();
  const entry = resolveCatalogEntry(catalog, 'fmp-harvest');

  assert.equal(entry?.name, 'fmp-harvest');
  assert.equal(entry.manual_only, true);
  assert.equal(entry.scheduled_allowed, false);
  assert.equal(entry.supports_dry_run, true);
  assert.deepEqual(entry.requires_keys, ['FINANCIAL_MODELING_PREP_API_KEY']);
});

runTest('catalog registers forensic-risk as manual-only source-linked fundamentals triage', () => {
  const catalog = loadPullerCatalog();
  const entry = resolveCatalogEntry(catalog, 'forensic-risk');

  assert.equal(entry?.name, 'forensic-risk');
  assert.equal(entry.manual_only, true);
  assert.equal(entry.scheduled_allowed, false);
  assert.equal(entry.supports_dry_run, true);
  assert.equal(entry.supports_json, true);
  assert.deepEqual(entry.domains, ['Fundamentals']);
  assert.deepEqual(entry.data_types, ['forensic_risk', 'forensic_investigation']);
  assert.ok(entry.source_notes.some(note => note.includes('SEC XBRL Company Facts')));
});

runTest('catalog registers neo4j blind-spot graph as manual-only local synthesis export', () => {
  const catalog = loadPullerCatalog();
  const entry = resolveCatalogEntry(catalog, 'neo4j-blind-spot-graph');

  assert.equal(entry?.name, 'neo4j-blind-spot-graph');
  assert.equal(entry.mode, 'synthesis');
  assert.equal(entry.manual_only, true);
  assert.equal(entry.scheduled_allowed, false);
  assert.equal(entry.supports_dry_run, true);
  assert.equal(entry.supports_json, true);
  assert.deepEqual(entry.requires_keys, []);
  assert.ok(entry.data_types.includes('blind_spot_graph'));
});

runTest('catalog registers neo4j metric snapshots as manual-only FMP ingestion', () => {
  const catalog = loadPullerCatalog();
  const entry = resolveCatalogEntry(catalog, 'neo4j-fmp-metric-snapshots');

  assert.equal(entry?.name, 'neo4j-fmp-metric-snapshots');
  assert.equal(entry.mode, 'raw');
  assert.equal(entry.manual_only, true);
  assert.equal(entry.scheduled_allowed, false);
  assert.equal(entry.supports_dry_run, true);
  assert.equal(entry.supports_json, true);
  assert.deepEqual(entry.requires_keys, ['FINANCIAL_MODELING_PREP_API_KEY']);
  assert.ok(entry.data_types.includes('metric_snapshot'));
});

runTest('catalog registers neo4j scenario theory as manual-only graph synthesis', () => {
  const catalog = loadPullerCatalog();
  const entry = resolveCatalogEntry(catalog, 'neo4j-scenario-theory');

  assert.equal(entry?.name, 'neo4j-scenario-theory');
  assert.equal(entry.mode, 'synthesis');
  assert.equal(entry.manual_only, true);
  assert.equal(entry.scheduled_allowed, false);
  assert.equal(entry.supports_dry_run, true);
  assert.equal(entry.supports_json, true);
  assert.deepEqual(entry.requires_keys, []);
  assert.ok(entry.data_types.includes('scenario_theory'));
  assert.ok(entry.data_types.includes('candidate_links'));
});

runTest('catalog registers neo4j inbox ingestion as manual-only graph import', () => {
  const catalog = loadPullerCatalog();
  const entry = resolveCatalogEntry(catalog, 'neo4j-inbox-ingestion');

  assert.equal(entry?.name, 'neo4j-inbox-ingestion');
  assert.equal(entry.mode, 'synthesis');
  assert.equal(entry.manual_only, true);
  assert.equal(entry.scheduled_allowed, false);
  assert.equal(entry.supports_dry_run, true);
  assert.equal(entry.supports_json, true);
  assert.deepEqual(entry.requires_keys, []);
  assert.ok(entry.data_types.includes('inbox_ingestion_graph_import'));
  assert.ok(entry.data_types.includes('candidate_links'));
});

runTest('catalog registers positioning checklist and related positioning surfaces', () => {
  const catalog = loadPullerCatalog();
  const names = ['positioning-checklist', 'positioning-report', 'institutional-positioning', 'finra-positioning'];

  for (const name of names) {
    const entry = resolveCatalogEntry(catalog, name);
    assert.equal(entry?.name, name);
    assert.equal(entry.scheduled_allowed, false);
    assert.equal(entry.manual_only, true);
    assert.equal(entry.supports_dry_run, true);
  }

  const checklist = resolveCatalogEntry(catalog, 'positioning-checklist');
  assert.equal(checklist.mode, 'synthesis');
  assert.deepEqual(checklist.data_types, ['positioning_checklist']);
});
