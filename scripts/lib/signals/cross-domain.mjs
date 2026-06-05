/**
 * signals/cross-domain.mjs — Cross-domain signal evaluators
 *
 * Covers signals that span multiple investment domains: FEMA disaster
 * declaration spikes, CPI-housing price divergence, and patent filing velocity.
 * Primary importers: pullers/openfema.mjs, pullers/uspto.mjs
 */

import { createSignal } from './base.mjs';

/**
 * Evaluate FEMA disaster declaration spike.
 * @param {number} declarationCount — declarations in the window
 * @param {number} windowDays — lookback window
 * @returns {Signal|null}
 */
export function evaluateFEMASpike(declarationCount, windowDays = 60) {
  if (declarationCount == null) return null;

  if (declarationCount >= 5) {
    return createSignal({
      id: 'FEMA_SPIKE',
      name: 'FEMA Declaration Spike',
      domain: 'cross-domain',
      severity: 'alert',
      value: declarationCount,
      threshold: 5,
      message: `${declarationCount} FEMA disaster declarations in past ${windowDays} days`,
      implications: [
        'Regional housing risk elevated',
        'Insurance costs likely rising in affected areas',
        'Check affected metro housing data for price impact',
        'Construction demand may spike in recovery phase',
      ],
      related_domains: ['housing', 'energy'],
    });
  }

  return null;
}

/**
 * Evaluate CPI shelter vs Case-Shiller divergence.
 * @param {number} cpiShelterYoY — CPI shelter component YoY %
 * @param {number} caseShillerYoY — Case-Shiller YoY %
 * @returns {Signal|null}
 * @todo No active importer — reserved for future puller.
 */
export function evaluateCPIHousingDivergence(cpiShelterYoY, caseShillerYoY) {
  if (cpiShelterYoY == null || caseShillerYoY == null) return null;
  const gap = Math.abs(cpiShelterYoY - caseShillerYoY);

  if (gap >= 5) {
    return createSignal({
      id: 'CPI_HOUSING_DIVERGENCE',
      name: 'CPI-Housing Price Divergence',
      domain: 'cross-domain',
      severity: 'watch',
      value: gap,
      threshold: 5,
      message: `CPI Shelter (${cpiShelterYoY.toFixed(1)}%) and Case-Shiller (${caseShillerYoY.toFixed(1)}%) diverged by ${gap.toFixed(1)}pp YoY`,
      implications: [
        'Official inflation may be understating/overstating housing costs',
        'Fed policy response may lag reality',
        'Check rental indices (ZORI) for ground truth',
      ],
      related_domains: ['macro', 'housing'],
    });
  }

  return null;
}

/**
 * Evaluate patent filing velocity for a thesis topic.
 * @param {number} count — patents issued in the lookback window
 * @param {string} topic — topic label
 * @param {number} windowDays — lookback window in days
 * @returns {Signal|null}
 */
export function evaluatePatentVelocity(count, topic, windowDays = 90) {
  if (count == null) return null;

  if (count >= 75) {
    return createSignal({
      id: 'PATENT_SURGE',
      name: 'Patent Surge',
      domain: 'cross-domain',
      severity: 'alert',
      value: count,
      threshold: 75,
      message: `${count} patents issued in "${topic}" over last ${windowDays} days — arms-race level activity`,
      implications: [
        'Intense R&D competition — identify dominant assignees for equity plays',
        'IP moat forming — late entrants face rising litigation risk',
        'Check for blocking patents that could stall competitors',
        'M&A likely as incumbents seek patent portfolio protection',
      ],
      related_domains: ['equities', 'vc'],
    });
  }

  if (count >= 30) {
    return createSignal({
      id: 'PATENT_VELOCITY_HIGH',
      name: 'Patent Velocity Elevated',
      domain: 'cross-domain',
      severity: 'watch',
      value: count,
      threshold: 30,
      message: `${count} patents issued in "${topic}" over last ${windowDays} days — elevated R&D activity`,
      implications: [
        'Review top assignees for investment thesis confirmation',
        'Monitor for technology convergence signals',
        'Check if public companies are among top filers',
      ],
      related_domains: ['equities', 'vc'],
    });
  }

  if (count >= 10) {
    return createSignal({
      id: 'PATENT_VELOCITY_WATCH',
      name: 'Patent Activity Emerging',
      domain: 'cross-domain',
      severity: 'watch',
      value: count,
      threshold: 10,
      message: `${count} patents issued in "${topic}" over last ${windowDays} days — early-stage IP formation`,
      implications: [
        'Thesis may be entering commercialization phase',
        'Track assignees for startup/VC activity',
      ],
      related_domains: ['vc'],
    });
  }

  return null;
}
