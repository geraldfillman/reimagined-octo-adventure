import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import {
  buildConsolidationPlan,
  classifyWorldMachineRelPath,
  run,
} from '../bridge/consolidate-world-machine.mjs';

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

function writeFixture(root, relPath, content = 'fixture') {
  const filePath = join(root, ...relPath.split('/'));
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

await runTest('classifier keeps World_Machine exception surfaces', () => {
  const keep = [
    '_Inbox/Market Positioning Ledger.md',
    '500-archive/Inbox/2026-06-02/example.md',
    '500-archive/Inbox/Event_Connections/2026-06-02_Inbox_Event_Connections.html',
    '500-archive/Inbox/Observations/2026-06-02 - Inbox Ingestion Batch.md',
    '500-archive/Reports/System/event_connections/2026-06-02_Inbox_Event_Connections.html',
    '500-archive/Stale/Positioning/_index.md',
    '.obsidian/app.json',
    'AGENTS.md',
  ];

  for (const relPath of keep) {
    assert.equal(classifyWorldMachineRelPath(relPath).action, 'keep', relPath);
  }

  assert.equal(classifyWorldMachineRelPath('Reports/Daily/2026-06-02 Daily Briefing.md').action, 'migrate');
  assert.equal(classifyWorldMachineRelPath('Reports/System/event_connections/2026-06-02_Inbox_Event_Connections.html').action, 'migrate');
  assert.equal(classifyWorldMachineRelPath('03_Macro_and_Economy/Observations/2026-06-02 - Inbox Ingestion Batch.md').action, 'migrate');
  assert.equal(classifyWorldMachineRelPath('Entities/Stocks/GEV.md').action, 'migrate');
});

await runTest('dry-run plan maps reports to Reports and research to preserved My_Data review path', () => {
  const engineRoot = mkdtempSync(join(tmpdir(), 'my-data-consolidate-'));
  const worldRoot = mkdtempSync(join(tmpdir(), 'world-machine-consolidate-'));

  try {
    writeFixture(worldRoot, 'Reports/Daily/example.md', 'daily');
    writeFixture(worldRoot, 'Entities/Stocks/GEV.md', 'entity');
    writeFixture(worldRoot, '_Inbox/Market Positioning Ledger.md', 'ledger');

    const plan = buildConsolidationPlan({ engineRoot, worldRoot, date: '2026-06-02' });
    const daily = plan.items.find(item => item.relPath === 'Reports/Daily/example.md');
    const entity = plan.items.find(item => item.relPath === 'Entities/Stocks/GEV.md');
    const ledger = plan.items.find(item => item.relPath === '_Inbox/Market Positioning Ledger.md');

    assert.equal(daily.destRelPath, 'Reports/Daily/example.md');
    assert.equal(entity.destRelPath, '14_Review_and_Research/World_Machine/Entities/Stocks/GEV.md');
    assert.equal(ledger.action, 'keep');
  } finally {
    rmSync(engineRoot, { recursive: true, force: true });
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

await runTest('live temp run copies, archives, writes manifest, and leaves exceptions', async () => {
  const engineRoot = mkdtempSync(join(tmpdir(), 'my-data-consolidate-live-'));
  const worldRoot = mkdtempSync(join(tmpdir(), 'world-machine-consolidate-live-'));

  try {
    writeFixture(worldRoot, 'Reports/Daily/example.md', 'daily');
    writeFixture(
      worldRoot,
      'Entities/Stocks/GEV.md',
      'open obsidian://open?vault=World_Machine&file=Reports%2FDaily%2Fexample.md'
    );
    writeFixture(worldRoot, '_Inbox/Market Positioning Ledger.md', 'ledger');
    writeFixture(worldRoot, '500-archive/Inbox/Event_Connections/example.html', '<html></html>');

    const result = await run({
      'engine-root': engineRoot,
      'world-root': worldRoot,
      date: '2026-06-02',
    });

    assert.equal(result.dryRun, false);
    assert.equal(existsSync(join(engineRoot, 'Reports', 'Daily', 'example.md')), true);
    assert.equal(existsSync(join(engineRoot, '14_Review_and_Research', 'World_Machine', 'Entities', 'Stocks', 'GEV.md')), true);
    assert.equal(existsSync(join(worldRoot, '500-archive', 'Consolidated_To_My_Data', '2026-06-02', 'Reports', 'Daily', 'example.md')), true);
    assert.equal(existsSync(join(worldRoot, '500-archive', 'Consolidated_To_My_Data', '2026-06-02', 'Entities', 'Stocks', 'GEV.md')), true);
    assert.equal(existsSync(join(worldRoot, '_Inbox', 'Market Positioning Ledger.md')), true);
    assert.equal(existsSync(join(worldRoot, '500-archive', 'Inbox', 'Event_Connections', 'example.html')), true);
    assert.equal(existsSync(join(engineRoot, '99_System', 'migration', 'world-machine-consolidation', '2026-06-02_manifest.json')), true);
    assert.equal(existsSync(join(engineRoot, 'Reports', 'System', 'inventory', 'world-machine-consolidation-2026-06-02.md')), true);

    const rewritten = readFileSync(join(engineRoot, '14_Review_and_Research', 'World_Machine', 'Entities', 'Stocks', 'GEV.md'), 'utf-8');
    assert.match(rewritten, /vault=My_Data/);
    assert.match(rewritten, /Reports%2FDaily%2Fexample\.md/);
  } finally {
    rmSync(engineRoot, { recursive: true, force: true });
    rmSync(worldRoot, { recursive: true, force: true });
  }
});
