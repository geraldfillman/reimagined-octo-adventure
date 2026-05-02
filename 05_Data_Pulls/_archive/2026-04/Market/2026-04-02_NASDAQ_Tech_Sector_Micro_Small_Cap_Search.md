---
title: "Tech Sector Micro/Small Cap Search - NASDAQ"
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
| [[Tech Sector]] | Technology | 127 | 0 | 1 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Tech Sector]] | Small | [[TENB]] | 64 | 58 | Gross margin 78%; 74% target upside | Fwd P/E 8.6x | unprofitable; multiple-compression risk |
| [[Tech Sector]] | Small | [[NCNO]] | 62 | 57 | Gross margin 60%; 81% target upside | Fwd P/E 14.6x | unprofitable; multiple-compression risk |
| [[Tech Sector]] | Small | [[PENG]] | 57 | 43 | growth still screening clean; Rev +17% YoY | P/E 41.8x | multiple-compression risk |
| [[Tech Sector]] | Special | [[BKSY]] | 57 | 33 | strong liquidity | P/B 11.7x | multiple-compression risk |
| [[Tech Sector]] | Micro | [[PDYN]] | 53 | 61 | 49% target upside | Fwd P/E 4.6x | beta 3.8; P/S 51.2x |
| [[Tech Sector]] | Micro | [[AVNW]] | 49 | 35 | Gross margin 57% | P/E 193.6x | P/E 193.6x; multiple-compression risk |
| [[Tech Sector]] | Micro | [[OSS]] | 43 | 28 | 75% target upside | Fwd P/E 454.6x | unprofitable; Fwd P/E 454.6x |

## Potential Overvalued Watchlist

- No selected candidates currently screen as stretched on forward/trailing earnings multiples.

## Tech Sector Research Picks

- **Sector Lens**: growth, gross margin, and software/networking fit bias
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[TENB]] | 64 | 58 | Gross margin 78%; 74% target upside | Fwd P/E 8.6x | unprofitable; multiple-compression risk |
| [[NCNO]] | 62 | 57 | Gross margin 60%; 81% target upside | Fwd P/E 14.6x | unprofitable; multiple-compression risk |
| [[PENG]] | 57 | 43 | growth still screening clean; Rev +17% YoY | P/E 41.8x | multiple-compression risk |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PDYN]] | 53 | 61 | 49% target upside | Fwd P/E 4.6x | beta 3.8; P/S 51.2x |
| [[AVNW]] | 49 | 35 | Gross margin 57% | P/E 193.6x | P/E 193.6x; multiple-compression risk |
| [[OSS]] | 43 | 28 | 75% target upside | Fwd P/E 454.6x | unprofitable; Fwd P/E 454.6x |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BKSY]] | 57 | 33 | strong liquidity | P/B 11.7x | multiple-compression risk |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 64 (TENB)
- **Highest Quality Score**: PDYN
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Nasdaq Public Screener
- **Fallback**: FMP company-screener was unavailable because the endpoint was restricted or temporarily rate-limited on the current subscription.
- **Auto-pulled**: 2026-04-02
