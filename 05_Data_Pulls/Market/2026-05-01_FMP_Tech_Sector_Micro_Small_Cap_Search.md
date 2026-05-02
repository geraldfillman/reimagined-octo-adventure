---
title: "Tech Sector Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-05-01"
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
| [[Tech Sector]] | Small | [[BAND]] | 66 | 57 | near 52W highs; strong liquidity | P/E 0.3x | beta 2.0; multiple-compression risk |
| [[Tech Sector]] | Small | [[FIVN]] | 65 | 49 | Gross margin 55%; strong liquidity | P/E 29.8x | multiple-compression risk |
| [[Tech Sector]] | Small | [[WOLF]] | 63 | 47 | near 52W highs; strong liquidity | P/S 2.2x | unprofitable; multiple-compression risk |
| [[Tech Sector]] | Micro | [[MRLN]] | 61 | 52 | Gross margin 100%; 95% target upside | P/E 356.4x | P/E 356.4x; multiple-compression risk |
| [[Tech Sector]] | Special | [[PENG]] | 61 | 45 | near 52W highs; strong liquidity | P/E 29.9x | beta 2.2; multiple-compression risk |
| [[Tech Sector]] | Micro | [[OSS]] | 53 | 48 | passed the clean-universe and liquidity filters | P/E 44.2x | multiple-compression risk |
| [[Tech Sector]] | Micro | [[VELO]] | 49 | 35 | passed the clean-universe and liquidity filters | P/S 6.1x | unprofitable; beta 2.0 |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Tech Sector]] | Large | $194.2B | [[ADI]] | P/E 71.8x | 1.8x sector ceiling | 55 | P/E 71.8x vs ~40x sector ceiling | P/E 71.8x; P/S 16.5x |

## Tech Sector Research Picks

- **Sector Lens**: growth, gross margin, and software/networking fit bias
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BAND]] | 66 | 57 | near 52W highs; strong liquidity | P/E 0.3x | beta 2.0; multiple-compression risk |
| [[FIVN]] | 65 | 49 | Gross margin 55%; strong liquidity | P/E 29.8x | multiple-compression risk |
| [[WOLF]] | 63 | 47 | near 52W highs; strong liquidity | P/S 2.2x | unprofitable; multiple-compression risk |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[MRLN]] | 61 | 52 | Gross margin 100%; 95% target upside | P/E 356.4x | P/E 356.4x; multiple-compression risk |
| [[OSS]] | 53 | 48 | passed the clean-universe and liquidity filters | P/E 44.2x | multiple-compression risk |
| [[VELO]] | 49 | 35 | passed the clean-universe and liquidity filters | P/S 6.1x | unprofitable; beta 2.0 |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PENG]] | 61 | 45 | near 52W highs; strong liquidity | P/E 29.9x | beta 2.2; multiple-compression risk |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 66 (BAND)
- **Highest Quality Score**: BAND
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-05-01
