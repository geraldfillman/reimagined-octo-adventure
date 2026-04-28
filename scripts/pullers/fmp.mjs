/**
 * fmp.mjs — Financial Modeling Prep puller
 *
 * Usage:
 *   node run.mjs fmp --quote SPY
 *   node run.mjs fmp --profile AAPL
 *   node run.mjs fmp --income AAPL
 *   node run.mjs fmp --technical AAPL
 *   node run.mjs fmp --earnings-calendar
 *   node run.mjs fmp --thesis-watchlists
 *   node run.mjs fmp --options SPY
 *   node run.mjs fmp --micro-small
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { basename, dirname, join } from 'path';
import { getApiKey, getBaseUrl, getPullsDir, getSignalsDir, getVaultRoot } from '../lib/config.mjs';
import { fetchWithRetry, getJson } from '../lib/fetcher.mjs';
import { loadCachedFmpFundamentalsMap } from '../lib/fmp-fundamentals-context.mjs';
import {
  buildNote, buildTable, writeNote, formatNumber,
  today, dateStampedFilename,
} from '../lib/markdown.mjs';
import { setProperties } from '../lib/obsidian-cli.mjs';
import { parseFirstMarkdownTable } from '../lib/markdown-table.mjs';
import { readNote } from '../lib/frontmatter.mjs';
import {
  evaluatePutCallRatio, evaluateUnusualOptionsActivity,
  highestSeverity, formatSignalsSection,
} from '../lib/signals.mjs';
import { loadThesisWatchlists, normalizeSymbol } from '../lib/thesis-watchlists.mjs';

const DEFAULT_MICRO_SMALL_SCREEN = Object.freeze({
  country: 'US',
  marketCapMin: 50_000_000,
  marketCapMax: 2_000_000_000,
  microCapMax: 300_000_000,
  priceMin: 1,
  volumeMin: 100_000,
  perSectorLimit: 7,
});

const MARKET_HISTORY_RETENTION = Object.freeze([{ policy: 'market-history' }]);
const OVERVALUED_SHORTLIST_LIMIT = 8;
const OVERVALUED_MIN_DOLLAR_VOLUME = 5_000_000;
const FMP_FUNDAMENTALS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const SECTOR_SCREEN_UNIVERSE = Object.freeze([
  { apiSector: 'Technology', nasdaqSector: 'Technology', vaultSector: 'Tech Sector', vaultLink: '[[Tech Sector]]', profileKey: 'technology', fitThreshold: 40, sectorLens: 'growth, gross margin, and software/networking fit bias' },
  { apiSector: 'Healthcare', nasdaqSector: 'Health Care', vaultSector: 'Healthcare', vaultLink: '[[Healthcare]]', profileKey: 'healthcare', fitThreshold: 40, sectorLens: 'biotech/medtech catalyst bias with analyst-upside and revenue-inflection overlays' },
  { apiSector: 'Financial Services', nasdaqSector: 'Finance', vaultSector: 'Financials', vaultLink: '[[Financials]]', profileKey: 'financials', fitThreshold: 50, sectorLens: 'bank/insurer/capital-markets fit with P/B, ROE, and profitability bias' },
  { apiSector: 'Consumer Cyclical', nasdaqSector: 'Consumer Discretionary', vaultSector: 'Consumer Discretionary', vaultLink: '[[Consumer Discretionary]]', profileKey: 'consumerDiscretionary', fitThreshold: 45, sectorLens: 'retail/leisure/autos fit with demand-sensitive margin and valuation bias' },
  { apiSector: 'Consumer Defensive', nasdaqSector: 'Consumer Staples', vaultSector: 'Consumer Staples', vaultLink: '[[Consumer Staples]]', profileKey: 'consumerStaples', fitThreshold: 45, sectorLens: 'food/beverage/household fit with defensive margin and valuation bias' },
  { apiSector: 'Industrials', nasdaqSector: 'Industrials', vaultSector: 'Industrials', vaultLink: '[[Industrials]]', profileKey: 'industrials', fitThreshold: 45, sectorLens: 'machinery/defense/transport fit with order-cycle margin bias' },
  { apiSector: 'Basic Materials', nasdaqSector: 'Basic Materials', vaultSector: 'Materials', vaultLink: '[[Materials]]', profileKey: 'materials', fitThreshold: 45, sectorLens: 'chemicals/mining/metals fit with commodity-cycle value bias' },
  { apiSector: 'Communication Services', nasdaqSector: 'Telecommunications', vaultSector: 'Communication Services', vaultLink: '[[Communication Services]]', profileKey: 'communicationServices', fitThreshold: 45, sectorLens: 'telecom/media/platform fit with growth, margin, and valuation bias' },
  { apiSector: 'Energy', nasdaqSector: 'Energy', vaultSector: 'Energy', vaultLink: '[[Energy]]', profileKey: 'energy', fitThreshold: 50, sectorLens: 'oil/gas/energy-services fit with commodity-linked value and margin bias' },
  { apiSector: 'Utilities', nasdaqSector: 'Utilities', vaultSector: 'Utilities', vaultLink: '[[Utilities]]', profileKey: 'utilities', fitThreshold: 50, sectorLens: 'regulated utility/water/power fit with defensive beta and asset-value bias' },
  { apiSector: 'Real Estate', nasdaqSector: 'Real Estate', vaultSector: 'Real Estate', vaultLink: '[[Real Estate]]', profileKey: 'realEstate', fitThreshold: 50, sectorLens: 'property and mortgage REIT fit with book-value and rate-sensitivity bias' },
]);

const SECTOR_PROFILE_CONFIG = Object.freeze({
  technology: {
    strict: false,
    allow: ['software', 'semiconductor', 'communications equipment', 'computer', 'network', 'cyber', 'data processing', 'electronic', 'internet', 'information technology'],
    block: ['reit', 'real estate', 'bank', 'insurance', 'oil', 'gas', 'coal', 'utility', 'water', 'biotechnology', 'pharmaceutical', 'medical'],
  },
  healthcare: {
    strict: false,
    allow: ['biotechnology', 'pharmaceutical', 'therapeutics', 'medical', 'diagnostic', 'healthcare', 'life sciences', 'drug', 'health'],
    block: ['reit', 'real estate', 'bank', 'insurance', 'oil', 'gas', 'coal', 'utility', 'water', 'software', 'semiconductor'],
  },
  financials: {
    strict: true,
    allow: ['bank', 'financial', 'insurance', 'asset management', 'capital markets', 'broker', 'investment', 'consumer finance', 'mortgage finance', 'lending'],
    block: ['reit', 'real estate', 'oil', 'gas', 'coal', 'utility', 'water', 'software', 'semiconductor', 'medical', 'biotechnology', 'pharmaceutical', 'retail', 'restaurant'],
  },
  consumerDiscretionary: {
    strict: true,
    allow: ['retail', 'apparel', 'restaurant', 'lodging', 'gaming', 'casino', 'leisure', 'automobile', 'automotive', 'auto manufacturing', 'motor vehicle', 'vehicle', 'home furnishings', 'specialty store', 'specialty retail', 'e-commerce', 'dealership', 'homebuilder', 'travel'],
    block: ['reit', 'real estate', 'bank', 'insurance', 'oil', 'gas', 'coal', 'utility', 'water', 'software', 'semiconductor', 'medical', 'biotechnology', 'pharmaceutical', 'grocery', 'supermarket', 'discount store', 'warehouse club', 'pharmacy', 'drug retail'],
  },
  consumerStaples: {
    strict: true,
    allow: ['food', 'beverage', 'packaged', 'household', 'personal', 'grocery', 'grocer', 'supermarket', 'discount store', 'warehouse club', 'pharmacy', 'drug retail', 'food retail', 'tobacco', 'consumer staple', 'consumer defensive'],
    block: ['reit', 'real estate', 'bank', 'insurance', 'oil', 'gas', 'coal', 'utility', 'water', 'software', 'semiconductor', 'medical', 'biotechnology', 'pharmaceutical'],
  },
  industrials: {
    strict: true,
    allow: ['aerospace', 'defense', 'machinery', 'transport', 'trucking', 'air freight', 'industrial', 'manufacturing', 'fabrication', 'fabrications', 'tools', 'construction', 'engineering', 'environmental'],
    block: ['reit', 'real estate', 'bank', 'insurance', 'software', 'semiconductor', 'medical', 'biotechnology', 'pharmaceutical', 'automotive', 'auto manufacturing', 'motor vehicle', 'vehicle', 'grocery', 'supermarket', 'discount store', 'warehouse club', 'pharmacy', 'drug retail'],
  },
  materials: {
    strict: true,
    allow: ['chemical', 'mining', 'gold', 'silver', 'copper', 'steel', 'metal', 'paper', 'forest', 'lumber', 'building product'],
    block: ['reit', 'real estate', 'bank', 'insurance', 'software', 'semiconductor', 'medical', 'biotechnology', 'pharmaceutical', 'fabrication', 'fabrications'],
  },
  communicationServices: {
    strict: false,
    allow: ['telecom', 'telecommunications', 'wireless', 'broadcast', 'advertising', 'media', 'publishing', 'cable', 'entertainment', 'communication', 'internet', 'streaming', 'interactive media'],
    block: ['reit', 'real estate', 'bank', 'insurance', 'oil', 'gas', 'coal', 'utility', 'water', 'medical', 'biotechnology', 'pharmaceutical'],
  },
  energy: {
    strict: true,
    allow: ['oil', 'gas', 'coal', 'uranium', 'drilling', 'exploration', 'production', 'oilfield', 'energy', 'petroleum', 'midstream', 'pipeline'],
    block: ['reit', 'real estate', 'bank', 'insurance', 'software', 'semiconductor', 'medical', 'biotechnology', 'pharmaceutical'],
  },
  utilities: {
    strict: true,
    allow: ['utility', 'utilities', 'water', 'electric', 'gas', 'power', 'renewable', 'independent power', 'power generation', 'power producer', 'nuclear'],
    block: ['reit', 'real estate', 'bank', 'insurance', 'software', 'semiconductor', 'network', 'telecom', 'media', 'medical', 'biotechnology', 'pharmaceutical'],
  },
  realEstate: {
    strict: true,
    allow: ['reit', 'real estate', 'property', 'properties', 'mortgage', 'apartment', 'office', 'shopping center', 'mall', 'residential', 'industrial reit', 'data center reit', 'tower reit', 'net lease', 'logistics', 'warehouse', 'storage'],
    block: ['bank', 'insurance', 'software', 'semiconductor', 'network', 'telecom', 'medical', 'biotechnology', 'pharmaceutical', 'oil', 'gas', 'coal', 'utility', 'water'],
  },
});

const NASDAQ_TAXONOMY_HINTS = Object.freeze({
  technology: ['software', 'semiconductor', 'cloud', 'cybersecurity', 'network', 'communications equipment', 'it services'],
  healthcare: ['biotechnology', 'therapeutics', 'pharmaceutical', 'drug', 'medical', 'diagnostic', 'healthcare', 'life sciences'],
  financials: ['bank', 'insurance', 'asset management', 'capital markets', 'broker', 'payment', 'payments', 'consumer finance', 'mortgage finance'],
  consumerDiscretionary: ['automotive', 'auto manufacturing', 'motor vehicle', 'vehicle', 'specialty retail', 'restaurant', 'lodging', 'casino', 'homebuilder', 'travel'],
  consumerStaples: ['grocery', 'supermarket', 'discount store', 'warehouse club', 'pharmacy', 'drug retail', 'food retail', 'consumer defensive'],
  industrials: ['aerospace', 'defense', 'machinery', 'industrial equipment', 'fabrication', 'fabrications', 'trucking', 'rail', 'air freight', 'engineering', 'construction'],
  materials: ['chemical', 'mining', 'metal', 'steel', 'copper', 'gold', 'silver', 'fertilizer', 'paper', 'forest', 'lumber'],
  communicationServices: ['telecommunications', 'wireless', 'cable', 'broadcast', 'media', 'advertising', 'streaming', 'interactive media'],
  energy: ['oil', 'gas', 'petroleum', 'exploration', 'production', 'drilling', 'oilfield', 'pipeline', 'midstream'],
  utilities: ['utility', 'electric utility', 'water utility', 'gas utility', 'independent power', 'power generation', 'nuclear'],
  realEstate: ['reit', 'real estate', 'properties', 'mortgage reit', 'apartment reit', 'office reit', 'shopping center', 'industrial reit', 'data center reit'],
});

let secLastRequestAt = 0;

const FMP_PROFILE_CACHE_DIR = join(getVaultRoot(), 'scripts', '.cache', 'fmp-profile');
const FMP_RATIOS_TTM_CACHE_DIR = join(getVaultRoot(), 'scripts', '.cache', 'fmp-ratios-ttm');
const FMP_KEY_METRICS_TTM_CACHE_DIR = join(getVaultRoot(), 'scripts', '.cache', 'fmp-key-metrics-ttm');
const FMP_PRICE_TARGET_CACHE_DIR = join(getVaultRoot(), 'scripts', '.cache', 'fmp-price-target-summary');
const SEC_COMPANY_FACTS_CACHE_DIR = join(getVaultRoot(), 'scripts', '.cache', 'sec-companyfacts');
const SEC_TICKER_MAP_CACHE_PATH = join(getVaultRoot(), 'scripts', '.cache', 'sec-company-tickers.json');
const SEC_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const SEC_MIN_INTERVAL_MS = 150;

export async function pull(flags = {}) {
  const apiKey = getApiKey('fmp');
  const baseUrl = getBaseUrl('fmp');

  if (flags.quote) {
    return pullQuote(flags.quote, apiKey, baseUrl);
  } else if (flags.profile) {
    return pullProfile(flags.profile, apiKey, baseUrl);
  } else if (flags.income) {
    return pullIncome(flags.income, apiKey, baseUrl);
  } else if (flags['sector-baskets']) {
    return pullThesisWatchlists({ ...flags, 'include-baskets': true, thesis: 'sector basket' }, apiKey, baseUrl);
  } else if (flags['thesis-watchlists']) {
    return pullThesisWatchlists(flags, apiKey, baseUrl);
  } else if (flags.technical) {
    return pullTechnical(flags, apiKey, baseUrl);
  } else if (flags['earnings-calendar']) {
    return pullEarningsCalendar(flags, apiKey, baseUrl);
  } else if (flags.options) {
    return pullOptions(flags.options, apiKey, baseUrl);
  } else if (flags['micro-small'] || flags['sector-screen']) {
    return pullMicroSmallSectorScreen(flags, apiKey, baseUrl);
  } else if (flags.insider) {
    return pullInsiderTrading(flags.insider, apiKey, baseUrl);
  } else if (flags['balance-sheet']) {
    return pullBalanceSheet(flags['balance-sheet'], apiKey, baseUrl);
  } else if (flags['cash-flow']) {
    return pullCashFlow(flags['cash-flow'], apiKey, baseUrl);
  } else if (flags.estimates) {
    return pullAnalystEstimates(flags.estimates, apiKey, baseUrl);
  } else if (flags['short-interest']) {
    return pullShortInterest(flags['short-interest'], apiKey, baseUrl);
  } else if (flags.ratings) {
    return pullAnalystRatings(flags.ratings, apiKey, baseUrl);
  } else if (flags.news) {
    return pullCompanyNews(flags.news, apiKey, baseUrl);
  } else if (flags['macro-calendar']) {
    return pullMacroCalendar(flags, apiKey, baseUrl);
  } else if (flags['watchlist-deep-scan']) {
    return pullWatchlistDeepScan(flags, apiKey, baseUrl);
  } else {
    throw new Error(
      'Specify a flag: --quote --profile --income --technical --earnings-calendar ' +
      '--thesis-watchlists --options --micro-small --insider --balance-sheet ' +
      '--cash-flow --estimates --short-interest --ratings --news --macro-calendar ' +
      '--watchlist-deep-scan'
    );
  }
}

async function pullQuote(symbol, apiKey, baseUrl) {
  const stableBaseUrl = getStableBaseUrl(baseUrl);
  const symbols = parseSymbolList(symbol);
  console.log(`📈 FMP: Fetching quote${symbols.length > 1 ? 's' : ''} for ${symbols.join(', ')}...`);

  const data = await getJson(`${stableBaseUrl}/batch-quote-short?symbols=${symbols.join(',')}&apikey=${apiKey}`);
  const quotes = Array.isArray(data) ? data : [];

  if (quotes.length === 0) {
    throw new Error(`No quote data returned for ${symbols.join(', ')}`);
  }

  if (symbols.length === 1) {
    const sym = symbols[0];
    const quote = quotes.find(entry => String(entry.symbol || '').toUpperCase() === sym) || quotes[0];
    const profile = await fetchFmpProfileCached(sym, apiKey, stableBaseUrl);

    const note = buildNote({
      frontmatter: {
        title: `${sym} Quote — FMP`,
        source: 'Financial Modeling Prep',
        symbol: sym,
        date_pulled: today(),
        domain: 'market',
        data_type: 'snapshot',
        frequency: 'on-demand',
        signal_status: 'clear',
        signals: [],
        tags: ['equities', 'quote', sym.toLowerCase(), 'fmp'],
      },
      sections: [
        {
          heading: `${profile?.companyName || sym} (${sym})`,
          content: `**Exchange**: ${profile?.exchange || 'N/A'} | **Sector**: ${profile?.sector || 'N/A'} | **Industry**: ${profile?.industry || 'N/A'}`,
        },
        {
          heading: 'Quote Snapshot',
          content: buildTable(
            ['Metric', 'Value'],
            [
              ['Price', formatDollar(quote.price)],
              ['Change', formatSignedDollar(quote.change)],
              ['Change %', formatPercent(profile?.changePercentage)],
              ['Volume', formatNumber(quote.volume, { style: 'compact', decimals: 0 })],
              ['Average Volume', formatNumber(profile?.averageVolume, { style: 'compact', decimals: 0 })],
              ['Market Cap', formatNumber(profile?.marketCap, { style: 'currency' })],
              ['Beta', formatDecimal(profile?.beta, 2)],
              ['52W Range', profile?.range || 'N/A'],
            ]
          ),
        },
        {
          heading: 'Source',
          content: `- **API**: Financial Modeling Prep (batch-quote-short + profile)\n- **Symbol**: ${sym}\n- **Auto-pulled**: ${today()}`,
        },
      ],
    });

    const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`FMP_Quote_${sym}`));
    writeNote(filePath, note);
    setProperties(filePath, { signal_status: 'clear', date_pulled: today() });
    console.log(`📝 Wrote: ${filePath}`);
    return { filePath, signals: [], retention: MARKET_HISTORY_RETENTION };
  }

  const rows = symbols.map(sym => {
    const quote = quotes.find(entry => String(entry.symbol || '').toUpperCase() === sym) || {};
    return [
      sym,
      formatDollar(quote.price),
      formatSignedDollar(quote.change),
      formatNumber(quote.volume, { style: 'compact', decimals: 0 }),
    ];
  });

  const note = buildNote({
    frontmatter: {
      title: `Quote Batch — FMP (${symbols.join(', ')})`,
      source: 'Financial Modeling Prep',
      date_pulled: today(),
      domain: 'market',
      data_type: 'snapshot',
      frequency: 'on-demand',
      signal_status: 'clear',
      signals: [],
      tags: ['equities', 'quote', 'batch', 'fmp'],
    },
    sections: [
      {
        heading: 'Quote Snapshot',
        content: buildTable(['Symbol', 'Price', 'Change', 'Volume'], rows),
      },
      {
        heading: 'Source',
        content: `- **API**: Financial Modeling Prep (batch-quote-short)\n- **Symbols**: ${symbols.join(', ')}\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`FMP_Quote_${symbols.join('_')}`));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals: [], retention: MARKET_HISTORY_RETENTION };
}

async function pullProfile(symbol, apiKey, baseUrl) {
  const sym = symbol.toUpperCase();
  const stableBaseUrl = getStableBaseUrl(baseUrl);
  console.log(`📊 FMP: Fetching profile for ${sym}...`);

  const data = await getJson(`${stableBaseUrl}/profile?symbol=${sym}&apikey=${apiKey}`);
  const p = Array.isArray(data) ? data[0] : data;

  if (!p?.symbol) {
    throw new Error(`No profile data for ${sym}`);
  }

  console.log(`  ${p.companyName} | ${p.sector} / ${p.industry}`);
  console.log(`  Price: $${p.price} | Mkt Cap: ${formatNumber(p.marketCap, { style: 'currency' })}`);

  const note = buildNote({
    frontmatter: {
      title: `${sym} Profile — FMP`,
      source: 'Financial Modeling Prep',
      symbol: sym,
      company: p.companyName,
      date_pulled: today(),
      domain: 'market',
      data_type: 'snapshot',
      frequency: 'on-demand',
      signal_status: 'clear',
      signals: [],
      tags: ['equities', 'profile', sym.toLowerCase(), 'fmp'],
    },
    sections: [
      {
        heading: `${p.companyName} (${sym})`,
        content: `**Sector**: ${p.sector} | **Industry**: ${p.industry} | **Exchange**: ${p.exchangeShortName}\n\n${(p.description || '').slice(0, 300)}`,
      },
      {
        heading: 'Key Metrics',
        content: buildTable(
          ['Metric', 'Value'],
          [
            ['Price', `$${p.price?.toFixed(2) || 'N/A'}`],
            ['Market Cap', formatNumber(p.marketCap, { style: 'currency' })],
            ['Beta', p.beta?.toFixed(2) || 'N/A'],
            ['Vol Avg', formatNumber(p.volAvg, { style: 'compact' })],
            ['52W Range', `$${p.range || 'N/A'}`],
            ['DCF', p.dcf ? `$${p.dcf.toFixed(2)}` : 'N/A'],
            ['IPO Date', p.ipoDate || 'N/A'],
          ]
        ),
      },
      {
        heading: 'Source',
        content: `- **API**: Financial Modeling Prep (profile)\n- **Symbol**: ${sym}\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`FMP_Profile_${sym}`));
  writeNote(filePath, note);
  return { filePath, signals: [] };
  console.log(`📝 Wrote: ${filePath}`);
}

async function pullIncome(symbol, apiKey, baseUrl) {
  const sym = symbol.toUpperCase();
  const stableBaseUrl = getStableBaseUrl(baseUrl);
  console.log(`📊 FMP: Fetching income statement for ${sym}...`);

  const data = await getJson(`${stableBaseUrl}/income-statement?symbol=${sym}&period=annual&limit=5&apikey=${apiKey}`);
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No income data for ${sym}`);
  }

  console.log(`  ${data.length} annual periods retrieved`);

  const rows = data.map(d => [
    d.calendarYear || d.date?.slice(0, 4),
    formatNumber(d.revenue, { style: 'currency' }),
    formatNumber(d.grossProfit, { style: 'currency' }),
    formatNumber(d.operatingIncome, { style: 'currency' }),
    formatNumber(d.netIncome, { style: 'currency' }),
    d.eps?.toFixed(2) || 'N/A',
  ]);

  const note = buildNote({
    frontmatter: {
      title: `${sym} Income Statement — FMP`,
      source: 'Financial Modeling Prep',
      symbol: sym,
      date_pulled: today(),
      domain: 'market',
      data_type: 'time_series',
      frequency: 'annual',
      signal_status: 'clear',
      signals: [],
      tags: ['equities', 'income-statement', sym.toLowerCase(), 'fmp'],
    },
    sections: [
      {
        heading: `${sym} — Annual Income Statement`,
        content: buildTable(
          ['Year', 'Revenue', 'Gross Profit', 'Operating Income', 'Net Income', 'EPS'],
          rows
        ),
      },
      {
        heading: 'Source',
        content: `- **API**: Financial Modeling Prep (income-statement)\n- **Symbol**: ${sym}\n- **Periods**: Last ${data.length} years\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`FMP_Income_${sym}`));
  writeNote(filePath, note);
  return { filePath, signals: [] };
  console.log(`📝 Wrote: ${filePath}`);
}

async function pullTechnical(flags, apiKey, baseUrl) {
  const sym = String(flags.technical || '').toUpperCase();
  const interval = String(flags.interval || 'daily').toLowerCase();
  const stableBaseUrl = getStableBaseUrl(baseUrl);
  console.log(`📉 FMP: Building technical snapshot for ${sym} (${interval})...`);

  const { apiSymbol, series } = await fetchFmpPriceSeriesResolved(sym, interval, apiKey, stableBaseUrl);
  if (series.length < 20) {
    throw new Error(`Not enough price history for ${sym} (${interval}) to compute technical indicators.`);
  }

  const latest = series.at(-1);
  const prior = series.at(-2);
  const sma20 = computeSMA(series, 20);
  const sma50 = computeSMA(series, 50);
  const sma200 = computeSMA(series, 200);
  const ema21 = computeEMA(series, 21);
  const rsi14 = computeRSI(series, 14);
  const atr14 = computeATR(series, 14);
  const profile = await fetchFmpProfileCached(apiSymbol, apiKey, stableBaseUrl);
  const signals = buildTechnicalSignals({
    symbol: sym,
    latest,
    prior,
    sma50,
    sma200,
    rsi14,
  });
  const severity = highestSeverity(signals);
  const change = (latest.close ?? 0) - (prior?.close ?? latest.close ?? 0);
  const changePct = prior?.close ? (((latest.close - prior.close) / prior.close) * 100) : null;
  const priceVs20Pct = calculatePercentDifference(latest.close, sma20);
  const priceVs50Pct = calculatePercentDifference(latest.close, sma50);
  const priceVs200Pct = calculatePercentDifference(latest.close, sma200);
  const momentumState = resolveMomentumState(rsi14);
  const technicalBias = resolveTechnicalBias({
    price: latest.close,
    sma50,
    sma200,
    rsi14,
  });

  const note = buildNote({
    frontmatter: {
      title: `${sym} Technical Snapshot — FMP`,
      source: 'Financial Modeling Prep',
      symbol: sym,
      interval,
      date_pulled: today(),
      domain: 'market',
      data_type: 'technical_snapshot',
      frequency: 'on-demand',
      signal_status: severity || 'clear',
      signals: signals.map(signal => signal.name),
      close: roundMetric(latest.close),
      change: roundMetric(change),
      change_pct: roundMetric(changePct, 2),
      sma20: roundMetric(sma20),
      sma50: roundMetric(sma50),
      sma200: roundMetric(sma200),
      ema21: roundMetric(ema21),
      rsi14: roundMetric(rsi14, 2),
      atr14: roundMetric(atr14),
      price_vs_sma20_pct: roundMetric(priceVs20Pct, 2),
      price_vs_sma50_pct: roundMetric(priceVs50Pct, 2),
      price_vs_sma200_pct: roundMetric(priceVs200Pct, 2),
      momentum_state: momentumState,
      technical_bias: technicalBias,
      technical_signal_count: signals.length,
      tags: ['equities', 'technical', sym.toLowerCase(), interval, 'fmp'],
    },
    sections: [
      ...(signals.length > 0 ? [{ heading: 'Signals', content: formatSignalsSection(signals) }] : []),
      {
        heading: 'Technical Snapshot',
        content: buildTable(
          ['Metric', 'Value'],
          [
            ['Last Close', formatDollar(latest.close)],
            ['Change', formatSignedDollar(change)],
            ['Change %', formatPercent(changePct)],
            ['SMA 20', formatDollar(sma20)],
            ['SMA 50', formatDollar(sma50)],
            ['SMA 200', formatDollar(sma200)],
            ['EMA 21', formatDollar(ema21)],
            ['RSI 14', formatDecimal(rsi14, 1)],
            ['ATR 14', formatDollar(atr14)],
            ['52W Range', profile?.range || 'N/A'],
          ]
        ),
      },
      {
        heading: 'Trend Read',
        content: [
          `- **Price vs 20**: ${compareLevel(latest.close, sma20)}`,
          `- **Price vs 50**: ${compareLevel(latest.close, sma50)}`,
          `- **Price vs 200**: ${compareLevel(latest.close, sma200)}`,
          `- **Momentum**: ${describeMomentum(rsi14)}`,
          `- **Bias**: ${technicalBias}`,
        ].join('\n'),
      },
      {
        heading: 'Source',
        content: [
          `- **API**: Financial Modeling Prep (${interval === 'daily' ? 'historical-price-eod/full' : `historical-chart/${interval}`})`,
          `- **Symbol**: ${sym}`,
          ...(apiSymbol !== sym ? [`- **API Symbol**: ${apiSymbol}`] : []),
          `- **Bars Used**: ${series.length}`,
          `- **Auto-pulled**: ${today()}`,
        ].join('\n'),
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`FMP_Technicals_${sym}_${interval}`));
  writeNote(filePath, note);
  setProperties(filePath, { signal_status: severity || 'clear', date_pulled: today() });
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals };
}

async function pullThesisWatchlists(flags, apiKey, baseUrl) {
  const includeBaskets = Boolean(flags['include-baskets']);
  const thesisFilter = String(flags.thesis || '').trim();
  const dryRun = Boolean(flags['dry-run']);
  const interval = String(flags.interval || 'daily').toLowerCase();
  const from = String(flags.from || today());
  const to = String(flags.to || addDays(today(), 14));
  const concurrency = parseIntegerFlag(flags.concurrency, 3, '--concurrency');
  const fundamentalsConcurrency = parseIntegerFlag(flags['fundamentals-concurrency'], Math.min(concurrency, 2), '--fundamentals-concurrency');
  const warmFundamentals = !flags['skip-fundamentals'];
  const shouldSync = !flags['skip-sync'];
  const stableBaseUrl = getStableBaseUrl(baseUrl);
  const watchlists = await loadThesisWatchlists({
    includeBaskets,
    thesisFilter,
  });

  if (watchlists.length === 0) {
    throw new Error('No thesis watchlists matched the requested filters.');
  }

  const uniqueSymbols = [...new Set(watchlists.flatMap(watchlist => watchlist.symbols))];
  console.log(`📚 FMP: Thesis watchlists selected: ${watchlists.length}`);
  console.log(`   Unique symbols: ${uniqueSymbols.length} (${uniqueSymbols.join(', ')})`);

  for (const watchlist of watchlists) {
    console.log(`   - ${watchlist.name}: ${watchlist.symbols.length} symbol(s)`);
  }

  if (dryRun) {
    console.log('   Dry run only — no API calls or note writes.');
    return {
      watchlists: watchlists.map(watchlist => ({
        name: watchlist.name,
        relativePath: watchlist.relativePath,
        symbols: watchlist.symbols,
      })),
      uniqueSymbols,
    };
  }

  const quoteMap = await fetchBatchQuotesMap(uniqueSymbols, apiKey, stableBaseUrl);
  let fundamentalsBySymbol = await loadCachedFmpFundamentalsMap(uniqueSymbols);
  if (warmFundamentals) {
    console.log(`📚 FMP: Warming fundamentals cache for ${uniqueSymbols.length} symbol(s)...`);
    await mapWithConcurrency(uniqueSymbols, fundamentalsConcurrency, async symbol => {
      await fetchFmpFundamentalsBundle(symbol, { apiKey, stableBaseUrl });
      return symbol;
    });
    fundamentalsBySymbol = await loadCachedFmpFundamentalsMap(uniqueSymbols);
  } else {
    console.log('📚 FMP: Skipping fundamentals cache warm-up.');
  }
  const warmedFundamentalsCount = uniqueSymbols.filter(symbol => {
    const entry = fundamentalsBySymbol.get(symbol);
    return entry?.coverageCount > 0;
  }).length;
  const warmedCompleteFundamentalsCount = uniqueSymbols.filter(symbol => {
    const entry = fundamentalsBySymbol.get(symbol);
    return entry?.coverageStatus === 'complete';
  }).length;
  console.log(
    `   Fundamentals coverage: ${warmedFundamentalsCount}/${uniqueSymbols.length} cached, ` +
    `${warmedCompleteFundamentalsCount} complete.`
  );
  const technicalResults = await mapWithConcurrency(uniqueSymbols, concurrency, async symbol => {
    try {
      return await pullTechnical({ technical: symbol, interval }, apiKey, baseUrl);
    } catch (error) {
      return {
        symbol,
        error: error instanceof Error ? error.message : String(error),
        signals: [],
      };
    }
  });
  const technicalDataBySymbol = new Map();
  const technicalNoteLinkBySymbol = new Map();
  const technicalSignalsBySymbol = new Map();
  const technicalFailures = [];

  for (let index = 0; index < uniqueSymbols.length; index += 1) {
    const symbol = uniqueSymbols[index];
    const result = technicalResults[index];
    if (result?.error) {
      technicalFailures.push({ symbol, error: result.error });
      console.warn(`Warning: technical snapshot failed for ${symbol}: ${result.error}`);
    }
    const note = result?.filePath ? await readNote(result.filePath) : null;
    if (note?.data) {
      technicalDataBySymbol.set(symbol, note.data);
      technicalNoteLinkBySymbol.set(symbol, filePathToWikiLink(result.filePath));
    }
    technicalSignalsBySymbol.set(symbol, Array.isArray(result?.signals) ? result.signals : []);
  }

  const earningsResult = await pullEarningsCalendar({
    'earnings-calendar': true,
    from,
    to,
    symbols: uniqueSymbols.join(','),
    limit: Math.max(uniqueSymbols.length * 6, 80),
    scope: 'watchlist',
    'watchlist-name': 'Thesis Watchlists',
    label: 'Thesis_Watchlists',
  }, apiKey, baseUrl);
  const earningsNote = earningsResult?.filePath ? await readNote(earningsResult.filePath) : null;
  const earningsRows = parseWatchlistEarningsRows(earningsNote?.content || '');
  const earningsRowsBySymbol = new Map(
    earningsRows.map(row => [normalizeSymbol(row.symbol), row]).filter(([symbol]) => Boolean(symbol))
  );

  const filePaths = [];
  for (const watchlist of watchlists) {
    const thesisSignals = watchlist.symbols.flatMap(symbol => technicalSignalsBySymbol.get(symbol) || []);
    const signalStatus = highestSeverity(thesisSignals);
    const signalNames = [...new Set(thesisSignals.map(signal => signal.name))];
    const thesisEarningsRows = watchlist.symbols
      .map(symbol => earningsRowsBySymbol.get(symbol))
      .filter(Boolean)
      .sort(compareDisplayEarningsRows);
    const nextEarningsDate = thesisEarningsRows
      .find(row => row.date >= today())?.date ?? null;
    const technicalCoverage = watchlist.symbols.filter(symbol => technicalDataBySymbol.has(symbol));
    const fundamentalsCoverage = watchlist.symbols
      .map(symbol => fundamentalsBySymbol.get(symbol))
      .filter(Boolean);
    const fundamentalsCoveredCount = fundamentalsCoverage.filter(entry => entry.coverageCount > 0).length;
    const fundamentalsCompleteCount = fundamentalsCoverage.filter(entry => entry.coverageStatus === 'complete').length;
    const fundamentalsPartialCount = fundamentalsCoverage.filter(entry => entry.coverageStatus === 'partial').length;
    const fundamentalsMissingCount = watchlist.symbols.length - fundamentalsCoveredCount;

    const note = buildNote({
      frontmatter: {
        title: `FMP ${watchlist.isBasket ? 'Basket' : 'Thesis'} Watchlist - ${watchlist.name}`,
        source: 'Financial Modeling Prep',
        thesis: watchlist.name,
        watchlist_kind: watchlist.isBasket ? 'basket' : 'thesis',
        watchlist_symbols: watchlist.symbols,
        watchlist_symbol_count: watchlist.symbols.length,
        technical_symbol_count: technicalCoverage.length,
        technical_nonclear_count: technicalCoverage.filter(symbol => {
          const row = technicalDataBySymbol.get(symbol);
          return row?.signal_status && row.signal_status !== 'clear';
        }).length,
        fundamentals_symbol_count: fundamentalsCoveredCount,
        fundamentals_complete_count: fundamentalsCompleteCount,
        fundamentals_partial_count: fundamentalsPartialCount,
        fundamentals_missing_count: fundamentalsMissingCount,
        earnings_symbol_count: thesisEarningsRows.length,
        next_earnings_date: nextEarningsDate,
        calendar_from: from,
        calendar_to: to,
        interval,
        date_pulled: today(),
        domain: 'market',
        data_type: 'watchlist_report',
        frequency: 'on-demand',
        signal_status: signalStatus,
        signals: signalNames,
        tags: ['equities', 'watchlist', watchlist.isBasket ? 'basket' : 'thesis', 'fmp'],
      },
      sections: [
        ...(thesisSignals.length > 0 ? [{ heading: 'Signals', content: formatSignalsSection(thesisSignals) }] : []),
        {
          heading: 'Watchlist Summary',
          content: buildWatchlistSummaryContent({
            watchlist,
            interval,
            from,
            to,
            technicalCoverageCount: technicalCoverage.length,
            technicalNonclearCount: technicalCoverage.filter(symbol => {
              const row = technicalDataBySymbol.get(symbol);
              return row?.signal_status && row.signal_status !== 'clear';
            }).length,
            technicalFailureCount: watchlist.symbols.filter(symbol =>
              technicalFailures.some(failure => failure.symbol === symbol)
            ).length,
            fundamentalsCoverageCount: fundamentalsCoveredCount,
            fundamentalsCompleteCount,
            fundamentalsPartialCount,
            fundamentalsMissingCount,
            warmedFundamentals: warmFundamentals,
            nextEarningsDate,
            earningsFilePath: earningsResult.filePath,
            synced: shouldSync,
          }),
        },
        {
          heading: 'Quote Snapshot',
          content: buildTable(
            ['Symbol', 'Price', 'Change', 'Volume'],
            watchlist.symbols.map(symbol => {
              const quote = quoteMap.get(symbol) || {};
              return [
                symbol,
                formatDollar(quote.price),
                formatSignedDollar(quote.change),
                formatNumber(quote.volume, { style: 'compact', decimals: 0 }),
              ];
            })
          ),
        },
        {
          heading: 'Technical Tape',
          content: buildTable(
            ['Symbol', 'Status', 'Bias', 'Momentum', 'RSI 14', 'Vs 200D %', 'Snapshot'],
            watchlist.symbols.map(symbol => {
              const row = technicalDataBySymbol.get(symbol);
              return [
                symbol,
                row?.signal_status || 'N/A',
                row?.technical_bias || 'N/A',
                row?.momentum_state || 'N/A',
                hasMetric(row?.rsi14) ? formatDecimal(Number(row.rsi14), 1) : 'N/A',
                hasMetric(row?.price_vs_sma200_pct) ? formatPercent(Number(row.price_vs_sma200_pct)) : 'N/A',
                technicalNoteLinkBySymbol.get(symbol) || 'N/A',
              ];
            })
          ),
        },
        {
          heading: 'Fundamentals Snapshot',
          content: buildTable(
            ['Symbol', 'Coverage', 'Market Cap', 'P/E', 'EV/Sales', 'ROE %', 'Target Upside %', 'Cached'],
            watchlist.symbols.map(symbol => {
              const fundamentals = fundamentalsBySymbol.get(symbol);
              return [
                symbol,
                fundamentals?.coverageStatus || 'missing',
                fundamentals?.marketCap != null ? formatNumber(fundamentals.marketCap, { style: 'currency' }) : 'N/A',
                hasMetric(fundamentals?.trailingPE) ? formatDecimal(Number(fundamentals.trailingPE), 1) : 'N/A',
                hasMetric(fundamentals?.evToSales) ? formatDecimal(Number(fundamentals.evToSales), 1) : 'N/A',
                hasMetric(fundamentals?.roePct) ? formatPercent(Number(fundamentals.roePct)) : 'N/A',
                hasMetric(fundamentals?.targetUpsidePct) ? formatPercent(Number(fundamentals.targetUpsidePct)) : 'N/A',
                fundamentals?.cachedAt || 'N/A',
              ];
            })
          ),
        },
        {
          heading: 'Earnings Window',
          content: thesisEarningsRows.length > 0
            ? buildTable(
                ['Date', 'Symbol', 'EPS Est', 'EPS Act', 'Revenue Est', 'Revenue Act', 'Last Updated'],
                thesisEarningsRows.map(row => [
                  row.date,
                  row.symbol,
                  row.epsEstimated,
                  row.epsActual,
                  row.revenueEstimated,
                  row.revenueActual,
                  row.lastUpdated,
                ])
              )
            : 'No earnings rows matched this watchlist in the requested range.',
        },
        {
          heading: 'Source',
          content: [
            '- **API**: Financial Modeling Prep (batch quote, technical snapshot, profile, ratios-ttm, key-metrics-ttm, price-target-summary, earnings calendar)',
            `- **Range**: ${from} to ${to}`,
            `- **Interval**: ${interval}`,
            `- **Fundamentals Warmed**: ${warmFundamentals ? 'yes' : 'no'}`,
            `- **Thesis Path**: ${watchlist.relativePath}`,
            `- **Batch Earnings Note**: ${filePathToWikiLink(earningsResult.filePath)}`,
            `- **Auto-synced to Theses**: ${shouldSync ? 'yes' : 'no'}`,
            `- **Auto-pulled**: ${today()}`,
          ].join('\n'),
        },
      ],
    });

    const filePath = join(
      getPullsDir(),
      'Market',
      dateStampedFilename(`FMP_${watchlist.isBasket ? 'Basket' : 'Thesis'}_Watchlist_${sanitizeWatchlistLabel(watchlist.name)}`)
    );
    writeNote(filePath, note);
    filePaths.push(filePath);
    console.log(`📝 Wrote: ${filePath}`);
  }

  if (shouldSync) {
    const thesisSync = await import('../sync-thesis-fmp.mjs');
    await thesisSync.run({
      ...(includeBaskets ? { 'include-baskets': true } : {}),
      ...(thesisFilter ? { thesis: thesisFilter } : {}),
    });
  }

  return {
    filePaths,
    signals: [],
    failures: technicalFailures,
    fundamentals: {
      cachedCount: warmedFundamentalsCount,
      completeCount: warmedCompleteFundamentalsCount,
      skipped: !warmFundamentals,
    },
  };
}

async function pullEarningsCalendar(flags, apiKey, baseUrl) {
  const stableBaseUrl = getStableBaseUrl(baseUrl);
  const from = String(flags.from || today());
  const to = String(flags.to || addDays(today(), 14));
  const limit = parseIntegerFlag(flags.limit, 40, '--limit');
  const symbols = parseSymbolList(flags.symbols || flags.symbol || '');
  const symbolAliasMap = buildFmpSymbolAliasMap(symbols);
  const watchlistName = String(flags['watchlist-name'] || flags.watchlist || '').trim();
  const calendarScope = String(flags.scope || (symbols.length > 0 ? 'watchlist' : 'broad'));
  const filenameLabel = sanitizeWatchlistLabel(flags.label || flags['filename-label'] || '');
  console.log(`📅 FMP: Fetching earnings calendar from ${from} to ${to}...`);

  const data = await getJson(`${stableBaseUrl}/earnings-calendar?from=${from}&to=${to}&apikey=${apiKey}`);
  const calendar = (Array.isArray(data) ? data : [])
    .map(entry => {
      const originalSymbol = normalizeSymbol(entry?.symbol);
      const resolvedSymbol = symbols.length > 0 ? resolveRequestedSymbol(originalSymbol, symbolAliasMap) : null;
      return {
        ...entry,
        symbol: resolvedSymbol || originalSymbol || entry?.symbol || 'N/A',
        resolvedSymbol,
      };
    })
    .filter(entry => symbols.length === 0 || Boolean(entry.resolvedSymbol))
    .sort((left, right) => String(left.date || '').localeCompare(String(right.date || '')))
    .slice(0, limit);
  const referenceDate = today();
  const recentEntries = calendar.filter(entry => String(entry.date || '') < referenceDate);
  const todayEntries = calendar.filter(entry => String(entry.date || '') === referenceDate);
  const upcomingEntries = calendar.filter(entry => String(entry.date || '') > referenceDate);
  const nextEarningsDate = todayEntries[0]?.date || upcomingEntries[0]?.date || null;

  const note = buildNote({
    frontmatter: {
      title: `FMP Earnings Calendar${watchlistName ? ` - ${watchlistName}` : ''} (${from} to ${to})`,
      source: 'Financial Modeling Prep',
      date_pulled: today(),
      calendar_from: from,
      calendar_to: to,
      calendar_scope: calendarScope,
      watchlist_name: watchlistName || null,
      domain: 'market',
      data_type: 'calendar',
      frequency: 'on-demand',
      signal_status: calendar.length > 0 ? 'clear' : 'watch',
      signals: [],
      earnings_row_count: calendar.length,
      earnings_recent_count: recentEntries.length,
      earnings_today_count: todayEntries.length,
      earnings_upcoming_count: upcomingEntries.length,
      next_earnings_date: nextEarningsDate,
      filtered_symbols: symbols,
      recent_symbols: collectUniqueSymbols(recentEntries),
      today_symbols: collectUniqueSymbols(todayEntries),
      upcoming_symbols: collectUniqueSymbols(upcomingEntries),
      tags: ['equities', 'calendar', 'earnings', 'fmp'],
    },
    sections: [
      {
        heading: 'Upcoming / Recent Earnings',
        content: calendar.length > 0
          ? buildTable(
              ['Date', 'Symbol', 'EPS Est', 'EPS Act', 'Revenue Est', 'Revenue Act', 'Last Updated'],
              calendar.map(entry => [
                entry.date || 'N/A',
                entry.symbol || 'N/A',
                formatMetricNumber(entry.epsEstimated, 2),
                formatMetricNumber(entry.epsActual, 2),
                formatCompactCurrency(entry.revenueEstimated),
                formatCompactCurrency(entry.revenueActual),
                entry.lastUpdated || 'N/A',
              ])
            )
          : 'No earnings rows matched the requested range.',
      },
      {
        heading: 'Calendar Read',
        content: [
          `- **Scope**: ${symbols.length > 0 ? 'watchlist' : 'broad market'}`,
          `- **Recent Rows**: ${recentEntries.length}`,
          `- **Today Rows**: ${todayEntries.length}`,
          `- **Upcoming Rows**: ${upcomingEntries.length}`,
          `- **Next Earnings Date**: ${nextEarningsDate || 'none in range'}`,
          `- **Today Symbols**: ${todayEntries.length > 0 ? collectUniqueSymbols(todayEntries).join(', ') : 'none'}`,
          `- **Upcoming Symbols**: ${upcomingEntries.length > 0 ? collectUniqueSymbols(upcomingEntries).join(', ') : 'none'}`,
        ].join('\n'),
      },
      {
        heading: 'Source',
        content: `- **API**: Financial Modeling Prep (earnings-calendar)\n- **Range**: ${from} to ${to}\n- **Rows**: ${calendar.length}\n- **Filtered Symbols**: ${symbols.length > 0 ? symbols.join(', ') : 'none'}\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const suffix = filenameLabel
    ? `_${filenameLabel}`
    : symbols.length > 0
      ? `_${symbols.join('_')}`
      : '';
  const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`FMP_Earnings_Calendar${suffix}`));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals: [] };
}

/**
 * Pull options chain data for a symbol.
 * @param {string} symbol — ticker symbol
 * @param {string} apiKey
 * @param {string} baseUrl
 * @returns {Promise<{filePath: string, signals: object[]}>}
 */
