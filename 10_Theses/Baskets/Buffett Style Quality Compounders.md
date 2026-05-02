---
node_type: "thesis"
name: "Buffett Style Quality Compounders"
status: "Active"
conviction: "medium"
timeframe: "long"
allocation_priority: "watch"
allocation_rank: 3
why_now: "Quality balance sheets and pricing power matter more when macro volatility stays elevated and capital costs stop falling."
variant_perception: "The market often treats quality as fully priced until volatility reminds investors how scarce durable cash flow really is."
next_catalyst: "Earnings resilience, buyback cadence, and any rotation toward profitable large caps."
disconfirming_evidence: "Core holdings lose pricing power or free-cash-flow durability at the same time."
expected_upside: "Steadier compounding with shallower drawdowns than a speculative growth basket."
expected_downside: "Can lag badly during liquidity-driven melt-ups."
position_sizing: "Use as a core-quality sleeve rather than a high-turnover alpha trade."
required_sources: ["[[SEC EDGAR API]]", "[[Financial Modeling Prep]]", "[[NewsAPI]]", "[[FRED API]]"]
required_pull_families: ["sec --thesis", "newsapi --topic business", "fred --group rates"]
monitor_status: "on-track"
monitor_last_review: "2026-04-01"
monitor_change: "Initial investor-style basket created for FMP coverage."
break_risk_status: "not-seen"
monitor_action: "Refresh monthly and compare relative strength versus broad market baskets."
core_entities: ["[[AAPL]]", "[[AXP]]", "[[BRK_B]]", "[[KO]]", "[[Tech Sector]]", "[[Financials]]", "[[Consumer Staples]]", "[[USA]]"]
supporting_regimes: ["[[Goldilocks]]", "[[Risk-Off]]", "[[Recession]]"]
key_indicators: ["[[10Y Treasury]]", "[[Fed Funds Rate]]", "[[VIX]]"]
bullish_drivers: ["Pricing power", "Low leverage", "Disciplined capital allocation"]
bearish_drivers: ["Multiple compression", "Consumer slowdown", "Crowded large-cap ownership"]
invalidation_triggers: ["Two or more core holdings post sustained margin erosion", "Rates fall and speculation sharply outperforms quality for multiple quarters", "Management teams prioritize financial engineering over durable reinvestment"]
fmp_watchlist_symbols: ["AAPL", "AXP", "BRK_B", "KO"]
fmp_watchlist_symbol_count: 4
fmp_primary_symbol: "AAPL"
fmp_technical_symbol_count: 3
fmp_technical_nonclear_count: 1
fmp_technical_bearish_count: 1
fmp_technical_overbought_count: 0
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
fmp_calendar_symbol_count: 2
fmp_calendar_pull_date: "2026-04-24"
fmp_next_earnings_date: "2026-04-30"
fmp_next_earnings_symbols: ["AAPL"]
fmp_last_sync: "2026-04-24"
tags: ["thesis", "strategy", "buffett", "quality"]
---

## Summary
- Inspired by Buffett-style quality compounding rather than a literal current portfolio clone.
- Basket favors durable cash flow, pricing power, and capital-allocation discipline.

## Core Logic
1. Durable brands and platforms usually defend margins better than the market during macro noise.
2. Lower drawdowns create compounding edge when capital is recycled over multi-year windows.
3. A concentrated quality sleeve is most useful as a portfolio stabilizer, not a tactical trade.

## Key Entities
| Entity | Role | Link |
|--------|------|------|
| [[AAPL]] | Consumer-tech compounder | Ecosystem lock-in and cash generation |
| [[AXP]] | Affluent payments proxy | Spend quality and credit discipline |
| [[BRK_B]] | Capital allocator | Insurance float plus diversified earnings |
| [[KO]] | Defensive pricing-power anchor | Staple demand and global distribution |

## Supporting Macro
- **Regime**: Works best in [[Goldilocks]] and relative-to-market defense phases.
- **Key indicators**: Watch [[10Y Treasury]], [[Fed Funds Rate]], and [[VIX]] for valuation pressure and risk appetite.

## Invalidation Criteria
- Margin durability breaks across the basket.
- Buyback and capital-allocation discipline weakens.
- Speculative beta becomes structurally better rewarded than quality.

## Monitor Review
- **Last review**: 2026-04-01
- **Change this week**: Initial investor-style basket created for FMP coverage.
- **Break risk status**: not-seen
- **Action**: Refresh monthly and compare with growth and value baskets.
