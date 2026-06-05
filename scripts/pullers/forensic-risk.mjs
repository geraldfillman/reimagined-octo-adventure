/**
 * forensic-risk.mjs - manual forensic accounting risk screen.
 *
 * This puller is research triage only. Scores are probability flags, not proof,
 * and every output keeps provider/provenance context for human verification.
 */

import { join } from 'node:path';

import { getCompanyRiskDir, getPullsDir } from '../lib/config.mjs';
import { buildNote, buildTable, today, writeNote } from '../lib/markdown.mjs';
import { scoreForensicDataset, metricLabel } from '../lib/forensics/scoring.mjs';
import { diffLatestAnnualFilingSections } from '../lib/forensics/filing-diff.mjs';
import {
  loadEquityForensicDataset,
  resolveSymbolsFromFlags,
} from '../lib/forensics/equity-data.mjs';

const STATUS_RANK = Object.freeze({ clear: 0, watch: 1, alert: 2, critical: 3 });

export async function pull(flags = {}) {
  const result = await runForensicRisk({ flags });

  if (flags.json) {
    console.log(JSON.stringify(summarizeResult(result), null, 2));
    return result;
  }

  if (result.dryRun) {
    console.log(result.markdown);
    for (const memo of result.memos) console.log(`\n${memo.markdown}`);
    return result;
  }

  console.log(`Wrote forensic risk screen: ${result.filePath}`);
  for (const memo of result.memos) {
    if (memo.filePath) console.log(`Wrote forensic investigation memo: ${memo.filePath}`);
  }
  for (const event of result.companyRiskEvents) {
    if (event.filePath) console.log(`Wrote company-risk event: ${event.filePath}`);
  }
  return result;
}

export async function runForensicRisk({
  flags = {},
  loadDataset = loadEquityForensicDataset,
  diffSections = diffLatestAnnualFilingSections,
  date = today(),
} = {}) {
  const dryRun = Boolean(flags['dry-run'] || flags.dryRun);
  const threshold = normalizeThreshold(flags.threshold || 'alert');
  const symbols = await resolveSymbolsFromFlags(flags);
  const results = [];

  for (const symbol of symbols) {
    try {
      const dataset = await loadDataset(symbol);
      const scored = scoreForensicDataset(dataset);
      if (flags['diff-risk-factors'] && scored.signalStatus !== 'clear') {
        const diff = await diffSections(symbol).catch(error => ({ error: error.message }));
        scored.diff = diff;
        if (!diff.error && diff.diffs?.some(item => item.changedRiskProfile === 'review')) {
          scored.signals = [...new Set([...scored.signals, 'risk-factor-diff'])];
          scored.signalStatus = maxStatus(scored.signalStatus, 'alert');
        }
      }
      results.push(scored);
    } catch (error) {
      results.push({
        symbol,
        companyName: symbol,
        signalStatus: 'clear',
        signals: [],
        metrics: [],
        provenance: null,
        warnings: [error.message],
        skipped: true,
      });
    }
  }

  const signalStatus = results.reduce((status, item) => maxStatus(status, item.signalStatus), 'clear');
  const signals = unique(results.flatMap(item => item.signals ?? []));
  const base = {
    source: 'forensic-risk',
    date,
    dryRun,
    threshold,
    symbols,
    results,
    signalStatus,
    signals,
    filePath: dryRun ? null : join(getPullsDir(), 'Fundamentals', `${date}_Forensic_Risk.md`),
    memos: [],
    companyRiskEvents: [],
  };
  base.markdown = buildForensicRiskNote(base);

  base.memos = results
    .filter(item => statusMeetsThreshold(item.signalStatus, threshold))
    .map(item => {
      const memo = {
        ...item,
        date,
        filePath: dryRun ? null : join(getPullsDir(), 'Fundamentals', `${date}_Forensic_Investigation_${item.symbol}.md`),
      };
      memo.markdown = buildForensicInvestigationMemo(memo);
      return memo;
    });

  base.companyRiskEvents = results
    .filter(item => item.signalStatus === 'critical')
    .map(item => {
      const event = {
        ...item,
        date,
        filePath: dryRun ? null : join(getCompanyRiskDir('Events'), `${date} - Forensic Risk ${item.symbol}.md`),
      };
      event.markdown = buildCompanyRiskEventNote(event);
      return event;
    });

  if (!dryRun) {
    writeNote(base.filePath, base.markdown);
    for (const memo of base.memos) writeNote(memo.filePath, memo.markdown);
    for (const event of base.companyRiskEvents) writeNote(event.filePath, event.markdown);
  }

  return base;
}

