---
node_type: "health_review"
date: "2026-08-02"
company: "Eli Lilly"
ticker: "LLY"
period: "FY ending 2025-12-31"
process_quality: "improving"
outcome_quality: "improving"
market_response: "rewarding"
divergence_pattern: "none"
economic_health_score: 27
stewardship_score: 29
market_confirmation_score: 10
total_score: 66
red_flag_override: false
red_flags: []
next_checkpoint: "Q3-2026 10-Q: inventory divergence < +20pp and receivable divergence < +10pp with no obsolescence charge; FY2025 10-K inventory composition and capacity commitments pulled first"
next_checkpoint_date: "2026-10-30"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_LLY]]"
related_theses: []
tags: [health-review]
---

# Company Health & Integrity Review — Eli Lilly

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/LLY - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker LLY` — link the pull note into `markers_pull`.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

Eli Lilly discovers, tests, manufactures, and sells patent-protected medicines — paid for mostly by insurers, governments, and PBM-intermediated payers rather than the patients who take them — with the machine's output now dominated by the tirzepatide (incretin/GLP-1) metabolic franchise.

Matches the dossier `one_liner` ("Discovers, tests, manufactures, and sells medicines."). The machine's shape has not changed, but its center of gravity has: FY2025 growth of this magnitude off a $45B base is franchise-launch economics, not broad portfolio growth. No dossier timeline update required yet; the single-franchise concentration belongs in the dossier's Card-stage revenue-engine table when it gets filled.

## 2. What changed in the company machine?

- Positive: FY2025 revenue $45.0B → $65.2B (+44.7%), net income $10.6B → $20.6B (+94.9%), operating cash flow $8.8B → $16.8B (+90.7%) ([[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Facts_LLY]]). Cash more than doubled to $7.3B. Diluted shares fell 0.5% while SBC dropped to $626M (~1.0% of revenue) — the machine is scaling without diluting.
- Negative: Long-term debt +43.3% to $40.9B (+$12.4B), with repeated note offerings in the baseline (424B2 Feb 2025, Aug 2025, May 2026 — [[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Baseline_LLY]]) — the expansion is partly debt-financed. Receivables +61.4% and inventory +81.1% both far outran the underlying business.
- Ambiguous: The two working-capital builds (both 🔴 in the markers pull) read either as deliberate capacity/launch staging or as early demand softening — this is the review's central question (§3). The 2026-05-20 8-K (Items 8.01/9.01) is unread. Capex and operating income are not tagged under standard XBRL concepts, so FCF, EBITDA leverage, and interest coverage are blind spots until pulled manually.

## 3. Financial health

Markers: [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_LLY]] — rollup 5 🟢 · 0 🟡 · 2 🔴 · 4 ⚪. Every marker is interpreted below; both reds are routed via §15 in section 11.

- Organic revenue: +44.7% FY2025. The price/volume/mix/acquisition split (§17 Step 2) is not in the pull — needs the 10-K product-revenue tables. Growth this steep is launch-driven and franchise-concentrated, which raises the stakes on the working-capital markers below: the same molecule family drives revenue, receivables, and inventory simultaneously.
- Gross and operating margin: ⚪ — gross profit and operating income are absent from the standard XBRL tags, so the §5.2 bands cannot be computed. What is computable: net margin rose from 23.6% to 31.6% (+8pp), so operating leverage is real at the net line. The gross-vs-opex decomposition needs the 10-K income statement before margin quality can be scored properly.
- FCF conversion: ⚪ — capex concept untagged, so FCF and the five-year FCF/NI band are explicit gaps. OCF/NI held at 81.5% (prior 83.3%), above the 80% constructive line, and the OCF-vs-earnings trend marker is 🟢 aligned. Caution: with a manufacturing buildout of this scale, true FCF is likely far below OCF — do no payout or valuation math until capex is pulled from the cash-flow statement.
- ROIC and incremental returns: not computable from the pull (no EBIT). Net income nearly doubling on +44.7% revenue implies strongly positive incremental returns *for now*; per §5.4 this should be reconstructed manually, not accepted, especially with invested capital inflating through inventory, receivables, and new plant.
- Debt and liquidity: LT debt $40.9B (+43.3%) against $7.3B cash. Net-debt/EBITDA and EBIT/interest are both ⚪ (EBIT untagged; the interest-expense series is stale, ending FY2023). Three note offerings in ~15 months (Feb 2025, Aug 2025, May 2026). Not alarming for a large-cap pharma with this cash generation, but the §5.5 bands must be rebuilt by hand before the balance sheet can be called comfortable.
- Working capital — the heart of this review, two 🔴:
	- **Inventory +81.1% vs cost of sales ≈ +31% → +49.8pp divergence** — the standout number in the current research universe. *Benign hypothesis (§5.3 "temporary build ahead of launch or supply risk"):* a deliberate incretin capacity-and-safety-stock ramp — tirzepatide spent long stretches of 2023–24 in shortage, management publicly committed multi-billion-dollar plant expansions, and a build ahead of the oral-incretin launch would sit in inventory before it sits in revenue. *Negative hypothesis:* demand normalization into overbuilt capacity — if formulary pressure, compounding leakage, or competitor share gains slow sell-through, this same number becomes obsolescence, discounting, and write-down risk. The hypotheses separate cleanly in the inventory footnote: a raw-materials/WIP-heavy build supports the ramp story; a finished-goods-heavy build supports the demand-risk story. Routed in §11.
	- **Receivables +61.4% vs revenue +44.7% → +16.7pp divergence** — past the >10pp concern line. *Benign hypothesis:* payer/wholesaler mix — US launch volume runs through a small number of wholesalers, and gross-to-net dynamics let gross receivables ride while rebate accruals build on the liability side. *Negative hypothesis:* collection stretch or extended terms used to move product into the channel. Discriminators: DSO trend, allowance roll-forward (an allowance declining while collections slow is the §5.3 red text), rebate-reserve growth vs revenue, and wholesaler concentration. Routed in §11.
	- Dilution trio for completeness (all 🟢): diluted shares −0.5% YoY, SBC 1.0% of revenue, buybacks exceed issuance — nothing hiding here.
	- Remaining ⚪: dividend/FCF (capex gap, §5.7) — dividends were paid in all six series years but the payout ratio is an explicit gap until FCF exists.

## 4. Operational health

§14 pharma emphasis applies (LLY is commercial-stage, so the biotech runway/burn markers are moot; manufacturing readiness, patent life, pipeline, and pricing exposure dominate). Most of this section is **evidence still to be pulled** — the vault currently holds only the quantitative layer.

- Customers and retention: the retention analog for pharma is formulary position and payer access, mediated by PBMs. No vault evidence yet — prescription-trend and access data need a dedicated pull. Formulary exclusions on the obesity franchise are the single most direct "churn" risk to watch.
- Product and innovation: as of early 2026 (general knowledge — verify against the FY2025 10-K pipeline discussion before scoring): tirzepatide (Mounjaro/Zepbound) is the engine; donanemab (Kisunla, Alzheimer's) approved 2024; an oral incretin (orforglipron) reported positive late-stage data in 2025 with a launch expected around 2026; retatrutide in Phase 3. None of this is yet evidenced inside the vault — no fabricated pipeline metrics here; pull the 10-K pipeline table and R&D detail (the facts note's R&D series is stale, ending FY2022).
- Employees and safety: no vault evidence; no §7.3-level safety failure documented. Gap.
- Suppliers and capacity (manufacturing readiness): the +49.8pp inventory build, +43% debt growth, and serial note offerings are all *consistent with* the publicly committed multi-site manufacturing expansion — but the actual capacity-commitment figures must come from the 10-K commitments footnote, not inference. This is the §14 marker where LLY's health thesis lives or dies: capacity arriving on time into strong demand is the bull case; capacity arriving into normalizing demand is the bear case.
- Sector-specific KPIs: **patent life** — tirzepatide compound protection is generally understood to run into the mid-2030s; verify exact expiries by jurisdiction in the 10-K patent table. **Pricing/political exposure** — IRA Medicare negotiation rounds, 2025-era most-favored-nation pricing pressure, and the PBM rebate architecture are the dominant political risks; exposure is factual, quantification needs pulling (kept factual here; judgment treatment in §10/§12 lens).

## 5. Stewardship and integrity

Well-established facts only; everything uncertain is marked for the DEF 14A (filed 2026-03-20, in the baseline, unread).

- Accounting quality: no restatement, material weakness, or auditor dispute documented in the vault. Operating cash confirms earnings at 81.5% of net income despite the working-capital absorption — earnings are substantially cash-backed. The capex/operating-income XBRL gaps are a machine-readability nuisance (likely custom extension tags), not an integrity finding, but confirm the income-statement presentation didn't change year over year.
- Disclosure quality: standard large-pharma disclosure reputation; the real test for this review is the granularity of the inventory footnote and gross-to-net rebate disclosure — noted as §11 checks rather than assumed.
- Capital allocation: reinvestment is clearly being prioritized — capacity buildout funded by operations plus $12.4B of new long-term debt — while dividends continued (paid in all six series years) and buybacks stayed modest but net-positive. Rational ordering per §5.7 *if* incremental returns hold; the untestable piece is FCF coverage (capex gap).
- Executive compensation: metrics, PSU design, and severance terms — verify in DEF 14A. No repricing or acceleration events documented.
- Board oversight: composition, independence, and committee structure — verify in DEF 14A. Annual-meeting vote results are in the 2026-05-07 8-K (Item 5.07), unread — check for low-support items.
- Customer and employee treatment: the 2023 insulin list-price cuts and $35/month cap are a documented good-faith precedent (§9). No current-period evidence either way in the vault.
- Regulatory and legal record: no §7.3 hard-stop event (fraud allegation, going-concern, auditor dispute, restatement, covenant breach, unresolved safety failure) documented. Sector-endemic pricing litigation and political scrutiny exist; log specifics from the 10-K legal-proceedings note rather than importing headlines.

## 6. Shareholder distribution

- Dividends: paid in all six fiscal years of the series; FY dollar amounts were not extracted in the pull and dividend/FCF is ⚪ (capex gap) — explicit gap, no payout ratio asserted (§5.7).
- Gross buybacks: present and more than offsetting issuance (🟢 "buybacks exceed net share count" marker) — this is a real return, not a grant-washing buyback per the §5.6 test.
- Net share-count change: −0.5% YoY (899.3M vs 904.1M diluted weighted-average) — 🟢, below the 1% concern threshold and moving the right way.
- Stock compensation: $626M, ~1.0% of revenue, down 3.1% YoY — 🟢, trivially small for the size of the business.
- Debt used for distributions: cannot be ruled out yet. LT debt rose $12.4B in a year when dividends and buybacks continued and capex ran heavy; whether distributions were effectively debt-funded depends on the missing FCF number. Route per §15 debt-funded-buyback row: 10-K cash-flow statement + debt note + any authorization 8-K.

## 7. Market behavior

Stock behavior below is evidence about expectations, not proof of business quality (§9).

- Relative performance: +50.7% trailing 12 months vs XLV +24.0% → +26.7pp outperformance (🟢 in the pull). The market is rewarding the FY2025 results and extrapolating.
- Estimate revisions: **no data in the vault** — explicit gap; needs an analyst-revision pull before the §16.C first category can be scored above baseline.
- Accumulation/distribution: **no data** — the §9.3 volume/ownership manual pass has not been done. Gap.
- Insider activity: the baseline shows a cluster of Form 4s (2026-06-10 through 2026-07-20) and two Forms 144 (June–July 2026). Cadence looks routine/comp-related, but per §15 route to the 10b5-1 disclosures and ownership table before dismissing.
- Ownership concentration: most recent 13G/A activity is Nov 2024 (passive updates); 13D items from 2023 in the baseline need classification (filer-vs-subject) before they mean anything. 13F trend not pulled. Gap.
- Short interest: **no data** — explicit gap.

## 8. Process-versus-outcome classification

- Process quality: **improving** — capacity, cash generation, and (per early-2026 general knowledge, unverified in-vault) the pipeline are all building; dilution controlled; reinvestment prioritized.
- Current outcome quality: **improving** — revenue +44.7%, net income +94.9%, OCF +90.7%, net margin +8pp.
- Market response: **rewarding** — +26.7pp over XLV in 12 months.
- Primary divergence: **none** — all three dimensions point the same way (the §3 table's "healthy process and healthy results / stock rewarded" row: potential compounder, valuation decisive). The caveat that keeps this review honest: both 🔴 markers sit exactly where outcome quality could be overstated — if the working-capital build is masking demand normalization, `outcome_quality` flips before `process_quality` does. That is a Pattern-B-style watch item (§13), not a current classification.

### Divergence sentence (§17 Step 7)

> The company's operating process is **improving**, reported results are **improving**, and the market is pricing **more** future success because incretin-franchise growth and the coming oral pipeline are being extrapolated forward — the unresolved risk is that the +49.8pp inventory divergence marks demand normalizing into capacity built for a steeper curve.

## 9. Good-faith evidence

Well-established through early 2026; current-period specifics still need pulling.

- 2023 insulin list-price cuts (~70% on major products) and the $35/month out-of-pocket cap, taken ahead of regulatory compulsion — a present revenue cost accepted to protect the franchise and political standing.
- Multi-year, multi-billion-dollar US/EU manufacturing commitment made *ahead* of proven demand — the §10.3-style pattern (present cost, future capability). The vault's own evidence for it is the +49.8pp inventory build and +$12.4B debt: the costs are visible in the filings before the payoff is.
- Direct-to-consumer channel (LillyDirect) selling lower-priced single-dose vials — traded margin for patient access and a defense against compounded copies, rather than defending list price at all costs.

## 10. Extraction or bad-faith risk

Legal-but-judgment items (§12 lens) — factual, no misconduct alleged.

- Debt-funded expansion running concurrently with rising dividends and continued buybacks: if FCF after the capex wave is thin or negative (currently uncomputable — capex gap), distributions are effectively borrowed, the §5.7 "returns exceed FCF" watch state.
- Gross-to-net rebate architecture: list prices far above net realized prices are legal and sector-standard, but they obscure unit economics and concentrate estimation risk in rebate reserves — exactly the neighborhood of the +16.7pp receivable divergence. Drug-pricing dynamics stay under this §12 lens: structural, disclosed, and worth monitoring, not a bad-faith finding.
- Narrative concentration risk: with the machine riding one molecule family, the incentive to keep the growth story intact is strongest precisely when channel-fill and inventory questions arise. Watch for KPI-definition changes or shrinking disclosure granularity (§13 Pattern B question set) — none observed yet.

## 11. EDGAR follow-up

Both 🔴 markers routed with the §15 table; log outcomes as [[03_Templates/Intel_Finding]] notes.

**Red 1 — inventory divergence +49.8pp** (§15 rows: revenue quality / persistent restructuring analogs → MD&A + footnotes)

- Filing: FY2025 10-K (filed 2026-02-12) → Q1-2026 10-Q (filed 2026-04-30) for persistence.
- Section or exhibit: MD&A working-capital discussion; inventory footnote (raw materials / WIP / finished-goods split); commitments footnote (purchase and capacity commitments).
- Finding: inventory +81.1% vs cost of sales ≈ +31% ([[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_LLY]]).
- Possible meaning: deliberate incretin capacity/launch staging (benign) vs demand normalization into overbuilt capacity with obsolescence/discounting risk (negative). Composition is the discriminator.
- Next investigation: check for any obsolescence/write-down language; compare capacity commitments YoY; confirm whether the Q1-2026 balance sheet shows the divergence compressing or compounding.

**Red 2 — receivable divergence +16.7pp** (§15 row: revenue quality concern → revenue note + MD&A)

- Filing: FY2025 10-K → Q1-2026 10-Q.
- Section or exhibit: revenue-recognition footnote; receivables and allowance roll-forward; rebate-reserve (gross-to-net) disclosure; customer/wholesaler concentration note.
- Finding: receivables +61.4% vs revenue +44.7%.
- Possible meaning: payer/wholesaler mix shift and gross-to-net timing on launch volumes (benign) vs collection stretch or channel terms extension (negative). Allowance falling while collections slow would be the §5.3 hard-negative signature.
- Next investigation: DSO trend across 2024–2026 quarters; rebate reserves vs US revenue growth; wholesaler concentration percentages vs prior 10-K.

**Also queued:** 2026-05-20 8-K (Item 8.01 — contents unknown); DEF 14A 2026-03-20 (comp metrics, board, vote items); May 2026 424B2 use of proceeds; manual extraction of capex + operating income to close the four ⚪ marker gaps.

## 12. Score

Provisional score — the two unresolved 🔴 markers and four ⚪ data gaps cap it deliberately; a clean §11 resolution plausibly lifts the total into the low-70s.

| Block | Score | Max |
|---|---:|---:|
| Economic health | 27 | 40 |
| Stewardship and integrity | 29 | 40 |
| Market confirmation | 10 | 20 |
| **Total** | **66** | 100 |

§16.A Economic health (27/40): revenue/demand quality 7/8 — exceptional growth, but concentration and price/volume split unverified; unit economics 6/8 — net margin +8pp, gross/operating ⚪; cash conversion 4/8 — OCF/NI 81.5% but both §5.3 divergence markers red; balance sheet 5/8 — debt +43%, leverage ratios uncomputable; returns on capital 5/8 — implied strong, not reconstructed.

§16.B Stewardship (29/40): accounting transparency 6/8 — cash-backed earnings, no adverse events, XBRL tag gaps; capital allocation 6/8 — reinvestment-first ordering, FCF coverage unproven; governance/compensation 5/8 — DEF 14A unread, scored neutral; stakeholder treatment 5/8 — insulin-pricing precedent positive, current evidence thin; strategic consistency 7/8 — multi-year capacity strategy executed as stated.

§16.C Market confirmation (10/20): relative price behavior 4/5 — +26.7pp vs XLV; accumulation/ownership 2/5 — no data, neutral floor; valuation vs conservative economics 2/5 — no valuation work in vault, conservatively low; catalyst/expectation asymmetry 2/5 — expectations already high, asymmetry unfavorable until the inventory question resolves.

- Red-flag override: **false** — no documented §7.3 hard-stop event (no fraud allegation, going-concern, auditor dispute, restatement, covenant breach, or unresolved safety failure in the vault record). The 🔴 markers are §5 investigation prompts, not §7.3 events.

## 13. Falsifiable thesis

- Bull case: the +49.8pp inventory build is deliberate supply security ahead of the oral-incretin launch and international expansion; the divergence normalizes as capacity absorbs demand, receivables settle back toward revenue growth as launch-channel mix stabilizes, and FCF inflects once the capex wave crests — the machine converts today's balance-sheet bulge into tomorrow's volume.
- Bear case: GLP-1 demand growth normalizes into overbuilt capacity while competition and political pricing pressure compound; inventory converts to write-downs and discounting, the receivable stretch turns out to be channel saturation, and net pricing erodes — reported FY2025 results were the top of the curve, not a point on it.
- What would prove each wrong: **bull wrong if** the inventory divergence stays above +20pp for two more filings with a finished-goods-heavy composition, any obsolescence charge appears, or the allowance declines while DSO extends. **Bear wrong if** the divergence compresses toward cost-of-sales growth while revenue growth holds above ~20%, no write-downs appear, and rebate reserves track revenue rather than outrunning it.
- Next checkpoint and date: **Q3-2026 10-Q (expected ~2026-10-30 based on prior filing cadence): inventory divergence < +20pp and receivable divergence < +10pp, with no inventory charge disclosed.** Interim step: pull the FY2025 10-K inventory composition and capacity commitments (§11) before the checkpoint so the composition baseline exists. Copied to `next_checkpoint` / `next_checkpoint_date`.

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
