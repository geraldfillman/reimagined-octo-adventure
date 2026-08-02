---
title: "MOC: Company Intel — EDGAR Deconstruction"
type: "moc"
tags: [moc, company-intel]
---

# MOC: Company Intel — EDGAR Deconstruction

Filing-driven company deconstruction: describe the company simply, prove the description with filings, detect what changed, and follow every meaningful change to the next source until the economic consequence is understood.

> **Core loop:** Explain simply → map the machine → filing baseline → scan changes → route each finding → update the description → classify strengthening / weakening / transforming → update thesis and triggers.

---

## Method

- [[04_Reference/EDGAR_Company_Deconstruction_Framework]] — the full playbook: deconstruction levels 0–10, EDGAR document map, finding-routing tables (§8), investigation trees (§9), quarterly and annual workflows (§10–11), scoring rubrics (§12)
- [[04_Reference/Corporate_Health_Integrity_Framework]] — the scored review loop on top of the machine model: process vs outcome vs market price (§3), quantitative screening bands (§5), governance/accounting markers (§7–8), divergence patterns (§13), 100-point scoring (§16), quarterly cadence (§17)

## Operator Surfaces

- [[00_Dashboard/Company Intel Board]] — coverage, state, findings feed, baseline freshness
- [[00_Dashboard/Health Review Board]] — review scores, red-flag overrides, divergence patterns, checkpoints due
- [[13_Company_Intel/Research Universe Map]] — thematic connection layer: 10 theme chains around the covered anchors, cross-cutting macro reaction table, ranked promotion queue

## Templates

- [[03_Templates/Company_Dossier]] — one living note per company; Part A is the bare-bones Company Card, Part B the filing baseline and evolution
- [[03_Templates/Intel_Finding]] — one note per meaningful filing change, with benign + negative interpretations and next-evidence routing
- [[03_Templates/Health_Review]] — one dated note per health & integrity review; §16 scores, divergence sentence, falsifiable checkpoint

---

## Dossiers

```dataview
TABLE ticker, overall_state, research_status, last_updated
FROM "13_Company_Intel/Companies"
WHERE node_type = "company_intel"
SORT last_updated DESC
```

## Recent Findings

```dataview
LIST
FROM "13_Company_Intel/Findings"
WHERE node_type = "intel_finding"
SORT date DESC
LIMIT 15
```

## Recent Health Reviews

```dataview
TABLE ticker, total_score, divergence_pattern, red_flag_override
FROM "13_Company_Intel/Reviews"
WHERE node_type = "health_review"
SORT date DESC
LIMIT 10
```

---

## CLI (`edgar` group)

```powershell
node run.mjs edgar scaffold --ticker NVDA    # create 13_Company_Intel/Companies/NVDA - Dossier.md pre-filled from SEC submissions
node run.mjs edgar baseline --ticker NVDA    # filing inventory → 05_Data_Pulls/Edgar/ (baseline package per framework §5)
node run.mjs edgar facts --ticker NVDA       # XBRL companyfacts → financial skeleton pull note
node run.mjs edgar health --ticker NVDA --review   # health/integrity marker bands + scaffold a scored review note
node run.mjs edgar baseline --ticker NVDA --dry-run
```

All endpoints are free and keyless (data.sec.gov / efts.sec.gov), throttled per SEC guidance via `scripts/lib/edgar.mjs`. No FMP quota is consumed.

---

## Workflow

### New company (once)

1. `edgar scaffold` the dossier, then write Part A (the Company Card) **before reading analyst opinions**
2. `edgar baseline` + `edgar facts`, review the baseline package in the read order from framework §7.3
3. Score clarity / economic quality / governance / disclosure (§12), set `overall_state`, define monitoring triggers

### Quarterly update

1. Re-run `edgar baseline` — process 8-Ks first, then the new 10-Q
2. Compare language against the prior version (§7.4) — new sentences, deleted metrics, risks moved hypothetical → actual
3. Log each meaningful change as an Intel Finding; route it with the §8 tables
4. Rewrite the one-sentence description **only if the economic machine materially changed**; update triggers
5. Run `edgar health --ticker X --review` and walk the health framework's §17 loop — score §16, write the divergence sentence, set the next falsifiable checkpoint

### Annual deep-dive

1. Rebuild the company from scratch ignoring the prior narrative (§11)
2. Compare three years of filings; read the proxy as an operating document
3. Re-score, update the evolution timeline

---

## Relationship to Other Systems

- **[[000-moc/moc-company-risk]]** — Company Risk hunts narrative-vs-reality misalignment (fraud-adjacent patterns); Company Intel builds the constructive business-machine model. A red dossier state or `raises-disclosure-risk` finding should feed the risk watchlist (`scan company-risk --ticker X`).
- **[[000-moc/moc-theses]]** — dossier `related_theses` link findings to thesis invalidation triggers; `thesis-broken` findings must surface in the affected thesis note.
- **`08_Entities/Stocks/`** — link each dossier's `core_entities` to the ticker's entity note so the graph connects.

## Key Principles

1. **Preserve two views:** the simple view (what the company does) and the evidence view (which filings prove it)
2. **Compare, don't merely read** — version diffs beat single-filing reading
3. **Every finding gets a benign AND a negative interpretation** before a conclusion
4. **Route every finding to the next document** — a finding without a next step is unfinished
5. **Explicit gaps over fabricated values** — blank means not yet evidenced
