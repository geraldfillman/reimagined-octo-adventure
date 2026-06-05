---
title: Post-P6 Implementation Plan (Non-Neo4j)
type: implementation-plan
status: active
created: 2026-06-04
updated: 2026-06-04
tags: [roadmap, p6, kb, oy, source-gate]
---

# Post-P6 Implementation Plan (Non-Neo4j)

Scope: finish the post-consolidation work while deliberately excluding P7 Neo4j recall.

## Current Verified State

- Six cadence/validate scheduled tasks run from `C:\Users\CaveUser\harness\run-scheduled.ps1`.
- `World Packet Writer 0900/1200/1700` tasks run from `C:\Users\CaveUser\harness\run-world-packet.ps1`.
- Legacy `Inbox Ingest 0900/1200/1700` tasks still point at `My_Data\scripts\invoke-inbox-ingest.ps1`, but the wrapper is retired/no-op when the harness world-packet wrapper exists.
- Legacy `Weekly Deep Refresh` still points at `My_Data\scripts\invoke-scheduled-cadence.ps1`, but routine-mode runs are retired/no-op from that wrapper.
- Attempted task disablement failed with Windows Task Scheduler `Access is denied`; rollback XML was exported to `C:\Users\CaveUser\harness\task-rollback-post-p6-20260604-200150`.
- `My_Data\scripts` still exists and cannot be removed until those legacy tasks are disabled/deleted or cut over by an elevated/admin Task Scheduler action.
- Harness KB commands exist and route through `getKBRoot()`.
- `Oy` has been scaffolded under `C:\Users\CaveUser\Documents\Obsidian Vault\Oy`.
- `kb-audit.mjs` has been repaired to compare harness cache raw files against the canonical KB root when `KB_VAULT_ROOT` is set.
- Real Oy audit result on activation: 6,209 raw cached files, 0 canonical Oy files, 1,088 internal raw duplicates. This is expected for an empty reviewed KB vault; do not bulk-copy.
- `knowledge-gap-tasks --dry-run` now reports `cycle=0` after the EIA manual storage/inventory snapshot was added.
- Commodity Delivery And Storage is active/watch and sources `_cache/pulls/Energy/2026-06-05_EIA_Petroleum_Inventories_Storage_Manual.md`.
- P3b source metadata is warning-only: first-batch `source_ids` exist, and missing declarations are summarized by `system validate`.

## Phase A — P6 Cleanup And Legacy Task Retirement

Goal: remove the last live dependency on `My_Data\scripts` before deleting the locked remnant.

Steps:

1. Export current scheduled task definitions for rollback.
2. Decide task fate:
   - Retire old `Inbox Ingest 0900/1200/1700` if `World Packet Writer` fully replaces them.
   - Retire or recreate `Weekly Deep Refresh` through the harness wrapper.
3. Dry-run any replacement harness wrapper.
4. Disable or update the legacy scheduled tasks.
5. Restart/close processes that may hold `My_Data\scripts`.
6. Verify no scheduled task, harness config, or active doc still points to `My_Data\scripts`.
7. Move the remnant to the existing World_Machine archive or delete it only after explicit approval.

Gate:

- `Get-ScheduledTask` shows no live action/working directory under `My_Data\scripts`.
- `& "$env:USERPROFILE\harness\harness.ps1" system validate` passes.

## Phase B — KB/Oy Activation

Status: scaffolded and audit-routed on 2026-06-04; selective promotion remains.

Goal: make `Oy` the reviewed durable KB vault without recreating the old raw mirror inside `My_Data`.

Design:

- Create `C:\Users\CaveUser\Documents\Obsidian Vault\Oy`.
- Durable reviewed KB pages live in `Oy\12_Knowledge_Bases`.
- Raw bodies and temporary jobs remain in harness cache unless manually promoted.
- `KB_VAULT_ROOT` points to `C:\Users\CaveUser\Documents\Obsidian Vault\Oy` for promotion/audit runs.
- Position research remains separate under `My_Data\40_Decisions\Research_Inbox`; KB promotion is optional and downstream of human review.

