---
title: "Positioning Agent Pulls"
agent_id: "positioning"
tags: ["agent", "positioning", "pulls"]
---

# Pulls

| Puller | Cadence | Purpose |
|---|---:|---|
| `positioning-report` | Weekly / on demand | Big money vs retail divergence report and watchlist |

## Useful Runs

```powershell
node run.mjs pull positioning-report --symbols SPY,QQQ,XOM,NVDA,MSFT
node run.mjs pull positioning-report --thesis "Defense Reindustrialization"
node run.mjs pull positioning-report --all-thesis --include-baskets --limit 25
node run.mjs pull agent-run --cadence weekly --agents positioning --dry-run
```

## Data Dependency Notes

- Uses local vault notes first.
- FMP ownership and institutional/ETF endpoints are desired future inputs, but the current implementation does not require the FMP MCP server.
- Missing ownership or retail-flow inputs are recorded as source gaps instead of blocking the report.
