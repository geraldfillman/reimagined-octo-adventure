/**
 * signals/market.mjs — Options market and volatility signal evaluators
 *
 * Covers: equity put/call ratio, CBOE SKEW index, VIX term structure, and
 * unusual options activity.
 * Primary importers: pullers/cboe.mjs, pullers/fmp.mjs
 */

import { createSignal } from './base.mjs';

/**
 * Evaluate equity put/call ratio for fear or greed extremes.
 * @param {number|null} ratio — equity P/C ratio
 * @returns {Signal|null}
 */
export function evaluatePutCallRatio(ratio) {
  if (ratio == null) return null;

  if (ratio > 1.2) {
    return createSignal({
      id: 'PUT_CALL_EXTREME_FEAR',
      name: 'Put/Call Extreme Fear',
      domain: 'market',
      severity: 'alert',
      value: ratio,
      threshold: 1.2,
      message: `Equity P/C ratio at ${ratio.toFixed(2)} — extreme put buying (fear)`,
      implications: [
        'Contrarian bullish signal if sentiment peaks',
        'Check for capitulation volume',
        'Hedging demand elevated — institutions protecting downside',
      ],
      related_domains: ['equities'],
    });
  }

  if (ratio < 0.5) {
    return createSignal({
      id: 'PUT_CALL_EXTREME_GREED',
      name: 'Put/Call Extreme Greed',
      domain: 'market',
      severity: 'alert',
      value: ratio,
      threshold: 0.5,
      message: `Equity P/C ratio at ${ratio.toFixed(2)} — extreme call buying (complacency)`,
      implications: [
        'Contrarian bearish signal — crowded long positioning',
        'Gamma squeeze risk if market reverses',
        'Reduce leveraged long exposure',
      ],
      related_domains: ['equities'],
    });
  }

  if (ratio > 0.9) {
    return createSignal({
      id: 'PUT_CALL_ELEVATED_FEAR',
      name: 'Put/Call Elevated Fear',
      domain: 'market',
      severity: 'watch',
      value: ratio,
      threshold: 0.9,
      message: `Equity P/C ratio at ${ratio.toFixed(2)} — elevated hedging activity`,
      implications: [
        'Hedging activity increasing',
        'Monitor for trend continuation',
      ],
      related_domains: ['equities'],
    });
  }

  if (ratio < 0.6) {
    return createSignal({
      id: 'PUT_CALL_LOW_HEDGING',
      name: 'Put/Call Low Hedging',
      domain: 'market',
      severity: 'watch',
      value: ratio,
      threshold: 0.6,
      message: `Equity P/C ratio at ${ratio.toFixed(2)} — low hedging (complacency building)`,
      implications: [
        'Complacency building',
        'Market vulnerable to downside surprise',
      ],
      related_domains: ['equities'],
    });
  }

  return null;
}

/**
 * Evaluate CBOE SKEW Index for tail risk extremes.
 * @param {number|null} skew — SKEW index value
 * @returns {Signal|null}
 */
export function evaluateSkewIndex(skew) {
  if (skew == null) return null;

  if (skew > 150) {
    return createSignal({
      id: 'SKEW_TAIL_RISK_HIGH',
      name: 'SKEW Tail Risk High',
      domain: 'market',
      severity: 'alert',
      value: skew,
      threshold: 150,
      message: `CBOE SKEW at ${skew.toFixed(2)} — extreme tail risk pricing`,
      implications: [
        'Smart money buying crash protection',
        'Disconnect between VIX (calm) and SKEW (fear) is a warning',
        'Consider portfolio hedges or tail-risk strategies',
      ],
      related_domains: ['equities', 'macro'],
    });
  }

  if (skew < 110) {
    return createSignal({
      id: 'SKEW_COMPLACENCY',
      name: 'SKEW Complacency',
      domain: 'market',
      severity: 'watch',
      value: skew,
      threshold: 110,
      message: `CBOE SKEW at ${skew.toFixed(2)} — low tail risk pricing (complacency)`,
      implications: [
        'Cheap crash protection available',
        'Market not pricing downside scenarios',
        'Good entry for portfolio hedges',
      ],
      related_domains: ['equities'],
    });
  }

  return null;
}

/**
 * Evaluate VIX term structure (VIX vs VIX3M) for stress regime.
 * @param {number|null} vix — VIX spot close
 * @param {number|null} vix3m — VIX3M close
 * @returns {Signal|null}
 */
export function evaluateVIXTermStructure(vix, vix3m) {
  if (vix == null || vix3m == null) return null;
  const slope = vix3m - vix;

  if (slope < -2) {
    return createSignal({
      id: 'VIX_BACKWARDATION',
      name: 'VIX Term Structure Backwardation',
      domain: 'market',
      severity: 'alert',
      value: slope,
      threshold: -2,
      message: `VIX term structure inverted (VIX ${vix.toFixed(2)}, VIX3M ${vix3m.toFixed(2)}) — acute stress`,
      implications: [
        'Near-term fear exceeding long-term — acute event pricing',
        'Market expects volatility to resolve but current stress is high',
        'Short-vol strategies at risk — avoid selling near-term vol',
        'Check for catalyst: earnings, geopolitical, policy',
      ],
      related_domains: ['equities', 'macro'],
    });
  }

  if (slope < 0) {
    return createSignal({
      id: 'VIX_FLAT_TERM',
      name: 'VIX Term Structure Flat/Inverted',
      domain: 'market',
      severity: 'watch',
      value: slope,
      threshold: 0,
      message: `VIX term structure flat/slightly inverted (VIX ${vix.toFixed(2)}, VIX3M ${vix3m.toFixed(2)}) — elevated caution`,
      implications: [
        'Transition from calm to stress regime possible',
        'Monitor for deepening inversion',
      ],
      related_domains: ['equities'],
    });
  }

  return null;
}

/**
 * Evaluate unusual options activity (volume vastly exceeding open interest).
 * @param {number|null} volumeToOIRatio — highest volume/OI ratio in the chain
 * @returns {Signal|null}
 */
export function evaluateUnusualOptionsActivity(volumeToOIRatio) {
  if (volumeToOIRatio == null) return null;

  if (volumeToOIRatio >= 10) {
    return createSignal({
      id: 'UNUSUAL_OPTIONS_ACTIVITY',
      name: 'Unusual Options Activity',
      domain: 'market',
      severity: 'alert',
      value: volumeToOIRatio,
      threshold: 10,
      message: `Options volume ${volumeToOIRatio.toFixed(1)}x open interest — highly unusual activity`,
      implications: [
        'Likely informed trading or hedging ahead of catalyst',
        'Check earnings date, FDA decisions, or M&A rumors',
        'Cross-reference with put/call ratio for directional bias',
        'Consider whether flow is opening or closing positions',
      ],
      related_domains: ['equities'],
    });
  }

  if (volumeToOIRatio >= 5) {
    return createSignal({
      id: 'UNUSUAL_OPTIONS_ACTIVITY',
      name: 'Unusual Options Activity',
      domain: 'market',
      severity: 'watch',
      value: volumeToOIRatio,
      threshold: 5,
      message: `Options volume ${volumeToOIRatio.toFixed(1)}x open interest — elevated activity`,
      implications: [
        'Possible informed trading ahead of catalyst',
        'Check earnings date and news flow',
        'Cross-reference with put/call ratio for directional bias',
      ],
      related_domains: ['equities'],
    });
  }

  return null;
}
