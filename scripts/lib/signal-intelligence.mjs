import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { getEngineCacheDir } from './config.mjs';
import { buildNote, buildTable, today } from './markdown.mjs';

const STATUS_RANK = Object.freeze({
  clear: 0,
  watch: 1,
  alert: 2,
  critical: 3,
});

const VALID_SCOPES = new Set(['all', 'strategy', 'thesis', 'market-cycle']);
const ACTIVE_THESIS_STATUSES = new Set(['active', 'watchlist', 'draft', '']);
const SIGNAL_SOURCE_DOMAINS = new Set([
  'research',
  'news',
  'sourcewatch',
  'theses',
  'market',
  'macro',
  'government',
  'sectors',
  'fundamentals',
  'biotech',
  'housing',
  'energy',
  'signals',
  'orchestrator',
]);

const STOPWORDS = new Set([
  'and',
  'or',
  'the',
  'for',
  'with',
  'from',
  'into',
  'over',
  'under',
  'api',
  'data',
  'pull',
  'note',
  'report',
  'scan',
  'snapshot',
  'status',
  'cycle',
  'market',
  'fmp',
  'fred',
  'sec',
  'gdelt',
  'news',
  'source',
  'sources',
  'semantic',
  'scholar',
  'paper',
  'papers',
  'watchlist',
  'puller',
  'vault',
  'agent',
  'analysis',
  'bullish',
  'bearish',
  'neutral',
]);

const PROVIDER_TOKENS = new Set([
  'fmp',
  'fred',
  'sec',
  'treasury',
  'semantic',
  'scholar',
  'newsapi',
  'gdelt',
  'yfinance',
  'pubmed',
  'arxiv',
  'bea',
  'eia',
  'fda',
  'uspto',
  'federalregister',
]);

const REQUIREMENT_ALIASES = new Map([
  ['fundamentals', ['fundamental', 'fundamentals', 'valuation', 'financials', 'quality']],
  ['fundamental', ['fundamental', 'fundamentals', 'valuation', 'financials', 'quality']],
  ['filings', ['filing', 'filings', 'edgar', 'disclosure', '10k', '10q']],
  ['filing', ['filing', 'filings', 'edgar', 'disclosure', '10k', '10q']],
  ['technicals', ['technical', 'technicals', 'rsi', 'moving', 'average', 'trend']],
  ['technical', ['technical', 'technicals', 'rsi', 'moving', 'average', 'trend']],
  ['quotes', ['quote', 'quotes', 'price', 'tape']],
  ['quote', ['quote', 'quotes', 'price', 'tape']],
  ['earnings', ['earnings', 'calendar', 'catalyst', 'guidance']],
  ['calendar', ['earnings', 'calendar', 'catalyst']],
  ['sentiment', ['sentiment', 'social', 'reddit']],
  ['ownership', ['ownership', 'holders', '13f', 'institutional']],
]);

export function maxSignalStatus(statuses = []) {
  return arrayFrom(statuses).reduce((best, status) => {
    const normalized = normalizeSignalStatus(status);
    return STATUS_RANK[normalized] > STATUS_RANK[best] ? normalized : best;
  }, 'clear');
}

export function buildDeepDiveQueue({
  name,
  terms,
  artifacts,
  references = [],
  maxItems = 3,
} = {}) {
  const termSet = tokensFrom([name, ...arrayFrom(terms)]);
  const minOverlap = termSet.size >= 5 ? 2 : 1;
  const scoredArtifacts = arrayFrom(artifacts)
    .map(artifact => ({ artifact, score: scoreArtifactForTerms(artifact, termSet, { minOverlap }) }))
    .filter(row => row.score > 0 && isDeepDiveArtifact(row.artifact))
    .sort((left, right) => right.score - left.score || sourceTypeRank(left.artifact) - sourceTypeRank(right.artifact))
    .map(row => deepDiveFromArtifact(name, row.artifact));

  const referenceDives = arrayFrom(references)
    .filter(Boolean)
    .map(reference => deepDiveFromReference(name, reference));

  return dedupeDeepDives([...scoredArtifacts, ...referenceDives]).slice(0, Math.max(0, Number(maxItems) || 0));
}

