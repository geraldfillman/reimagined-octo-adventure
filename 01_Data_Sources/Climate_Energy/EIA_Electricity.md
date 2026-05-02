---
name: "EIA Electricity Data"
category: "Climate_Energy"
type: "API"
provider: "U.S. Energy Information Administration"
pricing: "Free"
status: "Active"
priority: "Foundation"
url: "https://api.eia.gov/v2"
provides: ["electricity-demand", "generation-mix", "regional-load"]
best_use_cases: ["energy market dashboards", "grid stress monitoring", "AI power demand tracking"]
tags: ["data_source", "energy", "electricity", "power-grid", "eia"]
related_sources: ["[[EIA API]]", "[[NOAA Climate Data Online]]", "[[NOAA Storm Events]]"]
key_location: "EIA_API_KEY"
integrated: true
linked_puller: "eia"
update_frequency: "daily / monthly"
owner: "CaveUser"
last_reviewed: "2026-03-26"
notes: "Power and grid-focused slice of the broader EIA API; used by the live eia puller."
---

## Summary

- Power and grid-focused slice of the broader EIA API, used by the live `eia` puller.
- Best for electricity demand, generation mix, and regional load stress monitoring tied to AI power demand and utility positioning.

## Data Groups

| Group | Route | Description |
| --- | --- | --- |
| Electricity Demand | `/electricity/retail-sales` | Monthly retail sales by sector (residential, commercial, industrial) |
| Generation Mix | `/electricity/electric-power-operational-data` | Net generation by fuel type (gas, nuclear, solar, wind, coal) |
| Regional Load | `/electricity/rto/daily-region-data` | Daily demand by ISO region (PJM, ERCOT, CAISO, MISO) |

## Pull Commands

```powershell
node run.mjs eia --electricity-demand
node run.mjs eia --generation-mix
node run.mjs eia --regional-load
node run.mjs eia --all
```

## Signal Thresholds

| Signal | Condition | Severity |
| --- | --- | --- |
| Demand Surge | YoY demand growth > 5% | alert |
| Demand Rising | YoY demand growth > 2% | watch |
| Generation Capacity Critical | Gen/load ratio < 1.02 | critical |
| Generation Gap Narrowing | Gen/load ratio < 1.05 | alert |
| Regional Load Spike | Region > 115% of avg | alert |
| Regional Load Elevated | Region > 110% of avg | watch |

## Investment Relevance

- **Data center demand**: AI buildout driving unprecedented electricity growth
- **Grid bottlenecks**: Regional load stress signals infrastructure investment cycles
- **Generation mix shifts**: Nuclear, gas, and renewables competing for baseload
- **Power pricing**: Supply/demand imbalance feeds into utility earnings and energy equities (GEV, ETN, VST, CEG)
