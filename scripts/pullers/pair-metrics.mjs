/**
 * pair-metrics.mjs — Daily pair spread / correlation metrics scan.
 *
 * Runs the pair agent for each unique "a" symbol in the configured watchlist
 * pairs, collects raw pair_details from all results, deduplicates by pair_id,
 * and generates a structured note showing z-score, correlation, half-life, and
 * pair status for all 17 configured pairs.
 *
 * Usage:
 *   node run.mjs pull pair-metrics
 *   node run.mjs pull pair-metrics --dry-run
 */

import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { runPairAgent } from '../agents/marketmind/pair-agent.mjs';
import { getPullsDir } from '../lib/config.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';

const WATCHLISTS_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'config', 'watchlists.json');

export async function pull(flags = {}) {
  const pairs = await loadPairs();
  if (!pairs.length) {
    console.log('Pair Metrics: no pairs configured in watchlists.json.');
    return { filePath: null, pairCount: 0 };
  }

  // Unique "a" symbols cover all configured pairs when the agent filters by symbol
  const aSymbols = [...new Set(pairs.map(p => p.a))];
  console.log(`Pair Metrics: scanning ${pairs.length} pairs via ${aSymbols.length} agent calls...`);

  // pair_id → metrics object (deduplicated across agent calls)
  const pairMap = new Map();

  for (const symbol of aSymbols) {
    try {
      const result = await runPairAgent({ symbol, asset_type: 'stock' });
      const details = result.raw_data?.pair_details ?? [];
      for (const pd of details) {
        if (pd.pair_id && !pairMap.has(pd.pair_id)) {
          pairMap.set(pd.pair_id, pd);
        }
      }
      console.log(`  ${symbol}: ${details.length} pair(s) computed`);
    } catch (err) {
      console.warn(`  ${symbol}: agent error — ${err.message}`);
    }
  }

  const note = buildPairNote({ pairs, pairMap });
  const filePath = join(getPullsDir(), 'Market', dateStampedFilename('Pair_Metrics'));

  if (flags['dry-run']) {
    console.log(note);
  } else {
    writeNote(filePath, note);
    console.log(`Wrote: ${filePath}`);
  }

  const alertCount = [...pairMap.values()].filter(pd => pd.status === 'broken').length;
  const watchCount = [...pairMap.values()].filter(pd => pd.status === 'stretched').length;
  return { filePath: flags['dry-run'] ? null : filePath, pairCount: pairMap.size, alertCount, watchCount };
}

function buildPairNote({ pairs, pairMap }) {
  const allMetrics   = [...pairMap.values()];
  const brokenCount  = allMetrics.filter(p => p.status === 'broken').length;
  const stretchedCount = allMetrics.filter(p => p.status === 'stretched').length;
  const overallStatus = brokenCount >= 2 ? 'alert' : stretchedCount >= 3 ? 'watch' : 'clear';

  // Sort by abs(z_60) descending — most stretched first
  const sorted = [...pairMap.entries()].sort(
    ([, a], [, b]) => Math.abs(b.z_60 ?? 0) - Math.abs(a.z_60 ?? 0)
  );

  const rows = pairs.map(pair => {
    const pd = pairMap.get(pair.id);
    if (!pd) {
      return [`${pair.a}/${pair.b}`, pair.id, 'no data', '—', '—', '—', '—'];
    }
    return [
      `${pair.a}/${pair.b}`,
      pair.id,
      pd.status    ?? '—',
      pd.z_60      != null ? fmtNum(pd.z_60)      : '—',
      pd.corr_120  != null ? fmtNum(pd.corr_120)  : '—',
      pd.half_life != null ? `${Math.round(pd.half_life)}d` : '—',
      signalFromStatus(pd.status),
    ];
  });

  // Also show top stretched pairs sorted by z_60 magnitude
  const stretchedRows = sorted
    .filter(([, pd]) => pd.status === 'stretched' || pd.status === 'broken')
    .map(([id, pd]) => {
      const pair = pairs.find(p => p.id === id);
      const label = pair ? `${pair.a}/${pair.b}` : id;
      return [label, id, pd.status, fmtNum(pd.z_60), fmtNum(pd.corr_120)];
    });

  return buildNote({
    frontmatter: {
      title:          'Pair Metrics',
      source:         'Vault Orchestrator',
      date_pulled:    today(),
      domain:         'market',
      agent_owner:    'market',
      agent_scope:    'market',
      data_type:      'pair_metrics',
      frequency:      'daily',
      pairs_scanned:  pairs.length,
      pairs_computed: pairMap.size,
      broken_count:   brokenCount,
      stretched_count: stretchedCount,
      signal_status:  overallStatus,
      signals:        overallStatus === 'clear' ? [] : ['pair-breakdown', 'pair-stretch'],
      tags:           ['pairs', 'spread', 'z-score', 'correlation', 'market-microstructure'],
    },
    sections: [
      {
        heading: 'Operating Rule',
        content: [
          '> Pair metrics show relative-value spread opportunities between historically correlated instruments.',
          '> Z-score > ±2.0 on a 60-day window indicates a stretched spread. Z > ±3.0 or correlation breakdown = broken.',
          '> Half-life is the expected mean-reversion time in days. Short half-life = faster convergence expected.',
          '> All entries require manual verification of entry timing, sizing, and macro context.',
        ].join('\n'),
      },
      {
        heading: 'All Pair Metrics',
        content: buildTable(
          ['Pair', 'ID', 'Status', 'Z-Score(60d)', 'Corr(120d)', 'Half-Life', 'Signal'],
          rows
        ),
      },
      ...(stretchedRows.length ? [{
        heading: 'Stretched / Broken Pairs (Sorted by |Z-Score|)',
        content: buildTable(
          ['Pair', 'ID', 'Status', 'Z-Score(60d)', 'Corr(120d)'],
          stretchedRows
        ),
      }] : []),
      {
        heading: 'Status Guide',
        content: [
          '- **normal**: Z-score within ±1.0 and correlation intact. No spread signal.',
          '- **stretched**: Z-score between ±1.0 and ±3.0. Mean-reversion candidate — size conservatively.',
          '- **broken**: Z-score > ±3.0 or correlation < 0.4. Relationship may have structurally changed.',
          '- **Corr(120d)**: Pearson correlation over the last 120 trading days.',
          '- **Half-Life**: Ornstein-Uhlenbeck half-life estimate in days.',
        ].join('\n'),
      },
    ],
  });
}

function signalFromStatus(status) {
  if (status === 'broken')    return 'ALERT';
  if (status === 'stretched') return 'WATCH';
  return 'NEUTRAL';
}

async function loadPairs() {
  try {
    const wl = JSON.parse(await readFile(WATCHLISTS_PATH, 'utf-8'));
    return (wl.pairs ?? []).map(p => ({ id: p.id, a: p.a, b: p.b }));
  } catch {
    return [];
  }
}

function fmtNum(val) {
  return val != null && Number.isFinite(Number(val)) ? Number(Number(val).toFixed(2)).toString() : '—';
}
