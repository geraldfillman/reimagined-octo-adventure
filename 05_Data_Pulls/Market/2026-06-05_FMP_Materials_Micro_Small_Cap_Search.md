---
title: "Materials Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-06-05"
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
| [[Materials]] | Basic Materials | 39 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Materials]] | Micro | [[CLW]] | 53 | 49 | passed the clean-universe and liquidity filters | P/S 0.2x | unprofitable; commodity-cycle sensitivity |
| [[Materials]] | Micro | [[HDSN]] | 53 | 62 | 67% target upside | P/E 16.0x | thin liquidity; commodity-cycle sensitivity |
| [[Materials]] | Small | [[ALOY]] | 51 | 36 | 55% target upside; strong liquidity | P/S 292.2x | unprofitable; P/S 292.2x |
| [[Materials]] | Small | [[CRML]] | 49 | 28 | strong liquidity | P/S 2353.6x | unprofitable; beta 1.9 |
| [[Materials]] | Small | [[LWLG]] | 48 | 20 | strong liquidity | P/S 6553.4x | unprofitable; beta 3.2 |
| [[Materials]] | Micro | [[CTGO]] | 45 | 46 | passed the clean-universe and liquidity filters | P/B 0.9x | commodity-cycle sensitivity |
| [[Materials]] | Special | [[USAU]] | 45 | 34 | passed the clean-universe and liquidity filters | P/B 4.1x | commodity-cycle sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Materials]] | Mid | $9.7B | [[ESI]] | P/E 65.3x | 2.6x sector ceiling | 45 | P/E 65.3x vs ~25x sector ceiling; quality score 45 | P/E 65.3x; commodity-cycle sensitivity |
| [[Materials]] | Mid | $9.9B | [[HL]] | P/E 36.1x | 1.4x sector ceiling | 63 | P/E 36.1x vs ~25x sector ceiling | P/E 36.1x; commodity-cycle sensitivity |
| [[Materials]] | Large | $90.2B | [[FCX]] | P/E 33.2x | 1.3x sector ceiling | 53 | P/E 33.2x vs ~25x sector ceiling; quality score 53 | P/E 33.2x; commodity-cycle sensitivity |

## Materials Research Picks

- **Sector Lens**: chemicals/mining/metals fit with commodity-cycle value bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[ALOY]] | 51 | 36 | 55% target upside; strong liquidity | P/S 292.2x | unprofitable; P/S 292.2x |
| [[CRML]] | 49 | 28 | strong liquidity | P/S 2353.6x | unprofitable; beta 1.9 |
| [[LWLG]] | 48 | 20 | strong liquidity | P/S 6553.4x | unprofitable; beta 3.2 |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CLW]] | 53 | 49 | passed the clean-universe and liquidity filters | P/S 0.2x | unprofitable; commodity-cycle sensitivity |
| [[HDSN]] | 53 | 62 | 67% target upside | P/E 16.0x | thin liquidity; commodity-cycle sensitivity |
| [[CTGO]] | 45 | 46 | passed the clean-universe and liquidity filters | P/B 0.9x | commodity-cycle sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[USAU]] | 45 | 34 | passed the clean-universe and liquidity filters | P/B 4.1x | commodity-cycle sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 53 (CLW)
- **Highest Quality Score**: HDSN
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-06-05
