import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  buildDeepDiveQueue,
  buildGapAudit,
  buildSignalIntelligenceNote,
  buildStrategyCards,
  loadLatestSignalIntelligence,
  maxSignalStatus,
  renderCanonicalDeepDiveBlock,
  renderCanonicalSignalBlock,
  findCardForName,
} from '../lib/signal-intelligence.mjs';

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

await runTest('maxSignalStatus returns the highest operator attention status', () => {
  assert.equal(maxSignalStatus(['clear', 'watch', 'alert']), 'alert');
  assert.equal(maxSignalStatus(['clear', 'critical', 'watch']), 'critical');
  assert.equal(maxSignalStatus(['unknown', '', null]), 'clear');
});

await runTest('buildDeepDiveQueue selects research and news artifacts with study questions', () => {
  const queue = buildDeepDiveQueue({
    name: 'Rates Funding',
    terms: ['rates', 'funding', 'basis'],
    artifacts: [
      artifact('Research', 'Semantic Scholar Rates Funding Basis', 'semantic_scholar_papers', 'watch'),
      artifact('News', 'Funding stress news cluster', 'gdelt_news_monitor', 'alert'),
      artifact('Market', 'Unrelated technical snapshot', 'technical_snapshot', 'clear'),
    ],
    references: ['[[Repo Funding Stress]]'],
    maxItems: 3,
  });

  assert.equal(queue.length, 3);
  assert.equal(queue[0].source_type, 'research');
  assert.ok(queue[0].questions.length >= 2);
  assert.match(queue[0].why_it_matters, /Rates Funding/i);
});

await runTest('buildStrategyCards flags stale or missing strategy evidence', () => {
  const cards = buildStrategyCards({
    strategies: [{
      id: 'quality_compounders',
      name: 'Quality Compounders',
      status: 'live-candidate',
      signal_set: ['ROIC trend', 'FCF conversion'],
      data_requirements: ['fmp.fundamentals', 'sec.filings'],
      regime_fit: ['risk-on'],
      regime_unfit: ['credit-stress'],
      mechanisms: ['post_earnings_drift'],
      references: ['Curriculum'],
    }],
    artifacts: [artifact('Research', 'Quality compounders research note', 'semantic_scholar_papers', 'clear')],
    cycleCards: [{ name: 'Credit Stress', signal_status: 'alert', direction: 'risk' }],
    date: '2026-05-07',
  });

  assert.equal(cards.length, 1);
  assert.equal(cards[0].scope, 'strategy');
  assert.equal(cards[0].signal_status, 'watch');
  assert.ok(cards[0].risks.some(item => /coverage|regime|missing/i.test(item)));
});

await runTest('buildStrategyCards ignores provider-only strategy evidence matches', () => {
  const cards = buildStrategyCards({
    strategies: [{
      id: 'quality_compounders',
      name: 'Quality Compounders',
      status: 'live-candidate',
      signal_set: ['ROIC trend', 'FCF conversion'],
      data_requirements: ['fmp.fundamentals', 'sec.filings'],
      regime_fit: ['risk-on'],
      regime_unfit: [],
      mechanisms: ['post_earnings_drift'],
      references: ['Curriculum'],
    }],
    artifacts: [
      artifact('Market', 'FMP Thesis Watchlist - Humanoid Robotics', 'watchlist_report', 'alert'),
      artifact('News', 'News: health', 'news', 'alert'),
    ],
    cycleCards: [],
    date: '2026-05-07',
  });

  assert.equal(cards.length, 1);
  assert.equal(cards[0].signal_status, 'watch');
  assert.equal(cards[0].evidence_links.length, 0);
  assert.ok(cards[0].risks.some(item => /Missing or stale data coverage/i.test(item)));
});

