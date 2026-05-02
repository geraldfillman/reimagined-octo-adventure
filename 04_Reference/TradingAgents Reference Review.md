---
title: "TradingAgents Reference Review"
type: "reference"
status: "active"
created: "2026-05-02"
source_repo: "https://github.com/TauricResearch/TradingAgents"
source_commit: "7e9e7b83c7fcc18d941300b253c6ed24d985788d"
license: "Apache-2.0"
tags: ["agents", "reference", "tradingagents", "orchestrator"]
---

# TradingAgents Reference Review

## Purpose

This note records the boundary between the My_Data vault-native agent interaction layer and the upstream TradingAgents project.

TradingAgents is allowed as a forked reference and inspection target. It is not a runtime dependency for this vault.

## Source Snapshot

- Repository: https://github.com/TauricResearch/TradingAgents
- Reviewed ref: `main`
- Reviewed commit: `7e9e7b83c7fcc18d941300b253c6ed24d985788d`
- License: Apache-2.0
- Review date: 2026-05-02

Reviewed files:

- `README.md`
- `LICENSE`
- `tradingagents/graph/setup.py`
- `tradingagents/graph/trading_graph.py`
- `tradingagents/graph/conditional_logic.py`
- `tradingagents/graph/propagation.py`
- `tradingagents/agents/utils/agent_states.py`
- `tradingagents/agents/schemas.py`
- `tradingagents/agents/researchers/bull_researcher.py`
- `tradingagents/agents/researchers/bear_researcher.py`
- `tradingagents/agents/managers/research_manager.py`
- `tradingagents/agents/managers/portfolio_manager.py`
- `tradingagents/agents/risk_mgmt/aggressive_debator.py`
- `tradingagents/agents/risk_mgmt/conservative_debator.py`
- `tradingagents/agents/risk_mgmt/neutral_debator.py`
- `tradingagents/agents/trader/trader.py`

## Useful Ideas Adopted

The vault adopts the pattern, not the package:

- Analyst reports become existing specialist pull notes.
- Bull and bear debate becomes challenge and observation messages.
- Research Manager synthesis becomes Orchestrator reconciliation.
- Trader and risk review become strategy/risk review before Streamline Report inclusion.
- Portfolio Manager output becomes a final research decision note, never an automated broker action.

## Explicit Non-Dependencies

Do not add the following as required dependencies for My_Data:

- `langchain`
- `langgraph`
- `yfinance`
- TradingAgents Python package imports
- TradingAgents CLI subprocess calls
- TradingAgents virtual environment or Docker runtime

## Attribution Rule

If a future implementation copies nontrivial code from the fork, add a note here with:

- source file and commit
- copied function or snippet name
- reason it was copied instead of reimplemented
- tests covering the copied behavior

Current implementation status: no nontrivial upstream code copied.
