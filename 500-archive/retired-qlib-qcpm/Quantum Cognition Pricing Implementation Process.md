---
title: Quantum Cognition Pricing Implementation Process
type: reference
tags: [reference, quant, qcpm, market-cognition, implementation]
last_updated: 2026-04-29
---

# Quantum Cognition Pricing Implementation Process

Source reviewed: `C:\Users\CaveUser\Downloads\ssrn-6219438.pdf`

Paper: "Quantum Cognition Pricing Theory" by Cheng Cheng, doctoral dissertation, Keimyung University, December 2025.

Related vault surfaces: [[Qlib Cheat Sheet]], [[Quantitative Signals]], [[Agent Layer Map]], [[Entropy Strategy Monitoring Cheat Sheet]]

## Executive Read

The paper proposes Quantum Cognition Pricing Theory (QCPT) and its first empirical implementation, the Quantum Cognition Pricing Model (QCPM). The usable core for this vault is not the philosophical claim that markets are quantum systems. The usable core is an interpretable 3-state behavioral pricing model:

1. Convert market stimuli into a perception score.
2. Convert perception into buy, sell, and hold probabilities.
3. Convert probabilities into a 3x3 cognitive density matrix.
4. Build a 3x3 price structure matrix from high, low, close, price volatility, and volume volatility.
5. Forecast next price with `forecast = trace(rho * H)`.
6. Track parameter drift as a market-cognition diagnostic.

The paper tests this on daily KOSPI 200 data from 2001-01-02 to 2025-10-02. It claims QCPM outperforms Random Walk, ARIMA, GARCH, SVM, XGBoost, and LSTM on RMSE, MAPE, R2, directional accuracy, and directional strategy return. Treat those claims as a research lead, not as live-trading evidence, until My_Data reproduces them on US symbols and thesis baskets.

## Critical Review

The model is attractive because it is structurally simple, interpretable, and compatible with the vault's existing FMP, Qlib, agent, and dashboard layers. It gives useful diagnostics even if the forecast edge proves weak: price-driven vs volume-driven cognition, equilibrium drift, cognitive compression, and state-transition intensity.

The main caution is that price-level forecasting can look impressive because price levels are highly autocorrelated. R2 and RMSE should be secondary. The real tests for My_Data are directional accuracy, forecast-gap calibration, drawdown-aware strategy return, stability across symbols, and whether the model adds information beyond previous close, overnight gap, technical indicators, and Qlib factors.

The implementation must avoid leakage. A paper-faithful next-open forecast may use day `t` high, low, close, and volume only after the day has closed. It must not be used intraday unless the price operator is rebuilt from intraday bars available at the decision time.

The density matrix in the paper effectively assumes zero phase and high coherence among buy, sell, and hold states. That is acceptable for a first implementation, but later versions should add a decoherence or phase-damping term so the off-diagonal entries do not overstate market coherence.

## Model Translation

Inputs per symbol:

| Field | Source |
| --- | --- |
| `open` | FMP daily historical OHLCV |
| `high` | FMP daily historical OHLCV |
| `low` | FMP daily historical OHLCV |
| `close` | FMP daily historical OHLCV |
| `volume` | FMP daily historical OHLCV |

Feature construction:

| Feature | Definition | Interpretation |
| --- | --- | --- |
| `price_vol_5` | stdev of log close returns over 5 bars | short-term price excitement |
| `price_vol_20` | stdev of log close returns over 20 bars | medium-term price baseline |
| `volume_vol_5` | stdev of log volume changes over 5 bars | short-term participation tension |
| `volume_vol_20` | stdev of log volume changes over 20 bars | medium-term participation baseline |
| `eta_price` | `price_vol_5 / price_vol_20` | price stimulus |
| `eta_volume` | `volume_vol_5 / volume_vol_20` | volume stimulus |

Perception function:

```text
f_t = A * ln(eta_price) + B * ln(eta_volume)
```

Behavior probabilities:

