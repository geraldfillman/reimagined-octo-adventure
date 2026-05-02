---
title: "Consumer Staples Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-28"
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
| [[Consumer Staples]] | Consumer Defensive | 41 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Small | [[BRBR]] | 72 | 69 | consumer margin 14%; 36% target upside | P/E 10.8x | input-cost sensitivity |
| [[Consumer Staples]] | Small | [[TPB]] | 68 | 72 | consumer margin 21%; 63% target upside | P/E 26.2x | input-cost sensitivity |
| [[Consumer Staples]] | Small | [[SMPL]] | 60 | 52 | consumer margin 14%; Op margin 14% | P/S 0.9x | unprofitable; input-cost sensitivity |
| [[Consumer Staples]] | Special | [[JJSF]] | 57 | 47 | strong liquidity | P/E 27.1x | input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[LFVN]] | 54 | 71 | passed the clean-universe and liquidity filters | P/E 8.9x | input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[OFRM]] | 52 | 61 | 38% target upside | P/S 0.6x | unprofitable; input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[BRCB]] | 48 | 61 | 65% target upside | P/S 1.1x | unprofitable; input-cost sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Mega | $449.5B | [[COST]] | P/E 52.6x | 2.1x sector ceiling | 42 | P/E 52.6x vs ~25x sector ceiling; quality score 42 | P/E 52.6x; input-cost sensitivity |
| [[Consumer Staples]] | Mega | $1029.1B | [[WMT]] | P/E 47.0x | 1.9x sector ceiling | 45 | P/E 47.0x vs ~25x sector ceiling; quality score 45 | P/E 47.0x; input-cost sensitivity |
| [[Consumer Staples]] | Mid | $9.7B | [[DAR]] | P/E 154.1x | 6.2x sector ceiling | 37 | P/E 154.1x vs ~25x sector ceiling; quality score 37 | P/E 154.1x; input-cost sensitivity |
| [[Consumer Staples]] | Large | $76.2B | [[MNST]] | P/E 40.0x | 1.6x sector ceiling | 59 | P/E 40.0x vs ~25x sector ceiling | P/E 40.0x; P/S 9.2x |
| [[Consumer Staples]] | Mid | $8.5B | [[ACI]] | P/E 38.8x | 1.6x sector ceiling | 42 | P/E 38.8x vs ~25x sector ceiling; quality score 42 | P/E 38.8x; input-cost sensitivity |

## Consumer Staples Research Picks

- **Sector Lens**: food/beverage/household fit with defensive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BRBR]] | 72 | 69 | consumer margin 14%; 36% target upside | P/E 10.8x | input-cost sensitivity |
| [[TPB]] | 68 | 72 | consumer margin 21%; 63% target upside | P/E 26.2x | input-cost sensitivity |
| [[SMPL]] | 60 | 52 | consumer margin 14%; Op margin 14% | P/S 0.9x | unprofitable; input-cost sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[LFVN]] | 54 | 71 | passed the clean-universe and liquidity filters | P/E 8.9x | input-cost sensitivity |
| [[OFRM]] | 52 | 61 | 38% target upside | P/S 0.6x | unprofitable; input-cost sensitivity |
| [[BRCB]] | 48 | 61 | 65% target upside | P/S 1.1x | unprofitable; input-cost sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[JJSF]] | 57 | 47 | strong liquidity | P/E 27.1x | input-cost sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 72 (BRBR)
- **Highest Quality Score**: TPB
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-28
