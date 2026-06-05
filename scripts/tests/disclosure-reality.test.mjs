import assert from 'node:assert/strict';

import {
  resolveDisclosureFormTypes,
  scoreDisclosure,
} from '../pullers/disclosure-reality.mjs';

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

runTest('form resolver keeps default disclosure reality scan 8-K focused', () => {
  assert.deepEqual(resolveDisclosureFormTypes({}), ['8-K', '8-K/A']);
});

runTest('form resolver expands named families into non-8-K forms', () => {
  const forms = resolveDisclosureFormTypes({ forms: 'periodic,ownership,proxy' });
  assert(forms.includes('10-Q'));
  assert(forms.includes('10-K'));
  assert(forms.includes('SC 13D'));
  assert(forms.includes('DEF 14A'));
  assert(!forms.includes('8-K'));
});

runTest('form resolver supports all important SEC disclosure families', () => {
  const forms = resolveDisclosureFormTypes({ forms: 'all' });
  for (const expected of ['8-K', '10-Q', 'SC 13G', '4', 'DEF 14A', 'S-3', '424B5', '6-K']) {
    assert(forms.includes(expected), `${expected} missing from all-family scan`);
  }
});

runTest('periodic reports become candidates with analyst read cues', () => {
  const candidate = scoreDisclosure({
    ticker: 'ACME',
    meta: { ticker: 'ACME', cik: '0000000001', thesis: 'technology' },
    filing: {
      formType: '10-Q',
      filingDate: '2026-06-03',
      items: [],
      primaryDoc: 'acme-10q.htm',
      url: 'https://sec.example/acme',
    },
  });

  assert.equal(candidate.hasPositiveItem, true);
  assert.equal(candidate.formFamily, 'periodic');
  assert(candidate.score >= 2);
  assert.match(candidate.whyRead, /Periodic report/);
});

runTest('ownership filings become candidates distinct from 8-K items', () => {
  const candidate = scoreDisclosure({
    ticker: 'ACME',
    meta: { ticker: 'ACME', cik: '0000000001', sector: 'Industrials' },
    filing: {
      formType: 'SC 13D/A',
      filingDate: '2026-06-03',
      items: [],
      primaryDoc: 'acme-13da.htm',
      url: 'https://sec.example/acme',
    },
  });

  assert.equal(candidate.formFamily, 'ownership');
  assert.equal(candidate.tier, 'promising');
  assert.match(candidate.whyRead, /Activist or holder position change/);
});
