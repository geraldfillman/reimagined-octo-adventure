/**
 * uspto.mjs — USPTO Open Data Portal patent tracker
 *
 * Uses api.uspto.gov (x-api-key from PATENTSVIEW_API_KEY in .env).
 * PatentsView full-text search is mid-migration — this puller uses two
 * endpoints that are fully live:
 *
 *   1. PTAB Proceedings (/api/v1/patent/trials/proceedings/search)
 *      Patent challenges (IPR/PGR) — high-signal for biotech/defense theses.
 *      A successful IPR can void a core patent and crater a stock.
 *
 *   2. Recent Filings (/api/v1/patent/applications/search)
 *      Scans recent applications for thesis keywords in inventionTitle.
 *      Client-side filter over most-recent page of filings.
 *
 * When PatentsView full-text search migration completes, upgrade to use
 * /api/v1/patentsview/patents/query with topic term search.
 *
 * Usage:
 *   node run.mjs uspto --ptab          # Recent PTAB proceedings (default)
 *   node run.mjs uspto --filings       # Recent filings, thesis keyword scan
 *   node run.mjs uspto --all           # Both pulls
 *   node run.mjs uspto --limit <n>     # Records to scan (default: 100)
 */

import { join } from 'path';
import { getPullsDir } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import { buildNote, buildTable, writeNote, today, dateStampedFilename } from '../lib/markdown.mjs';
import { evaluatePatentVelocity, highestSeverity, formatSignalsSection } from '../lib/signals.mjs';

const BASE = 'https://api.uspto.gov/api/v1/patent';

// Technology center → domain mapping
const TC_MAP = {
  '1600': 'Biotech / Pharma',
  '1700': 'Chemical / Materials',
  '2100': 'Software / AI',
  '2400': 'Networking / Communications',
  '2600': 'Semiconductors',
  '2900': 'Design Patents',
  '3600': 'Transportation / Defense',
  '3700': 'Mechanical / Manufacturing',
};

// Thesis keyword sets for title scanning
const THESIS_KEYWORDS = {
  drones: ['drone', 'uav', 'unmanned aerial', 'evtol', 'vtol', 'autonomous aircraft', 'uncrewed', 'rpas', 'quadrotor'],
  defense: ['autonomous weapon', 'directed energy', 'target recognition', 'loitering munition', 'combat aircraft', 'electronic warfare', 'hypersonic'],
  amr: ['antimicrobial', 'antibiotic resistance', 'bacteriophage', 'carbapenem', 'mrsa', 'beta-lactam', 'novel antibiotic'],
  psychedelics: ['psilocybin', 'mdma', 'psychedelic', 'ibogaine', 'ketamine', 'serotonergic', '5-meo-dmt'],
};

// Thesis tech centers (for PTAB relevance tagging)
const THESIS_TC = {
  drones:     ['3600'],
  defense:    ['3600', '2100', '2400'],
  amr:        ['1600'],
  psychedelics: ['1600'],
};

export async function pull(flags = {}) {
  const apiKey = process.env.PATENTSVIEW_API_KEY;
  if (!apiKey) {
    console.error(`❌ USPTO: PATENTSVIEW_API_KEY not set.`);
    console.error(`   Register at: https://data.uspto.gov`);
    throw new Error('Missing PATENTSVIEW_API_KEY');
  }

  const doPtab     = flags.ptab || flags.all || (!flags.filings);
  const doFilings  = flags.filings || flags.all;

  const results = [];
  if (doPtab)    results.push(await pullPtab(flags, apiKey));
  if (doFilings) results.push(await pullFilings(flags, apiKey));
  return results;
}

// ─── PTAB Proceedings ────────────────────────────────────────────────────────

