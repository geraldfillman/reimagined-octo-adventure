/**
 * biofood.mjs - Bioengineered food systems thesis pull.
 *
 * Combines research velocity, food-safety/regulatory pulse, SEC filings, and
 * public-market watchlist context into one repeatable thesis evidence note.
 *
 * Usage:
 *   node run.mjs pull biofood
 *   node run.mjs pull biofood --tickers CTVA,ADM,IFF,DNA,TWST,BYND
 *   node run.mjs pull biofood --lookback 120 --limit 20
 *   node run.mjs pull biofood --research-only
 *   node run.mjs pull biofood --markets-only
 */

import { join } from 'node:path';
import { getPullsDir } from '../lib/config.mjs';
import { fetchWithRetry, getJson, sleep } from '../lib/fetcher.mjs';
import { buildNote, buildTable, dateStampedFilename, formatNumber, today, writeNote } from '../lib/markdown.mjs';
import { setProperties } from '../lib/obsidian-cli.mjs';
import { fetchProfile, fetchQuote } from '../lib/fmp-client.mjs';
import { fetchRecentFilings, fetchTickerMap, FORM_GROUPS, OFFERING_8K_ITEMS } from '../lib/edgar.mjs';
import { stripCik } from '../lib/cik-map.mjs';

const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const ARXIV_BASE = 'https://export.arxiv.org/api/query';
const FDA_FOOD_ENFORCEMENT = 'https://api.fda.gov/food/enforcement.json';

const DEFAULT_LOOKBACK_DAYS = 120;
const DEFAULT_LIMIT = 15;

const DEFAULT_TICKERS = Object.freeze([
  'CTVA', // seed traits and crop science
  'ADM',  // fermentation, ingredients, ag processing
  'BG',   // grain and oilseed supply chain
  'IFF',  // enzymes, cultures, food ingredients
  'FMC',  // crop protection and biological inputs
  'TSN',  // protein supply chain adopter
  'BYND', // alternative protein demand proxy
  'DNA',  // synthetic biology platform
  'TWST', // DNA synthesis tools
  'TMO',  // life-science tooling and bioprocessing
]);

const WATCHLIST_ROLES = Object.freeze({
  CTVA: 'Seed traits, gene-edited crops, biological crop-input commercialization',
  ADM: 'Industrial fermentation, food ingredients, ag-processing scale',
  BG: 'Global grain and oilseed logistics, feedstock-price pass-through',
  IFF: 'Food enzymes, cultures, flavors, and fermentation-enabled ingredients',
  FMC: 'Crop protection, biologicals, and farmer adoption channel',
  TSN: 'Protein supply chain incumbent and alternative-protein adopter',
  BYND: 'Consumer demand proxy for alternative protein adoption',
  DNA: 'Synthetic biology platform and organism engineering optionality',
  TWST: 'DNA synthesis and design-build-test tooling layer',
  TMO: 'Bioprocessing, analytical instruments, and life-science scale-up tools',
});

const SEC_FORMS = Object.freeze([
  '8-K',
  '8-K/A',
  '10-Q',
  '10-K',
  ...FORM_GROUPS.SHELF,
  ...FORM_GROUPS.PROSPECTUS,
]);

export async function pull(flags = {}) {
  const lookbackDays = Math.max(1, Number(flags.lookback ?? flags.window) || DEFAULT_LOOKBACK_DAYS);
  const limit = Math.max(1, Number(flags.limit) || DEFAULT_LIMIT);
  const since = flags.since ? String(flags.since) : daysAgo(lookbackDays);
  const tickers = flags.tickers ? parseCsv(flags.tickers) : [...DEFAULT_TICKERS];

  const researchOnly = Boolean(flags['research-only']);
  const marketsOnly = Boolean(flags['markets-only']);
  const regulatoryOnly = Boolean(flags['regulatory-only']);

  console.log(`Biofood thesis pull: ${tickers.length} ticker(s), since ${since}...`);

  const research = marketsOnly || regulatoryOnly
    ? emptyResearch()
    : await safeLayer('research', () => pullResearch({ lookbackDays, limit }));

  const regulatory = marketsOnly || researchOnly
    ? emptyRegulatory()
    : await safeLayer('regulatory', () => pullFoodEnforcement({ since, limit }));

  const market = researchOnly || regulatoryOnly
    ? emptyMarket()
    : await safeLayer('market', () => pullMarketWatchlist({ tickers }));

  const sec = researchOnly || regulatoryOnly
    ? emptySec()
    : await safeLayer('sec', () => pullSecWatchlist({ tickers, since, limit }));

  const context = {
    since,
    lookbackDays,
    limit,
    tickers,
    research,
    regulatory,
    market,
    sec,
    mode: { researchOnly, marketsOnly, regulatoryOnly },
  };

  const signalStatus = classifySignalStatus(context);
  const signals = buildSignals(context);
  const note = buildBiofoodNote({ ...context, signalStatus, signals });

  if (flags['dry-run']) {
    console.log(note);
    return { filePath: null, signalStatus, signals };
  }

  const filePath = join(getPullsDir(), 'Biotech', dateStampedFilename('Bioengineered_Food_Systems'));
  writeNote(filePath, note);
  setProperties(filePath, { signal_status: signalStatus, date_pulled: today() });
  console.log(`Wrote: ${filePath}`);
  return { filePath, signalStatus, signals };
}

