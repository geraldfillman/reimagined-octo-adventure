/**
 * spinoff-screen.mjs - event-driven spin-off / separation screener.
 *
 * Starts from SEC EFTS full-text hits for spin-off, separation, and Form 10
 * language, then applies FMP fundamentals and SEC Form 4 insider-buy filters.
 *
 * Usage:
 *   node run.mjs pull spinoff-screen
 *   node run.mjs pull spinoff-screen --lookback 730 --candidate-limit 80 --limit 25
 */

import { join } from 'node:path';
import { getPullsDir } from '../lib/config.mjs';
import { buildNote, buildTable, dateStampedFilename, formatNumber, today, writeNote } from '../lib/markdown.mjs';
import { setProperties } from '../lib/obsidian-cli.mjs';
import {
  fetchBalanceSheetQuarterly,
  fetchIncomeAnnual,
  fetchIncomeQuarterly,
  fetchInsiderTrades,
  fetchInsiderTradingStats,
  fetchKeyMetricsTtm,
  fetchProfile,
  fetchStockNews,
} from '../lib/fmp-client.mjs';
import {
  EDGAR_USER_AGENT,
  FORM_GROUPS,
  fetchRecentFilings,
  searchFullText,
} from '../lib/edgar.mjs';
import { withRetry, RateLimitError, parseRetryAfter } from '../lib/retry.mjs';

const DEFAULTS = Object.freeze({
  lookbackDays: 730,
  candidateLimit: 80,
  limit: 30,
  newsLimit: 10,
  maxPagesPerQuery: 3,
  insiderLookbackDays: 365,
});

const EVENT_QUERIES = Object.freeze([
  '"spin-off"',
  '"spin off"',
  'spinoff',
  'separation',
  '"Form 10"',
]);

const EVENT_FORMS = Object.freeze([
  '10-12B',
  '10-12B/A',
  '10-12G',
  '10-12G/A',
  '8-K',
  '8-K/A',
]);

const EVENT_KEYWORDS = Object.freeze([
  'spin-off',
  'spin off',
  'spinoff',
  'separation',
  'separate company',
  'form 10',
  '10-12b',
  '10-12g',
]);

export async function pull(flags = {}) {
  const lookbackDays = Number(flags.lookback) || DEFAULTS.lookbackDays;
  const candidateLimit = Number(flags['candidate-limit']) || DEFAULTS.candidateLimit;
  const limit = Number(flags.limit) || DEFAULTS.limit;
  const from = flags.from || daysAgo(lookbackDays);
  const to = flags.to || today();

  console.log(`Spinoff screen: SEC/news event search from ${from} to ${to}; candidate cap ${candidateLimit}.`);

  const secCandidates = await findSecEventCandidates({ from, to, candidateLimit });
  console.log(`  ${secCandidates.length} SEC event candidates found; enriching with FMP + Form 4 data...`);

  const enriched = [];
  const rejected = [];

  for (const candidate of secCandidates) {
    const result = await enrichCandidate(candidate, { insiderLookbackDays: DEFAULTS.insiderLookbackDays, newsLimit: DEFAULTS.newsLimit });
    if (!result) continue;

    if (passesScreen(result)) {
      enriched.push(result);
    } else {
      rejected.push(result);
    }

    if (enriched.length >= limit) break;
  }

  enriched.sort(rankCandidates);

  const signalStatus = enriched.length > 0 ? 'watch' : 'clear';
  const filePath = join(getPullsDir(), 'Fundamentals', dateStampedFilename('Spinoff_Separation_Screen'));
  const note = buildScreenNote({
    matches: enriched,
    rejected,
    secCandidateCount: secCandidates.length,
    from,
    to,
    lookbackDays,
    candidateLimit,
    signalStatus,
  });

  if (flags['dry-run']) {
    console.log(JSON.stringify({
      matches: enriched.map(toJsonRow),
      rejected: rejected.slice(0, 20).map(toJsonRow),
    }, null, 2));
    return { signals: enriched.length ? ['spinoff_screen_matches'] : [] };
  }

  writeNote(filePath, note);
  setProperties(filePath, { signal_status: signalStatus, date_pulled: today() });
  console.log(`Wrote: ${filePath} (${enriched.length} matches)`);
  return { filePath, signals: enriched.length ? ['spinoff_screen_matches'] : [] };
}

