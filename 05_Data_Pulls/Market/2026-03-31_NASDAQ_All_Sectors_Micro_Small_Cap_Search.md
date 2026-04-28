---
title: "All Sectors Micro/Small Cap Search - NASDAQ"
source: "Nasdaq Public Screener"
date_pulled: "2026-03-31"
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
- **Fundamentals Coverage**: 68 cached/live Alpha Vantage or SEC company-facts profiles across selected names
- **Taxonomy Note**: Nasdaq sectors are normalized with text-based industry/company overrides (148 rows reassigned); [[Communication Services]] maps to Telecommunications labels, and unclassified Miscellaneous names are excluded.

## Sector Coverage

| Vault Sector | Source Sector | Raw | Funds/ETF | ADR/ADS | LP/Trust | Dupes | Fund | Eligible | Final |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Tech Sector]] | Technology | 74 | 0 | 1 | 0 | 0 | 7 | 11 | 7 |
| [[Healthcare]] | Healthcare | 148 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |
| [[Financials]] | Financial Services | 51 | 2 | 1 | 3 | 0 | 6 | 11 | 7 |
| [[Consumer Discretionary]] | Consumer Cyclical | 52 | 0 | 1 | 1 | 0 | 6 | 11 | 7 |
| [[Consumer Staples]] | Consumer Defensive | 10 | 0 | 0 | 0 | 0 | 7 | 10 | 7 |
| [[Industrials]] | Industrials | 39 | 0 | 1 | 0 | 0 | 6 | 11 | 7 |
| [[Materials]] | Basic Materials | 27 | 0 | 0 | 0 | 0 | 7 | 11 | 7 |
| [[Communication Services]] | Communication Services | 12 | 0 | 0 | 0 | 1 | 6 | 11 | 7 |
| [[Energy]] | Energy | 22 | 0 | 0 | 1 | 0 | 7 | 11 | 7 |
| [[Utilities]] | Utilities | 2 | 0 | 0 | 0 | 0 | 2 | 2 | 2 |
| [[Real Estate]] | Real Estate | 29 | 0 | 0 | 3 | 0 | 7 | 11 | 7 |

## Priority Board

| Sector | Tier | Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [[Industrials]] | Small | [[PSIX]] | 76 | 83 | execution margin 26%; Rev +23% YoY | P/E 11.9x | order-cycle sensitivity |
| [[Financials]] | Small | [[TSLX]] | 73 | 72 | P/B 1.0x; 22% target upside | Fwd P/E 9.1x | shrinking revenue; credit-cycle sensitivity |
| [[Consumer Staples]] | Small | [[VITL]] | 71 | 80 | consumer margin 12%; Rev +25% YoY | P/E 9.2x | input-cost sensitivity |
| [[Tech Sector]] | Small | [[PRGS]] | 71 | 74 | Gross margin 85%; 136% target upside | Fwd P/E 4.8x | multiple-compression risk |
| [[Consumer Staples]] | Small | [[SMPL]] | 70 | 77 | consumer margin 30%; Rev +21% YoY | P/E 12.9x | input-cost sensitivity |
| [[Healthcare]] | Small | [[SLNO]] | 69 | 73 | catalyst rerating setup; 208% target upside | Fwd P/E 7.4x | P/S 8.5x; clinical/dilution risk |
| [[Consumer Staples]] | Small | [[BRBR]] | 69 | 72 | consumer margin 15%; Rev +16% YoY | P/E 8.7x | input-cost sensitivity |
| [[Real Estate]] | Small | [[ORC]] | 68 | 78 | P/B 1.0x; Rev +71% YoY | P/E 8.3x | rate-sensitive balance sheet |
| [[Energy]] | Small | [[ANNA]] | 64 | 58 | margin 14%; Rev +1663% YoY | P/E 180.7x | P/E 180.7x; P/S 24.7x |
| [[Tech Sector]] | Small | [[GLOB]] | 64 | 67 | 59% target upside; Op margin 19% | Fwd P/E 7.1x | shrinking revenue; multiple-compression risk |
| [[Real Estate]] | Small | [[KW]] | 64 | 72 | P/B 1.0x; Rev +24% YoY | P/E 15.0x | thin liquidity; P/S 24.1x |
| [[Real Estate]] | Small | [[VRE]] | 63 | 55 | Op margin 37% | P/E 23.5x | rate-sensitive balance sheet |
| [[Tech Sector]] | Small | [[TENB]] | 62 | 58 | Gross margin 78%; 75% target upside | Fwd P/E 8.6x | unprofitable; multiple-compression risk |
| [[Energy]] | Small | [[VTS]] | 61 | 49 | passed the clean-universe and liquidity filters | P/E 29.2x | commodity-price sensitivity |
| [[Energy]] | Small | [[WTI]] | 61 | 55 | Rev +22% YoY | P/S 1.1x | unprofitable; commodity-price sensitivity |

