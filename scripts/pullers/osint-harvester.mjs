/**
 * osint-harvester.mjs — theHarvester passive email/subdomain scan
 *
 * Usage:
 *   node run.mjs scan osint-harvester --domain example.com
 *   node run.mjs scan osint-harvester --domain example.com --sources google,bing,shodan
 *   node run.mjs scan osint-harvester --domain example.com --dry-run
 *
 * Requires: pip install theHarvester
 *
 * Output:
 *   05_Data_Pulls/osint/harvester-<domain>-<date>.json
 */

import { spawnSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeOsintNote } from '../lib/osint-notes.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = join(__dirname, '..', '..');
const OUTPUT_DIR = join(VAULT_ROOT, '05_Data_Pulls', 'osint');

// Default passive sources — no active brute force
const DEFAULT_SOURCES = 'google,bing,duckduckgo,yahoo,baidu,crtsh';

export async function pull(flags = {}) {
  const domain = flags.domain;
  if (!domain) {
    console.error('Error: --domain <domain> is required.');
    console.error('Example: node run.mjs scan osint-harvester --domain example.com');
    process.exit(1);
  }

  const sources = flags.sources ?? DEFAULT_SOURCES;
  const today = new Date().toISOString().slice(0, 10);
  const outputFile = join(OUTPUT_DIR, `harvester-${domain}-${today}.json`);
  const dryRun = flags['dry-run'] ?? false;

  console.log(`\n🌾 theHarvester passive scan: ${domain}`);
  console.log(`   Sources: ${sources}`);
  console.log(`   Output:  ${outputFile}`);

  if (dryRun) {
    console.log('\n[dry-run] Would execute:');
    console.log(`  theHarvester -d ${domain} -b ${sources} -f /tmp/harvester-output`);
    return;
  }

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const tmpJson = join(OUTPUT_DIR, `_tmp-harvester-${domain}`);

  const result = spawnSync(
    'theHarvester',
    ['-d', domain, '-b', sources, '-f', tmpJson],
    { encoding: 'utf8', timeout: 5 * 60 * 1000 }  // 5 min max
  );

  if (result.error) {
    console.error(`❌ theHarvester error: ${result.error.message}`);
    console.error('   Install with: pip install theHarvester');
    process.exit(1);
  }

  // theHarvester writes <tmpJson>.json — read and rewrite to our output path
  const tmpJsonPath = `${tmpJson}.json`;
  if (!existsSync(tmpJsonPath)) {
    console.error('❌ No JSON output file produced.');
    console.error('   stdout:', result.stdout.slice(0, 300));
    process.exit(1);
  }

  const { readFileSync, unlinkSync } = await import('fs');
  let rawData;
  try {
    rawData = JSON.parse(readFileSync(tmpJsonPath, 'utf8'));
    unlinkSync(tmpJsonPath);
    // Also remove XML if created
    const xmlPath = `${tmpJson}.xml`;
    if (existsSync(xmlPath)) unlinkSync(xmlPath);
  } catch {
    console.error('❌ Failed to parse theHarvester JSON output.');
    process.exit(1);
  }

  const output = {
    domain,
    scan_date: today,
    tool: 'theHarvester',
    mode: 'passive',
    sources_queried: sources.split(','),
    emails: rawData.emails ?? [],
    hosts: rawData.hosts ?? [],
    ips: rawData.ips ?? [],
    urls: rawData.urls ?? [],
  };

  writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf8');
  writeOsintNote({ tool: 'theHarvester', target: domain, targetType: 'domain', resultCount: output.emails.length + output.hosts.length + output.ips.length, alertCount: output.emails.length, outputFile, today, tags: ['email', 'subdomain', 'passive'] });

  console.log(`\n✅ Scan complete:`);
  console.log(`   Emails found:  ${output.emails.length}`);
  console.log(`   Hosts found:   ${output.hosts.length}`);
  console.log(`   IPs found:     ${output.ips.length}`);
  console.log(`   Saved: ${outputFile}`);

  if (output.emails.length > 0) {
    console.log('\n📧 Sample emails:');
    output.emails.slice(0, 5).forEach(e => console.log(`   ${e}`));
  }

  return output;
}
