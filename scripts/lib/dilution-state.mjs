/**
 * dilution-state.mjs — JSON state store for delta detection.
 *
 * Records, per ticker:
 *   - last_seen_accession — the most recent EDGAR accession we alerted on
 *   - last_risk_class     — for risk-upgrade transition detection
 *   - last_run_at         — ISO timestamp
 *
 * Atomic-ish writes (write-to-temp + rename) so a mid-run crash can't
 * truncate the file. The state lives in scripts/.cache/dilution-state.json
 * and is excluded from git via the existing .cache convention.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { getVaultRoot } from './config.mjs';

const STATE_DIR  = () => join(getVaultRoot(), 'scripts', '.cache');
const STATE_PATH = () => join(STATE_DIR(), 'dilution-state.json');

/**
 * @typedef {object} TickerState
 * @property {string} [lastAccession]
 * @property {'low'|'medium'|'high'|'critical'} [lastRiskClass]
 * @property {string} [lastRunAt]          ISO timestamp
 * @property {string} [lastSignalPath]     path to most recent signal note
 */

/** @returns {Record<string, TickerState>} */
export function loadState() {
  const path = STATE_PATH();
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) ?? {};
  } catch {
    return {};
  }
}

/**
 * Write the full state atomically.
 * @param {Record<string, TickerState>} state
 */
export function saveState(state) {
  const path = STATE_PATH();
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf-8');
  renameSync(tmp, path);
}

/**
 * Merge a per-ticker update into state and return the new full-state object
 * (immutable — does not modify the input).
 *
 * @param {Record<string, TickerState>} state
 * @param {string} ticker
 * @param {Partial<TickerState>} patch
 * @returns {Record<string, TickerState>}
 */
export function upsertTicker(state, ticker, patch) {
  const prior = state[ticker] ?? {};
  return Object.freeze({
    ...state,
    [ticker]: Object.freeze({ ...prior, ...patch }),
  });
}

/** Convenience: has this accession already been alerted on? */
export function isNewAccession(state, ticker, accession) {
  if (!accession) return false;
  return state[ticker]?.lastAccession !== accession;
}

/** Return the prior risk class for transition checks, or null on first sighting. */
export function priorRiskClass(state, ticker) {
  return state[ticker]?.lastRiskClass ?? null;
}
