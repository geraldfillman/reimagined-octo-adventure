/**
 * arxiv.mjs — arXiv preprint puller
 *
 * Uses the arXiv Atom API (export.arxiv.org/api/query) — no API key required.
 * Parses Atom XML with regex since Node.js has no built-in DOM parser.
 *
 * Thesis-aligned category + keyword queries:
 *   --drones      cs.RO + cs.SY: UAV, autonomous aircraft, drone navigation
 *   --defense     cs.AI + cs.CV + cs.RO: target recognition, autonomous weapon systems
 *   --amr         q-bio.QM + q-bio.GN: antimicrobial, antibiotic resistance, bacteriophage
 *   --psychedelics q-bio.NC + q-bio.QM: psilocybin, serotonin receptor, psychedelic
 *   --all         All four queries in sequence
 *
 * Usage:
 *   node run.mjs arxiv --drones
 *   node run.mjs arxiv --amr
 *   node run.mjs arxiv --all
 */

import { mkdirSync } from 'fs';
import { join } from 'path';
import { getPullsDir } from '../lib/config.mjs';
import { fetchWithRetry } from '../lib/fetcher.mjs';
import { buildNote, buildTable, writeNote, today, dateStampedFilename } from '../lib/markdown.mjs';

const BASE_URL = 'https://export.arxiv.org/api/query';
const MAX_RESULTS = 25;

