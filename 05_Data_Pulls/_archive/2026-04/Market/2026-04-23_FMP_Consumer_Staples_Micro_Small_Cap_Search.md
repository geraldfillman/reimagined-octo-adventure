---
title: "Consumer Staples Micro/Small Cap Search - FMP"
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
| [[Consumer Staples]] | Consumer Defensive | 39 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Small | [[BRBR]] | 71 | 69 | consumer margin 14%; 41% target upside | P/E 10.6x | input-cost sensitivity |
| [[Consumer Staples]] | Small | [[TPB]] | 69 | 73 | consumer margin 21%; 73% target upside | P/E 24.7x | input-cost sensitivity |
| [[Consumer Staples]] | Small | [[HELE]] | 59 | 46 | strong liquidity | P/S 0.3x | unprofitable; input-cost sensitivity |
| [[Consumer Staples]] | Special | [[JJSF]] | 56 | 48 | strong liquidity | P/E 25.7x | input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[LFVN]] | 55 | 72 | passed the clean-universe and liquidity filters | P/E 8.0x | input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[OFRM]] | 52 | 61 | 36% target upside | P/S 0.6x | unprofitable; input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[BRCB]] | 50 | 61 | 65% target upside | P/S 1.1x | unprofitable; input-cost sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Mid | $8.7B | [[CELH]] | P/E 73.9x | 3.0x sector ceiling | 44 | P/E 73.9x vs ~25x sector ceiling; quality score 44 | P/E 73.9x; input-cost sensitivity |
| [[Consumer Staples]] | Mega | $1052.6B | [[WMT]] | P/E 48.1x | 1.9x sector ceiling | 45 | P/E 48.1x vs ~25x sector ceiling; quality score 45 | P/E 48.1x; input-cost sensitivity |
| [[Consumer Staples]] | Mid | $9.7B | [[DAR]] | P/E 153.5x | 6.1x sector ceiling | 37 | P/E 153.5x vs ~25x sector ceiling; quality score 37 | P/E 153.5x; input-cost sensitivity |
| [[Consumer Staples]] | Large | $75.9B | [[MNST]] | P/E 39.8x | 1.6x sector ceiling | 59 | P/E 39.8x vs ~25x sector ceiling | P/E 39.8x; P/S 9.1x |

## Consumer Staples Research Picks

- **Sector Lens**: food/beverage/household fit with defensive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BRBR]] | 71 | 69 | consumer margin 14%; 41% target upside | P/E 10.6x | input-cost sensitivity |
| [[TPB]] | 69 | 73 | consumer margin 21%; 73% target upside | P/E 24.7x | input-cost sensitivity |
| [[HELE]] | 59 | 46 | strong liquidity | P/S 0.3x | unprofitable; input-cost sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[LFVN]] | 55 | 72 | passed the clean-universe and liquidity filters | P/E 8.0x | input-cost sensitivity |
| [[OFRM]] | 52 | 61 | 36% target upside | P/S 0.6x | unprofitable; input-cost sensitivity |
| [[BRCB]] | 50 | 61 | 65% target upside | P/S 1.1x | unprofitable; input-cost sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[JJSF]] | 56 | 48 | strong liquidity | P/E 25.7x | input-cost sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 71 (BRBR)
- **Highest Quality Score**: TPB
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-23
