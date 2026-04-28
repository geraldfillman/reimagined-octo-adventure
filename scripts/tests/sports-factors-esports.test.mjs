/**
 * Tests for lib/sports/factors/esports.mjs. Pure: no I/O.
 */

import assert from 'node:assert/strict';
import { factors, SPORT } from '../lib/sports/factors/esports.mjs';
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

// ── 1. smoke ────────────────────────────────────────────────────────────────
runTest('esports: factors is non-empty and frozen', () => {
  assert.ok(Array.isArray(factors));
  assert.ok(factors.length > 0);
  assert.ok(Object.isFrozen(factors));
});

runTest('esports: every factor has sport=esports', () => {
  for (const f of factors) {
    assert.equal(f.sport, 'esports');
  }
  assert.equal(SPORT, 'esports');
});

// ── 2. validity ─────────────────────────────────────────────────────────────
runTest('esports: every factor passes validateFactor', () => {
  for (const f of factors) {
    assert.doesNotThrow(() => validateFactor(f), `validateFactor failed for ${f.id}`);
  }
});

// ── 3. defensive ────────────────────────────────────────────────────────────
runTest('esports: every extract returns null on empty event', () => {
  for (const f of factors) {
    const v = f.extract({});
    assert.equal(v, null, `factor ${f.id} should return null, got ${v}`);
  }
});

// ── 4. realistic event ──────────────────────────────────────────────────────
runTest('esports: realistic LAN playoff event yields >=80% in-range coverage', () => {
  const event = {
    matchDate: '2026-04-27',
    patchReleaseDate: '2026-04-01',
    homeMapWinrate30d: 0.62,
    awayMapWinrate30d: 0.48,
    homeOverallWinrate30d: 0.58,
    awayOverallWinrate30d: 0.51,
    sidePickAdvantage: 0.03,
    isLan: true,
    homeLanEdge: 0.4,
    recentRosterChangeSide: 'away',
    h2hHomeWinrate12m: 0.58,
    isPlayoff: true,
  };
  let withValue = 0;
  for (const f of factors) {
    const v = f.extract(event);
    if (typeof v === 'number' && Number.isFinite(v)) {
      const [lo, hi] = f.range;
      assert.ok(v >= lo && v <= hi, `factor ${f.id} value ${v} outside [${lo},${hi}]`);
      withValue += 1;
    }
  }
  const ratio = withValue / factors.length;
  assert.ok(ratio >= 0.8, `expected >=80% coverage, got ${(ratio * 100).toFixed(1)}%`);
});

runTest('esports: patch_stable flips on the 14-day boundary', () => {
  const f = factors.find((x) => x.id === 'esports_patch_stable_indicator');
  assert.ok(f);
  assert.equal(f.extract({ matchDate: '2026-04-27', patchReleaseDate: '2026-04-13' }), 1, '14d → stable');
  assert.equal(f.extract({ matchDate: '2026-04-27', patchReleaseDate: '2026-04-20' }), 0, '7d → not stable');
});

// ── 5. registry & uniqueness ────────────────────────────────────────────────
runTest('esports: ids unique and esports-prefixed', () => {
  const seen = new Set();
  for (const f of factors) {
    assert.ok(!seen.has(f.id));
    seen.add(f.id);
    assert.ok(f.id.startsWith('esports_'));
  }
});

runTest('esports: buildRegistry succeeds', () => {
  const registry = buildRegistry([...factors]);
  assert.equal(registry.factors.length, factors.length);
  assert.equal(registry.bySport('esports').length, factors.length);
});
