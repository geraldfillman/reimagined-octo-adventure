/**
 * backtest-orb-eod.mjs — EOD proxy backtest for the ORB + Entropy strategy.
 *
 * Two simulation modes run in a single pass:
 *
 *  close-only  No stop or target. Measures directional accuracy at close.
 *              R unit = 10% ATR (consistent denominator for comparison).
 *
 *  wide-stop   Stop at 60% ATR (default), 2R target, income/edge (50/50) exit split.
 *              Better approximates intraday range tolerance than a tight stop on daily bars.
 *
 * Each mode shows results for ALL gap-aligned days and for the TOP-20% of gaps by
 * magnitude (strongest gap quintile). This separates the quality of strong-gap setups
 * from the diluted full population and acts as a proxy for prime setup filtering.
 *
 * ATR: Wilder's EMA-14, no lookahead — atrs[i-1] gates simulation day i.
 */

import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fetchDailyPricesFull } from '../lib/fmp-client.mjs';
import { mapConcurrent } from '../lib/fetcher.mjs';
import { buildNote, buildTable, writeNote, today, dateStampedFilename } from '../lib/markdown.mjs';
import { getPullsDir } from '../lib/config.mjs';

const DEFAULTS = {
  days:          120,
  wideStopAtr:   0.60,
  closeOnlyAtr:  0.10,   // R unit denominator for close-only
  gapMin:        0.001,
  topFraction:   0.20,   // top gap quintile fraction
  concurrency:   5,
  atrPeriod:     14,
};

// ── Running ATR (Wilder's EMA, no lookahead) ──────────────────────────────────

function buildRunningATR(series, period = 14) {
  const atrs = new Array(series.length).fill(null);
  const trs  = [];
  for (let i = 1; i < series.length; i++) {
    const c = series[i], p = series[i - 1];
    trs.push(Math.max(
      Number(c.high) - Number(c.low),
      Math.abs(Number(c.high) - Number(p.close)),
      Math.abs(Number(c.low)  - Number(p.close)),
    ));
    const k = trs.length;
    if (k === period)    atrs[i] = trs.reduce((s, v) => s + v, 0) / period;
    else if (k > period) atrs[i] = (atrs[i - 1] * (period - 1) + trs[k - 1]) / period;
  }
  return atrs;
}

// ── Trade Sheet parser ────────────────────────────────────────────────────────

function parseTradeSheet(markdown) {
  const lines = markdown.split('\n');
  let inSection = false, headers = null;
  const rows = [];

  for (const line of lines) {
    if (line.startsWith('## ')) { inSection = line.includes('Trade Sheet'); headers = null; continue; }
    if (!inSection || !line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    if (!headers) { headers = cells; continue; }
    if (cells.every(c => /^[-: ]*$/.test(c))) continue;
    rows.push(Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ''])));
  }

  return rows.map(r => ({
    symbol:    (r['Ticker'] || '').replace(/\[\[|\]\]/g, '').trim(),
    direction: (r['Direction'] || '').toUpperCase().trim(),
  })).filter(r => r.symbol && ['LONG', 'SHORT'].includes(r.direction));
}

// ── Single-day simulation ─────────────────────────────────────────────────────

function simulateDay({ bar, prevClose, atr, direction, stopAtrFraction, gapMin, closeOnly }) {
  if (!atr || !bar || !Number.isFinite(prevClose)) return null;
  const o = Number(bar.open), h = Number(bar.high), l = Number(bar.low), c = Number(bar.close);
  if (![o, h, l, c].every(Number.isFinite)) return null;

  const gapPct = (o - prevClose) / prevClose;
  if (direction === 'LONG'  && gapPct < gapMin)  return null;
  if (direction === 'SHORT' && gapPct > -gapMin) return null;

  const stopDist = stopAtrFraction * atr;
  const stop     = direction === 'LONG' ? o - stopDist : o + stopDist;
  const r        = Math.abs(o - stop);
  if (r === 0) return null;
  const sign     = direction === 'LONG' ? 1 : -1;

  if (closeOnly) {
    const closeR = ((c - o) * sign) / r;
    return { date: bar.date, outcome: closeR > 0 ? 'win' : 'loss', rMultiple: closeR, gapPct };
  }

  const target2r  = direction === 'LONG' ? o + 2 * r : o - 2 * r;
  const stopHit   = direction === 'LONG' ? l <= stop    : h >= stop;
  const targetHit = direction === 'LONG' ? h >= target2r : l <= target2r;

  if (stopHit) return { date: bar.date, outcome: 'stopped', rMultiple: -1, gapPct };

  const incomeR = targetHit ? 2 : ((c - o) * sign) / r;
  const edgeR   = ((c - o) * sign) / r;
  return { date: bar.date, outcome: targetHit ? 'target' : 'held', rMultiple: 0.5 * incomeR + 0.5 * edgeR, gapPct };
}