export function buildForensicRiskNote(result) {
  const rows = result.results.map(item => [
    item.symbol,
    item.companyName,
    item.signalStatus,
    item.signals.length ? item.signals.map(metricLabel).join(', ') : 'None',
    item.provenance?.provider ?? 'Unavailable',
    item.provenance?.sourcePath ?? item.warnings?.join('; ') ?? '',
  ]);

  const metricRows = result.results.flatMap(item => item.metrics.map(metric => [
    item.symbol,
    metric.label,
    metric.value == null ? 'N/A' : String(metric.value),
    metric.threshold,
    metric.flagged ? 'yes' : 'no',
    metric.interpretation,
  ]));

  const diffRows = result.results
    .filter(item => item.diff)
    .flatMap(item => formatDiffRows(item));

  return buildNote({
    frontmatter: {
      title: 'Forensic Risk Screen',
      source: 'FMP Premium + SEC EDGAR',
      date_pulled: result.date,
      domain: 'fundamentals',
      data_type: 'forensic_risk',
      frequency: 'manual',
      signal_status: result.signalStatus,
      signals: result.signals,
      symbols: result.symbols,
      tags: ['forensic-risk', 'fundamentals', 'sec', 'fmp', 'manual-review'],
    },
    sections: [
      {
        heading: 'Operating Rule',
        content: [
          'Forensic scores are probability flags, not proof.',
          'This report is for human review and cannot trigger trading or execution.',
          'Verify flagged metrics against the linked filing/provider context before drawing conclusions.',
        ].join('\n'),
      },
      {
        heading: 'Symbol Summary',
        content: buildTable(['Symbol', 'Company', 'Status', 'Flags', 'Provider', 'Source Context'], rows),
      },
      {
        heading: 'Metric Flags',
        content: metricRows.length
          ? buildTable(['Symbol', 'Metric', 'Value', 'Threshold', 'Flagged', 'Interpretation'], metricRows)
          : 'No metrics were available.',
      },
      {
        heading: 'Filing Text Diff',
        content: diffRows.length
          ? buildTable(['Symbol', 'Section', 'Status', 'Added/Removed Preview'], diffRows)
          : 'Not requested or no numeric forensic trigger required a filing diff.',
      },
      {
        heading: 'Crypto Deferred Edge Test',
        content: 'Crypto is deferred in v1. Reconsider only for source-linked token unlock cliffs greater than 5% of circulating supply that produce actionable human-review memos.',
      },
    ],
  });
}

