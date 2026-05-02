---
title: "Macro Volatility"
source: "Vault Orchestrator (synthesis)"
date_pulled: "2026-05-02"
domain: "macro"
agent_owner: "macro"
agent_scope: "macro"
data_type: "macro_volatility"
frequency: "daily"
lookback_days: 30
notes_scanned: 20
total_score: 2
max_score: 27
stress_pct: 7
stress_regime: "low"
signal_status: "clear"
signals: []
tags: ["macro-volatility", "stress", "credit", "rates", "vol", "regime"]
---

## Stress Regime Summary

**Composite Stress Score**: 2 / 27 (7%)
**Regime**: **LOW** — Risk-on. Credit and rates markets calm.

| Category | Weight | Notes | Stress% | Worst Status | Driving Note |
| --- | --- | --- | --- | --- | --- |
| credit stress | 3 | 2 | 0% | clear | FRED Credit Conditions Pull |
| rates stress | 2 | 3 | 0% | clear | FRED Interest Rates Pull |
| vol stress | 3 | 6 | 0% | clear | Macro Volatility |
| macro broad | 1 | 9 | 19% | alert | FRED Liquidity Pull |

## Source Notes

| Title | Category | Status | Date | Source |
| --- | --- | --- | --- | --- |
| FRED Liquidity Pull | macro broad | alert | 2026-05-01 | FRED API |
| FRED Liquidity Pull | macro broad | alert | 2026-05-02 | FRED API |
| Economic Calendar — FMP (2026-05-01 to 2026-05-31) | macro broad | watch | 2026-05-01 | Financial Modeling Prep |
| GDP Growth — BEA | macro broad | clear | 2026-05-01 | BEA API |
| COT Report | macro broad | clear | 2026-05-01 | CFTC Commitment of Traders |
| FRED Credit Conditions Pull | credit stress | clear | 2026-05-01 | FRED API |
| FRED Inflation Pull | macro broad | clear | 2026-05-01 | FRED API |
| FRED Interest Rates Pull | rates stress | clear | 2026-05-01 | FRED API |
| FRED Labor Market Pull | macro broad | clear | 2026-05-01 | FRED API |
| Macro Volatility | vol stress | clear | 2026-05-01 | Vault Orchestrator (synthesis) |
| Treasury Average Interest Rates | rates stress | clear | 2026-05-01 | Treasury Fiscal Data |
| FRED Credit Conditions Pull | credit stress | clear | 2026-05-02 | FRED API |
| FRED Inflation Pull | macro broad | clear | 2026-05-02 | FRED API |
| FRED Interest Rates Pull | rates stress | clear | 2026-05-02 | FRED API |
| FRED Labor Market Pull | macro broad | clear | 2026-05-02 | FRED API |
| Macro Volatility | vol stress | clear | 2026-05-02 | Vault Orchestrator (synthesis) |
| CBOE SKEW Index | vol stress | clear | 2026-05-01 | CBOE Public CSV |
| CBOE VIX Term Structure | vol stress | clear | 2026-05-01 | CBOE Public CSV |
| CBOE SKEW Index | vol stress | clear | 2026-05-02 | CBOE Public CSV |
| CBOE VIX Term Structure | vol stress | clear | 2026-05-02 | CBOE Public CSV |

## Regime Guide

- **low** (<25%): Credit spreads tight, yield curve normal, VIX low. Risk-on environment.
- **elevated** (25–50%): At least one stress category showing watch/alert. Monitor, don't oversize.
- **high** (50–75%): Multiple categories at alert. Reduce gross exposure; prioritize cash and hedges.
- **extreme** (>75%): Systemic stress across credit, rates, and vol simultaneously. Defensive posture.

> Stress score is computed as the weighted sum of signal scores (clear=0, watch=1, alert=2, critical=3)
> across all macro pull notes, divided by the maximum possible weighted score.
> Only notes pulled within the last 30 days are included.
