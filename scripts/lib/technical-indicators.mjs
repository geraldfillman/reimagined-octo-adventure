/**
 * technical-indicators.mjs - Small pure indicator helpers for market agents.
 *
 * Inputs are arrays of OHLCV-like bars. Output is newest-point metrics after
 * normalizing bars into ascending date order.
 */

export function normalizePriceSeries(rows = []) {
  return rows
    .map(row => ({
      date: String(row.date || row.timestamp || ''),
      open: toNumber(row.open),
      high: toNumber(row.high),
      low: toNumber(row.low),
      close: toNumber(row.close ?? row.adjClose ?? row.price),
      volume: toNumber(row.volume),
    }))
    .filter(row => row.date && Number.isFinite(row.close))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function computeSMA(rows, period, field = 'close') {
  const values = numericValues(rows, field).slice(-period);
  if (values.length < period) return null;
  return average(values);
}

export function computeEMA(rows, period, field = 'close') {
  const values = numericValues(rows, field);
  if (values.length < period) return null;

  const k = 2 / (period + 1);
  let ema = average(values.slice(0, period));
  for (const value of values.slice(period)) {
    ema = value * k + ema * (1 - k);
  }
  return ema;
}

export function computeRSI(rows, period = 14) {
  const values = numericValues(rows, 'close');
  if (values.length <= period) return null;

  const deltas = [];
  for (let i = 1; i < values.length; i++) {
    deltas.push(values[i] - values[i - 1]);
  }

  let avgGain = average(deltas.slice(0, period).map(delta => Math.max(delta, 0)));
  let avgLoss = average(deltas.slice(0, period).map(delta => Math.max(-delta, 0)));

  for (const delta of deltas.slice(period)) {
    const gain = Math.max(delta, 0);
    const loss = Math.max(-delta, 0);
    avgGain = ((avgGain * (period - 1)) + gain) / period;
    avgLoss = ((avgLoss * (period - 1)) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

export function computeMACD(rows, fast = 12, slow = 26, signal = 9) {
  const values = numericValues(rows, 'close');
  if (values.length < slow + signal) {
    return { macd: null, signal: null, histogram: null, crossover: 'unknown' };
  }

  const fastSeries = emaSeries(values, fast);
  const slowSeries = emaSeries(values, slow);
  const offset = fastSeries.length - slowSeries.length;
  const macdSeries = slowSeries.map((slowValue, index) => fastSeries[index + offset] - slowValue);
  const signalSeries = emaSeries(macdSeries, signal);

  const macd = macdSeries.at(-1);
  const signalLine = signalSeries.at(-1);
  const histogram = Number.isFinite(macd) && Number.isFinite(signalLine) ? macd - signalLine : null;
  const priorMacd = macdSeries.at(-2);
  const priorSignal = signalSeries.at(-2);

  let crossover = 'neutral';
  if (Number.isFinite(macd) && Number.isFinite(signalLine)) {
    crossover = macd > signalLine ? 'positive' : macd < signalLine ? 'negative' : 'neutral';
    if (Number.isFinite(priorMacd) && Number.isFinite(priorSignal)) {
      if (priorMacd <= priorSignal && macd > signalLine) crossover = 'bullish_cross';
      if (priorMacd >= priorSignal && macd < signalLine) crossover = 'bearish_cross';
    }
  }

  return { macd, signal: signalLine, histogram, crossover };
}

export function computeBollinger(rows, period = 20, deviations = 2) {
  const values = numericValues(rows, 'close').slice(-period);
  if (values.length < period) {
    return { upper: null, middle: null, lower: null, position: null };
  }

  const middle = average(values);
  const std = standardDeviation(values);
  const upper = middle + deviations * std;
  const lower = middle - deviations * std;
  const latest = values.at(-1);
  const range = upper - lower;
  const position = range === 0 ? 0.5 : (latest - lower) / range;
  return { upper, middle, lower, position };
}

export function computeATR(rows, period = 14) {
  const normalized = normalizePriceSeries(rows);
  if (normalized.length <= period) return null;

  const trueRanges = [];
  for (let i = 1; i < normalized.length; i++) {
    const row = normalized[i];
    const priorClose = normalized[i - 1].close;
    if (![row.high, row.low, priorClose].every(Number.isFinite)) continue;
    trueRanges.push(Math.max(
      row.high - row.low,
      Math.abs(row.high - priorClose),
      Math.abs(row.low - priorClose)
    ));
  }

  if (trueRanges.length < period) return null;
  return average(trueRanges.slice(-period));
}

export function percentChange(rows, lookback) {
  const values = numericValues(rows, 'close');
  if (values.length <= lookback) return null;
  const latest = values.at(-1);
  const prior = values.at(-1 - lookback);
  if (!prior) return null;
  return ((latest - prior) / prior) * 100;
}

export function dailyReturns(rows) {
  const values = numericValues(rows, 'close');
  const returns = [];
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1]) returns.push((values[i] - values[i - 1]) / values[i - 1]);
  }
  return returns;
}

export function realizedVolatility(rows, lookback = 30) {
  const returns = dailyReturns(rows).slice(-lookback);
  if (returns.length < Math.min(lookback, 5)) return null;
  return standardDeviation(returns) * Math.sqrt(252);
}

export function maxDrawdown(rows) {
  const values = numericValues(rows, 'close');
  if (values.length < 2) return null;

  let peak = values[0];
  let worst = 0;
  for (const value of values) {
    peak = Math.max(peak, value);
    if (peak > 0) worst = Math.min(worst, (value - peak) / peak);
  }
  return worst * 100;
}

export function sharpeLike(rows, lookback = 90) {
  const returns = dailyReturns(rows).slice(-lookback);
  if (returns.length < 10) return null;
  const mean = average(returns);
  const vol = standardDeviation(returns);
  if (!vol) return null;
  return (mean / vol) * Math.sqrt(252);
}

export function roundMetric(value, decimals = 2) {
  return Number.isFinite(value) ? Number(value.toFixed(decimals)) : null;
}

export function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function numericValues(rows, field) {
  return normalizePriceSeries(rows)
    .map(row => row[field])
    .filter(Number.isFinite);
}

function emaSeries(values, period) {
  if (values.length < period) return [];
  const k = 2 / (period + 1);
  let ema = average(values.slice(0, period));
  const result = [ema];
  for (const value of values.slice(period)) {
    ema = value * k + ema * (1 - k);
    result.push(ema);
  }
  return result;
}

function average(values) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values) {
  if (values.length < 2) return 0;
  const mean = average(values);
  const variance = average(values.map(value => Math.pow(value - mean, 2)));
  return Math.sqrt(variance);
}
