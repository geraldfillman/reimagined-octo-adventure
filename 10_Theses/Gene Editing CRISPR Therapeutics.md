---
node_type: "thesis"
name: "Gene Editing & CRISPR Therapeutics"
status: "Active"
conviction: "high"
timeframe: "long"
allocation_priority: "medium"
allocation_rank: 2
why_now: "First-wave commercial gene-editing approvals are shifting the category from proof-of-concept to platform economics."
variant_perception: "The market still prices gene editing as perpetual science optionality instead of a maturing therapeutic platform."
next_catalyst: "Additional indications, manufacturing scale, and reimbursement evidence."
disconfirming_evidence: "Durability, safety, or manufacturability issues prevent the platform from scaling."
expected_upside: "Platform validation can drive multi-year rerating across the leaders."
expected_downside: "Binary trial setbacks remain severe and can impair the whole group."
position_sizing: "Satellite 1-2% basket with strict single-name limits."
required_sources: ["[[FDA open data Drugs@FDA]]", "[[ClinicalTrials API]]", "[[PubMed API]]", "[[SEC EDGAR API]]"]
required_pull_families: ["fda --recent-approvals", "clinicaltrials --geneediting", "pubmed --geneediting", "sec --biotech"]
monitor_status: "on-track"
monitor_last_review: "2026-03-27"
monitor_change: "Initial monitor baseline established."
break_risk_status: "not-seen"
monitor_action: "Review on catalyst changes and promote only when evidence chains strengthen."
core_entities: ["[[NTLA]]", "[[BEAM]]", "[[EDIT]]", "[[CRSP]]", "[[Gene Editing]]", "[[Rare Disease]]", "[[USA]]"]
supporting_regimes: ["[[Innovation Cycle]]", "[[Risk-On]]"]
key_indicators: ["[[CRISPR Approvals]]", "[[In Vivo Editing Trials]]", "[[Base Editing Phase 2 Data]]", "[[Patent Landscape]]"]
bullish_drivers: ["[[CASGEVY Approval Precedent]]", "[[In Vivo Delivery Advances]]", "[[Base Editing Precision]]", "[[Prime Editing Breadth]]", "[[BARDA Pandemic Preparedness Contracts]]"]
bearish_drivers: ["[[Off-Target Editing Concerns]]", "[[Manufacturing Complexity]]", "[[IP Interference Proceedings]]", "[[Pricing / Access Controversy]]"]
invalidation_triggers: ["Major off-target editing safety event in a clinical trial triggers FDA clinical hold across multiple programs", "CRISPR/Cas9 IP interference proceeding at USPTO permanently clouds foundational patents", "In vivo delivery (LNP, AAV) fails for liver targets — limits reach beyond ex vivo", "Reimbursement agencies (NICE, CMS) refuse coverage for >$2M one-time therapies"]
fmp_watchlist_symbols: ["NTLA", "BEAM", "EDIT", "CRSP"]
fmp_watchlist_symbol_count: 4
fmp_primary_symbol: "NTLA"
fmp_technical_symbol_count: 4
fmp_technical_nonclear_count: 2
fmp_technical_bearish_count: 2
fmp_technical_overbought_count: 0
fmp_technical_oversold_count: 0
fmp_primary_technical_status: "alert"
fmp_primary_technical_bias: "bearish"
fmp_primary_momentum_state: "soft"
fmp_primary_rsi14: 40.75
fmp_primary_price_vs_sma200_pct: -5.27
fmp_primary_fundamentals_status: "complete"
fmp_primary_market_cap: 1470171980
fmp_primary_trailing_pe: -3.27
fmp_primary_price_to_sales: 21.73
fmp_primary_price_to_book: 2.01
fmp_primary_ev_to_sales: 20.81
fmp_primary_ev_to_ebitda: -3.37
fmp_primary_roe_pct: -56.63
fmp_primary_roic_pct: -57.67
fmp_primary_operating_margin_pct: -651.67
fmp_primary_net_margin_pct: -609.85
fmp_primary_current_ratio: 5.08
fmp_primary_debt_to_equity: 0.14
fmp_primary_price_target: 20.29
fmp_primary_analyst_count: 21
fmp_primary_target_upside_pct: 63.04
fmp_primary_fundamentals_cached_at: "2026-04-30"
fmp_primary_snapshot_date: "2026-04-30"
fmp_calendar_symbol_count: 4
fmp_calendar_pull_date: "2026-04-30"
fmp_next_earnings_date: "2026-05-05"
fmp_next_earnings_symbols: ["BEAM"]
fmp_last_sync: "2026-04-30"
tags: ["thesis", "biotech", "gene-editing", "crispr", "rare-disease", "genomics"]
---

