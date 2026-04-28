#!/usr/bin/env node
/**
 * thesis-full-picture.mjs - Generate thesis full-picture synthesis reports.
 */

import { basename, join } from 'path';
import { getPullsDir } from './lib/config.mjs';
import { loadCachedFmpFundamentalsMap } from './lib/fmp-fundamentals-context.mjs';
import { loadLatestFmpMarketContext } from './lib/fmp-market-context.mjs';
import { buildNote, buildTable, dateStampedFilename, formatNumber, today, writeNote } from './lib/markdown.mjs';
import { loadMacroContext, extractSeriesIdFromLinkValue, resolveMacroIndicator, stripWikiLink } from './lib/macro-context.mjs';
import { loadThesisWatchlists, normalizeSymbol } from './lib/thesis-watchlists.mjs';

const SIGNAL_ORDER = Object.freeze({
  clear: 0,
  watch: 1,
  alert: 2,
  critical: 3,
});

const PRIORITY_SCORE = Object.freeze({
  watch: 1,
  medium: 2,
  high: 3,
});

const CONVICTION_SCORE = Object.freeze({
  low: 1,
  medium: 2,
  high: 3,
});

export async function run(flags = {}) {
  const dryRun = Boolean(flags['dry-run']);
  const includeBaskets = Boolean(flags['include-baskets']);
  const thesisFilter = String(flags.thesis || '').trim().toLowerCase();
  const thesisWatchlists = await loadThesisWatchlists({
    includeBaskets,
    thesisFilter,
  });

  if (thesisWatchlists.length === 0) {
    console.log('No thesis full-picture targets matched the requested filters.');
    return { scanned: 0, written: 0 };
  }

  const allSymbols = thesisWatchlists.flatMap(thesis => thesis.symbols);
  const [marketContext, fundamentalsBySymbol, macroContext] = await Promise.all([
    loadLatestFmpMarketContext(),
    loadCachedFmpFundamentalsMap(allSymbols),
    loadMacroContext(),
  ]);

  const catalystBySymbol = buildLatestCatalystMap(marketContext.marketNotes);
  const contexts = thesisWatchlists.map(thesis => buildReportContext(thesis, {
    marketContext,
    fundamentalsBySymbol,
    macroContext,
    catalystBySymbol,
  }));

  if (dryRun) {
    for (const context of contexts) {
      console.log(`[dry-run] ${formatContextSummary(context)}`);
    }
    console.log(`Thesis full-picture dry run complete: ${contexts.length} candidate(s).`);
    return { scanned: contexts.length, written: 0 };
  }

  const filePaths = [];
  for (const context of contexts) {
    const note = buildFullPictureNote(context);
    const filePath = join(getPullsDir(), 'Theses', dateStampedFilename(`Thesis_Full_Picture_${context.name}`));
    writeNote(filePath, note);
    filePaths.push(filePath);
    console.log(`Wrote ${context.name} full-picture report: ${filePath}`);
  }

  console.log(`Thesis full-picture generation complete: ${filePaths.length} report(s) written.`);
  return { scanned: contexts.length, written: filePaths.length, filePaths };
}

