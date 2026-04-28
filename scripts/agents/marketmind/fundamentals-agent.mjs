import {
  fetchBalanceSheetQuarterly,
  fetchCashFlowQuarterly,
  fetchIncomeAnnual,
  fetchProfile,
} from '../../lib/fmp-client.mjs';
import { classifyDirectionalScore, confidenceFromScore, makeAgentSignal } from './schemas.mjs';
import { compactNumber, formatPercent } from './utils.mjs';

export async function runFundamentalsAgent(state) {
  if (state.asset_type === 'crypto') {
    return makeAgentSignal({
      agent: 'fundamentals',
      signal: 'NEUTRAL',
      confidence: 0.1,
      summary: 'Equity fundamentals are not applicable to crypto assets in this slice.',
      raw_data: {},
    });
  }

  const symbol = String(state.symbol || '').toUpperCase();
  const [profileResult, incomeResult, cashFlowResult, balanceResult] = await Promise.allSettled([
    fetchProfile(symbol),
    fetchIncomeAnnual(symbol, { limit: 4 }),
    fetchCashFlowQuarterly(symbol, { limit: 4 }),
    fetchBalanceSheetQuarterly(symbol, { limit: 1 }),
  ]);

  const warnings = [];
  if (profileResult.status === 'rejected') warnings.push(`Profile unavailable: ${profileResult.reason?.message || profileResult.reason}`);
  if (incomeResult.status === 'rejected') warnings.push(`Income statements unavailable: ${incomeResult.reason?.message || incomeResult.reason}`);
  if (cashFlowResult.status === 'rejected') warnings.push(`Cash flows unavailable: ${cashFlowResult.reason?.message || cashFlowResult.reason}`);
  if (balanceResult.status === 'rejected') warnings.push(`Balance sheet unavailable: ${balanceResult.reason?.message || balanceResult.reason}`);

  const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
  const income = incomeResult.status === 'fulfilled' ? incomeResult.value : [];
  const cashFlows = cashFlowResult.status === 'fulfilled' ? cashFlowResult.value : [];
  const balance = balanceResult.status === 'fulfilled' ? balanceResult.value?.[0] : null;

  const latestIncome = income[0] || null;
  const priorIncome = income[1] || null;
  const revenueGrowth = pctChange(latestIncome?.revenue, priorIncome?.revenue);
  const grossMarginRatio = ratio(latestIncome?.grossProfit, latestIncome?.revenue);
  const netMarginRatio = ratio(latestIncome?.netIncome, latestIncome?.revenue);
  const grossMargin = Number.isFinite(grossMarginRatio) ? grossMarginRatio * 100 : null;
  const netMargin = Number.isFinite(netMarginRatio) ? netMarginRatio * 100 : null;
  const fcf = sumField(cashFlows, 'freeCashFlow') || sumField(cashFlows, 'operatingCashFlow') + sumField(cashFlows, 'capitalExpenditure');
  const cash = Number(balance?.cashAndCashEquivalents ?? balance?.cashAndShortTermInvestments);
  const debt = Number(balance?.totalDebt ?? (Number(balance?.shortTermDebt || 0) + Number(balance?.longTermDebt || 0)));
  const netCash = Number.isFinite(cash) && Number.isFinite(debt) ? cash - debt : null;

  let score = 0;
  if (Number.isFinite(revenueGrowth) && revenueGrowth > 12) score += 0.7;
  else if (Number.isFinite(revenueGrowth) && revenueGrowth < -5) score -= 0.7;
  if (Number.isFinite(grossMargin) && grossMargin > 45) score += 0.35;
  if (Number.isFinite(netMargin) && netMargin > 8) score += 0.45;
  if (Number.isFinite(netMargin) && netMargin < -10) score -= 0.45;
  if (Number.isFinite(fcf) && fcf > 0) score += 0.5;
  if (Number.isFinite(fcf) && fcf < 0) score -= 0.45;
  if (Number.isFinite(netCash) && netCash > 0) score += 0.25;
  if (Number.isFinite(netCash) && netCash < -5_000_000_000) score -= 0.35;

  const signal = classifyDirectionalScore(score, 0.4);
  const confidence = confidenceFromScore(score, { base: 0.24, scale: 0.16, max: 0.78 });

  return makeAgentSignal({
    agent: 'fundamentals',
    signal,
    confidence,
    summary: `Revenue growth ${formatPercent(revenueGrowth)}, net margin ${formatPercent(netMargin)}, trailing FCF ${compactNumber(fcf)}.`,
    evidence: [
      `Sector: ${profile?.sector || 'N/A'}`,
      `Revenue growth: ${formatPercent(revenueGrowth)}`,
      `Net cash: ${compactNumber(netCash)}`,
    ],
    warnings,
    raw_data: {
      company_name: profile?.companyName || null,
      sector: profile?.sector || null,
      industry: profile?.industry || null,
      market_cap: Number(profile?.marketCap) || null,
      revenue_growth_pct: finiteRound(revenueGrowth),
      gross_margin_pct: finiteRound(grossMargin),
      net_margin_pct: finiteRound(netMargin),
      trailing_fcf: Number.isFinite(fcf) ? fcf : null,
      cash: Number.isFinite(cash) ? cash : null,
      total_debt: Number.isFinite(debt) ? debt : null,
      net_cash: Number.isFinite(netCash) ? netCash : null,
    },
  });
}

function pctChange(latest, prior) {
  const a = Number(latest);
  const b = Number(prior);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
  return ((a - b) / Math.abs(b)) * 100;
}

function ratio(a, b) {
  const numerator = Number(a);
  const denominator = Number(b);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return null;
  return numerator / denominator;
}

function sumField(rows, field) {
  if (!Array.isArray(rows) || !rows.length) return null;
  return rows.reduce((sum, row) => sum + (Number(row?.[field]) || 0), 0);
}

function finiteRound(value) {
  return Number.isFinite(value) ? Number(value.toFixed(2)) : null;
}
