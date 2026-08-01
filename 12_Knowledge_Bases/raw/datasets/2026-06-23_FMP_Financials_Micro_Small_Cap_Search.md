---
title: "Financials Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-06-23"
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
| [[Financials]] | Financial Services | 119 | 0 | 0 | 0 | 1 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Financials]] | Small | [[EZPW]] | 67 | 69 | ROE 14%; Op margin 14% | P/E 13.7x | credit-cycle sensitivity |
| [[Financials]] | Small | [[LABU]] | 60 | N/A | near 52W highs; fundamentals pending | fundamentals pending | fundamental coverage missing; beta 3.8 |
| [[Financials]] | Small | [[BWIN]] | 59 | 52 | 25% target upside; strong liquidity | P/S 1.2x | unprofitable; credit-cycle sensitivity |
| [[Financials]] | Micro | [[DXYZ]] | 56 | 54 | P/B 0.8x; strong liquidity | P/E 7.5x | unprofitable; beta 5.1 |
| [[Financials]] | Special | [[PURR]] | 55 | 30 | strong liquidity | P/S 389.3x | unprofitable; P/S 389.3x |
| [[Financials]] | Micro | [[AAPU]] | 51 | N/A | near 52W highs; fundamentals pending | fundamentals pending | fundamental coverage missing; credit-cycle sensitivity |
| [[Financials]] | Micro | [[MSFU]] | 45 | N/A | strong liquidity; fundamentals pending | fundamentals pending | fundamental coverage missing; beta 2.0 |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Financials]] | Large | $164.7B | [[IBKR]] | P/E 40.9x | 2.0x sector ceiling | 53 | P/E 40.9x vs ~20x sector ceiling; quality score 53 | P/E 40.9x; P/S 15.5x |
| [[Financials]] | Large | $158.7B | [[BLK]] | P/E 25.3x | 1.3x sector ceiling | 61 | P/E 25.3x vs ~20x sector ceiling | P/E 25.3x; credit-cycle sensitivity |

## Financials Research Picks

- **Sector Lens**: bank/insurer/capital-markets fit with P/B, ROE, and profitability bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[EZPW]] | 67 | 69 | ROE 14%; Op margin 14% | P/E 13.7x | credit-cycle sensitivity |
| [[LABU]] | 60 | N/A | near 52W highs; fundamentals pending | fundamentals pending | fundamental coverage missing; beta 3.8 |
| [[BWIN]] | 59 | 52 | 25% target upside; strong liquidity | P/S 1.2x | unprofitable; credit-cycle sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[DXYZ]] | 56 | 54 | P/B 0.8x; strong liquidity | P/E 7.5x | unprofitable; beta 5.1 |
| [[AAPU]] | 51 | N/A | near 52W highs; fundamentals pending | fundamentals pending | fundamental coverage missing; credit-cycle sensitivity |
| [[MSFU]] | 45 | N/A | strong liquidity; fundamentals pending | fundamentals pending | fundamental coverage missing; beta 2.0 |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PURR]] | 55 | 30 | strong liquidity | P/S 389.3x | unprofitable; P/S 389.3x |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 67 (EZPW)
- **Highest Quality Score**: EZPW
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-06-23
