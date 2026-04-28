---
title: "Real Estate Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-24"
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
| [[Real Estate]] | Real Estate | 73 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Small | [[IIPR]] | 73 | 71 | P/B 0.8x; Op margin 47% | P/E 12.5x | rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[ORC]] | 67 | 69 | P/B 1.0x; Op margin 18% | P/E 10.4x | rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[SILA]] | 61 | 47 | P/B 1.3x; Op margin 35% | P/E 50.4x | P/E 50.4x; P/S 8.5x |
| [[Real Estate]] | Special | [[PEB]] | 61 | 50 | P/B 0.7x; near 52W highs | P/S 1.1x | unprofitable; rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[PINE]] | 57 | 47 | P/B 0.9x; Op margin 28% | P/S 4.4x | unprofitable; rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[NLOP]] | 56 | 50 | P/B 0.6x; Op margin 29% | P/S 1.6x | unprofitable; thin liquidity |
| [[Real Estate]] | Micro | [[RMAX]] | 54 | 57 | P/B 0.4x; Op margin 16% | P/E 19.8x | rate-sensitive balance sheet |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Large | $110.0B | [[EQIX]] | P/E 81.1x | 4.1x sector ceiling | 50 | P/E 81.1x vs ~20x sector ceiling; quality score 50 | P/E 81.1x; P/S 11.9x |
| [[Real Estate]] | Large | $132.7B | [[PLD]] | P/E 35.7x | 1.8x sector ceiling | 49 | P/E 35.7x vs ~20x sector ceiling; quality score 49 | P/E 35.7x; P/S 14.8x |
| [[Real Estate]] | Large | $145.3B | [[WELL]] | P/E 153.3x | 7.7x sector ceiling | 41 | P/E 153.3x vs ~20x sector ceiling; quality score 41 | P/E 153.3x; P/S 13.6x |
| [[Real Estate]] | Mid | $9.5B | [[AHR]] | P/E 120.3x | 6.0x sector ceiling | 36 | P/E 120.3x vs ~20x sector ceiling; quality score 36 | P/E 120.3x; rate-sensitive balance sheet |
| [[Real Estate]] | Small | $1.8B | [[DEI]] | P/E 108.4x | 5.4x sector ceiling | 43 | P/E 108.4x vs ~20x sector ceiling; quality score 43 | P/E 108.4x; rate-sensitive balance sheet |
| [[Real Estate]] | Small | $1.8B | [[VRE]] | P/E 25.2x | 1.3x sector ceiling | 53 | P/E 25.2x vs ~20x sector ceiling; quality score 53 | P/E 25.2x; rate-sensitive balance sheet |

## Real Estate Research Picks

- **Sector Lens**: property and mortgage REIT fit with book-value and rate-sensitivity bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[IIPR]] | 73 | 71 | P/B 0.8x; Op margin 47% | P/E 12.5x | rate-sensitive balance sheet |
| [[ORC]] | 67 | 69 | P/B 1.0x; Op margin 18% | P/E 10.4x | rate-sensitive balance sheet |
| [[SILA]] | 61 | 47 | P/B 1.3x; Op margin 35% | P/E 50.4x | P/E 50.4x; P/S 8.5x |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PINE]] | 57 | 47 | P/B 0.9x; Op margin 28% | P/S 4.4x | unprofitable; rate-sensitive balance sheet |
| [[NLOP]] | 56 | 50 | P/B 0.6x; Op margin 29% | P/S 1.6x | unprofitable; thin liquidity |
| [[RMAX]] | 54 | 57 | P/B 0.4x; Op margin 16% | P/E 19.8x | rate-sensitive balance sheet |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PEB]] | 61 | 50 | P/B 0.7x; near 52W highs | P/S 1.1x | unprofitable; rate-sensitive balance sheet |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 73 (IIPR)
- **Highest Quality Score**: IIPR
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-24
