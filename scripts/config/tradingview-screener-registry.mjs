const GROUP_ORDER = ['deep-value', 'quality', 'momentum', 'distress', 'events', 'financials', 'reit', 'etf', 'healthcare', 'commodities'];

export const SECTOR_DEFAULTS = Object.freeze([
  {
    tradingViewSector: 'Finance',
    fmpSector: 'Financial Services',
    aliases: ['finance', 'financials', 'financial services', 'banks', 'regional banks'],
    filters: [
      automatedFilter('Price to book ratio (P/B)', 'priceToBook', '<', 1.2, 'fmp.derived'),
      automatedFilter('Return on equity (ROE) (TTM)', 'returnOnEquityPct', '>', 10, 'fmp.ratios-ttm'),
      automatedFilter('Net margin %', 'netMarginPct', '>', 15, 'fmp.income-statement'),
    ],
    manualOverlays: [
      'CET1, NPL/NCO trend, deposit beta, uninsured deposit share, and CRE concentration from bank filings.',
    ],
  },
  {
    tradingViewSector: 'Finance',
    tradingViewIndustry: 'Real estate investment trusts',
    fmpSector: 'Real Estate',
    fmpIndustry: 'REIT',
    aliases: ['reit', 'reits', 'real estate investment trusts', 'real estate'],
    filters: [
      automatedFilter('Dividend payout ratio %', 'dividendPayoutPct', 'between', [50, 70], 'fmp.dividends+cash-flow'),
      automatedFilter('Debt to EBITDA ratio', 'debtToEbitda', '<', 6, 'fmp.key-metrics-ttm'),
      automatedFilter('Dividend yield %', 'dividendYieldPct', '>', 4, 'fmp.ratios-ttm'),
    ],
    manualOverlays: [
      'FFO/AFFO payout, same-store NOI, occupancy, WALT, NAV, cap rates, and debt maturities from REIT supplementals.',
    ],
  },
  {
    tradingViewSector: 'Health Technology',
    fmpSector: 'Healthcare',
    aliases: ['healthcare', 'health technology', 'biotech', 'biotechnology', 'pharma', 'pharmaceuticals'],
    filters: [
      automatedFilter('Industry', 'industry', 'contains', 'Biotechnology', 'fmp.profile'),
      automatedFilter('Performance % 1M', 'return1mPct', '<', -50, 'fmp.historical-price-eod'),
      automatedFilter('Cash and equivalents (FQ)', 'cash', '>', 'marketCap', 'fmp.balance-sheet-statement'),
    ],
    manualOverlays: [
      'Trial phase, FDA milestones, CRL/resubmission timing, patent edge, and partnership economics from FDA, ClinicalTrials.gov, and filings.',
    ],
  },
  {
    tradingViewSector: 'ETF',
    fmpSector: null,
    aliases: ['etf', 'fund', 'funds'],
    filters: [
      automatedFilter('Symbol type', 'isEtf', '=', true, 'fmp.company-screener'),
      automatedFilter('Price x average volume', 'dollarVolume', '>', 1_000_000, 'fmp.quote'),
      automatedFilter('Beta (1Y)', 'beta', '<=', 1.2, 'fmp.profile'),
    ],
    manualOverlays: [
      'Expense ratio, AUM, NAV premium/discount, creation/redemption activity, holdings overlap, and tracking difference from issuer data.',
    ],
  },
]);

