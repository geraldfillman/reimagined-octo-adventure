/**
 * fmp-client.mjs — thin FMP Premium REST wrapper.
 *
 * Narrow surface: only the endpoints the dilution / digest / DD / screener
 * tools actually hit. Rate-limiting lives in lib/fetcher.mjs (token bucket),
 * so this file is just URL construction + trivial result shaping.
 *
 * Keeping a single place for FMP URLs means that when FMP renames an
 * endpoint (they did in 2024/2025 with the /stable migration), we fix one
 * file instead of five pullers.
 */

import { getApiKey, getBaseUrl } from './config.mjs';
import { getJson } from './fetcher.mjs';

/** /stable endpoints now power most Premium calls; /api/v3 still works for a few legacy ones. */
function stable() {
  return getBaseUrl('fmp').replace(/\/api\/v\d+$/, '/stable');
}

function key() {
  return getApiKey('fmp');
}

// ─── Fundamentals ────────────────────────────────────────────────────────────

/** Most recent N quarterly balance sheets, newest-first. */
export async function fetchBalanceSheetQuarterly(ticker, { limit = 4 } = {}) {
  const url = `${stable()}/balance-sheet-statement?symbol=${encodeURIComponent(ticker)}&period=quarter&limit=${limit}&apikey=${key()}`;
  const data = await getJson(url);
  return Array.isArray(data) ? data : [];
}

/** Most recent N quarterly cash-flow statements, newest-first. */
export async function fetchCashFlowQuarterly(ticker, { limit = 4 } = {}) {
  const url = `${stable()}/cash-flow-statement?symbol=${encodeURIComponent(ticker)}&period=quarter&limit=${limit}&apikey=${key()}`;
  const data = await getJson(url);
  return Array.isArray(data) ? data : [];
}

/** Annual income statements (for revenue trends in DD + screener). */
export async function fetchIncomeAnnual(ticker, { limit = 5 } = {}) {
  const url = `${stable()}/income-statement?symbol=${encodeURIComponent(ticker)}&period=annual&limit=${limit}&apikey=${key()}`;
  const data = await getJson(url);
  return Array.isArray(data) ? data : [];
}

// ─── Market / float ──────────────────────────────────────────────────────────

/** { symbol, floatShares, outstandingShares, freeFloat, ... } or null. */
export async function fetchSharesFloat(ticker) {
  const url = `${stable()}/shares-float?symbol=${encodeURIComponent(ticker)}&apikey=${key()}`;
  const data = await getJson(url);
  if (Array.isArray(data) && data.length > 0) return data[0];
  if (data && typeof data === 'object') return data;
  return null;
}

/** Lightweight quote for price + market cap. */
export async function fetchQuote(ticker) {
  const url = `${stable()}/quote?symbol=${encodeURIComponent(ticker)}&apikey=${key()}`;
  const data = await getJson(url);
  if (Array.isArray(data) && data.length > 0) return data[0];
  return null;
}

/** FMP company profile: IPO date, country, description, exchange, etc. */
export async function fetchProfile(ticker) {
  const url = `${stable()}/profile?symbol=${encodeURIComponent(ticker)}&apikey=${key()}`;
  const data = await getJson(url);
  if (Array.isArray(data) && data.length > 0) return data[0];
  return null;
}

// ─── Historical price for 20-day bid test (Nasdaq compliance) ───────────────

/** Last N trading days of OHLCV. */
export async function fetchDailyPrices(ticker, { from, to } = {}) {
  const qs = new URLSearchParams({ symbol: ticker, apikey: key() });
  if (from) qs.set('from', from);
  if (to)   qs.set('to', to);
  const url = `${stable()}/historical-price-eod/light?${qs.toString()}`;
  const data = await getJson(url);
  return Array.isArray(data?.historical) ? data.historical : (Array.isArray(data) ? data : []);
}

