import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';

import {
  classifyCoverage,
  classifySignalStatus,
  layerMatchesNote,
  makeCycleStatusNote,
  pull,
} from '../pullers/market-cycle-monitor.mjs';

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

await runTest('classifyCoverage reports a gap when no latest note exists', () => {
  assert.deepEqual(
    classifyCoverage({
      latest: null,
      sourceStatus: '',
      ageHours: 0,
      staleAfterHours: 24,
      missingInputCount: 0,
      signalStatus: 'clear',
    }),
    { coverageStatus: 'gap', cycleState: 'data_gap' }
  );
});

await runTest('classifyCoverage reports stale when latest note exceeds stale threshold', () => {
  assert.deepEqual(
    classifyCoverage({
      latest: { title: 'Old Pull' },
      sourceStatus: '',
      ageHours: 49,
      staleAfterHours: 24,
      missingInputCount: 0,
      signalStatus: 'clear',
    }),
    { coverageStatus: 'stale', cycleState: 'data_gap' }
  );
});

await runTest('classifyCoverage reports partial when fresh layer has missing inputs', () => {
  assert.deepEqual(
    classifyCoverage({
      latest: { title: 'Fresh Pull' },
      sourceStatus: '',
      ageHours: 3,
      staleAfterHours: 24,
      missingInputCount: 2,
      signalStatus: 'clear',
    }),
    { coverageStatus: 'partial', cycleState: 'incomplete' }
  );
});

await runTest('classifyCoverage reports active when fresh layer has all inputs', () => {
  assert.deepEqual(
    classifyCoverage({
      latest: { title: 'Complete Pull' },
      sourceStatus: '',
      ageHours: 3,
      staleAfterHours: 24,
      missingInputCount: 0,
      signalStatus: 'clear',
    }),
    { coverageStatus: 'active', cycleState: 'stable' }
  );
});

await runTest('classifySignalStatus maps known statuses and blanks to unknown', () => {
  assert.equal(classifySignalStatus('critical'), 'critical');
  assert.equal(classifySignalStatus('alert'), 'alert');
  assert.equal(classifySignalStatus('watch'), 'watch');
  assert.equal(classifySignalStatus('clear'), 'clear');
  assert.equal(classifySignalStatus(''), 'unknown');
});

await runTest('makeCycleStatusNote builds a Market Cycle Status markdown note', () => {
  const note = makeCycleStatusNote({
    layer: {
      id: 'volatility_options',
      label: 'Volatility / Options',
      update_cadence: 'market open, midday, after close',
      stale_after_hours: 8,
      known_missing_inputs: ['dealer gamma', '0DTE share'],
    },
    latest: {
      title: 'VIX Complex Snapshot',
      data_type: 'options_review',
      source_path: 'C:/Users/CaveUser/Documents/Obsidian Vault/My_Data/05_Data_Pulls/Market/2026-05-07_VIX.md',
      source_rel_path: '05_Data_Pulls/Market/2026-05-07_VIX.md',
      obsidian_url: 'obsidian://open?vault=My_Data&file=05_Data_Pulls%2FMarket%2F2026-05-07_VIX.md',
    },
    cycleState: 'incomplete',
    transition: 'new',
    signalStatus: 'clear',
    coverageStatus: 'partial',
    missingInputs: 'dealer gamma; 0DTE share',
    missingInputCount: 2,
    lastUpdated: '2026-05-07T10:00:00',
    staleAfterHours: 8,
    ageHours: 1.2,
  });

  assert.match(note, /type:\s+"?market_cycle_status"?/);
  assert.match(note, /cycle_layer:\s+"Volatility \/ Options"/);
  assert.match(note, /coverage_status:\s+"partial"/);
  assert.match(note, /obsidian:\/\/open\?vault=My_Data/);
});

await runTest('layerMatchesNote rejects labor-only FRED notes for rates funding collateral', () => {
  const ratesLayer = {
    id: 'rates_funding_collateral',
    label: 'Rates / Funding / Collateral',
    expected_data_types: ['time_series', 'macro_volatility'],
    expected_sources: ['FRED', 'Treasury', 'Vault Orchestrator'],
  };
  const laborFredNote = {
    path: 'C:/vault/05_Data_Pulls/Macro/2026-05-05_FRED_Labor_Market.md',
    frontmatter: {
      title: 'FRED Labor Market Pull',
      source: 'FRED API',
      data_type: 'time_series',
    },
  };
  const treasuryYieldNote = {
    path: 'C:/vault/05_Data_Pulls/Macro/2026-05-05_Treasury_Rates.md',
    frontmatter: {
      title: 'Treasury Average Interest Rates',
      source: 'Treasury Fiscal Data',
      data_type: 'snapshot',
    },
  };

  assert.equal(layerMatchesNote(laborFredNote, ratesLayer), false);
  assert.equal(layerMatchesNote(treasuryYieldNote, ratesLayer), true);
});

