/**
 * acquisition-radar.mjs — M&A activity across the thesis universe, with
 * strategic-intent classification: what is each acquisition trying to accomplish?
 *
 * Scans SEC filings (free, no key) for acquisition events:
 *   - 8-K item 2.01 (completion of acquisition/disposition)
 *   - 8-K item 1.01 (material agreement — kept only if the filing text
 *     confirms merger/acquisition language)
 *   - S-4 / 425 / DEFM14A (merger registrations and communications)
 *
 * For each hit, the primary document is fetched and keyword-scanned to
 * classify strategic intent (capacity, vertical integration, technology,
 * market expansion, consolidation, pipeline, diversification) and to
 * extract the deal's stated-purpose snippet.
 *
 * Usage:
 *   node run.mjs pull acquisition-radar                 # full universe, last 120 days
 *   node run.mjs pull acquisition-radar --days 30
 *   node run.mjs pull acquisition-radar --thesis drones
 *   node run.mjs pull acquisition-radar --tickers KTOS,AVAV --dry-run
 *
 * Output: 05_Data_Pulls/Company_Risk/YYYY-MM-DD_Acquisition_Radar.md
 */

import { join } from 'path';
import { getPullsDir } from '../lib/config.mjs';
import { fetchRecentFilings, EDGAR_USER_AGENT, EDGAR_MIN_INTERVAL_MS } from '../lib/edgar.mjs';
import { THESIS_COMPANIES, stripCik } from '../lib/cik-map.mjs';
import { sleep } from '../lib/fetcher.mjs';
import {
  buildNote, buildTable, writeNote,
  today, dateStampedFilename,
} from '../lib/markdown.mjs';

const MA_FORMS = ['8-K', 'S-4', '425', 'DEFM14A', 'SC TO-T'];
const MAX_DOCS_PER_TICKER = 3;
const DOC_SCAN_CHARS = 60_000; // scan the head of the doc — purpose language is up front

/** Strategic-intent taxonomy: what is the acquisition trying to accomplish? */
const INTENT_CATEGORIES = {
  vertical_integration: {
    label: 'Vertical integration / supply security',
    patterns: ['vertically integrat', 'supply chain', 'secure supply', 'upstream', 'downstream', 'in-house', 'internalize'],
  },
  capacity_scale: {
    label: 'Capacity / scale',
    patterns: ['capacity', 'expand production', 'manufacturing footprint', 'scale', 'throughput'],
  },
  technology_talent: {
    label: 'Technology / IP / talent',
    patterns: ['technology', 'intellectual property', 'patents', 'platform', 'capabilities', 'engineering team', 'talent', 'know-how'],
  },
  market_expansion: {
    label: 'Market / geographic expansion',
    patterns: ['new market', 'geographic', 'expand into', 'customer base', 'distribution network', 'international expansion'],
  },
  consolidation: {
    label: 'Consolidation / synergies',
    patterns: ['synerg', 'cost savings', 'complementary', 'combined company', 'market share', 'economies of scale'],
  },
  pipeline: {
    label: 'Pipeline / product portfolio',
    patterns: ['pipeline', 'clinical', 'drug candidate', 'product portfolio', 'therapeutic'],
  },
  diversification: {
    label: 'Diversification',
    patterns: ['diversif', 'new segment', 'adjacent market'],
  },
};

// Note: 'purchase agreement' is deliberately absent — securities purchase
// agreements (dilution financings, 8-K 1.01+3.02/2.03) are not M&A.
const CONFIRM_PATTERNS = ['merger agreement', 'acquisition of', 'to acquire', 'business combination', 'tender offer', 'acquired all of the outstanding'];

