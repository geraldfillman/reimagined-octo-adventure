---
title: "Pull System Cleanup Roadmap"
type: "reference"
status: "active"
created: "2026-05-01"
tags: ["pull-system", "orchestrator", "roadmap", "dashboard"]
---

# Pull System Cleanup Roadmap

## Current Cleanup Contract

The pull system now has one grouped cadence entry point:

```powershell
node run.mjs routine daily
node run.mjs routine weekly
node run.mjs routine monthly
node run.mjs routine quarterly
node run.mjs routine yearly
```

`scripts/daily-routine.ps1` is a wrapper around `routine daily`, with `-IncludeWeekly` forwarding to `routine weekly`.

Month-end reporting is non-destructive. `system month-end` delegates to `pull month-end-archive`, which copies monthly pull notes into KB raw archive storage and leaves active pull notes in place for dashboards and validation.

## Cadence Ownership

| Cadence | Primary Purpose | Command |
|---|---|---|
| Daily | Macro, market, thesis tape, sector/company-risk scans, agent thesis pass, cleanup, validate | `node run.mjs routine daily` |
| Weekly | Extended government, clinical, research, news, FMP deep scan, risk scores, agent strategy pass | `node run.mjs routine weekly` |
| Monthly | Conviction rollup, catalyst review, full-picture reports, graph session, month-end archive | `node run.mjs routine monthly` |
| Quarterly | Quant refresh/backtests, disclosure reality, dilution review, 90-day viewpoints, thesis graph | `node run.mjs routine quarterly` |
| Yearly | Annual opportunity review, thesis/entity graph sessions, KB health, validation | `node run.mjs routine yearly` |

## Orchestrator Integration Plan

Goal: every specialist agent reports to the Orchestrator Agent through a shared job contract instead of ad hoc notes.

1. Add an agent manifest at `16_Agents/agent-manifest.json`.
2. Give each agent a stable `agent_id`, `domains`, `inputs`, `outputs`, `cadence`, and `orchestrator_channel`.
3. Add a job state ledger under `05_Data_Pulls/Orchestrator/` with one note per workflow run.
4. Require pullers and agent scripts to emit a normalized status object:

```json
{
  "job_id": "routine-daily-2026-05-01",
  "agent_id": "marketmind-agent",
  "cadence": "daily",
  "status": "running|blocked|complete|failed",
  "started_at": "2026-05-01T09:00:00-04:00",
  "finished_at": null,
  "outputs": [],
  "signals": [],
  "handoff_to": ["orchestrator-agent"]
}
```

5. Let the orchestrator synthesize the final daily/weekly/monthly review note from those job ledgers.

## Animated Agent Dashboard Roadmap

The local dashboard already streams spawned command output through SSE. The next step is to turn that into a workflow surface:

1. Add `/api/workflows` to list routine cadences and their task DAG.
2. Add `/api/workflows/:id/run` to start a full routine with a generated `job_id`.
3. Add `/api/workflows/:id/stream` to emit normalized step events, not just terminal text.
4. Add an animated dashboard panel with nodes for Orchestrator, Research, MarketMind, VC, Quant, KB, and Risk.
5. Color nodes by status: queued, running, blocked, complete, failed.
6. Link completed nodes to their generated vault notes.

## Roadmap

### Resolved Now

- Exclude `_archive` pull-note folders from active validation.
- Make `system month-end` non-destructive by delegating to `pull month-end-archive`.
- Prevent monthly archive recursion into prior archives.
- Replace unsupported agent flags in the scheduled routine path.
- Add canonical daily, weekly, monthly, quarterly, and yearly routine commands.
- Update dashboard quick actions to grouped command shapes.

### Near Term

- Add machine-readable routine manifests so the dashboard can render task lists without duplicating CLI definitions.
- Add `--json` support to more pullers so orchestrator summaries can use structured results.
- Create the agent manifest and map every agent to cadence, owner, outputs, and handoff path.
- Add a `routine status` command showing last success, last failure, stale tasks, and generated note counts.
- Add dry-run validation for every dashboard button.

### Mid Term

- Add workflow run ledgers under `05_Data_Pulls/Orchestrator/`.
- Teach the dashboard to display live step progress for full routines.
- Add retry policy metadata per task: retryable, max attempts, backoff, manual-only.
- Add a routine scheduler note or config file for calendar ownership.
- Add orchestrator-generated daily and weekly summary notes.

### Advanced Goals

- Animated agent workflow graph with live SSE state transitions.
- Cross-agent dependency graph: data source -> puller -> signal -> thesis -> agent summary.
- Agent confidence and disagreement tracking.
- Orchestrator escalation rules for blocked API keys, stale data, missing notes, and critical signals.
- Natural-language control surface for starting routines, pausing agents, and asking for run summaries.
