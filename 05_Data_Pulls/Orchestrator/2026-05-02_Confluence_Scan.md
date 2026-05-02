---
title: "Confluence Scan 2026-05-02"
type: "orchestrator_output"
source: "Vault Orchestrator"
date_pulled: "2026-05-02"
domain: "orchestrator"
data_type: "confluence_scan"
frequency: "weekly"
signal_status: "watch"
signals: ["confluence-watchlist"]
regime_label: "Risk-On Trend"
regime_confidence: 2
setup_count: 12
approved_count: 0
watchlist_count: 12
rejected_count: 0
agent_owner: "orchestrator"
handoff_to: ["orchestrator"]
tags: ["confluence", "signals", "orchestrator"]
---

## Regime: Risk-On Trend (confidence 2/3)

*macro-vol stress 7% (low)*
> Stress: **low** (7%) | COT: **clear** | Crowding: **clear**

## Summary - 12 setups | 0 approved | 12 watchlist | 0 rejected

| Setup | Domain | Strategy | Score | Tier | Disposition |
| --- | --- | --- | --- | --- | --- |
| Pair Metrics | Market | pairs | 15/30 | watchlist | watchlist |
| NAHB Builder Confidence | Housing | trend | 15/30 | watchlist | watchlist |
| FRED Liquidity Pull | Macro | structural-flow | 15/30 | watchlist | watchlist |
| FEMA Disaster Declarations — Recent | Government | structural-flow | 15/30 | watchlist | watchlist |
| EIA Generation Mix Pull | Energy | trend | 15/30 | watchlist | watchlist |
| Dilution Alert — XOM | Signals | value-quality | 15/30 | watchlist | watchlist |
| Dilution Alert — RCAT | Signals | value-quality | 15/30 | watchlist | watchlist |
| Dilution Alert — NRG | Signals | value-quality | 15/30 | watchlist | watchlist |
| Dilution Alert — NOC | Signals | value-quality | 15/30 | watchlist | watchlist |
| Dilution Monitor | Fundamentals | value-quality | 15/30 | watchlist | watchlist |
| Dilution Alert — LMT | Signals | value-quality | 15/30 | watchlist | watchlist |
| Dilution Alert — LHX | Signals | value-quality | 15/30 | watchlist | watchlist |

## Marker Grid

| Setup | Reg | Mac | Sig | Fund | Auc | Vol | Liq | Opts | Crowd | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Pair Metrics | WATCH(2) | PASS(3) | WATCH(2) | WATCH(1) | WATCH(1) | WATCH(1) | WATCH(1) | MISSING | PASS(3) | WATCH(1) |
| NAHB Builder Confidence | PASS(3) | PASS(3) | WATCH(2) | WATCH(1) | FAIL(0) | WATCH(1) | WATCH(1) | MISSING | PASS(3) | WATCH(1) |
| FRED Liquidity Pull | WATCH(2) | PASS(3) | WATCH(2) | WATCH(2) | FAIL(0) | WATCH(1) | WATCH(1) | MISSING | PASS(3) | WATCH(1) |
| FEMA Disaster Declarations — Recent | WATCH(2) | PASS(3) | WATCH(2) | WATCH(2) | FAIL(0) | WATCH(1) | WATCH(1) | MISSING | PASS(3) | WATCH(1) |
| EIA Generation Mix Pull | PASS(3) | PASS(3) | WATCH(2) | WATCH(1) | FAIL(0) | WATCH(1) | WATCH(1) | MISSING | PASS(3) | WATCH(1) |
| Dilution Alert — XOM | WATCH(2) | PASS(3) | WATCH(2) | WATCH(2) | FAIL(0) | WATCH(1) | WATCH(1) | MISSING | PASS(3) | WATCH(1) |
| Dilution Alert — RCAT | WATCH(2) | PASS(3) | WATCH(2) | WATCH(2) | FAIL(0) | WATCH(1) | WATCH(1) | MISSING | PASS(3) | WATCH(1) |
| Dilution Alert — NRG | WATCH(2) | PASS(3) | WATCH(2) | WATCH(2) | FAIL(0) | WATCH(1) | WATCH(1) | MISSING | PASS(3) | WATCH(1) |
| Dilution Alert — NOC | WATCH(2) | PASS(3) | WATCH(2) | WATCH(2) | FAIL(0) | WATCH(1) | WATCH(1) | MISSING | PASS(3) | WATCH(1) |
| Dilution Monitor | WATCH(2) | PASS(3) | WATCH(2) | WATCH(2) | FAIL(0) | WATCH(1) | WATCH(1) | MISSING | PASS(3) | WATCH(1) |
| Dilution Alert — LMT | WATCH(2) | PASS(3) | WATCH(2) | WATCH(2) | FAIL(0) | WATCH(1) | WATCH(1) | MISSING | PASS(3) | WATCH(1) |
| Dilution Alert — LHX | WATCH(2) | PASS(3) | WATCH(2) | WATCH(2) | FAIL(0) | WATCH(1) | WATCH(1) | MISSING | PASS(3) | WATCH(1) |