export async function pull(flags = {}) {
  const days = parseInt(flags.days) || 120;
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const universe = selectUniverse(flags);

  console.log(`🤝 Acquisition Radar: ${universe.length} companies, filings since ${since}...\n`);

  const deals = [];
  for (const c of universe) {
    try {
      const found = await scanCompany(c, since);
      deals.push(...found);
      if (found.length) console.log(`  🤝 ${c.ticker}: ${found.length} M&A filing(s)`);
    } catch (err) {
      console.warn(`  ⚠️ ${c.ticker}: ${err.message}`);
    }
  }

  deals.sort((a, b) => b.filingDate.localeCompare(a.filingDate));
  console.log(`\n🤝 ${deals.length} acquisition-related filings across ${new Set(deals.map(d => d.ticker)).size} companies`);

  const note = buildRadarNote({ deals, since, universeSize: universe.length });
  const filePath = join(getPullsDir(), 'Company_Risk', dateStampedFilename('Acquisition_Radar'));

  if (flags['dry-run']) {
    console.log(note);
    return { filePath: null, deals: deals.length, signal_status: 'clear' };
  }

  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, deals: deals.length, signal_status: deals.length > 0 ? 'watch' : 'clear' };
}

// ─── Universe ───────────────────────────────────────────────────────────────────

function selectUniverse(flags) {
  let entries = Object.entries(THESIS_COMPANIES).map(([ticker, meta]) => ({ ticker, ...meta }));
  if (flags.tickers) {
    const wanted = new Set(flags.tickers.split(',').map(t => t.trim().toUpperCase()));
    entries = entries.filter(e => wanted.has(e.ticker));
    if (!entries.length) throw new Error(`No universe tickers match: ${flags.tickers}`);
  } else if (flags.thesis) {
    entries = entries.filter(e => e.thesis === flags.thesis);
    if (!entries.length) throw new Error(`No companies for thesis "${flags.thesis}"`);
  }
  const limit = parseInt(flags.limit) || entries.length;
  return entries.slice(0, limit);
}

// ─── Per-company scan ───────────────────────────────────────────────────────────

async function scanCompany({ ticker, name, cik, thesis }, since) {
  const filings = await fetchRecentFilings(cik, { formTypes: MA_FORMS, since });

  const candidates = filings.filter(f =>
    f.formType !== '8-K' || f.items.includes('2.01') || f.items.includes('1.01')
  ).slice(0, MAX_DOCS_PER_TICKER);

  const deals = [];
  for (const filing of candidates) {
    const doc = await fetchFilingText(cik, filing);
    if (!doc) continue;

    const confirmed = filing.formType !== '8-K' || filing.items.includes('2.01')
      || CONFIRM_PATTERNS.some(p => doc.includes(p));
    if (!confirmed) continue; // 1.01 agreements that aren't M&A (leases, credit lines, ...)

    deals.push(Object.freeze({
      ticker, name, thesis,
      formType: filing.formType,
      filingDate: filing.filingDate,
      items: filing.items,
      target: extractTarget(doc),
      intents: classifyIntent(doc),
      purpose: extractPurpose(doc),
      docUrl: filingDocUrl(cik, filing),
    }));
  }
  return deals;
}

async function fetchFilingText(cik, filing) {
  if (!filing.primaryDoc || !filing.accession) return null;
  await sleep(EDGAR_MIN_INTERVAL_MS);
  const url = filingDocUrl(cik, filing);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': EDGAR_USER_AGENT }, signal: AbortSignal.timeout(20_000) });
    if (!res.ok) return null;
    const html = (await res.text()).slice(0, DOC_SCAN_CHARS * 4);
    return html
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;|&#160;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .slice(0, DOC_SCAN_CHARS);
  } catch {
    return null;
  }
}

function filingDocUrl(cik, filing) {
  return `https://www.sec.gov/Archives/edgar/data/${stripCik(cik)}/${filing.accession}/${filing.primaryDoc}`;
}

// ─── Text analysis ──────────────────────────────────────────────────────────────

function classifyIntent(doc) {
  const hits = Object.entries(INTENT_CATEGORIES)
    .map(([key, cat]) => ({
      key,
      label: cat.label,
      count: cat.patterns.reduce((n, p) => n + (doc.includes(p) ? 1 : 0), 0),
    }))
    .filter(h => h.count > 0)
    .sort((a, b) => b.count - a.count);
  return hits.slice(0, 3);
}

