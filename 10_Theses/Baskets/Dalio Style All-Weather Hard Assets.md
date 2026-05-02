---
node_type: "thesis"
name: "Dalio Style All-Weather Hard Assets"
status: "Active"
conviction: "medium"
timeframe: "long"
allocation_priority: "watch"
allocation_rank: 3
why_now: "Sticky inflation, fiscal stress, and geopolitical noise keep hard-asset diversification relevant even after large moves."
variant_perception: "Investors keep treating inflation hedges as tactical trades instead of strategic portfolio ballast."
next_catalyst: "Real-rate moves, commodity momentum, and renewed fiscal or geopolitical stress."
disconfirming_evidence: "Disinflation and stable growth make hard-asset protection unnecessary for a long stretch."
expected_upside: "Portfolio ballast and convexity when inflation or geopolitical stress re-accelerates."
expected_downside: "Can underperform badly in a clean disinflationary growth regime."
position_sizing: "Use as a macro-diversifier rather than a standalone core equity book."
required_sources: ["[[US Treasury Data]]", "[[FRED API]]", "[[NewsAPI]]", "[[CBOE_Options]]"]
required_pull_families: ["treasury --yields", "fred --group inflation", "newsapi --topic business", "cboe --skew"]
monitor_status: "on-track"
monitor_last_review: "2026-04-01"
monitor_change: "Initial investor-style basket created for FMP coverage."
break_risk_status: "not-seen"
monitor_action: "Refresh monthly and watch real rates, inflation, and geopolitical signals."
core_entities: ["[[GOLD]]", "[[NEM]]", "[[WPM]]", "[[XOM]]", "[[Gold]]", "[[Materials]]", "[[Energy]]", "[[USA]]"]
supporting_regimes: ["[[Stagflation]]", "[[Geopolitical Escalation]]", "[[Risk-Off]]"]
key_indicators: ["[[CPI]]", "[[10Y Treasury]]", "[[DXY]]"]
bullish_drivers: ["Inflation hedging", "Fiscal stress", "Commodity scarcity"]
bearish_drivers: ["Falling inflation", "Strong dollar", "Disinflationary growth"]
invalidation_triggers: ["Real rates rise persistently while commodities weaken", "Dollar strength keeps crushing hard-asset equities", "Geopolitical stress fades and inflation undershoots for multiple quarters"]
fmp_watchlist_symbols: ["GOLD", "NEM", "WPM", "XOM"]
fmp_watchlist_symbol_count: 4
fmp_primary_symbol: "GOLD"
fmp_technical_symbol_count: 4
fmp_technical_nonclear_count: 0
fmp_technical_bearish_count: 1
fmp_technical_overbought_count: 0
fmp_technical_oversold_count: 0
fmp_primary_technical_status: "clear"
fmp_primary_technical_bias: "mixed"
fmp_primary_momentum_state: "neutral"
fmp_primary_rsi14: 52
fmp_primary_price_vs_sma200_pct: 33.75
fmp_primary_fundamentals_status: "complete"
fmp_primary_market_cap: 1186429300
fmp_primary_trailing_pe: 93.06
fmp_primary_price_to_sales: 0.08
fmp_primary_price_to_book: 1.78
fmp_primary_ev_to_sales: 0.09
fmp_primary_ev_to_ebitda: -8.87
fmp_primary_roe_pct: 1.93
fmp_primary_roic_pct: -13.76
fmp_primary_operating_margin_pct: -1.23
fmp_primary_net_margin_pct: 0.08
fmp_primary_current_ratio: 1.21
fmp_primary_debt_to_equity: 0.47
fmp_primary_price_target: 50.8
fmp_primary_analyst_count: 5
fmp_primary_target_upside_pct: 8.32
fmp_primary_fundamentals_cached_at: "2026-04-24"
fmp_primary_snapshot_date: "2026-04-24"
fmp_calendar_symbol_count: 4
fmp_calendar_pull_date: "2026-04-24"
fmp_next_earnings_date: "2026-05-01"
fmp_next_earnings_symbols: ["XOM"]
fmp_last_sync: "2026-04-24"
tags: ["thesis", "strategy", "dalio", "hard-assets", "macro"]
---

## Summary
- A simple hard-asset sleeve inspired by all-weather thinking, implemented with liquid equity proxies.
- The goal is resilience when inflation or geopolitical stress returns.

## Core Logic
1. Gold-linked equities and energy producers can offset regimes that hurt duration-heavy portfolios.
2. The basket is not a market-beating promise; it is a diversification tool.
3. Hard-asset exposures work best when fiscal, inflation, or geopolitical stress rises together.

## Key Entities
| Entity | Role | Link |
|--------|------|------|
| [[GOLD]] | Gold miner | Hard-asset beta |
| [[NEM]] | Gold miner bellwether | Scale and liquidity |
| [[WPM]] | Royalty model | Lower operating risk |
| [[XOM]] | Energy cash-flow anchor | Commodity and inflation linkage |

## Supporting Macro
- **Regime**: Works best in [[Stagflation]] and [[Geopolitical Escalation]].
- **Key indicators**: Watch [[CPI]], [[10Y Treasury]], and [[DXY]].

## Invalidation Criteria
- Inflation and commodity pressure keep fading.
- The dollar and real rates stay too strong.
- Diversification benefit disappears versus simpler market exposure.

## Monitor Review
- **Last review**: 2026-04-01
- **Change this week**: Initial investor-style basket created for FMP coverage.
- **Break risk status**: not-seen
- **Action**: Refresh monthly and compare against quality and energy baskets.
