import { join } from 'path';
import { fetchIntradayPrices } from '../lib/fmp-client.mjs';
import { computeTransitionEntropyFromBars, classifyBucket } from '../agents/marketmind/entropy.mjs';
import { loadThesisWatchlists } from '../lib/thesis-watchlists.mjs';
import { buildNote, buildTable, writeNote, today, dateStampedFilename } from '../lib/markdown.mjs';
import { getApiKey, getBaseUrl, getPullsDir } from '../lib/config.mjs';
import { getJson, mapConcurrent } from '../lib/fetcher.mjs';
import { normalizeIntradayBars, groupBySession } from '../lib/bars.mjs';

const DEFAULT_THRESHOLD       = 0.50;   // low-entropy-watch ceiling
const DEFAULT_EARNINGS_DAYS   = 7;      // how far ahead to scan earnings calendar
const DEFAULT_MIN_SESSIONS    = 2;      // consecutive compressed sessions to flag as sustained
const DEFAULT_MAX_EARNINGS    = 200;    // cap earnings calendar to avoid 4000-symbol API drain
const DEFAULT_US_ONLY         = true;   // skip foreign-listed symbols (contains '.' like .L .TO .CN)
const DEFAULT_INCLUDE_SP500   = true;   // include S&P 500 constituents as a third source
const DEFAULT_EXCHANGE_FILTER = true;   // restrict to stocks/ETFs on major exchanges only
const CONCURRENCY             = 5;

// ── helpers ───────────────────────────────────────────────────────────────────

function stableUrl(baseUrl) {
  return baseUrl.replace(/\/api\/v\d+$/, '/stable');
}

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// US-listed: 1-5 uppercase letters, optional dash suffix (BRK-B, BHR-PB). Rejects anything with '.'
function isUsListed(symbol) {
  return /^[A-Z]{1,5}(-[A-Z0-9]+)?$/.test(symbol);
}

// Compute end-of-session entropy for a set of bars (newest-first)
function sessionEntropy(sessionBars) {
  if (sessionBars.length === 0) return null;
  const sorted = normalizeIntradayBars(sessionBars);
  const e = computeTransitionEntropyFromBars(sorted, { lookback: sorted.length });
  return e?.score ?? null;
}

// ── earnings calendar ─────────────────────────────────────────────────────────

async function fetchEarningsCalendar(stable, apiKey, days) {
  const from = today();
  const to   = addDays(from, days);
  try {
    const data = await getJson(`${stable}/earnings-calendar?from=${from}&to=${to}&apikey=${apiKey}`);
    if (!Array.isArray(data)) return [];
    // Returns [{symbol, date, epsEstimated, revenueEstimated, ...}]
    return data.map(e => ({ symbol: e.symbol, earningsDate: e.date })).filter(e => e.symbol);
  } catch {
    return [];
  }
}

// ── Exchange filter via profile ───────────────────────────────────────────────
// Checks each symbol's exchange via the /stable/profile endpoint.
// Excludes OTC/pink-sheet/grey-market names; keeps NYSE, NASDAQ, AMEX and variants.
// Applied only to the earnings calendar (max 200 symbols) — S&P 500 and watchlist
// are curated sources that bypass this check.

async function filterToListedExchanges(symbols, stable, apiKey) {
  if (!symbols.length) return new Set();
  const results = await mapConcurrent(symbols, CONCURRENCY, async (sym) => {
    try {
      const data = await getJson(`${stable}/profile?symbol=${encodeURIComponent(sym)}&apikey=${apiKey}`);
      const item = Array.isArray(data) ? data[0] : data;
      const exch = (item?.exchange ?? '').toUpperCase();
      // Exclude OTC, Pink Sheets, Grey Market; keep NYSE/NASDAQ/AMEX and variants
      const isOtc = !exch || exch.includes('OTC') || exch.includes('PINK') || exch.includes('GREY');
      return isOtc ? null : sym;
    } catch { return null; }
  });
  return new Set(results.filter(Boolean));
}

// ── S&P 500 constituents ──────────────────────────────────────────────────────

async function fetchSP500Symbols(stable, apiKey) {
  try {
    const data = await getJson(`${stable}/sp500-constituent?apikey=${apiKey}`);
    if (!Array.isArray(data)) return [];
    return data.map(e => e.symbol).filter(Boolean);
  } catch { return []; }
}

// ── thesis watchlist symbols ───────────────────────────────────────────────────

async function fetchWatchlistSymbols() {
  try {
    const watchlists = await loadThesisWatchlists();
    const symbolMap  = new Map(); // symbol -> thesis names[]
    for (const wl of watchlists) {
      for (const sym of wl.symbols) {
        if (!symbolMap.has(sym)) symbolMap.set(sym, []);
        symbolMap.get(sym).push(wl.name);
      }
    }
    return symbolMap;
  } catch {
    return new Map();
  }
}

// ── per-symbol entropy analysis ───────────────────────────────────────────────

