---
node_type: "thesis"
name: "Tech Sector Basket"
status: "Active"
conviction: "medium"
timeframe: "medium"
allocation_priority: "medium"
allocation_rank: 2
why_now: "Technology still carries the highest earnings-growth concentration and the clearest AI upside in the market."
variant_perception: "The sector is often framed as too crowded right up until another growth and productivity wave extends leadership."
next_catalyst: "AI monetization, cloud demand, and earnings revisions."
disconfirming_evidence: "Rates rise while AI spending fails to translate into earnings."
expected_upside: "Large upside if AI and software monetization keep broadening."
expected_downside: "Fast multiple compression if rates jump or expectations get too far ahead of revenue."
position_sizing: "Use as a core growth-sector sleeve, but manage duration risk actively."
required_sources: ["[[SEC EDGAR API]]", "[[NewsAPI]]", "[[FRED API]]", "[[Financial Modeling Prep]]"]
required_pull_families: ["sec --thesis", "newsapi --topic business", "fred --group rates"]
monitor_status: "on-track"
monitor_last_review: "2026-04-01"
monitor_change: "Initial sector basket created for FMP coverage."
break_risk_status: "watch"
monitor_action: "Refresh monthly and focus on revisions, capex, and rate sensitivity."
core_entities: ["[[AAPL]]", "[[MSFT]]", "[[NVDA]]", "[[GOOGL]]", "[[META]]", "[[AVGO]]", "[[ORCL]]", "[[CRM]]", "[[AMD]]", "[[ADBE]]", "[[QCOM]]", "[[Tech Sector]]", "[[USA]]"]
supporting_regimes: ["[[Risk-On]]", "[[Goldilocks]]", "[[Risk-Off]]"]
key_indicators: ["[[10Y Treasury]]", "[[Fed Funds Rate]]", "[[VIX]]"]
bullish_drivers: ["AI demand", "Cloud growth", "Platform scale"]
bearish_drivers: ["Rate shock", "Crowded positioning", "Monetization disappointment"]
invalidation_triggers: ["AI spending fails to convert into earnings growth", "Rates compress multiples without offsetting revisions", "Leadership narrows to a single fragile subtheme"]
fmp_watchlist_symbols: ["AAPL", "MSFT", "NVDA", "GOOGL", "META", "AVGO", "ORCL", "CRM", "AMD", "ADBE", "QCOM"]
fmp_watchlist_symbol_count: 11
fmp_primary_symbol: "AAPL"
fmp_technical_symbol_count: 11
fmp_technical_nonclear_count: 10
fmp_technical_bearish_count: 6
fmp_technical_overbought_count: 5
fmp_technical_oversold_count: 0
fmp_primary_technical_status: "clear"
fmp_primary_technical_bias: "bullish"
fmp_primary_momentum_state: "positive"
fmp_primary_rsi14: 55.24
fmp_primary_price_vs_sma200_pct: 5.39
fmp_primary_fundamentals_status: "complete"
fmp_primary_market_cap: 3928819979500
fmp_primary_trailing_pe: 33.51
fmp_primary_price_to_sales: 9.02
fmp_primary_price_to_book: 44.75
fmp_primary_ev_to_sales: 9.12
fmp_primary_ev_to_ebitda: 25.98
fmp_primary_roe_pct: 159.94
fmp_primary_roic_pct: 51.01
fmp_primary_operating_margin_pct: 32.38
fmp_primary_net_margin_pct: 27.04
fmp_primary_current_ratio: 0.97
fmp_primary_debt_to_equity: 1.03
fmp_primary_price_target: 286.86
fmp_primary_analyst_count: 50
fmp_primary_target_upside_pct: 7.19
fmp_primary_fundamentals_cached_at: "2026-04-28"
fmp_primary_snapshot_date: "2026-04-28"
fmp_calendar_symbol_count: 4
fmp_calendar_pull_date: "2026-04-24"
fmp_next_earnings_date: "2026-04-29"
fmp_next_earnings_symbols: ["GOOGL", "MSFT"]
fmp_last_sync: "2026-04-28"
tags: ["thesis", "sector", "tech"]
---

## Summary
- A liquid large-cap technology basket for sector-level trend and valuation monitoring.
- This is the baseline growth basket for comparing against narrower AI and semiconductor themes.

## Core Logic
1. Tech leadership still depends on revisions, capex, and rate tolerance.
2. A large-cap basket keeps signal quality cleaner than a speculative small-cap mix.
3. The sector remains the market's core growth engine until proven otherwise.