export const EXTRA_SCREEN_PRESETS = Object.freeze([
  {
    id: 'deposit-stickiness-cults',
    title: 'Deposit Stickiness Cults',
    fileStem: 'FMP_Deposit_Stickiness_Cults_Screen',
    groups: ['financials'],
    tags: ['equities', 'screener', 'financials', 'banks', 'fmp'],
    universe: { country: 'US', sector: 'Financial Services', marketCapMoreThan: 300_000_000, priceMoreThan: 1, volumeMoreThan: 100_000 },
    criteria: [
      'TradingView Finance / Banks setup.',
      'P/B below 1.2x.',
      'ROE above 10%.',
      'Positive margin and manageable leverage.',
    ],
    filters: [
      automatedFilter('Industry', 'industry', 'contains', 'Bank', 'fmp.profile'),
      automatedFilter('Price to book ratio (P/B)', 'priceToBook', '<', 1.2, 'fmp.derived'),
      automatedFilter('Return on equity (ROE) (TTM)', 'returnOnEquityPct', '>', 10, 'fmp.ratios-ttm'),
      automatedFilter('Net margin %', 'netMarginPct', '>', 15, 'fmp.income-statement'),
      manualOverlay('Deposit beta, CET1, NPL/NCO trend, uninsured deposit share, AOCI, and CRE concentration.'),
    ],
  },
  {
    id: 'ffo-fountain-reits',
    title: 'FFO Fountain REITs',
    fileStem: 'FMP_FFO_Fountain_REITs_Screen',
    groups: ['reit', 'financials'],
    tags: ['equities', 'screener', 'reit', 'real-estate', 'income', 'fmp'],
    universe: { country: 'US', sector: 'Real Estate', industry: 'REIT', marketCapMoreThan: 300_000_000, priceMoreThan: 1, volumeMoreThan: 100_000 },
    criteria: [
      'TradingView Real Estate Investment Trust setup.',
      'Dividend payout ratio between 50% and 70%.',
      'Debt/EBITDA below 6x.',
      'Positive free cash flow and meaningful yield.',
    ],
    filters: [
      automatedFilter('Industry', 'industry', 'contains', 'REIT', 'fmp.profile'),
      automatedFilter('Dividend payout ratio %', 'dividendPayoutPct', 'between', [50, 70], 'fmp.dividends+cash-flow'),
      automatedFilter('Debt to EBITDA ratio', 'debtToEbitda', '<', 6, 'fmp.key-metrics-ttm'),
      automatedFilter('Dividend yield %', 'dividendYieldPct', '>', 4, 'fmp.ratios-ttm'),
      manualOverlay('FFO/AFFO payout, same-store NOI, occupancy, WALT, NAV, cap rates, and debt maturity ladder.'),
    ],
  },
  {
    id: 'factor-cocktail-etfs',
    title: 'Factor Cocktail ETFs',
    fileStem: 'FMP_Factor_Cocktail_ETFs_Screen',
    groups: ['etf'],
    tags: ['etf', 'screener', 'factor', 'wrapper', 'fmp'],
    universe: { country: 'US', isEtf: 'true', isFund: 'false', marketCapMoreThan: 100_000_000, priceMoreThan: 5, volumeMoreThan: 50_000 },
    criteria: [
      'TradingView Symbol type = ETF.',
      'Adequate market cap and liquidity.',
      'Beta not extreme for first-pass factor review.',
    ],
    filters: [
      automatedFilter('Symbol type', 'isEtf', '=', true, 'fmp.company-screener'),
      automatedFilter('Market capitalization', 'marketCap', '>', 100_000_000, 'fmp.company-screener'),
      automatedFilter('Price x average volume', 'dollarVolume', '>', 1_000_000, 'fmp.quote'),
      automatedFilter('Beta (1Y)', 'beta', '<=', 1.2, 'fmp.profile'),
      manualOverlay('Portfolio ROE, margins, tracking difference, benchmark deltas, expense ratio, AUM, and holdings concentration.'),
    ],
  },
  {
    id: 'fda-underdog',
    title: 'FDA Underdog',
    fileStem: 'FMP_FDA_Underdog_Screen',
    groups: ['healthcare', 'distress'],
    tags: ['equities', 'screener', 'healthcare', 'biotech', 'fda', 'fmp'],
    universe: { country: 'US', sector: 'Healthcare', marketCapMoreThan: 20_000_000, marketCapLowerThan: 3_000_000_000, priceMoreThan: 0.5, volumeMoreThan: 50_000 },
    criteria: [
      'Biotechnology or pharmaceuticals industry.',
      'One-month drawdown worse than 50%.',
      'Cash exceeds current market cap.',
    ],
    filters: [
      automatedFilter('Industry', 'industry', 'contains', 'Biotechnology / Pharmaceuticals', 'fmp.profile'),
      automatedFilter('Performance % 1M', 'return1mPct', '<', -50, 'fmp.historical-price-eod'),
      automatedFilter('Cash and equivalents (FQ)', 'cash', '>', 'marketCap', 'fmp.balance-sheet-statement'),
      manualOverlay('FDA CRL/resubmission timing, trial quality, upcoming readouts, runway, IP, and partnership economics.'),
    ],
  },
  strategyPreset('replacement-cost-industrials', 'Replacement-Cost Industrials', ['deep-value'], [
    automatedFilter('Price to tangible book', 'priceToTangibleBook', '<', 0.8, 'fmp.derived'),
    automatedFilter('EV/Revenue', 'evToSales', '<', 0.6, 'fmp.key-metrics-ttm'),
    automatedFilter('Gross margin %', 'grossMarginPct', '>', 15, 'fmp.income-statement'),
    automatedFilter('Operating income (TTM)', 'operatingIncome', '>', 0, 'fmp.income-statement'),
  ], ['Confirm tangible asset quality, replacement cost, and environmental liabilities from filings.'], { sector: 'Industrials', marketCapMoreThan: 50_000_000 }),
  strategyPreset('inventory-liquidation-value', 'Inventory Liquidation Value', ['deep-value', 'distress'], [
    automatedFilter('Price to tangible book', 'priceToTangibleBook', '<', 0.75, 'fmp.derived'),
    automatedFilter('Current ratio', 'currentRatio', '>', 2, 'fmp.ratios-ttm'),
    automatedFilter('Inventory / market cap', 'inventoryToMarketCapPct', '>', 30, 'fmp.balance-sheet-statement'),
    automatedFilter('Debt / tangible book', 'debtToTangibleBookPct', '<', 50, 'fmp.derived'),
  ], ['Verify inventory salability, markdown risk, and obsolete stock from filings.'], { marketCapMoreThan: 20_000_000, marketCapLowerThan: 2_000_000_000 }),
  strategyPreset('debt-paydown-redemption', 'Debt-Paydown Redemption Arc', ['deep-value', 'quality'], [
    automatedFilter('Debt to EBITDA ratio', 'netDebtToEbitdaImprovement', '>=', 1, 'fmp.derived'),
    automatedFilter('EBITDA interest coverage', 'interestCoverage', '>', 4, 'fmp.ratios-ttm'),
    automatedFilter('Free cash flow (TTM)', 'freeCashFlow', '>', 0, 'fmp.cash-flow-statement'),
    automatedFilter('EV/EBITDA', 'evToEbitdaVsPeerPct', '<', 75, 'manual.peer-set'),
  ], ['Confirm debt maturity ladder, covenants, and one-time asset-sale effects.'], { marketCapMoreThan: 100_000_000 }),
  strategyPreset('boring-oligopoly-printer', 'Boring Oligopoly Printer', ['quality'], [
    automatedFilter('ROIC (TTM)', 'roicPct', '>', 18, 'fmp.key-metrics-ttm'),
    automatedFilter('Gross margin %', 'grossMarginPct', '>', 35, 'fmp.income-statement'),
    automatedFilter('FCF / net income', 'fcfToNetIncomePct', '>', 90, 'fmp.derived'),
    automatedFilter('Revenue growth %', 'revenueCagr3yPct', '>', 4, 'fmp.income-statement'),
  ], ['Confirm industry concentration, pricing power, and share stability manually.'], { marketCapMoreThan: 500_000_000 }),
  strategyPreset('special-dividend-atm', 'Special Dividend ATM', ['quality', 'events'], [
    automatedFilter('Net cash / market cap', 'netCashPctOfMarketCap', '>', 30, 'fmp.derived'),
    automatedFilter('Capex / revenue', 'capexToRevenuePct', '<', 5, 'fmp.cash-flow-statement'),
    automatedFilter('Free cash flow (TTM)', 'freeCashFlow', '>', 0, 'fmp.cash-flow-statement'),
  ], ['Search 8-Ks and press releases for asset sales, tender language, or special dividend intent.'], { marketCapMoreThan: 100_000_000 }),
  strategyPreset('royalty-check-compounders', 'Royalty Check Compounders', ['quality'], [
    automatedFilter('EBITDA margin %', 'ebitdaMarginPct', '>', 45, 'fmp.income-statement'),
    automatedFilter('FCF / net income', 'fcfToNetIncomePct', '>', 85, 'fmp.derived'),
    automatedFilter('Debt to EBITDA ratio', 'netDebtToEbitda', '<', 1.5, 'fmp.key-metrics-ttm'),
    automatedFilter('Shareholder yield %', 'shareholderYieldPct', '>', 4, 'fmp.derived'),
  ], ['Verify royalty/licensing business model and contract durability.'], { marketCapMoreThan: 200_000_000 }),
  strategyPreset('spin-off-newborn', 'Spin-Off Newborn', ['events'], [
    automatedFilter('IPO offer date', 'monthsSinceSpin', '<=', 24, 'sec.news'),
    automatedFilter('Debt to EBITDA ratio', 'netDebtToEbitda', '<', 3, 'fmp.key-metrics-ttm'),
    automatedFilter('Revenue growth %', 'revenueGrowthPct', '>', 0, 'fmp.income-statement'),
    automatedFilter('Insider purchases', 'insiderBuyValue', '>', 0, 'fmp.insider-trading'),
  ], ['Review Form 10, separation agreements, parent overhang, and forced selling pressure.'], { marketCapMoreThan: 50_000_000 }),
  strategyPreset('parent-stub-discount', 'Parent-Stub Discount', ['events', 'deep-value'], [
    automatedFilter('Public stake / market cap', 'publicStakeToMarketCapPct', '>', 80, 'fmp.derived'),
    automatedFilter('Stub EV/EBIT', 'stubEvToEbit', '<', 5, 'manual.derived'),
  ], ['Compute listed stake value and review monetization path from filings.'], { marketCapMoreThan: 100_000_000 }),
  strategyPreset('tender-offer-spread', 'Tender Offer Spread', ['events'], [
    automatedFilter('Offer premium %', 'offerPremiumPct', '>', 5, 'sec.filings'),
    automatedFilter('Days to expiration', 'daysToExpiration', '<', 60, 'sec.filings'),
    automatedFilter('Annualized spread %', 'annualizedSpreadPct', '>', 8, 'fmp.derived'),
  ], ['Confirm proration, financing, withdrawal rights, and odd-lot treatment.'], { marketCapMoreThan: 50_000_000 }),
  strategyPreset('rights-offering-backstop', 'Rights Offering Backstop', ['events', 'distress'], [
    automatedFilter('Subscription discount %', 'subscriptionDiscountPct', '>', 20, 'sec.filings'),
    automatedFilter('Pro forma debt to EBITDA', 'proFormaDebtToEbitda', '<', 3, 'manual.derived'),
  ], ['Review backstop party, use of proceeds, transferability, and dilution math.'], { marketCapMoreThan: 20_000_000 }),
  strategyPreset('index-exile-bouncer', 'Index Exile Bouncer', ['events', 'deep-value'], [
    automatedFilter('Performance % 1M', 'indexDeletionDrawdownPct', '<', -15, 'fmp.historical-price-eod'),
    automatedFilter('EV/EBITDA vs peers', 'evToEbitdaVsPeerPct', '<', 75, 'manual.peer-set'),
    automatedFilter('Insider purchases', 'insiderBuyValue', '>', 0, 'fmp.insider-trading'),
  ], ['Confirm actual index deletion/rebalance event and no concurrent guide-down.'], { marketCapMoreThan: 100_000_000 }),
  strategyPreset('activist-calculator', 'Activist With a Calculator', ['events', 'quality'], [
    automatedFilter('Activist stake %', 'activistStakePct', '>', 5, 'sec.13d'),
    automatedFilter('Operating margin gap', 'marginGapVsPeerPct', '>', 5, 'manual.peer-set'),
    automatedFilter('EV/EBITDA vs peers', 'evToEbitdaVsPeerPct', '<', 75, 'manual.peer-set'),
  ], ['Review 13D plan, board pressure, sale/spin/cost path, and poison-pill risk.'], { marketCapMoreThan: 100_000_000 }),
  strategyPreset('ceo-boomerang-buy', 'CEO Boomerang Buy', ['events', 'momentum'], [
    automatedFilter('Drawdown from high', 'drawdownFrom3yHighPct', '<', -40, 'fmp.historical-price-eod'),
    automatedFilter('CEO insider buy value', 'ceoInsiderBuyValue', '>', 250_000, 'fmp.insider-trading'),
    automatedFilter('Liquidity runway months', 'liquidityRunwayMonths', '>', 24, 'fmp.derived'),
  ], ['Confirm returning CEO is founder/former operator and buy is open-market, not tax/option related.'], { marketCapMoreThan: 50_000_000 }),
  strategyPreset('kitchen-sink-reset', 'Kitchen-Sink Reset Quarter', ['events', 'distress'], [
    automatedFilter('Restructuring charge / market cap', 'restructuringChargeToMarketCapPct', '>', 10, 'sec.filings'),
    automatedFilter('Net income (TTM)', 'netIncome', '<', 0, 'fmp.income-statement'),
    automatedFilter('Gross margin change', 'grossMarginImprovementPct', '>=', 0, 'fmp.income-statement'),
  ], ['Review leadership change, guidance reset quality, and whether charges are truly one-time.'], { marketCapMoreThan: 50_000_000 }),
  strategyPreset('working-capital-houdini', 'Working-Capital Houdini', ['quality', 'events'], [
    automatedFilter('Cash conversion cycle improvement', 'cashConversionCycleImprovementDays', '>', 15, 'fmp.derived'),
    automatedFilter('Inventory growth %', 'inventoryGrowthPct', '<', 0, 'fmp.balance-sheet-statement'),
    automatedFilter('Operating cash flow', 'operatingCashFlow', '>', 0, 'fmp.cash-flow-statement'),
  ], ['Validate receivables quality, supplier stretch, and channel inventory.'], { marketCapMoreThan: 100_000_000 }),
  strategyPreset('mad-scientist-biotech', 'Mad Scientist Biotech', ['healthcare'], [
    automatedFilter('Industry', 'industry', 'contains', 'Biotechnology', 'fmp.profile'),
    automatedFilter('Cash runway quarters', 'cashRunwayQuarters', '>=', 6, 'fmp.derived'),
    automatedFilter('R&D / market cap', 'rdToMarketCapPct', '>', 20, 'fmp.income-statement'),
  ], ['Confirm trial phase, readout/FDA calendar, endpoint quality, and dilution risk.'], { sector: 'Healthcare', marketCapLowerThan: 3_000_000_000 }),
  strategyPreset('pipeline-with-a-pulse', 'Pipeline With a Pulse', ['healthcare'], [
    automatedFilter('Industry', 'industry', 'contains', 'Biotechnology', 'fmp.profile'),
    automatedFilter('Enterprise value', 'enterpriseValue', '<', 500_000_000, 'fmp.key-metrics-ttm'),
    automatedFilter('Cash runway quarters', 'cashRunwayQuarters', '>=', 6, 'fmp.derived'),
  ], ['Review ClinicalTrials.gov status, human efficacy language, and upcoming topline/FDA milestones.'], { sector: 'Healthcare', marketCapLowerThan: 1_000_000_000 }),
  strategyPreset('cash-runway-dilution-watch', 'Cash Runway Dilution Watch', ['healthcare', 'distress'], [
    automatedFilter('Cash runway quarters', 'cashRunwayQuarters', '<', 4, 'fmp.derived'),
    automatedFilter('R&D / market cap', 'rdToMarketCapPct', '>', 15, 'fmp.income-statement'),
    automatedFilter('Shelf capacity / market cap', 'shelfToMarketCapPct', '>', 20, 'sec.filings'),
  ], ['Use dilution-monitor and SEC filings to confirm ATM/shelf overhang.'], { sector: 'Healthcare', marketCapLowerThan: 2_000_000_000 }),
  strategyPreset('ugly-bank-clean-vault', 'Ugly Bank, Clean Vault', ['financials'], [
    automatedFilter('Price to book ratio (P/B)', 'priceToBook', '<', 0.85, 'fmp.derived'),
    automatedFilter('Return on equity (ROE)', 'returnOnEquityPct', '>', 6, 'fmp.ratios-ttm'),
    automatedFilter('Net margin %', 'netMarginPct', '>', 10, 'fmp.income-statement'),
  ], ['Manual bank overlay: CET1, NPAs, uninsured deposits, AOCI, CRE exposure, and deposit beta.'], { sector: 'Financial Services', marketCapMoreThan: 300_000_000 }),
  strategyPreset('insurance-float-discipline', 'Insurance Float Discipline', ['financials'], [
    automatedFilter('Price to book ratio (P/B)', 'priceToBook', '<', 1.3, 'fmp.derived'),
    automatedFilter('Debt to capital', 'debtToCapitalPct', '<', 25, 'fmp.derived'),
    automatedFilter('Return on equity (ROE)', 'returnOnEquityPct', '>', 0, 'fmp.ratios-ttm'),
  ], ['Manual insurer overlay: combined ratio, reserve development, catastrophe exposure, and investment portfolio risk.'], { sector: 'Financial Services', industry: 'Insurance' }),
  strategyPreset('tiny-thrift-conversion', 'Tiny Thrift Conversion', ['financials', 'deep-value'], [
    automatedFilter('Price to tangible book', 'priceToTangibleBook', '<', 0.85, 'fmp.derived'),
    automatedFilter('TCE / assets', 'tceToAssetsPct', '>', 10, 'manual.bank-filings'),
    automatedFilter('NPA ratio', 'npaRatioPct', '<', 1.5, 'manual.bank-filings'),
  ], ['Confirm mutual conversion timing, buyback eligibility, and local credit quality.'], { sector: 'Financial Services', marketCapLowerThan: 1_000_000_000 }),
  strategyPreset('affo-couch-potato-reit', 'AFFO Couch Potato REIT', ['reit', 'financials'], [
    automatedFilter('Industry', 'industry', 'contains', 'REIT', 'fmp.profile'),
    automatedFilter('Dividend yield %', 'dividendYieldPct', '>', 4, 'fmp.ratios-ttm'),
    automatedFilter('Debt to EBITDA ratio', 'debtToEbitda', '<', 6, 'fmp.key-metrics-ttm'),
  ], ['Manual REIT overlay: AFFO payout, NAV discount, occupancy, same-store NOI, WALT, and maturities.'], { sector: 'Real Estate', industry: 'REIT' }),
  strategyPreset('bdc-coverage-bad-boy', 'BDC Coverage Bad Boy', ['financials'], [
    automatedFilter('Industry', 'industry', 'contains', 'Asset Management', 'fmp.profile'),
    automatedFilter('Price to book ratio (P/B)', 'priceToBook', '<', 0.9, 'fmp.derived'),
    automatedFilter('Dividend yield %', 'dividendYieldPct', '>', 7, 'fmp.ratios-ttm'),
    automatedFilter('Dividend coverage %', 'dividendCoveragePct', '>', 100, 'manual.bdc-supplemental'),
  ], ['Manual BDC overlay: NII coverage, NAV trend, non-accruals, PIK income, and portfolio marks.'], { sector: 'Financial Services' }),
  strategyPreset('etf-concentration-check', 'ETF Concentration Check', ['etf'], [
    automatedFilter('Symbol type', 'isEtf', '=', true, 'fmp.company-screener'),
    automatedFilter('Market capitalization', 'marketCap', '>', 100_000_000, 'fmp.company-screener'),
    automatedFilter('Top 10 holding weight %', 'topTenHoldingWeightPct', '<', 60, 'fmp.etf-holdings'),
  ], ['Confirm expense ratio, AUM, benchmark fit, tracking difference, and holdings overlap.'], { isEtf: 'true', isFund: 'false' }),
  strategyPreset('etf-premium-discount-watch', 'ETF Premium Discount Watch', ['etf'], [
    automatedFilter('Symbol type', 'isEtf', '=', true, 'fmp.company-screener'),
    automatedFilter('Price x average volume', 'dollarVolume', '>', 1_000_000, 'fmp.quote'),
    automatedFilter('NAV discount %', 'navDiscountPct', '<', -2, 'fmp.etf-info'),
  ], ['Confirm NAV/premium-discount against issuer data when FMP ETF info is unavailable or stale; flows still require issuer or ETF analytics data.'], { isEtf: 'true', isFund: 'false' }),
  strategyPreset('carbon-cash-flow-contrarian', 'Carbon Cash Flow Contrarian', ['commodities', 'quality'], [
    automatedFilter('Sector', 'sector', 'contains', 'Energy', 'fmp.profile'),
    automatedFilter('P/FCF', 'fcfYieldPct', '>', 10, 'fmp.cash-flow-statement'),
    automatedFilter('Debt to EBITDA ratio', 'netDebtToEbitda', '<', 1.5, 'fmp.key-metrics-ttm'),
    automatedFilter('Shareholder yield %', 'shareholderYieldPct', '>', 8, 'fmp.derived'),
  ], ['Manual overlay: emissions trajectory, regulatory risk, reserve life, and capex discipline.'], { sector: 'Energy' }),
  strategyPreset('gold-miner-math', 'Gold Miner That Can Do Math', ['commodities'], [
    automatedFilter('Industry', 'industry', 'contains', 'Gold', 'fmp.profile'),
    automatedFilter('Debt to EBITDA ratio', 'netDebtToEbitda', '<', 1, 'fmp.key-metrics-ttm'),
    automatedFilter('P/FCF', 'fcfYieldPct', '>', 5, 'fmp.cash-flow-statement'),
    automatedFilter('EV/EBITDA vs peers', 'evToEbitdaVsPeerPct', '<', 100, 'manual.peer-set'),
  ], ['Manual overlay: AISC, reserve grade, jurisdiction, mine life, and acquisition discipline.'], { sector: 'Basic Materials' }),
  strategyPreset('commodity-producer-divergence', 'Commodity Producer Divergence', ['commodities', 'deep-value'], [
    automatedFilter('Sector', 'sector', 'contains', 'Basic Materials', 'fmp.profile'),
    automatedFilter('P/FCF', 'fcfYieldPct', '>', 5, 'fmp.cash-flow-statement'),
    automatedFilter('Debt to EBITDA ratio', 'netDebtToEbitda', '<', 1.5, 'fmp.key-metrics-ttm'),
    automatedFilter('Commodity return 6M', 'commodityReturn6mPct', '>', 'return6mPct', 'manual.commodity-feed'),
  ], ['Manual overlay: futures curve, realized prices, cost curve, AISC/cash costs, and hedge book.'], { sector: 'Basic Materials' }),
  strategyPreset('oilfield-survivor-backlog', 'Oilfield Survivor Backlog', ['commodities', 'quality'], [
    automatedFilter('Sector', 'sector', 'contains', 'Energy', 'fmp.profile'),
    automatedFilter('Revenue growth %', 'revenueGrowthPct', '>', 15, 'fmp.income-statement'),
    automatedFilter('EBITDA margin improvement', 'ebitdaMarginImprovementPct', '>', 3, 'fmp.income-statement'),
    automatedFilter('Debt to EBITDA ratio', 'netDebtToEbitda', '<', 2, 'fmp.key-metrics-ttm'),
  ], ['Manual overlay: backlog quality, day rates, customer concentration, and capex cycle risk.'], { sector: 'Energy' }),
  strategyPreset('commodity-etp-curve-carry', 'Commodity ETP Curve Carry', ['commodities', 'etf'], [
    automatedFilter('Symbol type', 'isEtf', '=', true, 'fmp.company-screener'),
    automatedFilter('Price x average volume', 'dollarVolume', '>', 1_000_000, 'fmp.quote'),
    automatedFilter('Roll yield %', 'rollYieldPct', '>', 0, 'manual.futures-curve'),
  ], ['Manual overlay: futures curve backwardation/contango, creation/redemption, issuer notes, and tax treatment.'], { isEtf: 'true', isFund: 'false' }),
]);

