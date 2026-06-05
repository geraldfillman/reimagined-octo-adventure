// S6 Ledger Reconciler — applies Positioning Agent gate_delta_candidates to
// World_Machine/_Inbox/Market Positioning Ledger.md and appends a Discard Log batch.
//
// Strict rules:
//   - Only runs when the slot has mayMutateLedger: true (enforced by the caller).
//   - Matches ledger rows by case-insensitive substring on the Signal/Theme cell.
//   - Skips any candidate that matches 0 or >1 rows (logs but never guesses).
//   - Updates two cells per matched row: Gate (column 3) and Gate Δ (column 4).
//   - Appends every applied change to the Discard Log under today's batch.

import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getWorldMachineRoot } from './config.mjs';

const LEDGER_PATH      = () => join(getWorldMachineRoot(), '_Inbox', 'Market Positioning Ledger.md');
const DISCARD_LOG_PATH = () => join(getWorldMachineRoot(), '_Inbox', 'Market Positioning Ledger - Discard Log.md');

const ACTIVE_HEADER = /^## Active Ledger\s*$/m;
const NEXT_HEADER   = /^## /m;

/**
 * Apply gate_delta_candidates to the ledger.
 * @returns {Promise<{applied: object[], skipped: object[], path: string}>}
 */
export async function applyLedgerUpdates({ candidates, runId, agent }) {
  const out = { applied: [], skipped: [], path: LEDGER_PATH() };
  if (!Array.isArray(candidates) || candidates.length === 0) return out;

  const original = await readFile(out.path, 'utf8');
  const { tableStart, tableEnd } = locateActiveTable(original);
  if (tableStart === -1) {
    return { ...out, skipped: candidates.map(c => ({ ...c, reason: 'active-ledger-table-not-found' })) };
  }

  const before = original.slice(0, tableStart);
  const tableBlock = original.slice(tableStart, tableEnd);
  const after = original.slice(tableEnd);

  let lines = tableBlock.split('\n');
  const today = new Date().toISOString().slice(0, 10);

  for (const cand of candidates) {
    if (!cand?.row || cand.to_gate == null) {
      out.skipped.push({ ...cand, reason: 'malformed-candidate' });
      continue;
    }
    const matches = findRowMatches(lines, cand.row);
    if (matches.length === 0) {
      out.skipped.push({ ...cand, reason: 'no-row-match' });
      continue;
    }
    if (matches.length > 1) {
      out.skipped.push({ ...cand, reason: `ambiguous-${matches.length}-matches` });
      continue;
    }
    const idx = matches[0];
    const updated = updateRowGate(lines[idx], cand.from_gate ?? null, cand.to_gate, today);
    if (!updated) {
      out.skipped.push({ ...cand, reason: 'row-shape-unexpected' });
      continue;
    }
    lines[idx] = updated.line;
    out.applied.push({ ...cand, prev_gate: updated.prevGate, applied_at: today });
  }

  if (out.applied.length === 0) return out;

  const nextBlock = lines.join('\n');
  const nextDoc = before + nextBlock + after;
  await writeFile(out.path, nextDoc, 'utf8');
  await appendDiscardLog({ applied: out.applied, runId, agent });
  return out;
}

function locateActiveTable(src) {
  const headerMatch = ACTIVE_HEADER.exec(src);
  if (!headerMatch) return { tableStart: -1, tableEnd: -1 };
  const sectionStart = headerMatch.index + headerMatch[0].length;
  const rest = src.slice(sectionStart);
  const nextMatch = NEXT_HEADER.exec(rest);
  const sectionEnd = nextMatch ? sectionStart + nextMatch.index : src.length;
  return { tableStart: sectionStart, tableEnd: sectionEnd };
}

function findRowMatches(lines, name) {
  const needle = name.toLowerCase().trim();
  const matches = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith('|')) continue;
    // skip header rows (separator + the column header itself)
    if (line.includes('---')) continue;
    if (/^\|\s*Signal\s*\/\s*Theme/i.test(line)) continue;
    const firstCell = line.split('|')[1]?.trim().toLowerCase();
    if (!firstCell) continue;
    if (firstCell.includes(needle) || needle.includes(firstCell)) matches.push(i);
  }
  return matches;
}

// Active Ledger schema (column index, 1-based after the leading pipe):
//   1 Signal / Theme | 2 Stance | 3 Gate | 4 Gate Δ | 5 Source Ref | 6 Watchpoint
//   7 Position Block | 8 Trigger / Watch | 9 Invalidation | 10 Outcome Status
function updateRowGate(line, fromGate, toGate, today) {
  const cells = line.split('|');
  // cells[0] is empty (leading |), cells[length-1] is empty (trailing |)
  if (cells.length < 11) return null;
  const prevGate = cells[3]?.trim();
  cells[3] = ` ${toGate} `;
  const fromForDelta = fromGate ?? prevGate ?? '?';
  cells[4] = ` ${fromForDelta}→${toGate} (${today}) `;
  return { line: cells.join('|'), prevGate };
}

async function appendDiscardLog({ applied, runId, agent }) {
  const date = new Date().toISOString().slice(0, 10);
  const header = `\n### ${date} — S6 reconciliation (run_id ${runId})\n\nApplied by ${agent}.\n\n| Item | Reason | Notes | Routed To |\n|---|---|---|---|\n`;
  const rows = applied.map(a => {
    const reason = a.to_gate > (a.prev_gate ?? 0) ? '`superseded-by`' : '`invalidated`';
    const note = (a.reason ?? '').replace(/\|/g, '\\|').slice(0, 160);
    return `| ${a.row} (Gate ${a.prev_gate ?? '?'}→${a.to_gate}) | ${reason} | ${note} | [[Market Positioning Ledger#Active Ledger]] |`;
  }).join('\n');
  await appendFile(DISCARD_LOG_PATH(), header + rows + '\n', 'utf8');
}
