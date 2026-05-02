---
title: "Consumer Discretionary Micro/Small Cap Search - FMP"
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
| [[Consumer Discretionary]] | Consumer Cyclical | 27 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Discretionary]] | Small | [[EYE]] | 58 | 42 | passed the clean-universe and liquidity filters | P/E 65.0x | P/E 65.0x; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Small | [[PENN]] | 53 | 52 | 51% target upside | P/S 0.3x | unprofitable; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Small | [[PTON]] | 53 | 60 | passed the clean-universe and liquidity filters | P/S 0.8x | unprofitable; beta 2.4 |
| [[Consumer Discretionary]] | Reserve | [[KSS]] | 52 | 60 | passed the clean-universe and liquidity filters | P/E 5.4x | weak sector fit; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Special | [[FUN]] | 49 | 50 | passed the clean-universe and liquidity filters | P/S 0.6x | unprofitable; thin liquidity |
| [[Consumer Discretionary]] | Micro | [[AGH]] | 30 | 25 | passed the clean-universe and liquidity filters | P/S 20.3x | unprofitable; beta 9.7 |
| [[Consumer Discretionary]] | Micro | [[TRON]] | 27 | 25 | passed the clean-universe and liquidity filters | P/S 17.5x | unprofitable; thin liquidity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Discretionary]] | Mid | $10.0B | [[MGM]] | P/E 46.7x | 1.9x sector ceiling | 41 | P/E 46.7x vs ~25x sector ceiling; quality score 41 | P/E 46.7x; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Large | $178.8B | [[TJX]] | P/E 32.9x | 1.3x sector ceiling | 53 | P/E 32.9x vs ~25x sector ceiling; quality score 53 | P/E 32.9x; consumer-demand sensitivity |

## Consumer Discretionary Research Picks

- **Sector Lens**: retail/leisure/autos fit with demand-sensitive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[EYE]] | 58 | 42 | passed the clean-universe and liquidity filters | P/E 65.0x | P/E 65.0x; consumer-demand sensitivity |
| [[PENN]] | 53 | 52 | 51% target upside | P/S 0.3x | unprofitable; consumer-demand sensitivity |
| [[PTON]] | 53 | 60 | passed the clean-universe and liquidity filters | P/S 0.8x | unprofitable; beta 2.4 |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AGH]] | 30 | 25 | passed the clean-universe and liquidity filters | P/S 20.3x | unprofitable; beta 9.7 |
| [[TRON]] | 27 | 25 | passed the clean-universe and liquidity filters | P/S 17.5x | unprofitable; thin liquidity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[FUN]] | 49 | 50 | passed the clean-universe and liquidity filters | P/S 0.6x | unprofitable; thin liquidity |

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[KSS]] | 52 | 60 | passed the clean-universe and liquidity filters | P/E 5.4x | weak sector fit; consumer-demand sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 58 (EYE)
- **Highest Quality Score**: PTON
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-06
