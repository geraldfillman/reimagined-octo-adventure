/**
 * market-positioning-outcomes.mjs - agent-neutral outcome packet/apply flow.
 *
 * No API keys, provider CLIs, or nested agents. Generation writes a review packet
 * from the World_Machine Market Positioning Ledger. Apply mode consumes an
 * approved JSON packet and deterministically updates the ledger plus calibration
 * state.
 *
 * Usage:
 *   node run.mjs pull market-positioning-outcomes --dry-run --json
 *   node run.mjs pull market-positioning-outcomes
 *   node run.mjs pull market-positioning-outcomes --apply path/to/approved.json
 */

import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';

import { getEngineRoot, getWorldMachineRoot } from '../lib/config.mjs';
import { today } from '../lib/markdown.mjs';
import {
  applyApprovedOutcomes,
  buildOutcomePacket,
  renderOutcomePacketMarkdown,
} from '../lib/market-positioning-outcomes.mjs';

export async function pull(flags = {}) {
  const asOfDate = String(flags.date || today());

  if (flags.apply) {
    const approvalsPath = String(flags.apply);
    const approvals = JSON.parse(await readFile(approvalsPath, 'utf8'));
    const result = await applyApprovedOutcomes({
      approvals,
      ledgerPath: ledgerPath(),
      discardLogPath: discardLogPath(),
      calibrationPath: calibrationPath(),
      asOfDate,
    });

    if (flags.json) console.log(JSON.stringify(result, null, 2));
    else {
      console.log(`[market-positioning-outcomes] Applied: ${result.applied.length}`);
      console.log(`[market-positioning-outcomes] Skipped: ${result.skipped.length}`);
      console.log(`[market-positioning-outcomes] Calibration: ${calibrationPath()}`);
    }
    return result;
  }

  const ledgerMarkdown = await readFile(ledgerPath(), 'utf8');
  const packet = buildOutcomePacket({ ledgerMarkdown, asOfDate });
  const markdown = renderOutcomePacketMarkdown(packet);

  if (flags['dry-run']) {
    if (flags.json) console.log(JSON.stringify(packet, null, 2));
    else console.log(markdown);
    return { packet, jsonPath: null, markdownPath: null };
  }

  const jsonPath = flags['output-json'] ? String(flags['output-json']) : packetJsonPath(asOfDate);
  const markdownPath = flags['output-md'] ? String(flags['output-md']) : packetMarkdownPath(asOfDate);

  await mkdir(dirname(jsonPath), { recursive: true });
  await mkdir(dirname(markdownPath), { recursive: true });
  await writeFile(jsonPath, JSON.stringify(packet, null, 2), 'utf8');
  await writeFile(markdownPath, markdown, 'utf8');
  await ensureCalibrationState(asOfDate);

  if (flags.json) console.log(JSON.stringify({ packet, jsonPath, markdownPath }, null, 2));
  else {
    console.log(`[market-positioning-outcomes] Packet JSON: ${jsonPath}`);
    console.log(`[market-positioning-outcomes] Review note: ${markdownPath}`);
  }

  return { packet, jsonPath, markdownPath };
}

function ledgerPath() {
  return join(getWorldMachineRoot(), '_Inbox', 'Market Positioning Ledger.md');
}

function discardLogPath() {
  return join(getWorldMachineRoot(), '_Inbox', 'Market Positioning Ledger - Discard Log.md');
}

function calibrationPath() {
  return join(getEngineRoot(), '_state', 'calibration.json');
}

function packetJsonPath(asOfDate) {
  return join(getEngineRoot(), '_state', 'outcome-review', `${asOfDate}-market-positioning-outcome-packet.json`);
}

function packetMarkdownPath(asOfDate) {
  return join(getWorldMachineRoot(), 'Reports', 'Regime', `${asOfDate}-outcome-review-packet.md`);
}

async function ensureCalibrationState(asOfDate) {
  const path = calibrationPath();
  if (existsSync(path)) return;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify({
    schema_version: 1,
    source: 'market-positioning-outcomes',
    updated_at: asOfDate,
    records: [],
    summary: { total_records: 0, by_label: {} },
  }, null, 2), 'utf8');
}