const BASE_PRESET_METADATA = Object.freeze({
  'cash-box-with-a-pulse': {
    groups: ['deep-value'],
    filters: [
      automatedFilter('Net cash / market cap', 'netCashPctOfMarketCap', '>', 40, 'fmp.balance-sheet-statement'),
      automatedFilter('Enterprise value to EBITDA ratio', 'evToEbitda', '<', 4, 'fmp.key-metrics-ttm'),
      automatedFilter('Free cash flow (TTM)', 'freeCashFlow', '>', 0, 'fmp.cash-flow-statement'),
      manualOverlay('Confirm restricted cash, lease obligations, and off-balance-sheet liabilities in filings.'),
    ],
  },
  'negative-enterprise-value': {
    groups: ['deep-value'],
    filters: [
      automatedFilter('Enterprise value', 'enterpriseValue', '<', 0, 'fmp.key-metrics-ttm'),
      automatedFilter('Current ratio', 'currentRatio', '>', 2, 'fmp.ratios-ttm'),
      automatedFilter('Debt to equity ratio', 'debtToEquity', '<', 0.1, 'fmp.ratios-ttm'),
      manualOverlay('Review fraud risk, off-balance-sheet liabilities, and liquidation value.'),
    ],
  },
  'capital-light-compounders': {
    groups: ['quality'],
    filters: [
      automatedFilter('Free cash flow margin %', 'fcfMarginPct', '>', 15, 'fmp.cash-flow-statement'),
      automatedFilter('Return on invested capital (ROIC) (TTM)', 'roicPct', '>', 20, 'fmp.key-metrics-ttm'),
      automatedFilter('Revenue growth %', 'revenueGrowthPct', '>', 5, 'fmp.income-statement'),
      manualOverlay('Validate recurring revenue, retention, pricing power, and stock-based compensation dilution.'),
    ],
  },
  'dividend-cockroach': {
    groups: ['quality', 'financials'],
    filters: [
      automatedFilter('Dividend yield %', 'dividendYieldPct', 'between', [3, 7], 'fmp.ratios-ttm'),
      automatedFilter('Cash dividend coverage ratio', 'fcfPayoutPct', 'between', [30, 70], 'fmp.dividends+cash-flow'),
      automatedFilter('Debt to EBITDA ratio', 'netDebtToEbitda', '<', 2.5, 'fmp.key-metrics-ttm'),
      manualOverlay('Confirm dividend cut history, maintenance capex, and payout sustainability from filings.'),
    ],
  },
  'momentum-with-a-helmet': {
    groups: ['momentum'],
    filters: [
      automatedFilter('Performance % 1Y', 'return12mPct', '>=', 20, 'fmp.historical-price-eod'),
      automatedFilter('Volatility', 'volatility1mPct', '<', 20, 'fmp.historical-price-eod'),
      automatedFilter('Debt to EBITDA ratio', 'netDebtToEbitda', '<', 3, 'fmp.key-metrics-ttm'),
      manualOverlay('Confirm that momentum is not only event/rumor driven and check liquidity regime.'),
    ],
  },
  'net-net-ncav': {
    groups: ['deep-value'],
    filters: [
      automatedFilter('P/B', 'ncav', 'derived', 'market cap < 80% of NCAV', 'fmp.balance-sheet-statement'),
      automatedFilter('Debt to assets', 'totalDebt', '<', '25% current assets', 'fmp.balance-sheet-statement'),
      manualOverlay('True NCAV, asset quality, liquidation discounts, and governance risk.'),
    ],
  },
  'buyback-cannibal': {
    groups: ['quality'],
    filters: [
      automatedFilter('Shares buyback ratio %', 'shareCountReduction3yPct', '>', 9, 'fmp.income-statement'),
      automatedFilter('P/FCF', 'fcfYieldPct', '>', 8, 'fmp.cash-flow-statement'),
      manualOverlay('Confirm repurchases are not offset by issuance or stock-based compensation.'),
    ],
  },
  'shareholder-yield-all-stars': {
    groups: ['quality'],
    filters: [
      automatedFilter('Dividend yield %', 'shareholderYieldPct', '>', 6, 'fmp.derived'),
      automatedFilter('Revenue growth %', 'revenueCagr3yPct', '>=', 0, 'fmp.income-statement'),
      manualOverlay('Compute net debt reduction yield and assess whether capital return is cyclical.'),
    ],
  },
  'cash-flow-overlords': {
    groups: ['quality'],
    filters: [
      automatedFilter('Free cash flow (TTM)', 'cumulativeFcf10y', '>', 'marketCap', 'fmp.cash-flow-statement'),
      automatedFilter('Debt to EBITDA ratio', 'netDebtToEbitda', '<', 0.5, 'fmp.key-metrics-ttm'),
      manualOverlay('Confirm ten-year cash-flow durability and accounting quality.'),
    ],
  },
  'chapter-11-avoidance': {
    groups: ['distress'],
    filters: [
      automatedFilter('Zmijewski score', 'altmanZScore', 'proxy', 'Altman Z 1.8-3.0', 'fmp.financial-scores'),
      automatedFilter('Gross margin %', 'grossMarginImprovementPct', '>', 0, 'fmp.income-statement'),
      manualOverlay('Debt maturity walls, covenants, restructuring charges, and liquidity runway.'),
    ],
  },
  'low-vol-momentum': {
    groups: ['momentum'],
    filters: [
      automatedFilter('Performance % 1Y', 'return12mPct', '>', 15, 'fmp.historical-price-eod'),
      automatedFilter('Beta (1Y)', 'beta', '<', 0.8, 'fmp.profile'),
      manualOverlay('Max drawdown and volatility are computed proxies; compare against peer set.'),
    ],
  },
  'fad-to-famine-retailer': {
    groups: ['distress'],
    filters: [
      automatedFilter('Industry', 'sector', '=', 'Consumer Cyclical', 'fmp.company-screener'),
      automatedFilter('Current ratio (FQ)', 'currentRatio', '>', 2.2, 'fmp.ratios-ttm'),
      manualOverlay('Inventory-to-sales, brand health, channel inventory, and restructuring evidence.'),
    ],
  },
  'legacy-cpg-cash-cow': {
    groups: ['quality'],
    filters: [
      automatedFilter('Revenue growth %', 'revenueGrowthPct', 'between', [-4, -1], 'fmp.income-statement'),
      automatedFilter('Operating margin %', 'operatingMarginPct', '>', 20, 'fmp.income-statement'),
      manualOverlay('Brand substitution risk and price/volume split from company commentary.'),
    ],
  },
  'invisible-micro-cap-orphan': {
    groups: ['deep-value'],
    filters: [
      automatedFilter('Market capitalization', 'marketCap', 'between', [20_000_000, 150_000_000], 'fmp.company-screener'),
      automatedFilter('Price x average volume', 'dollarVolume', '<', 50_000, 'fmp.quote'),
      manualOverlay('Analyst coverage, insider buys, audit quality, and promotional red flags.'),
    ],
  },
  'fresh-52-week-sinners': {
    groups: ['momentum'],
    filters: [
      automatedFilter('New high 52-week', 'daysSince52WeekHigh', '<=', 10, 'fmp.historical-price-eod'),
      automatedFilter('Forward non-GAAP P/E', 'forwardPe', '<', 'sectorMedianForwardPe', 'fmp.analyst-estimates'),
      manualOverlay('Positive EPS revisions require estimate-feed validation.'),
    ],
  },
});

