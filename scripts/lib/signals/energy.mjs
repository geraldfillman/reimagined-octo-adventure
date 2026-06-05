/**
 * signals/energy.mjs — Energy sector signal evaluators
 *
 * Covers: oil price swings, electricity demand growth, generation capacity
 * vs load ratio, and regional grid load spikes.
 * Primary importer: pullers/eia.mjs
 */

import { createSignal } from './base.mjs';

/**
 * Evaluate oil price swing.
 * @param {number} currentPrice
 * @param {number} priorPrice
 * @returns {Signal|null}
 * @todo No active importer — reserved for future puller.
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
