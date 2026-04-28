/**
 * kb-ingest.mjs — Register a new source into the KB pipeline
 *
 * Usage:
 *   node run.mjs kb ingest --file ./article.md --title "Article Title" --kind article
 *   node run.mjs kb ingest --url https://example.com/paper --kind paper
 *   node run.mjs kb ingest --file ./article.md --dry-run
 *
 * Flags:
 *   --file <path>    Local file to ingest
 *   --url <url>      URL to fetch and save (saves to raw/articles/ by default)
 *   --title <title>  Source title (extracted from H1 if omitted)
 *   --kind <kind>    article|paper|transcript|repo|dataset|thread|report (guessed if omitted)
 *   --dry-run        Preview without writing
 *
 * Output:
 *   12_Knowledge_Bases/raw/inbox/<filename>      (copied source file)
 *   12_Knowledge_Bases/jobs/<slug>-manifest.md   (intake manifest stub)
 */

import { readFileSync, copyFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { today, buildFrontmatter } from '../lib/markdown.mjs';

/**
 * Attempt to fetch a URL via the defuddle CLI (strips nav/ads, returns clean markdown).
 * Falls back to native fetch() if defuddle is not installed or fails.
 * @returns {{ content: string, usedDefuddle: boolean }}
 */
async function fetchUrl(url) {
  const result = spawnSync('defuddle', ['parse', url, '--md'], { encoding: 'utf8', timeout: 30000 });
  if (result.status === 0 && result.stdout && result.stdout.trim().length > 100) {
    return { content: result.stdout, usedDefuddle: true };
  }
  // Fallback: raw fetch
  const res = await fetch(url, { headers: { 'User-Agent': 'vault-kb/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { content: await res.text(), usedDefuddle: false };
}

import { getKBRoot } from '../lib/config.mjs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const KB_ROOT = getKBRoot();
const INBOX = join(KB_ROOT, 'raw', 'inbox');
const JOBS = join(KB_ROOT, 'jobs');

const KIND_EXTENSIONS = {
  '.md': 'article',
  '.pdf': 'paper',
  '.txt': 'transcript',
  '.json': 'dataset',
};

const KIND_DIRS = {
  article: join(KB_ROOT, 'raw', 'articles'),
  paper: join(KB_ROOT, 'raw', 'papers'),
  transcript: join(KB_ROOT, 'raw', 'transcripts'),
  repo: join(KB_ROOT, 'raw', 'repos'),
  dataset: join(KB_ROOT, 'raw', 'datasets'),
  thread: join(KB_ROOT, 'raw', 'articles'),
  report: join(KB_ROOT, 'raw', 'papers'),
};

function guessKind(filename, flags) {
  if (flags.kind) return flags.kind;
  const ext = extname(filename).toLowerCase();
  return KIND_EXTENSIONS[ext] ?? 'article';
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function buildManifest({ title, kind, rawPath, slug }) {
  const fm = buildFrontmatter({
    title: `Intake: ${title}`,
    type: 'intake-manifest',
    source_title: title,
    date_added: today(),
    source_kind: kind,
    raw_path: rawPath,
    status: 'pending',
    tags: ['kb', 'intake', kind],
    duplicate_candidate: false,
    personal_boundary_risk: false,
    extraction_depth_rule: 'standard',
  });

  return `${fm}
# Intake: ${title}

TLDR: Pending classification. Source kind: ${kind}.

## Source Details

| Field | Value |
|-------|-------|
| Title | ${title} |
| Kind | ${kind} |
| Date Added | ${today()} |
| Raw Path | ${rawPath} |
| Status | pending |

## Metadata

- **Author(s)**:
- **Date Published**:
- **URL / DOI**:

## Classification Notes

_Run \`node run.mjs kb classify --file ${slug}-manifest.md\` to assign extraction rules._

## Extraction Plan

_To be filled after classification._

## Duplicate / Boundary Flags

- Duplicate candidate: No
- Personal boundary risk: No

## Extraction Output

_Links to compiled wiki pages will appear here after \`kb compile\`._
`;
}

export async function run(flags = {}) {
  const filePath = flags.file;
  const url = flags.url;
  const dryRun = Boolean(flags['dry-run']);

  if (!filePath && !url) {
    console.error('Error: --file <path> or --url <url> is required.');
    console.error('Example: node run.mjs kb ingest --file ./article.md --kind article');
    process.exit(1);
  }

  let content = '';
  let filename = '';

  if (filePath) {
    const absPath = filePath.startsWith('/') || filePath.match(/^[A-Z]:/i)
      ? filePath
      : join(process.cwd(), filePath);
    if (!existsSync(absPath)) {
      console.error(`Error: File not found: ${absPath}`);
      process.exit(1);
    }
    content = readFileSync(absPath, 'utf8');
    filename = basename(absPath);
  } else {
    console.log(`\n📥 Fetching: ${url}`);
    try {
      const { content: fetched, usedDefuddle } = await fetchUrl(url);
      content = fetched;
      filename = url.split('/').pop().replace(/[?#].*$/, '') || 'fetched-source.md';
      if (!extname(filename)) filename += '.md';
      console.log(`   Source:   ${usedDefuddle ? 'defuddle (clean markdown)' : 'raw fetch (defuddle not available)'}`);
    } catch (err) {
      console.error(`Error: Failed to fetch URL: ${err.message}`);
      process.exit(1);
    }
  }

  const kind = guessKind(filename, flags);
  const title = flags.title ?? extractTitle(content) ?? filename.replace(/\.[^.]+$/, '');
  const slug = slugify(title);
  const inboxDest = join(INBOX, filename);
  const manifestPath = join(JOBS, `${slug}-manifest.md`);
  const manifest = buildManifest({ title, kind, rawPath: `12_Knowledge_Bases/raw/inbox/${filename}`, slug });

  console.log(`\n📥 KB Ingest: ${title}`);
  console.log(`   Kind:     ${kind}`);
  console.log(`   Inbox:    ${inboxDest}`);
  console.log(`   Manifest: ${manifestPath}`);

  if (dryRun) {
    console.log('\n[dry-run] Would copy source and write manifest. No files written.');
    return;
  }

  [INBOX, JOBS].forEach(d => { if (!existsSync(d)) mkdirSync(d, { recursive: true }); });

  if (filePath) {
    const absPath = filePath.startsWith('/') || filePath.match(/^[A-Z]:/i)
      ? filePath : join(process.cwd(), filePath);
    copyFileSync(absPath, inboxDest);
  } else {
    writeFileSync(inboxDest, content, 'utf8');
  }

  writeFileSync(manifestPath, manifest, 'utf8');

  console.log('\n✅ Ingested successfully.');
  console.log(`   Next: node run.mjs kb normalize`);
  console.log(`   Then: node run.mjs kb classify --file ${slug}-manifest.md`);
}
