import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  applyApprovedOutcomes,
  buildOutcomePacket,
  parseActiveLedgerRows,
} from '../lib/market-positioning-outcomes.mjs';

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

const LEDGER = `# Market Positioning Ledger

## Active Ledger

| Signal / Theme | Stance | Gate | Gate Delta | Source Ref | Watchpoint | Position Block | Trigger / Watch | Invalidation | Outcome Status |
|---|---|---:|---|---|---|---|---|---|---|
| Triggered Vol Hedge | Prepare | 3 | 2->3 (2026-06-01) | \`My_Data/05_Data_Pulls/Options/2026-06-01_Options.md\` | [[Watchpoints/Vol Hedge]] | [[Market Positioning Ledger - Positions#triggered-vol-hedge]] | VIX close above 20 | VIX below 17 | trigger fired |
| Early Oil Watch | Observe | 1 | 0->1 (2026-06-01) | \`My_Data/05_Data_Pulls/SourceWatch/2026-06-01_Source_Watch.md\` | [[Market Positioning Ledger - Positions#early-oil-watch|ledger watchpoint]] | [[Market Positioning Ledger - Positions#early-oil-watch]] | USO above value area | stale source stack | fresh seed |

## Portfolio House View
`;

await runTest('parses active ledger rows with evidence and position links', () => {
  const rows = parseActiveLedgerRows(LEDGER);

  assert.equal(rows.length, 2);
  assert.equal(rows[0].signal, 'Triggered Vol Hedge');
  assert.equal(rows[0].gate, 3);
  assert.equal(rows[0].source_ref, 'My_Data/05_Data_Pulls/Options/2026-06-01_Options.md');
  assert.equal(rows[0].position_block, '[[Market Positioning Ledger - Positions#triggered-vol-hedge]]');
  assert.equal(rows[1].watchpoint, '[[Market Positioning Ledger - Positions#early-oil-watch|ledger watchpoint]]');
  assert.equal(rows[1].position_block, '[[Market Positioning Ledger - Positions#early-oil-watch]]');
  assert.equal(rows[1].trigger_watch, 'USO above value area');
});

await runTest('builds agent-neutral outcome packet without inventing labels', () => {
  const packet = buildOutcomePacket({ ledgerMarkdown: LEDGER, asOfDate: '2026-06-03' });

  assert.equal(packet.source, 'chat-agent-neutral');
  assert.equal(packet.as_of_date, '2026-06-03');
  assert.equal(packet.candidates.length, 2);
  assert.equal(packet.candidates[0].eligibility, 'outcome_eligible');
  assert.equal(packet.candidates[0].suggested_review.labels.length >= 6, true);
  assert.equal(packet.candidates[0].suggested_review.approved, false);
  assert.equal(packet.candidates[1].eligibility, 'monitor_only');
  assert.match(packet.candidates[1].reason, /Gate 3/i);
});

await runTest('applies approved outcomes and appends calibration records', async () => {
  const root = await mkdtemp(join(tmpdir(), 'mpl-outcome-'));
  const ledgerPath = join(root, 'Market Positioning Ledger.md');
  const discardLogPath = join(root, 'Market Positioning Ledger - Discard Log.md');
  const calibrationPath = join(root, 'calibration.json');
  await writeFile(ledgerPath, LEDGER, 'utf8');
  await writeFile(discardLogPath, '# Discard Log\n', 'utf8');

  const result = await applyApprovedOutcomes({
    approvals: {
      approved_by: 'chat-agent-neutral',
      outcomes: [
        {
          row: 'Triggered Vol Hedge',
          approved: true,
          label: 'Played out',
          realized_path: 'World_Machine/Reports/Monthly/2026-06.md',
          outcome_note: 'Vol expansion confirmed the hedge trigger.',
        },
      ],
    },
    ledgerPath,
    discardLogPath,
    calibrationPath,
    asOfDate: '2026-06-03',
  });

  assert.equal(result.applied.length, 1);
  assert.equal(result.skipped.length, 0);

  const ledger = await readFile(ledgerPath, 'utf8');
  assert.match(ledger, /\| Triggered Vol Hedge \| Prepare \| 4 \| 3->4 \(2026-06-03\).*Played out/);

  const calibration = JSON.parse(await readFile(calibrationPath, 'utf8'));
  assert.equal(calibration.records.length, 1);
  assert.equal(calibration.records[0].label, 'Played out');
  assert.equal(calibration.records[0].gate_before, 3);
  assert.equal(calibration.records[0].gate_after, 4);

  assert.equal(existsSync(discardLogPath), true);
  const discardLog = await readFile(discardLogPath, 'utf8');
  assert.match(discardLog, /Outcome review/);
  assert.match(discardLog, /Triggered Vol Hedge/);
});

