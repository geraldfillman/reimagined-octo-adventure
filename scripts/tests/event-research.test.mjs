import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  buildEventResearchReport,
  loadScenarioConfig,
  pull,
} from '../pullers/event-research.mjs';

function makeTempVault() {
  const root = mkdtempSync(join(tmpdir(), 'event-research-'));
  mkdirSync(join(root, '05_Data_Pulls', 'Energy'), { recursive: true });
  mkdirSync(join(root, '05_Data_Pulls', 'Macro'), { recursive: true });
  mkdirSync(join(root, '05_Data_Pulls', 'News'), { recursive: true });
  mkdirSync(join(root, '05_Data_Pulls', 'Research'), { recursive: true });
  mkdirSync(join(root, '05_Data_Pulls', 'Theses'), { recursive: true });
  mkdirSync(join(root, '01_Data_Sources', 'News_Media'), { recursive: true });
  mkdirSync(join(root, '06_Signals'), { recursive: true });
  mkdirSync(join(root, '10_Theses'), { recursive: true });
  mkdirSync(join(root, 'scripts', 'config'), { recursive: true });
  return root;
}

function makeTempWorldMachine() {
  const root = mkdtempSync(join(tmpdir(), 'event-research-world-'));
  mkdirSync(join(root, '_Inbox'), { recursive: true });
  return root;
}

function writeNote(root, relPath, frontmatter, body) {
  const content = [
    '---',
    ...Object.entries(frontmatter).map(([key, value]) => {
      if (Array.isArray(value)) return `${key}: [${value.map(item => `"${item}"`).join(', ')}]`;
      return `${key}: "${value}"`;
    }),
    '---',
    '',
    body,
  ].join('\n');
  writeFileSync(join(root, relPath), content, 'utf8');
}

function writeScenarioConfig(root) {
  const config = {
    scenarios: [
      {
        id: 'fertilizer-shortage',
        name: 'Fertilizer Shortage',
        core_trigger: 'Global fertilizer shortage causes crop yield stress.',
        trigger_causes: ['natural gas shortage', 'export ban'],
        layers: [
          {
            name: 'Direct Fertilizer Inputs',
            mechanism: 'Potash, phosphate, ammonia, urea, and natural gas input stress raises farm costs.',
            watch_terms: ['fertilizer', 'potash', 'ammonia', 'urea', 'natural gas'],
            beneficiaries: ['fertilizer producers'],
            losers: ['food importers'],
            sources_to_check: ['FMP', 'EIA'],
            related_theses: ['[[Bioengineered Food Systems]]'],
            related_indicators: ['[[Natural Gas]]'],
          },
          {
            name: 'Agricultural Cascade',
            mechanism: 'Lower crop output transmits into food inflation and feed shortages.',
            watch_terms: ['crop yield', 'food inflation', 'livestock feed'],
            beneficiaries: ['grain storage'],
            losers: ['restaurants'],
            sources_to_check: ['USDA'],
            related_theses: ['[[Bioengineered Food Systems]]'],
            related_indicators: ['[[Food Inflation]]'],
          },
          {
            name: 'Adaptation Moats',
            mechanism: 'Precision agriculture and synthetic biology become more valuable after the shock.',
            watch_terms: ['precision agriculture', 'nitrogen-fixing microbes', 'satellite crop'],
            beneficiaries: ['precision agriculture firms'],
            losers: ['undifferentiated suppliers'],
            sources_to_check: ['Semantic Scholar'],
            related_theses: ['[[Bioengineered Food Systems]]'],
            related_indicators: ['[[Bioengineered Food Research Velocity]]'],
          },
        ],
        timing_phases: [
          { phase: 'Shock', watch_terms: ['fertilizer spike', 'grain spike'], winners: ['fertilizer'], losers: ['restaurants'] },
          { phase: 'Panic', watch_terms: ['export ban', 'subsidies'], winners: ['infrastructure'], losers: ['emerging markets'] },
          { phase: 'Adaptation', watch_terms: ['precision agriculture', 'domestic production'], winners: ['ag-tech'], losers: ['legacy supply chains'] },
        ],
        opportunity_factors: [
          { factor: 'Duration', question: 'Temporary spike or multi-year?' },
          { factor: 'Moat', question: 'Durable advantage?' },
        ],
      },
    ],
  };
  writeFileSync(join(root, 'scripts', 'config', 'event-scenarios.json'), JSON.stringify(config, null, 2), 'utf8');
}

