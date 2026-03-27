---
date: "2026-03-27"
session_type: "graph"
tool: "InfraNodus"
scope: "05_Data_Pulls/Government"
graph_mode: "topics"
question: "What topics, bridge nodes, and structural gaps dominate `05_Data_Pulls/Government` right now?"
status: "Completed"
source_files: 6
statement_count: 45
relation_count: 463
cluster_count: 5
gap_count: 4
tags: ["graph-session", "infranodus", "automated"]
---

# InfraNodus Session - 05_Data_Pulls/Government

## Question

What topics, bridge nodes, and structural gaps dominate `05_Data_Pulls/Government` right now?

## Scope Summary

- Scope: `05_Data_Pulls/Government`
- Files analyzed: 6
- Statements returned: 45
- Relations returned: 463
- Topics returned: 5
- Gaps returned: 4
- Processing mode: `[[Wiki Links]] Prioritized`

## Top Topics

| Topic | Anchor Terms | Coverage | Bridge | Top Statement |
| --- | --- | --- | --- | --- |
| Topic 1 | patent, search, grant, ipr, review, uspto | 26.2% | 33.0% | **IPR** Inter Partes Review: challenges patent validity on prior art |
| Topic 2 | sector, clean, energy, technology, real, estate | 25.4% | 30.0% | 48 filings across 25 of 41 tracked companies in the last 30 days. Most active sectors: Clean Energy (10), Technology (10), Real Estate (8... |
| Topic 3 | openfema, disasterdeclarationssummaries, déclaration, last, usaspending, spending | 16.9% | 26.0% | **API**: USASpending.gov v2 (spending_by_award) |
| Topic 4 | application, keyword, scan, results, relevant, found | 17.7% | 9.0% | Client-side keyword match on inventionTitle field |
| Topic 5 | material, regulation, executive, departure, earnings, result | 13.8% | 2.0% | 91 filings across 53 of 80 tracked companies in the last 30 days. Most active tickers: MSTR (5), AVAV (4), IONQ (4), CEG (3), ETN (3). To... |

## Top Concepts

| Rank | Concept | Degree | Bridge |
| --- | --- | --- | --- |
| 1 | patent |  | 0.000 |
| 2 | search |  | 0.000 |
| 3 | application |  | 0.000 |
| 4 | material |  | 0.000 |
| 5 | regulation |  | 0.000 |
| 6 | executive |  | 0.000 |
| 7 | departure |  | 0.000 |
| 8 | earnings |  | 0.000 |
| 9 | result |  | 0.000 |

## Gap Candidates

| Gap | From Cluster | To Cluster | Distance | Suggested Action |
| --- | --- | --- | --- | --- |
| Gap 1 | patent, search, grant, ipr | sector, clean, energy, technology | 1133.372 | Review whether `patent, search, grant` should explicitly connect to `sector, clean, energy` with a bridge note or direct wiki link. |
| Gap 2 | sector, clean, energy, technology | material, regulation, executive, departure | 986.031 | Review whether `sector, clean, energy` should explicitly connect to `material, regulation, executive` with a bridge note or direct wiki link. |
| Gap 3 | sector, clean, energy, technology | application, keyword, scan, results | 1374.827 | Review whether `sector, clean, energy` should explicitly connect to `application, keyword, scan` with a bridge note or direct wiki link. |
| Gap 4 | patent, search, grant, ipr | material, regulation, executive, departure | 1323.073 | Review whether `patent, search, grant` should explicitly connect to `material, regulation, executive` with a bridge note or direct wiki link. |

## Noise Candidates

- `no`
- `gov`
- `auto-pulled`
- `days`
- `l`
- `ks`
- `active`
- `top`

## Next Actions

- Review whether `patent, search, grant` should explicitly connect to `sector, clean, energy` with a bridge note or direct wiki link.
- Review notes around `patent, search, grant, ipr`; this is the strongest bridge-heavy topic in `05_Data_Pulls/Government`.
- Consider adding stopwords or rewriting table-heavy sections to suppress noise terms such as `no`, `gov`, `auto-pulled`, `days`, `l`, `ks`, `active`, `top`.

## Plugin Follow-Up

Open `05_Data_Pulls/Government` in the InfraNodus plugin and validate this session in `topics`, then switch to `gaps` before making note-link changes.
