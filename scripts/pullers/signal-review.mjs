/**
 * signal-review.mjs — Signal lifecycle manager
 *
 * Reviews open signals in 06_Signals/ and pull notes in 05_Data_Pulls/,
 * auto-expiring stale `new` signals and supporting manual review.
 *
 * Usage:
 *   node run.mjs pull signal-review --dry-run
 *   node run.mjs pull signal-review --expire-older-than 30
 *   node run.mjs pull signal-review --interactive
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { VALID_SIGNAL_STATES } from '../lib/schema.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = resolve(__dirname, '..', '..');
const SIGNALS_DIR = join(VAULT_ROOT, '06_Signals');
const PULLS_DIR   = join(VAULT_ROOT, '05_Data_Pulls');

const DEFAULT_EXPIRE_DAYS = 30;

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

function replaceFrontmatterField(content, key, value) {
  const fmMatch = content.match(/^(---\n)([\s\S]*?)(\n---)/);
  if (!fmMatch) return content;
  const fmBody = fmMatch[2];
  const fieldRegex = new RegExp(`^(${key}:\\s*).*$`, 'm');
  let newBody;
  if (fieldRegex.test(fmBody)) {
    newBody = fmBody.replace(fieldRegex, `$1${value}`);
  } else {
    newBody = fmBody + `\n${key}: ${value}`;
  }
  return content.replace(fmMatch[0], `${fmMatch[1]}${newBody}${fmMatch[3]}`);
}

function setSignalState(filePath, newState, extra = {}) {
  const content = readFileSync(filePath, 'utf-8');
  let updated = replaceFrontmatterField(content, 'signal_state', newState);
  for (const [k, v] of Object.entries(extra)) {
    updated = replaceFrontmatterField(updated, k, v);
  }
  writeFileSync(filePath, updated, 'utf-8');
}

function listMdFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isFile() && d.name.endsWith('.md'))
    .map(d => join(dir, d.name));
}

function listMdFilesRecursive(dir) {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('_')) {
      results.push(...listMdFilesRecursive(full));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

export async function pull(flags = {}) {
  const dryRun       = !!(flags['dry-run'] || flags.dryRun);
  const expireDays   = parseInt(flags['expire-older-than'] ?? flags.expireOlderThan ?? DEFAULT_EXPIRE_DAYS, 10);
  const interactive  = !!(flags.interactive);
  const today        = new Date().toISOString().slice(0, 10);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - expireDays);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  console.log(`\n🔄 Signal Lifecycle Review`);
  console.log(`   Expire threshold : ${expireDays} days (before ${cutoffStr})`);
  console.log(`   Mode             : ${dryRun ? 'DRY RUN' : 'LIVE'}${interactive ? ' + interactive' : ''}\n`);

  const signalFiles  = listMdFiles(SIGNALS_DIR);
  const pullFiles    = listMdFilesRecursive(PULLS_DIR);

  let expiredCount   = 0;
  let alreadyManaged = 0;
  let reviewed       = 0;
  const openSignals  = [];

  // ── Process 06_Signals/ ──────────────────────────────────────────────────
  console.log(`📂 Scanning ${signalFiles.length} signal notes in 06_Signals/...\n`);

  for (const filePath of signalFiles) {
    let content, fm;
    try {
      content = readFileSync(filePath, 'utf-8');
      fm = parseFrontmatter(content);
    } catch { continue; }

    const state    = fm.signal_state ?? 'new';
    const date     = fm.date ?? fm.date_pulled ?? '';
    const severity = fm.severity ?? fm.signal_status ?? '';
    const title    = fm.title ?? filePath.split(/[\\/]/).pop();

    if (!VALID_SIGNAL_STATES.includes(state)) {
      console.log(`   ⚠️  Unknown signal_state "${state}" in: ${title}`);
    }

    if (state === 'resolved' || state === 'expired') {
      alreadyManaged++;
      continue;
    }

    // Auto-expire new signals older than threshold
    if (state === 'new' && date && date < cutoffStr) {
      reviewed++;
      if (dryRun) {
        console.log(`   [dry-run] Would expire: ${title} (${date}, ${severity})`);
      } else {
        setSignalState(filePath, 'expired', { resolved_date: today, resolution_note: `Auto-expired after ${expireDays} days` });
        console.log(`   ✓ Expired: ${title}`);
      }
      expiredCount++;
      continue;
    }

    openSignals.push({ filePath, fm, title, state, date, severity });
  }

  // ── Process 05_Data_Pulls/ alert/critical notes without signal_state ─────
  console.log(`\n📂 Scanning pull notes for missing signal_state...\n`);
  let patchedCount = 0;

  for (const filePath of pullFiles) {
    let fm;
    try {
      const content = readFileSync(filePath, 'utf-8');
      fm = parseFrontmatter(content);
    } catch { continue; }

    const status = fm.signal_status ?? '';
    const state  = fm.signal_state ?? '';

    if ((status === 'alert' || status === 'critical') && !state) {
      const title = fm.title ?? filePath.split(/[\\/]/).pop();
      if (dryRun) {
        console.log(`   [dry-run] Would patch signal_state=new: ${title}`);
      } else {
        setSignalState(filePath, 'new');
        console.log(`   ✓ Patched signal_state=new: ${title}`);
      }
      patchedCount++;
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log(`\n📊 Summary`);
  console.log(`   Signal notes scanned : ${signalFiles.length}`);
  console.log(`   Already managed      : ${alreadyManaged} (resolved/expired)`);
  console.log(`   Auto-expired         : ${expiredCount}${dryRun ? ' (dry-run)' : ''}`);
  console.log(`   Open signals         : ${openSignals.length}`);
  console.log(`   Pull notes patched   : ${patchedCount}${dryRun ? ' (dry-run)' : ''}`);

  if (openSignals.length > 0) {
    console.log(`\n📋 Open Signals (${openSignals.length}):`);
    for (const { title, state, date, severity } of openSignals) {
      const age = date ? Math.floor((Date.now() - new Date(date).getTime()) / 86400000) : '?';
      console.log(`   [${severity.padEnd(8)}] [${state.padEnd(9)}] ${age}d — ${title}`);
    }
  }

  return { expiredCount, patchedCount, openSignals: openSignals.length, dryRun };
}
