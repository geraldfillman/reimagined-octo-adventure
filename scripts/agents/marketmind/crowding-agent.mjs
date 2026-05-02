import { makeAgentSignal } from './schemas.mjs';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const _require = createRequire(import.meta.url);
const CONFIG = _require(resolve(__dirname, '../../config/strategy_thresholds.json')).crowding;

/**
 * Crowding Risk Score (0–5) composite.
 * Derives signals from other already-run agent raw_data rather than making new API calls.
 * The crowding agent is a post-processor: call it with the agentSignals array after
 * parallel agents have completed.
 *
 * Factors (each 0–5, averaged):
 *  1. narrative_crowding     — news frequency from sentiment agent
 *  2. short_interest_crowding — short interest concentration
 *  3. liquidity_fragility    — volume entropy, spread signals
 *  4. momentum_crowding      — high return rank + vol signals
 *  5. factor_crowding        — high quality + momentum + growth overlap proxy
 *  6. options_oi_crowding    — placeholder (manual input via state)
 *  7. market_concentration   — large-cap / mega-cap flag
 *  8. agent_monoculture      — same ticker common across all screens
 */
export function runCrowdingAgent(state, agentSignals = []) {
  const byAgent = new Map(agentSignals.map(s => [String(s.agent || '').toLowerCase().replace(/[-\s]+/g, '_'), s]));
  const micro   = byAgent.get('microstructure')?.raw_data ?? {};
  const risk    = byAgent.get('risk')?.raw_data ?? {};
  const sent    = byAgent.get('sentiment')?.raw_data ?? {};
  const price   = byAgent.get('price')?.raw_data ?? {};
  const fund    = byAgent.get('fundamentals')?.raw_data ?? {};

  const factors = {};
  const warnings = [];

  // 1. Narrative crowding: high news frequency → higher crowding
  const newsCount = Number(sent.news_count ?? sent.article_count ?? 0);
  factors.narrative_crowding = scoreNarrative(newsCount);

  // 2. Short interest crowding: concentrated short interest
  const shortPctFloat = Number(micro.short_pct_float ?? risk.short_pct_float ?? 0);
  factors.short_interest_crowding = scoreShortInterest(shortPctFloat);

  // 3. Liquidity fragility: low entropy = compressed / crowded microstructure
  const entropyLevel = String(micro.order_flow_entropy_level ?? '').toLowerCase();
  factors.liquidity_fragility = scoreEntropyLiquidity(entropyLevel);

  // 4. Momentum crowding: very high returns + high relative volume
  const ret3m = Number(price.return_3m_pct ?? price.momentum_3m ?? NaN);
  const volRatio = Number(micro.volume_ratio ?? NaN);
  factors.momentum_crowding = scoreMomentum(ret3m, volRatio);

  // 5. Factor crowding: high-quality + momentum + growth overlap (CFQ as proxy)
  const cfqScore = Number(fund.cfq_score ?? NaN);
  factors.factor_crowding = scoreFactor(cfqScore, ret3m);

  // 6. Options OI crowding: passed in via state if available (manual from Fidelity review)
  const optionsCrowding = Number(state.options_oi_crowding ?? NaN);
  factors.options_oi_crowding = Number.isFinite(optionsCrowding) ? Math.min(optionsCrowding, 5) : 2.5;

  // 7. Market concentration: mega-cap names are more likely in crowded screens
  const marketCap = Number(micro.market_cap ?? fund.market_cap ?? NaN);
  factors.market_concentration = scoreMarketCap(marketCap);

  // 8. Agent monoculture: if this symbol also appears in many OSINT scans (proxy: news volume)
  factors.agent_monoculture = newsCount > 20 ? 3 : newsCount > 10 ? 2 : 1;

  // Composite: simple average of factors (each 0–5)
  const values = Object.values(factors).filter(v => Number.isFinite(v) && v !== 2.5);
  const crowdingScore = values.length
    ? Number((values.reduce((s, v) => s + v, 0) / values.length).toFixed(2))
    : 2.5;

  const crowdingLabel = classifyLabel(crowdingScore);

  if (crowdingScore >= CONFIG.high_max) warnings.push('High crowding detected. Entry requires stronger confirmation.');
  if (crowdingScore >= 4.5)             warnings.push('Exit-door risk. Avoid or size very small.');

  // For makeAgentSignal we don't use a directional signal — crowding is a risk overlay
  return makeAgentSignal({
    agent: 'crowding',
    signal: 'NEUTRAL',
    confidence: 0.5,
    summary: `Crowding score: ${crowdingScore}/5 (${crowdingLabel}). Narrative: ${factors.narrative_crowding}, Short: ${factors.short_interest_crowding}, Momentum: ${factors.momentum_crowding}.`,
    evidence: Object.entries(factors).map(([k, v]) => `${k}: ${Number.isFinite(v) ? v.toFixed(1) : 'N/A'}`),
    warnings,
    raw_data: {
      crowding_score:  crowdingScore,
      crowding_label:  crowdingLabel,
      crowding_factors: factors,
    },
  });
}

