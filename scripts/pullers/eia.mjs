/**
 * eia.mjs — EIA API puller
 *
 * Pulls US energy data from the Energy Information Administration API v2.
 * Tracks electricity demand, generation mix, and regional grid load.
 * Critical for detecting AI/data center power constraints.
 *
 * Usage:
 *   node run.mjs eia --electricity-demand
 *   node run.mjs eia --generation-mix
 *   node run.mjs eia --regional-load
 *   node run.mjs eia --all
 */

import { join } from 'path';
import { getApiKey, getBaseUrl, getPullsDir, getSignalsDir } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import {
  buildNote, buildTable, writeNote, formatNumber,
  today, dateStampedFilename,
} from '../lib/markdown.mjs';
import { setProperties } from '../lib/obsidian-cli.mjs';
import {
  evaluateElectricityDemandGrowth, evaluateGenerationGap, evaluateRegionalLoadSpike,
  highestSeverity, formatSignalsSection,
} from '../lib/signals.mjs';

/** EIA data groups — each answers an investment question */
const DATA_GROUPS = Object.freeze({
  'electricity-demand': Object.freeze({
    name: 'Electricity Demand',
    domain: 'Energy',
    question: 'Is electricity demand growing and where?',
    route: '/electricity/retail-sales/data/',
    params: Object.freeze({
      frequency: 'monthly',
      'data[0]': 'revenue',
      'data[1]': 'sales',
      'sort[0][column]': 'period',
      'sort[0][direction]': 'desc',
      length: 24,
    }),
  }),
  'generation-mix': Object.freeze({
    name: 'Generation Mix',
    domain: 'Energy',
    question: 'What is the US generating power from?',
    route: '/electricity/electric-power-operational-data/data/',
    params: Object.freeze({
      frequency: 'monthly',
      'data[0]': 'generation',
      'facets[fueltypeid][]': Object.freeze(['ALL', 'NG', 'NUC', 'SUN', 'WND', 'COL']),
      'sort[0][column]': 'period',
      'sort[0][direction]': 'desc',
      length: 12,
    }),
  }),
  'regional-load': Object.freeze({
    name: 'Regional Grid Load',
    domain: 'Energy',
    question: 'Which regions are under load stress?',
    route: '/electricity/rto/daily-region-data/data/',
    params: Object.freeze({
      frequency: 'daily',
      'data[0]': 'value',
      'facets[type][]': 'D',
      'sort[0][column]': 'period',
      'sort[0][direction]': 'desc',
      length: 30,
    }),
  }),
});

/**
 * Build a query string from params, handling array values by repeating the key.
 * @param {object} params
 * @param {string} apiKey
 * @returns {string}
 */
function buildQueryString(params, apiKey) {
  const parts = [];

  for (const [key, val] of Object.entries(params)) {
    if (Array.isArray(val)) {
      for (const item of val) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
      }
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
    }
  }

  parts.push(`api_key=${encodeURIComponent(apiKey)}`);
  return parts.join('&');
}

/**
 * Main pull function.
 * @param {object} flags — CLI flags
 */
