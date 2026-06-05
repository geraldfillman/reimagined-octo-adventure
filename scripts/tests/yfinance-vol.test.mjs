import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildSummary } from '../pullers/yfinance-vol.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

await runTest('buildSummary includes required pull-note schema fields', () => {
  const note = buildSummary(
    {
      indices: {
        vix: {
          ticker: '^VIX',
          close: 18.25,
          change: 0.5,
          pct_change: 2.8,
          high: 18.9,
          low: 17.8,
          last_timestamp: '2026-05-07 16:00:00',
        },
      },
      pcr: [],
      term_structure: [],
    },
    { interval: '1d' }
  );

  assert.match(note, /^frequency: "daily"$/m);
  assert.match(note, /^signals: \[\]$/m);
  assert.match(note, /^cadence: "daily"$/m);
});

await runTest('python sidecar sanitizes non-finite numbers before JSON output', () => {
  const scriptPath = join(__dirname, '..', 'lib', 'yfinance_vol.py');
  const code = [
    'import importlib.util, json, math',
    `spec = importlib.util.spec_from_file_location("yfinance_vol", ${JSON.stringify(scriptPath)})`,
    'module = importlib.util.module_from_spec(spec)',
    'spec.loader.exec_module(module)',
    'payload = {"nan": float("nan"), "pos": float("inf"), "neg": -float("inf"), "nested": [1, float("nan")]}',
    'clean = module.sanitize_json_value(payload)',
    'assert clean == {"nan": None, "pos": None, "neg": None, "nested": [1, None]}',
    'json.dumps(clean, allow_nan=False)',
  ].join('\n');

  const result = runPythonSnippet(code);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

await runTest('buildSummary keeps schema-valid signal_status when VIX is unavailable', () => {
  const note = buildSummary(
    {
      indices: {
        vix: {
          ticker: '^VIX',
          close: null,
          change: null,
          pct_change: null,
          high: null,
          low: null,
          last_timestamp: '2026-05-07 12:00:00',
        },
      },
      pcr: [],
      term_structure: [],
    },
    { interval: '1d' }
  );

  assert.match(note, /^signal_status: "clear"$/m);
  assert.doesNotMatch(note, /^signal_status: "unknown"$/m);
});

function runPythonSnippet(code) {
  const candidates = process.platform === 'win32'
    ? ['py', 'python3', 'python']
    : ['python3', 'python', 'py'];

  let last = null;
  for (const exe of candidates) {
    const result = spawnSync(exe, ['-c', code], { encoding: 'utf-8' });
    if (result.error?.code === 'ENOENT') continue;
    return result;
  }
  return last || { status: 127, stderr: 'No Python interpreter found.' };
}
