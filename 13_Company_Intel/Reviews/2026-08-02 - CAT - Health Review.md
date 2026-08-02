---
node_type: "health_review"
date: "2026-08-02"
company: "Caterpillar"
ticker: "CAT"
period: "FY ending 2025-12-31"
process_quality: "stable"
outcome_quality: "deteriorating"
market_response: "rewarding"
divergence_pattern: "good-company-bad-investment"
economic_health_score: 26
stewardship_score: 26
market_confirmation_score: 10
total_score: 62
red_flag_override: false
red_flags: []
next_checkpoint: "Q2 2026 10-Q: split ME&T trade receivables vs Financial Products finance receivables (divergence must be captive-driven), reconcile the OCF working-capital drag, and confirm operating margin stabilization"
next_checkpoint_date: "2026-08-15"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_CAT]]"
price_at_review: 814.81
reconsider_price_low: 651.85
reconsider_price_high: 1018.51
related_theses: []
tags: [health-review]
---

# Company Health & Integrity Review — Caterpillar

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/CAT - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker CAT` — link the pull note into `markers_pull`.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

Caterpillar builds and sells heavy machines and engines for construction, mining, energy, and transportation; sells parts and service into the installed base it has already created; and finances the purchase of its own machines through a captive lending arm (Cat Financial).

Check vs. dossier `one_liner` ("Builds and sells heavy machines... and sells parts and service for the machines it has already sold"): the machine itself has not changed, but the dossier sentence omits the **captive finance arm** — and this review's central marker (the 🔴 receivable divergence) runs straight through it. Recommend extending the dossier `one_liner` with the financing clause and logging the refinement in the dossier's evolution timeline (a description improvement, not a machine change).

## 2. What changed in the company machine?

Grounded in [[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Facts_CAT]] (FY2025 vs FY2024) and [[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Baseline_CAT]]:

- Positive:
    - Revenue $67.6B, +4.3% ($64.8B prior) — the machine is still growing.
    - Deferred revenue (current) $3.3B, **+42.7%** (+$1.0B) — customers are paying further ahead of delivery; a demand/backlog-adjacent signal for an industrial.
    - Cash $10.0B, +44.9% — liquidity built during the year.
    - Capex $2.8B, +41.9%, and R&D held at $2.1B (+1.9%) — reinvestment sustained through a margin-compression year.
    - Diluted shares 472.3M, −3.5% — buybacks more than absorbing issuance.
- Negative:
    - Operating income $11.2B, **−14.7%** ($13.1B prior); operating margin 16.5% vs 20.2% (−370bp).
    - Operating cash flow $11.7B, −2.5%; FCF $8.9B vs $10.0B (−11%).
    - Receivables (current) $10.9B, +17.6% vs revenue +4.3% — the 🔴 marker (see §3).
    - Long-term debt $30.7B, +12.2% (+$3.3B).
- Ambiguous:
    - The +41.9% capex ramp: §5.2 classification (growth investment vs. repair vs. waste) needs the MD&A capacity narrative from the FY2025 10-K (filed 2026-02-13).
    - Receivable growth may be Cat Financial portfolio growth (an earning asset, its business model) rather than collection stress — the decisive split is not in the XBRL pull.
    - Net income Δ is an **explicit gap**: the facts skeleton's net-income row is a stale XBRL tag (shows 2010/2009 values). The health pull's netIncome series is current (6 FY through 2025-12-31) and drives the ratios, but no FY2025 net-income figure is quoted here — pull from the 10-K income statement.

## 3. Financial health

Marker table: [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_CAT]] — rollup 🟢 7 · 🟡 1 · 🔴 1 · ⚪ 2. Every marker interpreted below (§5 bands are prompts, not verdicts).

- Organic revenue: +4.3% FY2025. Price/volume/mix/dealer-inventory split is **not in the XBRL pull** — needs FY2025 MD&A. For a cyclical industrial, revenue growth with a 42.7% deferred-revenue build reads constructively, but organic vs. price-driven is unverified.
- Gross and operating margin: gross margin **⚪ untagged** in XBRL (explicit gap — pull from income statement). Operating margin 16.5% vs 20.2%: a −370bp compression while revenue grew is an §5.2 "investigate" — what was bought with the lost margin? Capex +41.9% and flat R&D suggest part of it is growth investment, but cost inflation vs. mix vs. one-offs needs the MD&A bridge.
- FCF conversion:
    - 🟢 Cumulative 5-FY FCF/NI = **0.99** — over the cycle, earnings are fully cash-backed. Strong earnings-quality base rate.
    - 🟡 Latest FY divergent: earnings rose while OCF fell (−2.5%). Benign read: working-capital build — receivables +$1.6B and inventory +$1.3B, partly offset by deferred revenue +$1.0B — ahead of demand the deferred-revenue surge implies. Negative read: collections weakening. Route to the cash-flow statement's working-capital detail (§11).
- 🔴 Receivables growth − revenue growth = **+13.4pp** (17.6% vs 4.3%). **Key nuance: Cat Financial.** The consolidated receivables line mixes ME&T trade receivables with the captive finance arm's finance receivables — for Cat Financial, receivables *are* the earning portfolio, so portfolio growth inflates this marker without implying collection stress. This flag cannot be read as revenue-quality deterioration until the FY2025 10-K segment disclosures split Machinery, Energy & Transportation trade receivables from Financial Products finance receivables:
    - **Benign:** divergence driven by captive portfolio growth with stable past-dues/write-offs and a steady allowance → reclassify to watch, monitor Financial Products credit metrics.
    - **Negative:** ME&T *trade* receivables alone outpacing revenue by >10pp, allowance shrinking while collections slow, or looser dealer terms pulling sales forward → genuine §5.3 concern.
- 🟢 Inventory growth − COGS growth = −3.6pp — inventory disciplined; supports the benign demand read.
- ROIC and incremental returns: **not computed in any pull — explicit gap.** With capex +41.9%, incremental-return evidence matters; reconstruct per §5.4 (captive finance assets/debt must be segregated or ROIC is meaningless).
- Debt and liquidity: 🟢 Net debt/EBITDA 1.54x on consolidated figures; cash $10.0B. But LT debt $30.7B (+12.2%) is largely captive-funding in nature at Cat Financial (borrows to fund the receivable book) — consolidated leverage understates ME&T's cleanliness and hides the finance arm's spread risk. ⚪ EBIT/interest is a **tagging gap, not absence of leverage**: the pull note's "likely unlevered" caveat is wrong for CAT with $30.7B of LT debt on the books — interest expense sits under non-standard tags; verify coverage in the debt footnote.
- Working capital: net build of roughly $1.9B (receivables +$1.6B, inventory +$1.3B, less deferred revenue +$1.0B) absorbed the OCF gap — consistent with the 🟡 marker; confirm line-by-line in the cash-flow statement.
- Dilution/SBC markers: 🟢 diluted shares −3.5%; 🟢 buybacks exceed issuance; ⚪ SBC/revenue untagged — pull from the cash-flow statement (gap, not zero).
- 🟢 Dividend/FCF 31% — comfortable (§5.7 constructive band 30–60%).

## 4. Operational health

Per §14 industrials emphasis. Evidenced vs. needs-pulling kept explicit — no fabricated metrics.

- Customers and retention: installed-base/aftermarket model (dossier §1) means parts-and-service attach is the retention engine. **Aftermarket/services mix for FY2025: not in vault — pull** (CAT customarily discloses services revenue ambitions in MD&A/earnings materials).
- Product and innovation: R&D held ~flat at $2.1B (+1.9%) through the margin-down year — maintenance of capability rather than harvest. Product-line specifics: not pulled.
- Employees and safety: no evidence in vault — needs 10-K human-capital section; no safety events surfaced in the 8-K timeline reviewed.
- Suppliers and capacity: capex +41.9% to $2.8B implies capacity expansion; utilization and supplier-health commentary need MD&A.
- Sector-specific KPIs (§14 industrials):
    - **Backlog quality / organic orders:** deferred revenue +42.7% is the only backlog-adjacent signal in the pulls. Backlog dollar value, order rates, and cancellation rates — **pull from FY2025 10-K MD&A**.
    - **Book-to-bill:** not derivable from vault data — explicit gap.
    - **Dealer inventory:** critical for CAT (independent dealer network can absorb or amplify demand swings; retail sell-through vs. dealer restocking distinguishes real demand from channel fill). **Not in vault — pull from MD&A/earnings 8-K exhibits.**
    - **Warranty reserves:** trend not pulled — 10-K warranty footnote (§8: gross margin held via warranty deferral is a classic industrial tell).
    - **Working capital:** covered in §3 — build present but inventory disciplined vs. COGS.
    - **Pension and environmental obligations:** long-dated CAT liabilities — status not pulled; 10-K footnotes.

## 5. Stewardship and integrity

Well-established facts only; everything else routed to filings.

- Accounting quality: 5-FY FCF conversion of 0.99 is the strongest single integrity marker in the vault — reported earnings have been real cash over the cycle. XBRL gaps (gross margin, SBC, interest expense untagged; stale net-income tag) look like custom-tag artifacts typical of a large legacy filer, not concealment — but confirm against the actual statements.
- Disclosure quality: segment structure (Construction Industries, Resource Industries, Energy & Transportation, plus Financial Products) is long-standing and consistent — no evidence of segment redefinition to obscure deterioration. Non-GAAP exclusion history: not reviewed — build the five-year reconciliation.
- Capital allocation: balanced in FY2025 — capex +41.9%, R&D flat, dividends ≈31% of FCF, net share count −3.5%, while cash still grew to $10.0B. No single lever is being overworked.
- Executive compensation: not reviewed — **verify in DEF 14A (filed 2026-04-30)**: metrics, vesting, downside. Note the CEO transition — Joseph Creed succeeded Jim Umpleby (May 2025; Umpleby to executive chairman) — check transition grants and any retention awards (§7.2); **verify details in the DEF 14A**.
- Board oversight: composition, independence, lead-director structure — **verify in DEF 14A**. The 2026-04-10 8-K (Item 5.02, officer/director matter) is unopened — see §11.
- Customer and employee treatment: no evidence in vault either way — dealer-network and workforce treatment need the qualitative pass.
- Regulatory and legal record: no §7.3 hard-stop events documented in the pulls or 8-K timeline (2026-02-13 onward). Legal-proceedings footnote not reviewed — pull with the 10-K pass. Dividend record: paid continuously for decades and raised for roughly three consecutive decades — a durable stewardship signal; **verify the exact streak in the FY2025 10-K/DEF 14A**.

## 6. Shareholder distribution

- Dividends: 🟢 31% of FCF (≈$2.8B implied on $8.9B FCF) — §5.7 constructive band; six years of dividendsPaid data present in the health pull's coverage table.
- Gross buybacks: dollar amount not quoted in the pulls — pull from cash-flow statement. Direction is evidenced: buybacks exceeded issuance.
- Net share-count change: 🟢 −3.5% YoY (472.3M vs 489.4M diluted) — genuine shrinkage, not headline buybacks masking grants.
- Stock compensation: ⚪ untagged in XBRL — explicit gap; without it, the net cost of the buyback program can't be fully judged. Cash-flow statement.
- Debt used for distributions: LT debt +$3.3B (+12.2%) in the same year as dividends plus buybacks — but for CAT most debt growth is normally Cat Financial funding its receivable book, not the parent funding distributions. **Verify in the cash-flow statement and debt note** that ME&T FCF covered total distributions without parent-level borrowing.

## 7. Market behavior

- Relative performance: 🟢 per §9.2 prompt — 12-month return **+90.1% vs XLI +20.1% (+70.0pp)**. No underperformance flag, but the *size* of the outperformance against a −14.7% operating-income year is itself the finding: the market is paying well ahead of reported results.
- Estimate revisions: **explicit gap** — no estimate data in vault. Needed to distinguish fundamentals-led repricing from multiple expansion (§9.2 estimate-price divergence row).
- Accumulation/distribution: **explicit gap** — §9.3 volume/ownership pass not done.
- Insider activity: Forms 4 on file (clusters 2026-06-10/11, 2026-06-26/29, 2026-07-24) — buy/sell direction unopened; the June cluster is consistent with annual-meeting grant timing but **verify by opening the forms**.
- Ownership concentration: only passive-style 13G/A history in the baseline (none more recent than 2024-11); 13F trend not pulled — gap.
- Short interest: **explicit gap** — not pulled.

## 8. Process-versus-outcome classification

- Process quality: **stable** — the machine is intact and being reinvested in (capex +41.9%, R&D flat, inventory disciplined, deferred revenue +42.7%); nothing evidences process improvement or decay yet.
- Current outcome quality: **deteriorating** — operating income −14.7%, margin −370bp, FCF −11% in the latest FY despite revenue growth.
- Market response: **rewarding** — +70pp over XLI in 12 months.
- Primary divergence: reported results softening while price accelerates → the risk to investigate is §13 Pattern C (good company, bad investment): the FY2025 filings do not yet contain the improvement the price implies.

### Divergence sentence (§17 Step 7)

> The company's operating process is `stable`, reported results are `deteriorating`, and the market is pricing `more` future success because `a +70pp 12-month outperformance vs XLI coincided with a −14.7% operating-income year, implying investors are paying ahead for a demand/margin inflection (consistent with the 42.7% deferred-revenue build) that the FY2025 statements do not yet show`.

## 9. Good-faith evidence

- Reinvested through the downcycle: capex +41.9% to $2.8B and R&D held at $2.1B in a year when operating income fell 14.7% — present cost accepted to protect future capability, rather than harvesting to defend the margin print.
- Conservative payout: dividends at 31% of FCF with a multi-decade payment record — distribution sized to leave reinvestment room.
- Honest dilution math: net share count actually fell 3.5% — buybacks genuinely exceed issuance rather than laundering grants.
- Cash cushion built, not spent: cash +44.9% to $10.0B during the compression year.

## 10. Extraction or bad-faith risk

- Receivables +17.6% vs revenue +4.3%: if the FY2025 segment split shows *trade* receivables driving it, revenue may be being pulled forward through looser dealer/customer terms — the classic industrial channel-stuffing signature. Unresolved until the split is pulled (§11).
- Captive finance opacity: consolidation lets Cat Financial's credit quality (past-dues, write-offs, allowance adequacy) blur into a single balance sheet; a captive can quietly absorb end-demand weakness by financing it. Needs the Financial Products segment credit disclosures.
- Debt +12.2% concurrent with buybacks and dividends: benign if captive-funding, extractive if parent borrowing funds distributions — currently unverified.
- Measurement gaps as risk: SBC and interest expense untagged in XBRL means dilution cost and interest burden are unverified this pass — treat as open items, not as zeros.

## 11. EDGAR follow-up

Routed per §15; log meaningful changes as Intel Findings.

- Filing: **FY2025 10-K** (filed 2026-02-13) — [[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Baseline_CAT|baseline]]
    - Section or exhibit: segment footnote (Machinery, Energy & Transportation vs Financial Products) + receivables note + allowance roll-forward + customer/dealer concentration.
    - Finding: 🔴 receivables growth − revenue growth = +13.4pp.
    - Possible meaning: benign captive-portfolio growth vs. trade-receivable collection stress / pulled-forward revenue.
    - Next investigation: compute the divergence on ME&T trade receivables alone; check allowance direction vs. collection speed; then Financial Products past-dues and write-offs.
- Filing: **Q2 2026 10-Q** (expected ~early Aug 2026; prior-year Q2 filed 2025-08-06) and FY2025 10-K cash-flow statement.
    - Section or exhibit: cash-flow statement, working-capital detail.
    - Finding: 🟡 earnings rose while OCF fell (−2.5%); implied WC build ≈$1.9B net.
    - Possible meaning: temporary build ahead of demand (deferred revenue +42.7% supports) vs. structural collection/inventory deterioration.
    - Next investigation: line-by-line WC bridge; confirm the build reverses within two quarters. Also pull from the same statements: SBC (⚪), interest expense/coverage via debt note (⚪), gross margin, FY2025 net income (stale-tag gap).
- Filing: **DEF 14A (2026-04-30)** + **8-K 2026-04-10 (Item 5.02)** + June/July Forms 4.
    - Section or exhibit: compensation tables, transition/retention grants, board structure; the unopened 5.02 event; insider transaction direction.
    - Finding: stewardship sections above are largely unverified.
    - Possible meaning: n/a — verification pass.
    - Next investigation: complete §5 and §7 manual passes; add dealer-inventory and backlog figures from MD&A/earnings 8-K exhibits (§4 gaps).

## 12. Score

§16 rubrics; one-line justification per category. Copied to frontmatter.

| Block | Score | Max |
|---|---:|---:|
| Economic health | 26 | 40 |
| Stewardship and integrity | 26 | 40 |
| Market confirmation | 10 | 20 |
| **Total** | **62** | 100 |

- Economic health 26/40: revenue/demand 6/8 (growth + deferred-revenue surge, mix unverified); margins 5/8 (−370bp, cause unresolved); cash conversion 5/8 (0.99 five-year 🟢 vs 🟡 latest-year lag and 🔴 receivable flag pending split); balance sheet 6/8 (1.54x net leverage, $10B cash, captive blur and coverage gap); returns on capital 4/8 (ROIC not computed — gap scored, not assumed).
- Stewardship 26/40: accounting transparency 5/8 (cash-backed earnings; XBRL gaps unverified); capital allocation 7/8 (balanced reinvestment + 31% payout + real share shrink); governance/comp 4/8 (DEF 14A unread, CEO transition unexamined); stakeholder treatment 4/8 (no evidence either way); strategic consistency 6/8 (stable segments, multi-decade dividend record).
- Market confirmation 10/20: relative price 4/5 (+70pp, but no estimate data); accumulation/ownership 2/5 (gap); valuation vs conservative economics 2/5 (no valuation work; +90% run raises the bar); catalyst asymmetry 2/5 (expectations now elevated).
- Red-flag override: **false** — no documented §7.3 hard-stop events in the pulls or 8-K timeline. Score is provisional on the §11 verification passes.

Total 62 = §16 band 55–69: *mixed; thesis depends on specific repairs or underappreciated strengths* — here, on the receivable split resolving benignly and the margin stabilizing.

## 13. Falsifiable thesis

- Bull case: an installed-base compounder taking a margin dip while investing into demand — deferred revenue +42.7% converts to revenue, capex adds capacity, FY2026 operating margin recovers toward 20%, and the receivable divergence proves to be captive-portfolio growth with stable credit metrics.
- Bear case: the divergence is trade-driven — dealers stuffed on easier terms while end-demand softens — margin compression persists, the WC build doesn't reverse, and a stock that rose 90% into falling operating income re-rates down (Pattern C: good company, bad investment).
- What would prove each wrong: **Bull wrong** if the 10-K/10-Q split shows ME&T trade receivables alone outpacing revenue >10pp, the allowance falling as collections slow, or dealer inventory building while retail demand stalls. **Bear wrong** if the split shows Financial Products drives the divergence with stable past-dues/write-offs, the working-capital build reverses, and quarterly operating margin stabilizes at or above FY2025's 16.5%.
- Next checkpoint and date: **Q2 2026 10-Q (expected ~2026-08-06; review by 2026-08-15)** — (1) trade vs. finance receivable split and allowance direction, (2) working-capital bridge in the cash-flow statement, (3) operating-margin trajectory. Copied into `next_checkpoint` / `next_checkpoint_date`.

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