async function findSecEventCandidates({ from, to, candidateLimit }) {
  const byTicker = new Map();

  for (const q of EVENT_QUERIES) {
    for (let page = 0; page < DEFAULTS.maxPagesPerQuery; page++) {
      const data = await searchFullText({
        q,
        forms: EVENT_FORMS,
        dateFrom: from,
        dateTo: to,
        from: page * 100,
      }).catch(() => null);

      const hits = data?.hits?.hits ?? [];
      if (hits.length === 0) break;

      for (const hit of hits) {
        const parsed = parseSecHit(hit, q);
        if (!parsed?.ticker || !parsed.cik) continue;
        if (!isUsefulSecEventHit(parsed)) continue;

        const current = byTicker.get(parsed.ticker) ?? {
          ticker: parsed.ticker,
          companyName: parsed.companyName,
          cik: parsed.cik,
          secHits: [],
          queries: new Set(),
        };
        current.secHits.push(parsed);
        current.queries.add(q);
        byTicker.set(parsed.ticker, current);
      }

      if (byTicker.size >= candidateLimit) break;
    }
    if (byTicker.size >= candidateLimit) break;
  }

  return [...byTicker.values()]
    .map(item => ({ ...item, queries: [...item.queries] }))
    .sort((a, b) => latestDate(b.secHits).localeCompare(latestDate(a.secHits)))
    .slice(0, candidateLimit);
}

function parseSecHit(hit, query) {
  const source = hit?._source ?? {};
  const display = source.display_names?.[0] ?? '';
  const parsedDisplay = parseDisplayName(display);
  const cik = String(source.ciks?.[0] ?? parsedDisplay.cik ?? '').padStart(10, '0');
  const accessionRaw = String(source.adsh ?? '');
  const accession = accessionRaw.replace(/-/g, '');
  const doc = String(hit?._id ?? '').split(':')[1] || source.primary_doc || '';

  return {
    ticker: parsedDisplay.ticker,
    companyName: parsedDisplay.companyName || display,
    cik,
    query,
    form: source.form ?? source.root_forms?.[0] ?? '',
    fileType: source.file_type ?? '',
    fileDescription: source.file_description ?? '',
    fileDate: source.file_date ?? '',
    accessionRaw,
    accession,
    doc,
    url: accession && doc
      ? `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${accession}/${doc}`
      : `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${Number(cik)}&owner=include&count=40`,
  };
}

function isUsefulSecEventHit(hit) {
  if (hit.query === '"Form 10"' && !String(hit.form).startsWith('10-12')) return false;
  if (String(hit.form).startsWith('10-12')) return true;
  if (!String(hit.form).startsWith('8-K')) return false;
  const type = String(hit.fileType || hit.fileDescription || '').toUpperCase();
  const description = `${hit.fileType ?? ''} ${hit.fileDescription ?? ''}`.toUpperCase();
  if (description.includes('SEPARATION AND GENERAL RELEASE')) return false;
  if (type === '8-K') return true;
  if (type.startsWith('EX-99')) return true;
  return false;
}