```text
Z = exp(f_t) + exp(-f_t) + 1
p_buy = exp(f_t) / Z
p_sell = exp(-f_t) / Z
p_hold = 1 / Z
```

Cognitive density matrix:

```text
psi = [sqrt(p_buy), sqrt(p_sell), sqrt(p_hold)]
rho = outer(psi, psi)
```

Price structure matrix:

```text
diag(H) = [high_t, low_t, close_t]
H[i,j] = eta_price * ln(1 + abs(P_i - P_j) ** eta_volume), i != j
```

Forecast:

```text
predicted_open_t_plus_1 = trace(rho_t * H_t)
```

## Implementation Process

### Phase 0 - Research Capture

Status: this note is the capture artifact.

Actions:

1. Keep the paper as a reviewed research source, not a live signal source.
2. Add this model to the quant research backlog as `QCPM`.
3. Classify the first implementation as `research_diagnostic` until walk-forward validation passes.

### Phase 1 - Paper-Faithful Prototype

Target files:

| Path | Purpose |
| --- | --- |
| `scripts/qlib/qcpm.py` | Pure Python QCPM math, training, prediction, metrics |
| `scripts/qlib/tests/test_qcpm.py` | Matrix invariants and leakage-safe alignment tests |
| `scripts/qlib/cli.py` | Add `qcpm` subcommand behind `node run.mjs quant qcpm` |

Prototype command:

```powershell
node run.mjs quant qcpm --symbol SPY --start 2016-01-01 --end 2026-04-29 --horizon 1
```

Acceptance tests:

1. Probabilities sum to 1 for every row.
2. `rho` is 3x3, symmetric, positive semidefinite, and `trace(rho) = 1`.
3. `H` is 3x3 and symmetric.
4. Forecast row `t` only uses OHLCV data available through row `t`.
5. No NaN, infinity, or negative-volume rows enter optimization.

### Phase 2 - FMP Data Bridge

Preferred data source: existing `scripts/lib/fmp-client.mjs` `fetchDailyPrices()`.

Implementation options:

1. Node wrapper fetches FMP OHLCV and passes CSV/JSON to Python.
2. Python reads a cached OHLCV file written by the wrapper.
3. Later, move the QCPM math to Node only if dashboard latency matters.

Keep FMP as the canonical market-data source because FMP Premium is already the active financial-data backbone.

Implemented first bridge command:

```powershell
node run.mjs pull qcpm-confluence --symbols QCOM,UPS,NUE,CDNS,BRO --from 2024-01-01 --to 2026-04-29
```

Current bridge flow:

```text
FMP daily OHLCV -> CSV cache -> scripts/qlib/cli.py qcpm --json-out -> confluence report
```

### Phase 3 - Report Writer

Write reports to:

```text
05_Data_Pulls/Quant/YYYY-MM-DD_QCPM_<SYMBOL>.md
```

Frontmatter:

```yaml
title: "QCPM Report - SPY (2026-04-29)"
source: "QCPM / FMP"
date_pulled: "2026-04-29"
domain: "quant"
data_type: "qcpm_report"
frequency: "on-demand"
signal_status: "clear"
signals: []
tags: ["qcpm", "quant", "market-cognition", "spy"]
symbol: "SPY"
model_version: 1
forecast_horizon: 1
training_window: 20
predicted_open: 0
latest_close: 0
forecast_gap_pct: 0
directional_accuracy: 0
rmse: 0
mape: 0
qcpm_a: 0
qcpm_b: 0
qcpm_regime: "unknown"
cognitive_equilibrium_distance: 0
```

Report sections:

1. Forecast Summary
2. Validation Metrics
3. Cognitive Parameters
4. State Probabilities
5. Matrix Diagnostics
6. Baseline Comparison
7. Operator Notes

The FMP bridge also writes a combined strategy report:

```text
05_Data_Pulls/Quant/YYYY-MM-DD_QCPM_Confluence_<SYMBOLS>.md
```

