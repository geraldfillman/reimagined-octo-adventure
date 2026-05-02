---
title: "Financials Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-05-02"
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
| [[Financials]] | Financial Services | 205 | 1 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Financials]] | Small | [[LC]] | 75 | 76 | P/B 1.3x; 32% target upside | P/E 11.2x | beta 2.0; credit-cycle sensitivity |
| [[Financials]] | Small | [[PIPR]] | 74 | 75 | ROE 22%; 22% target upside | P/E 19.0x | credit-cycle sensitivity |
| [[Financials]] | Small | [[CSWC]] | 70 | 71 | ROE 11%; Op margin 54% | P/E 13.3x | credit-cycle sensitivity |
| [[Financials]] | Special | [[AGM]] | 65 | 66 | ROE 13%; Op margin 19% | P/E 10.9x | credit-cycle sensitivity |
| [[Financials]] | Micro | [[PFLC]] | 63 | 69 | Op margin 23%; near 52W highs | P/E 13.9x | credit-cycle sensitivity |
| [[Financials]] | Micro | [[ATLO]] | 61 | 68 | P/B 1.2x; Op margin 27% | P/E 12.0x | credit-cycle sensitivity |
| [[Financials]] | Micro | [[FVCB]] | 56 | 68 | P/B 0.1x; Op margin 27% | P/E 12.2x | credit-cycle sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Financials]] | Large | $165.0B | [[BLK]] | P/E 26.4x | 1.3x sector ceiling | 63 | P/E 26.4x vs ~20x sector ceiling | P/E 26.4x; credit-cycle sensitivity |

## Financials Research Picks

- **Sector Lens**: bank/insurer/capital-markets fit with P/B, ROE, and profitability bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[LC]] | 75 | 76 | P/B 1.3x; 32% target upside | P/E 11.2x | beta 2.0; credit-cycle sensitivity |
| [[PIPR]] | 74 | 75 | ROE 22%; 22% target upside | P/E 19.0x | credit-cycle sensitivity |
| [[CSWC]] | 70 | 71 | ROE 11%; Op margin 54% | P/E 13.3x | credit-cycle sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PFLC]] | 63 | 69 | Op margin 23%; near 52W highs | P/E 13.9x | credit-cycle sensitivity |
| [[ATLO]] | 61 | 68 | P/B 1.2x; Op margin 27% | P/E 12.0x | credit-cycle sensitivity |
| [[FVCB]] | 56 | 68 | P/B 0.1x; Op margin 27% | P/E 12.2x | credit-cycle sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AGM]] | 65 | 66 | ROE 13%; Op margin 19% | P/E 10.9x | credit-cycle sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 75 (LC)
- **Highest Quality Score**: LC
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-05-02
