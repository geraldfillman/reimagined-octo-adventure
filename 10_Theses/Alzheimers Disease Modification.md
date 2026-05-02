---
node_type: "thesis"
name: "Alzheimer's Disease Modification"
status: "Active"
conviction: "medium"
timeframe: "long"
allocation_priority: "medium"
allocation_rank: 2
why_now: "Disease-modifying Alzheimer's therapies are entering a stage where real adoption and outcomes can finally be measured."
variant_perception: "Investors still distrust the space after decades of failures, which leaves upside if efficacy and access improve."
next_catalyst: "Label changes, payer access, and confirmatory-trial data over the next 12-18 months."
disconfirming_evidence: "Efficacy remains marginal or safety burdens prevent broad adoption."
expected_upside: "A validated disease-modification story could reset revenue expectations across the category."
expected_downside: "Trial disappointment or slow uptake keeps the thesis a value trap."
position_sizing: "Satellite 0.5-2% sleeve with disciplined event-risk sizing."
required_sources: ["[[FDA open data Drugs@FDA]]", "[[ClinicalTrials API]]", "[[PubMed API]]", "[[NewsAPI]]"]
required_pull_families: ["fda --recent-approvals", "clinicaltrials --alzheimers", "pubmed --alzheimers", "newsapi --topic business"]
monitor_status: "on-track"
monitor_last_review: "2026-03-27"
monitor_change: "Initial monitor baseline established."
break_risk_status: "not-seen"
monitor_action: "Review on catalyst changes and promote only when evidence chains strengthen."
core_entities: ["[[BIIB]]", "[[LLY]]", "[[PRTA]]", "[[ACAD]]", "[[Neurology]]", "[[Rare Disease]]", "[[USA]]"]
supporting_regimes: ["[[Innovation Cycle]]", "[[Goldilocks]]"]
key_indicators: ["[[Lecanemab Prescriptions]]", "[[Donanemab Revenue]]", "[[Amyloid PET Adoption]]", "[[CMS Coverage Expansion]]"]
bullish_drivers: ["[[First Disease-Modifying Approvals]]", "[[Blood Biomarker Diagnostics]]", "[[Earlier Stage Treatment Shift]]", "[[Tau Target Pipeline]]", "[[GLP-1 Metabolic Connection]]"]
bearish_drivers: ["[[ARIA Safety Events]]", "[[Slow Ramp Due to Infusion Requirements]]", "[[Diagnostic Bottleneck]]", "[[Reimbursement Friction]]"]
invalidation_triggers: ["ARIA (brain microhemorrhage) safety signal leads to black box warning or label restriction that guts prescribing", "Head-to-head lecanemab vs. donanemab shows one is clearly superior — winner-take-all dynamic hurts loser", "Tau antibody programs in Phase 3 all fail — narrows pipeline to amyloid only (already validated)", "Blood biomarker (p-tau 217) diagnostics not adopted at scale — bottleneck on patient identification"]
fmp_watchlist_symbols: ["BIIB", "LLY", "PRTA", "ACAD"]
fmp_watchlist_symbol_count: 4
fmp_primary_symbol: "BIIB"
fmp_technical_symbol_count: 4
fmp_technical_nonclear_count: 2
fmp_technical_bearish_count: 2
fmp_technical_overbought_count: 0
fmp_technical_oversold_count: 0
fmp_primary_technical_status: "clear"
fmp_primary_technical_bias: "bullish"
fmp_primary_momentum_state: "positive"
fmp_primary_rsi14: 61.03
fmp_primary_price_vs_sma200_pct: 18.64
fmp_primary_fundamentals_status: "complete"
fmp_primary_market_cap: 28527014420
fmp_primary_trailing_pe: 20.78
fmp_primary_price_to_sales: 2.89
fmp_primary_price_to_book: 1.53
fmp_primary_ev_to_sales: 3.22
fmp_primary_ev_to_ebitda: 10.99
fmp_primary_roe_pct: 7.55
fmp_primary_roic_pct: 5.66
fmp_primary_operating_margin_pct: 16.28
fmp_primary_net_margin_pct: 13.92
fmp_primary_current_ratio: 3.06
fmp_primary_debt_to_equity: 0.35
fmp_primary_price_target: 201.49
fmp_primary_analyst_count: 35
fmp_primary_target_upside_pct: 3.66
fmp_primary_fundamentals_cached_at: "2026-04-30"
fmp_primary_snapshot_date: "2026-04-30"
fmp_calendar_symbol_count: 4
fmp_calendar_pull_date: "2026-04-30"
fmp_next_earnings_date: "2026-04-30"
fmp_next_earnings_symbols: ["LLY"]
fmp_last_sync: "2026-04-30"
tags: ["thesis", "biotech", "neurology", "alzheimers", "cns", "disease-modification"]
---