async function analyzeSymbol(symbol, threshold, minSessions) {
  try {
    const bars       = await fetchIntradayPrices(symbol, { interval: '1min' });
    if (!bars || bars.length === 0) return null;

    const sessions   = groupBySession(bars);
    const dates      = [...sessions.keys()].sort();            // oldest-first
    const complete   = dates.slice(0, -1);                     // exclude today (partial)
    const partial    = dates.at(-1);                           // today or most recent partial

    // Score each complete session
    const sessionScores = complete.map(d => ({
      date:  d,
      score: sessionEntropy(sessions.get(d)),
      bars:  sessions.get(d).length,
    })).filter(s => s.score !== null);

    // Also score the partial/latest session
    const latestBars  = sessions.get(partial) ?? [];
    const latestScore = sessionEntropy(latestBars);
    const latestDate  = partial;

    if (sessionScores.length === 0 && latestScore === null) return null;

    // Sustained = last N complete sessions all <= threshold
    const recent        = sessionScores.slice(-minSessions);
    const sustained     = recent.length >= minSessions && recent.every(s => s.score <= threshold);
    const prevScore     = sessionScores.at(-1)?.score ?? null;
    const prevDate      = sessionScores.at(-1)?.date  ?? null;

    return {
      symbol,
      latestDate,
      latestScore,
      prevDate,
      prevScore,
      sessionScores,
      sustained,
      compressed: (latestScore !== null && latestScore <= threshold) ||
                  (prevScore   !== null && prevScore   <= threshold),
    };
  } catch {
    return null;
  }
}

// ── main ──────────────────────────────────────────────────────────────────────

