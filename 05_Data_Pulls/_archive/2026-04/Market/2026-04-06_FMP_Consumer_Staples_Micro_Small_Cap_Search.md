---
title: "Consumer Staples Micro/Small Cap Search - FMP"
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
| [[Consumer Staples]] | Consumer Defensive | 10 | 0 | 0 | 0 | 0 | 7 | 10 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Small | [[BRBR]] | 61 | 62 | consumer margin 14%; Op margin 14% | P/E 10.8x | input-cost sensitivity |
| [[Consumer Staples]] | Small | [[SMPL]] | 56 | 59 | consumer margin 14%; Op margin 14% | P/E 15.4x | input-cost sensitivity |
| [[Consumer Staples]] | Small | [[FLO]] | 52 | 53 | passed the clean-universe and liquidity filters | P/E 20.4x | thin liquidity; input-cost sensitivity |
| [[Consumer Staples]] | Reserve | [[VITL]] | 51 | 71 | consumer margin 12%; Op margin 12% | P/E 8.6x | weak sector fit; input-cost sensitivity |
| [[Consumer Staples]] | Special | [[NWL]] | 50 | 52 | passed the clean-universe and liquidity filters | P/S 0.2x | unprofitable; thin liquidity |
| [[Consumer Staples]] | Reserve | [[COTY]] | 49 | 52 | passed the clean-universe and liquidity filters | P/S 0.3x | unprofitable; thin liquidity |
| [[Consumer Staples]] | Reserve | [[GO]] | 46 | 47 | passed the clean-universe and liquidity filters | P/S 0.2x | unprofitable; thin liquidity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Mid | $10.0B | [[DAR]] | P/E 158.8x | 6.4x sector ceiling | 35 | P/E 158.8x vs ~25x sector ceiling; quality score 35 | P/E 158.8x; input-cost sensitivity |
| [[Consumer Staples]] | Mega | $449.4B | [[COST]] | P/E 52.6x | 2.1x sector ceiling | 44 | P/E 52.6x vs ~25x sector ceiling; quality score 44 | P/E 52.6x; input-cost sensitivity |
| [[Consumer Staples]] | Mega | $1007.0B | [[WMT]] | P/E 46.0x | 1.8x sector ceiling | 47 | P/E 46.0x vs ~25x sector ceiling; quality score 47 | P/E 46.0x; input-cost sensitivity |

## Consumer Staples Research Picks

- **Sector Lens**: food/beverage/household fit with defensive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BRBR]] | 61 | 62 | consumer margin 14%; Op margin 14% | P/E 10.8x | input-cost sensitivity |
| [[SMPL]] | 56 | 59 | consumer margin 14%; Op margin 14% | P/E 15.4x | input-cost sensitivity |
| [[FLO]] | 52 | 53 | passed the clean-universe and liquidity filters | P/E 20.4x | thin liquidity; input-cost sensitivity |

### Micro-Cap Picks

- No micro-cap picks passed the sector lens.

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[NWL]] | 50 | 52 | passed the clean-universe and liquidity filters | P/S 0.2x | unprofitable; thin liquidity |

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[VITL]] | 51 | 71 | consumer margin 12%; Op margin 12% | P/E 8.6x | weak sector fit; input-cost sensitivity |
| [[COTY]] | 49 | 52 | passed the clean-universe and liquidity filters | P/S 0.3x | unprofitable; thin liquidity |
| [[GO]] | 46 | 47 | passed the clean-universe and liquidity filters | P/S 0.2x | unprofitable; thin liquidity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 61 (BRBR)
- **Highest Quality Score**: VITL
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-06