export const PRESET_METADATA_BY_ID = Object.freeze({
  ...BASE_PRESET_METADATA,
  ...Object.fromEntries(EXTRA_SCREEN_PRESETS.map(preset => [preset.id, { groups: preset.groups, filters: preset.filters }])),
});

export const SCREENER_GROUPS = Object.freeze(buildGroups());
const REGISTRY_PRESET_STUBS = Object.freeze(Object.keys(BASE_PRESET_METADATA).map(id => Object.freeze({
  id,
  title: id.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' '),
  universe: {},
})));

export function annotateScreenerPresets(basePresets) {
  return Object.freeze([...basePresets, ...EXTRA_SCREEN_PRESETS].map(enrichPreset));
}

export const SCREEN_PRESETS = annotateScreenerPresets(REGISTRY_PRESET_STUBS);

function enrichPreset(preset) {
    const metadata = PRESET_METADATA_BY_ID[preset.id] || {};
    const filters = Object.freeze([...(metadata.filters || preset.filters || [])]);
    const groups = Object.freeze([...(metadata.groups || preset.groups || [])]);
    const automated = filters.filter(filter => filter.mode !== 'manual_overlay');
    const derived = automated.filter(filter => filter.mode === 'derived' || String(filter.source || '').includes('derived'));
    const manual = filters.filter(filter => filter.mode === 'manual_overlay').map(filter => filter.description);
    const parity = [...new Set(automated.map(filter => filter.tradingViewField).filter(Boolean))];
    return Object.freeze({
      ...preset,
      groups,
      group: groups[0] || null,
      filters,
      automated_filters: Object.freeze([...automated]),
      derived_filters: Object.freeze([...derived]),
      manual_overlays: Object.freeze([...manual]),
      tradingview_parity: Object.freeze(parity),
      fmpSources: Object.freeze([...new Set(automated.map(filter => filter.source).filter(Boolean))]),
      fmp_sources: Object.freeze([...new Set(automated.map(filter => filter.source).filter(Boolean))]),
      noteDomain: preset.noteDomain || inferNoteDomain(groups),
      note_domain: preset.noteDomain || inferNoteDomain(groups),
      tags: Object.freeze([...(preset.tags || defaultTagsForGroups(groups, preset.id))]),
      criteria: Object.freeze([...(preset.criteria || parity.map(field => `${field} screen applied.`))]),
    });
}

