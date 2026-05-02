---
title: Playbooks
type: moc
tags: [playbooks, workflows, infranodus]
last_updated: 2026-03-27
---
# Playbooks

## Dashboard-First Workflow

Before the morning Obsidian review, run the local operator dashboard:

```powershell
cd scripts
node run.mjs dashboard
# Open http://localhost:3737
```

The dashboard provides a unified pre-Obsidian view: Signal Board (all severity levels), Thesis Status (conviction and last review), Pull Health (per-puller staleness), and Data Collection (one-click pull triggers with live output). It reads vault files directly — no sync step needed.

Set `DASHBOARD_PORT` env var to use a port other than `3737`.

---

Summary:
- Playbooks capture repeatable workflows and graph-measurement entry points.
- Generated graph sessions are evidence artifacts, not default reading material.

Open first when:
- You need a repeatable workflow, a housing-cycle runbook, or InfraNodus measurement context.

Key notes:
- [[07_Playbooks/Housing_Cycle]]
- [[04_Reference/InfraNodus Measurements]]
- [[04_Reference/InfraNodus Graph Measurements]]

Decisions:
- Treat `07_Playbooks/Graph_Sessions/` as generated output.
- Open only the specific recent graph session required by the task.
