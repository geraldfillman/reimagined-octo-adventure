---
title: "Consumer Discretionary Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-27"
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
| [[Consumer Discretionary]] | Consumer Cyclical | 39 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Discretionary]] | Small | [[EYE]] | 56 | 42 | passed the clean-universe and liquidity filters | P/E 65.3x | P/E 65.3x; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Reserve | [[PLOW]] | 55 | 56 | consumer margin 11%; Op margin 11% | P/E 23.2x | weak sector fit; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Small | [[FUN]] | 50 | 50 | passed the clean-universe and liquidity filters | P/S 0.6x | unprofitable; thin liquidity |
| [[Consumer Discretionary]] | Small | [[PZZA]] | 49 | 35 | passed the clean-universe and liquidity filters | P/E 38.6x | P/E 38.6x; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Micro | [[CVGI]] | 43 | 46 | near 52W highs | P/S 0.2x | unprofitable; thin liquidity |
| [[Consumer Discretionary]] | Micro | [[FLWS]] | 42 | 45 | passed the clean-universe and liquidity filters | P/S 0.2x | unprofitable; thin liquidity |
| [[Consumer Discretionary]] | Micro | [[ROLR]] | 35 | 42 | passed the clean-universe and liquidity filters | P/E 115.8x | beta 3.7; thin liquidity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Discretionary]] | Mid | $9.9B | [[BROS]] | P/E 91.3x | 3.7x sector ceiling | 42 | P/E 91.3x vs ~25x sector ceiling; quality score 42 | beta 2.5; P/E 91.3x |
| [[Consumer Discretionary]] | Mega | $2817.1B | [[AMZN]] | P/E 36.1x | 1.4x sector ceiling | 55 | P/E 36.1x vs ~25x sector ceiling | P/E 36.1x; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Large | $175.5B | [[TJX]] | P/E 32.4x | 1.3x sector ceiling | 53 | P/E 32.4x vs ~25x sector ceiling; quality score 53 | P/E 32.4x; consumer-demand sensitivity |

## Consumer Discretionary Research Picks

- **Sector Lens**: retail/leisure/autos fit with demand-sensitive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[EYE]] | 56 | 42 | passed the clean-universe and liquidity filters | P/E 65.3x | P/E 65.3x; consumer-demand sensitivity |
| [[FUN]] | 50 | 50 | passed the clean-universe and liquidity filters | P/S 0.6x | unprofitable; thin liquidity |
| [[PZZA]] | 49 | 35 | passed the clean-universe and liquidity filters | P/E 38.6x | P/E 38.6x; consumer-demand sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CVGI]] | 43 | 46 | near 52W highs | P/S 0.2x | unprofitable; thin liquidity |
| [[FLWS]] | 42 | 45 | passed the clean-universe and liquidity filters | P/S 0.2x | unprofitable; thin liquidity |
| [[ROLR]] | 35 | 42 | passed the clean-universe and liquidity filters | P/E 115.8x | beta 3.7; thin liquidity |

### Special Situation

- No special situation selected.

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PLOW]] | 55 | 56 | consumer margin 11%; Op margin 11% | P/E 23.2x | weak sector fit; consumer-demand sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 56 (EYE)
- **Highest Quality Score**: PLOW
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-27
