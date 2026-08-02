---
node_type: "health_review"
date: "2026-08-02"
company: "DEERE & CO"
ticker: "DE"
period: "FY ending 2025-11-02"
process_quality: "stable"
outcome_quality: "deteriorating"
market_response: "rewarding"
divergence_pattern: "good-company-bad-investment"
economic_health_score: 24
stewardship_score: 26
market_confirmation_score: 10
total_score: 60
red_flag_override: false
red_flags: []
next_checkpoint: "Q3 FY2026 10-Q: split Equipment Operations trade receivables vs John Deere Financial finance receivables (the CAT cross-check) with past-dues/write-offs/allowance direction, confirm the inventory build reverses against falling shipments, and pull precision-ag recurring-revenue disclosure plus right-to-repair legal-proceedings status"
next_checkpoint_date: "2026-09-04"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_DE]]"
price_at_review: 592.67
reconsider_price_low: 474.14
reconsider_price_high: 740.84
related_theses: []
tags: [health-review]
---

# Company Health & Integrity Review — DEERE & CO

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/DE - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker DE` — link the pull note into `markers_pull`.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

Deere designs and builds farm, turf, construction, and forestry equipment sold through an independent dealer network; finances those machines and dealer inventories through its captive arm (John Deere Financial); and increasingly sells precision-agriculture technology — guidance, connected-fleet software, agronomic subscriptions — into the installed fleet it has already created. Three machines in one: equipment manufacturer, captive lender, and an emerging per-acre software business.

Check vs. dossier `one_liner`: the dossier is still a scaffold with an **empty** `one_liner`. Seed it with the sentence above (all three clauses — the captive-finance and precision-ag clauses are where this review's open questions live) and start the evolution timeline. Same lesson as CAT: the captive arm must be in the barebones description or the receivable question is invisible.

## 2. What changed in the company machine?

Grounded in [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Facts_DE]] (FY2025 ending 2025-11-02 vs FY2024) and [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Baseline_DE]]. THE DE question is §2 evolution itself: is the machine shifting from cyclical hardware sales toward recurring software/technology revenue per acre — and is that shift visible in filings yet?

- Positive:
    - R&D held at $2.3B (+0.9%) while revenue fell 11.7% — R&D intensity rose from ~4.4% to ~5.0% of revenue. The evolution engine was protected through the trough, not harvested.
    - Operating cash flow $7.5B covered net income 148% (130% prior) — the downcycle is releasing working capital, the honest cyclical signature.
    - Cash $8.3B, +13.0%; diluted shares 271.7M, −1.9%; SBC just $151M (−27.4%, ~0.3% of revenue).
- Negative:
    - Revenue $45.7B, **−11.7%** ($51.7B prior) — the ag downcycle is fully in the reported numbers.
    - Net income $5.0B, **−29.2%**; FCF $6.1B vs $7.6B (−20%). Net margin 10.9% vs 13.7% — still double-digit at trough, but the compression is real.
    - Inventory $7.4B, **+4.4% against revenue −11.7%** — a ~16pp divergence vs sales direction. In a downcycle inventory should fall; route to §11 (new-product ramp vs channel fill vs underproduction ending).
- Ambiguous:
    - The recurring-revenue evolution is **not measurable from the pulls**: no deferred-revenue tag, no segment split, no engaged-acres or subscription figures in XBRL. Deere's stated ambition (roughly 10% of revenue recurring by 2030, per its 2022 investor-day "Leap Ambitions" — well-established, pre-cutoff) has no FY2025 evidence in the vault either way. This is the top item for the FY2025 10-K pass — until then the §2 answer is "machine unchanged, evolution claimed but unverified."
    - FY2025 operating income is an **explicit gap**: the facts skeleton's operating-income row is a stale XBRL tag (shows FY2024 $9.0B vs FY2023 $13.0B, −30.2%). Directionally consistent with net income, but pull the FY2025 figure from the 10-K income statement.
    - Capex $1.4B, −17.1% — modest counter-cyclical trim (capex only ~3% of revenue); growth-vs-maintenance mix needs MD&A.

## 3. Financial health

Marker table: [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_DE]] — rollup 🟢 7 · 🟡 0 · 🔴 0 · ⚪ 4, `signal_status: clear`. A fully clean sheet — but clean means **7 tests passed and 4 never ran**, not 11 passed. Interpreting why it is clean where CAT's isn't is the point of this review (theme 9, [[13_Company_Intel/Research Universe Map]]).

- Why the sheet is clean — three distinct reasons:
    1. **Cycle position.** CAT printed revenue +4.3% with operating income −14.7% and receivables +13.4pp over revenue — a mid/late-cycle divergence between reported growth and cash reality, which is exactly what §5.3 markers exist to catch. DE is deep in its ag downcycle: revenue −11.7% and net income −29.2% are already *in* the reported numbers. There is nothing for the earnings-vs-cash markers to flag because nothing is being presented as better than it is — the downturn compresses the space for presentation games, and working capital releases cash (OCF/NI 148%).
    2. **Measurement shadow.** The marker that turned CAT red — receivables growth vs revenue — is ⚪ n/a for DE: no current-receivables concept is tagged, because Deere's receivable book is dominated by John Deere Financial *finance* receivables that don't sit under the standard trade tag. **The CAT-flagging test was never run on DE.** Whether DE's captive book shows the same divergence as CAT's is unknowable from this pull — it is the single most important §11 item.
    3. **Distribution discipline is genuinely clean** on both twins (see §6) — that part of the clean sheet is real, not an artifact.
- Organic revenue: −11.7%. Price/volume/mix and dealer sell-through vs production split **not in the XBRL pull** — needs FY2025 MD&A. §5.1 band: cyclical contraction, not repeated structural decline — investigate, not concern.
- Gross and operating margin: gross margin ⚪ untagged; FY2025 operating margin an explicit gap (stale tag, §2). Computable proxy: net margin 10.9% at trough vs 13.7% prior — decremental but double-digit through a −11.7% revenue year. §5.2 question "what was bought with the lost margin" partly answers itself here: it is volume, plus protected R&D.
- FCF conversion: 🟢 five-year cumulative FCF/NI = **0.88** (band: >0.80 constructive); 🟢 OCF tracks earnings — both fell together, OCF −19.2% vs NI −29.2%, so conversion *improved* into the downturn. Direct contrast with CAT's 🟡 (earnings up, OCF down). DE's earnings quality at trough is the strongest single number in the pull.
- Receivables: ⚪ **explicit gap, not a pass** — see measurement shadow above. The CAT cross-check (does the ag twin's captive book show the same +13.4pp-style divergence?) cannot be answered until the 10-K splits Equipment Operations trade receivables from Financial Services finance receivables with allowance/past-due/write-off direction.
- Inventory: ⚪ n/a in the pull (cost-of-sales series is stale, ends FY2017 — divergence vs COGS not computable). But the raw facts allow a cruder test: inventory +4.4% while revenue fell 11.7% (~+16pp vs sales direction). §5.3 band would call that investigate. Benign reads: build ahead of a product ramp, or deliberate underproduction ending. Negative read: channel fill into weak retail demand. Route to §11.
- ROIC and incremental returns: **not computed in any pull — explicit gap.** Captive finance assets/debt must be segregated first or the number is meaningless (§5.4).
- Debt and liquidity: ⚪ both leverage markers n/a (period misalignment; LT-debt series stale at FY2021 $32.9B). What the baseline *does* evidence: a continuously running captive funding program — S-3ASR (2026-06-17) plus repeated 424B2/FWP note issuances (Jan 2025, Oct 2025, Jul 2026). Consolidated leverage will look enormous and mean little; the Equipment Ops vs Financial Services split is mandatory before any §5.5 judgment. Cash $8.3B (+13%).
- Working capital: net release consistent with OCF/NI 148%, except the inventory line above — confirm the bridge in the cash-flow statement.
- Dilution/SBC: 🟢 diluted shares −1.9%; 🟢 SBC/revenue 0.3% (remarkably low — cash-comp culture); 🟢 buybacks exceed issuance.
- 🟢 Dividend/FCF 28% (≈$1.7B on $6.1B FCF) — just under the §5.7 30–60% comfort band, conservative side.

## 4. Operational health

Per §14 industrials emphasis; evidenced vs needs-pulling kept explicit — no fabricated metrics.

- Customers and retention: dealer network + installed fleet is the retention engine; precision-ag subscriptions deepen it. Deere discloses an "engaged acres" metric for its connected platform in company materials — **current figures not in vault, pull from FY2025 10-K/MD&A**. Retention economics of the parts/service annuity intersect the right-to-repair question (§10).
- Product and innovation: R&D $2.3B held flat (+0.9%) through the trough, intensity up to ~5.0% of revenue — capability protected. Product-line specifics (See & Spray-style precision launches) not pulled.
- Employees and safety: no evidence in vault — needs 10-K human-capital section; no safety events in the 8-K timeline reviewed.
- Suppliers and capacity: capex trimmed −17.1% (to ~3% of revenue) — consistent with downcycle discipline; utilization/underproduction commentary needs MD&A. Deere has historically underproduced retail demand in downturns to protect the dealer channel — **reported practice; verify FY2025 production-vs-retail commentary in MD&A**.
- Sector-specific KPIs (§14 industrials):
    - **Dealer inventory:** the critical DE channel metric (independent dealers can absorb or amplify demand swings). New and used dealer inventory levels, especially large-ag — **not in vault; pull from MD&A/earnings 8-K exhibits** (2026-02-19 and 2026-05-21 earnings 8-Ks are on file, unopened).
    - **Order books / early-order programs:** ag equivalent of backlog (crop-care EOPs, combine order windows) — **explicit gap; pull from MD&A/earnings materials**.
    - **Book-to-bill / cancellation rates:** not derivable from vault data — explicit gap.
    - **Working capital:** covered in §3 — the inventory build against falling revenue is the open item.
    - **Warranty reserves:** trend not pulled — 10-K warranty footnote.
    - **Aftermarket/parts mix:** not disclosed in pulls — MD&A pass; central to the right-to-repair economics.
    - **Pension and environmental obligations:** long-dated; status not pulled — 10-K footnotes.
    - **Ag-cycle position:** farmer income, crop prices, and used-equipment values drive the cycle — macro layer, not in the EDGAR pulls; link through [[Recession]] / commodity notes when the transmission layer covers ag.

## 5. Stewardship and integrity

Well-established facts only; everything else routed to filings.

- Accounting quality: OCF/NI above 100% in both years and 0.88 cumulative over five — reported earnings are cash-backed through the cycle. XBRL hygiene is poor (stale operating-income and LT-debt tags, COGS series ends 2017, no current-receivables concept, and the facts pull's entity name reads "DEERE FUNDING CANADA Corp" — a funding-subsidiary co-registrant artifact under Deere's CIK). These look like legacy-filer/captive-structure artifacts, not concealment — but they blind exactly the markers that caught CAT, so verify against the actual statements rather than treating clean-by-default as clean.
- Disclosure quality: four reportable segments (Production & Precision Ag, Small Ag & Turf, Construction & Forestry, Financial Services) — long-standing structure; no evidence of redefinition to obscure deterioration. Non-GAAP exclusion history: not reviewed — build the five-year reconciliation.
- Capital allocation: through a −11.7% revenue year Deere held R&D flat, trimmed capex modestly, kept the dividend at 28% of FCF, shrank net share count 1.9%, and still grew cash 13%. No lever overworked; the trough was not used as an excuse to harvest.
- Executive compensation: not reviewed — **verify in DEF 14A (filed 2026-01-14)**: metrics, vesting, downside, and whether precision-ag/recurring targets appear in incentive design (they should, if the §2 evolution is real).
- Board oversight: composition and independence — DEF 14A. **Four Item 5.02 8-Ks in 2026** (2026-01-20, 2026-03-12, 2026-04-28, 2026-05-26) plus a Form 3 (2026-05-01) indicate officer/director changes — all unopened; see §11. Annual-meeting vote results (5.07, 2026-02-25) unopened.
- Customer and employee treatment: the live issue is right-to-repair (§10) — a genuine, documented customer-treatment dispute, handled factually there. Dealer treatment (inventory terms, buyback support) not evidenced either way.
- Regulatory and legal record: no §7.3 hard-stop events documented in the pulls or 8-K timeline (no restatement, auditor dispute, going-concern, covenant breach, or safety failure). The right-to-repair litigation (§10) is a §12-class extraction dispute, not a §7.3 hard stop — `red_flag_override` stays false. Legal-proceedings footnote status **must be pulled** with the 10-K pass. Dividend record: long unbroken payment history — a durable stewardship signal; **verify the exact streak in the FY2025 10-K/DEF 14A**.

## 6. Shareholder distribution

- Dividends: 🟢 28% of FCF (≈$1.7B implied on $6.1B FCF) — conservative side of the §5.7 band, sized to survive the trough.
- Gross buybacks: dollar amount not quoted in the pulls — pull from cash-flow statement. Direction evidenced: buybacks exceeded issuance.
- Net share-count change: 🟢 −1.9% YoY (271.7M vs 277.1M diluted) — genuine shrinkage, sustained through a down year.
- Stock compensation: $151M, ~0.3% of revenue and falling (−27.4%) — dilution cost is negligible; the buyback is a real return, not grant laundering.
- Debt used for distributions: unverifiable this pass — the continuous 424B2/S-3 issuance cadence is captive funding by design, but **verify in the cash-flow statement and debt note** that Equipment Operations FCF covered dividends plus buybacks without parent-level borrowing.

## 7. Market behavior

- Relative performance: 🟢 12-month return **+18.3% vs XLI +20.1% (−1.8pp)** — in line with the sector. The cross-reading with CAT is the finding: the ag twin with the same dealer-channel + captive model gets **no premium**, while CAT runs +70pp over XLI into falling operating income. The market is differentiating the two cycles, not bidding the industrial complex indiscriminately — which makes CAT's premium look idiosyncratic (sharpening CAT's Pattern-C risk) and makes DE's pricing look like sector beta. But note the second-order point: +18.3% absolute during a −29.2% net-income year is still multiple expansion — the market is pricing DE's FY2025 as the trough.
- Estimate revisions: **explicit gap** — no estimate data in vault; needed to confirm the "trough is priced" read.
- Accumulation/distribution: **explicit gap** — §9.3 volume/ownership pass not done.
- Insider activity: nine Forms 4 clustered 2026-03-04/05 (consistent with annual grant timing) plus 2026-01-14 and 2026-05-01 filings — buy/sell direction unopened; **verify by opening the forms**.
- Ownership concentration: only stale 13G/A history (2024-02 and earlier) in the baseline; 13F trend not pulled — gap.
- Short interest: **explicit gap** — not pulled.

## 8. Process-versus-outcome classification

- Process quality: **stable** — the machine is intact and protected (R&D flat through the trough, dealer/captive structure unchanged, distributions disciplined); the claimed hardware→software evolution would be *improving*, but it is not yet evidenced in filings.
- Current outcome quality: **deteriorating** — revenue −11.7%, net income −29.2%, FCF −20% (cyclical, honestly reported, but deteriorating is deteriorating).
- Market response: **rewarding** — +18.3% absolute against a −29% earnings year (in line with a strong sector; mild reward, not CAT-style exuberance).
- Primary divergence: results down, price up → §13 Pattern C in attenuated form: the recovery is already in the price, and the two facts that would validate it (captive-book cleanliness, recurring-revenue traction) are both unverified. What Pattern C demands next: run the receivable test that the XBRL gap skipped, and price-check expectations against trough economics.

### Divergence sentence (§17 Step 7)

> The company's operating process is `stable`, reported results are `deteriorating`, and the market is pricing `more` future success because `an +18.3% 12-month return (−1.8pp vs XLI) coincided with revenue −11.7% and net income −29.2%, implying investors treat FY2025 as the ag-cycle trough and have pre-paid the recovery — a milder version of CAT's Pattern C, with the decisive captive-receivable evidence still unpulled on both twins`.

