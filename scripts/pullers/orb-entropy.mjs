import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { fetchIntradayPrices } from '../lib/fmp-client.mjs';
import { computeTransitionEntropyFromBars, classifyBucket } from '../agents/marketmind/entropy.mjs';
import { buildNote, buildTable, writeNote, today, dateStampedFilename } from '../lib/markdown.mjs';
import { getApiKey, getBaseUrl, getPullsDir } from '../lib/config.mjs';
import { getJson, mapConcurrent } from '../lib/fetcher.mjs';
import { normalizeIntradayBars, computeATR, computeGap, computeORBVWAP } from '../lib/bars.mjs';

const ENTROPY_NEAR_THRESHOLD = 0.60;
const ENTROPY_LOW_THRESHOLD  = 0.50;
const STOP_ATR_MULT          = 0.10;
const DEFAULT_CAPITAL        = 25_000;
const MAX_LEVERAGE           = 4;
const INTRADAY_LOOKBACK      = 120;
const CAPITAL_TIERS          = [1_000, 5_000, 25_000];
const OR_ATR_RATIO_MAX       = 0.50;  // OR range ≤ 50% ATR14 = tight coil
const GAP_MIN_PCT            = 0.10;  // minimum gap size to count as directional
const VOL_TARGET             = 0.15;  // 15% annualized target — shrink in high-vol, grow in low-vol
const VOL_SCALAR_MIN         = 0.50;  // floor: never go below half size
const VOL_SCALAR_MAX         = 1.50;  // ceiling: cap expansion so we don't over-lever on calm days
const RISK_SCALE_MAX         = 2.00;  // safety ceiling on --risk-scale flag

// Risk per trade by setup quality tier (fraction of capital)
const RISK_TIERS = {
  'prime-star': 0.03,   // Prime + sustained compression ★ → 3%
  'prime':      0.02,   // All 3 quality filters pass    → 2%
  'confirmed':  0.015,  // Entropy confirmed only        → 1.5%
  'active':     0.01,   // Baseline — floor, never lower → 1%
};

// ── helpers ──────────────────────────────────────────────────────────────────

function stableUrl(baseUrl) {
  return baseUrl.replace(/\/api\/v\d+$/, '/stable');
}

