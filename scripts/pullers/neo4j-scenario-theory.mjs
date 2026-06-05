import 'dotenv/config';

import fs from 'node:fs';
import path from 'node:path';

import {
  buildCandidateExposureReadCypher,
  buildDryRunPlan,
  buildScenarioSchemaStatements,
  buildWriteCandidateExposureCypher,
  buildWriteScenarioCypher,
  buildWriteThemeMappingsCypher,
  normalizeCandidateRows,
  normalizeScenarioConfig,
  scenarioConfigToCypherParams,
} from '../lib/neo4j-scenario-theories.mjs';

const REPO_ROOT = path.resolve(import.meta.dirname, '..', '..');
const SCENARIO_DIR = path.join(REPO_ROOT, '99_System', 'config', 'neo4j-scenarios');
const DEFAULT_SCENARIO = '2026-leverage-oil-fed-policy-fragility';

export async function pull(flags = {}) {
  const result = await runNeo4jScenarioTheoryPull({ flags });
  if (flags.json) {
    console.log(JSON.stringify(result, null, 2));
    return result;
  }

  if (result.dryRun) {
    console.log(`Neo4j scenario theory dry-run: ${result.scenario.id}`);
    console.log(`Planned nodes: ${result.nodes.scenarios} Scenario, ${result.nodes.shockVectors} ShockVector, ${result.nodes.riskThemes} RiskTheme`);
    console.log(`Planned CandidateLink exposure discovery cap: ${result.candidateExposure.maxCandidates}`);
    return result;
  }

  console.log(`Neo4j scenario theory wrote scenario layer for ${result.scenario.id}.`);
  console.log(`CandidateLinks proposed: ${result.candidateLinks}`);
  return result;
}

export async function runNeo4jScenarioTheoryPull({ flags = {} } = {}) {
  const scenarioSlug = String(flags.scenario || DEFAULT_SCENARIO);
  const scenario = normalizeScenarioConfig(loadScenarioConfig(scenarioSlug));
  const dryRun = Boolean(flags['dry-run'] || flags.dryRun);

  if (dryRun) return buildDryRunPlan(scenario);

  const password = process.env.NEO4J_PASSWORD;
  if (!password) throw new Error('NEO4J_PASSWORD is required for live scenario theory writes');

  const neo4jModule = await import('neo4j-driver');
  const neo4j = neo4jModule.default ?? neo4jModule;
  const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
  const username = process.env.NEO4J_USERNAME || process.env.NEO4J_USER || 'neo4j';
  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  const session = driver.session({ database: process.env.NEO4J_DATABASE || 'neo4j' });

  try {
    for (const statement of buildScenarioSchemaStatements()) {
      await session.run(statement);
    }

    const params = scenarioConfigToCypherParams(scenario);
    await session.run(buildWriteScenarioCypher(), params);
    await session.run(buildWriteThemeMappingsCypher(), params);

    const candidateResult = await session.run(buildCandidateExposureReadCypher(), {
      scenarioId: scenario.id,
      targetLabels: scenario.candidateExposure.targetLabels,
      minTagScore: scenario.candidateExposure.minTagScore,
      maxCandidates: neo4j.int(scenario.candidateExposure.maxCandidates),
    });
    const candidates = normalizeCandidateRows(candidateResult.records, scenario);

    let candidateLinks = 0;
    if (candidates.length > 0) {
      const writeResult = await session.run(buildWriteCandidateExposureCypher(), { candidates });
      const value = writeResult.records[0]?.get('candidateLinks');
      candidateLinks = typeof value?.toNumber === 'function' ? value.toNumber() : Number(value ?? 0);
    }

    return {
      dryRun: false,
      scenario: {
        id: scenario.id,
        name: scenario.name,
        status: scenario.status,
        asOfDate: scenario.asOfDate,
      },
      nodes: {
        scenarios: 1,
        shockVectors: scenario.shockVectors.length,
        riskThemes: scenario.riskThemes.length,
      },
      relationships: {
        shockVectors: scenario.shockVectors.length,
        riskThemes: scenario.riskThemes.length,
        themeMappings: scenario.themeMappings.length,
      },
      candidateLinks,
      candidatesRead: candidates.length,
    };
  } finally {
    await session.close();
    await driver.close();
  }
}

function loadScenarioConfig(slug) {
  const filePath = path.join(SCENARIO_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Unknown Neo4j scenario "${slug}". Expected config at ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
