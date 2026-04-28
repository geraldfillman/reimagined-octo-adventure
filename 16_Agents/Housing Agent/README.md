---
title: Housing Agent
type: agent-moc
agent_owner: Housing Agent
agent_scope: dashboard
tags: [agents, housing, moc]
last_updated: 2026-04-28
---

# Housing Agent

Purpose: Own housing starts, permits, mortgage rates, builder confidence, housing-cycle playbooks, and real-estate data sources.

## Operating Surfaces

- [[16_Agents/Housing Agent/Pulls]]
- [[16_Agents/Housing Agent/Sources]]
- [[16_Agents/Housing Agent/Signals]]
- [[04_Reference/Housing Intelligence]]

## Commands

```powershell
node run.mjs pull fred --group housing
node run.mjs pull nahb --builder-confidence
node run.mjs playbook housing-cycle
```

## Review Cadence

- Daily: review housing signals during data-release windows.
- Weekly: compare housing data with homebuilder and rate-sensitive theses.
