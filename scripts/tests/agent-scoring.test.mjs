/**
 * Tests for agents/marketmind/scoring.mjs - deterministic synthesis.
 */

import assert from 'node:assert/strict';
import { makeAgentSignal } from '../agents/marketmind/schemas.mjs';
import { buildSignalNames, synthesizeDeterministic } from '../agents/marketmind/scoring.mjs';

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

runTest('bullish majority produces bullish verdict', () => {
  const result = synthesizeDeterministic([
    makeAgentSignal({ agent: 'price', signal: 'BULLISH', confidence: 0.8 }),
    makeAgentSignal({ agent: 'fundamentals', signal: 'BULLISH', confidence: 0.7 }),
    makeAgentSignal({ agent: 'macro', signal: 'NEUTRAL', confidence: 0.3 }),
  ]);
  assert.equal(result.final_verdict, 'BULLISH');
  assert.ok(['watch', 'alert'].includes(result.signal_status));
});

runTest('bearish risk plus bearish macro escalates attention', () => {
  const result = synthesizeDeterministic([
    makeAgentSignal({ agent: 'risk', signal: 'BEARISH', confidence: 0.85 }),
    makeAgentSignal({ agent: 'macro', signal: 'BEARISH', confidence: 0.7 }),
    makeAgentSignal({ agent: 'price', signal: 'NEUTRAL', confidence: 0.3 }),
  ]);
  assert.equal(result.final_verdict, 'BEARISH');
  assert.ok(['alert', 'critical'].includes(result.signal_status));
});

runTest('opposing strong layers reduce confidence', () => {
  const result = synthesizeDeterministic([
    makeAgentSignal({ agent: 'price', signal: 'BULLISH', confidence: 0.9 }),
    makeAgentSignal({ agent: 'risk', signal: 'BEARISH', confidence: 0.9 }),
  ]);
  assert.ok(result.disagreement > 0);
  assert.ok(result.final_confidence < 0.7);
});

runTest('failed neutral agents do not force a directional verdict', () => {
  const result = synthesizeDeterministic([
    makeAgentSignal({ agent: 'price', signal: 'NEUTRAL', confidence: 0, warnings: ['failed'] }),
    makeAgentSignal({ agent: 'risk', signal: 'NEUTRAL', confidence: 0, warnings: ['failed'] }),
  ]);
  assert.equal(result.final_verdict, 'NEUTRAL');
  assert.equal(result.signal_status, 'clear');
});

runTest('buildSignalNames emits only directional agent signals', () => {
  const names = buildSignalNames([
    makeAgentSignal({ agent: 'price', signal: 'BULLISH', confidence: 0.8 }),
    makeAgentSignal({ agent: 'macro', signal: 'NEUTRAL', confidence: 0.3 }),
    makeAgentSignal({ agent: 'prediction_market', signal: 'BEARISH', confidence: 0.5 }),
  ]);
  assert.deepEqual(names, ['AGENT_PRICE_BULLISH', 'AGENT_PREDICTION_MARKET_BEARISH']);
});
