---
node_type: "company_intel"
company: "Air Products & Chemicals, Inc."
ticker: "APD"
cik: "0000002969"
sector: "Industrial Inorganic Chemicals"
fiscal_year_end: "09-30"
research_status: "Scaffold"
confidence: "Low"
overall_state: "yellow"
one_liner: ""
last_updated: "2026-08-02"
clarity_score:
economic_quality_score:
governance_score:
disclosure_score:
evolution_score:
core_entities: ["[[APD]]"]
related_theses: []
tags: [company-intel]
---

# Air Products & Chemicals, Inc. â€” Company Dossier

> Method: [[04_Reference/EDGAR_Company_Deconstruction_Framework]] Â· Board: [[00_Dashboard/Company Intel Board]]
> `research_status`: Scaffold â†’ Card â†’ Baseline â†’ Active â†’ Archived
> `overall_state`: green (clear, improving) Â· yellow (needs proof) Â· orange (description outrunning evidence) Â· red (narrative conflicts with filings)

---

# Part A â€” Bare-Bones Company Card

Complete this before reading analyst opinions. When done, set `research_status: Card`.

## 1. Simplest Description

### One Sentence (explain it to a ten-year-old)
<!-- What is sold, who pays, what the company must repeatedly do, why the customer uses it. Copy into `one_liner` frontmatter. -->

### One Paragraph
<!-- Inputs, transformation, output, customer, payment. -->

### What Would Disappear If the Company Disappeared?
<!-- The real function, not the brand. -->

## 2. The Company Machine

- **Capital source:**
- **Inputs:**
- **Transformation:**
- **Output:**
- **Customer / user / payer:**
- **Collection method:**
- **Required reinvestment:**
- **Owner distributions:**

## 3. Revenue Engine

| Stream | Who Pays? | Why Do They Pay? | Pricing Unit | Recurring? | Margin | Growth Driver | Main Risk |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

- Which stream funds the others?
- Which stream has the highest incremental margin?
- Which stream would disappear first in a recession?

## 4. Cost Engine

| Cost | Fixed / Variable / Step-Fixed | Driver | Passable to Customers? | Strategic or Wasteful? | Filing Location |
|---|---|---|---|---|---|
| | | | | | |

- Which cost rises before revenue appears?
- Which cost is essential to the moat?
- Which costs are capitalized instead of expensed?

## 5. Assets and Capabilities

### Critical Assets
1.

### Reusable Capabilities
1.

### Assets That Look Valuable but May Be Replicable
1.

## 6. Dependencies and Bottlenecks

| Dependency | Type | Importance | Replaceability | Evidence | Trigger |
|---|---|---|---|---|---|
| | | | | | |

### Current Bottleneck
<!-- If demand doubled tomorrow, what breaks first? Constraint, moat, hidden cost, or catalyst? -->

## 7. Flywheel

```text
Step 1
  â†“
Step 2
  â†“
Step 3
  â†“
Step 1 strengthens
```

## 8. Reverse Flywheel

```text
Weakness
  â†“
Customer response
  â†“
Economic deterioration
  â†“
Reduced reinvestment
  â†“
Wider weakness
```

## 9. Control and Decision Rights

- **Voting control / share classes:**
- **Top holders (active vs. passive):**
- **Insider alignment:**
- **Bank / lender influence (covenants, facilities):**
- **Board structure:**
- **Who can force, stop, delay, finance, or veto a major strategic move?**

## 10. Simplest Bull / Bear Case

### Bull (what improves the machine)
<!-- -->

### Bear (what damages or replaces the machine)
<!-- -->

### Evidence Still Needed
1.
2.
3.

---

# Part B â€” Filing Baseline and Evolution

When the baseline package is reviewed, set `research_status: Baseline`.

## 11. Evolution Timeline

| Period | Simplest Accurate Description | What Changed? | Evidence | +/âˆ’/Mixed | Evolution Score |
|---|---|---|---|---|---|
| Founding / S-1 | | | | | |
| Five years ago | | | | | |
| Prior year | | | | | |
| Current | | | | | |
| Emerging next state | | | | | |

## 12. Filing Baseline

> Generate the filing inventory with `node run.mjs edgar baseline --ticker APD` â€” link the latest pull note here.

- **Latest baseline pull:**
- **10-K reviewed:** <!-- date, key findings, changed risks, key footnotes, controls, auditor -->
- **10-Qs reviewed:**
- **8-K timeline:**

| Date | Item / Event | Meaning | Next Step |
|---|---|---|---|
| | | | |

- **Proxy (DEF 14A):** <!-- board, compensation metrics, ownership, related parties, vote concerns -->
- **Insider filings (3/4/5, 144):**
- **13D / 13G:**
- **13F ownership trend:**
- **Registration statements / offerings:**
- **Material exhibits opened:**

## 13. Financial Skeleton

> Generate from XBRL with `node run.mjs edgar facts --ticker APD` â€” link the latest pull note here, then interpret.

| Metric | Current | Prior | Direction | Explanation | Concern |
|---|---:|---:|---|---|---|
| Revenue | | | | | |
| Gross margin | | | | | |
| Operating margin | | | | | |
| Operating cash flow | | | | | |
| Capex | | | | | |
| Free cash flow | | | | | |
| Receivables | | | | | |
| Inventory | | | | | |
| Deferred revenue | | | | | |
| Debt | | | | | |
| SBC | | | | | |
| Diluted shares | | | | | |

## 14. Scores

Score with the rubrics in [[04_Reference/EDGAR_Company_Deconstruction_Framework]] Â§12, then copy into frontmatter.

| Score | Value | Max | Notes |
|---|---:|---:|---|
| Company clarity | | 25 | |
| Economic quality | | 35 | |
| Governance and control | | 35 | |
| Disclosure integrity | | 35 | |
| Evolution (latest initiative) | | 50 | |

## 15. Findings Log

<!-- One note per finding from 03_Templates/Intel_Finding. Dataview below lists them automatically. -->

```dataview
TABLE date, classification, thesis_impact, machine_effect
FROM "13_Company_Intel/Findings"
WHERE ticker = this.ticker
SORT date DESC
```

## 16. Thesis and Monitoring Triggers

### What Is Already Reflected in the Price?
<!-- -->

### What Would Break the Thesis?
<!-- -->

### What Would Confirm the Thesis?
<!-- -->

### Monitoring Triggers (observable, not vibes)
<!-- e.g. segment growth < X%, capex outgrows related revenue N quarters, customer concentration > Y%, risk wording moves hypothetical â†’ actual, 13D amendment -->
1.
2.
3.

## 17. Next Research Queue

1.
2.
3.

## 18. Source Log

| Date Reviewed | Filing | Period / Event Date | Why It Matters | Key Sections | Open Questions |
|---|---|---|---|---|---|
| | | | | | |