function inferNoteDomain(groups = []) {
  if (groups.includes('etf')) return 'etf';
  if (groups.includes('reit')) return 'sectors';
  if (groups.includes('commodities')) return 'commodities';
  return 'fundamentals';
}

function defaultTagsForGroups(groups = [], id = 'screener') {
  return ['screener', 'fmp', ...groups, id].filter(Boolean);
}

function strategyPreset(id, title, groups, filters, manualOverlays, universe = {}, extra = {}) {
  return Object.freeze({
    id,
    title,
    fileStem: `FMP_${title.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '')}_Screen`,
    groups,
    tags: ['screener', 'fmp', ...groups, ...(extra.tags || [])],
    universe: { country: 'US', marketCapMoreThan: 50_000_000, priceMoreThan: 1, volumeMoreThan: 50_000, ...universe },
    criteria: extra.criteria || filters.filter(filter => filter.mode !== 'manual_overlay').map(filter => `${filter.tradingViewField} ${filter.operator} ${Array.isArray(filter.threshold) ? filter.threshold.join(' to ') : filter.threshold}`),
    filters: [...filters, ...manualOverlays.map(manualOverlay)],
    noteDomain: extra.noteDomain,
  });
}

export function resolveScreenerPresets({ preset, group }, presets = null) {
  const allPresets = presets || annotateScreenerPresets(REGISTRY_PRESET_STUBS);
  const byId = new Map(allPresets.map(row => [row.id, row]));
  if (preset && preset !== 'all') {
    return String(preset).split(',').map(part => part.trim()).filter(Boolean).map(id => {
      const match = byId.get(id);
      if (!match) throw new Error(`Unknown --preset "${id}". Supported: ${allPresets.map(p => p.id).join(', ')}`);
      return match;
    });
  }
  if (group) {
    const groups = String(group).split(',').map(part => part.trim()).filter(Boolean);
    const unknown = groups.find(item => !SCREENER_GROUPS[item]);
    if (unknown) throw new Error(`Unknown --group "${unknown}". Supported: ${GROUP_ORDER.join(', ')}`);
    const ids = [...new Set(groups.flatMap(item => SCREENER_GROUPS[item]))];
    return ids.map(id => byId.get(id)).filter(Boolean);
  }
  return allPresets;
}