function buildReportContext(thesis, deps) {
  const noteData = thesis.note?.data || {};
  const thesisLink = wikiLink(thesis.name);
  const primarySymbol = normalizeSymbol(noteData.fmp_primary_symbol) || thesis.symbols[0] || null;
  const primaryTechnical = primarySymbol ? deps.marketContext.technicalBySymbol.get(primarySymbol) || null : null;
  const primaryFundamentals = primarySymbol ? deps.fundamentalsBySymbol.get(primarySymbol) || null : null;
  const symbolContexts = thesis.symbols.map(symbol => ({
    symbol,
    technical: deps.marketContext.technicalBySymbol.get(symbol) || null,
    fundamentals: deps.fundamentalsBySymbol.get(symbol) || null,
  }));
  const watchlistReport = deps.marketContext.watchlistReportsByThesis.get(thesis.name) || null;
  const catalystRows = buildCatalystRows(thesis.symbols, deps);
  const keyIndicatorRows = buildIndicatorRows(noteData.key_indicators, deps.macroContext);
  const regimeRows = buildRegimeRows(noteData.supporting_regimes, deps.macroContext);

  const qlibSignalStatus = normalizeSignalStatus(noteData.qlib_signal_status) || 'clear';
  const technicalSignalStatus = normalizeSignalStatus(primaryTechnical?.data?.signal_status) || 'clear';
  const macroSignalStatus = resolveMaxSignalStatus(keyIndicatorRows.map(row => row.signalStatus));
  const catalystSignalStatus = resolveMaxSignalStatus(catalystRows.map(row => row.signalStatus));
  const fundamentalsStatus = primaryFundamentals?.coverageStatus || 'missing';
  const fundamentalsSymbolCount = thesis.symbols.filter(symbol => {
    const entry = deps.fundamentalsBySymbol.get(symbol);
    return entry?.coverageCount > 0;
  }).length;
  const coverageGaps = buildCoverageGaps({
    thesis,
    primarySymbol,
    primaryTechnical,
    primaryFundamentals,
    keyIndicatorRows,
    catalystRows,
    watchlistReport,
    fundamentalsSymbolCount,
  });
  const structuralView = resolveStructuralView(noteData, primaryFundamentals);
  const tacticalView = resolveTacticalView({
    qlibSignalStatus,
    technicalSignalStatus,
    catalystSignalStatus,
    nextEarningsDate: catalystRows[0]?.nextEarningsDate || null,
  });
  const relatedPulls = uniqueValues([
    watchlistReport?.path ? filePathToWikiLink(watchlistReport.path) : null,
    primaryTechnical?.path ? filePathToWikiLink(primaryTechnical.path) : null,
    ...catalystRows.slice(0, 5).map(row => row.noteLink),
    ...keyIndicatorRows.filter(row => row.sourceLink !== 'N/A').map(row => row.sourceLink),
  ]);

  const overallSignalStatus = resolveOverallSignalStatus({
    qlibSignalStatus,
    technicalSignalStatus,
    macroSignalStatus,
    catalystSignalStatus,
    fundamentalsStatus,
    coverageGapCount: coverageGaps.length,
  });

  return {
    name: thesis.name,
    thesisLink,
    noteData,
    symbols: thesis.symbols,
    symbolContexts,
    primarySymbol,
    primaryTechnical,
    primaryFundamentals,
    watchlistReport,
    catalystRows,
    keyIndicatorRows,
    regimeRows,
    qlibSignalStatus,
    technicalSignalStatus,
    macroSignalStatus,
    catalystSignalStatus,
    fundamentalsStatus,
    fundamentalsSymbolCount,
    structuralView,
    tacticalView,
    overallSignalStatus,
    coverageGaps,
    relatedPulls,
    macroIndicatorMatchCount: keyIndicatorRows.filter(row => row.resolved).length,
    catalystSymbolCount: catalystRows.length,
    nextEarningsDate: catalystRows.find(row => row.nextEarningsDate)?.nextEarningsDate || null,
    actionSummary: buildActionSummary({
      structuralView,
      tacticalView,
      fundamentalsStatus,
      coverageGapCount: coverageGaps.length,
    }),
  };
}

