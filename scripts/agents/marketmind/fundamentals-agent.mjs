import {
  fetchBalanceSheetQuarterly,
  fetchCashFlowAnnual,
  fetchCashFlowQuarterly,
  fetchIncomeAnnual,
  fetchProfile,
} from '../../lib/fmp-client.mjs';
import { classifyDirectionalScore, confidenceFromScore, makeAgentSignal } from './schemas.mjs';
import { compactNumber, formatPercent } from './utils.mjs';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const _require = createRequire(import.meta.url);
const CFQ_CONFIG = _require(resolve(__dirname, '../../config/strategy_thresholds.json')).cfq;

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
  const [profileResult, incomeResult, cashFlowResult, balanceResult, annualCfResult] = await Promise.allSettled([
    fetchProfile(symbol),
    fetchIncomeAnnual(symbol, { limit: 4 }),
    fetchCashFlowQuarterly(symbol, { limit: 8 }),
    fetchBalanceSheetQuarterly(symbol, { limit: 4 }),
    fetchCashFlowAnnual(symbol, { limit: 4 }),
  ]);

  const warnings = [];
  if (profileResult.status === 'rejected') warnings.push(`Profile unavailable: ${profileResult.reason?.message || profileResult.reason}`);
  if (incomeResult.status === 'rejected') warnings.push(`Income statements unavailable: ${incomeResult.reason?.message || incomeResult.reason}`);
  if (cashFlowResult.status === 'rejected') warnings.push(`Cash flows unavailable: ${cashFlowResult.reason?.message || cashFlowResult.reason}`);
  if (balanceResult.status === 'rejected') warnings.push(`Balance sheet unavailable: ${balanceResult.reason?.message || balanceResult.reason}`);
  if (annualCfResult.status === 'rejected') warnings.push(`Annual cash flows unavailable: ${annualCfResult.reason?.message || annualCfResult.reason}`);

  const profile   = profileResult.status === 'fulfilled' ? profileResult.value       : null;
  const income    = incomeResult.status === 'fulfilled'  ? incomeResult.value        : [];
  const cashFlows = cashFlowResult.status === 'fulfilled' ? cashFlowResult.value     : [];
  const balance   = balanceResult.status === 'fulfilled' ? balanceResult.value       : [];
  const annualCf  = annualCfResult.status === 'fulfilled' ? annualCfResult.value     : [];
  const latestBalance = balance[0] ?? null;

  const latestIncome = income[0] || null;
  const priorIncome = income[1] || null;
  const revenueGrowth = pctChange(latestIncome?.revenue, priorIncome?.revenue);
  const grossMarginRatio = ratio(latestIncome?.grossProfit, latestIncome?.revenue);
  const netMarginRatio = ratio(latestIncome?.netIncome, latestIncome?.revenue);
  const grossMargin = Number.isFinite(grossMarginRatio) ? grossMarginRatio * 100 : null;
  const netMargin = Number.isFinite(netMarginRatio) ? netMarginRatio * 100 : null;
  const fcf = sumField(cashFlows, 'freeCashFlow') || sumField(cashFlows, 'operatingCashFlow') + sumField(cashFlows, 'capitalExpenditure');
  const cash = Number(latestBalance?.cashAndCashEquivalents ?? latestBalance?.cashAndShortTermInvestments);
  const debt = Number(latestBalance?.totalDebt ?? (Number(latestBalance?.shortTermDebt || 0) + Number(latestBalance?.longTermDebt || 0)));
  const netCash = Number.isFinite(cash) && Number.isFinite(debt) ? cash - debt : null;

  // Cash-flow quality composite score
  const cfqResult = computeCfqScore({ income, cashFlows, annualCf, balance });

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
  // CFQ bonus/penalty
  if (cfqResult.cfq_score >= CFQ_CONFIG.high_quality_min)  score += 0.3;
  if (cfqResult.cfq_score <= CFQ_CONFIG.low_quality_max)   score -= 0.3;

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
      company_name:       profile?.companyName || null,
      sector:             profile?.sector || null,
      industry:           profile?.industry || null,
      market_cap:         Number(profile?.marketCap) || null,
      revenue_growth_pct: finiteRound(revenueGrowth),
      gross_margin_pct:   finiteRound(grossMargin),
      net_margin_pct:     finiteRound(netMargin),
      trailing_fcf:       Number.isFinite(fcf) ? fcf : null,
      cash:               Number.isFinite(cash) ? cash : null,
      total_debt:         Number.isFinite(debt) ? debt : null,
      net_cash:           Number.isFinite(netCash) ? netCash : null,
      cfq_score:          cfqResult.cfq_score,
      cfq_label:          cfqResult.cfq_label,
      cfq_factors:        cfqResult.cfq_factors,
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

