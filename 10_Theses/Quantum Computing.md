---
node_type: "thesis"
name: "Quantum Computing"
status: "Active"
conviction: "medium"
timeframe: "long"
allocation_priority: "watch"
allocation_rank: 3
why_now: "Government contracts and cloud access keep the category investable while hardware milestones continue."
variant_perception: "The market alternates between dismissing quantum as too early and overpaying for every milestone headline."
next_catalyst: "Hardware error-correction milestones and government contract awards over the next year."
disconfirming_evidence: "Commercial traction fails to emerge and hardware milestones stop translating into useful systems."
expected_upside: "A real logical-qubit or major-government-contract milestone could drive outsized rerating."
expected_downside: "Long timelines and speculative multiples can destroy capital in risk-off regimes."
position_sizing: "Optional 0.5-1.5% sleeve, preferably via diversified exposure."
required_sources: ["[[USASpending API]]", "[[SEC EDGAR API]]", "[[PubMed API]]", "[[NewsAPI]]"]
required_pull_families: ["usaspending --recent", "sec --quantum", "arxiv --quantum", "newsapi --topic business"]
monitor_status: "on-track"
monitor_last_review: "2026-03-27"
monitor_change: "Initial monitor baseline established."
break_risk_status: "not-seen"
monitor_action: "Keep small and review only when a catalyst or signal meaningfully changes."
core_entities: ["[[IONQ]]", "[[RGTI]]", "[[QUBT]]", "[[GOOGL]]", "[[Quantum Computing]]", "[[USA]]"]
supporting_regimes: ["[[Innovation Cycle]]", "[[Defense Budget Supercycle]]", "[[AI Infrastructure Buildout]]"]
key_indicators: ["[[Qubit Count]]", "[[Quantum Error Correction Progress]]", "[[Government QC Contracts]]", "[[Pharmaceutical QC Applications]]", "[[Cryptographic Migration Timeline]]"]
bullish_drivers: ["[[Google Willow Chip Breakthrough]]", "[[Post-NISQ Error Correction]]", "[[NIST PQC Standards Final]]", "[[Pharma Drug Discovery Use Case]]", "[[DARPA/DOE QC Funding]]"]
bearish_drivers: ["[[Decoherence Time Limitations]]", "[[Classical Simulation Competition]]", "[[Long Commercialization Timeline]]", "[[Talent Scarcity]]"]
invalidation_triggers: ["Classical simulation algorithms (e.g., tensor networks) scale to solve same problems as quantum without hardware — removes competitive moat", "Error correction overhead keeps fault-tolerant quantum decades away — NISQ apps remain niche", "China achieves quantum supremacy in cryptography-relevant algorithms — national security trigger for export controls that hurt US companies", "Investor patience expires after 5+ years without commercial revenue — sector defunded"]
fmp_watchlist_symbols: ["IONQ", "RGTI", "QUBT", "GOOGL"]
fmp_watchlist_symbol_count: 4
fmp_primary_symbol: "IONQ"
fmp_technical_symbol_count: 4
fmp_technical_nonclear_count: 4
fmp_technical_bearish_count: 3
fmp_technical_overbought_count: 1
fmp_technical_oversold_count: 0
fmp_primary_technical_status: "alert"
fmp_primary_technical_bias: "bearish"
fmp_primary_momentum_state: "positive"
fmp_primary_rsi14: 57.89
fmp_primary_price_vs_sma200_pct: -9.44
fmp_primary_fundamentals_status: "complete"
fmp_primary_market_cap: 15439242235
fmp_primary_trailing_pe: -25.97
fmp_primary_price_to_sales: 118.75
fmp_primary_price_to_book: 3.83
fmp_primary_ev_to_sales: 111.05
fmp_primary_ev_to_ebitda: -30.42
fmp_primary_roe_pct: -28.03
fmp_primary_roic_pct: -9.88
fmp_primary_operating_margin_pct: -487.41
fmp_primary_net_margin_pct: -431.12
fmp_primary_current_ratio: 15.5
fmp_primary_debt_to_equity: 0.01
fmp_primary_price_target: 60
fmp_primary_analyst_count: 13
fmp_primary_target_upside_pct: 42.48
fmp_primary_fundamentals_cached_at: "2026-04-30"
fmp_primary_snapshot_date: "2026-04-30"
fmp_calendar_symbol_count: 3
fmp_calendar_pull_date: "2026-04-30"
fmp_next_earnings_date: "2026-05-06"
fmp_next_earnings_symbols: ["IONQ"]
fmp_last_sync: "2026-04-30"
tags: ["thesis", "quantum", "computing", "technology", "deep-tech", "long-dated"]
---

