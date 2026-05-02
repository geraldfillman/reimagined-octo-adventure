/**
 * auction-features.mjs — Daily auction/volume-profile feature scan.
 *
 * Runs the auction agent for each watchlist symbol and generates a structured
 * note showing auction state, POC, VAH/VAL, AVWAP, and relative volume.
 * No broker execution is generated.
 *
 * Usage:
 *   node run.mjs pull auction-features
 *   node run.mjs pull auction-features --symbols SPY,QQQ,IWM
 *   node run.mjs pull auction-features --dry-run
 */

import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { runAuctionAgent } from '../agents/marketmind/auction-agent.mjs';
import { getPullsDir } from '../lib/config.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';

const WATCHLISTS_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'config', 'watchlists.json');

const DEFAULT_SYMBOLS = ['SPY', 'QQQ', 'IWM', 'DIA', 'TLT', 'HYG', 'GLD', 'USO'];

export async function pull(flags = {}) {
  const symbolOverride = flags.symbols
    ? String(flags.symbols).toUpperCase().split(',').map(s => s.trim()).filter(Boolean)
    : null;

  const symbols = symbolOverride ?? await loadDefaultSymbols();

  console.log(`Auction Features: scanning ${symbols.length} symbol(s)...`);

  const results = [];
  for (const symbol of symbols) {
    try {
      const result = await runAuctionAgent({ symbol, asset_type: 'stock' });
      results.push({ symbol, result });
      const st = result.raw_data?.auction_state ?? 'unknown';
      console.log(`  ${symbol}: ${st} (${result.signal ?? 'N/A'})`);
    } catch (err) {
      console.warn(`  ${symbol}: agent error — ${err.message}`);
      results.push({ symbol, result: null });
    }
  }

  const note = buildAuctionNote({ results });
  const filePath = join(getPullsDir(), 'Market', dateStampedFilename('Auction_Features'));

  if (flags['dry-run']) {
    console.log(note);
  } else {
    writeNote(filePath, note);
    console.log(`Wrote: ${filePath}`);
  }

  const alertCount = results.filter(r => ['alert', 'critical'].includes(r.result?.signal_status)).length;
  return { filePath: flags['dry-run'] ? null : filePath, symbolCount: symbols.length, alertCount };
}

function buildAuctionNote({ results }) {
  const alertCount  = results.filter(r => r.result?.signal !== 'NEUTRAL' && r.result?.signal !== 'NO_DATA').length;
  const overallStatus = alertCount >= 3 ? 'alert' : alertCount >= 1 ? 'watch' : 'clear';

  const rows = results.map(({ symbol, result }) => {
    if (!result) {
      return [symbol, '—', '—', '—', '—', '—', '—', '—', 'agent error'];
    }
    const rd = result.raw_data ?? {};
    return [
      symbol,
      rd.auction_state      ?? '—',
      fmtNum(rd.poc),
      fmtNum(rd.vah),
      fmtNum(rd.val),
      fmtNum(rd.avwap),
      rd.avwap_dist_pct != null ? `${rd.avwap_dist_pct}%` : '—',
      rd.relative_volume  != null ? `${rd.relative_volume}x` : '—',
      result.signal ?? '—',
    ];
  });

  return buildNote({
    frontmatter: {
      title:          'Auction Features',
      source:         'Vault Orchestrator',
      date_pulled:    today(),
      domain:         'market',
      agent_owner:    'market',
      agent_scope:    'market',
      data_type:      'auction_features',
      frequency:      'daily',
      symbol_count:   results.length,
      alert_count:    alertCount,
      signal_status:  overallStatus,
      signals:        overallStatus === 'clear' ? [] : ['auction-extension'],
      tags:           ['auction', 'volume-profile', 'avwap', 'market-microstructure'],
    },
    sections: [
      {
        heading: 'Operating Rule',
        content: [
          '> Auction state shows where price is relative to the prior session value area.',
          '> AVWAP Dist% > ±5% is extension territory — watch for mean-reversion setups.',
          '> Relative volume > 1.5x on a breakout from the value area confirms auction participation.',
          '> All entries require manual liquidity verification. No broker execution is generated.',
        ].join('\n'),
      },
      {
        heading: 'Auction Feature Scan',
        content: buildTable(
          ['Symbol', 'Auction State', 'POC', 'VAH', 'VAL', 'AVWAP', 'AVWAP Dist%', 'Rel Vol', 'Signal'],
          rows
        ),
      },
      {
        heading: 'Field Guide',
        content: [
          '- **Auction State**: `balanced` = price inside value area; `imbalance_up/down` = directional breakout; `gap_up/down` = overnight gap.',
          '- **POC**: Point of Control — highest-volume price level in the session.',
          '- **VAH / VAL**: Value Area High / Low — price range containing ~70% of session volume.',
          '- **AVWAP**: Anchored VWAP from the most recent significant low or earnings date.',
          '- **AVWAP Dist%**: Percentage distance of current price from AVWAP (positive = above).',
          '- **Rel Vol**: Today\'s volume vs 20-day average volume ratio.',
        ].join('\n'),
      },
    ],
  });
}

async function loadDefaultSymbols() {
  try {
    const wl = JSON.parse(await readFile(WATCHLISTS_PATH, 'utf-8'));
    const symbols = new Set([
      ...(wl.indexes ?? []),
      ...(wl.rates_credit ?? []),
      ...(wl.commodities_safe_haven ?? []),
    ]);
    return [...symbols];
  } catch {
    return DEFAULT_SYMBOLS;
  }
}

function fmtNum(val) {
  return val != null && Number.isFinite(Number(val)) ? Number(Number(val).toFixed(2)).toString() : '—';
}
