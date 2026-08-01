/**
 * koyfin-ingest.mjs — Ingest KoyFin CSV exports from the drop folder.
 *
 * Watches 00_Inbox/exports/koyfin/ for CSV files. Two layouts are supported:
 *   1. Time series (default multi-series export): first column a date,
 *      remaining columns one series each → Commodities pull note.
 *   2. Percentile ranks (ratios export): first column "Metric", stat columns
 *      with 5Y/Global/Sector percentile ranks → Market pull note.
 * Files are normalized into pull notes; raw CSVs ingested from the inbox
 * are archived to processed/.
 *
 * Usage:
 *   node run.mjs pull koyfin-ingest              # ingest all pending files
 *   node run.mjs pull koyfin-ingest --file path  # ingest one specific file
 *   node run.mjs pull koyfin-ingest --dry-run    # parse + report, no writes
 *
 * Output: 05_Data_Pulls/Commodities/YYYY-MM-DD_KoyFin_<name>.md
 */

import { join, basename, extname, dirname, resolve } from 'path';
import { readFileSync, readdirSync, mkdirSync, renameSync, existsSync } from 'fs';
import { getVaultRoot, getPullsDir } from '../lib/config.mjs';
import {
  buildNote, buildTable, writeNote, formatNumber,
  today, dateStampedFilename,
} from '../lib/markdown.mjs';

const INBOX_REL = join('00_Inbox', 'exports', 'koyfin');
const MAX_PREVIEW_ROWS = 12;

export async function pull(flags = {}) {
  const inboxDir = join(getVaultRoot(), INBOX_REL);
  const processedDir = join(inboxDir, 'processed');
  mkdirSync(processedDir, { recursive: true });

  let files;
  if (flags.file) {
    files = [flags.file];
  } else {
    files = readdirSync(inboxDir)
      .filter(f => extname(f).toLowerCase() === '.csv')
      .map(f => join(inboxDir, f));
  }

  if (files.length === 0) {
    console.log(`📥 KoyFin ingest: no pending CSV files in ${inboxDir}`);
    return { filePath: null, ingested: 0, signal_status: 'clear' };
  }

  console.log(`📥 KoyFin ingest: ${files.length} file(s) pending\n`);

  const results = [];
  for (const file of files) {
    try {
      const result = ingestFile(file, flags);
      results.push(result);
      console.log(`  ✅ ${basename(file)} → ${result.notePath ?? '(dry-run)'}`);
      // Archive any successfully ingested file that lives in the inbox drop
      // folder — including explicit --file ingests — so it is not re-ingested
      // on the next batch run. Files outside the inbox are left in place.
      const inInbox = dirname(resolve(file)).toLowerCase() === resolve(inboxDir).toLowerCase();
      if (!flags['dry-run'] && inInbox) {
        const archived = join(processedDir, `${today()}_${basename(file)}`);
        renameSync(file, archived);
      }
    } catch (err) {
      console.error(`  ❌ ${basename(file)}: ${err.message}`);
      results.push({ file, error: err.message });
    }
  }

  const ok = results.filter(r => !r.error);
  const failed = results.filter(r => r.error);
  console.log(`\n📥 Ingested ${ok.length}/${results.length} file(s)` +
    (failed.length ? ` — ${failed.length} failed (left in inbox)` : ''));

  return {
    filePath: ok[0]?.notePath ?? null,
    ingested: ok.length,
    failed: failed.length,
    signal_status: failed.length > 0 ? 'watch' : 'clear',
  };
}

// ─── Single-file ingest ─────────────────────────────────────────────────────────

