import { fetchDailyPrices } from '../../lib/fmp-client.mjs';
import { classifyDirectionalScore, confidenceFromScore, makeAgentSignal } from './schemas.mjs';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const _require = createRequire(import.meta.url);
const WATCHLISTS = _require(resolve(__dirname, '../../config/watchlists.json'));
const CONFIG     = _require(resolve(__dirname, '../../config/strategy_thresholds.json'));

export async function runPairAgent(state) {
  if (state.asset_type === 'crypto') {
    return makeAgentSignal({ agent: 'pair', signal: 'NEUTRAL', confidence: 0.05, summary: 'Pair analysis not applicable to crypto.', raw_data: {} });
  }

  const symbol = String(state.symbol || '').toUpperCase();

  // Find pairs that contain this symbol
  const relevantPairs = WATCHLISTS.pairs.filter(p =>
    p.a === symbol || p.b === symbol
  );

  if (!relevantPairs.length) {
    return makeAgentSignal({
      agent: 'pair',
      signal: 'NEUTRAL',
      confidence: 0.05,
      summary: `${symbol} is not in any configured pair watchlist.`,
      raw_data: { symbol, pairs_checked: WATCHLISTS.pairs.length },
    });
  }

  const fromDate = daysAgo(CONFIG.pairs.lookback_calendar_days);

  // Fetch all unique symbols needed
  const uniqueSymbols = [...new Set(relevantPairs.flatMap(p => [p.a, p.b]))];
  const priceMap = new Map();
  const fetchResults = await Promise.allSettled(
    uniqueSymbols.map(sym => fetchDailyPrices(sym, { from: fromDate }).then(bars => ({ sym, bars })))
  );
  for (const r of fetchResults) {
    if (r.status === 'fulfilled') priceMap.set(r.value.sym, r.value.bars);
  }

  const warnings = [];
  const pairResults = [];

  for (const pairDef of relevantPairs) {
    const barsA = priceMap.get(pairDef.a);
    const barsB = priceMap.get(pairDef.b);

    if (!barsA?.length || !barsB?.length) {
      warnings.push(`Skipping ${pairDef.id}: price data missing.`);
      continue;
    }

    const result = computePairMetrics(pairDef, barsA, barsB, CONFIG.pairs);
    if (result) pairResults.push(result);
  }

  if (!pairResults.length) {
    return makeAgentSignal({
      agent: 'pair',
      signal: 'NEUTRAL',
      confidence: 0.1,
      summary: `No pair metrics computed for ${symbol}.`,
      warnings,
      raw_data: { symbol },
    });
  }

  // Summarize across all pairs for this symbol
  // Score from perspective of state.symbol: positive = symbol is relatively strong
  let score = 0;
  let scoreCount = 0;
  const stretchedPairs = pairResults.filter(r => r.status === 'stretched');
  const brokenPairs    = pairResults.filter(r => r.status === 'broken');

  for (const pair of pairResults) {
    if (!Number.isFinite(pair.z_60)) continue;
    // Positive z means A is expensive relative to B
    const direction = pair.pair_id.startsWith(symbol) || pair.symbol_a === symbol ? 1 : -1;
    const directedZ = pair.z_60 * direction;
    score += directedZ > 2 ? 0.5 : directedZ < -2 ? -0.5 : 0;
    scoreCount++;
  }
  if (scoreCount > 0) score /= scoreCount;

  if (brokenPairs.length > 0) warnings.push(`${brokenPairs.length} pair(s) show broken correlation.`);

  const signal     = classifyDirectionalScore(score, 0.3);
  const confidence = stretchedPairs.length > 0 ? confidenceFromScore(score, { base: 0.2, scale: 0.15, max: 0.65 }) : 0.1;

  const mostStretched = [...pairResults].sort((a, b) => Math.abs(b.z_60 ?? 0) - Math.abs(a.z_60 ?? 0))[0];

  return makeAgentSignal({
    agent: 'pair',
    signal,
    confidence,
    summary: buildSummary(symbol, pairResults, mostStretched),
    evidence: pairResults.map(r =>
      `${r.pair_id}: z_60=${fmt(r.z_60)} corr_120=${fmt(r.corr_120)} [${r.status}]`
    ),
    warnings,
    raw_data: {
      symbol,
      pairs_analyzed: pairResults.length,
      pairs_stretched: stretchedPairs.length,
      pairs_broken: brokenPairs.length,
      most_stretched_pair: mostStretched?.pair_id ?? null,
      most_stretched_z60:  mostStretched?.z_60   ?? null,
      pair_details: pairResults,
    },
  });
}

