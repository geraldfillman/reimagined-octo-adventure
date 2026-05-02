/**
 * agent-analyst.mjs - Parallel no-LangChain market analyst puller.
 *
 * Usage:
 *   node run.mjs pull agent-analyst --symbol SPY --skip-llm
 *   node run.mjs pull agent-analyst --symbol AAPL --agents price,risk
 *   node run.mjs pull agent-analyst --thesis "Housing Supply Correction" --limit 5
 *   node run.mjs pull agent-analyst --strategy "Simons Style Quant Momentum Breadth" --limit 5
 */

import { join } from 'node:path';
import { getPullsDir } from '../lib/config.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';
import { setProperties } from '../lib/obsidian-cli.mjs';
import { loadThesisWatchlists, normalizeSymbol } from '../lib/thesis-watchlists.mjs';
import { DEFAULT_AGENT_NAMES, resolveAgentNames, runAgentsInParallel } from '../agents/marketmind/index.mjs';
import { buildSignalNames, synthesizeDeterministic } from '../agents/marketmind/scoring.mjs';
import { synthesizeWithLlm } from '../agents/marketmind/synthesis-agent.mjs';
import { filePathToWikiLink, safeJson, slugify } from '../agents/marketmind/utils.mjs';

const DEFAULT_BATCH_LIMIT = 8;

export async function pull(flags = {}) {
  const agentNames = resolveAgentNames(flags.agents);
  const assetType = String(flags.asset || flags['asset-type'] || 'stock').toLowerCase();

  if (flags.thesis || flags['all-thesis'] || flags.strategy || flags['all-strategies']) {
    return pullThesisBatch({ flags, agentNames, assetType });
  }

  const symbol = normalizeSymbol(flags.symbol || flags.ticker);
  if (!symbol) {
    // No flags → daily default: lightweight all-thesis rollup (no LLM, limit 5)
    return pullThesisBatch({ flags: { ...flags, 'all-thesis': true, 'skip-llm': true, limit: flags.limit ?? 5 }, agentNames, assetType });
  }

  const result = await analyzeSymbol({
    symbol,
    assetType,
    agentNames,
    flags,
    relatedTheses: [],
  });

  if (flags.json) console.log(JSON.stringify(result, null, 2));
  return result;
}

async function pullThesisBatch({ flags, agentNames, assetType }) {
  const strategyMode = Boolean(flags.strategy || flags['all-strategies']);
  const thesisFilter = strategyMode
    ? (flags.strategy ? String(flags.strategy) : '')
    : (flags.thesis ? String(flags.thesis) : '');
  const scopeLabel = strategyMode ? 'strategy' : 'thesis';
  const watchlists = await loadThesisWatchlists({
    includeBaskets: Boolean(flags['include-baskets'] || strategyMode),
    thesisFilter,
    strategyOnly: strategyMode,
  });

  if (!watchlists.length) {
    throw new Error(`No ${scopeLabel} watchlists matched "${thesisFilter || `all ${scopeLabel}s`}".`);
  }

  const limit = Math.max(1, Number(flags.limit) || DEFAULT_BATCH_LIMIT);
  const concurrency = Math.max(1, Number(flags.concurrency) || 2);
  const targets = [];

  for (const watchlist of watchlists) {
    for (const symbol of watchlist.symbols) {
      targets.push({ symbol, watchlist });
    }
  }

  const uniqueTargets = dedupeTargets(targets).slice(0, limit);
  console.log(`Agent Analyst: ${uniqueTargets.length} symbol(s), ${agentNames.join(', ')} agent(s), ${scopeLabel} scope.`);

  const results = await mapWithConcurrency(uniqueTargets, concurrency, async target => analyzeSymbol({
    symbol: target.symbol,
    assetType,
    agentNames,
    flags,
    relatedTheses: [target.watchlist.name],
    thesisName: target.watchlist.name,
    thesisNote: target.watchlist.note,
  }));

  const rollup = buildRollupNote({ results, watchlists, flags, agentNames, scopeLabel });
  const rollupName = resolveRollupName({ thesisFilter, strategyMode });
  const rollupPath = join(getPullsDir(), 'Theses', dateStampedFilename(rollupName));

  if (flags['dry-run']) {
    console.log(rollup);
  } else {
    writeNote(rollupPath, rollup);
    setProperties(rollupPath, { signal_status: summarizeBatchStatus(results), date_pulled: today() });
    console.log(`Wrote: ${rollupPath}`);
  }

  const output = { filePath: flags['dry-run'] ? null : rollupPath, results };
  if (flags.json) console.log(JSON.stringify(output, null, 2));
  return output;
}

