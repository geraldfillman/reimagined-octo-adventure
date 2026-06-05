/**
 * approve-queue.mjs
 *
 * Promotes packets with review_status: approved → promoted.
 * Scans 06_Signals/ and 10_Theses/ for approved notes, rewrites frontmatter,
 * and optionally updates .cache/world-machine-manifest.json.
 *
 * Usage (via router):  node run.mjs bridge approve-queue [--dry-run]
 * Direct:              node scripts/bridge/approve-queue.mjs [--dry-run]
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';

import { getEngineRoot } from '../lib/config.mjs';

const SCAN_DIRS = ['06_Signals', '10_Theses'];
const MANIFEST_REL = '.cache/world-machine-manifest.json';
const TODAY = new Date().toISOString().slice(0, 10);

/** Collect all .md files recursively under a directory. */
function collectMdFiles(dir) {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMdFiles(full));
    } else if (entry.isFile() && extname(entry.name) === '.md') {
      results.push(full);
    }
  }
  return results;
}

/** Parse frontmatter block from raw file text. Returns { fields, fmStart, fmEnd }. */
function parseFrontmatter(text) {
  if (!text.startsWith('---')) return null;
  const secondDash = text.indexOf('\n---', 3);
  if (secondDash === -1) return null;
  const fmEnd = secondDash + 4; // include trailing ---
  const block = text.slice(3, secondDash).trim();
  const fields = {};
  for (const line of block.split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    if (key) fields[key] = value;
  }
  return { fields, fmEnd };
}

/** Rewrite frontmatter: apply changedFields (immutably — returns new string). */
function rewriteFrontmatter(text, changedFields) {
  if (!text.startsWith('---')) return text;
  const secondDash = text.indexOf('\n---', 3);
  if (secondDash === -1) return text;

  const blockLines = text.slice(3, secondDash).split('\n');
  const handledKeys = new Set();

  const updatedLines = blockLines.map(line => {
    const colon = line.indexOf(':');
    if (colon === -1) return line;
    const key = line.slice(0, colon).trim();
    if (key in changedFields) {
      handledKeys.add(key);
      return `${key}: ${changedFields[key]}`;
    }
    return line;
  });

  // Append any new keys not already present
  for (const [key, value] of Object.entries(changedFields)) {
    if (!handledKeys.has(key)) {
      updatedLines.push(`${key}: ${value}`);
    }
  }

  return `---\n${updatedLines.join('\n')}\n---${text.slice(secondDash + 4)}`;
}

/** Update manifest JSON: find packet by packet_id, set status to promoted. */
function updateManifest(manifestPath, packetId, dryRun) {
  if (!existsSync(manifestPath)) return false;
  const raw = readFileSync(manifestPath, 'utf-8');
  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch {
    return false;
  }

  const packets = Array.isArray(manifest.packets) ? manifest.packets : [];
  let updated = false;
  const newPackets = packets.map(p => {
    if (p?.packet_id === packetId) {
      updated = true;
      return { ...p, review_status: 'promoted', promoted_at: TODAY };
    }
    return p;
  });

  if (updated && !dryRun) {
    writeFileSync(manifestPath, JSON.stringify({ ...manifest, packets: newPackets }, null, 2), 'utf-8');
  }
  return updated;
}

/** Main run function. */
export async function run(flags = {}) {
  const dryRun = Boolean(flags.dryRun ?? flags['dry-run']);
  const engineRoot = flags.engineRoot || getEngineRoot();
  const manifestPath = join(engineRoot, MANIFEST_REL);

  const summary = { promoted: 0, skipped: 0, errors: [] };

  for (const dir of SCAN_DIRS) {
    const fullDir = join(engineRoot, dir);
    const files = collectMdFiles(fullDir);

    for (const filePath of files) {
      let text;
      try {
        text = readFileSync(filePath, 'utf-8');
      } catch (err) {
        summary.errors.push(`Read error ${filePath}: ${err.message}`);
        continue;
      }

      const parsed = parseFrontmatter(text);
      if (!parsed) { summary.skipped += 1; continue; }
      if (parsed.fields.review_status !== 'approved') { summary.skipped += 1; continue; }

      const packetId = parsed.fields.packet_id || '(no packet_id)';
      console.log(`[approve-queue] ${dryRun ? '[DRY RUN] ' : ''}Promoting: ${packetId}  →  ${filePath}`);

      if (!dryRun) {
        try {
          const newText = rewriteFrontmatter(text, {
            review_status: 'promoted',
            promoted_at: TODAY,
          });
          writeFileSync(filePath, newText, 'utf-8');
        } catch (err) {
          summary.errors.push(`Write error ${filePath}: ${err.message}`);
          continue;
        }

        const manifestUpdated = updateManifest(manifestPath, packetId, false);
        if (manifestUpdated) {
          console.log(`[approve-queue]   manifest updated for ${packetId}`);
        }
      }

      summary.promoted += 1;
    }
  }

  console.log(`[approve-queue] Done — promoted: ${summary.promoted}, skipped: ${summary.skipped}, errors: ${summary.errors.length}`);
  return summary;
}

// Allow direct invocation: node scripts/bridge/approve-queue.mjs [--dry-run]
if (process.argv[1]?.endsWith('approve-queue.mjs')) {
  const dryRun = process.argv.includes('--dry-run');
  run({ dryRun }).catch(err => { console.error(err); process.exit(1); });
}
