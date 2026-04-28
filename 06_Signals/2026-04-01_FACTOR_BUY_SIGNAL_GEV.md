---
signal_id: "FACTOR_BUY_SIGNAL_GEV"
signal_name: "Factor Buy Signal — GEV"
domain: "quant"
severity: "alert"
value: 1.1603
threshold: 1.1435
date: "2026-04-01"
source_pull: "Qlib_Scores_AI_Power_Defense_Stack"
tags: ["signal", "quant", "alert", "ai_power_defense_stack", "gev"]
---

## Factor Buy Signal — GEV

GEV: MAX30=1.1603 is above the 2-sigma threshold (1.1435) — mean-reversion buy signal (IC=+0.0751)

**Factor:** MAX30  
**Value:** 1.1603  
**Threshold:** 1.1435

## Implications

- GEV shows extreme MAX30 reading (>2 std devs)
- Historical pattern suggests mean-reversion bounce
- Monitor for confirmation before acting

## Related Domains

- AI Power Defense Stack
- equities
