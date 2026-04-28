/**
 * snscrape.mjs — Multi-platform social media scraping via Bellingcat's snscrape
 *
 * Usage:
 *   node run.mjs scan osint-snscrape --platform twitter --query "AAPL earnings"
 *   node run.mjs scan osint-snscrape --platform twitter --user elonmusk --limit 100
 *   node run.mjs scan osint-snscrape --platform twitter --query "NVDA" --dry-run
 *
 * Requires: pip install snscrape
 * Source:   https://github.com/bellingcat/snscrape
 *
 * Supported platforms: twitter, instagram, reddit, mastodon
 *
 * Output:
 *   05_Data_Pulls/social/snscrape-<platform>-<label>-<date>.json
 */

import { spawnSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeOsintNote } from '../lib/osint-notes.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = join(__dirname, '..', '..');
const OUTPUT_DIR = join(VAULT_ROOT, '05_Data_Pulls', 'social');

const SUPPORTED_PLATFORMS = ['twitter', 'instagram', 'reddit', 'mastodon'];

export async function pull(flags = {}) {
  const platform = (flags.platform ?? 'twitter').toLowerCase();
  const query = flags.query;
  const user = flags.user;
  const limit = parseInt(flags.limit ?? '50', 10);

  if (!SUPPORTED_PLATFORMS.includes(platform)) {
    console.error(`Error: --platform must be one of: ${SUPPORTED_PLATFORMS.join(', ')}`);
    process.exit(1);
  }

  if (!query && !user) {
    console.error('Error: --query <search terms> or --user <username> is required.');
    console.error('Example: node run.mjs scan osint-snscrape --platform twitter --query "AAPL earnings"');
    process.exit(1);
  }

  const label = (query ?? user).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 40);
  const today = new Date().toISOString().slice(0, 10);
  const outputFile = join(OUTPUT_DIR, `snscrape-${platform}-${label}-${today}.json`);
  const dryRun = flags['dry-run'] ?? false;

  // Build snscrape subcommand
  let scrapeTarget;
  if (user) {
    scrapeTarget = `${platform}-user`;
  } else {
    scrapeTarget = `${platform}-search`;
  }

  const scrapeArg = user ?? query;
  const args = [scrapeTarget, '--max-results', String(limit), '--jsonl', scrapeArg];

  console.log(`\n📡 snscrape ${platform} scan: ${query ?? `@${user}`}`);
  console.log(`   Limit: ${limit} posts | Output: ${outputFile}`);

  if (dryRun) {
    console.log(`\n[dry-run] Would execute: snscrape ${args.join(' ')}`);
    return;
  }

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  const result = spawnSync('snscrape', args, {
    encoding: 'utf8',
    timeout: 3 * 60 * 1000,
  });

  if (result.error) {
    console.error(`❌ snscrape error: ${result.error.message}`);
    console.error('   Install with: pip install snscrape');
    process.exit(1);
  }

  // Parse JSONL output (one JSON object per line)
  const lines = result.stdout.trim().split('\n').filter(Boolean);
  const posts = [];
  for (const line of lines) {
    try { posts.push(JSON.parse(line)); } catch { /* skip malformed lines */ }
  }

  // Extract signal-relevant fields
  const simplified = posts.map(p => ({
    id: p.id ?? p.url,
    date: p.date ?? p.datetime,
    content: p.content ?? p.rawContent ?? p.text,
    likes: p.likeCount ?? p.likes ?? 0,
    retweets: p.retweetCount ?? p.retweets ?? 0,
    replies: p.replyCount ?? p.replies ?? 0,
    url: p.url,
    username: p.user?.username ?? p.author,
  }));

  const avgEngagement = simplified.length > 0
    ? Math.round(simplified.reduce((s, p) => s + (p.likes + p.retweets), 0) / simplified.length)
    : 0;

  const output = {
    platform,
    query: query ?? null,
    user: user ?? null,
    scan_date: today,
    tool: 'snscrape',
    source: 'bellingcat/snscrape',
    mode: 'passive',
    total_posts: simplified.length,
    avg_engagement: avgEngagement,
    posts: simplified,
  };

  writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf8');
  writeOsintNote({ tool: 'snscrape', target: query ?? user ?? platform, targetType: 'user', resultCount: simplified.length, alertCount: avgEngagement > 1000 ? 1 : 0, outputFile, today, tags: ['social', platform, 'sentiment'] });

  console.log(`\n✅ snscrape complete:`);
  console.log(`   Posts retrieved:   ${simplified.length}`);
  console.log(`   Avg engagement:    ${avgEngagement}`);
  console.log(`   Saved: ${outputFile}`);

  if (simplified.length > 0) {
    console.log('\n   Top posts by engagement:');
    [...simplified]
      .sort((a, b) => (b.likes + b.retweets) - (a.likes + a.retweets))
      .slice(0, 3)
      .forEach(p => console.log(`   [${p.likes}♥ ${p.retweets}🔁] ${(p.content ?? '').slice(0, 80)}`));
  }

  return output;
}
