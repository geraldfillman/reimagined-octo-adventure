import { fetchIntradayPrices, fetchProfile, fetchQuote, fetchSharesFloat, fetchShortInterest } from '../../lib/fmp-client.mjs';
import { classifyDirectionalScore, confidenceFromScore, makeAgentSignal } from './schemas.mjs';
import { computeTransitionEntropyFromBars } from './entropy.mjs';
import { compactNumber, formatPercent } from './utils.mjs';

export async function runMicrostructureAgent(state) {
  if (state.asset_type === 'crypto') {
    return makeAgentSignal({
      agent: 'microstructure',
      signal: 'NEUTRAL',
      confidence: 0.15,
      summary: 'Crypto microstructure is not enabled in this first implementation slice.',
      warnings: ['Crypto market activity will use CoinGecko in a later phase.'],
      raw_data: {},
    });
  }

  const symbol = String(state.symbol || '').toUpperCase();
  const [quoteResult, profileResult, floatResult, shortResult, intradayResult] = await Promise.allSettled([
    fetchQuote(symbol),
    fetchProfile(symbol),
    fetchSharesFloat(symbol),
    fetchShortInterest(symbol),
    fetchIntradayPrices(symbol, { interval: '1min' }),
  ]);

  if (quoteResult.status !== 'fulfilled' || !quoteResult.value) {
    throw quoteResult.reason || new Error('No quote returned.');
  }

  const quote = quoteResult.value;
  const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
  const floatData = floatResult.status === 'fulfilled' ? floatResult.value : null;
  const shortData = shortResult.status === 'fulfilled' ? shortResult.value : null;
  const intradayRows = intradayResult.status === 'fulfilled' ? normalizeIntradayRows(intradayResult.value) : [];
  const entropy = computeTransitionEntropyFromBars(intradayRows, { lookback: 120 });

  const volume = Number(quote.volume);
  const avgVolume = Number(quote.avgVolume ?? quote.averageVolume ?? profile?.averageVolume);
  const volumeRatio = Number.isFinite(volume) && Number.isFinite(avgVolume) && avgVolume > 0 ? volume / avgVolume : null;
  const changePct = normalizePercent(quote.changesPercentage ?? quote.changePercentage ?? quote.changePercent);
  const marketCap = Number(quote.marketCap ?? profile?.marketCap);
  const beta = Number(profile?.beta);
  const floatShares = Number(floatData?.floatShares ?? floatData?.freeFloat);
  const shortInterest = Number(shortData?.shortInterest ?? shortData?.sharesShort);
  const shortPctFloat = Number.isFinite(shortInterest) && Number.isFinite(floatShares) && floatShares > 0
    ? (shortInterest / floatShares) * 100
    : Number(shortData?.shortPercentOfFloat ?? shortData?.shortInterestRatio);

  let score = 0;
  if (Number.isFinite(volumeRatio) && volumeRatio > 1.5 && changePct > 1) score += 0.8;
  if (Number.isFinite(volumeRatio) && volumeRatio > 1.5 && changePct < -1) score -= 0.8;
  if (Number.isFinite(changePct) && changePct > 2) score += 0.4;
  if (Number.isFinite(changePct) && changePct < -2) score -= 0.4;
  if (Number.isFinite(shortPctFloat) && shortPctFloat > 15) score -= 0.5;
  if (Number.isFinite(beta) && beta > 2) score -= 0.25;
  if (Number.isFinite(marketCap) && marketCap > 10_000_000_000 && Number.isFinite(volumeRatio) && volumeRatio >= 0.7) score += 0.25;

  const signal = classifyDirectionalScore(score, 0.35);
  const confidence = confidenceFromScore(score, { base: 0.24, scale: 0.18, max: 0.78 });

  return makeAgentSignal({
    agent: 'microstructure',
    signal,
    confidence,
    summary: `Volume ratio ${formatRatio(volumeRatio)}, price change ${formatPercent(changePct)}, short/float ${formatPercent(shortPctFloat)}, entropy ${entropy.level}.`,
    evidence: [
      `Volume: ${compactNumber(volume, 1)} vs avg ${compactNumber(avgVolume, 1)}`,
      `Market cap: ${compactNumber(marketCap, 1)}`,
      `Short percent float: ${formatPercent(shortPctFloat)}`,
      ...(entropy.score !== null ? [`Order-flow entropy: ${entropy.level} (${entropy.score}) from ${entropy.transitions} transitions`] : []),
    ],
    warnings: [
      ...(profileResult.status === 'rejected' ? [`Profile unavailable: ${profileResult.reason?.message || profileResult.reason}`] : []),
      ...(floatResult.status === 'rejected' ? [`Float unavailable: ${floatResult.reason?.message || floatResult.reason}`] : []),
      ...(shortResult.status === 'rejected' ? [`Short interest unavailable: ${shortResult.reason?.message || shortResult.reason}`] : []),
      ...(intradayResult.status === 'rejected' ? [`Intraday entropy unavailable: ${intradayResult.reason?.message || intradayResult.reason}`] : []),
    ],
    raw_data: {
      price: Number(quote.price ?? quote.open ?? 0) || null,
      change_pct: Number.isFinite(changePct) ? Number(changePct.toFixed(2)) : null,
      volume,
      avg_volume: Number.isFinite(avgVolume) ? avgVolume : null,
      volume_ratio: Number.isFinite(volumeRatio) ? Number(volumeRatio.toFixed(2)) : null,
      market_cap: Number.isFinite(marketCap) ? marketCap : null,
      beta: Number.isFinite(beta) ? beta : null,
      short_pct_float: Number.isFinite(shortPctFloat) ? Number(shortPctFloat.toFixed(2)) : null,
      order_flow_entropy_score: entropy.score,
      order_flow_entropy_level: entropy.level,
      order_flow_entropy_transitions: entropy.transitions,
      order_flow_entropy_method: entropy.method,
      order_flow_entropy_read: entropy.interpretation,
    },
  });
}

function normalizePercent(value) {
  if (typeof value === 'string') return Number(value.replace(/[%()]/g, ''));
  return Number(value);
}

function formatRatio(value) {
  return Number.isFinite(value) ? `${value.toFixed(2)}x` : 'N/A';
}

function normalizeIntradayRows(rows = []) {
  return rows
    .map(row => ({
      date: row.date || row.datetime || null,
      close: Number(row.close),
      volume: Number(row.volume),
    }))
    .filter(row => row.date && Number.isFinite(row.close) && Number.isFinite(row.volume))
    .sort((left, right) => String(left.date).localeCompare(String(right.date)));
}