// ─── Cash-Flow Quality Score ─────────────────────────────────────────────────

function computeCfqScore({ income, cashFlows, annualCf, balance }) {
  const w = CFQ_CONFIG.weights;

  // Use annual CF for multi-year OCF trend; fall back to quarterly
  const cfSource = annualCf.length >= 2 ? annualCf : cashFlows;
  const ocfValues = cfSource.map(cf => Number(cf?.operatingCashFlow)).filter(Number.isFinite);

  const ttmQ = cashFlows.slice(0, 4);
  const ttmFcf      = ttmQ.reduce((s, q) => s + (Number(q?.freeCashFlow) || 0), 0) || null;
  const ttmOcf      = ttmQ.reduce((s, q) => s + (Number(q?.operatingCashFlow) || 0), 0) || null;
  const ttmCapex    = Math.abs(ttmQ.reduce((s, q) => s + (Number(q?.capitalExpenditure) || 0), 0));
  const ttmRevenue  = Number(income[0]?.revenue) || null;
  const ttmNetInc   = Number(income[0]?.netIncome) || null;
  const latestBal   = Array.isArray(balance) ? balance[0] : balance;

  const factors = {};

  // 1. OCF durability (0–5): positive OCF, growing trend
  factors.ocf_durability = scoreOcfDurability(ocfValues);

  // 2. FCF conversion (0–5): FCF / Net Income
  factors.fcf_conversion = scoreFcfConversion(ttmFcf, ttmNetInc);

  // 3. FCF margin (0–5): TTM FCF / Revenue
  factors.fcf_margin = scoreFcfMargin(ttmFcf, ttmRevenue);

  // 4. Capital intensity inverse (0–5): lower capex/revenue → higher score
  factors.capital_intensity = scoreCapitalIntensity(ttmCapex, ttmRevenue);

  // 5. Pricing power (0–5): gross margin stability + revenue growth
  factors.pricing_power = scorePricingPower(income);

  // 6. Balance sheet (0–5): net debt coverage
  factors.balance_sheet = scoreBalanceSheet(latestBal, income[0]);

  // 7. Share count quality (0–5): low dilution trend
  factors.share_count_quality = scoreShareCount(income);

  // 8. Margin stability (0–5): operating margin trend
  factors.margin_stability = scoreMarginStability(income);

  const composite =
    w.ocf_durability      * (factors.ocf_durability      ?? 2.5) +
    w.fcf_conversion      * (factors.fcf_conversion      ?? 2.5) +
    w.fcf_margin          * (factors.fcf_margin           ?? 2.5) +
    w.capital_intensity   * (factors.capital_intensity    ?? 2.5) +
    w.pricing_power       * (factors.pricing_power        ?? 2.5) +
    w.balance_sheet       * (factors.balance_sheet        ?? 2.5) +
    w.share_count_quality * (factors.share_count_quality  ?? 2.5) +
    w.margin_stability    * (factors.margin_stability     ?? 2.5);

  const cfqScore = Number(composite.toFixed(2));
  return {
    cfq_score:   cfqScore,
    cfq_label:   cfqScore >= CFQ_CONFIG.high_quality_min ? 'high' : cfqScore >= CFQ_CONFIG.acceptable_min ? 'acceptable' : 'low',
    cfq_factors: factors,
  };
}

function scoreOcfDurability(ocfValues) {
  if (!ocfValues.length) return 2.5;
  const positiveYears = ocfValues.filter(v => v > 0).length;
  let s = (positiveYears / ocfValues.length) * 3; // 0–3
  if (ocfValues.length >= 2 && ocfValues[0] > ocfValues[ocfValues.length - 1]) s += 1; // growing
  if (ocfValues.length >= 3) {
    const stable = ocfValues.slice(1).every((v, i) => Math.abs(v - ocfValues[i]) / Math.max(Math.abs(ocfValues[i]), 1) < 0.3);
    if (stable) s += 1;
  }
  return Number(Math.min(s, 5).toFixed(2));
}

