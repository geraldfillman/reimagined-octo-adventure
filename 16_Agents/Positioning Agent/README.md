---
title: "Positioning Agent"
agent_id: "positioning"
owner: "positioning"
status: "Active"
cadence: "weekly"
tags: ["agent", "positioning", "big-money-vs-retail"]
---

# Positioning Agent

The Positioning Agent compares institutional, retail, macro/futures, options, price, and vault-strategy context to surface "big money vs retail" divergence.

It is research-only. It does not trade, place broker orders, or treat 13F, ETF ownership, options flow, or retail sentiment as standalone proof.

## Primary Puller

```powershell
node run.mjs pull positioning-report --symbols SPY,QQQ,XOM,NVDA,MSFT
node run.mjs pull positioning-report --thesis "Housing Supply Correction"
node run.mjs pull positioning-report --all-thesis --include-baskets --dry-run
```

## Outputs

- `05_Data_Pulls/Positioning/YYYY-MM-DD_Big_Money_vs_Retail_Positioning_Report.md`
- `05_Data_Pulls/Positioning/YYYY-MM-DD_Big_Money_vs_Retail_Watchlist.md`
- `scripts/.cache/positioning/YYYY-MM-DD.json`

## Handoff

The agent hands off to [[Orchestrator Agent]] through Streamline Report and the dashboard positioning panel.
