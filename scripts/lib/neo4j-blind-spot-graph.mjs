import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';

import { getEngineRoot, getWorldMachineRoot } from './config.mjs';
import { readFolder } from './frontmatter.mjs';

export const NODE_COLUMNS = Object.freeze([
  'id',
  'labels',
  'name',
  'canonicalName',
  'label',
  'sourceId',
  'targetId',
  'type',
  'vault',
  'relativePath',
  'obsidianUrl',
  'sourcePath',
  'sourceVault',
  'sourceFolder',
  'source_path',
  'source_url',
  'source_rel_path',
  'source_vault',
  'source_folder',
  'nodeType',
  'domain',
  'subdomain',
  'assetClass',
  'sector',
  'industry',
  'country',
  'jurisdiction',
  'tags',
  'status',
  'signalStatus',
  'confidence',
  'conviction',
  'timeframe',
  'frequency',
  'lastUpdated',
  'date',
  'asOfDate',
  'ticker',
  'exchange',
  'symbol',
  'currency',
  'instrumentType',
  'currentValue',
  'trend',
  'source',
  'method',
  'provider',
  'dataType',
  'datePulled',
  'freshnessDate',
  'summary',
  'url',
  'weight',
  'reason',
  'evidenceCount',
  'missingEvidence',
  'firstSeen',
  'lastSeen',
  'reviewState',
  'reviewRoute',
  'createdBy',
  'score',
]);

export const REL_COLUMNS = Object.freeze([
  'id',
  'sourceId',
  'targetId',
  'type',
  'source',
  'method',
  'confidence',
  'weight',
  'status',
  'reason',
  'evidenceCount',
  'missingEvidence',
  'firstSeen',
  'lastSeen',
  'reviewState',
  'reviewRoute',
  'createdBy',
  'asOfDate',
]);

const DOMAIN_BY_TOP_LEVEL = Object.freeze({
  Entities: 'Entities',
  Macro: 'Macro',
  Policy: 'Policy',
  Politics: 'Politics',
  Reports: 'Reports',
  _Inbox: 'News',
  '01_Data_Sources': 'DataSources',
  '05_Data_Pulls': 'Evidence',
  '06_Signals': 'Signals',
  '10_Theses': 'Theses',
  '12_Company_Risk': 'CompanyRisk',
});

const DOMAIN_NAMES = Object.freeze([
  'Entities',
  'Macro',
  'Policy',
  'Politics',
  'News',
  'Reports',
  'Signals',
  'Theses',
  'DataSources',
  'Evidence',
  'CompanyRisk',
]);

const RELATIONSHIP_TYPES = Object.freeze([
  'BELONGS_TO_DOMAIN',
  'SOURCED_FROM',
  'HAS_EVIDENCE',
  'HAS_PULL',
  'HAS_SIGNAL',
  'ISSUED_BY',
  'PROPOSED_BY',
  'PROPOSES',
  'RESULTED_IN',
  'LINKS_TO',
  'RELATED_TO',
  'MENTIONS',
  'SUPPORTS_THESIS',
  'INVALIDATES_THESIS',
  'PART_OF_REGIME',
  'INDICATES_REGIME',
  'AFFECTS_SECTOR',
  'FAVORS_SECTOR',
  'HURTS_SECTOR',
  'AFFECTS_STOCK',
  'AFFECTS_COMMODITY',
  'AFFECTS_FOREX',
  'AFFECTS_FUTURES',
  'RELEASED_ON',
  'HAS_EARNINGS_EVENT',
  'TRIGGERS',
  'CONFIRMS',
  'CONTRADICTS',
  'ESCALATES',
  'SPONSORS',
  'LOBBIES_FOR',
  'FUNDS',
  'REGULATES',
  'TARGETS_SECTOR',
  'IMPACTS_COMPANY',
]);

const COMMON_SECTORS = Object.freeze(new Set([
  'aerospace-defense',
  'communication-services',
  'consumer-discretionary',
  'consumer-staples',
  'energy',
  'financials',
  'finance',
  'healthcare',
  'industrials',
  'materials',
  'real-estate',
  'tech-sector',
  'technology',
  'utilities',
  'defense',
]));

const COMMON_COMMODITIES = Object.freeze(new Set([
  'copper',
  'gold',
  'lithium',
  'natural-gas',
  'oil',
  'silver',
  'wheat',
]));

export function normalizeConceptKey(value) {
  const display = displayNameFromReference(value);
  return slug(display);
}

export async function collectBlindSpotNotes({
  engineRoot = getEngineRoot(),
  worldRoot = getWorldMachineRoot(),
  includeArchives = false,
} = {}) {
  const specs = [
    { vault: 'World_Machine', root: worldRoot, folders: ['Entities', 'Macro', 'Policy', 'Politics', '_Inbox', 'Reports'] },
    { vault: 'My_Data', root: engineRoot, folders: ['01_Data_Sources', '05_Data_Pulls', '06_Signals', '10_Theses'] },
  ];

  const notes = [];
  for (const spec of specs) {
    for (const folder of spec.folders) {
      const dir = join(spec.root, folder);
      if (!existsSync(dir)) continue;
      const folderNotes = await readFolder(dir, true);
      for (const note of folderNotes) {
        const relPath = slash(relative(spec.root, note.path));
        if (!includeArchives && relPath.includes('/500-archive/')) continue;
        notes.push({
          vault: spec.vault,
          path: note.path,
          relativePath: relPath,
          data: note.data ?? {},
          content: note.content ?? '',
        });
      }
    }
  }
  return notes;
}

export function buildBlindSpotGraph({ notes = [], date = today() } = {}) {
  const builder = createBuilder(date);
  for (const domain of DOMAIN_NAMES) builder.addDomain(domain);

  const known = new Map();
  const noteRecords = [];

  for (const note of notes) {
    const normalized = normalizeNote(note);
    if (!normalized) continue;

    const concept = buildPrimaryConceptNode(normalized, date);
    if (concept) {
      builder.addNode(concept);
      ensureIssuerForStock(builder, known, concept, date);
      builder.addRel(concept.id, domainId(normalized.domain), 'BELONGS_TO_DOMAIN', {
        id: relId(concept.id, 'BELONGS_TO_DOMAIN', domainId(normalized.domain)),
        source: 'folder',
        method: 'folder_domain',
        asOfDate: date,
      });
      known.set(normalizeConceptKey(concept.properties.name), concept);
      known.set(normalizeConceptKey(normalized.title), concept);
    }
    noteRecords.push({ note: normalized, concept });
  }

  for (const record of noteRecords) {
    if (!record.concept) continue;
    addStructuredRelationships({ builder, record, known, date });
    addMentionRelationships({ builder, record, known, date });
  }

  addBlindSpotCandidates({ builder, records: noteRecords, known, date });

  return builder.graph();
}

