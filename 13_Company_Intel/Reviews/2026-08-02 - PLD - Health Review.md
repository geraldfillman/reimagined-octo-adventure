---
node_type: "health_review"
date: "2026-08-02"
company: "Prologis"
ticker: "PLD"
period: "FY ending 2025-12-31"
process_quality: "stable"
outcome_quality: "stable"
market_response: "rewarding"
divergence_pattern: "good-company-bad-investment"
economic_health_score: 28
stewardship_score: 28
market_confirmation_score: 10
total_score: 66
red_flag_override: false
red_flags: []
next_checkpoint: "Q3 2026 10-Q: occupancy holds vs Q2 2026 baseline and same-property NOI growth stays positive; dividend covered by AFFO per the reconciliation"
next_checkpoint_date: "2026-10-30"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_PLD]]"
price_at_review: 144.61
reconsider_price_low: 115.69
reconsider_price_high: 180.76
related_theses: []
tags: [health-review]
---

# Company Health & Integrity Review — Prologis

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/PLD - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker PLD` — link the pull note into `markers_pull`.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

Prologis owns ~$80.4B (net) of warehouses on the doorsteps of major cities and ports, collects rent from the companies that move goods through them, and recycles that rent — plus recurring debt and equity issuance — into developing and buying more warehouses.

Check vs. dossier `one_liner` ("Owns warehouses near cities and ports and rents them to companies that move goods"): **unchanged** — same machine, no dossier evolution-timeline update needed.

## 2. What changed in the company machine?

Grounded in [[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Facts_PLD]] and [[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Baseline_PLD]] (FY2025 vs FY2024):

- Positive: revenue +7.2% to $8.8B on an essentially flat share count (+0.3% diluted); operating cash flow +2.0% to $5.0B; SBC cut 20% to $185.5M (2.1% of revenue); external growth throttled back in a higher-rate tape — development spend −13.3% to $2.8B, property acquisitions −22.6% to $1.8B.
- Negative: long-term debt +13.5% to $35.0B (35.5% of total assets, up from 32.4%) with a steady stream of Item 2.03 debt 8-Ks through Mar–Jun 2026; interest expense +16.0% to $1.0B — funding cost growing faster than revenue; cash down 13.1% to $1.1B; disposition proceeds −40.7% to $2.2B, so the self-funding recycling engine slowed.
- Ambiguous: GAAP net income −10.8% to $3.3B — for a REIT this is likely lower gains-on-sale (dispositions fell 40.7%) plus the fixed $2.6B D&A charge, not operating decay; verify the gains line in the FY2025 10-K. Officer/director change (8-K Item 5.02 filed 2026-07-01, Form 3 on 2026-07-07) — identity and role not yet pulled.

## 3. Financial health

Marker table: [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_PLD]] — rollup 🟢 3 · 🟡 1 · 🔴 0 · ⚪ 7 (REIT profile). Every marker below is read through the §14 REIT lens: **net income systematically understates REIT cash economics** because $2.6B/yr of depreciation runs through the P&L against assets that are largely holding or gaining value — judge PLD on FFO/AFFO and OCF, not GAAP earnings.

- Organic revenue: +7.2% to $8.8B, essentially all rental (no acquisition step-change visible in the facts note — real estate net grew only 2.4%). Durability rests on occupancy and in-place lease escalators, neither of which is in the XBRL pull — needs the 10-K MD&A/supplemental.
- Gross and operating margin: operating income flat at $4.4B, so operating margin slipped roughly four points (~54% → ~50% on rounded figures) as revenue grew against flat operating income. Interest expense (+16.0% to $1.0B) sits below that line but is a core operating cost for a REIT (§14) — the real squeeze is there.
- FCF conversion: ⚪ not computable — capex concept not tagged in XBRL (0 years of coverage). The meaningful REIT version is OCF minus *recurring maintenance* capex, which needs the supplemental. What is evidenced: OCF/NI of 150.5% (prior 131.6%) — cash runs well ahead of earnings, exactly the depreciation artifact expected here.
- OCF-vs-earnings 🟡 (honest read): the band flags "1 yr divergent," but the direction is **cash-favorable** — net income fell 10.8% while OCF *rose* 2.0%. The generic band text ("earnings rose while operating cash fell") does not match PLD's actuals. Most plausible cause is a GAAP artifact: disposition gains dropped with the −40.7% fall in sale proceeds, dragging NI while rents kept OCF steady. Not an earnings-quality concern on this evidence; confirm the gains-on-sale line in the FY2025 10-K cash-flow statement before closing the flag.
- FFO proxy: $6.0B (NI + D&A) vs $6.3B prior — a ~5% dip, **but the proxy is not gain-adjusted**; FY2024's heavier dispositions likely inflated the prior-year figure, so NAREIT-defined FFO may be flat-to-up. Route to the 10-K/supplemental FFO reconciliation before treating the dip as real.
- ROIC and incremental returns: not computable from this pull; for PLD the incremental-return question is development stabilized yield vs. the marginal cost of the new debt (interest expense +16%). Needs the development-portfolio table in the supplemental.
- Debt and liquidity: §5.5 net-debt/EBITDA and interest-coverage bands are **suppressed by design** for REIT filers (§14) — the ⚪ rows are not gaps in PLD, they are the framework refusing a category error. What is evidenced: LT debt $35.0B (+13.5%), 35.5% of assets (from 32.4%), cash $1.1B (−13.1%). The right metrics — net debt/EBITDAre, secured-vs-unsecured mix, maturity ladder — need the debt footnote (§11).
- Working capital: receivables and inventory not tagged (⚪) and largely meaningless for a landlord; no working-capital red flags are computable or expected.

## 4. Operational health

§14 REIT emphasis list — most of these live in the supplemental/MD&A, not XBRL, so this section is mainly a map of what is evidenced vs. what needs pulling. **No metrics fabricated.**

- Customers and retention: tenant retention rate and top-customer table **not evidenced** — pull from FY2025 10-K customer-concentration disclosure and quarterly supplemental.
- Product and innovation: the "product" is location + building spec; ancillary lines (Prologis Essentials, solar/energy) are long-established parts of the story but their current scale is **not evidenced** here — verify in the 10-K business section before crediting them.
- Employees and safety: nothing evidenced either way; no adverse 8-K items in the 2026 stream.
- Suppliers and capacity: capacity = land bank and development pipeline; evidenced only at the cash-flow level — development spend $2.8B (−13.3%), i.e. the pipeline is being moderated, not expanded. Starts/stabilizations volume needs the supplemental.
- Sector-specific KPIs (§14 REIT list, status):
    - Occupancy: **needs pulling** (10-K MD&A / supplemental) — this is the single most important durability number for the +7.2% revenue line.
    - Same-property NOI: **needs pulling** — the clean organic-growth measure; nothing in XBRL.
    - Lease expirations: **needs pulling** — 10-K lease-expiration schedule; determines how fast market rents mark through.
    - Tenant concentration: **needs pulling** — 10-K concentration note.
    - Development pipeline: partially evidenced — $2.8B spend (−13.3%) and acquisitions $1.8B (−22.6%) show deliberate throttling; stabilized yields needed to judge quality.
    - Rent coverage / recurring maintenance capex: **needs pulling** — capex untagged in XBRL.

## 5. Stewardship and integrity

Well-established facts and filed documents only; everything else routed to the DEF 14A (filed 2026-03-19, meeting held 2026-04-28).

- Accounting quality: no §7.3-class events in the baseline window — the 2026 8-K stream shows Items 2.02/2.03/5.02/5.07/7.01/8.01/9.01 only; no 4.01/4.02 (auditor change/non-reliance), no restatement. The NI-vs-OCF gap is explained by REIT depreciation mechanics, not aggressive recognition, on current evidence.
- Disclosure quality: Prologis is a long-standing publisher of quarterly supplementals with NAREIT FFO / Core FFO / AFFO reconciliations — the disclosure infrastructure for judging a REIT properly exists. **Verify** in the FY2025 10-K/supplemental that Core FFO/AFFO definitions and exclusions have not widened year-over-year (§8 rising-exclusions route).
- Capital allocation: evidenced discipline — both external-growth levers were cut (development −13.3%, acquisitions −22.6%) as debt got more expensive, rather than chasing volume; dispositions slowed too (−40.7%), so net investment held up modestly (real estate net +2.4%). The open question is whether new debt ($4.1B added) funded assets or distributions — needs sources/uses in the 10-K.
- Executive compensation: not reviewed — **verify in DEF 14A** (metrics, FFO-based targets vs. TSR, dilution from equity plans).
- Board oversight: annual meeting held 2026-04-28 (Item 5.07 8-K); vote results not reviewed. Officer/director change 8-K (2026-07-01) plus 8-K/A (2026-04-01, re 2025-09-18 event) need a read — amendments to 5.02 filings are worth a look on principle.
- Customer and employee treatment: no adverse evidence in the filing stream; nothing affirmative verified either.
- Regulatory and legal record: no legal-proceedings or regulatory 8-K items in the 2026 window reviewed; standing record **verify in 10-K legal-proceedings note**.

## 6. Shareholder distribution

REIT lens (§14): payout must be judged against **FFO/AFFO, not net income or plain FCF** — depreciation makes net income systematically understate distributable cash, so a "dividend > earnings" screen would false-alarm on almost every healthy REIT, PLD included.

- Dividends: paid in every FY 2020–2025 (six-year `dividendsPaid` series present), but the FY2025 dollar amount was not surfaced in the pull and the health note could not compute a payout band (capex untagged). **Dividend-vs-AFFO coverage: needs AFFO pull** from the 10-K/supplemental reconciliation — this is the top follow-up in §11.
- Gross buybacks: none in the latest fiscal year (⚪, zero years of buyback series) — normal for a REIT, where the ~90% taxable-income distribution requirement leaves little retained cash for repurchases.
- Net share-count change: +0.3% diluted (956.8M vs 953.6M) — 🟢, dilution below 1%. Note the standing S-3ASR shelf (filed 2025-08-15): recurring equity issuance is a **funding mechanic, not a warning sign, for a REIT** — external growth must be financed with equity and debt since payout rules prevent retention. The integrity test is issuance price vs. NAV, not issuance itself.
- Stock compensation: $185.5M, 2.1% of revenue (🟢), down 20% YoY — modest and shrinking.
- Debt used for distributions: not attributable from this pull — LT debt rose $4.1B while dividends continued, but development ($2.8B) plus acquisitions ($1.8B) more than account for the raise. Needs the full sources-and-uses picture in the 10-K cash-flow statement before flagging.

## 7. Market behavior

Stock behavior is evidence about expectations and ownership, not proof of business quality (§9). Only one marker is computed; the rest are explicit gaps.

- Relative performance: 🟢 +37.8% twelve-month return vs XLRE +9.2% (+28.7pp) — the market is decisively rewarding PLD relative to its sector benchmark, well ahead of anything the evidenced cash economics (OCF +2.0%, FFO proxy ~flat) accelerated by.
- Estimate revisions: **gap — not pulled.**
- Accumulation/distribution: **gap** — §9.3 volume/ownership manual pass not done.
- Insider activity: July 2026 cluster of Forms 4 (2026-07-02 and 2026-07-14/16) plus one Form 144 (2026-07-16) — timing is consistent with a routine grant/vesting cycle, and a Form 3 (2026-07-07) matches the new-officer 8-K, but **direction and size need a manual read** before drawing any conclusion.
- Ownership concentration: **gap** — most recent 13G/A on file is from Feb 2024 (stale); 13F trend not pulled. Expect heavy passive ownership typical of a mega-cap REIT, but verify.
- Short interest: **gap — not pulled.**

## 8. Process-versus-outcome classification

- Process quality: **stable** — same machine, disciplined capital deployment (development and acquisitions both cut), dilution and SBC controlled; leverage creep (35.5% of assets, interest +16%) keeps it from "improving."
- Current outcome quality: **stable** — GAAP net income −10.8% is a depreciation/disposition artifact; the cash reality is OCF +2.0%, FFO proxy roughly flat, revenue +7.2%.
- Market response: **rewarding** — +28.7pp over XLRE in twelve months.
- Primary divergence: a strongly rewarding market against flat evidenced cash economics — Pattern C territory (§13: "good company, bad investment"), where the price may already embed years of future rent growth. **Provisional**: valuation, estimates, and ownership data have not been pulled, so this is the pattern to investigate, not a verdict.

### Divergence sentence (§17 Step 7)

> **The company's operating process is `stable`, reported results are `stable` (the GAAP earnings decline is a REIT depreciation-and-disposition artifact, not cash deterioration), and the market is pricing `more` future success because `a +37.8% twelve-month return against XLRE's +9.2% is not explained by any acceleration in the evidenced cash economics — the premium rests on rent mark-to-market and development value that this review has not yet verified`.**

