---
title: "Energy Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-04"
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
| [[Energy]] | Energy | 63 | 0 | 0 | 3 | 2 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Energy]] | Small | [[WBI]] | 67 | 56 | Op margin 15% | P/S 2.1x | unprofitable; commodity-price sensitivity |
| [[Energy]] | Small | [[FLOC]] | 66 | 64 | Op margin 20% | P/E 14.3x | commodity-price sensitivity |
| [[Energy]] | Micro | [[AMPY]] | 65 | 68 | margin 17%; near 52W highs | P/E 5.5x | commodity-price sensitivity |
| [[Energy]] | Small | [[SOC]] | 65 | 49 | 82% target upside; strong liquidity | P/B 2.8x | commodity-price sensitivity |
| [[Energy]] | Special | [[AESI]] | 65 | 47 | strong liquidity | P/S 1.4x | unprofitable; commodity-price sensitivity |
| [[Energy]] | Micro | [[INR]] | 64 | 59 | passed the clean-universe and liquidity filters | P/E 11.0x | commodity-price sensitivity |
| [[Energy]] | Micro | [[BATL]] | 60 | 56 | strong liquidity | P/E 5.8x | commodity-price sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Energy]] | Mid | $8.1B | [[CHRD]] | P/E 181.5x | 7.3x sector ceiling | 34 | P/E 181.5x vs ~25x sector ceiling; quality score 34 | P/E 181.5x; commodity-price sensitivity |
| [[Energy]] | Small | $1.9B | [[XPRO]] | P/E 36.6x | 1.5x sector ceiling | 37 | P/E 36.6x vs ~25x sector ceiling; quality score 37 | P/E 36.6x; commodity-price sensitivity |
| [[Energy]] | Large | $88.0B | [[WMB]] | P/E 33.6x | 1.3x sector ceiling | 58 | P/E 33.6x vs ~25x sector ceiling | P/E 33.6x; commodity-price sensitivity |

## Energy Research Picks

- **Sector Lens**: oil/gas/energy-services fit with commodity-linked value and margin bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[WBI]] | 67 | 56 | Op margin 15% | P/S 2.1x | unprofitable; commodity-price sensitivity |
| [[FLOC]] | 66 | 64 | Op margin 20% | P/E 14.3x | commodity-price sensitivity |
| [[SOC]] | 65 | 49 | 82% target upside; strong liquidity | P/B 2.8x | commodity-price sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AMPY]] | 65 | 68 | margin 17%; near 52W highs | P/E 5.5x | commodity-price sensitivity |
| [[INR]] | 64 | 59 | passed the clean-universe and liquidity filters | P/E 11.0x | commodity-price sensitivity |
| [[BATL]] | 60 | 56 | strong liquidity | P/E 5.8x | commodity-price sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AESI]] | 65 | 47 | strong liquidity | P/S 1.4x | unprofitable; commodity-price sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 67 (WBI)
- **Highest Quality Score**: AMPY
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-04
