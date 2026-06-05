/**
 * semantic-scholar.mjs - Semantic Scholar Academic Graph paper search puller.
 *
 * Uses the Graph API paper search endpoint with the x-api-key header when
 * SEMANTIC_SCHOLAR_API_KEY is configured in the vault .env file.
 *
 * Usage:
 *   node run.mjs pull semantic-scholar --query "antimicrobial resistance" --limit 10
 *   node run.mjs pull semantic-scholar --amr
 *   node run.mjs pull semantic-scholar --ai --year 2025-
 *   node run.mjs pull semantic-scholar --query "robot foundation model" --dry-run
 */

import { existsSync, mkdirSync, readFileSync } from 'fs';
import { basename, dirname, extname, join } from 'path';
import { getApiKey, getBaseUrl, getPullsDir, getResearchVaultRoot, getReviewVaultRoot } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import { keepEnglishContent } from '../lib/language-filter.mjs';
import { buildNote, buildTable, writeNote, today, dateStampedFilename } from '../lib/markdown.mjs';

const DEFAULT_LIMIT = 10;
const DEFAULT_TOP_CITED_LIMIT = 5;
const DEFAULT_TOP_CITED_CANDIDATE_LIMIT = 100;
const MAX_LIMIT = 100;
const SEARCH_FIELDS = [
  'paperId',
  'externalIds',
  'url',
  'title',
  'abstract',
  'venue',
  'year',
  'publicationDate',
  'publicationTypes',
  'authors',
  'citationCount',
  'influentialCitationCount',
  'openAccessPdf',
].join(',');

const TOPICS = {
  amr: {
    label: 'Antimicrobial Resistance',
    query: 'antimicrobial resistance novel antibiotics bacteriophage therapy',
    outputName: 'SemanticScholar_AMR',
    tags: ['research', 'semantic-scholar', 'amr', 'biotech'],
  },
  ai: {
    label: 'AI Research',
    query: 'foundation model generative ai retrieval augmented generation',
    outputName: 'SemanticScholar_AI',
    tags: ['research', 'semantic-scholar', 'ai'],
  },
  robotics: {
    label: 'Robotics',
    query: 'robot foundation model humanoid robotics autonomous manipulation',
    outputName: 'SemanticScholar_Robotics',
    tags: ['research', 'semantic-scholar', 'robotics'],
  },
  defense: {
    label: 'Defense AI',
    query: 'autonomous systems target recognition drone swarm counter-UAV',
    outputName: 'SemanticScholar_DefenseAI',
    tags: ['research', 'semantic-scholar', 'defense', 'ai'],
  },
};

const STRATEGY_TOPICS = [
  {
    label: 'Quality Compounders',
    query: 'quality investing profitability persistence free cash flow compounding',
    outputName: 'SemanticScholar_strategy_quality_compounders',
    tags: ['research', 'semantic-scholar', 'strategy', 'quality'],
  },
  {
    label: 'Deep Value Re-Rating',
    query: 'deep value investing valuation rerating mean reversion equity returns',
    outputName: 'SemanticScholar_strategy_deep_value_rerating',
    tags: ['research', 'semantic-scholar', 'strategy', 'value'],
  },
  {
    label: 'Momentum Breadth',
    query: 'equity momentum market breadth trend following cross sectional returns',
    outputName: 'SemanticScholar_strategy_momentum_breadth',
    tags: ['research', 'semantic-scholar', 'strategy', 'momentum'],
  },
  {
    label: 'Earnings Revision PEAD',
    query: 'post earnings announcement drift analyst revisions equity returns',
    outputName: 'SemanticScholar_strategy_pead_revisions',
    tags: ['research', 'semantic-scholar', 'strategy', 'earnings'],
  },
  {
    label: 'Low Volatility Defensive',
    query: 'low volatility anomaly defensive equity investing drawdown risk',
    outputName: 'SemanticScholar_strategy_low_volatility',
    tags: ['research', 'semantic-scholar', 'strategy', 'defensive'],
  },
];

export function buildSemanticScholarSearchUrl({
  query,
  limit = DEFAULT_LIMIT,
  year = '',
  topCited = false,
  candidateLimit = DEFAULT_TOP_CITED_CANDIDATE_LIMIT,
} = {}) {
  if (!query || !String(query).trim()) {
    throw new Error('Semantic Scholar query is required. Pass --query "search terms" or a topic flag.');
  }

  const params = new URLSearchParams({
    query: String(query).trim(),
    fields: SEARCH_FIELDS,
  });

  params.set('limit', String(topCited ? clampLimit(candidateLimit) : clampLimit(limit)));

  if (year) params.set('year', String(year));

  return `${getBaseUrl('semanticscholar')}/paper/search?${params}`;
}

export function getSemanticScholarHeaders(apiKey) {
  const headers = {
    'User-Agent': 'MyData-Vault/1.0 (Semantic Scholar puller)',
  };
  if (apiKey && String(apiKey).trim()) {
    headers['x-api-key'] = String(apiKey).trim();
  }
  return headers;
}

