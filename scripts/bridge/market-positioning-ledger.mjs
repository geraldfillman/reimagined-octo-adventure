/**
 * market-positioning-ledger.mjs - Maintain the living World_Machine positioning ledger.
 *
 * Output:
 *   <WORLD_MACHINE_ROOT>/_Inbox/Market Positioning Ledger.md
 *   <WORLD_MACHINE_ROOT>/500-archive/Stale/{Positioning,Content,Research}/_index.md
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { getEngineRoot, getWorldMachineRoot } from '../lib/config.mjs';

const DEFAULT_BUCKETS = [
  {
    name: 'Positioning',
    purpose: 'Expired market-structure calls, stale flow notes, and positioning reads that no longer govern the active stance.',
    examples: 'Gamma levels, dealer-flow maps, COT-only reads, tactical entry tables, and positioning snapshots.',
  },
  {
    name: 'Content',
    purpose: 'Narrative or publishing candidates that were useful for context but no longer belong in active review.',
    examples: 'Draft themes, social/media prompts, outdated newsletter clips, and unused content candidates.',
  },
  {
    name: 'Research',
    purpose: 'Research leads, source notes, and hypotheses that aged out before becoming a durable thesis or active watch item.',
    examples: 'Academic links, source-watch clippings, incomplete deep dives, and unsupported early hypotheses.',
  },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function boolFlag(flags, camel, kebab) {
  return Boolean(flags?.[camel] ?? flags?.[kebab]);
}

function normalizeFlags(flags = {}) {
  return {
    dryRun: boolFlag(flags, 'dryRun', 'dry-run'),
    date: String(flags.date || todayIso()).slice(0, 10),
    print: boolFlag(flags, 'print', 'print'),
  };
}

function toDisplayPath(reviewRoot, absPath) {
  return relative(reviewRoot, absPath).split(sep).join('/');
}

function writeOrPreview(summary, filePath, content) {
  summary.files.push(filePath);
  if (summary.dryRun) return;
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf-8');
}

function ensureDir(summary, dirPath) {
  summary.directories.push(dirPath);
  if (summary.dryRun) return;
  mkdirSync(dirPath, { recursive: true });
}

function buildLedger({ date }) {
  return `---
type: market-positioning-ledger
cadence: continuous
created: ${date}
last_reviewed: ${date}
source_vault: My_Data
generated_by: bridge market-positioning-ledger
signal_status: watch
tags:
  - inbox
  - positioning
  - signal-ledger
  - market-structure
---

# Market Positioning Ledger

Purpose: keep one living view of market stance, evidence quality, trigger status, and outcome review so monthly reports become playback checkpoints rather than disconnected snapshots.

## Current Stance

| Area | Stance | Confidence | Trigger | Invalidation | Next Review |
|---|---|---:|---|---|---|
| Broad equity tape | Stand aside / prepare | Medium | Fresh breadth expansion plus confirmed liquidity support | Failed breakout, worsening credit/vol, or crowded one-way call | Weekly |
| AI power/grid theme | Press selectively | Medium | Orders, capex, utility/grid constraint evidence, and price confirmation | Theme turns into ticker-only chase without infrastructure evidence | Weekly |
| Software rally fade | Prepare | Low-medium | Exhaustion near mapped resistance plus weak breadth/flow confirmation | Breadth improves and earnings revisions confirm the move | Weekly |
| Macro liquidity friction | Observe | Medium | RRP/liquidity stress transmits into credit, funding, or vol | Liquidity friction stays contained with no market transmission | Weekly |
| Relative-value pairs | Archive / rebuild | Low | New independent signal stack and cleaner execution rules | Single-source price-only alerts continue | Monthly |

## Stance Vocabulary

| Stance | Meaning | Action Bias |
|---|---|---|
| Observe | Evidence is notable but not tradable yet. | Track and source-confirm. |
| Prepare | Thesis is plausible and needs trigger/invalidation mapped. | Build setup table and watch list. |
| Press | Evidence, timing, and trigger are aligned. | Keep active in review and outcome tracking. |
| Fade | Setup is explicitly against a stretched move. | Require clear level, stop, and catalyst. |
| Stand aside | Signal stack is noisy or contradictory. | Preserve evidence but avoid forcing a view. |
| Archive | Signal is stale, unresolved, or no longer decision-useful. | Move to stale archive with a short reason. |

## Signal Gate

| Gate | Name | Required Evidence |
|---:|---|---|
| 0 | Raw hit | One source or generated alert. |
| 1 | Eligible | At least one independent confirming source or a clear local-data reason to keep watching. |
| 2 | Stance candidate | Direction, trigger, invalidation, and time window are explicit. |
| 3 | Triggered | Price/action/catalyst condition fired in real time. |
| 4 | Outcome reviewed | Played out, missed, noisy, or stale classification has been logged. |

## Active Ledger

| Signal / Theme | Stance | Gate | Evidence Stack | Trigger / Watch | Invalidation | Outcome Status |
|---|---|---:|---|---|---|---|
| AI power/grid bottleneck | Press selectively | 3 | Event-research scenarios, AI infrastructure notes, May signal playback | Infrastructure-linked order/capex confirmation | Ticker-only momentum with no utility/grid evidence | Played out directionally, ticker timing mixed |
| Software rally fade | Prepare | 2 | Archived market-structure clip, late-May software movers, breadth check | Exhaustion at mapped resistance with weak participation | Breadth/revisions broaden and sustain | Needs live trigger tracking |
| Macro liquidity friction | Observe | 2 | FRED liquidity/RRP pulls, month-end summary, market-cycle monitor | Funding/credit/vol transmission | Contained liquidity friction with benign credit | Useful regime warning, not a direct trade |
| Momentum breadth | Prepare | 2 | FMP market performance, sector scans, signal intelligence | Repeat breadth thrust with sector confirmation | Narrow leadership or reversal on weak volume | Played out late-month but ranking was weak |
| Hard assets/metals | Observe | 1 | Signal intelligence, inflation/commodity notes | Confirmation from rates, dollar, and commodity breadth | Dollar/rates setup breaks against the trade | Needs cleaner confirmation |
| Relative Value Pairs | Archive / rebuild | 1 | Repeated alerting, thin independent confirmation | New pair framework with explicit spread, stop, and catalyst | Single-source price-only alerts | Noisy; archive old set |
| Broad thesis basket alerts | Stand aside | 1 | Thesis full-picture and strategy scans | Alert becomes thesis-specific with independent data | Broad basket alert remains generic | Too loud; needs compression |

## Evidence Stack

Use this stack before upgrading a signal above Gate 1:

| Evidence Type | Preferred Source |
|---|---|
| Price and breadth | FMP market performance, sector scans, signal intelligence |
| Options / positioning | Positioning checklist, CFTC/COT where available, manual options reads |
| Macro/liquidity | FRED, Treasury, market-cycle monitor |
| Narrative and catalyst | SourceWatch, inbox ingestion, event-research scenarios |
| Company confirmation | FMP thesis watchlists, SEC/filing digest, company-risk scans |

## Stale Archive Routing

When a signal ages out, move or summarize it into:

| Bucket | Route | Use When |
|---|---|---|
| Positioning | [[500-archive/Stale/Positioning/_index|Stale Positioning]] | A market setup, flow read, gamma level, or positioning call is no longer active. |
| Content | [[500-archive/Stale/Content/_index|Stale Content]] | The item was mainly narrative, publishing, or candidate-content material. |
| Research | [[500-archive/Stale/Research/_index|Stale Research]] | The item was a research lead, source note, or hypothesis that did not graduate. |

Archive entries should include the original path, stale reason, last useful signal, and whether anything should be rebuilt.

## Review Loop

| Cadence | Work |
|---|---|
| Daily / EOD | Add newly triggered or invalidated positioning signals. |
| Weekly | Re-score active stances, compress duplicate alerts, and archive stale items. |
| Monthly | Compare ledger outcomes against the monthly playback report. |
| Ad hoc | Promote a high-conviction ledger row into a separate thesis, strategy note, or trade setup table. |

## Outcome Labels

| Label | Meaning |
|---|---|
| Played out | Direction, timing, and evidence chain were broadly right. |
| Directionally right / poorly timed | Theme was right but execution timing or vehicle selection missed. |
| Noisy | Alert fired often without a clean decision edge. |
| Missed | Important move happened without a prior ledger row or adequate trigger. |
| Stale | Evidence aged out before becoming decision-useful. |
| Rebuild | Theme still matters but the current signal design is not good enough. |

## Build Notes

- Keep this as the canonical positioning ledger surface in World_Machine/_Inbox.
- Use monthly reports as playback snapshots that link back here.
- Keep stale positioning, content, and research outside active review once they no longer drive a stance.
- Do not upgrade a signal above Gate 1 unless the trigger and invalidation are explicit.
`;
}

function buildStaleIndex({ date }) {
  return `---
type: stale-archive-index
created: ${date}
generated_by: bridge market-positioning-ledger
tags:
  - archive
  - stale
---

# Stale Archive

This area holds stale positioning, content, and research items that should not clutter active review but remain useful as provenance.

| Bucket | Link | Purpose |
|---|---|---|
| Positioning | [[500-archive/Stale/Positioning/_index|Stale Positioning]] | Expired market structure, flow, setup, and positioning reads. |
| Content | [[500-archive/Stale/Content/_index|Stale Content]] | Narrative or publishing candidates that aged out. |
| Research | [[500-archive/Stale/Research/_index|Stale Research]] | Research leads and hypotheses that did not graduate. |

Each archived item should keep a short reason: stale, superseded, missed, noisy, duplicate, or rebuilt.
`;
}

function buildBucketIndex(bucket, { date }) {
  return `---
type: stale-archive-bucket
bucket: ${bucket.name}
created: ${date}
generated_by: bridge market-positioning-ledger
tags:
  - archive
  - stale
  - ${bucket.name.toLowerCase()}
---

# Stale ${bucket.name}

Purpose: ${bucket.purpose}

Examples: ${bucket.examples}

## Intake Log

| Date Archived | Original Path | Stale Reason | Last Useful Signal | Rebuild? |
|---|---|---|---|---|
`;
}

export async function run(flags = {}) {
  const options = normalizeFlags(flags);
  const reviewRoot = getWorldMachineRoot();
  const engineRoot = getEngineRoot();

  const summary = {
    dryRun: options.dryRun,
    date: options.date,
    engineRoot,
    reviewRoot,
    files: [],
    directories: [],
  };

  const ledgerPath = join(reviewRoot, '_Inbox', 'Market Positioning Ledger.md');
  const staleRoot = join(reviewRoot, '500-archive', 'Stale');

  ensureDir(summary, join(reviewRoot, '_Inbox'));
  ensureDir(summary, staleRoot);
  for (const bucket of DEFAULT_BUCKETS) {
    ensureDir(summary, join(staleRoot, bucket.name));
  }

  writeOrPreview(summary, ledgerPath, buildLedger({ date: options.date }));
  writeOrPreview(summary, join(staleRoot, '_index.md'), buildStaleIndex({ date: options.date }));
  for (const bucket of DEFAULT_BUCKETS) {
    writeOrPreview(
      summary,
      join(staleRoot, bucket.name, '_index.md'),
      buildBucketIndex(bucket, { date: options.date })
    );
  }
  const prefix = options.dryRun ? '[market-positioning-ledger] [dry-run]' : '[market-positioning-ledger]';
  console.log(`${prefix} review root: ${reviewRoot}`);
  console.log(`${prefix} files:`);
  for (const file of summary.files) {
    console.log(`  - ${toDisplayPath(reviewRoot, file)}`);
  }
  console.log(`${prefix} stale archive buckets:`);
  for (const dir of summary.directories.filter(dir => dir.includes(`${sep}500-archive${sep}Stale`))) {
    console.log(`  - ${toDisplayPath(reviewRoot, dir)}`);
  }

  if (options.print) {
    console.log('\n--- ledger preview ---\n');
    console.log(buildLedger({ date: options.date }));
  }

  return summary;
}

if (process.argv[1]?.endsWith('market-positioning-ledger.mjs')) {
  const flags = {
    'dry-run': process.argv.includes('--dry-run'),
    print: process.argv.includes('--print'),
  };
  const dateIndex = process.argv.indexOf('--date');
  if (dateIndex >= 0 && process.argv[dateIndex + 1]) {
    flags.date = process.argv[dateIndex + 1];
  }
  run(flags).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