export async function pull(flags = {}) {
  const apiKey    = getApiKey('fmp');
  const stable    = stableUrl(getBaseUrl('fmp'));
  const threshold   = Number(flags.threshold       ?? DEFAULT_THRESHOLD);
  const earnDays    = Number(flags['earn-days']    ?? DEFAULT_EARNINGS_DAYS);
  const minSess     = Number(flags['min-sessions'] ?? DEFAULT_MIN_SESSIONS);
  const maxEarnings  = Number(flags['max-earnings'] ?? DEFAULT_MAX_EARNINGS);
  const usOnly         = flags['us-only'] === 'false' ? false : DEFAULT_US_ONLY;
  const includeSP500   = flags['no-sp500'] ? false : DEFAULT_INCLUDE_SP500;
  const exchangeFilter = flags['no-exchange-filter'] ? false : DEFAULT_EXCHANGE_FILTER;

  // ── 1. Build symbol universe ────────────────────────────────────────────────
  let earningsEntries = [], watchlistMap = new Map(), spxSet = new Set(), listedSet = null;

  if (flags.symbols || flags.symbol) {
    const syms = String(flags.symbols ?? flags.symbol).split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    earningsEntries = syms.map(s => ({ symbol: s, earningsDate: null }));
    console.log(`Compression Scan: ${syms.length} symbol(s) from --symbols`);
  } else {
    console.log('Compression Scan: loading earnings calendar + thesis watchlists + S&P 500...');
    const [rawEarnings, wlMap, spxSymbols] = await Promise.all([
      fetchEarningsCalendar(stable, apiKey, earnDays),
      fetchWatchlistSymbols(),
      includeSP500 ? fetchSP500Symbols(stable, apiKey) : Promise.resolve([]),
    ]);
    const usFiltered   = usOnly ? rawEarnings.filter(e => isUsListed(e.symbol)) : rawEarnings;
    const earnCapped   = usFiltered.slice(0, maxEarnings);
    const filterNote   = usOnly ? ` — US-listed only (${usFiltered.length} of ${rawEarnings.length}), capped at ${maxEarnings}` : ` — capped at ${maxEarnings}`;
    console.log(`  Earnings calendar: ${rawEarnings.length} upcoming reports (next ${earnDays} days)${filterNote}`);

    if (exchangeFilter) {
      console.log(`  Exchange filter: checking ${earnCapped.length} earnings symbols via FMP profile...`);
      listedSet = await filterToListedExchanges(earnCapped.map(e => e.symbol), stable, apiKey);
      earningsEntries = earnCapped.filter(e => listedSet.has(e.symbol));
      console.log(`  Exchange filter: kept ${earningsEntries.length} of ${earnCapped.length} (removed ${earnCapped.length - earningsEntries.length} OTC/warrant/preferred)`);
    } else {
      earningsEntries = earnCapped;
    }

    watchlistMap = wlMap;
    for (const sym of spxSymbols) spxSet.add(sym);
    console.log(`  Thesis watchlists: ${watchlistMap.size} unique symbols`);
    if (includeSP500) console.log(`  S&P 500: ${spxSet.size} constituents`);
  }

  // Merge into deduplicated universe — earnings already exchange-filtered above
  const earningsMap = new Map(earningsEntries.map(e => [e.symbol, e.earningsDate]));
  const allSymbols  = [...new Set([...earningsMap.keys(), ...watchlistMap.keys(), ...spxSet])];
  console.log(`  Total unique symbols to scan: ${allSymbols.length}`);

  if (allSymbols.length === 0) { console.log('Compression Scan: no symbols.'); return; }

  // ── 2. Analyze each symbol ─────────────────────────────────────────────────
  console.log(`Compression Scan: fetching intraday data (${CONCURRENCY} concurrent)...`);
  const results = (await mapConcurrent(allSymbols, CONCURRENCY, sym =>
    analyzeSymbol(sym, threshold, minSess)
  )).filter(Boolean);

  const compressed = results.filter(r => r.compressed);
  const sustained  = results.filter(r => r.sustained);
  console.log(`  ${results.length} scanned | ${compressed.length} compressed | ${sustained.length} sustained`);

  // ── 3. Build note ──────────────────────────────────────────────────────────
  const fmt  = (v, d = 3) => v != null ? v.toFixed(d) : '--';
  const cols = ['Symbol', 'Latest Score', 'Prev Score', 'Bucket', 'Sustained', 'Sessions', 'Earnings', 'Source'];

  function buildRows(subset) {
    return subset.map(r => {
      const bucket    = r.latestScore != null ? classifyBucket(r.latestScore) : '--';
      const earnDate  = earningsMap.get(r.symbol) ?? '--';
      const wlNames   = watchlistMap.get(r.symbol);
      const source    = [earningsMap.has(r.symbol) ? 'earnings' : '', wlNames?.length ? 'watchlist' : '', spxSet.has(r.symbol) ? 'sp500' : ''].filter(Boolean).join(' + ') || 'manual';
      const sessLine  = r.sessionScores.map(s => `${s.date}: ${s.score.toFixed(3)}`).join(', ');
      return [
        `[[${r.symbol}]]`,
        fmt(r.latestScore),
        fmt(r.prevScore),
        bucket,
        r.sustained ? 'YES' : 'no',
        sessLine || '--',
        earnDate,
        source,
      ];
    });
  }

  const earningsCompressed  = compressed.filter(r => earningsMap.has(r.symbol));
  const watchlistCompressed = compressed.filter(r => watchlistMap.has(r.symbol) && !earningsMap.has(r.symbol));

  const note = buildNote({
    frontmatter: {
      title:        'Entropy Compression Scan',
      source:       'FMP + Thesis Watchlists + Earnings Calendar',
      date_pulled:  today(),
      domain:       'market',
      data_type:    'screen',
      frequency:    'daily',
      signal_status: sustained.length > 0 ? 'watch' : 'clear',
      signals:      sustained.map(r => `ENTROPY_COMPRESSED_${r.symbol}`),
      threshold,
      tags:         ['equities', 'entropy', 'compression', 'earnings', 'watchlist'],
    },
    sections: [
      {
        heading: 'Scan Parameters',
        content: [
          `- **Compression threshold**: entropy score <= ${threshold} (${classifyBucket(threshold)})`,
          `- **Sustained definition**: last ${minSess} complete sessions both <= threshold`,
          `- **Earnings window**: next ${earnDays} days (max ${maxEarnings} symbols)`,
          `- **Universe filter**: ${usOnly ? 'US-listed only (no foreign-listed, .L .TO .CN etc.)' : 'all listings (including foreign)'}`,
          `- **Exchange filter**: ${exchangeFilter ? `earnings calendar restricted to NYSE/NASDAQ/AMEX-listed stocks and ETFs (OTC/warrants/preferred excluded)` : 'disabled — use --no-exchange-filter to re-enable'}`,
          `- **S&P 500**: ${includeSP500 ? `included (${spxSet.size} constituents)` : 'excluded (use --no-sp500 to disable)'}`,
          `- **Intraday data**: FMP 1-min bars (rolling 3-day window)`,
          `- **Session entropy**: computed across all bars within each trading session`,
        ].join('\n'),
      },
      {
        heading: 'Earnings Calendar Compressions',
        content: earningsCompressed.length > 0
          ? buildTable(cols, buildRows(earningsCompressed))
          : '_No compressed setups in upcoming earnings names._',
      },
      {
        heading: 'Watchlist Compressions',
        content: watchlistCompressed.length > 0
          ? buildTable(cols, buildRows(watchlistCompressed))
          : '_No compressed setups in thesis watchlists._',
      },
      {
        heading: 'All Results',
        content: results.length > 0
          ? buildTable(cols, buildRows(results.sort((a, b) => (a.latestScore ?? 1) - (b.latestScore ?? 1))))
          : '_No results._',
      },
      {
        heading: 'How to Read',
        content: [
          '- **Sustained YES** = last 2+ complete sessions both <= threshold — highest priority',
          '- **Bucket: compressed** = score <= 0.25 — extreme order, rare',
          '- **Earnings date** = report date; compression before earnings = magnitude setup',
          '- Entropy is a **magnitude signal only** — combine with thesis/catalyst for direction',
          '- See [[04_Reference/Entropy Strategy Monitoring Cheat Sheet]] for validation protocol',
        ].join('\n'),
      },
    ],
  });

  const outPath = join(getPullsDir(), 'Market', dateStampedFilename('Entropy_Compression_Scan'));
  writeNote(outPath, note);
  console.log(`Wrote: ${outPath}`);
}