async function analyzeSymbol({ symbol, assetType, agentNames, flags, relatedTheses, thesisName = null, thesisNote = null }) {
  console.log(`Agent Analyst: analyzing ${symbol} with ${agentNames.join(', ')}...`);
  const state = {
    symbol,
    asset_type: assetType,
    thesis_name: thesisName,
    thesis_keywords: thesisNote ? collectThesisKeywords(thesisNote.data) : [],
    related_theses: relatedTheses,
    prediction_query: flags['prediction-query'] || flags.query || thesisName || symbol,
    prediction_market_limit: Number(flags['prediction-limit'] || 10),
    live_prediction_markets: Boolean(flags['live-prediction-markets']),
    skip_llm: Boolean(flags['skip-llm']),
  };

  const agentSignals = await runAgentsInParallel(state, agentNames);
  const deterministic = synthesizeDeterministic(agentSignals);
  const synthesis = await resolveSynthesis({ state, agentSignals, deterministic });
  const signals = buildSignalNames(agentSignals);
  const note = buildAgentAnalysisNote({ state, agentSignals, synthesis, signals, agentNames });

  if (flags['dry-run']) {
    console.log(note);
    return { filePath: null, symbol, synthesis, agentSignals };
  }

  const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`Agent_Analysis_${symbol}`));
  writeNote(filePath, note);
  setProperties(filePath, { signal_status: synthesis.signal_status, date_pulled: today() });
  console.log(`Wrote: ${filePath}`);
  return { filePath, symbol, synthesis, agentSignals };
}

