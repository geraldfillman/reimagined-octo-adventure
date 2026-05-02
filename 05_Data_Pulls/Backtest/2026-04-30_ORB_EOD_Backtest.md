---
title: "ORB EOD Proxy Backtest"
source: "FMP Historical OHLCV"
date_pulled: "2026-04-30"
domain: "backtest"
data_type: "orb_eod_backtest"
frequency: "on-demand"
signal_status: "watch"
signals: ["orb_close_only_negative_avg_r", "orb_close_only_top_negative_avg_r", "orb_wide_stop_top_negative_avg_r"]
close_only_avg_r: "-0.058"
close_only_top_avg_r: "-0.055"
wide_stop_avg_r: "0.008"
wide_stop_top_avg_r: "-0.011"
tags: ["backtest", "orb", "eod", "equities"]
---

## Parameters

- **Lookback**: 120 calendar days from 2025-12-07
- **Gap filter**: ≥ 0.1% open gap aligned with signal direction
- **Top-quintile**: strongest 20% of gap-aligned days by |gap%| per symbol
- **Close-Only R unit**: 10% ATR denominator (no stop applied)
- **Wide-Stop**: 60% ATR stop, 2R target, income/edge (50/50) exit split
- **ATR**: Wilder's EMA-14, no lookahead
- **Entry**: day open for both modes

## Close-Only — Direction Accuracy

_No stop or target. Cleanest test of directional signal quality._

**All gap-aligned days**: 753 trades | Win%: 47.9% | AvgR: -0.058 | TotalR: -43.62
**Top 20% gaps (strongest quintile)**: 151 trades | Win%: 50.3% | AvgR: -0.055 | TotalR: -8.32

| Symbol | Dir | N(all) | Win%(all) | AvgR(all) | N(top20%) | Win%(top) | AvgR(top) | Sharpe(top) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[TER]] | LONG | 45 | 62.2% | 1.625 | 9 | 88.9% | 6.905 | 0.71 |
| [[HLT]] | LONG | 32 | 62.5% | 0.890 | 6 | 100.0% | 4.689 | 1.32 |
| [[CNC]] | SHORT | 36 | 44.4% | 0.053 | 7 | 28.6% | 4.643 | 0.30 |
| [[HOOD]] | LONG | 35 | 45.7% | -0.564 | 7 | 85.7% | 3.109 | 0.44 |
| [[IAU]] | SHORT | 32 | 59.4% | 1.459 | 6 | 66.7% | 2.284 | 0.28 |
| [[GEHC]] | LONG | 28 | 39.3% | -0.983 | 6 | 66.7% | 1.427 | 0.52 |
| [[FTAI]] | LONG | 41 | 48.8% | 1.292 | 8 | 62.5% | 1.248 | 0.25 |
| [[BIIB]] | SHORT | 48 | 56.3% | 0.260 | 10 | 70.0% | 1.046 | 0.23 |
| [[MA]] | SHORT | 46 | 47.8% | 0.510 | 9 | 33.3% | 0.921 | 0.10 |
| [[IWR]] | LONG | 38 | 44.7% | 0.185 | 8 | 37.5% | 0.565 | 0.08 |
| [[V]] | SHORT | 45 | 40.0% | 0.417 | 9 | 22.2% | -0.962 | -0.15 |
| [[SBUX]] | SHORT | 40 | 47.5% | -1.095 | 8 | 37.5% | -1.395 | -0.19 |
| [[TW]] | SHORT | 32 | 56.3% | -0.083 | 6 | 66.7% | -1.696 | -0.12 |
| [[VTR]] | LONG | 33 | 36.4% | -0.931 | 7 | 28.6% | -1.892 | -0.32 |
| [[VRSK]] | LONG | 34 | 41.2% | -1.971 | 7 | 57.1% | -2.013 | -0.23 |
| [[ODFL]] | LONG | 34 | 55.9% | 0.761 | 7 | 42.9% | -2.651 | -0.34 |
| [[QCOM]] | SHORT | 39 | 48.7% | -0.968 | 8 | 37.5% | -3.319 | -0.80 |
| [[GD]] | SHORT | 33 | 48.5% | 0.448 | 7 | 14.3% | -3.379 | -1.33 |
| [[HUM]] | SHORT | 40 | 42.5% | -0.754 | 8 | 37.5% | -4.012 | -0.31 |
| [[SOFI]] | LONG | 42 | 31.0% | -2.137 | 8 | 37.5% | -6.276 | -0.67 |

