import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { gatherConvictionTasks } from '../pullers/knowledge-gap-tasks.mjs';

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
  const root = mkdtempSync(join(tmpdir(), 'kg-conviction-'));
  mkdirSync(join(root, '05_Data_Pulls', 'Theses'), { recursive: true });
  return root;
}

function writeViewpoints(root, sections) {
  const dir = join(root, '05_Data_Pulls', 'Theses');
  const body = sections
    .map(({ header, sector, symbol }) =>
      `### ${header}: ${symbol}\n\n- **Thesis / Sector**: ${sector} / ${sector}\n\nBody text.\n`
    )
    .join('\n');
  const content =
    `---\ndata_type: "opportunity_viewpoints"\ndate_pulled: "2026-05-24"\n---\n\n## Viewpoint Queue\n\n` +
    body;
  writeFileSync(join(dir, '2026-05-24_Opportunity_Viewpoints.md'), content, 'utf-8');
}

// Test 1: empty when no Theses files exist
await runTest('gatherConvictionTasks returns empty array when no viewpoints files exist', async () => {
  const root = makeTempVault();
  try {
    const tasks = await gatherConvictionTasks(root, 10);
    assert.deepEqual(tasks, []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// Test 2: non-biotech sectors produce no tasks
await runTest('gatherConvictionTasks returns empty for non-biotech sectors', async () => {
  const root = makeTempVault();
  try {
    writeViewpoints(root, [
      { header: 'Disclosure Confirmation Wedge', sector: 'semis', symbol: 'ONTO' },
      { header: 'Disclosure Confirmation Wedge', sector: 'gridequipment', symbol: 'HUBB' },
    ]);
    const tasks = await gatherConvictionTasks(root, 10);
    assert.deepEqual(tasks, []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// Test 3: biotech sector produces a task
await runTest('gatherConvictionTasks emits a task for alzheimers sector', async () => {
  const root = makeTempVault();
  try {
    writeViewpoints(root, [
      { header: 'Disclosure Confirmation Wedge', sector: 'alzheimers', symbol: 'BIIB' },
    ]);
    const tasks = await gatherConvictionTasks(root, 10);
    assert.equal(tasks.length, 1);
    assert.match(tasks[0], /alzheimers/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// Test 4: task format contains [knowledge-gap/conviction-research/] label
await runTest('task format contains [knowledge-gap/conviction-research/] label', async () => {
  const root = makeTempVault();
  try {
    writeViewpoints(root, [
      { header: 'Disclosure Confirmation Wedge', sector: 'glp1', symbol: 'NVO' },
    ]);
    const tasks = await gatherConvictionTasks(root, 10);
    assert.equal(tasks.length, 1);
    assert.match(tasks[0], /\[knowledge-gap\/conviction-research\//);
    assert.match(tasks[0], /PubMed|arXiv/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// Test 5: deduplicates — two viewpoints for same sector → one task
await runTest('deduplicates: two viewpoints for same sector produce one task', async () => {
  const root = makeTempVault();
  try {
    writeViewpoints(root, [
      { header: 'Disclosure Confirmation Wedge', sector: 'alzheimers', symbol: 'BIIB' },
      { header: 'Disclosure Confirmation Wedge', sector: 'alzheimers', symbol: 'LILLY' },
    ]);
    const tasks = await gatherConvictionTasks(root, 10);
    assert.equal(tasks.length, 1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// Test 6: multiple distinct biotech sectors each produce a task
await runTest('multiple distinct biotech sectors each produce a task', async () => {
  const root = makeTempVault();
  try {
    writeViewpoints(root, [
      { header: 'Disclosure Confirmation Wedge', sector: 'alzheimers', symbol: 'BIIB' },
      { header: 'Disclosure Confirmation Wedge', sector: 'psychedelic', symbol: 'CMPS' },
      { header: 'Disclosure Confirmation Wedge', sector: 'semis', symbol: 'ONTO' },
    ]);
    const tasks = await gatherConvictionTasks(root, 10);
    assert.equal(tasks.length, 2);
    const joined = tasks.join('\n');
    assert.match(joined, /alzheimers/i);
    assert.match(joined, /psychedelic/i);
    assert.doesNotMatch(joined, /semis/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// Test 7: max cap is respected
await runTest('max cap limits the number of tasks returned', async () => {
  const root = makeTempVault();
  try {
    writeViewpoints(root, [
      { header: 'Wedge', sector: 'alzheimers', symbol: 'BIIB' },
      { header: 'Wedge', sector: 'glp1', symbol: 'NVO' },
      { header: 'Wedge', sector: 'antimicrobial', symbol: 'ACHN' },
      { header: 'Wedge', sector: 'psychedelic', symbol: 'CMPS' },
    ]);
    const tasks = await gatherConvictionTasks(root, 2);
    assert.equal(tasks.length, 2);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// Test 8: reads the most recent viewpoints file when multiple exist
await runTest('reads the most recently modified viewpoints file when multiple exist', async () => {
  const root = makeTempVault();
  const dir = join(root, '05_Data_Pulls', 'Theses');
  try {
    // Older file — biotech sector
    writeFileSync(
      join(dir, '2026-05-01_Opportunity_Viewpoints.md'),
      `---\ndata_type: "opportunity_viewpoints"\n---\n\n### Wedge: BIIB\n\n- **Thesis / Sector**: alzheimers / alzheimers\n`,
      'utf-8'
    );
    // Newer file — no biotech
    writeFileSync(
      join(dir, '2026-05-24_Opportunity_Viewpoints.md'),
      `---\ndata_type: "opportunity_viewpoints"\n---\n\n### Wedge: ONTO\n\n- **Thesis / Sector**: semis / semis\n`,
      'utf-8'
    );
    const tasks = await gatherConvictionTasks(root, 10);
    // Should read newest file → no biotech → empty
    assert.deepEqual(tasks, []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
