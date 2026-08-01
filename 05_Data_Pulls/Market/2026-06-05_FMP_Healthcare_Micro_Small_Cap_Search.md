---
title: "Healthcare Micro/Small Cap Search - FMP"
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
- **Fundamentals Coverage**: 7 cached/live FMP or SEC company-facts profiles across selected names
- **Taxonomy Note**: [[Aerospace & Defense]] remains inside [[Industrials]] in FMP sector data.

## Sector Coverage

| Vault Sector | Source Sector | Raw | Funds/ETF | ADR/ADS | LP/Trust | Dupes | Fund | Eligible | Final |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Healthcare]] | Healthcare | 342 | 0 | 0 | 0 | 2 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Healthcare]] | Small | [[UFPT]] | 69 | 59 | Op margin 15%; strong liquidity | P/E 25.2x | reimbursement risk |
| [[Healthcare]] | Small | [[WGS]] | 62 | 42 | strong liquidity | P/S 3.5x | unprofitable; beta 2.1 |
| [[Healthcare]] | Micro | [[FONR]] | 62 | 56 | near 52W highs | P/E 17.6x | reimbursement risk |
| [[Healthcare]] | Micro | [[STRO]] | 61 | 60 | catalyst rerating setup; 100% target upside | P/S 2.5x | unprofitable; clinical/dilution risk |
| [[Healthcare]] | Small | [[MLYS]] | 60 | 38 | strong liquidity | P/B 3.1x | clinical/dilution risk |
| [[Healthcare]] | Special | [[NTLA]] | 56 | 30 | catalyst rerating setup; 152% target upside | P/S 22.0x | unprofitable; beta 1.9 |
| [[Healthcare]] | Micro | [[NEO]] | 56 | 45 | passed the clean-universe and liquidity filters | P/S 0.4x | unprofitable; beta 1.8 |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Healthcare]] | Mid | $9.9B | [[MOH]] | P/E 51.7x | 1.3x sector ceiling | 29 | P/E 51.7x vs ~40x sector ceiling; quality score 29 | target below spot; P/E 51.7x |

## Healthcare Research Picks

- **Sector Lens**: biotech/medtech catalyst bias with analyst-upside and revenue-inflection overlays
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[UFPT]] | 69 | 59 | Op margin 15%; strong liquidity | P/E 25.2x | reimbursement risk |
| [[WGS]] | 62 | 42 | strong liquidity | P/S 3.5x | unprofitable; beta 2.1 |
| [[MLYS]] | 60 | 38 | strong liquidity | P/B 3.1x | clinical/dilution risk |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[FONR]] | 62 | 56 | near 52W highs | P/E 17.6x | reimbursement risk |
| [[STRO]] | 61 | 60 | catalyst rerating setup; 100% target upside | P/S 2.5x | unprofitable; clinical/dilution risk |
| [[NEO]] | 56 | 45 | passed the clean-universe and liquidity filters | P/S 0.4x | unprofitable; beta 1.8 |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[NTLA]] | 56 | 30 | catalyst rerating setup; 152% target upside | P/S 22.0x | unprofitable; beta 1.9 |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 69 (UFPT)
- **Highest Quality Score**: STRO
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-06-05
