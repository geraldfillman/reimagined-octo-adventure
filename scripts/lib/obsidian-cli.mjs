/**
 * obsidian-cli.mjs — Thin wrapper around the Obsidian CLI.
 *
 * Requires Obsidian to be open and the obsidian CLI installed.
 * All functions are silent no-ops if Obsidian is not running (safe for cron).
 *
 * Usage:
 *   import { setProperty, appendContent, openNote } from './obsidian-cli.mjs';
 *   setProperty(notePath, 'signal_status', 'alert');
 */

import { execSync } from 'child_process';
import { relative } from 'path';
import { getVaultRoot } from './config.mjs';

/**
 * Resolve a vault-relative path from an absolute path.
 * obsidian CLI `path=` parameter expects a path relative to vault root.
 */
function vaultRelative(absPath) {
  return relative(getVaultRoot(), absPath).replace(/\\/g, '/');
}

/**
 * Set a single frontmatter property on a note via obsidian CLI.
 * No-op if Obsidian is not running.
 *
 * @param {string} absPath - Absolute path to the note
 * @param {string} name    - Property name
 * @param {string} value   - Property value
 */
export function setProperty(absPath, name, value) {
  try {
    const path = vaultRelative(absPath);
    execSync(`obsidian property:set name="${name}" value="${value}" path="${path}" silent`, {
      stdio: 'ignore',
      timeout: 5000,
    });
  } catch {
    // Obsidian not running or CLI not installed — frontmatter written by puller is source of truth
  }
}

/**
 * Set multiple frontmatter properties on a note in one CLI round-trip per property.
 *
 * @param {string} absPath   - Absolute path to the note
 * @param {Object} props     - Key/value pairs to set
 */
export function setProperties(absPath, props) {
  for (const [name, value] of Object.entries(props)) {
    setProperty(absPath, name, String(value));
  }
}

/**
 * Append content to a note via obsidian CLI.
 * No-op if Obsidian is not running.
 *
 * @param {string} absPath  - Absolute path to the note
 * @param {string} content  - Content to append (use \n for newlines)
 */
export function appendContent(absPath, content) {
  try {
    const path = vaultRelative(absPath);
    const escaped = content.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    execSync(`obsidian append path="${path}" content="${escaped}" silent`, {
      stdio: 'ignore',
      timeout: 5000,
    });
  } catch {
    // No-op
  }
}

/**
 * Open a note in Obsidian.
 *
 * @param {string} absPath - Absolute path to the note
 */
export function openNote(absPath) {
  try {
    const path = vaultRelative(absPath);
    execSync(`obsidian open path="${path}"`, { stdio: 'ignore', timeout: 5000 });
  } catch {
    // No-op
  }
}
