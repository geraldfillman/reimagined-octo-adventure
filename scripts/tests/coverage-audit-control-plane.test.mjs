import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { buildCoverageAudit } from '../system/coverage-audit.mjs';

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

function writeNote(path, frontmatter) {
  mkdirSync(join(path, '..'), { recursive: true });
  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n');
  writeFileSync(path, `---\n${yaml}\n---\n\n# ${frontmatter.name || frontmatter.title}\n`, 'utf-8');
}

runTest('coverage audit normalizes linked pullers and separates intentional non-automation', () => {
  const root = mkdtempSync(join(tmpdir(), 'coverage-audit-control-'));
  try {
    const scriptsRoot = join(root, 'scripts');
    mkdirSync(join(root, '01_Data_Sources', 'Frontier_Science'), { recursive: true });
    mkdirSync(join(root, '01_Data_Sources', 'Macro'), { recursive: true });
    mkdirSync(join(root, '00_Dashboard'), { recursive: true });
    mkdirSync(join(scriptsRoot, 'pullers'), { recursive: true });

    writeFileSync(join(scriptsRoot, 'pullers', 'semantic-scholar.mjs'), 'export async function pull() {}\n', 'utf-8');
    writeFileSync(join(root, '00_Dashboard', 'Research.md'), '```dataview\nFROM "05_Data_Pulls/Research"\n```\n', 'utf-8');

    writeNote(join(root, '01_Data_Sources', 'Frontier_Science', 'Semantic Scholar Academic Graph.md'), {
      name: 'Semantic Scholar Academic Graph',
      category: 'Frontier_Science',
      status: 'active',
      integrated: true,
      linked_puller: 'pull semantic-scholar',
    });
    writeNote(join(root, '01_Data_Sources', 'Macro', 'World Gold Council Goldhub.md'), {
      name: 'World Gold Council Goldhub',
      category: 'Macro',
      status: 'active',
      integrated: false,
      automation_status: 'manual-only',
    });

    const result = buildCoverageAudit({
      vaultRoot: root,
      scriptsRoot,
      catalog: [
        {
          name: 'semantic-scholar',
          module: 'semantic-scholar.mjs',
          mode: 'raw',
          domains: ['Research'],
          data_types: ['research_papers'],
          source_notes: ['01_Data_Sources/Frontier_Science/Semantic Scholar Academic Graph.md'],
          requires_keys: ['SEMANTIC_SCHOLAR_API_KEY'],
          supports_dry_run: true,
          supports_json: false,
          scheduled_allowed: false,
          manual_only: true,
        },
      ],
    });

    assert.equal(result.gaps.sourcePuller.length, 0);
    assert.equal(result.intentional.manualOnly.length, 1);
    assert.equal(result.intentional.manualOnly[0].name, 'World Gold Council Goldhub');
    assert.equal(result.gaps.pullerSource.length, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
