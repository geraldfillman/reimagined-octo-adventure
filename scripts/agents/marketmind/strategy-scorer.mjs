import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getVaultRoot } from '../../lib/config.mjs';
import { runCrowdingAgent } from './crowding-agent.mjs';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const _require = createRequire(import.meta.url);
const SCORE_CFG   = _require(resolve(__dirname, '../../config/strategy_thresholds.json')).scoring;
const ALERT_RULES = _require(resolve(__dirname, '../../config/alert_rules.json'));

/**
 * Compute the 0–100 strategy score and write a standardized alert note.
 * Called after runAgentsInParallel completes — NOT inside the parallel run.
 *
 * @param {object} state - same state object passed to all agents
 * @param {Array}  agentSignals - results from runAgentsInParallel
 * @returns {{ score, signal_status, edge_types, strategy_family, crowding, alert_path }}
 */
export async function scoreAndAlert(state, agentSignals) {
  const byAgent = buildAgentMap(agentSignals);
  const crowdingSignal = runCrowdingAgent(state, agentSignals);
  const crowdingScore  = Number(crowdingSignal.raw_data?.crowding_score ?? 2.5);
  const crowdingLabel  = String(crowdingSignal.raw_data?.crowding_label ?? 'normal');

  const breakdown = computeScoreBreakdown(byAgent, crowdingScore);
  const totalScore = Math.round(
    Object.values(breakdown).reduce((s, v) => s + v, 0)
  );

  const edgeTypes      = deriveEdgeTypes(byAgent);
  const strategyFamily = deriveStrategyFamily(byAgent);
  const signalStatus   = scoreToSignalStatus(totalScore, SCORE_CFG);
  const invalidation   = deriveInvalidation(byAgent, strategyFamily);

  const result = {
    score:           totalScore,
    score_breakdown: breakdown,
    signal_status:   signalStatus,
    edge_types:      edgeTypes,
    strategy_family: strategyFamily,
    crowding_score:  crowdingScore,
    crowding_label:  crowdingLabel,
    invalidation,
  };

  // Write alert note if score meets review threshold
  let alertPath = null;
  if (totalScore >= SCORE_CFG.review_min) {
    alertPath = await writeAlertNote(state, agentSignals, crowdingSignal, result);
    result.alert_path = alertPath;
  }

  return result;
}

// ─── Score computation ────────────────────────────────────────────────────────

function computeScoreBreakdown(byAgent, crowdingScore) {
  const w = SCORE_CFG.weights;
  return {
    edge_clarity:         scoreEdgeClarity(byAgent)        * (w.edge_clarity / 15),
    strategy_fit:         scoreStrategyFit(byAgent)        * (w.strategy_fit / 10),
    auction_confirmation: scoreAuction(byAgent)            * (w.auction_confirmation / 15),
    volume_participation: scoreVolume(byAgent)             * (w.volume_participation / 10),
    trend_regime:         scoreTrendRegime(byAgent)        * (w.trend_regime / 10),
    fundamental_quality:  scoreFundamentals(byAgent)       * (w.fundamental_quality / 10),
    catalyst_event:       scoreCatalyst(byAgent)           * (w.catalyst_event / 10),
    liquidity_execution:  scoreLiquidity(byAgent)          * (w.liquidity_execution / 10),
    crowding_adjustment:  scoreCrowding(crowdingScore)     * (w.crowding_max_penalty / 10),
    defined_risk:         w.defined_risk,  // always granted — invalidation always included
  };
}

function scoreEdgeClarity(m) {
  const bullish = [...m.values()].filter(s => s?.signal === 'BULLISH').length;
  const bearish = [...m.values()].filter(s => s?.signal === 'BEARISH').length;
  const directional = Math.max(bullish, bearish);
  if (directional >= 4) return 15;
  if (directional >= 3) return 11;
  if (directional >= 2) return 7;
  if (directional >= 1) return 4;
  return 0;
}

