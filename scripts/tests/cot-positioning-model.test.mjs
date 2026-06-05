import assert from 'node:assert/strict';

import { calculateCotPositioning } from '../lib/cot-positioning-model.mjs';
import {
  normalizeCotRowsForModel,
  parseCotCsvText,
  resolveCotReportUrl,
} from '../pullers/cftc-cot.mjs';

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

runTest('COT positioning calculates net, percent open interest, and z-score', () => {
  const rows = [
    { market: 'S&P 500', report_date: '2026-05-13', open_interest: 1000, leveraged_funds_long: 600, leveraged_funds_short: 300 },
    { market: 'S&P 500', report_date: '2026-05-06', open_interest: 1000, leveraged_funds_long: 500, leveraged_funds_short: 300 },
    { market: 'S&P 500', report_date: '2026-04-29', open_interest: 1000, leveraged_funds_long: 400, leveraged_funds_short: 300 },
  ];

  const result = calculateCotPositioning(rows, {
    market: 'S&P 500',
    category: 'leveraged_funds',
  });

  assert.equal(result.latest.net, 300);
  assert.equal(result.latest.net_pct_oi, 0.3);
  assert.ok(result.latest.positioning_z > 0);
  assert.equal(result.signal_confidence, 'observed');
});

runTest('CFTC puller resolves direct report URLs and normalizes CSV rows', () => {
  assert.equal(
    resolveCotReportUrl({ report: 'disaggregated', combined: false }),
    'https://www.cftc.gov/dea/newcot/f_disagg.txt'
  );
  assert.equal(
    resolveCotReportUrl({ report: 'disaggregated', combined: true }),
    'https://www.cftc.gov/dea/newcot/c_disagg.txt'
  );
  assert.equal(
    resolveCotReportUrl({ report: 'tff' }),
    'https://www.cftc.gov/dea/newcot/FinFutWk.txt'
  );

  const text = [
    '"Market and Exchange Name","Report Date","Open Interest","NonComm Long","NonComm Short","Comm Long","Comm Short","Chg NonComm Long","Chg NonComm Short"',
    '"CRUDE OIL, LIGHT SWEET - NEW YORK MERCANTILE EXCHANGE",2026-05-26,1000,600,300,200,500,50,-20',
  ].join('\n');
  const parsed = parseCotCsvText(text);
  const rows = normalizeCotRowsForModel(parsed, { category: 'noncommercial' });

  assert.equal(rows.length, 1);
  assert.equal(rows[0].market, 'CRUDE OIL, LIGHT SWEET - NEW YORK MERCANTILE EXCHANGE');
  assert.equal(rows[0].report_date, '2026-05-26');
  assert.equal(rows[0].open_interest, 1000);
  assert.equal(rows[0].noncommercial_long, 600);
  assert.equal(rows[0].noncommercial_short, 300);
  assert.equal(rows[0].weekly_net_flow, 70);
});
