---
title: "Consumer Discretionary Micro/Small Cap Search - FMP"
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
| [[Consumer Discretionary]] | Consumer Cyclical | 98 | 0 | 0 | 0 | 1 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Discretionary]] | Small | [[GIII]] | 68 | 62 | near 52W highs; strong liquidity | P/E 11.3x | consumer-demand sensitivity |
| [[Consumer Discretionary]] | Small | [[PRKS]] | 64 | 60 | consumer margin 21%; Op margin 21% | P/E 13.2x | target below spot; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Small | [[AIN]] | 59 | 46 | near 52W highs; strong liquidity | P/S 1.6x | unprofitable; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Micro | [[JACK]] | 58 | 65 | consumer margin 13%; 32% target upside | P/E 6.1x | consumer-demand sensitivity |
| [[Consumer Discretionary]] | Micro | [[ZUMZ]] | 57 | 52 | passed the clean-universe and liquidity filters | P/E 19.1x | consumer-demand sensitivity |
| [[Consumer Discretionary]] | Micro | [[PTLO]] | 53 | 58 | 69% target upside | P/E 18.2x | consumer-demand sensitivity |
| [[Consumer Discretionary]] | Special | [[CHPT]] | 47 | 44 | passed the clean-universe and liquidity filters | P/S 0.4x | unprofitable; consumer-demand sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Discretionary]] | Small | $2.0B | [[FIGS]] | P/E 48.6x | 1.9x sector ceiling | 49 | P/E 48.6x vs ~25x sector ceiling; quality score 49 | P/E 48.6x; consumer-demand sensitivity |

## Consumer Discretionary Research Picks

- **Sector Lens**: retail/leisure/autos fit with demand-sensitive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[GIII]] | 68 | 62 | near 52W highs; strong liquidity | P/E 11.3x | consumer-demand sensitivity |
| [[PRKS]] | 64 | 60 | consumer margin 21%; Op margin 21% | P/E 13.2x | target below spot; consumer-demand sensitivity |
| [[AIN]] | 59 | 46 | near 52W highs; strong liquidity | P/S 1.6x | unprofitable; consumer-demand sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[JACK]] | 58 | 65 | consumer margin 13%; 32% target upside | P/E 6.1x | consumer-demand sensitivity |
| [[ZUMZ]] | 57 | 52 | passed the clean-universe and liquidity filters | P/E 19.1x | consumer-demand sensitivity |
| [[PTLO]] | 53 | 58 | 69% target upside | P/E 18.2x | consumer-demand sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CHPT]] | 47 | 44 | passed the clean-universe and liquidity filters | P/S 0.4x | unprofitable; consumer-demand sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 68 (GIII)
- **Highest Quality Score**: JACK
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-06-05
