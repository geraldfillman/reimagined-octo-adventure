---
title: "Financials Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-20"
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
| [[Financials]] | Financial Services | 175 | 1 | 0 | 1 | 1 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Financials]] | Small | [[PIPR]] | 73 | 68 | ROE 22%; Op margin 20% | P/E 21.7x | credit-cycle sensitivity |
| [[Financials]] | Small | [[AGM]] | 65 | 66 | P/B 1.3x; Op margin 19% | P/E 10.7x | credit-cycle sensitivity |
| [[Financials]] | Small | [[BFC]] | 65 | 63 | ROE 11%; Op margin 34% | P/E 21.6x | credit-cycle sensitivity |
| [[Financials]] | Special | [[NWBI]] | 65 | 66 | P/B 1.0x; Op margin 19% | P/E 15.7x | credit-cycle sensitivity |
| [[Financials]] | Micro | [[FCCO]] | 60 | 70 | ROE 12%; Op margin 23% | P/E 12.4x | credit-cycle sensitivity |
| [[Financials]] | Micro | [[ISTR]] | 59 | 68 | P/B 0.9x; Op margin 18% | P/E 13.7x | credit-cycle sensitivity |
| [[Financials]] | Micro | [[MRBK]] | 59 | 67 | P/B 1.2x; Op margin 14% | P/E 10.8x | credit-cycle sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Financials]] | Small | $2.0B | [[PWP]] | P/E 41.0x | 2.1x sector ceiling | 35 | P/E 41.0x vs ~20x sector ceiling; quality score 35 | target below spot; P/E 41.0x |
| [[Financials]] | Large | $163.7B | [[BLK]] | P/E 27.2x | 1.4x sector ceiling | 62 | P/E 27.2x vs ~20x sector ceiling | P/E 27.2x; credit-cycle sensitivity |

## Financials Research Picks

- **Sector Lens**: bank/insurer/capital-markets fit with P/B, ROE, and profitability bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PIPR]] | 73 | 68 | ROE 22%; Op margin 20% | P/E 21.7x | credit-cycle sensitivity |
| [[AGM]] | 65 | 66 | P/B 1.3x; Op margin 19% | P/E 10.7x | credit-cycle sensitivity |
| [[BFC]] | 65 | 63 | ROE 11%; Op margin 34% | P/E 21.6x | credit-cycle sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[FCCO]] | 60 | 70 | ROE 12%; Op margin 23% | P/E 12.4x | credit-cycle sensitivity |
| [[ISTR]] | 59 | 68 | P/B 0.9x; Op margin 18% | P/E 13.7x | credit-cycle sensitivity |
| [[MRBK]] | 59 | 67 | P/B 1.2x; Op margin 14% | P/E 10.8x | credit-cycle sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[NWBI]] | 65 | 66 | P/B 1.0x; Op margin 19% | P/E 15.7x | credit-cycle sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 73 (PIPR)
- **Highest Quality Score**: FCCO
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-20