export function validateGraph(graph) {
  const errors = [];
  const nodeIds = new Set();
  for (const node of graph.nodes ?? []) {
    if (!node.id) errors.push('Node missing id');
    if (nodeIds.has(node.id)) errors.push(`Duplicate node id: ${node.id}`);
    nodeIds.add(node.id);
    if (!Array.isArray(node.labels) || node.labels.length === 0) errors.push(`Node ${node.id} missing labels`);
  }

  const relIds = new Set();
  for (const rel of graph.relationships ?? []) {
    if (!rel.id) errors.push('Relationship missing id');
    if (relIds.has(rel.id)) errors.push(`Duplicate relationship id: ${rel.id}`);
    relIds.add(rel.id);
    if (!nodeIds.has(rel.sourceId)) errors.push(`Relationship ${rel.id} missing source endpoint: ${rel.sourceId}`);
    if (!nodeIds.has(rel.targetId)) errors.push(`Relationship ${rel.id} missing target endpoint: ${rel.targetId}`);
    if (!rel.type) errors.push(`Relationship ${rel.id} missing type`);
  }

  return { errors };
}

export function renderCsv(rows, kind) {
  const columns = kind === 'relationship' ? REL_COLUMNS : NODE_COLUMNS;
  const rendered = [columns.join(',')];
  for (const row of rows) {
    const flat = kind === 'relationship' ? flattenRelationship(row) : flattenNode(row);
    rendered.push(columns.map(column => csvCell(flat[column])).join(','));
  }
  return `${rendered.join('\n')}\n`;
}

function renderCandidateLinksCsv(nodes) {
  const rendered = [REL_COLUMNS.join(',')];
  for (const node of nodes) {
    const flat = {
      ...node.properties,
      id: node.id,
      sourceId: node.properties.sourceId,
      targetId: node.properties.targetId,
      type: 'CANDIDATE_LINK',
    };
    rendered.push(REL_COLUMNS.map(column => csvCell(flat[column])).join(','));
  }
  return `${rendered.join('\n')}\n`;
}

function countCandidateLinks(graph) {
  return (graph.nodes ?? []).filter(node => node.labels?.includes('CandidateLink')).length;
}

export async function writeExportPackage({ graph, outDir, date = today() }) {
  await mkdir(outDir, { recursive: true });
  const importerDir = join(outDir, 'data-importer');
  await mkdir(importerDir, { recursive: true });

  await writeFile(join(outDir, 'nodes.csv'), renderCsv(graph.nodes, 'node'), 'utf8');
  await writeFile(join(outDir, 'relationships.csv'), renderCsv(graph.relationships, 'relationship'), 'utf8');
  await writeFile(
    join(outDir, 'candidate_links.csv'),
    renderCandidateLinksCsv(graph.nodes.filter(node => node.labels.includes('CandidateLink'))),
    'utf8'
  );
  await writeFile(join(outDir, 'blind_spot_graph.json'), `${JSON.stringify(graph, null, 2)}\n`, 'utf8');
  await writeFile(join(outDir, 'load_blind_spot_graph.cypher'), renderCypher(), 'utf8');
  await writeFile(join(outDir, 'README.md'), renderReadme({ graph, date, outDir }), 'utf8');

  const splitFiles = await writeSplitImporterFiles({ graph, importerDir });

  return {
    outDir,
    importerDir,
    files: ['nodes.csv', 'relationships.csv', 'candidate_links.csv', 'blind_spot_graph.json', 'load_blind_spot_graph.cypher', 'README.md'],
    importerFiles: splitFiles,
    nodeCount: graph.nodes.length,
    relationshipCount: graph.relationships.length,
    candidateLinkCount: countCandidateLinks(graph),
    labels: countLabels(graph.nodes),
    relationshipTypes: countBy(graph.relationships, 'type'),
  };
}

export async function runBlindSpotGraphExport({
  date = today(),
  dryRun = false,
  engineRoot = getEngineRoot(),
  worldRoot = getWorldMachineRoot(),
  includeArchives = false,
  outDir,
} = {}) {
  const notes = await collectBlindSpotNotes({ engineRoot, worldRoot, includeArchives });
  const graph = buildBlindSpotGraph({ notes, date });
  const validation = validateGraph(graph);
  const outputDir = outDir ?? resolve(engineRoot, '99_System', 'exports', 'neo4j', `blind-spot-graph-${date}`);
  const summary = {
    outDir: outputDir,
    dryRun,
    noteCount: notes.length,
    nodeCount: graph.nodes.length,
    relationshipCount: graph.relationships.length,
    candidateLinkCount: countCandidateLinks(graph),
    labels: countLabels(graph.nodes),
    relationshipTypes: countBy(graph.relationships, 'type'),
    validation,
  };

  if (validation.errors.length) return { graph, summary };
  if (!dryRun) {
    summary.export = await writeExportPackage({ graph, outDir: outputDir, date });
  }
  return { graph, summary };
}