const TOPICS = {
  drones: {
    label: 'Drones & Autonomous Aircraft',
    query: '(ti:drone OR ti:UAV OR ti:"unmanned aerial" OR ti:eVTOL OR ti:"autonomous aircraft" OR ti:quadrotor OR ti:BVLOS) AND (cat:cs.RO OR cat:eess.SY OR cat:cs.SY)',
    tags: ['research', 'arxiv', 'drones', 'robotics'],
    outputName: 'arXiv_Drones',
  },
  defense: {
    label: 'Defense AI & Autonomous Weapons',
    query: '(ti:"autonomous weapon" OR ti:"target recognition" OR ti:"directed energy" OR ti:"loitering munition" OR ti:"counter-UAV" OR ti:"combat drone" OR abs:"autonomous lethal") AND (cat:cs.AI OR cat:cs.RO OR cat:cs.CV OR cat:eess.SY)',
    tags: ['research', 'arxiv', 'defense', 'ai'],
    outputName: 'arXiv_DefenseAI',
  },
  amr: {
    label: 'Antimicrobial Resistance',
    query: '(ti:antimicrobial OR ti:"antibiotic resistance" OR ti:MRSA OR ti:carbapenem OR ti:bacteriophage OR ti:"AMR") AND (cat:q-bio.QM OR cat:q-bio.GN OR cat:q-bio.OT OR cat:q-bio.PE)',
    tags: ['research', 'arxiv', 'amr', 'biotech'],
    outputName: 'arXiv_AMR',
  },
  psychedelics: {
    label: 'Psychedelic Therapeutics',
    query: '(ti:psilocybin OR ti:MDMA OR ti:psychedelic OR ti:ketamine OR ti:"serotonin receptor" OR ti:ibogaine OR ti:"5-MeO-DMT") AND (cat:q-bio.NC OR cat:q-bio.QM OR cat:cs.NE)',
    tags: ['research', 'arxiv', 'psychedelics', 'biotech'],
    outputName: 'arXiv_Psychedelics',
  },
  glp1: {
    label: 'GLP-1 & Metabolic Disease',
    query: '(ti:"GLP-1" OR ti:semaglutide OR ti:tirzepatide OR ti:"glucagon-like peptide" OR ti:obesity OR ti:NASH OR ti:"metabolic syndrome") AND (cat:q-bio.QM OR cat:q-bio.MN OR cat:q-bio.TO)',
    tags: ['research', 'arxiv', 'glp1', 'biotech', 'metabolic'],
    outputName: 'arXiv_GLP1',
  },
  geneediting: {
    label: 'Gene Editing & CRISPR',
    query: '(ti:CRISPR OR ti:"base editing" OR ti:"prime editing" OR ti:"gene editing" OR ti:"Cas9" OR ti:"Cas12" OR ti:"AAV delivery" OR ti:"in vivo editing") AND (cat:q-bio.GN OR cat:q-bio.QM OR cat:q-bio.MN)',
    tags: ['research', 'arxiv', 'geneediting', 'crispr', 'biotech'],
    outputName: 'arXiv_GeneEditing',
  },
  alzheimers: {
    label: 'Alzheimer\'s Disease',
    query: '(ti:"amyloid beta" OR ti:"tau protein" OR ti:"neurodegeneration" OR ti:"Alzheimer" OR ti:"lecanemab" OR ti:"donanemab" OR ti:"APOE4") AND (cat:q-bio.NC OR cat:q-bio.QM OR cat:q-bio.MN)',
    tags: ['research', 'arxiv', 'alzheimers', 'neurology', 'biotech'],
    outputName: 'arXiv_Alzheimers',
  },
  longevity: {
    label: 'Longevity & Aging Biology',
    query: '(ti:senolytic OR ti:"epigenetic clock" OR ti:rapamycin OR ti:"aging biology" OR ti:"cellular senescence" OR ti:longevity OR ti:"mTOR") AND (cat:q-bio.MN OR cat:q-bio.GN OR cat:q-bio.QM)',
    tags: ['research', 'arxiv', 'longevity', 'aging', 'biotech'],
    outputName: 'arXiv_Longevity',
  },
  nuclear: {
    label: 'Nuclear Energy & SMRs',
    query: '(ti:"small modular reactor" OR ti:SMR OR ti:"nuclear reactor" OR ti:"molten salt" OR ti:"thorium reactor" OR ti:"fast reactor" OR ti:"nuclear fusion") AND (cat:physics.ins-det OR cat:cond-mat.supr-con OR cat:nucl-ex)',
    tags: ['research', 'arxiv', 'nuclear', 'energy'],
    outputName: 'arXiv_Nuclear',
  },
  quantum: {
    label: 'Quantum Computing',
    query: '(ti:"quantum computing" OR ti:"quantum error correction" OR ti:"qubit" OR ti:"quantum supremacy" OR ti:"fault-tolerant quantum" OR ti:"quantum advantage" OR ti:"topological qubit") AND (cat:quant-ph OR cat:cs.ET)',
    tags: ['research', 'arxiv', 'quantum', 'computing'],
    outputName: 'arXiv_Quantum',
  },
  humanoid: {
    label: 'Humanoid Robotics',
    query: '(ti:"humanoid robot" OR ti:"bipedal locomotion" OR ti:"whole-body control" OR ti:"robot learning" OR ti:"dexterous manipulation" OR ti:"robot foundation model" OR ti:"imitation learning") AND (cat:cs.RO OR cat:cs.LG OR cat:cs.AI)',
    tags: ['research', 'arxiv', 'humanoid', 'robotics'],
    outputName: 'arXiv_Humanoid',
  },
  space: {
    label: 'Space Domain Awareness',
    query: '(ti:"space domain awareness" OR ti:"satellite constellation" OR ti:"low earth orbit" OR ti:"anti-satellite" OR ti:"space situational awareness" OR ti:"LEO constellation" OR ti:"CubeSat") AND (cat:eess.SP OR cat:cs.NI OR cat:astro-ph.IM)',
    tags: ['research', 'arxiv', 'space', 'defense', 'satellites'],
    outputName: 'arXiv_Space',
  },
};

export async function pull(flags = {}) {
  const topics = [];
  if (flags.all) {
    topics.push(...Object.keys(TOPICS));
  } else {
    if (flags.drones)       topics.push('drones');
    if (flags.defense)      topics.push('defense');
    if (flags.amr)          topics.push('amr');
    if (flags.psychedelics) topics.push('psychedelics');
    if (flags.glp1)         topics.push('glp1');
    if (flags.geneediting)  topics.push('geneediting');
    if (flags.alzheimers)   topics.push('alzheimers');
    if (flags.longevity)    topics.push('longevity');
    if (flags.nuclear)      topics.push('nuclear');
    if (flags.quantum)      topics.push('quantum');
    if (flags.humanoid)     topics.push('humanoid');
    if (flags.space)        topics.push('space');
    if (topics.length === 0) topics.push('drones'); // default
  }

  const outDir = join(getPullsDir(), 'Research');
  mkdirSync(outDir, { recursive: true });

  for (const topicKey of topics) {
    await pullTopic(TOPICS[topicKey], outDir);
  }
}

