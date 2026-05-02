---
node_type: "thesis"
name: "Housing Supply Correction"
status: "Active"
conviction: "high"
timeframe: "medium"
allocation_priority: "high"
allocation_rank: 1
why_now: "Rate cuts, lock-in relief, and chronic underbuilding can re-open demand while keeping supply structurally tight."
variant_perception: "Consensus still frames housing as a pure rate trade instead of a prolonged supply-shortage cycle."
next_catalyst: "Mortgage-rate moves, builder confidence, and housing starts through the next Fed easing steps."
disconfirming_evidence: "Unemployment-led demand destruction overwhelms the structural supply shortage."
expected_upside: "Earnings and multiple expansion for builders as qualified-buyer volume reaccelerates."
expected_downside: "A recession or persistent 7%+ mortgage rates would hit volumes and margins together."
position_sizing: "Core 3-5% housing basket led by DHI and NVR, with smaller exposures in LEN, TOL, TMHC, and SKY."
required_sources: ["[[FRED Housing Series]]", "[[Census Bureau Housing Data]]", "[[FHFA House Price Index]]", "[[OpenFEMA API]]"]
required_pull_families: ["fred --group housing", "fred --group rates", "openfema --recent", "playbook housing-cycle"]
monitor_status: "mixed"
monitor_last_review: "2026-03-27"
monitor_change: "Starts rose 7.2% to 1.487M, but permits fell 5.4%, mortgage rates rose to 6.38%, and the housing playbook shifted to Late Cycle / Peak Risk with a FEMA disaster alert."
break_risk_status: "watch"
monitor_action: "Keep exposure selective, but review rate-sensitive builders and regional risk if mortgage rates keep rising or labor weakens."
core_entities: ["[[DHI]]", "[[LEN]]", "[[NVR]]", "[[TOL]]", "[[TMHC]]", "[[SKY]]", "[[Housing]]", "[[USA]]"]
supporting_regimes: ["[[Rate Cut Cycle]]", "[[Housing Supply Crisis]]", "[[Affordability Pressure]]"]
key_indicators: ["[[Housing Starts HOUST]]", "[[Building Permits PERMIT]]", "[[30-Year Mortgage Rate MORTGAGE30US]]", "[[Home Price Index CSUSHPISA]]", "[[Builder Confidence Index]]"]
bullish_drivers: ["[[3-5M Unit Structural Underbuilding]]", "[[Rate Cuts Unlocking Demand]]", "[[Lock-In Effect Release]]", "[[Millennial Household Formation]]", "[[Builder Margin Resilience]]"]
bearish_drivers: ["[[Mortgage Rate Lock-In Effect]]", "[[Affordability At Historic Lows]]", "[[Materials Cost Inflation]]", "[[Zoning/Permitting Constraints]]"]
invalidation_triggers: ["30-year mortgage rate stays above 7% for 3+ consecutive years — affordability permanently impaired for the median buyer", "Recession drives unemployment above 6% — demand destruction despite housing shortage", "Builders overbuild aggressively in the next upcycle, creating supply glut by 2028–2030", "Home price appreciation outpaces wage growth for 5+ more years — demand permanently impaired at current incomes"]
fmp_watchlist_symbols: ["DHI", "LEN", "NVR", "TOL", "TMHC", "SKY"]
fmp_watchlist_symbol_count: 6
fmp_primary_symbol: "DHI"
fmp_technical_symbol_count: 6
fmp_technical_nonclear_count: 5
fmp_technical_bearish_count: 6
fmp_technical_overbought_count: 0
fmp_technical_oversold_count: 0
fmp_primary_technical_status: "alert"
fmp_primary_technical_bias: "bearish"
fmp_primary_momentum_state: "neutral"
fmp_primary_rsi14: 52.19
fmp_primary_price_vs_sma200_pct: -1.49
fmp_primary_fundamentals_status: "complete"
fmp_primary_market_cap: 43004907000
fmp_primary_trailing_pe: 13.76
fmp_primary_price_to_sales: 1.29
fmp_primary_price_to_book: 1.85
fmp_primary_ev_to_sales: 1.43
fmp_primary_ev_to_ebitda: 11.53
fmp_primary_roe_pct: 13.24
fmp_primary_roic_pct: 9.65
fmp_primary_operating_margin_pct: 11.76
fmp_primary_net_margin_pct: 9.51
fmp_primary_current_ratio: 6.86
fmp_primary_debt_to_equity: 0.28
fmp_primary_price_target: 167.5
fmp_primary_analyst_count: 18
fmp_primary_target_upside_pct: 10.45
fmp_primary_fundamentals_cached_at: "2026-04-30"
fmp_primary_snapshot_date: "2026-04-30"
fmp_calendar_symbol_count: 1
fmp_calendar_pull_date: "2026-04-07"
fmp_last_sync: "2026-04-30"
tags: ["thesis", "housing", "real-estate", "homebuilders", "macro", "rates"]
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

## Investment Scorecard

- **Allocation Priority**: high (1)
- **Why now**: Rate cuts, lock-in relief, and chronic underbuilding can re-open demand while keeping supply structurally tight.
- **Variant perception**: Consensus still frames housing as a pure rate trade instead of a prolonged supply-shortage cycle.
- **Next catalyst**: Mortgage-rate moves, builder confidence, and housing starts through the next Fed easing steps.
- **Disconfirming evidence**: Unemployment-led demand destruction overwhelms the structural supply shortage.
- **Expected upside**: Earnings and multiple expansion for builders as qualified-buyer volume reaccelerates.
- **Expected downside**: A recession or persistent 7%+ mortgage rates would hit volumes and margins together.
- **Sizing rule**: Core 3-5% housing basket led by DHI and NVR, with smaller exposures in LEN, TOL, TMHC, and SKY.

## Required Evidence

- **Source notes**: [[FRED Housing Series]], [[Census Bureau Housing Data]], [[FHFA House Price Index]], [[OpenFEMA API]]
- **Pull families**: fred --group housing, fred --group rates, openfema --recent, playbook housing-cycle

## Monitor Review

- **Last review**: 2026-03-27
- **Change this week**: Starts rose 7.2% to 1.487M, but permits fell 5.4%, mortgage rates rose to 6.38%, and the housing playbook shifted to Late Cycle / Peak Risk with a FEMA disaster alert.
- **Break risk status**: watch
- **Action**: Keep exposure selective, but review rate-sensitive builders and regional risk if mortgage rates keep rising or labor weakens.

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



