/**
 * osint-recon.mjs — Recon-ng passive corporate intelligence scan
 *
 * Usage:
 *   node run.mjs scan osint-recon --domain example.com
 *   node run.mjs scan osint-recon --domain example.com --dry-run
 *
 * Requires: pip install recon-ng
 *
 * Output:
 *   05_Data_Pulls/osint/recon-<domain>-<date>.json
 *
 * Note: Recon-ng uses a workspace/module system. This wrapper creates a
 * temporary workspace, runs passive contact modules, exports to JSON, and
 * cleans up. Only passive modules are invoked.
 */

import { spawnSync, execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';
import { writeOsintNote } from '../lib/osint-notes.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = join(__dirname, '..', '..');
const OUTPUT_DIR = join(VAULT_ROOT, '05_Data_Pulls', 'osint');

// Passive-only modules for corporate intelligence
const PASSIVE_MODULES = [
  'recon/domains-contacts/whois_pocs',
  'recon/domains-hosts/certificate_transparency',
  'recon/domains-hosts/google_site_web',
  'recon/domains-hosts/bing_domain_web',
];

export async function pull(flags = {}) {
  const domain = flags.domain;
  if (!domain) {
    console.error('Error: --domain <domain> is required.');
    console.error('Example: node run.mjs scan osint-recon --domain example.com');
    process.exit(1);
  }

  const today = new Date().toISOString().slice(0, 10);
  const outputFile = join(OUTPUT_DIR, `recon-${domain}-${today}.json`);
  const workspaceName = `vault-osint-${domain.replace(/\./g, '-')}-${Date.now()}`;
  const dryRun = flags['dry-run'] ?? false;

  console.log(`\n🕵️  Recon-ng passive scan: ${domain}`);
  console.log(`   Modules: ${PASSIVE_MODULES.length} passive modules`);
  console.log(`   Output:  ${outputFile}`);

  if (dryRun) {
    console.log('\n[dry-run] Would run recon-ng workspace with modules:');
    PASSIVE_MODULES.forEach(m => console.log(`   ${m}`));
    return;
  }

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Check recon-ng is available
  const checkResult = spawnSync('recon-ng', ['--version'], { encoding: 'utf8' });
  if (checkResult.error) {
    console.error('❌ recon-ng not found. Install with: pip install recon-ng');
    process.exit(1);
  }

  // Build recon-ng resource file (batch commands)
  const reportPath = join(OUTPUT_DIR, `_tmp-recon-${workspaceName}.json`);
  const resourceCommands = [
    `workspaces create ${workspaceName}`,
    `db insert domains domain=${domain}`,
    ...PASSIVE_MODULES.flatMap(mod => [
      `modules load ${mod}`,
      `run`,
    ]),
    `modules load reporting/json`,
    `options set FILENAME ${reportPath}`,
    `run`,
    `workspaces remove ${workspaceName}`,
    `exit`,
  ].join('\n');

  const resourceFile = join(tmpdir(), `recon-resource-${Date.now()}.rc`);
  writeFileSync(resourceFile, resourceCommands, 'utf8');

  console.log('\n⏳ Running recon-ng (passive modules, ~2–4 minutes)...');

  const result = spawnSync(
    'recon-ng',
    ['-r', resourceFile],
    { encoding: 'utf8', timeout: 8 * 60 * 1000 }  // 8 min max
  );

  // Clean up resource file
  try { rmSync(resourceFile); } catch {}

  if (result.error) {
    console.error(`❌ recon-ng error: ${result.error.message}`);
    process.exit(1);
  }

  // Read the exported JSON report
  let reportData = { contacts: [], hosts: [], domains: [] };
  if (existsSync(reportPath)) {
    try {
      reportData = JSON.parse(readFileSync(reportPath, 'utf8'));
      rmSync(reportPath);
    } catch {
      console.warn('⚠️  Could not parse recon-ng JSON report; saving raw stdout.');
    }
  }

  const output = {
    domain,
    scan_date: today,
    tool: 'recon-ng',
    mode: 'passive',
    modules_run: PASSIVE_MODULES,
    contacts: reportData.contacts ?? [],
    hosts: reportData.hosts ?? [],
    domains: reportData.domains ?? [],
  };

  writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf8');
  writeOsintNote({ tool: 'recon-ng', target: domain, targetType: 'domain', resultCount: output.contacts.length + output.hosts.length + output.domains.length, alertCount: output.contacts.length > 0 ? 1 : 0, outputFile, today, tags: ['corporate-intel', 'passive', 'contacts'] });

  console.log(`\n✅ Scan complete:`);
  console.log(`   Contacts found: ${output.contacts.length}`);
  console.log(`   Hosts found:    ${output.hosts.length}`);
  console.log(`   Saved: ${outputFile}`);

  return output;
}
