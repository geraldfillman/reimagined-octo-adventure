---
title: "Energy Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-28"
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
| [[Energy]] | Energy | 61 | 0 | 0 | 3 | 2 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Energy]] | Micro | [[INR]] | 68 | 78 | margin 31%; Op margin 47% | P/E 0.0x | commodity-price sensitivity |
| [[Energy]] | Small | [[NPKI]] | 66 | 52 | margin 13%; Op margin 17% | P/E 36.8x | P/E 36.8x; commodity-price sensitivity |
| [[Energy]] | Small | [[INVX]] | 65 | 54 | Op margin 10%; near 52W highs | P/E 23.2x | commodity-price sensitivity |
| [[Energy]] | Micro | [[AMPY]] | 64 | 68 | margin 17%; near 52W highs | P/E 5.5x | commodity-price sensitivity |
| [[Energy]] | Small | [[WKC]] | 63 | 46 | strong liquidity | P/S 0.0x | unprofitable; commodity-price sensitivity |
| [[Energy]] | Special | [[HLX]] | 62 | 33 | near 52W highs; strong liquidity | P/E 104.0x | P/E 104.0x; commodity-price sensitivity |
| [[Energy]] | Micro | [[BATL]] | 58 | 56 | passed the clean-universe and liquidity filters | P/E 5.1x | commodity-price sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Energy]] | Large | $88.3B | [[WMB]] | P/E 33.7x | 1.3x sector ceiling | 59 | P/E 33.7x vs ~25x sector ceiling | P/E 33.7x; commodity-price sensitivity |

## Energy Research Picks

- **Sector Lens**: oil/gas/energy-services fit with commodity-linked value and margin bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[NPKI]] | 66 | 52 | margin 13%; Op margin 17% | P/E 36.8x | P/E 36.8x; commodity-price sensitivity |
| [[INVX]] | 65 | 54 | Op margin 10%; near 52W highs | P/E 23.2x | commodity-price sensitivity |
| [[WKC]] | 63 | 46 | strong liquidity | P/S 0.0x | unprofitable; commodity-price sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[INR]] | 68 | 78 | margin 31%; Op margin 47% | P/E 0.0x | commodity-price sensitivity |
| [[AMPY]] | 64 | 68 | margin 17%; near 52W highs | P/E 5.5x | commodity-price sensitivity |
| [[BATL]] | 58 | 56 | passed the clean-universe and liquidity filters | P/E 5.1x | commodity-price sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[HLX]] | 62 | 33 | near 52W highs; strong liquidity | P/E 104.0x | P/E 104.0x; commodity-price sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 68 (INR)
- **Highest Quality Score**: INR
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-28
