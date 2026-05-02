---
title: "Tech Sector Micro/Small Cap Search - FMP"
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
| [[Tech Sector]] | Technology | 57 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Tech Sector]] | Small | [[AEHR]] | 55 | 25 | near 52W highs; strong liquidity | P/S 28.1x | unprofitable; beta 2.3 |
| [[Tech Sector]] | Small | [[NCNO]] | 54 | 40 | Gross margin 61% | P/E 374.2x | P/E 374.2x; multiple-compression risk |
| [[Tech Sector]] | Small | [[RCAT]] | 52 | 25 | strong liquidity | P/S 32.9x | unprofitable; P/S 32.9x |
| [[Tech Sector]] | Special | [[BKSY]] | 50 | 25 | near 52W highs | P/S 10.6x | unprofitable; beta 2.2 |
| [[Tech Sector]] | Micro | [[OSS]] | 48 | 48 | passed the clean-universe and liquidity filters | P/E 35.3x | thin liquidity; multiple-compression risk |
| [[Tech Sector]] | Micro | [[VELO]] | 47 | 40 | passed the clean-universe and liquidity filters | P/S 4.6x | unprofitable; beta 2.0 |
| [[Tech Sector]] | Micro | [[BNAI]] | 46 | 23 | passed the clean-universe and liquidity filters | P/S 2625.9x | unprofitable; P/S 2625.9x |

## Potential Overvalued Watchlist

- No selected candidates currently screen as stretched on forward/trailing earnings multiples.

## Tech Sector Research Picks

- **Sector Lens**: growth, gross margin, and software/networking fit bias
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AEHR]] | 55 | 25 | near 52W highs; strong liquidity | P/S 28.1x | unprofitable; beta 2.3 |
| [[NCNO]] | 54 | 40 | Gross margin 61% | P/E 374.2x | P/E 374.2x; multiple-compression risk |
| [[RCAT]] | 52 | 25 | strong liquidity | P/S 32.9x | unprofitable; P/S 32.9x |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[OSS]] | 48 | 48 | passed the clean-universe and liquidity filters | P/E 35.3x | thin liquidity; multiple-compression risk |
| [[VELO]] | 47 | 40 | passed the clean-universe and liquidity filters | P/S 4.6x | unprofitable; beta 2.0 |
| [[BNAI]] | 46 | 23 | passed the clean-universe and liquidity filters | P/S 2625.9x | unprofitable; P/S 2625.9x |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BKSY]] | 50 | 25 | near 52W highs | P/S 10.6x | unprofitable; beta 2.2 |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 55 (AEHR)
- **Highest Quality Score**: OSS
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-06
