/**
 * pead-watch.mjs — Post-earnings anomaly drift watch list.
 *
 * Runs the PEAD agent for review-queue tickers (from the latest Streamline
 * Report sidecar) plus a set of default watchlist symbols. Skips results
 * with pead_label === 'insufficient_data'. Surfaces anchored-VWAP drift,
 * EPS surprise, and drift classification for manual review.
 *
 * Usage:
 *   node run.mjs pull pead-watch
 *   node run.mjs pull pead-watch --symbols AAPL,MSFT,NVDA
 *   node run.mjs pull pead-watch --dry-run
 */

import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { runPeadAgent } from '../agents/marketmind/pead-agent.mjs';
import { getPullsDir } from '../lib/config.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';

const SIDECAR_DIR   = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.cache', 'orchestrator', 'streamline-reports');
const WATCHLISTS_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'config', 'watchlists.json');

const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'META', 'AMZN', 'GOOGL', 'AMD', 'TSLA'];

export async function pull(flags = {}) {
  const symbolOverride = flags.symbols
    ? String(flags.symbols).toUpperCase().split(',').map(s => s.trim()).filter(Boolean)
    : null;

  const symbols = symbolOverride ?? await resolveSymbols();

  console.log(`PEAD Watch: scanning ${symbols.length} symbol(s) for post-earnings drift...`);

  const results = [];
  for (const symbol of symbols) {
    try {
      const result = await runPeadAgent({ symbol, asset_type: 'stock' });
      const label = result.raw_data?.pead_label ?? 'insufficient_data';
      if (label === 'insufficient_data') {
        console.log(`  ${symbol}: skipped (insufficient earnings data)`);
        continue;
      }
      results.push({ symbol, result });
      console.log(`  ${symbol}: ${label} (${result.signal ?? 'N/A'})`);
    } catch (err) {
      console.warn(`  ${symbol}: agent error — ${err.message}`);
    }
  }

  if (!results.length) {
    console.log('PEAD Watch: no actionable results after filtering insufficient_data entries.');
  }

  const note = buildPeadNote({ results, symbolCount: symbols.length });
  const filePath = join(getPullsDir(), 'Market', dateStampedFilename('PEAD_Watch'));

  if (flags['dry-run']) {
    console.log(note);
  } else {
    writeNote(filePath, note);
    console.log(`Wrote: ${filePath}`);
  }

  return { filePath: flags['dry-run'] ? null : filePath, resultCount: results.length };
}

function buildPeadNote({ results, symbolCount }) {
  const alertCount   = results.filter(r => ['LONG_DRIFT', 'SHORT_DRIFT', 'EXTENDED'].includes(r.result?.raw_data?.pead_label)).length;
  const overallStatus = alertCount >= 2 ? 'alert' : alertCount >= 1 ? 'watch' : 'clear';

  const rows = results.map(({ symbol, result }) => {
    const rd = result.raw_data ?? {};
    const above = rd.price_above_earnings_avwap;
    return [
      symbol,
      rd.pead_label              ?? '—',
      rd.earnings_date           ?? '—',
      rd.eps_surprise_pct != null ? `${rd.eps_surprise_pct}%` : '—',
      fmtNum(rd.avwap_from_earnings),
      rd.avwap_dist_pct != null   ? `${rd.avwap_dist_pct}%`  : '—',
      above === true ? 'Yes' : above === false ? 'No' : '—',
      result.signal              ?? '—',
    ];
  });

  const tableContent = rows.length
    ? buildTable(
        ['Symbol', 'PEAD Label', 'Earnings Date', 'EPS Surp%', 'Earnings AVWAP', 'AVWAP Dist%', 'Above AVWAP', 'Signal'],
        rows
      )
    : '_No symbols with sufficient earnings data in the current scan window._';

  return buildNote({
    frontmatter: {
      title:          'PEAD Watch',
      source:         'Vault Orchestrator',
      date_pulled:    today(),
      domain:         'market',
      agent_owner:    'market',
      agent_scope:    'market',
      data_type:      'pead_watch',
      frequency:      'daily',
      symbols_scanned: symbolCount,
      results_count:  results.length,
      alert_count:    alertCount,
      signal_status:  overallStatus,
      signals:        overallStatus === 'clear' ? [] : ['pead-drift'],
      tags:           ['pead', 'earnings-drift', 'avwap', 'market-microstructure'],
    },
    sections: [
      {
        heading: 'Operating Rule',
        content: [
          '> PEAD (Post-Earnings Announcement Drift) tracks whether price continues in the direction of an earnings surprise.',
          '> AVWAP anchored to the earnings date is the key reference: holding above it on a positive surprise is the bull case.',
          '> Only symbols with sufficient earnings history are shown. Symbols with `insufficient_data` are suppressed.',
          '> All entries require manual verification. No broker execution is generated.',
        ].join('\n'),
      },
      {
        heading: 'PEAD Watch List',
        content: tableContent,
      },
      {
        heading: 'Label Guide',
        content: [
          '- **LONG_DRIFT**: Positive surprise + price holding above earnings AVWAP → drift continuation candidate.',
          '- **SHORT_DRIFT**: Negative surprise + price below earnings AVWAP → short drift continuation candidate.',
          '- **EXTENDED**: Price has moved >threshold% from earnings AVWAP — drift may be overextended.',
          '- **NEUTRAL**: Earnings data exists but no clear drift signal.',
          '- **EPS Surp%**: Actual EPS minus estimate, divided by absolute estimate, as percentage.',
        ].join('\n'),
      },
    ],
  });
}

async function resolveSymbols() {
  const sidecarTickers = await loadSidecarTickers();
  const watchlistSymbols = await loadWatchlistSymbols();
  const combined = new Set([...sidecarTickers, ...watchlistSymbols, ...DEFAULT_SYMBOLS]);
  return [...combined];
}

async function loadSidecarTickers() {
  if (!existsSync(SIDECAR_DIR)) return [];
  try {
    const files = (await readdir(SIDECAR_DIR)).filter(f => f.endsWith('.json')).sort().reverse();
    if (!files.length) return [];
    const sidecar = JSON.parse(await readFile(join(SIDECAR_DIR, files[0]), 'utf-8'));
    const tickers = new Set();
    for (const item of sidecar.review_items ?? []) {
      for (const sig of item.signals ?? []) {
        const m = String(sig).match(/[A-Z]{2,5}/g);
        if (m) m.forEach(t => tickers.add(t));
      }
      const m2 = String(item.title ?? '').match(/\b[A-Z]{2,5}\b/g);
      if (m2) m2.forEach(t => tickers.add(t));
    }
    return [...tickers].slice(0, 20);
  } catch {
    return [];
  }
}

async function loadWatchlistSymbols() {
  try {
    const wl = JSON.parse(await readFile(WATCHLISTS_PATH, 'utf-8'));
    const cfqSymbols = Object.values(wl.cash_flow_quality ?? {}).flat();
    return [...new Set([...(wl.indexes ?? []), ...cfqSymbols])];
  } catch {
    return [];
  }
}

function fmtNum(val) {
  return val != null && Number.isFinite(Number(val)) ? Number(Number(val).toFixed(2)).toString() : '—';
}