export function buildStrategyCards({
  strategies,
  artifacts,
  cycleCards = [],
  date = today(),
} = {}) {
  return arrayFrom(strategies).map(strategy => {
    const terms = strategyTerms(strategy);
    const matched = selectArtifacts(artifacts, terms, { limit: 8 });
    const evidenceLinks = matched.slice(0, 6).map(toEvidenceLink);
    const missingRequirements = missingDataRequirements(strategy, artifacts);
    const unfitRegime = findUnfitRegime(strategy, cycleCards);
    const evidenceStatus = maxSignalStatus(matched.map(artifactStatus));
    const status = maxSignalStatus([
      evidenceStatus,
      missingRequirements.length ? 'watch' : 'clear',
      unfitRegime ? 'watch' : 'clear',
    ]);
    const confidence = confidenceFromEvidence(evidenceLinks.length, missingRequirements.length, matched);
    const direction = unfitRegime ? 'risk' : status === 'clear' ? 'mixed' : 'mixed';
    const risks = [
      ...missingRequirements.slice(0, 3).map(req => `Missing or stale data coverage for ${req}.`),
      unfitRegime ? `Current cycle context conflicts with the strategy regime fit: ${unfitRegime.name}.` : null,
      evidenceLinks.length <= 1 ? 'Signal depends on thin evidence coverage.' : null,
    ].filter(Boolean);
    const drivers = [
      matched[0] ? `Latest matching evidence: ${artifactTitle(matched[0])}.` : 'No strong recent evidence matched this strategy.',
      strategy.evidence_gate ? `Evidence gate: ${strategy.evidence_gate}.` : null,
      arrayFrom(strategy.signal_set).length ? `Tracked signals: ${arrayFrom(strategy.signal_set).slice(0, 3).join(', ')}.` : null,
    ].filter(Boolean);

    return {
      id: `strategy:${slugify(strategy.id || strategy.name)}:${date}`,
      date,
      scope: 'strategy',
      name: String(strategy.name || strategy.id || 'Unknown Strategy'),
      signal_status: status,
      direction,
      confidence,
      summary: buildStrategySummary(strategy, status, missingRequirements, unfitRegime, matched),
      drivers,
      risks,
      evidence_links: evidenceLinks,
      deep_dive_queue: buildDeepDiveQueue({
        name: strategy.name || strategy.id,
        terms,
        artifacts,
        references: arrayFrom(strategy.references),
        maxItems: status === 'clear' ? 1 : 3,
      }),
      recommended_next_action: strategyNextAction(strategy, status, missingRequirements),
    };
  });
}

export function buildThesisCards({
  theses,
  artifacts,
  date = today(),
} = {}) {
  return arrayFrom(theses).map(thesis => {
    const terms = thesisTerms(thesis);
    const matched = selectArtifacts(artifacts, terms, { limit: 10 });
    const evidenceLinks = matched.slice(0, 7).map(toEvidenceLink);
    const missingInputs = missingThesisInputs(thesis, matched);
    const evidenceStatus = maxSignalStatus(matched.map(artifactStatus));
    const active = isActiveThesis(thesis);
    const status = maxSignalStatus([
      evidenceStatus,
      active && missingInputs.length ? 'watch' : 'clear',
    ]);
    const risks = [
      ...missingInputs.slice(0, 4).map(input => `Missing recent ${input} evidence.`),
      evidenceLinks.length <= 1 ? 'Thesis read depends on thin evidence coverage.' : null,
    ].filter(Boolean);
    const drivers = [
      matched[0] ? `Latest matching evidence: ${artifactTitle(matched[0])}.` : 'No strong recent thesis evidence matched.',
      thesis.note?.data?.monitor_status ? `Monitor status: ${thesis.note.data.monitor_status}.` : null,
      thesis.note?.data?.conviction ? `Conviction: ${thesis.note.data.conviction}.` : null,
    ].filter(Boolean);

    return {
      id: `thesis:${slugify(thesis.name)}:${date}`,
      date,
      scope: 'thesis',
      name: String(thesis.name || 'Unknown Thesis'),
      signal_status: status,
      direction: risks.length && drivers.length ? 'mixed' : risks.length ? 'risk' : 'confirming',
      confidence: confidenceFromEvidence(evidenceLinks.length, missingInputs.length, matched),
      summary: buildThesisSummary(thesis, status, missingInputs, matched),
      drivers,
      risks,
      evidence_links: evidenceLinks,
      deep_dive_queue: buildDeepDiveQueue({
        name: thesis.name,
        terms,
        artifacts,
        references: [
          ...arrayFrom(thesis.note?.data?.supporting_regimes),
          ...arrayFrom(thesis.note?.data?.key_indicators),
        ],
        maxItems: status === 'clear' ? 1 : 3,
      }),
      recommended_next_action: thesisNextAction(status, missingInputs),
    };
  });
}

