/**
 * month-end-archive.mjs - monthly pull-note summary + KB raw archive copy.
 *
 * Usage:
 *   node run.mjs pull month-end-archive --month 2026-04 --dry-run
 *   node run.mjs pull month-end-archive --month 2026-04
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { basename, dirname, join, relative, resolve } from 'path';
import { getKBRoot, getPullsDir, getVaultRoot } from '../lib/config.mjs';
import { buildNote, buildTable, today, writeNote } from '../lib/markdown.mjs';
import { parseFrontmatter } from '../lib/frontmatter.mjs';

const DEFAULT_SCOPE = '05_Data_Pulls';
const ARCHIVE_KIND = 'monthly_archive';
const SKIPPED_PULL_DIRS = new Set(['_archive']);

export async function pull(flags = {}) {
  const month = validateMonth(String(flags.month || currentMonth()));
  const scopeRoots = resolveScopeRoots(flags);
  const files = collectMonthlyFiles(scopeRoots, month);
  const records = files.map(filePath => readMonthlyRecord(filePath)).filter(Boolean);
  const summary = summarizeRecords(records, month, scopeRoots);
  const archiveRoot = join(getKBRoot(), 'raw', ARCHIVE_KIND, month);
  const reportPath = join(getPullsDir(), 'Monthly', `${month}_Month_End_Summary.md`);
  const report = buildMonthlyReport({ month, records, summary, archiveRoot, reportPath, dryRun: Boolean(flags['dry-run']) });

  if (flags['dry-run']) {
    console.log(`[dry-run] Month: ${month}`);
    console.log(`[dry-run] Scope roots: ${scopeRoots.map(path => relative(getVaultRoot(), path)).join(', ')}`);
    console.log(`[dry-run] Files matched: ${records.length}`);
    console.log(`[dry-run] Would archive to: ${archiveRoot}`);
    console.log(`[dry-run] Would write report: ${reportPath}`);
    if (flags.json) console.log(JSON.stringify({ month, summary, archiveRoot, reportPath, records: records.map(toPublicRecord) }, null, 2));
    return { filePath: null, archiveRoot: null, summary, signals: [] };
  }

  const archiveManifest = archiveRecords(records, archiveRoot);
  const finalReport = buildMonthlyReport({ month, records, summary, archiveRoot, reportPath, archiveManifest, dryRun: false });
  writeNote(reportPath, finalReport);
  const reportArchivePath = copyReportToArchive(reportPath, archiveRoot);

  console.log(`Month-end archive: ${month}`);
  console.log(`  Files archived: ${records.length}`);
  console.log(`  Archive: ${archiveRoot}`);
  console.log(`  Manifest: ${archiveManifest.manifestPath}`);
  console.log(`  Report: ${reportPath}`);
  console.log(`  Report archive copy: ${reportArchivePath}`);

  return {
    filePath: reportPath,
    archiveRoot,
    manifestPath: archiveManifest.manifestPath,
    summary,
    signals: [],
  };
}

function resolveScopeRoots(flags) {
  const raw = flags.scope || flags.scopes || DEFAULT_SCOPE;
  const roots = String(raw).split(',').map(item => item.trim()).filter(Boolean)
    .map(item => resolve(getVaultRoot(), item));
  for (const root of roots) {
    if (!root.startsWith(getVaultRoot())) {
      throw new Error(`Scope must stay inside vault: ${root}`);
    }
    if (!existsSync(root)) throw new Error(`Scope not found: ${root}`);
  }
  return roots;
}

function collectMonthlyFiles(scopeRoots, month) {
  const results = [];
  for (const root of scopeRoots) {
    walk(root, filePath => {
      if (!filePath.endsWith('.md')) return;
      if (!basename(filePath).startsWith(month)) return;
      if (isMonthlySummaryPath(filePath)) return;
      if (isArchivedPullPath(filePath)) return;
      if (filePath.includes(`${ARCHIVE_KIND}${month}`)) return;
      results.push(filePath);
    });
  }
  return [...new Set(results)].sort((a, b) => a.localeCompare(b));
}

function walk(dir, onFile) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const info = statSync(full);
    if (info.isDirectory()) {
      if (SKIPPED_PULL_DIRS.has(entry)) continue;
      walk(full, onFile);
    }
    else if (info.isFile()) onFile(full);
  }
}

function isMonthlySummaryPath(filePath) {
  return /[/\\]05_Data_Pulls[/\\]Monthly[/\\]/i.test(filePath)
    || /_Month_End_Summary\.md$/i.test(filePath);
}

function isArchivedPullPath(filePath) {
  const parts = relative(getVaultRoot(), filePath).split(/[\\/]/);
  return parts.includes('_archive');
}

function readMonthlyRecord(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const { data, content } = parseFrontmatter(raw);
  const rel = relative(getVaultRoot(), filePath);
  const domain = domainFromPath(rel);
  return {
    path: filePath,
    rel,
    filename: basename(filePath),
    title: data.title || titleFromFilename(basename(filePath)),
    source: data.source || '',
    datePulled: data.date_pulled || data.date || '',
    eventDate: data.event_date || '',
    domain: String(data.domain || domain || 'unknown').toLowerCase(),
    dataType: data.data_type || '',
    frequency: data.frequency || '',
    signalStatus: data.signal_status || '',
    signals: Array.isArray(data.signals) ? data.signals : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    headings: extractHeadings(content).slice(0, 8),
  };
}

function summarizeRecords(records, month, scopeRoots) {
  return {
    month,
    generatedAt: today(),
    scopeRoots: scopeRoots.map(path => relative(getVaultRoot(), path)),
    fileCount: records.length,
    domainCounts: countBy(records, row => row.domain || 'unknown'),
    dataTypeCounts: countBy(records, row => row.dataType || 'unknown'),
    signalStatusCounts: countBy(records, row => row.signalStatus || 'unknown'),
    signalCounts: countSignals(records),
    tagCounts: countTags(records),
  };
}

function archiveRecords(records, archiveRoot) {
  const fileRows = [];
  for (const record of records) {
    const destPath = join(archiveRoot, record.rel);
    mkdirSync(dirname(destPath), { recursive: true });
    copyFileSync(record.path, destPath);
    fileRows.push({
      source: record.rel,
      archived_to: relative(getKBRoot(), destPath),
      title: record.title,
      domain: record.domain,
      data_type: record.dataType,
      signal_status: record.signalStatus,
      signals: record.signals,
    });
  }

  const manifestPath = join(archiveRoot, 'manifest.json');
  const manifest = {
    month: basename(archiveRoot),
    generated_at: today(),
    archive_kind: ARCHIVE_KIND,
    file_count: records.length,
    files: fileRows,
  };
  mkdirSync(archiveRoot, { recursive: true });
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return { manifestPath, manifest };
}

function copyReportToArchive(reportPath, archiveRoot) {
  const destPath = join(archiveRoot, 'month_end_summary.md');
  mkdirSync(dirname(destPath), { recursive: true });
  copyFileSync(reportPath, destPath);
  return destPath;
}

function buildMonthlyReport({ month, records, summary, archiveRoot, reportPath, archiveManifest = null, dryRun }) {
  const topDomainRows = objectRows(summary.domainCounts, 20);
  const topTypeRows = objectRows(summary.dataTypeCounts, 25);
  const signalRows = objectRows(summary.signalCounts, 25);
  const statusRows = objectRows(summary.signalStatusCounts, 10);
  const recentRows = records.slice(0, 80).map(record => [
    record.datePulled || record.eventDate || '',
    record.domain,
    record.dataType || '',
    record.signalStatus || '',
    record.title,
    record.rel,
  ]);

  return buildNote({
    frontmatter: {
      title: `Month-End Summary - ${month}`,
      source: 'Local vault monthly archive',
      date_pulled: today(),
      month,
      domain: 'monthly',
      data_type: 'month_end_summary',
      frequency: 'monthly',
      signal_status: 'clear',
      signals: [],
      file_count: summary.fileCount,
      archive_root: relative(getKBRoot(), archiveRoot),
      manifest: archiveManifest ? relative(getKBRoot(), archiveManifest.manifestPath) : '',
      tags: ['monthly-summary', 'archive', 'kb-raw'],
    },
    sections: [
      {
        heading: 'Executive Summary',
        content: [
          `Month: ${month}`,
          `Generated: ${today()}`,
          `Source files matched: ${summary.fileCount}`,
          `Report path: ${relative(getVaultRoot(), reportPath)}`,
          `Archive target: ${relative(getKBRoot(), archiveRoot)}`,
          archiveManifest ? `Manifest: ${relative(getKBRoot(), archiveManifest.manifestPath)}` : `Manifest: ${dryRun ? 'dry-run only' : 'pending'}`,
          '',
          dryRun
            ? 'Dry run only. No files were copied and no report was written.'
            : 'Source files were copied into KB raw monthly archive with relative vault paths preserved. Original notes remain in place for dashboards and Dataview queries.',
        ].join('\n'),
      },
      {
        heading: 'Domain Coverage',
        content: topDomainRows.length ? buildTable(['Domain', 'Files'], topDomainRows) : 'No files matched.',
      },
      {
        heading: 'Data-Type Coverage',
        content: topTypeRows.length ? buildTable(['Data Type', 'Files'], topTypeRows) : 'No data types found.',
      },
      {
        heading: 'Signal Status',
        content: statusRows.length ? buildTable(['Status', 'Files'], statusRows) : 'No signal statuses found.',
      },
      {
        heading: 'Top Signals',
        content: signalRows.length ? buildTable(['Signal', 'Files'], signalRows) : 'No signals recorded this month.',
      },
      {
        heading: 'Archived Files',
        content: recentRows.length
          ? buildTable(['Date', 'Domain', 'Data Type', 'Status', 'Title', 'Path'], recentRows)
          : 'No files matched this month.',
      },
      {
        heading: 'Archive Contract',
        content: [
          'This script copies monthly notes into KB raw storage; it does not delete or move source notes.',
          'Archive root format: `12_Knowledge_Bases/raw/monthly_archive/YYYY-MM/`.',
          'Relative vault paths are preserved below the month folder.',
          'The manifest is machine-readable JSON for later KB normalization or audit.',
        ].join('\n'),
      },
    ],
  });
}

function countBy(records, keyFn) {
  const counts = {};
  for (const record of records) {
    const key = String(keyFn(record) || 'unknown');
    counts[key] = (counts[key] || 0) + 1;
  }
  return sortObjectDesc(counts);
}

function countSignals(records) {
  const counts = {};
  for (const record of records) {
    for (const signal of record.signals) {
      counts[String(signal)] = (counts[String(signal)] || 0) + 1;
    }
  }
  return sortObjectDesc(counts);
}

function countTags(records) {
  const counts = {};
  for (const record of records) {
    for (const tag of record.tags) {
      counts[String(tag)] = (counts[String(tag)] || 0) + 1;
    }
  }
  return sortObjectDesc(counts);
}

function sortObjectDesc(value) {
  return Object.fromEntries(Object.entries(value).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
}

function objectRows(value, limit) {
  return Object.entries(value).slice(0, limit).map(([key, count]) => [key, count]);
}

function extractHeadings(content) {
  return String(content || '').split(/\r?\n/)
    .map(line => line.match(/^#{2,4}\s+(.+)$/)?.[1])
    .filter(Boolean);
}

function domainFromPath(rel) {
  const parts = rel.split(/[\\/]/);
  const idx = parts.findIndex(part => part === '05_Data_Pulls');
  return idx >= 0 ? parts[idx + 1] : '';
}

function titleFromFilename(filename) {
  return filename.replace(/\.md$/i, '').replace(/^\d{4}-\d{2}-\d{2}_/, '').replace(/_/g, ' ');
}

function toPublicRecord(record) {
  return {
    path: record.rel,
    title: record.title,
    domain: record.domain,
    data_type: record.dataType,
    signal_status: record.signalStatus,
    signals: record.signals,
  };
}

function validateMonth(value) {
  if (!/^\d{4}-\d{2}$/.test(value)) throw new Error('--month must be YYYY-MM');
  const parsed = new Date(`${value}-01T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 7) !== value) {
    throw new Error(`Invalid month: ${value}`);
  }
  return value;
}

function currentMonth() {
  return today().slice(0, 7);
}
