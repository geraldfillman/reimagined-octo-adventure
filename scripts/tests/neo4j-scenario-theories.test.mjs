import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  buildCandidateExposureReadCypher,
  buildCandidateLinkId,
  buildDryRunPlan,
  buildScenarioSchemaStatements,
  buildWriteCandidateExposureCypher,
  buildWriteScenarioCypher,
  buildWriteThemeMappingsCypher,
  normalizeScenarioConfig,
  scoreTagOverlap,
} from '../lib/neo4j-scenario-theories.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const scenarioPath = path.join(
  repoRoot,
  '99_System',
  'config',
  'neo4j-scenarios',
  '2026-leverage-oil-fed-policy-fragility.json',
);

function loadScenario() {
  return JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));
}

test('normalizes the leverage oil fed fragility scenario', () => {
  const scenario = normalizeScenarioConfig(loadScenario());
  assert.equal(scenario.id, 'scenario:2026-leverage-oil-fed-policy-fragility');
  assert.equal(scenario.shockVectors.length, 4);
  assert.equal(scenario.riskThemes.length, 4);
  assert.ok(scenario.tags.includes('margin-debt'));
  assert.ok(scenario.tags.includes('hormuz'));
});

test('builds deterministic CandidateLink ids', () => {
  const id = buildCandidateLinkId({
    scenarioId: 'scenario:2026-leverage-oil-fed-policy-fragility',
    sourceId: 'risk-theme:commodity-inflation',
    targetId: 'world:sector:energy',
    type: 'scenario_exposure',
  });
  assert.equal(
    id,
    'candidate:scenario-exposure:scenario-2026-leverage-oil-fed-policy-fragility:risk-theme-commodity-inflation:world-sector-energy',
  );
});

test('scores tag overlap with case-insensitive tags and names', () => {
  const score = scoreTagOverlap({
    tags: ['oil-shock', 'commodities'],
    target: {
      name: 'Energy Commodity Producers',
      tags: ['Energy', 'Inflation'],
      domain: 'market',
      sector: 'Energy',
    },
  });
  assert.equal(score, 1);
});

test('builds dry-run plan without Neo4j writes', () => {
  const plan = buildDryRunPlan(normalizeScenarioConfig(loadScenario()));
  assert.equal(plan.dryRun, true);
  assert.equal(plan.scenario.id, 'scenario:2026-leverage-oil-fed-policy-fragility');
  assert.equal(plan.nodes.scenarios, 1);
  assert.equal(plan.nodes.shockVectors, 4);
  assert.equal(plan.nodes.riskThemes, 4);
  assert.equal(plan.relationships.themeMappings, 5);
});

test('builds schema statements for Step D labels', () => {
  const statements = buildScenarioSchemaStatements();
  assert.ok(statements.every(statement => statement.startsWith('CYPHER 25')));
  assert.ok(statements.some(statement => statement.includes('Scenario')));
  assert.ok(statements.some(statement => statement.includes('ShockVector')));
  assert.ok(statements.some(statement => statement.includes('RiskTheme')));
});

test('builds scenario write cypher with scenario shock vector and theme merges', () => {
  const cypher = buildWriteScenarioCypher();
  assert.match(cypher, /CYPHER 25/);
  assert.match(cypher, /MERGE \(sc:Scenario \{id: \$scenario\.id\}\)/);
  assert.match(cypher, /MERGE \(sv:ShockVector \{id: row\.id\}\)/);
  assert.match(cypher, /MERGE \(rt:RiskTheme \{id: row\.id\}\)/);
  assert.match(cypher, /HAS_SHOCK_VECTOR/);
  assert.match(cypher, /HAS_RISK_THEME/);
});

test('builds theme mapping cypher with bound endpoint rel merge', () => {
  const cypher = buildWriteThemeMappingsCypher();
  assert.match(cypher, /MATCH \(sv:ShockVector \{id: row\.from\}\)/);
  assert.match(cypher, /MATCH \(rt:RiskTheme \{id: row\.to\}\)/);
  assert.match(cypher, /MERGE \(sv\)-\[:MAPS_TO_THEME\]->\(rt\)/);
});

test('builds candidate exposure read and write cypher without promoted edges', () => {
  const readCypher = buildCandidateExposureReadCypher();
  const writeCypher = buildWriteCandidateExposureCypher();

  assert.match(readCypher, /MATCH \(sc:Scenario \{id: \$scenarioId\}\)-\[:HAS_RISK_THEME\]->\(theme:RiskTheme\)/);
  assert.match(readCypher, /LIMIT \$maxCandidates/);
  assert.match(writeCypher, /MERGE \(c:CandidateLink \{id: row\.candidateId\}\)/);
  assert.match(writeCypher, /c\.reviewState = 'needs_review'/);
  assert.match(writeCypher, /MERGE \(theme\)-\[:PROPOSED_BY\]->\(c\)/);
  assert.match(writeCypher, /MERGE \(c\)-\[:PROPOSES\]->\(target\)/);
  assert.doesNotMatch(writeCypher, /FAVORS_|PRESSURES_|INDICATES_|AFFECTS_/);
});
