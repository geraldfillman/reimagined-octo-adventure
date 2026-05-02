---
title: "Housing Supply Correction Full Picture"
source: "Thesis Full Picture"
thesis: "[[Housing Supply Correction]]"
thesis_name: "Housing Supply Correction"
primary_symbol: "DHI"
allocation_priority: "high"
conviction: "high"
monitor_status: "mixed"
break_risk_status: "watch"
qlib_signal_status: "watch"
technical_status: "alert"
technical_bias: "bearish"
fundamentals_status: "complete"
macro_signal_status: "watch"
structural_view: "cautious"
tactical_view: "risky"
watchlist_symbol_count: 6
fundamentals_symbol_count: 6
catalyst_symbol_count: 6
macro_indicator_match_count: 5
coverage_gap_count: 0
related_pulls: ["[[2026-04-02_FMP_Thesis_Watchlist_Housing_Supply_Correction]]", "[[2026-04-02_FMP_Technicals_DHI_daily]]", "[[2026-04-02_Catalyst_DHI]]", "[[2026-04-02_Catalyst_LEN]]", "[[2026-04-02_Catalyst_NVR]]", "[[2026-04-02_Catalyst_SKY]]", "[[2026-04-02_Catalyst_TMHC]]", "[[2026-04-02_FRED_Housing]]", "[[2026-04-02_NAHB_Builder_Confidence]]"]
date_pulled: "2026-04-02"
domain: "theses"
data_type: "full_picture_report"
frequency: "on-demand"
signal_status: "alert"
signals: ["STRUCTURAL_CAUTIOUS", "TACTICAL_RISKY", "QLIB_WATCH", "TECHNICAL_ALERT", "MACRO_WATCH"]
tags: ["thesis", "full-picture", "synthesis", "report", "dhi"]
signal_state: new
---

## Snapshot

- **Thesis**: [[Housing Supply Correction]]
- **Primary Symbol**: DHI
- **Priority / Conviction**: high / high
- **Monitor / Break Risk**: mixed / watch
- **Quant / Tape / Indicators**: watch / alert / watch
- **Fundamentals**: complete (6/6 watchlist symbol(s) cached)
- **Next Earnings**: N/A
- **Overall Status**: alert

## Structural Thesis

- **Why Now**: Rate cuts, lock-in relief, and chronic underbuilding can re-open demand while keeping supply structurally tight.
- **Variant**: Consensus still frames housing as a pure rate trade instead of a prolonged supply-shortage cycle.
- **Next Catalyst**: Mortgage-rate moves, builder confidence, and housing starts through the next Fed easing steps.
- **What Breaks It**: Unemployment-led demand destruction overwhelms the structural supply shortage.
- **Monitor Change**: Starts rose 7.2% to 1.487M, but permits fell 5.4%, mortgage rates rose to 6.38%, and the housing playbook shifted to Late Cycle / Peak Risk with a FEMA disaster alert.
- **Monitor Action**: Keep exposure selective, but review rate-sensitive builders and regional risk if mortgage rates keep rising or labor weakens.

| Regime | Status | Confidence | Key Indicators |
| --- | --- | --- | --- |
| [[Rate Cut Cycle]] | Watching | medium | [[Fed Funds Rate]], [[CPI]], [[PMI]], [[Initial Claims]] |
| [[Housing Supply Crisis]] | N/A | N/A | N/A |
| [[Affordability Pressure]] | N/A | N/A | N/A |

## Quant And Tape

| Layer | Status | Metric 1 | Metric 2 | Metric 3 |
| --- | --- | --- | --- | --- |
| Qlib | watch | -0.212 | 86 | -0.67 |
| Primary Tape | alert | bearish | 45.0 | -8.2% |
| Watchlist | 6/6 covered | 6 non-clear | 6 bearish | 2026-04-02 |

| Symbol | Tech | Bias | RSI 14 | Vs 200D % | Next Earnings | Catalyst |
| --- | --- | --- | --- | --- | --- | --- |
| DHI | alert | bearish | 45.0 | -8.2% | N/A | near-term |
| LEN | alert | bearish | 30.4 | -26.1% | N/A | near-term |
| NVR | alert | bearish | 44.3 | -11.8% | N/A | near-term |
| TOL | alert | bearish | 42.2 | -0.4% | N/A | near-term |
| TMHC | alert | bearish | 39.7 | -7.8% | N/A | near-term |
| SKY | alert | bearish | 36.6 | -4.8% | N/A | near-term |

