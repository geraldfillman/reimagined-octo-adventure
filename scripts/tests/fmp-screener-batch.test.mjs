import assert from 'node:assert/strict';

import {
  SCREEN_PRESETS,
  buildPresetDiagnostics,
  buildPresetNoteForTest,
  buildScreenerReviewSummaryNote,
  deriveFinancialSourceMetrics,
  enrichEtfCandidateFromPayloads,
  evaluateCandidateForPreset,
  rankPresetCandidates,
} from '../pullers/fmp-screener-batch.mjs';
import {
  SCREEN_PRESETS as REGISTRY_SCREEN_PRESETS,
  SCREENER_GROUPS,
  SECTOR_DEFAULTS,
  applyUniverseOverrides,
  describePresetFilters,
  resolveScreenerPresets,
} from '../config/tradingview-screener-registry.mjs';

function runTest(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

runTest('defines the FMP screener presets in implementation order', () => {
  const presetIds = SCREEN_PRESETS.map(preset => preset.id);
  assert.deepEqual(presetIds.slice(0, 19), [
      'cash-box-with-a-pulse',
      'negative-enterprise-value',
      'capital-light-compounders',
      'dividend-cockroach',
      'momentum-with-a-helmet',
      'net-net-ncav',
      'buyback-cannibal',
      'shareholder-yield-all-stars',
      'cash-flow-overlords',
      'chapter-11-avoidance',
      'low-vol-momentum',
      'fad-to-famine-retailer',
      'legacy-cpg-cash-cow',
      'invisible-micro-cap-orphan',
      'fresh-52-week-sinners',
      'deposit-stickiness-cults',
      'ffo-fountain-reits',
      'factor-cocktail-etfs',
      'fda-underdog',
  ]);
  assert.ok(presetIds.includes('replacement-cost-industrials'));
  assert.ok(presetIds.includes('spin-off-newborn'));
  assert.ok(presetIds.includes('mad-scientist-biotech'));
  assert.ok(presetIds.includes('bdc-coverage-bad-boy'));
  assert.ok(presetIds.includes('commodity-producer-divergence'));
  assert.equal(SCREEN_PRESETS.length, REGISTRY_SCREEN_PRESETS.length);
  assert.ok(SCREEN_PRESETS.length >= 45, 'remaining DOCX strategies should be represented in staged registry batches');
});

runTest('registry defines required screener groups and maps every preset to one', () => {
  assert.deepEqual(
    Object.keys(SCREENER_GROUPS).sort(),
    ['commodities', 'deep-value', 'distress', 'etf', 'events', 'financials', 'healthcare', 'momentum', 'quality', 'reit'].sort()
  );

  for (const preset of SCREEN_PRESETS) {
    assert.ok(preset.groups?.length, `${preset.id} should declare at least one group`);
    for (const group of preset.groups) {
      assert.ok(SCREENER_GROUPS[group]?.includes(preset.id), `${preset.id} missing from ${group}`);
    }
  }
});

runTest('registry exposes TradingView parity and manual overlays for each preset', () => {
  for (const preset of SCREEN_PRESETS) {
    const filterSummary = describePresetFilters(preset);
    assert.equal(typeof preset.id, 'string', `${preset.id} needs id`);
    assert.equal(typeof preset.title, 'string', `${preset.id} needs title`);
    assert.ok(preset.universe && typeof preset.universe === 'object', `${preset.id} needs universe`);
    assert.ok(Array.isArray(preset.tags) && preset.tags.length > 0, `${preset.id} needs tags`);
    assert.ok(Array.isArray(preset.fmpSources) && preset.fmpSources.length > 0, `${preset.id} needs FMP source mapping`);
    assert.ok(preset.noteDomain, `${preset.id} needs note domain`);
    assert.ok(filterSummary.automated.length > 0, `${preset.id} needs automated TradingView/FMP filters`);
    assert.ok(filterSummary.parity.length > 0, `${preset.id} needs TradingView parity field names`);
    assert.ok(filterSummary.manual.length > 0, `${preset.id} needs explicit manual overlay queue`);
    assert.ok(Array.isArray(preset.automated_filters), `${preset.id} needs automated_filters alias`);
    assert.ok(Array.isArray(preset.derived_filters), `${preset.id} needs derived_filters alias`);
    assert.ok(Array.isArray(preset.manual_overlays), `${preset.id} needs manual_overlays alias`);
    assert.ok(Array.isArray(preset.tradingview_parity), `${preset.id} needs tradingview_parity alias`);
  }
});

runTest('group, sector, and industry resolution keeps preset compatibility', () => {
  assert.deepEqual(resolveScreenerPresets({ preset: 'cash-box-with-a-pulse' }).map(p => p.id), ['cash-box-with-a-pulse']);
  assert.ok(resolveScreenerPresets({ group: 'deep-value' }).some(p => p.id === 'negative-enterprise-value'));
  assert.ok(resolveScreenerPresets({ group: 'reit' }).some(p => p.id === 'ffo-fountain-reits'));
  assert.throws(() => resolveScreenerPresets({ group: 'unknown-group' }), /Unknown --group/);

  const overridden = applyUniverseOverrides(
    { universe: { country: 'US', marketCapMoreThan: 1 } },
    { sector: 'Finance', industry: 'Regional banks' }
  );
  assert.equal(overridden.universe.sector, 'Financial Services');
  assert.equal(overridden.universe.industry, 'Regional Banks');
});

runTest('sector defaults include TradingView sector playbook metadata', () => {
  const finance = SECTOR_DEFAULTS.find(sector => sector.tradingViewSector === 'Finance');
  assert.ok(finance);
  assert.equal(finance.fmpSector, 'Financial Services');
  assert.ok(finance.filters.some(filter => filter.tradingViewField === 'Price to book ratio (P/B)'));
  assert.ok(finance.manualOverlays.some(item => /CET1|deposit/i.test(item)));
});

runTest('cash box preset requires net cash, cheap EV/EBITDA, FCF, and revenue', () => {
  const passing = evaluateCandidateForPreset('cash-box-with-a-pulse', {
    symbol: 'CASH',
    marketCap: 100_000_000,
    netCash: 55_000_000,
    evToEbitda: 3.2,
    freeCashFlow: 8_000_000,
    revenue: 60_000_000,
  });
  const failing = evaluateCandidateForPreset('cash-box-with-a-pulse', {
    symbol: 'DEBT',
    marketCap: 100_000_000,
    netCash: 10_000_000,
    evToEbitda: 3.2,
    freeCashFlow: 8_000_000,
    revenue: 60_000_000,
  });

  assert.equal(passing.passed, true);
  assert.equal(failing.passed, false);
  assert.match(failing.reason, /net cash/i);
});

runTest('negative enterprise value preset rejects positive EV names', () => {
  const passing = evaluateCandidateForPreset('negative-enterprise-value', {
    symbol: 'NEG',
    enterpriseValue: -20_000_000,
    currentRatio: 2.5,
    ebitda: 7_500_000,
    debtToEquity: 0.03,
  });
  const failing = evaluateCandidateForPreset('negative-enterprise-value', {
    symbol: 'POS',
    enterpriseValue: 30_000_000,
    currentRatio: 2.5,
    ebitda: 7_500_000,
    debtToEquity: 0.03,
  });

  assert.equal(passing.passed, true);
  assert.equal(failing.passed, false);
  assert.match(failing.reason, /enterprise value/i);
});

runTest('capital light preset enforces cash conversion and ROIC guardrails', () => {
  const passing = evaluateCandidateForPreset('capital-light-compounders', {
    symbol: 'CLIT',
    capexToRevenuePct: 2.5,
    fcfMarginPct: 18,
    fcfToNetIncomePct: 130,
    roicPct: 24,
    revenueGrowthPct: 8,
  });
  const failing = evaluateCandidateForPreset('capital-light-compounders', {
    symbol: 'CAPX',
    capexToRevenuePct: 9,
    fcfMarginPct: 18,
    fcfToNetIncomePct: 130,
    roicPct: 24,
    revenueGrowthPct: 8,
  });

  assert.equal(passing.passed, true);
  assert.equal(failing.passed, false);
  assert.match(failing.reason, /capex/i);
});

runTest('dividend and momentum presets apply their guardrails', () => {
  assert.equal(evaluateCandidateForPreset('dividend-cockroach', {
    symbol: 'DIV',
    dividendYieldPct: 4.5,
    fcfPayoutPct: 55,
    netDebtToEbitda: 1.8,
    dividendCut: false,
  }).passed, true);

  assert.equal(evaluateCandidateForPreset('momentum-with-a-helmet', {
    symbol: 'MOMO',
    return12mPct: 45,
    volatility1mPct: 12,
    netDebtToEbitda: 1.5,
    freeCashFlow: 10_000_000,
  }).passed, true);

  assert.equal(evaluateCandidateForPreset('momentum-with-a-helmet', {
    symbol: 'FRAG',
    return12mPct: 45,
    volatility1mPct: 12,
    netDebtToEbitda: 4.1,
    freeCashFlow: 10_000_000,
  }).passed, false);
});

runTest('ranking prefers stronger preset scores', () => {
  const ranked = rankPresetCandidates('cash-box-with-a-pulse', [
    { symbol: 'OK', marketCap: 100_000_000, netCash: 42_000_000, evToEbitda: 3.9, freeCashFlow: 4_000_000, revenue: 30_000_000 },
    { symbol: 'BEST', marketCap: 100_000_000, netCash: 80_000_000, evToEbitda: 1.8, freeCashFlow: 10_000_000, revenue: 80_000_000 },
  ]);

  assert.deepEqual(ranked.map(row => row.symbol), ['BEST', 'OK']);
  assert.ok(ranked[0].score > ranked[1].score);
});

runTest('first expansion value and capital return presets apply their guardrails', () => {
  assert.equal(evaluateCandidateForPreset('net-net-ncav', {
    symbol: 'NCAV',
    marketCap: 50_000_000,
    ncav: 80_000_000,
    totalDebt: 5_000_000,
    currentAssets: 60_000_000,
    positiveOperatingCashFlowYears: 3,
  }).passed, true);

  assert.equal(evaluateCandidateForPreset('buyback-cannibal', {
    symbol: 'BBUY',
    shareCountReduction3yPct: 12,
    fcfYieldPct: 10,
    sbcToRevenuePct: 1.5,
    netDebtToEbitda: 1.2,
    buybacksOffsetIssuance: false,
  }).passed, true);

  assert.equal(evaluateCandidateForPreset('shareholder-yield-all-stars', {
    symbol: 'YLD',
    shareholderYieldPct: 9,
    revenueCagr3yPct: 5,
    freeCashFlow: 100_000_000,
  }).passed, true);
});

runTest('cash-flow and distressed-improvement presets reject weak fundamentals', () => {
  assert.equal(evaluateCandidateForPreset('cash-flow-overlords', {
    symbol: 'CFO',
    ocfBeatsNetIncomeYears: 8,
    cumulativeFcf10y: 200_000_000,
    marketCap: 150_000_000,
    netDebtToEbitda: 0.2,
  }).passed, true);

  const weakCashFlow = evaluateCandidateForPreset('cash-flow-overlords', {
    symbol: 'MISS',
    ocfBeatsNetIncomeYears: 4,
    cumulativeFcf10y: 200_000_000,
    marketCap: 150_000_000,
    netDebtToEbitda: 0.2,
  });
  assert.equal(weakCashFlow.passed, false);
  assert.match(weakCashFlow.reason, /OCF/i);

  assert.equal(evaluateCandidateForPreset('chapter-11-avoidance', {
    symbol: 'SAVE',
    altmanZScore: 2.2,
    positiveOperatingCashFlowQuarters: 4,
    grossMarginImprovementPct: 2.5,
    netDebtToEbitdaImprovement: 0.8,
  }).passed, true);
});

runTest('second expansion momentum and turnaround presets apply their guardrails', () => {
  assert.equal(evaluateCandidateForPreset('low-vol-momentum', {
    symbol: 'CALM',
    return12mPct: 28,
    beta: 0.65,
    maxDrawdownPct: -11,
    dividendGrowthPct: 8,
    freeCashFlow: 50_000_000,
  }).passed, true);

  assert.equal(evaluateCandidateForPreset('fad-to-famine-retailer', {
    symbol: 'FAD',
    inventoryToSalesGrowthRatio: 1.8,
    drawdownFrom3yHighPct: -72,
    currentRatio: 2.5,
    grossMarginImprovementPct: 1.2,
  }).passed, true);

  assert.equal(evaluateCandidateForPreset('legacy-cpg-cash-cow', {
    symbol: 'CPG',
    revenueGrowthPct: -2.5,
    operatingMarginPct: 24,
    fcfYieldPct: 16,
    buybackYieldPct: 9,
  }).passed, true);
});

runTest('micro-cap orphan and fresh high presets enforce information and valuation constraints', () => {
  assert.equal(evaluateCandidateForPreset('invisible-micro-cap-orphan', {
    symbol: 'ORPH',
    marketCap: 80_000_000,
    dollarVolume: 40_000,
    analystCoverageCount: 0,
    insiderBuyCount: 3,
    insiderBuyValue: 150_000,
  }).passed, true);

  assert.equal(evaluateCandidateForPreset('fresh-52-week-sinners', {
    symbol: 'HIGH',
    daysSince52WeekHigh: 4,
    forwardPe: 14,
    sectorMedianForwardPe: 20,
    epsRevision90dPct: 6,
  }).passed, true);

  const expensiveHigh = evaluateCandidateForPreset('fresh-52-week-sinners', {
    symbol: 'RICH',
    daysSince52WeekHigh: 4,
    forwardPe: 30,
    sectorMedianForwardPe: 20,
    epsRevision90dPct: 6,
  });
  assert.equal(expensiveHigh.passed, false);
  assert.match(expensiveHigh.reason, /forward P\/E/i);
});

runTest('financials, REIT, ETF, and healthcare registry presets apply representative guardrails', () => {
  assert.equal(evaluateCandidateForPreset('deposit-stickiness-cults', {
    symbol: 'BANK',
    priceToBook: 0.95,
    returnOnEquityPct: 11,
    netMarginPct: 24,
    debtToEquity: 0.8,
  }).passed, true);

  assert.equal(evaluateCandidateForPreset('ffo-fountain-reits', {
    symbol: 'REIT',
    dividendPayoutPct: 62,
    debtToEbitda: 5.2,
    dividendYieldPct: 6.4,
    freeCashFlow: 100_000_000,
  }).passed, true);

  assert.equal(evaluateCandidateForPreset('factor-cocktail-etfs', {
    symbol: 'FCTR',
    isEtf: true,
    marketCap: 1_000_000_000,
    dollarVolume: 2_000_000,
    beta: 0.9,
  }).passed, true);

  assert.equal(evaluateCandidateForPreset('fda-underdog', {
    symbol: 'BIO',
    industry: 'Biotechnology',
    return1mPct: -58,
    cash: 180_000_000,
    marketCap: 150_000_000,
  }).passed, true);
});

runTest('new staged registry presets evaluate through generic filter rules', () => {
  assert.equal(evaluateCandidateForPreset('replacement-cost-industrials', {
    symbol: 'RPLC',
    priceToTangibleBook: 0.7,
    evToSales: 0.45,
    grossMarginPct: 22,
    operatingIncome: 10_000_000,
  }).passed, true);

  assert.equal(evaluateCandidateForPreset('spin-off-newborn', {
    symbol: 'SPIN',
    monthsSinceSpin: 12,
    netDebtToEbitda: 1.8,
    revenueGrowthPct: 4,
    insiderBuyValue: 250_000,
  }).passed, true);

  assert.equal(evaluateCandidateForPreset('mad-scientist-biotech', {
    symbol: 'LAB',
    industry: 'Biotechnology',
    cashRunwayQuarters: 8,
    rdToMarketCapPct: 30,
    marketCap: 450_000_000,
  }).passed, true);

  assert.equal(evaluateCandidateForPreset('bdc-coverage-bad-boy', {
    symbol: 'BDC',
    industry: 'Asset Management',
    priceToBook: 0.82,
    dividendYieldPct: 9,
    dividendCoveragePct: 115,
    debtToEquity: 0.9,
  }).passed, true);

  assert.equal(evaluateCandidateForPreset('commodity-producer-divergence', {
    symbol: 'MINE',
    sector: 'Basic Materials',
    fcfYieldPct: 8,
    netDebtToEbitda: 0.8,
    commodityReturn6mPct: 25,
    return6mPct: 2,
  }).passed, true);
});

runTest('financial statement payloads derive zero-hit source upgrade metrics', () => {
  const metrics = deriveFinancialSourceMetrics({
    marketCap: 100_000_000,
    enterpriseValue: 140_000_000,
    revenue: 280_000_000,
    ebitda: 56_000_000,
    operatingIncome: 40_000_000,
    freeCashFlow: 24_000_000,
    operatingCashFlow: 30_000_000,
    netIncome: 18_000_000,
    cash: 60_000_000,
    totalDebt: 35_000_000,
    totalAssets: 250_000_000,
    stockholdersEquity: 120_000_000,
    tangibleBook: 100_000_000,
    income: {
      revenue: 280_000_000,
      ebitda: 56_000_000,
      operatingIncome: 40_000_000,
      interestExpense: -8_000_000,
      researchAndDevelopmentExpenses: 10_000_000,
      weightedAverageShsOutDil: 10_000_000,
    },
    incomeQuarterly: [
      { revenue: 70_000_000, ebitda: 14_000_000, costOfRevenue: 42_000_000 },
      { revenue: 60_000_000, ebitda: 9_000_000, costOfRevenue: 39_000_000 },
    ],
    cashFlow: { dividendsPaid: -12_000_000 },
    cashFlowQuarterly: [
      { freeCashFlow: -15_000_000 },
      { freeCashFlow: -10_000_000 },
    ],
    balance: { inventory: 40_000_000 },
    balanceQuarterly: [
      { inventory: 40_000_000, netReceivables: 18_000_000, accountPayables: 21_000_000 },
      { inventory: 50_000_000, netReceivables: 20_000_000, accountPayables: 15_000_000 },
    ],
  });

  assert.equal(metrics.priceToTangibleBook, 1);
  assert.equal(metrics.evToSales, 0.5);
  assert.equal(metrics.inventoryToMarketCapPct, 40);
  assert.equal(metrics.debtToTangibleBookPct, 35);
  assert.equal(metrics.interestCoverage, 5);
  assert.equal(metrics.ebitdaMarginPct, 20);
  assert.equal(metrics.dividendCoveragePct, 200);
  assert.equal(metrics.cashRunwayQuarters, 4.8);
  assert.equal(metrics.liquidityRunwayMonths, 14.399999999999999);
  assert.equal(metrics.rdToMarketCapPct, 10);
  assert.equal(metrics.inventoryGrowthPct, -20);
  assert.equal(metrics.tceToAssetsPct, 40);
  assert.ok(metrics.cashConversionCycleImprovementDays > 40);
  assert.equal(metrics.netIncome, 18_000_000);
  assert.equal(metrics.operatingCashFlow, 30_000_000);
});

runTest('ETF enrichment derives concentration and source status from FMP-like payloads', () => {
  const enriched = enrichEtfCandidateFromPayloads({
    candidate: {
      symbol: 'FCTR',
      isEtf: true,
      marketCap: 1_000_000_000,
      price: 100,
      beta: 0.8,
    },
    info: {
      expenseRatio: 0.15,
      assetsUnderManagement: 2_500_000_000,
      nav: 101,
    },
    holders: [
      { asset: 'AAPL', weightPercentage: 12 },
      { asset: 'MSFT', weightPercentage: 10 },
      { asset: 'NVDA', weightPercentage: 8 },
      { asset: 'AMZN', weightPercentage: 7 },
      { asset: 'META', weightPercentage: 6 },
      { asset: 'GOOGL', weightPercentage: 5 },
      { asset: 'AVGO', weightPercentage: 4 },
      { asset: 'TSLA', weightPercentage: 3 },
      { asset: 'JPM', weightPercentage: 2 },
      { asset: 'LLY', weightPercentage: 1 },
      { asset: 'XOM', weightPercentage: 1 },
    ],
    sectorWeights: [
      { sector: 'Technology', weightPercentage: 42 },
      { sector: 'Healthcare', weightPercentage: 15 },
    ],
  });

  assert.equal(enriched.topTenHoldingWeightPct, 58);
  assert.equal(enriched.holdingCount, 11);
  assert.equal(enriched.navDiscountSourceStatus, 'live_nav');
  assert.equal(enriched.navDiscountPct, -0.99);
  assert.equal(enriched.expenseRatioPct, 0.15);
  assert.equal(enriched.aum, 2_500_000_000);
  assert.equal(enriched.topSectorWeightPct, 42);
  assert.equal(enriched.holdingConcentrationScore, 42);
});

runTest('zero-match notes include diagnostics and near misses', () => {
  const candidates = [
    {
      symbol: 'NEAR',
      companyName: 'Near Miss Inc',
      sector: 'Technology',
      isEtf: true,
      marketCap: 500_000_000,
      dollarVolume: 2_000_000,
      beta: 1.8,
    },
  ];
  const preset = SCREEN_PRESETS.find(item => item.id === 'factor-cocktail-etfs');
  const diagnostics = buildPresetDiagnostics(preset, candidates);
  const note = buildPresetNoteForTest(preset, [], {
    universeCount: 1,
    enrichedCandidates: candidates,
    diagnostics,
    nearMisses: diagnostics.nearMisses,
    limit: 10,
    flags: {},
  });

  assert.match(note, /## Screener Diagnostics/);
  assert.match(note, /Beta \(1Y\).*<= 1\.2/);
  assert.match(note, /## Near Misses/);
  assert.match(note, /NEAR/);
});

runTest('matched notes include screen read, richer match rows, and near misses', () => {
  const candidates = [
    {
      symbol: 'BEST',
      companyName: 'Best Cash Box',
      sector: 'Technology',
      marketCap: 100_000_000,
      netCash: 80_000_000,
      netCashPctOfMarketCap: 80,
      enterpriseValue: 20_000_000,
      evToEbitda: 1.8,
      freeCashFlow: 10_000_000,
      fcfYieldPct: 10,
      revenue: 80_000_000,
    },
    {
      symbol: 'NEAR',
      companyName: 'Near Cash Box',
      sector: 'Technology',
      marketCap: 100_000_000,
      netCashPctOfMarketCap: 39,
      enterpriseValue: 40_000_000,
      evToEbitda: 2,
      freeCashFlow: 8_000_000,
      revenue: 70_000_000,
    },
  ];
  const preset = SCREEN_PRESETS.find(item => item.id === 'cash-box-with-a-pulse');
  const diagnostics = buildPresetDiagnostics(preset, candidates);
  const ranked = rankPresetCandidates(preset.id, candidates);
  const note = buildPresetNoteForTest(preset, ranked, {
    universeCount: candidates.length,
    enrichedCandidates: candidates,
    diagnostics,
    nearMisses: diagnostics.nearMisses,
    limit: 10,
    flags: {},
  });

  assert.match(note, /## Screen Read/);
  assert.match(note, /Main bottleneck/);
  assert.match(note, /FCF Yield/);
  assert.match(note, /Data Gaps/);
  assert.match(note, /## Near Misses/);
  assert.match(note, /NEAR/);
  assert.match(note, /## Review Checklist/);
});

runTest('diagnostics count non-empty string metrics as present', () => {
  const preset = SCREEN_PRESETS.find(item => item.id === 'deposit-stickiness-cults');
  const diagnostics = buildPresetDiagnostics(preset, [
    {
      symbol: 'BANK',
      industry: 'Banks - Regional',
      priceToBook: 0.9,
      returnOnEquityPct: 12,
      netMarginPct: 20,
    },
  ]);
  const industryRow = diagnostics.filterRows.find(row => row.filter.metric === 'industry');

  assert.equal(industryRow.present, 1);
  assert.equal(industryRow.missing, 0);
  assert.equal(industryRow.passed, 1);
});

runTest('screener review summary ranks hits and source gaps with next actions', () => {
  const note = buildScreenerReviewSummaryNote([
    {
      preset: 'fresh-52-week-sinners',
      title: 'Fresh 52 Week Sinners',
      hits: 9,
      passed: 9,
      enriched: 20,
      bottleneck: 'Forward P/E < sector median',
      sourceGaps: [],
      nearMissCount: 3,
      file: '2026-05-24_FMP_Fresh_52_Week_Sinners_Screen.md',
    },
    {
      preset: 'etf-concentration-check',
      title: 'ETF Concentration Check',
      hits: 0,
      passed: 0,
      enriched: 20,
      bottleneck: 'Top 10 holding weight % < 60',
      sourceGaps: ['topTenHoldingWeightPct missing for 20'],
      nearMissCount: 10,
      file: '2026-05-24_FMP_ETF_Concentration_Check_Screen.md',
    },
  ]);

  assert.match(note, /## Action Queue/);
  assert.match(note, /fresh-52-week-sinners/);
  assert.match(note, /Promote hits to diligence/);
  assert.match(note, /etf-concentration-check/);
  assert.match(note, /Fix source coverage/);
});
