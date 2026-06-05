import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { getEngineRoot, getWorldMachineRoot } from './config.mjs';
import { parseActiveLedgerRows } from './market-positioning-outcomes.mjs';
import { evaluateThesisAdversarially } from './refutation-panel.mjs';

export const PROMOTION_HISTORY_PATH = () => join(getEngineRoot(), '_state', 'promotion-history.json');
export const POSITIONS_PATH = () => join(getWorldMachineRoot(), '_Inbox', 'Market Positioning Ledger - Positions.md');

const REQUIRED_GATE3_FIELDS = Object.freeze([
  'trigger_evidence_paths',
  'primary_underlying',
  'directional_verdict',
  'refutation_reasoning',
]);

const REQUIRED_POSITION_FIELDS = Object.freeze([
  'Action Label',
  'Position State',
  'Direction Tag',
  'Purpose Tag',
  'Instrument',
  'Structure',
  'Entry',
  'Stop / Invalidation',
  'Target 1',
  'Target 2',
  'Max Loss',
  'Max Profit',
  'Reward:Risk',
  'Breakeven',
  'Sizing',
  'Hold Window',
  'Conviction',
  'Correlation',
  'Exit Plan',
  'Catalyst Calendar',
]);

const REQUIRED_OPTION_TAGS = Object.freeze([
  'Direction Exposure',
  'Protection',
  'Income',
  'Volatility Stance',
  'Defined Risk',
]);

export async function loadPromotionHistory(path = PROMOTION_HISTORY_PATH()) {
  if (!existsSync(path)) return defaultHistory();
  try {
    const data = JSON.parse(await readFile(path, 'utf8'));
    if (!Array.isArray(data.records)) data.records = [];
    return { ...defaultHistory(), ...data, records: data.records };
  } catch {
    return defaultHistory();
  }
}

export async function appendPromotionHistory(records, path = PROMOTION_HISTORY_PATH()) {
  const items = Array.isArray(records) ? records.filter(Boolean) : [];
  if (!items.length) return defaultHistory();
  const history = await loadPromotionHistory(path);
  history.updated_at = new Date().toISOString();
  history.records.push(...items);
  history.summary = summarizePromotionHistory(history.records);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(history, null, 2), 'utf8');
  return history;
}

export async function guardLedgerPromotions({
  candidates,
  ledgerMarkdown,
  positionsMarkdown,
  promotionHistory,
  runId,
  agent,
  liveRefutation = false,
  evaluateRefutation = evaluateThesisAdversarially,
  asOfDate = new Date().toISOString().slice(0, 10),
} = {}) {
  const out = { allowed: [], blocked: [], records: [] };
  if (!Array.isArray(candidates) || !candidates.length) return out;

  const ledgerRows = parseActiveLedgerRows(ledgerMarkdown || '');
  const history = promotionHistory ?? defaultHistory();

  for (const candidate of candidates) {
    const baseRecord = buildBaseRecord({ candidate, runId, agent, asOfDate });
    const toGate = Number(candidate?.to_gate);

    if (toGate === 4) {
      block(out, candidate, baseRecord, 'outcome-review-required');
      continue;
    }

    if (toGate !== 3) {
      allow(out, candidate, baseRecord, 'not-gate-3');
      continue;
    }

    const row = findExactLedgerRow(ledgerRows, candidate?.row);
    if (!row) {
      block(out, candidate, baseRecord, 'no-exact-row-match');
      continue;
    }
    if (Number(row.gate) !== 2) {
      block(out, candidate, baseRecord, `source-row-gate-${row.gate ?? 'unknown'}-not-2`);
      continue;
    }

    const missing = missingGate3Fields(candidate);
    if (missing.length) {
      block(out, candidate, { ...baseRecord, missing_fields: missing }, 'missing-gate3-fields');
      continue;
    }

    const positionCheck = validatePositionBlock({ row, positionsMarkdown });
    if (!positionCheck.ok) {
      block(out, candidate, { ...baseRecord, position_check: positionCheck }, positionCheck.reason);
      continue;
    }

    const priorCalls = findPriorCalls({
      history,
      row: candidate.row,
      primaryUnderlying: candidate.primary_underlying,
    });
    if (!priorCalls.length) {
      block(out, candidate, { ...baseRecord, prior_calls_count: 0 }, 'first-call-context-only');
      continue;
    }

    const verdict = {
      symbol: String(candidate.primary_underlying).toUpperCase(),
      verdict: String(candidate.directional_verdict).toUpperCase(),
      confidence_pct: candidate.confidence_pct == null ? null : Number(candidate.confidence_pct),
      thesis_date: asOfDate,
      thesis_name: candidate.row,
      reasoning: candidate.refutation_reasoning,
      evidence_paths: normalizeStringArray(candidate.trigger_evidence_paths),
    };

    let result;
    try {
      result = await evaluateRefutation({
        verdict,
        runId,
        dryRun: !liveRefutation,
        priorCalls,
      });
    } catch (err) {
      block(out, candidate, {
        ...baseRecord,
        prior_calls_count: priorCalls.length,
        refutation_error: err.message,
      }, 'refutation-error');
      continue;
    }

    const refutationRecord = {
      ...baseRecord,
      primary_underlying: verdict.symbol,
      directional_verdict: verdict.verdict,
      confidence_pct: verdict.confidence_pct,
      prior_calls_count: priorCalls.length,
      refutation_reason: result?.reason ?? null,
      verdict_survives: result?.verdict_survives ?? null,
      refuted_count: result?.refuted_count ?? null,
      challenge_count: result?.challenge_count ?? null,
      discrimination_mode: result?.discrimination_mode ?? 'trajectory-aware',
    };

    if (result?.verdict_survives === true) {
      allow(out, candidate, refutationRecord, 'trajectory-refutation-survived');
    } else if (result?.verdict_survives === false) {
      block(out, candidate, refutationRecord, 'quorum-refuted');
    } else {
      block(out, candidate, refutationRecord, liveRefutation ? 'insufficient-refutation-panel' : 'refutation-live-required');
    }
  }

  return out;
}

