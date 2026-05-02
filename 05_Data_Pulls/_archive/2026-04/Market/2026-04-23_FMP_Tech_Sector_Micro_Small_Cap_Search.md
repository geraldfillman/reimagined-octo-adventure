---
title: "Tech Sector Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-23"
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
| [[Tech Sector]] | Technology | 172 | 0 | 0 | 0 | 2 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Tech Sector]] | Small | [[BL]] | 61 | 47 | Gross margin 75%; strong liquidity | P/E 71.5x | P/E 71.5x; multiple-compression risk |
| [[Tech Sector]] | Small | [[WOLF]] | 61 | 48 | strong liquidity | P/S 1.7x | unprofitable; multiple-compression risk |
| [[Tech Sector]] | Small | [[APPN]] | 60 | 39 | Gross margin 75%; strong liquidity | P/E 1294.5x | P/E 1294.5x; multiple-compression risk |
| [[Tech Sector]] | Special | [[NCNO]] | 59 | 40 | Gross margin 61%; strong liquidity | P/E 372.2x | P/E 372.2x; multiple-compression risk |
| [[Tech Sector]] | Micro | [[TRT]] | 56 | 48 | near 52W highs; strong liquidity | P/S 2.4x | unprofitable; multiple-compression risk |
| [[Tech Sector]] | Micro | [[SKLZ]] | 56 | 46 | Gross margin 88%; strong liquidity | P/S 1.9x | unprofitable; beta 3.1 |
| [[Tech Sector]] | Micro | [[OSS]] | 53 | 48 | passed the clean-universe and liquidity filters | P/E 43.1x | multiple-compression risk |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Tech Sector]] | Small | $1.9B | [[NCNO]] | P/E 372.2x | 9.3x sector ceiling | 40 | P/E 372.2x vs ~40x sector ceiling; quality score 40 | P/E 372.2x; multiple-compression risk |
| [[Tech Sector]] | Large | $197.2B | [[ADI]] | P/E 72.9x | 1.8x sector ceiling | 55 | P/E 72.9x vs ~40x sector ceiling | P/E 72.9x; P/S 16.8x |

## Tech Sector Research Picks

- **Sector Lens**: growth, gross margin, and software/networking fit bias
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BL]] | 61 | 47 | Gross margin 75%; strong liquidity | P/E 71.5x | P/E 71.5x; multiple-compression risk |
| [[WOLF]] | 61 | 48 | strong liquidity | P/S 1.7x | unprofitable; multiple-compression risk |
| [[APPN]] | 60 | 39 | Gross margin 75%; strong liquidity | P/E 1294.5x | P/E 1294.5x; multiple-compression risk |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[TRT]] | 56 | 48 | near 52W highs; strong liquidity | P/S 2.4x | unprofitable; multiple-compression risk |
| [[SKLZ]] | 56 | 46 | Gross margin 88%; strong liquidity | P/S 1.9x | unprofitable; beta 3.1 |
| [[OSS]] | 53 | 48 | passed the clean-universe and liquidity filters | P/E 43.1x | multiple-compression risk |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[NCNO]] | 59 | 40 | Gross margin 61%; strong liquidity | P/E 372.2x | P/E 372.2x; multiple-compression risk |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 61 (BL)
- **Highest Quality Score**: WOLF
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-23
