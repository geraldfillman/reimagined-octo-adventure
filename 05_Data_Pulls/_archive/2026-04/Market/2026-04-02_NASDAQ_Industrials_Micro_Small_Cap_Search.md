---
title: "Industrials Micro/Small Cap Search - NASDAQ"
source: "Nasdaq Public Screener"
date_pulled: "2026-04-02"
domain: "market"
data_type: "screen"
frequency: "on-demand"
signal_status: "clear"
signals: []
tags: ["equities", "screener", "micro-cap", "small-cap", "nasdaq"]
---

## Search Criteria

- **Universe**: US-listed equities inside the selected sector taxonomy
- **Market Cap Range**: $50.0M to $2.0B
- **Micro-Cap Cutoff**: Below $300.0M
- **Price Floor**: $1.00
- **Volume Floor**: 100.0K shares
- **Per-Sector Limit**: 7
- **Phase 1 Exclusions**: funds/ETFs, ADRs/ADS, LP-trust-unit structures, duplicate share classes
- **Phase 3 Quality Score**: Alpha Vantage overview plus SEC company-facts growth, margin, returns, valuation, and analyst-upside factors
- **Phase 4 Output**: up to 3 small caps, up to 3 micro caps, plus 1 special situation per sector, then reserve names up to the per-sector limit
- **Phase 5 Columns**: why now, valuation snapshot, and key risk for each research pick
- **Phase 6 Sector Lens**: primary picks must pass a sector-fit gate and are re-ranked with sector-specific valuation and profitability rules
- **Phase 7 Overvalued Watchlist**: sector-aware forward/trailing P/E stretch screen across all market caps, while keeping the same price, country, and exclusion filters plus a $5.0M dollar-volume floor and sector-fit gate
- **Provider**: Nasdaq Public Screener
- **Fundamentals Coverage**: 7 cached/live Alpha Vantage or SEC company-facts profiles across selected names
- **Taxonomy Note**: Nasdaq sectors are normalized with text-based industry/company overrides (249 rows reassigned); [[Communication Services]] maps to Telecommunications labels, and unclassified Miscellaneous names are excluded.

## Sector Coverage

| Vault Sector | Source Sector | Raw | Funds/ETF | ADR/ADS | LP/Trust | Dupes | Fund | Eligible | Final |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Industrials]] | Industrials | 65 | 0 | 1 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Industrials]] | Small | [[PSIX]] | 73 | 70 | execution margin 13%; 54% target upside | P/E 13.4x | beta 2.1; order-cycle sensitivity |
| [[Industrials]] | Micro | [[EVTL]] | 56 | 56 | 338% target upside | Fwd P/E 4.7x | P/S 12724.6x; order-cycle sensitivity |
| [[Industrials]] | Micro | [[AIRO]] | 53 | 52 | 134% target upside | P/S 2.8x | unprofitable; shrinking revenue |
| [[Industrials]] | Small | [[RDW]] | 50 | 30 | 41% target upside; strong liquidity | P/S 5.2x | unprofitable; beta 2.5 |
| [[Industrials]] | Small | [[VOYG]] | 45 | 23 | 49% target upside; strong liquidity | P/S 8.4x | unprofitable; P/S 8.4x |
| [[Industrials]] | Special | [[UAMY]] | 44 | 26 | 45% target upside; strong liquidity | Fwd P/E 55.3x | unprofitable; Fwd P/E 55.3x |
| [[Industrials]] | Micro | [[FJET]] | 42 | N/A | clean-universe survivor; fundamentals pending | fundamentals pending | fundamental coverage missing; order-cycle sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Industrials]] | Large | $162.9B | [[BA]] | Fwd P/E 147.1x | 5.9x sector ceiling | 31 | Fwd P/E 147.1x vs ~25x sector ceiling; Rev +1% does not fully support it | Fwd P/E 147.1x; order-cycle sensitivity |
| [[Industrials]] | Mid | $10.0B | [[SPXC]] | P/E 40.9x | 1.6x sector ceiling | 49 | P/E 40.9x vs ~25x sector ceiling; quality score 49 | P/E 40.9x; order-cycle sensitivity |
| [[Industrials]] | Mega | $341.8B | [[CAT]] | Fwd P/E 32.4x | 1.3x sector ceiling | 45 | Fwd P/E 32.4x vs ~25x sector ceiling; Rev +0% does not fully support it | Fwd P/E 32.4x; order-cycle sensitivity |

## Industrials Research Picks

- **Sector Lens**: machinery/defense/transport fit with order-cycle margin bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PSIX]] | 73 | 70 | execution margin 13%; 54% target upside | P/E 13.4x | beta 2.1; order-cycle sensitivity |
| [[RDW]] | 50 | 30 | 41% target upside; strong liquidity | P/S 5.2x | unprofitable; beta 2.5 |
| [[VOYG]] | 45 | 23 | 49% target upside; strong liquidity | P/S 8.4x | unprofitable; P/S 8.4x |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[EVTL]] | 56 | 56 | 338% target upside | Fwd P/E 4.7x | P/S 12724.6x; order-cycle sensitivity |
| [[AIRO]] | 53 | 52 | 134% target upside | P/S 2.8x | unprofitable; shrinking revenue |
| [[FJET]] | 42 | N/A | clean-universe survivor; fundamentals pending | fundamentals pending | fundamental coverage missing; order-cycle sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[UAMY]] | 44 | 26 | 45% target upside; strong liquidity | Fwd P/E 55.3x | unprofitable; Fwd P/E 55.3x |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 73 (PSIX)
- **Highest Quality Score**: PSIX
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Nasdaq Public Screener
- **Fallback**: FMP company-screener was unavailable because the endpoint was restricted or temporarily rate-limited on the current subscription.
- **Auto-pulled**: 2026-04-02
