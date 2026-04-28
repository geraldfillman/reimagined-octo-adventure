/**
 * markdown.mjs — Frontmatter + markdown note generator
 *
 * Pure functions for building Obsidian-compatible markdown notes.
 * All functions return new strings/objects — no mutation.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { writeRaw } from './kb-bridge.mjs';

/**
 * Build YAML frontmatter string from a fields object.
 * Handles strings, numbers, booleans, arrays, and nested objects.
 * @param {object} fields
 * @returns {string} — complete frontmatter block including --- delimiters
 */
export function buildFrontmatter(fields) {
  const lines = ['---'];

  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined) continue;
    lines.push(serializeYamlField(key, value, 0));
  }

  lines.push('---');
  return lines.join('\n');
}

/**
 * Build a pipe-delimited markdown table.
 * @param {string[]} headers — column names
 * @param {Array<string[]>} rows — array of row arrays
 * @returns {string}
 */
export function buildTable(headers, rows) {
  if (!headers.length) return '';

  const headerRow = `| ${headers.join(' | ')} |`;
  const separator = `| ${headers.map(() => '---').join(' | ')} |`;
  const dataRows = rows.map(row => {
    const cells = headers.map((_, i) => escapeTableCell(row[i] ?? ''));
    return `| ${cells.join(' | ')} |`;
  });

  return [headerRow, separator, ...dataRows].join('\n');
}

/**
 * Build a complete markdown note.
 * @param {object} options
 * @param {object} options.frontmatter — fields for YAML frontmatter
 * @param {Array<{heading: string, content: string}>} options.sections
 * @returns {string}
 */
export function buildNote({ frontmatter, sections }) {
  const parts = [buildFrontmatter(frontmatter), ''];

  for (const section of sections) {
    if (section.heading) {
      parts.push(`## ${section.heading}`, '');
    }
    if (section.content) {
      parts.push(section.content, '');
    }
  }

  return parts.join('\n');
}

/**
 * Write a note to disk. Creates parent directories if needed.
 * @param {string} filePath — absolute path
 * @param {string} content — full markdown content
 */
export function writeNote(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf-8');

  // Mirror into KB raw if this is a 05_Data_Pulls note.
  // Domain is inferred from the folder segment: 05_Data_Pulls/{Domain}/...
  const domainMatch = filePath.match(/05_Data_Pulls[/\\]([^/\\]+)[/\\]/i);
  if (domainMatch) {
    writeRaw(filePath, domainMatch[1].toLowerCase());
  }
}

/**
 * Format a number for display.
 * @param {number} value
 * @param {object} [options]
 * @param {string} [options.style] — 'currency' | 'compact' | 'percent' | 'decimal'
 * @param {number} [options.decimals=1]
 * @returns {string}
 */
export function formatNumber(value, options = {}) {
  const { style = 'decimal', decimals = 1 } = options;

  if (value === null || value === undefined || isNaN(value)) return 'N/A';

  if (style === 'currency') {
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(decimals)}B`;
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(decimals)}M`;
    if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  }

  if (style === 'compact') {
    if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(decimals)}B`;
    if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(decimals)}M`;
    if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(decimals)}K`;
    return value.toFixed(decimals);
  }

  if (style === 'percent') {
    return `${value.toFixed(decimals)}%`;
  }

  return value.toFixed(decimals);
}

/**
 * Get today's date as YYYY-MM-DD.
 * @returns {string}
 */
export function today() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Build a date-stamped filename.
 * @param {string} name — descriptive name (e.g., "FRED_Housing")
 * @param {string} [ext='.md']
 * @returns {string} — e.g., "2026-03-24_FRED_Housing.md"
 */
export function dateStampedFilename(name, ext = '.md') {
  return `${today()}_${sanitizeFilenameSegment(name)}${ext}`;
}

// --- Internal helpers ---

function serializeYamlField(key, value, indent) {
  const prefix = '  '.repeat(indent);

  if (typeof value === 'string') {
    // Quote strings that contain special YAML chars
    if (/[:#\[\]{}&*!|>%@`]/.test(value) || value.includes('\n')) {
      return `${prefix}${key}: "${value.replace(/"/g, '\\"')}"`;
    }
    return `${prefix}${key}: "${value}"`;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return `${prefix}${key}: ${value}`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return `${prefix}${key}: []`;
    // Simple arrays inline
    if (value.every(v => typeof v === 'string' || typeof v === 'number')) {
      const items = value.map(v => typeof v === 'string' ? `"${v}"` : v);
      return `${prefix}${key}: [${items.join(', ')}]`;
    }
    // Complex arrays — use block style
    const items = value.map(v => {
      if (typeof v === 'object') {
        const fields = Object.entries(v)
          .map(([k, val]) => serializeYamlField(k, val, indent + 2))
          .join('\n');
        return `${prefix}  -\n${fields}`;
      }
      return `${prefix}  - ${typeof v === 'string' ? `"${v}"` : v}`;
    });
    return `${prefix}${key}:\n${items.join('\n')}`;
  }

  if (typeof value === 'object') {
    const fields = Object.entries(value)
      .map(([k, v]) => serializeYamlField(k, v, indent + 1))
      .join('\n');
    return `${prefix}${key}:\n${fields}`;
  }

  return `${prefix}${key}: ${value}`;
}

function escapeTableCell(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function sanitizeFilenameSegment(value) {
  return String(value)
    .replace(/[<>:"/\\|?*]+/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}
