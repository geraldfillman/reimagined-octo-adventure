---
title: Next Session Prompt
type: handoff
status: active
created: 2026-06-04
updated: 2026-06-04
tags: [handoff, codex, harness]
---

# Next Session Prompt

Copy/paste this into the next Codex session.

```text
We are continuing the Harness / My_Data post-P6 consolidation. Before doing anything, verify live state; do not trust this prompt over the docs or filesystem.

Read first, in order:
1. C:\Users\CaveUser\Documents\Obsidian Vault\My_Data\90_Reference\SYSTEM.md
2. C:\Users\CaveUser\Documents\Obsidian Vault\My_Data\90_Reference\ROADMAP.md
3. C:\Users\CaveUser\Documents\Obsidian Vault\My_Data\90_Reference\POST_P6_NON_NEO4J_PLAN.md
4. C:\Users\CaveUser\Documents\Obsidian Vault\My_Data\AGENTS.md
5. C:\Users\CaveUser\Documents\Obsidian Vault\Oy\AGENTS.md

Live architecture:
- Harness repo/code/config/memory/tests: C:\Users\CaveUser\harness
- Active vault: C:\Users\CaveUser\Documents\Obsidian Vault\My_Data
- World_Machine: archive/history only
- Oy: reviewed durable KB vault; raw KB bodies stay in harness cache unless selectively promoted
- Run commands with:
  & "$env:USERPROFILE\harness\harness.ps1" <args>

Current verified status:
- Six cadence/validate scheduled tasks run from C:\Users\CaveUser\harness\run-scheduled.ps1.
- World Packet Writer tasks run from C:\Users\CaveUser\harness\run-world-packet.ps1.
- Legacy Inbox Ingest 0900/1200/1700 and Weekly Deep Refresh tasks still point at My_Data\scripts, but those wrappers are retired/no-op.
- Disabling those four legacy tasks failed with Windows Task Scheduler "Access is denied"; rollback XML is saved at C:\Users\CaveUser\harness\task-rollback-post-p6-20260604-200150.
- Do not remove My_Data\scripts until those legacy tasks are disabled/deleted or cut over by an elevated/admin Task Scheduler action.
- Oy exists at C:\Users\CaveUser\Documents\Obsidian Vault\Oy.
- KB/Oy audit routing is repaired; with KB_VAULT_ROOT set, canonical KB checks target Oy while raw files remain in C:\Users\CaveUser\harness\_cache\kb-vault.
- Market-cycle coverage is fully closed: knowledge-gap-tasks reports cycle=0.
- The Commodity Delivery And Storage layer is active/watch using _cache/pulls/Energy/2026-06-05_EIA_Petroleum_Inventories_Storage_Manual.md.
- P3b source declarations are warning-only. Do not make them blocking yet.

Hard rules:
- Never pass --allow-stale / --stale-ok unless I explicitly approve.
- Do not touch calibration forward-loop or the 2026-08-01 validation unless explicitly asked.
- Keep agent-scoring.test.mjs green.
- Do not bulk-copy raw KB cache into Oy.
- Do not recreate legacy durable roots like My_Data\05_Data_Pulls, My_Data\06_Signals, or My_Data\12_Knowledge_Bases.
- Use dry-run first for risky writes. Prefer disable/archive over delete. Ask before destructive cleanup.

Recommended next work:
1. Finish P6 cleanup if admin Task Scheduler access is available:
   - Export current task state again.
   - Disable/delete legacy no-op tasks:
     My_Data - Inbox Ingest 0900
     My_Data - Inbox Ingest 1200
     My_Data - Inbox Ingest 1700
     My_Data - Weekly Deep Refresh
   - Verify no scheduled task action or working directory points at My_Data\scripts.
   - Only then remove/archive the My_Data\scripts remnant after confirming no lock.
2. If admin task cleanup is not available, continue with KB/Oy selective promotion:
   - Set $env:KB_VAULT_ROOT = "C:\Users\CaveUser\Documents\Obsidian Vault\Oy"
   - Promote only reviewed evergreen knowledge, not raw bodies.
   - Run kb health and system kb-audit afterward.
3. Expand P3b source_ids gradually, warning-only.
4. Optionally start P7 Neo4j recall only if explicitly requested; use read-only MCP/tool verification first.

Verification commands:
& "$env:USERPROFILE\harness\harness.ps1" pull knowledge-gap-tasks --dry-run
& "$env:USERPROFILE\harness\harness.ps1" cadence run daily --dry-run
node --test C:\Users\CaveUser\harness\engine\tests\agent-scoring.test.mjs
node --test C:\Users\CaveUser\harness\engine\tests\kb-oy-routing.test.mjs
node --test C:\Users\CaveUser\harness\engine\tests\source-declarations.test.mjs
& "$env:USERPROFILE\harness\harness.ps1" system validate

Expected current validation warnings:
- Puller not registry-addressable: pullers/sourcewatch.mjs
- P3b warning-only missing source declarations for remaining catalog entries

Start by reporting the verified current state and what you recommend next, then wait for my go before any irreversible cleanup.
```

