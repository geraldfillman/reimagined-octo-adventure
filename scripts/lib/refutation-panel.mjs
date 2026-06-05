/**
 * refutation-panel.mjs — Phase 2 Adversarial Truth library.
 *
 * Given a candidate thesis verdict, spawns 3 lens-diverse skeptics whose job
 * is to refute it. Each skeptic returns a structured JSON judgment that gets
 * normalized into a challenge AgentMessage. The resulting messages, combined
 * with the original verdict observation, feed the existing debate engine for
 * thread resolution.
 *
 * Quorum rule (matches ROADMAP §Phase 2):
 *   - ≥2 of 3 skeptics return refuted: true  →  verdict REFUTED (kill promotion)
 *   - ≤1 refuted                              →  verdict SURVIVES
 *
 * Dry-run mode returns the prompts that WOULD be sent without calling any LLM —
 * required by ROADMAP Operating Principle 5 (token cost is a budget).
 */

import { chatJson } from './llm-client.mjs';
import { normalizeAgentMessage } from './agent-interactions.mjs';
import { resolveThreadDecision } from './agent-debate-engine.mjs';

export const LENSES = Object.freeze({
  correctness: {
    key: 'correctness',
    role: 'Correctness Skeptic',
    instruction: 'Find the factual or logical errors in this thesis. Default to refuted:true unless the reasoning is internally consistent AND the cited evidence directly supports the verdict.',
  },
  base_rate: {
    key: 'base_rate',
    role: 'Base-Rate Skeptic',
    instruction: 'What is the historical base-rate failure mode for this verdict type on this kind of symbol? Is this thesis ignoring it? Default to refuted:true unless the thesis explicitly addresses why the base rate does not apply here.',
  },
  alternative_explanation: {
    key: 'alternative_explanation',
    role: 'Alternative-Explanation Skeptic',
    instruction: 'What competing explanation fits the evidence equally well or better? Default to refuted:true if a plausible alternative is not explicitly ruled out by the thesis.',
  },
});

/**
 * Indicator audit findings from 2026-06-03 thesis-calibration slice.
 * Skeptics should weight these higher than the synthesis-system's own "Top drivers" framing.
 *
 * @see World_Machine/ROADMAP.md §Phase 2 indicator audit (2026-06-03)
 */
export const INDICATOR_PRIORS = Object.freeze({
  high_signal_agents: ['risk-BEARISH (54% acc n=63)', 'microstructure-BULLISH (66.7% n=15)', 'price-BEARISH (53% n=32)'],
  retired_agents: [
    'macro (emits BULLISH 98/98 — broken/constant; do not weight)',
    'sentiment-BULLISH (37.5% — below baseline)',
    'fundamentals-BEARISH (30% — contrarian)',
    'price-BULLISH (35.7% — below baseline)',
  ],
  symbol_bullish_failures: ['GEV (25% acc on 12 BULLISH calls)', 'ETN (22% on 9)', 'AMZN (11% on 9)'],
  reliable_neutral_symbols: ['MSFT (100% on 12 NEUTRAL calls)', 'PLTR (58% on 12)'],
});

const LENS_ORDER = ['correctness', 'base_rate', 'alternative_explanation'];

export function buildSkepticPrompt({ verdict, lens, priorCalls = [] }) {
  const lensDef = LENSES[lens];
  if (!lensDef) throw new Error(`Unknown lens: ${lens}`);
  const discriminationMode = priorCalls.length ? 'trajectory-aware' : 'first-call';
  const verdictBlock = JSON.stringify({
    symbol: verdict.symbol,
    verdict: verdict.verdict,
    confidence_pct: verdict.confidence_pct ?? null,
    thesis_date: verdict.thesis_date ?? null,
    thesis_name: verdict.thesis_name ?? null,
    agent_signals: verdict.agent_signals ?? null,
    entropy_distribution: verdict.entropy_distribution ?? null,
    reasoning: verdict.reasoning ?? null,
    evidence_paths: verdict.evidence_paths ?? [],
  }, null, 2);
  const trajectoryBlock = priorCalls.length
    ? `\n\nPrior calls on the same symbol (chronological):\n${JSON.stringify(priorCalls, null, 2)}\n\nDeterioration trajectory matters: declining confidence, decaying bullish distribution, risk-signal demotion, or stalled Gate 3 promotion are themselves refutation evidence.`
    : `\n\nDiscrimination mode: first-call (no prior calls on this symbol). Note: refutation accuracy on first-call theses is weak — the synthesis output alone is not sufficient to distinguish winners from losers. Be honest about uncertainty.`;
  const priorsBlock = `\n\nIndicator priors from 2026-06-03 calibration audit (apply to weighting):\n- HIGH SIGNAL: ${INDICATOR_PRIORS.high_signal_agents.join('; ')}\n- RETIRED/NOISE: ${INDICATOR_PRIORS.retired_agents.join('; ')}\n- BULLISH-bias-failure symbols: ${INDICATOR_PRIORS.symbol_bullish_failures.join('; ')}\n- Reliable NEUTRAL symbols: ${INDICATOR_PRIORS.reliable_neutral_symbols.join('; ')}`;
  return [
    {
      role: 'system',
      content: `You are the ${lensDef.role}. Your job is to adversarially evaluate a trading thesis. ${lensDef.instruction} Return a JSON object with keys: refuted (bool), summary (string ≤200 chars), confidence (0-1), signal_status (clear|watch|alert|critical — use alert/critical when refuted:true), discrimination_mode (echo: "${discriminationMode}"), reasoning (≤500 chars).`,
    },
    {
      role: 'user',
      content: `Thesis to evaluate:\n${verdictBlock}${trajectoryBlock}${priorsBlock}\n\nApply the ${lensDef.role.toLowerCase()} lens and return JSON.`,
    },
  ];
}

