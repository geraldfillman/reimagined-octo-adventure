import assert from 'node:assert/strict';

import {
  buildFinraPositioningNote,
  buildFinraQueryRequest,
  buildSetupRequiredPayload,
  redactFinraSecrets,
  resolveDatasetDescriptors,
  shouldWriteArtifacts,
} from '../pullers/finra-positioning.mjs';

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

runTest('dataset selector defaults to the full market-structure bundle', () => {
  const descriptors = resolveDatasetDescriptors({});
  const slugs = descriptors.map(descriptor => descriptor.slug);

  assert.deepEqual(slugs, ['short-interest', 'short-sale-volume', 'threshold-list', 'otc-weekly']);
});

runTest('dataset selector accepts comma-separated subsets', () => {
  const descriptors = resolveDatasetDescriptors({ datasets: 'short-interest,otc-weekly' });
  const slugs = descriptors.map(descriptor => descriptor.slug);

  assert.deepEqual(slugs, ['short-interest', 'otc-weekly']);
});

runTest('unknown dataset selector gives a useful error', () => {
  assert.throws(
    () => resolveDatasetDescriptors({ datasets: 'bogus' }),
    /Unknown FINRA dataset "bogus"/
  );
});

runTest('FINRA query request targets dataset endpoint with bearer auth and JSON accept', () => {
  const [descriptor] = resolveDatasetDescriptors({ datasets: 'short-sale-volume' });
  const request = buildFinraQueryRequest({
    descriptor,
    token: 'access-token',
    limit: 10,
    symbols: ['SPY'],
  });

  assert.equal(request.url, 'https://api.finra.org/data/group/otcMarket/name/regShoDaily');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.headers.Authorization, 'Bearer access-token');
  assert.equal(request.options.headers.Accept, 'application/json');
  assert.equal(request.options.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(request.options.body), {
    limit: 10,
    fields: [
      'tradeReportDate',
      'securitiesInformationProcessorSymbolIdentifier',
      'shortParQuantity',
      'shortExemptParQuantity',
      'totalParQuantity',
      'marketCode',
    ],
    compareFilters: [
      {
        compareType: 'equal',
        fieldName: 'securitiesInformationProcessorSymbolIdentifier',
        fieldValue: 'SPY',
      },
    ],
  });
});

runTest('FINRA request applies date and default descriptor filters', () => {
  const [descriptor] = resolveDatasetDescriptors({ datasets: 'threshold-list' });
  const request = buildFinraQueryRequest({
    descriptor,
    token: 'access-token',
    limit: 5,
    date: '2026-05-26',
  });

  assert.deepEqual(JSON.parse(request.options.body).compareFilters, [
    {
      compareType: 'equal',
      fieldName: 'regShoThresholdFlag',
      fieldValue: 'Y',
    },
    {
      compareType: 'equal',
      fieldName: 'tradeDate',
      fieldValue: '2026-05-26',
    },
  ]);
});

runTest('redacts FINRA client id, secret, bearer token, and basic auth token', () => {
  const redacted = redactFinraSecrets(
    'client-id client-secret Bearer access-token Basic basic-token',
    {
      clientId: 'client-id',
      clientSecret: 'client-secret',
      token: 'access-token',
      basicToken: 'basic-token',
    }
  );

  assert.equal(redacted.includes('client-id'), false);
  assert.equal(redacted.includes('client-secret'), false);
  assert.equal(redacted.includes('access-token'), false);
  assert.equal(redacted.includes('basic-token'), false);
  assert.match(redacted, /REDACTED/);
});

runTest('missing credentials payload preserves setup-required behavior', () => {
  const payload = buildSetupRequiredPayload({ date: '2026-05-26' });

  assert.equal(payload.date, '2026-05-26');
  assert.equal(payload.status, 'manual/API setup required');
  assert.equal(payload.availability[0].source, 'FINRA Query API');
  assert.match(payload.availability[0].notes, /FINRA_CLIENT_ID/);
});

runTest('FINRA positioning note has required pull-note frontmatter fields', () => {
  const note = buildFinraPositioningNote({
    date: '2026-05-26',
    datasets: [
      {
        slug: 'short-sale-volume',
        name: 'Reg SHO Daily Short Sale Volume',
        ok: true,
        records: [
          {
            tradeReportDate: '2026-05-26',
            securitiesInformationProcessorSymbolIdentifier: 'SPY',
            shortParQuantity: 100,
            totalParQuantity: 400,
          },
        ],
      },
    ],
    warnings: [],
  });

  assert.match(note, /title:/);
  assert.match(note, /source:/);
  assert.match(note, /date_pulled: "?2026-05-26"?/);
  assert.match(note, /domain: "?positioning"?/);
  assert.match(note, /data_type: "?finra_positioning"?/);
  assert.match(note, /signal_status: "?clear"?/);
  assert.match(note, /Reg SHO Daily Short Sale Volume/);
});

runTest('FINRA dry-run suppresses artifact writes', () => {
  assert.equal(shouldWriteArtifacts({ 'dry-run': true }), false);
  assert.equal(shouldWriteArtifacts({}), true);
});
