import assert from 'node:assert/strict';

import { createSignal } from '../lib/signals/base.mjs';

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

await runTest('createSignal returns object with all required Signal fields', () => {
  const signal = createSignal({
    id: 'TEST_SIGNAL',
    name: 'Test Signal',
    domain: 'macro',
    severity: 'watch',
    value: 1.23,
    threshold: 1.0,
    message: 'Test message',
    implications: ['Implication A', 'Implication B'],
    related_domains: ['equities'],
  });

  assert.equal(signal.id, 'TEST_SIGNAL');
  assert.equal(signal.name, 'Test Signal');
  assert.equal(signal.domain, 'macro');
  assert.equal(signal.severity, 'watch');
  assert.equal(signal.value, 1.23);
  assert.equal(signal.threshold, 1.0);
  assert.equal(signal.message, 'Test message');
  assert.deepEqual([...signal.implications], ['Implication A', 'Implication B']);
  assert.deepEqual([...signal.related_domains], ['equities']);
  assert.ok(typeof signal.timestamp === 'string', 'timestamp should be a string');
  assert.ok(signal.timestamp.length > 0, 'timestamp should not be empty');
});

await runTest('createSignal freezes the returned object (immutable)', () => {
  const signal = createSignal({
    id: 'FROZEN_TEST',
    name: 'Frozen Test',
    domain: 'macro',
    severity: 'alert',
    value: 0,
    threshold: 0,
    message: 'Frozen',
    implications: ['A'],
    related_domains: [],
  });

  assert.ok(Object.isFrozen(signal), 'signal object should be frozen');
  assert.ok(Object.isFrozen(signal.implications), 'implications array should be frozen');
  assert.ok(Object.isFrozen(signal.related_domains), 'related_domains array should be frozen');

  // Mutation attempt should silently fail (strict mode would throw in non-frozen strict context)
  assert.throws(
    () => {
      'use strict';
      signal.id = 'MUTATED';
    },
    TypeError,
    'assigning to frozen property should throw in strict mode',
  );
});

await runTest('createSignal handles empty related_domains gracefully', () => {
  const signal = createSignal({
    id: 'NO_RELATED',
    name: 'No Related Domains',
    domain: 'market',
    severity: 'critical',
    value: -1,
    threshold: 0,
    message: 'No related domains',
    implications: ['Watch out'],
    related_domains: [],
  });

  assert.deepEqual([...signal.related_domains], []);
});

await runTest('createSignal timestamp is a valid ISO 8601 string', () => {
  const signal = createSignal({
    id: 'TIMESTAMP_CHECK',
    name: 'Timestamp Check',
    domain: 'macro',
    severity: 'watch',
    value: 0,
    threshold: 0,
    message: 'Checking timestamp',
    implications: [],
    related_domains: [],
  });

  const parsed = new Date(signal.timestamp);
  assert.ok(!isNaN(parsed.getTime()), 'timestamp should parse as a valid date');
});
