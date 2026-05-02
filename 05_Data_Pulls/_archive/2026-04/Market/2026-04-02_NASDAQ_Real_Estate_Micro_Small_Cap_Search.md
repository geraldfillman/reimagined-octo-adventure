---
title: "Real Estate Micro/Small Cap Search - NASDAQ"
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
- **Fundamentals Coverage**: 7 cached/live Alpha Vantage or SEC company-facts profiles across selected names
- **Taxonomy Note**: Nasdaq sectors are normalized with text-based industry/company overrides (249 rows reassigned); [[Communication Services]] maps to Telecommunications labels, and unclassified Miscellaneous names are excluded.

## Sector Coverage

| Vault Sector | Source Sector | Raw | Funds/ETF | ADR/ADS | LP/Trust | Dupes | Fund | Eligible | Final |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Real Estate | 76 | 0 | 0 | 7 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Small | [[ORC]] | 68 | 78 | P/B 1.0x; Rev +71% YoY | P/E 8.4x | rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[IIPR]] | 66 | 55 | P/B 0.7x; Op margin 47% | P/E 11.6x | shrinking revenue; rate-sensitive balance sheet |
| [[Real Estate]] | Small | [[CBZ]] | 64 | 64 | P/B 0.8x; Op margin 25% | P/E 11.8x | rate-sensitive balance sheet |
| [[Real Estate]] | Special | [[NTST]] | 58 | 44 | P/B 1.3x; Rev +20% YoY | P/E 268.8x | P/E 268.8x; P/S 9.6x |
| [[Real Estate]] | Micro | [[SITC]] | 56 | 63 | P/B 0.8x; Op margin 260% | P/E 1.6x | shrinking revenue; thin liquidity |
| [[Real Estate]] | Micro | [[REFI]] | 55 | 69 | P/B 0.7x | P/E 6.4x | thin liquidity; rate-sensitive balance sheet |
| [[Real Estate]] | Micro | [[SVC]] | 49 | 45 | P/B 0.3x; Op margin 21% | P/S 0.1x | unprofitable; shrinking revenue |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Real Estate]] | Small | $1.9B | [[NTST]] | P/E 268.8x | 13.4x sector ceiling | 44 | P/E 268.8x vs ~20x sector ceiling; quality score 44 | P/E 268.8x; P/S 9.6x |
| [[Real Estate]] | Small | $2.0B | [[GNL]] | P/E 42.3x | 2.1x sector ceiling | 33 | P/E 42.3x vs ~20x sector ceiling; shrinking revenue against a rich multiple | shrinking revenue; P/E 42.3x |
| [[Real Estate]] | Mid | $9.8B | [[Z]] | P/E 427.4x | 21.4x sector ceiling | 50 | P/E 427.4x vs ~20x sector ceiling; quality score 50 | P/E 427.4x; P/S 9.1x |
| [[Real Estate]] | Large | $140.5B | [[WELL]] | P/E 645.7x | 32.3x sector ceiling | 50 | P/E 645.7x vs ~20x sector ceiling; quality score 50 | P/E 645.7x; P/S 13.0x |
| [[Real Estate]] | Mega | $576.0B | [[V]] | P/E 28.7x | 1.4x sector ceiling | 51 | P/E 28.7x vs ~20x sector ceiling; shrinking revenue against a rich multiple | shrinking revenue; P/E 28.7x |

## Real Estate Research Picks

- **Sector Lens**: property and mortgage REIT fit with book-value and rate-sensitivity bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[ORC]] | 68 | 78 | P/B 1.0x; Rev +71% YoY | P/E 8.4x | rate-sensitive balance sheet |
| [[IIPR]] | 66 | 55 | P/B 0.7x; Op margin 47% | P/E 11.6x | shrinking revenue; rate-sensitive balance sheet |
| [[CBZ]] | 64 | 64 | P/B 0.8x; Op margin 25% | P/E 11.8x | rate-sensitive balance sheet |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SITC]] | 56 | 63 | P/B 0.8x; Op margin 260% | P/E 1.6x | shrinking revenue; thin liquidity |
| [[REFI]] | 55 | 69 | P/B 0.7x | P/E 6.4x | thin liquidity; rate-sensitive balance sheet |
| [[SVC]] | 49 | 45 | P/B 0.3x; Op margin 21% | P/S 0.1x | unprofitable; shrinking revenue |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[NTST]] | 58 | 44 | P/B 1.3x; Rev +20% YoY | P/E 268.8x | P/E 268.8x; P/S 9.6x |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 68 (ORC)
- **Highest Quality Score**: ORC
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Nasdaq Public Screener
- **Fallback**: FMP company-screener was unavailable because the endpoint was restricted or temporarily rate-limited on the current subscription.
- **Auto-pulled**: 2026-04-02
