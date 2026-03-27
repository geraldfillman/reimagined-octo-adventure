/**
 * history.mjs — Read prior data pulls for period-over-period comparison
 *
 * Scans 05_Data_Pulls/ for existing notes, parses their frontmatter,
 * and extracts the most recent prior value for a given series.
 * This enables MoM and YoY change detection without any external database.
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getPullsDir } from './config.mjs';

/**
 * Find the most recent prior pull file for a given domain and source pattern.
 * @param {string} domain — subdirectory in 05_Data_Pulls/ (e.g., 'Housing', 'Macro')
 * @param {string} pattern — substring to match in filename (e.g., 'FRED_Housing')
 * @param {string} [excludeDate] — date to exclude (today's pull)
 * @returns {{ path: string, frontmatter: object, content: string } | null}
 */
export function findLatestPull(domain, pattern, excludeDate = null) {
  const dir = join(getPullsDir(), domain);
  if (!existsSync(dir)) return null;

  const files = readdirSync(dir)
    .filter(f => f.endsWith('.md') && f.includes(pattern))
    .sort()
    .reverse(); // newest first by date-stamp naming

  for (const file of files) {
    // Skip today's pull if specified
    if (excludeDate && file.startsWith(excludeDate)) continue;

    const filePath = join(dir, file);
    const content = readFileSync(filePath, 'utf-8');
    const frontmatter = parseFrontmatter(content);

    if (frontmatter) {
      return Object.freeze({ path: filePath, frontmatter, content });
    }
  }

  return null;
}

/**
 * Extract a numeric value from a prior pull's markdown table.
 * Searches for a row matching the seriesId and returns the most recent value.
 * @param {string} content — full markdown content of a prior pull
 * @param {string} seriesId — series identifier to search for (e.g., 'HOUST')
 * @returns {number|null}
 */
export function extractValueFromPull(content, seriesId) {
  // Look for table rows containing the series ID
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.includes('|') && line.includes(seriesId)) {
      // Extract numeric value from table cell
      const cells = line.split('|').map(c => c.trim()).filter(Boolean);
      for (const cell of cells) {
        const num = parseFloat(cell);
        if (!isNaN(num) && cell !== seriesId) {
          return num;
        }
      }
    }
  }
  return null;
}

/**
 * Extract the first numeric value from a table in a prior pull.
 * Useful for time series where the first data row is the most recent.
 * @param {string} content
 * @param {number} [valueColumn=1] — 0-indexed column to extract from
 * @returns {number|null}
 */
export function extractFirstTableValue(content, valueColumn = 1) {
  const lines = content.split('\n');
  let inTable = false;
  let headerPassed = false;

  for (const line of lines) {
    if (!line.includes('|')) {
      if (inTable) break; // end of table
      continue;
    }

    if (!inTable) {
      inTable = true;
      continue; // skip header row
    }

    if (!headerPassed) {
      // Skip separator row (| --- | --- |)
      if (line.includes('---')) {
        headerPassed = true;
        continue;
      }
    }

    // Extract value from the specified column
    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length > valueColumn) {
      const num = parseFloat(cells[valueColumn]);
      if (!isNaN(num)) return num;
    }
  }

  return null;
}

/**
 * Get all values from a specific column in a table.
 * @param {string} content
 * @param {number} [valueColumn=1]
 * @returns {number[]}
 */
export function extractColumnValues(content, valueColumn = 1) {
  const lines = content.split('\n');
  const values = [];
  let inTable = false;
  let headerPassed = false;

  for (const line of lines) {
    if (!line.includes('|')) {
      if (inTable && values.length > 0) break;
      continue;
    }

    if (!inTable) {
      inTable = true;
      continue;
    }

    if (!headerPassed) {
      if (line.includes('---')) {
        headerPassed = true;
        continue;
      }
    }

    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length > valueColumn) {
      const num = parseFloat(cells[valueColumn]);
      if (!isNaN(num)) values.push(num);
    }
  }

  return values;
}

/**
 * Calculate month-over-month percent change.
 * @param {number} current
 * @param {number} prior
 * @returns {number|null} — percent change, or null if inputs invalid
 */
export function momChange(current, prior) {
  if (current == null || prior == null || prior === 0) return null;
  return ((current - prior) / prior) * 100;
}

/**
 * Calculate simple point change.
 * @param {number} current
 * @param {number} prior
 * @returns {number|null}
 */
export function pointChange(current, prior) {
  if (current == null || prior == null) return null;
  return current - prior;
}

// --- Internal ---

/**
 * Parse YAML frontmatter from a markdown string.
 * @param {string} content
 * @returns {object|null}
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yaml = match[1];
  const fields = {};

  for (const line of yaml.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();

    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Parse arrays (simple inline style)
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1)
        .split(',')
        .map(v => v.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    }

    // Parse booleans and numbers
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (!isNaN(value) && value !== '') value = parseFloat(value);

    fields[key] = value;
  }

  return fields;
}

export { parseFrontmatter };
