---
node_type: "health_review"
date: "2026-08-02"
company: "AXON ENTERPRISE, INC."
ticker: "AXON"
period: "FY ending 2025-12-31"
process_quality: "stable"
outcome_quality: "deteriorating"
market_response: "punishing"
divergence_pattern: "good-company-bad-investment"
economic_health_score: 20
stewardship_score: 20
market_confirmation_score: 6
total_score: 46
red_flag_override: false
red_flags: []
next_checkpoint: "Trailing SBC/revenue back under 20% and diluted-share growth under 4% YoY at the Q3 2026 10-Q; FY2025 10-K debt note + SBC footnote read before then to resolve the 4.94x netting and the performance-plan expense schedule"
next_checkpoint_date: "2026-11-05"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_AXON]]"
related_theses: ["[[Defense AI Autonomous Warfare]]"]
tags: [health-review]
---

# Company Health & Integrity Review — AXON ENTERPRISE, INC.

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/AXON - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker AXON` — link the pull note into `markers_pull`.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

Axon builds less-lethal weapons (TASER) and body/fleet cameras, sells them to police and public-safety agencies on multi-year contracts, and locks each device into a recurring subscription to its evidence cloud (digital evidence storage, records, real-time operations software), keeping the difference after manufacturing, cloud infrastructure, R&D — and a share-based wage bill that is now the single largest owner-borne cost in the machine. A hardware razor with an evidence-SaaS blade: the weapon or camera is the entry point; the chain-of-custody archive is the annuity. The dossier is still a scaffold with an empty `one_liner` (research_status: Scaffold) — this sentence should seed it. Evidence window: FY2025 XBRL plus the 2026-08-02 baseline; the Q1 2026 10-Q (filed 2026-05-07) is unread, so everything below describes the machine through FY2025.

## 2. What changed in the company machine?

- Positive:
	- Revenue +33.5% ($2.1B → $2.8B) with gross margin flat at 59.7% — for a hardware+SaaS mix, holding ~60% GM through 33% growth is evidence the blade is pulling its weight.
	- R&D +55.0% to $684.3M (24.6% of revenue) — the machine is being aggressively re-armed (drones/robotics/real-time ops per the acquisition trail), not harvested.
	- Cash +164.1% to $1.2B; five-year cumulative FCF conversion 1.03 — the decade's earnings have been real cash, whatever FY2025 printed.
	- Inventory discipline: +28.8% vs cost-of-sales growth, a -4.5pp divergence (🟢) — no channel stuffing visible in the razor.
- Negative:
	- SBC +65.8% ($382.6M → $634.2M), rising from ~18.4% to 22.8% of revenue — the heaviest SBC/revenue print in the 22-company research universe, and it is *accelerating*, the exact opposite of PLTR's decelerating red flag.
	- Operating income swung to a GAAP loss (-$62.1M, -2.2% margin, from +$58.5M / +2.8%) — the SBC recognition wave ate the entire operating line during a +33.5% revenue year.
	- Net income -66.9% ($377.0M → $124.7M); OCF -48.2% ($408.3M → $211.3M); FCF collapsed $329.5M → $75.1M (2.7% FCF margin, from 15.8%) — the cash deterioration is real, not just an SBC accounting artifact, since SBC adds back in OCF.
	- Diluted shares +4.9% (78.6M → 82.4M) with zero buyback offset.
	- Long-term debt appeared: $0 tagged FY2024 → $1.7B FY2025 — the first tagged leverage in the series (composition unverified, §3).
	- Goodwill +81.0% ($756.8M → $1.4B) — material FY2025 M&A; the organic vs acquired split of the 33.5% growth is not yet evidenced.
- Ambiguous:
	- Net income ($124.7M) sits ~$187M *above* operating income (-$62.1M), and FY2024's gap was ~$318M — profitability is currently determined below the operating line (interest income on the enlarged cash pile, investment marks, tax items — likely SBC windfalls). Route: 10-K income statement and other-income/tax notes.
	- Deferred revenue (current) +16.6% vs revenue +33.5% — for a SaaS-mix story, prepayments lagging revenue needs the contract-liability note (current + non-current) before it means anything.
	- Capex +72.9% to $136.3M — capacity build or real-estate; classification needed.

## 3. Financial health

Full computed table: [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_AXON]] — rollup 🟢 3 · 🟡 1 · 🔴 3 · ⚪ 4 → `signal_status: alert`. Every marker, benign vs negative reading:

- Organic revenue: +33.5% FY2025 — strong headline, but goodwill +81% means acquisitions sit inside it; no §5.1 organic split is computable from XBRL. Public-safety demand is structurally sticky (municipal contracts, evidence archives), which supports the benign reading; the negative reading — acquired revenue masking organic deceleration — is open until the 10-K acquisition footnote is read.
- Gross and operating margin: 59.7% gross, flat y/y — constructive for the mix. Operating margin 🔻 2.8% → -2.2%: the negative reading is that the machine cannot cover its true wage bill at GAAP; the benign reading is that a front-loaded, performance-plan SBC recognition wave plus +55% R&D is a documented investment year (§5.2 "growth investment"), not structural decay — GM stability is the evidence for that reading.
- FCF conversion: 🟢 **1.03** cumulative 5-FY FCF/net income and 🟢 **OCF vs earnings aligned** (OCF 169.5% of FY2025 net income). The long-window cash record is genuine. The caution: FY2025 alone produced $75.1M FCF on $2.8B revenue — the five-year 🟢 is carried by prior years, so the trend must be watched, not assumed.
- Receivables: ⚪ n/a — the receivables tag is stale (last annual value 2012; the known XBRL stale-tag gotcha). Receivable divergence must be computed manually from the FY2025 10-K balance sheet before demand quality can be called clean.
- Inventory: 🟢 -4.5pp divergence vs cost of sales — disciplined.
- Net debt / EBITDA: 🔴 **4.94x** — the centerpiece flag, and it must not be read at face value in either direction until the 10-K debt note is read:
	- *Numerator (what does the tagged concept capture?):* `debtLongTerm` has only 3 tagged years and prints **$0 at FY2024** despite Axon's well-established financing history including ~$690M of 0.50% convertible senior notes due 2027 (issued December 2022 via private placement — hence no 424B5 in the baseline). Either those converts were settled/converted during 2024's stock surge, or the tagged concept simply misses convertible instruments — the two cases imply very different dilution and leverage histories. The $1.7B appearing in FY2025 is consistent with a first straight senior-note issuance during 2025; size, coupons, maturities, and covenants are unverified.
	- *Denominator:* GAAP EBITDA here is tiny because operating income (-$62.1M) fully absorbs $634M of SBC. Add SBC back — as covenant and credit convention usually does — and leverage collapses toward ~1x against $1.2B cash plus short-term investments. But §5.6's whole point is that the add-back is the move that hides the ownership transfer: on honest GAAP economics, 4.94x is the print, and it says the business currently cannot cover its true compensation cost and its new debt from operations.
	- Net: the leverage flag and the SBC flag are substantially *the same flag*. Liquidity itself looks fine ($1.2B cash, +164%); solvency is not the issue — cost structure honesty is.
- EBIT / interest: ⚪ n/a — no interest expense tagged, which the pull glossed as "likely unlevered." That gloss is now contradicted by the $1.7B balance-sheet debt: either the notes were issued late in FY2025, carry low coupons (converts), or the tag is non-standard. Verify in the debt note; do not treat the ⚪ as benign.
- Diluted share growth: 🔴 **+4.9%** y/y — above the 3% high-concern line (detailed in §6).
- SBC / revenue: 🔴 **22.8%** — more than double the 10% high-concern threshold, rising from ~18.4%, with dollars growing twice as fast as revenue (detailed in §6). §5.6's aggravator applies verbatim: "especially serious without strong cash economics" — FY2025 FCF margin was 2.7%.
- Gross buybacks vs net share count: ⚪ n/a — no repurchases in the latest fiscal year (buyback series ends 2018). No offset to dilution — but also no buyback theater: the dilution is undisguised, which §5.6 treats as more honest than large buyback headlines that merely absorb grants.
- Dividend / FCF: ⚪ n/a — none ever paid; full-retention model.
- Working capital: inventory clean, receivables unverifiable (above), deferred revenue lagging revenue (ambiguous, §2). Payables not in the pulled set.
- Market marker (detailed in §7): 🟡 12-month return -28.9% vs XLI +20.1% (-49.0pp).

## 4. Operational health

§14 emphases straddle two lists — SaaS/cloud for the blade, industrials for the razor. Evidenced vs needs pulling, no fabricated KPIs:

- Customers and retention: **Not evidenced in the vault.** Management has disclosed net revenue retention in the low-120s percent range in recent years (well-established from company disclosures through early 2026) — that number is the entire empirical case for the "acceptable cost of a compounding franchise" reading of the SBC, and it is not yet pulled. Needed: FY2025 NRR, customer/agency counts, and any concentration disclosure from the 10-K and Q4 shareholder letter.
- Cloud ARR mix: **Not pulled.** Software & Services revenue share, its margin, and the ARR figure (management has disclosed ARR crossing the $1B mark; current figure unpulled) — the razor/blade mix determines how much of the 59.7% GM is durable. Route: 10-K segment/disaggregation note.
- International and federal expansion: cited by management as the growth vectors beyond U.S. state/local — **not evidenced**; 10-K geographic disaggregation and federal-contract discussion.
- Product and innovation: R&D $684.3M, +55.0%, 24.6% of revenue — evidenced and heavy. Goodwill +81% says M&A (counter-drone via the 2024 Dedrone acquisition is the well-established anchor; FY2025 deals unverified) is part of the product motion. Organic-vs-acquired capability split needs the acquisition footnote.
- Employees and safety: The retention mechanism *is* the SBC — company-wide market-cap-tranche equity plans (§5). If the stock keeps derating, the same plans that retained talent become a reverse flywheel: grants must grow to deliver the same value, or cash comp replaces them and the FCF story ends. TASER product-safety litigation is a decades-long, well-established feature of the business (§12 lens, factual): in-custody death suits and less-lethal classification disputes are a standing operating cost, priced into the model but requiring the legal-proceedings note each cycle.
- Suppliers and capacity: **Not evidenced** — hardware supply chain (camera components, semiconductors) and manufacturing capacity are not in the pulled set; capex +72.9% suggests a build. 10-K commitments and properties sections.
- Sector-specific KPIs (status per item): NRR **not pulled**; ARR / RPO / billings **not pulled** (deferred revenue current +16.6% is the only proxy in hand, and it lags revenue); GM 59.7% — evidenced, stable; sales efficiency **not derivable** (S&M not in the concept set); SBC and net dilution — evidenced, red (§6); customer concentration **not pulled** (municipal fragmentation likely keeps any single customer under 10%, but federal expansion changes that — verify).
- Market position and procurement (§12, factual): Axon holds a near-monopoly in conducted-energy weapons and the leading U.S. body-camera/evidence platform. The moat runs through municipal procurement dynamics — sole-source justifications, cooperative purchasing vehicles, and multi-year Officer Safety Plan bundles — and through the evidence archive itself: chain-of-custody data in Axon's cloud makes switching prohibitively costly. The moat and the §12 extraction question are the same fact, read from two directions (§10).

## 5. Stewardship and integrity

- Accounting quality: Core tags stable and the five-year cash record reconciles (conversion 1.03). Deductions: receivables tag stale since 2012, interest expense untagged despite $1.7B debt, and profitability now determined below the operating line (~$187M of FY2025 non-operating income; ~$318M FY2024) — none improper, all reducing statement legibility. Adjusted metrics excluding $634M of SBC are the §8 warning case: emphasizing adjusted EBITDA while ignoring dilution.
- Disclosure quality: Filing hygiene good — on-time 10-K (2026-02-25), routine 8-K cadence. One open item: the **10-K/A filed 2025-05-07** amending FY2024 — most likely routine Part III incorporation, but a restatement would be a §7.3 hard stop, so the cause must be established before this review's `red_flag_override: false` is final.
- Capital allocation: Full retention — no dividends, no buybacks. Cash went to R&D (+55%), M&A (+$640M goodwill), capex (+73%), and the balance sheet added its first tagged debt ($1.7B) while holding $1.2B cash. Raising debt while granting 22.8% of revenue in equity is a capital-stack choice that needs its "why" (acquisition funding? opportunistic term?) from the debt note and MD&A.
- Executive compensation: The well-established §5.6 executive-grant case, stated factually: founder-CEO Rick Smith's 2018 CEO Performance Award (12 tranches tied to market-cap and operational goals, modeled on the Tesla/Musk package) was extended to employees through the 2019 eXponential Stock Performance Plan, with a follow-on broad-based performance plan approved in 2024 — the FY2024–25 SBC surge is the GAAP recognition of that architecture. On §5.6's *design* row this scores in the low-concern column (long-horizon, performance-conditioned, real downside); on the *quantum* rows (22.8% of revenue, +4.9% dilution) it is deep red. Two DEFA14A supplements filed days before the 2025 annual meeting — one explicitly comp-related — indicate a contested say-on-pay; the 2026 vote tallies are checkable in the 8-K filed 2026-06-01 (Item 5.07).
- Board oversight: Single share class — unlike PLTR, no founder voting shield exists; the mega-grants were put to and survived shareholder votes, which legitimizes them procedurally even if the register is largely passive. Three Item 5.02 8-Ks in five months (2026-03-11, 2026-04-10, 2026-07-10) plus two Form 3s (new insiders, July 2026) — likely board/officer additions, but an unexplained CFO/controller departure would be §7.3; verify each.
- Customer and employee treatment: No documented §7.3-class events in the baseline window. The standing items are §12-class, not misconduct findings: TASER litigation history, body-camera privacy debates, and the accountability framing of the product line. The company's stated mission (reducing lethal-force deaths) is consistent with its product decisions — the identity-consistency test cuts in Axon's favor.
- Regulatory and legal record: The FTC's 2020 administrative complaint over the 2018 VieVu acquisition alleged Axon bought its closest body-camera competitor — a documented regulator allegation squarely in §12's "acquiring competitors primarily to reduce customer choice." Axon's constitutional counter-challenge reached the Supreme Court (Axon v. FTC, 2023, jurisdictional ruling) and the FTC subsequently dropped the case — resolved on process, not exoneration of the theory. Current status and any successor matters: legal-proceedings note.

## 6. Shareholder distribution

There are no distributions — everything nets to the SBC question, which *is* the distribution question here (§5.6–5.7):

- Dividends: None ever — ⚪ by design; full retention is defensible at these growth rates and reinvestment returns, *if* the reinvestment is real.
- Gross buybacks: None in the latest FY (series ends 2018). No grant-absorption theater — the dilution is naked and visible, which is the honest version of a bad number.
- Net share-count change: 🔴 **+4.9%** diluted y/y (78.6M → 82.4M), above the 3% high-concern line, with no offset even attempted.
- Stock compensation: 🔴 **$634.2M = 22.8% of revenue**, up from ~18.4%, dollars +65.8% against revenue +33.5%. Both readings, rigorously:
	- *Acceptable franchise cost:* the grants are performance-conditioned — they pay only if market-cap and operational tranches are achieved, so employees are paid out of compounding that owners also received; the expense is front-loaded GAAP recognition of plans already approved by a single-class shareholder vote; retention of the engineering and go-to-market talent that runs a ~120%-NRR franchise is the reinvestment with the highest return in the machine; and as tranches finish expensing, SBC/revenue falls mechanically without any business deterioration.
	- *Ownership transfer (§5.6):* 22.8% of revenue in equity at a premium multiple sells future cash flows cheap; market-cap hurdles reward multiple expansion as much as operating value, so employees can be paid for a derating-in-reverse; the plan architecture has been *replenished* every cycle (2018 → 2019 → 2024), making "front-loaded" a permanent state; and the aggravator is evidenced — cash economics weakened in the same year the ratio rose (FCF margin 2.7%), which is precisely when §5.6 says heavy SBC stops being tolerable.
	- The PLTR cross-check (theme 4, [[13_Company_Intel/Reviews/2026-08-02 - PLTR - Health Review]]): PLTR's 15.3% came with *flat* SBC dollars against +56% revenue — a falling ratio, elite cash conversion, and a monitorable exit path from the red band. AXON's 22.8% is heavier, rising, and arrived with collapsing FCF. On current vault evidence the retention/moat justification is a hypothesis (NRR not yet pulled) while the ownership-transfer arithmetic is already evidenced — AXON's version of the pattern is strictly worse than the one PLTR could not justify at 61/100.
- Debt used for distributions: None — no distributions exist; the new $1.7B debt funds the balance sheet/M&A, not payouts (verify use of proceeds).
- Net verdict: net shareholder yield is unambiguously negative — owners received nothing, funded a $634M equity wage bill, and were diluted 4.9%. The entire owner return rests on the retained franchise compounding faster than the share count.

## 7. Market behavior

- Relative performance: 🟡 **-28.9% over 12 months vs XLI +20.1% — a -49.0pp gap**, two and a half times the §9.2 investigation threshold, and wider than PLTR's -40.4pp. This follows a well-established multi-year run in which AXON was one of the market's strongest performers through 2024 — the derating starts from an extreme multiple.
- Estimate revisions: **Not pulled** — the decisive missing datum. Falling price with rising estimates means multiple compression; with falling estimates, a changed thesis. Route: FMP estimate endpoints.
- Accumulation/distribution: **Not pulled** — no volume-pattern or 13F trend analysis run.
- Insider activity: Steady Form 4 / Form 144 sale cadence June–July 2026 (five 4s, three 144s in the baseline window) — consistent with plan sales, **verify 10b5-1 footnotes**; no open-market insider purchases observed during the drawdown, which §9.1 would have counted as the constructive counter-signal.
- Ownership concentration: 13G/A filers only (latest 2024), no 13D ever — a passive register, but unlike PLTR the single share class means activism is *possible*, just absent.
- Short interest: **Not pulled** — check against the ~10%-of-float threshold.
- Valuation: no valuation pull in the vault; the well-established premium-multiple history plus a GAAP operating loss means even post-derating the stock likely still prices substantial flawless execution — scored as an explicit gap in §12.

## 8. Process-versus-outcome classification

- Process quality: **stable** — a split verdict, stated explicitly: the *operating* process is improving (33.5% growth at flat 59.7% GM, +55% R&D, clean inventory, five-year cash conversion 1.03), while the *stewardship* process is deteriorating (SBC accelerating to 22.8%, dilution +4.9%, first leverage, M&A-driven complexity). The two offset to stable; the framework's dimensions (§3) are kept independent in the text above.
- Current outcome quality: **deteriorating** — GAAP operating loss, net income -66.9%, OCF -48.2%, FCF -77%; only the top line improved.
- Market response: **punishing** — -49.0pp vs XLI over 12 months.
- Primary divergence: **good-company-bad-investment** (Pattern C). The franchise quality is real (monopoly razor, locked-in blade, sticky municipal demand); the investment problem is that the price assumed decades of flawless execution while the compensation bill for retaining that execution turned out to consume the entire operating line. Pattern C's cause list fits point by point: valuation embedded future margins that GAAP has never shown, ownership was crowded after the 2024 run, and the company must keep paying heavily (SBC, R&D) merely to hold its position. The §5.6 alternative — that this is quiet extraction dressed as investment — is retained as the live bear case (§10), not the base classification, because the grants are performance-conditioned, shareholder-approved, and undisguised.

### Divergence sentence (§17 Step 7)

> The company's operating process is `stable`, reported results are `deteriorating`, and the market is pricing `less` future success because `a premium multiple built through the 2023–24 run is compressing at the same time the 2024-cycle performance plans push SBC to 22.8% of revenue and GAAP operating income negative — the market is repricing both the multiple and the owners' share of the franchise's compounding, and estimate revisions and retention KPIs have not been pulled to separate the two`.

## 9. Good-faith evidence

- R&D grew +55% to 24.6% of revenue straight through a GAAP-loss year — margin was spent on product capability (drones, robotics, real-time ops), the §5.2 "growth investment" classification, not harvested to flatter a bad optics year.
- The compensation architecture ties pay to owner outcomes: market-cap and operational tranches with long horizons and real downside — §5.6's *low-concern design column* — rather than time-vested giveaways; and it was put to a single-class shareholder vote rather than imposed through a control structure.
- No financial engineering of per-share optics: no buyback theater, no dividend funded by debt, dilution reported undisguised — the bad number is at least an honest bad number.
- Mission-consistent product decisions (factual): the less-lethal weapon and the accountability camera are the same strategic identity, and the company has absorbed decades of litigation cost rather than exiting the category — present cost carried to protect the franchise's reason to exist.
- The balance sheet was built before it was levered: $1.2B cash, five-year FCF conversion of 1.03, and the first straight debt raised only after the business reached $2.8B revenue.

## 10. Extraction or bad-faith risk

- The §5.6 ownership-transfer reading is arithmetically live: 22.8% of revenue in equity, +4.9% dilution, zero offset — owners funded the wage bill and received nothing; if the plan architecture keeps being replenished (2018 → 2019 → 2024 is a pattern, not an accident), a material share of all future compounding is pre-sold to employees.
- The moat is §12-shaped: evidence archives make agency switching prohibitively costly ("making switching deliberately difficult" — benign reading: chain-of-custody integrity requires immutability), and near-monopoly CEW pricing power plus bundle pricing invites "raising prices far above cost." The return channel to watch is municipal procurement politics and budget stress.
- The FTC/VieVu episode is a documented regulator allegation of buying the closest competitor to reduce customer choice — dropped on jurisdictional grounds after Axon v. FTC (2023), not adjudicated in Axon's favor on the merits.
- Adjusted-metric framing: guidance and comp targets keyed to measures that exclude $634M of SBC (verify which measures govern bonuses in the DEF 14A) — §8's warning about emphasizing adjusted EBITDA while ignoring dilution, in a company where the excluded item is a fifth of revenue.
- Accelerating SBC into a falling stock inverts the retention loop: grants must grow to deliver the same value, which either compounds the dilution or converts to cash comp and destroys the FCF story — the same reverse flywheel flagged at PLTR, but starting from a heavier ratio moving the wrong way.

## 11. EDGAR follow-up

§15 routing for every 🔴/🟡/⚪ flag and open question:

| Marker / finding | Filing | Section or exhibit | What to look for |
|---|---|---|---|
| 🔴 Net debt/EBITDA 4.94x | FY2025 10-K (filed 2026-02-25) | Debt note, maturity table, MD&A liquidity | Composition of the $1.7B (2025 senior notes? coupons, maturities, covenants); whether the 2022 converts due 2027 were settled/converted in 2024 or sit outside the tagged concept; recompute netting with cash + short-term investments; reconcile untagged interest expense |
| 🔴 SBC 22.8% of revenue | FY2025 10-K; DEF 14A (2026-04-16); 8-K earnings exhibits | SBC footnote; comp tables; non-GAAP reconciliation | XSPP/CEO-award tranche expense schedule (how much is front-loaded recognition vs run-rate); unrecognized comp remaining; five-year exclusion history; which adjusted measure governs bonuses |
| 🔴 Diluted shares +4.9% | FY2025 10-K; DEF 14A | Statement of equity; grant tables | Gross grants vs vesting; unvested overhang; whether projected tranche vesting keeps dilution >4% |
| 🟡 -49.0pp vs XLI | Not EDGAR: FMP estimate-revision and short-interest pulls; EDGAR: Forms 4/144 | 10b5-1 footnotes on June–July Form 4s | Whether estimates fell with price; short interest vs 10% float; whether insider sales are plan-scheduled |
| ⚪ Receivables (stale tag, 2012) | FY2025 10-K | Balance sheet, allowance note | Compute receivable divergence vs +33.5% revenue manually; allowance trend |
| Goodwill +81% | FY2025 10-K; related 8-Ks | Acquisition footnote, PPA | What was bought in FY2025; organic vs acquired revenue split; earnouts |
| Non-operating ~$187M gap | FY2025 10-K | Other income, tax footnote | Interest income vs investment marks vs SBC tax windfalls — how much of net income is the operating machine |
| Deferred revenue lag (+16.6% vs +33.5%) | FY2025 10-K | Contract liability note (current + non-current), RPO | Whether total contract liabilities + RPO track revenue; billing-mix explanation |
| 10-K/A (2025-05-07) | 10-K/A itself | Explanatory note | Routine Part III incorporation vs restatement — the latter is §7.3 and flips `red_flag_override` |
| Item 5.02 cluster (Mar/Apr/Jul 2026) + Form 3s | 8-Ks 2026-03-11, 2026-04-10, 2026-07-10 | Item 5.02 text | Who left/joined; unexplained CFO/controller departure would be §7.3 |
| Say-on-pay contest | 8-K 2026-06-01 (Item 5.07); DEFA14As 2025-05-12/16 | Vote tallies | Dissent level on comp; board response to a contested vote |
| §4 KPI gaps | FY2025 10-K + Q4 shareholder letter | Segments, human capital | NRR, ARR, software mix, international/federal split, customer concentration |

Log what these reads produce as [[03_Templates/Intel_Finding]] notes against this ticker.

## 12. Score

| Block | Score | Max |
|---|---:|---:|
| Economic health | 20 | 40 |
| Stewardship and integrity | 20 | 40 |
| Market confirmation | 6 | 20 |
| **Total** | **46** | **100** |

Per-category justifications (§16 rubrics):

- Economic health — 20/40:
	- Revenue and demand quality 5/8 — +33.5% into structurally sticky demand, but organic/acquired split unknown (goodwill +81%), receivables unverifiable from XBRL, and deferred revenue lagging.
	- Unit economics and margins 3/8 — 59.7% GM stable is genuinely good; GAAP operating margin negative and incremental operating margin negative cap the category.
	- Cash conversion and earnings quality 5/8 — five-year conversion 1.03 and aligned OCF are top-band history; docked hard for FY2025's cash collapse (FCF margin 2.7%) and profitability living below the operating line.
	- Balance-sheet resilience 4/8 — $1.2B cash and no near-term distress signs, but a new unverified $1.7B debt stack, an unresolvable 4.94x print, and untagged interest coverage.
	- Returns on capital 3/8 — current GAAP returns negative, ROIC not reconstructed, +$640M goodwill unproven, capex +73%; the five-year cash record is the only support.
- Stewardship and integrity — 20/40:
	- Accounting transparency 4/8 — clean history and real cash reconciliation, docked for the giant permanent SBC exclusion, stale/absent tags, and below-the-line profitability.
	- Capital allocation and distributions 2/8 — 22.8% SBC accelerating, +4.9% dilution with no offset, first leverage added simultaneously; full-retention is defensible but what is being retained is increasingly employee-directed.
	- Governance and compensation 4/8 — performance-conditioned, shareholder-approved design (credit) vs mega-grant quantum, a contested say-on-pay, and plan replenishment every cycle (debit); single-class accountability is real and distinguishes AXON from PLTR.
	- Customer, employee, safety, supplier treatment 4/8 — no §7.3 events; standing TASER litigation and the FTC/VieVu history are documented §12 exposures; mission-consistency is a genuine positive.
	- Strategic consistency and accountability 6/8 — two decades of coherent machine evolution (weapon → camera → cloud → drones) with no KPI redefinition observed; goodwill surge adds complexity to watch.
- Market confirmation — 6/20:
	- Relative price and estimate behavior 1/5 — -49.0pp vs XLI with no estimate-revision evidence pulled to soften it.
	- Accumulation/distribution and ownership 2/5 — passive register, insider plan-selling, no accumulation evidence, nothing pulled.
	- Valuation vs conservative economics 1/5 — no pull, but GAAP-loss economics under a still-premium multiple scores low with an explicit gap.
	- Catalyst and expectation asymmetry 2/5 — mechanical SBC roll-off and the Q2/Q3 10-Qs are real observable catalysts, but expectations likely still require beats to hold price.

- Red-flag override: **false** — no §7.3 hard-stop events documented in the baseline window (no restatement confirmed, no auditor dispute, no fraud allegation, no going-concern language, no covenant breach, no late filings). Two conditional checks are open before this is final: the cause of the 2025 10-K/A, and the identity/explanation of the Item 5.02 departures. Total 46/100 lands in the §16 "fragile" band: a clear catalyst (SBC roll-off), margin of safety, and risk controls are required — versus PLTR's 61 "mixed," AXON scores 15 points lower because the same §5.6 pattern is accelerating rather than decelerating and the GAAP economics went negative while PLTR's went elite.

## 13. Falsifiable thesis

- Bull case: a public-safety compounder with a monopoly razor and an evidence-cloud blade that agencies cannot leave grows 25–30% with ~120% NRR; FY2025's ugly GAAP is front-loaded recognition of performance plans that only pay if owners also win; as tranches finish expensing, SBC/revenue falls mechanically, GAAP margins reappear, and the 24.6%-of-revenue R&D plus drone/robotics M&A becomes the next decade's razor; $1.2B cash and a real five-year cash-conversion record fund the whole path.
- Bear case: the SBC architecture is a permanent ownership transfer that gets replenished every cycle — dilution compounds above 4%/yr, GAAP profitability never arrives at the owner level, and the derating breaks the equity-retention loop, forcing cash comp that destroys the FCF story; meanwhile $1.7B of new debt, M&A masking organic deceleration, and municipal budget stress hit a stock still priced for flawless execution.
- What would prove each wrong:
	- Bull wrong if: SBC/revenue is still above 20% in the FY2026 10-K, or a new broad-based performance plan is adopted within 24 months; diluted shares grow >4% again; NRR (once pulled) prints below ~115% or falling; organic growth ex-acquisitions runs below 20%; the debt note reveals covenant or maturity pressure.
	- Bear wrong if: trailing SBC/revenue falls below ~15% by FY2027 as tranches roll off *without* a replacement plan; net dilution decelerates below 3%; GAAP operating margin returns above 5% while R&D stays above 20% of revenue; the 10-K debt note shows the 4.94x print was a tag artifact against a conservatively structured, low-coupon stack fully covered by interest income.
- Next checkpoint and date: **Trailing SBC/revenue back under 20% and YoY diluted-share growth under 4% at the Q3 2026 10-Q (expected ~2026-11-05); before then, read the FY2025 10-K debt note and SBC footnote to resolve the 4.94x netting question and the performance-plan expense schedule.** Interim observable: Q2 2026 10-Q (expected ~2026-08-06) gives the first sequential SBC print; the Q1 2026 10-Q (filed 2026-05-07) is already available and unread.

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
