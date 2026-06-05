import assert from 'node:assert/strict';

import { filterEnglishArxivEntries } from '../pullers/arxiv.mjs';
import { filterEnglishPubMedArticles } from '../pullers/pubmed.mjs';

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

runTest('filters arXiv entries to likely English content', () => {
  const entries = filterEnglishArxivEntries([
    { title: 'Transformer models for power grid forecasting', summary: 'We study forecasting methods.' },
    { title: 'El banco central sube las tasas de interes', summary: 'Informe de politica monetaria.' },
  ]);

  assert.deepEqual(entries.map(entry => entry.title), ['Transformer models for power grid forecasting']);
});

runTest('filters PubMed articles to likely English content', () => {
  const articles = filterEnglishPubMedArticles([
    { title: 'Antimicrobial resistance surveillance in hospitals', journal: 'Science advances' },
    { title: 'El banco central sube las tasas de interes', journal: 'Revista medica' },
  ]);

  assert.deepEqual(articles.map(article => article.title), ['Antimicrobial resistance surveillance in hospitals']);
});
