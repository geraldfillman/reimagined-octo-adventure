---
title: "Communication Services Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-06"
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
| [[Communication Services]] | Communication Services | 14 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Communication Services]] | Small | [[MGNI]] | 61 | 72 | Gross margin 63%; Op margin 14% | P/E 12.2x | beta 2.4; thin liquidity |
| [[Communication Services]] | Small | [[AMC]] | 58 | 64 | Gross margin 75%; Op margin 38% | P/S 0.1x | unprofitable; beta 2.0 |
| [[Communication Services]] | Small | [[CCO]] | 58 | 61 | Gross margin 51%; Op margin 20% | P/S 0.7x | unprofitable; beta 2.3 |
| [[Communication Services]] | Special | [[STGW]] | 54 | 43 | 24% target upside; near 52W highs | P/E 55.7x | thin liquidity; P/E 55.7x |
| [[Communication Services]] | Reserve | [[PLAY]] | 52 | 57 | Gross margin 86% | P/S 0.2x | unprofitable; beta 1.8 |
| [[Communication Services]] | Micro | [[CDLX]] | 39 | 47 | passed the clean-universe and liquidity filters | P/S 0.3x | unprofitable; thin liquidity |
| [[Communication Services]] | Micro | [[UPXI]] | 36 | 50 | Gross margin 80% | P/S 2.9x | unprofitable; thin liquidity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Communication Services]] | Mid | $10.0B | [[Z]] | P/E 435.0x | 10.9x sector ceiling | 40 | P/E 435.0x vs ~40x sector ceiling; quality score 40 | beta 2.1; P/E 435.0x |

## Communication Services Research Picks

- **Sector Lens**: telecom/media/platform fit with growth, margin, and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[MGNI]] | 61 | 72 | Gross margin 63%; Op margin 14% | P/E 12.2x | beta 2.4; thin liquidity |
| [[AMC]] | 58 | 64 | Gross margin 75%; Op margin 38% | P/S 0.1x | unprofitable; beta 2.0 |
| [[CCO]] | 58 | 61 | Gross margin 51%; Op margin 20% | P/S 0.7x | unprofitable; beta 2.3 |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CDLX]] | 39 | 47 | passed the clean-universe and liquidity filters | P/S 0.3x | unprofitable; thin liquidity |
| [[UPXI]] | 36 | 50 | Gross margin 80% | P/S 2.9x | unprofitable; thin liquidity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[STGW]] | 54 | 43 | 24% target upside; near 52W highs | P/E 55.7x | thin liquidity; P/E 55.7x |

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PLAY]] | 52 | 57 | Gross margin 86% | P/S 0.2x | unprofitable; beta 1.8 |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 61 (MGNI)
- **Highest Quality Score**: MGNI
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-06