function scoreStrategyFit(m) {
  const auction  = m.get('auction')?.raw_data?.auction_state;
  const peadLabel = m.get('pead')?.raw_data?.pead_label ?? '';
  const pairStatus = (m.get('pair')?.raw_data?.pair_details ?? [])
    .some(p => p.status === 'stretched') ? 'stretched' : 'none';
  let count = 0;
  if (['bullish_acceptance', 'failed_downside'].includes(auction)) count++;
  if (peadLabel.includes('positive_drift') || peadLabel.includes('quality')) count++;
  if (pairStatus === 'stretched') count++;
  if (m.get('fundamentals')?.signal === 'BULLISH') count++;
  return count >= 3 ? 10 : count === 2 ? 7 : count === 1 ? 4 : 1;
}

function scoreAuction(m) {
  const state = m.get('auction')?.raw_data?.auction_state;
  const rvol  = Number(m.get('auction')?.raw_data?.relative_volume ?? 1);
  const rvBonus = rvol > 1.5 ? 1 : 0;
  const base = {
    bullish_acceptance: 15,
    failed_downside:    10,
    balance:             6,
    failed_upside:       2,
    bearish_acceptance:  0,
    unknown:             5,
  }[state ?? 'unknown'] ?? 5;
  return Math.min(base + rvBonus, 15);
}

function scoreVolume(m) {
  const vr = Number(m.get('microstructure')?.raw_data?.volume_ratio ?? NaN);
  if (!Number.isFinite(vr)) return 5;
  if (vr >= 2.0) return 10;
  if (vr >= 1.5) return 8;
  if (vr >= 1.2) return 6;
  if (vr >= 0.8) return 4;
  return 2;
}

function scoreTrendRegime(m) {
  const priceDir = signalNum(m.get('price')?.signal);
  const macroDir = signalNum(m.get('macro')?.signal);
  const combined = priceDir + macroDir;
  if (combined >= 2)  return 10;
  if (combined === 1) return 7;
  if (combined === 0) return 4;
  return 1;
}

function scoreFundamentals(m) {
  const cfq  = Number(m.get('fundamentals')?.raw_data?.cfq_score ?? NaN);
  const sig  = m.get('fundamentals')?.signal;
  let s = Number.isFinite(cfq) ? (cfq >= 3.5 ? 8 : cfq >= 2.5 ? 5 : 2) : 4;
  if (sig === 'BULLISH') s = Math.min(s + 2, 10);
  return s;
}

function scoreCatalyst(m) {
  const label = String(m.get('pead')?.raw_data?.pead_label ?? '');
  if (label.includes('quality_positive_drift')) return 10;
  if (label.includes('positive_drift'))         return 7;
  if (label === 'neutral_earnings')             return 4;
  if (label.includes('failed_positive'))        return 2;
  if (label.includes('negative'))              return 0;
  return 3; // no recent earnings — neutral
}

function scoreLiquidity(m) {
  const mc  = Number(m.get('microstructure')?.raw_data?.market_cap ?? m.get('fundamentals')?.raw_data?.market_cap ?? 0);
  const vr  = Number(m.get('microstructure')?.raw_data?.volume_ratio ?? 1);
  const beta = Number(m.get('microstructure')?.raw_data?.beta ?? 1);
  let s = mc >= 5e10 ? 4 : mc >= 5e9 ? 3 : 2;  // large/mid/small
  if (vr >= 1) s += 3;
  if (beta < 2) s += 3;
  return Math.min(s, 10);
}

function scoreCrowding(crowdingScore) {
  // Returns 0 to -10 (stored as negative contribution)
  if (crowdingScore >= 4.5) return -10;
  if (crowdingScore >= 4.0) return -7;
  if (crowdingScore >= 3.5) return -4;
  if (crowdingScore >= 3.0) return -2;
  return 0;
}

// ─── Edge type / strategy family derivation ──────────────────────────────────

