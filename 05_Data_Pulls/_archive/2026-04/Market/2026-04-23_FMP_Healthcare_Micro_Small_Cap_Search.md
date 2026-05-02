---
title: "Healthcare Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-23"
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
| [[Healthcare]] | Healthcare | 335 | 0 | 0 | 0 | 3 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Healthcare]] | Small | [[INSP]] | 68 | 75 | strong liquidity | P/E 11.2x | reimbursement risk |
| [[Healthcare]] | Small | [[WGS]] | 66 | 51 | catalyst rerating setup; 51% target upside | P/S 4.5x | unprofitable; beta 2.2 |
| [[Healthcare]] | Small | [[NKTR]] | 66 | 42 | catalyst rerating setup; 53% target upside | P/S 33.5x | unprofitable; P/S 33.5x |
| [[Healthcare]] | Special | [[SNDX]] | 63 | 35 | strong liquidity | P/S 10.7x | unprofitable; P/S 10.7x |
| [[Healthcare]] | Micro | [[STRO]] | 62 | 53 | near 52W highs | P/S 2.9x | unprofitable; clinical/dilution risk |
| [[Healthcare]] | Micro | [[NEO]] | 53 | 45 | passed the clean-universe and liquidity filters | P/S 0.3x | unprofitable; reimbursement risk |
| [[Healthcare]] | Micro | [[REPL]] | 50 | 47 | strong liquidity | P/B 1.2x | clinical/dilution risk |

## Potential Overvalued Watchlist

- No selected candidates currently screen as stretched on forward/trailing earnings multiples.

## Healthcare Research Picks

- **Sector Lens**: biotech/medtech catalyst bias with analyst-upside and revenue-inflection overlays
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[INSP]] | 68 | 75 | strong liquidity | P/E 11.2x | reimbursement risk |
| [[WGS]] | 66 | 51 | catalyst rerating setup; 51% target upside | P/S 4.5x | unprofitable; beta 2.2 |
| [[NKTR]] | 66 | 42 | catalyst rerating setup; 53% target upside | P/S 33.5x | unprofitable; P/S 33.5x |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[STRO]] | 62 | 53 | near 52W highs | P/S 2.9x | unprofitable; clinical/dilution risk |
| [[NEO]] | 53 | 45 | passed the clean-universe and liquidity filters | P/S 0.3x | unprofitable; reimbursement risk |
| [[REPL]] | 50 | 47 | strong liquidity | P/B 1.2x | clinical/dilution risk |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SNDX]] | 63 | 35 | strong liquidity | P/S 10.7x | unprofitable; P/S 10.7x |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 68 (INSP)
- **Highest Quality Score**: INSP
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-23
