/**
 * clinicaltrials.mjs — ClinicalTrials.gov study puller
 *
 * Uses the ClinicalTrials.gov v2 REST API — no API key required.
 *
 * Usage:
 *   node run.mjs clinicaltrials --oncology      # cancer/oncology recruiting trials (default)
 *   node run.mjs clinicaltrials --cardio        # cardiovascular recruiting trials
 *   node run.mjs clinicaltrials --neuro         # neurology/CNS recruiting trials
 *   node run.mjs clinicaltrials --query <term>  # custom condition search
 */

import { join } from 'path';
import { getPullsDir } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import { buildNote, buildTable, writeNote, today, dateStampedFilename } from '../lib/markdown.mjs';
import { evaluatePhase3Trials, highestSeverity, formatSignalsSection } from '../lib/signals.mjs';

const BASE_URL = 'https://clinicaltrials.gov/api/v2/studies';

const TOPICS = {
  oncology: {
    label: 'Oncology',
    condition: 'cancer OR oncology OR tumor OR carcinoma OR leukemia OR lymphoma',
    tags: ['biotech', 'clinical-trials', 'oncology'],
  },
  cardio: {
    label: 'Cardiovascular',
    condition: 'heart failure OR coronary artery disease OR atrial fibrillation OR hypertension OR stroke',
    tags: ['biotech', 'clinical-trials', 'cardiovascular'],
  },
  neuro: {
    label: 'Neurology',
    condition: 'alzheimer OR parkinson OR multiple sclerosis OR epilepsy OR ALS OR depression',
    tags: ['biotech', 'clinical-trials', 'neurology'],
  },
  amr: {
    label: 'AMR',
    condition: 'antimicrobial resistance OR MRSA OR carbapenem-resistant OR novel antibiotic',
    tags: ['biotech', 'clinical-trials', 'amr', 'antibiotics'],
  },
  glp1: {
    label: 'GLP-1 & Metabolic Disease',
    condition: 'GLP-1 OR semaglutide OR tirzepatide OR liraglutide OR obesity OR NASH OR metabolic syndrome OR type 2 diabetes weight',
    tags: ['biotech', 'clinical-trials', 'glp1', 'metabolic', 'obesity'],
  },
  geneediting: {
    label: 'Gene Editing & CRISPR',
    condition: 'CRISPR OR base editing OR prime editing OR gene editing OR in vivo gene therapy OR AAV gene therapy OR lentiviral gene',
    tags: ['biotech', 'clinical-trials', 'geneediting', 'crispr'],
  },
  alzheimers: {
    label: 'Alzheimer\'s Disease',
    condition: 'alzheimer OR amyloid beta OR tau protein OR lecanemab OR donanemab OR mild cognitive impairment amyloid',
    tags: ['biotech', 'clinical-trials', 'alzheimers', 'neurology'],
  },
  longevity: {
    label: 'Longevity & Aging',
    condition: 'senolytic OR rapamycin OR aging OR cellular senescence OR epigenetic OR healthspan OR longevity',
    tags: ['biotech', 'clinical-trials', 'longevity', 'aging'],
  },
};

export async function pull(flags = {}) {
  let topicKey = 'oncology';
  let customQuery = null;

  if (flags.oncology)        topicKey = 'oncology';
  else if (flags.cardio)     topicKey = 'cardio';
  else if (flags.neuro)      topicKey = 'neuro';
  else if (flags.amr)        topicKey = 'amr';
  else if (flags.glp1)       topicKey = 'glp1';
  else if (flags.geneediting) topicKey = 'geneediting';
  else if (flags.alzheimers) topicKey = 'alzheimers';
  else if (flags.longevity)  topicKey = 'longevity';
  else if (flags.query)      { customQuery = flags.query; topicKey = null; }

  return pullTrials(topicKey, customQuery, flags);
}