## Potential Overvalued Watchlist

| Sector | Cap | Mkt Cap | Ticker | Multiple | Stretch | Quality | Why It Looks Rich | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[Consumer Staples]] | Mid | $10.0B | [[DAR]] | P/E 159.1x | 6.4x sector ceiling | 34 | P/E 159.1x vs ~25x sector ceiling; Rev +7% does not fully support it | P/E 159.1x; input-cost sensitivity |
| [[Industrials]] | Mid | $9.2B | [[KNX]] | P/E 139.3x | 5.6x sector ceiling | 31 | P/E 139.3x vs ~25x sector ceiling; Rev +1% does not fully support it | P/E 139.3x; order-cycle sensitivity |
| [[Industrials]] | Mega | $320.2B | [[CAT]] | P/E 118.6x | 4.7x sector ceiling | 42 | P/E 118.6x vs ~25x sector ceiling; Rev +4% does not fully support it | P/E 118.6x; order-cycle sensitivity |
| [[Utilities]] | Large | $86.3B | [[CEG]] | P/E 37.2x | 1.9x sector ceiling | 47 | P/E 37.2x vs ~20x sector ceiling; Rev +8% does not fully support it | P/E 37.2x; capital-intensity risk |
| [[Industrials]] | Mid | $9.9B | [[GTLS]] | P/E 243.1x | 9.7x sector ceiling | 50 | P/E 243.1x vs ~25x sector ceiling; quality score 50 | P/E 243.1x; P/S 10.0x |
| [[Communication Services]] | Large | $53.8B | [[CIEN]] | P/E 436.1x | 10.9x sector ceiling | 46 | P/E 436.1x vs ~40x sector ceiling; quality score 46 | P/E 436.1x; P/S 11.3x |
| [[Materials]] | Small | $1.1B | [[LXU]] | P/E 44.9x | 1.8x sector ceiling | 43 | P/E 44.9x vs ~25x sector ceiling; quality score 43 | P/E 44.9x; commodity-cycle sensitivity |
| [[Materials]] | Mid | $8.2B | [[ESI]] | P/E 43.1x | 1.7x sector ceiling | 43 | P/E 43.1x vs ~25x sector ceiling; Rev +4% does not fully support it | P/E 43.1x; commodity-cycle sensitivity |

## Tech Sector Research Picks

- **Sector Lens**: growth, gross margin, and software/networking fit bias
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PRGS]] | 71 | 74 | Gross margin 85%; 136% target upside | Fwd P/E 4.8x | multiple-compression risk |
| [[GLOB]] | 64 | 67 | 59% target upside; Op margin 19% | Fwd P/E 7.1x | shrinking revenue; multiple-compression risk |
| [[TENB]] | 62 | 58 | Gross margin 78%; 75% target upside | Fwd P/E 8.6x | unprofitable; multiple-compression risk |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[IDN]] | 53 | 47 | Gross margin 90%; 22% target upside | Fwd P/E 78.7x | thin liquidity; Fwd P/E 78.7x |
| [[PDYN]] | 52 | 61 | 66% target upside | Fwd P/E 4.6x | beta 3.8; P/S 51.2x |
| [[OSS]] | 42 | 28 | 69% target upside | Fwd P/E 454.6x | unprofitable; Fwd P/E 454.6x |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[RCAT]] | 50 | 37 | growth still screening clean; Rev +20% YoY | P/S 37.7x | unprofitable; P/S 37.7x |

