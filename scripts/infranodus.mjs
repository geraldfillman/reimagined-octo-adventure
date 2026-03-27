import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { basename, extname, relative, resolve } from 'path';

import { getVaultRoot } from './lib/config.mjs';
import { buildFrontmatter, buildTable, dateStampedFilename, today, writeNote } from './lib/markdown.mjs';

const GRAPH_ENDPOINT = 'api/v1/graphAndStatements?doNotSave=true&addStats=true&dotGraph=true&optimize=develop';
const DEFAULT_OUTPUT_DIR = '07_Playbooks/Graph_Sessions';
const GENERIC_STOPWORDS = [
  'signal',
  'signals',
  'watch',
  'severity',
  'status',
  'date',
  'dates',
  'action',
  'actions',
  'summary',
  'source',
  'sources',
  'link',
  'links',
];
const SCOPE_STOPWORDS = Object.freeze([
  {
    match: scopeLabel => scopeLabel.startsWith('10_Theses'),
    stopwords: [
      'thesis',
      'theses',
      'position',
      'positions',
      'catalyst',
      'catalysts',
      'matrix',
      'regime',
      'regimes',
      'timeframe',
      'conviction',
      'portfolio',
    ],
  },
  {
    match: scopeLabel => scopeLabel.startsWith('05_Data_Pulls/Government'),
      stopwords: [
        'item',
        'items',
        'filed',
        'filing',
        'filings',
        'form',
        'description',
        'guidance',
        'api',
        'sec',
        'edgar',
        'ticker',
        'tickers',
        'company',
        'companies',
        'event',
        'events',
        'implication',
      'implications',
      'read',
    ],
  },
  {
    match: scopeLabel => scopeLabel.startsWith('05_Data_Pulls'),
    stopwords: [
      'pulled',
      'frequency',
      'domain',
      'data_type',
    ],
  },
]);
const NOISE_TOKENS = new Set([
  'tag',
  'tags',
  'string',
  'status',
  'timeframe',
  'segment',
  'segments',
  'ongoing',
  'date',
  'thesis',
  'no',
  'on',
  'by',
  'ks',
  'gov',
  'days',
  'key',
  'required',
  'recent',
  'auto-pulled',
  'top',
  'mix',
  'header',
  'notes',
  'quiet',
  'tracked',
]);
const CLUSTER_TERM_BLACKLIST = new Set(['|', '#', '_', '---']);

export async function run(flags = {}) {
  const vaultRoot = getVaultRoot();
  const scopePath = flags.path || '10_Theses';
  const absoluteScopePath = resolve(vaultRoot, scopePath);

  if (!absoluteScopePath.startsWith(vaultRoot)) {
    throw new Error('Scope path must stay inside the vault root.');
  }
  if (!existsSync(absoluteScopePath)) {
    throw new Error(`Scope path does not exist: ${scopePath}`);
  }

  const settings = loadPluginSettings(vaultRoot);
  const scope = collectScope(absoluteScopePath);
  const scopeLabel = relative(vaultRoot, absoluteScopePath).replace(/\\/g, '/');
  const linkMode = normalizeLinkMode(settings.LINK_PAGE_TO_MENTIONS);
  const contextSettingsLabel = scope.isFolder
    ? settings.MULTI_PAGE_GRAPH_PROCESSING
    : settings.SINGLE_PAGE_GRAPH_PROCESSING;

  const body = buildRequestBody({
    name: flags.name || scopeLabel,
    scope,
    scopeLabel,
    linkMode,
    contextSettingsLabel,
  });

  const graphData = await fetchGraphData(settings, body);
  const extracted = extractGraphData(graphData);
  const note = buildSessionNote({
    scopeLabel,
    scope,
    extracted,
    question: flags.question || defaultQuestionForScope(scopeLabel),
    graphMode: settings.DEFAULT_GRAPH_MODE || 'topics',
    contextSettingsLabel,
  });

  const outputDir = resolve(vaultRoot, flags.output || DEFAULT_OUTPUT_DIR);
  const fileName = dateStampedFilename(`InfraNodus_${scopeLabel}_Graph_Session`);
  const outputPath = resolve(outputDir, fileName);

  writeNote(outputPath, note);

  console.log(`InfraNodus session written: ${relative(vaultRoot, outputPath).replace(/\\/g, '/')}`);
}

