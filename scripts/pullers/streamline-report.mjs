/**
 * streamline-report.mjs - Orchestrator daily decision-support brief.
 *
 * Reads local vault pull notes and produces the streamlined monitoring report
 * described in ai_agent_monitoring_data_pull_guide.md. This is a synthesis
 * puller: it does not fetch new market data or place trades.
 *
 * Usage:
 *   node run.mjs pull streamline-report
 *   node run.mjs pull streamline-report --window 30 --limit 20
 *   node run.mjs pull streamline-report --include-interactions
 *   node run.mjs pull streamline-report --dry-run
 */

import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getPullsDir, getSignalsDir } from '../lib/config.mjs';
import { getByTicker, stripCik } from '../lib/cik-map.mjs';
import { loadLatestAgentThreads } from '../lib/agent-interactions.mjs';
import { readFolder } from '../lib/frontmatter.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';
import { loadLatestLedger } from '../lib/run-ledger.mjs';
import { computeModuleScores, summarizeScores } from '../lib/signal-quality.mjs';
import { loadLatestPositioningSidecar } from './positioning-report.mjs';

const SIDECAR_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.cache', 'orchestrator', 'streamline-reports');

const DEFAULT_WINDOW_DAYS = 14;
const DEFAULT_LIMIT = 12;

const PULL_DOMAINS = Object.freeze([
  'Market',
  'Theses',
  'Macro',
  'Sectors',
  'Fundamentals',
  'Government',
  'Biotech',
  'Housing',
  'Energy',
  'Research',
  'Quant',
  'Backtest',
  'Alerts',
  'News',
  'Positioning',
  'Orchestrator',
  'VC',
  'Legal',
]);

const SIGNAL_RANK = Object.freeze({
  clear: 0,
  watch: 1,
  alert: 2,
  critical: 3,
});

