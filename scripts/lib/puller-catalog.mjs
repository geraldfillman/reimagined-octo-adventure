import { existsSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

import { resolveEnginePath } from './config.mjs';

export function getDefaultCatalogPath() {
  return resolveEnginePath('99_System', 'config', 'puller-catalog.json');
}

export function loadPullerCatalog(catalogPath = getDefaultCatalogPath()) {
  const path = resolve(catalogPath);
  if (!existsSync(path)) return [];

  const parsed = JSON.parse(readFileSync(path, 'utf-8'));
  const entries = Array.isArray(parsed) ? parsed : parsed.pullers;
  if (!Array.isArray(entries)) {
    throw new Error(`Puller catalog must be an array or expose a "pullers" array: ${path}`);
  }

  return entries.map(normalizeCatalogEntry);
}

export function normalizeCatalogEntry(entry = {}) {
  const name = normalizeLinkedPullerName(entry.name);
  const module = entry.module || `${name}.mjs`;

  return Object.freeze({
    name,
    module,
    mode: String(entry.mode || 'raw').toLowerCase(),
    domains: arrayOfStrings(entry.domains),
    data_types: arrayOfStrings(entry.data_types),
    source_notes: arrayOfStrings(entry.source_notes),
    requires_keys: arrayOfStrings(entry.requires_keys),
    supports_dry_run: Boolean(entry.supports_dry_run),
    supports_json: Boolean(entry.supports_json),
    scheduled_allowed: Boolean(entry.scheduled_allowed),
    manual_only: Boolean(entry.manual_only),
    aliases: arrayOfStrings(entry.aliases).map(normalizeLinkedPullerName).filter(Boolean),
  });
}

export function normalizeLinkedPullers(value) {
  const rawParts = Array.isArray(value)
    ? value.flatMap(item => splitLinkedPullerValue(item))
    : splitLinkedPullerValue(value);

  const seen = new Set();
  const names = [];
  for (const part of rawParts) {
    const name = normalizeLinkedPullerName(part);
    if (!name || seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }
  return names;
}

export function normalizeLinkedPullerName(value) {
  if (value === null || value === undefined) return '';

  let text = String(value).trim();
  if (!text) return '';

  text = text
    .replace(/^['"`]+|['"`]+$/g, '')
    .replace(/\\/g, '/')
    .trim();

  const commandMatch = text.match(/^(?:node\s+run\.mjs\s+)?pull\s+([^\s]+)/i);
  if (commandMatch) text = commandMatch[1];

  text = text.replace(/^\.?\//, '');
  text = text.replace(/^scripts\/pullers\//i, '');
  text = text.replace(/^pullers\//i, '');

  if (text.includes('/')) text = basename(text);
  text = text.replace(/\.mjs$/i, '');

  const firstToken = text.split(/\s+/)[0];
  return firstToken
    .replace(/^[`'"]+|[`'"]+$/g, '')
    .trim()
    .toLowerCase();
}

export function resolveCatalogEntry(catalog, rawName) {
  const names = normalizeLinkedPullers(rawName);
  if (names.length === 0) return null;

  const entries = (catalog || []).map(normalizeCatalogEntry);
  for (const name of names) {
    const matched = entries.find(entry => {
      const moduleName = normalizeLinkedPullerName(entry.module);
      return entry.name === name || moduleName === name || entry.aliases.includes(name);
    });
    if (matched) return matched;
  }

  return null;
}

function splitLinkedPullerValue(value) {
  if (value === null || value === undefined) return [];
  const text = String(value).trim();
  if (!text) return [];
  return text
    .split(/\s*(?:,|\+|;|\band\b)\s*/i)
    .map(part => part.trim())
    .filter(Boolean);
}

function arrayOfStrings(value) {
  if (Array.isArray(value)) return value.map(item => String(item)).filter(Boolean);
  if (value === null || value === undefined || value === '') return [];
  return [String(value)];
}
