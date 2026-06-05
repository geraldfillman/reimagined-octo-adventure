import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile, appendFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { buildNote, buildTable, today } from './markdown.mjs';

export const OUTCOME_LABELS = Object.freeze([
  'Played out',
  'Directionally right / poorly timed',
  'Noisy',
  'Missed',
  'Stale',
  'Rebuild',
]);

const ACTIVE_HEADER = /^## Active Ledger\s*$/m;
const NEXT_HEADER = /^## /m;

export function parseActiveLedgerRows(markdown) {
  const { tableBlock } = locateActiveTable(markdown);
  if (!tableBlock) return [];

  const lines = tableBlock.split('\n').filter(line => line.trim().startsWith('|'));
  const rows = [];

  for (const line of lines) {
    if (line.includes('---')) continue;
    if (/^\|\s*Signal\s*\/\s*Theme/i.test(line)) continue;

    const cells = splitMarkdownRow(line);
    if (cells.length < 10) continue;

    const gate = Number(String(cells[2]).replace(/[^0-9.-]/g, ''));
    rows.push({
      signal: cleanCell(cells[0]),
      stance: cleanCell(cells[1]),
      gate: Number.isFinite(gate) ? gate : null,
      gate_delta: cleanCell(cells[3]),
      source_ref: cleanSourceRef(cells[4]),
      watchpoint: cleanCell(cells[5]),
      position_block: cleanCell(cells[6]),
      trigger_watch: cleanCell(cells[7]),
      invalidation: cleanCell(cells[8]),
      outcome_status: cleanCell(cells[9]),
      raw_line: line,
    });
  }

  return rows.filter(row => row.signal && !/^_\(no active rows\)_$/i.test(row.signal));
}

export function buildOutcomePacket({ ledgerMarkdown, asOfDate = today() }) {
  const rows = parseActiveLedgerRows(ledgerMarkdown);
  const candidates = rows.map(row => {
    const outcomeAlreadyLogged = hasOutcomeLabel(row.outcome_status);
    const gateEligible = Number(row.gate) >= 3;
    const eligibility = gateEligible && !outcomeAlreadyLogged ? 'outcome_eligible' : 'monitor_only';
    const reason = eligibility === 'outcome_eligible'
      ? 'Gate 3+ row is ready for a human/chat outcome label after evidence review.'
      : gateEligible
        ? 'Outcome label already appears to be logged; keep for calibration history only.'
        : 'Monitor only until Gate 3 trigger confirmation or explicit stale/rebuild review.';

    return {
      row: row.signal,
      stance: row.stance,
      gate: row.gate,
      eligibility,
      reason,
      source_refs: row.source_ref ? [row.source_ref] : [],
      watchpoint: row.watchpoint,
      position_block: row.position_block,
      trigger_watch: row.trigger_watch,
      invalidation: row.invalidation,
      current_outcome_status: row.outcome_status,
      suggested_review: {
        approved: false,
        label: null,
        labels: [...OUTCOME_LABELS],
        realized_path: null,
        outcome_note: null,
      },
    };
  });

  return {
    schema_version: 1,
    source: 'chat-agent-neutral',
    provider: 'none',
    generated_by: 'scripts/pullers/market-positioning-outcomes.mjs',
    as_of_date: asOfDate,
    label_set: [...OUTCOME_LABELS],
    candidate_count: candidates.length,
    eligible_count: candidates.filter(c => c.eligibility === 'outcome_eligible').length,
    candidates,
    apply_instructions: {
      command: 'node run.mjs pull market-positioning-outcomes --apply <approved-json>',
      required_fields: ['row', 'approved', 'label', 'realized_path', 'outcome_note'],
      rule: 'Only rows with approved:true are applied. The apply step never invents labels or row matches.',
    },
  };
}

export function renderOutcomePacketMarkdown(packet) {
  const rows = packet.candidates.map(candidate => [
    candidate.row,
    String(candidate.gate ?? 'N/A'),
    candidate.eligibility,
    candidate.source_refs.join('; ') || 'N/A',
    candidate.trigger_watch,
    candidate.invalidation,
    candidate.current_outcome_status || 'N/A',
  ]);

  const reviewBlocks = packet.candidates.map(candidate => [
    `### ${candidate.row}`,
    '',
    `- Eligibility: ${candidate.eligibility}`,
    `- Reason: ${candidate.reason}`,
    `- Position block: ${candidate.position_block || 'N/A'}`,
    `- Source refs: ${candidate.source_refs.join('; ') || 'N/A'}`,
    `- Approved: false`,
    `- Label: _choose one of ${packet.label_set.join(', ')}_`,
    `- Realized path: _required before apply_`,
    `- Outcome note: _required before apply_`,
  ].join('\n')).join('\n\n');

  return buildNote({
    frontmatter: {
      title: 'Market Positioning Outcome Review Packet',
      source: 'chat-agent-neutral',
      provider: 'none',
      date_pulled: packet.as_of_date,
      domain: 'positioning',
      data_type: 'market_positioning_outcome_review',
      candidate_count: packet.candidate_count,
      eligible_count: packet.eligible_count,
      signal_status: packet.eligible_count > 0 ? 'watch' : 'clear',
      tags: ['market-positioning-ledger', 'outcome-review', 'agent-neutral'],
    },
    sections: [
      {
        heading: 'Purpose',
        content: [
          'Agent-neutral outcome review packet for the Market Positioning Ledger.',
          'This packet does not call an API or provider CLI. Fill approved labels in JSON, then run the deterministic apply command.',
        ].join(' '),
      },
      {
        heading: 'Candidates',
        content: rows.length
          ? buildTable(['Row', 'Gate', 'Eligibility', 'Source Refs', 'Trigger / Watch', 'Invalidation', 'Current Outcome'], rows)
          : '_No active ledger rows found._',
      },
      {
        heading: 'Review Template',
        content: reviewBlocks || '_No review blocks._',
      },
    ],
  });
}

