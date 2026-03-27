/**
 * socrata.mjs — Socrata Open Data (SODA) puller
 *
 * Pulls data from city/county open data portals powered by Socrata.
 * Uses X-App-Token header for higher rate limits.
 *
 * Usage:
 *   node run.mjs socrata --permits        # NYC building permits (recent)
 *   node run.mjs socrata --311            # NYC 311 service requests
 *   node run.mjs socrata --custom <url>   # Any Socrata dataset URL
 */

import { join } from 'path';
import { getApiKey, getPullsDir } from '../lib/config.mjs';
import { fetchWithRetry } from '../lib/fetcher.mjs';
import { buildNote, buildTable, writeNote, today, dateStampedFilename } from '../lib/markdown.mjs';

// Known Socrata dataset endpoints (city : dataset ID)
const DATASETS = {
  permits: {
    name: 'NYC DOB Job Applications',
    host: 'data.cityofnewyork.us',
    id: 'ic3t-wcy2',
    domain: 'Housing',
    description: 'NYC Dept of Buildings job applications — new buildings, alterations, demolitions',
    columns: ['job__', 'borough', 'house__', 'street_name', 'job_type', 'pre__filing_date'],
    orderBy: 'pre__filing_date DESC',
  },
  '311': {
    name: 'NYC 311 Service Requests',
    host: 'data.cityofnewyork.us',
    id: 'erm2-nwe9',
    domain: 'Government',
    description: 'NYC 311 service requests including noise, housing, and infrastructure complaints',
    columns: ['created_date', 'complaint_type', 'descriptor', 'borough', 'status', 'agency'],
    orderBy: 'created_date DESC',
  },
  'chi-permits': {
    name: 'Chicago Building Permits',
    host: 'data.cityofchicago.org',
    id: 'ydr8-5enu',
    domain: 'Housing',
    description: 'Building permits issued in Chicago',
    columns: ['issue_date', 'permit_type', 'work_description', 'total_fee', 'street_number', 'street_direction'],
    orderBy: 'issue_date DESC',
  },
};

export async function pull(flags = {}) {
  // Socrata works without a token (just throttled), so gracefully handle missing/invalid tokens
  let appToken = null;
  try {
    appToken = getApiKey('socrata');
  } catch {
    console.log('  ⚠️ No valid Socrata app token — using unauthenticated mode (lower rate limits)');
  }

  if (flags.permits) {
    await pullDataset('permits', appToken, flags);
  } else if (flags['311']) {
    await pullDataset('311', appToken, flags);
  } else if (flags['chi-permits']) {
    await pullDataset('chi-permits', appToken, flags);
  } else if (flags.custom) {
    await pullCustom(flags.custom, appToken, flags);
  } else {
    // Default to NYC permits
    await pullDataset('permits', appToken, flags);
  }
}

