import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

import {
  fetchBalanceSheetAnnual,
  fetchCashFlowAnnual,
  fetchIncomeAnnual,
  fetchProfile,
  fetchQuote,
} from '../fmp-client.mjs';
import { fetchCompanyFacts, fetchTickerMap, latestConceptValue } from '../edgar.mjs';
import { getEngineCacheDir } from '../config.mjs';

const WATCHLISTS_PATH = resolve(import.meta.dirname, '..', '..', 'config', 'watchlists.json');

const CONCEPT_ALIASES = Object.freeze({
  revenue: ['Revenues', 'RevenueFromContractWithCustomerExcludingAssessedTax', 'SalesRevenueNet'],
  costOfRevenue: ['CostOfRevenue', 'CostOfGoodsAndServicesSold'],
  grossProfit: ['GrossProfit'],
  operatingIncome: ['OperatingIncomeLoss'],
  netIncome: ['NetIncomeLoss', 'ProfitLoss'],
  totalAssets: ['Assets'],
  totalCurrentAssets: ['AssetsCurrent'],
  cashAndShortTermInvestments: ['CashAndCashEquivalentsAtCarryingValue', 'CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents'],
  netReceivables: ['AccountsReceivableNetCurrent', 'ReceivablesNetCurrent'],
  propertyPlantEquipmentNet: ['PropertyPlantAndEquipmentNet'],
  totalLiabilities: ['Liabilities'],
  totalCurrentLiabilities: ['LiabilitiesCurrent'],
  totalDebt: ['LongTermDebtAndFinanceLeaseObligationsCurrent', 'LongTermDebtCurrent', 'LongTermDebtNoncurrent'],
  retainedEarnings: ['RetainedEarningsAccumulatedDeficit'],
  depreciationAndAmortization: ['DepreciationDepletionAndAmortization', 'DepreciationAndAmortization'],
  operatingCashFlow: ['NetCashProvidedByUsedInOperatingActivities'],
});

export async function resolveSymbolsFromFlags(flags = {}) {
  if (flags.symbols) return parseCsv(flags.symbols);
  if (flags.tickers) return parseCsv(flags.tickers);
  if (flags.watchlist) return loadWatchlistSymbols(String(flags.watchlist));
  throw new Error('Provide --symbols <CSV> or --watchlist <name>.');
}

export async function loadWatchlistSymbols(name) {
  const raw = await readFile(WATCHLISTS_PATH, 'utf-8');
  const watchlists = JSON.parse(raw);
  const value = watchlists[name];
  if (!value) throw new Error(`Unknown watchlist "${name}".`);
  if (Array.isArray(value)) return parseCsv(value.join(','));
  if (typeof value === 'object') return [...new Set(Object.values(value).flat().map(normalizeSymbol).filter(Boolean))];
  throw new Error(`Watchlist "${name}" is not a symbol list.`);
}

export async function loadEquityForensicDataset(symbol) {
  const normalized = normalizeSymbol(symbol);
  const [profile, quote, income, balance, cashFlow] = await Promise.all([
    fetchProfile(normalized).catch(error => ({ error })),
    fetchQuote(normalized).catch(error => ({ error })),
    fetchIncomeAnnual(normalized, { limit: 3 }).catch(error => ({ error })),
    fetchBalanceSheetAnnual(normalized, { limit: 3 }).catch(error => ({ error })),
    fetchCashFlowAnnual(normalized, { limit: 3 }).catch(error => ({ error })),
  ]);

  const warnings = [];
  for (const [name, value] of Object.entries({ profile, quote, income, balance, cashFlow })) {
    if (value?.error) warnings.push(`${name} unavailable: ${value.error.message}`);
  }

  const annual = assembleAnnualRows({
    income: Array.isArray(income) ? income : [],
    balance: Array.isArray(balance) ? balance : [],
    cashFlow: Array.isArray(cashFlow) ? cashFlow : [],
    marketCap: Number(quote?.marketCap ?? profile?.mktCap ?? profile?.marketCap) || null,
  });

  let edgar = null;
  if (annual.length < 2) {
    edgar = await loadSecCompanyFactsDataset(normalized).catch(error => {
      warnings.push(`SEC companyfacts unavailable: ${error.message}`);
      return null;
    });
  }

  const dataset = annual.length >= 2 ? {
    symbol: normalized,
    companyName: profile?.companyName ?? normalized,
    annual,
    warnings,
    provenance: {
      provider: 'FMP Premium annual statements',
      periods: annual.map(row => row.fiscalYear).filter(Boolean),
      concepts: [
        'income-statement annual',
        'balance-sheet-statement annual',
        'cash-flow-statement annual',
        'quote/profile marketCap',
      ],
      sourcePath: `FMP stable endpoints for ${normalized}`,
    },
  } : edgar;

  if (!dataset || !Array.isArray(dataset.annual) || dataset.annual.length < 2) {
    throw new Error(`Insufficient annual statement data for ${normalized}.`);
  }
  return dataset;
}

