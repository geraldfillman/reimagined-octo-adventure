import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { getEngineCacheDir, getPullsDir } from '../lib/config.mjs';
import { fetchWithRetry } from '../lib/fetcher.mjs';
import { buildNote, buildTable, today, writeNote } from '../lib/markdown.mjs';
import { manualRequired } from '../lib/positioning-provenance.mjs';

const CACHE_DIR = getEngineCacheDir('institutional-positioning', 'finra');
const FINRA_BASE_URL = 'https://api.finra.org';
const FINRA_TOKEN_URL = 'https://ews.fip.finra.org/fip/rest/ews/oauth2/access_token?grant_type=client_credentials';
const DEFAULT_LIMIT = 25;

export const FINRA_DATASETS = Object.freeze({
  'short-interest': Object.freeze({
    slug: 'short-interest',
    name: 'Consolidated Short Interest',
    group: 'otcMarket',
    dataset: 'consolidatedShortInterest',
    symbolField: 'symbolCode',
    dateField: 'settlementDate',
    fields: [
      'settlementDate',
      'symbolCode',
      'issueName',
      'currentShortPositionQuantity',
      'previousShortPositionQuantity',
      'changePreviousNumber',
      'changePercent',
      'averageDailyVolumeQuantity',
      'daysToCoverQuantity',
      'marketClassCode',
    ],
    limitations: ['Short interest is reported twice monthly and is not daily short-sale flow.'],
  }),
  'short-sale-volume': Object.freeze({
    slug: 'short-sale-volume',
    name: 'Reg SHO Daily Short Sale Volume',
    group: 'otcMarket',
    dataset: 'regShoDaily',
    symbolField: 'securitiesInformationProcessorSymbolIdentifier',
    dateField: 'tradeReportDate',
    fields: [
      'tradeReportDate',
      'securitiesInformationProcessorSymbolIdentifier',
      'shortParQuantity',
      'shortExemptParQuantity',
      'totalParQuantity',
      'marketCode',
    ],
    limitations: ['Daily short-sale volume is a flow proxy and is not equivalent to short interest.'],
  }),
  'threshold-list': Object.freeze({
    slug: 'threshold-list',
    name: 'Threshold List',
    group: 'otcMarket',
    dataset: 'thresholdList',
    symbolField: 'issueSymbolIdentifier',
    dateField: 'tradeDate',
    fields: [
      'tradeDate',
      'issueSymbolIdentifier',
      'issueName',
      'marketClassCode',
      'thresholdListFlag',
      'regShoThresholdFlag',
    ],
    defaultFilters: [
      { compareType: 'equal', fieldName: 'regShoThresholdFlag', fieldValue: 'Y' },
    ],
    limitations: ['Threshold-list inclusion is a settlement-stress flag, not a directional trade signal.'],
  }),
  'otc-weekly': Object.freeze({
    slug: 'otc-weekly',
    name: 'OTC Weekly Summary',
    group: 'otcMarket',
    dataset: 'weeklySummary',
    symbolField: 'issueSymbolIdentifier',
    dateField: 'weekStartDate',
    fields: [
      'weekStartDate',
      'issueSymbolIdentifier',
      'issueName',
      'totalWeeklyShareQuantity',
      'totalWeeklyTradeCount',
      'tierIdentifier',
      'summaryTypeCode',
      'lastUpdateDate',
    ],
    defaultFilters: [
      { compareType: 'equal', fieldName: 'summaryTypeCode', fieldValue: 'OTC_W_SMBL' },
    ],
    limitations: ['OTC weekly data does not identify buyer or seller direction.'],
  }),
});

