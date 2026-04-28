/**
 * reddit.mjs — Thesis-aware Reddit sentiment puller
 *
 * Usage:
 *   node run.mjs pull reddit --subreddit wallstreetbets --query AAPL
 *   node run.mjs pull reddit --thesis "Housing Supply Correction"
 *   node run.mjs pull reddit --subreddit realestate --limit 50
 *   node run.mjs pull reddit --all-thesis          (scan all thesis subreddit mappings)
 *   node run.mjs pull reddit --dry-run
 *
 * Uses Reddit's public JSON API (no auth needed for read-only public subreddits).
 * Set REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET in .env to unlock OAuth (60 req/min).
 *
 * Output: 05_Data_Pulls/social/reddit-<subreddit>-<date>.md (vault pull note)
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = join(__dirname, '..', '..');
const OUTPUT_DIR = join(VAULT_ROOT, '05_Data_Pulls', 'social');

// Thesis → subreddit mapping for auto-routing
const THESIS_SUBREDDIT_MAP = {
  'housing':        ['realestate', 'REBubble', 'FirstTimeHomeBuyer', 'RealEstate'],
  'biotech':        ['biotech', 'investing', 'medicine', 'stocks'],
  'defense':        ['geopolitics', 'worldnews', 'military', 'news'],
  'climate':        ['energy', 'solar', 'electricvehicles', 'climate'],
  'energy':         ['energy', 'oil', 'naturalgas', 'investing'],
  'supply chain':   ['logistics', 'supplychain', 'economics', 'worldnews'],
  'macro':          ['Economics', 'econmonitor', 'MacroEconomics', 'investing'],
  'vc':             ['startups', 'venturecapital', 'investing', 'technology'],
  'default':        ['wallstreetbets', 'investing', 'stocks', 'SecurityAnalysis'],
};

// Subreddits always worth scanning regardless of thesis
const CORE_SUBREDDITS = ['wallstreetbets', 'investing', 'stocks'];

/**
 * Match a thesis name to its subreddit list.
 */
function resolveSubreddits(thesisName) {
  const lower = thesisName.toLowerCase();
  for (const [key, subs] of Object.entries(THESIS_SUBREDDIT_MAP)) {
    if (lower.includes(key)) return subs;
  }
  return THESIS_SUBREDDIT_MAP.default;
}

/**
 * Build OAuth2 bearer token from Reddit credentials, if available.
 */
async function getOAuthToken() {
  const clientId = process.env.REDDIT_CLIENT_ID?.trim();
  const clientSecret = process.env.REDDIT_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const userAgent = process.env.REDDIT_USER_AGENT ?? 'vault-osint/1.0';

  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': userAgent,
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token ?? null;
}

/**
 * Fetch posts from a subreddit, optionally filtered by query.
 */
