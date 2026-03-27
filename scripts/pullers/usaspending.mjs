/**
 * usaspending.mjs — Federal contract awards puller
 *
 * Usage:
 *   node run.mjs usaspending --recent
 */

import { join } from 'path';
import { getPullsDir } from '../lib/config.mjs';
import { postJson } from '../lib/fetcher.mjs';
import { buildNote, buildTable, writeNote, formatNumber, today, dateStampedFilename } from '../lib/markdown.mjs';
import { evaluateLargeContract, highestSeverity, formatSignalsSection } from '../lib/signals.mjs';

export async function pull(flags = {}) {
  if (flags.recent || !Object.keys(flags).length) {
    await pullRecent();
  } else {
    throw new Error('Specify --recent');
  }
}

async function pullRecent() {
  console.log(`🏛️ USASpending: Fetching recent contract awards...`);

  // Get contracts that started in the last 60 days, sorted by start date desc
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const data = await postJson('https://api.usaspending.gov/api/v2/search/spending_by_award/', {
    filters: {
      time_period: [{ start_date: sixtyDaysAgo, end_date: today() }],
      award_type_codes: ['A', 'B', 'C', 'D'],
    },
    fields: ['Award ID', 'Recipient Name', 'Award Amount', 'Awarding Agency', 'Start Date', 'Description'],
    sort: 'Start Date',
    order: 'desc',
    limit: 20,
    page: 1,
  });

  const awards = (data.results || []).filter(a => a['Start Date'] >= sixtyDaysAgo);
  console.log(`  ${awards.length} recent new contracts`);

  // Evaluate signals for large awards
  const signals = [];
  for (const a of awards) {
    const signal = evaluateLargeContract(a['Award Amount'], a['Recipient Name'], a['Awarding Agency']);
    if (signal) signals.push(signal);
  }

  awards.slice(0, 5).forEach(a => {
    const amt = formatNumber(a['Award Amount'], { style: 'currency' });
    console.log(`  ${a['Start Date']}: ${a['Recipient Name']} — ${amt} — ${a['Awarding Agency']}`);
  });

  if (signals.length > 0) {
    console.log(`\n⚡ ${signals.length} large contract signal(s):`);
    signals.forEach(s => console.log(`  🟡 ${s.message}`));
  }

  const rows = awards.map(a => [
    a['Start Date'] || 'N/A',
    a['Recipient Name'] || 'N/A',
    formatNumber(a['Award Amount'], { style: 'currency' }),
    a['Awarding Agency'] || 'N/A',
    (a['Description'] || 'N/A').slice(0, 60),
  ]);

  const note = buildNote({
    frontmatter: {
      title: 'Recent Federal Contract Awards — USASpending',
      source: 'USASpending API',
      date_pulled: today(),
      date_range: `${sixtyDaysAgo} to ${today()}`,
      domain: 'government',
      data_type: 'event_list',
      frequency: 'on-demand',
      signal_status: highestSeverity(signals),
      signals: signals.map(s => ({ id: s.id, severity: s.severity, message: s.message })),
      tags: ['government', 'contracts', 'federal-spending', 'usaspending'],
    },
    sections: [
      {
        heading: 'Recent Contract Awards',
        content: buildTable(['Start Date', 'Recipient', 'Amount', 'Agency', 'Description'], rows),
      },
      ...(signals.length > 0 ? [{ heading: 'Signals', content: formatSignalsSection(signals) }] : []),
      {
        heading: 'Source',
        content: `- **API**: USASpending.gov v2 (spending_by_award)\n- **Filter**: New contracts, last 60 days, sorted by start date\n- **No API key required**\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Government', dateStampedFilename('USASpending_Awards'));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
  return { signals };
}
