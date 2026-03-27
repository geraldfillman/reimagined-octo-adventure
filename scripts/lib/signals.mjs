/**
 * signals.mjs — Signal evaluation engine
 *
 * Defines investment signal thresholds and evaluates data against them.
 * Each signal has: id, domain, severity levels, human-readable messages,
 * and actionable implications.
 *
 * Severity levels:
 *   clear    — no signal, normal conditions
 *   watch    — worth monitoring, no action yet
 *   alert    — actionable condition, review positions
 *   critical — urgent, immediate portfolio review needed
 */

/**
 * @typedef {object} Signal
 * @property {string} id
 * @property {string} name
 * @property {string} domain
 * @property {string} severity — 'watch' | 'alert' | 'critical'
 * @property {number} value — the actual measured value
 * @property {number} threshold — the threshold that was crossed
 * @property {string} message — human-readable description
 * @property {string[]} implications — actionable investment implications
 * @property {string[]} related_domains — other domains affected
 */

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
  const change = currentRate - priorRate;

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
 * Evaluate oil price swing.
 * @param {number} currentPrice
 * @param {number} priorPrice
 * @returns {Signal|null}
 */
export function evaluateOilPrice(currentPrice, priorPrice) {
  if (currentPrice == null || priorPrice == null || priorPrice === 0) return null;
  const pctChange = ((currentPrice - priorPrice) / priorPrice) * 100;

  if (Math.abs(pctChange) >= 15) {
    return createSignal({
      id: 'OIL_PRICE_SWING',
      name: 'Oil Price Swing',
      domain: 'energy',
      severity: 'alert',
      value: pctChange,
      threshold: 15,
      message: `Oil price moved ${pctChange.toFixed(1)}% MoM`,
      implications: [
        'Energy sector earnings revision likely',
        'Transportation cost pass-through in 1-2 quarters',
        'Review inflation expectations — energy feeds CPI',
      ],
      related_domains: ['macro', 'equities'],
    });
  }

  return null;
}

/**
 * Evaluate CPI shelter vs Case-Shiller divergence.
 * @param {number} cpiShelterYoY — CPI shelter component YoY %
 * @param {number} caseShillerYoY — Case-Shiller YoY %
 * @returns {Signal|null}
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

/**
 * Evaluate electricity demand growth year-over-year.
 * @param {number|null} currentMWh — current period total electricity sales (MWh)
 * @param {number|null} priorMWh — prior period total electricity sales (MWh)
 * @returns {Signal|null}
 */
export function evaluateElectricityDemandGrowth(currentMWh, priorMWh) {
  if (currentMWh == null || priorMWh == null || priorMWh === 0) return null;
  const pctChange = ((currentMWh - priorMWh) / priorMWh) * 100;

  if (pctChange > 5) {
    return createSignal({
      id: 'ELECTRICITY_DEMAND_SURGE',
      name: 'Electricity Demand Surge',
      domain: 'energy',
      severity: 'alert',
      value: pctChange,
      threshold: 5,
      message: `Electricity demand grew ${pctChange.toFixed(1)}% YoY — abnormal acceleration`,
      implications: [
        'Data center buildout driving grid stress',
        'Power infrastructure investment cycle beginning',
        'Review utility and grid equipment equities (GEV, ETN, VST)',
        'Watch for generation capacity announcements',
      ],
      related_domains: ['equities', 'energy'],
    });
  }

  if (pctChange > 2) {
    return createSignal({
      id: 'ELECTRICITY_DEMAND_RISING',
      name: 'Electricity Demand Rising',
      domain: 'energy',
      severity: 'watch',
      value: pctChange,
      threshold: 2,
      message: `Electricity demand up ${pctChange.toFixed(1)}% YoY — above historical trend`,
      implications: [
        'Monitor for sustained growth pattern',
        'Check regional concentration for bottleneck risk',
      ],
      related_domains: ['energy'],
    });
  }

  return null;
}

/**
 * Evaluate generation capacity vs load ratio.
 * @param {number|null} totalGeneration — total generation in MWh
 * @param {number|null} totalLoad — total load demand in MWh
 * @returns {Signal|null}
 */
