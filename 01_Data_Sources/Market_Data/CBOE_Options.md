---
name: "CBOE Market Positioning Data"
category: "Market_Data"
type: "API"
provider: "Chicago Board Options Exchange"
pricing: "Free"
status: "Active"
priority: "Foundation"
url: "https://cdn.cboe.com/api/global/us_indices/daily_prices"
provides: ["skew-index", "vix-term-structure", "put-call-ratio"]
best_use_cases: ["market positioning analysis", "tail-risk monitoring", "volatility regime detection"]
tags: ["data_source", "market", "options", "volatility", "positioning", "cboe"]
related_sources: ["[[Financial Modeling Prep]]"]
key_location: "None required"
integrated: true
linked_puller: "cboe"
update_frequency: "daily"
owner: "CaveUser"
last_reviewed: "2026-03-26"
notes: "Tracks public CBOE positioning feeds; put/call is deprecated but skew and VIX term structure remain live."
---

## Summary

- Public CBOE market-positioning feed for skew, VIX term structure, and historical options sentiment context.
- Best for tail-risk monitoring, volatility regime detection, and crowded-trade checks.

## Data Groups

| Group | Source | Description |
| --- | --- | --- |
| Put/Call Ratio | Equity options volume | Ratio of put volume to call volume â€” fear vs greed |
| SKEW Index | CBOE SKEW | Tail risk pricing â€” how much downside protection is being bought |
| VIX Term Structure | VIX + VIX3M | Contango (normal) vs backwardation (stress) |

## Pull Commands

```powershell
node run.mjs cboe --put-call
node run.mjs cboe --skew
node run.mjs cboe --vix
node run.mjs cboe --all
```

## Signal Thresholds

| Signal | Condition | Severity |
| --- | --- | --- |
| Extreme Fear (P/C) (DEPRECATED) | Put/Call ratio > 1.2 | alert |
| Extreme Greed (P/C) (DEPRECATED) | Put/Call ratio < 0.5 | alert |
| Elevated Fear (P/C) (DEPRECATED) | Put/Call ratio > 0.9 | watch |
| Low Hedging (P/C) (DEPRECATED) | Put/Call ratio < 0.6 | watch |
| Tail Risk High | SKEW > 150 | alert |
| SKEW Complacency | SKEW < 110 | watch |
| VIX Backwardation | VIX > VIX3M by 2+ pts | alert |
| VIX Flat Term | VIX > VIX3M | watch |

## Investment Relevance

- **Crowded trades**: Extreme P/C ratios reveal one-sided positioning vulnerable to reversals
- **Tail risk**: SKEW diverging from VIX signals smart money buying crash protection
- **Regime detection**: VIX term structure inversion marks acute stress events
- **Contrarian signals**: Extreme fear readings historically precede rallies; extreme greed precedes corrections

## Deprecation Notice

**Put/Call Ratio group is deprecated.** CBOE locked public CSV access to `PUTCALL_History.csv`. The `--put-call` flag and all P/C signals are no longer active.

**Replacement**: Use `node run.mjs fmp --options <SYMBOL>` for options positioning data via Financial Modeling Prep.
