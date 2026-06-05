import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { run } from '../bridge/ingest-world-inbox.mjs';

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

await runTest('dry-run reports processable inbox files without moving or writing', async () => {
  const worldRoot = makeWorldFixture();
  try {
    const result = await run({ worldRoot, date: '2026-05-13', 'dry-run': true });

    assert.equal(result.dryRun, true);
    assert.equal(result.processed, 2);
    assert.equal(result.archived.length, 0);
    assert.equal(existsSync(join(worldRoot, '_Inbox', 'Fed clipping.md')), true);
    assert.equal(existsSync(join(worldRoot, 'Reports', 'Inbox Reports', '2026-05-13 - Inbox Ingestion Batch.md')), false);
  } finally {
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

await runTest('ingest writes batch observation and archives processable inbox files', async () => {
  const worldRoot = makeWorldFixture();
  try {
    const result = await run({ worldRoot, date: '2026-05-13' });

    const observationPath = join(worldRoot, 'Reports', 'Inbox Reports', '2026-05-13 - Inbox Ingestion Batch.md');
    const archiveFedPath = join(worldRoot, '500-archive', 'Inbox', '2026-05-13', 'Fed clipping.md');
    const archivePacketPath = join(worldRoot, '500-archive', 'Inbox', '2026-05-13', 'World Machine Candidate Packets', 'GEV packet.md');

    assert.equal(result.dryRun, false);
    assert.equal(result.processed, 2);
    assert.equal(result.archived.length, 2);
    assert.equal(existsSync(observationPath), true);
    assert.equal(existsSync(archiveFedPath), true);
    assert.equal(existsSync(archivePacketPath), true);
    assert.equal(existsSync(join(worldRoot, '_Inbox', 'Fed clipping.md')), false);
    assert.equal(existsSync(join(worldRoot, '_Inbox', 'Inbox Ingestion Runbook.md')), true);
    assert.equal(existsSync(join(worldRoot, '_Inbox', '_Inbox README.md')), true);

    const observation = readFileSync(observationPath, 'utf-8');
    assert.match(observation, /# 2026-05-13 - Inbox Ingestion Batch/);
    assert.match(observation, /Fed clipping/);
    assert.match(observation, /GEV packet/);
    assert.match(observation, /\[\[500-archive\/Inbox\/2026-05-13\/Fed clipping\|Fed clipping\]\]/);
    assert.doesNotMatch(observation, /\[\[_Inbox\/Fed clipping/);
  } finally {
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

await runTest('ingest chooses a unique observation file when the daily batch note exists', async () => {
  const worldRoot = makeWorldFixture();
  try {
    writeFixture(
      worldRoot,
      'Reports/Inbox Reports/2026-05-13 - Inbox Ingestion Batch.md',
      '# Existing batch\n',
    );

    const result = await run({ worldRoot, date: '2026-05-13' });
    const secondObservationPath = join(worldRoot, 'Reports', 'Inbox Reports', '2026-05-13 - Inbox Ingestion Batch 2.md');

    assert.equal(result.observationPath, secondObservationPath);
    assert.equal(existsSync(secondObservationPath), true);
    assert.equal(readFileSync(join(worldRoot, 'Reports', 'Inbox Reports', '2026-05-13 - Inbox Ingestion Batch.md'), 'utf-8'), '# Existing batch\n');
  } finally {
    rmSync(worldRoot, { recursive: true, force: true });
  }
});

function makeWorldFixture() {
  const root = mkdtempSync(join(tmpdir(), 'world-inbox-ingest-'));
  writeFixture(root, '_Inbox/Inbox Ingestion Runbook.md', '# Inbox Ingestion Runbook\n');
  writeFixture(root, '_Inbox/_Inbox README.md', '# Inbox README\n');
  writeFixture(root, '_Inbox/Fed clipping.md', [
    '# Fed clipping',
    '',
    'The Fed signaled a higher-for-longer posture as yields pushed through a key level.',
    '',
    'This has implications for duration and equity multiples.',
    '',
  ].join('\n'));
  writeFixture(root, '_Inbox/World Machine Candidate Packets/GEV packet.md', [
    '---',
    'type: world_machine_candidate',
    'promotion_status: approved',
    '---',
    '',
    '# GEV packet',
    '',
    'GEV power demand watchpoint needs strategy routing.',
    '',
  ].join('\n'));
  return root;
}

function writeFixture(root, relPath, content) {
  const filePath = join(root, ...relPath.split('/'));
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf-8');
}
