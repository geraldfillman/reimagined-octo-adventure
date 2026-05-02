---
title: ORB + Entropy Strategy Playbook
type: reference
tags: [reference, orb, entropy, strategy, intraday, equities]
last_updated: 2026-04-29
risk_model: tiered
exit_model: split-2R-plus-hold
---

# ORB + Entropy Strategy Playbook

Based on Zarattini / Barbon / Aziz opening-range breakout research, filtered by entropy confirmation.

---

## Universe

| Filter | Requirement |
|---|---|
| Price | > $5.00 at open |
| Avg daily volume (14d) | >= 1,000,000 shares |
| ATR14 | > $0.50 |
| Relative volume (opening 5 min vs prior 14d avg) | >= 100% |
| Max candidates per day | Top 20 ranked by relative volume |

Universe is locked at 9:35 AM ET from the pre-market screen (`FMP_RelVol_Screen`).

---

## Entropy Filter

Entropy is an optional confirmation layer, not a direction signal.

| Bucket | Score | Treatment |
|---|---|---|
| `low-entropy-watch` | <= 0.50 | **Confirmed** — highest conviction, act first |
| `near-low-watch` | <= 0.60 | **Confirmed** — second tier |
| `baseline` | > 0.60 | **Active** — valid trade, no entropy edge |

Entropy-confirmed setups are highlighted separately in the daily screen output.

---

## Entry Rules

Wait for the 9:30–9:35 AM ET (first 5-minute) candle to close. Direction is locked by that candle and cannot be reversed.

| First candle | Direction | Order type | Trigger price |
|---|---|---|---|
| Bullish (close > open) | LONG only | Stop-buy | OR high |
| Bearish (close < open) | SHORT only | Stop-sell | OR low |
| Doji (close = open) | No trade | — | — |

**No direction flip**: if the candle was bullish but price breaks the OR low before the OR high, skip the trade entirely — do not reverse to short.

The order sits passive until triggered or the session ends.

---

## Stop Loss

Set immediately on fill. Never adjusted after entry.

```
Stop distance = 10% x ATR14
Long stop  = entry - (0.10 x ATR14)
Short stop = entry + (0.10 x ATR14)
```

Stops are intentionally tight. The strategy relies on small, capped losses paired with large runners.

---

## Profit Target and Exit

Split each position into two equal layers at entry:

| Layer | Size | Exit rule | Purpose |
|---|---|---|---|
| Income layer | 50% of shares | Exit at **2R** (2× the stop distance beyond entry) | Locks baseline cash each session |
| Edge layer | 50% of shares | Hold to **4:00 PM ET** market-on-close | Captures full-session trend-day runners |

| Rule | Detail |
|---|---|
| 2R take-profit | Income layer exits at entry ± (2 × R/share) — see 2R Target column in trade sheet |
| Close-of-day exit | Edge layer exits at 4:00 PM ET market-on-close — no profit target |
| Stop-loss | Full position stopped out at stop price (set on fill, never moved) — both layers exit |
| Trailing stops | None |
| Re-entry after stop-out | Not permitted — one attempt per symbol per session |

The split is intentional. Locking 2R on half the position provides consistent income; holding the remainder preserves the asymmetric edge that makes the strategy work at a sub-50% hit rate.

---

## Position Sizing

Risk per trade is tiered by setup quality — higher conviction earns larger size. A global `--risk-scale` multiplier can adjust all tiers proportionally (e.g., `--risk-scale 0.5` halves all tiers during drawdown).

### Risk Tiers

| Tier | Setup | Risk % | Risk$ on $25k |
|---|---|---|---|
| Prime + ★ | All 3 filters + sustained compression | **3%** | $750 |
| Prime | Gap aligned + VWAP confirmed + tight range | **2%** | $500 |
| Confirmed | Entropy ≤ 0.60 only | **1.5%** | $375 |
| Active | Direction set, baseline entropy | **1%** | $250 |

### Sizing Formula

```
R per share   = |entry - stop|  =  0.10 × ATR14
Shares        = floor((capital × risk% × vol_scalar) / R per share)
Max shares    = floor((capital × 4) / entry)
Final shares  = min(shares, max shares)
Risk dollars  = final shares × R per share
```

Vol scalar from SPY 20-day realized vol is applied on top of the tier risk% (see Volatility Targeting).