function ingestFile(filePath, flags) {
  if (!existsSync(filePath)) throw new Error(`file not found: ${filePath}`);

  const rows = parseCsv(readFileSync(filePath, 'utf8'));
  if (rows.length < 2) throw new Error('CSV has no data rows');

  const headers = rows[0];
  const dataRows = rows.slice(1).filter(r => r.length === headers.length && r[0]);
  if (headers.length < 2) throw new Error('expected a date column plus at least one series column');
  if (dataRows.length === 0) throw new Error('no complete data rows after parsing');

  // KoyFin ratio/percentile-rank exports carry "Metric" rows, not a date column.
  if (headers[0].toLowerCase() === 'metric' && headers.some(h => /percentile rank/i.test(h))) {
    return ingestRatiosFile({ filePath, headers, dataRows, flags });
  }

  if (!looksLikeDate(dataRows[0][0])) {
    throw new Error(`first column "${headers[0]}" does not look like dates (got "${dataRows[0][0]}") — is this a KoyFin wide export?`);
  }

  // Newest-first regardless of export order
  const sorted = [...dataRows].sort((a, b) => new Date(b[0]) - new Date(a[0]));
  const seriesNames = headers.slice(1);

  // Per-series summary: latest, prior, % change
  const summary = seriesNames.map((name, idx) => {
    const col = idx + 1;
    const values = sorted
      .map(r => ({ date: r[0], value: parseFloat(String(r[col]).replace(/[$,%\s]/g, '')) }))
      .filter(v => Number.isFinite(v.value));
    const latest = values[0] ?? null;
    const prior = values[1] ?? null;
    const changePct = latest && prior && prior.value !== 0
      ? ((latest.value - prior.value) / prior.value) * 100
      : null;
    return { name, latest, prior, changePct, count: values.length };
  });

  const exportName = basename(filePath, extname(filePath)).replace(/[^\w-]+/g, '_');
  const note = buildNote({
    frontmatter: {
      title: `KoyFin Export: ${exportName}`,
      source: 'KoyFin (manual export)',
      date_pulled: today(),
      domain: 'commodities',
      data_type: 'koyfin_export',
      frequency: 'weekly',
      export_file: basename(filePath),
      series: seriesNames,
      row_count: dataRows.length,
      signal_status: 'clear',
      signals: [],
      tags: ['koyfin', 'export', 'commodities'],
      related_pulls: [],
    },
    sections: [
      {
        heading: 'Series Summary',
        content: buildTable(
          ['Series', 'Latest Date', 'Latest', 'Prior', 'Change', 'Rows'],
          summary.map(s => [
            s.name,
            s.latest?.date ?? 'N/A',
            s.latest ? formatNumber(s.latest.value, { decimals: 2 }) : 'N/A',
            s.prior ? formatNumber(s.prior.value, { decimals: 2 }) : 'N/A',
            s.changePct != null ? `${s.changePct.toFixed(1)}%` : 'N/A',
            String(s.count),
          ])
        ),
      },
      {
        heading: `Recent Data (last ${Math.min(MAX_PREVIEW_ROWS, sorted.length)} rows)`,
        content: buildTable(headers, sorted.slice(0, MAX_PREVIEW_ROWS)),
      },
      {
        heading: 'Source',
        content: [
          `- **Export**: ${basename(filePath)} (KoyFin manual export)`,
          `- **Ingested**: ${today()}`,
          `- **Rows**: ${dataRows.length}`,
          `- Raw CSVs ingested from the inbox drop folder are archived under \`00_Inbox/exports/koyfin/processed/\`; files ingested from other paths stay in place`,
        ].join('\n'),
      },
    ],
  });

  if (flags['dry-run']) return { file: filePath, notePath: null };

  const notePath = join(getPullsDir(), 'Commodities', dateStampedFilename(`KoyFin_${exportName}`));
  writeNote(notePath, note);
  return { file: filePath, notePath };
}

// ─── Percentile-rank (ratios) ingest ────────────────────────────────────────────