function loadPluginSettings(vaultRoot) {
  const settingsPath = resolve(vaultRoot, '.obsidian', 'plugins', 'infranodus-graph-view', 'data.json');
  if (!existsSync(settingsPath)) {
    throw new Error('InfraNodus plugin settings were not found in .obsidian/plugins/infranodus-graph-view/data.json');
  }

  const settings = JSON.parse(readFileSync(settingsPath, 'utf8'));
  if (!settings.INFRANODUS_API_KEY) {
    throw new Error('InfraNodus API key is not configured in the plugin settings.');
  }
  if (!settings.INFRANODUS_API_URL) {
    throw new Error('InfraNodus API URL is missing from the plugin settings.');
  }

  return settings;
}

function collectScope(absoluteScopePath) {
  const stats = statSync(absoluteScopePath);
  if (stats.isDirectory()) {
    let files = collectMarkdownFiles(absoluteScopePath);
    if (isPullArchiveScope(absoluteScopePath)) {
      files = collapsePullHistory(files);
    }
    if (!files.length) {
      throw new Error('No markdown files found in the selected folder.');
    }

    return {
      isFolder: true,
      files,
      text: '',
    };
  }

  if (stats.isFile() && extname(absoluteScopePath).toLowerCase() === '.md') {
    const content = normalizeMarkdownForInfraNodus(readFileSync(absoluteScopePath, 'utf8'), absoluteScopePath);
    return {
      isFolder: false,
      files: [
        {
          path: absoluteScopePath,
          name: basename(absoluteScopePath, '.md'),
          content,
        },
      ],
      text: splitIntoStatements(content).join('\n'),
    };
  }

  throw new Error('Scope path must be a markdown file or a folder containing markdown files.');
}

function collectMarkdownFiles(directoryPath) {
  const entries = readdirSync(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = resolve(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(absolutePath));
      continue;
    }
    if (entry.isFile() && extname(entry.name).toLowerCase() === '.md') {
      const rawContent = readFileSync(absolutePath, 'utf8');
      const frontmatter = parseFrontmatter(rawContent);
      if (frontmatter.graph_exclude === true) {
        continue;
      }
      const content = normalizeMarkdownForInfraNodus(rawContent, absolutePath);
      files.push({
        path: absolutePath,
        name: basename(entry.name, '.md'),
        content,
        frontmatter,
      });
    }
  }

  return files;
}

function isPullArchiveScope(absoluteScopePath) {
  return absoluteScopePath.includes('\\05_Data_Pulls\\') || absoluteScopePath.includes('/05_Data_Pulls/');
}

function parseFrontmatter(rawContent) {
  const match = String(rawContent || '').match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const values = {};
  for (const line of match[1].split(/\r?\n/)) {
    const fieldMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!fieldMatch) continue;
    const [, key, rawValue] = fieldMatch;
    const value = rawValue.trim();
    if (value === 'true') {
      values[key] = true;
      continue;
    }
    if (value === 'false') {
      values[key] = false;
      continue;
    }
    values[key] = value.replace(/^"(.*)"$/, '$1');
  }
  return values;
}

function collapsePullHistory(files) {
  const bySeries = new Map();

  for (const file of files) {
    const key = getPullSeriesKey(file);
    const current = bySeries.get(key);
    if (!current || comparePullFileRecency(file, current) > 0) {
      bySeries.set(key, file);
    }
  }

  return [...bySeries.values()].sort((a, b) => a.path.localeCompare(b.path));
}

function getPullSeriesKey(file) {
  const directory = file.path.replace(/[\\/][^\\/]+$/, '');
  const seriesName = file.name.replace(/^\d{4}[-_]\d{2}[-_]\d{2}_/, '');
  return `${directory}::${seriesName}`;
}

