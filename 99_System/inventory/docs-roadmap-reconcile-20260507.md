---
type: audit_reconcile
title: Vault Audit Roadmap Reconcile 2026-05-07
date: 2026-05-07
scope:
  - My_Data
  - The Research Spine
tags:
  - system
  - audit
  - roadmap
  - research-spine
---

# Vault Audit Roadmap Reconcile - 2026-05-07

## Scope

This note picks up from the prior agent-client session and reconciles the earlier Phase A-D roadmap against the current workspace. Four parallel read-only agents audited:

- `My_Data` implementation state.
- `The Research Spine` vault state.
- Command and test verification.
- Cross-vault docs and roadmap consistency.

## What Was Fixed In This Pickup

- Added focused regression coverage: `scripts/tests/command-surface.test.mjs`.
- Routed the config-driven cadence runner as `node run.mjs cadence list|show|run`.
- Routed `node run.mjs system dashboard-manifest generate`.
- Added `--dry-run` support to `dashboard-manifest` so it can be verified without writing `00_Dashboard/.manifest.json`.
- Added true no-write behavior to `node run.mjs system audit-research-spine --dry-run --no-inbox`.
- Changed future audit-to-Inbox task links from wikilinks to code paths, preventing generated tasks from creating new broken `[[Tags]]` links.
- Cleaned the existing generated Inbox audit task block to remove self-created broken wikilinks.
- Reconciled docs:
  - Removed Obsidian highlight markup artifacts from `AGENTS.md`.
  - Updated signal cleanup docs to use `node run.mjs system cleanup --signals`.
  - Standardized Research Spine command examples on running from `My_Data/scripts/` with `node run.mjs ...`.
  - Updated `90_System/CLI Architecture.md` for routed learning and KB vaults and the remaining legacy flat CLI compatibility.
- Reclassified the abandoned web dashboard and test-only `housing-cycle` playbook as retired artifacts, not bugs to restore.

## Roadmap Status

| Item | Status | Notes |
|---|---|---|
| Phase A1: per-puller envelope + run summaries | Partial | `scripts/lib/run-envelope.mjs` exists and config-driven `cadence run` uses it, but grouped `pull` and active `routine` still bypass it. |
| Phase A2: verify Phase 4 Inbox collapse | Complete | Inbox seed task is checked and no live folder split remains. |
| Phase A3: remove orphan `02_Reports/Daily|Weekly|Monthly` | Complete | Current report tree only uses `Briefings/*` and `Monitoring/*`. |
| Phase A4: stale PowerShell docs | Mostly complete | Main docs are fixed; legacy `.ps1` helpers still exist in Research Spine `99_System/scripts/` and should be retired or explicitly classified. |
| Phase B1: coverage audit | Complete command, open cleanup | `node run.mjs system coverage-audit` exists; source metadata gaps remain. |
| Phase B2: audit findings to Inbox | Complete with fix | Now supports no-write dry runs and avoids broken wikilinks. |
| Phase B3: KB audit | Complete command, parity pending | `node run.mjs system kb-audit` exists; true cross-vault parity needs `KB_VAULT_ROOT` set. |
| Phase B4: signal retention docs | Complete | Cleanup invocation corrected. |
| Phase C1: cadence orchestrator | Partial | `cadence` group is now routed, but `routine` and `99_System/config/cadences.json` are competing cadence sources. |
| Phase C2: Spine report rollup | Complete | `research-spine-flow` writes Briefings and Monitoring snapshots. |
| Phase C3: dashboard manifest | Partial | Generator is routed and dry-runnable; validator behavior is still not implemented. |
| Phase D1: Signal Intelligence Spine board | Partial | Signal blocks appear in reports, but there is no dedicated Spine board. |
| Phase D2: content candidate tracker/backfill | Partial | Migration/backfill exists; promotion workflow and stale-candidate view need consolidation. |
| Phase D3: portfolio health aggregation | Mostly complete | Aggregation rules and tests exist; cadence config calls `portfolio-health` without `--file`, so it depends on `PORTFOLIO_POSITIONS_CSV`. |
| Phase D4: Market Feedback Loop gap handling | Complete | Mechanism map and market-cycle monitor tests cover the gap-report behavior. |

