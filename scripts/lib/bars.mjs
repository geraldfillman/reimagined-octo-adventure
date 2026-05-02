/**
 * Normalize raw FMP intraday bars to oldest-first chronological order.
 * FMP returns 1-min bars newest-first; computeTransitionEntropyFromBars expects oldest-first.
 */
export function normalizeIntradayBars(rows = []) {
  return rows
    .map(row => ({
      date:   row.date || row.datetime || null,
      open:   Number(row.open),
      high:   Number(row.high),
      low:    Number(row.low),
      close:  Number(row.close),
      volume: Number(row.volume),
    }))
    .filter(row => row.date && Number.isFinite(row.close) && Number.isFinite(row.volume))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

/**
 * Group intraday bars (any order) by session date string (YYYY-MM-DD).
 * Returns Map<date, bar[]> preserving the original bar order within each session.
 */
export function groupBySession(bars) {
  const map = new Map();
  for (const b of bars) {
    const d = (b.date ?? '').split(' ')[0];
    if (!d) continue;
    if (!map.has(d)) map.set(d, []);
    map.get(d).push(b);
  }
  return map;
}

/**
 * Gap % between the prior session's last close and today's opening bar.
 * Expects newest-first intraday bars (FMP default order).
 * Returns null if either session is missing.
 */
export function computeGap(bars, todayDate) {
  const prevBars  = bars.filter(b => !String(b.date ?? '').startsWith(todayDate));
  const todayBars = bars.filter(b =>  String(b.date ?? '').startsWith(todayDate));
  if (!prevBars.length || !todayBars.length) return null;
  const prevClose = Number(prevBars[0]?.close);
  const todayOpen = Number(todayBars.at(-1)?.open);
  if (!Number.isFinite(prevClose) || !Number.isFinite(todayOpen) || prevClose === 0) return null;
  return ((todayOpen - prevClose) / prevClose) * 100;
}

/**
 * VWAP of a pre-filtered set of ORB bars (typical-price × volume weighted).
 * Caller is responsible for filtering bars to the desired ORB window first.
 */
export function computeORBVWAP(orbBars) {
  let cumPV = 0, cumVol = 0;
  for (const b of orbBars) {
    const high   = Number(b.high   ?? b.close);
    const low    = Number(b.low    ?? b.close);
    const close  = Number(b.close);
    const volume = Number(b.volume);
    if (![high, low, close, volume].every(Number.isFinite) || volume <= 0) continue;
    cumPV  += ((high + low + close) / 3) * volume;
    cumVol += volume;
  }
  return cumVol > 0 ? cumPV / cumVol : null;
}

/**
 * Wilder's ATR-14 on an oldest-first EOD OHLCV series.
 * Returns null if the series is too short.
 */
export function computeATR(series, period = 14) {
  if (series.length <= period) return null;
  const tr = [];
  for (let i = 1; i < series.length; i++) {
    const c = series[i], p = series[i - 1];
    tr.push(Math.max(
      (c.high || c.close || 0) - (c.low  || c.close || 0),
      Math.abs((c.high || c.close || 0) - (p.close || 0)),
      Math.abs((c.low  || c.close || 0) - (p.close || 0)),
    ));
  }
  if (tr.length < period) return null;
  let atr = tr.slice(0, period).reduce((s, v) => s + v, 0) / period;
  for (const v of tr.slice(period)) atr = ((atr * (period - 1)) + v) / period;
  return atr;
}