function parseDisplayName(display) {
  const tickerMatch = String(display).match(/\(([A-Z][A-Z0-9.-]{0,9})\)\s+\(CIK/i);
  const cikMatch = String(display).match(/CIK\s+(\d+)/i);
  const companyName = String(display)
    .replace(/\s+\([A-Z][A-Z0-9.-]{0,9}\)\s+\(CIK.*$/i, '')
    .replace(/\s+\(CIK.*$/i, '')
    .trim();
  return {
    ticker: tickerMatch?.[1]?.replace(/\./g, '-').toUpperCase() ?? '',
    cik: cikMatch?.[1] ?? '',
    companyName,
  };
}

async function enrichCandidate(candidate, options) {
  const ticker = candidate.ticker;
  const [profile, balance, incomeQ, incomeA, metrics, news] = await Promise.all([
    fetchProfile(ticker).catch(() => null),
    fetchBalanceSheetQuarterly(ticker, { limit: 8 }).catch(() => []),
    fetchIncomeQuarterly(ticker, { limit: 8 }).catch(() => []),
    fetchIncomeAnnual(ticker, { limit: 4 }).catch(() => []),
    fetchKeyMetricsTtm(ticker).catch(() => null),
    fetchStockNews(ticker, { limit: options.newsLimit }).catch(() => []),
  ]);

  if (!profile?.symbol || profile.isEtf || profile.isFund || profile.isActivelyTrading === false) {
    return null;
  }

  const financials = buildFinancialSnapshot({ balance, incomeQ, incomeA, metrics });
  const newsHits = filterEventNews(news);
  const basePassFlags = {
    leverage: financials.netDebtToEbitda != null && financials.netDebtToEbitda < 3,
    revenueGrowth: financials.revenueGrowthPct != null && financials.revenueGrowthPct > 0,
  };
  const insider = basePassFlags.leverage && basePassFlags.revenueGrowth
    ? await fetchInsiderSignal(ticker, candidate.cik, { lookbackDays: options.insiderLookbackDays }).catch(() => emptyInsiderSignal())
    : { ...emptyInsiderSignal(), skipped: true };

  return {
    ...candidate,
    companyName: profile.companyName || candidate.companyName,
    sector: profile.sector ?? '',
    industry: profile.industry ?? '',
    marketCap: Number(profile.marketCap ?? metrics?.marketCap ?? 0),
    financials,
    insider,
    newsHits,
    passFlags: {
      ...basePassFlags,
      insiderOwnershipOrBuying: insider.buyCount > 0 || insider.acquiredTransactions > 0 || insider.currentOwnedShares > 0,
      eventNews: newsHits.length > 0,
    },
  };
}

function buildFinancialSnapshot({ balance, incomeQ, incomeA, metrics }) {
  const latestBalance = newestByDate(balance, 'date');
  const netDebt = asNumber(latestBalance?.netDebt)
    ?? ((asNumber(latestBalance?.totalDebt) ?? 0) - (asNumber(latestBalance?.cashAndCashEquivalents) ?? asNumber(latestBalance?.cashAndShortTermInvestments) ?? 0));

  const recentQ = incomeQ.slice(0, 4);
  const priorQ = incomeQ.slice(4, 8);
  const ttmEbitda = sumMetric(recentQ, 'ebitda');
  const ttmRevenue = sumMetric(recentQ, 'revenue');
  const priorTtmRevenue = sumMetric(priorQ, 'revenue');

  const annualLatest = incomeA[0];
  const annualPrior = incomeA[1];
  const revenueGrowthPct = priorTtmRevenue > 0
    ? ((ttmRevenue - priorTtmRevenue) / Math.abs(priorTtmRevenue)) * 100
    : annualLatest?.revenue && annualPrior?.revenue
      ? ((Number(annualLatest.revenue) - Number(annualPrior.revenue)) / Math.abs(Number(annualPrior.revenue))) * 100
      : null;

  const netDebtToEbitda = asNumber(metrics?.netDebtToEBITDATTM)
    ?? (ttmEbitda > 0 ? netDebt / ttmEbitda : null);

  return {
    balanceDate: latestBalance?.date ?? '',
    netDebt,
    ttmEbitda: ttmEbitda || asNumber(annualLatest?.ebitda),
    netDebtToEbitda,
    ttmRevenue,
    revenueGrowthPct,
  };
}

async function fetchInsiderSignal(ticker, cik, { lookbackDays }) {
  const [secBuys, fmpTrades, fmpStats] = await Promise.all([
    fetchSecInsiderBuys(cik, { lookbackDays }).catch(() => ({ buyCount: 0, buyValue: 0, filingsChecked: 0, buyFilings: [] })),
    fetchInsiderTrades(ticker, { limit: 40 }).catch(() => []),
    fetchInsiderTradingStats(ticker).catch(() => []),
  ]);

  const recentStats = fmpStats
    .filter(row => Number(row.year) >= new Date().getFullYear() - 1)
    .slice(0, 8);
  const acquiredTransactions = recentStats.reduce((sum, row) => sum + (Number(row.acquiredTransactions) || 0), 0);
  const totalPurchases = recentStats.reduce((sum, row) => sum + (Number(row.totalPurchases) || 0), 0);
  const currentOwnedShares = fmpTrades.reduce((max, row) => Math.max(max, Number(row.securitiesOwned) || 0), 0);
  const acquisitionRows = fmpTrades.filter(row => row.acquisitionOrDisposition === 'A').slice(0, 10);

  return {
    ...secBuys,
    acquiredTransactions,
    totalPurchases,
    currentOwnedShares,
    acquisitionRows,
    source: secBuys.buyCount > 0 ? 'SEC Form 4 purchase code P' : 'FMP insider acquisitions/ownership',
  };
}

function emptyInsiderSignal() {
  return {
    buyCount: 0,
    buyValue: 0,
    filingsChecked: 0,
    buyFilings: [],
    acquiredTransactions: 0,
    totalPurchases: 0,
    currentOwnedShares: 0,
    acquisitionRows: [],
    source: 'none',
  };
}

async function fetchSecInsiderBuys(cik, { lookbackDays }) {
  const since = daysAgo(lookbackDays);
  const filings = await fetchRecentFilings(cik, {
    formTypes: FORM_GROUPS.INSIDER,
    since,
    limit: 12,
  });

  let buyCount = 0;
  let buyValue = 0;
  const buyFilings = [];

  for (const filing of filings.filter(f => f.formType === '4')) {
    const parsed = await parseForm4(filing, cik).catch(() => ({ purchases: [] }));
    if (parsed.purchases.length === 0) continue;
    buyCount += parsed.purchases.length;
    buyValue += parsed.purchases.reduce((sum, p) => sum + (p.value ?? 0), 0);
    buyFilings.push({
      filingDate: filing.filingDate,
      accessionRaw: filing.accessionRaw,
      purchaseCount: parsed.purchases.length,
      value: parsed.purchases.reduce((sum, p) => sum + (p.value ?? 0), 0),
      url: parsed.url,
    });
  }

  return { buyCount, buyValue, filingsChecked: filings.length, buyFilings };
}

async function parseForm4(filing, cik) {
  const accession = filing.accession || String(filing.accessionRaw ?? '').replace(/-/g, '');
  const doc = filing.primaryDoc;
  if (!accession || !doc) return { purchases: [] };

  const url = `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${accession}/${doc}`;
  const response = await withRetry(
    async () => {
      const r = await fetch(url, { headers: { 'User-Agent': EDGAR_USER_AGENT, Accept: 'application/xml,text/xml,text/html' } });
      if (r.status === 429) {
        const retryAfterMs = parseRetryAfter(r.headers.get('Retry-After'));
        throw new RateLimitError(retryAfterMs, `SEC EDGAR rate limited fetching Form 4 for CIK ${cik}`);
      }
      if (r.status >= 500) {
        throw new Error(`SEC EDGAR server error ${r.status} fetching Form 4 for CIK ${cik}`);
      }
      return r;
    },
    { maxAttempts: 4, baseDelayMs: 3000, exponential: true, maxDelayMs: 30000,
      shouldRetry: (err) => err instanceof RateLimitError || /server error/i.test(err.message),
      onRetry: (err, attempt, waitMs) => console.warn(`  SEC Form 4 retry ${attempt} in ${waitMs}ms (CIK ${cik}): ${err.message}`) },
  );
  if (!response.ok) return { purchases: [], url };

  const xml = await response.text();
  const purchases = [];
  const blocks = xml.match(/<nonDerivativeTransaction>[\s\S]*?<\/nonDerivativeTransaction>/gi) ?? [];
  for (const block of blocks) {
    const code = firstXmlValue(block, 'transactionCode');
    if (code !== 'P') continue;
    const shares = Number(firstXmlValue(block, 'transactionShares') ?? 0);
    const price = Number(firstXmlValue(block, 'transactionPricePerShare') ?? 0);
    purchases.push({ shares, price, value: shares * price });
  }

  return { purchases, url };
}

function firstXmlValue(block, tag) {
  const direct = new RegExp(`<${tag}>\\s*([^<]+?)\\s*</${tag}>`, 'i').exec(block)?.[1];
  if (direct != null) return direct.trim();
  return new RegExp(`<${tag}>[\\s\\S]*?<value>\\s*([^<]+?)\\s*</value>[\\s\\S]*?</${tag}>`, 'i').exec(block)?.[1]?.trim() ?? null;
}

function filterEventNews(news) {
  return news
    .filter(item => {
      const text = `${item.title ?? ''} ${item.text ?? ''} ${item.site ?? ''}`.toLowerCase();
      return EVENT_KEYWORDS.some(keyword => text.includes(keyword));
    })
    .slice(0, 5);
}

function passesScreen(candidate) {
  return candidate.passFlags.leverage
    && candidate.passFlags.revenueGrowth
    && candidate.passFlags.insiderOwnershipOrBuying;
}

function rankCandidates(a, b) {
  const scoreA = (a.passFlags.eventNews ? 1 : 0)
    + Math.min(a.insider.buyCount + a.insider.acquiredTransactions, 5) / 5
    + Math.max(0, 3 - a.financials.netDebtToEbitda) / 3
    + Math.min(Math.max(a.financials.revenueGrowthPct ?? 0, 0), 50) / 50;
  const scoreB = (b.passFlags.eventNews ? 1 : 0)
    + Math.min(b.insider.buyCount + b.insider.acquiredTransactions, 5) / 5
    + Math.max(0, 3 - b.financials.netDebtToEbitda) / 3
    + Math.min(Math.max(b.financials.revenueGrowthPct ?? 0, 0), 50) / 50;
  return scoreB - scoreA;
}

function buildScreenNote({ matches, rejected, secCandidateCount, from, to, lookbackDays, candidateLimit, signalStatus }) {
  return buildNote({
    frontmatter: {
      title: 'Spin-off / Separation Financial Screen',
      source: 'SEC EDGAR EFTS + SEC Form 4 + FMP Premium',
      date_pulled: today(),
      domain: 'fundamentals',
      data_type: 'screener',
      frequency: 'on_demand',
      signal_status: signalStatus,
      signals: matches.length ? ['spinoff_screen_matches'] : [],
      total_hits: matches.length,
      sec_candidates: secCandidateCount,
      tags: ['screener', 'spinoff', 'separation', 'form-10', 'fmp', 'sec', 'insider-buying'],
    },
    sections: [
      {
        heading: `Matches - ${matches.length}`,
        content: matches.length
          ? buildTable(
              ['Ticker', 'Company', 'Event', 'Net Debt/EBITDA', 'Revenue Growth', 'Insider Signal', 'News', 'Market Cap'],
              matches.map(matchRow),
            )
          : '_No companies passed all hard filters. See near misses for candidates that matched the event screen but failed financial or insider-buy filters._',
      },
      {
        heading: 'Near Misses',
        content: rejected.length
          ? buildTable(
              ['Ticker', 'Company', 'Failed', 'Net Debt/EBITDA', 'Revenue Growth', 'Insider Signal', 'Latest SEC Event'],
              rejected.slice(0, 25).map(rejectRow),
            )
          : '_No rejected candidates recorded._',
      },
      {
        heading: 'Screen Logic',
        content: [
          `- SEC event universe: EFTS full-text hits from ${from} to ${to} for spin-off, spin off, spinoff, separation, and Form 10 language across Form 10 registration and 8-K filings.`,
          `- Hard financial filters: latest available net debt / TTM EBITDA below 3.0 and positive TTM revenue growth, using FMP key-metrics-ttm when available and statement-derived fallback otherwise.`,
          `- Insider filter: at least one SEC Form 4 open-market purchase code P in the last ${DEFAULTS.insiderLookbackDays} days, or FMP insider acquisition/ownership evidence from recent insider-trading records.`,
          '- News confirmation: FMP company news headlines/text are keyword-filtered for spin-off, separation, or Form 10 terms; this is scored but not a hard filter.',
          `- Run parameters: lookback ${lookbackDays} days, SEC candidate limit ${candidateLimit}.`,
        ].join('\n'),
      },
      {
        heading: 'Sources',
        content: [
          '- SEC EDGAR EFTS full-text search for spin-off/separation/Form 10 discovery.',
          '- SEC EDGAR submissions and Form 4 XML for open-market insider purchase checks.',
          '- FMP insider trading search/statistics for insider acquisition and ownership evidence.',
          '- FMP Premium profile, quarterly balance sheet, quarterly/annual income statement, key metrics TTM, and stock news endpoints.',
        ].join('\n'),
      },
    ],
  });
}

function matchRow(c) {
  const latest = latestEvent(c);
  return [
    c.ticker,
    c.companyName,
    `${latest.form} ${latest.fileDate} [SEC](${latest.url})`,
    fmtRatio(c.financials.netDebtToEbitda),
    fmtPct(c.financials.revenueGrowthPct),
    formatInsiderSignal(c.insider),
    c.newsHits.length ? `[${trimCell(c.newsHits[0].title ?? 'headline')}](${c.newsHits[0].url ?? c.newsHits[0].link ?? ''})` : '-',
    formatNumber(c.marketCap, { style: 'currency' }),
  ];
}

function rejectRow(c) {
  const failed = Object.entries(c.passFlags)
    .filter(([, passed]) => !passed)
    .map(([name]) => name)
    .join(', ');
  const latest = latestEvent(c);
  return [
    c.ticker,
    c.companyName,
    failed || '-',
    fmtRatio(c.financials.netDebtToEbitda),
    fmtPct(c.financials.revenueGrowthPct),
    formatInsiderSignal(c.insider),
    `${latest.form} ${latest.fileDate} [SEC](${latest.url})`,
  ];
}

function toJsonRow(c) {
  return {
    ticker: c.ticker,
    companyName: c.companyName,
    netDebtToEbitda: c.financials.netDebtToEbitda,
    revenueGrowthPct: c.financials.revenueGrowthPct,
    insiderBuys: c.insider.buyCount,
    insiderBuyValue: c.insider.buyValue,
    insiderAcquiredTransactions: c.insider.acquiredTransactions,
    insiderOwnedShares: c.insider.currentOwnedShares,
    latestEvent: latestEvent(c),
    newsHits: c.newsHits.map(n => ({ title: n.title, url: n.url ?? n.link })),
    passFlags: c.passFlags,
  };
}

function latestEvent(c) {
  return [...(c.secHits ?? [])].sort((a, b) => String(b.fileDate).localeCompare(String(a.fileDate)))[0] ?? {};
}

function latestDate(hits) {
  return latestEvent({ secHits: hits }).fileDate ?? '';
}

function newestByDate(rows, key) {
  return [...(rows ?? [])].sort((a, b) => String(b?.[key] ?? '').localeCompare(String(a?.[key] ?? '')))[0] ?? null;
}

function sumMetric(rows, key) {
  return rows.reduce((sum, row) => sum + (asNumber(row?.[key]) ?? 0), 0);
}

function asNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function fmtRatio(value) {
  return value == null || !Number.isFinite(Number(value)) ? 'N/A' : Number(value).toFixed(2);
}

function fmtPct(value) {
  return value == null || !Number.isFinite(Number(value)) ? 'N/A' : `${Number(value).toFixed(1)}%`;
}

function formatInsiderSignal(insider) {
  if (insider.buyCount > 0) {
    return `${insider.buyCount} buy / ${formatNumber(insider.buyValue, { style: 'currency' })}`;
  }
  if (insider.acquiredTransactions > 0) {
    return `${insider.acquiredTransactions} acquisition tx`;
  }
  if (insider.currentOwnedShares > 0) {
    return `${formatNumber(insider.currentOwnedShares, { style: 'compact', decimals: 0 })} owned sh`;
  }
  return '-';
}

function trimCell(value, max = 70) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - Number(n));
  return d.toISOString().slice(0, 10);
}

export const _test = {
  buildFinancialSnapshot,
  filterEventNews,
  firstXmlValue,
  parseDisplayName,
  passesScreen,
};
