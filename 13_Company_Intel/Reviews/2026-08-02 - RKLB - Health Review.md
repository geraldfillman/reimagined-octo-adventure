---
node_type: "health_review"
date: "2026-08-02"
company: "Rocket Lab"
ticker: "RKLB"
period: "FY ending 2025-12-31"
process_quality: "improving"
outcome_quality: "stable"
market_response: "rewarding"
divergence_pattern: "none"
economic_health_score: 17
stewardship_score: 25
market_confirmation_score: 8
total_score: 50
red_flag_override: false
red_flags: []
next_checkpoint: "Neutron first-flight status resolved (flown, or slip explained in filings) AND consolidated gross margin ≥ 32% with the inventory-vs-COGS divergence narrowing at the Q3 2026 10-Q; before then, read the FY2025 10-K AM/manufacturing risk factors, debt note (2029 converts status), and backlog disclosure"
next_checkpoint_date: "2026-11-10"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_RKLB]]"
price_at_review: 64.95
reconsider_price_low: 51.96
reconsider_price_high: 81.19
related_theses: ["[[Space Domain Awareness]]", "[[Hypersonic Weapons Advanced Defense]]"]
tags: [health-review]
---

# Company Health & Integrity Review — Rocket Lab

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/RKLB - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker RKLB` — link the pull note into `markers_pull`.
> Price band: `edgar triggers --set` fills default reconsideration levels (§9.4) — override with valuation-informed ones; `edgar triggers` checks them. Breach = re-review, never a trade signal.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

Rocket Lab builds small rockets around an additive-manufacturing engine line (Rutherford: combustion chambers, injectors, pumps, and valves 3D printed in ~24-hour cycles, ten engines consumed per Electron flight), launches satellites for governments and companies per mission, and sells satellite components, spacecraft, and full constellation builds through its Space Systems segment — while burning owners' cash (−$321.8M FCF) and issuing owners' shares (+7.0% diluted) to scale that same printing capability into the larger reusable Neutron rocket. This sentence seeds the dossier `one_liner` (now set; dossier moved Scaffold → Baseline this cycle). Evidence window: FY2025 XBRL plus the 2026-08-02 baseline; the FY2025 10-K (filed 2026-02-26), Q1 2026 10-Q (filed 2026-05-07), and DEF 14A (2026-04-06) are inventoried but unread — everything below describes the machine through FY2025 with the 2026 filing stream as routing, not evidence.

## 2. What changed in the company machine?

- Positive:
	- Revenue +38.0% ($436.2M → $601.8M) with gross margin +7.8pp (26.6% → 34.4%) — for a hardware company this pairing is the single most important print in the pull: scale is arriving *with* improving unit economics, the first income-statement corroboration that the additive-manufacturing cost thesis is more than a talking point.
	- Cash +205.7% to $828.7M — the war chest for Neutron was raised while the stock was strong (three 424B5 takedowns in the trailing year), not in distress.
	- Receivables +7.0% vs revenue +38.0% (−31pp divergence, 🟢) — reported growth is being collected in cash; no demand-quality smoke.
	- SBC/revenue *fell* 13.0% → 11.8% even as dollars grew +25.1% — the ratio is decelerating (PLTR-direction), not accelerating (AXON-direction).
	- Tagged long-term debt down to $1.7M; no interest burden visible — if the debt note confirms the 2029 converts are gone, the capital structure is clean equity.
- Negative:
	- FCF −$321.8M (from −$116.0M) — burn nearly tripled; OCF alone deteriorated 3.4× to −$165.5M. The machine consumed ~$0.53 of cash per revenue dollar.
	- Diluted shares +7.0% (495.9M → 530.7M) — the burn's mirror image; owners paid for the build in ownership.
	- Capex +132.9% to $156.3M and R&D +55.2% to $270.7M (45% of revenue) — spend is committed ahead of any Neutron revenue; reversibility is low.
	- Goodwill +189.7% ($71.0M → $205.8M) — a large acquired component (Mynaric laser terminals and Geost EO/IR payloads were announced in 2025 — verify close/consideration in the 10-K acquisition footnote) sits inside the growth story; the organic split is unevidenced.
- Ambiguous:
	- Inventory +33.0% vs COGS +23.3% (🟡 +9.7pp) — build ahead of launch, or demand slip? Developed fully in §3/§4.
	- Deferred revenue (current) −9.6% while revenue grew +38% — milestone recognition on long contracts drawing down prepayments (benign) or bookings not replenishing backlog (negative). Needs the contract-liability note plus backlog disclosure; only current-portion is tagged.
	- Net loss widened just $8.0M while operating loss widened $39.0M — ~$31M of below-the-line help appeared (plausibly interest income on the enlarged cash pile; verify other-income note).
	- Registrant renamed "Rocket Lab Corp" (holding-company reorganization) — mechanics and any minority-relevant terms unverified.

## 3. Financial health

Full computed table: [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_RKLB]] — rollup 🟢 3 · 🟡 1 · 🔴 2 · ⚪ 5 → `signal_status: watch`. Read through the §4 hierarchy: for a pre-FCF company, Levels 1–2 (survival, unit economics) are the markers that matter; Levels 3–5 are structurally premature, which is exactly what the five ⚪ gaps encode.

- **Level 1 — survival (the binding question):** $828.7M cash against −$321.8M FY2025 FCF ≈ 2.6 years of runway at the trailing burn — but burn is accelerating (capex +133%) and Q1 2026 burn is unread, so treat 2.6y as a ceiling. Short-term investments exist as a tagged series but no value was printed in the facts pull — explicit gap; total liquidity may be higher. No interest expense tagged, no going-concern language known, no covenant exposure visible. Survival is currently financed by the equity market, not operations: three 424B5s in twelve months is the runway-extension mechanism, and it works only while the share price cooperates. This is the machine's true dependency (dossier §6).
- **Level 2 — unit economics:** gross margin 26.6% → 34.4% is the strongest constructive evidence in the note. For the launch business specifically, cadence is the cost driver (fixed factory + range costs over more missions, ten printed engines per flight); for Space Systems, mix and prime-contract execution drive it. The segment split is **not in the XBRL pull** — pull the 10-K segment note before crediting either segment specifically (Space Systems has run ~70% of revenue in recent years, launch historically thin/negative gross margin — verify FY2025).
- Organic revenue: +38.0% headline, but goodwill +189.7% means acquisitions sit inside it; no §5.1 organic split computable from XBRL. Benign: defense/constellation demand is real and contracted. Negative: acquired revenue masking organic deceleration. Open until the acquisition footnote is read.
- FCF conversion: ⚪ n/a — cumulative 5-FY net income ≤ 0, ratio meaningless by construction (§5.3). The honest substitute: judge burn against milestones — FY2025 bought a gross-margin inflection, an SDA-class backlog (verify), Archimedes hot-fire progress, and a Neutron factory. Whether that was a good exchange is precisely the falsifiable thesis (§13).
- Operating cash flow vs earnings: 🟢 aligned in direction (both negative, OCF 83.5% of net loss) — no earnings-quality gap because there are no earnings to inflate; losses reconcile honestly to cash out the door.
- ROIC / incremental returns: ⚪ structurally n/a pre-profit. What can be watched instead: incremental gross profit (+$91.1M) against incremental invested capital (capex $156.3M + acquisitions) — a ratio worth tracking quarterly from here.
- Debt and liquidity: ⚪ net debt/EBITDA and ⚪ interest cover are n/a with EBITDA ≤ 0 — but do **not** read the $1.7M tagged long-term debt as "unlevered" at face value: Rocket Lab issued $355M of 4.25% convertible notes due 2029 in Feb 2024 (well-established), and the tag plainly doesn't capture them — the same XBRL tag-coverage gotcha as AXON's debt series. Either they were converted/settled during the 2025 run-up (plausible given the stock's move; would explain part of the +7% dilution) or they sit in an untagged concept. The FY2025 10-K debt note resolves this in minutes; until then the leverage picture is provisionally clean but unverified.
- Working capital: receivables 🟢 (−31pp); inventory 🟡 (+9.7pp vs COGS) — the framework's own §5.3 middle band is literally "temporary build ahead of launch or supply risk," which is this company's stated life situation:
	- *Benign reading (framework-native):* hardware built for a growing launch manifest and satellite backlog — Neutron vehicle hardware, Electron vehicles ahead of manifest, SDA spacecraft in WIP, plus acquired-entity inventory consolidating in (Mynaric/Geost). If true, inventory converts to revenue on flight/delivery and the divergence closes without discounting. MD&A inventory discussion + backlog composition is the test.
	- *Negative reading:* finished vehicles or components waiting on slipped customer payloads or soft bookings — the deferred-revenue drawdown (−9.6%) is the one datum that gently supports this reading, since prepaid backlog shrank while inventory grew. If both persist another two quarters, the benign story weakens materially.
	- Verdict: investigate, not concern — but it is the marker most likely to migrate to red if Neutron slips.
- Dilution and SBC (the two 🔴s): developed in §6 — the headline is that they are **financing** flags, not compensation flags, which changes their §5.6 meaning.

## 4. Operational health

§14 industrials emphases (orders, backlog quality, book-to-bill, capacity, project overruns) — and the user-designated centerpiece: **what does the record actually prove about Rocket Lab's ability to 3D print engine parts successfully?**

- **What the launch record proves (manufacturing quality evidenced by flight):**
	- *Serial production at qualification grade.* Every Electron flight consumes ten additively manufactured Rutherford engines (9 + 1 vacuum; no engine reuse in baseline economics). By the 50th mission (June 2024 — the last cumulative count that is well-established; the FY2025 count and 2025 cadence must be taken from the 10-K, not memory) the AM line had put on the order of 500 flight engines through print → hot-fire → fly. No other Western manufacturer has serially produced printed orbital engines at that unit volume. Cadence is itself the quality metric: you cannot fly frequently if the print cell yields badly.
	- *Reliability as evidence.* Electron's three in-flight failures (2020, 2021, 2023) were each root-caused, disclosed, and followed by return-to-flight within months; none is publicly attributed to a printed part failing structurally (verify each mishap attribution against 10-K risk-factor and MD&A language before treating as final). A decade of flight with the failure modes landing in electrical/stage systems rather than printed structures is meaningful statistical evidence for the AM process control.
	- *Reuse experiments as free metallurgy data.* Recovered boosters (ocean splashdown campaigns, the 2022 helicopter mid-air catch trial) and the first re-flight of a previously flown Rutherford engine (August 2023) demonstrate printed hardware surviving flight loads, salt-water immersion, tear-down inspection, and re-qualification — an inspection dataset on flown AM parts that competitors without recovery programs simply do not possess.
	- *The economics corroboration.* Gross margin rising 26.6% → 34.4% while launch cadence grew is the first filing-level evidence consistent with the claimed AM cost advantage (fast print cycles → less touch labor → cadence leverage). It is consistent with, not proof of — the segment split must be read.
- **What the record does not prove:**
	- *Unit cost.* Per-engine and per-launch costs are not disclosed anywhere in the filing set; "3D printing makes engines cheap" is an inference from cadence and blended gross margin, not a disclosed fact. Treat all specific engine-cost claims in secondary sources as unevidenced.
	- *Transfer to Archimedes.* Rutherford's genius was as much cycle selection as printing: electric pumps deleted the highest-energy turbomachinery from the manufacturing problem, making the printable envelope tractable. Archimedes (Neutron's engine) is a far larger LOX/methane engine, turbopump-fed, company-described as oxidizer-rich staged combustion (verify current cycle description) — it reintroduces exactly the hot, high-pressure rotating machinery that Rutherford's architecture avoided. Larger printed parts also mean longer builds and different residual-stress and inspection regimes (analytical inference, not company data). First hot fire at NASA Stennis (August 2024) proves printability and ignition — it does not prove rate production, flight reliability, or reuse durability. **The honest verdict: additive manufacturing of engine parts is proven at Electron scale — flight-proven, serially, across hundreds of units — and unproven at Neutron scale until Archimedes flies, and re-flies.**
	- *Cadence economics at medium lift.* Even a successful first flight leaves the reusability learning curve (recovery, refurb, re-flight rate) entirely ahead.
- **What to pull next (the AM evidence queue):** FY2025 10-K Item 1 manufacturing description and Item 1A risk factors (search for additive/manufacturing-defect language, single-facility risk, and any hypothetical → actual wording shift); MD&A Neutron milestone and schedule discussion (do not carry a first-flight date from memory — take it from the filing); backlog composition and definition (launch vs Space Systems, funded vs unfunded); Q1 2026 10-Q sequential updates; the 8-K 2026-06-29 Item 1.01 material agreement (could be Neutron-related — read the exhibit).
- Customers and retention: government-heavy (NASA, SDA, DoD hypersonics via HASTE, allied agencies) plus commercial constellations — customer concentration disclosure unread; SDA Tranche 2 Beta prime (~$515M, 18 spacecraft, well-established award) anchors Space Systems credibility. Book-to-bill and backlog: **not pulled** — the single most important operational gap for an industrials-profile review.
- Employees and safety: no §7.3-class safety events documented in the pull window. Launch is inherently failure-tolerant as a business (failures are disclosed mishaps, not cover-ups — three failures in the flight history were publicly root-caused). Headcount/attrition not pulled.
- Suppliers and capacity: vertical integration (in-house engines, structures, avionics, solar via SolAero) reduces counterparty risk but concentrates execution risk internally; specialty inputs (metal powder, carbon fiber, germanium substrates) unexamined. Capex +133% is the capacity statement — Neutron production complex and launch infrastructure.
- Sector-specific KPIs (status): backlog/book-to-bill **not pulled**; launch cadence count **not pulled for FY2025** (explicit gap, 10-K business section); segment gross margins **not pulled**; project-overrun language on Neutron **not pulled**; warranty/mission-failure reserves **not pulled**.

## 5. Stewardship and integrity

- Accounting quality: six-year clean XBRL series across all core concepts (no stale-tag rot like AXON's receivables); losses reconcile to cash honestly (OCF 83.5% of net loss); deductions for the converts/interest tag coverage gap and an unexplained 10-K/A (2025-04-30, amending FY2024 — most likely routine Part III incorporation, but a restatement would be §7.3; confirm before this review's `red_flag_override: false` is final).
- Disclosure quality: filing hygiene good — on-time 10-K, dense and prompt 8-K stream, SD conflict-minerals filings consistent with a hardware manufacturer. Mishap disclosure culture (public root-cause after failures) is a genuine integrity credit. Docked: no AM unit economics or per-segment cost disclosure (nothing improper — but the central capability is not separately measurable, the same §12.4 pattern as PLTR's AIP).
- Capital allocation: full retention plus external equity. The FY2025 sequence — raise $829M cash at strength, spend $156M capex + $271M R&D, acquire capabilities (goodwill +190%) — is coherent *if* the acquisitions integrate and Neutron delivers. Raising ahead of need at rising prices is good treasury practice (contrast with distressed dilution); doing it three-plus times in twelve months while also issuing unregistered shares (8-K Item 3.02, 2026-04-14 — [[13_Company_Intel/Findings/2026-08-02 - RKLB - Unregistered share issuance (8-K Item 3.02)|finding]]) makes dilution a standing policy whose discipline must be monitored, not assumed.
- Executive compensation: unread — DEF 14A (2026-04-06). The specific question: are executive incentives tied to Neutron milestones and margin (aligned with the thesis) or to revenue scale and share price (which serial issuance mechanically serves)? Two DEFA14A supplements, one eight days before the meeting, hint at a contested item — check the 5.07 vote tallies (8-K 2026-05-21).
- Board oversight: single share class — minority holders have real votes (unlike PLTR's Class F structure); founder-CEO-chairman Peter Beck holds the largest individual stake (verify % in proxy). Two 5.02 8-Ks (2026-03-30, 2026-06-05, the latter with a Form 3 filed the same week — likely an addition, not a departure) — identify both; an unexplained CFO/controller exit would be §7.3.
- Customer and employee treatment: no documented misconduct events in the window; the company's public engineering culture (open launch webcasts, published failure analyses) is identity-consistent with how it treats disclosure generally.
- Regulatory and legal record: no §7.3-class allegations documented in the pull. Standing exposures are structural: FAA/NZ launch licensing, ITAR/export controls, government-contract audit exposure (SDA prime). Legal-proceedings note unread.

## 6. Shareholder distribution

Nothing is distributed; everything nets to dilution-as-financing (§5.6–5.7), which is a different animal from dilution-as-compensation:

- Dividends: ⚪ none ever — correct posture for a pre-FCF builder; not a demerit.
- Gross buybacks: ⚪ none ever (series empty) — no buyback theater; the dilution is undisguised.
- Net share-count change: 🔴 **+7.0%** diluted YoY — above the 3% high-concern band, and the worst of the three-company SBC pattern set (PLTR +4.7%, AXON +4.9%). But decompose it: SBC of $71.1M at prevailing prices explains only a small fraction of ~35M new weighted shares; the bulk is **primary issuance** — ATM/shelf takedowns (424B5 trail) plus probable acquisition stock (Item 3.02 8-K → 424B7 resale registrations). Verify the split in the statement of equity.
- Stock compensation: 🔴 by band (11.8% of revenue > 10%) — but the trajectory matters more than the level:
	- *vs AXON (22.8%, accelerating, FCF collapsing → scored 46/100):* RKLB's ratio is half AXON's and **falling** (13.0% → 11.8%) with revenue outgrowing grants — the opposite dynamic. AXON's flag was a compensation architecture consuming the owner's P&L; RKLB's is a startup-normal wage bill still above the line the framework tolerates.
	- *vs PLTR (15.3%, flat dollars, elite FCF → scored 61/100):* PLTR could afford its red flag (FCF margin ~46%); RKLB cannot afford anything — but its ratio is lower than PLTR's and pointed the right way.
	- *Does pre-profit growth justify it differently?* Partially. §5.6's aggravator — "especially serious without strong cash economics" — technically applies (there are no cash economics). But the framework's concern is *ownership transfer disguised as expense*, and RKLB's version is neither disguised nor accelerating: it is the visible, decelerating cost of retaining scarce aerospace talent through a build phase, sitting beside a much larger, equally visible financing dilution. The honest statement: the 🔴 SBC band is real but the 🔴 dilution band is the one that carries the thesis weight here.
- Debt used for distributions: none — no distributions exist; conversely, equity is being used for *construction*. The net shareholder yield is unambiguously negative (−7% ownership, zero cash back): owners are buying Neutron with their percentage of the company. Whether that was a good purchase is checkable — see §13.

## 7. Market behavior

- Relative performance: 🟢 **+44.9% over 12 months vs ARKX +19.8% (+25.2pp)** — the market is rewarding, not punishing; no §9.2 underperformance prompt. The prompt runs the other way: performance this far ahead of a pre-FCF company's evidence is expectation build-up, which §13 Pattern C says to watch for (quality/success getting fully paid for before it exists).
- Estimate revisions: **not pulled** — route to FMP estimate endpoints; rising price with falling estimates would reclassify the run as multiple expansion.
- Accumulation/distribution: **not pulled** — no volume-pattern or 13F trend analysis run this cycle.
- Insider activity: Form 4 cluster late May–early June 2026 plus a July Form 4/144 pair — cadence consistent with post-vest plan sales; **verify 10b5-1 footnotes**; no open-market insider buys observed (unremarkable during a +45% run).
- Ownership concentration: 13D/A amendments through Dec 2024 mean concentrated pre-IPO/VC-era holders were still active in the register — identify filers and direction (an amendment can be an exit tranche); 13G flow otherwise passive; single share class keeps activism possible.
- Short interest: **not pulled** — check against the ~10%-of-float threshold; pre-FCF space names habitually carry meaningful short interest, so this gap matters for the crowding read.

## 8. Process-versus-outcome classification

- Process quality: **improving** — unit economics (GM +7.8pp), manufacturing capability (AM line cadence, Archimedes hot-fire progress), customer base (SDA-class primes), and vertical integration all moved forward; the financing process (raise at strength, before need) was also executed well. The deteriorating element — burn tripling — is the *planned* consequence of the build, not process decay.
- Current outcome quality: **stable** — net loss roughly flat (−$190.2M → −$198.2M), operating loss wider, FCF much worse, but revenue +38% and gross margin +7.8pp: the reported-results ledger nets to "not yet better, not worse in kind."
- Market response: **rewarding** (+25.2pp vs ARKX).
- Primary divergence: **none** — the market's direction agrees with the process direction. The caveat that keeps this honest: the market is paying *ahead* of outcomes, so the position most exposed to disappointment is not "the market is missing improvement" (Pattern A) but "the market has pre-paid for improvement that still requires a first flight" — a Pattern C precursor to monitor, not a current divergence.

### Divergence sentence (§17 Step 7)

> The company's operating process is `improving`, reported results are `stable`, and the market is pricing `more` future success because `Electron's cadence economics finally showed up in gross margin (26.6% → 34.4%) and investors are extending that additive-manufacturing proof to Neutron before Archimedes has flown — paying now for a scale-up whose cash cost (−$322M FCF, +7% dilution) is still being charged to owners each quarter`.

