/**
 * pubmed.mjs — PubMed / NCBI E-utilities research puller
 *
 * Uses NCBI E-utilities REST API (eutils.ncbi.nlm.nih.gov) — no API key required.
 * Rate limit: 3 req/sec without key. Adds 350ms delay between calls to stay safe.
 *
 * Two-step fetch pattern (standard for NCBI):
 *   1. esearch  — returns list of PMIDs matching a query
 *   2. esummary — returns metadata for those PMIDs (title, authors, journal, date)
 *
 * Thesis-aligned queries:
 *   --amr          MESH terms for antimicrobial resistance, novel antibiotics
 *   --psychedelics MESH terms for psilocybin, MDMA, psychedelic-assisted therapy
 *   --all          Both queries
 *
 * Usage:
 *   node run.mjs pubmed --amr
 *   node run.mjs pubmed --psychedelics
 *   node run.mjs pubmed --all
 */

import { mkdirSync } from 'fs';
import { join } from 'path';
import { getPullsDir } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import { buildNote, buildTable, writeNote, today, dateStampedFilename } from '../lib/markdown.mjs';

const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const DELAY_MS = 350; // Stay under 3 req/sec rate limit

const TOPICS = {
  amr: {
    label: 'Antimicrobial Resistance',
    // MeSH + free text for breadth on AMR
    query: '(antimicrobial resistance[MeSH] OR "novel antibiotic"[tiab] OR carbapenem-resistant[tiab] OR MRSA[tiab] OR bacteriophage therapy[tiab] OR ESKAPE[tiab] OR "antibiotic pipeline"[tiab]) AND ("last 90 days"[pdat])',
    tags: ['research', 'pubmed', 'amr', 'biotech'],
    outputName: 'PubMed_AMR',
  },
  psychedelics: {
    label: 'Psychedelic-Assisted Therapy',
    // MeSH + tiab for psychedelic therapeutics
    query: '(psilocybin[MeSH] OR MDMA[tiab] OR "psychedelic-assisted"[tiab] OR "ketamine therapy"[tiab] OR ibogaine[tiab] OR "5-MeO-DMT"[tiab] OR "serotonergic psychedelic"[tiab]) AND ("last 90 days"[pdat])',
    tags: ['research', 'pubmed', 'psychedelics', 'biotech'],
    outputName: 'PubMed_Psychedelics',
  },
  glp1: {
    label: 'GLP-1 & Metabolic Disease',
    query: '("GLP-1 receptor agonist"[tiab] OR semaglutide[tiab] OR tirzepatide[tiab] OR "glucagon-like peptide"[MeSH] OR "weight loss"[tiab] AND obesity[MeSH] OR NASH[tiab] OR "metabolic syndrome"[MeSH]) AND ("last 90 days"[pdat])',
    tags: ['research', 'pubmed', 'glp1', 'metabolic', 'biotech'],
    outputName: 'PubMed_GLP1',
  },
  geneediting: {
    label: 'Gene Editing & CRISPR',
    query: '(CRISPR[tiab] OR "base editing"[tiab] OR "prime editing"[tiab] OR "Cas9"[tiab] OR "in vivo gene editing"[tiab] OR "AAV gene therapy"[tiab] OR "gene correction"[tiab]) AND ("last 90 days"[pdat])',
    tags: ['research', 'pubmed', 'geneediting', 'crispr', 'biotech'],
    outputName: 'PubMed_GeneEditing',
  },
  alzheimers: {
    label: 'Alzheimer\'s Disease',
    query: '(alzheimer[MeSH] OR "amyloid beta"[tiab] OR "tau phosphorylation"[tiab] OR lecanemab[tiab] OR donanemab[tiab] OR "blood biomarker"[tiab] AND dementia[MeSH] OR "p-tau 217"[tiab]) AND ("last 90 days"[pdat])',
    tags: ['research', 'pubmed', 'alzheimers', 'neurology', 'biotech'],
    outputName: 'PubMed_Alzheimers',
  },
  longevity: {
    label: 'Longevity & Aging Biology',
    query: '(senolytic[tiab] OR "epigenetic clock"[tiab] OR rapamycin[MeSH] OR "cellular senescence"[MeSH] OR "hallmarks of aging"[tiab] OR "biological age"[tiab] OR "mTOR inhibitor"[tiab]) AND ("last 90 days"[pdat])',
    tags: ['research', 'pubmed', 'longevity', 'aging', 'biotech'],
    outputName: 'PubMed_Longevity',
  },
};

