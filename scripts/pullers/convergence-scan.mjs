/**
 * convergence-scan.mjs — Cross-domain convergence detector
 *
 * Reads recent alert/critical pull notes and detects when ≥3 distinct domains
 * independently flag the same thesis or ticker. Writes a convergence signal
 * note to 06_Signals/ with severity "critical".
 *
 * Usage:
 *   node run.mjs pull convergence-scan --dry-run
 *   node run.mjs pull convergence-scan --days 7
 *   node run.mjs pull convergence-scan --min-domains 3
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT  = resolve(__dirname, '..', '..');
const PULLS_DIR   = join(VAULT_ROOT, '05_Data_Pulls');
const SIGNALS_DIR = join(VAULT_ROOT, '06_Signals');

const DEFAULT_DAYS        = 7;
const DEFAULT_MIN_DOMAINS = 3;

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    // Parse simple YAML arrays: [a, b, c]
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
    if (key) fm[key] = val;
  }
  return fm;
}

function listMdFilesRecursive(dir) {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('_')) {
      results.push(...listMdFilesRecursive(full));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

function domainFromPath(filePath) {
  // e.g. 05_Data_Pulls/Market/foo.md → "Market"
  const parts = filePath.replace(/\\/g, '/').split('05_Data_Pulls/');
  if (parts.length < 2) return 'Unknown';
  return parts[1].split('/')[0] ?? 'Unknown';
}

function toSlug(str) {
  return str.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function writeConvergenceSignal({ key, keyType, domains, paths: pullPaths, today, dryRun }) {
  const domainList = [...domains].sort();
  const slug = toSlug(key);
  const signalId = `CONVERGENCE_${slug}_${today.replace(/-/g, '')}`;
  const fileName = `${today}_${signalId}.md`;
  const filePath = join(SIGNALS_DIR, fileName);

  const thesisLink = keyType === 'thesis' ? `[[${key}]]` : null;
  const tickerLine = keyType === 'ticker' ? `ticker: "${key}"` : '';
  const thesisLine = thesisLink ? `thesis: "${thesisLink}"` : '';

  const sourcePulls = pullPaths
    .slice(0, 5)
    .map(p => p.replace(/\\/g, '/').split('05_Data_Pulls/')[1] ?? p)
    .join(', ');

  const body = `---
signal_id: "${signalId}"
signal_name: "Cross-Domain Convergence — ${key}"
severity: "critical"
signal_state: "new"
date: "${today}"
${thesisLine}
${tickerLine}
domains_confirmed: [${domainList.map(d => `"${d}"`).join(', ')}]
domain_count: ${domainList.length}
source_pull: "${sourcePulls}"
direction: "confirm"
suggested_action: "review"
tags: ["signal", "convergence", "cross-domain", "${slug.toLowerCase()}"]
---
## Cross-Domain Convergence — ${key}

**Domains:** ${domainList.join(', ')}
**Domain count:** ${domainList.length} independent sources
**Date:** ${today}

## Evidence

${domainList.map(d => `- **${d}** flagged \`${key}\` at alert or critical severity`).join('\n')}

## Why This Matters

${domainList.length} independent agent domains have flagged the same ${keyType === 'thesis' ? 'thesis' : 'ticker'} within ${DEFAULT_DAYS} days. Cross-domain convergence is a strong confirming signal — each domain uses different data sources, reducing the probability this is noise.

## Suggested Action

Review the source pull notes listed below and consider escalating conviction or allocation if the evidence is consistent. Run \`node run.mjs pull signal-review\` to check current signal lifecycle state.

## Source Pulls

${pullPaths.slice(0, 10).map(p => `- \`${p.replace(/\\/g, '/').split('05_Data_Pulls/')[1] ?? p}\``).join('\n')}
`;

  if (dryRun) {
    console.log(`   [dry-run] Would write: 06_Signals/${fileName}`);
    console.log(`             Domains: ${domainList.join(', ')}`);
    return null;
  }

  if (!existsSync(SIGNALS_DIR)) mkdirSync(SIGNALS_DIR, { recursive: true });
  writeFileSync(filePath, body, 'utf-8');
  return filePath;
}

export async function pull(flags = {}) {
  const dryRun     = !!(flags['dry-run'] || flags.dryRun);
  const days       = parseInt(flags.days ?? DEFAULT_DAYS, 10);
  const minDomains = parseInt(flags['min-domains'] ?? flags.minDomains ?? DEFAULT_MIN_DOMAINS, 10);
  const today      = new Date().toISOString().slice(0, 10);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  console.log(`\n🔗 Convergence Scan`);
  console.log(`   Window     : last ${days} days (since ${cutoffStr})`);
  console.log(`   Threshold  : ≥${minDomains} distinct domains`);
  console.log(`   Mode       : ${dryRun ? 'DRY RUN' : 'LIVE'}\n`);

  const pullFiles = listMdFilesRecursive(PULLS_DIR);
  console.log(`   Scanning ${pullFiles.length} pull notes...\n`);

  // key → { domains: Set<string>, paths: string[] }
  const thesisMap = new Map();
  const tickerMap = new Map();

  let scanned = 0;
  let eligible = 0;

  for (const filePath of pullFiles) {
    let fm;
    try {
      const content = readFileSync(filePath, 'utf-8');
      fm = parseFrontmatter(content);
    } catch { continue; }

    scanned++;
    const status    = fm.signal_status ?? '';
    const datePulled = fm.date_pulled ?? fm.date ?? '';

    if (status !== 'alert' && status !== 'critical') continue;
    if (!datePulled || datePulled < cutoffStr) continue;

    eligible++;
    const domain = domainFromPath(filePath);

    // Group by thesis
    const theses = fm.related_theses
      ? (Array.isArray(fm.related_theses) ? fm.related_theses : [fm.related_theses])
      : [];
    const thesis = fm.thesis ? String(fm.thesis).replace(/\[\[|\]\]/g, '').trim() : null;
    if (thesis && !theses.includes(thesis)) theses.push(thesis);

    for (const t of theses) {
      if (!t) continue;
      if (!thesisMap.has(t)) thesisMap.set(t, { domains: new Set(), paths: [] });
      thesisMap.get(t).domains.add(domain);
      thesisMap.get(t).paths.push(filePath);
    }

    // Group by ticker
    const ticker = fm.ticker ? String(fm.ticker).trim() : null;
    if (ticker) {
      if (!tickerMap.has(ticker)) tickerMap.set(ticker, { domains: new Set(), paths: [] });
      tickerMap.get(ticker).domains.add(domain);
      tickerMap.get(ticker).paths.push(filePath);
    }
  }

  console.log(`   Eligible (alert/critical, in window): ${eligible}`);

  // Detect convergence
  const convergences = [];
  for (const [thesis, { domains, paths }] of thesisMap) {
    if (domains.size >= minDomains) convergences.push({ key: thesis, keyType: 'thesis', domains, paths });
  }
  for (const [ticker, { domains, paths }] of tickerMap) {
    if (domains.size >= minDomains) convergences.push({ key: ticker, keyType: 'ticker', domains, paths });
  }

  console.log(`\n   Convergence events found: ${convergences.length}\n`);

  const written = [];
  for (const event of convergences) {
    const result = writeConvergenceSignal({ ...event, today, dryRun });
    if (result) {
      console.log(`   ✓ Convergence signal: ${event.key} (${event.domains.size} domains)`);
      written.push(result);
    }
  }

  console.log(`\n📊 Summary`);
  console.log(`   Pull notes scanned  : ${scanned}`);
  console.log(`   Eligible (alert+)   : ${eligible}`);
  console.log(`   Convergences found  : ${convergences.length}`);
  console.log(`   Signals written     : ${written.length}${dryRun ? ' (dry-run — none written)' : ''}`);

  if (convergences.length === 0) {
    console.log(`\n   ℹ️  No convergence detected in the last ${days} days.`);
    console.log(`      Try --days 14 or --min-domains 2 to widen the window.`);
  }

  return { convergences: convergences.length, written: written.length, dryRun };
}
