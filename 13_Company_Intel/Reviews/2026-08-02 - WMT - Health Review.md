---
node_type: "health_review"
date: "2026-08-02"
company: "Walmart Inc."
ticker: "WMT"
period: "FY ending 2026-01-31"
process_quality: "improving"
outcome_quality: "improving"
market_response: "rewarding"
divergence_pattern: "none"
economic_health_score: 30
stewardship_score: 32
market_confirmation_score: 9
total_score: 71
red_flag_override: false
red_flags: []
next_checkpoint: "Q2 FY2027 10-Q + FY2026 10-K re-read: receivables−revenue divergence explained in the receivables note (<+5pp or benign ads/marketplace/pharmacy mix); FY2026 global ad revenue and membership income pulled from the 10-K; operating income growth re-converges toward revenue growth; SBC read off the cash-flow statement"
next_checkpoint_date: "2026-09-15"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_WMT]]"
price_at_review: 111.2
reconsider_price_low: 88.96
reconsider_price_high: 139
related_theses: []
tags: [health-review]
---

# Company Health & Integrity Review — Walmart Inc.

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/WMT - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker WMT` — link the pull note into `markers_pull`.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

Walmart moves everyday goods — grocery-heavy — from suppliers to a very large weekly customer base at the lowest workable price, earning a razor-thin markup on enormous volume; increasingly it also rents that traffic out — to advertisers (Walmart Connect), marketplace sellers, and members (Walmart+ / Sam's Club) — and those higher-margin streams are where incremental profit is migrating.

The dossier `one_liner` is **empty** (dossier is still a Scaffold) — seed it from the first clause above and start the evolution timeline, because this review's central question (§2) is precisely a machine-evolution question: is WMT still a merchandise-markup machine, or becoming a traffic-monetization machine that happens to sell merchandise?

## 2. What changed in the company machine?

THE WMT question: **is more profit coming from ads/membership than from merchandise?** The XBRL skeleton is consistent with "yes, at the margin" but cannot prove it — segment/mix detail must come from the 10-K (routed in §11).

- Positive:
  - **Cash is outrunning earnings, and earnings are outrunning revenue:** revenue +4.7% to $706.4B, net income +12.6% to $21.9B, OCF +14.1% to $41.6B, FCF +17.3% to $14.9B ([[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Facts_WMT]]).
  - **Growth is organic:** goodwill flat at $28.7B (−0.2%) — no acquisition inflation of the top line in FY2026.
  - **Real net share retirement:** diluted shares −0.7% to 8.0B — buybacks exceed grants (🟢), unlike COST where repurchases only offset dilution.
  - **The flywheel build is funded internally:** capex +12.0% to $26.6B (≈3.8% of revenue — automation/supply-chain/e-commerce build, well-established strategy) while FCF still grew.
- Negative:
  - **The operating line did not participate:** operating income +1.6% to $29.8B, operating margin 4.4% → 4.2%. Most of the net-income growth came from **below the operating line** — WMT's equity-stake mark-to-market swings are a well-established source of net-income noise; decompose in the 10-K income statement before crediting the +12.6% (§11).
  - **Receivables grew 7.3pp faster than revenue** (the single 🟡 marker) — interpreted in §3.
- Ambiguous:
  - **CEO transition:** Doug McMillon → John Furner, announced Nov 2025, effective 2026-02-01 (well-established). Orderly internal succession, but the new CEO's capital and margin discipline is unproven — first proxy of the transition is the DEF 14A filed 2026-04-23 (§11).
  - **Tariff/price-investment tension:** WMT publicly flagged tariff-driven price pressure in 2025 (well-established); the 20bp operating-margin compression may be deliberate price investment protecting the EDLP covenant (constructive per §5.2 "growth investment") or genuine cost slippage — the MD&A margin bridge decides.

## 3. Financial health

Marker table from [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_WMT]] — rollup 🟢 9 · 🟡 1 · 🔴 0 · ⚪ 1, `signal_status: clear`. Every marker interpreted:

- Organic revenue: +4.7% (FY2026, XBRL) — at/above inflation for a $700B base, and organic (goodwill flat). Price-vs-volume split (§5.1) **not pulled** — WMT discloses comp transactions vs ticket quarterly; route to earnings 8-Ks. Contrast COST: +8.2% with operating leverage (margin 3.6%→3.8%) vs WMT +4.7% with compression (4.4%→4.2%) — this FY, COST's fee machine converted growth to profit more cleanly than WMT's merchandise machine.
- Gross and operating margin: gross margin is an **explicit XBRL gap** (non-standard tags — read the filing). Operating margin 4.2% is thin *by design* — EDLP is WMT's version of COST's near-cost pricing covenant. The interesting §5.2 question is what the lost 20bp bought: price investment, e-commerce/fulfillment build, or adverse mix. Not yet evidenced — routed.
- FCF conversion: 🟢 0.80 cumulative FCF/NI over 5 FY (below COST's 0.92 — WMT's heavier growth capex takes a real bite); 🟢 OCF tracks earnings, OCF/NI 189.9% (D&A-heavy asset base, as expected). Earnings are cash-backed.
- ROIC and incremental returns: **not computed in the pull — explicit gap.** The live question per §5.4: capex +12% against operating income +1.6% is negative incremental operating return *this year*; defensible only if the automation/e-commerce build returns later. Reconstruct before the next review.
- Debt and liquidity: 🟢 net debt/EBITDA 0.62x; 🟢 EBIT/interest 12.87x; cash $10.7B (+18.7%), long-term debt $34.6B (+3.7%). §4 Level 1 (survival) passes trivially. April 2026 424B2/FWP issuance is routine shelf funding — confirm use of proceeds (§11).
- Working capital:
  - 🟢 Inventory divergence −0.3pp vs cost of sales (inventory $58.9B, +4.3%) — clean; no stuffed shelves, turns holding.
  - 🟡 **Receivables +7.3pp faster than revenue** — the investigate. Benign candidates, and they are exactly the §2 evolution thesis: Walmart's receivables base is tiny relative to a cash/card register business, so the fastest-growing *invoiced* streams — Walmart Connect advertisers, marketplace sellers / Walmart Fulfillment Services balances, pharmacy third-party payors, supplier allowances — mechanically push receivables growth above revenue growth. Negative candidates: stretched B2B terms, weakening collections, or receivables-financed sales. Same shape as COST's 🟡 (+9.5pp, same hypothesis family) — for both retailers the flag is plausibly the *new machine showing up in working capital first*. Must be verified in the 10-K receivables note, not assumed (§11).
- Dilution and SBC (§5.6): 🟢 diluted shares −0.7%; 🟢 buybacks exceed issuance. ⚪ **SBC/revenue is an explicit gap** (ShareBasedCompensation not tagged) — read it off the cash-flow statement; do not estimate.
- Distributions (§5.7): 🟢 dividend at 50% of FCF (≈$7.4B) — mid-band for a mature company; covered without borrowing (§6).
- Market (§9.2): 🟢 +12.9% (12-month) vs XLP +6.1% (+6.8pp) — within the normal band; §9 ownership/volume manual pass outstanding (§7).

## 4. Operational health

Per §14 consumer/retail emphasis — evidenced vs needs-pulling, no fabricated metrics:

- Customers and retention: massive weekly traffic base (order of a couple hundred million visits weekly — well-established; **verify FY2026 figure in the 10-K**). Walmart+ subscriber counts are not disclosed by the company; Sam's Club membership income *is* disclosed — **needs pulling**. Membership is WMT's emerging renewal covenant; COST's is mature (~90% worldwide renewal) — WMT has no equivalent published renewal metric yet, which keeps its flywheel less verifiable than COST's.
- Product and innovation: private-label penetration (Great Value, Member's Mark) — well-established as large and growing; **verify share in MD&A**. Marketplace assortment expansion and Walmart Fulfillment Services attach — needs pulling.
- Employees and safety: ~2.1M associates (well-established, largest private employer); multi-year wage-floor increases (US average hourly above $18 — well-established). No FY2026 turnover/safety figures in the vault — qualitative only. Labor-cost questions continue in §9/§10.
- Suppliers and capacity: scale bargaining power is the machine's core input cost advantage; §6.4 payables data **not extracted** — payables-days trend and any tariff-era supplier cost-concession demands need the working-capital note (§10 risk if squeezed too hard).
- Sector-specific KPIs (§14 retail):
  - **Traffic vs ticket / comps:** not pulled — WMT discloses US comp transactions vs ticket every quarter; route to earnings 8-Ks (latest: 2026-05-21 Item 2.02).
  - **Inventory turns:** directionally evidenced — +4.3% inventory on +4.7% revenue (−0.3pp vs COGS, 🟢); exact turns need the average-balance calc.
  - **E-commerce mix:** growing and reaching US profitability during calendar 2025 (well-established from company statements); FY2026 e-commerce penetration **needs the 10-K MD&A** — this is a checkpoint metric for the flywheel.
  - **Ad revenue:** global advertising ran ~$4.4B in FY2025 growing ~27% (well-established); **FY2026 figure must be pulled from the 10-K** — the single best quantitative test of the §2 evolution question.
  - **Shrink / promotions:** no figures pulled — gap.

## 5. Stewardship and integrity

- Accounting quality: GAAP-first with a stable adjusted-EPS reconciliation (well-established; nothing in the pulls contradicts it). Two standardized-tag gaps (gross margin, SBC) are XBRL quirks to check in the filing, not accusations. No restatements, no auditor issues, no Item 4.01/4.02 8-Ks in the baseline.
- Disclosure quality: on-time 10-K/10-Q cadence, quarterly comp-detail disclosure historically strong. No §7.2 warning signs evidenced.
- Capital allocation: internally funded capex ramp into the core machine, dividend at 50% of FCF, genuine net share retirement, leverage at 0.62x EBITDA. Constructive; the open question is the return on the $26.6B capex program (§3).
- Executive compensation: **verify in DEF 14A (2026-04-23)** — first proxy spanning the McMillon→Furner transition; check performance metrics (do ads/membership/e-commerce targets appear, or is comp still merchandise-comp driven?) and transition awards.
- Board oversight: Walton family ownership of roughly mid-40s percent via family vehicles and Greg Penner as chairman (both well-established — **verify exact stake in DEF 14A ownership table**). Family control cuts both ways: long-horizon alignment vs weak minority-holder leverage. Annual-meeting vote results filed (8-K Items 5.03/5.07, 2026-06-05) — **verify outcomes and the charter/bylaw amendment**; a third-party DEFA14A filed 2026-04-23 suggests a shareholder-proponent campaign — **identify the proponent and proposal**.
- Customer and employee treatment: EDLP is a genuine price covenant (§10); wage investments are real present costs. Balanced against a documented history on the other side of the ledger (§10) — opioid-dispensing framework settlement (~$3.1B, 2022, well-established) and perennial labor-cost criticism.
- Regulatory and legal record: no §7.3 hard-stop events in the baseline (no going-concern, restatement, auditor or covenant items). Legacy legal matters are settled/reserved classes, not open existential events. `red_flag_override: false`.

## 6. Shareholder distribution

Netted against dilution, per §5.6–5.7 — and the explicit COST contrast (Universe Map theme 6):

- Dividends: ~50% of FCF (≈$7.4B) — 🟢 mid-band; regular annual raises (a ~13% hike in early 2025 was the largest in over a decade — well-established; confirm the FY2027 dividend action in the 8-K chain).
- Gross buybacks: ongoing under the $20B authorization (Dec 2022 — well-established; **verify remaining capacity in the 10-Q**).
- Net share-count change: **−0.7%** — buybacks exceed grants, so repurchases are a real distribution. This is the sharpest §6 contrast with COST: COST's flat share count makes its buyback pure anti-dilution maintenance and its true return the dividend + episodic specials off a net-cash hoard; WMT runs modest leverage (0.62x) and returns cash continuously via dividend + genuine retirement. WMT's pattern is the more conventional distribution machine; COST's is the more conservative one.
- Stock compensation: ⚪ **explicit gap** (untagged) — read from the cash-flow statement before netting precisely; the −0.7% net share trend bounds it as manageable.
- Debt used for distributions: not evidenced — FCF ($14.9B) covers dividend + net buybacks at this scale; LT debt +$1.2B against +12% capex reads as general funding, not distribution finance. Confirm in the cash-flow statement financing section (§11).

## 7. Market behavior

- Relative performance: +12.9% (12-month) vs XLP +6.1% → **+6.8pp**, within the §9.2 normal band. Mild outperformance of the staples sector — the market is paying for the ads/membership mix-shift narrative.
- Estimate revisions: **explicit gap — not pulled.**
- Accumulation/distribution: **explicit gap** — §9.3 volume/ownership manual pass not done.
- Insider activity: dense Form 4/144 cadence (clusters 2026-07-02, 2026-07-14/16; 144s 2026-07-16 and 2026-07-28). Walton-family programmatic selling is a well-established standing pattern and usually benign at their stake size — **verify the July filers are the family vehicles on 10b5-1 plans, not operating executives selling out of cycle** (§15 insider-selling row).
- Ownership concentration: Walton family ~mid-40s% (well-established; verify in proxy) plus passive mega-cap holders — float is effectively smaller than the market cap suggests. 13F/13G trend **not pulled — gap**.
- Short interest: **explicit gap — not pulled.**

## 8. Process-versus-outcome classification

- Process quality: **improving** — the machine is adding higher-margin, more-recurring engines (ads, membership, marketplace) on top of an unchanged EDLP core, funded internally.
- Current outcome quality: **improving** — NI +12.6%, OCF +14.1%, FCF +17.3%, net retirement — with the honest caveat that the *operating* line was nearly flat and the NI jump needs below-the-line decomposition.
- Market response: **rewarding** — positive absolute and sector-relative return (+6.8pp vs XLP), inside the normal band.
- Primary divergence: **none** — process, outcomes, and price agree in direction. Watch item: if operating income keeps lagging revenue while the premium multiple persists, the risk pattern is **good-company-bad-investment** (§13 Pattern C) — the market may be pre-paying for flywheel profits the operating line hasn't printed.

### Divergence sentence (§17 Step 7)

> The company's operating process is `improving`, reported results are `improving`, and the market is pricing `more` future success because `a premium multiple credits the ads/membership/e-commerce mix shift while the operating line (+1.6%) has not yet printed it — the flywheel is being paid for slightly ahead of its evidence`.

## 9. Good-faith evidence

- **EDLP as a standing price covenant:** operating margin of 4.2% on $706B is a structural choice to hand scale economics back to customers — the same §10 logic as COST's markup ceiling, expressed as "everyday low prices" instead of a membership fee.
- **Margin absorbed rather than harvested in the tariff year:** operating margin fell 20bp while revenue grew — consistent with price investment defending the value promise during 2025 cost pressure (verify the MD&A bridge; the alternative reading is in §10).
- **Multi-year wage investment** (US average hourly above $18, rising floors — well-established) — a present labor cost bought against turnover and service quality rather than flowing to quarterly margin.
- **Internally funded long-horizon capex:** $26.6B into automation and fulfillment at 0.62x leverage — building the next machine without balance-sheet strain or equity issuance.

## 10. Extraction or bad-faith risk

Factual, per §11–12 — this is where the labor and supplier questions live:

- **Supplier-terms pressure:** WMT's scale lets it demand cost concessions from suppliers, a pressure that intensified in the 2025 tariff environment (well-established pattern). Legal, but §12-class cost-shifting if suppliers absorb what WMT won't price — watch payables days and supplier-concentration disclosures.
- **Labor-cost externalization (historical):** the long-running criticism that low-wage retail labor is partially subsidized by public assistance predates the recent wage investments (well-established). The wage trajectory is the mitigant; the risk is that it stalls when margin gets tight.
- **Below-the-line earnings optics:** net income +12.6% on operating income +1.6% — if equity-stake marks drove the gap, headline EPS growth overstates machine improvement. Not bad faith, but a presentation risk to keep honest (routed §11).
- **Legacy conduct record:** opioid-dispensing settlement (~$3.1B, 2022) and consumer-protection matters around money-transfer services (settled — well-established) are documented, closed items — a reminder that the compliance perimeter of a 2.1M-employee machine is itself a risk asset. No open §7.3-class events in the baseline.
- **Receivables flag (unverified):** if the +7.3pp divergence traces to loosened terms rather than benign ads/marketplace mix, growth is being borrowed from collections — routed in §11.

## 11. EDGAR follow-up

Routing via §15:

- Filing: **FY2026 10-K (filed 2026-03-13)**
  - Section or exhibit: receivables note + revenue-recognition note + MD&A working capital (§15 revenue-quality row); income statement other-gains/losses; cash-flow statement (SBC line); segment/disaggregation for ad + membership income
  - Finding: receivables − revenue = +7.3pp (🟡); SBC untagged (⚪); NI +12.6% vs operating income +1.6%
  - Possible meaning: benign mix (Walmart Connect advertisers, marketplace/WFS seller balances, pharmacy third-party payors, supplier allowances) vs stretched terms; NI gap = equity-stake marks vs durable operating gain
  - Next investigation: decompose receivables by type and allowance trend; read SBC off the cash-flow statement; pull FY2026 global ad revenue and membership & other income; log an [[03_Templates/Intel_Finding]] with the answer to the §2 question
- Filing: **DEF 14A (2026-04-23)** + 8-K 2026-06-05 (Items 5.03, 5.07)
  - Section or exhibit: ownership table, compensation metrics, proposal list; charter/bylaw amendment text; vote results
  - Finding: first proxy of the Furner transition; third-party DEFA14A suggests a shareholder-proponent campaign; family stake needs verification
  - Possible meaning: comp metrics reveal whether the board pays for the new machine (ads/membership/e-comm targets) or the old one; amendment could be routine housekeeping or governance shift
  - Next investigation: confirm Walton stake %, transition awards, proposal outcomes; classify the 5.03 amendment
- Secondary items: classify the three Item 8.01 8-Ks (2026-03-13, 2026-03-27, 2026-04-30); confirm April 2026 424B2/FWP proceeds use (routine shelf debt, no equity component); identify July 2026 Form 4/144 filers and 10b5-1 status (expect Walton vehicles); pull comp transactions-vs-ticket split from the 2026-05-21 earnings 8-K.

## 12. Score

| Block | Score | Max |
|---|---:|---:|
| Economic health | 30 | 40 |
| Stewardship and integrity | 32 | 40 |
| Market confirmation | 9 | 20 |
| **Total** | **71** | 100 |

Economic health (30/40): revenue/demand quality 6/8 (+4.7% organic at massive scale, but no comp/traffic-ticket split pulled and growth trails COST's +8.2%) · unit economics 6/8 (thin by design, but operating margin compressed 20bp and gross margin is a data gap; mix-shift favorable but unevidenced) · cash conversion 6/8 (0.80 five-year conversion, OCF aligned; one receivables 🟡) · balance sheet 7/8 (0.62x net debt/EBITDA, 12.9x coverage — strong but not COST's net cash) · returns on capital 5/8 (not reconstructed — explicit gap; capex +12% vs operating income +1.6% is an open incremental-return question).

Stewardship (32/40): accounting transparency 7/8 (GAAP-first, no restatements; two tag gaps and a below-the-line NI gap to decompose) · capital allocation 7/8 (internally funded capex, 50% payout, real net retirement; capex returns unproven) · governance/comp 6/8 (orderly succession, aligned family anchor; proxy unreviewed, concentrated control limits minority leverage) · customer/employee/supplier treatment 5/8 (EDLP covenant and wage investment vs supplier-squeeze pattern, labor history, legacy opioid/consumer settlements) · strategic consistency 7/8 (decades-consistent EDLP identity; flywheel build is additive, not a pivot).

Market confirmation (9/20): relative price/estimates 3/5 (+6.8pp vs XLP, positive absolute; no estimates pull) · accumulation/ownership 2/5 (not pulled; Walton anchor static) · valuation vs conservative economics 2/5 (not pulled; premium multiple for a 4% operating-margin retailer is well-established) · catalyst/expectation asymmetry 2/5 (mix-shift narrative already widely told; asymmetry only if ad/membership disclosure surprises).

- Red-flag override: **false** — no §7.3 events in any pull (no auditor/restatement/going-concern/covenant items in the baseline).

Versus COST (77 = 34/34/9): WMT loses 4 points of economic health (weaker conversion, leverage vs net cash, bigger open returns-on-capital question) and 2 of stewardship (conduct history and supplier/labor questions vs COST's model-embedded good faith), and ties on market confirmation (both have the same manual-pass gaps). The flywheel contest stands: COST's machine is proven and fee-concentrated; WMT's is larger, more diversified, and still proving that ads + membership can move a $706B base.

## 13. Falsifiable thesis

- Bull case: the traffic-monetization flywheel compounds — grocery traffic feeds e-commerce and marketplace share, which feeds Walmart Connect ad revenue and Walmart+/Sam's membership; high-margin income grows fast enough that operating income growth re-accelerates above revenue growth from FY2027, the automation capex starts showing in margin, and the dividend + net buyback keep compounding on a barely levered balance sheet.
- Bear case: the mix shift is too small to move the base — ads/membership stay a rounding error against $700B of thin-margin merchandise, tariff/price-investment pressure keeps grinding operating margin down from 4.2%, the $26.6B capex program under a new CEO fails to return, and a premium multiple compresses toward staples-retail reality, giving flat-to-negative returns despite a healthy machine (§13 Pattern C).
- What would prove each wrong: bull is broken if the FY2026 10-K/FY2027 filings show global ad revenue growth decelerating toward overall revenue growth, membership income flat, operating income again lagging revenue growth for a second year, or the receivables divergence persisting >+5pp with no benign mix explanation; bear is broken if operating income growth overtakes revenue growth while ad/membership disclosures accelerate, e-commerce margin contribution is confirmed in the MD&A, and the receivables flag resolves as ads/marketplace mix.
- Next checkpoint and date: **2026-09-15** — Q2 FY2027 10-Q (expected early Sept 2026) plus the FY2026 10-K re-read: (1) receivables note explains the +7.3pp divergence (converges <+5pp or benign mix), (2) FY2026 global ad revenue and membership income extracted, (3) operating-income vs revenue growth gap trend, (4) SBC read off the cash-flow statement to close the ⚪ gap.

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
