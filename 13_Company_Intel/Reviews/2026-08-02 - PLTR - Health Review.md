---
node_type: "health_review"
date: "2026-08-02"
company: "Palantir"
ticker: "PLTR"
period: "FY ending 2025-12-31"
process_quality: "improving"
outcome_quality: "improving"
market_response: "punishing"
divergence_pattern: "good-process-bad-stock"
economic_health_score: 31
stewardship_score: 23
market_confirmation_score: 7
total_score: 61
red_flag_override: false
red_flags: []
next_checkpoint: "Receivable divergence back under +10pp in the next 10-Q; FY2025 10-K read resolves buyback-vs-SBC and cash-mix questions"
next_checkpoint_date: "2026-11-04"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_PLTR]]"
related_theses: ["[[Defense AI Autonomous Warfare]]", "[[AI Power Defense Stack]]", "[[Fiscal Scarcity Rearmament]]"]
tags: [health-review]
---

# Company Health & Integrity Review — Palantir

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/PLTR - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker PLTR` — link the pull note into `markers_pull`.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

Palantir sells software platforms that plug into an institution's data and run its operations and decisions, charging governments and large companies recurring subscription and usage fees. This matches the dossier `one_liner` unchanged — the machine has not been redescribed since the 2026-08-01 baseline, so no evolution-timeline update is required. The economic form is unusually clean: almost no physical capital (FY2025 capex $33.9M on $4.5B revenue), reinvestment is engineers and deployment capacity, and the owner cost that matters is paid in shares, not cash.

## 2. What changed in the company machine?

- Positive:
	- Operating leverage arrived at scale: operating margin 10.8% → 31.6% in one fiscal year on revenue +56.2% ($2.9B → $4.5B) — the AIP-era acceleration described in the dossier is now visible in GAAP, not just narrative.
	- Cash confirms earnings: operating cash flow +85.0% to $2.1B (131% of net income); FCF ≈ $2.1B; gross margin expanded 80.2% → 82.4%.
	- SBC dollars held flat ($691.6M → $684.0M) while revenue grew 56% — SBC/revenue fell from ~24% to 15.3%. Still red-band (§3, §6), but the *direction* is a genuine machine improvement.
	- Balance sheet remains debt-free (long-term debt $0 since 2021); the company self-funds everything.
- Negative:
	- Receivables +81.2% ($575M → $1.0B) against revenue +56.2% — a +25pp divergence, the single largest demand-quality question this year ([[13_Company_Intel/Findings/2026-08-01 - PLTR - Receivables outpace revenue|finding, unresolved]]).
	- Diluted shares +4.7% y/y despite gross buybacks — repurchases are absorbing grants, not shrinking the count.
- Ambiguous:
	- Cash & equivalents −32.2% ($2.1B → $1.4B) in a $2.1B-FCF year — most likely a treasury sweep into short-term investments plus buyback execution, but the marketable-securities line is outside the pulled concept set, so this is *probably* benign and *not yet* evidenced ([[13_Company_Intel/Findings/2026-08-01 - PLTR - Cash down despite record FCF|finding, unresolved]]).
	- R&D +9.8% in dollars but falling as a share of revenue — operating discipline or future-growth underfeeding; not decidable from XBRL alone.
	- The Q1 2026 10-Q (filed 2026-05-05) is still unread — everything above describes the machine through FY2025 only.

## 3. Financial health

Full computed table: [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_PLTR]] — rollup 🟢 2 · 🟡 1 · 🔴 4 · ⚪ 4 → `signal_status: alert`. Interpretation of every marker, benign vs negative reading:

- Organic revenue: +56.2% FY2025 — no §5.1 band computed in the pull, but growth quality is where the one red working-capital flag bites (below). Organic vs. acquired split is effectively all organic (goodwill immaterial at ~$38M, last tagged 2022); price-vs-volume and government/commercial mix are not in XBRL — verify in the FY2025 10-K segment footnote.
- Gross and operating margin: 82.4% gross (up 2.2pp), 31.6% operating (up ~21pp). No marker band flagged. Benign reading: software economics plus scale. The one caution (dossier): margin tripling in a single year can mean S&M restraint that underfeeds future logo growth — check S&M growth vs revenue in the 10-K income statement.
- FCF conversion: 🟢 **3.17** cumulative 5-FY FCF/net income — far above the 0.8 constructive floor, because Palantir generated FCF through its low-GAAP-profit years. 🟢 **OCF vs earnings trend: aligned** (OCF 131% of FY2025 net income). Benign reading is the only reading here: earnings are real cash. This is the strongest block in the review and it directly contradicts the worst-case reading of the receivables flag.
- Receivables: 🔴 **divergence +25.0pp** (+81.2% receivables vs +56.2% revenue). Benign: large government/enterprise contracts billed late in Q4 2025 — timing, consistent with a strong-bookings quarter, and deferred revenue (+57.5%) tracked revenue normally, so only one working-capital line diverged. Negative: looser payment terms buying growth, or mix shift to slower-paying government primes — revenue quality softening under a strong headline. The 131% OCF conversion argues against a collection problem *at annual scale*; unresolved until the 10-K aging/allowance note and the Q1 2026 sequential figure are read (§11).
- Inventory: ⚪ n/a — no inventory tagged; pure software model. Genuine non-applicability, not a data failure.
- Debt and liquidity: ⚪ **Net debt/EBITDA n/a** and ⚪ **EBIT/interest n/a** — debt concepts last reported FY2021, interest expense last tagged FY2023. Benign reading: the tags retired because the debt did — $0 long-term debt since 2021 and no revolver dependence evident. These two ⚪s are the good kind, but confirm zero debt in the FY2025 10-K debt note rather than inferring it from tag absence. Liquidity caveat: the cash line fell 32.2%; total liquidity (cash + short-term investments) is the number that matters and is not yet pulled.
- Dilution and distribution markers (detailed in §6): 🔴 diluted share growth +4.7% (above the 3% concern line), 🔴 SBC/revenue 15.3% (above 10%), 🔴 buybacks-vs-share-count (gross repurchases while the diluted count still rose), ⚪ dividend/FCF n/a (none paid — retention model, appropriate for the growth profile).
- Market marker (detailed in §7): 🟡 12-month return −20.2% vs SPY +20.2% (−40.4pp) — investigation prompt, not a verdict.
- Working capital: receivables are the whole story (above); deferred revenue +57.5% is a mild positive (customers still paying ahead); no inventory; payables not in the pulled set.

## 4. Operational health

§14 SaaS/cloud emphases. What is evidenced vs. what must be pulled — no fabricated KPIs:

- Customers and retention: **Not evidenced in the vault.** Net revenue retention, gross retention, customer counts, and top-20 concentration are disclosed in earnings materials and the 10-K but have not been pulled. Needed: NRR trend, customer-count growth, concentration footnote (dossier trigger #5).
- Product and innovation: R&D $557.7M, +9.8% in dollars, falling as % of revenue. The AIP bootcamp → production-conversion motion is the machine's current bottleneck and moat (dossier §6); conversion rates are not disclosed anywhere — proxy via US-commercial growth once pulled.
- Employees and safety: **Not evidenced.** Headcount, attrition, and cleared-talent retention need the 10-K human-capital section. The SBC-retention loop is the key employee risk if the stock keeps derating (dossier reverse flywheel).
- Suppliers and capacity: Hyperscaler cloud dependence (AWS/Azure, multi-cloud by design) — current terms and any cloud-infrastructure purchase commitments need the 10-K commitments note.
- Sector-specific KPIs (§14 SaaS list, status per item):
	- NRR / gross retention: **not pulled** — earnings deck or 10-K.
	- RPO and billings: **not pulled** — dossier flags sequential deferred revenue/RPO from the Q1 2026 10-Q as open item #5. Deferred revenue (current) +57.5% is the only proxy in hand and it tracks revenue.
	- Gross margin: 82.4% — evidenced, strong.
	- Rule of 40 (rough screen only): ~88 on revenue growth + GAAP operating margin from pulled figures — far above the bar; noted as arithmetic on evidenced numbers, not a pulled metric.
	- Sales efficiency / CAC payback: **not derivable** — S&M line not in the pulled concept set.
	- SBC and net dilution: 15.3% of revenue, +4.7% shares — evidenced, red (§6).
	- Customer concentration: **not pulled** — 10-K concentration footnote; government share makes this structurally important.

## 5. Stewardship and integrity

- Accounting quality: Clean by the evidence in hand — minimal cost capitalization (capex $33.9M), stable tags, deferred revenue tracking revenue, no restatements or error history noted in the dossier pass. Main deduction: adjusted metrics exclude $684M of SBC, a large and permanent exclusion the framework treats as a recurring real cost (§8).
- Disclosure quality: Mixed. Filing hygiene is good (on-time 10-K 2026-02-17, routine 8-K cadence), but AIP — the strategic story — has no separate revenue attribution, so the central claim of the bull case is not independently measurable from filings (dossier disclosure score 25/35 for the same reason).
- Capital allocation: No dividend (appropriate); debt paid to zero by 2021 and kept there; heavy reinvestment in R&D and the bootcamp motion. The weak spot is buybacks that function as grant-absorption rather than capital return (§6). Buyback dollars vs. the 2023 authorization — verify in the FY2025 cash-flow financing section.
- Executive compensation: Structure, metrics, and quantum — **verify in DEF 14A filed 2026-04-24** (unread). Say-on-pay result is checkable now against the 8-K Item 5.07 vote results (2026-06-09). Historical context (well-established): Karp's 2020-era mega-grant made PLTR one of the largest SBC stories in software; current-cycle grants unverified.
- Board oversight: The defining, well-established fact: the Class A/B/F structure keeps founders Karp, Thiel, and Cohen at just under 50% of voting power regardless of economic ownership, so long as minimum holding thresholds are met. Founder-controlled in substance whatever the formal independence; no activist lever exists (13G-only register, no 13D ever). Committee composition and current voting percentages — verify in DEF 14A.
- Customer and employee treatment: No documented §7.3-class events (no fraud allegations, no restatements, no auditor disputes, no going-concern language) through the evidence window. Palantir's government/surveillance work draws recurring public controversy (Europe/privacy, immigration-agency contracts) — a reputational and regulatory *exposure*, not a documented misconduct finding; treat per §12 as legal-but-scrutinized.
- Regulatory and legal record: Nothing in the 8-K window beyond routine items (earnings, annual-meeting votes). No consent orders, no material-weakness disclosures noted in the baseline. Legal-proceedings note in the FY2025 10-K still unread — confirm before treating as clean.

## 6. Shareholder distribution

Netting everything per §5.6–5.7, the honest picture is that **owners funded compensation this year; they did not receive capital**:

- Dividends: None — ⚪ by design; retention/reinvestment model, defensible at these growth rates.
- Gross buybacks: Occurring (buyback series populated all 6 FYs; S-3ASR shelf on file since 2024-08); dollar amounts vs. the authorization not yet pulled — FY2025 cash-flow financing section.
- Net share-count change: 🔴 **+4.7%** diluted y/y (2.5B → 2.6B) — above the 3% "high concern" line, and the sixth consecutive year of growth in the series.
- Stock compensation: 🔴 **$684.0M = 15.3% of revenue** — above the 10% concern band. The mitigant is real: flat dollars y/y against +56% revenue means the ratio fell from ~24%, and FY2025's cash economics ($2.1B FCF) now exist to absorb it, which §5.6 says is the difference between serious and tolerable.
- Debt used for distributions: None — zero debt; everything is FCF-funded.
- Net verdict: 🔴 buybacks-vs-share-count — repurchases did not offset grants, so the "buyback" is economically an SBC settlement mechanism, not a shareholder return. Net shareholder yield is negative (dilution) even before valuation. Trajectory matters: if SBC dollars stay flat and growth continues, the ratio exits the red band within roughly two years — that is a monitorable claim, not a promise.

## 7. Market behavior

- Relative performance: 🟡 **−20.2% over 12 months vs SPY +20.2% — a −40.4pp gap**, double the §9.2 investigation threshold. This happened in a year when revenue grew 56% and operating margin tripled, which is precisely the divergence the framework says to investigate rather than average away.
- Estimate revisions: **Not yet pulled.** This is the decisive missing datum — falling price with *rising* estimates points to multiple compression/forced selling; falling price with *falling* estimates points to a changed thesis. Route: FMP analyst endpoints / earnings-revision pull.
- Accumulation/distribution: **Not yet pulled** — volume-pattern analysis not run; 13F trend unavailable on the free tier (dossier §12 note).
- Insider activity: Steady Form 4 / 144 cadence June–July 2026 (nine filings in the baseline window), pattern consistent with plan sales — **verify 10b5-1 footnotes before reading as signal**. No open-market insider *purchases* observed in the window, which §9.1 would have counted as a constructive counter-signal during a drawdown.
- Ownership concentration: Passive index complex dominates (S&P 500 member since 2023); 13G/A filers only, latest 2024-11; **no 13D on file** — the Class F structure makes activism pointless, so the register is structurally passive.
- Short interest: **Not yet pulled** — check against the ~10%-of-float threshold with borrow cost and days-to-cover.

## 8. Process-versus-outcome classification

- Process quality: **improving** — margin structure, cash conversion, SBC ratio, and the AIP go-to-market all moved the machine's direction up in FY2025; the open receivables question is a flag on the *quality* of one input, not yet evidence of process deterioration.
- Current outcome quality: **improving** — revenue +56.2%, operating margin 31.6%, record $2.1B FCF, OCF 131% of net income.
- Market response: **punishing** — −40.4pp vs SPY over 12 months.
- Primary divergence: **good-process-bad-stock** (Pattern A). Within Pattern A's cause list, the leading candidate is "valuation began too high" — the dossier already noted that hypergrowth and margin durability were fully priced. Pattern C (good company, bad investment) is the adjacent frame; distinguishing derating-from-extreme-multiple vs. deteriorating expectations requires the estimate-revision pull (§7 gap).

### Divergence sentence (§17 Step 7)

> The company's operating process is `improving`, reported results are `improving`, and the market is pricing `less` future success because `a valuation that already assumed hypergrowth is compressing while the receivables spike, +4.7% dilution, and 15.3% SBC give the derating cover — with estimate revisions, ownership flows, and short interest not yet pulled to establish which of these the market is actually repricing`.

## 9. Good-faith evidence

- Debt eliminated in 2021 and never re-added; the company reached scale, GAAP profitability, and a $2.1B-FCF run rate without leverage or new equity offerings (shelf on file, no issuance observed) — resilience purchased at the cost of forgoing cheap-money-era leverage games.
- SBC dollars held flat y/y ($691.6M → $684.0M) while revenue rose 56% — management let the ratio fall rather than scaling grants with the stock's prominence; the single most concrete pro-owner behavior change in the pulled data.
- R&D grew in dollars (+9.8% to $557.7M) *through* the year margins tripled — margin expansion was not manufactured by cutting product investment to zero, though the falling R&D share still needs watching (§2 ambiguous).
- The S&M bootcamp motion deliberately front-loads cost before revenue (pilots at company expense) — a present-cost investment in conversion capability, the constructive reading of §5.2's "growth investment" category.

## 10. Extraction or bad-faith risk

- The Class F voting structure is a permanent accountability shield: founders retain just-under-50% voting power regardless of economic ownership. Nothing forces this to be abused, but every §7.2 remedy (activism, proxy contest, board challenge) is structurally disabled — extraction *risk*, priced as governance, not an event.
- $684M of SBC is excluded from adjusted profitability while buybacks quietly absorb the resulting shares — the cost of compensation is real, recurring, borne by owners via dilution, and framed out of the headline metrics (§8: emphasizing adjusted measures while ignoring dilution).
- The +25pp receivable divergence is the classic mechanism by which growth is borrowed from the future (looser terms, slower-paying mix). Currently unresolved with a credible benign explanation and contradicting cash evidence — logged as risk, not finding of fact.
- Founder/insider plan-sales continued through June–July 2026 while the stock underperformed by 40pp — routine if 10b5-1-scheduled (unverified), but there is no offsetting open-market buying, so insiders are net suppliers of stock into the derating.

## 11. EDGAR follow-up

§15 routing for every 🔴/🟡 marker and open finding:

| Marker / finding | Filing | Section or exhibit | What to look for |
|---|---|---|---|
| 🔴 Receivable divergence +25pp | FY2025 10-K (filed 2026-02-17); Q1 2026 10-Q (filed 2026-05-05) | Receivables note, allowance roll-forward, revenue note, MD&A | Aging buckets; allowance growing proportionally (a *falling* allowance despite slower collections escalates the flag); single-customer balances; sequential Q1 normalization; DSO trend FY2023→FY2025 |
| 🔴 Diluted share growth +4.7% | FY2025 10-K; DEF 14A (2026-04-24) | Statement of equity; proxy compensation tables | Gross grants vs. vesting vs. repurchases; unvested overhang; whether new grant rates imply dilution stays >3% |
| 🔴 SBC 15.3% of revenue | FY2025 10-K; earnings 8-K exhibits | SBC footnote; non-GAAP reconciliation | Five-year exclusion history; grant mix (time- vs performance-vested); whether flat-dollar SBC is policy or accident |
| 🔴 Buybacks not offsetting grants | FY2025 10-K; 8-K buyback authorization | Cash-flow financing section; equity note | Dollars repurchased vs. 2023 authorization; average repurchase price vs. grant-date fair values (buying high to settle grants is the worst version) |
| 🟡 −40.4pp vs SPY | Not EDGAR: estimate-revision pull (FMP), short-interest pull; EDGAR: Forms 4/144 | 10b5-1 footnotes on the June–July Form 4s | Whether estimates fell with price; short interest vs 10% float; whether insider sales are plan-scheduled |
| ⚪→finding: cash −32.2% | FY2025 10-K | Balance sheet marketable-securities line; investing and financing sections | Cash + investments combined vs prior year (escalate only if the *total* fell); purchases-of-securities line confirming the sweep |
| Comp/governance verification | DEF 14A (2026-04-24); 8-K 2026-06-09 Item 5.07 | Comp tables, founder voting %, committee composition; vote tallies | Say-on-pay dissent level; performance conditions on grants; related-party items |

Log whatever these reads produce as Intel Findings; both existing findings ([[13_Company_Intel/Findings/2026-08-01 - PLTR - Receivables outpace revenue|receivables]], [[13_Company_Intel/Findings/2026-08-01 - PLTR - Cash down despite record FCF|cash mix]]) resolve on the same 10-K pass.

## 12. Score

| Block | Score | Max |
|---|---:|---:|
| Economic health | 31 | 40 |
| Stewardship and integrity | 23 | 40 |
| Market confirmation | 7 | 20 |
| **Total** | **61** | **100** |

Per-category justifications (§16 rubrics):

- Economic health — 31/40:
	- Revenue and demand quality 6/8 — +56% recurring-model growth, but the +25pp receivable divergence and unverified government concentration cap it.
	- Unit economics and margins 7/8 — 82.4% GM and 31.6% OM are elite; one point held back until the S&M-restraint question is answered.
	- Cash conversion and earnings quality 6/8 — 3.17 five-year conversion and 131% OCF/NI are top-band; docked for the unresolved receivables flag sitting inside that cash.
	- Balance-sheet resilience 7/8 — zero debt, self-funding; one point pending the cash-vs-investments mix evidence.
	- Returns on capital 5/8 — capital-light and self-funding, but ROIC not reconstructed and SBC materially dilutes owner-level returns.
- Stewardship and integrity — 23/40:
	- Accounting transparency 5/8 — clean history and minimal capitalization, docked for the large permanent SBC exclusion from adjusted metrics.
	- Capital allocation and distributions 3/8 — buybacks absorbed by grants, +4.7% dilution, 15.3% SBC; the flat-dollar SBC trend is the only thing keeping this off the floor.
	- Governance and compensation 3/8 — Class F structure disables minority accountability by design; comp metrics and say-on-pay unverified (DEF 14A unread).
	- Customer, employee, safety, supplier treatment 5/8 — no documented misconduct events; thin positive evidence, standing reputational/privacy scrutiny; scored mid on limited data.
	- Strategic consistency and accountability 7/8 — the machine description has evolved coherently for two decades (gov integrator → AI ops platform); no relabeled failures or KPI redefinitions observed.
- Market confirmation — 7/20:
	- Relative price and estimate behavior 1/5 — −40.4pp vs SPY; estimate revisions not pulled, so no offsetting evidence exists in the vault.
	- Accumulation/distribution and ownership 2/5 — structurally passive register, insider plan-selling, no accumulation evidence; 13F/volume data not pulled.
	- Valuation vs conservative economics 2/5 — no valuation pull in the vault; dossier records that hypergrowth was fully priced and the derating has only partially unwound that — scored low with an explicit gap.
	- Catalyst and expectation asymmetry 2/5 — clear observable checkpoints exist (receivables normalization, Q2/Q3 10-Qs), but expectations remain high enough that beats may be required just to hold price.

- Red-flag override: **false** — no §7.3 hard-stop events (no restatement, auditor dispute, fraud allegation, going-concern language, covenant breach, or late filings) documented in the baseline window. Total 61/100 lands in the §16 "mixed" band: thesis depends on specific repairs (receivables, dilution) or underappreciated strengths (cash conversion), which matches the evidence exactly.

## 13. Falsifiable thesis

- Bull case: AIP converts the enterprise-AI wave into production deployments on Palantir's ontology; usage compounds at 82% gross margin with operating leverage already proven (10.8% → 31.6%); rearmament budgets ([[Fiscal Scarcity Rearmament]], [[Defense AI Autonomous Warfare]]) grow the sticky government base; $2.1B FCF self-funds it all, and the 12-month derating has reset entry expectations while the machine improved.
- Bear case: LLM-native competitors and hyperscalers replicate the use cases cheaper; the receivable spike is the first visible symptom of growth bought on softer terms; commercial expansion stalls at pilots; ~5%/yr dilution grinds on while the derating breaks the SBC-retention loop (reverse flywheel), leaving the government base as the only defensible core.
- What would prove each wrong:
	- Bull wrong if: revenue growth <30% y/y for two consecutive 10-Qs; receivables again outgrow revenue by >15pp in the next two 10-Qs; deferred revenue + RPO growth below revenue growth for two quarters; SBC >20% of revenue or diluted shares +5% y/y despite buybacks (dossier triggers #1–4).
	- Bear wrong if: receivable divergence normalizes below +10pp with a benign aging note; US commercial sustains >40% growth with rising margins; net dilution decelerates below 3% while FCF holds; estimate revisions turn out to be rising into the falling price (making this forced-selling/multiple compression, not thesis change).
- Next checkpoint and date: **Receivable divergence < +10pp in the next 10-Q (Q3 2026, expected filing ~2026-11-04), with the FY2025 10-K read resolving the buyback-vs-SBC reconciliation and the cash-mix finding before then.** Interim observable: Q2 2026 10-Q (expected ~2026-08-05) gives an earlier sequential receivables print.

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
