import assert from 'node:assert/strict';

import { normalizeAgentMessage } from '../lib/agent-interactions.mjs';
import {
  buildInteractionThreads,
  groupMessagesByThread,
  resolveThreadDecision,
} from '../lib/agent-debate-engine.mjs';

function runTest(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

runTest('groups messages with the same topic into one thread', () => {
  const messages = [
    normalizeAgentMessage({
      run_id: 'orchestrator-daily-2026-05-02',
      from_agent: 'market',
      message_type: 'observation',
      topic: 'SPY',
      summary: 'Market read is bullish.',
      signal_status: 'watch',
    }),
    normalizeAgentMessage({
      run_id: 'orchestrator-daily-2026-05-02',
      from_agent: 'macro',
      message_type: 'challenge',
      topic: 'SPY',
      summary: 'Macro regime challenges the setup.',
      signal_status: 'watch',
    }),
  ];

  const groups = groupMessagesByThread(messages);
  assert.equal(groups.size, 1);
  assert.equal([...groups.values()][0].length, 2);
});

runTest('marks conflicting observation and challenge thread unresolved', () => {
  const decision = resolveThreadDecision({
    topic: 'SPY',
    messages: [
      normalizeAgentMessage({
        run_id: 'orchestrator-daily-2026-05-02',
        from_agent: 'market',
        message_type: 'observation',
        topic: 'SPY',
        summary: 'Market read is bullish.',
        signal_status: 'alert',
      }),
      normalizeAgentMessage({
        run_id: 'orchestrator-daily-2026-05-02',
        from_agent: 'risk',
        message_type: 'challenge',
        topic: 'SPY',
        summary: 'Risk layer pushes back.',
        signal_status: 'watch',
      }),
    ],
  });

  assert.equal(decision.status, 'unresolved');
  assert.equal(decision.decision_type, 'review');
  assert.equal(decision.rating, 'alert');
  assert.ok(decision.action_items.some(item => item.includes('Resolve')));
});

runTest('resolves one-sided active thread into orchestrator decision', () => {
  const decision = resolveThreadDecision({
    topic: 'FEMA spike',
    messages: [
      normalizeAgentMessage({
        run_id: 'orchestrator-daily-2026-05-02',
        from_agent: 'government',
        message_type: 'observation',
        topic: 'FEMA spike',
        summary: 'Government pull raised a watch signal.',
        signal_status: 'watch',
      }),
    ],
  });

  assert.equal(decision.status, 'resolved');
  assert.equal(decision.rating, 'watch');
  assert.match(decision.rationale, /Government pull/);
});

runTest('builds thread objects from normalized messages', () => {
  const threads = buildInteractionThreads({
    runId: 'orchestrator-daily-2026-05-02',
    date: '2026-05-02',
    messages: [
      normalizeAgentMessage({
        run_id: 'orchestrator-daily-2026-05-02',
        from_agent: 'market',
        message_type: 'observation',
        topic: 'SPY',
        summary: 'Market read is bearish.',
        signal_status: 'alert',
      }),
    ],
  });

  assert.equal(threads.length, 1);
  assert.equal(threads[0].decision.owner, 'orchestrator');
  assert.equal(threads[0].participants[0], 'market');
});