export async function loadSecCompanyFactsDataset(symbol) {
  const tickerMap = await fetchTickerMap();
  const entry = tickerMap.get(normalizeSymbol(symbol));
  if (!entry?.cik) throw new Error(`No SEC CIK found for ${symbol}.`);
  const facts = await fetchCompanyFacts(entry.cik);
  if (!facts) throw new Error(`No SEC companyfacts found for ${symbol}.`);

  const annual = ['10-K', '10-K/A']
    .flatMap(form => buildAnnualRowsFromFacts(facts, form))
    .sort((a, b) => String(b.fiscalYear).localeCompare(String(a.fiscalYear)))
    .slice(0, 3);

  return {
    symbol: normalizeSymbol(symbol),
    companyName: entry.name || normalizeSymbol(symbol),
    annual,
    warnings: ['SEC companyfacts fallback omits market-cap-dependent Altman component unless cached quote data is available.'],
    provenance: {
      provider: 'SEC EDGAR companyfacts',
      periods: annual.map(row => row.fiscalYear).filter(Boolean),
      concepts: Object.values(CONCEPT_ALIASES).flat(),
      sourcePath: `https://data.sec.gov/api/xbrl/companyfacts/CIK${entry.cik}.json`,
    },
  };
}

export function assembleAnnualRows({ income, balance, cashFlow, marketCap }) {
  const byDate = new Map();
  for (const row of income) {
    const key = periodKey(row);
    if (!key) continue;
    byDate.set(key, {
      ...(byDate.get(key) ?? {}),
      fiscalYear: key,
      revenue: num(row.revenue),
      costOfRevenue: num(row.costOfRevenue),
      grossProfit: num(row.grossProfit),
      sellingGeneralAndAdministrativeExpenses: num(row.sellingGeneralAndAdministrativeExpenses),
      netIncome: num(row.netIncome),
      incomeBeforeTax: num(row.incomeBeforeTax),
      operatingIncome: num(row.operatingIncome),
      weightedAverageShsOut: num(row.weightedAverageShsOut),
    });
  }
  for (const row of balance) {
    const key = periodKey(row);
    if (!key) continue;
    byDate.set(key, {
      ...(byDate.get(key) ?? {}),
      fiscalYear: key,
      totalAssets: num(row.totalAssets),
      totalCurrentAssets: num(row.totalCurrentAssets),
      cashAndShortTermInvestments: num(row.cashAndShortTermInvestments ?? row.cashAndCashEquivalents),
      netReceivables: num(row.netReceivables ?? row.accountReceivables),
      propertyPlantEquipmentNet: num(row.propertyPlantEquipmentNet),
      totalLiabilities: num(row.totalLiabilities),
      totalCurrentLiabilities: num(row.totalCurrentLiabilities),
      totalDebt: num(row.totalDebt),
      retainedEarnings: num(row.retainedEarnings),
      commonStockIssued: num(row.commonStockIssued),
    });
  }
  for (const row of cashFlow) {
    const key = periodKey(row);
    if (!key) continue;
    byDate.set(key, {
      ...(byDate.get(key) ?? {}),
      fiscalYear: key,
      operatingCashFlow: num(row.operatingCashFlow ?? row.netCashProvidedByOperatingActivities),
      depreciationAndAmortization: num(row.depreciationAndAmortization),
      commonStockIssued: num(row.commonStockIssued),
    });
  }
  return [...byDate.values()]
    .filter(row => hasMinimumFields(row))
    .map(row => ({ ...row, marketCap: num(marketCap) }))
    .sort((a, b) => String(b.fiscalYear).localeCompare(String(a.fiscalYear)));
}

export function loadCachedJson(cacheName, symbol) {
  const filePath = join(getEngineCacheDir(cacheName), `${normalizeSymbol(symbol).toLowerCase()}.json`);
  if (!existsSync(filePath)) return null;
  return readFile(filePath, 'utf-8').then(text => JSON.parse(text));
}

function buildAnnualRowsFromFacts(facts, form) {
  const years = new Set();
  for (const aliases of Object.values(CONCEPT_ALIASES)) {
    for (const concept of aliases) {
      const value = latestConceptValue(facts, concept, { form });
      if (value?.end) years.add(value.end.slice(0, 4));
    }
  }
  return [...years].map(year => {
    const row = { fiscalYear: year, marketCap: null };
    for (const [field, aliases] of Object.entries(CONCEPT_ALIASES)) {
      row[field] = latestAnnualConceptForYear(facts, aliases, form, year);
    }
    return row;
  }).filter(hasMinimumFields);
}

function latestAnnualConceptForYear(facts, aliases, form, year) {
  const namespaces = ['us-gaap', 'ifrs-full', 'dei'];
  for (const ns of namespaces) {
    const bucket = facts?.facts?.[ns];
    if (!bucket) continue;
    for (const alias of aliases) {
      const units = bucket[alias]?.units?.USD;
      const candidates = Array.isArray(units)
        ? units.filter(unit => unit.form === form && String(unit.end || '').startsWith(year))
        : [];
      if (candidates.length) {
        return num(candidates.reduce((a, b) => String(a.filed || a.end) > String(b.filed || b.end) ? a : b).val);
      }
    }
  }
  return null;
}

function parseCsv(value) {
  return [...new Set(String(value).split(',').map(normalizeSymbol).filter(Boolean))];
}

function normalizeSymbol(value) {
  return String(value || '').trim().toUpperCase();
}

function periodKey(row) {
  return String(row?.calendarYear || row?.fiscalYear || row?.date || '').slice(0, 4);
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function hasMinimumFields(row) {
  return Number.isFinite(Number(row.revenue))
    && Number.isFinite(Number(row.netIncome))
    && Number.isFinite(Number(row.totalAssets))
    && Number.isFinite(Number(row.operatingCashFlow));
}
