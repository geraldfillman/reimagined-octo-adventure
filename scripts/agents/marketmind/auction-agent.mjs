import { fetchIntradayPrices, fetchDailyPrices, fetchQuote } from '../../lib/fmp-client.mjs';
import {
  approximateVolumeProfile,
  approximateTPOProfile,
  computeAnchoredVWAP,
  classifyAuctionState,
  describeLocation,
} from '../../lib/auction-math.mjs';
import { normalizeIntradayBars, groupBySession } from '../../lib/bars.mjs';
import { classifyDirectionalScore, confidenceFromScore, makeAgentSignal } from './schemas.mjs';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const _require = createRequire(import.meta.url);
const CONFIG = _require(resolve(__dirname, '../../config/strategy_thresholds.json'));

export async function runAuctionAgent(state) {
  if (state.asset_type === 'crypto') {
    return makeAgentSignal({
      agent: 'auction',
      signal: 'NEUTRAL',
      confidence: 0.1,
      summary: 'Auction market analysis is not applicable to crypto assets.',
      raw_data: {},
    });
  }

  const symbol = String(state.symbol || '').toUpperCase();
  const anchorDays = Number(state.auction_anchor_days) || CONFIG.auction.avwap_anchor_days_default;
  const anchorDate = daysAgo(anchorDays);

  const [quoteResult, intradayResult, dailyResult] = await Promise.allSettled([
    fetchQuote(symbol),
    fetchIntradayPrices(symbol, { interval: '1min' }),
    fetchDailyPrices(symbol, { from: anchorDate }),
  ]);

  const warnings = [];
  if (quoteResult.status === 'rejected')    warnings.push(`Quote unavailable: ${quoteResult.reason?.message}`);
  if (intradayResult.status === 'rejected') warnings.push(`Intraday bars unavailable: ${intradayResult.reason?.message}`);
  if (dailyResult.status === 'rejected')    warnings.push(`Daily bars unavailable: ${dailyResult.reason?.message}`);

  const quote       = quoteResult.status === 'fulfilled' ? quoteResult.value : null;
  const currentPrice = Number(quote?.price ?? quote?.open ?? 0) || null;

  // Use the most recent session's intraday bars for Volume Profile + TPO
  const rawIntraday    = intradayResult.status === 'fulfilled' ? intradayResult.value : [];
  const intradayBars   = normalizeIntradayBars(rawIntraday);
  const sessionMap     = groupBySession(intradayBars);
  const sessionDates   = [...sessionMap.keys()].sort().reverse();
  const latestSession  = sessionDates[0];
  const sessionBars    = latestSession ? (sessionMap.get(latestSession) || []) : [];

  const vp  = sessionBars.length >= 20 ? approximateVolumeProfile(sessionBars, CONFIG.auction.bin_size_pct) : null;
  const tpo = sessionBars.length >= 20 ? approximateTPOProfile(sessionBars, CONFIG.auction.bin_size_pct) : null;

  if (sessionBars.length < 20) warnings.push(`Only ${sessionBars.length} intraday bars available; VP/TPO skipped.`);

  // Anchored VWAP from daily bars
  const dailyBars = dailyResult.status === 'fulfilled' ? dailyResult.value : [];
  const avwap = dailyBars.length > 0 ? computeAnchoredVWAP(dailyBars, anchorDate) : null;

  if (!avwap) warnings.push(`Anchored VWAP unavailable (anchor: ${anchorDate}, bars: ${dailyBars.length}).`);

  // Auction state classification
  const auctionState = classifyAuctionState({
    currentPrice,
    vah:   vp?.vah   ?? null,
    val:   vp?.val   ?? null,
    poc:   vp?.poc   ?? null,
    avwap: avwap,
  });

  const locationDesc = describeLocation({
    currentPrice,
    vah:  vp?.vah  ?? null,
    val:  vp?.val  ?? null,
    poc:  vp?.poc  ?? null,
    avwap,
  });

  // Relative volume from quote
  const volume    = Number(quote?.volume);
  const avgVolume = Number(quote?.avgVolume ?? quote?.averageVolume);
  const volRatio  = Number.isFinite(volume) && Number.isFinite(avgVolume) && avgVolume > 0 ? volume / avgVolume : null;

  // Distance from AVWAP (%)
  const avwapDistPct = Number.isFinite(currentPrice) && Number.isFinite(avwap) && avwap > 0
    ? ((currentPrice - avwap) / avwap) * 100
    : null;

  // Score: positive = bullish auction setup, negative = bearish
  let score = 0;
  if (auctionState === 'bullish_acceptance') score += 1.0;
  else if (auctionState === 'failed_downside') score += 0.6;
  else if (auctionState === 'balance')         score += 0.0;
  else if (auctionState === 'failed_upside')   score -= 0.6;
  else if (auctionState === 'bearish_acceptance') score -= 1.0;

  if (Number.isFinite(volRatio) && volRatio > CONFIG.auction.relative_volume_breakout && score > 0) score += 0.3;
  if (Number.isFinite(volRatio) && volRatio > CONFIG.auction.relative_volume_breakout && score < 0) score -= 0.3;
  if (Number.isFinite(avwapDistPct) && Math.abs(avwapDistPct) > CONFIG.auction.avwap_distance_warn_pct) {
    warnings.push(`Price ${Math.abs(avwapDistPct).toFixed(1)}% from AVWAP — extended from anchor.`);
  }

  const signal     = classifyDirectionalScore(score, 0.45);
  const confidence = vp ? confidenceFromScore(score, { base: 0.22, scale: 0.16, max: 0.72 }) : 0.1;

  return makeAgentSignal({
    agent: 'auction',
    signal,
    confidence,
    summary: `Auction state: ${auctionState}. ${locationDesc}. Session bars: ${sessionBars.length}.`,
    evidence: [
      `Auction state: ${auctionState}`,
      vp  ? `VP — POC: ${vp.poc}, VAH: ${vp.vah}, VAL: ${vp.val}` : 'Volume Profile unavailable',
      tpo ? `TPO POC: ${tpo.tpo_poc}` : 'TPO unavailable',
      Number.isFinite(avwap) ? `AVWAP (${anchorDate}): ${avwap}` : 'AVWAP unavailable',
      Number.isFinite(volRatio) ? `Relative volume: ${volRatio.toFixed(2)}x` : 'Volume ratio N/A',
    ],
    warnings,
    raw_data: {
      auction_state:      auctionState,
      current_price:      currentPrice,
      poc:                vp?.poc  ?? null,
      vah:                vp?.vah  ?? null,
      val:                vp?.val  ?? null,
      tpo_poc:            tpo?.tpo_poc ?? null,
      avwap:              avwap,
      avwap_anchor:       anchorDate,
      avwap_dist_pct:     Number.isFinite(avwapDistPct) ? Number(avwapDistPct.toFixed(2)) : null,
      relative_volume:    Number.isFinite(volRatio) ? Number(volRatio.toFixed(2)) : null,
      session_date:       latestSession ?? null,
      session_bar_count:  sessionBars.length,
      daily_bar_count:    dailyBars.length,
    },
  });
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - Number(n || 0));
  return d.toISOString().slice(0, 10);
}