## 9. Good-faith evidence

- R&D held at $2.3B (+0.9%) through a −11.7% revenue year — intensity rose to ~5% of revenue; the future-facing capability was funded with present margin.
- Dividend kept at a conservative 28% of FCF rather than stretched to defend the yield narrative through the trough.
- Honest dilution math: net share count −1.9% with SBC at 0.3% of revenue — distributions are real cash returns.
- Cash built, not spent: +13% to $8.3B during the compression year.
- Cash conversion above 100% of net income at the bottom of the cycle — earnings understated cash, not the reverse.
- (To verify: continued underproduction vs retail demand to protect dealer health — reported past practice; confirm FY2025 MD&A commentary.)

## 10. Extraction or bad-faith risk

- **Right-to-repair (factual record, §12 extraction-risk debate):** Deere's parts-and-service annuity and its software-gated diagnostics sit at the center of a live, documented dispute. Well-established, pre-cutoff facts: farmer class actions over repair restrictions were consolidated in federal court (N.D. Ill.) and survived dismissal (2023); Deere signed a memorandum of understanding with the American Farm Bureau Federation (Jan 2023) committing to repair-tool access; Colorado enacted the first agricultural right-to-repair law (2023); and in January 2025 the FTC, joined by state attorneys general, sued Deere alleging unlawful repair restrictions that raise farmers' costs — Deere disputes the claims. The economic frame, stated neutrally: if regulators/courts force open repair access, part of the installed-base service margin and the precision-ag lock-in weakens; if Deere's own tools and subscriptions satisfy the demands, the effect may be minimal. **Litigation status after early 2026 is not in vault — explicit gap; route to the FY2025 10-K legal-proceedings note and 2026 10-Qs.**
- **Captive finance opacity:** identical structural risk to CAT — consolidation lets John Deere Financial's credit quality (past-dues, write-offs, allowance adequacy, used-equipment residuals) blur into one balance sheet, and a captive can quietly absorb end-market weakness by financing it. For DE this is compounded by the measurement shadow: the receivable marker never ran. Unresolved until the segment split is pulled (§11).
- **Inventory +4.4% against revenue −11.7%:** if the FY2025 10-K shows channel fill rather than product-ramp build, revenue quality in the next upcycle is being borrowed from.
- **Platform dependency:** the same precision-ag subscriptions that create recurring revenue also deepen farmer switching costs and data dependency — the asset and the §12 risk are one thing; watch pricing behavior on captive customers.
- Measurement gaps as risk: operating income, gross margin, receivables, current leverage all untagged/stale this pass — open items, not zeros.

