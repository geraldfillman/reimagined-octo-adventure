/**
 * api-data-gov.mjs - shared api.data.gov agency starter puller.
 *
 * Usage:
 *   node run.mjs pull api-data-gov --agency all --dry-run
 *   node run.mjs pull api-data-gov --agency nasa --endpoint apod --limit 10
 *   node run.mjs pull api-data-gov --agency nrel --all-endpoints
 *   node run.mjs pull api-data-gov --list-agencies
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import {
  getApiKey,
  getEngineRoot,
  getPullsDir,
} from '../lib/config.mjs';
import { fetchWithRetry } from '../lib/fetcher.mjs';
import {
  getByPath,
  buildApiDataGovRequest,
  explainApiDataGovError,
  normalizeRecords,
} from '../lib/api-data-gov.mjs';
import {
  buildNote,
  buildTable,
  dateStampedFilename,
  today,
  writeNote,
} from '../lib/markdown.mjs';

const REGISTRY_PATH = join(getEngineRoot(), 'scripts', 'config', 'api-data-gov-agencies.json');

export function getAgencyRegistry() {
  return JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'));
}

export function shouldWriteArtifacts(flags = {}) {
  return !Boolean(flags['dry-run']);
}

export async function pull(flags = {}) {
  const registry = getAgencyRegistry();

  if (flags['list-agencies']) {
    const list = buildAgencyList(registry);
    if (flags.json) {
      console.log(JSON.stringify(registry.agencies, null, 2));
    } else {
      console.log(list);
    }
    return { filePath: null, signals: [] };
  }

  const runs = resolveAgencyRuns(flags, registry);

  if (!shouldWriteArtifacts(flags)) {
    const planned = runs.map(run => ({ ...run, ok: true, records: [], planned: true }));
    if (flags.json) {
      console.log(JSON.stringify(formatJsonResult(planned), null, 2));
    }
    const target = runs.length > 1 || (flags.agency || 'all') === 'all'
      ? join(getPullsDir(), 'Government', dateStampedFilename('API_Data_Gov_Agency_Starter_Pulls'))
      : join(getPullsDir(), runs[0].agency.domain, dateStampedFilename(`API_Data_Gov_${runs[0].agency.slug}_${runs[0].endpoint.slug}`));
    console.log(`[dry-run] Would run ${runs.length} api.data.gov endpoint(s) and write: ${target}`);
    for (const run of runs) {
      console.log(`  - ${run.agency.slug}/${run.endpoint.slug}: ${run.endpoint.url}`);
    }
    return { filePath: null, signals: [] };
  }

  const apiKey = getApiKey('datagov');
  const results = [];

  for (const run of runs) {
    const result = await runEndpoint(run, apiKey, flags);
    results.push(result);
  }

  if (flags.json) {
    console.log(JSON.stringify(formatJsonResult(results), null, 2));
  }

  if (runs.length > 1 || (flags.agency || 'all') === 'all') {
    const note = buildConsolidatedNote({ runs: results, registry });
    const filePath = join(getPullsDir(), 'Government', dateStampedFilename('API_Data_Gov_Agency_Starter_Pulls'));
    writeNote(filePath, note);
    console.log(`Wrote: ${filePath}`);
    return { filePath, signals: [] };
  }

  const [single] = results;
  const note = buildAgencyNote(single);
  const filePath = join(getPullsDir(), single.agency.domain, dateStampedFilename(`API_Data_Gov_${single.agency.slug}_${single.endpoint.slug}`));
  writeNote(filePath, note);
  console.log(`Wrote: ${filePath}`);
  return { filePath, signals: [] };
}

export function buildAgencyList(registry = getAgencyRegistry()) {
  const rows = registry.agencies.map(agency => [
    agency.slug,
    agency.name,
    agency.status,
    agency.existing_puller || '',
    agency.use_case,
    agency.example,
  ]);

  return [
    '# api.data.gov Agency Registry',
    '',
    buildTable(['Slug', 'Agency', 'Status', 'Existing Puller', 'Use Case', 'Example'], rows),
  ].join('\n');
}

export function resolveAgencyRuns(flags = {}, registry = getAgencyRegistry()) {
  const agencySelector = String(flags.agency || 'all').toLowerCase();
  const endpointSelector = flags.endpoint ? String(flags.endpoint).toLowerCase() : null;
  const allEndpoints = Boolean(flags['all-endpoints']);

  const agencies = agencySelector === 'all'
    ? registry.agencies
    : registry.agencies.filter(agency => agency.slug === agencySelector || agency.name.toLowerCase() === agencySelector);

  if (agencies.length === 0) {
    throw new Error(`Unknown api.data.gov agency "${agencySelector}". Run --list-agencies for available slugs.`);
  }

  const runs = [];
  for (const agency of agencies) {
    const readyEndpoints = (agency.endpoints || []).filter(endpoint => endpoint.status === 'starter-ready');
    const endpoints = endpointSelector
      ? readyEndpoints.filter(endpoint => endpoint.slug === endpointSelector)
      : allEndpoints
        ? readyEndpoints
        : readyEndpoints.slice(0, 1);

    if (endpointSelector && endpoints.length === 0) {
      throw new Error(`Agency "${agency.slug}" has no starter-ready endpoint "${endpointSelector}".`);
    }

    for (const endpoint of endpoints) {
      runs.push({ agency, endpoint });
    }
  }

  return runs;
}

async function runEndpoint(run, apiKey, flags = {}) {
  const { agency, endpoint } = run;
  const params = { ...(endpoint.default_params || {}) };
  if (flags.limit) {
    if ('limit' in params) params.limit = Number(flags.limit);
    if ('pageSize' in params) params.pageSize = Number(flags.limit);
    if (!('pageSize' in params) && 'per_page' in params) params.per_page = Number(flags.limit);
    if ('rows' in params) params.rows = Number(flags.limit);
    if ('count' in params) params.count = Number(flags.limit);
  }

  try {
    const data = endpoint.method === 'POST'
      ? await postEndpoint(endpoint, apiKey)
      : await getEndpoint(endpoint, apiKey, params);
    const records = normalizeRecords(data, endpoint);
    console.log(`${agency.slug}/${endpoint.slug}: ${records.length} records`);
    return { agency, endpoint, ok: true, records };
  } catch (error) {
    console.warn(`${agency.slug}/${endpoint.slug}: ${error.message}`);
    return { agency, endpoint, ok: false, records: [], error: error.message };
  }
}

async function getEndpoint(endpoint, apiKey, params) {
  const request = buildApiDataGovRequest({
    url: endpoint.url,
    apiKey,
    auth: endpoint.auth || 'header',
    params,
    keyParamName: endpoint.key_param_name || 'api_key',
  });
  const result = await fetchWithRetry(request.url, { headers: request.options.headers });
  if (!result.ok) {
    throw explainApiDataGovError({ status: result.status, data: result.data, url: request.url, apiKey });
  }
  return result.data;
}

async function postEndpoint(endpoint, apiKey) {
  const request = buildApiDataGovRequest({
    url: endpoint.url,
    apiKey,
    auth: endpoint.auth || 'none',
  });
  const result = await fetchWithRetry(request.url, {
    method: 'POST',
    headers: request.options.headers,
    body: endpoint.default_body || {},
  });
  if (!result.ok) {
    throw explainApiDataGovError({ status: result.status, data: result.data, url: request.url, apiKey });
  }
  return result.data;
}

export function buildConsolidatedNote({ runs, registry }) {
  const rows = runs.map(run => [
    run.agency.name,
    run.endpoint.name,
    run.ok ? 'ok' : 'error',
    String(run.records?.length ?? 0),
    run.agency.use_case,
    run.agency.example,
  ]);

  const sourceRows = runs.map(run => [
    run.agency.name,
    run.endpoint.url,
    run.endpoint.auth || 'header',
    run.agency.existing_puller || '',
  ]);

  return buildNote({
    frontmatter: {
      title: 'api.data.gov Agency Starter Pulls',
      source: 'api.data.gov',
      date_pulled: today(),
      domain: 'government',
      data_type: 'event_list',
      frequency: 'on-demand',
      signal_status: 'clear',
      signals: [],
      tags: ['api-data-gov', 'government', 'agency-registry'],
      agency_count: registry.agencies.length,
      starter_count: runs.length,
    },
    sections: [
      {
        heading: 'Agency Starter Results',
        content: buildTable(['Agency', 'Endpoint', 'Status', 'Records', 'Use Case', 'Example'], rows),
      },
      {
        heading: 'Agency Use Cases',
        content: registry.agencies.map(agency => `- **${agency.name}**: ${agency.use_case} Example: ${agency.example}`).join('\n'),
      },
      {
        heading: 'Sources',
        content: buildTable(['Agency', 'Endpoint URL', 'Auth', 'Existing Puller'], sourceRows),
      },
    ],
  });
}

function buildAgencyNote(run) {
  const rows = formatRows(run.records, run.endpoint);
  return buildNote({
    frontmatter: {
      title: `api.data.gov ${run.agency.name} - ${run.endpoint.name}`,
      source: 'api.data.gov',
      date_pulled: today(),
      domain: run.agency.domain.toLowerCase(),
      data_type: 'event_list',
      frequency: 'on-demand',
      signal_status: 'clear',
      signals: [],
      tags: ['api-data-gov', run.agency.slug, ...(run.agency.tags || [])],
      agency: run.agency.name,
      endpoint: run.endpoint.slug,
    },
    sections: [
      {
        heading: run.endpoint.name,
        content: buildTable(run.endpoint.columns.map(column => column.label), rows),
      },
      {
        heading: 'Research Use Case',
        content: `${run.agency.use_case}\n\nExample: ${run.agency.example}`,
      },
      {
        heading: 'Source',
        content: [
          `- **Agency**: ${run.agency.name}`,
          `- **Endpoint**: ${run.endpoint.url}`,
          `- **Records**: ${run.records.length}`,
          `- **Auth**: ${run.endpoint.auth || 'header'}`,
          `- **Auto-pulled**: ${today()}`,
        ].join('\n'),
      },
    ],
  });
}

function formatRows(records, endpoint) {
  return records.slice(0, 25).map(record =>
    endpoint.columns.map(column => formatCell(getByPath(record, column.path)))
  );
}

function formatCell(value) {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (Array.isArray(value)) return value.map(formatCell).join(', ');
  if (typeof value === 'object') return JSON.stringify(value).slice(0, 80);
  return String(value).slice(0, 120);
}

function formatJsonResult(results) {
  return {
    date_pulled: today(),
    results: results.map(result => ({
      agency: result.agency.slug,
      endpoint: result.endpoint.slug,
      ok: result.ok,
      records: result.records.length,
      error: result.error,
    })),
  };
}
