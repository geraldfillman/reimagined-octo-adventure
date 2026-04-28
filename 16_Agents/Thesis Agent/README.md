---
title: Thesis Agent
type: agent-moc
agent_owner: Thesis Agent
agent_scope: dashboard
tags: [agents, thesis, moc]
last_updated: 2026-04-28
---

# Thesis Agent

Purpose: Own thesis synthesis, full-picture reports, catalysts, conviction deltas, opportunity viewpoints, and thesis-level rollups.

## Operating Surfaces

- [[16_Agents/Thesis Agent/Pulls]]
- [[16_Agents/Thesis Agent/Sources]]
- [[16_Agents/Thesis Agent/Signals]]
- [[00_Dashboard/Full Picture Reports]]
- [[00_Dashboard/Capital Allocation Board]]
- [[00_Dashboard/High Priority Thesis Monitor]]

## Commands

```powershell
node run.mjs thesis sync
node run.mjs thesis catalysts
node run.mjs thesis full-picture
node run.mjs scan conviction
node run.mjs pull opportunity-viewpoints
node run.mjs pull agent-analyst --thesis "Housing Supply Correction" --skip-llm
```

## Review Cadence

- Daily: review thesis alerts and catalyst timing.
- Weekly: refresh conviction delta and full-picture reports.
