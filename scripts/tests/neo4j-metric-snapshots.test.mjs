import assert from 'node:assert/strict';

import {
  buildDataPullMeta,
  buildDryRunPlan,
  buildWriteMetricSnapshotsCypher,
  normalizeCadence,
  quoteToMetricSnapshots,
} from '../lib/neo4j-metric-snapshots.mjs';

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

runTest('normalizes metric snapshot cadence names', () => {
  assert.equal(normalizeCadence('EOD'), 'eod');
  assert.equal(normalizeCadence('bod'), 'bod');
  assert.throws(() => normalizeCadence('weekly'), /Unsupported Neo4j metric cadence/);
});

runTest('builds deterministic DataPull metadata for rerunnable cadence batches', () => {
  const meta = buildDataPullMeta({
    cadence: 'eod',
    asOfDate: '2026-06-01',
    datePulled: '2026-06-01T21:30:00.000Z',
  });

  assert.equal(meta.id, 'datapull:financial_modeling_prep:quote_close:eod:2026-06-01');
  assert.equal(meta.provider, 'financial_modeling_prep');
  assert.equal(meta.source, 'fmp_quote');
  assert.equal(meta.dataType, 'quote_close');
  assert.equal(meta.frequency, 'eod');
  assert.equal(meta.asOfDate, '2026-06-01');
  assert.equal(meta.datePulled, '2026-06-01T21:30:00.000Z');
  assert.equal(meta.status, 'ok');
});

runTest('maps FMP quote payloads to snake_case native-unit EOD metrics', () => {
  const metrics = quoteToMetricSnapshots({
    price: 201.25,
    volume: 1000,
    marketCap: 3000000000,
    pe: 22.3,
    eps: 9.02,
    changesPercentage: -1.25,
  }, { cadence: 'eod', asof: '2026-06-01T21:30:00.000Z' });

  assert.deepEqual(metrics.map(metric => metric.metric_name), [
    'price_close',
    'volume',
    'market_cap',
    'pe_ratio',
    'eps',
    'day_change_pct',
  ]);
  assert.ok(metrics.every(metric => metric.asof === '2026-06-01T21:30:00.000Z'));
  assert.equal(metrics.find(metric => metric.metric_name === 'volume').unit, 'sh');
  assert.equal(metrics.find(metric => metric.metric_name === 'pe_ratio').unit, 'x');
});

runTest('maps BOD quote payloads to premarket-prefixed metrics', () => {
  const metrics = quoteToMetricSnapshots({
    price: 202.5,
    volume: 250,
    changesPercentage: 0.8,
  }, { cadence: 'bod', asof: '2026-06-01T12:30:00.000Z' });

  assert.deepEqual(metrics.map(metric => metric.metric_name), [
    'price_premarket',
    'premarket_volume',
    'premarket_change_pct',
  ]);
});

runTest('builds write Cypher with datetime asof and latest-property guard', () => {
  const cypher = buildWriteMetricSnapshotsCypher({ label: 'Stock', key: 'ticker' });

  assert.match(cypher, /MATCH \(t:`Stock` \{ ticker: \$keyValue \}\)/);
  assert.match(cypher, /asof: datetime\(row\.asof\)/);
  assert.match(cypher, /latest_/);
  assert.match(cypher, /PRODUCED/);
  assert.match(cypher, /OBSERVES/);
});

runTest('builds a dry-run plan without FMP or Neo4j calls', () => {
  const plan = buildDryRunPlan({
    tickers: 'AAPL, MSFT',
    cadence: 'eod',
    asOfDate: '2026-06-01',
    datePulled: '2026-06-01T21:30:00.000Z',
  });

  assert.equal(plan.dryRun, true);
  assert.equal(plan.dataPull.id, 'datapull:financial_modeling_prep:quote_close:eod:2026-06-01');
  assert.deepEqual(plan.targets.map(target => target.keyValue), ['AAPL', 'MSFT']);
  assert.ok(plan.targets.every(target => target.label === 'Stock'));
});
