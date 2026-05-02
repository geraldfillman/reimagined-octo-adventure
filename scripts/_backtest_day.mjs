import { fetchIntradayPrices } from './lib/fmp-client.mjs';
import { computeTransitionEntropyFromBars } from './agents/marketmind/entropy.mjs';
import { getApiKey, getBaseUrl } from './lib/config.mjs';
import { getJson } from './lib/fetcher.mjs';

const STOP_ATR_MULT  = 0.10;
const CAPITAL        = 25_000;
const MAX_LEVERAGE   = 4;
const TARGET_DATES   = ['2026-04-23', '2026-04-24'];
const SYMBOL         = process.argv[2] ?? 'INTC';

function computeATR(series, period = 14) {
  if (series.length <= period) return null;
  const tr = [];
  for (let i = 1; i < series.length; i++) {
    const c = series[i], p = series[i - 1];
    tr.push(Math.max(
      (c.high || c.close) - (c.low  || c.close),
      Math.abs((c.high || c.close) - (p.close || 0)),
      Math.abs((c.low  || c.close) - (p.close || 0)),
    ));
  }
  if (tr.length < period) return null;
  let atr = tr.slice(0, period).reduce((s, v) => s + v, 0) / period;
  for (const v of tr.slice(period)) atr = ((atr * (period - 1)) + v) / period;
  return atr;
}

function positionSize(capital, entry, stop) {
  const r = Math.abs(entry - stop);
  if (r === 0) return { shares: 0, riskDollars: 0 };
  const byRisk     = Math.floor((capital * 0.01) / r);
  const byLeverage = Math.floor((capital * MAX_LEVERAGE) / entry);
  const shares     = Math.min(byRisk, byLeverage);
  return { shares, riskDollars: shares * r };
}

// Fetch a wide window of 1-min bars and filter to a specific date
async function fetchDayBars(symbol, date) {
  const all = await fetchIntradayPrices(symbol, { interval: '1min' });
  return all.filter(b => (b.date ?? '').startsWith(date)).reverse(); // oldest-first for simulation
}