Implementation steps:

1. Scaffold the Oy vault folders and a minimal `AGENTS.md`. **Done.**
2. Patch `kb-audit.mjs` to use the current harness cache root for raw files and `KB_VAULT_ROOT`/`getKBVaultRoot()` for canonical Oy checks. **Done.**
3. Add a focused KB root/audit test proving:
   - default KB root is `harness\_cache\kb-vault\12_Knowledge_Bases`;
   - `KB_VAULT_ROOT` routes canonical output to `Oy\12_Knowledge_Bases`;
   - audit does not write raw bodies into `My_Data\12_Knowledge_Bases`.
   **Done: `engine\tests\kb-oy-routing.test.mjs`.**
4. Add a small promotion runbook:
   - ingest/capture raw evidence;
   - normalize/classify/compile into Oy only after review;
   - run `kb health` and `system kb-audit`.
   **Done: `Oy\90_Reference\KB_PROMOTION_RUNBOOK.md`.**
5. Update `SYSTEM.md`, `AGENTS.md`, and `ROADMAP.md` with the Oy role after the gate passes. **Done.**

Gate:

- `node --test C:\Users\CaveUser\harness\engine\tests\<kb-oy-test>.mjs`
- `$env:KB_VAULT_ROOT="C:\Users\CaveUser\Documents\Obsidian Vault\Oy"; & "$env:USERPROFILE\harness\harness.ps1" system kb-audit`
- `& "$env:USERPROFILE\harness\harness.ps1" system validate`

Approval required:

- Writing any compiled KB page into Oy.
- Bulk promotion is not approved; keep Oy selective and review-gated.

## Phase C — Market-Cycle Coverage Polish

Goal: reduce false gaps in the market-cycle monitor without adding strategy logic.

Status: complete on 2026-06-04; all cycle coverage gaps closed.

Current gaps:

- Commodity Delivery And Storage: closed by the operator-provided EIA inventory/storage image encoded as a manual cache snapshot.
- Macro Stress Regime: cleared by expanding the monitor scan window across the seeded cache.
- Rates, Funding, And Collateral: cleared by expanding the monitor scan window across the seeded cache.

Steps:

1. Inspect `market-cycle-monitor.config.json` and the latest market-cycle report.
2. Map each missing layer to existing signals in `mechanism-map.json` and existing pullers.
3. Prefer route fixes before new data pulls:
   - link existing FRED/Treasury/yfinance-vol/FMP artifacts;
   - mark truly manual fields as manual coverage, not broken coverage.
4. Add or update tests around cycle coverage classification.
5. Re-run `market-cycle-monitor` and `knowledge-gap-tasks --dry-run`.

Gate:

- `knowledge-gap-tasks --dry-run` reports `cycle=0`.
- Daily cadence dry-run remains green.
- `system validate` passes.

## Phase D — P3b Source Metadata Gate

Goal: enforce source provenance only after pullers can declare sources consistently.

Status: warning-only foundation live on 2026-06-04.

Rollout:

1. Define a small declaration shape, for example:
   `source_ids: ["domain__provider__data_type"]` in `puller-catalog.json`.
2. Add declarations to a small first batch of pullers:
   - `fmp`
   - `fred`
   - `treasury`
   - `yfinance-vol`
   - `market-cycle-monitor`
   - `signal-intelligence`
   **Done.**
3. Add warning-only validation:
   - declared source IDs must resolve to `30_Sources`;
   - unknown manual sources are allowed only with `manual: true`;
   - missing declarations warn, not fail.
   **Done.**
4. Expand declarations across pullers.
5. Promote to blocking only when coverage is high and false positives are low.

Gate:

- Source declaration test passes.
- `system validate` reports warnings first, not hard failures.
- No `--allow-stale` or stale override behavior changes.

## Recommended Order

1. Phase A: P6 cleanup and legacy task retirement.
2. Phase B: KB/Oy activation.
3. Phase C: market-cycle coverage polish.
4. Phase D: P3b source metadata gate.
