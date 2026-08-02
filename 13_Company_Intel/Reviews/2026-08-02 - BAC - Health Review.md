---
node_type: "health_review"
date: "2026-08-02"
company: "BANK OF AMERICA CORP /DE/"
ticker: "BAC"
period: "FY ending 2025-12-31"
process_quality: "improving"
outcome_quality: "improving"
market_response: "rewarding"
divergence_pattern: "none"
economic_health_score: 26
stewardship_score: 26
market_confirmation_score: 12
total_score: 64
red_flag_override: false
red_flags: []
next_checkpoint: "Q2 2026 10-Q (filed 2026-07-31) credit + rate pass: establish provision/net loans and charge-off baseline (absent from vault), allowance coverage stable, HTM unrealized-loss drag shrinking, CET1 comfortably above requirement"
next_checkpoint_date: "2026-08-09"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_BAC]]"
price_at_review: 61.95
reconsider_price_low: 49.56
reconsider_price_high: 77.44
related_theses: []
tags: [health-review]
---

# Company Health & Integrity Review — BANK OF AMERICA CORP /DE/

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/BAC - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker BAC` — link the pull note into `markers_pull`.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

Bank of America gathers roughly $2.0T of deposits and converts them into interest-earning loans and securities while charging fees for cards, payments, Merrill wealth management, investment banking, and markets — the second-largest US deposit-spread-plus-fee machine ($3.41T assets at FY2025). Same machine species as JPM, run with a heavier low-yield securities book. The dossier `one_liner` is still empty (research_status: Scaffold) — backfill it with this sentence and start the evolution timeline.

## 2. What changed in the company machine?

Grounded in [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Facts_BAC]] (FY2025 vs FY2024) and [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Baseline_BAC]].

- Positive:
    - Both revenue engines accelerated: net interest income $60.1B (+7.2%) and noninterest income $53.0B (+6.4%) → total net revenue $113.1B (+6.8%) — more than double JPM's +2.8% pace; the spread engine is repricing upward.
    - Positive operating leverage: expense +4.4% ($69.7B) against revenue +6.8%; efficiency ratio improved 63.1% → 61.7% while JPM's slipped 51.7% → 52.4%. Net income +13.1% to $30.5B; ROE 9.2% → 10.1%.
    - Loans (net) +8.3% to $1,172.5B against deposits +2.7% to $2,018.7B — loans/deposits 55.1% → 58.1%, still deposit-rich; diluted shares −3.2% while equity grew +3.2% to $303.2B.
- Negative:
    - Deposit growth of +2.7% lags JPM's +6.4% — the funding franchise grew, but slower than the leading peer; deposit cost and mix are not in the pull (gap).
    - FY2025 provision for credit losses is **not in the vault** — the facts row surfaces stale FY2019/FY2018 tags ($3.6B/$3.3B), so credit-cost direction is unverifiable here while JPM's provision jumped +33% (gap, routed §11).
    - SBC +16.5% to $4.0B outran revenue growth (now 3.5% of revenue vs JPM's 2.0%).
- Ambiguous:
    - Baseline shows a June–July 2026 cluster of Forms 3/4 plus one Form 144 (2026-06-22) — unreviewed (§11); 8-K 2026-07-24 (Items 8.01/9.01) unreviewed; ten 424B2 structured-note prospectuses on 2026-07-31 alone — routine holding-company funding, volume worth tracking (same pattern as JPM).
    - Q2 2026 10-Q already filed (2026-07-31) — the freshest credit and capital evidence exists but has not been read.

## 3. Financial health

**Bank lens first (§14).** BAC ran on the bank skeleton profile, so the generic §5 markers are suppressed **by design**: net debt/EBITDA and EBIT/interest coverage (⚪) are meaningless when deposits and interest expense are the raw material; FCF conversion, receivables, and inventory (⚪) do not map to a balance-sheet lender. The replacements are the §14 bank emphasis list — CET1, tangible common equity, deposit composition and cost, uninsured deposits, NIM, NPLs, net charge-offs, allowance coverage, CRE concentration, consent orders — plus, for BAC specifically, the **held-to-maturity securities drag**: the pandemic-era purchase of long-duration, low-yield securities whose unrealized losses (well-established to have peaked above $100B in 2023) sit outside reported equity and depress NIM and ROE versus JPM. None of these is quantified in the vault yet — every one is an explicit gap routed in §11.

**The one 🟡 — OCF vs earnings divergence — is a bank-accounting artifact, not an earnings-quality signal.** Bank operating cash flow is dominated by trading, origination, and deposit flows, which is why the bank facts profile omits OCF deliberately. The real earnings-quality test runs through provisioning adequacy — and for BAC that test is doubly open, because the FY2025 provision itself is missing from the pull (stale tag).

Marker table: see [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_BAC]] — rollup 🟢 4 · 🟡 1 · 🔴 0 · ⚪ 6, `signal_status: clear`.

- Organic revenue: +6.8% to $113.1B, all organic (no FY2025 acquisition evidenced). NII +7.2% and fees +6.4% — balanced and accelerating, vs JPM's +3.1%/+2.4%. The faster NII is the rate-sensitivity contrast in action: BAC's asset book repricing off a lower base.
- Gross and operating margin: not meaningful for a bank → efficiency ratio 61.7%, improved 140bp YoY but still ~9pp structurally worse than JPM's 52.4%. The line to watch is revenue +6.8% vs expense +4.4% — leverage is positive, the level is the weakness.
- FCF conversion: n/a by design (artifact note above). Earnings quality rests on provisioning — FY2025 provision, charge-offs, and allowance are all unevidenced (gap, §11). Provision/net loans derived row is blank in the pull; JPM's comparable is 1.0%.
- ROIC and incremental returns: → ROE 10.1% (prior 9.2%) — improving, but ~5.6pp below JPM's 15.7% and only modestly above a reasonable cost of equity. The gap is largely the low-yield securities drag (well-established; sizing unverified, §11).
- Debt and liquidity: §5.5 bands suppressed (§14). Replacements: loans/deposits 58.1% (deposit-funded, near JPM's 57.3%); CET1 **not in vault** — well-established public record has BAC in the low-12% area against a ~10.7% requirement in recent years, but treat as unverified until the FY2025 10-K capital section is read (gap). Uninsured-deposit share, deposit cost, NIM: gaps.
- Working capital: n/a — the bank analogue is deposit composition/stickiness, unevidenced (gap).

## 4. Operational health

- Customers and retention: deposits +2.7% at the #2 US deposit franchise — growth, but half JPM's pace; household counts, digital-engagement metrics, and complaint volumes not pulled (gap).
- Product and innovation: full-spectrum consumer bank + Merrill wealth + global banking and markets under one capital base (well-established structure); segment revenue split not in the pull — verify in the FY2025 10-K segment note (gap).
- Employees and safety: no evidence in vault (gap — headcount and turnover live in the 10-K/ESG report).
- Suppliers and capacity: the bank analogue is technology and operational-resilience spend — well-established to be a multi-billion-dollar annual budget, unverified here (gap).
- Sector-specific KPIs (§14 bank list): NIM, NPLs, net charge-offs, allowance coverage, CRE/office concentration, uninsured deposits, **HTM unrealized-loss trend** — none pulled; the biggest evidence hole in the review, and for BAC the HTM line is the thesis-critical one (§11).
- Incentive-system risk (§11.3 lesson): unlike JPM, BAC has a *documented* recent case — the 2023 CFPB/OCC orders (~$250M combined) over double-charged junk fees, withheld card rewards, and unauthorized account openings: the Wells Fargo pattern at smaller scale, resolved (well-established). Whether retail incentive design actually changed is unreviewed (gap — DEF 14A incentive metrics + complaint-trend pass).

## 5. Stewardship and integrity

- Accounting quality: standard GAAP bank reporting; however XBRL tag hygiene in this pull is notably worse than JPM's — the provision row surfaces FY2019/FY2018 values, interest-expense coverage ends FY2023, dividendsPaid ends FY2013, and the facts note's entity label reads "BofA Finance LLC" (a funding subsidiary). This is pull/tag noise, not evidence of opacity — but it leaves provisioning and dividends unverifiable from the vault (routed §11).
- Disclosure quality: extensive quarterly earnings supplements with granular credit detail are long-standing practice (well-established).
- Capital allocation: buybacks shrank the share count 3.2% while equity still grew 3.2% — distributions funded from earnings, not capital erosion. Dividend is well-established as continuously paid and repeatedly raised (most recently to $0.26/quarter in 2024) despite the stale tag — verify FY2025 totals in the 10-K.
- Executive compensation: CEO Brian Moynihan since 2010; comp raised to roughly $35M for 2024 (well-established) — verify structure and metrics in the DEF 14A (filed 2026-03-23); 2026 say-on-pay result sits unread in 8-K 2026-05-06 Item 5.07.
- Board oversight: succession around a long-tenured CEO is the standing governance question, with senior-leadership reshuffles in recent years read as succession positioning (well-established) — verify current succession disclosure in DEF 14A (gap).
- Customer and employee treatment: the 2023 CFPB/OCC junk-fee/unauthorized-accounts orders are the documented blemish; remediation paid, practices ended — but the §11.3 lesson says verify the incentive system, not the press release (gap).
- Regulatory and legal record: well-established history of large *resolved* settlements — 2014 DOJ RMBS ($16.65B, largest of its era, mostly Countrywide/Merrill legacy), 2023 CFPB/OCC consumer orders. No open §7.3 hard-stop events on vault evidence; open consent orders, if any — verify in the 10-K supervision & regulation and legal-proceedings sections.

## 6. Shareholder distribution

- Dividends: the pull's dividendsPaid series ends FY2013 — a stale-tag artifact, **not** a suspension: BAC's common dividend is well-established as paid and growing throughout the window; verify dollar totals and payout vs organic capital generation in the 10-K (gap). Dividend/FCF band is ⚪ by design (FCF undefined for banks).
- Gross buybacks: exceed issuance — 🟢 §5.6 marker.
- Net share-count change: −3.2% YoY (7.9B → 7.7B diluted weighted-average shares).
- Stock compensation: $4.0B = 3.5% of revenue — 🟢 modest in level, but +16.5% growth outpaced revenue and the ratio runs ~1.7× JPM's 2.0%; the net count still fell, so dilution is being mopped up — watch the growth rate.
- Debt used for distributions: not evidenced; the binding constraint for a bank is CET1 headroom — equity grew +3.2% alongside the buyback, which argues distributions are not straining capital (CET1 verification open, §11).

## 7. Market behavior

- Relative performance: +35.7% over 12 months vs XLF +10.8% (+24.9pp) — 🟢 per the pull, and more than double JPM's +10.8pp spread. The market is rewarding the catch-up story hard; §9 ownership and volume markers still need the manual pass.
- Estimate revisions: **gap** — no estimates data in vault.
- Accumulation/distribution: **gap** — §9.3 volume/ownership pass not done.
- Insider activity: June–July 2026 Forms 3/4 cluster + one Form 144 (2026-06-22) sit unreviewed in the baseline — unclassified (10b5-1 vs discretionary; routed §11).
- Ownership concentration: **gap** — note the 13F-HRs in the baseline are BAC's *own* asset-manager filings, not holders of BAC. Berkshire Hathaway, long the largest holder, sold down substantially through 2024–2025 to below the 10% reporting threshold (well-established) — current stake and further selling unverified (13F/13G pass).
- Short interest: **gap** — not pulled.

## 8. Process-versus-outcome classification

- Process quality: **improving** — both revenue engines accelerating, positive operating leverage (revenue +6.8% vs expense +4.4%), loans deployed into a still deposit-rich balance sheet, share count falling while equity grows.
- Current outcome quality: **improving** — net income +13.1%, ROE 9.2% → 10.1%, efficiency 63.1% → 61.7%; improving from a level well below the best peer.
- Market response: **rewarding** — +24.9pp vs XLF over 12 months.
- Primary divergence: **none** — the market is paying up for an improvement that the FY2025 numbers actually show; the open question is degree, not direction.

### Divergence sentence (§17 Step 7)

> The company's operating process is `improving`, reported results are `improving`, and the market is pricing `more` future success because `the asset-repricing/HTM roll-off story promises NII catch-up toward peer-level profitability — a momentum premium consistent with the evidence so far, not a divergence`.

## 9. Good-faith evidence

- Positive operating leverage without funding strain: revenue +6.8% against expense +4.4% while deposits still grew and loans/deposits stayed a conservative 58.1% — growth is being run through the existing cost base, not bought (facts pull).
- Distributions kept subordinate to capital: share count −3.2% *and* equity +3.2% in the same year — the buyback is funded by earnings, not capital release (facts pull).
- A decade-plus of the "responsible growth" doctrine — deliberately constrained risk appetite after the Countrywide/crisis era, trading growth for stability (well-established; the FY2025 credit numbers that would prove it current are a gap).
- 2023 consumer-remediation orders were settled with redress paid and practices ended rather than litigated for years (well-established) — remediation after harm, so it earns only partial credit here.

## 10. Extraction or bad-faith risk

- Documented §11.3-pattern case: the 2023 CFPB/OCC orders (junk fees, withheld rewards, unauthorized accounts) prove the retail incentive machine *has* harmed customers recently; resolved, but whether the incentive design changed is unverified (gap — the single most important stewardship follow-up).
- HTM accounting legally shields a large unrealized loss (well-established to have peaked above $100B in 2023) from equity and earnings — reported book value overstates marked reality and the ROE improvement is flattered by not recognizing the drag; the cash opportunity cost is real either way (sizing gap, §11).
- SBC growing +16.5% vs revenue +6.8% — small today (3.5% of revenue) but compounding faster than the business; watch the trend.
- Continuous structured-note issuance (ten 424B2s on 2026-07-31) — legal, routine funding that transfers complex payoff risk to yield-seeking buyers; extractive only at the margin, volume worth monitoring (baseline pull).

## 11. EDGAR follow-up

Routed with the §15 table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.

| Filing | Section or exhibit | Finding | Possible meaning | Next investigation |
|---|---|---|---|---|
| FY2025 10-K (filed 2026-02-25) + Q2 2026 10-Q (filed 2026-07-31) | Allowance for credit losses roll-forward; credit-quality tables | FY2025 provision missing from vault (stale FY2019/FY2018 XBRL tag); provision/net loans blank | Cannot tell whether credit costs are normalizing as at JPM (+33%) or still benign | Extract provision, NCOs, NPLs; establish provision/net loans baseline vs JPM's 1.0% |
| FY2025 10-K | Securities footnote; AOCI note | HTM drag well-established but unquantified in vault | Size and burn-down rate of unrealized losses set the ROE catch-up timetable | Pull HTM balance, unrealized loss, duration/roll-off schedule; trend vs 2023 peak |
| FY2025 10-K | Capital management; supervision & regulation | CET1, uninsured deposits, deposit cost, NIM all gaps | Confirms capital headroom behind the buyback | CET1 vs requirement; uninsured-deposit share; NIM vs JPM |
| FY2025 10-K | Credit concentration disclosures | §14 flags CRE concentration; unevidenced | Office/CRE sizing determines tail risk | Extract CRE balances and criticized-loan trend |
| DEF 14A (2026-03-23) + 8-K 2026-05-06 (Item 5.07) | Compensation; incentive metrics; vote results | Comp structure, retail-incentive design post-2023 orders, and 2026 votes unread | Governance temperature + §11.3 incentive verification | Read incentive metrics (sales-practice-sensitive ones especially), say-on-pay %, succession language |
| Forms 3/4 (Jun–Jul 2026) + Form 144 (2026-06-22) + 8-K 2026-07-24 (Item 8.01) | Insider transactions; other events | Unclassified cluster; unreviewed event | Routine 10b5-1 vs discretionary selling; unknown 8.01 event | Classify plans; net insider position change; read the 8-K |

## 12. Score

§16 rubrics; four numbers copied into frontmatter. Gaps score conservatively — unverified strength is not credited.

| Block | Score | Max |
|---|---:|---:|
| Economic health | 26 | 40 |
| Stewardship and integrity | 26 | 40 |
| Market confirmation | 12 | 20 |
| **Total** | **64** | 100 |

- Economic health 26/40: revenue quality 7/8 (dual engines, both accelerating, deposit-funded, organic); unit economics 5/8 (efficiency improving 140bp but ~9pp behind JPM's 52.4%); cash conversion/earnings quality 4/8 (bank OCF meaningless by design — quality rests on provisioning, which is *entirely* unevidenced here, one notch below JPM's 5); balance-sheet resilience 5/8 (deposit-rich at 58% loans/deposits; CET1 gap; unquantified HTM drag caps the score); returns on capital 5/8 (ROE 10.1% rising but only modestly above cost of equity, ~5.6pp below JPM's 15.7%).
- Stewardship 26/40: accounting transparency 5/8 (clean GAAP posture, but tag staleness leaves provision and dividends unverifiable in-vault); capital allocation 6/8 (buyback + well-established growing dividend funded by earnings, equity still grew; dollar totals unverified); governance/compensation 5/8 (long-tenured-CEO succession overhang; comp and 2026 votes unverified); customer/employee treatment 4/8 (documented 2023 CFPB/OCC incentive-system harm — recent Wells-pattern case, resolved; incentive re-verification not done — one notch below JPM, which has no equivalent recent retail case); strategic consistency 6/8 (responsible-growth doctrine held since the early 2010s; the pandemic-era HTM duration bet is the one large process error it produced).
- Market confirmation 12/20: relative price/estimates 4/5 (+24.9pp vs XLF evidenced; revisions gap); accumulation/ownership 2/5 (unpulled; Berkshire sell-down status unverified — cannot credit); valuation vs conservative economics 3/5 (well-established price/book discount to JPM consistent with the ROE gap — less priced for perfection; multiples unverified); catalyst asymmetry 3/5 (observable HTM roll-off/NII-catch-up catalyst, partly consumed by the +35.7% run).
- Red-flag override: **false** — no open §7.3 hard-stop events evidenced (the 2023 consumer orders and 2014 RMBS settlement are resolved; nothing in the baseline window shows auditor disputes, restatements, or open fraud allegations).

Total 64/100 → "mixed; thesis depends on specific repairs or underappreciated strengths" (§16 band 55–69) — which is literally the thesis: the repair is the ROE/efficiency catch-up as the HTM drag rolls off, and the score is held down as much by evidence gaps (provision, CET1, HTM sizing) as by documented weakness. Contrast JPM at 71: stronger absolute economics, but flat-to-softening direction; BAC is the weaker machine improving faster.

## 13. Falsifiable thesis

- Bull case: the rate-sensitive book keeps repricing — NII compounds at high single digits as low-yield HTM securities roll off, efficiency grinds below 60% on positive operating leverage, the share count shrinks ~3%/yr, and ROE climbs from 10.1% toward 13%+, closing part of the gap to JPM; the price/book discount re-rates accordingly.
- Bear case: rate cuts compress asset repricing before the HTM drag rolls off, stalling NII; credit normalizes against an unknown provision baseline and bites a ~10%-ROE machine harder than a ~16%-ROE one; expense discipline slips back; the +35.7% run mean-reverts toward XLF as the catch-up narrative stalls.
- What would prove each wrong: **Bull broken** if NII growth decelerates below ~3% YoY for two consecutive quarters without offsetting fee growth, ROE slips back below ~9.5%, or the Q2 2026 10-Q shows provisions/charge-offs inflecting sharply off whatever baseline it establishes. **Bear broken** if FY2026 prints ROE ≥11% with efficiency below ~61%, stable credit metrics, and a still-shrinking share count.
- Next checkpoint and date: **Q2 2026 10-Q — already filed 2026-07-31, unread.** Credit + rate pass: establish the provision/net loans and net charge-off baseline (absent from vault), check allowance coverage, HTM unrealized-loss trend vs the well-established 2023 peak, and CET1 vs requirement. Copied into `next_checkpoint` / `next_checkpoint_date` (2026-08-09).

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
