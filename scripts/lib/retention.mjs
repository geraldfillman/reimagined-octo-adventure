import { readdirSync, readFileSync, existsSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { prunePullFiles, parseFrontmatter } from './history.mjs';
import { getPullsDir } from './config.mjs';

export const DEFAULT_MARKET_HISTORY_RETENTION = Object.freeze({
  keepDaily: 1,
  keepQuotes: 2,
});

function normalizeRetentionCount(value, fallback, label) {
  if (value == null) return fallback;
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
  return parsed;
}

function isMarketHistoryEntry(entry) {
  const frontmatter = entry.frontmatter || {};
  const frequency = String(frontmatter.frequency || '').toLowerCase();
  const dataType = String(frontmatter.data_type || '').toLowerCase();

  return frequency === 'daily'
    || dataType.startsWith('daily_')
    || entry.family.startsWith('AV_Quote_')
    || entry.family.startsWith('FMP_Quote_');
}

function formatRemoval(entry) {
  const pulled = entry.frontmatter?.date_pulled || entry.datePrefix || 'unknown-date';
  return `- ${entry.file} (${pulled})`;
}

export function pruneMarketHistory(options = {}) {
  const keepDaily = normalizeRetentionCount(
    options.keepDaily,
    DEFAULT_MARKET_HISTORY_RETENTION.keepDaily,
    'keepDaily'
  );
  const keepQuotes = normalizeRetentionCount(
    options.keepQuotes,
    DEFAULT_MARKET_HISTORY_RETENTION.keepQuotes,
    'keepQuotes'
  );
  const dryRun = Boolean(options.dryRun);

  const result = prunePullFiles('Market', {
    dryRun,
    matcher: isMarketHistoryEntry,
    keepByFamily(entries) {
      const family = entries[0]?.family || '';
      return family.startsWith('AV_Quote_') || family.startsWith('FMP_Quote_') ? keepQuotes : keepDaily;
    },
  });

  return Object.freeze({
    ...result,
    keepDaily,
    keepQuotes,
  });
}

// --- Signal retention ---

export const DEFAULT_SIGNAL_RETENTION_DAYS = Object.freeze({
  critical: Infinity,
  alert: 30,
  watch: 14,
  clear: 7,
});

function getSignalsDir() {
  return join(dirname(getPullsDir()), '06_Signals');
}

/**
 * Prune signal files in 06_Signals/ based on severity and age.
 * - critical: never pruned
 * - alert: pruned after 30 days
 * - watch: pruned after 14 days
 * - clear: pruned after 7 days
 * @param {{ dryRun?: boolean, retentionDays?: Partial<typeof DEFAULT_SIGNAL_RETENTION_DAYS> }} [options]
 */
export function pruneSignals(options = {}) {
  const retentionDays = { ...DEFAULT_SIGNAL_RETENTION_DAYS, ...options.retentionDays };
  const dryRun = Boolean(options.dryRun);
  const now = Date.now();

  const signalsDir = getSignalsDir();
  if (!existsSync(signalsDir)) {
    return Object.freeze({ dryRun, kept: Object.freeze([]), removed: Object.freeze([]), skipped: Object.freeze([]) });
  }

  const kept = [];
  const removed = [];
  const skipped = [];

  for (const file of readdirSync(signalsDir).filter(f => f.endsWith('.md')).sort().reverse()) {
    const filePath = join(signalsDir, file);
    const frontmatter = parseFrontmatter(readFileSync(filePath, 'utf-8'));
    const severity = String(frontmatter?.severity || '').toLowerCase();
    const dateStr = frontmatter?.date || null;

    if (!severity || !dateStr) {
      skipped.push(Object.freeze({ file, reason: 'missing severity or date' }));
      continue;
    }

    const maxDays = Object.prototype.hasOwnProperty.call(retentionDays, severity)
      ? retentionDays[severity]
      : retentionDays.clear;

    if (!Number.isFinite(maxDays)) {
      kept.push(Object.freeze({ file, severity, date: dateStr }));
      continue;
    }

    const ageDays = (now - new Date(dateStr).getTime()) / 86_400_000;
    if (ageDays > maxDays) {
      if (!dryRun) unlinkSync(filePath);
      removed.push(Object.freeze({ file, severity, date: dateStr, ageDays: Math.floor(ageDays) }));
    } else {
      kept.push(Object.freeze({ file, severity, date: dateStr }));
    }
  }

  return Object.freeze({
    dryRun,
    kept: Object.freeze(kept),
    removed: Object.freeze(removed),
    skipped: Object.freeze(skipped),
  });
}

export function formatSignalRetentionSummary(result, options = {}) {
  const label = options.label || 'Signal retention';
  const lines = [
    `${label} (${result.dryRun ? 'dry run' : 'applied'})`,
    '  Retention: critical=forever, alert=30d, watch=14d, clear=7d',
  ];

  if (result.skipped.length > 0) {
    lines.push(`  Skipped ${result.skipped.length} file(s) with missing severity or date`);
  }

  if (result.removed.length === 0) {
    lines.push('  No signal files matched the retention threshold.');
  } else {
    lines.push(`  ${result.dryRun ? 'Would remove' : 'Removed'} ${result.removed.length} file(s):`);
    for (const entry of result.removed) {
      lines.push(`  - ${entry.file} (${entry.severity}, ${entry.ageDays}d old)`);
    }
  }

  return Object.freeze(lines);
}

export function formatMarketHistoryRetentionSummary(result, options = {}) {
  const label = options.label || 'Market history retention';
  const verbose = options.verbose !== false;
  const lines = [
    `${label} (${result.dryRun ? 'dry run' : 'applied'})`,
  ];

  if (verbose) {
    lines.push(`  Daily history keep count: ${result.keepDaily}`);
    lines.push(`  Quote keep count: ${result.keepQuotes}`);
  }

  const changedGroups = result.groups.filter(group => group.removedCount > 0);
  for (const group of changedGroups) {
    lines.push(`  ${group.family}: kept ${group.keepCount}, removed ${group.removedCount}`);
  }

  if (result.removed.length === 0) {
    lines.push(verbose
      ? '  No files matched the retention threshold.'
      : '  No older files needed pruning.');
  } else {
    lines.push(`  ${result.dryRun ? 'Would remove' : 'Removed'} ${result.removed.length} file(s):`);
    for (const entry of result.removed) {
      lines.push(formatRemoval(entry));
    }
  }

  return Object.freeze(lines);
}
