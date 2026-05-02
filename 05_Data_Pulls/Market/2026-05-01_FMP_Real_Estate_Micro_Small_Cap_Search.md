---
title: "Real Estate Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-05-01"
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
| [[Real Estate]] | Real Estate | 78 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Small | [[TWO]] | 66 | 56 | P/B 0.8x; Op margin 57% | P/S 1.7x | unprofitable; rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[SILA]] | 62 | 47 | P/B 1.3x; Op margin 35% | P/E 50.4x | P/E 50.4x; P/S 8.5x |
| [[Real Estate]] | Small | [[XHR]] | 61 | 47 | Op margin 10%; near 52W highs | P/E 24.0x | rate-sensitive balance sheet |
| [[Real Estate]] | Special | [[PEB]] | 60 | 49 | P/B 0.7x; near 52W highs | P/S 1.1x | unprofitable; rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[RMAX]] | 56 | 52 | P/B 0.5x; Op margin 16% | P/E 26.6x | P/E 26.6x; rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[NLOP]] | 55 | 49 | P/B 0.7x; Op margin 29% | P/S 1.6x | unprofitable; thin liquidity |
| [[Real Estate]] | Micro | [[NHP]] | 54 | 49 | P/B 0.6x; near 52W highs | P/S 0.6x | unprofitable; rate-sensitive balance sheet |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Large | $131.9B | [[PLD]] | P/E 35.4x | 1.8x sector ceiling | 49 | P/E 35.4x vs ~20x sector ceiling; quality score 49 | P/E 35.4x; P/S 14.7x |
| [[Real Estate]] | Large | $107.1B | [[EQIX]] | P/E 75.1x | 3.8x sector ceiling | 52 | P/E 75.1x vs ~20x sector ceiling; quality score 52 | P/E 75.1x; P/S 11.3x |
| [[Real Estate]] | Mid | $9.6B | [[AHR]] | P/E 119.4x | 6.0x sector ceiling | 36 | P/E 119.4x vs ~20x sector ceiling; quality score 36 | P/E 119.4x; rate-sensitive balance sheet |
| [[Real Estate]] | Large | $153.2B | [[WELL]] | P/E 107.9x | 5.4x sector ceiling | 43 | P/E 107.9x vs ~20x sector ceiling; quality score 43 | P/E 107.9x; P/S 13.2x |

## Real Estate Research Picks

- **Sector Lens**: property and mortgage REIT fit with book-value and rate-sensitivity bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[TWO]] | 66 | 56 | P/B 0.8x; Op margin 57% | P/S 1.7x | unprofitable; rate-sensitive balance sheet |
| [[SILA]] | 62 | 47 | P/B 1.3x; Op margin 35% | P/E 50.4x | P/E 50.4x; P/S 8.5x |
| [[XHR]] | 61 | 47 | Op margin 10%; near 52W highs | P/E 24.0x | rate-sensitive balance sheet |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[RMAX]] | 56 | 52 | P/B 0.5x; Op margin 16% | P/E 26.6x | P/E 26.6x; rate-sensitive balance sheet |
| [[NLOP]] | 55 | 49 | P/B 0.7x; Op margin 29% | P/S 1.6x | unprofitable; thin liquidity |
| [[NHP]] | 54 | 49 | P/B 0.6x; near 52W highs | P/S 0.6x | unprofitable; rate-sensitive balance sheet |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PEB]] | 60 | 49 | P/B 0.7x; near 52W highs | P/S 1.1x | unprofitable; rate-sensitive balance sheet |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 66 (TWO)
- **Highest Quality Score**: TWO
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-05-01
