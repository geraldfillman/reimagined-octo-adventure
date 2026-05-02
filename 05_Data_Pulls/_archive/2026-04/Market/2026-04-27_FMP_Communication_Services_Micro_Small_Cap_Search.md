---
title: "Communication Services Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-27"
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
| [[Communication Services]] | Communication Services | 18 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Communication Services]] | Small | [[IHRT]] | 65 | 59 | near 52W highs | P/S 0.2x | unprofitable; multiple-compression risk |
| [[Communication Services]] | Small | [[AMC]] | 64 | 68 | Gross margin 75%; 24% target upside | P/S 0.2x | unprofitable; beta 2.0 |
| [[Communication Services]] | Small | [[MGNI]] | 62 | 71 | Gross margin 63%; Op margin 14% | P/E 13.0x | beta 2.4; multiple-compression risk |
| [[Communication Services]] | Reserve | [[FUBO]] | 53 | 60 | passed the clean-universe and liquidity filters | P/E 2.2x | beta 2.4; multiple-compression risk |
| [[Communication Services]] | Special | [[GRPN]] | 53 | 59 | Gross margin 89% | P/S 1.2x | unprofitable; thin liquidity |
| [[Communication Services]] | Micro | [[THRY]] | 45 | 42 | Gross margin 68% | P/E 538.7x | thin liquidity; P/E 538.7x |
| [[Communication Services]] | Micro | [[UPXI]] | 39 | 48 | Gross margin 80% | P/S 3.8x | unprofitable; thin liquidity |

## Potential Overvalued Watchlist

- No selected candidates currently screen as stretched on forward/trailing earnings multiples.

## Communication Services Research Picks

- **Sector Lens**: telecom/media/platform fit with growth, margin, and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[IHRT]] | 65 | 59 | near 52W highs | P/S 0.2x | unprofitable; multiple-compression risk |
| [[AMC]] | 64 | 68 | Gross margin 75%; 24% target upside | P/S 0.2x | unprofitable; beta 2.0 |
| [[MGNI]] | 62 | 71 | Gross margin 63%; Op margin 14% | P/E 13.0x | beta 2.4; multiple-compression risk |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[THRY]] | 45 | 42 | Gross margin 68% | P/E 538.7x | thin liquidity; P/E 538.7x |
| [[UPXI]] | 39 | 48 | Gross margin 80% | P/S 3.8x | unprofitable; thin liquidity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[GRPN]] | 53 | 59 | Gross margin 89% | P/S 1.2x | unprofitable; thin liquidity |

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[FUBO]] | 53 | 60 | passed the clean-universe and liquidity filters | P/E 2.2x | beta 2.4; multiple-compression risk |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 65 (IHRT)
- **Highest Quality Score**: MGNI
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-27
