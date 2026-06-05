import assert from 'node:assert/strict';

import { filterEnglishNewsArticles } from '../pullers/newsapi.mjs';

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

runTest('filters NewsAPI articles to likely English content', () => {
  const articles = filterEnglishNewsArticles([
    { title: 'Federal Reserve keeps rates unchanged', description: 'Markets watch the policy path.' },
    { title: 'El banco central sube las tasas de interes', description: 'Informe de politica monetaria.' },
  ]);

  assert.deepEqual(articles.map(article => article.title), ['Federal Reserve keeps rates unchanged']);
});