export function buildMarketCycleCards({
  mechanisms,
  cycleStatusNotes = [],
  artifacts,
  date = today(),
} = {}) {
  return arrayFrom(mechanisms).map(mechanism => {
    const terms = mechanismTerms(mechanism);
    const cycleNote = selectArtifacts(cycleStatusNotes, terms, { limit: 1 })[0] || null;
    const matched = uniqueArtifacts([
      cycleNote,
      ...selectArtifacts(artifacts, terms, { limit: 8 }),
    ].filter(Boolean));
    const evidenceLinks = matched.slice(0, 6).map(toEvidenceLink);
    const coverageStatus = String(cycleNote?.data?.coverage_status || '').toLowerCase();
    const status = maxSignalStatus([
      cycleNote ? artifactStatus(cycleNote) : 'clear',
      coverageStatus === 'degraded' || coverageStatus === 'stale' || coverageStatus === 'partial' ? 'watch' : 'clear',
      maxSignalStatus(matched.map(artifactStatus)),
    ]);
    const risks = [
      !cycleNote ? 'No current market-cycle status note matched this mechanism.' : null,
      evidenceLinks.length <= 1 ? 'Cycle read depends on thin evidence coverage.' : null,
      coverageStatus ? `Cycle coverage status: ${coverageStatus}.` : null,
    ].filter(Boolean);
    const drivers = [
      cycleNote ? `Cycle status note: ${artifactTitle(cycleNote)}.` : null,
      matched[0] ? `Latest matching evidence: ${artifactTitle(matched[0])}.` : null,
      mechanism.feedback_loop ? `Feedback loop: ${mechanism.feedback_loop}` : null,
    ].filter(Boolean).slice(0, 4);

    return {
      id: `market-cycle:${slugify(mechanism.id || mechanism.name)}:${date}`,
      date,
      scope: 'market-cycle',
      name: String(mechanism.name || mechanism.id || 'Unknown Market Cycle'),
      signal_status: status,
      direction: status === 'clear' ? 'mixed' : 'risk',
      confidence: confidenceFromEvidence(evidenceLinks.length, risks.length, matched),
      summary: buildCycleSummary(mechanism, status, cycleNote, matched),
      drivers,
      risks,
      evidence_links: evidenceLinks,
      deep_dive_queue: buildDeepDiveQueue({
        name: mechanism.name || mechanism.id,
        terms,
        artifacts,
        references: arrayFrom(mechanism.references),
        maxItems: status === 'clear' ? 1 : 3,
      }),
      recommended_next_action: cycleNextAction(status, cycleNote),
    };
  });
}

export function buildGapAudit({
  strategies,
  theses,
  mechanisms,
  cards,
  artifacts,
  cycleStatusNotes = [],
} = {}) {
  const gaps = [];
  const strategyIds = new Set(arrayFrom(strategies).flatMap(strategy => [
    normalizeKey(strategy.id),
    normalizeKey(strategy.name),
  ]).filter(Boolean));

  for (const mechanism of arrayFrom(mechanisms)) {
    for (const related of arrayFrom(mechanism.related_strategies)) {
      if (!strategyIds.has(normalizeKey(related))) {
        gaps.push({
          scope: 'strategy',
          name: String(related),
          gap_type: 'missing_strategy_candidate',
          severity: 'watch',
          evidence: [`Referenced by ${mechanism.name || mechanism.id}.`],
          recommended_next_action: `Review whether ${related} belongs in scripts/config/strategy-catalog.json.`,
        });
      }
    }
  }

  for (const thesis of arrayFrom(theses).filter(isActiveThesis)) {
    const card = arrayFrom(cards).find(item => item.scope === 'thesis' && namesMatch(item.name, thesis.name));
    if (!card || arrayFrom(card.evidence_links).length === 0) {
      gaps.push({
        scope: 'thesis',
        name: String(thesis.name || 'Unknown Thesis'),
        gap_type: 'missing_thesis_signal_inputs',
        severity: 'watch',
        evidence: ['No canonical evidence links matched the active thesis.'],
        recommended_next_action: 'Run thesis full-picture, FMP watchlists, catalyst, research, and news pulls for this thesis.',
      });
    }
  }

  for (const mechanism of arrayFrom(mechanisms)) {
    const terms = mechanismTerms(mechanism);
    const cycleNote = selectArtifacts(cycleStatusNotes, terms, { limit: 1 })[0] || null;
    const evidence = selectArtifacts(artifacts, terms, { limit: 1 })[0] || null;
    if (!cycleNote && !evidence) {
      gaps.push({
        scope: 'market-cycle',
        name: String(mechanism.name || mechanism.id || 'Unknown Market Cycle'),
        gap_type: 'missing_market_cycle_input',
        severity: 'watch',
        evidence: [`No recent cycle-status note or pull artifact matched ${mechanism.name || mechanism.id}.`],
        recommended_next_action: 'Add or refresh the source pull that covers this mechanism and rerun market-cycle-monitor.',
      });
    }
  }

  for (const card of arrayFrom(cards)) {
    if (normalizeSignalStatus(card.signal_status) === 'clear') continue;
    if (arrayFrom(card.evidence_links).length <= 1) {
      gaps.push({
        scope: card.scope,
        name: card.name,
        gap_type: 'thin_active_signal_evidence',
        severity: 'watch',
        evidence: [`${card.name} is ${card.signal_status} with ${arrayFrom(card.evidence_links).length} evidence link(s).`],
        recommended_next_action: 'Find a second independent source before upgrading confidence.',
      });
    }
  }

  return dedupeGaps(gaps);
}

