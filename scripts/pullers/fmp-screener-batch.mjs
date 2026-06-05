/**
 * fmp-screener-batch.mjs - example FMP screeners from the screener glossary.
 *
 * Usage:
 *   node run.mjs pull fmp-screener-batch
 *   node run.mjs pull fmp-screener-batch --preset cash-box-with-a-pulse --limit 15
 *   node run.mjs pull fmp-screener-batch --universe-limit 120 --concurrency 4
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getApiKey, getBaseUrl, getPullsDir } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import { buildNote, buildTable, dateStampedFilename, formatNumber, today, writeNote } from '../lib/markdown.mjs';
import { setProperties } from '../lib/obsidian-cli.mjs';
import {
  annotateScreenerPresets,
  applyUniverseOverrides,
  describePresetFilters,
  PRESET_METADATA_BY_ID,
  resolveScreenerPresets,
} from '../config/tradingview-screener-registry.mjs';

export const SCREEN_PRESETS = annotateScreenerPresets([
  {
    id: 'cash-box-with-a-pulse',
    title: 'Cash Box With a Pulse',
    fileStem: 'FMP_Cash_Box_With_A_Pulse_Screen',
    tags: ['equities', 'screener', 'deep-value', 'net-cash', 'fmp'],
    universe: { country: 'US', marketCapMoreThan: 50_000_000, marketCapLowerThan: 2_000_000_000, priceMoreThan: 1, volumeMoreThan: 100_000 },
    criteria: [
      'Net cash greater than 40% of market cap.',
      'EV/EBITDA below 4x.',
      'Positive TTM free cash flow.',
      'Positive TTM revenue.',
    ],
  },
  {
    id: 'negative-enterprise-value',
    title: 'Negative Enterprise Value',
    fileStem: 'FMP_Negative_Enterprise_Value_Screen',
    tags: ['equities', 'screener', 'deep-value', 'enterprise-value', 'fmp'],
    universe: { country: 'US', marketCapMoreThan: 20_000_000, marketCapLowerThan: 2_000_000_000, priceMoreThan: 1, volumeMoreThan: 50_000 },
    criteria: [
      'Enterprise value below zero.',
      'Current ratio above 2.0x.',
      'Positive EBITDA.',
      'Debt/equity below 0.10x.',
    ],
  },
  {
    id: 'capital-light-compounders',
    title: 'Capital-Light Compounders',
    fileStem: 'FMP_Capital_Light_Compounders_Screen',
    tags: ['equities', 'screener', 'quality', 'compounder', 'fmp'],
    universe: { country: 'US', marketCapMoreThan: 300_000_000, priceMoreThan: 5, volumeMoreThan: 200_000 },
    criteria: [
      'Capital expenditure below 4% of revenue.',
      'Free cash flow margin above 15%.',
      'Free cash flow above net income.',
      'ROIC above 20%.',
      'Revenue growth above 5%.',
    ],
  },
  {
    id: 'dividend-cockroach',
    title: 'Dividend Cockroach',
    fileStem: 'FMP_Dividend_Cockroach_Screen',
    tags: ['equities', 'screener', 'dividend', 'income', 'fmp'],
    universe: { country: 'US', marketCapMoreThan: 300_000_000, priceMoreThan: 5, volumeMoreThan: 100_000 },
    criteria: [
      'Dividend yield between 3% and 7%.',
      'Free cash flow payout ratio between 30% and 70%.',
      'Net debt/EBITDA below 2.5x.',
      'No detected dividend cut in recent FMP dividend history.',
    ],
  },
  {
    id: 'momentum-with-a-helmet',
    title: 'Momentum With a Helmet On',
    fileStem: 'FMP_Momentum_With_A_Helmet_Screen',
    tags: ['equities', 'screener', 'momentum', 'risk-control', 'fmp'],
    universe: { country: 'US', marketCapMoreThan: 300_000_000, priceMoreThan: 5, volumeMoreThan: 500_000 },
    criteria: [
      '12-month price momentum at or above 20%.',
      '1-month realized volatility below 20%.',
      'Net debt/EBITDA below 3x.',
      'Positive TTM free cash flow.',
    ],
  },
  {
    id: 'net-net-ncav',
    title: 'Net-Net / NCAV Screener',
    fileStem: 'FMP_Net_Net_NCAV_Screen',
    tags: ['equities', 'screener', 'deep-value', 'ncav', 'fmp'],
    universe: { country: 'US', marketCapMoreThan: 10_000_000, marketCapLowerThan: 1_000_000_000, priceMoreThan: 0.5, volumeMoreThan: 25_000 },
    criteria: [
      'Market cap below 80% of net current asset value.',
      'Total debt below 25% of current assets.',
      'Positive operating cash flow in at least two of the last three annual periods.',
    ],
  },
  {
    id: 'buyback-cannibal',
    title: 'Buyback Cannibal',
    fileStem: 'FMP_Buyback_Cannibal_Screen',
    tags: ['equities', 'screener', 'buybacks', 'capital-return', 'fmp'],
    universe: { country: 'US', marketCapMoreThan: 300_000_000, priceMoreThan: 5, volumeMoreThan: 100_000 },
    criteria: [
      'Share count down more than 3% per year over roughly three years.',
      'Free cash flow yield above 8%.',
      'Stock-based compensation below 3% of revenue.',
      'Net debt/EBITDA below 2x.',
      'Repurchases are not fully offset by issuance.',
    ],
  },
  {
    id: 'shareholder-yield-all-stars',
    title: 'Shareholder Yield All-Stars',
    fileStem: 'FMP_Shareholder_Yield_All_Stars_Screen',
    tags: ['equities', 'screener', 'shareholder-yield', 'capital-return', 'fmp'],
    universe: { country: 'US', marketCapMoreThan: 500_000_000, priceMoreThan: 5, volumeMoreThan: 100_000 },
    criteria: [
      'Shareholder yield above 6% from dividends, net buybacks, and net debt reduction.',
      'Three-year revenue CAGR is not negative.',
      'Positive free cash flow.',
    ],
  },
  {
    id: 'cash-flow-overlords',
    title: 'Cash-Flow Overlords',
    fileStem: 'FMP_Cash_Flow_Overlords_Screen',
    tags: ['equities', 'screener', 'cash-flow-quality', 'quality', 'fmp'],
    universe: { country: 'US', marketCapMoreThan: 300_000_000, priceMoreThan: 5, volumeMoreThan: 100_000 },
    criteria: [
      'Operating cash flow beats net income in at least seven of the last ten years, or available history proxy.',
      'Cumulative free cash flow exceeds current market cap.',
      'Net cash or net debt/EBITDA below 0.50x.',
    ],
  },
  {
    id: 'chapter-11-avoidance',
    title: 'Chapter 11 Avoidance Program',
    fileStem: 'FMP_Chapter_11_Avoidance_Screen',
    tags: ['equities', 'screener', 'distress', 'turnaround', 'fmp'],
    universe: { country: 'US', marketCapMoreThan: 50_000_000, marketCapLowerThan: 5_000_000_000, priceMoreThan: 1, volumeMoreThan: 100_000 },
    criteria: [
      'Altman Z-score between 1.8 and 3.0.',
      'Positive operating cash flow in the last four quarters or available annual proxy.',
      'Gross margin improving.',
      'Net debt/EBITDA improved by at least 0.5x over the last year.',
    ],
  },
  {
    id: 'low-vol-momentum',
    title: 'Low-Vol Momentum',
    fileStem: 'FMP_Low_Vol_Momentum_Screen',
    tags: ['equities', 'screener', 'momentum', 'low-volatility', 'fmp'],
    universe: { country: 'US', marketCapMoreThan: 500_000_000, priceMoreThan: 5, volumeMoreThan: 200_000 },
    criteria: [
      'Positive 12-month return above 15%.',
      'Beta below 0.80.',
      'Maximum one-year drawdown better than -15%.',
      'Positive dividend growth or positive free cash flow.',
    ],
  },
  {
    id: 'fad-to-famine-retailer',
    title: 'Fad-to-Famine Retailer',
    fileStem: 'FMP_Fad_To_Famine_Retailer_Screen',
    tags: ['equities', 'screener', 'retail', 'turnaround', 'fmp'],
    universe: { country: 'US', sector: 'Consumer Cyclical', marketCapMoreThan: 50_000_000, marketCapLowerThan: 5_000_000_000, priceMoreThan: 1, volumeMoreThan: 100_000 },
    criteria: [
      'Inventory-to-sales growth ratio above 1.6x.',
      'Price down at least 65% from three-year high.',
      'Current ratio above 2.2x.',
      'Gross margin stabilizing or improving.',
    ],
  },
  {
    id: 'legacy-cpg-cash-cow',
    title: 'Legacy CPG Cash Cow',
    fileStem: 'FMP_Legacy_CPG_Cash_Cow_Screen',
    tags: ['equities', 'screener', 'consumer-staples', 'cash-yield', 'fmp'],
    universe: { country: 'US', sector: 'Consumer Defensive', marketCapMoreThan: 500_000_000, priceMoreThan: 5, volumeMoreThan: 100_000 },
    criteria: [
      'Revenue growth between -4% and -1%.',
      'Operating margin above 20%.',
      'Free cash flow yield above 14%.',
      'Buyback yield above 8%.',
    ],
  },
  {
    id: 'invisible-micro-cap-orphan',
    title: 'Invisible Micro-Cap Orphan',
    fileStem: 'FMP_Invisible_Micro_Cap_Orphan_Screen',
    tags: ['equities', 'screener', 'micro-cap', 'insider-buying', 'fmp'],
    universe: { country: 'US', marketCapMoreThan: 20_000_000, marketCapLowerThan: 150_000_000, priceMoreThan: 0.5, volumeMoreThan: 5_000 },
    criteria: [
      'Market cap between $20M and $150M.',
      'Average daily dollar volume below $50k.',
      'No analyst coverage proxy.',
      'Multiple insider buys totaling more than $100k.',
    ],
  },
  {
    id: 'fresh-52-week-sinners',
    title: 'Fresh 52-Week Sinners',
    fileStem: 'FMP_Fresh_52_Week_Sinners_Screen',
    tags: ['equities', 'screener', 'breakout', 'valuation', 'fmp'],
    universe: { country: 'US', marketCapMoreThan: 300_000_000, priceMoreThan: 5, volumeMoreThan: 200_000 },
    criteria: [
      'Fresh 52-week high in the last 10 trading days.',
      'Forward P/E below sector median proxy.',
      'Positive EPS revision proxy over the last 90 days.',
    ],
  },
]);

const DEFAULT_LIMIT = 20;
const DEFAULT_UNIVERSE_LIMIT = 80;
const DEFAULT_CONCURRENCY = 3;

export async function pull(flags = {}) {
  if (flags.summary || flags['review-summary']) {
    return writeScreenerReviewSummary(flags);
  }

  const apiKey = getApiKey('fmp');
  const stableBaseUrl = getBaseUrl('fmp').replace(/\/api\/v\d+$/, '/stable');
  const limit = parseIntegerFlag(flags.limit, DEFAULT_LIMIT);
  const universeLimit = parseIntegerFlag(flags['universe-limit'], DEFAULT_UNIVERSE_LIMIT);
  const concurrency = parseIntegerFlag(flags.concurrency, DEFAULT_CONCURRENCY);
  const presets = resolveRequestedPresets(flags);
  const results = [];

  for (const preset of presets) {
    console.log(`FMP Screener Batch: ${preset.title}...`);
    const runPreset = applyUniverseOverrides(preset, { sector: flags.sector, industry: flags.industry });
    const universe = await fetchUniverse(runPreset, { apiKey, stableBaseUrl, universeLimit });
    console.log(`  Universe: ${universe.length} symbol(s)`);
    const candidates = await mapWithConcurrency(universe, concurrency, row =>
      enrichScreenerCandidate(row, { apiKey, stableBaseUrl })
    );
    const enrichedCandidates = candidates.filter(Boolean);
    const diagnostics = buildPresetDiagnostics(runPreset, enrichedCandidates);
    const ranked = rankPresetCandidates(runPreset.id, enrichedCandidates).slice(0, limit);
    const note = buildPresetNote(runPreset, ranked, {
      universeCount: universe.length,
      enrichedCandidates,
      diagnostics,
      nearMisses: diagnostics.nearMisses,
      limit,
      flags,
    });
    const filePath = join(getPullsDir(), 'Fundamentals', dateStampedFilename(preset.fileStem));

    if (flags['dry-run']) {
      console.log(JSON.stringify({ preset: runPreset.id, group: flags.group || null, sector: flags.sector || null, industry: flags.industry || null, matches: ranked.length, symbols: ranked.map(row => row.symbol) }, null, 2));
      results.push({ preset: preset.id, matches: ranked.length, filePath: null });
      continue;
    }

    writeNote(filePath, note);
    const signalStatus = ranked.length > 0 ? 'watch' : 'clear';
    setProperties(filePath, { signal_status: signalStatus, date_pulled: today() });
    console.log(`  Wrote: ${filePath} (${ranked.length} matches)`);
    results.push({ preset: preset.id, matches: ranked.length, filePath, signals: ranked.length ? [`${preset.id}-matches`] : [] });
  }

  return { filePaths: results.map(row => row.filePath).filter(Boolean), results };
}

function writeScreenerReviewSummary(flags = {}) {
  const fundamentalsDir = join(getPullsDir(), 'Fundamentals');
  const date = String(flags.date || today());
  const rows = loadScreenerReviewRows(fundamentalsDir, date);
  const note = buildScreenerReviewSummaryNote(rows, { date });
  const filePath = join(fundamentalsDir, dateStampedFilename('FMP_Screener_Review_Summary'));

  if (flags['dry-run']) {
    console.log(note);
    return { filePaths: [], results: rows };
  }

  writeNote(filePath, note);
  setProperties(filePath, { signal_status: rows.some(row => row.hits > 0) ? 'watch' : 'clear', date_pulled: today() });
  console.log(`FMP Screener Review Summary: wrote ${filePath} (${rows.length} presets)`);
  return { filePaths: [filePath], results: rows };
}

export function evaluateCandidateForPreset(presetId, candidate) {
  const c = normalizeCandidate(candidate);
  switch (presetId) {
    case 'cash-box-with-a-pulse': {
      const checks = [
        ['net cash above 40% of market cap', ratio(c.netCash, c.marketCap) > 0.4],
        ['EV/EBITDA below 4x', has(c.evToEbitda) && c.evToEbitda < 4],
        ['positive free cash flow', c.freeCashFlow > 0],
        ['positive revenue', c.revenue > 0],
      ];
      return finishEvaluation(c, checks, scoreCashBox(c));
    }
    case 'negative-enterprise-value': {
      const checks = [
        ['enterprise value below zero', has(c.enterpriseValue) && c.enterpriseValue < 0],
        ['current ratio above 2.0x', c.currentRatio > 2],
        ['positive EBITDA', c.ebitda > 0],
        ['debt/equity below 0.10x', has(c.debtToEquity) && c.debtToEquity < 0.1],
      ];
      return finishEvaluation(c, checks, scoreNegativeEv(c));
    }
    case 'capital-light-compounders': {
      const checks = [
        ['capex/revenue below 4%', has(c.capexToRevenuePct) && c.capexToRevenuePct < 4],
        ['FCF margin above 15%', c.fcfMarginPct > 15],
        ['FCF/net income above 100%', c.fcfToNetIncomePct > 100],
        ['ROIC above 20%', c.roicPct > 20],
        ['revenue growth above 5%', c.revenueGrowthPct > 5],
      ];
      return finishEvaluation(c, checks, scoreCapitalLight(c));
    }
    case 'dividend-cockroach': {
      const checks = [
        ['dividend yield between 3% and 7%', c.dividendYieldPct >= 3 && c.dividendYieldPct <= 7],
        ['FCF payout between 30% and 70%', c.fcfPayoutPct >= 30 && c.fcfPayoutPct <= 70],
        ['net debt/EBITDA below 2.5x', has(c.netDebtToEbitda) && c.netDebtToEbitda < 2.5],
        ['no detected dividend cut', c.dividendCut !== true],
      ];
      return finishEvaluation(c, checks, scoreDividend(c));
    }
    case 'momentum-with-a-helmet': {
      const checks = [
        ['12-month momentum at or above 20%', c.return12mPct >= 20],
        ['1-month volatility below 20%', c.volatility1mPct < 20],
        ['net debt/EBITDA below 3x', has(c.netDebtToEbitda) && c.netDebtToEbitda < 3],
        ['positive free cash flow', c.freeCashFlow > 0],
      ];
      return finishEvaluation(c, checks, scoreMomentum(c));
    }
    case 'net-net-ncav': {
      const checks = [
        ['market cap below 80% of NCAV', has(c.ncav) && has(c.marketCap) && c.marketCap < c.ncav * 0.8],
        ['total debt below 25% of current assets', has(c.totalDebt) && has(c.currentAssets) && c.totalDebt < c.currentAssets * 0.25],
        ['positive OCF in at least two of the last three years', c.positiveOperatingCashFlowYears >= 2],
      ];
      return finishEvaluation(c, checks, scoreNcav(c));
    }
    case 'buyback-cannibal': {
      const checks = [
        ['share count reduction above 9% over three years', c.shareCountReduction3yPct > 9],
        ['FCF yield above 8%', c.fcfYieldPct > 8],
        ['SBC/revenue below 3%', !has(c.sbcToRevenuePct) || c.sbcToRevenuePct < 3],
        ['net debt/EBITDA below 2x', has(c.netDebtToEbitda) && c.netDebtToEbitda < 2],
        ['buybacks not offset by issuance', c.buybacksOffsetIssuance !== true],
      ];
      return finishEvaluation(c, checks, scoreBuyback(c));
    }
    case 'shareholder-yield-all-stars': {
      const checks = [
        ['shareholder yield above 6%', c.shareholderYieldPct > 6],
        ['three-year revenue CAGR nonnegative', c.revenueCagr3yPct >= 0],
        ['positive free cash flow', c.freeCashFlow > 0],
      ];
      return finishEvaluation(c, checks, scoreShareholderYield(c));
    }
    case 'cash-flow-overlords': {
      const checks = [
        ['OCF beats net income in at least seven years', c.ocfBeatsNetIncomeYears >= 7],
        ['cumulative FCF exceeds market cap', has(c.cumulativeFcf10y) && has(c.marketCap) && c.cumulativeFcf10y > c.marketCap],
        ['net cash or net debt/EBITDA below 0.50x', c.netCash > 0 || (has(c.netDebtToEbitda) && c.netDebtToEbitda < 0.5)],
      ];
      return finishEvaluation(c, checks, scoreCashFlowOverlords(c));
    }
    case 'chapter-11-avoidance': {
      const checks = [
        ['Altman Z-score between 1.8 and 3.0', c.altmanZScore >= 1.8 && c.altmanZScore <= 3.0],
        ['positive operating cash flow in last four periods', c.positiveOperatingCashFlowQuarters >= 4 || c.positiveOperatingCashFlowYears >= 4],
        ['gross margin improving', c.grossMarginImprovementPct > 0],
        ['net debt/EBITDA improved by at least 0.5x', c.netDebtToEbitdaImprovement >= 0.5],
      ];
      return finishEvaluation(c, checks, scoreChapter11(c));
    }
    case 'low-vol-momentum': {
      const checks = [
        ['12-month return above 15%', c.return12mPct > 15],
        ['beta below 0.80', c.beta < 0.8],
        ['max drawdown better than -15%', c.maxDrawdownPct > -15],
        ['dividend growth or positive FCF', c.dividendGrowthPct > 0 || c.freeCashFlow > 0],
      ];
      return finishEvaluation(c, checks, scoreLowVolMomentum(c));
    }
    case 'fad-to-famine-retailer': {
      const checks = [
        ['inventory/sales growth ratio above 1.6x', c.inventoryToSalesGrowthRatio > 1.6],
        ['drawdown from 3y high worse than -65%', c.drawdownFrom3yHighPct <= -65],
        ['current ratio above 2.2x', c.currentRatio > 2.2],
        ['gross margin stabilizing', c.grossMarginImprovementPct >= 0],
      ];
      return finishEvaluation(c, checks, scoreFadRetailer(c));
    }
    case 'legacy-cpg-cash-cow': {
      const checks = [
        ['revenue growth between -4% and -1%', c.revenueGrowthPct >= -4 && c.revenueGrowthPct <= -1],
        ['operating margin above 20%', c.operatingMarginPct > 20],
        ['FCF yield above 14%', c.fcfYieldPct > 14],
        ['buyback yield above 8%', c.buybackYieldPct > 8],
      ];
      return finishEvaluation(c, checks, scoreLegacyCpg(c));
    }
    case 'invisible-micro-cap-orphan': {
      const checks = [
        ['market cap between $20M and $150M', c.marketCap >= 20_000_000 && c.marketCap <= 150_000_000],
        ['dollar volume below $50k', c.dollarVolume < 50_000],
        ['no analyst coverage', !has(c.analystCoverageCount) || c.analystCoverageCount === 0],
        ['multiple insider buys above $100k', c.insiderBuyCount >= 2 && c.insiderBuyValue > 100_000],
      ];
      return finishEvaluation(c, checks, scoreMicroOrphan(c));
    }
    case 'fresh-52-week-sinners': {
      const checks = [
        ['fresh 52-week high within 10 trading days', c.daysSince52WeekHigh <= 10],
        ['forward P/E below sector median', has(c.forwardPe) && has(c.sectorMedianForwardPe) && c.forwardPe < c.sectorMedianForwardPe],
        ['positive 90-day EPS revision proxy', c.epsRevision90dPct > 0],
      ];
      return finishEvaluation(c, checks, scoreFreshHigh(c));
    }
    case 'deposit-stickiness-cults': {
      const checks = [
        ['P/B below 1.2x', c.priceToBook < 1.2],
        ['ROE above 10%', c.returnOnEquityPct > 10],
        ['net margin above 15%', c.netMarginPct > 15],
        ['debt/equity below 1.5x', !has(c.debtToEquity) || c.debtToEquity < 1.5],
      ];
      return finishEvaluation(c, checks, scoreDepositBank(c));
    }
    case 'ffo-fountain-reits': {
      const checks = [
        ['dividend payout ratio between 50% and 70%', c.dividendPayoutPct >= 50 && c.dividendPayoutPct <= 70],
        ['debt/EBITDA below 6x', c.debtToEbitda < 6],
        ['dividend yield above 4%', c.dividendYieldPct > 4],
        ['positive free cash flow proxy', c.freeCashFlow > 0],
      ];
      return finishEvaluation(c, checks, scoreReit(c));
    }
    case 'factor-cocktail-etfs': {
      const checks = [
        ['symbol type is ETF', c.isEtf === true],
        ['market cap above $100M', c.marketCap > 100_000_000],
        ['dollar volume above $1M', c.dollarVolume > 1_000_000],
        ['beta no higher than 1.2', !has(c.beta) || c.beta <= 1.2],
      ];
      return finishEvaluation(c, checks, scoreEtf(c));
    }
    case 'fda-underdog': {
      const checks = [
        ['biotech or pharmaceuticals industry', /bio|pharma|therapeut/i.test(c.industry || '')],
        ['one-month performance below -50%', c.return1mPct < -50],
        ['cash exceeds market cap', has(c.cash) && has(c.marketCap) && c.cash > c.marketCap],
      ];
      return finishEvaluation(c, checks, scoreFdaUnderdog(c));
    }
    default:
      return evaluateCandidateWithRegistryFilters(presetId, c);
  }
}

export function rankPresetCandidates(presetId, candidates) {
  return candidates
    .map(candidate => ({ ...normalizeCandidate(candidate), ...evaluateCandidateForPreset(presetId, candidate) }))
    .filter(candidate => candidate.passed)
    .sort((left, right) => right.score - left.score || String(left.symbol).localeCompare(String(right.symbol)));
}

function buildPresetNote(preset, ranked, { universeCount, enrichedCandidates = [], diagnostics = null, nearMisses = [], limit, flags = {} }) {
  const signalStatus = ranked.length > 0 ? 'watch' : 'clear';
  const filterSummary = describePresetFilters(preset);
  const rows = ranked.map(row => [
    `[[${row.symbol}]]`,
    row.companyName || row.name || '-',
    row.sector || '-',
    String(Math.round(row.score)),
    formatNumber(row.marketCap, { style: 'currency' }),
    formatNumber(row.enterpriseValue, { style: 'currency' }),
    formatMetric(row.evToEbitda, 'x'),
    formatMetric(row.netCashPctOfMarketCap, '%'),
    formatMetric(row.fcfYieldPct, '%'),
    formatMetric(row.freeCashFlow, '$'),
    formatNumber(row.revenue, { style: 'currency' }),
    summarizeMissingMetrics(row, filterSummary.automated),
    summarizeNextCheck(row, filterSummary.manual),
    row.reason || 'passed',
  ]);
  const resolvedDiagnostics = diagnostics ?? buildPresetDiagnostics(preset, enrichedCandidates);

  return buildNote({
    frontmatter: {
      title: `${preset.title} - FMP Screener`,
      source: 'Financial Modeling Prep',
      date_pulled: today(),
      domain: preset.noteDomain || preset.note_domain || 'fundamentals',
      data_type: 'screener',
      frequency: 'on-demand',
      signal_status: signalStatus,
      signals: ranked.length ? [`${preset.id}-matches`] : [],
      screener_preset: preset.id,
      total_hits: ranked.length,
      tags: preset.tags,
    },
    sections: [
      {
        heading: 'Screen Read',
        content: buildScreenReadContent({ preset, ranked, diagnostics: resolvedDiagnostics, universeCount }),
      },
      {
        heading: 'Search Criteria',
        content: [
          ...preset.criteria.map(item => `- ${item}`),
          `- Initial universe: ${universeCount} FMP company-screener rows.`,
          `- Output limit: ${limit} matches.`,
          flags.group ? `- Group filter: ${flags.group}.` : null,
          flags.sector ? `- Sector override: ${flags.sector}.` : null,
          flags.industry ? `- Industry override: ${flags.industry}.` : null,
        ].join('\n'),
      },
      {
        heading: 'Automated Filters Used',
        content: filterSummary.automated.length
          ? buildTable(['TradingView filter', 'Internal metric', 'Operator', 'Threshold', 'Source'], filterSummary.automated.map(filter => [
              filter.tradingViewField,
              filter.metric,
              filter.operator,
              Array.isArray(filter.threshold) ? filter.threshold.join(' to ') : String(filter.threshold),
              filter.source,
            ]))
          : '_No automated filters registered._',
      },
      {
        heading: 'Derived Metrics Used',
        content: filterSummary.derived.length
          ? buildTable(['TradingView/proxy field', 'Derived metric', 'Rule', 'Source'], filterSummary.derived.map(filter => [
              filter.tradingViewField,
              filter.metric,
              `${filter.operator} ${Array.isArray(filter.threshold) ? filter.threshold.join(' to ') : String(filter.threshold)}`,
              filter.source,
            ]))
          : '_No derived metrics registered._',
      },
      {
        heading: 'TradingView Parity',
        content: filterSummary.parity.length
          ? buildTable(['TradingView filter', 'Internal metric', 'Operator', 'Threshold', 'Source'], filterSummary.automated.map(filter => [
              filter.tradingViewField,
              filter.metric,
              filter.operator,
              Array.isArray(filter.threshold) ? filter.threshold.join(' to ') : String(filter.threshold),
              filter.source,
            ]))
          : '_No TradingView parity filters registered._',
      },
      {
        heading: 'Manual Overlay Queue',
        content: filterSummary.manual.length
          ? filterSummary.manual.map(item => `- ${item}`).join('\n')
          : '- No manual overlays registered for this preset.',
      },
      {
        heading: 'Screener Diagnostics',
        content: buildDiagnosticsContent(resolvedDiagnostics),
      },
      {
        heading: `Matches - ${ranked.length}`,
        content: rows.length
          ? buildTable(['Ticker', 'Company', 'Sector', 'Score', 'Mkt Cap', 'EV', 'EV/EBITDA', 'Net Cash / Cap', 'FCF Yield', 'FCF', 'Revenue', 'Data Gaps', 'Next Check', 'Reason'], rows)
          : '_No tickers matched the filter combination. Loosen thresholds or expand the initial universe._',
      },
      ...(nearMisses.length ? [{
        heading: 'Near Misses',
        content: buildNearMissesContent(nearMisses),
      }] : []),
      {
        heading: 'Review Checklist',
        content: buildReviewChecklistContent(filterSummary.manual),
      },
      {
        heading: 'Source',
        content: [
          `- **Mapped sources**: ${(preset.fmpSources || preset.fmp_sources || []).join(', ') || 'FMP company-screener and local derived metrics'}.`,
          '- **FMP APIs**: company-screener, quote/profile, key-metrics-ttm, ratios-ttm, income statement, cash flow, balance sheet, historical prices, dividends, and ETF/fund info/holders where available.',
          '- **Use**: Example research queue only; confirm filings, accounting quality, and business context before promoting any candidate.',
          `- **Auto-pulled**: ${today()}`,
        ].join('\n'),
      },
    ],
  });
}

export function buildPresetNoteForTest(preset, ranked, options) {
  return buildPresetNote(preset, ranked, options);
}

export function buildPresetDiagnostics(preset, candidates = []) {
  const filters = PRESET_METADATA_BY_ID[preset.id]?.filters?.filter(filter => filter.mode !== 'manual_overlay') || [];
  const evaluated = candidates
    .map(candidate => ({ ...normalizeCandidate(candidate), ...evaluateCandidateForPreset(preset.id, candidate) }))
    .sort((left, right) => right.score - left.score || String(left.symbol).localeCompare(String(right.symbol)));
  const filterRows = filters.map(filter => {
    const values = candidates.map(candidate => normalizeCandidate(candidate)[filter.metric]);
    const present = values.filter(value => metricPresent(value)).length;
    const passed = candidates.filter(candidate => evaluateFilter(normalizeCandidate(candidate), filter)).length;
    return {
      filter,
      present,
      missing: Math.max(0, candidates.length - present),
      passed,
      failed: Math.max(0, candidates.length - passed),
    };
  });
  const nearMisses = evaluated.filter(candidate => !candidate.passed).slice(0, 10);
  return {
    universeCount: candidates.length,
    passedCount: evaluated.filter(candidate => candidate.passed).length,
    failedCount: evaluated.filter(candidate => !candidate.passed).length,
    filterRows,
    nearMisses,
  };
}

function buildDiagnosticsContent(diagnostics) {
  if (!diagnostics) return '_Diagnostics unavailable._';
  const summary = [
    `- **Enriched candidates**: ${diagnostics.universeCount}`,
    `- **Passed all hard filters**: ${diagnostics.passedCount}`,
    `- **Failed at least one hard filter**: ${diagnostics.failedCount}`,
  ];
  const rows = diagnostics.filterRows.map(row => [
    row.filter.tradingViewField,
    row.filter.metric,
    `${row.filter.operator} ${formatThresholdForReason(row.filter.threshold)}`,
    String(row.present),
    String(row.missing),
    String(row.passed),
    String(row.failed),
    row.filter.source,
  ]);
  return [
    ...summary,
    '',
    rows.length
      ? buildTable(['Filter', 'Metric', 'Rule', 'Present', 'Missing', 'Passed', 'Failed', 'Source'], rows)
      : '_No automated filters registered._',
  ].join('\n');
}

function buildScreenReadContent({ preset, ranked, diagnostics, universeCount }) {
  const total = diagnostics?.universeCount ?? universeCount ?? 0;
  const hitRate = total > 0 ? (ranked.length / total) * 100 : 0;
  const bottleneck = strongestBottleneck(diagnostics);
  const sourceGaps = diagnostics?.filterRows
    ?.filter(row => row.missing > 0)
    ?.sort((left, right) => right.missing - left.missing)
    ?.slice(0, 2) || [];
  return [
    `- **Preset**: ${preset.title}.`,
    `- **Result**: ${ranked.length} match(es) from ${total} enriched candidate(s) (${hitRate.toFixed(1)}% hit rate).`,
    bottleneck
      ? `- **Main bottleneck**: ${bottleneck.filter.tradingViewField} ${bottleneck.filter.operator} ${formatThresholdForReason(bottleneck.filter.threshold)} (${bottleneck.passed} passed, ${bottleneck.failed} failed).`
      : '- **Main bottleneck**: none; all enriched candidates passed the registered hard filters.',
    sourceGaps.length
      ? `- **Data gaps**: ${sourceGaps.map(row => `${row.filter.metric} missing for ${row.missing}`).join('; ')}.`
      : '- **Data gaps**: none across registered hard filters.',
    ranked.length
      ? '- **Use first**: start with the highest-scoring match, then review near misses for threshold-sensitive candidates.'
      : '- **Use first**: review near misses before loosening thresholds; source gaps may be the real blocker.',
  ].join('\n');
}

function strongestBottleneck(diagnostics) {
  const rows = diagnostics?.filterRows || [];
  if (!rows.length) return null;
  return [...rows].sort((left, right) =>
    (right.failed - left.failed) ||
    (right.missing - left.missing) ||
    String(left.filter.tradingViewField).localeCompare(String(right.filter.tradingViewField))
  )[0];
}

function buildNearMissesContent(nearMisses = []) {
  if (!nearMisses.length) return '_No enriched candidates were close enough to rank. Expand the initial universe or loosen source-dependent filters._';
  return buildTable(
    ['Ticker', 'Company', 'Sector', 'Score', 'First failed filter'],
    nearMisses.map(row => [
      `[[${row.symbol}]]`,
      row.companyName || row.name || '-',
      row.sector || '-',
      String(Math.round(row.score || 0)),
      row.reason || 'failed preset guardrail',
    ])
  );
}

function buildReviewChecklistContent(manualOverlays = []) {
  const lines = [
    '- Verify the top match against the latest 10-K/10-Q or 8-K before promotion.',
    '- Check whether the passing signal depends on a one-time accounting item, stale quote, or incomplete FMP field.',
    '- Compare the candidate against sector peers before treating the score as conviction.',
    ...manualOverlays.map(item => `- ${item}`),
  ];
  return [...new Set(lines)].join('\n');
}

function loadScreenerReviewRows(fundamentalsDir, date) {
  if (!existsSync(fundamentalsDir)) return [];
  return readdirSync(fundamentalsDir)
    .filter(file => file.startsWith(`${date}_FMP_`) && file.endsWith('_Screen.md'))
    .map(file => {
      const text = readFileSync(join(fundamentalsDir, file), 'utf-8');
      return parseScreenerReviewRow(text, file);
    })
    .filter(Boolean)
    .sort((left, right) =>
      right.hits - left.hits ||
      right.nearMissCount - left.nearMissCount ||
      left.preset.localeCompare(right.preset)
    );
}

function parseScreenerReviewRow(text, file) {
  const preset = matchText(text, /screener_preset:\s+"([^"]+)"/) || file.replace(/^\d{4}-\d{2}-\d{2}_FMP_/, '').replace(/_Screen\.md$/, '').toLowerCase();
  const title = matchText(text, /title:\s+"([^"]+)"/) || preset;
  const hits = Number(matchText(text, /total_hits:\s+(\d+)/) || 0);
  const enriched = Number(matchText(text, /\*\*Enriched candidates\*\*:\s+(\d+)/) || 0);
  const passed = Number(matchText(text, /\*\*Passed all hard filters\*\*:\s+(\d+)/) || hits);
  const bottleneck = matchText(text, /\*\*Main bottleneck\*\*:\s+([^\n]+)/)?.replace(/\.$/, '') || 'not reported';
  const dataGapLine = matchText(text, /\*\*Data gaps\*\*:\s+([^\n]+)/) || '';
  const sourceGaps = /none/i.test(dataGapLine)
    ? []
    : dataGapLine.replace(/\.$/, '').split(/;\s*/).map(item => item.trim()).filter(Boolean);
  const nearMissSection = text.split('## Near Misses')[1]?.split('\n## ')[0] || '';
  const nearMissCount = (nearMissSection.match(/\n\| \[\[/g) || []).length;
  return { preset, title: title.replace(/\s+-\s+FMP Screener$/, ''), hits, passed, enriched, bottleneck, sourceGaps, nearMissCount, file };
}

export function buildScreenerReviewSummaryNote(rows = [], { date = today() } = {}) {
  const sorted = [...rows].sort((left, right) =>
    right.hits - left.hits ||
    right.nearMissCount - left.nearMissCount ||
    left.preset.localeCompare(right.preset)
  );
  const withHits = sorted.filter(row => row.hits > 0);
  const sourceGapRows = sorted.filter(row => row.sourceGaps?.length);
  const zeroHitRows = sorted.filter(row => row.hits === 0);
  const actionRows = sorted
    .map(row => ({
      ...row,
      action: nextSummaryAction(row),
    }))
    .sort((left, right) => actionPriority(left.action) - actionPriority(right.action) || right.hits - left.hits || right.nearMissCount - left.nearMissCount)
    .slice(0, 20);

  return buildNote({
    frontmatter: {
      title: `FMP Screener Review Summary - ${date}`,
      source: 'fmp-screener-batch',
      date_pulled: today(),
      domain: 'fundamentals',
      data_type: 'screener_review_summary',
      frequency: 'on-demand',
      signal_status: withHits.length ? 'watch' : 'clear',
      signals: withHits.map(row => `${row.preset}-hits`).slice(0, 20),
      total_presets: rows.length,
      presets_with_hits: withHits.length,
      presets_with_source_gaps: sourceGapRows.length,
      tags: ['fmp', 'screener', 'review-summary'],
    },
    sections: [
      {
        heading: 'Review Read',
        content: [
          `- **Preset notes reviewed**: ${rows.length}`,
          `- **Presets with hits**: ${withHits.length}`,
          `- **Zero-hit presets**: ${zeroHitRows.length}`,
          `- **Presets with source gaps**: ${sourceGapRows.length}`,
          withHits.length
            ? `- **First diligence queue**: ${withHits.slice(0, 5).map(row => row.preset).join(', ')}.`
            : '- **First diligence queue**: none; fix source gaps or loosen thresholds first.',
        ].join('\n'),
      },
      {
        heading: 'Action Queue',
        content: actionRows.length
          ? buildTable(['Preset', 'Hits', 'Near Misses', 'Action', 'Main Bottleneck', 'Source Gaps', 'Note'], actionRows.map(row => [
              row.preset,
              String(row.hits),
              String(row.nearMissCount),
              row.action,
              row.bottleneck,
              row.sourceGaps?.length ? row.sourceGaps.join('; ') : 'none',
              `[[${row.file.replace(/\.md$/, '')}]]`,
            ]))
          : '_No screener notes found for this date._',
      },
      {
        heading: 'Hit Presets',
        content: withHits.length
          ? buildTable(['Preset', 'Hits', 'Candidates', 'Hit Rate', 'Bottleneck'], withHits.map(row => [
              row.preset,
              String(row.hits),
              String(row.enriched || 0),
              row.enriched ? `${((row.hits / row.enriched) * 100).toFixed(1)}%` : 'N/A',
              row.bottleneck,
            ]))
          : '_No presets produced matches._',
      },
      {
        heading: 'Source Gaps',
        content: sourceGapRows.length
          ? buildTable(['Preset', 'Missing Inputs', 'Next Step'], sourceGapRows.map(row => [
              row.preset,
              row.sourceGaps.join('; '),
              sourceGapNextStep(row),
            ]))
          : '_No source gaps reported by generated screener diagnostics._',
      },
      {
        heading: 'Zero-Hit Presets',
        content: zeroHitRows.length
          ? buildTable(['Preset', 'Near Misses', 'Main Bottleneck', 'Next Step'], zeroHitRows.slice(0, 25).map(row => [
              row.preset,
              String(row.nearMissCount),
              row.bottleneck,
              nextSummaryAction(row),
            ]))
          : '_No zero-hit presets._',
      },
    ],
  });
}

function nextSummaryAction(row) {
  if (row.hits > 0) return 'Promote hits to diligence';
  if (row.sourceGaps?.length) return 'Fix source coverage';
  if (row.nearMissCount > 0) return 'Review near misses / tune thresholds';
  return 'Expand universe or retire preset';
}

function actionPriority(action) {
  return {
    'Promote hits to diligence': 0,
    'Fix source coverage': 1,
    'Review near misses / tune thresholds': 2,
    'Expand universe or retire preset': 3,
  }[action] ?? 9;
}

function sourceGapNextStep(row) {
  const gaps = row.sourceGaps.join(' ').toLowerCase();
  if (/holding|nav|etf/.test(gaps)) return 'Add alternate ETF issuer/holdings source or keep as manual overlay.';
  if (/roe|returnonequity|margin|ratio/.test(gaps)) return 'Add derived financial fallback or alternate FMP endpoint.';
  if (/roll|commodity/.test(gaps)) return 'Connect futures curve/commodity proxy feed.';
  if (/shelf|runway|offering/.test(gaps)) return 'Use SEC filing/dilution monitor context.';
  return 'Inspect the preset metric mapping and add a fallback source.';
}

function matchText(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1] : null;
}

