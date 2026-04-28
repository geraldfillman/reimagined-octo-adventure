import {
  DEFAULT_MARKET_HISTORY_RETENTION,
  pruneMarketHistory,
  formatMarketHistoryRetentionSummary,
  pruneSignals,
  formatSignalRetentionSummary,
} from './lib/retention.mjs';

function parsePositiveInt(value, fallback, label) {
  if (value == null) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
  return parsed;
}

export async function run(flags = {}) {
  const runMarket = Boolean(flags['market-history']);
  const runSignals = Boolean(flags['signals']);

  if (!runMarket && !runSignals) {
    throw new Error('Specify --market-history and/or --signals');
  }

  const dryRun = Boolean(flags['dry-run']);
  const results = {};

  if (runMarket) {
    const keepDaily = parsePositiveInt(
      flags['keep-daily'],
      DEFAULT_MARKET_HISTORY_RETENTION.keepDaily,
      '--keep-daily'
    );
    const keepQuotes = parsePositiveInt(
      flags['keep-quotes'],
      DEFAULT_MARKET_HISTORY_RETENTION.keepQuotes,
      '--keep-quotes'
    );

    results.market = pruneMarketHistory({ dryRun, keepDaily, keepQuotes });

    for (const line of formatMarketHistoryRetentionSummary(results.market, {
      label: 'Cleanup: Market history retention',
    })) {
      console.log(line);
    }
  }

  if (runSignals) {
    results.signals = pruneSignals({ dryRun });

    for (const line of formatSignalRetentionSummary(results.signals, {
      label: 'Cleanup: Signal retention',
    })) {
      console.log(line);
    }
  }

  return results;
}