const VALID_CADENCES = new Set(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']);

const FOCUS_DOMAINS = Object.freeze({
  market:  ['Market', 'Sectors'],
  macro:   ['Macro', 'Government', 'Climate'],
  thesis:  ['Theses', 'Research', 'Fundamentals'],
  risk:    ['Alerts', 'News', 'OSINT'],
  all:     null,
});

export async function pull(flags = {}) {
  const windowDays = Math.max(1, Number(flags.window ?? flags.lookback) || DEFAULT_WINDOW_DAYS);
  const limit = Math.max(1, Number(flags.limit) || DEFAULT_LIMIT);
  const since = flags.since ? String(flags.since) : daysAgo(windowDays);
  const cadence = VALID_CADENCES.has(String(flags.cadence)) ? String(flags.cadence) : 'daily';
  const focusKey = Object.hasOwn(FOCUS_DOMAINS, String(flags.focus)) ? String(flags.focus) : 'all';
  const includeInteractions = Boolean(flags['include-interactions'] || flags.interactions);

  console.log(`Streamline Report: reading local vault notes since ${since} [cadence=${cadence}, focus=${focusKey}]...`);
  const positioningSidecar = await loadLatestPositioningSidecar().catch(() => null);
  const rawData = await loadReportData({ since, limit, positioningSidecar });
  const filteredQueue = applyFocusFilter(rawData.reviewQueue, focusKey);
  const dedupedQueue = deduplicateReviewQueue(filteredQueue);

  // Phase 5: load signal quality scores and apply downgrade cap
  const signalQualityScores = await computeModuleScores(windowDays).catch(() => ({}));
  const agentThreads = includeInteractions
    ? await loadLatestAgentThreads({ date: today(), limit })
    : [];
  const downgradesApplied = {};
  const downgradedQueue = applySignalDowngrade(dedupedQueue, signalQualityScores, downgradesApplied);

  const data = { ...rawData, reviewQueue: downgradedQueue, signalQualityScores, agentThreads };

  const status = classifyReportStatus(data.reviewQueue);
  const signals = buildReportSignals(data);

  const previousSidecar = await loadPreviousSidecar();
  const sidecar = buildSidecar({ data, status, cadence, focus: focusKey, since, windowDays, signals });
  const changedItems = computeChangedItems(sidecar.review_items, previousSidecar?.review_items ?? []);
  sidecar.new_since_last_report = changedItems.new.length;
  sidecar.resolved_since_last_report = changedItems.resolved.length;
  sidecar.changed_items = changedItems;

  // Populate agent_handoffs from the most recent run ledger (written by agent-run.mjs)
  const runLedger = await loadLatestLedger();
  if (runLedger && runLedger.date === today()) {
    sidecar.agent_handoffs = runLedger.entries.map(e => ({
      agent: e.agent_id,
      task: e.puller,
      result: e.status,
      signal: e.signal_status ?? 'clear',
      artifact: e.artifact ?? null,
      next_owner: (e.handoff_to ?? [])[0] ?? null,
      duration_ms: e.duration_ms ?? null,
      blocking_issues: e.blocking_issues ?? [],
    }));
    sidecar.failed_agent_count = runLedger.failed_count ?? 0;
    sidecar.agent_count        = runLedger.agent_count  ?? 0;
  }

  const validationErrors = validateSidecar(sidecar);
  if (validationErrors.length) console.warn('Streamline Report validation warnings:', validationErrors.join('; '));

  const note = buildStreamlineNote({
    data,
    since,
    windowDays,
    limit,
    status,
    signals,
    cadence,
    focus: focusKey,
    includeInteractions,
    newSince: sidecar.new_since_last_report,
    resolvedSince: sidecar.resolved_since_last_report,
  });

  const filePath = join(getPullsDir(), 'Orchestrator', dateStampedFilename('Streamline_Report'));

  if (flags['dry-run']) {
    console.log(note);
  } else {
    writeNote(filePath, note);
    await emitSidecar(sidecar);
    console.log(`Wrote: ${filePath}`);
  }

  const result = {
    filePath: flags['dry-run'] ? null : filePath,
    signalStatus: status,
    activeReviewItems: data.reviewQueue.length,
    coverageGaps: data.coverageRows.filter(row => row.status === 'gap').length,
    newSinceLastReport: sidecar.new_since_last_report,
    resolvedSinceLastReport: sidecar.resolved_since_last_report,
  };

  if (flags.json) console.log(JSON.stringify(result, null, 2));
  return result;
}

async function loadReportData({ since, limit, positioningSidecar = null }) {
  const pullsDir = getPullsDir();
  const pullNotes = [];

  for (const domain of PULL_DOMAINS) {
    const notes = await readFolder(join(pullsDir, domain), false);
    for (const note of notes) {
      if (note.data?.data_type === 'streamline_report') continue;
      pullNotes.push({ ...note, pullDomain: domain });
    }
  }

  const signalNotes = existsSync(getSignalsDir())
    ? (await readFolder(getSignalsDir(), false)).map(note => ({ ...note, pullDomain: 'Signals' }))
    : [];

  const recentPulls = pullNotes.filter(note => noteDate(note) >= since);
  const recentSignals = signalNotes.filter(note => noteDate(note) >= since);
  const notAcked = note => !['reviewed', 'ignored'].includes(note.data?.ack_status);
  const activePulls = recentPulls.filter(note => isActiveStatus(note.data?.signal_status) && notAcked(note));
  const activeSignalNotes = recentSignals.filter(note => isActiveStatus(note.data?.signal_status) && notAcked(note));

  const reviewQueue = [...activePulls, ...activeSignalNotes]
    .sort(compareSignalNotes)
    .slice(0, limit);

  const latestTechnicals = latestBy(
    pullNotes.filter(note => note.data?.data_type === 'technical_snapshot'),
    note => normalizeSymbol(note.data?.symbol)
  ).slice(0, limit);

  const latestAgents = latestBy(
    pullNotes.filter(note => note.data?.data_type === 'agent_analysis'),
    note => normalizeSymbol(note.data?.symbol)
  ).slice(0, limit);

  const agentRollup = latestNote(pullNotes.filter(note => note.data?.data_type === 'agent_analysis_rollup'));
  const opportunityViewpoints = latestNote(pullNotes.filter(note => note.data?.data_type === 'opportunity_viewpoints'));
  const earningsCalendar = latestNote(pullNotes.filter(note => note.data?.data_type === 'calendar'));
  const macroCalendar = latestNote(pullNotes.filter(note => note.data?.data_type === 'economic_calendar'));
  const latestGdelt = latestNote(pullNotes.filter(note => note.data?.data_type === 'gdelt_news_monitor'));
  const entropyMonitor = latestNote(pullNotes.filter(note => note.data?.data_type === 'entropy_monitor'));
  const orbScreen = latestNote(pullNotes.filter(note =>
    note.data?.data_type === 'screen' &&
    String(note.data?.title || note.filename).toLowerCase().includes('orb')
  ));

  const watchlistReports = latestBy(
    pullNotes.filter(note => note.data?.data_type === 'watchlist_report'),
    note => String(note.data?.thesis || note.data?.watchlist || note.filename)
  ).slice(0, 8);

  const fullPictureReports = latestBy(
    pullNotes.filter(note => note.data?.data_type === 'full_picture_report'),
    note => String(note.data?.thesis_name || note.filename)
  ).slice(0, 8);

  const pairNotes = pullNotes.filter(note =>
    ['pair_metrics', 'pairs_report', 'relative_value_report', 'pair_analysis'].includes(String(note.data?.data_type || '')) ||
    note.data?.raw_data?.z_60 != null
  );
  const auctionNotes = pullNotes.filter(note =>
    ['auction_features', 'auction_report', 'auction_analysis'].includes(String(note.data?.data_type || '')) ||
    note.data?.raw_data?.auction_state != null
  );
  const optionsNotes = pullNotes.filter(note =>
    ['options_review', 'options_analysis'].includes(String(note.data?.data_type || '')) ||
    String(note.data?.data_type || '').includes('options') ||
    String(note.data?.title || '').toLowerCase().includes('options')
  );
  const cashFlowNotes = pullNotes.filter(note =>
    ['cash_flow', 'balance_sheet', 'watchlist_deep_scan', 'cfq_analysis'].includes(String(note.data?.data_type || '')) ||
    String(note.data?.title || '').toLowerCase().includes('cash flow') ||
    note.data?.raw_data?.cfq_score != null
  );
  const peadNotes = pullNotes.filter(note =>
    String(note.data?.data_type || '').includes('pead') ||
    String(note.data?.title || '').toLowerCase().includes('earnings drift') ||
    note.data?.raw_data?.pead_label != null
  );
  const journalNotes = pullNotes.filter(note =>
    ['signal_review', 'signal_tracker', 'entropy_backtest', 'outcome_review'].includes(String(note.data?.data_type || '')) ||
    String(note.data?.title || '').toLowerCase().includes('journal')
  );

  const regime = classifyRegime({ reviewQueue, entropyMonitor, macroCalendar, earningsCalendar });
  const coverageRows = buildCoverageRows({
    latestTechnicals,
    watchlistReports,
    auctionNotes,
    orbScreen,
    agentRollup,
    opportunityViewpoints,
    peadNotes,
    cashFlowNotes,
    pairNotes,
    macroCalendar,
    latestGdelt,
    entropyMonitor,
    optionsNotes,
    journalNotes,
    positioningSidecar,
  });

  return {
    pullNotes,
    recentPulls,
    signalNotes,
    recentSignals,
    reviewQueue,
    latestTechnicals,
    latestAgents,
    agentRollup,
    opportunityViewpoints,
    earningsCalendar,
    macroCalendar,
    entropyMonitor,
    orbScreen,
    watchlistReports,
    fullPictureReports,
    pairNotes,
    auctionNotes,
    optionsNotes,
    cashFlowNotes,
    peadNotes,
    journalNotes,
    positioningSidecar,
    regime,
    coverageRows,
  };
}

function buildStreamlineNote({ data, since, windowDays, limit, status, signals, cadence = 'daily', focus = 'all', includeInteractions = false, newSince = 0, resolvedSince = 0 }) {
  const quietDay = data.reviewQueue.length === 0;
  const reviewRows = data.reviewQueue.map(note => {
    const scores = scoreReviewItem(note);
    const evidenceCount = note.evidence_links?.length ?? 1;
    return [
      note.data?.signal_status || 'watch',
      scores.severity,
      noteTitle(note),
      note.pullDomain || note.data?.domain || 'N/A',
      noteDate(note),
      scores.freshness,
      scores.confidence,
      scores.coverage,
      scores.disposition,
      evidenceCount > 1 ? `${evidenceCount}` : '—',
      noteWikiLink(note),
    ];
  });

  const edgeRows = buildEdgeRows(data);
  const questionRows = buildDailyQuestionRows(data);
  const technicalRows = data.latestTechnicals.map(note => [
    normalizeSymbol(note.data?.symbol) || noteTitle(note),
    note.data?.technical_bias || 'mixed',
    formatNumber(note.data?.rsi14, 1),
    formatSignedPercent(note.data?.price_vs_sma50_pct),
    formatSignedPercent(note.data?.price_vs_sma200_pct),
    note.data?.signal_status || 'clear',
    noteWikiLink(note),
  ]);
  const agentRows = data.latestAgents.map(note => [
    normalizeSymbol(note.data?.symbol) || noteTitle(note),
    note.data?.final_verdict || 'N/A',
    formatConfidence(note.data?.final_confidence),
    formatEntropy(note.data?.entropy_level, note.data?.entropy_score),
    note.data?.signal_status || 'clear',
    noteWikiLink(note),
  ]);
  const positioningRows = buildPositioningRows(data.positioningSidecar);
  const agentInteractionRows = buildAgentInteractionRows(data.agentThreads || []);
  const catalystRows = buildCatalystRows(data);
  const manualRows = buildManualReviewRows(data, limit);
  const learningRows = buildLearningRows(data, limit);
  const sourceRows = buildSourceRows(data);

  const cadenceSections = buildCadenceSections({ data, cadence, since, signalQualityScores: data.signalQualityScores });

  return buildNote({
    frontmatter: {
      title: 'AI Agent Streamline Report',
      source: 'Vault Orchestrator',
      report_schema_version: 1,
      run_id: `orchestrator-${cadence}-${today()}`,
      date_pulled: today(),
      domain: 'orchestrator',
      data_type: 'streamline_report',
      frequency: 'daily',
      cadence,
      focus,
      signal_status: status,
      signals,
      report_window_days: windowDays,
      source_window_start: since,
      source_window_end: today(),
      report_since: since,
      active_review_count: data.reviewQueue.length,
      coverage_gap_count: data.coverageRows.filter(r => r.status === 'gap').length,
      new_since_last_report: newSince,
      resolved_since_last_report: resolvedSince,
      guide_source: '[[ai_agent_monitoring_data_pull_guide]]',
      tags: ['streamline-report', 'agent-monitoring', 'orchestrator', 'decision-support'],
    },
    sections: [
      ...cadenceSections,
      {
        heading: 'Executive Brief',
        content: quietDay
          ? buildQuietDayBrief(data)
          : [
            `- **Regime**: ${data.regime.label}. ${data.regime.reason}`,
            `- **Active review queue**: ${data.reviewQueue.length} item(s) since ${since}; worst status is ${status}.`,
            `- **Agent coordination**: ${data.agentRollup ? `${noteTitle(data.agentRollup)} is the latest rollup (${noteDate(data.agentRollup)}).` : 'No agent rollup found in the window; run the agent thesis scan for a fuller read.'}`,
            `- **Primary workflow**: ${recommendWorkflow(data)}`,
            `- **Guide gaps**: ${formatGapSummary(data.coverageRows)}`,
            focus !== 'all' ? `- **Focus filter**: showing ${focus} domain signals only.` : null,
            '- **Execution rail**: Research and manual review only. No broker-write action is generated by this report.',
          ].filter(Boolean).join('\n'),
      },
      {
        heading: 'Daily Operating Questions',
        content: buildTable(['Question', 'Current Read', 'Action'], questionRows),
      },
      {
        heading: 'Active Alerts And Review Queue',
        content: reviewRows.length
          ? buildTable(['Status', 'Severity', 'Item', 'Domain', 'Date', 'Freshness', 'Confidence', 'Coverage', 'Disposition', 'Evidence', 'Note'], reviewRows)
          : '_No active alert, watch, or critical pull notes found in the report window._',
      },
      {
        heading: 'Edge And Strategy Map',
        content: buildTable(['Edge Type', 'Strategy Family', 'Status', 'Evidence'], edgeRows),
      },
      {
        heading: 'Technical And Auction Proxies',
        content: technicalRows.length
          ? buildTable(['Symbol', 'Bias', 'RSI', 'vs 50D', 'vs 200D', 'Status', 'Note'], technicalRows)
          : '_No FMP technical snapshots found. Run `node run.mjs pull fmp --technical SPY` or thesis watchlists._',
      },
      {
        heading: 'Agent And Crowding Read',
        content: agentRows.length
          ? buildTable(['Symbol', 'Verdict', 'Confidence', 'Entropy', 'Status', 'Note'], agentRows)
          : '_No per-symbol agent analysis notes found. Run `node run.mjs pull agent-analyst --all-thesis --skip-llm`._',
      },
      {
        heading: 'Big Money Vs Retail Positioning',
        content: positioningRows.length
          ? buildTable(['Asset / Theme', 'Current Signal', 'Score', 'Confidence', 'Action', 'Evidence'], positioningRows)
          : '_No positioning report sidecar found. Run `node run.mjs pull positioning-report --symbols SPY,QQQ`._',
      },
      ...(includeInteractions ? [{
        heading: 'Agent Interactions',
        content: agentInteractionRows.length
          ? buildTable(['Topic', 'Status', 'Signal', 'Participants', 'Decision', 'Note'], agentInteractionRows)
          : '_No agent interaction threads found for today. Run `node run.mjs pull agent-run --interactions --skip-llm`._',
      }] : []),
      {
        heading: 'Catalyst And PEAD Watch',
        content: catalystRows.length
          ? buildTable(['Layer', 'Latest Read', 'Date', 'Status', 'Note'], catalystRows)
          : '_No catalyst, earnings calendar, or PEAD-style notes found._',
      },
      {
        heading: 'Manual Fidelity Review Queue',
        content: manualRows.length
          ? buildTable(['Candidate', 'Edge', 'Strategy', 'Why Review', 'Invalidation', 'Next Action'], manualRows)
          : '_No manual review candidates were promoted by the current signals._',
      },
      {
        heading: 'Deeper Learning Queue',
        content: learningRows.length
          ? buildTable(['Flagged Topic', 'Why It Matters', 'Resources', 'Next Study Action'], learningRows)
          : '_No educational follow-up topics were generated from the current report._',
      },
      {
        heading: 'Coverage Gaps From Guide',
        content: buildTable(['Module', 'Status', 'Current Evidence', 'Next Build Step'], data.coverageRows.map(row => [
          row.module,
          row.status,
          row.evidence,
          row.next,
        ])),
      },
      {
        heading: 'Journal Prompts',
        content: [
          '- Which alert was reviewed, ignored, or journaled today, and why?',
          '- Did the edge type match the actual evidence, or was it only a vague narrative?',
          '- What manual liquidity or options-chain check blocked an idea?',
          '- Which signal would have invalidated the strongest setup before entry?',
          '- Which missing module caused the most uncertainty in this report?',
        ].join('\n'),
      },
      {
        heading: 'Source Notes',
        content: buildTable(['Layer', 'Latest Note', 'Date', 'Status'], sourceRows),
      },
    ],
  });
}

// ─── Phase 2: Sidecar data contract ──────────────────────────────────────────

function buildSidecar({ data, status, cadence, focus, since, windowDays, signals }) {
  const reviewItems = data.reviewQueue.map(note => {
    const scores = scoreReviewItem(note);
    const edge = classifyEdge(note);
    return {
      title: noteTitle(note),
      domain: note.pullDomain || note.data?.domain || 'N/A',
      date: noteDate(note),
      signal_status: note.data?.signal_status || 'watch',
      severity: scores.severity,
      freshness: scores.freshness,
      confidence: scores.confidence,
      coverage: scores.coverage,
      disposition: scores.disposition,
      edge_type: edge.edge_type,
      strategy_family: edge.strategy_family,
      invalidation: edge.invalidation,
      note_path: noteWikiLink(note),
      signals: normalizeSignalList(note.data?.signals).slice(0, 8),
      evidence_count: note.evidence_links?.length ?? 1,
    };
  });

  const coverageItems = data.coverageRows.map(row => ({
    module: row.module,
    status: row.status,
    evidence: row.evidence,
    next: row.next,
  }));

  const sourceInputs = [
    data.agentRollup && { layer: 'Agent rollup', note_path: noteWikiLink(data.agentRollup), date: noteDate(data.agentRollup), signal_status: data.agentRollup.data?.signal_status || 'clear' },
    data.opportunityViewpoints && { layer: 'Opportunity viewpoints', note_path: noteWikiLink(data.opportunityViewpoints), date: noteDate(data.opportunityViewpoints), signal_status: data.opportunityViewpoints.data?.signal_status || 'clear' },
    data.entropyMonitor && { layer: 'Entropy monitor', note_path: noteWikiLink(data.entropyMonitor), date: noteDate(data.entropyMonitor), signal_status: data.entropyMonitor.data?.signal_status || 'clear' },
    data.latestGdelt && { layer: 'GDELT news monitor', note_path: noteWikiLink(data.latestGdelt), date: noteDate(data.latestGdelt), signal_status: data.latestGdelt.data?.signal_status || 'clear' },
    data.orbScreen && { layer: 'ORB/auction proxy', note_path: noteWikiLink(data.orbScreen), date: noteDate(data.orbScreen), signal_status: data.orbScreen.data?.signal_status || 'clear' },
    data.earningsCalendar && { layer: 'Earnings calendar', note_path: noteWikiLink(data.earningsCalendar), date: noteDate(data.earningsCalendar), signal_status: data.earningsCalendar.data?.signal_status || 'clear' },
    data.macroCalendar && { layer: 'Macro calendar', note_path: noteWikiLink(data.macroCalendar), date: noteDate(data.macroCalendar), signal_status: data.macroCalendar.data?.signal_status || 'clear' },
    data.positioningSidecar && { layer: 'Positioning report', note_path: data.positioningSidecar.report_note ?? null, date: data.positioningSidecar.date, signal_status: data.positioningSidecar.signal_status || 'clear' },
  ].filter(Boolean);

  return {
    schema_version: 1,
    run_id: `orchestrator-${cadence}-${today()}`,
    date: today(),
    cadence,
    focus,
    signal_status: status,
    active_review_count: reviewItems.length,
    coverage_gap_count: coverageItems.filter(r => r.status === 'gap').length,
    source_window_start: since,
    source_window_end: today(),
    new_since_last_report: 0,
    resolved_since_last_report: 0,
    signals,
    review_items: reviewItems,
    coverage_items: coverageItems,
    source_inputs: sourceInputs,
    changed_items: { new: [], resolved: [] },
    agent_handoffs: [],
    agent_threads: (data.agentThreads || []).map(thread => ({
      thread_id: thread.thread_id,
      topic: thread.topic,
      status: thread.status,
      signal_status: thread.signal_status,
      participants: thread.participants || [],
      decision_type: thread.decision?.decision_type || null,
      decision_status: thread.decision?.status || thread.status,
      note_path: thread.note_path || null,
    })),
    positioning: data.positioningSidecar ? {
      date: data.positioningSidecar.date,
      signal_status: data.positioningSidecar.signal_status ?? 'clear',
      confidence: data.positioningSidecar.confidence ?? 'Low',
      signal_count: data.positioningSidecar.signal_count ?? 0,
      report_note: data.positioningSidecar.report_note ?? null,
      top_signals: (data.positioningSidecar.signals ?? []).slice(0, 8).map(signal => ({
        asset: signal.asset,
        relationship: signal.relationship,
        score: signal.score,
        confidence: signal.confidence,
        action_classification: signal.action_classification,
      })),
    } : null,
    agent_count: 0,
    failed_agent_count: 0,
  };
}

function computeChangedItems(currentItems, previousItems) {
  const prevPaths = new Set(previousItems.map(item => item.note_path));
  const currPaths = new Set(currentItems.map(item => item.note_path));
  return {
    new: currentItems.filter(item => !prevPaths.has(item.note_path)),
    resolved: previousItems.filter(item => !currPaths.has(item.note_path)),
  };
}

async function emitSidecar(sidecar) {
  await mkdir(SIDECAR_DIR, { recursive: true });
  await writeFile(join(SIDECAR_DIR, `${sidecar.date}.json`), JSON.stringify(sidecar, null, 2), 'utf-8');
}

async function loadPreviousSidecar() {
  if (!existsSync(SIDECAR_DIR)) return null;
  let files;
  try {
    files = (await readdir(SIDECAR_DIR))
      .filter(f => f.endsWith('.json') && f.slice(0, 10) < today())
      .sort()
      .reverse();
  } catch { return null; }
  if (!files.length) return null;
  try {
    const content = await readFile(join(SIDECAR_DIR, files[0]), 'utf-8');
    return JSON.parse(content);
  } catch { return null; }
}

function validateSidecar(sidecar) {
  const errors = [];
  if (sidecar.schema_version !== 1) errors.push('schema_version must be 1');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(sidecar.date)) errors.push('date must be YYYY-MM-DD');
  if (!['clear', 'watch', 'alert', 'critical'].includes(sidecar.signal_status)) errors.push('invalid signal_status');
  if (!Array.isArray(sidecar.review_items)) errors.push('review_items must be an array');
  if (!Array.isArray(sidecar.coverage_items)) errors.push('coverage_items must be an array');
  if (sidecar.agent_threads && !Array.isArray(sidecar.agent_threads)) errors.push('agent_threads must be an array');
  if (!sidecar.run_id) errors.push('run_id is required');
  return errors;
}

