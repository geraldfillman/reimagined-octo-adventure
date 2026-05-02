---
title: Entropy Strategy Monitoring Cheat Sheet
type: reference
tags: [reference, entropy, strategy, monitoring, agents]
last_updated: 2026-04-28
---

# Entropy Strategy Monitoring Cheat Sheet

Purpose: Use entropy as a shadow-monitoring layer before treating it as an active strategy input. Entropy is a move-risk signal, not a direction signal.

## Core Rule

Low entropy means evidence or order flow is becoming more ordered. It does not say which way price will move. Direction must still come from price, risk, fundamentals, macro, sentiment, filings, and thesis evidence.

## Fields To Watch

| Field | Where | Meaning |
|---|---|---|
| `entropy_level` | Agent analysis note | Cross-agent verdict concentration |
| `entropy_score` | Agent analysis note | 0 to 1 entropy score; lower is more ordered |
| `microstructure_entropy_level` | Agent analysis note | FMP 1-minute sign x volume transition entropy proxy |
| `microstructure_entropy_score` | Agent analysis note | 0 to 1 order-flow entropy proxy |
| `final_verdict` | Agent analysis note | Directional read from specialists |
| `final_confidence` | Agent analysis note | Confidence after coverage/disagreement penalty |
| `disagreement` | Agent analysis raw synthesis | How much the agent stack conflicts |
| `signal_status` | Pull note frontmatter | Operator attention level |

## Entropy Levels

| Level | Score Zone | Monitoring Read | Action |
|---|---:|---|---|
| `compressed` | <= 0.25 | Highly ordered. Possible move-risk compression. | Review catalyst timing, stops, sizing, and confirming evidence. |
| `ordered` | <= 0.50 | Clear evidence lean. | Track for repeat confirmation across days and agents. |
| `mixed` | <= 0.75 | Some structure, not decisive. | Keep in watch mode; compare with tape and thesis state. |
| `diffuse` | > 0.75 | Evidence scattered. | Do not upgrade conviction without reconciliation. |
| `unknown` | N/A | Data unavailable. | Rerun or check API/data coverage. |

## Monitoring Protocol

### Phase 1: Shadow Log

Run entropy-enabled agent pulls without acting on them.

```powershell
node run.mjs pull entropy-monitor
node run.mjs pull entropy-monitor --backtest
node run.mjs pull agent-analyst --strategy "SPY QQQ Entropy Expansion Monitor" --agents price,risk,microstructure,macro --skip-llm
node run.mjs pull agent-analyst --strategy "Simons Style Quant Momentum Breadth" --limit 5 --skip-llm
node run.mjs pull agent-analyst --all-strategies --limit 12 --skip-llm
```

Track for at least 20 to 30 observations before using the signal in decisions.
For intraday validation, run `entropy-monitor` more than once during regular market hours; later runs settle prior observations once 5m, 15m, 30m, 60m, and 120m future bars exist.

For the SPY/QQQ monitor, the persistent shadow ledger is:

```text
scripts/.cache/entropy-monitor/entropy-monitor-ledger.csv
scripts/.cache/entropy-monitor/backtests/
```

Record:
- Symbol
- Sector
- Agent entropy level and score
- Microstructure entropy level and score
- Final verdict and confidence
- Next 5m, 15m, 30m, 60m, and 120m absolute move for the SPY/QQQ ledger
- Next 1-day, 3-day, and 5-day absolute move for slower agent-analysis baskets
- Whether direction was correctly predicted
- Whether magnitude increased versus the symbol's recent baseline

### Phase 2: Magnitude Validation

Only judge entropy on magnitude timing first.

Good validation question:
- "Did low entropy precede a larger-than-usual move?"

Bad validation question:
- "Did low entropy predict the right direction?"

Use a simple rule of thumb:
- Count a magnitude hit if the next 1 to 5 trading days exceed the symbol's recent median absolute move.
- Count a direction hit separately, but do not let direction results drive the entropy thesis.