export async function pull(flags = {}) {
  const date = String(flags.date || today()).slice(0, 10);
  const descriptors = resolveDatasetDescriptors(flags);
  const credentials = getFinraCredentials();

  if (!credentials) {
    const payload = buildSetupRequiredPayload({ date, descriptors });
    if (flags['dry-run']) {
      console.log(JSON.stringify(payload, null, 2));
    } else {
      writeSidecar(date, payload);
    }
    if (flags.json) console.log(JSON.stringify({ date, status: payload.status }, null, 2));
    return payload;
  }

  if (flags['dry-run']) {
    const payload = buildDryRunPayload({ date, descriptors, flags });
    console.log(JSON.stringify(payload, null, 2));
    if (flags.json) console.log(JSON.stringify({ date, status: payload.status, datasets: payload.datasets.map(d => d.slug) }, null, 2));
    return payload;
  }

  const payload = await runFinraPull({ date, descriptors, flags, credentials });
  const sidecarPath = writeSidecar(date, payload);
  const note = buildFinraPositioningNote({ date, datasets: payload.datasets, warnings: payload.warnings });
  const filePath = join(getPullsDir(), 'Positioning', `${date}_FINRA_Positioning.md`);
  writeNote(filePath, note);
  console.log(`Wrote: ${sidecarPath}`);
  console.log(`Wrote: ${filePath}`);

  if (flags.json) {
    console.log(JSON.stringify({
      date,
      status: payload.status,
      sidecarPath,
      filePath,
      datasets: payload.datasets.map(dataset => ({
        slug: dataset.slug,
        ok: dataset.ok,
        records: dataset.records.length,
        error: dataset.error,
      })),
    }, null, 2));
  }
  return payload;
}

export function shouldWriteArtifacts(flags = {}) {
  return !Boolean(flags['dry-run']);
}

export function resolveDatasetDescriptors(flags = {}) {
  const selector = String(flags.datasets || flags.dataset || 'all').toLowerCase();
  const slugs = selector === 'all'
    ? Object.keys(FINRA_DATASETS)
    : selector.split(',').map(value => value.trim()).filter(Boolean);

  return slugs.map(slug => {
    const descriptor = FINRA_DATASETS[slug];
    if (!descriptor) {
      throw new Error(`Unknown FINRA dataset "${slug}". Valid: all, ${Object.keys(FINRA_DATASETS).join(', ')}`);
    }
    return descriptor;
  });
}

export function buildFinraQueryRequest({
  descriptor,
  token,
  limit = DEFAULT_LIMIT,
  symbols = [],
  date = null,
} = {}) {
  if (!descriptor) throw new Error('FINRA descriptor is required.');
  if (!token) throw new Error('FINRA bearer token is required.');

  const compareFilters = [
    ...(descriptor.defaultFilters || []),
    ...buildSymbolFilters(descriptor, symbols),
    ...buildDateFilters(descriptor, date),
  ];
  const body = {
    limit: Number(limit || DEFAULT_LIMIT),
    fields: [...descriptor.fields],
  };
  if (compareFilters.length) body.compareFilters = compareFilters;

  return {
    url: `${FINRA_BASE_URL}/data/group/${descriptor.group}/name/${descriptor.dataset}`,
    options: {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  };
}

export function redactFinraSecrets(message, {
  clientId = process.env.FINRA_CLIENT_ID,
  clientSecret = process.env.FINRA_CLIENT_SECRET,
  token = '',
  basicToken = '',
} = {}) {
  let redacted = String(message ?? '');
  for (const secret of [clientId, clientSecret, token, basicToken].filter(Boolean)) {
    redacted = redacted.split(secret).join('REDACTED');
  }
  redacted = redacted
    .replace(/Authorization:\s*Bearer\s+[^\s,}]+/gi, 'Authorization: Bearer REDACTED')
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/g, 'Bearer REDACTED')
    .replace(/Basic\s+[A-Za-z0-9._~+/=-]+/g, 'Basic REDACTED');
  return redacted;
}

export function buildSetupRequiredPayload({ date = today(), descriptors = Object.values(FINRA_DATASETS) } = {}) {
  return {
    schema_version: 2,
    date,
    source: 'FINRA public positioning datasets',
    status: 'manual/API setup required',
    datasets: descriptors.map(descriptor => ({
      slug: descriptor.slug,
      name: descriptor.name,
      group: descriptor.group,
      dataset: descriptor.dataset,
      ok: false,
      records: [],
      status: 'manual/API setup required',
    })),
    shortSaleVolume: {},
    shortInterest: {},
    thresholdList: [],
    otcTransparency: [],
    availability: [
      manualRequired('FINRA Query API', 'Set FINRA_CLIENT_ID and FINRA_CLIENT_SECRET before querying public FINRA datasets.'),
    ],
    warnings: ['FINRA credentials are missing; live datasets were not queried.'],
  };
}

