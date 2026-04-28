/**
 * Shared agent result schema helpers for the MarketMind agent system.
 */

export const AGENT_SIGNAL_VALUES = Object.freeze(['BULLISH', 'BEARISH', 'NEUTRAL']);
export const VAULT_SIGNAL_STATUSES = Object.freeze(['clear', 'watch', 'alert', 'critical']);

export function makeAgentSignal({
  agent,
  signal = 'NEUTRAL',
  confidence = 0,
  summary = '',
  raw_data = {},
  evidence = [],
  warnings = [],
  duration_ms = 0,
} = {}) {
  return Object.freeze({
    agent: String(agent || 'unknown'),
    signal: normalizeAgentSignal(signal),
    confidence: clamp(Number(confidence) || 0, 0, 1),
    summary: String(summary || '').slice(0, 280),
    raw_data: raw_data && typeof raw_data === 'object' ? raw_data : {},
    evidence: normalizeStringArray(evidence, 12),
    warnings: normalizeStringArray(warnings, 8),
    duration_ms: Math.max(0, Math.round(Number(duration_ms) || 0)),
  });
}

export function failedAgentSignal(agent, error, durationMs = 0) {
  return makeAgentSignal({
    agent,
    signal: 'NEUTRAL',
    confidence: 0,
    summary: `${agent} agent failed: ${String(error?.message || error || 'unknown error').slice(0, 120)}`,
    raw_data: {},
    warnings: [String(error?.message || error || 'unknown error').slice(0, 240)],
    duration_ms: durationMs,
  });
}

export async function runTimedAgent(agent, fn) {
  const started = Date.now();
  try {
    const result = await fn();
    return makeAgentSignal({
      ...result,
      agent: result?.agent || agent,
      duration_ms: Date.now() - started,
    });
  } catch (error) {
    return failedAgentSignal(agent, error, Date.now() - started);
  }
}

export function normalizeAgentSignal(signal) {
  const normalized = String(signal || '').trim().toUpperCase();
  return AGENT_SIGNAL_VALUES.includes(normalized) ? normalized : 'NEUTRAL';
}

export function signalDirection(signal) {
  const normalized = normalizeAgentSignal(signal);
  if (normalized === 'BULLISH') return 1;
  if (normalized === 'BEARISH') return -1;
  return 0;
}

export function clamp(value, min = 0, max = 1) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export function classifyDirectionalScore(score, deadband = 0.35) {
  if (score >= deadband) return 'BULLISH';
  if (score <= -deadband) return 'BEARISH';
  return 'NEUTRAL';
}

export function confidenceFromScore(score, { base = 0.25, scale = 0.16, max = 0.88 } = {}) {
  return clamp(base + Math.abs(score) * scale, 0, max);
}

function normalizeStringArray(values, limit) {
  if (!Array.isArray(values)) return [];
  return values
    .map(value => String(value || '').trim())
    .filter(Boolean)
    .slice(0, limit);
}
