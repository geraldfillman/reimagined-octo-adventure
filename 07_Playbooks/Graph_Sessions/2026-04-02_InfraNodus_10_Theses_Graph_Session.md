---
date: "2026-04-02"
session_type: "graph"
tool: "InfraNodus"
scope: "10_Theses"
graph_mode: "topics"
question: "What topics, bridge nodes, and structural gaps dominate `10_Theses` right now?"
status: "Completed"
source_files: 39
statement_count: 1059
relation_count: 1500
cluster_count: 10
gap_count: 6
tags: ["graph-session", "infranodus", "automated"]
---

# InfraNodus Session - 10_Theses

## Question

What topics, bridge nodes, and structural gaps dominate `10_Theses` right now?

## Scope Summary

- Scope: `10_Theses`
- Files analyzed: 39
- Statements returned: 1059
- Relations returned: 1500
- Topics returned: 10
- Gaps returned: 6
- Processing mode: `[[Wiki Links]] Prioritized`

## Top Topics

| Topic | Anchor Terms | Coverage | Bridge | Top Statement |
| --- | --- | --- | --- | --- |
| Topic 1 | [[dollar_debasement_hard_money]], [[housing_supply_correction]], rate, risk, demand, [[fiscal_scarcity_rearmament]] | 13.3% | 22.0% | The US federal debt is $36T and climbing at $1T every 100 days. The structural fiscal deficit is 6 7% of GDP in peacetime a level histori... |
| Topic 2 | [[ai_power_infrastructure]], [[grid_scale_battery_storage]], [[semiconductor_sovereignty_chips_act]], [[nuclear_renaissance_sm_rs]], power, data | 21.3% | 20.0% | AI training and inference is the single fastest-growing load in the history of the US electrical grid. A single GPT-4-scale training run ... |
| Topic 3 | [[antimicrobial_resistance_pipeline]], [[longevity_aging_biology]], [[gene_editing_crispr_therapeutics]], fda, [[glp_1_metabolic_disease_revolution]], expected | 23.3% | 15.0% | The biology of aging is the largest scientific problem being tackled with serious capital in the 2020s. Jeff Bezos, Sam Altman, Larry Pag... |
| Topic 4 | [[defense_ai_autonomous_warfare]], defense, [[hypersonic_weapons_advanced_defense]], [[drone_autonomous_systems_revolution]], budget, program | 10.0% | 14.0% | The U.S. Department of Defense is undergoing the most significant technological transformation since precision-guided munitions shifting ... |
| Topic 5 | [[space_domain_awareness]], [[quantum_computing]], year, satellite, [[humanoid_robotics]], commercial | 11.3% | 12.0% | Quantum computing is moving from physics experiment to nascent commercial platform. Google's Willow chip (December 2024) performed a benc... |
| Topic 6 | review, monitor, basket, week, create, investor | 11.3% | 11.0% | **Change this week**: Initial investor-style basket created for Qlib coverage. |
| Topic 7 | market, perception, variant | 2.0% | 3.0% | **Variant perception**: The market underestimates how persistent policy support and geopolitical fragmentation will be. |
| Topic 8 | core, rule, sizing, logic, sleeve | 3.3% | 2.0% | **Sizing rule**: Core 2-4% semiconductor sovereignty sleeve focused on strategic bottlenecks. |

## Top Concepts

| Rank | Concept | Degree | Bridge |
| --- | --- | --- | --- |
| 1 | [[ai_power_infrastructure]] |  | 0.000 |
| 2 | [[dollar_debasement_hard_money]] |  | 0.000 |
| 3 | review |  | 0.000 |
| 4 | [[housing_supply_correction]] |  | 0.000 |
| 5 | [[defense_ai_autonomous_warfare]] |  | 0.000 |
| 6 | rate |  | 0.000 |
| 7 | market |  | 0.000 |
| 8 | [[grid_scale_battery_storage]] |  | 0.000 |
| 9 | [[semiconductor_sovereignty_chips_act]] |  | 0.000 |
| 10 | [[nuclear_renaissance_sm_rs]] |  | 0.000 |
| 11 | monitor |  | 0.000 |
| 12 | risk |  | 0.000 |

