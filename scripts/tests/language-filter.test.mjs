import assert from 'node:assert/strict';

import { isLikelyEnglishText, keepEnglishContent } from '../lib/language-filter.mjs';

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

runTest('accepts records with explicit English language metadata', () => {
  assert.equal(keepEnglishContent({ language: 'English', title: 'El banco central sube las tasas' }), true);
  assert.equal(keepEnglishContent({ language: 'en', title: 'Market stress report' }), true);
  assert.equal(keepEnglishContent({ language: 'en-US', title: 'Market stress report' }), true);
});

runTest('rejects records with explicit non-English language metadata', () => {
  assert.equal(keepEnglishContent({ language: 'Spanish', title: 'Federal Reserve policy report' }), false);
  assert.equal(keepEnglishContent({ lang: 'de', title: 'Market report' }), false);
});

runTest('uses title and summary heuristics when language metadata is absent', () => {
  assert.equal(isLikelyEnglishText('Federal Reserve keeps rates unchanged as markets wait'), true);
  assert.equal(isLikelyEnglishText('El banco central sube las tasas de interes'), false);
});
