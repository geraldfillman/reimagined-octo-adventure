---
title: "Energy Micro/Small Cap Search - NASDAQ"
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
| [[Energy]] | Energy | 42 | 0 | 0 | 3 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Energy]] | Small | [[INVX]] | 67 | 66 | margin 20%; Rev +17% YoY | P/E 20.4x | commodity-price sensitivity |
| [[Energy]] | Micro | [[AMPY]] | 66 | 60 | margin 21%; Op margin 37% | P/E 5.6x | shrinking revenue; commodity-price sensitivity |
| [[Energy]] | Small | [[ANNA]] | 66 | 58 | margin 14%; Rev +1663% YoY | P/E 160.9x | P/E 160.9x; P/S 22.0x |
| [[Energy]] | Small | [[VTS]] | 64 | 50 | passed the clean-universe and liquidity filters | P/E 28.0x | commodity-price sensitivity |
| [[Energy]] | Special | [[FLOC]] | 63 | 61 | Rev +42% YoY; Op margin 20% | P/E 45.4x | P/E 45.4x; commodity-price sensitivity |
| [[Energy]] | Micro | [[BATL]] | 58 | 47 | strong liquidity | P/E 7.0x | shrinking revenue; commodity-price sensitivity |
| [[Energy]] | Micro | [[NUAI]] | 52 | 41 | Rev +66% YoY | P/S 276.1x | unprofitable; P/S 276.1x |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Energy]] | Small | $1.7B | [[PUMP]] | P/E 2070.3x | 82.8x sector ceiling | 23 | P/E 2070.3x vs ~25x sector ceiling; shrinking revenue against a rich multiple | shrinking revenue; P/E 2070.3x |
| [[Energy]] | Mid | $8.0B | [[CHRD]] | P/E 179.6x | 7.2x sector ceiling | 26 | P/E 179.6x vs ~25x sector ceiling; shrinking revenue against a rich multiple | shrinking revenue; P/E 179.6x |

## Energy Research Picks

- **Sector Lens**: oil/gas/energy-services fit with commodity-linked value and margin bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[INVX]] | 67 | 66 | margin 20%; Rev +17% YoY | P/E 20.4x | commodity-price sensitivity |
| [[ANNA]] | 66 | 58 | margin 14%; Rev +1663% YoY | P/E 160.9x | P/E 160.9x; P/S 22.0x |
| [[VTS]] | 64 | 50 | passed the clean-universe and liquidity filters | P/E 28.0x | commodity-price sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AMPY]] | 66 | 60 | margin 21%; Op margin 37% | P/E 5.6x | shrinking revenue; commodity-price sensitivity |
| [[BATL]] | 58 | 47 | strong liquidity | P/E 7.0x | shrinking revenue; commodity-price sensitivity |
| [[NUAI]] | 52 | 41 | Rev +66% YoY | P/S 276.1x | unprofitable; P/S 276.1x |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[FLOC]] | 63 | 61 | Rev +42% YoY; Op margin 20% | P/E 45.4x | P/E 45.4x; commodity-price sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 67 (INVX)
- **Highest Quality Score**: INVX
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Nasdaq Public Screener
- **Fallback**: FMP company-screener was unavailable because the endpoint was restricted or temporarily rate-limited on the current subscription.
- **Auto-pulled**: 2026-04-02
