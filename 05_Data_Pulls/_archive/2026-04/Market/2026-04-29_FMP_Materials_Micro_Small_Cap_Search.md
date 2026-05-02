---
title: "Materials Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-29"
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
| [[Materials]] | Basic Materials | 43 | 0 | 0 | 1 | 1 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Materials]] | Small | [[SLVM]] | 69 | 60 | passed the clean-universe and liquidity filters | P/E 12.8x | commodity-cycle sensitivity |
| [[Materials]] | Micro | [[CLW]] | 58 | 56 | 35% target upside | P/S 0.2x | unprofitable; commodity-cycle sensitivity |
| [[Materials]] | Small | [[CRML]] | 51 | 28 | strong liquidity | P/S 2910.9x | unprofitable; P/S 2910.9x |
| [[Materials]] | Small | [[LWLG]] | 51 | 20 | strong liquidity | P/S 7263.9x | unprofitable; beta 2.8 |
| [[Materials]] | Special | [[TROX]] | 50 | 34 | near 52W highs; strong liquidity | P/S 0.5x | unprofitable; target below spot |
| [[Materials]] | Micro | [[HDSN]] | 46 | 56 | passed the clean-universe and liquidity filters | P/E 16.3x | thin liquidity; commodity-cycle sensitivity |
| [[Materials]] | Micro | [[USAU]] | 45 | 31 | passed the clean-universe and liquidity filters | P/B 4.7x | commodity-cycle sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Materials]] | Mid | $9.4B | [[ESI]] | P/E 63.4x | 2.5x sector ceiling | 41 | P/E 63.4x vs ~25x sector ceiling; quality score 41 | P/E 63.4x; commodity-cycle sensitivity |
| [[Materials]] | Large | $140.8B | [[SCCO]] | P/E 33.0x | 1.3x sector ceiling | 56 | P/E 33.0x vs ~25x sector ceiling; street targets sit at or below spot | target below spot; P/E 33.0x |

## Materials Research Picks

- **Sector Lens**: chemicals/mining/metals fit with commodity-cycle value bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SLVM]] | 69 | 60 | passed the clean-universe and liquidity filters | P/E 12.8x | commodity-cycle sensitivity |
| [[CRML]] | 51 | 28 | strong liquidity | P/S 2910.9x | unprofitable; P/S 2910.9x |
| [[LWLG]] | 51 | 20 | strong liquidity | P/S 7263.9x | unprofitable; beta 2.8 |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CLW]] | 58 | 56 | 35% target upside | P/S 0.2x | unprofitable; commodity-cycle sensitivity |
| [[HDSN]] | 46 | 56 | passed the clean-universe and liquidity filters | P/E 16.3x | thin liquidity; commodity-cycle sensitivity |
| [[USAU]] | 45 | 31 | passed the clean-universe and liquidity filters | P/B 4.7x | commodity-cycle sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[TROX]] | 50 | 34 | near 52W highs; strong liquidity | P/S 0.5x | unprofitable; target below spot |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 69 (SLVM)
- **Highest Quality Score**: SLVM
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-29
