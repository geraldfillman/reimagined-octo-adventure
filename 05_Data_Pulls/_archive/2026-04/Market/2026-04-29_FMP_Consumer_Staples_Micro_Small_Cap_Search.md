---
title: "Consumer Staples Micro/Small Cap Search - FMP"
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
| [[Consumer Staples]] | Consumer Defensive | 40 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Small | [[BRBR]] | 72 | 69 | consumer margin 14%; 36% target upside | P/E 11.0x | input-cost sensitivity |
| [[Consumer Staples]] | Small | [[SPB]] | 64 | 53 | near 52W highs | P/E 18.5x | input-cost sensitivity |
| [[Consumer Staples]] | Small | [[SMPL]] | 59 | 51 | consumer margin 14%; Op margin 14% | P/S 0.9x | unprofitable; input-cost sensitivity |
| [[Consumer Staples]] | Special | [[JJSF]] | 56 | 47 | passed the clean-universe and liquidity filters | P/E 27.1x | input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[OFRM]] | 52 | 61 | 34% target upside | P/S 0.6x | unprofitable; input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[LFVN]] | 51 | 71 | passed the clean-universe and liquidity filters | P/E 8.9x | thin liquidity; input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[BRCB]] | 49 | 61 | 72% target upside | P/S 1.1x | unprofitable; input-cost sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Mega | $1017.2B | [[WMT]] | P/E 46.5x | 1.9x sector ceiling | 45 | P/E 46.5x vs ~25x sector ceiling; quality score 45 | P/E 46.5x; input-cost sensitivity |
| [[Consumer Staples]] | Mid | $9.7B | [[DAR]] | P/E 154.5x | 6.2x sector ceiling | 37 | P/E 154.5x vs ~25x sector ceiling; quality score 37 | P/E 154.5x; input-cost sensitivity |
| [[Consumer Staples]] | Large | $75.5B | [[MNST]] | P/E 39.6x | 1.6x sector ceiling | 59 | P/E 39.6x vs ~25x sector ceiling | P/E 39.6x; P/S 9.1x |
| [[Consumer Staples]] | Mid | $8.5B | [[ACI]] | P/E 38.8x | 1.6x sector ceiling | 42 | P/E 38.8x vs ~25x sector ceiling; quality score 42 | P/E 38.8x; input-cost sensitivity |

## Consumer Staples Research Picks

- **Sector Lens**: food/beverage/household fit with defensive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BRBR]] | 72 | 69 | consumer margin 14%; 36% target upside | P/E 11.0x | input-cost sensitivity |
| [[SPB]] | 64 | 53 | near 52W highs | P/E 18.5x | input-cost sensitivity |
| [[SMPL]] | 59 | 51 | consumer margin 14%; Op margin 14% | P/S 0.9x | unprofitable; input-cost sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[OFRM]] | 52 | 61 | 34% target upside | P/S 0.6x | unprofitable; input-cost sensitivity |
| [[LFVN]] | 51 | 71 | passed the clean-universe and liquidity filters | P/E 8.9x | thin liquidity; input-cost sensitivity |
| [[BRCB]] | 49 | 61 | 72% target upside | P/S 1.1x | unprofitable; input-cost sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[JJSF]] | 56 | 47 | passed the clean-universe and liquidity filters | P/E 27.1x | input-cost sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 72 (BRBR)
- **Highest Quality Score**: LFVN
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-29
