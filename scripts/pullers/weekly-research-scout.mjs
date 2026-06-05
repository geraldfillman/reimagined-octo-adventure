/**
 * weekly-research-scout.mjs - weekly thesis-candidate synthesis from local evidence.
 *
 * Reads already-generated NewsAPI, FMP news, Semantic Scholar, and SourceWatch
 * pull notes. It does not call live APIs, mutate thesis notes, or touch the
 * Market Positioning Ledger.
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

import {
  getEngineCacheDir,
  getPullsDir,
  getThesesDir,
  resolveWorldMachinePath,
  toEngineRelative,
  toWorldMachineRelative,
} from '../lib/config.mjs';
import { readFolder } from '../lib/frontmatter.mjs';
import { buildNote, buildTable, emitOutput, today } from '../lib/markdown.mjs';

const DEFAULT_WINDOW_DAYS = 14;
const MAX_EVIDENCE_PER_CHANNEL = 4;
const MIN_THEME_KEYWORD_HITS = 2;

const STATUS_RANK = {
  clear: 0,
  watch: 1,
  alert: 2,
  critical: 3,
};

const URGENT_TERMS = [
  'approval', 'bankruptcy', 'ban', 'breach', 'crackdown', 'default', 'delisting',
  'emergency', 'halt', 'investigation', 'lawsuit', 'recall', 'sanction', 'tariff',
  'war', 'warning',
];

const CONTRADICTION_TERMS = [
  'delay', 'delayed', 'misses', 'missed', 'downgrade', 'cut guidance', 'rationing',
  'shortfall', 'weak demand', 'canceled', 'cancelled', 'blocked', 'failed',
  'investigation', 'lawsuit',
];

export const THESIS_THEMES = Object.freeze([
  Object.freeze({
    slug: 'ai-power-grid-bottleneck',
    label: 'AI Power and Grid Bottleneck',
    keywords: [
      'ai', 'artificial intelligence', 'data center', 'compute', 'electricity', 'power', 'grid', 'gpu', 'semiconductor',
      'neocloud', 'photonics', 'optical interconnect', 'optical networking', 'co-packaged optics', 'silicon photonics',
    ],
    entities: ['AI compute', 'data centers', 'grid equipment', 'power generation', 'neocloud providers', 'photonics suppliers'],
    tickers: ['NVDA', 'VST', 'CEG', 'PWR', 'ETN', 'GEV', 'AVGO', 'MRVL', 'ANET', 'COHR', 'LITE'],
  }),
  Object.freeze({
    slug: 'defense-industrial-base',
    label: 'Defense Industrial Base Rebuild',
    keywords: ['defense', 'drone', 'uav', 'military', 'munitions', 'shipbuilding', 'industrial base', 'robotics', 'counter-uav'],
    entities: ['defense primes', 'autonomous systems', 'domestic manufacturing'],
    tickers: ['LMT', 'RTX', 'NOC', 'HII', 'KTOS'],
  }),
  Object.freeze({
    slug: 'healthcare-biotech-catalysts',
    label: 'Healthcare and Biotech Catalyst Path',
    keywords: ['fda', 'clinical trial', 'oncology', 'biotech', 'pharma', 'drug', 'approval', 'medtech', 'glp-1'],
    entities: ['FDA', 'clinical trials', 'biotech pipelines', 'medtech'],
    tickers: ['LLY', 'NVO', 'MRK', 'TMO', 'MDT'],
  }),
  Object.freeze({
    slug: 'credit-liquidity-stress',
    label: 'Credit and Liquidity Stress',
    keywords: ['credit', 'default', 'liquidity', 'lending', 'bank', 'rates', 'treasury', 'funding', 'delinquency'],
    entities: ['credit markets', 'banks', 'Treasury liquidity', 'consumer lending'],
    tickers: ['KRE', 'XLF', 'TLT', 'HYG', 'JNK'],
  }),
  Object.freeze({
    slug: 'energy-critical-materials',
    label: 'Energy and Critical Materials Supply',
    keywords: ['oil', 'gas', 'uranium', 'copper', 'lithium', 'rare earth', 'critical minerals', 'steel', 'aluminum'],
    entities: ['energy supply', 'critical minerals', 'metals tariffs', 'commodity producers'],
    tickers: ['XLE', 'XME', 'FCX', 'CCJ', 'URA'],
  }),
  Object.freeze({
    slug: 'housing-consumer-cycle',
    label: 'Housing and Consumer Cycle',
    keywords: ['housing', 'mortgage', 'homebuilder', 'rent', 'consumer', 'retail', 'labor market', 'unemployment'],
    entities: ['housing cycle', 'consumer credit', 'homebuilders', 'labor market'],
    tickers: ['XHB', 'ITB', 'HD', 'LOW', 'LEN'],
  }),
  Object.freeze({
    slug: 'market-structure-positioning',
    label: 'Market Structure and Positioning',
    keywords: ['options', 'gamma', 'volatility', 'vix', 'breadth', 'momentum', 'positioning', 'short interest', 'crowding'],
    entities: ['options market', 'volatility', 'market breadth', 'positioning'],
    tickers: ['SPY', 'QQQ', 'IWM', 'VIX'],
  }),
]);

export async function pull(flags = {}) {
  const asOfDate = String(flags.date || today());
  const windowDays = positiveInt(flags.window ?? flags['window-days'], DEFAULT_WINDOW_DAYS);
  const dryRun = Boolean(flags['dry-run'] || flags.dryRun);
  const writeWorldMachine = !Boolean(flags['no-world-machine']);

  const evidenceNotes = await collectEvidenceNotes({ asOfDate, windowDays });
  const thesisNotes = await collectThesisNotes();
  const payload = buildResearchScoutPayload({ evidenceNotes, thesisNotes, asOfDate, windowDays });

  const reportPath = join(getPullsDir(), 'Theses', `${asOfDate}_Weekly_Research_Scout.md`);
  const sidecarPath = join(getEngineCacheDir('weekly-research-scout'), `${asOfDate}.json`);

  let packetPath = null;
  if (!dryRun) {
    writeScoutReport({ payload, reportPath });
    writeJson(sidecarPath, payload);
    if (writeWorldMachine && payload.summary.alert_or_higher_count > 0) {
      packetPath = writeWorldMachinePacket({ payload, asOfDate });
    }
  }

  const result = {
    source: 'weekly-research-scout',
    dry_run: dryRun,
    as_of_date: asOfDate,
    window_days: windowDays,
    candidate_count: payload.candidates.length,
    new_candidate_count: payload.summary.new_candidate_count,
    alert_or_higher_count: payload.summary.alert_or_higher_count,
    signal_status: payload.summary.signal_status,
    report_path: dryRun ? reportPath : toEngineRelative(reportPath),
    sidecar_path: dryRun ? sidecarPath : toEngineRelative(sidecarPath),
    world_machine_packet_path: packetPath ? toWorldMachineRelative(packetPath) : null,
  };

  if (dryRun) {
    console.log(`[weekly-research-scout] [dry-run] would write ${reportPath}`);
    console.log(`[weekly-research-scout] [dry-run] would write ${sidecarPath}`);
    if (writeWorldMachine && payload.summary.alert_or_higher_count > 0) {
      console.log('[weekly-research-scout] [dry-run] would write World_Machine triage packet');
    }
  } else {
    console.log(`[weekly-research-scout] Wrote: ${reportPath}`);
    console.log(`[weekly-research-scout] Wrote: ${sidecarPath}`);
    if (packetPath) console.log(`[weekly-research-scout] Wrote: ${packetPath}`);
  }

  if (flags.json) console.log(JSON.stringify({ ...result, payload }, null, 2));
  return result;
}

export function buildResearchScoutPayload({ evidenceNotes = [], thesisNotes = [], asOfDate = today(), windowDays = DEFAULT_WINDOW_DAYS } = {}) {
  const candidates = THESIS_THEMES
    .map(theme => buildThemeCandidate(theme, evidenceNotes, thesisNotes))
    .filter(candidate => candidate.evidence_count > 0)
    .sort((left, right) =>
      STATUS_RANK[right.signal_status] - STATUS_RANK[left.signal_status] ||
      right.confirmation_count - left.confirmation_count ||
      right.evidence_count - left.evidence_count ||
      left.candidate_thesis.localeCompare(right.candidate_thesis)
    );

  const signalStatus = candidates.reduce(
    (status, candidate) => STATUS_RANK[candidate.signal_status] > STATUS_RANK[status] ? candidate.signal_status : status,
    'clear'
  );

  return Object.freeze({
    schema_version: 1,
    source: 'weekly-research-scout',
    as_of_date: asOfDate,
    window_days: windowDays,
    summary: Object.freeze({
      signal_status: signalStatus,
      candidate_count: candidates.length,
      new_candidate_count: candidates.filter(candidate => candidate.is_new_candidate).length,
      alert_or_higher_count: candidates.filter(candidate => STATUS_RANK[candidate.signal_status] >= STATUS_RANK.alert).length,
      evidence_note_count: evidenceNotes.length,
    }),
    candidates: Object.freeze(candidates),
  });
}

export function classifyCandidateStatus({ confirmationCount = 0, urgentCount = 0 } = {}) {
  if (confirmationCount >= 3 && urgentCount > 0) return 'critical';
  if (confirmationCount >= 2) return 'alert';
  if (confirmationCount >= 1) return 'watch';
  return 'clear';
}

async function collectEvidenceNotes({ asOfDate, windowDays }) {
  const pullsDir = getPullsDir();
  const folderSpecs = [
    { channel: 'newsapi', dir: join(pullsDir, 'News') },
    { channel: 'fmp_news', dir: join(pullsDir, 'News') },
    { channel: 'fmp_news', dir: join(pullsDir, 'Market') },
    { channel: 'semantic_scholar', dir: join(pullsDir, 'Research') },
    { channel: 'sourcewatch', dir: join(pullsDir, 'SourceWatch') },
    { channel: 'theme_terms', dir: join(pullsDir, 'Theses') },
  ];

  const notes = [];
  const seen = new Set();
  for (const spec of folderSpecs) {
    const folderNotes = await readFolder(spec.dir, true);
    for (const note of folderNotes) {
      const key = `${spec.channel}:${note.path}`;
      if (seen.has(key)) continue;
      if (!isWithinWindow(note, asOfDate, windowDays)) continue;
      if (!noteMatchesChannel(note, spec.channel)) continue;
      seen.add(key);
      notes.push({ ...note, channel: spec.channel, rel_path: toEngineRelative(note.path) });
    }
  }
  return notes;
}

async function collectThesisNotes() {
  if (!existsSync(getThesesDir())) return [];
  return (await readFolder(getThesesDir(), true)).map(note => ({
    ...note,
    thesis_name: String(note.data?.name || note.data?.title || note.filename.replace(/\.md$/i, '')).trim(),
  }));
}

function buildThemeCandidate(theme, evidenceNotes, thesisNotes) {
  const evidence = evidenceNotes
    .map(note => {
      const text = noteSearchText(note);
      const keywordHits = matchedKeywords(theme, text);
      if (keywordHits.length < MIN_THEME_KEYWORD_HITS) return null;
      const urgentHits = matchedTerms(URGENT_TERMS, text);
      const contradictionHits = matchedTerms(CONTRADICTION_TERMS, text);
      return Object.freeze({
        channel: note.channel,
        title: noteTitle(note),
        path: note.rel_path || toEngineRelative(note.path),
        matched_keywords: keywordHits.slice(0, 6),
        urgent_terms: urgentHits.slice(0, 4),
        contradiction_terms: contradictionHits.slice(0, 4),
      });
    })
    .filter(Boolean);

  const byChannel = new Map();
  for (const item of evidence) {
    if (!byChannel.has(item.channel)) byChannel.set(item.channel, []);
    if (byChannel.get(item.channel).length < MAX_EVIDENCE_PER_CHANNEL) {
      byChannel.get(item.channel).push(item);
    }
  }

  const channels = [...byChannel.keys()].sort();
  const urgentCount = evidence.filter(item => item.urgent_terms.length > 0).length;
  const contradictionCount = evidence.filter(item => item.contradiction_terms.length > 0).length;
  const relatedExistingTheses = matchExistingTheses(theme, thesisNotes);
  const signalStatus = classifyCandidateStatus({ confirmationCount: channels.length, urgentCount });

  return Object.freeze({
    id: theme.slug,
    candidate_thesis: theme.label,
    signal_status: signalStatus,
    is_new_candidate: relatedExistingTheses.length === 0,
    related_existing_theses: relatedExistingTheses,
    candidate_entities: theme.entities,
    candidate_tickers: theme.tickers,
    evidence_channels: channels,
    confirmation_count: channels.length,
    contradiction_count: contradictionCount,
    evidence_count: evidence.length,
    recommended_action: recommendedAction(signalStatus, relatedExistingTheses.length === 0),
    evidence: Object.fromEntries([...byChannel.entries()]),
  });
}

function matchExistingTheses(theme, thesisNotes) {
  return thesisNotes
    .map(note => {
      const hits = matchedKeywords(theme, noteSearchText(note));
      return { name: note.thesis_name, hits: hits.length };
    })
    .filter(item => item.hits >= 2)
    .sort((left, right) => right.hits - left.hits || left.name.localeCompare(right.name))
    .slice(0, 5)
    .map(item => item.name);
}

function recommendedAction(status, isNewCandidate) {
  if (STATUS_RANK[status] >= STATUS_RANK.alert && isNewCandidate) return 'promote-to-watchpoint-review';
  if (STATUS_RANK[status] >= STATUS_RANK.alert) return 'research';
  if (status === 'watch') return 'research';
  return 'observe';
}

function writeScoutReport({ payload, reportPath }) {
  const candidateRows = payload.candidates.map(candidate => [
    candidate.signal_status,
    candidate.is_new_candidate ? 'yes' : 'no',
    candidate.candidate_thesis,
    candidate.evidence_channels.join(', '),
    String(candidate.confirmation_count),
    String(candidate.contradiction_count),
    candidate.recommended_action,
  ]);

  const sections = [
    {
      heading: 'Summary',
      content: [
        `- **Signal status**: ${payload.summary.signal_status}`,
        `- **Candidates**: ${payload.summary.candidate_count}`,
        `- **New candidates**: ${payload.summary.new_candidate_count}`,
        `- **Alert or higher**: ${payload.summary.alert_or_higher_count}`,
        `- **Evidence notes reviewed**: ${payload.summary.evidence_note_count}`,
      ].join('\n'),
    },
    {
      heading: 'Candidate Table',
      content: candidateRows.length
        ? buildTable(['Status', 'New?', 'Candidate Thesis', 'Evidence Channels', 'Confirmations', 'Contradictions', 'Recommended Action'], candidateRows)
        : '_No thesis candidates crossed the weekly research scout keyword screen._',
    },
    {
      heading: 'Evidence Detail',
      content: payload.candidates.length
        ? payload.candidates.map(renderCandidateEvidence).join('\n\n')
        : '_No evidence detail._',
    },
    {
      heading: 'Automation Boundary',
      content: [
        '- This puller reads local weekly evidence only.',
        '- News-only clusters remain watch items.',
        '- Alert requires at least two independent evidence channels.',
        '- No thesis notes, watchpoints, or ledger rows were mutated.',
      ].join('\n'),
    },
  ];

  const note = buildNote({
    frontmatter: {
      title: 'Weekly Research Scout',
      type: 'pull_note',
      source: 'weekly-research-scout',
      date_pulled: payload.as_of_date,
      domain: 'thesis',
      data_type: 'weekly_research_scout',
      frequency: 'weekly',
      signal_status: payload.summary.signal_status,
      candidate_count: payload.summary.candidate_count,
      new_candidate_count: payload.summary.new_candidate_count,
      alert_or_higher_count: payload.summary.alert_or_higher_count,
      signals: payload.candidates
        .filter(candidate => STATUS_RANK[candidate.signal_status] >= STATUS_RANK.watch)
        .map(candidate => `${candidate.signal_status}:${candidate.id}`),
      tags: ['thesis', 'research-scout', 'weekly', 'newsapi', 'fmp', 'semantic-scholar', 'source-watch'],
    },
    sections,
  });

  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, note, 'utf-8');
  emitOutput(reportPath);
}

function writeWorldMachinePacket({ payload, asOfDate }) {
  const alertCandidates = payload.candidates.filter(candidate => STATUS_RANK[candidate.signal_status] >= STATUS_RANK.alert);
  const packetPath = resolveWorldMachinePath('_Inbox', '00_Triage', `${asOfDate} - Weekly Research Scout Thesis Candidates.md`);
  const note = buildNote({
    frontmatter: {
      type: 'thesis-candidate-packet',
      source: 'weekly-research-scout',
      date_pulled: asOfDate,
      signal_status: payload.summary.signal_status,
      candidate_count: alertCandidates.length,
      tags: ['weekly-research-scout', 'thesis-candidate', 'review-required'],
    },
    sections: [
      {
        heading: 'Review Required',
        content: [
          'These are thesis or watchpoint review candidates only.',
          'Do not mutate the Market Positioning Ledger from this packet.',
          'Confirm whether each item maps to an existing World_Machine object before creating anything new.',
        ].join('\n'),
      },
      {
        heading: 'Candidates',
        content: buildTable(
          ['Status', 'New?', 'Candidate Thesis', 'Evidence Channels', 'Recommended Action'],
          alertCandidates.map(candidate => [
            candidate.signal_status,
            candidate.is_new_candidate ? 'yes' : 'no',
            candidate.candidate_thesis,
            candidate.evidence_channels.join(', '),
            candidate.recommended_action,
          ])
        ),
      },
      {
        heading: 'Source Report',
        content: `My_Data source report: [[05_Data_Pulls/Theses/${asOfDate}_Weekly_Research_Scout]]`,
      },
    ],
  });

  mkdirSync(dirname(packetPath), { recursive: true });
  writeFileSync(packetPath, note, 'utf-8');
  return packetPath;
}

function renderCandidateEvidence(candidate) {
  const lines = [
    `### ${candidate.candidate_thesis}`,
    '',
    `- Status: ${candidate.signal_status}`,
    `- New candidate: ${candidate.is_new_candidate ? 'yes' : 'no'}`,
    `- Existing thesis links: ${candidate.related_existing_theses.length ? candidate.related_existing_theses.join(', ') : 'none'}`,
  ];

  for (const [channel, items] of Object.entries(candidate.evidence)) {
    lines.push('', `**${channel}**`);
    for (const item of items) {
      lines.push(`- ${item.title} (${item.path})`);
    }
  }
  return lines.join('\n');
}

function writeJson(filePath, payload) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');
}

export function noteMatchesChannel(note, channel) {
  const source = String(note.data?.source || '').toLowerCase();
  const dataType = String(note.data?.data_type || '').toLowerCase();
  const tags = arrayFrom(note.data?.tags).map(tag => String(tag).toLowerCase());
  const filename = String(note.filename || '').toLowerCase();

  if (channel === 'newsapi') return source.includes('newsapi') || tags.includes('newsapi') || filename.includes('news_');
  if (channel === 'fmp_news') return (source.includes('financial modeling prep') && dataType.includes('news')) || filename.includes('fmp_news') || filename.includes('fmp_general_news');
  if (channel === 'semantic_scholar') return source.includes('semantic scholar') || tags.includes('semantic-scholar') || filename.includes('semanticscholar');
  if (channel === 'sourcewatch') return source.includes('source watch') || tags.includes('source-watch') || filename.includes('source_watch');
  if (channel === 'theme_terms') {
    return dataType === 'theme_terms_report' ||
      tags.includes('terms-to-know') ||
      filename.includes('terms_report') ||
      filename.includes('terms-report');
  }
  return false;
}

function isWithinWindow(note, asOfDate, windowDays) {
  const rawDate = String(note.data?.date_pulled || note.data?.date || note.filename.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) return false;
  const ms = Date.parse(`${asOfDate}T00:00:00Z`) - Date.parse(`${rawDate}T00:00:00Z`);
  return ms >= 0 && ms <= windowDays * 24 * 60 * 60 * 1000;
}

function matchedKeywords(theme, text) {
  return matchedTerms(theme.keywords, text);
}

function matchedTerms(terms, text) {
  return terms.filter(term => text.includes(String(term).toLowerCase()));
}

function noteSearchText(note) {
  return [
    note.filename,
    note.data?.title,
    note.data?.topic,
    note.data?.domain,
    note.data?.data_type,
    arrayFrom(note.data?.tags).join(' '),
    note.content,
  ].filter(Boolean).join(' ').toLowerCase();
}

function noteTitle(note) {
  return String(note.data?.title || note.data?.topic || note.filename.replace(/\.md$/i, '')).trim();
}

function arrayFrom(value) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

function positiveInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