function summarizeMissingMetrics(row, filters = []) {
  const missing = filters
    .filter(filter => {
      const value = row[filter.metric];
      return !metricPresent(value);
    })
    .map(filter => filter.metric);
  return missing.length ? missing.slice(0, 3).join(', ') : 'none';
}

function summarizeNextCheck(row, manualOverlays = []) {
  if (manualOverlays.length) return manualOverlays[0].replace(/\.$/, '');
  if (row.reason && row.reason !== 'Passed all preset guardrails') return row.reason;
  return 'Confirm filings and peer context';
}

function metricPresent(value) {
  if (typeof value === 'boolean') return true;
  if (typeof value === 'string') return value.trim().length > 0;
  return has(value);
}

async function fetchUniverse(preset, { apiKey, stableBaseUrl, universeLimit }) {
  const params = new URLSearchParams({ apikey: apiKey, isActivelyTrading: 'true', isEtf: 'false', isFund: 'false' });
  for (const [key, value] of Object.entries(preset.universe)) {
    params.set(key, String(value));
  }
  params.set('limit', String(Math.max(universeLimit, DEFAULT_LIMIT)));
  const data = await getJson(`${stableBaseUrl}/company-screener?${params.toString()}`);
  const rows = (Array.isArray(data) ? data : []).slice(0, universeLimit);
  const forcesEtf = String(preset.universe?.isEtf).toLowerCase() === 'true';
  const forcesFund = String(preset.universe?.isFund).toLowerCase() === 'true';
  return rows.map(row => ({
    ...row,
    ...(forcesEtf ? { isEtf: true } : {}),
    ...(forcesFund ? { isFund: true } : {}),
  }));
}