## Remaining Bugs And Fixes

1. Grouped `node run.mjs pull <name>` does not use the run-envelope summary path. Move envelope normalization into `routePull` or make the config-driven `cadence` runner the canonical multi-puller path.
2. Two cadence systems now coexist: `scripts/routines/cadence.mjs` and `99_System/config/cadences.json`. Pick one source of truth, then deprecate or wrap the other.
3. `signal-intelligence --json` and `positioning-report --json` can mix markdown with JSON. Make `--json` stdout JSON-only or remove the flag from help.
4. `coverage-audit-20260507.md` exposes many malformed or missing `linked_puller` fields. The audit exists, but metadata cleanup is still a separate workstream.
5. `kb-audit-20260507.md` ran with `KB_VAULT_ROOT` unset, so only internal duplicate detection was verified. Run again with the canonical `Oy` path configured.
6. Research Spine still contains executable PowerShell helpers under `99_System/scripts/`. That conflicts with the "My_Data is the executable source of truth" contract unless those helpers are explicitly archived or marked legacy.
7. `01_Freshness/Sources/Sources.md` appears to be the remaining source-frontmatter coverage miss in The Research Spine audit.

## Next Roadmap

### Phase 1 - Command Surface Stabilization

- Add router tests for `system coverage-audit`, `system kb-audit`, `system audit-research-spine`, `system dashboard-manifest`, and `cadence`.
- Add true `--dry-run` / no-write tests for system utilities that generate inventory reports.
- Keep retired/test commands out of advertised help: the web dashboard is abandoned, and `housing-cycle` was test-only.

### Phase 2 - Cadence And Envelope Consolidation

- Decide whether `routine` or `cadence` is canonical.
- If `cadence` wins, migrate routine definitions into `99_System/config/cadences.json` and make `routine <name>` delegate to `cadence run <name>`.
- If `routine` wins, remove `cadence-runner.mjs` and `cadences.json` to avoid two sources of truth.
- Make every multi-puller path write a run summary envelope in `The Research Spine/99_System/run_summaries/`.

### Phase 3 - Audit Outputs To Actionable Cleanup

- Clean source `linked_puller` frontmatter from the coverage audit.
- Re-run `kb-audit` with `KB_VAULT_ROOT` set to `Oy`.
- Resolve or classify Research Spine `99_System/scripts/`.
- Fix `01_Freshness/Sources/Sources.md` or archive it if it is only a placeholder.

### Phase 4 - Review Surfaces

- Add a dedicated Signal Intelligence board in The Research Spine if report sections are not enough.
- Add a stale content-candidate Dataview view grouped by `promotion_status`, `published_at`, and `generated_on`.
- Decide whether content-candidate promotion is manual-only or script-assisted, then document that decision in the Automation Guide.
- Add a dashboard-manifest validator that checks Dataview `FROM` clauses against expected pull outputs.

## Verification Snapshot

Fresh verification run during this pickup:

- `node --test scripts/tests/command-surface.test.mjs` passed.
- `node --check scripts/cmd/router.mjs`, `scripts/system/dashboard-manifest.mjs`, and `scripts/system/audit-research-spine.mjs` passed.
- `node run.mjs cadence list` passed.
- `node run.mjs cadence run premarket --dry-run` passed.
- `node run.mjs system dashboard-manifest generate --dry-run` passed and did not write the manifest.
- `node run.mjs system audit-research-spine --dry-run --no-inbox` passed, reported zero broken wikilinks, and skipped report/Inbox writes.

Previous verification from the parallel command auditor:

- `node run.mjs help`, group help, focused tests, and `node run.mjs system validate` passed.
- `system dashboard` is intentionally retired, and `playbook housing-cycle` is no longer treated as a production playbook.
