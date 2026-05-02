---
title: "ORB EOD Proxy Backtest"
source: "FMP Historical OHLCV"
date_pulled: "2026-04-29"
domain: "backtest"
data_type: "orb_eod_backtest"
frequency: "on-demand"
signal_status: "clear"
signals: []
close_only_avg_r: "-0.191"
close_only_top_avg_r: "-0.411"
wide_stop_avg_r: "-0.019"
wide_stop_top_avg_r: "-0.061"
tags: ["backtest", "orb", "eod", "equities"]
---

## Parameters

- **Lookback**: 120 calendar days from 2025-12-05
- **Gap filter**: ≥ 0.1% open gap aligned with signal direction
- **Top-quintile**: strongest 20% of gap-aligned days by |gap%| per symbol
- **Close-Only R unit**: 10% ATR denominator (no stop applied)
- **Wide-Stop**: 60% ATR stop, 2R target, income/edge (50/50) exit split
- **ATR**: Wilder's EMA-14, no lookahead
- **Entry**: day open for both modes

## Close-Only — Direction Accuracy

_No stop or target. Cleanest test of directional signal quality._

**All gap-aligned days**: 690 trades | Win%: 48.8% | AvgR: -0.191 | TotalR: -131.64
**Top 20% gaps (strongest quintile)**: 140 trades | Win%: 47.1% | AvgR: -0.411 | TotalR: -57.60

| Symbol | Dir | N(all) | Win%(all) | AvgR(all) | N(top20%) | Win%(top) | AvgR(top) | Sharpe(top) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[CNC]] | LONG | 34 | 58.8% | 2.421 | 7 | 57.1% | 7.432 | 0.56 |
| [[PCAR]] | LONG | 28 | 46.4% | 0.059 | 6 | 83.3% | 3.974 | 0.78 |
| [[NUE]] | LONG | 42 | 57.1% | 1.507 | 8 | 75.0% | 3.629 | 0.54 |
| [[AIG]] | LONG | 25 | 64.0% | 0.641 | 5 | 60.0% | 3.461 | 0.60 |
| [[CDNS]] | SHORT | 41 | 53.7% | 1.085 | 8 | 62.5% | 3.072 | 0.39 |
| [[OMC]] | SHORT | 38 | 47.4% | 0.215 | 8 | 62.5% | 1.615 | 0.18 |
| [[AMAT]] | SHORT | 35 | 40.0% | -0.786 | 7 | 42.9% | 0.937 | 0.17 |
| [[UPS]] | LONG | 36 | 52.8% | 0.276 | 7 | 57.1% | 0.517 | 0.14 |
| [[KO]] | LONG | 31 | 51.6% | 0.082 | 6 | 50.0% | 0.223 | 0.04 |
| [[GM]] | SHORT | 39 | 56.4% | 1.235 | 8 | 37.5% | -0.852 | -0.17 |
| [[VTR]] | SHORT | 28 | 35.7% | -1.951 | 6 | 33.3% | -1.498 | -0.24 |
| [[FTAI]] | SHORT | 36 | 47.2% | -1.004 | 7 | 57.1% | -1.707 | -0.30 |
| [[YUM]] | LONG | 30 | 53.3% | -0.081 | 6 | 33.3% | -1.744 | -0.40 |
| [[GLW]] | SHORT | 34 | 47.1% | -0.535 | 7 | 42.9% | -1.856 | -0.28 |
| [[AMKR]] | SHORT | 39 | 43.6% | -1.912 | 8 | 50.0% | -2.166 | -0.26 |
| [[SBUX]] | LONG | 28 | 64.3% | 0.618 | 6 | 50.0% | -3.593 | -0.24 |
| [[SOXX]] | SHORT | 36 | 41.7% | -1.131 | 7 | 28.6% | -3.782 | -0.62 |
| [[QCOM]] | LONG | 33 | 42.4% | -0.940 | 7 | 14.3% | -3.879 | -0.55 |
| [[BRO]] | LONG | 34 | 41.2% | -1.404 | 7 | 14.3% | -3.925 | -0.86 |
| [[EXR]] | SHORT | 43 | 37.2% | -2.151 | 9 | 33.3% | -6.405 | -0.70 |