async function pullResearch({ lookbackDays, limit }) {
  const [pubmed, arxiv] = await Promise.all([
    pullPubMed({ lookbackDays, limit }),
    pullArxiv({ limit }),
  ]);
  return { pubmed, arxiv, error: null };
}

async function pullPubMed({ lookbackDays, limit }) {
  const query = [
    '(',
    '"cellular agriculture"[tiab]',
    'OR "cultured meat"[tiab]',
    'OR "cultivated meat"[tiab]',
    'OR "precision fermentation"[tiab]',
    'OR "microbial protein"[tiab]',
    'OR (("single-cell protein"[tiab] OR "single cell protein"[tiab]) AND (food[tiab] OR feed[tiab] OR fermentation[tiab] OR yeast[tiab] OR algae[tiab] OR "food protein"[tiab]))',
    'OR "gene-edited crop"[tiab]',
    'OR "gene edited crop"[tiab]',
    'OR "gene-edited plant"[tiab]',
    'OR "gene edited plant"[tiab]',
    'OR "CRISPR crop"[tiab]',
    'OR "CRISPR crops"[tiab]',
    'OR "CRISPR plant"[tiab]',
    'OR "CRISPR plants"[tiab]',
    'OR ("synthetic biology"[tiab] AND (food[tiab] OR crop[tiab] OR fermentation[tiab] OR ingredient[tiab]))',
    ')',
    `AND ("last ${lookbackDays} days"[pdat])`,
  ].join(' ');

  const searchUrl = `${PUBMED_BASE}/esearch.fcgi?` + new URLSearchParams({
    db: 'pubmed',
    term: query,
    retmax: String(limit),
    retmode: 'json',
    sort: 'pub+date',
  });

  const searchData = await getJson(searchUrl);
  const pmids = searchData?.esearchresult?.idlist ?? [];
  const total = Number(searchData?.esearchresult?.count || 0);
  if (pmids.length === 0) return { total, rows: [], query };

  await sleep(350);
  const summaryUrl = `${PUBMED_BASE}/esummary.fcgi?` + new URLSearchParams({
    db: 'pubmed',
    id: pmids.join(','),
    retmode: 'json',
    version: '2.0',
  });
  const summaryData = await getJson(summaryUrl);
  const resultMap = summaryData?.result ?? {};

  const rows = pmids
    .map(pmid => {
      const r = resultMap[pmid];
      if (!r) return null;
      return {
        date: r.pubdate || 'N/A',
        title: r.title || 'N/A',
        journal: r.fulljournalname || r.source || 'N/A',
        authors: (r.authors || []).slice(0, 3).map(author => author.name).join(', '),
        link: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      };
    })
    .filter(Boolean);

  return { total, rows, query };
}

async function pullArxiv({ limit }) {
  const query = [
    '(',
    'ti:"cellular agriculture"',
    'OR ti:"cultured meat"',
    'OR ti:"cultivated meat"',
    'OR ti:"precision fermentation"',
    'OR ti:"microbial protein"',
    'OR (ti:"single-cell protein" AND (abs:food OR abs:feed OR abs:fermentation OR abs:yeast OR abs:algae))',
    'OR abs:"cellular agriculture"',
    'OR abs:"precision fermentation"',
    'OR abs:"synthetic biology food"',
    ') AND (cat:q-bio.QM OR cat:q-bio.MN OR cat:q-bio.GN OR cat:q-bio.PE)',
  ].join(' ');

  const url = `${ARXIV_BASE}?` + new URLSearchParams({
    search_query: query,
    start: '0',
    max_results: String(limit),
    sortBy: 'submittedDate',
    sortOrder: 'descending',
  });

  const result = await fetchWithRetry(url, {
    headers: { 'User-Agent': 'MyData-Vault/1.0 biofood-puller' },
  });
  if (!result.ok) throw new Error(`arXiv HTTP ${result.status}`);

  const xml = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
  const rows = parseArxivEntries(xml).slice(0, limit);
  return { total: extractArxivTotal(xml), rows, query };
}

