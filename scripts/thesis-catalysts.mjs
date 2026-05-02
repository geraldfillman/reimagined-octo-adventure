#!/usr/bin/env node
/**
 * thesis-catalysts.mjs - Generate company-level catalyst notes from thesis and FMP context.
 */

import { basename, join } from 'path';
import { getPullsDir } from './lib/config.mjs';
import { buildNote, buildTable, dateStampedFilename, formatNumber, today, writeNote } from './lib/markdown.mjs';
import { loadLatestFmpMarketContext, normalizeDate } from './lib/fmp-market-context.mjs';
import { loadThesisWatchlists, normalizeSymbol } from './lib/thesis-watchlists.mjs';

const PRIORITY_ORDER = Object.freeze({
  high: 0,
  medium: 1,
  watch: 2,
});

const CONVICTION_ORDER = Object.freeze({
  high: 0,
  medium: 1,
  low: 2,
});

const SIGNAL_ORDER = Object.freeze({
  clear: 0,
  watch: 1,
  alert: 2,
  critical: 3,
});

export async function run(flags = {}) {
  const dryRun = Boolean(flags['dry-run']);
  const includeBaskets = Boolean(flags['include-baskets']);
  const thesisFilter = String(flags.thesis || '').trim();
  const includeAll = Boolean(flags.all);
  const windowDays = parseIntegerFlag(flags.window, 21, '--window');
  const symbolFilter = parseSymbolFilter(flags.symbols || flags.symbol || '');

  const watchlists = await loadThesisWatchlists({
    includeBaskets,
    thesisFilter,
  });
  const marketContext = await loadLatestFmpMarketContext();
  const catalystContexts = buildCatalystContexts(watchlists, marketContext, { symbolFilter, windowDays, includeAll });

  if (catalystContexts.length === 0) {
    console.log('No catalyst-note candidates matched the requested filters.');
    return { scanned: 0, written: 0 };
  }

  if (dryRun) {
    for (const context of catalystContexts) {
      console.log(`[dry-run] ${formatContextSummary(context)}`);
    }
    console.log(`Catalyst note dry run complete: ${catalystContexts.length} candidate(s).`);
    return { scanned: catalystContexts.length, written: 0 };
  }

  const filePaths = [];
  for (const context of catalystContexts) {
    const note = buildCatalystNote(context, windowDays);
    const filePath = join(getPullsDir(), 'Market', dateStampedFilename(`Catalyst_${context.symbol}`));
    writeNote(filePath, note);
    filePaths.push(filePath);
    console.log(`Wrote ${context.symbol} catalyst note: ${filePath}`);
  }

  console.log(`Catalyst note generation complete: ${filePaths.length} note(s) written.`);
  return { scanned: catalystContexts.length, written: filePaths.length, filePaths };
}

function buildCatalystContexts(watchlists, marketContext, { symbolFilter, windowDays, includeAll }) {
  const symbolContexts = new Map();

  for (const watchlist of watchlists) {
    for (const symbol of watchlist.symbols) {
      if (symbolFilter.size > 0 && !symbolFilter.has(symbol)) continue;

      let context = symbolContexts.get(symbol);
      if (!context) {
        context = {
          symbol,
          theses: [],
          technical: marketContext.technicalBySymbol.get(symbol) || null,
          earnings: marketContext.earningsBySymbol.get(symbol) || null,
        };
        symbolContexts.set(symbol, context);
      }

      context.theses.push(buildThesisContext(watchlist, marketContext.watchlistReportsByThesis.get(watchlist.name) || null));
    }
  }

  const candidates = [];
  for (const context of symbolContexts.values()) {
    context.theses.sort(compareThesisContexts);
    context.primaryThesis = context.theses[0] || null;
    context.relatedTheses = context.theses.map(thesis => wikiLink(thesis.name));
    context.linkedThesisCount = context.theses.length;
    context.highPriorityThesisCount = context.theses.filter(thesis => thesis.allocationPriority === 'high').length;
    context.nonOnTrackThesisCount = context.theses.filter(thesis => thesis.monitorStatus && thesis.monitorStatus !== 'on-track').length;
    context.hasTechnicalContext = Boolean(context.technical?.data);
    context.hasEarningsContext = Boolean(context.earnings);
    context.nextEarningsDate = context.earnings?.date ?? null;
    context.daysToEarnings = context.nextEarningsDate ? daysUntil(context.nextEarningsDate) : null;
    context.catalystScore = calculateCatalystScore(context);
    context.signalStatus = resolveSignalStatus(context);
    context.catalystUrgency = resolveCatalystUrgency(context);
    context.signalNames = buildSignalNames(context, windowDays);
    context.reviewCue = buildReviewCue(context, windowDays);

    if (includeAll || symbolFilter.size > 0 || isActiveCatalystContext(context, windowDays)) {
      candidates.push(context);
    }
  }

  return candidates.sort(compareCatalystContexts);
}

