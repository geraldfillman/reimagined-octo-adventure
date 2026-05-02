---
node_type: "thesis"
name: "Lynch Style GARP Leaders"
status: "Active"
conviction: "medium"
timeframe: "medium"
allocation_priority: "watch"
allocation_rank: 3
why_now: "A choppier market still rewards companies that can compound earnings without demanding story-stock assumptions."
variant_perception: "The market often separates growth and value too cleanly, leaving steady growers mispriced in between."
next_catalyst: "Earnings beats, stable guidance, and margin durability across consumer and software leaders."
disconfirming_evidence: "Growth decelerates sharply while valuations stay elevated."
expected_upside: "Balanced mix of earnings growth and multiple durability."
expected_downside: "Can lag both speculative momentum and hard-value rebounds."
position_sizing: "Use as a middle-lane growth sleeve between momentum and deep value."
required_sources: ["[[SEC EDGAR API]]", "[[Financial Modeling Prep]]", "[[NewsAPI]]", "[[FRED API]]"]
required_pull_families: ["sec --thesis", "newsapi --topic business", "fred --group rates"]
monitor_status: "on-track"
monitor_last_review: "2026-04-01"
monitor_change: "Initial investor-style basket created for FMP coverage."
break_risk_status: "not-seen"
monitor_action: "Refresh monthly and rank by earnings durability plus price follow-through."
core_entities: ["[[AMZN]]", "[[COST]]", "[[LLY]]", "[[MSFT]]", "[[Consumer Staples]]", "[[Healthcare]]", "[[Tech Sector]]", "[[USA]]"]
supporting_regimes: ["[[Goldilocks]]", "[[Risk-On]]", "[[Rate Cut Cycle]]"]
key_indicators: ["[[Retail Sales]]", "[[10Y Treasury]]", "[[VIX]]"]
bullish_drivers: ["Steady earnings growth", "Reasonable starting multiples", "Operational discipline"]
bearish_drivers: ["Growth scare", "Margin compression", "Crowded quality ownership"]
invalidation_triggers: ["Growth slows across the whole basket without valuation relief", "Consumer and enterprise spending soften together", "Execution stumbles outweigh growth durability"]
fmp_watchlist_symbols: ["AMZN", "COST", "LLY", "MSFT"]
fmp_watchlist_symbol_count: 4
fmp_primary_symbol: "AMZN"
fmp_technical_symbol_count: 4
fmp_technical_nonclear_count: 3
fmp_technical_bearish_count: 2
fmp_technical_overbought_count: 1
fmp_technical_oversold_count: 0
fmp_primary_technical_status: "watch"
fmp_primary_technical_bias: "bullish"
fmp_primary_momentum_state: "overbought"
fmp_primary_rsi14: 80.4
fmp_primary_price_vs_sma200_pct: 16.64
fmp_primary_fundamentals_status: "complete"
fmp_primary_market_cap: 2743194470579
fmp_primary_trailing_pe: 35.17
fmp_primary_price_to_sales: 3.83
fmp_primary_price_to_book: 6.65
fmp_primary_ev_to_sales: 3.92
fmp_primary_ev_to_ebitda: 16.99
fmp_primary_roe_pct: 21.87
fmp_primary_roic_pct: 10.7
fmp_primary_operating_margin_pct: 11.16
fmp_primary_net_margin_pct: 10.83
fmp_primary_current_ratio: 1.05
fmp_primary_debt_to_equity: 0.37
fmp_primary_price_target: 288.43
fmp_primary_analyst_count: 67
fmp_primary_target_upside_pct: 13.07
fmp_primary_fundamentals_cached_at: "2026-04-24"
fmp_primary_snapshot_date: "2026-04-24"
fmp_calendar_symbol_count: 3
fmp_calendar_pull_date: "2026-04-23"
fmp_next_earnings_date: "2026-04-29"
fmp_next_earnings_symbols: ["AMZN", "MSFT"]
fmp_last_sync: "2026-04-24"
tags: ["thesis", "strategy", "lynch", "garp"]
---

## Summary
- A simple GARP basket built around large, understandable compounding businesses.
- Designed to sit between deep value and pure momentum.

## Core Logic
1. The best GARP names combine visible earnings growth with manageable valuation risk.
2. Cross-sector diversification helps avoid single-theme blowups.
3. Operational consistency matters as much as top-line growth.

## Key Entities
| Entity | Role | Link |
|--------|------|------|
| [[AMZN]] | Consumer and cloud growth | Durable optionality |
| [[COST]] | Membership retail compounder | High-quality consumer growth |
| [[LLY]] | Healthcare growth leader | Metabolic-disease demand |
| [[MSFT]] | Software platform compounder | Enterprise AI and cloud |

## Supporting Macro
- **Regime**: Best in [[Goldilocks]] or controlled [[Risk-On]] phases.
- **Key indicators**: Watch [[Retail Sales]], [[10Y Treasury]], and [[VIX]].

## Invalidation Criteria
- Growth decelerates while multiples stay high.
- Consumer and enterprise demand weaken together.
- Execution quality falls below the premium valuation.

## Monitor Review
- **Last review**: 2026-04-01
- **Change this week**: Initial investor-style basket created for FMP coverage.
- **Break risk status**: not-seen
- **Action**: Refresh monthly and compare against value and momentum sleeves.
