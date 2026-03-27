---
node_type: "thesis"
name: "AI Power Infrastructure"
status: "Active"
conviction: "high"
timeframe: "medium"
core_entities: ["[[VST]]", "[[NRG]]", "[[GEV]]", "[[ETN]]", "[[STRL]]", "[[Power Infrastructure]]", "[[AI]]", "[[USA]]"]
supporting_regimes: ["[[AI Infrastructure Buildout]]", "[[Energy Security]]", "[[Industrial Policy]]"]
key_indicators: ["[[Data Center Power Demand GW]]", "[[Grid Investment $/yr]]", "[[Transformer Lead Times]]", "[[Hyperscaler Capex]]", "[[Power PPA Prices]]"]
bullish_drivers: ["[[AI Data Center Power Demand]]", "[[Grid Upgrade Backlog]]", "[[Hyperscaler Capital Commitments]]", "[[Transformer Shortage]]", "[[Behind-the-Meter DG Buildout]]"]
bearish_drivers: ["[[Model Efficiency Gains Reducing Power/FLOP]]", "[[Grid Interconnection Delays]]", "[[Renewable Overbuild Compressing PPA Prices]]"]
invalidation_triggers: ["LLM model efficiency (inference optimization, distillation) reduces power per FLOP by 80%+ — demand growth stalls", "Grid interconnection reforms allow renewable + storage to fill power demand without utility gas/nuclear involvement", "Hyperscaler capex cycle turns (MSFT, GOOGL, AMZN cut data center spend) — reduces power demand outlook", "Transformer and switchgear supply catches up within 2 years — bottleneck clears faster than expected"]
tags: [thesis, energy, ai-infrastructure, power, utilities, data-centers]
---

## Thesis Statement
AI training and inference is the single fastest-growing load in the history of the US electrical grid. A single GPT-4-scale training run consumes ~50 GWh. Meta's LlamaNext data center cluster requires 1 GW of continuous power. Microsoft, Google, Amazon, and Meta have committed $300B+ in data center capex for 2024–2026 alone. The grid was not built for this. Transformers have 2-year lead times. Utilities that own dispatchable generation (gas, nuclear) and the companies building the physical infrastructure (switchgear, data center construction) are the picks-and-shovels of the AI build-out — without needing to pick a winning AI model.

## Core Logic
1. **Power demand is the binding constraint on AI scaling**: Every hyperscaler has stated they cannot build data centers fast enough because they cannot get power. Vistra and NRG own dispatchable generation that can serve data centers today — no permitting, no lead times.
2. **Transformers are in a 2-year shortage**: Large power transformers (LPTs) have 2–3 year lead times. Grid-scale substations require LPTs. Eaton (ETN) and GE Vernova (GEV) are the primary US suppliers. Lead time is not compressing — demand is accelerating.
3. **GE Vernova is the grid infrastructure platform**: GEV was spun out from GE in April 2024. It supplies gas turbines, grid automation, transformers, and offshore wind. The gas turbine backlog is at a 10-year high — AI data center operators are ordering gas turbine generator sets for behind-the-meter power.
4. **Data center construction is a $150B/year market**: Sterling Infrastructure (STRL) is a data center site preparation and foundations contractor. Every hyperscaler site build generates construction revenue that's visible in backlog. STRL's e-infrastructure segment is the cleanest exposure to the physical buildout.
5. **Utilities with dispatchable nuclear/gas win the PPA race**: VST's Comanche Peak and NRG's gas fleet are signing 15–20 year PPAs with hyperscalers at $60–100/MWh — 2–3x normal wholesale prices. Legacy fleet that was being retired is now the most valuable asset in the utility sector.
6. **Behind-the-meter DG is the overflow valve**: When utility interconnection fails, hyperscalers build their own gas generators, fuel cells, and nuclear micro-reactors behind the meter. This creates additional demand for GEV turbines and ETN power conditioning.

## Key Entities
| Entity | Role | Edge |
|--------|------|------|
| [[VST]] | Vistra Corp — nuclear + gas fleet | Data center PPA machine; Comanche Peak extension |
| [[NRG]] | NRG Energy — gas generation + retail | Direct data center power agreements; large dispatchable fleet |
| [[GEV]] | GE Vernova — turbines, transformers, grid automation | Only US company that makes large gas turbines + grid transformers |
| [[ETN]] | Eaton Corp — power management, UPS, switchgear | Data center UPS and power distribution; cannot build DC without ETN |
| [[STRL]] | Sterling Infrastructure — data center construction | Pure-play data center site construction; backlog visibility |

