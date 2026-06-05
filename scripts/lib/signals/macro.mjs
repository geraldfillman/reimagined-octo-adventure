/**
 * signals/macro.mjs — Macroeconomic signal evaluators
 *
 * Covers: yield curve, unemployment, initial claims, CPI, Fed balance sheet,
 * credit spreads, and overnight reverse repo facility.
 * Primary importer: pullers/fred.mjs
 */

import { createSignal } from './base.mjs';

/**
 * Evaluate yield curve signals.
 * @param {number} yield10y — 10-year Treasury yield
 * @param {number} yield2y — 2-year Treasury yield
 * @returns {Signal|null}
 */
export function evaluateYieldCurve(yield10y, yield2y) {
  if (yield10y == null || yield2y == null) return null;
  const spread = yield10y - yield2y;

  if (spread < 0) {
    return createSignal({
      id: 'YIELD_CURVE_INVERSION',
      name: 'Yield Curve Inverted',
      domain: 'macro',
      severity: 'critical',
      value: spread,
      threshold: 0,
      message: `Yield curve inverted: 10Y-2Y spread at ${spread.toFixed(2)}%`,
      implications: [
        'Recession risk elevated (12-18 month lead)',
        'Reduce cyclical equity exposure',
        'Monitor housing demand closely — rate-sensitive',
        'Consider defensive positioning: utilities, healthcare, treasuries',
      ],
      related_domains: ['housing', 'equities'],
    });
  }

  if (spread < 0.5) {
    return createSignal({
      id: 'YIELD_CURVE_FLATTENING',
      name: 'Yield Curve Flattening',
      domain: 'macro',
      severity: 'watch',
      value: spread,
      threshold: 0.5,
      message: `Yield curve flattening: 10Y-2Y spread at ${spread.toFixed(2)}%`,
      implications: [
        'Late-cycle dynamics forming',
        'Begin reviewing defensive positions',
        'Watch for further compression toward inversion',
      ],
      related_domains: ['housing', 'equities'],
    });
  }

  return null;
}

/**
 * Evaluate unemployment spike (Sahm Rule territory).
 * @param {number} currentRate — current unemployment rate
 * @param {number} priorRate — prior month unemployment rate
 * @returns {Signal|null}
 */
export function evaluateUnemploymentSpike(currentRate, priorRate) {
  if (currentRate == null || priorRate == null) return null;
  // Round to 1dp: unemployment is reported to 1 decimal place and raw
  // floating-point subtraction (e.g. 4.3 - 4.0) can produce 0.2999… which
  // falls below the 0.3 alert threshold and silently misses a valid signal.
  const change = Math.round((currentRate - priorRate) * 10) / 10;

  if (change >= 0.5) {
    return createSignal({
      id: 'UNEMPLOYMENT_SPIKE',
      name: 'Unemployment Spike (Sahm Rule)',
      domain: 'macro',
      severity: 'critical',
      value: change,
      threshold: 0.5,
      message: `Unemployment rose ${change.toFixed(1)}pp in one month (Sahm Rule territory)`,
      implications: [
        'Recession likely underway',
        'Fed likely to cut rates aggressively',
        'Housing demand at risk — monitor closely',
        'Consumer discretionary will weaken',
      ],
      related_domains: ['housing', 'equities'],
    });
  }

  if (change >= 0.3) {
    return createSignal({
      id: 'UNEMPLOYMENT_RISING',
      name: 'Unemployment Rising',
      domain: 'macro',
      severity: 'alert',
      value: change,
      threshold: 0.3,
      message: `Unemployment rose ${change.toFixed(1)}pp MoM — approaching Sahm threshold`,
      implications: [
        'Labor market softening',
        'Watch next month for confirmation',
        'Housing demand may weaken with lag',
      ],
      related_domains: ['housing'],
    });
  }

  return null;
}

