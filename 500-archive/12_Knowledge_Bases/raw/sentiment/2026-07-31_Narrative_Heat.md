---
title: "Narrative Heat"
source: "GDELT DOC API + commodity-transmission scan"
date_pulled: "2026-07-31"
domain: "sentiment"
data_type: "narrative_heat"
heat:
  lumber: 0.86
  aluminum: 0.9
divergences:
  -
    key: "aluminum"
    verdict: "quiet_move"
signal_status: "watch"
tags: ["sentiment", "narrative", "commodities", "noise"]
related_pulls: []
---

## Is the crowd looking where the prices are moving?

| Subject | Heat (7d vs 7wk base) | Article Volume | Price Move | Verdict |
| --- | --- | --- | --- | --- |
| crude_oil | ERROR | GDELT HTTP 429 | — | — |
| natural_gas | ERROR | GDELT HTTP 429 | — | — |
| copper | ERROR | GDELT HTTP 429 | — | — |
| wheat | ERROR | GDELT HTTP 429 | — | — |
| corn | ERROR | GDELT HTTP 429 | — | — |
| soybeans | ERROR | GDELT HTTP 429 | — | — |
| fertilizer | ERROR | GDELT HTTP 429 | — | — |
| lumber | 0.86x | 1/day (base 2) | +6.2% | normal |
| aluminum | 0.9x | 33/day (base 37) | +23.7% | QUIET MOVE — price moved, crowd absent (under-owned) |

## Reading the verdicts

- **NOISE**: media volume ≥2x baseline while price sits still — narrative-driven; expect mean reversion of attention. Check reddit/snscrape pulls for the retail side.
- **QUIET MOVE**: price tripped a transmission threshold but coverage is flat — the market hasn't noticed; strongest research candidates.
- **CONFIRMED**: both moving — momentum real but crowding risk rising; check COT positioning.
- Heat = GDELT global article volume, last 7 days vs prior 7 weeks. Price moves join from the latest `commodity-transmission` scan.
