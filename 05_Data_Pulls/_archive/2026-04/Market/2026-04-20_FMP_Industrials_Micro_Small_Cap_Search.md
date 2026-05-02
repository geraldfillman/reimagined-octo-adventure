---
title: "Industrials Micro/Small Cap Search - FMP"
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
| [[Industrials]] | Industrials | 105 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Industrials]] | Small | [[BW]] | 67 | 49 | near 52W highs; strong liquidity | P/S 3.0x | unprofitable; order-cycle sensitivity |
| [[Industrials]] | Small | [[WERN]] | 57 | 44 | strong liquidity | P/S 0.7x | unprofitable; target below spot |
| [[Industrials]] | Small | [[VOYG]] | 54 | 21 | strong liquidity | P/S 11.1x | unprofitable; P/S 11.1x |
| [[Industrials]] | Reserve | [[PLPC]] | 54 | 43 | near 52W highs; strong liquidity | P/E 44.4x | weak sector fit; P/E 44.4x |
| [[Industrials]] | Special | [[RDW]] | 53 | 28 | strong liquidity | P/S 5.1x | unprofitable; beta 2.5 |
| [[Industrials]] | Micro | [[FJET]] | 46 | 39 | passed the clean-universe and liquidity filters | No clean multiple | order-cycle sensitivity |
| [[Industrials]] | Micro | [[SPCE]] | 39 | 19 | strong liquidity | P/S 119.9x | unprofitable; beta 2.2 |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Industrials]] | Mid | $10.0B | [[GTLS]] | P/E 235.5x | 9.4x sector ceiling | 38 | P/E 235.5x vs ~25x sector ceiling; quality score 38 | P/E 235.5x; order-cycle sensitivity |
| [[Industrials]] | Large | $175.5B | [[BA]] | P/E 76.8x | 3.1x sector ceiling | 28 | P/E 76.8x vs ~25x sector ceiling; quality score 28 | P/E 76.8x; order-cycle sensitivity |
| [[Industrials]] | Mega | $371.9B | [[CAT]] | P/E 41.8x | 1.7x sector ceiling | 46 | P/E 41.8x vs ~25x sector ceiling; quality score 46 | target below spot; P/E 41.8x |
| [[Industrials]] | Large | $159.5B | [[DE]] | P/E 33.2x | 1.3x sector ceiling | 52 | P/E 33.2x vs ~25x sector ceiling; quality score 52 | P/E 33.2x; order-cycle sensitivity |

## Industrials Research Picks

- **Sector Lens**: machinery/defense/transport fit with order-cycle margin bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BW]] | 67 | 49 | near 52W highs; strong liquidity | P/S 3.0x | unprofitable; order-cycle sensitivity |
| [[WERN]] | 57 | 44 | strong liquidity | P/S 0.7x | unprofitable; target below spot |
| [[VOYG]] | 54 | 21 | strong liquidity | P/S 11.1x | unprofitable; P/S 11.1x |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[FJET]] | 46 | 39 | passed the clean-universe and liquidity filters | No clean multiple | order-cycle sensitivity |
| [[SPCE]] | 39 | 19 | strong liquidity | P/S 119.9x | unprofitable; beta 2.2 |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[RDW]] | 53 | 28 | strong liquidity | P/S 5.1x | unprofitable; beta 2.5 |

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PLPC]] | 54 | 43 | near 52W highs; strong liquidity | P/E 44.4x | weak sector fit; P/E 44.4x |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 67 (BW)
- **Highest Quality Score**: BW
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-20