export function finalizePromotionRecords({ guardRecords = [], reconciliation, checklistPath = null } = {}) {
  const appliedRows = new Set((reconciliation?.applied ?? []).map(item => normalizeRow(item.row)));
  const skippedByRow = new Map((reconciliation?.skipped ?? []).map(item => [normalizeRow(item.row), item.reason ?? 'reconciler-skipped']));

  return guardRecords.map(record => {
    if (record.status === 'blocked') return record;
    const rowKey = normalizeRow(record.row);
    if (appliedRows.has(rowKey)) {
      return {
        ...record,
        status: 'applied',
        applied: true,
        checklist_path: Number(record.to_gate) === 3 ? checklistPath : null,
      };
    }
    return {
      ...record,
      status: 'skipped',
      applied: false,
      reason: skippedByRow.get(rowKey) ?? 'not-applied',
    };
  });
}

export function validatePositionBlock({ row, positionsMarkdown }) {
  const slug = extractPositionSlug(row?.position_block);
  if (!slug) return { ok: false, reason: 'position-block-link-missing' };
  const section = extractHeadingSection(positionsMarkdown || '', slug);
  if (!section) return { ok: false, reason: 'position-block-not-found', slug };
  if (!/\*\*Position Reasoning\.\*\*/i.test(section)) {
    return { ok: false, reason: 'position-reasoning-missing', slug };
  }
  const fields = parseFieldTable(section);
  const missingFields = REQUIRED_POSITION_FIELDS.filter(field => !hasUsableValue(fields.get(field)));
  if (missingFields.length) {
    return { ok: false, reason: 'position-fields-incomplete', slug, missing_fields: missingFields };
  }
  if (/option/i.test(fields.get('Instrument') || '') || /option/i.test(fields.get('Structure') || '') || /Option-Tag Stack/i.test(section)) {
    const missingTags = REQUIRED_OPTION_TAGS.filter(tag => !hasUsableValue(fields.get(tag)));
    if (missingTags.length) {
      return { ok: false, reason: 'option-tags-incomplete', slug, missing_fields: missingTags };
    }
  }
  return { ok: true, reason: 'position-block-complete', slug };
}