## Thesis Statement
Quantum computing is moving from physics experiment to nascent commercial platform. Google's Willow chip (December 2024) performed a benchmark computation in 5 minutes that would take classical supercomputers 10 septillion years — with error rates improving exponentially. The NIST post-quantum cryptography standards (finalized 2024) have created an urgent government and enterprise market for quantum-safe migration, driving near-term revenue regardless of when fault-tolerant quantum arrives. The long-dated thesis: pharmaceutical drug discovery, financial optimization, and materials science on fault-tolerant machines will be worth hundreds of billions annually. The near-term thesis: government contracts, cloud access, and quantum networking.

## Core Logic
1. **Willow chip proves exponential error rate improvement**: Google's Willow showed that adding qubits is now *reducing* error rates — the first demonstration of below-threshold error correction. This is the key milestone quantum scientists had been waiting for.
2. **Post-quantum cryptography creates near-term revenue**: NIST finalized PQC standards in 2024. Every government agency, bank, and critical infrastructure operator must migrate. This creates a $10B+ consulting and software market that IonQ and others are targeting.
3. **Government is the first paying customer**: NSA, DARPA, DOE, and NATO allies are funding quantum computing development aggressively. IonQ has DoD contracts; Rigetti has DARPA relationships. Government revenue provides runway while commercial apps develop.
4. **Cloud access removes the barrier to enterprise experimentation**: AWS Braket, Azure Quantum, and Google Quantum AI provide cloud access to IonQ/Rigetti hardware. Enterprises can experiment without owning hardware — accelerating use case discovery.
5. **Pharmaceutical is the killer app**: Molecular simulation for drug discovery is the first problem where quantum will achieve provable advantage. Even 100-qubit systems can simulate small drug-target interactions classically intractable. Phase 1 quantum advantage in pharma by 2027–2030.
6. **Hardware horse race is unsettled**: Superconducting (Google, IBM, Rigetti), trapped ion (IonQ), photonic (PsiQuantum), and neutral atom (QuEra) are all in competition. IonQ's trapped ion has highest fidelity; Google's superconducting has fastest clock speed.

## Key Entities
| Entity | Role | Edge |
|--------|------|------|
| [[IONQ]] | Trapped ion quantum computing — DoD contracts | Highest qubit fidelity; cloud partnerships with AWS, Azure, GCP |
| [[RGTI]] | Superconducting quantum — Rigetti Computing | Aspen series chips; DARPA/government contracts |
| [[QUBT]] | Quantum Computing Inc. — software + hardware | Photonic QC + quantum optimization software |
| [[GOOGL]] | Willow chip — largest private quantum R&D | Best error correction progress; 10 septillion year benchmark |

## Government Contract Signal Watch (USASpending)
- **DARPA ONISQ** (Optimization with Noisy Intermediate-Scale Quantum) awards
- **DOE Office of Science** QC grants and contracts
- **NSA/CISA** post-quantum cryptography migration contracts
- **NIST** PQC implementation support contracts
- **NSF Quantum Leap** program awards
- Any single QC contract > $50M is an `alert` signal — validates government roadmap

## 2026 Catalyst Calendar
| Timeframe | Event | Entity | Significance |
|-----------|-------|--------|-------------|
| Q1–Q2 2026 | IonQ Forte Enterprise commercial availability | [[IONQ]] | 35 algorithmic qubit system for enterprise |
| H1 2026 | Google Willow next-generation chip announcement | [[GOOGL]] | Error correction threshold progress |
| 2026 | First fault-tolerant logical qubit demonstration | Multiple | The critical scientific milestone |
| H2 2026 | RIGETTI Ankaa-3 superconducting chip | [[RGTI]] | Competing with IonQ on gate fidelity |
| 2026–2027 | Post-PQC migration contracts ramp | [[IONQ]], [[QUBT]] | Revenue from cryptographic migration consulting |

