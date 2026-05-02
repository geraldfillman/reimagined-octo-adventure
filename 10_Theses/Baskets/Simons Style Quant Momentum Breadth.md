---
node_type: "thesis"
name: "Simons Style Quant Momentum Breadth"
status: "Active"
conviction: "medium"
timeframe: "short"
allocation_priority: "watch"
allocation_rank: 3
why_now: "A rules-based basket is useful for testing whether momentum breadth still favors the same liquid leaders."
variant_perception: "Investors often treat quant as inscrutable even when the edge is simply disciplined ranking and turnover control."
next_catalyst: "Relative-strength persistence, volatility compression, and factor stability."
disconfirming_evidence: "Momentum leadership narrows or reverses repeatedly without follow-through."
expected_upside: "Clean benchmark for FMP/risk ranking and fast signal refresh."
expected_downside: "Can whipsaw when factor leadership rotates quickly."
position_sizing: "Use as a diagnostic and tactical basket, not a fundamental core book."
required_sources: ["[[SEC EDGAR API]]", "[[NewsAPI]]", "[[FRED API]]", "[[CBOE_Options]]"]
required_pull_families: ["newsapi --topic business", "fred --group rates", "cboe --skew"]
monitor_status: "on-track"
monitor_last_review: "2026-04-01"
monitor_change: "Initial investor-style basket created for FMP coverage."
break_risk_status: "watch"
monitor_action: "Refresh frequently and let FMP/risk ranking do most of the work."
core_entities: ["[[AAPL]]", "[[AMZN]]", "[[GOOGL]]", "[[MSFT]]", "[[NVDA]]", "[[Tech Sector]]", "[[USA]]"]
supporting_regimes: ["[[Risk-On]]", "[[Goldilocks]]", "[[Risk-Off]]"]
key_indicators: ["[[VIX]]", "[[10Y Treasury]]", "[[Fed Funds Rate]]"]
bullish_drivers: ["Momentum persistence", "High liquidity", "Cross-sectional ranking discipline"]
bearish_drivers: ["Factor reversals", "Crowded mega-cap positioning", "Volatility spikes"]
invalidation_triggers: ["Momentum leadership breaks down across the basket", "Volatility remains too high for trend persistence", "Ranking turnover rises without producing better outcomes"]
fmp_watchlist_symbols: ["AAPL", "AMZN", "GOOGL", "MSFT", "NVDA"]
fmp_watchlist_symbol_count: 5
fmp_primary_symbol: "AAPL"
fmp_technical_symbol_count: 5
fmp_technical_nonclear_count: 3
fmp_technical_bearish_count: 1
fmp_technical_overbought_count: 2
fmp_technical_oversold_count: 0
fmp_primary_technical_status: "clear"
fmp_primary_technical_bias: "bullish"
fmp_primary_momentum_state: "positive"
fmp_primary_rsi14: 59.39
fmp_primary_price_vs_sma200_pct: 6.77
fmp_primary_fundamentals_status: "complete"
fmp_primary_market_cap: 4018853915477
fmp_primary_trailing_pe: 34.24
fmp_primary_price_to_sales: 9.23
fmp_primary_price_to_book: 45.73
fmp_primary_ev_to_sales: 9.33
fmp_primary_ev_to_ebitda: 26.57
fmp_primary_roe_pct: 159.94
fmp_primary_roic_pct: 51.01
fmp_primary_operating_margin_pct: 32.38
fmp_primary_net_margin_pct: 27.04
fmp_primary_current_ratio: 0.97
fmp_primary_debt_to_equity: 1.03
fmp_primary_price_target: 286.86
fmp_primary_analyst_count: 50
fmp_primary_target_upside_pct: 4.91
fmp_primary_fundamentals_cached_at: "2026-04-24"
fmp_primary_snapshot_date: "2026-04-24"
fmp_calendar_symbol_count: 4
fmp_calendar_pull_date: "2026-04-23"
fmp_next_earnings_date: "2026-04-29"
fmp_next_earnings_symbols: ["AMZN", "GOOGL", "MSFT"]
fmp_last_sync: "2026-04-24"
tags: ["thesis", "strategy", "simons", "quant", "momentum"]
---

## Summary
- A high-liquidity quant basket meant to work with FMP and agent review.
- The purpose is fast ranking, comparison, and turnover discipline.

## Core Logic
1. Highly liquid leaders are the cleanest place to test momentum persistence.
2. Rules and ranking matter more than narrative in this basket.
3. If the quant sleeve cannot stay coherent here, the broader signal environment is probably unstable.

## Key Entities
| Entity | Role | Link |
|--------|------|------|
| [[AAPL]] | Liquid platform leader | Stability plus trend |
| [[AMZN]] | Consumer/cloud trend proxy | Cross-sector breadth |
| [[GOOGL]] | Communication and AI platform | Large-cap trend engine |
| [[MSFT]] | Software/cloud compounder | Quality momentum |
| [[NVDA]] | AI compute leader | High-beta momentum |

## Supporting Macro
- **Regime**: Best in stable [[Risk-On]] conditions with manageable rate pressure.
- **Key indicators**: Watch [[VIX]], [[10Y Treasury]], and [[Fed Funds Rate]].

## Invalidation Criteria
- Trend persistence breaks for liquid leaders.
- Volatility overwhelms signal quality.
- Breadth narrows to one fragile theme.

## Monitor Review
- **Last review**: 2026-04-01
- **Change this week**: Initial investor-style basket created for FMP coverage.
- **Break risk status**: watch
- **Action**: Refresh frequently and compare with sector baskets.
