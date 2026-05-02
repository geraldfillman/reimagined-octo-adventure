---
title: "Industrials Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-03"
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
| [[Industrials]] | Industrials | 143 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Industrials]] | Small | [[PSIX]] | 76 | 76 | execution margin 15%; 58% target upside | P/E 13.6x | beta 2.1; order-cycle sensitivity |
| [[Industrials]] | Small | [[GLDD]] | 72 | 61 | execution margin 14%; Op margin 14% | P/E 15.5x | order-cycle sensitivity |
| [[Industrials]] | Small | [[BW]] | 67 | 53 | 21% target upside; near 52W highs | P/S 2.6x | unprofitable; order-cycle sensitivity |
| [[Industrials]] | Micro | [[TAYD]] | 62 | 69 | execution margin 22%; Op margin 22% | P/E 17.4x | order-cycle sensitivity |
| [[Industrials]] | Special | [[VOYG]] | 53 | 21 | strong liquidity | P/S 9.5x | unprofitable; P/S 9.5x |
| [[Industrials]] | Reserve | [[FC]] | 53 | 58 | near 52W highs; strong liquidity | P/S 1.1x | weak sector fit; unprofitable |
| [[Industrials]] | Micro | [[SIDU]] | 43 | 22 | strong liquidity | P/S 61.3x | unprofitable; P/S 61.3x |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Industrials]] | Mid | $9.9B | [[GTLS]] | P/E 234.1x | 9.4x sector ceiling | 38 | P/E 234.1x vs ~25x sector ceiling; quality score 38 | P/E 234.1x; order-cycle sensitivity |
| [[Industrials]] | Large | $163.5B | [[BA]] | P/E 71.6x | 2.9x sector ceiling | 28 | P/E 71.6x vs ~25x sector ceiling; quality score 28 | P/E 71.6x; order-cycle sensitivity |
| [[Industrials]] | Mega | $335.6B | [[CAT]] | P/E 37.7x | 1.5x sector ceiling | 54 | P/E 37.7x vs ~25x sector ceiling; quality score 54 | P/E 37.7x; order-cycle sensitivity |
| [[Industrials]] | Large | $155.5B | [[DE]] | P/E 32.3x | 1.3x sector ceiling | 53 | P/E 32.3x vs ~25x sector ceiling; quality score 53 | P/E 32.3x; order-cycle sensitivity |

## Industrials Research Picks

- **Sector Lens**: machinery/defense/transport fit with order-cycle margin bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PSIX]] | 76 | 76 | execution margin 15%; 58% target upside | P/E 13.6x | beta 2.1; order-cycle sensitivity |
| [[GLDD]] | 72 | 61 | execution margin 14%; Op margin 14% | P/E 15.5x | order-cycle sensitivity |
| [[BW]] | 67 | 53 | 21% target upside; near 52W highs | P/S 2.6x | unprofitable; order-cycle sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[TAYD]] | 62 | 69 | execution margin 22%; Op margin 22% | P/E 17.4x | order-cycle sensitivity |
| [[SIDU]] | 43 | 22 | strong liquidity | P/S 61.3x | unprofitable; P/S 61.3x |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[VOYG]] | 53 | 21 | strong liquidity | P/S 9.5x | unprofitable; P/S 9.5x |

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[FC]] | 53 | 58 | near 52W highs; strong liquidity | P/S 1.1x | weak sector fit; unprofitable |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 76 (PSIX)
- **Highest Quality Score**: PSIX
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-03