// ─── Phase 3: Strategy-to-edge classifier ────────────────────────────────────

function classifyEdge(note) {
  const signals = normalizeSignalList(note.data?.signals);
  const domain = String(note.pullDomain || note.data?.domain || '').toLowerCase();
  const dataType = String(note.data?.data_type || '').toLowerCase();
  const title = String(note.data?.title || note.filename || '').toLowerCase();

  if (signals.some(s => /dilution|shelf|offering|unregistered_sale/i.test(s)) ||
      title.includes('dilution') || title.includes('shelf')) {
    return { edge_type: 'fundamental quality', strategy_family: 'dilution / capital raise risk', invalidation: 'Dilution concern resolves, share count stabilizes, or cash runway confirmed.' };
  }
  if (signals.some(s => /^ORB_/i.test(s))) {
    return { edge_type: 'execution / auction', strategy_family: 'opening range breakout', invalidation: 'Price returns inside the opening range or volume participation collapses.' };
  }
  if (signals.some(s => /entropy/i.test(s)) || dataType.includes('entropy')) {
    return { edge_type: 'crowding / agent monoculture', strategy_family: 'entropy compression watch', invalidation: 'Entropy normalizes above prior baseline or breakout confirms with volume.' };
  }
  if (dataType.includes('pead') || dataType.includes('catalyst') ||
      title.includes('earnings drift') || title.includes('post-earnings')) {
    return { edge_type: 'behavioral / information', strategy_family: 'post-earnings anomaly', invalidation: 'Catalyst date passes without confirmation or earnings drift reverses.' };
  }
  if (dataType.includes('technical') || signals.some(s => /RSI|SMA|technical/i.test(s))) {
    return { edge_type: 'execution / auction', strategy_family: 'technical momentum', invalidation: 'Price loses cited moving-average support or signal flips to clear.' };
  }
  if (domain === 'macro' || domain === 'government' || domain === 'climate') {
    return { edge_type: 'macro-volatility / structural', strategy_family: 'macro regime shift', invalidation: 'Macro regime stabilizes, stress indicator reverses, or policy guidance changes.' };
  }
  if (domain === 'biotech') {
    return { edge_type: 'behavioral / information', strategy_family: 'regulatory catalyst', invalidation: 'FDA decision passes, trial result published, or timeline shifts.' };
  }
  if (domain === 'news' || domain === 'osint') {
    return { edge_type: 'behavioral / information', strategy_family: 'narrative / headline momentum', invalidation: 'Story fades, source quality degrades, or cross-source confirmation fails.' };
  }
  if (domain === 'theses' || domain === 'research' || domain === 'fundamentals') {
    return { edge_type: 'fundamental quality', strategy_family: 'quality earnings drift', invalidation: 'Thesis score deteriorates or core invalidation conditions are met.' };
  }
  if (dataType.includes('pair') || signals.some(s => /pair|spread/i.test(s))) {
    return { edge_type: 'statistical / relative value', strategy_family: 'pair mean reversion', invalidation: 'Pair relationship breaks structurally or correlation drops below threshold.' };
  }
  return { edge_type: 'review required', strategy_family: 'unclassified', invalidation: 'The cited signal clears, fails confirmation, or contradicting evidence appears.' };
}

