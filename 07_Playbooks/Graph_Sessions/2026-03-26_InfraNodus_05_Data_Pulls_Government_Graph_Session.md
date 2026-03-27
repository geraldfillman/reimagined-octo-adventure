---
date: "2026-03-26"
session_type: "graph"
tool: "InfraNodus"
scope: "05_Data_Pulls/Government"
graph_mode: "topics"
question: "What topics, bridge nodes, and structural gaps dominate `05_Data_Pulls/Government` right now?"
status: "Completed"
source_files: 16
statement_count: 101
relation_count: 635
cluster_count: 8
gap_count: 6
tags: ["graph-session", "infranodus", "automated"]
---

# InfraNodus Session - 05_Data_Pulls/Government

## Question

What topics, bridge nodes, and structural gaps dominate `05_Data_Pulls/Government` right now?

## Scope Summary

- Scope: `05_Data_Pulls/Government`
- Files analyzed: 16
- Statements returned: 101
- Relations returned: 635
- Topics returned: 8
- Gaps returned: 6
- Processing mode: `[[Wiki Links]] Prioritized`

## Top Topics

| Topic | Anchor Terms | Coverage | Bridge | Top Statement |
| --- | --- | --- | --- | --- |
| Topic 1 | patent, search, spending, award, usaspending, endpoint | 12.0% | 25.0% | **API**: USASpending.gov v2 (spending_by_award) |
| Topic 2 | sector, clean, energy, technology, real, estate | 14.7% | 23.0% | 48 filings across 25 of 41 tracked companies in the last 30 days. Most active sectors: Clean Energy (10), Technology (10), Real Estate (8... |
| Topic 3 | desc, starting, surface, genuinely, legacy, doe | 12.7% | 12.0% | Auto-pulled on 2026-03-24. Sorted by start date (newest first) to surface genuinely new contracts rather than legacy DOE management contr... |
| Topic 4 | request, service, apple, inc, limit, user | 14.0% | 10.0% | NYC 311 service requests including noise, housing, and infrastructure complaints |
| Topic 5 | tracked, openfema, disasterdeclarationssummaries, déclaration, last | 8.0% | 10.0% | **Declarations in last 60 days**: 25 |
| Topic 6 | review, validity, software, finance, prior, challeng | 18.0% | 9.0% | **IPR** Inter Partes Review: challenges patent validity on prior art |
| Topic 7 | keyword, relevant, found, scan, side, match | 10.0% | 8.0% | When PatentsView migration completes, upgrade to full-text search |
| Topic 8 | material, regulation, executive, departure, earnings, result | 10.7% | 2.0% | 91 filings across 53 of 80 tracked companies in the last 30 days. Most active tickers: MSTR (5), AVAV (4), IONQ (4), CEG (3), ETN (3). To... |

## Top Concepts

| Rank | Concept | Degree | Bridge |
| --- | --- | --- | --- |
| 1 | patent |  | 0.000 |
| 2 | search |  | 0.000 |
| 3 | request |  | 0.000 |
| 4 | review |  | 0.000 |

## Gap Candidates

| Gap | From Cluster | To Cluster | Distance | Suggested Action |
| --- | --- | --- | --- | --- |
| Gap 1 | sector, clean, energy, technology | review, validity, software, finance | 1576.625 | Review whether `sector, clean, energy` should explicitly connect to `review, validity, software` with a bridge note or direct wiki link. |
| Gap 2 | sector, clean, energy, technology | desc, starting, surface, genuinely | 1521.175 | Review whether `sector, clean, energy` should explicitly connect to `desc, starting, surface` with a bridge note or direct wiki link. |
| Gap 3 | request, service, apple, inc | review, validity, software, finance | 1999.763 | Review whether `request, service, apple` should explicitly connect to `review, validity, software` with a bridge note or direct wiki link. |
| Gap 4 | desc, starting, surface, genuinely | material, regulation, executive, departure | 1824.091 | Review whether `desc, starting, surface` should explicitly connect to `material, regulation, executive` with a bridge note or direct wiki link. |
| Gap 5 | request, service, apple, inc | material, regulation, executive, departure | 1673.633 | Review whether `request, service, apple` should explicitly connect to `material, regulation, executive` with a bridge note or direct wiki link. |
| Gap 6 | patent, search, spending, award | sector, clean, energy, technology | 1281.380 | Review whether `patent, search, spending` should explicitly connect to `sector, clean, energy` with a bridge note or direct wiki link. |

## Noise Candidates

- `no`
- `gov`
- `days`
- `contract`
- `auto-pulled`
- `on`
- `_`
- `required`

## Next Actions

- Review whether `sector, clean, energy` should explicitly connect to `review, validity, software` with a bridge note or direct wiki link.
- Review notes around `patent, search, spending, award`; this is the strongest bridge-heavy topic in `05_Data_Pulls/Government`.
- Consider adding stopwords or rewriting table-heavy sections to suppress noise terms such as `no`, `gov`, `days`, `contract`, `auto-pulled`, `on`, `_`, `required`.

## Plugin Follow-Up

Open `05_Data_Pulls/Government` in the InfraNodus plugin and validate this session in `topics`, then switch to `gaps` before making note-link changes.