async function fetchSubreddit(subreddit, query, limit = 25, token = null) {
  const userAgent = process.env.REDDIT_USER_AGENT ?? 'vault-osint/1.0';
  const baseUrl = token
    ? 'https://oauth.reddit.com'
    : 'https://www.reddit.com';

  const endpoint = query
    ? `${baseUrl}/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=new&limit=${limit}`
    : `${baseUrl}/r/${subreddit}/new.json?limit=${limit}`;

  const headers = {
    'User-Agent': userAgent,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const res = await fetch(endpoint, { headers });
  if (!res.ok) {
    throw new Error(`Reddit API error ${res.status} for r/${subreddit}`);
  }
  const json = await res.json();
  return (json.data?.children ?? []).map(c => c.data);
}

/**
 * Score a batch of posts for signal strength (simple heuristics).
 */
function scoreSignal(posts) {
  if (posts.length === 0) return { level: 'clear', summary: 'No posts found.' };

  const totalScore = posts.reduce((sum, p) => sum + (p.score ?? 0), 0);
  const avgScore = totalScore / posts.length;
  const highEngagement = posts.filter(p => (p.num_comments ?? 0) > 100).length;

  if (avgScore > 1000 || highEngagement >= 3) return { level: 'alert', summary: `High engagement: avg score ${Math.round(avgScore)}, ${highEngagement} posts >100 comments` };
  if (avgScore > 200 || highEngagement >= 1) return { level: 'watch', summary: `Moderate engagement: avg score ${Math.round(avgScore)}` };
  return { level: 'clear', summary: `Low engagement: avg score ${Math.round(avgScore)}` };
}

/**
 * Write a vault-compatible pull note.
 */
function writePullNote(subreddit, query, posts, signal, today, outputFile) {
  const topPosts = posts
    .slice(0, 10)
    .map(p => `- [${p.title?.slice(0, 80)}](https://reddit.com${p.permalink}) — ↑${p.score} | 💬${p.num_comments}`)
    .join('\n');

  const content = `---
title: "Reddit — r/${subreddit}${query ? ` — ${query}` : ''}"
source: "Reddit API"
date_pulled: "${today}"
domain: "social_sentiment"
data_type: "social_posts"
frequency: "weekly"
signal_status: "${signal.level}"
signals:
  - "${signal.summary}"
tags:
  - reddit
  - social-sentiment
  - ${subreddit.toLowerCase()}
---

## r/${subreddit}${query ? ` · "${query}"` : ''}

**Pulled:** ${today}
**Posts fetched:** ${posts.length}
**Signal:** ${signal.level.toUpperCase()} — ${signal.summary}

## Top Posts

${topPosts || '_No posts found._'}

## Raw Data

Saved to: \`05_Data_Pulls/social/${subreddit}-${today}.json\`
`;

  writeFileSync(outputFile, content, 'utf8');
}

export async function pull(flags = {}) {
  const subredditFlag = flags.subreddit;
  const query = flags.query ?? flags.q;
  const thesis = flags.thesis;
  const allThesis = flags['all-thesis'] ?? false;
  const limit = parseInt(flags.limit ?? '25', 10);
  const dryRun = flags['dry-run'] ?? false;
  const today = new Date().toISOString().slice(0, 10);

  // Resolve which subreddits to scan
  let targets = [];
  if (subredditFlag) {
    targets = [{ subreddit: subredditFlag, query }];
  } else if (thesis) {
    const subs = resolveSubreddits(thesis);
    targets = subs.map(s => ({ subreddit: s, query: query ?? thesis.split(' ').slice(0, 2).join(' ') }));
  } else if (allThesis) {
    const seen = new Set();
    for (const subs of Object.values(THESIS_SUBREDDIT_MAP)) {
      for (const s of subs) {
        if (!seen.has(s)) { seen.add(s); targets.push({ subreddit: s, query }); }
      }
    }
  } else {
    targets = CORE_SUBREDDITS.map(s => ({ subreddit: s, query }));
  }

  if (dryRun) {
    console.log('\n[dry-run] Would pull from:');
    targets.forEach(t => console.log(`  r/${t.subreddit}${t.query ? ` → query: "${t.query}"` : ''}`));
    return;
  }

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  // Get OAuth token if credentials available
  const token = await getOAuthToken();
  if (token) {
    console.log('🔑 Using OAuth (60 req/min)');
  } else {
    console.log('📖 Using public API (1 req/sec) — set REDDIT_CLIENT_ID for higher limits');
  }

  const results = [];

  for (const { subreddit, query: q } of targets) {
    try {
      process.stdout.write(`  r/${subreddit}${q ? ` [${q}]` : ''}... `);
      const posts = await fetchSubreddit(subreddit, q, limit, token);
      const signal = scoreSignal(posts);

      // Save JSON data
      const jsonFile = join(OUTPUT_DIR, `reddit-${subreddit}-${today}.json`);
      writeFileSync(jsonFile, JSON.stringify({ subreddit, query: q, date: today, posts }, null, 2), 'utf8');

      // Write vault pull note
      const mdFile = join(OUTPUT_DIR, `${today}_reddit-${subreddit}.md`);
      writePullNote(subreddit, q, posts, signal, today, mdFile);

      console.log(`${posts.length} posts — ${signal.level.toUpperCase()}`);
      results.push({ subreddit, posts: posts.length, signal: signal.level });

      // Rate limit: 1 req/sec without OAuth
      if (!token) await new Promise(r => setTimeout(r, 1100));

    } catch (err) {
      console.log(`❌ ${err.message}`);
    }
  }

  console.log(`\n✅ Reddit pull complete: ${results.length} subreddits scanned`);
  const alerts = results.filter(r => r.signal !== 'clear');
  if (alerts.length > 0) {
    console.log(`⚠️  ${alerts.length} elevated signal(s):`);
    alerts.forEach(r => console.log(`   r/${r.subreddit} → ${r.signal.toUpperCase()}`));
  }

  return results;
}