This report combines QCPM, FMP technicals, entropy, and ORB into a 100-point confluence score:

| Layer | Weight | Role |
| --- | --- | --- |
| QCPM | 35 | Behavioral confirmation and contradiction filter |
| ORB | 25 | Intraday execution quality |
| FMP technicals | 20 | Trend, RSI, and moving-average state |
| Entropy | 20 | Clarity and magnitude throttle |

QCPM contradiction rules now cap the trade class. If ORB is long but QCPM state and forecast gap are hard short, the setup is capped at `watch` even if ORB and FMP are strong.

### Phase 4 - Validation Harness

Benchmarks:

| Benchmark | Why |
| --- | --- |
| Previous close | Hard naive baseline for next-open level |
| Previous open | Overnight gap sanity check |
| Random walk | Paper benchmark |
| Technical-only score | Existing vault comparison |
| Qlib factor signal | Existing quant comparison |
| XGBoost or Ridge baseline | Simple nonlinear/statistical comparison |

Validation metrics:

1. RMSE and MAPE for continuity with the paper.
2. Directional accuracy using `sign(predicted_open_t+1 - close_t)`.
3. Strategy return after a conservative transaction-cost haircut.
4. Hit rate by volatility regime.
5. Forecast-gap calibration: bucket predicted gaps and compare realized gaps.
6. Stability of `A` and `B` over rolling windows.
7. Incremental lift over Qlib and technical indicators.

Promotion rule:

QCPM remains diagnostic unless it beats previous-close and technical-only baselines on directional accuracy and drawdown-adjusted strategy return across at least SPY, QQQ, IWM, and three thesis baskets.

### Phase 5 - Dashboard Integration

Update [[Quantitative Signals]] with a QCPM block:

```dataview
TABLE
  symbol AS "Symbol",
  signal_status AS "Signal",
  predicted_open AS "Pred. Open",
  forecast_gap_pct AS "Gap %",
  directional_accuracy AS "DA",
  qcpm_regime AS "Regime",
  cognitive_equilibrium_distance AS "Eq. Dist.",
  date_pulled AS "Date",
  file.link AS "Report"
FROM "05_Data_Pulls/Quant"
WHERE data_type = "qcpm_report"
SORT date_pulled DESC, abs(forecast_gap_pct) DESC
```

Optional dashboard fields:

| Field | Meaning |
| --- | --- |
| `qcpm_regime` | `price-driven`, `volume-driven`, `balanced`, or `unstable` |
| `qcpm_state_bias` | dominant buy/sell/hold probability |
| `qcpm_spectrum_width` | max eigenvalue minus min eigenvalue of `H` |
| `qcpm_rho_concentration` | largest eigenvalue of `rho` |
| `qcpm_alignment` | overlap between dominant `rho` eigenvector and dominant `H` eigenvector |

### Phase 6 - Thesis Integration

Do not update thesis conviction directly in the first release.

After validation, add optional thesis fields:

```yaml
qcpm_last_run: "2026-04-29"
qcpm_signal_status: "clear"
qcpm_avg_forecast_gap_pct: 0
qcpm_price_driven_count: 0
qcpm_volume_driven_count: 0
qcpm_unstable_count: 0
qcpm_best_symbol: ""
qcpm_worst_symbol: ""
```

Use in thesis reports as a tactical overlay:

1. `thesis full-picture` reads latest QCPM reports for symbols in `core_entities`.
2. QCPM can confirm or challenge FMP technical state.
3. QCPM can flag cognitive instability before a catalyst review.
4. QCPM never overrides structural thesis conviction by itself.

### Phase 7 - Daily And Weekly Cadence

Daily candidate:

```powershell
node run.mjs pull qcpm-confluence --symbols SPY,QQQ,IWM --from 2024-01-01
```

Weekly candidate:

```powershell
node run.mjs pull qcpm-confluence --symbols QCOM,UPS,NUE,CDNS,BRO --from 2024-01-01
```