## 9. Good-faith evidence

- Failure transparency as culture: three in-flight losses across the flight history were publicly root-caused with disclosed corrective actions and rapid return-to-flight — the launch-industry equivalent of recall honesty; present cost (revenue halts, disclosure) absorbed to protect franchise credibility.
- Financing conservatism inside an aggressive plan: equity raised at strength and ahead of need rather than debt layered onto a pre-FCF machine or a desperate raise after a slip; tagged leverage near zero.
- R&D at 45% of revenue through a loss year — margin spent on the next vehicle rather than harvested to flatter optics; capex committed to capability (factory, launch complex) not headquarters.
- Reuse experiments (booster recovery, engine re-flight) run as public engineering campaigns with disclosed results — spending money to learn in the open.
- SBC ratio falling while revenue scales — the wage bill is being grown slower than the company, the opposite of extraction dynamics.

## 10. Extraction or bad-faith risk

- Serial dilution as path-of-least-resistance: a standing shelf + repeated ATM takedowns + unregistered issuance (Item 3.02) is efficient — and habit-forming. The machinery that funded Neutron at +45% can quietly keep running after the need passes; the discipline test is whether issuance stops once FCF inflects.
- Acquisition roll-up opacity: goodwill +190% with unread PPAs means the organic/acquired growth split is management's story until the footnote is read — the classic §11-adjacent risk of acquired revenue masking core deceleration.
- Milestone-communication risk: pre-revenue programs reward promotional schedule language; the check is filing-language drift (risk factors and MD&A hedging vs press-release confidence) — compare across the FY2025 10-K and the next two 10-Qs.
- Non-GAAP framing: verify which adjusted measures management emphasizes and whether comp targets key to them (DEF 14A) — at 11.8% SBC the exclusion is material though not AXON-scale.
- SPAC-era heritage: the company came public through the 2021 SPAC channel whose class produced weak governance on average; RKLB's single class and founder stake mitigate, but proxy-level verification (related parties, earnout remnants) is still owed.

