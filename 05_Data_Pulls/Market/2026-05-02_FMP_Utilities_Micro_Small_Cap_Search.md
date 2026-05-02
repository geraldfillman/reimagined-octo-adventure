---
title: "Utilities Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-05-02"
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
| [[Utilities]] | Utilities | 10 | 0 | 0 | 2 | 0 | 7 | 8 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Utilities]] | Small | [[HTO]] | 68 | 62 | P/B 1.2x; Op margin 22% | P/E 20.5x | capital-intensity risk |
| [[Utilities]] | Small | [[MSEX]] | 60 | 60 | Op margin 28% | P/E 21.0x | capital-intensity risk |
| [[Utilities]] | Small | [[WTTR]] | 57 | 35 | near 52W highs; strong liquidity | P/E 79.4x | P/E 79.4x; capital-intensity risk |
| [[Utilities]] | Special | [[NRGV]] | 52 | 37 | passed the clean-universe and liquidity filters | P/S 3.7x | unprofitable; capital-intensity risk |
| [[Utilities]] | Reserve | [[YORW]] | 50 | 45 | passed the clean-universe and liquidity filters | P/E 20.9x | capital-intensity risk |
| [[Utilities]] | Micro | [[MNTK]] | 44 | 38 | P/B 0.8x | P/E 114.5x | thin liquidity; P/E 114.5x |
| [[Utilities]] | Micro | [[OPAL]] | 39 | 58 | P/B -4.8x | P/E 4.2x | thin liquidity; capital-intensity risk |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Utilities]] | Small | $1.7B | [[WTTR]] | P/E 79.4x | 4.0x sector ceiling | 35 | P/E 79.4x vs ~20x sector ceiling; quality score 35 | P/E 79.4x; capital-intensity risk |
| [[Utilities]] | Mega | $285.6B | [[GEV]] | P/E 30.5x | 1.5x sector ceiling | 54 | P/E 30.5x vs ~20x sector ceiling; quality score 54 | P/E 30.5x; capital-intensity risk |
| [[Utilities]] | Mid | $8.3B | [[CWEN]] | P/E 28.5x | 1.4x sector ceiling | 54 | P/E 28.5x vs ~20x sector ceiling; quality score 54 | P/E 28.5x; capital-intensity risk |

## Utilities Research Picks

- **Sector Lens**: regulated utility/water/power fit with defensive beta and asset-value bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[HTO]] | 68 | 62 | P/B 1.2x; Op margin 22% | P/E 20.5x | capital-intensity risk |
| [[MSEX]] | 60 | 60 | Op margin 28% | P/E 21.0x | capital-intensity risk |
| [[WTTR]] | 57 | 35 | near 52W highs; strong liquidity | P/E 79.4x | P/E 79.4x; capital-intensity risk |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[MNTK]] | 44 | 38 | P/B 0.8x | P/E 114.5x | thin liquidity; P/E 114.5x |
| [[OPAL]] | 39 | 58 | P/B -4.8x | P/E 4.2x | thin liquidity; capital-intensity risk |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[NRGV]] | 52 | 37 | passed the clean-universe and liquidity filters | P/S 3.7x | unprofitable; capital-intensity risk |

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[YORW]] | 50 | 45 | passed the clean-universe and liquidity filters | P/E 20.9x | capital-intensity risk |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 68 (HTO)
- **Highest Quality Score**: HTO
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-05-02
