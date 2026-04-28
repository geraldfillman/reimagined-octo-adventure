/**
 * fda.mjs — openFDA drug data puller
 *
 * Usage:
 *   node run.mjs fda --recent-approvals
 */

import { join } from 'path';
import { getApiKey, getPullsDir } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import { buildNote, buildTable, writeNote, today, dateStampedFilename } from '../lib/markdown.mjs';
import { evaluateFDAApprovals, highestSeverity, formatSignalsSection } from '../lib/signals.mjs';

export async function pull(flags = {}) {
  if (flags['recent-approvals'] || flags.recent || !Object.keys(flags).length) {
    return pullRecentApprovals();
  } else {
    throw new Error('Specify --recent-approvals');
  }
}

async function pullRecentApprovals() {
  let apiKey = null;
  try {
    apiKey = getApiKey('fda');
  } catch {
    console.log('  ⚠️ No FDA API key — using unauthenticated mode (lower rate limits)');
  }
  console.log(`💊 FDA: Fetching recent drug approvals...`);

  const keyParam = apiKey ? `api_key=${apiKey}&` : '';
  const url = `https://api.fda.gov/drug/drugsfda.json?${keyParam}search=submissions.submission_type:%22ORIG%22+AND+submissions.submission_status:%22AP%22&sort=submissions.submission_status_date:desc&limit=15`;
  const data = await getJson(url);

  const results = data.results || [];
  console.log(`  ${results.length} approval records retrieved`);

  const drugs = results.map(r => {
    const name = r.openfda?.brand_name?.[0] || r.products?.[0]?.brand_name || 'Unknown';
    const generic = r.openfda?.generic_name?.[0] || 'N/A';
    const sponsor = r.sponsor_name || 'Unknown';
    const appNo = r.application_number || 'N/A';
    const type = appNo.startsWith('NDA') ? 'NDA' : appNo.startsWith('ANDA') ? 'ANDA' : appNo.startsWith('BLA') ? 'BLA' : 'Other';
    return { name, generic, sponsor, appNo, type };
  });

  drugs.slice(0, 5).forEach(d => {
    console.log(`  ${d.name} (${d.generic}) by ${d.sponsor} — ${d.appNo}`);
  });

  // Signal: cluster detection
  const signals = [];
  const signal = evaluateFDAApprovals(results.length, 30);
  if (signal) signals.push(signal);

  const rows = drugs.map(d => [d.name, d.generic, d.sponsor, d.appNo, d.type]);

  const note = buildNote({
    frontmatter: {
      title: 'Recent Drug Approvals — FDA',
      source: 'openFDA',
      date_pulled: today(),
      domain: 'biotech',
      data_type: 'event_list',
      frequency: 'on-demand',
      signal_status: highestSeverity(signals),
      signals: signals.map(s => ({ id: s.id, severity: s.severity, message: s.message })),
      tags: ['biotech', 'fda', 'drug-approvals'],
    },
    sections: [
      {
        heading: 'Recent Original Drug Approvals',
        content: buildTable(['Brand Name', 'Generic', 'Sponsor', 'Application #', 'Type'], rows),
      },
      ...(signals.length > 0 ? [{ heading: 'Signals', content: formatSignalsSection(signals) }] : []),
      {
        heading: 'Source',
        content: `- **API**: openFDA (drug/drugsfda)\n- **Filter**: Original applications, approved\n- **Count**: ${results.length}\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Biotech', dateStampedFilename('FDA_Approvals'));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals };
}
