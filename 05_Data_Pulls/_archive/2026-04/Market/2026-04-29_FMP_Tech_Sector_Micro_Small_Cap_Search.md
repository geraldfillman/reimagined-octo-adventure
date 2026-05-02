---
title: "Tech Sector Micro/Small Cap Search - FMP"
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
| [[Tech Sector]] | Technology | 168 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Tech Sector]] | Small | [[WOLF]] | 61 | 49 | strong liquidity | P/S 1.6x | unprofitable; multiple-compression risk |
| [[Tech Sector]] | Small | [[DXC]] | 61 | 60 | strong liquidity | P/E 4.9x | multiple-compression risk |
| [[Tech Sector]] | Small | [[PENG]] | 60 | 47 | near 52W highs; strong liquidity | P/E 26.9x | beta 2.2; multiple-compression risk |
| [[Tech Sector]] | Special | [[CNXC]] | 58 | 48 | strong liquidity | P/S 0.2x | unprofitable; multiple-compression risk |
| [[Tech Sector]] | Micro | [[MRAM]] | 52 | 42 | Gross margin 51% | P/S 5.4x | unprofitable; multiple-compression risk |
| [[Tech Sector]] | Micro | [[VELO]] | 50 | 35 | strong liquidity | P/S 6.2x | unprofitable; beta 2.0 |
| [[Tech Sector]] | Micro | [[ALMU]] | 49 | 29 | Gross margin 50%; strong liquidity | P/S 51.2x | unprofitable; P/S 51.2x |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Tech Sector]] | Small | $2.0B | [[NCNO]] | P/E 382.1x | 9.6x sector ceiling | 40 | P/E 382.1x vs ~40x sector ceiling; quality score 40 | P/E 382.1x; multiple-compression risk |
| [[Tech Sector]] | Large | $187.1B | [[ADI]] | P/E 69.2x | 1.7x sector ceiling | 55 | P/E 69.2x vs ~40x sector ceiling | P/E 69.2x; P/S 15.9x |

## Tech Sector Research Picks

- **Sector Lens**: growth, gross margin, and software/networking fit bias
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[WOLF]] | 61 | 49 | strong liquidity | P/S 1.6x | unprofitable; multiple-compression risk |
| [[DXC]] | 61 | 60 | strong liquidity | P/E 4.9x | multiple-compression risk |
| [[PENG]] | 60 | 47 | near 52W highs; strong liquidity | P/E 26.9x | beta 2.2; multiple-compression risk |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[MRAM]] | 52 | 42 | Gross margin 51% | P/S 5.4x | unprofitable; multiple-compression risk |
| [[VELO]] | 50 | 35 | strong liquidity | P/S 6.2x | unprofitable; beta 2.0 |
| [[ALMU]] | 49 | 29 | Gross margin 50%; strong liquidity | P/S 51.2x | unprofitable; P/S 51.2x |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CNXC]] | 58 | 48 | strong liquidity | P/S 0.2x | unprofitable; multiple-compression risk |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 61 (WOLF)
- **Highest Quality Score**: DXC
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-29
