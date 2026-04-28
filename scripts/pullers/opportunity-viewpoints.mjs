/**
 * opportunity-viewpoints.mjs - Cross-source opportunity and viewpoint composer.
 *
 * Reads the latest local pull notes and signal notes, then builds a ranked
 * queue of research viewpoints where multiple evidence layers overlap. This
 * is a synthesis report, not a fresh API pull.
 *
 * Usage:
 *   node run.mjs pull opportunity-viewpoints
 *   node run.mjs pull opportunity-viewpoints --window 21 --limit 15
 *   node run.mjs pull opportunity-viewpoints --thesis defense
 *   node run.mjs pull opportunity-viewpoints --sector "Aerospace & Defense"
 *   node run.mjs pull opportunity-viewpoints --long-only
 */

import { existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { getPullsDir, getSignalsDir, getVaultRoot } from '../lib/config.mjs';
import { readFolder } from '../lib/frontmatter.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';
import { setProperties } from '../lib/obsidian-cli.mjs';

const DEFAULT_WINDOW_DAYS = 14;
const DEFAULT_LIMIT = 12;

const PULL_DOMAINS = Object.freeze([
  'Theses',
  'Market',
  'Fundamentals',
  'Sectors',
  'Macro',
  'Government',
  'Biotech',
  'Housing',
  'Energy',
  'Research',
  'Quant',
]);

const SIGNAL_SCORE = Object.freeze({
  clear: 0,
  watch: 1,
  alert: 2,
  critical: 3,
});

const PRIORITY_SCORE = Object.freeze({
  watch: 1,
  medium: 2,
  high: 3,
});

const CONVICTION_SCORE = Object.freeze({
  low: 1,
  medium: 2,
  high: 3,
});

export async function pull(flags = {}) {
  const windowDays = Math.max(1, Number(flags.window ?? flags.lookback) || DEFAULT_WINDOW_DAYS);
  const limit = Math.max(1, Number(flags.limit) || DEFAULT_LIMIT);
  const since = flags.since ? String(flags.since) : daysAgo(windowDays);
  const thesisFilter = String(flags.thesis || '').trim().toLowerCase();
  const sectorFilter = String(flags.sector || '').trim().toLowerCase();
  const longOnly = Boolean(flags['long-only']);

  console.log(`Opportunity Viewpoints: reading local notes since ${since}...`);

  const data = await loadSynthesisData({ since });
  let viewpoints = buildViewpoints(data);

  if (thesisFilter) {
    viewpoints = viewpoints.filter(view =>
      view.thesis.toLowerCase().includes(thesisFilter) ||
      view.evidenceText.toLowerCase().includes(thesisFilter)
    );
  }

  if (sectorFilter) {
    viewpoints = viewpoints.filter(view =>
      view.sector.toLowerCase().includes(sectorFilter) ||
      view.evidenceText.toLowerCase().includes(sectorFilter)
    );
  }

  if (longOnly) {
    viewpoints = viewpoints.filter(view => view.posture !== 'risk-first');
  }

  viewpoints.sort(compareViewpoints);
  const selected = selectDiverseViewpoints(viewpoints, limit);
  const signalStatus = classifySignalStatus(selected);
  const note = buildOpportunityNote({
    data,
    selected,
    since,
    windowDays,
    signalStatus,
    filters: { thesisFilter, sectorFilter, longOnly },
  });

  if (flags['dry-run']) {
    console.log(note);
    return { filePath: null, candidates: selected.length };
  }

  const filePath = join(getPullsDir(), 'Theses', dateStampedFilename('Opportunity_Viewpoints'));
  writeNote(filePath, note);
  setProperties(filePath, { signal_status: signalStatus, date_pulled: today() });
  console.log(`Wrote: ${filePath}`);

  return { filePath, candidates: selected.length, signalStatus };
}

async function loadSynthesisData({ since }) {
  const pullNotesByDomain = {};
  const allPullNotes = [];

  for (const domain of PULL_DOMAINS) {
    const notes = await readFolder(join(getPullsDir(), domain), false);
    const scoped = notes
      .map(note => ({ ...note, pullDomain: domain }))
      .filter(note => noteDate(note) >= since)
      .filter(note => note.data?.data_type !== 'opportunity_viewpoints');
    pullNotesByDomain[domain] = scoped;
    allPullNotes.push(...scoped);
  }

  const signalNotes = existsSync(getSignalsDir())
    ? (await readFolder(getSignalsDir(), false)).filter(note => noteDate(note) >= since)
    : [];

  const thesisReports = latestBy(
    allPullNotes.filter(note => note.data?.data_type === 'full_picture_report'),
    note => String(note.data?.thesis_name || note.filename)
  ).map(buildThesisContext);

  const catalystNotes = latestBy(
    allPullNotes.filter(note => note.data?.data_type === 'catalyst_note'),
    note => String(note.data?.symbol || note.filename)
  ).map(buildCatalystContext);

  const detailedSectorReports = latestBy(
    allPullNotes.filter(note => note.data?.data_type === 'detailed_sector_report'),
    note => String(note.data?.sector || note.filename)
  ).map(buildSectorContext);

  const sectorIndex = latestNote(allPullNotes.filter(note => note.data?.data_type === 'detailed_sector_report_index'));
  const convictionDelta = latestNote(allPullNotes.filter(note => note.data?.data_type === 'conviction_delta'));
  const disclosureReality = latestNote(allPullNotes.filter(note => note.data?.data_type === 'disclosure_reality_check'));
  const dilutionMonitor = latestNote(allPullNotes.filter(note =>
    note.data?.data_type === 'batch_scan' &&
    String(note.data?.title || '').toLowerCase().includes('dilution')
  ));
  const capitalRaise = latestNote(allPullNotes.filter(note =>
    String(note.data?.title || '').toLowerCase().includes('capital raise')
  ));

  const disclosureRows = disclosureReality ? parseDisclosureRows(disclosureReality) : [];
  const convictionRows = convictionDelta ? parseConvictionRows(convictionDelta) : [];
  const dilutionRows = dilutionMonitor ? parseDilutionRows(dilutionMonitor) : [];
  const signalContexts = signalNotes.map(buildSignalContext);

  const catalystBySymbol = new Map(catalystNotes.map(row => [row.symbol, row]));
  const thesisByName = new Map(thesisReports.map(row => [row.name, row]));
  const symbolToTheses = buildSymbolToTheses(thesisReports);
  const sectorByName = new Map(detailedSectorReports.map(row => [row.sector.toLowerCase(), row]));
  const dilutionBySymbol = new Map(dilutionRows.map(row => [row.symbol, row]));

  return {
    since,
    pullNotesByDomain,
    allPullNotes,
    signalNotes: signalContexts,
    thesisReports,
    catalystNotes,
    detailedSectorReports,
    sectorIndex,
    convictionDelta,
    disclosureReality,
    dilutionMonitor,
    capitalRaise,
    disclosureRows,
    convictionRows,
    dilutionRows,
    catalystBySymbol,
    thesisByName,
    symbolToTheses,
    sectorByName,
    dilutionBySymbol,
  };
}

function buildViewpoints(data) {
  const views = [];
  views.push(...buildDisclosureConfirmationViews(data));
  views.push(...buildStructuralDislocationViews(data));
  views.push(...buildSectorSmallCapViews(data));
  views.push(...buildConvictionMomentumViews(data));
  views.push(...buildRiskAndAvoidViews(data));
  return dedupeViewpoints(views);
}

function buildDisclosureConfirmationViews(data) {
  const views = [];

  for (const row of data.disclosureRows.filter(r => r.score >= 4)) {
    const catalyst = data.catalystBySymbol.get(row.symbol) || null;
    const thesis = resolvePrimaryThesisForSymbol(row.symbol, data, catalyst);
    const sector = resolveSectorForSymbol(row.symbol, data, thesis);
    const dilution = data.dilutionBySymbol.get(row.symbol) || null;
    const riskOverlay = /3\.02|unregistered|dilut/i.test(row.items + ' ' + row.whyRead);
    const score = 18
      + row.score * 3
      + (catalyst ? Math.min(8, Number(catalyst.catalystScore || 0)) : 0)
      + priorityPoints(thesis?.allocationPriority)
      + convictionPoints(thesis?.conviction)
      + (catalyst?.technicalBias === 'bearish' ? 3 : 0)
      + (catalyst?.momentumState === 'oversold' ? 3 : 0)
      - (riskOverlay ? 5 : 0)
      - (dilution?.hasRisk ? 3 : 0);

    views.push({
      id: `disclosure-${row.symbol}-${row.filed}`,
      lens: 'Disclosure Confirmation Wedge',
      posture: riskOverlay ? 'conditional' : 'opportunity',
      score,
      symbols: [row.symbol],
      thesis: thesis?.name || catalyst?.primaryThesis || row.theme || 'unmapped',
      sector: sector || row.theme || 'unmapped',
      claim: `${row.symbol} has a high-value 8-K queue item, but the edge is in confirming whether the disclosure converts to real economics.`,
      whyUnique: catalyst
        ? 'The EDGAR event overlaps with a live catalyst note, so the filing can be tested against earnings timing and tape state.'
        : 'The EDGAR event is strong enough to deserve a manual counterparty-confirmation pass before it enters the normal thesis stack.',
      confirms: [
        `Disclosure score ${row.score}/10: ${row.whyRead}`,
        catalyst ? `Catalyst: ${catalyst.urgency}, ${catalyst.signalStatus}, ${catalyst.technicalBias || 'no bias'}` : null,
        thesis ? `Thesis: ${thesis.name}, ${thesis.structuralView}/${thesis.tacticalView}, ${thesis.allocationPriority || 'no priority'}` : null,
      ].filter(Boolean),
      cautions: [
        riskOverlay ? '8-K item mix includes financing or unregistered securities risk.' : null,
        dilution?.hasRisk ? `Dilution monitor: ${dilution.triggers}` : null,
        catalyst?.technicalStatus && catalyst.technicalStatus !== 'clear' ? `Tape is not clean: ${catalyst.technicalStatus}/${catalyst.technicalBias}.` : null,
      ].filter(Boolean),
      nextSteps: [
        'Read attached exhibits before the press-release summary.',
        'Confirm counterparty, minimum economics, duration, termination rights, and whether revenue is binding.',
        'Check the counterparty filing or procurement database for independent confirmation.',
      ],
      evidenceLinks: uniqueValues([
        row.noteLink,
        catalyst?.noteLink,
        thesis?.noteLink,
        data.disclosureReality ? filePathToWikiLink(data.disclosureReality.path) : null,
      ]),
    });
  }

  return views;
}

function buildStructuralDislocationViews(data) {
  const views = [];

  for (const thesis of data.thesisReports) {
    const isStrong = thesis.structuralView === 'strong';
    const isRisky = thesis.tacticalView === 'risky' || thesis.technicalStatus === 'alert' || thesis.signalStatus === 'critical';
    const isPriority = thesis.allocationPriority === 'high' || thesis.conviction === 'high';
    if (!((isStrong && isRisky) || (isPriority && isRisky))) continue;

    const topCatalysts = thesis.catalystRows.slice(0, 4);
    const symbols = uniqueValues([thesis.primarySymbol, ...topCatalysts.map(row => row.Symbol)]).filter(Boolean).slice(0, 6);
    const score = 20
      + priorityPoints(thesis.allocationPriority) * 4
      + convictionPoints(thesis.conviction) * 3
      + statusPoints(thesis.signalStatus) * 3
      + (isStrong ? 8 : 0)
      + (isRisky ? 6 : 0)
      + Math.min(8, thesis.catalystRows.length);

    views.push({
      id: `dislocation-${slugify(thesis.name)}`,
      lens: 'Strong Thesis, Bad Tape',
      posture: 'opportunity',
      score,
      symbols,
      thesis: thesis.name,
      sector: sectorFromThesisName(thesis.name),
      claim: `${thesis.name} is structurally alive while the current tape is hostile, creating a wait-for-confirmation dislocation rather than a clean add.`,
      whyUnique: 'The full-picture layer shows structural support and tactical stress at the same time, which is where the research process can separate good entries from falling knives.',
      confirms: [
        `Structural/tactical: ${thesis.structuralView}/${thesis.tacticalView}`,
        `Priority/conviction: ${thesis.allocationPriority || 'N/A'}/${thesis.conviction || 'N/A'}`,
        `Catalyst coverage: ${thesis.catalystRows.length} symbol rows`,
      ],
      cautions: [
        thesis.coverageGapCount > 0 ? `${thesis.coverageGapCount} coverage gap(s) remain.` : null,
        thesis.technicalStatus !== 'clear' ? `Technical status is ${thesis.technicalStatus}.` : null,
      ].filter(Boolean),
      nextSteps: [
        'Pick one symbol with the cleanest catalyst and least financing risk.',
        'Wait for either tape repair or independent catalyst confirmation before sizing.',
        'Use the linked full-picture report as the base memo.',
      ],
      evidenceLinks: uniqueValues([thesis.noteLink, ...topCatalysts.map(row => row.Note)]),
    });
  }

  return views;
}

function buildSectorSmallCapViews(data) {
  const views = [];

  for (const sector of data.detailedSectorReports) {
    const rows = sector.microRows
      .filter(row => numberFrom(row.Score) >= 55)
      .slice(0, 4);
    if (rows.length === 0) continue;

    const structuralStrong = sector.structuralView === 'strong';
    const stressed = sector.signalStatus === 'critical' || sector.signalStatus === 'alert';
    const score = 14
      + statusPoints(sector.signalStatus) * 4
      + (structuralStrong ? 5 : 0)
      + Math.min(12, sector.technicalNonclearCount)
      + Math.round(rows.reduce((sum, row) => sum + numberFrom(row.Score), 0) / rows.length / 8);

    const symbols = rows.map(row => extractSymbol(row.Ticker)).filter(Boolean);
    views.push({
      id: `smallcap-${slugify(sector.sector)}`,
      lens: 'Stressed Sector Small-Cap Queue',
      posture: 'opportunity',
      score,
      symbols,
      thesis: sector.sector,
      sector: sector.sector,
      claim: `${sector.sector} has enough sector stress to force selectivity, but its small-cap queue still contains names worth first-pass work.`,
      whyUnique: 'This combines sector stress, fundamental screen output, and local report context, so the queue is a hunting list only after risk checks.',
      confirms: [
        `Sector status: ${sector.signalStatus}, structural/tactical ${sector.structuralView}/${sector.tacticalView}`,
        `Top queue: ${rows.map(row => `${extractSymbol(row.Ticker)} score ${row.Score}`).join(', ')}`,
        `SEC filing count: ${sector.secFilingCount}`,
      ],
      cautions: [
        stressed ? 'The sector-level tape is stressed, so this is a research queue, not a basket call.' : null,
        rows.some(row => /pending|missing|unprofitable/i.test(row.Risk || row.Valuation || '')) ? 'At least one screen row has missing fundamentals or profitability risk.' : null,
      ].filter(Boolean),
      nextSteps: [
        'Run disclosure-reality or filing-digest on the top two symbols.',
        'Check dilution, listing, and recent 8-K risk before treating the screen score as investable.',
        'Compare the small-cap setup against the sector leaders for relative quality.',
      ],
      evidenceLinks: uniqueValues([sector.noteLink]),
    });
  }

  return views;
}

function buildConvictionMomentumViews(data) {
  const views = [];

  for (const row of data.convictionRows.filter(r => numberFrom(r['Net Score']) > 0)) {
    const thesisName = cleanWiki(row.Thesis);
    const thesis = data.thesisByName.get(thesisName) || null;
    const netScore = numberFrom(row['Net Score']);
    const score = 12
      + netScore * 4
      + priorityPoints(row['Current Priority']) * 2
      + convictionPoints(row['Current Conviction']) * 2
      + (thesis ? statusPoints(thesis.signalStatus) * 2 : 0);

    views.push({
      id: `momentum-${slugify(thesisName)}`,
      lens: 'Conviction Momentum Before Upgrade',
      posture: 'opportunity',
      score,
      symbols: thesis ? uniqueValues([thesis.primarySymbol, ...thesis.catalystRows.map(r => r.Symbol)]).filter(Boolean).slice(0, 5) : [],
      thesis: thesisName,
      sector: sectorFromThesisName(thesisName),
      claim: `${thesisName} is showing positive signal momentum before the current conviction/priority fields fully reflect it.`,
      whyUnique: 'The conviction-delta layer catches changes in evidence flow rather than only current conviction, which can surface early research before the dashboard upgrades it.',
      confirms: [
        `Net score: ${row['Net Score']}`,
        `Suggested action: ${row['Suggested Action'] || 'N/A'}`,
        thesis ? `Full-picture status: ${thesis.signalStatus}, ${thesis.structuralView}/${thesis.tacticalView}` : null,
      ].filter(Boolean),
      cautions: [
        thesis?.coverageGapCount > 0 ? `${thesis.coverageGapCount} coverage gap(s) remain.` : null,
        row['Signals'] === '1' ? 'Signal count is still thin.' : null,
      ].filter(Boolean),
      nextSteps: [
        'Open the signal note and identify whether the evidence is repeatable or one-off.',
        'Refresh the related thesis full-picture report after the next sector scan.',
        'Promote only if a second independent data source confirms the move.',
      ],
      evidenceLinks: uniqueValues([data.convictionDelta ? filePathToWikiLink(data.convictionDelta.path) : null, thesis?.noteLink]),
    });
  }

  return views;
}

function buildRiskAndAvoidViews(data) {
  const views = [];

  for (const sector of data.detailedSectorReports) {
    const rows = sector.valuationRows.slice(0, 3);
    if (rows.length === 0) continue;

    const score = 10
      + statusPoints(sector.signalStatus) * 5
      + rows.length * 3
      + Math.min(8, sector.technicalNonclearCount);

    views.push({
      id: `valuation-risk-${slugify(sector.sector)}`,
      lens: 'Do-Not-Chase / Pair-Trade Watch',
      posture: 'risk-first',
      score,
      symbols: rows.map(row => extractSymbol(row.Ticker)).filter(Boolean),
      thesis: sector.sector,
      sector: sector.sector,
      claim: `${sector.sector} contains valuation-stretch names while the sector tape is non-clear, making it a useful avoid or pair-trade list.`,
      whyUnique: 'The negative view combines valuation stretch with current technical stress instead of relying on a single expensive-multiple screen.',
      confirms: [
        `Sector status: ${sector.signalStatus}`,
        `Stretch names: ${rows.map(row => `${extractSymbol(row.Ticker)} ${row.Stretch || row.Multiple}`).join(', ')}`,
      ],
      cautions: [
        'This is a risk-control view, not a standalone short thesis.',
        'Confirm borrow, catalyst timing, and index/sector exposure before using it as a hedge idea.',
      ],
      nextSteps: [
        'Compare stretched names against cheaper high-quality peers in the same detailed sector report.',
        'Check whether earnings or a disclosure catalyst could invalidate the valuation view.',
      ],
      evidenceLinks: uniqueValues([sector.noteLink]),
    });
  }

  const riskSignals = data.signalNotes
    .filter(note => /dilution|raise|termination|spike/i.test(note.title + ' ' + note.filename))
    .sort((a, b) =>
      riskSignalWeight(b) - riskSignalWeight(a) ||
      noteDate(b.note).localeCompare(noteDate(a.note))
    );

  for (const signal of riskSignals) {
    views.push({
      id: `signal-risk-${slugify(signal.filename)}`,
      lens: 'Risk Signal First',
      posture: 'risk-first',
      score: 18 + statusPoints(signal.signalStatus) * 6 + riskSignalWeight(signal),
      symbols: extractSignalSymbols(signal),
      thesis: signal.title,
      sector: 'risk',
      claim: `${signal.title} is a live risk signal that should constrain any related opportunity work.`,
      whyUnique: 'Risk signals often explain why a seemingly cheap or newsy opportunity deserves a smaller sizing assumption or no action.',
      confirms: [`Signal status: ${signal.signalStatus}`],
      cautions: ['Treat as a blocker until the underlying filing or event is resolved.'],
      nextSteps: [
        'Open the source signal and identify the exact filing or data row behind it.',
        'Check whether the same ticker appears in catalyst, disclosure, or sector queues.',
      ],
      evidenceLinks: uniqueValues([signal.noteLink]),
    });
  }

  return views;
}

function buildOpportunityNote({ data, selected, since, windowDays, signalStatus, filters }) {
  const sourceCounts = buildSourceCounts(data);
  const signals = selected.length > 0
    ? uniqueValues([
        'OPPORTUNITY_VIEWPOINTS',
        selected.some(view => view.posture === 'risk-first') ? 'RISK_VIEWPOINTS' : null,
        selected.some(view => view.lens === 'Disclosure Confirmation Wedge') ? 'DISCLOSURE_CONFIRMATION' : null,
      ])
    : [];

  return buildNote({
    frontmatter: {
      title: 'Opportunity Viewpoints',
      source: 'Combination Reporting System',
      date_pulled: today(),
      domain: 'theses',
      data_type: 'opportunity_viewpoints',
      frequency: 'on-demand',
      signal_status: signalStatus,
      signals,
      window_days: windowDays,
      window_from: since,
      viewpoints_found: selected.length,
      thesis_filter: filters.thesisFilter || null,
      sector_filter: filters.sectorFilter || null,
      long_only: filters.longOnly,
      tags: ['opportunity-viewpoints', 'synthesis', 'thesis', 'market', 'sec', 'sector'],
    },
    sections: [
      {
        heading: 'Operator Summary',
        content: buildOperatorSummary(selected, data),
      },
      {
        heading: 'Viewpoint Queue',
        content: selected.length
          ? buildTable(
              ['Score', 'Lens', 'Posture', 'Symbols', 'Thesis / Sector', 'Why This Exists', 'Evidence'],
              selected.map(view => [
                String(Math.round(view.score)),
                view.lens,
                view.posture,
                view.symbols.length ? view.symbols.map(s => `[[${s}]]`).join(', ') : 'N/A',
                [view.thesis, view.sector].filter(Boolean).join(' / '),
                view.claim,
                view.evidenceLinks.join(', ') || 'N/A',
              ])
            )
          : '_No viewpoints met the current filters._',
      },
      {
        heading: 'Viewpoint Cards',
        content: selected.length
          ? selected.map(formatViewpointCard).join('\n\n')
          : '_No viewpoint cards generated._',
      },
      {
        heading: 'Cross-Source Coverage',
        content: buildTable(
          ['Source Layer', 'Rows / Notes', 'How It Was Used'],
          sourceCounts.map(row => [row.layer, String(row.count), row.use])
        ),
      },
      {
        heading: 'Method',
        content: [
          'This report looks for overlaps, contradictions, and timing gaps across local pull notes.',
          '',
          buildTable(
            ['Lens', 'What It Combines', 'Interpretation'],
            [
              ['Disclosure Confirmation Wedge', 'EDGAR disclosure reality + catalyst notes + thesis context', 'A filing is interesting only if outside evidence can confirm economics.'],
              ['Strong Thesis, Bad Tape', 'Full-picture structural view + technical/catalyst stress', 'Potential dislocation, but entries need confirmation.'],
              ['Stressed Sector Small-Cap Queue', 'Detailed sector report + small-cap screen + SEC pulse', 'Research queue for names where sector stress may hide idiosyncratic setups.'],
              ['Conviction Momentum Before Upgrade', 'Conviction delta + thesis report', 'Evidence flow is improving before the thesis state fully upgrades.'],
              ['Do-Not-Chase / Pair-Trade Watch', 'Valuation stretch + sector tape stress + signals', 'Risk-control or hedge viewpoint, not a standalone short call.'],
            ]
          ),
        ].join('\n'),
      },
      {
        heading: 'Source Notes',
        content: buildSourceNoteList(data),
      },
    ],
  });
}

function buildOperatorSummary(selected, data) {
  if (selected.length === 0) {
    return [
      `- Window: ${data.since} through ${today()}`,
      '- No cross-source viewpoints passed the active filters.',
      '- Run the daily routine, disclosure-reality, and thesis full-picture reports to refresh the input layers.',
    ].join('\n');
  }

  const top = selected[0];
  const lensCounts = countBy(selected, view => view.lens);
  const postureCounts = countBy(selected, view => view.posture);

  return [
    `- **Window**: ${data.since} through ${today()}`,
    `- **Top Viewpoint**: ${top.lens} - ${top.claim}`,
    `- **Lens Mix**: ${[...lensCounts.entries()].map(([k, v]) => `${k} ${v}`).join('; ')}`,
    `- **Posture Mix**: ${[...postureCounts.entries()].map(([k, v]) => `${k} ${v}`).join('; ')}`,
    `- **Data Base**: ${data.allPullNotes.length} pull notes and ${data.signalNotes.length} signal notes inside the window.`,
    '- **Use**: Treat this as a research map, not a buy list. Each viewpoint needs the listed confirmation step before it graduates.',
  ].join('\n');
}

function formatViewpointCard(view) {
  return [
    `### ${view.lens}: ${view.symbols.length ? view.symbols.join(', ') : view.thesis}`,
    '',
    `- **Score**: ${Math.round(view.score)}`,
    `- **Posture**: ${view.posture}`,
    `- **Thesis / Sector**: ${[view.thesis, view.sector].filter(Boolean).join(' / ') || 'N/A'}`,
    `- **Claim**: ${view.claim}`,
    `- **Why Unique**: ${view.whyUnique}`,
    '',
    '**Confirms**',
    ...view.confirms.map(line => `- ${line}`),
    '',
    '**Cautions**',
    ...(view.cautions.length ? view.cautions.map(line => `- ${line}`) : ['- No explicit caution generated by the current local data.']),
    '',
    '**Next Work**',
    ...view.nextSteps.map(line => `- [ ] ${line}`),
    '',
    `**Evidence**: ${view.evidenceLinks.join(', ') || 'N/A'}`,
  ].join('\n');
}

function buildSourceCounts(data) {
  return [
    { layer: 'Thesis full-picture reports', count: data.thesisReports.length, use: 'Structural/tactical state, watchlist symbols, catalyst maps.' },
    { layer: 'Catalyst notes', count: data.catalystNotes.length, use: 'Symbol timing, earnings window, technical state.' },
    { layer: 'Disclosure reality rows', count: data.disclosureRows.length, use: 'Promising 8-K queue and counterparty-confirmation setup.' },
    { layer: 'Detailed sector reports', count: data.detailedSectorReports.length, use: 'Sector stress, small-cap queues, valuation stretch.' },
    { layer: 'Conviction delta rows', count: data.convictionRows.length, use: 'Evidence-flow changes before thesis upgrades.' },
    { layer: 'Dilution monitor rows', count: data.dilutionRows.length, use: 'Financing-risk overlay and coverage gaps.' },
    { layer: 'Signal notes', count: data.signalNotes.length, use: 'Risk and confirmation overlays.' },
    { layer: 'All pull notes in window', count: data.allPullNotes.length, use: 'Coverage base across market, macro, sectors, government, research, and fundamentals.' },
  ];
}

function buildSourceNoteList(data) {
  const links = uniqueValues([
    data.sectorIndex ? filePathToWikiLink(data.sectorIndex.path) : null,
    data.convictionDelta ? filePathToWikiLink(data.convictionDelta.path) : null,
    data.disclosureReality ? filePathToWikiLink(data.disclosureReality.path) : null,
    data.dilutionMonitor ? filePathToWikiLink(data.dilutionMonitor.path) : null,
    data.capitalRaise ? filePathToWikiLink(data.capitalRaise.path) : null,
    ...data.thesisReports.slice(0, 12).map(note => note.noteLink),
    ...data.detailedSectorReports.slice(0, 12).map(note => note.noteLink),
  ]);

  return links.length ? links.map(link => `- ${link}`).join('\n') : '- No source notes found.';
}

function buildThesisContext(note) {
  const tables = parseAllMarkdownTables(note.content);
  const catalystTable = findTable(tables, ['Symbol', 'Urgency', 'Signal', 'Tech']);
  const fundamentalTable = findTable(tables, ['Symbol', 'Coverage', 'P/E', 'EV/Sales']);
  const name = String(note.data?.thesis_name || note.filename.replace(/^\d{4}-\d{2}-\d{2}_Thesis_Full_Picture_/, '').replace(/\.md$/i, ''));

  return {
    note,
    name,
    noteLink: filePathToWikiLink(note.path),
    primarySymbol: normalizeSymbol(note.data?.primary_symbol),
    allocationPriority: normalizeText(note.data?.allocation_priority),
    conviction: normalizeText(note.data?.conviction),
    monitorStatus: normalizeText(note.data?.monitor_status),
    signalStatus: normalizeText(note.data?.signal_status) || 'clear',
    structuralView: normalizeText(note.data?.structural_view) || 'unknown',
    tacticalView: normalizeText(note.data?.tactical_view) || 'unknown',
    technicalStatus: normalizeText(note.data?.technical_status) || 'unknown',
    technicalBias: normalizeText(note.data?.technical_bias) || 'unknown',
    coverageGapCount: Number(note.data?.coverage_gap_count || 0),
    catalystRows: (catalystTable?.rows || []).map(cleanRowSymbols),
    fundamentalRows: (fundamentalTable?.rows || []).map(cleanRowSymbols),
  };
}

function buildCatalystContext(note) {
  return {
    note,
    symbol: normalizeSymbol(note.data?.symbol) || symbolFromFilename(note.filename),
    noteLink: filePathToWikiLink(note.path),
    primaryThesis: cleanWiki(note.data?.primary_thesis || ''),
    signalStatus: normalizeText(note.data?.signal_status) || 'clear',
    technicalStatus: normalizeText(note.data?.technical_status) || 'unknown',
    technicalBias: normalizeText(note.data?.technical_bias) || 'unknown',
    momentumState: normalizeText(note.data?.momentum_state) || 'unknown',
    urgency: normalizeText(note.data?.catalyst_urgency) || 'unknown',
    catalystScore: Number(note.data?.catalyst_score || 0),
    nextEarningsDate: String(note.data?.next_earnings_date || ''),
  };
}

function buildSectorContext(note) {
  const tables = parseAllMarkdownTables(note.content);
  return {
    note,
    sector: String(note.data?.sector || note.filename).replace(/\.md$/i, ''),
    noteLink: filePathToWikiLink(note.path),
    signalStatus: normalizeText(note.data?.signal_status) || 'clear',
    structuralView: extractBulletValue(note.content, 'Structural / Tactical').split('/')[0]?.trim().toLowerCase() || 'unknown',
    tacticalView: extractBulletValue(note.content, 'Structural / Tactical').split('/')[1]?.trim().toLowerCase() || 'unknown',
    technicalNonclearCount: Number(note.data?.technical_nonclear_count || 0),
    watchlistSymbolCount: Number(note.data?.watchlist_symbol_count || 0),
    secFilingCount: Number(note.data?.sec_filing_count || 0),
    microRows: (findTable(tables, ['Sector', 'Tier', 'Ticker', 'Score', 'Quality'])?.rows || []).map(cleanRowSymbols),
    valuationRows: (findTable(tables, ['Sector', 'Cap', 'Mkt Cap', 'Ticker', 'Multiple', 'Stretch'])?.rows || []).map(cleanRowSymbols),
  };
}

function buildSignalContext(note) {
  return {
    note,
    filename: note.filename,
    title: String(note.data?.title || note.filename.replace(/\.md$/i, '')),
    noteLink: filePathToWikiLink(note.path),
    signalStatus: normalizeText(note.data?.signal_status) || normalizeText(note.data?.severity) || 'watch',
    content: note.content,
  };
}

function parseDisclosureRows(note) {
  const table = parseFirstTableInSection(note.content, 'Executive Queue');
  if (!table) return [];

  return table.rows.map(row => ({
    symbol: extractSymbol(row.Ticker),
    score: numberFrom(row.Score),
    tier: row.Tier || '',
    theme: cleanWiki(row.Theme || ''),
    filed: row.Filed || '',
    items: row.Items || '',
    whyRead: row['Why Read'] || '',
    edgar: row.EDGAR || '',
    noteLink: filePathToWikiLink(note.path),
  })).filter(row => row.symbol);
}

function parseConvictionRows(note) {
  const table = parseFirstTableInSection(note.content, 'Conviction Momentum');
  return table ? table.rows : [];
}

function parseDilutionRows(note) {
  const table = parseFirstTableInSection(note.content, 'Dilution Risk Scorecard');
  if (!table) return [];

  return table.rows.map(row => {
    const symbol = extractSymbol(row.Ticker);
    const triggers = String(row.Triggers || '');
    const risk = String(row.Risk || '');
    return {
      symbol,
      risk,
      triggers,
      hasRisk: /critical|high|medium|error|warning|⚠/i.test(`${risk} ${triggers}`),
      noteLink: filePathToWikiLink(note.path),
    };
  }).filter(row => row.symbol);
}

function buildSymbolToTheses(thesisReports) {
  const map = new Map();

  for (const thesis of thesisReports) {
    const symbols = uniqueValues([
      thesis.primarySymbol,
      ...thesis.catalystRows.map(row => row.Symbol),
      ...thesis.fundamentalRows.map(row => row.Symbol),
    ]).filter(Boolean);

    for (const symbol of symbols) {
      const list = map.get(symbol) || [];
      list.push(thesis);
      map.set(symbol, list);
    }
  }

  return map;
}

function resolvePrimaryThesisForSymbol(symbol, data, catalyst) {
  if (catalyst?.primaryThesis && data.thesisByName.has(catalyst.primaryThesis)) {
    return data.thesisByName.get(catalyst.primaryThesis);
  }
  const theses = data.symbolToTheses.get(symbol) || [];
  return theses.sort((a, b) =>
    priorityPoints(b.allocationPriority) - priorityPoints(a.allocationPriority) ||
    convictionPoints(b.conviction) - convictionPoints(a.conviction)
  )[0] || null;
}

function resolveSectorForSymbol(symbol, data, thesis) {
  for (const sector of data.detailedSectorReports) {
    const allSymbols = [
      ...sector.microRows.map(row => extractSymbol(row.Ticker)),
      ...sector.valuationRows.map(row => extractSymbol(row.Ticker)),
    ];
    if (allSymbols.includes(symbol)) return sector.sector;
  }
  return thesis ? sectorFromThesisName(thesis.name) : '';
}

function parseAllMarkdownTables(content) {
  const tables = [];
  const lines = String(content || '').split(/\r?\n/);
  let currentHeading = '';

  for (let i = 0; i < lines.length; i += 1) {
    const heading = lines[i].match(/^(#{2,4})\s+(.+)$/);
    if (heading) currentHeading = heading[2].trim();

    if (!isTableLine(lines[i]) || !isSeparatorLine(lines[i + 1])) continue;

    const tableLines = [lines[i], lines[i + 1]];
    let cursor = i + 2;
    while (cursor < lines.length && isTableLine(lines[cursor])) {
      tableLines.push(lines[cursor]);
      cursor += 1;
    }
    const parsed = parseTableLines(tableLines);
    if (parsed) tables.push({ heading: currentHeading, ...parsed });
    i = cursor - 1;
  }

  return tables;
}

function parseFirstTableInSection(content, sectionName) {
  const tables = parseAllMarkdownTables(content);
  return tables.find(table => normalizeText(table.heading) === normalizeText(sectionName)) || null;
}

function findTable(tables, requiredHeaders) {
  return tables.find(table => requiredHeaders.every(header => table.headers.includes(header))) || null;
}

function parseTableLines(lines) {
  if (!Array.isArray(lines) || lines.length < 2) return null;
  const headers = splitTableRow(lines[0]);
  const rows = lines.slice(2)
    .map(line => splitTableRow(line))
    .filter(values => values.some(Boolean))
    .map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
  return { headers, rows };
}

function splitTableRow(line) {
  return String(line || '')
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim().replace(/\\\|/g, '|'));
}

function isTableLine(line) {
  return /^\|.*\|$/.test(String(line || '').trim());
}

function isSeparatorLine(line) {
  return isTableLine(line) && splitTableRow(line).every(cell => /^:?-{3,}:?$/.test(cell));
}

function latestBy(notes, keyFn) {
  const latest = new Map();
  for (const note of notes) {
    const key = keyFn(note);
    const current = latest.get(key);
    if (!current || compareNotes(note, current) < 0) latest.set(key, note);
  }
  return [...latest.values()];
}

function latestNote(notes) {
  return [...notes].sort(compareNotes)[0] || null;
}

function compareNotes(left, right) {
  const dateDiff = String(noteDate(right)).localeCompare(String(noteDate(left)));
  if (dateDiff !== 0) return dateDiff;
  return String(right.filename || '').localeCompare(String(left.filename || ''));
}

function compareViewpoints(left, right) {
  return right.score - left.score || left.lens.localeCompare(right.lens) || left.claim.localeCompare(right.claim);
}

function dedupeViewpoints(views) {
  const seen = new Set();
  const out = [];
  for (const view of views) {
    const key = `${view.lens}:${view.symbols.join(',')}:${view.thesis}`;
    if (seen.has(key)) continue;
    seen.add(key);
    view.evidenceText = [
      view.lens,
      view.posture,
      view.symbols.join(' '),
      view.thesis,
      view.sector,
      view.claim,
      view.confirms.join(' '),
      view.cautions.join(' '),
    ].join(' ');
    out.push(view);
  }
  return out;
}

function selectDiverseViewpoints(viewpoints, limit) {
  const selected = [];
  const selectedIds = new Set();
  const lensOrder = [
    'Disclosure Confirmation Wedge',
    'Strong Thesis, Bad Tape',
    'Stressed Sector Small-Cap Queue',
    'Conviction Momentum Before Upgrade',
    'Do-Not-Chase / Pair-Trade Watch',
    'Risk Signal First',
  ];

  for (const lens of lensOrder) {
    const perLensLimit = lens === 'Strong Thesis, Bad Tape' ? 3 : 2;
    for (const view of viewpoints.filter(item => item.lens === lens).slice(0, perLensLimit)) {
      if (selected.length >= limit) break;
      selected.push(view);
      selectedIds.add(view.id);
    }
  }

  for (const view of viewpoints) {
    if (selected.length >= limit) break;
    if (selectedIds.has(view.id)) continue;
    selected.push(view);
    selectedIds.add(view.id);
  }

  return selected.sort(compareViewpoints);
}

function classifySignalStatus(views) {
  if (views.some(view => view.score >= 45)) return 'alert';
  if (views.some(view => view.score >= 28)) return 'watch';
  return views.length ? 'watch' : 'clear';
}

function noteDate(note) {
  const date = String(note?.data?.date_pulled || note?.data?.date || '').trim();
  const filenameDate = String(note?.filename || '').match(/^(\d{4}-\d{2}-\d{2})/);
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  return filenameDate ? filenameDate[1] : '0000-00-00';
}

function filePathToWikiLink(filePath) {
  const vaultRoot = getVaultRoot();
  const rel = relative(vaultRoot, filePath).split(sep).join('/');
  const base = rel.split('/').pop()?.replace(/\.md$/i, '') || rel;
  return `[[${base}]]`;
}

function normalizeSymbol(value) {
  const symbol = extractSymbol(value);
  return symbol || null;
}

function extractSymbol(value) {
  const text = cleanWiki(value).trim();
  const tickerMatch = text.match(/[A-Z][A-Z0-9._-]{0,5}/);
  return tickerMatch ? tickerMatch[0].replace('.', '_') : '';
}

function extractSymbols(value) {
  const symbols = new Set();
  for (const match of String(value || '').toUpperCase().matchAll(/\b[A-Z][A-Z0-9._-]{1,5}\b/g)) {
    if (!COMMON_WORDS.has(match[0])) symbols.add(match[0].replace('.', '_'));
  }
  return [...symbols];
}

function extractSignalSymbols(signal) {
  const symbols = new Set();
  const filename = String(signal.filename || '').toUpperCase().replace(/\.MD$/i, '');
  const filenameTicker = filename.match(/(?:DILUTION|RAISE|TERMINATION)_([A-Z][A-Z0-9_-]{1,5})(?:_|$)/);
  if (filenameTicker) symbols.add(filenameTicker[1].replace('.', '_'));

  for (const match of String(signal.content || '').matchAll(/\[\[([A-Z][A-Z0-9._-]{1,5})\]\]/g)) {
    if (!COMMON_WORDS.has(match[1])) symbols.add(match[1].replace('.', '_'));
  }

  for (const match of String(signal.content || '').matchAll(/\$([A-Z][A-Z0-9._-]{1,5})\b/g)) {
    if (!COMMON_WORDS.has(match[1])) symbols.add(match[1].replace('.', '_'));
  }

  return [...symbols].slice(0, 5);
}

function cleanWiki(value) {
  return String(value || '')
    .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\[+|\]+$/g, '')
    .trim();
}

function cleanRowSymbols(row) {
  const out = { ...row };
  for (const key of ['Symbol', 'Ticker', 'Thesis']) {
    if (out[key]) out[key] = key === 'Thesis' ? cleanWiki(out[key]) : extractSymbol(out[key]);
  }
  return out;
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function numberFrom(value) {
  const match = String(value || '').replace(/,/g, '').match(/[-+]?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function priorityPoints(value) {
  return PRIORITY_SCORE[normalizeText(value)] || 0;
}

function convictionPoints(value) {
  return CONVICTION_SCORE[normalizeText(value)] || 0;
}

function statusPoints(value) {
  return SIGNAL_SCORE[normalizeText(value)] || 0;
}

function uniqueValues(values) {
  return [...new Set(values.filter(value => value !== null && value !== undefined && String(value).trim() !== ''))];
}

function countBy(values, fn) {
  const counts = new Map();
  for (const value of values) {
    const key = fn(value);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

function extractBulletValue(content, label) {
  const re = new RegExp(`^- \\*\\*${escapeRegExp(label)}\\*\\*: (.+)$`, 'im');
  const match = String(content || '').match(re);
  return match ? match[1].trim() : '';
}

function sectorFromThesisName(name) {
  const text = String(name || '').toLowerCase();
  if (/defense|drone|hypersonic|space|aerospace/.test(text)) return 'Aerospace & Defense';
  if (/semiconductor|quantum|tech|humanoid|ai/.test(text)) return 'Tech';
  if (/battery|grid|nuclear|power|energy/.test(text)) return 'Energy / Utilities';
  if (/housing|real estate/.test(text)) return 'Real Estate';
  if (/amr|psychedelic|glp|gene|alzheim|longevity|bio/.test(text)) return 'Healthcare';
  if (/hard money|dollar|fiscal|bitcoin|gold/.test(text)) return 'Macro / Hard Assets';
  return 'cross-sector';
}

function symbolFromFilename(filename) {
  const match = String(filename || '').match(/Catalyst_([A-Z0-9._-]+)/i);
  return match ? match[1].replace(/\.md$/i, '').toUpperCase().replace('.', '_') : '';
}

function riskSignalWeight(signal) {
  const text = `${signal.title} ${signal.filename}`.toLowerCase();
  if (/dilution|raise|offering|termination/.test(text)) return 12;
  if (/spike/.test(text)) return 4;
  return 0;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const COMMON_WORDS = new Set([
  'THE', 'AND', 'FOR', 'WITH', 'THIS', 'THAT', 'NOTE', 'RISK', 'WATCH', 'ALERT',
  'SIGNAL', 'FEMA', 'SEC', 'EDGAR', 'FMP', 'API', 'DATA', 'PULL', 'MARKET',
]);
