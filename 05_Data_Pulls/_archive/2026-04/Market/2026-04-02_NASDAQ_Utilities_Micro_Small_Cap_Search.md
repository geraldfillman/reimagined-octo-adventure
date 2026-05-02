---
title: "Utilities Micro/Small Cap Search - NASDAQ"
source: "Nasdaq Public Screener"
date_pulled: "2026-04-02"
domain: "market"
data_type: "screen"
frequency: "on-demand"
signal_status: "clear"
signals: []
tags: ["equities", "screener", "micro-cap", "small-cap", "nasdaq"]
---

## Search Criteria

- **Universe**: US-listed equities inside the selected sector taxonomy
- **Market Cap Range**: $50.0M to $2.0B
- **Micro-Cap Cutoff**: Below $300.0M
- **Price Floor**: $1.00
- **Volume Floor**: 100.0K shares
- **Per-Sector Limit**: 7
- **Phase 1 Exclusions**: funds/ETFs, ADRs/ADS, LP-trust-unit structures, duplicate share classes
- **Phase 3 Quality Score**: Alpha Vantage overview plus SEC company-facts growth, margin, returns, valuation, and analyst-upside factors
- **Phase 4 Output**: up to 3 small caps, up to 3 micro caps, plus 1 special situation per sector, then reserve names up to the per-sector limit
- **Phase 5 Columns**: why now, valuation snapshot, and key risk for each research pick
- **Phase 6 Sector Lens**: primary picks must pass a sector-fit gate and are re-ranked with sector-specific valuation and profitability rules
- **Phase 7 Overvalued Watchlist**: sector-aware forward/trailing P/E stretch screen across all market caps, while keeping the same price, country, and exclusion filters plus a $5.0M dollar-volume floor and sector-fit gate
- **Provider**: Nasdaq Public Screener
- **Fundamentals Coverage**: 3 cached/live Alpha Vantage or SEC company-facts profiles across selected names
- **Taxonomy Note**: Nasdaq sectors are normalized with text-based industry/company overrides (249 rows reassigned); [[Communication Services]] maps to Telecommunications labels, and unclassified Miscellaneous names are excluded.

## Sector Coverage

| Vault Sector | Source Sector | Raw | Funds/ETF | ADR/ADS | LP/Trust | Dupes | Fund | Eligible | Final |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Utilities]] | Utilities | 5 | 0 | 0 | 1 | 0 | 3 | 4 | 4 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Utilities]] | Small | [[NNE]] | 62 | 50 | strong liquidity | P/B 1.8x | capital-intensity risk |
| [[Utilities]] | Small | [[CDZI]] | 38 | 37 | Rev +383% YoY | P/S 41.6x | unprofitable; thin liquidity |
| [[Utilities]] | Small | [[GUT]] | 38 | N/A | clean-universe survivor; fundamentals pending | fundamentals pending | fundamental coverage missing; thin liquidity |
| [[Utilities]] | Micro | [[MNTK]] | 36 | 29 | P/B 0.6x | P/E 90.4x | thin liquidity; P/E 90.4x |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Utilities]] | Mid | $8.3B | [[CWEN]] | P/E 49.0x | 2.4x sector ceiling | 40 | P/E 49.0x vs ~20x sector ceiling; Rev +4% does not fully support it | P/E 49.0x; capital-intensity risk |
| [[Utilities]] | Large | $85.8B | [[CEG]] | P/E 37.0x | 1.8x sector ceiling | 47 | P/E 37.0x vs ~20x sector ceiling; Rev +8% does not fully support it | P/E 37.0x; capital-intensity risk |
| [[Utilities]] | Large | $88.0B | [[WMB]] | P/E 33.6x | 1.7x sector ceiling | 56 | P/E 33.6x vs ~20x sector ceiling | P/E 33.6x; capital-intensity risk |
| [[Utilities]] | Large | $109.0B | [[SO]] | P/E 25.1x | 1.3x sector ceiling | 58 | P/E 25.1x vs ~20x sector ceiling | P/E 25.1x; capital-intensity risk |

## Utilities Research Picks

- **Sector Lens**: regulated utility/water/power fit with defensive beta and asset-value bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[NNE]] | 62 | 50 | strong liquidity | P/B 1.8x | capital-intensity risk |
| [[CDZI]] | 38 | 37 | Rev +383% YoY | P/S 41.6x | unprofitable; thin liquidity |
| [[GUT]] | 38 | N/A | clean-universe survivor; fundamentals pending | fundamentals pending | fundamental coverage missing; thin liquidity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[MNTK]] | 36 | 29 | P/B 0.6x | P/E 90.4x | thin liquidity; P/E 90.4x |

### Special Situation

- No special situation selected.

## Research Queue

- **Total Candidates**: 4
- **Highest Score**: 62 (NNE)
- **Highest Quality Score**: NNE
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Nasdaq Public Screener
- **Fallback**: FMP company-screener was unavailable because the endpoint was restricted or temporarily rate-limited on the current subscription.
- **Auto-pulled**: 2026-04-02