function applyFocusFilter(queue, focusKey) {
  const allowed = FOCUS_DOMAINS[focusKey];
  if (!allowed) return queue;
  return queue.filter(note => allowed.includes(note.pullDomain));
}

function canonicalTopicKey(note) {
  const signals = normalizeSignalList(note.data?.signals);
  for (const signal of signals) {
    const parts = signal.split('_');
    for (let i = parts.length - 1; i >= 0; i -= 1) {
      const candidate = parts[i];
      if (/^[A-Z][A-Z0-9.-]{0,9}$/.test(candidate) && candidate.length >= 2) {
        return `ticker:${candidate}`;
      }
    }
  }
  const symbol = normalizeSymbol(note.data?.symbol || note.data?.ticker);
  if (symbol) return `ticker:${symbol}`;
  const thesis = String(note.data?.thesis_name || note.data?.thesis || '').trim();
  if (thesis) return `thesis:${slugify(thesis)}`;
  const firstSignal = signals[0];
  if (firstSignal) return `signal:${firstSignal}`;
  return `file:${note.filename}`;
}

function deduplicateReviewQueue(notes) {
  const groups = new Map();
  for (const note of notes) {
    const key = canonicalTopicKey(note);
    if (!groups.has(key)) {
      groups.set(key, {
        primary: note,
        allSignals: [...normalizeSignalList(note.data?.signals)],
        evidenceFilenames: [note.filename],
      });
      continue;
    }
    const group = groups.get(key);
    group.allSignals.push(...normalizeSignalList(note.data?.signals));
    group.evidenceFilenames.push(note.filename);
  }
  return Array.from(groups.values()).map(({ primary, allSignals, evidenceFilenames }) => ({
    ...primary,
    data: { ...primary.data, signals: unique(allSignals) },
    evidence_links: evidenceFilenames,
  }));
}

// Phase 5: cap review items from low-quality modules to 2 (highest severity first).
// Mutates `applied` to record which modules were capped for logging.
function applySignalDowngrade(queue, scores, applied) {
  if (!scores || !Object.keys(scores).length) return queue;

  // Map data_type → module id for lookup
  const dataTypeToModule = {};
  for (const [id, s] of Object.entries(scores)) {
    if (s.low_quality) dataTypeToModule[id] = id;
  }
  if (!Object.keys(dataTypeToModule).length) return queue;

  const capPerModule = 2;
  const seen = {};
  const result = [];

  for (const note of queue) {
    const dt = String(note.data?.data_type || '');
    const modId = dataTypeToModule[dt];
    if (!modId) {
      result.push(note);
      continue;
    }
    seen[modId] = (seen[modId] ?? 0) + 1;
    if (seen[modId] <= capPerModule) {
      // Tag the note so the table can show the cap warning
      result.push({
        ...note,
        data: { ...note.data, _downgrade_cap: `⚠️ Module score low — showing top ${capPerModule} only` },
      });
      applied[modId] = true;
    }
  }

  return result;
}

function daysBetween(dateA, dateB) {
  const a = new Date(`${dateA}T00:00:00`);
  const b = new Date(`${dateB}T00:00:00`);
  return Math.max(0, Math.round((a - b) / (1000 * 60 * 60 * 24)));
}

function scoreReviewItem(note) {
  const status = String(note.data?.signal_status || 'watch').toLowerCase();
  const severity = { critical: 'HIGH', alert: 'MED', watch: 'LOW', clear: '—' }[status] ?? 'LOW';

  const pullDate = noteDate(note);
  const age = daysBetween(today(), pullDate);
  const freshness = age <= 3 ? 'Fresh' : age <= 7 ? 'Aging' : 'Stale';

  const rawConfidence = note.data?.final_confidence ?? note.data?.confidence ?? null;
  let confidence;
  if (rawConfidence != null) {
    const pct = Number(rawConfidence);
    confidence = Number.isFinite(pct) ? `${Math.round(pct <= 1 ? pct * 100 : pct)}%` : '50%';
  } else {
    confidence = '50%';
  }

  const moduleFields = [
    note.data?.crowding_score != null,
    note.data?.auction_state != null || note.data?.auction_bias != null,
    note.data?.pead_label != null || note.data?.earnings_surprise != null,
    note.data?.cfq_score != null || note.data?.fcf_conversion != null,
  ];
  const coverage = `${moduleFields.filter(Boolean).length}/4`;

  const disposition = {
    critical: 'Manual Broker Check',
    alert: 'Review',
    watch: 'Journal',
    clear: 'No Action',
  }[status] ?? 'Journal';

  return { severity, freshness, confidence, coverage, disposition };
}

