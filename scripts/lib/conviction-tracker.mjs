import { existsSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { getPullsDir, getSignalsDir, getVaultRoot } from './config.mjs';
import { parseFrontmatter } from './history.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from './markdown.mjs';

const DEFAULT_WINDOW_DAYS = 7;
const CONVICTION_ORDER = Object.freeze(['low', 'medium', 'high']);
const PRIORITY_ORDER = Object.freeze(['watch', 'medium', 'high']);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ROUTING_SIGNAL_RE = /^\d{4}-\d{2}-\d{2}_(CONFIRM|CONTRADICT)_.+\.md$/i;

function stripWikiLink(value) {
  return String(value || '')
    .replace(/^\[\[/, '')
    .replace(/\]\]$/, '')
    .trim();
}

function parseDateValue(value) {
  if (!DATE_RE.test(String(value || ''))) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

function normalizeWindowDays(rawValue) {
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_WINDOW_DAYS;
  }
  return parsed;
}

function buildCutoffDate(windowDays) {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (windowDays - 1));
  return cutoff;
}

function suggestionStep(order, currentValue) {
  const currentIndex = order.indexOf(currentValue);
  if (currentIndex === -1) return order[0];
  return order[Math.min(currentIndex + 1, order.length - 1)];
}

function loadThesisState() {
  const thesesDir = join(getVaultRoot(), '10_Theses');
  if (!existsSync(thesesDir)) return new Map();

  const entries = new Map();
  for (const fileName of readdirSync(thesesDir).filter(file => file.endsWith('.md'))) {
    const filePath = join(thesesDir, fileName);
    const frontmatter = parseFrontmatter(readFileSync(filePath, 'utf-8'));
    if (!frontmatter || frontmatter.node_type !== 'thesis') continue;

    const fileBase = fileName.replace(/\.md$/i, '');
    entries.set(fileBase, Object.freeze({
      fileBase,
      fileName,
      filePath,
      name: frontmatter.name || fileBase,
      status: frontmatter.status || 'Active',
      conviction: frontmatter.conviction || 'low',
      allocationPriority: frontmatter.allocation_priority || 'watch',
      monitorStatus: frontmatter.monitor_status || 'on-track',
      breakRiskStatus: frontmatter.break_risk_status || 'not-seen',
    }));
  }

  return entries;
}

function readRoutingSignals(windowDays) {
  const signalsDir = getSignalsDir();
  const cutoff = buildCutoffDate(windowDays);
  if (!existsSync(signalsDir)) return [];

  const signals = [];
  for (const fileName of readdirSync(signalsDir).filter(file => ROUTING_SIGNAL_RE.test(file))) {
    const filePath = join(signalsDir, fileName);
    const frontmatter = parseFrontmatter(readFileSync(filePath, 'utf-8'));
    if (!frontmatter) continue;

    const signalDate = parseDateValue(frontmatter.date);
    if (!signalDate || signalDate < cutoff) continue;

    const thesisFileBase = stripWikiLink(frontmatter.thesis);
    const score = Number(frontmatter.score);
    if (!thesisFileBase || !Number.isFinite(score)) continue;

    signals.push(Object.freeze({
      fileName,
      filePath,
      signalId: frontmatter.signal_id || fileName.replace(/\.md$/i, ''),
      signalName: frontmatter.signal_name || fileName.replace(/\.md$/i, ''),
      date: frontmatter.date,
      thesisFileBase,
      score,
      direction: frontmatter.direction || (score >= 0 ? 'confirm' : 'contradict'),
      severity: frontmatter.severity || 'watch',
    }));
  }

  return signals.sort((left, right) => {
    if (left.date !== right.date) return right.date.localeCompare(left.date);
    return right.fileName.localeCompare(left.fileName);
  });
}

function summarizeAction(rollup) {
  if (rollup.netScore >= 5) {
    return `Suggest ${rollup.suggestedConviction} conviction and ${rollup.suggestedAllocationPriority} priority`;
  }
  if (rollup.netScore >= 3) {
    return 'Monitor strengthening';
  }
  if (rollup.netScore <= -5) {
    return 'Place On Hold and cut to watch priority';
  }
  if (rollup.netScore <= -3) {
    return 'Break-risk watch';
  }
  return 'No automatic sizing change';
}

