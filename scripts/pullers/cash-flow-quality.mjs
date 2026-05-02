/**
 * cash-flow-quality.mjs — Daily cash-flow quality scan for high-moat stocks.
 *
 * Runs the fundamentals agent for all CFQ symbols in watchlists.json and
 * generates a structured note showing CFQ score, FCF conversion, net cash
 * position, and signal for manual review. Focuses on capital-efficiency
 * and earnings quality rather than growth metrics.
 *
 * Usage:
 *   node run.mjs pull cash-flow-quality
 *   node run.mjs pull cash-flow-quality --symbols AAPL,MSFT,V
 *   node run.mjs pull cash-flow-quality --dry-run
 */

import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { runFundamentalsAgent } from '../agents/marketmind/fundamentals-agent.mjs';
import { getPullsDir } from '../lib/config.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';

const WATCHLISTS_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'config', 'watchlists.json');

const DEFAULT_SYMBOLS = ['V', 'MA', 'MSFT', 'AAPL', 'COST', 'CME', 'SPGI', 'MCO'];

export async function pull(flags = {}) {
  const symbolOverride = flags.symbols
    ? String(flags.symbols).toUpperCase().split(',').map(s => s.trim()).filter(Boolean)
    : null;

  const { symbols, categories } = symbolOverride
    ? { symbols: symbolOverride, categories: {} }
    : await loadCfqSymbols();

  console.log(`Cash Flow Quality: scanning ${symbols.length} symbol(s)...`);

  const results = [];
  for (const symbol of symbols) {
    try {
      const result = await runFundamentalsAgent({ symbol, asset_type: 'stock' });
      results.push({ symbol, result });
      const score = result.raw_data?.cfq_score;
      const label = result.raw_data?.cfq_label ?? '—';
      console.log(`  ${symbol}: CFQ ${score ?? 'N/A'} (${label})`);
    } catch (err) {
      console.warn(`  ${symbol}: agent error — ${err.message}`);
      results.push({ symbol, result: null });
    }
  }

  const note = buildCfqNote({ results, categories });
  const filePath = join(getPullsDir(), 'Fundamentals', dateStampedFilename('Cash_Flow_Quality'));

  if (flags['dry-run']) {
    console.log(note);
  } else {
    writeNote(filePath, note);
    console.log(`Wrote: ${filePath}`);
  }

  const highQuality = results.filter(r => (r.result?.raw_data?.cfq_score ?? 0) >= 3.5).length;
  const lowQuality  = results.filter(r => r.result?.raw_data?.cfq_score != null && r.result.raw_data.cfq_score < 2.0).length;
  return { filePath: flags['dry-run'] ? null : filePath, symbolCount: symbols.length, highQuality, lowQuality };
}

function buildCfqNote({ results, categories }) {
  const scored       = results.filter(r => r.result?.raw_data?.cfq_score != null);
  const highCount    = scored.filter(r => r.result.raw_data.cfq_score >= 3.5).length;
  const lowCount     = scored.filter(r => r.result.raw_data.cfq_score < 2.0).length;
  const overallStatus = lowCount >= 3 ? 'watch' : highCount >= scored.length * 0.7 ? 'clear' : 'clear';

  // Sort by CFQ score descending
  const sortedResults = [...results].sort((a, b) => {
    const sa = a.result?.raw_data?.cfq_score ?? -1;
    const sb = b.result?.raw_data?.cfq_score ?? -1;
    return sb - sa;
  });

  const rows = sortedResults.map(({ symbol, result }) => {
    if (!result) {
      return [symbol, '—', '—', '—', '—', '—', '—', 'agent error'];
    }
    const rd = result.raw_data ?? {};
    return [
      symbol,
      rd.cfq_score != null    ? Number(rd.cfq_score).toFixed(1)     : '—',
      rd.cfq_label            ?? '—',
      rd.revenue_growth_pct != null ? `${fmtNum(rd.revenue_growth_pct)}%` : '—',
      rd.gross_margin_pct != null   ? `${fmtNum(rd.gross_margin_pct)}%`   : '—',
      rd.trailing_fcf != null ? compactNum(rd.trailing_fcf) : '—',
      rd.net_cash != null     ? compactNum(rd.net_cash)     : '—',
      result.signal           ?? '—',
    ];
  });

  const categorySection = Object.keys(categories).length
    ? [{
        heading: 'Coverage by Category',
        content: Object.entries(categories)
          .map(([cat, syms]) => `**${cat.replace(/_/g, ' ')}**: ${syms.join(', ')}`)
          .join('\n'),
      }]
    : [];

  return buildNote({
    frontmatter: {
      title:          'Cash Flow Quality',
      source:         'Vault Orchestrator',
      date_pulled:    today(),
      domain:         'fundamentals',
      agent_owner:    'fundamentals',
      agent_scope:    'fundamentals',
      data_type:      'cfq_analysis',
      frequency:      'weekly',
      symbols_scanned: results.length,
      high_quality_count: highCount,
      low_quality_count:  lowCount,
      signal_status:  overallStatus,
      signals:        overallStatus === 'clear' ? [] : ['cash-flow-quality'],
      tags:           ['cfq', 'cash-flow-quality', 'fundamentals', 'fcf', 'moat'],
    },
    sections: [
      {
        heading: 'Operating Rule',
        content: [
          '> CFQ (Cash Flow Quality) measures earnings durability and capital efficiency.',
          '> Score ≥ 3.5 = high quality; 2.0–3.4 = acceptable; < 2.0 = low quality.',
          '> A deteriorating CFQ score is an early warning for dividend cuts or balance sheet stress.',
          '> Review alongside price action — CFQ is a quality filter, not a timing signal.',
        ].join('\n'),
      },
      {
        heading: 'CFQ Scan',
        content: buildTable(
          ['Symbol', 'CFQ Score', 'Label', 'Rev Growth%', 'Gross Margin%', 'Trailing FCF', 'Net Cash', 'Signal'],
          rows
        ),
      },
      ...categorySection,
      {
        heading: 'Metric Guide',
        content: [
          '- **CFQ Score**: 0–5 composite; weights FCF conversion, margins, and net cash position.',
          '- **Label**: `high` (≥3.5), `acceptable` (2.0–3.4), `low` (<2.0).',
          '- **Rev Growth%**: Revenue growth rate year-over-year (TTM).',
          '- **Gross Margin%**: Gross profit as a percentage of revenue (TTM).',
          '- **Trailing FCF**: Twelve-month trailing free cash flow (operating CF − capex).',
          '- **Net Cash**: Cash and equivalents minus total debt. Positive = net cash position.',
        ].join('\n'),
      },
    ],
  });
}

async function loadCfqSymbols() {
  try {
    const wl = JSON.parse(await readFile(WATCHLISTS_PATH, 'utf-8'));
    const cfq = wl.cash_flow_quality ?? {};
    const symbols = [...new Set(Object.values(cfq).flat())];
    return { symbols: symbols.length ? symbols : DEFAULT_SYMBOLS, categories: cfq };
  } catch {
    return { symbols: DEFAULT_SYMBOLS, categories: {} };
  }
}

function fmtNum(val) {
  const n = Number(val);
  return Number.isFinite(n) ? Number(n.toFixed(1)).toString() : '—';
}

function compactNum(val) {
  const n = Number(val);
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1e9)  return `${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6)  return `${(n / 1e6).toFixed(1)}M`;
  return n.toFixed(0);
}
