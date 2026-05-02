---
title: "Consumer Discretionary Micro/Small Cap Search - FMP"
source: "Financial Modeling Prep"
date_pulled: "2026-05-01"
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
| [[Consumer Discretionary]] | Consumer Cyclical | 120 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Discretionary]] | Small | [[CRI]] | 67 | 58 | strong liquidity | P/E 13.0x | consumer-demand sensitivity |
| [[Consumer Discretionary]] | Small | [[RVLV]] | 64 | 54 | strong liquidity | P/E 28.8x | beta 1.8; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Reserve | [[BLBD]] | 62 | 64 | consumer margin 11%; Op margin 11% | P/E 15.4x | weak sector fit; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Small | [[FUN]] | 55 | 50 | strong liquidity | P/S 0.6x | unprofitable; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Micro | [[JAKK]] | 50 | 44 | near 52W highs | P/E 27.3x | consumer-demand sensitivity |
| [[Consumer Discretionary]] | Micro | [[JACK]] | 47 | 52 | passed the clean-universe and liquidity filters | P/S 0.2x | unprofitable; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Micro | [[AGH]] | 37 | 25 | passed the clean-universe and liquidity filters | P/S 22.9x | unprofitable; beta 9.0 |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Discretionary]] | Mid | $9.9B | [[BROS]] | P/E 90.6x | 3.6x sector ceiling | 47 | P/E 90.6x vs ~25x sector ceiling; quality score 47 | beta 2.5; P/E 90.6x |
| [[Consumer Discretionary]] | Large | $174.2B | [[TJX]] | P/E 32.1x | 1.3x sector ceiling | 53 | P/E 32.1x vs ~25x sector ceiling; quality score 53 | P/E 32.1x; consumer-demand sensitivity |
| [[Consumer Discretionary]] | Mega | $2887.0B | [[AMZN]] | P/E 31.8x | 1.3x sector ceiling | 59 | P/E 31.8x vs ~25x sector ceiling | P/E 31.8x; consumer-demand sensitivity |

## Consumer Discretionary Research Picks

- **Sector Lens**: retail/leisure/autos fit with demand-sensitive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CRI]] | 67 | 58 | strong liquidity | P/E 13.0x | consumer-demand sensitivity |
| [[RVLV]] | 64 | 54 | strong liquidity | P/E 28.8x | beta 1.8; consumer-demand sensitivity |
| [[FUN]] | 55 | 50 | strong liquidity | P/S 0.6x | unprofitable; consumer-demand sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[JAKK]] | 50 | 44 | near 52W highs | P/E 27.3x | consumer-demand sensitivity |
| [[JACK]] | 47 | 52 | passed the clean-universe and liquidity filters | P/S 0.2x | unprofitable; consumer-demand sensitivity |
| [[AGH]] | 37 | 25 | passed the clean-universe and liquidity filters | P/S 22.9x | unprofitable; beta 9.0 |

### Special Situation

- No special situation selected.

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BLBD]] | 62 | 64 | consumer margin 11%; Op margin 11% | P/E 15.4x | weak sector fit; consumer-demand sensitivity |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 67 (CRI)
- **Highest Quality Score**: BLBD
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-05-01
