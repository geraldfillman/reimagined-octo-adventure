/**
 * osint-amass.mjs — Amass passive DNS intel scan
 *
 * Usage:
 *   node run.mjs scan osint-amass --domain example.com
 *   node run.mjs scan osint-amass --domain example.com --dry-run
 *
 * Requires Amass: go install github.com/owasp-amass/amass/v4/...@master
 * Or download binary: https://github.com/owasp-amass/amass/releases
 *
 * Output:
 *   05_Data_Pulls/osint/amass-<domain>-<date>.json
 */

import { spawnSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';
import { writeOsintNote } from '../lib/osint-notes.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = join(__dirname, '..', '..');
const OUTPUT_DIR = join(VAULT_ROOT, '05_Data_Pulls', 'osint');

export async function pull(flags = {}) {
  const domain = flags.domain;
  if (!domain) {
    console.error('Error: --domain <domain> is required.');
    console.error('Example: node run.mjs scan osint-amass --domain example.com');
    process.exit(1);
  }

  const today = new Date().toISOString().slice(0, 10);
  const outputFile = join(OUTPUT_DIR, `amass-${domain}-${today}.json`);
  const tmpOutput = join(tmpdir(), `amass-${domain}-${Date.now()}.json`);
  const dryRun = flags['dry-run'] ?? false;

  console.log(`\n🔭 Amass passive intel scan: ${domain}`);
  console.log(`   Mode: passive (certificate transparency + DNS)`);
  console.log(`   Output: ${outputFile}`);

  if (dryRun) {
    console.log('\n[dry-run] Would execute:');
    console.log(`  amass intel -d ${domain} -passive -json ${tmpOutput}`);
    return;
  }

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Check Amass is installed
  const checkResult = spawnSync('amass', ['version'], { encoding: 'utf8' });
  if (checkResult.error) {
    console.error('❌ Amass binary not found.');
    console.error('   Install: go install github.com/owasp-amass/amass/v4/...@master');
    console.error('   Or download: https://github.com/owasp-amass/amass/releases');
    process.exit(1);
  }

  console.log('\n⏳ Running passive intel (cert transparency + DNS, ~1–3 minutes)...');

  const result = spawnSync(
    'amass',
    ['intel', '-d', domain, '-passive', '-json', tmpOutput],
    { encoding: 'utf8', timeout: 5 * 60 * 1000 }  // 5 min max
  );

  if (result.error) {
    console.error(`❌ Amass error: ${result.error.message}`);
    process.exit(1);
  }

  // amass intel -json writes newline-delimited JSON objects
  let subdomains = [];
  if (existsSync(tmpOutput)) {
    const raw = readFileSync(tmpOutput, 'utf8');
    subdomains = raw
      .split('\n')
      .filter(Boolean)
      .map(line => {
        try { return JSON.parse(line); } catch { return null; }
      })
      .filter(Boolean);
    unlinkSync(tmpOutput);
  } else if (result.stdout) {
    // Fallback: parse stdout if no file output
    subdomains = result.stdout
      .split('\n')
      .filter(Boolean)
      .map(name => ({ name }));
  }

  const output = {
    domain,
    scan_date: today,
    tool: 'amass',
    mode: 'passive-intel',
    subdomain_count: subdomains.length,
    subdomains,
  };

  writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf8');
  writeOsintNote({ tool: 'amass', target: domain, targetType: 'domain', resultCount: subdomains.length, alertCount: uniquePrefixes.size > 20 ? 1 : 0, outputFile, today, tags: ['dns', 'subdomain', 'cert-transparency'] });

  console.log(`\n✅ Scan complete: ${subdomains.length} subdomains discovered`);
  console.log(`   Saved: ${outputFile}`);

  if (subdomains.length > 0) {
    console.log('\n🌐 Sample subdomains:');
    subdomains.slice(0, 8).forEach(s => console.log(`   ${s.name ?? s}`));
  }

  // Flag significant new infrastructure clusters
  const uniquePrefixes = new Set(
    subdomains.map(s => (s.name ?? s).split('.')[0])
  );
  if (uniquePrefixes.size > 20) {
    console.log(`\n📡 Large infrastructure footprint detected (${uniquePrefixes.size} unique prefixes).`);
    console.log('   → Consider reviewing for M&A or product launch signals.');
  }

  return output;
}
