/**
 * osint-octosuite.mjs — GitHub org/user OSINT via Bellingcat's octosuite
 *
 * Usage:
 *   node run.mjs scan osint-octosuite --org openai
 *   node run.mjs scan osint-octosuite --user some-exec-username
 *   node run.mjs scan osint-octosuite --org microsoft --dry-run
 *
 * Requires: pip install octosuite
 * Source:   https://github.com/bellingcat/octosuite
 *
 * Optional: Set GITHUB_TOKEN env var for 5000 req/hr (vs 60 unauthenticated)
 *
 * Output:
 *   05_Data_Pulls/osint/octosuite-<target>-<date>.json
 */

import { spawnSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeOsintNote } from '../lib/osint-notes.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = join(__dirname, '..', '..');
const OUTPUT_DIR = join(VAULT_ROOT, '05_Data_Pulls', 'osint');

export async function pull(flags = {}) {
  const org = flags.org;
  const user = flags.user;

  if (!org && !user) {
    console.error('Error: --org <org> or --user <username> is required.');
    console.error('Example: node run.mjs scan osint-octosuite --org openai');
    process.exit(1);
  }

  const target = org ?? user;
  const targetType = org ? 'org' : 'user';
  const today = new Date().toISOString().slice(0, 10);
  const safeTarget = target.replace(/[^a-zA-Z0-9._-]/g, '_');
  const outputFile = join(OUTPUT_DIR, `octosuite-${safeTarget}-${today}.json`);
  const dryRun = flags['dry-run'] ?? false;

  const githubToken = process.env.GITHUB_TOKEN;

  console.log(`\n🐙 octosuite GitHub OSINT: ${targetType} "${target}"`);
  if (githubToken) {
    console.log('   Using GITHUB_TOKEN for higher rate limits');
  } else {
    console.log('   No GITHUB_TOKEN — limited to 60 req/hr unauthenticated');
  }
  console.log(`   Output: ${outputFile}`);

  if (dryRun) {
    const flag = org ? `--org ${org}` : `--user ${user}`;
    console.log(`\n[dry-run] Would execute: octosuite ${flag}`);
    return;
  }

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  const args = org ? ['--org', org] : ['--user', user];

  const env = { ...process.env };
  if (githubToken) env.GITHUB_TOKEN = githubToken;

  const result = spawnSync('octosuite', args, {
    encoding: 'utf8',
    timeout: 3 * 60 * 1000,
    env,
  });

  if (result.error) {
    console.error(`❌ octosuite error: ${result.error.message}`);
    console.error('   Install with: pip install octosuite');
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`❌ octosuite exited with code ${result.status}`);
    console.error(result.stderr?.slice(0, 500));
    process.exit(1);
  }

  // octosuite outputs structured text; attempt JSON parse or store raw
  let data = {};
  try {
    data = JSON.parse(result.stdout);
  } catch {
    // Store raw stdout if not JSON
    data = { raw_output: result.stdout };
  }

  const output = {
    target,
    target_type: targetType,
    scan_date: today,
    tool: 'octosuite',
    source: 'bellingcat/octosuite',
    mode: 'passive',
    data,
  };

  // Surface key signals from org data
  const repos = data.repositories ?? data.repos ?? [];
  const members = data.members ?? [];
  if (repos.length > 0) {
    const newRepos = repos.filter(r => {
      const created = new Date(r.created_at ?? 0);
      const daysOld = (Date.now() - created) / (1000 * 60 * 60 * 24);
      return daysOld < 90;
    });
    output.new_repos_90d = newRepos.length;
    output.total_repos = repos.length;
    output.total_members = members.length;
    console.log(`\n📊 GitHub org summary:`);
    console.log(`   Total repos:    ${repos.length}`);
    console.log(`   New (90d):      ${newRepos.length}`);
    console.log(`   Members:        ${members.length}`);
    if (newRepos.length > 0) {
      console.log('\n   Recent repos:');
      newRepos.slice(0, 5).forEach(r => console.log(`   → ${r.name} (${r.created_at?.slice(0, 10)})`));
    }
  }

  writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf8');
  writeOsintNote({ tool: 'octosuite', target, targetType: targetType === 'org' ? 'ticker' : 'user', resultCount: output.total_repos ?? 1, alertCount: output.new_repos_90d ?? 0, outputFile, today, tags: ['github', 'oss', targetType] });
  console.log(`\n✅ Saved: ${outputFile}`);

  return output;
}
