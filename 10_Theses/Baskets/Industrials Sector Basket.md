---
node_type: "thesis"
name: "Industrials Sector Basket"
status: "Active"
conviction: "medium"
timeframe: "medium"
allocation_priority: "medium"
allocation_rank: 2
why_now: "Industrial leaders remain tied to capex, electrification, and manufacturing-cycle resilience."
variant_perception: "The market often treats industrials as old-cycle beta even when power and infrastructure bottlenecks make them strategic."
next_catalyst: "Factory activity, grid investment, and industrial-order trends."
disconfirming_evidence: "Manufacturing and capex weaken enough to hit orders and margins together."
expected_upside: "Operating leverage when industrial activity and electrification demand stay firm."
expected_downside: "Quick cyclical derating if macro demand softens."
position_sizing: "Use as a cyclical industrial sleeve with a power-infrastructure bias."
required_sources: ["[[SEC EDGAR API]]", "[[NewsAPI]]", "[[FRED API]]", "[[Financial Modeling Prep]]"]
required_pull_families: ["sec --thesis", "newsapi --topic business", "fred --group rates"]
monitor_status: "on-track"
monitor_last_review: "2026-04-01"
monitor_change: "Initial sector basket created for FMP coverage."
break_risk_status: "watch"
monitor_action: "Refresh monthly and track orders, capex, and infrastructure spending."
core_entities: ["[[ETN]]", "[[GEV]]", "[[CAT]]", "[[HON]]", "[[GE]]", "[[UNP]]", "[[RTX]]", "[[MMM]]", "[[DE]]", "[[LMT]]", "[[NOC]]", "[[WM]]", "[[Industrials]]", "[[USA]]"]
supporting_regimes: ["[[Goldilocks]]", "[[Risk-On]]", "[[Recession]]"]
key_indicators: ["[[ISM Manufacturing]]", "[[GDP Growth]]", "[[10Y Treasury]]"]
bullish_drivers: ["Capex recovery", "Electrification demand", "Infrastructure bottlenecks"]
bearish_drivers: ["Order slowdown", "Margin pressure", "Manufacturing contraction"]
invalidation_triggers: ["Orders weaken across the basket", "Capex slows while backlog shrinks", "Industrial demand loses the electrification tailwind"]
fmp_watchlist_symbols: ["ETN", "GEV", "CAT", "HON", "GE", "UNP", "RTX", "MMM", "DE", "LMT", "NOC", "WM"]
fmp_watchlist_symbol_count: 12
fmp_primary_symbol: "ETN"
fmp_technical_symbol_count: 12
fmp_technical_nonclear_count: 8
fmp_technical_bearish_count: 7
fmp_technical_overbought_count: 2
fmp_technical_oversold_count: 3
fmp_primary_technical_status: "clear"
fmp_primary_technical_bias: "bullish"
fmp_primary_momentum_state: "positive"
fmp_primary_rsi14: 66.13
fmp_primary_price_vs_sma200_pct: 15.29
fmp_primary_fundamentals_status: "complete"
fmp_primary_market_cap: 162612273200
fmp_primary_trailing_pe: 39.79
fmp_primary_price_to_sales: 5.92
fmp_primary_price_to_book: 8.38
fmp_primary_ev_to_sales: 6.31
fmp_primary_ev_to_ebitda: 27.88
fmp_primary_roe_pct: 21.67
fmp_primary_roic_pct: 13.12
fmp_primary_operating_margin_pct: 19.05
fmp_primary_net_margin_pct: 14.9
fmp_primary_current_ratio: 1.32
fmp_primary_debt_to_equity: 0.57
fmp_primary_price_target: 386.86
fmp_primary_analyst_count: 22
fmp_primary_target_upside_pct: -7.7
fmp_primary_fundamentals_cached_at: "2026-04-27"
fmp_primary_snapshot_date: "2026-04-28"
fmp_calendar_symbol_count: 4
fmp_calendar_pull_date: "2026-04-27"
fmp_next_earnings_date: "2026-05-05"
fmp_next_earnings_symbols: ["ETN"]
fmp_last_sync: "2026-04-28"
tags: ["thesis", "sector", "industrials"]
---

## Summary
- A broad industrial basket tilted toward electrification and capex sensitivity.
- Useful as the sector-level baseline for power and infrastructure themes.

## Core Logic
1. Industrials lead when capex and manufacturing regain momentum.
2. Power bottlenecks make certain industrial names more strategic than usual.
3. This basket should be watched against manufacturing and order data.