export function buildFinraPositioningNote({
  date = today(),
  datasets = [],
  warnings = [],
} = {}) {
  const anyErrors = datasets.some(dataset => !dataset.ok);
  const rows = datasets.map(dataset => [
    dataset.name,
    dataset.ok ? 'ok' : 'error',
    String(dataset.records?.length ?? 0),
    dataset.group || '',
    dataset.dataset || '',
    dataset.error || '',
  ]);
  const sampleSections = datasets.map(dataset => ({
    heading: dataset.name,
    content: formatDatasetRows(dataset),
  }));

  return buildNote({
    frontmatter: {
      title: `FINRA Positioning ${date}`,
      source: 'FINRA Query API',
      date_pulled: date,
      domain: 'positioning',
      data_type: 'finra_positioning',
      frequency: 'daily/weekly/twice-monthly',
      signal_status: anyErrors ? 'watch' : 'clear',
      signals: datasets.map(dataset => dataset.slug),
      tags: ['finra', 'positioning', 'short-interest', 'short-sale-volume', 'otc', 'market-structure'],
    },
    sections: [
      {
        heading: 'Dataset Results',
        content: rows.length
          ? buildTable(['Dataset', 'Status', 'Records', 'Group', 'FINRA Dataset', 'Error'], rows)
          : '_No FINRA datasets selected._',
      },
      ...sampleSections,
      {
        heading: 'Interpretation Limits',
        content: [
          '- Daily short-sale volume is a flow proxy, not short interest.',
          '- OTC transparency data does not identify buyer or seller direction.',
          '- Threshold-list inclusion is a settlement-stress flag and requires independent confirmation.',
          '- Treat this pull as observed source evidence, not an active-position or trade recommendation.',
        ].join('\n'),
      },
      {
        heading: 'Warnings',
        content: warnings.length ? warnings.map(warning => `- ${warning}`).join('\n') : '- No warnings.',
      },
      {
        heading: 'Source',
        content: [
          '- **API**: FINRA Query API',
          '- **Base URL**: https://api.finra.org',
          `- **Auto-pulled**: ${date}`,
        ].join('\n'),
      },
    ],
  });
}

