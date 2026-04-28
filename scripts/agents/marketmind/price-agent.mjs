import { fetchDailyPrices } from '../../lib/fmp-client.mjs';
import {
  computeBollinger,
  computeEMA,
  computeMACD,
  computeRSI,
  computeSMA,
  normalizePriceSeries,
  percentChange,
  roundMetric,
} from '../../lib/technical-indicators.mjs';
import { classifyDirectionalScore, confidenceFromScore, makeAgentSignal } from './schemas.mjs';
import { daysAgo, formatPercent } from './utils.mjs';

export async function runPriceAgent(state) {
  const symbol = apiSymbolFor(state);
  const rows = normalizePriceSeries(await fetchDailyPrices(symbol, { from: daysAgo(420) })).slice(-260);
  if (rows.length < 30) {
    return makeAgentSignal({
      agent: 'price',
      signal: 'NEUTRAL',
      confidence: 0.1,
      summary: `Only ${rows.length} price bars were available.`,
      warnings: ['Insufficient price history for robust technical read.'],
      raw_data: { bars: rows.length },
    });
  }

  const latest = rows.at(-1);
  const sma20 = computeSMA(rows, 20);
  const sma50 = computeSMA(rows, 50);
  const sma200 = computeSMA(rows, 200);
  const ema21 = computeEMA(rows, 21);
  const rsi14 = computeRSI(rows, 14);
  const macd = computeMACD(rows);
  const bollinger = computeBollinger(rows);
  const change7d = percentChange(rows, 7);
  const change30d = percentChange(rows, 30);

  let score = 0;
  if (Number.isFinite(sma50) && latest.close > sma50) score += 1;
  if (Number.isFinite(sma50) && latest.close < sma50) score -= 1;
  if (Number.isFinite(sma200) && latest.close > sma200) score += 0.8;
  if (Number.isFinite(sma200) && latest.close < sma200) score -= 0.8;
  if (Number.isFinite(sma50) && Number.isFinite(sma200) && sma50 > sma200) score += 0.6;
  if (Number.isFinite(sma50) && Number.isFinite(sma200) && sma50 < sma200) score -= 0.6;
  if (Number.isFinite(change7d) && change7d > 1.5) score += 0.5;
  if (Number.isFinite(change7d) && change7d < -1.5) score -= 0.5;
  if (['positive', 'bullish_cross'].includes(macd.crossover)) score += 0.5;
  if (['negative', 'bearish_cross'].includes(macd.crossover)) score -= 0.5;
  if (Number.isFinite(rsi14) && rsi14 > 75) score -= 0.4;
  else if (Number.isFinite(rsi14) && rsi14 >= 45 && rsi14 <= 68) score += 0.25;
  else if (Number.isFinite(rsi14) && rsi14 < 35) score -= 0.25;

  const signal = classifyDirectionalScore(score, 0.45);
  const confidence = confidenceFromScore(score, { base: 0.28, scale: 0.15, max: 0.86 });
  const summary = [
    `${state.symbol} closed at ${roundMetric(latest.close, 2)}.`,
    `7d ${formatPercent(change7d)}, 30d ${formatPercent(change30d)}.`,
    `RSI ${roundMetric(rsi14, 1) ?? 'N/A'}, MACD ${macd.crossover}.`,
  ].join(' ');

  return makeAgentSignal({
    agent: 'price',
    signal,
    confidence,
    summary,
    evidence: [
      `Close vs SMA50: ${compare(latest.close, sma50)}`,
      `Close vs SMA200: ${compare(latest.close, sma200)}`,
      `MACD crossover: ${macd.crossover}`,
    ],
    raw_data: {
      api_symbol: symbol,
      bars: rows.length,
      close: roundMetric(latest.close, 4),
      change_7d_pct: roundMetric(change7d, 2),
      change_30d_pct: roundMetric(change30d, 2),
      sma20: roundMetric(sma20, 4),
      sma50: roundMetric(sma50, 4),
      sma200: roundMetric(sma200, 4),
      ema21: roundMetric(ema21, 4),
      rsi14: roundMetric(rsi14, 2),
      macd: roundMetric(macd.macd, 4),
      macd_signal: roundMetric(macd.signal, 4),
      macd_crossover: macd.crossover,
      bollinger_position: roundMetric(bollinger.position, 3),
    },
  });
}

function apiSymbolFor(state) {
  const symbol = String(state.symbol || '').toUpperCase();
  if (state.asset_type === 'crypto' && !symbol.endsWith('USD')) return `${symbol}USD`;
  return symbol;
}

function compare(price, level) {
  if (!Number.isFinite(price) || !Number.isFinite(level)) return 'N/A';
  return price >= level ? 'above' : 'below';
}
