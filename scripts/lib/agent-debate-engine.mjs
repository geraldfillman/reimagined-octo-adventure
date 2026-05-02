/**
 * agent-debate-engine.mjs - Deterministic agent-thread reconciliation.
 *
 * Inspired by TradingAgents' analyst/research/risk manager flow, but implemented
 * as a vault-native reducer over AgentMessage records.
 */

import {
  buildAgentThread,
  normalizeAgentMessage,
  worstSignalStatus,
} from './agent-interactions.mjs';

export function groupMessagesByThread(messages = []) {
  const groups = new Map();
  for (const raw of messages) {
    const message = normalizeAgentMessage(raw);
    if (!groups.has(message.thread_id)) groups.set(message.thread_id, []);
    groups.get(message.thread_id).push(message);
  }
  return groups;
}

export function resolveThreadDecision(thread = {}) {
  const messages = (thread.messages || []).map(message => normalizeAgentMessage(message));
  const topic = thread.topic || messages[0]?.topic || 'Agent interaction';
  const rating = worstSignalStatus(messages.map(message => message.signal_status));
  const challenges = messages.filter(message => message.message_type === 'challenge');
  const observations = messages.filter(message => ['observation', 'handoff'].includes(message.message_type));
  const hasActiveObservation = observations.some(message => message.signal_status !== 'clear');
  const conflicting = challenges.length > 0 && (hasActiveObservation || observations.length > 0);
  const onlyChallenges = challenges.length > 0 && observations.length === 0;
  const status = conflicting || onlyChallenges ? 'unresolved' : 'resolved';
  const strongest = pickStrongestMessage(messages);

  return Object.freeze({
    decision_type: status === 'unresolved' ? 'review' : 'decision',
    rating,
    status,
    rationale: buildRationale({ topic, status, challenges, observations, strongest }),
    action_items: buildActionItems({ status, rating, challenges, observations }),
    owner: 'orchestrator',
    due_date: null,
    source_thread_id: thread.thread_id || messages[0]?.thread_id || null,
  });
}

export function buildInteractionThreads({ runId, date, messages = [] } = {}) {
  const groups = groupMessagesByThread(messages);
  const threads = [];

  for (const groupedMessages of groups.values()) {
    const first = groupedMessages[0];
    const shell = {
      run_id: runId || first.run_id,
      date,
      thread_id: first.thread_id,
      topic: first.topic,
      messages: groupedMessages,
    };
    const decision = resolveThreadDecision(shell);
    threads.push(buildAgentThread({ ...shell, decision }));
  }

  return threads.sort((a, b) =>
    statusRank(b.signal_status) - statusRank(a.signal_status) ||
    a.topic.localeCompare(b.topic)
  );
}

function buildRationale({ topic, status, challenges, observations, strongest }) {
  if (status === 'unresolved') {
    const challengeText = challenges.map(message => `${message.from_agent}: ${message.summary}`).slice(0, 2).join(' ');
    const observationText = observations.map(message => `${message.from_agent}: ${message.summary}`).slice(0, 2).join(' ');
    return `Conflicting or incomplete agent reads on ${topic}. ${[observationText, challengeText].filter(Boolean).join(' ')}`.trim();
  }
  if (strongest) {
    return `${strongest.from_agent} provided the strongest current read on ${topic}: ${strongest.summary}`;
  }
  return `No active agent disagreement was detected on ${topic}.`;
}

function buildActionItems({ status, rating, challenges, observations }) {
  if (status === 'unresolved') {
    const owners = [...new Set([...challenges, ...observations].map(message => message.from_agent))].join(', ') || 'specialist agents';
    return [
      `Resolve the ${rating} agent disagreement with ${owners} before promoting the item.`,
      'Open linked evidence notes and verify whether the challenge invalidates the setup.',
      'Keep this as research/manual review only; do not generate broker-write actions.',
    ];
  }
  return [
    `Record the ${rating} interaction decision in the Streamline Report.`,
    'Link the supporting evidence note for operator review.',
    'Keep this as research/manual review only; do not generate broker-write actions.',
  ];
}

function pickStrongestMessage(messages) {
  return [...messages].sort((a, b) =>
    statusRank(b.signal_status) - statusRank(a.signal_status) ||
    Number(b.confidence || 0) - Number(a.confidence || 0)
  )[0] || null;
}

function statusRank(status) {
  return { clear: 0, watch: 1, alert: 2, critical: 3 }[String(status || 'clear').toLowerCase()] ?? 0;
}
