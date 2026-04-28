/**
 * bea.mjs — Bureau of Economic Analysis puller
 *
 * Usage:
 *   node run.mjs bea --gdp
 *   node run.mjs bea --income
 */

import { join } from 'path';
import { getApiKey, getBaseUrl, getPullsDir } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import { buildNote, buildTable, writeNote, formatNumber, today, dateStampedFilename } from '../lib/markdown.mjs';

export async function pull(flags = {}) {
  const apiKey = getApiKey('bea');
  const baseUrl = getBaseUrl('bea');

  if (flags.gdp) {
    return pullGDP(apiKey, baseUrl);
  } else if (flags.income) {
    return pullPersonalIncome(apiKey, baseUrl);
  } else {
    // Default to GDP
    return pullGDP(apiKey, baseUrl);
  }
}

async function pullGDP(apiKey, baseUrl) {
  console.log(`📊 BEA: Fetching GDP data (NIPA Table 1.1.1)...`);

  const url = `${baseUrl}?&UserID=${apiKey}&method=GetData&DataSetName=NIPA&TableName=T10101&Frequency=Q&Year=2024,2025,2026&ResultFormat=JSON`;
  const data = await getJson(url);

  const results = data?.BEAAPI?.Results;
  if (!results) {
    throw new Error(`BEA API error: ${JSON.stringify(data).slice(0, 300)}`);
  }

  const dataItems = results.Data || [];
  if (dataItems.length === 0) {
    throw new Error('No GDP data returned');
  }

  // Filter for key GDP line items
  const gdpLine = '1'; // Line 1 = GDP
  const gdpRows = dataItems
    .filter(d => d.LineNumber === gdpLine)
    .sort((a, b) => b.TimePeriod.localeCompare(a.TimePeriod))
    .slice(0, 8);

  console.log(`  ${gdpRows.length} quarters of GDP data`);
  if (gdpRows[0]) {
    console.log(`  Latest: ${gdpRows[0].TimePeriod} = ${gdpRows[0].DataValue}% change`);
  }

  const rows = gdpRows.map(d => [
    d.TimePeriod,
    `${d.DataValue}%`,
  ]);

  const note = buildNote({
    frontmatter: {
      title: 'GDP Growth — BEA',
      source: 'BEA API',
      table: 'T10101',
      date_pulled: today(),
      domain: 'macro',
      data_type: 'time_series',
      frequency: 'quarterly',
      signal_status: 'clear',
      signals: [],
      tags: ['macro', 'gdp', 'bea', 'growth'],
    },
    sections: [
      {
        heading: 'Real GDP — Percent Change from Preceding Period',
        content: buildTable(['Quarter', 'GDP Growth (% QoQ Annualized)'], rows),
      },
      {
        heading: 'Source',
        content: `- **API**: Bureau of Economic Analysis (NIPA Table 1.1.1)\n- **Metric**: Percent change from preceding period (annualized)\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Macro', dateStampedFilename('BEA_GDP'));
  writeNote(filePath, note);
  return { filePath, signals: [] };
  console.log(`📝 Wrote: ${filePath}`);
}

async function pullPersonalIncome(apiKey, baseUrl) {
  console.log(`📊 BEA: Fetching Personal Income data (NIPA Table 2.1)...`);

  const url = `${baseUrl}?&UserID=${apiKey}&method=GetData&DataSetName=NIPA&TableName=T20100&Frequency=Q&Year=2024,2025,2026&ResultFormat=JSON`;
  const data = await getJson(url);

  const results = data?.BEAAPI?.Results;
  if (!results) {
    throw new Error(`BEA API error: ${JSON.stringify(data).slice(0, 300)}`);
  }

  const dataItems = results.Data || [];
  // Line 1 = Personal Income
  const incomeRows = dataItems
    .filter(d => d.LineNumber === '1')
    .sort((a, b) => b.TimePeriod.localeCompare(a.TimePeriod))
    .slice(0, 8);

  console.log(`  ${incomeRows.length} quarters of personal income data`);

  const rows = incomeRows.map(d => [
    d.TimePeriod,
    `$${formatNumber(parseFloat(d.DataValue.replace(/,/g, '')), { style: 'compact' })}`,
  ]);

  const note = buildNote({
    frontmatter: {
      title: 'Personal Income — BEA',
      source: 'BEA API',
      table: 'T20100',
      date_pulled: today(),
      domain: 'macro',
      data_type: 'time_series',
      frequency: 'quarterly',
      signal_status: 'clear',
      signals: [],
      tags: ['macro', 'income', 'bea', 'consumer'],
    },
    sections: [
      {
        heading: 'Personal Income — Quarterly',
        content: buildTable(['Quarter', 'Personal Income (Billions)'], rows),
      },
      {
        heading: 'Source',
        content: `- **API**: Bureau of Economic Analysis (NIPA Table 2.1)\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Macro', dateStampedFilename('BEA_Personal_Income'));
  writeNote(filePath, note);
  return { filePath, signals: [] };
  console.log(`📝 Wrote: ${filePath}`);
}
