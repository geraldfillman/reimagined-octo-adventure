---
title: "Real Estate Micro/Small Cap Search - FMP"
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
| [[Real Estate]] | Real Estate | 74 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Small | [[LTC]] | 71 | 71 | ROE 12%; Op margin 48% | P/E 15.1x | rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[VRE]] | 69 | 51 | Op margin 15%; near 52W highs | P/E 24.7x | rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[REFI]] | 66 | 76 | P/B 0.8x; Op margin 14% | P/E 7.1x | thin liquidity; rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[NTST]] | 61 | 46 | Op margin 35%; near 52W highs | P/E 179.7x | P/E 179.7x; P/S 8.3x |
| [[Real Estate]] | Micro | [[RMAX]] | 60 | 52 | P/B 0.5x; Op margin 16% | P/E 27.8x | P/E 27.8x; rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[NLOP]] | 57 | 49 | P/B 0.7x; Op margin 29% | P/S 1.6x | unprofitable; rate-sensitive balance sheet |
| [[Real Estate]] | Special | [[NHP]] | 57 | 49 | P/B 0.6x; near 52W highs | P/S 0.7x | unprofitable; rate-sensitive balance sheet |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Large | $131.9B | [[PLD]] | P/E 35.5x | 1.8x sector ceiling | 49 | P/E 35.5x vs ~20x sector ceiling; quality score 49 | P/E 35.5x; P/S 14.7x |
| [[Real Estate]] | Mid | $9.7B | [[AHR]] | P/E 119.7x | 6.0x sector ceiling | 36 | P/E 119.7x vs ~20x sector ceiling; quality score 36 | P/E 119.7x; rate-sensitive balance sheet |
| [[Real Estate]] | Large | $150.4B | [[WELL]] | P/E 105.0x | 5.2x sector ceiling | 43 | P/E 105.0x vs ~20x sector ceiling; quality score 43 | P/E 105.0x; P/S 12.9x |
| [[Real Estate]] | Large | $107.5B | [[EQIX]] | P/E 79.3x | 4.0x sector ceiling | 52 | P/E 79.3x vs ~20x sector ceiling; quality score 52 | P/E 79.3x; P/S 11.6x |

## Real Estate Research Picks

- **Sector Lens**: property and mortgage REIT fit with book-value and rate-sensitivity bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[LTC]] | 71 | 71 | ROE 12%; Op margin 48% | P/E 15.1x | rate-sensitive balance sheet |
| [[VRE]] | 69 | 51 | Op margin 15%; near 52W highs | P/E 24.7x | rate-sensitive balance sheet |
| [[NTST]] | 61 | 46 | Op margin 35%; near 52W highs | P/E 179.7x | P/E 179.7x; P/S 8.3x |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[REFI]] | 66 | 76 | P/B 0.8x; Op margin 14% | P/E 7.1x | thin liquidity; rate-sensitive balance sheet |
| [[RMAX]] | 60 | 52 | P/B 0.5x; Op margin 16% | P/E 27.8x | P/E 27.8x; rate-sensitive balance sheet |
| [[NLOP]] | 57 | 49 | P/B 0.7x; Op margin 29% | P/S 1.6x | unprofitable; rate-sensitive balance sheet |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[NHP]] | 57 | 49 | P/B 0.6x; near 52W highs | P/S 0.7x | unprofitable; rate-sensitive balance sheet |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 71 (LTC)
- **Highest Quality Score**: REFI
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-29
