---
node_type: "thesis"
name: "Consumer Discretionary Sector Basket"
status: "Active"
conviction: "medium"
timeframe: "medium"
allocation_priority: "medium"
allocation_rank: 2
why_now: "Consumer discretionary leadership quickly reflects rate sensitivity, labor conditions, and household confidence."
variant_perception: "The sector is often treated as one trade even though ecommerce, autos, and housing respond differently."
next_catalyst: "Retail demand, labor data, and financing conditions."
disconfirming_evidence: "Employment softens or financing costs stay too high for demand to recover."
expected_upside: "Strong upside torque when rates ease and households regain confidence."
expected_downside: "Fast drawdowns if labor or credit conditions crack."
position_sizing: "Use as a cyclical sleeve and a read-through on consumer confidence."
required_sources: ["[[SEC EDGAR API]]", "[[NewsAPI]]", "[[FRED API]]", "[[Financial Modeling Prep]]"]
required_pull_families: ["sec --thesis", "newsapi --topic business", "fred --group housing", "fred --group labor"]
monitor_status: "on-track"
monitor_last_review: "2026-04-01"
monitor_change: "Initial sector basket created for FMP coverage."
break_risk_status: "watch"
monitor_action: "Refresh monthly and focus on labor, credit, and housing demand."
core_entities: ["[[AMZN]]", "[[TSLA]]", "[[DHI]]", "[[HD]]", "[[NKE]]", "[[MCD]]", "[[SBUX]]", "[[TJX]]", "[[BKNG]]", "[[LOW]]", "[[Consumer Discretionary]]", "[[USA]]"]
supporting_regimes: ["[[Goldilocks]]", "[[Rate Cut Cycle]]", "[[Recession]]"]
key_indicators: ["[[Retail Sales]]", "[[Unemployment Rate]]", "[[10Y Treasury]]"]
bullish_drivers: ["Rate relief", "Stable employment", "Household spending resilience"]
bearish_drivers: ["Consumer fatigue", "Credit tightening", "Housing slowdown"]
invalidation_triggers: ["Labor weakens materially", "Credit tightens without offsetting income growth", "Housing and auto demand both roll over together"]
fmp_watchlist_symbols: ["AMZN", "TSLA", "DHI", "HD", "NKE", "MCD", "SBUX", "TJX", "BKNG", "LOW"]
fmp_watchlist_symbol_count: 10
fmp_primary_symbol: "AMZN"
fmp_technical_symbol_count: 10
fmp_technical_nonclear_count: 7
fmp_technical_bearish_count: 6
fmp_technical_overbought_count: 1
fmp_technical_oversold_count: 1
fmp_primary_technical_status: "watch"
fmp_primary_technical_bias: "bullish"
fmp_primary_momentum_state: "overbought"
fmp_primary_rsi14: 75.91
fmp_primary_price_vs_sma200_pct: 15.23
fmp_primary_fundamentals_status: "complete"
fmp_primary_market_cap: 2817076128559
fmp_primary_trailing_pe: 36.12
fmp_primary_price_to_sales: 3.93
fmp_primary_price_to_book: 6.82
fmp_primary_ev_to_sales: 4.02
fmp_primary_ev_to_ebitda: 17.44
fmp_primary_roe_pct: 21.87
fmp_primary_roic_pct: 10.7
fmp_primary_operating_margin_pct: 11.16
fmp_primary_net_margin_pct: 10.83
fmp_primary_current_ratio: 1.05
fmp_primary_debt_to_equity: 0.37
fmp_primary_price_target: 288.24
fmp_primary_analyst_count: 68
fmp_primary_target_upside_pct: 10.04
fmp_primary_fundamentals_cached_at: "2026-04-27"
fmp_primary_snapshot_date: "2026-04-28"
fmp_calendar_symbol_count: 3
fmp_calendar_pull_date: "2026-04-28"
fmp_next_earnings_date: "2026-04-29"
fmp_next_earnings_symbols: ["AMZN"]
fmp_last_sync: "2026-04-28"
tags: ["thesis", "sector", "consumer-discretionary"]
---

## Summary
- A broad cyclical consumer basket spanning ecommerce, autos, and housing.
- Useful as a sector-level monitor for household demand and financing conditions.

## Core Logic
1. Consumer discretionary is one of the cleanest real-time macro sectors.
2. Mixing ecommerce, autos, and housing reduces single-subindustry bias.
3. The basket should be refreshed whenever labor and rate conditions shift.

## Key Entities
| Entity | Role | Link |
|--------|------|------|
| [[AMZN]] | Ecommerce and cloud | Broad consumer and tech exposure |
| [[TSLA]] | Auto and EV beta | High-volatility consumer exposure |
| [[DHI]] | Housing sensitivity | Rate-sensitive consumer demand |
