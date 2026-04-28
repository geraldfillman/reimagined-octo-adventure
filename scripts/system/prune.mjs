/**
 * prune.mjs — Vault retention policy runner
 *
 * Archives clear-status pull notes older than N days to prevent unbounded
 * accumulation (Market domain alone generates ~2,400+ files).
 *
 * Usage:
 *   node run.mjs system prune --domain Market --older-than 30
 *   node run.mjs system prune --older-than 30 --status clear
 *   node run.mjs system prune --dry-run
 *   node run.mjs system prune --all-domains --older-than 60 --dry-run
 *
 * Safety rules:
 *   - Only archives notes with signal_status matching --status (default: clear)
 *   - Skips notes referenced by 06_Signals/ via source_pull frontmatter
 *   - Always moves to archive subfolder, never deletes
 *   - Respects --dry-run flag (prints candidates without moving)
 */

import { readdirSync, readFileSync, mkdirSync, existsSync, renameSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = resolve(__dirname, '..', '..');
const PULLS_DIR  = join(VAULT_ROOT, '05_Data_Pulls');
const SIGNALS_DIR = join(VAULT_ROOT, '06_Signals');

const DEFAULT_OLDER_THAN_DAYS = 30;
const DEFAULT_STATUSES = ['clear'];

/** Parse YAML frontmatter scalars from a markdown file. */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (key) fm[key] = val;
  }
  return fm;
}

/** Build set of source_pull values referenced from 06_Signals/. */
function buildReferencedSet() {
  const referenced = new Set();
  if (!existsSync(SIGNALS_DIR)) return referenced;
  for (const file of readdirSync(SIGNALS_DIR)) {
    if (!file.endsWith('.md')) continue;
    try {
      const content = readFileSync(join(SIGNALS_DIR, file), 'utf-8');
      const fm = parseFrontmatter(content);
      if (fm.source_pull) referenced.add(fm.source_pull.trim());
    } catch { /* skip unreadable files */ }
  }
  return referenced;
}

/** List all .md files in a domain folder recursively (one level deep). */
function listPullNotes(domainFolder) {
  if (!existsSync(domainFolder)) return [];
  return readdirSync(domainFolder)
    .filter(f => f.endsWith('.md'))
    .map(f => join(domainFolder, f));
}

/** Move file to archive subfolder, creating it if needed. */
function archiveFile(filePath, archiveBase, yearMonth) {
  const archiveDir = join(archiveBase, yearMonth);
  if (!existsSync(archiveDir)) mkdirSync(archiveDir, { recursive: true });
  const dest = join(archiveDir, filePath.split(/[\\/]/).pop());
  renameSync(filePath, dest);
  return dest;
}

export async function run(flags = {}) {
  const dryRun      = !!(flags['dry-run'] || flags.dryRun);
  const allDomains  = !!(flags['all-domains'] || flags.allDomains);
  const targetDomain = flags.domain ?? null;
  const olderThanDays = parseInt(flags['older-than'] ?? flags.olderThan ?? DEFAULT_OLDER_THAN_DAYS, 10);
  const keepStatuses  = flags.keep
    ? String(flags.keep).split(',').map(s => s.trim())
    : ['watch', 'alert', 'critical'];
  const pruneStatuses = flags.status
    ? String(flags.status).split(',').map(s => s.trim())
    : DEFAULT_STATUSES;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  const cutoffStr = cutoffDate.toISOString().slice(0, 10);

  console.log(`\n🗄️  Vault Retention Policy`);
  console.log(`   Prune statuses : ${pruneStatuses.join(', ')}`);
  console.log(`   Keep statuses  : ${keepStatuses.join(', ')}`);
  console.log(`   Older than     : ${olderThanDays} days (before ${cutoffStr})`);
  console.log(`   Mode           : ${dryRun ? 'DRY RUN' : 'LIVE'}\n`);

  // Determine domains to scan
  let domains = [];
  if (allDomains) {
    domains = readdirSync(PULLS_DIR).filter(d => {
      const full = join(PULLS_DIR, d);
      return !d.startsWith('_') && existsSync(full) && readdirSync(full).some(f => f.endsWith('.md'));
    });
  } else if (targetDomain) {
    domains = [targetDomain];
  } else {
    // Default: Market domain (the primary noise source)
    domains = ['Market'];
  }

  // Build set of signal-referenced notes
  const referenced = buildReferencedSet();
  console.log(`   Protected notes (referenced by signals): ${referenced.size}\n`);

  const archiveBase = join(PULLS_DIR, '_archive');

  let totalScanned = 0;
  let totalArchived = 0;
  let totalSkipped = 0;

  for (const domain of domains) {
    const domainFolder = join(PULLS_DIR, domain);
    const notes = listPullNotes(domainFolder);
    let domainArchived = 0;
    let domainSkipped = 0;

    for (const filePath of notes) {
      totalScanned++;
      let fm;
      try {
        const content = readFileSync(filePath, 'utf-8');
        fm = parseFrontmatter(content);
      } catch {
        continue;
      }

      const datePulled = fm.date_pulled ?? '';
      const signalStatus = fm.signal_status ?? '';
      const noteTitle = fm.title ?? filePath.split(/[\\/]/).pop();

      // Skip: not in prune-eligible statuses
      if (!pruneStatuses.includes(signalStatus)) { domainSkipped++; continue; }

      // Skip: not old enough
      if (datePulled >= cutoffStr) { domainSkipped++; continue; }

      // Skip: referenced by a signal note
      if (referenced.has(noteTitle) || referenced.has(fm.source ?? '')) {
        console.log(`   🔒 Protected: ${noteTitle} (referenced by signal)`);
        domainSkipped++;
        continue;
      }

      // Eligible for archival
      const yearMonth = datePulled.slice(0, 7) || 'unknown';
      if (dryRun) {
        console.log(`   [dry-run] Would archive: ${domain}/${filePath.split(/[\\/]/).pop()} → _archive/${yearMonth}/`);
      } else {
        const dest = archiveFile(filePath, archiveBase, yearMonth);
        console.log(`   ✓ Archived: ${domain}/${filePath.split(/[\\/]/).pop()} → ${dest.split(/[\\/]/).slice(-3).join('/')}`);
      }
      domainArchived++;
      totalArchived++;
    }

    if (notes.length > 0) {
      console.log(`\n   ${domain}: ${domainArchived} archived, ${domainSkipped} skipped (${notes.length} total)`);
    }
  }

  console.log(`\n📊 Summary`);
  console.log(`   Scanned  : ${totalScanned} notes`);
  console.log(`   Archived : ${totalArchived} notes${dryRun ? ' (dry-run — no changes made)' : ''}`);
  console.log(`   Skipped  : ${totalScanned - totalArchived} notes`);
  if (!dryRun && totalArchived > 0) {
    console.log(`   Archive  : ${archiveBase}`);
  }
}
