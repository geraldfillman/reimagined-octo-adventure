---
title: "Interactive Nursing Calculations Lab with Small-Dose XR"
type: "cybersickness-project"
created: "2026-07-30"
tags: ["cybersickness-dossier", "project", "nursing-calculations"]
status: "recommended"
confidence: "high for archive fit; medium until pilot"
portfolio_tier: "Build now"
score: 85
related_themes: ["[[Themes/Clinical Simulation Nursing and Interactive Learning]]", "[[Themes/Quant Probability and Decision Literacy]]", "[[Themes/Cybersickness Comfort Accessibility and Comparison]]", "[[Themes/Audio Visual Interaction and Facilitation Design]]"]
source_scope: "5 selected archive records plus current primary-source checks"
---
# Interactive Nursing Calculations Lab with Small-Dose XR

[[00 CyberSickness Hub|Back to hub]]  /  [[03 Ranked Project Portfolio]]  /  [[Sources/Evidence Register]]

> [!success] Portfolio decision
> **Rank 3  /  85/100  /  Build now**  
> Build one calculation progression with a nursing SME; defer XR until the browser assessment works.

## Target user

Prelicensure nursing learners and faculty teaching medication calculation and clinical judgment.

## Problem

Generic practice often records only the final answer, hiding the first consequential unit, setup, or interpretation error. Broad immersive platforms are expensive before the core reasoning loop is proven.

## Existing assets

- A February PRD and referenced frontend prototype for cases and calculations.
- A July scope decision favoring medication calculations and small-dose XR.
- A wider archive of NCLEX, scenario, and simulation design work.
- Current NCLEX clinical-judgment requirements and visible incumbent demand.

## Differentiator

The product diagnoses the first consequential reasoning error with unit-aware work, then optionally maps a correct calculation to a short physical selection or syringe task. XR is a module, not the product identity.

## Minimum pilot

One browser module covering a single calculation family, worked-step capture, deterministic feedback, an instructor error summary, and a short retention check. Add no XR until this loop is accurate and usable.

## Business or funding route

Faculty-sponsored course pilot, departmental license, simulation/lab innovation funding, or content partnership. The near-term value proposition is better diagnostic feedback, not a larger item bank.

## Score mechanics

| Criterion | 0-5 | Weight | Weighted points |
| --- | --- | --- | --- |
| Customer/revenue/funding path | 4 | 25% | 20 |
| Existing assets/readiness | 3 | 20% | 12 |
| Differentiation/domain fit | 5 | 20% | 20 |
| Meaningful 30-day pilot | 5 | 15% | 15 |
| Archive continuity | 4 | 10% | 8 |
| Cross-theme compounding | 5 | 10% | 10 |

**Total: 85/100.** Scores represent current evidence and are not forecasts.

## Supporting history

| Date (UTC) | Evidence class | Record | Exact provenance | What it supports |
| --- | --- | --- | --- | --- |
| 2025-10-23 | user-originated direction | Immersive NCLEX prep experiences | conversations-001.json; conversation `68f98c35-7f34-8328-adae-9c87493e4684` | Calls for repeatable, adaptable NCLEX experiences and crisis-style learning variants. |
| 2026-02-06 | user-originated direction and attached prototype | PRD for Nursing Quizzing Tool | conversations-002.json; conversation `69861116-f26c-8330-a5a7-3c92f5bb5c3a` | Defines interactive cases and medication calculations, then deliberately narrows the first build to frontend interactions. |
| 2026-07-22 | user-originated direction plus assistant proposal | Interactive Learning Topics | conversations-006.json; conversation `6a60309b-b564-83ea-b491-6918ddf271b9` | Narrows the nursing wedge to medication calculations and limits XR to short optional spatial modules. |
| 2025-12-10 | user-originated direction | Immersive simulation cleanup | conversations-001.json; conversation `6939d2c2-a85c-8330-b27a-199247369fbe` | Requests reusable clinical scenario cleanup and instructor-editable evaluation instruments. |
| 2026-03-16 | user-provided stakeholder example | Immersive Narcan Simulation | conversations-003.json; conversation `69b85d48-6168-832a-aad0-caaefc4f368d` | Frames a short small-group projected scenario as a supplement to hands-on Narcan instruction. |

## Current reality check

- [NCLEX test plans](https://www.nclex.com/test-plans.page) -- The 2026 RN and PN test plans are effective from April 1, 2026 through March 31, 2029 and retain clinical judgment as a core examination concern. Accessed 2026-07-30. (official examination body)
- [NCLEX Examination Candidate Bulletin, April 2026](https://www.ncsbn.org/public-files/NCLEX_Examination_Candidate_Bulletin_April_2026.pdf) -- The official bulletin describes integrated clinical-judgment case-study and stand-alone items, supporting scenario-based reasoning practice. Accessed 2026-07-30. (official examination body)
- [Elsevier HESI SafeMed](https://www.elsevier.com/products/hesi-safemed) -- A major incumbent already markets interactive medication-safety scenarios and dashboards, validating demand but raising the differentiation bar. Accessed 2026-07-30. (official vendor product page)
- [Elsevier Drug Calculations Online](https://evolve.elsevier.com/cs/product/9780323798846?role=student) -- A current commercial product offers stepwise calculation practice and multimedia, so the proposed wedge must emphasize diagnostic error tracing and modality integration rather than generic exercises. Accessed 2026-07-30. (official vendor product page)
- [HMD content and exposure factors associated with cybersickness](https://pubmed.ncbi.nlm.nih.gov/32300295/) -- Published evidence associates sickness with content, locomotion, and exposure duration, supporting explicit media and exposure logging. Accessed 2026-07-30. (peer-reviewed article indexed by PubMed)

## Dependencies

- nursing SME
- approved equations and item sources
- clinical review
- accessible browser design
- privacy-minimal learner identifiers
- faculty reporting workflow

## Evidence gaps

- buyer interviews
- baseline error taxonomy
- learner usability data
- retention effect
- content authoring cost

## Risks

- clinical error in content
- assessment becomes overengineered
- XR distracts from calculation
- incumbents copy generic features
- faculty dashboard goes unused

## Success measures

- first-error classification accuracy
- calculation accuracy
- time to correction
- one-week retention
- faculty usefulness
- accessibility issues
- XR completion/discomfort if later tested

## Path forward

### First 7 days

- Choose one calculation type and faculty SME.
- Define the first-error taxonomy and five representative cases.
- Test the paper interaction flow before coding.

### By day 30

- Ship the browser module and simple faculty report.
- Conduct a small usability/accuracy test.
- Decide whether the error trace is meaningfully better than current practice.

### By day 90

- Run a bounded cohort comparison and retention check.
- Add one optional five-to-ten-minute spatial task only if the browser loop succeeds.
- Seek a departmental pilot or content partner with evidence in hand.

## Related themes

- [[Themes/Clinical Simulation Nursing and Interactive Learning]]
- [[Themes/Quant Probability and Decision Literacy]]
- [[Themes/Cybersickness Comfort Accessibility and Comparison]]
- [[Themes/Audio Visual Interaction and Facilitation Design]]