function comparePullFileRecency(left, right) {
  const leftDate = getPullFileDate(left);
  const rightDate = getPullFileDate(right);
  return leftDate.localeCompare(rightDate) || left.path.localeCompare(right.path);
}

function getPullFileDate(file) {
  const nameDate = file.name.match(/^(\d{4}[-_]\d{2}[-_]\d{2})_/);
  if (nameDate) {
    return nameDate[1].replace(/_/g, '-');
  }
  const pulledDate = String(file.frontmatter?.date_pulled || '').replace(/^"|"$/g, '');
  return pulledDate || '';
}

function splitIntoStatements(content) {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}

function normalizeLinkMode(value) {
  if (value === 'parent_and_paragraph' || value === 'true') return 'parent_and_paragraph';
  if (value === 'parent_only') return 'parent_only';
  return 'paragraph';
}

function buildRequestBody({ name, scope, scopeLabel, linkMode, contextSettingsLabel }) {
  const statements = scope.isFolder && linkMode !== 'paragraph'
    ? scope.files.map(file => file.content)
    : [];
  const categories = linkMode !== 'paragraph'
    ? scope.files.map(file => [file.name])
    : [];

  const body = {
    name,
    text: statements.length > 0 ? '' : scope.text,
  };

  if (statements.length > 0) {
    body.statements = statements;
  }

  body.contextSettings = mapContextSettings(contextSettingsLabel);

  const stopwords = getStopwordsForScope(scopeLabel);
  if (stopwords.length > 0) {
    body.contextSettings = {
      ...body.contextSettings,
      lemmatizeHashtags: true,
      stopwords,
    };
  }

  if (categories.length > 0) {
    body.categories = categories;
    body.contextSettings = {
      ...body.contextSettings,
      categoriesAsMentions: true,
      mentionsProcessing: 'CONNECT_TO_ALL_CONCEPTS',
      squareBracketsProcessing: 'IGNORE_BRACKETS',
    };
  }

  if (linkMode === 'parent_only') {
    body.contextSettings = {
      ...body.contextSettings,
      mentionsProcessing: 'CONNECT_TO_CONCEPTS_ONLY',
    };
  }

  return body;
}

function mapContextSettings(label) {
  if (label === '[[Wiki Links]] Only') {
    return {
      partOfSpeechToProcess: 'HASHTAGS_ONLY',
      doubleSquarebracketsProcessing: 'PROCESS_AS_HASHTAGS',
    };
  }

  if (label === '[[Wiki Links]] Prioritized') {
    return {
      partOfSpeechToProcess: 'WORDS_IF_NO_HASHTAGS',
      doubleSquarebracketsProcessing: 'PROCESS_AS_HASHTAGS',
    };
  }

  if (label === 'Concepts Only') {
    return {
      partOfSpeechToProcess: 'HASHTAGS_AND_WORDS',
      doubleSquarebracketsProcessing: 'EXCLUDE',
    };
  }

  return {
    partOfSpeechToProcess: 'HASHTAGS_AND_WORDS',
    doubleSquarebracketsProcessing: 'PROCESS_AS_HASHTAGS',
  };
}

async function fetchGraphData(settings, body) {
  const response = await fetch(`${settings.INFRANODUS_API_URL}/${GRAPH_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.INFRANODUS_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`InfraNodus request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data?.error?.includes?.('login')) {
    throw new Error('InfraNodus rejected the configured API key.');
  }
  if (!data?.entriesAndGraphOfContext?.graph?.graphologyGraph?.attributes) {
    throw new Error('InfraNodus returned an unexpected graph payload.');
  }

  return data;
}

