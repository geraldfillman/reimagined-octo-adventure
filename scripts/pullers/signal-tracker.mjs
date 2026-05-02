/**
 * signal-tracker.mjs — Forward signal tracker for ORB strategy signals.
 *
 * Hold modes:
 *   intraday          Default. Close same day at stop/2R/close.
 *   swing-compression Edge layer rides until entropy >= 0.50 (no longer compressed) or 5 trading days.
 *   swing-entropy     Edge layer rides until entropy >= 0.70 (baseline restored) or 7 trading days.
 *   options           Weekly BSM-priced call/put. Repriced at reconcile via current price + IV.
 *
 * --log    : Parse today's ORB screen. Log equity positions with auto-detected hold mode
 *            (compression scan -> swing-compression; otherwise intraday).
 *            Also log options positions from the Options Layer section.
 * (default): Reconcile open positions, mark outcomes, write Signal_Outcomes note.
 *
 * Journal: 05_Data_Pulls/Backtest/signal_journal.csv
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fetchDailyPrices, fetchQuote } from '../lib/fmp-client.mjs';
import { fetchIntradayPrices } from '../lib/fmp-client.mjs';
import { mapConcurrent } from '../lib/fetcher.mjs';
import { buildNote, buildTable, writeNote, today, dateStampedFilename } from '../lib/markdown.mjs';
import { getPullsDir } from '../lib/config.mjs';
import { computeTransitionEntropyFromBars } from '../agents/marketmind/entropy.mjs';
import { normalizeIntradayBars, groupBySession } from '../lib/bars.mjs';
import { bsmPrice, daysBetween } from '../lib/bsm.mjs';

const OLD_HEADER     = 'date,symbol,direction,entry,stop,target_2r,tier,strategy,outcome,r_multiple,notes';
const JOURNAL_HEADER = 'date,symbol,direction,entry,stop,target_2r,tier,strategy,outcome,r_multiple,notes,hold_mode,option_type,strike,expiry,iv,debit';
const CONCURRENCY    = 5;

// Max days open per swing mode before forced close
const MAX_DAYS = { 'swing-compression': 5, 'swing-entropy': 7 };

function journalPath() { return join(getPullsDir(), 'Backtest', 'signal_journal.csv'); }

// ── Markdown table parser ─────────────────────────────────────────────────────

function parseSection(markdown, headingKeyword) {
  const lines = markdown.split('\n');
  let inSection = false, headers = null;
  const rows = [];
  for (const line of lines) {
    if (line.startsWith('## ')) { inSection = line.includes(headingKeyword); headers = null; continue; }
    if (!inSection || !line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    if (!headers) { headers = cells; continue; }
    if (cells.every(c => /^[-: ]*$/.test(c))) continue;
    rows.push(Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ''])));
  }
  return rows;
}

// ── Signal parsers ────────────────────────────────────────────────────────────

function parseTradeSheet(markdown) {
  const num = s => parseFloat((s || '').replace(/[$,]/g, ''));
  return parseSection(markdown, 'Trade Sheet').map(r => ({
    symbol:    (r['Ticker'] || '').replace(/\[\[|\]\]/g, '').trim(),
    direction: (r['Direction'] || '').toUpperCase().trim(),
    entry:     num(r['Entry']),
    stop:      num(r['Stop']),
    target_2r: num(r['2R Target']),
    tier:      (r['Tier'] || '').trim(),
  })).filter(r => r.symbol && ['LONG', 'SHORT'].includes(r.direction) && Number.isFinite(r.entry));
}

function parseOptionsLayer(markdown) {
  const num = s => parseFloat((s || '').replace(/[$,]/g, ''));
  const rows = parseSection(markdown, 'Options Layer');
  if (!rows.length) return [];

  // Find first weekly Debit column key (not 5/15)
  const sampleKeys = Object.keys(rows[0] || {});
  const weeklyDebitKey = sampleKeys.find(k => k.includes('Debit') && !k.includes('/15'));
  if (!weeklyDebitKey) return [];

  // Extract expiry date from column header, e.g. "5/1 Debit" → "2026-05-01"
  const expiryMatch = weeklyDebitKey.match(/(\d+)\/(\d+)/);
  const expiry = expiryMatch
    ? `${new Date().getFullYear()}-${String(expiryMatch[1]).padStart(2,'0')}-${String(expiryMatch[2]).padStart(2,'0')}`
    : '';

  return rows.map(r => {
    const symbol = (r['Ticker'] || '').replace(/\[\[|\]\]/g, '').trim();
    const typeStr = (r['Type'] || '').toLowerCase();
    const optionType = typeStr.includes('call') ? 'call' : typeStr.includes('put') ? 'put' : null;
    const ivRaw = parseFloat((r['Est. IV'] || '').replace('%', ''));
    return {
      symbol, optionType,
      direction: optionType === 'call' ? 'LONG' : 'SHORT',
      strike:    num(r['Strike']),
      debit:     num(r[weeklyDebitKey]),
      expiry,
      iv:        Number.isFinite(ivRaw) ? ivRaw / 100 : null,
    };
  }).filter(r => r.symbol && r.optionType && Number.isFinite(r.strike) && Number.isFinite(r.debit));
}

// Returns Set of sustained compression symbols from today's scan note
function parseSustainedCompressions() {
  const path = join(getPullsDir(), 'Market', `${today()}_Entropy_Compression_Scan.md`);
  if (!existsSync(path)) return new Set();
  const rows = parseSection(readFileSync(path, 'utf8'), 'All Results');
  return new Set(
    rows
      .filter(r => (r['Sustained'] || '').trim().toUpperCase() === 'YES')
      .map(r => (r['Symbol'] || '').replace(/\[\[|\]\]/g, '').trim())
      .filter(Boolean)
  );
}

// ── Market data helpers ───────────────────────────────────────────────────────

async function getCurrentEntropy(symbol) {
  try {
    const bars = await fetchIntradayPrices(symbol, { interval: '1min' });
    if (!bars?.length) return null;
    const sessions = groupBySession(bars);
    const latestDate = [...sessions.keys()].sort().at(-1);
    const sorted = normalizeIntradayBars(sessions.get(latestDate) ?? []);
    return computeTransitionEntropyFromBars(sorted, { lookback: sorted.length })?.score ?? null;
  } catch { return null; }
}

function countTradingDays(fromDate, toDate) {
  let count = 0;
  const d = new Date(fromDate);
  const end = new Date(toDate);
  while (d < end) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) count++;
  }
  return count;
}

// ── Journal helpers ───────────────────────────────────────────────────────────

function loadJournal() {
  const path = journalPath();
  if (!existsSync(path)) return { header: JOURNAL_HEADER, rows: [] };

  const lines = readFileSync(path, 'utf8').split('\n').filter(l => l.trim());
  const [storedHeader, ...dataLines] = lines;

  // Migrate old 11-column header to new 17-column header
  const header   = storedHeader === OLD_HEADER ? JOURNAL_HEADER : storedHeader;
  const oldCols  = storedHeader.split(',');
  const newCols  = header.split(',');

  return {
    header,
    rows: dataLines.map(l => {
      const vals = l.split(',');
      const row  = Object.fromEntries(oldCols.map((c, i) => [c, vals[i] ?? '']));
      for (const col of newCols) if (!(col in row)) row[col] = '';
      return row;
    }),
  };
}

function saveJournal({ header, rows }) {
  mkdirSync(join(getPullsDir(), 'Backtest'), { recursive: true });
  const cols  = header.split(',');
  const lines = rows.map(r => cols.map(c => r[c] ?? '').join(','));
  writeFileSync(journalPath(), [header, ...lines].join('\n') + '\n', 'utf8');
}

// ── Log mode ──────────────────────────────────────────────────────────────────

async function logSignals() {
  const screenPath = join(getPullsDir(), 'Market', `${today()}_ORB_Entropy_Screen.md`);
  if (!existsSync(screenPath)) {
    console.error(`Signal Tracker: no ORB screen for today. Run orb-entropy first.`);
    return;
  }

  const markdown     = readFileSync(screenPath, 'utf8');
  const signals      = parseTradeSheet(markdown);
  const options      = parseOptionsLayer(markdown);
  const sustained    = parseSustainedCompressions();

  const journal = loadJournal();
  const existing = new Set(
    journal.rows.filter(r => r.date === today()).map(r => `${r.symbol}:${r.direction}:${r.hold_mode || 'intraday'}`)
  );

  const newRows = [];

  // Equity positions
  for (const s of signals) {
    const holdMode = sustained.has(s.symbol) ? 'swing-compression'
                   : 'intraday';
    const key = `${s.symbol}:${s.direction}:${holdMode}`;
    if (existing.has(key)) continue;
    newRows.push({
      date: today(), symbol: s.symbol, direction: s.direction,
      entry: String(s.entry), stop: String(s.stop), target_2r: String(s.target_2r),
      tier: s.tier, strategy: 'orb-entropy',
      outcome: 'open', r_multiple: '', notes: '',
      hold_mode: holdMode, option_type: '', strike: '', expiry: '', iv: '', debit: '',
    });
  }

  // Options positions
  for (const o of options) {
    const key = `${o.symbol}:${o.direction}:options`;
    if (existing.has(key)) continue;
    newRows.push({
      date: today(), symbol: o.symbol, direction: o.direction,
      entry: '', stop: '', target_2r: '',
      tier: 'options', strategy: 'orb-options',
      outcome: 'open', r_multiple: '', notes: '',
      hold_mode: 'options',
      option_type: o.optionType, strike: String(o.strike), expiry: o.expiry,
      iv: String(o.iv ?? ''), debit: String(o.debit),
    });
  }

  if (!newRows.length) {
    console.log(`Signal Tracker: all signals already logged for today.`);
    return;
  }

  journal.rows.push(...newRows);
  saveJournal(journal);

  const eqNew   = newRows.filter(r => r.hold_mode !== 'options').length;
  const optNew  = newRows.filter(r => r.hold_mode === 'options').length;
  const swings  = newRows.filter(r => r.hold_mode !== 'intraday' && r.hold_mode !== 'options');
  console.log(`Signal Tracker: logged ${eqNew} equity (${swings.length} swing) + ${optNew} options signal(s)`);
  if (swings.length) {
    const byMode = Object.groupBy(swings, r => r.hold_mode);
    for (const [mode, rows] of Object.entries(byMode ?? {})) {
      console.log(`  ${mode}: ${rows.map(r => r.symbol).join(', ')}`);
    }
  }
}

// ── Reconcile helpers ─────────────────────────────────────────────────────────

function computeEquityR(row, close) {
  const e = Number(row.entry), s = Number(row.stop);
  const r = Math.abs(e - s);
  if (!r) return null;
  return row.direction === 'LONG' ? (close - e) / r : (e - close) / r;
}

function closePosition(row, bar, notes) {
  const close  = Number(bar?.close ?? 0);
  const rMult  = computeEquityR(row, close);
  row.outcome   = 'held';
  row.r_multiple = rMult != null ? rMult.toFixed(3) : '--';
  row.notes     = notes;
}

// ── Reconcile per hold mode ───────────────────────────────────────────────────

function reconcileIntraday(row, bar) {
  if (!bar) { row.outcome = 'error'; row.notes = 'price fetch failed'; return; }
  const e = Number(row.entry), s = Number(row.stop), t = Number(row.target_2r);
  const r = Math.abs(e - s);
  const dir = row.direction;
  const high = Number(bar.high), low = Number(bar.low), close = Number(bar.close);
  const stopHit   = dir === 'LONG' ? low  <= s : high >= s;
  const targetHit = dir === 'LONG' ? high >= t : low  <= t;
  const closeR    = dir === 'LONG' ? (close - e) / r : (e - close) / r;
  if (stopHit)        { row.outcome = 'stopped'; row.r_multiple = '-1.000'; }
  else if (targetHit) { row.outcome = 'target';  row.r_multiple = (0.5 * 2 + 0.5 * closeR).toFixed(3); }
  else                { row.outcome = 'held';    row.r_multiple = closeR.toFixed(3); }
  row.notes = `${bar.date} close $${Number(close).toFixed(2)}`;
}

function reconcileSwingCompression(row, bar, entropy, daysOpen) {
  if (!bar) { row.outcome = 'error'; row.notes = 'price fetch failed'; return; }
  const forceClose = daysOpen >= (MAX_DAYS['swing-compression']);
  const entropyExit = entropy != null && entropy >= 0.50;
  if (forceClose || entropyExit) {
    const reason = forceClose ? `max ${MAX_DAYS['swing-compression']}d` : `entropy ${entropy?.toFixed(3)} >= 0.50`;
    closePosition(row, bar, `closed day ${daysOpen}: ${reason}`);
  }
  // else: keep open (outcome stays 'open')
}

function reconcileSwingEntropy(row, bar, entropy, daysOpen) {
  if (!bar) { row.outcome = 'error'; row.notes = 'price fetch failed'; return; }
  const forceClose  = daysOpen >= (MAX_DAYS['swing-entropy']);
  const entropyExit = entropy != null && entropy >= 0.70;
  if (forceClose || entropyExit) {
    const reason = forceClose ? `max ${MAX_DAYS['swing-entropy']}d` : `entropy ${entropy?.toFixed(3)} >= 0.70 (baseline)`;
    closePosition(row, bar, `closed day ${daysOpen}: ${reason}`);
  }
}

async function reconcileOptions(row) {
  try {
    const quote = await fetchQuote(row.symbol);
    if (!quote) { row.outcome = 'error'; row.notes = 'quote fetch failed'; return; }

    const S      = Number(quote.price);
    const K      = Number(row.strike);
    const sigma  = Number(row.iv);
    const debit  = Number(row.debit);
    const T      = Math.max(0, daysBetween(today(), row.expiry)) / 365;
    const type   = row.option_type;

    if (T === 0 || debit <= 0) {
      row.outcome    = 'expired';
      row.r_multiple = '-1.000';
      row.notes      = `expired worthless`;
      return;
    }

    const currentValue = bsmPrice({ S, K, T, sigma, r: 0.05, type });
    const pnl          = currentValue - debit;
    const returnPct    = (pnl / debit * 100).toFixed(1);
    row.outcome    = 'open'; // options stay open until expiry
    row.r_multiple = (pnl / debit).toFixed(3);
    row.notes      = `S=$${S.toFixed(2)} val=$${currentValue.toFixed(2)} P&L=${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${returnPct >= 0 ? '+' : ''}${returnPct}%) T=${Math.round(T*365)}d`;
  } catch (e) {
    row.outcome = 'error'; row.notes = String(e.message || e).slice(0, 80);
  }
}

// ── Reconcile orchestration ───────────────────────────────────────────────────

async function reconcileSignals() {
  const journal = loadJournal();
  const open    = journal.rows.filter(r => r.outcome === 'open');
  if (!open.length) { console.log('Signal Tracker: no open positions to reconcile.'); return; }

  const eqOpen   = open.filter(r => r.hold_mode !== 'options');
  const optOpen  = open.filter(r => r.hold_mode === 'options');
  const symbols  = [...new Set(eqOpen.map(r => r.symbol))];
  console.log(`Signal Tracker: reconciling ${open.length} position(s) (${eqOpen.length} equity, ${optOpen.length} options)...`);

  // Fetch EOD price bars for all equity symbols
  const priceMap = new Map();
  await mapConcurrent(symbols, CONCURRENCY, async sym => {
    try {
      const bars = await fetchDailyPrices(sym);
      if (bars?.length) priceMap.set(sym, bars[0]);
    } catch { /* skip */ }
  });

  // Fetch entropy for swing-compression and swing-entropy positions
  const entropySymbols = eqOpen.filter(r => ['swing-compression', 'swing-entropy'].includes(r.hold_mode)).map(r => r.symbol);
  const entropyMap = new Map();
  await mapConcurrent([...new Set(entropySymbols)], 3, async sym => {
    const e = await getCurrentEntropy(sym);
    if (e != null) entropyMap.set(sym, e);
  });

  const resolved = [];

  for (const row of journal.rows) {
    if (row.outcome !== 'open') continue;

    const mode     = row.hold_mode || 'intraday';
    const bar      = priceMap.get(row.symbol);
    const daysOpen = countTradingDays(row.date, today());

    if (mode === 'options') {
      await reconcileOptions(row);
    } else if (mode === 'swing-compression') {
      reconcileSwingCompression(row, bar, entropyMap.get(row.symbol), daysOpen);
    } else if (mode === 'swing-entropy') {
      reconcileSwingEntropy(row, bar, entropyMap.get(row.symbol), daysOpen);
    } else {
      reconcileIntraday(row, bar);
    }

    resolved.push(row);
  }

  saveJournal(journal);
  const closed   = resolved.filter(r => r.outcome !== 'open');
  const stillOpen = resolved.filter(r => r.outcome === 'open');
  console.log(`  Closed: ${closed.length} | Still open (swing/options): ${stillOpen.length}`);

  // Build summary note for closed positions this session
  if (!closed.length) { console.log('  No positions closed today.'); return; }

  const todayStr  = today();
  const totalR    = closed.reduce((s, p) => s + Number(p.r_multiple || 0), 0);
  const wins      = closed.filter(p => Number(p.r_multiple) > 0).length;
  const tableRows = closed.map(p => [
    `[[${p.symbol}]]`, p.direction, p.hold_mode || 'intraday', p.tier || '--',
    p.hold_mode === 'options' ? `${p.option_type} $${p.strike}` : `$${Number(p.entry).toFixed(2)}`,
    p.outcome,
    p.r_multiple || '--',
    p.notes || '--',
  ]);

  const outDir  = join(getPullsDir(), 'Backtest');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, dateStampedFilename('Signal_Outcomes'));

  const note = buildNote({
    frontmatter: {
      title:       `Signal Outcomes ${todayStr}`,
      source:      'ORB Screen + FMP Closing Prices',
      date_pulled: todayStr,
      domain:      'backtest',
      data_type:   'signal_outcomes',
      frequency:   'daily',
      total_r:     totalR.toFixed(3),
      win_rate:    closed.length > 0 ? (wins / closed.length).toFixed(3) : '0',
      tags:        ['backtest', 'signal-tracker', 'orb', 'outcomes'],
    },
    sections: [
      {
        heading: 'Session Summary',
        content: [
          `- **Positions closed**: ${closed.length} (${stillOpen.length} still open — swing/options carry)`,
          `- **Wins**: ${wins} of ${closed.length} (${closed.length ? Math.round(100 * wins / closed.length) : 0}%)`,
          `- **Total R**: ${totalR.toFixed(3)}`,
          `- **Avg R**: ${closed.length ? (totalR / closed.length).toFixed(3) : '--'}`,
        ].join('\n'),
      },
      {
        heading: 'Closed Positions',
        content: tableRows.length > 0
          ? buildTable(['Symbol', 'Dir', 'Mode', 'Tier', 'Entry / Contract', 'Outcome', 'R Multiple', 'Notes'], tableRows)
          : '_No closed positions._',
      },
      {
        heading: 'Still Open (Carry)',
        content: stillOpen.length > 0
          ? stillOpen.map(p => `- [[${p.symbol}]] ${p.direction} ${p.hold_mode} — day ${countTradingDays(p.date, todayStr)} of ${MAX_DAYS[p.hold_mode] ?? '?'} max`).join('\n')
          : '_None._',
      },
      {
        heading: 'How to Read',
        content: [
          '- **intraday**: stop/2R/close same day. R uses income (50%) + edge (50%) split.',
          '- **swing-compression**: held until entropy >= 0.50 or 5 trading days. Exit at close.',
          '- **swing-entropy**: held until entropy >= 0.70 (baseline restored) or 7 trading days.',
          '- **options**: BSM repriced daily. R = (current_value − debit) / debit. Stays open until expiry.',
          '- Run `--log` each morning after ORB screen, and this reconcile each evening after close.',
        ].join('\n'),
      },
    ],
  });

  writeNote(outPath, note);
  console.log(`  Wrote: ${outPath}`);
  console.log(`  Total R: ${totalR.toFixed(3)} | Wins: ${wins}/${closed.length}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

export async function pull(flags = {}) {
  if (flags.log) {
    await logSignals();
  } else {
    await reconcileSignals();
  }
}