## Thesis Statement
The first FDA-approved CRISPR therapy (CASGEVY, 2023) for sickle cell disease is the historical inflection point — the same moment recombinant insulin was approved in 1982 for the biologic era. Base editing and prime editing now deliver single-nucleotide precision corrections without double-strand breaks. In vivo editing (delivering the machinery directly to tissues) is moving from the liver toward the eye, lung, and CNS. The gene editing market is tracking from rare disease proof-of-concept toward a platform technology for cardiovascular, infectious disease, and oncology. Every decade sees one platform shift in medicine; this is it.

## Core Logic
1. **CASGEVY is the Apollo 11 moment**: Vertex/CRISPR Therapeutics' FDA approval for SCD proves the editing-to-approval pathway. Regulatory risk is substantially de-risked for well-designed programs.
2. **Base editing eliminates the off-target risk argument**: Beam's CBEs and ABEs make targeted single-letter changes without cutting DNA — removes the biggest scientific objection to CRISPR safety in vivo.
3. **In vivo LNP delivery is working**: Intellia's Phase 1 NTLA-2001 (TTR amyloidosis) showed 93% TTR reduction with a single IV dose. LNP delivery to the liver is validated; lung and eye are next.
4. **IP landscape is clearing**: Broad Institute vs. UC Berkeley interference is largely resolved; patent licensing is becoming commercial rather than existential — reducing binary legal risk.
5. **Rare disease + ultra-high pricing = fast path to profitability**: CASGEVY at $2.2M/treatment for 20,000 US SCD patients = $44B total addressable. Hemophilia A/B, DMD, and TTR amyloidosis are similarly priced rare disease markets.
6. **Competition accelerates the market**: Intellia (in vivo), Beam (base editing), Editas (next-gen Cas12a), and CRSP (ex vivo) are racing to cover different niches — each validating investor interest in the space.

## Key Entities
| Entity | Role | Edge |
|--------|------|------|
| [[CRSP]] | CASGEVY (approved) — SCD & beta-thal | Only company with an approved CRISPR product on market |
| [[NTLA]] | In vivo editing — NTLA-2001 (TTR), NTLA-2002 (HAE) | Most advanced in vivo pipeline; liver delivery validated |
| [[BEAM]] | Base editing — BEAM-101 (SCD), BEAM-302 (AAT deficiency) | Precision without DSB; largest base editing patent portfolio |
| [[EDIT]] | Next-gen Cas12a — EDIT-301 (hemoglobinopathies) | Alternative Cas system with independent IP |

## Patent Signal Watch (USPTO PTAB)
PTAB proceedings to monitor (`--ptab` query, tech center 1600):
- Any IPR filed against **Broad Institute's SpCas9 patents** — foundational to CRSP and NTLA programs
- Any IPR against **Beam's CBE/ABE base editing patents** — core IP moat
- **NTLA-2001 composition-of-matter patents** — in vivo LNP delivery IP is most commercially valuable
- Interference proceedings between **BE4max (Beam) and any UT/Rice patents** for base editors
- Filing velocity in **Class 435/91.1** (genetic engineering) is the leading indicator of competitive intensity

## 2026 Catalyst Calendar
| Timeframe | Event | Entity | Significance |
|-----------|-------|--------|-------------|
| Q1–Q2 2026 | NTLA-2002 (HAE) Phase 3 interim data | [[NTLA]] | In vivo editing efficacy in HAE — validates CNS pipeline path |
| H1 2026 | BEAM-101 Phase 1/2 SCD data update | [[BEAM]] | Base editing vs. CASGEVY efficacy comparison |
| 2026 | CASGEVY commercial launch scaling | [[CRSP]] | Revenue ramp — first year commercial is always slow for one-time therapies |
| H2 2026 | EDIT-301 Phase 3 hemoglobinopathy enrollment | [[EDIT]] | Phase 3 start = 3–4 year path to approval |
| Ongoing | NTLA in vivo CNS delivery IND filing | [[NTLA]] | First CRISPR therapy outside the liver — massive TAM expansion |

