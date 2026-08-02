---
node_type: "intel_finding"
date: ""
company: ""
ticker: ""
classification: "unresolved"
machine_effect: ""
thesis_impact: "monitor"
evidence_filing: ""
source_link: ""
related_theses: []
tags: [intel-finding]
---

# Finding: {{title}}

> One note per meaningful filing change. Classify honestly — `unresolved` is a valid state.
> Routing tables for finding → meaning → next step: [[04_Reference/EDGAR_Company_Deconstruction_Framework]] §8.

## Finding

<!-- What changed? New sentence, deleted metric, risk moved hypothetical → actual, segment merged, covenant amended... -->

## Evidence

<!-- Exact filing, section, table, note, or exhibit. Also copy into `evidence_filing` frontmatter (e.g. "10-Q 2026-Q2, Note 7 Debt"). -->

## Possible Benign Explanation

<!-- Reasonable non-negative interpretation. -->

## Possible Negative Explanation

<!-- Reasonable risk interpretation. -->

## Effect on the Company Machine

<!-- Which part: revenue, cost, asset, capability, dependency, bottleneck, flywheel, control, financing, disclosure. Copy into `machine_effect`. -->

## Next Evidence Needed

1.
2.
3.

## Thesis Impact

<!-- no-change / monitor / positive-revision / negative-revision / thesis-broken — copy into `thesis_impact`. If the one-sentence description changed, update the dossier and its evolution timeline. -->

---

### Frontmatter values

- `classification`: `strengthens-core` · `weakens-core` · `expands-adjacent-capability` · `creates-new-engine` · `improves-moat` · `reduces-dependency` · `adds-dependency` · `improves-economics` · `reduces-cash-quality` · `increases-complexity` · `changes-control` · `raises-financing-risk` · `raises-disclosure-risk` · `unresolved`
- `machine_effect`: `revenue` · `cost` · `asset` · `capability` · `dependency` · `bottleneck` · `flywheel` · `control` · `financing` · `disclosure`
- `thesis_impact`: `no-change` · `monitor` · `positive-revision` · `negative-revision` · `thesis-broken`
- Filename: `YYYY-MM-DD - TICKER - Short Title.md`
