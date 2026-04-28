---
title: "Tech Sector Micro/Small Cap Search - FMP"
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
| [[Tech Sector]] | Technology | 70 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Tech Sector]] | Small | [[ATEN]] | 70 | 52 | Gross margin 79%; Op margin 16% | P/E 46.8x | target below spot; multiple-compression risk |
| [[Tech Sector]] | Small | [[PRGS]] | 69 | 68 | Gross margin 79%; Op margin 17% | P/E 15.3x | multiple-compression risk |
| [[Tech Sector]] | Small | [[WOLF]] | 61 | 49 | strong liquidity | P/S 1.5x | unprofitable; multiple-compression risk |
| [[Tech Sector]] | Special | [[ASGN]] | 60 | 55 | passed the clean-universe and liquidity filters | P/E 14.7x | multiple-compression risk |
| [[Tech Sector]] | Micro | [[INTT]] | 56 | 51 | near 52W highs | P/S 1.7x | unprofitable; multiple-compression risk |
| [[Tech Sector]] | Micro | [[TBCH]] | 51 | 60 | passed the clean-universe and liquidity filters | P/E 14.9x | beta 2.3; multiple-compression risk |
| [[Tech Sector]] | Micro | [[BKKT]] | 49 | 54 | Gross margin 65% | P/S 0.1x | unprofitable; beta 6.1 |

## Potential Overvalued Watchlist

- No selected candidates currently screen as stretched on forward/trailing earnings multiples.

## Tech Sector Research Picks

- **Sector Lens**: growth, gross margin, and software/networking fit bias
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[ATEN]] | 70 | 52 | Gross margin 79%; Op margin 16% | P/E 46.8x | target below spot; multiple-compression risk |
| [[PRGS]] | 69 | 68 | Gross margin 79%; Op margin 17% | P/E 15.3x | multiple-compression risk |
| [[WOLF]] | 61 | 49 | strong liquidity | P/S 1.5x | unprofitable; multiple-compression risk |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[INTT]] | 56 | 51 | near 52W highs | P/S 1.7x | unprofitable; multiple-compression risk |
| [[TBCH]] | 51 | 60 | passed the clean-universe and liquidity filters | P/E 14.9x | beta 2.3; multiple-compression risk |
| [[BKKT]] | 49 | 54 | Gross margin 65% | P/S 0.1x | unprofitable; beta 6.1 |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[ASGN]] | 60 | 55 | passed the clean-universe and liquidity filters | P/E 14.7x | multiple-compression risk |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 70 (ATEN)
- **Highest Quality Score**: PRGS
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-20
