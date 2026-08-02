---
node_type: "intel_finding"
date: "2026-08-01"
company: "Palantir Technologies Inc."
ticker: "PLTR"
classification: "unresolved"
machine_effect: "revenue"
thesis_impact: "monitor"
evidence_filing: "FY2025 10-K XBRL: AccountsReceivableNetCurrent $1.0B vs $575M prior"
source_link: "https://www.sec.gov/Archives/edgar/data/1321655/000132165526000011/pltr-20251231.htm"
related_theses: ["[[Defense AI Autonomous Warfare]]", "[[AI Power Defense Stack]]"]
tags: [intel-finding]
---

# Finding: PLTR receivables growing 25pp faster than revenue

## Finding

FY2025 receivables rose **+81.2%** ($575M → $1.0B) against revenue growth of **+56.2%** ($2.9B → $4.5B). Framework §8.3 flags receivables outpacing revenue as a demand-quality question.

## Evidence

XBRL companyfacts, FY2025 vs FY2024 ([[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Facts_PLTR]]). Deferred revenue (+57.5%) tracked revenue normally; only receivables diverged.

## Possible Benign Explanation

Large government and enterprise contracts signed/billed late in Q4 2025 — timing, not collection quality. Consistent with a strong-bookings quarter; OCF still converted at 131% of net income, which argues against a collection problem at annual scale.

## Possible Negative Explanation

Looser payment terms used to buy growth (a classic late-cycle software move), or a mix shift toward slower-paying government primes — revenue quality softening beneath a strong headline.

## Effect on the Company Machine

Revenue engine (collection timing). If negative case holds, it also degrades cash quality over time.

## Next Evidence Needed

1. FY2025 10-K receivables note: aging, allowance for credit losses, any single-customer balances
2. Q1 2026 10-Q (filed 2026-05-05): did receivables normalize sequentially after the Q4 spike?
3. DSO trend across FY2023 → FY2025; compare government vs commercial billing terms if disclosed

## Thesis Impact

`monitor` — no action; OCF conversion contradicts the negative reading for now. Trigger escalation if receivables again outgrow revenue by >15pp in the next two 10-Qs (dossier trigger #2).
