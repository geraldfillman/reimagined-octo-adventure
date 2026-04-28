import { fetchDailyPrices, fetchProfile, fetchShortInterest } from '../../lib/fmp-client.mjs';
import {
  computeATR,
  maxDrawdown,
  normalizePriceSeries,
  percentChange,
  realizedVolatility,
  roundMetric,
  sharpeLike,
} from '../../lib/technical-indicators.mjs';
import { classifyDirectionalScore, confidenceFromScore, makeAgentSignal } from './schemas.mjs';
import { daysAgo, formatPercent } from './utils.mjs';

export async function runRiskAgent(state) {
  const symbol = String(state.symbol || '').toUpperCase();
  const [priceResult, profileResult, shortResult] = await Promise.allSettled([
    fetchDailyPrices(symbol, { from: daysAgo(420) }),
    state.asset_type === 'crypto' ? null : fetchProfile(symbol),
    state.asset_type === 'crypto' ? null : fetchShortInterest(symbol),
  ]);

  if (priceResult.status !== 'fulfilled') throw priceResult.reason;
  const rows = normalizePriceSeries(priceResult.value).slice(-260);
  if (rows.length < 30) {
    return makeAgentSignal({
      agent: 'risk',
      signal: 'NEUTRAL',
      confidence: 0.1,
      summary: `Only ${rows.length} bars were available for risk metrics.`,
      warnings: ['Insufficient price history for volatility and drawdown metrics.'],
      raw_data: { bars: rows.length },
    });
  }

  const vol30 = realizedVolatility(rows, 30);
  const vol90 = realizedVolatility(rows, 90);
  const drawdown = maxDrawdown(rows);
  const atr14 = computeATR(rows, 14);
  const change30d = percentChange(rows, 30);
  const sharpe = sharpeLike(rows, 90);
  const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
  const shortInterest = shortResult.status === 'fulfilled' ? shortResult.value : null;
  const beta = Number(profile?.beta);
  const daysToCover = Number(shortInterest?.daysToCover ?? shortInterest?.daysToCoverShort ?? shortInterest?.shortRatio);

  let score = 0;
  if (Number.isFinite(drawdown) && drawdown < -30) score -= 1.4;
  else if (Number.isFinite(drawdown) && drawdown < -18) score -= 0.9;
  else if (Number.isFinite(drawdown) && drawdown > -8) score += 0.4;
  if (Number.isFinite(vol30) && vol30 > 0.65) score -= 1;
  else if (Number.isFinite(vol30) && vol30 < 0.25) score += 0.35;
  if (Number.isFinite(change30d) && change30d < -10) score -= 0.7;
  if (Number.isFinite(change30d) && change30d > 8) score += 0.35;
  if (Number.isFinite(beta) && beta > 1.8) score -= 0.35;
  if (Number.isFinite(daysToCover) && daysToCover > 6) score -= 0.5;
  if (Number.isFinite(sharpe) && sharpe > 1) score += 0.4;
  if (Number.isFinite(sharpe) && sharpe < -0.5) score -= 0.4;

  const signal = classifyDirectionalScore(score, 0.45);
  const confidence = confidenceFromScore(score, { base: 0.3, scale: 0.17, max: 0.9 });

  return makeAgentSignal({
    agent: 'risk',
    signal,
    confidence,
    summary: `Risk read: 30d vol ${formatPercent(vol30 ? vol30 * 100 : null)}, max drawdown ${formatPercent(drawdown)}, 30d return ${formatPercent(change30d)}.`,
    evidence: [
      `Max drawdown: ${formatPercent(drawdown)}`,
      `30d realized volatility: ${formatPercent(vol30 ? vol30 * 100 : null)}`,
      `Sharpe-like score: ${roundMetric(sharpe, 2) ?? 'N/A'}`,
    ],
    warnings: [
      ...(profileResult.status === 'rejected' ? [`Profile unavailable: ${profileResult.reason?.message || profileResult.reason}`] : []),
      ...(shortResult.status === 'rejected' ? [`Short interest unavailable: ${shortResult.reason?.message || shortResult.reason}`] : []),
    ],
    raw_data: {
      bars: rows.length,
      realized_vol_30d: roundMetric(vol30, 4),
      realized_vol_90d: roundMetric(vol90, 4),
      max_drawdown_pct: roundMetric(drawdown, 2),
      atr14: roundMetric(atr14, 4),
      change_30d_pct: roundMetric(change30d, 2),
      sharpe_like_90d: roundMetric(sharpe, 2),
      beta: Number.isFinite(beta) ? beta : null,
      days_to_cover: Number.isFinite(daysToCover) ? daysToCover : null,
    },
  });
}
