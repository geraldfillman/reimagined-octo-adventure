---
title: "Real Estate Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-03"
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
| [[Real Estate]] | Real Estate | 83 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Small | [[DX]] | 73 | 70 | P/B 0.8x; strong liquidity | P/E 6.3x | rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[IIPR]] | 71 | 71 | P/B 0.8x; Op margin 47% | P/E 11.9x | rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[VRE]] | 67 | 52 | Op margin 17%; near 52W highs | P/E 23.5x | rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[REFI]] | 66 | 76 | P/B 0.8x; Op margin 14% | P/E 6.4x | rate-sensitive balance sheet |
| [[Real Estate]] | Special | [[TWO]] | 62 | 47 | P/B 0.6x; Op margin 55% | P/S 1.5x | unprofitable; rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[NLOP]] | 56 | 50 | P/B 0.6x; Op margin 29% | P/S 1.5x | unprofitable; rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[SITC]] | 51 | 61 | P/B 0.8x | P/E 1.6x | rate-sensitive balance sheet |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Large | $141.2B | [[WELL]] | P/E 148.9x | 7.4x sector ceiling | 41 | P/E 148.9x vs ~20x sector ceiling; quality score 41 | P/E 148.9x; P/S 13.2x |
| [[Real Estate]] | Large | $98.3B | [[EQIX]] | P/E 72.8x | 3.6x sector ceiling | 52 | P/E 72.8x vs ~20x sector ceiling; quality score 52 | P/E 72.8x; P/S 10.6x |
| [[Real Estate]] | Mid | $9.2B | [[ADC]] | P/E 43.0x | 2.1x sector ceiling | 52 | P/E 43.0x vs ~20x sector ceiling; quality score 52 | P/E 43.0x; P/S 12.8x |
| [[Real Estate]] | Large | $124.3B | [[PLD]] | P/E 37.7x | 1.9x sector ceiling | 53 | P/E 37.7x vs ~20x sector ceiling; quality score 53 | P/E 37.7x; P/S 14.1x |

## Real Estate Research Picks

- **Sector Lens**: property and mortgage REIT fit with book-value and rate-sensitivity bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[DX]] | 73 | 70 | P/B 0.8x; strong liquidity | P/E 6.3x | rate-sensitive balance sheet |
| [[IIPR]] | 71 | 71 | P/B 0.8x; Op margin 47% | P/E 11.9x | rate-sensitive balance sheet |
| [[VRE]] | 67 | 52 | Op margin 17%; near 52W highs | P/E 23.5x | rate-sensitive balance sheet |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[REFI]] | 66 | 76 | P/B 0.8x; Op margin 14% | P/E 6.4x | rate-sensitive balance sheet |
| [[NLOP]] | 56 | 50 | P/B 0.6x; Op margin 29% | P/S 1.5x | unprofitable; rate-sensitive balance sheet |
| [[SITC]] | 51 | 61 | P/B 0.8x | P/E 1.6x | rate-sensitive balance sheet |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[TWO]] | 62 | 47 | P/B 0.6x; Op margin 55% | P/S 1.5x | unprofitable; rate-sensitive balance sheet |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 73 (DX)
- **Highest Quality Score**: REFI
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-03
