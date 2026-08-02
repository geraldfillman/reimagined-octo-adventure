---
node_type: "health_review"
date: ""
company: ""
ticker: ""
period: ""
process_quality: ""
outcome_quality: ""
market_response: ""
divergence_pattern: ""
economic_health_score:
stewardship_score:
market_confirmation_score:
total_score:
red_flag_override: false
red_flags: []
next_checkpoint: ""
next_checkpoint_date: ""
markers_pull: ""
price_at_review:
reconsider_price_low:
reconsider_price_high:
related_theses: []
tags: [health-review]
---

# Company Health & Integrity Review — {{company}}

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/{{ticker}} - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker {{ticker}}` — link the pull note into `markers_pull`.
> Price band: `edgar triggers --set` fills default reconsideration levels (§9.4) — override with valuation-informed ones; `edgar triggers` checks them. Breach = re-review, never a trade signal.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

<!-- One-sentence economic description (§2). Check against the dossier one_liner — if it changed, update the dossier evolution timeline. -->

## 2. What changed in the company machine?

- Positive:
- Negative:
- Ambiguous:

## 3. Financial health

<!-- §5 bands. Paste or link the computed marker table from the edgar health pull note; investigate anything outside "constructive". -->

- Organic revenue:
- Gross and operating margin:
- FCF conversion:
- ROIC and incremental returns:
- Debt and liquidity:
- Working capital:

## 4. Operational health

<!-- §6 markers + §14 sector-specific emphases. -->

- Customers and retention:
- Product and innovation:
- Employees and safety:
- Suppliers and capacity:
- Sector-specific KPIs:

## 5. Stewardship and integrity

<!-- §7 governance markers, §8 accounting markers. -->

- Accounting quality:
- Disclosure quality:
- Capital allocation:
- Executive compensation:
- Board oversight:
- Customer and employee treatment:
- Regulatory and legal record:

## 6. Shareholder distribution

<!-- §5.6–5.7. Net everything against dilution. -->

- Dividends:
- Gross buybacks:
- Net share-count change:
- Stock compensation:
- Debt used for distributions:

## 7. Market behavior

<!-- §9. Stock behavior is evidence about expectations and ownership, not proof of business quality. -->

- Relative performance:
- Estimate revisions:
- Accumulation/distribution:
- Insider activity:
- Ownership concentration:
- Short interest:

## 8. Process-versus-outcome classification

<!-- §3 dimensions. Copy into frontmatter: process_quality / outcome_quality / market_response (improving|stable|deteriorating · rewarding|ignoring|punishing). -->

- Process quality:
- Current outcome quality:
- Market response:
- Primary divergence:

### Divergence sentence (§17 Step 7)

> The company's operating process is `[improving/stable/deteriorating]`, reported results are `[improving/stable/deteriorating]`, and the market is pricing `[more/less/about the same]` future success because `[reason]`.

## 9. Good-faith evidence

<!-- §10 — actions that imposed present costs to protect or build the franchise. -->

## 10. Extraction or bad-faith risk

<!-- §11–12 — actions that shift costs, obscure economics, or depend on weak accountability. -->

## 11. EDGAR follow-up

<!-- Route each open question with the §15 table. Log meaningful changes as Intel Findings. -->

- Filing:
- Section or exhibit:
- Finding:
- Possible meaning:
- Next investigation:

## 12. Score

<!-- §16 rubrics. Copy the four numbers into frontmatter. Red-flag override (§7.3) caps the rating until investigated. -->

| Block | Score | Max |
|---|---:|---:|
| Economic health | | 40 |
| Stewardship and integrity | | 40 |
| Market confirmation | | 20 |
| **Total** | | 100 |

- Red-flag override:

## 13. Falsifiable thesis

- Bull case:
- Bear case:
- What would prove each wrong:
- Next checkpoint and date: <!-- copy into next_checkpoint / next_checkpoint_date frontmatter -->

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
