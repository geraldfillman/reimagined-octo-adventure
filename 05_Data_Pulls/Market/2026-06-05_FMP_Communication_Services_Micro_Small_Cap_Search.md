---
title: "Communication Services Micro/Small Cap Search - FMP"
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
| [[Communication Services]] | Communication Services | 50 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Communication Services]] | Small | [[ATEX]] | 73 | 70 | Gross margin 100%; Op margin 14% | P/E 15.2x | P/S 209.6x; multiple-compression risk |
| [[Communication Services]] | Small | [[YELP]] | 70 | 77 | Gross margin 89%; Op margin 13% | P/E 9.7x | multiple-compression risk |
| [[Communication Services]] | Micro | [[CXDO]] | 64 | 55 | Gross margin 64%; 51% target upside | P/E 53.8x | P/E 53.8x; multiple-compression risk |
| [[Communication Services]] | Small | [[ZD]] | 64 | 47 | Gross margin 74%; Op margin 11% | P/E 37.9x | multiple-compression risk |
| [[Communication Services]] | Micro | [[ANGI]] | 59 | 66 | Gross margin 90%; 71% target upside | P/E 14.2x | multiple-compression risk |
| [[Communication Services]] | Micro | [[TZOO]] | 50 | 50 | Gross margin 79% | P/E 26.9x | thin liquidity; multiple-compression risk |
| [[Communication Services]] | Special | [[CURI]] | 49 | 51 | Gross margin 57%; 78% target upside | P/S 2.3x | unprofitable; beta 1.8 |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Communication Services]] | Small | $1.4B | [[TRIP]] | P/E 73.0x | 1.8x sector ceiling | 44 | P/E 73.0x vs ~40x sector ceiling; quality score 44 | P/E 73.0x; multiple-compression risk |
| [[Communication Services]] | Micro | $247.5M | [[CXDO]] | P/E 53.8x | 1.3x sector ceiling | 55 | P/E 53.8x vs ~40x sector ceiling | P/E 53.8x; multiple-compression risk |

## Communication Services Research Picks

- **Sector Lens**: telecom/media/platform fit with growth, margin, and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[ATEX]] | 73 | 70 | Gross margin 100%; Op margin 14% | P/E 15.2x | P/S 209.6x; multiple-compression risk |
| [[YELP]] | 70 | 77 | Gross margin 89%; Op margin 13% | P/E 9.7x | multiple-compression risk |
| [[ZD]] | 64 | 47 | Gross margin 74%; Op margin 11% | P/E 37.9x | multiple-compression risk |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CXDO]] | 64 | 55 | Gross margin 64%; 51% target upside | P/E 53.8x | P/E 53.8x; multiple-compression risk |
| [[ANGI]] | 59 | 66 | Gross margin 90%; 71% target upside | P/E 14.2x | multiple-compression risk |
| [[TZOO]] | 50 | 50 | Gross margin 79% | P/E 26.9x | thin liquidity; multiple-compression risk |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CURI]] | 49 | 51 | Gross margin 57%; 78% target upside | P/S 2.3x | unprofitable; beta 1.8 |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 73 (ATEX)
- **Highest Quality Score**: YELP
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-06-05