function createBuilder(date) {
  const nodes = new Map();
  const relationships = new Map();

  return {
    addDomain(name) {
      const id = domainId(name);
      this.addNode({
        id,
        labels: ['Domain'],
        properties: {
          id,
          name,
          canonicalName: name,
          label: name,
          nodeType: 'domain',
          domain: name,
          asOfDate: date,
        },
      });
    },
    addNode(node) {
      if (!node?.id) return;
      if (nodes.has(node.id)) {
        const current = nodes.get(node.id);
        current.labels = [...new Set([...current.labels, ...node.labels])];
        current.properties = compactObject({ ...node.properties, ...current.properties, ...node.properties });
        return;
      }
      nodes.set(node.id, {
        id: node.id,
        labels: [...new Set(node.labels ?? [])],
        properties: compactObject({ ...(node.properties ?? {}), id: node.id }),
      });
    },
    addRel(sourceId, targetId, type, properties = {}) {
      if (!sourceId || !targetId || !type) return;
      const id = properties.id || relId(sourceId, type, targetId);
      if (relationships.has(id)) return;
      relationships.set(id, {
        id,
        sourceId,
        targetId,
        type,
        properties: compactObject({ ...properties, id, asOfDate: properties.asOfDate ?? date }),
      });
    },
    hasRel(sourceId, targetId, type) {
      return relationships.has(relId(sourceId, type, targetId));
    },
    graph() {
      return {
        generatedAt: new Date().toISOString(),
        nodes: [...nodes.values()].sort((a, b) => a.id.localeCompare(b.id)),
        relationships: [...relationships.values()].sort((a, b) => a.id.localeCompare(b.id)),
      };
    },
  };
}

function normalizeNote(note) {
  if (!note?.relativePath) return null;
  const vault = note.vault || 'My_Data';
  const relativePath = slash(note.relativePath);
  const parts = relativePath.split('/');
  const top = parts[0] || '';
  const title = note.data?.name || note.data?.title || basename(relativePath, '.md');
  const domain = DOMAIN_BY_TOP_LEVEL[top] || top || 'Unknown';
  return {
    ...note,
    vault,
    relativePath,
    parts,
    top,
    title,
    domain,
    subdomain: parts[1] || '',
    data: note.data ?? {},
    content: note.content ?? '',
  };
}

function buildPrimaryConceptNode(note, date) {
  const inference = inferPrimaryNode(note);
  if (!inference) return null;
  return conceptNode({
    id: inference.id,
    labels: inference.labels,
    name: inference.name,
    date,
    properties: {
      ...propertiesFromFrontmatter(note.data),
      nodeType: inference.nodeType,
      domain: note.domain,
      subdomain: note.subdomain,
      vault: note.vault,
      relativePath: note.relativePath,
      obsidianUrl: obsidianUrl(note.vault, note.relativePath),
      sourcePath: note.path,
      sourceVault: note.vault,
      sourceFolder: note.top,
      source_path: note.data.source_path || note.data.sourcePath || note.path,
      source_url: note.data.source_url || note.data.obsidianUrl || obsidianUrl(note.vault, note.relativePath),
      source_rel_path: note.data.source_rel_path || note.data.relativePath || note.relativePath,
      source_vault: note.data.source_vault || note.data.vault || note.vault,
      source_folder: note.data.source_folder || note.data.sourceFolder || note.top,
    },
  });
}

function inferPrimaryNode(note) {
  const prefix = vaultPrefix(note.vault);
  const fm = note.data;
  const path = note.relativePath;
  const title = String(note.title || basename(path, '.md')).trim();
  const fileTitle = basename(path, '.md');
  const type = String(fm.node_type || fm.type || '').toLowerCase();
  const first = note.parts[0];
  const second = note.parts[1] || '';
  const third = note.parts[2] || '';

  if (note.vault === 'World_Machine' && first === 'Entities') {
    if (second === 'Stocks') {
      const ticker = String(fm.ticker || title).toUpperCase();
      return { id: `world:stock:${ticker}`, name: ticker, nodeType: 'stock', labels: ['Stock', 'Entity'] };
    }
    if (second === 'ETFs') {
      const ticker = String(fm.ticker || title).toUpperCase();
      return { id: `world:etf:${ticker}`, name: ticker, nodeType: 'etf', labels: ['ETF', 'Entity'] };
    }
    if (second === 'Commodities') return typedWorld('commodity', fileTitle, title, ['Commodity', 'Entity']);
    if (second === 'Countries') return typedWorld('country', fileTitle, title, ['Country', 'Entity']);
    if (second === 'Sectors') return typedWorld('sector', fileTitle, title, ['Sector', 'Entity']);
    if (second === 'Geopolitics') return typedWorld('geopoliticalevent', fileTitle, title, ['GeopoliticalEvent', 'Entity']);
    return typedWorld('entity', fileTitle, title, ['Entity']);
  }

  if (note.vault === 'World_Machine' && first === 'Macro') {
    if (second === 'Regimes' || type === 'regime') return typedWorld('regime', fileTitle, title, ['Regime']);
    if (second === 'Indicators' || type === 'indicator') {
      const labels = ['MacroIndicator'];
      if (/\b(yield|treasury|curve|10y|30y)\b/i.test(title)) labels.push('YieldInstrument');
      if (/\b(calendar|release|cpi|ppi|nfp|claims|pce|gdp)\b/i.test(title)) labels.push('EconomicDataRelease');
      return typedWorld('macroindicator', fileTitle, title, labels);
    }
  }

  if (note.vault === 'World_Machine' && first === 'Policy') {
    const labels = ['PolicyAction'];
    if (type === 'bill' || second === 'Bills') labels.push('Bill');
    else if (type === 'regulation' || second === 'Regulations') labels.push('Regulation');
    else if (type === 'topic' || second === 'Topics') labels.push('PolicyTopic');
    return typedWorld(labels.includes('Bill') ? 'bill' : labels.includes('Regulation') ? 'regulation' : 'policyaction', fileTitle, title, labels);
  }

  if (note.vault === 'World_Machine' && first === 'Politics') {
    if (type === 'pac' || second === 'PACs') return typedWorld('pac', fileTitle, title, ['PAC', 'Donor']);
    if (type === 'lobbying-campaign' || second === 'Lobbying') return typedWorld('lobbyingcampaign', fileTitle, title, ['LobbyingCampaign']);
    if (type === 'recipient' || second === 'Recipients') return typedWorld('recipient', fileTitle, title, ['Recipient', 'PoliticalActor']);
    if (type === 'company' || second === 'Companies') return typedWorld('company', fileTitle, title, ['Company', 'Donor']);
    return typedWorld('politicalactor', fileTitle, title, ['PoliticalActor']);
  }

  if (note.vault === 'World_Machine' && first === '_Inbox') {
    return typedWorld('newsitem', fileTitle, title, ['NewsItem', 'SourceItem', 'EvidenceArtifact']);
  }

  if (note.vault === 'World_Machine' && first === 'Reports') {
    return typedWorld('evidenceartifact', fileTitle, title, ['EvidenceArtifact']);
  }

  if (note.vault === 'My_Data' && first === '10_Theses') return typed(prefix, 'thesis', fileTitle, title, ['Thesis']);
  if (note.vault === 'My_Data' && first === '06_Signals') return typed(prefix, 'signal', fileTitle, title, ['Signal']);
  if (note.vault === 'My_Data' && first === '05_Data_Pulls') return typed(prefix, 'pull', fileTitle, title, ['DataPull', 'EvidenceArtifact']);
  if (note.vault === 'My_Data' && first === '01_Data_Sources') return typed(prefix, 'datasource', fileTitle, title, ['DataSource', 'SourceItem']);
  if (note.vault === 'My_Data' && first === '12_Company_Risk') {
    const labels = ['EvidenceArtifact'];
    if (third === 'Companies') labels.push('Company');
    return typed(prefix, 'risk', fileTitle, title, labels);
  }

  return typed(prefix, type || 'noteconcept', fileTitle, title, ['EvidenceArtifact']);
}

