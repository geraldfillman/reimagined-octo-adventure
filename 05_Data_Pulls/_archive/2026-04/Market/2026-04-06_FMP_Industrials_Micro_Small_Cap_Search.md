---
title: "Industrials Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-06"
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
| [[Industrials]] | Industrials | 31 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Industrials]] | Small | [[GLDD]] | 72 | 61 | execution margin 14%; Op margin 14% | P/E 15.5x | order-cycle sensitivity |
| [[Industrials]] | Small | [[BW]] | 64 | 49 | near 52W highs | P/S 2.8x | unprofitable; order-cycle sensitivity |
| [[Industrials]] | Small | [[RDW]] | 53 | 29 | strong liquidity | P/S 4.9x | unprofitable; beta 2.5 |
| [[Industrials]] | Special | [[NNE]] | 50 | 43 | passed the clean-universe and liquidity filters | P/B 1.8x | beta 7.6; order-cycle sensitivity |
| [[Industrials]] | Micro | [[SIDU]] | 44 | 22 | strong liquidity | P/S 68.0x | unprofitable; P/S 68.0x |
| [[Industrials]] | Micro | [[SPCE]] | 41 | 22 | strong liquidity | P/S 119.1x | unprofitable; beta 2.2 |
| [[Industrials]] | Micro | [[JELD]] | 30 | 43 | passed the clean-universe and liquidity filters | P/S 0.0x | unprofitable; beta 1.9 |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Industrials]] | Mid | $9.9B | [[GTLS]] | P/E 234.1x | 9.4x sector ceiling | 38 | P/E 234.1x vs ~25x sector ceiling; quality score 38 | P/E 234.1x; order-cycle sensitivity |
| [[Industrials]] | Large | $166.1B | [[BA]] | P/E 72.7x | 2.9x sector ceiling | 28 | P/E 72.7x vs ~25x sector ceiling; quality score 28 | P/E 72.7x; order-cycle sensitivity |
| [[Industrials]] | Mega | $332.0B | [[CAT]] | P/E 37.3x | 1.5x sector ceiling | 55 | P/E 37.3x vs ~25x sector ceiling | P/E 37.3x; order-cycle sensitivity |

## Industrials Research Picks

- **Sector Lens**: machinery/defense/transport fit with order-cycle margin bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[GLDD]] | 72 | 61 | execution margin 14%; Op margin 14% | P/E 15.5x | order-cycle sensitivity |
| [[BW]] | 64 | 49 | near 52W highs | P/S 2.8x | unprofitable; order-cycle sensitivity |
| [[RDW]] | 53 | 29 | strong liquidity | P/S 4.9x | unprofitable; beta 2.5 |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SIDU]] | 44 | 22 | strong liquidity | P/S 68.0x | unprofitable; P/S 68.0x |
| [[SPCE]] | 41 | 22 | strong liquidity | P/S 119.1x | unprofitable; beta 2.2 |
| [[JELD]] | 30 | 43 | passed the clean-universe and liquidity filters | P/S 0.0x | unprofitable; beta 1.9 |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[NNE]] | 50 | 43 | passed the clean-universe and liquidity filters | P/B 1.8x | beta 7.6; order-cycle sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 72 (GLDD)
- **Highest Quality Score**: GLDD
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-06
