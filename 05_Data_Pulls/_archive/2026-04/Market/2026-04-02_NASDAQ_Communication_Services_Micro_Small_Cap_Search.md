---
title: "Communication Services Micro/Small Cap Search - NASDAQ"
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
| [[Communication Services]] | Communication Services | 22 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Communication Services]] | Small | [[ZD]] | 65 | 58 | Gross margin 86%; Op margin 21% | Fwd P/E 6.4x | shrinking revenue; multiple-compression risk |
| [[Communication Services]] | Micro | [[ANGI]] | 64 | 79 | Gross margin 134%; Rev +48% YoY | P/E 6.1x | thin liquidity; multiple-compression risk |
| [[Communication Services]] | Small | [[CCO]] | 53 | 37 | Gross margin 53%; Op margin 25% | Fwd P/E 114.9x | beta 2.3; Fwd P/E 114.9x |
| [[Communication Services]] | Small | [[SPIR]] | 52 | 48 | near 52W highs; above 50D/200D | P/E 9.0x | shrinking revenue; beta 2.5 |
| [[Communication Services]] | Special | [[CCOI]] | 50 | 32 | 43% target upside | Fwd P/E 5000.0x | unprofitable; shrinking revenue |
| [[Communication Services]] | Micro | [[NCMI]] | 50 | 54 | passed the clean-universe and liquidity filters | P/S 0.6x | unprofitable; thin liquidity |
| [[Communication Services]] | Micro | [[CMTL]] | 43 | 32 | passed the clean-universe and liquidity filters | P/S 0.2x | unprofitable; shrinking revenue |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Communication Services]] | Small | $1.2B | [[CCO]] | Fwd P/E 114.9x | 2.9x sector ceiling | 37 | Fwd P/E 114.9x vs ~40x sector ceiling; Rev +0% does not fully support it | beta 2.3; Fwd P/E 114.9x |
| [[Communication Services]] | Large | $125.1B | [[GLW]] | P/E 78.4x | 2.0x sector ceiling | 55 | P/E 78.4x vs ~40x sector ceiling | P/E 78.4x; P/S 8.0x |

## Communication Services Research Picks

- **Sector Lens**: telecom/media/platform fit with growth, margin, and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[ZD]] | 65 | 58 | Gross margin 86%; Op margin 21% | Fwd P/E 6.4x | shrinking revenue; multiple-compression risk |
| [[CCO]] | 53 | 37 | Gross margin 53%; Op margin 25% | Fwd P/E 114.9x | beta 2.3; Fwd P/E 114.9x |
| [[SPIR]] | 52 | 48 | near 52W highs; above 50D/200D | P/E 9.0x | shrinking revenue; beta 2.5 |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[ANGI]] | 64 | 79 | Gross margin 134%; Rev +48% YoY | P/E 6.1x | thin liquidity; multiple-compression risk |
| [[NCMI]] | 50 | 54 | passed the clean-universe and liquidity filters | P/S 0.6x | unprofitable; thin liquidity |
| [[CMTL]] | 43 | 32 | passed the clean-universe and liquidity filters | P/S 0.2x | unprofitable; shrinking revenue |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CCOI]] | 50 | 32 | 43% target upside | Fwd P/E 5000.0x | unprofitable; shrinking revenue |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 65 (ZD)
- **Highest Quality Score**: ANGI
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Nasdaq Public Screener
- **Fallback**: FMP company-screener was unavailable because the endpoint was restricted or temporarily rate-limited on the current subscription.
- **Auto-pulled**: 2026-04-02
