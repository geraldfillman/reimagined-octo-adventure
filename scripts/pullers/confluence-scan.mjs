/**
 * confluence-scan.mjs — Daily strategy confluence scoring scan.
 *
 * Loads the latest streamline sidecar, macro-volatility, COT, and entropy
 * notes, scores every review item through confluence-scorer, and writes a
 * ranked vault note + JSON sidecar. No external I/O beyond reading cached
 * and vault-stored notes that already exist on disk.
 */

import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { classifyRegime, scoreSetup } from '../lib/confluence-scorer.mjs';
import { readFolderWhere } from '../lib/frontmatter.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';
import { getPullsDir, getSignalsDir } from '../lib/config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SR_SIDECAR_DIR = resolve(__dirname, '..', '.cache', 'orchestrator', 'streamline-reports');
const CONFLUENCE_SIDECAR_DIR = resolve(__dirname, '..', '.cache', 'orchestrator', 'confluence-scans');

export const SIDECAR_DIR = CONFLUENCE_SIDECAR_DIR;

export async function pull(flags = {}) {
  const dryRun = flags['dry-run'] ?? false;
  const date   = today();
  const pullsDir   = getPullsDir();
  const macroDir   = join(pullsDir, 'Macro');
  const marketDir  = join(pullsDir, 'Market');
  const signalsDir = getSignalsDir();

  // ── 1. Latest streamline sidecar ────────────────────────────────────────────
  const sidecar = await loadLatestJson(SR_SIDECAR_DIR);
  if (!sidecar?.review_items?.length) {
    return { filePath: null, signal_status: 'clear', setupCount: 0, approvedCount: 0, watchlistCount: 0, regimeLabel: null };
  }

  // ── 2. Macro-vol context ─────────────────────────────────────────────────────
  const macroNotes = existsSync(macroDir)
    ? await readFolderWhere(macroDir, d => d.data_type === 'macro_volatility')
    : [];
  const macroNote  = latestByDate(macroNotes);
  const stressRegime = macroNote?.data.stress_regime ?? 'low';
  const stressPct    = Number(macroNote?.data.stress_pct ?? 0);

  // ── 3. COT signal ────────────────────────────────────────────────────────────
  const cotNotes = existsSync(macroDir)
    ? await readFolderWhere(macroDir, d => d.data_type === 'cot_report')
    : [];
  const cotNote    = latestByDate(cotNotes);
  const cotSignal  = cotNote?.data.signal_status ?? null;

  // ── 4. Entropy / crowding signal ─────────────────────────────────────────────
  // entropy_level: 'low'/'compressed' → 'alert' (crowded); 'medium' → 'watch'; 'high' → 'clear'
  const entropyPred = d => d.data_type === 'entropy_monitor' || Boolean(d.entropy_level);
  const entropyNotes = [
    ...(existsSync(macroDir)   ? await readFolderWhere(macroDir,   entropyPred) : []),
    ...(existsSync(marketDir)  ? await readFolderWhere(marketDir,  entropyPred) : []),
    ...(existsSync(signalsDir) ? await readFolderWhere(signalsDir, entropyPred) : []),
  ];
  const entropyNote    = latestByDate(entropyNotes);
  const crowdingSignal = entropyToCrowding(entropyNote?.data.entropy_level);

  // ── 5. Module status map from sidecar coverage_items ────────────────────────
  const moduleStatuses = Object.fromEntries(
    (sidecar.coverage_items ?? [])
      .filter(c => c.module)
      .map(c => [c.module.toLowerCase(), c.status])
  );

  // ── 6. Classify regime ───────────────────────────────────────────────────────
  const regime = classifyRegime({
    stressRegime,
    stressPct,
    overallSignalStatus: sidecar.signal_status,
    cotSignal,
  });

  // ── 7. Score all review items and sort descending ────────────────────────────
  const ctx = { regimeLabel: regime.label, stressRegime, stressPct, moduleStatuses, crowdingSignal };
  const scored = sidecar.review_items
    .map(item => scoreSetup(item, ctx))
    .sort((a, b) => b.setup_score - a.setup_score);

  const approvedCount  = scored.filter(s => s.disposition === 'approved').length;
  const watchlistCount = scored.filter(s => s.disposition === 'watchlist').length;
  const rejectedCount  = scored.length - approvedCount - watchlistCount;
  const overallStatus  = approvedCount > 0 ? 'alert' : watchlistCount > 0 ? 'watch' : 'clear';

  // ── 8. Write vault note ──────────────────────────────────────────────────────
  const noteFilename = dateStampedFilename('Confluence_Scan');
  const outDir   = join(pullsDir, 'Orchestrator');
  const filePath = dryRun ? null : join(outDir, noteFilename);

  const note = buildConfluenceNote({
    date, regime, scored, ctx, cotSignal,
    approvedCount, watchlistCount, rejectedCount, overallStatus,
  });

  if (dryRun) {
    console.log(note);
  } else {
    await writeNote(filePath, note);
  }

  // ── 9. Write JSON sidecar ────────────────────────────────────────────────────
  if (!dryRun) {
    await mkdir(CONFLUENCE_SIDECAR_DIR, { recursive: true });
    await writeFile(
      join(CONFLUENCE_SIDECAR_DIR, `${date}.json`),
      JSON.stringify({
        schema_version: 1,
        date,
        signal_status: overallStatus,
        regime:            regime.label,
        regime_confidence: regime.confidence,
        regime_basis:      regime.basis,
        stress_regime:     stressRegime,
        stress_pct:        stressPct,
        cot_signal:        cotSignal,
        crowding_signal:   crowdingSignal,
        setup_count:       scored.length,
        approved_count:    approvedCount,
        watchlist_count:   watchlistCount,
        rejected_count:    rejectedCount,
        setups:            scored,
      }, null, 2)
    );
  }

  return { filePath, signal_status: overallStatus, setupCount: scored.length, approvedCount, watchlistCount, regimeLabel: regime.label };
}