function buildQuietDayBrief(data) {
  const gapModules = data.coverageRows.filter(r => r.status === 'gap').map(r => r.module);
  return [
    '> **Quiet Day** — No active alert, watch, or critical items in the report window.',
    '',
    `- **Build gaps**: ${gapModules.length ? gapModules.slice(0, 4).join(', ') + (gapModules.length > 4 ? ` (+${gapModules.length - 4} more)` : '') : 'none detected'}.`,
    '- **Suggested action**: Run daily pulls, fill module gaps, or study the learning queue.',
    '- **Execution rail**: Research and manual review only. No broker-write action is generated by this report.',
  ].join('\n');
}

function buildCadenceSections({ data, cadence, since, signalQualityScores = {} }) {
  if (cadence === 'weekly' || cadence === 'monthly') {
    const alertCount    = data.recentPulls.filter(n => n.data?.signal_status === 'alert').length;
    const watchCount    = data.recentPulls.filter(n => n.data?.signal_status === 'watch').length;
    const criticalCount = data.recentPulls.filter(n => n.data?.signal_status === 'critical').length;
    const gapCount      = data.coverageRows.filter(r => r.status === 'gap').length;
    const sections = [{
      heading: 'Trend Summary',
      content: [
        `- **Period**: ${cadence.charAt(0).toUpperCase() + cadence.slice(1)} review since ${since}.`,
        `- **Signal breakdown**: ${criticalCount} critical, ${alertCount} alert, ${watchCount} watch across all pull notes in window.`,
        `- **Active review queue**: ${data.reviewQueue.length} deduplicated item(s) after focus filter.`,
        `- **Coverage gaps**: ${gapCount} guide module(s) still missing.`,
      ].join('\n'),
    }];
    // Phase 5: weekly scorecard from signal quality engine
    const scorecardContent = buildScorecardContent(signalQualityScores);
    sections.push({ heading: 'Module Scorecards (30-day window)', content: scorecardContent });
    return sections;
  }
  if (cadence === 'quarterly' || cadence === 'yearly') {
    return [{
      heading: 'Scorecard',
      content: buildScorecardContent(signalQualityScores),
    }];
  }
  return [];
}

function buildScorecardContent(scores) {
  const entries = Object.entries(scores ?? {});
  if (!entries.length) {
    return '_No signal quality data found. Run `node run.mjs pull signal-quality-scan` to generate module scores._';
  }
  const rows = entries
    .sort(([, a], [, b]) => b.composite_score - a.composite_score)
    .map(([id, s]) => {
      const status = s.low_quality ? '🔴 low quality' : s.composite_score >= 0.6 ? '✅ reliable' : '⚠️ watch';
      return [
        id,
        `${Math.round(s.composite_score * 100)}%`,
        `${Math.round(s.hit_rate       * 100)}%`,
        `${Math.round(s.noise_rate     * 100)}%`,
        `${Math.round(s.reliability_score * 100)}%`,
        `${Math.round(s.freshness_score   * 100)}%`,
        status,
      ];
    });
  return buildTable(['Module', 'Composite', 'Hit Rate', 'Noise', 'Reliability', 'Freshness', 'Status'], rows);
}

function buildDailyQuestionRows(data) {
  const activeAssets = extractReviewAssets(data.reviewQueue).slice(0, 8);
  const edgeSummary = buildEdgeRows(data)
    .filter(row => row[2] !== 'gap')
    .map(row => row[0])
    .slice(0, 4)
    .join(', ') || 'none promoted';
  const strategySummary = buildEdgeRows(data)
    .filter(row => row[2] !== 'gap')
    .map(row => row[1])
    .slice(0, 4)
    .join(', ') || 'review only';

  return [
    ['What regime are we in?', `${data.regime.label}: ${data.regime.reason}`, data.regime.action],
    ['Which edge types are active?', edgeSummary, 'Tag any reviewed alert with one explicit edge type.'],
    ['Which strategy families fit?', strategySummary, 'Keep strategy expression separate from the signal.'],
    ['What assets or pairs show signals?', activeAssets.length ? activeAssets.join(', ') : 'No active assets/pairs promoted by recent signals.', data.pairNotes.length ? 'Check pair note status before assuming reversion.' : 'Pair engine is not live; do not infer pair signals.'],
    ['Is price at a meaningful auction location?', data.auctionNotes.length ? 'Auction notes exist.' : data.orbScreen ? 'Partial: ORB/entropy proxy exists, but full POC/VAH/VAL/AVWAP is not live.' : 'Unknown: no auction feature note found.', 'Use manual chart/profile review before acting on auction claims.'],
    ['Is there a catalyst?', data.earningsCalendar || data.macroCalendar ? 'Calendar layer is present.' : 'No current calendar note found.', 'Check earnings, macro events, SEC filings, and headline risk.'],
    ['Is expression liquid and allowed?', data.optionsNotes.length ? 'Options reference notes exist, but broker checks remain manual.' : 'Manual Fidelity review required; no automated options liquidity approval.', 'Check bid/ask, OI, volume, event dates, max loss, and permission level.'],
    ['Is the idea crowded?', data.latestAgents.some(note => note.data?.entropy_level) ? 'Agent entropy is available for latest analyzed symbols.' : 'Crowding is not fully scored without agent analysis and options/social context.', 'Downgrade crowded narratives unless confirmation improves.'],
    ['What proves the thesis wrong?', 'Use alert-specific invalidation plus thesis invalidation triggers.', 'Write one disconfirming condition before any manual action.'],
    ['Review, ignore, or journal?', data.reviewQueue.length ? 'Review top queue items; journal the decision or non-decision.' : 'No urgent queue; maintain watchlists and fill module gaps.', 'Record outcome for weekly false-positive review.'],
  ];
}

function buildEdgeRows(data) {
  const macroActive = data.reviewQueue.some(note => ['Macro', 'Market'].includes(note.pullDomain)) || data.macroCalendar || data.entropyMonitor;
  const catalystActive = data.earningsCalendar || data.reviewQueue.some(note =>
    ['calendar', 'catalyst_note', '8k_filings'].includes(String(note.data?.data_type || ''))
  );
  const agentActive = data.latestAgents.length > 0 || data.agentRollup;
  const technicalActive = data.latestTechnicals.length > 0 || data.orbScreen;
  const qualityActive = data.cashFlowNotes.length > 0 || data.watchlistReports.length > 0;

  return [
    [
      'macro-volatility / structural',
      'macro regime and risk-off/risk-on channel',
      macroActive ? 'active' : 'gap',
      data.macroCalendar ? noteWikiLink(data.macroCalendar) : data.entropyMonitor ? noteWikiLink(data.entropyMonitor) : 'Need macro calendar, stress, credit, and rate proxy notes.',
    ],
    [
      'execution / auction',
      'auction entry monitor and opening range review',
      data.auctionNotes.length ? 'active' : data.orbScreen ? 'partial' : 'gap',
      data.auctionNotes.length ? `${data.auctionNotes.length} auction note(s)` : data.orbScreen ? noteWikiLink(data.orbScreen) : 'Need POC, VAH, VAL, TPO, and anchored VWAP features.',
    ],
    [
      'behavioral / information',
      'PEAD, catalyst, and anomaly review',
      catalystActive ? 'partial' : 'gap',
      data.earningsCalendar ? noteWikiLink(data.earningsCalendar) : 'Need earnings surprise, post-event AVWAP, and drift scoring.',
    ],
    [
      'statistical / relative value',
      'pair mean reversion and relationship breaks',
      data.pairNotes.length ? 'active' : 'gap',
      data.pairNotes.length ? `${data.pairNotes.length} pair note(s)` : 'Need pair ratios, z-scores, correlations, and relationship status.',
    ],
    [
      'fundamental quality',
      'cash-flow quality and quality earnings drift',
      qualityActive ? 'partial' : 'gap',
      data.cashFlowNotes.length ? `${data.cashFlowNotes.length} cash-flow/fundamental note(s)` : data.watchlistReports.length ? 'Watchlist fundamentals are present.' : 'Need FCF conversion, balance sheet, margin stability, and share count scoring.',
    ],
    [
      'crowding / agent monoculture',
      'agent entropy and narrative crowding risk',
      agentActive ? 'partial' : 'gap',
      data.agentRollup ? noteWikiLink(data.agentRollup) : 'Need agent rollups plus social/options crowding inputs.',
    ],
    [
      'positioning divergence',
      'big money vs retail positioning',
      data.positioningSidecar ? 'partial' : 'gap',
      data.positioningSidecar ? `${data.positioningSidecar.signal_count ?? 0} positioning signal(s) from ${data.positioningSidecar.date}` : 'Need positioning report sidecar and source notes.',
    ],
    [
      'manual execution quality',
      'options review assistant',
      data.optionsNotes.length ? 'partial' : 'gap',
      data.optionsNotes.length ? `${data.optionsNotes.length} options note(s)` : 'Need bid/ask, OI, volume, IV, assignment, and event-date checklist.',
    ],
  ];
}