## 11. EDGAR follow-up

Routed per §15; log meaningful changes as Intel Findings. Top routing: **revenue/receivable quality → segment and receivables notes** — the segment split (Equipment Operations vs Financial Services) unlocks four open questions at once.

- Filing: **FY2025 10-K** (filed 2025-12-18) — [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Baseline_DE|baseline]]
    - Section or exhibit: segment footnote (Production & Precision Ag / Small Ag & Turf / Construction & Forestry / Financial Services) + finance-receivables note with allowance roll-forward, past-dues, write-offs + inventory note + legal proceedings.
    - Finding: receivables marker ⚪ (never ran); inventory +4.4% vs revenue −11.7%; FY2025 operating income and leverage stale/untagged.
    - Possible meaning: captive book clean (validating the twin-vs-CAT contrast) vs the same stress CAT's 🔴 flagged, hidden by a tag gap.
    - Next investigation: compute receivable divergence separately on Equipment Ops trade receivables and JD Financial finance receivables — the direct CAT cross-check; pull FY2025 operating margin, gross margin, segment leverage; read right-to-repair status in legal proceedings.
- Filing: **Q2 FY2026 10-Q (filed 2026-05-28)** and **Q3 FY2026 10-Q (expected ~2026-08-27; prior-year Q3 filed 2025-08-28)**.
    - Section or exhibit: cash-flow statement working-capital detail; inventory line; finance-receivables credit-quality tables; any recurring-revenue/precision-ag disclosure.
    - Finding: inventory build against falling revenue; recurring-revenue evolution unverified (§2).
    - Possible meaning: trough working-capital normalization vs channel fill; software shift real vs narrative.
    - Next investigation: confirm inventory reverses within two quarters; extract engaged-acres/subscription metrics if disclosed; check whether FY2026 interim results confirm the trough the market has priced.
