/**
 * macro-bridges.mjs - Pull a normalized set of cross-asset macro bridge indicators.
 *
 * This bridges thesis indicator labels that are not covered cleanly by the
 * default FRED housing/rates/labor/inflation groups.
 *
 * Usage:
 *   node run.mjs macro-bridges
 *   node run.mjs macro-bridges --core
 */

import { join } from 'path';
import { getApiKey, getBaseUrl, getPullsDir } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import { buildNote, buildTable, dateStampedFilename, formatNumber, today, writeNote } from '../lib/markdown.mjs';

const FRED_SERIES = Object.freeze([
  Object.freeze({
    indicator: 'US Debt/GDP',
    series: 'GFDEGDQ188S',
    name: 'Federal Debt to GDP',
    unitStyle: 'percent',
    changeStyle: 'delta',
    decimals: 1,
    folder: 'Macro',
    note: 'Official FRED debt-to-GDP series from OMB/St. Louis Fed.',
  }),
  Object.freeze({
    indicator: 'DXY Dollar Index',
    series: 'DTWEXBGS',
    name: 'Trade Weighted U.S. Dollar Index (DXY Proxy)',
    unitStyle: 'decimal',
    changeStyle: 'delta',
    decimals: 2,
    folder: 'Macro',
    note: 'Uses the broad trade-weighted dollar index as the local DXY proxy.',
  }),
  Object.freeze({
    indicator: 'Defense Budget',
    series: 'FDEFX',
    name: 'Federal Defense Spending Proxy',
    unitStyle: 'currency_billions',
    changeStyle: 'percent',
    decimals: 1,
    folder: 'Macro',
    note: 'Uses BEA/FRED national defense expenditures as the local defense-budget proxy.',
  }),
]);

const FMP_QUOTES = Object.freeze([
  Object.freeze({
    indicator: 'Gold Spot Price',
    series: 'XAUUSD',
    name: 'Gold Spot Price',
    unitStyle: 'currency',
    decimals: 2,
    folder: 'Macro',
    note: 'Pulled from FMP forex/commodity coverage.',
  }),
  Object.freeze({
    indicator: 'Bitcoin Price',
    series: 'BTCUSD',
    name: 'Bitcoin Price',
    unitStyle: 'currency',
    decimals: 2,
    folder: 'Macro',
    note: 'Pulled from FMP crypto coverage.',
  }),
]);

export async function pull(flags = {}) {
  if (flags.core || Object.keys(flags).length === 0) {
    return pullCoreIndicators();
  }

  throw new Error('Specify --core or run without flags.');
}

