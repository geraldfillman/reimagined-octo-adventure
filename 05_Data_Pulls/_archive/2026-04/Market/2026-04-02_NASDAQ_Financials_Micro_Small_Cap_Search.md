---
title: "Financials Micro/Small Cap Search - NASDAQ"
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
| [[Financials]] | Financial Services | 105 | 5 | 3 | 8 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Financials]] | Small | [[PIPR]] | 80 | 81 | ROE 21%; Rev +24% YoY | P/E 6.6x | credit-cycle sensitivity |
| [[Financials]] | Small | [[TSLX]] | 73 | 72 | P/B 1.0x; 22% target upside | Fwd P/E 9.1x | shrinking revenue; credit-cycle sensitivity |
| [[Financials]] | Small | [[SKWD]] | 66 | 72 | ROE 17%; Rev +23% YoY | P/E 11.5x | credit-cycle sensitivity |
| [[Financials]] | Special | [[DCOM]] | 62 | 66 | P/B 1.0x; Rev +19% YoY | P/E 13.6x | P/S 75.5x; credit-cycle sensitivity |
| [[Financials]] | Reserve | [[PROP]] | 58 | 82 | ROE 25%; Rev +414% YoY | P/E 5.6x | weak sector fit; P/S 22.4x |
| [[Financials]] | Micro | [[RILY]] | 43 | 36 | passed the clean-universe and liquidity filters | P/S 0.3x | unprofitable; shrinking revenue |
| [[Financials]] | Micro | [[FBLA]] | 41 | 29 | P/B 0.8x | P/E 197.1x | shrinking revenue; P/E 197.1x |

## Potential Overvalued Watchlist

- No selected candidates currently screen as stretched on forward/trailing earnings multiples.

## Financials Research Picks

- **Sector Lens**: bank/insurer/capital-markets fit with P/B, ROE, and profitability bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PIPR]] | 80 | 81 | ROE 21%; Rev +24% YoY | P/E 6.6x | credit-cycle sensitivity |
| [[TSLX]] | 73 | 72 | P/B 1.0x; 22% target upside | Fwd P/E 9.1x | shrinking revenue; credit-cycle sensitivity |
| [[SKWD]] | 66 | 72 | ROE 17%; Rev +23% YoY | P/E 11.5x | credit-cycle sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[RILY]] | 43 | 36 | passed the clean-universe and liquidity filters | P/S 0.3x | unprofitable; shrinking revenue |
| [[FBLA]] | 41 | 29 | P/B 0.8x | P/E 197.1x | shrinking revenue; P/E 197.1x |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[DCOM]] | 62 | 66 | P/B 1.0x; Rev +19% YoY | P/E 13.6x | P/S 75.5x; credit-cycle sensitivity |

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PROP]] | 58 | 82 | ROE 25%; Rev +414% YoY | P/E 5.6x | weak sector fit; P/S 22.4x |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 80 (PIPR)
- **Highest Quality Score**: PROP
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Nasdaq Public Screener
- **Fallback**: FMP company-screener was unavailable because the endpoint was restricted or temporarily rate-limited on the current subscription.
- **Auto-pulled**: 2026-04-02
