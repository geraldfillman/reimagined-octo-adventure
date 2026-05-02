---
title: "Materials Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-23"
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
| [[Materials]] | Basic Materials | 40 | 0 | 0 | 0 | 1 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Materials]] | Small | [[SLVM]] | 70 | 62 | 22% target upside | P/E 12.2x | commodity-cycle sensitivity |
| [[Materials]] | Small | [[IOSP]] | 60 | 58 | passed the clean-universe and liquidity filters | P/E 16.3x | commodity-cycle sensitivity |
| [[Materials]] | Small | [[ECVT]] | 59 | 45 | near 52W highs | P/S 2.0x | unprofitable; commodity-cycle sensitivity |
| [[Materials]] | Micro | [[CLW]] | 58 | 57 | 37% target upside | P/S 0.2x | unprofitable; commodity-cycle sensitivity |
| [[Materials]] | Micro | [[HDSN]] | 48 | 56 | passed the clean-universe and liquidity filters | P/E 16.4x | thin liquidity; commodity-cycle sensitivity |
| [[Materials]] | Micro | [[CTGO]] | 47 | 35 | 45% target upside | P/B 13.1x | commodity-cycle sensitivity |
| [[Materials]] | Special | [[GORO]] | 47 | 46 | Op margin 13%; near 52W highs | P/S 2.4x | unprofitable; commodity-cycle sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Materials]] | Mid | $9.3B | [[ESI]] | P/E 48.2x | 1.9x sector ceiling | 43 | P/E 48.2x vs ~25x sector ceiling; quality score 43 | P/E 48.2x; commodity-cycle sensitivity |
| [[Materials]] | Large | $150.6B | [[SCCO]] | P/E 35.2x | 1.4x sector ceiling | 52 | P/E 35.2x vs ~25x sector ceiling; quality score 52 | target below spot; P/E 35.2x |
| [[Materials]] | Large | $88.4B | [[FCX]] | P/E 32.5x | 1.3x sector ceiling | 52 | P/E 32.5x vs ~25x sector ceiling; quality score 52 | P/E 32.5x; commodity-cycle sensitivity |

## Materials Research Picks

- **Sector Lens**: chemicals/mining/metals fit with commodity-cycle value bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SLVM]] | 70 | 62 | 22% target upside | P/E 12.2x | commodity-cycle sensitivity |
| [[IOSP]] | 60 | 58 | passed the clean-universe and liquidity filters | P/E 16.3x | commodity-cycle sensitivity |
| [[ECVT]] | 59 | 45 | near 52W highs | P/S 2.0x | unprofitable; commodity-cycle sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CLW]] | 58 | 57 | 37% target upside | P/S 0.2x | unprofitable; commodity-cycle sensitivity |
| [[HDSN]] | 48 | 56 | passed the clean-universe and liquidity filters | P/E 16.4x | thin liquidity; commodity-cycle sensitivity |
| [[CTGO]] | 47 | 35 | 45% target upside | P/B 13.1x | commodity-cycle sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[GORO]] | 47 | 46 | Op margin 13%; near 52W highs | P/S 2.4x | unprofitable; commodity-cycle sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 70 (SLVM)
- **Highest Quality Score**: SLVM
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-23
