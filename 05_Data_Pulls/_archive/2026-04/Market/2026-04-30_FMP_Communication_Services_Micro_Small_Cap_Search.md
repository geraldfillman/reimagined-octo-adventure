---
title: "Communication Services Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-30"
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
| [[Communication Services]] | Communication Services | 48 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Communication Services]] | Small | [[YELP]] | 70 | 73 | Gross margin 90%; Op margin 13% | P/E 11.7x | multiple-compression risk |
| [[Communication Services]] | Small | [[MGNI]] | 66 | 72 | Gross margin 63%; Op margin 14% | P/E 12.7x | beta 2.4; multiple-compression risk |
| [[Communication Services]] | Small | [[ZD]] | 65 | 46 | Gross margin 78%; Op margin 13% | P/E 38.6x | multiple-compression risk |
| [[Communication Services]] | Special | [[CCOI]] | 60 | 44 | passed the clean-universe and liquidity filters | P/S 1.2x | unprofitable; multiple-compression risk |
| [[Communication Services]] | Micro | [[ANGI]] | 55 | 66 | Gross margin 91% | P/E 7.6x | beta 1.8; multiple-compression risk |
| [[Communication Services]] | Micro | [[TZOO]] | 54 | 54 | Gross margin 79%; 23% target upside | P/E 26.3x | multiple-compression risk |
| [[Communication Services]] | Micro | [[THRY]] | 47 | 42 | Gross margin 68% | P/E 519.5x | P/E 519.5x; multiple-compression risk |

## Potential Overvalued Watchlist

- No selected candidates currently screen as stretched on forward/trailing earnings multiples.

## Communication Services Research Picks

- **Sector Lens**: telecom/media/platform fit with growth, margin, and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[YELP]] | 70 | 73 | Gross margin 90%; Op margin 13% | P/E 11.7x | multiple-compression risk |
| [[MGNI]] | 66 | 72 | Gross margin 63%; Op margin 14% | P/E 12.7x | beta 2.4; multiple-compression risk |
| [[ZD]] | 65 | 46 | Gross margin 78%; Op margin 13% | P/E 38.6x | multiple-compression risk |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[ANGI]] | 55 | 66 | Gross margin 91% | P/E 7.6x | beta 1.8; multiple-compression risk |
| [[TZOO]] | 54 | 54 | Gross margin 79%; 23% target upside | P/E 26.3x | multiple-compression risk |
| [[THRY]] | 47 | 42 | Gross margin 68% | P/E 519.5x | P/E 519.5x; multiple-compression risk |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CCOI]] | 60 | 44 | passed the clean-universe and liquidity filters | P/S 1.2x | unprofitable; multiple-compression risk |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 70 (YELP)
- **Highest Quality Score**: YELP
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-30