export async function pull(flags = {}) {
  const topics = [];
  if (flags.all) {
    topics.push(...Object.keys(TOPICS));
  } else {
    if (flags.amr)          topics.push('amr');
    if (flags.psychedelics) topics.push('psychedelics');
    if (flags.glp1)         topics.push('glp1');
    if (flags.geneediting)  topics.push('geneediting');
    if (flags.alzheimers)   topics.push('alzheimers');
    if (flags.longevity)    topics.push('longevity');
    if (topics.length === 0) topics.push('amr'); // default
  }

  const outDir = join(getPullsDir(), 'Research');
  mkdirSync(outDir, { recursive: true });

  for (const topicKey of topics) {
    await pullTopic(TOPICS[topicKey]);
  }
}

async function pullTopic(topic) {
  console.log(`\n🔬 PubMed: Fetching "${topic.label}" research...`);

  // Step 1: esearch — find PMIDs
  const searchUrl = `${BASE_URL}/esearch.fcgi?` + new URLSearchParams({
    db:      'pubmed',
    term:    topic.query,
    retmax:  '25',
    retmode: 'json',
    sort:    'pub+date',
    usehistory: 'n',
  });

  const searchData = await getJson(searchUrl);
  const pmids = searchData?.esearchresult?.idlist ?? [];
  const totalCount = parseInt(searchData?.esearchresult?.count ?? '0', 10);

  console.log(`  ${totalCount.toLocaleString()} total results, fetching metadata for ${pmids.length}`);

  if (pmids.length === 0) {
    console.log(`  ⚪ No results found.`);
    return;
  }

  // NCBI rate limit: 3 req/sec without key
  await sleep(DELAY_MS);

  // Step 2: esummary — get metadata for PMIDs
  const summaryUrl = `${BASE_URL}/esummary.fcgi?` + new URLSearchParams({
    db:      'pubmed',
    id:      pmids.join(','),
    retmode: 'json',
    version: '2.0',
  });

  const summaryData = await getJson(summaryUrl);
  const resultMap = summaryData?.result ?? {};

  const articles = pmids
    .map(pmid => {
      const r = resultMap[pmid];
      if (!r) return null;
      return Object.freeze({
        pmid,
        title:   r.title ?? 'N/A',
        journal: r.fulljournalname ?? r.source ?? 'N/A',
        pubdate: r.pubdate ?? 'N/A',
        authors: (r.authors ?? []).slice(0, 3).map(a => a.name).join(', ')
          + ((r.authors?.length ?? 0) > 3 ? ' et al.' : ''),
        type:    r.pubtype?.join(', ') ?? 'Article',
        pmcid:   r.pmcid ?? '',
      });
    })
    .filter(Boolean);

  articles.slice(0, 3).forEach(a =>
    console.log(`  - [${a.pubdate}] ${a.title.slice(0, 65)}`)
  );

  // Build table rows
  const rows = articles.map(a => [
    a.pubdate,
    a.title.length > 60 ? a.title.slice(0, 60) + '…' : a.title,
    a.authors,
    a.journal.length > 35 ? a.journal.slice(0, 35) + '…' : a.journal,
    `[PMID:${a.pmid}](https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/)`,
  ]);

  const note = buildNote({
    frontmatter: {
      title:         `PubMed Research — ${topic.label}`,
      source:        'NCBI PubMed (eutils.ncbi.nlm.nih.gov)',
      date_pulled:   today(),
      total_results: totalCount,
      shown:         articles.length,
      domain:        'research',
      data_type:     'pubmed_articles',
      frequency:     'daily',
      signal_status: 'clear',
      signals:       [],
      tags:          topic.tags,
    },
    sections: [
      {
        heading: `Most Recent Publications (${articles.length} shown / ${totalCount.toLocaleString()} total, last 90 days)`,
        content: buildTable(
          ['Published', 'Title', 'Authors', 'Journal', 'Link'],
          rows
        ),
      },
      {
        heading: 'About This Feed',
        content: [
          `- **Query**: \`${topic.query}\``,
          `- **Sort**: Most recently published first (last 90 days)`,
          `- **API**: NCBI E-utilities (free, no key required, 3 req/sec)`,
          `- **Auto-pulled**: ${today()}`,
          '',
          '> Publication velocity in peer-reviewed journals is a lagging indicator',
          '> (~12-18 months after discovery), but confirms clinical validity and',
          '> precedes FDA breakthrough designations and BARDA contract awards.',
        ].join('\n'),
      },
    ],
  });

  const outDir = join(getPullsDir(), 'Research');
  const filePath = join(outDir, dateStampedFilename(topic.outputName));
  writeNote(filePath, note);
  console.log(`  📝 Wrote: ${filePath}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