/**
 * Evaluate initial claims trend.
 * @param {number} currentAvg — current 4-week moving average
 * @param {number} priorAvg — prior 4-week moving average
 * @returns {Signal|null}
 */
export function evaluateInitialClaims(currentAvg, priorAvg) {
  if (currentAvg == null || priorAvg == null || priorAvg === 0) return null;
  const pctChange = ((currentAvg - priorAvg) / priorAvg) * 100;

  if (pctChange >= 15) {
    return createSignal({
      id: 'INITIAL_CLAIMS_RISING',
      name: 'Initial Claims Rising',
      domain: 'macro',
      severity: 'alert',
      value: pctChange,
      threshold: 15,
      message: `Initial claims 4-week avg rose ${pctChange.toFixed(1)}%`,
      implications: [
        'Labor market weakening — layoffs accelerating',
        'Check sector-level claims for concentration',
        'Housing demand likely to soften in 1-2 months',
      ],
      related_domains: ['housing'],
    });
  }

  return null;
}

/**
 * Evaluate CPI inflation level.
 * @param {number} cpiYoY — CPI year-over-year percent change
 * @returns {Signal|null}
 */
export function evaluateCPI(cpiYoY) {
  if (cpiYoY == null) return null;

  if (cpiYoY > 3.5) {
    return createSignal({
      id: 'CPI_ABOVE_TARGET',
      name: 'CPI Above Target',
      domain: 'macro',
      severity: 'watch',
      value: cpiYoY,
      threshold: 3.5,
      message: `CPI running at ${cpiYoY.toFixed(1)}% YoY — above comfort zone`,
      implications: [
        'Fed likely to maintain hawkish stance',
        'Rates stay higher for longer',
        'Housing affordability remains pressured',
        'TIPS may outperform nominal treasuries',
      ],
      related_domains: ['housing', 'equities'],
    });
  }

  return null;
}

/**
 * Evaluate Fed balance sheet expansion or contraction.
 * @param {number} currentTotal — current total assets (millions)
 * @param {number} priorTotal — prior period total assets (millions)
 * @returns {Signal|null}
 */
export function evaluateFedBalanceSheet(currentTotal, priorTotal) {
  if (currentTotal == null || priorTotal == null) return null;
  const pctChange = ((currentTotal - priorTotal) / priorTotal) * 100;

  if (pctChange > 3) {
    return createSignal({
      id: 'FED_BALANCE_SHEET_EXPANDING',
      name: 'Fed Balance Sheet Expanding',
      domain: 'macro',
      severity: 'alert',
      value: pctChange,
      threshold: 3,
      message: `Fed total assets expanded ${pctChange.toFixed(1)}% in the period`,
      implications: [
        'Liquidity injection underway, risk assets likely supported',
        'Watch for asset inflation in equities and real estate',
        'Check Fed meeting minutes for policy intent',
      ],
      related_domains: ['equities', 'housing'],
    });
  }

  if (pctChange < -3) {
    return createSignal({
      id: 'FED_BALANCE_SHEET_CONTRACTING',
      name: 'Fed Balance Sheet Contracting',
      domain: 'macro',
      severity: 'alert',
      value: pctChange,
      threshold: -3,
      message: `Fed total assets contracted ${Math.abs(pctChange).toFixed(1)}% in the period`,
      implications: [
        'Quantitative tightening accelerating, risk assets face headwinds',
        'Credit conditions tightening — monitor spreads and lending standards',
        'Check Fed meeting minutes for pace of runoff guidance',
      ],
      related_domains: ['equities', 'housing'],
    });
  }

  if (Math.abs(pctChange) > 1) {
    return createSignal({
      id: 'FED_BALANCE_SHEET_SHIFT',
      name: 'Fed Balance Sheet Notable Shift',
      domain: 'macro',
      severity: 'watch',
      value: pctChange,
      threshold: 1,
      message: `Fed total assets shifted ${pctChange.toFixed(1)}% in the period`,
      implications: [
        'Monitor for trend continuation',
        'Check Fed meeting minutes for guidance',
      ],
      related_domains: ['equities', 'housing'],
    });
  }

  return null;
}