## Contract & Grid Signal Watch
- **Hyperscaler data center announcements** with MW/GW capacity and location — precedes power contract by 6–12 months
- **PPA announcements** between utilities (VST, NRG, CEG) and hyperscalers — each is a multi-year revenue commitment
- **GE Vernova gas turbine orders** (quarterly earnings) — backlog is the leading indicator
- **Eaton data center order intake** — switchgear orders lead construction starts by 18 months
- **STRL e-infrastructure backlog** — quarterly conversion rate signals revenue pace
- **Grid interconnection reform** (FERC) — queue reforms that shorten timelines are a risk (reduces incumbent utility advantage)

## 2026 Catalyst Calendar
| Timeframe | Event | Entity | Significance |
|-----------|-------|--------|-------------|
| Q1 2026 | VST data center PPA pipeline update | [[VST]] | Next 1–3 hyperscaler PPAs |
| H1 2026 | GEV gas turbine HA-class backlog update | [[GEV]] | Turbine orders for data center behind-the-meter |
| H2 2026 | ETN data center segment revenue break-out | [[ETN]] | Quantifies data center % of power management revenue |
| 2026 | STRL e-infrastructure bookings pace | [[STRL]] | Data center construction backlog conversion |
| Ongoing | FERC interconnection queue reform | All | Could accelerate or slow the power delivery pipeline |

## Supporting Macro
- **Regime**: AI Infrastructure Buildout is the direct tailwind — all names benefit from hyperscaler capex
- **Rates**: VST and NRG are utilities — rate sensitive, but data center PPA pricing at premium offsets rate headwinds vs. traditional utility
- **Anti-regime**: Efficiency breakthroughs in AI (lower power/FLOP) could reduce demand growth — Nvidia's Blackwell architecture already improving inference efficiency

## Macro Regime Sensitivity Matrix
| Regime | Thesis Impact | Action |
|--------|--------------|--------|
| [[AI Infrastructure Buildout]] | Strong tailwind | Add across |
| [[Goldilocks]] | Supportive | Hold |
| [[Rate Hike Cycle]] | Moderate headwind for VST/NRG utility valuations | Hold STRL, GEV; trim VST |
| [[Recession]] | Data center buildout may slow; utilities resilient | Hold VST, NRG; trim STRL |
| [[Risk-Off]] | Utilities defensively resilient; STRL may dip | Hold VST; trim STRL |

## Invalidation Criteria
- Model efficiency (Chinchilla scaling, quantization, distillation) reduces power per token by 80% → demand growth stalls significantly
- Hyperscaler capex cycle reversal (MSFT, GOOGL cut spending) → data center buildout stops
- Transformer supply normalizes within 24 months — removes constraint, reduces ETN/GEV pricing power
- Behind-the-meter nuclear micro-reactors (OKLO partnerships) scale faster than expected → reduces grid utility power purchases

## Position Sizing & Risk
- **Preferred vehicles**: [[GEV]] for infrastructure hardware moat; [[STRL]] for construction backlog visibility; [[VST]] for utility PPA premium
- **Size**: 2–4% each for GEV, STRL; 2–3% for VST, NRG; 1–2% for ETN
- **Hedge**: AI efficiency risk is real — balance with NVDA (benefits regardless of power efficiency direction)
- **Scale plan**: Add GEV on turbine backlog expansions; add STRL on data center contract announcements

## Data Feeds Connected
- `SEC --aipower` — 8-K for PPA announcements, data center contract wins, turbine order disclosures
- `USASpending --recent` — DOE grid resilience grants, data center construction permits
- `FRED --group rates` — rate sensitivity for VST, NRG utility valuations
- `EIA` (future) — grid load forecasts, electricity price data
- `arXiv --aiinfra` — data center cooling, power delivery architecture research

## Signals to Watch
```dataview
TABLE signal_id, severity, date
FROM "06_Signals"
WHERE contains(string(tags), "aipower") OR contains(string(tags), "VST") OR contains(string(tags), "GEV")
SORT date DESC
LIMIT 5
```
