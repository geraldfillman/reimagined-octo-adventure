---
title: "Communication Services Micro/Small Cap Search - FMP"
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
| [[Communication Services]] | Communication Services | 26 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Communication Services]] | Small | [[CABO]] | 68 | 55 | Gross margin 51%; Op margin 27% | P/S 0.4x | unprofitable; multiple-compression risk |
| [[Communication Services]] | Small | [[YELP]] | 68 | 73 | Gross margin 90%; Op margin 13% | P/E 11.7x | multiple-compression risk |
| [[Communication Services]] | Small | [[DLX]] | 67 | 61 | Gross margin 53%; Op margin 11% | P/E 16.5x | multiple-compression risk |
| [[Communication Services]] | Special | [[AMC]] | 64 | 64 | Gross margin 75%; Op margin 38% | P/S 0.2x | unprofitable; beta 2.0 |
| [[Communication Services]] | Micro | [[TSQ]] | 52 | 60 | Op margin 13% | P/S 0.3x | unprofitable; thin liquidity |
| [[Communication Services]] | Micro | [[THRY]] | 44 | 42 | Gross margin 68% | P/E 459.9x | thin liquidity; P/E 459.9x |
| [[Communication Services]] | Micro | [[GAIA]] | 40 | 54 | Gross margin 87% | P/S 0.7x | unprofitable; thin liquidity |

## Potential Overvalued Watchlist

- No selected candidates currently screen as stretched on forward/trailing earnings multiples.

## Communication Services Research Picks

- **Sector Lens**: telecom/media/platform fit with growth, margin, and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CABO]] | 68 | 55 | Gross margin 51%; Op margin 27% | P/S 0.4x | unprofitable; multiple-compression risk |
| [[YELP]] | 68 | 73 | Gross margin 90%; Op margin 13% | P/E 11.7x | multiple-compression risk |
| [[DLX]] | 67 | 61 | Gross margin 53%; Op margin 11% | P/E 16.5x | multiple-compression risk |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[TSQ]] | 52 | 60 | Op margin 13% | P/S 0.3x | unprofitable; thin liquidity |
| [[THRY]] | 44 | 42 | Gross margin 68% | P/E 459.9x | thin liquidity; P/E 459.9x |
| [[GAIA]] | 40 | 54 | Gross margin 87% | P/S 0.7x | unprofitable; thin liquidity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AMC]] | 64 | 64 | Gross margin 75%; Op margin 38% | P/S 0.2x | unprofitable; beta 2.0 |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 68 (CABO)
- **Highest Quality Score**: YELP
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-20