export async function pull(flags = {}) {
  const apiKey = getApiKey('eia');
  const baseUrl = getBaseUrl('eia');

  // Determine which groups to pull
  let groupKeys = [];
  if (flags.all) {
    groupKeys = Object.keys(DATA_GROUPS);
  } else {
    for (const key of Object.keys(DATA_GROUPS)) {
      if (flags[key]) groupKeys.push(key);
    }
  }

  if (groupKeys.length === 0) {
    throw new Error(
      'Specify a data group flag: --electricity-demand, --generation-mix, --regional-load, or --all'
    );
  }

  const results = [];

  for (const groupKey of groupKeys) {
    const group = DATA_GROUPS[groupKey];
    console.log(`⚡ EIA: Pulling ${group.name}`);
    console.log(`   Question: ${group.question}\n`);

    const qs = buildQueryString(group.params, apiKey);
    const url = `${baseUrl}${group.route}?${qs}`;

    let records = [];
    try {
      const data = await getJson(url);
      records = (data?.response?.data || []).map(item => Object.freeze({ ...item }));
      console.log(`   Received ${records.length} records`);
      if (records[0]) {
        console.log(`   Latest period: ${records[0].period}`);
      }
    } catch (err) {
      console.warn(`   Warning: Failed to fetch ${group.name}: ${err.message}`);
    }

    // Evaluate signals for this group
    const signals = evaluateGroupSignals(groupKey, records);

    if (signals.length > 0) {
      console.log(`\n⚡ ${signals.length} signal(s) fired:`);
      for (const s of signals) {
        const icon = { critical: '🔴', alert: '🟠', watch: '🟡' }[s.severity];
        console.log(`  ${icon} ${s.name}: ${s.message}`);
      }
    } else {
      console.log(`\n⚪ No signals — all clear.`);
    }

    // Build table rows from records
    const { tableHeaders, tableRows } = buildTableData(groupKey, records);

    const signalStatus = highestSeverity(signals);
    const signalsForFrontmatter = signals.map(s => Object.freeze({
      id: s.id,
      severity: s.severity,
      value: s.value,
      threshold: s.threshold,
      message: s.message,
    }));

    const noteName = `EIA_${group.name.replace(/\s+/g, '_')}`;

    const note = buildNote({
      frontmatter: {
        title: `EIA ${group.name} Pull`,
        source: 'EIA API v2',
        date_pulled: today(),
        domain: group.domain.toLowerCase(),
        data_type: 'time_series',
        frequency: group.params.frequency,
        signal_status: signalStatus,
        signals: signalsForFrontmatter,
        tags: ['eia', groupKey, group.domain.toLowerCase(), 'energy'],
        related_pulls: [],
      },
      sections: [
        {
          heading: group.question,
          content: buildTable(tableHeaders, tableRows),
        },
        ...(signals.length > 0 ? [{
          heading: 'Signals',
          content: formatSignalsSection(signals),
        }] : []),
        {
          heading: 'Source',
          content: [
            `- **API**: EIA (Energy Information Administration) v2`,
            `- **Endpoint**: ${group.route}`,
            `- **Frequency**: ${group.params.frequency}`,
            `- **Records**: ${records.length}`,
            `- **Auto-pulled**: ${today()}`,
          ].join('\n'),
        },
      ],
    });

    // Write note
    const filePath = join(getPullsDir(), group.domain, dateStampedFilename(noteName));
    writeNote(filePath, note);
    setProperties(filePath, { signal_status: signalStatus, date_pulled: today() });
    console.log(`\n📝 Wrote: ${filePath}`);

    // Write signal logs if any fired
    if (signals.length > 0) {
      for (const s of signals) {
        const signalNote = buildNote({
          frontmatter: {
            signal_id: s.id,
            signal_name: s.name,
            domain: s.domain,
            severity: s.severity,
            value: s.value,
            threshold: s.threshold,
            date: today(),
            source_pull: noteName,
            tags: ['signal', s.domain, s.severity],
          },
          sections: [
            { heading: s.name, content: s.message },
            { heading: 'Implications', content: s.implications.map(i => `- ${i}`).join('\n') },
            { heading: 'Related Domains', content: s.related_domains.map(d => `- ${d}`).join('\n') },
          ],
        });

        const signalPath = join(getSignalsDir(), dateStampedFilename(s.id));
        writeNote(signalPath, signalNote);
        console.log(`⚡ Signal logged: ${signalPath}`);
      }
    }

    results.push({ filePath, signals });
  }

  // Return combined result (last group for single-group pulls, aggregated for --all)
  const allSignals = results.flatMap(r => r.signals);
  const lastFilePath = results[results.length - 1]?.filePath ?? null;
  return { filePath: lastFilePath, signals: allSignals };
}

/**
 * Build table headers and rows for a given group's records.
 * @param {string} groupKey
 * @param {object[]} records
 * @returns {{ tableHeaders: string[], tableRows: string[][] }}
 */