export function findPriorCalls({ history, row, primaryUnderlying }) {
  const rowKey = normalizeRow(row);
  const underlyingKey = normalizeRow(primaryUnderlying);
  const records = Array.isArray(history?.records) ? history.records : [];
  return records
    .filter(record => {
      const status = String(record.status || '').toLowerCase();
      if (!['applied', 'blocked', 'skipped'].includes(status)) return false;
      return normalizeRow(record.row) === rowKey || (underlyingKey && normalizeRow(record.primary_underlying) === underlyingKey);
    })
    .map(record => ({
      row: record.row,
      symbol: record.primary_underlying,
      verdict: record.directional_verdict,
      confidence_pct: record.confidence_pct,
      attempted_at: record.attempted_at,
      status: record.status,
      reason: record.reason,
      verdict_survives: record.verdict_survives,
      refuted_count: record.refuted_count,
    }));
}

function defaultHistory() {
  return {
    schema_version: 1,
    source: 'ledger-promotion-guard',
    updated_at: null,
    records: [],
    summary: {},
  };
}

function buildBaseRecord({ candidate, runId, agent, asOfDate }) {
  return {
    run_id: runId ?? null,
    agent: agent ?? null,
    row: candidate?.row ?? null,
    from_gate: candidate?.from_gate ?? null,
    to_gate: candidate?.to_gate ?? null,
    reason: null,
    status: 'pending',
    applied: false,
    attempted_at: asOfDate,
    primary_underlying: candidate?.primary_underlying ?? null,
    directional_verdict: candidate?.directional_verdict ?? null,
    confidence_pct: candidate?.confidence_pct ?? null,
    prior_calls_count: null,
    verdict_survives: null,
    refuted_count: null,
    checklist_path: null,
  };
}

function allow(out, candidate, record, reason) {
  out.allowed.push(candidate);
  out.records.push({ ...record, status: 'allowed', applied: false, reason });
}

function block(out, candidate, record, reason) {
  out.blocked.push({ ...candidate, reason });
  out.records.push({ ...record, status: 'blocked', applied: false, reason });
}

function missingGate3Fields(candidate) {
  const missing = [];
  for (const field of REQUIRED_GATE3_FIELDS) {
    const value = candidate?.[field];
    if (Array.isArray(value)) {
      if (!value.length) missing.push(field);
    } else if (value == null || String(value).trim() === '') {
      missing.push(field);
    }
  }
  return missing;
}

function findExactLedgerRow(rows, rowName) {
  const needle = normalizeRow(rowName);
  return rows.find(row => normalizeRow(row.signal) === needle) ?? null;
}

function extractPositionSlug(link) {
  const text = String(link ?? '');
  const match = text.match(/#([^\]|]+)/);
  return match ? match[1].trim().replace(/\\\|/g, '|') : '';
}

function extractHeadingSection(markdown, slug) {
  const escaped = escapeRegExp(slug);
  const heading = new RegExp(`^##\\s+${escaped}\\s*$`, 'im');
  const match = heading.exec(markdown);
  if (!match) return '';
  const restStart = match.index + match[0].length;
  const rest = markdown.slice(restStart);
  const next = /^##\s+/m.exec(rest);
  return rest.slice(0, next ? next.index : rest.length);
}

function parseFieldTable(section) {
  const fields = new Map();
  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    if (line.includes('---')) continue;
    const cells = splitMarkdownRow(line);
    if (cells.length < 2) continue;
    if (/^(Field|Tag)$/i.test(cells[0])) continue;
    fields.set(cells[0], cells[1]);
  }
  return fields;
}

function splitMarkdownRow(line) {
  const trimmed = String(line).trim().replace(/^\|/, '').replace(/\|$/, '');
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

function hasUsableValue(value) {
  const text = String(value ?? '').trim();
  return Boolean(text) && !/^(_?pending_?|tbd|n\/a|not applicable)$/i.test(text);
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
  return String(value ?? '').split(',').map(item => item.trim()).filter(Boolean);
}

function normalizeRow(value) {
  return String(value ?? '').toLowerCase().trim();
}

function summarizePromotionHistory(records) {
  const summary = { total_records: records.length, by_status: {}, by_reason: {} };
  for (const record of records) {
    summary.by_status[record.status] = (summary.by_status[record.status] ?? 0) + 1;
    summary.by_reason[record.reason] = (summary.by_reason[record.reason] ?? 0) + 1;
  }
  return summary;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