function extractGraphData(graphData) {
  const attrs = graphData.entriesAndGraphOfContext.graph.graphologyGraph.attributes || {};
  const statements = graphData.entriesAndGraphOfContext.statements || [];
  const statementsById = new Map(statements.map(statement => [String(statement.id), statement]));

  const topClusters = (attrs.top_clusters || []).map(cluster => ({
    ...cluster,
    id: cluster.community,
    words: (cluster.nodes || []).map(node => node?.nodeName).filter(Boolean),
    topStatement: statementsById.get(String(cluster.topStatementId))?.content || '',
  }));

  return {
    topClusters,
    topWords: attrs.top_nodes || [],
    gaps: attrs.gaps || [],
    statements,
    relations: graphData.entriesAndGraphOfContext.graph.graphologyGraph.edges || [],
  };
}

function buildSessionNote({ scopeLabel, scope, extracted, question, graphMode, contextSettingsLabel }) {
  const summaryLines = [
    `- Scope: \`${scopeLabel}\``,
    `- Files analyzed: ${scope.files.length}`,
    `- Statements returned: ${extracted.statements.length}`,
    `- Relations returned: ${extracted.relations.length}`,
    `- Topics returned: ${extracted.topClusters.length}`,
    `- Gaps returned: ${extracted.gaps.length}`,
    `- Processing mode: \`${contextSettingsLabel}\``,
  ];

  const topicRows = extracted.topClusters.slice(0, 8).map((cluster, index) => ([
    `Topic ${index + 1}`,
    filterTerms(cluster.words).slice(0, 6).join(', '),
    formatRatio(cluster.numberRatio),
    formatRatio(cluster.bcRatio),
    previewText(cluster.topStatement),
  ]));

  const conceptRows = extracted.topWords
    .map(normalizeTopWord)
    .filter(node => node.name && !isLikelyNoise(node.name.toLowerCase()))
    .slice(0, 12)
    .map((node, index) => ([
      String(index + 1),
      node.name,
      String(node.degree ?? ''),
      formatNumberValue(node.bc),
    ]));

  const gapRows = extracted.gaps.slice(0, 6).map((gap, index) => ([
    `Gap ${index + 1}`,
    filterTerms(gap.from?.nodes?.map(node => node.nodeName) || []).slice(0, 4).join(', '),
    filterTerms(gap.to?.nodes?.map(node => node.nodeName) || []).slice(0, 4).join(', '),
    formatNumberValue(gap.distance),
    buildGapAction(gap),
  ]));

  const noiseCandidates = [
    ...extracted.topWords.map(normalizeTopWord).map(node => node.name.toLowerCase()),
    ...extracted.topClusters.flatMap(cluster => cluster.words.map(word => String(word).toLowerCase())),
  ]
    .filter(name => name && isLikelyNoise(name) && !isWikiLinkToken(name))
    .filter((name, index, values) => values.indexOf(name) === index)
    .slice(0, 8);

  const nextActions = buildNextActions({
    extracted,
    noiseCandidates,
    scopeLabel,
  });

  const sections = [
    `# InfraNodus Session - ${scopeLabel}`,
    '',
    '## Question',
    '',
    question,
    '',
    '## Scope Summary',
    '',
    summaryLines.join('\n'),
    '',
    '## Top Topics',
    '',
    topicRows.length
      ? buildTable(['Topic', 'Anchor Terms', 'Coverage', 'Bridge', 'Top Statement'], topicRows)
      : 'InfraNodus did not return topic clusters for this scope.',
    '',
    '## Top Concepts',
    '',
    conceptRows.length
      ? buildTable(['Rank', 'Concept', 'Degree', 'Bridge'], conceptRows)
      : 'InfraNodus did not return top concepts for this scope.',
    '',
    '## Gap Candidates',
    '',
    gapRows.length
      ? buildTable(['Gap', 'From Cluster', 'To Cluster', 'Distance', 'Suggested Action'], gapRows)
      : 'InfraNodus did not return gap candidates for this scope.',
    '',
    '## Noise Candidates',
    '',
    noiseCandidates.length
      ? noiseCandidates.map(token => `- \`${token}\``).join('\n')
      : 'No obvious noise tokens surfaced in the top concept list.',
    '',
    '## Next Actions',
    '',
    nextActions.map(action => `- ${action}`).join('\n'),
    '',
    '## Plugin Follow-Up',
    '',
    `Open \`${scopeLabel}\` in the InfraNodus plugin and validate this session in \`${graphMode}\`, then switch to \`gaps\` before making note-link changes.`,
    '',
  ];

  const frontmatter = buildFrontmatter({
    date: today(),
    session_type: 'graph',
    tool: 'InfraNodus',
    scope: scopeLabel,
    graph_mode: graphMode,
    question,
    status: 'Completed',
    source_files: scope.files.length,
    statement_count: extracted.statements.length,
    relation_count: extracted.relations.length,
    cluster_count: extracted.topClusters.length,
    gap_count: extracted.gaps.length,
    tags: ['graph-session', 'infranodus', 'automated'],
  });

  return `${frontmatter}\n\n${sections.join('\n')}`;
}