function buildCatalystRows(data) {
  return [
    data.earningsCalendar ? ['Earnings calendar', noteTitle(data.earningsCalendar), noteDate(data.earningsCalendar), data.earningsCalendar.data?.signal_status || 'clear', noteWikiLink(data.earningsCalendar)] : null,
    data.latestGdelt ? ['GDELT headline radar', noteTitle(data.latestGdelt), noteDate(data.latestGdelt), data.latestGdelt.data?.signal_status || 'clear', noteWikiLink(data.latestGdelt)] : null,
    data.macroCalendar ? ['Macro calendar', noteTitle(data.macroCalendar), noteDate(data.macroCalendar), data.macroCalendar.data?.signal_status || 'clear', noteWikiLink(data.macroCalendar)] : null,
    data.opportunityViewpoints ? ['Opportunity viewpoints', noteTitle(data.opportunityViewpoints), noteDate(data.opportunityViewpoints), data.opportunityViewpoints.data?.signal_status || 'clear', noteWikiLink(data.opportunityViewpoints)] : null,
    data.fullPictureReports[0] ? ['Thesis full picture', `${data.fullPictureReports.length} latest thesis report(s)`, noteDate(data.fullPictureReports[0]), data.fullPictureReports[0].data?.signal_status || 'clear', noteWikiLink(data.fullPictureReports[0])] : null,
    data.peadNotes[0] ? ['PEAD / drift', `${data.peadNotes.length} note(s)`, noteDate(latestNote(data.peadNotes)), latestNote(data.peadNotes).data?.signal_status || 'clear', noteWikiLink(latestNote(data.peadNotes))] : null,
  ].filter(Boolean);
}

function buildManualReviewRows(data, limit) {
  const rows = [];

  for (const note of data.reviewQueue.slice(0, limit)) {
    const candidate = primaryCandidateLabel(note);
    const edge = classifyEdge(note);
    rows.push([
      candidate,
      edge.edge_type,
      edge.strategy_family,
      `${note.data?.signal_status || 'watch'} from ${note.pullDomain || note.data?.domain || 'vault'}`,
      edge.invalidation,
      'Review or journal; no automated execution.',
    ]);
  }

  for (const note of data.latestAgents.filter(n => isActiveStatus(n.data?.signal_status)).slice(0, limit)) {
    const candidate = normalizeSymbol(note.data?.symbol) || noteTitle(note);
    if (rows.some(row => row[0] === candidate)) continue;
    const edge = classifyEdge(note);
    rows.push([
      candidate,
      edge.edge_type,
      edge.strategy_family,
      note.data?.final_verdict || 'Agent signal requires review.',
      'Agent confidence or entropy deteriorates, price loses trend support, or catalyst changes.',
      'Promote to ticker card only after manual checks.',
    ]);
  }

  return rows.slice(0, limit);
}

function buildLearningRows(data, limit) {
  const rows = new Map();
  const add = (key, why, resources, action) => {
    const normalized = String(key || '').trim();
    if (!normalized || rows.has(normalized.toLowerCase())) return;
    rows.set(normalized.toLowerCase(), [
      normalized,
      why,
      resources.filter(Boolean).join('<br>'),
      action,
    ]);
  };

  for (const note of data.reviewQueue) {
    const title = noteTitle(note);
    const dataType = String(note.data?.data_type || '').toLowerCase();
    const pullDomain = String(note.pullDomain || note.data?.domain || '').toLowerCase();
    const candidate = primaryCandidateLabel(note);
    const symbol = normalizeSymbol(note.data?.symbol || note.data?.ticker || candidate);

    if (symbol) {
      add(
        `${symbol} source reading`,
        `Flagged by ${note.data?.signal_status || 'watch'} ${note.pullDomain || 'vault'} evidence.`,
        [
          noteWikiLink(note),
          secCompanyResource(symbol),
          'Read the latest 10-K/10-Q risk factors, MD&A, liquidity, debt, and share-count sections.',
        ],
        'Create or update a ticker card with one bull case, one bear case, and one invalidation trigger.'
      );
    }

    if (titleMatch(title, ['FEMA', 'disaster', 'OpenFEMA'])) {
      add(
        'Disaster economics and insurance risk',
        'Disaster declaration spikes can transmit into housing, insurance, utilities, rebuilding demand, and municipal budgets.',
        [
          noteWikiLink(note),
          externalLink('OpenFEMA data sets', 'https://www.fema.gov/openfema-data-page/disaster-declarations-summaries'),
          'Review affected states, incident type, and exposed theses before treating it as a tradable signal.',
        ],
        'Map first-order damage, second-order rebuilding demand, and third-order insurance/credit effects.'
      );
    }

    if (titleMatch(title, ['SEC', '8-K', 'EDGAR']) || pullDomain === 'government' && dataType.includes('8k')) {
      add(
        'EDGAR filing interpretation',
        'SEC filings are slower but higher-quality evidence than headlines when a company or thesis is flagged.',
        [
          noteWikiLink(note),
          externalLink('SEC EDGAR search', 'https://www.sec.gov/edgar/search/'),
          externalLink('SEC Form 8-K investor guide', 'https://www.sec.gov/files/form8-k.pdf'),
        ],
        'Read the filing item number first, then extract the event, counterparty, timing, and what would invalidate the story.'
      );
    }

    if (titleMatch(title, ['dilution', 'shelf', 'registered direct', 'offering']) || normalizeSignalList(note.data?.signals).some(signal => titleMatch(signal, ['shelf', 'unregistered_sale', 'dilution']))) {
      add(
        'Capital raising and dilution risk',
        'Dilution alerts can overwhelm otherwise attractive small-cap catalysts and should be rejected before story work.',
        [
          noteWikiLink(note),
          externalLink('SEC forms and filings reference', 'https://www.sec.gov/forms'),
          'Study S-3, 424B, 8-K Item 3.02, ATM programs, warrants, runway, and listing compliance.',
        ],
        'Confirm cash runway and active shelf/ATM capacity before promoting the ticker.'
      );
    }

    if (titleMatch(title, ['ORB', 'Entropy', 'Technical']) || dataType.includes('technical') || dataType.includes('entropy')) {
      add(
        'Auction, microstructure, and entropy',
        'Price-location and entropy flags need market-structure context before they become useful decisions.',
        [
          '[[ORB + Entropy Strategy Playbook]]',
          '[[Entropy Strategy Monitoring Cheat Sheet]]',
          '[[Entropy Levels for Agent Orchestration]]',
        ],
        'Compare the signal to VWAP, opening range, volume participation, and prior outcome notes.'
      );
    }

    if (titleMatch(title, ['News', 'GDELT']) || dataType === 'gdelt_news_monitor') {
      add(
        'News verification and narrative clustering',
        'Fast headlines are useful for awareness, but need source-quality and repetition checks before action.',
        [
          noteWikiLink(note),
          externalLink('GDELT DOC API docs', 'https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/'),
          'Compare with company releases, filings, Fed/government sources, and repeated independent domains.',
        ],
        'Group articles by claim, source domain, and thesis impact; ignore one-off weak-source headlines.'
      );
    }

    if (titleMatch(title, ['FDA', 'Clinical', 'trial', 'PubMed', 'drug'])) {
      add(
        'Clinical and regulatory catalyst reading',
        'Biotech/regulatory headlines require trial design, endpoint, safety, and approval-path context.',
        [
          noteWikiLink(note),
          externalLink('ClinicalTrials.gov', 'https://clinicaltrials.gov/'),
          externalLink('Drugs@FDA', 'https://www.accessdata.fda.gov/scripts/cder/daf/'),
          externalLink('PubMed', 'https://pubmed.ncbi.nlm.nih.gov/'),
        ],
        'Identify phase, endpoint, comparator, enrollment, sponsor language, and the next regulatory date.'
      );
    }

    if (titleMatch(title, ['FRED', 'Treasury', 'Fed', 'CPI', 'inflation', 'rates']) || pullDomain === 'macro') {
      add(
        'Macro regime reading',
        'Macro flags affect position sizing, signal confidence, credit channels, and sector rotation.',
        [
          noteWikiLink(note),
          externalLink('FRED', 'https://fred.stlouisfed.org/'),
          externalLink('Federal Reserve monetary policy', 'https://www.federalreserve.gov/monetarypolicy.htm'),
          externalLink('Treasury Fiscal Data', 'https://fiscaldata.treasury.gov/'),
        ],
        'Write a three-step transmission map: rates/credit/liquidity -> sectors -> thesis impact.'
      );
    }
  }

  for (const row of data.coverageRows.filter(item => item.status === 'gap' || item.status === 'partial')) {
    const module = row.module;
    if (module.includes('Strategy-to-edge')) {
      add(
        'Behavioral finance and edge taxonomy',
        'The report needs every signal tagged as behavioral, structural, statistical, information, execution, risk-premium, or crowding.',
        [
          '[[Reading Modes]]',
          externalLink('AQR research library', 'https://www.aqr.com/Insights/Research'),
          'Study post-event drift, momentum, value, quality, carry, and crowding as distinct edge families.',
        ],
        'Define one local edge taxonomy note and require each alert to choose one primary edge type.'
      );
    }
    if (module.includes('Pair')) {
      add(
        'Pairs and relative-value statistics',
        'Pair signals require z-scores, correlation stability, beta, and relationship-break awareness.',
        [
          externalLink('Pairs trading paper search', 'https://scholar.google.com/scholar?q=pairs+trading+distance+cointegration+Gatev+Goetzmann+Rouwenhorst'),
          'Review rolling z-score, rolling correlation, hedge ratio, half-life, and regime shift concepts.',
        ],
        'Build a small pair metrics note before treating any spread as mean-reverting.'
      );
    }
    if (module.includes('cash-flow')) {
      add(
        'Cash-flow quality and accruals',
        'Quality and PEAD reads need cash-flow conversion, accruals, balance-sheet durability, and share-count context.',
        [
          externalLink('Sloan accrual anomaly search', 'https://scholar.google.com/scholar?q=Sloan+1996+accrual+anomaly'),
          'Read cash flow statement, balance sheet, margins, CapEx, debt, and share-count trend.',
        ],
        'Add a cash-flow quality score before promoting quality earnings drift candidates.'
      );
    }
    if (module.includes('Options')) {
      add(
        'Options liquidity and risk mechanics',
        'Options expressions need manual spread, open interest, assignment, event, and max-loss checks.',
        [
          externalLink('Options Industry Council education', 'https://www.optionseducation.org/'),
          'Review bid/ask spread, OI, volume, IV, event dates, assignment risk, and expiration fit.',
        ],
        'Add a manual options checklist before any options candidate reaches the review queue.'
      );
    }
  }

  if (data.latestGdelt) {
    add(
      'Current headline radar',
      'GDELT is running as a fast source for topic discovery and cross-source confirmation.',
      [
        noteWikiLink(data.latestGdelt),
        externalLink('GDELT DOC API docs', 'https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/'),
      ],
      'Look for repeated claims across independent domains before promoting any headline.'
    );
  }

  return Array.from(rows.values()).slice(0, Math.max(6, limit));
}