async function pullFoodEnforcement({ since, limit }) {
  const start = since.replace(/-/g, '');
  const end = today().replace(/-/g, '');
  const rangedUrl = `${FDA_FOOD_ENFORCEMENT}?` + new URLSearchParams({
    search: `report_date:[${start}+TO+${end}]`,
    sort: 'report_date:desc',
    limit: String(limit),
  });

  let data;
  let usedFallback = false;
  try {
    data = await getJson(rangedUrl, { retries: 2 });
  } catch {
    usedFallback = true;
    const fallbackUrl = `${FDA_FOOD_ENFORCEMENT}?` + new URLSearchParams({
      sort: 'report_date:desc',
      limit: String(limit),
    });
    data = await getJson(fallbackUrl, { retries: 2 });
  }

  const rows = (data.results || []).map(row => ({
    reportDate: formatFdaDate(row.report_date),
    product: row.product_description || 'N/A',
    reason: row.reason_for_recall || 'N/A',
    firm: row.recalling_firm || 'N/A',
    state: row.state || 'N/A',
    classification: row.classification || 'N/A',
  }));

  return {
    total: usedFallback ? rows.length : (data.meta?.results?.total ?? rows.length),
    rows,
    error: usedFallback ? 'Date-filtered openFDA food enforcement query failed; used latest-records fallback.' : null,
  };
}

async function pullMarketWatchlist({ tickers }) {
  const rows = [];
  const errors = [];

  for (const ticker of tickers) {
    try {
      const [quote, profile] = await Promise.all([
        fetchQuote(ticker),
        fetchProfile(ticker),
      ]);
      rows.push({
        ticker,
        role: WATCHLIST_ROLES[ticker] || 'Bioengineered food systems watchlist member',
        company: profile?.companyName || quote?.name || ticker,
        sector: profile?.sector || 'N/A',
        industry: profile?.industry || 'N/A',
        price: toNumber(quote?.price ?? profile?.price),
        changePct: toNumber(quote?.changesPercentage ?? quote?.changePercentage ?? profile?.changePercentage),
        marketCap: toNumber(profile?.marketCap ?? quote?.marketCap),
        beta: toNumber(profile?.beta),
      });
    } catch (err) {
      errors.push({ ticker, error: err.message });
    }
  }

  return { rows, errors };
}

async function pullSecWatchlist({ tickers, since, limit }) {
  const tickerMap = await fetchTickerMap();
  const rows = [];
  const errors = [];

  for (const ticker of tickers) {
    const meta = tickerMap.get(ticker);
    if (!meta?.cik) {
      errors.push({ ticker, error: 'No SEC CIK mapping found' });
      continue;
    }

    try {
      const filings = await fetchRecentFilings(meta.cik, {
        formTypes: SEC_FORMS,
        since,
        limit: Math.max(4, Math.ceil(limit / 2)),
      });
      for (const filing of filings) {
        rows.push({
          ticker,
          company: meta.name || ticker,
          filed: filing.filingDate,
          form: filing.formType,
          items: filing.items.join(', '),
          read: secReadReason(filing),
          url: filingDocumentUrl(meta.cik, filing),
        });
      }
    } catch (err) {
      errors.push({ ticker, error: err.message });
    }
  }

  rows.sort((a, b) => b.filed.localeCompare(a.filed) || a.ticker.localeCompare(b.ticker));
  return { rows: rows.slice(0, limit), errors };
}

