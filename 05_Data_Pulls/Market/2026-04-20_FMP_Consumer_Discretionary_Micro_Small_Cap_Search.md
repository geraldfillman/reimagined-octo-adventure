---
title: "Consumer Discretionary Micro/Small Cap Search - FMP"
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
| [[Consumer Discretionary]] | Consumer Cyclical | 82 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Discretionary]] | Small | [[PRKS]] | 73 | 74 | consumer margin 22%; 50% target upside | P/E 11.4x | consumer-demand sensitivity |
| [[Consumer Discretionary]] | Small | [[CRI]] | 66 | 54 | strong liquidity | P/E 14.9x | target below spot; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Small | [[RVLV]] | 65 | 52 | strong liquidity | P/E 31.5x | beta 1.8; P/E 31.5x |
| [[Consumer Discretionary]] | Special | [[WGO]] | 55 | 46 | 20% target upside; strong liquidity | P/E 22.9x | consumer-demand sensitivity |
| [[Consumer Discretionary]] | Micro | [[XPOF]] | 53 | 59 | passed the clean-universe and liquidity filters | P/S 0.8x | unprofitable; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Micro | [[ROLR]] | 39 | 42 | passed the clean-universe and liquidity filters | P/E 92.7x | beta 3.7; P/E 92.7x |
| [[Consumer Discretionary]] | Micro | [[VENU]] | 33 | 26 | passed the clean-universe and liquidity filters | P/S 12.1x | unprofitable; beta 3.7 |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Discretionary]] | Micro | $64.0M | [[ROLR]] | P/E 92.7x | 3.7x sector ceiling | 42 | P/E 92.7x vs ~25x sector ceiling; quality score 42 | beta 3.7; P/E 92.7x |
| [[Consumer Discretionary]] | Mega | $2694.6B | [[AMZN]] | P/E 34.5x | 1.4x sector ceiling | 55 | P/E 34.5x vs ~25x sector ceiling | P/E 34.5x; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Large | $178.4B | [[TJX]] | P/E 32.9x | 1.3x sector ceiling | 53 | P/E 32.9x vs ~25x sector ceiling; quality score 53 | P/E 32.9x; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Small | $1.9B | [[RVLV]] | P/E 31.5x | 1.3x sector ceiling | 52 | P/E 31.5x vs ~25x sector ceiling; quality score 52 | beta 1.8; P/E 31.5x |

## Consumer Discretionary Research Picks

- **Sector Lens**: retail/leisure/autos fit with demand-sensitive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PRKS]] | 73 | 74 | consumer margin 22%; 50% target upside | P/E 11.4x | consumer-demand sensitivity |
| [[CRI]] | 66 | 54 | strong liquidity | P/E 14.9x | target below spot; consumer-demand sensitivity |
| [[RVLV]] | 65 | 52 | strong liquidity | P/E 31.5x | beta 1.8; P/E 31.5x |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[XPOF]] | 53 | 59 | passed the clean-universe and liquidity filters | P/S 0.8x | unprofitable; consumer-demand sensitivity |
| [[ROLR]] | 39 | 42 | passed the clean-universe and liquidity filters | P/E 92.7x | beta 3.7; P/E 92.7x |
| [[VENU]] | 33 | 26 | passed the clean-universe and liquidity filters | P/S 12.1x | unprofitable; beta 3.7 |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[WGO]] | 55 | 46 | 20% target upside; strong liquidity | P/E 22.9x | consumer-demand sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 73 (PRKS)
- **Highest Quality Score**: PRKS
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-20
