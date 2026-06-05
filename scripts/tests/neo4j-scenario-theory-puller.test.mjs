import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';

const scriptsDir = path.resolve(import.meta.dirname, '..');

function runCli(args) {
  return spawnSync(process.execPath, ['run.mjs', ...args], {
    cwd: scriptsDir,
    encoding: 'utf8',
  });
}

test('neo4j scenario theory puller supports dry-run json without Neo4j writes', () => {
  const result = runCli([
    'pull',
    'neo4j-scenario-theory',
    '--scenario',
    '2026-leverage-oil-fed-policy-fragility',
    '--dry-run',
    '--json',
  ]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.dryRun, true);
  assert.equal(payload.scenario.id, 'scenario:2026-leverage-oil-fed-policy-fragility');
  assert.equal(payload.nodes.scenarios, 1);
  assert.equal(payload.nodes.shockVectors, 4);
  assert.equal(payload.nodes.riskThemes, 4);
  assert.equal(payload.relationships.themeMappings, 5);
});

test('neo4j scenario theory live mode requires explicit Neo4j password', () => {
  const result = spawnSync(
    process.execPath,
    [
      'run.mjs',
      'pull',
      'neo4j-scenario-theory',
      '--scenario',
      '2026-leverage-oil-fed-policy-fragility',
      '--json',
    ],
    {
      cwd: scriptsDir,
      encoding: 'utf8',
      env: {
        ...process.env,
        NEO4J_PASSWORD: '',
      },
    },
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /NEO4J_PASSWORD/);
});
