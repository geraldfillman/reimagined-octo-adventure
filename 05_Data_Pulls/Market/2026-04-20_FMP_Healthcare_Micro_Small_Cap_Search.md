---
title: "Healthcare Micro/Small Cap Search - FMP"
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
| [[Healthcare]] | Healthcare | 107 | 0 | 0 | 0 | 1 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Healthcare]] | Small | [[RAPP]] | 68 | 42 | catalyst rerating setup; 66% target upside | P/B 3.8x | clinical/dilution risk |
| [[Healthcare]] | Small | [[INSP]] | 66 | 74 | strong liquidity | P/E 11.5x | reimbursement risk |
| [[Healthcare]] | Small | [[ASTH]] | 63 | 38 | 27% target upside; near 52W highs | P/E 69.0x | P/E 69.0x; reimbursement risk |
| [[Healthcare]] | Special | [[SION]] | 61 | 27 | near 52W highs; strong liquidity | P/B 5.7x | beta 3.0; clinical/dilution risk |
| [[Healthcare]] | Micro | [[STRO]] | 61 | 54 | near 52W highs | P/S 2.6x | unprofitable; clinical/dilution risk |
| [[Healthcare]] | Micro | [[ASRT]] | 53 | 44 | near 52W highs | P/S 1.0x | unprofitable; target below spot |
| [[Healthcare]] | Micro | [[MASS]] | 53 | 64 | passed the clean-universe and liquidity filters | P/E 13.3x | reimbursement risk |

## Potential Overvalued Watchlist

- No selected candidates currently screen as stretched on forward/trailing earnings multiples.

## Healthcare Research Picks

- **Sector Lens**: biotech/medtech catalyst bias with analyst-upside and revenue-inflection overlays
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[RAPP]] | 68 | 42 | catalyst rerating setup; 66% target upside | P/B 3.8x | clinical/dilution risk |
| [[INSP]] | 66 | 74 | strong liquidity | P/E 11.5x | reimbursement risk |
| [[ASTH]] | 63 | 38 | 27% target upside; near 52W highs | P/E 69.0x | P/E 69.0x; reimbursement risk |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[STRO]] | 61 | 54 | near 52W highs | P/S 2.6x | unprofitable; clinical/dilution risk |
| [[ASRT]] | 53 | 44 | near 52W highs | P/S 1.0x | unprofitable; target below spot |
| [[MASS]] | 53 | 64 | passed the clean-universe and liquidity filters | P/E 13.3x | reimbursement risk |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SION]] | 61 | 27 | near 52W highs; strong liquidity | P/B 5.7x | beta 3.0; clinical/dilution risk |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 68 (RAPP)
- **Highest Quality Score**: INSP
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-20
