---
node_type: "health_review"
date: "2026-08-02"
company: "Meta Platforms, Inc."
ticker: "META"
period: "FY ending 2025-12-31"
process_quality: "improving"
outcome_quality: "stable"
market_response: "punishing"
divergence_pattern: "good-process-bad-stock"
economic_health_score: 33
stewardship_score: 26
market_confirmation_score: 8
total_score: 67
red_flag_override: false
red_flags: []
next_checkpoint: "Q3 2026 10-Q: TTM capex intensity stops rising (≤35% of revenue), TTM FCF holds ≥ FY2025's $46.1B, SBC/revenue back ≤10%"
next_checkpoint_date: "2026-11-01"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_META]]"
price_at_review: 556.71
reconsider_price_low: 445.37
reconsider_price_high: 695.89
related_theses: []
tags: [health-review]
---

# Company Health & Integrity Review — Meta Platforms, Inc.

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/META - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker META` — link the pull note into `markers_pull`.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

Meta attracts the attention of billions of people with free social applications (Facebook, Instagram, WhatsApp, Messenger, Threads) and sells advertisers targeted access to that attention. This matches the dossier `one_liner` ("Attracts attention through social applications and sells advertisers access to that attention") — the revenue machine is unchanged, so no dossier evolution-timeline update is required. What is changing is the *cost side* of the machine: the company is re-tooling itself around AI infrastructure at a scale ($69.7B FY2025 capex) that the one-sentence description does not yet capture. If capex of this size becomes permanent, the barebones sentence eventually needs an appendix: "…and spends an industrial-company share of revenue on compute to keep that attention."

## 2. What changed in the company machine?

Grounded in [[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Facts_META]] (FY2025 10-K XBRL, filed 2026-01-29) and [[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Baseline_META]]:

- Positive:
    - Revenue $201.0B, +22.2% y/y — demand for the ad engine accelerated, not decayed, during the investment phase.
    - Operating cash flow $115.8B, +26.8% — cash generation growing faster than revenue.
    - Receivables (+16.3%) growing slower than revenue (+22.2%) — collections keeping pace, no channel-stuffing signature.
    - Diluted shares −1.5% y/y — buybacks more than absorbing grants even at peak spend.
- Negative:
    - Capex $69.7B, +87.1% y/y — capex intensity jumped from 22.7% to 34.7% of revenue in one year. FCF fell from $54.1B to $46.1B (−14.8%) despite record revenue.
    - Long-term debt +103.8% to $58.7B (+$29.9B), corroborated by the 424B2 bond issuances of 2025-10-30/11-03 and 2026-04-30/05-01 plus a fresh S-3ASR shelf (2026-04-30). Cash −18.3% to $35.9B. The AI buildout is now partly debt-assisted.
    - SBC $20.4B, +22.4% — 10.2% of revenue, in the §5.6 high-concern band (see §3).
    - Net income $60.5B, −3.1% — the first bottom-line consequence of the depreciation/opex wave.
- Ambiguous:
    - R&D +30.8% to $57.4B — strategic if AI returns materialize; an expense ratchet if not.
    - Goodwill +18.8% to $24.5B — implies acquisition activity; identify the deal(s) in the 10-K acquisition footnote.
    - The 2026 filings cadence (10-Qs through 2026-06-30, earnings 8-K 2026-07-29) exists but has not been read — FY2026 interim trajectory is an open item, not evidence.

## 3. Financial health

Marker table: [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_META]] — rollup 🟢 8 · 🟡 1 · 🔴 1 · ⚪ 1, `signal_status: watch`. Every marker interpreted below.

- Organic revenue: +22.2% to $201.0B (FY2025). Benign reading: advertiser demand is compounding organically at scale. Negative reading: a single ad engine funds everything, and the impressions-vs-price mix behind the 22% is not in the pull — needs the 10-K MD&A split (§17 Step 2).
- Gross and operating margin: gross profit not tagged in XBRL (⚪ explicit gap — check the filing, don't estimate). Operating margin 41.4% vs 42.2% prior. Benign: only −0.8pp while absorbing the first tranche of AI costs. Negative: most of the $69.7B capex hasn't hit the depreciation line yet — the margin pressure is ahead of us, not behind.
- FCF conversion: 🟢 cumulative 5-FY FCF/NI = 0.90; OCF/NI 191.5%; OCF-vs-earnings trend aligned 🟢; receivables−revenue gap −5.8pp 🟢; inventory marker ⚪ n/a (no inventory tagged — asset-light). Benign: earnings are cash-backed, working capital is clean. Negative: the 191.5% OCF/NI ratio is flattered by non-cash add-backs (D&A plus $20.4B SBC), and the FCF *level* fell 14.8% — conversion quality is fine, quantity is shrinking.
- ROIC and incremental returns: not computed in the pull (gap). Directionally: net income fell 3.1% while the capital base ballooned (capex +87%, debt +104%) — measured incremental returns are currently *negative*. Benign: classic J-curve, spend leads revenue. Negative: this is exactly what an empire-building capex ratchet looks like from the outside; only FY2026–27 revenue can distinguish them.
- Debt and liquidity: 🟢 net cash position, 🟢 EBIT/interest 76.4x. Benign: balance sheet is nowhere near stress. Negative: the direction — LT debt doubled, cash down 18% — means the buffer is being spent; a second year like FY2025 flips net cash to net debt.
- Working capital: receivables growth 5.8pp below revenue growth 🟢; deferred revenue small ($0.7B) and growing — negligible float either way. No concerns.
- Distribution markers (detail in §6): diluted shares −1.5% 🟢, buybacks exceed issuance 🟢, dividend 12% of FCF 🟢, SBC/revenue 10.2% 🔴 — the one red band, routed in §11.

## 4. Operational health

The vault holds no platform KPI pull for META — everything below is either filing-evidenced or an explicit gap. Do not score operations on vibes.

- Customers and retention: NOT PULLED — Family Daily Active People (DAP), per-user engagement, and regional user trends need the 10-K/10-Q MD&A KPI tables. Indirect evidence only: 22.2% revenue growth is hard to produce with a shrinking or disengaged user base.
- Product and innovation: R&D $57.4B (+30.8%), now 28.6% of revenue — the machine is buying AI capability at maximum rate. Whether it ships as better ad targeting/ranking (measurable in price-per-ad) is the FY2026 question. Reality Labs segment results for FY2025: not in the pull — verify operating loss in the 10-K segment footnote.
- Employees and safety: NOT PULLED — headcount trend, attrition, and the human-review/content-moderation cost line need the 10-K. No layoff/restructuring 8-K appears in the 2026 baseline window.
- Suppliers and capacity: the binding constraint is compute — GPU supply (NVIDIA dependence) and datacenter/power buildout. The $29.9B of new debt and the S-3ASR shelf are the financing shadow of that constraint. Concentration detail: 10-K risk factors.
- Sector-specific KPIs to pull next (§14, ad-platform emphasis): ad impressions growth vs price-per-ad (MD&A discloses both), Family DAP, average revenue per person, Reality Labs loss run-rate, FY2026 capex guidance from the 2026-07-29 earnings 8-K.

## 5. Stewardship and integrity

- Accounting quality: GAAP-centered reporting; clean working-capital signature (§3); no inventory/percentage-of-completion levers available in this model. Blank XBRL rows (gross profit) are tag gaps, not red flags. Verify the non-GAAP exclusion history in earnings 8-Ks — historically modest for META, but confirm.
- Disclosure quality: segment reporting (Family of Apps vs Reality Labs) voluntarily exposes a large loss-making bet — a transparency positive. KPI definitions (DAP) have changed over the years — check the current 10-K definition footnote before trending.
- Capital allocation: reinvestment-first ($69.7B capex + $57.4B R&D), buybacks second, small dividend third. Rational ordering *if* incremental returns hold; unfalsifiable until they show up. New: distributions now coexist with $29.9B of fresh debt — not yet §5.7 "debt-funded distributions," but the boundary is worth watching.
- Executive compensation: Zuckerberg takes a nominal salary with large security/aircraft allowances (verify current figures in the DEF 14A filed 2026-04-16). The real comp story is company-wide: $20.4B SBC = 10.2% of revenue. Grant vesting/performance conditions: verify in proxy.
- Board oversight: structurally weak by design. Dual-class shares (Class B = 10 votes) give the founder-CEO a majority of voting power (~61% per prior proxies — verify the current figure in the 2026 DEF 14A). The board cannot be replaced by outside shareholders; every annual-meeting governance proposal outcome (8-K 2026-05-29, Item 5.07 — verify results) is advisory in practice. Also check the 8-K of 2026-04-14 (Item 5.02, officer/director change) — unread.
- Customer and employee treatment: the product is free; the user pays in attention and data (§12 lens — see §10). No documented FY2025 misconduct event in the pulls.
- Regulatory and legal record (well-established, pre-cutoff facts): 2019 FTC privacy settlement ($5.0B) with ongoing consent-order obligations; 2023 EU GDPR fine (€1.2B, data transfers); EU DMA scrutiny of the "pay-or-consent" ad model (2024 charges); multi-state AG litigation on teen safety (2023); FTC monopolization case over the Instagram/WhatsApp acquisitions — verify current status and any 2026 developments before relying on it. None of these is a §7.3 hard-stop, but the pattern is a recurring regulatory tax on the business model.

## 6. Shareholder distribution

Netted honestly, per §5.6–5.7:

- Dividends: 12% of FCF 🟢 (≈$5.5B on $46.1B FCF) — initiated 2024, deliberately small; well inside the comfortable band even after the FCF decline.
- Gross buybacks: dollar amount not in the pull — verify in the FY2025 10-K cash-flow statement. What is evidenced: buybacks exceed issuance 🟢.
- Net share-count change: diluted shares −1.5% y/y 🟢 — the distribution is real, not a headline that nets to dilution.
- Stock compensation: $20.4B, 10.2% of revenue 🔴 — and it was also ~10.2% in FY2024 ($16.7B/$164.5B): this is a *persistent* level above the §5.6 high-concern threshold, not a one-year spike. The first ~$20B of any buyback each year is not a shareholder return; it is payroll settlement (§5.6: "a buyback is not a shareholder return when it merely purchases shares issued to employees").
- Debt used for distributions: not directly — OCF ($115.8B) covers capex + dividend + buybacks in aggregate — but $29.9B of new debt entered the same wallet that pays them. Fungibility caveat noted; classify as "investigate," not "concern."
- Net verdict: genuinely positive net shareholder yield, materially smaller than gross optics because of the SBC treadmill.

## 7. Market behavior

§9 discipline: the stock is evidence about expectations and ownership, not an audit of the business.

- Relative performance: 🟡 −25.8% twelve-month return vs XLC +2.0% → **−27.8pp**, well past the §9.2 ≥20pp band that demands a specific explanation. The candidate explanation consistent with §2–§3 evidence: the market is discounting the capex supercycle (FCF −14.8%, debt +104%) rather than any demand problem (revenue +22.2%). That hypothesis must be checked against estimate revisions, not assumed.
- Estimate revisions: NOT PULLED — explicit gap (FMP analyst endpoints available; route via next pull).
- Accumulation/distribution: NOT PULLED — no volume/flow data in vault.
- Insider activity: steady Form 4 / Form 144 cadence through Jun–Jul 2026 (baseline note) — pattern is consistent with programmatic 10b5-1 selling, but plan status and sizes are unverified; read the recent Form 4s before treating as neutral.
- Ownership concentration: no 13D/13G in the recent submissions window (baseline). 13F trend: NOT PULLED — gap.
- Short interest: NOT PULLED — gap.

## 8. Process-versus-outcome classification

- Process quality: **improving** — demand (+22.2% revenue), cash generation (+26.8% OCF), collections, and platform capability investment all strengthening.
- Current outcome quality: **stable** — record revenue and operating income against falling net income (−3.1%) and FCF (−14.8%); the P&L is mixed by construction during the investment phase.
- Market response: **punishing** — −27.8pp vs sector over 12 months.
- Primary divergence: **good-process-bad-stock** (§13 Pattern A: investment depresses current cash returns; the market doubts execution/duration of the payoff). Pattern A's checklist — balance sheet strong enough to finish the plan (yes: net cash, 76.4x coverage), customers staying (revenue says yes; KPI pull pending), milestone that converts investment to cash flow (FY2026 ad-pricing/FCF inflection — §13).

### Divergence sentence (§17 Step 7)

> The company's operating process is `improving`, reported results are `stable`, and the market is pricing `less` future success because `it doubts that a capex program that nearly doubled to $69.7B — increasingly debt-assisted, with FCF down 15% — will earn adequate incremental returns`.

## 9. Good-faith evidence

- The AI buildout is funded overwhelmingly from operating cash flow ($115.8B OCF vs $69.7B capex), and diluted shares *fell* 1.5% through peak investment — owners were not handed the bill via dilution.
- The dividend was initiated (2024) at a deliberately conservative level (12% of FCF) rather than stretched for optics, preserving reinvestment capacity — §5.7's "high-return projects funded first" ordering.
- Segment disclosure voluntarily quantifies the Reality Labs losses year after year rather than burying them in a blended P&L — costly transparency (verify FY2025 figure in the segment footnote).
- Balance-sheet conservatism preserved through the spend: still net cash with 76.4x interest coverage after doubling long-term debt.

## 10. Extraction or bad-faith risk

- Attention economics (§12 lens, stated factually): revenue scales with engagement, and several externalized-cost return channels are already *active*, not hypothetical — the 2019 FTC consent order, the 2023 EU GDPR fine, DMA pay-or-consent charges, and state teen-safety litigation. The §12 question ("through which mechanism could the externalized cost return?") has a documented answer here: regulation and litigation, recurring.
- SBC at 10.2% of revenue for two consecutive years (§5.6 high-concern band): ~$20B/yr of owner value recycled into employee grants, with buybacks doing the offsetting — legal, disclosed, and a permanent toll on distributions.
- Dual-class control removes the shareholder check on the capex supercycle: the same structure that let management spend >$60B on the metaverse pivot without recourse now governs a larger AI bet. Alignment via ~13% economic ownership is real but one-directional.
- Debt issuance ($29.9B added; fresh S-3ASR shelf April 2026) alongside continued buybacks and dividends — currently covered by OCF, but the §5.7 "distributions funded by debt" line is now close enough to monitor each quarter.

## 11. EDGAR follow-up

Routed via the §15 table; log meaningful findings as [[03_Templates/Intel_Finding]] notes.

- Filing: FY2025 10-K (filed 2026-01-29) + DEF 14A (filed 2026-04-16). Section or exhibit: statement of equity, SBC footnote, proxy compensation tables. Finding: 🔴 SBC/revenue 10.2%, second consecutive year. Possible meaning: structural comp level, not a spike — permanent drag on net distributions. Next investigation: grant vesting terms and performance conditions; five-year net-share-count vs gross-buyback reconciliation (§15 "Dilution" row).
- Filing: 8-K 2026-07-29 (Q2 2026 earnings, Items 2.02/9.01) + 10-Q for 2026-06-30 (filed 2026-07-30). Section: MD&A capex/guidance language, ad impressions vs price-per-ad. Finding: 🟡 −27.8pp vs XLC. Possible meaning: market discounting capex returns vs estimate-revision cycle vs changed thesis (§9.2). Next investigation: pull estimate revisions + read the two 2026 10-Qs for capex trajectory.
- Filing: S-3ASR (2026-04-30) + 424B2s (2026-04-30/05-01, 2025-10-30/11-03). Section: use of proceeds, maturity schedule. Finding: LT debt +103.8% in one FY. Possible meaning: deliberate term-funding of datacenters at investment-grade rates vs creeping distribution funding. Next investigation: §15 "New capital raise" row — proceeds use, covenant needs, interest sensitivity.
- Filing: 8-K 2026-04-14 (Item 5.02) and 8-K 2026-05-29 (Item 5.07). Section: officer/director change; annual-meeting vote results. Finding: unread. Next investigation: identify who changed and how governance proposals fared against the Class B block.

## 12. Score

§16 rubrics; sub-category rationale one line each.

| Block | Score | Max |
|---|---:|---:|
| Economic health | 33 | 40 |
| Stewardship and integrity | 26 | 40 |
| Market confirmation | 8 | 20 |
| **Total** | **67** | 100 |

- Economic health 33/40: revenue quality 7/8 (+22.2% organic at $200B scale); unit economics 7/8 (41.4% op margin, −0.8pp under heavy investment); cash conversion 6/8 (0.90 5-FY conversion, but FCF level −14.8% and SBC-flattered OCF); balance sheet 7/8 (net cash, 76.4x coverage; debt doubled — direction penalty); returns on capital 6/8 (historically elite; incremental returns on $69.7B currently unproven, NI fell).
- Stewardship 26/40: accounting transparency 7/8 (GAAP-first, clean signatures, honest segment losses); capital allocation 6/8 (rational ordering, but SBC treadmill consumes the first $20B of buybacks and debt now sits beside distributions); governance/compensation 4/8 (dual-class founder majority — no shareholder recourse by construction); customer/employee treatment 4/8 (active regulatory/litigation return channels on the attention model); strategic consistency 5/8 (pivots are big and abrupt — metaverse then AI — but costs are disclosed, not hidden).
- Market confirmation 8/20: relative price/estimates 1/5 (−27.8pp vs XLC, estimate data not pulled); accumulation/ownership 2/5 (no flow data; insider cadence looks programmatic — unverified); valuation vs conservative economics 2/5 (no valuation pull; compression implied by −25.8% against +22% revenue, but unmeasured); catalyst/expectation asymmetry 3/5 (expectations visibly reset lower while the machine grew — asymmetry improving if capex peaks).
- Total 67/100 → §16 band "mixed; thesis depends on specific repairs or underappreciated strengths" — here, entirely on whether the AI capex earns its keep.
- Red-flag override: **false** — no §7.3 hard-stop event (no restatement, auditor dispute, going-concern, covenant breach, or fraud allegation) documented in the FY2025 10-K baseline or 2026 8-K window.

## 13. Falsifiable thesis

- Bull case: the ad machine compounds ~20% while AI capex peaks as a share of revenue in FY2026; depreciation is absorbed, FCF re-expands from $46.1B toward and past the FY2024 $54.1B mark, and the −27.8pp underperformance reverses as the market re-rates proven incremental returns.
- Bear case: capex intensity stays ≥35% of revenue indefinitely (arms-race dynamics), incremental returns stay negative, FCF stagnates in the $40Bs while debt builds and SBC holds above 10% of revenue — owners are funding an infrastructure race with no tollbooth, and dual-class control means they cannot stop it.
- What would prove each wrong: bull is wrong if FY2026 interim filings show capex guidance raised again *without* accelerating ad revenue, or TTM FCF falling below the FY2025 $46.1B floor. Bear is wrong if revenue growth holds ≥18% while capex intensity declines sequentially and FCF re-expands — that combination is incompatible with value-destructive spend.
- Next checkpoint and date: **Q3 2026 10-Q (expected ~2026-10-29; review by 2026-11-01)** — three observables: (1) TTM capex/revenue ≤35% and not rising, (2) TTM FCF ≥ $46.1B, (3) SBC/revenue back at or below 10%. Also close the §11 items: estimate-revision pull, 2026 10-Q read, S-3 use of proceeds.

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
