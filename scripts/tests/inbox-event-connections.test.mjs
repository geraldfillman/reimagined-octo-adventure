import assert from 'node:assert/strict';

import {
  buildConnectionCandidates,
  renderMermaidConnectionMap,
  renderPlotlyEventConnectionsHtml,
} from '../lib/inbox-event-connections.mjs';

function sampleItem(overrides = {}) {
  return {
    relativePath: '10_Themes/Macro Regime and Economic Data/Fed Rates.md',
    title: 'Fed Rates',
    route: '03_Macro_and_Economy/Observations',
    excerpt: 'Fed rates and yield curve pressure are moving inflation expectations.',
    raw: 'Fed rates and yields connect to CPI, inflation expectations, duration, and bonds.',
    ...overrides,
  };
}

function sampleTrend(overrides = {}) {
  return {
    id: 'rates-bonds-inflation-expectations',
    label: 'Rates, Bonds, And Inflation Expectations',
    matchedTerms: ['fed', 'yield', 'inflation'],
    scenarios: ['fertilizer-shortage', 'hormuz-oil-shock'],
    commands: [
      'node run.mjs pull event-research --scenario fertilizer-shortage --dry-run',
      'node run.mjs pull event-research --scenario hormuz-oil-shock --dry-run',
    ],
    items: [sampleItem()],
    score: 12,
    ...overrides,
  };
}

function sampleEvidence(overrides = {}) {
  return {
    title: 'Treasury Rates',
    relPath: '05_Data_Pulls/Macro/2026-05-25_Treasury_Rates.md',
    signalStatus: 'clear',
    text: 'Fed yield curve inflation duration bonds',
    ...overrides,
  };
}

await test('rates inbox item creates existing scenario connection candidates', () => {
  const candidates = buildConnectionCandidates({
    date: '2026-05-25',
    items: [sampleItem()],
    trends: [sampleTrend()],
    localEvidence: [sampleEvidence()],
  });

  assert.equal(candidates[0].candidate_type, 'existing_scenario_connection');
  assert.equal(candidates[0].status, 'watch');
  assert.deepEqual(candidates[0].related_scenarios, ['fertilizer-shortage', 'hormuz-oil-shock']);
  assert.match(candidates[0].commands[0], /event-research --scenario fertilizer-shortage --dry-run/);
  assert.ok(candidates[0].evidence_links.some(link => link.rel_path.includes('Treasury_Rates')));
});

await test('unmapped narrative trend becomes emerging event candidate', () => {
  const candidates = buildConnectionCandidates({
    date: '2026-05-25',
    items: [sampleItem({ title: 'Narrative Stress', raw: 'poverty wealth labor narrative risk' })],
    trends: [sampleTrend({
      id: 'socioeconomic-narrative-risk',
      label: 'Socioeconomic Narrative Risk',
      scenarios: [],
      commands: ['node run.mjs pull signal-intelligence --scope all --dry-run'],
      matchedTerms: ['poverty', 'wealth', 'labor'],
    })],
    localEvidence: [],
  });

  assert.equal(candidates[0].candidate_type, 'emerging_event_candidate');
  assert.equal(candidates[0].related_scenarios.length, 0);
  assert.match(candidates[0].review_question, /existing World_Machine object/i);
});

await test('alert local evidence upgrades candidate status', () => {
  const candidates = buildConnectionCandidates({
    date: '2026-05-25',
    items: [sampleItem()],
    trends: [sampleTrend()],
    localEvidence: [sampleEvidence({ signalStatus: 'alert' })],
  });

  assert.equal(candidates[0].status, 'alert');
});

await test('candidate limit caps deterministic output and dedupes duplicate trends', () => {
  const candidates = buildConnectionCandidates({
    date: '2026-05-25',
    items: [sampleItem()],
    trends: [sampleTrend(), sampleTrend({ score: 3 })],
    localEvidence: [sampleEvidence()],
    limit: 1,
  });

  assert.equal(candidates.length, 1);
  assert.equal(new Set(candidates.map(candidate => candidate.candidate_id)).size, 1);
});

