import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildResearchHandoffs,
  loadEventExposureMap,
} from '../lib/event-connections.mjs';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const SCRIPTS_DIR = resolve(TEST_DIR, '..');
const VAULT_ROOT = resolve(SCRIPTS_DIR, '..');
const EXPECTED_SCENARIOS = [
  'fertilizer-shortage',
  'ai-data-center-power-bottleneck',
  'copper-supply-bottleneck',
  'hormuz-oil-shock',
  'glp1-supply-chain-shortage',
];

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

function sampleFertilizerScenario() {
  return {
    id: 'fertilizer-shortage',
    name: 'Fertilizer Shortage',
    layers: [
      {
        name: 'Direct Fertilizer Inputs',
        mechanism: 'Natural gas and ammonia shortages raise fertilizer prices.',
        watch_terms: ['fertilizer', 'potash', 'ammonia', 'natural gas'],
        beneficiaries: ['fertilizer producers', 'domestic agriculture suppliers'],
        losers: ['food importers'],
        related_theses: ['[[Bioengineered Food Systems]]', '[[Materials Sector Basket]]'],
      },
      {
        name: 'Agricultural Cascade',
        mechanism: 'Lower crop output raises food inflation and stresses consumer companies.',
        watch_terms: ['crop yield', 'food inflation', 'grain exports'],
        beneficiaries: ['grain storage'],
        losers: ['restaurants', 'grocery chains', 'beverage companies'],
        related_theses: ['[[Consumer Staples Sector Basket]]'],
      },
    ],
    timing_phases: [
      { phase: 'Shock', watch_terms: ['fertilizer spike', 'grain spike'], winners: ['fertilizer'], losers: ['restaurants'] },
      { phase: 'Adaptation', watch_terms: ['precision agriculture'], winners: ['ag-tech'], losers: ['legacy supply chains'] },
    ],
  };
}

function sampleLayerContexts(scenario) {
  return scenario.layers.map((layer, index) => ({
    ...layer,
    index,
    evidenceCount: index === 0 ? 2 : 1,
    signalStatus: index === 0 ? 'alert' : 'watch',
    evidence: [
      {
        link: `[[05_Data_Pulls/Test/${index}_Evidence|Evidence ${index}]]`,
        matchScore: 6 - index,
        data: { signal_status: index === 0 ? 'alert' : 'watch' },
      },
    ],
  }));
}

await runTest('loads seeded exposure map for every configured scenario', async () => {
  const exposureMap = await loadEventExposureMap({ engineRoot: VAULT_ROOT });
  for (const scenarioId of EXPECTED_SCENARIOS) {
    const targets = exposureMap.targets.filter(target => target.scenario_ids.includes(scenarioId));
    assert.ok(targets.length >= 3, `${scenarioId} should have at least three curated targets`);
  }
});

await runTest('builds ranked research handoffs from matching event layers', async () => {
  const exposureMap = await loadEventExposureMap({ engineRoot: VAULT_ROOT });
  const scenario = sampleFertilizerScenario();
  const handoffs = buildResearchHandoffs({
    scenario,
    layerContexts: sampleLayerContexts(scenario),
    handoffLimit: 8,
    exposureMap,
  });

  assert.ok(handoffs.length > 0);
  assert.ok(handoffs.length <= 8);
  assert.equal(handoffs[0].scenario_id, 'fertilizer-shortage');
  assert.ok(handoffs[0].score >= handoffs.at(-1).score);
  assert.ok(handoffs.some(handoff => handoff.symbol === 'MOS'));
  assert.ok(handoffs.some(handoff => handoff.symbol === 'KO'));
  assert.ok(handoffs.some(handoff => handoff.target_type === 'commodity_proxy' && handoff.symbol === 'UNG'));
  assert.equal(new Set(handoffs.map(handoff => `${handoff.target_type}:${handoff.symbol || handoff.label}`)).size, handoffs.length);
});

await runTest('generates exact dry-run commands by handoff target type', async () => {
  const exposureMap = await loadEventExposureMap({ engineRoot: VAULT_ROOT });
  const scenario = sampleFertilizerScenario();
  const handoffs = buildResearchHandoffs({
    scenario,
    layerContexts: sampleLayerContexts(scenario),
    handoffLimit: 12,
    exposureMap,
  });

  const company = handoffs.find(handoff => handoff.symbol === 'MOS');
  const risk = company.commands.find(command => command.includes('scan company-risk'));
  const commodity = handoffs.find(handoff => handoff.target_type === 'commodity_proxy' && handoff.symbol === 'UNG');
  const sector = handoffs.find(handoff => handoff.target_type === 'sector' && handoff.sector_slug);
  const thesis = handoffs.find(handoff => handoff.target_type === 'thesis');

  assert.ok(company.commands.includes('node run.mjs pull agent-analyst --symbol MOS --agents price,risk,macro,fundamentals --skip-llm --dry-run'));
  assert.match(risk, /^node run\.mjs scan company-risk --ticker MOS --company ".+" --dry-run$/);
  assert.ok(commodity.commands.includes('node run.mjs pull agent-analyst --symbol UNG --asset commodity --agents price,macro,risk --skip-llm --dry-run'));
  assert.ok(sector.commands.includes(`node run.mjs scan sectors --sector ${sector.sector_slug} --dry-run`));
  assert.ok(thesis.commands.some(command => /^node run\.mjs thesis full-picture --thesis ".+" --dry-run$/.test(command)));
});
