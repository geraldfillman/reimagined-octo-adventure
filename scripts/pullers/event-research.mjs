/**
 * event-research.mjs - Multi-layer event scenario research from local evidence.
 *
 * This is a synthesis puller. It reads existing My_Data notes and scenario
 * configuration, then writes a link-first event research report.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';

import {
  getEngineRoot,
  getPullsDir,
  getSignalsDir,
  getThesesDir,
  getWorldMachineRoot,
  toEngineRelative,
} from '../lib/config.mjs';
import { readFolder } from '../lib/frontmatter.mjs';
import { buildNote, buildTable, today, writeNote } from '../lib/markdown.mjs';
import { setProperties } from '../lib/obsidian-cli.mjs';
import { buildResearchHandoffs, loadEventExposureMap } from '../lib/event-connections.mjs';

const DEFAULT_SCENARIO_ID = 'fertilizer-shortage';
const DEFAULT_WINDOW_DAYS = 30;
const DEFAULT_LIMIT = 20;
const DEFAULT_HANDOFF_LIMIT = 12;
const SIGNAL_RANK = Object.freeze({ clear: 0, watch: 1, alert: 2, critical: 3 });
const INBOX_INFRA_FILES = new Set([
  '_Inbox README.md',
  'Inbox Ingestion Runbook.md',
  'Inbox Topic Map.md',
  'INGESTION_CONTRACT.md',
  'Market Positioning Ledger.md',
  'Market Positioning Ledger - Positions.md',
  'Market Positioning Ledger - Discard Log.md',
]);
const PULL_DOMAINS = Object.freeze([
  'Theses',
  'Market',
  'Fundamentals',
  'Sectors',
  'Macro',
  'Government',
  'Biotech',
  'Housing',
  'Energy',
  'News',
  'Research',
  'Quant',
  'Orchestrator',
  'Signals',
]);

export async function pull(flags = {}) {
  const engineRoot = flags._engineRoot || getEngineRoot();
  const scenarioId = String(flags.scenario || flags.id || DEFAULT_SCENARIO_ID).trim();
  const windowDays = Math.max(1, Number(flags.window ?? flags.lookback) || DEFAULT_WINDOW_DAYS);
  const limit = Math.max(1, Number(flags.limit) || DEFAULT_LIMIT);
  const handoffLimit = Math.max(1, Number(flags['handoff-limit'] ?? flags.handoffLimit) || DEFAULT_HANDOFF_LIMIT);
  const asOf = String(flags._asOf || flags.date || today()).slice(0, 10);
  const worldRoot = flags._worldRoot || flags.worldRoot || flags['world-root'] || getWorldMachineRoot();

  const result = await buildEventResearchReport({ engineRoot, worldRoot, scenarioId, windowDays, limit, handoffLimit, asOf });

  if (flags.json) {
    console.log(JSON.stringify(toJsonSummary(result), null, 2));
    return { ...toJsonSummary(result), filePath: null };
  }

  if (flags['dry-run']) {
    console.log(result.note);
    return {
      source: 'event-research',
      filePath: null,
      scenario: result.scenario.id,
      signalStatus: result.frontmatter.signal_status,
      evidenceCount: result.evidence.length,
      coverageGapCount: result.coverageGaps.length,
      researchHandoffCount: result.researchHandoffs.length,
    };
  }

  const filePath = join(
    pullsDir(engineRoot),
    'Theses',
    `${asOf}_${sanitizeFilenameSegment(`Event_Research_${result.scenario.name}`)}.md`
  );
  writeReport(filePath, result.note, engineRoot);
  const sidecarPath = writeEventResearchSidecar(result, { engineRoot, asOf });
  if (engineRoot === getEngineRoot()) {
    setProperties(filePath, { signal_status: result.frontmatter.signal_status, date_pulled: asOf });
  }
  console.log(`Wrote ${result.scenario.name} event research report: ${filePath}`);
  console.log(`Wrote ${result.scenario.name} research handoff sidecar: ${sidecarPath}`);

  return {
    source: 'event-research',
    filePath,
    sidecarPath,
    scenario: result.scenario.id,
    signalStatus: result.frontmatter.signal_status,
    evidenceCount: result.evidence.length,
    coverageGapCount: result.coverageGaps.length,
    researchHandoffCount: result.researchHandoffs.length,
  };
}

export async function loadScenarioConfig({ engineRoot = getEngineRoot(), configPath = null } = {}) {
  const path = configPath || join(engineRoot, 'scripts', 'config', 'event-scenarios.json');
  const text = await readFile(path, 'utf8');
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed.scenarios)) {
    throw new Error(`Event scenario config must include a scenarios array: ${path}`);
  }
  return parsed;
}

export async function buildEventResearchReport({
  engineRoot = getEngineRoot(),
  worldRoot = getWorldMachineRoot(),
  scenarioId = DEFAULT_SCENARIO_ID,
  windowDays = DEFAULT_WINDOW_DAYS,
  limit = DEFAULT_LIMIT,
  handoffLimit = DEFAULT_HANDOFF_LIMIT,
  asOf = today(),
} = {}) {
  const config = await loadScenarioConfig({ engineRoot });
  const scenario = config.scenarios.find(row => row.id === scenarioId);
  if (!scenario) {
    throw new Error(`Unknown event scenario "${scenarioId}". Available: ${config.scenarios.map(row => row.id).join(', ')}`);
  }

  const since = daysAgo(asOf, windowDays);
  const artifacts = await loadArtifacts({ engineRoot, since });
  const layerContexts = scenario.layers.map((layer, index) =>
    buildLayerContext(layer, index, artifacts, { engineRoot, limit })
  );
  const phaseContexts = (scenario.timing_phases || []).map(phase =>
    buildPhaseContext(phase, artifacts, { engineRoot, limit: 5 })
  );
  const evidence = dedupeArtifacts(layerContexts.flatMap(row => row.evidence)).slice(0, limit);
  const coverageGaps = buildCoverageGaps(layerContexts);
  const signalStatus = classifySignalStatus(layerContexts);
  const inferredPhase = inferCurrentPhase(phaseContexts);
  const relatedTheses = uniqueValues(scenario.layers.flatMap(layer => arrayFrom(layer.related_theses)));
  const knowledge = buildFurtherKnowledge({ scenario, artifacts, engineRoot, limit });
  const semanticScholar = buildLatestSemanticScholarResearch({ scenario, artifacts, engineRoot, limit: 5 });
  const inboxIngestion = buildInboxIngestionBridge({ worldRoot });
  const exposureMap = await loadExposureMapForReport(engineRoot);
  const researchHandoffs = buildResearchHandoffs({
    scenario,
    layerContexts,
    phaseContexts,
    exposureMap,
    handoffLimit,
  });
  const topResearchTargets = researchHandoffs.map(handoff => handoff.symbol || handoff.label);

  const frontmatter = {
    title: `${scenario.name} Event Research`,
    source: 'Event Research',
    scenario: scenario.id,
    date_pulled: asOf,
    domain: 'theses',
    data_type: 'event_research_report',
    frequency: 'on-demand',
    signal_status: signalStatus,
    signals: buildSignals(layerContexts),
    related_theses: relatedTheses,
    coverage_gap_count: coverageGaps.length,
    evidence_count: evidence.length,
    inferred_phase: inferredPhase.phase || 'unresolved',
    research_handoff_count: researchHandoffs.length,
    top_research_targets: topResearchTargets,
    connection_status: researchHandoffs.length ? 'mapped' : 'unmapped',
    tags: ['event-research', 'scenario', 'synthesis', scenario.id],
  };

  const note = buildNote({
    frontmatter,
    sections: [
      { heading: 'Snapshot', content: buildSnapshot({ scenario, signalStatus, evidence, coverageGaps, inferredPhase, since, asOf }) },
      { heading: 'Layer Cascade Map', content: buildLayerCascadeTable(layerContexts) },
      { heading: 'Timing Phase Read', content: buildTimingPhaseRead(phaseContexts, inferredPhase) },
      { heading: 'Connection Timeline', content: buildConnectionTimeline(layerContexts, researchHandoffs) },
      { heading: 'Research Handoffs', content: buildResearchHandoffsSection(researchHandoffs) },
      { heading: 'Latest Semantic Scholar Research', content: buildLatestSemanticScholarSection(semanticScholar) },
      { heading: 'Inbox Ingestion Bridge', content: buildInboxIngestionSection(inboxIngestion) },
      { heading: 'Opportunity Evaluation', content: buildOpportunityEvaluation(scenario, layerContexts) },
      { heading: 'Evidence Dashboard', content: buildEvidenceDashboard(scenario, layerContexts) },
      { heading: 'Winners / Losers Research Queue', content: buildResearchQueue(scenario, layerContexts) },
      { heading: 'Further Knowledge', content: buildFurtherKnowledgeSection(knowledge) },
      { heading: 'Source Gaps', content: buildSourceGaps(coverageGaps) },
      { heading: 'Next Review Actions', content: buildNextReviewActions(scenario, coverageGaps) },
    ],
  });

  return { scenario, frontmatter, note, layerContexts, phaseContexts, inferredPhase, evidence, coverageGaps, knowledge, researchHandoffs, semanticScholar, inboxIngestion };
}

async function loadExposureMapForReport(engineRoot) {
  try {
    return await loadEventExposureMap({ engineRoot });
  } catch (error) {
    return { targets: [], error: error.message };
  }
}

async function loadArtifacts({ engineRoot, since }) {
  const notes = [];
  for (const domain of PULL_DOMAINS) {
    const domainNotes = await readFolder(join(pullsDir(engineRoot), domain), false);
    notes.push(...domainNotes.map(note => ({ ...note, sourceLayer: `05_Data_Pulls/${domain}`, artifactType: 'pull' })));
  }

  if (existsSync(signalsDir(engineRoot))) {
    const signalNotes = await readFolder(signalsDir(engineRoot), false);
    notes.push(...signalNotes.map(note => ({ ...note, sourceLayer: '06_Signals', artifactType: 'signal' })));
  }

  if (existsSync(thesesDir(engineRoot))) {
    const thesisNotes = await readFolder(thesesDir(engineRoot), true);
    notes.push(...thesisNotes.map(note => ({ ...note, sourceLayer: '10_Theses', artifactType: 'thesis' })));
  }

  const sourceRoot = join(engineRoot, '01_Data_Sources');
  if (existsSync(sourceRoot)) {
    const sourceNotes = await readFolder(sourceRoot, true);
    notes.push(...sourceNotes.map(note => ({ ...note, sourceLayer: '01_Data_Sources', artifactType: 'source' })));
  }

  return notes
    .filter(note => !relative(engineRoot, note.path).split(sep).includes('_archive'))
    .filter(note => artifactDate(note) >= since || ['thesis', 'source'].includes(note.artifactType))
    .map(note => ({ ...note, searchText: artifactSearchText(note) }));
}

function buildLayerContext(layer, index, artifacts, { engineRoot, limit }) {
  const terms = tokensFrom([layer.name, layer.mechanism, ...arrayFrom(layer.watch_terms)]);
  const scored = artifacts
    .map(artifact => ({ artifact, score: scoreArtifact(artifact, terms) }))
    .filter(row => row.score > 0)
    .sort((left, right) =>
      right.score - left.score ||
      rankSignal(right.artifact.data?.signal_status || right.artifact.data?.severity) -
      rankSignal(left.artifact.data?.signal_status || left.artifact.data?.severity)
    )
    .slice(0, limit)
    .map(row => ({ ...row.artifact, matchScore: row.score, link: artifactLink(row.artifact, engineRoot) }));

  const highestStatus = maxSignalStatus(scored.map(note => note.data?.signal_status || note.data?.severity));
  return {
    ...layer,
    index,
    evidence: scored,
    evidenceCount: scored.length,
    signalStatus: scored.length ? highestStatus : 'clear',
  };
}

function buildPhaseContext(phase, artifacts, { engineRoot, limit }) {
  const terms = tokensFrom([phase.phase, ...arrayFrom(phase.watch_terms)]);
  const evidence = artifacts
    .map(artifact => ({ artifact, score: scoreArtifact(artifact, terms) }))
    .filter(row => row.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(row => ({ ...row.artifact, matchScore: row.score, link: artifactLink(row.artifact, engineRoot) }));
  return { ...phase, evidence, evidenceCount: evidence.length, signalStatus: maxSignalStatus(evidence.map(note => note.data?.signal_status || note.data?.severity)) };
}

function classifySignalStatus(layerContexts) {
  const activeLayers = layerContexts.filter(layer => layer.evidenceCount > 0);
  const directLayer = layerContexts[0];
  const criticalLayers = layerContexts.filter(layer => layer.signalStatus === 'critical');
  if (directLayer?.signalStatus === 'critical' || criticalLayers.length >= 2) return 'critical';
  if (
    activeLayers.length >= 2 &&
    directLayer?.evidenceCount > 0 &&
    rankSignal(maxSignalStatus(activeLayers.map(layer => layer.signalStatus))) >= SIGNAL_RANK.watch
  ) {
    return 'alert';
  }
  if (activeLayers.length > 0 || layerContexts.some(layer => layer.signalStatus === 'watch')) return 'watch';
  return 'clear';
}

function buildSnapshot({ scenario, signalStatus, evidence, coverageGaps, inferredPhase, since, asOf }) {
  const strongest = evidence[0];
  return [
    `- **Scenario**: ${scenario.name}`,
    `- **Core Trigger**: ${scenario.core_trigger}`,
    `- **Window**: ${since} to ${asOf}`,
    `- **Signal Status**: ${signalStatus}`,
    `- **Inferred Phase**: ${inferredPhase.phase || 'unresolved'}`,
    `- **Strongest Evidence**: ${strongest ? strongest.link : 'No recent local evidence matched this scenario.'}`,
    `- **Coverage Gaps**: ${coverageGaps.length}`,
    '',
    `Trigger causes tracked: ${arrayFrom(scenario.trigger_causes).join(', ') || 'N/A'}.`,
  ].join('\n');
}

function buildLayerCascadeTable(layerContexts) {
  return buildTable(
    ['Layer', 'Mechanism', 'Status', 'Beneficiaries', 'Losers', 'Latest Evidence'],
    layerContexts.map(layer => [
      layer.name,
      layer.mechanism,
      layer.evidenceCount ? layer.signalStatus : 'gap',
      arrayFrom(layer.beneficiaries).join(', ') || 'N/A',
      arrayFrom(layer.losers).join(', ') || 'N/A',
      layer.evidence.slice(0, 3).map(note => note.link).join(', ') || 'No recent local evidence',
    ])
  );
}

function buildTimingPhaseRead(phaseContexts, inferredPhase) {
  if (phaseContexts.length === 0) return 'No timing phases are configured for this scenario.';
  const table = buildTable(
    ['Phase', 'Evidence', 'Winners', 'Losers'],
    phaseContexts.map(phase => [
      phase.phase,
      phase.evidence.slice(0, 3).map(note => note.link).join(', ') || 'No current local evidence',
      arrayFrom(phase.winners).join(', ') || 'N/A',
      arrayFrom(phase.losers).join(', ') || 'N/A',
    ])
  );
  return [`Current read: **${inferredPhase.phase || 'unresolved'}**.`, '', table].join('\n');
}

function buildConnectionTimeline(layerContexts, researchHandoffs) {
  if (!researchHandoffs.length) {
    return 'No curated exposure-map targets matched this scenario yet. Update scripts/config/event-exposure-map.json before routing deeper research.';
  }
  return buildTable(
    ['Layer', 'Status', 'Research Targets', 'Evidence Links'],
    layerContexts.map(layer => {
      const targets = researchHandoffs
        .filter(handoff => handoff.matched_layer === layer.name)
        .map(formatHandoffTarget)
        .slice(0, 5)
        .join(', ');
      return [
        layer.name,
        layer.evidenceCount ? layer.signalStatus : 'gap',
        targets || 'No mapped handoff',
        layer.evidence.slice(0, 3).map(note => note.link).join(', ') || 'No recent local evidence',
      ];
    })
  );
}

function buildResearchHandoffsSection(researchHandoffs) {
  if (!researchHandoffs.length) {
    return 'No research handoffs were queued. This run did not execute company, sector, thesis, or commodity agents.';
  }
  return [
    'These handoffs are for chat review only. Commands are dry-run oriented and do not acquire fresh source data automatically.',
    '',
    ...researchHandoffs.map((handoff, index) => [
      `### ${index + 1}. ${formatHandoffTarget(handoff)}`,
      `- **Type**: ${handoff.target_type} / ${handoff.direction} / ${handoff.confidence} confidence`,
      `- **Matched Layer**: ${handoff.matched_layer || 'N/A'}${handoff.timing_phase ? `; timing phase ${handoff.timing_phase}` : ''}`,
      `- **Why Queued**: ${handoff.rationale}`,
      `- **Evidence Links**: ${handoff.evidence_links.join(', ') || 'No direct local evidence link; queued from scenario structure.'}`,
      '- **Commands:**',
      ...handoff.commands.map(command => `  - \`${command}\``),
    ].join('\n')),
  ].join('\n\n');
}

function buildLatestSemanticScholarResearch({ scenario, artifacts, engineRoot, limit = 5 }) {
  const terms = semanticScholarTerms(scenario);
  const papers = artifacts
    .filter(isSemanticScholarArtifact)
    .map(artifact => {
      const match = matchTerms(artifact.searchText, terms);
      const date = artifactDate(artifact);
      const recency = date === '0000-00-00' ? 0 : Number(date.replace(/-/g, ''));
      return {
        artifact,
        score: match.score,
        recency,
        matchedTerms: match.terms,
      };
    })
    .filter(row => row.score > 0)
    .sort((left, right) =>
      right.recency - left.recency ||
      right.score - left.score ||
      String(artifactTitle(left.artifact)).localeCompare(String(artifactTitle(right.artifact)))
    )
    .slice(0, Math.max(1, Number(limit) || 5))
    .map(row => ({
      title: artifactTitle(row.artifact),
      date_pulled: artifactDate(row.artifact),
      source: row.artifact.data?.source || 'Semantic Scholar Academic Graph',
      data_type: row.artifact.data?.data_type || row.artifact.artifactType,
      query: row.artifact.data?.query || '',
      score: row.score,
      matched_terms: row.matchedTerms,
      link: artifactLink(row.artifact, engineRoot),
    }));

  return {
    papers,
    refreshCommands: buildSemanticScholarRefreshCommands(scenario),
  };
}

function buildLatestSemanticScholarSection(semanticScholar) {
  const papers = semanticScholar?.papers || [];
  const commands = semanticScholar?.refreshCommands || [];
  const paperSection = papers.length
    ? buildTable(
        ['Date', 'Pull Note', 'Query', 'Matched Terms'],
        papers.map(paper => [
          paper.date_pulled,
          paper.link,
          paper.query || 'N/A',
          paper.matched_terms.slice(0, 6).join(', ') || 'N/A',
        ])
      )
    : 'No local Semantic Scholar pull notes matched this scenario yet.';

  return [
    paperSection,
    '',
    '### Refresh Commands',
    commands.map(command => `- \`${command}\``).join('\n') || '- No Semantic Scholar refresh command could be generated.',
    '',
    'These commands are manual source-refresh commands. This event report only summarizes existing local research pulls.',
  ].join('\n');
}

function buildInboxIngestionBridge({ worldRoot = getWorldMachineRoot() } = {}) {
  const resolvedWorldRoot = resolve(String(worldRoot || getWorldMachineRoot()));
  const inboxPath = join(resolvedWorldRoot, '_Inbox');
  const processableFiles = collectProcessableInboxFiles(inboxPath);
  const latestBatch = findLatestInboxBatchObservation(resolvedWorldRoot);
  return {
    inbox_path: inboxPath,
    processable_count: processableFiles.length,
    processable_files: processableFiles.slice(0, 12).map(filePath => toSlash(relative(inboxPath, filePath))),
    latest_batch_observation: latestBatch,
    commands: [
      'node run.mjs bridge ingest-world-inbox --dry-run',
      'node run.mjs bridge ingest-world-inbox',
    ],
    note: 'Inbox ingestion is explicit: dry-run first, then run without --dry-run only when ready to write the batch observation and archive processed inbox files.',
  };
}

function buildInboxIngestionSection(inboxIngestion) {
  const lines = [
    `- **Inbox Path**: \`${inboxIngestion.inbox_path}\``,
    `- **Processable Inbox Items**: ${inboxIngestion.processable_count}`,
  ];

  if (inboxIngestion.latest_batch_observation) {
    lines.push(
      `- **Latest Batch Observation**: ${inboxIngestion.latest_batch_observation.link}`,
      `- **Latest Batch Event Trends**: ${inboxIngestion.latest_batch_observation.event_trend_count}`,
    );
    if (inboxIngestion.latest_batch_observation.related_event_scenarios.length) {
      lines.push(`- **Latest Batch Scenarios**: ${inboxIngestion.latest_batch_observation.related_event_scenarios.map(id => `\`${id}\``).join(', ')}`);
    }
  }

  lines.push(
    `- **Preview Command**: \`${inboxIngestion.commands[0]}\``,
    `- **Ingest Command**: \`${inboxIngestion.commands[1]}\``,
    '',
    inboxIngestion.processable_files.length
      ? buildTable(
          ['Candidate Inbox File'],
          inboxIngestion.processable_files.map(file => [file])
        )
      : 'No processable inbox files were found. Protected inbox infrastructure files are ignored.',
    '',
    inboxIngestion.note,
  );

  return lines.join('\n');
}

function collectProcessableInboxFiles(inboxPath) {
  if (!existsSync(inboxPath)) return [];
  const files = [];
  for (const filePath of collectMarkdownFiles(inboxPath)) {
    const rel = toSlash(relative(inboxPath, filePath));
    if (!rel || rel.startsWith('..')) continue;
    if (INBOX_INFRA_FILES.has(rel) || INBOX_INFRA_FILES.has(basename(filePath))) continue;
    if (basename(filePath).toLowerCase() === 'readme.md') continue;
    files.push(filePath);
  }
  return files.sort((left, right) => toSlash(relative(inboxPath, left)).localeCompare(toSlash(relative(inboxPath, right))));
}

function findLatestInboxBatchObservation(worldRoot) {
  const observationRoots = [
    join(worldRoot, 'Reports', 'Inbox Reports'),
    join(worldRoot, '500-archive', 'Inbox', 'Observations'),
  ];
  const files = observationRoots.flatMap(observationRoot =>
    existsSync(observationRoot) ? collectMarkdownFiles(observationRoot) : [])
    .filter(filePath => /Inbox Ingestion Batch(?: \d+)?\.md$/i.test(filePath))
    .map(filePath => ({ filePath, mtimeMs: statSync(filePath).mtimeMs }))
    .sort((a, b) => b.mtimeMs - a.mtimeMs);
  if (files.length === 0) return null;

  const filePath = files[0].filePath;
  const raw = readFileSync(filePath, 'utf-8');
  const rel = toSlash(relative(worldRoot, filePath));
  const title = basename(filePath, extname(filePath));
  return {
    path: filePath,
    relative_path: rel,
    link: `[[${rel.replace(/\.md$/i, '')}|${title}]]`,
    event_trend_count: Number(raw.match(/^event_trend_count:\s*(\d+)/m)?.[1] || 0),
    related_event_scenarios: parseInlineList(raw.match(/^related_event_scenarios:\s*\[(.*)\]/m)?.[1] || ''),
  };
}

function parseInlineList(value) {
  return String(value || '')
    .split(',')
    .map(item => item.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
}

function collectMarkdownFiles(dir) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMarkdownFiles(full));
    } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.md' && statSync(full).isFile()) {
      results.push(full);
    }
  }
  return results;
}

function buildOpportunityEvaluation(scenario, layerContexts) {
  const evidenceText = layerContexts
    .filter(layer => layer.evidenceCount > 0)
    .map(layer => `${layer.name}: ${layer.evidenceCount} evidence item(s)`)
    .join('; ') || 'No layer evidence yet.';
  return buildTable(
    ['Factor', 'Question', 'Current Read'],
    arrayFrom(scenario.opportunity_factors).map(row => [
      row.factor,
      row.question,
      evidenceText,
    ])
  );
}

function buildEvidenceDashboard(scenario, layerContexts) {
  return buildTable(
    ['Evidence Area', 'Configured Sources', 'Coverage', 'Related Indicators'],
    layerContexts.map(layer => [
      layer.name,
      arrayFrom(layer.sources_to_check).join(', ') || 'N/A',
      layer.evidenceCount ? `${layer.evidenceCount} local match(es)` : 'gap',
      arrayFrom(layer.related_indicators).join(', ') || 'N/A',
    ])
  );
}

function buildResearchQueue(scenario, layerContexts) {
  const speculative = layerContexts.slice(0, 3).flatMap(layer => arrayFrom(layer.beneficiaries)).slice(0, 8);
  const structural = layerContexts.slice(3).flatMap(layer => arrayFrom(layer.beneficiaries)).slice(0, 8);
  const defensive = uniqueValues(layerContexts.flatMap(layer => arrayFrom(layer.beneficiaries)).filter(item => /utilit|treasur|cash|defensive|infrastructure/i.test(item))).slice(0, 8);
  const avoid = uniqueValues(layerContexts.flatMap(layer => arrayFrom(layer.losers))).slice(0, 10);
  return [
    `- **Speculative / Shock Beneficiaries**: ${speculative.join(', ') || 'N/A'}`,
    `- **Structural / Adaptation Winners**: ${structural.join(', ') || 'N/A'}`,
    `- **Defensive / Hedge Layer**: ${defensive.join(', ') || 'N/A'}`,
    `- **Losers / Avoid Queue**: ${avoid.join(', ') || 'N/A'}`,
    '',
    'These are research queues only. Confirm fundamentals, tape, financing risk, and independent evidence before changing any portfolio view.',
  ].join('\n');
}

function formatHandoffTarget(handoff) {
  return handoff.symbol ? `${handoff.label} (${handoff.symbol})` : handoff.label;
}

function buildFurtherKnowledge({ scenario, artifacts, engineRoot, limit }) {
  const scenarioTerms = tokensFrom([
    scenario.name,
    scenario.core_trigger,
    ...arrayFrom(scenario.trigger_causes),
    ...arrayFrom(scenario.layers).flatMap(layer => [
      layer.name,
      layer.mechanism,
      ...arrayFrom(layer.watch_terms),
      ...arrayFrom(layer.related_theses),
      ...arrayFrom(layer.related_indicators),
    ]),
  ]);
  const scored = artifacts
    .map(artifact => ({ artifact, score: scoreKnowledgeArtifact(artifact, scenarioTerms) }))
    .filter(row => row.score > 0)
    .sort((left, right) => right.score - left.score)
    .map(row => ({ ...row.artifact, matchScore: row.score, link: artifactLink(row.artifact, engineRoot) }));

  return {
    papers: selectKnowledgeArtifacts(scored, artifact => isResearchPaperArtifact(artifact), limit),
    news: selectKnowledgeArtifacts(scored, artifact => isNewsOrBlogArtifact(artifact), limit),
    sources: selectKnowledgeArtifacts(scored, artifact => artifact.artifactType === 'source', limit),
    related: selectKnowledgeArtifacts(scored, artifact => !isResearchPaperArtifact(artifact) && !isNewsOrBlogArtifact(artifact) && artifact.artifactType !== 'source', limit),
    pulls: buildSuggestedKnowledgePulls(scenario),
  };
}

function semanticScholarTerms(scenario) {
  return tokensFrom([
    scenario.name,
    scenario.core_trigger,
    ...arrayFrom(scenario.trigger_causes),
    ...arrayFrom(scenario.layers).flatMap(layer => [
      layer.name,
      layer.mechanism,
      ...arrayFrom(layer.watch_terms),
      ...arrayFrom(layer.beneficiaries),
      ...arrayFrom(layer.losers),
      ...arrayFrom(layer.related_theses),
      ...arrayFrom(layer.related_indicators),
    ]),
  ]);
}

function buildSemanticScholarRefreshCommands(scenario) {
  const baseTerms = uniqueValues([
    scenario.name,
    ...arrayFrom(scenario.layers).flatMap(layer => arrayFrom(layer.watch_terms).slice(0, 2)),
  ]).slice(0, 7);
  const broadQuery = baseTerms.join(' ');
  const commands = [
    `node run.mjs pull semantic-scholar --query "${escapeDoubleQuotes(broadQuery)}" --limit 10 --year 2025-`,
  ];
  for (const layer of arrayFrom(scenario.layers).slice(0, 2)) {
    const layerQuery = uniqueValues([layer.name, ...arrayFrom(layer.watch_terms).slice(0, 4)]).join(' ');
    if (layerQuery) {
      commands.push(`node run.mjs pull semantic-scholar --query "${escapeDoubleQuotes(layerQuery)}" --limit 10 --year 2025-`);
    }
  }
  return uniqueValues(commands);
}

function isSemanticScholarArtifact(artifact) {
  const text = `${artifact.sourceLayer} ${artifact.data?.source || ''} ${artifact.data?.data_type || ''} ${artifact.filename}`.toLowerCase();
  return artifact.artifactType === 'pull' && text.includes('semantic') && text.includes('scholar');
}

function matchTerms(text, terms) {
  const matches = [];
  let score = 0;
  for (const term of terms) {
    const normalized = String(term || '').toLowerCase();
    if (!normalized || !text.includes(normalized)) continue;
    matches.push(term);
    score += normalized.includes(' ') ? 3 : 1;
  }
  return { score, terms: uniqueValues(matches).slice(0, 10) };
}

function buildFurtherKnowledgeSection(knowledge) {
  return [
    '### Research Papers',
    renderKnowledgeList(knowledge.papers, 'No local research-paper artifacts matched this scenario yet.'),
    '',
    '### Blogs And News',
    renderKnowledgeList(knowledge.news, 'No local blog or news artifacts matched this scenario yet.'),
    '',
    '### Source Notes And Reference Surfaces',
    renderKnowledgeList(knowledge.sources, 'No source notes matched this scenario yet.'),
    '',
    '### Related Local Context',
    renderKnowledgeList(knowledge.related, 'No additional local context matched this scenario yet.'),
    '',
    '### Suggested Follow-Up Pulls',
    knowledge.pulls.map(command => `- \`${command}\``).join('\n') || '- Review configured sources and run the narrowest matching manual puller.',
  ].join('\n');
}

function renderKnowledgeList(items, emptyText) {
  if (!items.length) return emptyText;
  return items.map(item => `- ${item.link} - ${knowledgeDescriptor(item)}`).join('\n');
}

function knowledgeDescriptor(artifact) {
  const source = artifact.data?.source || artifact.data?.provider || artifact.data?.name || artifact.sourceLayer;
  const date = artifactDate(artifact);
  return [source, date && date !== '0000-00-00' ? date : null, artifact.data?.data_type || artifact.artifactType]
    .filter(Boolean)
    .join(' / ');
}

function selectKnowledgeArtifacts(artifacts, predicate, limit) {
  return dedupeArtifacts(artifacts.filter(predicate)).slice(0, Math.max(3, Math.min(Number(limit) || DEFAULT_LIMIT, 8)));
}

function isResearchPaperArtifact(artifact) {
  const text = `${artifact.sourceLayer} ${artifact.data?.source || ''} ${artifact.data?.data_type || ''} ${artifact.filename}`.toLowerCase();
  return artifact.artifactType === 'pull' && (
    text.includes('research') ||
    text.includes('semantic') ||
    text.includes('scholar') ||
    text.includes('pubmed') ||
    text.includes('arxiv') ||
    text.includes('paper')
  );
}

function isNewsOrBlogArtifact(artifact) {
  const text = `${artifact.sourceLayer} ${artifact.data?.source || ''} ${artifact.data?.data_type || ''} ${artifact.filename}`.toLowerCase();
  return artifact.artifactType === 'pull' && (
    text.includes('news') ||
    text.includes('gdelt') ||
    text.includes('sourcewatch') ||
    text.includes('source-watch') ||
    text.includes('blog') ||
    text.includes('article')
  );
}

function buildSuggestedKnowledgePulls(scenario) {
  const terms = uniqueValues([
    scenario.name,
    ...arrayFrom(scenario.layers).flatMap(layer => arrayFrom(layer.watch_terms).slice(0, 2)),
  ]).slice(0, 6);
  const query = terms.join(' ');
  const lower = query.toLowerCase();
  const commands = [
    `node run.mjs pull semantic-scholar --query "${query}" --limit 10`,
    `node run.mjs pull newsapi --topic "${scenario.name}" --limit 20`,
  ];
  if (/glp|drug|clinical|fda|health|pharma|metabolic|obesity/i.test(lower)) {
    commands.push('node run.mjs pull pubmed --glp1');
    commands.push('node run.mjs pull clinicaltrials --glp1');
    commands.push('node run.mjs pull fda --recent-approvals');
  } else if (/oil|hormuz|energy|lng|gas|grid|power|electric|nuclear/i.test(lower)) {
    commands.push('node run.mjs pull gdelt --topic energy --dry-run');
    commands.push('node run.mjs pull eia --all');
  } else if (/copper|mine|mining|commodity|materials/i.test(lower)) {
    commands.push('node run.mjs pull gdelt --topic markets --dry-run');
    commands.push('node run.mjs pull fmp --thesis-watchlists');
  }
  return uniqueValues(commands);
}

function buildSourceGaps(coverageGaps) {
  if (coverageGaps.length === 0) return 'No major scenario coverage gaps were detected in the current local evidence window.';
  return coverageGaps.map(gap =>
    `- ${gap.message} Suggested manual refresh: ${gap.refreshCommand}`
  ).join('\n');
}

function buildNextReviewActions(scenario, coverageGaps) {
  const actions = [
    `Run \`node run.mjs pull event-research --scenario ${scenario.id} --dry-run\` after source refreshes to compare the cascade map.`,
    'Review the linked thesis full-picture reports before changing conviction.',
    'Use at least two independent evidence channels before upgrading a scenario from watch to alert.',
  ];
  if (coverageGaps.length) {
    actions.push('Refresh the highest-priority source gaps first, then rerun this event research report.');
  }
  return actions.map(action => `- ${action}`).join('\n');
}

function buildCoverageGaps(layerContexts) {
  return layerContexts
    .filter(layer => layer.evidenceCount === 0)
    .map(layer => ({
      layer: layer.name,
      message: `No recent local evidence matched ${layer.name}.`,
      refreshCommand: recommendedRefreshCommand(layer),
    }));
}

function recommendedRefreshCommand(layer) {
  const sources = arrayFrom(layer.sources_to_check).join(' ').toLowerCase();
  if (sources.includes('eia')) return 'node run.mjs pull eia --all';
  if (sources.includes('fmp')) return 'node run.mjs pull fmp --thesis-watchlists';
  if (sources.includes('gdelt')) return 'node run.mjs pull gdelt --topic energy --dry-run';
  if (sources.includes('semantic')) return 'node run.mjs pull semantic-scholar --query "precision agriculture fertilizer shortage" --limit 10';
  if (sources.includes('fred')) return 'node run.mjs pull fred --group inflation';
  return 'Review configured sources and run the narrowest matching manual puller.';
}

function buildSignals(layerContexts) {
  return layerContexts
    .filter(layer => layer.evidenceCount > 0 && layer.signalStatus !== 'clear')
    .map(layer => `${slugify(layer.name)}:${layer.signalStatus}`);
}

function inferCurrentPhase(phaseContexts) {
  if (!phaseContexts.some(phase => phase.evidenceCount > 0)) return {};
  return [...phaseContexts].sort((left, right) =>
    right.evidenceCount - left.evidenceCount ||
    rankSignal(right.signalStatus) - rankSignal(left.signalStatus)
  )[0] || {};
}

function toJsonSummary(result) {
  return {
    source: 'event-research',
    scenario: result.scenario.id,
    signal_status: result.frontmatter.signal_status,
    inferred_phase: result.frontmatter.inferred_phase,
    evidence_count: result.evidence.length,
    coverage_gap_count: result.coverageGaps.length,
    research_handoff_count: result.researchHandoffs.length,
    top_research_targets: result.frontmatter.top_research_targets,
    connection_status: result.frontmatter.connection_status,
    research_handoffs: result.researchHandoffs,
    semantic_scholar_research: result.semanticScholar?.papers || [],
    semantic_scholar_refresh_commands: result.semanticScholar?.refreshCommands || [],
    inbox_ingestion: result.inboxIngestion,
    knowledge_counts: {
      papers: result.knowledge?.papers?.length || 0,
      news: result.knowledge?.news?.length || 0,
      sources: result.knowledge?.sources?.length || 0,
      related: result.knowledge?.related?.length || 0,
    },
    coverage_gaps: result.coverageGaps,
  };
}

function writeEventResearchSidecar(result, { engineRoot, asOf }) {
  const path = join(engineRoot, 'scripts', '.cache', 'event-research', `${asOf}_${result.scenario.id}.json`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(toJsonSummary(result), null, 2), 'utf8');
  return path;
}

function writeReport(filePath, content, engineRoot) {
  mkdirSync(dirname(filePath), { recursive: true });
  if (engineRoot === getEngineRoot()) {
    writeNote(filePath, content);
    return;
  }
  writeFileSync(filePath, content, 'utf8');
}

function artifactSearchText(note) {
  return [
    note.filename,
    note.data?.title,
    note.data?.source,
    note.data?.domain,
    note.data?.data_type,
    note.data?.signal_status,
    note.content,
    ...arrayFrom(note.data?.tags),
    ...arrayFrom(note.data?.signals),
    ...arrayFrom(note.data?.core_entities),
    ...arrayFrom(note.data?.supporting_regimes),
    ...arrayFrom(note.data?.key_indicators),
  ].filter(Boolean).join(' ').toLowerCase();
}

function scoreArtifact(artifact, terms) {
  let score = 0;
  let phraseHits = 0;
  let singleHits = 0;
  for (const term of terms) {
    if (!artifact.searchText.includes(term)) continue;
    if (term.includes(' ')) {
      phraseHits += 1;
      score += 3;
    } else {
      singleHits += 1;
      score += 1;
    }
  }
  if (phraseHits === 0 && singleHits < 2) return 0;
  if (artifact.artifactType === 'signal') score += 2;
  if (artifact.artifactType === 'pull') score += 1;
  score += rankSignal(artifact.data?.signal_status || artifact.data?.severity);
  return score;
}

function scoreKnowledgeArtifact(artifact, terms) {
  const score = scoreArtifact(artifact, terms);
  if (score > 0) return score;
  if (artifact.artifactType !== 'source') return 0;
  return terms.some(term => artifact.searchText.includes(term)) ? 1 : 0;
}

function artifactDate(note) {
  return String(note.data?.date_pulled || note.data?.date || note.data?.record_date || dateFromFilename(note.filename) || '0000-00-00').slice(0, 10);
}

function dateFromFilename(filename) {
  const match = String(filename || '').match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}

function artifactTitle(note) {
  return String(note.data?.title || basename(note.filename, '.md'));
}

function artifactLink(note, engineRoot) {
  const rel = engineRoot === getEngineRoot()
    ? toEngineRelative(note.path)
    : relative(engineRoot, note.path).split(sep).join('/');
  return `[[${rel.replace(/\.md$/i, '')}|${artifactTitle(note)}]]`;
}

function maxSignalStatus(statuses) {
  return arrayFrom(statuses).reduce((best, status) => {
    const normalized = normalizeSignalStatus(status);
    return rankSignal(normalized) > rankSignal(best) ? normalized : best;
  }, 'clear');
}

function normalizeSignalStatus(status) {
  const normalized = String(status || 'clear').toLowerCase();
  return Object.prototype.hasOwnProperty.call(SIGNAL_RANK, normalized) ? normalized : 'clear';
}

function rankSignal(status) {
  return SIGNAL_RANK[normalizeSignalStatus(status)] ?? 0;
}

function daysAgo(asOf, days) {
  const date = new Date(`${String(asOf).slice(0, 10)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - Number(days));
  return date.toISOString().slice(0, 10);
}

function tokensFrom(values) {
  return uniqueValues(arrayFrom(values)
    .flatMap(value => String(value || '').toLowerCase().split(/[,;|]/))
    .map(value => value.replace(/\[\[|\]\]/g, '').trim())
    .filter(value => value.length >= 3));
}

function dedupeArtifacts(artifacts) {
  const seen = new Set();
  const result = [];
  for (const artifact of artifacts) {
    if (seen.has(artifact.path)) continue;
    seen.add(artifact.path);
    result.push(artifact);
  }
  return result;
}

function uniqueValues(values) {
  return [...new Set(arrayFrom(values).map(value => String(value || '').trim()).filter(Boolean))];
}

function arrayFrom(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  return [value];
}

function pullsDir(engineRoot) {
  return engineRoot === getEngineRoot() ? getPullsDir() : join(engineRoot, '05_Data_Pulls');
}

function signalsDir(engineRoot) {
  return engineRoot === getEngineRoot() ? getSignalsDir() : join(engineRoot, '06_Signals');
}

function thesesDir(engineRoot) {
  return engineRoot === getEngineRoot() ? getThesesDir() : join(engineRoot, '10_Theses');
}

function sanitizeFilenameSegment(value) {
  return String(value)
    .replace(/[<>:"/\\|?*]+/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function escapeDoubleQuotes(value) {
  return String(value || '').replace(/"/g, '\\"');
}

function toSlash(pathValue) {
  return String(pathValue || '').split(/[\\/]/).join('/');
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
