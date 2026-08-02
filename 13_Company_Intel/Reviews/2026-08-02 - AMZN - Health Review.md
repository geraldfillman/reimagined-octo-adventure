---
node_type: "health_review"
date: "2026-08-02"
company: "Amazon"
ticker: "AMZN"
period: "FY ending 2025-12-31"
process_quality: "improving"
outcome_quality: "improving"
market_response: "rewarding"
divergence_pattern: "none"
economic_health_score: 29
stewardship_score: 28
market_confirmation_score: 11
total_score: 68
red_flag_override: false
red_flags: []
next_checkpoint: "Q3 2026 10-Q: TTM capex/OCF falls below FY2025's 0.94 with TTM FCF inflecting upward, and receivables growth back within 5pp of revenue growth"
next_checkpoint_date: "2026-11-06"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_AMZN]]"
related_theses: []
tags: [health-review]
---

# Company Health & Integrity Review — Amazon

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/AMZN - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker AMZN` — link the pull note into `markers_pull`.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

Amazon buys or builds inventory, logistics capacity, and data-center infrastructure; organizes them into a retail/marketplace network and a rentable computing utility; sells goods, seller services, advertising, and cloud capacity to consumers, merchants, and enterprises; and keeps the difference after fulfillment, content, technology-and-infrastructure, and now very large depreciation costs.

Matches the dossier `one_liner` ("Sells and delivers products, connects outside sellers with buyers, and rents computing infrastructure") — still accurate, no dossier update needed. The weighting is shifting, though: FY2025 capex of $131.8B against $139.5B operating cash flow says the marginal dollar of the machine is going almost entirely into the third clause (renting computing infrastructure). Log in the dossier evolution timeline at the next dossier pass.

## 2. What changed in the company machine?

Grounded in [[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Facts_AMZN]] (FY2025 vs FY2024 XBRL) and [[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Baseline_AMZN]]:

- Positive:
  - Revenue $716.9B, +12.4% at enormous scale; operating income $80.0B (+16.6%), operating margin up 10.8% → 11.2% — the machine scaled *and* got slightly more profitable per dollar.
  - Operating cash flow $139.5B (+20.4%), tracking ahead of net income ($77.7B, +31.1%) — OCF/NI 179.6%.
  - Deferred revenue (current) $20.6B (+13.7%) — customers pre-paying faster than revenue grows, consistent with contracted cloud demand.
  - SBC fell 11.6% to $19.5B while revenue grew 12.4% — compensation cost is not being shifted onto shareholders.
- Negative:
  - Capex +58.8% to $131.8B, crushing FCF from $32.9B to $7.7B in one year — the machine now consumes nearly all the cash it produces.
  - Long-term debt +24.8% to $65.6B, and the baseline shows repeated 2026 note offerings (424B5/FWP clusters in Mar, Jun, Jul 2026; 8-K 2026-06-10 Items 1.01/2.03 — new direct financial obligation). The buildout is now partly externally financed.
  - Receivables $67.7B (+22.1%), ~9.8pp faster than revenue.
- Ambiguous:
  - The machine is adding a capital-intensity layer: a negative-working-capital retail engine funding an asset-heavy computing utility. Whether that is compounding or complexity-creep (§2 evolution table: "manufacturing moves in-house" row) depends entirely on the return on the new capacity.
  - Gross margin is an explicit gap — the XBRL gross-profit tag is stale (last populated FY2009; Amazon does not tag GrossProfit). Do not infer margin mix from XBRL; use the 10-K income statement directly.

## 3. Financial health

Marker table: [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_AMZN]] — rollup 6 🟢 · 1 🟡 · 1 🔴 · 3 ⚪ (profile: general). Every marker interpreted below.

- Organic revenue: +12.4% FY2025 ($638.0B → $716.9B) — no band flag. Acquisition contribution not decomposed in the pull; at this scale growth is overwhelmingly organic. Units-vs-price split not evidenced (gap — see §4).
- Gross and operating margin: gross margin ⚪ unreadable from XBRL (stale tag — explicit gap). Operating margin 11.2% vs 10.8%, improving *while* the investment cycle runs — constructive under §5.2 (margin improving with scale, not via cuts).
- **FCF conversion 0.21 over ≤5 FY — 🔴 concern (§5.3 band: below 50%).** This is the review's central question, and it is the framework's own §10.3 Amazon case study repeating at 100x the scale: losses/low FCF are constructive **only when they purchase identifiable capabilities** (§19.2). Classify the capex consuming FCF per §5.2:
  - *Maintenance:* fulfillment-network upkeep and replacement — a minority share; Amazon does not disclose the maintenance/growth split (gap — MD&A gives only directional language; ⚠ verify in FY2025 10-K MD&A).
  - *Growth investment:* the bulk — AWS/AI data centers, servers, and power, which management attributes to cloud and AI demand (⚠ verify wording in MD&A). The capabilities are identifiable: rentable compute capacity backed by contracted demand (deferred revenue +13.7%; AWS RPO in the revenue footnote — needs pulling, §4).
  - *Repair / Waste:* nothing documented — but this is exactly what the 🔴 flag cannot distinguish yet. If AI demand disappoints, a slice of "growth" reclassifies retroactively as waste, and the depreciation stack still arrives.
  - **Benign reading:** OCF/NI is 179.6% — earnings convert to operating cash at nearly 2:1, so this is emphatically *not* an earnings-quality problem; the entire shortfall is disclosed, on-balance-sheet, growth-classified capex. The §5.3 band itself carves out "a clear growth-capex explanation."
  - **Negative reading:** capex/OCF hit 0.94 in FY2025 (vs 0.72 FY2024); the ratio says Amazon currently retains almost no owner cash, the buildout has started drawing on debt markets (§2), and the future income statement inherits the depreciation whether or not the revenue arrives.
- Operating cash flow trend: 🟢 aligned — OCF (+20.4%) tracks earnings direction. Benign as-is; would flip to concern only if NI kept rising while OCF stalled (§5.3 row 2 — not the case).
- Working capital:
  - Receivables +9.8pp faster than revenue — 🟡 investigate (band 5–10pp). Benign reading: mix shift toward invoiced businesses — AWS enterprise contracts, advertising, and seller services carry payment terms the cash-at-checkout retail business never had, so receivables *should* structurally outgrow blended revenue. Negative reading: loosened payment terms purchasing growth, or seller/advertiser credit quality slipping — check allowance movement and contract-asset language. Routed in §11.
  - Inventory +2.8pp vs cost of sales — 🟢 within band; inventory ($38.3B, +12.0%) tracking COGS, no build/obsolescence signal.
- Debt and liquidity: net debt/EBITDA 🟢 **net cash** ($86.8B cash & equivalents vs $65.6B LT debt, plus short-term investments). Benign as stated, but direction matters: LT debt +24.8% plus the 2026 offerings means the cushion is being spent — re-check the band next pull. EBIT/interest ⚪ n/a: interest expense last tagged FY2023 — likely presentation/tag change rather than retired debt given rising borrowings; ⚠ verify interest line in the FY2025 debt note before treating coverage as a non-issue.
- Dilution and SBC (full detail §6): diluted shares +1.0% 🟢; SBC/revenue 2.7% 🟢; buybacks ⚪ (none in FY2025); dividend ⚪ (never paid) — all interpreted in §6.
- ROIC and incremental returns: not computed in the pull (gap). The qualitative version: FY2025's $131.8B must eventually earn a spread; incremental ROIC on the AI buildout is the single number that decides whether the 🔴 flag was growth or waste. Reconstruct per §5.4 once two more fiscal years of AWS segment results exist.

## 4. Operational health

§14 emphasis: consumer/retail (traffic vs ticket, units vs price, inventory turns) plus cloud (RPO, capacity, commitments). Evidence status per line — no fabricated metrics:

- Customers and retention: Prime membership, churn, and retention are not disclosed in XBRL or the pulls — **gap, needs 10-K MD&A / disclosure review**. Deferred revenue +13.7% is the only vault-evidenced proxy for prepaid customer commitment (Prime subscriptions + AWS contracts, unseparated).
- Units vs price (§5.1 / §14 consumer): not decomposed anywhere in the vault pulls — **gap**. Amazon historically disclosed paid-unit growth; ⚠ verify whether FY2025 10-K still discloses it. Flag if growth turns price-led while units stall.
- Product and innovation: R&D is an explicit gap in the facts note (Amazon tags "technology and infrastructure," not the standard R&D concept) — pull from the income statement directly before judging §6.3. No evidence of roadmap slippage in the filing inventory.
- Employees and safety: warehouse injury rates and labor-practice scrutiny are a well-established, multi-year §6.2 issue (OSHA citations, unionization at Staten Island 2022). Current-period status not evidenced in the vault — ⚠ verify latest 10-K human-capital disclosure and any open regulator matters.
- Suppliers and capacity: marketplace sellers are simultaneously suppliers and customers; their fee burden is the subject of the pending FTC antitrust case (§10). Cloud capacity: $131.8B capex evidences aggressive capacity addition; utilization, power constraints, and chip purchase commitments are **not evidenced — pull the commitments footnote** (routed §11).
- Sector-specific KPIs still needing a pull: AWS revenue/margin split (segment footnote), AWS RPO/backlog (revenue footnote), advertising revenue line, same-store-equivalent retail metrics, inventory turns by segment.

## 5. Stewardship and integrity

Well-established facts only; everything uncertain is marked verify.

- Accounting quality: GAAP-first culture — no adjusted-EBITDA storytelling in earnings materials; capex is expensed/capitalized conventionally and disclosed plainly. The stale gross-profit XBRL tag is a tagging artifact, not a policy choice. No §8 warning patterns evidenced.
- Disclosure quality: segment reporting (North America / International / AWS) is stable; the company has, over the years, retired some operating metrics (e.g., paid units — ⚠ verify current status), which §7.2 treats as a mild watch item ("changes definitions when a KPI deteriorates" — no evidence that motive applies here).
- Capital allocation: reinvestment-first doctrine, consistent since the 1997 shareholder letter — the framework's own §10.3 case study. No dividend ever; buybacks dormant (last tagged FY2024 series, none in FY2025). Discipline at $131.8B/yr scale is asserted, not yet proven — the proof is incremental ROIC (§3).
- Executive compensation: overwhelmingly SBC-based with multi-year vesting; no repricing events evidenced. Details — peer group, PSU conditions, Jassy/Bezos grants — **verify in DEF 14A filed 2026-04-09** (linked in baseline note).
- Board oversight: separate CEO (Jassy) and chair, but the chair is founder Bezos — not independent; lead-independent-director arrangements **verify in DEF 14A**. Single share class (no dual-class control wedge). Annual-meeting vote results in 8-K 2026-05-22 (Item 5.07) — ⚠ review for shareholder-proposal support levels.
- Customer and employee treatment: the weakest stewardship block. FTC Prime enrollment/cancellation ("dark patterns") action was settled in late 2025 — a regulator-documented instance of §6.1's "cancellation becomes deliberately difficult" (⚠ verify settlement terms/amount in the 8-K/10-K legal-proceedings note before citing figures). Warehouse safety record per §4.
- Regulatory and legal record: FTC + state AGs monopoly-maintenance suit (filed 2023) over marketplace seller fees and anti-discounting remains pending; EU DMA gatekeeper obligations apply. These are antitrust/consumer-protection matters, not §7.3 fraud/restatement/going-concern events — they weigh on scoring but do not trigger the override.

## 6. Shareholder distribution

Everything netted against dilution per §5.6–5.7:

- Dividends: none — never paid (`dividendsPaid` series empty across all years). ⚪ by design: full-retention reinvestment model, internally consistent with §5.7 ("high incremental returns should reinvest") *if* the returns materialize.
- Gross buybacks: none in FY2025 (⚪); buyback series last shows activity through FY2024 tag dates. Not repurchasing while capex is 0.94x OCF is coherent capital-allocation sequencing, not neglect.
- Net share-count change: diluted shares +1.0% YoY (10.7B → 10.8B) — 🟢 below the 1% low-concern threshold. Dilution is real but slow; there is no buyback laundering SBC (§5.6's "buyback that merely purchases employee shares" trap does not apply — there is no buyback).
- Stock compensation: $19.5B, 2.7% of revenue — 🟢 well under the 5% band, and *falling* (−11.6% YoY against +12.4% revenue). For scale: SBC is ~2.5x the entire FY2025 FCF, which says less about SBC than about how small FCF currently is.
- Debt used for distributions: none — debt raises (§2) fund capex, not payouts. The §5.7 "distributions funded by debt/underinvestment" failure mode is absent; the entire distribution question for AMZN is deferred until FCF re-inflects.

## 7. Market behavior

§9: stock behavior is evidence about expectations, not proof of business quality.

- Relative performance: +26.5% over 12 months vs XLY +7.4% — **+19.0pp outperformance** (🟢, inside the §9.2 investigation bands; nothing to explain on the downside). The market is paying for the capex bet before the FCF line validates it.
- Estimate revisions: **gap — not pulled.** Whether consensus FCF/EPS estimates rose with the price is the key §9.1 confirmation test; pull analyst revisions before the next review.
- Accumulation/distribution: **gap — volume study not done** (§9.3 manual pass outstanding).
- Insider activity: baseline shows a cluster of Forms 4/144 in May 2026 (post-annual-meeting window) — consistent with routine vesting-and-sale patterns, but **classification unverified** — read the Forms 4 for 10b5-1 footnotes before treating as neutral.
- Ownership concentration: **gap — 13F/13G trend not compiled.** (Note: 13F-HRs under Amazon's own CIK in the baseline are filings *by* Amazon as an institutional manager, not ownership of AMZN — do not misread.)
- Short interest: **gap — not pulled.** Expected to be low for a mega-cap, but per vault policy: explicit gap, no assumed value.

## 8. Process-versus-outcome classification

- Process quality: **improving** — margin structure, operating cash generation, and disciplined SBC all moved the right way while the company executed the largest capex program in its history.
- Current outcome quality: **improving** — revenue +12.4%, operating income +16.6%, net income +31.1%; the one deteriorating outcome line (FCF $32.9B → $7.7B) is the deliberate product of the process, not a failure of it — which is exactly why it must be checkpointed (§13) rather than excused.
- Market response: **rewarding** (+19.0pp vs XLY).
- Primary divergence: none of the four §13 patterns cleanly applies (process ↑, results ↑, market rewarding). The live risk is drift into **Pattern C — good company, bad investment**: the market may already be pricing flawless conversion of $131.8B into AI revenue. Watch estimate revisions (§7 gap) for the first sign.

### Divergence sentence (§17 Step 7)

> The company's operating process is `improving`, reported results are `improving`, and the market is pricing `more` future success because `it treats the FY2025 capex surge (capex/OCF 0.94, FCF conversion 0.21 over 5 FY) as pre-paid AWS/AI revenue rather than consumed cash — a bet the FCF line has not yet validated`.

## 9. Good-faith evidence

- Accepted a 77% FCF collapse ($32.9B → $7.7B) in the open, fully on-balance-sheet, to build identifiable compute capacity — the same pattern as the framework's §10.3 case study of this company; disclosure is plain and the cost is being borne now rather than hidden.
- Cut SBC 11.6% in absolute terms during a growth year while holding dilution to +1.0% — compensation restraint at exactly the moment lavish grants would have been easy to justify.
- Customer pre-commitment is rising (deferred revenue +13.7%) — evidence the buildout follows demand rather than hope, as far as vault data can show.
- No dividend/buyback theater to flatter the FCF optics — capital-allocation sequencing (build first, distribute later) has stayed consistent with two decades of stated doctrine.

## 10. Extraction or bad-faith risk

- FTC Prime dark-patterns matter (settled 2025 — ⚠ verify terms): regulator-documented §6.1 behavior (enrollment friction/cancellation difficulty) — resolved, but it is direct evidence the consumer franchise has been monetized through friction at least once.
- Pending FTC/state monopoly-maintenance suit: alleges marketplace seller-fee extraction and anti-discounting pressure — if the take-rate on third-party sellers is doing quiet price-raising work, that is §12's "raising prices far above cost" channel; return mechanism = litigation/regulation.
- Warehouse injury and labor-churn record (§6.2): a long-running externalized cost; return channels are regulation, unionization, and wage inflation.
- Receivables +9.8pp over revenue: *if* the revenue note shows loosened seller/advertiser terms rather than mix shift, part of reported growth is borrowed from future collections — this is the one marker that could recolor the good-faith story, hence its routing below.

## 11. EDGAR follow-up

Routed per §15; log outcomes as [[03_Templates/Intel_Finding]] notes.

1. **FCF conversion 0.21 🔴** (§8 divergence row: "EBITDA rises, FCF falls")
   - Filing: FY2025 10-K (filed 2026-02-06) + Q2 2026 10-Q (filed 2026-07-31) — links in baseline note.
   - Section or exhibit: cash-flow statement, **capex commitments / purchase-obligations footnote**, MD&A capex discussion.
   - Finding sought: maintenance-vs-growth capex language; committed data-center/chip spend beyond FY2026.
   - Possible meaning: growth investment (benign) vs structural capital-intensity reset (thesis-changing).
   - Next investigation: recompute capex/OCF from the Q2 2026 10-Q TTM figures.
2. **Receivables +9.8pp 🟡** (§15 row: "Revenue quality concern")
   - Filing: FY2025 10-K + Q2 2026 10-Q.
   - Section or exhibit: **revenue-recognition note and MD&A**; receivables/allowance detail, contract assets, customer concentration.
   - Finding sought: is the growth mix (AWS/ads/seller services invoicing) or terms loosening? Allowance trend vs receivables trend.
   - Possible meaning: benign structural mix shift vs growth purchased with credit.
   - Next investigation: receivable divergence recheck at next `edgar health` pull.
3. **New debt financing** (§15 row: "New capital raise")
   - Filing: 424B5s of 2026-03-11/12/13, 2026-06-08/10, 2026-07-07/08 + 8-K 2026-06-10 (Items 1.01/2.03).
   - Section: use of proceeds, maturity ladder, covenant terms; reconcile with the stale interest-expense tag (⚪ marker).
4. **DEF 14A pass** (supports §5): compensation structure, lead-independent-director arrangements, vote outcomes (8-K 2026-05-22, Item 5.07).

## 12. Score

§16 rubrics; one-line justification per category. No red-flag cap applies.

| Block | Score | Max |
|---|---:|---:|
| Economic health | 29 | 40 |
| Stewardship and integrity | 28 | 40 |
| Market confirmation | 11 | 20 |
| **Total** | **68** | 100 |

- Economic health 29/40: revenue and demand quality 7/8 (+12.4% organic at scale, no concentration flag); unit economics and margins 6/8 (op margin rising to 11.2%; gross margin an explicit XBRL gap); cash conversion and earnings quality 4/8 (OCF/NI 179.6% is excellent, but the 🔴 0.21 five-year FCF conversion and 🟡 receivables cost the block); balance-sheet resilience 7/8 (net cash, docked for rising debt + 2026 offerings); returns on capital 5/8 (incremental ROIC on $131.8B unproven and uncomputed).
- Stewardship and integrity 28/40: accounting transparency 6/8 (GAAP-first, stable policies; some retired KPIs); capital allocation 6/8 (coherent reinvest-first sequencing; discipline unproven at this scale); governance and compensation 5/8 (founder exec-chair, comp detail unverified pending DEF 14A pass); customer/employee/safety/supplier treatment 4/8 (settled dark-patterns matter, pending antitrust suit, warehouse record); strategic consistency and accountability 7/8 (two decades of doing exactly what it says).
- Market confirmation 11/20: relative price behavior 4/5 (+19.0pp vs XLY); accumulation/ownership 2/5 (unpulled — scored on absence of evidence); valuation vs conservative economics 2/5 (unpulled; FCF-based valuation currently unsupportive by construction); catalyst asymmetry 3/5 (clear, dated FCF-inflection checkpoint exists, but expectations look pre-paid).
- Total 68/100 → §16 band **55–69 mixed**: thesis depends on a specific, observable repair (FCF re-inflection) plus filling the §7 market-evidence gaps; the score is depressed as much by unpulled evidence as by weakness.
- Red-flag override: **false** — no §7.3 hard-stop event open (no fraud allegation of the restatement/auditor/going-concern class, no covenant breach, no late filings). The FTC matters are §11–12 conduct-risk inputs, scored above, not scoring suspensions.

## 13. Falsifiable thesis

- Bull case: FY2025's $131.8B capex converts into accelerating AWS/AI revenue with operating margin holding ≥11%; capex/OCF rolls over during FY2026 and FCF re-inflects toward the FY2024 run-rate ($30B+) by FY2027 while the balance sheet stays net cash — the §10.3 playbook completing again.
- Bear case: AI capacity outruns monetizable demand; the depreciation stack from FY2025–26 spend compresses operating margin from FY2027; capex stays ≥ OCF and keeps drawing on debt markets, revealing 0.21 FCF conversion as a structural capital-intensity reset rather than a growth phase.
- What would prove each wrong: bull is wrong if TTM capex/OCF is still ≥1.0 at FY2026 year-end while AWS growth decelerates (pull segment data) and receivables keep outrunning revenue; bear is wrong if TTM FCF exceeds ~$40B with operating margin ≥11% and no further debt issuance by the FY2026 10-K.
- Next checkpoint and date: **Q3 2026 10-Q (expected ~2026-10-30; checkpoint 2026-11-06)** — TTM capex/OCF must print below FY2025's 0.94 and TTM FCF must be inflecting upward; receivables growth back within 5pp of revenue growth. Copied to `next_checkpoint` / `next_checkpoint_date`.

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