export function buildPayload({
  date = today(),
  scope = 'all',
  strategies = [],
  theses = [],
  mechanisms = [],
  artifacts = [],
  cycleStatusNotes = [],
} = {}) {
  const normalizedScope = VALID_SCOPES.has(String(scope)) ? String(scope) : 'all';
  const cycleCards = buildMarketCycleCards({ mechanisms, cycleStatusNotes, artifacts, date });
  const strategyCards = buildStrategyCards({ strategies, artifacts, cycleCards, date });
  const thesisCards = buildThesisCards({ theses, artifacts, date });
  const allCards = [...strategyCards, ...thesisCards, ...cycleCards];
  const cards = normalizedScope === 'all'
    ? allCards
    : allCards.filter(card => card.scope === normalizedScope);
  const gapAudit = buildGapAudit({ strategies, theses, mechanisms, cards: allCards, artifacts, cycleStatusNotes })
    .filter(gap => normalizedScope === 'all' || gap.scope === normalizedScope);
  const deepDiveQueue = dedupeDeepDives(cards.flatMap(card => arrayFrom(card.deep_dive_queue))).slice(0, 24);

  return {
    schema_version: 1,
    date,
    scope: normalizedScope,
    signal_status: maxSignalStatus(cards.map(card => card.signal_status)),
    cards,
    deep_dive_queue: deepDiveQueue,
    gap_audit: gapAudit,
    source_counts: {
      artifacts: artifacts.length,
      strategies: strategies.length,
      theses: theses.length,
      mechanisms: mechanisms.length,
      cycle_status_notes: cycleStatusNotes.length,
    },
  };
}

export function buildSignalIntelligenceNote(payload) {
  const cards = arrayFrom(payload?.cards);
  const gapAudit = arrayFrom(payload?.gap_audit);
  const deepDiveQueue = arrayFrom(payload?.deep_dive_queue);
  const date = payload?.date || today();

  return buildNote({
    frontmatter: {
      title: `Signal Intelligence ${date}`,
      source: 'Canonical Signal Intelligence',
      date_pulled: date,
      domain: 'signals',
      data_type: 'signal_intelligence',
      frequency: 'daily',
      signal_status: normalizeSignalStatus(payload?.signal_status),
      signal_card_count: cards.length,
      gap_count: gapAudit.length,
      deep_dive_count: deepDiveQueue.length,
      signals: cards
        .filter(card => normalizeSignalStatus(card.signal_status) !== 'clear')
        .slice(0, 24)
        .map(card => `${card.scope}:${slugify(card.name)}:${card.signal_status}`),
      tags: ['signal-intelligence', 'signals', 'strategy', 'thesis', 'market-cycle'],
    },
    sections: [
      {
        heading: 'Signal Summary',
        content: renderCanonicalSignalBlock(payload, { limit: 30 }),
      },
      {
        heading: 'Deeper Dive Queue',
        content: renderCanonicalDeepDiveBlock(payload, { limit: 18 }),
      },
      {
        heading: 'Missing Signals And Data Gaps',
        content: gapAudit.length
          ? buildTable(
              ['Scope', 'Name', 'Gap', 'Severity', 'Evidence', 'Next Action'],
              gapAudit.map(gap => [
                gap.scope,
                gap.name,
                gap.gap_type,
                gap.severity,
                arrayFrom(gap.evidence).join('; '),
                gap.recommended_next_action,
              ])
            )
          : '_No obvious signal or data gaps detected in the current local context._',
      },
      {
        heading: 'Source Coverage',
        content: buildTable(
          ['Input', 'Count'],
          Object.entries(payload?.source_counts || {}).map(([key, value]) => [key, String(value)])
        ),
      },
    ],
  });
}

