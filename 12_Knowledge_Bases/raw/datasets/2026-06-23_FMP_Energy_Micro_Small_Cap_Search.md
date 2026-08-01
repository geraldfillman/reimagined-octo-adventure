---
title: "Energy Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-06-23"
domain: "market"
data_type: "screen"
frequency: "on-demand"
signal_status: "clear"
signals: []
tags: ["equities", "screener", "micro-cap", "small-cap", "fmp"]
---

## Search Criteria

- **Universe**: US-listed equities inside the selected sector taxonomy
- **Market Cap Range**: $50.0M to $2.0B
- **Micro-Cap Cutoff**: Below $300.0M
- **Price Floor**: $1.00
- **Volume Floor**: 100.0K shares
- **Per-Sector Limit**: 7
- **Phase 1 Exclusions**: funds/ETFs, ADRs/ADS, LP-trust-unit structures, duplicate share classes
- **Phase 3 Quality Score**: FMP profile, ratios, key metrics, and price-target data plus SEC company-facts growth fallback
- **Phase 4 Output**: up to 3 small caps, up to 3 micro caps, plus 1 special situation per sector, then reserve names up to the per-sector limit
- **Phase 5 Columns**: why now, valuation snapshot, and key risk for each research pick
- **Phase 6 Sector Lens**: primary picks must pass a sector-fit gate and are re-ranked with sector-specific valuation and profitability rules
- **Phase 7 Overvalued Watchlist**: sector-aware forward/trailing P/E stretch screen across all market caps, while keeping the same price, country, and exclusion filters plus a $5.0M dollar-volume floor and sector-fit gate
- **Provider**: Financial Modeling Prep
- **Fundamentals Coverage**: 7 cached/live FMP or SEC company-facts profiles across selected names
- **Taxonomy Note**: [[Aerospace & Defense]] remains inside [[Industrials]] in FMP sector data.

## Sector Coverage

| Vault Sector | Source Sector | Raw | Funds/ETF | ADR/ADS | LP/Trust | Dupes | Fund | Eligible | Final |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Energy]] | Energy | 45 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Energy]] | Small | [[LPG]] | 79 | 78 | margin 41%; Op margin 44% | P/E 8.8x | commodity-price sensitivity |
| [[Energy]] | Micro | [[PTAL.L]] | 67 | 66 | margin 11%; Op margin 18% | P/E 11.2x | commodity-price sensitivity |
| [[Energy]] | Small | [[DNOW]] | 62 | 51 | 26% target upside; strong liquidity | P/S 0.5x | unprofitable; commodity-price sensitivity |
| [[Energy]] | Small | [[PUMP]] | 59 | 47 | passed the clean-universe and liquidity filters | P/S 1.5x | unprofitable; commodity-price sensitivity |
| [[Energy]] | Special | [[WTTR]] | 58 | 35 | near 52W highs | P/E 92.3x | P/E 92.3x; commodity-price sensitivity |
| [[Energy]] | Micro | [[REI]] | 51 | 51 | passed the clean-universe and liquidity filters | P/S 0.8x | unprofitable; commodity-price sensitivity |
| [[Energy]] | Micro | [[AREC]] | 51 | 67 | Op margin 10714834% | P/E 3.4x | unprofitable; commodity-price sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Energy]] | Small | $1.9B | [[WTTR]] | P/E 92.3x | 3.7x sector ceiling | 35 | P/E 92.3x vs ~25x sector ceiling; quality score 35 | P/E 92.3x; commodity-price sensitivity |
| [[Energy]] | Large | $92.1B | [[WMB]] | P/E 32.9x | 1.3x sector ceiling | 59 | P/E 32.9x vs ~25x sector ceiling | P/E 32.9x; commodity-price sensitivity |

## Energy Research Picks

- **Sector Lens**: oil/gas/energy-services fit with commodity-linked value and margin bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[LPG]] | 79 | 78 | margin 41%; Op margin 44% | P/E 8.8x | commodity-price sensitivity |
| [[DNOW]] | 62 | 51 | 26% target upside; strong liquidity | P/S 0.5x | unprofitable; commodity-price sensitivity |
| [[PUMP]] | 59 | 47 | passed the clean-universe and liquidity filters | P/S 1.5x | unprofitable; commodity-price sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PTAL.L]] | 67 | 66 | margin 11%; Op margin 18% | P/E 11.2x | commodity-price sensitivity |
| [[REI]] | 51 | 51 | passed the clean-universe and liquidity filters | P/S 0.8x | unprofitable; commodity-price sensitivity |
| [[AREC]] | 51 | 67 | Op margin 10714834% | P/E 3.4x | unprofitable; commodity-price sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[WTTR]] | 58 | 35 | near 52W highs | P/E 92.3x | P/E 92.3x; commodity-price sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 79 (LPG)
- **Highest Quality Score**: LPG
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-06-23