function ingestRatiosFile({ filePath, headers, dataRows, flags }) {
  const tickerMatch = basename(filePath).match(/percentile-ranks-([A-Za-z0-9.\-]+?)_/i);
  const exportName = basename(filePath, extname(filePath)).replace(/[^\w-]+/g, '_');
  const ticker = tickerMatch ? tickerMatch[1].toUpperCase() : exportName;

  const col = name => headers.findIndex(h => h.toLowerCase() === name.toLowerCase());
  const iLast = col('Last');
  const i5y = col('History 5Y Percentile Rank');
  const iGlobal = col('Global Percentile Rank');
  const iSector = col('Global Sector Percentile Rank');
  if (iLast === -1 || i5y === -1) {
    throw new Error('ratios layout detected but "Last" / "History 5Y Percentile Rank" columns not found');
  }

  const pct = v => {
    const n = parseInt(String(v).trim(), 10);
    return Number.isFinite(n) ? n : null;
  };
  const metrics = dataRows.map(r => ({
    metric: r[0],
    last: r[iLast] || 'N/A',
    p5y: pct(r[i5y]),
    pGlobal: iGlobal === -1 ? null : pct(r[iGlobal]),
    pSector: iSector === -1 ? null : pct(r[iSector]),
  }));

  const lows = metrics.filter(m => m.p5y != null && m.p5y <= 10);
  const highs = metrics.filter(m => m.p5y != null && m.p5y >= 90);
  const fmtPct = v => (v == null ? 'N/A' : String(v));

  const note = buildNote({
    frontmatter: {
      title: `KoyFin Percentile Ranks: ${ticker}`,
      source: 'KoyFin (manual export)',
      date_pulled: today(),
      domain: 'market',
      data_type: 'koyfin_percentile_ranks',
      frequency: 'weekly',
      ticker,
      export_file: basename(filePath),
      metric_count: metrics.length,
      extremes_low_5y: lows.map(m => m.metric),
      extremes_high_5y: highs.map(m => m.metric),
      signal_status: 'clear',
      signals: [],
      tags: ['koyfin', 'percentile-ranks', 'valuation', ticker.toLowerCase()],
      related_pulls: [],
    },
    sections: [
      {
        heading: 'Percentile Snapshot',
        content: buildTable(
          ['Metric', 'Last', '5Y %ile', 'Global %ile', 'Sector %ile'],
          metrics.map(m => [m.metric, m.last, fmtPct(m.p5y), fmtPct(m.pGlobal), fmtPct(m.pSector)])
        ),
      },
      {
        heading: 'Extremes vs Own 5Y History',
        content: [
          ...lows.map(m => `- **≤10th %ile (low)**: ${m.metric} — ${m.last} (5Y %ile ${m.p5y})`),
          ...highs.map(m => `- **≥90th %ile (high)**: ${m.metric} — ${m.last} (5Y %ile ${m.p5y})`),
        ].join('\n') || '- No metrics at 5Y extremes.',
      },
      {
        heading: 'Source',
        content: [
          `- **Export**: ${basename(filePath)} (KoyFin percentile-ranks export)`,
          `- **Ingested**: ${today()}`,
          `- **Metrics**: ${metrics.length}`,
          `- Raw CSVs ingested from the inbox drop folder are archived under \`00_Inbox/exports/koyfin/processed/\`; files ingested from other paths stay in place`,
        ].join('\n'),
      },
    ],
  });

  if (flags['dry-run']) return { file: filePath, notePath: null };

  const notePath = join(getPullsDir(), 'Market', dateStampedFilename(`KoyFin_Percentile_Ranks_${ticker}`));
  writeNote(notePath, note);
  return { file: filePath, notePath };
}

// ─── CSV parsing (quoted fields, commas inside quotes) ──────────────────────────

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field.trim()); field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field.trim()); field = '';
      if (row.some(f => f !== '')) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field.trim());
    if (row.some(f => f !== '')) rows.push(row);
  }
  return rows;
}

function looksLikeDate(value) {
  return !Number.isNaN(new Date(value).getTime()) && /\d/.test(value);
}