export async function applyApprovedOutcomes({
  approvals,
  ledgerPath,
  discardLogPath,
  calibrationPath,
  asOfDate = today(),
}) {
  const approvalItems = normalizeApprovals(approvals);
  const out = { applied: [], skipped: [], ledgerPath, calibrationPath };
  if (!approvalItems.length) return out;

  const original = await readFile(ledgerPath, 'utf8');
  const located = locateActiveTable(original);
  if (!located.tableBlock) {
    return {
      ...out,
      skipped: approvalItems.map(item => ({ ...item, reason: 'active-ledger-table-not-found' })),
    };
  }

  const lines = located.tableBlock.split('\n');
  const parsedRows = parseActiveLedgerRows(original);
  const seenKeys = await loadAppliedKeys(calibrationPath);

  for (const item of approvalItems) {
    if (!item?.approved) continue;
    const label = canonicalLabel(item.label);
    if (!label) {
      out.skipped.push({ ...item, reason: 'unsupported-label' });
      continue;
    }
    if (!item.row) {
      out.skipped.push({ ...item, reason: 'missing-row' });
      continue;
    }

    const dedupeKey = `${String(item.row).toLowerCase().trim()}::${asOfDate}`;
    if (seenKeys.has(dedupeKey)) {
      out.skipped.push({ ...item, reason: 'already-applied' });
      continue;
    }

    const matches = findLineMatches(lines, item.row);
    if (matches.length === 0) {
      out.skipped.push({ ...item, reason: 'no-row-match' });
      continue;
    }
    if (matches.length > 1) {
      out.skipped.push({ ...item, reason: `ambiguous-${matches.length}-matches` });
      continue;
    }

    const beforeRow = parsedRows.find(row => row.signal.toLowerCase() === String(item.row).toLowerCase().trim())
      ?? { gate: null, source_ref: null, position_block: null };
    const updated = updateOutcomeLine(lines[matches[0]], { label, item, asOfDate });
    if (!updated) {
      out.skipped.push({ ...item, reason: 'row-shape-unexpected' });
      continue;
    }

    lines[matches[0]] = updated.line;
    seenKeys.add(dedupeKey);
    out.applied.push({
      row: updated.signal,
      label,
      gate_before: updated.gateBefore,
      gate_after: updated.gateAfter,
      source_ref: beforeRow.source_ref,
      position_block: beforeRow.position_block,
      realized_path: item.realized_path ?? null,
      outcome_note: item.outcome_note ?? item.note ?? '',
      approved_by: approvals?.approved_by ?? item.approved_by ?? 'chat-agent-neutral',
      applied_at: asOfDate,
    });
  }

  if (!out.applied.length) return out;

  const nextDoc = original.slice(0, located.tableStart) + lines.join('\n') + original.slice(located.tableEnd);
  await mkdir(dirname(ledgerPath), { recursive: true });
  await writeFile(ledgerPath, nextDoc, 'utf8');
  await appendOutcomeDiscardLog({ discardLogPath, applied: out.applied, asOfDate });
  await appendCalibration({ calibrationPath, applied: out.applied, asOfDate });

  return out;
}

function locateActiveTable(src) {
  const headerMatch = ACTIVE_HEADER.exec(src);
  if (!headerMatch) return { tableStart: -1, tableEnd: -1, tableBlock: '' };

  const sectionStart = headerMatch.index + headerMatch[0].length;
  const rest = src.slice(sectionStart);
  const nextMatch = NEXT_HEADER.exec(rest);
  const sectionEnd = nextMatch ? sectionStart + nextMatch.index : src.length;
  return { tableStart: sectionStart, tableEnd: sectionEnd, tableBlock: src.slice(sectionStart, sectionEnd) };
}

function splitMarkdownRow(line) {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells = [];
  let current = '';
  let escaped = false;
  let wikiDepth = 0;

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    const pair = trimmed.slice(i, i + 2);

    if (pair === '[[') wikiDepth++;
    if (ch === '|' && !escaped && wikiDepth === 0) {
      cells.push(cleanCell(current));
      current = '';
      continue;
    }

    current += ch;

    if (pair === ']]' && wikiDepth > 0) wikiDepth--;
    escaped = ch === '\\' && !escaped;
    if (ch !== '\\') escaped = false;
  }
  cells.push(cleanCell(current));
  return cells;
}