async function pullDataset(datasetKey, appToken, flags) {
  const ds = DATASETS[datasetKey];
  if (!ds) throw new Error(`Unknown dataset: ${datasetKey}. Available: ${Object.keys(DATASETS).join(', ')}`);

  const limit = parseInt(flags.limit) || 20;
  console.log(`🏙️ Socrata: Fetching ${ds.name}...`);

  const selectClause = ds.columns.join(',');
  const url = `https://${ds.host}/resource/${ds.id}.json?$order=${encodeURIComponent(ds.orderBy)}&$limit=${limit}&$select=${selectClause}`;

  const reqHeaders = appToken ? { 'X-App-Token': appToken } : {};
  let result = await fetchWithRetry(url, { headers: reqHeaders });

  // If token rejected, retry without it (unauthenticated is fine, just throttled)
  if (result.status === 403 && appToken) {
    console.log('  ⚠️ Token rejected — retrying without token...');
    result = await fetchWithRetry(url, { headers: {} });
  }
  if (!result.ok) {
    throw new Error(`Socrata API error ${result.status}: ${JSON.stringify(result.data).slice(0, 200)}`);
  }

  const records = Array.isArray(result.data) ? result.data : [];
  console.log(`  ${records.length} records retrieved`);

  records.slice(0, 5).forEach(r => {
    const vals = ds.columns.slice(0, 3).map(c => {
      const v = r[c];
      return typeof v === 'string' ? v.slice(0, 30) : v;
    });
    console.log(`    ${vals.join(' | ')}`);
  });

  const headers = ds.columns.map(c => c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
  const rows = records.map(r =>
    ds.columns.map(c => {
      const v = r[c];
      if (!v) return 'N/A';
      if (typeof v === 'string' && v.length > 50) return v.slice(0, 50) + '...';
      return String(v);
    })
  );

  const note = buildNote({
    frontmatter: {
      title: `${ds.name} — Socrata Pull`,
      source: 'Socrata Open Data',
      dataset_id: ds.id,
      host: ds.host,
      date_pulled: today(),
      domain: ds.domain.toLowerCase(),
      data_type: 'event_list',
      frequency: 'on-demand',
      signal_status: 'clear',
      signals: [],
      tags: ['socrata', 'open-data', datasetKey, ds.domain.toLowerCase()],
    },
    sections: [
      {
        heading: ds.name,
        content: `${ds.description}\n\n${buildTable(headers, rows)}`,
      },
      {
        heading: 'Source',
        content: [
          `- **API**: Socrata SODA (${ds.host})`,
          `- **Dataset**: ${ds.id}`,
          `- **Records**: ${records.length}`,
          `- **Auth**: App Token (X-App-Token header)`,
          `- **Auto-pulled**: ${today()}`,
        ].join('\n'),
      },
    ],
  });

  const filePath = join(getPullsDir(), ds.domain, dateStampedFilename(`Socrata_${datasetKey}`));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals: [] };
}

async function pullCustom(urlOrId, appToken, flags) {
  const limit = parseInt(flags.limit) || 20;

  // Parse either a full URL or just a dataset ID
  let url;
  if (urlOrId.startsWith('http')) {
    url = urlOrId.includes('.json') ? urlOrId : `${urlOrId}.json?$limit=${limit}`;
  } else {
    // Assume NYC by default for bare dataset IDs
    url = `https://data.cityofnewyork.us/resource/${urlOrId}.json?$limit=${limit}`;
  }

  console.log(`🏙️ Socrata: Fetching custom dataset...`);
  console.log(`  URL: ${url}`);

  const reqHeaders = appToken ? { 'X-App-Token': appToken } : {};
  let result = await fetchWithRetry(url, { headers: reqHeaders });

  if (result.status === 403 && appToken) {
    console.log('  ⚠️ Token rejected — retrying without token...');
    result = await fetchWithRetry(url, { headers: {} });
  }
  if (!result.ok) {
    throw new Error(`Socrata API error ${result.status}: ${JSON.stringify(result.data).slice(0, 200)}`);
  }

  const records = Array.isArray(result.data) ? result.data : [];
  console.log(`  ${records.length} records retrieved`);

  if (records.length === 0) {
    console.log('  No records returned.');
    return { filePath: null, signals: [] };
  }

  // Auto-detect columns from first record
  const columns = Object.keys(records[0]).slice(0, 8);
  const headers = columns.map(c => c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
  const rows = records.map(r =>
    columns.map(c => {
      const v = r[c];
      if (!v) return 'N/A';
      if (typeof v === 'string' && v.length > 50) return v.slice(0, 50) + '...';
      return String(v);
    })
  );

  records.slice(0, 3).forEach(r => {
    console.log(`    ${columns.slice(0, 3).map(c => String(r[c] || '').slice(0, 30)).join(' | ')}`);
  });

  const note = buildNote({
    frontmatter: {
      title: 'Socrata Custom Dataset Pull',
      source: 'Socrata Open Data',
      date_pulled: today(),
      domain: 'government',
      data_type: 'event_list',
      frequency: 'on-demand',
      signal_status: 'clear',
      signals: [],
      tags: ['socrata', 'open-data', 'custom'],
    },
    sections: [
      { heading: 'Dataset', content: buildTable(headers, rows) },
      { heading: 'Source', content: `- **URL**: ${url}\n- **Records**: ${records.length}\n- **Auto-pulled**: ${today()}` },
    ],
  });

  const filePath = join(getPullsDir(), 'Government', dateStampedFilename('Socrata_Custom'));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals: [] };
}
