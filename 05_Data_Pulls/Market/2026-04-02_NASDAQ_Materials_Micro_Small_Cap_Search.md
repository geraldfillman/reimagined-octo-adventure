---
title: "Materials Micro/Small Cap Search - NASDAQ"
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
- **Fundamentals Coverage**: 6 cached/live Alpha Vantage or SEC company-facts profiles across selected names
- **Taxonomy Note**: Nasdaq sectors are normalized with text-based industry/company overrides (249 rows reassigned); [[Communication Services]] maps to Telecommunications labels, and unclassified Miscellaneous names are excluded.

## Sector Coverage

| Vault Sector | Source Sector | Raw | Funds/ETF | ADR/ADS | LP/Trust | Dupes | Fund | Eligible | Final |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Materials]] | Basic Materials | 53 | 0 | 1 | 0 | 0 | 6 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Materials]] | Small | [[AESI]] | 58 | 43 | strong liquidity | P/S 1.4x | unprofitable; commodity-cycle sensitivity |
| [[Materials]] | Small | [[ECVT]] | 57 | 51 | Rev +21% YoY | P/S 2.0x | unprofitable; commodity-cycle sensitivity |
| [[Materials]] | Small | [[LXU]] | 54 | 43 | Rev +18% YoY | P/E 43.8x | P/E 43.8x; commodity-cycle sensitivity |
| [[Materials]] | Special | [[GPRE]] | 49 | 31 | passed the clean-universe and liquidity filters | P/S 0.5x | unprofitable; shrinking revenue |
| [[Materials]] | Micro | [[AMTX]] | 47 | 51 | Rev +175% YoY | P/S 2.8x | unprofitable; commodity-cycle sensitivity |
| [[Materials]] | Micro | [[GRO]] | 41 | N/A | clean-universe survivor; fundamentals pending | fundamentals pending | fundamental coverage missing; commodity-cycle sensitivity |
| [[Materials]] | Micro | [[USAU]] | 39 | 12 | passed the clean-universe and liquidity filters | P/S 15.0x | unprofitable; shrinking revenue |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Materials]] | Large | $144.8B | [[SCCO]] | P/E 62.0x | 2.5x sector ceiling | 66 | P/E 62.0x vs ~25x sector ceiling | P/E 62.0x; P/S 21.8x |
| [[Materials]] | Mega | $231.5B | [[LIN]] | P/E 33.6x | 1.3x sector ceiling | 51 | P/E 33.6x vs ~25x sector ceiling; Rev +3% does not fully support it | P/E 33.6x; commodity-cycle sensitivity |

## Materials Research Picks

- **Sector Lens**: chemicals/mining/metals fit with commodity-cycle value bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AESI]] | 58 | 43 | strong liquidity | P/S 1.4x | unprofitable; commodity-cycle sensitivity |
| [[ECVT]] | 57 | 51 | Rev +21% YoY | P/S 2.0x | unprofitable; commodity-cycle sensitivity |
| [[LXU]] | 54 | 43 | Rev +18% YoY | P/E 43.8x | P/E 43.8x; commodity-cycle sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AMTX]] | 47 | 51 | Rev +175% YoY | P/S 2.8x | unprofitable; commodity-cycle sensitivity |
| [[GRO]] | 41 | N/A | clean-universe survivor; fundamentals pending | fundamentals pending | fundamental coverage missing; commodity-cycle sensitivity |
| [[USAU]] | 39 | 12 | passed the clean-universe and liquidity filters | P/S 15.0x | unprofitable; shrinking revenue |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[GPRE]] | 49 | 31 | passed the clean-universe and liquidity filters | P/S 0.5x | unprofitable; shrinking revenue |

## Research Queue

- **Total Candidates**: 7
- **Highest Score**: 58 (AESI)
- **Highest Quality Score**: ECVT
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Nasdaq Public Screener
- **Fallback**: FMP company-screener was unavailable because the endpoint was restricted or temporarily rate-limited on the current subscription.
- **Auto-pulled**: 2026-04-02
