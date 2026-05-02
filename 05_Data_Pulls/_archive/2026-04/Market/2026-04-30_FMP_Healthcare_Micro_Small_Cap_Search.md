---
title: "Healthcare Micro/Small Cap Search - FMP"
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
| [[Healthcare]] | Healthcare | 360 | 0 | 0 | 0 | 3 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Healthcare]] | Small | [[OMCL]] | 70 | 47 | catalyst rerating setup; 45% target upside | P/E 95.6x | P/E 95.6x; reimbursement risk |
| [[Healthcare]] | Small | [[NKTR]] | 65 | 42 | catalyst rerating setup; 68% target upside | P/S 30.6x | unprofitable; P/S 30.6x |
| [[Healthcare]] | Micro | [[NEO]] | 63 | 53 | catalyst rerating setup; 179% target upside | P/S 0.3x | unprofitable; reimbursement risk |
| [[Healthcare]] | Small | [[SNDX]] | 63 | 35 | strong liquidity | P/S 10.6x | unprofitable; P/S 10.6x |
| [[Healthcare]] | Special | [[TYRA]] | 62 | 34 | catalyst rerating setup; 60% target upside | P/B 7.8x | clinical/dilution risk |
| [[Healthcare]] | Micro | [[SGMT]] | 52 | 40 | passed the clean-universe and liquidity filters | P/B 2.5x | beta 3.2; clinical/dilution risk |
| [[Healthcare]] | Micro | [[CMPX]] | 49 | 44 | strong liquidity | P/B 1.6x | clinical/dilution risk |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Healthcare]] | Small | $2.0B | [[OMCL]] | P/E 95.6x | 2.4x sector ceiling | 47 | P/E 95.6x vs ~40x sector ceiling; quality score 47 | P/E 95.6x; reimbursement risk |

## Healthcare Research Picks

- **Sector Lens**: biotech/medtech catalyst bias with analyst-upside and revenue-inflection overlays
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[OMCL]] | 70 | 47 | catalyst rerating setup; 45% target upside | P/E 95.6x | P/E 95.6x; reimbursement risk |
| [[NKTR]] | 65 | 42 | catalyst rerating setup; 68% target upside | P/S 30.6x | unprofitable; P/S 30.6x |
| [[SNDX]] | 63 | 35 | strong liquidity | P/S 10.6x | unprofitable; P/S 10.6x |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[NEO]] | 63 | 53 | catalyst rerating setup; 179% target upside | P/S 0.3x | unprofitable; reimbursement risk |
| [[SGMT]] | 52 | 40 | passed the clean-universe and liquidity filters | P/B 2.5x | beta 3.2; clinical/dilution risk |
| [[CMPX]] | 49 | 44 | strong liquidity | P/B 1.6x | clinical/dilution risk |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[TYRA]] | 62 | 34 | catalyst rerating setup; 60% target upside | P/B 7.8x | clinical/dilution risk |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 70 (OMCL)
- **Highest Quality Score**: NEO
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-30