## Setup Detail (Score >= 13 / Disposition: watchlist or approved)

### Pair Metrics — 15/30 (watchlist)
*Domain: Market · Strategy: pairs · Edge: statistical / relative value · Signal: alert*

- **regime**: WATCH (2/3) — Risk-On Trend × pairs
- **macro**: PASS (3/3) — low stress (7%)
- **strategy**: WATCH (2/3) — alert / MED
- **fundamental**: WATCH (1/3) — domain: Market, freshness: Fresh
- **auction**: WATCH (1/3) — module: active
- **volume**: WATCH (1/3) — confidence 50%
- **liquidity**: WATCH (1/3) — Manual Fidelity review required for execution
- **options**: MISSING (0/3) — TBD — no options chain data source. Manual Fidelity review required.
- **crowding**: PASS (3/3) — crowding: clear
- **risk**: WATCH (1/3) — Invalidation defined

**Vetoes:** No corroborating module coverage - watchlist only until another marker confirms

---

### NAHB Builder Confidence — 15/30 (watchlist)
*Domain: Housing · Strategy: trend · Edge: review required · Signal: alert*

- **regime**: PASS (3/3) — Risk-On Trend × trend
- **macro**: PASS (3/3) — low stress (7%)
- **strategy**: WATCH (2/3) — alert / MED
- **fundamental**: WATCH (1/3) — domain: Housing, freshness: Fresh
- **auction**: FAIL (0/3) — module: active
- **volume**: WATCH (1/3) — confidence 50%
- **liquidity**: WATCH (1/3) — Manual Fidelity review required for execution
- **options**: MISSING (0/3) — TBD — no options chain data source. Manual Fidelity review required.
- **crowding**: PASS (3/3) — crowding: clear
- **risk**: WATCH (1/3) — Invalidation defined

**Vetoes:** No corroborating module coverage - watchlist only until another marker confirms

---

### FRED Liquidity Pull — 15/30 (watchlist)
*Domain: Macro · Strategy: structural-flow · Edge: macro-volatility / structural · Signal: alert*

- **regime**: WATCH (2/3) — Risk-On Trend × structural-flow
- **macro**: PASS (3/3) — low stress (7%)
- **strategy**: WATCH (2/3) — alert / MED
- **fundamental**: WATCH (2/3) — domain: Macro, freshness: Fresh
- **auction**: FAIL (0/3) — module: active
- **volume**: WATCH (1/3) — confidence 50%
- **liquidity**: WATCH (1/3) — Manual Fidelity review required for execution
- **options**: MISSING (0/3) — TBD — no options chain data source. Manual Fidelity review required.
- **crowding**: PASS (3/3) — crowding: clear
- **risk**: WATCH (1/3) — Invalidation defined

**Vetoes:** No corroborating module coverage - watchlist only until another marker confirms

---

### FEMA Disaster Declarations — Recent — 15/30 (watchlist)
*Domain: Government · Strategy: structural-flow · Edge: macro-volatility / structural · Signal: alert*

