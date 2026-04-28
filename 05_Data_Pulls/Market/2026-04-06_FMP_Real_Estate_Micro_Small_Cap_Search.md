---
title: "Real Estate Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-06"
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
| [[Real Estate]] | Real Estate | 13 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Small | [[DX]] | 71 | 70 | P/B 0.8x | P/E 6.4x | rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[ORC]] | 65 | 72 | P/B 0.9x; Op margin 16% | P/E 7.5x | rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[PMT]] | 64 | 70 | P/B 0.6x; Op margin 74% | P/E 8.2x | rate-sensitive balance sheet |
| [[Real Estate]] | Special | [[MFA]] | 62 | 65 | P/B 0.6x; Op margin 63% | P/E 5.8x | thin liquidity; rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[SVC]] | 45 | 47 | P/B 0.3x; Op margin 11% | P/S 0.1x | unprofitable; rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[ELME]] | 43 | 46 | P/B 0.8x | P/B 0.8x | thin liquidity; rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[LODE]] | 33 | 20 | passed the clean-universe and liquidity filters | P/S 83.7x | unprofitable; thin liquidity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Large | $37.8B | [[CCI]] | P/E 84.8x | 4.2x sector ceiling | 47 | P/E 84.8x vs ~20x sector ceiling; quality score 47 | P/E 84.8x; P/S 8.9x |
| [[Real Estate]] | Large | $57.8B | [[O]] | P/E 53.0x | 2.6x sector ceiling | 51 | P/E 53.0x vs ~20x sector ceiling; quality score 51 | P/E 53.0x; P/S 10.1x |
| [[Real Estate]] | Large | $82.2B | [[AMT]] | P/E 32.6x | 1.6x sector ceiling | 59 | P/E 32.6x vs ~20x sector ceiling | P/E 32.6x; rate-sensitive balance sheet |

## Real Estate Research Picks

- **Sector Lens**: property and mortgage REIT fit with book-value and rate-sensitivity bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[DX]] | 71 | 70 | P/B 0.8x | P/E 6.4x | rate-sensitive balance sheet |
| [[ORC]] | 65 | 72 | P/B 0.9x; Op margin 16% | P/E 7.5x | rate-sensitive balance sheet |
| [[PMT]] | 64 | 70 | P/B 0.6x; Op margin 74% | P/E 8.2x | rate-sensitive balance sheet |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SVC]] | 45 | 47 | P/B 0.3x; Op margin 11% | P/S 0.1x | unprofitable; rate-sensitive balance sheet |
| [[ELME]] | 43 | 46 | P/B 0.8x | P/B 0.8x | thin liquidity; rate-sensitive balance sheet |
| [[LODE]] | 33 | 20 | passed the clean-universe and liquidity filters | P/S 83.7x | unprofitable; thin liquidity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[MFA]] | 62 | 65 | P/B 0.6x; Op margin 63% | P/E 5.8x | thin liquidity; rate-sensitive balance sheet |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 71 (DX)
- **Highest Quality Score**: ORC
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-06
