---
title: "Materials Micro/Small Cap Search - FMP"
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
| [[Materials]] | Basic Materials | 44 | 0 | 0 | 1 | 1 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Materials]] | Small | [[SLVM]] | 69 | 60 | passed the clean-universe and liquidity filters | P/E 12.9x | commodity-cycle sensitivity |
| [[Materials]] | Micro | [[CLW]] | 60 | 55 | 32% target upside | P/S 0.1x | unprofitable; commodity-cycle sensitivity |
| [[Materials]] | Small | [[GPRE]] | 58 | 43 | near 52W highs; strong liquidity | P/S 0.6x | unprofitable; commodity-cycle sensitivity |
| [[Materials]] | Small | [[CRML]] | 51 | 28 | strong liquidity | P/S 2793.1x | unprofitable; P/S 2793.1x |
| [[Materials]] | Special | [[LWLG]] | 51 | 20 | near 52W highs; strong liquidity | P/S 7389.6x | unprofitable; beta 2.8 |
| [[Materials]] | Micro | [[HDSN]] | 46 | 57 | passed the clean-universe and liquidity filters | P/E 15.7x | thin liquidity; commodity-cycle sensitivity |
| [[Materials]] | Micro | [[USAU]] | 45 | 32 | passed the clean-universe and liquidity filters | P/B 4.6x | commodity-cycle sensitivity |

## Potential Overvalued Watchlist

- No selected candidates currently screen as stretched on forward/trailing earnings multiples.

## Materials Research Picks

- **Sector Lens**: chemicals/mining/metals fit with commodity-cycle value bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SLVM]] | 69 | 60 | passed the clean-universe and liquidity filters | P/E 12.9x | commodity-cycle sensitivity |
| [[GPRE]] | 58 | 43 | near 52W highs; strong liquidity | P/S 0.6x | unprofitable; commodity-cycle sensitivity |
| [[CRML]] | 51 | 28 | strong liquidity | P/S 2793.1x | unprofitable; P/S 2793.1x |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CLW]] | 60 | 55 | 32% target upside | P/S 0.1x | unprofitable; commodity-cycle sensitivity |
| [[HDSN]] | 46 | 57 | passed the clean-universe and liquidity filters | P/E 15.7x | thin liquidity; commodity-cycle sensitivity |
| [[USAU]] | 45 | 32 | passed the clean-universe and liquidity filters | P/B 4.6x | commodity-cycle sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[LWLG]] | 51 | 20 | near 52W highs; strong liquidity | P/S 7389.6x | unprofitable; beta 2.8 |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 69 (SLVM)
- **Highest Quality Score**: SLVM
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-30
