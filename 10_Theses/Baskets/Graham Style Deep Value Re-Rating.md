---
node_type: "thesis"
name: "Graham Style Deep Value Re-Rating"
status: "Active"
conviction: "medium"
timeframe: "medium"
allocation_priority: "watch"
allocation_rank: 3
why_now: "A slower-growth market can reward balance-sheet safety and cash-flow yields after momentum leadership gets crowded."
variant_perception: "Cheap large caps are often dismissed as dead money until earnings stability and cash returns matter again."
next_catalyst: "Dividend support, buyback pacing, and any rotation into lower-multiple defensives."
disconfirming_evidence: "Low multiples remain traps because earnings quality keeps deteriorating."
expected_upside: "Multiple normalization plus income support without needing heroic growth assumptions."
expected_downside: "Value traps can stay cheap longer than expected in a strong risk-on tape."
position_sizing: "Best as a valuation counterweight to growth-heavy sleeves."
required_sources: ["[[SEC EDGAR API]]", "[[Financial Modeling Prep]]", "[[NewsAPI]]", "[[FRED API]]"]
required_pull_families: ["sec --thesis", "newsapi --topic business", "fred --group rates"]
monitor_status: "on-track"
monitor_last_review: "2026-04-01"
monitor_change: "Initial investor-style basket created for FMP coverage."
break_risk_status: "not-seen"
monitor_action: "Refresh monthly and focus on earnings quality rather than just cheap multiples."
core_entities: ["[[PFE]]", "[[MRK]]", "[[JPM]]", "[[CVX]]", "[[Healthcare]]", "[[Financials]]", "[[Energy]]", "[[USA]]"]
supporting_regimes: ["[[Risk-Off]]", "[[Recession]]", "[[Rate Cut Cycle]]"]
key_indicators: ["[[Yield Curve]]", "[[Fed Funds Rate]]", "[[VIX]]"]
bullish_drivers: ["Low starting multiples", "Dividend support", "Cash-rich balance sheets"]
bearish_drivers: ["Value traps", "Weak earnings revisions", "Macro-sensitive financial conditions"]
invalidation_triggers: ["Earnings estimates keep falling across the basket", "Credit losses or energy-price shocks overwhelm valuation support", "Cheap multiples persist because business quality is structurally impaired"]
fmp_watchlist_symbols: ["PFE", "MRK", "JPM", "CVX"]
fmp_watchlist_symbol_count: 4
fmp_primary_symbol: "PFE"
fmp_technical_symbol_count: 4
fmp_technical_nonclear_count: 0
fmp_technical_bearish_count: 2
fmp_technical_overbought_count: 0
fmp_technical_oversold_count: 0
fmp_primary_technical_status: "clear"
fmp_primary_technical_bias: "mixed"
fmp_primary_momentum_state: "neutral"
fmp_primary_rsi14: 48.11
fmp_primary_price_vs_sma200_pct: 5.54
fmp_primary_fundamentals_status: "complete"
fmp_primary_market_cap: 151634509331
fmp_primary_trailing_pe: 19.5
fmp_primary_price_to_sales: 2.42
fmp_primary_price_to_book: 1.75
fmp_primary_ev_to_sales: 3.48
fmp_primary_ev_to_ebitda: 12.98
fmp_primary_roe_pct: 8.67
fmp_primary_roic_pct: 8.84
fmp_primary_operating_margin_pct: 24.67
fmp_primary_net_margin_pct: 12.42
fmp_primary_current_ratio: 1.16
fmp_primary_debt_to_equity: 0.78
fmp_primary_price_target: 27.87
fmp_primary_analyst_count: 15
fmp_primary_target_upside_pct: 4.55
fmp_primary_fundamentals_cached_at: "2026-04-24"
fmp_primary_snapshot_date: "2026-04-24"
fmp_calendar_symbol_count: 3
fmp_calendar_pull_date: "2026-04-24"
fmp_next_earnings_date: "2026-04-30"
fmp_next_earnings_symbols: ["MRK"]
fmp_last_sync: "2026-04-24"
tags: ["thesis", "strategy", "graham", "value"]
---

## Summary
- A modern large-cap interpretation of Graham-style value rather than literal net-net screening.
- Basket focuses on low-expectation businesses with scale, liquidity, and cash return.

## Core Logic
1. The cheapest liquid large caps can rerate when the market stops paying any price for growth.
2. Yield and buybacks shorten the wait for mean reversion.
3. Balance-sheet quality matters because cheap stocks without staying power are just traps.

## Key Entities
| Entity | Role | Link |
|--------|------|------|
| [[PFE]] | Pharma value anchor | Cash flow and defensive optionality |
| [[MRK]] | Higher-quality value within pharma | Oncology cash machine |
| [[JPM]] | Financial value proxy | Scale and capital discipline |
| [[CVX]] | Energy cash-yield anchor | Commodity-linked value exposure |

## Supporting Macro
- **Regime**: Best when [[Risk-Off]] or [[Rate Cut Cycle]] rotation favors cash-generative defensives.
- **Key indicators**: Watch [[Yield Curve]], [[Fed Funds Rate]], and [[VIX]].

## Invalidation Criteria
- Cheap names keep de-rating because quality is worsening.
- Cash return programs weaken materially.
- Credit or commodity stress overwhelms balance-sheet support.

## Monitor Review
- **Last review**: 2026-04-01
- **Change this week**: Initial investor-style basket created for FMP coverage.
- **Break risk status**: not-seen
- **Action**: Refresh monthly and watch estimate revisions closely.
