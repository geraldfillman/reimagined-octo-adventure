---
node_type: "thesis"
name: "Housing Supply Correction"
status: "Active"
conviction: "high"
timeframe: "medium"
core_entities: ["[[DHI]]", "[[LEN]]", "[[NVR]]", "[[TOL]]", "[[TMHC]]", "[[SKY]]", "[[Housing]]", "[[USA]]"]
supporting_regimes: ["[[Rate Cut Cycle]]", "[[Housing Supply Crisis]]", "[[Affordability Pressure]]"]
key_indicators: ["[[Housing Starts HOUST]]", "[[Building Permits PERMIT]]", "[[30-Year Mortgage Rate MORTGAGE30US]]", "[[Home Price Index CSUSHPISA]]", "[[Builder Confidence Index]]"]
bullish_drivers: ["[[3-5M Unit Structural Underbuilding]]", "[[Rate Cuts Unlocking Demand]]", "[[Lock-In Effect Release]]", "[[Millennial Household Formation]]", "[[Builder Margin Resilience]]"]
bearish_drivers: ["[[Mortgage Rate Lock-In Effect]]", "[[Affordability At Historic Lows]]", "[[Materials Cost Inflation]]", "[[Zoning/Permitting Constraints]]"]
invalidation_triggers: ["30-year mortgage rate stays above 7% for 3+ consecutive years — affordability permanently impaired for the median buyer", "Recession drives unemployment above 6% — demand destruction despite housing shortage", "Builders overbuild aggressively in the next upcycle, creating supply glut by 2028–2030", "Home price appreciation outpaces wage growth for 5+ more years — demand permanently impaired at current incomes"]
tags: [thesis, housing, real-estate, homebuilders, macro, rates]
---

## Thesis Statement
The US housing market has underbuilt by 3–5 million units over the past 15 years relative to household formation. The 2008 financial crisis destroyed the homebuilding industry's supply chain, workforce, and land banking capability — recovery has been structurally slow. Millennial household formation (the largest generation in US history) is peaking in the 2025–2030 window. Mortgage rate lock-in (homeowners with 3% mortgages refusing to sell) keeps existing inventory abnormally low. This is not a speculative demand shock — it's a structural supply shortage. The data is already in the vault: FRED housing group tracks every relevant variable.

## Core Logic
1. **3-5M unit deficit is structural**: US needs 1.5M+ units/year to keep pace with household formation + replacement demand. We've averaged 1.1–1.3M starts since 2012. The deficit compounds every year — it won't resolve quickly.
2. **Builders have pricing power unlike prior cycles**: In 2005–2007 overbuild, every builder was overlevered and overinventoried. Today, major builders have strong balance sheets, option land (not owned land), and can manage starts to match demand. Margin resilience is exceptional.
3. **Rate lock-in keeps existing supply off the market**: 70%+ of mortgaged homeowners have rates below 4%. Moving means taking a 7% mortgage on the new home — monthly payment doubles. This makes builders the *only* supply in many markets.
4. **Rate cuts are the demand unlock**: Each 50bps cut in the 30-year mortgage rate adds ~1–1.5M potential buyers back to the qualified pool. The Fed's cutting cycle is the catalyst.
5. **Manufactured housing (SKY) is the affordability solution**: Manufactured homes cost $80–120K vs. $300K+ site-built. Skyline Champion is the largest US manufactured housing company. HUD financing reform and land-lease community growth are structural tailwinds.
6. **D.R. Horton (DHI) is the volume/value leader**: DHI built 90K homes in FY2024 — the most of any US builder. They target entry-level buyers (highest structural demand) with sub-$300K homes through the Express Homes brand. Margin compression from rate buy-downs is temporary.

## Key Entities
| Entity | Role | Edge |
|--------|------|------|
| [[DHI]] | D.R. Horton — #1 US builder by volume | Entry-level focus; Express Homes; broadest market exposure |
| [[LEN]] | Lennar — #2 US builder | Dynamic pricing model; homebuilding + financial services integration |
| [[NVR]] | NVR (Ryan Homes) — option land, no land ownership | Asset-light model; highest ROE in the sector |
| [[TOL]] | Toll Brothers — luxury builder | High-end demographics; less rate-sensitive buyer |
| [[TMHC]] | Taylor Morrison Home | Southeast/Sun Belt focus; fastest-growing geography |
| [[SKY]] | Skyline Champion — manufactured housing | Affordability play; 100% US-manufactured; HUD reform beneficiary |

