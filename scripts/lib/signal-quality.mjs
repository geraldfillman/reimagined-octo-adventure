/**
 * signal-quality.mjs — Phase 5 scoring engine.
 *
 * Computes per-module signal quality scores from:
 *   - Run ledger JSONs          → reliability, freshness
 *   - Vault pull note ack_status → noise rate, hit rate proxy
 *   - Outcome-review vault notes → confirmed hit rate (when available)
 *
 * Pure data layer: reads files only, never writes.
 */

import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getPullsDir } from './config.mjs';
import { readFolder } from './frontmatter.mjs';

const SIDECAR_DIR    = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.cache', 'orchestrator', 'streamline-reports');
const RUN_LEDGER_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.cache', 'orchestrator', 'run-ledgers');

// Modules scored by this engine. Maps to their vault data_type and owning agent.
export const MODULE_REGISTRY = Object.freeze([
  { id: 'auction-features',  puller: 'auction-features',  data_type: 'auction_features',  domain: 'Market',       agent_id: 'market' },
  { id: 'pead-watch',        puller: 'pead-watch',         data_type: 'pead_watch',         domain: 'Market',       agent_id: 'market' },
  { id: 'pair-metrics',      puller: 'pair-metrics',       data_type: 'pair_metrics',       domain: 'Market',       agent_id: 'market' },
  { id: 'cash-flow-quality', puller: 'cash-flow-quality',  data_type: 'cfq_analysis',       domain: 'Fundamentals', agent_id: 'fundamentals' },
  { id: 'macro-volatility',  puller: 'macro-volatility',   data_type: 'macro_volatility',   domain: 'Macro',        agent_id: 'macro' },
  { id: 'cot-report',        puller: 'cot-report',         data_type: 'cot_report',         domain: 'Macro',        agent_id: 'macro' },
  { id: 'cboe',              puller: 'cboe',               data_type: 'cboe_vix',           domain: 'Market',       agent_id: 'market' },
  { id: 'fred',              puller: 'fred',               data_type: 'fred_series',        domain: 'Macro',        agent_id: 'macro' },
  { id: 'confluence-scan',   puller: 'confluence-scan',    data_type: 'confluence_scan',    domain: 'Orchestrator', agent_id: 'orchestrator' },
]);

// Composite weights. Must sum to 1.
const W_HIT         = 0.4;
const W_INV_NOISE   = 0.3;
const W_RELIABILITY = 0.2;
const W_FRESHNESS   = 0.1;

// Modules with composite_score below this threshold are flagged low_quality.
export const LOW_QUALITY_THRESHOLD = 0.3;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(days) {
  const d = new Date(`${todayStr()}T00:00:00`);
  d.setDate(d.getDate() - Number(days));
  return d.toISOString().slice(0, 10);
}

function clamp01(v) {
  return Math.max(0, Math.min(1, Number(v) || 0));
}

function r2(v) {
  return Math.round(Number(v) * 100) / 100;
}

function daysBetween(a, b) {
  return Math.max(0, (new Date(`${a}T00:00:00`) - new Date(`${b}T00:00:00`)) / 86_400_000);
}

// ─── Raw data loaders ────────────────────────────────────────────────────────

async function loadJsonDir(dir, since) {
  if (!existsSync(dir)) return [];
  let files;
  try {
    files = (await readdir(dir))
      .filter(f => f.endsWith('.json') && f.slice(0, 10) >= since)
      .sort();
  } catch { return []; }
  const results = await Promise.all(files.map(async f => {
    try { return JSON.parse(await readFile(join(dir, f), 'utf-8')); }
    catch { return null; }
  }));
  return results.filter(Boolean);
}

async function loadPullNotes(domain) {
  try { return await readFolder(join(getPullsDir(), domain), false); }
  catch { return []; }
}

async function loadOutcomeNotes() {
  try {
    const notes = await readFolder(join(getPullsDir(), 'Orchestrator'), false);
    return notes.filter(n => n.data?.data_type === 'outcome_review');
  } catch { return []; }
}

// ─── Per-module score components ─────────────────────────────────────────────

function computeReliability(pullerName, ledgers) {
  const relevant = ledgers.filter(l => (l.entries ?? []).some(e => e.puller === pullerName));
  if (!relevant.length) return { reliability_score: 0.5, freshness_score: 0.5, last_success: null };

  let successes = 0;
  let failures  = 0;
  let lastSuccessDate = null;

  for (const ledger of relevant) {
    const entry = (ledger.entries ?? []).find(e => e.puller === pullerName);
    if (!entry) continue;
    if (entry.status === 'success') {
      successes++;
      if (!lastSuccessDate || ledger.date > lastSuccessDate) lastSuccessDate = ledger.date;
    } else if (entry.status === 'failed') {
      failures++;
    }
  }

  const total = successes + failures;
  const reliability_score = total ? clamp01(successes / total) : 0.5;

  let freshness_score = 0.5;
  if (lastSuccessDate) {
    const age = daysBetween(todayStr(), lastSuccessDate);
    freshness_score = clamp01(1 - age / 7);
  }

  return { reliability_score, freshness_score, last_success: lastSuccessDate };
}

