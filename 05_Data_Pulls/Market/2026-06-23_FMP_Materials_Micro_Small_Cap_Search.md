---
title: "Materials Micro/Small Cap Search - FMP"
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
| [[Materials]] | Basic Materials | 25 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Materials]] | Small | [[GPRE]] | 56 | 51 | passed the clean-universe and liquidity filters | P/S 0.5x | unprofitable; commodity-cycle sensitivity |
| [[Materials]] | Small | [[CRML]] | 47 | 28 | strong liquidity | P/S 2501.0x | unprofitable; beta 1.8 |
| [[Materials]] | Small | [[ALOY]] | 46 | 22 | strong liquidity | P/S 478.2x | unprofitable; target below spot |
| [[Materials]] | Micro | [[GORO]] | 46 | 54 | Op margin 27% | P/E 27.8x | thin liquidity; commodity-cycle sensitivity |
| [[Materials]] | Micro | [[HDSN]] | 44 | 53 | passed the clean-universe and liquidity filters | P/E 18.4x | thin liquidity; commodity-cycle sensitivity |
| [[Materials]] | Micro | [[CTGO]] | 43 | 46 | passed the clean-universe and liquidity filters | P/B 0.8x | commodity-cycle sensitivity |
| [[Materials]] | Special | [[PZG]] | 40 | 47 | 240% target upside | P/B 2.8x | thin liquidity; commodity-cycle sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Materials]] | Large | $93.7B | [[FCX]] | P/E 34.7x | 1.4x sector ceiling | 42 | P/E 34.7x vs ~25x sector ceiling; quality score 42 | target below spot; P/E 34.7x |

## Materials Research Picks

- **Sector Lens**: chemicals/mining/metals fit with commodity-cycle value bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[GPRE]] | 56 | 51 | passed the clean-universe and liquidity filters | P/S 0.5x | unprofitable; commodity-cycle sensitivity |
| [[CRML]] | 47 | 28 | strong liquidity | P/S 2501.0x | unprofitable; beta 1.8 |
| [[ALOY]] | 46 | 22 | strong liquidity | P/S 478.2x | unprofitable; target below spot |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[GORO]] | 46 | 54 | Op margin 27% | P/E 27.8x | thin liquidity; commodity-cycle sensitivity |
| [[HDSN]] | 44 | 53 | passed the clean-universe and liquidity filters | P/E 18.4x | thin liquidity; commodity-cycle sensitivity |
| [[CTGO]] | 43 | 46 | passed the clean-universe and liquidity filters | P/B 0.8x | commodity-cycle sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PZG]] | 40 | 47 | 240% target upside | P/B 2.8x | thin liquidity; commodity-cycle sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 56 (GPRE)
- **Highest Quality Score**: GORO
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-06-23