async function pullPtab(flags, apiKey) {
  const limit = parseInt(flags.limit) || 100;
  console.log(`⚖️  USPTO PTAB: Fetching ${limit} most recent proceedings...`);

  const params = new URLSearchParams({
    rows:      String(limit),
    sortField: 'trialLastModifiedDate',
    sortOrder: 'desc',
  });

  const data = await getJson(`${BASE}/trials/proceedings/search?${params}`, {
    headers: { 'x-api-key': apiKey, Accept: 'application/json' },
  });

  const proceedings = data.patentTrialProceedingDataBag ?? [];
  const total       = data.count ?? 0;
  console.log(`  ${total.toLocaleString()} total PTAB proceedings, showing ${proceedings.length} most recent`);

  // Tag each proceeding with thesis relevance via tech center
  const tagged = proceedings.map(p => {
    const tc       = p.patentOwnerData?.technologyCenterNumber ?? '';
    const tcLabel  = TC_MAP[tc] ?? `TC${tc}`;
    const theses   = Object.entries(THESIS_TC)
      .filter(([, tcs]) => tcs.includes(tc))
      .map(([name]) => name);
    return { ...p, tcLabel, theses };
  });

  // Flag any in thesis-relevant tech centers
  const relevant = tagged.filter(p => p.theses.length > 0);
  console.log(`  ${relevant.length} in thesis-relevant tech centers (biotech/defense/AI)`);

  // Preview
  relevant.slice(0, 5).forEach(p => {
    const trial    = p.trialNumber ?? 'N/A';
    const type     = p.trialMetaData?.trialTypeCode ?? '?';
    const status   = p.trialMetaData?.trialStatusCategory ?? '?';
    const patent   = p.patentOwnerData?.patentNumber ?? '?';
    console.log(`  [${type}] ${trial} — Patent ${patent} (${p.tcLabel}) — ${status}`);
  });

  // Signal: spike in relevant proceedings
  const signals = [];
  const sig = evaluatePatentVelocity(relevant.length, 'PTAB thesis-relevant', limit);
  if (sig) signals.push(sig);

  if (signals.length) {
    console.log(`\n⚡ ${signals.length} signal(s):`);
    signals.forEach(s => console.log(`  🟡 ${s.message}`));
  } else {
    console.log(`⚪ No signals.`);
  }

  // Build rows
  const rows = tagged.map(p => [
    p.trialNumber                                ?? 'N/A',
    p.trialMetaData?.trialTypeCode               ?? 'N/A',
    p.patentOwnerData?.patentNumber              ?? 'N/A',
    p.tcLabel,
    p.theses.join(', ') || '—',
    p.trialMetaData?.trialStatusCategory         ?? 'N/A',
    (p.trialMetaData?.petitionFilingDate ?? 'N/A').slice(0, 10),
    (p.trialMetaData?.trialLastModifiedDate ?? 'N/A').slice(0, 10),
  ]);

  const note = buildNote({
    frontmatter: {
      title:         'USPTO PTAB Proceedings — Recent',
      source:        'USPTO Open Data Portal (api.uspto.gov)',
      date_pulled:   today(),
      total_count:   total,
      thesis_relevant: relevant.length,
      domain:        'patents',
      data_type:     'ptab_proceedings',
      frequency:     'daily',
      signal_status: highestSeverity(signals),
      signals:       signals.map(s => ({ id: s.id, severity: s.severity, message: s.message })),
      tags:          ['patents', 'ptab', 'ipr', 'government', 'legal'],
    },
    sections: [
      {
        heading: `PTAB Proceedings — ${proceedings.length} Most Recent (${total.toLocaleString()} total)`,
        content: buildTable(
          ['Trial #', 'Type', 'Patent', 'Tech Area', 'Thesis', 'Status', 'Filed', 'Modified'],
          rows
        ),
      },
      ...(signals.length ? [{ heading: 'Signals', content: formatSignalsSection(signals) }] : []),
      {
        heading: 'PTAB Type Guide',
        content: [
          '- **IPR** — Inter Partes Review: challenges patent validity on prior art',
          '- **PGR** — Post-Grant Review: broader challenge within 9 months of grant',
          '- **CBM** — Covered Business Method: software/finance patents only',
          '- **IPR Filed Against Thesis Company** = bearish signal — monitor for institution decision',
          '',
          `- **API**: api.uspto.gov/api/v1/patent/trials/proceedings/search`,
          `- **Auto-pulled**: ${today()}`,
        ].join('\n'),
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Government', dateStampedFilename('USPTO_PTAB'));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals, total, relevant: relevant.length };
}

// ─── Recent Filings Title Scan ────────────────────────────────────────────────

async function pullFilings(flags, apiKey) {
  const limit = parseInt(flags.limit) || 200;
  console.log(`\n📄 USPTO Filings: Scanning ${limit} most recent applications for thesis keywords...`);

  const params = new URLSearchParams({
    rows:      String(limit),
    sortField: 'filingDate',
    sortOrder: 'desc',
  });

  const data = await getJson(`${BASE}/applications/search?${params}`, {
    headers: { 'x-api-key': apiKey, Accept: 'application/json' },
  });

  const filings = data.patentFileWrapperDataBag ?? [];
  const total   = data.count ?? 0;
  console.log(`  ${total.toLocaleString()} total applications on file, scanning ${filings.length} most recent`);

  // Client-side keyword filter across all theses
  const matches = [];
  for (const f of filings) {
    const title    = (f.applicationMetaData?.inventionTitle ?? '').toLowerCase();
    const assignee = f.assignmentBag?.[0]?.assigneeBag?.[0]?.assigneeNameText ?? '';
    const filed    = f.applicationMetaData?.filingDate ?? '';

    for (const [thesis, keywords] of Object.entries(THESIS_KEYWORDS)) {
      const matched = keywords.filter(kw => title.includes(kw));
      if (matched.length > 0) {
        matches.push({
          thesis,
          title:    f.applicationMetaData?.inventionTitle ?? 'N/A',
          assignee: assignee || (f.applicationMetaData?.firstApplicantName ?? 'N/A'),
          appNum:   f.applicationNumberText ?? 'N/A',
          filed,
          keywords: matched,
        });
        break; // one thesis match per filing
      }
    }
  }

  // Group by thesis
  const byThesis = {};
  for (const m of matches) {
    if (!byThesis[m.thesis]) byThesis[m.thesis] = [];
    byThesis[m.thesis].push(m);
  }

  console.log(`  Found ${matches.length} thesis-relevant filings in scan:`);
  for (const [thesis, items] of Object.entries(byThesis)) {
    console.log(`    ${thesis}: ${items.length}`);
    items.slice(0, 2).forEach(i => console.log(`      - ${i.title.slice(0, 60)} [${i.assignee}]`));
  }

  // Build per-thesis sections
  const sections = [];
  for (const [thesis, items] of Object.entries(byThesis)) {
    const rows = items.map(i => [
      i.appNum,
      i.title.length > 55 ? i.title.slice(0, 55) + '…' : i.title,
      i.assignee.length > 30 ? i.assignee.slice(0, 30) + '…' : i.assignee,
      i.filed.slice(0, 10),
      i.keywords.join(', '),
    ]);
    sections.push({
      heading: `${thesis.charAt(0).toUpperCase() + thesis.slice(1)} (${items.length})`,
      content: buildTable(['App #', 'Title', 'Applicant', 'Filed', 'Matched Keywords'], rows),
    });
  }

  if (sections.length === 0) {
    sections.push({ heading: 'Results', content: `No thesis-relevant keywords found in ${filings.length} most recent filings scanned.` });
  }

  const note = buildNote({
    frontmatter: {
      title:        'USPTO Recent Filings — Thesis Keyword Scan',
      source:       'USPTO Open Data Portal (api.uspto.gov)',
      date_pulled:  today(),
      scanned:      filings.length,
      matches:      matches.length,
      domain:       'patents',
      data_type:    'filing_scan',
      frequency:    'daily',
      signal_status: 'clear',
      signals:      [],
      tags:         ['patents', 'filings', 'government'],
    },
    sections: [
      ...sections,
      {
        heading: 'Notes',
        content: [
          `- Scanned ${filings.length} most recently filed applications`,
          `- Client-side keyword match on inventionTitle field`,
          `- When PatentsView migration completes, upgrade to full-text search`,
          `- **API**: api.uspto.gov/api/v1/patent/applications/search`,
          `- **Auto-pulled**: ${today()}`,
        ].join('\n'),
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Government', dateStampedFilename('USPTO_Filings_Scan'));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, matches: matches.length };
}
