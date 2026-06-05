import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  buildOutcomePacketIfTriggered,
  writeOutcomeReviewPacket,
} from '../lib/runner-outcome-packets.mjs';

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

const NO_GATE3_LEDGER = `# Market Positioning Ledger

## Active Ledger

| Signal / Theme | Stance | Gate | Gate Delta | Source Ref | Watchpoint | Position Block | Trigger / Watch | Invalidation | Outcome Status |
|---|---|---:|---|---|---|---|---|---|---|
| Early Oil Watch | Observe | 1 | 0->1 (2026-06-01) | \`source.md\` | [[Watch]] | [[Block]] | USO above value area | stale source stack | fresh seed |

## Portfolio House View
`;

const GATE3_LEDGER = `# Market Positioning Ledger

## Active Ledger

| Signal / Theme | Stance | Gate | Gate Delta | Source Ref | Watchpoint | Position Block | Trigger / Watch | Invalidation | Outcome Status |
|---|---|---:|---|---|---|---|---|---|---|
| Triggered Vol Hedge | Prepare | 3 | 2->3 (2026-06-01) | \`source.md\` | [[Watch]] | [[Block]] | VIX above 20 | VIX below 17 | trigger fired |

## Portfolio House View
`;

await runTest('does not build an outcome packet without Gate 3 rows', () => {
  const packet = buildOutcomePacketIfTriggered({
    ledgerMarkdown: NO_GATE3_LEDGER,
    asOfDate: '2026-06-03',
  });

  assert.equal(packet, null);
});

await runTest('builds an outcome packet when a Gate 3 row exists', () => {
  const packet = buildOutcomePacketIfTriggered({
    ledgerMarkdown: GATE3_LEDGER,
    asOfDate: '2026-06-03',
  });

  assert.equal(packet.candidate_count, 1);
  assert.equal(packet.eligible_count, 1);
  assert.equal(packet.candidates[0].eligibility, 'outcome_eligible');
});

await runTest('writes JSON sidecar and World_Machine EOD markdown packet', async () => {
  const root = await mkdtemp(join(tmpdir(), 'runner-outcomes-'));
  const ledgerPath = join(root, 'Market Positioning Ledger.md');
  const packetDir = join(root, '_state', 'outcome-packets');
  const reportDir = join(root, 'Reports', 'EOD');
  await writeFile(ledgerPath, GATE3_LEDGER, 'utf8');

  const result = await writeOutcomeReviewPacket({
    ledgerPath,
    packetDir,
    reportDir,
    runId: 'S6-test',
    asOfDate: '2026-06-03',
  });

  assert.equal(result.written, true);
  assert.equal(result.eligible_count, 1);
  assert.equal(existsSync(result.jsonPath), true);
  assert.equal(existsSync(result.markdownPath), true);

  const json = JSON.parse(await readFile(result.jsonPath, 'utf8'));
  assert.equal(json.candidates[0].row, 'Triggered Vol Hedge');

  const markdown = await readFile(result.markdownPath, 'utf8');
  assert.match(markdown, /Market Positioning Outcome Review Packet/);
  assert.match(markdown, /Triggered Vol Hedge/);
});
