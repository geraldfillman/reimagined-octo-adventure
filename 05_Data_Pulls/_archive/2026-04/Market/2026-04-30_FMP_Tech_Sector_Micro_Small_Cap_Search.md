---
title: "Tech Sector Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-30"
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
| [[Tech Sector]] | Technology | 167 | 0 | 0 | 0 | 1 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Tech Sector]] | Small | [[ATEN]] | 71 | 54 | Gross margin 79%; Op margin 17% | P/E 42.8x | multiple-compression risk |
| [[Tech Sector]] | Small | [[BLKB]] | 71 | 72 | Gross margin 59%; 22% target upside | P/E 12.8x | multiple-compression risk |
| [[Tech Sector]] | Micro | [[MRLN]] | 61 | 52 | Gross margin 100%; 132% target upside | P/E 298.8x | P/E 298.8x; multiple-compression risk |
| [[Tech Sector]] | Small | [[WOLF]] | 61 | 49 | strong liquidity | P/S 1.5x | unprofitable; multiple-compression risk |
| [[Tech Sector]] | Special | [[ALKT]] | 57 | 40 | Gross margin 58%; strong liquidity | P/S 3.7x | unprofitable; multiple-compression risk |
| [[Tech Sector]] | Micro | [[VELO]] | 50 | 36 | strong liquidity | P/S 5.9x | unprofitable; beta 2.0 |
| [[Tech Sector]] | Micro | [[ALMU]] | 47 | 29 | Gross margin 50% | P/S 52.0x | unprofitable; P/S 52.0x |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Tech Sector]] | Small | $2.0B | [[VERX]] | P/E 297.9x | 7.4x sector ceiling | 41 | P/E 297.9x vs ~40x sector ceiling; quality score 41 | P/E 297.9x; multiple-compression risk |
| [[Tech Sector]] | Large | $190.1B | [[ADI]] | P/E 70.3x | 1.8x sector ceiling | 55 | P/E 70.3x vs ~40x sector ceiling | P/E 70.3x; P/S 16.2x |

## Tech Sector Research Picks

- **Sector Lens**: growth, gross margin, and software/networking fit bias
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[ATEN]] | 71 | 54 | Gross margin 79%; Op margin 17% | P/E 42.8x | multiple-compression risk |
| [[BLKB]] | 71 | 72 | Gross margin 59%; 22% target upside | P/E 12.8x | multiple-compression risk |
| [[WOLF]] | 61 | 49 | strong liquidity | P/S 1.5x | unprofitable; multiple-compression risk |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[MRLN]] | 61 | 52 | Gross margin 100%; 132% target upside | P/E 298.8x | P/E 298.8x; multiple-compression risk |
| [[VELO]] | 50 | 36 | strong liquidity | P/S 5.9x | unprofitable; beta 2.0 |
| [[ALMU]] | 47 | 29 | Gross margin 50% | P/S 52.0x | unprofitable; P/S 52.0x |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[ALKT]] | 57 | 40 | Gross margin 58%; strong liquidity | P/S 3.7x | unprofitable; multiple-compression risk |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 71 (ATEN)
- **Highest Quality Score**: BLKB
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-30
