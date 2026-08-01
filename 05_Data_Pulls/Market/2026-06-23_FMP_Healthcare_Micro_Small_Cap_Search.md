---
title: "Healthcare Micro/Small Cap Search - FMP"
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
| [[Healthcare]] | Healthcare | 284 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Healthcare]] | Small | [[UFPT]] | 68 | 58 | Op margin 15%; strong liquidity | P/E 26.4x | reimbursement risk |
| [[Healthcare]] | Small | [[SRPT]] | 63 | 47 | passed the clean-universe and liquidity filters | P/E 28.3x | clinical/dilution risk |
| [[Healthcare]] | Small | [[STOK]] | 61 | 31 | strong liquidity | P/S 61.9x | unprofitable; P/S 61.9x |
| [[Healthcare]] | Micro | [[NEO]] | 58 | 45 | passed the clean-universe and liquidity filters | P/S 0.4x | unprofitable; beta 1.8 |
| [[Healthcare]] | Special | [[NTLA]] | 57 | 30 | catalyst rerating setup; 62% target upside | P/S 26.2x | unprofitable; beta 1.8 |
| [[Healthcare]] | Micro | [[TENX]] | 55 | 36 | catalyst rerating setup; 149% target upside | P/B 5.3x | clinical/dilution risk |
| [[Healthcare]] | Micro | [[AVTX]] | 50 | 20 | strong liquidity | P/S 3482.0x | unprofitable; P/S 3482.0x |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Healthcare]] | Small | $2.0B | [[ASTH]] | P/E 65.8x | 1.6x sector ceiling | 37 | P/E 65.8x vs ~40x sector ceiling; quality score 37 | P/E 65.8x; reimbursement risk |

## Healthcare Research Picks

- **Sector Lens**: biotech/medtech catalyst bias with analyst-upside and revenue-inflection overlays
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[UFPT]] | 68 | 58 | Op margin 15%; strong liquidity | P/E 26.4x | reimbursement risk |
| [[SRPT]] | 63 | 47 | passed the clean-universe and liquidity filters | P/E 28.3x | clinical/dilution risk |
| [[STOK]] | 61 | 31 | strong liquidity | P/S 61.9x | unprofitable; P/S 61.9x |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[NEO]] | 58 | 45 | passed the clean-universe and liquidity filters | P/S 0.4x | unprofitable; beta 1.8 |
| [[TENX]] | 55 | 36 | catalyst rerating setup; 149% target upside | P/B 5.3x | clinical/dilution risk |
| [[AVTX]] | 50 | 20 | strong liquidity | P/S 3482.0x | unprofitable; P/S 3482.0x |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[NTLA]] | 57 | 30 | catalyst rerating setup; 62% target upside | P/S 26.2x | unprofitable; beta 1.8 |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 68 (UFPT)
- **Highest Quality Score**: UFPT
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-06-23
