import assert from 'node:assert/strict';

import { stripWikiLink } from '../lib/conviction-tracker.mjs';

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

runTest('normalizes wikilinks parsed as one-item inline arrays', () => {
  assert.equal(stripWikiLink(['[Psychedelic Mental Health Revolution]']), 'Psychedelic Mental Health Revolution');
});

runTest('normalizes quoted wikilinks and aliases', () => {
  assert.equal(stripWikiLink('[[Alzheimers Disease Modification]]'), 'Alzheimers Disease Modification');
  assert.equal(stripWikiLink('[[GLP-1 Metabolic Disease Revolution|GLP-1]]'), 'GLP-1 Metabolic Disease Revolution');
});
