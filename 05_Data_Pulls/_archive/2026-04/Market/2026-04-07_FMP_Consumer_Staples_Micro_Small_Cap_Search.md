---
title: "Consumer Staples Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-07"
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
| [[Consumer Staples]] | Consumer Defensive | 29 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Small | [[SENEA]] | 66 | 60 | near 52W highs; strong liquidity | P/E 11.8x | input-cost sensitivity |
| [[Consumer Staples]] | Small | [[BRBR]] | 65 | 62 | consumer margin 14%; Op margin 14% | P/E 10.3x | input-cost sensitivity |
| [[Consumer Staples]] | Small | [[TPB]] | 63 | 66 | consumer margin 21%; Op margin 21% | P/E 23.6x | input-cost sensitivity |
| [[Consumer Staples]] | Special | [[SMPL]] | 60 | 59 | consumer margin 14%; Op margin 14% | P/E 15.6x | input-cost sensitivity |
| [[Consumer Staples]] | Reserve | [[STRA]] | 57 | 65 | consumer margin 14%; Op margin 14% | P/E 14.7x | weak sector fit; input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[OFRM]] | 47 | 54 | passed the clean-universe and liquidity filters | P/S 0.6x | unprofitable; input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[GROV]] | 39 | 52 | passed the clean-universe and liquidity filters | P/S 0.3x | unprofitable; thin liquidity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Mega | $448.0B | [[COST]] | P/E 52.4x | 2.1x sector ceiling | 44 | P/E 52.4x vs ~25x sector ceiling; quality score 44 | P/E 52.4x; input-cost sensitivity |
| [[Consumer Staples]] | Mega | $979.4B | [[WMT]] | P/E 44.7x | 1.8x sector ceiling | 45 | P/E 44.7x vs ~25x sector ceiling; quality score 45 | P/E 44.7x; input-cost sensitivity |
| [[Consumer Staples]] | Mid | $8.9B | [[CELH]] | P/E 75.4x | 3.0x sector ceiling | 51 | P/E 75.4x vs ~25x sector ceiling; quality score 51 | P/E 75.4x; input-cost sensitivity |

## Consumer Staples Research Picks

- **Sector Lens**: food/beverage/household fit with defensive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SENEA]] | 66 | 60 | near 52W highs; strong liquidity | P/E 11.8x | input-cost sensitivity |
| [[BRBR]] | 65 | 62 | consumer margin 14%; Op margin 14% | P/E 10.3x | input-cost sensitivity |
| [[TPB]] | 63 | 66 | consumer margin 21%; Op margin 21% | P/E 23.6x | input-cost sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[OFRM]] | 47 | 54 | passed the clean-universe and liquidity filters | P/S 0.6x | unprofitable; input-cost sensitivity |
| [[GROV]] | 39 | 52 | passed the clean-universe and liquidity filters | P/S 0.3x | unprofitable; thin liquidity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SMPL]] | 60 | 59 | consumer margin 14%; Op margin 14% | P/E 15.6x | input-cost sensitivity |

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[STRA]] | 57 | 65 | consumer margin 14%; Op margin 14% | P/E 14.7x | weak sector fit; input-cost sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 66 (SENEA)
- **Highest Quality Score**: TPB
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-07
