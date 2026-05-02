---
title: "Consumer Staples Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-03"
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
| [[Consumer Staples]] | Small | [[BRBR]] | 68 | 62 | consumer margin 14%; Op margin 14% | P/E 10.8x | input-cost sensitivity |
| [[Consumer Staples]] | Small | [[TPB]] | 65 | 66 | consumer margin 21%; Op margin 21% | P/E 23.7x | input-cost sensitivity |
| [[Consumer Staples]] | Small | [[SPB]] | 64 | 55 | near 52W highs | P/E 16.5x | input-cost sensitivity |
| [[Consumer Staples]] | Special | [[SMPL]] | 62 | 59 | consumer margin 14%; Op margin 14% | P/E 15.4x | input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[OFRM]] | 48 | 54 | passed the clean-universe and liquidity filters | P/S 0.6x | unprofitable; input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[BRCB]] | 45 | 53 | passed the clean-universe and liquidity filters | P/S 1.1x | unprofitable; input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[ZVIA]] | 34 | 49 | passed the clean-universe and liquidity filters | P/S 0.5x | unprofitable; thin liquidity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Mega | $1002.8B | [[WMT]] | P/E 45.8x | 1.8x sector ceiling | 45 | P/E 45.8x vs ~25x sector ceiling; quality score 45 | P/E 45.8x; input-cost sensitivity |

## Consumer Staples Research Picks

- **Sector Lens**: food/beverage/household fit with defensive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BRBR]] | 68 | 62 | consumer margin 14%; Op margin 14% | P/E 10.8x | input-cost sensitivity |
| [[TPB]] | 65 | 66 | consumer margin 21%; Op margin 21% | P/E 23.7x | input-cost sensitivity |
| [[SPB]] | 64 | 55 | near 52W highs | P/E 16.5x | input-cost sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[OFRM]] | 48 | 54 | passed the clean-universe and liquidity filters | P/S 0.6x | unprofitable; input-cost sensitivity |
| [[BRCB]] | 45 | 53 | passed the clean-universe and liquidity filters | P/S 1.1x | unprofitable; input-cost sensitivity |
| [[ZVIA]] | 34 | 49 | passed the clean-universe and liquidity filters | P/S 0.5x | unprofitable; thin liquidity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SMPL]] | 62 | 59 | consumer margin 14%; Op margin 14% | P/E 15.4x | input-cost sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 68 (BRBR)
- **Highest Quality Score**: TPB
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-03
