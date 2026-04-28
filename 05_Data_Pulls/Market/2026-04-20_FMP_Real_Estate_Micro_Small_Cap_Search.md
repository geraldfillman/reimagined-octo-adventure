---
title: "Real Estate Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-20"
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
| [[Real Estate]] | Real Estate | 71 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Small | [[DX]] | 73 | 66 | P/B 1.1x; strong liquidity | P/E 11.3x | rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[LTC]] | 73 | 70 | ROE 12%; Op margin 48% | P/E 15.6x | rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[IIPR]] | 72 | 71 | P/B 0.8x; Op margin 47% | P/E 12.5x | rate-sensitive balance sheet |
| [[Real Estate]] | Special | [[PEB]] | 62 | 50 | P/B 0.7x; near 52W highs | P/S 1.1x | unprofitable; rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[MITT]] | 59 | 71 | P/B 0.4x; Op margin 97% | P/E 5.1x | rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[AOMR]] | 59 | 70 | P/B 0.8x | P/E 5.2x | thin liquidity; rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[ACRE]] | 58 | 52 | P/B 0.6x; Op margin 60% | P/S 5.2x | unprofitable; rate-sensitive balance sheet |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Large | $135.3B | [[PLD]] | P/E 36.4x | 1.8x sector ceiling | 48 | P/E 36.4x vs ~20x sector ceiling; quality score 48 | P/E 36.4x; P/S 15.1x |
| [[Real Estate]] | Mid | $9.5B | [[ADC]] | P/E 44.6x | 2.2x sector ceiling | 51 | P/E 44.6x vs ~20x sector ceiling; quality score 51 | P/E 44.6x; P/S 13.3x |
| [[Real Estate]] | Large | $146.9B | [[WELL]] | P/E 155.0x | 7.7x sector ceiling | 41 | P/E 155.0x vs ~20x sector ceiling; quality score 41 | P/E 155.0x; P/S 13.8x |
| [[Real Estate]] | Large | $85.0B | [[AMT]] | P/E 33.8x | 1.7x sector ceiling | 56 | P/E 33.8x vs ~20x sector ceiling | P/E 33.8x; rate-sensitive balance sheet |

## Real Estate Research Picks

- **Sector Lens**: property and mortgage REIT fit with book-value and rate-sensitivity bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[DX]] | 73 | 66 | P/B 1.1x; strong liquidity | P/E 11.3x | rate-sensitive balance sheet |
| [[LTC]] | 73 | 70 | ROE 12%; Op margin 48% | P/E 15.6x | rate-sensitive balance sheet |
| [[IIPR]] | 72 | 71 | P/B 0.8x; Op margin 47% | P/E 12.5x | rate-sensitive balance sheet |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[MITT]] | 59 | 71 | P/B 0.4x; Op margin 97% | P/E 5.1x | rate-sensitive balance sheet |
| [[AOMR]] | 59 | 70 | P/B 0.8x | P/E 5.2x | thin liquidity; rate-sensitive balance sheet |
| [[ACRE]] | 58 | 52 | P/B 0.6x; Op margin 60% | P/S 5.2x | unprofitable; rate-sensitive balance sheet |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PEB]] | 62 | 50 | P/B 0.7x; near 52W highs | P/S 1.1x | unprofitable; rate-sensitive balance sheet |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 73 (DX)
- **Highest Quality Score**: IIPR
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-20