// ── Stats helpers ─────────────────────────────────────────────────────────────

function buildStats(trades) {
  if (!trades?.length) return null;
  const rs   = trades.map(t => t.rMultiple);
  const wins = rs.filter(r => r > 0).length;
  const avgR = rs.reduce((s, v) => s + v, 0) / rs.length;
  const stdR = Math.sqrt(rs.map(r => (r - avgR) ** 2).reduce((s, v) => s + v, 0) / rs.length);
  let maxCL = 0, curCL = 0;
  for (const r of rs) { curCL = r < 0 ? curCL + 1 : 0; maxCL = Math.max(maxCL, curCL); }
  return {
    n: trades.length, wins, winRate: wins / trades.length,
    avgR, totalR: rs.reduce((s, v) => s + v, 0), stdR,
    sharpe: stdR > 0 ? avgR / stdR : 0, maxConsecLoss: maxCL,
    targets: trades.filter(t => t.outcome === 'target').length,
    stopped: trades.filter(t => t.outcome === 'stopped').length,
  };
}

// Returns the top `fraction` of trades by |gapPct| using each symbol's own distribution.
function filterTopQuintile(trades, fraction = 0.20) {
  if (!trades.length) return [];
  const sorted = [...trades].sort((a, b) => Math.abs(b.gapPct) - Math.abs(a.gapPct));
  return sorted.slice(0, Math.max(1, Math.round(sorted.length * fraction)));
}

function aggStats(results, key) {
  const allTrades = results.flatMap(r => r[key + 'Trades'] ?? []);
  const topTrades = results.flatMap(r => filterTopQuintile(r[key + 'Trades'] ?? [], DEFAULTS.topFraction));
  return { all: buildStats(allTrades), top: buildStats(topTrades) };
}

// ── Per-symbol backtest (both modes, raw trades stored) ───────────────────────

async function backtestSymbol(symbol, direction, fromDate, config) {
  const raw = await fetchDailyPricesFull(symbol, { from: fromDate });
  if (!raw || raw.length < config.atrPeriod + 2) return null;

  const series = [...raw].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const atrs   = buildRunningATR(series, config.atrPeriod);

  const closeOnlyTrades = [];
  const wideStopTrades  = [];

  for (let i = config.atrPeriod + 1; i < series.length; i++) {
    const base = { bar: series[i], prevClose: Number(series[i - 1].close), atr: atrs[i - 1], direction, gapMin: config.gapMin };

    const co = simulateDay({ ...base, stopAtrFraction: config.closeOnlyAtr, closeOnly: true });
    if (co) closeOnlyTrades.push(co);

    const ws = simulateDay({ ...base, stopAtrFraction: config.wideStopAtr, closeOnly: false });
    if (ws) wideStopTrades.push(ws);
  }

  return {
    symbol, direction,
    closeOnlyTrades, wideStopTrades,
    closeOnly: buildStats(closeOnlyTrades),
    wideStop:  buildStats(wideStopTrades),
  };
}

// ── Table builders ────────────────────────────────────────────────────────────

function buildCombinedRows(results, key, topFraction) {
  return [...results]
    .filter(r => r[key + 'Trades']?.length)
    .sort((a, b) => {
      const topA = buildStats(filterTopQuintile(a[key + 'Trades'], topFraction));
      const topB = buildStats(filterTopQuintile(b[key + 'Trades'], topFraction));
      return (topB?.avgR ?? -Infinity) - (topA?.avgR ?? -Infinity);
    })
    .map(r => {
      const all = buildStats(r[key + 'Trades']);
      const top = buildStats(filterTopQuintile(r[key + 'Trades'], topFraction));
      return [
        `[[${r.symbol}]]`, r.direction,
        String(all?.n ?? '--'), fmtPct(all?.winRate), fmt(all?.avgR, 3),
        String(top?.n ?? '--'), fmtPct(top?.winRate), fmt(top?.avgR, 3), fmt(top?.sharpe, 2),
      ];
    });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10);
}
function fmt(v, d = 2)  { return Number.isFinite(v) ? v.toFixed(d) : '--'; }
function fmtPct(v)       { return Number.isFinite(v) ? `${(v * 100).toFixed(1)}%` : '--'; }

