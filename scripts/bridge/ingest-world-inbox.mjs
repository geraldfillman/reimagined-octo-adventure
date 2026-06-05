/**
 * ingest-world-inbox.mjs
 *
 * Converts processable World_Machine/_Inbox markdown files into a dated batch
 * observation and archives the originals. It deliberately writes one synthesis
 * note instead of pretending to fully canonicalize every clipping.
 *
 * Usage: node run.mjs bridge ingest-world-inbox [--dry-run] [--date YYYY-MM-DD]
 *        node run.mjs bridge ingest-world-inbox --from-archive --date YYYY-MM-DD
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';

import { getEngineRoot, getWorldMachineRoot } from '../lib/config.mjs';
import {
  buildConnectionCandidates,
  renderConnectionCandidatesSection,
  renderMermaidConnectionMap,
  renderPlotlyEventConnectionsHtml,
} from '../lib/inbox-event-connections.mjs';

const INFRA_FILES = new Set([
  '_Inbox README.md',
  'Inbox Ingestion Runbook.md',
  'Inbox Topic Map.md',
  'INGESTION_CONTRACT.md',
  'Market Positioning Ledger.md',
  'Market Positioning Ledger - Positions.md',
  'Market Positioning Ledger - Discard Log.md',
]);

const TREND_DEFINITIONS = [
  {
    id: 'market-structure-vs-fundamentals',
    label: 'Market Structure Vs Fundamentals',
    keywords: ['market mechanics', 'spotgamma', 'flowpatrol', 'rally', 'risk regimes', 'equity multiples', 'volatility', 'gamma'],
    read: 'Flow, positioning, and risk-regime evidence should be checked against earnings and macro fundamentals before upgrading conviction.',
    scenarios: ['ai-data-center-power-bottleneck', 'copper-supply-bottleneck'],
    commands: [
      'node run.mjs pull event-research --scenario ai-data-center-power-bottleneck --dry-run',
      'node run.mjs pull event-research --scenario copper-supply-bottleneck --dry-run',
    ],
  },
  {
    id: 'rates-bonds-inflation-expectations',
    label: 'Rates, Bonds, And Inflation Expectations',
    keywords: ['fed', 'yield', 'yields', 'rates', 'bond', 'duration', 'inflation', 'cpi', 'housing inflation', 'inflation expectations'],
    read: 'Rates and inflation clips connect to duration risk, housing affordability, consumer pressure, and commodity shock pass-through.',
    scenarios: ['fertilizer-shortage', 'hormuz-oil-shock', 'glp1-supply-chain-shortage'],
    commands: [
      'node run.mjs pull event-research --scenario fertilizer-shortage --dry-run',
      'node run.mjs pull event-research --scenario hormuz-oil-shock --dry-run',
      'node run.mjs pull event-research --scenario glp1-supply-chain-shortage --dry-run',
    ],
  },
  {
    id: 'policy-legal-friction',
    label: 'Policy, Legal, And Liability Friction',
    keywords: ['supreme court', 'court', 'liability', 'broker', 'freight broker', 'regulation', 'regulatory', 'policy'],
    read: 'Legal and regulatory changes can alter transport, insurance, margin, and operating-risk assumptions before fundamentals reflect them.',
    scenarios: ['hormuz-oil-shock', 'fertilizer-shortage'],
    commands: [
      'node run.mjs pull event-research --scenario hormuz-oil-shock --dry-run',
      'node run.mjs scan sectors --sector industrials --dry-run',
    ],
  },
  {
    id: 'geopolitics-capital-access',
    label: 'Geopolitics And Capital Access',
    keywords: ['mideast', 'middle east', 'iran', 'sanction', 'capital flows', 'kushner', 'sovereign', 'hostilities'],
    read: 'Geopolitical capital-flow stories can become funding, energy, tourism, defense, or sanction-risk transmission channels.',
    scenarios: ['hormuz-oil-shock'],
    commands: [
      'node run.mjs pull event-research --scenario hormuz-oil-shock --dry-run',
      'node run.mjs scan sectors --sector energy --dry-run',
    ],
  },
  {
    id: 'healthcare-pricing-and-policy',
    label: 'Healthcare Pricing And Policy Pressure',
    keywords: ['hospital', 'healthcare', 'medical', 'drug', 'pharma', 'prices', 'consumer prices'],
    read: 'Healthcare price pressure links CPI, payer politics, hospital margins, drug access, and policy risk.',
    scenarios: ['glp1-supply-chain-shortage'],
    commands: [
      'node run.mjs pull event-research --scenario glp1-supply-chain-shortage --dry-run',
      'node run.mjs scan sectors --sector healthcare --dry-run',
    ],
  },
  {
    id: 'power-grid-industrial-capex',
    label: 'Power, Grid, And Industrial Capex',
    keywords: ['power demand', 'grid', 'electricity', 'gev', 'data center', 'transformer', 'utility', 'generation', 'power bottleneck'],
    read: 'Power-demand clips connect AI load growth, grid equipment, copper, utilities, and industrial capex bottlenecks.',
    scenarios: ['ai-data-center-power-bottleneck', 'copper-supply-bottleneck'],
    commands: [
      'node run.mjs pull event-research --scenario ai-data-center-power-bottleneck --dry-run',
      'node run.mjs pull event-research --scenario copper-supply-bottleneck --dry-run',
    ],
  },
  {
    id: 'ai-infrastructure-vocabulary',
    label: 'AI Infrastructure Vocabulary And Compute Bottlenecks',
    keywords: [
      'neocloud', 'photonics', 'optical interconnect', 'optical interconnects', 'optical networking',
      'co-packaged optics', 'silicon photonics', 'gpu cluster', 'gpu clusters', 'ai compute', 'compute capacity',
      'data center power', 'power density',
    ],
    read: 'Emerging AI infrastructure vocabulary should be checked against compute capacity, optical networking, and data-center power bottlenecks before promoting a thesis update.',
    scenarios: ['ai-data-center-power-bottleneck', 'copper-supply-bottleneck'],
    commands: [
      'node run.mjs pull event-research --scenario ai-data-center-power-bottleneck --dry-run',
      'node run.mjs pull disclosure-reality --forms material,periodic,capital --lookback 120 --dry-run',
    ],
  },
  {
    id: 'socioeconomic-narrative-risk',
    label: 'Socioeconomic Narrative Risk',
    keywords: ['wealth', 'poverty', 'inequality', 'labor', 'consumer', 'political', 'narrative'],
    read: 'Narrative and distributional stress is a regime context input; treat it as a catalyst amplifier until confirmed by policy, spending, or market data.',
    scenarios: [],
    commands: [
      'node run.mjs pull signal-intelligence --scope all --dry-run',
    ],
  },
];

export async function run(flags = {}) {
  const dryRun = Boolean(flags.dryRun ?? flags['dry-run']);
  const fromArchive = Boolean(flags.fromArchive ?? flags['from-archive']);
  const updateExisting = Boolean(flags.updateExisting ?? flags['update-existing']);
  const eventConnectionsEnabled = !Boolean(flags.noEventConnections ?? flags['no-event-connections']);
  const plotlyEnabled = !Boolean(flags.noPlotly ?? flags['no-plotly']);
  const connectionLimit = Math.max(1, Number(flags.connectionLimit ?? flags['connection-limit']) || 12);
  const date = String(flags.date || new Date().toISOString().slice(0, 10)).slice(0, 10);
  const worldRoot = flags.worldRoot || flags['world-root']
    ? resolve(String(flags.worldRoot || flags['world-root']))
    : getWorldMachineRoot();
  const engineRoot = flags.engineRoot || flags['engine-root']
    ? resolve(String(flags.engineRoot || flags['engine-root']))
    : getEngineRoot();

  const inboxRoot = join(worldRoot, '_Inbox');
  const archiveRoot = join(worldRoot, '500-archive', 'Inbox', date);
  const visualArtifactRelPath = `500-archive/Inbox/Event_Connections/${date}_Inbox_Event_Connections.html`;
  const visualArtifactPath = plotlyEnabled && eventConnectionsEnabled
    ? join(worldRoot, ...visualArtifactRelPath.split('/'))
    : null;
  const baseObservationRelPath = inboxObservationRelPath(date);
  const baseObservationPath = join(worldRoot, ...baseObservationRelPath.split('/'));
  const observationPath = updateExisting ? baseObservationPath : uniqueObservationPath(baseObservationPath);

  const inboxItems = fromArchive ? collectArchiveItems(archiveRoot) : collectInboxItems(inboxRoot);
  const trendSynthesis = buildTrendSynthesis(inboxItems);
  const localEvidence = eventConnectionsEnabled ? collectLocalEvidence(engineRoot, date) : [];
  const eventConnectionCandidates = eventConnectionsEnabled
    ? buildConnectionCandidates({
      date,
      items: inboxItems,
      trends: trendSynthesis.trends,
      localEvidence,
      limit: connectionLimit,
    })
    : [];
  const summary = {
    source: 'ingest-world-inbox',
    dryRun,
    fromArchive,
    date,
    worldRoot,
    engineRoot,
    processed: inboxItems.length,
    trendCount: trendSynthesis.trends.length,
    relatedScenarios: trendSynthesis.relatedScenarios,
    eventConnectionCount: eventConnectionCandidates.length,
    newEventCandidateCount: eventConnectionCandidates.filter(candidate => candidate.candidate_type === 'emerging_event_candidate').length,
    eventConnectionCandidates,
    observationPath,
    archiveRoot,
    visualArtifactPath,
    archived: [],
  };

  if (inboxItems.length === 0) {
    const sourceRoot = fromArchive ? archiveRoot : inboxRoot;
    console.log(`[ingest-world-inbox] No processable inbox files found in ${sourceRoot}`);
    return summary;
  }

  const observation = buildObservation({
    date,
    items: inboxItems,
    inboxRoot,
    worldRoot,
    archiveRoot,
    observationPath,
    trendSynthesis,
    eventConnectionsEnabled,
    eventConnectionCandidates,
    visualArtifactRelPath,
    visualArtifactPath,
  });

  console.log(`[ingest-world-inbox] ${dryRun ? '[dry-run] ' : ''}${fromArchive ? 'archived' : 'processable'} files: ${inboxItems.length}`);
  console.log(`[ingest-world-inbox] ${dryRun ? '[dry-run] ' : ''}event trend clusters: ${trendSynthesis.trends.length}`);
  if (eventConnectionsEnabled) {
    console.log(`[ingest-world-inbox] ${dryRun ? '[dry-run] ' : ''}event connection candidates: ${eventConnectionCandidates.length}`);
  }
  console.log(`[ingest-world-inbox] ${dryRun ? '[dry-run] would write' : 'writing'} ${observationPath}`);

  if (!dryRun) {
    mkdirSync(dirname(observationPath), { recursive: true });
    writeFileSync(observationPath, observation, 'utf-8');
    if (visualArtifactPath && eventConnectionCandidates.length > 0) {
      mkdirSync(dirname(visualArtifactPath), { recursive: true });
      writeFileSync(visualArtifactPath, renderPlotlyEventConnectionsHtml({
        date,
        candidates: eventConnectionCandidates,
      }), 'utf-8');
    }
  }

  if (fromArchive) {
    console.log(`[ingest-world-inbox] Done - rebuilt from archive: ${summary.processed}, archived: 0`);
    return summary;
  }

  for (const item of inboxItems) {
    const archivePath = uniqueArchivePath(join(archiveRoot, item.relativePath));
    console.log(`[ingest-world-inbox] ${dryRun ? '[dry-run] would archive' : 'archiving'} ${item.relativePath} -> ${toSlash(relative(worldRoot, archivePath))}`);
    if (!dryRun) {
      mkdirSync(dirname(archivePath), { recursive: true });
      renameSync(item.path, archivePath);
      summary.archived.push(archivePath);
    }
  }

  console.log(`[ingest-world-inbox] Done - processed: ${summary.processed}, archived: ${summary.archived.length}`);
  return summary;
}

function collectArchiveItems(archiveRoot) {
  if (!existsSync(archiveRoot)) return [];
  return collectMarkdownFiles(archiveRoot)
    .map(filePath => {
      const raw = readFileSync(filePath, 'utf-8');
      return {
        path: filePath,
        relativePath: toSlash(relative(archiveRoot, filePath)),
        title: extractTitle(raw, filePath),
        route: suggestRoute(raw, filePath),
        excerpt: excerpt(raw),
        raw,
      };
    })
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

function collectInboxItems(inboxRoot) {
  if (!existsSync(inboxRoot)) return [];
  return collectMarkdownFiles(inboxRoot)
    .filter(filePath => isProcessableInboxFile(inboxRoot, filePath))
    .map(filePath => {
      const raw = readFileSync(filePath, 'utf-8');
      return {
        path: filePath,
        relativePath: toSlash(relative(inboxRoot, filePath)),
        title: extractTitle(raw, filePath),
        route: suggestRoute(raw, filePath),
        excerpt: excerpt(raw),
        raw,
      };
    })
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

function collectMarkdownFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMarkdownFiles(full));
    } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.md') {
      results.push(full);
    }
  }
  return results;
}

function isProcessableInboxFile(inboxRoot, filePath) {
  const rel = toSlash(relative(inboxRoot, filePath));
  if (!rel || rel.startsWith('..')) return false;
  if (INFRA_FILES.has(rel)) return false;
  if (INFRA_FILES.has(basename(filePath))) return false;
  if (basename(filePath).toLowerCase() === 'readme.md') return false;
  return true;
}

function buildObservation({
  date,
  items,
  inboxRoot,
  worldRoot,
  archiveRoot,
  observationPath,
  trendSynthesis,
  eventConnectionsEnabled = true,
  eventConnectionCandidates = [],
  visualArtifactRelPath = null,
  visualArtifactPath = null,
}) {
  const neo4jTransferPayload = buildNeo4jTransferPayload({
    date,
    items,
    worldRoot,
    archiveRoot,
    observationPath,
    trendSynthesis,
    eventConnectionCandidates: eventConnectionsEnabled ? eventConnectionCandidates : [],
  });
  const sourceRelPath = neo4jTransferPayload.batch.source_rel_path;
  const archiveRootRelPath = neo4jTransferPayload.batch.archive_root_rel_path;
  const lines = [
    '---',
    'type: observation',
    `created: ${date}`,
    'tags: [inbox, ingestion, macro]',
    'signal_status: watch',
    'graph_export_version: 1',
    `graph_node_id: "${neo4jTransferPayload.batch.id}"`,
    'graph_labels: ["Observation", "InboxIngestionBatch"]',
    'source: "ingest-world-inbox"',
    'source_vault: "World_Machine"',
    `source_rel_path: "${sourceRelPath}"`,
    `archive_root: "${archiveRootRelPath}"`,
    'neo4j_import_ready: true',
    'neo4j_import_status: "review"',
    `processed_item_count: ${items.length}`,
    `event_trend_count: ${trendSynthesis.trends.length}`,
    `related_event_scenarios: [${trendSynthesis.relatedScenarios.map(id => `"${id}"`).join(', ')}]`,
    `candidate_link_count: ${neo4jTransferPayload.candidate_links.length}`,
  ];

  if (eventConnectionsEnabled) {
    lines.push(
      `event_connection_count: ${eventConnectionCandidates.length}`,
      `new_event_candidate_count: ${eventConnectionCandidates.filter(candidate => candidate.candidate_type === 'emerging_event_candidate').length}`,
      'event_connection_status: review',
    );
  }

  lines.push(
    '---',
    '',
    `# ${date} - Inbox Ingestion Batch`,
    '',
    `Processed ${items.length} inbox item(s) from [[_Inbox/_Inbox README|World_Machine Inbox]].`,
    '',
    '## Routing Summary',
    '',
    '| Source | Suggested route | Archive | Extract |',
    '|---|---|---|---|',
  );

  for (const item of items) {
    const archiveRel = toSlash(relative(dirname(archiveRoot), join(archiveRoot, item.relativePath)));
    const archiveLink = `[[500-archive/Inbox/${archiveRel.replace(/\.md$/i, '')}|${escapePipe(item.title)}]]`;
    lines.push(`| ${archiveLink} | ${item.route} | ${archiveLink} | ${escapePipe(item.excerpt)} |`);
  }

  lines.push(...buildTrendSynthesisSection(trendSynthesis));
  if (eventConnectionsEnabled) {
    lines.push(...renderConnectionCandidatesSection(eventConnectionCandidates));
    lines.push('', '## Event Connection Map', '', renderMermaidConnectionMap(eventConnectionCandidates), '');
    if (visualArtifactPath) {
      lines.push(
        '## Visual Review Artifact',
        '',
        `Plotly review artifact: [[${visualArtifactRelPath}|Inbox Event Connections]].`,
        '',
      );
    }
  }

  lines.push(...renderNeo4jTransferBlock(neo4jTransferPayload));

  lines.push(
    '',
    '## Follow-Up',
    '',
    '- Convert high-signal rows into canonical indicator, regime, entity, policy, or watchpoint notes.',
    '- Run the listed event-research dry-runs to compare inbox themes against the seeded event network.',
    '- Register any actionable conditional signal in [[06_Strategy_Development/Macro-to-Strategy Signal Bridge|Macro-to-Strategy Signal Bridge]].',
    '- Add a [[06_Strategy_Development/Trade Expression Layer|Trade Expression Layer]] block where the source implies a trade expression.',
    '',
  );

  return `${lines.join('\n')}`;
}

function buildNeo4jTransferPayload({
  date,
  items,
  worldRoot,
  archiveRoot,
  observationPath,
  trendSynthesis,
  eventConnectionCandidates = [],
}) {
  const observationRelPath = toSlash(relative(worldRoot, observationPath));
  const baseObservationRelPath = inboxObservationRelPath(date);
  const batchToken = observationRelPath === baseObservationRelPath
    ? date
    : `${date}:${stableToken(observationRelPath)}`;
  const batchId = `world:inbox-ingestion-batch:${batchToken}`;
  const itemRows = items.map(item => {
    const archiveRelPath = inboxArchiveRelPath(date, item.relativePath);
    return {
      id: `world:inbox-item:${batchToken}:${stableToken(archiveRelPath)}`,
      title: item.title || item.relativePath,
      source_rel_path: toSlash(item.relativePath),
      archive_rel_path: archiveRelPath,
      suggested_route: item.route || '',
      excerpt: item.excerpt || '',
      source_url: extractSourceUrl(item.raw || ''),
    };
  });
  const itemByRelativePath = new Map(items.map((item, index) => [toSlash(item.relativePath), itemRows[index]]));
  const itemByTitle = new Map(items.map((item, index) => [String(item.title || '').toLowerCase(), itemRows[index]]));
  const trendRows = trendSynthesis.trends.map(trend => {
    const trendId = graphTrendId(batchToken, trend.label || trend.id);
    return {
      id: trendId,
      label: trend.label || trend.id,
      score: Number(trend.score || 0),
      matched_terms: arrayFrom(trend.matchedTerms),
      matched_item_ids: arrayFrom(trend.items)
        .map(item => itemByRelativePath.get(toSlash(item.relativePath))?.id)
        .filter(Boolean),
      related_scenarios: arrayFrom(trend.scenarios),
      read: trend.read || '',
    };
  });
  const trendByLabel = new Map(trendRows.map(row => [String(row.label || '').toLowerCase(), row]));
  const candidateLinks = eventConnectionCandidates.map(candidate => {
    const evidenceItemIds = arrayFrom(candidate.source_items)
      .map(item => {
        const relMatch = itemByRelativePath.get(toSlash(item.relative_path || ''));
        if (relMatch) return relMatch.id;
        return itemByTitle.get(String(item.title || '').toLowerCase())?.id;
      })
      .filter(Boolean);
    const matchedTrend = trendByLabel.get(String(arrayFrom(candidate.matched_trends)[0] || '').toLowerCase());
    const targetScenario = arrayFrom(candidate.related_scenarios)[0] || '';
    return {
      id: `candidate:world-inbox:${stableToken(`${batchToken}:${candidate.candidate_id || candidate.title || JSON.stringify(candidate)}`)}`,
      type: 'inbox_event_connection',
      candidate_type: candidate.candidate_type || 'inbox_event_connection',
      status: 'candidate',
      reviewState: 'needs_review',
      method: 'world_machine_inbox_ingestion',
      source: 'ingest-world-inbox',
      from_id: matchedTrend?.id || batchId,
      from_label: matchedTrend ? 'EventTrend' : 'InboxIngestionBatch',
      to_id: targetScenario ? `scenario:${targetScenario}` : `unresolved:inbox-event:${stableToken(`${batchToken}:${candidate.candidate_id || candidate.title || date}`)}`,
      to_label: targetScenario ? 'Scenario' : 'UnresolvedTarget',
      score: normalizedCandidateScore(candidate.score),
      reason: candidate.review_question || candidate.title || '',
      suggested_route: candidate.suggested_route || '',
      matched_trends: arrayFrom(candidate.matched_trends),
      matched_terms: arrayFrom(candidate.matched_terms),
      related_scenarios: arrayFrom(candidate.related_scenarios),
      evidence_item_ids: evidenceItemIds,
      evidence_links: arrayFrom(candidate.evidence_links).map(link => ({
        label: link.label || link.rel_path || '',
        rel_path: link.rel_path || '',
      })),
      review_commands: arrayFrom(candidate.commands),
    };
  });

  return {
    schema: 'neo4j_inbox_ingestion_v1',
    generated_at: new Date(`${date}T00:00:00.000Z`).toISOString(),
    batch: {
      id: batchId,
      date,
      title: basename(observationPath, extname(observationPath)),
      source: 'ingest-world-inbox',
      source_vault: 'World_Machine',
      source_rel_path: observationRelPath,
      archive_root_rel_path: toSlash(relative(worldRoot, archiveRoot)),
      import_status: 'review',
      processed_item_count: itemRows.length,
      event_trend_count: trendRows.length,
      candidate_link_count: candidateLinks.length,
    },
    items: itemRows,
    trends: trendRows,
    candidate_links: candidateLinks,
    review_commands: uniqueStrings([
      ...arrayFrom(trendSynthesis.commands),
      ...candidateLinks.flatMap(link => link.review_commands),
    ]),
  };
}

function renderNeo4jTransferBlock(payload) {
  return [
    '',
    '## Neo4j Transfer Block',
    '',
    'Machine-readable import payload for Neo4j review. Candidate links are proposals only until promoted by a separate review step.',
    '',
    '```json',
    JSON.stringify(payload, null, 2),
    '```',
    '',
  ];
}

function collectLocalEvidence(engineRoot, date) {
  if (!engineRoot || !existsSync(engineRoot)) return [];
  const roots = [
    join(engineRoot, '05_Data_Pulls'),
    join(engineRoot, '06_Signals'),
  ];
  const cutoff = new Date(`${date}T00:00:00Z`);
  cutoff.setUTCDate(cutoff.getUTCDate() - 30);
  const evidence = [];

  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const filePath of collectMarkdownFiles(root)) {
      const raw = readFileSync(filePath, 'utf-8');
      const pulled = extractFrontmatterValue(raw, 'date_pulled') || filePath.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '';
      if (pulled && /^\d{4}-\d{2}-\d{2}$/.test(pulled) && new Date(`${pulled}T00:00:00Z`) < cutoff) continue;
      evidence.push({
        title: extractFrontmatterValue(raw, 'title') || extractTitle(raw, filePath),
        relPath: toSlash(relative(engineRoot, filePath)),
        signalStatus: extractFrontmatterValue(raw, 'signal_status') || 'clear',
        text: raw.slice(0, 4000),
      });
      if (evidence.length >= 600) return evidence;
    }
  }

  return evidence;
}

function extractFrontmatterValue(raw, key) {
  const match = String(raw || '').match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?\\s*$`, 'm'));
  return match ? match[1].trim() : '';
}

function buildTrendSynthesis(items) {
  const trends = [];
  const scenarioSet = new Set();

  for (const definition of TREND_DEFINITIONS) {
    const matchedItems = [];
    const matchedTerms = new Set();
    const termMatches = new Map();

    for (const item of items) {
      const haystack = `${item.relativePath}\n${item.title}\n${item.excerpt}\n${item.raw || ''}`.toLowerCase();
      const itemTerms = definition.keywords.filter(term => haystack.includes(term.toLowerCase()));
      if (itemTerms.length === 0) continue;
      matchedItems.push(item);
      itemTerms.forEach(term => {
        matchedTerms.add(term);
        const key = term.toLowerCase();
        if (!termMatches.has(key)) {
          termMatches.set(key, {
            term,
            items: [],
          });
        }
        termMatches.get(key).items.push(item);
      });
    }

    if (matchedItems.length === 0) continue;
    definition.scenarios.forEach(id => scenarioSet.add(id));
    trends.push({
      ...definition,
      score: matchedItems.length * 3 + matchedTerms.size + definition.scenarios.length,
      matchedTerms: [...matchedTerms].sort(),
      termMatches: [...termMatches.values()]
        .map(match => ({
          term: match.term,
          count: match.items.length,
          items: match.items,
        }))
        .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term)),
      items: matchedItems,
    });
  }

  trends.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
  return {
    trends,
    relatedScenarios: [...scenarioSet].sort(),
    commands: [...new Set(trends.flatMap(trend => trend.commands))],
  };
}

function buildTrendSynthesisSection(trendSynthesis) {
  const lines = [
    '',
    '## Event Trend Synthesis',
    '',
  ];

  if (trendSynthesis.trends.length === 0) {
    lines.push('No larger event trend clusters were detected from this inbox batch.');
    return lines;
  }

  lines.push('| Trend | Matched items | Matched terms | Bigger-system read |');
  lines.push('|---|---:|---|---|');
  for (const trend of trendSynthesis.trends) {
    lines.push(`| ${escapePipe(trend.label)} | ${trend.items.length} | ${escapePipe(trend.matchedTerms.slice(0, 8).join(', '))} | ${escapePipe(trend.read)} |`);
  }

  lines.push(...buildThemedWordsReportSection(trendSynthesis));

  lines.push('', '## Event Network Handoffs', '');
  if (trendSynthesis.relatedScenarios.length > 0) {
    lines.push(`Related seeded event scenarios: ${trendSynthesis.relatedScenarios.map(id => `\`${id}\``).join(', ')}.`);
  } else {
    lines.push('No seeded event scenario matched directly; treat this batch as narrative/regime context until confirmed by source evidence.');
  }

  if (trendSynthesis.commands.length > 0) {
    lines.push('', 'Review commands:');
    for (const command of trendSynthesis.commands) {
      lines.push(`- \`${command}\``);
    }
  }

  lines.push('', 'Candidate graph links:');
  for (const trend of trendSynthesis.trends) {
    const scenarioText = trend.scenarios.length ? trend.scenarios.map(id => `\`${id}\``).join(', ') : 'narrative/regime context';
    lines.push(`- **${trend.label}** -> ${scenarioText}`);
  }

  return lines;
}

function buildThemedWordsReportSection(trendSynthesis) {
  const lines = [
    '',
    '## Themed Words Report',
    '',
  ];
  const rows = trendSynthesis.trends.flatMap(trend =>
    arrayFrom(trend.termMatches).map(match => ({
      trend: trend.label,
      term: match.term,
      count: match.count,
      items: arrayFrom(match.items),
    })),
  );

  if (rows.length === 0) {
    lines.push('No themed keyword matches were detected from this inbox batch.');
    return lines;
  }

  lines.push('| Theme | Themed word | Source hits | Source items |');
  lines.push('|---|---|---:|---|');
  for (const row of rows) {
    const sourceItems = row.items
      .slice(0, 5)
      .map(item => item.title || item.relativePath)
      .join(', ');
    const suffix = row.items.length > 5 ? `, +${row.items.length - 5} more` : '';
    lines.push(`| ${escapePipe(row.trend)} | \`${escapePipe(row.term)}\` | ${row.count} | ${escapePipe(`${sourceItems}${suffix}`)} |`);
  }
  return lines;
}

function graphTrendId(date, label) {
  return `world:event-trend:${date}:${slug(label || 'inbox-trend')}`;
}

function inboxArchiveRelPath(date, itemRelativePath) {
  return `500-archive/Inbox/${date}/${toSlash(itemRelativePath || 'untitled.md')}`;
}

function inboxObservationRelPath(date) {
  return `Reports/Inbox Reports/${date} - Inbox Ingestion Batch.md`;
}

function stableToken(value) {
  return createHash('sha256')
    .update(String(value || ''), 'utf8')
    .digest('hex')
    .slice(0, 16);
}

function normalizedCandidateScore(score) {
  const numeric = Number(score);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0.5;
  return Math.max(0.01, Math.min(1, Math.round((numeric / 100) * 1000) / 1000));
}

function extractSourceUrl(raw) {
  const match = String(raw || '').match(/https?:\/\/[^\s<>)\]]+/i);
  return match ? match[0].replace(/[.,;:!?]+$/g, '') : '';
}

function uniqueStrings(values) {
  return [...new Set(arrayFrom(values).map(value => String(value || '').trim()).filter(Boolean))];
}

function arrayFrom(value) {
  return Array.isArray(value) ? value.filter(item => item !== undefined && item !== null) : [];
}

function slug(value) {
  const text = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return text || 'item';
}

function extractTitle(raw, filePath) {
  const heading = raw.split(/\r?\n/).find(line => /^#\s+/.test(line));
  if (heading) return heading.replace(/^#\s+/, '').trim();
  return basename(filePath, extname(filePath));
}

function suggestRoute(raw, filePath) {
  const haystack = `${filePath}\n${raw}`.toLowerCase();
  if (/cpi|ppi|fed|yield|inflation|jobs|gdp|macro|rates/.test(haystack)) return '03_Macro_and_Economy/Observations';
  if (/candidate|watchpoint|threshold|scanner|signal/.test(haystack)) return '02_Strategy_Development/Watchpoints';
  if (/\bsec\b|regulat|law|bill|policy|court|tariff|defense|military|sanction/.test(haystack)) return 'Policy/';
  if (/company|ticker|earnings|revenue|guidance|valuation|stock/.test(haystack)) return 'Entities/';
  return '03_Macro_and_Economy/Observations';
}

function excerpt(raw) {
  const body = raw
    .replace(/^---[\s\S]*?---\s*/m, '')
    .split(/\r?\n/)
    .map(line => line.replace(/^#+\s*/, '').trim())
    .filter(line => line && !line.startsWith('|') && !/^[-*]\s*$/.test(line));
  const first = body.find(line => line.length > 20) || body[0] || 'No extract available.';
  return first.length > 180 ? `${first.slice(0, 177)}...` : first;
}

function uniqueArchivePath(targetPath) {
  if (!existsSync(targetPath)) return targetPath;
  const ext = extname(targetPath);
  const base = targetPath.slice(0, ext ? -ext.length : undefined);
  let counter = 2;
  while (existsSync(`${base} (${counter})${ext}`)) counter += 1;
  return `${base} (${counter})${ext}`;
}

function uniqueObservationPath(targetPath) {
  if (!existsSync(targetPath)) return targetPath;
  const ext = extname(targetPath);
  const base = targetPath.slice(0, ext ? -ext.length : undefined);
  let counter = 2;
  while (existsSync(`${base} ${counter}${ext}`)) counter += 1;
  return `${base} ${counter}${ext}`;
}

function escapePipe(value) {
  return String(value || '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function toSlash(pathValue) {
  return String(pathValue).split(/[\\/]/).join('/');
}

if (process.argv[1]?.endsWith('ingest-world-inbox.mjs')) {
  const flags = {
    'dry-run': process.argv.includes('--dry-run'),
    'from-archive': process.argv.includes('--from-archive'),
    'update-existing': process.argv.includes('--update-existing'),
    'no-event-connections': process.argv.includes('--no-event-connections'),
    'no-plotly': process.argv.includes('--no-plotly'),
  };
  const dateIdx = process.argv.indexOf('--date');
  if (dateIdx >= 0) flags.date = process.argv[dateIdx + 1];
  const limitIdx = process.argv.indexOf('--connection-limit');
  if (limitIdx >= 0) flags['connection-limit'] = process.argv[limitIdx + 1];
  run(flags).catch(error => {
    console.error(error);
    process.exit(1);
  });
}

