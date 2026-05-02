---
title: "Industrials Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-30"
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
| [[Industrials]] | Industrials | 152 | 0 | 0 | 0 | 1 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Industrials]] | Small | [[THR]] | 69 | 53 | execution margin 16%; Op margin 16% | P/E 33.0x | P/E 33.0x; order-cycle sensitivity |
| [[Industrials]] | Small | [[TNC]] | 63 | 44 | near 52W highs; strong liquidity | P/E 33.2x | P/E 33.2x; order-cycle sensitivity |
| [[Industrials]] | Reserve | [[PRG]] | 63 | 73 | execution margin 12%; Op margin 12% | P/E 9.7x | weak sector fit; beta 1.8 |
| [[Industrials]] | Reserve | [[PLPC]] | 54 | 43 | near 52W highs; strong liquidity | P/E 48.3x | weak sector fit; P/E 48.3x |
| [[Industrials]] | Micro | [[AIRO]] | 47 | 50 | passed the clean-universe and liquidity filters | P/S 2.6x | unprofitable; beta 1.9 |
| [[Industrials]] | Micro | [[SPCE]] | 43 | 28 | 29% target upside | P/S 95.4x | unprofitable; beta 2.2 |
| [[Industrials]] | Micro | [[SIDU]] | 42 | 23 | strong liquidity | P/S 32.3x | unprofitable; P/S 32.3x |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Industrials]] | Mid | $10.0B | [[GTLS]] | P/E 235.0x | 9.4x sector ceiling | 38 | P/E 235.0x vs ~25x sector ceiling; quality score 38 | P/E 235.0x; order-cycle sensitivity |
| [[Industrials]] | Mega | $376.9B | [[CAT]] | P/E 54.6x | 2.2x sector ceiling | 44 | P/E 54.6x vs ~25x sector ceiling; quality score 44 | target below spot; P/E 54.6x |
| [[Industrials]] | Large | $176.7B | [[BA]] | P/E 80.9x | 3.2x sector ceiling | 32 | P/E 80.9x vs ~25x sector ceiling; quality score 32 | P/E 80.9x; order-cycle sensitivity |

## Industrials Research Picks

- **Sector Lens**: machinery/defense/transport fit with order-cycle margin bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[THR]] | 69 | 53 | execution margin 16%; Op margin 16% | P/E 33.0x | P/E 33.0x; order-cycle sensitivity |
| [[TNC]] | 63 | 44 | near 52W highs; strong liquidity | P/E 33.2x | P/E 33.2x; order-cycle sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AIRO]] | 47 | 50 | passed the clean-universe and liquidity filters | P/S 2.6x | unprofitable; beta 1.9 |
| [[SPCE]] | 43 | 28 | 29% target upside | P/S 95.4x | unprofitable; beta 2.2 |
| [[SIDU]] | 42 | 23 | strong liquidity | P/S 32.3x | unprofitable; P/S 32.3x |

### Special Situation

- No special situation selected.

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PRG]] | 63 | 73 | execution margin 12%; Op margin 12% | P/E 9.7x | weak sector fit; beta 1.8 |
| [[PLPC]] | 54 | 43 | near 52W highs; strong liquidity | P/E 48.3x | weak sector fit; P/E 48.3x |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 69 (THR)
- **Highest Quality Score**: PRG
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-30
