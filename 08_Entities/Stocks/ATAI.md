---
node_type: "stock"
ticker: "ATAI"
exchange: "NASDAQ"
sector: "[[Healthcare]]"
country: "[[USA]]"
market_cap: "~$1.23B"
status: "Active"
bullish_drivers: ["[[Rate Cut Cycle]]", "[[Risk-On]]", "[[FDA Breakthrough Therapy]]", "[[Mental Health Market Growth]]"]
bearish_drivers: ["[[Rate Hike Cycle]]", "[[Risk-Off]]", "[[Clinical Trial Failure Risk]]", "[[Regulatory Uncertainty]]"]
related_entities: ["[[Gold]]", "[[VIX]]"]
data_sources: []
tags: [stock, biotech, psychedelics, mental-health]
---

## Overview
AtaiBeckley Inc. is a clinical-stage biopharmaceutical company focused on developing psychedelic and psychedelic-inspired therapies for mental health disorders. Formed through the merger of atai Life Sciences (Germany) and Beckley Psytech (UK), completed November 2025. The company is headquartered in the US with operations in Germany and Canada.

**Key stats (as of March 2026):**
- Market cap: ~$1.23B (small-cap)
- YTD performance: +341%
- Analyst consensus: Strong Buy (6 analysts, 83% strong buy)
- Recently added to S&P Total Market Index, S&P Completion Index, and CRSP US benchmark indices (March 23, 2026)

## Pipeline

| Program | Molecule | Indication | Stage | Timeline |
|---------|----------|------------|-------|----------|
| BPL-003 | Mebufotenin (5-MeO-DMT) nasal spray | Treatment-Resistant Depression (TRD) | Phase 3 ready | Phase 3 initiation Q2 2026 |
| BPL-003 | Mebufotenin nasal spray | Alcohol Use Disorder (AUD) | Phase 2 | Ongoing |
| VLS-01 | DMT buccal film | Treatment-Resistant Depression | Phase 2b | Topline data H2 2026 |
| EMP-01 | R-MDMA (oral) | Social Anxiety Disorder | Phase 2 | Ongoing |
| Discovery | Non-hallucinogenic 5-HT2AR agonists | TRD / Opioid Use Disorder | Preclinical | Discovery |

**FDA Breakthrough Therapy Designation** granted to BPL-003 for TRD (October 2025) — this accelerates FDA review and enables rolling submissions.

## Sector & Macro Exposure
- **Sector**: [[Healthcare]] (biotech/pharma sub-sector)
- **Country**: [[USA]] (HQ), [[Germany]] (legacy atai operations), [[UK]] (legacy Beckley)
- **Key Commodities**: None directly
- **Currency Exposure**: EUR/USD exposure from German operations

## Competitive Landscape
- **COMPASS Pathways (CMPS)** — psilocybin therapy for TRD (direct competitor)
- **SAGE Therapeutics** — zuranolone for depression (approved, different mechanism)
- **Intracellular Therapies (ITCI)** — lumateperone for depression/schizophrenia
- **GH Research** — 5-MeO-DMT for TRD (closest mechanism competitor)
- **Johnson & Johnson/Spravato** — esketamine nasal spray for TRD (incumbent)

## Bullish Factors
- **FDA Breakthrough Therapy Designation** for BPL-003 — faster path to approval
- **Novel mechanism**: Psychedelic therapy addresses treatment-resistant patients failed by SSRIs/SNRIs
- **Single-dose model**: BPL-003 designed for rapid, durable effects from one dose — radically different economics vs. daily pills
- **Index inclusion** (CRSP, S&P Completion) drives passive fund buying
- **Mental health TAM**: Depression affects 280M+ globally; TRD is ~30% of MDD patients
- [[Rate Cut Cycle]] — cheaper capital extends runway, biotech risk appetite rises
- [[Risk-On]] — speculative small-cap biotech outperforms in risk-on environments

## Bearish Factors
- **Clinical trial risk**: Phase 2b showed efficacy decline from Week 4 to Week 6 — durability concern vs. Spravato
- **Pre-revenue**: No approved products, burning cash (runway into 2029 per merger terms)
- **Regulatory uncertainty**: Psychedelic therapies face unique scheduling/DEA challenges
- **Overbought technically**: RSI ~75 suggests near-term pullback risk
- [[Rate Hike Cycle]] — biotech needs cheap capital; rate hikes crush small-cap growth
- [[Risk-Off]] — flight to quality abandons speculative biotech first
- **Dilution risk**: May need future capital raises despite current runway

## Macro Sensitivity
- **Rising Rates**: Very bearish — pre-revenue biotech is the longest-duration equity asset. Higher discount rates crush present value of distant cash flows
- **Recession**: Mixed — [[Healthcare]] is defensive, but biotech *funding* dries up in recessions. Clinical trials may slow.
- **Inflation**: Mildly negative — doesn't directly impact drug pricing, but higher rates from inflation response are the transmission mechanism
- **Risk Appetite ([[VIX]])**: High correlation — when [[VIX]] is low and [[Risk-On]] prevails, speculative biotech rallies. When [[VIX]] spikes, ATAI sells off disproportionately

## Key Catalysts (2026)
1. **Q2 2026**: BPL-003 Phase 3 initiation (most important near-term catalyst)
2. **H2 2026**: VLS-01 Phase 2b topline data
3. **Ongoing**: EMP-01 Phase 2 enrollment for social anxiety
4. **Potential**: Additional FDA designations for AUD indication

## Signals
```dataview
TABLE signal_id, severity, date
FROM "06_Signals"
WHERE contains(string(tags), "ATAI") OR contains(string(tags), "biotech")
SORT date DESC
LIMIT 10
```

## Related Data Sources
```dataview
TABLE name, status
FROM "01_Data_Sources"
WHERE contains(string(file.name), "ATAI") OR contains(string(tags), "biotech") OR contains(string(related_sources), "ATAI")
```
