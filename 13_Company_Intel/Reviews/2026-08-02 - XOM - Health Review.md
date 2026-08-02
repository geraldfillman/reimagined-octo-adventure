---
node_type: "health_review"
date: "2026-08-02"
company: "ExxonMobil"
ticker: "XOM"
period: "FY ending 2025-12-31"
process_quality: "stable"
outcome_quality: "deteriorating"
market_response: "rewarding"
divergence_pattern: "none"
economic_health_score: 24
stewardship_score: 23
market_confirmation_score: 9
total_score: 56
red_flag_override: false
red_flags: []
next_checkpoint: "Q3 2026 10-Q: FY2026 distributions run-rate ≤ FCF without further cash drawdown; new TX charter/bylaws exhibits reviewed; holdco CIK continuity confirmed"
next_checkpoint_date: "2026-11-06"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_XOM]]"
price_at_review: 155.44
reconsider_price_low: 124.35
reconsider_price_high: 194.3
related_theses: []
tags: [health-review]
---

# Company Health & Integrity Review — ExxonMobil

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/XOM - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker XOM` — link the pull note into `markers_pull`.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

Finds, produces, refines, and sells oil, natural gas, fuels, and chemicals worldwide, converting capital into reserves and reserves into cash. This matches the dossier `one_liner` ("Finds, produces, refines, and sells oil, natural gas, and fuels") — the machine is unchanged, so no dossier evolution-timeline update is needed. The only thing that changed is the **legal wrapper**: since 2026-07-01 the listed entity is ExxonMobil Holdings Corporation, a Texas corporation, not the New Jersey corporation (see §2). Same shares, same ticker, same business.

## 2. What changed in the company machine?

The headline is a **changes-control event**, not an economic one: the Texas redomiciliation completed 2026-07-01 ([[13_Company_Intel/Findings/2026-08-01 - XOM - Texas redomiciliation completed]], 8-K Items 1.01/2.01/3.01/3.03/5.02/5.03; merger agreement was Annex A of the DEF 14A filed 2026-04-08, approved by shareholders per the 8-K 5.07 of 2026-05-29). Each NJ share was exchanged 1:1 for shares of a Texas holdco; the old stock was delisted/deregistered (Form 25) — the automated item-3.01 alert on the baseline pull is **resolved benign** (transfer of listing, not a compliance failure).

- Positive:
  - Benign reading of the redomiciliation: purely administrative — zero change to share count, ticker, or operations; potentially lower franchise/litigation friction, consistent with the broader corporate migration to Texas.
  - FY2025 cash engine still functioning: OCF $52.0B, FCF $23.6B, 5-year FCF conversion 1.03 ([[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Facts_XOM]], markers pull).
- Negative:
  - Negative reading of the redomiciliation: shareholder rights now run through the Texas Business Organizations Code and a **new, unreviewed charter and bylaws**. Texas is generally viewed as more management-protective (derivative-suit hurdles, exculpation breadth, forum provisions) — a structural reduction in minority shareholders' litigation venue and legal leverage that arrives invisibly because nothing economic changed. Framework: changes-control events alter shareholder-litigation venue and governance dynamics even when the economics are identical.
  - FY2025 outcomes softened across the board: revenue −5.0% to $332.2B, net income −14.4% to $28.8B, FCF $30.7B → $23.6B, cash −53.6% to $10.7B.
- Ambiguous:
  - Capex rose 16.7% to $28.4B into a softer price year — either counter-cyclical discipline (growth barrels bought cheap) or a distribution/reinvestment squeeze; the sustaining-vs-growth split (§4) decides which.
  - The new holdco may file under a **new CIK** — must confirm before trusting future automated `edgar` pulls for XOM (open item from the finding note).

## 3. Financial health

Marker table from [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_XOM]] (profile: general — the energy profile in §14 changes emphasis, not these bands). Rollup: 🟢 4 · 🟡 3 · 🔴 0 · ⚪ 4 → `signal_status: clear`. Interpretation of every marker:

- Organic revenue: $332.2B FY2025, −5.0% y/y. For a price-taker this is not yet diagnostic — the §17 Step 2 decomposition (volume vs realized price vs mix) has **not been done**; pull the 10-K MD&A price/volume tables before treating the decline as anything but commodity beta.
- Gross and operating margin: ⚪ **explicit gap** — `costOfRevenue` and `operatingIncome` are not tagged in XOM's XBRL (0 years of coverage), so no margin bands were computed. Net margin ~8.7% (derived) is the only crude proxy. Compute manually from the 10-K income statement.
- FCF conversion: 🟢 cumulative FCF / net income = **1.03** over 5 FY and 🟢 OCF tracks earnings direction (FY2025 OCF/NI 180%, typical of heavy-D&A extractive businesses). Earnings are real cash; no accrual divergence.
- Receivables: 🟡 receivables growth − revenue growth = **+6.3pp** (receivables +1.3% to $35.7B while revenue fell 5.0%). Mild in absolute terms but the band is right to flag it: check payment terms and contract assets in the revenue note — receivables should shrink in a falling-price year for a commodity seller.
- ROIC and incremental returns: **not computed** — no vault evidence. The §14 test is returns at **mid-cycle** commodity prices, not spot: FY2025's $23.6B FCF on rising capex is a single point on the cycle, not an answer. Needs the mid-cycle normalization pass.
- Debt and liquidity: ⚪ net debt/EBITDA and ⚪ EBIT/interest are both uncomputable (operating income and D&A tagging gaps); the `debtLongTerm` series is stale (latest 2017: $23.1B) and inventory is stale (latest 2011) — classic XBRL stale-tag artifacts, **explicit gaps, not zeros**. What is fresh and real: cash fell $23.0B → $10.7B (−53.6%). The balance sheet is almost certainly still investment-grade strong, but this pull cannot prove it — pull the 10-K debt note.
- Working capital: inventory-vs-cost-of-sales band ⚪ n/a (periods do not align). Manual computation needed.
- Dilution: 🟢 diluted share growth +0.2% y/y (below the 1% band) — but see §6 for what the buyback marker says about it.
- Distributions: 🟡 **dividend = 73% of FCF** — the central capital-allocation question of this review (§5.7 investigate band is 60–80%). Fully worked in §6.
- Relative return: 🟢 +41.8% vs XLE +39.2% over 12 months — within normal range of the benchmark (§7).

## 4. Operational health

Per §14 energy emphasis. Almost nothing operational is **evidenced in the vault yet** — this section is mostly a routed pull list; no metrics are fabricated to fill it.

- Customers and retention: commodity output has no retention dynamics worth tracking at this level; refining/chemicals contract structures — not pulled.
- Product and innovation: R&D rose 20% to $1.2B (facts pull) — small against $28.4B capex; the "product" is the resource base and the cost curve, not R&D.
- Employees and safety: **needs pulling** — 10-K safety/environmental performance disclosures and any incident 8-Ks. No vault evidence either way.
- Suppliers and capacity: **needs pulling** — rig/service-cost exposure and transport constraints (§14: royalties and transport).
- Sector-specific KPIs (§14 energy):
  - **Reserve life and replacement:** not in the vault. Route to the 10-K supplemental oil & gas disclosures (proved reserves, reserve replacement ratio, PV-10). This is the existential KPI for a depleting-asset business — a review of XOM without it is provisional by construction.
  - **Production decline / lifting costs:** not pulled. Well-established context (pre-cutoff): the 2024 Pioneer Natural Resources acquisition materially expanded low-cost Permian inventory, and Guyana (Stabroek) has been the structural growth-barrel story — both should show up in per-barrel cost and reserve disclosures; verify, don't assume.
  - **Sustaining vs growth capex:** the $28.4B (+16.7%) total is evidenced; the split is **not disclosed in the pull**. This split is what turns the 73%-payout question decidable: dividend / (FCF after *sustaining* capex only) is the honest coverage ratio. Route to 10-K MD&A capital-program discussion.
  - **Realized prices and hedges:** not pulled (XOM historically runs largely unhedged — verify in MD&A rather than assert).
  - **Mid-cycle returns:** judge FY2025 at mid-cycle, not spot (§14). FY2025 revenue −5% suggests below-mid-cycle realizations, which makes the 73% payout *more* forgivable — if prices were below mid-cycle. That "if" is unverified.

## 5. Stewardship and integrity

- Accounting quality: no restatements, auditor disputes, or control issues in evidence; FCF conversion of 1.03 says reported earnings are economically real. The XBRL tagging is sparse/non-standard (untagged operating income, SBC; stale debt/inventory tags) — an inconvenience for machine scrutiny, not an integrity marker by itself.
- Disclosure quality: standard large-cap disclosure; the redomiciliation was properly proxied (DEF 14A 2026-04-08) and 8-K'd with an explanatory note — procedurally clean. Non-GAAP exclusion history: not reviewed.
- Capital allocation: the long-cycle record is well-established — roughly four decades of consecutive annual dividend increases, the dividend held through the 2020 trough when several peers cut, and post-2020 structural cost reduction plus counter-cyclical acquisition (Pioneer, 2024). The FY2025 snapshot is less comfortable: dividend at 73% of FCF, buybacks that netted to nothing (§6), capex up 17%, cash halved. Discipline record vs current-year strain — the tension this review's checkpoint tests.
- Executive compensation: not reviewed — **verify in DEF 14A** (grant structure, performance conditions, any changes smuggled in alongside the redomiciliation vote).
- Board oversight: the board initiated and shareholders approved the Texas move; the "background of the merger" section of the DEF 14A (stated rationale, any dissent) is unread — **verify in DEF 14A**.
- Customer and employee treatment: no vault evidence; no §6.2 markers pulled.
- Regulatory and legal record: the governance implication of the redomiciliation is the live item — new charter/bylaws exhibits unreviewed (exculpation, forum selection, jury waiver, special-meeting and consent thresholds). This is a §7.2-style watch item, **not** a §7.3 hard-stop: nothing here is a fraud allegation, restatement, or compliance failure. `red_flag_override` stays false.

## 6. Shareholder distribution

Netted honestly (§5.6–5.7):

- Dividends: ≈$17.2B paid in FY2025 (73% of $23.6B FCF — derived from the marker; exact figure in the cash-flow statement). At 30–60% the framework calls a mature payout constructive; 73% is squarely in the investigate band. The defense is cyclical: if FY2025 was below mid-cycle, mid-cycle FCF covers this dividend comfortably. The framework (§14) says make that case explicitly at mid-cycle prices — it has not been made in this vault yet.
- Gross buybacks: dollar amount not in the pull — **explicit gap**, pull the cash-flow statement.
- Net share-count change: **+0.2%**. This is the marker that stings: 🟡 buybacks roughly offset grants — whatever was spent on repurchases bought back employee/executive issuance, not a shrinking share count. §5.6: "a buyback is not a shareholder return when it merely purchases shares issued to employees and executives." Net shareholder benefit from buybacks in this window ≈ zero.
- Stock compensation: ⚪ untagged in XBRL — pull from the cash-flow statement before concluding anything about grant scale.
- Debt used for distributions: debt tags are stale, so unproven either way — but the arithmetic is visible in cash: FCF $23.6B minus ≈$17.2B dividends leaves ≈$6.4B, while cash fell $12.3B. Dividends + buybacks + any debt service exceeded FCF, with the gap funded from the cash buffer. One year of that after a 2022–2024 cash build is a choice, not a crisis; a second consecutive year of it at these capex levels would push the §5.7 "distributions funded by asset sales, debt, or underinvestment" concern from hypothetical to actual.

## 7. Market behavior

- Relative performance: +41.8% total 12-month return vs XLE +39.2% (+2.6pp) — in line with the sector benchmark. The market is repricing the energy complex, not singling XOM out; nothing here contradicts or confirms company-specific process quality (§9: evidence about expectations, not business quality).
- Estimate revisions: **gap — not pulled.**
- Accumulation/distribution: **gap — §9.3 volume/ownership pass not done.**
- Insider activity: **gap — Forms 4/144 not pulled.**
- Ownership concentration: **gap — 13F/13G trend not pulled.**
- Short interest: **gap — not pulled.**

## 8. Process-versus-outcome classification

- Process quality: **stable** — cash conversion clean, dilution controlled, strategy consistent; no evidence of process deterioration, and the operational KPIs that would prove *improvement* (reserves, unit costs) are unpulled.
- Current outcome quality: **deteriorating** — revenue −5.0%, net income −14.4%, FCF −23%, cash −53.6%; consistent with commodity down-leg rather than company failure, but the outcomes are what they are.
- Market response: **rewarding** — +41.8% absolute, marginally ahead of the sector.
- Primary divergence: **none** actionable. Stable process + cyclically weaker results + sector-inline stock is the normal shape of an energy major mid-cycle. The pattern to watch: if FCF keeps eroding while the stock keeps re-rating, this migrates toward §13 Pattern C (good company, bad investment) — the valuation-vs-mid-cycle-economics work in §12C is what would catch it.

### Divergence sentence (§17 Step 7)

> The company's operating process is `stable`, reported results are `deteriorating`, and the market is pricing `more` future success because `the sector-wide energy re-rating carried XOM up 42% through a year in which FCF fell by a quarter and the dividend quietly climbed to 73% of free cash flow`.

## 9. Good-faith evidence

- Counter-cyclical investment: capex +16.7% and R&D +20% into a falling-price year — present cost accepted to protect future production capacity (constructive *if* the growth-capex share confirms it; §4).
- Dividend maintained through the 2020 trough when several supermajor peers cut — a decades-long record of treating the dividend as a hard promise (well-established).
- Dilution held to +0.2% — owners are not being financed with their own equity.
- Redomiciliation executed via full shareholder vote with proxy disclosure rather than a technicality — procedurally respectful even if substantively debatable.

## 10. Extraction or bad-faith risk

- The Texas redomiciliation structurally reduces minority shareholders' litigation leverage (management-protective statute, new unreviewed charter) — a legal, disclosed, shareholder-approved move that nonetheless shifts accountability *away* from owners at zero economic cost to management (§12 lens).
- Distribution pressure: 73%-of-FCF dividend plus grant-offsetting buybacks, funded partly from the cash buffer, while capex rises — the §5.7 failure mode (distributions crowd out reinvestment or get debt-funded) is one bad price year away.
- Buybacks that net to +0.2% share growth function as SBC laundering rather than shareholder return in this window — legal, common, and worth naming (§5.6).
- Climate-liability externalization: the core business emits costs (combustion externalities, reclamation, climate litigation exposure) that are only partially priced back to the company today — judged under the §12 legal-but-extractive lens, this is a structural feature of the machine, not an XOM-specific misconduct finding; the measurable pieces are reclamation/ARO liabilities and legal-proceedings reserves in the 10-K.

## 11. EDGAR follow-up

Routed via the §15 table; log meaningful changes as Intel Findings.

| Filing | Section or exhibit | Finding | Possible meaning | Next investigation |
|---|---|---|---|---|
| 8-K 2026-07-01 | Certificate of Formation + Bylaws exhibits | Redomiciliation completed; governing documents unreviewed | Benign migration vs quiet reduction in shareholder rights | Diff exculpation, forum selection, jury waiver, special-meeting/consent thresholds vs old NJ charter |
| DEF 14A 2026-04-08 | Background of the merger; comp tables | Board rationale and any dissent unread | Governance quality signal either way | Read rationale; check comp structure changes bundled with the vote; confirm whether new holdco files under a new CIK |
| 10-K FY2025 | MD&A capital program + debt note | Dividend at 73% of FCF; cash −53.6%; capex +16.7% | Cyclical trough payout vs structural overdistribution | Sustaining-vs-growth capex split; capex commitments; debt maturity schedule and interest sensitivity (§15 debt-funded-buyback row) |
| 10-K FY2025 | Revenue note / MD&A | Receivables − revenue gap +6.3pp | Payment-terms drift vs benign price-timing artifact | Payment terms, contract assets; recompute after price decomposition |
| 10-K FY2025 | Supplemental oil & gas disclosures | Reserve replacement not in vault | The depleting-asset KPI is unevidenced | Proved reserves, replacement ratio, per-barrel costs → feed §4 next review |

## 12. Score

§16 rubrics; scores are provisional where marked — gaps scored conservatively, not optimistically.

| Block | Score | Max |
|---|---:|---:|
| Economic health | 24 | 40 |
| Stewardship and integrity | 23 | 40 |
| Market confirmation | 9 | 20 |
| **Total** | **56** | 100 |

- Economic health 24/40: revenue quality 5/8 (decline undecomposed); margins 4/8 (untagged — explicit gap); cash conversion 7/8 (1.03, aligned); balance sheet 4/8 (cash halved, leverage unverifiable); returns on capital 4/8 (mid-cycle ROIC not yet computed).
- Stewardship 23/40: accounting transparency 5/8 (clean record, sparse tagging); capital allocation 4/8 (73% payout + null buybacks vs long discipline record); governance/comp 4/8 (TX charter and DEF 14A unreviewed); stakeholder treatment 4/8 (no evidence — neutral); strategic consistency 6/8 (decades of coherent strategy, counter-cyclical record).
- Market confirmation 9/20: price/estimates 3/5 (inline with XLE, estimates unpulled); ownership/accumulation 2/5 (gap); valuation vs conservative economics 2/5 (not computed); catalyst asymmetry 2/5 (nothing evidenced).
- Red-flag override: **false** — the redomiciliation is a §7.2-class watch item, not a §7.3 hard-stop event; no fraud allegation, restatement, auditor dispute, covenant breach, or going-concern issue is open.
- 56 = "mixed" band — an honest reflection of how much is still unpulled (reserves, margins, leverage, ownership) rather than a verdict that the business is mediocre. Expect this score to move materially once the §11 pulls land.

## 13. Falsifiable thesis

- Bull case: FY2025 was a below-mid-cycle year for a structurally advantaged producer (Permian scale post-Pioneer, Guyana growth barrels); at mid-cycle prices FCF recovers toward the ~$30B FY2024 level, the dividend falls back under 60% of FCF, buybacks start shrinking the share count for real, and the Texas charter proves substantively identical to the NJ one.
- Bear case: the dividend ratchet plus rising capex has quietly outgrown mid-cycle FCF; distributions keep getting funded from cash and then debt, payout trends through 80% toward 100%, reserve replacement disappoints, and the TX governance reset entrenches management just as capital-allocation pressure peaks.
- What would prove each wrong: **Bull broken if** FY2026 interim FCF annualizes below ~$24B at flat-or-better realizations, or cash keeps draining, or the charter diff reveals materially weakened shareholder rights. **Bear broken if** H1/Q3 2026 shows distributions fully covered by FCF with the cash balance stabilized ≥ $10.7B, receivables gap closed, and net share count actually declining.
- Next checkpoint and date: **Q3 2026 10-Q (by 2026-11-06)** — check (1) YTD dividends + buybacks ≤ YTD FCF with no further cash drawdown, (2) charter/bylaws and DEF 14A background reviewed and logged as a finding, (3) new holdco CIK continuity confirmed so the next `edgar health` pull is trustworthy. (Copied into `next_checkpoint` / `next_checkpoint_date`.)

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
