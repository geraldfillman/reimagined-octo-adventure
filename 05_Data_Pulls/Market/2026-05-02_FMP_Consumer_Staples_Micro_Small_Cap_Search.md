---
title: "Consumer Staples Micro/Small Cap Search - FMP"
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
| [[Consumer Staples]] | Consumer Defensive | 41 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Small | [[TPB]] | 67 | 71 | consumer margin 21%; 57% target upside | P/E 27.1x | input-cost sensitivity |
| [[Consumer Staples]] | Small | [[NWL]] | 64 | 58 | 32% target upside; strong liquidity | P/S 0.3x | unprofitable; input-cost sensitivity |
| [[Consumer Staples]] | Small | [[SPB]] | 64 | 53 | near 52W highs; strong liquidity | P/E 18.5x | input-cost sensitivity |
| [[Consumer Staples]] | Special | [[JJSF]] | 57 | 47 | strong liquidity | P/E 27.4x | input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[OFRM]] | 52 | 60 | 31% target upside | P/S 0.6x | unprofitable; input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[LFVN]] | 51 | 71 | passed the clean-universe and liquidity filters | P/E 8.7x | thin liquidity; input-cost sensitivity |
| [[Consumer Staples]] | Micro | [[BRCB]] | 48 | 61 | 74% target upside | P/S 1.1x | unprofitable; input-cost sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Mega | $1049.1B | [[WMT]] | P/E 47.9x | 1.9x sector ceiling | 45 | P/E 47.9x vs ~25x sector ceiling; quality score 45 | P/E 47.9x; input-cost sensitivity |
| [[Consumer Staples]] | Mid | $8.7B | [[CELH]] | P/E 73.5x | 2.9x sector ceiling | 47 | P/E 73.5x vs ~25x sector ceiling; quality score 47 | P/E 73.5x; input-cost sensitivity |
| [[Consumer Staples]] | Mid | $8.2B | [[ACI]] | P/E 38.9x | 1.6x sector ceiling | 41 | P/E 38.9x vs ~25x sector ceiling; quality score 41 | P/E 38.9x; input-cost sensitivity |

## Consumer Staples Research Picks

- **Sector Lens**: food/beverage/household fit with defensive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[TPB]] | 67 | 71 | consumer margin 21%; 57% target upside | P/E 27.1x | input-cost sensitivity |
| [[NWL]] | 64 | 58 | 32% target upside; strong liquidity | P/S 0.3x | unprofitable; input-cost sensitivity |
| [[SPB]] | 64 | 53 | near 52W highs; strong liquidity | P/E 18.5x | input-cost sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[OFRM]] | 52 | 60 | 31% target upside | P/S 0.6x | unprofitable; input-cost sensitivity |
| [[LFVN]] | 51 | 71 | passed the clean-universe and liquidity filters | P/E 8.7x | thin liquidity; input-cost sensitivity |
| [[BRCB]] | 48 | 61 | 74% target upside | P/S 1.1x | unprofitable; input-cost sensitivity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[JJSF]] | 57 | 47 | strong liquidity | P/E 27.4x | input-cost sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 67 (TPB)
- **Highest Quality Score**: TPB
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-05-02
