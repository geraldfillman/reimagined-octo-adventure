import { searchPredictionMarkets } from '../../lib/prediction-market-client.mjs';
import { classifyDirectionalScore, confidenceFromScore, makeAgentSignal } from './schemas.mjs';
import { extractKeywords } from './utils.mjs';

const POSITIVE_EVENT_TERMS = [
  'approve', 'approval', 'win', 'growth', 'cut rates', 'rate cut', 'etf approved',
  'above', 'higher', 'launch', 'contract', 'elected',
];

const NEGATIVE_EVENT_TERMS = [
  'recession', 'default', 'bankruptcy', 'ban', 'fail', 'war', 'attack', 'shutdown',
  'above 5%', 'rate hike', 'inflation', 'crash', 'delist', 'lawsuit',
];

export async function runPredictionMarketAgent(state) {
  const query = buildPredictionQuery(state);
  const { markets, warnings } = await searchPredictionMarkets({
    query,
    limit: Number(state.prediction_market_limit || 10),
    live: Boolean(state.live_prediction_markets),
  });

  if (!markets.length) {
    return makeAgentSignal({
      agent: 'prediction_market',
      signal: 'NEUTRAL',
      confidence: 0.12,
      summary: `No relevant prediction markets found for "${query}".`,
      warnings,
      raw_data: { query, market_count: 0, live_enabled: Boolean(state.live_prediction_markets) },
    });
  }

  const scored = markets.map(scoreMarket);
  const directional = scored.filter(row => row.direction !== 0 && Number.isFinite(row.probability));
  const netScore = directional.reduce((sum, row) => sum + row.direction * probabilityStrength(row.probability) * row.quality, 0);
  const signal = directional.length ? classifyDirectionalScore(netScore, 0.35) : 'NEUTRAL';
  const confidence = directional.length
    ? confidenceFromScore(netScore, { base: 0.2, scale: 0.18, max: 0.68 })
    : Math.min(0.4, 0.18 + scored.length * 0.03);

  const top = scored.slice(0, 5);
  return makeAgentSignal({
    agent: 'prediction_market',
    signal,
    confidence,
    summary: `${markets.length} prediction market(s) matched "${query}". Top venue: ${top[0]?.venue || 'N/A'}.`,
    evidence: top.map(row => `${row.venue}: ${row.title} (${formatProbability(row.probability)})`),
    warnings: [
      ...warnings,
      ...(!state.live_prediction_markets ? ['Live prediction-market APIs were disabled; local notes only.'] : []),
    ],
    raw_data: {
      query,
      live_enabled: Boolean(state.live_prediction_markets),
      market_count: markets.length,
      markets: top.map(row => ({
        venue: row.venue,
        title: row.title,
        probability: row.probability,
        volume: row.volume,
        liquidity: row.liquidity,
        close_time: row.close_time,
        url: row.url,
        source: row.source,
        polarity: row.polarity,
      })),
    },
  });
}

function buildPredictionQuery(state) {
  if (state.prediction_query) return String(state.prediction_query);
  const terms = extractKeywords([
    state.thesis_name,
    state.company_name,
    state.symbol,
    ...(Array.isArray(state.thesis_keywords) ? state.thesis_keywords : []),
  ]);
  return terms.slice(0, 6).join(' ') || String(state.symbol || 'market');
}

function scoreMarket(market) {
  const title = String(market.title || '').toLowerCase();
  const hasPositive = POSITIVE_EVENT_TERMS.some(term => title.includes(term));
  const hasNegative = NEGATIVE_EVENT_TERMS.some(term => title.includes(term));
  const direction = hasPositive && !hasNegative ? 1 : hasNegative && !hasPositive ? -1 : 0;
  const volumeQuality = Math.min(1, Math.log10(Math.max(10, Number(market.volume) || 10)) / 6);
  const liquidityQuality = Math.min(1, Math.log10(Math.max(10, Number(market.liquidity) || 10)) / 6);
  const quality = Math.max(0.25, (volumeQuality + liquidityQuality) / 2);
  return {
    ...market,
    direction,
    quality,
    polarity: direction > 0 ? 'positive-event' : direction < 0 ? 'negative-event' : 'context-only',
  };
}

function probabilityStrength(probability) {
  if (!Number.isFinite(probability)) return 0;
  return Math.abs(probability - 0.5) * 2;
}

function formatProbability(probability) {
  return Number.isFinite(probability) ? `${Math.round(probability * 100)}%` : 'N/A';
}
