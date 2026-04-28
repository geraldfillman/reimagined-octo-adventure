/**
 * osint-merklemap.mjs — Certificate transparency subdomain discovery via Merklemap
 *
 * Usage:
 *   node run.mjs scan osint-merklemap --domain example.com
 *   node run.mjs scan osint-merklemap --domain example.com --pages 3
 *   node run.mjs scan osint-merklemap --domain example.com --dry-run
 *
 * No API key required. Free tier.
 * Source: https://www.merklemap.com
 *
 * Output:
 *   05_Data_Pulls/osint/merklemap-<domain>-<date>.json
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeOsintNote } from '../lib/osint-notes.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = join(__dirname, '..', '..');
const OUTPUT_DIR = join(VAULT_ROOT, '05_Data_Pulls', 'osint');

const BASE_URL = 'https://api.merklemap.com';

async function fetchPage(domain, page) {
  const url = `${BASE_URL}/search?query=${encodeURIComponent(domain)}&page=${page}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'vault-osint/1.0' },
  });
  if (!res.ok) throw new Error(`Merklemap HTTP ${res.status} for page ${page}`);
  return res.json();
}

export async function pull(flags = {}) {
  const domain = flags.domain;
  if (!domain) {
    console.error('Error: --domain <domain> is required.');
    console.error('Example: node run.mjs scan osint-merklemap --domain example.com');
    process.exit(1);
  }

  const maxPages = Math.min(parseInt(flags.pages ?? '2', 10), 10);
  const today = new Date().toISOString().slice(0, 10);
  const outputFile = join(OUTPUT_DIR, `merklemap-${domain}-${today}.json`);
  const dryRun = flags['dry-run'] ?? false;

  console.log(`\n🗺️  Merklemap CT subdomain discovery: ${domain}`);
  console.log(`   Pages: ${maxPages} | Output: ${outputFile}`);

  if (dryRun) {
    console.log(`\n[dry-run] Would fetch: ${BASE_URL}/search?query=${domain}&page=0..${maxPages - 1}`);
    return;
  }

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  const allResults = [];
  for (let page = 0; page < maxPages; page++) {
    try {
      const data = await fetchPage(domain, page);
      const results = data.results ?? data.subdomains ?? (Array.isArray(data) ? data : []);
      if (results.length === 0) break;
      allResults.push(...results);
      console.log(`   Page ${page}: +${results.length} subdomains (total: ${allResults.length})`);
      // Small delay to be polite
      if (page < maxPages - 1) await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.warn(`   Page ${page} failed: ${err.message}`);
      break;
    }
  }

  // Surface recent / interesting subdomains
  const subdomainStrings = allResults.map(r => r.subdomain ?? r.name ?? r).filter(s => typeof s === 'string');
  const interesting = subdomainStrings.filter(s =>
    /stage|staging|dev|beta|api|internal|admin|test|new|v2|app/.test(s)
  );

  const output = {
    domain,
    scan_date: today,
    tool: 'merklemap',
    mode: 'passive',
    source: 'certificate-transparency',
    total_subdomains: subdomainStrings.length,
    interesting_count: interesting.length,
    subdomains: subdomainStrings,
    interesting_subdomains: interesting,
    raw: allResults,
  };

  writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf8');
  writeOsintNote({ tool: 'merklemap', target: domain, targetType: 'domain', resultCount: subdomainStrings.length, alertCount: interesting.length, outputFile, today, tags: ['subdomain', 'cert-transparency'] });

  console.log(`\n✅ Merklemap scan complete:`);
  console.log(`   Total subdomains:       ${subdomainStrings.length}`);
  console.log(`   Interesting (dev/beta): ${interesting.length}`);
  console.log(`   Saved: ${outputFile}`);

  if (interesting.length > 0) {
    console.log('\n   Notable subdomains:');
    interesting.slice(0, 8).forEach(s => console.log(`   → ${s}`));
  }

  return output;
}
