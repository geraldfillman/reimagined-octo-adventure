/**
 * osint-columbus.mjs — Fast passive subdomain discovery via Columbus Project API
 *
 * Usage:
 *   node run.mjs scan osint-columbus --domain example.com
 *   node run.mjs scan osint-columbus --domain example.com --dry-run
 *
 * No API key required. Public hosted instance.
 * Source: https://github.com/elmasy-com/columbus
 *
 * Output:
 *   05_Data_Pulls/osint/columbus-<domain>-<date>.json
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeOsintNote } from '../lib/osint-notes.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = join(__dirname, '..', '..');
const OUTPUT_DIR = join(VAULT_ROOT, '05_Data_Pulls', 'osint');

const BASE_URL = 'https://columbus.elmasy.com/api/v1';

export async function pull(flags = {}) {
  const domain = flags.domain;
  if (!domain) {
    console.error('Error: --domain <domain> is required.');
    console.error('Example: node run.mjs scan osint-columbus --domain example.com');
    process.exit(1);
  }

  const today = new Date().toISOString().slice(0, 10);
  const outputFile = join(OUTPUT_DIR, `columbus-${domain}-${today}.json`);
  const dryRun = flags['dry-run'] ?? false;

  console.log(`\n🏛️  Columbus Project subdomain discovery: ${domain}`);
  console.log(`   Output: ${outputFile}`);

  if (dryRun) {
    console.log(`\n[dry-run] Would fetch: ${BASE_URL}/search/${domain}`);
    return;
  }

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  let subdomains = [];
  try {
    const res = await fetch(`${BASE_URL}/search/${encodeURIComponent(domain)}`, {
      headers: { 'User-Agent': 'vault-osint/1.0', 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    subdomains = Array.isArray(data) ? data : (data.subdomains ?? data.results ?? []);
  } catch (err) {
    console.error(`❌ Columbus API error: ${err.message}`);
    process.exit(1);
  }

  const subdomainStrings = subdomains.map(s => (typeof s === 'string' ? s : s.subdomain ?? s.name ?? '')).filter(Boolean);

  const interesting = subdomainStrings.filter(s =>
    /stage|staging|dev|beta|api|internal|admin|test|new|v2|app/.test(s)
  );

  const output = {
    domain,
    scan_date: today,
    tool: 'columbus-project',
    mode: 'passive',
    total_subdomains: subdomainStrings.length,
    interesting_count: interesting.length,
    subdomains: subdomainStrings,
    interesting_subdomains: interesting,
  };

  writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf8');
  writeOsintNote({ tool: 'columbus-project', target: domain, targetType: 'domain', resultCount: subdomainStrings.length, alertCount: interesting.length, outputFile, today, tags: ['subdomain', 'passive'] });

  console.log(`\n✅ Columbus scan complete:`);
  console.log(`   Total subdomains:       ${subdomainStrings.length}`);
  console.log(`   Interesting (dev/beta): ${interesting.length}`);
  console.log(`   Saved: ${outputFile}`);

  if (interesting.length > 0) {
    console.log('\n   Notable subdomains:');
    interesting.slice(0, 8).forEach(s => console.log(`   → ${s}`));
  }

  return output;
}
