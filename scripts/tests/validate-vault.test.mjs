import assert from 'node:assert/strict';
import { join } from 'node:path';

import {
  validateQuantReport,
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

runTest('standalone qlib_signal_status does not require a full thesis rollup', () => {
  const errors = [];
  validateThesisFrontmatter(
    parsedFrontmatter('qlib_signal_status: "clear"\n'),
    'Example Thesis.md',
    errors,
  );

  assert.deepEqual(errors, []);
});

runTest('full thesis rollups still require the core qlib contract', () => {
  const errors = [];
  validateThesisFrontmatter(
    parsedFrontmatter(
      'qlib_last_run: "2026-04-01"\n' +
      'qlib_signal_status: "watch"\n',
    ),
    'Example Thesis.md',
    errors,
  );

  assert.ok(errors.some(error => error.includes('qlib_best_ic')));
  assert.ok(errors.some(error => error.includes('qlib_positive_factor_count')));
});

runTest('quant notes with schema version 2 must include report-specific frontmatter', () => {
  const errors = [];
  validateQuantReport(
    parsedFrontmatter(
      'data_type: "backtest"\n' +
      'qlib_schema_version: 2\n',
    ),
    join('Quant', '2026-04-01_Qlib_Backtest_Test.md'),
    errors,
  );

  assert.ok(errors.some(error => error.includes('Quant note missing "universe_size"')));
  assert.ok(errors.some(error => error.includes('Quant note missing "avg_turnover"')));
});
