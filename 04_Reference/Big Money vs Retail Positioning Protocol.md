---
title: "Big Money vs Retail Positioning Protocol"
status: "Active"
tags: ["positioning", "agent-protocol", "big-money-vs-retail"]
---

# Big Money vs Retail Positioning Protocol

This protocol defines the vault-native implementation of the Big Money vs Retail Positioning Agent.

## Operating Rule

Positioning is a research layer. It may promote a symbol or theme into review, but it never creates an automatic trade instruction.

## Evidence Layers

| Layer | Examples | Current Status |
|---|---|---|
| Institutional | 13F, ETF holders, insiders, sector proxy | Partial |
| Retail | Reddit/social/news proxies, sentiment | Partial |
| Macro / futures | COT, macro volatility, commodity/rate proxies | Partial |
| Options | Options chain and unusual activity | Partial |
| Price | FMP technicals, AVWAP, post-earnings drift | Partial |
| Vault strategy | Thesis or strategy basket match | Active |

## Scoring

Scores range from `-10` to `+10`.

- Positive scores mean institutional accumulation, retail neglect, or macro/price confirmation may be diverging constructively.
- Negative scores mean crowding, retail euphoria, or deteriorating institutional/price evidence may be raising risk.
- Fewer than three confirmation layers forces `Watchlist only`.

## Firm Archetypes

Firm markers are descriptive, not deterministic:

- Market makers and systematic liquidity firms are treated as lower directional-confidence signals.
- Passive/index managers may indicate flows or benchmark exposure, not discretionary conviction.
- Activist or concentrated managers are stronger signals only when the evidence is fresh and issuer-specific.

## Outputs

- Positioning report note
- Positioning watchlist note
- Sidecar JSON for Streamline Report and dashboard surfaces

## Known Gaps

- Dedicated FMP institutional ownership extraction is not wired yet.
- Retail order flow is proxied, not observed directly.
- AVWAP is not yet computed from last earnings inside this puller.
