---
node_type: "health_review"
date: "2026-08-02"
company: "TAIWAN SEMICONDUCTOR MANUFACTURING CO LTD"
ticker: "TSM"
period: "FY ending 2024-12-31"
process_quality: "improving"
outcome_quality: "improving"
market_response: "rewarding"
divergence_pattern: "none"
economic_health_score: 29
stewardship_score: 31
market_confirmation_score: 10
total_score: 70
red_flag_override: false
red_flags: []
next_checkpoint: "Q3 2026 interim results 6-K (~mid-Oct): monthly-revenue 6-Ks keep YoY growth positive and margins hold through the overseas-fab ramp; FY2025 20-F read closes the ⚪ debt and diluted-share gaps and confirms the growth-capex explanation behind 0.55 FCF conversion"
next_checkpoint_date: "2026-10-16"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_TSM]]"
related_theses: ["[[AI Power Infrastructure]]", "[[Semiconductor Sovereignty CHIPS Act]]"]
tags: [health-review]
---

# Company Health & Integrity Review — TAIWAN SEMICONDUCTOR MANUFACTURING CO LTD

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/TSM - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker TSM` — link the pull note into `markers_pull`.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

Runs the factories that manufacture the world's most advanced computer chips for companies that design chips but do not build them — Apple, NVIDIA, AMD, Qualcomm and hundreds of others pay per wafer — making TSM the sole leading-edge manufacturing machine that nearly the entire AI chip chain physically runs through. The dossier is still a scaffold with an empty `one_liner` — seed it with this sentence and start the evolution timeline when the dossier is promoted to Card. Per [[13_Company_Intel/Research Universe Map]] theme 1, TSM is "NVDA's single manufacturing dependency; the §14 bottleneck question in physical form."

## 2. What changed in the company machine?

Grounded in [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Baseline_TSM]] and [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Facts_TSM]]. Caveat: TSM is a foreign private issuer filing 20-F/6-K; the XBRL facts pull is USD-sparse, and the marker window ends FY2024 even though the FY2025 20-F (filed 2026-04-16) is already on file.

- Positive:
  - Gross profit $38.4B (FY2023) → $49.5B (FY2024), +29.1% (facts pull; one of only two USD-tagged series the FPI's XBRL exposes).
  - FY2025 20-F filed on schedule (2026-04-16), continuing an unbroken three-year annual cadence (2024-04-18, 2025-04-17, 2026-04-16).
  - Disclosure cadence unusual in a good way: monthly revenue 6-Ks (2026-06-10, 2026-07-13) plus month-end 6-Ks and a Q2 2026 interim results 6-K (2026-07-16) — the machine reports its own throughput every month.
  - Working-capital markers clean into the demand cycle: inventory divergence −14.0pp, receivables divergence +0.6pp (health pull, FY2024).
- Negative:
  - None documented in the baseline window. R&D growth of only +4.6% ($6.0B → $6.2B, facts pull) lags gross-profit growth by ~25pp — probably scale, but check the FY2025 20-F R&D line before calling it benign.
- Ambiguous:
  - 6-K of 2026-07-02: change of TSMC Arizona treasurer (per filing name) — a subsidiary officer change, not a parent CFO event, but unread. Identify who/why (§11).
  - Steady stream of Forms 4 through July 2026 (12 filings 2026-07-09 → 2026-07-31) — codes and sizes unread.
  - Markers still computed on FY2024 XBRL despite the FY2025 20-F being on file — IFRS tag lag; re-run `edgar facts`/`edgar health` and re-check (§11).

## 3. Financial health

Marker table: [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_TSM]] — rollup 🟢 7 · 🟡 1 · 🔴 0 · ⚪ 3, `signal_status: clear`. Profile general, reporting currency **TWD** — all markers are ratios/growth rates so the currency cancels; the ⚪ gaps are IFRS-tagging gaps, not company silence. Every marker interpreted below.

- Organic revenue: no §5.1 growth marker computed by the pull (revenue series present, FY2019–FY2024). Growth direction is corroborated by the +29.1% USD gross-profit jump and the monthly revenue 6-Ks, but the rate, the price-vs-volume split, and concentration are explicit gaps → FY2025 20-F. Known structural flag: the largest customer has historically been above 20% of revenue (~25% in the FY2023 20-F, public record) — §5.1 "serious concern" band on concentration, a permanent feature of this machine to verify each year, not a new development.
- Gross and operating margin: no margin computable from the vault (facts pull has gross profit but no revenue row — "not enough coverage to derive margins"). Explicit gap; industry-leading margin levels are public record but unverified here. Route to 20-F income statement; watch overseas-fab ramp dilution.
- FCF conversion: **0.55 cumulative FCF/NI over ≤5 FY — the sole 🟡**, squarely in the 50–80% investigate band. Benign reading: this is the §5.3 carve-out in its purest form — a foundry mid-capex-supercycle expenses depreciation slowly while pouring cash into fabs that earn revenue years later; the 🟢 OCF-vs-earnings alignment, 🟢 receivables (+0.6pp), and 🟢 inventory (−14.0pp) all say earnings are cash-real and the gap is capex, not accruals. Negative reading: structurally capital-consumptive economics where accounting profit never fully converts to owner cash — the classic foundry bear case. Distinguish in the 20-F cash-flow statement: capex/revenue trajectory, customer prepayments funding the buildout, and whether conversion recovers as N3/N2 depreciation matures (§11).
- ROIC and incremental returns: no marker computed — explicit gap. The overseas fabs (Arizona, Kumamoto, Dresden) are widely stated by management to carry dilutive returns versus Taiwan fabs (public record — verify magnitude in the 20-F). The next review should reconstruct incremental returns including subsidy offsets.
- Debt and liquidity: EBIT / interest **125.96x 🟢** — and this uses ifrs-full FinanceCosts, which is broader than interest expense, so true interest coverage is even higher; the marker reads conservative by construction. Net debt/EBITDA **⚪ n/a** — no debt concepts tagged, but this is *not* evidence of a debt-free balance sheet: the baseline shows USD bond offerings (424B2/424B5/FWP, Oct 2021 and Apr 2022) whose notes are presumably still outstanding. Verify the debt schedule in the FY2025 20-F before treating leverage as benign (it almost certainly is at 126x coverage, but the vault policy is explicit gaps, not assumed answers).
- Working capital:
  - Receivables divergence +0.6pp 🟢 — collections keep pace with reported revenue; no channel-stuffing signature.
  - Inventory divergence −14.0pp 🟢 — inventory growing 14pp *slower* than cost of sales; the fab is selling what it builds. Read jointly with NVDA's 🔴 +20.9pp build ([[13_Company_Intel/Reviews/2026-08-02 - NVDA - Health Review]]): the designer is stockpiling while its manufacturer runs lean — consistent with NVDA prepositioning long-lead supply, not with a chain-wide demand stall (if end demand were cooling, TSM's monthly revenue and inventory would show it first).
  - Dilution/buyback markers ⚪ (see §6): IFRS diluted-share-count tag absent for two fiscal years and no repurchases in the latest FY — honest gaps, routed to the 20-F share-capital note.
  - SBC/revenue +0.0% 🟢 and dividend/FCF 42% 🟢 interpreted in §6.
  - 12-month return vs SMH −18.5pp 🟢 interpreted in §7.

## 4. Operational health

§14 semiconductors/AI-infrastructure emphases. Evidence status marked per item — no fabricated metrics.

- Customers and retention (hyperscaler concentration): TSM serves essentially every major chip designer; largest-customer concentration ~25% (FY2023 20-F, public record) with NVDA reported as the fast-rising second — current percentages **need the FY2025 20-F concentration note**. Retention is structural: at the leading edge there is no second source, which is both the moat and the reason concentration cuts both ways.
- Product and innovation (node leadership, qualification cycles): N3 ramped through 2023–24; N2 (2nm) entered volume production in late 2025 with A16 planned to follow (public record through the knowledge window) — current ramp status, yields, and node revenue mix **need the FY2025 20-F business section and the Q2 2026 results 6-K (2026-07-16, unread)**. R&D +4.6% YoY per the facts pull.
- Employees and safety: no vault evidence; overseas-fab staffing (Arizona) has had publicly reported labor friction historically — verify current state in the 20-F human-capital disclosure. Explicit gap.
- Suppliers and capacity (buildout geography): leading-edge capacity remains concentrated in Taiwan (Hsinchu/Tainan/Kaohsiung); diversification underway — Arizona Fab 21 in production with a large announced US expansion, Kumamoto (JASM) operating, Dresden (ESMC) in construction (public record — verify status, capex plan, and subsidy terms in the FY2025 20-F). Upstream, ASML is the single-source litho dependency (Research Universe Map theme 1). Customer prepayments and purchase commitments: **pull needed — 20-F commitments footnote.**
- Sector-specific KPIs:
  - End-demand vs channel inventory: TSM's own −14.0pp inventory divergence 🟢 plus monthly revenue 6-Ks are the chain's earliest public demand tell; both currently constructive.
  - Utilization: no vault data — needs pulling; monthly revenue is the proxy until then.
  - Capex intensity: the 0.55 FCF conversion *is* the capex-intensity signal; exact capex/revenue needs the 20-F (facts pull capex series exists in TWD but no intensity marker computed).
  - Export controls: US controls on advanced chips to China apply to TSM as the manufacturer; TSM halted advanced-node shipments to certain China customers after a TSM-made die surfaced in a Huawei product (late 2024, public record) — current status, any penalties, and risk-factor wording **need the FY2025 20-F**.
  - Power availability: Taiwan grid tightness and electricity-price increases are a documented cost/continuity factor for the Taiwan fabs (public record) — no vault quantification; monitor.

## 5. Stewardship and integrity

Well-established public facts only; uncertain items marked "verify in 20-F".

- Accounting quality: all computable §5.3 markers 🟢 except the capex-driven 🟡 conversion; OCF tracks earnings; SBC ~0% of revenue removes a whole class of adjusted-earnings games. No restatement, auditor dispute, or late filing evidenced in the baseline. The XBRL sparseness (no debt, D&A, or diluted-share tags) is an IFRS/FPI tagging artifact that blunts outside quantitative oversight — friction, not misconduct.
- Disclosure quality: better-than-required cadence (monthly revenue 6-Ks — few companies of any size self-report throughput monthly); three consecutive on-time 20-Fs; SD (conflict-minerals) filings 2025-05-28 and 2026-05-27. As an FPI, TSM files no 10-Qs or DEF 14A — governance visibility is structurally lower than for domestic filers; the 20-F and Taiwan annual-meeting materials carry that load.
- Capital allocation: reinvestment first, on a scale few companies attempt — the 0.55 FCF conversion is capacity being built ahead of revenue; dividend at 42% of FCF (§5.7 constructive 30–60% band); no buybacks, no evidence of debt-funded distributions (USD bonds of 2021–22 coincided with the capex supercycle — confirm use of proceeds in the 20-F).
- Executive compensation: cash-plus-profit-sharing structure with historically minimal stock compensation (the +0.0% SBC/revenue marker is the quantitative echo). Grant details and 2025 comp — verify in the FY2025 20-F Item 6.
- Board oversight: C.C. Wei has held the combined Chairman + CEO role since mid-2024 (public record) — a concentration of decision rights worth noting given the founder-transition era ended in 2018; board composition and independence — verify in 20-F. The Taiwan National Development Fund's stake makes the state a standing minority owner — alignment and influence: verify current holding.
- Customer and employee treatment: long-cycle customer partnerships are the business model itself (multi-year process co-development); no complaints or disputes evidenced in the baseline. Arizona subsidiary treasurer change (6-K 2026-07-02) unread. Explicit gap, not a clean bill.
- Regulatory and legal record: export-control compliance is the dominant documented constraint (see §4); no §7.3 hard-stop event documented in the baseline — no auditor change, restatement, going-concern language, covenant breach, or fraud allegation.

## 6. Shareholder distribution

From the marker pull (§5.6–5.7); the FPI tag gaps make this section honest rather than complete:

- Dividends: 42% of FCF 🟢 — inside the §5.7 comfortable band; TSM's stated policy is a sustainable, steadily rising quarterly cash dividend (public record — verify wording in 20-F). Note this payout is on *post-capex* FCF during a capex supercycle — the dividend has been maintained while conversion sat at 0.55, which is discipline, but confirm no borrowing bridged it.
- Gross buybacks: ⚪ n/a — no share repurchases in the latest fiscal year. Consistent with the reinvestment-first model; not a gap in behavior, a gap in the marker.
- Net share-count change: ⚪ n/a — **no IFRS diluted-share-count tag exists for two fiscal years**, so YoY dilution cannot be computed from XBRL. Honest data gap: route to the FY2025 20-F share-capital and EPS notes. Prior public record suggests a broadly flat count (no split-adjusted issuance programs), but per vault policy that stays unverified until read.
- Stock compensation: +0.0% of revenue 🟢 — effectively no SBC dilution engine; distributions here are what they claim to be.
- Debt used for distributions: none evidenced; the 2021–22 USD notes (424B2/424B5/FWP in baseline) map in time to the fab buildout, not to payouts — confirm use-of-proceeds language (§11).

## 7. Market behavior

§9 — evidence about expectations and ownership, not proof of business quality. Benchmark: SMH.

- Relative performance: 12-month return **+71.9% vs SMH +90.4% = −18.5pp** 🟢 — inside the §9.2 20pp band, so no forced explanation required. Two readings worth logging: (a) lagging a benchmark that itself contains the AI leaders while returning +72% absolute is being *rewarded*, not ignored; (b) versus NVDA's +15.6% over the same 12 months (NVDA review), the market has rotated reward down the chain from the designer to the manufacturing bottleneck — expectations migrated toward capacity. The residual −18.5pp gap plausibly contains the standing Taiwan-concentration discount; that is interpretation, not evidence.
- Estimate revisions: **no pull — explicit gap.**
- Accumulation/distribution: **no volume/flow pull — explicit gap.** 13G record in baseline is stale (latest SC 13G/A 2024-02-05).
- Insider activity: continuous Forms 4 through July 2026 (12 filings 2026-07-09 → 2026-07-31). Cadence looks routine for a large officer group, but transaction codes and directions are unread — verify before treating as benign.
- Ownership concentration: no 13F aggregation pulled — explicit gap. Structural facts: high passive/ADR ownership and the National Development Fund stake (verify current levels).
- Short interest: **no pull — explicit gap.**

## 8. Process-versus-outcome classification

- Process quality: **improving** — node leadership extended (N2 ramping), capacity being added on three continents, working-capital discipline clean, disclosure cadence intact.
- Current outcome quality: **improving** — gross profit +29.1% (USD, facts pull), cash-confirmed by aligned OCF and clean receivables/inventory markers; the 0.55 conversion is capex timing, pending 20-F confirmation.
- Market response: **rewarding** — +71.9% absolute, within normal range of its own sector benchmark.
- Primary divergence: **none** — §3's healthy-process/healthy-results/rewarded row: "potential compounder; valuation remains decisive." The open risk is Pattern C (good company, bad investment) if the price now embeds flawless execution plus zero geopolitical event risk — that is a valuation question this note does not answer (no valuation work in vault).

### Divergence sentence (§17 Step 7)

> The company's operating process is `improving`, reported results are `improving`, and the market is pricing `more` future success because AI-driven leading-edge demand has shifted reward toward the chain's manufacturing bottleneck — TSM's +71.9% sits within normal range of SMH's +90.4%, with the residual gap plausibly the standing Taiwan-concentration discount rather than doubt about the business.

## 9. Good-faith evidence

- Building capacity years ahead of the revenue it will earn: the 🟡 0.55 FCF conversion is a present cash cost accepted to protect customers' future supply — the framework's definition of good-faith spending, provided the 20-F confirms the capex composition.
- Geographic diversification (Arizona, Kumamoto, Dresden) at management-acknowledged dilutive returns — absorbing higher costs to de-risk customers' single-site exposure rather than externalizing it (public record; magnitude to verify).
- Distribution discipline without financial engineering: dividend at 42% of FCF, no buyback-EPS games, ~0% SBC — reported per-share economics are not manufactured.
- Export-control compliance at real revenue cost, including halting advanced shipments to China customers after the Huawei discovery (late 2024, public record).
- Voluntary monthly revenue disclosure — submitting the machine's throughput to public inspection twelve times a year.

## 10. Extraction or bad-faith risk

Factual, no drama — most entries here are externalities and structure, not conduct:

- Geographic concentration is a risk borne by others: the leading-edge capacity that customers and shareholders depend on sits overwhelmingly in one seismically and geopolitically exposed jurisdiction. Diversification is underway but leading-edge Taiwan concentration will persist for years (public record). This is the chain's largest un-insurable externality, and it is priced by the market, not carried on the balance sheet.
- Single-customer concentration above the §5.1 20% concern line (largest customer ~25%, FY2023 20-F) — mutual dependency, but a pricing/mix shock transmitter in both directions.
- FPI disclosure regime: no 10-Qs, no proxy, sparse XBRL (no debt, D&A, or diluted-share tags) — nothing improper, but outside shareholders get materially less continuous, machine-readable oversight than for domestic filers.
- State entanglement cuts both ways: subsidies (US CHIPS award, Japan, EU — public record) carry conditions and clawback terms not yet read, and the "silicon shield" politics mean some capital-allocation decisions may be partly political rather than purely economic — costs of that, if any, land on shareholders. Verify subsidy terms in the 20-F.
- No conduct-based extraction signature in the markers: no SBC recycling, no debt-funded payouts, no receivables/inventory games. The risks above are structural, not behavioral.

## 11. EDGAR follow-up

Routing per §15; log meaningful changes as Intel Findings. TSM is an FPI — the §15 destinations translate to 20-F items and 6-Ks.

- Filing: **FY2025 20-F** (filed 2026-04-16) — cash-flow statement and capex/commitments footnotes.
  - Finding: 🟡 FCF conversion 0.55 (≤5 FY cumulative).
  - Possible meaning: growth-capex supercycle (benign) vs structurally capital-consumptive economics (negative).
  - Next investigation: capex/revenue trajectory, customer prepayments, depreciation ramp; §15 row "Revenue quality concern" analog.
- Filing: **FY2025 20-F debt note** — resolve the ⚪ net-debt gap; reconcile the 2021–22 USD notes (424B2/424B5/FWP in baseline) and use of proceeds. §15 row "New capital raise" (historical).
- Filing: **FY2025 20-F share capital / EPS notes** — resolve the ⚪ diluted-share and buyback gaps (no IFRS tags). §15 row "Dilution".
- Filing: **FY2025 20-F customer-concentration note + risk factors** — current largest-customer %, NVDA %, export-control and Taiwan risk-factor wording vs prior year. §15 row "Customer or supplier dependence".
- Filing: **6-K 2026-07-16 (Q2 2026 interim results)** — margins, N2 ramp commentary, capex guidance; plus monthly revenue 6-Ks (2026-06-10, 2026-07-13, 2026-07-24 month-end) for the growth trend.
- Filing: **6-K 2026-07-02 (TSMC Arizona treasurer change)** — identify officer and reason; §15 row "CFO or auditor change" analog (subsidiary level — almost certainly routine, but unread).
- Filing: **Forms 4 (July 2026 cluster)** — transaction codes/directions before treating as benign. §15 row "Insider selling".
- Data hygiene: re-run `edgar facts` / `edgar health --ticker TSM` once FY2025 IFRS tags surface — the marker window (FY2024) currently lags the newest 20-F by one fiscal year.
- Non-EDGAR pulls: estimate revisions, 13F holder aggregation, short interest — all explicit gaps in §7.

## 12. Score

§16 rubrics; one-line justifications. Copied to frontmatter.

| Block | Score | Max |
|---|---:|---:|
| Economic health | 29 | 40 |
| Stewardship and integrity | 31 | 40 |
| Market confirmation | 10 | 20 |
| **Total** | **70** | 100 |

- Economic health 29/40 — revenue/demand 6/8 (growth corroborated but no §5.1 marker; >20% single-customer concentration structural); margins 6/8 (gross profit +29.1% USD, but no margin computable from vault — gap); cash conversion 6/8 (0.55 🟡 with a credible capex carve-out and every accrual marker 🟢, docked until the 20-F confirms it); balance sheet 6/8 (126x coverage on a deliberately conservative FinanceCosts basis; ⚪ net-debt gap with known USD bonds unverified); returns on capital 5/8 (no ROIC pull; overseas-fab return dilution unquantified).
- Stewardship 31/40 — accounting transparency 6/8 (clean markers, ~0% SBC; FPI XBRL sparseness blunts outside verification); capital allocation 7/8 (reinvestment-first at extreme scale, 42%-of-FCF dividend, no buyback games); governance/comp 6/8 (combined Chairman+CEO since 2024, state shareholder, no proxy-level visibility — verify in 20-F); customer/employee/supplier treatment 5/8 (largely an evidence gap; AZ officer change unread); strategic consistency 7/8 (one business model since 1987, executed through every cycle; geographic diversification is adaptation, not drift).
- Market confirmation 10/20 — relative price/estimates 3/5 (+71.9%, −18.5pp within band; no revision data); accumulation/ownership 2/5 (no pull — neutral by default); valuation vs conservative economics 2/5 (no valuation work in vault); catalyst/expectation asymmetry 3/5 (a +72% year has raised the embedded bar, but reward rotating from designer to bottleneck suggests expectations are following evidenced capacity, not narrative).
- Red-flag override: **false** — no documented §7.3 event (no auditor change, restatement, going-concern language, covenant breach, fraud allegation, or safety failure in the evidence base). Total 70 = "generally healthy with identifiable weaknesses" (§16 bands) — same total as NVDA (70), different shape: NVDA is faster with a 🔴 working-capital flag; TSM is steadier with bigger disclosure gaps and the concentration externality.

## 13. Falsifiable thesis

- Bull case: TSM is the toll bridge under the entire AI buildout — the [[AI Power Infrastructure]] thesis's compute demand and the [[Semiconductor Sovereignty CHIPS Act]] thesis's subsidized diversification both route wafers through the same sole leading-edge foundry; the 0.55 FCF conversion is prepaid future toll capacity, and as N3/N2 depreciation matures, conversion recovers while pricing power at the bottleneck holds. NVDA's review (70/100, good-process-bad-stock) strengthens this: even the designer's 🔴 inventory build reads as competition for TSM's constrained output.
- Bear case: the machine's economics never escape the treadmill — each node costs more, overseas fabs structurally dilute returns, subsidies come with strings, and conversion stays below 0.8 across the cycle; meanwhile concentration risk (one island, one lithography supplier, one >20% customer) means a single external event can void years of process quality — Pattern C, a good company priced as a riskless one.
- What would prove each wrong: bull is broken if cumulative FCF conversion fails to rise off 0.55 as the FY2025–26 filings land, if monthly revenue 6-Ks turn negative YoY while capex guidance holds (capacity outrunning demand), or if the 20-F shows margin dilution from overseas fabs exceeding the guided range; bear is broken if conversion improves with the dividend intact and no new leverage, N2 ramps at company-typical yields, and customer prepayments keep funding the buildout.
- Next checkpoint and date: **Q3 2026 interim results 6-K, expected ~2026-10-16** (TSM reports mid-quarter-month; Q2 6-K landed 2026-07-16) — monthly-revenue YoY still positive, margins holding through the overseas ramp; in parallel, read the FY2025 20-F to close the ⚪ debt/diluted-share gaps and confirm the capex explanation for the 🟡 conversion. Copied into `next_checkpoint` / `next_checkpoint_date`.

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