- **regime**: WATCH (2/3) — Risk-On Trend × structural-flow
- **macro**: PASS (3/3) — low stress (7%)
- **strategy**: WATCH (2/3) — alert / MED
- **fundamental**: WATCH (2/3) — domain: Government, freshness: Fresh
- **auction**: FAIL (0/3) — module: active
- **volume**: WATCH (1/3) — confidence 50%
- **liquidity**: WATCH (1/3) — Manual Fidelity review required for execution
- **options**: MISSING (0/3) — TBD — no options chain data source. Manual Fidelity review required.
- **crowding**: PASS (3/3) — crowding: clear
- **risk**: WATCH (1/3) — Invalidation defined

**Vetoes:** No corroborating module coverage - watchlist only until another marker confirms

---

### EIA Generation Mix Pull — 15/30 (watchlist)
*Domain: Energy · Strategy: trend · Edge: review required · Signal: alert*

- **regime**: PASS (3/3) — Risk-On Trend × trend
- **macro**: PASS (3/3) — low stress (7%)
- **strategy**: WATCH (2/3) — alert / MED
- **fundamental**: WATCH (1/3) — domain: Energy, freshness: Fresh
- **auction**: FAIL (0/3) — module: active
- **volume**: WATCH (1/3) — confidence 50%
- **liquidity**: WATCH (1/3) — Manual Fidelity review required for execution
- **options**: MISSING (0/3) — TBD — no options chain data source. Manual Fidelity review required.
- **crowding**: PASS (3/3) — crowding: clear
- **risk**: WATCH (1/3) — Invalidation defined

**Vetoes:** No corroborating module coverage - watchlist only until another marker confirms

---

### Dilution Alert — XOM — 15/30 (watchlist)
*Domain: Signals · Strategy: value-quality · Edge: fundamental quality · Signal: alert*

- **regime**: WATCH (2/3) — Risk-On Trend × value-quality
- **macro**: PASS (3/3) — low stress (7%)
- **strategy**: WATCH (2/3) — alert / MED
- **fundamental**: WATCH (2/3) — domain: Signals, freshness: Fresh
- **auction**: FAIL (0/3) — module: active
- **volume**: WATCH (1/3) — confidence 50%
- **liquidity**: WATCH (1/3) — Manual Fidelity review required for execution
- **options**: MISSING (0/3) — TBD — no options chain data source. Manual Fidelity review required.
- **crowding**: PASS (3/3) — crowding: clear
- **risk**: WATCH (1/3) — Invalidation defined

**Vetoes:** No corroborating module coverage - watchlist only until another marker confirms

---

### Dilution Alert — RCAT — 15/30 (watchlist)
*Domain: Signals · Strategy: value-quality · Edge: fundamental quality · Signal: alert*

- **regime**: WATCH (2/3) — Risk-On Trend × value-quality
- **macro**: PASS (3/3) — low stress (7%)
- **strategy**: WATCH (2/3) — alert / MED
- **fundamental**: WATCH (2/3) — domain: Signals, freshness: Fresh
- **auction**: FAIL (0/3) — module: active
- **volume**: WATCH (1/3) — confidence 50%
- **liquidity**: WATCH (1/3) — Manual Fidelity review required for execution
- **options**: MISSING (0/3) — TBD — no options chain data source. Manual Fidelity review required.
- **crowding**: PASS (3/3) — crowding: clear
- **risk**: WATCH (1/3) — Invalidation defined

**Vetoes:** No corroborating module coverage - watchlist only until another marker confirms

---

### Dilution Alert — NRG — 15/30 (watchlist)
*Domain: Signals · Strategy: value-quality · Edge: fundamental quality · Signal: alert*

- **regime**: WATCH (2/3) — Risk-On Trend × value-quality
- **macro**: PASS (3/3) — low stress (7%)
- **strategy**: WATCH (2/3) — alert / MED
- **fundamental**: WATCH (2/3) — domain: Signals, freshness: Fresh
- **auction**: FAIL (0/3) — module: active
- **volume**: WATCH (1/3) — confidence 50%
- **liquidity**: WATCH (1/3) — Manual Fidelity review required for execution
- **options**: MISSING (0/3) — TBD — no options chain data source. Manual Fidelity review required.
- **crowding**: PASS (3/3) — crowding: clear
- **risk**: WATCH (1/3) — Invalidation defined

