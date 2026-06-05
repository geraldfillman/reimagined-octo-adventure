/**
 * alpha-vantage.mjs - optional Alpha Vantage comparison puller.
 *
 * V1 role: sidecar coverage for endpoints that complement FMP, especially
 * news sentiment, technical indicators, and top gainers/losers.
 */

import { join } from 'path';
import { getApiKey, getBaseUrl, getPullsDir } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import { withRetry, RateLimitError } from '../lib/retry.mjs';
import { keepEnglishContent } from '../lib/language-filter.mjs';
import {
  buildNote,
  buildTable,
  writeNote,
  today,
  dateStampedFilename,
  formatNumber,
} from '../lib/markdown.mjs';

const DEFAULT_LIMIT = 25;
const TECHNICAL_INDICATORS = new Set(['RSI', 'MACD', 'BBANDS', 'ATR', 'SMA', 'EMA']);

export function buildAlphaVantageUrl(baseUrl, params = {}, apiKey = '') {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === false || value === '') continue;
    search.set(key, String(value));
  }
  if (apiKey) search.set('apikey', apiKey);
  return `${baseUrl}?${search.toString()}`;
}

export function normalizeAlphaNewsItem(item = {}) {
  return Object.freeze({
    time: item.time_published || '',
    date: item.time_published ? String(item.time_published).slice(0, 8) : '',
    source: item.source || '',
    title: item.title || '',
    url: item.url || '',
    overallSentimentScore: parseNumber(item.overall_sentiment_score),
    overallSentimentLabel: item.overall_sentiment_label || '',
    tickerSentiment: Array.isArray(item.ticker_sentiment) ? item.ticker_sentiment : [],
  });
}

export function filterEnglishAlphaNewsItems(items = []) {
  return items.filter(item => keepEnglishContent(item, {
    textFields: ['title', 'source'],
  }));
}

export function normalizeAlphaMover(row = {}) {
  return Object.freeze({
    symbol: row.ticker || row.symbol || '',
    price: parseNumber(row.price),
    changeAmount: parseNumber(row.change_amount),
    changePercentage: parsePercent(row.change_percentage),
    volume: parseNumber(row.volume),
  });
}

export async function pull(flags = {}) {
  const apiKey = getApiKey('alphavantage');
  const baseUrl = getBaseUrl('alphavantage');

  if (flags['news-sentiment']) {
    return pullNewsSentiment(flags, apiKey, baseUrl);
  }
  if (flags['top-gainers-losers'] || flags['market-performance']) {
    return pullTopGainersLosers(flags, apiKey, baseUrl);
  }
  if (flags.technical) {
    return pullTechnicalIndicator(flags, apiKey, baseUrl);
  }

  throw new Error('Specify --news-sentiment <TICKERS>, --top-gainers-losers, or --technical <SYMBOL> --indicator RSI');
}

