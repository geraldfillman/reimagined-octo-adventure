---
title: "Utilities Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-30"
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
| [[Utilities]] | Utilities | 8 | 0 | 0 | 1 | 0 | 7 | 7 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Utilities]] | Small | [[MSEX]] | 59 | 61 | Op margin 28% | P/E 22.3x | capital-intensity risk |
| [[Utilities]] | Small | [[WTTR]] | 57 | 35 | near 52W highs; strong liquidity | P/E 82.2x | P/E 82.2x; capital-intensity risk |
| [[Utilities]] | Small | [[YORW]] | 50 | 45 | passed the clean-universe and liquidity filters | P/E 20.9x | capital-intensity risk |
| [[Utilities]] | Special | [[NRGV]] | 49 | 37 | passed the clean-universe and liquidity filters | P/S 3.5x | unprofitable; capital-intensity risk |
| [[Utilities]] | Micro | [[MNTK]] | 43 | 36 | P/B 0.8x | P/E 117.8x | thin liquidity; P/E 117.8x |
| [[Utilities]] | Micro | [[OPAL]] | 39 | 58 | P/B -4.5x | P/E 4.0x | thin liquidity; capital-intensity risk |
| [[Utilities]] | Reserve | [[CDZI]] | 38 | 31 | passed the clean-universe and liquidity filters | P/S 21.4x | unprofitable; beta 2.1 |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Utilities]] | Small | $1.7B | [[WTTR]] | P/E 82.2x | 4.1x sector ceiling | 35 | P/E 82.2x vs ~20x sector ceiling; quality score 35 | P/E 82.2x; capital-intensity risk |
| [[Utilities]] | Mega | $285.7B | [[GEV]] | P/E 30.5x | 1.5x sector ceiling | 54 | P/E 30.5x vs ~20x sector ceiling; quality score 54 | P/E 30.5x; capital-intensity risk |

## Utilities Research Picks

- **Sector Lens**: regulated utility/water/power fit with defensive beta and asset-value bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[MSEX]] | 59 | 61 | Op margin 28% | P/E 22.3x | capital-intensity risk |
| [[WTTR]] | 57 | 35 | near 52W highs; strong liquidity | P/E 82.2x | P/E 82.2x; capital-intensity risk |
| [[YORW]] | 50 | 45 | passed the clean-universe and liquidity filters | P/E 20.9x | capital-intensity risk |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[MNTK]] | 43 | 36 | P/B 0.8x | P/E 117.8x | thin liquidity; P/E 117.8x |
| [[OPAL]] | 39 | 58 | P/B -4.5x | P/E 4.0x | thin liquidity; capital-intensity risk |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[NRGV]] | 49 | 37 | passed the clean-universe and liquidity filters | P/S 3.5x | unprofitable; capital-intensity risk |

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CDZI]] | 38 | 31 | passed the clean-universe and liquidity filters | P/S 21.4x | unprofitable; beta 2.1 |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 59 (MSEX)
- **Highest Quality Score**: MSEX
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-30