## Gap Candidates

| Gap | From Cluster | To Cluster | Distance | Suggested Action |
| --- | --- | --- | --- | --- |
| Gap 1 | [[defense_ai_autonomous_warfare]], defense, [[hypersonic_weapons_advanced_defense]], [[drone_autonomous_systems_revolution]] | review, monitor, basket, week | 2241.617 | Review whether `[[defense_ai_autonomous_warfare]], defense, [[hypersonic_weapons_advanced_defense]]` should explicitly connect to `review, monitor, basket` with a bridge note or direct wiki link. |
| Gap 2 | [[dollar_debasement_hard_money]], [[housing_supply_correction]], rate, risk | [[defense_ai_autonomous_warfare]], defense, [[hypersonic_weapons_advanced_defense]], [[drone_autonomous_systems_revolution]] | 1760.198 | Review whether `[[dollar_debasement_hard_money]], [[housing_supply_correction]], rate` should explicitly connect to `[[defense_ai_autonomous_warfare]], defense, [[hypersonic_weapons_advanced_defense]]` with a bridge note or direct wiki link. |
| Gap 3 | [[antimicrobial_resistance_pipeline]], [[longevity_aging_biology]], [[gene_editing_crispr_therapeutics]], fda | [[defense_ai_autonomous_warfare]], defense, [[hypersonic_weapons_advanced_defense]], [[drone_autonomous_systems_revolution]] | 1252.963 | Review whether `[[antimicrobial_resistance_pipeline]], [[longevity_aging_biology]], [[gene_editing_crispr_therapeutics]]` should explicitly connect to `[[defense_ai_autonomous_warfare]], defense, [[hypersonic_weapons_advanced_defense]]` with a bridge note or direct wiki link. |
| Gap 4 | [[space_domain_awareness]], [[quantum_computing]], year, satellite | review, monitor, basket, week | 2010.555 | Review whether `[[space_domain_awareness]], [[quantum_computing]], year` should explicitly connect to `review, monitor, basket` with a bridge note or direct wiki link. |
| Gap 5 | [[dollar_debasement_hard_money]], [[housing_supply_correction]], rate, risk | [[space_domain_awareness]], [[quantum_computing]], year, satellite | 1594.374 | Review whether `[[dollar_debasement_hard_money]], [[housing_supply_correction]], rate` should explicitly connect to `[[space_domain_awareness]], [[quantum_computing]], year` with a bridge note or direct wiki link. |
| Gap 6 | [[ai_power_infrastructure]], [[grid_scale_battery_storage]], [[semiconductor_sovereignty_chips_act]], [[nuclear_renaissance_sm_rs]] | [[antimicrobial_resistance_pipeline]], [[longevity_aging_biology]], [[gene_editing_crispr_therapeutics]], fda | 1620.227 | Review whether `[[ai_power_infrastructure]], [[grid_scale_battery_storage]], [[semiconductor_sovereignty_chips_act]]` should explicitly connect to `[[antimicrobial_resistance_pipeline]], [[longevity_aging_biology]], [[gene_editing_crispr_therapeutics]]` with a bridge note or direct wiki link. |

## Noise Candidates

- `ai`
- `contract`
- `recent`

## Next Actions

- Review whether `[[defense_ai_autonomous_warfare]], defense, [[hypersonic_weapons_advanced_defense]]` should explicitly connect to `review, monitor, basket` with a bridge note or direct wiki link.
- Review notes around `[[dollar_debasement_hard_money]], [[housing_supply_correction]], rate, risk`; this is the strongest bridge-heavy topic in `10_Theses`.
- Consider adding stopwords or rewriting table-heavy sections to suppress noise terms such as `ai`, `contract`, `recent`.

## Plugin Follow-Up

Open `10_Theses` in the InfraNodus plugin and validate this session in `topics`, then switch to `gaps` before making note-link changes.
