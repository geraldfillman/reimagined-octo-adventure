---
title: "Real Estate Micro/Small Cap Search - FMP"
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
| [[Real Estate]] | Real Estate | 47 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Small | [[ARI]] | 73 | 68 | P/B 0.8x; Op margin 56% | P/E 13.6x | rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[DX]] | 72 | 68 | P/B 1.0x; strong liquidity | P/E 7.6x | rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[LTC]] | 69 | 71 | ROE 12%; Op margin 46% | P/E 14.4x | rate-sensitive balance sheet |
| [[Real Estate]] | Special | [[GNL]] | 62 | 52 | P/B 1.3x; Op margin 21% | P/S 4.1x | unprofitable; rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[SVC]] | 48 | 49 | P/B 0.6x; Op margin 12% | P/S 0.2x | unprofitable; rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[RMAX]] | 48 | 44 | P/B 0.5x; Op margin 15% | P/E 452.1x | thin liquidity; P/E 452.1x |
| [[Real Estate]] | Micro | [[SITC]] | 47 | 59 | P/B 0.7x | P/E 1.4x | thin liquidity; rate-sensitive balance sheet |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Large | $153.9B | [[WELL]] | P/E 106.4x | 5.3x sector ceiling | 40 | P/E 106.4x vs ~20x sector ceiling; quality score 40 | P/E 106.4x; P/S 13.3x |
| [[Real Estate]] | Large | $135.9B | [[PLD]] | P/E 36.7x | 1.8x sector ceiling | 48 | P/E 36.7x vs ~20x sector ceiling; quality score 48 | P/E 36.7x; P/S 15.2x |
| [[Real Estate]] | Large | $110.5B | [[EQIX]] | P/E 77.3x | 3.9x sector ceiling | 53 | P/E 77.3x vs ~20x sector ceiling; quality score 53 | P/E 77.3x; P/S 11.7x |
| [[Real Estate]] | Mid | $10.1B | [[AHR]] | P/E 83.9x | 4.2x sector ceiling | 38 | P/E 83.9x vs ~20x sector ceiling; quality score 38 | P/E 83.9x; rate-sensitive balance sheet |
| [[Real Estate]] | Large | $83.2B | [[AMT]] | P/E 28.8x | 1.4x sector ceiling | 62 | P/E 28.8x vs ~20x sector ceiling | P/E 28.8x; rate-sensitive balance sheet |

## Real Estate Research Picks

- **Sector Lens**: property and mortgage REIT fit with book-value and rate-sensitivity bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[ARI]] | 73 | 68 | P/B 0.8x; Op margin 56% | P/E 13.6x | rate-sensitive balance sheet |
| [[DX]] | 72 | 68 | P/B 1.0x; strong liquidity | P/E 7.6x | rate-sensitive balance sheet |
| [[LTC]] | 69 | 71 | ROE 12%; Op margin 46% | P/E 14.4x | rate-sensitive balance sheet |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SVC]] | 48 | 49 | P/B 0.6x; Op margin 12% | P/S 0.2x | unprofitable; rate-sensitive balance sheet |
| [[RMAX]] | 48 | 44 | P/B 0.5x; Op margin 15% | P/E 452.1x | thin liquidity; P/E 452.1x |
| [[SITC]] | 47 | 59 | P/B 0.7x | P/E 1.4x | thin liquidity; rate-sensitive balance sheet |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[GNL]] | 62 | 52 | P/B 1.3x; Op margin 21% | P/S 4.1x | unprofitable; rate-sensitive balance sheet |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 73 (ARI)
- **Highest Quality Score**: LTC
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-06-23