## 9. Good-faith evidence

- Throttled external growth instead of chasing volume: development spend −13.3% and acquisitions −22.6% in FY2025 while interest expense rose 16% — accepting slower near-term growth optics to protect returns on new capital.
- Cut stock compensation 20% to $185.5M (2.1% of revenue) and held net dilution to +0.3% — owner costs actively managed down, not excused.
- No debt-funded buybacks or repurchase gimmicks: zero buybacks in the latest FY; distributions kept plain-vanilla dividends through all six years of the series.

## 10. Extraction or bad-faith risk

- Leverage creep: LT debt/total assets 35.5% from 32.4%, interest expense +16.0% vs revenue +7.2% — funding cost compounding faster than the top line, with a steady 2026 cadence of Item 2.03 debt 8-Ks (2026-03-31, 04-23, 04-27, 06-11). Not extraction yet, but the direction shifts risk onto future refinancing windows.
- Non-GAAP definition risk: the FFO proxy here is not gain-adjusted, and REIT "Core FFO"-style measures can quietly widen their exclusions — verify PLD's reconciliation year-over-year before trusting headline FFO (§8 rising-exclusions route).
- Recycling engine slowdown: disposition proceeds −40.7% to $2.2B reduces self-funding and increases dependence on debt and equity markets — the standing S-3ASR shelf becomes extractive only if equity is issued below NAV; issuance pricing needs watching.

