/**
 * kb-librarian.mjs — Wiki health maintenance: lint, check, auto-fix low-risk issues
 *
 * Usage:
 *   node run.mjs kb librarian
 *   node run.mjs kb librarian --fix
 *   node run.mjs kb librarian --dry-run
 *
 * Flags:
 *   --fix      Auto-fix low-risk issues (missing TLDR stubs, duplicate tags)
 *   --dry-run  Report issues without writing anything
 *
 * Checks:
 *   - Missing required frontmatter fields (title, type, sources, created, updated, tags)
 *   - Missing TLDR line (first content line after title)
 *   - Concept pages missing ## counter-arguments and data gaps
 *   - Orphan pages (no backlinks from other pages)
 *   - Query-results with no backlinks
 *   - Stale pages (updated > 90 days ago)
 *
 * Output:
 *   12_Knowledge_Bases/health-checks/librarian-<date>.md
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

const REQUIRED_FIELDS = ['title', 'type', 'sources', 'created', 'updated', 'tags'];
const SUBDIRS = ['summaries', 'concepts', 'entities', 'comparisons', 'query-results'];
const STALE_DAYS = 90;

function parseMeta(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const k = line.slice(0, colonIdx).trim();
      const v = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      data[k] = v;
    }
  }
  return data;
}

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function hasTldr(content) {
  // TLDR should appear within first few lines after the title
  const lines = content.split('\n').filter(l => l.trim());
  const titleIdx = lines.findIndex(l => l.startsWith('# '));
  if (titleIdx < 0) return false;
  const afterTitle = lines.slice(titleIdx + 1, titleIdx + 4);
  return afterTitle.some(l => /^TLDR:/i.test(l));
}

function hasCounterArgs(content) {
  return /##\s+counter-arguments and data gaps/i.test(content);
}

function addTldrStub(content, title) {
  return content.replace(
    new RegExp(`(# ${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n)`),
    `$1\nTLDR: _Review and fill in._\n`
  );
}

function daysSince(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return 0;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function loadAllPages() {
  const pages = [];
  for (const sub of SUBDIRS) {
    const dir = join(WIKI, sub);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('_'))) {
      const path = join(dir, file);
      const content = readFileSync(path, 'utf8');
      pages.push({ file, sub, path, content, relPath: `wiki/${sub}/${file}` });
    }
  }
  return pages;
}

function buildBacklinkMap(pages) {
  const map = new Map(); // relPath → Set of pages that link to it
  for (const page of pages) {
    for (const other of pages) {
      if (page.path === other.path) continue;
      if (other.content.includes(page.file.replace('.md', '')) ||
          other.content.includes(page.relPath)) {
        if (!map.has(page.relPath)) map.set(page.relPath, new Set());
        map.get(page.relPath).add(other.relPath);
      }
    }
  }
  return map;
}

export async function run(flags = {}) {
  const shouldFix = Boolean(flags.fix);
  const dryRun = Boolean(flags['dry-run']);

  console.log(`\n📚 KB Librarian${dryRun ? ' (dry-run)' : ''}${shouldFix ? ' + auto-fix' : ''}`);

  if (!existsSync(WIKI)) {
    console.log('   Wiki is empty. Nothing to check.');
    return;
  }

  const pages = loadAllPages();
  if (pages.length === 0) {
    console.log('   No wiki pages found. Compile some sources first.');
    return;
  }

  console.log(`   Scanning ${pages.length} wiki page(s)...`);

  const backlinkMap = buildBacklinkMap(pages);

  const issues = {
    missingFrontmatter: [],
    missingTldr: [],
    missingCounterArgs: [],
    orphans: [],
    stale: [],
    queryResultsNoBacklinks: [],
  };

  const autoFixed = [];

  for (const page of pages) {
    const { content, path, relPath, sub, file } = page;
    const meta = parseMeta(content);
    const title = extractTitle(content) ?? file;

    // Missing frontmatter
    const missingFields = REQUIRED_FIELDS.filter(f => !meta[f] || meta[f] === '' || meta[f] === '[]');
    if (missingFields.length > 0) {
      issues.missingFrontmatter.push({ page: relPath, missing: missingFields.join(', ') });
    }

    // Missing TLDR
    if (!hasTldr(content)) {
      issues.missingTldr.push({ page: relPath });
      if (shouldFix && !dryRun && title) {
        const fixed = addTldrStub(content, title);
        if (fixed !== content) {
          writeFileSync(path, fixed, 'utf8');
          autoFixed.push(`Added TLDR stub: ${relPath}`);
        }
      }
    }

    // Concept pages missing counter-arguments
    if ((meta.type === 'concept' || sub === 'concepts') && !hasCounterArgs(content)) {
      issues.missingCounterArgs.push({ page: relPath });
    }

    // Orphan pages
    const backlinks = backlinkMap.get(relPath);
    if (!backlinks || backlinks.size === 0) {
      if (sub === 'query-results') {
        issues.queryResultsNoBacklinks.push({ page: relPath });
      } else {
        issues.orphans.push({ page: relPath });
      }
    }

    // Stale pages
    if (meta.updated) {
      const age = daysSince(meta.updated);
      if (age > STALE_DAYS) {
        issues.stale.push({ page: relPath, days: age });
      }
    }
  }

  // Print report
  const totalIssues = Object.values(issues).reduce((s, arr) => s + arr.length, 0);
  console.log(`\n   Issues found: ${totalIssues}`);

  const sections = [];

  if (issues.missingFrontmatter.length > 0) {
    console.log(`   ❌ Missing frontmatter: ${issues.missingFrontmatter.length}`);
    issues.missingFrontmatter.forEach(i => console.log(`      ${i.page} — missing: ${i.missing}`));
    sections.push(`## Missing Frontmatter Fields\n\n${buildTable(['Page', 'Missing Fields'], issues.missingFrontmatter.map(i => [i.page, i.missing]))}`);
  }

  if (issues.missingTldr.length > 0) {
    const fixNote = shouldFix ? ' (auto-fixed)' : '';
    console.log(`   ⚠️  Missing TLDR: ${issues.missingTldr.length}${fixNote}`);
    sections.push(`## Missing TLDR Lines\n\n${issues.missingTldr.map(i => `- \`${i.page}\``).join('\n')}`);
  }

  if (issues.missingCounterArgs.length > 0) {
    console.log(`   ⚠️  Concept pages missing counter-arguments: ${issues.missingCounterArgs.length}`);
    sections.push(`## Concept Pages Missing Counter-Arguments\n\n${issues.missingCounterArgs.map(i => `- \`${i.page}\``).join('\n')}`);
  }

  if (issues.orphans.length > 0) {
    console.log(`   ℹ️  Orphan pages (no backlinks): ${issues.orphans.length}`);
    sections.push(`## Orphan Pages\n\n${issues.orphans.map(i => `- \`${i.page}\``).join('\n')}`);
  }

  if (issues.queryResultsNoBacklinks.length > 0) {
    console.log(`   ℹ️  Query-results with no backlinks: ${issues.queryResultsNoBacklinks.length}`);
    sections.push(`## Query-Results With No Backlinks\n\n${issues.queryResultsNoBacklinks.map(i => `- \`${i.page}\``).join('\n')}`);
  }

  if (issues.stale.length > 0) {
    console.log(`   ⏰ Stale pages (>${STALE_DAYS}d): ${issues.stale.length}`);
    sections.push(`## Stale Pages\n\n${buildTable(['Page', 'Days Since Update'], issues.stale.map(i => [i.page, String(i.days)]))}`);
  }

  if (autoFixed.length > 0) {
    console.log(`\n   ✅ Auto-fixed: ${autoFixed.length}`);
    autoFixed.forEach(f => console.log(`      ${f}`));
    sections.push(`## Auto-Fixed\n\n${autoFixed.map(f => `- ${f}`).join('\n')}`);
  }

  // Write report
  if (!dryRun) {
    if (!existsSync(HEALTH)) mkdirSync(HEALTH, { recursive: true });
    const reportPath = join(HEALTH, `librarian-${today()}.md`);
    const report = `---
title: "Librarian Report ${today()}"
type: health-check
created: ${today()}
tags: [kb, librarian, health]
total_issues: ${totalIssues}
pages_scanned: ${pages.length}
---

# KB Librarian Report — ${today()}

**Pages scanned**: ${pages.length}
**Total issues**: ${totalIssues}
**Auto-fixed**: ${autoFixed.length}

${sections.join('\n\n')}
`;
    writeFileSync(reportPath, report, 'utf8');
    console.log(`\n   Report saved: ${reportPath}`);
  }

  if (totalIssues === 0) console.log('\n✅ Wiki is clean. No issues found.');
}
