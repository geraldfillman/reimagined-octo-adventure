/**
 * yahoo-client.mjs — Yahoo Finance chart API client (no key required).
 *
 * 2026-08 data policy: Yahoo is the FIRST source for quotes and OHLCV
 * history; FMP free-tier quota is reserved for what Yahoo cannot provide
 * (statements, float, insiders, screeners, earnings). When neither source
 * can fill a field it stays null and the consuming note should surface the
 * gap explicitly rather than fake a value.
 *
 * Uses the public v8 chart endpoint (same one futures-curve.mjs relies on).
 * All functions throw on failure so callers can fall back to FMP.
 */

import { getJson } from './fetcher.mjs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MyData-Vault/1.0';
const CHART_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

/** Raw chart result for a symbol. */
export async function fetchYahooChart(symbol, { range = '5d', interval = '1d' } = {}) {
  const url = `${CHART_BASE}/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  const data = await getJson(url, { headers: { 'User-Agent': UA }, timeout: 15_000 });
  const result = data?.chart?.result?.[0];
  if (!result?.meta) throw new Error(`Yahoo chart returned no result for ${symbol}`);
  return result;
}

/**
 * FMP /quote-shaped object built from Yahoo chart meta.
 * marketCap is not available from this endpoint — callers treat null as a
 * declared data gap, not zero.
 */
export async function fetchYahooQuote(symbol) {
  const result = await fetchYahooChart(symbol, { range: '1d', interval: '1d' });
  const m = result.meta;
  const price = m.regularMarketPrice ?? null;
  const prev = m.chartPreviousClose ?? m.previousClose ?? null;
  const change = price != null && prev != null ? +(price - prev).toFixed(4) : null;
  return {
    symbol: m.symbol ?? symbol,
    name: m.longName ?? m.shortName ?? symbol,
    price,
    previousClose: prev,
    change,
    changesPercentage: change != null && prev ? +((change / prev) * 100).toFixed(4) : null,
    dayLow: m.regularMarketDayLow ?? null,
    dayHigh: m.regularMarketDayHigh ?? null,
    yearLow: m.fiftyTwoWeekLow ?? null,
    yearHigh: m.fiftyTwoWeekHigh ?? null,
    volume: m.regularMarketVolume ?? null,
    marketCap: null,
    exchange: m.exchangeName ?? null,
    timestamp: m.regularMarketTime ?? null,
    _source: 'yahoo',
  };
}

/** Daily OHLCV rows (FMP historical shape), oldest-to-newest, nulls dropped. */
export async function fetchYahooDailyPrices(symbol, { range = '1y' } = {}) {
  const result = await fetchYahooChart(symbol, { range, interval: '1d' });
  return chartToRows(result, ts => new Date(ts * 1000).toISOString().slice(0, 10));
}

/**
 * Intraday 1-minute OHLCV bars (FMP historical-chart shape).
 * Yahoo serves 1m data for roughly the last 7 days only.
 */
export async function fetchYahooIntradayPrices(symbol, { range = '5d' } = {}) {
  const result = await fetchYahooChart(symbol, { range, interval: '1m' });
  const offset = result.meta?.gmtoffset ?? 0;
  return chartToRows(result, ts =>
    new Date((ts + offset) * 1000).toISOString().replace('T', ' ').slice(0, 19));
}

function chartToRows(result, formatDate) {
  const timestamps = result.timestamp ?? [];
  const quote = result.indicators?.quote?.[0] ?? {};
  return timestamps
    .map((ts, i) => ({
      date: formatDate(ts),
      open: quote.open?.[i] ?? null,
      high: quote.high?.[i] ?? null,
      low: quote.low?.[i] ?? null,
      close: quote.close?.[i] ?? null,
      adjClose: quote.close?.[i] ?? null,
      volume: quote.volume?.[i] ?? null,
    }))
    .filter(row => row.close != null);
}
