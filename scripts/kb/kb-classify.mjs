/**
 * kb-classify.mjs — Apply source classification and extraction rules to an intake manifest
 *
 * Usage:
 *   node run.mjs kb classify --file slug-manifest.md
 *   node run.mjs kb classify --file slug-manifest.md --kind report
 *   node run.mjs kb classify --dry-run
 *
 * Flags:
 *   --file <name>   Manifest filename in wiki/index/ or jobs/ (required, or --all)
 *   --all           Classify all pending manifests
 *   --kind <kind>   Override the guessed source kind
 *   --dry-run       Preview without writing
 *
 * Output: Updates the manifest with classification notes and extraction depth rule.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { getKBRoot } from '../lib/config.mjs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const KB_ROOT = getKBRoot();
const INDEX = join(KB_ROOT, 'wiki', 'index');
const JOBS = join(KB_ROOT, 'jobs');

// Extraction rules per source kind (from spec)
const EXTRACTION_RULES = {
  'report': {
    label: 'Deep extraction (report/whitepaper)',
    extracts: ['section-by-section structure', 'executive summary', 'major findings', 'evidence', 'methods', 'limitations', 'notable charts or tables'],
    dest: 'wiki/summaries',
  },
  'paper': {
    label: 'Deep extraction (academic paper)',
    extracts: ['abstract', 'methodology', 'findings', 'limitations', 'implications'],
    dest: 'wiki/summaries',
  },
  'article': {
    label: 'Standard extraction (article/blog)',
    extracts: ['key claims', 'supporting evidence', 'assumptions', 'perspective/bias', 'important omissions'],
    dest: 'wiki/summaries',
  },
  'transcript': {
    label: 'Transcript extraction',
    extracts: ['speakers', 'decisions', 'action items', 'quotes', 'unresolved questions', 'disagreements'],
    dest: 'wiki/summaries',
  },
  'thread': {
    label: 'Thread extraction',
    extracts: ['core insight', 'supporting context', 'signal vs opinion', 'missing context'],
    dest: 'wiki/summaries',
  },
  'repo': {
    label: 'Code repo extraction',
    extracts: ['architecture', 'dependencies', 'patterns', 'major modules', 'design intent', 'tradeoffs', 'use cases'],
    dest: 'wiki/entities',
  },
  'dataset': {
    label: 'Dataset description',
    extracts: ['schema', 'coverage', 'update frequency', 'source', 'use cases', 'limitations'],
    dest: 'wiki/summaries',
  },
};

function resolveManifestPath(filename) {
  for (const dir of [INDEX, JOBS]) {
    const p = join(dir, filename);
    if (existsSync(p)) return p;
  }
  return null;
}

function updateManifest(content, kind) {
  const rule = EXTRACTION_RULES[kind] ?? EXTRACTION_RULES['article'];

  // Update source_kind in frontmatter
  let updated = content.replace(/^source_kind:.*$/m, `source_kind: ${kind}`);
  // Update status
  updated = updated.replace(/^status:.*$/m, 'status: classified');
  // Update extraction_depth_rule
  updated = updated.replace(/^extraction_depth_rule:.*$/m, `extraction_depth_rule: ${kind}`);

  // Update Classification Notes section
  const classNotes = `## Classification Notes

Source kind: **${kind}** — ${rule.label}

Extraction targets:
${rule.extracts.map(e => `- ${e}`).join('\n')}

Suggested destination: \`${rule.dest}/\``;

  updated = updated.replace(
    /## Classification Notes[\s\S]*?(?=## Extraction Plan|## Duplicate)/,
    classNotes + '\n\n'
  );

  return updated;
}

export async function run(flags = {}) {
  const filename = flags.file;
  const classifyAll = Boolean(flags.all);
  const kindOverride = flags.kind;
  const dryRun = Boolean(flags['dry-run']);

  if (!filename && !classifyAll) {
    console.error('Error: --file <manifest> or --all is required.');
    console.error('Example: node run.mjs kb classify --file my-article-manifest.md');
    process.exit(1);
  }

  const targets = [];

  if (classifyAll) {
    for (const dir of [INDEX, JOBS]) {
      if (!existsSync(dir)) continue;
      readdirSync(dir)
        .filter(f => f.endsWith('-manifest.md'))
        .forEach(f => targets.push({ path: join(dir, f), filename: f }));
    }
  } else {
    const resolved = resolveManifestPath(filename);
    if (!resolved) {
      console.error(`Error: Manifest not found: ${filename}`);
      console.error(`  Searched: ${INDEX}, ${JOBS}`);
      process.exit(1);
    }
    targets.push({ path: resolved, filename });
  }

  const pending = targets.filter(t => {
    const c = readFileSync(t.path, 'utf8');
    return c.includes('status: pending') || classifyAll;
  });

  console.log(`\n🗂️  KB Classify: ${pending.length} manifest(s)`);

  let classified = 0;
  for (const { path, filename: fname } of pending) {
    const content = readFileSync(path, 'utf8');

    // Determine kind from manifest or override
    const existingKindMatch = content.match(/^source_kind:\s*(.+)$/m);
    const existingKind = existingKindMatch ? existingKindMatch[1].trim() : 'article';
    const kind = kindOverride ?? existingKind;

    const rule = EXTRACTION_RULES[kind] ?? EXTRACTION_RULES['article'];
    console.log(`   ${fname}`);
    console.log(`   → kind: ${kind} | dest: ${rule.dest}`);

    if (!dryRun) {
      const updated = updateManifest(content, kind);
      writeFileSync(path, updated, 'utf8');
    }
    classified++;
  }

  console.log(`\n✅ Classified: ${classified} manifest(s)${dryRun ? ' (dry-run)' : ''}`);
  if (classified > 0 && !dryRun) {
    console.log(`   Next: node run.mjs kb compile --file <slug>-manifest.md`);
  }
}