## Wide-Stop — 60% ATR Stop

_Stop at 60% ATR. Income (50%) at 2R, edge (50%) at close._

**All gap-aligned days**: 753 trades | Win%: 45.9% | AvgR: 0.008 | TotalR: 5.95
**Top 20% gaps (strongest quintile)**: 151 trades | Win%: 45.7% | AvgR: -0.011 | TotalR: -1.60

| Symbol | Dir | N(all) | Win%(all) | AvgR(all) | N(top20%) | Win%(top) | AvgR(top) | Sharpe(top) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[HLT]] | LONG | 32 | 62.5% | 0.201 | 6 | 100.0% | 0.853 | 1.24 |
| [[HOOD]] | LONG | 35 | 45.7% | -0.097 | 7 | 85.7% | 0.672 | 0.78 |
| [[TER]] | LONG | 45 | 57.8% | 0.214 | 9 | 77.8% | 0.636 | 0.58 |
| [[TW]] | SHORT | 32 | 56.3% | 0.175 | 6 | 66.7% | 0.454 | 0.49 |
| [[IAU]] | SHORT | 32 | 56.3% | 0.191 | 6 | 66.7% | 0.267 | 0.22 |
| [[GEHC]] | LONG | 28 | 39.3% | -0.097 | 6 | 66.7% | 0.238 | 0.52 |
| [[IWR]] | LONG | 38 | 42.1% | 0.027 | 8 | 37.5% | 0.169 | 0.17 |
| [[BIIB]] | SHORT | 48 | 52.1% | 0.075 | 10 | 60.0% | 0.072 | 0.09 |
| [[FTAI]] | LONG | 41 | 46.3% | 0.157 | 8 | 50.0% | 0.013 | 0.01 |
| [[MA]] | SHORT | 46 | 45.7% | 0.031 | 9 | 22.2% | 0.007 | 0.01 |
| [[ODFL]] | LONG | 34 | 55.9% | 0.255 | 7 | 42.9% | -0.092 | -0.17 |
| [[CNC]] | SHORT | 36 | 41.7% | -0.070 | 7 | 14.3% | -0.144 | -0.08 |
| [[SBUX]] | SHORT | 40 | 47.5% | -0.022 | 8 | 37.5% | -0.153 | -0.14 |
| [[HUM]] | SHORT | 40 | 40.0% | -0.051 | 8 | 37.5% | -0.162 | -0.15 |
| [[VRSK]] | LONG | 34 | 38.2% | -0.256 | 7 | 42.9% | -0.171 | -0.20 |
| [[V]] | SHORT | 45 | 40.0% | 0.056 | 9 | 22.2% | -0.271 | -0.27 |
| [[SOFI]] | LONG | 42 | 28.6% | -0.279 | 8 | 37.5% | -0.373 | -0.54 |
| [[QCOM]] | SHORT | 39 | 48.7% | -0.131 | 8 | 37.5% | -0.463 | -0.84 |
| [[VTR]] | LONG | 33 | 30.3% | -0.234 | 7 | 14.3% | -0.759 | -1.82 |
| [[GD]] | SHORT | 33 | 45.5% | -0.021 | 7 | 14.3% | -0.761 | -1.91 |

## How to Read

- **Close-Only Win% (all)**: raw directional accuracy of gap-aligned days. ~50% = random; >55% = meaningful edge.
- **Close-Only Win% (top quintile)**: do the biggest gaps have better directional follow-through? This is the key question.
- **Wide-Stop AvgR (top quintile)**: if strong-gap days also survive a realistic stop, real edge is present.
- **If top-quintile outperforms all-days**: gap magnitude is a valid quality proxy — larger gaps produce cleaner trends.
- **If top-quintile ≈ all-days**: gap size alone is not the differentiator; quality filters (VWAP, entropy, range) matter more.
- Top-quintile threshold is computed per-symbol from its own historical gap distribution — not a global threshold.
- EOD proxy — intraday fill quality, exact OR level entries, and stop execution not modeled.
- Run `node run.mjs pull signal-tracker --log` today, then `signal-tracker` after close to track live results.
