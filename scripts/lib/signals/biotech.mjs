/**
 * signals/biotech.mjs — Biotech and pharmaceutical signal evaluators
 *
 * Covers: FDA approval clusters and Phase 3 clinical trial concentration.
 * Primary importers: pullers/fda.mjs, pullers/clinicaltrials.mjs
 */

import { createSignal } from './base.mjs';

/**
 * Evaluate FDA approval cluster.
 * @param {number} approvalCount — approvals in the window
 * @param {number} windowDays — lookback window
 * @returns {Signal|null}
 */
export function evaluateFDAApprovals(approvalCount, windowDays = 30) {
  if (approvalCount == null) return null;

  if (approvalCount >= 3) {
    return createSignal({
      id: 'FDA_APPROVAL_CLUSTER',
      name: 'FDA Approval Cluster',
      domain: 'biotech',
      severity: 'watch',
      value: approvalCount,
      threshold: 3,
      message: `${approvalCount} new drug approvals in past ${windowDays} days`,
      implications: [
        'Review therapy areas for concentrated activity',
        'Check sponsor companies for equity plays',
        'Monitor for competitive displacement effects',
      ],
      related_domains: ['equities'],
    });
  }

  return null;
}

/**
 * Evaluate Phase 3 industry-sponsored clinical trial concentration.
 * @param {number} count — number of Phase 3 industry trials in the pull
 * @param {string} area — therapeutic area label
 * @returns {Signal|null}
 */
export function evaluatePhase3Trials(count, area = 'biotech') {
  if (count == null) return null;

  if (count >= 5) {
    return createSignal({
      id: 'PHASE3_TRIAL_CLUSTER',
      name: 'Phase 3 Trial Cluster',
      domain: 'biotech',
      severity: 'alert',
      value: count,
      threshold: 5,
      message: `${count} Phase 3 industry-sponsored trials recruiting in ${area}`,
      implications: [
        'High commercial activity — review sponsor pipelines for near-term NDA/BLA risk',
        'Check for competing mechanisms that could compress trial outcomes',
        'Consider options activity around primary completion dates',
      ],
      related_domains: ['equities'],
    });
  }

  if (count >= 3) {
    return createSignal({
      id: 'PHASE3_TRIAL_CLUSTER',
      name: 'Phase 3 Trial Cluster',
      domain: 'biotech',
      severity: 'watch',
      value: count,
      threshold: 3,
      message: `${count} Phase 3 industry-sponsored trials recruiting in ${area}`,
      implications: [
        'Monitor sponsor companies for readout catalysts',
        'Review therapy area for M&A activity',
      ],
      related_domains: ['equities'],
    });
  }

  return null;
}