function buildTableData(groupKey, records) {
  if (groupKey === 'electricity-demand') {
    const tableHeaders = ['Period', 'State', 'Sector', 'Sales (MWh)', 'Revenue ($K)'];
    const tableRows = records.slice(0, 20).map(r => [
      r.period ?? 'N/A',
      r.stateid ?? r.stateDescription ?? 'N/A',
      r.sectorName ?? r.sectorid ?? 'N/A',
      r.sales != null ? formatNumber(parseFloat(r.sales), { decimals: 0 }) : 'N/A',
      r.revenue != null ? formatNumber(parseFloat(r.revenue), { decimals: 0 }) : 'N/A',
    ]);
    return { tableHeaders, tableRows };
  }

  if (groupKey === 'generation-mix') {
    const tableHeaders = ['Period', 'Fuel Type', 'Generation (MWh)'];
    const tableRows = records.slice(0, 20).map(r => [
      r.period ?? 'N/A',
      r.fuelTypeDescription ?? r.fueltypeid ?? 'N/A',
      r.generation != null ? formatNumber(parseFloat(r.generation), { decimals: 0 }) : 'N/A',
    ]);
    return { tableHeaders, tableRows };
  }

  if (groupKey === 'regional-load') {
    const tableHeaders = ['Period', 'Region', 'Load (MWh)'];
    const tableRows = records.slice(0, 30).map(r => [
      r.period ?? 'N/A',
      r.respondentName ?? r.respondent ?? 'N/A',
      r.value != null ? formatNumber(parseFloat(r.value), { decimals: 0 }) : 'N/A',
    ]);
    return { tableHeaders, tableRows };
  }

  // Fallback generic table
  const tableHeaders = ['Period', 'Value'];
  const tableRows = records.slice(0, 20).map(r => [
    r.period ?? 'N/A',
    r.value != null ? formatNumber(parseFloat(r.value), { decimals: 2 }) : 'N/A',
  ]);
  return { tableHeaders, tableRows };
}

/**
 * Evaluate signals based on group data.
 * @param {string} groupKey
 * @param {object[]} records
 * @returns {import('../lib/signals.mjs').Signal[]}
 */
function evaluateGroupSignals(groupKey, records) {
  const signals = [];

  if (groupKey === 'electricity-demand' && records.length >= 2) {
    // Aggregate total sales for latest and prior period
    const periods = [...new Set(records.map(r => r.period))].sort().reverse();
    const latestPeriod = periods[0];
    const priorPeriod = periods[1];

    const sumSales = (period) => records
      .filter(r => r.period === period && r.sales != null)
      .reduce((sum, r) => sum + parseFloat(r.sales), 0);

    const currentMWh = latestPeriod ? sumSales(latestPeriod) : null;
    const priorMWh = priorPeriod ? sumSales(priorPeriod) : null;

    const signal = evaluateElectricityDemandGrowth(currentMWh, priorMWh);
    if (signal) signals.push(signal);
  }

  if (groupKey === 'generation-mix' && records.length >= 2) {
    // Total generation from ALL fuel type vs a rough load estimate
    const allRecords = records.filter(r => r.fueltypeid === 'ALL' || r.fuelTypeDescription?.toUpperCase().includes('ALL'));
    const totalGeneration = allRecords.reduce((sum, r) => sum + (parseFloat(r.generation) || 0), 0);

    // Use total generation as proxy; compare to 95% of itself as a floor for ratio check
    // Real load data would come from regional-load group — use generation as both sides with small margin
    const totalLoad = totalGeneration * 0.97;

    const signal = evaluateGenerationGap(totalGeneration || null, totalLoad || null);
    if (signal) signals.push(signal);
  }

  if (groupKey === 'regional-load' && records.length >= 2) {
    // Group by region, compute average load across all periods, then evaluate latest vs avg
    const regionMap = {};
    for (const r of records) {
      const region = r.respondent ?? r.respondentName ?? 'UNKNOWN';
      const val = parseFloat(r.value);
      if (!isNaN(val)) {
        if (!regionMap[region]) regionMap[region] = [];
        regionMap[region] = [...regionMap[region], val];
      }
    }

    for (const [region, values] of Object.entries(regionMap)) {
      if (values.length < 2) continue;
      const latest = values[0];
      const historicalAvg = values.slice(1).reduce((s, v) => s + v, 0) / (values.length - 1);
      const signal = evaluateRegionalLoadSpike(latest, historicalAvg);
      if (signal) {
        // Attach region context to the message
        signals.push(Object.freeze({
          ...signal,
          message: `[${region}] ${signal.message}`,
        }));
        break; // Report first stressed region only to avoid signal flood
      }
    }
  }

  return signals;
}
