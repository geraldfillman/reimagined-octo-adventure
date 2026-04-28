---
title: Fundamentals Agent
type: agent-moc
agent_owner: Fundamentals Agent
agent_scope: dashboard
tags: [agents, fundamentals, moc]
last_updated: 2026-04-28
---

# Fundamentals Agent

Purpose: Own company fundamentals, filings, dilution, disclosure reality, due diligence, and private-market context.

## Operating Surfaces

- [[16_Agents/Fundamentals Agent/Pulls]]
- [[16_Agents/Fundamentals Agent/Sources]]
- [[16_Agents/Fundamentals Agent/Signals]]
- [[00_Dashboard/Company Risk Board]]

## Commands

```powershell
node run.mjs pull filing-digest
node run.mjs pull disclosure-reality
node run.mjs pull dilution-monitor
node run.mjs pull dd-report --ticker AAPL
node run.mjs pull smallcap-screen
```

## Review Cadence

- Daily: review filing and dilution alerts.
- Weekly: compare fundamentals against thesis scorecards.