function buildThesisContext(watchlist, watchlistReport) {
  const noteData = watchlist.note?.data || {};
  return {
    name: watchlist.name,
    wikiLink: wikiLink(watchlist.name),
    relativePath: watchlist.relativePath,
    isBasket: watchlist.isBasket,
    allocationPriority: String(noteData.allocation_priority || '').trim().toLowerCase() || null,
    allocationRank: Number.isFinite(Number(noteData.allocation_rank)) ? Number(noteData.allocation_rank) : 999,
    conviction: String(noteData.conviction || '').trim().toLowerCase() || null,
    monitorStatus: String(noteData.monitor_status || '').trim().toLowerCase() || null,
    monitorLastReview: normalizeDate(noteData.monitor_last_review),
    nextCatalyst: String(noteData.next_catalyst || '').trim() || null,
    monitorAction: String(noteData.monitor_action || '').trim() || null,
    watchlistReportPath: watchlistReport?.path || null,
  };
}

function buildCatalystNote(context, windowDays) {
  const relatedPulls = uniqueValues([
    context.technical?.path ? filePathToWikiLink(context.technical.path) : null,
    context.earnings?.notePath ? filePathToWikiLink(context.earnings.notePath) : null,
    ...context.theses.map(thesis => thesis.watchlistReportPath ? filePathToWikiLink(thesis.watchlistReportPath) : null),
  ]);

  const technical = context.technical?.data || null;
  const frontmatter = {
    title: `${context.symbol} Catalyst Note`,
    source: 'FMP + Thesis Monitor',
    symbol: context.symbol,
    primary_thesis: context.primaryThesis?.wikiLink || null,
    related_theses: context.relatedTheses,
    linked_thesis_count: context.linkedThesisCount,
    primary_allocation_priority: context.primaryThesis?.allocationPriority || null,
    primary_monitor_status: context.primaryThesis?.monitorStatus || null,
    high_priority_thesis_count: context.highPriorityThesisCount,
    non_on_track_thesis_count: context.nonOnTrackThesisCount,
    has_technical_context: context.hasTechnicalContext,
    has_earnings_context: context.hasEarningsContext,
    next_earnings_date: context.nextEarningsDate,
    days_to_earnings: context.daysToEarnings,
    technical_status: technical?.signal_status ?? null,
    technical_bias: technical?.technical_bias ?? null,
    momentum_state: technical?.momentum_state ?? null,
    rsi14: normalizeNumber(technical?.rsi14, 2),
    price_vs_sma200_pct: normalizeNumber(technical?.price_vs_sma200_pct, 2),
    catalyst_urgency: context.catalystUrgency,
    catalyst_score: context.catalystScore,
    related_pulls: relatedPulls,
    date_pulled: today(),
    domain: 'market',
    data_type: 'catalyst_note',
    frequency: 'on-demand',
    signal_status: context.signalStatus,
    signals: context.signalNames,
    tags: ['equities', 'catalyst', 'market', 'thesis', 'fmp', context.symbol.toLowerCase()],
  };

  const sections = [
    {
      heading: 'Catalyst Snapshot',
      content: buildSnapshotContent(context),
    },
    {
      heading: 'Thesis Context',
      content: buildTable(
        ['Thesis', 'Priority', 'Conviction', 'Monitor', 'Next Catalyst', 'Action'],
        context.theses.map(thesis => [
          thesis.wikiLink,
          thesis.allocationPriority || 'N/A',
          thesis.conviction || 'N/A',
          thesis.monitorStatus || 'N/A',
          thesis.nextCatalyst || 'N/A',
          thesis.monitorAction || 'N/A',
        ])
      ),
    },
    {
      heading: 'Earnings Catalyst',
      content: buildEarningsContent(context, windowDays),
    },
    {
      heading: 'Technical State',
      content: buildTechnicalContent(context),
    },
  ];

  const gapsContent = buildCoverageGapContent(context);
  if (gapsContent) {
    sections.push({
      heading: 'Coverage Gaps',
      content: gapsContent,
    });
  }

  sections.push(
    {
      heading: 'Review Cue',
      content: context.reviewCue.map(line => `- ${line}`).join('\n'),
    },
    {
      heading: 'Source',
      content: buildSourceContent(context, relatedPulls),
    }
  );

  return buildNote({ frontmatter, sections });
}