function extractTarget(doc) {
  const m = doc.match(/(?:acquisition of|to acquire|merger with)\s+([a-z][\w.&'’ -]{2,60}?)(?:\s+on\s|\s*[,(.]|\s+(?:a|an|the|and|in|for|pursuant)\s)/i);
  if (!m) return null;
  const target = m[1].trim();
  // Reject generic captures that aren't company names
  const junk = ['class', 'all', 'certain', 'substantially all', 'each', 'any', 'common stock', 'shares'];
  if (target.length < 3 || junk.includes(target)) return null;
  return titleCase(target);
}

function extractPurpose(doc) {
  // Look for the sentence that states what the deal accomplishes.
  const markers = ['is expected to', 'will enable', 'strengthens', 'expands', 'accelerates', 'enhances', 'positions the company'];
  for (const marker of markers) {
    const idx = doc.indexOf(marker);
    if (idx === -1) continue;
    const start = Math.max(0, doc.lastIndexOf('.', idx) + 1);
    const end = doc.indexOf('.', idx + marker.length);
    const sentence = doc.slice(start, end === -1 ? idx + 300 : end + 1).trim();
    if (sentence.length > 40 && sentence.length < 500) return sentence;
  }
  return null;
}

function titleCase(s) {
  return s.replace(/\b\w/g, ch => ch.toUpperCase());
}

// ─── Note builder ───────────────────────────────────────────────────────────────

function buildRadarNote({ deals, since, universeSize }) {
  const rows = deals.map(d => [
    d.ticker,
    d.thesis ?? '',
    d.formType + (d.items.length ? ` (${d.items.join(',')})` : ''),
    d.filingDate,
    d.target ?? '—',
    d.intents.map(i => i.label).join('; ') || 'unclassified',
  ]);

  const dealSections = deals.map(d => ({
    heading: `${d.ticker} — ${d.formType} ${d.filingDate}${d.target ? ` — ${d.target}` : ''}`,
    content: [
      d.intents.length
        ? `**Trying to accomplish:** ${d.intents.map(i => `${i.label} (${i.count} markers)`).join(', ')}`
        : '**Trying to accomplish:** unclassified — read the filing.',
      d.purpose ? `\n> ${d.purpose}` : '',
      `\n- Thesis: ${d.thesis ? `[[${d.thesis}]]` : 'none'}`,
      `- Filing: ${d.docUrl}`,
    ].filter(Boolean).join('\n'),
  }));

  return buildNote({
    frontmatter: {
      title: 'Acquisition Radar',
      source: 'SEC EDGAR (8-K/S-4/425/DEFM14A)',
      date_pulled: today(),
      domain: 'company_risk',
      data_type: 'acquisition_radar',
      window_since: since,
      deal_count: deals.length,
      acquirers: [...new Set(deals.map(d => d.ticker))],
      signal_status: deals.length > 0 ? 'watch' : 'clear',
      tags: ['company-risk', 'acquisitions', 'ma'],
      related_pulls: [],
    },
    sections: [
      {
        heading: `M&A filings since ${since} (${universeSize} companies scanned)`,
        content: deals.length
          ? buildTable(['Acquirer', 'Thesis', 'Form', 'Date', 'Target (best-effort)', 'Strategic Intent'], rows)
          : 'No acquisition-related filings found in the window.',
      },
      ...dealSections,
      {
        heading: 'Method',
        content: [
          '- Forms: 8-K (items 2.01, and 1.01 when the text confirms M&A language), S-4, 425, DEFM14A, SC TO-T.',
          '- Intent = keyword-marker classification over the filing head; target/purpose extraction is best-effort — always open the filing before acting.',
          '- Intent taxonomy lives in `scripts/pullers/acquisition-radar.mjs` (`INTENT_CATEGORIES`).',
        ].join('\n'),
      },
    ],
  });
}
