import assert from 'node:assert/strict';

import { shouldWriteArtifacts as shouldWriteClinicalTrialsArtifacts } from '../pullers/clinicaltrials.mjs';
import { shouldWriteArtifacts as shouldWriteFdaArtifacts } from '../pullers/fda.mjs';
import { shouldWriteArtifacts as shouldWriteOpenFemaArtifacts } from '../pullers/openfema.mjs';

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

runTest('clinical trials dry-run suppresses artifact writes', () => {
  assert.equal(shouldWriteClinicalTrialsArtifacts({ 'dry-run': true }), false);
  assert.equal(shouldWriteClinicalTrialsArtifacts({}), true);
});

runTest('fda dry-run suppresses artifact writes', () => {
  assert.equal(shouldWriteFdaArtifacts({ 'dry-run': true }), false);
  assert.equal(shouldWriteFdaArtifacts({}), true);
});

runTest('openfema dry-run suppresses artifact writes', () => {
  assert.equal(shouldWriteOpenFemaArtifacts({ 'dry-run': true }), false);
  assert.equal(shouldWriteOpenFemaArtifacts({}), true);
});
