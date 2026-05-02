/**
 * signal-quality-scan.mjs — Phase 5 daily puller.
 *
 * Wraps signal-quality.mjs engine, emits:
 *   - Vault note: 05_Data_Pulls/Orchestrator/YYYY-MM-DD_Signal_Quality.md
 *   - Cache JSON: scripts/.cache/orchestrator/signal-quality/YYYY-MM-DD.json
 *
 * Usage:
 *   node run.mjs pull signal-quality-scan
 *   node run.mjs pull signal-quality-scan --window 60 --dry-run
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getPullsDir } from '../lib/config.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';
import { computeModuleScores, summarizeScores, LOW_QUALITY_THRESHOLD } from '../lib/signal-quality.mjs';

const CACHE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.cache', 'orchestrator', 'signal-quality');

const DEFAULT_WINDOW = 30;

export async function pull(flags = {}) {
  const windowDays = Math.max(7, Number(flags.window) || DEFAULT_WINDOW);
  const dryRun = Boolean(flags['dry-run']);

  console.log(`Signal Quality Scan: computing module scores over ${windowDays}-day window...`);

  const scores  = await computeModuleScores(windowDays);
  const summary = summarizeScores(scores);

  const note = buildSignalQualityScanNote(scores, summary, windowDays);
  const filePath = join(getPullsDir(), 'Orchestrator', dateStampedFilename('Signal_Quality'));

  if (dryRun) {
    console.log(note);
  } else {
    writeNote(filePath, note);
    await emitCache(scores, summary, windowDays);
    console.log(`Wrote: ${filePath}`);
  }

  const { low_quality_modules, top_module, bottom_module } = summary;
  console.log(`Scored ${summary.modules_scored} modules. Low quality: [${low_quality_modules.join(', ') || 'none'}]`);
  if (top_module)    console.log(`Top: ${top_module} (${scores[top_module]?.composite_score})`);
  if (bottom_module) console.log(`Bottom: ${bottom_module} (${scores[bottom_module]?.composite_score})`);

  return {
    filePath: dryRun ? null : filePath,
    modules_scored: summary.modules_scored,
    low_quality_modules,
    top_module,
    bottom_module,
  };
}

// ─── Note builder ────────────────────────────────────────────────────────────

export function buildSignalQualityScanNote(scores, summary, windowDays) {
  const rows = buildScoreRows(scores);
  const { low_quality_modules, top_module, bottom_module, modules_scored } = summary;

  return buildNote({
    frontmatter: {
      title:               `${today()} Signal Quality Scan`,
      source:              'Vault Orchestrator',
      date_pulled:         today(),
      domain:              'orchestrator',
      agent_owner:         'orchestrator',
      agent_scope:         'orchestrator',
      data_type:           'signal_quality',
      frequency:           'daily',
      cadence:             'daily',
      window_days:         windowDays,
      modules_scored,
      low_quality_modules,
      top_module:          top_module ?? null,
      bottom_module:       bottom_module ?? null,
      signal_status:       low_quality_modules.length ? 'watch' : 'clear',
      signals:             low_quality_modules.length ? ['low-quality-modules'] : [],
      tags:                ['signal-quality', 'phase5', 'scorecard'],
    },
    sections: [
      {
        heading: 'Module Scorecards',
        content: rows.length
          ? buildTable(
              ['Module', 'Composite', 'Hit Rate', 'Noise', 'Reliability', 'Freshness', 'Assessed', 'Status'],
              rows
            )
          : '_No run ledger data found. Run `node run.mjs pull agent-run` to generate ledger entries._',
      },
      {
        heading: 'Score Key',
        content: [
          '- **Composite** = Hit Rate × 0.4 + (1 − Noise) × 0.3 + Reliability × 0.2 + Freshness × 0.1',
          '- **Hit Rate** — share of acked notes marked reviewed/journaled (vs ignored); uses outcome-review confirmation when available.',
          '- **Noise** — share of acked notes marked ignored.',
          '- **Reliability** — success rate from run ledger over the window.',
          '- **Freshness** — how recently the puller last succeeded (full score ≤ 1 day, zero at 7+ days).',
          `- **Low quality** threshold: composite < ${LOW_QUALITY_THRESHOLD}. Low-quality modules are capped at 2 signals in daily Streamline Reports.`,
        ].join('\n'),
      },
    ],
  });
}

function buildScoreRows(scores) {
  return Object.entries(scores)
    .sort(([, a], [, b]) => b.composite_score - a.composite_score)
    .map(([id, s]) => {
      const badge = s.low_quality ? '🔴 low quality' : s.composite_score >= 0.6 ? '✅ reliable' : '⚠️ watch';
      return [
        id,
        pct(s.composite_score),
        pct(s.hit_rate),
        pct(s.noise_rate),
        pct(s.reliability_score),
        pct(s.freshness_score),
        s.assessed > 0 ? String(s.assessed) : '—',
        badge,
      ];
    });
}

function pct(value) {
  return `${Math.round(Number(value) * 100)}%`;
}

// ─── Cache emitter ───────────────────────────────────────────────────────────

async function emitCache(scores, summary, windowDays) {
  await mkdir(CACHE_DIR, { recursive: true });
  const payload = {
    date: today(),
    window_days: windowDays,
    ...summary,
    scores,
  };
  await writeFile(join(CACHE_DIR, `${today()}.json`), JSON.stringify(payload, null, 2), 'utf-8');
}
