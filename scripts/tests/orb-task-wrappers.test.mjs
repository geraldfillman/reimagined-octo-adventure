import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const SCRIPTS_DIR = resolve(TEST_DIR, '..');

function scriptText(name) {
  return readFileSync(join(SCRIPTS_DIR, name), 'utf-8');
}

await runTest('ORB entropy wrapper reads Market pull notes from My_Data, not Research Spine', () => {
  const text = scriptText('task-orb.ps1');
  assert.match(text, /\$myDataRoot\s*=\s*Get-MyDataRoot/);
  assert.match(text, /\$marketDir\s*=\s*Join-Path\s+\$myDataRoot\s+'05_Data_Pulls\\Market'/);
  assert.doesNotMatch(text, /\$marketDir\s*=\s*Join-Path\s+\$researchRoot\s+'05_Data_Pulls\\Market'/);
});

await runTest('ORB strategy wrapper reads Market and Alerts pull notes from My_Data', () => {
  const text = scriptText('task-orb-strategy.ps1');
  assert.match(text, /\$myDataRoot\s*=\s*Get-MyDataRoot/);
  assert.match(text, /\$marketDir\s*=\s*Join-Path\s+\$myDataRoot\s+'05_Data_Pulls\\Market'/);
  assert.match(text, /\$alertsDir\s*=\s*Join-Path\s+\$myDataRoot\s+'05_Data_Pulls\\Alerts'/);
});

await runTest('ORB premarket wrapper updates My_Data dashboard canvas', () => {
  const text = scriptText('task-premarket.ps1');
  assert.match(text, /\$myDataRoot\s*=\s*Get-MyDataRoot/);
  assert.match(text, /\$canvasPath\s*=\s*Resolve-Path\s+\(Join-Path\s+\$myDataRoot\s+'00_Dashboard\\ORB \+ Entropy Strategy Dashboard\.canvas'\)/);
});

await runTest('compression scan scheduled task has a longer execution limit', () => {
  const text = scriptText('schedule-orb-tasks.ps1');
  assert.match(text, /ExecutionTimeLimitMinutes/);
  assert.match(text, /-TaskName\s+'Entropy Compression Scan'[\s\S]*-ExecutionTimeLimitMinutes\s+60/);
});