function buildSnapshotContent(context) {
  return [
    `- **Symbol**: ${context.symbol}`,
    `- **Urgency**: ${context.catalystUrgency} (score ${context.catalystScore})`,
    `- **Primary Thesis**: ${context.primaryThesis?.wikiLink || 'N/A'}`,
    `- **Linked Theses**: ${context.relatedTheses.join(', ')}`,
    `- **Next Earnings**: ${formatEarningsWindow(context.nextEarningsDate, context.daysToEarnings)}`,
    `- **Technical**: ${formatTechnicalSummary(context)}`,
    `- **Monitor**: ${formatMonitorSummary(context)}`,
  ].join('\n');
}

function buildEarningsContent(context, windowDays) {
  if (!context.earnings) {
    return `No earnings row found in the latest FMP calendar notes. Run \`node run.mjs pull fmp --thesis-watchlists\` or \`node run.mjs pull fmp --earnings-calendar --from ${today()} --to ${shiftDate(today(), windowDays)}\` for fresh catalyst timing.`;
  }

  return buildTable(
    ['Date', 'Days', 'EPS Est', 'EPS Act', 'Revenue Est', 'Revenue Act', 'Last Updated', 'Source'],
    [[
      context.earnings.date,
      context.daysToEarnings ?? 'N/A',
      context.earnings.epsEstimated || 'N/A',
      context.earnings.epsActual || 'N/A',
      context.earnings.revenueEstimated || 'N/A',
      context.earnings.revenueActual || 'N/A',
      context.earnings.lastUpdated || 'N/A',
      filePathToWikiLink(context.earnings.notePath),
    ]]
  );
}

function buildTechnicalContent(context) {
  const technical = context.technical?.data;
  if (!technical) {
    return `No daily technical snapshot was found for ${context.symbol}. Run \`node run.mjs pull fmp --technical ${context.symbol}\` or refresh watchlists before relying on tape damage here.`;
  }

  return buildTable(
    ['Status', 'Bias', 'Momentum', 'RSI 14', 'Vs 200D %', 'Snapshot'],
    [[
      technical.signal_status || 'N/A',
      technical.technical_bias || 'N/A',
      technical.momentum_state || 'N/A',
      hasMetric(technical.rsi14) ? formatNumber(Number(technical.rsi14), { decimals: 1 }) : 'N/A',
      hasMetric(technical.price_vs_sma200_pct) ? formatNumber(Number(technical.price_vs_sma200_pct), { style: 'percent', decimals: 1 }) : 'N/A',
      filePathToWikiLink(context.technical.path),
    ]]
  );
}

function buildCoverageGapContent(context) {
  const gaps = [];
  if (!context.hasTechnicalContext) {
    gaps.push(`- Missing daily FMP technical snapshot for ${context.symbol}.`);
  }
  if (!context.hasEarningsContext) {
    gaps.push(`- Missing latest earnings-calendar row for ${context.symbol}.`);
  }
  return gaps.length > 0 ? gaps.join('\n') : '';
}

