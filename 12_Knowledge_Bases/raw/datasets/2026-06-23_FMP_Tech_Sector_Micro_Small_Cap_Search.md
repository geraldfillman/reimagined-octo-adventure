---
title: "Tech Sector Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-06-23"
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
| [[Tech Sector]] | Technology | 139 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Tech Sector]] | Small | [[BAND]] | 61 | 51 | strong liquidity | P/S 2.2x | unprofitable; beta 2.9 |
| [[Tech Sector]] | Small | [[VPG]] | 59 | 39 | near 52W highs; strong liquidity | P/E 302.1x | P/E 302.1x; multiple-compression risk |
| [[Tech Sector]] | Micro | [[MPTI]] | 59 | 59 | Op margin 19%; near 52W highs | P/E 31.8x | multiple-compression risk |
| [[Tech Sector]] | Small | [[RXT]] | 55 | 42 | near 52W highs; strong liquidity | P/S 0.7x | unprofitable; beta 3.0 |
| [[Tech Sector]] | Special | [[SHAZ]] | 49 | 22 | near 52W highs; strong liquidity | P/S 551.6x | unprofitable; beta 5.9 |
| [[Tech Sector]] | Micro | [[OCC]] | 48 | 38 | passed the clean-universe and liquidity filters | P/E 180.5x | P/E 180.5x; multiple-compression risk |
| [[Tech Sector]] | Micro | [[TRT]] | 46 | 33 | passed the clean-universe and liquidity filters | P/E 333.2x | beta 1.9; P/E 333.2x |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Tech Sector]] | Large | $198.3B | [[PANW]] | P/E 244.5x | 6.1x sector ceiling | 47 | P/E 244.5x vs ~40x sector ceiling; quality score 47 | P/E 244.5x; P/S 18.7x |
| [[Tech Sector]] | Small | $1.9B | [[FLYW]] | P/E 63.8x | 1.6x sector ceiling | 52 | P/E 63.8x vs ~40x sector ceiling; quality score 52 | P/E 63.8x; multiple-compression risk |

## Tech Sector Research Picks

- **Sector Lens**: growth, gross margin, and software/networking fit bias
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BAND]] | 61 | 51 | strong liquidity | P/S 2.2x | unprofitable; beta 2.9 |
| [[VPG]] | 59 | 39 | near 52W highs; strong liquidity | P/E 302.1x | P/E 302.1x; multiple-compression risk |
| [[RXT]] | 55 | 42 | near 52W highs; strong liquidity | P/S 0.7x | unprofitable; beta 3.0 |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[MPTI]] | 59 | 59 | Op margin 19%; near 52W highs | P/E 31.8x | multiple-compression risk |
| [[OCC]] | 48 | 38 | passed the clean-universe and liquidity filters | P/E 180.5x | P/E 180.5x; multiple-compression risk |
| [[TRT]] | 46 | 33 | passed the clean-universe and liquidity filters | P/E 333.2x | beta 1.9; P/E 333.2x |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SHAZ]] | 49 | 22 | near 52W highs; strong liquidity | P/S 551.6x | unprofitable; beta 5.9 |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 61 (BAND)
- **Highest Quality Score**: MPTI
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-06-23
