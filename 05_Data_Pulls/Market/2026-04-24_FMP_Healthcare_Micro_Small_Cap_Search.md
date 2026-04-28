---
title: "Healthcare Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-24"
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
| [[Healthcare]] | Healthcare | 328 | 0 | 0 | 0 | 3 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Healthcare]] | Small | [[NKTR]] | 66 | 42 | catalyst rerating setup; 53% target upside | P/S 33.5x | unprofitable; P/S 33.5x |
| [[Healthcare]] | Small | [[UFPT]] | 66 | 61 | Op margin 15%; strong liquidity | P/E 22.6x | reimbursement risk |
| [[Healthcare]] | Small | [[SNDX]] | 62 | 35 | near 52W highs; strong liquidity | P/S 10.7x | unprofitable; P/S 10.7x |
| [[Healthcare]] | Micro | [[STRO]] | 61 | 53 | near 52W highs | P/S 2.9x | unprofitable; clinical/dilution risk |
| [[Healthcare]] | Special | [[INBX]] | 56 | 22 | near 52W highs; strong liquidity | P/S 1347.6x | unprofitable; beta 1.8 |
| [[Healthcare]] | Micro | [[VOR]] | 54 | 53 | catalyst rerating setup; 124% target upside | No clean multiple | beta 1.9; clinical/dilution risk |
| [[Healthcare]] | Micro | [[AVTX]] | 52 | 36 | catalyst rerating setup; 246% target upside | P/S 2653.2x | unprofitable; P/S 2653.2x |

## Potential Overvalued Watchlist

- No selected candidates currently screen as stretched on forward/trailing earnings multiples.

## Healthcare Research Picks

- **Sector Lens**: biotech/medtech catalyst bias with analyst-upside and revenue-inflection overlays
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[NKTR]] | 66 | 42 | catalyst rerating setup; 53% target upside | P/S 33.5x | unprofitable; P/S 33.5x |
| [[UFPT]] | 66 | 61 | Op margin 15%; strong liquidity | P/E 22.6x | reimbursement risk |
| [[SNDX]] | 62 | 35 | near 52W highs; strong liquidity | P/S 10.7x | unprofitable; P/S 10.7x |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[STRO]] | 61 | 53 | near 52W highs | P/S 2.9x | unprofitable; clinical/dilution risk |
| [[VOR]] | 54 | 53 | catalyst rerating setup; 124% target upside | No clean multiple | beta 1.9; clinical/dilution risk |
| [[AVTX]] | 52 | 36 | catalyst rerating setup; 246% target upside | P/S 2653.2x | unprofitable; P/S 2653.2x |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[INBX]] | 56 | 22 | near 52W highs; strong liquidity | P/S 1347.6x | unprofitable; beta 1.8 |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 66 (NKTR)
- **Highest Quality Score**: UFPT
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-24