function computeAckStats(notes, data_type) {
  const matching = notes.filter(n => String(n.data?.data_type || '') === data_type);
  const counts = { reviewed: 0, journaled: 0, ignored: 0, unreviewed: 0 };
  for (const note of matching) {
    const s = String(note.data?.ack_status ?? 'unreviewed');
    counts[s in counts ? s : 'unreviewed']++;
  }
  const assessed = counts.reviewed + counts.journaled + counts.ignored;
  if (!assessed) return { hit_rate: 0.5, noise_rate: 0.0, ack_counts: counts, assessed: 0 };

  const hit_rate   = clamp01((counts.reviewed + counts.journaled) / assessed);
  const noise_rate = clamp01(counts.ignored / assessed);
  return { hit_rate, noise_rate, ack_counts: counts, assessed };
}

function outcomeHitRate(outcomeNotes, moduleId) {
  const relevant = outcomeNotes.filter(n => {
    const src = String(n.data?.source_module ?? n.data?.module ?? '');
    return src === moduleId || src.includes(moduleId);
  });
  if (!relevant.length) return null;
  const confirmed = relevant.filter(n => n.data?.outcome_confirmed === true).length;
  return clamp01(confirmed / relevant.length);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Compute signal quality scores for all tracked modules.
 *
 * @param {number} windowDays — look-back window in days (default 30)
 * @returns {Record<string, ModuleScore>}
 *
 * ModuleScore shape:
 *   { reliability_score, freshness_score, hit_rate, noise_rate,
 *     composite_score, low_quality, last_success,
 *     ack_counts, assessed, domain, agent_id, puller }
 */
export async function computeModuleScores(windowDays = 30) {
  const since = daysAgo(windowDays);

  const [ledgers, outcomeNotes] = await Promise.all([
    loadJsonDir(RUN_LEDGER_DIR, since),
    loadOutcomeNotes(),
  ]);

  // Load pull notes per domain once (deduped)
  const domains = [...new Set(MODULE_REGISTRY.map(m => m.domain))];
  const domainNotes = Object.fromEntries(
    await Promise.all(domains.map(async d => [d, await loadPullNotes(d)]))
  );

  const scores = {};

  for (const mod of MODULE_REGISTRY) {
    const { reliability_score, freshness_score, last_success } = computeReliability(mod.puller, ledgers);
    const notes = domainNotes[mod.domain] ?? [];
    const ack   = computeAckStats(notes, mod.data_type);
    const confirmedHitRate = outcomeHitRate(outcomeNotes, mod.id);

    const hit_rate   = confirmedHitRate ?? ack.hit_rate;
    const noise_rate = ack.noise_rate;

    const composite_score = clamp01(
      hit_rate   * W_HIT +
      (1 - noise_rate) * W_INV_NOISE +
      reliability_score * W_RELIABILITY +
      freshness_score   * W_FRESHNESS
    );

    scores[mod.id] = {
      reliability_score: r2(reliability_score),
      freshness_score:   r2(freshness_score),
      hit_rate:          r2(hit_rate),
      noise_rate:        r2(noise_rate),
      composite_score:   r2(composite_score),
      low_quality:       composite_score < LOW_QUALITY_THRESHOLD,
      last_success,
      ack_counts:  ack.ack_counts,
      assessed:    ack.assessed,
      domain:      mod.domain,
      agent_id:    mod.agent_id,
      puller:      mod.puller,
    };
  }

  return scores;
}

/**
 * Summarize a scores map into dashboard-friendly metadata.
 */
export function summarizeScores(scores) {
  const entries = Object.entries(scores);
  if (!entries.length) return { modules_scored: 0, low_quality_modules: [], top_module: null, bottom_module: null };

  const sorted = entries.sort(([, a], [, b]) => b.composite_score - a.composite_score);
  const lowQuality = entries.filter(([, s]) => s.low_quality).map(([id]) => id);

  return {
    modules_scored:     entries.length,
    low_quality_modules: lowQuality,
    top_module:    sorted[0]?.[0] ?? null,
    bottom_module: sorted[sorted.length - 1]?.[0] ?? null,
  };
}
