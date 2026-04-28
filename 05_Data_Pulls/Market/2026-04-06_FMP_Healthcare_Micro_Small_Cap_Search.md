---
title: "Healthcare Micro/Small Cap Search - FMP"
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
| [[Healthcare]] | Healthcare | 95 | 0 | 0 | 0 | 1 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Healthcare]] | Small | [[BCRX]] | 67 | 73 | Op margin 39% | P/E 7.4x | clinical/dilution risk |
| [[Healthcare]] | Small | [[INSP]] | 63 | 74 | passed the clean-universe and liquidity filters | P/E 11.2x | reimbursement risk |
| [[Healthcare]] | Small | [[VRDN]] | 55 | 32 | strong liquidity | P/S 19.3x | unprofitable; P/S 19.3x |
| [[Healthcare]] | Special | [[KALV]] | 55 | 35 | near 52W highs | P/S 13.8x | unprofitable; P/S 13.8x |
| [[Healthcare]] | Micro | [[AVTX]] | 51 | 28 | near 52W highs | P/S 3407.4x | unprofitable; P/S 3407.4x |
| [[Healthcare]] | Micro | [[VOR]] | 46 | 45 | passed the clean-universe and liquidity filters | No clean multiple | beta 1.9; clinical/dilution risk |
| [[Healthcare]] | Micro | [[THAR]] | 45 | 46 | passed the clean-universe and liquidity filters | P/B 0.3x | clinical/dilution risk |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Healthcare]] | Mid | $8.2B | [[TECH]] | P/E 100.7x | 2.5x sector ceiling | 47 | P/E 100.7x vs ~40x sector ceiling; quality score 47 | P/E 100.7x; clinical/dilution risk |

## Healthcare Research Picks

- **Sector Lens**: biotech/medtech catalyst bias with analyst-upside and revenue-inflection overlays
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BCRX]] | 67 | 73 | Op margin 39% | P/E 7.4x | clinical/dilution risk |
| [[INSP]] | 63 | 74 | passed the clean-universe and liquidity filters | P/E 11.2x | reimbursement risk |
| [[VRDN]] | 55 | 32 | strong liquidity | P/S 19.3x | unprofitable; P/S 19.3x |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AVTX]] | 51 | 28 | near 52W highs | P/S 3407.4x | unprofitable; P/S 3407.4x |
| [[VOR]] | 46 | 45 | passed the clean-universe and liquidity filters | No clean multiple | beta 1.9; clinical/dilution risk |
| [[THAR]] | 45 | 46 | passed the clean-universe and liquidity filters | P/B 0.3x | clinical/dilution risk |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[KALV]] | 55 | 35 | near 52W highs | P/S 13.8x | unprofitable; P/S 13.8x |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 67 (BCRX)
- **Highest Quality Score**: INSP
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-06
