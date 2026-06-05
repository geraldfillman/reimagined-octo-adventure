import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { gatherAlertTickerTasks } from '../pullers/knowledge-gap-tasks.mjs';

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

function makeTempVault() {
  const root = mkdtempSync(join(tmpdir(), 'kg-alert-ticker-'));
  mkdirSync(join(root, '05_Data_Pulls', 'Market'), { recursive: true });
  return root;
}

function writeNote(dir, filename, frontmatter) {
  const fm = Object.entries(frontmatter)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  writeFileSync(join(dir, filename), `---\n${fm}\n---\n\nBody text.\n`, 'utf-8');
}

// Test 1: empty when no market notes exist
await runTest('gatherAlertTickerTasks returns empty array when no market notes exist', async () => {
  const root = makeTempVault();
  try {
    const tasks = await gatherAlertTickerTasks(root, 10);
    assert.deepEqual(tasks, []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// Test 2: empty when all notes have signal_status: clear or watch
await runTest('gatherAlertTickerTasks returns empty array when all notes have signal_status: clear or watch', async () => {
  const root = makeTempVault();
  const marketDir = join(root, '05_Data_Pulls', 'Market');
  try {
    writeNote(marketDir, 'AAPL.md', { symbol: 'AAPL', signal_status: 'clear' });
    writeNote(marketDir, 'MSFT.md', { symbol: 'MSFT', signal_status: 'watch' });
    const tasks = await gatherAlertTickerTasks(root, 10);
    assert.deepEqual(tasks, []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// Test 3: emits one task per alert-status ticker
await runTest('gatherAlertTickerTasks emits one task per alert-status ticker found in market notes', async () => {
  const root = makeTempVault();
  const marketDir = join(root, '05_Data_Pulls', 'Market');
  try {
    writeNote(marketDir, 'AAPL.md', { symbol: 'AAPL', signal_status: 'alert' });
    writeNote(marketDir, 'MSFT.md', { symbol: 'MSFT', signal_status: 'clear' });
    const tasks = await gatherAlertTickerTasks(root, 10);
    assert.equal(tasks.length, 1);
    assert.match(tasks[0], /AAPL/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// Test 4: emits one task per critical-status ticker
await runTest('gatherAlertTickerTasks emits one task per critical-status ticker', async () => {
  const root = makeTempVault();
  const marketDir = join(root, '05_Data_Pulls', 'Market');
  try {
    writeNote(marketDir, 'TSLA.md', { symbol: 'TSLA', signal_status: 'critical' });
    writeNote(marketDir, 'NVDA.md', { symbol: 'NVDA', signal_status: 'critical' });
    const tasks = await gatherAlertTickerTasks(root, 10);
    assert.equal(tasks.length, 2);
    const symbols = tasks.map(t => t).join('\n');
    assert.match(symbols, /TSLA/);
    assert.match(symbols, /NVDA/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// Test 5: task format contains [knowledge-gap/alert-ticker] label and ticker symbol
await runTest('task format contains [knowledge-gap/alert-ticker] label and the ticker symbol', async () => {
  const root = makeTempVault();
  const marketDir = join(root, '05_Data_Pulls', 'Market');
  try {
    writeNote(marketDir, 'AAPL.md', { symbol: 'AAPL', signal_status: 'alert' });
    const tasks = await gatherAlertTickerTasks(root, 10);
    assert.equal(tasks.length, 1);
    assert.match(tasks[0], /\[knowledge-gap\/alert-ticker\//);
    assert.match(tasks[0], /AAPL/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// Test 6: task format contains the signal_status value (alert/critical)
await runTest('task format contains the signal_status value (alert/critical)', async () => {
  const root = makeTempVault();
  const marketDir = join(root, '05_Data_Pulls', 'Market');
  try {
    writeNote(marketDir, 'SPY.md', { symbol: 'SPY', signal_status: 'critical' });
    const tasks = await gatherAlertTickerTasks(root, 10);
    assert.equal(tasks.length, 1);
    assert.match(tasks[0], /critical/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// Test 7: deduplicates — two notes for same ticker → one task (highest severity wins)
await runTest('deduplicates: two notes for same ticker → one task (highest severity wins)', async () => {
  const root = makeTempVault();
  const marketDir = join(root, '05_Data_Pulls', 'Market');
  try {
    writeNote(marketDir, 'AAPL-1.md', { symbol: 'AAPL', signal_status: 'alert' });
    writeNote(marketDir, 'AAPL-2.md', { symbol: 'AAPL', signal_status: 'critical' });
    const tasks = await gatherAlertTickerTasks(root, 10);
    assert.equal(tasks.length, 1);
    // highest severity (critical) should win
    assert.match(tasks[0], /critical/);
    assert.doesNotMatch(tasks[0], /alert.*alert/); // not duplicated
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// Test 8: does not emit tasks for tickers with signal_status: watch (only alert/critical)
await runTest('does not emit tasks for tickers with signal_status: watch (only alert/critical)', async () => {
  const root = makeTempVault();
  const marketDir = join(root, '05_Data_Pulls', 'Market');
  try {
    writeNote(marketDir, 'AAPL.md', { symbol: 'AAPL', signal_status: 'watch' });
    writeNote(marketDir, 'MSFT.md', { symbol: 'MSFT', signal_status: 'alert' });
    writeNote(marketDir, 'GOOG.md', { symbol: 'GOOG', signal_status: 'clear' });
    const tasks = await gatherAlertTickerTasks(root, 10);
    assert.equal(tasks.length, 1);
    assert.match(tasks[0], /MSFT/);
    assert.doesNotMatch(tasks.join('\n'), /AAPL/);
    assert.doesNotMatch(tasks.join('\n'), /GOOG/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