function buildCoverageRows(data) {
  return [
    coverageRow('Read-only market dashboard', data.latestTechnicals.length && data.watchlistReports.length ? 'active' : 'partial', `${data.latestTechnicals.length} technical snapshot(s), ${data.watchlistReports.length} watchlist report(s)`, 'Keep daily FMP watchlist and technical pulls in the routine.'),
    coverageRow('Auction feature engine', data.auctionNotes.length ? 'active' : data.orbScreen ? 'partial' : 'gap', data.auctionNotes.length ? `${data.auctionNotes.length} auction note(s)` : data.orbScreen ? noteWikiLink(data.orbScreen) : 'No POC/VAH/VAL/AVWAP note found.', 'Add intraday profile, TPO, anchored VWAP, and auction state notes.'),
    coverageRow('Strategy-to-edge classifier', data.agentRollup || data.opportunityViewpoints ? 'partial' : 'gap', [data.agentRollup && noteWikiLink(data.agentRollup), data.opportunityViewpoints && noteWikiLink(data.opportunityViewpoints)].filter(Boolean).join(', ') || 'No classifier rollup found.', 'Persist edge_type and strategy_family on every alert card.'),
    coverageRow('Anomaly and cash-flow quality engine', data.peadNotes.length || data.cashFlowNotes.length ? 'partial' : 'gap', `${data.peadNotes.length} PEAD note(s), ${data.cashFlowNotes.length} cash-flow/fundamental note(s)`, 'Add earnings surprise, post-event AVWAP, FCF conversion, accrual, and quality scoring.'),
    coverageRow('Pair / relative-value engine', data.pairNotes.length ? 'active' : 'gap', data.pairNotes.length ? `${data.pairNotes.length} pair note(s)` : 'No pair metrics note found.', 'Add pair watchlist z-scores, correlations, beta, half-life, and relationship status.'),
    coverageRow('Macro volatility engine', data.macroCalendar || data.entropyMonitor ? 'partial' : 'gap', [data.macroCalendar && noteWikiLink(data.macroCalendar), data.entropyMonitor && noteWikiLink(data.entropyMonitor)].filter(Boolean).join(', ') || 'No macro calendar or stress note found.', 'Add OFR stress, credit/rate proxies, commodity channels, and shock labels.'),
    coverageRow('Big money vs retail positioning', data.positioningSidecar ? 'partial' : 'gap', data.positioningSidecar ? `${data.positioningSidecar.signal_count ?? 0} positioning signal(s) from ${data.positioningSidecar.date}` : 'No positioning report sidecar found.', 'Run positioning-report and add FMP institutional/ETF ownership plus retail-flow proxies.'),
    coverageRow('Options review assistant', data.optionsNotes.length ? 'partial' : 'on-demand', data.optionsNotes.length ? `${data.optionsNotes.length} options note(s)` : 'Run with --symbol TICKER; no checklist needed on days without candidates.', 'Add manual Fidelity fields for spread, OI, volume, IV, assignment, and max loss.'),
    coverageRow('Review and learning loop', data.journalNotes.length ? 'partial' : 'on-demand', data.journalNotes.length ? `${data.journalNotes.length} journal/outcome-review note(s)` : 'Weekly cadence; run outcome-review on Fridays or after position closes.', 'Add 5/20/60-day outcome review and false-positive tracking.'),
  ];
}

function coverageRow(module, status, evidence, next) {
  return { module, status, evidence, next };
}

function buildSourceRows(data) {
  const sourceNotes = [
    ['Agent rollup', data.agentRollup],
    ['Opportunity viewpoints', data.opportunityViewpoints],
    ['Entropy monitor', data.entropyMonitor],
    ['GDELT news monitor', data.latestGdelt],
    ['ORB/auction proxy', data.orbScreen],
    ['Earnings calendar', data.earningsCalendar],
    ['Macro calendar', data.macroCalendar],
    ['Watchlist report', data.watchlistReports[0]],
    ['Full picture report', data.fullPictureReports[0]],
  ];

  const rows = sourceNotes
    .filter(([, note]) => Boolean(note))
    .map(([layer, note]) => [
      layer,
      noteWikiLink(note),
      noteDate(note),
      note.data?.signal_status || 'clear',
    ]);

  if (data.positioningSidecar) {
    rows.push([
      'Positioning report',
      data.positioningSidecar.report_note ?? 'positioning sidecar',
      data.positioningSidecar.date ?? 'N/A',
      data.positioningSidecar.signal_status ?? 'clear',
    ]);
  }

  return rows;
}

