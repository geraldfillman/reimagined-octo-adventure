/**
 * Tests for the price-trigger layer (framework §9.4 vault extension).
 * Pure-function coverage only — no network, no writes.
 * Run: node scripts/tests/edgar-triggers.test.mjs
 */

import assert from 'node:assert/strict';

import {
  computeDefaultTriggers,
  classifyTriggerState,
  latestClose,
  upsertPriceTriggerFields,
} from '../lib/price-triggers.mjs';

let failures = 0;
function runTest(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (err) {
    failures++;
    console.error(`not ok - ${name}`);
    console.error(`  ${err.message}`);
  }
}

runTest('default band is −20% / +25% around the review price', () => {
  assert.deepEqual({ ...computeDefaultTriggers(100) }, { low: 80, high: 125 });
  assert.deepEqual({ ...computeDefaultTriggers(37.33) }, { low: 29.86, high: 46.66 });
  assert.deepEqual({ ...computeDefaultTriggers(100, { downPct: 30, upPct: 50 }) }, { low: 70, high: 150 });
});

runTest('bad prices produce no band, not a fabricated one', () => {
  assert.equal(computeDefaultTriggers(0), null);
  assert.equal(computeDefaultTriggers(-5), null);
  assert.equal(computeDefaultTriggers('n/a'), null);
  assert.equal(computeDefaultTriggers(null), null);
});

runTest('trigger state classification covers both breaches and the band', () => {
  assert.equal(classifyTriggerState(79, 80, 125), 'below-low');
  assert.equal(classifyTriggerState(80, 80, 125), 'below-low');   // touching counts
  assert.equal(classifyTriggerState(126, 80, 125), 'above-high');
  assert.equal(classifyTriggerState(100, 80, 125), 'within');
  assert.equal(classifyTriggerState(100, null, null), null);      // no band → no state
  assert.equal(classifyTriggerState(70, 80, null), 'below-low');  // one-sided band works
  assert.equal(classifyTriggerState(null, 80, 125), null);        // no price → explicit gap
});

runTest('latestClose takes the newest valid close and skips nulls', () => {
  assert.equal(latestClose([{ close: 10 }, { close: 11 }, { close: null }]), 11);
  assert.equal(latestClose([{ close: 10 }]), 10);
  assert.equal(latestClose([]), null);
  assert.equal(latestClose(null), null);
});

const NOTE = `---
node_type: "health_review"
ticker: "TST"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_TST]]"
related_theses: []
tags: [health-review]
---

# Body stays untouched
`;

runTest('upsert inserts the trigger block after markers_pull', () => {
  const next = upsertPriceTriggerFields(NOTE, { price: 100, low: 80, high: 125 });
  assert.match(next, /markers_pull: "\[\[05_Data_Pulls\/Edgar\/2026-08-02_EDGAR_Health_TST\]\]"\nprice_at_review: 100\nreconsider_price_low: 80\nreconsider_price_high: 125\nrelated_theses: \[\]/);
  assert.match(next, /# Body stays untouched/);
});

runTest('upsert is idempotent — re-running replaces, never duplicates', () => {
  const once = upsertPriceTriggerFields(NOTE, { price: 100, low: 80, high: 125 });
  const twice = upsertPriceTriggerFields(once, { price: 110, low: 88, high: 137.5 });
  assert.equal((twice.match(/price_at_review:/g) || []).length, 1);
  assert.match(twice, /price_at_review: 110/);
  assert.doesNotMatch(twice, /price_at_review: 100/);
});

runTest('upsert refuses notes without an anchor instead of guessing', () => {
  assert.equal(upsertPriceTriggerFields('---\nticker: "X"\n---\nbody', { price: 1, low: 1, high: 1 }), null);
  assert.equal(upsertPriceTriggerFields('no frontmatter at all', { price: 1, low: 1, high: 1 }), null);
});

if (failures > 0) {
  process.exitCode = 1;
  console.error(`\n${failures} test(s) failed`);
} else {
  console.log('\nall tests passed');
}
