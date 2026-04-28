/**
 * fmp-fundamentals-context.mjs - Read cached FMP fundamentals for thesis reporting.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { getVaultRoot } from './config.mjs';
import { normalizeSymbol } from './thesis-watchlists.mjs';

const CACHE_ROOT = join(getVaultRoot(), 'scripts', '.cache');
const CACHE_DIRS = Object.freeze({
  profile: join(CACHE_ROOT, 'fmp-profile'),
  ratios: join(CACHE_ROOT, 'fmp-ratios-ttm'),
  metrics: join(CACHE_ROOT, 'fmp-key-metrics-ttm'),
  targets: join(CACHE_ROOT, 'fmp-price-target-summary'),
});

export async function loadCachedFmpFundamentalsMap(symbols = []) {
  const uniqueSymbols = [...new Set(symbols.map(symbol => normalizeSymbol(symbol)).filter(Boolean))];
  const bySymbol = new Map();

  for (const symbol of uniqueSymbols) {
    bySymbol.set(symbol, loadCachedFmpFundamentals(symbol));
  }

  return bySymbol;
}

export function loadCachedFmpFundamentals(symbol) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) return null;

  const profileRecord = readCacheRecord(CACHE_DIRS.profile, normalized);
  const ratiosRecord = readCacheRecord(CACHE_DIRS.ratios, normalized);
  const metricsRecord = readCacheRecord(CACHE_DIRS.metrics, normalized);
  const targetsRecord = readCacheRecord(CACHE_DIRS.targets, normalized);

  const profile = profileRecord?.data || null;
  const ratios = ratiosRecord?.data || null;
  const metrics = metricsRecord?.data || null;
  const targets = targetsRecord?.data || null;
  const coverageFlags = {
    profile: Boolean(profile),
    ratios: Boolean(ratios),
    metrics: Boolean(metrics),
    targets: Boolean(targets),
  };
  const coverageCount = Object.values(coverageFlags).filter(Boolean).length;

  if (coverageCount === 0) {
    return {
      symbol: normalized,
      coverageFlags,
      coverageCount,
      coverageStatus: 'missing',
      cachedAt: null,
    };
  }

  const price = parseMetricNumber(profile?.price);
  const averagePriceTarget = parseMetricNumber(targets?.lastYearAvgPriceTarget)
    ?? parseMetricNumber(targets?.allTimeAvgPriceTarget)
    ?? parseMetricNumber(targets?.lastQuarterAvgPriceTarget);
  const analystCount = parseMetricNumber(targets?.lastYearCount)
    ?? parseMetricNumber(targets?.allTimeCount)
    ?? parseMetricNumber(targets?.lastQuarterCount);
  const targetUpsidePct = price > 0 && averagePriceTarget > 0
    ? ((averagePriceTarget - price) / price) * 100
    : null;

  return {
    symbol: normalized,
    companyName: profile?.companyName || normalized,
    sector: profile?.sector || null,
    industry: profile?.industry || null,
    description: profile?.description || null,
    marketCap: parseMetricNumber(profile?.marketCap) ?? parseMetricNumber(metrics?.marketCap),
    price,
    beta: parseMetricNumber(profile?.beta),
    trailingPE: parseMetricNumber(ratios?.priceToEarningsRatioTTM),
    priceToSales: parseMetricNumber(ratios?.priceToSalesRatioTTM),
    priceToBook: parseMetricNumber(ratios?.priceToBookRatioTTM),
    evToSales: parseMetricNumber(metrics?.evToSalesTTM),
    evToEbitda: parseMetricNumber(metrics?.evToEBITDATTM),
    currentRatio: parseMetricNumber(ratios?.currentRatioTTM) ?? parseMetricNumber(metrics?.currentRatioTTM),
    debtToEquity: parseMetricNumber(ratios?.debtToEquityRatioTTM),
    grossMarginPct: normalizeRatioPercent(ratios?.grossProfitMarginTTM),
    operatingMarginPct: normalizeRatioPercent(ratios?.operatingProfitMarginTTM),
    netMarginPct: normalizeRatioPercent(ratios?.netProfitMarginTTM),
    roePct: normalizeRatioPercent(metrics?.returnOnEquityTTM),
    roicPct: normalizeRatioPercent(metrics?.returnOnInvestedCapitalTTM),
    averagePriceTarget,
    analystCount: analystCount != null ? Math.round(analystCount) : null,
    targetUpsidePct,
    coverageFlags,
    coverageCount,
    coverageStatus: coverageCount >= 3 ? 'complete' : 'partial',
    cachedAt: latestCacheDate([
      profileRecord?.cachedAt,
      ratiosRecord?.cachedAt,
      metricsRecord?.cachedAt,
      targetsRecord?.cachedAt,
    ]),
  };
}

function readCacheRecord(cacheDir, symbol) {
  for (const candidate of getFmpSymbolCandidates(symbol)) {
    const filePath = join(cacheDir, `${candidate}.json`);
    if (!existsSync(filePath)) continue;

    try {
      const parsed = JSON.parse(readFileSync(filePath, 'utf-8'));
      return {
        cachedAt: normalizeCachedAt(parsed?.cachedAt),
        data: parsed?.data ?? parsed ?? null,
      };
    } catch {
      return null;
    }
  }

  return null;
}

function getFmpSymbolCandidates(symbol) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) return [];

  const variants = [normalized];
  if (normalized.includes('_')) {
    variants.push(normalized.replace(/_/g, '.'));
    variants.push(normalized.replace(/_/g, '-'));
  }
  if (normalized.includes('.')) {
    variants.push(normalized.replace(/\./g, '_'));
    variants.push(normalized.replace(/\./g, '-'));
  }
  if (normalized.includes('-')) {
    variants.push(normalized.replace(/-/g, '_'));
    variants.push(normalized.replace(/-/g, '.'));
  }

  return [...new Set(variants.filter(Boolean))];
}

function parseMetricNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeRatioPercent(value) {
  const numeric = parseMetricNumber(value);
  if (numeric === null) return null;
  return numeric * 100;
}

function normalizeCachedAt(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : null;
}

function latestCacheDate(values) {
  return values.filter(Boolean).sort().at(-1) ?? null;
}
