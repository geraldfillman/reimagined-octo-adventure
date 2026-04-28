/**
 * filing-digest.mjs — Tool #2: AI Filing Digest.
 *
 * Morning digest of tagged SEC filings (S-1, S-3, 424B*, 8-K 1.01/3.02/5.02/8.01,
 * 10-K/10-Q) across a watchlist, grouped by tag category with plain-English
 * one-line summaries. The summarizer is rule-based (no LLM call required) —
 * extend via optional `kb compile` pipeline when you want AI narrative.
 *
 * Usage:
 *   node run.mjs pull filing-digest
 *   node run.mjs pull filing-digest --since 2026-04-20
 *   node run.mjs pull filing-digest --thesis drones
 */

import { join } from 'node:path';
import { getPullsDir } from '../lib/config.mjs';
import { buildNote, buildTable, writeNote, today, dateStampedFilename } from '../lib/markdown.mjs';
import { setProperties } from '../lib/obsidian-cli.mjs';
import { getByTicker, getAllTickers, getThesisTickers, stripCik } from '../lib/cik-map.mjs';
import {
  fetchRecentFilings,
  FORM_GROUPS,
  OFFERING_8K_ITEMS,
} from '../lib/edgar.mjs';

const DEFAULT_LOOKBACK_DAYS = 2;

/** Category → formType / item matchers + severity + one-liner template. */
const CATEGORIES = Object.freeze([
  {
    id: 'offering_announced',
    label: '💰 Offering / Raise',
    severity: 'alert',
    match: f => ['S-1', 'S-1/A', 'S-3', 'S-3/A', 'F-1', 'F-3'].includes(f.formType)
             || FORM_GROUPS.PROSPECTUS.includes(f.formType)
             || (f.formType.startsWith('8-K') && f.items?.includes(OFFERING_8K_ITEMS.UNREGISTERED_SALE)),
    summarize: f =>
      FORM_GROUPS.PROSPECTUS.includes(f.formType)
        ? `Prospectus supplement ${f.formType} — offering is pricing / drawing down shelf.`
        : f.formType.startsWith('S-') || f.formType.startsWith('F-')
          ? `Shelf registration ${f.formType} filed.`
          : `8-K Item 3.02 — unregistered securities sold.`,
  },
  {
    id: 'material_contract',
    label: '📝 Material Contract / Deal',
    severity: 'watch',
    match: f => f.formType.startsWith('8-K') && f.items?.includes(OFFERING_8K_ITEMS.MATERIAL_AGREEMENT),
    summarize: () => '8-K Item 1.01 — material definitive agreement entered (partnership, underwriter, supply, etc.).',
  },
  {
    id: 'executive_change',
    label: '👤 Executive / Board Change',
    severity: 'watch',
    match: f => f.formType.startsWith('8-K') && f.items?.includes('5.02'),
    summarize: () => '8-K Item 5.02 — officer/director change.',
  },
  {
    id: 'earnings',
    label: '📊 Earnings',
    severity: 'watch',
    match: f => f.formType.startsWith('8-K') && f.items?.includes('2.02'),
    summarize: () => '8-K Item 2.02 — earnings release.',
  },
  {
    id: 'fda_trial',
    label: '🧬 FDA / Trial Update',
    severity: 'alert',
    match: f => f.formType.startsWith('8-K') && f.items?.includes(OFFERING_8K_ITEMS.MATERIAL_EVENT),
    summarize: () => '8-K Item 8.01 — other material event (often FDA decision, trial readout, or guidance).',
  },
  {
    id: 'periodic',
    label: '📑 10-Q / 10-K',
    severity: 'watch',
    match: f => ['10-Q', '10-Q/A', '10-K', '10-K/A'].includes(f.formType),
    summarize: f => `${f.formType} periodic report filed.`,
  },
  {
    id: 'nasdaq_compliance',
    label: '⚠️ Nasdaq Compliance',
    severity: 'alert',
    match: f => f.formType.startsWith('8-K') && f.items?.includes(OFFERING_8K_ITEMS.NASDAQ_DELISTING),
    summarize: () => '8-K Item 3.01 — exchange listing / delisting notice.',
  },
]);

