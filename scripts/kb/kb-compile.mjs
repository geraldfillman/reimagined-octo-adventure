/**
 * kb-compile.mjs — Extract classified source into wiki page(s)
 *
 * Usage:
 *   node run.mjs kb compile --file slug-manifest.md
 *   node run.mjs kb compile --file slug-manifest.md --dest wiki/concepts
 *   node run.mjs kb compile --file slug-manifest.md --dry-run
 *
 * Flags:
 *   --file <name>   Manifest filename in wiki/index/ or jobs/ (required)
 *   --dest <dir>    Override destination wiki subdir (summaries|concepts|entities|comparisons|query-results)
 *   --dry-run       Preview without writing
 *
 * Output: Creates a wiki page in the appropriate wiki/ subdirectory.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { today, buildFrontmatter } from '../lib/markdown.mjs';

import { getKBRoot, getKBVaultRoot } from '../lib/config.mjs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = getKBVaultRoot();
const KB_ROOT = getKBRoot();
const INDEX = join(KB_ROOT, 'wiki', 'index');
const JOBS = join(KB_ROOT, 'jobs');

const VALID_DESTS = ['summaries', 'concepts', 'entities', 'comparisons', 'query-results'];

const KIND_TO_TYPE = {
  report: 'summary', paper: 'summary', article: 'summary',
  transcript: 'summary', thread: 'summary',
  repo: 'entity', dataset: 'summary',
};

const KIND_TO_DEST = {
  report: 'summaries', paper: 'summaries', article: 'summaries',
  transcript: 'summaries', thread: 'summaries',
  repo: 'entities', dataset: 'summaries',
};

function resolveManifestPath(filename) {
  for (const dir of [INDEX, JOBS]) {
    const p = join(dir, filename);
    if (existsSync(p)) return p;
  }
  return null;
}

function parseFrontmatterSimple(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split('\n')) {
    const [k, ...v] = line.split(':');
    if (k && v.length) data[k.trim()] = v.join(':').trim().replace(/^["']|["']$/g, '');
  }
  return data;
}

function readSourceContent(rawPath) {
  const absPath = rawPath.startsWith('12_Knowledge_Bases')
    ? join(VAULT_ROOT, rawPath)
    : rawPath;
  if (!existsSync(absPath)) return null;
  return readFileSync(absPath, 'utf8');
}

function buildWikiPage({ title, type, sourceTitle, sourcePath, kind, content }) {
  const fm = buildFrontmatter({
    title,
    type,
    sources: [sourcePath],
    created: today(),
    updated: today(),
    tags: ['kb', kind],
    status: 'draft',
    confidence: 'medium',
    source_kind: kind,
    review_needed: true,
  });

  const isConceptType = type === 'concept';

  // Extract key sections from source content via simple heuristics
  const sections = [];

  if (content) {
    // Pull first 3 paragraphs as raw content for editor to refine
    const paragraphs = content.split(/\n{2,}/).filter(p => p.trim() && !p.startsWith('#')).slice(0, 4);
    if (paragraphs.length > 0) {
      sections.push(`## Extracted Content\n\n> Raw extraction — review and restructure before marking as active.\n\n${paragraphs.join('\n\n')}`);
    }
  }

  const counterArgs = isConceptType ? `\n## counter-arguments and data gaps\n\n- **Strongest critique**: \n- **Conflicting evidence**: \n- **Missing data**: \n- **Unresolved assumptions**: \n- **What would change the conclusion**: \n` : '';

  return `${fm}
# ${title}

TLDR: _Review and fill in after reading the source._

${sections.join('\n\n')}
${counterArgs}
## Sources

- [[${sourceTitle}]] → \`${sourcePath}\`

## Related

<!-- Add backlinks to related wiki pages -->
`;
}

export async function run(flags = {}) {
  const filename = flags.file;
  const destOverride = flags.dest;
  const dryRun = Boolean(flags['dry-run']);

  if (!filename) {
    console.error('Error: --file <manifest> is required.');
    console.error('Example: node run.mjs kb compile --file my-article-manifest.md');
    process.exit(1);
  }

  if (destOverride && !VALID_DESTS.includes(destOverride)) {
    console.error(`Error: --dest must be one of: ${VALID_DESTS.join(', ')}`);
    process.exit(1);
  }

  const manifestPath = resolveManifestPath(filename);
  if (!manifestPath) {
    console.error(`Error: Manifest not found: ${filename}`);
    process.exit(1);
  }

  const content = readFileSync(manifestPath, 'utf8');
  const meta = parseFrontmatterSimple(content);

  if (meta.status === 'pending') {
    console.error('Error: Manifest has not been classified yet. Run kb classify first.');
    process.exit(1);
  }

  const sourceTitle = meta.source_title ?? 'Unknown Source';
  const kind = meta.source_kind ?? 'article';
  const rawPath = meta.raw_path ?? '';
  const type = KIND_TO_TYPE[kind] ?? 'summary';
  const destSubdir = destOverride ?? KIND_TO_DEST[kind] ?? 'summaries';

  const title = sourceTitle + ' — Summary';
  const slugTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  const destDir = join(KB_ROOT, 'wiki', destSubdir);
  const outputPath = join(destDir, `${slugTitle}.md`);

  const sourceContent = readSourceContent(rawPath);

  const wikiPage = buildWikiPage({ title, type, sourceTitle, sourcePath: rawPath, kind, content: sourceContent });

  console.log(`\n📝 KB Compile: ${sourceTitle}`);
  console.log(`   Kind:   ${kind}`);
  console.log(`   Type:   ${type}`);
  console.log(`   Output: ${outputPath}`);

  if (dryRun) {
    console.log('\n[dry-run] Would write wiki page. No files written.');
    console.log('\n--- Preview (first 400 chars) ---');
    console.log(wikiPage.slice(0, 400) + '...');
    return;
  }

  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
  writeFileSync(outputPath, wikiPage, 'utf8');

  // Update manifest status to compiled
  const updatedManifest = content
    .replace(/^status:.*$/m, 'status: compiled')
    .replace(/## Extraction Output[\s\S]*$/, `## Extraction Output\n\n- [[${title}]] → \`12_Knowledge_Bases/wiki/${destSubdir}/${slugTitle}.md\`\n`);
  writeFileSync(manifestPath, updatedManifest, 'utf8');

  // Strict cleanup — delete raw source after wiki page is written
  const rawAbsPath = rawPath.startsWith('12_Knowledge_Bases')
    ? join(VAULT_ROOT, rawPath)
    : rawPath;
  if (rawPath && existsSync(rawAbsPath)) {
    unlinkSync(rawAbsPath);
    console.log(`   🗑️  Raw deleted: ${rawPath}`);
  }

  console.log('\n✅ Wiki page created.');
  console.log(`   Review and refine: ${outputPath}`);
  console.log(`   Next: node run.mjs kb librarian --dry-run`);
}
