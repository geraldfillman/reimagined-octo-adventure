/**
 * signals/housing.mjs — Housing market signal evaluators
 *
 * Covers: housing starts MoM change, mortgage rate spikes, and Case-Shiller
 * YoY price declines.
 * Primary importer: pullers/fred.mjs
 */

import { createSignal } from './base.mjs';

/**
 * Evaluate housing starts month-over-month change.
 * @param {number} current — current month housing starts (thousands)
 * @param {number} prior — prior month housing starts (thousands)
 * @returns {Signal|null}
 */
export function evaluateHousingStarts(current, prior) {
  if (current == null || prior == null || prior === 0) return null;
  const pctChange = ((current - prior) / prior) * 100;

  if (pctChange < -10) {
    return createSignal({
      id: 'HOUSING_STARTS_DROP',
      name: 'Housing Starts Sharp Decline',
      domain: 'housing',
      severity: 'alert',
      value: pctChange,
      threshold: -10,
      message: `Housing starts fell ${Math.abs(pctChange).toFixed(1)}% MoM`,
      implications: [
        'Builder pullback — check permits for confirmation',
        'Review homebuilder equities (ITB, XHB)',
        'May signal rate sensitivity or demand destruction',
        'Supply pipeline shrinking — future inventory constraint',
      ],
      related_domains: ['macro', 'equities'],
    });
  }

  return null;
}

/**
 * Evaluate mortgage rate spike.
 * @param {number} currentRate — current 30Y fixed rate
 * @param {number} priorRate — prior month 30Y fixed rate
 * @returns {Signal|null}
 */
export function evaluateMortgageRate(currentRate, priorRate) {
  if (currentRate == null || priorRate == null) return null;
  const change = currentRate - priorRate;

  if (change >= 0.5) {
    return createSignal({
      id: 'MORTGAGE_RATE_SPIKE',
      name: 'Mortgage Rate Spike',
      domain: 'housing',
      severity: 'alert',
      value: change,
      threshold: 0.5,
      message: `30Y mortgage rate jumped ${change.toFixed(2)}pp in one month to ${currentRate.toFixed(2)}%`,
      implications: [
        'Affordability shock — demand likely to compress',
        'Check existing home sales in 30-60 days for confirmation',
        'Refinance activity will drop sharply',
        'Builder stocks likely under pressure',
      ],
      related_domains: ['macro', 'equities'],
    });
  }

  return null;
}

/**
 * Evaluate Case-Shiller year-over-year decline.
 * @param {number} yoyChange — year-over-year percent change
 * @returns {Signal|null}
 * @todo No active importer — reserved for future puller.
 */
export function evaluateCaseShiller(yoyChange) {
  if (yoyChange == null) return null;

  if (yoyChange < -2) {
    return createSignal({
      id: 'CASE_SHILLER_DECLINING',
      name: 'Case-Shiller Declining',
      domain: 'housing',
      severity: 'alert',
      value: yoyChange,
      threshold: -2,
      message: `Case-Shiller index declining ${Math.abs(yoyChange).toFixed(1)}% YoY`,
      implications: [
        'Price correction underway',
        'Homeowner equity eroding — consumer wealth effect negative',
        'Watch for inventory surge as sellers try to lock in prices',
        'Mortgage delinquencies may rise with lag',
      ],
      related_domains: ['macro', 'equities'],
    });
  }

  return null;
}