function deriveEdgeTypes(m) {
  const types = new Set();
  const peadLabel  = String(m.get('pead')?.raw_data?.pead_label ?? '');
  const pairStatus = (m.get('pair')?.raw_data?.pair_details ?? []).some(p => p.status === 'stretched');
  const aState     = m.get('auction')?.raw_data?.auction_state;

  if (peadLabel.includes('drift'))           { types.add('behavioral'); types.add('information'); }
  if (pairStatus)                            { types.add('statistical'); }
  if (['bullish_acceptance', 'failed_downside'].includes(aState)) types.add('execution');
  if (m.get('macro')?.signal === 'BULLISH')  types.add('structural');
  if (m.get('fundamentals')?.raw_data?.cfq_score >= 3.5) types.add('risk_premium');

  return types.size ? [...types] : ['unclassified'];
}

function deriveStrategyFamily(m) {
  const peadLabel = String(m.get('pead')?.raw_data?.pead_label ?? '');
  const aState    = m.get('auction')?.raw_data?.auction_state;
  const pairStretched = (m.get('pair')?.raw_data?.pair_details ?? []).some(p => p.status === 'stretched');

  if (peadLabel.includes('quality_positive_drift')) return 'quality_earnings_drift';
  if (peadLabel.includes('positive_drift'))          return 'earnings_drift';
  if (pairStretched)                                 return 'pair_mean_reversion';
  if (aState === 'bullish_acceptance')               return 'auction_breakout';
  if (aState === 'bearish_acceptance')               return 'auction_breakdown';
  return 'general_research';
}

function deriveInvalidation(m, strategyFamily) {
  const aState = m.get('auction')?.raw_data?.auction_state;
  const avwap  = m.get('auction')?.raw_data?.avwap;
  const val    = m.get('auction')?.raw_data?.val;

  const lines = [];
  if (aState === 'bullish_acceptance' && avwap) lines.push(`Price closes back below AVWAP ${avwap}`);
  if (aState === 'bullish_acceptance' && val)   lines.push(`Price falls back inside value area below VAL ${val}`);
  if (strategyFamily === 'pair_mean_reversion') lines.push('Pair correlation breaks below 0.35 or fundamental divergence develops');
  if (strategyFamily.includes('earnings_drift')) lines.push('Price closes below earnings-date AVWAP on above-average volume');
  lines.push('Macro regime shifts to liquidity stress (OFR FSI > 1 + credit spread widening)');
  return lines.join(' | ');
}

function scoreToSignalStatus(score, cfg) {
  if (score >= cfg.alert_min) return 'alert';
  if (score >= cfg.watch_min) return 'watch';
  return 'clear';
}

// ─── Alert note writer ────────────────────────────────────────────────────────

