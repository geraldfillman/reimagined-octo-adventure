---
title: Sports Agent
type: agent-moc
agent_owner: Sports Agent
agent_scope: dashboard
tags: [agents, sports, moc]
last_updated: 2026-04-28
---

# Sports Agent

Purpose: Own sports slates, odds, predictions, settlements, calibration, and fake-money backtests.

## Operating Surfaces

- [[16_Agents/Sports Agent/Pulls]]
- [[16_Agents/Sports Agent/Sources]]
- [[16_Agents/Sports Agent/Signals]]
- [[00_Dashboard/Sports Prediction Board]]
- [[00_Dashboard/Sports Calibration]]

## Commands

```powershell
node run.mjs pull sports
node run.mjs pull sports-odds
node run.mjs pull sports-predictions
node run.mjs pull sports-horse-racing
node run.mjs pull sports-settle
node run.mjs pull sports-backtest
node run.mjs pull sports-calibration
```

## Review Cadence

- Daily during active slates: review pending ledgers and settlement notes.
- Weekly: review calibration and backtest drift.
