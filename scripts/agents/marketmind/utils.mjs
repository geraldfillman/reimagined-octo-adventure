import { relative, sep } from 'node:path';
import { getVaultRoot } from '../../lib/config.mjs';

export function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - Number(days || 0));
  return date.toISOString().slice(0, 10);
}

export function compactNumber(value, decimals = 1) {
  if (value === null || value === undefined || value === '') return 'N/A';
  const n = Number(value);
  if (!Number.isFinite(n)) return 'N/A';
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(decimals)}T`;
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(decimals)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(decimals)}M`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(decimals)}K`;
  return n.toFixed(decimals);
}

export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || value === '') return 'N/A';
  const n = Number(value);
  return Number.isFinite(n) ? `${n.toFixed(decimals)}%` : 'N/A';
}

export function formatDecimal(value, decimals = 2) {
  if (value === null || value === undefined || value === '') return 'N/A';
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(decimals) : 'N/A';
}

export function safeJson(value) {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return '{}';
  }
}

export function slugify(value) {
  return String(value || '')
    .replace(/[<>:"/\\|?*]+/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function filePathToWikiLink(filePath) {
  const rel = relative(getVaultRoot(), filePath).split(sep).join('/');
  return `[[${rel.replace(/\.md$/i, '')}]]`;
}

export function textIncludesAny(text, terms) {
  const haystack = String(text || '').toLowerCase();
  return terms.some(term => haystack.includes(String(term).toLowerCase()));
}

export function extractKeywords(values) {
  return [...new Set(values
    .flatMap(value => String(value || '').split(/[^A-Za-z0-9.$-]+/))
    .map(value => value.trim())
    .filter(value => value.length >= 3)
    .slice(0, 40))];
}