async function pullOptions(symbol, apiKey, baseUrl) {
  const sym = symbol.toUpperCase();
  console.log(`📊 FMP: Fetching options chain for ${sym}...`);

  let chain = null;

  try {
    const v3Url = `${baseUrl}/stock/option-chain/${sym}?apikey=${apiKey}`;
    const v3Data = await getJson(v3Url);

    if (v3Data?.['Error Message']) {
      throw new Error(v3Data['Error Message']);
    }

    if (Array.isArray(v3Data) && v3Data.length > 0) {
      chain = v3Data;
    } else {
      console.log(`  v3 returned empty — trying v4 fallback...`);
      const v4Url = `${baseUrl.replace('/v3', '/v4')}/stock/option-chain/${sym}?apikey=${apiKey}`;
      const v4Data = await getJson(v4Url);

      if (v4Data?.['Error Message']) {
        throw new Error(v4Data['Error Message']);
      }

      if (Array.isArray(v4Data) && v4Data.length > 0) {
        chain = v4Data;
      }
    }
  } catch (err) {
    throw new Error(`Options chain unavailable for ${sym}: ${err.message}`);
  }

  if (!chain || chain.length === 0) {
    throw new Error(`No options data available for ${sym}.`);
  }

  console.log(`  ${chain.length} contracts retrieved`);

  // --- Derived metrics ---

  // Put/Call volume ratio
  let totalCallVolume = 0;
  let totalPutVolume = 0;
  let totalCallIV = 0;
  let totalPutIV = 0;
  let callIVCount = 0;
  let putIVCount = 0;

  // Max pain: combined OI per strike
  const oiByStrike = {};

  // Unusual volume: max vol/OI ratio
  let maxVolToOI = 0;

  for (const contract of chain) {
    const type = (contract.type || contract.optionType || '').toLowerCase();
    const vol = Number(contract.volume) || 0;
    const oi = Number(contract.openInterest) || 0;
    const iv = Number(contract.impliedVolatility) || 0;
    const strike = Number(contract.strike) || 0;

    if (type === 'call') {
      totalCallVolume += vol;
      if (iv > 0) { totalCallIV += iv; callIVCount++; }
    } else if (type === 'put') {
      totalPutVolume += vol;
      if (iv > 0) { totalPutIV += iv; putIVCount++; }
    }

    if (strike > 0) {
      oiByStrike[strike] = (oiByStrike[strike] || 0) + oi;
    }

    if (oi > 0) {
      const ratio = vol / oi;
      if (ratio > maxVolToOI) maxVolToOI = ratio;
    }
  }

  const putCallRatio = totalCallVolume > 0
    ? totalPutVolume / totalCallVolume
    : null;

  // Max pain strike
  let maxPainStrike = null;
  let maxPainOI = -Infinity;
  for (const [strike, combinedOI] of Object.entries(oiByStrike)) {
    if (combinedOI > maxPainOI) {
      maxPainOI = combinedOI;
      maxPainStrike = Number(strike);
    }
  }

  const avgCallIV = callIVCount > 0 ? (totalCallIV / callIVCount) : null;
  const avgPutIV = putIVCount > 0 ? (totalPutIV / putIVCount) : null;

  // --- Signals ---
  const signals = [];
  if (putCallRatio !== null) {
    const pcSignal = evaluatePutCallRatio(putCallRatio);
    if (pcSignal) signals.push(pcSignal);
  }
  if (maxVolToOI > 0) {
    const uvSignal = evaluateUnusualOptionsActivity(maxVolToOI);
    if (uvSignal) signals.push(uvSignal);
  }

  const severity = highestSeverity(signals);

  // --- Top contracts table (by volume, top 30) ---
  const sorted = [...chain].sort((a, b) => (Number(b.volume) || 0) - (Number(a.volume) || 0));
  const top30 = sorted.slice(0, 30);

  const rows = top30.map(c => [
    c.strike != null ? `$${Number(c.strike).toFixed(2)}` : 'N/A',
    c.expiration || c.expirationDate || 'N/A',
    (c.type || c.optionType || 'N/A').toUpperCase(),
    c.lastPrice != null ? `$${Number(c.lastPrice).toFixed(2)}` : 'N/A',
    c.bid != null ? `$${Number(c.bid).toFixed(2)}` : 'N/A',
    c.ask != null ? `$${Number(c.ask).toFixed(2)}` : 'N/A',
    formatNumber(Number(c.volume) || 0, { style: 'compact' }),
    formatNumber(Number(c.openInterest) || 0, { style: 'compact' }),
    c.impliedVolatility != null ? `${(Number(c.impliedVolatility) * 100).toFixed(1)}%` : 'N/A',
    c.delta != null ? Number(c.delta).toFixed(3) : 'N/A',
  ]);

  // --- Summary bullets ---
  const summaryLines = [
    `- **Total Call Volume**: ${formatNumber(totalCallVolume, { style: 'compact' })}`,
    `- **Total Put Volume**: ${formatNumber(totalPutVolume, { style: 'compact' })}`,
    `- **Put/Call Volume Ratio**: ${putCallRatio !== null ? putCallRatio.toFixed(3) : 'N/A'}`,
    `- **Max Pain Strike**: ${maxPainStrike !== null ? `$${maxPainStrike.toFixed(2)}` : 'N/A'}`,
    `- **Avg Call IV**: ${avgCallIV !== null ? `${(avgCallIV * 100).toFixed(1)}%` : 'N/A'}`,
    `- **Avg Put IV**: ${avgPutIV !== null ? `${(avgPutIV * 100).toFixed(1)}%` : 'N/A'}`,
    `- **Max Vol/OI Ratio**: ${maxVolToOI > 0 ? maxVolToOI.toFixed(2) : 'N/A'}`,
    `- **Contracts in Chain**: ${chain.length}`,
  ];

  // --- Build note ---
  const signalsSection = formatSignalsSection(signals);

  const note = buildNote({
    frontmatter: {
      title: `${sym} Options Chain — FMP`,
      source: 'Financial Modeling Prep',
      symbol: sym,
      date_pulled: today(),
      domain: 'market',
      data_type: 'snapshot',
      frequency: 'on-demand',
      signal_status: severity || 'clear',
      signals: signals.map(s => s.label || s.name || s.type || 'signal'),
      tags: ['options', 'options-chain', sym.toLowerCase(), 'fmp'],
    },
    sections: [
      ...(signals.length > 0 ? [{ heading: 'Signals', content: signalsSection }] : []),
      {
        heading: 'Summary',
        content: summaryLines.join('\n'),
      },
      {
        heading: `Top 30 Contracts by Volume`,
        content: buildTable(
          ['Strike', 'Exp', 'Type', 'Last', 'Bid', 'Ask', 'Vol', 'OI', 'IV', 'Delta'],
          rows
        ),
      },
      {
        heading: 'Source',
        content: `- **API**: Financial Modeling Prep (option-chain)\n- **Symbol**: ${sym}\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`FMP_Options_${sym}`));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);

  // Write signal log
  if (signals.length > 0) {
    const signalLogPath = join(getSignalsDir(), dateStampedFilename(`signals_FMP_Options_${sym}`));
    writeNote(signalLogPath, buildNote({
      frontmatter: {
        title: `Signals — FMP Options ${sym}`,
        source: 'Financial Modeling Prep',
        symbol: sym,
        date_pulled: today(),
        signal_status: severity,
        tags: ['signals', 'options', sym.toLowerCase(), 'fmp'],
      },
      sections: [{ heading: 'Signals', content: signalsSection }],
    }));
    console.log(`🚨 Signals written: ${signalLogPath}`);
  }

  return { filePath, signals };
}

async function pullMicroSmallSectorScreen(flags, apiKey, baseUrl) {
  const stableBaseUrl = getStableBaseUrl(baseUrl);
  const screen = resolveMicroSmallScreen(flags);
  const sectors = resolveSectorTargets(flags.sector);

  console.log(`FMP: Screening ${sectors.length} sector(s) for micro/small cap ideas...`);
  console.log(`  Market cap: ${formatNumber(screen.marketCapMin, { style: 'currency' })} to ${formatNumber(screen.marketCapMax, { style: 'currency' })}`);
  console.log(`  Liquidity: price >= $${screen.priceMin.toFixed(2)}, volume >= ${formatNumber(screen.volumeMin, { style: 'compact' })}`);
  const provider = await screenMicroSmallUniverse({ sectors, screen, apiKey, stableBaseUrl });
  const { providerKey, providerLabel, fallbackReason, taxonomyNote, resultsBySector } = provider;

  const totalCandidates = resultsBySector.reduce((sum, sector) => sum + sector.candidates.length, 0);
  const fundamentalsCount = resultsBySector.reduce((sum, sector) => sum + (sector.stats.fundamentals || 0), 0);
  const criteriaLines = [
    `- **Universe**: ${screen.country}-listed equities inside the selected sector taxonomy`,
    `- **Market Cap Range**: ${formatNumber(screen.marketCapMin, { style: 'currency' })} to ${formatNumber(screen.marketCapMax, { style: 'currency' })}`,
    `- **Micro-Cap Cutoff**: Below ${formatNumber(screen.microCapMax, { style: 'currency' })}`,
    `- **Price Floor**: $${screen.priceMin.toFixed(2)}`,
    `- **Volume Floor**: ${formatNumber(screen.volumeMin, { style: 'compact' })} shares`,
    `- **Per-Sector Limit**: ${screen.perSectorLimit}`,
    '- **Phase 1 Exclusions**: funds/ETFs, ADRs/ADS, LP-trust-unit structures, duplicate share classes',
    '- **Phase 3 Quality Score**: FMP profile, ratios, key metrics, and price-target data plus SEC company-facts growth fallback',
    '- **Phase 4 Output**: up to 3 small caps, up to 3 micro caps, plus 1 special situation per sector, then reserve names up to the per-sector limit',
    '- **Phase 5 Columns**: why now, valuation snapshot, and key risk for each research pick',
    '- **Phase 6 Sector Lens**: primary picks must pass a sector-fit gate and are re-ranked with sector-specific valuation and profitability rules',
    `- **Phase 7 Overvalued Watchlist**: sector-aware forward/trailing P/E stretch screen across all market caps, while keeping the same price, country, and exclusion filters plus a ${formatNumber(OVERVALUED_MIN_DOLLAR_VOLUME, { style: 'currency' })} dollar-volume floor and sector-fit gate`,
    `- **Provider**: ${providerLabel}`,
    `- **Fundamentals Coverage**: ${fundamentalsCount} cached/live FMP or SEC company-facts profiles across selected names`,
    `- **Taxonomy Note**: ${taxonomyNote}`,
  ];

  const coverageRows = resultsBySector.map(sector => [
    sector.vaultLink,
    sector.apiSector,
    String(sector.stats.raw),
    String(sector.stats.excludedFundEtf),
    String(sector.stats.excludedAdr),
    String(sector.stats.excludedStructure),
    String(sector.stats.excludedDuplicate),
    String(sector.stats.fundamentals || 0),
    String(sector.stats.eligible),
    String(sector.candidates.length),
  ]);

  const priorityBoard = resultsBySector
    .flatMap(sector => sector.candidates.map(candidate => ({
      ...candidate,
      sectorLink: sector.vaultLink,
      tierLabel: researchTierLabel(candidate.researchTier),
    })))
    .sort(sortByScoreThenLiquidity)
    .slice(0, Math.min(15, totalCandidates));
  const overvaluedWatchlist = selectPotentiallyOvervaluedCandidates(resultsBySector);

  const sections = [
    {
      heading: 'Search Criteria',
      content: criteriaLines.join('\n'),
    },
    {
      heading: 'Sector Coverage',
      content: buildTable(
        ['Vault Sector', 'Source Sector', 'Raw', 'Funds/ETF', 'ADR/ADS', 'LP/Trust', 'Dupes', 'Fund', 'Eligible', 'Final'],
        coverageRows
      ),
    },
    {
      heading: 'Priority Board',
      content: priorityBoard.length > 0
        ? buildTable(
          ['Sector', 'Tier', 'Ticker', 'Score', 'Quality', 'Why Now', 'Valuation', 'Risk'],
          priorityBoard.map(candidate => [
            candidate.sectorLink,
            candidate.tierLabel,
            `[[${candidate.symbol}]]`,
            String(candidate.score),
            String(candidate.qualityScore ?? 'N/A'),
            candidate.whyNow,
            candidate.valuationSnapshot,
            candidate.keyRisk,
          ])
        )
        : '- No candidates passed the current filters.',
    },
    {
      heading: 'Potential Overvalued Watchlist',
      content: overvaluedWatchlist.length > 0
        ? buildTable(
          ['Sector', 'Cap', 'Mkt Cap', 'Ticker', 'Multiple', 'Stretch', 'Quality', 'Why It Looks Rich', 'Risk'],
          overvaluedWatchlist.map(candidate => [
            candidate.sectorLink,
            candidate.capBucket,
            formatNumber(candidate.marketCap, { style: 'currency' }),
            `[[${candidate.symbol}]]`,
            candidate.earningsMultipleLabel || candidate.valuationSnapshot,
            candidate.earningsStretchText || 'N/A',
            String(candidate.qualityScore ?? 'N/A'),
            candidate.overvaluationReason || 'rich multiple versus current earnings support',
            candidate.keyRisk,
          ])
        )
        : '- No selected candidates currently screen as stretched on forward/trailing earnings multiples.',
    },
  ];

  for (const sector of resultsBySector) {
    sections.push({
      heading: `${sector.vaultSector} Research Picks`,
      content: buildSectorResearchPicksContent(sector),
    });
  }

  sections.push({
    heading: 'Research Queue',
    content: priorityBoard.length > 0
      ? [
        `- **Total Candidates**: ${totalCandidates}`,
        `- **Highest Score**: ${priorityBoard[0].score} (${priorityBoard[0].symbol})`,
        `- **Highest Quality Score**: ${priorityBoard.slice().sort((left, right) => (right.qualityScore || 0) - (left.qualityScore || 0))[0].symbol}`,
        '- Start with the small-cap and micro-cap tier leaders before touching the special situations.',
        '- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.',
      ].join('\n')
      : '- No research queue available because no candidates passed the current filters.',
  });

  sections.push({
    heading: 'Source',
    content: [
      `- **Provider**: ${providerLabel}`,
      ...(fallbackReason ? [`- **Fallback**: ${fallbackReason}`] : []),
      `- **Auto-pulled**: ${today()}`,
    ].join('\n'),
  });

  const targetLabel = sectors.length === 1 ? sectors[0].vaultSector : 'All Sectors';
  const note = buildNote({
    frontmatter: {
      title: `${targetLabel} Micro/Small Cap Search - ${providerKey}`,
      source: providerLabel,
      date_pulled: today(),
      domain: 'market',
      data_type: 'screen',
      frequency: 'on-demand',
      signal_status: 'clear',
      signals: [],
      tags: ['equities', 'screener', 'micro-cap', 'small-cap', providerKey.toLowerCase()],
    },
    sections,
  });

  const fileStem = sectors.length === 1
    ? `${providerKey}_${sectors[0].vaultSector}_Micro_Small_Cap_Search`
    : `${providerKey}_All_Sectors_Micro_Small_Cap_Search`;
  const filePath = join(getPullsDir(), 'Market', dateStampedFilename(fileStem));
  writeNote(filePath, note);
  console.log(`  Wrote: ${filePath}`);

  return {
    filePath,
    sectors: resultsBySector.length,
    candidates: totalCandidates,
  };
}

async function screenMicroSmallUniverse({ sectors, screen, apiKey, stableBaseUrl }) {
  try {
    const resultsBySector = [];
    for (const sector of sectors) {
      console.log(`  - ${sector.apiSector}`);
      resultsBySector.push(await screenSectorWithFmp(sector, screen, apiKey, stableBaseUrl));
    }

    return {
      providerKey: 'FMP',
      providerLabel: 'Financial Modeling Prep',
      fallbackReason: null,
      taxonomyNote: '[[Aerospace & Defense]] remains inside [[Industrials]] in FMP sector data.',
      resultsBySector,
    };
  } catch (err) {
    if (!isFallbackableFmpScreenerError(err)) throw err;

    console.log('  FMP screener is unavailable on the current plan or rate-limited. Falling back to Nasdaq public screener...');
    const { resultsBySector, taxonomyOverrideCount } = await screenSectorsWithNasdaq(sectors, screen, apiKey, stableBaseUrl);
    return {
      providerKey: 'NASDAQ',
      providerLabel: 'Nasdaq Public Screener',
      fallbackReason: 'FMP company-screener was unavailable because the endpoint was restricted or temporarily rate-limited on the current subscription.',
      taxonomyNote: `Nasdaq sectors are normalized with text-based industry/company overrides${taxonomyOverrideCount ? ` (${taxonomyOverrideCount} rows reassigned)` : ''}; [[Communication Services]] maps to Telecommunications labels, and unclassified Miscellaneous names are excluded.`,
      resultsBySector,
    };
  }
}

async function screenSectorWithFmp(sector, screen, apiKey, stableBaseUrl) {
  const params = new URLSearchParams({
    apikey: apiKey,
    sector: sector.apiSector,
    country: screen.country,
    priceMoreThan: String(screen.priceMin),
    volumeMoreThan: String(screen.volumeMin),
    isEtf: 'false',
    isFund: 'false',
    isActivelyTrading: 'true',
  });

  const response = await fetch(`${stableBaseUrl}/company-screener?${params.toString()}`, {
    headers: {
      'User-Agent': 'MyData-Vault/1.0',
    },
  });
  const text = await response.text();
  let data = text;

  try {
    data = JSON.parse(text);
  } catch {
    // FMP sometimes returns plain-text errors for restricted endpoints.
  }

  if (!response.ok) {
    throw buildFmpScreenerError({
      status: response.status,
      data,
    });
  }

  const rawCandidates = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];

  const normalizedCandidates = rawCandidates
    .filter(candidate => matchesOvervaluedScreen(candidate, screen))
    .sort(sortByMarketCapThenVolume)
    .map(candidate => decorateSectorCandidate(normalizeCandidate(candidate, screen), sector));

  return finalizeSectorCandidates(
    sector,
    normalizedCandidates.filter(candidate => matchesMicroSmallScreen(candidate, screen)),
    normalizedCandidates,
    screen,
    { apiKey, stableBaseUrl }
  );
}

async function screenSectorsWithNasdaq(sectors, screen, apiKey, stableBaseUrl) {
  const rows = await fetchNasdaqUniverse();
  const { classifiedRows } = classifyNasdaqUniverse(rows);
  const screenedRows = classifiedRows.filter(entry => matchesNasdaqOvervaluedScreen(entry.row, screen));
  const taxonomyOverrideCount = screenedRows.filter(entry => entry.taxonomyOverride).length;

  const results = [];

  for (const sector of sectors) {
    const sectorCandidates = screenedRows
      .filter(entry => entry.resolvedSector.profileKey === sector.profileKey)
      .map(entry => normalizeNasdaqCandidate(entry.row, screen, entry))
      .sort(sortByMarketCapThenVolume)
      .map(candidate => decorateSectorCandidate(candidate, sector));

    results.push(await finalizeSectorCandidates(
      sector,
      sectorCandidates.filter(candidate => matchesMicroSmallScreen(candidate, screen)),
      sectorCandidates,
      screen,
      { apiKey, stableBaseUrl }
    ));
  }

  return {
    resultsBySector: results,
    taxonomyOverrideCount,
  };
}

async function finalizeSectorCandidates(sector, rawCandidates, overvaluedUniverseCandidates, screen, fmpContext) {
  const preScored = rawCandidates
    .map(candidate => applyBaseScore(candidate, screen))
    .sort(sortByBaseScoreThenLiquidity);
  const { included: phaseOneEligible, excludedCounts: phaseOneExclusions } = applyCandidateExclusions(preScored);
  const shortlist = buildQualityShortlist(phaseOneEligible, screen.perSectorLimit);

  const overvaluedPreScored = overvaluedUniverseCandidates
    .map(candidate => applyBaseScore(candidate, screen))
    .filter(candidate => (candidate.dollarVolume || 0) >= OVERVALUED_MIN_DOLLAR_VOLUME)
    .sort(sortByMarketCapThenVolume);
  const { included: overvaluedEligible } = applyCandidateExclusions(overvaluedPreScored);
  const overvaluedShortlist = buildOvervaluedShortlist(overvaluedEligible);

  const combinedShortlist = mergeCandidatesBySymbol(shortlist, overvaluedShortlist);
  const enrichedCombined = await enrichCandidatesWithFundamentals(combinedShortlist, fmpContext);
  const enrichedBySymbol = new Map(enrichedCombined.map(candidate => [candidate.symbol, candidate]));

  const enriched = shortlist.map(candidate => enrichedBySymbol.get(candidate.symbol) || candidate);
  const { included, excludedCounts: overviewExclusions } = applyCandidateExclusions(enriched);
  const scoredCandidates = included
    .map(candidate => applyCompositeScore(candidate, screen))
    .map(candidate => applyQualityScore(candidate))
    .map(candidate => applySectorProfile(candidate))
    .map(candidate => applyPotentialOvervaluation(candidate))
    .sort(sortByScoreThenLiquidity);
  const researchPicks = buildResearchPickSet(scoredCandidates, screen.perSectorLimit);
  const candidates = researchPicks.allSelected;

  const enrichedOvervalued = overvaluedShortlist.map(candidate => enrichedBySymbol.get(candidate.symbol) || candidate);
  const { included: overvaluedIncluded } = applyCandidateExclusions(enrichedOvervalued);
  const overvaluedCandidates = overvaluedIncluded
    .map(candidate => applyCompositeScore(candidate, screen))
    .map(candidate => applyQualityScore(candidate))
    .map(candidate => applySectorProfile(candidate))
    .map(candidate => applyPotentialOvervaluation(candidate))
    .filter(candidate => candidate.isPotentiallyOvervalued)
    .filter(candidate => (candidate.dollarVolume || 0) >= OVERVALUED_MIN_DOLLAR_VOLUME)
    .filter(candidate => (candidate.sectorFitScore ?? 50) >= (candidate.sectorFitThreshold || 45))
    .sort(sortByPotentialOvervaluation);

  return {
    ...sector,
    candidates,
    overvaluedCandidates,
    researchPicks,
    stats: {
      raw: rawCandidates.length,
      fundamentals: candidates.filter(candidate => candidate.hasFundamentals).length,
      excludedFundEtf: phaseOneExclusions.fundEtf + overviewExclusions.fundEtf,
      excludedAdr: phaseOneExclusions.adr + overviewExclusions.adr,
      excludedStructure: phaseOneExclusions.structure + overviewExclusions.structure,
      excludedDuplicate: phaseOneExclusions.duplicate + overviewExclusions.duplicate,
      eligible: scoredCandidates.length,
      final: candidates.length,
    },
  };
}

function buildQualityShortlist(candidates, limit) {
  const shortlistSize = Math.max(limit + 4, 10);
  return selectBalancedCandidates(candidates, shortlistSize);
}

function buildOvervaluedShortlist(candidates) {
  if (candidates.length <= OVERVALUED_SHORTLIST_LIMIT) return candidates;

  const bucketTargets = new Map([
    ['Mega', 1],
    ['Large', 2],
    ['Mid', 2],
    ['Small', 2],
    ['Micro', 1],
  ]);

  const selected = [];
  const selectedSymbols = new Set();

  for (const [bucket, target] of bucketTargets.entries()) {
    const bucketCandidates = candidates
      .filter(candidate => candidate.capBucket === bucket)
      .slice(0, target);

    for (const candidate of bucketCandidates) {
      if (selectedSymbols.has(candidate.symbol)) continue;
      selected.push(candidate);
      selectedSymbols.add(candidate.symbol);
    }
  }

  if (selected.length < OVERVALUED_SHORTLIST_LIMIT) {
    for (const candidate of candidates) {
      if (selectedSymbols.has(candidate.symbol)) continue;
      selected.push(candidate);
      selectedSymbols.add(candidate.symbol);
      if (selected.length >= OVERVALUED_SHORTLIST_LIMIT) break;
    }
  }

  return selected;
}

function mergeCandidatesBySymbol(...groups) {
  const merged = [];
  const seen = new Set();

  for (const group of groups) {
    for (const candidate of group) {
      if (!candidate?.symbol || seen.has(candidate.symbol)) continue;
      merged.push(candidate);
      seen.add(candidate.symbol);
    }
  }

  return merged;
}

async function enrichCandidatesWithFundamentals(candidates, fmpContext) {
  return mapWithConcurrency(candidates, 2, async candidate => {
    const fundamentals = await fetchFmpFundamentalsBundle(candidate.symbol, fmpContext);
    const enrichedFromFmp = mergeFmpFundamentals(candidate, fundamentals);
    if (enrichedFromFmp.hasFundamentals) {
      return enrichedFromFmp;
    }
    const secFacts = await fetchSecCompanyFactsCached(candidate.symbol);
    return mergeSecCompanyFacts(enrichedFromFmp, secFacts);
  });
}

async function fetchNasdaqUniverse() {
  const response = await fetchWithRetry(
    'https://api.nasdaq.com/api/screener/stocks?tableonly=true&download=true&limit=10000&offset=0',
    {
      headers: {
        Accept: 'application/json,text/plain,*/*',
        Origin: 'https://www.nasdaq.com',
        Referer: 'https://www.nasdaq.com/',
        'User-Agent': 'Mozilla/5.0',
      },
    }
  );

  if (!response.ok) {
    const detail = typeof response.data === 'string'
      ? response.data.slice(0, 200)
      : JSON.stringify(response.data).slice(0, 200);
    throw new Error(`Nasdaq screener HTTP ${response.status}: ${detail}`);
  }

  if (!Array.isArray(response.data?.data?.rows)) {
    throw new Error('Nasdaq screener returned an unexpected payload shape.');
  }

  return response.data.data.rows;
}

function getStableBaseUrl(baseUrl) {
  return baseUrl.replace(/\/api\/v\d+$/, '/stable');
}

function resolveMicroSmallScreen(flags) {
  const screen = {
    country: String(flags.country || DEFAULT_MICRO_SMALL_SCREEN.country).toUpperCase(),
    marketCapMin: parseNumberFlag(flags['market-cap-min'], DEFAULT_MICRO_SMALL_SCREEN.marketCapMin, '--market-cap-min'),
    marketCapMax: parseNumberFlag(flags['market-cap-max'], DEFAULT_MICRO_SMALL_SCREEN.marketCapMax, '--market-cap-max'),
    microCapMax: parseNumberFlag(flags['micro-cap-max'], DEFAULT_MICRO_SMALL_SCREEN.microCapMax, '--micro-cap-max'),
    priceMin: parseNumberFlag(flags['price-more-than'], DEFAULT_MICRO_SMALL_SCREEN.priceMin, '--price-more-than'),
    volumeMin: parseNumberFlag(flags['volume-more-than'], DEFAULT_MICRO_SMALL_SCREEN.volumeMin, '--volume-more-than'),
    perSectorLimit: parseIntegerFlag(flags.limit, DEFAULT_MICRO_SMALL_SCREEN.perSectorLimit, '--limit'),
  };

  if (screen.marketCapMax <= screen.marketCapMin) {
    throw new Error('--market-cap-max must be greater than --market-cap-min');
  }
  if (screen.microCapMax <= screen.marketCapMin || screen.microCapMax >= screen.marketCapMax) {
    throw new Error('--micro-cap-max must fall between --market-cap-min and --market-cap-max');
  }

  return screen;
}

function resolveSectorTargets(rawSector) {
  if (!rawSector) return SECTOR_SCREEN_UNIVERSE;

  const normalized = normalizeSectorKey(rawSector);
  const match = SECTOR_SCREEN_UNIVERSE.find(sector =>
    normalizeSectorKey(sector.apiSector) === normalized ||
    normalizeSectorKey(sector.vaultSector) === normalized
  );

  if (!match) {
    const supported = SECTOR_SCREEN_UNIVERSE.map(sector => sector.vaultSector).join(', ');
    throw new Error(`Unknown sector "${rawSector}". Supported sectors: ${supported}`);
  }

  return [match];
}

function normalizeSectorKey(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '');
}

function resolveNasdaqSourceSector(rawSector) {
  const normalized = normalizeSectorKey(rawSector);
  if (!normalized || normalized === 'miscellaneous') return null;

  return SECTOR_SCREEN_UNIVERSE.find(sector =>
    normalizeSectorKey(sector.nasdaqSector || sector.apiSector) === normalized ||
    normalizeSectorKey(sector.apiSector) === normalized ||
    normalizeSectorKey(sector.vaultSector) === normalized
  ) || null;
}

function countSectorKeywordHits(haystack, keywords = []) {
  let hits = 0;
  for (const keyword of keywords) {
    if (haystack.includes(keyword)) hits++;
  }
  return hits;
}

function scoreNasdaqSectorCandidate(sector, haystack, sourceSector) {
  const profile = SECTOR_PROFILE_CONFIG[sector.profileKey] || { strict: false, allow: [], block: [] };
  const hints = NASDAQ_TAXONOMY_HINTS[sector.profileKey] || [];
  const allowHits = countSectorKeywordHits(haystack, profile.allow);
  const hintHits = countSectorKeywordHits(haystack, hints);
  const blockHits = countSectorKeywordHits(haystack, profile.block);
  const isSourceSector = sourceSector?.profileKey === sector.profileKey;

  let score = isSourceSector ? 18 : 0;
  score += Math.min(hintHits, 2) * 16;
  score += Math.min(allowHits, 3) * (profile.strict ? 12 : 10);
  score -= Math.min(blockHits, 2) * (profile.strict ? 14 : 10);

  if (profile.strict && allowHits === 0 && hintHits === 0) score -= isSourceSector ? 10 : 8;
  if (blockHits > 0 && allowHits === 0 && hintHits === 0) score -= 6;

  return {
    sector,
    score,
    allowHits,
    hintHits,
    blockHits,
  };
}

function resolveNasdaqCanonicalSector(row) {
  const sourceSector = resolveNasdaqSourceSector(row.sector);
  const haystack = `${row.industry || ''} ${row.name || ''}`.toLowerCase().trim();

  if (!haystack) return sourceSector;

  const ranked = SECTOR_SCREEN_UNIVERSE
    .map(sector => scoreNasdaqSectorCandidate(sector, haystack, sourceSector))
    .sort((left, right) => right.score - left.score);

  const best = ranked[0];
  if (!best) return sourceSector;
  if (!sourceSector) return best.score >= 14 ? best.sector : null;
  if (best.sector.profileKey === sourceSector.profileKey) return sourceSector;

  const sourceScore = ranked.find(entry => entry.sector.profileKey === sourceSector.profileKey) || {
    score: 0,
    allowHits: 0,
    hintHits: 0,
  };
  const bestHasTextSignal = best.hintHits > 0 || best.allowHits >= 2;
  const sourceWeak = sourceScore.hintHits === 0 && sourceScore.allowHits === 0;

  if (bestHasTextSignal && (best.score >= sourceScore.score + 4 || sourceWeak)) {
    return best.sector;
  }

  return sourceSector;
}

function classifyNasdaqUniverse(rows) {
  const classifiedRows = [];

  for (const row of rows) {
    const sourceSector = resolveNasdaqSourceSector(row.sector);
    const resolvedSector = resolveNasdaqCanonicalSector(row) || sourceSector;
    if (!resolvedSector) continue;

    classifiedRows.push({
      row,
      sourceSector,
      resolvedSector,
      taxonomyOverride: Boolean(sourceSector && sourceSector.profileKey !== resolvedSector.profileKey),
    });
  }

  return {
    classifiedRows,
  };
}

function buildFmpScreenerError(response) {
  const detail = typeof response.data === 'string'
    ? response.data
    : JSON.stringify(response.data);

  if (response.status === 402 && /restricted endpoint/i.test(detail)) {
    return new Error(`FMP screener restricted: ${detail}`);
  }
  if (response.status === 429 || /limit reach/i.test(detail)) {
    return new Error(`FMP screener rate limited: ${detail}`);
  }

  return new Error(`FMP screener HTTP ${response.status}: ${detail.slice(0, 200)}`);
}

function isFallbackableFmpScreenerError(error) {
  return /fmp screener restricted|fmp screener rate limited/i.test(error.message);
}

function matchesMicroSmallScreen(candidate, screen) {
  const marketCap = Number(candidate.marketCap) || 0;
  return matchesOvervaluedScreen(candidate, screen) &&
    marketCap >= screen.marketCapMin &&
    marketCap <= screen.marketCapMax;
}

function matchesNasdaqMicroSmallScreen(row, screen) {
  const marketCap = parseNumericValue(row.marketCap);
  return matchesNasdaqOvervaluedScreen(row, screen) &&
    marketCap >= screen.marketCapMin &&
    marketCap <= screen.marketCapMax;
}

function matchesOvervaluedScreen(candidate, screen) {
  const price = Number(candidate.price) || 0;
  const volume = Number(candidate.volume) || Number(candidate.avgVolume) || 0;
  const isEtf = toBoolean(candidate.isEtf);
  const isFund = toBoolean(candidate.isFund);
  const isActivelyTrading = candidate.isActivelyTrading == null ? true : toBoolean(candidate.isActivelyTrading);

  return price >= screen.priceMin &&
    volume >= screen.volumeMin &&
    !isEtf &&
    !isFund &&
    isActivelyTrading &&
    matchesCountry(candidate.country, screen.country);
}

function matchesNasdaqOvervaluedScreen(row, screen) {
  const price = parseNumericValue(row.lastsale);
  const volume = parseNumericValue(row.volume);

  return price >= screen.priceMin &&
    volume >= screen.volumeMin &&
    matchesCountry(row.country, screen.country);
}

function normalizeCandidate(candidate, screen) {
  const marketCap = Number(candidate.marketCap) || 0;
  const symbol = String(candidate.symbol || '').toUpperCase();
  return {
    symbol,
    companyName: String(candidate.companyName || candidate.name || symbol).trim(),
    marketCap,
    price: Number(candidate.price) || 0,
    volume: Number(candidate.volume) || Number(candidate.avgVolume) || 0,
    averageVolume: Number(candidate.avgVolume) || Number(candidate.volume) || 0,
    dollarVolume: (Number(candidate.price) || 0) * (Number(candidate.avgVolume) || Number(candidate.volume) || 0),
    industry: candidate.industry,
    beta: Number.isFinite(Number(candidate.beta)) ? Number(candidate.beta) : null,
    capBucket: resolveCapBucket(marketCap, screen),
    rangePercentile: null,
    country: candidate.country || null,
    exchange: candidate.exchangeShortName || candidate.exchange || null,
    isAdr: toBoolean(candidate.isAdr),
    isEtf: toBoolean(candidate.isEtf),
    isFund: toBoolean(candidate.isFund),
    isActivelyTrading: candidate.isActivelyTrading == null ? true : toBoolean(candidate.isActivelyTrading),
  };
}

function normalizeNasdaqCandidate(row, screen, metadata = {}) {
  const marketCap = parseNumericValue(row.marketCap);
  const symbol = String(row.symbol || '').toUpperCase();
  const price = parseNumericValue(row.lastsale);
  const volume = parseNumericValue(row.volume);

  return {
    symbol,
    companyName: String(row.name || symbol).trim(),
    marketCap,
    price,
    volume,
    averageVolume: volume,
    dollarVolume: price * volume,
    industry: row.industry,
    beta: null,
    capBucket: resolveCapBucket(marketCap, screen),
    rangePercentile: null,
    country: row.country || null,
    sourceSector: row.sector || null,
    taxonomySector: metadata.resolvedSector?.vaultSector || null,
    taxonomyOverride: Boolean(
      metadata.sourceSector &&
      metadata.resolvedSector &&
      metadata.sourceSector.profileKey !== metadata.resolvedSector.profileKey
    ),
    exchange: null,
    isAdr: false,
    isEtf: false,
    isFund: false,
    isActivelyTrading: true,
  };
}

function decorateSectorCandidate(candidate, sector) {
  return {
    ...candidate,
    sectorProfileKey: sector.profileKey || null,
    sectorFitThreshold: sector.fitThreshold || 45,
    sectorLens: sector.sectorLens || null,
    sectorLabel: sector.vaultSector,
  };
}

function applyBaseScore(candidate, screen) {
  const liquidityScore = scaleLogScore(candidate.dollarVolume, screen.priceMin * screen.volumeMin, 50_000_000);
  const sizeScore = scaleLogScore(candidate.marketCap, screen.marketCapMin, screen.marketCapMax);
  const priceScore = scaleLogScore(candidate.price, screen.priceMin, 20);

  return {
    ...candidate,
    baseScore: Math.round((liquidityScore * 0.5) + (sizeScore * 0.3) + (priceScore * 0.2)),
  };
}

function applyCompositeScore(candidate, screen) {
  const liquidityScore = scaleLogScore(candidate.dollarVolume, screen.priceMin * screen.volumeMin, 50_000_000);
  const sizeScore = scaleLogScore(candidate.marketCap, screen.marketCapMin, screen.marketCapMax);
  const priceScore = scaleLogScore(candidate.price, screen.priceMin, 20);
  const rangeScore = candidate.rangePercentile == null ? 50 : Math.round(candidate.rangePercentile * 100);
  const betaScore = betaQualityScore(candidate.beta);
  const phase2Score = Math.round(
    (liquidityScore * 0.35) +
    (sizeScore * 0.25) +
    (priceScore * 0.15) +
    (rangeScore * 0.15) +
    (betaScore * 0.10)
  );

  return {
    ...candidate,
    phase2Score,
    score: phase2Score,
    scoreBreakdown: {
      liquidityScore,
      sizeScore,
      priceScore,
      rangeScore,
      betaScore,
    },
  };
}

function applyQualityScore(candidate) {
  const growthScore = normalizeMetricScore(candidate.revenueGrowthYoY, -10, 30);
  const marginScore = averageScores([
    normalizeMetricScore(candidate.grossMarginPct, 10, 60),
    normalizeMetricScore(candidate.operatingMarginPct, -10, 20),
    normalizeMetricScore(candidate.profitMarginPct, -10, 15),
  ]);
  const returnScore = averageScores([
    normalizeMetricScore(candidate.returnOnAssetsPct, -5, 10),
    normalizeMetricScore(candidate.returnOnEquityPct, -10, 20),
  ]);
  const valuationScore = resolveValuationScore(candidate);
  const analystScore = normalizeMetricScore(candidate.analystUpsidePct, -10, 35);
  const phase2Score = candidate.phase2Score || candidate.score || 0;
  const qualityCoverageCount = resolveQualityCoverageCount(candidate);
  const qualityCoverageRatio = qualityCoverageCount / 5;
  const qualityScore = qualityCoverageCount > 0
    ? Math.round(
      (growthScore * 0.25) +
      (marginScore * 0.25) +
      (returnScore * 0.15) +
      (valuationScore * 0.20) +
      (analystScore * 0.15)
    )
    : null;
  const qualityWeight = 0.65 * qualityCoverageRatio;
  const rawScore = Math.round(
    (phase2Score * (1 - qualityWeight)) +
    ((qualityScore ?? phase2Score) * qualityWeight)
  );
  const score = Math.round(rawScore * (0.70 + (qualityCoverageRatio * 0.30)));
  const specialCoverageCount = resolveSpecialSituationCoverageCount(candidate);
  const specialCoverageRatio = specialCoverageCount / 4;
  const specialSituationRawScore = Math.round(
    (normalizeMetricScore(candidate.analystUpsidePct, 0, 40) * 0.35) +
    (normalizeMetricScore(candidate.revenueGrowthYoY, 0, 40) * 0.30) +
    ((candidate.rangePercentile == null ? 50 : Math.round(candidate.rangePercentile * 100)) * 0.15) +
    (valuationScore * 0.20)
  );
  const rawSpecialSituationScore = Math.round(
    (phase2Score * (1 - specialCoverageRatio)) +
    (specialSituationRawScore * specialCoverageRatio)
  );
  const specialSituationScore = Math.round(rawSpecialSituationScore * (0.70 + (specialCoverageRatio * 0.30)));
  const enrichedCandidate = {
    ...candidate,
    qualityScore,
    qualityCoverageCount,
    qualityCoverageRatio,
    score,
    specialSituationScore,
  };

  return {
    ...enrichedCandidate,
    whyNow: buildWhyNow(enrichedCandidate),
    valuationSnapshot: buildValuationSnapshot(enrichedCandidate),
    keyRisk: buildKeyRisk(enrichedCandidate),
  };
}

function applySectorProfile(candidate) {
  const sectorFitScore = resolveSectorFitScore(candidate);
  const sectorMetricProfile = resolveSectorMetricProfile(candidate);
  const sectorMetricScore = sectorMetricProfile.score;
  const sectorMetricCoverageCount = sectorMetricProfile.coverageCount;
  const sectorMetricCoverageRatio = sectorMetricProfile.coverageRatio;
  const fitWeight = 0.20;
  const metricWeight = 0.15 * sectorMetricCoverageRatio;
  const baseWeight = 1 - fitWeight - metricWeight;
  const score = Math.round(
    (candidate.score * baseWeight) +
    (sectorFitScore * fitWeight) +
    ((sectorMetricScore ?? candidate.score) * metricWeight)
  );
  const specialSituationScore = Math.round(
    (candidate.specialSituationScore * baseWeight) +
    (sectorFitScore * fitWeight) +
    ((sectorMetricScore ?? candidate.specialSituationScore) * metricWeight)
  );
  const enrichedCandidate = {
    ...candidate,
    sectorFitScore,
    sectorMetricScore,
    sectorMetricCoverageCount,
    sectorMetricCoverageRatio,
    score,
    specialSituationScore,
  };

  return {
    ...enrichedCandidate,
    whyNow: buildWhyNow(enrichedCandidate),
    valuationSnapshot: buildValuationSnapshot(enrichedCandidate),
    keyRisk: buildKeyRisk(enrichedCandidate),
  };
}

function applyCandidateExclusions(candidates) {
  const excludedCounts = {
    fundEtf: 0,
    adr: 0,
    structure: 0,
    duplicate: 0,
  };

  const directlyIncluded = [];

  for (const candidate of candidates) {
    const reasons = detectExclusionReasons(candidate);
    if (reasons.length === 0) {
      directlyIncluded.push(candidate);
      continue;
    }

    if (reasons.includes('fundEtf')) excludedCounts.fundEtf++;
    if (reasons.includes('adr')) excludedCounts.adr++;
    if (reasons.includes('structure')) excludedCounts.structure++;
  }

  const grouped = new Map();
  for (const candidate of directlyIncluded) {
    const issuerKey = buildIssuerKey(candidate.companyName);
    const key = issuerKey || `${candidate.symbol}-${candidate.companyName}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(candidate);
  }

  const included = [];

  for (const group of grouped.values()) {
    if (group.length === 1) {
      included.push(group[0]);
      continue;
    }

    const sorted = [...group].sort(compareCandidatePriority);
    included.push(sorted[0]);
    excludedCounts.duplicate += sorted.length - 1;
  }

  return { included, excludedCounts };
}

function detectExclusionReasons(candidate) {
  const text = `${candidate.companyName || ''} ${candidate.industry || ''}`;
  const reasons = [];

  if (candidate.isFund || candidate.isEtf || /\b(closed-end fund|fund inc|income fund|exchange traded fund)\b/i.test(text)) {
    reasons.push('fundEtf');
  }
  if (candidate.isAdr || /\b(american depositary|depositary share|adr|ads)\b/i.test(text)) {
    reasons.push('adr');
  }
  if (/\b(l\.?\s*p\.?|limited partnership|common units?|units representing|partnership interests|royalty trust|beneficial interest)\b/i.test(text)) {
    reasons.push('structure');
  }

  return reasons;
}

function buildIssuerKey(companyName) {
  return String(companyName || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b(class|series)\s+[a-z0-9-]+\b/g, ' ')
    .replace(/\b(common stock|common shares?|ordinary shares?|depositary shares?|american depositary shares?|ads|adr)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

function compareCandidatePriority(left, right) {
  const scoreDiff = (right.score ?? right.baseScore ?? 0) - (left.score ?? left.baseScore ?? 0);
  if (scoreDiff !== 0) return scoreDiff;

  const shareClassDiff = shareClassRank(left.companyName) - shareClassRank(right.companyName);
  if (shareClassDiff !== 0) return shareClassDiff;

  const liquidityDiff = (right.dollarVolume || 0) - (left.dollarVolume || 0);
  if (liquidityDiff !== 0) return liquidityDiff;

  return (right.marketCap || 0) - (left.marketCap || 0);
}

function shareClassRank(companyName) {
  const text = String(companyName || '').toLowerCase();
  if (/\bclass a\b/.test(text)) return 1;
  if (/\bclass b\b/.test(text)) return 3;
  if (/\bclass c\b/.test(text)) return 4;
  if (/\bclass d\b/.test(text)) return 5;
  return 0;
}

function selectBalancedCandidates(candidates, limit) {
  if (candidates.length <= limit) return candidates;

  const micro = candidates.filter(candidate => candidate.capBucket === 'Micro');
  const small = candidates.filter(candidate => candidate.capBucket === 'Small');

  if (micro.length === 0 || small.length === 0) {
    return candidates.slice(0, limit);
  }

  const microTarget = Math.min(Math.floor(limit / 2), micro.length);
  const smallTarget = Math.min(limit - microTarget, small.length);
  const selected = [
    ...small.slice(0, smallTarget),
    ...micro.slice(0, microTarget),
  ];

  if (selected.length < limit) {
    const remainder = [
      ...small.slice(smallTarget),
      ...micro.slice(microTarget),
    ];
    selected.push(...remainder.slice(0, limit - selected.length));
  }

  return selected;
}

function buildResearchPickSet(candidates, limit) {
  const targets = resolveResearchPickTargets(candidates, limit);
  const fitThreshold = candidates[0]?.sectorFitThreshold || 45;
  const primaryPool = candidates.filter(candidate => (candidate.sectorFitScore ?? 50) >= fitThreshold);
  const small = primaryPool
    .filter(candidate => candidate.capBucket === 'Small')
    .slice(0, targets.small)
    .map(candidate => ({ ...candidate, researchTier: 'small' }));
  const micro = primaryPool
    .filter(candidate => candidate.capBucket === 'Micro')
    .slice(0, targets.micro)
    .map(candidate => ({ ...candidate, researchTier: 'micro' }));

  const usedSymbols = new Set([...small, ...micro].map(candidate => candidate.symbol));
  const specialPool = primaryPool.filter(candidate => !usedSymbols.has(candidate.symbol));
  const special = targets.special > 0 && specialPool.length > 0
    ? [{ ...specialPool.slice().sort(sortBySpecialSituation)[0], researchTier: 'special' }]
    : [];

  const allSelected = [...small, ...micro, ...special];
  const reserve = candidates
    .filter(candidate => !special.some(pick => pick.symbol === candidate.symbol))
    .filter(candidate => !usedSymbols.has(candidate.symbol))
    .slice(0, Math.max(0, limit - allSelected.length))
    .map(candidate => ({ ...candidate, researchTier: 'reserve' }));
  allSelected.push(...reserve);

  return {
    small,
    micro,
    special,
    reserve,
    allSelected,
  };
}

function resolveResearchPickTargets(candidates, limit) {
  const safeLimit = Math.max(1, limit);
  const smallCount = candidates.filter(candidate => candidate.capBucket === 'Small').length;
  const microCount = candidates.filter(candidate => candidate.capBucket === 'Micro').length;
  const special = safeLimit >= 5 ? 1 : 0;
  const coreSlots = Math.max(0, safeLimit - special);

  let small = Math.min(3, smallCount, Math.ceil(coreSlots / 2));
  let micro = Math.min(3, microCount, coreSlots - small);

  while ((small + micro) < coreSlots) {
    if (small < Math.min(3, smallCount) && (small <= micro || micro >= Math.min(3, microCount))) {
      small++;
      continue;
    }
    if (micro < Math.min(3, microCount)) {
      micro++;
      continue;
    }
    break;
  }

  if ((small + micro + special) > safeLimit && special > 0) {
    if (micro >= small && micro > 0) micro--;
    else if (small > 0) small--;
  }

  return { small, micro, special };
}

function resolveSectorFitScore(candidate) {
  const profile = SECTOR_PROFILE_CONFIG[candidate.sectorProfileKey];
  const haystack = `${candidate.industry || ''} ${candidate.companyName || ''}`.toLowerCase();
  if (!profile || !haystack.trim()) return 50;

  let score = profile.strict ? 35 : 50;
  let allowHits = 0;
  let blockHits = 0;

  for (const keyword of profile.allow) {
    if (haystack.includes(keyword)) {
      allowHits++;
      score += profile.strict ? 18 : 12;
    }
  }

  for (const keyword of profile.block) {
    if (haystack.includes(keyword)) {
      blockHits++;
      score -= profile.strict ? 18 : 12;
    }
  }

  if (profile.strict && allowHits === 0) score -= 15;
  if (blockHits > 0 && allowHits === 0) score -= 15;

  return clamp(score, 0, 100);
}

function resolveSectorMetricProfile(candidate) {
  const valuationScore = resolveSectorValuationScore(candidate);
  const rangeScore = candidate.rangePercentile == null ? null : Math.round(candidate.rangePercentile * 100);

  switch (candidate.sectorProfileKey) {
    case 'technology':
      return weightedAverageScores([
        [metricScore(candidate.revenueGrowthYoY, 0, 35), 0.28],
        [metricScore(candidate.grossMarginPct, 25, 80), 0.25],
        [metricScore(candidate.operatingMarginPct, -5, 25), 0.17],
        [valuationScore, 0.15],
        [metricScore(candidate.analystUpsidePct, 0, 40), 0.15],
      ]);
    case 'healthcare':
      return weightedAverageScores([
        [metricScore(candidate.analystUpsidePct, 0, 60), 0.30],
        [metricScore(candidate.revenueGrowthYoY, 0, 30), 0.20],
        [rangeScore, 0.20],
        [valuationScore, 0.15],
        [metricScore(candidate.operatingMarginPct, -20, 20), 0.15],
      ]);
    case 'financials':
      return weightedAverageScores([
        [metricScore(candidate.returnOnEquityPct, 0, 18), 0.30],
        [metricScore(candidate.returnOnAssetsPct, 0, 2), 0.20],
        [metricScore(candidate.profitMarginPct, 0, 25), 0.15],
        [valuationScore, 0.25],
        [metricScore(candidate.analystUpsidePct, 0, 25), 0.10],
      ]);
    case 'consumerDiscretionary':
      return weightedAverageScores([
        [metricScore(candidate.revenueGrowthYoY, -5, 20), 0.20],
        [metricScore(candidate.operatingMarginPct, -5, 15), 0.25],
        [metricScore(candidate.profitMarginPct, -5, 12), 0.15],
        [valuationScore, 0.25],
        [metricScore(candidate.analystUpsidePct, 0, 25), 0.15],
      ]);
    case 'consumerStaples':
      return weightedAverageScores([
        [metricScore(candidate.grossMarginPct, 20, 60), 0.20],
        [metricScore(candidate.operatingMarginPct, 0, 18), 0.25],
        [metricScore(candidate.returnOnAssetsPct, 0, 10), 0.15],
        [valuationScore, 0.25],
        [metricScore(candidate.analystUpsidePct, 0, 20), 0.15],
      ]);
    case 'industrials':
      return weightedAverageScores([
        [metricScore(candidate.revenueGrowthYoY, -5, 20), 0.20],
        [metricScore(candidate.operatingMarginPct, -5, 18), 0.25],
        [metricScore(candidate.profitMarginPct, -5, 12), 0.15],
        [valuationScore, 0.20],
        [metricScore(candidate.analystUpsidePct, 0, 25), 0.20],
      ]);
    case 'materials':
      return weightedAverageScores([
        [metricScore(candidate.revenueGrowthYoY, -10, 20), 0.15],
        [metricScore(candidate.operatingMarginPct, -5, 20), 0.20],
        [metricScore(candidate.profitMarginPct, -10, 15), 0.20],
        [valuationScore, 0.25],
        [metricScore(candidate.analystUpsidePct, 0, 25), 0.20],
      ]);
    case 'communicationServices':
      return weightedAverageScores([
        [metricScore(candidate.revenueGrowthYoY, 0, 25), 0.20],
        [metricScore(candidate.operatingMarginPct, -5, 25), 0.25],
        [metricScore(candidate.grossMarginPct, 20, 70), 0.15],
        [valuationScore, 0.20],
        [metricScore(candidate.analystUpsidePct, 0, 35), 0.20],
      ]);
    case 'energy':
      return weightedAverageScores([
        [metricScore(candidate.profitMarginPct, -10, 20), 0.20],
        [metricScore(candidate.operatingMarginPct, -10, 20), 0.20],
        [valuationScore, 0.30],
        [metricScore(candidate.analystUpsidePct, 0, 30), 0.15],
        [metricScore(candidate.revenueGrowthYoY, -15, 20), 0.15],
      ]);
    case 'utilities':
      return weightedAverageScores([
        [inverseScore(candidate.beta, 0.6, 1.8), 0.25],
        [metricScore(candidate.profitMarginPct, -5, 20), 0.20],
        [metricScore(candidate.returnOnAssetsPct, -2, 8), 0.15],
        [valuationScore, 0.25],
        [metricScore(candidate.analystUpsidePct, 0, 20), 0.15],
      ]);
    case 'realEstate':
      return weightedAverageScores([
        [valuationScore, 0.30],
        [metricScore(candidate.returnOnAssetsPct, -2, 5), 0.15],
        [metricScore(candidate.profitMarginPct, -5, 25), 0.20],
        [metricScore(candidate.analystUpsidePct, 0, 25), 0.20],
        [inverseScore(candidate.beta, 0.7, 1.8), 0.15],
      ]);
    default:
      return { score: null, coverageCount: 0, coverageRatio: 0 };
  }
}

function resolveSectorValuationScore(candidate) {
  switch (candidate.sectorProfileKey) {
    case 'technology':
    case 'communicationServices':
    case 'healthcare':
      return firstFinite([
        inverseScore(candidate.priceToSalesRatio, 2, 12),
        inverseScore(candidate.evToRevenue, 2, 12),
        inverseScore(candidate.forwardPE, 12, 40),
        inverseScore(candidate.trailingPE, 12, 40),
        inverseScore(candidate.priceToBookRatio, 2, 8),
      ]);
    case 'financials':
    case 'utilities':
    case 'realEstate':
      return firstFinite([
        inverseScore(candidate.priceToBookRatio, 0.8, 2.5),
        inverseScore(candidate.forwardPE, 8, 20),
        inverseScore(candidate.trailingPE, 8, 20),
        inverseScore(candidate.priceToSalesRatio, 1, 8),
      ]);
    default:
      return firstFinite([
        inverseScore(candidate.forwardPE, 8, 25),
        inverseScore(candidate.trailingPE, 8, 25),
        inverseScore(candidate.evToRevenue, 1, 8),
        inverseScore(candidate.priceToSalesRatio, 1, 6),
        inverseScore(candidate.priceToBookRatio, 1, 5),
      ]);
  }
}

function applyPotentialOvervaluation(candidate) {
  const earningsMultiple = resolvePreferredEarningsMultiple(candidate);
  const sectorCeiling = resolveSectorEarningsMultipleCeiling(candidate);

  if (!earningsMultiple || sectorCeiling == null || sectorCeiling <= 0) {
    return {
      ...candidate,
      earningsMultipleLabel: null,
      earningsStretchRatio: null,
      earningsStretchText: null,
      overvaluationScore: null,
      overvaluationReason: null,
      isPotentiallyOvervalued: false,
    };
  }

  const stretchRatio = earningsMultiple.value / sectorCeiling;
  const stretchScore = normalizeMetricScore(stretchRatio, 1, 1.75);
  const supportPenalty = averageScores([
    inverseMetricScore(candidate.revenueGrowthYoY, 10, 30),
    inverseMetricScore(candidate.qualityScore, 50, 80),
    inverseMetricScore(candidate.analystUpsidePct, 0, 25),
  ]);
  const overvaluationScore = Math.round((stretchScore * 0.8) + (supportPenalty * 0.2));
  const isPotentiallyOvervalued = stretchRatio >= 1.25 || (stretchRatio >= 1.1 && overvaluationScore >= 45);

  return {
    ...candidate,
    earningsMultipleLabel: formatEarningsMultiple(earningsMultiple),
    earningsStretchRatio: stretchRatio,
    earningsStretchText: `${stretchRatio.toFixed(1)}x sector ceiling`,
    overvaluationScore,
    overvaluationReason: isPotentiallyOvervalued
      ? buildPotentialOvervaluationReason(candidate, earningsMultiple, sectorCeiling)
      : null,
    isPotentiallyOvervalued,
  };
}

function selectPotentiallyOvervaluedCandidates(resultsBySector) {
  return resultsBySector
    .flatMap(sector => (sector.overvaluedCandidates || []).map(candidate => ({
      ...candidate,
      sectorLink: sector.vaultLink,
    })))
    .filter(candidate => candidate.isPotentiallyOvervalued)
    .sort(sortByPotentialOvervaluation)
    .slice(0, OVERVALUED_SHORTLIST_LIMIT);
}

function sortByPotentialOvervaluation(left, right) {
  const scoreDiff = (right.overvaluationScore || 0) - (left.overvaluationScore || 0);
  if (scoreDiff !== 0) return scoreDiff;

  const stretchDiff = (right.earningsStretchRatio || 0) - (left.earningsStretchRatio || 0);
  if (stretchDiff !== 0) return stretchDiff;

  const multipleDiff = (resolvePreferredEarningsMultiple(right)?.value || 0) - (resolvePreferredEarningsMultiple(left)?.value || 0);
  if (multipleDiff !== 0) return multipleDiff;

  return sortByScoreThenLiquidity(left, right);
}

function sortByBaseScoreThenLiquidity(left, right) {
  const scoreDiff = (right.baseScore || 0) - (left.baseScore || 0);
  if (scoreDiff !== 0) return scoreDiff;
  return sortByMarketCapThenVolume(left, right);
}

function sortByScoreThenLiquidity(left, right) {
  const scoreDiff = (right.score || 0) - (left.score || 0);
  if (scoreDiff !== 0) return scoreDiff;

  const fitDiff = (right.sectorFitScore || 0) - (left.sectorFitScore || 0);
  if (fitDiff !== 0) return fitDiff;

  const coverageDiff = (right.qualityCoverageCount || 0) - (left.qualityCoverageCount || 0);
  if (coverageDiff !== 0) return coverageDiff;

  const liquidityDiff = (right.dollarVolume || 0) - (left.dollarVolume || 0);
  if (liquidityDiff !== 0) return liquidityDiff;

  return sortByMarketCapThenVolume(left, right);
}

function sortBySpecialSituation(left, right) {
  const scoreDiff = (right.specialSituationScore || 0) - (left.specialSituationScore || 0);
  if (scoreDiff !== 0) return scoreDiff;
  const fitDiff = (right.sectorFitScore || 0) - (left.sectorFitScore || 0);
  if (fitDiff !== 0) return fitDiff;
  const coverageDiff = (right.qualityCoverageCount || 0) - (left.qualityCoverageCount || 0);
  if (coverageDiff !== 0) return coverageDiff;
  return sortByScoreThenLiquidity(left, right);
}

function sortByMarketCapThenVolume(left, right) {
  const marketCapDiff = (Number(right.marketCap) || 0) - (Number(left.marketCap) || 0);
  if (marketCapDiff !== 0) return marketCapDiff;
  return (Number(right.averageVolume) || Number(right.volume) || Number(right.avgVolume) || 0) - (Number(left.averageVolume) || Number(left.volume) || Number(left.avgVolume) || 0);
}

function parseNumberFlag(value, fallback, label) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid ${label}: "${value}"`);
  }
  return parsed;
}

function parseIntegerFlag(value, fallback, label) {
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${label}: "${value}"`);
  }
  return parsed;
}

function parseSymbolList(value) {
  return [...new Set(
    String(value || '')
      .split(',')
      .map(item => item.trim().toUpperCase())
      .filter(Boolean)
  )];
}

function getFmpSymbolCandidates(symbol) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) return [];

  const variants = [normalized];
  if (normalized.includes('_')) {
    variants.push(normalized.replace(/_/g, '.'));
    variants.push(normalized.replace(/_/g, '-'));
  }
  if (normalized.includes('.')) {
    variants.push(normalized.replace(/\./g, '_'));
    variants.push(normalized.replace(/\./g, '-'));
  }
  if (normalized.includes('-')) {
    variants.push(normalized.replace(/-/g, '_'));
    variants.push(normalized.replace(/-/g, '.'));
  }

  return [...new Set(variants.filter(Boolean))];
}