## 11. EDGAR follow-up

Routed with the §15 table. Two primary routes plus one governance follow-up:

**Route 1 — Payout coverage (from §6 gap):**
- Filing: FY2025 10-K (filed 2026-02-13) and the Q2 2026 earnings 8-K exhibits (2026-07-16, Items 2.02/7.01) / quarterly supplemental.
- Section or exhibit: non-GAAP FFO / Core FFO / AFFO reconciliation.
- Finding: dividend paid every year but payout unmeasurable from XBRL (capex untagged; FFO proxy not gain-adjusted).
- Possible meaning: benign — payout likely covered — but unverified; also tests whether exclusions widened (§8).
- Next investigation: compute dividend/AFFO and a five-year exclusion history; log as an Intel Finding if definitions moved.

**Route 2 — Leverage mix (from §3 debt row; §5.5 bands suppressed per §14):**
- Filing: FY2025 10-K debt footnote + Q2 2026 10-Q (filed 2026-07-29); the 2026 Item 2.03 8-Ks for terms of new issues.
- Section or exhibit: debt note — maturity ladder, secured vs unsecured split, fixed/floating, covenants; supplemental for net debt/EBITDAre.
- Finding: LT debt +13.5% to $35.0B and interest expense +16.0%.
- Possible meaning: routine term-funding of the development pipeline, or gradual balance-sheet thinning — the secured/unsecured mix and ladder decide which.
- Next investigation: pull net debt/EBITDAre trend and weighted-average rate/maturity; compare against the 2.03 8-K terms.

