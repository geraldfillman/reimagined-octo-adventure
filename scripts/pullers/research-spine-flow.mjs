/**
 * research-spine-flow.mjs - compatibility alias for My_Data report generation.
 *
 * Raw pulls and generated reports now remain in My_Data. The historic command
 * name remains available for older cadence references.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { basename, dirname, join, relative } from 'path';
import {
  getPullsDir,
  getReviewVaultRoot,
  toEngineRelative,
} from '../lib/config.mjs';
import { buildFrontmatter, buildTable, today } from '../lib/markdown.mjs';
import {
  buildCadenceChecklist,
  mechanismRowsForCadence,
  selectMechanismsForCadence,
  strategyRowsForBriefing,
  strategyRowsForRegister,
} from '../lib/report-context.mjs';
import {
  loadLatestSignalIntelligence,
  renderCanonicalDeepDiveBlock,
  renderCanonicalSignalBlock,
} from '../lib/signal-intelligence.mjs';
import {
  evaluateReadiness,
  formatReadinessText,
} from '../system/readiness.mjs';
const VAULT_NAME = 'My_Data';

const DOCUMENTS = Object.freeze({
  'premarket-monitoring': {
    kind: 'monitoring_snapshot',
    cadence: 'premarket',
    title: 'Premarket Monitoring Snapshot',
    dir: ['Reports', 'Premarket', 'Monitoring'],
  },
  'daily-monitoring': {
    kind: 'monitoring_snapshot',
    cadence: 'daily',
    title: 'Daily Monitoring Snapshot',
    dir: ['Reports', 'Daily', 'Monitoring'],
  },
  'midday-monitoring': {
    kind: 'monitoring_snapshot',
    cadence: 'midday',
    title: 'Midday Monitoring Snapshot',
    dir: ['Reports', 'Midday', 'Monitoring'],
  },
  'preclose-monitoring': {
    kind: 'monitoring_snapshot',
    cadence: 'preclose',
    title: 'Preclose Monitoring Snapshot',
    dir: ['Reports', 'Preclose', 'Monitoring'],
  },
  'eod-monitoring': {
    kind: 'monitoring_snapshot',
    cadence: 'endofday',
    title: 'End Of Day Monitoring Snapshot',
    dir: ['Reports', 'EOD', 'Monitoring'],
  },
  'daily-briefing': {
    kind: 'briefing',
    cadence: 'daily',
    title: 'Daily Briefing',
    dir: ['Reports', 'Daily', 'Briefings'],
  },
  'eod-briefing': {
    kind: 'briefing',
    cadence: 'endofday',
    title: 'End Of Day Briefing',
    dir: ['Reports', 'EOD', 'Briefings'],
  },
  'source-register': {
    kind: 'source_gap_register',
    cadence: 'standing',
    title: 'Source Gap Register',
    dir: ['Reports'],
    fileName: 'Source Gap Register.md',
  },
  'strategy-register': {
    kind: 'strategy_tracking_register',
    cadence: 'standing',
    title: 'Strategy Tracking Register',
    dir: ['02_Strategy_Development'],
    fileName: 'Strategy Tracking Register.md',
  },
});

const DEFAULT_DOCS = [
  'premarket-monitoring',
  'daily-monitoring',
  'midday-monitoring',
  'preclose-monitoring',
  'eod-monitoring',
  'daily-briefing',
  'eod-briefing',
  'source-register',
  'strategy-register',
];

const FREE_SOURCE_GAPS = [
  ['OFR Financial Stress Index', 'free official', 'credit/liquidity', 'Candidate puller', 'https://www.financialresearch.gov/financial-stress-index/'],
  ['Chicago Fed NFCI', 'free official', 'financial conditions', 'Candidate puller', 'https://www.chicagofed.org/research/data/nfci/current-data'],
  ['SLOOS', 'free official', 'bank lending standards', 'Candidate puller', 'https://www.federalreserve.gov/data/sloos.htm'],
  ['Treasury TIC', 'free official', 'foreign flows', 'Candidate puller', 'https://home.treasury.gov/data/treasury-international-capital-tic-system'],
  ['CFTC COT/TFF', 'free official', 'positioning', 'Partially covered; expand', 'https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm'],
  ['FINRA Margin Statistics', 'free public', 'leverage/risk appetite', 'Candidate puller', 'https://www.finra.org/investors/learn-to-invest/advanced-investing/margin-statistics'],
  ['Fed Financial Stability Report', 'free official', 'system risk', 'Reference extraction', 'https://www.federalreserve.gov/publications/financial-stability-report.htm'],
  ['SEC Market Structure Analytics', 'free official', 'market plumbing', 'Candidate reference', 'https://www.sec.gov/marketstructure'],
  ['JODI/OPEC/IEA', 'free/partial official', 'energy balances', 'Candidate source family', 'https://www.jodidata.org/'],
  ['NERC/FERC/LBNL', 'free official', 'grid/load/interconnection', 'Candidate source family', 'https://www.nerc.com/pa/RAPA/ra/Pages/default.aspx'],
  ['NASA FIRMS', 'free official', 'geospatial risk', 'Candidate puller', 'https://firms.modaps.eosdis.nasa.gov/'],
  ['ACLED', 'free registration', 'geopolitical events', 'Candidate source', 'https://acleddata.com/'],
  ['ReliefWeb', 'free official', 'disaster/conflict impact', 'Candidate puller', 'https://reliefweb.int/'],
];

const PAID_SOURCE_REFERENCES = [
  ['BloombergNEF', 'paid', 'energy transition, power, batteries'],
  ['Wood Mackenzie', 'paid', 'energy, mining, power markets'],
  ['SemiAnalysis', 'paid/freemium', 'AI infrastructure, semiconductors'],
  ['TechInsights', 'paid', 'semiconductor teardown and supply chain'],
  ['CreditSights', 'paid', 'credit research'],
  ['PitchBook/LCD', 'paid', 'private markets and leveraged loans'],
  ['Preqin', 'paid', 'private funds and alternatives'],
  ['MarineTraffic/Kayrros/Drewry', 'paid/freemium', 'shipping, commodities, alternative data'],
];

export async function pull(flags = {}) {
  const reviewRoot = getReviewVaultRoot();
  const docs = resolveDocuments(flags);

  if (flags['dry-run']) {
    console.log(`My_Data report root: ${reviewRoot}`);
    for (const doc of docs) console.log(`  Dry run: would write ${resolveDocumentPath(reviewRoot, doc)}`);
    return { source: 'my-data-report-flow', alias: 'research-spine-flow', documents: docs, dryRun: true };
  }

  const readinessResults = await enforceReportReadiness(docs, flags);
  const context = {
    ...(await buildContext()),
    readinessResults,
  };

  const written = [];
  const writtenEntries = [];
  for (const doc of docs) {
    const filePath = resolveDocumentPath(reviewRoot, doc);
    const content = buildDocument(doc, context);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, content, 'utf-8');
    console.log(`Wrote: ${filePath}`);
    written.push(filePath);
    writtenEntries.push({ docKey: doc, filePath });
  }

  if (flags['no-inbox'] || flags.noInbox) {
    console.log('--no-inbox: My_Data reports do not write generated Inbox tasks.');
  }

  return {
    source: 'my-data-report-flow',
    alias: 'research-spine-flow',
    documents: written,
    inboxReviewQueue: null,
    worldMachinePromotionQueue: null,
  };
}

function resolveDocuments(flags) {
  if (flags.all) return DEFAULT_DOCS;
  const raw = flags.document || flags.documents || flags.type || '';
  if (!raw) return DEFAULT_DOCS;

  const docs = String(raw)
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);

  const invalid = docs.filter(doc => !DOCUMENTS[doc]);
  if (invalid.length > 0) {
    throw new Error(`Unknown My_Data report document(s): ${invalid.join(', ')}. Use ${Object.keys(DOCUMENTS).join(', ')}`);
  }
  return docs;
}

function resolveDocumentPath(researchRoot, docKey) {
  const spec = DOCUMENTS[docKey];
  const dir = join(researchRoot, ...spec.dir);
  const fileName = spec.fileName || `${today()} ${spec.title}.md`;
  return join(dir, fileName);
}

async function enforceReportReadiness(docKeys, flags) {
  const cadences = [...new Set(docKeys.map(readinessCadenceForDocument).filter(Boolean))];
  const results = [];
  const staleOk = Boolean(flags['stale-ok'] || flags['allow-stale'] || flags.staleOk || flags.allowStale);

  for (const cadence of cadences) {
    const result = await evaluateReadiness({
      cadence,
      policyPath: flags['readiness-policy'] || flags.policy,
      pullsRoot: flags['readiness-pulls-root'] || flags['pulls-root'],
    });
    results.push(result);

    if (result.status !== 'READY') {
      const text = formatReadinessText(result);
      if (result.status === 'BLOCKED' && !staleOk) {
        throw new Error(`${text}\nUse the listed refresh command(s), rerun readiness, then generate the report.`);
      }
      console.warn(text);
      if (result.status === 'BLOCKED') {
        console.warn('Proceeding only because stale override was supplied.');
      }
    }
  }

  return results;
}

function readinessCadenceForDocument(docKey) {
  const spec = DOCUMENTS[docKey];
  if (!spec || !['monitoring_snapshot', 'briefing'].includes(spec.kind)) return null;
  return normalizeReadinessCadence(spec.cadence);
}

function normalizeReadinessCadence(cadence) {
  return cadence === 'endofday' ? 'eod' : cadence;
}

function buildDocument(docKey, context) {
  if (docKey === 'source-register') return buildSourceRegister(context);
  if (docKey === 'strategy-register') return buildStrategyRegister(context);
  const spec = DOCUMENTS[docKey];
  return spec.kind === 'briefing'
    ? buildBriefing(spec, context)
    : buildMonitoringSnapshot(spec, context);
}

function buildMonitoringSnapshot(spec, context) {
  const frontmatter = commonFrontmatter(spec);
  const freshnessRows = Object.entries(context.freshnessCounts).map(([status, count]) => [status, String(count)]);
  const latestRows = context.latestInputs.slice(0, 18).map(toArtifactRow);
  const signalRows = context.prioritySignals.slice(0, 12).map(toArtifactRow);
  const evidenceConfidenceBlock = renderEvidenceConfidenceBlock(spec.cadence, context);
  const mechanismRows = mechanismRowsForCadence(spec.cadence, { limit: 10 });
  const checklistRows = buildCadenceChecklist(spec.cadence);

  return [
    buildFrontmatter(frontmatter),
    '',
    `# ${spec.title} - ${today()}`,
    '',
    '## Operator Summary',
    '',
    `- Cadence: ${spec.cadence}`,
    '- Raw pull policy: link-only back to My_Data.',
    '- Open first: [[Source Gap Register]], [[Strategy Tracking Register]], and the My_Data Macro Monitoring Dashboard.',
    '',
    '## Data Readiness Preflight',
    '',
    renderReadinessBlock(context, spec.cadence),
    '',
    '## Freshness Snapshot',
    '',
    freshnessRows.length ? buildTable(['Status', 'Count'], freshnessRows) : '- No pull notes found.',
    '',
    '## Macro And Market Inputs',
    '',
    latestRows.length ? buildTable(['Date', 'Status', 'Domain', 'Type', 'Artifact'], latestRows) : '- No recent macro, market, news, or research pulls found.',
    '',
    '## Priority Signals',
    '',
    signalRows.length ? buildTable(['Date', 'Status', 'Domain', 'Type', 'Artifact'], signalRows) : '- No non-clear pull notes found in the latest scan.',
    '',
    '## Evidence, Confidence, And Trigger Conditions',
    '',
    evidenceConfidenceBlock,
    '',
    '## Canonical Signal Intelligence',
    '',
    renderCanonicalSignalBlock(context.signalIntelligence, { limit: 8 }),
    '',
    '## Deeper Dive Queue',
    '',
    renderCanonicalDeepDiveBlock(context.signalIntelligence, { limit: 5 }),
    '',
    '## Cadence Checklist',
    '',
    buildTable(['Check', 'Input'], checklistRows),
    '',
    '## Mechanisms To Watch',
    '',
    mechanismRows.length
      ? buildTable(['Mechanism', 'Category', 'Regimes', 'Triggers', 'Signals'], mechanismRows)
      : '- No mechanism mapping configured for this cadence.',
    '',
    '## Fallback Queue',
    '',
    '- If GDELT is degraded, use NewsAPI, FMP general news, Alpha Vantage news sentiment, RSS/manual inbox, then human review.',
    '- If company-risk outputs are missing, keep them out of the V1 flow until `12_Company_Risk` is reseeded.',
    '- If a strategy lacks trackable data, keep it as a candidate instead of a live monitor.',
    '',
    '## Raw Data Policy',
    '',
    'This document summarizes and links to My_Data artifacts. It does not copy raw API payloads into generated reports.',
    '',
  ].join('\n');
}

function renderReadinessBlock(context, cadence) {
  const readinessCadence = normalizeReadinessCadence(cadence);
  const result = arrayFrom(context.readinessResults).find(item => item.cadence === readinessCadence);
  if (!result) return '_Readiness preflight was not run for this document._';
  return ['```text', formatReadinessText(result), '```'].join('\n');
}

function renderEvidenceConfidenceBlock(cadence, context) {
  const alertRows = context.prioritySignals.slice(0, 16).map(toAlertEvidenceRow);
  const confidenceRows = signalConfidenceRows(context.signalIntelligence, { limit: 12 });
  const conditionRows = mechanismConditionRows(cadence, { limit: 10 });

  return [
    '### Active Data Alerts',
    '',
    alertRows.length
      ? buildTable(
          ['Date', 'Status', 'Domain', 'Type', 'Observed Alert', 'Normal Or Trigger Condition', 'Artifact'],
          alertRows
        )
      : '- No active watch, alert, or critical data alerts found.',
    '',
    '### Strategy And Thesis Confidence Basis',
    '',
    confidenceRows.length
      ? buildTable(
          ['Scope', 'Signal', 'Status', 'Confidence', 'Confidence Basis', 'Drivers', 'Risks', 'Evidence', 'Next Action'],
          confidenceRows
        )
      : 'No canonical signal intelligence artifact found. Run `node run.mjs pull signal-intelligence`.',
    '',
    '### Mechanism Conditions',
    '',
    conditionRows.length
      ? buildTable(
          ['Mechanism', 'Category', 'Trigger Conditions', 'Signals / Pulled Data', 'Normal Or Fade Condition', 'Related Strategy'],
          conditionRows
        )
      : '- No mechanism mapping configured for this cadence.',
  ].join('\n');
}

function toAlertEvidenceRow(item) {
  return [
    item.date_pulled || 'N/A',
    item.signal_status || 'unknown',
    item.domain || 'unknown',
    item.data_type || 'pull_note',
    formatObservedAlert(item),
    normalConditionForArtifact(item),
    `[${escapeMarkdownLinkText(item.title)}](${item.obsidianUrl})`,
  ];
}

function signalConfidenceRows(payload, options = {}) {
  if (!payload || !Array.isArray(payload.cards)) return [];
  const limit = Math.max(1, Number(options.limit) || 12);
  return [...payload.cards]
    .filter(card => ['strategy', 'thesis'].includes(String(card.scope || '').toLowerCase()))
    .sort(compareSignalCards)
    .slice(0, limit)
    .map(card => [
      card.scope,
      card.name,
      card.signal_status,
      card.confidence,
      confidenceBasisForCard(card),
      shortList(card.drivers, 2),
      shortList(card.risks, 2),
      formatEvidenceLinks(card.evidence_links, 3),
      card.recommended_next_action || 'Review before changing posture.',
    ]);
}

function mechanismConditionRows(cadence, options = {}) {
  const limit = Math.max(1, Number(options.limit) || 10);
  return selectMechanismsForCadence(cadence, { limit }).map(item => [
    item.name,
    item.category,
    shortList(item.trigger_conditions, 2),
    shortList(arrayFrom(item.signals_to_watch).map(formatMechanismSignal), 3),
    shortList(item.fades_when, 2) || 'Normal: trigger conditions are absent and related pull notes remain clear.',
    shortList(item.related_strategies, 3),
  ]);
}

function formatObservedAlert(item) {
  const signals = arrayFrom(item.signals).map(signal => String(signal).trim()).filter(Boolean);
  if (signals.length) return signals.slice(0, 3).join('; ');
  return `${item.signal_status || 'non-clear'} status recorded by ${item.source || item.title}.`;
}

function normalConditionForArtifact(item) {
  const haystack = [
    item.title,
    item.domain,
    item.data_type,
    ...arrayFrom(item.signals),
  ].join(' ').toLowerCase();

  if (haystack.includes('50% absolute move')) {
    return 'Normal: largest absolute market mover stays within +/-50%; alert: one or more movers exceeds that threshold.';
  }
  if (haystack.includes('vix') && haystack.includes('term')) {
    return 'Normal: VIX curve remains in contango; alert: backwardation or elevated volatility stress.';
  }
  if (haystack.includes('skew')) {
    return 'Normal: tail-risk pricing stays below the puller alert threshold; alert: SKEW signals elevated tail risk.';
  }
  if (haystack.includes('economic_calendar')) {
    return 'Normal: no imminent high-impact macro event cluster; watch: material events appear in the lookahead window.';
  }
  if (haystack.includes('earnings_calendar')) {
    return 'Normal: no material thesis/watchlist earnings cluster; watch: upcoming reports may move watched names or sectors.';
  }
  if (haystack.includes('technical_snapshot')) {
    return 'Normal: trend, momentum, and RSI remain inside clear bands; watch/alert: technical thresholds fire in the pull note.';
  }
  if (haystack.includes('agent_analysis')) {
    return 'Normal: agent stack remains clear or low-confidence; watch/alert: model verdict, confidence, or risk cluster crosses threshold.';
  }
  if (haystack.includes('liquidity')) {
    return 'Normal: liquidity indicators remain inside clear historical bounds; watch/alert: stress thresholds fire in the pull note.';
  }
  if (haystack.includes('interest') || haystack.includes('rates') || haystack.includes('treasury')) {
    return 'Normal: rates and curve indicators remain inside clear bounds; watch/alert: rate or curve stress thresholds fire.';
  }
  if (haystack.includes('credit')) {
    return 'Normal: credit spreads and conditions remain inside clear bounds; watch/alert: spread or credit stress thresholds fire.';
  }
  return 'Normal: signal_status is clear; watch/alert/critical: the puller records a non-clear signal.';
}

function confidenceBasisForCard(card) {
  const evidenceCount = arrayFrom(card.evidence_links).length;
  const riskCount = arrayFrom(card.risks).length;
  const label = String(card.confidence || 'Unknown');
  return `${label}: ${evidenceCount} evidence link(s), ${riskCount} risk/gap item(s). Rule of thumb: High needs broad evidence with no missing inputs; Medium has adequate links or limited gaps; Low is thin or stale.`;
}

function formatEvidenceLinks(links, limit = 3) {
  const rows = arrayFrom(links).slice(0, limit).map(link => {
    const label = escapeMarkdownLinkText(link.label || link.path || 'Evidence');
    const path = normalizePath(link.path || '');
    return path ? `[${label}](${toObsidianUrl(path)})` : label;
  });
  return rows.length ? rows.join('; ') : 'No evidence links on card.';
}

function formatMechanismSignal(signal) {
  if (typeof signal === 'string') return signal;
  const name = signal?.signal || 'Signal';
  const source = [signal?.data_source, signal?.field].filter(Boolean).join(': ');
  return source ? `${name} (${source})` : name;
}

function shortList(value, limit = 2) {
  const items = arrayFrom(value).map(item => String(item).trim()).filter(Boolean).slice(0, limit);
  return items.join('; ');
}

function compareSignalCards(left, right) {
  return signalStatusRank(right.signal_status) - signalStatusRank(left.signal_status) ||
    scopeRank(left.scope) - scopeRank(right.scope) ||
    String(left.name || '').localeCompare(String(right.name || ''));
}

function signalStatusRank(status) {
  const ranks = { clear: 0, watch: 1, alert: 2, critical: 3 };
  return ranks[String(status || '').toLowerCase()] ?? 0;
}

function scopeRank(scope) {
  const ranks = { strategy: 0, thesis: 1, 'market-cycle': 2 };
  return ranks[String(scope || '').toLowerCase()] ?? 9;
}

function buildBriefing(spec, context) {
  const frontmatter = commonFrontmatter(spec);
  const newsRows = context.newsAndResearch.slice(0, 16).map(toArtifactRow);
  const strategyRows = strategyRowsForBriefing({ limit: 8 });
  const monitoringSnapshotTitle = spec.cadence === 'endofday'
    ? 'End Of Day Monitoring Snapshot'
    : 'Daily Monitoring Snapshot';

  return [
    buildFrontmatter(frontmatter),
    '',
    `# ${spec.title} - ${today()}`,
    '',
    '## Read First',
    '',
    '- [[Source Gap Register]]',
    '- [[Strategy Tracking Register]]',
    `- [[${today()} ${monitoringSnapshotTitle}]]`,
    '',
    '## Data Readiness Preflight',
    '',
    renderReadinessBlock(context, spec.cadence),
    '',
    '## Research And News Queue',
    '',
    newsRows.length ? buildTable(['Date', 'Status', 'Domain', 'Type', 'Artifact'], newsRows) : '- No recent news or research artifacts found.',
    '',
    '## Strategy Routing',
    '',
    buildTable(['Strategy', 'Status', 'Tracking Mode', 'Review Rule'], strategyRows),
    '',
    '## Canonical Signal Intelligence',
    '',
    renderCanonicalSignalBlock(context.signalIntelligence, { limit: 8 }),
    '',
    '## Deeper Dive Queue',
    '',
    renderCanonicalDeepDiveBlock(context.signalIntelligence, { limit: 5 }),
    '',
    '## Blogs, Webinars, And Source Watch',
    '',
    '- Review `03_References/Content_Candidates/` for promoted papers, books, reports, videos, and webinars.',
    '- Add paid-source items as reference-only unless credentials and usage rights are confirmed.',
    '- Convert useful free or official sources into source notes before adding automated pullers.',
    '',
    '## Human Decisions',
    '',
    '- What changed today?',
    '- What deserves a research task?',
    '- Which thesis or strategy changed enough to update conviction?',
    '- Which data gap blocked a decision?',
    '',
  ].join('\n');
}

function buildSourceRegister(context) {
  const frontmatter = commonFrontmatter(DOCUMENTS['source-register']);
  return [
    buildFrontmatter(frontmatter),
    '',
    `# Source Gap Register - ${today()}`,
    '',
    '## Provider Roles',
    '',
    '- FMP: primary financial-data backbone for quotes, fundamentals, technicals, market performance, calendars, and company news.',
    '- Alpha Vantage: optional sidecar for news sentiment, technical cross-checks, and top-gainers/losers comparison.',
    '- Semantic Scholar: research discovery for topics, theses, strategies, and market-cycle learning.',
    '- GDELT: near-real-time news monitor; use the fallback queue when degraded.',
    '',
    '## Free Or Official Candidates',
    '',
    buildTable(['Source', 'Access', 'Gap Covered', 'V1 Action', 'URL'], FREE_SOURCE_GAPS.map(row => [row[0], row[1], row[2], row[3], `[link](${row[4]})`])),
    '',
    '## Paid Or Entitled References',
    '',
    buildTable(['Source', 'Access', 'Use'], PAID_SOURCE_REFERENCES),
    '',
    '## Current Pull Coverage Snapshot',
    '',
    buildTable(['Domain', 'Latest Pull Count'], Object.entries(context.domainCounts).map(([domain, count]) => [domain, String(count)])),
    '',
    '## Promotion Rule',
    '',
    'A source becomes automated only after it has a source note, a clear data gap, an owner/use case, and either free access or confirmed entitlement.',
    '',
  ].join('\n');
}

function buildStrategyRegister() {
  const frontmatter = commonFrontmatter(DOCUMENTS['strategy-register']);
  return [
    buildFrontmatter(frontmatter),
    '',
    `# Strategy Tracking Register - ${today()}`,
    '',
    '## Strategy Schema',
    '',
    buildTable(
      ['Field', 'Purpose'],
      [
        ['strategy', 'Canonical strategy name'],
        ['tracking_mode', 'fundamental, technical, macro, event-driven, or hybrid'],
        ['universe', 'Symbols, sectors, ETFs, or thesis basket tracked'],
        ['signal_set', 'Observable signals required for live monitoring'],
        ['data_requirements', 'Sources needed before promotion'],
        ['rebalance_rule', 'Refresh/review cadence and action rule'],
        ['evidence_gate', 'Minimum evidence before becoming live'],
        ['status', 'candidate, live-monitor, paused, retired'],
      ]
    ),
    '',
    '## V1 Strategy Queue',
    '',
    buildTable(['Strategy', 'Status', 'Tracking Mode', 'Data Requirements', 'Review Rule'], strategyRowsForRegister()),
    '',
    '## Basket Classification',
    '',
    '- Sector basket files remain sector monitors.',
    '- Investor/style basket files become strategy candidates or live monitors.',
    '- Generated pulls, reports, human gates, and research decisions now live in My_Data; World_Machine keeps only the Market Positioning Ledger and inbox ingestion workflow.',
    '',
  ].join('\n');
}

function commonFrontmatter(spec) {
  return {
    type: spec.kind,
    title: `${spec.title} - ${today()}`,
    cadence: spec.cadence,
    date_pulled: today(),
    source: 'My_Data Report Flow',
    raw_data_policy: 'link_only',
    tags: ['my-data-report', spec.kind, spec.cadence],
  };
}

async function buildContext() {
  const artifacts = readPullArtifacts();
  const sorted = artifacts.sort((a, b) => b.dateSort - a.dateSort);
  const latestInputs = sorted.filter(item => ['macro', 'market', 'news', 'research'].includes(item.domain));
  const prioritySignals = sorted.filter(item => !['clear', '', 'unknown'].includes(item.signal_status));
  const newsAndResearch = sorted.filter(item => ['news', 'research'].includes(item.domain));
  const signalIntelligence = await loadLatestSignalIntelligence().catch(() => null);

  return {
    artifacts: sorted,
    latestInputs,
    prioritySignals,
    newsAndResearch,
    signalIntelligence,
    freshnessCounts: countBy(sorted, item => freshnessStatus(item.dateSort)),
    domainCounts: countBy(sorted, item => item.domain || 'unknown'),
  };
}

function readPullArtifacts() {
  const root = getPullsDir();
  if (!existsSync(root)) return [];
  return listMarkdownFiles(root)
    .filter(filePath => !filePath.includes(`${sepLike()}_archive${sepLike()}`))
    .map(filePath => {
      const fm = readFrontmatter(filePath);
      const stat = statSync(filePath);
      const dateRaw = fm.date_pulled || stat.mtime.toISOString().slice(0, 10);
      const dateSort = Date.parse(`${dateRaw}T00:00:00`) || stat.mtime.getTime();
      const rel = toEngineRelative(filePath);
      return {
        filePath,
        rel,
        title: fm.title || basename(filePath, '.md'),
        source: fm.source || '',
        domain: String(fm.domain || inferDomain(filePath)).toLowerCase(),
        data_type: fm.data_type || 'pull_note',
        date_pulled: dateRaw,
        dateSort,
        signal_status: fm.signal_status || 'unknown',
        signals: arrayFrom(fm.signals),
        obsidianUrl: toObsidianUrl(rel),
      };
    });
}

function listMarkdownFiles(root) {
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const fullPath = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

function readFrontmatter(filePath) {
  const text = readFileSync(filePath, 'utf-8');
  if (!text.startsWith('---')) return {};
  const end = text.indexOf('\n---', 3);
  if (end < 0) return {};
  const fm = {};
  for (const line of text.slice(3, end).split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!match) continue;
    fm[match[1]] = parseFrontmatterValue(match[2]);
  }
  return fm;
}

function parseFrontmatterValue(rawValue) {
  const value = String(rawValue || '').trim();
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map(item => item.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }
  return value.replace(/^['"]|['"]$/g, '');
}

function inferDomain(filePath) {
  return relative(getPullsDir(), filePath).split(/[\\/]/)[0] || 'unknown';
}

function toArtifactRow(item) {
  return [
    item.date_pulled || 'N/A',
    item.signal_status || 'unknown',
    item.domain || 'unknown',
    item.data_type || 'pull_note',
    `[${escapeMarkdownLinkText(item.title)}](${item.obsidianUrl})`,
  ];
}

function toObsidianUrl(relPath) {
  return `obsidian://open?vault=${VAULT_NAME}&file=${encodeURIComponent(relPath.replace(/\\/g, '/'))}`;
}

function freshnessStatus(dateSort) {
  if (!dateSort) return 'Never';
  const ageDays = Math.floor((Date.now() - dateSort) / (24 * 60 * 60 * 1000));
  if (ageDays <= 2) return 'Fresh';
  if (ageDays <= 7) return 'Aging';
  return 'Stale';
}

function countBy(items, selector) {
  const counts = {};
  for (const item of items) {
    const key = selector(item) || 'unknown';
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function escapeMarkdownLinkText(value) {
  return String(value || '').replace(/\]/g, '\\]').replace(/\|/g, '/');
}

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function arrayFrom(value) {
  if (Array.isArray(value)) return value.filter(item => item !== null && item !== undefined && item !== '');
  if (value === null || value === undefined || value === '') return [];
  return [value];
}

function sepLike() {
  return process.platform === 'win32' ? '\\' : '/';
}
