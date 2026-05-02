---
title: "Energy Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-06"
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
| [[Energy]] | Energy | 18 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Energy]] | Small | [[AESI]] | 64 | 47 | strong liquidity | P/S 1.3x | unprofitable; commodity-price sensitivity |
| [[Energy]] | Small | [[FLOC]] | 64 | 64 | Op margin 20% | P/E 14.1x | commodity-price sensitivity |
| [[Energy]] | Small | [[KOS]] | 61 | 40 | near 52W highs | P/S 1.1x | unprofitable; commodity-price sensitivity |
| [[Energy]] | Micro | [[BATL]] | 58 | 56 | passed the clean-universe and liquidity filters | P/E 5.6x | commodity-price sensitivity |
| [[Energy]] | Special | [[SOC]] | 57 | 41 | passed the clean-universe and liquidity filters | P/B 2.7x | commodity-price sensitivity |
| [[Energy]] | Micro | [[NUAI]] | 45 | 22 | passed the clean-universe and liquidity filters | P/S 274.4x | unprofitable; thin liquidity |
| [[Energy]] | Micro | [[AMTX]] | 43 | 40 | near 52W highs | P/S 1.1x | unprofitable; target below spot |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Energy]] | Large | $88.8B | [[WMB]] | P/E 33.9x | 1.4x sector ceiling | 58 | P/E 33.9x vs ~25x sector ceiling | P/E 33.9x; commodity-price sensitivity |

## Energy Research Picks

- **Sector Lens**: oil/gas/energy-services fit with commodity-linked value and margin bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AESI]] | 64 | 47 | strong liquidity | P/S 1.3x | unprofitable; commodity-price sensitivity |
| [[FLOC]] | 64 | 64 | Op margin 20% | P/E 14.1x | commodity-price sensitivity |
| [[KOS]] | 61 | 40 | near 52W highs | P/S 1.1x | unprofitable; commodity-price sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BATL]] | 58 | 56 | passed the clean-universe and liquidity filters | P/E 5.6x | commodity-price sensitivity |
| [[NUAI]] | 45 | 22 | passed the clean-universe and liquidity filters | P/S 274.4x | unprofitable; thin liquidity |
| [[AMTX]] | 43 | 40 | near 52W highs | P/S 1.1x | unprofitable; target below spot |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SOC]] | 57 | 41 | passed the clean-universe and liquidity filters | P/B 2.7x | commodity-price sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 64 (AESI)
- **Highest Quality Score**: FLOC
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-06
