import assert from 'node:assert/strict';

import { calculateInstitutionalCrowding } from '../lib/institutional-crowding-model.mjs';

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

runTest('13F rows aggregate by manager and security with long-only limitations', () => {
  const crowding = calculateInstitutionalCrowding({
    symbol: 'ABC',
    cusip: '000000001',
    currentRows: [
      { filing_manager_cik: '1', filing_manager_name: 'Fund A', cusip: '000000001', shares_or_principal_amount: 100, market_value_usd_thousands: 10 },
      { filing_manager_cik: '2', filing_manager_name: 'Fund B', cusip: '000000001', shares_or_principal_amount: 50, market_value_usd_thousands: 5 },
    ],
    priorRows: [
      { filing_manager_cik: '1', filing_manager_name: 'Fund A', cusip: '000000001', shares_or_principal_amount: 70, market_value_usd_thousands: 7 },
    ],
    averageDailyVolumeShares: 30,
  });

  assert.equal(crowding.manager_count, 2);
  assert.equal(crowding.total_shares, 150);
  assert.equal(crowding.delta_shares_qoq, 80);
  assert.equal(crowding.unwind_days_at_20pct_adv, 25);
  assert.match(crowding.known_limitations.join(' '), /long-side only/);
});

runTest('missing prior quarter does not crash and lowers confidence', () => {
  const crowding = calculateInstitutionalCrowding({
    symbol: 'ABC',
    cusip: '000000001',
    currentRows: [
      { filing_manager_cik: '1', filing_manager_name: 'Fund A', cusip: '000000001', shares_or_principal_amount: 100, market_value_usd_thousands: 10 },
    ],
  });

  assert.equal(crowding.delta_shares_qoq, null);
  assert.equal(crowding.signal_confidence, 'derived_low_confidence');
});