function addStructuredRelationships({ builder, record, known, date }) {
  const { note, concept } = record;
  const fm = note.data;

  if (concept.labels.includes('Stock') && fm.sector) {
    const sector = ensureConcept(builder, known, fm.sector, 'Sector', date);
    builder.addRel(sector.id, concept.id, 'AFFECTS_STOCK', relProps('frontmatter', 'sector_exposure', date));
  }

  if (concept.labels.includes('Regime')) {
    for (const item of asArray(fm.favors_sectors)) {
      const sector = ensureConcept(builder, known, item, 'Sector', date);
      builder.addRel(concept.id, sector.id, 'FAVORS_SECTOR', relProps('frontmatter', 'favors_sectors', date));
    }
    for (const item of asArray(fm.hurts_sectors)) {
      const sector = ensureConcept(builder, known, item, 'Sector', date);
      builder.addRel(concept.id, sector.id, 'HURTS_SECTOR', relProps('frontmatter', 'hurts_sectors', date));
    }
    for (const item of asArray(fm.key_indicators)) {
      const indicator = ensureConcept(builder, known, item, 'MacroIndicator', date);
      builder.addRel(indicator.id, concept.id, 'INDICATES_REGIME', relProps('frontmatter', 'key_indicators', date));
    }
  }

  if (concept.labels.includes('MacroIndicator')) {
    for (const item of asArray(fm.parent_regimes)) {
      const regime = ensureConcept(builder, known, item, 'Regime', date);
      builder.addRel(concept.id, regime.id, 'INDICATES_REGIME', relProps('frontmatter', 'parent_regimes', date));
    }
    for (const item of asArray(fm.affects_sectors)) {
      const sector = ensureConcept(builder, known, item, 'Sector', date);
      builder.addRel(concept.id, sector.id, 'LINKS_TO', relProps('frontmatter', 'affects_sectors', date));
    }
    for (const item of asArray(fm.affects_commodities)) {
      const commodity = ensureConcept(builder, known, item, 'Commodity', date);
      builder.addRel(concept.id, commodity.id, 'AFFECTS_COMMODITY', relProps('frontmatter', 'affects_commodities', date));
    }
  }

  if (concept.labels.includes('Thesis')) {
    for (const item of asArray(fm.supporting_regimes)) {
      const regime = ensureConcept(builder, known, item, 'Regime', date);
      builder.addRel(concept.id, regime.id, 'SUPPORTS_THESIS', relProps('frontmatter', 'supporting_regimes', date));
    }
    for (const item of asArray(fm.core_entities)) {
      const target = ensureConcept(builder, known, item, inferReferenceLabel(item), date);
      builder.addRel(concept.id, target.id, 'LINKS_TO', relProps('frontmatter', 'core_entities', date));
    }
  }

  if (concept.labels.includes('PolicyAction') || concept.labels.includes('PoliticalActor') || concept.labels.includes('PAC') || concept.labels.includes('LobbyingCampaign')) {
    for (const item of asArray(fm.sectors)) {
      const sector = ensureConcept(builder, known, item, 'Sector', date);
      builder.addRel(concept.id, sector.id, 'TARGETS_SECTOR', relProps('frontmatter', 'sectors', date));
    }
  }

  for (const item of asArray(fm.related_entities)) {
    const target = ensureConcept(builder, known, item, inferReferenceLabel(item), date);
    builder.addRel(concept.id, target.id, 'RELATED_TO', relProps('frontmatter', 'related_entities', date));
  }

  if (fm.source || fm.provider) {
    const source = ensureConcept(builder, known, fm.source || fm.provider, 'SourceItem', date);
    builder.addRel(concept.id, source.id, 'SOURCED_FROM', relProps('frontmatter', 'source', date));
  }
}

function ensureIssuerForStock(builder, known, stock, date) {
  if (!stock?.labels?.includes('Stock')) return null;
  const ticker = String(stock.properties?.ticker || stock.properties?.symbol || stock.properties?.name || stock.properties?.id || stock.id).toUpperCase();
  const issuerName = stock.properties?.companyName || stock.properties?.canonicalName || stock.properties?.name || ticker;
  const issuerId = `world:company:${slug(issuerName)}`;
  const issuer = conceptNode({
    id: issuerId,
    labels: ['Company', 'Entity'],
    name: issuerName,
    date,
    properties: {
      nodeType: 'company',
      domain: 'Entities',
      ticker,
      symbol: ticker,
      sector: stock.properties?.sector,
      country: stock.properties?.country,
      source_path: stock.properties?.source_path,
      source_url: stock.properties?.source_url,
      source_rel_path: stock.properties?.source_rel_path,
      source_vault: stock.properties?.source_vault,
      source_folder: stock.properties?.source_folder,
    },
  });
  builder.addNode(issuer);
  builder.addRel(stock.id, issuer.id, 'ISSUED_BY', relProps('inference', 'stock_listing_issuer_split', date));
  if (known) known.set(normalizeConceptKey(issuerName), issuer);
  return issuer;
}