function deriveRollup(signalEntries, thesisState) {
  const positiveScore = signalEntries
    .filter(signal => signal.score > 0)
    .reduce((sum, signal) => sum + signal.score, 0);
  const negativeScore = signalEntries
    .filter(signal => signal.score < 0)
    .reduce((sum, signal) => sum + signal.score, 0);
  const netScore = signalEntries.reduce((sum, signal) => sum + signal.score, 0);
  const latestSignalDate = signalEntries[0]?.date || '';
  const thesis = thesisState ?? {
    name: signalEntries[0]?.thesisFileBase || 'Unknown Thesis',
    status: 'Active',
    conviction: 'low',
    allocationPriority: 'watch',
    monitorStatus: 'on-track',
    breakRiskStatus: 'not-seen',
  };

  const suggestedConviction = netScore >= 5
    ? suggestionStep(CONVICTION_ORDER, thesis.conviction)
    : '';
  const suggestedAllocationPriority = netScore >= 5
    ? suggestionStep(PRIORITY_ORDER, thesis.allocationPriority)
    : netScore <= -5
      ? 'watch'
      : '';
  const suggestedStatus = netScore <= -5 ? 'On Hold' : '';
  const suggestedMonitorStatus = netScore >= 3 ? 'strengthening' : 'on-track';
  const suggestedBreakRiskStatus = netScore <= -3 ? 'watch' : 'not-seen';

  return Object.freeze({
    thesisFileBase: signalEntries[0]?.thesisFileBase || '',
    thesisName: thesis.name,
    currentStatus: thesis.status,
    currentConviction: thesis.conviction,
    currentAllocationPriority: thesis.allocationPriority,
    netScore,
    positiveScore,
    negativeScore,
    signalCount: signalEntries.length,
    positiveCount: signalEntries.filter(signal => signal.score > 0).length,
    negativeCount: signalEntries.filter(signal => signal.score < 0).length,
    latestSignalDate,
    latestSignalLink: signalEntries[0] ? `[[${signalEntries[0].fileName.replace(/\.md$/i, '')}]]` : '',
    suggestedConviction,
    suggestedAllocationPriority,
    suggestedStatus,
    suggestedMonitorStatus,
    suggestedBreakRiskStatus,
    actionSummary: summarizeAction({
      netScore,
      suggestedConviction,
      suggestedAllocationPriority,
    }),
  });
}

export function buildConvictionSummary(windowDays = DEFAULT_WINDOW_DAYS) {
  const normalizedWindowDays = normalizeWindowDays(windowDays);
  const thesisState = loadThesisState();
  const signals = readRoutingSignals(normalizedWindowDays);
  const byThesis = new Map();

  for (const signal of signals) {
    const list = byThesis.get(signal.thesisFileBase) || [];
    list.push(signal);
    byThesis.set(signal.thesisFileBase, list);
  }

  const rollups = [...byThesis.entries()]
    .map(([thesisFileBase, signalEntries]) => deriveRollup(signalEntries, thesisState.get(thesisFileBase)))
    .sort((left, right) => {
      if (Math.abs(left.netScore) !== Math.abs(right.netScore)) {
        return Math.abs(right.netScore) - Math.abs(left.netScore);
      }
      return left.thesisName.localeCompare(right.thesisName);
    });

  const strongestPositive = rollups
    .filter(rollup => rollup.netScore > 0)
    .sort((left, right) => right.netScore - left.netScore)[0] ?? null;
  const strongestNegative = rollups
    .filter(rollup => rollup.netScore < 0)
    .sort((left, right) => left.netScore - right.netScore)[0] ?? null;
  const signalStatus = rollups.some(rollup => rollup.netScore <= -5)
    ? 'alert'
    : rollups.some(rollup => Math.abs(rollup.netScore) >= 3)
      ? 'watch'
      : 'clear';

  return Object.freeze({
    generatedOn: today(),
    windowDays: normalizedWindowDays,
    signalCount: signals.length,
    thesesCovered: rollups.length,
    signalStatus,
    strongestPositive,
    strongestNegative,
    rollups: Object.freeze(rollups),
  });
}