function buildFullPictureNote(context) {
  const frontmatter = {
    title: `${context.name} Full Picture`,
    source: 'Thesis Full Picture',
    thesis: context.thesisLink,
    thesis_name: context.name,
    primary_symbol: context.primarySymbol,
    allocation_priority: context.noteData.allocation_priority || null,
    conviction: context.noteData.conviction || null,
    monitor_status: context.noteData.monitor_status || null,
    break_risk_status: context.noteData.break_risk_status || null,
    qlib_signal_status: context.qlibSignalStatus,
    technical_status: context.technicalSignalStatus,
    technical_bias: context.primaryTechnical?.data?.technical_bias || null,
    fundamentals_status: context.fundamentalsStatus,
    macro_signal_status: context.macroSignalStatus,
    structural_view: context.structuralView,
    tactical_view: context.tacticalView,
    next_earnings_date: context.nextEarningsDate,
    watchlist_symbol_count: context.symbols.length,
    fundamentals_symbol_count: context.fundamentalsSymbolCount,
    catalyst_symbol_count: context.catalystSymbolCount,
    macro_indicator_match_count: context.macroIndicatorMatchCount,
    coverage_gap_count: context.coverageGaps.length,
    related_pulls: context.relatedPulls,
    date_pulled: today(),
    domain: 'theses',
    data_type: 'full_picture_report',
    frequency: 'on-demand',
    signal_status: context.overallSignalStatus,
    signals: buildFrontmatterSignals(context),
    tags: uniqueValues([
      'thesis',
      'full-picture',
      'synthesis',
      'report',
      context.primarySymbol ? context.primarySymbol.toLowerCase() : null,
    ]),
  };

  const sections = [
    {
      heading: 'Snapshot',
      content: buildSnapshotContent(context),
    },
    {
      heading: 'Structural Thesis',
      content: buildStructuralContent(context),
    },
    {
      heading: 'Quant And Tape',
      content: buildQuantAndTapeContent(context),
    },
    {
      heading: 'Fundamentals',
      content: buildFundamentalsContent(context),
    },
    {
      heading: 'Key Indicator Pulse',
      content: buildMacroContent(context),
    },
    {
      heading: 'Catalyst Map',
      content: buildCatalystContent(context),
    },
    {
      heading: 'Coverage Gaps',
      content: context.coverageGaps.length > 0
        ? context.coverageGaps.map(gap => `- ${gap}`).join('\n')
        : '- No major synthesis gaps detected in the current local data set.',
    },
    {
      heading: 'Synthesis',
      content: [
        `- **Structural View**: ${context.structuralView}`,
        `- **Tactical View**: ${context.tacticalView}`,
        `- **Action**: ${context.actionSummary}`,
      ].join('\n'),
    },
    {
      heading: 'Source',
      content: buildSourceContent(context),
    },
  ];

  return buildNote({ frontmatter, sections });
}

function buildSnapshotContent(context) {
  return [
    `- **Thesis**: ${context.thesisLink}`,
    `- **Primary Symbol**: ${context.primarySymbol || 'N/A'}`,
    `- **Priority / Conviction**: ${(context.noteData.allocation_priority || 'N/A')} / ${(context.noteData.conviction || 'N/A')}`,
    `- **Monitor / Break Risk**: ${(context.noteData.monitor_status || 'N/A')} / ${(context.noteData.break_risk_status || 'N/A')}`,
    `- **Quant / Tape / Indicators**: ${context.qlibSignalStatus} / ${context.technicalSignalStatus} / ${context.macroSignalStatus}`,
    `- **Fundamentals**: ${context.fundamentalsStatus} (${context.fundamentalsSymbolCount}/${context.symbols.length} watchlist symbol(s) cached)`,
    `- **Next Earnings**: ${formatDateValue(context.nextEarningsDate)}`,
    `- **Overall Status**: ${context.overallSignalStatus}`,
  ].join('\n');
}

function buildStructuralContent(context) {
  const summaryLines = [
    `- **Why Now**: ${context.noteData.why_now || 'N/A'}`,
    `- **Variant**: ${context.noteData.variant_perception || 'N/A'}`,
    `- **Next Catalyst**: ${context.noteData.next_catalyst || 'N/A'}`,
    `- **What Breaks It**: ${context.noteData.disconfirming_evidence || 'N/A'}`,
    `- **Monitor Change**: ${context.noteData.monitor_change || 'N/A'}`,
    `- **Monitor Action**: ${context.noteData.monitor_action || 'N/A'}`,
  ];

  const regimeTable = context.regimeRows.length > 0
    ? buildTable(
        ['Regime', 'Status', 'Confidence', 'Key Indicators'],
        context.regimeRows.map(row => [
          row.link,
          row.status,
          row.confidence,
          row.keyIndicators,
        ])
      )
    : 'No supporting regime links were resolved.';

  return `${summaryLines.join('\n')}\n\n${regimeTable}`;
}

