import assert from 'node:assert/strict';

import {
  isIgnoredPathPart,
  validateThesisFrontmatter,
} from '../validate-vault.mjs';

function parsedFrontmatter(raw) {
  const fields = new Set();
  const fieldPattern = /^([A-Za-z_][A-Za-z0-9_-]*):/gm;
  let match;
  while ((match = fieldPattern.exec(raw)) !== null) {
    fields.add(match[1]);
  }
  return { raw, fields };
}

const BASE_THESIS_FRONTMATTER =
  'node_type: "thesis"\n' +
  'conviction: "medium"\n' +
  'timeframe: "medium-term"\n' +
  'core_entities: []\n' +
  'supporting_regimes: []\n' +
  'invalidation_triggers: []\n';

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

runTest('retired qlib fields are ignored by thesis validation', () => {
  const errors = [];
  validateThesisFrontmatter(
    parsedFrontmatter(BASE_THESIS_FRONTMATTER + 'qlib_signal_status: "clear"\nqlib_last_run: "not-a-date"\n'),
    'Example Thesis.md',
    errors,
  );

  assert.deepEqual(errors, []);
});

runTest('conviction rollup fields are validated independently of retired qlib', () => {
  const errors = [];
  validateThesisFrontmatter(
    parsedFrontmatter(
      BASE_THESIS_FRONTMATTER +
      'suggested_conviction: "aggressive"\n' +
      'conviction_signal_count_7d: -1\n',
    ),
    'Example Thesis.md',
    errors,
  );

  assert.ok(errors.some(error => error.includes('Invalid suggested_conviction')));
  assert.ok(errors.some(error => error.includes('conviction_signal_count_7d')));
});

runTest('pull archive folders are excluded from active validation walks', () => {
  assert.equal(isIgnoredPathPart('_archive'), true);
});
