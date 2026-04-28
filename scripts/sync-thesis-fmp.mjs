#!/usr/bin/env node
/**
 * sync-thesis-fmp.mjs - Sync machine-managed FMP summary fields into thesis notes.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getVaultRoot } from './lib/config.mjs';
import { loadCachedFmpFundamentalsMap } from './lib/fmp-fundamentals-context.mjs';
import { loadLatestFmpMarketContext, normalizeDate } from './lib/fmp-market-context.mjs';
import { buildFrontmatter, today } from './lib/markdown.mjs';
import { loadThesisWatchlists } from './lib/thesis-watchlists.mjs';

const VAULT_ROOT = getVaultRoot();
const THESES_DIR = join(VAULT_ROOT, '10_Theses');

const THESIS_FMP_FIELDS = Object.freeze([
  'fmp_watchlist_symbols',
  'fmp_watchlist_symbol_count',
  'fmp_primary_symbol',
  'fmp_technical_symbol_count',
  'fmp_technical_nonclear_count',
  'fmp_technical_bearish_count',
  'fmp_technical_overbought_count',
  'fmp_technical_oversold_count',
  'fmp_primary_technical_status',
  'fmp_primary_technical_bias',
  'fmp_primary_momentum_state',
  'fmp_primary_rsi14',
  'fmp_primary_price_vs_sma200_pct',
  'fmp_primary_fundamentals_status',
  'fmp_primary_market_cap',
  'fmp_primary_trailing_pe',
  'fmp_primary_price_to_sales',
  'fmp_primary_price_to_book',
  'fmp_primary_ev_to_sales',
  'fmp_primary_ev_to_ebitda',
  'fmp_primary_roe_pct',
  'fmp_primary_roic_pct',
  'fmp_primary_operating_margin_pct',
  'fmp_primary_net_margin_pct',
  'fmp_primary_current_ratio',
  'fmp_primary_debt_to_equity',
  'fmp_primary_price_target',
  'fmp_primary_analyst_count',
  'fmp_primary_target_upside_pct',
  'fmp_primary_fundamentals_cached_at',
  'fmp_primary_snapshot_date',
  'fmp_calendar_symbol_count',
  'fmp_calendar_pull_date',
  'fmp_next_earnings_date',
  'fmp_next_earnings_symbols',
  'fmp_last_sync',
]);

export async function run(flags = {}) {
  const dryRun = Boolean(flags['dry-run']);
  const includeBaskets = Boolean(flags['include-baskets']);
  const thesisFilter = String(flags.thesis || '').trim().toLowerCase();

  const { technicalBySymbol, earningsBySymbol, latestCalendarPullDate } = await loadLatestFmpMarketContext();
  const thesisWatchlists = await loadThesisWatchlists({
    includeBaskets,
    thesisFilter,
  });
  const fundamentalsBySymbol = await loadCachedFmpFundamentalsMap(
    thesisWatchlists.flatMap(thesis => thesis.symbols)
  );

  let scanned = 0;
  let updatedCount = 0;

  for (const thesis of thesisWatchlists) {
    scanned += 1;

    const managedFields = buildManagedFields({
      watchlistSymbols: thesis.symbols,
      technicalBySymbol,
      earningsBySymbol,
      fundamentalsBySymbol,
      latestCalendarPullDate,
    });

    const original = readFileSync(thesis.path, 'utf-8');
    const updated = upsertManagedFrontmatter(original, managedFields);
    if (updated === original) continue;

    updatedCount += 1;
    if (dryRun) {
      console.log(`[dry-run] ${thesis.relativePath}: ${formatUpdateSummary(managedFields)}`);
    } else {
      writeFileSync(thesis.path, updated, 'utf-8');
      console.log(`Updated ${thesis.relativePath}: ${formatUpdateSummary(managedFields)}`);
    }
  }

  const mode = dryRun ? 'dry run' : 'live';
  console.log(
    `Thesis FMP sync complete (${mode}): ${updatedCount} updated, ${scanned} scanned. ` +
    `Market coverage: ${technicalBySymbol.size} technical symbol(s), ${earningsBySymbol.size} earnings symbol(s).`
  );

  return {
    scanned,
    updated: updatedCount,
    technicalSymbols: technicalBySymbol.size,
    earningsSymbols: earningsBySymbol.size,
  };
}

function buildManagedFields({ watchlistSymbols, technicalBySymbol, earningsBySymbol, fundamentalsBySymbol, latestCalendarPullDate }) {
  const primarySymbol = watchlistSymbols[0] ?? null;
  const technicalEntries = watchlistSymbols.map(symbol => technicalBySymbol.get(symbol)).filter(Boolean);
  const technicalRows = technicalEntries.map(entry => entry.data);
  const earningsRows = watchlistSymbols.map(symbol => earningsBySymbol.get(symbol)).filter(Boolean);
  const primaryTechnical = primarySymbol ? technicalBySymbol.get(primarySymbol)?.data : null;
  const primaryFundamentals = primarySymbol ? fundamentalsBySymbol.get(primarySymbol) : null;
  const nextRows = earningsRows
    .filter(row => row.date >= today())
    .sort((left, right) => left.date.localeCompare(right.date) || left.symbol.localeCompare(right.symbol));
  const nextEarningsDate = nextRows[0]?.date ?? null;
  const nextEarningsSymbols = nextEarningsDate
    ? [...new Set(nextRows.filter(row => row.date === nextEarningsDate).map(row => row.symbol))]
    : [];
  const matchedCalendarPullDate = earningsRows
    .map(row => row.pullDate)
    .filter(Boolean)
    .sort()
    .at(-1) ?? latestCalendarPullDate ?? null;

  return {
    fmp_watchlist_symbols: watchlistSymbols,
    fmp_watchlist_symbol_count: watchlistSymbols.length,
    fmp_primary_symbol: primarySymbol,
    fmp_technical_symbol_count: technicalRows.length,
    fmp_technical_nonclear_count: technicalRows.filter(row => row.signal_status && row.signal_status !== 'clear').length,
    fmp_technical_bearish_count: technicalRows.filter(row => row.technical_bias === 'bearish').length,
    fmp_technical_overbought_count: technicalRows.filter(row => row.momentum_state === 'overbought').length,
    fmp_technical_oversold_count: technicalRows.filter(row => row.momentum_state === 'oversold').length,
    fmp_primary_technical_status: primaryTechnical?.signal_status ?? null,
    fmp_primary_technical_bias: primaryTechnical?.technical_bias ?? null,
    fmp_primary_momentum_state: primaryTechnical?.momentum_state ?? null,
    fmp_primary_rsi14: normalizeNumber(primaryTechnical?.rsi14, 2),
    fmp_primary_price_vs_sma200_pct: normalizeNumber(primaryTechnical?.price_vs_sma200_pct, 2),
    fmp_primary_fundamentals_status: primaryFundamentals?.coverageStatus ?? null,
    fmp_primary_market_cap: normalizeWholeNumber(primaryFundamentals?.marketCap),
    fmp_primary_trailing_pe: normalizeNumber(primaryFundamentals?.trailingPE, 2),
    fmp_primary_price_to_sales: normalizeNumber(primaryFundamentals?.priceToSales, 2),
    fmp_primary_price_to_book: normalizeNumber(primaryFundamentals?.priceToBook, 2),
    fmp_primary_ev_to_sales: normalizeNumber(primaryFundamentals?.evToSales, 2),
    fmp_primary_ev_to_ebitda: normalizeNumber(primaryFundamentals?.evToEbitda, 2),
    fmp_primary_roe_pct: normalizeNumber(primaryFundamentals?.roePct, 2),
    fmp_primary_roic_pct: normalizeNumber(primaryFundamentals?.roicPct, 2),
    fmp_primary_operating_margin_pct: normalizeNumber(primaryFundamentals?.operatingMarginPct, 2),
    fmp_primary_net_margin_pct: normalizeNumber(primaryFundamentals?.netMarginPct, 2),
    fmp_primary_current_ratio: normalizeNumber(primaryFundamentals?.currentRatio, 2),
    fmp_primary_debt_to_equity: normalizeNumber(primaryFundamentals?.debtToEquity, 2),
    fmp_primary_price_target: normalizeNumber(primaryFundamentals?.averagePriceTarget, 2),
    fmp_primary_analyst_count: normalizeCount(primaryFundamentals?.analystCount),
    fmp_primary_target_upside_pct: normalizeNumber(primaryFundamentals?.targetUpsidePct, 2),
    fmp_primary_fundamentals_cached_at: normalizeDate(primaryFundamentals?.cachedAt),
    fmp_primary_snapshot_date: normalizeDate(primaryTechnical?.date_pulled),
    fmp_calendar_symbol_count: earningsRows.length,
    fmp_calendar_pull_date: normalizeDate(matchedCalendarPullDate),
    fmp_next_earnings_date: nextEarningsDate,
    fmp_next_earnings_symbols: nextEarningsSymbols,
    fmp_last_sync: today(),
  };
}

function upsertManagedFrontmatter(original, managedFields) {
  const match = original.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n?[\s\S]*)?$/);
  if (!match) return original;

  const eol = original.includes('\r\n') ? '\r\n' : '\n';
  const body = (match[2] || '').replace(/^(?:\r?\n)+/, '');
  const frontmatterLines = match[1]
    .split(/\r?\n/)
    .filter(line => !THESIS_FMP_FIELDS.some(field => line.startsWith(`${field}:`)));
  const insertIndex = frontmatterLines.findIndex(line => line.startsWith('tags:'));
  const managedLines = THESIS_FMP_FIELDS.flatMap(field => renderManagedField(field, managedFields[field]));

  if (managedLines.length === 0) {
    return original;
  }

  const safeInsertIndex = insertIndex >= 0 ? insertIndex : frontmatterLines.length;
  const nextFrontmatter = [
    ...frontmatterLines.slice(0, safeInsertIndex),
    ...managedLines,
    ...frontmatterLines.slice(safeInsertIndex),
  ];

  return body
    ? `---${eol}${nextFrontmatter.join(eol)}${eol}---${eol}${eol}${body}`
    : `---${eol}${nextFrontmatter.join(eol)}${eol}---${eol}`;
}

function renderManagedField(field, value) {
  if (value === null || value === undefined) return [];
  if (typeof value === 'string' && value.trim() === '') return [];
  if (Array.isArray(value) && value.length === 0) return [];
  const rendered = buildFrontmatter({ [field]: value }).split('\n').slice(1, -1);
  return rendered;
}

function normalizeNumber(value, decimals = 2) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Number(numeric.toFixed(decimals));
}

function normalizeWholeNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.round(numeric);
}

function normalizeCount(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return null;
  return Math.round(numeric);
}

function formatUpdateSummary(fields) {
  return [
    `${fields.fmp_watchlist_symbol_count} symbol(s)`,
    `tech ${fields.fmp_technical_symbol_count}/${fields.fmp_watchlist_symbol_count}`,
    `calendar ${fields.fmp_calendar_symbol_count}/${fields.fmp_watchlist_symbol_count}`,
    `next ${fields.fmp_next_earnings_date || 'none'}`,
  ].join(' | ');
}
