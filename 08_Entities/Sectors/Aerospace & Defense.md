---
node_type: "sector"
name: "Aerospace & Defense"
status: "Active"
key_stocks: ["[[KTOS]]", "[[ESLT]]", "[[RCAT]]", "[[AVAV]]", "[[LMT]]", "[[AIRO]]", "[[RTX]]", "[[LHX]]", "[[TXT]]", "[[TDY]]", "[[DRO_AX]]", "[[UMAC]]"]
key_commodities: ["[[Copper]]", "[[Lithium]]"]
key_countries: ["[[USA]]", "[[Israel]]", "[[Australia]]", "[[UK]]"]
bullish_drivers: ["[[Geopolitical Escalation]]", "[[Defense Budget]]", "[[Drone Dominance Program]]", "[[Supply Chain Nationalism]]"]
bearish_drivers: ["[[Peace Negotiations]]", "[[Austerity Politics]]", "[[Export Restrictions]]"]
related_entities: ["[[Industrials]]"]
macro_sensitivity: "high"
data_sources: []
tags: [sector, defense, drones, aerospace]
---

## Overview
The Aerospace & Defense sector encompasses military drone manufacturers, counter-UAS systems, drone components/sensors, and defense primes with autonomous systems programs. Currently in a structural upcycle driven by geopolitical escalation, the Ukraine war as a live drone laboratory, and the US Drone Dominance executive order mandating 300K+ small UAS.

## Key Sub-Segments
| Segment | Key Players | Thesis |
|---------|------------|--------|
| Military Drones | [[KTOS]], [[ESLT]], [[RCAT]], [[AVAV]], [[LMT]], [[AIRO]] | CCA, FPV, MALE UAV production |
| Counter-UAS | [[RTX]], [[LHX]], [[DRO_AX]] | Coyote, VAMPIRE, DroneShield systems |
| Components | [[TDY]], [[TXT]], [[UMAC]] | FLIR sensors, platforms, FPV hardware |

## Macro Regime Impact
| Regime | Effect | Notes |
|--------|--------|-------|
| [[Geopolitical Escalation]] | Very Bullish | Direct demand catalyst |
| [[Rate Hike Cycle]] | Neutral | Defense budgets are sticky |
| [[Recession]] | Mildly Bearish | Government spending persists but may slow |
| [[Risk-On]] | Bullish | Small-cap drone names rally hardest |
| [[Risk-Off]] | Mixed | Large primes defensive; small caps sell off |

## TAM
- Global drone market: $57-120B by 2030
- Counter-UAS: ~$7.5B US alone in 2026
- US Drone Dominance: 300K+ UAS over next 2 years

## Stocks in Sector
```dataview
TABLE ticker, status, market_cap
FROM "08_Entities/Stocks"
WHERE contains(string(sector), "Aerospace") OR contains(string(sector), "Defense")
SORT market_cap DESC
```