function writeExposureMap(root) {
  const map = {
    schema_version: 1,
    targets: [
      {
        id: 'fertilizer-inputs-mos',
        scenario_ids: ['fertilizer-shortage'],
        target_type: 'company',
        symbol: 'MOS',
        label: 'Mosaic',
        exposure: 'Fertilizer producer with potash and phosphate leverage.',
        direction: 'beneficiary',
        agents: ['market', 'fundamentals'],
        match_terms: ['fertilizer producers', 'potash', 'phosphate', 'fertilizer'],
        related_theses: ['Bioengineered Food Systems', 'Materials Sector Basket'],
      },
      {
        id: 'fertilizer-gas-ung',
        scenario_ids: ['fertilizer-shortage'],
        target_type: 'commodity_proxy',
        symbol: 'UNG',
        label: 'Natural gas proxy',
        commodity_label: 'Natural Gas',
        exposure: 'Natural gas transmits into ammonia and fertilizer economics.',
        direction: 'input_cost',
        agents: ['market', 'macro'],
        match_terms: ['natural gas', 'ammonia', 'crop input costs'],
      },
      {
        id: 'food-inflation-consumer-staples',
        scenario_ids: ['fertilizer-shortage'],
        target_type: 'sector',
        label: 'Consumer Staples Sector',
        sector_slug: 'consumer-staples',
        exposure: 'Food inflation changes volume, margin, and pricing-power reads.',
        direction: 'mixed',
        agents: ['sectors'],
        match_terms: ['food inflation', 'grocery chains', 'beverage companies'],
        related_theses: ['Consumer Staples Sector Basket'],
      },
      {
        id: 'biofood-thesis',
        scenario_ids: ['fertilizer-shortage'],
        target_type: 'thesis',
        label: 'Bioengineered Food Systems',
        exposure: 'Adaptation path through biological crop inputs and resilient food systems.',
        direction: 'adaptation',
        agents: ['thesis', 'research'],
        match_terms: ['precision agriculture', 'nitrogen-fixing microbes', 'bioengineered food systems'],
        related_theses: ['Bioengineered Food Systems'],
      },
    ],
  };
  writeFileSync(join(root, 'scripts', 'config', 'event-exposure-map.json'), JSON.stringify(map, null, 2), 'utf8');
}

async function runTest(name, fn) {
  let root;
  try {
    root = makeTempVault();
    writeScenarioConfig(root);
    writeExposureMap(root);
    await fn(root);
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  } finally {
    if (root) await rm(root, { recursive: true, force: true });
  }
}

await runTest('loads seeded scenario config by id', async root => {
  const config = await loadScenarioConfig({ engineRoot: root });
  assert.equal(config.scenarios[0].id, 'fertilizer-shortage');
  assert.equal(config.scenarios[0].layers.length, 3);
});

