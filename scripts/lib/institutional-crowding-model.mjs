import { CONFIDENCE, withProvenance } from './positioning-provenance.mjs';

export function calculateInstitutionalCrowding({
  symbol,
  cusip,
  currentRows = [],
  priorRows = [],
  averageDailyVolumeShares = null,
  freeFloatMarketCapUsd = null,
} = {}) {
  const current = filterRows(currentRows, cusip);
  const prior = filterRows(priorRows, cusip);
  const managerKeys = new Set(current.map(managerKey));
  const totalShares = current.reduce((sum, row) => sum + shares(row), 0);
  const totalMarketValueUsd = current.reduce((sum, row) => sum + marketValueUsd(row), 0);
  const priorShares = prior.length ? prior.reduce((sum, row) => sum + shares(row), 0) : null;
  const deltaShares = priorShares == null ? null : totalShares - priorShares;
  const adv = Number(averageDailyVolumeShares) || 0;

  return withProvenance({
    symbol: String(symbol || '').toUpperCase(),
    cusip,
    manager_count: managerKeys.size,
    total_shares: totalShares,
    total_market_value_usd: totalMarketValueUsd,
    delta_shares_qoq: deltaShares,
    crowding_value_pct_float_mcap: freeFloatMarketCapUsd ? totalMarketValueUsd / Number(freeFloatMarketCapUsd) : null,
    exit_pressure_adv: deltaShares != null && adv ? Math.abs(deltaShares) / adv : null,
    unwind_days_at_20pct_adv: adv ? totalShares / (0.2 * adv) : null,
    top_managers: topManagers(current),
  }, {
    sourceName: 'SEC Form 13F data set',
    signalConfidence: prior.length ? CONFIDENCE.medium : CONFIDENCE.low,
    knownLimitations: [
      '13F is long-side only and delayed.',
      'Short positions, swaps, written options, and intraday timing are not reported.',
    ],
  });
}

function filterRows(rows, cusip) {
  const target = String(cusip || '').toUpperCase();
  return rows.filter(row => !target || String(row.cusip || '').toUpperCase() === target);
}

function managerKey(row) {
  return String(row.filing_manager_cik || row.manager_cik || row.filing_manager_name || row.manager || 'unknown');
}

function shares(row) {
  return Number(row.shares_or_principal_amount ?? row.shares ?? row.sharesHeld) || 0;
}

function marketValueUsd(row) {
  const raw = Number(row.market_value_usd ?? row.marketValueUsd);
  if (Number.isFinite(raw) && raw > 0) return raw;
  return (Number(row.market_value_usd_thousands ?? row.value) || 0) * 1000;
}

function topManagers(rows) {
  return [...rows]
    .sort((a, b) => marketValueUsd(b) - marketValueUsd(a))
    .slice(0, 5)
    .map(row => ({
      manager: row.filing_manager_name || row.manager || 'Unknown manager',
      market_value_usd: marketValueUsd(row),
      shares: shares(row),
    }));
}
