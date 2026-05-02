import assert from 'node:assert/strict';

import {
  buildAgentThread,
  messageFromLedgerEntry,
  normalizeAgentMessage,
  renderAgentThreadNote,
} from '../lib/agent-interactions.mjs';

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

runTest('normalizes a valid agent message', () => {
  const message = normalizeAgentMessage({
    run_id: 'orchestrator-daily-2026-05-02',
    from_agent: 'market',
    to_agent: 'orchestrator',
    message_type: 'observation',
    topic: 'SPY technical risk',
    summary: 'Price agent turned bearish.',
    evidence_paths: ['05_Data_Pulls/Market/2026-05-02_Agent_Analysis_SPY.md'],
    confidence: 0.73,
    signal_status: 'alert',
    created_at: '2026-05-02T13:00:00.000Z',
  });

  assert.equal(message.thread_id, 'orchestrator-daily-2026-05-02_spy-technical-risk');
  assert.equal(message.confidence, 0.73);
  assert.deepEqual(message.evidence_paths, ['05_Data_Pulls/Market/2026-05-02_Agent_Analysis_SPY.md']);
});

runTest('rejects invalid message status', () => {
  assert.throws(() => normalizeAgentMessage({
    run_id: 'run-1',
    from_agent: 'market',
    message_type: 'observation',
    topic: 'SPY',
    summary: 'bad status',
    signal_status: 'loud',
  }), /Invalid signal_status/);
});

runTest('converts failed ledger entry into challenge message', () => {
  const message = messageFromLedgerEntry({
    agent_id: 'macro',
    agent_name: 'Macro Agent',
    puller: 'fred',
    status: 'failed',
    artifact: null,
    signal_status: 'clear',
    confidence: null,
    blocking_issues: [],
    handoff_to: ['orchestrator'],
    error: 'FRED timeout',
    recorded_at: '2026-05-02T13:00:00.000Z',
  }, { runId: 'orchestrator-daily-2026-05-02' });

  assert.equal(message.message_type, 'challenge');
  assert.equal(message.signal_status, 'watch');
  assert.equal(message.from_agent, 'macro');
  assert.match(message.summary, /failed/);
});

runTest('renders agent thread as a valid pull note', () => {
  const thread = buildAgentThread({
    run_id: 'orchestrator-daily-2026-05-02',
    date: '2026-05-02',
    topic: 'SPY technical risk',
    messages: [
      normalizeAgentMessage({
        run_id: 'orchestrator-daily-2026-05-02',
        from_agent: 'market',
        message_type: 'observation',
        topic: 'SPY technical risk',
        summary: 'Price and risk agents are bearish.',
        signal_status: 'alert',
      }),
    ],
    decision: {
      decision_type: 'review',
      rating: 'alert',
      status: 'resolved',
      rationale: 'One active market alert requires review.',
      action_items: ['Review the linked market note.'],
      owner: 'orchestrator',
    },
  });

  const note = renderAgentThreadNote(thread);
  assert.match(note, /data_type: "agent_thread"/);
  assert.match(note, /## Agent Messages/);
  assert.match(note, /SPY technical risk/);
});