function parseSymbols(input) {
  return String(input ?? '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
}

function findLatestCompressionScan() {
  try {
    const dir = join(getPullsDir(), 'Market');
    const files = readdirSync(dir)
      .filter(f => f.includes('Entropy_Compression_Scan') && f.endsWith('.md'))
      .sort()
      .reverse();
    return files.length > 0 ? join(dir, files[0]) : null;
  } catch { return null; }
}

function parseSustainedSymbols(filePath) {
  try {
    const lines = readFileSync(filePath, 'utf8').split('\n');
    const sustained = new Set();
    for (const line of lines) {
      if (!line.startsWith('| [[')) continue;
      const cols = line.split('|').map(c => c.trim()).filter(Boolean);
      const symMatch = cols[0]?.match(/\[\[([\w-]+)\]\]/);
      if (symMatch && cols[4] === 'YES') sustained.add(symMatch[1]);
    }
    return sustained;
  } catch { return new Set(); }
}

function findLatestRelVolScreen() {
  try {
    const dir = join(getPullsDir(), 'Market');
    const files = readdirSync(dir)
      .filter(f => f.includes('FMP_RelVol_Screen') && f.endsWith('.md'))
      .sort()
      .reverse();
    return files.length > 0 ? join(dir, files[0]) : null;
  } catch { return null; }
}

function parseRelVolScreenFile(filePath) {
  const lines = readFileSync(filePath, 'utf8').split('\n');
  const dataRows = lines.filter(l => l.startsWith('|') && !l.match(/^\|[\s\-|]+\|$/));
  return dataRows.slice(1).map(row => {  // skip header
    const cols = row.split('|').map(c => c.trim()).filter(Boolean);
    const tickerM = cols[1]?.match(/\[\[(\w+)\]\]/);
    const relVolM = cols[7]?.match(/([\d.]+)%/);
    const atr14M  = cols[8]?.match(/\$?([\d.]+)/);
    if (!tickerM) return null;
    return {
      symbol: tickerM[1],
      relVol: relVolM ? parseFloat(relVolM[1]) / 100 : null,
      atr14:  atr14M  ? parseFloat(atr14M[1])        : null,
    };
  }).filter(Boolean);
}

function buildORBCandle(bars) {
  const today = (bars[0]?.date ?? '').split(' ')[0];  // YYYY-MM-DD of most recent bar
  const orb = bars.filter(b => {
    if (!b.date.startsWith(today)) return false;
    const tp = b.date.split(' ')[1] ?? '';
    const [h, m] = tp.split(':').map(Number);
    return h === 9 && m >= 30 && m <= 34;
  });
  if (orb.length === 0) return null;
  return {
    orOpen:   orb.at(-1).open,          // oldest bar = 9:30
    orClose:  orb[0].close,             // newest bar = 9:34
    orHigh:   Math.max(...orb.map(b => b.high)),
    orLow:    Math.min(...orb.map(b => b.low)),
    orVolume: orb.reduce((s, b) => s + (b.volume ?? 0), 0),
  };
}

// Fetch SPY's 20-day realized vol and return a portfolio-level sizing scalar.
// scalar > 1 = low-vol regime (size up), scalar < 1 = high-vol regime (size down).
async function fetchMarketVolScalar(stable, apiKey) {
  try {
    const raw    = await getJson(`${stable}/historical-price-eod/full?symbol=SPY&timeseries=22&apikey=${apiKey}`);
    const series = (Array.isArray(raw?.historical) ? raw.historical : Array.isArray(raw) ? raw : [])
      .slice(0, 21).reverse(); // oldest-first, 21 bars = 20 returns
    if (series.length < 21) return { scalar: 1.0, realizedVol: null };
    const returns = [];
    for (let i = 1; i < series.length; i++)
      returns.push(Math.log(series[i].close / series[i - 1].close));
    const mean     = returns.reduce((s, r) => s + r, 0) / returns.length;
    const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length;
    const realizedVol = Math.sqrt(variance * 252);
    const scalar      = Math.max(VOL_SCALAR_MIN, Math.min(VOL_SCALAR_MAX, VOL_TARGET / realizedVol));
    return { scalar, realizedVol };
  } catch { return { scalar: 1.0, realizedVol: null }; }
}

function setupTier(status, gapAligned, vwapConfirmed, tightRange, sustained) {
  const prime = gapAligned === true && vwapConfirmed === true && tightRange === true;
  if (prime && sustained) return 'prime-star';
  if (prime)              return 'prime';
  if (status === 'confirmed') return 'confirmed';
  return 'active';
}

function positionSize(capital, entry, stop, volScalar = 1.0, riskPct = 0.01) {
  const r = Math.abs(entry - stop);
  if (r === 0) return { shares: 0, riskDollars: 0, rPerShare: 0 };
  const byRisk     = Math.floor((capital * riskPct * volScalar) / r);
  const byLeverage = Math.floor((capital * MAX_LEVERAGE) / entry);
  const shares     = Math.min(byRisk, byLeverage);
  return { shares, riskDollars: shares * r, rPerShare: r };
}

// ── Black-Scholes helpers for theoretical 0DTE debit spread pricing ───────

// Abramowitz & Stegun approximation, error < 7.5e-8
function normCDF(x) {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.2316419 * ax);
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const pdf = Math.exp(-ax * ax / 2) / Math.sqrt(2 * Math.PI);
  return 0.5 + sign * (0.5 - pdf * poly);
}

function bsmPrice(S, K, T, r, sigma, isCall) {
  if (T <= 0) return Math.max(0, isCall ? S - K : K - S);
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  return isCall
    ? S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2)
    : K * Math.exp(-r * T) * normCDF(-d2) - S * normCDF(-d1);
}

function strikeIncrement(price) {
  if (price < 100) return 1;
  if (price < 300) return 2.5;
  return 5;
}