async function enrichScreenerCandidate(row, { apiKey, stableBaseUrl }) {
  const symbol = String(row.symbol || '').toUpperCase();
  if (!symbol) return null;
  const [profile, quote, ratios, metrics, income, incomeAnnual, incomeQuarterly, cashFlow, cashFlowAnnual, cashFlowQuarterly, balance, balanceAnnual, balanceQuarterly, prices, prices3y, dividends, scores, estimates, insiders] = await Promise.all([
    fetchFirst(stableBaseUrl, 'profile', symbol, apiKey),
    fetchFirst(stableBaseUrl, 'quote', symbol, apiKey),
    fetchFirst(stableBaseUrl, 'ratios-ttm', symbol, apiKey),
    fetchFirst(stableBaseUrl, 'key-metrics-ttm', symbol, apiKey),
    fetchFirst(stableBaseUrl, 'income-statement', symbol, apiKey, { period: 'annual', limit: 1 }),
    fetchArray(stableBaseUrl, 'income-statement', symbol, apiKey, { period: 'annual', limit: 5 }),
    fetchArray(stableBaseUrl, 'income-statement', symbol, apiKey, { period: 'quarter', limit: 5 }),
    fetchFirst(stableBaseUrl, 'cash-flow-statement', symbol, apiKey, { period: 'annual', limit: 1 }),
    fetchArray(stableBaseUrl, 'cash-flow-statement', symbol, apiKey, { period: 'annual', limit: 5 }),
    fetchArray(stableBaseUrl, 'cash-flow-statement', symbol, apiKey, { period: 'quarter', limit: 5 }),
    fetchFirst(stableBaseUrl, 'balance-sheet-statement', symbol, apiKey, { period: 'annual', limit: 1 }),
    fetchArray(stableBaseUrl, 'balance-sheet-statement', symbol, apiKey, { period: 'annual', limit: 3 }),
    fetchArray(stableBaseUrl, 'balance-sheet-statement', symbol, apiKey, { period: 'quarter', limit: 5 }),
    fetchHistoricalPrices(stableBaseUrl, symbol, apiKey),
    fetchHistoricalPrices(stableBaseUrl, symbol, apiKey, 760),
    fetchDividends(stableBaseUrl, symbol, apiKey),
    fetchFirst(stableBaseUrl, 'financial-scores', symbol, apiKey),
    fetchArray(stableBaseUrl, 'analyst-estimates', symbol, apiKey, { period: 'annual', limit: 4 }),
    fetchArray(stableBaseUrl, 'insider-trading/search', symbol, apiKey, { limit: 30 }),
  ]);

  const marketCap = firstNumber(row.marketCap, quote?.marketCap, profile?.mktCap, profile?.marketCap);
  const cash = firstNumber(balance?.cashAndShortTermInvestments, sumNumbers(balance?.cashAndCashEquivalents, balance?.shortTermInvestments));
  const totalDebt = firstNumber(balance?.totalDebt, sumNumbers(balance?.shortTermDebt, balance?.longTermDebt), 0);
  const currentAssets = firstNumber(balance?.totalCurrentAssets);
  const totalLiabilities = firstNumber(balance?.totalLiabilities);
  const ncav = has(currentAssets) && has(totalLiabilities) ? currentAssets - totalLiabilities : null;
  const netCash = has(cash) ? cash - totalDebt : null;
  const revenue = firstNumber(income?.revenue, row.revenue);
  const priorRevenue = firstNumber(incomeAnnual?.[1]?.revenue);
  const revenueGrowthPct = has(revenue) && has(priorRevenue) && priorRevenue !== 0 ? ((revenue - priorRevenue) / Math.abs(priorRevenue)) * 100 : null;
  const ebitda = firstNumber(income?.ebitda, income?.operatingIncome);
  const operatingIncome = firstNumber(income?.operatingIncome);
  const enterpriseValue = firstNumber(metrics?.enterpriseValueTTM, metrics?.enterpriseValue, has(marketCap) && has(totalDebt) && has(cash) ? marketCap + totalDebt - cash : null);
  const freeCashFlow = firstNumber(cashFlow?.freeCashFlow, sumNumbers(cashFlow?.operatingCashFlow, cashFlow?.capitalExpenditure));
  const operatingCashFlow = firstNumber(cashFlow?.operatingCashFlow, cashFlow?.netCashProvidedByOperatingActivities);
  const netIncome = firstNumber(income?.netIncome);
  const stockholdersEquity = firstNumber(balance?.totalStockholdersEquity, balance?.totalEquity);
  const totalAssets = firstNumber(balance?.totalAssets);
  const tangibleBook = calculateTangibleBookValue(balance);
  const capex = firstNumber(cashFlow?.capitalExpenditure);
  const netDebtToEbitda = firstNumber(metrics?.netDebtToEBITDATTM, has(totalDebt) && has(cash) && has(ebitda) && ebitda !== 0 ? (totalDebt - cash) / ebitda : null);
  const debtToEquity = firstNumber(ratios?.debtEquityRatioTTM, ratios?.debtToEquityRatioTTM, stockholdersEquity ? totalDebt / stockholdersEquity : null);
  const currentRatio = firstNumber(ratios?.currentRatioTTM, balance?.totalCurrentLiabilities ? balance?.totalCurrentAssets / balance.totalCurrentLiabilities : null);
  const evToEbitda = firstNumber(metrics?.enterpriseValueOverEBITDATTM, metrics?.evToEBITDATTM, has(enterpriseValue) && has(ebitda) && ebitda !== 0 ? enterpriseValue / ebitda : null);
  const investedCapital = has(totalAssets) && has(balance?.totalCurrentLiabilities) ? totalAssets - balance.totalCurrentLiabilities : sumNumbers(totalDebt, stockholdersEquity);
  const roicPct = percentFromMaybeRatio(firstNumber(metrics?.roicTTM, ratios?.returnOnInvestedCapitalTTM, ratios?.returnOnCapitalEmployedTTM, ratio(operatingIncome, investedCapital)));
  const dividendYieldPct = percentFromMaybeRatio(firstNumber(ratios?.dividendYieldTTM, metrics?.dividendYieldTTM, profile?.lastDiv && quote?.price ? profile.lastDiv / quote.price : null));
  const price = firstNumber(row.price, quote?.price);
  const latestShares = firstNumber(incomeAnnual?.[0]?.weightedAverageShsOutDil, incomeAnnual?.[0]?.weightedAverageShsOut, profile?.sharesOutstanding);
  const priceToBook = firstNumber(
    metrics?.pbRatioTTM,
    metrics?.priceToBookRatioTTM,
    ratios?.priceToBookRatioTTM,
    has(price) && has(balance?.totalStockholdersEquity) && has(latestShares) && latestShares > 0
      ? price / (balance.totalStockholdersEquity / latestShares)
      : null
  );
  const returnOnEquityPct = percentFromMaybeRatio(firstNumber(ratios?.returnOnEquityTTM, metrics?.roeTTM, ratio(netIncome, stockholdersEquity)));
  const netMarginPct = percentFromMaybeRatio(firstNumber(ratios?.netProfitMarginTTM, ratios?.netIncomePerEBTTTM, ratio(netIncome, revenue)));
  const oldShares = firstNumber(incomeAnnual?.[3]?.weightedAverageShsOutDil, incomeAnnual?.[3]?.weightedAverageShsOut, incomeAnnual?.at(-1)?.weightedAverageShsOutDil, incomeAnnual?.at(-1)?.weightedAverageShsOut);
  const shareCountReduction3yPct = has(latestShares) && has(oldShares) && oldShares > 0 ? ((oldShares - latestShares) / oldShares) * 100 : null;
  const stockRepurchased = Math.abs(firstNumber(cashFlow?.commonStockRepurchased, cashFlow?.repurchaseOfCapitalStock, 0));
  const stockIssued = Math.abs(firstNumber(cashFlow?.commonStockIssued, cashFlow?.issuanceOfCapitalStock, 0));
  const debtReductionYieldPct = calculateDebtReductionYieldPct(balanceAnnual, marketCap);
  const buybackYieldPct = ratio(stockRepurchased - stockIssued, marketCap) * 100;
  const shareholderYieldPct = (has(dividendYieldPct) ? dividendYieldPct : 0) + (has(buybackYieldPct) ? buybackYieldPct : 0) + (has(debtReductionYieldPct) ? debtReductionYieldPct : 0);
  const revenueCagr3yPct = calculateCagrPct(firstNumber(incomeAnnual?.[0]?.revenue), firstNumber(incomeAnnual?.[3]?.revenue, incomeAnnual?.at(-1)?.revenue), Math.min(3, Math.max(1, incomeAnnual.length - 1)));
  const grossMargin = firstNumber(percentFromMaybeRatio(ratios?.grossProfitMarginTTM), grossMarginPct(income));
  const grossMarginImprovementPct = calculateGrossMarginImprovementPct(incomeQuarterly.length ? incomeQuarterly : incomeAnnual);
  const netDebtToEbitdaImprovement = calculateNetDebtToEbitdaImprovement(balanceAnnual, incomeAnnual);
  const inventoryToSalesGrowthRatio = calculateInventoryToSalesGrowthRatio(balanceQuarterly, incomeQuarterly);
  const sourceMetrics = deriveFinancialSourceMetrics({
    marketCap,
    enterpriseValue,
    revenue,
    ebitda,
    operatingIncome,
    freeCashFlow,
    operatingCashFlow,
    netIncome,
    cash,
    totalDebt,
    totalAssets,
    stockholdersEquity,
    tangibleBook,
    dividends,
    income,
    incomeAnnual,
    incomeQuarterly,
    cashFlow,
    cashFlowQuarterly,
    balance,
    balanceQuarterly,
  });
  const insiderBuys = summarizeInsiderBuys(insiders);
  const estimateRevision = calculateEstimateRevisionPct(estimates);

  const baseCandidate = normalizeCandidate({
    symbol,
    companyName: row.companyName || profile?.companyName || profile?.companyName,
    sector: row.sector || profile?.sector,
    industry: row.industry || profile?.industry,
    isEtf: row.isEtf ?? profile?.isEtf,
    price,
    beta: firstNumber(profile?.beta, quote?.beta),
    dollarVolume: firstNumber(row.price, quote?.price) * firstNumber(row.volume, row.avgVolume, quote?.volume),
    marketCap,
    cash,
    totalDebt,
    currentAssets,
    ncav,
    netCash,
    netCashPctOfMarketCap: ratio(netCash, marketCap) * 100,
    enterpriseValue,
    evToEbitda,
    evToSales: sourceMetrics.evToSales,
    freeCashFlow,
    operatingCashFlow,
    netIncome,
    fcfYieldPct: ratio(freeCashFlow, marketCap) * 100,
    revenue,
    revenueGrowthPct,
    ebitda,
    ebitdaMarginPct: sourceMetrics.ebitdaMarginPct,
    ebitdaMarginImprovementPct: sourceMetrics.ebitdaMarginImprovementPct,
    operatingIncome,
    currentRatio,
    debtToEquity,
    netDebtToEbitda,
    debtToEbitda: netDebtToEbitda,
    priceToBook,
    priceToTangibleBook: sourceMetrics.priceToTangibleBook,
    returnOnEquityPct,
    netMarginPct,
    capexToRevenuePct: has(capex) && has(revenue) && revenue !== 0 ? Math.abs(capex) / revenue * 100 : null,
    fcfMarginPct: ratio(freeCashFlow, revenue) * 100,
    fcfToNetIncomePct: ratio(freeCashFlow, netIncome) * 100,
    roicPct,
    dividendYieldPct,
    fcfPayoutPct: calculateFcfPayoutPct(dividends, freeCashFlow, marketCap, dividendYieldPct),
    dividendPayoutPct: calculateFcfPayoutPct(dividends, freeCashFlow, marketCap, dividendYieldPct),
    dividendCoveragePct: sourceMetrics.dividendCoveragePct,
    dividendCut: detectDividendCut(dividends),
    return12mPct: calculateReturnPct(prices, 252),
    return1mPct: calculateReturnPct(prices, 21),
    maxDrawdownPct: calculateMaxDrawdownPct(prices),
    drawdownFrom3yHighPct: calculateDrawdownFromHighPct(prices3y),
    daysSince52WeekHigh: calculateDaysSinceHigh(prices, 252),
    volatility1mPct: calculateAnnualizedVolatilityPct(prices, 21),
    dividendGrowthPct: calculateDividendGrowthPct(dividends),
    positiveOperatingCashFlowYears: countPositiveOperatingCashFlow(cashFlowAnnual),
    positiveOperatingCashFlowQuarters: countPositiveOperatingCashFlow(cashFlowQuarterly),
    shareCountReduction3yPct,
    sbcToRevenuePct: ratio(firstNumber(cashFlow?.stockBasedCompensation), revenue) * 100,
    buybacksOffsetIssuance: has(stockRepurchased) && stockRepurchased > 0 && stockIssued >= stockRepurchased * 0.75,
    shareholderYieldPct,
    buybackYieldPct,
    revenueCagr3yPct,
    ocfBeatsNetIncomeYears: countOcfBeatsNetIncome(cashFlowAnnual, incomeAnnual),
    cumulativeFcf10y: sumRecentFreeCashFlow(cashFlowAnnual),
    altmanZScore: firstNumber(scores?.altmanZScore, scores?.altmanZScoreTTM),
    grossMarginPct: grossMargin,
    grossMarginImprovementPct,
    netDebtToEbitdaImprovement,
    inventoryToSalesGrowthRatio,
    inventoryToMarketCapPct: sourceMetrics.inventoryToMarketCapPct,
    debtToTangibleBookPct: sourceMetrics.debtToTangibleBookPct,
    interestCoverage: sourceMetrics.interestCoverage,
    cashRunwayQuarters: sourceMetrics.cashRunwayQuarters,
    liquidityRunwayMonths: sourceMetrics.liquidityRunwayMonths,
    rdToMarketCapPct: sourceMetrics.rdToMarketCapPct,
    inventoryGrowthPct: sourceMetrics.inventoryGrowthPct,
    cashConversionCycleImprovementDays: sourceMetrics.cashConversionCycleImprovementDays,
    tceToAssetsPct: sourceMetrics.tceToAssetsPct,
    operatingMarginPct: ratio(firstNumber(income?.operatingIncome), revenue) * 100,
    analystCoverageCount: firstNumber(estimates?.[0]?.numberAnalystEstimatedRevenue, estimates?.[0]?.numberAnalystsEstimatedRevenue, estimates?.[0]?.estimatedEpsAvg ? 1 : null),
    insiderBuyCount: insiderBuys.count,
    insiderBuyValue: insiderBuys.value,
    forwardPe: calculateForwardPe(firstNumber(row.price, quote?.price), estimates),
    sectorMedianForwardPe: estimateSectorMedianForwardPe(row.sector || profile?.sector),
    epsRevision90dPct: estimateRevision,
    cashFlowAnnual,
  });
  if (!baseCandidate.isEtf) return baseCandidate;
  const etfPayloads = await fetchEtfPayloads(stableBaseUrl, symbol, apiKey);
  return enrichEtfCandidateFromPayloads({ candidate: baseCandidate, ...etfPayloads });
}

