/**
 * treasury.mjs — Treasury Fiscal Data puller
 *
 * Usage:
 *   node run.mjs treasury --yields
 */

import { join } from 'path';
import { getPullsDir } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import { buildNote, buildTable, writeNote, today, dateStampedFilename } from '../lib/markdown.mjs';

export async function pull(flags = {}) {
  if (flags.yields || !Object.keys(flags).length) {
    return pullYields();
  } else {
    throw new Error('Specify --yields');
  }
}

async function pullYields() {
  console.log(`🏛️ Treasury: Fetching average interest rates...`);

  const url = 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates?sort=-record_date&page[size]=30&fields=record_date,security_desc,avg_interest_rate_amt';
  const data = await getJson(url);

  const records = data.data || [];
  console.log(`  ${records.length} rate records retrieved`);

  // Group by most recent date
  const latestDate = records[0]?.record_date;
  const latestRecords = records.filter(r => r.record_date === latestDate);

  console.log(`  Latest date: ${latestDate} (${latestRecords.length} securities)`);
  latestRecords.slice(0, 5).forEach(r => {
    console.log(`    ${r.security_desc}: ${r.avg_interest_rate_amt}%`);
  });

  const rows = latestRecords.map(r => [
    r.security_desc,
    `${r.avg_interest_rate_amt}%`,
  ]);

  const note = buildNote({
    frontmatter: {
      title: 'Treasury Average Interest Rates',
      source: 'Treasury Fiscal Data',
      date_pulled: today(),
      record_date: latestDate,
      domain: 'macro',
      data_type: 'snapshot',
      frequency: 'monthly',
      signal_status: 'clear',
      signals: [],
      tags: ['macro', 'treasury', 'rates', 'yields'],
    },
    sections: [
      {
        heading: `Average Interest Rates — ${latestDate}`,
        content: buildTable(['Security', 'Avg Interest Rate'], rows),
      },
      {
        heading: 'Source',
        content: `- **API**: Treasury Fiscal Data (avg_interest_rates)\n- **No API key required**\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Macro', dateStampedFilename('Treasury_Rates'));
  writeNote(filePath, note);
  return { filePath, signals: [] };
}
