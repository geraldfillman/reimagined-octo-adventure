---
title: "Tech Sector Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-04"
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
| [[Tech Sector]] | Technology | 162 | 0 | 0 | 0 | 1 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Tech Sector]] | Small | [[PRGS]] | 68 | 70 | Gross margin 81%; Op margin 17% | P/E 12.8x | multiple-compression risk |
| [[Tech Sector]] | Small | [[NCNO]] | 59 | 40 | Gross margin 61%; strong liquidity | P/E 375.5x | P/E 375.5x; multiple-compression risk |
| [[Tech Sector]] | Small | [[CNXC]] | 58 | 48 | strong liquidity | P/S 0.2x | unprofitable; multiple-compression risk |
| [[Tech Sector]] | Special | [[AEHR]] | 54 | 25 | near 52W highs; strong liquidity | P/S 25.5x | unprofitable; beta 2.3 |
| [[Tech Sector]] | Micro | [[AVNW]] | 53 | 52 | passed the clean-universe and liquidity filters | P/E 17.8x | multiple-compression risk |
| [[Tech Sector]] | Micro | [[OSS]] | 52 | 49 | passed the clean-universe and liquidity filters | P/E 33.6x | multiple-compression risk |
| [[Tech Sector]] | Micro | [[VELO]] | 49 | 37 | strong liquidity | P/S 5.4x | unprofitable; beta 2.0 |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Tech Sector]] | Small | $2.0B | [[NCNO]] | P/E 375.5x | 9.4x sector ceiling | 40 | P/E 375.5x vs ~40x sector ceiling; quality score 40 | P/E 375.5x; multiple-compression risk |
| [[Tech Sector]] | Small | $2.0B | [[AGYS]] | P/E 65.4x | 1.6x sector ceiling | 52 | P/E 65.4x vs ~40x sector ceiling; quality score 52 | P/E 65.4x; multiple-compression risk |

## Tech Sector Research Picks

- **Sector Lens**: growth, gross margin, and software/networking fit bias
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PRGS]] | 68 | 70 | Gross margin 81%; Op margin 17% | P/E 12.8x | multiple-compression risk |
| [[NCNO]] | 59 | 40 | Gross margin 61%; strong liquidity | P/E 375.5x | P/E 375.5x; multiple-compression risk |
| [[CNXC]] | 58 | 48 | strong liquidity | P/S 0.2x | unprofitable; multiple-compression risk |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AVNW]] | 53 | 52 | passed the clean-universe and liquidity filters | P/E 17.8x | multiple-compression risk |
| [[OSS]] | 52 | 49 | passed the clean-universe and liquidity filters | P/E 33.6x | multiple-compression risk |
| [[VELO]] | 49 | 37 | strong liquidity | P/S 5.4x | unprofitable; beta 2.0 |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AEHR]] | 54 | 25 | near 52W highs; strong liquidity | P/S 25.5x | unprofitable; beta 2.3 |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 68 (PRGS)
- **Highest Quality Score**: PRGS
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-04
