---
title: "Consumer Discretionary Micro/Small Cap Search - FMP"
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
| [[Consumer Discretionary]] | Consumer Cyclical | 81 | 0 | 0 | 0 | 2 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Discretionary]] | Small | [[CRI]] | 64 | 53 | near 52W highs; strong liquidity | P/E 16.6x | target below spot; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Small | [[BJRI]] | 60 | 52 | near 52W highs; strong liquidity | P/E 26.5x | consumer-demand sensitivity |
| [[Consumer Discretionary]] | Micro | [[JACK]] | 52 | 58 | consumer margin 13%; Op margin 13% | P/E 2.7x | consumer-demand sensitivity |
| [[Consumer Discretionary]] | Micro | [[XPOF]] | 51 | 63 | consumer margin 23%; Op margin 23% | P/S 0.8x | unprofitable; thin liquidity |
| [[Consumer Discretionary]] | Small | [[CBRL]] | 50 | 35 | passed the clean-universe and liquidity filters | P/E 40.0x | P/E 40.0x; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Micro | [[CHPT]] | 48 | 45 | passed the clean-universe and liquidity filters | P/S 0.4x | unprofitable; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Special | [[PTLO]] | 44 | 51 | passed the clean-universe and liquidity filters | P/E 17.9x | thin liquidity; consumer-demand sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Discretionary]] | Small | $1.8B | [[FIGS]] | P/E 45.2x | 1.8x sector ceiling | 49 | P/E 45.2x vs ~25x sector ceiling; quality score 49 | P/E 45.2x; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Large | $181.9B | [[TJX]] | P/E 31.9x | 1.3x sector ceiling | 53 | P/E 31.9x vs ~25x sector ceiling; quality score 53 | P/E 31.9x; consumer-demand sensitivity |

## Consumer Discretionary Research Picks

- **Sector Lens**: retail/leisure/autos fit with demand-sensitive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CRI]] | 64 | 53 | near 52W highs; strong liquidity | P/E 16.6x | target below spot; consumer-demand sensitivity |
| [[BJRI]] | 60 | 52 | near 52W highs; strong liquidity | P/E 26.5x | consumer-demand sensitivity |
| [[CBRL]] | 50 | 35 | passed the clean-universe and liquidity filters | P/E 40.0x | P/E 40.0x; consumer-demand sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[JACK]] | 52 | 58 | consumer margin 13%; Op margin 13% | P/E 2.7x | consumer-demand sensitivity |
| [[XPOF]] | 51 | 63 | consumer margin 23%; Op margin 23% | P/S 0.8x | unprofitable; thin liquidity |
| [[CHPT]] | 48 | 45 | passed the clean-universe and liquidity filters | P/S 0.4x | unprofitable; consumer-demand sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PTLO]] | 44 | 51 | passed the clean-universe and liquidity filters | P/E 17.9x | thin liquidity; consumer-demand sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 64 (CRI)
- **Highest Quality Score**: XPOF
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-06-23
