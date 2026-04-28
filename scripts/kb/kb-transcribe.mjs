/**
 * kb-transcribe.mjs — Extract structured knowledge from transcript files
 *
 * Usage:
 *   node run.mjs kb transcribe --file raw/transcripts/meeting.md
 *   node run.mjs kb transcribe --file meeting.txt --speakers "Alice,Bob,Charlie"
 *   node run.mjs kb transcribe --file meeting.md --dest wiki/summaries --dry-run
 *
 * Flags:
 *   --file <path>        Transcript file (raw/transcripts/ or 12_Knowledge_Bases/transcripts/)
 *   --speakers <names>   Comma-separated known speaker names for detection
 *   --dest <subdir>      Target wiki subdir (default: summaries)
 *   --dry-run            Preview without writing
 *
 * Extracts:
 *   - Decisions
 *   - Action items
 *   - Key quotes
 *   - Unresolved questions
 *   - Disagreements
 *
 * Output:
 *   12_Knowledge_Bases/wiki/summaries/<slug>.md
 *   12_Knowledge_Bases/transcripts/<slug>-extracted.md  (raw extraction)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { today, buildFrontmatter } from '../lib/markdown.mjs';

import { getKBRoot, getKBVaultRoot } from '../lib/config.mjs';
const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = getKBVaultRoot();
const KB_ROOT = getKBRoot();
const WIKI_SUMMARIES = join(KB_ROOT, 'wiki', 'summaries');
const TRANSCRIPTS_OUT = join(KB_ROOT, 'transcripts');

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

function resolveFile(filePath) {
  // Try as-is, then relative to vault root, then relative to KB raw/transcripts
  const attempts = [
    filePath,
    join(VAULT_ROOT, filePath),
    join(KB_ROOT, 'raw', 'transcripts', filePath),
    join(KB_ROOT, 'raw', 'transcripts', basename(filePath)),
  ];
  for (const p of attempts) {
    if (existsSync(p)) return p;
  }
  return null;
}

function extractSpeakers(content, knownSpeakers) {
  const found = new Set();
  // Pattern: "SpeakerName: " or "**SpeakerName**:"
  const pattern = /^(?:\*\*)?([A-Z][a-zA-Z\s]{1,30}?)(?:\*\*)?:\s/gm;
  let m;
  while ((m = pattern.exec(content)) !== null) {
    const name = m[1].trim();
    if (name.length > 1 && name.length < 30 && !name.match(/^(tldr|note|action|decision|question)$/i)) {
      found.add(name);
    }
  }
  if (knownSpeakers) {
    knownSpeakers.split(',').map(s => s.trim()).filter(Boolean).forEach(s => found.add(s));
  }
  return [...found];
}

function extractDecisions(content) {
  const decisions = [];
  const lines = content.split('\n');
  const decisionPatterns = [
    /\b(decided|agreed|concluded|resolved|confirmed)\b.*[.!]/i,
    /\bdecision:\s*(.+)/i,
    /\bwe will\b.*[.!]/i,
    /\bgoing with\b.*[.!]/i,
  ];
  for (const line of lines) {
    if (decisionPatterns.some(p => p.test(line))) {
      const clean = line.replace(/^[#\-*>\s]+/, '').trim();
      if (clean.length > 10) decisions.push(clean);
    }
  }
  return [...new Set(decisions)].slice(0, 15);
}

function extractActionItems(content) {
  const actions = [];
  const patterns = [
    /\b(action|todo|follow[- ]up|will|needs? to|should|must)\b.*[.!]/i,
    /\[ \](.+)/,  // markdown checkbox
  ];
  for (const line of content.split('\n')) {
    if (patterns.some(p => p.test(line))) {
      const clean = line.replace(/^[#\-*>\[\]\s]+/, '').trim();
      if (clean.length > 5) actions.push(clean);
    }
  }
  return [...new Set(actions)].slice(0, 15);
}

function extractQuotes(content, speakers) {
  const quotes = [];
  if (speakers.length === 0) return quotes;
  const pattern = new RegExp(`(${speakers.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')}):\\s*[""]?([^""\n]{20,200})`, 'gm');
  let m;
  while ((m = pattern.exec(content)) !== null) {
    quotes.push({ speaker: m[1], quote: m[2].trim() });
    if (quotes.length >= 8) break;
  }
  return quotes;
}

function extractQuestions(content) {
  const questions = [];
  for (const line of content.split('\n')) {
    const clean = line.replace(/^[#\-*>\s]+/, '').trim();
    if (clean.endsWith('?') && clean.length > 10) {
      questions.push(clean);
    }
  }
  return [...new Set(questions)].slice(0, 10);
}

function buildSummaryPage({ title, slug, speakers, decisions, actions, quotes, questions, sourcePath }) {
  const fm = buildFrontmatter({
    title,
    type: 'summary',
    sources: [sourcePath],
    created: today(),
    updated: today(),
    tags: ['kb', 'transcript', 'meeting'],
    status: 'draft',
    confidence: 'medium',
    source_kind: 'transcript',
    review_needed: true,
  });

  const speakerSection = speakers.length > 0
    ? `## Speakers\n\n${speakers.map(s => `- ${s}`).join('\n')}`
    : '';

  const decisionsSection = decisions.length > 0
    ? `## Decisions\n\n${decisions.map(d => `- ${d}`).join('\n')}`
    : '## Decisions\n\n_No clear decisions extracted._';

  const actionsSection = actions.length > 0
    ? `## Action Items\n\n${actions.map(a => `- [ ] ${a}`).join('\n')}`
    : '## Action Items\n\n_No clear action items extracted._';

  const quotesSection = quotes.length > 0
    ? `## Key Quotes\n\n${quotes.map(q => `> "${q.quote}" — *${q.speaker}*`).join('\n\n')}`
    : '';

  const questionsSection = questions.length > 0
    ? `## Unresolved Questions\n\n${questions.map(q => `- ${q}`).join('\n')}`
    : '';

  return `${fm}
# ${title}

TLDR: _Review and summarize the key outcome of this meeting or discussion._

${speakerSection}

${decisionsSection}

${actionsSection}

${quotesSection}

${questionsSection}

## Sources

- Raw transcript: \`${sourcePath}\`

## Related

<!-- Add backlinks to related wiki pages -->
`;
}

export async function run(flags = {}) {
  const filePath = flags.file;
  const speakersArg = flags.speakers;
  const destOverride = flags.dest;
  const dryRun = Boolean(flags['dry-run']);

  if (!filePath) {
    console.error('Error: --file <transcript> is required.');
    console.error('Example: node run.mjs kb transcribe --file raw/transcripts/meeting.md');
    process.exit(1);
  }

  const resolved = resolveFile(filePath);
  if (!resolved) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  const content = readFileSync(resolved, 'utf8');
  const filename = basename(resolved, extname(resolved));
  const slug = slugify(filename);
  const title = `Transcript: ${filename.replace(/[-_]/g, ' ')}`;
  const relPath = resolved.replace(VAULT_ROOT + '\\', '').replace(VAULT_ROOT + '/', '');

  console.log(`\n🎙️  KB Transcribe: ${filename}`);

  const speakers = extractSpeakers(content, speakersArg);
  const decisions = extractDecisions(content);
  const actions = extractActionItems(content);
  const quotes = extractQuotes(content, speakers);
  const questions = extractQuestions(content);

  console.log(`   Speakers:  ${speakers.length > 0 ? speakers.join(', ') : 'none detected'}`);
  console.log(`   Decisions: ${decisions.length}`);
  console.log(`   Actions:   ${actions.length}`);
  console.log(`   Quotes:    ${quotes.length}`);
  console.log(`   Questions: ${questions.length}`);

  const summaryPage = buildSummaryPage({ title, slug, speakers, decisions, actions, quotes, questions, sourcePath: relPath });

  const destDir = join(KB_ROOT, 'wiki', destOverride?.replace(/^wiki\//, '') ?? 'summaries');
  const outPath = join(destDir, `${slug}.md`);

  console.log(`   Output:    ${outPath}`);

  if (dryRun) {
    console.log('\n[dry-run] Would write wiki summary and extraction note. No files written.');
    return;
  }

  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
  writeFileSync(outPath, summaryPage, 'utf8');

  // Also save raw extraction to transcripts/
  if (!existsSync(TRANSCRIPTS_OUT)) mkdirSync(TRANSCRIPTS_OUT, { recursive: true });
  const extractionNote = `# Extraction: ${title}\n\nDate: ${today()}\nSource: ${relPath}\n\n## Speakers\n${speakers.join(', ') || 'none'}\n\n## Decisions\n${decisions.join('\n') || 'none'}\n\n## Actions\n${actions.join('\n') || 'none'}\n\n## Questions\n${questions.join('\n') || 'none'}\n`;
  writeFileSync(join(TRANSCRIPTS_OUT, `${slug}-extracted.md`), extractionNote, 'utf8');

  console.log('\n✅ Transcript extracted.');
  console.log(`   Wiki summary: ${outPath}`);
  console.log(`   Review and refine the extracted content before marking as active.`);
}