async function fetchEtfPayloads(stableBaseUrl, symbol, apiKey) {
  const legacyBaseUrl = stableBaseUrl.replace(/\/stable$/, '/api/v3');
  const [info, holders, sectorWeights, countryWeights] = await Promise.all([
    fetchFirstOptional(stableBaseUrl, 'etf/info', symbol, apiKey),
    fetchEtfHolders({ stableBaseUrl, legacyBaseUrl, symbol, apiKey }),
    fetchArrayOptional(stableBaseUrl, 'etf/sector-weighting', symbol, apiKey),
    fetchArrayOptional(stableBaseUrl, 'etf/country-weighting', symbol, apiKey),
  ]);
  return { info, holders, sectorWeights, countryWeights };
}

async function fetchEtfHolders({ stableBaseUrl, legacyBaseUrl, symbol, apiKey }) {
  const attempts = [
    `${stableBaseUrl}/etf-holder?symbol=${symbol}&apikey=${apiKey}`,
    `${stableBaseUrl}/etf/holder?symbol=${symbol}&apikey=${apiKey}`,
    `${stableBaseUrl}/etf/holdings?symbol=${symbol}&apikey=${apiKey}`,
    `${legacyBaseUrl}/etf-holder/${symbol}?apikey=${apiKey}`,
  ];
  for (const url of attempts) {
    try {
      const data = await getJson(url, { retries: 1 });
      const rows = Array.isArray(data?.holdings) ? data.holdings : Array.isArray(data) ? data : [];
      if (rows.length) return rows;
    } catch {
      // FMP ETF endpoint spellings vary between stable and legacy docs.
    }
  }
  return [];
}

