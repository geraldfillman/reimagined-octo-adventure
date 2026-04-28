/**
 * kb-suggest.mjs — Surface structural gaps and suggest missing wiki pages
 *
 * Usage:
 *   node run.mjs kb suggest
 *   node run.mjs kb suggest --save
 *   node run.mjs kb suggest --dry-run
 *
 * Flags:
 *   --save     Write suggestions to health-checks/suggestions-<date>.md
 *   --dry-run  Print suggestions without saving
 *
 * Suggests:
 *   - Missing concept pages (recurring terms without a concept page)
 *   - Comparison opportunities (multiple entities on same topic)
 *   - Bridge pages (concepts that appear in multiple summaries but aren't linked)
 *   - Unanswered questions (open query-results)
 *   - Structural gaps (imbalanced page types)
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { today } from '../lib/markdown.mjs';

import { getKBRoot } from '../lib/config.mjs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const KB_ROOT = getKBRoot();
const WIKI = join(KB_ROOT, 'wiki');
const HEALTH = join(KB_ROOT, 'health-checks');

const WIKI_SUBDIRS = ['summaries', 'concepts', 'entities', 'comparisons', 'query-results'];

// High-value investment research concept terms that warrant their own pages
const CONCEPT_SEEDS = [
  'yield curve', 'rate sensitivity', 'operating leverage', 'capital cycle',
  'credit spread', 'earnings revision', 'supply chain', 'geopolitical risk',
  'regime change', 'factor investing', 'alpha generation', 'beta exposure',
  'liquidity premium', 'mean reversion', 'momentum', 'value investing',
  'market microstructure', 'information ratio', 'sharpe ratio', 'drawdown',
  'correlation', 'convexity', 'duration', 'sector rotation',
];

function loadPages() {
  const pages = [];
  for (const sub of WIKI_SUBDIRS) {
    const dir = join(WIKI, sub);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('_'))) {
      const content = readFileSync(join(dir, file), 'utf8');
      pages.push({ file, sub, content });
    }
  }
  return pages;
}

function getPageTitles(pages, sub) {
  return pages.filter(p => p.sub === sub).map(p => {
    const m = p.content.match(/^#\s+(.+)$/m);
    return m ? m[1].trim().toLowerCase() : p.file.replace('.md', '');
  });
}

function termFrequency(pages, terms) {
  const freq = new Map();
  const allContent = pages.map(p => p.content.toLowerCase()).join('\n');
  for (const term of terms) {
    const matches = allContent.match(new RegExp(term, 'g'));
    if (matches && matches.length >= 2) freq.set(term, matches.length);
  }
  return [...freq.entries()].sort((a, b) => b[1] - a[1]);
}

function findComparablePairs(entityPages) {
  // Look for entities with similar tags
  const entities = entityPages.map(p => {
    const tagsMatch = p.content.match(/^tags:\s*\[(.+)\]/m);
    const title = p.content.match(/^#\s+(.+)$/m)?.[1] ?? p.file;
    const tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim().replace(/["']/g, '')) : [];
    return { title, tags };
  });

  const pairs = [];
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const shared = entities[i].tags.filter(t => entities[j].tags.includes(t) && t !== 'kb');
      if (shared.length >= 1) {
        pairs.push(`Compare [[${entities[i].title}]] vs [[${entities[j].title}]] (shared: ${shared.join(', ')})`);
      }
    }
  }
  return pairs.slice(0, 5);
}

export async function run(flags = {}) {
  const shouldSave = Boolean(flags.save);
  const dryRun = Boolean(flags['dry-run']);

  console.log('\n💡 KB Suggest');

  const pages = loadPages();

  if (pages.length === 0) {
    console.log('   Wiki is empty. Compile some sources first.');
    return;
  }

  const conceptTitles = getPageTitles(pages, 'concepts');
  const entityPages = pages.filter(p => p.sub === 'entities');
  const comparisonTitles = getPageTitles(pages, 'comparisons');
  const queryResults = pages.filter(p => p.sub === 'query-results');
  const openQuestions = queryResults.filter(p => /open question|no relevant wiki/i.test(p.content));

  const suggestions = [];

  // 1. Missing concept pages
  const termFreq = termFrequency(pages, CONCEPT_SEEDS);
  const missingConcepts = termFreq.filter(([term]) => !conceptTitles.some(t => t.includes(term)));
  if (missingConcepts.length > 0) {
    suggestions.push({
      category: 'Missing Concept Pages',
      items: missingConcepts.slice(0, 8).map(([term, count]) =>
        `Create concept page for **${term}** (appears ${count}x across wiki)`)
    });
  }

  // 2. Comparison opportunities from entities
  if (entityPages.length >= 2) {
    const pairs = findComparablePairs(entityPages);
    if (pairs.length > 0) {
      suggestions.push({
        category: 'Comparison Opportunities',
        items: pairs
      });
    }
  }

  // 3. Open questions needing research
  if (openQuestions.length > 0) {
    suggestions.push({
      category: 'Open Research Questions',
      items: openQuestions.map(p => {
        const qMatch = p.content.match(/^query:\s*["']?(.+?)["']?\s*$/m);
        return qMatch ? `Research: "${qMatch[1]}"` : `Review open question: ${p.file}`;
      })
    });
  }

  // 4. Structural gaps
  const counts = Object.fromEntries(WIKI_SUBDIRS.map(s => [s, pages.filter(p => p.sub === s).length]));
  const structuralSuggestions = [];
  if (counts.concepts === 0 && counts.summaries > 2) structuralSuggestions.push('Create concept pages from recurring themes in summaries.');
  if (counts.comparisons === 0 && counts.entities >= 2) structuralSuggestions.push('You have entity pages — consider creating comparison pages.');
  if (counts['query-results'] < counts.summaries / 3) structuralSuggestions.push('Filing query-results compounds your research. Try: node run.mjs kb query --query "..." --save');
  if (structuralSuggestions.length > 0) {
    suggestions.push({ category: 'Structural Improvements', items: structuralSuggestions });
  }

  // Print suggestions
  if (suggestions.length === 0) {
    console.log('\n   Wiki looks well-structured. No major gaps found.');
    return;
  }

  for (const { category, items } of suggestions) {
    console.log(`\n   📌 ${category}:`);
    items.slice(0, 5).forEach(item => console.log(`     - ${item}`));
  }

  if (shouldSave && !dryRun) {
    if (!existsSync(HEALTH)) mkdirSync(HEALTH, { recursive: true });
    const outPath = join(HEALTH, `suggestions-${today()}.md`);

    const body = suggestions.map(({ category, items }) =>
      `## ${category}\n\n${items.map(i => `- ${i}`).join('\n')}`
    ).join('\n\n');

    const report = `---
title: "KB Suggestions ${today()}"
type: health-check
created: ${today()}
tags: [kb, suggestions]
---

# KB Structural Suggestions — ${today()}

${body}
`;
    writeFileSync(outPath, report, 'utf8');
    console.log(`\n   Suggestions saved: ${outPath}`);
  } else if (shouldSave && dryRun) {
    console.log('\n[dry-run] Would save suggestions to health-checks/');
  }
}