function buildBiofoodNote(context) {
  return buildNote({
    frontmatter: {
      title: 'Bioengineered Food Systems Pull',
      source: 'Biofood Thesis Puller',
      date_pulled: today(),
      domain: 'biotech',
      data_type: 'bioengineered_food_systems',
      frequency: 'on-demand',
      signal_status: context.signalStatus,
      signals: context.signals,
      window_from: context.since,
      lookback_days: context.lookbackDays,
      tickers_scanned: context.tickers.length,
      pubmed_results: context.research.pubmed.total,
      arxiv_results: context.research.arxiv.total,
      fda_food_enforcement_results: context.regulatory.total,
      sec_filings: context.sec.rows.length,
      tags: ['biofood', 'synthetic-biology', 'food-systems', 'agtech', 'biotech'],
    },
    sections: [
      {
        heading: 'Operator Read',
        content: buildOperatorRead(context),
      },
      {
        heading: 'Opportunity Map',
        content: buildOpportunityMap(context),
      },
      {
        heading: 'Public Market Watchlist',
        content: buildMarketSection(context.market),
      },
      {
        heading: 'Research Velocity',
        content: buildResearchSection(context.research),
      },
      {
        heading: 'FDA Food Safety Pulse',
        content: buildRegulatorySection(context.regulatory),
      },
      {
        heading: 'SEC Filing Watch',
        content: buildSecSection(context.sec),
      },
      {
        heading: 'Confirmation Checklist',
        content: [
          '- [ ] Confirm whether science velocity is moving from proof-of-concept into scaled production.',
          '- [ ] Separate enabling tools from branded food products; the margin and regulatory risks are different.',
          '- [ ] Check FDA food enforcement for contamination or labeling issues that could hurt category adoption.',
          '- [ ] Read SEC 8-K and 10-Q language for capex, customer adoption, write-downs, and financing risk.',
          '- [ ] Track input costs: sugar, corn, soy, natural gas, and bioreactor capacity.',
          '- [ ] Look for partnerships between incumbents and synbio or precision-fermentation platforms.',
        ].join('\n'),
      },
      {
        heading: 'Follow-Up Pull Stack',
        content: [
          '```powershell',
          'node run.mjs pull biofood --lookback 120',
          `node run.mjs pull disclosure-reality --tickers ${context.tickers.join(',')} --lookback 90`,
          `node run.mjs pull filing-digest --tickers ${context.tickers.join(',')} --lookback 30`,
          `node run.mjs pull dilution-monitor --tickers ${context.tickers.join(',')} --lookback 90`,
          'node run.mjs pull newsapi --topic biotech',
          'node run.mjs pull fmp --thesis-watchlists --thesis "Bioengineered Food Systems"',
          'node run.mjs thesis full-picture --thesis "Bioengineered Food Systems"',
          '```',
        ].join('\n'),
      },
      {
        heading: 'Source Notes',
        content: [
          '- [[openFDA Food Enforcement]]',
          '- [[PubMed API]]',
          '- [[arXiv API]]',
          '- [[NewsAPI]]',
          '- [[SEC EDGAR Search]]',
          '- [[Financial Modeling Prep]]',
        ].join('\n'),
      },
    ],
  });
}

function buildOperatorRead(context) {
  const lines = [
    `- **Window**: ${context.since} through ${today()}`,
    `- **Status**: ${context.signalStatus}`,
    `- **Research velocity**: PubMed ${context.research.pubmed.total} total match(es); arXiv ${context.research.arxiv.total} total match(es).`,
    `- **FDA food-safety pulse**: ${context.regulatory.total} enforcement record(s) captured${context.regulatory.error ? ' from latest-records fallback' : ' in window'}.`,
    `- **Public-market coverage**: ${context.market.rows.length}/${context.tickers.length} watchlist ticker(s) with FMP context.`,
    `- **SEC activity**: ${context.sec.rows.length} recent filing row(s) captured across the watchlist.`,
  ];

  if (context.research.error) lines.push(`- **Research error**: ${context.research.error}`);
  if (context.regulatory.error) lines.push(`- **Regulatory error**: ${context.regulatory.error}`);
  if (context.market.errors.length) lines.push(`- **Market coverage gaps**: ${context.market.errors.length}`);
  if (context.sec.errors.length) lines.push(`- **SEC coverage gaps**: ${context.sec.errors.length}`);

  return lines.join('\n');
}

function buildOpportunityMap(context) {
  const rows = [
    [
      'Precision fermentation / enzymes',
      'IFF, ADM, DNA, TMO',
      'Food ingredients can move into higher-margin biology-enabled production before consumer brands re-rate.',
      'Customer contracts, capex conversion, margin expansion, fewer food-safety events.',
    ],
    [
      'Gene-edited crops and biological inputs',
      'CTVA, FMC',
      'Seed traits and biological crop inputs can monetize climate, yield, and input-cost pressure.',
      'Regulatory approvals, farmer adoption, trait licensing, commodity spread improvement.',
    ],
    [
      'Alternative protein adoption',
      'TSN, BYND, ADM',
      'Consumer and foodservice adoption remains the visible demand signal, but margins are the real test.',
      'Volume growth without gross-margin collapse, retail velocity, supply-chain partnerships.',
    ],
    [
      'Tooling and scale-up layer',
      'TWST, TMO, DNA',
      'The picks-and-shovels layer may monetize before final foods become mainstream.',
      'Bioprocessing orders, DNA synthesis demand, platform partnerships, lower COGS.',
    ],
  ];

  return buildTable(['Angle', 'Watchlist', 'Viewpoint', 'What Confirms It'], rows);
}