export function normalizeSemanticScholarPaper(paper = {}) {
  const authors = Array.isArray(paper.authors)
    ? paper.authors.map(author => author?.name).filter(Boolean)
    : [];

  return Object.freeze({
    paperId: paper.paperId ?? '',
    title: paper.title ?? 'Untitled',
    year: paper.year ?? '',
    publicationDate: paper.publicationDate ?? '',
    authors: formatAuthors(authors),
    venue: paper.venue ?? '',
    citationCount: Number.isFinite(paper.citationCount) ? paper.citationCount : 0,
    influentialCitationCount: Number.isFinite(paper.influentialCitationCount) ? paper.influentialCitationCount : 0,
    url: paper.url ?? '',
    pdfUrl: paper.openAccessPdf?.url ?? '',
    abstract: paper.abstract ?? '',
    externalIds: paper.externalIds ?? {},
    publicationTypes: Array.isArray(paper.publicationTypes) ? paper.publicationTypes : [],
  });
}

export function selectTopCitedPapers(papers = [], limit = DEFAULT_TOP_CITED_LIMIT) {
  const n = clampLimit(limit);
  return [...papers]
    .sort((left, right) =>
      (Number(right.citationCount) || 0) - (Number(left.citationCount) || 0) ||
      (Number(right.influentialCitationCount) || 0) - (Number(left.influentialCitationCount) || 0) ||
      String(left.title || '').localeCompare(String(right.title || ''))
    )
    .slice(0, n);
}

export function filterEnglishSemanticScholarPapers(papers = []) {
  return papers.filter(paper => keepEnglishContent(paper, {
    textFields: ['title', 'abstract', 'venue'],
  }));
}

export async function pull(flags = {}) {
  const topCited = Boolean(flags['top-cited'] || flags.topCited || flags['highest-cited'] || flags.highestCited);
  const limit = clampLimit(flags.limit ?? (topCited ? DEFAULT_TOP_CITED_LIMIT : DEFAULT_LIMIT));
  const candidateLimit = clampLimit(flags['candidate-limit'] ?? flags.candidateLimit ?? DEFAULT_TOP_CITED_CANDIDATE_LIMIT);
  const year = flags.year ?? '';
  const topics = resolveTopics(flags).slice(0, clampTopicCount(flags['max-topics'] ?? flags.max_topics ?? 10));
  const apiKey = getApiKey('semanticscholar');
  const results = [];

  for (const topic of topics) {
    const url = buildSemanticScholarSearchUrl({ query: topic.query, limit, year, topCited, candidateLimit });

    console.log(`\nSemantic Scholar: fetching "${topic.label}" ${topCited ? 'top-cited references' : 'papers'}...`);
    console.log(`  Query: ${topic.query}`);
    if (year) console.log(`  Year filter: ${year}`);

    if (flags['dry-run']) {
      console.log(`  Dry run: would request ${url}`);
      results.push({ source: 'semanticscholar', query: topic.query, topCited, candidateLimit, dryRun: true });
      continue;
    }

    const data = await getJson(url, {
      headers: getSemanticScholarHeaders(apiKey),
      timeout: 45_000,
    });

    const total = Number.isFinite(data?.total) ? data.total : 0;
    const normalizedPapers = Array.isArray(data?.data)
      ? filterEnglishSemanticScholarPapers(data.data.map(normalizeSemanticScholarPaper))
      : [];
    const papers = topCited
      ? selectTopCitedPapers(normalizedPapers, limit)
      : normalizedPapers;

    console.log(`  ${total.toLocaleString()} estimated results, showing ${papers.length}`);
    papers.slice(0, 3).forEach(paper => console.log(`  - [${paper.year || 'n.d.'}] ${paper.title.slice(0, 70)}`));

    const outDir = join(getPullsDir(), 'Research');
    mkdirSync(outDir, { recursive: true });
    const filePath = resolveUniqueNotePath(
      join(outDir, dateStampedFilename(topCited ? `${topic.outputName}_Top_Cited` : topic.outputName))
    );
    const note = buildSemanticScholarNote({ topic, total, papers, limit, year, topCited, candidateLimit });
    writeNote(filePath, note);
    console.log(`  Wrote: ${filePath}`);
    results.push({ source: 'semanticscholar', query: topic.query, total, shown: papers.length, topCited, candidateLimit, filePath });
  }

  return results.length === 1 ? results[0] : { source: 'semanticscholar', topics: results };
}

export function resolveTopics(flags) {
  if (flags.query) {
    return [{
      label: `Custom Query: ${flags.query}`,
      query: String(flags.query),
      outputName: `SemanticScholar_${safeName(flags.query)}`,
      tags: ['research', 'semantic-scholar', 'custom-query'],
    }];
  }

  if (flags.queue === 'market-cycle' || flags['market-cycle-queue']) {
    return loadMarketCycleTopics(flags.config);
  }

  if (flags.queue === 'strategies' || flags['strategy-queue']) {
    return STRATEGY_TOPICS;
  }

  for (const [key, topic] of Object.entries(TOPICS)) {
    if (flags[key]) return [topic];
  }

  return [TOPICS.ai];
}

