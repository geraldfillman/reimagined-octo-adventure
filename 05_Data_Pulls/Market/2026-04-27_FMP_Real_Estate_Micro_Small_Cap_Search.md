---
title: "Real Estate Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-27"
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
| [[Real Estate]] | Real Estate | 18 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Small | [[ARI]] | 68 | 69 | P/B 0.8x; Op margin 65% | P/E 12.2x | thin liquidity; rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[EFC]] | 68 | 72 | P/B 0.7x; Op margin 63% | P/E 9.0x | rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[ORC]] | 64 | 71 | P/B 1.0x; Op margin 42% | P/E 10.4x | rate-sensitive balance sheet |
| [[Real Estate]] | Special | [[IVR]] | 62 | 69 | P/B 0.7x | P/E 5.4x | rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[RMAX]] | 60 | 54 | P/B 0.4x; Op margin 16% | P/E 24.3x | rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[SVC]] | 43 | 47 | P/B 0.4x; Op margin 11% | P/S 0.1x | unprofitable; thin liquidity |
| [[Real Estate]] | Micro | [[LODE]] | 33 | 20 | passed the clean-universe and liquidity filters | P/S 77.5x | unprofitable; thin liquidity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Large | $131.6B | [[PLD]] | P/E 35.4x | 1.8x sector ceiling | 49 | P/E 35.4x vs ~20x sector ceiling; quality score 49 | P/E 35.4x; P/S 14.7x |
| [[Real Estate]] | Large | $67.7B | [[DLR]] | P/E 49.4x | 2.5x sector ceiling | 45 | P/E 49.4x vs ~20x sector ceiling; quality score 45 | P/E 49.4x; P/S 10.6x |
| [[Real Estate]] | Large | $147.0B | [[WELL]] | P/E 154.5x | 7.7x sector ceiling | 41 | P/E 154.5x vs ~20x sector ceiling; quality score 41 | P/E 154.5x; P/S 13.8x |
| [[Real Estate]] | Mid | $8.3B | [[REXR]] | P/E 35.3x | 1.8x sector ceiling | 52 | P/E 35.3x vs ~20x sector ceiling; quality score 52 | P/E 35.3x; P/S 8.4x |
| [[Real Estate]] | Mid | $9.2B | [[BXP]] | P/E 33.2x | 1.7x sector ceiling | 51 | P/E 33.2x vs ~20x sector ceiling; quality score 51 | P/E 33.2x; rate-sensitive balance sheet |
| [[Real Estate]] | Large | $82.5B | [[AMT]] | P/E 32.8x | 1.6x sector ceiling | 58 | P/E 32.8x vs ~20x sector ceiling | P/E 32.8x; rate-sensitive balance sheet |

## Real Estate Research Picks

- **Sector Lens**: property and mortgage REIT fit with book-value and rate-sensitivity bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[ARI]] | 68 | 69 | P/B 0.8x; Op margin 65% | P/E 12.2x | thin liquidity; rate-sensitive balance sheet |
| [[EFC]] | 68 | 72 | P/B 0.7x; Op margin 63% | P/E 9.0x | rate-sensitive balance sheet |
| [[ORC]] | 64 | 71 | P/B 1.0x; Op margin 42% | P/E 10.4x | rate-sensitive balance sheet |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[RMAX]] | 60 | 54 | P/B 0.4x; Op margin 16% | P/E 24.3x | rate-sensitive balance sheet |
| [[SVC]] | 43 | 47 | P/B 0.4x; Op margin 11% | P/S 0.1x | unprofitable; thin liquidity |
| [[LODE]] | 33 | 20 | passed the clean-universe and liquidity filters | P/S 77.5x | unprofitable; thin liquidity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[IVR]] | 62 | 69 | P/B 0.7x | P/E 5.4x | rate-sensitive balance sheet |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 68 (ARI)
- **Highest Quality Score**: EFC
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-27
