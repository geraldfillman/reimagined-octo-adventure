#!/usr/bin/env node
/**
 * validate-vault.mjs - Validate frontmatter and file layout for My_Data.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, sep } from 'path';
import { getVaultRoot } from './lib/config.mjs';
import {
  DEPRECATED_THESIS_QLIB_FIELDS,
  QLIB_REPORT_SCHEMA_VERSION,
  QUANT_REQUIRED_FIELDS_BY_TYPE,
  REQUIRED_PULL_FIELDS,
  REQUIRED_SOURCE_FIELDS,
  REQUIRED_THESIS_FIELDS,
  RECOMMENDED_SOURCE_FIELDS,
  SOURCE_CATEGORY_FOLDERS,
  THESIS_FMP_COUNT_FIELDS,
  THESIS_FMP_DATE_FIELDS,
  THESIS_FMP_NUMERIC_FIELDS,
  THESIS_QLIB_CORE_FIELDS,
  THESIS_QLIB_OPTIONAL_BACKTEST_FIELDS,
  VALID_ALLOCATION_PRIORITIES,
  VALID_MOMENTUM_STATES,
  VALID_SIGNAL_STATUSES,
  VALID_TECHNICAL_BIASES,
  VALID_THESIS_CONVICTIONS,
  sourceCategoryFromPath,
} from './lib/schema.mjs';

const VAULT_ROOT = getVaultRoot();
const IGNORED_PATH_PARTS = new Set(['.obsidian', 'node_modules']);

export async function run() {
  const errors = [];
  const warnings = [];

  validateSources(errors, warnings);
  validatePulls(errors, warnings);
  validateTheses(errors, warnings);

  if (errors.length === 0 && warnings.length === 0) {
    console.log('Vault validation passed: no schema issues found.');
    return;
  }

  if (errors.length > 0) {
    console.log(`Errors (${errors.length})`);
    for (const err of errors) {
      console.log(`  - ${err}`);
    }
    console.log('');
  }

  if (warnings.length > 0) {
    console.log(`Warnings (${warnings.length})`);
    for (const warning of warnings) {
      console.log(`  - ${warning}`);
    }
    console.log('');
  }

  if (errors.length > 0) {
    process.exitCode = 1;
  }
}

function validateSources(errors, warnings) {
  const root = join(VAULT_ROOT, '01_Data_Sources');
  for (const filePath of walkMarkdown(root)) {
    const rel = relative(root, filePath);
    const parsed = readFrontmatter(filePath);
    if (!parsed) {
      errors.push(`Missing frontmatter: ${rel}`);
      continue;
    }

    const expectedCategory = sourceCategoryFromPath(rel);
    if (!SOURCE_CATEGORY_FOLDERS.includes(expectedCategory)) {
      errors.push(`Unexpected source folder "${expectedCategory}": ${rel}`);
    }

    for (const field of REQUIRED_SOURCE_FIELDS) {
      if (!parsed.fields.has(field)) {
        errors.push(`Source note missing "${field}": ${rel}`);
      }
    }

    const category = getScalarField(parsed.raw, 'category');
    if (category && category !== expectedCategory) {
      errors.push(`Category "${category}" does not match folder "${expectedCategory}": ${rel}`);
    }

    const integrated = getScalarField(parsed.raw, 'integrated');
    if (integrated && !['true', 'false'].includes(integrated)) {
      errors.push(`Integrated must be true/false: ${rel}`);
    }

    if (integrated === 'true') {
      for (const field of RECOMMENDED_SOURCE_FIELDS) {
        if (!parsed.fields.has(field)) {
          warnings.push(`Integrated source missing recommended "${field}": ${rel}`);
        }
      }
    }
  }
}

function validatePulls(errors, warnings) {
  const root = join(VAULT_ROOT, '05_Data_Pulls');
  for (const filePath of walkMarkdown(root)) {
    const rel = relative(root, filePath);
    const parsed = readFrontmatter(filePath);
    if (!parsed) {
      errors.push(`Missing frontmatter: ${rel}`);
      continue;
    }

    const parts = rel.split(sep);
    if (parts.length !== 2) {
      errors.push(`Pull note must live directly under a domain folder: ${rel}`);
    }

    for (const field of REQUIRED_PULL_FIELDS) {
      if (!parsed.fields.has(field)) {
        errors.push(`Pull note missing "${field}": ${rel}`);
      }
    }

    const signalStatus = getScalarField(parsed.raw, 'signal_status');
    if (signalStatus && !VALID_SIGNAL_STATUSES.includes(signalStatus)) {
      errors.push(`Invalid signal_status "${signalStatus}": ${rel}`);
    }

    validateQuantReport(parsed, rel, errors);

    const fileName = parts[parts.length - 1];
    if (!/^\d{4}-\d{2}-\d{2}_/.test(fileName)) {
      warnings.push(`Pull note filename is not date-stamped: ${rel}`);
    }
  }
}

export function validateQuantReport(parsed, rel, errors) {
  if (!rel.startsWith(`Quant${sep}`)) return;

  const dataType = getScalarField(parsed.raw, 'data_type');
  const schemaVersion = getScalarField(parsed.raw, 'qlib_schema_version');
  if (!schemaVersion) return;

  if (Number(schemaVersion) !== QLIB_REPORT_SCHEMA_VERSION) {
    errors.push(`Unsupported qlib_schema_version "${schemaVersion}": ${rel}`);
  }

  const requiredFields = QUANT_REQUIRED_FIELDS_BY_TYPE[dataType] ?? [];
  for (const field of requiredFields) {
    if (!parsed.fields.has(field)) {
      errors.push(`Quant note missing "${field}": ${rel}`);
    }
  }
}

function validateTheses(errors, warnings) {
  const root = join(VAULT_ROOT, '10_Theses');
  for (const filePath of walkMarkdown(root)) {
    const rel = relative(root, filePath);
    const parsed = readFrontmatter(filePath);
    if (!parsed) continue;
    validateThesisFrontmatter(parsed, rel, errors);
  }
}

export function validateThesisFrontmatter(parsed, rel, errors) {
  for (const field of REQUIRED_THESIS_FIELDS) {
    if (!parsed.fields.has(field)) {
      errors.push(`Thesis note missing "${field}": ${rel}`);
    }
  }

  const nodeType = getScalarField(parsed.raw, 'node_type');
  if (nodeType && nodeType !== 'thesis') {
    errors.push(`Thesis note has invalid node_type "${nodeType}": ${rel}`);
  }

  const conviction = getScalarField(parsed.raw, 'conviction');
  if (conviction && !VALID_THESIS_CONVICTIONS.includes(conviction)) {
    errors.push(`Invalid thesis conviction "${conviction}": ${rel}`);
  }

  for (const field of DEPRECATED_THESIS_QLIB_FIELDS) {
    if (parsed.fields.has(field)) {
      errors.push(`Deprecated thesis field "${field}" should be removed: ${rel}`);
    }
  }

  const qlibSignalStatus = getScalarField(parsed.raw, 'qlib_signal_status');
  if (qlibSignalStatus && !VALID_SIGNAL_STATUSES.includes(qlibSignalStatus)) {
    errors.push(`Invalid qlib_signal_status "${qlibSignalStatus}": ${rel}`);
  }

  const hasFullQlibSummary = [
    ...THESIS_QLIB_CORE_FIELDS.filter(field => field !== 'qlib_signal_status'),
    ...THESIS_QLIB_OPTIONAL_BACKTEST_FIELDS,
  ].some(field => parsed.fields.has(field));

  if (hasFullQlibSummary) {
    for (const field of THESIS_QLIB_CORE_FIELDS) {
      if (!parsed.fields.has(field)) {
        errors.push(`Thesis qlib summary missing "${field}": ${rel}`);
      }
    }

    const hasBacktestSharpe = parsed.fields.has('qlib_backtest_sharpe');
    const hasBacktestDate = parsed.fields.has('qlib_last_backtest_date');
    if (hasBacktestSharpe !== hasBacktestDate) {
      errors.push(`Thesis backtest fields must appear together: ${rel}`);
    }

    for (const field of ['qlib_last_run', 'qlib_last_score_date', 'qlib_last_backtest_date']) {
      const raw = getScalarField(parsed.raw, field);
      if (raw && !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        errors.push(`Thesis field "${field}" must be YYYY-MM-DD: ${rel}`);
      }
    }

    const suggestedConviction = getScalarField(parsed.raw, 'suggested_conviction');
    if (suggestedConviction && !VALID_THESIS_CONVICTIONS.includes(suggestedConviction)) {
      errors.push(`Invalid suggested_conviction "${suggestedConviction}": ${rel}`);
    }

    const suggestedAllocationPriority = getScalarField(parsed.raw, 'suggested_allocation_priority');
    if (suggestedAllocationPriority && !VALID_ALLOCATION_PRIORITIES.includes(suggestedAllocationPriority)) {
      errors.push(`Invalid suggested_allocation_priority "${suggestedAllocationPriority}": ${rel}`);
    }

    const rollingScore = getScalarField(parsed.raw, 'conviction_rolling_score_7d');
    if (rollingScore && Number.isNaN(Number(rollingScore))) {
      errors.push(`conviction_rolling_score_7d must be numeric: ${rel}`);
    }

    const signalCount = getScalarField(parsed.raw, 'conviction_signal_count_7d');
    if (signalCount && (!/^-?\d+$/.test(signalCount) || Number(signalCount) < 0)) {
      errors.push(`conviction_signal_count_7d must be a non-negative integer: ${rel}`);
    }
  }

  const primaryTechnicalStatus = getScalarField(parsed.raw, 'fmp_primary_technical_status');
  if (primaryTechnicalStatus && !VALID_SIGNAL_STATUSES.includes(primaryTechnicalStatus)) {
    errors.push(`Invalid fmp_primary_technical_status "${primaryTechnicalStatus}": ${rel}`);
  }

  const primaryTechnicalBias = getScalarField(parsed.raw, 'fmp_primary_technical_bias');
  if (primaryTechnicalBias && !VALID_TECHNICAL_BIASES.includes(primaryTechnicalBias)) {
    errors.push(`Invalid fmp_primary_technical_bias "${primaryTechnicalBias}": ${rel}`);
  }

  const primaryMomentumState = getScalarField(parsed.raw, 'fmp_primary_momentum_state');
  if (primaryMomentumState && !VALID_MOMENTUM_STATES.includes(primaryMomentumState)) {
    errors.push(`Invalid fmp_primary_momentum_state "${primaryMomentumState}": ${rel}`);
  }

  for (const field of THESIS_FMP_NUMERIC_FIELDS) {
    const raw = getScalarField(parsed.raw, field);
    if (raw && Number.isNaN(Number(raw))) {
      errors.push(`Thesis field "${field}" must be numeric: ${rel}`);
    }
  }

  for (const field of THESIS_FMP_COUNT_FIELDS) {
    const raw = getScalarField(parsed.raw, field);
    if (raw && (!/^-?\d+$/.test(raw) || Number(raw) < 0)) {
      errors.push(`Thesis field "${field}" must be a non-negative integer: ${rel}`);
    }
  }

  for (const field of [
    'conviction_last_signal_date',
    'emerging_pattern_first_seen',
    'emerging_pattern_last_seen',
    ...THESIS_FMP_DATE_FIELDS,
  ]) {
    const raw = getScalarField(parsed.raw, field);
    if (raw && !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      errors.push(`Thesis field "${field}" must be YYYY-MM-DD: ${rel}`);
    }
  }

  const streakDays = getScalarField(parsed.raw, 'emerging_pattern_streak_days');
  if (streakDays && (!/^-?\d+$/.test(streakDays) || Number(streakDays) < 0)) {
    errors.push(`emerging_pattern_streak_days must be a non-negative integer: ${rel}`);
  }
}

function walkMarkdown(root) {
  const files = [];
  for (const entry of readdirSync(root)) {
    if (IGNORED_PATH_PARTS.has(entry)) continue;
    const fullPath = join(root, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...walkMarkdown(fullPath));
    } else if (stats.isFile() && fullPath.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

function readFrontmatter(filePath) {
  const text = readFileSync(filePath, 'utf-8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return null;

  const raw = match[1];
  const fields = new Set();
  const fieldPattern = /^([A-Za-z_][A-Za-z0-9_-]*):/gm;
  let fieldMatch;
  while ((fieldMatch = fieldPattern.exec(raw)) !== null) {
    fields.add(fieldMatch[1]);
  }

  return { raw, fields };
}

function getScalarField(rawFrontmatter, fieldName) {
  const escaped = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = rawFrontmatter.match(new RegExp(`^${escaped}:\\s*(.+)$`, 'm'));
  if (!match) return '';
  return match[1].trim().replace(/^"|"$/g, '');
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  run();
}