function addMentionRelationships({ builder, record, known, date }) {
  const links = extractWikiLinks(record.note.content);
  for (const link of links) {
    const target = ensureConcept(builder, known, link, inferReferenceLabel(link), date);
    builder.addRel(record.concept.id, target.id, 'MENTIONS', relProps('wikilink', 'content_wikilink', date));
  }
}

function addBlindSpotCandidates({ builder, records, known, date }) {
  const sectorToStocks = new Map();
  const sectorToRegimes = new Map();

  for (const record of records) {
    if (!record.concept) continue;
    if (record.concept.labels.includes('Stock') && record.note.data.sector) {
      const sector = ensureConcept(builder, known, record.note.data.sector, 'Sector', date);
      addMapValue(sectorToStocks, sector.id, record.concept);
    }
    if (record.concept.labels.includes('Regime')) {
      for (const sectorRef of [...asArray(record.note.data.favors_sectors), ...asArray(record.note.data.hurts_sectors)]) {
        const sector = ensureConcept(builder, known, sectorRef, 'Sector', date);
        addMapValue(sectorToRegimes, sector.id, record.concept);
      }
    }
  }

  for (const [sectorId, stocks] of sectorToStocks) {
    const regimes = sectorToRegimes.get(sectorId) ?? [];
    for (const stock of stocks) {
      for (const regime of regimes) {
        addCandidate(builder, regime.id, stock.id, {
          method: 'frontmatter_gap',
          reason: 'Stock has sector exposure to a sector touched by this regime, but no direct stock-regime evidence link exists.',
          missingEvidence: 'Confirm with a fresh signal, pull note, or thesis update that connects the stock to the regime.',
          evidenceCount: 1,
          asOfDate: date,
        });
      }
    }
  }

  for (const record of records) {
    if (!record.concept) continue;
    const text = `${record.note.title} ${record.note.content}`.toLowerCase();

    if (record.concept.labels.includes('PolicyAction') || record.concept.labels.includes('PoliticalActor') || record.concept.labels.includes('LobbyingCampaign')) {
      for (const sectorRef of asArray(record.note.data.sectors)) {
        const sector = ensureConcept(builder, known, sectorRef, 'Sector', date);
        addCandidate(builder, record.concept.id, sector.id, {
          method: 'frontmatter_gap',
          reason: 'Policy or politics item targets this sector, but market-impact evidence has not been confirmed.',
          missingEvidence: 'Find a My_Data pull note, market reaction, or source note that confirms sector impact.',
          evidenceCount: 1,
          asOfDate: date,
        });
      }
    }

    if (record.concept.labels.includes('NewsItem')) {
      for (const target of [...known.values()].filter(node => node.labels.includes('Regime'))) {
        if (!text.includes(String(target.properties.name).toLowerCase())) continue;
        addCandidate(builder, record.concept.id, target.id, {
          method: 'source_gap',
          reason: 'News/source item mentions a regime theme without confirmed My_Data evidence.',
          missingEvidence: 'Confirm with local pull notes, signal intelligence, or event research before promotion.',
          evidenceCount: 0,
          asOfDate: date,
        });
      }
    }

    if (record.concept.labels.includes('Thesis') && asArray(record.note.data.core_entities).length > 0) {
      addCandidate(builder, record.concept.id, domainId('Evidence'), {
        method: 'regime_data_gap',
        reason: 'Thesis has core entities and should be checked for current signal and evidence freshness.',
        missingEvidence: 'Review latest signal intelligence, FMP thesis watchlists, and related pull notes.',
        evidenceCount: 0,
        asOfDate: date,
      });
    }
  }
}

function ensureConcept(builder, known, ref, label, date) {
  const key = normalizeConceptKey(ref);
  if (known.has(key)) return known.get(key);
  const inferred = label || inferReferenceLabel(ref);
  const node = conceptNodeForReference(ref, inferred, date);
  builder.addNode(node);
  ensureIssuerForStock(builder, known, node, date);
  known.set(key, node);
  return node;
}

function conceptNodeForReference(ref, label, date) {
  const name = displayNameFromReference(ref);
  const labels = labelsForReferenceLabel(label, name);
  const primary = primaryTypeForLabels(labels);
  const id = `world:${primary.toLowerCase()}:${primary === 'Stock' || primary === 'ETF' ? name.toUpperCase() : slug(name)}`;
  return conceptNode({
    id,
    labels,
    name,
    date,
    properties: {
      nodeType: camelToSnake(primary),
      domain: domainForLabels(labels),
      ticker: primary === 'Stock' || primary === 'ETF' ? name.toUpperCase() : undefined,
      symbol: primary === 'Stock' || primary === 'ETF' ? name.toUpperCase() : undefined,
    },
  });
}

function inferReferenceLabel(ref) {
  const text = displayNameFromReference(ref);
  const key = slug(text);
  if (/^[A-Z]{1,5}([._-][A-Z]{1,3})?$/.test(text)) return 'Stock';
  if (COMMON_SECTORS.has(key)) return 'Sector';
  if (COMMON_COMMODITIES.has(key)) return 'Commodity';
  if (/\b(regime|risk-on|risk-off|cycle|shock|stagflation|goldilocks)\b/i.test(text)) return 'Regime';
  if (/\b(yield|treasury|cpi|ppi|pmi|gdp|vix|dxy|nfp|claims|rate|curve)\b/i.test(text)) return 'MacroIndicator';
  return 'Entity';
}

function labelsForReferenceLabel(label, name) {
  const normalized = String(label || '').toLowerCase();
  if (normalized === 'stock') return ['Stock', 'Entity'];
  if (normalized === 'etf') return ['ETF', 'Entity'];
  if (normalized === 'sector') return ['Sector', 'Entity'];
  if (normalized === 'commodity') return ['Commodity', 'Entity'];
  if (normalized === 'country') return ['Country', 'Entity'];
  if (normalized === 'regime') return ['Regime'];
  if (normalized === 'macroindicator') {
    const labels = ['MacroIndicator'];
    if (/\b(yield|treasury|curve|10y|30y)\b/i.test(name)) labels.push('YieldInstrument');
    return labels;
  }
  if (normalized === 'sourceitem') return ['SourceItem'];
  return ['Entity'];
}

