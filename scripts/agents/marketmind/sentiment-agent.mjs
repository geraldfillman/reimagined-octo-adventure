import { fetchStockNews } from '../../lib/fmp-client.mjs';
import { getApiKey, getBaseUrl } from '../../lib/config.mjs';
import { getJson } from '../../lib/fetcher.mjs';
import { classifyDirectionalScore, confidenceFromScore, makeAgentSignal } from './schemas.mjs';

const POSITIVE_TERMS = [
  'beat', 'beats', 'upgrade', 'upgraded', 'approval', 'approved', 'record', 'growth',
  'raises', 'raised', 'surge', 'wins', 'contract', 'partnership', 'profitable',
  'breakthrough', 'launch', 'strong',
];

const NEGATIVE_TERMS = [
  'miss', 'misses', 'downgrade', 'downgraded', 'probe', 'investigation', 'lawsuit',
  'recall', 'warning', 'cuts', 'cut', 'delay', 'delayed', 'falls', 'plunge',
  'bankruptcy', 'fraud', 'weak', 'loss', 'layoffs', 'halts',
];

export async function runSentimentAgent(state) {
  const symbol = String(state.symbol || '').toUpperCase();
  const warnings = [];
  const articles = [];

  const fmpResult = await Promise.allSettled([fetchStockNews(symbol, { limit: 12 })]);
  if (fmpResult[0].status === 'fulfilled') articles.push(...normalizeFmpArticles(fmpResult[0].value));
  else warnings.push(`FMP stock news unavailable: ${fmpResult[0].reason?.message || fmpResult[0].reason}`);

  const topic = state.company_name || state.thesis_name || symbol;
  const newsApiArticles = await fetchNewsApiArticles(topic, warnings);
  articles.push(...newsApiArticles);

  const unique = dedupeArticles(articles).slice(0, 20);
  if (!unique.length) {
    return makeAgentSignal({
      agent: 'sentiment',
      signal: 'NEUTRAL',
      confidence: 0.15,
      summary: 'No recent headlines were available for sentiment scoring.',
      warnings,
      raw_data: { headline_count: 0 },
    });
  }

  const scored = unique.map(article => ({ ...article, score: scoreHeadline(article.title) }));
  const netScore = scored.reduce((sum, article) => sum + article.score, 0);
  const signal = classifyDirectionalScore(netScore, 1.2);
  const confidence = confidenceFromScore(netScore, { base: 0.22, scale: 0.08, max: 0.75 });
  const positive = scored.filter(article => article.score > 0).length;
  const negative = scored.filter(article => article.score < 0).length;

  return makeAgentSignal({
    agent: 'sentiment',
    signal,
    confidence,
    summary: `${unique.length} headline(s): ${positive} positive, ${negative} negative, net score ${netScore}.`,
    evidence: scored.slice(0, 5).map(article => article.title),
    warnings,
    raw_data: {
      headline_count: unique.length,
      positive_count: positive,
      negative_count: negative,
      net_score: netScore,
      sample_headlines: scored.slice(0, 5).map(article => article.title),
    },
  });
}

async function fetchNewsApiArticles(topic, warnings) {
  let apiKey;
  try {
    apiKey = getApiKey('newsapi');
  } catch {
    return [];
  }

  try {
    const baseUrl = getBaseUrl('newsapi');
    const params = new URLSearchParams({
      q: topic,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: '10',
      apiKey,
    });
    const data = await getJson(`${baseUrl}/everything?${params.toString()}`, { timeout: 15_000, retries: 2 });
    return (data.articles || []).map(article => ({
      title: article.title || '',
      source: article.source?.name || 'NewsAPI',
      published_at: article.publishedAt || null,
      url: article.url || null,
    })).filter(article => article.title);
  } catch (error) {
    warnings.push(`NewsAPI unavailable: ${error.message}`);
    return [];
  }
}

function normalizeFmpArticles(articles) {
  return (Array.isArray(articles) ? articles : []).map(article => ({
    title: article.title || article.text || '',
    source: article.site || article.publisher || 'FMP',
    published_at: article.publishedDate || article.date || null,
    url: article.url || null,
  })).filter(article => article.title);
}

function dedupeArticles(articles) {
  const seen = new Set();
  const unique = [];
  for (const article of articles) {
    const key = article.title.toLowerCase().replace(/\W+/g, ' ').trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(article);
  }
  return unique;
}

function scoreHeadline(title) {
  const lower = String(title || '').toLowerCase();
  let score = 0;
  for (const term of POSITIVE_TERMS) if (lower.includes(term)) score += 1;
  for (const term of NEGATIVE_TERMS) if (lower.includes(term)) score -= 1;
  return score;
}