function scoreNarrative(newsCount) {
  if (newsCount >= 30) return 5;
  if (newsCount >= 20) return 4;
  if (newsCount >= 10) return 3;
  if (newsCount >= 5)  return 2;
  return 1;
}

function scoreShortInterest(shortPctFloat) {
  if (!Number.isFinite(shortPctFloat) || shortPctFloat <= 0) return 2;
  if (shortPctFloat >= 25) return 5;
  if (shortPctFloat >= 15) return 4;
  if (shortPctFloat >= 8)  return 3;
  if (shortPctFloat >= 3)  return 2;
  return 1;
}

function scoreEntropyLiquidity(entropyLevel) {
  // Compressed entropy = crowded, directional bets → higher risk
  if (entropyLevel === 'compressed') return 4;
  if (entropyLevel === 'low')        return 3;
  if (entropyLevel === 'moderate')   return 2;
  if (entropyLevel === 'diffuse')    return 1;
  return 2.5;
}

function scoreMomentum(ret3m, volRatio) {
  let s = 0, count = 0;
  if (Number.isFinite(ret3m)) {
    s += ret3m >= 40 ? 5 : ret3m >= 25 ? 4 : ret3m >= 15 ? 3 : ret3m >= 5 ? 2 : 1;
    count++;
  }
  if (Number.isFinite(volRatio)) {
    s += volRatio >= 3 ? 5 : volRatio >= 2 ? 4 : volRatio >= 1.5 ? 3 : volRatio >= 1 ? 2 : 1;
    count++;
  }
  return count ? Number((s / count).toFixed(2)) : 2.5;
}

function scoreFactor(cfqScore, ret3m) {
  // High quality + high momentum = more crowded factor exposure
  const qualityHigh = Number.isFinite(cfqScore) && cfqScore >= 3.5;
  const momentumHigh = Number.isFinite(ret3m) && ret3m >= 20;
  if (qualityHigh && momentumHigh) return 4.5;
  if (qualityHigh || momentumHigh) return 3;
  return 2;
}

function scoreMarketCap(marketCap) {
  if (!Number.isFinite(marketCap) || marketCap <= 0) return 2;
  if (marketCap >= 1e12)  return 4;  // mega-cap (>$1T)
  if (marketCap >= 2e11)  return 3;  // large-cap (>$200B)
  if (marketCap >= 1e10)  return 2;  // mid-large
  return 1;
}

function classifyLabel(score) {
  if (score >= 4.5) return 'exit_door_risk';
  if (score >= CONFIG.high_max)    return 'high';
  if (score >= CONFIG.monitor_max) return 'monitor';
  if (score >= CONFIG.normal_max)  return 'normal';
  return 'low';
}
