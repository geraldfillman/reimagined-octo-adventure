/**
 * openfema.mjs — FEMA disaster declarations puller
 *
 * Usage:
 *   node run.mjs openfema --recent
 */

import { join } from 'path';
import { getPullsDir, getSignalsDir } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import { buildNote, buildTable, writeNote, today, dateStampedFilename } from '../lib/markdown.mjs';
import { evaluateFEMASpike, highestSeverity, formatSignalsSection } from '../lib/signals.mjs';

export async function pull(flags = {}) {
  if (flags.recent || !Object.keys(flags).length) {
    return pullRecent(flags);
  } else {
    throw new Error('Specify --recent');
  }
}

async function pullRecent(flags = {}) {
  console.log(`🌊 OpenFEMA: Fetching recent disaster declarations...`);

  const url = 'https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$orderby=declarationDate%20desc&$top=25&$select=disasterNumber,declarationDate,state,declarationTitle,incidentType,designatedArea';
  const data = await getJson(url);

  const records = data.DisasterDeclarationsSummaries || [];
  console.log(`  ${records.length} declarations retrieved`);

  // Count declarations in last 60 days for signal
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
  const recentCount = records.filter(r => r.declarationDate >= sixtyDaysAgo).length;

  records.slice(0, 5).forEach(r => {
    console.log(`  ${r.declarationDate?.slice(0, 10)}: ${r.state} — ${r.declarationTitle}`);
  });

  const signals = [];
  const signal = evaluateFEMASpike(recentCount, 60);
  if (signal) signals.push(signal);

  if (signals.length > 0) {
    console.log(`\n⚡ ${signals.length} signal(s):`);
    signals.forEach(s => console.log(`  🟠 ${s.message}`));
  }

  const rows = records.map(r => [
    r.declarationDate?.slice(0, 10) || 'N/A',
    r.state || 'N/A',
    r.declarationTitle || 'N/A',
    r.incidentType || 'N/A',
    r.designatedArea || 'N/A',
  ]);

  const note = buildNote({
    frontmatter: {
      title: 'FEMA Disaster Declarations — Recent',
      source: 'OpenFEMA',
      date_pulled: today(),
      domain: 'government',
      data_type: 'event_list',
      frequency: 'on-demand',
      recent_60d_count: recentCount,
      signal_status: highestSeverity(signals),
      signals: signals.map(s => ({ id: s.id, severity: s.severity, message: s.message })),
      tags: ['government', 'fema', 'disaster', 'risk'],
    },
    sections: [
      {
        heading: 'Recent Disaster Declarations',
        content: buildTable(['Date', 'State', 'Title', 'Type', 'Area'], rows),
      },
      ...(signals.length > 0 ? [{ heading: 'Signals', content: formatSignalsSection(signals) }] : []),
      {
        heading: 'Source',
        content: `- **API**: OpenFEMA v2 (DisasterDeclarationsSummaries)\n- **No API key required**\n- **Declarations in last 60 days**: ${recentCount}\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const filePath = join(getPullsDir(), 'Government', dateStampedFilename('FEMA_Declarations'));
  if (!shouldWriteArtifacts(flags)) {
    console.log(`[dry-run] Would write: ${filePath}`);
    return { filePath: null, signals };
  }

  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);

  // Write signal logs
  if (signals.length > 0) {
    for (const s of signals) {
      const signalNote = buildNote({
        frontmatter: { signal_id: s.id, severity: s.severity, date: today(), tags: ['signal', 'fema'] },
        sections: [
          { heading: s.name, content: s.message },
          { heading: 'Implications', content: s.implications.map(i => `- ${i}`).join('\n') },
        ],
      });
      const signalPath = join(getSignalsDir(), dateStampedFilename(s.id));
      writeNote(signalPath, signalNote);
      console.log(`⚡ Signal logged: ${signalPath}`);
    }
  }

  return { filePath, signals };
}

export function shouldWriteArtifacts(flags = {}) {
  return !Boolean(flags['dry-run']);
}
