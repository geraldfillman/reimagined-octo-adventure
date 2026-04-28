---
title: "Utilities Micro/Small Cap Search - FMP"
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
- **Fundamentals Coverage**: 5 cached/live FMP or SEC company-facts profiles across selected names
- **Taxonomy Note**: [[Aerospace & Defense]] remains inside [[Industrials]] in FMP sector data.

## Sector Coverage

| Vault Sector | Source Sector | Raw | Funds/ETF | ADR/ADS | LP/Trust | Dupes | Fund | Eligible | Final |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Utilities]] | Utilities | 6 | 0 | 0 | 1 | 0 | 5 | 5 | 5 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Utilities]] | Micro | [[PCYO]] | 56 | 68 | Op margin 35% | P/E 19.1x | P/S 8.9x; capital-intensity risk |
| [[Utilities]] | Small | [[WTTR]] | 55 | 35 | near 52W highs | P/E 73.1x | P/E 73.1x; capital-intensity risk |
| [[Utilities]] | Small | [[NRGV]] | 48 | 40 | passed the clean-universe and liquidity filters | P/S 2.6x | unprofitable; capital-intensity risk |
| [[Utilities]] | Small | [[CDZI]] | 38 | 31 | passed the clean-universe and liquidity filters | P/S 25.3x | unprofitable; beta 2.1 |
| [[Utilities]] | Micro | [[MNTK]] | 37 | 37 | P/B 0.6x | P/E 93.7x | thin liquidity; P/E 93.7x |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Utilities]] | Small | $1.6B | [[WTTR]] | P/E 73.1x | 3.7x sector ceiling | 35 | P/E 73.1x vs ~20x sector ceiling; quality score 35 | P/E 73.1x; capital-intensity risk |
| [[Utilities]] | Mega | $245.0B | [[GEV]] | P/E 50.3x | 2.5x sector ceiling | 47 | P/E 50.3x vs ~20x sector ceiling; quality score 47 | P/E 50.3x; capital-intensity risk |
| [[Utilities]] | Large | $194.7B | [[NEE]] | P/E 28.6x | 1.4x sector ceiling | 60 | P/E 28.6x vs ~20x sector ceiling | P/E 28.6x; capital-intensity risk |
| [[Utilities]] | Mid | $8.1B | [[CWEN]] | P/E 28.0x | 1.4x sector ceiling | 52 | P/E 28.0x vs ~20x sector ceiling; quality score 52 | P/E 28.0x; capital-intensity risk |

## Utilities Research Picks

- **Sector Lens**: regulated utility/water/power fit with defensive beta and asset-value bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[WTTR]] | 55 | 35 | near 52W highs | P/E 73.1x | P/E 73.1x; capital-intensity risk |
| [[NRGV]] | 48 | 40 | passed the clean-universe and liquidity filters | P/S 2.6x | unprofitable; capital-intensity risk |
| [[CDZI]] | 38 | 31 | passed the clean-universe and liquidity filters | P/S 25.3x | unprofitable; beta 2.1 |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PCYO]] | 56 | 68 | Op margin 35% | P/E 19.1x | P/S 8.9x; capital-intensity risk |
| [[MNTK]] | 37 | 37 | P/B 0.6x | P/E 93.7x | thin liquidity; P/E 93.7x |

### Special Situation

- No special situation selected.

## Research Queue

- **Total Candidates**: 5
- **Highest Score**: 56 (PCYO)
- **Highest Quality Score**: PCYO
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-07