function getFinraCredentials() {
  const clientId = process.env.FINRA_CLIENT_ID?.trim();
  const clientSecret = process.env.FINRA_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

function parseSymbols(value) {
  if (Array.isArray(value)) return value.map(item => String(item).trim().toUpperCase()).filter(Boolean);
  return [...new Set(String(value || '').split(',').map(item => item.trim().toUpperCase()).filter(Boolean))];
}

function buildSymbolFilters(descriptor, symbols) {
  const normalized = parseSymbols(symbols);
  if (!normalized.length || !descriptor.symbolField) return [];
  return normalized.map(symbol => ({
    compareType: 'equal',
    fieldName: descriptor.symbolField,
    fieldValue: symbol,
  }));
}

function buildDateFilters(descriptor, date) {
  if (!date || !descriptor.dateField) return [];
  return [{
    compareType: 'equal',
    fieldName: descriptor.dateField,
    fieldValue: String(date).slice(0, 10),
  }];
}

function buildDryRunPayload({ date, descriptors, flags }) {
  return {
    schema_version: 2,
    date,
    source: 'FINRA public positioning datasets',
    status: 'dry-run',
    datasets: descriptors.map(descriptor => ({
      slug: descriptor.slug,
      name: descriptor.name,
      group: descriptor.group,
      dataset: descriptor.dataset,
      planned_request: buildDryRunRequestSummary({ descriptor, flags }),
      records: [],
      ok: true,
    })),
    availability: [
      { source: 'FINRA Query API', status: 'configured/dry-run', notes: 'Credentials are present; dry-run does not query FINRA or write artifacts.' },
    ],
    warnings: [],
  };
}

function buildDryRunRequestSummary({ descriptor, flags }) {
  const request = buildFinraQueryRequest({
    descriptor,
    token: 'DRY_RUN_TOKEN',
    limit: flags.limit || DEFAULT_LIMIT,
    symbols: parseSymbols(flags.symbols),
    date: flags.date,
  });
  return {
    url: request.url,
    body: JSON.parse(request.options.body),
  };
}

async function runFinraPull({ date, descriptors, flags, credentials }) {
  const tokenPayload = await fetchFinraAccessToken(credentials);
  const token = tokenPayload.access_token;
  const datasets = [];
  const warnings = [];

  for (const descriptor of descriptors) {
    try {
      const request = buildFinraQueryRequest({
        descriptor,
        token,
        limit: flags.limit || DEFAULT_LIMIT,
        symbols: parseSymbols(flags.symbols),
        date: flags.date,
      });
      const result = await fetchWithRetry(request.url, {
        ...request.options,
        body: request.options.body,
      });
      if (!result.ok) {
        throw new Error(`FINRA ${descriptor.slug} HTTP ${result.status}: ${formatErrorData(result.data)}`);
      }
      const records = normalizeRecords(result.data);
      datasets.push({
        slug: descriptor.slug,
        name: descriptor.name,
        group: descriptor.group,
        dataset: descriptor.dataset,
        ok: true,
        records,
        record_count: records.length,
        as_of_date: inferLatestDate(records, descriptor.dateField) || date,
      });
    } catch (error) {
      const message = redactFinraSecrets(error.message, { ...credentials, token });
      warnings.push(`${descriptor.name}: ${message}`);
      datasets.push({
        slug: descriptor.slug,
        name: descriptor.name,
        group: descriptor.group,
        dataset: descriptor.dataset,
        ok: false,
        records: [],
        record_count: 0,
        error: message,
      });
    }
  }

  return {
    schema_version: 2,
    date,
    source: 'FINRA public positioning datasets',
    status: datasets.some(dataset => !dataset.ok) ? 'partial/error' : 'ok',
    datasets,
    availability: [
      { source: 'FINRA Query API', status: 'queried', notes: 'FINRA Query API was queried with configured credentials.' },
    ],
    warnings,
  };
}

async function fetchFinraAccessToken({ clientId, clientSecret }) {
  const basicToken = Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64');
  const result = await fetchWithRetry(FINRA_TOKEN_URL, {
    method: 'POST',
    headers: { Authorization: `Basic ${basicToken}`, Accept: 'application/json' },
    retries: 2,
  });
  if (!result.ok || !result.data?.access_token) {
    const message = `FINRA auth failed HTTP ${result.status}: ${formatErrorData(result.data)}`;
    throw new Error(redactFinraSecrets(message, { clientId, clientSecret, basicToken }));
  }
  return result.data;
}

function normalizeRecords(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  if (data && typeof data === 'object') return [data];
  return [];
}

function inferLatestDate(records, fieldName) {
  if (!fieldName) return null;
  return records
    .map(record => record?.[fieldName])
    .filter(Boolean)
    .sort()
    .at(-1) || null;
}

function formatDatasetRows(dataset) {
  const records = dataset.records || [];
  if (!dataset.ok) return `Error: ${dataset.error || 'Unknown FINRA dataset error.'}`;
  if (!records.length) return '_No records returned._';
  const columns = Object.keys(records[0]).slice(0, 8);
  return buildTable(columns, records.slice(0, 15).map(record => columns.map(column => formatCell(record[column]))));
}

function formatCell(value) {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (Array.isArray(value)) return value.map(formatCell).join(', ');
  if (typeof value === 'object') return JSON.stringify(value).slice(0, 120);
  return String(value).slice(0, 120);
}

function formatErrorData(data) {
  if (typeof data === 'string') return data.slice(0, 300);
  try {
    return JSON.stringify(data).slice(0, 300);
  } catch {
    return String(data).slice(0, 300);
  }
}

function writeSidecar(date, payload) {
  mkdirSync(CACHE_DIR, { recursive: true });
  const outPath = join(CACHE_DIR, `${date}.json`);
  writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');
  return outPath;
}