function primaryTypeForLabels(labels) {
  const priority = ['CandidateLink', 'Stock', 'Company', 'ETF', 'Commodity', 'Country', 'Sector', 'Industry', 'Regime', 'MacroIndicator', 'PolicyAction', 'Bill', 'Regulation', 'Thesis', 'Signal', 'DataPull', 'NewsItem', 'SourceItem', 'EvidenceArtifact', 'Entity'];
  return priority.find(label => labels.includes(label)) ?? labels[0] ?? 'Entity';
}

function conceptNode({ id, labels, name, date, properties = {} }) {
  return {
    id,
    labels,
    properties: {
      id,
      name,
      canonicalName: name,
      label: name,
      asOfDate: date,
      ...compactObject(properties),
    },
  };
}

function typedWorld(type, idTitle, name, labels) {
  return typed('world', type, idTitle, name, labels);
}

function typed(prefix, type, idTitle, name, labels) {
  const displayName = String(name || idTitle).replace(/\.md$/i, '');
  const idValue = labels.includes('Stock') || labels.includes('ETF') ? displayName.toUpperCase() : slug(idTitle);
  return { id: `${prefix}:${type}:${idValue}`, name: displayName, nodeType: type, labels };
}

function propertiesFromFrontmatter(fm) {
  return compactObject({
    nodeType: fm.node_type || fm.type,
    status: fm.status,
    signalStatus: fm.signal_status,
    confidence: fm.confidence,
    conviction: fm.conviction,
    timeframe: fm.timeframe,
    frequency: fm.frequency,
    lastUpdated: fm.last_updated || fm.updated,
    date: fm.date || fm.created,
    ticker: fm.ticker,
    exchange: fm.exchange,
    symbol: fm.symbol || fm.ticker,
    currency: fm.currency,
    instrumentType: fm.instrument_type,
    currentValue: fm.current_value,
    trend: fm.trend,
    source: fm.source,
    provider: fm.provider,
    dataType: fm.data_type || fm.type,
    datePulled: fm.date_pulled,
    freshnessDate: fm.freshness_date,
    summary: fm.summary || fm.description || fm.notes,
    url: fm.url || fm.link,
    sector: stringifyList(fm.sector || fm.sectors),
    industry: fm.industry,
    country: stringifyList(fm.country),
    jurisdiction: fm.jurisdiction,
    tags: stringifyList(fm.tags),
  });
}

function addCandidate(builder, sourceId, targetId, props) {
  const id = relId(sourceId, 'CANDIDATE_LINK', targetId);
  builder.addNode({
    id,
    labels: ['CandidateLink'],
    properties: {
      name: `Candidate link: ${sourceId} -> ${targetId}`,
      canonicalName: id,
      label: 'CandidateLink',
      sourceId,
      targetId,
      source: 'blind-spot-graph',
      type: 'CANDIDATE_LINK',
      status: 'candidate',
      reviewState: 'needs_review',
      confidence: 'low',
      weight: props.evidenceCount > 0 ? 0.5 : 0.25,
      createdBy: 'neo4j-blind-spot-graph',
      firstSeen: props.asOfDate,
      lastSeen: props.asOfDate,
      score: 0,
      ...props,
    },
  });
  builder.addRel(sourceId, id, 'PROPOSED_BY', {
    id: relId(sourceId, 'PROPOSED_BY', id),
    source: 'blind-spot-graph',
    method: props.method,
    asOfDate: props.asOfDate,
  });
  builder.addRel(id, targetId, 'PROPOSES', {
    id: relId(id, 'PROPOSES', targetId),
    source: 'blind-spot-graph',
    method: props.method,
    asOfDate: props.asOfDate,
  });
}

function relProps(source, method, date) {
  return {
    source,
    method,
    confidence: 'medium',
    weight: 1,
    firstSeen: date,
    lastSeen: date,
    asOfDate: date,
  };
}