## Supporting Macro
- **Regime**: Innovation Cycle and Risk-On are the only favorable regimes — this is pure-play biotech innovation
- **BARDA/NIH**: Federal funding for gene therapy manufacturing and rare disease research is bipartisan; ARPA-H is funding next-gen delivery
- **Anti-regime**: Rate Hike Cycle is the primary headwind — these are long-duration assets (10+ year cash flows discounted at high rates = severe multiple compression)

## Macro Regime Sensitivity Matrix
| Regime | Thesis Impact | Action |
|--------|--------------|--------|
| [[Innovation Cycle]] | Strong tailwind | Add across |
| [[Risk-On]] | Strong tailwind | Add across |
| [[Goldilocks]] | Supportive | Hold/add |
| [[Rate Hike Cycle]] | Major headwind — discount rate | Reduce, trim to CRSP (revenue-generating) |
| [[Recession]] | Severe headwind — speculative names crushed | Trim BEAM, EDIT; hold CRSP |
| [[Risk-Off]] | Heavy pressure | Reduce to core CRSP position |

## Invalidation Criteria
- Major off-target editing event in a human clinical trial → FDA clinical hold across the sector
- IP interference proceeding destroys foundational Broad Institute patents → licensing chaos
- CMS refuses to cover CASGEVY at $2.2M — reimbursement model fails (blocks all successor therapies)
- In vivo delivery fails to achieve durable editing in non-liver tissues — limits TAM to rare liver diseases only

## Investment Scorecard

- **Allocation Priority**: medium (2)
- **Why now**: First-wave commercial gene-editing approvals are shifting the category from proof-of-concept to platform economics.
- **Variant perception**: The market still prices gene editing as perpetual science optionality instead of a maturing therapeutic platform.
- **Next catalyst**: Additional indications, manufacturing scale, and reimbursement evidence.
- **Disconfirming evidence**: Durability, safety, or manufacturability issues prevent the platform from scaling.
- **Expected upside**: Platform validation can drive multi-year rerating across the leaders.
- **Expected downside**: Binary trial setbacks remain severe and can impair the whole group.
- **Sizing rule**: Satellite 1-2% basket with strict single-name limits.

## Required Evidence

- **Source notes**: [[FDA open data Drugs@FDA]], [[ClinicalTrials API]], [[PubMed API]], [[SEC EDGAR API]]
- **Pull families**: fda --recent-approvals, clinicaltrials --geneediting, pubmed --geneediting, sec --biotech

## Monitor Review

- **Last review**: 2026-03-27
- **Change this week**: Initial monitor baseline established.
- **Break risk status**: not-seen
- **Action**: Review on catalyst changes and promote only when evidence chains strengthen.

## Position Sizing & Risk
- **Preferred vehicles**: [[CRSP]] for only commercial-stage name; [[NTLA]] for best in vivo pipeline
- **Size**: 1–3% speculative each — high conviction platform, but binary clinical and IP risk
- **Hedge**: Diversify across CRSP + NTLA + BEAM for different editing modalities; avoid concentration
- **Scale plan**: Add on positive Phase 2 data; trim ahead of binary readouts to manage gap-down risk

## Data Feeds Connected
- `ClinicalTrials --geneediting` — Phase 1/2/3 in vivo and ex vivo editing trials
- `PubMed --geneediting` — delivery mechanism research, off-target studies
- `arXiv --geneediting` — base editing and prime editing preprints
- `SEC --geneediting` — 8-K filings for partnership deals, collaboration agreements
- `USPTO --ptab` — IPR filings against foundational CRISPR patents (tech center 1600)

## Signals to Watch
```dataview
TABLE signal_id, severity, date
FROM "06_Signals"
WHERE contains(string(tags), "geneediting") OR contains(string(tags), "CRSP") OR contains(string(tags), "NTLA")
SORT date DESC
LIMIT 5
```