### Phase 3: Confirmation Stack

Do not treat entropy as useful unless at least two of these also line up:

| Confirming Layer | Bullish Example | Bearish Example |
|---|---|---|
| Price | Above key moving averages, improving momentum | Moving-average damage, weak RSI/MACD |
| Risk | Drawdown contained, volatility stable | Volatility rising, drawdown widening |
| Fundamentals | Quality/valuation improving | Balance-sheet or margin stress |
| Catalyst | Earnings, filings, policy, contract evidence | Dilution, guidance risk, regulatory hit |
| Thesis | Matches current thesis driver | Hits invalidation trigger |

## Decision Rules Before Active Use

Use entropy only as a watchlist/risk-management input until these conditions are met:

1. At least 20 completed shadow observations exist.
2. Low entropy shows better magnitude timing than random or baseline entries.
3. Directional accuracy is not the claimed edge.
4. Results hold across more than one sector.
5. Outliers do not explain most of the effect.
6. The pull path is stable with no frequent `unknown` entropy values.
7. A written playbook defines entry, exit, stop, holding period, and max position size. See [[04_Reference/ORB + Entropy Strategy Playbook]].

## Practical Reads

| Setup | Read |
|---|---|
| `microstructure_entropy_level = compressed` and verdict bullish | Possible upside move-risk; require price/catalyst confirmation. |
| `microstructure_entropy_level = compressed` and verdict bearish | Possible downside move-risk; review exposure and risk controls. |
| `entropy_level = ordered` and `final_confidence >= 0.60` | Agent stack is coherent; watch for repeat confirmation. |
| `entropy_level = diffuse` and mixed agent signals | Do not act; identify which layer conflicts. |
| Low entropy but low volume / weak catalyst | Treat as interesting, not actionable. |
| Low entropy after a large move already happened | Risk of chasing; compare to trailing return and catalyst timing. |

## Red Flags

- Using entropy as a buy/sell direction predictor.
- Acting on one compressed reading with no repeat evidence.
- Ignoring `diffuse` agent entropy because the final verdict looks attractive.
- Treating FMP 1-minute bars as equivalent to licensed tick-level trade data.
- Forgetting that the paper used a limited SPY sample and needs broader validation.
- Letting one high-profit event dominate the conclusion.

## Suggested Dashboard Checks

Start here:
- [[16_Agents/Orchestrator Agent/Pulls]] -> Entropy Compression Queue
- [[16_Agents/Research Agent/Investment Strategies]]
- [[00_Dashboard/Catalyst Radar]]
- [[00_Dashboard/Full Picture Reports]]

## Minimum Active Strategy Gate

Before active use, create a strategy note from [[03_Templates/Investment Strategy Basket]] and fill in:
- Universe
- Entropy threshold
- Confirming layers required
- Entry condition
- Exit condition
- Stop-loss or invalidation rule
- Holding window
- Paper-trade results
- Failure modes

Until that note exists and has at least 20 to 30 shadow observations, entropy remains a monitor, not a strategy.

### Entropy Exit Protocol — Gate Status

The academic exit protocol is now specified in [[04_Reference/ORB + Entropy Strategy Playbook]] (Entropy Exit Protocol section). Gate items completed:

| Item | Status |
|---|---|
| Entry condition | ✓ Trailing 5-min return (momentum heuristic) |
| Exit condition | ✓ 5 bps stop / 300-second timeout / fixed take-profit |
| Stop-loss rule | ✓ 5 bps from entry |
| Holding window | ✓ Max 300 seconds |
| Transaction cost model | ✓ 0.57 bps round-trip |
| Take-profit threshold | Pending — set ex ante per training window |
| Shadow observations (20+) | Pending |
| Magnitude validation | Pending |

> Academic disclaimer: all results under this protocol are based on historical backtests and do not constitute investment advice.