/** Intraday OHLCV bars. Supported by the FMP historical-chart endpoint. */
export async function fetchIntradayPrices(ticker, { interval = '1min', from, to } = {}) {
  const normalizedInterval = String(interval || '1min').toLowerCase();
  const supportedIntervals = new Set(['1min']);
  if (!supportedIntervals.has(normalizedInterval)) {
    throw new Error(`Unsupported intraday interval "${interval}". Supported values: 1min`);
  }

  const qs = new URLSearchParams({ symbol: ticker, apikey: key() });
  if (from) qs.set('from', from);
  if (to) qs.set('to', to);
  const url = `${stable()}/historical-chart/${normalizedInterval}?${qs.toString()}`;
  const data = await getJson(url);
  return Array.isArray(data) ? data : [];
}

// ─── Insider / short / news (used by DD report + digest) ────────────────────

/** Most recent insider transactions (Form 4 summary). */
export async function fetchInsiderTrades(ticker, { limit = 20 } = {}) {
  const url = `${stable()}/insider-trading?symbol=${encodeURIComponent(ticker)}&limit=${limit}&apikey=${key()}`;
  const data = await getJson(url);
  return Array.isArray(data) ? data : [];
}

export async function fetchShortInterest(ticker) {
  const url = `${stable()}/short-interest?symbol=${encodeURIComponent(ticker)}&apikey=${key()}`;
  const data = await getJson(url);
  return Array.isArray(data) ? data[0] ?? null : data ?? null;
}

export async function fetchStockNews(ticker, { limit = 10 } = {}) {
  const url = `${stable()}/news/stock?symbols=${encodeURIComponent(ticker)}&limit=${limit}&apikey=${key()}`;
  const data = await getJson(url);
  return Array.isArray(data) ? data : [];
}

/** Full OHLCV history (adjusted) for a symbol, oldest-to-newest after normalization. */
export async function fetchDailyPricesFull(ticker, { from, to } = {}) {
  const qs = new URLSearchParams({ symbol: ticker, apikey: key() });
  if (from) qs.set('from', from);
  if (to)   qs.set('to', to);
  const data = await getJson(`${stable()}/historical-price-eod/full?${qs.toString()}`);
  return Array.isArray(data?.historical) ? data.historical : (Array.isArray(data) ? data : []);
}

/**
 * Batch short quotes for an array of symbols.
 * Returns a flat array of quote objects (symbol, price, volume, …).
 * Requests are chunked to avoid URL length limits.
 */
export async function fetchBatchQuotes(symbols) {
  const unique = [...new Set(symbols.map(s => String(s || '').toUpperCase()).filter(Boolean))];
  const results = [];
  for (const chunk of chunkArray(unique, 25)) {
    const data = await getJson(`${stable()}/batch-quote-short?symbols=${chunk.join(',')}&apikey=${key()}`);
    results.push(...(Array.isArray(data) ? data : []));
  }
  return results;
}

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

// ─── Earnings surprises (PEAD / drift detection) ─────────────────────────────

/** Historical earnings surprises, newest-first. Each entry: { date, epsActual, epsEstimated, epsDifference, surprisePercentage }. */
export async function fetchEarningsHistory(ticker, { limit = 8 } = {}) {
  const url = `${stable()}/earnings-surprises?symbol=${encodeURIComponent(ticker)}&limit=${limit}&apikey=${key()}`;
  const data = await getJson(url);
  return Array.isArray(data) ? data : [];
}

/** Annual cash-flow statements, newest-first — needed for multi-year OCF durability in CFQ scoring. */
export async function fetchCashFlowAnnual(ticker, { limit = 4 } = {}) {
  const url = `${stable()}/cash-flow-statement?symbol=${encodeURIComponent(ticker)}&period=annual&limit=${limit}&apikey=${key()}`;
  const data = await getJson(url);
  return Array.isArray(data) ? data : [];
}

// ─── Screener (tool #5) ──────────────────────────────────────────────────────

/**
 * FMP screener — raw passthrough of the flags.
 * @param {Record<string, string|number>} filters — e.g. { marketCapLowerThan, volumeMoreThan, priceMoreThan }
 */
export async function screenStocks(filters = {}) {
  const qs = new URLSearchParams({ apikey: key() });
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === '') continue;
    qs.set(k, String(v));
  }
  const url = `${stable()}/company-screener?${qs.toString()}`;
  const data = await getJson(url);
  return Array.isArray(data) ? data : [];
}
