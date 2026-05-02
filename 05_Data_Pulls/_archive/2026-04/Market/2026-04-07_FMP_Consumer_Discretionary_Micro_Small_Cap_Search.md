---
title: "Consumer Discretionary Micro/Small Cap Search - FMP"
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
| [[Consumer Discretionary]] | Consumer Cyclical | 94 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Discretionary]] | Small | [[CRI]] | 66 | 60 | passed the clean-universe and liquidity filters | P/E 13.7x | consumer-demand sensitivity |
| [[Consumer Discretionary]] | Small | [[PRKS]] | 65 | 67 | consumer margin 22%; Op margin 22% | P/E 10.9x | consumer-demand sensitivity |
| [[Consumer Discretionary]] | Small | [[EYE]] | 59 | 42 | passed the clean-universe and liquidity filters | P/E 64.9x | P/E 64.9x; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Special | [[FUN]] | 52 | 50 | passed the clean-universe and liquidity filters | P/S 0.6x | unprofitable; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Micro | [[XPOF]] | 51 | 60 | passed the clean-universe and liquidity filters | P/S 0.8x | unprofitable; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Micro | [[JACK]] | 47 | 52 | passed the clean-universe and liquidity filters | P/S 0.2x | unprofitable; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Micro | [[BBBY]] | 44 | 44 | passed the clean-universe and liquidity filters | P/S 0.3x | unprofitable; beta 3.0 |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Discretionary]] | Small | $1.9B | [[EYE]] | P/E 64.9x | 2.6x sector ceiling | 42 | P/E 64.9x vs ~25x sector ceiling; quality score 42 | P/E 64.9x; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Large | $176.4B | [[TJX]] | P/E 32.5x | 1.3x sector ceiling | 53 | P/E 32.5x vs ~25x sector ceiling; quality score 53 | P/E 32.5x; consumer-demand sensitivity |

## Consumer Discretionary Research Picks

- **Sector Lens**: retail/leisure/autos fit with demand-sensitive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CRI]] | 66 | 60 | passed the clean-universe and liquidity filters | P/E 13.7x | consumer-demand sensitivity |
| [[PRKS]] | 65 | 67 | consumer margin 22%; Op margin 22% | P/E 10.9x | consumer-demand sensitivity |
| [[EYE]] | 59 | 42 | passed the clean-universe and liquidity filters | P/E 64.9x | P/E 64.9x; consumer-demand sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[XPOF]] | 51 | 60 | passed the clean-universe and liquidity filters | P/S 0.8x | unprofitable; consumer-demand sensitivity |
| [[JACK]] | 47 | 52 | passed the clean-universe and liquidity filters | P/S 0.2x | unprofitable; consumer-demand sensitivity |
| [[BBBY]] | 44 | 44 | passed the clean-universe and liquidity filters | P/S 0.3x | unprofitable; beta 3.0 |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[FUN]] | 52 | 50 | passed the clean-universe and liquidity filters | P/S 0.6x | unprofitable; consumer-demand sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 66 (CRI)
- **Highest Quality Score**: PRKS
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-07