async function fetchFirstOptional(stableBaseUrl, endpoint, symbol, apiKey, extra = {}) {
  const rows = await fetchArrayOptional(stableBaseUrl, endpoint, symbol, apiKey, extra);
  return rows[0] || null;
}

async function fetchArrayOptional(stableBaseUrl, endpoint, symbol, apiKey, extra = {}) {
  const params = new URLSearchParams({ symbol, apikey: apiKey });
  for (const [key, value] of Object.entries(extra)) params.set(key, String(value));
  try {
    const data = await getJson(`${stableBaseUrl}/${endpoint}?${params.toString()}`, { retries: 1 });
    if (Array.isArray(data?.historical)) return data.historical;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function enrichEtfCandidateFromPayloads({ candidate, info = null, holders = [], sectorWeights = [], countryWeights = [] } = {}) {
  const base = normalizeCandidate(candidate || {});
  const holdingRows = Array.isArray(holders) ? holders : [];
  const weights = holdingRows
    .map(row => firstNumber(
      row.weightPercentage,
      row.weight,
      row.percentage,
      row.assetPercent,
      row.holdingPercent,
      row.marketValue && info?.assetsUnderManagement ? (row.marketValue / info.assetsUnderManagement) * 100 : null
    ))
    .filter(has)
    .sort((left, right) => right - left);
  const topTenHoldingWeightPct = weights.slice(0, 10).reduce((sum, weight) => sum + weight, 0);
  const infoAum = firstNumber(info?.assetsUnderManagement, info?.aum, info?.netAssets, info?.totalAssets);
  const expenseRatioPct = firstNumber(info?.expenseRatio, info?.expenseRatioPercentage, info?.netExpenseRatio);
  const nav = firstNumber(info?.nav, info?.netAssetValue, info?.netAssetValuePerShare);
  const price = firstNumber(base.price, info?.price, info?.marketPrice);
  const navDiscountPct = has(nav) && nav !== 0 && has(price) ? Math.round(((price - nav) / nav) * 10_000) / 100 : null;
  const sectorWeightValues = (Array.isArray(sectorWeights) ? sectorWeights : [])
    .map(row => firstNumber(row.weightPercentage, row.weight, row.percentage, row.exposure))
    .filter(has)
    .sort((left, right) => right - left);
  const countryWeightValues = (Array.isArray(countryWeights) ? countryWeights : [])
    .map(row => firstNumber(row.weightPercentage, row.weight, row.percentage, row.exposure))
    .filter(has)
    .sort((left, right) => right - left);
  const holdingConcentrationScore = has(topTenHoldingWeightPct) ? Math.max(0, 100 - topTenHoldingWeightPct) : null;
  return normalizeCandidate({
    ...base,
    aum: infoAum,
    expenseRatioPct,
    holdingCount: holdingRows.length || null,
    topTenHoldingWeightPct: weights.length ? topTenHoldingWeightPct : base.topTenHoldingWeightPct,
    topSectorWeightPct: sectorWeightValues[0] ?? base.topSectorWeightPct,
    topCountryWeightPct: countryWeightValues[0] ?? base.topCountryWeightPct,
    holdingConcentrationScore,
    navDiscountPct: has(navDiscountPct) ? navDiscountPct : base.navDiscountPct,
    navDiscountSourceStatus: has(navDiscountPct) ? 'live_nav' : (weights.length ? 'holdings_only' : 'unavailable'),
  });
}

async function fetchFirst(stableBaseUrl, endpoint, symbol, apiKey, extra = {}) {
  const data = await fetchArray(stableBaseUrl, endpoint, symbol, apiKey, extra).catch(() => []);
  return data[0] || null;
}

async function fetchArray(stableBaseUrl, endpoint, symbol, apiKey, extra = {}) {
  const params = new URLSearchParams({ symbol, apikey: apiKey });
  for (const [key, value] of Object.entries(extra)) params.set(key, String(value));
  const data = await getJson(`${stableBaseUrl}/${endpoint}?${params.toString()}`);
  if (Array.isArray(data?.historical)) return data.historical;
  return Array.isArray(data) ? data : [];
}

async function fetchHistoricalPrices(stableBaseUrl, symbol, apiKey, timeseries = 260) {
  const data = await getJson(`${stableBaseUrl}/historical-price-eod/full?symbol=${symbol}&timeseries=${timeseries}&apikey=${apiKey}`).catch(() => []);
  const rows = Array.isArray(data?.historical) ? data.historical : Array.isArray(data) ? data : [];
  return rows
    .map(row => ({ date: row.date, close: toNumber(row.close ?? row.adjClose) }))
    .filter(row => row.date && has(row.close))
    .sort((left, right) => String(left.date).localeCompare(String(right.date)));
}

async function fetchDividends(stableBaseUrl, symbol, apiKey) {
  const endpoints = ['historical-dividend', 'dividends'];
  for (const endpoint of endpoints) {
    try {
      const data = await getJson(`${stableBaseUrl}/${endpoint}?symbol=${symbol}&limit=20&apikey=${apiKey}`);
      const rows = Array.isArray(data?.historical) ? data.historical : Array.isArray(data) ? data : [];
      if (rows.length) return rows;
    } catch {
      // Try the next FMP spelling; plans differ by endpoint generation.
    }
  }
  return [];
}

function resolveRequestedPresets(flags = {}) {
  return resolveScreenerPresets({ preset: flags.preset, group: flags.group }, SCREEN_PRESETS);
}

function normalizeCandidate(candidate) {
  const normalized = { ...candidate };
  for (const key of [
    'marketCap', 'netCash', 'enterpriseValue', 'evToEbitda', 'freeCashFlow', 'revenue', 'ebitda',
    'currentRatio', 'debtToEquity', 'capexToRevenuePct', 'fcfMarginPct', 'fcfToNetIncomePct',
    'roicPct', 'revenueGrowthPct', 'dividendYieldPct', 'fcfPayoutPct', 'netDebtToEbitda',
    'return12mPct', 'volatility1mPct', 'netCashPctOfMarketCap', 'ncav', 'totalDebt',
    'currentAssets', 'positiveOperatingCashFlowYears', 'shareCountReduction3yPct',
    'fcfYieldPct', 'sbcToRevenuePct', 'shareholderYieldPct', 'revenueCagr3yPct',
    'ocfBeatsNetIncomeYears', 'cumulativeFcf10y', 'altmanZScore',
    'positiveOperatingCashFlowQuarters', 'grossMarginImprovementPct',
    'netDebtToEbitdaImprovement', 'beta', 'maxDrawdownPct', 'dividendGrowthPct',
    'inventoryToSalesGrowthRatio', 'drawdownFrom3yHighPct', 'operatingMarginPct',
    'buybackYieldPct', 'dollarVolume', 'analystCoverageCount', 'insiderBuyCount',
    'insiderBuyValue', 'daysSince52WeekHigh', 'forwardPe', 'sectorMedianForwardPe',
    'epsRevision90dPct', 'priceToBook', 'returnOnEquityPct', 'netMarginPct',
    'dividendPayoutPct', 'debtToEbitda', 'return1mPct', 'cash',
    'priceToTangibleBook', 'evToSales', 'grossMarginPct', 'operatingIncome',
    'inventoryToMarketCapPct', 'debtToTangibleBookPct', 'interestCoverage',
    'evToEbitdaVsPeerPct', 'ebitdaMarginPct', 'publicStakeToMarketCapPct',
    'stubEvToEbit', 'offerPremiumPct', 'daysToExpiration', 'annualizedSpreadPct',
    'subscriptionDiscountPct', 'proFormaDebtToEbitda', 'indexDeletionDrawdownPct',
    'activistStakePct', 'marginGapVsPeerPct', 'ceoInsiderBuyValue',
    'liquidityRunwayMonths', 'restructuringChargeToMarketCapPct', 'netIncome',
    'cashConversionCycleImprovementDays', 'inventoryGrowthPct', 'operatingCashFlow',
    'cashRunwayQuarters', 'rdToMarketCapPct', 'shelfToMarketCapPct',
    'debtToCapitalPct', 'tceToAssetsPct', 'npaRatioPct', 'dividendCoveragePct',
    'topTenHoldingWeightPct', 'navDiscountPct', 'commodityReturn6mPct',
    'return6mPct', 'ebitdaMarginImprovementPct', 'rollYieldPct',
    'aum', 'expenseRatioPct', 'holdingCount', 'topSectorWeightPct',
    'topCountryWeightPct', 'holdingConcentrationScore',
  ]) {
    normalized[key] = toNumber(normalized[key]);
  }
  normalized.symbol = String(normalized.symbol || '').toUpperCase();
  normalized.isEtf = normalized.isEtf === true || String(normalized.isEtf).toLowerCase() === 'true';
  return normalized;
}

function evaluateCandidateWithRegistryFilters(presetId, candidate) {
  const filters = PRESET_METADATA_BY_ID[presetId]?.filters?.filter(filter => filter.mode !== 'manual_overlay') || [];
  if (!filters.length) throw new Error(`Unknown screener preset "${presetId}"`);
  const checks = filters.map(filter => [
    `${filter.tradingViewField} ${filter.operator} ${formatThresholdForReason(filter.threshold)}`,
    evaluateFilter(candidate, filter),
  ]);
  return finishEvaluation(candidate, checks, scoreGenericRegistryCandidate(candidate, filters));
}

function evaluateFilter(candidate, filter) {
  const value = candidate[filter.metric];
  const threshold = resolveThreshold(candidate, filter.threshold);
  switch (filter.operator) {
    case '>': return has(value) && has(threshold) && value > threshold;
    case '>=': return has(value) && has(threshold) && value >= threshold;
    case '<': return has(value) && has(threshold) && value < threshold;
    case '<=': return has(value) && has(threshold) && value <= threshold;
    case '=': return value === threshold || String(value).toLowerCase() === String(threshold).toLowerCase();
    case 'between': return Array.isArray(filter.threshold) && has(value) && value >= resolveThreshold(candidate, filter.threshold[0]) && value <= resolveThreshold(candidate, filter.threshold[1]);
    case 'contains': return String(value || '').toLowerCase().includes(String(filter.threshold || '').toLowerCase());
    case 'derived':
    case 'proxy':
      return has(value);
    default:
      return has(value);
  }
}

function resolveThreshold(candidate, threshold) {
  if (Array.isArray(threshold)) return threshold.map(item => resolveThreshold(candidate, item));
  if (typeof threshold === 'boolean') return threshold;
  if (typeof threshold === 'string' && Object.prototype.hasOwnProperty.call(candidate, threshold)) return candidate[threshold];
  return toNumber(threshold);
}

function formatThresholdForReason(threshold) {
  return Array.isArray(threshold) ? threshold.join(' to ') : String(threshold);
}

function scoreGenericRegistryCandidate(candidate, filters) {
  return filters.reduce((score, filter) => {
    const value = candidate[filter.metric];
    if (!has(value) && typeof value !== 'boolean') return score;
    if (typeof value === 'boolean') return score + (value ? 10 : 0);
    if (filter.operator === '<' || filter.operator === '<=') {
      const threshold = resolveThreshold(candidate, filter.threshold);
      return score + (has(threshold) && threshold !== 0 ? Math.max(0, (threshold - value) / Math.abs(threshold)) * 20 : 5);
    }
    if (filter.operator === 'between' && Array.isArray(filter.threshold)) {
      const low = resolveThreshold(candidate, filter.threshold[0]);
      const high = resolveThreshold(candidate, filter.threshold[1]);
      const midpoint = (low + high) / 2;
      return score + Math.max(0, 20 - Math.abs(value - midpoint));
    }
    if (filter.operator === 'contains' || filter.operator === '=') return score + 10;
    return score + Math.min(40, Math.abs(value));
  }, 0);
}

function finishEvaluation(candidate, checks, score) {
  const failed = checks.find(([, passed]) => !passed);
  return {
    passed: !failed,
    reason: failed ? `Failed: ${failed[0]}` : 'Passed all preset guardrails',
    score: Number.isFinite(score) ? score : 0,
  };
}

function scoreCashBox(c) {
  return (ratio(c.netCash, c.marketCap) * 100) + Math.max(0, 4 - c.evToEbitda) * 10 + ratio(c.freeCashFlow, c.marketCap) * 100;
}

function scoreNegativeEv(c) {
  return Math.abs(ratio(c.enterpriseValue, c.marketCap)) * 100 + c.currentRatio * 10 + Math.max(0, 0.1 - c.debtToEquity) * 100;
}

function scoreCapitalLight(c) {
  return c.roicPct + c.fcfMarginPct + c.revenueGrowthPct + Math.max(0, 4 - c.capexToRevenuePct) * 5;
}

function scoreDividend(c) {
  return c.dividendYieldPct * 8 + Math.max(0, 70 - Math.abs(50 - c.fcfPayoutPct)) + Math.max(0, 2.5 - c.netDebtToEbitda) * 10;
}

function scoreMomentum(c) {
  return c.return12mPct - c.volatility1mPct + Math.max(0, 3 - c.netDebtToEbitda) * 8 + ratio(c.freeCashFlow, c.marketCap) * 100;
}

function scoreNcav(c) {
  return ratio(c.ncav, c.marketCap) * 60 + Math.max(0, 0.25 - ratio(c.totalDebt, c.currentAssets)) * 100 + c.positiveOperatingCashFlowYears * 8;
}

function scoreBuyback(c) {
  return c.shareCountReduction3yPct * 3 + c.fcfYieldPct * 4 + Math.max(0, 2 - c.netDebtToEbitda) * 8;
}

function scoreShareholderYield(c) {
  return c.shareholderYieldPct * 5 + c.revenueCagr3yPct * 2 + ratio(c.freeCashFlow, c.marketCap) * 100;
}

function scoreCashFlowOverlords(c) {
  return c.ocfBeatsNetIncomeYears * 8 + ratio(c.cumulativeFcf10y, c.marketCap) * 40 + Math.max(0, 0.5 - c.netDebtToEbitda) * 10;
}

function scoreChapter11(c) {
  return (3 - Math.abs(2.4 - c.altmanZScore)) * 12 + c.grossMarginImprovementPct * 5 + c.netDebtToEbitdaImprovement * 12;
}

function scoreLowVolMomentum(c) {
  return c.return12mPct - Math.abs(c.maxDrawdownPct) + Math.max(0, 0.8 - c.beta) * 30 + Math.max(0, c.dividendGrowthPct);
}

function scoreFadRetailer(c) {
  return c.inventoryToSalesGrowthRatio * 20 + Math.abs(c.drawdownFrom3yHighPct) * 0.5 + c.currentRatio * 8 + c.grossMarginImprovementPct * 5;
}

function scoreLegacyCpg(c) {
  return c.operatingMarginPct + c.fcfYieldPct * 3 + c.buybackYieldPct * 4 - Math.abs(c.revenueGrowthPct + 2.5);
}

function scoreMicroOrphan(c) {
  return Math.max(0, 150_000_000 - c.marketCap) / 1_000_000 + Math.max(0, 50_000 - c.dollarVolume) / 1_000 + c.insiderBuyCount * 10 + c.insiderBuyValue / 100_000;
}

function scoreFreshHigh(c) {
  return Math.max(0, 10 - c.daysSince52WeekHigh) * 5 + (c.sectorMedianForwardPe - c.forwardPe) + c.epsRevision90dPct * 2;
}

function scoreDepositBank(c) {
  return Math.max(0, 1.2 - c.priceToBook) * 50 + c.returnOnEquityPct + c.netMarginPct + Math.max(0, 1.5 - c.debtToEquity) * 5;
}

function scoreReit(c) {
  return c.dividendYieldPct * 6 + Math.max(0, 6 - c.debtToEbitda) * 10 + Math.max(0, 70 - Math.abs(60 - c.dividendPayoutPct));
}

function scoreEtf(c) {
  return Math.log10(Math.max(1, c.marketCap)) + Math.log10(Math.max(1, c.dollarVolume)) + Math.max(0, 1.2 - c.beta) * 10;
}

function scoreFdaUnderdog(c) {
  return Math.abs(c.return1mPct) + ratio(c.cash, c.marketCap) * 40;
}

function calculateFcfPayoutPct(dividends, freeCashFlow, marketCap, dividendYieldPct) {
  if (!has(freeCashFlow) || freeCashFlow <= 0 || !has(marketCap) || !has(dividendYieldPct)) return null;
  return (marketCap * (dividendYieldPct / 100)) / freeCashFlow * 100;
}

function detectDividendCut(dividends) {
  const amounts = dividends
    .map(row => toNumber(row.dividend ?? row.adjDividend ?? row.amount))
    .filter(has)
    .slice(0, 8);
  if (amounts.length < 4) return null;
  for (let i = 0; i < amounts.length - 1; i += 1) {
    if (amounts[i] < amounts[i + 1] * 0.8) return true;
  }
  return false;
}

function calculateReturnPct(prices, lookback) {
  if (!Array.isArray(prices) || prices.length < Math.min(lookback, 30)) return null;
  const latest = prices[prices.length - 1]?.close;
  const start = prices[Math.max(0, prices.length - 1 - lookback)]?.close;
  return has(latest) && has(start) && start !== 0 ? ((latest - start) / start) * 100 : null;
}

function calculateAnnualizedVolatilityPct(prices, lookback) {
  if (!Array.isArray(prices) || prices.length < lookback + 1) return null;
  const window = prices.slice(-lookback - 1);
  const returns = [];
  for (let i = 1; i < window.length; i += 1) {
    const prev = window[i - 1].close;
    const curr = window[i].close;
    if (has(prev) && has(curr) && prev > 0) returns.push(Math.log(curr / prev));
  }
  if (returns.length < 5) return null;
  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance = returns.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / returns.length;
  return Math.sqrt(variance) * Math.sqrt(252) * 100;
}

function calculateMaxDrawdownPct(prices) {
  if (!Array.isArray(prices) || prices.length < 2) return null;
  let peak = -Infinity;
  let maxDrawdown = 0;
  for (const row of prices) {
    if (!has(row.close)) continue;
    peak = Math.max(peak, row.close);
    if (peak > 0) maxDrawdown = Math.min(maxDrawdown, ((row.close - peak) / peak) * 100);
  }
  return maxDrawdown;
}

function calculateDrawdownFromHighPct(prices) {
  if (!Array.isArray(prices) || prices.length < 2) return null;
  const closes = prices.map(row => row.close).filter(has);
  if (closes.length < 2) return null;
  const high = Math.max(...closes);
  const latest = closes[closes.length - 1];
  return high > 0 ? ((latest - high) / high) * 100 : null;
}

function calculateDaysSinceHigh(prices, lookback) {
  if (!Array.isArray(prices) || prices.length < 2) return null;
  const window = prices.slice(-lookback).filter(row => has(row.close));
  if (!window.length) return null;
  let high = -Infinity;
  let highIndex = -1;
  window.forEach((row, index) => {
    if (row.close > high) {
      high = row.close;
      highIndex = index;
    }
  });
  return window.length - 1 - highIndex;
}

function calculateDividendGrowthPct(dividends) {
  const amounts = (dividends || [])
    .map(row => toNumber(row.dividend ?? row.adjDividend ?? row.amount))
    .filter(has);
  if (amounts.length < 2) return null;
  const latest = amounts[0];
  const older = amounts[Math.min(amounts.length - 1, 4)];
  return has(latest) && has(older) && older > 0 ? ((latest - older) / older) * 100 : null;
}

function countPositiveOperatingCashFlow(rows) {
  if (!Array.isArray(rows)) return 0;
  return rows.filter(row => firstNumber(row?.operatingCashFlow, row?.netCashProvidedByOperatingActivities) > 0).length;
}

function countOcfBeatsNetIncome(cashRows, incomeRows) {
  const byDate = new Map((incomeRows || []).map(row => [String(row.date || row.calendarYear || ''), row]));
  let count = 0;
  for (const cash of cashRows || []) {
    const key = String(cash.date || cash.calendarYear || '');
    const income = byDate.get(key) || incomeRows?.find(row => String(row.calendarYear || '') === String(cash.calendarYear || ''));
    const ocf = firstNumber(cash?.operatingCashFlow, cash?.netCashProvidedByOperatingActivities);
    const netIncome = firstNumber(income?.netIncome);
    if (has(ocf) && has(netIncome) && ocf > netIncome) count += 1;
  }
  return count;
}

function sumRecentFreeCashFlow(rows) {
  return (rows || [])
    .map(row => firstNumber(row?.freeCashFlow, sumNumbers(row?.operatingCashFlow, row?.capitalExpenditure)))
    .filter(has)
    .reduce((sum, value) => sum + value, 0);
}

function calculateDebtReductionYieldPct(balanceRows, marketCap) {
  if (!Array.isArray(balanceRows) || balanceRows.length < 2 || !has(marketCap) || marketCap === 0) return null;
  const latestDebt = firstNumber(balanceRows[0]?.totalDebt, sumNumbers(balanceRows[0]?.shortTermDebt, balanceRows[0]?.longTermDebt));
  const priorDebt = firstNumber(balanceRows[1]?.totalDebt, sumNumbers(balanceRows[1]?.shortTermDebt, balanceRows[1]?.longTermDebt));
  return has(latestDebt) && has(priorDebt) ? ((priorDebt - latestDebt) / marketCap) * 100 : null;
}

function calculateCagrPct(latest, old, years) {
  if (!has(latest) || !has(old) || latest <= 0 || old <= 0 || !years) return null;
  return ((latest / old) ** (1 / years) - 1) * 100;
}

function calculateGrossMarginImprovementPct(rows) {
  if (!Array.isArray(rows) || rows.length < 2) return null;
  const latest = grossMarginPct(rows[0]);
  const older = grossMarginPct(rows[Math.min(rows.length - 1, 4)]);
  return has(latest) && has(older) ? latest - older : null;
}

export function deriveFinancialSourceMetrics({
  marketCap = null,
  enterpriseValue = null,
  revenue = null,
  ebitda = null,
  operatingIncome = null,
  freeCashFlow = null,
  operatingCashFlow = null,
  netIncome = null,
  cash = null,
  totalDebt = null,
  totalAssets = null,
  stockholdersEquity = null,
  tangibleBook = null,
  dividends = [],
  income = null,
  incomeAnnual = [],
  incomeQuarterly = [],
  cashFlow = null,
  cashFlowQuarterly = [],
  balance = null,
  balanceQuarterly = [],
} = {}) {
  const latestInventory = firstNumber(balance?.inventory, balanceQuarterly?.[0]?.inventory);
  const tangibleEquity = firstNumber(tangibleBook, calculateTangibleBookValue(balance));
  const interestExpense = Math.abs(firstNumber(income?.interestExpense, income?.interestIncomeExpenseNet, income?.interestIncomeExpense, 0));
  const latestDividendsPaid = Math.abs(firstNumber(
    cashFlow?.dividendsPaid,
    cashFlow?.dividendsPayments,
    cashFlow?.commonDividendsPaid,
    calculateDividendCashPaid(dividends, marketCap, firstNumber(income?.weightedAverageShsOutDil, income?.weightedAverageShsOut))
  ));
  const latestCashFlow = firstNumber(freeCashFlow, operatingCashFlow, cashFlow?.freeCashFlow, cashFlow?.operatingCashFlow);
  const burnQuarters = calculateCashRunwayQuarters(cash, cashFlowQuarterly);
  const annualRunwayQuarters = has(cash) && has(latestCashFlow) && latestCashFlow < 0 ? cash / Math.abs(latestCashFlow / 4) : null;

  return {
    priceToTangibleBook: ratio(marketCap, tangibleEquity),
    evToSales: ratio(enterpriseValue, revenue),
    inventoryToMarketCapPct: ratio(latestInventory, marketCap) * 100,
    debtToTangibleBookPct: ratio(totalDebt, tangibleEquity) * 100,
    interestCoverage: has(interestExpense) && interestExpense > 0 ? firstNumber(operatingIncome, ebitda) / interestExpense : null,
    ebitdaMarginPct: ratio(ebitda, revenue) * 100,
    ebitdaMarginImprovementPct: calculateEbitdaMarginImprovementPct(incomeQuarterly.length ? incomeQuarterly : incomeAnnual),
    cashRunwayQuarters: firstNumber(burnQuarters, annualRunwayQuarters),
    liquidityRunwayMonths: firstNumber(burnQuarters, annualRunwayQuarters) * 3,
    rdToMarketCapPct: ratio(firstNumber(income?.researchAndDevelopmentExpenses, income?.researchAndDevelopmentExpense), marketCap) * 100,
    inventoryGrowthPct: calculateInventoryGrowthPct(balanceQuarterly),
    cashConversionCycleImprovementDays: calculateCashConversionCycleImprovementDays(balanceQuarterly, incomeQuarterly),
    tceToAssetsPct: ratio(tangibleEquity, totalAssets) * 100,
    dividendCoveragePct: has(latestDividendsPaid) && latestDividendsPaid > 0 ? ratio(freeCashFlow, latestDividendsPaid) * 100 : null,
    netIncome,
    operatingCashFlow,
  };
}

function grossMarginPct(row) {
  const grossProfit = firstNumber(row?.grossProfit);
  const revenue = firstNumber(row?.revenue);
  return ratio(grossProfit, revenue) * 100;
}

function calculateTangibleBookValue(balance) {
  const equity = firstNumber(balance?.totalStockholdersEquity, balance?.totalEquity);
  const intangibles = firstNumber(
    balance?.goodwillAndIntangibleAssets,
    sumNumbers(balance?.goodwill, balance?.intangibleAssets),
    0
  );
  return has(equity) ? equity - intangibles : null;
}

function calculateDividendCashPaid(dividends, marketCap, shares) {
  if (!Array.isArray(dividends) || !dividends.length || !has(shares)) return null;
  const latestYear = String(dividends[0]?.date || '').slice(0, 4);
  const annualPerShare = dividends
    .filter(row => String(row.date || '').startsWith(latestYear))
    .reduce((sum, row) => sum + firstNumber(row.dividend, row.adjDividend, 0), 0);
  return has(annualPerShare) && annualPerShare > 0 ? annualPerShare * shares : null;
}

function calculateCashRunwayQuarters(cash, cashRows) {
  if (!has(cash) || !Array.isArray(cashRows) || !cashRows.length) return null;
  const burns = cashRows
    .slice(0, 4)
    .map(row => firstNumber(row.freeCashFlow, row.operatingCashFlow, row.netCashProvidedByOperatingActivities))
    .filter(value => has(value) && value < 0)
    .map(value => Math.abs(value));
  if (!burns.length) return null;
  const averageBurn = burns.reduce((sum, value) => sum + value, 0) / burns.length;
  return averageBurn > 0 ? cash / averageBurn : null;
}

function calculateEbitdaMarginImprovementPct(rows) {
  if (!Array.isArray(rows) || rows.length < 2) return null;
  const latest = ebitdaMarginPct(rows[0]);
  const older = ebitdaMarginPct(rows[Math.min(rows.length - 1, 4)]);
  return has(latest) && has(older) ? latest - older : null;
}

function ebitdaMarginPct(row) {
  return ratio(firstNumber(row?.ebitda, row?.operatingIncome), firstNumber(row?.revenue)) * 100;
}

function calculateInventoryGrowthPct(balanceRows) {
  if (!Array.isArray(balanceRows) || balanceRows.length < 2) return null;
  const latest = firstNumber(balanceRows[0]?.inventory);
  const prior = firstNumber(balanceRows[1]?.inventory);
  return has(latest) && has(prior) && prior !== 0 ? ((latest - prior) / Math.abs(prior)) * 100 : null;
}

function calculateCashConversionCycleImprovementDays(balanceRows, incomeRows) {
  if (!Array.isArray(balanceRows) || !Array.isArray(incomeRows) || balanceRows.length < 2 || incomeRows.length < 2) return null;
  const latest = cashConversionCycleDays(balanceRows[0], incomeRows[0]);
  const prior = cashConversionCycleDays(balanceRows[1], incomeRows[1]);
  return has(latest) && has(prior) ? prior - latest : null;
}

function cashConversionCycleDays(balance, income) {
  const inventory = firstNumber(balance?.inventory);
  const receivables = firstNumber(balance?.netReceivables, balance?.accountsReceivables);
  const payables = firstNumber(balance?.accountPayables, balance?.accountsPayables);
  const revenue = firstNumber(income?.revenue);
  const costOfRevenue = firstNumber(income?.costOfRevenue);
  if (![inventory, receivables, payables, revenue, costOfRevenue].every(has) || revenue === 0 || costOfRevenue === 0) return null;
  return (inventory / Math.abs(costOfRevenue) * 365) + (receivables / Math.abs(revenue) * 365) - (payables / Math.abs(costOfRevenue) * 365);
}

function calculateNetDebtToEbitdaImprovement(balanceRows, incomeRows) {
  if (!Array.isArray(balanceRows) || !Array.isArray(incomeRows) || balanceRows.length < 2 || incomeRows.length < 2) return null;
  const latest = netDebtToEbitdaFromRows(balanceRows[0], incomeRows[0]);
  const prior = netDebtToEbitdaFromRows(balanceRows[1], incomeRows[1]);
  return has(latest) && has(prior) ? prior - latest : null;
}

function netDebtToEbitdaFromRows(balance, income) {
  const debt = firstNumber(balance?.totalDebt, sumNumbers(balance?.shortTermDebt, balance?.longTermDebt));
  const cash = firstNumber(balance?.cashAndShortTermInvestments, sumNumbers(balance?.cashAndCashEquivalents, balance?.shortTermInvestments), 0);
  const ebitda = firstNumber(income?.ebitda, income?.operatingIncome);
  return has(debt) && has(cash) && has(ebitda) && ebitda !== 0 ? (debt - cash) / ebitda : null;
}

function calculateInventoryToSalesGrowthRatio(balanceRows, incomeRows) {
  if (!Array.isArray(balanceRows) || !Array.isArray(incomeRows) || balanceRows.length < 2 || incomeRows.length < 2) return null;
  const latestInventory = firstNumber(balanceRows[0]?.inventory);
  const priorInventory = firstNumber(balanceRows[1]?.inventory);
  const latestRevenue = firstNumber(incomeRows[0]?.revenue);
  const priorRevenue = firstNumber(incomeRows[1]?.revenue);
  if (![latestInventory, priorInventory, latestRevenue, priorRevenue].every(has) || priorInventory === 0 || priorRevenue === 0) return null;
  const inventoryGrowth = latestInventory / priorInventory;
  const salesGrowth = latestRevenue / priorRevenue;
  return salesGrowth !== 0 ? inventoryGrowth / salesGrowth : null;
}

function summarizeInsiderBuys(rows) {
  let count = 0;
  let value = 0;
  for (const row of rows || []) {
    const code = String(row.transactionType || row.transactionCode || row.acquisitionOrDisposition || '').toUpperCase();
    const isBuy = code === 'P' || code === 'A' || /BUY|PURCHASE|ACQUISITION/.test(code);
    if (!isBuy) continue;
    const shares = firstNumber(row.securitiesTransacted, row.transactionShares, row.shares);
    const price = firstNumber(row.price, row.transactionPrice);
    count += 1;
    if (has(shares) && has(price)) value += shares * price;
  }
  return { count, value };
}

function calculateForwardPe(price, estimates) {
  const eps = firstNumber(estimates?.[0]?.estimatedEpsAvg, estimates?.[0]?.epsAvg, estimates?.[0]?.estimatedEps);
  return has(price) && has(eps) && eps > 0 ? price / eps : null;
}

function estimateSectorMedianForwardPe(sector) {
  const map = new Map([
    ['Technology', 28],
    ['Healthcare', 20],
    ['Consumer Cyclical', 18],
    ['Consumer Defensive', 19],
    ['Industrials', 21],
    ['Financial Services', 13],
    ['Energy', 12],
    ['Utilities', 17],
    ['Real Estate', 18],
    ['Communication Services', 19],
    ['Basic Materials', 16],
  ]);
  return map.get(String(sector || '').trim()) ?? 20;
}

function calculateEstimateRevisionPct(estimates) {
  if (!Array.isArray(estimates) || estimates.length < 2) return null;
  const latest = firstNumber(estimates[0]?.estimatedEpsAvg, estimates[0]?.epsAvg, estimates[0]?.estimatedEps);
  const prior = firstNumber(estimates[1]?.estimatedEpsAvg, estimates[1]?.epsAvg, estimates[1]?.estimatedEps);
  return has(latest) && has(prior) && prior !== 0 ? ((latest - prior) / Math.abs(prior)) * 100 : null;
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(Math.max(1, concurrency), items.length || 1) }, () => worker()));
  return results;
}

function parseIntegerFlag(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function formatMetric(value, suffix) {
  if (!has(value)) return 'N/A';
  if (suffix === '$') return formatNumber(value, { style: 'currency' });
  if (suffix === '%') return `${value.toFixed(1)}%`;
  if (suffix === 'x') return `${value.toFixed(2)}x`;
  return String(value);
}

function percentFromMaybeRatio(value) {
  if (!has(value)) return null;
  return Math.abs(value) <= 1 ? value * 100 : value;
}

function firstNumber(...values) {
  for (const value of values) {
    const parsed = toNumber(value);
    if (has(parsed)) return parsed;
  }
  return null;
}

function sumNumbers(...values) {
  const parsed = values.map(toNumber).filter(has);
  return parsed.length ? parsed.reduce((sum, value) => sum + value, 0) : null;
}

function ratio(numerator, denominator) {
  return has(numerator) && has(denominator) && denominator !== 0 ? numerator / denominator : NaN;
}

function has(value) {
  return Number.isFinite(value);
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return NaN;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}