**Route 3 — Officer change:** 8-K Item 5.02 (2026-07-01) + 8-K/A (2026-04-01) → identify role, read the DEF 14A ownership/comp tables, check the 2026-07-07 Form 3.

## 12. Score

§16 rubrics. Unevidenced categories are scored mid-band or below rather than guessed up — explicit gaps over fabricated credit.

| Block | Score | Max |
|---|---:|---:|
| Economic health | 28 | 40 |
| Stewardship and integrity | 28 | 40 |
| Market confirmation | 10 | 20 |
| **Total** | **66** | 100 |

Line justifications:

- Economic health 28/40 — revenue/demand quality 6/8 (rental +7.2%, durable lease base, but occupancy unverified); unit economics 6/8 (~50% operating margin, slipping ~4pp, interest squeeze below the line); cash conversion 6/8 (OCF/NI 150.5%, cash-favorable 🟡, but FCF/AFFO uncomputable); balance-sheet resilience 5/8 (debt/assets 35.5% and rising, cash $1.1B, mix/ladder unpulled); returns on capital 5/8 (development discipline visible, stabilized yields unverified).
- Stewardship 28/40 — accounting transparency 6/8 (clean 8-K stream, no 4.01/4.02; reconciliation drift unverified); capital allocation 6/8 (throttled external growth, plain dividends; sources/uses of new debt open); governance/comp 5/8 (proxy filed but unreviewed); customer/employee/supplier treatment 5/8 (no adverse evidence, nothing affirmative); strategic consistency 6/8 (one-liner unchanged, same machine for six years of series).
- Market confirmation 10/20 — relative price/estimates 4/5 (+28.7pp vs XLRE, estimates unpulled); accumulation/ownership 2/5 (gap); valuation vs conservative economics 2/5 (gap — and the reason the pattern is provisional); catalyst asymmetry 2/5 (gap).

