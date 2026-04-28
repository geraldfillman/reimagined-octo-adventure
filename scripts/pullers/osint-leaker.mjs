/**
 * osint-leaker.mjs — Passive multi-database breach/credential enumeration
 *
 * Usage:
 *   node run.mjs scan osint-leaker --domain example.com
 *   node run.mjs scan osint-leaker --email ceo@example.com
 *   node run.mjs scan osint-leaker --domain example.com --dry-run
 *
 * Requires: pip install leaker
 * Source:   https://github.com/vflame6/leaker
 *
 * Output:
 *   05_Data_Pulls/osint/leaker-<target>-<date>.json
 *
 * Signal trigger: breach findings → P2 signal note in 06_Signals/
 */

import { spawnSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = join(__dirname, '..', '..');
const OUTPUT_DIR = join(VAULT_ROOT, '05_Data_Pulls', 'osint');

export async function pull(flags = {}) {
  const domain = flags.domain;
  const email = flags.email;

  if (!domain && !email) {
    console.error('Error: --domain <domain> or --email <email> is required.');
    console.error('Example: node run.mjs scan osint-leaker --domain example.com');
    process.exit(1);
  }

  const target = domain ?? email;
  const targetType = domain ? 'domain' : 'email';
  const today = new Date().toISOString().slice(0, 10);
  const safeTarget = target.replace(/[^a-zA-Z0-9._-]/g, '_');
  const outputFile = join(OUTPUT_DIR, `leaker-${safeTarget}-${today}.json`);
  const dryRun = flags['dry-run'] ?? false;

  console.log(`\n🔍 Leaker passive breach scan: ${target} (${targetType})`);
  console.log(`   Searching across 10 breach databases...`);
  console.log(`   Output: ${outputFile}`);

  if (dryRun) {
    console.log('\n[dry-run] Would execute:');
    const flag = domain ? `--domain ${domain}` : `--email ${email}`;
    console.log(`  leaker ${flag} --json`);
    return;
  }

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  const args = domain
    ? ['--domain', domain, '--json']
    : ['--email', email, '--json'];

  const result = spawnSync('leaker', args, {
    encoding: 'utf8',
    timeout: 3 * 60 * 1000,  // 3 min max
  });

  if (result.error) {
    console.error(`❌ Leaker error: ${result.error.message}`);
    console.error('   Install with: pip install leaker');
    process.exit(1);
  }

  let findings = [];
  try {
    const raw = result.stdout.trim();
    findings = raw ? JSON.parse(raw) : [];
  } catch {
    // Leaker may print non-JSON lines before JSON; try to extract
    const jsonMatch = result.stdout.match(/(\[.*\]|\{.*\})/s);
    if (jsonMatch) {
      try { findings = JSON.parse(jsonMatch[1]); } catch { findings = []; }
    }
  }

  const highRisk = findings.filter(f => f.severity === 'high' || f.type?.includes('password'));
  const signalStatus = highRisk.length > 0 ? 'watch' : 'clear';

  const output = {
    target,
    target_type: targetType,
    scan_date: today,
    tool: 'leaker',
    mode: 'passive',
    total_findings: findings.length,
    high_risk_count: highRisk.length,
    signal_status: signalStatus,
    findings,
  };

  writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf8');

  console.log(`\n✅ Leaker scan complete:`);
  console.log(`   Total findings: ${findings.length}`);
  console.log(`   High-risk:      ${highRisk.length}`);
  console.log(`   Signal status:  ${signalStatus}`);
  console.log(`   Saved: ${outputFile}`);

  if (highRisk.length > 0) {
    console.log('\n⚠️  High-risk findings:');
    highRisk.slice(0, 5).forEach(f => console.log(`   [${f.source ?? 'unknown'}] ${f.description ?? JSON.stringify(f)}`));
    console.log('\n→ Consider creating a P2 signal note in 06_Signals/');
  }

  return output;
}
