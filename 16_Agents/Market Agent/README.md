---
title: Market Agent
type: agent-moc
agent_owner: Market Agent
agent_scope: dashboard
tags: [agents, market, moc]
last_updated: 2026-04-28
---

# Market Agent

Purpose: Own market tape, technical risk, quotes, options, earnings, social sentiment, prediction-market context, and agent-analysis notes.

## Operating Surfaces

- [[16_Agents/Market Agent/Pulls]]
- [[16_Agents/Market Agent/Sources]]
- [[16_Agents/Market Agent/Signals]]
- [[00_Dashboard/Technical Risk]]
- [[00_Dashboard/Earnings Calendar]]
- [[00_Dashboard/Catalyst Radar]]

## Commands

```powershell
node run.mjs pull fmp --quote SPY
node run.mjs pull fmp --technical SPY
node run.mjs pull fmp --earnings-calendar
node run.mjs pull fmp --thesis-watchlists
node run.mjs pull cboe --vix-term
node run.mjs pull agent-analyst --symbol SPY --skip-llm
```

## Review Cadence

- Daily: review non-clear market pull notes and technical risk.
- Weekly: compare market signals against thesis conviction and catalysts.
