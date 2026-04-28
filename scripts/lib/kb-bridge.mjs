/**
 * kb-bridge.mjs — Copy pull outputs into KB raw subfolders.
 *
 * Pullers call writeRaw() immediately after their normal writeNote() call.
 * The copy lands in 12_Knowledge_Bases/raw/{kind}/ so the KB pipeline can
 * process it manually via: kb normalize → kb classify → kb compile.
 * kb-compile deletes the raw copy after the wiki page is written.
 */

import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import { getKBRoot } from './config.mjs';

const KB_RAW = join(getKBRoot(), 'raw');

/**
 * Domain strings used in pull note frontmatter → raw subfolder.
 * Pullers can pass a domain string and get the right kind automatically.
 */
export const DOMAIN_TO_KIND = Object.freeze({
  macro:      'datasets',
  market:     'datasets',
  sectors:    'datasets',
  housing:    'datasets',
  energy:     'datasets',
  government: 'articles',
  news:       'articles',
  osint:      'articles',
  social:     'articles',
  science:    'papers',
});

/**
 * Copy an already-written pull note into the appropriate KB raw subfolder.
 *
 * @param {string} sourcePath - Absolute path of the pull note (already written to 05_Data_Pulls/)
 * @param {string} kind       - 'datasets' | 'articles' | 'papers' | 'transcripts' | 'repos'
 *                              Or pass a domain string like 'macro' and it maps automatically.
 * @returns {string} Absolute path of the raw copy
 */
export function writeRaw(sourcePath, kind = 'datasets') {
  const resolvedKind = DOMAIN_TO_KIND[kind] ?? kind;
  const destDir = join(KB_RAW, resolvedKind);
  mkdirSync(destDir, { recursive: true });

  const filename = basename(sourcePath);
  const destPath = join(destDir, filename);
  const content = readFileSync(sourcePath, 'utf8');
  writeFileSync(destPath, content, 'utf8');

  console.log(`  📥 KB raw copy → 12_Knowledge_Bases/raw/${resolvedKind}/${filename}`);
  return destPath;
}
