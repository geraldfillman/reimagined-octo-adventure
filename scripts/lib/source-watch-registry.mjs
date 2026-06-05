import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

import { getResearchVaultRoot, getReviewVaultRoot } from './config.mjs';

export function slugifySource(value) {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'source';
}

export function resolveRegistryPath(flags = {}) {
  const configured = flags.registry || flags['registry-path'];
  if (configured) return resolve(String(configured));
  const reviewPath = join(getReviewVaultRoot(), 'Reports', 'System', 'config', 'source-watch-registry.json');
  if (existsSync(reviewPath)) return reviewPath;
  return join(getResearchVaultRoot(), '99_System', 'config', 'source-watch-registry.json');
}

export function loadRegistry(flags = {}) {
  const path = resolveRegistryPath(flags);
  if (!existsSync(path)) {
    throw new Error(`Source watch registry not found: ${path}`);
  }
  const text = readFileSync(path, 'utf-8').replace(/^\uFEFF/, '');
  return normalizeRegistry(JSON.parse(text));
}

export function normalizeRegistry(raw) {
  const rows = Array.isArray(raw?.sources) ? raw.sources : [];
  return {
    schemaVersion: Number(raw?.schema_version || raw?.schemaVersion || 1),
    generatedFrom: raw?.generated_from || raw?.generatedFrom || '',
    generatedOn: raw?.generated_on || raw?.generatedOn || '',
    sources: rows.map(normalizeSource).filter(source => source.source && source.url),
  };
}

export function selectSources(registry, flags = {}) {
  const includeDisabled = Boolean(flags.includeDisabled || flags['include-disabled']);
  const sourceFilter = normalizeFilter(flags.source || flags.sources || '');
  const categoryFilter = flags.category ? normalizeCategory(flags.category) : '';
  const limit = Math.max(0, Number.parseInt(flags.limit, 10) || 0);

  let sources = registry.sources.filter(source => includeDisabled || source.enabled);

  if (sourceFilter) {
    sources = sources.filter(source => {
      const haystack = `${source.id} ${source.source}`.toLowerCase();
      return haystack.includes(sourceFilter) || slugifySource(haystack).includes(slugifySource(sourceFilter));
    });
  }

  if (categoryFilter) {
    sources = sources.filter(source => normalizeCategory(source.category).includes(categoryFilter));
  }

  if (limit > 0) sources = sources.slice(0, limit);
  return sources;
}

function normalizeSource(row) {
  const source = String(row.source || row.name || '').trim();
  const access = normalizeText(row.access || 'free_or_partial');
  const enabled = row.enabled === false ? false : access !== 'premium';
  return {
    id: slugifySource(row.id || source),
    source,
    url: String(row.url || row.link || '').trim(),
    sourceUrl: String(row.source_url || row.sourceUrl || row.url || '').trim(),
    category: normalizeCategory(row.category || 'general_research'),
    focus: asArray(row.focus),
    updateStyle: String(row.update_style || row.updateStyle || '').trim(),
    access,
    cadence: normalizeText(row.cadence || 'unknown'),
    signalQuality: row.signal_quality ?? row.signalQuality ?? null,
    technicalDepth: row.technical_depth ?? row.technicalDepth ?? null,
    tags: asArray(row.tags),
    targetFolderHint: row.target_folder_hint || row.targetFolderHint || '_Inbox/90_Ready_to_Route/Content_Candidates',
    feedUrl: row.feed_url || row.feedUrl || null,
    enabled,
  };
}

function asArray(value) {
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
  if (!value) return [];
  return String(value).split(/[,;]/).map(item => item.trim()).filter(Boolean);
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'unknown';
}

function normalizeFilter(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeCategory(value) {
  return normalizeText(value);
}