## Healthcare Research Picks

- **Sector Lens**: biotech/medtech catalyst bias with analyst-upside and revenue-inflection overlays
- **Primary Pick Gate**: sector fit score >= 40

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SLNO]] | 69 | 73 | catalyst rerating setup; 208% target upside | Fwd P/E 7.4x | P/S 8.5x; clinical/dilution risk |
| [[NKTR]] | 58 | 35 | catalyst rerating setup; 89% target upside | Fwd P/E 34.0x | unprofitable; shrinking revenue |
| [[DFTX]] | 56 | 33 | catalyst rerating setup; 96% target upside | P/B 5.5x | beta 2.7; clinical/dilution risk |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PEPG]] | 52 | 47 | catalyst rerating setup; 587% target upside | P/B 2.1x | beta 1.9; clinical/dilution risk |
| [[PALI]] | 46 | 33 | catalyst rerating setup; 612% target upside | P/S 14.0x | P/S 14.0x; clinical/dilution risk |
| [[LENZ]] | 44 | 33 | catalyst rerating setup; 420% target upside | P/S 13.8x | P/S 13.8x; clinical/dilution risk |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[STOK]] | 53 | 34 | 35% target upside; near 52W highs | Fwd P/E 204.1x | unprofitable; shrinking revenue |

## Financials Research Picks

- **Sector Lens**: bank/insurer/capital-markets fit with P/B, ROE, and profitability bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[TSLX]] | 73 | 72 | P/B 1.0x; 22% target upside | Fwd P/E 9.1x | shrinking revenue; credit-cycle sensitivity |
| [[NWBI]] | 58 | 60 | P/B 1.0x | P/E 14.7x | credit-cycle sensitivity |
| [[LC]] | 56 | 49 | P/B 1.1x | P/E 11.9x | shrinking revenue; thin liquidity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AFBI]] | 53 | 56 | P/B 1.1x | P/E 16.3x | credit-cycle sensitivity |
| [[RILY]] | 42 | 36 | passed the clean-universe and liquidity filters | P/S 0.3x | unprofitable; shrinking revenue |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[OXLC]] | 49 | N/A | clean-universe survivor; fundamentals pending | fundamentals pending | fundamental coverage missing; credit-cycle sensitivity |

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[TRIN]] | 60 | 75 | P/B 1.1x; Rev +23% YoY | P/E 8.9x | weak sector fit; credit-cycle sensitivity |

## Consumer Discretionary Research Picks

- **Sector Lens**: retail/leisure/autos fit with demand-sensitive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[WEN]] | 60 | 61 | consumer margin 16%; Op margin 16% | P/E 7.9x | shrinking revenue; consumer-demand sensitivity |
| [[KSS]] | 59 | 52 | passed the clean-universe and liquidity filters | P/E 5.2x | shrinking revenue; consumer-demand sensitivity |
| [[GT]] | 52 | 42 | consumer margin 11%; Op margin 11% | P/S 0.1x | unprofitable; shrinking revenue |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[JACK]] | 45 | 42 | passed the clean-universe and liquidity filters | P/S 0.1x | unprofitable; shrinking revenue |
| [[SMJF]] | 35 | N/A | clean-universe survivor; fundamentals pending | fundamentals pending | fundamental coverage missing; consumer-demand sensitivity |

### Special Situation

- No special situation selected.

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[FUN]] | 47 | 47 | passed the clean-universe and liquidity filters | P/S 0.6x | weak sector fit; unprofitable |
| [[PTON]] | 46 | 44 | passed the clean-universe and liquidity filters | P/S 0.7x | weak sector fit; unprofitable |

