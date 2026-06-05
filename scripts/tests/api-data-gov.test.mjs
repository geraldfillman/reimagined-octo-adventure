import assert from 'node:assert/strict';

import {
  buildApiDataGovRequest,
  explainApiDataGovError,
  redactApiDataGovSecrets,
} from '../lib/api-data-gov.mjs';
import {
  buildAgencyList,
  buildConsolidatedNote,
  getAgencyRegistry,
  resolveAgencyRuns,
} from '../pullers/api-data-gov.mjs';

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

const REQUIRED_AGENCIES = [
  'usda',
  'commerce',
  'education',
  'justice',
  'treasury',
  'eia',
  'epa',
  'fcc',
  'fdic',
  'fec',
  'ftc',
  'fda',
  'gsa',
  'gpo',
  'loc',
  'nasa',
  'nih',
  'nps',
  'nrel',
  'smithsonian',
  'usgs',
];

runTest('header auth sends DATA_GOV_API_KEY as X-Api-Key', () => {
  const request = buildApiDataGovRequest({
    url: 'https://api.nasa.gov/planetary/apod',
    apiKey: 'secret-key',
    auth: 'header',
    params: { count: 1 },
  });

  assert.equal(request.url, 'https://api.nasa.gov/planetary/apod?count=1');
  assert.equal(request.options.headers['X-Api-Key'], 'secret-key');
  assert.equal(request.options.headers['User-Agent'], undefined);
});

runTest('query auth appends api_key only for query-auth endpoints', () => {
  const request = buildApiDataGovRequest({
    url: 'https://api.nasa.gov/planetary/apod',
    apiKey: 'secret-key',
    auth: 'query',
    params: { count: 1 },
  });

  assert.equal(request.url, 'https://api.nasa.gov/planetary/apod?count=1&api_key=secret-key');
  assert.deepEqual(request.options.headers, {});
});

runTest('redacts plaintext api.data.gov secrets from URLs and messages', () => {
  const redacted = redactApiDataGovSecrets(
    'GET https://api.nasa.gov/planetary/apod?api_key=secret-key failed for secret-key',
    'secret-key'
  );

  assert.equal(redacted.includes('secret-key'), false);
  assert.equal(redacted.includes('api_key=REDACTED'), true);
});

runTest('explains api.data.gov rate-limit and forbidden errors without leaking keys', () => {
  const rate = explainApiDataGovError({
    status: 429,
    data: { error: { message: 'Rate limit exceeded for secret-key' } },
    url: 'https://api.example.gov/data?api_key=secret-key',
    apiKey: 'secret-key',
  });
  const forbidden = explainApiDataGovError({
    status: 403,
    data: { message: 'API key missing' },
    url: 'https://api.example.gov/data',
    apiKey: 'secret-key',
  });

  assert.match(rate.message, /rate limit/i);
  assert.match(forbidden.message, /DATA_GOV_API_KEY|api\.data\.gov/i);
  assert.equal(rate.message.includes('secret-key'), false);
  assert.equal(forbidden.message.includes('secret-key'), false);
});

runTest('registry includes every requested agency with use cases and examples', () => {
  const registry = getAgencyRegistry();
  const slugs = registry.agencies.map(agency => agency.slug).sort();

  assert.deepEqual(slugs, REQUIRED_AGENCIES.slice().sort());

  for (const agency of registry.agencies) {
    assert.ok(agency.use_case, `${agency.slug} missing use_case`);
    assert.ok(agency.example, `${agency.slug} missing example`);
    assert.ok(agency.domain, `${agency.slug} missing output domain`);
  }
});

runTest('list agencies is available without network', () => {
  const list = buildAgencyList(getAgencyRegistry());

  assert.match(list, /Department of Agriculture/);
  assert.match(list, /Library of Congress/);
  assert.match(list, /configured-no-starter|starter-ready/);
});

runTest('resolve all agency run uses only starter-ready agencies', () => {
  const runs = resolveAgencyRuns({ agency: 'all' }, getAgencyRegistry());

  assert.ok(runs.length > 0);
  assert.equal(runs.some(run => run.endpoint.status !== 'starter-ready'), false);
});

runTest('consolidated note has required pull-note frontmatter fields', () => {
  const registry = getAgencyRegistry();
  const runs = resolveAgencyRuns({ agency: 'all' }, registry).slice(0, 2);
  const note = buildConsolidatedNote({
    runs: runs.map(run => ({ ...run, ok: true, records: [{ title: 'Sample', date: '2026-05-26' }] })),
    registry,
  });

  assert.match(note, /title:/);
  assert.match(note, /source:/);
  assert.match(note, /date_pulled:/);
  assert.match(note, /domain:/);
  assert.match(note, /data_type:/);
  assert.match(note, /frequency:/);
  assert.match(note, /signal_status:/);
  assert.match(note, /signals: \[\]/);
  assert.match(note, /tags:/);
  assert.match(note, /Agency Use Cases/);
});