Total 66 → interpretation band 55–69: **mixed** — here driven by unpulled evidence (occupancy, AFFO, valuation) rather than observed deterioration; the score should move on the §11 pulls, not on new business events.

- Red-flag override: **false** — no §7.3 hard-stop events documented (no fraud allegation, going-concern language, auditor dispute, restatement, covenant breach, or safety failure in the FY2025 10-K window or 2026 8-K stream reviewed).

## 13. Falsifiable thesis

- Bull case: occupancy and in-place rent mark-to-market keep same-property NOI growing while the throttled development pipeline ($2.8B, −13.3%) stabilizes at yields above the marginal cost of the new debt — AFFO grows, covers the dividend with room, and the 35.5% debt/assets ratio flattens out.
- Bear case: occupancy slips and lease roll-downs turn same-property NOI flat-to-negative while interest expense (already +16.0% in FY2025) keeps compounding through refinancings; AFFO stagnates, payout coverage tightens, and equity must be issued into a weakening NAV — the +37.8% stock run then rested on rent growth that never materialized.
- What would prove each wrong: the bull breaks on a reported occupancy decline or negative same-property NOI print in a 2026 10-Q, or a dividend/AFFO ratio near or above 100% in the reconciliation; the bear breaks on positive same-property NOI with stable occupancy plus an AFFO payout comfortably under coverage and net debt/EBITDAre holding steady in the debt note.
- Next checkpoint and date: **Q3 2026 10-Q (expected ~2026-10-30, matching last year's late-October cadence): occupancy holds at or above the Q2 2026 baseline (pull the baseline from the 10-Q filed 2026-07-29 first) and same-property NOI growth stays positive; in parallel, dividend/AFFO coverage confirmed from the FY2025 reconciliation.** → copied to `next_checkpoint` / `next_checkpoint_date`.

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