## FRED Signal Watch (Already Connected)
The vault's FRED housing group already tracks the key variables:
- **HOUST** (Housing Starts) — monthly, seasonally adjusted. Below 1.3M = supply-constrained market
- **PERMIT** (Building Permits) — leading indicator by 1–3 months
- **MORTGAGE30US** — rate above 7% = demand suppression; below 6% = demand unlock
- **CSUSHPISA** (Case-Shiller HPI) — national home price index, lagged 2 months
- Builder confidence index (NAHB) — sentiment leading indicator
- **Existing home sales inventory** (NAR) — months of supply below 3.5 = seller's market

## 2026 Catalyst Calendar
| Timeframe | Event | Entity | Significance |
|-----------|-------|--------|-------------|
| Q1–Q2 2026 | Fed funds rate decision (potential cuts) | [[DHI]], [[LEN]] | Every 50bps cut = ~1M more qualified buyers |
| H1 2026 | NAHB builder confidence spring survey | All | Seasonal demand indicator |
| 2026 | HUD manufactured housing financing reform | [[SKY]] | FHA MH Advantage loan expansion |
| Ongoing | Monthly housing starts (HOUST) | All | Primary demand signal — watch for breakout above 1.5M |
| Ongoing | 30Y mortgage rate weekly | All | Rate below 6.5% = meaningful demand unlock |

## Supporting Macro
- **Regime**: Rate Cut Cycle is the primary catalyst; Housing Supply Crisis provides the floor
- **Employment**: Builder stocks are highly sensitive to employment — unemployment above 5% kills demand regardless of rates
- **Demographics**: Millennials (age 27–43 in 2026) are in peak homebuying years — secular demand tailwind
- **Anti-regime**: Rate Hike Cycle is the most direct headwind; Recession destroys demand even amid supply shortage

## Macro Regime Sensitivity Matrix
| Regime | Thesis Impact | Action |
|--------|--------------|--------|
| [[Rate Cut Cycle]] | Strong tailwind — primary catalyst | Add DHI, LEN |
| [[Goldilocks]] | Supportive | Hold/add |
| [[Housing Supply Crisis]] | Structural floor | Hold |
| [[Rate Hike Cycle]] | Major headwind | Reduce |
| [[Recession]] | Demand destruction | Reduce all |
| [[Risk-Off]] | Pressure — builder stocks are cyclical | Hold NVR (most resilient model) |

## Invalidation Criteria
- Mortgage rates remain above 7% for 3+ years → affordability constraint is permanent, lock-in effect doesn't matter
- Unemployment above 6% in a recession → demand destruction despite shortage
- Builders overbuild into demand — starts consistently above 1.8M for 2+ years without absorption
- Zoning reform accelerates dramatically → "missing middle" ADUs and infill suddenly add 500K+ units/year → partially resolves shortage

## Position Sizing & Risk
- **Preferred vehicles**: [[DHI]] for volume and entry-level demand; [[NVR]] for capital-light model and high ROE
- **Size**: 2–4% each for DHI, NVR; 1–2% for LEN, TOL; 0.5–1% for TMHC, SKY
- **Hedge**: Rate risk is the primary hedge — monitor MORTGAGE30US closely via FRED daily pull
- **Scale plan**: Add DHI/LEN on rate cuts; add SKY on HUD financing reform; trim all on unemployment >5%

## Data Feeds Connected
- `FRED --group housing` — HOUST, PERMIT, MORTGAGE30US, CSUSHPISA (already in morning sequence)
- `SEC --housing` — 8-K for community openings, land option exercises, guidance revisions
- `OpenFEMA --recent` — disaster declarations in builder geographies (weather risk)
- `USASpending --recent` — HUD housing program funding (CDBG, HOME Investment Partnerships)

## Signals to Watch
```dataview
TABLE signal_id, severity, date
FROM "06_Signals"
WHERE contains(string(tags), "housing") OR contains(string(tags), "DHI") OR contains(string(tags), "mortgage")
SORT date DESC
LIMIT 5
```
