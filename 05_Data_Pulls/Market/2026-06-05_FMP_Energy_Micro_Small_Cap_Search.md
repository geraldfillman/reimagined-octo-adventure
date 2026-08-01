---
title: "Energy Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-06-05"
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
| [[Energy]] | Energy | 58 | 0 | 0 | 3 | 2 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Energy]] | Small | [[LPG]] | 85 | 85 | margin 41%; 32% target upside | P/E 9.2x | commodity-price sensitivity |
| [[Energy]] | Small | [[NBR]] | 75 | 67 | Op margin 13%; near 52W highs | P/E 6.6x | commodity-price sensitivity |
| [[Energy]] | Micro | [[INR]] | 66 | 73 | margin 11%; Op margin 42% | P/E 4.9x | commodity-price sensitivity |
| [[Energy]] | Small | [[PUMP]] | 65 | 51 | 21% target upside; strong liquidity | P/S 1.5x | unprofitable; commodity-price sensitivity |
| [[Energy]] | Micro | [[AMPY]] | 60 | 60 | 48% target upside | P/E 15.4x | commodity-price sensitivity |
| [[Energy]] | Special | [[SOC]] | 55 | 30 | 77% target upside; strong liquidity | P/S 972.4x | unprofitable; P/S 972.4x |
| [[Energy]] | Micro | [[NUAI]] | 54 | 28 | strong liquidity | P/S 199.0x | unprofitable; P/S 199.0x |

## Potential Overvalued Watchlist

- No selected candidates currently screen as stretched on forward/trailing earnings multiples.

## Energy Research Picks

- **Sector Lens**: oil/gas/energy-services fit with commodity-linked value and margin bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[LPG]] | 85 | 85 | margin 41%; 32% target upside | P/E 9.2x | commodity-price sensitivity |
| [[NBR]] | 75 | 67 | Op margin 13%; near 52W highs | P/E 6.6x | commodity-price sensitivity |
| [[PUMP]] | 65 | 51 | 21% target upside; strong liquidity | P/S 1.5x | unprofitable; commodity-price sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[INR]] | 66 | 73 | margin 11%; Op margin 42% | P/E 4.9x | commodity-price sensitivity |
| [[AMPY]] | 60 | 60 | 48% target upside | P/E 15.4x | commodity-price sensitivity |
| [[NUAI]] | 54 | 28 | strong liquidity | P/S 199.0x | unprofitable; P/S 199.0x |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SOC]] | 55 | 30 | 77% target upside; strong liquidity | P/S 972.4x | unprofitable; P/S 972.4x |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 85 (LPG)
- **Highest Quality Score**: LPG
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-06-05
