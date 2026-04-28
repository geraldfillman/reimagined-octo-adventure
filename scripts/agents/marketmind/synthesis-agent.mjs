import { chatJson } from '../../lib/llm-client.mjs';
import { clamp } from './schemas.mjs';

const VALID_VERDICTS = new Set(['BULLISH', 'BEARISH', 'NEUTRAL']);
const VALID_STATUSES = new Set(['clear', 'watch', 'alert', 'critical']);

export async function synthesizeWithLlm({ state, agentSignals, deterministic }) {
  const payload = {
    target: {
      symbol: state.symbol,
      asset_type: state.asset_type,
      thesis_name: state.thesis_name,
    },
    deterministic,
    agent_signals: agentSignals.map(signal => ({
      agent: signal.agent,
      signal: signal.signal,
      confidence: signal.confidence,
      summary: signal.summary,
      evidence: signal.evidence,
      warnings: signal.warnings,
      raw_data: signal.raw_data,
    })),
  };

  const result = await chatJson({
    messages: [
      {
        role: 'system',
        content: [
          'You are a market research synthesis agent.',
          'Use only the provided structured agent outputs.',
          'Return valid JSON only.',
          'signal_status means operator attention: clear, watch, alert, or critical.',
          'Do not give trade instructions.',
        ].join(' '),
      },
      {
        role: 'user',
        content: [
          'Synthesize this multi-agent market read.',
          'Return exactly these keys: final_verdict, final_confidence, signal_status, reasoning, top_drivers, top_risks, follow_up_actions.',
          'final_verdict must be BULLISH, BEARISH, or NEUTRAL. final_confidence is 0 to 1.',
          JSON.stringify(payload),
        ].join('\n'),
      },
    ],
  });

  if (!result.ok) return null;
  return normalizeLlmSynthesis(result.data, result);
}

function normalizeLlmSynthesis(data, result) {
  const finalVerdict = String(data.final_verdict || '').toUpperCase();
  const status = String(data.signal_status || '').toLowerCase();
  if (!VALID_VERDICTS.has(finalVerdict)) throw new Error(`Invalid LLM final_verdict: ${data.final_verdict}`);
  if (!VALID_STATUSES.has(status)) throw new Error(`Invalid LLM signal_status: ${data.signal_status}`);

  return Object.freeze({
    final_verdict: finalVerdict,
    final_confidence: Number(clamp(Number(data.final_confidence) || 0, 0, 1).toFixed(2)),
    signal_status: status,
    reasoning: String(data.reasoning || '').slice(0, 600),
    top_drivers: normalizeArray(data.top_drivers, 5),
    top_risks: normalizeArray(data.top_risks, 5),
    follow_up_actions: normalizeArray(data.follow_up_actions, 6),
    llm_provider: result.provider,
    llm_model: result.model,
  });
}

function normalizeArray(value, limit) {
  return (Array.isArray(value) ? value : [])
    .map(item => String(item || '').trim())
    .filter(Boolean)
    .slice(0, limit);
}