function buildFmpSymbolAliasMap(symbols) {
  const aliasMap = new Map();

  for (const symbol of symbols) {
    const canonical = normalizeSymbol(symbol);
    if (!canonical) continue;

    for (const candidate of getFmpSymbolCandidates(canonical)) {
      aliasMap.set(candidate, canonical);
      const normalizedCandidate = canonicalizeRequestedSymbol(candidate);
      if (normalizedCandidate) {
        aliasMap.set(normalizedCandidate, canonical);
      }
    }
  }

  return aliasMap;
}

function canonicalizeRequestedSymbol(symbol) {
  const normalized = normalizeSymbol(symbol);
  return normalized ? normalized.replace(/[.-]/g, '_') : null;
}

function resolveRequestedSymbol(symbol, aliasMap) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) return null;
  return aliasMap.get(normalized) || aliasMap.get(canonicalizeRequestedSymbol(normalized)) || null;
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return Boolean(value);
}

function parseNumericValue(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;

  const cleaned = value.replace(/[^0-9.-]+/g, '');
  if (!cleaned) return 0;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseMetricNumber(value) {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const raw = String(value).trim();
  if (!raw || /^none$/i.test(raw) || /^null$/i.test(raw) || raw === '-') return null;
  const parsed = Number(raw.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeRatioPercent(value) {
  const parsed = parseMetricNumber(value);
  if (parsed == null) return null;
  return Math.abs(parsed) <= 1 ? parsed * 100 : parsed;
}

function parseRangePercentile(range, price) {
  if (!range || !Number.isFinite(price)) return null;

  const [lowRaw, highRaw] = String(range).split('-');
  const low = Number(lowRaw);
  const high = Number(highRaw);

  if (!Number.isFinite(low) || !Number.isFinite(high) || high <= low) {
    return null;
  }

  return clamp((price - low) / (high - low), 0, 1);
}

function formatDollar(value) {
  return Number.isFinite(Number(value)) ? `$${Number(value).toFixed(2)}` : 'N/A';
}

function formatSignedDollar(value) {
  return Number.isFinite(Number(value))
    ? `${Number(value) >= 0 ? '+' : ''}$${Math.abs(Number(value)).toFixed(2)}`
    : 'N/A';
}

function formatPercent(value) {
  return Number.isFinite(Number(value)) ? `${Number(value).toFixed(2)}%` : 'N/A';
}

function formatDecimal(value, decimals = 2) {
  return Number.isFinite(Number(value)) ? Number(value).toFixed(decimals) : 'N/A';
}

function formatMetricNumber(value, decimals = 2) {
  return Number.isFinite(Number(value)) ? Number(value).toFixed(decimals) : 'N/A';
}

function formatCompactCurrency(value) {
  return Number.isFinite(Number(value))
    ? formatNumber(Number(value), { style: 'currency' })
    : 'N/A';
}

function resolveCapBucket(marketCap, screen) {
  if (!Number.isFinite(marketCap) || marketCap <= 0) return 'Unknown';
  if (marketCap < screen.microCapMax) return 'Micro';
  if (marketCap <= screen.marketCapMax) return 'Small';
  if (marketCap <= 10_000_000_000) return 'Mid';
  if (marketCap <= 200_000_000_000) return 'Large';
  return 'Mega';
}

function betaQualityScore(beta) {
  if (beta == null || !Number.isFinite(beta)) return 50;
  if (beta <= 0) return 35;
  return Math.round(clamp(100 - (Math.abs(beta - 1.25) * 35), 0, 100));
}

function scaleLogScore(value, min, max) {
  if (!Number.isFinite(value) || value <= 0 || min <= 0 || max <= min) return 0;
  const logValue = Math.log10(value);
  const logMin = Math.log10(min);
  const logMax = Math.log10(max);
  return Math.round(clamp(((logValue - logMin) / (logMax - logMin)) * 100, 0, 100));
}

function normalizeMetricScore(value, low, high) {
  if (value == null || !Number.isFinite(value)) return 50;
  return Math.round(clamp(((value - low) / (high - low)) * 100, 0, 100));
}

function inverseMetricScore(value, low, high) {
  if (value == null || !Number.isFinite(value) || value <= 0) return 50;
  return Math.round(clamp(((high - value) / (high - low)) * 100, 0, 100));
}

function averageScores(values) {
  const filtered = values.filter(value => Number.isFinite(value));
  if (filtered.length === 0) return 50;
  return Math.round(filtered.reduce((sum, value) => sum + value, 0) / filtered.length);
}

function weightedAverageScores(entries) {
  const filtered = entries.filter(([score, weight]) => Number.isFinite(score) && Number.isFinite(weight) && weight > 0);
  if (filtered.length === 0) {
    return { score: null, coverageCount: 0, coverageRatio: 0 };
  }
  const totalWeight = filtered.reduce((sum, [, weight]) => sum + weight, 0);
  const weightedScore = filtered.reduce((sum, [score, weight]) => sum + (score * weight), 0) / totalWeight;
  return {
    score: Math.round(weightedScore),
    coverageCount: filtered.length,
    coverageRatio: filtered.length / entries.length,
  };
}

function metricScore(value, low, high) {
  return hasMetric(value) ? normalizeMetricScore(value, low, high) : null;
}

function inverseScore(value, low, high) {
  return hasMetric(value) ? inverseMetricScore(value, low, high) : null;
}

function firstFinite(values) {
  for (const value of values) {
    if (Number.isFinite(value)) return value;
  }
  return null;
}

function hasMetric(value) {
  return value != null && Number.isFinite(value);
}

function resolveQualityCoverageCount(candidate) {
  let count = 0;
  if (hasMetric(candidate.revenueGrowthYoY)) count++;
  if (hasMetric(candidate.grossMarginPct) || hasMetric(candidate.operatingMarginPct) || hasMetric(candidate.profitMarginPct)) count++;
  if (hasMetric(candidate.returnOnAssetsPct) || hasMetric(candidate.returnOnEquityPct)) count++;
  if (
    hasMetric(candidate.forwardPE) ||
    hasMetric(candidate.trailingPE) ||
    hasMetric(candidate.priceToSalesRatio) ||
    hasMetric(candidate.evToRevenue) ||
    hasMetric(candidate.priceToBookRatio)
  ) count++;
  if (hasMetric(candidate.analystUpsidePct)) count++;
  return count;
}

function resolveSpecialSituationCoverageCount(candidate) {
  let count = 0;
  if (hasMetric(candidate.analystUpsidePct)) count++;
  if (hasMetric(candidate.revenueGrowthYoY)) count++;
  if (hasMetric(candidate.rangePercentile)) count++;
  if (
    hasMetric(candidate.forwardPE) ||
    hasMetric(candidate.trailingPE) ||
    hasMetric(candidate.priceToSalesRatio) ||
    hasMetric(candidate.evToRevenue) ||
    hasMetric(candidate.priceToBookRatio)
  ) count++;
  return count;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function matchesCountry(value, requestedCountry) {
  const normalizedValue = normalizeCountry(value);
  const normalizedRequested = normalizeCountry(requestedCountry);

  if (!normalizedValue) return true;
  if (normalizedValue === normalizedRequested) return true;

  const aliases = {
    US: ['UNITEDSTATES', 'UNITEDSTATESOFAMERICA', 'USA', 'US'],
  };

  return (aliases[normalizedRequested] || []).includes(normalizedValue);
}

function normalizeCountry(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

async function fetchFmpFundamentalsBundle(symbol, fmpContext) {
  if (!symbol || !fmpContext?.apiKey || !fmpContext?.stableBaseUrl) return null;

  const [profile, ratiosTtm, keyMetricsTtm, priceTargetSummary] = await Promise.all([
    fetchFmpProfileCached(symbol, fmpContext.apiKey, fmpContext.stableBaseUrl),
    fetchFmpRatiosTtmCached(symbol, fmpContext.apiKey, fmpContext.stableBaseUrl),
    fetchFmpKeyMetricsTtmCached(symbol, fmpContext.apiKey, fmpContext.stableBaseUrl),
    fetchFmpPriceTargetSummaryCached(symbol, fmpContext.apiKey, fmpContext.stableBaseUrl),
  ]);

  return {
    profile,
    ratiosTtm,
    keyMetricsTtm,
    priceTargetSummary,
  };
}

async function fetchFmpProfileCached(symbol, apiKey, stableBaseUrl) {
  return fetchFmpStableFirstCached(symbol, apiKey, stableBaseUrl, {
    endpoint: 'profile',
    cacheDir: FMP_PROFILE_CACHE_DIR,
  });
}

async function fetchFmpRatiosTtmCached(symbol, apiKey, stableBaseUrl) {
  return fetchFmpStableFirstCached(symbol, apiKey, stableBaseUrl, {
    endpoint: 'ratios-ttm',
    cacheDir: FMP_RATIOS_TTM_CACHE_DIR,
  });
}

async function fetchFmpKeyMetricsTtmCached(symbol, apiKey, stableBaseUrl) {
  return fetchFmpStableFirstCached(symbol, apiKey, stableBaseUrl, {
    endpoint: 'key-metrics-ttm',
    cacheDir: FMP_KEY_METRICS_TTM_CACHE_DIR,
  });
}

async function fetchFmpPriceTargetSummaryCached(symbol, apiKey, stableBaseUrl) {
  return fetchFmpStableFirstCached(symbol, apiKey, stableBaseUrl, {
    endpoint: 'price-target-summary',
    cacheDir: FMP_PRICE_TARGET_CACHE_DIR,
  });
}

async function fetchFmpStableFirstCached(symbol, apiKey, stableBaseUrl, options) {
  if (!symbol || !apiKey || !stableBaseUrl) return null;
  const requestSymbol = normalizeSymbol(symbol);
  const cacheCandidates = getFmpSymbolCandidates(requestSymbol);

  for (const candidate of cacheCandidates) {
    const cached = readJsonCache(join(options.cacheDir, `${candidate}.json`), FMP_FUNDAMENTALS_CACHE_TTL_MS);
    if (cached) return cached;
  }

  for (const candidate of cacheCandidates) {
    try {
      const data = await getJson(`${stableBaseUrl}/${options.endpoint}?symbol=${candidate}&apikey=${apiKey}`);
      const payload = Array.isArray(data) ? data[0] : data;
      if (!payload || (typeof payload === 'object' && Object.keys(payload).length === 0)) {
        continue;
      }
      writeJsonCache(join(options.cacheDir, `${requestSymbol}.json`), payload);
      if (candidate !== requestSymbol) {
        writeJsonCache(join(options.cacheDir, `${candidate}.json`), payload);
      }
      return payload;
    } catch {
      continue;
    }
  }

  return null;
}

async function fetchFmpPriceSeries(symbol, interval, apiKey, stableBaseUrl) {
  const normalizedInterval = String(interval || 'daily').toLowerCase();
  const supportedIntervals = new Set(['daily', '1min']);
  if (!supportedIntervals.has(normalizedInterval)) {
    throw new Error(`Unsupported --interval "${interval}". Supported values: daily, 1min`);
  }

  const endpoint = normalizedInterval === 'daily'
    ? 'historical-price-eod/full'
    : `historical-chart/${normalizedInterval}`;
  const data = await getJson(`${stableBaseUrl}/${endpoint}?symbol=${symbol}&apikey=${apiKey}`);
  const rows = Array.isArray(data) ? data : [];
  if (rows.length === 0) {
    throw new Error(`No price history returned for ${symbol} (${normalizedInterval}).`);
  }

  return rows
    .map(entry => ({
      date: entry.date || null,
      open: parseMetricNumber(entry.open),
      high: parseMetricNumber(entry.high),
      low: parseMetricNumber(entry.low),
      close: parseMetricNumber(entry.close),
      volume: parseMetricNumber(entry.volume),
    }))
    .filter(entry => entry.date && hasMetric(entry.close))
    .sort((left, right) => String(left.date).localeCompare(String(right.date)));
}

async function fetchFmpPriceSeriesResolved(symbol, interval, apiKey, stableBaseUrl) {
  const candidates = getFmpSymbolCandidates(symbol);
  let lastError = null;

  for (const candidate of candidates) {
    try {
      const series = await fetchFmpPriceSeries(candidate, interval, apiKey, stableBaseUrl);
      return { apiSymbol: candidate, series };
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('No price history returned')) {
        throw error;
      }
    }
  }

  if (lastError) throw lastError;
  throw new Error(`No price history returned for ${symbol} (${interval}).`);
}

async function fetchSecCompanyFactsCached(symbol) {
  if (!symbol) return null;

  const tickerMap = await fetchSecTickerMapCached();
  const tickerEntry = tickerMap?.get(String(symbol).toUpperCase());
  if (!tickerEntry?.cik) return null;

  const cachePath = join(SEC_COMPANY_FACTS_CACHE_DIR, `${symbol}.json`);
  const cached = readJsonCache(cachePath, SEC_CACHE_TTL_MS);
  if (cached) return cached;

  const sinceLast = Date.now() - secLastRequestAt;
  if (sinceLast < SEC_MIN_INTERVAL_MS) {
    await sleep(SEC_MIN_INTERVAL_MS - sinceLast);
  }
  secLastRequestAt = Date.now();

  const cik = String(tickerEntry.cik).padStart(10, '0');
  const response = await fetch(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`, {
    headers: {
      'User-Agent': 'MyData-Vault/1.0 analyst@local.dev',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    return null;
  }

  const text = await response.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  if (!data?.facts) return null;

  writeJsonCache(cachePath, data);
  return data;
}

async function fetchSecTickerMapCached() {
  const cached = readJsonCache(SEC_TICKER_MAP_CACHE_PATH, SEC_CACHE_TTL_MS);
  if (cached) {
    return new Map(Object.entries(cached));
  }

  const sinceLast = Date.now() - secLastRequestAt;
  if (sinceLast < SEC_MIN_INTERVAL_MS) {
    await sleep(SEC_MIN_INTERVAL_MS - sinceLast);
  }
  secLastRequestAt = Date.now();

  const response = await fetch('https://www.sec.gov/files/company_tickers.json', {
    headers: {
      'User-Agent': 'MyData-Vault/1.0 analyst@local.dev',
      Accept: 'application/json',
    },
  });
  if (!response.ok) return new Map();

  const data = await response.json();
  const mapped = Object.fromEntries(
    Object.values(data || {}).map(entry => [
      String(entry.ticker || '').toUpperCase(),
      {
        cik: String(entry.cik_str || '').padStart(10, '0'),
        title: entry.title || null,
      },
    ]).filter(([ticker]) => ticker)
  );

  writeJsonCache(SEC_TICKER_MAP_CACHE_PATH, mapped);
  return new Map(Object.entries(mapped));
}

function mergeFmpFundamentals(candidate, bundle) {
  const profile = bundle?.profile;
  const ratios = bundle?.ratiosTtm;
  const metrics = bundle?.keyMetricsTtm;
  const priceTargetSummary = bundle?.priceTargetSummary;

  if (!profile?.symbol && !ratios?.symbol && !metrics?.symbol && !priceTargetSummary?.symbol) {
    return {
      ...candidate,
      hasOverview: false,
      hasFundamentals: candidate.hasFundamentals || false,
      fundamentalsSource: candidate.fundamentalsSource || null,
      qualityScore: null,
      whyNow: 'fundamentals unavailable',
      valuationSnapshot: 'No clean multiple',
      keyRisk: 'fundamentals unavailable',
    };
  }

  const analystTargetPrice = firstFinite([
    parseMetricNumber(priceTargetSummary?.lastMonthAvgPriceTarget),
    parseMetricNumber(priceTargetSummary?.lastQuarterAvgPriceTarget),
    parseMetricNumber(priceTargetSummary?.lastYearAvgPriceTarget),
    parseMetricNumber(priceTargetSummary?.allTimeAvgPriceTarget),
  ]);
  const analystUpsidePct = analystTargetPrice && candidate.price > 0
    ? ((analystTargetPrice - candidate.price) / candidate.price) * 100
    : null;
  const rangePercentile = profile?.range
    ? parseRangePercentile(profile.range, candidate.price)
    : candidate.rangePercentile;

  return {
    ...candidate,
    hasOverview: Boolean(profile),
    hasFundamentals: true,
    fundamentalsSource: candidate.fundamentalsSource
      ? `${candidate.fundamentalsSource}+fmp`
      : 'fmp',
    companyName: profile?.companyName || candidate.companyName,
    marketCap: parseMetricNumber(profile?.marketCap) || parseMetricNumber(metrics?.marketCap) || candidate.marketCap,
    beta: parseMetricNumber(profile?.beta) ?? candidate.beta,
    rangePercentile,
    sectorFromOverview: profile?.sector || null,
    industry: normalizeIndustry(profile?.industry) || candidate.industry,
    description: profile?.description || null,
    revenueGrowthYoY: candidate.revenueGrowthYoY,
    earningsGrowthYoY: candidate.earningsGrowthYoY,
    profitMarginPct: normalizeRatioPercent(ratios?.netProfitMarginTTM) ?? candidate.profitMarginPct,
    operatingMarginPct: normalizeRatioPercent(ratios?.operatingProfitMarginTTM) ?? candidate.operatingMarginPct,
    returnOnAssetsPct: normalizeRatioPercent(metrics?.returnOnAssetsTTM) ?? candidate.returnOnAssetsPct,
    returnOnEquityPct: normalizeRatioPercent(metrics?.returnOnEquityTTM) ?? candidate.returnOnEquityPct,
    grossMarginPct: normalizeRatioPercent(ratios?.grossProfitMarginTTM) ?? candidate.grossMarginPct,
    revenueTTM: candidate.revenueTTM,
    ebitda: candidate.ebitda,
    forwardPE: candidate.forwardPE,
    trailingPE: parseMetricNumber(ratios?.priceToEarningsRatioTTM) ?? candidate.trailingPE,
    priceToSalesRatio: parseMetricNumber(ratios?.priceToSalesRatioTTM) ?? candidate.priceToSalesRatio,
    priceToBookRatio: parseMetricNumber(ratios?.priceToBookRatioTTM) ?? candidate.priceToBookRatio,
    evToRevenue: parseMetricNumber(metrics?.evToSalesTTM) ?? candidate.evToRevenue,
    evToEbitda: parseMetricNumber(metrics?.evToEBITDATTM) ?? candidate.evToEbitda,
    analystTargetPrice,
    analystUpsidePct,
    movingAverage50: candidate.movingAverage50,
    movingAverage200: candidate.movingAverage200,
    percentInsiders: candidate.percentInsiders,
    percentInstitutions: candidate.percentInstitutions,
  };
}

function mergeSecCompanyFacts(candidate, secFacts) {
  if (!secFacts?.facts) {
    return candidate;
  }

  const annualRevenue = pickLatestAnnualFactValue(secFacts, 'us-gaap', [
    'Revenues',
    'RevenueFromContractWithCustomerExcludingAssessedTax',
    'SalesRevenueNet',
    'SalesRevenueServicesNet',
    'RevenueFromContractWithCustomerIncludingAssessedTax',
    'InterestAndDividendIncomeOperating',
    'InvestmentBankingRevenue',
    'InvestmentAdvisoryAdministrationAndServiceFees',
    'RealEstateRevenueNet',
  ]);
  const priorAnnualRevenue = pickPriorAnnualFactValue(secFacts, 'us-gaap', [
    'Revenues',
    'RevenueFromContractWithCustomerExcludingAssessedTax',
    'SalesRevenueNet',
    'SalesRevenueServicesNet',
    'RevenueFromContractWithCustomerIncludingAssessedTax',
    'InterestAndDividendIncomeOperating',
    'InvestmentBankingRevenue',
    'InvestmentAdvisoryAdministrationAndServiceFees',
    'RealEstateRevenueNet',
  ]);
  const grossProfit = pickLatestAnnualFactValue(secFacts, 'us-gaap', ['GrossProfit']);
  const operatingIncome = pickLatestAnnualFactValue(secFacts, 'us-gaap', ['OperatingIncomeLoss']);
  const netIncome = pickLatestAnnualFactValue(secFacts, 'us-gaap', ['NetIncomeLoss', 'ProfitLoss']);
  const assets = pickLatestInstantFactValue(secFacts, 'us-gaap', ['Assets']);
  const equity = pickLatestInstantFactValue(secFacts, 'us-gaap', [
    'StockholdersEquity',
    'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest',
    'PartnersCapitalIncludingPortionAttributableToNoncontrollingInterest',
  ]);
  const sharesOutstanding = pickLatestInstantFactValue(secFacts, 'dei', [
    'EntityCommonStockSharesOutstanding',
    'EntityPublicFloat',
  ], ['shares']);
  const revenueGrowthYoY = annualRevenue != null && priorAnnualRevenue != null && Math.abs(priorAnnualRevenue) > 0
    ? ((annualRevenue - priorAnnualRevenue) / Math.abs(priorAnnualRevenue)) * 100
    : candidate.revenueGrowthYoY;
  const marketCap = candidate.marketCap;
  const priceToSalesRatio = candidate.priceToSalesRatio
    ?? (marketCap > 0 && annualRevenue > 0 ? marketCap / annualRevenue : null);
  const priceToBookRatio = candidate.priceToBookRatio
    ?? (marketCap > 0 && equity > 0 ? marketCap / equity : null);
  const trailingPE = candidate.trailingPE
    ?? (marketCap > 0 && netIncome > 0 ? marketCap / netIncome : null);
  const operatingMarginPct = candidate.operatingMarginPct
    ?? (operatingIncome != null && annualRevenue > 0 ? (operatingIncome / annualRevenue) * 100 : null);
  const profitMarginPct = candidate.profitMarginPct
    ?? (netIncome != null && annualRevenue > 0 ? (netIncome / annualRevenue) * 100 : null);
  const grossMarginPct = candidate.grossMarginPct
    ?? (grossProfit != null && annualRevenue > 0 ? (grossProfit / annualRevenue) * 100 : null);
  const returnOnAssetsPct = candidate.returnOnAssetsPct
    ?? (netIncome != null && assets > 0 ? (netIncome / assets) * 100 : null);
  const returnOnEquityPct = candidate.returnOnEquityPct
    ?? (netIncome != null && equity > 0 ? (netIncome / equity) * 100 : null);

  const hasFallbackMetrics = [
    annualRevenue,
    netIncome,
    assets,
    equity,
    revenueGrowthYoY,
    priceToSalesRatio,
    priceToBookRatio,
    trailingPE,
    operatingMarginPct,
    profitMarginPct,
    grossMarginPct,
    returnOnAssetsPct,
    returnOnEquityPct,
  ].some(value => hasMetric(value));

  if (!hasFallbackMetrics) {
    return candidate;
  }

  return {
    ...candidate,
    hasFundamentals: true,
    fundamentalsSource: candidate.fundamentalsSource
      ? `${candidate.fundamentalsSource}+sec`
      : 'sec',
    companyName: secFacts.entityName || candidate.companyName,
    sharesOutstanding: hasMetric(sharesOutstanding) && sharesOutstanding > 1_000_000
      ? sharesOutstanding
      : candidate.sharesOutstanding,
    revenueTTM: candidate.revenueTTM ?? annualRevenue,
    annualRevenue,
    annualRevenuePrior: priorAnnualRevenue,
    revenueGrowthYoY,
    grossProfitAnnual: grossProfit,
    operatingIncomeAnnual: operatingIncome,
    netIncomeAnnual: netIncome,
    assets,
    equity,
    grossMarginPct,
    operatingMarginPct,
    profitMarginPct,
    returnOnAssetsPct,
    returnOnEquityPct,
    trailingPE,
    priceToSalesRatio,
    priceToBookRatio,
  };
}

function computeSMA(series, period) {
  if (series.length < period) return null;
  const window = series.slice(-period);
  const sum = window.reduce((total, entry) => total + (entry.close || 0), 0);
  return sum / period;
}

function computeEMA(series, period) {
  if (series.length < period) return null;
  const multiplier = 2 / (period + 1);
  let ema = computeSMA(series.slice(0, period), period);
  for (const entry of series.slice(period)) {
    ema = ((entry.close - ema) * multiplier) + ema;
  }
  return ema;
}

function computeRSI(series, period) {
  if (series.length <= period) return null;
  let gains = 0;
  let losses = 0;

  for (let index = 1; index <= period; index += 1) {
    const change = (series[index].close || 0) - (series[index - 1].close || 0);
    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }

  let averageGain = gains / period;
  let averageLoss = losses / period;
  for (let index = period + 1; index < series.length; index += 1) {
    const change = (series[index].close || 0) - (series[index - 1].close || 0);
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    averageGain = ((averageGain * (period - 1)) + gain) / period;
    averageLoss = ((averageLoss * (period - 1)) + loss) / period;
  }

  if (averageLoss === 0) return 100;
  const relativeStrength = averageGain / averageLoss;
  return 100 - (100 / (1 + relativeStrength));
}

function computeATR(series, period) {
  if (series.length <= period) return null;
  const trueRanges = [];
  for (let index = 1; index < series.length; index += 1) {
    const current = series[index];
    const prior = series[index - 1];
    const highLow = (current.high || current.close || 0) - (current.low || current.close || 0);
    const highClose = Math.abs((current.high || current.close || 0) - (prior.close || 0));
    const lowClose = Math.abs((current.low || current.close || 0) - (prior.close || 0));
    trueRanges.push(Math.max(highLow, highClose, lowClose));
  }
  if (trueRanges.length < period) return null;

  let atr = trueRanges.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  for (const value of trueRanges.slice(period)) {
    atr = ((atr * (period - 1)) + value) / period;
  }
  return atr;
}

function buildTechnicalSignals({ symbol, latest, sma50, sma200, rsi14 }) {
  const signals = [];
  if (hasMetric(rsi14) && rsi14 >= 70) {
    signals.push(createSimpleSignal({
      id: `${symbol}_RSI_OVERBOUGHT`,
      name: `${symbol} RSI Overbought`,
      severity: 'watch',
      message: `${symbol} RSI-14 is ${rsi14.toFixed(1)}, which is in overbought territory.`,
      implications: [
        'Short-term upside may already be crowded',
        'Watch for mean reversion before adding aggressively',
      ],
    }));
  }
  if (hasMetric(rsi14) && rsi14 <= 30) {
    signals.push(createSimpleSignal({
      id: `${symbol}_RSI_OVERSOLD`,
      name: `${symbol} RSI Oversold`,
      severity: 'watch',
      message: `${symbol} RSI-14 is ${rsi14.toFixed(1)}, which is in oversold territory.`,
      implications: [
        'Short-term selling pressure may be exhausted',
        'Watch for stabilization before assuming reversal',
      ],
    }));
  }
  if (hasMetric(latest?.close) && hasMetric(sma200) && latest.close < sma200) {
    signals.push(createSimpleSignal({
      id: `${symbol}_BELOW_200DMA`,
      name: `${symbol} Below 200DMA`,
      severity: 'alert',
      message: `${symbol} is trading below its 200-period moving average (${formatDollar(sma200)}).`,
      implications: [
        'Longer-term trend has weakened',
        'Review conviction if the thesis depends on technical confirmation',
      ],
    }));
  }
  return signals;
}

function createSimpleSignal({ id, name, severity, message, implications }) {
  return Object.freeze({
    id,
    name,
    domain: 'market',
    severity,
    value: null,
    threshold: null,
    message,
    implications: Object.freeze([...(implications || [])]),
    related_domains: Object.freeze(['equities']),
  });
}

function compareLevel(price, movingAverage) {
  if (!hasMetric(price) || !hasMetric(movingAverage)) return 'N/A';
  const diffPct = calculatePercentDifference(price, movingAverage);
  return `${price >= movingAverage ? 'above' : 'below'} by ${Math.abs(diffPct).toFixed(1)}%`;
}

function describeMomentum(rsi14) {
  if (!hasMetric(rsi14)) return 'N/A';
  return `${resolveMomentumState(rsi14)} (${rsi14.toFixed(1)})`;
}

function resolveMomentumState(rsi14) {
  if (!hasMetric(rsi14)) return 'unknown';
  if (rsi14 >= 70) return 'overbought';
  if (rsi14 <= 30) return 'oversold';
  if (rsi14 >= 55) return 'positive';
  if (rsi14 <= 45) return 'soft';
  return 'neutral';
}

function resolveTechnicalBias({ price, sma50, sma200, rsi14 }) {
  if (!hasMetric(price) || !hasMetric(sma50) || !hasMetric(sma200)) return 'mixed';
  if (price < sma200 || (price < sma50 && (rsi14 ?? 50) < 45)) return 'bearish';
  if (price > sma50 && price > sma200 && (rsi14 ?? 50) >= 55) return 'bullish';
  return 'mixed';
}

function calculatePercentDifference(price, movingAverage) {
  if (!hasMetric(price) || !hasMetric(movingAverage) || movingAverage === 0) return null;
  return ((price - movingAverage) / movingAverage) * 100;
}

function roundMetric(value, decimals = 4) {
  if (!Number.isFinite(value)) return null;
  return Number(value.toFixed(decimals));
}

async function fetchBatchQuotesMap(symbols, apiKey, stableBaseUrl) {
  const quoteMap = new Map();
  const aliasMap = buildFmpSymbolAliasMap(symbols);
  const requestSymbols = [...new Set(symbols.flatMap(symbol => getFmpSymbolCandidates(symbol)))];
  const chunks = chunkArray(requestSymbols, 25);

  for (const chunk of chunks) {
    const data = await getJson(`${stableBaseUrl}/batch-quote-short?symbols=${chunk.join(',')}&apikey=${apiKey}`);
    for (const quote of Array.isArray(data) ? data : []) {
      const canonicalSymbol = resolveRequestedSymbol(quote?.symbol, aliasMap) || normalizeSymbol(quote?.symbol);
      if (canonicalSymbol) {
        quoteMap.set(canonicalSymbol, {
          ...quote,
          symbol: canonicalSymbol,
          source_symbol: normalizeSymbol(quote?.symbol),
        });
      }
    }
  }

  return quoteMap;
}

function buildWatchlistSummaryContent({
  watchlist,
  interval,
  from,
  to,
  technicalCoverageCount,
  technicalNonclearCount,
  technicalFailureCount,
  fundamentalsCoverageCount,
  fundamentalsCompleteCount,
  fundamentalsPartialCount,
  fundamentalsMissingCount,
  warmedFundamentals,
  nextEarningsDate,
  earningsFilePath,
  synced,
}) {
  return [
    `- **Kind**: ${watchlist.isBasket ? 'basket' : 'thesis'}`,
    `- **Watchlist Symbols**: ${watchlist.symbols.join(', ')}`,
    `- **Technical Coverage**: ${technicalCoverageCount}/${watchlist.symbols.length}`,
    `- **Technical Non-Clear**: ${technicalNonclearCount}`,
    `- **Technical Failures**: ${technicalFailureCount || 0}`,
    `- **Fundamentals Coverage**: ${fundamentalsCoverageCount}/${watchlist.symbols.length}`,
    `- **Fundamentals Complete**: ${fundamentalsCompleteCount}`,
    `- **Fundamentals Partial**: ${fundamentalsPartialCount}`,
    `- **Fundamentals Missing**: ${fundamentalsMissingCount}`,
    `- **Fundamentals Warmed**: ${warmedFundamentals ? 'yes' : 'no'}`,
    `- **Next Earnings Date**: ${nextEarningsDate || 'none in range'}`,
    `- **Technical Interval**: ${interval}`,
    `- **Earnings Range**: ${from} to ${to}`,
    `- **Shared Earnings Note**: ${filePathToWikiLink(earningsFilePath)}`,
    `- **Triggered Thesis Sync**: ${synced ? 'yes' : 'no'}`,
  ].join('\n');
}

function parseWatchlistEarningsRows(content) {
  const table = parseFirstMarkdownTable(content);
  if (!table) return [];

  return table.rows.map(row => ({
    date: normalizeCalendarDate(row.Date),
    symbol: normalizeSymbol(row.Symbol),
    epsEstimated: row['EPS Est'] || 'N/A',
    epsActual: row['EPS Act'] || 'N/A',
    revenueEstimated: row['Revenue Est'] || 'N/A',
    revenueActual: row['Revenue Act'] || 'N/A',
    lastUpdated: row['Last Updated'] || 'N/A',
  })).filter(row => row.symbol && row.date);
}

function compareDisplayEarningsRows(left, right) {
  if (left.date !== right.date) {
    return left.date.localeCompare(right.date);
  }
  return left.symbol.localeCompare(right.symbol);
}

function normalizeCalendarDate(value) {
  const date = String(value || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
}

function sanitizeWatchlistLabel(value) {
  return String(value || '')
    .trim()
    .replace(/[<>:"/\\|?*]+/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function filePathToWikiLink(filePath) {
  const fileName = basename(String(filePath || ''), '.md');
  return fileName ? `[[${fileName}]]` : 'N/A';
}

function chunkArray(items, chunkSize) {
  const chunks = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

function collectUniqueSymbols(entries, limit = 12) {
  return [...new Set(
    entries
      .map(entry => String(entry?.symbol || '').trim().toUpperCase())
      .filter(Boolean)
  )].slice(0, limit);
}

function normalizeIndustry(value) {
  return value ? toTitleCase(String(value).replace(/\s+/g, ' ').trim()) : null;
}

function pickLatestAnnualFactValue(companyFacts, taxonomy, concepts) {
  return pickAnnualFactSeries(companyFacts, taxonomy, concepts)[0]?.val ?? null;
}

function pickPriorAnnualFactValue(companyFacts, taxonomy, concepts) {
  return pickAnnualFactSeries(companyFacts, taxonomy, concepts)[1]?.val ?? null;
}

function pickAnnualFactSeries(companyFacts, taxonomy, concepts) {
  for (const concept of concepts) {
    const fact = companyFacts?.facts?.[taxonomy]?.[concept];
    if (!fact?.units) continue;
    const unitEntries = Object.entries(fact.units).find(([unit]) => /^USD($|\/)/.test(unit));
    if (!unitEntries) continue;
    const series = unitEntries[1]
      .filter(entry => Number.isFinite(entry?.val))
      .filter(entry => factDurationDays(entry) >= 300)
      .sort(compareFactEntries)
      .reverse();
    const deduped = dedupeFactSeriesByEnd(series);
    if (deduped.length > 0) return deduped;
  }
  return [];
}

function pickLatestInstantFactValue(companyFacts, taxonomy, concepts, preferredUnits = ['USD']) {
  for (const concept of concepts) {
    const fact = companyFacts?.facts?.[taxonomy]?.[concept];
    if (!fact?.units) continue;
    const unitKey = Object.keys(fact.units).find(unit =>
      preferredUnits.some(preferred => unit === preferred || unit.startsWith(`${preferred}/`))
    );
    if (!unitKey) continue;
    const entry = [...fact.units[unitKey]]
      .filter(item => Number.isFinite(item?.val))
      .sort(compareFactEntries)
      .pop();
    if (entry) return entry.val;
  }
  return null;
}

function factDurationDays(entry) {
  if (!entry?.start || !entry?.end) return 0;
  const start = Date.parse(entry.start);
  const end = Date.parse(entry.end);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.round((end - start) / 86_400_000);
}

function compareFactEntries(left, right) {
  const endDiff = Date.parse(left?.end || 0) - Date.parse(right?.end || 0);
  if (endDiff !== 0) return endDiff;
  return Date.parse(left?.filed || 0) - Date.parse(right?.filed || 0);
}

function dedupeFactSeriesByEnd(series) {
  const seen = new Set();
  const deduped = [];
  for (const entry of series) {
    const key = `${entry.end}-${entry.val}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(entry);
  }
  return deduped;
}

function toTitleCase(value) {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, letter => letter.toUpperCase());
}

function readJsonCache(filePath, ttlMs) {
  try {
    if (!existsSync(filePath)) return null;
    const parsed = JSON.parse(readFileSync(filePath, 'utf-8'));
    if (!parsed?.cachedAt || !parsed?.data) return null;
    if ((Date.now() - Date.parse(parsed.cachedAt)) > ttlMs) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeJsonCache(filePath, data) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify({
    cachedAt: new Date().toISOString(),
    data,
  }, null, 2));
}

function resolvePreferredEarningsMultiple(candidate) {
  if (candidate.forwardPE != null && candidate.forwardPE > 0) {
    return { label: 'Fwd P/E', value: candidate.forwardPE };
  }
  if (candidate.trailingPE != null && candidate.trailingPE > 0) {
    return { label: 'P/E', value: candidate.trailingPE };
  }
  return null;
}

function formatEarningsMultiple(earningsMultiple) {
  if (!earningsMultiple) return null;
  return `${earningsMultiple.label} ${earningsMultiple.value.toFixed(1)}x`;
}

function resolveSectorEarningsMultipleCeiling(candidate) {
  switch (candidate.sectorProfileKey) {
    case 'technology':
    case 'communicationServices':
    case 'healthcare':
      return 40;
    case 'financials':
    case 'utilities':
    case 'realEstate':
      return 20;
    default:
      return 25;
  }
}

function buildPotentialOvervaluationReason(candidate, earningsMultiple, sectorCeiling) {
  const reasons = [
    `${formatEarningsMultiple(earningsMultiple)} vs ~${sectorCeiling.toFixed(0)}x sector ceiling`,
  ];

  if (candidate.revenueGrowthYoY != null && candidate.revenueGrowthYoY < 0) {
    reasons.push('shrinking revenue against a rich multiple');
  } else if (candidate.revenueGrowthYoY != null && candidate.revenueGrowthYoY < 10) {
    reasons.push(`Rev +${candidate.revenueGrowthYoY.toFixed(0)}% does not fully support it`);
  }

  if (candidate.profitMarginPct != null && candidate.profitMarginPct < 0) {
    reasons.push('trailing margins are still negative');
  } else if (candidate.qualityScore != null && candidate.qualityScore < 55) {
    reasons.push(`quality score ${candidate.qualityScore}`);
  }

  if (candidate.analystUpsidePct != null && candidate.analystUpsidePct <= 0) {
    reasons.push('street targets sit at or below spot');
  }

  return reasons.slice(0, 2).join('; ');
}

function resolveValuationScore(candidate) {
  if (candidate.forwardPE != null && candidate.forwardPE > 0) {
    return inverseMetricScore(candidate.forwardPE, 8, 35);
  }
  if (candidate.trailingPE != null && candidate.trailingPE > 0) {
    return inverseMetricScore(candidate.trailingPE, 8, 35);
  }
  if (candidate.priceToSalesRatio != null && candidate.priceToSalesRatio > 0) {
    return inverseMetricScore(candidate.priceToSalesRatio, 1, 8);
  }
  if (candidate.evToRevenue != null && candidate.evToRevenue > 0) {
    return inverseMetricScore(candidate.evToRevenue, 1, 8);
  }
  if (candidate.priceToBookRatio != null && candidate.priceToBookRatio > 0) {
    return inverseMetricScore(candidate.priceToBookRatio, 1, 6);
  }
  return 50;
}

function buildWhyNow(candidate) {
  if ((candidate.qualityCoverageCount || 0) === 0) {
    if ((candidate.sectorFitScore ?? 50) < (candidate.sectorFitThreshold || 45)) {
      return 'weak sector fit; fundamentals pending';
    }
    if (candidate.rangePercentile != null && candidate.rangePercentile >= 0.75) {
      return 'near 52W highs; fundamentals pending';
    }
    if ((candidate.dollarVolume || 0) >= 20_000_000) {
      return 'strong liquidity; fundamentals pending';
    }
    return 'clean-universe survivor; fundamentals pending';
  }

  const reasons = [];
  const sectorReason = resolveSectorWhyNow(candidate);
  if (sectorReason) reasons.push(sectorReason);

  if (candidate.revenueGrowthYoY != null && candidate.revenueGrowthYoY >= 15) {
    reasons.push(`Rev +${candidate.revenueGrowthYoY.toFixed(0)}% YoY`);
  }
  if (candidate.analystUpsidePct != null && candidate.analystUpsidePct >= 20) {
    reasons.push(`${candidate.analystUpsidePct.toFixed(0)}% target upside`);
  }
  if (candidate.operatingMarginPct != null && candidate.operatingMarginPct >= 10) {
    reasons.push(`Op margin ${candidate.operatingMarginPct.toFixed(0)}%`);
  }
  if (candidate.rangePercentile != null && candidate.rangePercentile >= 0.75) {
    reasons.push('near 52W highs');
  }
  if (candidate.price != null && candidate.movingAverage50 != null && candidate.movingAverage200 != null &&
      candidate.price > candidate.movingAverage50 && candidate.price > candidate.movingAverage200) {
    reasons.push('above 50D/200D');
  }
  if ((candidate.dollarVolume || 0) >= 20_000_000) {
    reasons.push('strong liquidity');
  }

  if (reasons.length === 0) {
    return candidate.qualityScore >= 75 ? 'quality leader in current screen' : 'passed the clean-universe and liquidity filters';
  }

  return reasons.slice(0, 2).join('; ');
}

function resolveSectorWhyNow(candidate) {
  switch (candidate.sectorProfileKey) {
    case 'technology':
    case 'communicationServices':
      if (candidate.grossMarginPct != null && candidate.grossMarginPct >= 50) return `Gross margin ${candidate.grossMarginPct.toFixed(0)}%`;
      if (candidate.revenueGrowthYoY != null && candidate.revenueGrowthYoY >= 15) return 'growth still screening clean';
      return null;
    case 'healthcare':
      if (candidate.analystUpsidePct != null && candidate.analystUpsidePct >= 40) return 'catalyst rerating setup';
      if (candidate.revenueGrowthYoY != null && candidate.revenueGrowthYoY >= 20) return 'commercial ramp showing up';
      return null;
    case 'financials':
    case 'realEstate':
    case 'utilities':
      if (candidate.priceToBookRatio != null && candidate.priceToBookRatio <= 1.3) return `P/B ${candidate.priceToBookRatio.toFixed(1)}x`;
      if (candidate.returnOnEquityPct != null && candidate.returnOnEquityPct >= 10) return `ROE ${candidate.returnOnEquityPct.toFixed(0)}%`;
      return null;
    case 'energy':
    case 'materials':
      if (candidate.profitMarginPct != null && candidate.profitMarginPct >= 10) return `margin ${candidate.profitMarginPct.toFixed(0)}%`;
      if (candidate.forwardPE != null && candidate.forwardPE > 0 && candidate.forwardPE <= 10) return `Fwd P/E ${candidate.forwardPE.toFixed(1)}x`;
      return null;
    case 'consumerDiscretionary':
    case 'consumerStaples':
      if (candidate.operatingMarginPct != null && candidate.operatingMarginPct >= 10) return `consumer margin ${candidate.operatingMarginPct.toFixed(0)}%`;
      if (candidate.forwardPE != null && candidate.forwardPE > 0 && candidate.forwardPE <= 15) return `Fwd P/E ${candidate.forwardPE.toFixed(1)}x`;
      return null;
    case 'industrials':
      if (candidate.operatingMarginPct != null && candidate.operatingMarginPct >= 10) return `execution margin ${candidate.operatingMarginPct.toFixed(0)}%`;
      if (candidate.revenueGrowthYoY != null && candidate.revenueGrowthYoY >= 10) return 'order-cycle growth inflecting';
      return null;
    default:
      return null;
  }
}

function buildValuationSnapshot(candidate) {
  const earningsMultiple = resolvePreferredEarningsMultiple(candidate);
  if (earningsMultiple) {
    return formatEarningsMultiple(earningsMultiple);
  }
  if (candidate.priceToSalesRatio != null && candidate.priceToSalesRatio > 0) {
    return `P/S ${candidate.priceToSalesRatio.toFixed(1)}x`;
  }
  if (candidate.evToRevenue != null && candidate.evToRevenue > 0) {
    return `EV/Rev ${candidate.evToRevenue.toFixed(1)}x`;
  }
  if (candidate.priceToBookRatio != null && candidate.priceToBookRatio > 0) {
    return `P/B ${candidate.priceToBookRatio.toFixed(1)}x`;
  }
  if ((candidate.qualityCoverageCount || 0) === 0) {
    return 'fundamentals pending';
  }
  return 'No clean multiple';
}

function buildKeyRisk(candidate) {
  const risks = [];

  if ((candidate.qualityCoverageCount || 0) === 0) {
    risks.push('fundamental coverage missing');
  }
  if ((candidate.sectorFitScore ?? 50) < (candidate.sectorFitThreshold || 45)) {
    risks.push('weak sector fit');
  }

  if (candidate.profitMarginPct != null && candidate.profitMarginPct < 0) {
    risks.push('unprofitable');
  }
  if (candidate.revenueGrowthYoY != null && candidate.revenueGrowthYoY < 0) {
    risks.push('shrinking revenue');
  }
  if (candidate.beta != null && candidate.beta > 1.8) {
    risks.push(`beta ${candidate.beta.toFixed(1)}`);
  }
  if (candidate.analystUpsidePct != null && candidate.analystUpsidePct < 0) {
    risks.push('target below spot');
  }
  if ((candidate.dollarVolume || 0) < 2_000_000) {
    risks.push('thin liquidity');
  }
  const earningsMultiple = resolvePreferredEarningsMultiple(candidate);
  const sectorEarningsCeiling = resolveSectorEarningsMultipleCeiling(candidate);
  if (
    earningsMultiple &&
    sectorEarningsCeiling != null &&
    earningsMultiple.value >= sectorEarningsCeiling * 1.25
  ) {
    risks.push(formatEarningsMultiple(earningsMultiple));
  }
  if (candidate.priceToSalesRatio != null && candidate.priceToSalesRatio > 8) {
    risks.push(`P/S ${candidate.priceToSalesRatio.toFixed(1)}x`);
  }
  const sectorRisk = resolveSectorDefaultRisk(candidate);
  if (sectorRisk) {
    risks.push(sectorRisk);
  }

  if (risks.length === 0) {
    return 'no dominant red flag from current screen';
  }

  return risks.slice(0, 2).join('; ');
}

function resolveSectorDefaultRisk(candidate) {
  switch (candidate.sectorProfileKey) {
    case 'technology':
    case 'communicationServices':
      return 'multiple-compression risk';
    case 'healthcare':
      return /\b(biotechnology|therapeutics|pharmaceutical|drug)\b/i.test(candidate.industry || '')
        ? 'clinical/dilution risk'
        : 'reimbursement risk';
    case 'financials':
      return 'credit-cycle sensitivity';
    case 'consumerDiscretionary':
      return 'consumer-demand sensitivity';
    case 'consumerStaples':
      return 'input-cost sensitivity';
    case 'industrials':
      return 'order-cycle sensitivity';
    case 'materials':
      return 'commodity-cycle sensitivity';
    case 'energy':
      return 'commodity-price sensitivity';
    case 'utilities':
      return 'capital-intensity risk';
    case 'realEstate':
      return 'rate-sensitive balance sheet';
    default:
      return null;
  }
}

function researchTierLabel(tier) {
  if (tier === 'small') return 'Small';
  if (tier === 'micro') return 'Micro';
  if (tier === 'special') return 'Special';
  if (tier === 'reserve') return 'Reserve';
  return 'Screen';
}

function buildSectorResearchPicksContent(sector) {
  const { researchPicks } = sector;
  const parts = [
    `- **Sector Lens**: ${sector.sectorLens}`,
    `- **Primary Pick Gate**: sector fit score >= ${sector.fitThreshold}`,
    '',
  ];

  parts.push('### Small-Cap Picks', '');
  parts.push(researchPicks.small.length > 0
    ? buildResearchPickTable(researchPicks.small)
    : '- No small-cap picks passed the sector lens.');
  parts.push('');

  parts.push('### Micro-Cap Picks', '');
  parts.push(researchPicks.micro.length > 0
    ? buildResearchPickTable(researchPicks.micro)
    : '- No micro-cap picks passed the sector lens.');
  parts.push('');

  parts.push('### Special Situation', '');
  parts.push(researchPicks.special.length > 0
    ? buildResearchPickTable(researchPicks.special)
    : '- No special situation selected.');

  if (researchPicks.reserve?.length > 0) {
    parts.push('');
    parts.push('### Reserve Picks', '');
    parts.push(buildResearchPickTable(researchPicks.reserve));
  }

  return parts.join('\n');
}

function buildResearchPickTable(candidates) {
  return buildTable(
    ['Ticker', 'Score', 'Quality', 'Why Now', 'Valuation', 'Risk'],
    candidates.map(candidate => [
      `[[${candidate.symbol}]]`,
      String(candidate.score),
      String(candidate.qualityScore ?? 'N/A'),
      candidate.whyNow,
      candidate.valuationSnapshot,
      candidate.keyRisk,
    ])
  );
}

// ── New Premium endpoints ──────────────────────────────────────────────────────

async function pullInsiderTrading(symbol, apiKey, baseUrl) {
  const sym = symbol.toUpperCase();
  const stableBaseUrl = getStableBaseUrl(baseUrl);
  console.log(`🔍 FMP: Fetching insider trading for ${sym}...`);

  const data = await getJson(`${stableBaseUrl}/insider-trading?symbol=${sym}&limit=25&apikey=${apiKey}`);
  const trades = Array.isArray(data) ? data : [];

  if (trades.length === 0) {
    console.log(`  No recent insider trades found for ${sym}`);
  }

  const buys = trades.filter(t => ['P-Purchase', 'Buy'].includes(t.transactionType));
  const sells = trades.filter(t => ['S-Sale', 'Sell', 'S-Sale+OE'].includes(t.transactionType));

  const rows = trades.slice(0, 20).map(t => [
    t.transactionDate || 'N/A',
    t.reportingName || 'N/A',
    t.reportingCla || 'N/A',
    t.transactionType || 'N/A',
    formatNumber(t.securitiesTransacted, { style: 'compact', decimals: 0 }),
    formatNumber(t.price, { style: 'currency' }),
    formatNumber(t.securitiesOwned, { style: 'compact', decimals: 0 }),
  ]);

  const signalStatus = sells.length > buys.length * 2 ? 'watch' : 'clear';
  const signals = sells.length > buys.length * 2
    ? [`Insider selling dominates: ${sells.length} sells vs ${buys.length} buys in last 25 transactions`]
    : [];

  const note = buildNote({
    frontmatter: {
      title: `${sym} Insider Trading — FMP`,
      source: 'Financial Modeling Prep',
      symbol: sym,
      date_pulled: today(),
      domain: 'market',
      data_type: 'insider_trading',
      frequency: 'on-demand',
      signal_status: signalStatus,
      signals,
      insider_buys: buys.length,
      insider_sells: sells.length,
      tags: ['equities', 'insider-trading', sym.toLowerCase(), 'fmp'],
    },
    sections: [
      {
        heading: `${sym} — Recent Insider Transactions`,
        content: `**Buys**: ${buys.length}  |  **Sells**: ${sells.length}  |  **Net bias**: ${buys.length >= sells.length ? '🟢 Accumulation' : '🔴 Distribution'}`,
      },
      {
        heading: 'Transaction Log',
        content: rows.length > 0
          ? buildTable(['Date', 'Name', 'Role', 'Type', 'Shares', 'Price', 'Owned After'], rows)
          : '- No recent transactions found.',
      },
      {
        heading: 'Source',
        content: `- **API**: Financial Modeling Prep (insider-trading)\n- **Symbol**: ${sym}\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`FMP_Insider_${sym}`));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals };
}

async function pullBalanceSheet(symbol, apiKey, baseUrl) {
  const sym = symbol.toUpperCase();
  const stableBaseUrl = getStableBaseUrl(baseUrl);
  console.log(`📊 FMP: Fetching balance sheet for ${sym}...`);

  const data = await getJson(`${stableBaseUrl}/balance-sheet-statement?symbol=${sym}&period=annual&limit=4&apikey=${apiKey}`);
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No balance sheet data for ${sym}`);
  }

  const latest = data[0];
  const debtToEquity = latest.totalStockholdersEquity > 0
    ? (latest.totalDebt / latest.totalStockholdersEquity).toFixed(2)
    : 'N/A';

  const rows = data.map(d => [
    d.calendarYear || d.date?.slice(0, 4),
    formatNumber(d.totalAssets, { style: 'currency' }),
    formatNumber(d.totalLiabilities, { style: 'currency' }),
    formatNumber(d.totalStockholdersEquity, { style: 'currency' }),
    formatNumber(d.totalDebt, { style: 'currency' }),
    formatNumber(d.cashAndCashEquivalents, { style: 'currency' }),
    formatNumber(d.netDebt, { style: 'currency' }),
  ]);

  const signals = [];
  let signalStatus = 'clear';
  if (latest.netDebt > latest.totalStockholdersEquity * 2) {
    signals.push(`High leverage: net debt ${formatNumber(latest.netDebt, { style: 'currency' })} vs equity ${formatNumber(latest.totalStockholdersEquity, { style: 'currency' })}`);
    signalStatus = 'watch';
  }

  const note = buildNote({
    frontmatter: {
      title: `${sym} Balance Sheet — FMP`,
      source: 'Financial Modeling Prep',
      symbol: sym,
      date_pulled: today(),
      domain: 'market',
      data_type: 'balance_sheet',
      frequency: 'annual',
      signal_status: signalStatus,
      signals,
      debt_to_equity: debtToEquity,
      net_debt: latest.netDebt ?? null,
      cash: latest.cashAndCashEquivalents ?? null,
      tags: ['equities', 'balance-sheet', 'fundamentals', sym.toLowerCase(), 'fmp'],
    },
    sections: [
      {
        heading: `${sym} — Annual Balance Sheet`,
        content: buildTable(
          ['Year', 'Total Assets', 'Total Liabilities', 'Equity', 'Total Debt', 'Cash', 'Net Debt'],
          rows
        ),
      },
      {
        heading: 'Key Ratios (Latest Year)',
        content: buildTable(
          ['Metric', 'Value'],
          [
            ['Debt / Equity', debtToEquity],
            ['Net Debt', formatNumber(latest.netDebt, { style: 'currency' })],
            ['Cash & Equivalents', formatNumber(latest.cashAndCashEquivalents, { style: 'currency' })],
            ['Total Assets', formatNumber(latest.totalAssets, { style: 'currency' })],
          ]
        ),
      },
      {
        heading: 'Source',
        content: `- **API**: Financial Modeling Prep (balance-sheet-statement)\n- **Symbol**: ${sym}\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`FMP_BalanceSheet_${sym}`));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals };
}

async function pullCashFlow(symbol, apiKey, baseUrl) {
  const sym = symbol.toUpperCase();
  const stableBaseUrl = getStableBaseUrl(baseUrl);
  console.log(`💵 FMP: Fetching cash flow statement for ${sym}...`);

  const data = await getJson(`${stableBaseUrl}/cash-flow-statement?symbol=${sym}&period=annual&limit=4&apikey=${apiKey}`);
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No cash flow data for ${sym}`);
  }

  const latest = data[0];
  const signals = [];
  let signalStatus = 'clear';
  if (latest.freeCashFlow < 0) {
    signals.push(`Negative FCF: ${formatNumber(latest.freeCashFlow, { style: 'currency' })}`);
    signalStatus = 'watch';
  }

  const rows = data.map(d => [
    d.calendarYear || d.date?.slice(0, 4),
    formatNumber(d.operatingCashFlow, { style: 'currency' }),
    formatNumber(d.capitalExpenditure, { style: 'currency' }),
    formatNumber(d.freeCashFlow, { style: 'currency' }),
    formatNumber(d.dividendsPaid, { style: 'currency' }),
    formatNumber(d.netCashUsedForInvestingActivites, { style: 'currency' }),
    formatNumber(d.netCashUsedProvidedByFinancingActivities, { style: 'currency' }),
  ]);

  const note = buildNote({
    frontmatter: {
      title: `${sym} Cash Flow — FMP`,
      source: 'Financial Modeling Prep',
      symbol: sym,
      date_pulled: today(),
      domain: 'market',
      data_type: 'cash_flow',
      frequency: 'annual',
      signal_status: signalStatus,
      signals,
      free_cash_flow: latest.freeCashFlow ?? null,
      operating_cash_flow: latest.operatingCashFlow ?? null,
      tags: ['equities', 'cash-flow', 'fundamentals', sym.toLowerCase(), 'fmp'],
    },
    sections: [
      {
        heading: `${sym} — Annual Cash Flow Statement`,
        content: buildTable(
          ['Year', 'Operating CF', 'CapEx', 'Free CF', 'Dividends Paid', 'Investing CF', 'Financing CF'],
          rows
        ),
      },
      {
        heading: 'Source',
        content: `- **API**: Financial Modeling Prep (cash-flow-statement)\n- **Symbol**: ${sym}\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`FMP_CashFlow_${sym}`));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals };
}

async function pullAnalystEstimates(symbol, apiKey, baseUrl) {
  const sym = symbol.toUpperCase();
  const stableBaseUrl = getStableBaseUrl(baseUrl);
  console.log(`🎯 FMP: Fetching analyst estimates for ${sym}...`);

  const data = await getJson(`${stableBaseUrl}/analyst-estimates?symbol=${sym}&limit=6&apikey=${apiKey}`);
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No analyst estimates for ${sym}`);
  }

  const rows = data.map(d => [
    d.date || 'N/A',
    d.estimatedEpsAvg?.toFixed(2) ?? 'N/A',
    `${d.estimatedEpsLow?.toFixed(2) ?? '—'} – ${d.estimatedEpsHigh?.toFixed(2) ?? '—'}`,
    formatNumber(d.estimatedRevenueAvg, { style: 'currency' }),
    `${formatNumber(d.estimatedRevenueLow, { style: 'currency' })} – ${formatNumber(d.estimatedRevenueHigh, { style: 'currency' })}`,
    String(d.numberAnalystEstimatedEps ?? 'N/A'),
  ]);

  const note = buildNote({
    frontmatter: {
      title: `${sym} Analyst Estimates — FMP`,
      source: 'Financial Modeling Prep',
      symbol: sym,
      date_pulled: today(),
      domain: 'market',
      data_type: 'analyst_estimates',
      frequency: 'on-demand',
      signal_status: 'clear',
      signals: [],
      analyst_count: data[0]?.numberAnalystEstimatedEps ?? null,
      eps_est_avg: data[0]?.estimatedEpsAvg ?? null,
      revenue_est_avg: data[0]?.estimatedRevenueAvg ?? null,
      tags: ['equities', 'analyst-estimates', sym.toLowerCase(), 'fmp'],
    },
    sections: [
      {
        heading: `${sym} — Forward Analyst Estimates`,
        content: buildTable(
          ['Period', 'EPS Est (Avg)', 'EPS Range', 'Revenue Est (Avg)', 'Revenue Range', '# Analysts'],
          rows
        ),
      },
      {
        heading: 'Source',
        content: `- **API**: Financial Modeling Prep (analyst-estimates)\n- **Symbol**: ${sym}\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`FMP_Estimates_${sym}`));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals: [] };
}

async function pullShortInterest(symbol, apiKey, baseUrl) {
  const sym = symbol.toUpperCase();
  const stableBaseUrl = getStableBaseUrl(baseUrl);
  console.log(`📉 FMP: Fetching short interest for ${sym}...`);

  const data = await getJson(`${stableBaseUrl}/short-interest?symbol=${sym}&limit=6&apikey=${apiKey}`);
  const records = Array.isArray(data) ? data : [];

  if (records.length === 0) {
    console.log(`  No short interest data found for ${sym}`);
  }

  const latest = records[0] ?? {};
  const signals = [];
  let signalStatus = 'clear';
  if ((latest.shortPercentFloat ?? 0) > 0.2) {
    signals.push(`High short interest: ${((latest.shortPercentFloat ?? 0) * 100).toFixed(1)}% of float`);
    signalStatus = 'watch';
  }

  const rows = records.map(r => [
    r.settlementDate || r.date || 'N/A',
    formatNumber(r.shortInterest, { style: 'compact', decimals: 0 }),
    r.shortPercentFloat != null ? `${(r.shortPercentFloat * 100).toFixed(2)}%` : 'N/A',
    r.shortPriorMonth != null ? formatNumber(r.shortPriorMonth, { style: 'compact', decimals: 0 }) : 'N/A',
  ]);

  const note = buildNote({
    frontmatter: {
      title: `${sym} Short Interest — FMP`,
      source: 'Financial Modeling Prep',
      symbol: sym,
      date_pulled: today(),
      domain: 'market',
      data_type: 'short_interest',
      frequency: 'on-demand',
      signal_status: signalStatus,
      signals,
      short_pct_float: latest.shortPercentFloat ?? null,
      short_interest: latest.shortInterest ?? null,
      tags: ['equities', 'short-interest', sym.toLowerCase(), 'fmp'],
    },
    sections: [
      {
        heading: `${sym} — Short Interest History`,
        content: rows.length > 0
          ? buildTable(['Settlement Date', 'Short Interest', '% of Float', 'Prior Month'], rows)
          : '- No short interest data available.',
      },
      {
        heading: 'Source',
        content: `- **API**: Financial Modeling Prep (short-interest)\n- **Symbol**: ${sym}\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`FMP_ShortInterest_${sym}`));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals };
}

async function pullAnalystRatings(symbol, apiKey, baseUrl) {
  const sym = symbol.toUpperCase();
  const stableBaseUrl = getStableBaseUrl(baseUrl);
  console.log(`⭐ FMP: Fetching analyst ratings for ${sym}...`);

  const data = await getJson(`${stableBaseUrl}/analyst-stock-recommendations?symbol=${sym}&limit=20&apikey=${apiKey}`);
  const ratings = Array.isArray(data) ? data : [];

  // Count recent rating direction shifts
  const upgrades = ratings.filter(r => r.ratingChange === 'Upgrade' || r.action === 'Upgrade').length;
  const downgrades = ratings.filter(r => r.ratingChange === 'Downgrade' || r.action === 'Downgrade').length;

  const signals = [];
  let signalStatus = 'clear';
  if (downgrades > upgrades * 2 && downgrades >= 3) {
    signals.push(`Analyst downgrades dominating: ${downgrades} downgrades vs ${upgrades} upgrades`);
    signalStatus = 'watch';
  } else if (upgrades > downgrades * 2 && upgrades >= 3) {
    signals.push(`Analyst upgrades accelerating: ${upgrades} upgrades vs ${downgrades} downgrades`);
  }

  const rows = ratings.slice(0, 15).map(r => [
    r.date || 'N/A',
    r.analystCompany || r.firmName || 'N/A',
    r.analyst || 'N/A',
    r.ratingChange || r.action || 'Initiated',
    r.ratingCurrent || r.newGrade || r.rating || 'N/A',
    r.ratingPrevious || r.previousGrade || '—',
    r.priceTarget != null ? formatNumber(r.priceTarget, { style: 'currency' }) : 'N/A',
  ]);

  const note = buildNote({
    frontmatter: {
      title: `${sym} Analyst Ratings — FMP`,
      source: 'Financial Modeling Prep',
      symbol: sym,
      date_pulled: today(),
      domain: 'market',
      data_type: 'analyst_ratings',
      frequency: 'on-demand',
      signal_status: signalStatus,
      signals,
      upgrades,
      downgrades,
      tags: ['equities', 'analyst-ratings', sym.toLowerCase(), 'fmp'],
    },
    sections: [
      {
        heading: `${sym} — Recent Analyst Rating Changes`,
        content: `**Upgrades**: ${upgrades}  |  **Downgrades**: ${downgrades}  |  **Sentiment**: ${upgrades >= downgrades ? '🟢 Positive bias' : '🔴 Negative bias'}`,
      },
      {
        heading: 'Rating History',
        content: rows.length > 0
          ? buildTable(['Date', 'Firm', 'Analyst', 'Action', 'New Rating', 'Prior Rating', 'Price Target'], rows)
          : '- No recent rating changes found.',
      },
      {
        heading: 'Source',
        content: `- **API**: Financial Modeling Prep (analyst-stock-recommendations)\n- **Symbol**: ${sym}\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`FMP_Ratings_${sym}`));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals };
}

async function pullCompanyNews(symbol, apiKey, baseUrl) {
  const sym = symbol.toUpperCase();
  const stableBaseUrl = getStableBaseUrl(baseUrl);
  const limit = 20;
  console.log(`📰 FMP: Fetching company news for ${sym}...`);

  const data = await getJson(`${stableBaseUrl}/stock-news?tickers=${sym}&limit=${limit}&apikey=${apiKey}`);
  const articles = Array.isArray(data) ? data : [];

  if (articles.length === 0) {
    console.log(`  No news articles found for ${sym}`);
  }

  const rows = articles.map(a => [
    a.publishedDate?.slice(0, 10) || 'N/A',
    a.site || a.publisher || 'N/A',
    a.title ? (a.title.length > 80 ? a.title.slice(0, 80) + '…' : a.title) : 'N/A',
    a.sentiment ? String(a.sentiment) : 'N/A',
  ]);

  const note = buildNote({
    frontmatter: {
      title: `${sym} Company News — FMP`,
      source: 'Financial Modeling Prep',
      symbol: sym,
      date_pulled: today(),
      domain: 'market',
      data_type: 'company_news',
      frequency: 'on-demand',
      signal_status: 'clear',
      signals: [],
      article_count: articles.length,
      tags: ['equities', 'news', sym.toLowerCase(), 'fmp'],
    },
    sections: [
      {
        heading: `${sym} — Recent News Headlines`,
        content: rows.length > 0
          ? buildTable(['Date', 'Source', 'Headline', 'Sentiment'], rows)
          : '- No recent news found.',
      },
      {
        heading: 'Source',
        content: `- **API**: Financial Modeling Prep (stock-news)\n- **Symbol**: ${sym}\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`FMP_News_${sym}`));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals: [] };
}

async function pullMacroCalendar(flags, apiKey, baseUrl) {
  const stableBaseUrl = getStableBaseUrl(baseUrl);
  const fromDate = flags.from || today();
  const toDate = flags.to || (() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  })();
  console.log(`📅 FMP: Fetching economic calendar ${fromDate} → ${toDate}...`);

  const data = await getJson(`${stableBaseUrl}/economic-calendar?from=${fromDate}&to=${toDate}&apikey=${apiKey}`);
  const events = Array.isArray(data) ? data : [];

  // High-impact events only unless --all flag
  const filtered = flags.all
    ? events
    : events.filter(e => ['High', 'Medium'].includes(e.impact));

  const rows = filtered.slice(0, 40).map(e => [
    e.date?.slice(0, 10) || 'N/A',
    e.time || 'N/A',
    e.country || 'N/A',
    e.impact || 'N/A',
    e.event || 'N/A',
    e.actual != null ? String(e.actual) : '—',
    e.estimate != null ? String(e.estimate) : '—',
    e.previous != null ? String(e.previous) : '—',
  ]);

  const highCount = events.filter(e => e.impact === 'High').length;

  const note = buildNote({
    frontmatter: {
      title: `Economic Calendar — FMP (${fromDate} to ${toDate})`,
      source: 'Financial Modeling Prep',
      date_pulled: today(),
      domain: 'macro',
      data_type: 'economic_calendar',
      frequency: 'on-demand',
      date_from: fromDate,
      date_to: toDate,
      signal_status: highCount > 3 ? 'watch' : 'clear',
      signals: highCount > 3 ? [`${highCount} high-impact events in window`] : [],
      high_impact_count: highCount,
      tags: ['macro', 'economic-calendar', 'fmp'],
    },
    sections: [
      {
        heading: `Economic Events: ${fromDate} → ${toDate}`,
        content: `**Total**: ${events.length}  |  **High impact**: ${highCount}  |  **Showing**: ${flags.all ? 'all' : 'high + medium impact'}`,
      },
      {
        heading: 'Event Schedule',
        content: rows.length > 0
          ? buildTable(['Date', 'Time', 'Country', 'Impact', 'Event', 'Actual', 'Estimate', 'Previous'], rows)
          : '- No events found for this window.',
      },
      {
        heading: 'Source',
        content: `- **API**: Financial Modeling Prep (economic-calendar)\n- **Window**: ${fromDate} to ${toDate}\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Macro', dateStampedFilename(`FMP_EconomicCalendar`));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals: [] };
}

/**
 * pullWatchlistDeepScan — runs insider, balance-sheet, cash-flow, estimates,
 * short-interest, ratings, and news for every unique symbol in the thesis watchlists.
 * Designed for weekly cadence — writes individual notes per symbol per endpoint.
 */
async function pullWatchlistDeepScan(flags, apiKey, baseUrl) {
  const thesisFilter = String(flags.thesis || '').trim();
  const dryRun = Boolean(flags['dry-run']);
  const concurrency = Math.min(2, parseInt(flags.concurrency ?? '2', 10));

  const watchlists = await loadThesisWatchlists({ includeBaskets: false, thesisFilter });
  if (watchlists.length === 0) {
    throw new Error('No thesis watchlists found for deep scan.');
  }

  const uniqueSymbols = [...new Set(watchlists.flatMap(w => w.symbols))];
  console.log(`\n🔬 FMP Watchlist Deep Scan — ${uniqueSymbols.length} symbol(s): ${uniqueSymbols.join(', ')}`);

  if (dryRun) {
    console.log('   Dry run — no API calls or note writes.');
    return { symbols: uniqueSymbols };
  }

  const ENDPOINTS = [
    { name: 'insider',        fn: sym => pullInsiderTrading(sym, apiKey, baseUrl) },
    { name: 'balance-sheet',  fn: sym => pullBalanceSheet(sym, apiKey, baseUrl) },
    { name: 'cash-flow',      fn: sym => pullCashFlow(sym, apiKey, baseUrl) },
    { name: 'estimates',      fn: sym => pullAnalystEstimates(sym, apiKey, baseUrl) },
    { name: 'short-interest', fn: sym => pullShortInterest(sym, apiKey, baseUrl) },
    { name: 'ratings',        fn: sym => pullAnalystRatings(sym, apiKey, baseUrl) },
    { name: 'news',           fn: sym => pullCompanyNews(sym, apiKey, baseUrl) },
  ];

  const results = [];
  for (const { name, fn } of ENDPOINTS) {
    console.log(`\n  📂 Running ${name} for ${uniqueSymbols.length} symbol(s)...`);
    const endpointResults = await mapWithConcurrency(uniqueSymbols, concurrency, async sym => {
      try {
        return await fn(sym);
      } catch (err) {
        console.warn(`  ⚠  ${name} failed for ${sym}: ${err.message}`);
        return null;
      }
    });
    results.push({ endpoint: name, files: endpointResults.filter(Boolean) });
  }

  const totalFiles = results.reduce((n, r) => n + r.files.length, 0);
  console.log(`\n✅ Deep scan complete — ${totalFiles} notes written across ${ENDPOINTS.length} endpoints.`);
  return results;
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index], index);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length || 1) }, () => worker());
  await Promise.all(workers);
  return results;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
