---
title: "Energy Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-20"
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
| [[Energy]] | Energy | 46 | 0 | 0 | 4 | 1 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Energy]] | Small | [[LPG]] | 78 | 71 | margin 30%; Op margin 35% | P/E 12.8x | commodity-price sensitivity |
| [[Energy]] | Micro | [[INR]] | 69 | 78 | margin 31%; Op margin 47% | P/E 0.0x | commodity-price sensitivity |
| [[Energy]] | Micro | [[AMPY]] | 64 | 68 | margin 17% | P/E 4.9x | commodity-price sensitivity |
| [[Energy]] | Small | [[AESI]] | 63 | 41 | near 52W highs; strong liquidity | P/S 1.5x | unprofitable; target below spot |
| [[Energy]] | Small | [[SOC]] | 61 | 43 | strong liquidity | P/B 2.4x | commodity-price sensitivity |
| [[Energy]] | Micro | [[BATL]] | 56 | 56 | passed the clean-universe and liquidity filters | P/E 4.2x | commodity-price sensitivity |
| [[Energy]] | Special | [[REI]] | 56 | 54 | passed the clean-universe and liquidity filters | P/S 0.9x | unprofitable; commodity-price sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Energy]] | Small | $1.9B | [[XPRO]] | P/E 35.7x | 1.4x sector ceiling | 32 | P/E 35.7x vs ~25x sector ceiling; quality score 32 | target below spot; P/E 35.7x |
| [[Energy]] | Large | $87.0B | [[WMB]] | P/E 33.2x | 1.3x sector ceiling | 59 | P/E 33.2x vs ~25x sector ceiling | P/E 33.2x; commodity-price sensitivity |

## Energy Research Picks

- **Sector Lens**: oil/gas/energy-services fit with commodity-linked value and margin bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[LPG]] | 78 | 71 | margin 30%; Op margin 35% | P/E 12.8x | commodity-price sensitivity |
| [[AESI]] | 63 | 41 | near 52W highs; strong liquidity | P/S 1.5x | unprofitable; target below spot |
| [[SOC]] | 61 | 43 | strong liquidity | P/B 2.4x | commodity-price sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[INR]] | 69 | 78 | margin 31%; Op margin 47% | P/E 0.0x | commodity-price sensitivity |
| [[AMPY]] | 64 | 68 | margin 17% | P/E 4.9x | commodity-price sensitivity |
| [[BATL]] | 56 | 56 | passed the clean-universe and liquidity filters | P/E 4.2x | commodity-price sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[REI]] | 56 | 54 | passed the clean-universe and liquidity filters | P/S 0.9x | unprofitable; commodity-price sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 78 (LPG)
- **Highest Quality Score**: INR
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-20