## 11. EDGAR follow-up

§15 routing for every 🔴/🟡/⚪ flag and open question:

| Marker / finding | Filing | Section or exhibit | What to look for |
|---|---|---|---|
| 🔴 Diluted shares +7.0% | FY2025 10-K; S-3ASR + 424B5s (2025-03-11, 2025-05-30, 2025-09-15, 2026-03-17, 2026-05-20); DEF 14A | Statement of equity; use-of-proceeds; comp tables | Decompose ATM vs acquisition stock vs SBC; cumulative issuance tally; whether proceeds map to Neutron capex or general purposes |
| 🔴 SBC 11.8% of revenue | FY2025 10-K; DEF 14A (2026-04-06) | SBC footnote; comp tables | Grant mix (time vs performance), unrecognized comp, whether ratio decline is structural or price-driven; which measures govern bonuses |
| 🟡 Inventory +9.7pp vs COGS | FY2025 10-K; Q1 2026 10-Q (2026-05-07) | MD&A inventory discussion; backlog disclosure; segment note | Build-ahead-of-launch/backlog explanation vs finished-goods aging; reconcile against deferred-revenue drawdown (−9.6%) |
| ⚪ Debt markers n/a + $355M 2029 converts vs $1.7M tag | FY2025 10-K | Debt note; interest disclosure | Converts outstanding, converted, or settled? Reconcile untagged interest; confirm effectively-unlevered read |
| ⚪ FCF conversion / ROIC n/a (pre-profit) | FY2025 10-K + next 10-Qs | MD&A liquidity; capex discussion | Burn-vs-milestone framing; incremental gross profit vs incremental invested capital as the substitute ratio |
| Item 3.02 unregistered issuance (8-K 2026-04-14) | The 8-K + 424B7s (2025-08-12, 2026-05-08) | Item 3.02 text; resale prospectus selling-holder tables | Who received shares, for what consideration — acquisition stock hypothesis ([[13_Company_Intel/Findings/2026-08-02 - RKLB - Unregistered share issuance (8-K Item 3.02)|finding]]) |
| Goodwill +189.7% | FY2025 10-K; related 8-Ks | Acquisition footnote, PPA | Mynaric/Geost consideration, earnouts, acquired revenue contribution (organic split) |
| Deferred revenue −9.6% | FY2025 10-K | Contract liability note (current + non-current), backlog/RPO-equivalent | Whether total contract liabilities + backlog track revenue; SDA milestone-billing explanation |
| AM capability evidence (§4 centerpiece) | FY2025 10-K | Item 1 manufacturing; Item 1A risk factors; MD&A Neutron discussion | AM-defect/single-facility risk language, hypothetical → actual drift; FY2025 cumulative launch count; Neutron schedule language from the filing, not memory |
| 10-K/A (2025-04-30) | 10-K/A explanatory note | Cover/explanatory note | Routine Part III vs restatement — the latter is §7.3 and flips `red_flag_override` |
| 5.02 pair (2026-03-30, 2026-06-05) + Form 3 | The 8-Ks | Item 5.02 text | Who left/joined; CFO/controller departure would be §7.3 |
| 8-K 2026-06-29 Item 1.01 | The 8-K | Exhibit 10.x/99.x | Material agreement contents — contract win, financing, or partnership |
| Proxy contest signal (DEFA14A 2026-05-12) | DEF 14A + 8-K 2026-05-21 (5.07) | Vote tallies | Say-on-pay dissent; any contested proposal |
| §7 market gaps | Not EDGAR: FMP estimates, short interest; EDGAR: Forms 4/144, 13D/A (Dec 2024) | 10b5-1 footnotes; 13D/A filer identity | Estimate direction under the +45% run; short-interest crowding; whether concentrated holders are exiting |

