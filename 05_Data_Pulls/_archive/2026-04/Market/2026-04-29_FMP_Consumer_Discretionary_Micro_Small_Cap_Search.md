---
title: "Consumer Discretionary Micro/Small Cap Search - FMP"
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
| [[Consumer Discretionary]] | Consumer Cyclical | 118 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Discretionary]] | Small | [[PRKS]] | 71 | 75 | consumer margin 22%; 57% target upside | P/E 10.9x | consumer-demand sensitivity |
| [[Consumer Discretionary]] | Small | [[EYE]] | 63 | 42 | strong liquidity | P/E 64.5x | P/E 64.5x; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Reserve | [[BLBD]] | 62 | 64 | consumer margin 11%; Op margin 11% | P/E 15.4x | weak sector fit; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Reserve | [[KSS]] | 58 | 61 | strong liquidity | P/E 6.1x | weak sector fit; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Reserve | [[LGIH]] | 54 | 52 | strong liquidity | P/E 16.0x | weak sector fit; beta 1.9 |
| [[Consumer Discretionary]] | Micro | [[JACK]] | 50 | 52 | passed the clean-universe and liquidity filters | P/S 0.2x | unprofitable; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Micro | [[ROLR]] | 39 | 42 | passed the clean-universe and liquidity filters | P/E 121.3x | beta 3.7; P/E 121.3x |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Discretionary]] | Mega | $2792.9B | [[AMZN]] | P/E 35.8x | 1.4x sector ceiling | 56 | P/E 35.8x vs ~25x sector ceiling | P/E 35.8x; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Large | $174.6B | [[TJX]] | P/E 32.2x | 1.3x sector ceiling | 53 | P/E 32.2x vs ~25x sector ceiling; quality score 53 | P/E 32.2x; consumer-demand sensitivity |

## Consumer Discretionary Research Picks

- **Sector Lens**: retail/leisure/autos fit with demand-sensitive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PRKS]] | 71 | 75 | consumer margin 22%; 57% target upside | P/E 10.9x | consumer-demand sensitivity |
| [[EYE]] | 63 | 42 | strong liquidity | P/E 64.5x | P/E 64.5x; consumer-demand sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[JACK]] | 50 | 52 | passed the clean-universe and liquidity filters | P/S 0.2x | unprofitable; consumer-demand sensitivity |
| [[ROLR]] | 39 | 42 | passed the clean-universe and liquidity filters | P/E 121.3x | beta 3.7; P/E 121.3x |

### Special Situation

- No special situation selected.

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BLBD]] | 62 | 64 | consumer margin 11%; Op margin 11% | P/E 15.4x | weak sector fit; consumer-demand sensitivity |
| [[KSS]] | 58 | 61 | strong liquidity | P/E 6.1x | weak sector fit; consumer-demand sensitivity |
| [[LGIH]] | 54 | 52 | strong liquidity | P/E 16.0x | weak sector fit; beta 1.9 |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 71 (PRKS)
- **Highest Quality Score**: PRKS
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-29