export function evaluateGenerationGap(totalGeneration, totalLoad) {
  if (totalGeneration == null || totalLoad == null || totalLoad === 0) return null;
  const ratio = totalGeneration / totalLoad;

  if (ratio < 1.02) {
    return createSignal({
      id: 'GENERATION_CAPACITY_CRITICAL',
      name: 'Generation Capacity Critical',
      domain: 'energy',
      severity: 'critical',
      value: ratio,
      threshold: 1.02,
      message: `Generation/load ratio at ${ratio.toFixed(3)} — grid operating near capacity`,
      implications: [
        'Rolling blackout risk elevated',
        'Emergency generation pricing likely',
        'Critical infrastructure investment signal',
        'Review grid equipment and nuclear equities',
      ],
      related_domains: ['equities', 'energy', 'macro'],
    });
  }

  if (ratio < 1.05) {
    return createSignal({
      id: 'GENERATION_GAP_NARROWING',
      name: 'Generation Gap Narrowing',
      domain: 'energy',
      severity: 'alert',
      value: ratio,
      threshold: 1.05,
      message: `Generation/load ratio at ${ratio.toFixed(3)} — reserve margin thinning`,
      implications: [
        'Power pricing pressure building',
        'Peaker plants and storage becoming critical',
        'Watch for capacity auction results',
      ],
      related_domains: ['equities', 'energy'],
    });
  }

  return null;
}

/**
 * Evaluate regional grid load spike vs historical average.
 * @param {number|null} regionDemand — current regional demand (MWh)
 * @param {number|null} historicalAvg — historical average demand for this region (MWh)
 * @returns {Signal|null}
 */
export function evaluateRegionalLoadSpike(regionDemand, historicalAvg) {
  if (regionDemand == null || historicalAvg == null || historicalAvg === 0) return null;
  const ratio = regionDemand / historicalAvg;
  const pct = (ratio * 100).toFixed(1);

  if (ratio > 1.15) {
    return createSignal({
      id: 'REGIONAL_LOAD_SPIKE',
      name: 'Regional Load Spike',
      domain: 'energy',
      severity: 'alert',
      value: ratio,
      threshold: 1.15,
      message: `Regional load at ${pct}% of historical average — stress zone`,
      implications: [
        'Regional grid congestion likely',
        'Transmission constraints may trigger price spikes',
        'Check for data center or industrial expansion in region',
      ],
      related_domains: ['energy', 'equities'],
    });
  }

  if (ratio > 1.10) {
    return createSignal({
      id: 'REGIONAL_LOAD_ELEVATED',
      name: 'Regional Load Elevated',
      domain: 'energy',
      severity: 'watch',
      value: ratio,
      threshold: 1.10,
      message: `Regional load at ${pct}% of historical average — elevated`,
      implications: [
        'Monitor for sustained pattern',
        'May indicate new load source',
      ],
      related_domains: ['energy'],
    });
  }

  return null;
}

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

/**
 * Determine the highest severity from an array of signals.
 * @param {Signal[]} signals
 * @returns {string} — 'clear' | 'watch' | 'alert' | 'critical'
 */
export function highestSeverity(signals) {
  if (!signals || signals.length === 0) return 'clear';
  const order = { critical: 3, alert: 2, watch: 1 };
  const max = signals.reduce((highest, s) => {
    return (order[s.severity] || 0) > (order[highest] || 0) ? s.severity : highest;
  }, 'clear');
  return max;
}

/**
 * Format signals for inclusion in a markdown note.
 * @param {Signal[]} signals
 * @returns {string} — markdown content
 */
export function formatSignalsSection(signals) {
  if (!signals || signals.length === 0) {
    return '**Signal Status**: ⚪ Clear — no thresholds crossed.\n';
  }

  const severityIcon = { critical: '🔴', alert: '🟠', watch: '🟡' };
  const lines = [];

  for (const s of signals) {
    const icon = severityIcon[s.severity] || '⚪';
    lines.push(`### ${icon} ${s.name} (${s.severity.toUpperCase()})`);
    lines.push('');
    lines.push(s.message);
    lines.push('');
    lines.push('**Implications:**');
    for (const imp of (s.implications ?? [])) {
      lines.push(`- ${imp}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// --- Internal ---

function createSignal(fields) {
  return Object.freeze({
    id: fields.id,
    name: fields.name,
    domain: fields.domain,
    severity: fields.severity,
    value: fields.value,
    threshold: fields.threshold,
    message: fields.message,
    implications: Object.freeze([...fields.implications]),
    related_domains: Object.freeze([...(fields.related_domains || [])]),
    timestamp: new Date().toISOString(),
  });
}
