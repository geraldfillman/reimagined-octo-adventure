---
title: PubMed API
name: PubMed API
category: Frontier_Science
type: API
provider: NCBI / National Library of Medicine
pricing: Free
status: active
priority: foundation
integrated: true
linked_puller: pubmed.mjs
url: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/
provides: [journal articles, clinical research, MESH terms, author metadata, PMIDs, publication dates]
best_use_cases: [peer-reviewed biotech evidence, thesis-confirming clinical data, life sciences velocity tracking]
tags: [frontier-science, pubmed, research, biotech, life-sciences]
related_sources: arXiv API, ClinicalTrials.gov API
key_location: none required
update_frequency: Daily / on-demand
owner: CaveUser
last_reviewed: 2026-04-28
notes: Peer-reviewed biomedical literature metadata source used for biotech, clinical, and frontier-science thesis evidence.
---

# PubMed API

NCBI E-utilities REST API for peer-reviewed life sciences literature. Two-step fetch pattern: `esearch` (returns PMIDs) → `esummary` (returns metadata). No API key required; rate limit 3 req/sec.

## Topics Covered

| Flag | Query Domain | Thesis |
|---|---|---|
| `--amr` | Antimicrobial resistance, antibiotic pipeline | Antimicrobial Resistance Pipeline |
| `--glp1` | GLP-1 receptor agonists, semaglutide, obesity | GLP-1 Metabolic Disease Revolution |
| `--alzheimers` | Alzheimer's disease modification, tau, amyloid | Alzheimers Disease Modification |
| `--longevity` | Aging biology, senescence, longevity | Longevity Aging Biology |
| `--psychedelics` | Psilocybin, MDMA, psychedelic-assisted therapy | Psychedelic Mental Health Revolution |
| `--geneediting` | CRISPR, base editing, gene therapy | Gene Editing CRISPR Therapeutics |
| `--all` | All topics sequentially | cross-thesis sweep |

## Notes

- Uses MESH controlled vocabulary for precision queries
- 90-day recency filter applied by default
- Rate-safe: 350ms delay between requests
- Complements arXiv (preprints) with peer-reviewed validation
