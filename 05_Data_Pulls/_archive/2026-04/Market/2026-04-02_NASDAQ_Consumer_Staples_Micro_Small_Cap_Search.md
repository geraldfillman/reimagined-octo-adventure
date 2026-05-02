---
title: "Consumer Staples Micro/Small Cap Search - NASDAQ"
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
- **Fundamentals Coverage**: 6 cached/live Alpha Vantage or SEC company-facts profiles across selected names
- **Taxonomy Note**: Nasdaq sectors are normalized with text-based industry/company overrides (249 rows reassigned); [[Communication Services]] maps to Telecommunications labels, and unclassified Miscellaneous names are excluded.

## Sector Coverage

| Vault Sector | Source Sector | Raw | Funds/ETF | ADR/ADS | LP/Trust | Dupes | Fund | Eligible | Final |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Consumer Defensive | 14 | 0 | 0 | 0 | 0 | 6 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Small | [[BRBR]] | 72 | 72 | consumer margin 15%; Rev +16% YoY | P/E 8.8x | input-cost sensitivity |
| [[Consumer Staples]] | Small | [[SMPL]] | 72 | 77 | consumer margin 30%; Rev +21% YoY | P/E 12.5x | input-cost sensitivity |
| [[Consumer Staples]] | Small | [[VITL]] | 71 | 81 | consumer margin 12%; Rev +25% YoY | P/E 8.6x | input-cost sensitivity |
| [[Consumer Staples]] | Special | [[GO]] | 55 | 45 | passed the clean-universe and liquidity filters | P/S 0.1x | unprofitable; input-cost sensitivity |
| [[Consumer Staples]] | Reserve | [[FLO]] | 55 | 46 | passed the clean-universe and liquidity filters | P/E 20.6x | input-cost sensitivity |
| [[Consumer Staples]] | Reserve | [[OFRM]] | 51 | N/A | clean-universe survivor; fundamentals pending | fundamentals pending | fundamental coverage missing; input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[ZVIA]] | 38 | 45 | passed the clean-universe and liquidity filters | P/S 0.5x | unprofitable; thin liquidity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Mid | $10.0B | [[DAR]] | P/E 159.0x | 6.4x sector ceiling | 34 | P/E 159.0x vs ~25x sector ceiling; Rev +7% does not fully support it | P/E 159.0x; input-cost sensitivity |
| [[Consumer Staples]] | Large | $70.4B | [[MNST]] | P/E 37.0x | 1.5x sector ceiling | 60 | P/E 37.0x vs ~25x sector ceiling | P/E 37.0x; P/S 8.5x |

## Consumer Staples Research Picks

- **Sector Lens**: food/beverage/household fit with defensive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BRBR]] | 72 | 72 | consumer margin 15%; Rev +16% YoY | P/E 8.8x | input-cost sensitivity |
| [[SMPL]] | 72 | 77 | consumer margin 30%; Rev +21% YoY | P/E 12.5x | input-cost sensitivity |
| [[VITL]] | 71 | 81 | consumer margin 12%; Rev +25% YoY | P/E 8.6x | input-cost sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[ZVIA]] | 38 | 45 | passed the clean-universe and liquidity filters | P/S 0.5x | unprofitable; thin liquidity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[GO]] | 55 | 45 | passed the clean-universe and liquidity filters | P/S 0.1x | unprofitable; input-cost sensitivity |

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[FLO]] | 55 | 46 | passed the clean-universe and liquidity filters | P/E 20.6x | input-cost sensitivity |
| [[OFRM]] | 51 | N/A | clean-universe survivor; fundamentals pending | fundamentals pending | fundamental coverage missing; input-cost sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 72 (BRBR)
- **Highest Quality Score**: VITL
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Nasdaq Public Screener
- **Fallback**: FMP company-screener was unavailable because the endpoint was restricted or temporarily rate-limited on the current subscription.
- **Auto-pulled**: 2026-04-02