function buildNextActions({ extracted, noiseCandidates, scopeLabel }) {
  const actions = [];

  if (extracted.gaps.length > 0) {
    const firstGap = extracted.gaps[0];
    actions.push(buildGapAction(firstGap));
  }

  if (extracted.topClusters.length > 0) {
    const strongestCluster = [...extracted.topClusters].sort((a, b) => (b.bcRatio || 0) - (a.bcRatio || 0))[0];
    if (strongestCluster?.words?.length) {
      actions.push(`Review notes around \`${filterTerms(strongestCluster.words).slice(0, 4).join(', ')}\`; this is the strongest bridge-heavy topic in \`${scopeLabel}\`.`);
    }
  }

  if (noiseCandidates.length > 0) {
    actions.push(`Consider adding stopwords or rewriting table-heavy sections to suppress noise terms such as ${noiseCandidates.map(token => `\`${token}\``).join(', ')}.`);
  }

  if (!actions.length) {
    actions.push('Re-run this scope after the next major note or pull update to check for new bridges and gaps.');
  }

  return actions;
}

function buildGapAction(gap) {
  const fromTerms = filterTerms(gap.from?.nodes?.map(node => node.nodeName) || []).slice(0, 3);
  const toTerms = filterTerms(gap.to?.nodes?.map(node => node.nodeName) || []).slice(0, 3);
  if (!fromTerms.length || !toTerms.length) {
    return 'Review the gap in the plugin and decide whether a bridge note or direct wiki link is missing.';
  }

  return `Review whether \`${fromTerms.join(', ')}\` should explicitly connect to \`${toTerms.join(', ')}\` with a bridge note or direct wiki link.`;
}

function formatRatio(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '';
  return `${(value * 100).toFixed(1)}%`;
}

function formatNumberValue(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '';
  return Number(value).toFixed(3);
}

function previewText(value, maxLength = 140) {
  if (!value) return '';
  const trimmed = cleanInlineText(value);
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 3)}...`;
}

function defaultQuestionForScope(scopeLabel) {
  return `What topics, bridge nodes, and structural gaps dominate \`${scopeLabel}\` right now?`;
}

function getStopwordsForScope(scopeLabel) {
  const stopwords = new Set(GENERIC_STOPWORDS);
  for (const entry of SCOPE_STOPWORDS) {
    if (entry.match(scopeLabel)) {
      entry.stopwords.forEach(word => stopwords.add(word));
    }
  }
  return [...stopwords];
}

function isLikelyNoise(token) {
  const cleaned = stripWikiLink(token).trim().toLowerCase();
  if (!cleaned) return true;
  if (isDateStampedPullNoteToken(cleaned)) return true;
  if (isWikiLinkToken(token)) return false;
  if (CLUSTER_TERM_BLACKLIST.has(cleaned)) return true;
  if (NOISE_TOKENS.has(cleaned)) return true;
  if (/^[0-9]+$/.test(token)) return true;
  if (/^\d{4}[-_]\d{2}[-_]\d{2}$/.test(cleaned)) return true;
  if (/^[qh][1-4]$/i.test(token)) return true;
  if (/[_$]/.test(token)) return true;
  if (/^[a-z]{1,2}$/.test(token)) return true;
  if (/^(item|table|signal|signals|severity|date|watch|contract|guidance|status|event|role|edge|category|node|nodes|trigger|triggers|type|sort|start|filter|auto|active)$/.test(cleaned)) return true;
  return false;
}