export async function loadLatestSignalIntelligence(cacheRoot = getEngineCacheDir('signal-intelligence')) {
  if (!cacheRoot || !existsSync(cacheRoot)) return null;
  const files = (await readdir(cacheRoot))
    .filter(file => file.toLowerCase().endsWith('.json'))
    .sort()
    .reverse();
  if (!files.length) return null;

  for (const file of files) {
    try {
      return JSON.parse(await readFile(join(cacheRoot, file), 'utf-8'));
    } catch {
      continue;
    }
  }
  return null;
}

export function renderCanonicalSignalBlock(payload, options = {}) {
  if (!payload || !Array.isArray(payload.cards)) {
    return 'No canonical signal intelligence artifact found. Run `node run.mjs pull signal-intelligence`.';
  }
  const limit = Math.max(1, Number(options.limit) || 8);
  const cards = [...payload.cards]
    .sort(compareCards)
    .slice(0, limit);

  if (!cards.length) return '_No canonical signal cards matched this scope._';

  return buildTable(
    ['Scope', 'Signal', 'Status', 'Direction', 'Confidence', 'Summary', 'Next Action'],
    cards.map(card => [
      card.scope,
      card.name,
      card.signal_status,
      card.direction,
      card.confidence,
      card.summary,
      card.recommended_next_action,
    ])
  );
}

export function renderCanonicalDeepDiveBlock(payload, options = {}) {
  if (!payload) {
    return 'No canonical deeper-dive queue found. Run `node run.mjs pull signal-intelligence`.';
  }
  const limit = Math.max(1, Number(options.limit) || 5);
  const queue = arrayFrom(payload.deep_dive_queue)
    .concat(arrayFrom(payload.cards).flatMap(card => arrayFrom(card.deep_dive_queue)))
    .filter(Boolean);
  const dives = dedupeDeepDives(queue).slice(0, limit);

  if (!dives.length) return '_No deeper-dive items were generated for the current signal set._';

  return buildTable(
    ['Topic', 'Source', 'Why It Matters', 'Questions', 'Next Action', 'Links'],
    dives.map(item => [
      item.topic,
      item.source_type,
      item.why_it_matters,
      arrayFrom(item.questions).join('; '),
      item.next_action,
      arrayFrom(item.links).join(', '),
    ])
  );
}

export function findCardForName(payload, scope, name) {
  const normalizedScope = String(scope || '').toLowerCase();
  return arrayFrom(payload?.cards).find(card => (
    String(card.scope || '').toLowerCase() === normalizedScope &&
    namesMatch(card.name, name)
  )) || null;
}

function buildStrategySummary(strategy, status, missingRequirements, unfitRegime, matched) {
  if (status === 'clear') {
    return `${strategy.name} has no non-clear canonical signal in the current local evidence set.`;
  }
  const parts = [];
  if (matched.length) parts.push(`${strategy.name} has ${matched.length} matching evidence item(s).`);
  if (missingRequirements.length) parts.push(`Data coverage is incomplete for ${missingRequirements.slice(0, 3).join(', ')}.`);
  if (unfitRegime) parts.push(`Current cycle context is unfavorable: ${unfitRegime.name}.`);
  return parts.join(' ') || `${strategy.name} is active for review.`;
}

function buildThesisSummary(thesis, status, missingInputs, matched) {
  if (status === 'clear') {
    return `${thesis.name} has no non-clear canonical thesis signal in the current local evidence set.`;
  }
  const parts = [];
  if (matched.length) parts.push(`${thesis.name} has ${matched.length} matching evidence item(s).`);
  if (missingInputs.length) parts.push(`Missing inputs: ${missingInputs.slice(0, 4).join(', ')}.`);
  return parts.join(' ') || `${thesis.name} needs thesis-level review.`;
}

