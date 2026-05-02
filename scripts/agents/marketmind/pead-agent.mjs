import { fetchEarningsHistory, fetchDailyPrices } from '../../lib/fmp-client.mjs';
import { computeAnchoredVWAP } from '../../lib/auction-math.mjs';
import { classifyDirectionalScore, confidenceFromScore, makeAgentSignal } from './schemas.mjs';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const _require = createRequire(import.meta.url);
const CONFIG = _require(resolve(__dirname, '../../config/strategy_thresholds.json')).pead;

export async function runPeadAgent(state) {
  if (state.asset_type === 'crypto') {
    return makeAgentSignal({ agent: 'pead', signal: 'NEUTRAL', confidence: 0.05, summary: 'PEAD analysis not applicable to crypto.', raw_data: {} });
  }

  const symbol = String(state.symbol || '').toUpperCase();
  const lookbackDate = daysAgo(CONFIG.lookback_earnings_days);

  const [earningsResult, dailyResult] = await Promise.allSettled([
    fetchEarningsHistory(symbol, { limit: 8 }),
    fetchDailyPrices(symbol, { from: lookbackDate }),
  ]);

  const warnings = [];
  if (earningsResult.status === 'rejected') warnings.push(`Earnings history unavailable: ${earningsResult.reason?.message}`);
  if (dailyResult.status === 'rejected')    warnings.push(`Daily prices unavailable: ${dailyResult.reason?.message}`);

  const earningsHistory = earningsResult.status === 'fulfilled' ? earningsResult.value : [];
  const dailyBars       = dailyResult.status === 'fulfilled' ? dailyResult.value : [];

  // Find most recent earnings event within lookback window
  const recentEarnings = earningsHistory.find(e => {
    const d = String(e.date ?? e.reportedDate ?? '').slice(0, 10);
    return d >= lookbackDate && d <= today();
  });

  if (!recentEarnings) {
    return makeAgentSignal({
      agent: 'pead',
      signal: 'NEUTRAL',
      confidence: 0.1,
      summary: `No recent earnings within ${CONFIG.lookback_earnings_days} days for ${symbol}.`,
      warnings,
      raw_data: { symbol, earnings_in_window: earningsHistory.length },
    });
  }

  const earningsDate = String(recentEarnings.date ?? recentEarnings.reportedDate ?? '').slice(0, 10);
  const epsActual    = Number(recentEarnings.epsActual   ?? recentEarnings.eps);
  const epsEstimate  = Number(recentEarnings.epsEstimated ?? recentEarnings.epsEstimate);
  const surprisePct  = Number(recentEarnings.surprisePercentage ?? recentEarnings.epsDifference);

  // Derive surprise % if not directly available
  const computedSurprisePct = !Number.isFinite(surprisePct) && Number.isFinite(epsActual) && Number.isFinite(epsEstimate) && epsEstimate !== 0
    ? ((epsActual - epsEstimate) / Math.abs(epsEstimate)) * 100
    : surprisePct;

  // Anchored VWAP from earnings date
  const avwapFromEarnings = dailyBars.length > 0 ? computeAnchoredVWAP(dailyBars, earningsDate) : null;

  // Current price: most recent bar close (newest-first from FMP)
  const currentPrice = dailyBars.length > 0 ? Number(dailyBars[0]?.close) : null;

  const priceAboveEarningsAvwap = Number.isFinite(currentPrice) && Number.isFinite(avwapFromEarnings)
    ? currentPrice > avwapFromEarnings
    : null;

  const avwapDistPct = Number.isFinite(currentPrice) && Number.isFinite(avwapFromEarnings) && avwapFromEarnings > 0
    ? ((currentPrice - avwapFromEarnings) / avwapFromEarnings) * 100
    : null;

  // CFQ score from state (if fundamentals-agent already ran and passed it)
  const cfqScore = Number(state.cfq_score) || null;

  // PEAD label classification
  const peadLabel = classifyPeadLabel({
    surprisePct: computedSurprisePct,
    priceAboveEarningsAvwap,
    avwapDistPct,
    cfqScore,
    config: CONFIG,
  });

  // Score: positive = positive drift candidate, negative = negative drift
  let score = 0;
  if (Number.isFinite(computedSurprisePct)) {
    if (computedSurprisePct >= CONFIG.eps_surprise_positive_min_pct)   score += 0.8;
    else if (computedSurprisePct <= CONFIG.eps_surprise_negative_max_pct) score -= 0.8;
    else if (computedSurprisePct > 0)  score += 0.3;
    else                               score -= 0.3;
  }
  if (priceAboveEarningsAvwap === true)  score += 0.5;
  if (priceAboveEarningsAvwap === false) score -= 0.5;
  if (Number.isFinite(cfqScore) && cfqScore >= CONFIG.min_cfq_for_quality_drift) score += 0.3;

  if (Number.isFinite(avwapDistPct) && Math.abs(avwapDistPct) > CONFIG.avwap_distance_max_pct) {
    warnings.push(`Price ${Math.abs(avwapDistPct).toFixed(1)}% from earnings AVWAP — possible overreaction.`);
  }

  const signal     = classifyDirectionalScore(score, 0.5);
  const confidence = Number.isFinite(computedSurprisePct)
    ? confidenceFromScore(score, { base: 0.20, scale: 0.15, max: 0.70 })
    : 0.1;

  return makeAgentSignal({
    agent: 'pead',
    signal,
    confidence,
    summary: buildSummary(symbol, earningsDate, computedSurprisePct, peadLabel, priceAboveEarningsAvwap),
    evidence: [
      `Earnings date: ${earningsDate}`,
      Number.isFinite(computedSurprisePct) ? `EPS surprise: ${computedSurprisePct.toFixed(1)}%` : 'EPS surprise unavailable',
      Number.isFinite(avwapFromEarnings) ? `Earnings AVWAP: ${avwapFromEarnings}` : 'Earnings AVWAP unavailable',
      priceAboveEarningsAvwap !== null ? `Price ${priceAboveEarningsAvwap ? 'above' : 'below'} earnings AVWAP` : 'Price vs AVWAP unknown',
      Number.isFinite(cfqScore) ? `CFQ score: ${cfqScore}` : 'CFQ score not available',
    ],
    warnings,
    raw_data: {
      pead_label:               peadLabel,
      earnings_date:            earningsDate,
      eps_actual:               Number.isFinite(epsActual)   ? epsActual   : null,
      eps_estimate:             Number.isFinite(epsEstimate) ? epsEstimate : null,
      eps_surprise_pct:         Number.isFinite(computedSurprisePct) ? Number(computedSurprisePct.toFixed(2)) : null,
      avwap_from_earnings:      avwapFromEarnings,
      current_price:            currentPrice,
      price_above_earnings_avwap: priceAboveEarningsAvwap,
      avwap_dist_pct:           Number.isFinite(avwapDistPct) ? Number(avwapDistPct.toFixed(2)) : null,
      cfq_score_used:           cfqScore,
    },
  });
}

