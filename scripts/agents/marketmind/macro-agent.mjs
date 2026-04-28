import { getApiKey, getBaseUrl } from '../../lib/config.mjs';
import { getJson } from '../../lib/fetcher.mjs';
import { classifyDirectionalScore, confidenceFromScore, makeAgentSignal } from './schemas.mjs';
import { formatPercent } from './utils.mjs';

const SERIES = Object.freeze([
  { id: 'DFF', label: 'Fed Funds' },
  { id: 'T10Y2Y', label: '10Y-2Y Curve' },
  { id: 'VIXCLS', label: 'VIX' },
  { id: 'BAMLH0A0HYM2', label: 'High Yield Spread' },
]);

export async function runMacroAgent(state) {
  let apiKey;
  try {
    apiKey = getApiKey('fred');
  } catch (error) {
    return makeAgentSignal({
      agent: 'macro',
      signal: 'NEUTRAL',
      confidence: 0.1,
      summary: 'FRED key is unavailable, so macro context was skipped.',
      warnings: [error.message],
      raw_data: {},
    });
  }

  const baseUrl = getBaseUrl('fred');
  const results = await Promise.allSettled(SERIES.map(series => fetchFredLatest(baseUrl, apiKey, series.id)));
  const data = {};
  const warnings = [];
  SERIES.forEach((series, index) => {
    const result = results[index];
    if (result.status === 'fulfilled') data[series.id] = result.value;
    else warnings.push(`${series.id} unavailable: ${result.reason?.message || result.reason}`);
  });

  const fedFunds = data.DFF?.value;
  const curve = data.T10Y2Y?.value;
  const vix = data.VIXCLS?.value;
  const hySpread = data.BAMLH0A0HYM2?.value;

  let score = 0;
  if (Number.isFinite(vix) && vix > 30) score -= 1.1;
  else if (Number.isFinite(vix) && vix > 22) score -= 0.55;
  else if (Number.isFinite(vix) && vix < 16) score += 0.35;
  if (Number.isFinite(curve) && curve < -0.5) score -= 0.65;
  else if (Number.isFinite(curve) && curve > 0.5) score += 0.35;
  if (Number.isFinite(hySpread) && hySpread > 5) score -= 0.8;
  else if (Number.isFinite(hySpread) && hySpread < 3.5) score += 0.35;
  if (Number.isFinite(fedFunds) && fedFunds > 5) score -= state.asset_type === 'crypto' ? 0.55 : 0.35;

  const signal = classifyDirectionalScore(score, 0.35);
  const confidence = confidenceFromScore(score, { base: 0.25, scale: 0.16, max: 0.78 });

  return makeAgentSignal({
    agent: 'macro',
    signal,
    confidence,
    summary: `Macro backdrop: VIX ${formatValue(vix)}, curve ${formatValue(curve)}, HY spread ${formatPercent(hySpread)}.`,
    evidence: [
      `Fed funds: ${formatPercent(fedFunds)}`,
      `10Y-2Y: ${formatPercent(curve)}`,
      `VIX: ${formatValue(vix)}`,
      `HY spread: ${formatPercent(hySpread)}`,
    ],
    warnings,
    raw_data: data,
  });
}

async function fetchFredLatest(baseUrl, apiKey, seriesId) {
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: apiKey,
    file_type: 'json',
    sort_order: 'desc',
    limit: '5',
  });
  const data = await getJson(`${baseUrl}/series/observations?${params.toString()}`, { timeout: 15_000, retries: 2 });
  const latest = (data.observations || []).find(row => row.value !== '.');
  if (!latest) throw new Error('No latest observation.');
  return { date: latest.date, value: Number(latest.value) };
}

function formatValue(value) {
  return Number.isFinite(value) ? value.toFixed(2) : 'N/A';
}
