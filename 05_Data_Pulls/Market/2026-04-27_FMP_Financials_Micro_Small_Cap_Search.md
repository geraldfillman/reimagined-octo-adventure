---
title: "Financials Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-27"
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
| [[Financials]] | Financial Services | 35 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Financials]] | Small | [[UVE]] | 66 | 74 | ROE 37%; Op margin 16% | P/E 5.8x | credit-cycle sensitivity |
| [[Financials]] | Small | [[TRIN]] | 64 | 76 | P/B 1.1x; Op margin 64% | P/E 8.9x | credit-cycle sensitivity |
| [[Financials]] | Small | [[OCFC]] | 61 | 61 | P/B 0.6x | P/E 15.4x | credit-cycle sensitivity |
| [[Financials]] | Special | [[DXYZ]] | 56 | 62 | P/B 0.9x | P/E 8.4x | unprofitable; beta 5.9 |
| [[Financials]] | Micro | [[PNNT]] | 53 | 67 | P/B 0.6x; Op margin 33% | P/E 11.3x | thin liquidity; credit-cycle sensitivity |
| [[Financials]] | Micro | [[XXI]] | 41 | 44 | P/B -60.5x | P/E 23.7x | credit-cycle sensitivity |
| [[Financials]] | Micro | [[HRZN]] | 36 | 33 | P/B 0.5x; Op margin 40% | P/S 10.2x | unprofitable; thin liquidity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Financials]] | Large | $144.4B | [[BX]] | P/E 30.8x | 1.5x sector ceiling | 68 | P/E 30.8x vs ~20x sector ceiling | P/E 30.8x; P/S 9.6x |

## Financials Research Picks

- **Sector Lens**: bank/insurer/capital-markets fit with P/B, ROE, and profitability bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[UVE]] | 66 | 74 | ROE 37%; Op margin 16% | P/E 5.8x | credit-cycle sensitivity |
| [[TRIN]] | 64 | 76 | P/B 1.1x; Op margin 64% | P/E 8.9x | credit-cycle sensitivity |
| [[OCFC]] | 61 | 61 | P/B 0.6x | P/E 15.4x | credit-cycle sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PNNT]] | 53 | 67 | P/B 0.6x; Op margin 33% | P/E 11.3x | thin liquidity; credit-cycle sensitivity |
| [[XXI]] | 41 | 44 | P/B -60.5x | P/E 23.7x | credit-cycle sensitivity |
| [[HRZN]] | 36 | 33 | P/B 0.5x; Op margin 40% | P/S 10.2x | unprofitable; thin liquidity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[DXYZ]] | 56 | 62 | P/B 0.9x | P/E 8.4x | unprofitable; beta 5.9 |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 66 (UVE)
- **Highest Quality Score**: TRIN
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-27