## Consumer Staples Research Picks

- **Sector Lens**: food/beverage/household fit with defensive margin and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[VITL]] | 71 | 80 | consumer margin 12%; Rev +25% YoY | P/E 9.2x | input-cost sensitivity |
| [[SMPL]] | 70 | 77 | consumer margin 30%; Rev +21% YoY | P/E 12.9x | input-cost sensitivity |
| [[BRBR]] | 69 | 72 | consumer margin 15%; Rev +16% YoY | P/E 8.7x | input-cost sensitivity |

### Micro-Cap Picks

- No micro-cap picks passed the sector lens.

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[GO]] | 55 | 45 | passed the clean-universe and liquidity filters | P/S 0.1x | unprofitable; input-cost sensitivity |

### Reserve Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[FLO]] | 54 | 46 | passed the clean-universe and liquidity filters | P/E 20.7x | input-cost sensitivity |
| [[BGS]] | 47 | 41 | passed the clean-universe and liquidity filters | P/S 0.2x | unprofitable; shrinking revenue |
| [[ARKO]] | 46 | 52 | Rev +23% YoY | P/E 27.8x | thin liquidity; input-cost sensitivity |

## Industrials Research Picks

- **Sector Lens**: machinery/defense/transport fit with order-cycle margin bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PSIX]] | 76 | 83 | execution margin 26%; Rev +23% YoY | P/E 11.9x | order-cycle sensitivity |
| [[AMSC]] | 56 | 42 | passed the clean-universe and liquidity filters | P/E 262.1x | P/E 262.1x; P/S 1756.9x |
| [[WERN]] | 53 | 47 | passed the clean-universe and liquidity filters | P/S 0.6x | unprofitable; shrinking revenue |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AIRJ]] | 43 | 55 | passed the clean-universe and liquidity filters | P/B 0.6x | thin liquidity; order-cycle sensitivity |
| [[NEOV]] | 40 | 34 | order-cycle growth inflecting; Rev +219% YoY | P/S 15.7x | unprofitable; thin liquidity |
| [[AIRO]] | 38 | 40 | passed the clean-universe and liquidity filters | P/S 28.4x | thin liquidity; P/S 28.4x |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[EVTL]] | 38 | N/A | clean-universe survivor; fundamentals pending | fundamentals pending | fundamental coverage missing; order-cycle sensitivity |

## Materials Research Picks

- **Sector Lens**: chemicals/mining/metals fit with commodity-cycle value bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[LXU]] | 52 | 43 | Rev +18% YoY | P/E 44.9x | P/E 44.9x; commodity-cycle sensitivity |
| [[NB]] | 51 | 50 | passed the clean-universe and liquidity filters | P/B 1.8x | commodity-cycle sensitivity |
| [[TROX]] | 47 | 31 | passed the clean-universe and liquidity filters | P/S 0.5x | unprofitable; shrinking revenue |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AMTX]] | 44 | 51 | Rev +175% YoY | P/S 2.8x | unprofitable; thin liquidity |
| [[CTGO]] | 43 | 33 | passed the clean-universe and liquidity filters | P/B 11.8x | commodity-cycle sensitivity |
| [[USAU]] | 38 | 12 | passed the clean-universe and liquidity filters | P/S 14.6x | unprofitable; shrinking revenue |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[TLRY]] | 47 | 40 | passed the clean-universe and liquidity filters | P/S 0.9x | unprofitable; commodity-cycle sensitivity |

## Communication Services Research Picks

