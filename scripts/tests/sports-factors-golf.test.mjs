/**
 * Tests for lib/sports/factors/golf.mjs - per-sport factor declarations.
 *
 * Pure: no I/O. Stubbed events only.
 */

import assert from 'node:assert/strict';
import { factors, SPORT } from '../lib/sports/factors/golf.mjs';
import { validateFactor, buildRegistry } from '../lib/sports/factor-registry.mjs';

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

// ── 1. Smoke ────────────────────────────────────────────────────────────────

runTest('golf: SPORT key is "golf"', () => {
  assert.equal(SPORT, 'golf');
});

runTest('golf: factors array is non-empty and frozen', () => {
  assert.ok(Array.isArray(factors));
  assert.ok(factors.length > 0);
  assert.ok(Object.isFrozen(factors));
});

runTest('golf: every factor has sport === "golf"', () => {
  for (const f of factors) {
    assert.equal(f.sport, 'golf', `factor ${f.id} has wrong sport`);
  }
});

// ── 2. Validity ─────────────────────────────────────────────────────────────

runTest('golf: every factor passes validateFactor', () => {
  for (const f of factors) {
    assert.doesNotThrow(() => validateFactor(f), `validateFactor failed for ${f.id}`);
  }
});

runTest('golf: buildRegistry succeeds on the full factor list', () => {
  const registry = buildRegistry([...factors]);
  assert.equal(registry.factors.length, factors.length);
  assert.equal(registry.bySport('golf').length, factors.length);
});

// ── 3. Defensive: extract returns null on {} ────────────────────────────────

runTest('golf: every extract returns null on empty event', () => {
  for (const f of factors) {
    const v = f.extract({});
    assert.equal(v, null, `factor ${f.id} returned ${v} on empty event, expected null`);
  }
});

runTest('golf: every extract returns null on empty event with history arg', () => {
  for (const f of factors) {
    const v = f.extract({}, {});
    assert.equal(v, null, `factor ${f.id} returned ${v}`);
  }
});

// ── 4. Realistic event ──────────────────────────────────────────────────────

const REALISTIC_EVENT = Object.freeze({
  playerId: 'scotty',
  sgTotal30d: 1.6,
  sgOffTee30d: 0.7,
  sgApproach30d: 1.2,
  sgPutting30d: 0.4,
  courseFitScore: 0.9,
  cutsMadePct10: 0.8,
  fieldStrengthAvgSg: 75,
  weatherWindAvgMph: 12,
  worldRanking: 4,
});

runTest('golf: ≥80% of factors return numeric value within range on realistic event', () => {
  let withinRange = 0;
  for (const f of factors) {
    const v = f.extract(REALISTIC_EVENT);
    if (typeof v === 'number' && Number.isFinite(v)) {
      const [min, max] = f.range;
      if (v >= min && v <= max) {
        withinRange += 1;
      } else {
        throw new Error(`factor ${f.id} returned ${v} outside [${min}, ${max}]`);
      }
    }
  }
  const ratio = withinRange / factors.length;
  assert.ok(ratio >= 0.8, `expected ≥80% coverage, got ${ratio.toFixed(2)}`);
});

runTest('golf: sg_total clamps an absurd input back into range', () => {
  const f = factors.find((x) => x.id === 'golf_sg_total_30d');
  assert.ok(f);
  assert.equal(f.extract({ sgTotal30d: 999 }), 3);
  assert.equal(f.extract({ sgTotal30d: -999 }), -3);
});

runTest('golf: course-fit factor has scope event (field-level), sg_total has scope player', () => {
  const fit = factors.find((x) => x.id === 'golf_course_fit_score');
  const sg = factors.find((x) => x.id === 'golf_sg_total_30d');
  assert.equal(fit.scope, 'event');
  assert.equal(sg.scope, 'player');
});

// ── 5. ID uniqueness + sport prefix ─────────────────────────────────────────

runTest('golf: factor IDs are unique', () => {
  const ids = new Set();
  for (const f of factors) {
    assert.ok(!ids.has(f.id), `duplicate id ${f.id}`);
    ids.add(f.id);
  }
});

runTest('golf: every factor id is sport-prefixed (golf_*)', () => {
  for (const f of factors) {
    assert.ok(f.id.startsWith('golf_'), `factor ${f.id} missing golf_ prefix`);
  }
});
