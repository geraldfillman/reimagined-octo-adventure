---
title: "Tech Sector Micro/Small Cap Search - FMP"
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
| [[Tech Sector]] | Technology | 91 | 0 | 0 | 0 | 1 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Tech Sector]] | Small | [[ASGN]] | 65 | 67 | 83% target upside; strong liquidity | P/E 8.0x | multiple-compression risk |
| [[Tech Sector]] | Small | [[WOLF]] | 61 | 48 | near 52W highs; strong liquidity | P/S 1.8x | unprofitable; multiple-compression risk |
| [[Tech Sector]] | Small | [[AOSL]] | 59 | 41 | near 52W highs; strong liquidity | P/S 1.8x | unprofitable; beta 1.9 |
| [[Tech Sector]] | Special | [[SKYT]] | 59 | 65 | near 52W highs | P/E 12.5x | beta 3.5; multiple-compression risk |
| [[Tech Sector]] | Micro | [[TRT]] | 54 | 48 | near 52W highs; strong liquidity | P/S 2.7x | unprofitable; multiple-compression risk |
| [[Tech Sector]] | Micro | [[VELO]] | 50 | 35 | strong liquidity | P/S 6.3x | unprofitable; beta 2.0 |
| [[Tech Sector]] | Micro | [[QUIK]] | 48 | 25 | near 52W highs; strong liquidity | P/S 20.8x | unprofitable; P/S 20.8x |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Tech Sector]] | Large | $191.1B | [[ADI]] | P/E 70.7x | 1.8x sector ceiling | 55 | P/E 70.7x vs ~40x sector ceiling | P/E 70.7x; P/S 16.3x |

## Tech Sector Research Picks

- **Sector Lens**: growth, gross margin, and software/networking fit bias
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[ASGN]] | 65 | 67 | 83% target upside; strong liquidity | P/E 8.0x | multiple-compression risk |
| [[WOLF]] | 61 | 48 | near 52W highs; strong liquidity | P/S 1.8x | unprofitable; multiple-compression risk |
| [[AOSL]] | 59 | 41 | near 52W highs; strong liquidity | P/S 1.8x | unprofitable; beta 1.9 |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[TRT]] | 54 | 48 | near 52W highs; strong liquidity | P/S 2.7x | unprofitable; multiple-compression risk |
| [[VELO]] | 50 | 35 | strong liquidity | P/S 6.3x | unprofitable; beta 2.0 |
| [[QUIK]] | 48 | 25 | near 52W highs; strong liquidity | P/S 20.8x | unprofitable; P/S 20.8x |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SKYT]] | 59 | 65 | near 52W highs | P/E 12.5x | beta 3.5; multiple-compression risk |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 65 (ASGN)
- **Highest Quality Score**: ASGN
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-27