export function applyUniverseOverrides(preset, { sector, industry } = {}) {
  const universe = { ...(preset.universe || {}) };
  if (sector) {
    const match = findSectorDefault(sector);
    universe.sector = match?.fmpSector || sector;
  }
  if (industry) {
    const match = findSectorDefault(industry);
    universe.industry = match?.fmpIndustry || normalizeIndustryName(industry);
  }
  return { ...preset, universe };
}

export function describePresetFilters(preset) {
  const filters = preset.filters || PRESET_METADATA_BY_ID[preset.id]?.filters || [];
  const automated = filters.filter(filter => filter.mode !== 'manual_overlay');
  const manual = filters.filter(filter => filter.mode === 'manual_overlay').map(filter => filter.description);
  return {
    automated,
    derived: automated.filter(filter => filter.mode === 'derived' || String(filter.source || '').includes('derived')),
    manual,
    parity: [...new Set(automated.map(filter => filter.tradingViewField).filter(Boolean))],
  };
}

export function findSectorDefault(value) {
  const normalized = slug(value);
  return SECTOR_DEFAULTS.find(sector => {
    const labels = [
      sector.tradingViewSector,
      sector.tradingViewIndustry,
      sector.fmpSector,
      sector.fmpIndustry,
      ...(sector.aliases || []),
    ];
    return labels.some(label => slug(label) === normalized);
  }) || null;
}

function automatedFilter(tradingViewField, metric, operator, threshold, source) {
  return Object.freeze({
    mode: String(source || '').includes('derived') || operator === 'derived' || operator === 'proxy' ? 'derived' : 'automated',
    tradingViewField,
    metric,
    operator,
    threshold,
    source,
  });
}

function manualOverlay(description) {
  return Object.freeze({ mode: 'manual_overlay', description });
}

function buildGroups() {
  const groups = Object.fromEntries(GROUP_ORDER.map(group => [group, []]));
  for (const [id, metadata] of Object.entries(PRESET_METADATA_BY_ID)) {
    for (const group of metadata.groups || []) {
      if (!groups[group]) groups[group] = [];
      groups[group].push(id);
    }
  }
  return Object.freeze(Object.fromEntries(Object.entries(groups).map(([key, value]) => [key, Object.freeze(value)])));
}

function normalizeIndustryName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

function slug(value) {
  return String(value || '').trim().toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
