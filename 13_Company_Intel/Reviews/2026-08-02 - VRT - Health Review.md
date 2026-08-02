---
node_type: "health_review"
date: "2026-08-02"
company: "Vertiv Holdings Co"
ticker: "VRT"
period: "FY ending 2025-12-31"
process_quality: "improving"
outcome_quality: "improving"
market_response: "rewarding"
divergence_pattern: "good-company-bad-investment"
economic_health_score: 31
stewardship_score: 29
market_confirmation_score: 9
total_score: 69
red_flag_override: false
red_flags: []
next_checkpoint: "Q3 2026 earnings 8-K + 10-Q (~late Oct on prior cadence): backlog above the Q2 2026 level disclosed in the 2026-07-29 8-K, book-to-bill ≥1.0 with no cancellation step-up; FY2025 goodwill source (+$0.7B) identified; Feb 2026 424B5 use of proceeds confirmed"
next_checkpoint_date: "2026-10-31"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_VRT]]"
related_theses: ["[[AI Power Infrastructure]]", "[[Grid Equipment Bottleneck]]"]
tags: [health-review]
---

# Company Health & Integrity Review — Vertiv Holdings Co

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/VRT - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker VRT` — link the pull note into `markers_pull`.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

Builds and services the power and thermal equipment — uninterruptible power supplies, switchgear and busway, precision air and liquid cooling, racks, and monitoring — that lets data centers, communication networks, and industrial sites run dense computing without overheating or losing power; data-center operators, hyperscalers, and colocation providers pay for the hardware up front and for service contracts afterward.

The dossier is still a scaffold with an **empty `one_liner`** — seed it from the sentence above and start the evolution timeline; there is no prior barebones statement to test against yet, so "changed/unchanged" cannot be evaluated this cycle.

## 2. What changed in the company machine?

Grounded in [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Facts_VRT]] (FY2025 vs FY2024 XBRL 10-K facts) and [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Baseline_VRT]]:

- Positive:
  - Revenue $8.0B → $10.2B (+27.7%); operating income $1.4B → $1.8B (+33.8%) — operating leverage, margin 17.1% → 17.9%.
  - OCF $1.3B → $2.1B (+60.2%); FCF $1.2B → $1.9B — growth is cash-confirmed, not accrual-built.
  - Deferred revenue (current) $1.1B → $1.8B (**+70.7%**) — customers paying ahead of delivery, the balance-sheet form of an order book filling faster than it empties (§14 "customer prepayments").
  - R&D $367.6M → $441.7M (+20.2%) — reinvestment in the product line (liquid cooling ramp — see §4) funded from operations.
  - Cash $1.2B → $1.7B (+40.8%) with LT debt flat at $2.9B (−0.5%).
- Negative:
  - Receivables $2.4B → $3.1B (+31.6%), ~3.9pp faster than revenue — inside the constructive band but the drift direction is wrong at this scale; watch it.
  - Diluted shares +1.1% (390.7M) with zero buybacks — grants un-offset (the pull's one 🟡, §3/§6).
- Ambiguous:
  - Net income $495.8M → $1.3B (**+168.8%**) against operating income +33.8% — most of the "growth" sits below the operating line. Something depressed FY2024 net income (tax, interest, or one-off — not tagged in the pull); until the bridge is identified in the FY2025 10-K income statement, +33.8% operating income is the honest growth line, not +168.8%.
  - Goodwill $1.3B → $2.0B (**+53.9%, +$0.7B**) — acquisition activity closed in FY2025; no target, price allocation, or rationale identified in the vault's 8-K list. Route to filings (§11).
  - Feb 2026 capital raise: S-3ASR (2026-02-19), 424B5s (02-19, 02-25), FWP (02-23), then the 8-K of 2026-03-03 (Items 1.01/1.02/2.03 — agreement entered, agreement terminated, direct financial obligation created) — pattern consistent with a notes offering plus facility refinancing, executed while FCF-rich. Principal, tenor, and use of proceeds unverified.

## 3. Financial health

Marker table: [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_VRT]] — rollup 🟢 9 · 🟡 1 · 🔴 0 · ⚪ 1 → `signal_status: clear`. Every marker interpreted below (§5 bands; benign vs negative readings).

- Organic revenue: +27.7% to $10.2B (facts pull). Not decomposed into volume × price × mix × acquisition (§17 Step 2) — with +$0.7B of new goodwill, part of the growth may be bought; the organic-orders split **needs the 10-K segment/MD&A pull**. Explicit gap.
- Gross and operating margin: gross margin **not computable** — cost-of-revenue/gross-profit untagged in XBRL (⚪-shaped gap in the facts pull; check the filing directly). Operating margin 17.9% vs 17.1% (+80bps on +27.7% revenue). Benign: pricing power and fixed-cost leverage in a capacity-constrained market. Negative: if the increment is mostly price, it invites competition (Schneider, Eaton, emerging cooling entrants) and mean-reverts when the scarcity clears — distinguishing needs the gross-margin line.
- FCF conversion: cumulative FCF / net income **1.49** over ≤5 FY 🟢 (well above the 0.80 constructive line); single-year OCF/NI 158.6% (266.1% prior — inflated by the depressed FY2024 NI, see §2). OCF vs earnings trend **aligned** 🟢. Benign and confirmed: earnings are cash. No negative reading survives a 1.49 conversion plus rising deferred revenue.
- Working capital:
  - Receivables growth − revenue growth **+3.9pp** 🟢 (31.6% vs 27.7%). Benign: large-project billing milestones lag shipments in a hypergrowth year. Negative: extended terms to pull orders forward — the classic pre-stuffing drift. The +70.7% deferred-revenue growth argues strongly for the benign reading (customers are paying *ahead*, not being financed), but re-check the spread next quarter.
  - Inventory growth − cost-of-sales growth **−11.3pp** 🟢 (inventory +17.0% vs COGS ~+28%). Benign: turns improving while volume ramps — the opposite of the excess-stock signature flagged 🔴 at NVDA. Negative reading (build hidden in purchase commitments off balance sheet) needs the commitments footnote to exclude.
- ROIC and incremental returns: no marker computed — explicit gap. Directionally extreme: $1.8B operating income against capex of only $220M (~2.2% of revenue), but the +$0.7B goodwill must enter the incremental-capital base before trusting it (§5.4). **Needs manual pull.**
- Debt and liquidity: net debt/EBITDA **0.55x** 🟢; EBIT/interest **21.25x** 🟢. Benign: a conservatively financed balance sheet with room to fund capacity expansion. Negative reading: none at these levels — the only open item is what the Feb 2026 raise adds (post-FY, §11).
- Dilution and SBC (§5.6): diluted share growth **+1.1%** 🟡 — the pull's single investigate flag. Benign: routine equity grants in a growth year, trivially cheap to offset later. Negative: a persistent 1–3%/yr leak with no buyback offset compounds against holders exactly when the stock is expensive. SBC/revenue **0.4%** 🟢 ($45.9M) — the grant *expense* is modest; the leak is un-offset issuance, not size. Route to the statement of equity (§11).
- Buybacks (§5.6): gross buybacks vs net count **⚪ n/a — no repurchases in FY2025** (explicit gap, not estimated; series shows tagged activity 2022–2025, earlier amounts not extracted).
- Distributions (§5.7): dividend **~4% of FCF** 🟢 — token payout, appropriate while reinvestment compounds at these returns.
- Relative performance (§9.2): **+70.6% vs XLI +20.1% (+50.5pp)** over 12 months 🟢 as a confirmation marker — but see §7/§8: at this spread the market question flips from "is improvement recognized?" to "what growth is already paid for?"

## 4. Operational health

§14 read through **two lenses at once**: industrials (organic orders, backlog quality, book-to-bill, cancellations, warranty, aftermarket mix, capacity utilization) and semiconductors/AI-infrastructure (hyperscaler concentration, customer prepayments, power availability, liquid-cooling transition). Evidenced vs needs-pulling marked throughout — no fabricated values.

- **Backlog and orders — the single most load-bearing KPI in this review.** The XBRL facts pull carries **no backlog, RPO, or book-to-bill figure — explicit gap**. In-vault proxy evidence: deferred revenue +70.7% and cash collections running ahead of revenue say the order book filled faster than it shipped through FY2025. Vertiv's earnings materials disclosed record backlog repeatedly through 2024–2025 (public record; exact levels **need pulling** — FY2025 10-K MD&A and the Q2 2026 earnings 8-K of 2026-07-29 are both on file in the baseline, unread). **Cross-link (Universe Map themes 1–2):** VRT sits at the physical bottleneck of the DC buildout — its orders are *third-party* evidence for two other open reviews. [[13_Company_Intel/Reviews/2026-08-02 - NVDA - Health Review]] (70/100) hinges on whether NVDA's 🔴 +20.9pp inventory build is prepositioning or cooling demand; [[13_Company_Intel/Reviews/2026-08-02 - NEE - Health Review]] (68/100) hinges on whether extrapolated data-center electricity demand materializes. VRT's FY2025 prints (+27.7% revenue, +70.7% prepayments) **corroborate both demand theses through 2025**; a VRT order deceleration or backlog decline would be the earliest independent refutation of both. Pull the Q2 2026 backlog number first — it is the highest-value single datum in this dossier.
- **Capacity expansion:** capex +31.7% to $220M, still only ~2.2% of revenue — the machine is asset-light relative to demand. Whether announced capacity additions keep pace with the order book (utilization, lead times, purchase obligations) **needs pulling** — 10-K commitments footnote and MD&A. If demand doubled, manufacturing capacity and supplier throughput are what break first (dossier §6 bottleneck — currently blank; fill it).
- **Liquid-cooling transition:** the product-mix shift that decides whether VRT rides or is displaced by the next compute-density step. In-vault evidence is limited to R&D +20.2% ($441.7M); portfolio specifics (CDU/liquid lines, reference designs with chip vendors) are public record through 2025 but **need verification in the FY2025 10-K business section** before entering the dossier. No revenue split by cooling technology is disclosed in the pull — likely requires earnings-call material.
- **Customer concentration:** hyperscaler/colocation concentration is the structural risk of this demand wave; the 10-K concentration note is **unread — pull needed**. Receivables of $3.1B (+31.6%) is the balance-sheet expression of fewer, larger buyers.
- Industrials-lens items with **no vault evidence** (all need pulling): cancellation and re-scheduling terms in the backlog, warranty-reserve trend (a thermal/power OEM's product-quality tell), aftermarket/service mix (the recurring-revenue stabilizer), supplier health.
- Employees and safety: no adverse events in the baseline index; no data either way — explicit gap.

## 5. Stewardship and integrity

- Accounting quality: markers clean across the board — 1.49 FCF conversion, aligned OCF, inventory tracking COGS. No restatement, auditor event, or late filing in the baseline window. Open items: gross margin untagged in XBRL (presentation friction, not a red flag per se — check the filing), and the FY2024→FY2025 net-income bridge (§2) which makes headline NI growth uninterpretable until identified. Auditor identity/tenure — **verify in FY2025 10-K**.
- Disclosure quality: timely cadence (10-K 2026-02-13, ~6 weeks after FY end; 10-Qs on schedule). Heavy 7.01 8-K flow through 2026 (04-13, 04-27, 06-12 + two more) — active investor communication; contents unread. SD conflict-minerals filings on time (2025, 2026).
- Capital allocation: R&D funded first (+20.2%); dividend kept token (~4% FCF); no buybacks; debt held flat through a hypergrowth year. Two unassessed moves: the FY2025 acquisition(s) behind +$0.7B goodwill, and the Feb 2026 raise (§2) — both routed in §11 before this line can be scored higher.
- Executive compensation: DEF 14A filed 2026-04-24 — **unread**. Leadership structure (executive chairman + CEO, in place since the 2020 SPAC-era listing and 2023 CEO transition — public record) and the metrics that pay them **need the proxy pass**.
- Board oversight: annual meeting 2026-06-17 with vote results in the 8-K Item 5.07 (2026-06-18) — say-on-pay and director support **unread**. A Form 3 dated 2026-06-17/18 indicates a new director/officer — identify.
- Customer and employee treatment: no complaints, litigation, or safety events evidenced in the baseline. Explicit gap, not a clean bill.
- Regulatory and legal record: nothing §7.3-shaped in the vault evidence — no fraud allegation, going-concern language, auditor dispute, restatement, or covenant breach on file. Legacy note: the company's SPAC-era listing (2020) and the 2022 under-pricing/margin stumble that management publicly owned and repriced are public record — the admission belongs in §9 once verified against the 2022 filings. `red_flag_override: false`.

## 6. Shareholder distribution

§5.6–5.7, netted against dilution:

- Dividends: paid, at **~4% of FCF** 🟢 — a token that signals discipline without competing with reinvestment. Per-share values not extracted — pull from the cash-flow statement if needed.
- Gross buybacks: **none in FY2025** (⚪ marker — explicit, not estimated). Tagged repurchase activity exists 2022–2025; earlier amounts not extracted.
- Net share-count change: **+1.1%** 🟡 — the only non-green marker in the pull. With zero FY2025 repurchases, grant issuance flows straight through to holders. Small, but at ~$45.9M SBC expense producing +4.4M diluted shares, the un-offset leak is a choice — check whether the pattern or an authorization changes in the statement of equity/10-Qs.
- Stock compensation: $45.9M, **0.4% of revenue** 🟢 (+32.7% YoY, but growing with the business, not ahead of it).
- Debt used for distributions: none through FY2025 — LT debt flat, distributions a rounding error against $1.9B FCF. The Feb 2026 424B5 raise post-dates FY-end; confirm use of proceeds before ruling this out for FY2026.

## 7. Market behavior

§9 — evidence about expectations and ownership, not proof of business quality.

- Relative performance: **+70.6% vs XLI +20.1% = +50.5pp** over 12 months. The market is rewarding VRT far ahead of its sector — a hypergrowth repricing, not mere recognition of +27.7% revenue.
- Estimate revisions: **no pull — explicit gap.** Needed to know whether price is following numbers or multiple.
- Accumulation/distribution: **no volume/flow pull — explicit gap** (§9.3 manual pass not done; the marker note itself flags this).
- Insider activity: cluster of ten Forms 4 filed 2026-06-26 (transactions 2026-06-25, the week after the 2026-06-17 annual meeting) — pattern consistent with routine annual director grants, but **transaction codes unread — verify before treating as benign**. Form 4 + Form 3 on 2026-06-18 = new insider joining.
- Ownership concentration: 2024 13G/13G-A series = passive institutional base; **no 13D on file** (no activist). 13F holder aggregation **not pulled — gap**.
- Short interest: **no pull — explicit gap.**

## 8. Process-versus-outcome classification

- Process quality: **improving** — demand capture, margins, cash conversion, reinvestment, and balance sheet all strengthened in FY2025 on vault evidence.
- Current outcome quality: **improving** — record revenue and cash-confirmed earnings (with the NI-bridge caveat of §2 keeping the honest figure at +33.8%).
- Market response: **rewarding** — +50.5pp over XLI in 12 months.
- Primary divergence: process, results, and price all point the same way — no backward-looking divergence. The pattern to log is forward-looking: **§13 Pattern C, good company, bad investment**. A +50.5pp sector beat prices continued hypergrowth in AI power/cooling; ownership is index/momentum-heavy (unverified), valuation work is absent from the vault, and nothing in the operational alignment protects the *investment* if orders merely normalize while the company stays excellent. Pattern C is recorded in frontmatter as the standing risk to investigate, not a verdict on the business.

### Divergence sentence (§17 Step 7)

> The company's operating process is `improving`, reported results are `improving`, and the market is pricing `more` future success because a +50.5pp beat over XLI embeds a multi-year AI data-center buildout continuing at hypergrowth rates — an expectation the order book must keep re-validating quarterly, which is §13 Pattern C risk: the company can stay healthy while the investment case fails on backlog normalization alone.

## 9. Good-faith evidence

§10 — present costs carried to protect or build the franchise (vault-evidenced unless tagged):

- R&D raised 20.2% to $441.7M and funded before distributions — the liquid-cooling/product-density transition is being paid for out of the P&L now (XBRL facts).
- Balance sheet kept at 0.55x net debt/EBITDA with 21x coverage through a hypergrowth year — capacity to finish the capacity build without depending on friendly markets (marker pull).
- Distributions kept subordinate: ~4% of FCF dividend, no leverage used, SBC held to 0.4% of revenue (marker pull).
- Customer prepayments accepted with delivery obligations attached — deferred revenue +70.7% is the company committing capacity to customers, not just booking demand (facts pull).
- The 2022 public admission of under-pricing against inflation, followed by repricing — a named error owned by management (public record; **verify in 2022 filings before weighting**).

## 10. Extraction or bad-faith risk

§11–12 — none demonstrated; candidates ranked:

- **Pattern C pricing (the top risk here):** nothing about the company's conduct — the risk is that crowd-priced hypergrowth converts an excellent operator into a poor investment. Unmeasured until valuation and ownership pulls are done.
- +$0.7B goodwill (+53.9%) with no identified target: acquisition accounting can dress organic growth — until the purchase-price allocation is read, the organic/acquired revenue split is unknown (§15 "Large acquisition").
- Feb 2026 capital raise while generating $1.9B FCF at 0.55x leverage: likely routine refinancing (the 03-03 8-K's 1.02 termination suggests replacing a facility), but if proceeds fund buybacks-at-highs or vendor financing, the §5.7 read changes. Unverified.
- +1.1%/yr dilution with zero buyback offset: small, legal, and easy to rationalize — also the kind of steady transfer that §12 says to net honestly (routed to statement of equity).
- Receivables drifting +3.9pp above revenue: within band, and contradicted by prepayments — but it is the marker that would move first if orders were being pulled forward on terms. Watch, don't excuse.

## 11. EDGAR follow-up

Routed per the §15 table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.

- Filing: **Q2 2026 earnings 8-K (2026-07-29, Item 2.02) + Q2 10-Q (2026-06-30 period)** — §15 "Revenue quality concern".
  - Section or exhibit: earnings exhibit KPIs; 10-Q revenue note and RPO/backlog disclosure.
  - Finding: no backlog/orders/book-to-bill figure anywhere in the vault — the load-bearing KPI is unevidenced.
  - Possible meaning: order book still compounding (confirms NVDA/NEE demand theses) vs deceleration (earliest third-party refutation of both).
  - Next investigation: extract backlog level, book-to-bill, cancellation language; set the §13 threshold against it.
- Filing: **FY2025 10-K (filed 2026-02-13)** — four routes:
  1. MD&A + segment/revenue notes → backlog quality, organic vs acquired growth split, customer concentration note (§15 "Customer or supplier dependence").
  2. Income statement + tax/interest footnotes → identify what depressed FY2024 net income (the +168.8% bridge, §2).
  3. Acquisition footnote → source of +$0.7B goodwill; purchase-price allocation, earnouts (§15 "Large acquisition").
  4. Commitments footnote → capacity expansion obligations, purchase commitments, warranty reserves (§14 industrials).
- Filing: **S-3ASR + 424B5 (2026-02-19/25) + FWP (2026-02-23) + 8-K 2026-03-03 (1.01/1.02/2.03)** — §15 "New capital raise": principal, tenor, use of proceeds, what was terminated.
- Filing: **DEF 14A (2026-04-24) + 8-K Item 5.07 (2026-06-18)** — §15 "Related-party concern"/comp: pay metrics, board, say-on-pay and director votes; identify the 2026-06 Form 3 insider.
- Filing: **statement of equity (10-K) + 10-Qs** — §15 "Dilution": the 🟡 +1.1% share growth; grant vesting vs any repurchase authorization.
- Non-EDGAR gaps for §7: estimate revisions, 13F holder aggregation, short interest, §9.3 volume pass.

## 12. Score

§16 rubrics; gaps score conservatively — a gap is never benefit of the doubt. Copied to frontmatter.

| Block | Score | Max |
|---|---:|---:|
| Economic health | 31 | 40 |
| Stewardship and integrity | 29 | 40 |
| Market confirmation | 9 | 20 |
| **Total** | **69** | 100 |

- Economic health 31/40 — revenue/demand 7/8 (+27.7% cash-confirmed with +70.7% prepayments; organic/acquired split and concentration unverified) · margins 5/8 (op margin up 80bps, but gross margin untagged and price-vs-volume unexplained) · cash conversion 7/8 (1.49 conversion, aligned OCF, inventory −11.3pp; receivables drift the only blemish) · balance sheet 7/8 (0.55x, 21.25x coverage; Feb 2026 raise unexplained) · returns on capital 5/8 (capex-light economics look extreme, but no ROIC computed and +$0.7B goodwill unassessed — gap).
- Stewardship 29/40 — accounting transparency 6/8 (clean markers; NI bridge and gross-margin tag open) · capital allocation 6/8 (R&D-first, token dividend, flat debt; acquisition and raise unassessed) · governance/comp 5/8 (DEF 14A, vote results, insider cluster all unread — gap) · customer/employee/supplier treatment 5/8 (no adverse evidence, but almost no evidence — gap) · strategic consistency 7/8 (one machine since the Emerson carve-out lineage; reinvestment matches the stated strategy).
- Market confirmation 9/20 — relative price/estimates 4/5 (+50.5pp vs XLI; no revision data) · accumulation/ownership 2/5 (no pull — neutral by default) · valuation vs conservative economics 1/5 (no valuation work in vault while the price embeds hypergrowth — scored low per Pattern C) · catalyst/expectation asymmetry 2/5 (after a +70.6% year the bar is high; upside asymmetry requires backlog beats that are not yet evidenced).
- Red-flag override: **false** — no documented §7.3 event (no fraud allegation, going-concern, auditor dispute, restatement, covenant breach, or safety failure in the evidence base). Total 69 = top of the "mixed" band (55–69) — held out of "healthy" (70+) honestly by the unpulled load-bearing KPI (backlog), the unread proxy/governance file, and absent valuation/ownership work rather than by any documented damage.

## 13. Falsifiable thesis

- Bull case: VRT is the physical bottleneck of the AI buildout — every incremental megawatt of compute needs its power train and (increasingly) liquid cooling regardless of which chip wins. FY2025 shows the machine converting that position into cash: +27.7% revenue at 1.49 FCF conversion, prepayments +70.7%, 0.55x leverage funding the capacity race. If the order book keeps compounding, VRT simultaneously validates [[13_Company_Intel/Reviews/2026-08-02 - NVDA - Health Review]]'s benign inventory reading and [[13_Company_Intel/Reviews/2026-08-02 - NEE - Health Review]]'s demand extrapolation.
- Bear case: the order book is a one-time densification wave now priced as a permanent growth rate. If hyperscaler capex digests — the exact scenario NVDA's 🔴 inventory divergence would front-run — orders decelerate, book-to-bill slips below 1.0, cancellations surface in the backlog, and a stock up +70.6% in twelve months compresses hard even while the company remains excellent (Pattern C); margin gains mean-revert as competing capacity arrives.
- What would prove each wrong: **bull broken** if backlog declines sequentially for two consecutive quarters, or book-to-bill runs <1.0 for two quarters with cancellation/re-scheduling language appearing, or deferred revenue growth flips negative while receivables keep outgrowing revenue. **Bear broken** if backlog sets new highs through FY2026 with book-to-bill ≥1.0, organic orders (ex-acquisition) still growing >20%, and operating margin holding ≥17.9% — demand durable, pricing intact.
- Next checkpoint and date: **Q3 2026 earnings 8-K + 10-Q** (prior-year Q3 10-Q filed 2025-10-22, so expect ~late Oct 2026): backlog above the Q2 2026 level disclosed in the 2026-07-29 8-K (pull that number first — it sets the threshold), book-to-bill ≥1.0, no cancellation step-up; in parallel, close the goodwill identification and the Feb 2026 use-of-proceeds from the FY2025 10-K/424B5. Copied into `next_checkpoint` / `next_checkpoint_date` → **2026-10-31**.

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
