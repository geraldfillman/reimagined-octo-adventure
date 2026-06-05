import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { getBaseUrl, getSourceName, listSources } from '../lib/config.mjs';
import {
  buildSemanticScholarSearchUrl,
  filterEnglishSemanticScholarPapers,
  getSemanticScholarHeaders,
  normalizeSemanticScholarPaper,
  resolveUniqueNotePath,
  resolveTopics,
  selectTopCitedPapers,
} from '../pullers/semantic-scholar.mjs';

function runTest(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

runTest('builds Semantic Scholar search URLs with query, limit, and fields', () => {
  const url = buildSemanticScholarSearchUrl({ query: 'antimicrobial resistance', limit: 3 });
  const parsed = new URL(url);

  assert.equal(parsed.hostname, 'api.semanticscholar.org');
  assert.equal(parsed.pathname, '/graph/v1/paper/search');
  assert.equal(parsed.searchParams.get('query'), 'antimicrobial resistance');
  assert.equal(parsed.searchParams.get('limit'), '3');
  assert.match(parsed.searchParams.get('fields'), /title/);
  assert.match(parsed.searchParams.get('fields'), /authors/);
});

runTest('builds top-cited Semantic Scholar URLs with a relevance pool for local citation ranking', () => {
  const url = buildSemanticScholarSearchUrl({
    query: 'market liquidity funding',
    limit: 5,
    topCited: true,
  });
  const parsed = new URL(url);

  assert.equal(parsed.pathname, '/graph/v1/paper/search');
  assert.equal(parsed.searchParams.get('query'), 'market liquidity funding');
  assert.equal(parsed.searchParams.get('limit'), '100');
  assert.equal(parsed.searchParams.has('sort'), false);
  assert.match(parsed.searchParams.get('fields'), /citationCount/);
});

runTest('registers Semantic Scholar in the API source registry', () => {
  assert.equal(getSourceName('semanticscholar'), 'Semantic Scholar Academic Graph');
  assert.equal(getBaseUrl('semanticscholar'), 'https://api.semanticscholar.org/graph/v1');
  assert.equal(listSources().some(source => source.id === 'semanticscholar' && source.requiresKey), true);
});

runTest('adds x-api-key header only when a key is present', () => {
  assert.deepEqual(getSemanticScholarHeaders(''), {
    'User-Agent': 'MyData-Vault/1.0 (Semantic Scholar puller)',
  });
  assert.deepEqual(getSemanticScholarHeaders('abc123'), {
    'User-Agent': 'MyData-Vault/1.0 (Semantic Scholar puller)',
    'x-api-key': 'abc123',
  });
});

runTest('normalizes missing Semantic Scholar paper fields safely', () => {
  const paper = normalizeSemanticScholarPaper({
    paperId: 'p1',
    title: 'A useful paper',
    authors: [{ name: 'Ada' }, { name: 'Grace' }, { name: 'Katherine' }, { name: 'Mary' }],
    year: 2026,
    venue: 'Test Venue',
    citationCount: 12,
    openAccessPdf: { url: 'https://example.com/paper.pdf' },
    url: 'https://semanticscholar.org/paper/p1',
  });

  assert.equal(paper.paperId, 'p1');
  assert.equal(paper.authors, 'Ada, Grace, Katherine et al.');
  assert.equal(paper.year, 2026);
  assert.equal(paper.citationCount, 12);
  assert.equal(paper.pdfUrl, 'https://example.com/paper.pdf');
});

runTest('selects the requested number of top-cited papers by citation count', () => {
  const papers = selectTopCitedPapers([
    { title: 'Low cited', citationCount: 2 },
    { title: 'Most cited', citationCount: 99 },
    { title: 'Middle cited', citationCount: 12 },
  ], 2);

  assert.deepEqual(papers.map(paper => paper.title), ['Most cited', 'Middle cited']);
});

runTest('keeps same-day Semantic Scholar pulls immutable by choosing a unique note path', () => {
  const dir = mkdtempSync(join(tmpdir(), 'semantic-scholar-note-'));
  try {
    const first = join(dir, '2026-05-08_SemanticScholar_Test_Top_Cited.md');
    const second = join(dir, '2026-05-08_SemanticScholar_Test_Top_Cited_2.md');
    writeFileSync(first, 'existing note', 'utf-8');
    writeFileSync(second, 'second existing note', 'utf-8');

    assert.equal(resolveUniqueNotePath(first), join(dir, '2026-05-08_SemanticScholar_Test_Top_Cited_3.md'));
    assert.equal(existsSync(resolveUniqueNotePath(join(dir, 'fresh.md'))), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

runTest('filters Semantic Scholar papers to likely English content', () => {
  const papers = filterEnglishSemanticScholarPapers([
    { title: 'Federal Reserve liquidity and market stress', abstract: 'This paper studies funding stress in markets.' },
    { title: 'El banco central sube las tasas de interes', abstract: 'Informe sobre politica monetaria.' },
  ]);

  assert.deepEqual(papers.map(paper => paper.title), ['Federal Reserve liquidity and market stress']);
});

runTest('resolves strategy queue topics for config-driven research pulls', () => {
  const topics = resolveTopics({ queue: 'strategies' });
  assert.ok(topics.length >= 5);
  assert.equal(topics.some(topic => /post earnings/i.test(topic.query)), true);
  assert.equal(topics.every(topic => topic.tags.includes('strategy')), true);
});
