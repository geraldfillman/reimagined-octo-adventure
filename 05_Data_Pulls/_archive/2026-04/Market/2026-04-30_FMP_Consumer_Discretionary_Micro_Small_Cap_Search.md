---
title: "Consumer Discretionary Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-30"
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
| [[Consumer Discretionary]] | Consumer Cyclical | 115 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Discretionary]] | Small | [[CRI]] | 64 | 54 | strong liquidity | P/E 14.1x | target below spot; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Small | [[RVLV]] | 64 | 53 | strong liquidity | P/E 29.8x | beta 1.8; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Small | [[EYE]] | 62 | 42 | strong liquidity | P/E 60.0x | P/E 60.0x; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Special | [[AIN]] | 57 | 46 | strong liquidity | P/S 1.4x | unprofitable; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Micro | [[RCKY]] | 56 | 58 | passed the clean-universe and liquidity filters | P/E 14.7x | beta 2.6; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Micro | [[JACK]] | 48 | 52 | passed the clean-universe and liquidity filters | P/S 0.2x | unprofitable; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Micro | [[ROLR]] | 40 | 42 | passed the clean-universe and liquidity filters | P/E 115.0x | beta 3.7; P/E 115.0x |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Discretionary]] | Mid | $9.6B | [[BROS]] | P/E 88.1x | 3.5x sector ceiling | 47 | P/E 88.1x vs ~25x sector ceiling; quality score 47 | beta 2.5; P/E 88.1x |
| [[Consumer Discretionary]] | Large | $173.3B | [[TJX]] | P/E 32.0x | 1.3x sector ceiling | 53 | P/E 32.0x vs ~25x sector ceiling; quality score 53 | P/E 32.0x; consumer-demand sensitivity |

## Consumer Discretionary Research Picks

- **Sector Lens**: retail/leisure/autos fit with demand-sensitive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CRI]] | 64 | 54 | strong liquidity | P/E 14.1x | target below spot; consumer-demand sensitivity |
| [[RVLV]] | 64 | 53 | strong liquidity | P/E 29.8x | beta 1.8; consumer-demand sensitivity |
| [[EYE]] | 62 | 42 | strong liquidity | P/E 60.0x | P/E 60.0x; consumer-demand sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[RCKY]] | 56 | 58 | passed the clean-universe and liquidity filters | P/E 14.7x | beta 2.6; consumer-demand sensitivity |
| [[JACK]] | 48 | 52 | passed the clean-universe and liquidity filters | P/S 0.2x | unprofitable; consumer-demand sensitivity |
| [[ROLR]] | 40 | 42 | passed the clean-universe and liquidity filters | P/E 115.0x | beta 3.7; P/E 115.0x |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AIN]] | 57 | 46 | strong liquidity | P/S 1.4x | unprofitable; consumer-demand sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 64 (CRI)
- **Highest Quality Score**: RCKY
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-30
