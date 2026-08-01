---
title: "Bond Market Stress Regime"
source: "FRED API"
date_pulled: "2026-07-31"
domain: "macro"
data_type: "bond_regime"
bond_regime: "calm"
stress_score: 5
signal_status: "clear"
tags: ["bond", "rates", "credit", "macro", "regime"]
related_pulls: []
---

## Bond regime: calm (5/100)

| Series | Name | Date | Latest | Group |
| --- | --- | --- | --- | --- |
| T10Y2Y | 10Y-2Y Spread | 2026-07-31 | 0.47 | curve |
| T10Y3M | 10Y-3M Spread | 2026-07-31 | 0.92 | curve |
| BAMLH0A0HYM2 | High Yield OAS | 2026-07-30 | 2.84 | credit |
| BAMLC0A4CBBB | BBB Corporate Spread | 2026-07-30 | 0.99 | credit |
| BAA10Y | Baa vs 10Y Treasury Spread | 2026-07-30 | 1.64 | credit |
| DFII10 | 10Y Real Yield (TIPS) | 2026-07-30 | 2.41 | real_rates |

## Score Components

- **+5** 10Y real yield at 2.41% — firm

## Reading the regime

- **calm** — normal funding; no action from this layer.
- **tightening** — spreads widening or curve inverted: review levered watchlist names, builders, REITs.
- **stress** — funding hostile: refinancing risk is live for high-debt small caps; expect equity de-rating in rate-sensitive theses.
- Consumed via frontmatter (`data_type: bond_regime`, `bond_regime`, `stress_score`).
