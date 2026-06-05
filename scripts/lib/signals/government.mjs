/**
 * signals/government.mjs — Government contract and procurement signal evaluators
 *
 * Covers: large USASpending contract awards, large SAM.gov opportunities, and
 * NAICS-level opportunity clusters.
 * Primary importers: pullers/usaspending.mjs, pullers/sam.mjs
 */

import { createSignal } from './base.mjs';

/**
 * Evaluate large government contract award.
 * @param {number} amount — contract award amount in dollars
 * @param {string} recipient — recipient name
 * @param {string} agency — awarding agency
 * @returns {Signal|null}
 */
export function evaluateLargeContract(amount, recipient, agency) {
  if (amount == null) return null;

  if (amount >= 1e9) {
    return createSignal({
      id: 'LARGE_CONTRACT_AWARD',
      name: 'Large Contract Award',
      domain: 'government',
      severity: 'watch',
      value: amount / 1e6,
      threshold: 1000,
      message: `$${(amount / 1e9).toFixed(1)}B contract awarded to ${recipient} by ${agency}`,
      implications: [
        'Check if recipient is publicly traded',
        'Review agency spending trend for pattern',
        'Identify subcontractor ecosystem for secondary plays',
      ],
      related_domains: ['equities'],
    });
  }

  return null;
}

/**
 * Evaluate large government opportunity from SAM.gov.
 * @param {number|null} estimatedValue — estimated contract value in dollars
 * @returns {Signal|null}
 */
export function evaluateLargeOpportunity(estimatedValue) {
  if (estimatedValue == null) return null;

  if (estimatedValue >= 1e9) {
    return createSignal({
      id: 'SAM_MEGA_OPPORTUNITY',
      name: 'Mega Government Opportunity',
      domain: 'government',
      severity: 'critical',
      value: estimatedValue / 1e6,
      threshold: 1000,
      message: `Government opportunity estimated at $${(estimatedValue / 1e9).toFixed(1)}B — mega contract`,
      implications: [
        'Identify prime contractor candidates for equity plays',
        'Subcontractor ecosystem will mobilize — check thesis tickers',
        'Cross-reference with USASpending for follow-on patterns',
        'Check NAICS sector for concentrated government spending',
      ],
      related_domains: ['equities', 'macro'],
    });
  }

  if (estimatedValue >= 5e8) {
    return createSignal({
      id: 'SAM_LARGE_OPPORTUNITY',
      name: 'Large Government Opportunity',
      domain: 'government',
      severity: 'alert',
      value: estimatedValue / 1e6,
      threshold: 500,
      message: `Government opportunity estimated at $${(estimatedValue / 1e6).toFixed(0)}M — exceeds $500M threshold`,
      implications: [
        'Major contract — identify prime contractor candidates',
        'Check for related NAICS sector momentum',
        'Monitor for subcontractor ecosystem activity',
      ],
      related_domains: ['equities'],
    });
  }

  return null;
}

/**
 * Evaluate clustering of SAM.gov opportunities in a single NAICS code.
 * @param {number} count — number of opportunities
 * @param {string} naicsCode — NAICS code
 * @param {number} [windowDays=30] — observation window
 * @returns {Signal|null}
 */
export function evaluateOpportunityCluster(count, naicsCode, windowDays = 30) {
  if (count == null || count < 5) return null;

  if (count >= 10) {
    return createSignal({
      id: 'SAM_OPPORTUNITY_SURGE',
      name: 'Government Opportunity Surge',
      domain: 'government',
      severity: 'alert',
      value: count,
      threshold: 10,
      message: `${count} opportunities in NAICS ${naicsCode} over ${windowDays} days — spending surge`,
      implications: [
        `Government prioritizing NAICS ${naicsCode} — thesis-relevant spending`,
        'Cross-reference with USASpending awards for confirmation',
        'Monitor for follow-on contract patterns',
        'Check if thesis companies are positioned as prime contractors',
      ],
      related_domains: ['equities', 'macro'],
    });
  }

  return createSignal({
    id: 'SAM_OPPORTUNITY_CLUSTER',
    name: 'Government Opportunity Cluster',
    domain: 'government',
    severity: 'watch',
    value: count,
    threshold: 5,
    message: `${count} opportunities in NAICS ${naicsCode} over ${windowDays} days`,
    implications: [
      'Emerging government interest in this sector',
      'Watch for acceleration in next 30 days',
    ],
    related_domains: ['equities'],
  });
}
