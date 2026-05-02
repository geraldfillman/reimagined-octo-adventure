import assert from 'node:assert/strict';

import { firmMarkerFor, scorePositioningSignal } from '../lib/positioning-scorer.mjs';

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

runTest('institutional accumulation plus retail neglect becomes strong watchlist when confirmed', () => {
  const result = scorePositioningSignal({
    asset: 'XOM',
    institutional: { direction: 'accumulating', strength: 2, sources: ['13F', 'insider buy'] },
    retail: { direction: 'neglect', strength: 2, sources: ['reddit quiet'] },
    macro: { direction: 'supportive', strength: 1, sources: ['COT'] },
    options: { direction: 'supportive', strength: 1, sources: ['options chain'] },
    price: { direction: 'supportive', strength: 1, sources: ['technical snapshot'] },
    strategy: { matched: true, strength: 2, name: 'Commodity Ladder Strategy' },
  });

  assert.equal(result.score, 9);
  assert.equal(result.confidence, 'High');
  assert.equal(result.action_classification, 'Needs confirmation');
  assert.equal(result.confirmation_count, 6);
});

runTest('fewer than three confirmations forces watchlist only', () => {
  const result = scorePositioningSignal({
    asset: 'ABC',
    institutional: { direction: 'accumulating', strength: 2, sources: ['13F'] },
    retail: { direction: 'unknown', strength: 0, sources: [] },
    macro: { direction: 'unknown', strength: 0, sources: [] },
    options: { direction: 'unknown', strength: 0, sources: [] },
    price: { direction: 'unknown', strength: 0, sources: [] },
    strategy: { matched: false, strength: 0 },
  });

  assert.equal(result.action_classification, 'Watchlist only');
  assert.equal(result.confidence, 'Low');
  assert.ok(result.risks.some(risk => /fewer than three/i.test(risk)));
});

runTest('market maker evidence lowers confidence when treated as directional', () => {
  const marker = firmMarkerFor('Jane Street');
  const result = scorePositioningSignal({
    asset: 'QQQ',
    institutional: { direction: 'accumulating', strength: 2, sources: ['ETF activity'], firms: ['Jane Street'] },
    retail: { direction: 'buying', strength: 1, sources: ['reddit'] },
    macro: { direction: 'unknown', strength: 0, sources: [] },
    options: { direction: 'supportive', strength: 1, sources: ['options'] },
    price: { direction: 'supportive', strength: 1, sources: ['price'] },
    strategy: { matched: true, strength: 1, name: 'SPY QQQ Entropy Expansion Monitor' },
  });

  assert.equal(marker.primary_marker, 'MARKET_MAKER_PROP');
  assert.equal(result.confidence, 'Medium');
  assert.ok(result.firm_markers[0].do_not_overread.includes('directional conviction'));
});