async function writeAlertNote(state, agentSignals, crowdingSignal, result) {
  const symbol   = String(state.symbol || 'UNKNOWN').toUpperCase();
  const dateStr  = new Date().toISOString().slice(0, 10);
  const timeStr  = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const fileName = `${dateStr}_${symbol}_strategy_alert.md`;
  const alertDir = join(getVaultRoot(), '05_Data_Pulls', 'Alerts');

  await mkdir(alertDir, { recursive: true });

  const byAgent = buildAgentMap(agentSignals);
  const auction  = byAgent.get('auction')?.raw_data ?? {};
  const micro    = byAgent.get('microstructure')?.raw_data ?? {};
  const pead     = byAgent.get('pead')?.raw_data ?? {};
  const fund     = byAgent.get('fundamentals')?.raw_data ?? {};
  const crowding = crowdingSignal.raw_data ?? {};

  const frontmatter = [
    '---',
    `title: Alert — ${symbol} — ${dateStr}`,
    `source: MarketMind Strategy Scorer`,
    `date_pulled: ${dateStr}`,
    `domain: Equities`,
    `data_type: alert`,
    `frequency: daily`,
    `signal_status: ${result.signal_status}`,
    `strategy_score: ${result.score}`,
    `edge_type: [${result.edge_types.join(', ')}]`,
    `strategy_family: ${result.strategy_family}`,
    `auction_state: ${auction.auction_state ?? 'unknown'}`,
    `cfq_score: ${fund.cfq_score ?? 'N/A'}`,
    `crowding_score: ${crowding.crowding_score ?? 'N/A'}`,
    `tags: [alert, ${symbol}, strategy-score, ${result.strategy_family}]`,
    '---',
  ].join('\n');

  const topDrivers = agentSignals
    .filter(s => s.signal === 'BULLISH')
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3)
    .map(s => `- ${s.agent} (${(s.confidence * 100).toFixed(0)}% confidence): ${s.summary}`);

  const topRisks = [
    ...agentSignals.filter(s => s.signal === 'BEARISH').map(s => `- **${s.agent}**: ${s.summary}`),
    ...agentSignals.flatMap(s => (s.warnings ?? []).map(w => `- ⚠ ${s.agent}: ${w}`)).slice(0, 4),
  ].slice(0, 5);

  const scoreRows = Object.entries(result.score_breakdown)
    .map(([k, v]) => `| ${k.replace(/_/g, ' ')} | ${v >= 0 ? '+' : ''}${v.toFixed(1)} |`)
    .join('\n');

  const body = `
# Alert: ${symbol}

**Time:** ${timeStr} UTC
**Alert type:** ${result.strategy_family}
**Edge type:** ${result.edge_types.join(', ')}
**Strategy family:** ${result.strategy_family}
**Score:** ${result.score} / 100
**Signal status:** ${result.signal_status}

## Signal

${agentSignals.find(s => s.signal !== 'NEUTRAL')?.summary ?? 'No strong directional signal.'}

## Score Breakdown

| Category | Points |
|---|---|
${scoreRows}
| **TOTAL** | **${result.score}** |

## Auction / Location

- Price vs POC: ${auction.poc ?? 'N/A'}
- Price vs VAH/VAL: VAH ${auction.vah ?? 'N/A'} / VAL ${auction.val ?? 'N/A'}
- Price vs anchored VWAP: ${auction.avwap ?? 'N/A'} (anchor: ${auction.avwap_anchor ?? 'N/A'})
- Distance from AVWAP: ${auction.avwap_dist_pct != null ? auction.avwap_dist_pct + '%' : 'N/A'}
- Relative volume: ${micro.volume_ratio != null ? micro.volume_ratio + 'x' : 'N/A'}

## Evidence

${topDrivers.length ? topDrivers.join('\n') : '- No strong bullish signals.'}

## Risk Flags

${topRisks.length ? topRisks.join('\n') : '- No risk flags.'}

## Crowding Check

Score: **${crowding.crowding_score ?? 'N/A'} / 5** (${crowding.crowding_label ?? 'N/A'})
${crowdingSignal.warnings?.map(w => `- ${w}`).join('\n') ?? ''}

Factors: ${Object.entries(crowding.crowding_factors ?? {}).map(([k, v]) => `${k.replace(/_/g, ' ')} ${v}`).join(' | ')}

## PEAD / Earnings

- Label: ${pead.pead_label ?? 'N/A'}
- Earnings date: ${pead.earnings_date ?? 'N/A'}
- EPS surprise: ${pead.eps_surprise_pct != null ? pead.eps_surprise_pct + '%' : 'N/A'}
- Price vs earnings AVWAP: ${pead.price_above_earnings_avwap != null ? (pead.price_above_earnings_avwap ? 'above' : 'below') : 'N/A'}

## Cash-Flow Quality

Score: **${fund.cfq_score ?? 'N/A'} / 5** (${fund.cfq_label ?? 'N/A'})

## Manual Fidelity Review

- Options chain liquidity: _check manually_
- Bid/ask spread: _check manually_
- Open interest: _check manually_
- Volume: _check manually_
- Assignment risk: _check manually_
- Event/dividend risk: _check manually_

## Invalidation

${result.invalidation}

## Suggested Human Action

Review / Watch / Ignore / Journal / Manual broker check.
**No automated trade.**
`.trim();

  const filePath = join(alertDir, fileName);
  await writeFile(filePath, `${frontmatter}\n\n${body}\n`, 'utf8');
  return filePath;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildAgentMap(signals) {
  return new Map(
    (signals ?? []).map(s => [String(s.agent || '').toLowerCase().replace(/[-\s]+/g, '_'), s])
  );
}

function signalNum(signal) {
  if (signal === 'BULLISH') return 1;
  if (signal === 'BEARISH') return -1;
  return 0;
}
