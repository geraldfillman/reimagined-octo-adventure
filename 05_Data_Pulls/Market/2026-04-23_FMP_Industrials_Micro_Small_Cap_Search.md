---
title: "Industrials Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-23"
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
| [[Industrials]] | Industrials | 147 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Industrials]] | Small | [[BW]] | 66 | 50 | near 52W highs; strong liquidity | P/S 2.6x | unprofitable; order-cycle sensitivity |
| [[Industrials]] | Small | [[ARXS]] | 61 | N/A | strong liquidity; fundamentals pending | fundamentals pending | fundamental coverage missing; order-cycle sensitivity |
| [[Industrials]] | Small | [[VVX]] | 60 | 44 | strong liquidity | P/E 25.8x | order-cycle sensitivity |
| [[Industrials]] | Micro | [[PPIH]] | 58 | 65 | execution margin 14%; Op margin 14% | P/E 14.9x | order-cycle sensitivity |
| [[Industrials]] | Special | [[VOYG]] | 54 | 21 | strong liquidity | P/S 10.7x | unprofitable; P/S 10.7x |
| [[Industrials]] | Micro | [[SIDU]] | 44 | 23 | strong liquidity | P/S 38.7x | unprofitable; P/S 38.7x |
| [[Industrials]] | Micro | [[ASPN]] | 42 | 46 | passed the clean-universe and liquidity filters | P/S 1.0x | unprofitable; beta 2.9 |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Industrials]] | Mid | $10.0B | [[GTLS]] | P/E 235.1x | 9.4x sector ceiling | 38 | P/E 235.1x vs ~25x sector ceiling; quality score 38 | P/E 235.1x; order-cycle sensitivity |
| [[Industrials]] | Large | $184.0B | [[BA]] | P/E 84.5x | 3.4x sector ceiling | 28 | P/E 84.5x vs ~25x sector ceiling; quality score 28 | P/E 84.5x; order-cycle sensitivity |
| [[Industrials]] | Mega | $390.9B | [[CAT]] | P/E 43.9x | 1.8x sector ceiling | 47 | P/E 43.9x vs ~25x sector ceiling; quality score 47 | target below spot; P/E 43.9x |

## Industrials Research Picks

- **Sector Lens**: machinery/defense/transport fit with order-cycle margin bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BW]] | 66 | 50 | near 52W highs; strong liquidity | P/S 2.6x | unprofitable; order-cycle sensitivity |
| [[ARXS]] | 61 | N/A | strong liquidity; fundamentals pending | fundamentals pending | fundamental coverage missing; order-cycle sensitivity |
| [[VVX]] | 60 | 44 | strong liquidity | P/E 25.8x | order-cycle sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PPIH]] | 58 | 65 | execution margin 14%; Op margin 14% | P/E 14.9x | order-cycle sensitivity |
| [[SIDU]] | 44 | 23 | strong liquidity | P/S 38.7x | unprofitable; P/S 38.7x |
| [[ASPN]] | 42 | 46 | passed the clean-universe and liquidity filters | P/S 1.0x | unprofitable; beta 2.9 |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[VOYG]] | 54 | 21 | strong liquidity | P/S 10.7x | unprofitable; P/S 10.7x |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 66 (BW)
- **Highest Quality Score**: PPIH
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-23
