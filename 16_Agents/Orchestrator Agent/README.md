---
title: Orchestrator Agent
type: agent-moc
agent_owner: Orchestrator Agent
agent_scope: dashboard
tags: [agents, orchestrator, synthesis, research, backtest, moc]
last_updated: 2026-04-28
---

# Orchestrator Agent

Purpose: Top-level synthesis layer. Runs after every system pull to review cross-agent signals, flag priority items, generate investment research, and control thesis backtesting. Does not own a data source — owns the interpretation layer across all 15 domain agents.

## Operating Surfaces

- [[16_Agents/Orchestrator Agent/Pulls]]
- [[16_Agents/Orchestrator Agent/Sources]]
- [[16_Agents/Orchestrator Agent/Signals]]
- [[00_Dashboard/Main Dashboard]]

## Post-Pull Sequence

Run this chain immediately after any full system pull:

```powershell
# Step 1 — Cross-source opportunity scan (fast, no LLM)
node run.mjs pull opportunity-viewpoints --window 14

# Step 2 — Thesis-wide agent analysis (deterministic)
node run.mjs pull agent-analyst --all-thesis --skip-llm

# Step 3 — Update thesis canvas visualization
node run.mjs thesis canvas
```

## Investment Research Commands

```powershell
# Deep research with LLM synthesis (requires API key)
node run.mjs pull agent-analyst --all-thesis

# Counterparty-confirmation for high-conviction 8-K events
node run.mjs pull disclosure-reality --all

# Single-thesis deep dive
node run.mjs pull agent-analyst --thesis "Defense AI Autonomous Warfare"
node run.mjs pull agent-analyst --thesis "GLP-1 Metabolic Disease Revolution"
node run.mjs pull agent-analyst --thesis "Housing Supply Correction"

# Cross-sector sector scan
node run.mjs scan sectors --dry-run
node run.mjs scan conviction-delta
```

## Backtesting Commands

```powershell
# Thesis quantitative simulation
node run.mjs quant sim --thesis "Housing Supply Correction" --summary-only
node run.mjs quant sim --thesis "Defense AI Autonomous Warfare" --summary-only

# Sports model calibration + backtest
node run.mjs pull sports-calibration
node run.mjs pull sports-backtest

# Filing-based dilution risk across watchlist
node run.mjs pull dilution-monitor
```

## Orchestration Tiers

| Tier | When | Commands |
|---|---|---|
| **Post-pull (daily)** | After every full system pull | `opportunity-viewpoints` → `agent-analyst --skip-llm` → `thesis-canvas` |
| **Deep research (weekly)** | Sunday / pre-market Monday | `agent-analyst --all-thesis` + `disclosure-reality --all` |
| **Backtesting (weekly)** | Friday close | `quant sim` for each active thesis + `sports-calibration` |
| **Conviction review (monthly)** | Month-end | `scan conviction-delta` + `month-end-archive` |

## Review Cadence

- Daily: check Priority Queue in Pulls; act on critical/alert items.
- Weekly: run deep research sequence; review backtest drift.
- Monthly: conviction-delta scan; promote/demote thesis ratings.
