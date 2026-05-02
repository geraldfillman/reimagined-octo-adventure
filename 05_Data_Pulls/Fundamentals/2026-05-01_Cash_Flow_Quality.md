---
title: "Cash Flow Quality"
source: "Vault Orchestrator"
date_pulled: "2026-05-01"
domain: "fundamentals"
data_type: "cfq_analysis"
frequency: "weekly"
symbols_scanned: 30
high_quality_count: 27
low_quality_count: 1
signal_status: "clear"
signals: []
tags: ["cfq", "cash-flow-quality", "fundamentals", "fcf", "moat"]
---

## Operating Rule

> CFQ (Cash Flow Quality) measures earnings durability and capital efficiency.
> Score ≥ 3.5 = high quality; 2.0–3.4 = acceptable; < 2.0 = low quality.
> A deteriorating CFQ score is an early warning for dividend cuts or balance sheet stress.
> Review alongside price action — CFQ is a quality filter, not a timing signal.

## CFQ Scan

| Symbol | CFQ Score | Label | Rev Growth% | Gross Margin% | Trailing FCF | Net Cash | Signal |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ADBE | 4.8 | high | 10.5% | 88.6% | 19.5B | -324.0M | BULLISH |
| INTU | 4.8 | high | 15.6% | 80.8% | 12.5B | -4.6B | BULLISH |
| ADP | 4.7 | high | 7.1% | 50.8% | 9.7B | -748.9M | BULLISH |
| FICO | 4.6 | high | 15.9% | 82.2% | 1.6B | -3.4B | BULLISH |
| MA | 4.5 | high | 16.4% | 83.4% | 32.4B | -11.1B | BULLISH |
| CME | 4.5 | high | 6.4% | 86.1% | 8.2B | -1.0B | BULLISH |
| MSCI | 4.5 | high | 9.8% | 82.4% | 3.0B | -6.2B | BULLISH |
| V | 4.5 | high | 11.3% | 80.4% | 41.7B | -11.6B | BULLISH |
| PAYX | 4.4 | high | 5.6% | 72.3% | 3.8B | -3.2B | BULLISH |
| ACN | 4.4 | high | 7.4% | 31.9% | 22.2B | 1.1B | BULLISH |
| NOW | 4.3 | high | 20.9% | 77.5% | 8.3B | 271.0M | BULLISH |
| MCO | 4.3 | high | 8.9% | 68.2% | 5.5B | -5.8B | BULLISH |
| ICE | 4.3 | high | 7.5% | 61.9% | 8.2B | -19.5B | BULLISH |
| SPGI | 4.2 | high | 7.9% | 70.3% | 11.1B | -12.0B | BULLISH |
| AVGO | 4.2 | high | 23.9% | 67.8% | 49.6B | -51.9B | BULLISH |
| AAPL | 4.2 | high | 6.4% | 46.9% | 227.7B | 43.6B | BULLISH |
| FDS | 4.1 | high | 5.4% | 52.7% | 1.2B | -1.3B | BULLISH |
| MSFT | 3.9 | high | 14.9% | 68.8% | 142.3B | -24.9B | BULLISH |
| KO | 3.9 | high | 1.9% | 61.6% | 11.6B | -33.3B | BULLISH |
| NVDA | 3.9 | high | 65.5% | 71.1% | 157.5B | -807.0M | BULLISH |
| UNH | 3.8 | high | 11.8% | 18.5% | 44.5B | -49.9B | BULLISH |
| PG | 3.8 | high | 0.3% | 51.2% | 30.1B | -24.7B | BULLISH |
| NDAQ | 3.7 | high | 11.1% | 47.9% | 3.9B | -8.9B | BULLISH |
| COST | 3.7 | high | 8.2% | 12.8% | 16.0B | 9.1B | BULLISH |
| MCD | 3.7 | high | 3.7% | 57.4% | 13.9B | -54.0B | BULLISH |
| PEP | 3.7 | high | 2.3% | 54.1% | 16.1B | -42.3B | BULLISH |
| META | 3.6 | high | 22.2% | 82% | 100.6B | -63.3B | BULLISH |
| BRK.B | 2.5 | acceptable | — | — | 0 | — | NEUTRAL |
| AMZN | 2.2 | low | 12.4% | 50.3% | 18.3B | -108.1B | BULLISH |
| ORCL | 1.9 | low | 8.4% | 70.5% | -18.9B | -123.7B | NEUTRAL |

## Coverage by Category

**digital payment rails**: V, MA
**data indices ratings**: SPGI, MCO, MSCI, FDS, FICO
**software workflow**: MSFT, ADBE, INTU, ADP, PAYX, NOW, ORCL
**consumer habit**: AAPL, COST, MCD, KO, PEP, PG
**market infrastructure**: CME, ICE, NDAQ
**capital allocator**: BRK.B
**powerful but headline sensitive**: META, AMZN, NVDA, AVGO, UNH, ACN

## Metric Guide

- **CFQ Score**: 0–5 composite; weights FCF conversion, margins, and net cash position.
- **Label**: `high` (≥3.5), `acceptable` (2.0–3.4), `low` (<2.0).
- **Rev Growth%**: Revenue growth rate year-over-year (TTM).
- **Gross Margin%**: Gross profit as a percentage of revenue (TTM).
- **Trailing FCF**: Twelve-month trailing free cash flow (operating CF − capex).
- **Net Cash**: Cash and equivalents minus total debt. Positive = net cash position.
