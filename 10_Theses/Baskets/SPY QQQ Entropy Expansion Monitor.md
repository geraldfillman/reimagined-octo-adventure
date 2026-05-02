---
node_type: "thesis"
name: "SPY QQQ Entropy Expansion Monitor"
status: "Active"
conviction: "low"
timeframe: "intraday"
allocation_priority: "watch"
allocation_rank: 35
why_now: "Shadow-test whether lower order-flow entropy in SPY and QQQ precedes larger absolute intraday moves."
variant_perception: "Entropy is treated as movement-expansion timing evidence, not as a buy/sell direction signal."
next_catalyst: "Accumulate 20 to 30 settled entropy observations per symbol."
disconfirming_evidence: "Low or near-low entropy windows do not show larger 5m, 15m, 30m, 60m, or 120m absolute moves than baseline observations."
expected_upside: "Improves timing for volatility expansion, hedge review, and post-compression watch windows."
expected_downside: "False compression readings, overfitting to short samples, or using entropy as direction rather than magnitude."
position_sizing: "Research monitor only until the entropy ledger has enough settled observations."
required_sources: ["[[Financial Modeling Prep]]"]
required_pull_families: ["entropy-monitor", "agent-analyst --strategy"]
core_entities: ["[[SPY]]", "[[QQQ]]"]
supporting_regimes: ["[[High Volatility Regime]]", "[[Risk-On Regime]]", "[[Risk-Off Regime]]"]
key_indicators: ["[[VIX]]", "[[10Y Treasury]]", "[[DXY Dollar Index]]"]
bullish_drivers: ["[[Market Breadth Expansion]]", "[[Risk-On Regime]]"]
bearish_drivers: ["[[Volatility Shock]]", "[[Risk-Off Regime]]"]
invalidation_triggers: ["Low entropy does not outperform baseline absolute movement", "Signal only appears after the move has already expanded", "FMP intraday data becomes unreliable or stale"]
tags: ["thesis", "strategy", "entropy-monitor"]
---

# SPY QQQ Entropy Expansion Monitor

## Summary
- Tests whether low order-flow entropy on broad liquid ETFs precedes larger absolute intraday moves.
- Starts with `SPY` and `QQQ` because they are liquid enough for repeated 1-minute entropy readings.
- Remains a shadow monitor until the ledger proves movement expansion versus baseline.

## Strategy Rules
1. Universe: `SPY`, `QQQ`.
2. Signal: 15-state sign x volume transition entropy over the last 120 one-minute bars.
3. Watch buckets: `near-low-watch` at entropy <= 0.60, `low-entropy-watch` at entropy <= 0.50.
4. Outcome horizons: 5m, 15m, 30m, 60m, and 120m absolute percentage move after the observation.
5. Risk control: no directional trade from entropy alone; require price, catalyst, macro, or risk confirmation.
6. Promotion gate: at least 20 to 30 settled observations per symbol, with low/near-low windows showing better movement expansion than baseline.

## Evidence Plan
- Entropy ledger: `node run.mjs pull entropy-monitor`
- Historical baseline: `node run.mjs pull entropy-monitor --backtest`
- Agent analyst: `node run.mjs pull agent-analyst --strategy "SPY QQQ Entropy Expansion Monitor" --agents price,risk,microstructure,macro --skip-llm`
- FMP tape: review current price trend, volume, and market regime context.
- Backtest: compare average absolute move for low/near-low rows against all settled rows.
- Entropy read: classify signal as magnitude timing only.

## Test Log

| Date | Command | Result | Decision |
|---|---|---|---|
| 2026-04-28 | `node run.mjs pull entropy-monitor --json` | First SPY/QQQ ledger row written; both baseline/mixed. | Continue shadow collection. |