await runTest('layerMatchesNote rejects strategy Semantic Scholar notes for historical case studies', () => {
  const historicalLayer = {
    id: 'historical_case_studies',
    label: 'Historical Case Studies',
    expected_data_types: ['semantic_scholar_papers', 'knowledge_gap_report'],
    expected_sources: ['Semantic Scholar Academic Graph', 'Research Spine Automation'],
  };
  const lowVolatilityStrategyNote = {
    path: 'C:/vault/05_Data_Pulls/Research/2026-05-06_SemanticScholar_strategy_low_volatility.md',
    frontmatter: {
      title: 'Semantic Scholar Papers - Low Volatility Defensive',
      source: 'Semantic Scholar Academic Graph',
      data_type: 'semantic_scholar_papers',
      query: 'low volatility anomaly defensive equity investing drawdown risk',
    },
  };
  const ldiCrisisNote = {
    path: 'C:/vault/05_Data_Pulls/Research/2026-05-06_SemanticScholar_market_cycle_Historical_Cases_II.md',
    frontmatter: {
      title: 'Semantic Scholar Papers - Historical Cases II',
      source: 'Semantic Scholar Academic Graph',
      data_type: 'semantic_scholar_papers',
      query: 'Volmageddon March 2020 WTI negative oil LDI crisis market feedback',
    },
  };

  assert.equal(layerMatchesNote(lowVolatilityStrategyNote, historicalLayer), false);
  assert.equal(layerMatchesNote(ldiCrisisNote, historicalLayer), true);
});

await runTest('layerMatchesNote rejects EIA regional grid load for commodity delivery storage', () => {
  const commodityLayer = {
    id: 'commodity_delivery_storage',
    label: 'Commodity Delivery / Storage',
    expected_data_types: ['time_series'],
    expected_sources: ['EIA'],
  };
  const regionalGridNote = {
    path: 'C:/vault/05_Data_Pulls/Energy/2026-05-02_EIA_Regional_Grid_Load.md',
    frontmatter: {
      title: 'EIA Regional Grid Load',
      source: 'EIA',
      data_type: 'time_series',
    },
  };

  assert.equal(layerMatchesNote(regionalGridNote, commodityLayer), false);
});

await runTest('layerMatchesNote accepts EIA petroleum inventory storage for commodity delivery storage', () => {
  const commodityLayer = {
    id: 'commodity_delivery_storage',
    label: 'Commodity Delivery / Storage',
    expected_data_types: ['time_series'],
    expected_sources: ['EIA'],
  };
  const petroleumInventoryNote = {
    path: 'C:/vault/05_Data_Pulls/Energy/2026-05-07_EIA_Petroleum_Inventories.md',
    frontmatter: {
      title: 'EIA Petroleum Inventory Storage',
      source: 'EIA',
      data_type: 'time_series',
    },
  };

  assert.equal(layerMatchesNote(petroleumInventoryNote, commodityLayer), true);
});

await runTest('pull rejects cycle_status_dir that escapes the Research Spine root', async () => {
  const previousResearchRoot = process.env.RESEARCH_VAULT_ROOT;
  const tempRoot = await makeTempDir('market-cycle-monitor-containment-');

  try {
    process.env.RESEARCH_VAULT_ROOT = tempRoot;
    const configPath = join(tempRoot, '99_System', 'config', 'market-cycle-monitor.config.json');
    mkdirSync(dirname(configPath), { recursive: true });
    writeFileSync(
      configPath,
      JSON.stringify({
        cycle_status_dir: '..\\escape',
        cycle_layers: [],
      }),
      'utf-8'
    );

    await assert.rejects(
      () => pull({ dryRun: true }),
      /cycle_status_dir.*Research Spine root/i
    );
  } finally {
    restoreEnv('RESEARCH_VAULT_ROOT', previousResearchRoot);
    await rm(tempRoot, { recursive: true, force: true });
  }
});

await runTest('pull dry-run plans only contained outputs and creates no missing files', async () => {
  const previousResearchRoot = process.env.RESEARCH_VAULT_ROOT;
  const tempRoot = await makeTempDir('market-cycle-monitor-dry-run-');
  try {
    process.env.RESEARCH_VAULT_ROOT = tempRoot;
    const configPath = join(tempRoot, '99_System', 'config', 'market-cycle-monitor.config.json');
    const expectedOutput = join(tempRoot, '01_Freshness', 'Market_Cycles', 'dry-run-probe.md');
    mkdirSync(dirname(configPath), { recursive: true });
    writeFileSync(
      configPath,
      JSON.stringify({
        cycle_status_dir: '01_Freshness\\Market_Cycles',
        cycle_layers: [
          {
            id: 'dry_run_probe',
            label: 'Dry Run Probe',
            expected_data_types: ['unmatched_type'],
            expected_sources: ['No Source'],
          },
        ],
      }),
      'utf-8'
    );
    assert.equal(existsSync(expectedOutput), false, expectedOutput);

    const result = await pull({ 'dry-run': true });

    for (const output of result.outputs) {
      assert.equal(pathIsContained(tempRoot, output.output), true, output.output);
    }
    assert.equal(existsSync(expectedOutput), false, expectedOutput);
  } finally {
    restoreEnv('RESEARCH_VAULT_ROOT', previousResearchRoot);
    await rm(tempRoot, { recursive: true, force: true });
  }
});

async function makeTempDir(prefix) {
  const dir = join(tmpdir(), `${prefix}${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function pathIsContained(root, target) {
  const rel = relative(resolve(root), resolve(target));
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
}

function restoreEnv(key, value) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}
