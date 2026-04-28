---
title: "Materials Micro/Small Cap Search - FMP"
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
| [[Materials]] | Basic Materials | 45 | 0 | 0 | 0 | 1 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Materials]] | Small | [[IOSP]] | 61 | 58 | passed the clean-universe and liquidity filters | P/E 15.7x | commodity-cycle sensitivity |
| [[Materials]] | Small | [[ECVT]] | 59 | 45 | near 52W highs; strong liquidity | P/S 1.9x | unprofitable; commodity-cycle sensitivity |
| [[Materials]] | Small | [[GPRE]] | 58 | 43 | near 52W highs; strong liquidity | P/S 0.6x | unprofitable; commodity-cycle sensitivity |
| [[Materials]] | Special | [[LXU]] | 56 | 39 | Op margin 10%; near 52W highs | P/E 43.9x | P/E 43.9x; commodity-cycle sensitivity |
| [[Materials]] | Micro | [[CLW]] | 52 | 50 | passed the clean-universe and liquidity filters | P/S 0.2x | unprofitable; thin liquidity |
| [[Materials]] | Micro | [[CTGO]] | 45 | 28 | passed the clean-universe and liquidity filters | P/B 11.7x | commodity-cycle sensitivity |
| [[Materials]] | Micro | [[USAU]] | 45 | 32 | passed the clean-universe and liquidity filters | P/B 4.6x | commodity-cycle sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Materials]] | Large | $88.2B | [[FCX]] | P/E 40.3x | 1.6x sector ceiling | 47 | P/E 40.3x vs ~25x sector ceiling; quality score 47 | P/E 40.3x; commodity-cycle sensitivity |
| [[Materials]] | Large | $146.9B | [[SCCO]] | P/E 34.4x | 1.4x sector ceiling | 60 | P/E 34.4x vs ~25x sector ceiling | P/E 34.4x; P/S 10.9x |

## Materials Research Picks

- **Sector Lens**: chemicals/mining/metals fit with commodity-cycle value bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[IOSP]] | 61 | 58 | passed the clean-universe and liquidity filters | P/E 15.7x | commodity-cycle sensitivity |
| [[ECVT]] | 59 | 45 | near 52W highs; strong liquidity | P/S 1.9x | unprofitable; commodity-cycle sensitivity |
| [[GPRE]] | 58 | 43 | near 52W highs; strong liquidity | P/S 0.6x | unprofitable; commodity-cycle sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CLW]] | 52 | 50 | passed the clean-universe and liquidity filters | P/S 0.2x | unprofitable; thin liquidity |
| [[CTGO]] | 45 | 28 | passed the clean-universe and liquidity filters | P/B 11.7x | commodity-cycle sensitivity |
| [[USAU]] | 45 | 32 | passed the clean-universe and liquidity filters | P/B 4.6x | commodity-cycle sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[LXU]] | 56 | 39 | Op margin 10%; near 52W highs | P/E 43.9x | P/E 43.9x; commodity-cycle sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 61 (IOSP)
- **Highest Quality Score**: IOSP
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-04