function buildSourceContent(context, relatedPulls) {
  return [
    `- **Window Logic**: earnings inside 21 days, non-clear tape, non-on-track thesis monitors, or high-priority thesis membership`,
    `- **Technical Snapshot**: ${context.technical?.path ? filePathToWikiLink(context.technical.path) : 'none found'}`,
    `- **Earnings Calendar**: ${context.earnings?.notePath ? filePathToWikiLink(context.earnings.notePath) : 'none found'}`,
    `- **Watchlist Reports**: ${relatedPulls.filter(link => link !== (context.technical?.path ? filePathToWikiLink(context.technical.path) : null) && link !== (context.earnings?.notePath ? filePathToWikiLink(context.earnings.notePath) : null)).join(', ') || 'none found'}`,
    `- **Auto-pulled**: ${today()}`,
  ].join('\n');
}

function calculateCatalystScore(context) {
  let score = 0;

  if (context.primaryThesis?.allocationPriority === 'high') score += 3;
  else if (context.primaryThesis?.allocationPriority === 'medium') score += 2;
  else if (context.primaryThesis?.allocationPriority === 'watch') score += 1;

  if (context.primaryThesis?.conviction === 'high') score += 2;
  else if (context.primaryThesis?.conviction === 'medium') score += 1;

  if (context.daysToEarnings !== null) {
    if (context.daysToEarnings <= 1) score += 3;
    else if (context.daysToEarnings <= 7) score += 2;
    else if (context.daysToEarnings <= 21) score += 1;
  }

  const technicalStatus = context.technical?.data?.signal_status;
  if (technicalStatus === 'critical') score += 3;
  else if (technicalStatus === 'alert') score += 2;
  else if (technicalStatus === 'watch') score += 1;

  if (context.technical?.data?.technical_bias === 'bearish') score += 2;
  if (context.technical?.data?.momentum_state === 'overbought' || context.technical?.data?.momentum_state === 'oversold') score += 1;

  if (context.primaryThesis?.monitorStatus === 'mixed') score += 2;
  else if (context.primaryThesis?.monitorStatus && context.primaryThesis.monitorStatus !== 'on-track') score += 1;

  if (!context.hasTechnicalContext && context.highPriorityThesisCount > 0) score += 1;
  if (!context.hasEarningsContext && context.highPriorityThesisCount > 0) score += 1;

  return score;
}

function resolveSignalStatus(context) {
  let status = context.technical?.data?.signal_status || 'clear';
  const hasImmediateCatalyst = context.daysToEarnings !== null && context.daysToEarnings <= 7;
  const hasNonClearTape = Boolean(context.technical?.data?.signal_status && context.technical.data.signal_status !== 'clear');

  if (hasImmediateCatalyst) {
    status = maxSignalStatus(status, context.highPriorityThesisCount > 0 ? 'alert' : 'watch');
  } else if (context.daysToEarnings !== null && context.daysToEarnings <= 21) {
    status = maxSignalStatus(status, 'watch');
  }

  if (context.primaryThesis?.monitorStatus === 'mixed') {
    status = maxSignalStatus(
      status,
      context.highPriorityThesisCount > 0 && (hasImmediateCatalyst || hasNonClearTape) ? 'alert' : 'watch'
    );
  } else if (context.primaryThesis?.monitorStatus && context.primaryThesis.monitorStatus !== 'on-track') {
    status = maxSignalStatus(status, 'watch');
  }

  if (context.highPriorityThesisCount > 0 && (!context.hasTechnicalContext || !context.hasEarningsContext)) {
    status = maxSignalStatus(status, 'watch');
  }

  if (context.highPriorityThesisCount > 0 && context.daysToEarnings !== null && context.daysToEarnings <= 1 && status !== 'clear') {
    status = maxSignalStatus(status, 'critical');
  }

  return status;
}

function resolveCatalystUrgency(context) {
  if (context.signalStatus === 'critical') return 'immediate';
  if (context.signalStatus === 'alert') return 'near-term';
  if (context.signalStatus === 'watch') return 'active';
  return 'background';
}

