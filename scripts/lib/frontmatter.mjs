/**
 * frontmatter.mjs — Async YAML frontmatter parser for vault notes
 *
 * Parses the YAML subset used in this vault:
 *   - Quoted and unquoted string scalars
 *   - Inline arrays: ["value", "[[wikilink]]"]
 *   - Block arrays: \n  - item
 *   - Booleans (true/false), numbers, null
 *   - Multiline block scalars (|)
 *
 * Uses fs/promises only — no external dependencies.
 */

import { readFile, readdir, stat } from 'fs/promises';
import { join, basename } from 'path';

// ─── YAML scalar parser ──────────────────────────────────────────────────────

/**
 * Parse a single YAML scalar value (string, boolean, number, null).
 * @param {string} raw — trimmed raw value string
 * @returns {string|boolean|number|null}
 */
function parseScalar(raw) {
  if (raw === '' || raw === 'null' || raw === '~') return null;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  const num = Number(raw);
  if (!isNaN(num) && raw !== '') return num;
  // Strip surrounding quotes
  if ((raw.startsWith('"') && raw.endsWith('"')) ||
      (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1);
  }
  return raw;
}

/**
 * Parse an inline YAML array: ["item1", "[[wikilink]]", 42]
 * Handles quoted strings (including commas inside quotes) and bare values.
 * @param {string} raw — the full `[...]` string including brackets
 * @returns {Array}
 */
function parseInlineArray(raw) {
  const inner = raw.slice(1, -1).trim();
  if (!inner) return [];

  const items = [];
  let i = 0;
  while (i < inner.length) {
    // Skip whitespace and commas
    while (i < inner.length && (inner[i] === ',' || inner[i] === ' ')) i++;
    if (i >= inner.length) break;

    if (inner[i] === '"' || inner[i] === "'") {
      // Quoted string — find matching close quote
      const quote = inner[i];
      let j = i + 1;
      while (j < inner.length && inner[j] !== quote) j++;
      items.push(inner.slice(i + 1, j));
      i = j + 1;
    } else {
      // Bare value — read until comma or end
      let j = i;
      while (j < inner.length && inner[j] !== ',') j++;
      items.push(parseScalar(inner.slice(i, j).trim()));
      i = j;
    }
  }
  return items;
}

// ─── Frontmatter parser ──────────────────────────────────────────────────────

/**
 * Parse YAML frontmatter from a markdown string.
 * Returns the parsed data object and the body content after the closing `---`.
 *
 * @param {string} text — full markdown file content
 * @returns {{ data: Record<string, any>, content: string }}
 */
export function parseFrontmatter(text) {
  // Must start with ---
  if (!text.startsWith('---')) return { data: {}, content: text };

  const end = text.indexOf('\n---', 3);
  if (end === -1) return { data: {}, content: text };

  const yamlBlock = text.slice(4, end); // skip opening ---\n
  const content = text.slice(end + 4).replace(/^\n/, '');

  const data = {};
  const lines = yamlBlock.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    // Skip blank lines and comments
    if (!line.trim() || line.trimStart().startsWith('#')) { i++; continue; }

    // Key: value
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) { i++; continue; }

    const key = line.slice(0, colonIdx).trim();
    const rest = line.slice(colonIdx + 1).trim();

    if (!key) { i++; continue; }

    if (rest === '' || rest === '|' || rest === '>') {
      // Possibly a block sequence or block scalar starting on next line
      i++;
      if (i < lines.length && lines[i].trimStart().startsWith('- ')) {
        // Block array
        const arr = [];
        while (i < lines.length && lines[i].trimStart().startsWith('- ')) {
          arr.push(parseScalar(lines[i].trimStart().slice(2).trim()));
          i++;
        }
        data[key] = arr;
      } else if (rest === '|' || rest === '>') {
        // Multiline block scalar — collect indented lines
        const blockLines = [];
        while (i < lines.length && (lines[i].startsWith('  ') || lines[i] === '')) {
          blockLines.push(lines[i].replace(/^  /, ''));
          i++;
        }
        data[key] = blockLines.join('\n').trim();
      } else {
        data[key] = null;
      }
      continue;
    }

    // Inline array
    if (rest.startsWith('[')) {
      data[key] = parseInlineArray(rest);
      i++;
      continue;
    }

    // Scalar value
    data[key] = parseScalar(rest);
    i++;
  }

  return { data, content };
}

// ─── File readers ────────────────────────────────────────────────────────────

/**
 * Read and parse a single vault note.
 * Returns null on read or parse failure (non-fatal).
 *
 * @param {string} absolutePath
 * @returns {Promise<{ path: string, filename: string, data: Record<string, any>, content: string } | null>}
 */
export async function readNote(absolutePath) {
  try {
    const text = await readFile(absolutePath, 'utf-8');
    const { data, content } = parseFrontmatter(text);
    return { path: absolutePath, filename: basename(absolutePath), data, content };
  } catch {
    return null;
  }
}

/**
 * Read all .md files in a directory.
 *
 * @param {string} absoluteDirPath
 * @param {boolean} [recursive=false]
 * @returns {Promise<Array<{ path: string, filename: string, data: Record<string, any>, content: string }>>}
 */
export async function readFolder(absoluteDirPath, recursive = false) {
  let entries;
  try {
    entries = await readdir(absoluteDirPath);
  } catch {
    return [];
  }

  const results = [];
  for (const entry of entries) {
    const full = join(absoluteDirPath, entry);
    let info;
    try { info = await stat(full); } catch { continue; }

    if (info.isDirectory() && recursive) {
      const nested = await readFolder(full, true);
      results.push(...nested);
    } else if (info.isFile() && entry.endsWith('.md')) {
      const note = await readNote(full);
      if (note) results.push(note);
    }
  }
  return results;
}

/**
 * Read all .md files in a directory that match a frontmatter predicate.
 *
 * @param {string} dir
 * @param {(data: Record<string, any>) => boolean} predicate
 * @param {boolean} [recursive=false]
 * @returns {Promise<Array<{ path: string, filename: string, data: Record<string, any>, content: string }>>}
 */
export async function readFolderWhere(dir, predicate, recursive = false) {
  const all = await readFolder(dir, recursive);
  return all.filter(note => predicate(note.data));
}
