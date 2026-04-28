---
title: Energy Agent
type: agent-moc
agent_owner: Energy Agent
agent_scope: dashboard
tags: [agents, energy, moc]
last_updated: 2026-04-28
---

# Energy Agent

Purpose: Own energy demand, generation mix, regional grid load, climate-energy sources, and energy-linked supply chain evidence.

## Operating Surfaces

- [[16_Agents/Energy Agent/Pulls]]
- [[16_Agents/Energy Agent/Sources]]
- [[16_Agents/Energy Agent/Signals]]

## Commands

```powershell
node run.mjs pull eia --electricity-demand
node run.mjs pull eia --generation-mix
node run.mjs pull eia --regional-load
node run.mjs pull newsapi --topic energy
```

## Review Cadence

- Daily: review energy stress during grid, commodity, or weather events.
- Weekly: compare power and commodity data against infrastructure theses.
