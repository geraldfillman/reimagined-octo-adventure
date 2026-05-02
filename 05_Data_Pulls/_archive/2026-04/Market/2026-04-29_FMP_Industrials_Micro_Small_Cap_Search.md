---
title: "Industrials Micro/Small Cap Search - FMP"
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
| [[Industrials]] | Industrials | 145 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Industrials]] | Small | [[PSIX]] | 71 | 69 | execution margin 15%; Op margin 15% | P/E 14.0x | beta 2.2; order-cycle sensitivity |
| [[Industrials]] | Small | [[THR]] | 69 | 53 | execution margin 16%; Op margin 16% | P/E 33.7x | P/E 33.7x; order-cycle sensitivity |
| [[Industrials]] | Small | [[AVEX]] | 60 | N/A | strong liquidity; fundamentals pending | fundamentals pending | fundamental coverage missing; order-cycle sensitivity |
| [[Industrials]] | Micro | [[AP]] | 51 | 46 | near 52W highs | P/S 0.5x | unprofitable; order-cycle sensitivity |
| [[Industrials]] | Micro | [[AIRO]] | 46 | 50 | passed the clean-universe and liquidity filters | P/S 2.8x | unprofitable; beta 1.9 |
| [[Industrials]] | Micro | [[SPCE]] | 43 | 27 | 26% target upside | P/S 97.4x | unprofitable; beta 2.2 |
| [[Industrials]] | Special | [[SIDU]] | 42 | 23 | strong liquidity | P/S 32.1x | unprofitable; P/S 32.1x |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Industrials]] | Large | $181.9B | [[BA]] | P/E 83.3x | 3.3x sector ceiling | 29 | P/E 83.3x vs ~25x sector ceiling; quality score 29 | P/E 83.3x; order-cycle sensitivity |
| [[Industrials]] | Mega | $380.5B | [[CAT]] | P/E 43.0x | 1.7x sector ceiling | 47 | P/E 43.0x vs ~25x sector ceiling; quality score 47 | target below spot; P/E 43.0x |
| [[Industrials]] | Small | $2.0B | [[GRC]] | P/E 34.1x | 1.4x sector ceiling | 49 | P/E 34.1x vs ~25x sector ceiling; quality score 49 | P/E 34.1x; order-cycle sensitivity |
| [[Industrials]] | Small | $2.0B | [[THR]] | P/E 33.7x | 1.3x sector ceiling | 53 | P/E 33.7x vs ~25x sector ceiling; quality score 53 | P/E 33.7x; order-cycle sensitivity |

## Industrials Research Picks

- **Sector Lens**: machinery/defense/transport fit with order-cycle margin bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PSIX]] | 71 | 69 | execution margin 15%; Op margin 15% | P/E 14.0x | beta 2.2; order-cycle sensitivity |
| [[THR]] | 69 | 53 | execution margin 16%; Op margin 16% | P/E 33.7x | P/E 33.7x; order-cycle sensitivity |
| [[AVEX]] | 60 | N/A | strong liquidity; fundamentals pending | fundamentals pending | fundamental coverage missing; order-cycle sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AP]] | 51 | 46 | near 52W highs | P/S 0.5x | unprofitable; order-cycle sensitivity |
| [[AIRO]] | 46 | 50 | passed the clean-universe and liquidity filters | P/S 2.8x | unprofitable; beta 1.9 |
| [[SPCE]] | 43 | 27 | 26% target upside | P/S 97.4x | unprofitable; beta 2.2 |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SIDU]] | 42 | 23 | strong liquidity | P/S 32.1x | unprofitable; P/S 32.1x |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 71 (PSIX)
- **Highest Quality Score**: PSIX
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-29