## Wide-Stop — 60% ATR Stop

_Stop at 60% ATR. Income (50%) at 2R, edge (50%) at close._

**All gap-aligned days**: 690 trades | Win%: 45.9% | AvgR: -0.019 | TotalR: -13.37
**Top 20% gaps (strongest quintile)**: 140 trades | Win%: 40.7% | AvgR: -0.061 | TotalR: -8.48

| Symbol | Dir | N(all) | Win%(all) | AvgR(all) | N(top20%) | Win%(top) | AvgR(top) | Sharpe(top) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [[CNC]] | LONG | 34 | 55.9% | 0.290 | 7 | 57.1% | 0.880 | 0.51 |
| [[PCAR]] | LONG | 28 | 46.4% | 0.186 | 6 | 83.3% | 0.630 | 0.81 |
| [[NUE]] | LONG | 42 | 54.8% | 0.179 | 8 | 62.5% | 0.381 | 0.38 |
| [[CDNS]] | SHORT | 41 | 48.8% | 0.057 | 8 | 50.0% | 0.286 | 0.21 |
| [[AIG]] | LONG | 25 | 60.0% | 0.104 | 5 | 40.0% | 0.280 | 0.25 |
| [[KO]] | LONG | 31 | 48.4% | -0.020 | 6 | 50.0% | 0.017 | 0.02 |
| [[AMKR]] | SHORT | 39 | 41.0% | -0.161 | 8 | 50.0% | 0.004 | 0.00 |
| [[UPS]] | LONG | 36 | 52.8% | 0.088 | 7 | 57.1% | -0.003 | -0.00 |
| [[GM]] | SHORT | 39 | 56.4% | 0.273 | 8 | 37.5% | -0.023 | -0.03 |
| [[OMC]] | SHORT | 38 | 42.1% | -0.035 | 8 | 37.5% | -0.030 | -0.02 |
| [[VTR]] | SHORT | 28 | 32.1% | -0.334 | 6 | 33.3% | -0.048 | -0.05 |
| [[FTAI]] | SHORT | 36 | 44.4% | -0.137 | 7 | 57.1% | -0.188 | -0.28 |
| [[AMAT]] | SHORT | 35 | 34.3% | -0.180 | 7 | 28.6% | -0.207 | -0.19 |
| [[GLW]] | SHORT | 34 | 41.2% | -0.134 | 7 | 28.6% | -0.337 | -0.32 |
| [[SBUX]] | LONG | 28 | 57.1% | 0.131 | 6 | 33.3% | -0.371 | -0.52 |
| [[YUM]] | LONG | 30 | 53.3% | -0.022 | 6 | 33.3% | -0.390 | -0.43 |
| [[EXR]] | SHORT | 43 | 34.9% | -0.237 | 9 | 33.3% | -0.423 | -0.74 |
| [[SOXX]] | SHORT | 36 | 41.7% | -0.111 | 7 | 28.6% | -0.451 | -0.63 |
| [[QCOM]] | LONG | 33 | 39.4% | -0.142 | 7 | 14.3% | -0.478 | -0.50 |
| [[BRO]] | LONG | 34 | 38.2% | -0.162 | 7 | 0.0% | -0.651 | -1.59 |

## How to Read

- **Close-Only Win% (all)**: raw directional accuracy of gap-aligned days. ~50% = random; >55% = meaningful edge.
- **Close-Only Win% (top quintile)**: do the biggest gaps have better directional follow-through? This is the key question.
- **Wide-Stop AvgR (top quintile)**: if strong-gap days also survive a realistic stop, real edge is present.
- **If top-quintile outperforms all-days**: gap magnitude is a valid quality proxy — larger gaps produce cleaner trends.
- **If top-quintile ≈ all-days**: gap size alone is not the differentiator; quality filters (VWAP, entropy, range) matter more.
- Top-quintile threshold is computed per-symbol from its own historical gap distribution — not a global threshold.
- EOD proxy — intraday fill quality, exact OR level entries, and stop execution not modeled.
- Run `node run.mjs pull signal-tracker --log` today, then `signal-tracker` after close to track live results.
