/**
 * osint-spiderfoot.mjs — Passive SpiderFoot OSINT scan for covered entities
 *
 * Usage:
 *   node run.mjs scan osint-spiderfoot --domain example.com
 *   node run.mjs scan osint-spiderfoot --domain example.com --dry-run
 *
 * Requires SpiderFoot running locally: python sf.py -l 127.0.0.1:5001
 *
 * Output:
 *   05_Data_Pulls/osint/spiderfoot-<domain>-<date>.json
 *   06_Signals/ note if breach/credential findings are detected
 */

import { spawnSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeOsintNote } from '../lib/osint-notes.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = join(__dirname, '..', '..');
const OUTPUT_DIR = join(VAULT_ROOT, '05_Data_Pulls', 'osint');

// Passive-only SpiderFoot modules — no active scanning, no brute force
const PASSIVE_MODULES = [
  'sfp_dnsresolve',
  'sfp_haveibeenpwned',
  'sfp_shodan',
  'sfp_threatcrowd',
  'sfp_virustotal',
  'sfp_dnsdumpster',
  'sfp_whois',
  'sfp_crt',          // Certificate transparency
  'sfp_github',
  'sfp_pastebin',
  'sfp_hunter',
].join(',');

const SPIDERFOOT_HOST = process.env.SPIDERFOOT_HOST ?? '127.0.0.1';
const SPIDERFOOT_PORT = process.env.SPIDERFOOT_PORT ?? '5001';

export async function pull(flags = {}) {
  const domain = flags.domain;
  if (!domain) {
    console.error('Error: --domain <domain> is required.');
    console.error('Example: node run.mjs scan osint-spiderfoot --domain example.com');
    process.exit(1);
  }

  const today = new Date().toISOString().slice(0, 10);
  const outputFile = join(OUTPUT_DIR, `spiderfoot-${domain}-${today}.json`);
  const dryRun = flags['dry-run'] ?? false;

  console.log(`\n🔍 SpiderFoot passive scan: ${domain}`);
  console.log(`   Modules: ${PASSIVE_MODULES.split(',').length} passive modules`);
  console.log(`   Output:  ${outputFile}`);

  if (dryRun) {
    console.log('\n[dry-run] Would execute:');
    console.log(`  spiderfoot -s ${domain} -m ${PASSIVE_MODULES} -o json`);
    return;
  }

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Check if SpiderFoot CLI is available
  const checkResult = spawnSync('spiderfoot', ['--help'], { encoding: 'utf8' });
  if (checkResult.error) {
    console.error('❌ SpiderFoot CLI not found. Install with: pip install spiderfoot');
    console.error('   Or start the REST server: python sf.py -l 127.0.0.1:5001');
    process.exit(1);
  }

  console.log('\n⏳ Running scan (passive modules only, this may take 2–5 minutes)...');

  const result = spawnSync(
    'spiderfoot',
    ['-s', domain, '-m', PASSIVE_MODULES, '-o', 'json'],
    { encoding: 'utf8', timeout: 10 * 60 * 1000 }  // 10 min max
  );

  if (result.error) {
    console.error(`❌ SpiderFoot error: ${result.error.message}`);
    process.exit(1);
  }

  let findings;
  try {
    findings = JSON.parse(result.stdout);
  } catch {
    // SpiderFoot sometimes outputs non-JSON lines first; extract JSON portion
    const jsonStart = result.stdout.indexOf('[');
    if (jsonStart === -1) {
      console.error('❌ No JSON output from SpiderFoot. Raw output:');
      console.error(result.stdout.slice(0, 500));
      process.exit(1);
    }
    findings = JSON.parse(result.stdout.slice(jsonStart));
  }

  const output = {
    domain,
    scan_date: today,
    tool: 'spiderfoot',
    mode: 'passive',
    modules_run: PASSIVE_MODULES.split(',').length,
    findings_count: findings.length,
    findings,
  };

  writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf8');
  writeOsintNote({ tool: 'spiderfoot', target: domain, targetType: 'domain', resultCount: findings.length, alertCount: highSeverity.length, outputFile, today, tags: ['passive', 'breach', 'credential'] });
  console.log(`\n✅ Scan complete: ${findings.length} findings`);
  console.log(`   Saved: ${outputFile}`);

  // Check for high-severity findings that warrant a Signal note
  const breachTypes = ['EMAILADDR', 'LEAKSITE_CONTENT', 'CREDENTIAL_COMPROMISED', 'DARKWEB'];
  const highSeverity = findings.filter(f => breachTypes.includes(f[4]));

  if (highSeverity.length > 0) {
    console.log(`\n⚠️  ${highSeverity.length} high-severity finding(s) detected:`);
    highSeverity.slice(0, 5).forEach(f => console.log(`   [${f[4]}] ${f[1]}`));
    console.log('\n   → Consider creating a P1/P2 Signal note in 06_Signals/');
    console.log(`   → Reference: ${outputFile}`);
  } else {
    console.log('\n   No breach/leak indicators detected in this scan.');
  }

  return output;
}