function computePairMetrics(pairDef, barsA, barsB, cfg) {
  // Align by date
  const mapA = new Map(barsA.map(b => [String(b.date).slice(0, 10), Number(b.close ?? b.price)]));
  const mapB = new Map(barsB.map(b => [String(b.date).slice(0, 10), Number(b.close ?? b.price)]));
  const dates = [...mapA.keys()].filter(d => mapB.has(d)).sort();

  if (dates.length < 30) return null;

  const closesA = dates.map(d => mapA.get(d));
  const closesB = dates.map(d => mapB.get(d));
  const ratios  = closesA.map((a, i) => a / closesB[i]);

  const n = ratios.length;
  const lastRatio = ratios[n - 1];

  const z_20  = latestZScore(ratios, Math.min(20,  n));
  const z_60  = latestZScore(ratios, Math.min(60,  n));
  const z_120 = latestZScore(ratios, Math.min(120, n));

  const corr_60  = rollingPearsonLast(closesA, closesB, Math.min(60,  n));
  const corr_120 = rollingPearsonLast(closesA, closesB, Math.min(120, n));

  const beta_120 = computeBeta(closesA, closesB, Math.min(120, n));
  const half_life = computeHalfLife(ratios);

  const status = classifyStatus(z_60, corr_120, half_life, cfg);

  return {
    pair_id:   pairDef.id,
    symbol_a:  pairDef.a,
    symbol_b:  pairDef.b,
    ratio:     round2(lastRatio),
    z_20:      round2(z_20),
    z_60:      round2(z_60),
    z_120:     round2(z_120),
    corr_60:   round2(corr_60),
    corr_120:  round2(corr_120),
    beta_120:  round2(beta_120),
    half_life: half_life,
    status,
    bar_count: n,
  };
}

function latestZScore(values, window) {
  if (values.length < window) return null;
  const slice = values.slice(-window);
  const mean = slice.reduce((s, v) => s + v, 0) / window;
  const variance = slice.reduce((s, v) => s + (v - mean) ** 2, 0) / (window - 1);
  const std = Math.sqrt(variance);
  if (std === 0) return 0;
  return (values[values.length - 1] - mean) / std;
}

function rollingPearsonLast(xs, ys, window) {
  if (xs.length < window) return null;
  const xSlice = xs.slice(-window);
  const ySlice = ys.slice(-window);
  return pearsonCorr(xSlice, ySlice);
}

function pearsonCorr(xs, ys) {
  const n = xs.length;
  if (n < 3) return null;
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    dx  += (xs[i] - mx) ** 2;
    dy  += (ys[i] - my) ** 2;
  }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? null : round3(num / den);
}

function computeBeta(xs, ys, window) {
  if (xs.length < window) return null;
  const xSlice = xs.slice(-window);
  const ySlice = ys.slice(-window);
  const n = xSlice.length;
  const mx = xSlice.reduce((s, v) => s + v, 0) / n;
  const my = ySlice.reduce((s, v) => s + v, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (ySlice[i] - my) * (xSlice[i] - mx);
    den += (xSlice[i] - mx) ** 2;
  }
  return den === 0 ? null : round3(num / den);
}

/**
 * Ornstein-Uhlenbeck half-life via AR(1) regression on ratio first differences.
 * Returns days or null if series is not mean-reverting.
 */
function computeHalfLife(ratios) {
  if (ratios.length < 20) return null;
  const diffs  = ratios.slice(1).map((v, i) => v - ratios[i]);
  const lagged = ratios.slice(0, -1);
  const n = diffs.length;
  const mx = lagged.reduce((s, v) => s + v, 0) / n;
  const my = diffs.reduce((s, v)  => s + v, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (lagged[i] - mx) * (diffs[i] - my);
    den += (lagged[i] - mx) ** 2;
  }
  if (den === 0) return null;
  const beta = num / den;
  if (beta >= 0) return null;
  const hl = Math.log(2) / (-beta);
  return hl > 0 && hl < 365 ? Number(hl.toFixed(1)) : null;
}

function classifyStatus(z60, corr120, halfLife, cfg) {
  if (!Number.isFinite(z60) || !Number.isFinite(corr120)) return 'unknown';
  if (corr120 < cfg.broken_correlation) return 'broken';
  if (Math.abs(z60) >= cfg.z_stretch_threshold && corr120 >= cfg.min_correlation_stable) return 'stretched';
  if (!Number.isFinite(halfLife) || halfLife > cfg.max_half_life_days || halfLife < cfg.min_half_life_days) return 'trending';
  return 'stable';
}

function buildSummary(symbol, results, most) {
  if (!most) return `No actionable pair signal for ${symbol}.`;
  return `${symbol} pair scan: ${results.length} pairs. Most stretched: ${most.pair_id} z_60=${fmt(most.z_60)} [${most.status}] corr_120=${fmt(most.corr_120)}.`;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - Number(n || 0));
  return d.toISOString().slice(0, 10);
}

function fmt(v) { return Number.isFinite(v) ? v.toFixed(2) : 'N/A'; }
function round2(v) { return Number.isFinite(v) ? Number(v.toFixed(2)) : null; }
function round3(v) { return Number.isFinite(v) ? Number(v.toFixed(3)) : null; }