function nearestStrike(price) {
  const inc = strikeIncrement(price);
  return Math.round(price / inc) * inc;
}

// ── Options expiry date helpers ───────────────────────────────────────────

function nextFriday(from = new Date()) {
  const d = new Date(from);
  const daysToFri = (5 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + daysToFri);
  return d;
}

function nextMonthlyExpiry(from = new Date()) {
  const thirdFri = (yr, mo) => {
    const d = new Date(yr, mo, 1);
    let n = 0;
    while (n < 3) { if (d.getDay() === 5) n++; if (n < 3) d.setDate(d.getDate() + 1); }
    return d;
  };
  const [y, m] = [from.getFullYear(), from.getMonth()];
  let exp = thirdFri(y, m);
  if (exp <= from) exp = thirdFri(m === 11 ? y + 1 : y, (m + 1) % 12);
  return exp;
}

// Prices long calls/puts (Level 2 compatible — no short leg).
// Returns theoretical premiums for this Friday (weekly) and the next standard
// monthly expiry (3rd Friday), each sized to match the equity risk budget.
// ATR-derived IV leans slightly high (ATR includes overnight gaps) — upper-bound estimate.
function computeOptionsLayer(r) {
  const { entry, atr14, direction, riskDollars } = r;
  if (entry == null || !atr14) return null;
  const isCall  = direction === 'LONG';
  const sigma   = Math.min(2.0, (atr14 / entry) * Math.sqrt(252));
  const strike  = nearestStrike(entry);
  const now     = new Date();
  const MS_YEAR = 365.25 * 24 * 60 * 60 * 1000;
  const weekly  = nextFriday(now);
  const monthly = nextMonthlyExpiry(now);
  const T_w     = Math.max(0.001, (weekly.getTime()  - now.getTime()) / MS_YEAR);
  const T_m     = Math.max(0.001, (monthly.getTime() - now.getTime()) / MS_YEAR);
  const wPrem   = bsmPrice(entry, strike, T_w, 0.05, sigma, isCall);
  const mPrem   = bsmPrice(entry, strike, T_m, 0.05, sigma, isCall);
  if (wPrem <= 0 || mPrem <= 0) return null;
  const wQty    = Math.max(1, Math.floor((riskDollars || 0) / (wPrem * 100)));
  const mQty    = Math.max(1, Math.floor((riskDollars || 0) / (mPrem * 100)));
  const wBE     = isCall ? strike + wPrem : strike - wPrem;
  const mBE     = isCall ? strike + mPrem : strike - mPrem;
  const lbl     = d => `${d.getMonth() + 1}/${d.getDate()}`;
  return {
    isCall, strike,
    wLabel: lbl(weekly),  wPrem, wQty, wCost: wQty * wPrem * 100,
    wBEPct: ((wBE - entry) / entry) * 100,
    mLabel: lbl(monthly), mPrem, mQty, mCost: mQty * mPrem * 100,
    mBEPct: ((mBE - entry) / entry) * 100,
    iv: sigma,
  };
}

// ── main ─────────────────────────────────────────────────────────────────────

