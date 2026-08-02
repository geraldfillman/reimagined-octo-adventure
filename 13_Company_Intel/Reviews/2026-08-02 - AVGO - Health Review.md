---
node_type: "health_review"
date: "2026-08-02"
company: "Broadcom Inc."
ticker: "AVGO"
period: "FY ending 2025-11-02"
process_quality: "improving"
outcome_quality: "improving"
market_response: "rewarding"
divergence_pattern: "none"
economic_health_score: 25
stewardship_score: 24
market_confirmation_score: 9
total_score: 58
red_flag_override: false
red_flags: []
next_checkpoint: "Q3 FY2026 10-Q: trailing receivable-vs-revenue divergence narrows below +10pp and SBC dollars flatten/decline as VMware retention grants roll off; interim — read the already-filed Q1/Q2 FY2026 10-Qs and the FY2025 10-K contract-balances, PPA-amortization, SBC-runway, and debt notes to close the VMware-vs-organic question"
next_checkpoint_date: "2026-09-15"
markers_pull: "[[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_AVGO]]"
related_theses: ["[[AI Power Infrastructure]]"]
tags: [health-review]
---

# Company Health & Integrity Review — Broadcom Inc.

> Method: [[04_Reference/Corporate_Health_Integrity_Framework]] · Board: [[00_Dashboard/Health Review Board]] · Dossier: [[13_Company_Intel/Companies/AVGO - Dossier]]
> Quantitative markers: `node run.mjs edgar health --ticker AVGO` — link the pull note into `markers_pull`.
> Filename: `YYYY-MM-DD - TICKER - Health Review.md` · one dated note per review (quarterly cadence, §17)

---

## 1. Barebones company

Designs and sells the chips that move and process data (networking switches/routers, custom AI accelerators for hyperscalers, broadband, wireless front-end, storage connectivity), and acquires established infrastructure-software franchises (VMware, CA, Symantec Enterprise) whose locked-in enterprise customers pay recurring subscriptions — the machine is **design + acquire + toll**: buy market-leading toll-booth assets, cut their costs, reprice their captive customers, and keep the cash. The dossier is still a Scaffold with an empty `one_liner` — seed it from this sentence and start the evolution timeline (the VMware close is the biggest single change to this machine since the Avago/Broadcom merger).

## 2. What changed in the company machine?

Grounded in [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Facts_AVGO]] (FY2025 ending 2025-11-02 vs FY2024 ending 2024-11-03) and [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Baseline_AVGO]]. Note the §2 evolution-table row "more profit comes from financing or accounting items / acquisitions" cuts both ways — serial acquisition **is** the AVGO machine, so "growth via deals" is not per se a warning here; the warning form is *core decay hidden by deal effects*, which is exactly what §3 tries to discriminate.

