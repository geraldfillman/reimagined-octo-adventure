---
node_type: "health_review"
date: "2026-08-02"
company: "UNITED RENTALS, INC."
ticker: "URI"
period: "FY ending 2025-12-31"
process_quality: "stable"
outcome_quality: "stable"
market_response: "rewarding"
divergence_pattern: "good-company-bad-investment"
economic_health_score: 24
stewardship_score: 25
market_confirmation_score: 10
total_score: 59
red_flag_override: false
red_flags: []
next_checkpoint: "Q3 2026 10-Q + earnings 8-K: fleet utilization/productivity and used-equipment sale proceeds must hold Y/Y; resolve the FY2025 10-K inventory note (is the tagged $240M 'inventory' parts/merchandise or equipment held for sale) and reconcile gross fleet capex vs proceeds-from-used-equipment-sales in the cash-flow statement"
next_checkpoint_date: "2026-10-25"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_URI]]"
related_theses: []
tags: [health-review]
---

# Company Health & Integrity Review — UNITED RENTALS, INC.

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/URI - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker URI` — link the pull note into `markers_pull`.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

URI buys construction and industrial equipment by the fleet at wholesale, rents it out by the day/week/month to contractors and industrial customers who don't want idle machines on their own balance sheets, then sells the units used a few years later — earning a spread on equipment ownership: utilization while owned plus resale value at exit. It is the largest North American equipment lessor (SIC: Services-Equipment Rental & Leasing), running two engines: general rental (commodity fleet, scale- and density-driven) and specialty rental (trench safety, power/HVAC, fluid solutions, matting — higher margin, less cyclical). Growth has historically come from serial roll-up acquisitions layered on top of rental-penetration gains.

The dossier `one_liner` is currently blank (dossier is still a Scaffold) — the sentence above should seed it and start the evolution timeline.

## 2. What changed in the company machine?

- Positive:
    - Operating cash flow +14.2% to $5.2B in FY2025 while net income fell — cash generation strengthened into the profit slowdown ([[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Facts_URI]]).
    - Diluted share count −2.9% Y/Y (66.6M → 64.6M); gross buybacks exceed issuance — the ownership-concentration engine is still running.
    - Two FY2026 10-Qs already on file (Q1 filed 2026-04-22, Q2 filed 2026-07-22) — fresher evidence exists than this FY2025-period review has ingested.
- Negative:
    - Operating income −2.3% ($4.1B → $4.0B) and net income −3.1% ($2.6B → $2.5B) — the profit line rolled over even as tagged revenue grew +3.0%.
    - Long-term debt +6.2% to $14.3B with cash of only $459M; net debt/EBITDA at 3.50x (🟡). An 8-K on 2026-06-18 (items 1.01, 2.03) discloses a new material agreement and direct financial obligation — unreviewed, likely new financing.
    - SBC +19.6% to $134M — small in dollars but growing far faster than revenue.
- Ambiguous:
    - Tagged inventory +20.0% ($200M → $240M) vs cost-of-sales growth ~+8.3% — the 🔴 marker; classification resolved as a routing question in §3, not yet as a demand verdict.
    - Goodwill +3.2% to $7.1B — implies continued bolt-on M&A in FY2025; which deal(s) is an explicit gap (route to the 10-K acquisitions note).
    - 8-K 2026-02-04 (item 5.02, officer/director change) and 8-K 2026-01-28 (item 8.01 alongside Q4 earnings) — both unreviewed.
    - Deferred revenue −5.4% to $175M — small line, direction unexplained.

## 3. Financial health

§5 bands from [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_URI]] — rollup 🟢 5 · 🟡 2 · 🔴 1 · ⚪ 3 → `signal_status: watch`.

**Profile misfit caveat first:** the pull ran the **general** skeleton profile, and the derived rows prove the revenue tag is partial — gross margin computes at 166.3% and operating margin at 107.5%, which is arithmetically impossible against total revenue. The tagged "revenue" ($3.7B) is most plausibly ASC 606 contract revenue only (used/new equipment sales, parts, service), excluding rental revenue recognized as lease income under ASC 842. Gross profit, operating income, net income, and OCF look like whole-company figures. Every ratio with revenue or cost-of-sales in it inherits this distortion. URI needs an industry-aware lessor profile the way banks and REITs got one.

- Organic revenue: tagged revenue +3.0% Y/Y — but per above this is the *sales* slice of the business, not rental. Total-revenue growth, rate vs volume vs M&A split: explicit gap, route to 10-K MD&A (§17 Step 2). Receivables growth − revenue growth +3.5pp is 🟢 by band, but the denominator is the partial tag — recompute against total revenue before crediting collections quality.
- Gross and operating margin: non-computable from the skeleton (see caveat). What is real: operating income −2.3% and net income −3.1% in FY2025 — mild compression at the whole-company level.
- FCF conversion: ⚪ n/a — fewer than 2 period-aligned FYs because the capex series is stale (latest tagged FY end 2024-12-31; the known XBRL stale-tag failure mode). Do not fill this gap with an estimate. Two real observations stand: OCF/NI ran 208% in FY2025 (vs 177% prior), and the 🟡 "operating cash flow vs earnings trend" marker's auto-text ("earnings rose while operating cash fell") contradicts the skeleton, which shows the opposite signs (NI −3.1%, OCF +14.2%) — the divergence is real but cash-favorable; verify which year-pair triggered it against the 10-K cash-flow statement. **Structural note:** for a rental company FCF conversion is not a quality ratio the way it is for an asset-light business — gross fleet capex ($4.1B at the last good tag, FY2024) *is* the raw-material purchase, it is discretionary quarter to quarter, and it is partially offset by proceeds from used-equipment sales. FCF here measures cycle posture, not earnings honesty. The honest version is gross fleet capex vs used-sale proceeds from one cash-flow statement (§11).
- ROIC and incremental returns: not computed in the pull — explicit gap. The bar is raised by $7.1B of goodwill from the roll-up history; returns must be judged on total capital including acquired intangibles.
- Debt and liquidity: 🟡 net debt/EBITDA 3.50x — above the comfort band and rising (LT debt +6.2% to $14.3B, current debt tagged, cash only $459M). The ⚪ EBIT/interest marker's auto-text ("likely unlevered") is **wrong** — a $14.3B debt stack has material interest; the tag is simply missing. Compute coverage manually from the income statement and route the maturity ladder / covenant headroom to the debt note, together with the unreviewed 2026-06-18 financing 8-K. Rental lessors run levered by design (fleet is financeable collateral), but 3.5x into a possible cycle roll is the single most important number in this review after the inventory question.
- Working capital — **the 🔴 inventory-classification resolution (centerpiece):**
    - The marker: inventory growth − cost-of-sales growth = **+11.7pp** (inventory +20.0%, $200M → $240M; implied cost-of-sales growth ~+8.3%).
    - For a rental company, "inventory" is an unusual line. The rental fleet does **not** sit in inventory — it is capitalized in PP&E as rental equipment and depreciated. The tagged $240M is roughly 1.5% of URI's true revenue scale; it can only be the small merchandise layer: new equipment held for resale, contractor supplies, and parts.
    - Therefore the +11.7pp divergence is **not** a fleet build and cannot be read directly as demand weakness. It is a $40M increase on a small sales-support line. Two further distortions: (a) the cost-of-sales denominator likely includes cost of *rental* revenue (depreciation-heavy) while the inventory relates only to the sales lines — an apples-to-oranges pairing that inflates the spread; (b) the revenue tag mismatch above.
    - What would make it matter: if the build sits in *equipment held for sale* and used-equipment retail is slowing, that IS an early demand tell — slower used-market absorption shows up before rental rates crack. Resolution routes to the FY2025 10-K inventory accounting-policy note and the MD&A used-equipment sales discussion (§11). Until then: classification question first, demand signal second.
    - Deferred revenue −5.4% to $175M — minor, unexplained; receivables +6.5% to $2.5B, roughly in line.

## 4. Operational health

§6 markers + §14 industrials emphases, adapted to the rental model. Almost all of this layer **needs pulling** — the vault currently holds only XBRL-level evidence.

- Customers and retention: no vault evidence. Needs: national-account share, customer concentration, e-commerce/telematics attach (10-K business section).
- Product and innovation: no vault evidence. Needs: specialty-segment growth vs gen-rent (segment footnote) — specialty mix is the margin and cyclicality story.
- Employees and safety: no vault evidence. Rental is a safety-critical logistics business; recordable-incident trends live in the 10-K human-capital section — needs pulling.
- Suppliers and capacity: capex tag stale (FY2024 $4.1B, +6.9%); OEM concentration (equipment suppliers are also competitors' suppliers) — needs pulling.
- Sector-specific KPIs (§14 industrials, translated for rental — **these are the real tells, none yet evidenced in the vault**):
    - **Fleet utilization** (time and dollar) — the demand gauge; replaces "capacity utilization."
    - **Fleet age** — deferred replacement flatters near-term FCF and degrades future utilization; replaces "backlog quality."
    - **Used-equipment pricing / sale proceeds vs original cost** — the residual-value spread; the market-clearing price of the whole thesis. Connects to the §3 inventory question.
    - **Rental-rate discipline** (Y/Y rate change) — replaces "organic orders."
    - **Specialty vs gen-rent mix** — margin structure and downturn resilience.
    - **M&A roll-up cadence and integration** — goodwill +3.2% says it continued in FY2025; which targets, at what multiples — needs the acquisitions note.
    - Working capital and pension/environmental obligations: standard §14 items; inventory handled in §3, obligations not yet checked.

**Cycle-timing logic (Universe Map theme 9):** URI is the capex canary. Contractors rent before they buy; slack shows up as falling rental utilization *before* it shows up as cancelled OEM orders. The Universe Map codes URI exactly this way ("Rental utilization = the capex canary that leads CAT orders") and the macro table has rental utilization leading Recession calls. The [[13_Company_Intel/Reviews/2026-08-02 - CAT - Health Review]] (62/100, good-company-bad-investment) found the market paying ahead for a demand inflection CAT's statements don't yet show — URI's utilization and used-pricing prints are the *leading* evidence that will confirm or falsify that CAT thesis one to two quarters early. Filling this section's KPIs is therefore not just URI hygiene; it is the sensor for the whole industrials sleeve.

## 5. Stewardship and integrity

- Accounting quality: no red flags in the filings themselves from vault evidence. The tag-level gaps (partial revenue concept, missing interest expense, stale capex) are mapping artifacts of the general profile, not accusations against URI's disclosure — but they cap how much credit can be given until the manual pass is done.
- Disclosure quality: URI publishes fleet productivity/utilization metrics in earnings materials (8-K exhibits 2026-01-28, 2026-04-22, 2026-07-22 on file) — good raw material, none yet ingested. Needs the §7.4 compare pass (risk-factor wording, KPI definition changes) across FY2024 → FY2025 10-Ks.
- Capital allocation: the roll-up record is the defining stewardship question. Evidence for discipline: buybacks with the share count actually falling (−2.9% net), a dividend maintained, and — within the pre-cutoff record — walking away from the H&E Equipment deal in early 2025 when outbid rather than chasing (verify in the 8-K archive before relying on it). Evidence for caution: goodwill $7.1B and still growing, and leverage rising to 3.50x while distributing — late-cycle debt-funded distributions are the classic industrial-lessor mistake.
- Executive compensation: DEF 14A filed 2026-03-25 — unreviewed. Check which metrics pay out (EBITDA growth pays for levered roll-ups; ROIC/fleet-productivity metrics pay for discipline).
- Board oversight: 5.07 annual-meeting results 8-K (2026-05-08) and a 5.02 officer/director change (2026-02-04) — both unreviewed.
- Customer and employee treatment: no vault evidence — explicit gap.
- Regulatory and legal record: nothing adverse in the filing index; SD conflict-minerals filings routine. No §7.3 hard-stop events open → `red_flag_override: false`.

## 6. Shareholder distribution

- Dividends: paid (5 FYs tagged) but ⚪ payout ratio n/a — dividends, OCF, and capex report different periods in XBRL; compute manually from one cash-flow statement. Do not estimate.
- Gross buybacks: exceed issuance (🟢); dollar amount needs the cash-flow statement.
- Net share-count change: −2.9% Y/Y diluted (66.6M → 64.6M) — real, sustained concentration of ownership.
- Stock compensation: $134M, +19.6% Y/Y. The pull's 3.6%-of-revenue figure is inflated by the partial revenue tag; against true revenue scale SBC is closer to ~1% — modest, but the growth rate deserves a look in the proxy.
- Debt used for distributions: partially, on the evidence — LT debt +6.2% ($13.5B → $14.3B) in a year of continued buybacks and dividends. With OCF of $5.2B this is a choice, not a necessity; the June 2026 financing 8-K will show whether the posture extended into FY2026.

## 7. Market behavior

- Relative performance: +25.6% 12-month return vs XLI +20.1% → **+5.4pp** (🟢, within normal range of benchmark per §9.2).
- Estimate revisions: not pulled — gap.
- Accumulation/distribution: not pulled — §9.3 manual pass needed.
- Insider activity: cluster of nine Form 4s on 2026-05-12 for 2026-05-08 — pattern is consistent with routine annual director equity grants (verify). One Form 4 + Form 144 pair on 2026-07-24, two days after Q2 earnings — a sale worth opening.
- Ownership concentration: 13G record stale (latest 2024-02-13); 13F trend not pulled — gap.
- Short interest: not pulled — gap.

Reading: the market is **rewarding** URI — outperforming a benchmark (XLI) that itself outperformed, in a year when whole-company operating income declined. Same shape as CAT, milder degree.

## 8. Process-versus-outcome classification

- Process quality: **stable** — the machine (buy fleet / rent / sell used / roll up) is unchanged; cash engine strengthened; no operational deterioration evidenced, but the §14 tells that would prove improvement are unpulled.
- Current outcome quality: **stable** — tagged revenue +3.0%, operating income −2.3%, net income −3.1%, OCF +14.2%: a mixed, flat-to-softening profit picture with strong cash.
- Market response: **rewarding** — +25.6% absolute, +5.4pp vs XLI.
- Primary divergence: market rewarding a flat outcome year at 3.50x leverage, late in a capex cycle where URI itself is the leading indicator — a milder, upstream echo of CAT's good-company-bad-investment pattern (§13 Pattern C: the price assumes the cycle's duration).

### Divergence sentence (§17 Step 7)

> The company's operating process is `stable`, reported results are `stable`, and the market is pricing `more` future success because `a +25.6% twelve-month return (+5.4pp vs XLI) landed on a year of −2.3% operating income and long-term debt up +6.2% to $14.3B — investors are paying for the equipment-rental cycle to extend, while the tells that would falsify that extension first (utilization, fleet age, used-equipment pricing) are not yet in the vault`.

## 9. Good-faith evidence

- Built cash rather than stretching: OCF +14.2% to $5.2B while profits slipped — the company did not manufacture earnings momentum out of working capital.
- Buybacks with a genuinely falling share count (−2.9%) rather than SBC-offset theater; SBC remains small in dollars.
- Price discipline in M&A within the pre-cutoff record (H&E walk-away when outbid — verify in 8-K archive).
- Dividend maintained through the profit wobble rather than cut-and-restored games.
- Broader §10 evidence (safety investment, customer protection at present cost): no vault evidence yet — gap, not absence.

## 10. Extraction or bad-faith risk

- **Leverage creep to fund distributions late-cycle:** debt +6.2% while buying back at 3.50x net leverage — if utilization rolls, this converts shareholder-friendly into balance-sheet-fragile quickly. The classic lessor failure mode.
- **Serial-acquirer goodwill:** $7.1B and growing; a cycle turn plus impairment would reveal how much of the roll-up premium was cycle, not synergy.
- **Fleet-age lever:** management can defer replacement capex to flatter FCF in any given year — invisible until utilization and repair costs betray it. This is why the stale capex tag matters: the vault currently cannot see the fleet-investment trend at all.
- **SBC growing +19.6%** against ~3% revenue growth — small base, wrong direction.
- No evidence of KPI redefinition, channel games, or disclosure retreat — but the §7.4 compare pass hasn't been run.

## 11. EDGAR follow-up

Routed via §15. Log outcomes as Intel Findings.

- Filing: **FY2025 10-K** (filed 2026-01-28) — primary; **Q2 2026 10-Q** (filed 2026-07-22) — freshest; **8-K 2026-06-18** (items 1.01/2.03).
- Section or exhibit: (1) inventory accounting-policy note + balance-sheet detail; (2) **cash-flow statement: purchases of rental equipment vs proceeds from sales of rental equipment** — the real FCF-conversion computation for a lessor; (3) debt footnote — maturity ladder, covenant headroom, actual interest expense (missing tag); (4) MD&A fleet productivity/utilization and used-equipment sales discussion; (5) segment footnote — specialty vs gen-rent; (6) acquisitions note — what drove goodwill +3.2%.
- Finding: tagged inventory +20.0% vs cost-of-sales ~+8.3% (🔴 +11.7pp); net debt/EBITDA 3.50x (🟡); OCF-vs-earnings marker auto-text contradicts skeleton signs (🟡).
- Possible meaning: inventory — either benign parts/merchandise build or an early used-equipment retail slowdown; leverage — either normal fleet financing or late-cycle distribution funding; OCF divergence — likely cash-favorable working-capital timing.
- Next investigation: DEF 14A 2026-03-25 (comp metrics); 8-K 2026-01-28 item 8.01; 8-K 2026-02-04 item 5.02; Form 4/144 pair of 2026-07-24; then rerun the health pull once a lessor-aware skeleton profile exists (the general profile's revenue/interest/capex mappings all misfire on URI).

## 12. Score

§16 rubrics; one-line justification per category. Copied to frontmatter.

| Block | Score | Max |
|---|---:|---:|
| Economic health | 24 | 40 |
| Stewardship and integrity | 25 | 40 |
| Market confirmation | 10 | 20 |
| **Total** | **59** | 100 |

Economic health — 24/40:
- Revenue and demand quality 5/8 — tagged +3.0%; the real demand markers (utilization, rate) are unevidenced; deeply cyclical end-market.
- Unit economics and margins 5/8 — operating income −2.3%; skeleton margins non-computable (partial revenue tag); structural margin quality likely better than the vault can currently prove.
- Cash conversion and earnings quality 6/8 — OCF +14.2%, OCF/NI 208%; FCF non-computable (stale capex tag) so full credit withheld.
- Balance-sheet resilience 4/8 — 3.50x net debt/EBITDA rising, $459M cash, missing interest tag, unreviewed new financing.
- Returns on capital and reinvestment 4/8 — not computed; $7.1B goodwill raises the required bar; explicit gap.

Stewardship and integrity — 25/40:
- Accounting transparency 5/8 — no filing-level red flags; credit capped until tag gaps are resolved manually.
- Capital allocation and distributions 6/8 — net count −2.9%, buybacks > issuance, dividend held; docked for levering up while distributing.
- Governance and compensation 5/8 — proxy unreviewed; SBC small but +19.6%; one insider sale to check.
- Customer, employee, safety, supplier treatment 4/8 — no vault evidence either way.
- Strategic consistency and accountability 5/8 — decades-consistent roll-up + specialty strategy; FY2025 bolt-ons unverified.

Market confirmation — 10/20:
- Relative price and estimate behavior 4/5 — +5.4pp vs XLI, constructive.
- Accumulation/distribution and ownership 2/5 — 13G/13F stale, no manual pass.
- Valuation vs conservative economics 2/5 — no valuation work in vault; cycle position argues conservatism.
- Catalyst and expectation asymmetry 2/5 — market pricing cycle extension; the downside tells would print at URI first.

- Red-flag override: **false** — no §7.3 hard-stop events open (no restatement, auditor dispute, going-concern, covenant breach, fraud allegation, or unresolved safety failure in the vault record).

## 13. Falsifiable thesis

- Bull case: rental penetration keeps rising and infrastructure/mega-project demand extends the cycle; utilization and rate hold; specialty mix keeps shifting margins up; $5.2B OCF funds buybacks *and* deleveraging; used-equipment values stay firm, validating the ownership spread.
- Bear case: the capex cycle rolls — utilization falls first, used-equipment prices soften, sale proceeds shrink while depreciation and interest are fixed, and 3.50x leverage amplifies a modest revenue decline into a large equity drawdown. As the cycle canary, URI's own weakness then front-runs CAT's order book (theme 9) — meaning URI underperforms before the industrial sleeve confirms why.
- What would prove each wrong: **bull is falsified** if fleet productivity/utilization goes negative Y/Y and used-equipment sale proceeds (or realized pricing vs cost) decline for two consecutive quarters; **bear is falsified** if utilization and rate hold positive through the FY2026 10-Qs while net leverage declines back below ~3.0x and operating margin stabilizes.
- Next checkpoint and date: **Q3 2026 10-Q + earnings 8-K (expected ~2026-10-21; checkpoint 2026-10-25)** — utilization/fleet-productivity Y/Y must hold; pull gross fleet capex vs proceeds-from-used-sales from the cash-flow statement; resolve the 10-K inventory note (parts/merchandise vs equipment held for sale). Copied to frontmatter.

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