// ── Vault note builder ────────────────────────────────────────────────────────

export function buildConfluenceNote({ date, regime, scored, ctx, cotSignal, approvedCount, watchlistCount, rejectedCount, overallStatus }) {
  const frontmatter = {
    title:             `Confluence Scan ${date}`,
    type:              'orchestrator_output',
    source:            'Vault Orchestrator',
    date_pulled:       date,
    domain:            'orchestrator',
    data_type:         'confluence_scan',
    frequency:         'weekly',
    signal_status:     overallStatus,
    signals:           overallStatus === 'clear' ? [] : ['confluence-watchlist'],
    regime_label:      regime.label,
    regime_confidence: regime.confidence,
    setup_count:       scored.length,
    approved_count:    approvedCount,
    watchlist_count:   watchlistCount,
    rejected_count:    rejectedCount,
    agent_owner:       'orchestrator',
    handoff_to:        ['orchestrator'],
    tags:              ['confluence', 'signals', 'orchestrator'],
  };

  const summaryTable = buildTable(
    ['Setup', 'Domain', 'Strategy', 'Score', 'Tier', 'Disposition'],
    scored.map(s => [s.title, s.domain, s.strategy, `${s.setup_score}/30`, s.score_tier, s.disposition])
  );

  const markerTable = buildTable(
    ['Setup', 'Reg', 'Mac', 'Sig', 'Fund', 'Auc', 'Vol', 'Liq', 'Opts', 'Crowd', 'Risk'],
    scored.map(s => [
      s.title,
      fmtMarker(s.markers.regime),
      fmtMarker(s.markers.macro),
      fmtMarker(s.markers.strategy),
      fmtMarker(s.markers.fundamental),
      fmtMarker(s.markers.auction),
      fmtMarker(s.markers.volume),
      fmtMarker(s.markers.liquidity),
      s.markers.options?.status ?? 'MISSING',
      fmtMarker(s.markers.crowding),
      fmtMarker(s.markers.risk),
    ])
  );

  const detailBlocks = scored
    .filter(s => s.setup_score >= 13)
    .map(s => buildSetupDetail(s))
    .join('\n\n---\n\n');

  return buildNote({
    frontmatter,
    sections: [
      {
        heading: `Regime: ${regime.label} (confidence ${regime.confidence}/3)`,
        content: [
          `*${regime.basis}*`,
          `> Stress: **${ctx.stressRegime}** (${ctx.stressPct}%) | COT: **${cotSignal ?? 'unavailable'}** | Crowding: **${ctx.crowdingSignal ?? 'unknown'}**`,
        ].join('\n'),
      },
      {
        heading: `Summary - ${scored.length} setups | ${approvedCount} approved | ${watchlistCount} watchlist | ${rejectedCount} rejected`,
        content: summaryTable,
      },
      {
        heading: 'Marker Grid',
        content: markerTable,
      },
      ...(detailBlocks ? [{
        heading: 'Setup Detail (Score >= 13 / Disposition: watchlist or approved)',
        content: detailBlocks,
      }] : []),
    ],
  });

  const sections = [
    `## Regime: ${regime.label} (confidence ${regime.confidence}/3)`,
    `*${regime.basis}*`,
    `> Stress: **${ctx.stressRegime}** (${ctx.stressPct}%) · COT: **${cotSignal ?? 'unavailable'}** · Crowding: **${ctx.crowdingSignal ?? 'unknown'}**`,
    '',
    `## Summary — ${scored.length} setups · ${approvedCount} approved · ${watchlistCount} watchlist · ${rejectedCount} rejected`,
    summaryTable,
    '',
    '## Marker Grid',
    markerTable,
    ...(detailBlocks ? ['', '## Setup Detail (Score ≥ 13 / Disposition: watchlist or approved)', detailBlocks] : []),
  ];

  return buildNote({ frontmatter, sections });
}

function buildSetupDetail(s) {
  const lines = [
    `### ${s.title} — ${s.setup_score}/30 (${s.score_tier})`,
    `*Domain: ${s.domain} · Strategy: ${s.strategy} · Edge: ${s.edge_type} · Signal: ${s.signal_status}*`,
    ...(s.regime_cap ? [`> ${s.regime_cap}`] : []),
    '',
    ...Object.entries(s.markers).map(([k, m]) =>
      `- **${k}**: ${m.status} (${m.score}/3) — ${m.note}`
    ),
    ...(s.vetoes.length ? ['', `**Vetoes:** ${s.vetoes.join(' · ')}`] : []),
  ];
  return lines.join('\n');
}

function fmtMarker(m) {
  if (!m) return '—';
  return `${m.status}(${m.score})`;
}

// ── Low-level helpers ─────────────────────────────────────────────────────────

async function loadLatestJson(dir) {
  if (!existsSync(dir)) return null;
  const files = (await readdir(dir)).filter(f => f.endsWith('.json')).sort().reverse();
  if (!files.length) return null;
  try { return JSON.parse(await readFile(join(dir, files[0]), 'utf8')); }
  catch { return null; }
}

function latestByDate(notes) {
  return notes
    .sort((a, b) => String(b.data.date_pulled ?? b.filename).localeCompare(String(a.data.date_pulled ?? a.filename)))
    .at(0) ?? null;
}

function entropyToCrowding(level) {
  if (!level) return null;
  const l = String(level).toLowerCase();
  if (l === 'low' || l === 'very_low' || l === 'compressed') return 'alert';
  if (l === 'medium' || l === 'moderate')                    return 'watch';
  return 'clear';
}
