---
node_type: "health_review"
date: "2026-08-02"
company: "Air Products & Chemicals, Inc."
ticker: "APD"
period: "FY ending 2025-09-30"
process_quality: "improving"
outcome_quality: "deteriorating"
market_response: "ignoring"
divergence_pattern: "troubled-company-good-trade"
economic_health_score: 15
stewardship_score: 19
market_confirmation_score: 8
total_score: 42
red_flag_override: false
red_flags: []
next_checkpoint: "FY2026 10-K: capex below FY2025's $7.0B (project-spend peak confirmed), OCF−capex gap narrowing materially from −$3.8B, no new Item 2.06 impairment 8-Ks after 2026-06-30, and the debt footnote read to replace the stale-XBRL leverage gap with real maturity and coverage numbers"
next_checkpoint_date: "2026-11-26"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_APD]]"
price_at_review: 294.89
reconsider_price_low: 235.91
reconsider_price_high: 368.61
related_theses: []
tags: [health-review]
---

# Company Health & Integrity Review — Air Products & Chemicals, Inc.

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/APD - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker APD` — link the pull note into `markers_pull`.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

Air Products builds air-separation and hydrogen plants on or next to customer sites and sells the molecules — hydrogen, oxygen, nitrogen, helium — to refineries, chemical plants, and electronics fabs under long-term take-or-pay contracts, the same rent-the-molecule machine as Linde; what differs is that management levered that contracted core to fund a first-mover fleet of clean-hydrogen mega-projects, several of them ahead of signed offtake.

This is the review's spine: [[13_Company_Intel/Reviews/2026-08-02 - LIN - Health Review]] scored 72/100 on the identical industry machine (FCF conversion 1.01, dividend 55% of FCF, 1.37x leverage). APD's sheet fired two reds on the same arithmetic (FCF conversion −0.72, dividend against FCF ≤ 0). Same on-site/take-or-pay structure, opposite capital-allocation outcome — the divergence is management behavior, not industry economics (Universe Map theme 10, the management-vs-structure experiment).

The dossier `one_liner` is empty (`research_status: Scaffold`) — propose: "Builds gas plants on customer sites and sells hydrogen, oxygen, and nitrogen under long-term take-or-pay contracts." The dossier should absorb this review's skeleton.

## 2. What changed in the company machine?

- Positive:
	- Working-capital discipline held through the turmoil: receivables +4.4% vs revenue −0.5% (+4.9pp, inside band) and inventory +1.4% vs cost of sales (+0.3pp) ([[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_APD]]).
	- Diluted shares flat (222.8M → 222.7M, −0.0%) and SBC only $76.4M (0.6% of revenue) — the capex program was not funded by quiet dilution ([[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Facts_APD]]).
	- Deferred revenue (current) +5.6% to $253.4M — weak positive evidence of ongoing customer prepayment.
- Negative:
	- Operating income swung from +$4.5B (36.9% margin) to −$877M (−7.3%); net income from +$3.8B to −$394.5M — the arithmetic shadow of the 2025 project-exit impairments (facts pull; see §5).
	- OCF fell 10.7% to $3.3B while capex rose 3.3% to $7.0B — FCF −$3.8B, worse than FY2024's −$3.1B. Capex is 58% of revenue (LIN: 16%).
	- Cash down 37.7% ($3.0B → $1.9B) while the dividend was maintained — the funding gap was bridged by cash drawdown and serial bond issuance (424B2/FWP offerings 2025-02 and 2025-06, [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Baseline_APD]]).
- Ambiguous:
	- Capex still rising into FY2025 — is $7.0B the peak? The falsifiable checkpoint (§13) hangs on this.
	- 8-K filed 2026-06-30 with Item 2.06 (material impairments) — the cleanup is not finished; exhibit unread, project and size unknown.
	- Goodwill +6.5% to $963.9M and R&D −3.9% to $96.3M — both small; the moat is capital and contracts, not research or M&A.

## 3. Financial health

Marker sheet ([[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_APD]]): **6 🟢 · 0 🟡 · 2 🔴 · 3 ⚪** → `signal_status: watch`. Both reds are the same fact seen twice: the capex program consumed more cash than the business produced, for years.

Side-by-side with LIN (same industry, same-day pulls):

| Marker | APD | LIN | Reading |
| --- | --- | --- | --- |
| 5-FY cumulative FCF / NI | **−0.72 🔴** | 1.01 🟢 | APD burned more than all reported earnings; LIN's earnings are fully cash-backed |
| Capex / revenue (latest FY) | ~58% ($7.0B / $12.0B) | ~16% ($5.3B / $34.0B) | Same machine, 3.7x the capital intensity — this is the bet |
| Operating margin | −7.3% FY2025 (36.9% FY2024) | 26.3% | APD's underlying contracted core out-margined LIN before the impairments |
| OCF / net income | −826% FY2025 (95.3% FY2024) | 150% | Distorted by the loss year; pre-charge conversion was normal |
| Dividend / FCF | **FCF ≤ 0 🔴** | 55% 🟢 | §5.7 serious-concern row vs mid-band comfort |
| Net debt / EBITDA | ⚪ (XBRL debt tags stale since FY2016) | 1.37x 🟢 | APD's leverage is unmeasurable from the vault — explicit gap, §11 |
| Diluted shares YoY | −0.0% | −2.1% | Neither dilutes; LIN also shrinks |
| 12-mo return vs XLB | +4.7% (−11.6pp) | +4.1% (−12.2pp) | The market treats them almost identically (§7) |

- Organic revenue: $12.0B, −0.5% (FY2025 vs FY2024). Price/volume/currency split not in XBRL — needs the 10-K MD&A; flat revenue on a contracted book is not itself alarming but the exited projects' revenue contribution needs isolating.
- Gross and operating margin: gross margin ⚪ (gross-profit tag stale since FY2020 — check the filing); operating margin −7.3%, entirely impairment-driven — FY2024's 36.9% is the better read of the underlying machine, and it is excellent.
- FCF conversion: cumulative 5-FY FCF/NI = **−0.72 🔴** — below the §5.3 50% line with, in fairness, exactly the "growth-capex explanation" the band asks about. §5.2 classification is the real question (see §5): how much of that capex was growth investment and how much was waste? The FY2025 impairments answer part of it — by management's own action, some of it was waste.
- ROIC and incremental returns: not computed — explicit gap. The exited projects had negative realized returns by definition; incremental returns on the surviving backlog (Louisiana, NEOM) are the decisive unknown.
- Debt and liquidity: ⚪ net debt/EBITDA and ⚪ EBIT/interest (stale tags FY2016/FY2023 — likely retired tags, not zero debt: the company issued bonds twice in 2025). Cash $1.9B, down 37.7%. Actual leverage must come from the FY2025 10-K debt note — highest-priority gap in §11.
- Working capital: receivables +4.9pp over revenue growth (🟢, just inside band — the sign is adverse, watch it); inventory +0.3pp 🟢.

## 4. Operational health

§14 industrials emphasis. As with LIN, most of this layer is not yet evidenced in the vault — the XBRL skeleton cannot see it.

- Customers and retention: take-or-pay contract durations and renewal mix — needs pulling (FY2025 10-K revenue-recognition footnote). Deferred revenue +5.6% is weak positive evidence.
- Product and innovation: R&D $96.3M (0.8% of revenue), shrinking — the franchise is engineering execution and contracts, not research. Consistent with the industry pattern (LIN: $147M on 2.8x the revenue).
- Employees and safety: no evidence in vault. Industrial gases are safety-critical; pull incident disclosures before scoring above neutral.
- Suppliers and capacity: energy input pass-through on on-site contracts — verify language in the filing. For the hydrogen projects, the critical counterparties are offtakers, not suppliers — an uncontracted plant has no one to pass costs to.
- Sector-specific KPIs (§14 industrials: backlog quality, book-to-bill, cancellation rates, project overruns):
	- Project backlog: **needs pulling** — size, contracted vs uncontracted share, on-stream dates (10-K MD&A). For APD this is not a growth question but a survival-of-the-thesis question: how much of the remaining $7.0B/yr spend has signed offtake?
	- Hydrogen mega-project status: public record through early 2026 has the Louisiana blue-hydrogen complex and the NEOM green-hydrogen JV as the surviving flagships, with 2025 exits including the Massena, NY green-hydrogen and World Energy SAF projects — **project-level status, completion cost, and offtake coverage all need the FY2025 10-K and the 2026 earnings 8-Ks**; only the aggregate arithmetic (op income −$877M) is vault-evidenced.
	- Project overruns/cancellations: evidenced — the FY2025 charges and the further Item 2.06 8-K (2026-06-30) are cancellation receipts; per-project detail unread.
	- On-site vs merchant mix and utilization: needs pulling — merchant carries the cyclical risk; the contracted on-site share determines how safe the core really is.

## 5. Stewardship and integrity

The 2024–2025 activist episode is the stewardship story. Public record (well-established, through early 2026): Mantle Ridge disclosed a multi-billion-dollar APD stake in October 2024 and campaigned on CEO succession and capital discipline; at the 2025-01-23 annual meeting shareholders seated Mantle Ridge founder Paul Hilal and additional nominees from its slate; in February 2025 the board named Eduardo Menezes — a former Linde executive — CEO, succeeding longtime CEO Seifi Ghasemi; the new management then announced exits from several US clean-energy projects with multi-billion-dollar charges. In-vault corroboration: the paired DEFA14A solicitations of 2025-01-17 (contest-window materials), the 8-K 2025-11-25 (Item 5.02, officer/director change — unread), the FY2025 operating-income swing to −$877M, and the Item 2.06 impairment 8-K of 2026-06-30 ([[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Baseline_APD]], facts pull). Note the provenance: the repair playbook was imported from the control company in this experiment.

- Accounting quality: working-capital and SBC markers clean; OCF tracks earnings direction 🟢. Four stale XBRL series (gross profit FY2020, debt FY2016, interest FY2023, buybacks FY2015) read as tag choices, not manipulation — but they blind the leverage markers and must be replaced with filing numbers (§11). No restatements or auditor issues on file.
- Disclosure quality: impairments surfaced through the proper channel (8-K Item 2.06) rather than buried in adjustments — constructive. Depth of project-level disclosure not yet assessed (filings unread).
- Capital allocation: the core failure, stated plainly — over the 5-FY window the company invested more than everything it earned (cumulative FCF −0.72x net income) while maintaining the dividend, forcing serial debt issuance. §5.2 classification: the exited projects are, by management's own subsequent action, reclassified from growth investment to **waste** — the impairment charge is the receipt. The surviving backlog remains classed as growth investment only until offtake evidence says otherwise. The 2025 derisking is genuine repair spending; credit for it belongs to the new regime and the shareholders who forced it.
- Executive compensation: DEF 14A filed 2025-12-11 (2026-01-28 meeting) is in the baseline but **unread** — the key question is whether incentives were rebuilt around returns/FCF rather than project scale.
- Board oversight: accountability arrived from outside via a contested proxy — the prior board did not self-correct; the refreshed board acted within months. 8-K 2026-01-29 (Item 5.07) has the 2026 AGM vote results — **unread**; check support levels for the new slate and say-on-pay.
- Customer and employee treatment: no evidence in vault either way; tied to the safety pull in §4.
- Regulatory and legal record: nothing flagged in the pulls; no §7.3 hard-stop events on file (a material impairment is not a hard-stop event).

## 6. Shareholder distribution

- Dividends: paid against FCF ≤ 0 🔴 (§5.7 serious-concern row). Dollar amount not in the pull notes — explicit gap (dividendsPaid series exists in the coverage table; extract the figure). The arithmetic, honestly: with FCF at −$3.8B, every dividend dollar in FY2025 was by necessity funded by debt, asset sales, or the $1.1B cash drawdown — the vault's financing trail is cash −37.7% plus the 2025-02 and 2025-06 bond offerings. APD's multi-decade dividend-increase streak is widely cited — verify the exact streak in the 10-K before citing it, and note that the streak itself is the constraint that kept the payout running through a negative-FCF capex program.
- Gross buybacks: none in the latest fiscal year (⚪; series stale since FY2015) — correctly zero, given the funding gap.
- Net share-count change: −0.0% (222.8M → 222.7M) — flat, no dilution, no shrink.
- Stock compensation: $76.4M, 0.6% of revenue 🟢 (+23.6% YoY off a small base — watch the trend, not the level).
- Debt used for distributions: **yes, by arithmetic necessity** — this is the difference from LIN, where the same question was an open reconciliation item; here FCF ≤ 0 removes the ambiguity. The §12 lens ("issuing debt to fund distributions") applies even though every step was legal and disclosed.

## 7. Market behavior

- Relative performance: 12-month APD +4.7% vs XLB +16.3% (−11.6pp) 🟢, within the §9.2 band — and almost identical to LIN (+4.1%, −12.2pp). The market spent the year treating the universe's only clean sheet and its worst capital-allocation record the same: it is neither punishing APD's loss year nor rewarding the reset. Per the §3 state table, "improving process before results improve / stock unchanged" reads as a possible early turnaround — that is evidence about expectations, not proof.
- Estimate revisions: **gap — not pulled.**
- Accumulation/distribution: **gap — not pulled** (§9.3 volume markers need the manual pass).
- Insider activity: cluster of eight Form 4s filed 2026-07-02 (period 2026-06-30) — pattern suggests routine annual grants but classify only after reading; one Form 144 (2026-05-01). No open-market-purchase evidence found yet — under §9.1, management buying during the controversy would have been a strong signal; check the Form 4 transaction codes.
- Ownership concentration: baseline shows only 13G-type filings (latest 2024-11-12); **no 13D appears in the pulled window despite the public activist campaign** — pull the Mantle Ridge filer index directly to complete the §15 activist routing. 13F trend: gap.
- Short interest: **gap — not pulled.**

## 8. Process-versus-outcome classification

- Process quality: **improving** — board refreshed, CEO changed, loss-making projects exited, and the impairment receipts published; the capital-discipline machinery LIN never lost is being installed at APD.
- Current outcome quality: **deteriorating** — net loss, operating margin −7.3%, FCF −$3.8B and worse than prior year, cash down 37.7%, revenue flat.
- Market response: **ignoring** — +4.7% absolute, 11.6pp behind XLB, indistinguishable from healthy LIN's relative return.
- Primary divergence: **troubled-company-good-trade (Pattern D, under investigation)** — bankruptcy risk is not the setup here; the Pattern D mechanics are depressed expectations plus a dated, observable inflection (capex peak → FCF turn). §13's caveat stands: a good trade would not by itself make APD a good steward — that verdict needs the offtake and leverage evidence.

### Divergence sentence (§17 Step 7)

> The company's operating process is `improving`, reported results are `deteriorating`, and the market is pricing `about the same` future success because the impairment loss and a fifth year of negative free cash flow dominate the reported numbers, and investors are waiting for the post-activist capital discipline to show up as a cash inflection in the filings rather than in the narrative.

## 9. Good-faith evidence

- New management exited failing projects and took the loss in the open — operating income −$877M is the visible price of admitting the mistake rather than defending sunk costs (facts pull; §10 present-cost test).
- Impairments disclosed through Item 2.06 8-Ks rather than laundered into adjusted metrics — the 2026-06-30 filing shows the discipline continuing even when the news is bad (baseline pull).
- The capex program was funded transparently — public bond offerings and cash, not dilution (shares flat, SBC 0.6% of revenue) or supplier stretching (working-capital markers clean).
- §10.4 applies to the original hydrogen bet: even granting good-faith strategic conviction — first-mover clean-hydrogen capacity for the energy transition — integrity of intent did not create offtake. Good faith does not create product-market fit; the impairments are that principle in ledger form.

## 10. Extraction or bad-faith risk

- Dividend maintained through five FCF-negative years — legal, disclosed, and still the §12 pattern of issuing debt to fund distributions; the streak's optics were prioritized over balance-sheet conservatism, and the bill is the unmeasured debt load in §11 (markers + baseline pulls).
- The prior regime committed multi-billion capex ahead of contracted offtake and the board did not stop it — accountability had to be purchased by an outside shareholder through a proxy contest. The governance system failed before the projects did (public record; DEFA14A trail in baseline).
- Impairments are not finished — the 2026-06-30 Item 2.06 filing means part of the surviving backlog may still be waste under §5.2; until the exhibit is read, assume the cleanup is ongoing (baseline pull).
- Leverage is unverifiable from XBRL while the company serially issues bonds — almost certainly a tagging artifact, but an unmeasurable debt load during a negative-FCF program is the single most dangerous unknown on this sheet (markers pull, fiscal-coverage table).

## 11. EDGAR follow-up

Both 🔴 markers and the open items route via §15:

- Filing: FY2025 10-K (filed 2025-11-20) · 8-K 2026-06-30 (Item 2.06) · 8-K 2025-11-25 (Item 5.02) · DEF 14A 2025-12-11 · 8-K 2026-01-29 (Item 5.07) · Q3 FY2026 10-Q (filed 2026-07-30) · 424B2s of 2025-02 and 2025-06 ([[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Baseline_APD]]).
- Section or exhibit: 10-K debt footnote and maturity schedule (replaces the ⚪ leverage markers); commitments footnote and MD&A backlog (remaining capex commitments, contracted vs uncontracted); impairment/exit footnote (per-project charges); 8-K 2.06 exhibit (which asset, size, remaining exposure); proxy comp metrics; 5.07 vote results; 424B2 use-of-proceeds.
- Finding: 5-FY FCF conversion −0.72 and dividend paid against FCF ≤ 0, alongside an ongoing impairment program and stale debt tags.
- Possible meaning: either FY2025–FY2026 is the spend peak and the exits mark the bottom of the capital-discipline cycle (Pattern D trade setup), or the backlog still contains uncontracted capacity that keeps FCF negative and forces a payout reset (value-trap branch).
- Next investigation: (1) extract real debt, maturities, and interest from the FY2025 10-K — kill the ⚪s; (2) read the 2026-06-30 impairment 8-K exhibit; (3) tabulate remaining capex commitments and offtake coverage for Louisiana and NEOM; (4) read the DEF 14A comp design and 2026 vote results; (5) pull the Mantle Ridge filer index for the missing 13D trail; (6) extract the FY2025 dividends-paid dollar figure; log each as an Intel Finding.

## 12. Score

§16 rubrics. A 42 lands in the 40–54 band — **fragile; require a clear catalyst, margin of safety, and risk controls** — which describes the situation exactly: the catalyst is named (capex peak → FCF inflection), and the risk controls are the unread debt note and impairment trail.

| Block | Score | Max |
|---|---:|---:|
| Economic health | 15 | 40 |
| Stewardship and integrity | 19 | 40 |
| Market confirmation | 8 | 20 |
| **Total** | **42** | 100 |

Economic health (15/40):
- Revenue and demand quality 4/8 — contracted on-site demand structure is genuinely strong, but revenue fell 0.5% and the organic split is unverified.
- Unit economics and margins 4/8 — the underlying machine printed 36.9% operating margin in FY2024, above LIN; FY2025's −7.3% is impairment noise, but a machine that generates charges this size cannot score as if the noise were free.
- Cash conversion and earnings quality 2/8 — cumulative 5-FY FCF/NI of −0.72 🔴; OCF still positive and aligned with earnings direction prevents a zero.
- Balance-sheet resilience 3/8 — cash halved to $1.9B, serial bond issuance, and leverage unmeasurable from the vault; scored conservatively until the debt note is read.
- Returns on capital and reinvestment 2/8 — realized returns on the exited projects were negative by management's own admission; returns on the surviving backlog unknown.

Stewardship and integrity (19/40):
- Accounting transparency 5/8 — clean working-capital markers, impairments disclosed through proper channels; docked for four stale XBRL series that blind the leverage view.
- Capital allocation and distributions 2/8 — the defining failure: a 5-FY program that consumed more than all earnings while the dividend ran on debt; partial credit only for the 2025 exits and for funding without dilution.
- Governance and compensation 4/8 — the board did not self-correct; the refreshed board acted decisively once installed; proxy and vote results unread.
- Customer, employee, safety, supplier treatment 5/8 — no adverse evidence, but safety and counterparty records are unexamined in a safety-critical industry.
- Strategic consistency and accountability 3/8 — strategy whipsawed from mega-bet to retreat within two years; credit for public error-admission via exits, docked because the accountability was imposed from outside.

Market confirmation (8/20):
- Relative price and estimate behavior 2/5 — 11.6pp behind XLB, within band; estimate revisions not pulled.
- Accumulation/distribution and ownership change 2/5 — not pulled; 13G-only baseline with the activist 13D trail still missing; Form 4 cluster unread.
- Valuation versus conservative economics 1/5 — not computed, and conservative economics are themselves unusually uncertain while FCF is negative.
- Catalyst and expectation asymmetry 3/5 — the named, dated catalyst (capex peak, FCF inflection) plus a reported-loss optics discount create plausible asymmetry; unverified until the 10-K backlog read.

- Red-flag override: **false** — no §7.3 hard-stop events in any pull note (no fraud allegation, going-concern language, auditor dispute, restatement, missed payment/covenant breach, or unresolved safety failure; material impairments and a contested proxy are not §7.3 events).

## 13. Falsifiable thesis

- Bull case (Pattern D trade): FY2025–FY2026 is the capital-spending peak; the exits end with the 2026-06-30 charge, Louisiana and NEOM come on-stream substantially contracted, and FCF inflects toward positive by FY2027–FY2028 while the contracted core's FY2024-grade margins (36.9%) reassert — the market, currently pricing APD like its healthy peer, re-rates the inflection.
- Bear case (value trap): the impairment trail continues past FY2026, remaining hydrogen capacity comes on-stream without offtake, FCF stays deeply negative, the dividend keeps compounding an already-unmeasured debt load, and the payout is eventually reset from a position of weakness — the loss year was not the bottom but the first honest year.
- What would prove each wrong: bull wrong if the FY2026 10-K shows capex at or above $7.0B, another Item 2.06 impairment lands after FY2026, or backlog disclosures show material uncontracted capacity still under construction; bear wrong if FY2026 capex declines, no new exits are announced, the OCF−capex gap narrows materially (FCF better than roughly −$2B on the FY2025 −$3.8B base), and disclosed offtake covers the flagship projects.
- Next checkpoint and date: **FY2026 10-K (expected ~2026-11-19 filing, based on the 2025-11-20 prior-year date; checkpoint 2026-11-26)** — capex below $7.0B, FCF gap narrowing, no new impairment 8-Ks, and the debt/maturity footnote extracted so the two ⚪ leverage markers become real numbers before the FCF-inflection thesis is trusted.

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
