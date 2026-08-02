---
node_type: "health_review"
date: "2026-08-02"
company: "LINDE PLC"
ticker: "LIN"
period: "FY ending 2025-12-31"
process_quality: "stable"
outcome_quality: "stable"
market_response: "ignoring"
divergence_pattern: "good-company-bad-investment"
economic_health_score: 32
stewardship_score: 32
market_confirmation_score: 8
total_score: 72
red_flag_override: false
red_flags: []
next_checkpoint: "Q3 2026 10-Q: LT debt at or below the FY2025 $20.7B, receivables growth back within revenue growth, and backlog/contract-duration disclosures read for the Pattern C valuation check"
next_checkpoint_date: "2026-11-06"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_LIN]]"
related_theses: []
tags: [health-review]
---

# Company Health & Integrity Review — LINDE PLC

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/LIN - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker LIN` — link the pull note into `markers_pull`.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

Linde builds and operates air-separation and gas-processing plants on or next to customer sites and rents out the molecules — oxygen, nitrogen, hydrogen, argon — to factories, hospitals, and refineries under long-term contracts, so revenue is a toll on local plant density and contracted volumes rather than a bet on any commodity price.

Consistent with the dossier `one_liner` ("Produces industrial gases and sells them to factories, hospitals, and refineries under long-term contracts") — same machine, this version adds the density/network mechanism. No barebones change; dossier evolution timeline does not need an update, though the dossier itself is still at `research_status: Scaffold` and should absorb this review's skeleton.

## 2. What changed in the company machine?

- Positive:
	- Operating cash flow $10.3B, +9.8% YoY — growing faster than net income (+5.1%) and revenue (+3.0%); the cash engine is strengthening ahead of reported earnings ([[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Facts_LIN]]).
	- Capex up 17.0% to $5.3B — in this model, new on-site plants are normally signed against long-term contracts before ground is broken, so rising capex is prima facie backlog conversion. Which projects, and whether contracted, needs the FY2025 10-K MD&A.
	- Diluted shares down 2.1% (482.1M → 472.2M) — the machine is shrinking its own denominator, not diluting.
- Negative:
	- Long-term debt +34.8% in one year ($15.3B → $20.7B, +$5.4B) — the single largest balance-sheet move; coverage stays comfortable (below) but the use of proceeds is unexplained in the pull notes.
	- Receivables +7.4% vs revenue +3.0% (+4.5pp) — inside the §5.3 band but the wrong direction; watch collection terms.
- Ambiguous:
	- Goodwill +$2.0B (+7.7%) to $27.9B — acquisition activity not yet identified; check purchase-price allocations and whether M&A is padding the +3% top line.
	- New S-3ASR shelf filed 2026-05-05 ([[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Baseline_LIN]]) — routine for a serial debt issuer, but confirms the financing program continues.
	- R&D roughly flat at $147M (−2.0%) — tiny against $34B revenue; the moat is capital and contracts, not research spend.

## 3. Financial health

Marker sheet ([[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_LIN]]): **9 🟢 · 0 🟡 · 0 🔴 · 2 ⚪** — the only fully clean sheet in the 12-company universe.

**Why it is clean, not just that it is clean:** the on-site model signs 10–20 year take-or-pay contracts with energy cost pass-through, so cash flow is contractually insulated from both demand swings and input costs; plant density in a local geography creates a distribution cost advantage no entrant can price under; and a consolidated industry structure supports steady price-over-volume execution. The markers are the arithmetic shadow of that structure — verify contract duration and take-or-pay language in the FY2025 10-K revenue-recognition and commitments footnotes rather than assuming it.

**§13 Pattern C discipline:** a clean sheet on a universally admired company is exactly where "good company, bad investment" lives. Zero flags means the open question is entirely price: revenue grew 3.0% — what multiple of $5.1B FCF is the market paying for that growth rate? Valuation inputs (market cap, FCF yield vs alternatives) are **not in the vault** — explicit gap, routed in §11.

- Organic revenue: $34.0B, +3.0% headline (FY2025 vs FY2024). Price/volume/FX/M&A split not in XBRL — needs the 10-K MD&A, especially with goodwill up $2.0B.
- Gross and operating margin: gross margin ⚪ (cost-of-revenue not tagged in XBRL, 0 periods — check the filing directly); operating margin 26.3% vs 26.2% — flat-to-up at a high level.
- FCF conversion: cumulative 5-FY FCF/NI = 1.01 🟢; OCF/NI 150% in FY2025; OCF-vs-earnings trend aligned 🟢. Earnings are cash.
- ROIC and incremental returns: not computed in the pull — explicit gap. With capex up 17%, incremental return on the new plant fleet is the decisive number; needs segment-level work.
- Debt and liquidity: net debt/EBITDA 1.37x 🟢, EBIT/interest 15.52x 🟢, cash $5.1B — resilient; but see the +$5.4B LT-debt step-up in §2/§10.
- Working capital: receivables +4.5pp over revenue growth (🟢 but directionally adverse); inventory-vs-cost-of-sales band ⚪ (period misalignment — compute manually from the 10-K).

## 4. Operational health

§14 industrials emphasis. Almost all of this layer is **not yet evidenced in the vault** — the XBRL skeleton cannot see it.

- Customers and retention: contract renewals/duration mix — needs pulling (10-K revenue-recognition footnote, MD&A). Deferred revenue steady at $1.2B (+3.1%) is weak positive evidence of ongoing customer prepayment.
- Product and innovation: R&D $147M, flat — consistent with a process/engineering moat; application development (electronics, clean hydrogen) needs the 10-K business section.
- Employees and safety: no evidence in vault. Industrial gases are a safety-critical business; pull safety/incident disclosures (10-K risk factors, sustainability report) before scoring this above neutral.
- Suppliers and capacity: energy is the dominant input and is contractually passed through on-site — verify pass-through language in the filing.
- Sector-specific KPIs (§14 industrials: backlog, book-to-bill, capacity utilization, project overruns):
	- Project backlog: **needs pulling** — size, contracted vs speculative, expected on-stream dates (10-K MD&A / 2026-07-31 earnings 8-K). This is the highest-value missing operational fact; capex +17% is only healthy if backlog is contracted.
	- On-site vs merchant vs packaged mix: **needs pulling** — on-site is the contracted fortress; merchant/packaged carry the cyclical exposure and utilization risk.
	- Capacity utilization (merchant loading): not disclosed in XBRL — check MD&A commentary.
	- Project overruns / cancellation rates: no evidence either way — check risk-factor wording changes FY2025 vs FY2024 (§7.4 comparison).

## 5. Stewardship and integrity

- Accounting quality: marker sheet clean; OCF 150% of NI is the opposite of aggressive recognition. Two XBRL irritants — cost-of-revenue untagged and the SBC series stale (latest tagged FY2022: $107M) — look like tag choices, not manipulation, but verify SBC in the FY2025 10-K.
- Disclosure quality: standard large-cap cadence, no restatements or auditor issues on file. Blank XBRL rows are the main gap.
- Capital allocation: reputation for price-over-volume discipline and gated project returns is well established for this company; the FY2025 evidence (dividend 55% of FCF, net buybacks, capex ramp) is consistent with it. The one wrinkle — $5.4B of new LT debt — needs the financing-section reconciliation before full credit.
- Executive compensation: DEF 14A filed 2026-04-29 is in the baseline but **unread** — verify comp metrics (ROC/EPS vs growth-at-any-cost) in the proxy.
- Board oversight: no adverse evidence; AGM held 2026-07-28 (8-K item 5.07) — **verify say-on-pay and vote outcomes** in that 8-K.
- Customer and employee treatment: no evidence in vault either way — tied to the safety pull in §4.
- Regulatory and legal record: nothing flagged in the pulls; no §7.3 hard-stop events on file.

## 6. Shareholder distribution

- Dividends: 55% of FCF 🟢 ≈ $2.8B on $5.1B FCF — comfortable for a contracted-cash-flow business. Long dividend-growth record is widely attributed to the Praxair/Linde lineage — verify the exact streak in the 10-K/proxy before citing it.
- Gross buybacks: dollar amount not in the pull notes — explicit gap (cash-flow statement financing section).
- Net share-count change: −2.1% YoY (482.1M → 472.2M) 🟢; buybacks exceed issuance 🟢.
- Stock compensation: ⚪ — SBC/revenue marker unavailable (stale tag, last FY2022 $107M ≈ 0.3% of revenue then). Materiality is likely low but confirm current-year SBC in the 10-K.
- Debt used for distributions: **the open question.** FCF $5.1B vs dividends ≈$2.8B plus buybacks plus a 17% capex ramp, alongside LT debt +$5.4B — the arithmetic suggests part of the distribution/growth program was debt-financed in FY2025. At 1.37x net debt/EBITDA this is capacity being used, not stress, but verify the financing section before treating distributions as fully self-funded.

## 7. Market behavior

- Relative performance: 12-month LIN +4.1% vs XLB +16.3% (−12.2pp) 🟢 per §9.2 band, but the sign matters: the market spent the year not paying up for the cleanest sheet in the universe.
- Estimate revisions: **gap — not pulled.**
- Accumulation/distribution: **gap — not pulled** (§9.3 volume markers need the manual pass).
- Insider activity: routine Form 4s plus three Form 144 sale notices (2026-04-13, 05-14, 05-15) in the baseline — no cluster pattern established; classify only after reading the forms.
- Ownership concentration: only passive-style 13G filings on file (latest 2024-10-18); no 13D activity. Active-vs-passive split and crowding — **gap, needs 13F trend pull.**
- Short interest: **gap — not pulled.**

## 8. Process-versus-outcome classification

- Process quality: **stable** — the machine is doing exactly what it has done for years: contracted volumes, 26%+ operating margin, 1.0x cash conversion, disciplined share-count shrink. Nothing is inflecting.
- Current outcome quality: **stable** — revenue +3.0%, net income +5.1%, OCF +9.8%; solid but mature-rate outcomes.
- Market response: **ignoring** — +4.1% absolute, 12.2pp behind XLB; neither rewarding nor punishing.
- Primary divergence: **good-company-bad-investment (Pattern C, under investigation)** — no health divergence exists; the risk is that quality this legible is already fully priced, so the payoff hinges on valuation vs conservative economics, which the vault has not yet measured.

### Divergence sentence (§17 Step 7)

> The company's operating process is `stable`, reported results are `stable`, and the market is pricing `about the same` future success because a 12-month return of +4.1% vs XLB's +16.3% shows investors already treat Linde's contracted-gas quality as known — the unresolved question is whether the current price leaves any return for new owners, not whether the business is healthy.

## 9. Good-faith evidence

- Grew capex 17% to $5.3B while holding the dividend to 55% of FCF — management is accepting present cost to build contracted future capacity rather than maximizing near-term distributions (facts pull, FY2025).
- Earnings are undersold, not oversold: OCF at 150% of net income and 5-year FCF conversion of 1.01 mean reported profits are fully cash-backed — the opposite of presentation-first accounting (markers pull).
- Share count reduced 2.1% with buybacks exceeding all issuance — shareholders are not quietly paying for compensation via dilution (markers pull).
- Steady deferred revenue ($1.2B) and flat R&D signal a franchise maintained by contract performance rather than promotional spending (facts pull).

## 10. Extraction or bad-faith risk

- $5.4B (+34.8%) LT-debt step-up in a year of buybacks, dividends, and record capex — if the financing section shows distributions were debt-funded at scale, that is balance-sheet capacity being converted into shareholder payments; benign at 1.37x, but the trajectory needs watching (facts pull; S-3ASR 2026-05-05 confirms the issuance program).
- Receivables growing 4.5pp faster than revenue — within band, but in a contracted business collections should not lag; loosening terms would be an early extraction tell (markers pull).
- Goodwill +$2.0B with no identified deals in the vault — if tuck-in M&A is propping up a +3% top line, organic growth is weaker than reported; check the acquisitions footnote (facts pull).
- SBC reporting dark since FY2022 in XBRL — almost certainly a tagging artifact, but an unverifiable dilution cost is still an unverified one; confirm in the 10-K (markers pull, fiscal-coverage table).

## 11. EDGAR follow-up

No 🟡/🔴 markers to route, so the §15 table is applied to the §13 Pattern C question instead: is the price, not the company, the problem?

- Filing: FY2025 10-K (filed 2026-02-25) · Q2 2026 10-Q (filed 2026-07-31) · earnings 8-K 2026-07-31 · DEF 14A 2026-04-29 ([[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Baseline_LIN]]).
- Section or exhibit: MD&A project backlog ("sale of gas" backlog) and segment discussion; revenue-recognition and commitments footnotes (contract duration, take-or-pay minimums); debt footnote and financing cash flows; proxy comp metrics; 8-K 2026-05-13 (item 8.01, content unknown — open).
- Finding: zero flagged markers; residual questions are valuation support, backlog quality, and contract duration — plus the $5.4B debt step-up and $2.0B goodwill increase from the facts pull.
- Possible meaning: either quality is fully priced (Pattern C confirmed — hold list, wait for price) or the contracted backlog implies an acceleration the flat stock is not crediting (Pattern A setup).
- Next investigation: (1) pull market cap/quote to compute FCF yield vs conservative alternatives; (2) read backlog size, contracted share, and on-stream dates; (3) extract remaining contract-duration/take-or-pay disclosure; (4) reconcile FY2025 financing section (debt proceeds vs buyback dollars); (5) read DEF 14A comp metrics and the 2026-07-28 vote results.

## 12. Score

§16 rubrics. A 72 with a clean marker sheet reads exactly as §16 intends: healthy company, and per the interpretation bands the mandate is to **investigate valuation and hidden concentration risks — not to buy**.

| Block | Score | Max |
|---|---:|---:|
| Economic health | 32 | 40 |
| Stewardship and integrity | 32 | 40 |
| Market confirmation | 8 | 20 |
| **Total** | **72** | 100 |

Economic health (32/40):
- Revenue and demand quality 6/8 — contracted, recession-resistant demand, but +3.0% growth with an unverified organic/M&A split.
- Unit economics and margins 7/8 — 26.3% operating margin, stable at a high level; gross margin unverifiable from XBRL.
- Cash conversion and earnings quality 8/8 — OCF/NI 150%, 5-yr FCF conversion 1.01, fully aligned.
- Balance-sheet resilience 6/8 — 1.37x net debt/EBITDA and 15.5x coverage are strong; docked for the unexplained +34.8% LT-debt jump.
- Returns on capital and reinvestment 5/8 — ROIC not computed (explicit gap); partial credit on margin and contract structure only.

Stewardship and integrity (32/40):
- Accounting transparency 6/8 — clean markers and conservative cash recognition; docked for untagged cost-of-revenue and stale SBC series.
- Capital allocation and distributions 7/8 — 55% payout, net buybacks, growth capex; docked pending the debt-funding reconciliation.
- Governance and compensation 6/8 — no adverse evidence, but the 2026 proxy and AGM vote results are unread.
- Customer, employee, safety, supplier treatment 6/8 — no adverse evidence, but safety record is unexamined in a safety-critical industry.
- Strategic consistency and accountability 7/8 — same machine, same discipline, decade after decade; barebones sentence unchanged.

Market confirmation (8/20):
- Relative price and estimate behavior 2/5 — 12.2pp behind XLB; estimate revisions not pulled.
- Accumulation/distribution and ownership change 2/5 — not pulled; passive 13G-only base is weak neutral evidence.
- Valuation versus conservative economics 2/5 — not yet computed; scored conservatively because this is the live Pattern C risk.
- Catalyst and expectation asymmetry 2/5 — backlog conversion is the plausible catalyst but is unverified in the vault.

- Red-flag override: **false** — no §7.3 hard-stop events (no fraud allegation, going-concern language, auditor dispute, restatement, covenant breach, or unresolved safety failure) in any pull note.

## 13. Falsifiable thesis

- Bull case: the +17% capex ramp is contracted backlog converting to on-stream plants, lifting organic growth above the +3.0% FY2025 rate at ≥26% operating margins while leverage drifts back toward ~1.2x; the flat stock (-12.2pp vs XLB) then re-rates as growth shows up.
- Bear case: the market has already paid for decades of flawless execution (Pattern C); growth stays ~3%, the extra $5.4B of debt keeps part-funding distributions, and the stock delivers bond-like returns from an equity price while capex rises just to defend position.
- What would prove each wrong: bull wrong if two more annual periods show capex rising with organic growth still ≤3% and no disclosed backlog expansion; bear wrong if backlog disclosures show contracted projects driving organic growth ≥5% with net debt/EBITDA back ≤1.5x and distributions fully FCF-funded.
- Next checkpoint and date: **Q3 2026 10-Q (expected ~2026-10-30 filing; checkpoint 2026-11-06)** — LT debt at or below the FY2025 $20.7B, receivables growth back within revenue growth; alongside it, complete the §11 valuation and backlog pulls so the Pattern C question is answered with numbers rather than reputation.

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