function classifyPeadLabel({ surprisePct, priceAboveEarningsAvwap, avwapDistPct, cfqScore, config }) {
  if (!Number.isFinite(surprisePct)) return 'insufficient_data';

  const positiveEarnings = surprisePct >= config.eps_surprise_positive_min_pct;
  const negativeEarnings = surprisePct <= config.eps_surprise_negative_max_pct;
  const highQuality = Number.isFinite(cfqScore) && cfqScore >= config.min_cfq_for_quality_drift;
  const extended = Number.isFinite(avwapDistPct) && Math.abs(avwapDistPct) > config.avwap_distance_max_pct;

  if (positiveEarnings && priceAboveEarningsAvwap === true  && highQuality) return 'quality_positive_drift_candidate';
  if (positiveEarnings && priceAboveEarningsAvwap === true)                 return 'positive_drift_candidate';
  if (positiveEarnings && priceAboveEarningsAvwap === false)                return 'failed_positive_surprise';
  if (negativeEarnings && priceAboveEarningsAvwap === false)                return 'negative_drift_candidate';
  if (negativeEarnings && priceAboveEarningsAvwap === true)                 return 'failed_negative_surprise';
  if (extended)                                                             return 'overreaction_watch';
  return 'neutral_earnings';
}

function buildSummary(symbol, earningsDate, surprisePct, label, aboveAvwap) {
  const surprise = Number.isFinite(surprisePct) ? `${surprisePct >= 0 ? '+' : ''}${surprisePct.toFixed(1)}% EPS surprise` : 'unknown surprise';
  const location = aboveAvwap === true ? 'above' : aboveAvwap === false ? 'below' : 'vs unknown';
  return `${symbol} earnings ${earningsDate}: ${surprise}. Price ${location} earnings AVWAP. Label: ${label}.`;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - Number(n || 0));
  return d.toISOString().slice(0, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
