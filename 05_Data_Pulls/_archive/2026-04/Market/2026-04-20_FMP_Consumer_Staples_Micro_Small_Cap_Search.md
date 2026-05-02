---
title: "Consumer Staples Micro/Small Cap Search - FMP"
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
| [[Consumer Staples]] | Consumer Defensive | 28 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Small | [[BRBR]] | 72 | 69 | consumer margin 14%; 36% target upside | P/E 10.5x | input-cost sensitivity |
| [[Consumer Staples]] | Small | [[HLF]] | 72 | 65 | near 52W highs; strong liquidity | P/E 7.7x | input-cost sensitivity |
| [[Consumer Staples]] | Small | [[SPB]] | 65 | 53 | near 52W highs; strong liquidity | P/E 18.9x | input-cost sensitivity |
| [[Consumer Staples]] | Special | [[TPB]] | 64 | 64 | consumer margin 21%; Op margin 21% | P/E 26.7x | input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[OFRM]] | 54 | 57 | 21% target upside | P/S 0.6x | unprofitable; input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[BRCB]] | 45 | 53 | passed the clean-universe and liquidity filters | P/S 1.3x | unprofitable; input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[ZVIA]] | 35 | 49 | passed the clean-universe and liquidity filters | P/S 0.5x | unprofitable; thin liquidity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Mid | $9.2B | [[DAR]] | P/E 145.9x | 5.8x sector ceiling | 40 | P/E 145.9x vs ~25x sector ceiling; quality score 40 | P/E 145.9x; input-cost sensitivity |
| [[Consumer Staples]] | Large | $75.1B | [[MNST]] | P/E 39.4x | 1.6x sector ceiling | 59 | P/E 39.4x vs ~25x sector ceiling | P/E 39.4x; P/S 9.0x |
| [[Consumer Staples]] | Mid | $8.6B | [[ACI]] | P/E 39.2x | 1.6x sector ceiling | 39 | P/E 39.2x vs ~25x sector ceiling; quality score 39 | P/E 39.2x; input-cost sensitivity |

## Consumer Staples Research Picks

- **Sector Lens**: food/beverage/household fit with defensive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BRBR]] | 72 | 69 | consumer margin 14%; 36% target upside | P/E 10.5x | input-cost sensitivity |
| [[HLF]] | 72 | 65 | near 52W highs; strong liquidity | P/E 7.7x | input-cost sensitivity |
| [[SPB]] | 65 | 53 | near 52W highs; strong liquidity | P/E 18.9x | input-cost sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[OFRM]] | 54 | 57 | 21% target upside | P/S 0.6x | unprofitable; input-cost sensitivity |
| [[BRCB]] | 45 | 53 | passed the clean-universe and liquidity filters | P/S 1.3x | unprofitable; input-cost sensitivity |
| [[ZVIA]] | 35 | 49 | passed the clean-universe and liquidity filters | P/S 0.5x | unprofitable; thin liquidity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[TPB]] | 64 | 64 | consumer margin 21%; Op margin 21% | P/E 26.7x | input-cost sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 72 (BRBR)
- **Highest Quality Score**: BRBR
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-20
