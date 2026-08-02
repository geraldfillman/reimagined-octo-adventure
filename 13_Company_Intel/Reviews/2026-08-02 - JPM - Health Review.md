---
node_type: "health_review"
date: "2026-08-02"
company: "JPMorgan Chase"
ticker: "JPM"
period: "FY ending 2025-12-31"
process_quality: "stable"
outcome_quality: "stable"
market_response: "rewarding"
divergence_pattern: "none"
economic_health_score: 31
stewardship_score: 30
market_confirmation_score: 10
total_score: 71
red_flag_override: false
red_flags: []
next_checkpoint: "Q2 2026 10-Q credit pass: provision/net loans stays ≤ ~1.2% annualized, no sharp NPL/charge-off inflection, allowance coverage stable"
next_checkpoint_date: "2026-08-10"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_JPM]]"
related_theses: []
tags: [health-review]
---

# Company Health & Integrity Review — JPMorgan Chase

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/JPM - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker JPM` — link the pull note into `markers_pull`.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

JPMorgan Chase gathers roughly $2.6T of deposits and converts them into interest-earning loans and securities while charging fees for moving money, underwriting, trading, and managing wealth — a deposit-spread-plus-fee machine operating at the largest scale in US banking ($4.42T assets at FY2025). This matches the dossier `one_liner` ("Takes deposits, makes loans, moves money, and manages investments, earning interest spread and fees") — the machine has not changed; no dossier evolution-timeline update needed.

## 2. What changed in the company machine?

Grounded in [[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Facts_JPM]] (FY2025 vs FY2024) and [[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Baseline_JPM]].

- Positive:
    - Both revenue engines grew: net interest income $95.4B (+3.1%) and noninterest income $87.0B (+2.4%) → total net revenue $182.4B (+2.8%). Neither the spread book nor the fee franchise is carrying the other.
    - The machine deployed more of its funding: loans (net) +10.9% to $1,467.7B against deposits +6.4% to $2,559.3B — loans/deposits rose 55.0% → 57.3%, still conservatively deposit-rich.
    - Diluted shares −3.4% YoY while equity still grew +5.1% to $362.4B — distributions are working without eroding the capital base.
- Negative:
    - Provision for credit losses +33.1% to $14.2B; provision/net loans 0.8% → 1.0% — credit costs are normalizing off cycle lows.
    - Noninterest expense +4.2% ($95.6B) outran revenue +2.8%; efficiency ratio slipped 51.7% → 52.4%.
    - Net income −2.4% to $57.0B; ROE 17.0% → 15.7% (still strong, but the direction turned).
- Ambiguous:
    - Total assets +10.5% to $4,424.9B — added scale, but also potential G-SIB surcharge/capital pressure; capital ratios are not in the pull (explicit gap).
    - Baseline shows an 8-K Item 5.02 (2026-06-25, officer/director change) and a cluster of June–July 2026 Form 4s plus one Form 144 — unreviewed (routed in §11).
    - Continuous 424B2/FWP structured-note issuance (ten filings on 2026-07-31 alone) — routine holding-company funding for JPM, but volume worth tracking.

## 3. Financial health

**Bank lens first (§14).** JPM ran on the bank skeleton profile, so most generic §5 markers are suppressed **by design**, not missing by accident: net debt/EBITDA and EBIT/interest coverage (⚪) are meaningless when deposits and interest expense *are* the raw material; FCF conversion, capex, receivables, and inventory markers (⚪) do not map to a balance-sheet-driven lender. Their replacements are the §14 bank emphasis list: CET1, tangible common equity, deposit composition and cost, uninsured deposit share, NIM, NPLs, net charge-offs, allowance coverage, CRE concentration, and consent orders — of which the vault currently evidences only the deposit/loan aggregates and derived ratios below. Everything else is an explicit gap routed in §11.

**The one 🟡 — OCF vs earnings divergence — is a bank-accounting artifact, not an earnings-quality signal.** Bank operating cash flow is dominated by swings in trading assets/liabilities, loan origination, and deposit flows; JPM's FY2025 OCF was on the order of −$148B, which is why the bank facts profile deliberately omits OCF entirely. The correct earnings-quality test for a bank runs through provisioning adequacy (allowance roll-forward vs actual charge-offs), routed in §11 — not through the §5.3 working-capital lens the marker was built for.

Marker table: see [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_JPM]] — rollup 🟢 4 · 🟡 1 · 🔴 0 · ⚪ 6, `signal_status: clear`.

- Organic revenue: +2.8% to $182.4B, all organic (no FY2025 acquisition evidenced; First Republic was FY2023). NII +3.1%, fees +2.4% — balanced growth.
- Gross and operating margin: not meaningful for a bank → replaced by efficiency ratio 52.4% (worsened 70bp YoY, but still a strong absolute level for a universal bank) and pre-provision economics (revenue +2.8% vs expense +4.2% is the line to watch).
- FCF conversion: n/a by design (see artifact note above). Earnings quality instead rests on whether the $14.2B provision is keeping pace with actual credit formation — unverified until the allowance roll-forward is read (§11).
- ROIC and incremental returns: → ROE 15.7% (prior 17.0%), comfortably above any reasonable cost of equity; the decline is provision-driven, not revenue-driven.
- Debt and liquidity: §5.5 bands suppressed (§14). Replacements: loans/deposits 57.3% (deposit-funded, low reliance on wholesale funding for the loan book); CET1 ratio **not in vault** — well-established public record has JPM running comfortably above its requirement (~15% area in recent years), but treat as unverified until the FY2025 10-K capital section is read (gap). Uninsured-deposit share and deposit cost: gaps.
- Working capital: n/a — the bank analogue is deposit composition/stickiness, which is unevidenced (gap).

## 4. Operational health

- Customers and retention: deposit growth +6.4% at the largest US deposit franchise is the best retention proxy in the vault; household counts, branch trends, and complaint volumes not pulled (gap).
- Product and innovation: breadth is the moat — consumer banking, cards, payments, markets, securities services, asset & wealth management under one capital base (well-established segment structure). Segment revenue split not in the pull — verify in the FY2025 10-K segment note (gap).
- Employees and safety: no evidence in vault (gap — headcount, turnover, and conduct-training disclosures live in the 10-K/ESG report).
- Suppliers and capacity: not meaningful in the industrial sense; the analogue is technology spend and operational-resilience investment — well-established to be very large (mid-teens $B annually) but unverified here (gap).
- Sector-specific KPIs (§14 bank list): NIM, NPLs, net charge-offs, allowance coverage, CRE concentration, uninsured deposits — **none pulled yet**; all routed in §11. This is the biggest evidence hole in the review.
- Incentive-system risk (§11.3 lesson): Wells Fargo showed profitability does not prove the process behind a sales KPI is legitimate — incentive design is an operating risk in any mass-market bank. JPM has no documented systemic sales-practice scandal of that kind, but its retail incentive structures and complaint trends have not been reviewed (gap — DEF 14A incentive metrics + CFPB complaint database pass).

## 5. Stewardship and integrity

- Accounting quality: GAAP-first bank reporting; the XBRL gaps in the facts pull are tag-standardization noise, not opacity. Provision rising 33% while earnings dipped reads as forward-leaning loss recognition rather than reserve-release earnings management — verify via allowance roll-forward (§11).
- Disclosure quality: extensive quarterly earnings supplements and granular credit disclosure are long-standing practice (well-established).
- Capital allocation: buybacks shrank the share count 3.4% while equity still grew 5.1% — distributions are being funded from earnings, not capital erosion. Dividend has been raised repeatedly in recent years (well-established); current rate and FY2025 totals — verify in latest 8-K/10-K.
- Executive compensation: CEO pay in the high-$30M range in recent years; the 2022 say-on-pay vote failed (~31% support) over the 2021 special option award — a documented shareholder rebuke. Current structure and the 2026 vote outcome (8-K Item 5.07 filed 2026-05-21) — verify in DEF 14A.
- Board oversight: succession around the long-tenured CEO is the standing governance question; verify current succession disclosure in DEF 14A (gap).
- Customer and employee treatment: scale brings complaint volume; nothing open documented in vault. Needs the incentive/complaint pass from §4 (gap).
- Regulatory and legal record: well-established history of large *resolved* settlements — 2013 RMBS ($13B), 2020 precious-metals/Treasuries spoofing ($920M), 2023 Epstein-related settlements, 2024 trade-surveillance/recordkeeping fines. None is an open §7.3 hard-stop on vault evidence, but the recurrence pattern is a control-risk base rate. Open consent orders, if any — verify in the 10-K supervision & regulation and legal-proceedings sections.

## 6. Shareholder distribution

- Dividends: paid in all six fiscal years of the pull window (dividendsPaid series present); dollar totals not surfaced in the pull note (gap) — well-established as a substantial, growing common dividend. Dividend/FCF band is ⚪ by design (FCF undefined for banks); the correct test is payout vs organic capital generation — verify against the 10-K capital section.
- Gross buybacks: exceed issuance — 🟢 §5.6 marker.
- Net share-count change: −3.4% YoY (2.9B → 2.8B diluted weighted-average shares).
- Stock compensation: $3.6B = 2.0% of revenue — 🟢 modest; even after grants, the net count fell, so employees are not being paid with hidden dilution.
- Debt used for distributions: not evidenced; for a bank the binding constraint is CET1 headroom rather than debt capacity — equity grew +5.1% alongside the buyback, which argues distributions are not straining capital (CET1 verification still open, §11).

## 7. Market behavior

- Relative performance: +21.6% over 12 months vs XLF +10.8% (+10.8pp) — 🟢, within the normal band of the benchmark per the pull; the market is rewarding, not euphoric.
- Estimate revisions: **gap** — no estimates data in vault.
- Accumulation/distribution: **gap** — §9.3 volume/ownership pass not done.
- Insider activity: June–July 2026 Form 4 cluster + one Form 144 sit unreviewed in the baseline — unclassified (10b5-1 vs discretionary; routed in §11).
- Ownership concentration: **gap** — 13F/13G pass not done (top holders are well-established to be passive giants, but composition changes are the signal).
- Short interest: **gap** — not pulled.

## 8. Process-versus-outcome classification

- Process quality: **stable** — funding grew, both revenue engines grew, loans deployed prudently (57% loans/deposits); efficiency slipped 70bp and credit costs are normalizing, but nothing evidences process deterioration.
- Current outcome quality: **stable** — net income −2.4%, yet EPS roughly flat-to-up on the −3.4% share count; ROE 15.7% remains strong.
- Market response: **rewarding** — +10.8pp vs XLF, within normal range.
- Primary divergence: **none** — reality and market response are aligned.

### Divergence sentence (§17 Step 7)

> The company's operating process is `stable`, reported results are `stable`, and the market is pricing `more` future success because `fee breadth and a shrinking share count are expected to outrun normalizing credit costs — a modest, evidence-consistent premium rather than a divergence`.

## 9. Good-faith evidence

- Provisioned ahead of pain: credit-loss provision +33.1% to $14.2B while net income dipped — accepting a current-earnings cost to keep the balance sheet honest as the cycle normalizes (facts pull; adequacy still to be verified in §11).
- Distributions kept subordinate to balance-sheet strength: share count −3.4% *and* equity +5.1% in the same year — the buyback is funded by earnings, not capital release (facts pull).
- Compensation discipline visible in the dilution math: SBC held at 2.0% of revenue with net share count falling — employee pay is not being quietly shifted onto shareholders (health pull 🟢).
- Long-standing "fortress balance sheet" doctrine — consistent public posture across cycles (well-established; the FY2025 capital numbers that would prove it current remain a gap).

## 10. Extraction or bad-faith risk

- Expense growth (+4.2%) outran revenue (+2.8%) and the efficiency ratio drifted to 52.4% — benign in one year, but the classic early signature of scale being spent rather than compounded; watch the trend (facts pull).
- Incentive-system risk at retail scale (§11.3): sales KPIs can look healthy while the process harms customers — JPM's retail incentive design and complaint trends are unreviewed (gap, routed to DEF 14A + complaint data).
- Recurring conduct settlements across trading and controls (spoofing, surveillance, recordkeeping — all resolved) establish a base rate of control gaps at this scale; the question is whether remediation spend is shrinking the recurrence rate (well-established record; open orders unverified).
- Continuous structured-note issuance (424B2 stream) is legal, routine funding that also transfers complex payoff risk to yield-seeking buyers — extractive only at the margin, but volume and complaint trends are worth monitoring (baseline pull).

## 11. EDGAR follow-up

Routed with the §15 table; log meaningful changes as [[03_Templates/Intel_Finding]] notes.

| Filing | Section or exhibit | Finding | Possible meaning | Next investigation |
|---|---|---|---|---|
| FY2025 10-K (filed 2026-02-13) / Q2 2026 10-Q | Allowance for credit losses roll-forward; credit-quality tables | Provision +33.1%, provision/net loans 0.8%→1.0% | Macro-model reserve build (benign) vs actual NPL/charge-off formation (cycle turn) | Compare provision vs net charge-offs; NPL trend by portfolio |
| FY2025 10-K | Credit concentration disclosures; CRE/office exposure | §14 flags CRE concentration; unevidenced | Sizing of office/CRE book determines tail risk | Extract CRE balances, LTVs, criticized-loan trend |
| FY2025 10-K | Capital management; supervision & regulation | CET1, TCE, uninsured deposits, NIM all gaps | Confirms or breaks the "fortress" claim with current numbers | Pull CET1 vs requirement, uninsured-deposit share, deposit cost |
| 8-K 2026-06-25 (Item 5.02) | Officer/director change | Unreviewed personnel event | Succession-plan relevance | Identify who; cross-check DEF 14A succession language |
| Forms 4 (Jun–Jul 2026) + Form 144 (2026-07-21) | Insider transactions | Cluster of unclassified filings | Routine 10b5-1 vs discretionary selling | Classify plans; net insider position change |
| DEF 14A + 8-K 2026-05-21 (Item 5.07) | Compensation; vote results | Comp structure and say-on-pay support unverified since 2022 rebuke | Governance temperature check | Read incentive metrics (sales-practice sensitive ones especially) and vote percentages |

## 12. Score

§16 rubrics; four numbers copied into frontmatter. Gaps score conservatively — unverified strength is not credited.

| Block | Score | Max |
|---|---:|---:|
| Economic health | 31 | 40 |
| Stewardship and integrity | 30 | 40 |
| Market confirmation | 10 | 20 |
| **Total** | **71** | 100 |

- Economic health 31/40: revenue quality 7/8 (dual engines, both growing, deposit-funded); unit economics 6/8 (52.4% efficiency slipping but strong, 15.7% ROE); cash conversion/earnings quality 5/8 (bank OCF meaningless — quality rests on provisioning, which looks forward-leaning but is unverified); balance-sheet resilience 6/8 (deposit-rich at 57% loans/deposits; CET1/uninsured-deposit gaps cap the score); returns on capital 7/8 (ROE well above cost of equity, mildly declining).
- Stewardship 30/40: accounting transparency 6/8 (clean GAAP posture, allowance verification open); capital allocation 7/8 (buybacks + dividend funded by earnings, equity still grew); governance/compensation 5/8 (2022 say-on-pay rebuke, succession overhang, 2026 vote unverified); customer/employee treatment 5/8 (incentive-system and complaint pass not done; settlement base rate); strategic consistency 7/8 (fortress doctrine held across cycles).
- Market confirmation 10/20: relative price/estimates 4/5 (+10.8pp vs XLF evidenced; revisions gap); accumulation/ownership 2/5 (unpulled — cannot credit); valuation vs conservative economics 2/5 (well-established premium to book vs peers — priced for continued excellence); catalyst asymmetry 2/5 (expectations already high; limited upside surprise room).
- Red-flag override: **false** — no open §7.3 hard-stop events evidenced (historical settlements are resolved; nothing in the baseline window shows auditor disputes, restatements, or open fraud allegations).

Total 71/100 → "generally healthy with identifiable weaknesses" (§16 band 70–84): the weaknesses are mostly *evidence gaps* (capital, credit detail, ownership) rather than documented deterioration.

## 13. Falsifiable thesis

- Bull case: the deposit-spread-fee machine compounds book value at ~15% ROE while the share count shrinks ~3%/yr; credit normalization stays gradual (provision/net loans plateaus near 1.0%), and fee breadth cushions any NII pressure — mid-teens total-return arithmetic without heroic assumptions.
- Bear case: the credit cycle turns properly — provisions push toward 1.5%+ of net loans, charge-offs and NPLs inflect (CRE/consumer first), the efficiency ratio keeps drifting up, and a premium valuation de-rates toward peers; a disorderly CEO succession compounds the multiple risk.
- What would prove each wrong: **Bull broken** if provision/net loans exceeds ~1.5% annualized or ROE prints below ~12% for two consecutive years, or if the allowance roll-forward shows reserves chasing (not leading) charge-offs. **Bear broken** if provisions plateau near 1.0% with stable NPLs through FY2026 while ROE holds ≥15% and the share count keeps falling.
- Next checkpoint and date: **Q2 2026 10-Q** (last year's Q2 filed 2025-08-05; expect early August 2026) — credit pass: provision/net loans annualized stays ≤ ~1.2%, no sharp NPL/charge-off inflection, allowance coverage stable. Copied into `next_checkpoint` / `next_checkpoint_date` (2026-08-10).

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
