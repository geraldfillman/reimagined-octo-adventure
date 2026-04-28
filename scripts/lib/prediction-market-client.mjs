/**
 * Read-only prediction-market client.
 *
 * This intentionally does not vendor or execute jon-becker/prediction-market-analysis.
 * It adapts the repo's Kalshi/Polymarket schema ideas into a small native client
 * and can also read local vault pull notes.
 */

import { join } from 'node:path';
import { getPullsDir } from './config.mjs';
import { fetchWithRetry } from './fetcher.mjs';
import { readFolder } from './frontmatter.mjs';

export async function searchPredictionMarkets({ query, limit = 12, live = false } = {}) {
  const warnings = [];
  const local = await searchLocalPredictionNotes(query, { limit });
  let liveMarkets = [];

  if (live) {
    const results = await Promise.allSettled([
      searchPolymarket(query, { limit }),
      searchKalshi(query, { limit }),
    ]);
    for (const result of results) {
      if (result.status === 'fulfilled') liveMarkets.push(...result.value);
      else warnings.push(result.reason?.message || String(result.reason));
    }
  }

  const markets = dedupeMarkets([...local, ...liveMarkets])
    .filter(market => isRelevantMarket(market, query))
    .sort((a, b) => relevanceScore(b, query) - relevanceScore(a, query))
    .slice(0, limit);

  return { markets, warnings };
}

export async function searchLocalPredictionNotes(query, { limit = 12 } = {}) {
  const roots = [
    join(getPullsDir(), 'Prediction_Markets'),
    join(getPullsDir(), 'Prediction Markets'),
    join(getPullsDir(), 'Market'),
  ];
  const notesByRoot = await Promise.all(roots.map(root => readFolder(root, true)));
  const terms = tokenize(query);
  const rows = [];

  for (const note of notesByRoot.flat()) {
    const text = `${note.filename} ${note.data?.title || ''} ${note.data?.source || ''} ${note.content || ''}`;
    const lower = text.toLowerCase();
    const isPredictionNote = lower.includes('kalshi') || lower.includes('polymarket') || lower.includes('prediction market');
    if (!isPredictionNote) continue;
    const matchCount = terms.filter(term => lower.includes(term)).length;
    if (terms.length && matchCount === 0) continue;
    rows.push({
      venue: String(note.data?.source || 'local'),
      title: String(note.data?.title || note.filename.replace(/\.md$/i, '')),
      probability: normalizeProbability(note.data?.probability ?? note.data?.implied_probability ?? note.data?.last_price),
      volume: Number(note.data?.volume ?? note.data?.volume_24h) || null,
      liquidity: Number(note.data?.liquidity ?? note.data?.open_interest) || null,
      close_time: note.data?.close_time || note.data?.end_date || null,
      url: note.data?.url || null,
      source: 'local_note',
      match_reason: `${matchCount || 'prediction'} local term match`,
      raw: { path: note.path, data_type: note.data?.data_type || null },
    });
  }

  return rows
    .sort((a, b) => relevanceScore(b, query) - relevanceScore(a, query))
    .slice(0, limit);
}

async function searchPolymarket(query, { limit }) {
  const params = new URLSearchParams({
    active: 'true',
    closed: 'false',
    limit: String(Math.min(Math.max(limit * 4, 20), 100)),
    order: 'volume',
    ascending: 'false',
  });
  if (query) params.set('search', query);
  const response = await fetchWithRetry(`https://gamma-api.polymarket.com/markets?${params.toString()}`, {
    timeout: 15_000,
    retries: 2,
  });
  if (!response.ok) throw new Error(`Polymarket HTTP ${response.status}`);
  const rows = Array.isArray(response.data) ? response.data : [];
  return rows.map(row => {
    const prices = parseJsonArray(row.outcomePrices ?? row.outcome_prices);
    const outcomes = parseJsonArray(row.outcomes);
    return {
      venue: 'Polymarket',
      title: row.question || row.title || row.slug || 'Polymarket market',
      probability: normalizeProbability(prices?.[0]),
      outcomes,
      volume: Number(row.volume ?? row.volumeNum) || null,
      liquidity: Number(row.liquidity ?? row.liquidityNum) || null,
      close_time: row.endDate ?? row.end_date ?? null,
      url: row.slug ? `https://polymarket.com/event/${row.slug}` : null,
      source: 'live_api',
      match_reason: 'Polymarket search result',
      raw: {
        id: row.id || null,
        condition_id: row.conditionId ?? row.condition_id ?? null,
      },
    };
  });
}

async function searchKalshi(query, { limit }) {
  const params = new URLSearchParams({
    status: 'open',
    limit: String(Math.min(Math.max(limit * 4, 20), 100)),
  });
  if (query) params.set('search', query);
  const response = await fetchWithRetry(`https://api.elections.kalshi.com/trade-api/v2/markets?${params.toString()}`, {
    timeout: 15_000,
    retries: 2,
  });
  if (!response.ok) throw new Error(`Kalshi HTTP ${response.status}`);
  const rows = Array.isArray(response.data?.markets) ? response.data.markets : [];
  return rows.map(row => ({
    venue: 'Kalshi',
    title: row.title || row.subtitle || row.ticker || 'Kalshi market',
    probability: normalizeKalshiPrice(row.last_price ?? row.yes_ask ?? row.yes_bid),
    volume: Number(row.volume ?? row.volume_24h) || null,
    liquidity: Number(row.open_interest) || null,
    close_time: row.close_time || null,
    url: row.ticker ? `https://kalshi.com/markets/${row.ticker}` : null,
    source: 'live_api',
    match_reason: 'Kalshi search result',
    raw: { ticker: row.ticker || null, event_ticker: row.event_ticker || null },
  }));
}

function relevanceScore(market, query) {
  const terms = expandedTerms(query);
  const text = `${market.title || ''} ${market.venue || ''}`.toLowerCase();
  const termScore = terms.filter(term => text.includes(term)).length * 10;
  const volumeScore = Math.log10(Math.max(1, Number(market.volume) || 1));
  const liquidityScore = Math.log10(Math.max(1, Number(market.liquidity) || 1)) * 0.5;
  return termScore + volumeScore + liquidityScore;
}

export function isRelevantMarket(market, query) {
  const terms = expandedTerms(query);
  if (!terms.length) return true;
  const text = `${market.title || ''} ${market.venue || ''} ${market.outcomes?.join(' ') || ''}`.toLowerCase();
  return terms.some(term => text.includes(term));
}

function expandedTerms(query) {
  const terms = tokenize(query);
  const aliases = new Set(terms);
  for (const term of terms) {
    if (term === 'btc') {
      aliases.add('bitcoin');
      aliases.add('satoshi');
    }
    if (term === 'eth') aliases.add('ethereum');
    if (term === 'spy') {
      aliases.add('s&p');
      aliases.add('spx');
      aliases.add('s&p 500');
    }
    if (term === 'fed') {
      aliases.add('fomc');
      aliases.add('federal reserve');
    }
  }
  return [...aliases];
}

function tokenize(query) {
  return String(query || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(term => term.length >= 3)
    .slice(0, 12);
}

function normalizeProbability(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  if (number > 1 && number <= 100) return number / 100;
  if (number >= 0 && number <= 1) return number;
  return null;
}

function normalizeKalshiPrice(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return normalizeProbability(number);
}

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function dedupeMarkets(markets) {
  const seen = new Set();
  const unique = [];
  for (const market of markets) {
    const key = `${market.venue}:${market.raw?.id || market.raw?.ticker || market.title}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(market);
  }
  return unique;
}