### Daily Loss Cap (optional)

Pass `--daily-loss-cap 750` to document the session halt level in the trade sheet. At $25k with tiered sizing, a reasonable cap is **3% of capital ($750)** — equivalent to three full Active stop-outs or one Prime + ★ stop-out.

| Account size | Active risk (1%) | Prime risk (2%) | Prime+★ risk (3%) |
|---|---|---|---|
| $1,000 | $10 | $20 | $30 |
| $5,000 | $50 | $100 | $150 |
| $25,000 | $250 | $500 | $750 |

---

## Entropy Exit Protocol (Academic)

> All results for this rule are based on historical backtests. This study is purely academic and does not constitute investment advice.

This protocol replaces the hold-to-close rule when running an entropy-signal-only backtest. It is **not** the live ORB workflow — it is a separate academic framework for measuring the entropy edge in isolation.

### Entry

Enter in the direction of the trailing 5-minute return at the moment the entropy signal fires (momentum heuristic). This replaces the ORB candle direction rule.

| 5-min trailing return | Direction |
|---|---|
| Positive | LONG |
| Negative | SHORT |
| Zero | Skip |

### Exit

Three exit conditions; first to trigger closes the position:

| # | Condition | Detail |
|---|---|---|
| 1 | Stop-loss | 5 bps below (long) or above (short) the entry price |
| 2 | Timeout | 300 seconds (5 minutes) after entry — exit at market |
| 3 | Take-profit | Fixed threshold chosen ex ante in the training window |

Stop is 5 bps = 0.05% of entry price. Example: entry at $100.00 → long stop at $99.95, short stop at $100.05.

Take-profit level is determined per training window before live observation and must not be adjusted retroactively.

### Transaction Costs

0.57 bps round-trip, calibrated to SPY's typical 0.17 bps quoted spread:

| Component | Bps |
|---|---|
| Half-spread (entry) | 0.085 |
| Half-spread (exit) | 0.085 |
| Slippage | 0.30 |
| Exchange fees | 0.10 |
| **Total round-trip** | **0.57** |

### Today's Example (2026-04-29)

Using SPY's 0.17 bps quoted spread as the benchmark. For any symbol in today's ORB screen with a confirmed entropy signal:

```
Entry price P:
  Stop-loss   = P × (1 − 0.0005)   [long]  or  P × (1 + 0.0005)  [short]
  Net P&L     = gross move − 0.57 bps
  Breakeven   = 0.57 bps gross move required to cover costs
  Timeout     = 300 seconds from fill
```

Apply take-profit from the training-window threshold (not defined here — must be set before observation). See [[04_Reference/Entropy Strategy Monitoring Cheat Sheet]] for shadow-log protocol.

---

## Why This Shape Works

- Hit rate is approximately 48.4% — below a coin flip
- Average winner is multiples larger than the average loser
- Relative volume filter increases trend-day frequency, which is what produces large runners
- Entropy confirmation further concentrates exposure on setups where order flow is already ordered

The asymmetry (tight stop, open-ended winner) is the entire edge. Any rule that caps winners or widens stops degrades it.

---

## Failure Modes

- Exiting winners early on intraday pullbacks
- Widening or moving stops after entry
- Reversing direction when the opposing level breaks first
- Trading doji days
- Ignoring the relative volume filter and trading low-volume names
- Letting one large winning day create false confidence in the hit rate

---

## Daily Workflow

| Time (ET) | Action | Command |
|---|---|---|
| 9:00 AM | Run pre-market rel-vol screen | `node run.mjs pull fmp --rel-vol-screen` |
| 9:35 AM | Refresh entropy + build trade sheet | `node run.mjs entropy-monitor --symbols <top20>` then `node run.mjs pull orb-entropy` |
| 9:35 AM | Review confirmed setups, place passive orders | Open `ORB_Entropy_Screen.md` in Obsidian |
| 4:00 PM | Exit all open positions at market | Manual |

---

## Shadow Log Status

Track at least 20-30 observations before treating entropy confirmation as validated.

- [ ] 20 shadow observations logged
- [ ] Low entropy shows better magnitude timing than baseline entries
- [ ] Results hold across more than one sector
- [ ] Outliers do not explain most of the effect

See [[04_Reference/Entropy Strategy Monitoring Cheat Sheet]] for full validation protocol.