function buildQuantAndTapeContent(context) {
  const summaryTable = buildTable(
    ['Layer', 'Status', 'Metric 1', 'Metric 2', 'Metric 3'],
    [
      [
        'Qlib',
        context.qlibSignalStatus,
        formatValue(context.noteData.qlib_best_ic, { decimals: 3 }),
        formatCount(context.noteData.qlib_positive_factor_count),
        formatValue(context.noteData.qlib_backtest_sharpe, { decimals: 2 }),
      ],
      [
        'Primary Tape',
        context.technicalSignalStatus,
        context.primaryTechnical?.data?.technical_bias || 'N/A',
        formatValue(context.primaryTechnical?.data?.rsi14, { decimals: 1 }),
        formatPercentValue(context.primaryTechnical?.data?.price_vs_sma200_pct, 1),
      ],
      [
        'Watchlist',
        `${context.noteData.fmp_technical_symbol_count || 0}/${context.symbols.length} covered`,
        `${context.noteData.fmp_technical_nonclear_count || 0} non-clear`,
        `${context.noteData.fmp_technical_bearish_count || 0} bearish`,
        formatDateValue(context.noteData.fmp_primary_snapshot_date),
      ],
    ]
  );

  const tapeRows = context.symbols.map(symbol => {
    const technical = context.symbolContexts.find(entry => entry.symbol === symbol)?.technical || null;
    const catalyst = context.catalystRows.find(row => row.symbol === symbol) || null;
    return [
      symbol,
      technical?.data?.signal_status || catalyst?.technicalStatus || 'N/A',
      technical?.data?.technical_bias || catalyst?.technicalBias || 'N/A',
      formatValue(technical?.data?.rsi14, { decimals: 1 }),
      formatPercentValue(technical?.data?.price_vs_sma200_pct, 1),
      catalyst?.nextEarningsDate || 'N/A',
      catalyst?.urgency || 'N/A',
    ];
  });

  return `${summaryTable}\n\n${buildTable(
    ['Symbol', 'Tech', 'Bias', 'RSI 14', 'Vs 200D %', 'Next Earnings', 'Catalyst'],
    tapeRows
  )}`;
}