Log what these reads produce as [[03_Templates/Intel_Finding]] notes against this ticker.

## 12. Score

| Block | Score | Max |
|---|---:|---:|
| Economic health | 17 | 40 |
| Stewardship and integrity | 25 | 40 |
| Market confirmation | 8 | 20 |
| **Total** | **50** | **100** |

Per-category justifications (§16 rubrics). Stated plainly: **a pre-FCF company caps its own economic-health score by construction** — three of five categories cannot earn top marks without positive cash economics that do not yet exist. The 50 is not a prediction of failure; it is the framework refusing to pay for promises.

- Economic health — 17/40:
	- Revenue and demand quality 5/8 — +38% with clean receivables and contracted government demand; docked for unknown organic split (goodwill +190%) and shrinking deferred revenue.
	- Unit economics and margins 4/8 — GM +7.8pp to 34.4% is genuine, trajectory-positive evidence; GAAP operating margin −38% caps the category.
	- Cash conversion and earnings quality 2/8 — FCF −$321.8M, OCF 3.4× worse; honest (losses = cash out) but the category measures conversion, and there is none.
	- Balance-sheet resilience 5/8 — $829M cash, ~2.6y runway, near-zero tagged debt; docked for accelerating burn, converts-tag uncertainty, and total dependence on the equity window.
	- Returns on capital 1/8 — negative returns, capex +133% with returns entirely ahead, unproven goodwill.