function renderCypher() {
  return `// Neo4j loader for My_Data / World_Machine blind-spot graph.
// Upload nodes.csv and relationships.csv somewhere Neo4j can read, then update file:/// URLs if needed.
// This script creates no data until you run it in Neo4j.

CREATE CONSTRAINT blind_spot_node_id IF NOT EXISTS FOR (n:BlindSpotNode) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT candidatelink_id_unique IF NOT EXISTS FOR (c:CandidateLink) REQUIRE c.id IS UNIQUE;
CREATE INDEX evidenceartifact_source_path IF NOT EXISTS FOR (e:EvidenceArtifact) ON (e.source_path);
CREATE INDEX blind_spot_source_path IF NOT EXISTS FOR (n:BlindSpotNode) ON (n.source_path);

LOAD CSV WITH HEADERS FROM 'file:///nodes.csv' AS row
CALL (row) {
  MERGE (n:BlindSpotNode {id: row.id})
  SET n.name = row.name,
      n.sourceId = nullIf(row.sourceId, ''),
      n.targetId = nullIf(row.targetId, ''),
      n.type = nullIf(row.type, ''),
      n.canonicalName = row.canonicalName,
      n.label = row.label,
      n.vault = nullIf(row.vault, ''),
      n.relativePath = nullIf(row.relativePath, ''),
      n.obsidianUrl = nullIf(row.obsidianUrl, ''),
      n.sourcePath = nullIf(row.sourcePath, ''),
      n.sourceVault = nullIf(row.sourceVault, ''),
      n.sourceFolder = nullIf(row.sourceFolder, ''),
      n.source_path = nullIf(row.source_path, ''),
      n.source_url = nullIf(row.source_url, ''),
      n.source_rel_path = nullIf(row.source_rel_path, ''),
      n.source_vault = nullIf(row.source_vault, ''),
      n.source_folder = nullIf(row.source_folder, ''),
      n.nodeType = nullIf(row.nodeType, ''),
      n.domain = nullIf(row.domain, ''),
      n.subdomain = nullIf(row.subdomain, ''),
      n.assetClass = nullIf(row.assetClass, ''),
      n.sector = nullIf(row.sector, ''),
      n.industry = nullIf(row.industry, ''),
      n.country = nullIf(row.country, ''),
      n.jurisdiction = nullIf(row.jurisdiction, ''),
      n.tags = CASE row.tags WHEN '' THEN [] ELSE split(row.tags, ';') END,
      n.status = nullIf(row.status, ''),
      n.signalStatus = nullIf(row.signalStatus, ''),
      n.confidence = nullIf(row.confidence, ''),
      n.conviction = nullIf(row.conviction, ''),
      n.timeframe = nullIf(row.timeframe, ''),
      n.frequency = nullIf(row.frequency, ''),
      n.lastUpdated = nullIf(row.lastUpdated, ''),
      n.date = nullIf(row.date, ''),
      n.asOfDate = nullIf(row.asOfDate, ''),
      n.ticker = nullIf(row.ticker, ''),
      n.exchange = nullIf(row.exchange, ''),
      n.symbol = nullIf(row.symbol, ''),
      n.currency = nullIf(row.currency, ''),
      n.instrumentType = nullIf(row.instrumentType, ''),
      n.currentValue = nullIf(row.currentValue, ''),
      n.trend = nullIf(row.trend, ''),
      n.source = nullIf(row.source, ''),
      n.method = nullIf(row.method, ''),
      n.provider = nullIf(row.provider, ''),
      n.dataType = nullIf(row.dataType, ''),
      n.datePulled = nullIf(row.datePulled, ''),
      n.freshnessDate = nullIf(row.freshnessDate, ''),
      n.summary = nullIf(row.summary, ''),
      n.url = nullIf(row.url, ''),
      n.weight = toFloatOrNull(row.weight),
      n.reason = nullIf(row.reason, ''),
      n.evidenceCount = toIntegerOrNull(row.evidenceCount),
      n.missingEvidence = nullIf(row.missingEvidence, ''),
      n.firstSeen = nullIf(row.firstSeen, ''),
      n.lastSeen = nullIf(row.lastSeen, ''),
      n.reviewState = nullIf(row.reviewState, ''),
      n.reviewRoute = nullIf(row.reviewRoute, ''),
      n.createdBy = nullIf(row.createdBy, ''),
      n.score = toFloatOrNull(row.score)
  FOREACH (_ IN CASE WHEN 'Domain' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Domain)
  FOREACH (_ IN CASE WHEN 'Entity' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Entity)
  FOREACH (_ IN CASE WHEN 'Stock' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Stock:Entity)
  FOREACH (_ IN CASE WHEN 'Company' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Company:Entity)
  FOREACH (_ IN CASE WHEN 'ETF' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:ETF:Entity)
  FOREACH (_ IN CASE WHEN 'Commodity' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Commodity:Entity)
  FOREACH (_ IN CASE WHEN 'Country' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Country:Entity)
  FOREACH (_ IN CASE WHEN 'Sector' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Sector:Entity)
  FOREACH (_ IN CASE WHEN 'Industry' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Industry:Entity)
  FOREACH (_ IN CASE WHEN 'Regime' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Regime)
  FOREACH (_ IN CASE WHEN 'MacroIndicator' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:MacroIndicator)
  FOREACH (_ IN CASE WHEN 'YieldInstrument' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:YieldInstrument)
  FOREACH (_ IN CASE WHEN 'EconomicDataRelease' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:EconomicDataRelease)
  FOREACH (_ IN CASE WHEN 'NewsItem' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:NewsItem)
  FOREACH (_ IN CASE WHEN 'SourceItem' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:SourceItem)
  FOREACH (_ IN CASE WHEN 'DataPull' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:DataPull)
  FOREACH (_ IN CASE WHEN 'Signal' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Signal)
  FOREACH (_ IN CASE WHEN 'Thesis' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Thesis)
  FOREACH (_ IN CASE WHEN 'EvidenceArtifact' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:EvidenceArtifact)
  FOREACH (_ IN CASE WHEN 'PolicyAction' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:PolicyAction)
  FOREACH (_ IN CASE WHEN 'Bill' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Bill)
  FOREACH (_ IN CASE WHEN 'Regulation' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Regulation)
  FOREACH (_ IN CASE WHEN 'PolicyTopic' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:PolicyTopic)
  FOREACH (_ IN CASE WHEN 'PoliticalActor' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:PoliticalActor)
  FOREACH (_ IN CASE WHEN 'PAC' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:PAC)
  FOREACH (_ IN CASE WHEN 'LobbyingCampaign' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:LobbyingCampaign)
  FOREACH (_ IN CASE WHEN 'Recipient' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Recipient)
  FOREACH (_ IN CASE WHEN 'Donor' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:Donor)
  FOREACH (_ IN CASE WHEN 'GeopoliticalEvent' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:GeopoliticalEvent)
  FOREACH (_ IN CASE WHEN 'CandidateLink' IN split(row.labels, ';') THEN [1] ELSE [] END | SET n:CandidateLink)
} IN TRANSACTIONS OF 10000 ROWS;

${renderRelationshipLoadBlocks()}

MATCH (n:BlindSpotNode) RETURN labels(n) AS labels, count(*) AS count ORDER BY count DESC;
MATCH (c:CandidateLink) RETURN c.method AS method, count(*) AS count ORDER BY count DESC;
`;
}

function renderRelationshipLoadBlocks() {
  return RELATIONSHIP_TYPES.map(type => `LOAD CSV WITH HEADERS FROM 'file:///relationships.csv' AS row
WITH row WHERE row.type = '${type}'
MATCH (source:BlindSpotNode {id: row.sourceId})
MATCH (target:BlindSpotNode {id: row.targetId})
MERGE (source)-[r:${type} {id: row.id}]->(target)
SET r.source = nullIf(row.source, ''),
    r.method = nullIf(row.method, ''),
    r.confidence = nullIf(row.confidence, ''),
    r.weight = toFloatOrNull(row.weight),
    r.status = nullIf(row.status, ''),
    r.reason = nullIf(row.reason, ''),
    r.evidenceCount = toIntegerOrNull(row.evidenceCount),
    r.missingEvidence = nullIf(row.missingEvidence, ''),
    r.firstSeen = nullIf(row.firstSeen, ''),
    r.lastSeen = nullIf(row.lastSeen, ''),
    r.reviewState = nullIf(row.reviewState, ''),
    r.reviewRoute = nullIf(row.reviewRoute, ''),
    r.createdBy = nullIf(row.createdBy, ''),
    r.asOfDate = nullIf(row.asOfDate, '');
`).join('\n');
}