function buildFundamentalsContent(context) {
  const primary = context.primaryFundamentals;
  const primaryContent = primary?.coverageCount > 0
    ? buildTable(
        ['Metric', 'Value'],
        [
          ['Company', primary.companyName || context.primarySymbol || 'N/A'],
          ['Sector / Industry', [primary.sector, primary.industry].filter(Boolean).join(' / ') || 'N/A'],
          ['Market Cap', formatCurrency(primary.marketCap)],
          ['Trailing P/E', formatValue(primary.trailingPE, { decimals: 1 })],
          ['P/S', formatValue(primary.priceToSales, { decimals: 1 })],
          ['P/B', formatValue(primary.priceToBook, { decimals: 1 })],
          ['EV/Sales', formatValue(primary.evToSales, { decimals: 1 })],
          ['EV/EBITDA', formatValue(primary.evToEbitda, { decimals: 1 })],
          ['ROE %', formatPercentValue(primary.roePct, 1)],
          ['ROIC %', formatPercentValue(primary.roicPct, 1)],
          ['Op Margin %', formatPercentValue(primary.operatingMarginPct, 1)],
          ['Net Margin %', formatPercentValue(primary.netMarginPct, 1)],
          ['Current Ratio', formatValue(primary.currentRatio, { decimals: 2 })],
          ['Debt / Equity', formatValue(primary.debtToEquity, { decimals: 2 })],
          ['Avg Target', formatCurrency(primary.averagePriceTarget)],
          ['Target Upside %', formatPercentValue(primary.targetUpsidePct, 1)],
          ['Analyst Count', formatCount(primary.analystCount)],
          ['Cached', formatDateValue(primary.cachedAt)],
        ]
      )
    : `No cached FMP fundamentals were found for ${context.primarySymbol || context.name}.`;

  const coverageRows = context.symbols.map(symbol => {
    const fundamentals = context.symbolContexts.find(entry => entry.symbol === symbol)?.fundamentals || null;
    const resolved = fundamentals || null;
    return [
      symbol,
      resolved?.coverageStatus || 'missing',
      formatValue(resolved?.trailingPE, { decimals: 1 }),
      formatValue(resolved?.evToSales, { decimals: 1 }),
      formatPercentValue(resolved?.roePct, 1),
      formatPercentValue(resolved?.targetUpsidePct, 1),
    ];
  });

  return `${primaryContent}\n\n${buildTable(
    ['Symbol', 'Coverage', 'P/E', 'EV/Sales', 'ROE %', 'Target Upside %'],
    coverageRows
  )}`;
}

function buildMacroContent(context) {
  const indicatorTable = context.keyIndicatorRows.length > 0
    ? buildTable(
        ['Indicator', 'Series', 'Status', 'Latest', 'Change', 'Date', 'Source'],
        context.keyIndicatorRows.map(row => [
          row.link,
          row.seriesId || 'N/A',
          row.signalStatus || 'N/A',
          row.latestValue || 'N/A',
          row.change || 'N/A',
          row.latestDate || 'N/A',
          row.sourceLink,
        ])
      )
    : 'No thesis key indicators were present on the thesis note.';

  return indicatorTable;
}

function buildCatalystContent(context) {
  if (context.catalystRows.length === 0) {
    return 'No thesis watchlist catalyst rows were found in the latest market context.';
  }

  return buildTable(
    ['Symbol', 'Urgency', 'Signal', 'Tech', 'Bias', 'Next Earnings', 'Days', 'Note'],
    context.catalystRows.map(row => [
      row.symbol,
      row.urgency,
      row.signalStatus,
      row.technicalStatus,
      row.technicalBias,
      row.nextEarningsDate || 'N/A',
      row.daysToEarnings ?? 'N/A',
      row.noteLink,
    ])
  );
}

function buildSourceContent(context) {
  return [
    `- **Watchlist Report**: ${context.watchlistReport?.path ? filePathToWikiLink(context.watchlistReport.path) : 'none found'}`,
    `- **Primary Technical**: ${context.primaryTechnical?.path ? filePathToWikiLink(context.primaryTechnical.path) : 'none found'}`,
    `- **Related Pulls**: ${context.relatedPulls.join(', ') || 'none found'}`,
    `- **Auto-pulled**: ${today()}`,
  ].join('\n');
}

function buildCatalystRows(symbols, deps) {
  return symbols
    .map(symbol => {
      const note = deps.catalystBySymbol.get(symbol) || null;
      if (note) {
        return {
          symbol,
          urgency: String(note.data.catalyst_urgency || 'background'),
          signalStatus: normalizeSignalStatus(note.data.signal_status) || 'clear',
          technicalStatus: String(note.data.technical_status || 'N/A'),
          technicalBias: String(note.data.technical_bias || 'N/A'),
          nextEarningsDate: String(note.data.next_earnings_date || '').trim() || null,
          daysToEarnings: parseOptionalNumber(note.data.days_to_earnings),
          noteLink: filePathToWikiLink(note.path),
        };
      }

      const technical = deps.marketContext.technicalBySymbol.get(symbol) || null;
      const earnings = deps.marketContext.earningsBySymbol.get(symbol) || null;
      if (!technical && !earnings) return null;

      return {
        symbol,
        urgency: 'background',
        signalStatus: normalizeSignalStatus(technical?.data?.signal_status) || 'clear',
        technicalStatus: String(technical?.data?.signal_status || 'N/A'),
        technicalBias: String(technical?.data?.technical_bias || 'N/A'),
        nextEarningsDate: earnings?.date || null,
        daysToEarnings: earnings?.date ? daysUntil(earnings.date) : null,
        noteLink: technical?.path
          ? filePathToWikiLink(technical.path)
          : earnings?.notePath
            ? filePathToWikiLink(earnings.notePath)
            : 'N/A',
      };
    })
    .filter(Boolean)
    .sort(compareCatalystRows);
}