- Filing: **DEF 14A (2026-01-14)** + **5.02 8-Ks (2026-01-20, 2026-03-12, 2026-04-28, 2026-05-26)** + **8-K 2026-07-15 (Item 8.01)** + Forms 3/4.
    - Section or exhibit: compensation design (do recurring-revenue targets appear?), board changes behind the four 5.02s, the unopened 8.01 event, insider transaction direction; earnings 8-Ks (2026-02-19, 2026-05-21) for dealer-inventory and order-book commentary (§4 gaps).
    - Finding: stewardship sections above are largely unverified; leadership-change cluster unexplained.
    - Possible meaning: n/a — verification pass.
    - Next investigation: complete §5/§7 manual passes; log any officer changes as Intel Findings.

## 12. Score

§16 rubrics; one-line justification per category. Copied to frontmatter.

| Block | Score | Max |
|---|---:|---:|
| Economic health | 24 | 40 |
| Stewardship and integrity | 26 | 40 |
| Market confirmation | 10 | 20 |
| **Total** | **60** | 100 |

- Economic health 24/40: revenue/demand 4/8 (−11.7%, cyclical and honestly reported, but mix/dealer-channel unverified and inventory building); margins 5/8 (net margin 10.9% at trough is resilient; operating/gross margin explicit gaps); cash conversion 6/8 (0.88 five-year, OCF/NI 148% — but the receivable test never ran); balance sheet 5/8 ($8.3B cash, conservative payout; leverage/coverage gaps and captive blur); returns on capital 4/8 (ROIC not computed — gap scored, not assumed).
- Stewardship 26/40: accounting transparency 5/8 (cash-backed earnings; poor XBRL hygiene blinds key markers — verify); capital allocation 7/8 (R&D protected through the trough, 28% payout, real share shrink, negligible SBC); governance/comp 4/8 (DEF 14A unread, four unexplained 5.02s); stakeholder treatment 4/8 (live right-to-repair dispute vs AFBF MOU — genuinely contested, unresolved); strategic consistency 6/8 (stable segments, consistent precision-ag strategy, long dividend record to verify).
- Market confirmation 10/20: relative price 3/5 (in line with XLI; no estimate data to test the trough-priced read); accumulation/ownership 2/5 (gap); valuation vs conservative economics 2/5 (no valuation work; +18.3% into −29% earnings means the recovery is pre-paid); catalyst asymmetry 3/5 (trough optionality exists, but the easy part of the re-rating already happened).
- Red-flag override: **false** — no §7.3 hard-stop events documented (the right-to-repair litigation is a §12 extraction dispute, not a hard stop). Score is provisional on the §11 verification passes, above all the receivable split.