function isWikiLinkToken(token) {
  return /^\[\[[^\]]+\]\]$/.test(String(token || '').trim());
}

function stripWikiLink(token) {
  return String(token || '').trim().replace(/^\[\[|\]\]$/g, '');
}

function isDateStampedPullNoteToken(token) {
  return /^\d{4}[_-]\d{2}[_-]\d{2}_/.test(stripWikiLink(token).toLowerCase());
}

function normalizeMarkdownForInfraNodus(content, absolutePath = '') {
  let normalized = content
    .replace(/^\uFEFF/, '')
    .replace(/^---[\s\S]*?---\s*/m, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\|.*$/gm, ' ')
    .replace(/^\s*[-*+]\s*\[[ xX]\]\s*/gm, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`+/g, '')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ')
    .replace(/[ \t]+/g, ' ');

  normalized = pruneSectionsForScope(normalized, absolutePath);

  normalized = normalized
    .split('\n')
    .map(line => cleanInlineText(line))
    .map(line => line.replace(/^\d+\.\s+/g, ''))
    .filter(line => line && !line.startsWith('TABLE ') && !line.startsWith('FROM ') && !line.startsWith('WHERE ') && !line.startsWith('SORT ') && !line.startsWith('LIMIT '))
    .join('\n');

  return normalized;
}

function pruneSectionsForScope(content, absolutePath) {
  const sections = splitMarkdownSections(content);
  const filtered = sections.filter(section => shouldKeepSection(section, absolutePath));
  return filtered.map(section => section.lines.join('\n')).join('\n');
}

function splitMarkdownSections(content) {
  const lines = String(content || '').split('\n');
  const sections = [];
  let current = { heading: '', lines: [] };

  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      sections.push(current);
      current = {
        heading: line.replace(/^##\s+/, '').trim(),
        lines: [line],
      };
      continue;
    }
    current.lines.push(line);
  }

  sections.push(current);
  return sections;
}

function shouldKeepSection(section, absolutePath) {
  const heading = section.heading || '';
  const bodyLines = section.lines
    .slice(heading ? 1 : 0)
    .map(line => cleanInlineText(line).replace(/^\d+\.\s+/g, ''))
    .filter(Boolean);

  if (!heading) {
    return bodyLines.length > 0;
  }

  if (absolutePath.includes('\\10_Theses\\') || absolutePath.includes('/10_Theses/')) {
    if (/^(Key Entities|20\d\d Catalyst Calendar|Macro Regime Sensitivity Matrix|Position Sizing & Risk|Signals to Watch|Data Feeds Connected|Related Dashboards|TAM|Risk Profile)$/i.test(heading)) {
      return false;
    }
  }

  if (absolutePath.includes('\\05_Data_Pulls\\') || absolutePath.includes('/05_Data_Pulls/')) {
    if (/^(Signals|All Signals|8-K Item Reference|About This Feed|Cap Legend)$/i.test(heading)) {
      return false;
    }
  }

  return bodyLines.some(line => /[A-Za-z]/.test(line));
}

function cleanInlineText(value) {
  return String(value)
    .replace(/^#{1,6}\s+/g, '')
    .replace(/^\s*[-*+]\s+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeTopWord(node) {
  if (typeof node === 'string') {
    return { name: node, degree: '', bc: '' };
  }

  return {
    name: node?.nodeName || '',
    degree: node?.degree ?? '',
    bc: node?.bc ?? node?.betweennessCentrality ?? '',
  };
}

function filterTerms(words) {
  return (words || [])
    .map(word => String(word || '').trim())
    .filter(word => word && !isLikelyNoise(word.toLowerCase()));
}
