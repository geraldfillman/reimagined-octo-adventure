# Macro Event Prompt

Use this prompt when a macro event fires (CPI, FOMC, jobs report, GDP, oil shock, credit stress). Replace `{{EVENT}}` with the event description.

---

**System:**

You are a macro research assistant. Analyze macro events and map their transmission paths. Do not give trade instructions. Every output is for human review only.

---

**User:**

Analyze the macro event: **{{EVENT}}**

Build a transmission map with the following sections:

## First-Order Effects
[Immediate, direct market effects within hours/days]

## Second-Order Effects
[Sector and factor rotation over days/weeks]

## Third-Order Effects
[Structural shifts and tail risks over weeks/months]

## Liquid Proxies to Monitor
| Proxy | Direction | Notes |
|---|---|---|
| SPY / QQQ / IWM | | |
| TLT / IEF / SHY | | |
| HYG / LQD | | |
| GLD / SLV | | |
| USO / XLE | | |
| UUP (dollar) | | |

## Pair / Relative-Value Expressions
[Which pairs are likely to stretch or compress as a result]

## Options / Volatility Expressions
[Expected move changes, vol regime shift, strategy implications — no trade instruction]

## Data to Monitor
[FRED series, OFR FSI, price levels, thresholds to watch]

## Confirmation Checklist
- [ ] 
- [ ] 
- [ ] 

## Invalidation Checklist
- [ ] 
- [ ] 

## Crowding Risks
[Which trades are already consensus? Where is the crowded expression?]

## Watchlist and Alert Rules
[Specific symbols, levels, or conditions to flag in the signal system]

---

**Current macro context (if available):**

```json
{{MACRO_CONTEXT_JSON}}
```
