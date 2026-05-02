---
title: "Big Money vs Retail Positioning Report 2026-05-02"
source: "Vault Positioning Agent"
date_pulled: "2026-05-02"
domain: "positioning"
data_type: "positioning_report"
frequency: "weekly"
signal_status: "watch"
signals: ["XOM", "MSFT", "SPY", "QQQ", "NVDA"]
agent_owner: "positioning"
handoff_to: ["orchestrator"]
tags: ["positioning", "big-money-vs-retail", "institutional-flow", "retail-sentiment"]
---

## Executive Summary

- **Market Regime**: Macro low
- **Overall Confidence**: Medium
- **Top signal**: XOM scored 5 (Medium); Needs confirmation.
- **Source gaps**: No fresh FMP institutional ownership / 13F pull note found.; Retail flow uses social/news proxies; no dedicated retail order-flow feed configured.
- **Operating rule**: positioning is research context only; no broker-write action is generated.

## Top Divergence Signals

| Rank | Asset / Theme | Institutional Bias | Retail Bias | Score | Confidence | Strategy Role |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | XOM | accumulating | neglect | 5 | Medium | Accumulation Setup |
| 2 | MSFT | unknown | neglect | 4 | Medium | Watchlist Only |
| 3 | SPY | unknown | buying | 3 | Medium | Watchlist Only |
| 4 | QQQ | unknown | buying | 2 | Medium | Watchlist Only |
| 5 | NVDA | unknown | buying | 2 | Medium | Watchlist Only |

## Signal Deep Dives

### 1. XOM
**Signal Type:**  Accumulation Setup
**What big money appears to be doing:**  accumulating
**What retail appears to be doing:**  neglect
**Why this matters:**  Institutions buying / retail ignoring
**Evidence:**
- sector positioning proxy
- retail proxy
- [[2026-05-01_Macro_Volatility]]
- Commodity Ladder Strategy
**Score:**  5
**Confidence:**  Medium
**Risks and counterarguments:**
- 13F data is delayed and incomplete.
- Fund holdings do not reveal full hedging.
- Retail flow data is often estimated.
- Options flow does not always reveal buyer intent.
- Positioning is not the same thing as valuation.
**Action Classification:**
- Needs confirmation
**Monitoring Triggers:**
- XOM price/volume confirms the positioning read
- Retail sentiment changes from the current extreme
- Macro and options layers confirm rather than contradict

---

### 2. MSFT
**Signal Type:**  Watchlist Only
**What big money appears to be doing:**  unknown
**What retail appears to be doing:**  neglect
**Why this matters:**  No clear signal
**Evidence:**
- retail proxy
- [[2026-05-01_Macro_Volatility]]
- Cash-Flow Quality Giants
**Score:**  4
**Confidence:**  Medium
**Risks and counterarguments:**
- 13F data is delayed and incomplete.
- Fund holdings do not reveal full hedging.
- Retail flow data is often estimated.
- Options flow does not always reveal buyer intent.
- Positioning is not the same thing as valuation.
**Action Classification:**
- Watchlist only
**Monitoring Triggers:**
- MSFT price/volume confirms the positioning read
- Retail sentiment changes from the current extreme
- Macro and options layers confirm rather than contradict

---

### 3. SPY
**Signal Type:**  Watchlist Only
**What big money appears to be doing:**  unknown
**What retail appears to be doing:**  buying
**Why this matters:**  No clear signal
**Evidence:**
- retail proxy
- [[2026-05-01_Macro_Volatility]]
- [[2026-05-01_FMP_Technicals_SPY_daily]]
- SPY QQQ Entropy Expansion Monitor
**Score:**  3
**Confidence:**  Medium
**Risks and counterarguments:**
- 13F data is delayed and incomplete.
- Fund holdings do not reveal full hedging.
- Retail flow data is often estimated.
- Options flow does not always reveal buyer intent.
- Positioning is not the same thing as valuation.
**Action Classification:**
- Watchlist only
**Monitoring Triggers:**
- SPY price/volume confirms the positioning read
- Retail sentiment changes from the current extreme
- Macro and options layers confirm rather than contradict

