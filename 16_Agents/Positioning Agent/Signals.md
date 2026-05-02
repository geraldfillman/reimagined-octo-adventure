---
title: "Positioning Agent Signals"
agent_id: "positioning"
tags: ["agent", "positioning", "signals"]
---

# Signals

The scorer emits a `-10` to `+10` positioning score and a conservative action class.

| Score / Context | Classification |
|---|---|
| Fewer than 3 confirmations | Watchlist only |
| High positive divergence with enough confirmations | Needs confirmation |
| Negative or crowded divergence | Avoid / crowded or exit-risk warning |
| Mixed evidence | Watchlist only |

## Confirmation Layers

- Institutional ownership, insider, ETF, or sector proxy
- Retail sentiment or retail-flow proxy
- Macro / COT / futures context
- Options positioning or unusual activity
- Price and AVWAP / technical confirmation
- Existing vault strategy match

## Risk Rules

- 13F is delayed and incomplete.
- Market makers and systematic firms should not be overread as directional investors.
- Retail proxy data is not the same as real broker order flow.
- Positioning is context, not valuation or automatic execution.
