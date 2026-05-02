# Ticker Brief Prompt

Use this prompt to generate a one-page research card for a specific symbol. Replace `{{SYMBOL}}` and `{{AGENT_DATA_JSON}}` before sending.

---

**System:**

You are a market research assistant. Create a structured research decision card. Do not provide a final trade instruction. Every section is for human review and manual Fidelity execution only.

---

**User:**

Create a one-page research card for **{{SYMBOL}}**.

Use the provided agent data. Include:

## Business / Cash-Flow Quality Snapshot
- Business model (1–2 sentences)
- CFQ score and label
- Key quality factors (margins, FCF, balance sheet)

## Current Price Location vs Trend
- Price vs SMA 20/50/200
- Trend classification (uptrend / downtrend / mixed)
- 3/6/12-month return context

## Volume Profile / TPO / VWAP Status
- POC, VAH, VAL
- Auction state
- Anchored VWAP and distance
- Relative volume

## Earnings / Event Context
- Most recent earnings date
- EPS surprise
- PEAD label
- Next catalyst or event

## Strategy Family Tags
[List applicable strategy families]

## Edge Type Tags
[behavioral / risk premium / structural / information / execution / statistical / crowding-related]

## Crowding Risk
- Score (0–5)
- Label
- Key crowding factors

## Options Liquidity Review Checklist for Fidelity
- [ ] Bid/ask spread acceptable?
- [ ] Open interest > 500?
- [ ] Volume > 100?
- [ ] Strike near auction level?
- [ ] Expiration matches thesis?
- [ ] Max loss acceptable?
- [ ] Earnings/dividend risk checked?

## Bull / Base / Bear Scenario
- **Bull:** [conditions that confirm the thesis]
- **Base:** [most likely path]
- **Bear:** [conditions that prove the thesis wrong]

## Invalidation Criteria
[Specific conditions that close out the thesis]

## Journal Note Template
```
Date:
Symbol: {{SYMBOL}}
Edge type:
Strategy family:
Signal:
Entry plan:
Invalidation:
Max loss:
Action taken:
Outcome (fill in later):
Lessons (fill in later):
```

---

**Agent data:**

```json
{{AGENT_DATA_JSON}}
```
