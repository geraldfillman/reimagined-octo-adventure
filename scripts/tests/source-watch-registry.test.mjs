import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { normalizeRegistry, resolveRegistryPath, selectSources } from '../lib/source-watch-registry.mjs';

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

runTest('normalizes registry rows and keeps enabled sources by default', () => {
  const registry = normalizeRegistry({
    schema_version: 1,
    sources: [
      { source: 'Carbon Brief', url: 'https://www.carbonbrief.org', category: 'energy transition', enabled: true },
      { source: 'SemiAnalysis', url: 'https://www.semianalysis.com', category: 'semiconductors', enabled: false },
    ],
  });
  assert.equal(registry.sources[0].id, 'carbon-brief');
  assert.equal(selectSources(registry, {}).length, 1);
  assert.equal(selectSources(registry, { includeDisabled: true }).length, 2);
});

runTest('resolves the default registry path inside the My_Data reports root when present', () => {
  const previous = process.env.REPORTS_VAULT_ROOT;
  const root = mkdtempSync(join(tmpdir(), 'source-watch-registry-'));
  try {
    process.env.REPORTS_VAULT_ROOT = root;
    const registryPath = join(root, 'Reports', 'System', 'config', 'source-watch-registry.json');
    mkdirSync(join(root, 'Reports', 'System', 'config'), { recursive: true });
    writeFileSync(registryPath, '{"schema_version":1,"sources":[]}');
    const path = resolveRegistryPath({});
    assert.equal(path, registryPath);
  } finally {
    if (previous === undefined) delete process.env.REPORTS_VAULT_ROOT;
    else process.env.REPORTS_VAULT_ROOT = previous;
    rmSync(root, { recursive: true, force: true });
  }
});

runTest('falls back to the archived Research Spine registry when the reports root has none', () => {
  const path = resolveRegistryPath({});
  assert.match(path.replace(/\\/g, '/'), /The Research Spine\/99_System\/config\/source-watch-registry\.json$/);
});