---

### 4. QQQ
**Signal Type:**  Watchlist Only
**What big money appears to be doing:**  unknown
**What retail appears to be doing:**  buying
**Why this matters:**  No clear signal
**Evidence:**
- retail proxy
- [[2026-05-01_Macro_Volatility]]
- SPY QQQ Entropy Expansion Monitor
**Score:**  2
**Confidence:**  Medium
**Risks and counterarguments:**
- 13F data is delayed and incomplete.
- Fund holdings do not reveal full hedging.
- Retail flow data is often estimated.
- Options flow does not always reveal buyer intent.
- Positioning is not the same thing as valuation.
**Action Classification:**
- Watchlist only
**Monitoring Triggers:**
- QQQ price/volume confirms the positioning read
- Retail sentiment changes from the current extreme
- Macro and options layers confirm rather than contradict

---

### 5. NVDA
**Signal Type:**  Watchlist Only
**What big money appears to be doing:**  unknown
**What retail appears to be doing:**  buying
**Why this matters:**  No clear signal
**Evidence:**
- retail proxy
- [[2026-05-01_Macro_Volatility]]
- Cash-Flow Quality Giants
**Score:**  2
**Confidence:**  Medium
**Risks and counterarguments:**
- 13F data is delayed and incomplete.
- Fund holdings do not reveal full hedging.
- Retail flow data is often estimated.
- Options flow does not always reveal buyer intent.
- Positioning is not the same thing as valuation.
**Action Classification:**
- Watchlist only
**Monitoring Triggers:**
- NVDA price/volume confirms the positioning read
- Retail sentiment changes from the current extreme
- Macro and options layers confirm rather than contradict

## Vault Strategy Alignment

### XOM

**Matched Strategy:**  Commodity Ladder Strategy

**Why this signal belongs here:**  Institutions buying / retail ignoring

**Strategy role:**  Accumulation Setup

**Vault update needed:**  No

**Suggested vault note update:**  Add this positioning read as a confirmation/risk context item if it persists for another scan.

### MSFT

**Matched Strategy:**  Cash-Flow Quality Giants

**Why this signal belongs here:**  No clear signal

**Strategy role:**  Watchlist Only

**Vault update needed:**  No

**Suggested vault note update:**  Add this positioning read as a confirmation/risk context item if it persists for another scan.

### SPY

**Matched Strategy:**  SPY QQQ Entropy Expansion Monitor

**Why this signal belongs here:**  No clear signal

**Strategy role:**  Watchlist Only

**Vault update needed:**  No

**Suggested vault note update:**  Add this positioning read as a confirmation/risk context item if it persists for another scan.

### QQQ

**Matched Strategy:**  SPY QQQ Entropy Expansion Monitor

**Why this signal belongs here:**  No clear signal

**Strategy role:**  Watchlist Only

**Vault update needed:**  No

**Suggested vault note update:**  Add this positioning read as a confirmation/risk context item if it persists for another scan.

### NVDA

**Matched Strategy:**  Cash-Flow Quality Giants

**Why this signal belongs here:**  No clear signal

**Strategy role:**  Watchlist Only

**Vault update needed:**  No

**Suggested vault note update:**  Add this positioning read as a confirmation/risk context item if it persists for another scan.

## Source Gaps

- No fresh FMP institutional ownership / 13F pull note found.
- Retail flow uses social/news proxies; no dedicated retail order-flow feed configured.
- This is the first positioning report in the local sidecar history.

## Risk Notes

- 13F data is delayed and incomplete.
- Fund holdings do not reveal full hedging.
- Retail flow data is often estimated.
- Options flow does not always reveal buyer intent.
- Sovereign fund reporting is inconsistent.
- COT categories are useful but broad.
- Crowded trades can continue longer than expected.
- Contrarian signals require timing confirmation.
- Positioning is not the same thing as valuation.
- A good signal is not automatically a good trade.