async function pullNewsSentiment(flags, apiKey, baseUrl) {
  const target = flags['news-sentiment'] === true ? '' : String(flags['news-sentiment'] || '').trim().toUpperCase();
  const limit = clampLimit(flags.limit ?? DEFAULT_LIMIT);
  const params = {
    function: 'NEWS_SENTIMENT',
    tickers: target || undefined,
    topics: flags.topic || flags.topics || undefined,
    sort: flags.sort || 'LATEST',
    limit,
  };
  const url = buildAlphaVantageUrl(baseUrl, params, apiKey);

  console.log(`Alpha Vantage: fetching news sentiment${target ? ` for ${target}` : ''}...`);
  if (flags['dry-run']) {
    console.log(`  Dry run: would request ${redactApiKey(url)}`);
    return { source: 'alphavantage', endpoint: 'NEWS_SENTIMENT', dryRun: true };
  }

  const data = await getAlphaVantageJson(url);
  const rawArticles = Array.isArray(data.feed) ? data.feed.map(normalizeAlphaNewsItem) : [];
  const englishArticles = filterEnglishAlphaNewsItems(rawArticles);
  const articles = englishArticles.slice(0, limit);
  const filteredLanguageCount = rawArticles.length - englishArticles.length;
  const rows = articles.map(article => [
    formatAlphaDate(article.time),
    article.source || 'N/A',
    truncateText(article.title, 90),
    article.overallSentimentLabel || 'N/A',
    formatNumber(article.overallSentimentScore, { decimals: 3 }),
    article.url ? `[link](${article.url})` : '',
  ]);

  const negativeCount = articles.filter(article => article.overallSentimentScore <= -0.15).length;
  const signalStatus = negativeCount >= 5 ? 'watch' : 'clear';
  const signals = signalStatus === 'watch'
    ? [`${negativeCount} Alpha Vantage news items show negative sentiment`]
    : [];

  const note = buildNote({
    frontmatter: {
      title: `Alpha Vantage News Sentiment${target ? ` - ${target}` : ''}`,
      source: 'Alpha Vantage',
      date_pulled: today(),
      domain: 'news',
      data_type: 'alpha_vantage_news_sentiment',
      frequency: 'intraday',
      symbol: target || '',
      signal_status: signalStatus,
      signals,
      article_count: articles.length,
      language_filter: 'english',
      language_filtered_count: filteredLanguageCount,
      provider_role: 'comparison_sidecar',
      tags: ['news', 'sentiment', 'alpha-vantage', 'briefing-input'],
    },
    sections: [
      {
        heading: 'News Sentiment',
        content: rows.length > 0
          ? buildTable(['Date', 'Source', 'Headline', 'Sentiment', 'Score', 'Link'], rows)
          : '- No Alpha Vantage news items returned.',
      },
      {
        heading: 'Operating Use',
        content: [
          '- Sidecar sentiment check against FMP and NewsAPI.',
          '- Promote into daily flow only when it adds coverage that FMP does not provide.',
        ].join('\n'),
      },
      {
        heading: 'Source',
        content: `- **API**: Alpha Vantage NEWS_SENTIMENT\n- **Target**: ${target || flags.topic || flags.topics || 'broad feed'}\n- **Filtered non-English**: ${filteredLanguageCount}\n- **Language filter**: English-only title post-filter\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const suffix = target ? `AlphaVantage_News_Sentiment_${target}` : 'AlphaVantage_News_Sentiment';
  const filePath = join(getPullsDir(), 'News', dateStampedFilename(suffix));
  writeNote(filePath, note);
  console.log(`Wrote: ${filePath}`);
  return { filePath, signals };
}

async function pullTopGainersLosers(flags, apiKey, baseUrl) {
  const url = buildAlphaVantageUrl(baseUrl, { function: 'TOP_GAINERS_LOSERS' }, apiKey);
  const limit = clampLimit(flags.limit ?? 20);
  console.log('Alpha Vantage: fetching top gainers, losers, and active tickers...');

  if (flags['dry-run']) {
    console.log(`  Dry run: would request ${redactApiKey(url)}`);
    return { source: 'alphavantage', endpoint: 'TOP_GAINERS_LOSERS', dryRun: true };
  }

  const data = await getAlphaVantageJson(url);
  const groups = [
    ['Top Gainers', 'top_gainers'],
    ['Top Losers', 'top_losers'],
    ['Most Actively Traded', 'most_actively_traded'],
  ].map(([heading, key]) => ({
    heading,
    rows: Array.isArray(data[key]) ? data[key].map(normalizeAlphaMover).slice(0, limit) : [],
  }));

  const sections = groups.map(group => ({
    heading: group.heading,
    content: group.rows.length > 0
      ? buildTable(
          ['Symbol', 'Price', 'Change', 'Change %', 'Volume'],
          group.rows.map(row => [
            row.symbol || 'N/A',
            formatDollar(row.price),
            formatSigned(row.changeAmount),
            formatPercent(row.changePercentage),
            row.volume ? formatNumber(row.volume, { style: 'compact', decimals: 1 }) : 'N/A',
          ])
        )
      : '- No rows returned.',
  }));
  sections.push({
    heading: 'Source',
    content: `- **API**: Alpha Vantage TOP_GAINERS_LOSERS\n- **Auto-pulled**: ${today()}`,
  });

  const note = buildNote({
    frontmatter: {
      title: 'Alpha Vantage Market Performance',
      source: 'Alpha Vantage',
      date_pulled: today(),
      domain: 'market',
      data_type: 'alpha_vantage_market_performance',
      frequency: 'intraday',
      signal_status: 'clear',
      signals: [],
      provider_role: 'comparison_sidecar',
      tags: ['market', 'market-performance', 'alpha-vantage'],
    },
    sections,
  });

  const filePath = join(getPullsDir(), 'Market', dateStampedFilename('AlphaVantage_Market_Performance'));
  writeNote(filePath, note);
  console.log(`Wrote: ${filePath}`);
  return { filePath, signals: [] };
}

async function pullTechnicalIndicator(flags, apiKey, baseUrl) {
  const symbol = String(flags.technical || '').trim().toUpperCase();
  if (!symbol) throw new Error('--technical requires a symbol');

  const indicator = String(flags.indicator || 'RSI').trim().toUpperCase();
  if (!TECHNICAL_INDICATORS.has(indicator)) {
    throw new Error(`Unsupported --indicator "${indicator}". Use ${[...TECHNICAL_INDICATORS].join(', ')}`);
  }

  const params = buildTechnicalParams({ indicator, symbol, flags });
  const url = buildAlphaVantageUrl(baseUrl, params, apiKey);
  console.log(`Alpha Vantage: fetching ${indicator} for ${symbol}...`);

  if (flags['dry-run']) {
    console.log(`  Dry run: would request ${redactApiKey(url)}`);
    return { source: 'alphavantage', endpoint: indicator, dryRun: true };
  }

  const data = await getAlphaVantageJson(url);
  const seriesKey = Object.keys(data).find(key => key.startsWith('Technical Analysis:'));
  const series = seriesKey && data[seriesKey] && typeof data[seriesKey] === 'object' ? data[seriesKey] : {};
  const rows = Object.entries(series)
    .slice(0, 20)
    .map(([date, values]) => [
      date,
      ...Object.entries(values || {}).slice(0, 4).map(([, value]) => formatNumber(parseNumber(value), { decimals: 4 })),
    ]);
  const headers = ['Date', ...resolveTechnicalHeaders(indicator).slice(0, 4)];

  const latest = rows[0] || [];
  const note = buildNote({
    frontmatter: {
      title: `${symbol} ${indicator} - Alpha Vantage`,
      source: 'Alpha Vantage',
      symbol,
      date_pulled: today(),
      domain: 'market',
      data_type: 'alpha_vantage_technical_indicator',
      frequency: 'on-demand',
      indicator,
      interval: params.interval || '',
      signal_status: 'clear',
      signals: [],
      provider_role: 'comparison_sidecar',
      latest_date: latest[0] || '',
      latest_value: latest[1] || '',
      tags: ['market', 'technical', 'alpha-vantage', symbol.toLowerCase(), indicator.toLowerCase()],
    },
    sections: [
      {
        heading: `${indicator} Snapshot`,
        content: rows.length > 0 ? buildTable(headers, rows) : '- No technical series returned.',
      },
      {
        heading: 'Source',
        content: `- **API**: Alpha Vantage ${indicator}\n- **Symbol**: ${symbol}\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`AlphaVantage_${indicator}_${symbol}`));
  writeNote(filePath, note);
  console.log(`Wrote: ${filePath}`);
  return { filePath, signals: [] };
}

function buildTechnicalParams({ indicator, symbol, flags }) {
  const interval = String(flags.interval || 'daily').toLowerCase();
  const base = {
    function: indicator,
    symbol,
    interval,
  };
  if (['RSI', 'SMA', 'EMA', 'BBANDS', 'ATR'].includes(indicator)) {
    base.time_period = flags['time-period'] || flags.time_period || (indicator === 'BBANDS' ? 20 : 14);
  }
  if (['RSI', 'SMA', 'EMA', 'BBANDS', 'MACD'].includes(indicator)) {
    base.series_type = flags['series-type'] || flags.series_type || 'close';
  }
  if (indicator === 'BBANDS') {
    base.nbdevup = flags.nbdevup || 2;
    base.nbdevdn = flags.nbdevdn || 2;
  }
  return base;
}

function resolveTechnicalHeaders(indicator) {
  if (indicator === 'MACD') return ['MACD', 'MACD_Hist', 'MACD_Signal'];
  if (indicator === 'BBANDS') return ['Real Lower Band', 'Real Middle Band', 'Real Upper Band'];
  return [indicator];
}

function assertAlphaVantagePayload(data) {
  if (data?.['Error Message']) throw new Error(`Alpha Vantage error: ${data['Error Message']}`);
  if (data?.Note) throw new Error(`Alpha Vantage rate limit: ${data.Note}`);
  if (data?.Information) throw new Error(`Alpha Vantage information: ${data.Information}`);
}

/**
 * Fetch from Alpha Vantage with retry logic that handles body-encoded rate-limit
 * responses (200 OK with data.Note or data.Information fields). Alpha Vantage does
 * not return HTTP 429 — it returns 200 with an error payload — so HTTP-layer retry
 * in fetcher.mjs does not catch these. This wrapper retries on Note/Information
 * payloads using RateLimitError to honour the retry delay.
 *
 * @param {string} url - The full Alpha Vantage URL (API key already embedded)
 * @returns {Promise<any>} Parsed and validated response data
 */
async function getAlphaVantageJson(url) {
  return withRetry(
    async () => {
      const data = await getJson(url);
      // Alpha Vantage encodes rate limits as 200 OK with Note/Information fields.
      // Throw RateLimitError so withRetry applies a backoff delay before retrying.
      if (data?.Note) throw new RateLimitError(60_000, `Alpha Vantage rate limit (Note): ${data.Note}`);
      if (data?.Information) throw new RateLimitError(60_000, `Alpha Vantage rate limit (Information): ${data.Information}`);
      if (data?.['Error Message']) throw new Error(`Alpha Vantage error: ${data['Error Message']}`);
      return data;
    },
    {
      maxAttempts: 3,
      baseDelayMs: 60_000,
      maxDelayMs: 120_000,
      shouldRetry: (err) => err instanceof RateLimitError,
      onRetry: (err, attempt, waitMs) =>
        console.warn(`  Alpha Vantage rate limit hit — retry ${attempt} in ${Math.round(waitMs / 1000)}s`),
    },
  );
}

function clampLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, 100);
}

function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(String(value).replace(/[%,$]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePercent(value) {
  return parseNumber(value);
}

function formatAlphaDate(value) {
  const raw = String(value || '');
  return raw.length >= 8 ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}` : 'N/A';
}

function formatDollar(value) {
  return Number.isFinite(Number(value)) ? `$${Number(value).toFixed(2)}` : 'N/A';
}

function formatSigned(value) {
  return Number.isFinite(Number(value))
    ? `${Number(value) >= 0 ? '+' : ''}${Number(value).toFixed(2)}`
    : 'N/A';
}

function formatPercent(value) {
  return Number.isFinite(Number(value)) ? `${Number(value).toFixed(2)}%` : 'N/A';
}

function truncateText(value, maxLength = 80) {
  const text = String(value || '');
  return text.length > maxLength ? `${text.slice(0, Math.max(0, maxLength - 3))}...` : text;
}

function redactApiKey(url) {
  return String(url).replace(/apikey=[^&]+/i, 'apikey=REDACTED');
}
