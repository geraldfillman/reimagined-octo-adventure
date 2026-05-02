---
title: Entropy Levels for Agent Orchestration
type: reference
tags: [reference, agents, entropy, market-microstructure, research]
last_updated: 2026-04-28
---

# Entropy Levels for Agent Orchestration

Source reviewed: `C:\Users\CaveUser\Downloads\10.48550_arxiv.2512.15720.pdf`

Paper: "Hidden Order in Trades Predicts the Size of Price Moves" by Mainak Singha, arXiv:2512.15720v1, December 2, 2025.

Operational checklist: [[04_Reference/Entropy Strategy Monitoring Cheat Sheet]]

## Core Takeaway

The paper argues that order-flow entropy can predict the magnitude of near-term price moves without predicting direction. Low entropy means transaction states are more structured than random. That structure may reveal informed trading activity, but entropy is invariant to buy/sell label swaps, so it cannot reveal whether the informed flow is bullish or bearish.

## Implementation Mapping

The agent framework uses two entropy layers:

| Layer | Field | Meaning |
|---|---|---|
| Orchestrator | `entropy_level` | Entropy across specialist agent verdict buckets: bullish, bearish, neutral |
| Microstructure | `microstructure_entropy_level` | 15-state sign x volume transition entropy from FMP 1-minute bars when available |

Levels:

| Level | Read |
|---|---|
| `compressed` | Low entropy. Treat as organized move-risk or unusually clustered agent evidence. |
| `ordered` | Below-average entropy. Clear lean exists, but it is not extreme. |
| `mixed` | Mid-range entropy. Requires thesis context. |
| `diffuse` | High entropy. Evidence is scattered; reconcile before conviction changes. |
| `unknown` | Not enough usable data. |

## Operator Rule

Low entropy is an attention signal, not a trade direction. Direction still comes from price, risk, fundamentals, macro, sentiment, and thesis evidence. When low entropy appears, review magnitude exposure, catalyst timing, and position sizing assumptions before interpreting it as confirmation.

## Current Limits

- The paper used second-resolution SPY trade data across 36 trading days.
- The vault implementation uses an FMP 1-minute OHLCV proxy unless licensed tick data is added later.
- The orchestrator entropy layer measures agent-stack concentration, not market order-flow.
- Both measures should be treated as research diagnostics until longer live validation exists across multiple instruments and regimes.
