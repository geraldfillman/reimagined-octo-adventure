---
node_type: "thesis"
name: "Utilities Sector Basket"
status: "Active"
conviction: "medium"
timeframe: "medium"
allocation_priority: "medium"
allocation_rank: 2
why_now: "Power scarcity, load growth, and AI-driven electricity demand have turned utilities back into an earnings-growth sector."
variant_perception: "The market still carries an outdated view of utilities as only bond proxies."
next_catalyst: "Load-growth revisions, power pricing, and new data-center power agreements."
disconfirming_evidence: "Demand growth fades or regulators prevent utilities from monetizing the scarcity."
expected_upside: "Rare combination of defensiveness and real earnings growth."
expected_downside: "Can de-rate if rates rise or power-demand expectations cool."
position_sizing: "Use as a defensive-growth sleeve tied to firm power and load growth."
required_sources: ["[[EIA_Electricity]]", "[[SEC EDGAR API]]", "[[NewsAPI]]", "[[FRED API]]"]
required_pull_families: ["eia --all", "sec --aipower", "newsapi --topic business", "fred --group rates"]
monitor_status: "on-track"
monitor_last_review: "2026-04-01"
monitor_change: "Initial sector basket created for FMP coverage."
break_risk_status: "watch"
monitor_action: "Refresh monthly and compare power demand with rate pressure."
core_entities: ["[[CEG]]", "[[VST]]", "[[NRG]]", "[[NEE]]", "[[SO]]", "[[DUK]]", "[[AEP]]", "[[SRE]]", "[[D]]", "[[EXC]]", "[[XEL]]", "[[Utilities]]", "[[USA]]"]
supporting_regimes: ["[[Goldilocks]]", "[[Risk-Off]]", "[[Rate Cut Cycle]]"]
key_indicators: ["[[10Y Treasury]]", "[[Fed Funds Rate]]", "[[CPI]]"]
bullish_drivers: ["Load growth", "Power scarcity", "Firm generation assets"]
bearish_drivers: ["Rate pressure", "Regulatory friction", "Demand disappointment"]
invalidation_triggers: ["Data-center demand expectations fade materially", "Regulation blocks rate-base or merchant upside", "Higher rates outweigh growth narratives for the whole basket"]
fmp_watchlist_symbols: ["CEG", "VST", "NRG", "NEE", "SO", "DUK", "AEP", "SRE", "D", "EXC", "XEL"]
fmp_watchlist_symbol_count: 11
fmp_primary_symbol: "CEG"
fmp_technical_symbol_count: 11
fmp_technical_nonclear_count: 2
fmp_technical_bearish_count: 6
fmp_technical_overbought_count: 0
fmp_technical_oversold_count: 0
fmp_primary_technical_status: "alert"
fmp_primary_technical_bias: "bearish"
fmp_primary_momentum_state: "positive"
fmp_primary_rsi14: 60.84
fmp_primary_price_vs_sma200_pct: -3.72
fmp_primary_fundamentals_status: "complete"
fmp_primary_market_cap: 96809921700
fmp_primary_trailing_pe: 41.84
fmp_primary_price_to_sales: 3.79
fmp_primary_price_to_book: 6.68
fmp_primary_ev_to_sales: 4
fmp_primary_ev_to_ebitda: 17.61
fmp_primary_roe_pct: 16.78
fmp_primary_roic_pct: 3.99
fmp_primary_operating_margin_pct: 12.09
fmp_primary_net_margin_pct: 9.08
fmp_primary_current_ratio: 1.53
fmp_primary_debt_to_equity: 0.62
fmp_primary_price_target: 400.27
fmp_primary_analyst_count: 11
fmp_primary_target_upside_pct: 29.12
fmp_primary_fundamentals_cached_at: "2026-04-27"
fmp_primary_snapshot_date: "2026-04-28"
fmp_calendar_symbol_count: 10
fmp_calendar_pull_date: "2026-04-28"
fmp_next_earnings_date: "2026-04-30"
fmp_next_earnings_symbols: ["SO", "XEL"]
fmp_last_sync: "2026-04-28"
tags: ["thesis", "sector", "utilities"]
---

## Summary
- A utility basket built around firm generation and merchant-power leverage.
- Useful as a sector-level monitor for the power-demand regime.

## Core Logic
1. Utilities now matter as much for growth and scarcity as for defense.
2. Firm generation assets are the key differentiator.
3. The basket should be monitored against both rates and electricity demand.
