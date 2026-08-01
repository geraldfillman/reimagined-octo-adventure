/**
 * futures-curve.mjs — Contango/backwardation flags for transmission commodities.
 *
 * Compares the front continuous contract against a ~6-month-deferred contract.
 * Backwardation (front > deferred) signals tight physical supply — it raises
 * confidence in commodity-transmission edges. Contango is the carry-cost norm.
 *
 * Source: Yahoo Finance chart API (free, unofficial — degrade gracefully).
 * EIA's NYMEX strip series were discontinued in April 2024 and cannot be used.
 * Note: natural gas shows strong seasonal contango into winter — read its flag
 * against seasonal norms, not as pure supply signal.
 *
 * Usage:
 *   node run.mjs pull futures-curve
 *   node run.mjs pull futures-curve --dry-run
 *
 * Output: 05_Data_Pulls/Commodities/YYYY-MM-DD_Futures_Curve.md
 *         06_Signals/YYYY-MM-DD_FUTURES_BACKWARDATION.md (strong backwardation)
 */

import { join } from 'path';
import { getPullsDir, getSignalsDir } from '../lib/config.mjs';
import {
  buildNote, buildTable, writeNote, formatNumber,
  today, dateStampedFilename,
} from '../lib/markdown.mjs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
const MONTH_CODES = ['F', 'G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z'];
const BACKWARDATION_PCT = 2;   // front premium over deferred to call it backwardated
const STRONG_BACKWARDATION_PCT = 5;

// Keys match scripts/config/transmission-map.json so downstream joins work.
// `months` = contract months that actually trade (grain cycles are sparse).
const CONTRACTS = [
  { key: 'crude_oil',   label: 'WTI Crude',   root: 'CL', exchange: 'NYM', months: MONTH_CODES },
  { key: 'natural_gas', label: 'Natural Gas', root: 'NG', exchange: 'NYM', months: MONTH_CODES, seasonal: true },
  { key: 'copper',      label: 'Copper',      root: 'HG', exchange: 'CMX', months: ['H', 'K', 'N', 'U', 'Z'] },
  { key: 'gold',        label: 'Gold',        root: 'GC', exchange: 'CMX', months: ['G', 'J', 'M', 'Q', 'V', 'Z'] },
  { key: 'wheat',       label: 'Wheat (SRW)', root: 'ZW', exchange: 'CBT', months: ['H', 'K', 'N', 'U', 'Z'] },
  { key: 'corn',        label: 'Corn',        root: 'ZC', exchange: 'CBT', months: ['H', 'K', 'N', 'U', 'Z'] },
  { key: 'soybeans',    label: 'Soybeans',    root: 'ZS', exchange: 'CBT', months: ['F', 'H', 'K', 'N', 'Q', 'U', 'X'] },
];

export async function pull(flags = {}) {
  console.log('📈 Futures Curve: front vs ~6-month deferred...\n');

  const results = [];
  for (const c of CONTRACTS) {
    const row = await measureCurve(c);
    results.push(row);
    if (row.error) console.log(`  ⚠️ ${c.label}: ${row.error}`);
    else {
      const icon = row.state === 'backwardation' ? '🔺' : row.state === 'contango' ? '🔻' : '➖';
      console.log(`  ${icon} ${c.label}: front ${row.front} vs ${row.deferredSymbol} ${row.deferred} → ${row.state} (${row.spreadPct > 0 ? '+' : ''}${row.spreadPct}%)`);
    }
  }

  const strong = results.filter(r => !r.error && r.state === 'backwardation' && r.spreadPct >= STRONG_BACKWARDATION_PCT && !r.seasonal);
  const signalStatus = strong.length > 0 ? 'watch' : 'clear';

  const curves = Object.fromEntries(results.filter(r => !r.error).map(r => [r.key, r.state]));
  const note = buildCurveNote({ results, curves, signalStatus });
  const filePath = join(getPullsDir(), 'Commodities', dateStampedFilename('Futures_Curve'));

  if (flags['dry-run']) {
    console.log(note);
    return { filePath: null, curves, signal_status: signalStatus };
  }

  writeNote(filePath, note);
  console.log(`\n📝 Wrote: ${filePath}`);

  if (strong.length > 0) {
    const signalPath = writeBackwardationSignal(strong);
    console.log(`⚡ Signal logged: ${signalPath}`);
  }

  return { filePath, curves, signal_status: signalStatus };
}

// ─── Curve measurement ──────────────────────────────────────────────────────────