function buildIndicatorRows(keyIndicators, macroContext) {
  if (!Array.isArray(keyIndicators)) return [];

  return keyIndicators.map(value => {
    const resolution = resolveMacroIndicator(value, macroContext);
    const label = resolution.label;
    const seriesId = resolution.match?.seriesId
      || resolution.match?.row?.Series
      || resolution.requestedSeriesId
      || extractSeriesIdFromLinkValue(value);
    const match = resolution.match;
    return {
      link: wikiLink(label),
      label,
      seriesId,
      resolved: Boolean(match),
      resolvedVia: resolution.resolvedVia,
      signalStatus: match ? (normalizeSignalStatus(match?.note?.data?.signal_status) || 'clear') : 'N/A',
      latestValue: match?.row?.['Latest Value'] || null,
      change: match?.row?.Change || null,
      latestDate: match?.row?.['Latest Date'] || null,
      sourceLink: match?.note?.path ? filePathToWikiLink(match.note.path) : 'N/A',
    };
  });
}

function buildRegimeRows(regimes, macroContext) {
  if (!Array.isArray(regimes)) return [];

  return regimes.map(value => {
    const name = stripWikiLink(value);
    const note = macroContext.regimeByName.get(name) || null;
    return {
      link: wikiLink(name),
      status: String(note?.data?.status || 'N/A'),
      confidence: String(note?.data?.confidence || 'N/A'),
      keyIndicators: formatLinkList(note?.data?.key_indicators),
    };
  });
}

function buildCoverageGaps({ thesis, primarySymbol, primaryTechnical, primaryFundamentals, keyIndicatorRows, catalystRows, watchlistReport, fundamentalsSymbolCount }) {
  const gaps = [];
  if (!primarySymbol) {
    gaps.push('No primary symbol was resolved from thesis core entities.');
  }
  if (!watchlistReport) {
    gaps.push('No latest thesis watchlist report was found.');
  }
  if (!primaryTechnical?.data) {
    gaps.push(`No current technical snapshot was found for ${primarySymbol || thesis.name}.`);
  }
  if (!primaryFundamentals || primaryFundamentals.coverageCount === 0) {
    gaps.push(`No cached FMP fundamentals were found for ${primarySymbol || thesis.name}.`);
  } else if (primaryFundamentals.coverageStatus !== 'complete') {
    gaps.push(`Primary symbol fundamentals are partial, not complete, for ${primarySymbol}.`);
  }
  if (fundamentalsSymbolCount < thesis.symbols.length) {
    gaps.push(`Only ${fundamentalsSymbolCount}/${thesis.symbols.length} watchlist symbol(s) have cached fundamentals.`);
  }
  const unresolvedIndicators = keyIndicatorRows.filter(row => !row.resolved);
  if (unresolvedIndicators.length > 0) {
    gaps.push(`Unmatched key indicators: ${unresolvedIndicators.map(row => row.label).join(', ')}.`);
  }
  if (catalystRows.length === 0) {
    gaps.push('No catalyst rows were available for the current thesis watchlist.');
  }
  return gaps;
}