**Vetoes:** No corroborating module coverage - watchlist only until another marker confirms

---

### Dilution Alert — NOC — 15/30 (watchlist)
*Domain: Signals · Strategy: value-quality · Edge: fundamental quality · Signal: alert*

- **regime**: WATCH (2/3) — Risk-On Trend × value-quality
- **macro**: PASS (3/3) — low stress (7%)
- **strategy**: WATCH (2/3) — alert / MED
- **fundamental**: WATCH (2/3) — domain: Signals, freshness: Fresh
- **auction**: FAIL (0/3) — module: active
- **volume**: WATCH (1/3) — confidence 50%
- **liquidity**: WATCH (1/3) — Manual Fidelity review required for execution
- **options**: MISSING (0/3) — TBD — no options chain data source. Manual Fidelity review required.
- **crowding**: PASS (3/3) — crowding: clear
- **risk**: WATCH (1/3) — Invalidation defined

**Vetoes:** No corroborating module coverage - watchlist only until another marker confirms

---

### Dilution Monitor — 15/30 (watchlist)
*Domain: Fundamentals · Strategy: value-quality · Edge: fundamental quality · Signal: alert*

- **regime**: WATCH (2/3) — Risk-On Trend × value-quality
- **macro**: PASS (3/3) — low stress (7%)
- **strategy**: WATCH (2/3) — alert / MED
- **fundamental**: WATCH (2/3) — domain: Fundamentals, freshness: Fresh
- **auction**: FAIL (0/3) — module: active
- **volume**: WATCH (1/3) — confidence 50%
- **liquidity**: WATCH (1/3) — Manual Fidelity review required for execution
- **options**: MISSING (0/3) — TBD — no options chain data source. Manual Fidelity review required.
- **crowding**: PASS (3/3) — crowding: clear
- **risk**: WATCH (1/3) — Invalidation defined

**Vetoes:** No corroborating module coverage - watchlist only until another marker confirms

---

### Dilution Alert — LMT — 15/30 (watchlist)
*Domain: Signals · Strategy: value-quality · Edge: fundamental quality · Signal: alert*

- **regime**: WATCH (2/3) — Risk-On Trend × value-quality
- **macro**: PASS (3/3) — low stress (7%)
- **strategy**: WATCH (2/3) — alert / MED
- **fundamental**: WATCH (2/3) — domain: Signals, freshness: Fresh
- **auction**: FAIL (0/3) — module: active
- **volume**: WATCH (1/3) — confidence 50%
- **liquidity**: WATCH (1/3) — Manual Fidelity review required for execution
- **options**: MISSING (0/3) — TBD — no options chain data source. Manual Fidelity review required.
- **crowding**: PASS (3/3) — crowding: clear
- **risk**: WATCH (1/3) — Invalidation defined

**Vetoes:** No corroborating module coverage - watchlist only until another marker confirms

---

### Dilution Alert — LHX — 15/30 (watchlist)
*Domain: Signals · Strategy: value-quality · Edge: fundamental quality · Signal: alert*

- **regime**: WATCH (2/3) — Risk-On Trend × value-quality
- **macro**: PASS (3/3) — low stress (7%)
- **strategy**: WATCH (2/3) — alert / MED
- **fundamental**: WATCH (2/3) — domain: Signals, freshness: Fresh
- **auction**: FAIL (0/3) — module: active
- **volume**: WATCH (1/3) — confidence 50%
- **liquidity**: WATCH (1/3) — Manual Fidelity review required for execution
- **options**: MISSING (0/3) — TBD — no options chain data source. Manual Fidelity review required.
- **crowding**: PASS (3/3) — crowding: clear
- **risk**: WATCH (1/3) — Invalidation defined

**Vetoes:** No corroborating module coverage - watchlist only until another marker confirms
