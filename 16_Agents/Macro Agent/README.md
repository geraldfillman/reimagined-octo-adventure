---
title: Macro Agent
type: agent-moc
agent_owner: Macro Agent
agent_scope: dashboard
tags: [agents, macro, moc]
last_updated: 2026-04-28
---

# Macro Agent

Purpose: Own macro regime evidence, rates, inflation, liquidity, credit, treasury, and bridge indicators.

## Operating Surfaces

- [[16_Agents/Macro Agent/Pulls]]
- [[16_Agents/Macro Agent/Sources]]
- [[16_Agents/Macro Agent/Signals]]
- [[00_Dashboard/Macro Regime]]

## Commands

```powershell
node run.mjs pull fred --group rates
node run.mjs pull fred --group labor
node run.mjs pull fred --group inflation
node run.mjs pull treasury --yields
node run.mjs pull macro-bridges
```

## Review Cadence

- Daily: review rate, curve, credit, and VIX-adjacent market conditions.
- Weekly: compare macro pull notes against active thesis assumptions.