- Positive:
  - Revenue $51.6B → $63.9B (+23.9%) — first fiscal year with VMware in both comparison bases (closed 2023-11-22, ~50 of FY2024's 53 weeks; public record — verify weeks in the 10-K), so this is a mostly-organic print.
  - Gross margin 63.0% → 67.8% (+4.8pp); operating margin 26.1% → 39.9% (+13.8pp); operating income $13.5B → $25.5B (+89.3%).
  - Operating cash flow $20.0B → $27.5B (+37.9%), outpacing revenue; FCF $19.4B → $26.9B on just $623M capex (~1.0% of revenue — extreme fabless capital-lightness).
  - R&D $9.3B → $11.0B (+17.9%) — reinvestment sustained through integration.
  - Cash $9.3B → $16.2B (+73.1%).
- Negative:
  - Receivables $4.4B → $7.1B (+61.8%) vs revenue +23.9% — the 🔴 +37.9pp divergence. Derived DSO ~31 → ~41 days (ending-balance basis).
  - Inventory $1.8B → $2.3B (+29.0%) vs derived cost of sales $19.1B → $20.6B (+8.0%) — the 🔴 +21.0pp divergence.
  - SBC $5.7B → $7.6B (+31.8%) = 11.8% of revenue 🔴; diluted shares 4.8B → 4.9B (+1.6% 🟡) despite active buybacks 🔴.
- Ambiguous:
  - Deferred revenue (current) $9.4B → $9.5B (+0.8%) — essentially flat while software revenue grows and receivables jump 61.8%. Billing structure is shifting; this is the single most informative discriminator for the receivables flag (§3).
  - Goodwill $97.8B, flat (−0.1%) — no new platform deal closed in FY2025; the machine's M&A engine is between meals while VMware digests.
  - The facts pull shows net income as $5.9B (FY2024) vs $14.1B (FY2023) — the FY2025 GAAP net-income figure did not populate (stale/renamed XBRL tag; the health pull's coverage table does show a 6-year netIncome series through 2025-11-02). FY2025 GAAP net income is an **explicit gap** in the vault — read it off the 10-K income statement, do not estimate.
  - Long-term debt last XBRL-tagged FY2021 ($39.4B) and interest expense last tagged FY2024 — the VMware-era balance sheet is effectively invisible in XBRL. Active 424B2/424B5/FWP issuance (2025-09, 2026-01) plus 8.01/9.01 8-K clusters (2026-01-13, 04-06, 06-11, 06-17, 07-06) document ongoing debt management. Leverage is a priority pull, not a clean bill.

## 3. Financial health

Marker table: [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_AVGO]] — rollup 🟢 3 · 🟡 2 · 🔴 4 · ⚪ 2 → `alert`. The central analytical task for every 🔴 below: how much is VMware acquisition mechanics (§5.1 acquisition-contribution / §8 acquisition-accounting lens) vs organic deterioration. Both readings are developed per flag with the filing evidence that discriminates.

- Organic revenue: +23.9%, but AVGO does not cleanly disclose organic vs acquisition/price/mix (§5.1 "acquisition contribution — clearly separated" is *not* met). Two base-year distortions inflate the print: (i) FY2024's acquired-deferred-revenue fair-value haircut suppressed post-close VMware software revenue, so FY2025 growth partly measures the haircut lapsing, not new demand; (ii) FY2024 had 53 weeks vs FY2025's 52 (direction: understates FY2025 growth — partial offset). Route: FY2025 10-K MD&A + segment note for the semis vs infrastructure-software split; earnings 8-Ks (2026-03-04, 2026-06-03) for the AI vs non-AI semiconductor revenue decomposition.
- Gross and operating margin: +4.8pp / +13.8pp. Benign reading: software mix (a full clean year of VMware at software gross margins) plus real synergy capture. Mechanical reading: purchase-accounting artifacts lapsing — FY2024 cost of revenue carried front-loaded amortization of acquired intangibles and any inventory step-up, so FY2025's +8.0% COGS growth (vs +23.9% revenue) partly reflects an inflated FY2024 base rather than repeatable operating improvement. Route: PPA amortization schedule in the FY2024/FY2025 10-K comparison. Until decomposed, do not treat the +13.8pp OM jump as fully earned.
- FCF conversion: 1.53 cumulative FCF/NI (≤5 FY) 🟢 and OCF-vs-earnings aligned 🟢. Caveat: for a roll-up, conversion >1 is partly structural — non-cash amortization of acquired intangibles depresses GAAP net income, flattering the ratio. It is still genuine cash ($27.5B OCF), which is the strongest single counterweight to the organic-deterioration reading of the receivables flag.
- ROIC and incremental returns: not computed — explicit gap. With $97.8B of goodwill, the only ROIC that matters is deal-inclusive (§5.4: "reconstructed rather than accepted"). The serial-acquirer question is whether each ~$10s-of-billions deal returns more than its cost of capital; VMware's early evidence (margin expansion, OCF growth) is directionally positive but unquantified in the vault.
- Debt and liquidity: net debt/EBITDA ⚪ and EBIT/interest ⚪ — both data gaps from stale tags, **not** evidence of low leverage. The pull's auto-comment ("interest likely immaterial or retired") should be rejected: VMware was funded with roughly $30B of new committed debt at close (public record — verify amounts in the FY2024/FY2025 10-K debt notes), so interest is certainly material and simply untagged. Cash $16.2B is solid; maturity ladder, fixed/floating mix, and covenant posture are the priority §5.5 pull.
- Working capital — the two 🔴 flags:
  - **Receivables +37.9pp vs revenue.** *VMware/acquisition reading:* Broadcom converted VMware from perpetual licenses to subscription-only VCF bundles; under ASC 606 the term-license component of a multi-year subscription is recognized upfront at delivery while billing runs annually — recognition outruns billing and unbilled contract assets/receivables swell. Flat deferred revenue (+0.8%) alongside +61.8% receivables is exactly the signature of billing moving *out of* deferred (cash collected upfront) *into* receivables/contract assets (billed or unbilled, collected later) as the legacy VMware billing model runs off and renewals cycle onto Broadcom paper. FY2024's base was also atypically low (acquired receivables at fair value, legacy billing running off). *Organic-deterioration reading:* collections genuinely slowing — customers resisting VMware repricing stretch payments, or extended terms are being granted to close renewals against documented customer pushback, or quarter-end recognition is aggressive while the allowance is held down. *Discriminators:* the contract-balances table in the FY2025 10-K revenue note (billed AR vs contract assets split — if the growth is unbilled contract assets, it is recognition-led model conversion; if billed AR, it is a collections/terms problem), allowance roll-forward vs balance growth, RPO disclosure, segment DSO. The +37.9% OCF growth argues cash is arriving — a pure collections crisis would already be visible in operating cash.
  - **Inventory +21.0pp vs COGS.** VMware carries no inventory, so the numerator is all semiconductors — but the *denominator* is contaminated: FY2024 COGS was inflated by front-loaded acquired-intangible amortization, mechanically deflating FY2025 COGS growth (+8.0%) and widening the divergence without any inventory problem. On an inventory-only basis the build is real but modest in absolute terms ($1.8B → $2.3B; derived days ~34 → ~41 — still lean for a semis franchise). *Benign organic reading:* deliberate build ahead of custom-accelerator (XPU) and next-gen Ethernet switch ramps. *Negative organic reading:* demand cooling in the non-AI franchises (broadband, wireless, server storage) leaving stock. *Discriminators:* inventory-by-stage split (raw/WIP/finished — WIP-heavy build supports the ramp story), purchase commitments, obsolescence provisions, and the semis-segment COGS trend isolated from amortization.

## 4. Operational health

§14 semiconductors/AI-infrastructure emphases; evidence status marked per item — no fabricated metrics.

- Customers and retention (hyperscaler concentration): AVGO's custom-ASIC and networking revenue is concentrated in a handful of hyperscalers, and the historical wireless franchise is Apple-concentrated (prior 10-Ks disclosed top-customer concentration around the 20% level — verify the FY2025 10-K concentration note before using a number). On the software side, retention through the VMware repricing cycle is the key unknown: renewals at higher prices flatter revenue while churn builds silently until contracts lapse. **Pull needed: FY2025 10-K concentration note + any renewal/churn disclosure.**
- Product and innovation (design wins, qualification cycles): the custom-ASIC pipeline is the machine's growth engine — the long-standing Google TPU co-design franchise plus additional unnamed hyperscale custom-AI customers, with 2025 press reports of a major new fourth customer (widely reported as OpenAI, Oct 2025) — all public record through 2025, none yet verified against filings. AVGO discloses AI vs non-AI semiconductor revenue in earnings materials: **pull the 2026-03-04 and 2026-06-03 earnings 8-K exhibits.** Cross-reference: [[2026-08-02 - NVDA - Health Review]] — AVGO is the quantified "hyperscalers design their own" bear case on NVDA ([[13_Company_Intel/Research Universe Map]] theme 1); NVDA's cash-confirmed +65.5% FY2026 growth confirms end-demand for AI compute is real, which supports AVGO's ramp story from the demand side.
- Employees and safety: no vault evidence; explicit gap. Integration-era attrition at VMware (post-retention-cliff departures) is the specific risk to watch once the SBC runway is read.
- Suppliers and capacity: fabless — foundry/packaging concentration (TSMC-class dependency, same physical bottleneck as NVDA) with no purchase-commitment figures pulled. **Pull needed: FY2025 10-K commitments footnote** — also discriminates the inventory flag.
- Sector-specific KPIs (§14): end-demand vs channel inventory — own inventory days ~34→~41 derived, channel data absent; customer prepayments — deferred revenue flat, but that line is software-dominated, so semis prepayments are invisible without the footnote; gross-margin sensitivity to mix — custom ASICs carry lower GM than networking silicon, so a successful XPU ramp *should* compress semis GM (a benign margin-decline scenario to pre-register now); capex intensity ~1.0% of revenue — the machine externalizes capital intensity to foundries and hyperscalers; export controls — custom-ASIC customers are US hyperscalers (less direct China-AI exposure than NVDA's merchant business), but broadband/wireless China exposure exists — verify risk-factor wording drift FY2024→FY2025; power availability — the binding constraint sits with AVGO's customers, which links this review to [[AI Power Infrastructure]]: every custom-accelerator win adds to the same datacenter power demand the thesis tracks.

## 5. Stewardship and integrity

Factual record only; uncertain items marked.

- Accounting quality: cash conversion is strong and aligned 🟢, no restatement, material weakness, auditor dispute, or late filing in the baseline window. But the §8 lens has real findings: (i) non-GAAP presentation habitually excludes both SBC and amortization of acquired intangibles — for a serial acquirer these are the two recurring costs of the machine itself, so adjusted EPS structurally presents the roll-up engine as costless ("one-time exclusions recur every year"); (ii) acquisition accounting reset VMware's deferred revenue and expense base in FY2024 (§8 "should not use acquisition accounting to reset recurring expenses" — the haircut is legal and standard, but it manufactures a flattering FY2025 growth optic); (iii) XBRL hygiene is poor — D&A never tagged, interest expense stale since FY2024, LT debt stale since FY2021, FY2025 net income unpopulated in the facts pull — independent verification is harder than it should be for a $300B+ revenue-scale filer.
- Disclosure quality: filings are timely (FY2025 10-K filed 2025-12-18, six weeks after FY end). Organic-vs-acquisition growth is not cleanly separated (§7.1 explicitly rewards this; AVGO fails it). Custom-ASIC customers are unnamed in filings, limiting concentration diligence to press inference.
- Capital allocation: the serial-acquirer record (LSI 2014, Broadcom 2016, Brocade 2017, CA 2018, Symantec Enterprise 2019, VMware 2023 — public record) is the machine's core competency, and on cash-flow outcomes each platform deal has been absorbed and milked successfully; the blocked Qualcomm hostile (CFIUS, 2018) is the one big miss. Dividend at 41% of FCF is comfortably §5.7-constructive. Buybacks, however, did not reduce the share count (§6). FY2025 closed no new deal — cash built to $16.2B, which is either discipline or a war chest; watch the next 8-K.
- Executive compensation: Hock Tan received a large front-loaded multi-year PSU award (reported ~$161M grant-date value, FY2024 proxy — public record) in lieu of annual grants — long-dated and performance-conditioned in structure, but pay-scale extreme; the 2026 DEF 14A (filed 2026-03-02) and say-on-pay result in the 8-K Item 5.07 (2026-04-21) are unread. **Verify before scoring governance any higher.**
- Board oversight: DEF 14A 2026-03-02 unread; two Item 5.02 8-Ks (2026-03-02, 2026-04-02) indicate officer/director changes not yet identified — read them (§11).
- Customer and employee treatment: this is AVGO's weakest stewardship dimension and it is **documented, not a gap**: the post-close VMware playbook — subscription-only licensing, bundle consolidation, steep price increases on a locked-in installed base, partner-program terminations — generated formal complaints (EU CISPE regulatory complaint; an AT&T lawsuit in 2024, settled; broad enterprise-customer discontent through 2024–2025, all public record). This is §12 "legal but potentially extractive" behavior operating as the software segment's growth engine. It funds the reported numbers *and* it is the mechanism by which the bear case (churn after lock-in expires) would materialize.
- Regulatory and legal record: no §7.3 hard-stop event documented — no fraud allegation, restatement, auditor dispute, going-concern language, covenant breach, or late filing in the evidence base. The VMware deal itself cleared global regulators including China's SAMR with conditions (public record) — compliance status unverified.

## 6. Shareholder distribution

§5.6–5.7, everything netted against dilution:

- Dividends: ~41% of FCF 🟢 (≈$11.0B on $26.9B FCF, derived) — squarely in the 30–60% constructive band for a mature machine, and the one unambiguous cash return to owners this year.
- Gross buybacks: occurring (series populated all 6 FYs) but dollar amounts not in the facts pull — explicit gap; FY2025 10-K financing section.
- Net share-count change: 🟡 **+1.6%** diluted (4.8B → 4.9B) — buybacks lost to issuance.
- Stock compensation: 🔴 **$7.6B = 11.8% of revenue**, +31.8% y/y — above the 10% concern line. Contrast with [[2026-08-02 - PLTR - Health Review]]: PLTR's 15.3% ratio came with *flat* SBC dollars against +56% revenue (improving); AVGO's SBC dollars are *growing faster than revenue* (worsening). The mitigating hypothesis is specific and falsifiable: VMware retention/replacement grants amortize over a defined FY2024–FY2026 runway, so if the flag is acquisition-driven, SBC dollars flatten and then fall as the cliffs pass. If SBC keeps growing past the retention runway, it is structural AI-talent repricing — a permanent 11.8%-of-revenue owner cost.
- Debt used for distributions: not determinable — concurrent debt issuance (424B activity) and unpulled buyback dollars mean this cannot be ruled out; §15 "Debt-funded buyback" routing applies.
- Net verdict: owners received the dividend; the buyback was economically an SBC settlement mechanism (§5.6: "a buyback is not a shareholder return when it merely purchases shares issued to employees"). Milder than PLTR (+1.6% vs +4.7% dilution, with a real dividend besides), but the same pattern in kind.

## 7. Market behavior

§9 — evidence about expectations and ownership, not proof of business quality.

- Relative performance: 12-month return **+34.9% vs SMH +90.4% = −55.5pp** 🟡. A +34.9% absolute return is the market rewarding the machine; the huge relative gap needs a specific explanation (§9.2). Candidates, none verified: SMH's return is concentrated in merchant-AI names (NVDA-type) during this window; AVGO pre-ran in FY2024 when VMware synergies were priced (base effect); or the market is discounting exactly the four flags this review routes. Distinguishing requires the estimate-revision pull — **explicit gap**.
- Estimate revisions: no pull — explicit gap.
- Accumulation/distribution: no volume/flow pull — explicit gap.
- Insider activity: steady Forms 4 + 144 through June–July 2026 (baseline) — pattern consistent with routine executive plan-selling, but transaction codes and 10b5-1 status unread — verify before treating as benign.
- Ownership concentration: 13G/As in the baseline are 2024 or older — stale; no 13F aggregation pull. Presumed passive-heavy mega-cap register — verify.
- Short interest: no pull — explicit gap.

## 8. Process-versus-outcome classification

- Process quality: **improving** — margins, cash generation, reinvestment, and integration all moved up; the four flags are unresolved *attribution questions* (VMware mechanics vs organic decay), not yet demonstrated process deterioration.
- Current outcome quality: **improving** — revenue +23.9%, OM +13.8pp, record $26.9B FCF, all cash-confirmed.
- Market response: **rewarding** — +34.9% over 12 months; the −55.5pp lag vs SMH qualifies the *degree* of reward relative to pure-play AI peers, not its direction.
- Primary divergence: **none** — company reality and market response point the same way (§3 table row: "healthy process and healthy results / stock rewarded / potential compounder; valuation remains decisive"). Two adjacent patterns are pre-registered as watch-frames: **Pattern C** (good company, bad investment) if valuation work shows decades of custom-ASIC success already priced; **Pattern B** (bad process, good stock) if the filing reads resolve the receivables flag toward extraction — VMware repricing of captive customers plus recognition-led revenue is precisely Pattern B's "accounting recognition leads cash reality / prices rise because of market power" cause pair.

### Divergence sentence (§17 Step 7)

> The company's operating process is `improving`, reported results are `improving`, and the market is pricing `more` future success because the custom-accelerator and AI-networking ramp plus a full clean year of VMware software economics are being rewarded — though at a 55.5pp discount to SMH, and with four unresolved accounting flags (receivables +37.9pp, inventory +21.0pp, SBC 11.8%, +1.6% dilution) whose VMware-vs-organic attribution the market is currently taking on faith.

## 9. Good-faith evidence

- R&D held at $11.0B (+17.9%) through the largest integration in company history — the franchise-protection line was funded first (XBRL facts).
- Dividend kept at a sustainable 41% of FCF rather than levered up for optics; cash built +73.1% to $16.2B (XBRL facts).
- Operating cash flow (+37.9%) outgrew reported revenue — earnings are arriving as cash, the opposite of accrual-led reporting (marker pull 🟢🟢).
- Post-deal deleveraging is the documented historical pattern across CA/Symantec/prior deals (public record; FY2025 amounts unverifiable in XBRL — flagged as a gap rather than credited blindly).

## 10. Extraction or bad-faith risk

- **Captive-customer repricing as growth engine:** the VMware subscription conversion extracts from a locked-in installed base under switching-cost duress (documented complaints, §5 above) — legal, deliberate, and currently indistinguishable in the P&L from durable demand (§12).
- **Recognition-led revenue risk:** if the receivable build is upfront-recognized term-license value on multi-year deals, reported software growth is partly borrowed from future periods (§2 "borrowing demand from the future") — the contract-balances table decides this.
- **Non-GAAP framing:** permanent exclusion of SBC ($7.6B) and acquisition amortization presents the machine's two structural costs as if they weren't costs; the adjusted-vs-GAAP wedge is the widest in the coverage universe (§8).
- **Buybacks as SBC laundering:** repurchases that fail to shrink the count while headline "capital returned" grows (§5.6) — milder than PLTR but present.
- **Deal-dependence:** goodwill $97.8B with legacy non-AI franchises historically flat-to-declining means the machine must eventually acquire again; each deal resets bases and re-opens the same attribution fog exploited above. Unread officer-change 8-Ks (2026-03-02, 2026-04-02) and unverified leverage keep tail risk open.

## 11. EDGAR follow-up

Routing per §15; log meaningful changes as Intel Findings. This section carries the review — every §3 flag resolves to a specific document.

- Filing: **FY2025 10-K (filed 2025-12-18) — revenue-recognition note, contract-balances table, RPO disclosure.**
  - Finding: receivables +61.8% vs revenue +23.9% (🔴 +37.9pp) while deferred revenue is flat (+0.8%).
  - Possible meaning: recognition-led VMware model conversion (unbilled contract assets from upfront term-license recognition) vs collections/terms deterioration.
  - Next investigation: billed-AR vs contract-asset split and its y/y change; RPO growth vs revenue; §15 row "Revenue quality concern".
- Filing: **FY2025 10-K — receivables/allowance roll-forward + customer-concentration note.** Allowance flat-or-down while the balance grows +61.8% would be the §5.3 "serious concern" signature; concentration note also covers §4's hyperscaler question.
- Filing: **FY2024 + FY2025 10-K acquisition footnotes — VMware purchase-price allocation.** Quantify the deferred-revenue haircut (how much FY2025 software "growth" is the haircut lapsing), the intangible-amortization schedule inside cost of revenue (how much of the +21.0pp inventory divergence and the +13.8pp OM jump is a mechanical FY2024 base effect). §15 row "Large acquisition".
- Filing: **FY2025 10-K — inventory footnote + purchase-commitments note.** Stage split (WIP-heavy supports the XPU/networking ramp reading), obsolescence provisions, commitment totals. Resolves the inventory flag's organic half.
- Filing: **FY2025 10-K SBC footnote + DEF 14A (2026-03-02) + 8-K 5.07 (2026-04-21).** Unrecognized-compensation balance and weighted-average vesting period — if the VMware retention runway ends inside ~1–2 years, the 11.8% ratio has a documented expiry; also Hock Tan award structure and say-on-pay result. §15 row "Dilution".
- Filing: **FY2025 10-K statement of equity + financing cash flows.** Buyback dollars vs issuance; nets §6 definitively.
- Filing: **FY2025 10-K debt note + 424B2/424B5/FWP (2025-09-22/24, 2026-01-06/08) + 8-K 8.01/9.01 cluster (2026-01-13, 04-06, 06-11, 06-17, 07-06).** Rebuild the leverage picture XBRL can't show: totals, maturity ladder, fixed/floating, interest expense, use of proceeds. Resolves both ⚪ markers. §15 rows "New capital raise" / "Debt-funded buyback".
- Filing: **Q1 FY2026 10-Q (filed 2026-03-11) + Q2 FY2026 10-Q (filed 2026-06-09) — already on file, unread.** The fastest resolution available: whether receivable divergence and the SBC ratio are already normalizing two quarters past FY2025. Read these before the next checkpoint.
- Filing: **8-Ks Item 5.02 (2026-03-02, 2026-04-02).** Identify which officers/directors changed; cross-check DEF 14A. §15 row "CFO or auditor change".
- Filing: **Forms 4/144 (2026-06 through 2026-07).** Transaction codes and 10b5-1 status for the selling cluster. §15 row "Insider selling".
- Non-EDGAR pulls for the 🟡 §9.2 flag: estimate-revision history, 13F holder aggregation, short interest, SMH composition attribution — all explicit gaps.

## 12. Score

§16 rubrics; per-category justifications. Copied to frontmatter. Scoring note: unresolved acquisition-accounting ambiguity caps what can honestly be awarded — the score organizes *evidence in the vault*, and much of AVGO's likely strength is currently unverifiable (stale XBRL, unread notes), which is itself information.

| Block | Score | Max |
|---|---:|---:|
| Economic health | 25 | 40 |
| Stewardship and integrity | 24 | 40 |
| Market confirmation | 9 | 20 |
| **Total** | **58** | 100 |

- Economic health — 25/40: revenue/demand quality 6/8 (+23.9% at scale, real end-demand, but organic split undisclosed and the receivables flag sits directly on revenue quality); unit economics/margins 6/8 (67.8%/39.9% are elite, docked because the +13.8pp OM jump is not yet decomposed into earned vs purchase-accounting-mechanical); cash conversion/earnings quality 4/8 (1.53 conversion and aligned OCF are top-band, but two 🔴 working-capital divergences with unresolved attribution cap this category per the acquisition-ambiguity rule); balance-sheet resilience 4/8 (both §5.5 markers are data gaps on a known post-VMware debt load — cannot score what cannot be seen); returns on capital 5/8 ($97.8B goodwill, no reconstructed ROIC; the serial-deal record is good on cash outcomes but unquantified).
- Stewardship and integrity — 24/40: accounting transparency 4/8 (capped: recurring SBC+amortization exclusions, deferred-revenue-haircut optics, poor XBRL hygiene — offset by timely filings and cash-confirmed earnings); capital allocation 6/8 (disciplined dividend, proven deal digestion, R&D funded — docked for buybacks that don't shrink the count and unverifiable leverage); governance/compensation 4/8 (mega-grant scale, DEF 14A and two 5.02 8-Ks unread); customer/employee/supplier treatment 3/8 (the documented VMware customer-extraction record is affirmative negative evidence, not a gap); strategic consistency 7/8 (the design+acquire+toll machine has been executed coherently for a decade; no relabeled failures or KPI redefinitions observed).
- Market confirmation — 9/20: relative price/estimates 2/5 (+34.9% absolute but −55.5pp vs benchmark, no revision data); accumulation/ownership 2/5 (no pulls — neutral by default); valuation vs conservative economics 2/5 (no valuation work in vault; a +34.9% run into four open flags is not cheapness evidence); catalyst/expectation asymmetry 3/5 (unusually good checkpoint structure — SBC runway, contract-balances table, already-filed 10-Qs — but expectations are elevated).
- Red-flag override: **false** — no documented §7.3 hard-stop event (no fraud allegation, restatement, auditor dispute, going-concern language, covenant breach, or late filing). Acquisition-accounting ambiguity is an investigation driver, **not** a §7.3 event, so it caps sub-scores rather than triggering the override. Total 58 = §16 "mixed" band: the thesis depends on specific repairs/resolutions — exactly right for a company whose four red markers all await a VMware-vs-organic verdict. Comparative note: scoring below NVDA (70) and PLTR (61) reflects vault-evidence coverage, not a settled judgment that the business is weaker — AVGO has the largest gap between what is probably true and what is currently verifiable.

## 13. Falsifiable thesis

- Bull case: the VMware integration is delivering a structurally stronger machine — a software toll layer at ~68% blended GM funding a custom-accelerator ramp that rides the same AI-capex wave as [[AI Power Infrastructure]] — and all four red markers are acquisition-model artifacts with defined expiries: receivables reflect the subscription-billing conversion (recognition-led, cash-confirmed by +37.9% OCF), inventory divergence is a COGS-base artifact plus deliberate ramp build, SBC is retention grants that roll off by FY2026, and dilution ends when they do.
- Bear case: the machine is now extraction-dependent — software growth is repricing of captive customers who churn as lock-ins lapse, upfront-recognized multi-year licenses have borrowed future revenue (receivables the first symptom), SBC at 11.8% and growing is permanent AI-talent repricing, non-AI semi franchises decay, and unverifiable leverage constrains the next deal the model needs — so today's reported strength is the high-water mark of an accounting-flattered integration year.
- What would prove each wrong: **bull broken** if, through FY2026, receivable-vs-revenue divergence stays above +10pp with the growth in *billed* AR (not contract assets) and/or the allowance held flat while balances climb, **and** SBC dollars keep growing past the disclosed retention-vesting runway, **and** software growth decelerates sharply once the renewal wave completes. **Bear broken** if the contract-balances table attributes the build to unbilled model-conversion assets, divergence normalizes below +10pp, SBC dollars flatten/fall on schedule, share count stabilizes, and the debt note shows deleveraging on plan.
- Next checkpoint and date: **Q3 FY2026 10-Q** (period ends ~2026-08-02; prior-year Q3 10-Q filed 2025-09-10, so expect it by ~2026-09-15) — trailing receivable divergence below +10pp and SBC dollars flat-to-down. Interim, before that filing: read the already-available Q1/Q2 FY2026 10-Qs and the FY2025 10-K notes routed in §11 — most of the VMware-vs-organic question is answerable today from documents on file. Copied into `next_checkpoint` / `next_checkpoint_date`.

---

### Frontmatter values

- `process_quality` / `outcome_quality`: `improving` · `stable` · `deteriorating`
- `market_response`: `rewarding` · `ignoring` · `punishing`
- `divergence_pattern`: `none` · `good-process-bad-stock` · `bad-process-good-stock` · `good-company-bad-investment` · `troubled-company-good-trade`
- `total_score` interpretation (§16): 85–100 strong · 70–84 healthy with weaknesses · 55–69 mixed · 40–54 fragile · <40 avoid ordinary ownership
- `red_flag_override`: `true` when any §7.3 hard-stop event is open — list events in `red_flags`
