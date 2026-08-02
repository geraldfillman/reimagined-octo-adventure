---
node_type: "health_review"
date: "2026-08-02"
company: "NextEra Energy"
ticker: "NEE"
period: "FY ending 2012-12-31"
process_quality: "stable"
outcome_quality: "improving"
market_response: "rewarding"
divergence_pattern: "none"
economic_health_score: 28
stewardship_score: 30
market_confirmation_score: 10
total_score: 68
red_flag_override: false
red_flags: []
next_checkpoint: "Q3 2026 10-Q + FY2025 10-K debt note: manual capex→FCF pull, EBIT/interest coverage from the debt footnote, receivables growth realigning with revenue, LT debt growth no longer outpacing EBITDA"
next_checkpoint_date: "2026-11-01"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_NEE]]"
related_theses: []
tags: [health-review]
---

# Company Health & Integrity Review — NextEra Energy

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/NEE - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker NEE` — link the pull note into `markers_pull`.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

Two machines under one holding company: **FPL**, a regulated Florida utility that earns an FPSC-allowed return on an ever-growing rate base billed monthly to roughly six million customer accounts (**verify count in FY2025 10-K**), and **NEER**, a development arm that builds wind, solar, storage, and gas/nuclear assets and sells the power under long-term contracts. The regulated machine supplies stable cash and cheap financing capacity; the development machine converts that capacity into contracted growth.

This matches the dossier `one_liner` ("Generates and delivers electricity in Florida and builds wind and solar plants that sell power under long-term contracts") — no barebones change; no dossier evolution-timeline update needed.

## 2. What changed in the company machine?

Grounded in [[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Facts_NEE]] (FY2025 vs FY2024 XBRL) and [[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Baseline_NEE]]:

- Positive:
    - Revenue $25.8B, **+9.8%**; operating income $8.3B, **+10.7%**; operating margin 32.1% (up ~30 bps) — the regulated/contracted machine grew and held its economics.
    - Cash up 89% to $2.8B; filing cadence clean — FY2025 10-K on file 2026-02-13, Q1/Q2 2026 10-Qs on time.
- Negative:
    - Long-term debt **+23.7% to $89.6B** in one year — the capital plan is being financed faster than EBITDA is growing (see §3).
    - Operating cash flow **−5.8% to $12.5B** while revenue rose ~10%; receivables **+20.4%** vs revenue +9.8% — working capital absorbed cash; cause not yet identified (storm-cost recovery timing? unbilled? — needs the 10-K cash-flow detail).
    - Continuous debt issuance through H1 2026: 424B5/424B2/FWP filings in Feb, Mar, and Jun 2026, plus a 424B3 in July — the financing treadmill is running hard (content unreviewed; filing-index facts only).
- Ambiguous:
    - Net income $6.8B, **−1.6%** despite operating income +10.7% — the gap sits below the operating line (interest expense? NEER mark-to-market? — not tagged in the pull; identify in the FY2025 income statement).
    - Unreviewed 8-Ks: 2026-05-18 (Items 1.01 + 7.01 and 5.02 + 8.01 — a material agreement and an officer/director change on the same day), 2026-03-10 (Item 5.02), 2026-07-08 (Item 5.03, governing-document amendment). Contents unknown — routed in §11, not interpreted here.
    - SC 13D/A amendment series through Nov 2024 — a 13D on a mega-cap utility is unusual; filer and stake not yet identified.

## 3. Financial health

Marker table: [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_NEE]] — rollup 🟢 3 · 🟡 0 · 🔴 1 · ⚪ 7. Profile ran as **general**; NEE is a utility, so every band below is re-read through the **§14 utilities lens** (regulated returns, rate base, capital-plan execution, financing needs) rather than the generic §5 distress bands. Note: the marker engine's revenue series rides a stale XBRL tag (latest FY end 2012-12-31 — hence this note's `period` frontmatter and two of the ⚪ gaps); the facts pull carries current values.

- Organic revenue: +9.8% FY2025 (facts pull). Not yet decomposed into customer growth × rate changes × NEER project additions (§17 Step 2) — needs the segment footnote. For a utility, the durable driver is rate-base growth plus contracted capacity additions, both still unmeasured here.
- Gross and operating margin: gross margin not computable (cost-of-revenue not tagged). Operating margin 32.1% vs 31.8% — allowed-return economics; stability is the point, expansion is capped by regulators. Benign reading: the machine is earning what it is allowed to earn.
- FCF conversion: ⚪ — capex not tagged, FCF not computable from the pull. Under the utilities lens this marker is the wrong question anyway: NEE's capex program has exceeded operating cash flow for years (**verify magnitude in the FY2025 cash-flow statement**), so **negative FCF is structural, not a defect** — the real questions are whether the spend lands in rate base / contracted assets earning allowed returns, and whether the financing of the gap stays orderly. OCF vs earnings 🟢 aligned; OCF/NI ≈ 183% (D&A-heavy regulated asset base — normal). The 🟡-shaped item hiding inside the 🟢: OCF fell 5.8% in a growth year.
- ROIC and incremental returns: not computed in the pull — explicit gap. The utility-appropriate proxy is FPL's earned vs allowed ROE and the spread of NEER contract returns over financing cost; pull from FY2025 10-K MD&A and the 2025 rate-case outcome (**verify allowed-ROE band**).
- Debt and liquidity: **net debt/EBITDA 6.07x 🔴 under the general band — reframed per §14: utilities normally carry higher leverage** because debt funds a regulated rate base with commission-sanctioned cost recovery and contracted NEER cash flows, not a cyclical earnings stream. 6.07x is not, by itself, a distress signal here. The honest §14 questions remain open, though:
    - *Financing needs*: LT debt grew 23.7% in one year and the 424B cadence is near-monthly — if rates stay high, the spread between allowed returns and the marginal cost of capital compresses, and the model strains. Benign reading: leverage is the designed funding mechanism for rate-base growth. Negative reading: debt is growing faster than EBITDA, coverage is unverifiable from the pull, and the plan assumes friendly capital markets indefinitely.
    - *Payout sustainability*: dividend + capex both externally co-financed (§6) — route to the MD&A financing plan.
    - *Storm/wildfire liabilities*: Florida hurricane exposure is structural; recovery runs through FPSC-approved surcharges (2022 Ian/Nicole precedent) — FY2025 storm costs/reserve **need pulling**.
    - *Rate-case outcomes*: FPL's 2025 base-rate proceeding governs 2026+ economics — outcome **needs pulling** from the FY2025 10-K.
    - EBIT/interest ⚪ "no material interest expense tagged — likely unlevered" is plainly a **tag gap, not reality** — an $89.6B-LT-debt filer is not unlevered. Compute coverage manually from the debt footnote (§11).
    - Holdco/opco structure matters: FPL first-mortgage bonds vs NEE Capital holdco paper vs project-level debt have very different claims — the 6.07x consolidated figure blends them; unpick in the debt note.
- Working capital: receivables +20.4% vs revenue +9.8% (facts pull; the marker's own series was period-misaligned ⚪). For a utility this is often benign (storm surcharge receivables, fuel-clause timing) — but that is a hypothesis to verify, not a conclusion. Inventory +9.3% ≈ revenue growth — unremarkable fuel/materials build.

## 4. Operational health

§14 utilities emphasis. Split into evidenced vs needs-pulling — no fabricated metrics:

- Customers and retention: captive regulated base; growth tracks Florida population/connections. Customer-count and usage trends **need pulling** (FY2025 10-K MD&A). Affordability is the retention analogue for a utility — bill trajectory vs the rate case, **needs pulling**.
- Product and innovation: NEER's development pipeline is the "product." Signed backlog size and mix (wind/solar/storage) **need pulling** from earnings 8-K exhibits (2026-07-24 and 2026-04-23 Item 2.02 filings are on file, unread).
- Employees and safety: nuclear fleet (Turkey Point, St. Lucie, Seabrook, Duane Arnold — **verify current fleet list**) makes safety/regulatory performance a first-order marker; no adverse events in the vault evidence. OSHA/safety stats **need pulling**.
- Suppliers and capacity: renewables build depends on panel/turbine/battery supply chains and grid-interconnection queues; no vault evidence either way — **needs pulling** (10-K risk factors, commitments footnote).
- Sector-specific KPIs (the §14 list):
    - *Rate base growth*: the core engine — value **needs pulling** (FPL MD&A).
    - *Capital plan execution*: indirectly evidenced — debt +$17.2B and continuous issuance say the plan is being funded; whether projects complete on time/budget **needs pulling**.
    - *Storm liabilities*: structural Florida exposure; FY2025 season impact and reserve balance **need pulling**.
    - *Regulatory relationships*: FPSC constructive historically (multi-year settlements); 2025 rate-case outcome **needs pulling**.
    - *Cost recovery / project completion*: no evidence in vault — **needs pulling**.

## 5. Stewardship and integrity

- Accounting quality: OCF (12.5B) comfortably confirms net income (6.8B) — cash-real earnings. NEE's reporting leans on **adjusted EPS excluding NEER mark-to-market hedge swings** — a reasonable convention, but build the exclusion history before trusting it (**verify five-year adjusted-vs-GAAP gap in earnings 8-Ks**). XBRL tag hygiene is weak (capex, interest expense, SBC, cost of revenue untagged; stale revenue tag) — a friction cost, not itself a red flag.
- Disclosure quality: filing cadence clean; no late filings, no restatements, no auditor changes in the baseline window. Auditor identity/tenure — **verify in FY2025 10-K**.
- Capital allocation: decade-plus of reinvestment at regulated/contracted returns instead of buybacks (buyback series empty since 2014) — internally consistent. Blemish: the affiliated yieldco (NextEra Energy Partners, renamed **XPLR Infrastructure**, which suspended common distributions in Jan 2025) shows the growth-vehicle model can shift pain to downstream investors — **verify current NEE/XPLR relationship and any residual obligations in the 10-K**.
- Executive compensation: CEO John Ketchum (since March 2022). Metrics, severance, grant structure — **verify in DEF 14A filed 2026-04-01**; say-on-pay result in the 2026-05-27 Item 5.07 8-K, unread.
- Board oversight: no adverse evidence in vault; composition/independence — **verify in DEF 14A**. Two unexplained Item 5.02 8-Ks (2026-03-10, 2026-05-18) must be identified before this line is trusted.
- Customer and employee treatment: FPL's residential bills have historically run below the national average and its storm-restoration record is strong (**verify both claims in current filings/FPSC data**). Open item: 2022 media investigations alleged FPL-linked consultants funded "ghost candidates" in 2020 Florida races; the company reported no violations found and no §7.3-qualifying enforcement appears in the baseline — **verify current status** before scoring this higher.
- Regulatory and legal record: no §7.3 hard-stop events in the vault evidence (no going-concern, restatement, auditor dispute, covenant breach, or fraud allegation on file). `red_flag_override: false`.

## 6. Shareholder distribution

- Dividends: paid in every year of the series (values not extracted — **pull per-share and total from the FY2025 cash-flow statement**). Management has publicly targeted roughly 10%/yr dividend-per-share growth (policy stated through 2026 — **verify current guidance**), on a ~three-decade raise streak (**verify count**).
- Honest framing for a capex-heavy utility: dividend/FCF ⚪ is not computable, and if it were, it would exceed 100% — **negative FCF is structural** here. The dividend is paid out of OCF while the capex gap is financed with debt and equity; that is the regulated-utility model, not a §5.7 violation *per se*. The §5.7 question that does bite: is the payout sustainable against **adjusted earnings and financing capacity** if rates stay high? Route to the MD&A financing plan (§11).
- Gross buybacks: none in the latest FY; none in over a decade — consistent with the reinvestment model.
- Net share-count change: diluted shares +0.6% YoY 🟢 — modest, but note NEE routinely issues equity (equity units/ATM programs; the 424B stream includes equity-linked paper — **verify mix**), so expect steady low-single-digit issuance, not shrinkage.
- Stock compensation: not tagged ⚪ — utilities are typically low-SBC; **verify in cash-flow statement**.
- Debt used for distributions: not directly — debt funds the capex program; but since all cash is fungible against a negative-FCF base, the dividend-growth policy is *de facto* financed. Watch it against OCF minus maintenance capex once capex is pulled.

## 7. Market behavior

- Relative performance: **+23.5% vs XLU +3.4% (+20.1pp) over 12 months** 🟢 — the market is rewarding NEE well ahead of its sector.
- Estimate revisions: **no pull — explicit gap.**
- Accumulation/distribution: **no volume/ownership pull — explicit gap** (§9.3 manual pass not done).
- Insider activity: Forms 4 filed Mar–Jul 2026 plus one Form 144 (2026-04-28) are in the baseline index, but direction/size unread — **needs the manual pass before calling it clean or concerning.**
- Ownership concentration: 13F/13G trend not pulled — **gap**. The 2024 SC 13D/A series (filer unidentified) is the open ownership question (§11).
- Short interest: **no pull — explicit gap.**

## 8. Process-versus-outcome classification

- Process quality: **stable** — the machine (rate base + contracted development) is running as designed and being funded; no evidence of process deterioration, but the operational proof points (rate base, backlog, execution) are unpulled, so "improving" is not yet earned.
- Current outcome quality: **improving** — revenue +9.8%, operating income +10.7%, margin up; the −1.6% net-income dip sits below the operating line and is unexplained but small.
- Market response: **rewarding** — +20.1pp over XLU in 12 months.
- Primary divergence: **none** — process, results, and market point the same way. The watch item inside the alignment: the market is paying for growth while the financing bill (debt +23.7%, OCF −5.8%) grows faster than the earnings that service it.

### Divergence sentence (§17 Step 7)

> The company's operating process is `stable`, reported results are `improving`, and the market is pricing `more` future success because `electricity-demand growth and the renewables backlog are being extrapolated, while the widening debt-financed capex bill is being treated as routine utility funding — which it is only while capital markets stay friendly`.

## 9. Good-faith evidence

- A decade-plus of reinvesting at regulated/contracted returns instead of buying back stock (buyback series empty since 2014) — present-day distributions foregone to build durable rate base.
- Liquidity built while spending: cash +89% to $2.8B in a year of record capex financing — the company is not running the tank dry to hit the plan.
- Clean filing hygiene: on-time 10-K/10-Qs, no restatements or auditor events anywhere in the baseline window — disclosure discipline maintained with zero §7.3 noise.
- Storm-restoration capability at FPL is a real, repeatedly exercised competence that costs money between storms (**verify FY2025 specifics**) — infrastructure hardening spend is the classic §10 "present cost to protect the franchise."

## 10. Extraction or bad-faith risk

- **Dividend growth policy against structurally negative FCF**: a ~10%/yr payout-growth commitment funded, in effect, by future financing — the cost is shifted onto tomorrow's capital-market conditions. Legal, conventional, and fine until it isn't (§12: "issuing debt while distributing cash").
- **Affiliated-vehicle complexity**: the XPLR/NEP structure let NEE monetize assets to a yieldco whose common holders later absorbed a distribution suspension (Jan 2025) — a documented case of downstream investors bearing the adjustment. Verify what obligations still connect NEE to XPLR.
- **Regulatory-political entanglement in Florida**: the 2022 FPL political-spending reporting (no enforcement on file) plus the sheer dependence on FPSC goodwill means part of the moat is a relationship — a return channel per §12 if political weather turns (rate-case outcomes, affordability backlash).
- **Working-capital drift**: receivables +20.4% vs revenue +9.8% with OCF down — probably surcharge/fuel-clause timing, but if it persists it manufactures earnings ahead of cash; investigate before excusing it.

## 11. EDGAR follow-up

Routed per the §15 table; log meaningful changes as Intel Findings.

- Filing: **FY2025 10-K** (filed 2026-02-13, on file in baseline).
- Section or exhibit: **debt footnote + maturity schedule + guarantees** (holdco NEE Capital vs FPL first-mortgage vs project debt), then **MD&A liquidity & capital resources**, then **cash-flow statement** (capex line), then **commitments/contingencies** (storm reserve).
- Finding: net debt/EBITDA 6.07x with LT debt +23.7% YoY; interest expense and capex untagged in XBRL; dividend/FCF uncomputable.
- Possible meaning: benign — designed leverage funding rate-base growth with orderly maturities; adverse — refinancing wall + high rates compressing the allowed-return spread while the dividend commitment forces issuance.
- Next investigation:
    1. Maturity ladder + fixed/floating mix + computed EBIT/interest from the debt note (routes the 🔴).
    2. Manual capex → FCF → dividend coverage vs the MD&A financing plan (routes the ⚪ payout markers).
    3. Segment footnote: FPL earned ROE vs allowed, NEER backlog — fills §4.
    4. **DEF 14A (2026-04-01)**: comp metrics, board, related parties; say-on-pay result in the 2026-05-27 8-K.
    5. **8-Ks 2026-05-18 (Items 1.01/5.02) and 2026-03-10 (Item 5.02)**: identify the agreement and the personnel changes.
    6. **SC 13D/A series (2024)**: identify filer and stake.
    7. Receivables detail in the 10-K working-capital discussion (routes the +20.4% drift).

## 12. Score

§16 rubrics; gaps score conservatively — a gap is not a zero, but it is never a benefit of the doubt.

| Block | Score | Max |
|---|---:|---:|
| Economic health | 28 | 40 |
| Stewardship and integrity | 30 | 40 |
| Market confirmation | 10 | 20 |
| **Total** | **68** | 100 |

- Economic health 28/40: revenue/demand 6/8 (+9.8%, regulated+contracted, undecomposed) · margins 6/8 (32.1%, stable by design) · cash conversion 6/8 (OCF confirms NI, but OCF −5.8% unexplained) · balance sheet 5/8 (6.07x normal-for-sector via §14, but debt +23.7% with coverage unverified) · returns on capital 5/8 (allowed-ROE economics, nothing computed — gap).
- Stewardship 30/40: accounting transparency 6/8 (cash-real earnings; adjusted-EPS history unbuilt) · capital allocation 5/8 (rational reinvestment; XPLR blemish; financed dividend policy) · governance/comp 6/8 (conventional; DEF 14A unread) · stakeholder treatment 6/8 (bills/restoration record strong; 2022 political-spending item unresolved) · strategic consistency 7/8 (same machine, one decade-plus).
- Market confirmation 10/20: relative price 4/5 (+20.1pp vs XLU; revisions unknown) · accumulation/ownership 2/5 (gap) · valuation vs conservative economics 2/5 (gap) · catalyst asymmetry 2/5 (demand narrative likely already priced; unquantified).
- Total 68 → **mixed band (55–69)**: the machine looks healthy; the score is held down honestly by unpulled evidence (ownership, valuation, rate base, backlog, coverage) rather than by documented damage.
- Red-flag override: **false** — no §7.3 event in the vault evidence.

## 13. Falsifiable thesis

- Bull case: FPL rate-base growth plus NEER's contracted backlog compound earnings high-single-digit for years; 6.07x leverage is the funding mechanism, not distress; electricity-demand growth (population + electrification + data centers) extends the runway, and the +20pp beat vs XLU is the market correctly re-rating a growth utility.
- Bear case: debt is compounding faster than EBITDA; if rates stay high the allowed-return-minus-cost-of-capital spread compresses, the ~10% dividend-growth commitment forces equity issuance at unfriendly prices, and one bad hurricane season or adverse rate-case outcome exposes how little slack a 6x-levered, negative-FCF model carries.
- What would prove each wrong: bull breaks if the FY2025/FY2026 debt notes show EBIT/interest trending below ~2.5x, payout exceeding adjusted earnings, or the rate case cutting allowed ROE; bear breaks if FY2026 shows debt growth back at-or-below EBITDA growth, dividend covered by OCF minus maintenance capex, and the backlog still expanding.
- Next checkpoint and date: **Q3 2026 10-Q (expected late Oct 2026 on prior cadence) plus the FY2025 10-K debt-note pass** — manual capex→FCF computed, interest coverage computed, receivables growth realigned with revenue, LT debt growth no longer outpacing EBITDA → `next_checkpoint_date: 2026-11-01`.

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
