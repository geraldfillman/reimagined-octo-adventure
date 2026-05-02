---
title: "Financials Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-04-06"
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
| [[Financials]] | Financial Services | 39 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Financials]] | Small | [[TRIN]] | 64 | 76 | P/B 1.1x; Op margin 64% | P/E 8.6x | credit-cycle sensitivity |
| [[Financials]] | Small | [[CSWC]] | 64 | 72 | ROE 11%; Op margin 54% | P/E 12.6x | credit-cycle sensitivity |
| [[Financials]] | Small | [[DXYZ]] | 56 | 62 | P/B 0.8x | P/E 8.2x | unprofitable; beta 6.6 |
| [[Financials]] | Micro | [[UBFO]] | 55 | 68 | P/B 1.3x; Op margin 26% | P/E 14.8x | credit-cycle sensitivity |
| [[Financials]] | Micro | [[BLFY]] | 51 | 48 | P/B 0.8x; near 52W highs | P/S 2.8x | unprofitable; credit-cycle sensitivity |
| [[Financials]] | Micro | [[SWKH]] | 47 | 52 | P/B 0.8x; Op margin 59% | P/S 4.7x | unprofitable; thin liquidity |
| [[Financials]] | Special | [[SBET]] | 45 | 28 | P/B 0.5x | P/S 44.7x | unprofitable; beta 10.0 |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Financials]] | Small | $805.6M | [[PX]] | P/E 40.4x | 2.0x sector ceiling | 48 | P/E 40.4x vs ~20x sector ceiling; quality score 48 | P/E 40.4x; credit-cycle sensitivity |
| [[Financials]] | Large | $134.0B | [[BX]] | P/E 28.8x | 1.4x sector ceiling | 63 | P/E 28.8x vs ~20x sector ceiling | P/E 28.8x; P/S 9.7x |

## Financials Research Picks

- **Sector Lens**: bank/insurer/capital-markets fit with P/B, ROE, and profitability bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[TRIN]] | 64 | 76 | P/B 1.1x; Op margin 64% | P/E 8.6x | credit-cycle sensitivity |
| [[CSWC]] | 64 | 72 | ROE 11%; Op margin 54% | P/E 12.6x | credit-cycle sensitivity |
| [[DXYZ]] | 56 | 62 | P/B 0.8x | P/E 8.2x | unprofitable; beta 6.6 |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[UBFO]] | 55 | 68 | P/B 1.3x; Op margin 26% | P/E 14.8x | credit-cycle sensitivity |
| [[BLFY]] | 51 | 48 | P/B 0.8x; near 52W highs | P/S 2.8x | unprofitable; credit-cycle sensitivity |
| [[SWKH]] | 47 | 52 | P/B 0.8x; Op margin 59% | P/S 4.7x | unprofitable; thin liquidity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SBET]] | 45 | 28 | P/B 0.5x | P/S 44.7x | unprofitable; beta 10.0 |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 64 (TRIN)
- **Highest Quality Score**: TRIN
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-06