async function pullCoreIndicators() {
  console.log('Bridging unresolved macro indicators...');

  const fredApiKey = getApiKey('fred');
  const fredBaseUrl = getBaseUrl('fred');
  const fmpApiKey = getApiKey('fmp');
  const fmpStableBaseUrl = getBaseUrl('fmp').replace(/\/api\/v\d+$/, '/stable');

  const [fredRows, fmpRows] = await Promise.all([
    Promise.all(FRED_SERIES.map(series => fetchFredBridgeRow(series, fredApiKey, fredBaseUrl))),
    fetchFmpBridgeRows(fmpApiKey, fmpStableBaseUrl),
  ]);

  const rows = [...fredRows, ...fmpRows];

  const summaryRows = rows.map(row => [
    row.series,
    row.name,
    row.latestDate || 'N/A',
    row.latestValueDisplay || 'N/A',
    row.priorValueDisplay || 'N/A',
    row.changeDisplay || 'N/A',
  ]);

  const mappingRows = rows.map(row => [
    row.indicator,
    row.series,
    row.sourceFamily,
    row.note,
  ]);

  const note = buildNote({
    frontmatter: {
      title: 'Macro Bridge Indicators',
      source: 'Macro Bridge Puller',
      date_pulled: today(),
      domain: 'macro',
      data_type: 'time_series',
      frequency: 'varies',
      signal_status: 'clear',
      signals: [],
      tags: ['macro', 'bridges', 'cross-asset', 'thesis'],
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
        heading: 'Indicator Mapping',
        content: buildTable(
          ['Thesis Indicator', 'Series', 'Source Family', 'Notes'],
          mappingRows
        ),
      },
      {
        heading: 'Source',
        content: [
          '- **FRED Series**: GFDEGDQ188S, DTWEXBGS, FDEFX',
          '- **FMP Symbols**: XAUUSD, BTCUSD',
          '- **Purpose**: Fill core thesis macro gaps that are not covered by the default grouped pulls.',
          `- **Auto-pulled**: ${today()}`,
        ].join('\n'),
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Macro', dateStampedFilename('Macro_Bridge_Indicators'));
  writeNote(filePath, note);
  console.log(`Wrote ${filePath}`);

  return { filePath, signals: [] };
}

async function fetchFredBridgeRow(config, apiKey, baseUrl) {
  console.log(`  FRED: ${config.series} (${config.indicator})`);
  const data = await getJson(
    `${baseUrl}/series/observations?series_id=${config.series}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=4`
  );

  const observations = (data.observations || [])
    .filter(observation => observation?.value !== '.')
    .map(observation => ({
      date: observation.date,
      value: Number(observation.value),
    }))
    .filter(observation => Number.isFinite(observation.value));

  const latest = observations[0] || null;
  const prior = observations[1] || null;

  return {
    indicator: config.indicator,
    series: config.series,
    name: config.name,
    latestDate: latest?.date || null,
    latestValueDisplay: formatBridgeValue(latest?.value, config.unitStyle, config.decimals),
    priorValueDisplay: formatBridgeValue(prior?.value, config.unitStyle, config.decimals),
    changeDisplay: formatBridgeChange(latest?.value, prior?.value, config.changeStyle, config.decimals),
    sourceFamily: 'FRED',
    note: config.note,
  };
}

async function fetchFmpBridgeRows(apiKey, stableBaseUrl) {
  const symbols = FMP_QUOTES.map(entry => entry.series);
  console.log(`  FMP: ${symbols.join(', ')}`);
  const data = await getJson(`${stableBaseUrl}/batch-quote-short?symbols=${symbols.join(',')}&apikey=${apiKey}`);
  const quotes = Array.isArray(data) ? data : [];

  return FMP_QUOTES.map(config => {
    const quote = quotes.find(entry => String(entry.symbol || '').toUpperCase() === config.series) || {};
    const latestValue = normalizeNumber(quote.price);
    const absoluteChange = normalizeNumber(quote.change);
    const priorValue = latestValue != null && absoluteChange != null
      ? latestValue - absoluteChange
      : null;

    return {
      indicator: config.indicator,
      series: config.series,
      name: config.name,
      latestDate: today(),
      latestValueDisplay: formatBridgeValue(latestValue, config.unitStyle, config.decimals),
      priorValueDisplay: formatBridgeValue(priorValue, config.unitStyle, config.decimals),
      changeDisplay: absoluteChange != null ? formatSignedNumber(absoluteChange, config.decimals, true) : 'N/A',
      sourceFamily: 'FMP',
      note: config.note,
    };
  });
}

function formatBridgeValue(value, style, decimals) {
  if (value == null) return 'N/A';

  if (style === 'percent') {
    return formatNumber(value, { style: 'percent', decimals });
  }

  if (style === 'currency_billions') {
    return `$${value.toFixed(decimals)}B`;
  }

  if (style === 'currency') {
    return formatCurrency(value, decimals);
  }

  return formatNumber(value, { style: 'decimal', decimals });
}

function formatBridgeChange(latestValue, priorValue, style, decimals) {
  if (latestValue == null || priorValue == null) return 'N/A';

  if (style === 'percent') {
    if (priorValue === 0) return 'N/A';
    const pctChange = ((latestValue - priorValue) / priorValue) * 100;
    return formatSignedNumber(pctChange, 1, false) + '%';
  }

  const change = latestValue - priorValue;
  if (style === 'delta') {
    return formatSignedNumber(change, decimals, false);
  }

  return formatSignedNumber(change, decimals, false);
}

function formatSignedNumber(value, decimals, currencyStyle) {
  if (value == null || Number.isNaN(value)) return 'N/A';
  const abs = Math.abs(value);
  const prefix = value >= 0 ? '+' : '-';
  if (currencyStyle) {
    return `${prefix}${formatCurrency(abs, decimals)}`;
  }
  return `${prefix}${abs.toFixed(decimals)}`;
}

function normalizeNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function formatCurrency(value, decimals) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return formatter.format(value);
}