function buildCycleSummary(mechanism, status, cycleNote, matched) {
  if (status === 'clear') {
    return `${mechanism.name} is not flashing a non-clear canonical cycle signal in the current local evidence set.`;
  }
  if (cycleNote) {
    return `${mechanism.name} is informed by the latest cycle-status note and ${Math.max(0, matched.length - 1)} matching artifact(s).`;
  }
  return `${mechanism.name} has matching evidence but no current cycle-status note.`;
}

function strategyNextAction(strategy, status, missingRequirements) {
  if (missingRequirements.length) {
    return `Refresh ${missingRequirements[0]} coverage before upgrading ${strategy.name}.`;
  }
  if (status === 'clear') return `Maintain ${strategy.name} monitoring cadence.`;
  return `Review ${strategy.name} evidence gate and confirm a second source before action.`;
}

function thesisNextAction(status, missingInputs) {
  if (missingInputs.length) return `Refresh ${missingInputs[0]} evidence before changing conviction.`;
  if (status === 'clear') return 'Maintain thesis monitoring cadence.';
  return 'Review supporting and contradicting evidence before any conviction change.';
}

function cycleNextAction(status, cycleNote) {
  if (!cycleNote) return 'Run market-cycle-monitor and refresh the missing source pull for this mechanism.';
  if (status === 'clear') return 'Maintain cycle monitoring cadence.';
  return 'Map the feedback loop, trigger, and fade condition before changing risk posture.';
}

function missingDataRequirements(strategy, artifacts) {
  return arrayFrom(strategy.data_requirements).filter(requirement => {
    return !arrayFrom(artifacts).some(artifact => artifactCoversRequirement(requirement, artifact));
  });
}

function missingThesisInputs(thesis, matched) {
  const missing = [];
  const hasType = predicate => matched.some(artifact => predicate(String(artifactDataType(artifact)).toLowerCase(), artifact));
  if (!hasType(type => type === 'full_picture_report')) missing.push('full-picture');
  if (!hasType(type => type === 'watchlist_report')) missing.push('watchlist');
  if (!hasType(type => type === 'catalyst_note' || type.includes('calendar'))) missing.push('catalyst');
  if (!hasType((type, artifact) => type.includes('time_series') || artifactDomain(artifact) === 'macro')) missing.push('macro');
  if (!hasType((type, artifact) => artifactDomain(artifact) === 'research' || artifactDomain(artifact) === 'news')) missing.push('research/news');
  if (!arrayFrom(thesis.symbols).length) missing.push('watchlist symbols');
  return missing;
}

function findUnfitRegime(strategy, cycleCards) {
  const unfitTokens = tokensFrom(arrayFrom(strategy.regime_unfit));
  if (!unfitTokens.size) return null;
  return arrayFrom(cycleCards).find(card => (
    normalizeSignalStatus(card.signal_status) !== 'clear' &&
    tokenOverlap(unfitTokens, tokensFrom([card.name, card.summary, card.direction])) >= Math.min(2, unfitTokens.size)
  )) || null;
}

function selectArtifacts(artifacts, terms, options = {}) {
  const limit = Math.max(1, Number(options.limit) || 8);
  const minOverlap = Math.max(1, Number(options.minOverlap) || 2);
  const termSet = tokensFrom(terms);
  return arrayFrom(artifacts)
    .map(artifact => ({ artifact, score: scoreArtifactForTerms(artifact, termSet, { minOverlap }) }))
    .filter(row => row.score > 0 && SIGNAL_SOURCE_DOMAINS.has(artifactDomain(row.artifact)))
    .sort((left, right) => (
      right.score - left.score ||
      STATUS_RANK[artifactStatus(right.artifact)] - STATUS_RANK[artifactStatus(left.artifact)] ||
      String(artifactDate(right.artifact)).localeCompare(String(artifactDate(left.artifact)))
    ))
    .map(row => row.artifact)
    .slice(0, limit);
}

function scoreArtifactForTerms(artifact, termSet, options = {}) {
  if (!termSet.size) return 0;
  const minOverlap = Math.max(1, Number(options.minOverlap) || 1);
  const artifactTokens = artifactSearchTokens(artifact);
  const overlap = tokenOverlap(termSet, artifactTokens);
  if (overlap < Math.min(minOverlap, termSet.size)) return 0;
  return overlap + STATUS_RANK[artifactStatus(artifact)] + sourceTypeRank(artifact);
}