function scoreFcfConversion(fcf, netIncome) {
  if (!Number.isFinite(fcf) || !Number.isFinite(netIncome) || netIncome === 0) return 2.5;
  const conv = fcf / netIncome;
  if (conv >= 1.2) return 5;
  if (conv >= 0.9) return 4;
  if (conv >= 0.6) return 3;
  if (conv >= 0.3) return 2;
  if (conv >= 0)   return 1;
  return 0;
}

function scoreFcfMargin(fcf, revenue) {
  if (!Number.isFinite(fcf) || !Number.isFinite(revenue) || revenue <= 0) return 2.5;
  const margin = (fcf / revenue) * 100;
  if (margin >= 25) return 5;
  if (margin >= 15) return 4;
  if (margin >= 8)  return 3;
  if (margin >= 3)  return 2;
  if (margin >= 0)  return 1;
  return 0;
}

function scoreCapitalIntensity(capex, revenue) {
  if (!Number.isFinite(capex) || !Number.isFinite(revenue) || revenue <= 0) return 2.5;
  const intensity = (capex / revenue) * 100;
  if (intensity <= 2)  return 5;
  if (intensity <= 5)  return 4;
  if (intensity <= 10) return 3;
  if (intensity <= 20) return 2;
  if (intensity <= 35) return 1;
  return 0;
}

function scorePricingPower(income) {
  if (income.length < 2) return 2.5;
  const gms = income.map(y => ratio(y?.grossProfit, y?.revenue)).filter(v => Number.isFinite(v) && v > 0);
  if (gms.length < 2) return 2.5;
  const avgGm = gms.reduce((s, v) => s + v, 0) / gms.length;
  const stable = gms.every(v => Math.abs(v - avgGm) < 0.05);
  const growth = pctChange(income[0]?.revenue, income[income.length - 1]?.revenue);
  let s = avgGm >= 0.5 ? 2 : avgGm >= 0.35 ? 1.5 : avgGm >= 0.2 ? 1 : 0.5;
  if (stable) s += 1;
  if (Number.isFinite(growth) && growth > 10) s += 1;
  if (Number.isFinite(growth) && growth > 20) s += 1;
  return Number(Math.min(s, 5).toFixed(2));
}

function scoreBalanceSheet(bal, latestIncome) {
  if (!bal) return 2.5;
  const cash = Number(bal.cashAndCashEquivalents ?? bal.cashAndShortTermInvestments ?? 0);
  const debt = Number(bal.totalDebt ?? (Number(bal.shortTermDebt || 0) + Number(bal.longTermDebt || 0)));
  const ebitda = Number.isFinite(Number(latestIncome?.ebitda))
    ? Number(latestIncome.ebitda)
    : (Number(latestIncome?.operatingIncome || 0) + Number(latestIncome?.depreciationAndAmortization || 0));
  const netDebt = debt - cash;
  if (ebitda > 0) {
    const leverage = netDebt / ebitda;
    if (leverage <= 0)   return 5;
    if (leverage <= 1)   return 4;
    if (leverage <= 2.5) return 3;
    if (leverage <= 4)   return 2;
    return 1;
  }
  return netDebt <= 0 ? 4 : 2;
}

function scoreShareCount(income) {
  if (income.length < 2) return 2.5;
  const shares = income.map(y => Number(y?.weightedAverageShsOut)).filter(Number.isFinite);
  if (shares.length < 2) return 2.5;
  const change = pctChange(shares[0], shares[shares.length - 1]);
  if (!Number.isFinite(change)) return 2.5;
  if (change <= -5)  return 5;
  if (change <= 0)   return 4;
  if (change <= 3)   return 3;
  if (change <= 8)   return 2;
  return 1;
}

function scoreMarginStability(income) {
  if (income.length < 2) return 2.5;
  const opMargins = income.map(y => ratio(y?.operatingIncome, y?.revenue)).filter(v => Number.isFinite(v));
  if (opMargins.length < 2) return 2.5;
  const avg = opMargins.reduce((s, v) => s + v, 0) / opMargins.length;
  const stable = opMargins.every(v => Math.abs(v - avg) < 0.04);
  let s = avg >= 0.20 ? 2 : avg >= 0.10 ? 1.5 : avg >= 0.05 ? 1 : 0.5;
  if (stable) s += 1.5;
  if (opMargins[0] > opMargins[opMargins.length - 1]) s += 1;
  return Number(Math.min(s, 5).toFixed(2));
}
