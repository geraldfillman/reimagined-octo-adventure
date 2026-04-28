---
title: "Real Estate Micro/Small Cap Search - FMP"
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
| [[Real Estate]] | Real Estate | 60 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Small | [[DX]] | 72 | 70 | P/B 0.8x; strong liquidity | P/E 6.3x | rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[IIPR]] | 70 | 71 | P/B 0.8x; Op margin 47% | P/E 11.8x | rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[VRE]] | 67 | 52 | Op margin 17%; near 52W highs | P/E 23.5x | rate-sensitive balance sheet |
| [[Real Estate]] | Special | [[DRH]] | 62 | 61 | Op margin 14% | P/E 19.2x | rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[ACRE]] | 56 | 54 | P/B 0.5x; Op margin 60% | P/S 4.7x | unprofitable; thin liquidity |
| [[Real Estate]] | Micro | [[NLOP]] | 54 | 50 | P/B 0.6x; Op margin 29% | P/S 1.4x | unprofitable; thin liquidity |
| [[Real Estate]] | Micro | [[SITC]] | 50 | 61 | P/B 0.9x | P/E 1.6x | thin liquidity; rate-sensitive balance sheet |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Large | $141.0B | [[WELL]] | P/E 148.8x | 7.4x sector ceiling | 41 | P/E 148.8x vs ~20x sector ceiling; quality score 41 | P/E 148.8x; P/S 13.2x |
| [[Real Estate]] | Large | $98.9B | [[EQIX]] | P/E 73.2x | 3.7x sector ceiling | 52 | P/E 73.2x vs ~20x sector ceiling; quality score 52 | P/E 73.2x; P/S 10.7x |
| [[Real Estate]] | Mid | $9.2B | [[ADC]] | P/E 43.0x | 2.2x sector ceiling | 52 | P/E 43.0x vs ~20x sector ceiling; quality score 52 | P/E 43.0x; P/S 12.8x |
| [[Real Estate]] | Large | $123.3B | [[PLD]] | P/E 37.4x | 1.9x sector ceiling | 53 | P/E 37.4x vs ~20x sector ceiling; quality score 53 | P/E 37.4x; P/S 14.0x |

## Real Estate Research Picks

- **Sector Lens**: property and mortgage REIT fit with book-value and rate-sensitivity bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[DX]] | 72 | 70 | P/B 0.8x; strong liquidity | P/E 6.3x | rate-sensitive balance sheet |
| [[IIPR]] | 70 | 71 | P/B 0.8x; Op margin 47% | P/E 11.8x | rate-sensitive balance sheet |
| [[VRE]] | 67 | 52 | Op margin 17%; near 52W highs | P/E 23.5x | rate-sensitive balance sheet |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[ACRE]] | 56 | 54 | P/B 0.5x; Op margin 60% | P/S 4.7x | unprofitable; thin liquidity |
| [[NLOP]] | 54 | 50 | P/B 0.6x; Op margin 29% | P/S 1.4x | unprofitable; thin liquidity |
| [[SITC]] | 50 | 61 | P/B 0.9x | P/E 1.6x | thin liquidity; rate-sensitive balance sheet |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[DRH]] | 62 | 61 | Op margin 14% | P/E 19.2x | rate-sensitive balance sheet |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 72 (DX)
- **Highest Quality Score**: IIPR
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-07
