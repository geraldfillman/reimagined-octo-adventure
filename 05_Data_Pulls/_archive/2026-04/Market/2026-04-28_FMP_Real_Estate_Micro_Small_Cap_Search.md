---
title: "Real Estate Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-28"
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
| [[Real Estate]] | Real Estate | 75 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Small | [[EFC]] | 72 | 72 | P/B 0.7x; Op margin 63% | P/E 9.0x | rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[IIPR]] | 72 | 70 | P/B 0.8x; Op margin 47% | P/E 13.2x | rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[SILA]] | 61 | 47 | P/B 1.3x; Op margin 35% | P/E 50.4x | P/E 50.4x; P/S 8.5x |
| [[Real Estate]] | Micro | [[RMAX]] | 60 | 54 | P/B 0.4x; Op margin 16% | P/E 24.3x | rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[STRS]] | 59 | 47 | P/B 1.2x; near 52W highs | P/E 20.1x | rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[MITT]] | 59 | 71 | P/B 0.5x; Op margin 97% | P/E 5.2x | thin liquidity; rate-sensitive balance sheet |
| [[Real Estate]] | Special | [[NLOP]] | 55 | 49 | P/B 0.7x; Op margin 29% | P/S 1.6x | unprofitable; thin liquidity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Large | $107.5B | [[EQIX]] | P/E 79.3x | 4.0x sector ceiling | 51 | P/E 79.3x vs ~20x sector ceiling; quality score 51 | P/E 79.3x; P/S 11.6x |
| [[Real Estate]] | Large | $131.6B | [[PLD]] | P/E 35.4x | 1.8x sector ceiling | 50 | P/E 35.4x vs ~20x sector ceiling; quality score 50 | P/E 35.4x; P/S 14.7x |
| [[Real Estate]] | Large | $147.0B | [[WELL]] | P/E 154.5x | 7.7x sector ceiling | 41 | P/E 154.5x vs ~20x sector ceiling; quality score 41 | P/E 154.5x; P/S 13.8x |
| [[Real Estate]] | Mid | $9.7B | [[AHR]] | P/E 119.7x | 6.0x sector ceiling | 36 | P/E 119.7x vs ~20x sector ceiling; quality score 36 | P/E 119.7x; rate-sensitive balance sheet |
| [[Real Estate]] | Small | $1.8B | [[SHO]] | P/E 74.6x | 3.7x sector ceiling | 35 | P/E 74.6x vs ~20x sector ceiling; quality score 35 | P/E 74.6x; rate-sensitive balance sheet |

## Real Estate Research Picks

- **Sector Lens**: property and mortgage REIT fit with book-value and rate-sensitivity bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[EFC]] | 72 | 72 | P/B 0.7x; Op margin 63% | P/E 9.0x | rate-sensitive balance sheet |
| [[IIPR]] | 72 | 70 | P/B 0.8x; Op margin 47% | P/E 13.2x | rate-sensitive balance sheet |
| [[SILA]] | 61 | 47 | P/B 1.3x; Op margin 35% | P/E 50.4x | P/E 50.4x; P/S 8.5x |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[RMAX]] | 60 | 54 | P/B 0.4x; Op margin 16% | P/E 24.3x | rate-sensitive balance sheet |
| [[STRS]] | 59 | 47 | P/B 1.2x; near 52W highs | P/E 20.1x | rate-sensitive balance sheet |
| [[MITT]] | 59 | 71 | P/B 0.5x; Op margin 97% | P/E 5.2x | thin liquidity; rate-sensitive balance sheet |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[NLOP]] | 55 | 49 | P/B 0.7x; Op margin 29% | P/S 1.6x | unprofitable; thin liquidity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 72 (EFC)
- **Highest Quality Score**: EFC
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-28
