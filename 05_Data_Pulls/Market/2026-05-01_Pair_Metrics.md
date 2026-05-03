---
title: "Pair Metrics"
source: "Vault Orchestrator"
date_pulled: "2026-05-01"
domain: "market"
data_type: "pair_metrics"
frequency: "daily"
pairs_scanned: 17
pairs_computed: 17
broken_count: 4
stretched_count: 2
signal_status: "alert"
signals: ["pair-breakdown", "pair-stretch"]
tags: ["pairs", "spread", "z-score", "correlation", "market-microstructure"]
signal_state: new
---

## Operating Rule

> Pair metrics show relative-value spread opportunities between historically correlated instruments.
> Z-score > ±2.0 on a 60-day window indicates a stretched spread. Z > ±3.0 or correlation breakdown = broken.
> Half-life is the expected mean-reversion time in days. Short half-life = faster convergence expected.
> All entries require manual verification of entry timing, sizing, and macro context.

## All Pair Metrics

| Pair | ID | Status | Z-Score(60d) | Corr(120d) | Half-Life | Signal |
| --- | --- | --- | --- | --- | --- | --- |
| SPY/QQQ | SPY_QQQ | stretched | -2.54 | 0.94 | 19d | WATCH |
| SPY/IWM | SPY_IWM | stable | -1.04 | 0.79 | 21d | NEUTRAL |
| QQQ/IWM | QQQ_IWM | stable | 1.55 | 0.67 | 15d | NEUTRAL |
| XLY/XLP | XLY_XLP | broken | 1.14 | -0.16 | 20d | ALERT |
| XLE/XLK | XLE_XLK | broken | -1.19 | -0.17 | 31d | ALERT |
| XLF/KRE | XLF_KRE | broken | -0.56 | 0.26 | 30d | ALERT |
| XLU/XLK | XLU_XLK | broken | -1.89 | -0.14 | 18d | ALERT |
| HYG/LQD | HYG_LQD | stable | 1.81 | 0.82 | 9d | NEUTRAL |
| TLT/IEF | TLT_IEF | stable | -1.29 | 0.95 | 7d | NEUTRAL |
| GLD/SLV | GLD_SLV | stable | -0.51 | 0.85 | 15d | NEUTRAL |
| USO/XLE | USO_XLE | trending | 1.42 | 0.86 | — | NEUTRAL |
| KO/PEP | KO_PEP | stable | 1.31 | 0.92 | 5d | NEUTRAL |
| V/MA | V_MA | stretched | 4.88 | 0.96 | 15d | WATCH |
| HD/LOW | HD_LOW | stable | -0.26 | 0.85 | 12d | NEUTRAL |
| XOM/CVX | XOM_CVX | stable | -0.35 | 0.99 | 7d | NEUTRAL |
| JPM/BAC | JPM_BAC | stable | -0.36 | 0.95 | 4d | NEUTRAL |
| COST/WMT | COST_WMT | stable | -1.37 | 0.81 | 11d | NEUTRAL |

## Stretched / Broken Pairs (Sorted by |Z-Score|)

| Pair | ID | Status | Z-Score(60d) | Corr(120d) |
| --- | --- | --- | --- | --- |
| V/MA | V_MA | stretched | 4.88 | 0.96 |
| SPY/QQQ | SPY_QQQ | stretched | -2.54 | 0.94 |
| XLU/XLK | XLU_XLK | broken | -1.89 | -0.14 |
| XLE/XLK | XLE_XLK | broken | -1.19 | -0.17 |
| XLY/XLP | XLY_XLP | broken | 1.14 | -0.16 |
| XLF/KRE | XLF_KRE | broken | -0.56 | 0.26 |

## Status Guide

- **normal**: Z-score within ±1.0 and correlation intact. No spread signal.
- **stretched**: Z-score between ±1.0 and ±3.0. Mean-reversion candidate — size conservatively.
- **broken**: Z-score > ±3.0 or correlation < 0.4. Relationship may have structurally changed.
- **Corr(120d)**: Pearson correlation over the last 120 trading days.
- **Half-Life**: Ornstein-Uhlenbeck half-life estimate in days.
