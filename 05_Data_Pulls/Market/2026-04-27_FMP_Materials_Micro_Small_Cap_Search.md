---
title: "Materials Micro/Small Cap Search - FMP"
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
| [[Materials]] | Basic Materials | 21 | 0 | 0 | 0 | 1 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Materials]] | Small | [[CRML]] | 51 | 28 | strong liquidity | P/S 2875.3x | unprofitable; P/S 2875.3x |
| [[Materials]] | Small | [[LWLG]] | 50 | 20 | near 52W highs; strong liquidity | P/S 7612.6x | unprofitable; beta 2.8 |
| [[Materials]] | Reserve | [[CMP]] | 50 | 49 | near 52W highs | P/S 0.8x | weak sector fit; unprofitable |
| [[Materials]] | Small | [[TROX]] | 48 | 34 | near 52W highs | P/S 0.6x | unprofitable; target below spot |
| [[Materials]] | Micro | [[GORO]] | 43 | 46 | Op margin 13%; near 52W highs | P/S 2.4x | unprofitable; thin liquidity |
| [[Materials]] | Micro | [[PZG]] | 33 | 32 | passed the clean-universe and liquidity filters | P/B 4.4x | thin liquidity; commodity-cycle sensitivity |
| [[Materials]] | Micro | [[ATLX]] | 29 | 20 | passed the clean-universe and liquidity filters | P/S 939.0x | unprofitable; thin liquidity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Materials]] | Mid | $9.7B | [[ESI]] | P/E 50.7x | 2.0x sector ceiling | 42 | P/E 50.7x vs ~25x sector ceiling; quality score 42 | target below spot; P/E 50.7x |
| [[Materials]] | Large | $148.3B | [[SCCO]] | P/E 34.7x | 1.4x sector ceiling | 53 | P/E 34.7x vs ~25x sector ceiling; quality score 53 | target below spot; P/E 34.7x |
| [[Materials]] | Large | $83.8B | [[SHW]] | P/E 32.4x | 1.3x sector ceiling | 56 | P/E 32.4x vs ~25x sector ceiling | P/E 32.4x; commodity-cycle sensitivity |
| [[Materials]] | Large | $87.1B | [[FCX]] | P/E 32.0x | 1.3x sector ceiling | 54 | P/E 32.0x vs ~25x sector ceiling; quality score 54 | P/E 32.0x; commodity-cycle sensitivity |

## Materials Research Picks

- **Sector Lens**: chemicals/mining/metals fit with commodity-cycle value bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CRML]] | 51 | 28 | strong liquidity | P/S 2875.3x | unprofitable; P/S 2875.3x |
| [[LWLG]] | 50 | 20 | near 52W highs; strong liquidity | P/S 7612.6x | unprofitable; beta 2.8 |
| [[TROX]] | 48 | 34 | near 52W highs | P/S 0.6x | unprofitable; target below spot |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[GORO]] | 43 | 46 | Op margin 13%; near 52W highs | P/S 2.4x | unprofitable; thin liquidity |
| [[PZG]] | 33 | 32 | passed the clean-universe and liquidity filters | P/B 4.4x | thin liquidity; commodity-cycle sensitivity |
| [[ATLX]] | 29 | 20 | passed the clean-universe and liquidity filters | P/S 939.0x | unprofitable; thin liquidity |

### Special Situation

- No special situation selected.

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[CMP]] | 50 | 49 | near 52W highs | P/S 0.8x | weak sector fit; unprofitable |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 51 (CRML)
- **Highest Quality Score**: CMP
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Financial Modeling Prep
- **Auto-pulled**: 2026-04-27
