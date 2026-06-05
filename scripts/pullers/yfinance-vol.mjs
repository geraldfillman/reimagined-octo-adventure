/**
 * yfinance-vol.mjs - Vol indices + option-chain derived metrics from Yahoo Finance.
 *
 * Replaces the CBOE puller for users without a CBOE account. Pulls VIX, VVIX, MOVE,
 * SKEW, GVZ, OVX, VXN, RVX, VIX9D, VIX3M, VIX6M plus put/call ratios and ATM IV
 * term structure for index ETFs.
 *
 * Wrapper around scripts/lib/yfinance_vol.py — Python is required (yfinance, pandas).
 *
 * Usage:
 *   node scripts/run.mjs pull yfinance-vol \
 *     --indices vix,vvix,move,skew \
 *     --interval 1d --period 5d \
 *     --pcr SPY,QQQ,IWM \
 *     --term-structure SPY,QQQ \
 *     --expirations 0,1,2,4,8,12
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getPullsDir } from '../lib/config.mjs';
import { buildNote, buildTable, today } from '../lib/markdown.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PYTHON_SCRIPT = join(HERE, '..', 'lib', 'yfinance_vol.py');

const DEFAULTS = {
  indices: 'vix,vvix,move,skew,gvz,ovx,vxn,rvx,vix9d,vix3m',
  interval: '1d',
  period: '5d',
  pcr: '',
  'term-structure': '',
  expirations: '0,1,2,4,8,12',
};

export async function pull(flags = {}) {
  const opts = { ...DEFAULTS, ...flags };
  const dryRun = Boolean(flags['dry-run']);

  if (!existsSync(PYTHON_SCRIPT)) {
    throw new Error(`yfinance Python script missing: ${PYTHON_SCRIPT}`);
  }

  const args = [
    PYTHON_SCRIPT,
    '--indices', String(opts.indices),
    '--interval', String(opts.interval),
    '--period', String(opts.period),
    '--option-chain-expirations', String(opts.expirations),
  ];
  if (opts.pcr) args.push('--pcr', String(opts.pcr));
  if (opts['term-structure']) args.push('--term-structure', String(opts['term-structure']));

  if (dryRun) {
    console.log(`[dry-run] would run: python ${args.map(quoteArg).join(' ')}`);
    return { source: 'yfinance-vol', dryRun: true, args };
  }

  const result = runPython(args);
  if (!result.ok) {
    console.error(`yfinance-vol failed: ${result.error}`);
    if (result.stderr) console.error(result.stderr);
    throw new Error(result.error);
  }

  let parsed;
  try {
    parsed = JSON.parse(result.stdout);
  } catch (err) {
    throw new Error(`Failed to parse yfinance JSON output: ${err.message}\nFirst 500 chars: ${result.stdout.slice(0, 500)}`);
  }

  const dateStr = today();
  const volDir = join(getPullsDir(), 'Vol');
  mkdirSync(volDir, { recursive: true });

  const jsonPath = join(volDir, `${dateStr}_yfinance_vol_${opts.interval}.json`);
  writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), 'utf-8');

  const summaryPath = join(volDir, `${dateStr}_yfinance_vol_${opts.interval}.md`);
  const summary = buildSummary(parsed, opts);
  writeFileSync(summaryPath, summary, 'utf-8');

  console.log(`Wrote: ${summaryPath}`);
  console.log(`Wrote: ${jsonPath}`);

  return {
    source: 'yfinance-vol',
    summaryPath,
    jsonPath,
    indicesCount: Object.keys(parsed.indices || {}).length,
    pcrCount: (parsed.pcr || []).length,
    termStructureCount: (parsed.term_structure || []).length,
  };
}

function runPython(args) {
  // On Windows the `py` launcher reliably finds the right interpreter.
  // Order: py (Windows launcher), python3 (POSIX), python (fallback).
  // If we find an interpreter but yfinance isn't installed there, try the next one.
  const candidates = process.platform === 'win32'
    ? ['py', 'python3', 'python']
    : ['python3', 'python', 'py'];

  let lastResult = null;
  for (const exe of candidates) {
    const r = spawnSync(exe, args, { encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 });
    if (r.error && r.error.code === 'ENOENT') continue;
    if (r.status === 0) return { ok: true, stdout: r.stdout, stderr: r.stderr, interpreter: exe };
    lastResult = { exe, ...r };
    // If yfinance isn't in this Python, try the next interpreter.
    if (/ModuleNotFoundError|No module named/i.test(r.stderr || '')) continue;
    // Other failure: report and stop.
    return {
      ok: false,
      stdout: r.stdout,
      stderr: r.stderr,
      error: `${exe} exited ${r.status}: ${(r.stderr || '').slice(0, 400) || '(no stderr)'}`,
    };
  }
  return {
    ok: false,
    error: lastResult
      ? `No python interpreter has yfinance installed. Last error from ${lastResult.exe}: ${(lastResult.stderr || '').slice(0, 400)}`
      : 'No python interpreter found (tried py, python3, python). Install Python and run: pip install yfinance pandas',
  };
}

function quoteArg(a) { return /\s/.test(a) ? JSON.stringify(a) : a; }

function fmt(value, digits = 2) {
  if (value === null || value === undefined) return '—';
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return value.toFixed(digits);
}

function pct(value) {
  if (value === null || value === undefined) return '—';
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function buildSummary(data, opts) {
  const indices = data.indices || {};
  const indexRows = Object.entries(indices).map(([key, item]) => {
    if (item.error) return [key.toUpperCase(), item.ticker || '?', 'error', '—', '—', '—', item.error.slice(0, 60)];
    return [
      key.toUpperCase(),
      item.ticker,
      fmt(item.close),
      fmt(item.change),
      pct(item.pct_change),
      fmt(item.high) + ' / ' + fmt(item.low),
      String(item.last_timestamp || '').slice(0, 16),
    ];
  });

  const pcrRows = (data.pcr || []).map(p => {
    if (p.error) return [p.ticker, 'error', '—', '—', '—', '—', p.error.slice(0, 60)];
    const t = p.totals || {};
    return [
      p.ticker,
      fmt(p.spot),
      fmt(t.pc_volume_ratio, 3),
      fmt(t.pc_oi_ratio, 3),
      String(Math.round(t.call_volume || 0)),
      String(Math.round(t.put_volume || 0)),
      `${(p.expiries_used || []).length}/${p.expiries_available || 0}`,
    ];
  });

  const termRows = [];
  for (const ts of (data.term_structure || [])) {
    if (ts.error) {
      termRows.push([ts.ticker, '—', '—', `error: ${ts.error.slice(0, 50)}`]);
      continue;
    }
    for (const pt of (ts.points || [])) {
      if (pt.error) continue;
      termRows.push([
        ts.ticker,
        pt.expiry,
        String(pt.days_to_expiry ?? '—'),
        pt.atm_iv != null ? fmt(pt.atm_iv * 100, 2) + '%' : '—',
      ]);
    }
  }

  const signalRows = [];
  const vix = indices.vix;
  const vix9d = indices.vix9d;
  const vix3m = indices.vix3m;
  if (vix && vix9d && Number.isFinite(vix.close) && Number.isFinite(vix9d.close)) {
    const ratio = vix9d.close / vix.close;
    signalRows.push(['VIX9D / VIX', fmt(ratio, 3), ratio > 1.05 ? 'short-term stress (backwardation)' : ratio < 0.95 ? 'normal contango' : 'flat']);
  }
  if (vix && vix3m && Number.isFinite(vix.close) && Number.isFinite(vix3m.close)) {
    const ratio = vix.close / vix3m.close;
    signalRows.push(['VIX / VIX3M', fmt(ratio, 3), ratio > 1.0 ? 'curve inverted (stress)' : 'curve normal']);
  }
  const skew = indices.skew;
  if (skew && Number.isFinite(skew.close)) {
    signalRows.push(['SKEW', fmt(skew.close, 1), skew.close > 145 ? 'elevated tail premium' : skew.close < 120 ? 'low tail premium' : 'mid-range']);
  }

  return buildNote({
    frontmatter: {
      type: 'pull_note',
      title: 'Vol Surface (yfinance)',
      source: 'yfinance',
      domain: 'market',
      data_type: 'vol_surface',
      frequency: opts.interval === '1d' ? 'daily' : 'intraday',
      cadence: opts.interval === '1d' ? 'daily' : 'intraday',
      date_pulled: today(),
      signal_status: classify(indices),
      signals: signalRows.map(row => row.join(': ')),
      indices_count: Object.keys(indices).length,
      pcr_count: (data.pcr || []).length,
      tags: ['research-spine', 'vol', 'options', 'yfinance'],
    },
    sections: [
      {
        heading: 'Vol Indices',
        content: indexRows.length
          ? buildTable(['Index', 'Ticker', 'Close', 'Change', '% Change', 'High / Low', 'Last'], indexRows)
          : '_No index data fetched._',
      },
      {
        heading: 'Term-Structure Signals',
        content: signalRows.length
          ? buildTable(['Signal', 'Value', 'Reading'], signalRows)
          : '_No term-structure signals computed (need VIX, VIX9D, VIX3M, SKEW)._',
      },
      {
        heading: 'Put/Call Ratios',
        content: pcrRows.length
          ? buildTable(['Ticker', 'Spot', 'P/C Vol', 'P/C OI', 'Call Vol', 'Put Vol', 'Expiries'], pcrRows)
          : '_No PCR computed (pass --pcr SPY,QQQ,IWM to compute)._',
      },
      {
        heading: 'IV Term Structure (ATM)',
        content: termRows.length
          ? buildTable(['Ticker', 'Expiry', 'DTE', 'ATM IV'], termRows)
          : '_No term structure computed (pass --term-structure SPY,QQQ to compute)._',
      },
      {
        heading: 'Notes',
        content: [
          '- Source: free Yahoo Finance via yfinance Python library.',
          '- Vol indices follow CBOE definitions but Yahoo data may lag CBOE settle by 15 min.',
          '- Option-chain ATM IV is the average of nearest-strike call and put implied vols.',
          '- Run with `--interval 1m --period 1d` for intraday tape.',
          '- Raw JSON sidecar saved alongside this note for deeper drill-down.',
        ].join('\n'),
      },
    ],
  });
}

function classify(indices) {
  const vix = indices.vix?.close;
  if (!Number.isFinite(vix)) return 'clear';
  if (vix >= 30) return 'alert';
  if (vix >= 20) return 'watch';
  return 'clear';
}