function aggLine(label, s) {
  if (!s) return `**${label}**: no data`;
  return `**${label}**: ${s.n} trades | Win%: ${fmtPct(s.winRate)} | AvgR: ${fmt(s.avgR, 3)} | TotalR: ${fmt(s.totalR, 2)}`;
}

function buildBacktestSignals(coAgg, wsAgg) {
  const signals = [];
  if ((coAgg.all?.avgR ?? 0) < 0) signals.push('orb_close_only_negative_avg_r');
  if ((coAgg.top?.avgR ?? 0) < 0) signals.push('orb_close_only_top_negative_avg_r');
  if ((wsAgg.all?.avgR ?? 0) < 0) signals.push('orb_wide_stop_negative_avg_r');
  if ((wsAgg.top?.avgR ?? 0) < 0) signals.push('orb_wide_stop_top_negative_avg_r');
  return signals;
}

// ── Main ──────────────────────────────────────────────────────────────────────

export async function pull(flags = {}) {
  const days        = Number(flags.days             ?? DEFAULTS.days);
  const wideStopAtr = Number(flags['wide-stop-atr'] ?? DEFAULTS.wideStopAtr);
  const gapMin      = Number(flags['gap-min']        ?? DEFAULTS.gapMin);
  const topFraction = Number(flags['top-fraction']   ?? DEFAULTS.topFraction);
  const config      = { days, wideStopAtr, closeOnlyAtr: DEFAULTS.closeOnlyAtr, gapMin, atrPeriod: DEFAULTS.atrPeriod };

  let pairs = [];

  if (flags.symbols || flags.symbol) {
    pairs = String(flags.symbols ?? flags.symbol).split(',').map(s => {
      const [sym, dir = 'LONG'] = s.trim().toUpperCase().split(':');
      return { symbol: sym, direction: dir };
    }).filter(p => p.symbol && ['LONG', 'SHORT'].includes(p.direction));
  } else {
    const screenPath = join(getPullsDir(), 'Market', `${today()}_ORB_Entropy_Screen.md`);
    if (!existsSync(screenPath)) {
      console.error(`Backtest ORB EOD: no ORB screen for today. Run orb-entropy first, or pass --symbols TICKER:DIR,...`);
      return;
    }
    pairs = parseTradeSheet(readFileSync(screenPath, 'utf8'));
    console.log(`Backtest ORB EOD: read ${pairs.length} signals from today's screen`);
  }

  if (!pairs.length) { console.log('Backtest ORB EOD: no signals.'); return; }

  const fromDate = daysAgo(days + 25);
  console.log(`Backtest ORB EOD: running both modes on ${pairs.length} symbol(s) over ${days} days from ${fromDate}...`);

  const results = (await mapConcurrent(pairs, DEFAULTS.concurrency, ({ symbol, direction }) =>
    backtestSymbol(symbol, direction, fromDate, config)
  )).filter(Boolean);

  console.log(`  ${results.length} of ${pairs.length} symbols had sufficient data`);

  const coAgg = aggStats(results, 'closeOnly');
  const wsAgg = aggStats(results, 'wideStop');
  const signals = buildBacktestSignals(coAgg, wsAgg);
  const signalStatus = signals.length > 0 ? 'watch' : 'clear';

  const cols    = ['Symbol', 'Dir', 'N(all)', 'Win%(all)', 'AvgR(all)', `N(top${Math.round(topFraction * 100)}%)`, `Win%(top)`, 'AvgR(top)', 'Sharpe(top)'];
  const coRows  = buildCombinedRows(results, 'closeOnly', topFraction);
  const wsRows  = buildCombinedRows(results, 'wideStop',  topFraction);

  const outDir  = join(getPullsDir(), 'Backtest');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, dateStampedFilename('ORB_EOD_Backtest'));

  const note = buildNote({
    frontmatter: {
      title:              'ORB EOD Proxy Backtest',
      source:             'FMP Historical OHLCV',
      date_pulled:        today(),
      domain:             'backtest',
      data_type:          'orb_eod_backtest',
      frequency:          'on-demand',
      signal_status:      signalStatus,
      signals,
      close_only_avg_r:   fmt(coAgg.all?.avgR, 3),
      close_only_top_avg_r: fmt(coAgg.top?.avgR, 3),
      wide_stop_avg_r:    fmt(wsAgg.all?.avgR, 3),
      wide_stop_top_avg_r: fmt(wsAgg.top?.avgR, 3),
      tags:               ['backtest', 'orb', 'eod', 'equities'],
    },
    sections: [
      {
        heading: 'Parameters',
        content: [
          `- **Lookback**: ${days} calendar days from ${fromDate}`,
          `- **Gap filter**: ≥ ${(gapMin * 100).toFixed(1)}% open gap aligned with signal direction`,
          `- **Top-quintile**: strongest ${Math.round(topFraction * 100)}% of gap-aligned days by |gap%| per symbol`,
          `- **Close-Only R unit**: 10% ATR denominator (no stop applied)`,
          `- **Wide-Stop**: ${(wideStopAtr * 100).toFixed(0)}% ATR stop, 2R target, income/edge (50/50) exit split`,
          `- **ATR**: Wilder's EMA-14, no lookahead`,
          `- **Entry**: day open for both modes`,
        ].join('\n'),
      },
      {
        heading: 'Close-Only — Direction Accuracy',
        content: [
          `_No stop or target. Cleanest test of directional signal quality._\n`,
          aggLine('All gap-aligned days', coAgg.all),
          aggLine(`Top ${Math.round(topFraction * 100)}% gaps (strongest quintile)`, coAgg.top) + '\n',
          coRows.length > 0 ? buildTable(cols, coRows) : '_No results._',
        ].join('\n'),
      },
      {
        heading: `Wide-Stop — ${(wideStopAtr * 100).toFixed(0)}% ATR Stop`,
        content: [
          `_Stop at ${(wideStopAtr * 100).toFixed(0)}% ATR. Income (50%) at 2R, edge (50%) at close._\n`,
          aggLine('All gap-aligned days', wsAgg.all),
          aggLine(`Top ${Math.round(topFraction * 100)}% gaps (strongest quintile)`, wsAgg.top) + '\n',
          wsRows.length > 0 ? buildTable(cols, wsRows) : '_No results._',
        ].join('\n'),
      },
      {
        heading: 'How to Read',
        content: [
          '- **Close-Only Win% (all)**: raw directional accuracy of gap-aligned days. ~50% = random; >55% = meaningful edge.',
          '- **Close-Only Win% (top quintile)**: do the biggest gaps have better directional follow-through? This is the key question.',
          '- **Wide-Stop AvgR (top quintile)**: if strong-gap days also survive a realistic stop, real edge is present.',
          '- **If top-quintile outperforms all-days**: gap magnitude is a valid quality proxy — larger gaps produce cleaner trends.',
          '- **If top-quintile ≈ all-days**: gap size alone is not the differentiator; quality filters (VWAP, entropy, range) matter more.',
          `- Top-quintile threshold is computed per-symbol from its own historical gap distribution — not a global threshold.`,
          '- EOD proxy — intraday fill quality, exact OR level entries, and stop execution not modeled.',
          '- Run `node run.mjs pull signal-tracker --log` today, then `signal-tracker` after close to track live results.',
        ].join('\n'),
      },
    ],
  });

  writeNote(outPath, note);
  console.log(`Wrote: ${outPath}`);
  console.log(`  Close-Only  all: ${fmtPct(coAgg.all?.winRate)} win | AvgR ${fmt(coAgg.all?.avgR, 3)}  ·  top${Math.round(topFraction*100)}%: ${fmtPct(coAgg.top?.winRate)} win | AvgR ${fmt(coAgg.top?.avgR, 3)}`);
  console.log(`  Wide-Stop   all: ${fmtPct(wsAgg.all?.winRate)} win | AvgR ${fmt(wsAgg.all?.avgR, 3)}  ·  top${Math.round(topFraction*100)}%: ${fmtPct(wsAgg.top?.winRate)} win | AvgR ${fmt(wsAgg.top?.avgR, 3)}`);
}
