/**
 * kb-health.mjs — Broader KB integrity and scale checks
 *
 * Usage:
 *   node run.mjs kb health
 *   node run.mjs kb health --dry-run
 *
 * Checks:
 *   - Page counts by type and tag distribution
 *   - Empty directories
 *   - Intake notes stuck in jobs/ > 7 days
 *   - High-value unanswered questions from query-results
 *   - Missing page type suggestions based on entity/concept gaps
 *
 * Output:
 *   12_Knowledge_Bases/health-checks/health-<date>.md
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { today, buildTable } from '../lib/markdown.mjs';

import { getKBRoot } from '../lib/config.mjs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const KB_ROOT = getKBRoot();
const WIKI = join(KB_ROOT, 'wiki');
const HEALTH = join(KB_ROOT, 'health-checks');
const JOBS = join(KB_ROOT, 'jobs');
const RAW = join(KB_ROOT, 'raw');

const WIKI_SUBDIRS = ['summaries', 'concepts', 'entities', 'comparisons', 'query-results'];
const RAW_SUBDIRS = ['inbox', 'articles', 'papers', 'transcripts', 'repos', 'datasets', 'images'];
const STALE_JOB_DAYS = 7;

function daysSince(mtime) {
  return Math.floor((Date.now() - mtime) / (1000 * 60 * 60 * 24));
}

function parseMeta(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      data[line.slice(0, colonIdx).trim()] = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
  return data;
}

function countPages(wikiDir) {
  const counts = { total: 0 };
  for (const sub of WIKI_SUBDIRS) {
    const dir = join(wikiDir, sub);
    if (!existsSync(dir)) { counts[sub] = 0; continue; }
    const files = readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('_'));
    counts[sub] = files.length;
    counts.total += files.length;
  }
  return counts;
}

function collectTags(wikiDir) {
  const tagFreq = new Map();
  for (const sub of WIKI_SUBDIRS) {
    const dir = join(wikiDir, sub);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('_'))) {
      const content = readFileSync(join(dir, file), 'utf8');
      const meta = parseMeta(content);
      const tags = (meta.tags ?? '').replace(/[\[\]]/g, '').split(',').map(t => t.trim()).filter(Boolean);
      for (const tag of tags) {
        tagFreq.set(tag, (tagFreq.get(tag) ?? 0) + 1);
      }
    }
  }
  return [...tagFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
}

function staleJobs(jobsDir) {
  if (!existsSync(jobsDir)) return [];
  return readdirSync(jobsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const p = join(jobsDir, f);
      const { mtimeMs } = statSync(p);
      const age = daysSince(mtimeMs);
      return { file: f, age };
    })
    .filter(j => j.age > STALE_JOB_DAYS);
}

function emptyDirs(baseDir, subdirs) {
  return subdirs
    .map(sub => ({ sub, dir: join(baseDir, sub) }))
    .filter(({ dir }) => {
      if (!existsSync(dir)) return true;
      const files = readdirSync(dir).filter(f => !f.startsWith('.') && f !== '_README.md');
      return files.length === 0;
    })
    .map(({ sub }) => sub);
}

function openQuestions(wikiDir) {
  const dir = join(wikiDir, 'query-results');
  if (!existsSync(dir)) return [];
  const questions = [];
  for (const file of readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('_'))) {
    const content = readFileSync(join(dir, file), 'utf8');
    if (/No relevant wiki content found|open question/i.test(content)) {
      const meta = parseMeta(content);
      questions.push({ file, query: meta.query ?? file });
    }
  }
  return questions;
}

export async function run(flags = {}) {
  const dryRun = Boolean(flags['dry-run']);

  console.log(`\n🏥 KB Health Check${dryRun ? ' (dry-run)' : ''}`);

  const counts = countPages(WIKI);
  const tags = collectTags(WIKI);
  const staleJobList = staleJobs(JOBS);
  const emptyWikiDirs = emptyDirs(WIKI, WIKI_SUBDIRS);
  const emptyRawDirs = emptyDirs(RAW, RAW_SUBDIRS);
  const openQs = openQuestions(WIKI);

  console.log(`\n   Wiki pages: ${counts.total}`);
  for (const sub of WIKI_SUBDIRS) {
    console.log(`     ${sub}: ${counts[sub] ?? 0}`);
  }

  if (staleJobList.length > 0) {
    console.log(`\n   ⚠️  Stale jobs (>${STALE_JOB_DAYS}d): ${staleJobList.length}`);
    staleJobList.forEach(j => console.log(`     ${j.file} (${j.age}d old)`));
  }

  if (openQs.length > 0) {
    console.log(`\n   ❓ Open questions to research: ${openQs.length}`);
    openQs.slice(0, 5).forEach(q => console.log(`     "${q.query}"`));
  }

  if (emptyWikiDirs.length > 0) {
    console.log(`\n   ℹ️  Empty wiki dirs: ${emptyWikiDirs.join(', ')}`);
  }

  // Suggestions based on imbalance
  const suggestions = [];
  if ((counts.concepts ?? 0) === 0 && (counts.summaries ?? 0) > 2) {
    suggestions.push('Consider creating concept pages from recurring themes in your summaries.');
  }
  if ((counts.comparisons ?? 0) === 0 && (counts.entities ?? 0) > 2) {
    suggestions.push('You have multiple entity pages — consider creating comparison pages.');
  }
  if ((counts['query-results'] ?? 0) === 0) {
    suggestions.push('No query-results filed yet. Try: node run.mjs kb query --query "..." --save');
  }

  if (suggestions.length > 0) {
    console.log('\n   💡 Suggestions:');
    suggestions.forEach(s => console.log(`     ${s}`));
  }

  const report = `---
title: "KB Health Check ${today()}"
type: health-check
created: ${today()}
tags: [kb, health]
total_pages: ${counts.total}
---

# KB Health Check — ${today()}

## Page Counts

${buildTable(
  ['Type', 'Count'],
  [...WIKI_SUBDIRS.map(s => [s, String(counts[s] ?? 0)]), ['**Total**', String(counts.total)]]
)}

## Tag Distribution (Top 20)

${tags.length > 0
  ? buildTable(['Tag', 'Count'], tags.map(([t, c]) => [t, String(c)]))
  : '_No tags found._'}

## Stale Jobs (>${STALE_JOB_DAYS} days)

${staleJobList.length > 0
  ? buildTable(['File', 'Age (days)'], staleJobList.map(j => [j.file, String(j.age)]))
  : '_No stale jobs._'}

## Open Research Questions

${openQs.length > 0
  ? openQs.map(q => `- "${q.query}"`).join('\n')
  : '_No open questions._'}

## Empty Directories

${[...emptyWikiDirs.map(d => `wiki/${d}`), ...emptyRawDirs.map(d => `raw/${d}`)].length > 0
  ? [...emptyWikiDirs.map(d => `- \`wiki/${d}\``), ...emptyRawDirs.map(d => `- \`raw/${d}\``)].join('\n')
  : '_All directories have content._'}

## Structural Suggestions

${suggestions.length > 0
  ? suggestions.map(s => `- ${s}`).join('\n')
  : '_Wiki structure looks healthy._'}
`;

  if (!dryRun) {
    if (!existsSync(HEALTH)) mkdirSync(HEALTH, { recursive: true });
    const reportPath = join(HEALTH, `health-${today()}.md`);
    writeFileSync(reportPath, report, 'utf8');
    console.log(`\n   Report saved: ${reportPath}`);
  }

  console.log('\n✅ Health check complete.');
}