await runTest('builds report with schema frontmatter and ordered layers', async root => {
  writeNote(root, '05_Data_Pulls/Energy/2026-05-20_EIA_Gas.md', {
    title: 'Natural Gas Spike',
    source: 'EIA',
    date_pulled: '2026-05-20',
    domain: 'energy',
    data_type: 'snapshot',
    frequency: 'daily',
    signal_status: 'alert',
    signals: ['gas_spike'],
    tags: ['energy'],
  }, 'Natural gas and ammonia prices are pressuring fertilizer supply.');
  writeNote(root, '10_Theses/Bioengineered Food Systems.md', {
    node_type: 'thesis',
    conviction: 'low',
    timeframe: 'long',
    core_entities: ['[[FMC]]'],
    supporting_regimes: ['[[Food Inflation]]'],
    invalidation_triggers: ['unit economics fail'],
  }, 'Precision agriculture and nitrogen-fixing microbes could matter after food supply shocks.');

  const result = await buildEventResearchReport({
    engineRoot: root,
    scenarioId: 'fertilizer-shortage',
    windowDays: 30,
    limit: 10,
    asOf: '2026-05-24',
  });

  assert.equal(result.frontmatter.source, 'Event Research');
  assert.equal(result.frontmatter.domain, 'theses');
  assert.equal(result.frontmatter.data_type, 'event_research_report');
  assert.equal(result.frontmatter.signal_status, 'alert');
  assert.equal(result.frontmatter.connection_status, 'mapped');
  assert.equal(result.frontmatter.research_handoff_count, 4);
  assert.deepEqual(result.frontmatter.top_research_targets.slice(0, 2), ['MOS', 'UNG']);
  assert.match(result.note, /## Layer Cascade Map/);
  assert.match(result.note, /## Connection Timeline/);
  assert.match(result.note, /## Research Handoffs/);
  assert.match(result.note, /node run\.mjs pull agent-analyst --symbol MOS --agents price,risk,macro,fundamentals --skip-llm --dry-run/);
  assert.ok(result.note.indexOf('Direct Fertilizer Inputs') < result.note.indexOf('Agricultural Cascade'));
  assert.match(result.note, /\[\[05_Data_Pulls\/Energy\/2026-05-20_EIA_Gas\|Natural Gas Spike\]\]/);
});

await runTest('dry-run prints report and does not write files', async root => {
  const result = await pull({
    scenario: 'fertilizer-shortage',
    'dry-run': true,
    _engineRoot: root,
    _asOf: '2026-05-24',
  });

  const thesisFiles = readdirSync(join(root, '05_Data_Pulls', 'Theses'));
  const sidecarPath = join(root, 'scripts', '.cache', 'event-research', '2026-05-24_fertilizer-shortage.json');
  assert.equal(result.filePath, null);
  assert.equal(thesisFiles.length, 0);
  assert.equal(existsSync(sidecarPath), false);
});

await runTest('coverage gaps appear for layers without evidence', async root => {
  const result = await buildEventResearchReport({
    engineRoot: root,
    scenarioId: 'fertilizer-shortage',
    asOf: '2026-05-24',
  });

  assert.ok(result.coverageGaps.length >= 3);
  assert.equal(result.frontmatter.inferred_phase, 'unresolved');
  assert.match(result.note, /No recent local evidence matched Direct Fertilizer Inputs/);
});

await runTest('json output includes limited research handoffs without writing sidecar', async root => {
  writeNote(root, '05_Data_Pulls/Energy/2026-05-20_EIA_Gas.md', {
    title: 'Natural Gas Spike',
    source: 'EIA',
    date_pulled: '2026-05-20',
    domain: 'energy',
    data_type: 'snapshot',
    frequency: 'daily',
    signal_status: 'alert',
    signals: ['gas_spike'],
    tags: ['energy'],
  }, 'Natural gas and ammonia prices are pressuring fertilizer supply.');

  const result = await pull({
    scenario: 'fertilizer-shortage',
    json: true,
    'handoff-limit': 2,
    _engineRoot: root,
    _asOf: '2026-05-24',
  });

  const sidecarPath = join(root, 'scripts', '.cache', 'event-research', '2026-05-24_fertilizer-shortage.json');
  assert.equal(result.filePath, null);
  assert.equal(result.research_handoff_count, 2);
  assert.equal(result.research_handoffs.length, 2);
  assert.deepEqual(result.top_research_targets, ['MOS', 'UNG']);
  assert.equal(existsSync(sidecarPath), false);
});

await runTest('further knowledge section groups papers news sources and follow-up pulls', async root => {
  writeNote(root, '05_Data_Pulls/Research/2026-05-20_SemanticScholar_Fertilizer.md', {
    title: 'Semantic Scholar Fertilizer Papers',
    source: 'Semantic Scholar',
    date_pulled: '2026-05-20',
    domain: 'research',
    data_type: 'research_papers',
    frequency: 'on-demand',
    signal_status: 'watch',
    signals: ['fertilizer_research'],
    tags: ['research'],
  }, 'Precision agriculture and fertilizer shortage research papers.');
  writeNote(root, '05_Data_Pulls/News/2026-05-21_GDELT_Fertilizer.md', {
    title: 'GDELT Fertilizer News',
    source: 'GDELT',
    date_pulled: '2026-05-21',
    domain: 'news',
    data_type: 'news_monitor',
    frequency: 'intraday',
    signal_status: 'watch',
    signals: ['fertilizer_news'],
    tags: ['news'],
  }, 'News and blogs covering fertilizer export ban risk.');
  writeNote(root, '01_Data_Sources/News_Media/GDELT DOC API.md', {
    name: 'GDELT DOC API',
    category: 'News_Media',
    type: 'Feed',
    provider: 'GDELT',
    status: 'Active',
    tags: ['news'],
  }, 'Use for fertilizer and agriculture news monitoring.');

  const result = await buildEventResearchReport({
    engineRoot: root,
    scenarioId: 'fertilizer-shortage',
    windowDays: 30,
    limit: 10,
    asOf: '2026-05-24',
  });

  assert.match(result.note, /## Further Knowledge/);
  assert.match(result.note, /### Research Papers/);
  assert.match(result.note, /Semantic Scholar Fertilizer Papers/);
  assert.match(result.note, /### Blogs And News/);
  assert.match(result.note, /GDELT Fertilizer News/);
  assert.match(result.note, /### Source Notes And Reference Surfaces/);
  assert.match(result.note, /GDELT DOC API/);
  assert.match(result.note, /### Suggested Follow-Up Pulls/);
  assert.match(result.note, /node run\.mjs pull semantic-scholar/);
});

await runTest('latest Semantic Scholar section ranks local papers and exposes refresh commands', async root => {
  writeNote(root, '05_Data_Pulls/Research/2026-05-18_SemanticScholar_Old_Fertilizer.md', {
    title: 'Older Fertilizer Research',
    source: 'Semantic Scholar Academic Graph',
    date_pulled: '2026-05-18',
    domain: 'research',
    data_type: 'semantic_scholar_papers',
    frequency: 'on-demand',
    signal_status: 'clear',
    query: 'fertilizer crop yield',
    signals: [],
    tags: ['research', 'semantic-scholar'],
  }, 'Older fertilizer and crop yield research.');
  writeNote(root, '05_Data_Pulls/Research/2026-05-23_SemanticScholar_Precision_Ag.md', {
    title: 'Fresh Precision Agriculture Papers',
    source: 'Semantic Scholar Academic Graph',
    date_pulled: '2026-05-23',
    domain: 'research',
    data_type: 'semantic_scholar_papers',
    frequency: 'on-demand',
    signal_status: 'clear',
    query: 'precision agriculture fertilizer shortage',
    signals: [],
    tags: ['research', 'semantic-scholar'],
  }, 'Precision agriculture nitrogen-fixing microbes fertilizer shortage crop yield research.');

  const result = await pull({
    scenario: 'fertilizer-shortage',
    json: true,
    _engineRoot: root,
    _asOf: '2026-05-24',
  });

  assert.equal(result.semantic_scholar_research.length, 2);
  assert.equal(result.semantic_scholar_research[0].title, 'Fresh Precision Agriculture Papers');
  assert.match(result.semantic_scholar_refresh_commands[0], /node run\.mjs pull semantic-scholar --query "Fertilizer Shortage/);
  assert.match(result.semantic_scholar_refresh_commands[0], /--year 2025-/);
});

await runTest('non-dry run sidecar includes Semantic Scholar research queue', async root => {
  writeNote(root, '05_Data_Pulls/Research/2026-05-23_SemanticScholar_Precision_Ag.md', {
    title: 'Fresh Precision Agriculture Papers',
    source: 'Semantic Scholar Academic Graph',
    date_pulled: '2026-05-23',
    domain: 'research',
    data_type: 'semantic_scholar_papers',
    frequency: 'on-demand',
    signal_status: 'clear',
    query: 'precision agriculture fertilizer shortage',
    signals: [],
    tags: ['research', 'semantic-scholar'],
  }, 'Precision agriculture nitrogen-fixing microbes fertilizer shortage crop yield research.');

  const result = await pull({
    scenario: 'fertilizer-shortage',
    _engineRoot: root,
    _asOf: '2026-05-24',
  });
  const written = await readFile(result.filePath, 'utf8');
  const sidecarPath = join(root, 'scripts', '.cache', 'event-research', '2026-05-24_fertilizer-shortage.json');
  const sidecar = JSON.parse(await readFile(sidecarPath, 'utf8'));

  assert.match(written, /## Latest Semantic Scholar Research/);
  assert.match(written, /Fresh Precision Agriculture Papers/);
  assert.match(written, /node run\.mjs pull semantic-scholar --query/);
  assert.equal(sidecar.semantic_scholar_research.length, 1);
  assert.equal(sidecar.semantic_scholar_research[0].title, 'Fresh Precision Agriculture Papers');
  assert.ok(sidecar.semantic_scholar_refresh_commands.every(command => command.includes('semantic-scholar')));
});

await runTest('inbox ingestion bridge is included in report json and sidecar', async root => {
  const worldRoot = makeTempWorldMachine();
  try {
    writeFileSync(join(worldRoot, '_Inbox', 'Oil Shock Clip.md'), '# Oil Shock Clip\nHormuz oil shock travel and energy market note.', 'utf8');
    mkdirSync(join(worldRoot, '_Inbox', 'World Machine Candidate Packets'), { recursive: true });
    writeFileSync(join(worldRoot, '_Inbox', 'World Machine Candidate Packets', 'XOM packet.md'), '# XOM packet\nEnergy packet for research routing.', 'utf8');
    mkdirSync(join(worldRoot, 'Reports', 'Inbox Reports'), { recursive: true });
    writeFileSync(join(worldRoot, 'Reports', 'Inbox Reports', '2026-05-24 - Inbox Ingestion Batch.md'), [
      '---',
      'type: observation',
      'created: 2026-05-24',
      'event_trend_count: 3',
      'related_event_scenarios: ["hormuz-oil-shock", "fertilizer-shortage"]',
      '---',
      '',
      '# 2026-05-24 - Inbox Ingestion Batch',
    ].join('\n'), 'utf8');

    const jsonResult = await pull({
      scenario: 'fertilizer-shortage',
      json: true,
      _engineRoot: root,
      _worldRoot: worldRoot,
      _asOf: '2026-05-24',
    });

    assert.equal(jsonResult.inbox_ingestion.processable_count, 2);
    assert.match(jsonResult.inbox_ingestion.inbox_path, /_Inbox$/);
    assert.equal(jsonResult.inbox_ingestion.latest_batch_observation.event_trend_count, 3);
    assert.deepEqual(jsonResult.inbox_ingestion.latest_batch_observation.related_event_scenarios, ['hormuz-oil-shock', 'fertilizer-shortage']);
    assert.ok(jsonResult.inbox_ingestion.commands.includes('node run.mjs bridge ingest-world-inbox --dry-run'));
    assert.ok(jsonResult.inbox_ingestion.commands.includes('node run.mjs bridge ingest-world-inbox'));

    const writeResult = await pull({
      scenario: 'fertilizer-shortage',
      _engineRoot: root,
      _worldRoot: worldRoot,
      _asOf: '2026-05-24',
    });
    const written = await readFile(writeResult.filePath, 'utf8');
    const sidecarPath = join(root, 'scripts', '.cache', 'event-research', '2026-05-24_fertilizer-shortage.json');
    const sidecar = JSON.parse(await readFile(sidecarPath, 'utf8'));

    assert.match(written, /## Inbox Ingestion Bridge/);
    assert.match(written, /Processable Inbox Items\*\*: 2/);
    assert.match(written, /Latest Batch Event Trends\*\*: 3/);
    assert.match(written, /node run\.mjs bridge ingest-world-inbox --dry-run/);
    assert.equal(sidecar.inbox_ingestion.processable_count, 2);
  } finally {
    await rm(worldRoot, { recursive: true, force: true });
  }
});

await runTest('unknown scenario error lists available ids', async root => {
  await assert.rejects(
    () => buildEventResearchReport({ engineRoot: root, scenarioId: 'copper-bottleneck' }),
    /Unknown event scenario "copper-bottleneck". Available: fertilizer-shortage/
  );
});

await runTest('non-dry run writes event research report into thesis pulls', async root => {
  const result = await pull({
    scenario: 'fertilizer-shortage',
    _engineRoot: root,
    _asOf: '2026-05-24',
  });

  assert.match(result.filePath, /05_Data_Pulls[\\/]Theses[\\/]2026-05-24_Event_Research_Fertilizer_Shortage\.md$/);
  assert.equal(existsSync(result.filePath), true);
  const written = await readFile(result.filePath, 'utf8');
  const sidecarPath = join(root, 'scripts', '.cache', 'event-research', '2026-05-24_fertilizer-shortage.json');
  const sidecar = JSON.parse(await readFile(sidecarPath, 'utf8'));
  assert.match(written, /event_research_report/);
  assert.match(written, /research_handoff_count: 4/);
  assert.equal(sidecar.scenario, 'fertilizer-shortage');
  assert.equal(sidecar.research_handoff_count, 4);
  assert.ok(sidecar.research_handoffs.some(handoff => handoff.symbol === 'MOS'));
});
