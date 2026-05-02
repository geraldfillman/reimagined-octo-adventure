---
title: "Industrials Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-05-02"
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
| [[Industrials]] | Industrials | 151 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Industrials]] | Small | [[BW]] | 64 | 51 | strong liquidity | P/S 2.3x | unprofitable; order-cycle sensitivity |
| [[Industrials]] | Reserve | [[CBZ]] | 56 | 56 | strong liquidity | P/E 12.8x | weak sector fit; order-cycle sensitivity |
| [[Industrials]] | Small | [[VOYG]] | 53 | 21 | strong liquidity | P/S 9.4x | unprofitable; P/S 9.4x |
| [[Industrials]] | Micro | [[CGEH]] | 50 | 34 | near 52W highs | P/E 170.0x | P/E 170.0x; order-cycle sensitivity |
| [[Industrials]] | Micro | [[AIRO]] | 46 | 51 | passed the clean-universe and liquidity filters | P/S 2.6x | unprofitable; beta 1.9 |
| [[Industrials]] | Micro | [[SIDU]] | 43 | 23 | strong liquidity | P/S 35.2x | unprofitable; P/S 35.2x |
| [[Industrials]] | Special | [[SPCE]] | 42 | 23 | strong liquidity | P/S 108.5x | unprofitable; beta 2.2 |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Industrials]] | Micro | $221.2M | [[CGEH]] | P/E 170.0x | 6.8x sector ceiling | 34 | P/E 170.0x vs ~25x sector ceiling; quality score 34 | P/E 170.0x; order-cycle sensitivity |
| [[Industrials]] | Mega | $414.0B | [[CAT]] | P/E 43.8x | 1.8x sector ceiling | 50 | P/E 43.8x vs ~25x sector ceiling; quality score 50 | target below spot; P/E 43.8x |
| [[Industrials]] | Large | $179.3B | [[BA]] | P/E 82.1x | 3.3x sector ceiling | 31 | P/E 82.1x vs ~25x sector ceiling; quality score 31 | P/E 82.1x; order-cycle sensitivity |
| [[Industrials]] | Small | $2.0B | [[THR]] | P/E 33.7x | 1.3x sector ceiling | 53 | P/E 33.7x vs ~25x sector ceiling; quality score 53 | P/E 33.7x; order-cycle sensitivity |

## Industrials Research Picks

- **Sector Lens**: machinery/defense/transport fit with order-cycle margin bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BW]] | 64 | 51 | strong liquidity | P/S 2.3x | unprofitable; order-cycle sensitivity |
| [[VOYG]] | 53 | 21 | strong liquidity | P/S 9.4x | unprofitable; P/S 9.4x |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CGEH]] | 50 | 34 | near 52W highs | P/E 170.0x | P/E 170.0x; order-cycle sensitivity |
| [[AIRO]] | 46 | 51 | passed the clean-universe and liquidity filters | P/S 2.6x | unprofitable; beta 1.9 |
| [[SIDU]] | 43 | 23 | strong liquidity | P/S 35.2x | unprofitable; P/S 35.2x |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SPCE]] | 42 | 23 | strong liquidity | P/S 108.5x | unprofitable; beta 2.2 |

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CBZ]] | 56 | 56 | strong liquidity | P/E 12.8x | weak sector fit; order-cycle sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 64 (BW)
- **Highest Quality Score**: CBZ
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-05-02
