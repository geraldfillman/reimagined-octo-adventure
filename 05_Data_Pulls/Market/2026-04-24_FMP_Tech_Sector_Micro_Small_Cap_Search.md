---
title: "Tech Sector Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-24"
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
| [[Tech Sector]] | Technology | 161 | 0 | 0 | 0 | 1 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Tech Sector]] | Small | [[PDFS]] | 64 | 40 | Gross margin 73%; near 52W highs | P/S 8.5x | unprofitable; P/S 8.5x |
| [[Tech Sector]] | Small | [[WOLF]] | 61 | 48 | near 52W highs; strong liquidity | P/S 1.7x | unprofitable; multiple-compression risk |
| [[Tech Sector]] | Small | [[PENG]] | 61 | 45 | near 52W highs; strong liquidity | P/E 29.2x | beta 2.2; multiple-compression risk |
| [[Tech Sector]] | Special | [[AOSL]] | 60 | 41 | near 52W highs; strong liquidity | P/S 1.9x | unprofitable; beta 1.9 |
| [[Tech Sector]] | Micro | [[TRT]] | 57 | 48 | near 52W highs; strong liquidity | P/S 2.4x | unprofitable; multiple-compression risk |
| [[Tech Sector]] | Micro | [[INTT]] | 57 | 51 | near 52W highs | P/S 2.0x | unprofitable; multiple-compression risk |
| [[Tech Sector]] | Micro | [[ALMU]] | 49 | 29 | Gross margin 50%; strong liquidity | P/S 50.7x | unprofitable; P/S 50.7x |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Tech Sector]] | Small | $2.0B | [[VERX]] | P/E 304.1x | 7.6x sector ceiling | 41 | P/E 304.1x vs ~40x sector ceiling; quality score 41 | P/E 304.1x; multiple-compression risk |
| [[Tech Sector]] | Large | $197.2B | [[ADI]] | P/E 72.9x | 1.8x sector ceiling | 55 | P/E 72.9x vs ~40x sector ceiling | P/E 72.9x; P/S 16.8x |

## Tech Sector Research Picks

- **Sector Lens**: growth, gross margin, and software/networking fit bias
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PDFS]] | 64 | 40 | Gross margin 73%; near 52W highs | P/S 8.5x | unprofitable; P/S 8.5x |
| [[WOLF]] | 61 | 48 | near 52W highs; strong liquidity | P/S 1.7x | unprofitable; multiple-compression risk |
| [[PENG]] | 61 | 45 | near 52W highs; strong liquidity | P/E 29.2x | beta 2.2; multiple-compression risk |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[TRT]] | 57 | 48 | near 52W highs; strong liquidity | P/S 2.4x | unprofitable; multiple-compression risk |
| [[INTT]] | 57 | 51 | near 52W highs | P/S 2.0x | unprofitable; multiple-compression risk |
| [[ALMU]] | 49 | 29 | Gross margin 50%; strong liquidity | P/S 50.7x | unprofitable; P/S 50.7x |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AOSL]] | 60 | 41 | near 52W highs; strong liquidity | P/S 1.9x | unprofitable; beta 1.9 |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 64 (PDFS)
- **Highest Quality Score**: INTT
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-24
