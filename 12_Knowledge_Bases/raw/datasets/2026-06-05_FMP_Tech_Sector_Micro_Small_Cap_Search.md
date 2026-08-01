---
title: "Tech Sector Micro/Small Cap Search - FMP"
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
| [[Tech Sector]] | Technology | 172 | 0 | 1 | 0 | 2 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Tech Sector]] | Small | [[PLAB]] | 68 | 71 | Op margin 23%; strong liquidity | P/E 10.6x | multiple-compression risk |
| [[Tech Sector]] | Small | [[GLOB]] | 65 | 64 | 42% target upside; strong liquidity | P/E 15.1x | multiple-compression risk |
| [[Tech Sector]] | Small | [[FIVN]] | 65 | 48 | Gross margin 55%; strong liquidity | P/E 31.0x | multiple-compression risk |
| [[Tech Sector]] | Special | [[BL]] | 64 | 53 | Gross margin 75%; 36% target upside | P/E 63.6x | P/E 63.6x; multiple-compression risk |
| [[Tech Sector]] | Micro | [[MPTI]] | 57 | 58 | Op margin 19%; near 52W highs | P/E 33.4x | multiple-compression risk |
| [[Tech Sector]] | Micro | [[MX]] | 52 | 40 | strong liquidity | P/S 1.4x | unprofitable; multiple-compression risk |
| [[Tech Sector]] | Micro | [[VELO]] | 49 | 31 | strong liquidity | P/S 5.9x | unprofitable; beta 2.5 |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Tech Sector]] | Large | $199.4B | [[ADI]] | P/E 60.2x | 1.5x sector ceiling | 56 | P/E 60.2x vs ~40x sector ceiling | P/E 60.2x; P/S 15.6x |
| [[Tech Sector]] | Large | $193.3B | [[ANET]] | P/E 51.9x | 1.3x sector ceiling | 62 | P/E 51.9x vs ~40x sector ceiling | P/E 51.9x; P/S 19.9x |

## Tech Sector Research Picks

- **Sector Lens**: growth, gross margin, and software/networking fit bias
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PLAB]] | 68 | 71 | Op margin 23%; strong liquidity | P/E 10.6x | multiple-compression risk |
| [[GLOB]] | 65 | 64 | 42% target upside; strong liquidity | P/E 15.1x | multiple-compression risk |
| [[FIVN]] | 65 | 48 | Gross margin 55%; strong liquidity | P/E 31.0x | multiple-compression risk |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[MPTI]] | 57 | 58 | Op margin 19%; near 52W highs | P/E 33.4x | multiple-compression risk |
| [[MX]] | 52 | 40 | strong liquidity | P/S 1.4x | unprofitable; multiple-compression risk |
| [[VELO]] | 49 | 31 | strong liquidity | P/S 5.9x | unprofitable; beta 2.5 |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BL]] | 64 | 53 | Gross margin 75%; 36% target upside | P/E 63.6x | P/E 63.6x; multiple-compression risk |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 68 (PLAB)
- **Highest Quality Score**: PLAB
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-06-05