export async function spawnRefutationPanel({ verdict, runId, dryRun = true, llmOptions = {}, priorCalls = [] } = {}) {
  if (!verdict?.symbol || !verdict?.verdict) {
    throw new Error('spawnRefutationPanel requires verdict.symbol and verdict.verdict');
  }
  const effectiveRunId = String(runId || `refute-${verdict.symbol}-${verdict.thesis_date || 'adhoc'}`);
  const topic = `Refutation panel: ${verdict.verdict} ${verdict.symbol}${verdict.thesis_date ? ` (${verdict.thesis_date})` : ''}`;
  const threadId = `${effectiveRunId}_${topic.replace(/\s+/g, '_').toLowerCase()}`;
  const discrimination_mode = priorCalls.length ? 'trajectory-aware' : 'first-call';

  const challenges = [];
  const prompts = {};
  const skipped = [];

  for (const lensKey of LENS_ORDER) {
    const prompt = buildSkepticPrompt({ verdict, lens: lensKey, priorCalls });
    prompts[lensKey] = prompt;
    if (dryRun) continue;

    let response;
    try {
      response = await chatJson({
        messages: prompt,
        temperature: 0.2,
        maxTokens: 400,
        ...llmOptions,
      });
    } catch (err) {
      skipped.push({ lens: lensKey, reason: `llm-error: ${err.message}` });
      continue;
    }
    if (!response.ok) {
      skipped.push({ lens: lensKey, reason: response.reason || 'llm-skipped' });
      continue;
    }
    const judgment = response.data || {};
    challenges.push(normalizeAgentMessage({
      run_id: effectiveRunId,
      thread_id: threadId,
      from_agent: LENSES[lensKey].role,
      to_agent: 'orchestrator',
      message_type: 'challenge',
      topic,
      summary: String(judgment.summary || '(no summary)').slice(0, 240),
      confidence: clamp01(judgment.confidence),
      signal_status: normalizeStatus(judgment.signal_status, judgment.refuted),
      evidence_paths: [],
    }));
  }

  return {
    run_id: effectiveRunId,
    thread_id: threadId,
    topic,
    prompts,
    challenges,
    skipped,
    dry_run: dryRun,
    discrimination_mode,
    prior_calls_count: priorCalls.length,
  };
}

export async function evaluateThesisAdversarially({ verdict, runId, dryRun = true, llmOptions = {}, priorCalls = [] } = {}) {
  const panel = await spawnRefutationPanel({ verdict, runId, dryRun, llmOptions, priorCalls });

  if (dryRun) {
    return {
      ...panel,
      decision: null,
      verdict_survives: null,
      refuted_count: null,
      reason: 'dry-run',
    };
  }

  const observation = normalizeAgentMessage({
    run_id: panel.run_id,
    thread_id: panel.thread_id,
    from_agent: 'Thesis Author',
    to_agent: 'refutation-panel',
    message_type: 'observation',
    topic: panel.topic,
    summary: `Original verdict: ${verdict.verdict} on ${verdict.symbol}${verdict.confidence_pct != null ? ` (confidence ${verdict.confidence_pct}%)` : ''}.`,
    signal_status: 'watch',
    confidence: clamp01((verdict.confidence_pct ?? 50) / 100),
    evidence_paths: verdict.evidence_paths ?? [],
  });

  const messages = [observation, ...panel.challenges];
  const decision = resolveThreadDecision({
    thread_id: panel.thread_id,
    topic: panel.topic,
    messages,
  });

  const refutedCount = panel.challenges.filter(m => isRefutedStatus(m.signal_status)).length;
  const verdictSurvives = refutedCount <= 1 && panel.challenges.length >= 2;
  const insufficientPanel = panel.challenges.length < 2;

  return {
    ...panel,
    decision,
    verdict_survives: insufficientPanel ? null : verdictSurvives,
    refuted_count: refutedCount,
    challenge_count: panel.challenges.length,
    reason: insufficientPanel ? 'insufficient-panel' : (verdictSurvives ? 'quorum-survived' : 'quorum-refuted'),
  };
}

function clamp01(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0.5;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function normalizeStatus(rawStatus, refutedFlag) {
  const status = String(rawStatus || '').toLowerCase();
  const valid = ['clear', 'watch', 'alert', 'critical'];
  if (valid.includes(status)) return status;
  return refutedFlag ? 'alert' : 'watch';
}

function isRefutedStatus(status) {
  return status === 'alert' || status === 'critical';
}
