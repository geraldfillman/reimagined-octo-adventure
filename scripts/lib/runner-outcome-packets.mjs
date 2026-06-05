import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { getEngineRoot, getWorldMachineRoot } from './config.mjs';
import {
  buildOutcomePacket,
  parseActiveLedgerRows,
  renderOutcomePacketMarkdown,
} from './market-positioning-outcomes.mjs';

export const LEDGER_PATH = () => join(getWorldMachineRoot(), '_Inbox', 'Market Positioning Ledger.md');
export const OUTCOME_PACKET_DIR = () => join(getEngineRoot(), '_state', 'outcome-packets');
export const EOD_REPORT_DIR = () => join(getWorldMachineRoot(), 'Reports', 'EOD');

export function buildOutcomePacketIfTriggered({ ledgerMarkdown, asOfDate } = {}) {
  const rows = parseActiveLedgerRows(ledgerMarkdown || '');
  if (!rows.some(row => Number(row.gate) >= 3)) return null;
  return buildOutcomePacket({ ledgerMarkdown, asOfDate });
}

export async function writeOutcomeReviewPacket({
  ledgerPath = LEDGER_PATH(),
  packetDir = OUTCOME_PACKET_DIR(),
  reportDir = EOD_REPORT_DIR(),
  runId,
  asOfDate = new Date().toISOString().slice(0, 10),
} = {}) {
  const ledgerMarkdown = await readFile(ledgerPath, 'utf8');
  const packet = buildOutcomePacketIfTriggered({ ledgerMarkdown, asOfDate });
  if (!packet) return { written: false, reason: 'no-gate-3-rows', packet: null };

  const safeRunId = String(runId || 'manual').replace(/[^A-Za-z0-9_.-]+/g, '-');
  const jsonPath = join(packetDir, `${asOfDate}-${safeRunId}.json`);
  const markdownPath = join(reportDir, `${asOfDate}-market-positioning-outcomes.md`);

  await mkdir(dirname(jsonPath), { recursive: true });
  await mkdir(dirname(markdownPath), { recursive: true });
  await writeFile(jsonPath, JSON.stringify(packet, null, 2), 'utf8');
  await writeFile(markdownPath, renderOutcomePacketMarkdown(packet), 'utf8');

  return {
    written: true,
    jsonPath,
    markdownPath,
    eligible_count: packet.eligible_count,
    candidate_count: packet.candidate_count,
    packet,
  };
}
