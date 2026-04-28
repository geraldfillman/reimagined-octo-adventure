---
title: "Utilities Micro/Small Cap Search - FMP"
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
- **Fundamentals Coverage**: 4 cached/live FMP or SEC company-facts profiles across selected names
- **Taxonomy Note**: [[Aerospace & Defense]] remains inside [[Industrials]] in FMP sector data.

## Sector Coverage

| Vault Sector | Source Sector | Raw | Funds/ETF | ADR/ADS | LP/Trust | Dupes | Fund | Eligible | Final |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Utilities]] | Utilities | 6 | 0 | 0 | 2 | 0 | 4 | 4 | 4 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Utilities]] | Small | [[WTTR]] | 58 | 35 | near 52W highs; strong liquidity | P/E 71.9x | P/E 71.9x; capital-intensity risk |
| [[Utilities]] | Small | [[NRGV]] | 49 | 39 | passed the clean-universe and liquidity filters | P/S 3.1x | unprofitable; capital-intensity risk |
| [[Utilities]] | Micro | [[OPAL]] | 41 | 57 | P/B -5.6x | P/E 4.9x | thin liquidity; capital-intensity risk |
| [[Utilities]] | Small | [[CDZI]] | 40 | 31 | passed the clean-universe and liquidity filters | P/S 24.8x | unprofitable; beta 2.1 |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Utilities]] | Mega | $270.3B | [[GEV]] | P/E 55.8x | 2.8x sector ceiling | 46 | P/E 55.8x vs ~20x sector ceiling; quality score 46 | P/E 55.8x; capital-intensity risk |
| [[Utilities]] | Small | $1.6B | [[WTTR]] | P/E 71.9x | 3.6x sector ceiling | 35 | P/E 71.9x vs ~20x sector ceiling; quality score 35 | P/E 71.9x; capital-intensity risk |
| [[Utilities]] | Large | $191.8B | [[NEE]] | P/E 28.1x | 1.4x sector ceiling | 62 | P/E 28.1x vs ~20x sector ceiling | P/E 28.1x; capital-intensity risk |

## Utilities Research Picks

- **Sector Lens**: regulated utility/water/power fit with defensive beta and asset-value bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[WTTR]] | 58 | 35 | near 52W highs; strong liquidity | P/E 71.9x | P/E 71.9x; capital-intensity risk |
| [[NRGV]] | 49 | 39 | passed the clean-universe and liquidity filters | P/S 3.1x | unprofitable; capital-intensity risk |
| [[CDZI]] | 40 | 31 | passed the clean-universe and liquidity filters | P/S 24.8x | unprofitable; beta 2.1 |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[OPAL]] | 41 | 57 | P/B -5.6x | P/E 4.9x | thin liquidity; capital-intensity risk |

### Special Situation

- No special situation selected.

## Research Queue

- **Total Candidates**: 4
- **Highest Score**: 58 (WTTR)
- **Highest Quality Score**: OPAL
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-20