- Stewardship and integrity — 25/40:
	- Accounting transparency 5/8 — complete six-year tag series, honest loss/cash reconciliation; docked for converts/interest tag gap and the unverified 10-K/A.
	- Capital allocation and distributions 4/8 — raising at strength ahead of need is competent treasury; +7% dilution and a habit-forming issuance machine with unread use-of-proceeds cap it.
	- Governance and compensation 5/8 — single class, founder economic alignment, decelerating SBC ratio; docked for unread proxy, possible contested item (late DEFA14A), unexplained 5.02s.
	- Customer, employee, safety, supplier treatment 5/8 — failure-transparency culture is a real credit; no documented misconduct; docked for unread legal-proceedings and concentration notes.
	- Strategic consistency and accountability 6/8 — five years of coherent ladder (launch → components → prime → Neutron) with the same core capability reused at each rung; complexity from M&A is the watch item.
- Market confirmation — 8/20:
	- Relative price and estimate behavior 3/5 — +25.2pp vs ARKX is confirmation; docked for no estimate-revision evidence.
	- Accumulation/distribution and ownership 2/5 — nothing pulled; 13D/A direction unknown.
	- Valuation vs conservative economics 1/5 — no valuation pull, but a pre-FCF company after a +45% run cannot score well against *conservative* economics; explicit gap.
	- Catalyst and expectation asymmetry 2/5 — Neutron first flight is a real, dated, observable catalyst; the asymmetry cuts against holders because success looks priced and failure does not.