function buildAgentInteractionRows(threads = []) {
  return threads.map(thread => [
    thread.topic || 'Agent interaction',
    thread.status || 'unresolved',
    thread.signal_status || 'watch',
    Array.isArray(thread.participants) ? thread.participants.join(', ') : 'N/A',
    thread.decision?.rationale || thread.decision?.decision_type || 'Review thread',
    threadWikiLink(thread),
  ]);
}

function buildPositioningRows(sidecar) {
  return (sidecar?.signals ?? []).slice(0, 8).map(signal => [
    signal.asset ?? 'N/A',
    signal.relationship ?? 'No clear signal',
    String(signal.score ?? 0),
    signal.confidence ?? 'Low',
    signal.action_classification ?? 'Watchlist only',
    (signal.source_notes ?? []).slice(0, 2).join(', ') || sidecar.report_note || 'sidecar',
  ]);
}

function classifyRegime({ reviewQueue, entropyMonitor, macroCalendar, earningsCalendar }) {
  const worst = classifyReportStatus(reviewQueue);
  if (worst === 'critical') {
    return {
      label: 'Stress review',
      reason: 'At least one critical vault signal is active.',
      action: 'Review critical items first; downgrade all lower-confidence setups.',
    };
  }
  if (worst === 'alert') {
    return {
      label: 'Active risk watch',
      reason: 'One or more alert-level notes are active.',
      action: 'Promote only alerts with clear invalidation and liquidity checks.',
    };
  }
  if (worst === 'watch') {
    return {
      label: 'Watchlist regime',
      reason: 'Watch-level signals exist, but no alert or critical item dominates.',
      action: 'Review top watch items and avoid forcing a trade expression.',
    };
  }
  if (entropyMonitor && isActiveStatus(entropyMonitor.data?.signal_status)) {
    return {
      label: 'Compression watch',
      reason: 'Entropy monitor is active without broader alert escalation.',
      action: 'Treat low entropy as attention compression, not direction.',
    };
  }
  if (macroCalendar || earningsCalendar) {
    return {
      label: 'Calendar-aware normal',
      reason: 'Calendar layers are present and no active signal queue dominates.',
      action: 'Check event timing before accepting intraday signals.',
    };
  }
  return {
    label: 'Baseline monitoring',
    reason: 'No active alert queue was found in the report window.',
    action: 'Run daily pulls and fill missing guide modules.',
  };
}

function recommendWorkflow(data) {
  if (data.reviewQueue.some(note => note.data?.signal_status === 'critical')) {
    return 'critical-signal triage, then manual invalidation check';
  }
  if (data.reviewQueue.length > 0) {
    return 'review top queue items, tag edge type, and journal the decision';
  }
  if (data.coverageRows.some(row => row.status === 'gap')) {
    return 'no urgent alert; spend the cycle closing guide coverage gaps';
  }
  return 'maintenance review and weekly outcome tracking';
}

function classifyReportStatus(notes) {
  const worst = notes.reduce((max, note) => Math.max(max, SIGNAL_RANK[note.data?.signal_status] ?? 0), 0);
  return Object.entries(SIGNAL_RANK).find(([, score]) => score === worst)?.[0] || 'clear';
}

function buildReportSignals(data) {
  const noteSignals = data.reviewQueue.flatMap(note => normalizeSignalList(note.data?.signals));
  const gapSignals = data.coverageRows
    .filter(row => row.status === 'gap')
    .map(row => `streamline_gap_${slugify(row.module)}`);
  return unique([...noteSignals, ...gapSignals]).slice(0, 24);
}

function formatGapSummary(rows) {
  const gaps = rows.filter(row => row.status === 'gap').map(row => row.module);
  if (!gaps.length) return 'no major guide module gaps detected';
  return gaps.slice(0, 4).join(', ') + (gaps.length > 4 ? ` (+${gaps.length - 4} more)` : '');
}

function extractReviewAssets(notes) {
  return unique(notes.map(primaryCandidateLabel).filter(Boolean));
}

function primaryCandidateLabel(note) {
  return normalizeSymbol(note.data?.symbol || note.data?.ticker) ||
    String(note.data?.thesis_name || note.data?.thesis || note.data?.sector || note.data?.title || noteTitle(note));
}

function secCompanyResource(symbol) {
  const company = getByTicker(symbol);
  if (!company?.cik) return externalLink('SEC EDGAR company search', `https://www.sec.gov/edgar/search/#/q=${encodeURIComponent(symbol)}`);
  return externalLink(`SEC EDGAR ${symbol}`, `https://www.sec.gov/edgar/browse/?CIK=${stripCik(company.cik)}`);
}

function externalLink(label, url) {
  return `[${String(label).replace(/\]/g, ')')}](${url})`;
}

function titleMatch(value, needles) {
  const text = String(value || '').toLowerCase();
  return needles.some(needle => text.includes(String(needle).toLowerCase()));
}

function inferInvalidation(note) {
  const dataType = String(note.data?.data_type || '').toLowerCase();
  if (dataType.includes('technical')) return 'Price loses the cited moving-average/technical support or signal flips back to clear.';
  if (dataType.includes('calendar') || dataType.includes('catalyst')) return 'Catalyst date passes without confirmation or event risk changes direction.';
  if (dataType.includes('agent')) return 'Agent confidence falls, entropy/crowding rises, or evidence layer disagreement widens.';
  if (dataType.includes('conviction') || dataType.includes('thesis')) return 'Thesis score deteriorates or invalidation triggers are met.';
  return 'The cited signal clears, fails confirmation, or contradicting source evidence appears.';
}

function noteTitle(note) {
  return String(note.data?.title || note.filename.replace(/\.md$/, ''));
}

function noteDate(note) {
  return String(note.data?.date_pulled || note.data?.date || filenameDate(note.filename) || '0000-00-00');
}

function filenameDate(filename) {
  const match = String(filename || '').match(/^(\d{4}-\d{2}-\d{2})_/);
  return match ? match[1] : null;
}

function noteWikiLink(note) {
  const stem = note.filename.replace(/\.md$/, '');
  return `[[${stem}]]`;
}

function threadWikiLink(thread) {
  const file = String(thread.note_path || `${thread.date || today()}_Agent_Thread_${slugifyThread(thread.topic)}.md`)
    .split(/[\\/]/)
    .pop()
    .replace(/\.md$/i, '');
  return `[[${file}]]`;
}

function compareSignalNotes(left, right) {
  return (SIGNAL_RANK[right.data?.signal_status] ?? 0) - (SIGNAL_RANK[left.data?.signal_status] ?? 0) ||
    noteDate(right).localeCompare(noteDate(left)) ||
    right.filename.localeCompare(left.filename);
}

function latestBy(notes, keyFn) {
  const map = new Map();
  for (const note of [...notes].sort(compareFilenameDesc)) {
    const key = keyFn(note);
    if (!key || map.has(key)) continue;
    map.set(key, note);
  }
  return Array.from(map.values());
}

function latestNote(notes) {
  return [...notes].sort(compareFilenameDesc)[0] || null;
}

function compareFilenameDesc(left, right) {
  if (left.filename === right.filename) return 0;
  return left.filename > right.filename ? -1 : 1;
}

function normalizeSignalList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(item => String(item));
  if (value == null || value === '') return [];
  return [String(value)];
}

function isActiveStatus(status) {
  return ['watch', 'alert', 'critical'].includes(String(status || '').toLowerCase());
}

function slugifyThread(value) {
  return String(value || 'agent-thread')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'agent-thread';
}

function normalizeSymbol(value) {
  const text = String(value || '').trim().toUpperCase();
  return /^[A-Z][A-Z0-9.-]{0,9}$/.test(text) ? text : '';
}

function formatNumber(value, decimals = 1) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(decimals) : 'N/A';
}

function formatSignedPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 'N/A';
  return `${number > 0 ? '+' : ''}${number.toFixed(1)}%`;
}

function formatConfidence(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 'N/A';
  const percent = number <= 1 ? number * 100 : number;
  return `${Math.round(percent)}%`;
}

function formatEntropy(level, score) {
  const number = Number(score);
  const scoreText = Number.isFinite(number) ? number.toFixed(3) : 'N/A';
  return `${level || 'N/A'} (${scoreText})`;
}

function unique(items) {
  return [...new Set(items.filter(Boolean).map(item => String(item)))];
}

function daysAgo(days) {
  const date = new Date(`${today()}T00:00:00`);
  date.setDate(date.getDate() - Number(days));
  return date.toISOString().slice(0, 10);
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'module';
}