function renderReadme({ graph, date, outDir }) {
  const labels = countLabels(graph.nodes);
  const relTypes = countBy(graph.relationships, 'type');
  const lines = [
    `# Neo4j Blind-Spot Graph Export - ${date}`,
    '',
    'This export is a typed analytical graph over `World_Machine` and `My_Data` concepts. It is not a direct Obsidian mirror.',
    '',
    `- Nodes: \`${graph.nodes.length}\``,
    `- Relationships: \`${graph.relationships.length}\``,
    `- Candidate blind-spot links: \`${countCandidateLinks(graph)}\``,
    '',
    '## Files',
    '',
    '- `nodes.csv` - compact node table for scripted LOAD CSV import.',
    '- `relationships.csv` - compact relationship table.',
    '- `candidate_links.csv` - candidate set of inferred blind-spot relationships.',
    '- `blind_spot_graph.json` - detailed graph model.',
    '- `load_blind_spot_graph.cypher` - starter loader; review before running.',
    '- `data-importer/` - split CSVs for Neo4j Data Importer.',
    '',
    '## Node Labels',
    '',
    ...Object.entries(labels).sort().map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Relationship Types',
    '',
    ...Object.entries(relTypes).sort().map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Starter Queries',
    '',
    '```cypher',
    'MATCH (a)-[:PROPOSED_BY]->(c:CandidateLink)-[:PROPOSES]->(b)',
    'RETURN a.name, labels(a), c.method, c.reason, c.missingEvidence, b.name, labels(b)',
    'ORDER BY c.method, a.name',
    'LIMIT 100;',
    '```',
    '',
    '```cypher',
    'MATCH p=(regime:Regime)-[:PROPOSED_BY]->(:CandidateLink)-[:PROPOSES]->(stock:Stock)',
    'RETURN p',
    'LIMIT 100;',
    '```',
    '',
    '```cypher',
    'MATCH (indicator:MacroIndicator)-[:INDICATES_REGIME]->(regime:Regime)',
    'RETURN indicator.name, collect(regime.name) AS regimes',
    'ORDER BY indicator.name;',
    '```',
    '',
    `Local path: \`${outDir}\``,
    '',
  ];
  return `${lines.join('\n')}`;
}

async function writeSplitImporterFiles({ graph, importerDir }) {
  const files = [];
  const nodesByLabel = new Map();
  for (const node of graph.nodes) {
    const label = primaryTypeForLabels(node.labels);
    addMapValue(nodesByLabel, label, node);
  }
  for (const [label, rows] of nodesByLabel) {
    const file = `nodes_${safeFilePart(label)}.csv`;
    await writeFile(join(importerDir, file), renderCsv(rows, 'node'), 'utf8');
    files.push(`data-importer/${file}`);
  }

  const relsByType = new Map();
  for (const rel of graph.relationships) addMapValue(relsByType, rel.type, rel);
  for (const [type, rows] of relsByType) {
    const file = `rel_${safeFilePart(type)}.csv`;
    await writeFile(join(importerDir, file), renderCsv(rows, 'relationship'), 'utf8');
    files.push(`data-importer/${file}`);
  }
  return files.sort();
}

function flattenNode(node) {
  return { ...node.properties, id: node.id, labels: node.labels.join(';') };
}

function flattenRelationship(rel) {
  return { ...rel.properties, id: rel.id, sourceId: rel.sourceId, targetId: rel.targetId, type: rel.type };
}

function csvCell(value) {
  const string = stringifyList(value);
  if (/[",\n\r]/.test(string)) return `"${string.replace(/"/g, '""')}"`;
  return string;
}

function stringifyList(value) {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(item => String(item ?? '').trim()).filter(Boolean).join(';');
  return String(value);
}

function displayNameFromReference(value) {
  let raw = String(value ?? '').trim();
  const wiki = raw.match(/^\[\[([^\]]+)\]\]$/);
  if (wiki) raw = wiki[1];
  if (raw.includes('|')) raw = raw.split('|').pop();
  raw = raw.replace(/\\/g, '/').replace(/\.md$/i, '');
  if (raw.includes('/')) raw = raw.split('/').pop();
  return raw.trim();
}

function extractWikiLinks(text) {
  return [...String(text ?? '').matchAll(/\[\[([^\]]+)\]\]/g)].map(match => `[[${match[1]}]]`);
}

function asArray(value) {
  if (value == null || value === '') return [];
  if (Array.isArray(value)) return value.filter(item => item != null && item !== '');
  return [value];
}

function compactObject(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== null && item !== ''));
}

function relId(source, type, target) {
  return `rel:${slug(source)}:${type}:${slug(target)}`;
}

function domainId(name) {
  return `domain:${slug(name)}`;
}

function domainForLabels(labels) {
  if (labels.some(label => ['Stock', 'ETF', 'Commodity', 'Country', 'Sector', 'Industry', 'Entity'].includes(label))) return 'Entities';
  if (labels.some(label => ['Regime', 'MacroIndicator', 'YieldInstrument', 'EconomicDataRelease'].includes(label))) return 'Macro';
  if (labels.some(label => ['PolicyAction', 'Bill', 'Regulation', 'PolicyTopic'].includes(label))) return 'Policy';
  if (labels.some(label => ['PoliticalActor', 'PAC', 'LobbyingCampaign', 'Recipient', 'Donor'].includes(label))) return 'Politics';
  return 'Evidence';
}

function vaultPrefix(vault) {
  return vault === 'World_Machine' ? 'world' : 'mydata';
}

function obsidianUrl(vault, relPath) {
  return `obsidian://open?vault=${encodeURIComponent(vault)}&file=${encodeURIComponent(relPath)}`;
}

function addMapValue(map, key, value) {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(value);
}

function countBy(rows, key) {
  const counts = {};
  for (const row of rows) counts[row[key]] = (counts[row[key]] ?? 0) + 1;
  return counts;
}

function countLabels(nodes) {
  const counts = {};
  for (const node of nodes) {
    for (const label of node.labels) counts[label] = (counts[label] ?? 0) + 1;
  }
  return counts;
}

function camelToSnake(value) {
  return String(value).replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

function safeFilePart(value) {
  return String(value).replace(/[^A-Za-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'rows';
}

function slash(value) {
  return String(value).replace(/\\/g, '/');
}

function slug(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