/**
 * Evaluate high yield credit spreads for stress or widening.
 * @param {number} currentSpread — current HY OAS spread (percent)
 * @param {number} priorSpread — prior period HY OAS spread (percent)
 * @returns {Signal|null}
 */
export function evaluateCreditSpreads(currentSpread, priorSpread) {
  if (currentSpread == null || priorSpread == null) return null;
  const change = currentSpread - priorSpread;

  if (change > 0.5) {
    return createSignal({
      id: 'CREDIT_SPREADS_WIDENING',
      name: 'Credit Spreads Widening',
      domain: 'macro',
      severity: 'alert',
      value: change,
      threshold: 0.5,
      message: `HY spread widened ${(change * 100).toFixed(0)}bps MoM`,
      implications: [
        'Credit stress rising, risk-off regime forming',
        'Watch for equity weakness to follow',
        'Reduce HY exposure',
      ],
      related_domains: ['equities', 'housing'],
    });
  }

  if (currentSpread > 5) {
    return createSignal({
      id: 'CREDIT_SPREADS_ELEVATED',
      name: 'Credit Spreads Elevated',
      domain: 'macro',
      severity: 'alert',
      value: currentSpread,
      threshold: 5,
      message: `HY spread at ${currentSpread.toFixed(2)}% — distressed territory`,
      implications: [
        'Default risk elevated, recession pricing underway',
        'Flight to quality underway',
        'Review HY bond and leveraged loan exposure',
      ],
      related_domains: ['equities', 'housing'],
    });
  }

  if (change > 0.25) {
    return createSignal({
      id: 'CREDIT_SPREADS_DRIFTING',
      name: 'Credit Spreads Drifting Wider',
      domain: 'macro',
      severity: 'watch',
      value: change,
      threshold: 0.25,
      message: `HY spread drifted ${(change * 100).toFixed(0)}bps wider MoM`,
      implications: [
        'Monitor for acceleration',
        'Check corporate earnings for confirmation',
      ],
      related_domains: ['equities', 'housing'],
    });
  }

  return null;
}

/**
 * Evaluate Fed overnight reverse repo facility usage.
 * @param {number} currentUsage — current RRP usage (billions)
 * @param {number} priorUsage — prior period RRP usage (billions)
 * @returns {Signal|null}
 */
export function evaluateReverseRepo(currentUsage, priorUsage) {
  if (currentUsage == null || priorUsage == null) return null;
  const change = currentUsage - priorUsage;

  if (currentUsage < 100) {
    return createSignal({
      id: 'REVERSE_REPO_DEPLETED',
      name: 'Reverse Repo Facility Near Depleted',
      domain: 'macro',
      severity: 'alert',
      value: currentUsage,
      threshold: 100,
      message: `RRP facility near zero at $${currentUsage.toFixed(0)}bn`,
      implications: [
        'Liquidity buffer exhausted, Treasury issuance now drains reserves directly',
        'Watch for funding stress in money markets',
        'Monitor repo rates and SOFR for stress signals',
      ],
      related_domains: ['equities', 'housing'],
    });
  }

  if (change < -100) {
    return createSignal({
      id: 'REVERSE_REPO_DRAINING',
      name: 'Reverse Repo Draining Rapidly',
      domain: 'macro',
      severity: 'watch',
      value: change,
      threshold: -100,
      message: `RRP drained $${Math.abs(change).toFixed(0)}bn in period`,
      implications: [
        'Liquidity flowing into markets or Treasury bills',
        'Net positive for risk if absorbed smoothly',
        'Track pace — rapid depletion can precede funding stress',
      ],
      related_domains: ['equities', 'housing'],
    });
  }

  return null;
}
