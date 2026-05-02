import assert from 'node:assert/strict';

import { buildLedgerNote, createLedger, finalizeLedger, recordEntry } from '../lib/run-ledger.mjs';

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

runTest('failed ledger rows show the error in the Issues column', () => {
  const ledger = createLedger({ runId: 'orchestrator-daily-2026-05-02', date: '2026-05-02' });
  recordEntry(ledger, {
    agentId: 'biotech',
    agentName: 'Biotech Agent',
    puller: 'fda',
    status: 'failed',
    error: 'Specify --recent-approvals',
  });
  finalizeLedger(ledger);

  const note = buildLedgerNote(ledger);
  assert.match(note, /Specify --recent-approvals/);
});
