---
title: "Materials Micro/Small Cap Search - FMP"
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
| [[Materials]] | Basic Materials | 16 | 0 | 0 | 0 | 1 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Materials]] | Small | [[ECVT]] | 54 | 45 | near 52W highs | P/S 1.9x | unprofitable; thin liquidity |
| [[Materials]] | Reserve | [[USAR]] | 53 | 53 | Op margin 22%; strong liquidity | P/S 2.4x | weak sector fit; unprofitable |
| [[Materials]] | Small | [[LWLG]] | 49 | 20 | near 52W highs; strong liquidity | P/S 5529.6x | unprofitable; beta 2.8 |
| [[Materials]] | Small | [[TROX]] | 49 | 41 | near 52W highs | P/S 0.5x | unprofitable; thin liquidity |
| [[Materials]] | Reserve | [[CRML]] | 45 | 28 | passed the clean-universe and liquidity filters | P/S 2051.9x | unprofitable; P/S 2051.9x |
| [[Materials]] | Special | [[IAUX]] | 43 | 23 | passed the clean-universe and liquidity filters | P/S 16.0x | unprofitable; beta 2.0 |
| [[Materials]] | Micro | [[VGZ]] | 40 | 34 | 120% target upside | P/B 17.2x | thin liquidity; commodity-cycle sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Materials]] | Large | $87.4B | [[FCX]] | P/E 39.9x | 1.6x sector ceiling | 47 | P/E 39.9x vs ~25x sector ceiling; quality score 47 | P/E 39.9x; commodity-cycle sensitivity |

## Materials Research Picks

- **Sector Lens**: chemicals/mining/metals fit with commodity-cycle value bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[ECVT]] | 54 | 45 | near 52W highs | P/S 1.9x | unprofitable; thin liquidity |
| [[LWLG]] | 49 | 20 | near 52W highs; strong liquidity | P/S 5529.6x | unprofitable; beta 2.8 |
| [[TROX]] | 49 | 41 | near 52W highs | P/S 0.5x | unprofitable; thin liquidity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[VGZ]] | 40 | 34 | 120% target upside | P/B 17.2x | thin liquidity; commodity-cycle sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[IAUX]] | 43 | 23 | passed the clean-universe and liquidity filters | P/S 16.0x | unprofitable; beta 2.0 |

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[USAR]] | 53 | 53 | Op margin 22%; strong liquidity | P/S 2.4x | weak sector fit; unprofitable |
| [[CRML]] | 45 | 28 | passed the clean-universe and liquidity filters | P/S 2051.9x | unprofitable; P/S 2051.9x |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 54 (ECVT)
- **Highest Quality Score**: USAR
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-06