export async function pull(flags = {}) {
  const tickers = resolveWatchlist(flags);
  const since = flags.since
    ? String(flags.since)
    : daysAgo(Number(flags['lookback-days']) || DEFAULT_LOOKBACK_DAYS);

  console.log(`📰 Filing Digest: scanning ${tickers.length} ticker(s) since ${since}...`);

  const catBuckets = new Map(CATEGORIES.map(c => [c.id, []]));

  for (const ticker of tickers) {
    const meta = getByTicker(ticker);
    if (!meta?.cik) continue;
    try {
      const filings = await fetchRecentFilings(meta.cik, {
        formTypes: [...FORM_GROUPS.SHELF, ...FORM_GROUPS.PROSPECTUS, '8-K', '8-K/A', '10-Q', '10-Q/A', '10-K', '10-K/A'],
        since,
        limit: 25,
      });
      for (const f of filings) {
        for (const cat of CATEGORIES) {
          if (!cat.match(f)) continue;
          catBuckets.get(cat.id).push({
            ticker, company: meta.name, thesis: meta.thesis,
            filing: f, summary: cat.summarize(f),
          });
          break; // first match wins — categories are ordered most-critical-first
        }
      }
    } catch (err) {
      console.warn(`  ⚠️  ${ticker}: ${err.message}`);
    }
  }

  const sections = [];
  const signalCodes = [];

  for (const cat of CATEGORIES) {
    const hits = catBuckets.get(cat.id);
    if (hits.length === 0) continue;
    signalCodes.push(cat.id);

    const rows = hits.map(h => [
      h.filing.filingDate,
      `[${h.ticker}](../../08_Entities/Stocks/${h.ticker}.md)`,
      h.filing.formType,
      (h.filing.items ?? []).join(',') || '—',
      `[view](${edgarFilingLink(h)})`,
      h.summary,
    ]);

    sections.push({
      heading: `${cat.label} — ${hits.length}`,
      content: buildTable(['Date', 'Ticker', 'Form', 'Items', 'EDGAR', 'Summary'], rows),
    });
  }

  if (sections.length === 0) {
    sections.push({ heading: 'No Filings', content: '_No tagged filings in the window._' });
  }

  const signalStatus = signalCodes.some(id =>
    CATEGORIES.find(c => c.id === id)?.severity === 'alert')
    ? 'alert'
    : signalCodes.length > 0 ? 'watch' : 'clear';

  const filePath = join(getPullsDir(), 'Fundamentals', dateStampedFilename('Filing_Digest'));
  const content = buildNote({
    frontmatter: {
      title:         'SEC Filing Digest',
      source:        'SEC EDGAR',
      date_pulled:   today(),
      domain:        'fundamentals',
      data_type:     'digest',
      frequency:     'daily',
      signal_status: signalStatus,
      signals:       signalCodes,
      lookback_since: since,
      tickers_scanned: tickers.length,
      tags: ['sec', 'edgar', 'digest', 'fundamentals'],
    },
    sections: [
      ...sections,
      { heading: 'Methodology',
        content: [
          '- Categories are ordered most-severe-first; each filing counted exactly once under its first matching category.',
          '- Summaries are rule-based (no LLM). For narrative summaries pipe the filing body through `node run.mjs kb compile` with an 8-K template.',
          `- Sources: data.sec.gov/submissions (no key, 10 req/sec cap).`,
        ].join('\n'),
      },
    ],
  });

  writeNote(filePath, content);
  setProperties(filePath, { signal_status: signalStatus, date_pulled: today() });
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals: signalCodes };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveWatchlist(flags) {
  if (flags.tickers) {
    return String(flags.tickers).split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  }
  if (flags.thesis) {
    const t = getThesisTickers(String(flags.thesis).toLowerCase());
    if (t.length > 0) return t;
  }
  return getAllTickers();
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function edgarFilingLink({ ticker, filing }) {
  const meta = getByTicker(ticker);
  const cikNum = stripCik(meta.cik);
  return `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cikNum}&type=${encodeURIComponent(filing.formType)}&dateb=&owner=include&count=5`;
}