await test('mermaid map renders compact graph without duplicate node ids', () => {
  const candidates = buildConnectionCandidates({
    date: '2026-05-25',
    items: [sampleItem()],
    trends: [sampleTrend()],
    localEvidence: [sampleEvidence()],
  });

  const mermaid = renderMermaidConnectionMap(candidates);
  assert.match(mermaid, /^```mermaid\nflowchart LR\n/);
  assert.match(mermaid, /"Fed Rates"/);
  assert.match(mermaid, /"Rates, Bonds, And Inflation Expectations"/);

  const ids = [...mermaid.matchAll(/^\s*([a-z]+_[a-z0-9]+)\[/gm)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size);
});

await test('plotly html embeds sanitized candidate data and no raw clipping body', () => {
  const candidates = buildConnectionCandidates({
    date: '2026-05-25',
    items: [sampleItem()],
    trends: [sampleTrend()],
    localEvidence: [sampleEvidence()],
  });

  const html = renderPlotlyEventConnectionsHtml({ date: '2026-05-25', candidates });
  assert.match(html, /Plotly\.newPlot/);
  assert.match(html, /window\.INBOX_EVENT_CONNECTIONS/);
  assert.match(html, /Fed Rates/);
  assert.doesNotMatch(html, /duration, and bonds/);
});

await test('plotly html renders a network graph instead of a connection flow', () => {
  const candidates = buildConnectionCandidates({
    date: '2026-05-25',
    items: [sampleItem()],
    trends: [sampleTrend()],
    localEvidence: [sampleEvidence()],
  });

  const html = renderPlotlyEventConnectionsHtml({ date: '2026-05-25', candidates });
  assert.match(html, /id="network"/);
  assert.match(html, /type:\s*'scatter'/);
  assert.match(html, /mode:\s*'markers\+text'/);
  assert.match(html, /manual_nodes/);
  assert.match(html, /manual_edges/);
  assert.match(html, /localStorage/);
  assert.match(html, /Add Node/);
  assert.match(html, /Add Edge/);
  assert.doesNotMatch(html, /type:\s*'sankey'/);
  assert.doesNotMatch(html, /id="sankey"/);
});

await test('plotly network synthesizes noisy source and evidence selections into candidate metadata', () => {
  const candidates = buildConnectionCandidates({
    date: '2026-05-25',
    items: [
      sampleItem({ title: 'Fed Rates 1', relativePath: 'Inbox/Fed Rates 1.md' }),
      sampleItem({ title: 'Fed Rates 2', relativePath: 'Inbox/Fed Rates 2.md' }),
    ],
    trends: [sampleTrend({
      items: [
        sampleItem({ title: 'Fed Rates 1', relativePath: 'Inbox/Fed Rates 1.md' }),
        sampleItem({ title: 'Fed Rates 2', relativePath: 'Inbox/Fed Rates 2.md' }),
      ],
    })],
    localEvidence: [
      sampleEvidence({ title: 'Treasury Rates 1', relPath: '05_Data_Pulls/Macro/Treasury_1.md' }),
      sampleEvidence({ title: 'Treasury Rates 2', relPath: '05_Data_Pulls/Macro/Treasury_2.md' }),
    ],
  });

  const html = renderPlotlyEventConnectionsHtml({ date: '2026-05-25', candidates });
  assert.match(html, /source_count/);
  assert.match(html, /evidence_count/);
  assert.match(html, /source_summary/);
  assert.match(html, /evidence_summary/);
  assert.doesNotMatch(html, /type:\s*'inbox_item'/);
  assert.doesNotMatch(html, /type:\s*'evidence'/);
  assert.doesNotMatch(html, /for \(const item of c\.source_items/);
  assert.doesNotMatch(html, /for \(const evidence of c\.evidence_links/);
});

await test('plotly network supports node relevance review and My_Data evidence links', () => {
  const candidates = buildConnectionCandidates({
    date: '2026-05-25',
    items: [sampleItem()],
    trends: [sampleTrend()],
    localEvidence: [sampleEvidence()],
  });

  const html = renderPlotlyEventConnectionsHtml({ date: '2026-05-25', candidates });
  assert.match(html, /node_reviews/);
  assert.match(html, /id="mark-not-relevant"/);
  assert.match(html, /id="mark-relevant"/);
  assert.match(html, /id="hide-not-relevant"/);
  assert.match(html, /renderSelectedNodeDetails/);
  assert.match(html, /My_Data Evidence/);
  assert.match(html, /obsidian:\/\/open\?vault=My_Data/);
  assert.match(html, /05_Data_Pulls%2FMacro%2F2026-05-25_Treasury_Rates\.md/);
});

async function test(name, fn) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}