- **Sector Lens**: telecom/media/platform fit with growth, margin, and valuation bias
- **Primary Pick Gate**: sector fit score >= 45

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[ADTN]] | 60 | 54 | growth still screening clean; Rev +17% YoY | P/S 0.9x | unprofitable; thin liquidity |
| [[GOGO]] | 59 | 55 | growth still screening clean; Rev +105% YoY | P/E 41.5x | thin liquidity; multiple-compression risk |
| [[LILAK]] | 59 | 60 | growth still screening clean; Rev +32% YoY | P/S 0.5x | unprofitable; thin liquidity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[KSCP]] | 38 | 24 | passed the clean-universe and liquidity filters | P/S 5.4x | unprofitable; thin liquidity |
| [[MIN]] | 36 | N/A | clean-universe survivor; fundamentals pending | fundamentals pending | fundamental coverage missing; thin liquidity |
| [[SIDU]] | 34 | 8 | passed the clean-universe and liquidity filters | P/S 32.2x | unprofitable; shrinking revenue |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[AIOT]] | 57 | 60 | Gross margin 54%; Rev +171% YoY | P/S 1.1x | unprofitable; thin liquidity |

## Energy Research Picks

- **Sector Lens**: oil/gas/energy-services fit with commodity-linked value and margin bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[ANNA]] | 64 | 58 | margin 14%; Rev +1663% YoY | P/E 180.7x | P/E 180.7x; P/S 24.7x |
| [[VTS]] | 61 | 49 | passed the clean-universe and liquidity filters | P/E 29.2x | commodity-price sensitivity |
| [[WTI]] | 61 | 55 | Rev +22% YoY | P/S 1.1x | unprofitable; commodity-price sensitivity |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[BATL]] | 56 | 47 | strong liquidity | P/E 6.7x | shrinking revenue; commodity-price sensitivity |
| [[DTI]] | 53 | 50 | passed the clean-universe and liquidity filters | P/S 1.0x | unprofitable; thin liquidity |
| [[NUAI]] | 50 | 41 | Rev +66% YoY | P/S 242.4x | unprofitable; P/S 242.4x |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[RES]] | 54 | 50 | Rev +2216% YoY | P/E 49.8x | thin liquidity; P/E 49.8x |

## Utilities Research Picks

- **Sector Lens**: regulated utility/water/power fit with defensive beta and asset-value bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[NNE]] | 58 | 51 | passed the clean-universe and liquidity filters | P/B 1.7x | capital-intensity risk |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[MNTK]] | 37 | 29 | P/B 0.6x | P/E 92.2x | thin liquidity; P/E 92.2x |

### Special Situation

- No special situation selected.

## Real Estate Research Picks

- **Sector Lens**: property and mortgage REIT fit with book-value and rate-sensitivity bias
- **Primary Pick Gate**: sector fit score >= 50

### Small-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[ORC]] | 68 | 78 | P/B 1.0x; Rev +71% YoY | P/E 8.3x | rate-sensitive balance sheet |
| [[KW]] | 64 | 72 | P/B 1.0x; Rev +24% YoY | P/E 15.0x | thin liquidity; P/S 24.1x |
| [[VRE]] | 63 | 55 | Op margin 37% | P/E 23.5x | rate-sensitive balance sheet |

### Micro-Cap Picks

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[SVC]] | 48 | 45 | P/B 0.3x; Op margin 21% | P/S 0.1x | unprofitable; shrinking revenue |
| [[CNDT]] | 48 | 59 | P/B 0.3x | P/E 0.5x | shrinking revenue; thin liquidity |
| [[RC]] | 44 | 48 | P/B 0.2x | P/E 5.9x | shrinking revenue; thin liquidity |

### Special Situation

| Ticker | Score | Quality | Why Now | Valuation | Risk |
| --- | --- | --- | --- | --- | --- |
| [[PHR]] | 52 | 48 | Rev +18% YoY; strong liquidity | P/S 1.2x | unprofitable; rate-sensitive balance sheet |

## Research Queue

- **Total Candidates**: 72
- **Highest Score**: 76 (PSIX)
- **Highest Quality Score**: PSIX
- Start with the small-cap and micro-cap tier leaders before touching the special situations.
- Use the why-now / valuation / risk fields to decide which names deserve full entity-note promotion.

## Source

- **Provider**: Nasdaq Public Screener
- **Fallback**: FMP company-screener was unavailable because the endpoint was restricted or temporarily rate-limited on the current subscription.
- **Auto-pulled**: 2026-03-31