async function pullTrials(topicKey, customQuery, flags) {
  const topic = topicKey ? TOPICS[topicKey] : null;
  const label = topic?.label ?? customQuery;
  const condition = topic?.condition ?? customQuery;
  const tags = topic?.tags ?? ['biotech', 'clinical-trials'];
  const limit = parseInt(flags.limit) || 20;

  console.log(`🧬 ClinicalTrials: Fetching ${label} recruiting trials...`);

  const params = new URLSearchParams({
    'query.cond': condition,
    'filter.overallStatus': 'RECRUITING',
    'pageSize': String(limit),
    'format': 'json',
    'sort': 'LastUpdatePostDate:desc',
  });

  const data = await getJson(`${BASE_URL}?${params}`);
  const studies = data.studies || [];
  console.log(`  ${studies.length} recruiting studies retrieved`);

  const trials = studies.map(s => {
    const id = s.protocolSection?.identificationModule ?? {};
    const status = s.protocolSection?.statusModule ?? {};
    const design = s.protocolSection?.designModule ?? {};
    const sponsor = s.protocolSection?.sponsorCollaboratorsModule ?? {};
    const conds = s.protocolSection?.conditionsModule ?? {};
    const arms = s.protocolSection?.armsInterventionsModule ?? {};

    const phases = design.phases ?? [];
    const interventions = [...new Set((arms.interventions ?? []).map(i => i.name))];

    return {
      nctId: id.nctId ?? 'N/A',
      title: id.briefTitle ?? 'N/A',
      status: status.overallStatus ?? 'N/A',
      phases,
      conditions: (conds.conditions ?? []).slice(0, 2),
      interventions: interventions.slice(0, 2),
      sponsorName: sponsor.leadSponsor?.name ?? 'N/A',
      sponsorClass: sponsor.leadSponsor?.class ?? 'N/A',
      lastUpdated: status.lastUpdatePostDateStruct?.date ?? 'N/A',
      startDate: status.startDateStruct?.date ?? 'N/A',
      completionDate: status.primaryCompletionDateStruct?.date ?? 'N/A',
    };
  });

  trials.slice(0, 5).forEach(t => {
    const phase = t.phases.join('/') || 'N/A';
    console.log(`  [${phase}] ${t.title.slice(0, 60)} — ${t.sponsorName}`);
  });

  // Signal: count of Phase 3 industry-sponsored trials
  const phase3Industry = trials.filter(
    t => t.phases.includes('PHASE3') && t.sponsorClass === 'INDUSTRY'
  );
  const signals = [];
  const signal = evaluatePhase3Trials(phase3Industry.length, label);
  if (signal) signals.push(signal);

  if (signals.length > 0) {
    console.log(`\n⚡ ${signals.length} signal(s):`);
    signals.forEach(s => console.log(`  🟠 ${s.message}`));
  } else {
    console.log(`⚪ No signals — all clear.`);
  }

  const rows = trials.map(t => [
    t.nctId,
    t.title.length > 55 ? t.title.slice(0, 55) + '…' : t.title,
    t.phases.join('/') || 'N/A',
    t.sponsorName.length > 30 ? t.sponsorName.slice(0, 30) + '…' : t.sponsorName,
    t.interventions.join(', ').slice(0, 40) || 'N/A',
    t.completionDate,
    t.lastUpdated,
  ]);

  const note = buildNote({
    frontmatter: {
      title: `Clinical Trials — ${label}`,
      source: 'ClinicalTrials.gov v2 API',
      topic: label,
      date_pulled: today(),
      domain: 'biotech',
      data_type: 'event_list',
      frequency: 'daily',
      filter: 'RECRUITING',
      signal_status: highestSeverity(signals),
      signals: signals.map(s => ({ id: s.id, severity: s.severity, message: s.message })),
      tags,
    },
    sections: [
      {
        heading: `Recruiting ${label} Trials (${studies.length})`,
        content: buildTable(
          ['NCT ID', 'Title', 'Phase', 'Sponsor', 'Interventions', 'Est. Completion', 'Last Updated'],
          rows
        ),
      },
      ...(signals.length > 0 ? [{ heading: 'Signals', content: formatSignalsSection(signals) }] : []),
      {
        heading: 'Source',
        content: [
          `- **API**: ClinicalTrials.gov v2 (/api/v2/studies)`,
          `- **Filter**: RECRUITING status, sorted by last update`,
          `- **Query**: ${condition}`,
          `- **No API key required**`,
          `- **Auto-pulled**: ${today()}`,
        ].join('\n'),
      },
    ],
  });

  const suffix = topicKey ? `ClinicalTrials_${label}` : 'ClinicalTrials_Custom';
  const filePath = join(getPullsDir(), 'Biotech', dateStampedFilename(suffix));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals };
}
