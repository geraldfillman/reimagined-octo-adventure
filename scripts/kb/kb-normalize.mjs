/**
 * kb-normalize.mjs — Inbox normalization: clean, classify, and create intake manifests
 *
 * Usage:
 *   node run.mjs kb normalize
 *   node run.mjs kb normalize --file inbox/article.md
 *   node run.mjs kb normalize --dry-run
 *
 * Flags:
 *   --file <name>  Normalize only this specific inbox file
 *   --dry-run      Preview without writing
 *
 * Output:
 *   12_Knowledge_Bases/wiki/index/<slug>-manifest.md  (one per source)
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { today, buildFrontmatter } from '../lib/markdown.mjs';
import { run as classify } from './kb-classify.mjs';
import { run as compile } from './kb-compile.mjs';

import { getKBRoot } from '../lib/config.mjs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const KB_ROOT = getKBRoot();
const RAW_ROOT = join(KB_ROOT, 'raw');
const INBOX = join(KB_ROOT, 'raw', 'inbox'); // kept for legacy compat
const INDEX = join(KB_ROOT, 'wiki', 'index');
const JOBS = join(KB_ROOT, 'jobs');

// Subfolders under raw/ that contain processable files (images skipped)
const RAW_SCAN_DIRS = ['inbox', 'articles', 'papers', 'datasets', 'transcripts', 'repos', 'housing', 'energy'];

const SKIP_FILES = new Set(['.gitkeep', '_README.md', '.DS_Store']);

const KIND_MAP = {
  '.md': 'article', '.txt': 'article', '.html': 'article',
  '.pdf': 'paper', '.epub': 'paper',
  '.json': 'dataset', '.csv': 'dataset',
  '.py': 'repo', '.js': 'repo', '.ts': 'repo', '.mjs': 'repo',
};

function guessKind(filename, content) {
  const ext = extname(filename).toLowerCase();
  if (KIND_MAP[ext]) return KIND_MAP[ext];
  // Heuristics from content
  if (/^#+\s+abstract/im.test(content)) return 'paper';
  if (/speaker[s]?:/i.test(content)) return 'transcript';
  if (/\[.*\]\(http/i.test(content)) return 'article';
  return 'article';
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

function extractTitle(filename, content) {
  const h1 = content.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  const fm = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  if (fm) return fm[1].trim();
  return basename(filename, extname(filename)).replace(/[-_]/g, ' ');
}

function extractDate(content) {
  const match = content.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

const KNOWN_DOMAINS = ['housing', 'energy', 'macro', 'market', 'osint', 'social', 'science', 'government', 'news', 'sectors'];

function extractDomain(filename, subfolder) {
  const stem = basename(filename, extname(filename)).toLowerCase().replace(/^\d{4}-\d{2}-\d{2}[-_]/, '');
  const match = KNOWN_DOMAINS.find(d => stem.includes(d));
  return match ?? subfolder;
}

function personalBoundaryRisk(content) {
  // Flag content with personal/reflective signals
  const signals = [/\bi feel\b/i, /\bmy thoughts\b/i, /\bdear diary\b/i, /\bpersonal note\b/i, /\bconfidential\b/i];
  return signals.some(r => r.test(content));
}

function findDuplicateCandidate(slug, existingManifests) {
  return existingManifests.some(m => m !== `${slug}-manifest.md` && m.startsWith(slug.slice(0, 20)));
}

function buildManifestContent({ title, kind, slug, filename, date, personalRisk, domain }) {
  const fm = buildFrontmatter({
    title: `Intake: ${title}`,
    type: 'intake-manifest',
    source_title: title,
    date_added: today(),
    source_kind: kind,
    domain,
    raw_path: filename, // full relative path e.g. 12_Knowledge_Bases/raw/datasets/foo.md
    status: 'pending',
    tags: ['kb', 'intake', kind, domain],
    duplicate_candidate: false,
    personal_boundary_risk: personalRisk,
    extraction_depth_rule: 'standard',
  });

  const warning = personalRisk
    ? '\n> ⚠️ **Personal boundary risk detected.** Review before wiki compilation.\n'
    : '';

  return `${fm}
# Intake: ${title}
${warning}
TLDR: Pending classification. Source kind: ${kind}${date ? `. Published: ${date}` : ''}.

## Source Details

| Field | Value |
|-------|-------|
| Title | ${title} |
| Kind | ${kind} |
| Date Added | ${today()} |
| Raw Path | ${filename} |
| Status | pending |

## Metadata

- **Date Published**: ${date ?? 'unknown'}
- **Author(s)**:
- **URL / DOI**:

## Classification Notes

_Run \`node run.mjs kb classify --file ${slug}-manifest.md\` to assign extraction rules._

## Extraction Plan

_To be filled after classification._

## Duplicate / Boundary Flags

- Duplicate candidate: No
- Personal boundary risk: ${personalRisk ? 'Yes — review required' : 'No'}

## Extraction Output

_Links to compiled wiki pages will appear here._
`;
}

export async function run(flags = {}) {
  const specificFile = flags.file;
  const dryRun = Boolean(flags['dry-run']);

  // Collect files from all raw/ subfolders
  const allEntries = []; // { filename, subfolder, absPath, relPath }
  for (const sub of RAW_SCAN_DIRS) {
    const dir = join(RAW_ROOT, sub);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter(f => !SKIP_FILES.has(f))) {
      allEntries.push({
        filename: f,
        subfolder: sub,
        absPath: join(dir, f),
        relPath: `12_Knowledge_Bases/raw/${sub}/${f}`,
      });
    }
  }

  const entries = specificFile
    ? allEntries.filter(e => e.filename === specificFile)
    : allEntries;

  if (entries.length === 0) {
    console.log('📭 No files found in raw/ subfolders. Nothing to normalize.');
    return;
  }

  const existingManifests = existsSync(INDEX) ? readdirSync(INDEX) : [];
  let created = 0, skipped = 0;

  console.log(`\n📋 KB Normalize: ${entries.length} raw file(s) across ${RAW_SCAN_DIRS.join(', ')}`);

  for (const { filename, subfolder, absPath, relPath } of entries) {
    const slug = slugify(basename(filename, extname(filename)));
    const manifestFilename = `${slug}-manifest.md`;

    // Skip if manifest already exists in index or jobs
    if (existsSync(join(INDEX, manifestFilename)) || existsSync(join(JOBS, manifestFilename))) {
      console.log(`   [skip] ${subfolder}/${filename} — manifest already exists`);
      skipped++;
      continue;
    }

    const content = readFileSync(absPath, 'utf8');
    const title = extractTitle(filename, content);
    const kind = guessKind(filename, content);
    const date = extractDate(content);
    const personalRisk = personalBoundaryRisk(content);
    const dupCandidate = findDuplicateCandidate(slug, existingManifests);
    const domain = extractDomain(filename, subfolder);

    console.log(`   [new] ${subfolder}/${filename}`);
    console.log(`         title: ${title}`);
    console.log(`         kind:  ${kind}  domain: ${domain}${personalRisk ? ' ⚠️ personal risk' : ''}${dupCandidate ? ' ⚠️ possible duplicate' : ''}`);

    if (!dryRun) {
      if (!existsSync(INDEX)) mkdirSync(INDEX, { recursive: true });
      const manifest = buildManifestContent({ title, kind, slug, filename: relPath, date, personalRisk, domain });
      writeFileSync(join(INDEX, manifestFilename), manifest, 'utf8');

      // Auto-pipeline: classify → compile
      console.log(`\n   ── classify ──`);
      await classify({ file: manifestFilename });
      console.log(`\n   ── compile ──`);
      await compile({ file: manifestFilename });
    }
    created++;
  }

  console.log(`\n✅ Normalize complete: ${created} new manifests${dryRun ? ' (dry-run)' : ''}, ${skipped} skipped.`);
  if (created > 0 && !dryRun) {
    console.log(`   Next: node run.mjs kb classify --file <slug>-manifest.md`);
  }
}
