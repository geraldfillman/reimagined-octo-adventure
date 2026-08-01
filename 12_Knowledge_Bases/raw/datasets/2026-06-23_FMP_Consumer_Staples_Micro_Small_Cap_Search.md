---
title: "Consumer Staples Micro/Small Cap Search - FMP"
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
| [[Consumer Staples]] | Consumer Defensive | 23 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Small | [[SPB]] | 66 | 59 | near 52W highs | P/E 15.6x | input-cost sensitivity |
| [[Consumer Staples]] | Small | [[BRBR]] | 65 | 62 | consumer margin 12%; Op margin 12% | P/E 8.6x | input-cost sensitivity |
| [[Consumer Staples]] | Small | [[EPC]] | 64 | 53 | near 52W highs; strong liquidity | P/S 0.6x | unprofitable; input-cost sensitivity |
| [[Consumer Staples]] | Special | [[FLO]] | 56 | 52 | passed the clean-universe and liquidity filters | P/E 21.5x | input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[NUS]] | 54 | 66 | passed the clean-universe and liquidity filters | P/E 4.6x | thin liquidity; input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[LFVN]] | 51 | 66 | passed the clean-universe and liquidity filters | P/E 13.8x | thin liquidity; input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[ZVIA]] | 39 | 50 | passed the clean-universe and liquidity filters | P/S 0.7x | unprofitable; thin liquidity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Mega | $426.7B | [[COST]] | P/E 48.3x | 1.9x sector ceiling | 43 | P/E 48.3x vs ~25x sector ceiling; quality score 43 | P/E 48.3x; input-cost sensitivity |
| [[Consumer Staples]] | Mid | $8.8B | [[PRMB]] | P/E 153.0x | 6.1x sector ceiling | 38 | P/E 153.0x vs ~25x sector ceiling; quality score 38 | P/E 153.0x; input-cost sensitivity |
| [[Consumer Staples]] | Mega | $951.3B | [[WMT]] | P/E 42.0x | 1.7x sector ceiling | 50 | P/E 42.0x vs ~25x sector ceiling; quality score 50 | P/E 42.0x; input-cost sensitivity |

## Consumer Staples Research Picks

- **Sector Lens**: food/beverage/household fit with defensive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SPB]] | 66 | 59 | near 52W highs | P/E 15.6x | input-cost sensitivity |
| [[BRBR]] | 65 | 62 | consumer margin 12%; Op margin 12% | P/E 8.6x | input-cost sensitivity |
| [[EPC]] | 64 | 53 | near 52W highs; strong liquidity | P/S 0.6x | unprofitable; input-cost sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[NUS]] | 54 | 66 | passed the clean-universe and liquidity filters | P/E 4.6x | thin liquidity; input-cost sensitivity |
| [[LFVN]] | 51 | 66 | passed the clean-universe and liquidity filters | P/E 13.8x | thin liquidity; input-cost sensitivity |
| [[ZVIA]] | 39 | 50 | passed the clean-universe and liquidity filters | P/S 0.7x | unprofitable; thin liquidity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[FLO]] | 56 | 52 | passed the clean-universe and liquidity filters | P/E 21.5x | input-cost sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 66 (SPB)
- **Highest Quality Score**: NUS
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-06-23