## Supporting Macro
- **Regime**: Innovation Cycle and Defense Budget Supercycle are the primary tailwinds — quantum has bipartisan geopolitical importance (China competition)
- **National security framing**: The narrative that China leads in quantum networking (quantum key distribution) drives Congressional funding regardless of administration
- **Anti-regime**: Rate Hike Cycle destroys speculative multiples — IONQ/RGTI/QUBT all trade at high revenue multiples; rising discount rates compress them severely

## Macro Regime Sensitivity Matrix
| Regime | Thesis Impact | Action |
|--------|--------------|--------|
| [[Defense Budget Supercycle]] | Strong tailwind | Add IONQ |
| [[Innovation Cycle]] | Strong tailwind | Add across |
| [[Goldilocks]] | Supportive | Hold |
| [[Rate Hike Cycle]] | Severe headwind | Reduce dramatically |
| [[Recession]] | Severe headwind — speculative tech | Trim all |
| [[Risk-Off]] | Heavy pressure | Reduce |

## Invalidation Criteria
- Tensor network / classical simulation algorithms close the gap on claimed quantum advantage problems
- Error correction overhead requires millions of physical qubits per logical qubit — indefinitely delays fault-tolerant useful quantum
- China demonstrates quantum supremacy in RSA-2048 factoring → triggers export controls and hardware restriction on US quantum hardware
- Revenue stagnates below $100M for IonQ 3 years after commercialization claims → investor defunding risk

## Investment Scorecard

- **Allocation Priority**: watch (3)
- **Why now**: Government contracts and cloud access keep the category investable while hardware milestones continue.
- **Variant perception**: The market alternates between dismissing quantum as too early and overpaying for every milestone headline.
- **Next catalyst**: Hardware error-correction milestones and government contract awards over the next year.
- **Disconfirming evidence**: Commercial traction fails to emerge and hardware milestones stop translating into useful systems.
- **Expected upside**: A real logical-qubit or major-government-contract milestone could drive outsized rerating.
- **Expected downside**: Long timelines and speculative multiples can destroy capital in risk-off regimes.
- **Sizing rule**: Optional 0.5-1.5% sleeve, preferably via diversified exposure.

## Required Evidence

- **Source notes**: [[USASpending API]], [[SEC EDGAR API]], [[PubMed API]], [[NewsAPI]]
- **Pull families**: usaspending --recent, sec --quantum, arxiv --quantum, newsapi --topic business

## Monitor Review

- **Last review**: 2026-03-27
- **Change this week**: Initial monitor baseline established.
- **Break risk status**: not-seen
- **Action**: Keep small and review only when a catalyst or signal meaningfully changes.

## Position Sizing & Risk
- **Preferred vehicles**: [[IONQ]] as only name with meaningful government revenue; [[GOOGL]] for indirect exposure with less binary risk
- **Size**: 1–2% speculative (IONQ); < 1% each for RGTI, QUBT
- **Hedge**: Time the cycle — this thesis performs in Risk-On; exit aggressively on Fed hawkishness signals
- **Scale plan**: Add on hardware milestone announcements; use GOOGL as core + IONQ as satellite

## Data Feeds Connected
- `arXiv --quantum` — error correction research, qubit fidelity preprints
- `SEC --quantum` — 8-K for government contract awards, partnership announcements
- `USASpending --recent` — DARPA, DOE, NSA quantum computing awards
- `USPTO --ptab` — quantum hardware patent filings (tech center 2100/2800)

## Signals to Watch
```dataview
TABLE signal_id, severity, date
FROM "06_Signals"
WHERE contains(string(tags), "quantum") OR contains(string(tags), "IONQ") OR contains(string(tags), "RGTI")
SORT date DESC
LIMIT 5
```



