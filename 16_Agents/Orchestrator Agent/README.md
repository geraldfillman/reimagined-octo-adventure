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

## Entropy Overlay

Paper reviewed: `10.48550_arxiv.2512.15720.pdf` ("Hidden Order in Trades Predicts the Size of Price Moves").

Operator guide: [[04_Reference/Entropy Strategy Monitoring Cheat Sheet]]

Orchestrator implementation:
- `entropy_level` scores cross-agent signal concentration: `compressed`, `ordered`, `mixed`, `diffuse`.
- `microstructure_entropy_level` approximates the paper's 15-state sign x volume transition entropy from FMP 1-minute bars when available.
- Low entropy is a magnitude/attention flag, not a directional edge. A compressed bullish stack and a compressed bearish stack both mean "movement risk is organized"; direction still comes from the specialist evidence.
- High entropy means the specialist stack is dispersed and should be reconciled before conviction changes.
- `node run.mjs pull entropy-monitor` runs the dedicated SPY/QQQ shadow ledger for tracking future movement after low-entropy windows.
- `node run.mjs pull entropy-monitor --backtest` builds the historical baseline from the full 1-minute range FMP returns.

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

# Strategy basket testing
node run.mjs pull agent-analyst --strategy "Simons Style Quant Momentum Breadth" --limit 5 --skip-llm
node run.mjs pull agent-analyst --all-strategies --limit 12 --skip-llm
node run.mjs pull entropy-monitor
node run.mjs pull entropy-monitor --backtest

# Cross-sector sector scan
node run.mjs scan sectors --dry-run
node run.mjs scan conviction
```

## Review Commands

```powershell
# Filing-based dilution risk across watchlist
node run.mjs pull dilution-monitor

# Thesis conviction review
node run.mjs scan conviction --window 30
```

## Orchestration Tiers

| Tier | When | Commands |
|---|---|---|
| **Post-pull (daily)** | After every full system pull | `opportunity-viewpoints` → `agent-analyst --skip-llm` → `thesis-canvas` |
| **Deep research (weekly)** | Sunday / pre-market Monday | `agent-analyst --all-thesis` + `disclosure-reality --all` |
| **Review (weekly)** | Friday close | `scan conviction --window 30` + `confluence-scan` |
| **Conviction review (monthly)** | Month-end | `routine monthly` or `scan conviction` + `pull month-end-archive` |

## Review Cadence

- Daily: check Priority Queue in Pulls; act on critical/alert items.
- Weekly: run deep research sequence; review backtest drift.
- Monthly: conviction scan; promote/demote thesis ratings.