function resolveStructuralView(noteData, primaryFundamentals) {
  let score = 0;

  score += PRIORITY_SCORE[String(noteData.allocation_priority || '').toLowerCase()] || 0;
  score += CONVICTION_SCORE[String(noteData.conviction || '').toLowerCase()] || 0;

  const monitorStatus = String(noteData.monitor_status || '').toLowerCase();
  if (monitorStatus === 'on-track') score += 1;
  else if (monitorStatus === 'mixed') score -= 1;
  else if (monitorStatus) score -= 2;

  const breakRiskStatus = String(noteData.break_risk_status || '').toLowerCase();
  if (breakRiskStatus === 'watch') score -= 1;
  else if (breakRiskStatus === 'printing') score -= 2;

  if (primaryFundamentals?.coverageCount > 0) {
    if (primaryFundamentals.netMarginPct != null && primaryFundamentals.netMarginPct < 0) score -= 1;
    if (primaryFundamentals.roePct != null && primaryFundamentals.roePct < 0) score -= 1;
  }

  if (score >= 5) return 'strong';
  if (score >= 2) return 'cautious';
  return 'fragile';
}

function resolveTacticalView({ qlibSignalStatus, technicalSignalStatus, catalystSignalStatus, nextEarningsDate }) {
  const maxSignal = resolveMaxSignalStatus([qlibSignalStatus, technicalSignalStatus, catalystSignalStatus]);
  const days = nextEarningsDate ? daysUntil(nextEarningsDate) : null;

  if (maxSignal === 'critical' || maxSignal === 'alert') return 'risky';
  if (days !== null && days <= 7) return 'risky';
  if (maxSignal === 'watch') return 'mixed';
  return 'constructive';
}

function resolveOverallSignalStatus({ qlibSignalStatus, technicalSignalStatus, macroSignalStatus, catalystSignalStatus, fundamentalsStatus, coverageGapCount }) {
  let status = resolveMaxSignalStatus([
    qlibSignalStatus,
    technicalSignalStatus,
    macroSignalStatus,
    catalystSignalStatus,
  ]);

  if (fundamentalsStatus !== 'complete' || coverageGapCount > 0) {
    status = maxSignalStatus(status, 'watch');
  }

  return status;
}

function buildActionSummary({ structuralView, tacticalView, fundamentalsStatus, coverageGapCount }) {
  if (structuralView === 'strong' && tacticalView === 'constructive' && fundamentalsStatus !== 'missing') {
    return 'Structural evidence is intact and tactical conditions are supportive, so this is the cleanest add window in the current data set.';
  }
  if (structuralView === 'strong' && tacticalView === 'risky') {
    return 'The thesis still works structurally, but the tape or catalyst window is hostile, so size changes should wait for confirmation.';
  }
  if (structuralView === 'fragile') {
    return 'Structural evidence is weak enough that the thesis should be defended first and traded second.';
  }
  if (coverageGapCount > 0) {
    return 'Evidence is usable but incomplete, so refresh missing data before taking a strong sizing action.';
  }
  return 'Evidence is mixed, so keep the thesis active while waiting for the next macro or company catalyst to resolve the conflict.';
}

function buildFrontmatterSignals(context) {
  const signals = [
    `STRUCTURAL_${context.structuralView.toUpperCase()}`,
    `TACTICAL_${context.tacticalView.toUpperCase()}`,
  ];

  if (context.qlibSignalStatus !== 'clear') {
    signals.push(`QLIB_${context.qlibSignalStatus.toUpperCase()}`);
  }
  if (context.technicalSignalStatus !== 'clear') {
    signals.push(`TECHNICAL_${context.technicalSignalStatus.toUpperCase()}`);
  }
  if (context.macroSignalStatus !== 'clear') {
    signals.push(`MACRO_${context.macroSignalStatus.toUpperCase()}`);
  }
  if (context.fundamentalsStatus !== 'complete') {
    signals.push(`FUNDAMENTALS_${context.fundamentalsStatus.toUpperCase()}`);
  }
  if (context.coverageGaps.length > 0) {
    signals.push('COVERAGE_GAPS');
  }

  return uniqueValues(signals);
}

