import assert from 'node:assert/strict';

import { monthEndSummaryFilename } from '../pullers/month-end-archive.mjs';

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

runTest('month-end summary filename is a date-stamped pull note filename', () => {
  assert.equal(monthEndSummaryFilename('2026-05'), '2026-05-31_Month_End_Summary.md');
});
