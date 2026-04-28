---
title: Government Agent
type: agent-moc
agent_owner: Government Agent
agent_scope: dashboard
tags: [agents, government, moc]
last_updated: 2026-04-28
---

# Government Agent

Purpose: Own government contracts, regulation, FEMA, SEC thesis pulls, USPTO, SAM, USASpending, and legal/regulatory evidence.

## Operating Surfaces

- [[16_Agents/Government Agent/Pulls]]
- [[16_Agents/Government Agent/Sources]]
- [[16_Agents/Government Agent/Signals]]

## Commands

```powershell
node run.mjs pull openfema --recent
node run.mjs pull usaspending --recent
node run.mjs pull sam --all
node run.mjs pull sec --thesis
node run.mjs pull uspto --filings
node run.mjs pull federalregister --faa-uas
```

## Review Cadence

- Daily: review SEC, FEMA, and regulatory alerts.
- Weekly: review procurement and patent evidence.