export function buildForensicInvestigationMemo(item) {
  const metricRows = item.metrics.map(metric => [
    metric.label,
    metric.value == null ? 'N/A' : String(metric.value),
    metric.threshold,
    metric.flagged ? 'yes' : 'no',
    metric.interpretation,
  ]);

  return buildNote({
    frontmatter: {
      title: `Forensic Investigation - ${item.symbol}`,
      source: 'Forensic Risk Screen',
      date_pulled: item.date,
      domain: 'fundamentals',
      data_type: 'forensic_investigation',
      frequency: 'manual',
      signal_status: item.signalStatus,
      signals: item.signals,
      symbol: item.symbol,
      tags: ['forensic-risk', 'investigation-memo', 'manual-review'],
    },
    sections: [
      {
        heading: 'Research Triage Warning',
        content: 'These are probability flags, not proof. Use this memo as a directory for manual filing review.',
      },
      {
        heading: 'Metric Evidence',
        content: buildTable(['Metric', 'Value', 'Threshold', 'Flagged', 'Interpretation'], metricRows),
      },
      {
        heading: 'Source Provenance',
        content: [
          `- Provider: ${item.provenance?.provider ?? 'Unavailable'}`,
          `- Periods: ${(item.provenance?.periods ?? []).join(', ') || 'Unavailable'}`,
          `- Concepts: ${(item.provenance?.concepts ?? []).join(', ') || 'Unavailable'}`,
          `- Source path: ${item.provenance?.sourcePath ?? 'Unavailable'}`,
        ].join('\n'),
      },
      {
        heading: 'Human Review Checklist',
        content: [
          '- Open the latest 10-K/10-Q and verify the statement items behind each flag.',
          '- Read Risk Factors, MD&A, liquidity, debt maturity, and accounting-policy changes.',
          '- Compare the flagged period against peer and sector context before escalating.',
          '- Record whether outside evidence confirms, weakens, or explains the forensic flag.',
        ].join('\n'),
      },
    ],
  });
}

function buildCompanyRiskEventNote(item) {
  return buildNote({
    frontmatter: {
      node_type: 'risk_event',
      date: item.date,
      event_type: 'Financial',
      company: item.companyName,
      severity: 'High',
      source: 'Forensic Risk Screen',
      link: item.provenance?.sourcePath ?? '',
      confidence: 'Medium',
      pattern_matches: [],
      tags: ['risk-event', 'company-risk', 'forensic-risk'],
    },
    sections: [
      {
        heading: 'Summary',
        content: `${item.symbol} triggered critical forensic-accounting review flags: ${item.signals.map(metricLabel).join(', ')}.`,
      },
      {
        heading: 'Guardrail',
        content: 'This event records a research triage flag only. It is not proof of misconduct or financial distress.',
      },
    ],
  });
}

function formatDiffRows(item) {
  if (item.diff.error) return [[item.symbol, 'Annual filing sections', 'skipped', item.diff.error]];
  return item.diff.diffs.map(diff => [
    item.symbol,
    diff.label,
    diff.changedRiskProfile,
    [
      ...diff.added.slice(0, 2).map(sentence => `Added: ${sentence}`),
      ...diff.removed.slice(0, 2).map(sentence => `Removed: ${sentence}`),
    ].join(' | ') || 'No deterministic sentence-level change found.',
  ]);
}

function summarizeResult(result) {
  return {
    source: result.source,
    date: result.date,
    dryRun: result.dryRun,
    threshold: result.threshold,
    filePath: result.filePath,
    signalStatus: result.signalStatus,
    signals: result.signals,
    symbolCount: result.symbols.length,
    memoCount: result.memos.length,
    companyRiskEventCount: result.companyRiskEvents.length,
    results: result.results.map(item => ({
      symbol: item.symbol,
      signalStatus: item.signalStatus,
      signals: item.signals,
      skipped: Boolean(item.skipped),
      warnings: item.warnings ?? [],
      metrics: item.metrics,
      provenance: item.provenance,
      diffStatus: item.diff?.error ? 'skipped' : item.diff?.llmStatus ?? null,
    })),
  };
}

function statusMeetsThreshold(status, threshold) {
  return STATUS_RANK[status] >= STATUS_RANK[threshold];
}

function normalizeThreshold(value) {
  const normalized = String(value || '').toLowerCase();
  if (!['watch', 'alert', 'critical'].includes(normalized)) {
    throw new Error('--threshold must be one of watch, alert, or critical.');
  }
  return normalized;
}

function maxStatus(a, b) {
  return STATUS_RANK[b] > STATUS_RANK[a] ? b : a;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}
