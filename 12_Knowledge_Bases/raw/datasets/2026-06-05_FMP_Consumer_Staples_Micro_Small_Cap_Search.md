---
title: "Consumer Staples Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-06-05"
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
| [[Consumer Staples]] | Consumer Defensive | 36 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Small | [[TPB]] | 67 | 67 | consumer margin 18%; 43% target upside | P/E 30.3x | input-cost sensitivity |
| [[Consumer Staples]] | Small | [[SPB]] | 64 | 56 | near 52W highs | P/E 15.0x | input-cost sensitivity |
| [[Consumer Staples]] | Small | [[SAM]] | 60 | 61 | 34% target upside | P/S 0.9x | unprofitable; input-cost sensitivity |
| [[Consumer Staples]] | Special | [[FLO]] | 57 | 51 | strong liquidity | P/E 22.0x | input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[LFVN]] | 56 | 61 | passed the clean-universe and liquidity filters | P/E 21.4x | input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[NUS]] | 54 | 66 | passed the clean-universe and liquidity filters | P/E 4.8x | thin liquidity; input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[OFRM]] | 53 | 64 | 37% target upside | P/S 0.4x | unprofitable; thin liquidity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Mid | $8.4B | [[PRMB]] | P/E 143.1x | 5.7x sector ceiling | 36 | P/E 143.1x vs ~25x sector ceiling; quality score 36 | P/E 143.1x; input-cost sensitivity |
| [[Consumer Staples]] | Mid | $9.4B | [[DAR]] | P/E 41.9x | 1.7x sector ceiling | 38 | P/E 41.9x vs ~25x sector ceiling; quality score 38 | P/E 41.9x; input-cost sensitivity |
| [[Consumer Staples]] | Mega | $958.9B | [[WMT]] | P/E 41.6x | 1.7x sector ceiling | 47 | P/E 41.6x vs ~25x sector ceiling; quality score 47 | P/E 41.6x; input-cost sensitivity |

## Consumer Staples Research Picks

- **Sector Lens**: food/beverage/household fit with defensive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[TPB]] | 67 | 67 | consumer margin 18%; 43% target upside | P/E 30.3x | input-cost sensitivity |
| [[SPB]] | 64 | 56 | near 52W highs | P/E 15.0x | input-cost sensitivity |
| [[SAM]] | 60 | 61 | 34% target upside | P/S 0.9x | unprofitable; input-cost sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[LFVN]] | 56 | 61 | passed the clean-universe and liquidity filters | P/E 21.4x | input-cost sensitivity |
| [[NUS]] | 54 | 66 | passed the clean-universe and liquidity filters | P/E 4.8x | thin liquidity; input-cost sensitivity |
| [[OFRM]] | 53 | 64 | 37% target upside | P/S 0.4x | unprofitable; thin liquidity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[FLO]] | 57 | 51 | strong liquidity | P/E 22.0x | input-cost sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 67 (TPB)
- **Highest Quality Score**: TPB
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-06-05