async function measureCurve(contract) {
  const base = { key: contract.key, label: contract.label, seasonal: contract.seasonal ?? false };

  const front = await fetchPrice(`${contract.root}=F`);
  if (front == null) return { ...base, error: 'front contract unavailable' };

  // Walk allowed contract months starting ~6 months out until one quotes.
  const now = new Date();
  for (let offset = 6; offset <= 10; offset++) {
    const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const code = MONTH_CODES[target.getMonth()];
    if (!contract.months.includes(code)) continue;
    const yy = String(target.getFullYear()).slice(2);
    const symbol = `${contract.root}${code}${yy}.${contract.exchange}`;
    const deferred = await fetchPrice(symbol);
    if (deferred == null) continue;

    const spreadPct = Math.round(((front - deferred) / deferred) * 1000) / 10;
    const state = spreadPct >= BACKWARDATION_PCT ? 'backwardation'
      : spreadPct <= -BACKWARDATION_PCT ? 'contango' : 'flat';
    return { ...base, front, deferred, deferredSymbol: symbol, spreadPct, state };
  }
  return { ...base, front, error: 'no deferred contract quoted in 6-10 month window' };
}

async function fetchPrice(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`;
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;
    const json = await res.json();
    const price = json?.chart?.result?.[0]?.meta?.regularMarketPrice;
    return typeof price === 'number' && Number.isFinite(price) ? price : null;
  } catch {
    return null;
  }
}

// ─── Note builders ──────────────────────────────────────────────────────────────

function buildCurveNote({ results, curves, signalStatus }) {
  const rows = results.map(r => r.error
    ? [r.label, 'ERROR', r.error, '—', '—']
    : [
        r.label,
        formatNumber(r.front, { decimals: 2 }),
        `${r.deferredSymbol}: ${formatNumber(r.deferred, { decimals: 2 })}`,
        `${r.spreadPct > 0 ? '+' : ''}${r.spreadPct}%`,
        r.state + (r.seasonal ? ' (seasonal caveat)' : ''),
      ]);

  return buildNote({
    frontmatter: {
      title: 'Futures Term Structure',
      source: 'Yahoo Finance futures chains (unofficial)',
      date_pulled: today(),
      domain: 'commodities',
      data_type: 'futures_curve',
      curves,
      curves_json: JSON.stringify(curves),
      signal_status: signalStatus,
      tags: ['commodities', 'futures', 'term-structure'],
      related_pulls: [],
    },
    sections: [
      {
        heading: 'Is the physical market tight? (front vs ~6-month deferred)',
        content: buildTable(['Commodity', 'Front', 'Deferred', 'Spread', 'State'], rows),
      },
      {
        heading: 'Reading the curve',
        content: [
          '- **Backwardation** (front > deferred): buyers pay a premium for prompt delivery — physical tightness. Raises confidence in rise-side transmission edges.',
          '- **Contango** (front < deferred): normal carry. Deep contango can mean glut.',
          '- Natural gas carries seasonal contango into winter — compare against seasonal norms before reading it as supply signal.',
          '- Keys match `transmission-map.json`; `commodity-transmission` annotates its signals with these states.',
          '- Source is unofficial (Yahoo); when TastyTrade futures-chain exports arrive, they become the verified curve source.',
        ].join('\n'),
      },
    ],
  });
}

function writeBackwardationSignal(strong) {
  const signalId = 'FUTURES_BACKWARDATION';
  const note = buildNote({
    frontmatter: {
      signal_id: signalId,
      signal_name: `Strong backwardation: ${strong.map(r => r.label).join(', ')}`,
      domain: 'commodities',
      severity: 'watch',
      value: Math.max(...strong.map(r => r.spreadPct)),
      threshold: STRONG_BACKWARDATION_PCT,
      date: today(),
      source_pull: 'Futures_Curve',
      commodities: strong.map(r => r.key),
      tags: ['signal', 'commodities', 'futures', 'watch'],
    },
    sections: [
      {
        heading: 'Physical tightness confirmed by the curve',
        content: strong.map(r =>
          `- **${r.label}**: front ${formatNumber(r.front, { decimals: 2 })} vs ${r.deferredSymbol} ${formatNumber(r.deferred, { decimals: 2 })} (+${r.spreadPct}%)`
        ).join('\n'),
      },
      {
        heading: 'Implications',
        content: [
          '- Treat matching `COMMODITY_TRANSMISSION_*` signals with higher confidence — spot moves backed by curve tightness persist longer.',
          '- Check COT positioning for the same markets: tightness + crowded shorts = squeeze fuel.',
        ].join('\n'),
      },
    ],
  });

  const signalPath = join(getSignalsDir(), dateStampedFilename(signalId));
  writeNote(signalPath, note);
  return signalPath;
}
