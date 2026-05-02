import { clamp, signalDirection } from './schemas.mjs';
import { computeAgentSignalEntropy } from './entropy.mjs';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const _require = createRequire(import.meta.url);
const CONFIG = _require(resolve(__dirname, '../../config/scoring-weights.json'));

const AGENT_WEIGHTS = Object.freeze(CONFIG.agentWeights);

export function synthesizeDeterministic(agentSignals = []) {
  const usable = agentSignals.filter(Boolean);
  let weightedSum = 0;
  let weightTotal = 0;
  const bullish = [];
  const bearish = [];
  const neutral = [];
  const failed = [];

  for (const signal of usable) {
    const confidence = clamp(Number(signal.confidence) || 0, 0, 1);
    const agentKey = normalizeAgentKey(signal.agent);
    const baseWeight = AGENT_WEIGHTS[agentKey] ?? (AGENT_WEIGHTS.default ?? 0.8);
    const downsideBoost = signal.signal === 'BEARISH' && CONFIG.downsideBoostedAgents.includes(agentKey) ? CONFIG.downsideBoost : 1;
    const weight = baseWeight * downsideBoost;
    const contribution = signalDirection(signal.signal) * confidence * weight;

    weightedSum += contribution;
    weightTotal += weight;

    const bucketRow = {
      agent: signal.agent,
      signal: signal.signal,
      confidence,
      summary: signal.summary,
      contribution,
    };
    if (signal.confidence === 0 && signal.warnings?.length) failed.push(bucketRow);
    else if (signal.signal === 'BULLISH') bullish.push(bucketRow);
    else if (signal.signal === 'BEARISH') bearish.push(bucketRow);
    else neutral.push(bucketRow);
  }

  const normalizedScore = weightTotal ? weightedSum / weightTotal : 0;
  const { bullish: bullishThreshold, bearish: bearishThreshold } = CONFIG.verdictThresholds;
  const finalVerdict = normalizedScore > bullishThreshold ? 'BULLISH' : normalizedScore < bearishThreshold ? 'BEARISH' : 'NEUTRAL';
  const disagreement = computeDisagreement(usable);
  const coverage = usable.length ? usable.filter(signal => signal.confidence > 0).length / usable.length : 0;
  const { scoreMultiplier, coverageWeight, disagreementPenalty, maxConfidence } = CONFIG.confidenceFormula;
  const finalConfidence = clamp(Math.abs(normalizedScore) * scoreMultiplier + coverage * coverageWeight - disagreement * disagreementPenalty, 0, maxConfidence);
  const bearishRiskCluster = hasBearishRiskCluster(usable);
  const entropy = computeAgentSignalEntropy(usable);
  const signalStatus = classifyVaultStatus({
    finalVerdict,
    finalConfidence,
    bearishRiskCluster,
    failedCount: failed.length,
  });

  bullish.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  bearish.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  return Object.freeze({
    final_verdict: finalVerdict,
    final_confidence: Number(finalConfidence.toFixed(2)),
    signal_status: signalStatus,
    reasoning: buildReasoning({ finalVerdict, finalConfidence, bullish, bearish, neutral, failed, entropy }),
    top_drivers: bullish.slice(0, 3).map(row => row.agent),
    top_risks: bearish.slice(0, 3).map(row => row.agent),
    follow_up_actions: buildFollowUps({ finalVerdict, bearish, failed, entropy }),
    score: Number(normalizedScore.toFixed(4)),
    disagreement: Number(disagreement.toFixed(2)),
    entropy_score: entropy.score,
    entropy_level: entropy.level,
    entropy_dominant_signal: entropy.dominant_signal,
    entropy_distribution: entropy.distribution,
    entropy_interpretation: entropy.interpretation,
  });
}

export function buildSignalNames(agentSignals = []) {
  return agentSignals
    .filter(signal => signal?.signal && signal.signal !== 'NEUTRAL')
    .map(signal => `AGENT_${normalizeAgentKey(signal.agent).toUpperCase()}_${signal.signal}`);
}

