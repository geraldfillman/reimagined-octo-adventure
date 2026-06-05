const BENCHMARKS = Object.freeze({
  beneish: -2.22,
  altman: 1.81,
  sloanAbs: 0.25,
  piotroski: 6,
});

const METRIC_LABELS = Object.freeze({
  'beneish-watch': 'Beneish M-Score',
  'altman-distress': 'Altman Z-Score',
  'sloan-accruals': 'Sloan Accruals Ratio',
  'piotroski-weak': 'Piotroski F-Score',
});

export function computeBeneishMScore(annualRows) {
  const [current, prior] = requireTwoPeriods(annualRows);
  const dsri = ratio(safeRatio(current.netReceivables, current.revenue), safeRatio(prior.netReceivables, prior.revenue));
  const gmi = ratio(grossMargin(prior), grossMargin(current));
  const aqi = ratio(assetQuality(current), assetQuality(prior));
  const sgi = ratio(current.revenue, prior.revenue);
  const depi = ratio(depreciationRate(prior), depreciationRate(current));
  const sgai = ratio(safeRatio(current.sellingGeneralAndAdministrativeExpenses, current.revenue), safeRatio(prior.sellingGeneralAndAdministrativeExpenses, prior.revenue));
  const lvgi = ratio(safeRatio(current.totalDebt, current.totalAssets), safeRatio(prior.totalDebt, prior.totalAssets));
  const tata = safeRatio(Number(current.netIncome) - Number(current.operatingCashFlow), current.totalAssets);
  const components = {
    dsri,
    gmi,
    aqi,
    sgi,
    depi,
    sgai,
    lvgi,
    tata,
  };

  if (Object.values(components).some(value => !Number.isFinite(value))) {
    return unavailableMetric('beneish-watch', 'Beneish M-Score', components);
  }

  const value = -4.84
    + 0.92 * dsri
    + 0.528 * gmi
    + 0.404 * aqi
    + 0.892 * sgi
    + 0.115 * depi
    - 0.172 * sgai
    + 4.679 * tata
    - 0.327 * lvgi;

  return metric({
    id: 'beneish-watch',
    label: METRIC_LABELS['beneish-watch'],
    value,
    threshold: '> -2.22',
    flagged: value > BENCHMARKS.beneish,
    components,
    interpretation: value > BENCHMARKS.beneish
      ? 'Potential earnings-manipulation anomaly; requires filing review.'
      : 'No Beneish threshold breach.',
  });
}

export function computeAltmanZScore(annualRows) {
  const [current] = requireTwoPeriods(annualRows);
  const workingCapital = Number(current.totalCurrentAssets) - Number(current.totalCurrentLiabilities);
  const marketValueEquity = Number(current.marketCap);
  const components = {
    workingCapitalToAssets: safeRatio(workingCapital, current.totalAssets),
    retainedEarningsToAssets: safeRatio(current.retainedEarnings, current.totalAssets),
    ebitToAssets: safeRatio(current.operatingIncome ?? current.ebit, current.totalAssets),
    marketEquityToLiabilities: safeRatio(marketValueEquity, current.totalLiabilities),
    salesToAssets: safeRatio(current.revenue, current.totalAssets),
  };

  if (Object.values(components).some(value => !Number.isFinite(value))) {
    return unavailableMetric('altman-distress', 'Altman Z-Score', components);
  }

  const value = 1.2 * components.workingCapitalToAssets
    + 1.4 * components.retainedEarningsToAssets
    + 3.3 * components.ebitToAssets
    + 0.6 * components.marketEquityToLiabilities
    + 1.0 * components.salesToAssets;

  return metric({
    id: 'altman-distress',
    label: METRIC_LABELS['altman-distress'],
    value,
    threshold: '< 1.81',
    flagged: value < BENCHMARKS.altman,
    components,
    interpretation: value < BENCHMARKS.altman
      ? 'High financial-distress zone; verify liquidity and debt maturity disclosures.'
      : 'No Altman distress threshold breach.',
  });
}

export function computeSloanAccrualsRatio(annualRows) {
  const [current] = requireTwoPeriods(annualRows);
  const value = safeRatio(Number(current.netIncome) - Number(current.operatingCashFlow), current.totalAssets);
  if (!Number.isFinite(value)) {
    return unavailableMetric('sloan-accruals', 'Sloan Accruals Ratio', { value });
  }
  return metric({
    id: 'sloan-accruals',
    label: METRIC_LABELS['sloan-accruals'],
    value,
    threshold: 'abs(value) > 0.25',
    flagged: Math.abs(value) > BENCHMARKS.sloanAbs,
    components: {
      netIncome: numberOrNull(current.netIncome),
      operatingCashFlow: numberOrNull(current.operatingCashFlow),
      totalAssets: numberOrNull(current.totalAssets),
    },
    interpretation: Math.abs(value) > BENCHMARKS.sloanAbs
      ? 'Accruals exceed quality guardrail; earnings may not be cash-backed.'
      : 'No Sloan accruals threshold breach.',
  });
}