function cleanCell(value) {
  return String(value ?? '').replace(/\\\|/g, '|').trim();
}

function cleanSourceRef(value) {
  const cleaned = cleanCell(value);
  if (cleaned === '_pending_' || !cleaned) return '';
  return cleaned.replace(/^`+|`+$/g, '').trim();
}

function hasOutcomeLabel(value) {
  const lower = String(value ?? '').toLowerCase();
  return OUTCOME_LABELS.some(label => lower.includes(label.toLowerCase()));
}

function canonicalLabel(value) {
  const lower = String(value ?? '').trim().toLowerCase();
  return OUTCOME_LABELS.find(label => label.toLowerCase() === lower) ?? null;
}

function normalizeApprovals(approvals) {
  if (Array.isArray(approvals)) return approvals;
  if (Array.isArray(approvals?.outcomes)) return approvals.outcomes;
  if (Array.isArray(approvals?.candidates)) return approvals.candidates;
  return [];
}

function findLineMatches(lines, name) {
  const needle = String(name).toLowerCase().trim();
  const matches = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().startsWith('|')) continue;
    if (line.includes('---')) continue;
    if (/^\|\s*Signal\s*\/\s*Theme/i.test(line)) continue;
    const firstCell = splitMarkdownRow(line)[0]?.toLowerCase();
    if (!firstCell) continue;
    if (firstCell === needle || firstCell.includes(needle) || needle.includes(firstCell)) matches.push(i);
  }
  return matches;
}

function updateOutcomeLine(line, { label, item, asOfDate }) {
  const cells = splitMarkdownRow(line);
  if (cells.length < 10) return null;

  const signal = cells[0];
  const gateBefore = Number(String(cells[2]).replace(/[^0-9.-]/g, ''));
  const gateAfter = Number.isFinite(gateBefore) && gateBefore >= 3 ? 4 : gateBefore;
  if (Number.isFinite(gateBefore) && gateBefore >= 3) {
    cells[2] = '4';
    cells[3] = `${gateBefore}->4 (${asOfDate})`;
  }

  const note = String(item.outcome_note ?? item.note ?? '').replace(/\s+/g, ' ').trim();
  cells[9] = note ? `${label} (${asOfDate}) - ${note.slice(0, 140)}` : `${label} (${asOfDate})`;

  return {
    line: `| ${cells.map(escapeTableCell).join(' | ')} |`,
    signal,
    gateBefore: Number.isFinite(gateBefore) ? gateBefore : null,
    gateAfter: Number.isFinite(gateAfter) ? gateAfter : null,
  };
}

function escapeTableCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|');
}

async function appendOutcomeDiscardLog({ discardLogPath, applied, asOfDate }) {
  const header = `\n### ${asOfDate} - Outcome review\n\nApplied by market-positioning-outcomes.\n\n| Item | Label | Notes | Routed To |\n|---|---|---|---|\n`;
  const rows = applied.map(item => {
    const note = String(item.outcome_note ?? '').replace(/\|/g, '\\|').slice(0, 180) || 'Outcome label applied.';
    return `| ${item.row} | ${item.label} | ${note} | [[Market Positioning Ledger#Active Ledger]] |`;
  }).join('\n');
  await mkdir(dirname(discardLogPath), { recursive: true });
  await appendFile(discardLogPath, header + rows + '\n', 'utf8');
}

async function appendCalibration({ calibrationPath, applied, asOfDate }) {
  let calibration = {
    schema_version: 1,
    source: 'market-positioning-outcomes',
    updated_at: asOfDate,
    records: [],
    summary: {},
  };

  if (existsSync(calibrationPath)) {
    try {
      calibration = JSON.parse(await readFile(calibrationPath, 'utf8'));
      if (!Array.isArray(calibration.records)) calibration.records = [];
    } catch {
      // Preserve deterministic behavior by replacing unreadable state with a valid state file.
    }
  }

  calibration.updated_at = asOfDate;
  calibration.records.push(...applied);
  calibration.summary = summarizeCalibration(calibration.records);

  await mkdir(dirname(calibrationPath), { recursive: true });
  await writeFile(calibrationPath, JSON.stringify(calibration, null, 2), 'utf8');
}

async function loadAppliedKeys(calibrationPath) {
  if (!existsSync(calibrationPath)) return new Set();
  try {
    const data = JSON.parse(await readFile(calibrationPath, 'utf8'));
    const records = Array.isArray(data?.records) ? data.records : [];
    return new Set(records.map(r => `${String(r.row ?? '').toLowerCase().trim()}::${r.applied_at ?? ''}`));
  } catch {
    return new Set();
  }
}

function summarizeCalibration(records) {
  const byLabel = {};
  for (const record of records) {
    byLabel[record.label] = (byLabel[record.label] ?? 0) + 1;
  }
  return {
    total_records: records.length,
    by_label: byLabel,
  };
}