function buildAgentAnalysisNote({ state, agentSignals, synthesis, signals, agentNames }) {
  const microstructureEntropy = extractMicrostructureEntropy(agentSignals);
  const rows = agentSignals.map(signal => [
    signal.agent,
    signal.signal,
    `${Math.round(signal.confidence * 100)}%`,
    `${signal.duration_ms}ms`,
    signal.summary,
  ]);

  const detailSections = agentSignals.map(signal => ({
    heading: `${titleCase(signal.agent)} Agent`,
    content: [
      `- **Signal**: ${signal.signal}`,
      `- **Confidence**: ${Math.round(signal.confidence * 100)}%`,
      `- **Summary**: ${signal.summary || 'N/A'}`,
      ...(signal.evidence?.length ? ['- **Evidence**:', ...signal.evidence.map(item => `  - ${item}`)] : []),
      ...(signal.warnings?.length ? ['- **Warnings**:', ...signal.warnings.map(item => `  - ${item}`)] : []),
      '',
      '```json',
      safeJson(signal.raw_data),
      '```',
    ].join('\n'),
  }));

  return buildNote({
    frontmatter: {
      title: `${state.symbol} Agent Analysis`,
      source: 'Agent Analyst',
      agent_owner: 'Market Agent',
      agent_scope: 'pull',
      symbol: state.symbol,
      asset_type: state.asset_type,
      thesis_name: state.thesis_name,
      related_theses: (state.related_theses || []).map(name => `[[${name}]]`),
      date_pulled: today(),
      domain: 'market',
      data_type: 'agent_analysis',
      frequency: 'on-demand',
      signal_status: synthesis.signal_status,
      signals,
      final_verdict: synthesis.final_verdict,
      final_confidence: synthesis.final_confidence,
      synthesis_mode: synthesis.synthesis_mode || 'deterministic',
      entropy_level: synthesis.entropy_level,
      entropy_score: synthesis.entropy_score,
      entropy_dominant_signal: synthesis.entropy_dominant_signal,
      microstructure_entropy_level: microstructureEntropy.level,
      microstructure_entropy_score: microstructureEntropy.score,
      agent_count: agentSignals.length,
      failed_agent_count: agentSignals.filter(signal => signal.confidence === 0 && signal.warnings?.length).length,
      agent_names: agentNames,
      tags: ['agent-analysis', 'market', state.symbol.toLowerCase()],
    },
    sections: [
      {
        heading: 'Verdict',
        content: [
          `- **Final verdict**: ${synthesis.final_verdict}`,
          `- **Final confidence**: ${Math.round(synthesis.final_confidence * 100)}%`,
          `- **Attention status**: ${synthesis.signal_status}`,
          `- **Synthesis mode**: ${synthesis.synthesis_mode || 'deterministic'}`,
          `- **Reasoning**: ${synthesis.reasoning}`,
          `- **Top drivers**: ${synthesis.top_drivers.join(', ') || 'N/A'}`,
          `- **Top risks**: ${synthesis.top_risks.join(', ') || 'N/A'}`,
        ].join('\n'),
      },
      {
        heading: 'Entropy Levels',
        content: [
          `- **Orchestrator entropy**: ${formatEntropy(synthesis.entropy_level, synthesis.entropy_score)}`,
          `- **Dominant signal bucket**: ${synthesis.entropy_dominant_signal || 'N/A'}`,
          `- **Distribution**: ${formatEntropyDistribution(synthesis.entropy_distribution)}`,
          `- **Interpretation**: ${synthesis.entropy_interpretation || 'N/A'}`,
          `- **Microstructure entropy**: ${formatEntropy(microstructureEntropy.level, microstructureEntropy.score)}`,
          `- **Microstructure read**: ${microstructureEntropy.read || 'N/A'}`,
          '- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.',
        ].join('\n'),
      },
      {
        heading: 'Agent Signal Matrix',
        content: buildTable(['Agent', 'Signal', 'Confidence', 'Runtime', 'Summary'], rows),
      },
      {
        heading: 'Follow Up Actions',
        content: synthesis.follow_up_actions.map(item => `- ${item}`).join('\n'),
      },
      ...detailSections,
      {
        heading: 'Source',
        content: [
          '- **System**: native vault agent puller, no LangChain',
          `- **Agents requested**: ${agentNames.join(', ')}`,
          `- **Prediction markets live API enabled**: ${Boolean(state.live_prediction_markets)}`,
          `- **LLM provider**: ${synthesis.llm_provider || 'none'}`,
          `- **Auto-pulled**: ${today()}`,
        ].join('\n'),
      },
    ],
  });
}

async function resolveSynthesis({ state, agentSignals, deterministic }) {
  if (state.skip_llm) {
    return { ...deterministic, synthesis_mode: 'deterministic' };
  }

  try {
    const llm = await synthesizeWithLlm({ state, agentSignals, deterministic });
    if (llm) return { ...extractSynthesisDiagnostics(deterministic), ...llm, synthesis_mode: 'llm' };
  } catch (error) {
    return {
      ...deterministic,
      synthesis_mode: 'deterministic',
      reasoning: `${deterministic.reasoning} LLM synthesis failed and deterministic fallback was used: ${error.message}`,
    };
  }

  return { ...deterministic, synthesis_mode: 'deterministic' };
}

