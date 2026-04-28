---
title: Sectors Agent
type: agent-moc
agent_owner: Sectors Agent
agent_scope: dashboard
tags: [agents, sectors, moc]
last_updated: 2026-04-28
---

# Sectors Agent

Purpose: Own sector scans, sector routing, sector evidence aggregation, and cross-domain sector convergence.

## Operating Surfaces

- [[16_Agents/Sectors Agent/Pulls]]
- [[16_Agents/Sectors Agent/Sources]]
- [[16_Agents/Sectors Agent/Signals]]
- [[00_Dashboard/Cross-Domain Thesis Board]]

## Commands

```powershell
node run.mjs scan sectors
node run.mjs scan sectors --sector industrials --dry-run
node run.mjs scan conviction
node run.mjs pull fmp --sector-baskets
```

## Review Cadence

- Daily: review sector confirmations and contradictions.
- Weekly: compare sector momentum with capital allocation.
