---
node_type: "health_review"
date: "2026-08-02"
company: "NVIDIA"
ticker: "NVDA"
period: "FY ending 2026-01-25"
process_quality: "improving"
outcome_quality: "improving"
market_response: "ignoring"
divergence_pattern: "good-process-bad-stock"
economic_health_score: 31
stewardship_score: 30
market_confirmation_score: 9
total_score: 70
red_flag_override: false
red_flags: []
next_checkpoint: "Q2 FY2027 10-Q: trailing inventory-vs-cost-of-sales divergence narrows below +10pp with no step-up in obsolescence provisions; FY2026 goodwill addition (~$15.6B) identified and assessed"
next_checkpoint_date: "2026-08-31"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_NVDA]]"
price_at_review: 200.75
reconsider_price_low: 160.6
reconsider_price_high: 250.94
related_theses: []
tags: [health-review]
---

# Company Health & Integrity Review — NVIDIA

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/NVDA - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker NVDA` — link the pull note into `markers_pull`.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

Designs computer chips (GPUs and rack-scale systems) and the software that runs on them, which customers — above all a handful of hyperscale data-center operators — pay for to create graphics and train and run artificial intelligence. This matches the dossier `one_liner` ("Designs computer chips and software that help computers create graphics and run artificial intelligence"); the machine has not changed, but its mix keeps tilting toward AI data-center systems, so no dossier evolution-timeline update is required yet.

## 2. What changed in the company machine?

Grounded in [[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Facts_NVDA]] (FY2026 vs FY2025 XBRL 10-K facts) and [[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Baseline_NVDA]]:

- Positive:
  - Revenue $130.5B → $215.9B (+65.5%); net income $72.9B → $120.1B (+64.7%); FCF $60.9B → $96.7B.
  - R&D $12.9B → $18.5B (+43.2%) — the machine's core reinvestment line keeps scaling.
  - Deferred revenue (current) $837M → $1.4B (+64.8%) — customers paying ahead, in line with revenue.
  - Long-term debt $8.5B → $7.5B (−11.7%); diluted shares 24.8B → 24.5B (−1.2%).
- Negative:
  - Gross margin 75.0% → 71.1% (−3.9pp); operating margin 62.4% → 60.4% (−2.0pp). Cause (mix vs pricing) unverified.
  - Inventory $10.1B → $21.4B (+112.3%) vs derived cost of sales $32.6B → $62.4B (+91.4%): the +20.9pp 🔴 divergence in the marker pull.
- Ambiguous:
  - Goodwill $5.2B → $20.8B (+$15.6B, +301.5%) — significant acquisition activity closed in FY2026; target(s), price allocation, and rationale not yet identified in the vault. Route to filings (§11).
  - June 2026 debt offering: 424B5 (2026-06-15 and 2026-06-17) + FWP (2026-06-15) off the 2025 S-3ASR, with an 8-K (Items 8.01/9.01, 2026-06-18) whose timing is consistent with the offering's closing — raised while sitting on net cash. Use of proceeds unverified.
  - Capex $3.2B → $6.0B (+86.7%) — fastest-growing line, but still only ~2.8% of revenue (fabless model).
  - Receivables $23.1B → $38.5B (+66.8%) — only +1.3pp above revenue growth (🟢 marker), but a very large absolute balance concentrated in few customers.
  - NVIDIA itself files quarterly 13F-HRs (latest 2026-05-15 for Q1 2026) — it runs a reportable public-equity portfolio; holdings and any customer overlap not yet reviewed.

## 3. Financial health

Marker table: [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_NVDA]] — rollup 🟢 8 · 🟡 1 · 🔴 1 · ⚪ 1. Every marker interpreted below (§5 bands; benign vs negative reading).

- Organic revenue: +65.5% to $215.9B (§5.1 constructive on growth rate). No marker computed for concentration or price-vs-volume split — organic/unit decomposition is an explicit gap; check the FY2026 10-K segment and concentration notes.
- Gross and operating margin: 71.1% / 60.4%, both down (−3.9pp / −2.0pp). Benign reading: mix shift toward lower-margin rack-scale systems and new-platform ramp costs (§5.2 "temporary compression from a documented investment" — the documentation is what needs checking). Negative reading: early discounting to hold volume, which alongside the inventory build would be the classic §5.3 excess pattern. Not yet distinguishable from XBRL alone.
- FCF conversion: 0.83 cumulative FCF/NI over ≤5 FY 🟢 (above the 0.80 constructive band); single-year OCF/NI 85.6% (87.9% prior). Operating cash flow vs earnings trend: aligned 🟢. Earnings are real cash, not accruals.
- ROIC and incremental returns: no marker computed — explicit gap. Directionally, $130.4B operating income on ~$6B capex and modest invested capital is extreme; but $15.6B of new goodwill means the next incremental-return calculation must be reconstructed including acquisition capital (§5.4).
- Debt and liquidity: net cash 🟢 (Net debt/EBITDA marker); LT debt $7.5B declining; cash $10.6B plus short-term investments (series present through FY2025). EBIT/interest ⚪ n/a — interest expense last XBRL-tagged FY2024; likely immaterial, but verify in the FY2026 10-K debt note, especially after the June 2026 notes offering.
- Working capital:
  - Receivables divergence +1.3pp 🟢 — collections keep pace with reported revenue; argues against channel stuffing on the receivables side.
  - Inventory divergence +20.9pp 🔴 — the one concern marker. Derived inventory days ~113 → ~125 (ending-balance basis). Benign reading: deliberate build ahead of the next-generation data-center platform ramp (Rubin, announced on the public 2025 roadmap) plus prepositioning of long-lead HBM/advanced-packaging supply — supported by receivables and deferred revenue tracking demand. Negative reading: demand cooling at the margin (China export losses, hyperscaler digestion) leaving excess stock, with the −3.9pp gross-margin decline as the first discounting symptom. The two readings are distinguished by obsolescence provisions, purchase commitments, and turns — routed in §11.

## 4. Operational health

§14 semiconductors/AI-infrastructure emphases. Evidence status marked per item — no fabricated metrics.

- Customers and retention (hyperscaler concentration): the FY2025 10-K disclosed direct customers individually above 10% of revenue (public record); the FY2026 concentration note has not been read — **pull needed**. Receivables of $38.5B concentrated in few buyers is the balance-sheet expression of this risk.
- Product and innovation (design wins, qualification cycles): no vault evidence on design wins, qualification pipelines, or developer-ecosystem metrics. CUDA ecosystem lock-in is the qualitative moat claim — needs support from the 10-K business section. **Pull needed.**
- Employees and safety: no vault evidence; no 8-K suggests workforce events. Explicit gap.
- Suppliers and capacity (foundry/packaging/memory bottlenecks, prepayments): no purchase-commitment or prepayment figures pulled. The +112% inventory build cannot be classified as strategic prepositioning vs excess without the FY2026 10-K commitments footnote. **Pull needed — highest priority.**
- Sector-specific KPIs:
  - End-demand vs channel inventory: own-balance-sheet inventory divergence +20.9pp is the proxy flag; actual channel/sell-through data absent. **Pull needed.**
  - Export controls: escalating US controls on advanced AI chips to China are documented public record through 2025 (Oct 2022 and Oct 2023 rules; April 2025 H20 license requirement with an associated multi-billion-dollar charge; an August 2025 license arrangement for China H20 sales) — verify amounts and current status in the FY2026 10-K/Q1 FY2027 10-Q risk factors and MD&A rather than relying on press memory.
  - Capex intensity: $6.0B (~2.8% of revenue) — intensity sits at foundries and hyperscaler customers, not NVDA; watch whether the June 2026 debt raise funds a change in this model.
  - Power availability, memory supply: no vault evidence. Explicit gap.

## 5. Stewardship and integrity

Well-established public facts only; uncertain items marked.

- Accounting quality: FCF conversion 0.83 and aligned OCF trend 🟢; receivables in line 🟢. No restatement, material weakness, or auditor dispute evidenced in the baseline. Minor quirk: interest expense untagged in XBRL since FY2024. Auditor identity and tenure — verify in the FY2026 10-K.
- Disclosure quality: standard XBRL tagging, timely filings (10-K filed 2026-02-25, one month after FY end). Open item: $15.6B goodwill addition with no acquisition identified in the vault's 8-K list — either disclosure was made in a filing not yet read or the deals were individually sub-threshold; check the acquisition footnote.
- Capital allocation: R&D funded first ($18.5B, +43.2%); buybacks exceed issuance (net count −1.2%); token dividend (~1% of FCF); debt reduced through FY-end. Two unassessed moves: the FY2026 acquisition spend behind the goodwill jump, and the June 2026 notes offering while net cash.
- Executive compensation: Jensen Huang is co-founder and CEO since 1993 (public record) — unusually long founder alignment. Grant structure, performance conditions, and 2026 pay levels — verify in DEF 14A (filed 2026-05-12).
- Board oversight: DEF 14A filed 2026-05-12; annual meeting 2026-06-24 with vote results in the 8-K Item 5.07 (2026-06-30) — read for say-on-pay and director support levels; verify in DEF 14A. Four Item 5.02 8-Ks in 2026 (03-06, 04-27, 05-08, 07-02) plus a Form 3 (2026-07-15) indicate officer/director changes not yet identified — read them (§11).
- Customer and employee treatment: no complaints, litigation, or safety events evidenced in the baseline. Explicit gap, not a clean bill.
- Regulatory and legal record: export-control compliance regime is the dominant documented constraint (public record through 2025). Antitrust scrutiny (China SAMR investigation opened Dec 2024; reported US inquiries) is public record — verify current status in the FY2026 10-K legal-proceedings note. No §7.3 hard-stop event documented.

## 6. Shareholder distribution

From the marker pull and facts note (§5.6–5.7):

- Dividends: ~1% of FCF 🟢 — token payout, appropriate for a company with high-return reinvestment options.
- Gross buybacks: exceed issuance — buyback authorization sizes are public record (large multi-tens-of-billions programs authorized 2023 and 2025); remaining capacity — verify in the latest 10-Q.
- Net share-count change: −1.2% YoY 🟢 (24.8B → 24.5B diluted) — the buyback is a real return, not just SBC recycling.
- Stock compensation: $6.4B, +34.8% YoY but only ~3.0% of revenue 🟢 (below the 5% low-concern line); growing slower than revenue.
- Debt used for distributions: none evidenced through FY2026 (net cash, LT debt down). The June 2026 424B5/FWP offering post-dates FY-end — confirm use of proceeds before ruling this out for FY2027.

## 7. Market behavior

§9 — evidence about expectations and ownership, not proof of business quality.

- Relative performance: 12-month return +15.6% vs XLK +36.4% = **−20.9pp** 🟡. Underperformance ≥20pp over 12 months requires a specific explanation (§9.2). Candidate explanations — expectations already embedded years of AI-capex growth; the inventory/margin signals; export-control overhang — none yet confirmed by data.
- Estimate revisions: **no pull in vault — explicit gap.** Needed to separate "multiple compression" from "estimates falling".
- Accumulation/distribution: **no volume/flow pull — explicit gap.**
- Insider activity: cluster of Forms 4 filed 2026-06-29 (transactions 2026-06-25, the day after the annual meeting) across many separate filers — pattern consistent with routine annual director grants, but transaction codes unread — verify before treating as benign. Form 3 on 2026-07-15 = new insider.
- Ownership concentration: 13G/13F holder aggregation **not pulled — explicit gap.** (The 13F-HRs in the baseline are NVIDIA's own portfolio filings, not holder filings.)
- Short interest: **no pull — explicit gap.**

## 8. Process-versus-outcome classification

- Process quality: **improving** — revenue, cash conversion, R&D scale, and balance sheet all strengthened; the open inventory and margin questions are flags, not yet demonstrated deterioration.
- Current outcome quality: **improving** — record revenue, net income, and FCF, all cash-confirmed.
- Market response: **ignoring** — +15.6% absolute is positive, but −20.9pp against its own sector benchmark means the market is not crediting the reported improvement relative to the opportunity set.
- Primary divergence: Pattern A (§13) — good process, lagging stock. The §13-A questions (are unit economics improving, is the balance sheet strong enough, what milestone converts investment to cash) map directly onto the inventory-divergence checkpoint in §13 below.

### Divergence sentence (§17 Step 7)

> The company's operating process is `improving`, reported results are `improving`, and the market is pricing `less` future success because expectations already embed years of flawless AI-capex growth while the unexplained +20.9pp inventory divergence, −3.9pp gross-margin slide, and export-control overhang give the market reasons to doubt the demand's duration.

## 9. Good-faith evidence

- R&D raised 43.2% to $18.5B — a present income-statement cost carried to protect the architecture-and-software franchise (XBRL facts).
- Distributions kept subordinate to reinvestment: token dividend (~1% of FCF), buybacks funded from FCF with no leverage through FY-end, and net share count reduced despite $6.4B SBC (marker pull).
- Debt reduced (−11.7% LT debt) during the strongest earnings year on record rather than levering up (XBRL facts).
- Compliance with successive export-control regimes at documented multi-billion-dollar revenue cost (public record through 2025; amounts to be verified in filings) — absorbing a present cost rather than routing around US policy.

## 10. Extraction or bad-faith risk

- The +20.9pp inventory divergence paired with the −3.9pp gross-margin decline is the classic early signature of demand-cooling excess (§5.3); if provisions are being held down while stock builds, reported margins are overstated. Not demonstrated — routed in §11.
- $15.6B of new goodwill with no identified target in the vault: acquisition accounting can obscure organic economics via purchase-price allocation and earnouts (§5.4, §15 "Large acquisition"). Unassessed.
- Circularity risk: NVIDIA's own 13F-HR filings prove a reportable public-equity portfolio; stakes in companies that are also customers or ecosystem partners can round-trip demand. Holdings unread — verify overlap before weighting.
- Raising debt (June 2026 424B5/FWP) while net cash and generating ~$97B FCF is unexplained; if proceeds fund distributions or vendor financing rather than operations, that changes the §5.7 read. Verify use of proceeds.

## 11. EDGAR follow-up

Routing per §15; log meaningful changes as Intel Findings.

- Filing: **FY2026 10-K** (filed 2026-02-25) — inventory footnote, purchase commitments, MD&A; plus **Q1 FY2027 10-Q** (filed 2026-05-20) for the post-FY trend.
  - Finding: inventory +112.3% vs cost of sales +91.4% (🔴 +20.9pp).
  - Possible meaning: pre-ramp/supply prepositioning (benign) vs demand-cooling excess (negative).
  - Next investigation: obsolescence provisions and write-down history, purchase-commitment totals, inventory turns; §15 row "Revenue quality concern" extended to inventory.
- Filing: **FY2026 10-K acquisition footnote + any related 8-K/S-4** — identify the source of the $15.6B goodwill increase; §15 row "Large acquisition": purchase-price allocation, synergy promises, earnouts.
- Filing: **424B5 (2026-06-15/17), FWP (2026-06-15), 8-K 2026-06-18 (8.01/9.01)** — §15 row "New capital raise": principal, tenor, use of proceeds, covenant needs.
- Filing: **8-Ks Item 5.02 (2026-03-06, 04-27, 05-08, 07-02) + Form 3 (2026-07-15)** — §15 row "CFO or auditor change": identify which officers/directors changed; cross-check DEF 14A.
- Filing: **DEF 14A (2026-05-12) + 8-K 5.07 (2026-06-30)** — compensation structure, related parties, say-on-pay and director vote outcomes.
- Filing: **FY2026 10-K debt note** — resolve the ⚪ EBIT/interest gap (interest expense untagged since FY2024).
- Filing: **FY2026 10-K concentration note + risk factors** — hyperscaler >10% customers; year-over-year risk-factor wording diff on export controls.
- Non-EDGAR pulls for the 🟡 §9.2 flag: estimate-revision history, 13F holder aggregation, short interest — currently explicit gaps.

## 12. Score

§16 rubrics; one-line justifications. Copied to frontmatter.

| Block | Score | Max |
|---|---:|---:|
| Economic health | 31 | 40 |
| Stewardship and integrity | 30 | 40 |
| Market confirmation | 9 | 20 |
| **Total** | **70** | 100 |

- Economic health 31/40 — revenue/demand 7/8 (+65.5% cash-confirmed growth; concentration unverified); margins 6/8 (elite level, but −3.9pp GM unexplained); cash conversion 5/8 (0.83 conversion 🟢 docked for the 🔴 inventory divergence); balance sheet 7/8 (net cash; interest-coverage data gap, June debt raise unexplained); returns on capital 6/8 (extraordinary on the face, but no ROIC pull and $15.6B unassessed goodwill).
- Stewardship 30/40 — accounting transparency 6/8 (clean markers; goodwill and stale interest tag open); capital allocation 6/8 (R&D-first, real net buyback; acquisition and debt raise unassessed); governance/comp 6/8 (long founder alignment; DEF 14A and four 5.02 8-Ks unread); customer/employee/supplier treatment 5/8 (largely an evidence gap); strategic consistency 7/8 (decade-consistent platform strategy, sustained R&D).
- Market confirmation 9/20 — relative price/estimates 2/5 (−20.9pp vs XLK; no revision data); accumulation/ownership 2/5 (no pull — neutral by default); valuation vs conservative economics 2/5 (no valuation work in vault); catalyst/expectation asymmetry 3/5 (a year of relative underperformance has lowered the embedded bar while reported results grew ~65%).
- Red-flag override: **false** — no documented §7.3 event (no fraud allegation, going-concern language, auditor dispute, restatement, covenant breach, or safety failure in the evidence base). Total 70 = "generally healthy with identifiable weaknesses" (§16 bands).

## 13. Falsifiable thesis

- Bull case: the inventory build is deliberate prepositioning of long-lead supply ahead of the next platform ramp; demand is intact (receivables divergence only +1.3pp, deferred revenue +64.8%), the margin dip is systems mix, and the −20.9pp relative underperformance is expectation reset creating asymmetry.
- Bear case: the build is demand cooling in disguise — China export losses and hyperscaler digestion leaving excess stock — with the gross-margin slide as the first discounting symptom and $15.6B of goodwill as bought growth papering over a decelerating core.
- What would prove each wrong: bull is broken if the trailing inventory-vs-cost-of-sales divergence stays above +10pp for two more quarters **and** obsolescence provisions step up **and** gross margin falls below ~68%; bear is broken if the divergence normalizes below +10pp with gross margin stabilizing at ≥70% and no unusual provision activity.
- Next checkpoint and date: **Q2 FY2027 10-Q** (period ends ~2026-07-26; prior-year Q2 10-Q filed 2025-08-27, so expect it by ~2026-08-31) — check the inventory divergence and provisions; in parallel, close the goodwill identification from the FY2026 10-K. Copied into `next_checkpoint` / `next_checkpoint_date`.

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
