/**
 * kb-query.mjs — Answer a question using the wiki and optionally file the result
 *
 * Usage:
 *   node run.mjs kb query --query "What is the current energy regime?"
 *   node run.mjs kb query --query "Compare copper and lithium demand drivers" --save
 *   node run.mjs kb query --query "..." --dry-run
 *
 * Flags:
 *   --query <text>   The question to answer (required)
 *   --save           File the answer as a query-result wiki page
 *   --dry-run        Print result without saving
 *
 * Pipeline:
 *   1. Scan wiki/index/ TLDRs for relevance
 *   2. Load matching full pages
 *   3. Print synthesized context
 *   4. If --save, write to wiki/query-results/
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { today, buildFrontmatter } from '../lib/markdown.mjs';

import { getKBRoot } from '../lib/config.mjs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const KB_ROOT = getKBRoot();
const WIKI = join(KB_ROOT, 'wiki');
const QUERY_RESULTS = join(WIKI, 'query-results');

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

function extractTldr(content) {
  const match = content.match(/TLDR:\s*(.+)/i);
  return match ? match[1].trim() : null;
}

function extractTitle(content, filename) {
  const h1 = content.match(/^#\s+(.+)$/m);
  return h1 ? h1[1].trim() : filename.replace(/-/g, ' ').replace('.md', '');
}

function scoreRelevance(content, queryTerms) {
  let score = 0;
  for (const term of queryTerms) {
    const re = new RegExp(term, 'gi');
    const matches = content.match(re);
    if (matches) score += matches.length;
  }
  return score;
}

function loadWikiPages(wikiDir) {
  const pages = [];
  if (!existsSync(wikiDir)) return pages;

  const subdirs = ['summaries', 'concepts', 'entities', 'comparisons', 'query-results'];
  for (const sub of subdirs) {
    const dir = join(wikiDir, sub);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter(f => f.endsWith('.md') && f !== '_index.md')) {
      try {
        const content = readFileSync(join(dir, file), 'utf8');
        pages.push({ file, sub, content, path: `wiki/${sub}/${file}` });
      } catch { /* skip unreadable */ }
    }
  }
  return pages;
}

function buildQueryResultPage({ query, answer, sources }) {
  const title = `Query: ${query.slice(0, 60)}${query.length > 60 ? '...' : ''}`;
  const fm = buildFrontmatter({
    title,
    type: 'query-result',
    sources,
    created: today(),
    updated: today(),
    tags: ['kb', 'query-result'],
    query,
    status: 'active',
    confidence: 'medium',
  });

  return `${fm}
# ${title}

TLDR: ${answer.slice(0, 120)}${answer.length > 120 ? '...' : ''}

## Query

${query}

## Answer

${answer}

## Supporting Evidence

${sources.map(s => `- \`${s}\``).join('\n') || '- No sources loaded from wiki yet.'}

## Limitations

- This answer reflects wiki content at the time of filing (${today()}).
- Review source pages for full context and counter-arguments.

## Backlinks

<!-- Add links to related wiki pages that reference this query-result -->
`;
}

export async function run(flags = {}) {
  const query = flags.query;
  const shouldSave = Boolean(flags.save);
  const dryRun = Boolean(flags['dry-run']);

  if (!query) {
    console.error('Error: --query "<question>" is required.');
    console.error('Example: node run.mjs kb query --query "What drives energy sector outperformance?"');
    process.exit(1);
  }

  console.log(`\n🔍 KB Query: "${query}"`);
  console.log(`   Scanning wiki index...`);

  const pages = loadWikiPages(WIKI);

  if (pages.length === 0) {
    console.log('\n   Wiki is empty. Ingest and compile sources first.');
    console.log('   node run.mjs kb ingest --file <source> --kind article');
    return;
  }

  // Extract query terms for relevance scoring
  const stopWords = new Set(['the', 'is', 'a', 'an', 'and', 'or', 'of', 'in', 'to', 'for', 'what', 'how', 'why', 'when', 'are', 'does']);
  const queryTerms = query.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2 && !stopWords.has(t));

  // Phase 1: scan TLDRs
  const scored = pages.map(p => ({
    ...p,
    tldr: extractTldr(p.content),
    title: extractTitle(p.content, p.file),
    score: scoreRelevance(p.content, queryTerms),
  })).filter(p => p.score > 0).sort((a, b) => b.score - a.score);

  console.log(`\n   ${pages.length} wiki pages indexed | ${scored.length} relevant to query`);

  if (scored.length === 0) {
    console.log('\n   No relevant wiki pages found for this query.');
    console.log('   The wiki may not yet contain information on this topic.');
    if (shouldSave && !dryRun) {
      // Still file as an open question
      const answer = 'No relevant wiki content found. This is an open question for future research.';
      const page = buildQueryResultPage({ query, answer, sources: [] });
      if (!existsSync(QUERY_RESULTS)) mkdirSync(QUERY_RESULTS, { recursive: true });
      const slug = slugify(query);
      const outPath = join(QUERY_RESULTS, `${slug}.md`);
      writeFileSync(outPath, page, 'utf8');
      console.log(`\n📝 Filed as open question: ${outPath}`);
    }
    return;
  }

  // Phase 2: display relevant context
  console.log('\n📚 Relevant wiki pages:\n');
  const topPages = scored.slice(0, 5);
  topPages.forEach((p, i) => {
    console.log(`   ${i + 1}. [${p.sub}] ${p.title} (score: ${p.score})`);
    if (p.tldr) console.log(`      TLDR: ${p.tldr}`);
  });

  // Synthesize a simple context block
  const contextBlocks = topPages.map(p => {
    const tldr = p.tldr ? `TLDR: ${p.tldr}` : '';
    return `### ${p.title}\n${tldr}\n\nPath: ${p.path}`;
  });

  const synthesized = `Based on ${topPages.length} relevant wiki page(s):\n\n${contextBlocks.join('\n\n')}`;

  console.log('\n📋 Synthesized context:\n');
  console.log(synthesized);
  console.log('\n---');
  console.log('Review the above pages and formulate your answer. If the answer is durable, run with --save to file it.');

  if (shouldSave && !dryRun) {
    const answer = synthesized;
    const sources = topPages.map(p => p.path);
    const page = buildQueryResultPage({ query, answer, sources });

    if (!existsSync(QUERY_RESULTS)) mkdirSync(QUERY_RESULTS, { recursive: true });
    const slug = slugify(query);
    const outPath = join(QUERY_RESULTS, `${slug}.md`);
    writeFileSync(outPath, page, 'utf8');
    console.log(`\n✅ Query result filed: ${outPath}`);
  } else if (shouldSave && dryRun) {
    console.log('\n[dry-run] Would save query-result to wiki/query-results/');
  }
}
