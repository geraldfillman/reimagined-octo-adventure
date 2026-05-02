---
node_type: "thesis"
name: "Financials Sector Basket"
status: "Active"
conviction: "medium"
timeframe: "medium"
allocation_priority: "medium"
allocation_rank: 2
why_now: "Financials remain one of the cleanest ways to express rates, market activity, and transaction volume."
variant_perception: "The sector gets flattened into a simple rate trade even though payments, brokers, and trading-sensitive names behave very differently."
next_catalyst: "Yield-curve moves, capital-markets activity, and consumer transaction trends."
disconfirming_evidence: "Market activity cools while payments and trading volumes fail to offset softer lending."
expected_upside: "Better market activity and payment volumes can rerate the group quickly."
expected_downside: "Risk-off and lower activity can hit sentiment fast."
position_sizing: "Use as a macro-sensitive sector sleeve with a market-activity tilt."
required_sources: ["[[SEC EDGAR API]]", "[[NewsAPI]]", "[[FRED API]]", "[[US Treasury Data]]"]
required_pull_families: ["sec --thesis", "newsapi --topic business", "fred --group rates", "treasury --yields"]
monitor_status: "on-track"
monitor_last_review: "2026-04-01"
monitor_change: "Initial sector basket created for FMP coverage."
break_risk_status: "watch"
monitor_action: "Refresh monthly and focus on market activity, payment volume, and curve shape."
core_entities: ["[[COIN]]", "[[GS]]", "[[V]]", "[[JPM]]", "[[BAC]]", "[[BLK]]", "[[MS]]", "[[AXP]]", "[[MA]]", "[[C]]", "[[WFC]]", "[[Financials]]", "[[USA]]"]
supporting_regimes: ["[[Goldilocks]]", "[[Rate Cut Cycle]]", "[[Recession]]"]
key_indicators: ["[[Yield Curve]]", "[[Fed Funds Rate]]", "[[VIX]]"]
bullish_drivers: ["Capital-markets recovery", "Transaction growth", "Healthy risk appetite"]
bearish_drivers: ["Risk-off tape", "Volume slowdown", "Funding stress"]
invalidation_triggers: ["Market activity rolls over sharply", "Payment and trading volumes both soften", "The sector loses sensitivity to improving macro conditions"]
fmp_watchlist_symbols: ["COIN", "GS", "V", "JPM", "BAC", "BLK", "MS", "AXP", "MA", "C", "WFC"]
fmp_watchlist_symbol_count: 11
fmp_primary_symbol: "COIN"
fmp_technical_symbol_count: 11
fmp_technical_nonclear_count: 6
fmp_technical_bearish_count: 6
fmp_technical_overbought_count: 0
fmp_technical_oversold_count: 0
fmp_primary_technical_status: "alert"
fmp_primary_technical_bias: "bearish"
fmp_primary_momentum_state: "neutral"
fmp_primary_rsi14: 53.82
fmp_primary_price_vs_sma200_pct: -26.66
fmp_primary_fundamentals_status: "complete"
fmp_primary_market_cap: 52566802695
fmp_primary_trailing_pe: 42.36
fmp_primary_price_to_sales: 8.17
fmp_primary_price_to_book: 3.61
fmp_primary_ev_to_sales: 7.63
fmp_primary_ev_to_ebitda: 27.64
fmp_primary_roe_pct: 9.44
fmp_primary_roic_pct: 2.62
fmp_primary_operating_margin_pct: 11.15
fmp_primary_net_margin_pct: 19.59
fmp_primary_current_ratio: 2.34
fmp_primary_debt_to_equity: 0.53
fmp_primary_price_target: 318.63
fmp_primary_analyst_count: 48
fmp_primary_target_upside_pct: 60.07
fmp_primary_fundamentals_cached_at: "2026-04-27"
fmp_primary_snapshot_date: "2026-04-28"
fmp_calendar_symbol_count: 2
fmp_calendar_pull_date: "2026-04-28"
fmp_next_earnings_date: "2026-04-30"
fmp_next_earnings_symbols: ["MA"]
fmp_last_sync: "2026-04-28"
tags: ["thesis", "sector", "financials"]
---

## Summary
- A market-sensitive financials basket spanning payments, trading, and crypto-financial activity.
- Intended as a tradable sector monitor for rates, risk appetite, and transaction flow.

## Core Logic
1. Financials translate macro and policy changes into earnings quickly.
2. Market activity and transaction volume are the cleanest current local tape/fundamental expressions of the sector.
3. The basket is best used alongside rate and risk-appetite monitoring.
