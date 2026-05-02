---
title: "Healthcare Micro/Small Cap Search - NASDAQ"
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
| [[Healthcare]] | Healthcare | 249 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Healthcare]] | Small | [[INSP]] | 76 | 90 | commercial ramp showing up; Rev +62% YoY | P/E 10.6x | P/S 18.7x; reimbursement risk |
| [[Healthcare]] | Small | [[SLNO]] | 72 | 73 | catalyst rerating setup; 176% target upside | Fwd P/E 7.4x | P/S 8.5x; clinical/dilution risk |
| [[Healthcare]] | Micro | [[KROS]] | 63 | 76 | Op margin 28% | P/E 2.6x | thin liquidity; clinical/dilution risk |
| [[Healthcare]] | Small | [[PVLA]] | 60 | 37 | commercial ramp showing up; Rev +65% YoY | P/S 39.0x | unprofitable; P/S 39.0x |
| [[Healthcare]] | Micro | [[TENX]] | 60 | 52 | catalyst rerating setup; 94% target upside | Fwd P/E 0.3x | P/S 414.7x; clinical/dilution risk |
| [[Healthcare]] | Special | [[EYE]] | 60 | 48 | catalyst rerating setup; 49% target upside | Fwd P/E 28.9x | reimbursement risk |
| [[Healthcare]] | Micro | [[CLPT]] | 45 | 35 | Rev +18% YoY | P/S 7.4x | unprofitable; reimbursement risk |

## Potential Overvalued Watchlist

- No selected candidates currently screen as stretched on forward/trailing earnings multiples.

## Healthcare Research Picks

- **Sector Lens**: biotech/medtech catalyst bias with analyst-upside and revenue-inflection overlays
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[INSP]] | 76 | 90 | commercial ramp showing up; Rev +62% YoY | P/E 10.6x | P/S 18.7x; reimbursement risk |
| [[SLNO]] | 72 | 73 | catalyst rerating setup; 176% target upside | Fwd P/E 7.4x | P/S 8.5x; clinical/dilution risk |
| [[PVLA]] | 60 | 37 | commercial ramp showing up; Rev +65% YoY | P/S 39.0x | unprofitable; P/S 39.0x |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[KROS]] | 63 | 76 | Op margin 28% | P/E 2.6x | thin liquidity; clinical/dilution risk |
| [[TENX]] | 60 | 52 | catalyst rerating setup; 94% target upside | Fwd P/E 0.3x | P/S 414.7x; clinical/dilution risk |
| [[CLPT]] | 45 | 35 | Rev +18% YoY | P/S 7.4x | unprofitable; reimbursement risk |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[EYE]] | 60 | 48 | catalyst rerating setup; 49% target upside | Fwd P/E 28.9x | reimbursement risk |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 76 (INSP)
- **Highest Quality Score**: INSP
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Nasdaq Public Screener
- **Fallback**: FMP company-screener was unavailable because the endpoint was restricted or temporarily rate-limited on the current subscription.
- **Auto-pulled**: 2026-04-02