export async function pull(flags = {}) {
  const apiKey    = getApiKey('fmp');
  const stable    = stableUrl(getBaseUrl('fmp'));
  const capital      = Number(flags.capital ?? DEFAULT_CAPITAL);
  const riskScale    = Math.min(RISK_SCALE_MAX, Math.max(0.1, Number(flags['risk-scale'] ?? 1.0)));
  const dailyLossCap = flags['daily-loss-cap'] ? Number(flags['daily-loss-cap']) : null;

  // Step 1 — symbol list + ATR14
  let candidates, sourceLabel;

  if (flags.symbols || flags.symbol) {
    const syms = parseSymbols(flags.symbols ?? flags.symbol);
    console.log(`ORB+Entropy: ${syms.length} symbol(s) from --symbols, fetching ATR14...`);
    candidates = await mapConcurrent(syms, 5, async (sym) => {
      try {
        const raw = await getJson(`${stable}/historical-price-eod/full?symbol=${sym}&timeseries=16&apikey=${apiKey}`);
        const series = Array.isArray(raw?.historical) ? raw.historical : Array.isArray(raw) ? raw : [];
        const atr14 = series.length >= 15 ? computeATR(series.slice(0, 15).reverse(), 14) : null;
        return { symbol: sym, atr14, relVol: null };
      } catch { return { symbol: sym, atr14: null, relVol: null }; }
    });
    sourceLabel = '--symbols';
  } else {
    const screenFile = findLatestRelVolScreen();
    if (!screenFile) {
      console.error('ORB+Entropy: No FMP_RelVol_Screen file found. Run: node run.mjs pull fmp --rel-vol-screen');
      return;
    }
    candidates  = parseRelVolScreenFile(screenFile);
    sourceLabel = screenFile.split(/[/\\]/).pop();
    console.log(`ORB+Entropy: ${candidates.length} symbol(s) from ${sourceLabel}`);
  }

  if (candidates.length === 0) { console.log('ORB+Entropy: No candidates.'); return; }

  // Fetch SPY realized vol for portfolio-level sizing scalar
  const { scalar: volScalar, realizedVol: spyVol } = await fetchMarketVolScalar(stable, apiKey);
  const volRegime = spyVol === null ? 'unknown'
    : spyVol < 0.10 ? 'very-low' : spyVol < 0.15 ? 'low' : spyVol < 0.25 ? 'normal' : spyVol < 0.35 ? 'elevated' : 'high';
  console.log(`ORB+Entropy: SPY 20d realized vol ${spyVol !== null ? (spyVol * 100).toFixed(1) + '%' : 'n/a'} (${volRegime}) → size scalar ${volScalar.toFixed(2)}×`);
  if (riskScale !== 1.0) console.log(`ORB+Entropy: risk-scale ${riskScale}× applied to all tiers`);
  if (dailyLossCap) console.log(`ORB+Entropy: daily loss cap $${dailyLossCap} — halt trading if session P&L hits this level`);

  // Load last night's sustained compression symbols for cross-reference
  const compressionFile   = findLatestCompressionScan();
  const sustainedSymbols  = compressionFile ? parseSustainedSymbols(compressionFile) : new Set();
  const compressionSource = compressionFile?.split(/[/\\]/).pop() ?? 'none';
  if (sustainedSymbols.size > 0)
    console.log(`ORB+Entropy: ${sustainedSymbols.size} sustained compression symbol(s) from ${compressionSource}`);

  // Step 2-4 — intraday fetch → ORB candle + entropy (concurrent)
  console.log(`ORB+Entropy: Fetching intraday data for ${candidates.length} symbol(s)...`);

  const processed = (await mapConcurrent(candidates, 5, async ({ symbol, atr14, relVol }) => {
    try {
      const bars = await fetchIntradayPrices(symbol, { interval: '1min' });
      if (!bars || bars.length === 0) return null;

      const orb     = buildORBCandle(bars);
      const entropy = computeTransitionEntropyFromBars(normalizeIntradayBars(bars).slice(-INTRADAY_LOOKBACK), { lookback: INTRADAY_LOOKBACK });
      const eScore  = entropy?.score ?? null;
      const eBucket = eScore !== null ? classifyBucket(eScore) : 'unknown';

      let direction = 'no-data', entry = null, stop = null;
      if (orb) {
        if      (orb.orClose > orb.orOpen) { direction = 'LONG';  entry = orb.orHigh; stop = entry - STOP_ATR_MULT * (atr14 ?? 1); }
        else if (orb.orClose < orb.orOpen) { direction = 'SHORT'; entry = orb.orLow;  stop = entry + STOP_ATR_MULT * (atr14 ?? 1); }
        else                               { direction = 'DOJI'; }
      }

      const status =
        direction === 'DOJI' || direction === 'no-data' ? 'no-signal'
        : (eBucket === 'compressed' || eBucket === 'low-entropy-watch' || eBucket === 'near-low-watch') ? 'confirmed'
        : 'active';

      // ── Three supplementary filters ─────────────────────────────────────────
      const todayDate  = (bars[0]?.date ?? '').split(' ')[0];
      const gapPct     = computeGap(bars, todayDate);
      const orbWindow  = bars.filter(b => {
        if (!b.date.startsWith(todayDate)) return false;
        const [h, m] = (b.date.split(' ')[1] ?? '').split(':').map(Number);
        return h === 9 && m >= 30 && m <= 34;
      });
      const vwap       = orb ? computeORBVWAP(orbWindow) : null;
      const orRange    = orb ? orb.orHigh - orb.orLow : null;
      const orAtrRatio = (orRange !== null && atr14) ? orRange / atr14 : null;

      // Gap aligned: gap direction matches ORB direction (ignore tiny gaps < GAP_MIN_PCT)
      const gapAligned = (gapPct !== null && Math.abs(gapPct) >= GAP_MIN_PCT &&
                          (direction === 'LONG' || direction === 'SHORT'))
        ? (direction === 'LONG' ? gapPct > 0 : gapPct < 0) : null;

      // VWAP confirmed: entry level is on the correct side of the ORB VWAP
      const vwapConfirmed = (vwap !== null && entry !== null &&
                             (direction === 'LONG' || direction === 'SHORT'))
        ? (direction === 'LONG' ? entry >= vwap : entry <= vwap) : null;

      // Tight range: OR range ≤ OR_ATR_RATIO_MAX × ATR14 (coil with room to run)
      const tightRange = orAtrRatio !== null ? orAtrRatio <= OR_ATR_RATIO_MAX : null;

      const sustainedCompressed = sustainedSymbols.has(symbol);

      // ── Tiered risk sizing (computed after all filters are known) ────────────
      const tier    = status === 'no-signal' ? 'none'
                    : setupTier(status, gapAligned, vwapConfirmed, tightRange, sustainedCompressed);
      const riskPct = tier === 'none' ? 0 : (RISK_TIERS[tier] ?? RISK_TIERS.active) * riskScale;

      const { shares, riskDollars, rPerShare } =
        (direction === 'LONG' || direction === 'SHORT') && atr14 && entry !== null
          ? positionSize(capital, entry, stop, volScalar, riskPct)
          : { shares: 0, riskDollars: 0, rPerShare: 0 };

      // 2R take-profit price: income layer exits 50% of position here
      const target2R = (entry !== null && rPerShare > 0)
        ? (direction === 'LONG' ? entry + 2 * rPerShare : entry - 2 * rPerShare)
        : null;

      return { symbol, direction, entry, stop, atr14, relVol, eScore, eBucket, status,
               tier, riskPct, shares, riskDollars, rPerShare, target2R, sustainedCompressed,
               gapPct, gapAligned, vwap, orAtrRatio, vwapConfirmed, tightRange };
    } catch { return null; }
  })).filter(Boolean);

  const confirmed         = processed.filter(r => r.status === 'confirmed');
  const compressionAndOrb = processed.filter(r => r.sustainedCompressed && r.status !== 'no-signal');
  const primeSetups       = processed.filter(r =>
    r.status !== 'no-signal' &&
    r.gapAligned    === true &&
    r.vwapConfirmed === true &&
    r.tightRange    === true);
  const signals           = processed.filter(r => r.status !== 'no-signal').map(r => `ORB_${r.direction}_${r.symbol}`);
  const optionsData       = primeSetups
    .map(r => ({ r, opt: computeOptionsLayer(r) }))
    .filter(({ opt }) => opt !== null);
  console.log(`  ${processed.length} processed | ${confirmed.length} confirmed | ${primeSetups.length} prime | ${compressionAndOrb.length} compression+ORB`);

  // Step 5 — write note
  const fmt    = (v, prefix = '', decimals = 2) => v != null ? `${prefix}${v.toFixed(decimals)}` : '—';
  const fmtGap = (r) => {
    if (r.gapPct == null) return '—';
    const pct = (r.gapPct >= 0 ? '+' : '') + r.gapPct.toFixed(2) + '%';
    if (r.gapAligned === null) return pct;
    return pct + (r.gapAligned ? ' ok' : ' no');
  };
  const fmtVwap  = (r) => {
    if (r.vwap == null) return '—';
    const val = '$' + r.vwap.toFixed(2);
    if (r.vwapConfirmed === null) return val;
    return val + (r.vwapConfirmed ? ' ok' : ' no');
  };
  const fmtRange = (r) => {
    if (r.orAtrRatio == null) return '—';
    const val = r.orAtrRatio.toFixed(2) + 'x';
    return val + (r.tightRange ? ' ok' : ' no');
  };

  const fmtRiskPct = (r) => r.riskPct > 0 ? `${(r.riskPct * 100).toFixed(1)}%` : '—';

  const tradeRows = processed.map((r, i) => [
    String(i + 1),
    `[[${r.symbol}]]`,
    r.direction,
    fmt(r.entry, '$'),
    fmt(r.stop,  '$'),
    fmt(r.rPerShare, '$'),
    r.target2R != null ? fmt(r.target2R, '$') : '—',
    r.shares > 0 ? String(r.shares) : '—',
    r.riskDollars > 0 ? `$${r.riskDollars.toFixed(0)}` : '—',
    fmtRiskPct(r),
    r.relVol != null ? `${(r.relVol * 100).toFixed(0)}%` : '—',
    fmt(r.atr14, '$'),
    fmt(r.eScore, '', 3),
    r.eBucket,
    r.tier !== 'none' ? r.tier : '—',
    fmtGap(r),
    fmtVwap(r),
    fmtRange(r),
    r.sustainedCompressed ? '★' : '',
  ]);

  const shortRow = (r, i) => [
    String(i + 1),
    `[[${r.symbol}]]`,
    r.direction,
    fmt(r.entry, '$'),
    fmt(r.stop,  '$'),
    r.target2R != null ? fmt(r.target2R, '$') : '—',
    r.shares > 0 ? String(r.shares) : '—',
    r.riskDollars > 0 ? `$${r.riskDollars.toFixed(0)}` : '—',
    fmtRiskPct(r),
    fmt(r.eScore, '', 3),
    r.eBucket,
    fmtGap(r),
    fmtVwap(r),
    fmtRange(r),
    r.sustainedCompressed ? '★' : '',
  ];

  const primeRows         = primeSetups.map(shortRow);
  const confirmedRows     = confirmed.map(shortRow);
  const compressionOrbRows = compressionAndOrb.map((r, i) => [
    String(i + 1),
    `[[${r.symbol}]]`,
    r.direction,
    fmt(r.entry, '$'),
    fmt(r.stop,  '$'),
    r.shares > 0 ? String(r.shares) : '—',
    r.riskDollars > 0 ? `$${r.riskDollars.toFixed(0)}` : '—',
    fmt(r.eScore, '', 3),
    r.eBucket,
    r.status,
  ]);

  const note = buildNote({
    frontmatter: {
      title: 'ORB + Entropy Screen',
      source: 'FMP + Entropy Monitor',
      date_pulled: today(),
      domain: 'market',
      data_type: 'screen',
      frequency: 'intraday',
      signal_status: confirmed.length > 0 ? 'watch' : 'clear',
      signals,
      capital,
      risk_scale:     riskScale !== 1.0 ? riskScale : undefined,
      daily_loss_cap: dailyLossCap ?? undefined,
      vol_scalar:   Math.round(volScalar * 100) / 100,
      vol_regime:   volRegime,
      spy_realized_vol: spyVol !== null ? Math.round(spyVol * 1000) / 10 : null,
      tags: ['equities', 'orb', 'entropy', 'momentum', 'intraday', 'fmp'],
    },
    sections: [
      {
        heading: 'Screen Parameters',
        content: [
          `- **Source**: ${sourceLabel}`,
          `- **Capital**: $${capital.toLocaleString()}`,
          '- **ORB window**: 9:30–9:35 AM ET (first 5-min candle)',
          `- **Stop distance**: ${STOP_ATR_MULT * 100}% × ATR14 from entry`,
          `- **Risk per trade**: tiered by setup quality — Prime+★ 3% / Prime 2% / Confirmed 1.5% / Active 1%${riskScale !== 1.0 ? ` (global scale: ${riskScale}×)` : ''}, max 4× leverage`,
          ...(dailyLossCap ? [`- **Daily loss cap**: $${dailyLossCap.toLocaleString()} — halt all trading once session realized losses reach this level`] : []),
          `- **Entropy confirmed**: score ≤ ${ENTROPY_NEAR_THRESHOLD} (near-low-watch or lower)`,
          `- **Gap filter**: opening gap must align with ORB direction (≥ ${GAP_MIN_PCT}%) — gap up + LONG, gap down + SHORT`,
          `- **VWAP filter**: entry level (OR high/low) must be on the correct side of the ORB VWAP`,
          `- **Range filter**: OR range ≤ ${OR_ATR_RATIO_MAX * 100}% × ATR14 — tight coil leaves more room to expand`,
          '- **Prime setup**: all three filters pass (gap + VWAP + range) — highest conviction',
          `- **Vol targeting**: SPY 20d realized vol ${spyVol !== null ? (spyVol * 100).toFixed(1) + '%' : 'n/a'} (${volRegime}) → size scalar **${volScalar.toFixed(2)}×** (target ${VOL_TARGET * 100}%, range ${VOL_SCALAR_MIN}×–${VOL_SCALAR_MAX}×)`,
          '- **Exit**: hold all open positions to 4:00 PM ET, exit at market — no profit target, no trailing stop, no scaling',
          '- **Re-entry**: one attempt per symbol per session — no re-entry after stop-out',
          '- **No direction flip**: if opposing range level breaks first, skip the trade entirely',
        ].join('\n'),
      },
      {
        heading: 'Exit Rules',
        content: [
          '| Rule | Detail |',
          '| --- | --- |',
          '| Income layer (50%) | Exit at 2R — see 2R Target column; locks baseline cash each session |',
          '| Edge layer (50%) | Hold to 4:00 PM ET market-on-close — captures trend-day runners |',
          '| Stop-loss | Triggered automatically at stop price (set on fill, never moved) |',
          '| Trailing stop | Not used |',
          '| Re-entry | Not permitted — one attempt per symbol per day |',
          '| Direction flip | Not permitted — if opposing level breaks first, skip entirely |',
          '',
          'See [[04_Reference/ORB + Entropy Strategy Playbook]] for full rules.',
        ].join('\n'),
      },
      {
        heading: 'Prime Setups',
        content: primeRows.length > 0
          ? [
              '_All three quality filters pass: gap aligned + VWAP confirmed + tight OR range. Take these first._',
              '',
              buildTable(
                ['#', 'Ticker', 'Direction', 'Entry', 'Stop', '2R Target', 'Shares', 'Risk$', 'Risk%', 'Entropy', 'Bucket', 'Gap', 'VWAP', 'OR/ATR', '★'],
                primeRows
              ),
            ].join('\n')
          : '_No setups passed all three quality filters (gap + VWAP + range) this session._',
      },
      {
        heading: 'Options Layer',
        content: (() => {
          if (optionsData.length === 0)
            return '_No prime setups available for options layer._';
          const wLabel = optionsData[0]?.opt?.wLabel ?? 'Weekly';
          const mLabel = optionsData[0]?.opt?.mLabel ?? 'Monthly';
          const headers = [
            '#', 'Ticker', 'Type', 'Strike',
            `${wLabel} Debit`, `${wLabel} Qty`, `${wLabel} Cost`,
            `${mLabel} Debit`, `${mLabel} Qty`, `${mLabel} Cost`,
            `${wLabel} B/E%`, `${mLabel} B/E%`, 'Est. IV',
          ];
          const rows = optionsData.map(({ r, opt }, i) => {
            const sign = s => `${s >= 0 ? '+' : ''}${s.toFixed(2)}%`;
            return [
              String(i + 1),
              `[[${r.symbol}]]`,
              opt.isCall ? 'Long Call' : 'Long Put',
              `$${opt.strike.toFixed(2)}`,
              `$${opt.wPrem.toFixed(2)}`, String(opt.wQty), `$${opt.wCost.toFixed(0)}`,
              `$${opt.mPrem.toFixed(2)}`, String(opt.mQty), `$${opt.mCost.toFixed(0)}`,
              sign(opt.wBEPct), sign(opt.mBEPct),
              `${(opt.iv * 100).toFixed(0)}%`,
            ];
          });
          return [
            `_Long calls/puts — Level 2 compatible, no short leg. Prime setups only. Priced for ${wLabel} (weekly) and ${mLabel} (monthly) expiry._`,
            `_Recommendation: use ${wLabel} weekly for intraday holds — higher delta, less wasted time value. Switch to ${mLabel} monthly only if weekly OI < 500 on the strike._`,
            `_Theoretical BSM via ATR-derived IV (leans high — verify actual bid/ask). Contracts sized to match equity risk budget. Each contract = 100 shares._`,
            '',
            buildTable(headers, rows),
          ].join('\n');
        })(),
      },
      {
        heading: 'Compression + ORB Setups',
        content: compressionOrbRows.length > 0
          ? [
              `_Symbols with sustained multi-session compression (from ${compressionSource}) that also have an ORB setup today. Highest-priority setups._`,
              '',
              buildTable(
                ['#', 'Ticker', 'Direction', 'Entry', 'Stop', 'Shares', 'Risk$', 'Entropy', 'Bucket', 'Status'],
                compressionOrbRows
              ),
            ].join('\n')
          : `_No overlap between today\'s ORB setups and sustained compression symbols (${compressionSource})._`,
      },
      {
        heading: 'Trade Sheet',
        content: tradeRows.length > 0
          ? buildTable(
              ['#', 'Ticker', 'Direction', 'Entry', 'Stop', 'R/share', '2R Target', 'Shares', 'Risk$', 'Risk%', 'RelVol', 'ATR14', 'Entropy', 'Bucket', 'Tier', 'Gap', 'VWAP', 'OR/ATR', '★'],
              tradeRows
            )
          : '_No intraday data available._',
      },
      {
        heading: 'Entropy-Confirmed Setups',
        content: confirmedRows.length > 0
          ? buildTable(
              ['#', 'Ticker', 'Direction', 'Entry', 'Stop', '2R Target', 'Shares', 'Risk$', 'Risk%', 'Entropy', 'Bucket', 'Gap', 'VWAP', 'OR/ATR', '★'],
              confirmedRows
            )
          : '_No entropy-confirmed setups this session._',
      },
      {
        heading: 'Position Sizing by Account Size',
        content: (() => {
          const directional = processed.filter(r => r.direction === 'LONG' || r.direction === 'SHORT');
          if (directional.length === 0) return '_No directional setups._';
          const headers = ['Ticker', 'Dir', 'Entry', 'R/share',
            '$1K Shares', '$1K Risk', '$5K Shares', '$5K Risk', '$25K Shares', '$25K Risk'];
          const rows = directional.map(r =>
            [
              `[[${r.symbol}]]`,
              r.direction,
              fmt(r.entry, '$'),
              fmt(r.rPerShare, '$'),
              ...CAPITAL_TIERS.flatMap(cap => {
                const { shares, riskDollars } = positionSize(cap, r.entry, r.stop, volScalar, r.riskPct);
                return [shares > 0 ? String(shares) : '—', riskDollars > 0 ? `$${riskDollars.toFixed(0)}` : '—'];
              }),
            ]
          );
          return buildTable(headers, rows);
        })(),
      },
      {
        heading: 'Source',
        content: `- **Intraday**: FMP 1-min bars via \`fetchIntradayPrices\`\n- **Entropy**: \`computeTransitionEntropyFromBars\` (${INTRADAY_LOOKBACK}-bar window)\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const outPath = join(getPullsDir(), 'Market', dateStampedFilename('ORB_Entropy_Screen'));
  writeNote(outPath, note);
  console.log(`📝 Wrote: ${outPath}`);
}