function artifactCoversRequirement(requirement, artifact) {
  const reqTokens = requirementCoreTokens(requirement);
  if (!reqTokens.size) return false;
  const artifactTokens = artifactSearchTokens(artifact);
  for (const token of reqTokens) {
    const aliases = REQUIREMENT_ALIASES.get(token) || [token];
    if (aliases.some(alias => artifactTokens.has(alias))) return true;
  }
  return false;
}

function requirementCoreTokens(requirement) {
  return new Set([...tokensFrom([requirement])]
    .filter(token => !PROVIDER_TOKENS.has(token)));
}

function artifactSearchTokens(artifact, options = {}) {
  const values = [
    artifactTitle(artifact),
    artifactDataType(artifact),
    artifactDomain(artifact),
    artifact?.path,
    arrayFrom(artifact?.data?.tags).join(' '),
    artifact?.data?.thesis,
    artifact?.data?.thesis_name,
    artifact?.data?.strategy,
    artifact?.data?.strategy_family,
    artifact?.data?.symbol,
    artifact?.data?.ticker,
  ];
  if (options.includeContent) {
    values.push(artifact?.content?.slice?.(0, 800) || '');
  }
  return tokensFrom(values);
}

function tokenOverlap(left, right) {
  let count = 0;
  for (const token of left) {
    if (right.has(token)) count += 1;
  }
  return count;
}

function strategyTerms(strategy) {
  return [
    strategy.id,
    strategy.name,
    ...arrayFrom(strategy.signal_set),
    ...arrayFrom(strategy.mechanisms),
    ...arrayFrom(strategy.tags),
  ];
}

function thesisTerms(thesis) {
  const data = thesis.note?.data || {};
  return [
    thesis.name,
    ...arrayFrom(thesis.symbols),
    data.title,
    data.monitor_status,
    data.conviction,
    data.why_now,
    data.variant_perception,
    ...arrayFrom(data.core_entities),
    ...arrayFrom(data.key_indicators),
    ...arrayFrom(data.supporting_regimes),
    ...arrayFrom(data.tags),
  ];
}

function mechanismTerms(mechanism) {
  return [
    mechanism.id,
    mechanism.name,
    mechanism.category,
    mechanism.summary,
    mechanism.feedback_loop,
    ...arrayFrom(mechanism.regime),
    ...arrayFrom(mechanism.regimes),
    ...arrayFrom(mechanism.trigger_conditions),
    ...arrayFrom(mechanism.related_strategies),
    ...arrayFrom(mechanism.tags),
    ...arrayFrom(mechanism.signals_to_watch).flatMap(signal => [signal.signal, signal.data_source, signal.field]),
  ];
}

function toEvidenceLink(artifact) {
  return {
    label: artifactTitle(artifact),
    path: normalizePath(artifact?.relPath || artifact?.path || ''),
    source_type: sourceTypeFromArtifact(artifact),
  };
}

function deepDiveFromArtifact(name, artifact) {
  const topic = artifactTitle(artifact);
  return {
    topic,
    why_it_matters: `${name} depends on understanding ${topic} and whether it confirms or challenges the current signal.`,
    source_type: sourceTypeFromArtifact(artifact),
    links: [normalizePath(artifact?.relPath || artifact?.path || '')].filter(Boolean),
    questions: [
      `What does ${topic} change about ${name}?`,
      `Which evidence would confirm or invalidate this read?`,
    ],
    next_action: `Read ${topic} and capture one takeaway in the relevant review note.`,
  };
}

function deepDiveFromReference(name, reference) {
  const label = stripWiki(String(reference));
  return {
    topic: label,
    why_it_matters: `${label} is a reference point for understanding ${name}.`,
    source_type: 'reference',
    links: [String(reference)],
    questions: [
      `How does ${label} explain the current ${name} signal?`,
      `What would make this reference less relevant today?`,
    ],
    next_action: `Open ${reference} and compare it with the latest signal evidence.`,
  };
}

function dedupeDeepDives(items) {
  const seen = new Set();
  const output = [];
  for (const item of arrayFrom(items)) {
    const key = normalizeKey(`${item.topic}:${arrayFrom(item.links)[0] || ''}`);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }
  return output;
}

