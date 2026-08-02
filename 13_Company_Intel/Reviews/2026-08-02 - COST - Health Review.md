---
node_type: "health_review"
date: "2026-08-02"
company: "COSTCO WHOLESALE CORP /NEW"
ticker: "COST"
period: "FY ending 2025-08-31"
process_quality: "stable"
outcome_quality: "improving"
market_response: "ignoring"
divergence_pattern: "none"
economic_health_score: 34
stewardship_score: 34
market_confirmation_score: 9
total_score: 77
red_flag_override: false
red_flags: []
next_checkpoint: "FY2026 10-K: receivables−revenue divergence converges below +5pp; worldwide renewal rate holds ≥90%; membership-fee income and its share of operating income confirmed in the revenue note"
next_checkpoint_date: "2026-10-15"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_COST]]"
price_at_review: 951.89
reconsider_price_low: 761.51
reconsider_price_high: 1189.86
related_theses: []
tags: [health-review]
---

# Company Health & Integrity Review — COSTCO WHOLESALE CORP /NEW

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/COST - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker COST` — link the pull note into `markers_pull`.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

Costco collects annual membership fees from households and businesses in exchange for the right to buy bulk merchandise priced near cost — the durable profit engine is the renewing membership base, while merchandise itself is run at deliberately razor-thin markups so that renewal stays near-automatic.

Checked against the dossier `one_liner` ("Buys large quantities of goods, sells them at low markups, and charges customers for memberships") — consistent; no machine change, so no dossier evolution-timeline update needed. This review only sharpens *where* the profit lives: the fee, not the merchandise spread.

## 2. What changed in the company machine?

- Positive:
  - **Membership fee increase flowed into FY2025** (effective 2024-09-01, US/Canada Gold Star $60→$65, Executive $120→$130 — first increase since 2017; well-established). Evidence it landed without damage: deferred revenue (mostly deferred membership fees) +14.1% to $2.9B, outpacing revenue +8.2% ([[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Facts_COST]]).
  - **Operating leverage without margin games:** revenue +8.2% to $275.2B, operating income +11.8% to $10.4B (margin 3.6%→3.8%), OCF +17.6% to $13.3B — cash growing faster than earnings, earnings faster than revenue.
  - **Inventory discipline:** inventory fell 2.8% to $18.1B against +8.2% revenue (divergence −10.7pp vs cost of sales) — turns improving, no stuffed shelves.
  - **Balance sheet strengthened further:** cash +43% to $14.2B against long-term debt of $5.7B (down 1.4%).
- Negative:
  - **Receivables grew 9.5pp faster than revenue** (🟡 marker) — needs the 10-K receivables/revenue note before it can be called benign (§3, §11).
  - **Buybacks only offset grants** (🟡 marker) — the diluted share count is flat at 444.8M, so repurchases are an anti-dilution tool, not a distribution.
- Ambiguous:
  - **Capex +16.7% to $5.5B** — consistent with warehouse expansion (growth investment per §5.2), but store-level returns on new openings are not yet evidenced in the vault.
  - **Leadership transition still bedding in:** CEO Ron Vachris (Jan 2024) and CFO Gary Millerchip (Mar 2024, succeeding Richard Galanti after ~4 decades) — well-established; comp structure under the new team to be verified in the 2025-12-04 DEF 14A. An 8-K Item 5.02 (2025-10-20) is unreviewed — identify the officer/director change (§11).

## 3. Financial health

Marker table from [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_COST]] — rollup 🟢 9 · 🟡 2 · 🔴 0 · ⚪ 0, `signal_status: clear`. Interpretation of every marker below.

- Organic revenue: +8.2% (FY2025, XBRL) — healthy for a mature retailer and almost certainly organic (goodwill flat at $994M, no acquisition activity in the baseline). Traffic-vs-ticket and comp-sales split **not pulled** — explicit gap (§4).
- Gross and operating margin: gross margin is an **explicit XBRL gap** (non-standard tags — check the filing directly). Operating margin 3.8% (from 3.6%) is razor-thin *by design*: the interesting question for a membership retailer is not the merchandise margin but the **membership-fee dependence of operating income** — in FY2024 fees were roughly half of operating income (~$4.8B fees vs $9.3B operating income; well-established). The FY2025 split, with fee-increase flow-through, must be verified in the 10-K revenue note. The profit pool is concentrated in a single renewable line — a strength while renewal holds, a fragility if it slips.
- FCF conversion: 🟢 0.92 cumulative FCF/NI over 5 FY; 🟢 OCF tracks earnings (OCF/NI 164.6% in FY2025, D&A-heavy as expected for a warehouse fleet). FY2025 FCF $7.8B (OCF $13.3B − capex $5.5B). Earnings are real cash.
- ROIC and incremental returns: **not computed in the pull — explicit gap.** The qualitative story (high warehouse-level returns, negative working-capital float from fees collected upfront and fast turns) is well-established but should be reconstructed per §5.4 rather than asserted.
- Debt and liquidity: 🟢 net cash; 🟢 EBIT/interest 67.4x. No survival questions (§4 Level 1 passes trivially). Interest burden immaterial.
- Working capital:
  - 🟢 Inventory divergence −10.7pp vs cost of sales — the opposite of channel-stuffing; turns strengthening.
  - 🟡 **Receivables +9.5pp faster than revenue.** Benign candidates for a membership retailer: a small absolute base (Costco's receivables are on the order of ~1% of revenue, so percentage swings are noisy), vendor-rebate timing, and **mix** — growth in third-party-payor pharmacy, e-commerce/Costco Logistics, and business-center B2B sales all create trade receivables a walk-in cash/card business doesn't. Negative candidates: stretched payment terms to B2B customers (borrowing growth) or weakening collections. The receivables line is itself an XBRL gap in the facts pull, which is why this routes to the filing (§11).
- Dilution and SBC (§5.6): 🟢 diluted shares +0.0% YoY; 🟢 SBC 0.3% of revenue ($860M) — trivially small for the revenue base. 🟡 gross buybacks vs net share count: buybacks roughly offset grants, so **net shareholder benefit from repurchases is ~zero** — honest framing in §6.
- Distributions (§5.7): 🟢 dividend at 28% of FCF — comfortably below the 30–60% mature-company band, leaving room for the special-dividend pattern (§6).
- Market (§9.2): 🟢 12-month return −0.1% vs XLP +6.1% (−6.2pp) — within the normal band (§7 below).

## 4. Operational health

Per §14 consumer/retail emphasis. Evidenced vs needs-pulling, no fabricated metrics:

- Customers and retention: **Renewal rate is the single most important operating metric for this machine** — recent fiscal years ran ~90% worldwide / ~93% US-Canada (well-established; **verify FY2025 figure in the 10-K Item 7/MD&A**). Deferred membership fees +14.1% is indirect evidence the base absorbed the fee increase, but member-count and paid-membership growth need the 10-K disclosure. Post-fee-increase renewal behavior is the thing to watch through FY2026.
- Product and innovation: private-label (Kirkland Signature) penetration — well-established as a large and growing share of sales (roughly a quarter or more; **verify**). E-commerce and Costco Logistics growth — needs pulling from MD&A.
- Employees and safety: above-market hourly wages and low turnover are well-established Costco policy (present cost protecting service quality and shrink); no FY2025 figures in the vault — qualitative only.
- Suppliers and capacity: fast turns mean much inventory is sold before supplier invoices come due (float; **verify payables days in the 10-K**). No §6.4 warning signs in the pulls — payables data not extracted.
- Sector-specific KPIs (§14 retail):
  - **Traffic vs ticket / same-store sales:** not pulled — Costco discloses comps regularly; route to earnings 8-Ks (2.02 filings: 2025-12-11, 2026-03-05, 2026-05-28 in the baseline).
  - **Inventory turns:** evidenced directionally — inventory −2.8% on +8.2% revenue is a 🟢; exact turns need the balance-sheet average calc.
  - **Shrink:** structurally low at Costco (membership + receipt checks — well-established qualitatively); no figure disclosed or pulled.
  - **Renewal/loyalty:** see above — the KPI to verify every review.

## 5. Stewardship and integrity

- Accounting quality: stable GAAP-first presentation with minimal adjusted-metric usage (well-established; nothing in the pulls contradicts it). Two standardized-tag gaps (gross margin, current receivables) are XBRL-tagging quirks to check in the filing, not accusations. No restatements, no auditor issues in the baseline.
- Disclosure quality: consistent 10-K/10-Q cadence, on-time filings, monthly/quarterly sales transparency historically strong. No §7.2 warning signs evidenced.
- Capital allocation: net cash, debt shrinking, capex rising into the core machine, dividend at 28% of FCF, and a **special-dividend pattern** (§6). No empire-building: goodwill flat at $994M for years. Constructive.
- Executive compensation: **verify in DEF 14A (2025-12-04)** — first full proxy under the Vachris/Millerchip team; check performance conditions and whether grants stay modest (SBC at 0.3% of revenue suggests restraint).
- Board oversight: annual-meeting vote results filed (8-K Item 5.07, 2026-01-21) — **verify vote outcomes in DEF 14A/DEFA14A**; no contested items evidenced.
- Customer and employee treatment: the model *is* the treatment — low markup ceilings on merchandise and above-market wages (both well-established). This is §10 good-faith territory rather than a risk.
- Regulatory and legal record: no §7.3 hard-stop events in the baseline (no Item 4.01/4.02 8-Ks, no restatements, no going-concern language). `red_flag_override: false`.

## 6. Shareholder distribution

- Dividends: 28% of FCF (🟢) — regular dividend well covered; April 8-K (2026-04-15, Item 8.01) likely the customary annual dividend action — **verify**.
- Special dividends: a repeated, well-established pattern — $7/sh (2012), $5 (2015), $7 (2017), $10 (Dec 2020), $15 (declared Dec 2023, paid Jan 2024). With cash at $14.2B (+43%) and rising, the setup for another special is rebuilding; treat as pattern, not promise.
- Gross buybacks: modest, and per the 🟡 marker they **roughly offset employee grants** — the buyback is share-count maintenance, not a return of capital.
- Net share-count change: +0.0% — flat at 444.8M diluted. Per §5.6, a buyback that merely absorbs grants is not a shareholder return; the honest net shareholder yield here is essentially the dividend stream (regular + episodic specials).
- Stock compensation: $860M, 0.3% of revenue, +5.1% YoY — among the lowest SBC intensities in mega-cap land; the offset dynamic is benign in scale even if the marker flags the mechanics.
- Debt used for distributions: none — net cash, long-term debt declining. No §5.7 concerns.

## 7. Market behavior

- Relative performance: −0.1% (12-month) vs XLP +6.1% → −6.2pp. Within the §9.2 normal band (investigation threshold ~20pp). Reads as digestion of a well-established premium multiple while fundamentals improved — not punishment.
- Estimate revisions: **explicit gap — not pulled.** Needed before any divergence-pattern upgrade.
- Accumulation/distribution: **explicit gap** — §9 volume/ownership manual pass not done.
- Insider activity: routine Form 4/144 cadence in the baseline (144s clustered Mar–Jul 2026; a new Form 3 dated 2026-03-02). Nothing anomalous on its face — **verify 10b5-1 status and identify the Form 3 filer**.
- Ownership concentration: 13G/A history is classic passive mega-cap (latest amendments Feb 2024); current 13F trend **not pulled — gap**.
- Short interest: **explicit gap — not pulled.**

## 8. Process-versus-outcome classification

- Process quality: **stable** — the machine and management behavior are unchanged and disciplined; the fee increase is the established cadence (roughly every 5–7 years), not a process shift.
- Current outcome quality: **improving** — revenue +8.2%, operating income +11.8%, OCF +17.6%, FCF $7.8B, margin up, inventory down.
- Market response: **ignoring** — flat absolute return and −6.2pp vs sector over 12 months while every computed fundamental marker improved.
- Primary divergence: **none** (provisional) — the lag is inside the §9.2 normal band. If the estimates pull shows rising estimates against a flat price at a premium multiple, re-classify to `good-company-bad-investment`.

### Divergence sentence (§17 Step 7)

> The company's operating process is `stable`, reported results are `improving`, and the market is pricing `about the same` future success because `a premium starting valuation appears to already embed the membership-fee-driven earnings improvement — estimate-revision and ownership pulls are still outstanding`.

## 9. Good-faith evidence

- **Structural margin restraint:** operating margin of 3.8% on $275B of revenue is a choice — merchandise is priced near cost to protect the renewal covenant, foregoing gross profit the company could take today (evidenced by the margin structure; policy well-established).
- **Pricing-power restraint:** seven years between membership-fee increases (2017 → Sept 2024) despite obvious room — the increase, when it came, was modest and absorbed (deferred revenue +14.1%).
- **Above-market wages** (well-established) — a present cost that buys low turnover, service quality, and low shrink rather than flowing to quarterly margin.
- **Balance-sheet conservatism:** net cash, 67x interest coverage, debt shrinking — resilience prioritized over leverage-amplified EPS.

## 10. Extraction or bad-faith risk

- **Buyback optics (mild):** repurchases that only offset grants could be presented as shareholder returns; the vault's own marker keeps this honest — net benefit ~zero. Scale is small (SBC 0.3% of revenue).
- **Profit-pool concentration:** operating income leans heavily on membership fees (~half in FY2024); any drift toward extracting more from fees faster than the value covenant supports would monetize trust — watch fee-increase cadence and renewal rates together.
- **Receivables mix (unverified):** if the +9.5pp receivables divergence traces to loosened B2B/business-center terms rather than benign mix, that would be borrowing growth from the future — routed in §11.
- No documented bad-faith conduct (§11-class events) in any pull; nothing approaches §7.3.

## 11. EDGAR follow-up

Routing the two yellows via §15:

- Filing: **FY2025 10-K (filed 2025-10-08)** + Q3 FY2026 10-Q (filed 2026-06-03)
  - Section or exhibit: revenue-recognition/receivables note and MD&A working-capital discussion (§15 row: revenue quality concern)
  - Finding: receivables growth − revenue growth = +9.5pp (🟡)
  - Possible meaning: benign mix (pharmacy third-party payors, e-commerce/logistics, B2B business centers, vendor-rebate timing) vs stretched terms or weakening collections
  - Next investigation: decompose the receivables balance by type; check allowance trend; confirm the current-receivables XBRL tag gap; log an [[03_Templates/Intel_Finding]] if terms changed
- Filing: **DEF 14A (filed 2025-12-04)** + statement of equity in the 10-K (§15 row: dilution)
  - Section or exhibit: compensation tables, grant vesting schedules, equity plan share reserves
  - Finding: gross buybacks vs net share count = +0.0% (🟡) — buybacks offset grants
  - Possible meaning: benign at this SBC scale, but confirms buybacks are anti-dilution spend, not distribution
  - Next investigation: verify grant pace under the new CEO/CFO; confirm buyback authorization size and cadence (8-K/10-K)
- Secondary items: 8-K Item 5.02 (2025-10-20) — identify the officer/director change; 8-K Item 8.01 (2026-07-08, 2026-04-15, 2025-10-15) — classify (dividend actions / other events); S-3ASR (2026-06-03) — routine 3-year shelf renewal (matches 2020/2023 cadence), confirm no equity component; identify the 2026-03-02 Form 3 filer.

## 12. Score

| Block | Score | Max |
|---|---:|---:|
| Economic health | 34 | 40 |
| Stewardship and integrity | 34 | 40 |
| Market confirmation | 9 | 20 |
| **Total** | **77** | 100 |

Economic health (34/40): revenue/demand quality 7/8 (8.2% organic, recurring fee base, deferred revenue +14%; traffic/ticket unsplit) · unit economics 6/8 (thin by design and improving, but gross margin is a data gap and the profit pool is fee-concentrated) · cash conversion 7/8 (0.92 conversion, OCF aligned; one receivables 🟡) · balance sheet 8/8 (net cash, 67x coverage) · returns on capital 6/8 (not reconstructed — explicit gap; qualitative story strong).

Stewardship (34/40): accounting transparency 7/8 (stable, GAAP-first; minor tag gaps) · capital allocation 7/8 (disciplined dividend + specials + net cash; buyback merely offsets grants) · governance/comp 6/8 (orderly succession well-established; proxy unreviewed — verify) · customer/employee/supplier treatment 7/8 (model-embedded good faith; vault evidence qualitative) · strategic consistency 7/8 (decades-identical machine, fee cadence honored).

Market confirmation (9/20): relative price/estimates 3/5 (mild lag within band; no estimates pull) · accumulation/ownership 2/5 (not pulled) · valuation vs conservative economics 2/5 (not pulled; premium multiple well-established) · catalyst/expectation asymmetry 2/5 (fee flow-through widely anticipated; little unpriced asymmetry evidenced).

- Red-flag override: **false** — no §7.3 events in any pull (no auditor/restatement/going-concern/covenant items in the baseline).

## 13. Falsifiable thesis

- Bull case: the membership annuity keeps compounding — FY2025's fee increase rolls through FY2026 renewals, worldwide renewal stays ≥90%, membership-fee income (and deferred fees) keeps growing faster than revenue, and operating income keeps growing ~faster than sales while the net-cash balance sheet funds the dividend plus a periodic special.
- Bear case: post-fee-increase renewal slips and merchandise margins can't backfill the fee-concentrated profit pool; the receivables divergence turns out to be loosened B2B terms; a premium multiple compresses faster than ~10% earnings growth can offset, giving years of flat returns despite a healthy machine.
- What would prove each wrong: bull is broken if the FY2026 10-K shows worldwide renewal below ~89%, flat/declining deferred membership fees, or paid-member count stalling; bear is broken if renewal holds ≥90% post-increase and the receivables divergence converges below +5pp with a benign mix explanation in the revenue note.
- Next checkpoint and date: **FY2026 10-K (expected ~Oct 2026; checkpoint 2026-10-15)** — verify (1) receivables−revenue divergence back under +5pp with mix explanation, (2) worldwide renewal ≥90%, (3) FY2026 membership-fee income and its share of operating income.

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
