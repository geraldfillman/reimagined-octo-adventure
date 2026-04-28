/**
 * federalregister.mjs - Pull FAA UAS regulatory-progress evidence from the official FR API.
 *
 * Usage:
 *   node run.mjs federalregister
 *   node run.mjs federalregister --faa-uas
 *   node run.mjs federalregister --faa-uas --dry-run
 */

import { join } from 'path';
import { getPullsDir } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';

const API_BASE_URL = 'https://www.federalregister.gov/api/v1/documents.json';
const FAA_UAS_PORTAL_URL = 'https://www.faa.gov/newsroom/unmanned-aircraft-systems-uas';
const FAA_AGENCY_URL = 'https://www.federalregister.gov/agencies/federal-aviation-administration';

export async function pull(flags = {}) {
  if (flags['faa-uas'] || Object.keys(flags).length === 0 || (Object.keys(flags).length === 1 && flags['dry-run'])) {
    return pullFaaUas(flags);
  }

  throw new Error('Specify --faa-uas or run without flags.');
}

async function pullFaaUas(flags) {
  console.log('Pulling FAA UAS regulatory progress from the Federal Register API...');

  const documents = await fetchFaaUasDocuments();
  if (documents.length === 0) {
    throw new Error('No FAA UAS regulatory documents were returned by FederalRegister.gov.');
  }

  const latest = documents[0];
  const prior = documents[1] || null;
  const latestStage = classifyStage(latest);
  const priorStage = prior ? classifyStage(prior) : null;
  const signalStatus = latestStage.signalStatus;
  const signals = buildSignals(latestStage, documents);

  if (flags['dry-run']) {
    console.log(`[dry-run] ${latest.publicationDate}: ${latest.title}`);
    console.log(`[dry-run] Stage: ${latestStage.label} (${latestStage.score}/5)`);
    return { filePath: null, signals };
  }

  const note = buildNote({
    frontmatter: {
      title: 'FAA Regulatory Progress',
      source: 'Federal Register / FAA',
      indicator: 'FAA Regulatory Progress',
      series_id: 'FAA_UAS_REG',
      latest_document_number: latest.documentNumber,
      latest_document_type: latest.type,
      latest_document_url: latest.url,
      related_theses: ['[[Drone Autonomous Systems Revolution]]', '[[Defense AI Autonomous Warfare]]'],
      date_pulled: today(),
      domain: 'government',
      data_type: 'time_series',
      frequency: 'ongoing',
      signal_status: signalStatus,
      signals,
      tags: ['government', 'faa', 'federal-register', 'drones', 'regulation', 'thesis'],
      related_pulls: [],
    },
    sections: [
      {
        heading: 'Core Indicator Snapshot',
        content: buildTable(
          ['Series', 'Name', 'Latest Date', 'Latest Value', 'Prior Value', 'Change'],
          [[
            'FAA_UAS_REG',
            'FAA Regulatory Progress',
            latest.publicationDate,
            `${latestStage.label} (${latestStage.score}/5)`,
            priorStage ? `${priorStage.label} (${priorStage.score}/5)` : 'N/A',
            formatStageChange(latestStage, priorStage),
          ]]
        ),
      },
      {
        heading: 'Recent FAA UAS Documents',
        content: buildTable(
          ['Date', 'Title', 'Type', 'Stage', 'Document', 'Link'],
          documents.slice(0, 5).map(doc => {
            const stage = classifyStage(doc);
            return [
              doc.publicationDate,
              doc.title,
              doc.type,
              `${stage.label} (${stage.score}/5)`,
              doc.documentNumber,
              doc.url,
            ];
          })
        ),
      },
      {
        heading: 'Monitoring Read',
        content: [
          `- **Latest Milestone**: ${latest.title}`,
          `- **Interpretation**: ${latestStage.summary}`,
          `- **Prior Milestone**: ${prior ? prior.title : 'N/A'}`,
          '- **Why It Matters**: This workflow converts official FAA/Federal Register drone rulemaking into a date-stamped thesis indicator instead of leaving policy progress as narrative only.',
        ].join('\n'),
      },
      {
        heading: 'Source',
        content: [
          `- **Federal Register API**: ${buildApiUrl()}`,
          `- **FAA Agency Page**: ${FAA_AGENCY_URL}`,
          `- **FAA UAS Portal**: ${FAA_UAS_PORTAL_URL}`,
          '- **Purpose**: Track the unresolved FAA Regulatory Progress indicator with primary-source rulemaking evidence.',
          `- **Auto-pulled**: ${today()}`,
        ].join('\n'),
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Government', dateStampedFilename('FAA_Regulatory_Progress'));
  writeNote(filePath, note);
  console.log(`Wrote ${filePath}`);

  return { filePath, signals };
}

async function fetchFaaUasDocuments() {
  const data = await getJson(buildApiUrl());
  const results = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];

  return results
    .map(entry => normalizeDocument(entry))
    .filter(Boolean)
    .filter(doc => isRelevantUasDocument(doc))
    .sort((left, right) => right.publicationDate.localeCompare(left.publicationDate));
}

function buildApiUrl() {
  const params = new URLSearchParams();
  params.append('conditions[agencies][]', 'federal-aviation-administration');
  params.append('conditions[term]', 'unmanned aircraft');
  params.append('order', 'newest');
  params.append('per_page', '10');
  return `${API_BASE_URL}?${params.toString()}`;
}

function normalizeDocument(entry) {
  const title = String(entry?.title || '').trim();
  const publicationDate = String(entry?.publication_date || '').trim();
  if (!title || !publicationDate) return null;

  return {
    title,
    publicationDate,
    type: String(entry?.type || entry?.document_type || 'Notice').trim(),
    documentNumber: String(entry?.document_number || 'N/A').trim(),
    url: normalizeUrl(entry?.html_url || entry?.full_text_xml_url || entry?.pdf_url || ''),
    summary: String(entry?.abstract || entry?.excerpt || '').replace(/\s+/g, ' ').trim(),
  };
}

function isRelevantUasDocument(doc) {
  const haystack = `${doc.title} ${doc.summary}`.toLowerCase();
  return /unmanned|uas|drone|bvlos|remote id|waiver process/.test(haystack);
}

function classifyStage(doc) {
  const haystack = `${doc.title} ${doc.summary}`.toLowerCase();

  if (/implementing section 927 waiver process/.test(haystack)) {
    return {
      label: 'Section 927 waiver process active',
      score: 4,
      signalStatus: 'watch',
      summary: 'FAA has moved from generic discussion into a concrete waiver-process implementation notice for certain unmanned aircraft operations.',
    };
  }

  if (/reopening of comment period/.test(haystack) && /beyond visual line of sight|bvlos|unmanned aircraft/.test(haystack)) {
    return {
      label: 'BVLOS comment period reopened',
      score: 3,
      signalStatus: 'watch',
      summary: 'BVLOS rulemaking remains active, but the process is still in a notice-and-comment stage rather than final implementation.',
    };
  }

  if (/normalizing .*beyond visual line of sight operations|notice of proposed rulemaking|proposed rule/.test(haystack)) {
    return {
      label: 'BVLOS proposal active',
      score: 3,
      signalStatus: 'watch',
      summary: 'FAA has a live proposed-rule path for broader UAS operations, but the policy is not final yet.',
    };
  }

  if (/final rule|adopting/.test(haystack)) {
    return {
      label: 'Final rule published',
      score: 5,
      signalStatus: 'clear',
      summary: 'FAA has published a final rule or adoption milestone, which is the cleanest form of regulatory progress.',
    };
  }

  if (/withdrawal/.test(haystack)) {
    return {
      label: 'Proposal withdrawn',
      score: 1,
      signalStatus: 'alert',
      summary: 'A withdrawal signals a material setback in the current rulemaking path.',
    };
  }

  return {
    label: 'Regulatory activity active',
    score: 2,
    signalStatus: 'watch',
    summary: 'FAA regulatory activity is visible in the official record, but the latest milestone does not yet clear as a final operational rule.',
  };
}

function buildSignals(latestStage, documents) {
  const signals = [`FAA_REG_${latestStage.signalStatus.toUpperCase()}`];

  if (latestStage.score < 5) {
    signals.push('FAA_RULE_NOT_FINAL');
  }
  if (documents.some(doc => /beyond visual line of sight|bvlos/i.test(doc.title))) {
    signals.push('FAA_BVLOS_RULEMAKING_ACTIVE');
  }
  if (documents.some(doc => /section 927 waiver process/i.test(doc.title))) {
    signals.push('FAA_SECTION_927_PROCESS_ACTIVE');
  }

  return [...new Set(signals)];
}

function formatStageChange(latestStage, priorStage) {
  if (!priorStage) return 'N/A';
  const delta = latestStage.score - priorStage.score;
  if (delta === 0) return 'stage unchanged';
  return `${delta > 0 ? '+' : ''}${delta} stage`;
}

function normalizeUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return 'N/A';
  if (raw.startsWith('http')) return raw;
  return `https://www.federalregister.gov${raw.startsWith('/') ? '' : '/'}${raw}`;
}