await runTest('buildGapAudit reports missing related strategies and data gaps', () => {
  const gaps = buildGapAudit({
    strategies: [{ id: 'quality_compounders', name: 'Quality Compounders' }],
    theses: [{ name: 'Housing Supply Correction', note: { data: { status: 'Active' } }, symbols: ['DHI'] }],
    mechanisms: [{
      id: 'repo_stress',
      name: 'Repo Funding Stress',
      related_strategies: ['funding_stress_monitor'],
      signals_to_watch: [{ signal: 'SOFR rate', data_source: 'fred' }],
    }],
    cards: [{
      scope: 'thesis',
      name: 'Housing Supply Correction',
      signal_status: 'watch',
      evidence_links: [],
    }],
    artifacts: [],
    cycleStatusNotes: [],
  });

  assert.ok(gaps.some(gap => gap.scope === 'strategy' && gap.name === 'funding_stress_monitor'));
  assert.ok(gaps.some(gap => gap.scope === 'thesis' && gap.name === 'Housing Supply Correction'));
  assert.ok(gaps.some(gap => gap.scope === 'market-cycle' && gap.name === 'Repo Funding Stress'));
});

await runTest('buildSignalIntelligenceNote renders canonical sections', () => {
  const note = buildSignalIntelligenceNote(samplePayload());

  assert.match(note, /## Signal Summary/);
  assert.match(note, /## Missing Signals And Data Gaps/);
  assert.match(note, /Quality Compounders/);
});

await runTest('render helpers show cards, deep dives, and fallback text', () => {
  const payload = samplePayload();
  const signalBlock = renderCanonicalSignalBlock(payload, { limit: 2 });
  const diveBlock = renderCanonicalDeepDiveBlock(payload, { limit: 2 });
  const thesisCard = findCardForName(payload, 'thesis', 'Housing Supply Correction');

  assert.match(signalBlock, /Quality Compounders/);
  assert.match(signalBlock, /Refresh FMP fundamentals/);
  assert.match(diveBlock, /Quality compounding durability/);
  assert.match(renderCanonicalSignalBlock(null), /No canonical signal intelligence artifact found/);
  assert.equal(thesisCard.name, 'Housing Supply Correction');
});

await runTest('renderCanonicalSignalBlock tolerates missing sidecar', async () => {
  const root = await makeTempDir('signal-intelligence-empty-');
  try {
    const loaded = await loadLatestSignalIntelligence(root);
    assert.equal(loaded, null);
    assert.match(renderCanonicalSignalBlock(null), /No canonical signal intelligence artifact found/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

await runTest('puller dry-run returns markdown without writing signal sidecar', async () => {
  const { pull } = await import('../pullers/signal-intelligence.mjs');
  const root = await makeTempDir('signal-intelligence-dry-run-');
  const outputRoot = await makeTempDir('signal-intelligence-output-dry-run-');
  const previousCacheRoot = process.env.SIGNAL_INTELLIGENCE_CACHE_ROOT;
  const previousOutputRoot = process.env.SIGNAL_INTELLIGENCE_OUTPUT_ROOT;

  try {
    process.env.SIGNAL_INTELLIGENCE_CACHE_ROOT = root;
    process.env.SIGNAL_INTELLIGENCE_OUTPUT_ROOT = outputRoot;
    const result = await pull({ 'dry-run': true, scope: 'strategy' });

    assert.equal(result.dryRun, true);
    assert.equal(result.filePath, null);
    assert.equal(result.sidecarPath, null);
    assert.ok(Array.isArray(result.cards));
    assert.match(result.markdown, /Signal Summary/);
    assert.equal(existsSync(join(root, '2026-05-07.json')), false);
  } finally {
    restoreEnv('SIGNAL_INTELLIGENCE_CACHE_ROOT', previousCacheRoot);
    restoreEnv('SIGNAL_INTELLIGENCE_OUTPUT_ROOT', previousOutputRoot);
    await rm(root, { recursive: true, force: true });
    await rm(outputRoot, { recursive: true, force: true });
  }
});

await runTest('puller write mode emits signal sidecar', async () => {
  const { pull } = await import('../pullers/signal-intelligence.mjs');
  const root = await makeTempDir('signal-intelligence-write-');
  const outputRoot = await makeTempDir('signal-intelligence-output-write-');
  const previousCacheRoot = process.env.SIGNAL_INTELLIGENCE_CACHE_ROOT;
  const previousOutputRoot = process.env.SIGNAL_INTELLIGENCE_OUTPUT_ROOT;

  try {
    process.env.SIGNAL_INTELLIGENCE_CACHE_ROOT = root;
    process.env.SIGNAL_INTELLIGENCE_OUTPUT_ROOT = outputRoot;
    const result = await pull({ scope: 'strategy' });

    assert.equal(result.dryRun, false);
    assert.ok(result.filePath);
    assert.ok(result.sidecarPath);
    assert.equal(existsSync(result.sidecarPath), true);
    assert.equal(existsSync(result.filePath), true);
  } finally {
    restoreEnv('SIGNAL_INTELLIGENCE_CACHE_ROOT', previousCacheRoot);
    restoreEnv('SIGNAL_INTELLIGENCE_OUTPUT_ROOT', previousOutputRoot);
    await rm(root, { recursive: true, force: true });
    await rm(outputRoot, { recursive: true, force: true });
  }
});

function samplePayload() {
  return {
    date: '2026-05-07',
    signal_status: 'watch',
    cards: [
      {
        id: 'strategy:quality-compounders:2026-05-07',
        scope: 'strategy',
        name: 'Quality Compounders',
        signal_status: 'watch',
        direction: 'mixed',
        confidence: 'Medium',
        summary: 'Quality evidence exists but coverage is incomplete.',
        drivers: ['Research support exists.'],
        risks: ['Fundamental data is missing.'],
        evidence_links: [],
        deep_dive_queue: [{
          topic: 'Quality compounding durability',
          why_it_matters: 'Quality Compounders depends on durable reinvestment.',
          source_type: 'research',
          links: ['05_Data_Pulls/Research/2026-05-07_Quality.md'],
          questions: ['What would prove durability?', 'What would break the reinvestment story?'],
          next_action: 'Read the linked research note.',
        }],
        recommended_next_action: 'Refresh FMP fundamentals.',
      },
      {
        id: 'thesis:housing-supply-correction:2026-05-07',
        scope: 'thesis',
        name: 'Housing Supply Correction',
        signal_status: 'clear',
        direction: 'mixed',
        confidence: 'Low',
        summary: 'No strong thesis change found.',
        drivers: [],
        risks: [],
        evidence_links: [],
        deep_dive_queue: [],
        recommended_next_action: 'Maintain monitoring.',
      },
    ],
    deep_dive_queue: [{
      topic: 'Quality compounding durability',
      why_it_matters: 'Quality Compounders depends on durable reinvestment.',
      source_type: 'research',
      links: ['05_Data_Pulls/Research/2026-05-07_Quality.md'],
      questions: ['What would prove durability?', 'What would break the reinvestment story?'],
      next_action: 'Read the linked research note.',
    }],
    gap_audit: [{
      scope: 'strategy',
      name: 'funding_stress_monitor',
      gap_type: 'missing_strategy_candidate',
      severity: 'watch',
      evidence: ['Referenced by Repo Funding Stress.'],
      recommended_next_action: 'Review whether this belongs in strategy-catalog.json.',
    }],
    source_counts: { artifacts: 3, strategies: 1, theses: 1, mechanisms: 1 },
  };
}

function artifact(domain, title, dataType, signalStatus) {
  return {
    path: `C:/vault/05_Data_Pulls/${domain}/2026-05-07_${title.replace(/[^A-Za-z0-9]+/g, '_')}.md`,
    filename: `2026-05-07_${title.replace(/[^A-Za-z0-9]+/g, '_')}.md`,
    pullDomain: domain,
    date: '2026-05-07',
    data: {
      title,
      domain: domain.toLowerCase(),
      data_type: dataType,
      signal_status: signalStatus,
      date_pulled: '2026-05-07',
    },
    content: title,
  };
}

async function makeTempDir(prefix) {
  const dir = join(tmpdir(), `${prefix}${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  assert.equal(existsSync(dir), true);
  return dir;
}

function restoreEnv(key, value) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}
