/**
 * Shared auction-market computation utilities.
 * Used by auction-agent.mjs (intraday VP/TPO) and pead-agent.mjs (earnings AVWAP).
 * All price inputs are expected as plain numbers; date strings as YYYY-MM-DD.
 */

/**
 * Approximate Volume Profile from OHLCV bars.
 * Distributes each bar's volume uniformly across price bins it touches.
 * Returns { poc, vah, val, bin_size, total_volume } or null if insufficient data.
 * @param {Array<{low:number,high:number,volume:number}>} bars
 * @param {number} binSizePct - bin size as fraction of mid-price (default 0.2%)
 * @param {number} valueAreaPct - fraction of volume that defines value area (default 70%)
 */
export function approximateVolumeProfile(bars, binSizePct = 0.002, valueAreaPct = 0.70) {
  if (!bars.length) return null;

  const lows  = bars.map(b => Number(b.low)).filter(Number.isFinite);
  const highs = bars.map(b => Number(b.high)).filter(Number.isFinite);
  if (!lows.length || !highs.length) return null;

  const minPrice = Math.min(...lows);
  const maxPrice = Math.max(...highs);
  if (minPrice >= maxPrice) return null;

  const binSize = ((minPrice + maxPrice) / 2) * binSizePct;
  if (binSize <= 0) return null;

  const numBins = Math.ceil((maxPrice - minPrice) / binSize) + 1;
  const bins = Array.from({ length: numBins }, (_, i) => minPrice + i * binSize);
  const volByBin = new Map(bins.map(b => [b, 0]));

  for (const bar of bars) {
    const low = Number(bar.low), high = Number(bar.high), vol = Number(bar.volume);
    if (!Number.isFinite(low) || !Number.isFinite(high) || !Number.isFinite(vol) || vol <= 0) continue;
    const touched = bins.filter(b => low <= b && b <= high);
    if (!touched.length) continue;
    const share = vol / touched.length;
    for (const b of touched) volByBin.set(b, volByBin.get(b) + share);
  }

  // POC = highest-volume bin
  let maxVol = 0, poc = null;
  for (const [price, vol] of volByBin) {
    if (vol > maxVol) { maxVol = vol; poc = price; }
  }
  if (poc === null) return null;

  // Value area: expand from POC outward until valueAreaPct of volume captured
  const totalVol = [...volByBin.values()].reduce((s, v) => s + v, 0);
  const target = totalVol * valueAreaPct;
  const sortedDesc = [...volByBin.entries()].sort((a, b) => b[1] - a[1]);
  let accumulated = 0;
  const vaBins = [];
  for (const [price] of sortedDesc) {
    accumulated += volByBin.get(price);
    vaBins.push(price);
    if (accumulated >= target) break;
  }
  vaBins.sort((a, b) => a - b);

  return {
    poc:          round4(poc),
    vah:          round4(vaBins[vaBins.length - 1]),
    val:          round4(vaBins[0]),
    bin_size:     round4(binSize),
    total_volume: Math.round(totalVol),
  };
}

/**
 * Approximate TPO (Time Price Opportunity) profile from OHLCV bars.
 * Counts how many bars touch each price bin.
 * Returns { tpo_poc } or null.
 */
export function approximateTPOProfile(bars, binSizePct = 0.002) {
  if (!bars.length) return null;

  const lows  = bars.map(b => Number(b.low)).filter(Number.isFinite);
  const highs = bars.map(b => Number(b.high)).filter(Number.isFinite);
  if (!lows.length || !highs.length) return null;

  const minPrice = Math.min(...lows);
  const maxPrice = Math.max(...highs);
  if (minPrice >= maxPrice) return null;

  const binSize = ((minPrice + maxPrice) / 2) * binSizePct;
  if (binSize <= 0) return null;

  const numBins = Math.ceil((maxPrice - minPrice) / binSize) + 1;
  const bins = Array.from({ length: numBins }, (_, i) => minPrice + i * binSize);
  const tpoCounts = new Map(bins.map(b => [b, 0]));

  for (const bar of bars) {
    const low = Number(bar.low), high = Number(bar.high);
    if (!Number.isFinite(low) || !Number.isFinite(high)) continue;
    for (const b of bins) {
      if (low <= b && b <= high) tpoCounts.set(b, tpoCounts.get(b) + 1);
    }
  }

  let maxCount = 0, tpoPoc = null;
  for (const [price, count] of tpoCounts) {
    if (count > maxCount) { maxCount = count; tpoPoc = price; }
  }

  return { tpo_poc: tpoPoc !== null ? round4(tpoPoc) : null };
}

/**
 * Compute anchored VWAP from daily OHLCV bars starting at anchorDate.
 * Bars can be in any order (newest-first from FMP is fine).
 * @param {Array<{date:string,high:number,low:number,close:number,volume:number}>} bars
 * @param {string} anchorDate - YYYY-MM-DD inclusive start date
 */
export function computeAnchoredVWAP(bars, anchorDate) {
  const anchored = bars.filter(b => String(b.date || '').slice(0, 10) >= anchorDate);
  if (!anchored.length) return null;

  let cumPV = 0, cumVol = 0;
  for (const b of anchored) {
    const high = Number(b.high), low = Number(b.low), close = Number(b.close), vol = Number(b.volume);
    if (![high, low, close, vol].every(Number.isFinite) || vol <= 0) continue;
    cumPV  += ((high + low + close) / 3) * vol;
    cumVol += vol;
  }
  return cumVol > 0 ? round4(cumPV / cumVol) : null;
}

/**
 * Classify the current auction state from price location relative to value area and AVWAP.
 * Returns one of: bullish_acceptance | bearish_acceptance | failed_upside | failed_downside | balance | unknown
 */
export function classifyAuctionState({ currentPrice, vah, val, poc, avwap }) {
  if (!Number.isFinite(currentPrice) || !Number.isFinite(vah) || !Number.isFinite(val)) return 'unknown';

  const aboveValue = currentPrice > vah;
  const belowValue = currentPrice < val;
  const aboveAvwap = Number.isFinite(avwap) ? currentPrice > avwap : null;

  if (aboveValue && aboveAvwap === true)  return 'bullish_acceptance';
  if (aboveValue && aboveAvwap === false) return 'failed_upside';
  if (belowValue && aboveAvwap === false) return 'bearish_acceptance';
  if (belowValue && aboveAvwap === true)  return 'failed_downside';
  return 'balance';
}

/**
 * Produce a human-readable price location description relative to value area and AVWAP.
 */
export function describeLocation({ currentPrice, vah, val, poc, avwap }) {
  if (!Number.isFinite(currentPrice)) return 'unknown';
  const parts = [];
  if (Number.isFinite(vah) && Number.isFinite(val)) {
    if (currentPrice > vah)                           parts.push(`above VAH ${round2(vah)}`);
    else if (currentPrice < val)                      parts.push(`below VAL ${round2(val)}`);
    else if (Number.isFinite(poc) && Math.abs(currentPrice - poc) / poc < 0.003) parts.push(`at POC ${round2(poc)}`);
    else                                              parts.push(`inside value ${round2(val)}–${round2(vah)}`);
  }
  if (Number.isFinite(avwap)) {
    const dist = ((currentPrice - avwap) / avwap) * 100;
    parts.push(`${dist >= 0 ? '+' : ''}${dist.toFixed(1)}% vs AVWAP ${round2(avwap)}`);
  }
  return parts.join(', ') || 'N/A';
}

function round4(n) { return Number.isFinite(n) ? Number(n.toFixed(4)) : null; }
function round2(n) { return Number.isFinite(n) ? Number(n.toFixed(2)) : null; }