function dedupeGaps(gaps) {
  const seen = new Set();
  const output = [];
  for (const gap of arrayFrom(gaps)) {
    const key = normalizeKey(`${gap.scope}:${gap.name}:${gap.gap_type}`);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(gap);
  }
  return output;
}

function uniqueArtifacts(artifacts) {
  const seen = new Set();
  const output = [];
  for (const artifact of arrayFrom(artifacts)) {
    const key = artifact?.path || artifact?.filename || artifactTitle(artifact);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(artifact);
  }
  return output;
}

function isDeepDiveArtifact(artifact) {
  const sourceType = sourceTypeFromArtifact(artifact);
  return ['research', 'news', 'official', 'source-watch', 'reference'].includes(sourceType);
}

function sourceTypeFromArtifact(artifact) {
  const domain = artifactDomain(artifact);
  const type = String(artifactDataType(artifact)).toLowerCase();
  if (domain === 'sourcewatch') return 'source-watch';
  if (domain === 'research' || ['semantic', 'arxiv', 'pubmed', 'paper'].some(token => type.includes(token))) return 'research';
  if (domain === 'news' || type.includes('news') || type.includes('gdelt')) return 'news';
  if (domain === 'government' || type.includes('filing') || type.includes('sec')) return 'official';
  return domain || 'vault';
}

function sourceTypeRank(artifact) {
  const rank = {
    research: 0,
    news: 1,
    'source-watch': 2,
    official: 3,
    theses: 4,
    macro: 5,
    market: 6,
  };
  return rank[sourceTypeFromArtifact(artifact)] ?? 8;
}

function confidenceFromEvidence(evidenceCount, missingCount, matched) {
  const activeCount = arrayFrom(matched).filter(item => normalizeSignalStatus(artifactStatus(item)) !== 'clear').length;
  if (evidenceCount >= 3 && missingCount === 0 && activeCount >= 1) return 'High';
  if (evidenceCount >= 2 || (evidenceCount >= 1 && missingCount <= 2)) return 'Medium';
  return 'Low';
}

function compareCards(left, right) {
  return STATUS_RANK[normalizeSignalStatus(right.signal_status)] - STATUS_RANK[normalizeSignalStatus(left.signal_status)] ||
    scopeRank(left.scope) - scopeRank(right.scope) ||
    String(left.name).localeCompare(String(right.name));
}

function scopeRank(scope) {
  const ranks = { strategy: 0, thesis: 1, 'market-cycle': 2 };
  return ranks[scope] ?? 9;
}

function artifactTitle(artifact) {
  return String(artifact?.data?.title || artifact?.title || basename(String(artifact?.path || artifact?.filename || 'Artifact'), '.md'));
}

function artifactStatus(artifact) {
  return normalizeSignalStatus(artifact?.data?.signal_status || artifact?.signal_status);
}

function artifactDomain(artifact) {
  const raw = artifact?.pullDomain || artifact?.data?.domain || '';
  return String(raw).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function artifactDataType(artifact) {
  return String(artifact?.data?.data_type || artifact?.data_type || '');
}

function artifactDate(artifact) {
  return String(artifact?.data?.date_pulled || artifact?.data?.date || artifact?.date || filenameDate(artifact?.filename) || '');
}

function normalizeSignalStatus(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return Object.hasOwn(STATUS_RANK, normalized) ? normalized : 'clear';
}

function isActiveThesis(thesis) {
  const status = String(thesis?.note?.data?.status || thesis?.note?.data?.monitor_status || '').trim().toLowerCase();
  return ACTIVE_THESIS_STATUSES.has(status) || status !== 'archived';
}

function namesMatch(left, right) {
  return normalizeKey(left) === normalizeKey(right);
}

function normalizeKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\[\[|\]\]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function slugify(value) {
  return normalizeKey(value).replace(/_/g, '-') || 'item';
}

function tokensFrom(values) {
  const tokens = new Set();
  for (const value of arrayFrom(values)) {
    for (const token of String(value || '')
      .replace(/\[\[|\]\]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(token => token.length > 1 && !STOPWORDS.has(token))) {
      tokens.add(token);
    }
  }
  return tokens;
}

function stripWiki(value) {
  return String(value || '').replace(/\[\[|\]\]/g, '');
}

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function filenameDate(filename) {
  const match = String(filename || '').match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
}

function arrayFrom(value) {
  if (Array.isArray(value)) return value.filter(item => item !== null && item !== undefined);
  if (value === null || value === undefined || value === '') return [];
  return [value];
}
