---
title: "Energy Micro/Small Cap Search - FMP"
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
| [[Energy]] | Energy | 58 | 0 | 0 | 2 | 2 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Energy]] | Small | [[REPX]] | 82 | 79 | margin 41%; Op margin 35% | P/E 5.1x | commodity-price sensitivity |
| [[Energy]] | Small | [[PNRG]] | 73 | 63 | margin 13%; Op margin 17% | P/E 16.1x | commodity-price sensitivity |
| [[Energy]] | Small | [[AESI]] | 65 | 47 | strong liquidity | P/S 1.3x | unprofitable; commodity-price sensitivity |
| [[Energy]] | Special | [[KOS]] | 64 | 40 | near 52W highs; strong liquidity | P/S 1.1x | unprofitable; commodity-price sensitivity |
| [[Energy]] | Micro | [[AMPY]] | 64 | 68 | margin 17%; near 52W highs | P/E 5.7x | commodity-price sensitivity |
| [[Energy]] | Micro | [[INR]] | 63 | 59 | passed the clean-universe and liquidity filters | P/E 11.1x | commodity-price sensitivity |
| [[Energy]] | Micro | [[BATL]] | 60 | 56 | strong liquidity | P/E 5.8x | commodity-price sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Energy]] | Small | $1.7B | [[PUMP]] | P/E 1782.8x | 71.3x sector ceiling | 31 | P/E 1782.8x vs ~25x sector ceiling; quality score 31 | P/E 1782.8x; commodity-price sensitivity |
| [[Energy]] | Mid | $8.2B | [[CHRD]] | P/E 185.3x | 7.4x sector ceiling | 34 | P/E 185.3x vs ~25x sector ceiling; quality score 34 | P/E 185.3x; commodity-price sensitivity |
| [[Energy]] | Small | $1.5B | [[RES]] | P/E 45.7x | 1.8x sector ceiling | 35 | P/E 45.7x vs ~25x sector ceiling; quality score 35 | P/E 45.7x; commodity-price sensitivity |
| [[Energy]] | Large | $90.8B | [[WMB]] | P/E 34.7x | 1.4x sector ceiling | 57 | P/E 34.7x vs ~25x sector ceiling | P/E 34.7x; commodity-price sensitivity |

## Energy Research Picks

- **Sector Lens**: oil/gas/energy-services fit with commodity-linked value and margin bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[REPX]] | 82 | 79 | margin 41%; Op margin 35% | P/E 5.1x | commodity-price sensitivity |
| [[PNRG]] | 73 | 63 | margin 13%; Op margin 17% | P/E 16.1x | commodity-price sensitivity |
| [[AESI]] | 65 | 47 | strong liquidity | P/S 1.3x | unprofitable; commodity-price sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AMPY]] | 64 | 68 | margin 17%; near 52W highs | P/E 5.7x | commodity-price sensitivity |
| [[INR]] | 63 | 59 | passed the clean-universe and liquidity filters | P/E 11.1x | commodity-price sensitivity |
| [[BATL]] | 60 | 56 | strong liquidity | P/E 5.8x | commodity-price sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[KOS]] | 64 | 40 | near 52W highs; strong liquidity | P/S 1.1x | unprofitable; commodity-price sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 82 (REPX)
- **Highest Quality Score**: REPX
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-07