Add to `daily-routine.ps1` only after Phase 4 passes. Until then, keep it on-demand or weekly research-only.

## Signal Policy

Initial severity rules:

| Severity | Rule |
| --- | --- |
| `clear` | Forecast gap is small or model validation is weak. |
| `watch` | Absolute forecast gap is notable and model diagnostics are clean. |
| `alert` | Forecast gap is notable, cognitive equilibrium distance is elevated, and technical/FMP state agrees. |
| `critical` | Reserved for later. Requires validated live track record plus cross-agent confirmation. |

Suggested first thresholds:

```text
watch: abs(forecast_gap_pct) >= 0.75 and validation_da >= 52
alert: abs(forecast_gap_pct) >= 1.25 and validation_da >= 54 and equilibrium_distance_z >= 2
critical: disabled until live validation exists
```

## Risk Controls

1. No investment action should rely on QCPM alone.
2. Require comparison against naive previous-close and technical baselines.
3. Track results out-of-sample before promoting to dashboards or thesis fields.
4. Watch for false confidence from price-level R2.
5. Store model version in every report.
6. Freeze a validation window before tuning thresholds.
7. Keep forecast target explicit: next open, next close, or return.

## Future Extensions

1. Add decoherence: damp off-diagonal `rho` terms during high-noise regimes.
2. Add intraday QCPM using 1-minute FMP bars for SPY/QQQ only.
3. Use agent verdicts as additional cognitive basis states.
4. Compare QCPM cognitive compression with the existing entropy monitor.
5. Run basket-level cognitive equilibrium analysis for thesis watchlists.
6. Add a `qcpm` panel to the local dashboard after the report schema stabilizes.

## Implementation Checklist

- [x] Build `scripts/qlib/qcpm.py` pure functions.
- [x] Add unit tests for probability, matrix, and leakage invariants.
- [x] Add CLI route through `node run.mjs quant qcpm`.
- [x] Write `qcpm_report` notes to `05_Data_Pulls/Quant/`.
- [x] Fetch OHLCV through FMP daily historical data.
- [x] Add `pull qcpm-confluence` for QCPM + FMP + entropy + ORB scoring.
- [ ] Add QCPM block to [[Quantitative Signals]].
- [ ] Backtest against naive and technical baselines.
- [ ] Run SPY, QQQ, IWM, and thesis-basket validation.
- [ ] Decide whether QCPM becomes daily, weekly, or on-demand only.

## Implementation Log

2026-04-29:

- Added `scripts/qlib/qcpm.py` with the QCPM feature builder, Softmax state probabilities, density matrix, price operator, leakage-safe rolling parameter fit, diagnostics, signal policy, and report writer.
- Added `node run.mjs quant qcpm` via the Python Qlib CLI.
- Added `scripts/qlib/tests/test_qcpm.py` for probability, matrix, forecast-trace, and walk-forward leakage invariants.
- Wrote first diagnostic report: `05_Data_Pulls/Quant/2026-04-29_QCPM_SPY.md`.
- Current data caveat: the local Qlib store used for the first SPY run ends at 2026-04-01. The FMP bridge is the next implementation step for current daily coverage.
- Added JSON output support to `scripts/qlib/cli.py qcpm` so Node pullers can consume structured QCPM results.
- Added `scripts/pullers/qcpm-confluence.mjs`, which fetches FMP daily OHLCV, runs QCPM through CSV, reads latest entropy/ORB notes, and writes a combined confluence report.
- Added `scripts/tests/qcpm-confluence.test.mjs` for symbol-table parsing, prime scoring, overextension caps, and hard QCPM/ORB contradiction caps.
- Wrote first confluence report: `05_Data_Pulls/Quant/2026-04-29_QCPM_Confluence_QCOM_UPS_NUE_CDNS_BRO.md`.
- First five-symbol run classified CDNS, BRO, NUE, and QCOM as tactical; UPS was capped to watch because QCPM contradicted the ORB long setup.