function buildRollupNote({ results, watchlists, flags, agentNames, scopeLabel = 'thesis' }) {
  const rows = results.map(result => [
    result.symbol,
    result.synthesis.final_verdict,
    `${Math.round(result.synthesis.final_confidence * 100)}%`,
    formatEntropy(result.synthesis.entropy_level, result.synthesis.entropy_score),
    result.synthesis.signal_status,
    result.filePath ? filePathToWikiLink(result.filePath) : 'dry-run',
  ]);
  const status = summarizeBatchStatus(results);
  const title = scopeLabel === 'strategy' ? 'Agent Analysis Strategy Rollup' : 'Agent Analysis Thesis Rollup';
  const matchedLabel = scopeLabel === 'strategy' ? 'Strategies' : 'Theses';

  return buildNote({
    frontmatter: {
      title,
      source: 'Agent Analyst',
      agent_owner: scopeLabel === 'strategy' ? 'Research Agent' : 'Thesis Agent',
      agent_scope: 'pull',
      analysis_scope: scopeLabel,
      date_pulled: today(),
      domain: 'market',
      data_type: 'agent_analysis_rollup',
      frequency: 'on-demand',
      signal_status: status,
      signals: results.flatMap(result => buildSignalNames(result.agentSignals)),
      thesis_filter: flags.thesis || null,
      strategy_filter: flags.strategy || null,
      thesis_count: watchlists.length,
      symbol_count: results.length,
      agent_names: agentNames,
      entropy_levels: [...new Set(results.map(result => result.synthesis.entropy_level).filter(Boolean))],
      tags: ['agent-analysis', `${scopeLabel}-rollup`, 'market'],
    },
    sections: [
      {
        heading: 'Rollup',
        content: buildTable(['Symbol', 'Verdict', 'Confidence', 'Entropy', 'Status', 'Note'], rows),
      },
      {
        heading: 'Source',
        content: [
          '- **System**: native vault agent puller, no LangChain',
          `- **${matchedLabel} matched**: ${watchlists.map(w => w.name).join(', ')}`,
          `- **Auto-pulled**: ${today()}`,
        ].join('\n'),
      },
    ],
  });
}

function summarizeBatchStatus(results) {
  const rank = { clear: 0, watch: 1, alert: 2, critical: 3 };
  const worst = results.reduce((max, result) => Math.max(max, rank[result.synthesis.signal_status] ?? 0), 0);
  return Object.entries(rank).find(([, value]) => value === worst)?.[0] || 'clear';
}

function collectThesisKeywords(data = {}) {
  return [
    data.name,
    ...(Array.isArray(data.core_entities) ? data.core_entities : []),
    ...(Array.isArray(data.supporting_regimes) ? data.supporting_regimes : []),
    ...(Array.isArray(data.invalidation_triggers) ? data.invalidation_triggers : []),
  ].filter(Boolean);
}

function resolveRollupName({ thesisFilter, strategyMode }) {
  if (strategyMode && thesisFilter) return `Agent_Analysis_Strategy_${slugify(thesisFilter)}`;
  if (strategyMode) return 'Agent_Analysis_All_Strategies';
  return thesisFilter ? `Agent_Analysis_${slugify(thesisFilter)}` : 'Agent_Analysis_All_Theses';
}

function extractSynthesisDiagnostics(deterministic = {}) {
  return {
    score: deterministic.score,
    disagreement: deterministic.disagreement,
    entropy_score: deterministic.entropy_score,
    entropy_level: deterministic.entropy_level,
    entropy_dominant_signal: deterministic.entropy_dominant_signal,
    entropy_distribution: deterministic.entropy_distribution,
    entropy_interpretation: deterministic.entropy_interpretation,
  };
}

function extractMicrostructureEntropy(agentSignals = []) {
  const signal = agentSignals.find(item => item?.agent === 'microstructure');
  const raw = signal?.raw_data || {};
  return {
    level: raw.order_flow_entropy_level || null,
    score: raw.order_flow_entropy_score ?? null,
    read: raw.order_flow_entropy_read || null,
  };
}

function formatEntropy(level, score) {
  if (!level || level === 'unknown' || score === null || score === undefined) return 'N/A';
  return `${level} (${score})`;
}

function formatEntropyDistribution(distribution = {}) {
  const keys = ['bullish', 'bearish', 'neutral'];
  const values = keys
    .filter(key => distribution[key] !== undefined)
    .map(key => `${key} ${Math.round(Number(distribution[key] || 0) * 100)}%`);
  return values.length ? values.join(', ') : 'N/A';
}

function dedupeTargets(targets) {
  const seen = new Set();
  const unique = [];
  for (const target of targets) {
    if (seen.has(target.symbol)) continue;
    seen.add(target.symbol);
    unique.push(target);
  }
  return unique;
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = [];
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await mapper(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

function titleCase(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}
