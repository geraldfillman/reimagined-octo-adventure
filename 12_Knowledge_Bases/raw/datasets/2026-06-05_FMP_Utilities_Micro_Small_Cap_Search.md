---
title: "Utilities Micro/Small Cap Search - FMP"
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
- **Fundamentals Coverage**: 5 cached/live FMP or SEC company-facts profiles across selected names
- **Taxonomy Note**: [[Aerospace & Defense]] remains inside [[Industrials]] in FMP sector data.

## Sector Coverage

| Vault Sector | Source Sector | Raw | Funds/ETF | ADR/ADS | LP/Trust | Dupes | Fund | Eligible | Final |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Utilities]] | Utilities | 6 | 0 | 0 | 1 | 0 | 5 | 5 | 5 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Utilities]] | Small | [[WTTR]] | 56 | 38 | 22% target upside; near 52W highs | P/E 92.1x | P/E 92.1x; capital-intensity risk |
| [[Utilities]] | Small | [[NRGV]] | 54 | 34 | near 52W highs; strong liquidity | P/S 4.5x | unprofitable; capital-intensity risk |
| [[Utilities]] | Micro | [[MNTK]] | 41 | 36 | P/B 0.9x | P/E 108.2x | thin liquidity; P/E 108.2x |
| [[Utilities]] | Micro | [[OPAL]] | 39 | 55 | passed the clean-universe and liquidity filters | P/E 3.1x | thin liquidity; capital-intensity risk |
| [[Utilities]] | Small | [[CDZI]] | 37 | 31 | passed the clean-universe and liquidity filters | P/S 23.3x | unprofitable; beta 1.8 |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Utilities]] | Small | $1.9B | [[WTTR]] | P/E 92.1x | 4.6x sector ceiling | 38 | P/E 92.1x vs ~20x sector ceiling; quality score 38 | P/E 92.1x; capital-intensity risk |
| [[Utilities]] | Mega | $248.3B | [[GEV]] | P/E 26.5x | 1.3x sector ceiling | 55 | P/E 26.5x vs ~20x sector ceiling | P/E 26.5x; capital-intensity risk |

## Utilities Research Picks

- **Sector Lens**: regulated utility/water/power fit with defensive beta and asset-value bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[WTTR]] | 56 | 38 | 22% target upside; near 52W highs | P/E 92.1x | P/E 92.1x; capital-intensity risk |
| [[NRGV]] | 54 | 34 | near 52W highs; strong liquidity | P/S 4.5x | unprofitable; capital-intensity risk |
| [[CDZI]] | 37 | 31 | passed the clean-universe and liquidity filters | P/S 23.3x | unprofitable; beta 1.8 |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[MNTK]] | 41 | 36 | P/B 0.9x | P/E 108.2x | thin liquidity; P/E 108.2x |
| [[OPAL]] | 39 | 55 | passed the clean-universe and liquidity filters | P/E 3.1x | thin liquidity; capital-intensity risk |

### Special Situation

- No special situation selected.

## Research Queue

- **Total Candidates**: 5
- **Highest Score**: 56 (WTTR)
- **Highest Quality Score**: OPAL
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-06-05