function buildSignalNames(context, windowDays) {
  const signals = [];

  if (context.highPriorityThesisCount > 0) signals.push('HIGH_PRIORITY_THESIS');
  if (context.nonOnTrackThesisCount > 0) signals.push('MONITOR_NOT_ON_TRACK');
  if (context.primaryThesis?.monitorStatus === 'mixed') signals.push('MONITOR_MIXED');

  if (context.daysToEarnings !== null) {
    if (context.daysToEarnings <= 1) signals.push('EARNINGS_WITHIN_1D');
    else if (context.daysToEarnings <= 7) signals.push('EARNINGS_WITHIN_7D');
    else if (context.daysToEarnings <= windowDays) signals.push(`EARNINGS_WITHIN_${windowDays}D`);
  }

  const technicalStatus = context.technical?.data?.signal_status;
  if (technicalStatus && technicalStatus !== 'clear') {
    signals.push(`TECHNICAL_${technicalStatus.toUpperCase()}`);
  }

  const bias = context.technical?.data?.technical_bias;
  if (bias === 'bearish') signals.push('TECHNICAL_BEARISH');

  const momentum = context.technical?.data?.momentum_state;
  if (momentum === 'overbought' || momentum === 'oversold') {
    signals.push(`MOMENTUM_${momentum.toUpperCase()}`);
  }

  if (!context.hasTechnicalContext) signals.push('TECHNICAL_GAP');
  if (!context.hasEarningsContext) signals.push('EARNINGS_GAP');

  return uniqueValues(signals);
}

function buildReviewCue(context, windowDays) {
  const lines = [];

  if (context.daysToEarnings !== null && context.daysToEarnings <= 7) {
    lines.push(`Earnings are inside 7 days, so sizing and thesis updates should be checked before the event.`);
  } else if (context.daysToEarnings !== null && context.daysToEarnings <= windowDays) {
    lines.push(`Earnings are inside the ${windowDays}-day catalyst window, so keep the event on the review calendar.`);
  }

  if (context.technical?.data?.signal_status && context.technical.data.signal_status !== 'clear') {
    lines.push(`The tape is not clear (${context.technical.data.signal_status}/${context.technical.data.technical_bias || 'mixed'}), so avoid treating the name as a clean add without confirmation.`);
  }

  if (context.primaryThesis?.monitorStatus === 'mixed') {
    lines.push(`The primary thesis monitor is mixed, so this name is a good pressure test for whether conviction still matches the evidence.`);
  } else if (context.primaryThesis?.monitorStatus && context.primaryThesis.monitorStatus !== 'on-track') {
    lines.push(`The primary thesis monitor is ${context.primaryThesis.monitorStatus}, so use the next review to decide whether the catalyst path still supports the position.`);
  }

  if (!context.hasTechnicalContext || !context.hasEarningsContext) {
    lines.push(`Market coverage is incomplete, so refresh thesis watchlists before making a sizing decision.`);
  }

  if (lines.length === 0) {
    lines.push('Nothing is flashing urgently, but this name still sits inside the monitored thesis universe and can be revisited after the next market refresh.');
  }

  return lines;
}

function isActiveCatalystContext(context, windowDays) {
  return context.highPriorityThesisCount > 0
    || context.nonOnTrackThesisCount > 0
    || (context.daysToEarnings !== null && context.daysToEarnings <= windowDays)
    || (context.technical?.data?.signal_status && context.technical.data.signal_status !== 'clear');
}

function compareCatalystContexts(left, right) {
  if (SIGNAL_ORDER[right.signalStatus] !== SIGNAL_ORDER[left.signalStatus]) {
    return SIGNAL_ORDER[right.signalStatus] - SIGNAL_ORDER[left.signalStatus];
  }
  if (right.catalystScore !== left.catalystScore) {
    return right.catalystScore - left.catalystScore;
  }
  if ((left.daysToEarnings ?? Number.MAX_SAFE_INTEGER) !== (right.daysToEarnings ?? Number.MAX_SAFE_INTEGER)) {
    return (left.daysToEarnings ?? Number.MAX_SAFE_INTEGER) - (right.daysToEarnings ?? Number.MAX_SAFE_INTEGER);
  }
  return left.symbol.localeCompare(right.symbol);
}