Total 60 = §16 band 55–69: *mixed; thesis depends on specific repairs or underappreciated strengths* — here, on the captive book proving clean when finally measured, inventory reversing, and the recurring-revenue evolution showing up in disclosed numbers.

## 13. Falsifiable thesis

- Bull case: an honestly reported ag-cycle trough — cash conversion >100% at the bottom, R&D protected, distributions conservative — with a genuine machine evolution underneath: precision-ag recurring revenue raises mid-cycle margins and dampens the next downturn, so today's price is a fair multiple on trough earnings. On theme 9 ([[13_Company_Intel/Research Universe Map]]): the twin experiment already shows the market treats CAT's premium as CAT-specific, so DE carries no crowding premium to unwind.
- Bear case: the recovery is pre-paid (+18.3% into −29% earnings) while the two validating facts are unverified — the finance book, once split, shows CAT-style receivable stress (captive absorbing end-market weakness across the whole dealer-channel model, not just at CAT); the inventory build was channel fill; the ag downcycle runs longer than priced; and right-to-repair outcomes clip the aftermarket annuity that funds the software transition.
- What would prove each wrong: **Bull wrong** if the 10-K/10-Q split shows finance-receivable past-dues/write-offs rising with a shrinking allowance, inventory still building against falling shipments, recurring/precision-ag metrics stalling or vanishing from disclosure, or an adverse right-to-repair ruling with quantified remedies. **Bear wrong** if the split shows stable captive credit metrics (invalidating the cycle-wide read of CAT's flag — theme 9 resolved toward "CAT-specific"), the inventory build reverses within two quarters, early-order/dealer-inventory commentary normalizes, and FY2026 interim margins hold at or above trough.
- Next checkpoint and date: **Q3 FY2026 10-Q (expected ~2026-08-27; review by 2026-09-04)** — (1) Equipment Ops trade vs JD Financial finance receivable split with allowance/past-due direction (the CAT cross-check), (2) inventory vs shipments direction, (3) precision-ag/recurring-revenue disclosure, (4) right-to-repair legal-proceedings status. Copied into `next_checkpoint` / `next_checkpoint_date`.

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