async function pullTopic(topic, outDir) {
  console.log(`\n📚 arXiv: Fetching "${topic.label}" preprints...`);

  const params = new URLSearchParams({
    search_query: topic.query,
    start:        '0',
    max_results:  String(MAX_RESULTS),
    sortBy:       'submittedDate',
    sortOrder:    'descending',
  });

  const url = `${BASE_URL}?${params}`;
  const result = await fetchWithRetry(url, {
    headers: { 'User-Agent': 'MyData-Vault/1.0 (research puller; contact: vault@local)' },
  });

  if (!result.ok) {
    throw new Error(`arXiv API error ${result.status}`);
  }

  const xml = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
  const entries = parseAtomEntries(xml);
  const totalResults = extractTotal(xml);

  console.log(`  ${totalResults.toLocaleString()} total results, showing ${entries.length} most recent`);
  entries.slice(0, 3).forEach(e => console.log(`  - [${e.published}] ${e.title.slice(0, 70)}`));

  if (entries.length === 0) {
    console.log(`  ⚪ No results found.`);
  }

  // Build rows for table
  const rows = entries.map(e => [
    e.published,
    e.title.length > 60 ? e.title.slice(0, 60) + '…' : e.title,
    e.authors.split(', ').slice(0, 2).join(', ') + (e.authors.split(', ').length > 2 ? ' et al.' : ''),
    e.category,
    `[arXiv](${e.id})`,
  ]);

  const note = buildNote({
    frontmatter: {
      title:         `arXiv Preprints — ${topic.label}`,
      source:        'arXiv (export.arxiv.org)',
      date_pulled:   today(),
      total_results: totalResults,
      shown:         entries.length,
      domain:        'research',
      data_type:     'preprints',
      frequency:     'daily',
      signal_status: 'clear',
      signals:       [],
      tags:          topic.tags,
    },
    sections: [
      {
        heading: `Most Recent Preprints (${entries.length} shown / ${totalResults.toLocaleString()} total)`,
        content: buildTable(
          ['Published', 'Title', 'Authors', 'Category', 'Link'],
          rows
        ),
      },
      {
        heading: 'About This Feed',
        content: [
          `- **Query**: \`${topic.query}\``,
          `- **Sort**: Most recently submitted first`,
          `- **API**: export.arxiv.org/api/query (free, no key required)`,
          `- **Auto-pulled**: ${today()}`,
          '',
          '> arXiv preprints are not peer-reviewed. High submission velocity in a thesis area',
          '> is a leading indicator of institutional R&D investment and upcoming journal publications.',
        ].join('\n'),
      },
    ],
  });

  const filePath = join(outDir, dateStampedFilename(topic.outputName));
  writeNote(filePath, note);
  console.log(`  📝 Wrote: ${filePath}`);
}

// ─── Atom XML Parsers ─────────────────────────────────────────────────────────

function extractTotal(xml) {
  const m = xml.match(/<opensearch:totalResults[^>]*>(\d+)<\/opensearch:totalResults>/);
  return m ? parseInt(m[1], 10) : 0;
}

function parseAtomEntries(xml) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1];
    entries.push(Object.freeze({
      id:        extractTag(block, 'id')?.trim().replace(/\s+/g, '') ?? '',
      title:     cleanText(extractTag(block, 'title')),
      summary:   cleanText(extractTag(block, 'summary')).slice(0, 400),
      published: extractTag(block, 'published')?.slice(0, 10) ?? '',
      updated:   extractTag(block, 'updated')?.slice(0, 10) ?? '',
      authors:   extractAllNames(block),
      category:  extractAttr(block, 'arxiv:primary_category', 'term') ?? '',
    }));
  }
  return entries;
}

function extractTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? m[1] : '';
}

function extractAttr(xml, tag, attr) {
  const m = xml.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i'));
  return m ? m[1] : '';
}

function extractAllNames(block) {
  const names = [];
  const nameRegex = /<name>([^<]+)<\/name>/g;
  let m;
  while ((m = nameRegex.exec(block)) !== null) {
    names.push(m[1].trim());
  }
  return names.join(', ');
}

function cleanText(str) {
  return str
    .replace(/<[^>]+>/g, '')   // strip any nested tags
    .replace(/\s+/g, ' ')      // collapse whitespace
    .trim();
}
