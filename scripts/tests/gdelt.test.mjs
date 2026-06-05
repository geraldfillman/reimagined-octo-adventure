import assert from 'node:assert/strict';

import {
  appendGdeltEnglishFilter,
  buildGdeltDocUrl,
  getGdeltRetryDelayMs,
  normalizeGdeltArticlesForTest,
  normalizeTimespan,
  resolveGdeltMaxAttemptsForTest,
  resolveTopics,
} from 'file:///C:/Users/CaveUser/Documents/Obsidian%20Vault/My_Data/scripts/pullers/gdelt.mjs';

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

runTest('builds a DOC 2.0 ArticleList JSON URL', () => {
  const url = buildGdeltDocUrl({
    baseUrl: 'https://api.gdeltproject.org/api/v2/doc/doc',
    query: '"Federal Reserve"',
    timespan: '1h',
    limit: 5,
  });
  const parsed = new URL(url);
  assert.equal(parsed.searchParams.get('query'), '"Federal Reserve" sourcelang:english');
  assert.equal(parsed.searchParams.get('mode'), 'artlist');
  assert.equal(parsed.searchParams.get('format'), 'json');
  assert.equal(parsed.searchParams.get('timespan'), '1h');
  assert.equal(parsed.searchParams.get('maxrecords'), '5');
  assert.equal(parsed.searchParams.get('sort'), 'datedesc');
});

runTest('does not duplicate a user-specified GDELT source language filter', () => {
  assert.equal(
    appendGdeltEnglishFilter('"Federal Reserve" sourcelang:spanish'),
    '"Federal Reserve" sourcelang:spanish'
  );
});

runTest('filters normalized GDELT articles to English content', () => {
  const articles = normalizeGdeltArticlesForTest([
    { url: 'https://example.com/en', title: 'Federal Reserve keeps rates unchanged', language: 'English' },
    { url: 'https://example.com/es', title: 'El banco central sube las tasas', language: 'Spanish' },
  ]);

  assert.deepEqual(articles.map(article => article.url), ['https://example.com/en']);
});

runTest('normalizes numeric timespans to minutes and keeps 15min minimum shape', () => {
  assert.equal(normalizeTimespan('15'), '15min');
  assert.equal(normalizeTimespan('1h'), '1h');
  assert.equal(normalizeTimespan('bad'), '15min');
});

runTest('uses a conservative cooldown when Retry-After is absent', () => {
  assert.equal(getGdeltRetryDelayMs(null, 0), 30000);
  assert.equal(getGdeltRetryDelayMs('', 1), 30000);
  assert.equal(getGdeltRetryDelayMs('9', 0), 9000);
});

runTest('allows a single-attempt GDELT best-effort mode', () => {
  assert.equal(resolveGdeltMaxAttemptsForTest('1'), 1);
  assert.equal(resolveGdeltMaxAttemptsForTest('99'), 3);
  assert.equal(resolveGdeltMaxAttemptsForTest('bad'), 3);
});

runTest('default all-topic radar avoids broad OR queries', () => {
  const topics = resolveTopics({ all: true });
  assert.ok(topics.length >= 8);
  assert.equal(topics.some(topic => /\sOR\s/i.test(topic.query)), false);
});
