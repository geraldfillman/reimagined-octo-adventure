/**
 * entropy-monitor.mjs - Shadow monitor for order-flow entropy on SPY/QQQ.
 *
 * Usage:
 *   node run.mjs pull entropy-monitor
 *   node run.mjs pull entropy-monitor --symbols SPY,QQQ --dry-run
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { getPullsDir, getVaultRoot } from '../lib/config.mjs';
import { fetchIntradayPrices, fetchQuote } from '../lib/fmp-client.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';
import { setProperties } from '../lib/obsidian-cli.mjs';
import { computeTransitionEntropyFromBars } from '../agents/marketmind/entropy.mjs';
import { normalizeIntradayBars } from '../lib/bars.mjs';

const DEFAULT_SYMBOLS = Object.freeze(['SPY', 'QQQ']);
const DEFAULT_LOOKBACK = 120;
const DEFAULT_HORIZONS = Object.freeze([5, 15, 30, 60, 120]);
const LEDGER_PATH = join(getVaultRoot(), 'scripts', '.cache', 'entropy-monitor', 'entropy-monitor-ledger.csv');
const BACKTEST_DIR = join(getVaultRoot(), 'scripts', '.cache', 'entropy-monitor', 'backtests');
const LEDGER_COLUMNS = Object.freeze([
  'run_id',
  'created_at',
  'updated_at',
  'symbol',
  'observation_time',
  'window_start_time',
  'price',
  'quote_timestamp',
  'quote_change_pct',
  'quote_volume',
  'quote_avg_volume',
  'quote_volume_ratio',
  'entropy_score',
  'entropy_level',
  'entropy_transitions',
  'entropy_method',
  'strategy_bucket',
  'ret_5m_pct',
  'abs_5m_pct',
  'settled_5m_at',
  'ret_15m_pct',
  'abs_15m_pct',
  'settled_15m_at',
  'ret_30m_pct',
  'abs_30m_pct',
  'settled_30m_at',
  'ret_60m_pct',
  'abs_60m_pct',
  'settled_60m_at',
  'ret_120m_pct',
  'abs_120m_pct',
  'settled_120m_at',
]);
const BACKTEST_COLUMNS = Object.freeze([
  'symbol',
  'observation_time',
  'window_start_time',
  'price',
  'entropy_score',
  'entropy_percentile',
  'entropy_level',
  'entropy_transitions',
  'strategy_bucket',
  'ret_5m_pct',
  'abs_5m_pct',
  'settled_5m_at',
  'ret_15m_pct',
  'abs_15m_pct',
  'settled_15m_at',
  'ret_30m_pct',
  'abs_30m_pct',
  'settled_30m_at',
  'ret_60m_pct',
  'abs_60m_pct',
  'settled_60m_at',
  'ret_120m_pct',
  'abs_120m_pct',
  'settled_120m_at',
]);

export async function pull(flags = {}) {
  const symbols = parseSymbols(flags.symbols || flags.symbol || flags.ticker);
  const lookback = Math.max(30, Number(flags.lookback) || DEFAULT_LOOKBACK);
  const horizons = parseHorizons(flags.horizons || flags.horizon);
  const nearThreshold = parseThreshold(flags['near-threshold'], 0.60);
  const lowThreshold = parseThreshold(flags['low-threshold'], 0.50);
  const dryRun = Boolean(flags['dry-run']);
  const runId = new Date().toISOString();

  if (flags.backtest) {
    return runBacktest({
      symbols,
      lookback,
      horizons,
      nearThreshold,
      lowThreshold,
      from: flags.from,
      to: flags.to,
      step: Math.max(1, Number(flags.step || flags['sample-step']) || 5),
      dryRun,
      json: Boolean(flags.json),
      runId,
    });
  }

  console.log(`Entropy Monitor: ${symbols.join(', ')} (${lookback} x 1m bars, horizons ${horizons.join('/')}).`);

  const ledger = readLedger();
  const snapshots = [];
  const barsBySymbol = new Map();
  const errors = [];

  for (const symbol of symbols) {
    try {
      const [quote, intraday] = await Promise.all([
        fetchQuote(symbol),
        fetchIntradayPrices(symbol, { interval: '1min' }),
      ]);
      const bars = normalizeIntradayBars(intraday);
      barsBySymbol.set(symbol, bars);
      const snapshot = buildSnapshot({
        symbol,
        quote,
        bars,
        lookback,
        nearThreshold,
        lowThreshold,
        runId,
      });
      snapshots.push(snapshot);
      upsertObservation(ledger, snapshot, runId);
    } catch (error) {
      errors.push({ symbol, error: error.message });
    }
  }

  settleLedger(ledger, barsBySymbol, horizons, runId);
  const summary = summarizeLedger(ledger, symbols, horizons, { nearThreshold, lowThreshold });
  const note = buildEntropyMonitorNote({ snapshots, summary, errors, horizons, nearThreshold, lowThreshold, lookback });

  if (dryRun) {
    console.log(note);
  } else {
    writeLedger(ledger);
    const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`Entropy_Monitor_${symbols.join('_')}`));
    writeNote(filePath, note);
    setProperties(filePath, { signal_status: resolveSignalStatus(snapshots, errors), date_pulled: today() });
    console.log(`Wrote: ${filePath}`);
    console.log(`Ledger: ${LEDGER_PATH}`);
  }

  const output = { snapshots, summary, errors, ledgerPath: dryRun ? null : LEDGER_PATH };
  if (flags.json) console.log(JSON.stringify(output, null, 2));
  return output;
}

async function runBacktest(options) {
  const {
    symbols,
    lookback,
    horizons,
    nearThreshold,
    lowThreshold,
    from,
    to,
    step,
    dryRun,
    json,
    runId,
  } = options;

  console.log(`Entropy Backtest: ${symbols.join(', ')} (${lookback} x 1m bars, step ${step}, horizons ${horizons.join('/')}).`);

  const rows = [];
  const coverage = [];
  const errors = [];

  for (const symbol of symbols) {
    try {
      const intraday = await fetchIntradayPrices(symbol, { interval: '1min', from, to });
      const bars = normalizeIntradayBars(intraday);
      const symbolRows = buildBacktestRows({
        symbol,
        bars,
        lookback,
        horizons,
        nearThreshold,
        lowThreshold,
        step,
      });
      assignEntropyPercentiles(symbolRows);
      rows.push(...symbolRows);
      coverage.push({
        symbol,
        bars: bars.length,
        observations: symbolRows.length,
        first_bar: bars[0]?.date || '',
        last_bar: bars.at(-1)?.date || '',
        trading_days: new Set(bars.map(bar => tradingDay(bar.date))).size,
        first_observation: symbolRows[0]?.observation_time || '',
        last_observation: symbolRows.at(-1)?.observation_time || '',
      });
    } catch (error) {
      errors.push({ symbol, error: error.message });
    }
  }

  const summary = summarizeBacktest(rows, symbols, horizons);
  const csvPath = join(BACKTEST_DIR, dateStampedFilename(`Entropy_Backtest_${symbols.join('_')}`, '.csv'));
  const note = buildBacktestNote({
    rows,
    summary,
    coverage,
    errors,
    horizons,
    lookback,
    nearThreshold,
    lowThreshold,
    step,
    from,
    to,
    csvPath,
  });

  if (dryRun) {
    console.log(note);
  } else {
    writeCsvRows(csvPath, BACKTEST_COLUMNS, rows);
    const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`Entropy_Backtest_${symbols.join('_')}`));
    writeNote(filePath, note);
    setProperties(filePath, { signal_status: resolveBacktestSignalStatus(summary), date_pulled: today() });
    console.log(`Wrote: ${filePath}`);
    console.log(`Backtest CSV: ${csvPath}`);
  }

  const output = {
    runId,
    rowCount: rows.length,
    coverage,
    summary,
    errors,
    csvPath: dryRun ? null : csvPath,
  };
  if (json) console.log(JSON.stringify(output, null, 2));
  return output;
}

function buildBacktestRows({ symbol, bars, lookback, horizons, nearThreshold, lowThreshold, step }) {
  const rows = [];

  for (let index = lookback; index < bars.length; index += step) {
    const latest = bars[index];
    const window = bars.slice(index - lookback, index + 1);
    const entropy = computeTransitionEntropyFromBars(window, { lookback });
    if (!Number.isFinite(Number(entropy.score))) continue;

    const row = {
      symbol,
      observation_time: latest.date,
      window_start_time: window[0]?.date || '',
      price: round(latest.close, 4),
      entropy_score: round(entropy.score, 4),
      entropy_percentile: '',
      entropy_level: entropy.level,
      entropy_transitions: entropy.transitions,
      strategy_bucket: classifyStrategyBucket(entropy.score, { nearThreshold, lowThreshold }),
    };

    let settled = false;
    for (const horizon of horizons) {
      const future = bars[index + horizon];
      if (!future || tradingDay(future.date) !== tradingDay(latest.date)) continue;

      const move = percentMove(Number(latest.close), Number(future.close));
      row[`ret_${horizon}m_pct`] = round(move, 4);
      row[`abs_${horizon}m_pct`] = round(Math.abs(move), 4);
      row[`settled_${horizon}m_at`] = future.date;
      settled = true;
    }

    if (settled) rows.push({ ...blankBacktestRow(), ...row });
  }

  return rows;
}

function assignEntropyPercentiles(rows) {
  const sorted = [...rows].sort((left, right) => Number(left.entropy_score) - Number(right.entropy_score));
  const denominator = Math.max(1, sorted.length - 1);
  sorted.forEach((row, index) => {
    row.entropy_percentile = round((index / denominator) * 100, 2);
  });
}

function buildBacktestNote({ rows, summary, coverage, errors, horizons, lookback, nearThreshold, lowThreshold, step, from, to, csvPath }) {
  const symbols = coverage.map(row => row.symbol);
  const sections = [
    {
      heading: 'Coverage',
      content: buildTable(
        ['Symbol', 'Bars', 'Trading Days', 'Observations', 'First Bar', 'Last Bar', 'First Obs', 'Last Obs'],
        coverage.map(row => [
          row.symbol,
          row.bars,
          row.trading_days,
          row.observations,
          row.first_bar,
          row.last_bar,
          row.first_observation,
          row.last_observation,
        ])
      ),
    },
    {
      heading: 'Movement Expansion Summary',
      content: buildBacktestSummaryTable(summary, horizons),
    },
    {
      heading: 'Entropy Distribution',
      content: buildTable(
        ['Symbol', 'Obs', 'Min H', 'Median H', 'Max H', 'Low <=0.50', 'Near <=0.60', 'Baseline >0.60'],
        Object.entries(summary.bySymbol).map(([symbol, data]) => [
          symbol,
          data.observations,
          formatNumber(data.entropy.min, 4),
          formatNumber(data.entropy.median, 4),
          formatNumber(data.entropy.max, 4),
          data.bucketCounts['low-entropy-watch'] || 0,
          data.bucketCounts['near-low-watch'] || 0,
          data.bucketCounts.baseline || 0,
        ])
      ),
    },
    {
      heading: 'Lowest Entropy Windows',
      content: buildTable(
        ['Symbol', 'Time', 'Price', 'Entropy', 'Pctile', 'Bucket', ...horizons.map(h => `Abs ${h}m %`)],
        lowestEntropyRows(rows, 16).map(row => [
          row.symbol,
          row.observation_time,
          formatNumber(row.price, 4),
          formatNumber(row.entropy_score, 4),
          formatNumber(row.entropy_percentile, 2),
          row.strategy_bucket,
          ...horizons.map(h => formatNumber(row[`abs_${h}m_pct`], 4)),
        ])
      ),
    },
    {
      heading: 'Read',
      content: [
        `- **Backtest CSV**: \`${relativeVaultPath(csvPath)}\``,
        `- **Lookback**: ${lookback} one-minute bars.`,
        `- **Sampling step**: every ${step} minute(s), using only same-day future bars.`,
        `- **Fixed watch thresholds**: near <= ${nearThreshold}, low <= ${lowThreshold}.`,
        '- **Relative rows**: lowest 10% and lowest 20% are included because SPY/QQQ may rarely hit fixed low-entropy thresholds.',
        '- **Interpretation**: entropy is judged by absolute movement expansion, not direction.',
      ].join('\n'),
    },
  ];

  if (errors.length) {
    sections.push({
      heading: 'Errors',
      content: errors.map(row => `- **${row.symbol}**: ${row.error}`).join('\n'),
    });
  }

  return buildNote({
    frontmatter: {
      title: 'SPY QQQ Entropy Backtest',
      source: 'Entropy Monitor',
      agent_owner: 'Orchestrator Agent',
      agent_scope: 'pull',
      date_pulled: today(),
      domain: 'market',
      data_type: 'entropy_backtest',
      frequency: 'on-demand',
      signal_status: resolveBacktestSignalStatus(summary),
      signals: buildBacktestSignals(summary),
      symbols,
      lookback_bars: lookback,
      sample_step_minutes: step,
      near_entropy_threshold: nearThreshold,
      low_entropy_threshold: lowThreshold,
      from: from || null,
      to: to || null,
      backtest_rows: rows.length,
      backtest_csv: relativeVaultPath(csvPath),
      tags: ['entropy-monitor', 'entropy-backtest', 'market', 'strategy-shadow'],
    },
    sections,
  });
}

function summarizeBacktest(rows, symbols, horizons) {
  const bySymbol = {};
  for (const symbol of symbols) {
    const symbolRows = rows.filter(row => row.symbol === symbol);
    const entropyValues = symbolRows.map(row => Number(row.entropy_score)).filter(Number.isFinite).sort((a, b) => a - b);
    bySymbol[symbol] = {
      observations: symbolRows.length,
      bucketCounts: countBy(symbolRows, row => row.strategy_bucket || 'unknown'),
      entropy: {
        min: entropyValues[0] ?? null,
        median: median(entropyValues),
        max: entropyValues.at(-1) ?? null,
      },
      horizons: Object.fromEntries(horizons.map(horizon => [`${horizon}m`, summarizeBacktestHorizon(symbolRows, horizon)])),
    };
  }

  return { bySymbol };
}

function summarizeBacktestHorizon(rows, horizon) {
  const all = rows.filter(row => isFiniteNumber(row[`abs_${horizon}m_pct`]));
  const watch = all.filter(row => ['low-entropy-watch', 'near-low-watch'].includes(row.strategy_bucket));
  const baseline = all.filter(row => row.strategy_bucket === 'baseline');
  const low10 = all.filter(row => Number(row.entropy_percentile) <= 10);
  const low20 = all.filter(row => Number(row.entropy_percentile) <= 20);
  const high20 = all.filter(row => Number(row.entropy_percentile) >= 80);

  return {
    all: summarizeMoveRows(all, horizon),
    watch: summarizeMoveRows(watch, horizon),
    baseline: summarizeMoveRows(baseline, horizon),
    low10: summarizeMoveRows(low10, horizon),
    low20: summarizeMoveRows(low20, horizon),
    high20: summarizeMoveRows(high20, horizon),
  };
}

function summarizeMoveRows(rows, horizon) {
  return summarizeValues(rows.map(row => Number(row[`abs_${horizon}m_pct`])));
}

function buildBacktestSummaryTable(summary, horizons) {
  const rows = [];
  for (const [symbol, data] of Object.entries(summary.bySymbol)) {
    for (const horizon of horizons) {
      const stats = data.horizons[`${horizon}m`];
      rows.push([
        symbol,
        `${horizon}m`,
        stats.all.n,
        formatNumber(stats.all.mean, 4),
        stats.watch.n,
        formatNumber(stats.watch.mean, 4),
        formatRatio(stats.watch.mean, stats.all.mean),
        stats.low10.n,
        formatNumber(stats.low10.mean, 4),
        formatRatio(stats.low10.mean, stats.all.mean),
        stats.low20.n,
        formatNumber(stats.low20.mean, 4),
        formatRatio(stats.low20.mean, stats.all.mean),
        formatNumber(stats.high20.mean, 4),
      ]);
    }
  }

  return buildTable(
    [
      'Symbol',
      'Horizon',
      'Settled All',
      'Avg All %',
      'Near/Low n',
      'Near/Low Avg %',
      'Near/Low Expansion',
      'Low 10% n',
      'Low 10% Avg %',
      'Low 10% Expansion',
      'Low 20% n',
      'Low 20% Avg %',
      'Low 20% Expansion',
      'High 20% Avg %',
    ],
    rows
  );
}

function buildBacktestSignals(summary) {
  const signals = [];
  for (const [symbol, data] of Object.entries(summary.bySymbol)) {
    for (const [horizon, stats] of Object.entries(data.horizons)) {
      if (stats.low10.n >= 5 && Number(stats.low10.mean) > Number(stats.all.mean) * 1.25) {
        signals.push(`ENTROPY_BACKTEST_${symbol}_${horizon.toUpperCase()}_LOW10_EXPANSION`);
      }
    }
  }
  return signals;
}

function resolveBacktestSignalStatus(summary) {
  return buildBacktestSignals(summary).length ? 'watch' : 'clear';
}

function lowestEntropyRows(rows, limit) {
  return [...rows]
    .sort((left, right) =>
      Number(left.entropy_score) - Number(right.entropy_score)
      || String(left.symbol).localeCompare(String(right.symbol))
      || String(left.observation_time).localeCompare(String(right.observation_time))
    )
    .slice(0, limit);
}

function buildSnapshot({ symbol, quote, bars, lookback, nearThreshold, lowThreshold, runId }) {
  if (bars.length < lookback + 1) {
    throw new Error(`Only ${bars.length} intraday bars returned for ${symbol}; need at least ${lookback + 1}.`);
  }

  const window = bars.slice(-(lookback + 1));
  const latest = window.at(-1);
  const entropy = computeTransitionEntropyFromBars(window, { lookback });
  const changePct = normalizePercent(quote?.changesPercentage ?? quote?.changePercentage ?? quote?.changePercent);
  const quoteVolume = Number(quote?.volume);
  const quoteAvgVolume = Number(quote?.avgVolume ?? quote?.averageVolume);
  const volumeRatio = Number.isFinite(quoteVolume) && Number.isFinite(quoteAvgVolume) && quoteAvgVolume > 0
    ? quoteVolume / quoteAvgVolume
    : null;

  return {
    run_id: runId,
    created_at: runId,
    updated_at: runId,
    symbol,
    observation_time: latest.date,
    window_start_time: window.at(0)?.date || '',
    price: latest.close,
    quote_timestamp: quote?.timestamp ? timestampToIso(quote.timestamp) : '',
    quote_change_pct: round(changePct, 4),
    quote_volume: Number.isFinite(quoteVolume) ? quoteVolume : '',
    quote_avg_volume: Number.isFinite(quoteAvgVolume) ? quoteAvgVolume : '',
    quote_volume_ratio: round(volumeRatio, 4),
    entropy_score: entropy.score,
    entropy_level: entropy.level,
    entropy_transitions: entropy.transitions,
    entropy_method: entropy.method,
    strategy_bucket: classifyStrategyBucket(entropy.score, { nearThreshold, lowThreshold }),
  };
}

function upsertObservation(ledger, snapshot, runId) {
  const existing = ledger.find(row => row.symbol === snapshot.symbol && row.observation_time === snapshot.observation_time);
  if (existing) {
    Object.assign(existing, snapshot, {
      created_at: existing.created_at || snapshot.created_at,
      updated_at: runId,
    });
    return;
  }

  ledger.push({ ...blankLedgerRow(), ...snapshot });
}

function settleLedger(ledger, barsBySymbol, horizons, runId) {
  for (const row of ledger) {
    const bars = barsBySymbol.get(row.symbol);
    if (!bars?.length) continue;
    const startIndex = bars.findIndex(bar => bar.date === row.observation_time);
    if (startIndex < 0) continue;

    for (const horizon of horizons) {
      const retKey = `ret_${horizon}m_pct`;
      const absKey = `abs_${horizon}m_pct`;
      const settledKey = `settled_${horizon}m_at`;
      if (row[settledKey]) continue;

      const future = bars[startIndex + horizon];
      if (!future || tradingDay(future.date) !== tradingDay(row.observation_time)) continue;

      const move = percentMove(Number(row.price), Number(future.close));
      row[retKey] = round(move, 4);
      row[absKey] = round(Math.abs(move), 4);
      row[settledKey] = future.date;
      row.updated_at = runId;
    }
  }
}

function buildEntropyMonitorNote({ snapshots, summary, errors, horizons, nearThreshold, lowThreshold, lookback }) {
  const status = resolveSignalStatus(snapshots, errors);
  const signals = snapshots
    .filter(row => ['low-entropy-watch', 'near-low-watch'].includes(row.strategy_bucket))
    .map(row => `ENTROPY_${row.symbol}_${row.strategy_bucket.replace(/-/g, '_').toUpperCase()}`);

  return buildNote({
    frontmatter: {
      title: 'SPY QQQ Entropy Monitor',
      source: 'Entropy Monitor',
      agent_owner: 'Orchestrator Agent',
      agent_scope: 'pull',
      date_pulled: today(),
      domain: 'market',
      data_type: 'entropy_monitor',
      frequency: 'intraday-shadow',
      signal_status: status,
      signals,
      symbols: snapshots.map(row => row.symbol),
      lookback_bars: lookback,
      near_entropy_threshold: nearThreshold,
      low_entropy_threshold: lowThreshold,
      ledger_path: 'scripts/.cache/entropy-monitor/entropy-monitor-ledger.csv',
      tags: ['entropy-monitor', 'market', 'strategy-shadow'],
    },
    sections: [
      {
        heading: 'Current Snapshot',
        content: buildTable(
          ['Symbol', 'Bar Time', 'Price', 'Entropy', 'Level', 'Bucket', 'Quote Chg %', 'Vol Ratio', 'Window Start'],
          snapshots.map(row => [
            row.symbol,
            row.observation_time,
            formatNumber(row.price, 4),
            formatNumber(row.entropy_score, 4),
            row.entropy_level,
            row.strategy_bucket,
            formatNumber(row.quote_change_pct, 2),
            formatNumber(row.quote_volume_ratio, 2),
            row.window_start_time,
          ])
        ),
      },
      {
        heading: 'Settled Movement Summary',
        content: buildSettlementSummary(summary, horizons),
      },
      {
        heading: 'Recent Ledger Rows',
        content: buildTable(
          ['Symbol', 'Time', 'Entropy', 'Bucket', ...horizons.map(h => `Abs ${h}m %`)],
          summary.recentRows.map(row => [
            row.symbol,
            row.observation_time,
            formatNumber(row.entropy_score, 4),
            row.strategy_bucket,
            ...horizons.map(h => formatNumber(row[`abs_${h}m_pct`], 4)),
          ])
        ),
      },
      ...(errors.length ? [{
        heading: 'Errors',
        content: errors.map(row => `- **${row.symbol}**: ${row.error}`).join('\n'),
      }] : []),
      {
        heading: 'Use Rules',
        content: [
          '- Entropy is a magnitude monitor, not a direction signal.',
          '- `near-low-watch` is a relative shadow-monitor bucket for SPY/QQQ while this ledger builds history.',
          '- Review 5m, 15m, 30m, 60m, and 120m absolute movement after each reading.',
          '- Do not promote to active use until the ledger has at least 20 to 30 settled observations per symbol.',
          '- Reference: [[04_Reference/Entropy Strategy Monitoring Cheat Sheet]].',
        ].join('\n'),
      },
    ],
  });
}

function summarizeLedger(ledger, symbols, horizons, thresholds) {
  const selected = ledger
    .filter(row => symbols.includes(row.symbol))
    .sort((a, b) => String(b.observation_time).localeCompare(String(a.observation_time)));
  const bySymbol = {};

  for (const symbol of symbols) {
    const rows = selected.filter(row => row.symbol === symbol);
    bySymbol[symbol] = {
      observations: rows.length,
      lowOrNearRows: rows.filter(row => ['low-entropy-watch', 'near-low-watch'].includes(row.strategy_bucket)).length,
      horizons: Object.fromEntries(horizons.map(horizon => {
        const allSettled = rows.filter(row => isFiniteNumber(row[`abs_${horizon}m_pct`]));
        const watchSettled = allSettled.filter(row => ['low-entropy-watch', 'near-low-watch'].includes(row.strategy_bucket));
        return [`${horizon}m`, {
          all: summarizeValues(allSettled.map(row => Number(row[`abs_${horizon}m_pct`]))),
          watch: summarizeValues(watchSettled.map(row => Number(row[`abs_${horizon}m_pct`]))),
        }];
      })),
    };
  }

  return {
    thresholds,
    bySymbol,
    recentRows: selected.slice(0, 12),
  };
}

function buildSettlementSummary(summary, horizons) {
  const rows = [];
  for (const [symbol, data] of Object.entries(summary.bySymbol)) {
    for (const horizon of horizons) {
      const h = `${horizon}m`;
      const all = data.horizons[h].all;
      const watch = data.horizons[h].watch;
      rows.push([
        symbol,
        h,
        data.observations,
        data.lowOrNearRows,
        all.n,
        formatNumber(all.mean, 4),
        watch.n,
        formatNumber(watch.mean, 4),
        formatRatio(watch.mean, all.mean),
      ]);
    }
  }

  return buildTable(
    ['Symbol', 'Horizon', 'Obs', 'Watch Obs', 'Settled All', 'Avg Abs All %', 'Settled Watch', 'Avg Abs Watch %', 'Expansion'],
    rows
  );
}

function resolveSignalStatus(snapshots, errors) {
  if (snapshots.some(row => row.strategy_bucket === 'low-entropy-watch')) return 'watch';
  if (snapshots.some(row => row.strategy_bucket === 'near-low-watch')) return 'watch';
  if (errors.length && !snapshots.length) return 'watch';
  return 'clear';
}

function classifyStrategyBucket(score, { nearThreshold, lowThreshold }) {
  if (score === '' || score === null || score === undefined || !Number.isFinite(Number(score))) return 'unknown';
  if (Number(score) <= lowThreshold) return 'low-entropy-watch';
  if (Number(score) <= nearThreshold) return 'near-low-watch';
  return 'baseline';
}

function parseSymbols(value) {
  if (!value) return [...DEFAULT_SYMBOLS];
  const symbols = String(value)
    .split(',')
    .map(symbol => symbol.trim().toUpperCase())
    .filter(Boolean);
  return symbols.length ? [...new Set(symbols)] : [...DEFAULT_SYMBOLS];
}

function parseHorizons(value) {
  if (!value) return [...DEFAULT_HORIZONS];
  const horizons = String(value)
    .split(',')
    .map(item => Number(item.trim()))
    .filter(item => DEFAULT_HORIZONS.includes(item))
    .map(item => Math.round(item));
  return horizons.length ? [...new Set(horizons)].sort((a, b) => a - b) : [...DEFAULT_HORIZONS];
}

function parseThreshold(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : fallback;
}

function normalizePercent(value) {
  if (typeof value === 'string') return Number(value.replace(/[%()]/g, ''));
  return Number(value);
}

function timestampToIso(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return new Date(n * 1000).toISOString();
}

function tradingDay(value) {
  return String(value || '').slice(0, 10);
}

function percentMove(start, end) {
  if (!Number.isFinite(start) || !Number.isFinite(end) || start === 0) return null;
  return ((end - start) / start) * 100;
}

function summarizeValues(values) {
  const xs = values.filter(Number.isFinite);
  if (!xs.length) return { n: 0, mean: null };
  return { n: xs.length, mean: xs.reduce((sum, value) => sum + value, 0) / xs.length };
}

function isFiniteNumber(value) {
  if (value === '' || value === null || value === undefined) return false;
  return Number.isFinite(Number(value));
}

function round(value, decimals = 4) {
  if (value === '' || value === null || value === undefined) return '';
  if (!Number.isFinite(Number(value))) return '';
  return Number(Number(value).toFixed(decimals));
}

function formatNumber(value, decimals = 2) {
  if (value === '' || value === null || value === undefined || !Number.isFinite(Number(value))) return 'N/A';
  return Number(value).toFixed(decimals);
}

function formatRatio(numerator, denominator) {
  if (numerator === '' || numerator === null || numerator === undefined) return 'N/A';
  if (denominator === '' || denominator === null || denominator === undefined) return 'N/A';
  if (!Number.isFinite(Number(numerator)) || !Number.isFinite(Number(denominator)) || Number(denominator) === 0) return 'N/A';
  return `${(Number(numerator) / Number(denominator)).toFixed(2)}x`;
}

function blankLedgerRow() {
  return Object.fromEntries(LEDGER_COLUMNS.map(column => [column, '']));
}

function blankBacktestRow() {
  return Object.fromEntries(BACKTEST_COLUMNS.map(column => [column, '']));
}

function countBy(rows, keyFn) {
  const counts = {};
  for (const row of rows) {
    const keyValue = keyFn(row);
    counts[keyValue] = (counts[keyValue] || 0) + 1;
  }
  return counts;
}

function median(values) {
  const xs = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!xs.length) return null;
  const middle = Math.floor(xs.length / 2);
  if (xs.length % 2) return xs[middle];
  return (xs[middle - 1] + xs[middle]) / 2;
}

function relativeVaultPath(filePath) {
  return String(filePath).replace(`${getVaultRoot()}\\`, '').replace(`${getVaultRoot()}/`, '').replace(/\\/g, '/');
}

function readLedger() {
  if (!existsSync(LEDGER_PATH)) return [];
  const text = readFileSync(LEDGER_PATH, 'utf-8');
  return parseCsv(text);
}

function writeLedger(rows) {
  mkdirSync(dirname(LEDGER_PATH), { recursive: true });
  const sorted = [...rows].sort((a, b) =>
    String(a.symbol).localeCompare(String(b.symbol)) ||
    String(a.observation_time).localeCompare(String(b.observation_time))
  );
  const csv = [
    LEDGER_COLUMNS.join(','),
    ...sorted.map(row => LEDGER_COLUMNS.map(column => csvEscape(row[column] ?? '')).join(',')),
  ].join('\n');
  writeFileSync(LEDGER_PATH, `${csv}\n`, 'utf-8');
}

function writeCsvRows(filePath, columns, rows) {
  mkdirSync(dirname(filePath), { recursive: true });
  const csv = [
    columns.join(','),
    ...rows.map(row => columns.map(column => csvEscape(row[column] ?? '')).join(',')),
  ].join('\n');
  writeFileSync(filePath, `${csv}\n`, 'utf-8');
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(line => line.length);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map(line => {
    const cells = parseCsvLine(line);
    const row = blankLedgerRow();
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? '';
    });
    return row;
  });
}

function parseCsvLine(line) {
  const cells = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index++) {
    const char = line[index];
    if (quoted) {
      if (char === '"' && line[index + 1] === '"') {
        current += '"';
        index++;
      } else if (char === '"') {
        quoted = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}