## Fundamentals

| Metric | Value |
| --- | --- |
| Company | D.R. Horton, Inc. |
| Sector / Industry | Consumer Cyclical / Residential Construction |
| Market Cap | $40.7B |
| Trailing P/E | 12.2 |
| P/S | 1.2 |
| P/B | 1.7 |
| EV/Sales | 1.3 |
| EV/EBITDA | 9.8 |
| ROE % | 13.8% |
| ROIC % | 10.4% |
| Op Margin % | 12.3% |
| Net Margin % | 9.9% |
| Current Ratio | 6.62 |
| Debt / Equity | 0.23 |
| Avg Target | $163 |
| Target Upside % | 16.9% |
| Analyst Count | 18 |
| Cached | 2026-04-03 |

| Symbol | Coverage | P/E | EV/Sales | ROE % | Target Upside % |
| --- | --- | --- | --- | --- | --- |
| DHI | complete | 12.2 | 1.3 | 13.8% | 16.9% |
| LEN | complete | 11.8 | 0.7 | 8.0% | 28.3% |
| NVR | complete | 14.1 | 1.8 | 34.3% | 26.3% |
| TOL | complete | 9.4 | 1.3 | 16.9% | 22.3% |
| TMHC | complete | 7.2 | 0.9 | 12.8% | 23.1% |
| SKY | complete | 19.6 | 1.4 | 13.6% | 40.7% |

## Key Indicator Pulse

| Indicator | Series | Status | Latest | Change | Date | Source |
| --- | --- | --- | --- | --- | --- | --- |
| [[Housing Starts HOUST]] | HOUST | clear | 1487.00 | 7.2% | 2026-01-01 | [[2026-04-02_FRED_Housing]] |
| [[Building Permits PERMIT]] | PERMIT | clear | 1386.00 | -4.7% | 2026-01-01 | [[2026-04-02_FRED_Housing]] |
| [[30-Year Mortgage Rate MORTGAGE30US]] | MORTGAGE30US | clear | 6.38 | 0.16 | 2026-03-26 | [[2026-04-02_FRED_Housing]] |
| [[Home Price Index CSUSHPISA]] | CSUSHPINSA | clear | 326.61 | -0.36 | 2026-01-01 | [[2026-04-02_FRED_Housing]] |
| [[Builder Confidence Index]] | NAHB_HMI | watch | 38 | +1 | 2026-03-16 | [[2026-04-02_NAHB_Builder_Confidence]] |

## Catalyst Map

| Symbol | Urgency | Signal | Tech | Bias | Next Earnings | Days | Note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DHI | near-term | alert | alert | bearish | N/A | N/A | [[2026-04-02_Catalyst_DHI]] |
| LEN | near-term | alert | alert | bearish | N/A | N/A | [[2026-04-02_Catalyst_LEN]] |
| NVR | near-term | alert | alert | bearish | N/A | N/A | [[2026-04-02_Catalyst_NVR]] |
| SKY | near-term | alert | alert | bearish | N/A | N/A | [[2026-04-02_Catalyst_SKY]] |
| TMHC | near-term | alert | alert | bearish | N/A | N/A | [[2026-04-02_Catalyst_TMHC]] |
| TOL | near-term | alert | alert | bearish | N/A | N/A | [[2026-04-02_Catalyst_TOL]] |

## Coverage Gaps

- No major synthesis gaps detected in the current local data set.

## Synthesis

- **Structural View**: cautious
- **Tactical View**: risky
- **Action**: Evidence is mixed, so keep the thesis active while waiting for the next macro or company catalyst to resolve the conflict.

## Source

- **Watchlist Report**: [[2026-04-02_FMP_Thesis_Watchlist_Housing_Supply_Correction]]
- **Primary Technical**: [[2026-04-02_FMP_Technicals_DHI_daily]]
- **Related Pulls**: [[2026-04-02_FMP_Thesis_Watchlist_Housing_Supply_Correction]], [[2026-04-02_FMP_Technicals_DHI_daily]], [[2026-04-02_Catalyst_DHI]], [[2026-04-02_Catalyst_LEN]], [[2026-04-02_Catalyst_NVR]], [[2026-04-02_Catalyst_SKY]], [[2026-04-02_Catalyst_TMHC]], [[2026-04-02_FRED_Housing]], [[2026-04-02_NAHB_Builder_Confidence]]
- **Auto-pulled**: 2026-04-02
