---
title: "Industrials Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-06-23"
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
| [[Industrials]] | Industrials | 102 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Industrials]] | Small | [[BW]] | 63 | 49 | strong liquidity | P/S 2.8x | unprofitable; order-cycle sensitivity |
| [[Industrials]] | Reserve | [[HURN]] | 60 | 70 | execution margin 12%; 61% target upside | P/E 16.0x | weak sector fit; order-cycle sensitivity |
| [[Industrials]] | Small | [[RDW]] | 56 | 36 | 88% target upside; strong liquidity | P/S 5.2x | unprofitable; beta 2.5 |
| [[Industrials]] | Reserve | [[TE]] | 51 | 45 | 29% target upside; near 52W highs | P/S 1.9x | weak sector fit; unprofitable |
| [[Industrials]] | Micro | [[FJET]] | 42 | 28 | passed the clean-universe and liquidity filters | P/B 9.0x | order-cycle sensitivity |
| [[Industrials]] | Micro | [[SIDU]] | 39 | 21 | passed the clean-universe and liquidity filters | P/S 31.6x | unprofitable; P/S 31.6x |
| [[Industrials]] | Micro | [[MNTS]] | 39 | 24 | passed the clean-universe and liquidity filters | P/S 12.2x | unprofitable; beta 2.2 |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Industrials]] | Mega | $457.0B | [[CAT]] | P/E 49.2x | 2.0x sector ceiling | 51 | P/E 49.2x vs ~25x sector ceiling; quality score 51 | P/E 49.2x; order-cycle sensitivity |
| [[Industrials]] | Large | $172.2B | [[BA]] | P/E 90.3x | 3.6x sector ceiling | 29 | P/E 90.3x vs ~25x sector ceiling; quality score 29 | P/E 90.3x; order-cycle sensitivity |
| [[Industrials]] | Large | $161.2B | [[DE]] | P/E 33.8x | 1.4x sector ceiling | 54 | P/E 33.8x vs ~25x sector ceiling; quality score 54 | P/E 33.8x; order-cycle sensitivity |

## Industrials Research Picks

- **Sector Lens**: machinery/defense/transport fit with order-cycle margin bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BW]] | 63 | 49 | strong liquidity | P/S 2.8x | unprofitable; order-cycle sensitivity |
| [[RDW]] | 56 | 36 | 88% target upside; strong liquidity | P/S 5.2x | unprofitable; beta 2.5 |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[FJET]] | 42 | 28 | passed the clean-universe and liquidity filters | P/B 9.0x | order-cycle sensitivity |
| [[SIDU]] | 39 | 21 | passed the clean-universe and liquidity filters | P/S 31.6x | unprofitable; P/S 31.6x |
| [[MNTS]] | 39 | 24 | passed the clean-universe and liquidity filters | P/S 12.2x | unprofitable; beta 2.2 |

### Special Situation

- No special situation selected.

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[HURN]] | 60 | 70 | execution margin 12%; 61% target upside | P/E 16.0x | weak sector fit; order-cycle sensitivity |
| [[TE]] | 51 | 45 | 29% target upside; near 52W highs | P/S 1.9x | weak sector fit; unprofitable |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 63 (BW)
- **Highest Quality Score**: HURN
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-06-23