export function computePiotroskiFScore(annualRows) {
  const [current, prior] = requireTwoPeriods(annualRows);
  const roaCurrent = safeRatio(current.netIncome, current.totalAssets);
  const roaPrior = safeRatio(prior.netIncome, prior.totalAssets);
  const leverageCurrent = safeRatio(current.totalDebt, current.totalAssets);
  const leveragePrior = safeRatio(prior.totalDebt, prior.totalAssets);
  const currentRatioCurrent = safeRatio(current.totalCurrentAssets, current.totalCurrentLiabilities);
  const currentRatioPrior = safeRatio(prior.totalCurrentAssets, prior.totalCurrentLiabilities);
  const grossMarginCurrent = grossMargin(current);
  const grossMarginPrior = grossMargin(prior);
  const assetTurnoverCurrent = safeRatio(current.revenue, current.totalAssets);
  const assetTurnoverPrior = safeRatio(prior.revenue, prior.totalAssets);

  const components = {
    positiveNetIncome: Number(current.netIncome) > 0,
    positiveOperatingCashFlow: Number(current.operatingCashFlow) > 0,
    roaImproved: roaCurrent > roaPrior,
    operatingCashFlowAboveNetIncome: Number(current.operatingCashFlow) > Number(current.netIncome),
    leverageLower: leverageCurrent < leveragePrior,
    currentRatioHigher: currentRatioCurrent > currentRatioPrior,
    noDilution: shareCount(current) <= shareCount(prior),
    grossMarginHigher: grossMarginCurrent > grossMarginPrior,
    assetTurnoverHigher: assetTurnoverCurrent > assetTurnoverPrior,
  };
  const value = Object.values(components).filter(Boolean).length;

  return metric({
    id: 'piotroski-weak',
    label: METRIC_LABELS['piotroski-weak'],
    value,
    threshold: '< 6',
    flagged: value < BENCHMARKS.piotroski,
    components,
    interpretation: value < BENCHMARKS.piotroski
      ? 'Weak fundamental-strength profile; review whether deterioration is temporary or structural.'
      : 'No Piotroski weakness threshold breach.',
  });
}

export function scoreForensicDataset(dataset) {
  const metrics = [
    computeBeneishMScore(dataset.annual),
    computeAltmanZScore(dataset.annual),
    computeSloanAccrualsRatio(dataset.annual),
    computePiotroskiFScore(dataset.annual),
  ];
  const signalStatus = classifyForensicSeverity(metrics);
  return {
    symbol: dataset.symbol,
    companyName: dataset.companyName ?? dataset.symbol,
    signalStatus,
    signals: metrics.filter(item => item.flagged).map(item => item.id),
    metrics,
    provenance: dataset.provenance ?? null,
    warnings: dataset.warnings ?? [],
  };
}

export function classifyForensicSeverity(metrics) {
  const flags = metrics.filter(item => item.flagged);
  if (flags.length >= 3) return 'critical';
  if (flags.length >= 2 || flags.some(item => item.id === 'altman-distress')) return 'alert';
  if (flags.length === 1) return 'watch';
  return 'clear';
}

export function metricLabel(id) {
  return METRIC_LABELS[id] ?? id;
}

function metric({ id, label, value, threshold, flagged, components, interpretation }) {
  return Object.freeze({
    id,
    label,
    value: round(value),
    threshold,
    flagged,
    available: true,
    components: roundObject(components),
    interpretation,
  });
}

function unavailableMetric(id, label, components) {
  return Object.freeze({
    id,
    label,
    value: null,
    threshold: 'unavailable',
    flagged: false,
    available: false,
    components: roundObject(components),
    interpretation: 'Metric unavailable because required statement fields were missing or not finite.',
  });
}

function requireTwoPeriods(annualRows) {
  if (!Array.isArray(annualRows) || annualRows.length < 2) {
    throw new Error('Forensic scoring requires at least two annual periods.');
  }
  return annualRows;
}

function grossMargin(row) {
  if (Number.isFinite(Number(row.grossProfit))) return safeRatio(row.grossProfit, row.revenue);
  return safeRatio(Number(row.revenue) - Number(row.costOfRevenue), row.revenue);
}

function assetQuality(row) {
  return 1 - safeRatio(Number(row.totalCurrentAssets) + Number(row.propertyPlantEquipmentNet), row.totalAssets);
}

function depreciationRate(row) {
  const depreciation = Number(row.depreciationAndAmortization);
  const ppe = Number(row.propertyPlantEquipmentNet);
  return safeRatio(depreciation, depreciation + ppe);
}

function shareCount(row) {
  const weighted = Number(row.weightedAverageShsOut);
  if (Number.isFinite(weighted)) return weighted;
  return Number(row.commonStockIssued) || 0;
}

function ratio(numerator, denominator) {
  return safeRatio(numerator, denominator);
}

function safeRatio(numerator, denominator) {
  const n = Number(numerator);
  const d = Number(denominator);
  if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;
  return n / d;
}

function numberOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function round(value) {
  return Number.isFinite(Number(value)) ? Number(Number(value).toFixed(4)) : null;
}

function roundObject(obj) {
  return Object.fromEntries(
    Object.entries(obj ?? {}).map(([key, value]) => [
      key,
      typeof value === 'boolean' ? value : round(value),
    ]),
  );
}
