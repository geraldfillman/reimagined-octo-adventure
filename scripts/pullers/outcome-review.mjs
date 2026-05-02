/**
 * outcome-review.mjs — Follow-up queue for Streamline Report items at 5/20/60 days.
 *
 * Reads Streamline Report sidecars and surfaces items that were in the review
 * queue N days ago, prompting for outcome disposition. This feeds Phase 5
 * signal quality scoring.
 *
 * Usage:
 *   node run.mjs pull outcome-review
 *   node run.mjs pull outcome-review --days 5,20,60
 *   node run.mjs pull outcome-review --dry-run
 */

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getPullsDir } from '../lib/config.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';

const SIDECAR_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.cache', 'orchestrator', 'streamline-reports');

export async function pull(flags = {}) {
  const checkDays = String(flags.days || '5,20,60')
    .split(',')
    .map(Number)
    .filter(n => n > 0 && Number.isFinite(n));

  console.log(`Outcome Review: checking follow-up queue for days: ${checkDays.join(', ')}...`);

  const allItems = [];
  for (const days of checkDays) {
    const targetDate = daysAgo(days);
    const sidecar = await loadSidecar(targetDate);
    if (!sidecar) {
      console.log(`  No sidecar for ${targetDate} (${days}d ago) — run streamline-report on that date to populate.`);
      continue;
    }
    for (const item of sidecar.review_items ?? []) {
      allItems.push({ ...item, follow_up_day: days, source_date: targetDate });
    }
  }

  const note = buildOutcomeNote({ items: allItems, checkDays });
  const filePath = join(getPullsDir(), 'Orchestrator', dateStampedFilename('Outcome_Review'));

  if (flags['dry-run']) {
    console.log(note);
  } else {
    writeNote(filePath, note);
    console.log(`Wrote: ${filePath}`);
  }

  return { filePath: flags['dry-run'] ? null : filePath, itemCount: allItems.length };
}

function buildOutcomeNote({ items, checkDays }) {
  const byDay = new Map(checkDays.map(d => [d, []]));
  for (const item of items) {
    if (byDay.has(item.follow_up_day)) byDay.get(item.follow_up_day).push(item);
  }

  const totalItems = items.length;
  const alertCount = items.filter(i => ['alert', 'critical'].includes(i.signal_status)).length;

  const sections = [
    {
      heading: 'Purpose',
      content: [
        `Surfaces ${totalItems} review queue item(s) from ${checkDays.join('/')} days ago.`,
        'For each item, record disposition: **Reviewed**, **Journaled**, **Ignored**, or **Pending**.',
        'Completed rows feed the Phase 5 signal quality scorecard and false-positive tracking.',
      ].join(' '),
    },
  ];

  for (const [days, dayItems] of byDay) {
    const rows = dayItems.map(item => [
      item.title,
      item.domain ?? 'N/A',
      item.signal_status ?? 'watch',
      item.edge_type ?? 'review required',
      item.disposition ?? 'Journal',
      item.source_date,
      '[ ] Reviewed  [ ] Journaled  [ ] Ignored  [ ] Pending',
      item.note_path ?? '—',
    ]);
    sections.push({
      heading: `${days}-Day Follow-Up`,
      content: rows.length
        ? buildTable(['Item', 'Domain', 'Status', 'Edge', 'Suggested', 'Report Date', 'Outcome', 'Note'], rows)
        : `_No items found in the ${days}-day lookback window. The sidecar for that date may not exist yet._`,
    });
  }

  sections.push({
    heading: 'Journal Prompts',
    content: [
      '- Which 5-day items turned out to be false positives, and why?',
      '- Which 20-day items show price confirmation or invalidation of the original signal?',
      '- Which 60-day items can be closed with a documented lesson?',
      '- Are there recurring signals from the same module that consistently miss?',
    ].join('\n'),
  });

  return buildNote({
    frontmatter: {
      title: 'Outcome Review',
      source: 'Vault Orchestrator',
      date_pulled: today(),
      domain: 'orchestrator',
      data_type: 'outcome_review',
      follow_up_days: checkDays,
      item_count: totalItems,
      alert_item_count: alertCount,
      signal_status: alertCount > 0 ? 'watch' : 'clear',
      tags: ['outcome-review', 'orchestrator', 'signal-quality'],
    },
    sections,
  });
}

async function loadSidecar(date) {
  const filePath = join(SIDECAR_DIR, `${date}.json`);
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(await readFile(filePath, 'utf-8'));
  } catch { return null; }
}

function daysAgo(days) {
  const date = new Date(`${today()}T00:00:00`);
  date.setDate(date.getDate() - Number(days));
  return date.toISOString().slice(0, 10);
}
