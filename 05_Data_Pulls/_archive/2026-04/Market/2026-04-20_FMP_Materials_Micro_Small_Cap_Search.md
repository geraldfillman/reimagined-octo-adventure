---
title: "Materials Micro/Small Cap Search - FMP"
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
| [[Materials]] | Basic Materials | 34 | 0 | 0 | 1 | 1 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Materials]] | Small | [[SLVM]] | 69 | 60 | passed the clean-universe and liquidity filters | P/E 13.0x | commodity-cycle sensitivity |
| [[Materials]] | Small | [[REX]] | 65 | 61 | margin 13%; near 52W highs | P/E 17.1x | commodity-cycle sensitivity |
| [[Materials]] | Small | [[ECVT]] | 61 | 45 | near 52W highs; strong liquidity | P/S 2.0x | unprofitable; commodity-cycle sensitivity |
| [[Materials]] | Special | [[IOSP]] | 60 | 58 | passed the clean-universe and liquidity filters | P/E 16.2x | commodity-cycle sensitivity |
| [[Materials]] | Micro | [[CLW]] | 59 | 56 | 33% target upside | P/S 0.2x | unprofitable; commodity-cycle sensitivity |
| [[Materials]] | Micro | [[HDSN]] | 48 | 56 | passed the clean-universe and liquidity filters | P/E 16.4x | thin liquidity; commodity-cycle sensitivity |
| [[Materials]] | Micro | [[GORO]] | 46 | 46 | Op margin 13%; near 52W highs | P/S 2.3x | unprofitable; commodity-cycle sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Materials]] | Large | $100.9B | [[FCX]] | P/E 46.1x | 1.8x sector ceiling | 44 | P/E 46.1x vs ~25x sector ceiling; quality score 44 | P/E 46.1x; commodity-cycle sensitivity |
| [[Materials]] | Mid | $9.5B | [[ESI]] | P/E 49.5x | 2.0x sector ceiling | 42 | P/E 49.5x vs ~25x sector ceiling; quality score 42 | target below spot; P/E 49.5x |
| [[Materials]] | Large | $160.5B | [[SCCO]] | P/E 37.6x | 1.5x sector ceiling | 52 | P/E 37.6x vs ~25x sector ceiling; quality score 52 | target below spot; P/E 37.6x |
| [[Materials]] | Large | $85.6B | [[SHW]] | P/E 33.1x | 1.3x sector ceiling | 55 | P/E 33.1x vs ~25x sector ceiling | P/E 33.1x; commodity-cycle sensitivity |

## Materials Research Picks

- **Sector Lens**: chemicals/mining/metals fit with commodity-cycle value bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SLVM]] | 69 | 60 | passed the clean-universe and liquidity filters | P/E 13.0x | commodity-cycle sensitivity |
| [[REX]] | 65 | 61 | margin 13%; near 52W highs | P/E 17.1x | commodity-cycle sensitivity |
| [[ECVT]] | 61 | 45 | near 52W highs; strong liquidity | P/S 2.0x | unprofitable; commodity-cycle sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CLW]] | 59 | 56 | 33% target upside | P/S 0.2x | unprofitable; commodity-cycle sensitivity |
| [[HDSN]] | 48 | 56 | passed the clean-universe and liquidity filters | P/E 16.4x | thin liquidity; commodity-cycle sensitivity |
| [[GORO]] | 46 | 46 | Op margin 13%; near 52W highs | P/S 2.3x | unprofitable; commodity-cycle sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[IOSP]] | 60 | 58 | passed the clean-universe and liquidity filters | P/E 16.2x | commodity-cycle sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 69 (SLVM)
- **Highest Quality Score**: REX
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-20