function loadMarketCycleTopics(configPath) {
  const reviewPath = join(getReviewVaultRoot(), 'Reports', 'System', 'config', 'market-cycle-monitor.config.json');
  const archivePath = join(getResearchVaultRoot(), '99_System', 'config', 'market-cycle-monitor.config.json');
  const path = configPath || (existsSync(reviewPath) ? reviewPath : archivePath);
  if (!existsSync(path)) {
    throw new Error(`Market-cycle Semantic Scholar config not found: ${path}`);
  }
  const parsed = JSON.parse(readFileSync(path, 'utf-8'));
  const seedTopics = Array.isArray(parsed.semantic_scholar_seed_topics)
    ? parsed.semantic_scholar_seed_topics
    : [];
  if (seedTopics.length === 0) {
    throw new Error(`No semantic_scholar_seed_topics found in ${path}`);
  }
  return seedTopics.map(topic => ({
    label: topic.name || topic.label || topic.id || topic.query,
    query: topic.query,
    outputName: `SemanticScholar_market_cycle_${safeName(topic.name || topic.label || topic.id || topic.query)}`,
    tags: ['research', 'semantic-scholar', 'market-cycle', 'macro-monitoring'],
  }));
}

function buildSemanticScholarNote({ topic, total, papers, limit, year, topCited = false, candidateLimit = DEFAULT_TOP_CITED_CANDIDATE_LIMIT }) {
  const rows = papers.map((paper, index) => {
    const base = [
      paper.year || paper.publicationDate || 'N/A',
      paper.title.length > 70 ? `${paper.title.slice(0, 70)}...` : paper.title,
      paper.authors,
      paper.venue || 'N/A',
      String(paper.citationCount),
      String(paper.influentialCitationCount),
      paper.url ? `[Semantic Scholar](${paper.url})` : '',
    ];
    return topCited ? [String(index + 1), ...base] : base;
  });

  return buildNote({
    frontmatter: {
      title: topCited
        ? `Semantic Scholar Top Cited References - ${topic.label}`
        : `Semantic Scholar Papers - ${topic.label}`,
      source: 'Semantic Scholar Academic Graph',
      date_pulled: today(),
      total_results: total,
      shown: papers.length,
      domain: 'research',
      data_type: topCited ? 'semantic_scholar_top_cited_papers' : 'semantic_scholar_papers',
      frequency: 'on-demand',
      signal_status: 'clear',
      signals: [],
      query: topic.query,
      year_filter: year || '',
      language_filter: 'english',
      selection_mode: topCited ? 'top_cited_within_search_pool' : 'search_relevance',
      candidate_pool_limit: topCited ? candidateLimit : undefined,
      tags: topic.tags,
    },
    sections: [
      {
        heading: topCited
          ? `Top Cited References (${papers.length} shown / ${total.toLocaleString()} estimated)`
          : `Paper Search Results (${papers.length} shown / ${total.toLocaleString()} estimated)`,
        content: rows.length
          ? buildTable(
              topCited
                ? ['Rank', 'Year', 'Title', 'Authors', 'Venue', 'Citations', 'Influential', 'Link']
                : ['Year', 'Title', 'Authors', 'Venue', 'Citations', 'Influential', 'Link'],
              rows
            )
          : 'No papers returned for this query.',
      },
      {
        heading: 'Notable Abstracts',
        content: papers
          .filter(paper => paper.abstract)
          .slice(0, 5)
          .map(paper => `### ${paper.title}\n\n${paper.abstract}`)
          .join('\n\n') || 'No abstracts returned for the top papers.',
      },
      {
        heading: 'About This Feed',
        content: [
          `- **Query**: \`${topic.query}\``,
          `- **Limit**: ${limit}`,
          topCited ? `- **Candidate pool limit**: ${candidateLimit}` : '',
          `- **Year filter**: ${year || 'none'}`,
          `- **Selection**: ${topCited ? 'highest citation count within the `/paper/search` relevance pool' : 'search relevance via `/paper/search`'}`,
          '- **Language filter**: English-only metadata/title/abstract filter',
          '- **API**: Semantic Scholar Academic Graph `/paper/search`',
          `- **Auto-pulled**: ${today()}`,
          '',
          '> Semantic Scholar search results are useful for research discovery and metadata enrichment.',
          '> Validate paper quality, venue, method, and recency before promoting claims into synthesis.',
        ].join('\n'),
      },
    ],
  });
}

export function resolveUniqueNotePath(filePath) {
  if (!existsSync(filePath)) return filePath;

  const dir = dirname(filePath);
  const ext = extname(filePath);
  const stem = basename(filePath, ext);
  let counter = 2;
  let candidate = join(dir, `${stem}_${counter}${ext}`);
  while (existsSync(candidate)) {
    counter += 1;
    candidate = join(dir, `${stem}_${counter}${ext}`);
  }
  return candidate;
}

function clampLimit(value) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(n, MAX_LIMIT);
}

function clampTopicCount(value) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return 10;
  return Math.min(n, 25);
}

function formatAuthors(authors) {
  if (authors.length === 0) return '';
  return authors.slice(0, 3).join(', ') + (authors.length > 3 ? ' et al.' : '');
}

function safeName(value) {
  return String(value).replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60) || 'Custom';
}
