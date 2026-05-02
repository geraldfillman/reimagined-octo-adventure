---
node_type: "thesis"
name: "Aerospace & Defense Sector Basket"
status: "Active"
conviction: "medium"
timeframe: "medium"
allocation_priority: "medium"
allocation_rank: 2
why_now: "Defense spending, munition replenishment, and air-space modernization keep the sector funded even in slower growth."
variant_perception: "The market still compresses defense into a single macro trade even though primes, autonomy, and space systems behave differently."
next_catalyst: "Budget authorizations, contract awards, and program-of-record wins."
disconfirming_evidence: "Budget pressure or procurement delays stop converting backlog into earnings."
expected_upside: "Persistent cash flow plus rerating on defense-software and space optionality."
expected_downside: "Policy delay and multiple compression during risk-off phases."
position_sizing: "Useful as a dedicated sector sleeve alongside more specific defense theses."
required_sources: ["[[USASpending API]]", "[[SAM_Gov]]", "[[SEC EDGAR API]]", "[[NewsAPI]]"]
required_pull_families: ["usaspending --recent", "sam --opportunities", "sec --defense", "newsapi --topic business"]
monitor_status: "on-track"
monitor_last_review: "2026-04-01"
monitor_change: "Initial sector basket created for FMP coverage."
break_risk_status: "not-seen"
monitor_action: "Refresh monthly and monitor budget plus contract flow."
core_entities: ["[[LMT]]", "[[RTX]]", "[[NOC]]", "[[AVAV]]", "[[GD]]", "[[BA]]", "[[HII]]", "[[TDG]]", "[[AXON]]", "[[LHX]]", "[[SAIC]]", "[[Aerospace & Defense]]", "[[USA]]"]
supporting_regimes: ["[[Geopolitical Escalation]]", "[[Risk-Off]]", "[[Goldilocks]]"]
key_indicators: ["[[Defense Budget]]", "[[VIX]]", "[[10Y Treasury]]"]
bullish_drivers: ["Backlog conversion", "Defense budget resilience", "Autonomy and missile demand"]
bearish_drivers: ["Program delays", "Budget pressure", "Execution risk"]
invalidation_triggers: ["Defense budget growth stalls materially", "Large programs are delayed or cut", "Cash conversion weakens across the sector"]
fmp_watchlist_symbols: ["LMT", "RTX", "NOC", "AVAV", "GD", "BA", "HII", "TDG", "AXON", "LHX", "SAIC"]
fmp_watchlist_symbol_count: 11
fmp_primary_symbol: "LMT"
fmp_technical_symbol_count: 11
fmp_technical_nonclear_count: 8
fmp_technical_bearish_count: 10
fmp_technical_overbought_count: 0
fmp_technical_oversold_count: 4
fmp_primary_technical_status: "alert"
fmp_primary_technical_bias: "bearish"
fmp_primary_momentum_state: "oversold"
fmp_primary_rsi14: 19.04
fmp_primary_price_vs_sma200_pct: -1.91
fmp_primary_fundamentals_status: "complete"
fmp_primary_market_cap: 120896027855
fmp_primary_trailing_pe: 25.15
fmp_primary_price_to_sales: 1.61
fmp_primary_price_to_book: 16.1
fmp_primary_ev_to_sales: 1.86
fmp_primary_ev_to_ebitda: 17.27
fmp_primary_roe_pct: 74.53
fmp_primary_roic_pct: 16.84
fmp_primary_operating_margin_pct: 9.88
fmp_primary_net_margin_pct: 6.38
fmp_primary_current_ratio: 1.14
fmp_primary_debt_to_equity: 2.76
fmp_primary_price_target: 592.75
fmp_primary_analyst_count: 28
fmp_primary_target_upside_pct: 13.04
fmp_primary_fundamentals_cached_at: "2026-04-27"
fmp_primary_snapshot_date: "2026-04-28"
fmp_calendar_symbol_count: 8
fmp_calendar_pull_date: "2026-04-28"
fmp_next_earnings_date: "2026-04-29"
fmp_next_earnings_symbols: ["GD"]
fmp_last_sync: "2026-04-28"
tags: ["thesis", "sector", "aerospace-defense"]
---

## Summary
- A basic tradable basket for the sector-level defense view.
- Broad enough to compare primes and newer autonomy-linked exposure in one strategy review.

## Core Logic
1. Sector performance depends on budget durability and backlog conversion.
2. A mixed basket captures primes plus faster-growing autonomy exposure.
3. This basket should sit above the narrower defense theses as a sector monitor.

## Key Entities
| Entity | Role | Link |
|--------|------|------|
| [[LMT]] | Prime contractor | Scale and backlog |
| [[RTX]] | Missile and systems exposure | Program breadth |
| [[NOC]] | Space and strategic systems | Higher-end defense mix |
| [[AVAV]] | Tactical autonomy exposure | Faster-growth edge |
