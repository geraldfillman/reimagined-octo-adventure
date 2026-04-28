/**
 * capital-raise.mjs — Tool #3: Daily Capital Raise Digest.
 *
 * Market-wide sweep of offerings filed "today": prospectus supplements
 * (424B1–B8), S-1/S-3 shelf registrations going effective, and 8-K Item
 * 3.02 unregistered-sale disclosures. Uses the EDGAR EFTS full-text API
 * (no key, no watchlist needed).
 *
 * Output:
 *   05_Data_Pulls/Fundamentals/YYYY-MM-DD_Capital_Raise.md
 *     — grouped by form family, hyperlinked to EDGAR filing pages.
 *
 * Usage:
 *   node run.mjs pull capital-raise
 *   node run.mjs pull capital-raise --date 2026-04-22
 *   node run.mjs pull capital-raise --days 3   # widen to last 3 days
 */

import { join } from 'node:path';
import { getPullsDir } from '../lib/config.mjs';
import { buildNote, buildTable, writeNote, today, dateStampedFilename } from '../lib/markdown.mjs';
import { setProperties } from '../lib/obsidian-cli.mjs';
import { searchFullText } from '../lib/edgar.mjs';

/** EFTS form-family groupings — submitted as comma-joined forms param. */
const FAMILIES = Object.freeze([
  { id: 'prospectus',    label: '📄 Prospectus Supplements (424B*)', forms: ['424B1','424B2','424B3','424B4','424B5','424B7','424B8'], severity: 'alert' },
  { id: 'shelf',         label: '📚 Shelf Registrations (S-1/S-3/F-*)', forms: ['S-1','S-1/A','S-3','S-3/A','S-3ASR','F-1','F-3'], severity: 'watch' },
  { id: 'unregistered',  label: '🔒 Unregistered Sales (8-K 3.02)', forms: ['8-K'], itemFilter: '3.02', severity: 'alert' },
  { id: 'free_writing',  label: '📝 Free-Writing Prospectus (FWP)', forms: ['FWP'], severity: 'watch' },
]);

const MAX_HITS_PER_FAMILY = 40;

export async function pull(flags = {}) {
  const to   = flags.date ? String(flags.date) : todayStr();
  const days = Math.max(1, Number(flags.days) || 1);
  const from = shiftDays(to, -(days - 1));

  console.log(`📰 Capital Raise Digest: ${from} → ${to}`);

  const sections = [];
  const signalCodes = [];
  let totalHits = 0;

  for (const fam of FAMILIES) {
    const hits = await sweepFamily(fam, { dateFrom: from, dateTo: to });
    if (hits.length === 0) continue;
    totalHits += hits.length;
    signalCodes.push(fam.id);

    const rows = hits.slice(0, MAX_HITS_PER_FAMILY).map(h => [
      h.filedAt,
      h.ticker || '—',
      h.companyName ?? '—',
      h.formType,
      `[view](${h.edgarUrl})`,
    ]);

    sections.push({
      heading: `${fam.label} — ${hits.length}${hits.length > MAX_HITS_PER_FAMILY ? ` (showing first ${MAX_HITS_PER_FAMILY})` : ''}`,
      content: buildTable(['Filed', 'Ticker', 'Company', 'Form', 'Link'], rows),
    });
  }

  if (sections.length === 0) {
    sections.push({ heading: 'No Activity', content: `_No offering filings between ${from} and ${to}._` });
  }

  const signalStatus = signalCodes.includes('prospectus') || signalCodes.includes('unregistered')
    ? 'alert'
    : signalCodes.length > 0 ? 'watch' : 'clear';

  const filePath = join(getPullsDir(), 'Fundamentals', dateStampedFilename('Capital_Raise'));
  const content = buildNote({
    frontmatter: {
      title:          'Daily Capital Raise Digest',
      source:         'SEC EDGAR EFTS',
      date_pulled:    today(),
      domain:         'fundamentals',
      data_type:      'digest',
      frequency:      'daily',
      signal_status:  signalStatus,
      signals:        signalCodes,
      window_from:    from,
      window_to:      to,
      total_filings:  totalHits,
      tags: ['sec', 'capital-raise', 'offerings', 'digest'],
    },
    sections: [
      ...sections,
      { heading: 'How to Read',
        content: [
          '- **424B* prospectus** supplements mean an offering is actively pricing or a shelf is being drawn down — the clearest pre-gap signal.',
          '- **S-1 / S-3 / F-***: shelf registration (fresh capacity); less time-sensitive but worth watching when combined with ATM activity.',
          '- **8-K Item 3.02**: unregistered sales (private placements, converts, warrants) — discount is usually baked in at sign.',
          '- **FWP (free-writing)**: marketing document — appears adjacent to big-book IPO or secondary windows.',
        ].join('\n'),
      },
      { heading: 'Source',
        content: [
          '- **API**: efts.sec.gov/LATEST/search-index (free, no key).',
          '- **Window**: inclusive of both end dates.',
          '- Per-family hard cap: 40 rows. Widen the window or narrow with `--forms 424B5` if you need more.',
        ].join('\n'),
      },
    ],
  });

  writeNote(filePath, content);
  setProperties(filePath, { signal_status: signalStatus, date_pulled: today() });
  console.log(`📝 Wrote: ${filePath} (${totalHits} total filings)`);
  return { filePath, signals: signalCodes };
}

// ─── EFTS sweep ─────────────────────────────────────────────────────────────

async function sweepFamily(fam, { dateFrom, dateTo }) {
  const res = await searchFullText({
    forms: fam.forms, dateFrom, dateTo,
  }).catch(err => {
    console.warn(`  ⚠️  ${fam.id} sweep failed: ${err.message}`);
    return null;
  });

  const hits = res?.hits?.hits ?? [];
  const out = [];

  for (const h of hits) {
    const s = h._source ?? {};
    const tickers = Array.isArray(s.tickers) ? s.tickers : [];
    const companyName = s.display_names?.[0] ?? '—';
    const cik = h._id?.split(':')[0] ?? s.ciks?.[0] ?? '';
    const accession = s.adsh ?? '';
    const filedAt = s.file_date ?? s.filedAt ?? '';
    const formType = s.form ?? fam.forms[0];

    // Item filter — EFTS includes items for 8-K; filter in code since EFTS doesn't index by item number.
    if (fam.itemFilter && formType.startsWith('8-K')) {
      const items = s.items ?? '';
      if (!String(items).split(',').map(x => x.trim()).includes(fam.itemFilter)) continue;
    }

    out.push(Object.freeze({
      ticker: tickers[0] ?? null,
      companyName,
      cik,
      accession,
      filedAt,
      formType,
      edgarUrl: buildEdgarUrl(cik, accession),
    }));

    if (out.length >= MAX_HITS_PER_FAMILY) break;
  }

  return out;
}

function buildEdgarUrl(cik, accession) {
  if (!cik || !accession) return 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany';
  const accClean = accession.replace(/-/g, '');
  return `https://www.sec.gov/Archives/edgar/data/${String(cik).replace(/^0+/, '')}/${accClean}/${accession}-index.htm`;
}

function shiftDays(iso, delta) {
  const d = new Date(iso);
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
