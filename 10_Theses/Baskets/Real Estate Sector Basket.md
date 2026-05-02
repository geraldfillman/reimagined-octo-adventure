---
node_type: "thesis"
name: "Real Estate Sector Basket"
status: "Active"
conviction: "medium"
timeframe: "medium"
allocation_priority: "medium"
allocation_rank: 2
why_now: "Real estate remains a direct expression of rate sensitivity, financing conditions, and housing-linked asset demand."
variant_perception: "The sector often gets treated as pure rate beta even though housing and specialized real estate can behave very differently."
next_catalyst: "Treasury yields, mortgage-rate moves, and housing-demand updates."
disconfirming_evidence: "Funding stress or housing weakness hits the whole basket together."
expected_upside: "Rate relief and stable housing demand can rerate the group quickly."
expected_downside: "Higher yields and tighter credit pressure valuation and demand together."
position_sizing: "Use as a duration-sensitive sector sleeve with a housing bias."
required_sources: ["[[SEC EDGAR API]]", "[[NewsAPI]]", "[[FRED API]]", "[[US Treasury Data]]"]
required_pull_families: ["sec --thesis", "newsapi --topic business", "fred --group rates", "treasury --yields"]
monitor_status: "on-track"
monitor_last_review: "2026-04-01"
monitor_change: "Initial sector basket created for FMP coverage."
break_risk_status: "watch"
monitor_action: "Refresh monthly and watch rates, mortgage spreads, and housing demand."
core_entities: ["[[DHI]]", "[[LEN]]", "[[EQIX]]", "[[AMT]]", "[[PLD]]", "[[CCI]]", "[[PSA]]", "[[SPG]]", "[[O]]", "[[WELL]]", "[[DLR]]", "[[AVB]]", "[[Real Estate]]", "[[USA]]"]
supporting_regimes: ["[[Rate Cut Cycle]]", "[[Recession]]", "[[Risk-Off]]"]
key_indicators: ["[[10Y Treasury]]", "[[Fed Funds Rate]]", "[[Yield Curve]]"]
bullish_drivers: ["Rate relief", "Stable housing demand", "Digital-infrastructure optionality"]
bearish_drivers: ["Higher yields", "Credit stress", "Housing weakness"]
invalidation_triggers: ["Yields stay too high for too long", "Financing conditions worsen materially", "Housing demand weakens alongside tighter credit"]
fmp_watchlist_symbols: ["DHI", "LEN", "EQIX", "AMT", "PLD", "CCI", "PSA", "SPG", "O", "WELL", "DLR", "AVB"]
fmp_watchlist_symbol_count: 12
fmp_primary_symbol: "DHI"
fmp_technical_symbol_count: 12
fmp_technical_nonclear_count: 4
fmp_technical_bearish_count: 4
fmp_technical_overbought_count: 0
fmp_technical_oversold_count: 0
fmp_primary_technical_status: "clear"
fmp_primary_technical_bias: "bullish"
fmp_primary_momentum_state: "positive"
fmp_primary_rsi14: 63.95
fmp_primary_price_vs_sma200_pct: 3.61
fmp_primary_fundamentals_status: "complete"
fmp_primary_market_cap: 46172864140
fmp_primary_trailing_pe: 14.46
fmp_primary_price_to_sales: 1.38
fmp_primary_price_to_book: 1.94
fmp_primary_ev_to_sales: 1.52
fmp_primary_ev_to_ebitda: 12.29
fmp_primary_roe_pct: 13.24
fmp_primary_roic_pct: 9.65
fmp_primary_operating_margin_pct: 11.76
fmp_primary_net_margin_pct: 9.51
fmp_primary_current_ratio: 6.86
fmp_primary_debt_to_equity: 0.28
fmp_primary_price_target: 167.5
fmp_primary_analyst_count: 18
fmp_primary_target_upside_pct: 5.09
fmp_primary_fundamentals_cached_at: "2026-04-27"
fmp_primary_snapshot_date: "2026-04-28"
fmp_calendar_symbol_count: 3
fmp_calendar_pull_date: "2026-04-28"
fmp_next_earnings_date: "2026-05-06"
fmp_next_earnings_symbols: ["O"]
fmp_last_sync: "2026-04-28"
tags: ["thesis", "sector", "real-estate"]
---

## Summary
- A pragmatic real-estate basket built from housing names plus one digital-infrastructure proxy that the current local coverage can review.
- Intended as a rates-and-housing read-through until broader REIT data is refreshed locally.

## Core Logic
1. Real estate sensitivity is dominated by rates and financing spreads.
2. Housing-linked names are currently the cleanest local tape/fundamental expression of that sensitivity.
3. The basket is most useful when duration and housing conditions are changing fast.
