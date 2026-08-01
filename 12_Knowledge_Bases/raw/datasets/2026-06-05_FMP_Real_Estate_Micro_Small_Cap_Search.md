---
title: "Real Estate Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-06-05"
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
| [[Real Estate]] | Real Estate | 67 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Small | [[DX]] | 70 | 66 | P/B 1.0x; strong liquidity | P/E 10.7x | rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[LTC]] | 70 | 71 | ROE 12%; Op margin 46% | P/E 14.6x | rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[VRE]] | 69 | 51 | Op margin 15%; near 52W highs | P/E 24.7x | rate-sensitive balance sheet |
| [[Real Estate]] | Special | [[GNL]] | 64 | 52 | P/B 1.3x; Op margin 21% | P/S 4.2x | unprofitable; rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[NHP]] | 56 | 49 | P/B 0.7x; near 52W highs | P/S 0.7x | unprofitable; rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[ACRE]] | 55 | 50 | P/B 0.6x; Op margin 14% | P/S 3.5x | unprofitable; thin liquidity |
| [[Real Estate]] | Micro | [[SVC]] | 55 | 57 | P/B 0.5x; 122% target upside | P/S 0.2x | unprofitable; rate-sensitive balance sheet |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Large | $135.4B | [[PLD]] | P/E 36.4x | 1.8x sector ceiling | 48 | P/E 36.4x vs ~20x sector ceiling; quality score 48 | P/E 36.4x; P/S 15.1x |
| [[Real Estate]] | Large | $107.1B | [[EQIX]] | P/E 75.1x | 3.8x sector ceiling | 53 | P/E 75.1x vs ~20x sector ceiling; quality score 53 | P/E 75.1x; P/S 11.3x |
| [[Real Estate]] | Large | $148.1B | [[WELL]] | P/E 104.3x | 5.2x sector ceiling | 45 | P/E 104.3x vs ~20x sector ceiling; quality score 45 | P/E 104.3x; P/S 12.8x |
| [[Real Estate]] | Mid | $9.9B | [[AHR]] | P/E 89.2x | 4.5x sector ceiling | 39 | P/E 89.2x vs ~20x sector ceiling; quality score 39 | P/E 89.2x; rate-sensitive balance sheet |
| [[Real Estate]] | Mid | $9.9B | [[BXP]] | P/E 31.1x | 1.6x sector ceiling | 52 | P/E 31.1x vs ~20x sector ceiling; quality score 52 | P/E 31.1x; rate-sensitive balance sheet |

## Real Estate Research Picks

- **Sector Lens**: property and mortgage REIT fit with book-value and rate-sensitivity bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[DX]] | 70 | 66 | P/B 1.0x; strong liquidity | P/E 10.7x | rate-sensitive balance sheet |
| [[LTC]] | 70 | 71 | ROE 12%; Op margin 46% | P/E 14.6x | rate-sensitive balance sheet |
| [[VRE]] | 69 | 51 | Op margin 15%; near 52W highs | P/E 24.7x | rate-sensitive balance sheet |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[NHP]] | 56 | 49 | P/B 0.7x; near 52W highs | P/S 0.7x | unprofitable; rate-sensitive balance sheet |
| [[ACRE]] | 55 | 50 | P/B 0.6x; Op margin 14% | P/S 3.5x | unprofitable; thin liquidity |
| [[SVC]] | 55 | 57 | P/B 0.5x; 122% target upside | P/S 0.2x | unprofitable; rate-sensitive balance sheet |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[GNL]] | 64 | 52 | P/B 1.3x; Op margin 21% | P/S 4.2x | unprofitable; rate-sensitive balance sheet |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 70 (DX)
- **Highest Quality Score**: LTC
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-06-05
