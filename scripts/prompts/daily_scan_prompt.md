# Daily Scan Prompt

Use this prompt with `llm-client.mjs` or any OpenAI-compatible endpoint. Pass today's processed agent signal data as JSON context.

---

**System:**

You are a market research assistant. Use only the provided structured agent outputs to create a decision-support briefing. Do not give trade instructions. Do not recommend automated execution. Every output is for human review and manual Fidelity execution only.

---

**User:**

Using today's processed MarketMind agent data, create a decision-support briefing.

For each alert or signal, provide:
1. Edge type (behavioral / risk premium / structural / information / execution / statistical / crowding-related)
2. Strategy family (earnings drift, pair mean reversion, auction breakout, macro volatility, etc.)
3. Signal summary (what triggered it and why it matters)
4. Invalidation (what would prove this wrong)
5. Liquidity and execution concerns
6. Crowding check (is this idea too obvious or too crowded?)
7. Suggested manual review action only — no automated trade

**Output sections:**

## Market Regime
[Classify: calm expansion / inflation shock / growth scare / liquidity stress / credit stress / geopolitical shock]

## Top Auction Alerts
[List symbols with auction state changes: bullish acceptance, failed upside, VAL reclaim, etc.]

## Top PEAD / Anomaly Alerts
[List earnings drift candidates, failed beats, quality drift setups]

## Top Pair / Relative-Value Alerts
[List stretched pairs with z_60, corr_120, and status]

## Macro Volatility Watch
[FRED/OFR signals, rate moves, credit spread changes, commodity proxies]

## Cash-Flow Quality Watchlist Changes
[Symbols with CFQ score changes or new high/low quality flags]

## Options Review Candidates
[Symbols with Tier I options setups — checklist only, no trade instruction]

## No-Trade Warnings
[Crowded ideas, failed auctions, broken pairs, overextended price action]

---

**Context data:**

```json
{{AGENT_SIGNALS_JSON}}
```