function buildMarketSection(market) {
  const rows = market.rows.map(row => [
    `[[${row.ticker}]]`,
    row.company,
    row.role,
    row.sector,
    row.industry,
    formatMaybeCurrency(row.marketCap),
    row.changePct == null ? 'N/A' : formatNumber(row.changePct, { style: 'percent', decimals: 1 }),
    row.beta == null ? 'N/A' : formatNumber(row.beta, { decimals: 2 }),
  ]);

  const table = rows.length
    ? buildTable(['Ticker', 'Company', 'Role', 'Sector', 'Industry', 'Market Cap', 'Change %', 'Beta'], rows)
    : '_No FMP market rows available._';

  const errors = market.errors.length
    ? '\n\n' + buildTable(['Ticker', 'Issue'], market.errors.map(e => [e.ticker, e.error]))
    : '';
  return table + errors;
}

function buildResearchSection(research) {
  if (research.error) return `Research layer failed: ${research.error}`;

  const pubmedRows = research.pubmed.rows.map(row => [
    row.date,
    truncate(row.title, 80),
    truncate(row.journal, 35),
    `[PubMed](${row.link})`,
  ]);
  const arxivRows = research.arxiv.rows.map(row => [
    row.published,
    truncate(row.title, 80),
    truncate(row.authors, 40),
    row.category || 'N/A',
    `[arXiv](${row.link})`,
  ]);

  return [
    `- **PubMed total**: ${research.pubmed.total}`,
    `- **arXiv total**: ${research.arxiv.total}`,
    '',
    '### PubMed',
    pubmedRows.length
      ? buildTable(['Published', 'Title', 'Journal', 'Link'], pubmedRows)
      : '_No PubMed rows found._',
    '',
    '### arXiv',
    arxivRows.length
      ? buildTable(['Published', 'Title', 'Authors', 'Category', 'Link'], arxivRows)
      : '_No arXiv rows found._',
  ].join('\n');
}

function buildRegulatorySection(regulatory) {
  const rows = regulatory.rows.map(row => [
    row.reportDate,
    row.classification,
    truncate(row.product, 60),
    truncate(row.reason, 80),
    row.firm,
    row.state,
  ]);

  const table = rows.length
    ? buildTable(['Report Date', 'Class', 'Product', 'Reason', 'Firm', 'State'], rows)
    : '_No FDA food enforcement rows found in the window._';

  return regulatory.error
    ? [`Warning: ${regulatory.error}`, '', table].join('\n')
    : table;
}

function buildSecSection(sec) {
  const rows = sec.rows.map(row => [
    `[[${row.ticker}]]`,
    row.filed,
    row.form,
    row.items || '-',
    row.read,
    `[EDGAR](${row.url})`,
  ]);

  const table = rows.length
    ? buildTable(['Ticker', 'Filed', 'Form', 'Items', 'Read', 'Link'], rows)
    : '_No SEC filings captured in the window._';
  const errors = sec.errors.length
    ? '\n\n' + buildTable(['Ticker', 'Issue'], sec.errors.map(e => [e.ticker, e.error]))
    : '';
  return table + errors;
}

function classifySignalStatus(context) {
  const materialFilings = context.sec.rows.filter(row => /1\.01|3\.02|8\.01/.test(row.items)).length;
  const foodSafetyClass1 = context.regulatory.rows.filter(row => /Class I/i.test(row.classification)).length;

  if (foodSafetyClass1 >= 2 || materialFilings >= 4) return 'alert';
  if (context.research.pubmed.total >= 10 || context.research.arxiv.total >= 5 || materialFilings > 0 || context.regulatory.total >= 10) {
    return 'watch';
  }
  return 'clear';
}

