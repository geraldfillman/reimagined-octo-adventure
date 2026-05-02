import assert from 'node:assert/strict';

import { buildSignalQualityScanNote } from '../pullers/signal-quality-scan.mjs';

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

runTest('signal quality scan note includes required pull note frontmatter', () => {
  const note = buildSignalQualityScanNote({
    alpha: {
      composite_score: 0.75,
      hit_rate: 0.7,
      noise_rate: 0.1,
      reliability_score: 0.9,
      freshness_score: 1,
      assessed: 4,
      low_quality: false,
    },
  }, {
    modules_scored: 1,
    low_quality_modules: [],
    top_module: 'alpha',
    bottom_module: 'alpha',
  }, 30);

  assert.match(note, /frequency: "daily"/);
  assert.match(note, /signals: \[\]/);
});
