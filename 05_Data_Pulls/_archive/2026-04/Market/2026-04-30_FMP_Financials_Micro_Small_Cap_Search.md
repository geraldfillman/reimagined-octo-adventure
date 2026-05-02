---
title: "Financials Micro/Small Cap Search - FMP"
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
| [[Financials]] | Financial Services | 198 | 1 | 0 | 1 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Financials]] | Small | [[LC]] | 76 | 77 | P/B 1.3x; 36% target upside | P/E 10.9x | beta 2.0; credit-cycle sensitivity |
| [[Financials]] | Small | [[ECPG]] | 75 | 80 | ROE 28%; 22% target upside | P/E 7.1x | credit-cycle sensitivity |
| [[Financials]] | Small | [[PIPR]] | 73 | 71 | ROE 22%; Op margin 20% | P/E 20.7x | credit-cycle sensitivity |
| [[Financials]] | Special | [[CASH]] | 72 | 75 | ROE 22%; Op margin 29% | P/E 9.9x | credit-cycle sensitivity |
| [[Financials]] | Micro | [[RILY]] | 57 | 71 | P/B -1.3x; Op margin 15% | P/E 0.8x | credit-cycle sensitivity |
| [[Financials]] | Micro | [[AVBH]] | 56 | 54 | P/B 1.1x; near 52W highs | P/E 11.3x | credit-cycle sensitivity |
| [[Financials]] | Micro | [[TWFG]] | 55 | 52 | ROE 10%; 64% target upside | P/E 35.7x | P/E 35.7x; credit-cycle sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Financials]] | Small | $2.0B | [[CLBK]] | P/E 34.5x | 1.7x sector ceiling | 47 | P/E 34.5x vs ~20x sector ceiling; quality score 47 | P/E 34.5x; credit-cycle sensitivity |
| [[Financials]] | Large | $161.5B | [[BLK]] | P/E 25.8x | 1.3x sector ceiling | 64 | P/E 25.8x vs ~20x sector ceiling | P/E 25.8x; credit-cycle sensitivity |

## Financials Research Picks

- **Sector Lens**: bank/insurer/capital-markets fit with P/B, ROE, and profitability bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[LC]] | 76 | 77 | P/B 1.3x; 36% target upside | P/E 10.9x | beta 2.0; credit-cycle sensitivity |
| [[ECPG]] | 75 | 80 | ROE 28%; 22% target upside | P/E 7.1x | credit-cycle sensitivity |
| [[PIPR]] | 73 | 71 | ROE 22%; Op margin 20% | P/E 20.7x | credit-cycle sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[RILY]] | 57 | 71 | P/B -1.3x; Op margin 15% | P/E 0.8x | credit-cycle sensitivity |
| [[AVBH]] | 56 | 54 | P/B 1.1x; near 52W highs | P/E 11.3x | credit-cycle sensitivity |
| [[TWFG]] | 55 | 52 | ROE 10%; 64% target upside | P/E 35.7x | P/E 35.7x; credit-cycle sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CASH]] | 72 | 75 | ROE 22%; Op margin 29% | P/E 9.9x | credit-cycle sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 76 (LC)
- **Highest Quality Score**: ECPG
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-30