function buildSignals(context) {
  const signals = [];
  const materialFilings = context.sec.rows.filter(row => /1\.01|3\.02|8\.01/.test(row.items)).length;
  const foodSafetyClass1 = context.regulatory.rows.filter(row => /Class I/i.test(row.classification)).length;

  if (context.research.pubmed.total >= 10 || context.research.arxiv.total >= 5) signals.push('BIOFOOD_RESEARCH_VELOCITY');
  if (context.regulatory.total >= 10) signals.push('BIOFOOD_FOOD_SAFETY_PULSE');
  if (foodSafetyClass1 >= 2) signals.push('BIOFOOD_CLASS_I_RECALL_CLUSTER');
  if (materialFilings > 0) signals.push('BIOFOOD_SEC_DISCLOSURE_ACTIVITY');
  if (context.market.rows.length > 0) signals.push('BIOFOOD_PUBLIC_MARKET_COVERAGE');
  return signals;
}

async function safeLayer(label, fn) {
  try {
    return await fn();
  } catch (err) {
    return label === 'research'
      ? { ...emptyResearch(), error: err.message }
      : label === 'regulatory'
        ? { ...emptyRegulatory(), error: err.message }
        : label === 'market'
          ? { ...emptyMarket(), errors: [{ ticker: 'ALL', error: err.message }] }
          : { ...emptySec(), errors: [{ ticker: 'ALL', error: err.message }] };
  }
}

function secReadReason(filing) {
  if (filing.items?.includes(OFFERING_8K_ITEMS.UNREGISTERED_SALE)) return 'Financing or dilution risk';
  if (filing.items?.includes(OFFERING_8K_ITEMS.MATERIAL_AGREEMENT)) return 'Material agreement or partnership';
  if (filing.items?.includes(OFFERING_8K_ITEMS.MATERIAL_EVENT)) return 'Material event';
  if (filing.items?.includes(OFFERING_8K_ITEMS.REGULATION_FD)) return 'Investor disclosure';
  if (filing.formType === '10-Q' || filing.formType === '10-K') return 'Operating update';
  if (FORM_GROUPS.SHELF.includes(filing.formType) || FORM_GROUPS.PROSPECTUS.includes(filing.formType)) return 'Offering capacity or prospectus';
  return 'Recent filing';
}

function filingDocumentUrl(cik, filing) {
  const cleanCik = stripCik(cik);
  const acc = filing.accession || String(filing.accessionRaw || '').replace(/-/g, '');
  if (!cleanCik || !acc || !filing.primaryDoc) return filing.url;
  return `https://www.sec.gov/Archives/edgar/data/${cleanCik}/${acc}/${filing.primaryDoc}`;
}

function parseArxivEntries(xml) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1];
    entries.push({
      link: cleanXml(extractTag(block, 'id')),
      title: cleanXml(extractTag(block, 'title')),
      authors: extractAllNames(block),
      published: cleanXml(extractTag(block, 'published')).slice(0, 10),
      category: extractAttr(block, 'arxiv:primary_category', 'term') || '',
    });
  }
  return entries;
}

function extractArxivTotal(xml) {
  const match = String(xml || '').match(/<opensearch:totalResults[^>]*>(\d+)<\/opensearch:totalResults>/);
  return match ? Number(match[1]) : 0;
}

function extractTag(xml, tag) {
  const match = String(xml || '').match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? match[1] : '';
}

function extractAllNames(xml) {
  const names = [];
  const regex = /<author>\s*<name>([\s\S]*?)<\/name>\s*<\/author>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) names.push(cleanXml(match[1]));
  return names.slice(0, 3).join(', ') + (names.length > 3 ? ' et al.' : '');
}

function extractAttr(xml, tag, attr) {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]+)"`);
  const match = String(xml || '').match(re);
  return match ? match[1] : '';
}

function cleanXml(value) {
  return String(value || '')
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function emptyResearch() {
  return {
    pubmed: { total: 0, rows: [], query: '' },
    arxiv: { total: 0, rows: [], query: '' },
    error: null,
  };
}

function emptyRegulatory() {
  return { total: 0, rows: [], error: null };
}

function emptyMarket() {
  return { rows: [], errors: [] };
}

function emptySec() {
  return { rows: [], errors: [] };
}

function parseCsv(value) {
  return String(value || '')
    .split(',')
    .map(item => item.trim().toUpperCase())
    .filter(Boolean);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function formatFdaDate(value) {
  const text = String(value || '');
  if (/^\d{8}$/.test(text)) return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
  return text || 'N/A';
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function formatMaybeCurrency(value) {
  return value == null ? 'N/A' : formatNumber(value, { style: 'currency', decimals: 1 });
}

function truncate(value, max) {
  const text = String(value || 'N/A').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}
