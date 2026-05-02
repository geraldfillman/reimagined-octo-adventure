---
title: "Consumer Discretionary Micro/Small Cap Search - NASDAQ"
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
| [[Consumer Discretionary]] | Consumer Cyclical | 122 | 0 | 1 | 1 | 1 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Discretionary]] | Small | [[MCRI]] | 70 | 78 | consumer margin 10%; Rev +114% YoY | P/E 16.8x | consumer-demand sensitivity |
| [[Consumer Discretionary]] | Reserve | [[TPB]] | 63 | 79 | consumer margin 33%; Rev +39% YoY | P/E 24.8x | weak sector fit; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Reserve | [[YELP]] | 60 | 66 | consumer margin 13%; Op margin 13% | P/E 10.3x | weak sector fit; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Small | [[ALGT]] | 57 | 49 | passed the clean-universe and liquidity filters | P/S 0.6x | unprofitable; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Reserve | [[FUN]] | 49 | 47 | passed the clean-universe and liquidity filters | P/S 0.6x | weak sector fit; unprofitable |
| [[Consumer Discretionary]] | Micro | [[JACK]] | 45 | 42 | passed the clean-universe and liquidity filters | P/S 0.1x | unprofitable; shrinking revenue |
| [[Consumer Discretionary]] | Reserve | [[PENN]] | 45 | 38 | passed the clean-universe and liquidity filters | P/S 0.3x | weak sector fit; unprofitable |

## Potential Overvalued Watchlist

- No selected candidates currently screen as stretched on forward/trailing earnings multiples.

## Consumer Discretionary Research Picks

- **Sector Lens**: retail/leisure/autos fit with demand-sensitive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[MCRI]] | 70 | 78 | consumer margin 10%; Rev +114% YoY | P/E 16.8x | consumer-demand sensitivity |
| [[ALGT]] | 57 | 49 | passed the clean-universe and liquidity filters | P/S 0.6x | unprofitable; consumer-demand sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[JACK]] | 45 | 42 | passed the clean-universe and liquidity filters | P/S 0.1x | unprofitable; shrinking revenue |

### Special Situation

- No special situation selected.

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[TPB]] | 63 | 79 | consumer margin 33%; Rev +39% YoY | P/E 24.8x | weak sector fit; consumer-demand sensitivity |
| [[YELP]] | 60 | 66 | consumer margin 13%; Op margin 13% | P/E 10.3x | weak sector fit; consumer-demand sensitivity |
| [[FUN]] | 49 | 47 | passed the clean-universe and liquidity filters | P/S 0.6x | weak sector fit; unprofitable |
| [[PENN]] | 45 | 38 | passed the clean-universe and liquidity filters | P/S 0.3x | weak sector fit; unprofitable |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 70 (MCRI)
- **Highest Quality Score**: TPB
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Nasdaq Public Screener
- **Fallback**: FMP company-screener was unavailable because the endpoint was restricted or temporarily rate-limited on the current subscription.
- **Auto-pulled**: 2026-04-02