function compareThesisContexts(left, right) {
  const leftPriority = PRIORITY_ORDER[left.allocationPriority] ?? 99;
  const rightPriority = PRIORITY_ORDER[right.allocationPriority] ?? 99;
  if (leftPriority !== rightPriority) return leftPriority - rightPriority;

  if (left.allocationRank !== right.allocationRank) return left.allocationRank - right.allocationRank;

  const leftConviction = CONVICTION_ORDER[left.conviction] ?? 99;
  const rightConviction = CONVICTION_ORDER[right.conviction] ?? 99;
  if (leftConviction !== rightConviction) return leftConviction - rightConviction;

  return left.name.localeCompare(right.name);
}

function formatContextSummary(context) {
  return [
    context.symbol,
    context.primaryThesis?.name || 'no thesis',
    context.signalStatus,
    context.catalystUrgency,
    `score ${context.catalystScore}`,
    `earnings ${formatEarningsWindow(context.nextEarningsDate, context.daysToEarnings)}`,
    `tech ${context.technical?.data?.signal_status || 'none'}`,
  ].join(' | ');
}

function formatEarningsWindow(date, daysToEarnings) {
  if (!date) return 'none found';
  if (daysToEarnings === null || daysToEarnings === undefined) return date;
  if (daysToEarnings === 0) return `${date} (today)`;
  if (daysToEarnings > 0) return `${date} (${daysToEarnings}d)`;
  return `${date} (${Math.abs(daysToEarnings)}d ago)`;
}

function formatTechnicalSummary(context) {
  const technical = context.technical?.data;
  if (!technical) return 'missing daily snapshot';

  const parts = [
    technical.signal_status || 'clear',
    technical.technical_bias || 'mixed',
    technical.momentum_state || 'unknown',
  ];
  if (hasMetric(technical.price_vs_sma200_pct)) {
    parts.push(`${formatNumber(Number(technical.price_vs_sma200_pct), { style: 'percent', decimals: 1 })} vs 200D`);
  }
  return parts.join(' | ');
}

function formatMonitorSummary(context) {
  const statuses = uniqueValues(context.theses.map(thesis => thesis.monitorStatus).filter(Boolean));
  return statuses.length > 0 ? statuses.join(', ') : 'N/A';
}

function parseSymbolFilter(value) {
  return new Set(
    String(value || '')
      .split(',')
      .map(item => normalizeSymbol(item))
      .filter(Boolean)
  );
}

function parseIntegerFlag(value, fallback, flagName) {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${flagName} must be a positive integer.`);
  }
  return parsed;
}

function normalizeNumber(value, decimals = 2) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Number(numeric.toFixed(decimals));
}

function maxSignalStatus(left, right) {
  return (SIGNAL_ORDER[right] ?? 0) > (SIGNAL_ORDER[left] ?? 0) ? right : left;
}

function daysUntil(dateString) {
  const normalized = normalizeDate(dateString);
  if (!normalized) return null;

  const [year, month, day] = normalized.split('-').map(Number);
  const target = Date.UTC(year, month - 1, day);
  const current = today();
  const [currentYear, currentMonth, currentDay] = current.split('-').map(Number);
  const now = Date.UTC(currentYear, currentMonth - 1, currentDay);
  return Math.round((target - now) / 86400000);
}

function shiftDate(dateString, days) {
  const [year, month, day] = dateString.split('-').map(Number);
  const value = new Date(Date.UTC(year, month - 1, day));
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function filePathToWikiLink(filePath) {
  const fileName = basename(String(filePath || ''), '.md');
  return fileName ? `[[${fileName}]]` : 'N/A';
}

function wikiLink(label) {
  return `[[${label}]]`;
}

function hasMetric(value) {
  return Number.isFinite(Number(value));
}

function uniqueValues(items) {
  return [...new Set(items.filter(Boolean))];
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  run();
}
