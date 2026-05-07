/**
 * signal-intelligence.mjs - canonical strategy, thesis, and market-cycle signal layer.
 *
 * Reads local vault artifacts only. No live web requests and no thesis mutation.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { existsSync } from 'node:fs';

import {
  getEngineCacheDir,
  getEngineRoot,
  getPullsDir,
  getResearchVaultRoot,
} from '../lib/config.mjs';
import { readFolder } from '../lib/frontmatter.mjs';
import { buildSignalIntelligenceNote, buildPayload } from '../lib/signal-intelligence.mjs';
import { loadMechanismMap, loadStrategyCatalog } from '../lib/report-context.mjs';
import { dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';
import { loadThesisWatchlists } from '../lib/thesis-watchlists.mjs';

const DEFAULT_SCOPE = 'all';
const VALID_SCOPES = new Set(['all', 'strategy', 'thesis', 'market-cycle']);
const MAX_ARTIFACTS = 2500;

export async function pull(flags = {}) {
  const dryRun = Boolean(flags['dry-run'] || flags.dryRun);
  const scope = normalizeScope(flags.scope || DEFAULT_SCOPE);
  const date = today();
  const [strategies, mechanisms, theses, artifacts, cycleStatusNotes] = await Promise.all([
    Promise.resolve(loadStrategyCatalog()),
    Promise.resolve(loadMechanismMap()),
    loadThesisWatchlists({ includeBaskets: true }).catch(() => []),
    readPullArtifacts(),
    readCycleStatusNotes(),
  ]);

  const payload = buildPayload({
    date,
    scope,
    strategies,
    theses,
    mechanisms,
    artifacts,
    cycleStatusNotes,
  });
  const markdown = buildSignalIntelligenceNote(payload);
  const outputRoot = process.env.SIGNAL_INTELLIGENCE_OUTPUT_ROOT || join(getPullsDir(), 'Signals');
  const cacheRoot = process.env.SIGNAL_INTELLIGENCE_CACHE_ROOT || getEngineCacheDir('signal-intelligence');
  const filePath = join(outputRoot, dateStampedFilename('Signal_Intelligence'));
  const sidecarPath = join(cacheRoot, `${date}.json`);

  if (dryRun) {
    console.log(markdown);
    const result = {
      source: 'signal-intelligence',
      dryRun: true,
      filePath: null,
      sidecarPath: null,
      signalStatus: payload.signal_status,
      cards: payload.cards,
      gapAudit: payload.gap_audit,
      markdown,
    };
    if (flags.json) console.log(JSON.stringify(summarizeResult(result), null, 2));
    return result;
  }

  writeNote(filePath, markdown);
  await mkdir(dirname(sidecarPath), { recursive: true });
  await writeFile(sidecarPath, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`Wrote signal intelligence: ${filePath}`);
  console.log(`Wrote signal intelligence sidecar: ${sidecarPath}`);

  const result = {
    source: 'signal-intelligence',
    dryRun: false,
    filePath,
    sidecarPath,
    signalStatus: payload.signal_status,
    cards: payload.cards,
    gapAudit: payload.gap_audit,
    markdown,
  };
  if (flags.json) console.log(JSON.stringify(summarizeResult(result), null, 2));
  return result;
}

async function readPullArtifacts() {
  const root = getPullsDir();
  if (!existsSync(root)) return [];
  const notes = await readFolder(root, true);
  return notes
    .filter(note => !normalizePath(note.path).toLowerCase().includes('/_archive/'))
    .filter(note => note.data?.data_type !== 'signal_intelligence')
    .map(note => enrichArtifact(note, root))
    .sort(compareArtifacts)
    .slice(0, MAX_ARTIFACTS);
}

async function readCycleStatusNotes() {
  const root = join(getResearchVaultRoot(), '01_Freshness', 'Market_Cycles');
  if (!existsSync(root)) return [];
  const notes = await readFolder(root, true);
  return notes.map(note => ({
    ...note,
    pullDomain: 'market-cycle',
    relPath: normalizePath(relative(getResearchVaultRoot(), note.path)),
  }));
}

function enrichArtifact(note, pullsRoot) {
  const relToPulls = normalizePath(relative(pullsRoot, note.path));
  const pullDomain = relToPulls.split('/')[0] || '';
  return {
    ...note,
    pullDomain,
    relPath: normalizePath(relative(getEngineRoot(), note.path)),
  };
}

function compareArtifacts(left, right) {
  return artifactDate(right).localeCompare(artifactDate(left)) ||
    String(right.filename || '').localeCompare(String(left.filename || ''));
}

function artifactDate(note) {
  return String(note?.data?.date_pulled || note?.data?.date || filenameDate(note?.filename) || '');
}

function filenameDate(filename) {
  const match = String(filename || '').match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
}

function normalizeScope(value) {
  const normalized = String(value || DEFAULT_SCOPE).trim().toLowerCase();
  return VALID_SCOPES.has(normalized) ? normalized : DEFAULT_SCOPE;
}

function summarizeResult(result) {
  return {
    source: result.source,
    dryRun: result.dryRun,
    filePath: result.filePath,
    sidecarPath: result.sidecarPath,
    signalStatus: result.signalStatus,
    cardCount: result.cards.length,
    gapCount: result.gapAudit.length,
  };
}

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/');
}