- Red-flag override: **false** — no §7.3 hard-stop events documented in the pull window (no restatement confirmed, no auditor dispute, no fraud allegation, no going-concern language, no covenant breach, no late filings). Conditional checks before this is final: the 10-K/A cause, and the two 5.02 identities. Total 50/100 lands in the §16 "fragile" band (40–54): clear catalyst — yes (Neutron); margin of safety — must come from position sizing, not price, given the run; risk controls — the §13 checkpoints. Context in the SBC pattern set: AXON 46 (heavier, accelerating SBC + FCF collapse), RKLB 50 (financing-driven dilution, improving unit economics, pre-profit cap), PLTR 61 (red flag with elite cash economics to pay for it).

## 13. Falsifiable thesis

- Bull case: the additive-manufacturing production system is the company — Electron proved it (hundreds of flight engines, cadence-second-only-to-SpaceX, GM inflecting), and Neutron is the same capability recompiled at medium lift; defense constellation demand ([[Space Domain Awareness]]) and hypersonic test demand ([[Hypersonic Weapons Advanced Defense]], HASTE) fill both segments; the $829M raised at strength buys the company through first flight without a distressed raise, and gross margin keeps climbing as cadence and mix compound.
- Bear case: Archimedes is not Rutherford — the turbomachinery Rutherford's electric pumps deleted is back, at reuse-grade requirements, and the transfer fails or slips repeatedly; burn (already −$322M and accelerating) exhausts the runway, the equity window shuts on the derating, and dilution compounds at falling prices; meanwhile SpaceX's price umbrella drops (Starship cadence) before Neutron earns a dollar, and the Space Systems "growth" proves substantially acquired.
- What would prove each wrong:
	- Bull wrong if: Neutron first flight has neither occurred nor been credibly re-scheduled in filings by mid-2027; consolidated gross margin prints < 30% for two consecutive quarters; inventory divergence stays > +10pp while deferred revenue keeps falling (build-ahead story failing); a 424B5 prices materially below the prior takedown (financing on worsening terms); 10-K organic split shows acquired revenue carried FY2025.
	- Bear wrong if: Archimedes completes qualification and Neutron flies with the AM production system delivering engines at the 9+1 template; gross margin holds ≥ 34% through the ramp; dilution decelerates below ~4% in FY2026 with the cash cushion intact; backlog (once read) shows book-to-bill > 1 with launch and systems both contributing.
- Next checkpoint and date: **Q3 2026 10-Q window (expected ~2026-11-10): Neutron first-flight status resolved in filings (flown, or slip explained), consolidated gross margin ≥ 32%, and the inventory-vs-COGS divergence narrowing. Before then: read the FY2025 10-K AM/manufacturing risk factors, debt note (2029 converts), backlog disclosure, and the Q2 2026 10-Q (expected ~2026-08-07) for the first sequential burn print.** (Copied into `next_checkpoint` / `next_checkpoint_date`.)

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