export function buildConvictionDeltaNote(summary) {
  const topSignals = [];
  if (summary.strongestPositive) {
    topSignals.push(`UP:${summary.strongestPositive.thesisName}`);
  }
  if (summary.strongestNegative) {
    topSignals.push(`DOWN:${summary.strongestNegative.thesisName}`);
  }

  const frontmatter = {
    title: `Conviction Delta ${summary.windowDays}d`,
    source: 'conviction-tracker',
    date_pulled: summary.generatedOn,
    domain: 'sectors',
    data_type: 'conviction_delta',
    frequency: 'weekly',
    signal_status: summary.signalStatus,
    signals: topSignals,
    window_days: summary.windowDays,
    theses_covered: summary.thesesCovered,
    signal_files_considered: summary.signalCount,
    strongest_positive: summary.strongestPositive?.thesisName || '',
    strongest_negative: summary.strongestNegative?.thesisName || '',
    tags: ['sector', 'conviction-delta', `window-${summary.windowDays}d`],
  };

  const summaryLines = [
    `- Window: last ${summary.windowDays} day(s)`,
    `- Theses covered: ${summary.thesesCovered}`,
    `- Signals considered: ${summary.signalCount}`,
    `- Strongest positive: ${summary.strongestPositive ? `${summary.strongestPositive.thesisName} (${summary.strongestPositive.netScore >= 0 ? '+' : ''}${summary.strongestPositive.netScore})` : 'None'}`,
    `- Strongest negative: ${summary.strongestNegative ? `${summary.strongestNegative.thesisName} (${summary.strongestNegative.netScore})` : 'None'}`,
  ].join('\n');

  const table = summary.rollups.length === 0
    ? 'No recent CONFIRM/CONTRADICT sector-scan signals in the selected window.'
    : buildTable(
        ['Thesis', 'Current Conviction', 'Current Priority', 'Net Score', 'Signals', 'Last Signal', 'Suggested Action'],
        summary.rollups.map(rollup => ([
          `[[${rollup.thesisFileBase}]]`,
          rollup.currentConviction,
          rollup.currentAllocationPriority,
          `${rollup.netScore >= 0 ? '+' : ''}${rollup.netScore}`,
          String(rollup.signalCount),
          rollup.latestSignalDate || 'N/A',
          rollup.actionSummary,
        ]))
      );

  return buildNote({
    frontmatter,
    sections: [
      {
        heading: 'Summary',
        content: summaryLines,
      },
      {
        heading: 'Conviction Momentum',
        content: table,
      },
    ],
  });
}

export async function run(flags = {}) {
  const windowDays = normalizeWindowDays(flags.window);
  const dryRun = Boolean(flags['dry-run']);
  const outputJson = Boolean(flags.json);
  const summary = buildConvictionSummary(windowDays);
  const note = buildConvictionDeltaNote(summary);

  const sectorsDir = join(getPullsDir(), 'Sectors');
  const filePath = join(sectorsDir, dateStampedFilename('Conviction_Delta'));
  if (!dryRun) {
    mkdirSync(sectorsDir, { recursive: true });
    writeNote(filePath, note);
  }

  const result = Object.freeze({
    ...summary,
    filePath,
    dryRun,
  });

  if (outputJson) {
    return result;
  }

  if (dryRun) {
    console.log(`[conviction-delta] Dry run only. Would write: ${filePath}`);
  } else {
    console.log(`[conviction-delta] Wrote: ${filePath}`);
  }
  console.log(`[conviction-delta] Window: ${summary.windowDays} day(s) | Theses: ${summary.thesesCovered} | Signals: ${summary.signalCount}`);
  if (summary.strongestPositive) {
    console.log(`[conviction-delta] Strongest positive: ${summary.strongestPositive.thesisName} (${summary.strongestPositive.netScore >= 0 ? '+' : ''}${summary.strongestPositive.netScore})`);
  }
  if (summary.strongestNegative) {
    console.log(`[conviction-delta] Strongest negative: ${summary.strongestNegative.thesisName} (${summary.strongestNegative.netScore})`);
  }

  return result;
}