async function backtestDay(symbol, date, atr14) {
  const bars = await fetchDayBars(symbol, date);
  if (bars.length === 0) return null;

  // ── ORB candle (9:30–9:34, today only, newest-first aware) ─────────────────
  const orbBars = [...bars].reverse().filter(b => {  // re-reverse to newest-first for ORB builder
    const tp = (b.date ?? '').split(' ')[1] ?? '';
    const [h, m] = tp.split(':').map(Number);
    return h === 9 && m >= 30 && m <= 34;
  });
  if (orbBars.length === 0) return { date, symbol, result: 'no-orb-data' };

  const orOpen  = orbBars.at(-1).open;
  const orClose = orbBars[0].close;
  const orHigh  = Math.max(...orbBars.map(b => b.high));
  const orLow   = Math.min(...orbBars.map(b => b.low));

  let direction, entry, stop;
  if      (orClose > orOpen) { direction = 'LONG';  entry = orHigh; stop = entry - STOP_ATR_MULT * atr14; }
  else if (orClose < orOpen) { direction = 'SHORT'; entry = orLow;  stop = entry + STOP_ATR_MULT * atr14; }
  else                       { return { date, symbol, direction: 'DOJI', result: 'no-trade' }; }

  // ── Entropy (120 bars ending at 9:34, oldest-first slice) ──────────────────
  const barsTo934 = bars.filter(b => b.date <= `${date} 09:34:00`);
  const entropyInput = barsTo934.slice(-120);
  const entropy = computeTransitionEntropyFromBars(entropyInput, { lookback: 120 });
  const eScore  = entropy?.score ?? null;

  // ── Simulate post-ORB bars (9:35–16:00) ────────────────────────────────────
  const postORB = bars.filter(b => b.date > `${date} 09:34:00` && b.date <= `${date} 16:00:00`);
  if (postORB.length === 0) return { date, symbol, direction, entry, stop, eScore, result: 'no-post-orb-data' };

  let triggered = false, triggerTime = null, triggerPrice = null;
  let stopHit = false, stopTime = null, stopPrice = null;
  let exitPrice = null, exitTime = null;

  for (const bar of postORB) {
    if (!triggered) {
      // Check entry trigger on each bar's range
      if (direction === 'LONG'  && bar.high >= entry) {
        triggered = true; triggerTime = bar.date; triggerPrice = entry;
      } else if (direction === 'SHORT' && bar.low <= entry) {
        triggered = true; triggerTime = bar.date; triggerPrice = entry;
      }
    }
    if (triggered && !stopHit) {
      if (direction === 'LONG'  && bar.low  <= stop) { stopHit = true; stopTime = bar.date; stopPrice = stop; break; }
      if (direction === 'SHORT' && bar.high >= stop) { stopHit = true; stopTime = bar.date; stopPrice = stop; break; }
    }
  }

  if (!triggered) {
    return { date, symbol, direction, entry, stop, eScore, result: 'no-trigger', orOpen, orClose, orHigh, orLow };
  }

  if (stopHit) {
    exitPrice = stopPrice; exitTime = stopTime;
  } else {
    // Hold to close — use last bar's close
    const lastBar = postORB.at(-1);
    exitPrice = lastBar.close; exitTime = lastBar.date;
  }

  const pnlPerShare = direction === 'LONG' ? exitPrice - triggerPrice : triggerPrice - exitPrice;
  const { shares, riskDollars } = positionSize(CAPITAL, triggerPrice, stop);
  const totalPnl = pnlPerShare * shares;
  const rMultiple = riskDollars > 0 ? (totalPnl / riskDollars) : null;
  const outcome = stopHit ? 'STOPPED' : pnlPerShare > 0 ? 'WINNER' : 'LOSER';

  return {
    date, symbol, direction,
    orOpen, orClose, orHigh, orLow,
    entry: triggerPrice, stop,
    rPerShare: Math.abs(triggerPrice - stop),
    shares, riskDollars,
    exitPrice, exitTime,
    pnlPerShare, totalPnl,
    rMultiple,
    eScore,
    outcome,
    result: 'traded',
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────
const apiKey = getApiKey('fmp');
const stable = getBaseUrl('fmp').replace(/\/api\/v\d+$/, '/stable');

// ATR14 from proper daily EOD bars
const eodRaw = await getJson(`${stable}/historical-price-eod/full?symbol=${SYMBOL}&timeseries=20&apikey=${apiKey}`);
const eodSeries = (Array.isArray(eodRaw?.historical) ? eodRaw.historical : Array.isArray(eodRaw) ? eodRaw : [])
  .slice(0, 16).reverse();
const atr14 = computeATR(eodSeries, 14) ?? 1;

const allBars = await fetchIntradayPrices(SYMBOL, { interval: '1min' });

console.log(`\n${SYMBOL} ORB+Entropy Backtest  |  ATR14 ~$${atr14.toFixed(2)}  |  Capital $${CAPITAL.toLocaleString()}\n`);

for (const date of TARGET_DATES) {
  const r = await backtestDay(SYMBOL, date, atr14);
  if (!r) { console.log(`${date}: no data available\n`); continue; }

  if (r.result === 'no-orb-data' || r.result === 'no-post-orb-data') {
    console.log(`${date}: ${r.result}\n`); continue;
  }
  if (r.result === 'no-trade') {
    console.log(`${date}: DOJI — no trade\n`); continue;
  }
  if (r.result === 'no-trigger') {
    console.log(`${date}: ${r.direction} setup — entry $${r.entry.toFixed(2)} never triggered (OR high: $${r.orHigh.toFixed(2)}, OR low: $${r.orLow.toFixed(2)})\n`); continue;
  }

  const entropyTag = r.eScore !== null
    ? `${r.eScore.toFixed(3)} (${r.eScore <= 0.50 ? 'low-entropy-watch' : r.eScore <= 0.60 ? 'near-low-watch' : 'baseline'})`
    : 'n/a';

  console.log(`${date}:`);
  console.log(`  Direction  : ${r.direction}`);
  console.log(`  ORB candle : open $${r.orOpen.toFixed(2)}  close $${r.orClose.toFixed(2)}  high $${r.orHigh.toFixed(2)}  low $${r.orLow.toFixed(2)}`);
  console.log(`  Entry      : $${r.entry.toFixed(2)} (triggered ${r.triggerTime ?? r.exitTime})`);
  console.log(`  Stop       : $${r.stop.toFixed(2)}  (R/share $${r.rPerShare.toFixed(2)})`);
  console.log(`  Sizing     : ${r.shares} shares  |  risk $${r.riskDollars.toFixed(0)}`);
  console.log(`  Entropy    : ${entropyTag}`);
  console.log(`  Exit       : $${r.exitPrice.toFixed(2)} at ${r.exitTime}`);
  console.log(`  P&L/share  : ${r.pnlPerShare >= 0 ? '+' : ''}$${r.pnlPerShare.toFixed(2)}`);
  console.log(`  Total P&L  : ${r.totalPnl >= 0 ? '+' : ''}$${r.totalPnl.toFixed(0)}`);
  console.log(`  R-multiple : ${r.rMultiple !== null ? (r.rMultiple >= 0 ? '+' : '') + r.rMultiple.toFixed(2) + 'R' : 'n/a'}`);
  console.log(`  Outcome    : ${r.outcome}`);
  console.log('');
}