## Thesis Statement
For the first time in history, we have FDA-approved drugs that slow Alzheimer's disease progression — not just manage symptoms. Lecanemab (Leqembi, Biogen/Eisai) and donanemab (Kisunla, Lilly) both demonstrate 25–35% slowing of clinical decline in early AD. The commercial ramp is slow due to infusion logistics, ARIA monitoring, and diagnostic access — but these are solvent problems, not scientific ones. The pipeline behind the amyloid clearers is targeting tau, neuroinflammation, and metabolic dysfunction. The $1T+ long-term cost of dementia care creates enormous payer incentive to fund disease modification even at high prices.

## Core Logic
1. **Approval precedent is set**: Two anti-amyloid antibodies with full FDA approval (not accelerated). The scientific debate about amyloid causality is effectively over — regulators accepted cognitive decline slowing as sufficient.
2. **Ramp is slow but structural**: < 10K patients on lecanemab after 18 months — constrained by neurology infusion capacity, PET/CSF/blood biomarker access, and APOE4 genetic screening requirements. These are infrastructure problems solving in 2025–2027.
3. **Blood biomarkers are the diagnostic unlock**: p-tau 217 blood tests (Lilly's ALZpath, C2N Diagnostics) are replacing expensive amyloid PET scans. At $200 vs. $3,500, blood tests scale diagnosis 10x.
4. **Earlier intervention is the scientific frontier**: Trials in pre-symptomatic patients (A4 study, AHEAD 3-45) could show even greater benefit. If approved for prevention, the addressable population becomes 40M+ Americans.
5. **Tau is the next target class**: Amyloid clearance is step one. Tau pathology drives neurodegeneration — Prothena's PRX005 (anti-tau), Bristol-Myers' BMS-986446, and others are in Phase 2/3.
6. **GLP-1/metabolic connection**: Insulin resistance is a major AD risk factor. Semaglutide's EVOKE trial (testing in MCI) could create a massive GLP-1 + AD crossover market, further validating the metabolic connection.

## Key Entities
| Entity | Role | Edge |
|--------|------|------|
| [[BIIB]] | Leqembi (lecanemab) — approved, co-marketed w/ Eisai | First mover; monthly SC formulation filing removes infusion barrier |
| [[LLY]] | Kisunla (donanemab) — approved July 2024 | Faster amyloid clearance; dosing until cleared (not indefinite) |
| [[PRTA]] | PRX012 SC + PRX005 (anti-tau Phase 2) | Subcutaneous route differentiator; tau pipeline is unique |
| [[ACAD]] | ACP-204 — 5-HT2A inverse agonist for AD psychosis | Addresses neuropsychiatric symptoms (agitation, hallucination) — different mechanism |

## Diagnostic & Infrastructure Signal Watch
Non-equity signals to monitor:
- **CMS coverage expansion**: National Coverage Determination update — each expansion = step-change in prescriptions
- **Amyloid PET reimbursement**: CMS imaging coverage decision is the bottleneck for non-research patients
- **p-tau 217 blood test EUA**: FDA clearance of additional blood biomarkers unlocks primary care prescribing
- **Neurology infusion center capacity**: Hospital system expansions in memory care (lagging indicator of commercial ramp)
- **APOE4 screening**: If FDA removes APOE4 homozygote restriction from lecanemab label → opens 25% more patients

## 2026 Catalyst Calendar
| Timeframe | Event | Entity | Significance |
|-----------|-------|--------|-------------|
| Q1 2026 | Leqembi SC (subcutaneous) FDA approval | [[BIIB]] | Eliminates infusion barrier — home dosing |
| H1 2026 | PRX012 Phase 2 dose selection | [[PRTA]] | SC anti-amyloid next-gen data |
| 2026 | EVOKE trial (semaglutide in MCI) data | — | GLP-1/AD crossover validation |
| H2 2026 | PRX005 anti-tau Phase 2 interim | [[PRTA]] | First tau-targeting agent with clinical data |
| Ongoing | CMS NCD review for lecanemab reimbursement | [[BIIB]] | Coverage expansion = prescription ramp |

## Supporting Macro
- **Regime**: Goldilocks and Innovation Cycle are favorable — large unmet need + durable pricing insulates from pure macro sensitivity
- **Demographics**: 10,000 Baby Boomers turn 65 every day through 2030; AD incidence doubles every 5 years above 65 — secular tailwind
- **Anti-regime**: Risk-Off environments hit PRTA/ACAD (smaller cap) harder; BIIB is more resilient as large-cap with revenue

## Macro Regime Sensitivity Matrix
| Regime | Thesis Impact | Action |
|--------|--------------|--------|
| [[Innovation Cycle]] | Strong tailwind | Add PRTA |
| [[Goldilocks]] | Supportive | Hold/add |
| [[Recession]] | Mixed — BIIB defensive (revenue); PRTA speculative | Trim PRTA |
| [[Rate Hike Cycle]] | Headwind for PRTA/ACAD | Rotate to BIIB |
| [[Risk-Off]] | Pressure on small caps | Hold BIIB |

## Invalidation Criteria
- ARIA-H (microhemorrhage) events increase above pre-approval rates → FDA restricts label or requires additional monitoring
- Both lecanemab and donanemab ramps stall at < 50K patients after 3 years — commercial execution failure signals the infrastructure problem is unsolvable in the near term
- Tau antibody programs (PRX005, BMS-986446) all fail in Phase 3 → narrows pipeline to amyloid only
- Blood biomarker false-positive rate > 20% → misdiagnosis risk kills primary care prescribing

## Investment Scorecard

- **Allocation Priority**: medium (2)
- **Why now**: Disease-modifying Alzheimer's therapies are entering a stage where real adoption and outcomes can finally be measured.
- **Variant perception**: Investors still distrust the space after decades of failures, which leaves upside if efficacy and access improve.
- **Next catalyst**: Label changes, payer access, and confirmatory-trial data over the next 12-18 months.
- **Disconfirming evidence**: Efficacy remains marginal or safety burdens prevent broad adoption.
- **Expected upside**: A validated disease-modification story could reset revenue expectations across the category.
- **Expected downside**: Trial disappointment or slow uptake keeps the thesis a value trap.
- **Sizing rule**: Satellite 0.5-2% sleeve with disciplined event-risk sizing.

## Required Evidence

- **Source notes**: [[FDA open data Drugs@FDA]], [[ClinicalTrials API]], [[PubMed API]], [[NewsAPI]]
- **Pull families**: fda --recent-approvals, clinicaltrials --alzheimers, pubmed --alzheimers, newsapi --topic business

## Monitor Review

- **Last review**: 2026-03-27
- **Change this week**: Initial monitor baseline established.
- **Break risk status**: not-seen
- **Action**: Review on catalyst changes and promote only when evidence chains strengthen.

## Position Sizing & Risk
- **Preferred vehicles**: [[BIIB]] for revenue-generating stability; [[PRTA]] for binary pipeline upside
- **Size**: 2–4% (BIIB); 1–2% (PRTA); ACAD as a < 1% speculation on neuropsychiatric symptoms market
- **Hedge**: BIIB/Eisai competition with LLY is healthy — both can win in a large market
- **Scale plan**: Add BIIB on Leqembi SC approval; add PRTA on positive PRX005 Phase 2 data

## Data Feeds Connected
- `ClinicalTrials --alzheimers` — anti-amyloid, anti-tau, and neuroinflammation trials
- `PubMed --alzheimers` — blood biomarker research, tau pathology, GLP-1/brain connection
- `arXiv --alzheimers` — computational neuroscience, protein aggregation modeling
- `SEC --alzheimers` — 8-K for licensing deals, partnership with diagnostics companies
- `FDA --recent-approvals` — amyloid-related NDA/BLA approvals and supplements

## Signals to Watch
```dataview
TABLE signal_id, severity, date
FROM "06_Signals"
WHERE contains(string(tags), "alzheimers") OR contains(string(tags), "BIIB") OR contains(string(tags), "PRTA")
SORT date DESC
LIMIT 5
```