function classifyVaultStatus({ finalVerdict, finalConfidence, bearishRiskCluster, failedCount }) {
  const t = CONFIG.statusThresholds;
  if (bearishRiskCluster && finalConfidence >= t.critical.minConfidence) return 'critical';
  if (bearishRiskCluster && finalConfidence >= t.alertCluster.minConfidence) return 'alert';
  if (finalConfidence >= t.alertHigh.minConfidence) return 'alert';
  if (finalConfidence >= t.watch.minConfidence) return 'watch';
  if (failedCount >= t.watchFailedAgents.minFailed) return 'watch';
  if (finalVerdict !== 'NEUTRAL' && finalConfidence >= t.watchLow.minConfidence) return 'watch';
  return 'clear';
}

function hasBearishRiskCluster(signals) {
  const { primaryAgent, primaryMinConfidence, confirmationAgents, confirmationMinConfidence } = CONFIG.bearishRiskCluster;
  const byAgent = new Map(signals.map(signal => [normalizeAgentKey(signal.agent), signal]));
  const primary = byAgent.get(primaryAgent);
  const primaryBearish = primary?.signal === 'BEARISH' && primary.confidence >= primaryMinConfidence;
  const confirmation = confirmationAgents
    .map(a => byAgent.get(a))
    .some(signal => signal?.signal === 'BEARISH' && signal.confidence >= confirmationMinConfidence);
  return Boolean(primaryBearish && confirmation);
}

function computeDisagreement(signals) {
  const directional = signals.filter(signal => signalDirection(signal.signal) !== 0 && signal.confidence > 0);
  if (directional.length < 2) return 0;
  const bullish = directional.filter(signal => signal.signal === 'BULLISH').length;
  const bearish = directional.filter(signal => signal.signal === 'BEARISH').length;
  return Math.min(bullish, bearish) / directional.length;
}

function buildReasoning({ finalVerdict, finalConfidence, bullish, bearish, neutral, failed, entropy }) {
  const driverText = bullish.length ? `Drivers: ${bullish.slice(0, 2).map(row => row.agent).join(', ')}.` : '';
  const riskText = bearish.length ? `Risks: ${bearish.slice(0, 2).map(row => row.agent).join(', ')}.` : '';
  const mixedText = neutral.length ? `${neutral.length} neutral layer(s).` : '';
  const failedText = failed.length ? `${failed.length} layer(s) failed and were treated as neutral.` : '';
  const entropyText = entropy?.level && entropy.level !== 'unknown'
    ? `Agent entropy is ${entropy.level} (${entropy.score}).`
    : '';
  return [`Deterministic synthesis is ${finalVerdict.toLowerCase()} at ${Math.round(finalConfidence * 100)}% confidence.`, entropyText, driverText, riskText, mixedText, failedText]
    .filter(Boolean)
    .join(' ');
}

function buildFollowUps({ finalVerdict, bearish, failed, entropy }) {
  const actions = [];
  if (finalVerdict === 'BEARISH' || bearish.length) actions.push('Review bearish layers before increasing exposure.');
  if (bearish.some(row => row.agent === 'macro')) actions.push('Refresh macro and VIX context.');
  if (bearish.some(row => row.agent === 'risk')) actions.push('Check drawdown, volatility, and position sizing.');
  if (entropy?.level === 'compressed' && finalVerdict !== 'NEUTRAL') actions.push('Treat low entropy as move-risk compression, not directional certainty.');
  if (entropy?.level === 'diffuse') actions.push('Resolve agent disagreement before changing conviction.');
  if (failed.length) actions.push('Rerun failed agents or inspect API keys.');
  if (!actions.length) actions.push('Compare with latest thesis full-picture report.');
  return actions;
}

function normalizeAgentKey(agent) {
  return String(agent || '').toLowerCase().replace(/[-\s]+/g, '_');
}