function buildLatestCatalystMap(marketNotes) {
  const latest = new Map();

  for (const note of marketNotes) {
    if (note?.data?.data_type !== 'catalyst_note') continue;
    const symbol = normalizeSymbol(note?.data?.symbol);
    if (!symbol) continue;

    const current = latest.get(symbol);
    if (!current || compareNotes(note, current) < 0) {
      latest.set(symbol, note);
    }
  }

  return latest;
}

function compareCatalystRows(left, right) {
  const signalDiff = (SIGNAL_ORDER[right.signalStatus] ?? 0) - (SIGNAL_ORDER[left.signalStatus] ?? 0);
  if (signalDiff !== 0) return signalDiff;

  const leftDays = left.daysToEarnings ?? Number.MAX_SAFE_INTEGER;
  const rightDays = right.daysToEarnings ?? Number.MAX_SAFE_INTEGER;
  if (leftDays !== rightDays) return leftDays - rightDays;

  return left.symbol.localeCompare(right.symbol);
}

function compareNotes(left, right) {
  const leftDate = String(left?.data?.date_pulled || '');
  const rightDate = String(right?.data?.date_pulled || '');
  if (leftDate !== rightDate) {
    return rightDate.localeCompare(leftDate);
  }
  return String(right?.filename || '').localeCompare(String(left?.filename || ''));
}

function resolveMaxSignalStatus(values) {
  return values.reduce((best, current) => maxSignalStatus(best, normalizeSignalStatus(current) || 'clear'), 'clear');
}

function maxSignalStatus(left, right) {
  return (SIGNAL_ORDER[right] ?? 0) > (SIGNAL_ORDER[left] ?? 0) ? right : left;
}

function normalizeSignalStatus(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(SIGNAL_ORDER, normalized) ? normalized : null;
}

function formatContextSummary(context) {
  return [
    context.name,
    context.primarySymbol || 'no symbol',
    context.structuralView,
    context.tacticalView,
    context.overallSignalStatus,
    `${context.coverageGaps.length} gap(s)`,
  ].join(' | ');
}

function formatLinkList(values) {
  return Array.isArray(values) && values.length > 0 ? values.join(', ') : 'N/A';
}

function formatDateValue(value) {
  return value ? String(value) : 'N/A';
}

function formatCurrency(value) {
  return value == null ? 'N/A' : formatNumber(Number(value), { style: 'currency', decimals: 1 });
}

function formatCount(value) {
  return value == null || value === '' ? 'N/A' : String(value);
}

function formatValue(value, options = {}) {
  if (value === null || value === undefined || value === '') return 'N/A';
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value);
  return formatNumber(numeric, { style: 'decimal', decimals: options.decimals ?? 1 });
}

function formatPercentValue(value, decimals = 1) {
  if (value === null || value === undefined || value === '') return 'N/A';
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value);
  return formatNumber(numeric, { style: 'percent', decimals });
}

function parseOptionalNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function daysUntil(dateString) {
  const current = today();
  const [currentYear, currentMonth, currentDay] = current.split('-').map(Number);
  const [targetYear, targetMonth, targetDay] = String(dateString || '').split('-').map(Number);
  if (![currentYear, currentMonth, currentDay, targetYear, targetMonth, targetDay].every(Number.isFinite)) {
    return null;
  }

  const currentDate = Date.UTC(currentYear, currentMonth - 1, currentDay);
  const targetDate = Date.UTC(targetYear, targetMonth - 1, targetDay);
  return Math.round((targetDate - currentDate) / 86400000);
}

function filePathToWikiLink(filePath) {
  const fileName = basename(String(filePath || ''), '.md');
  return fileName ? wikiLink(fileName) : 'N/A';
}

function wikiLink(label) {
  return `[[${label}]]`;
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  run();
}
