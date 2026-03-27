#!/usr/bin/env node
/**
 * validate-vault.mjs - Validate frontmatter and file layout for My_Data.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, sep } from 'path';
import { getVaultRoot } from './lib/config.mjs';
import {
  REQUIRED_PULL_FIELDS,
  REQUIRED_SOURCE_FIELDS,
  RECOMMENDED_SOURCE_FIELDS,
  SOURCE_CATEGORY_FOLDERS,
  VALID_SIGNAL_STATUSES,
  sourceCategoryFromPath,
} from './lib/schema.mjs';

const VAULT_ROOT = getVaultRoot();
const IGNORED_PATH_PARTS = new Set(['.obsidian', 'node_modules']);

export async function run() {
  const errors = [];
  const warnings = [];

  validateSources(errors, warnings);
  validatePulls(errors, warnings);

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

    const fileName = parts[parts.length - 1];
    if (!/^\d{4}-\d{2}-\d{2}_/.test(fileName)) {
      warnings.push(`Pull note filename is not date-stamped: ${rel}`);
    }
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
