---
title: "Communication Services Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-29"
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
| [[Communication Services]] | Communication Services | 47 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Communication Services]] | Small | [[ATEX]] | 74 | 76 | Gross margin 100%; Op margin 14% | P/E 11.0x | P/S 150.7x; multiple-compression risk |
| [[Communication Services]] | Small | [[YELP]] | 70 | 73 | Gross margin 90%; Op margin 13% | P/E 12.2x | multiple-compression risk |
| [[Communication Services]] | Small | [[ZD]] | 66 | 46 | Gross margin 78%; Op margin 13% | P/E 39.8x | multiple-compression risk |
| [[Communication Services]] | Special | [[SCHL]] | 65 | 57 | Gross margin 52%; near 52W highs | P/E 16.5x | multiple-compression risk |
| [[Communication Services]] | Micro | [[ANGI]] | 55 | 66 | Gross margin 91% | P/E 7.9x | beta 1.8; multiple-compression risk |
| [[Communication Services]] | Micro | [[TZOO]] | 53 | 51 | Gross margin 79% | P/E 26.5x | multiple-compression risk |
| [[Communication Services]] | Micro | [[THRY]] | 48 | 42 | Gross margin 68% | P/E 547.9x | P/E 547.9x; multiple-compression risk |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Communication Services]] | Micro | $170.5M | [[THRY]] | P/E 547.9x | 13.7x sector ceiling | 42 | P/E 547.9x vs ~40x sector ceiling; quality score 42 | P/E 547.9x; multiple-compression risk |

## Communication Services Research Picks

- **Sector Lens**: telecom/media/platform fit with growth, margin, and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[ATEX]] | 74 | 76 | Gross margin 100%; Op margin 14% | P/E 11.0x | P/S 150.7x; multiple-compression risk |
| [[YELP]] | 70 | 73 | Gross margin 90%; Op margin 13% | P/E 12.2x | multiple-compression risk |
| [[ZD]] | 66 | 46 | Gross margin 78%; Op margin 13% | P/E 39.8x | multiple-compression risk |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[ANGI]] | 55 | 66 | Gross margin 91% | P/E 7.9x | beta 1.8; multiple-compression risk |
| [[TZOO]] | 53 | 51 | Gross margin 79% | P/E 26.5x | multiple-compression risk |
| [[THRY]] | 48 | 42 | Gross margin 68% | P/E 547.9x | P/E 547.9x; multiple-compression risk |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SCHL]] | 65 | 57 | Gross margin 52%; near 52W highs | P/E 16.5x | multiple-compression risk |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 74 (ATEX)
- **Highest Quality Score**: ATEX
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-29
