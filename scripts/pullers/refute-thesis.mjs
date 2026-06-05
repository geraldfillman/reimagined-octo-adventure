/**
 * refute-thesis.mjs — Phase 2 Adversarial Truth puller.
 *
 * Runs a refutation panel against one or more thesis verdicts. Default is
 * --dry-run (emits prompts, no LLM spend) per ROADMAP Operating Principle 5.
 *
 * Usage:
 *   # Single ad-hoc thesis, dry-run (default)
 *   node run.mjs pull refute-thesis --symbol=GEV --verdict=BULLISH --reasoning="AI power demand"
 *
 *   # Pull worst-accuracy verdicts from thesis-calibration, dry-run
 *   node run.mjs pull refute-thesis --from-backtest=BULLISH --limit=3
 *
 *   # Live LLM spend (opt-in)
 *   node run.mjs pull refute-thesis --from-backtest=BULLISH --limit=3 --live
 */

import { existsSync, readFileSync, mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

import { getEngineRoot, resolveWorldMachinePath } from '../lib/config.mjs';
import { today } from '../lib/markdown.mjs';
import { evaluateThesisAdversarially, LENSES } from '../lib/refutation-panel.mjs';

const CALIBRATION_PATH = join(getEngineRoot(), '_state', 'thesis-calibration.json');
const REFUTATION_LOG_DIR = join(getEngineRoot(), '_state', 'refutation-log');

export async function pull(flags = {}) {
  const asOfDate = String(flags.date || today()).slice(0, 10);
  const dryRun = !flags.live;
  const limit = flags.limit ? Number(flags.limit) : Infinity;

  const verdicts = collectVerdicts(flags, limit);

  if (!verdicts.length) {
    const empty = { asOfDate, dryRun, verdicts: [], note: 'No verdicts matched the filter.' };
    if (flags.json) console.log(JSON.stringify(empty, null, 2));
    else console.log('[refute-thesis] No verdicts to refute.');
    return empty;
  }

  const results = [];
  for (const verdict of verdicts) {
    const runId = `refute-${asOfDate}-${verdict.symbol}`;
    const result = await evaluateThesisAdversarially({ verdict, runId, dryRun });
    results.push({ verdict, result });
  }

  const payload = {
    schema_version: 1,
    asOfDate,
    dryRun,
    lenses: Object.values(LENSES).map(l => ({ key: l.key, role: l.role })),
    verdict_count: verdicts.length,
    survived_count: results.filter(r => r.result.verdict_survives === true).length,
    refuted_count: results.filter(r => r.result.verdict_survives === false).length,
    skipped_count: results.filter(r => r.result.verdict_survives === null).length,
    results,
  };

  if (!dryRun) saveRefutationLog(asOfDate, payload);

  if (flags.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    printSummary(payload);
  }
  return payload;
}

// ─── Verdict collection ─────────────────────────────────────────────────────

function collectVerdicts(flags, limit) {
  if (flags['from-backtest']) {
    return collectFromBacktest({ verdictFilter: String(flags['from-backtest']).toUpperCase(), limit });
  }
  if (flags.symbol && flags.verdict) {
    return [{
      symbol: String(flags.symbol).toUpperCase(),
      verdict: String(flags.verdict).toUpperCase(),
      confidence_pct: flags.confidence ? Number(flags.confidence) : null,
      thesis_date: flags['thesis-date'] || null,
      reasoning: flags.reasoning ? String(flags.reasoning) : null,
      evidence_paths: flags.evidence ? String(flags.evidence).split(',').map(s => s.trim()).filter(Boolean) : [],
    }];
  }
  return [];
}

function collectFromBacktest({ verdictFilter, limit }) {
  if (!existsSync(CALIBRATION_PATH)) return [];
  const calibration = JSON.parse(readFileSync(CALIBRATION_PATH, 'utf8'));
  const records = Array.isArray(calibration.records) ? calibration.records : [];
  const filtered = records.filter(r => !verdictFilter || r.verdict === verdictFilter);
  // Worst-first: prioritize Missed > Stale > Noisy > others
  const labelRank = { 'Missed': 0, 'Stale': 1, 'Noisy': 2, 'Directionally right / poorly timed': 3, 'Played out': 4, 'Rebuild': 5 };
  filtered.sort((a, b) => (labelRank[a.label] ?? 9) - (labelRank[b.label] ?? 9));
  return filtered.slice(0, limit).map(r => ({
    symbol: r.symbol,
    verdict: r.verdict,
    confidence_pct: r.confidence_pct,
    thesis_date: r.thesis_date,
    reasoning: `Backtest verdict from ${r.source_file}; realized return ${r.return_pct}% over window ${r.window_start}..${r.window_end}; backtest label: ${r.label}.`,
    evidence_paths: [r.source_file].filter(Boolean),
    _backtest: r,
  }));
}

// ─── Persistence ────────────────────────────────────────────────────────────

function saveRefutationLog(asOfDate, payload) {
  mkdirSync(REFUTATION_LOG_DIR, { recursive: true });
  const path = join(REFUTATION_LOG_DIR, `${asOfDate}.json`);
  let existing = { schema_version: 1, asOfDate, runs: [] };
  if (existsSync(path)) {
    try { existing = JSON.parse(readFileSync(path, 'utf8')); } catch { /* keep default */ }
    if (!Array.isArray(existing.runs)) existing.runs = [];
  }
  existing.runs.push({
    recorded_at: new Date().toISOString(),
    summary: {
      verdict_count: payload.verdict_count,
      survived_count: payload.survived_count,
      refuted_count: payload.refuted_count,
      skipped_count: payload.skipped_count,
    },
    results: payload.results.map(({ verdict, result }) => ({
      symbol: verdict.symbol,
      verdict: verdict.verdict,
      thesis_date: verdict.thesis_date,
      verdict_survives: result.verdict_survives,
      refuted_count: result.refuted_count,
      challenge_count: result.challenge_count,
      reason: result.reason,
      challenges: (result.challenges || []).map(c => ({
        from_agent: c.from_agent,
        signal_status: c.signal_status,
        summary: c.summary,
        confidence: c.confidence,
      })),
    })),
  });
  writeFileSync(path, JSON.stringify(existing, null, 2), 'utf8');
}

function printSummary(payload) {
  const mode = payload.dryRun ? 'DRY-RUN (no LLM spend)' : 'LIVE';
  console.log(`[refute-thesis] Mode: ${mode}`);
  console.log(`[refute-thesis] Verdicts evaluated: ${payload.verdict_count}`);
  if (!payload.dryRun) {
    console.log(`[refute-thesis] Survived (≤1 refuted): ${payload.survived_count}`);
    console.log(`[refute-thesis] Refuted  (≥2 refuted): ${payload.refuted_count}`);
    console.log(`[refute-thesis] Skipped/insufficient:  ${payload.skipped_count}`);
  }
  for (const { verdict, result } of payload.results) {
    const tag = result.verdict_survives === true ? '✓ survives'
              : result.verdict_survives === false ? '✗ refuted'
              : '· skipped';
    console.log(`  ${tag}  ${verdict.verdict} ${verdict.symbol}${verdict.thesis_date ? ` (${verdict.thesis_date})` : ''} — ${result.reason}`);
  }
  if (payload.dryRun) {
    console.log(`\n[refute-thesis] Prompts emitted but no LLM calls made. Re-run with --live to spend tokens.`);
  }
}
