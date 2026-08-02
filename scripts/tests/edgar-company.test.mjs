import assert from 'node:assert/strict';

import {
  shouldWriteArtifacts,
  extractFilings,
  fiscalYearValues,
  filingDocUrl,
  formatFiscalYearEnd,
  deriveEventSignals,
} from '../pullers/edgar-company.mjs';

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

runTest('edgar dry-run suppresses artifact writes', () => {
  assert.equal(shouldWriteArtifacts({ 'dry-run': true }), false);
  assert.equal(shouldWriteArtifacts({ dryRun: true }), false);
  assert.equal(shouldWriteArtifacts({}), true);
});

const SUBMISSIONS_FIXTURE = {
  filings: {
    recent: {
      form:            ['8-K', '10-Q', '8-K', '10-K', 'DEF 14A', '8-K'],
      filingDate:      ['2026-07-20', '2026-05-28', '2026-04-02', '2026-02-26', '2026-05-01', '2025-11-10'],
      reportDate:      ['2026-07-18', '2026-04-27', '2026-04-01', '2026-01-25', '', '2025-11-08'],
      accessionNumber: ['0001-26-000001', '0001-26-000002', '0001-26-000003', '0001-26-000004', '0001-26-000005', '0001-25-000006'],
      primaryDocument: ['ev1.htm', 'q1.htm', 'ev2.htm', 'fy.htm', 'proxy.htm', 'ev3.htm'],
      items:           ['2.02,9.01', '', '1.01', '', '', '8.01'],
    },
  },
};

runTest('extractFilings filters by form, respects since floor and limit', () => {
  const eightKs = extractFilings(SUBMISSIONS_FIXTURE, { forms: ['8-K'] });
  assert.equal(eightKs.length, 3);
  assert.deepEqual(eightKs[0].items, ['2.02', '9.01']);

  const sinceAnnual = extractFilings(SUBMISSIONS_FIXTURE, { forms: ['8-K'], since: '2026-02-26' });
  assert.equal(sinceAnnual.length, 2);

  const limited = extractFilings(SUBMISSIONS_FIXTURE, { forms: ['8-K'], limit: 1 });
  assert.equal(limited.length, 1);
  assert.equal(limited[0].filingDate, '2026-07-20');
});

runTest('filingDocUrl builds Archives link from accession + primary doc', () => {
  const filing = { accessionRaw: '0001-26-000004', primaryDoc: 'fy.htm' };
  assert.equal(
    filingDocUrl('0000123456', filing),
    'https://www.sec.gov/Archives/edgar/data/123456/000126000004/fy.htm'
  );
  assert.equal(filingDocUrl('123456', { accessionRaw: '' }), '');
});

runTest('deriveEventSignals maps high-signal 8-K items to severities', () => {
  const routine = [{ items: ['2.02', '9.01'] }, { items: ['7.01'] }];
  assert.deepEqual(deriveEventSignals('NVDA', routine), { status: 'clear', signals: [] });

  const stressed = [
    { items: ['3.01'] },          // delisting notice → alert
    { items: ['4.01', '2.02'] },  // auditor change → watch
  ];
  const result = deriveEventSignals('XYZ', stressed);
  assert.equal(result.status, 'alert');
  assert.deepEqual(result.signals, ['edgar:xyz:8k-3.01:alert', 'edgar:xyz:8k-4.01:watch']);

  const bankrupt = deriveEventSignals('ABC', [{ items: ['1.03'] }]);
  assert.equal(bankrupt.status, 'critical');

  assert.deepEqual(deriveEventSignals('ABC', []), { status: 'clear', signals: [] });
});

runTest('formatFiscalYearEnd converts SEC MMDD form', () => {
  assert.equal(formatFiscalYearEnd('0131'), '01-31');
  assert.equal(formatFiscalYearEnd('1231'), '12-31');
  assert.equal(formatFiscalYearEnd(''), '');
});

// A 10-K carries comparative prior-year facts with the SAME filing fy/fp —
// fiscalYearValues must key by fact period, not filing fiscal year.
const FACTS_FIXTURE = {
  facts: {
    'us-gaap': {
      Revenues: {
        units: {
          USD: [
            { val: 900, start: '2024-02-01', end: '2025-01-31', fy: 2026, fp: 'FY', form: '10-K', filed: '2026-02-26' },
            { val: 1200, start: '2025-02-01', end: '2026-01-31', fy: 2026, fp: 'FY', form: '10-K', filed: '2026-02-26' },
            { val: 880, start: '2024-02-01', end: '2025-01-31', fy: 2025, fp: 'FY', form: '10-K', filed: '2025-02-25' },
            { val: 300, start: '2025-11-01', end: '2026-01-31', fy: 2026, fp: 'Q4', form: '10-Q', filed: '2026-03-01' },
          ],
        },
      },
      InventoryNet: {
        units: {
          USD: [
            { val: 50, end: '2025-01-31', fy: 2026, fp: 'FY', form: '10-K', filed: '2026-02-26' },
            { val: 80, end: '2026-01-31', fy: 2026, fp: 'FY', form: '10-K', filed: '2026-02-26' },
          ],
        },
      },
    },
  },
};

runTest('fiscalYearValues returns latest two fiscal years, latest-filed wins on dupes', () => {
  const revenue = fiscalYearValues(FACTS_FIXTURE, ['Revenues'], { kind: 'flow' });
  assert.equal(revenue.length, 2);
  assert.equal(revenue[0].value, 1200);
  assert.equal(revenue[0].end, '2026-01-31');
  assert.equal(revenue[1].value, 900); // 2026-02-26 filing supersedes the 2025 filing's 880
});

runTest('fiscalYearValues handles balance facts without duration filter', () => {
  const inventory = fiscalYearValues(FACTS_FIXTURE, ['InventoryNet'], { kind: 'balance' });
  assert.equal(inventory.length, 2);
  assert.equal(inventory[0].value, 80);
  assert.equal(inventory[1].value, 50);
});

// Companies retire tags (e.g. NVDA last used PaymentsToAcquirePropertyPlantAndEquipment
// in FY2012) — the freshest concept must win regardless of list order.
runTest('fiscalYearValues prefers the concept with the freshest period end', () => {
  const staleFirst = {
    facts: {
      'us-gaap': {
        StaleTag: {
          units: {
            USD: [
              { val: 1, start: '2011-02-01', end: '2012-01-29', fp: 'FY', form: '10-K', filed: '2012-03-01' },
              { val: 2, start: '2010-02-01', end: '2011-01-30', fp: 'FY', form: '10-K', filed: '2012-03-01' },
            ],
          },
        },
        FreshTag: {
          units: {
            USD: [
              { val: 100, start: '2025-02-01', end: '2026-01-25', fp: 'FY', form: '10-K', filed: '2026-02-26' },
            ],
          },
        },
      },
    },
  };
  const values = fiscalYearValues(staleFirst, ['StaleTag', 'FreshTag'], { kind: 'flow' });
  assert.equal(values[0].value, 100);
  assert.equal(values[0].end, '2026-01-25');
});

runTest('fiscalYearValues returns empty on missing concepts', () => {
  assert.deepEqual(fiscalYearValues(FACTS_FIXTURE, ['NoSuchConcept']), []);
  assert.deepEqual(fiscalYearValues(null, ['Revenues']), []);
});
