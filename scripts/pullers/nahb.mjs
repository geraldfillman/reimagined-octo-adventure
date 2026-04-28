/**
 * nahb.mjs - Pull NAHB builder-confidence evidence from the official HMI pages.
 *
 * Usage:
 *   node run.mjs nahb
 *   node run.mjs nahb --builder-confidence
 *   node run.mjs nahb --builder-confidence --dry-run
 */

import { join } from 'path';
import { getPullsDir } from '../lib/config.mjs';
import { fetchWithRetry } from '../lib/fetcher.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';

const HMI_URL = 'https://www.nahb.org/News-and-Economics/Housing-Economics/Indices/Housing-Market-Index?mod=article_inline';
const RELEASE_DATES_URL = 'https://www.nahb.org/news-and-economics/housing-economics/indices/nahb-wells-fargo-housing-market-index-release-dates';

const WORD_TO_NUMBER = Object.freeze({
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
});

export async function pull(flags = {}) {
  if (flags['builder-confidence'] || Object.keys(flags).length === 0 || (Object.keys(flags).length === 1 && flags['dry-run'])) {
    return pullBuilderConfidence(flags);
  }

  throw new Error('Specify --builder-confidence or run without flags.');
}

async function pullBuilderConfidence(flags) {
  console.log('Pulling NAHB builder confidence from official HMI pages...');

  const [hmiHtml, scheduleHtml] = await Promise.all([
    getText(HMI_URL),
    getText(RELEASE_DATES_URL),
  ]);

  const snapshot = parseHmiSnapshot(hmiHtml);
  const scheduleRows = parseReleaseSchedule(scheduleHtml);
  const releaseDate = resolveReleaseDate(snapshot.periodLabel, scheduleRows);
  const nextRelease = resolveNextRelease(scheduleRows);
  const summaryRows = buildSummaryRows(snapshot, releaseDate);
  const signalStatus = resolveSignalStatus(snapshot.hmi.latest);
  const signals = buildSignals(snapshot, signalStatus);

  if (flags['dry-run']) {
    console.log(`[dry-run] ${snapshot.periodLabel}: HMI ${snapshot.hmi.latest} (${formatSignedNumber(snapshot.hmi.change)})`);
    console.log(`[dry-run] Release date: ${releaseDate || 'N/A'} | Next release: ${nextRelease?.label || 'N/A'} ${nextRelease?.date || ''}`.trim());
    return { filePath: null, signals };
  }

  const note = buildNote({
    frontmatter: {
      title: 'NAHB Builder Confidence',
      source: 'NAHB Housing Market Index',
      indicator: 'Builder Confidence Index',
      series_id: 'NAHB_HMI',
      period: snapshot.periodLabel,
      record_date: releaseDate,
      next_release_date: nextRelease?.date || null,
      related_theses: ['[[Housing Supply Correction]]'],
      date_pulled: today(),
      domain: 'housing',
      data_type: 'time_series',
      frequency: 'monthly',
      signal_status: signalStatus,
      signals,
      tags: ['housing', 'nahb', 'builder-confidence', 'sentiment', 'thesis'],
      related_pulls: [],
    },
    sections: [
      {
        heading: 'Core Indicator Snapshot',
        content: buildTable(
          ['Series', 'Name', 'Latest Date', 'Latest Value', 'Prior Value', 'Change'],
          summaryRows
        ),
      },
      {
        heading: 'Market Cooling Context',
        content: buildTable(
          ['Metric', 'Latest', 'Prior', 'Change'],
          [
            ['Builders Cutting Prices %', formatOptionalPercent(snapshot.priceCuts.latest), formatOptionalPercent(snapshot.priceCuts.prior), formatSignedNumber(snapshot.priceCuts.change, '%')],
            ['Sales Incentives %', formatOptionalPercent(snapshot.salesIncentives.latest), formatOptionalPercent(snapshot.salesIncentives.prior), formatSignedNumber(snapshot.salesIncentives.change, '%')],
            ['Average Price Reduction %', formatOptionalPercent(snapshot.averagePriceReduction.latest), formatOptionalPercent(snapshot.averagePriceReduction.prior), formatSignedNumber(snapshot.averagePriceReduction.change, '%')],
          ]
        ),
      },
      {
        heading: 'Release Schedule',
        content: [
          `- **Reporting Period**: ${snapshot.periodLabel}`,
          `- **Official Release Date**: ${releaseDate || 'N/A'}`,
          `- **Next Scheduled Release**: ${nextRelease ? `${nextRelease.label} (${nextRelease.date})` : 'N/A'}`,
          '- **Cadence**: Monthly at 10:00 AM Eastern per the official NAHB release calendar.',
        ].join('\n'),
      },
      {
        heading: 'Source',
        content: [
          `- **Official HMI Page**: ${HMI_URL}`,
          `- **Release Calendar**: ${RELEASE_DATES_URL}`,
          '- **Purpose**: Track builder sentiment as the cleanest public proxy for the unresolved Builder Confidence Index.',
          `- **Auto-pulled**: ${today()}`,
        ].join('\n'),
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Housing', dateStampedFilename('NAHB_Builder_Confidence'));
  writeNote(filePath, note);
  console.log(`Wrote ${filePath}`);

  return { filePath, signals };
}

async function getText(url) {
  const result = await fetchWithRetry(url);
  if (!result.ok) {
    throw new Error(`HTTP ${result.status} while fetching ${url}`);
  }
  return typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
}

function parseHmiSnapshot(html) {
  const text = htmlToText(html);
  const periodLabel = matchRequired(text, /HMI Key Findings:\s*([A-Za-z]+\s+\d{4})/i, 'Could not parse HMI period.');
  const keyFindingsBlock = extractKeyFindingsBlock(text, periodLabel);

  const headlineSentence = matchRequired(keyFindingsBlock, /(Builder confidence in the market for newly built single-family homes[^.]*\.)/i, 'Could not parse HMI headline sentence.');
  const currentSalesSentence = matchRequired(keyFindingsBlock, /(Current sales conditions[^.]*\.)/i, 'Could not parse current-sales component.');
  const expectationsSentence = matchRequired(keyFindingsBlock, /(Sales expectations in the next six months[^.]*\.)/i, 'Could not parse sales-expectations component.');
  const trafficSentence = matchRequired(keyFindingsBlock, /(Traffic of prospective buyers(?: of new single-family homes)?[^.]*\.)/i, 'Could not parse buyer-traffic component.');

  const priceCutsMatch = keyFindingsBlock.match(/(\d+)% of builders cut prices in [A-Za-z]+, .*? from (\d+)% in [A-Za-z]+/i);
  const averagePriceReductionMatch = keyFindingsBlock.match(/average price reduction .*? at (\d+)%/i);
  const salesIncentivesMatch = keyFindingsBlock.match(/use of sales incentives was (\d+)% in [A-Za-z]+, (?:down|up) (one|two|three|four|five|\d+) percentage point[s]? from [A-Za-z]+/i);

  return {
    periodLabel,
    hmi: parseMetricSentence(headlineSentence, periodLabel, true),
    currentSales: parseMetricSentence(currentSalesSentence, periodLabel, false),
    salesExpectations: parseMetricSentence(expectationsSentence, periodLabel, false),
    buyerTraffic: parseMetricSentence(trafficSentence, periodLabel, false),
    priceCuts: {
      latest: priceCutsMatch ? Number(priceCutsMatch[1]) : null,
      prior: priceCutsMatch ? Number(priceCutsMatch[2]) : null,
      change: priceCutsMatch ? Number(priceCutsMatch[1]) - Number(priceCutsMatch[2]) : null,
    },
    averagePriceReduction: {
      latest: averagePriceReductionMatch ? Number(averagePriceReductionMatch[1]) : null,
      prior: averagePriceReductionMatch ? Number(averagePriceReductionMatch[1]) : null,
      change: 0,
    },
    salesIncentives: parsePercentageMove(salesIncentivesMatch),
  };
}

function extractKeyFindingsBlock(text, periodLabel) {
  const startMarker = `HMI Key Findings: ${periodLabel}`;
  const startIndex = text.indexOf(startMarker);
  if (startIndex === -1) {
    return text;
  }

  const endCandidates = [
    text.indexOf(`${periodLabel} HMI and Historical Data`, startIndex),
    text.indexOf('Special Questions on Builder Challenges', startIndex),
    text.indexOf('Methodology of the HMI', startIndex),
  ].filter(index => index > startIndex);

  const endIndex = endCandidates.length > 0 ? Math.min(...endCandidates) : text.length;
  return text.slice(startIndex, endIndex);
}

function parseMetricSentence(sentence, periodLabel, expectPeriodSuffix) {
  const latest = Number(matchRequired(sentence, /(?:to|at)\s+(\d+)(?:\s+in\s+[A-Za-z]+)?/i, `Could not parse latest value from "${sentence}"`));
  const change = parseSentenceDelta(sentence);
  return {
    periodLabel,
    latest,
    prior: change == null ? null : latest - change,
    change,
    sentence,
    expectPeriodSuffix,
  };
}

function parseSentenceDelta(sentence) {
  if (/unchanged|held steady|flat/i.test(sentence)) return 0;

  const magnitudeMatch = sentence.match(/(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s*[- ]point/i);
  const magnitude = magnitudeMatch ? toNumber(magnitudeMatch[1]) : null;
  if (magnitude == null) return null;

  if (/\b(rose|gained|increased|inched up|posted a .*increase)\b/i.test(sentence)) {
    return magnitude;
  }
  if (/\b(fell|dropped|decreased|slipped|posted a .*decline)\b/i.test(sentence)) {
    return -magnitude;
  }
  return null;
}

function parsePercentageMove(match) {
  if (!match) {
    return { latest: null, prior: null, change: null };
  }

  const latest = Number(match[1]);
  const delta = toNumber(match[2]);
  const isDown = /\bdown\b/i.test(match[0]);
  const change = isDown ? -delta : delta;
  return {
    latest,
    prior: latest - change,
    change,
  };
}

function parseReleaseSchedule(html) {
  const text = htmlToText(html);
  const rows = [];
  const pattern = /(Jan\.|Feb\.|March|April|May|June|July|Aug\.|Sept\.|Oct\.|Nov\.|Dec\.)\s+(\d{4})\s+([A-Za-z]+,?\s+\d{1,2},\s+\d{4})/g;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const periodMonth = normalizeMonthToken(match[1]);
    const periodYear = match[2];
    const label = `${periodMonth} ${periodYear}`;
    const releaseDate = normalizeDate(match[3]);
    if (!releaseDate) continue;
    rows.push({ label, date: releaseDate });
  }

  return rows;
}

function resolveReleaseDate(periodLabel, scheduleRows) {
  return scheduleRows.find(row => row.label.toLowerCase() === String(periodLabel || '').toLowerCase())?.date || null;
}

function resolveNextRelease(scheduleRows) {
  const current = today();
  return scheduleRows.find(row => row.date > current) || null;
}

function buildSummaryRows(snapshot, releaseDate) {
  const latestDate = releaseDate || today();
  return [
    ['NAHB_HMI', 'Builder Confidence Index', latestDate, String(snapshot.hmi.latest), formatNumberValue(snapshot.hmi.prior), formatSignedNumber(snapshot.hmi.change)],
    ['NAHB_CURRENT_SALES', 'Builder Current Sales', latestDate, String(snapshot.currentSales.latest), formatNumberValue(snapshot.currentSales.prior), formatSignedNumber(snapshot.currentSales.change)],
    ['NAHB_EXPECTED_SALES', 'Builder Sales Expectations (6M)', latestDate, String(snapshot.salesExpectations.latest), formatNumberValue(snapshot.salesExpectations.prior), formatSignedNumber(snapshot.salesExpectations.change)],
    ['NAHB_BUYER_TRAFFIC', 'Builder Buyer Traffic', latestDate, String(snapshot.buyerTraffic.latest), formatNumberValue(snapshot.buyerTraffic.prior), formatSignedNumber(snapshot.buyerTraffic.change)],
  ];
}

function resolveSignalStatus(hmiValue) {
  if (hmiValue == null) return 'watch';
  if (hmiValue >= 50) return 'clear';
  if (hmiValue >= 35) return 'watch';
  if (hmiValue >= 25) return 'alert';
  return 'critical';
}

function buildSignals(snapshot, signalStatus) {
  const signals = [];

  if (snapshot.hmi.latest < 50) {
    signals.push('NAHB_HMI_BELOW_NEUTRAL');
  }
  if (snapshot.buyerTraffic.latest < 30) {
    signals.push('NAHB_BUYER_TRAFFIC_WEAK');
  }
  if ((snapshot.priceCuts.change || 0) > 0) {
    signals.push('NAHB_PRICE_CUT_SHARE_RISING');
  }
  if (signalStatus !== 'clear') {
    signals.push(`NAHB_${signalStatus.toUpperCase()}`);
  }

  return [...new Set(signals)];
}

function htmlToText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(br|\/p|\/div|\/section|\/article|\/li|\/tr|\/table|\/h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, '\'')
    .replace(/&#x27;/gi, '\'')
    .replace(/&mdash;|&ndash;/gi, '-')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function normalizeMonthToken(value) {
  const normalized = String(value || '').replace(/\./g, '').trim().toLowerCase();
  if (normalized === 'jan') return 'January';
  if (normalized === 'feb') return 'February';
  if (normalized === 'aug') return 'August';
  if (normalized === 'sept') return 'September';
  if (normalized === 'oct') return 'October';
  if (normalized === 'nov') return 'November';
  if (normalized === 'dec') return 'December';
  return value;
}

function normalizeDate(value) {
  const cleaned = String(value || '').replace(/\s+/g, ' ').replace(/,\s*,/g, ',').trim();
  const parsed = new Date(cleaned);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function toNumber(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (/^\d+$/.test(normalized)) return Number(normalized);
  return WORD_TO_NUMBER[normalized] ?? null;
}

function formatNumberValue(value) {
  return value == null ? 'N/A' : String(value);
}

function formatSignedNumber(value, suffix = '') {
  if (value == null || Number.isNaN(value)) return 'N/A';
  if (value === 0) return `0${suffix}`;
  return `${value > 0 ? '+' : ''}${value}${suffix}`;
}

function formatOptionalPercent(value) {
  return value == null ? 'N/A' : `${value}%`;
}

function matchRequired(text, pattern, errorMessage) {
  const match = String(text || '').match(pattern);
  if (!match) throw new Error(errorMessage);
  return match[1];
}
