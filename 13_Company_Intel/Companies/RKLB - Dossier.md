---
node_type: "company_intel"
company: "Rocket Lab Corp"
ticker: "RKLB"
cik: "0001819994"
sector: "Guided Missiles & Space Vehicles & Parts"
fiscal_year_end: "12-31"
research_status: "Baseline"
confidence: "Medium"
overall_state: "yellow"
one_liner: "Rocket Lab builds and launches small rockets around a 3D-printed engine production line, sells satellites and satellite parts to governments and companies, and is spending shareholders' cash to scale that same additive-manufacturing capability into a bigger reusable rocket (Neutron)."
last_updated: "2026-08-02"
clarity_score: 19
economic_quality_score: 16
governance_score: 21
disclosure_score: 22
evolution_score: 37
core_entities: ["[[RKLB]]"]
related_theses: ["[[Space Domain Awareness]]", "[[Hypersonic Weapons Advanced Defense]]", "[[Fiscal Scarcity Rearmament]]"]
tags: [company-intel]
---

# Rocket Lab Corp — Company Dossier

> Method: [[04_Reference/EDGAR_Company_Deconstruction_Framework]] · Board: [[00_Dashboard/Company Intel Board]]
> `research_status`: Scaffold → Card → **Baseline** → Active → Archived
> Evidence base: [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Baseline_RKLB]] · [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Facts_RKLB]] · [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Health_RKLB]] · Health review: [[13_Company_Intel/Reviews/2026-08-02 - RKLB - Health Review]]
> Items marked **⚠ verify** are not yet confirmed against the FY2025 10-K (filed 2026-02-26) / DEF 14A (2026-04-06) — do not treat as evidenced. Vault policy: explicit gaps over fabricated values — no launch counts, costs, or backlog numbers appear here that the vault or well-established pre-2026 record cannot support.

---

# Part A — Bare-Bones Company Card

Complete this before reading analyst opinions. When done, set `research_status: Card`.

## 1. Simplest Description

### One Sentence (explain it to a ten-year-old)
Rocket Lab builds and launches small rockets that carry satellites to space for governments and companies, increasingly builds the satellites and their parts too, and charges per launch and per spacecraft — copied into `one_liner` with the machine-level detail: the rockets come off a 3D-printing production line, and the company is betting shareholders' cash that the same production line can make a much bigger rocket.

### One Paragraph
Rocket Lab takes aerospace-grade metal powder, carbon fiber, and electronics (inputs), and transforms them — through an additive-manufacturing engine line, carbon-composite structures fabrication, and vertically integrated avionics/components plants — into two outputs: launch services (the ~300 kg-class Electron rocket, its suborbital HASTE variant, and the medium-lift Neutron in development) and space systems (satellite components such as solar cells, reaction wheels, separation systems, and flight software; full spacecraft buses; and prime contracts for entire satellite constellations). Customers are NASA, US defense and intelligence agencies (including the Space Development Agency), allied governments, and commercial constellation operators; they pay per mission, per component, or on milestone-based satellite-build contracts. The machine does not yet feed itself: FY2025 free cash flow was −$321.8M, funded by repeated at-the-market and shelf equity issuance (three 424B5 takedowns in the trailing 12 months), which is why diluted shares grew +7.0% while cash tripled to $828.7M.

### What Would Disappear If the Company Disappeared?
The only frequently-flying dedicated small-launch service in the West (responsive, single-customer orbits rather than SpaceX rideshare timing), a large share of the merchant satellite-components supply chain (space solar cells via SolAero, separation systems via PSC, reaction wheels via Sinclair), and one of two credible near-term challengers to SpaceX's medium-lift monopoly pricing.

## 2. The Company Machine

- **Capital source:** VC-funded from 2006 (NZ-founded, US-domiciled); public Aug 2021 via SPAC merger (Vector Acquisition Corp); $355M 4.25% convertible notes issued Feb 2024 (**⚠ verify** whether still outstanding — XBRL long-term debt tag shows only $1.7M, a known tag-coverage gotcha); since 2025 primarily serial equity issuance — S-3ASR shelf (2025-03-11) plus 424B5 takedowns 2025-03-11, 2025-05-30, 2025-09-15, 2026-03-17, 2026-05-20.
- **Inputs:** metal powders and aerospace alloys, carbon fiber, semiconductors/space-grade solar substrates, cleared engineering talent, launch-range access (LC-1 Mahia NZ, LC-2/LC-3 Wallops VA), regulatory licenses (FAA/NZ).
- **Transformation:** additive manufacturing of engines (Rutherford: combustion chamber, injectors, pumps, main propellant valves printed, ~24-hour print cycle for primary components), carbon-composite structure fabrication, in-house avionics and software, satellite integration — an unusually vertically integrated build chain for the sector.
- **Output:** completed orbital launches (Electron: 9 Rutherfords on stage 1 + 1 vacuum Rutherford on stage 2), suborbital hypersonic test flights (HASTE), satellite components, spacecraft buses (Photon and derivatives), full constellations as prime.
- **Customer / user / payer:** NASA, SDA/USSF/NRO and allied defense agencies, commercial constellation operators; the payer is a program office or constellation owner; the user is whoever needs the payload on orbit.
- **Collection method:** per-launch contracts, component purchase orders, and long-duration milestone-billed satellite prime contracts (contract liabilities: $195.4M current deferred revenue at FY2025).
- **Required reinvestment:** heavy and rising — R&D $270.7M (45% of revenue, mostly Neutron/Archimedes, **⚠ verify** split), capex $156.3M (+132.9%: Neutron production complex, launch sites, test stands).
- **Owner distributions:** none — no dividend, no buyback ever (XBRL series empty); owners fund the machine, not the reverse.

## 3. Revenue Engine

| Stream | Who Pays? | Why Do They Pay? | Pricing Unit | Recurring? | Margin | Growth Driver | Main Risk |
|---|---|---|---|---|---|---|---|
| Launch Services (Electron, HASTE) | NASA, DoD (hypersonics test), commercial constellation operators | Dedicated orbit/schedule control a rideshare cannot give; only frequently-flying Western small-launcher | Per mission (HASTE per test flight) | Repeat-purchase, not contractual recurring | Historically thin/negative gross margin, improving with cadence and price (**⚠ verify** segment split in FY2025 10-K) | Cadence, constellation replenishment, hypersonic test budgets ([[KTOS]] adjacency) | SpaceX rideshare price umbrella; a single in-flight failure halts revenue |
| Space Systems (components, spacecraft, constellation prime) | SDA and defense primes, satellite operators, other launch/satellite builders | Merchant supply of scarce space-grade parts; full-stack prime capability (e.g. ~$515M SDA Tranche 2 Transport Layer Beta award, 18 spacecraft — **⚠ verify** current status/backlog treatment) | Per component, per bus, milestone-billed prime contracts | Multi-year contracted backlog | Higher and steadier than launch (**⚠ verify** exact split) | Defense proliferated-constellation spending ([[Space Domain Awareness]]), acquired capabilities (Mynaric laser terminals, Geost EO/IR payloads — announced 2025, **⚠ verify** close/integration in 10-K) | Program dependence, acquisition integration, government payment timing |

- **Which stream funds the others?** Neither, yet — both are funded by the balance sheet (equity issuance). Space Systems is the larger revenue base (~70% of revenue in recent years, **⚠ verify** FY2025 split) and carries the steadier margin; Launch is the strategic differentiator and cadence proof for Neutron. Blended gross margin 34.4% (from 26.6%) says mix and launch economics both improved.
- **Highest incremental margin:** Space Systems components on existing lines; post-Neutron, a reused booster flight would transform launch incremental margin (unproven).
- **First to disappear in a recession:** commercial small-sat launch bookings; defense/SDA prime work and HASTE are counter-cyclical to fiscal-scarcity rearmament.

## 4. Cost Engine

| Cost | Fixed / Variable / Step-Fixed | Driver | Passable to Customers? | Strategic or Wasteful? | Filing Location |
|---|---|---|---|---|---|
| Cost of revenue $394.6M (launch hardware incl. ~10 printed engines/mission, satellite hardware, range ops) | Variable per mission/unit with step-fixed factory base | Launch cadence, satellite deliveries | Partly (launch pricing capped by SpaceX umbrella) | Strategic — AM line is the moat's physical form | 10-K cost of revenue, segment note |
| R&D $270.7M (+55.2%, 45% of revenue) | Step-fixed | Neutron/Archimedes development | No | Strategic — this is the scale-up bet; watch for it persisting past first flight | Income statement, MD&A |
| SG&A | Step-fixed | Scale, public-company + M&A overhead | No | Neutral | Income statement |
| SBC $71.1M (11.8% of revenue, ratio falling from 13.0%) | Step-fixed | Retention in a talent-scarce sector | No — real owner cost | Mixed — see health review §6 | SBC footnote |
| Capex $156.3M (26% of revenue) | Step-fixed lumps | Neutron factory/launch complex, test infrastructure | No | Strategic — capitalized build ahead of revenue | Cash-flow statement, PP&E note |

- **Which cost rises before revenue appears?** R&D and capex — both roughly doubled while revenue grew 38%; classic build-ahead-of-launch profile. Operating loss widened to −$228.8M *because* of this, not despite gross margin improving +7.8pp.
- **Which cost is essential to the moat?** The AM engine line and composite fabrication — vertical integration is the cost structure.
- **Capitalized instead of expensed:** $156.3M capex vs $67.1M prior year — **⚠ verify** in the 10-K what portion is Neutron-specific and whether any development costs are capitalized beyond PP&E.

## 5. Assets and Capabilities

> **The analytical centerpiece: the additive-manufacturing production system.** The question this dossier and the paired health review must answer is not "can Rocket Lab 3D print an engine?" — that was answered in January 2018 when Rutherford became the first electric-pump-fed, substantially 3D-printed engine to reach orbit — but "is the *production system* around that printer a durable, transferable, economically superior capability?"

### Critical Assets
1. **The Rutherford additive-manufacturing line.** Each Electron consumes ten engines (9 sea-level + 1 vacuum) with no engine reuse in the baseline economics, so every launch is a ten-unit serial-production certification of the AM cell. At the 50th Electron mission (June 2024 — the last cumulative count that is well-established; **⚠ verify** the FY2025 count and 2025 cadence record in the 10-K business section) the line had produced on the order of 500 flight engines plus qualification units. Primary components — combustion chamber, injectors, pumps, main propellant valves — print in roughly 24 hours per company disclosure. The electric-pump cycle is what made this printable at all: replacing turbopumps with battery-driven electric motors removed the highest-energy turbomachinery from the print envelope, trading battery mass for radical manufacturing simplicity.
2. Carbon-composite structures fabrication (Electron is a carbon-composite vehicle; Neutron structure is composite — automated fiber placement, **⚠ verify** current process disclosure).
3. Launch-site portfolio: LC-1 Mahia (the only private orbital launch site in regular use), LC-2/LC-3 Wallops — licensed range capacity is scarce and slow to replicate.
4. Acquired space-systems franchises: SolAero (space solar cells — one of few merchant suppliers), Sinclair (reaction wheels/star trackers), PSC (separation systems), ASI (flight software), plus Mynaric (laser comms terminals) and Geost (EO/IR payloads) announced 2025 (**⚠ verify** close, consideration, and integration; goodwill +189.7% to $205.8M says a large share of FY2025's balance-sheet growth is these deals).
5. Net-cash balance sheet: $828.7M cash (+205.7%) — raised, not earned; still an asset for a pre-FCF builder.

### Reusable Capabilities
1. **Design-for-additive engine production at flight cadence** — the capability is not the printer (printers are purchasable) but the closed loop of print → hot-fire → fly → inspect ten engines per mission, at a cadence that has made Rocket Lab the most frequent Western orbital launcher after SpaceX. Reuse experiments extend the evidence: recovered boosters from ocean splashdown, the 2022 mid-air helicopter catch trial, and the first re-flight of a previously flown Rutherford engine (August 2023) show printed hardware surviving flight, seawater, and re-qualification — quality evidence money cannot easily buy.
2. **The Archimedes transfer test (open).** Neutron's engine is a far larger LOX/methane turbopump engine (company-described as oxidizer-rich staged combustion — **⚠ verify** current cycle description), heavily 3D printed, with 9+1 per vehicle mirroring Electron's architecture. First hot fire was achieved at NASA Stennis in August 2024 (well-established). What transfers directly: powder metallurgy know-how, print-parameter libraries, hot-fire qualification discipline, the 9+1 production template. What does not transfer automatically: electric pumps are gone, so Archimedes reintroduces exactly the high-energy turbomachinery Rutherford's cycle was designed to avoid printing; larger parts mean longer builds and different residual-stress behavior (analytical inference, not company data); and reusability means each engine must survive many flights, not one. **"Successfully 3D printing engine parts" is proven at Electron scale and unproven at Neutron scale until Archimedes flies and re-flies.**
3. Rapid mishap recovery — Electron's three in-flight failures (2020, 2021, 2023) were each followed by disclosed root-cause and return-to-flight within months (**⚠ verify** each mishap attribution in filings; none is publicly attributed to a printed part failing structurally).
4. Vertically integrated spacecraft prime capability — winning and executing constellation-scale primes (SDA) using in-house components.

### Assets That Look Valuable but May Be Replicable
1. 3D printers and AM per se — additive manufacturing is now industry-standard practice (SpaceX prints engine components; newer entrants are AM-native). The moat is the flight-proven parameter library and cadence discipline, not the technique.
2. Electron itself — small dedicated launch is a contested niche with thin economics under the SpaceX rideshare price umbrella; the vehicle is more strategic proof-of-capability than profit engine.
3. "Space stocks" narrative premium — the +44.9% 12-month run vs ARKX +19.8% is market enthusiasm, not a company asset.

## 6. Dependencies and Bottlenecks

| Dependency | Type | Importance | Replaceability | Evidence | Trigger |
|---|---|---|---|---|---|
| Equity capital markets | Financing | Critical (pre-FCF) | None until FCF break-even | Three 424B5s in 12 months; FCF −$321.8M | ATM window closing (derating, risk-off) forces pace-slowing or debt |
| Neutron execution | Program | Critical | None — the thesis is the scale-up | R&D 45% of revenue, capex +133% | First-flight slip/failure; **⚠ verify** current schedule language in 10-K/Q1 10-Q — do not carry a date from memory |
| SpaceX pricing umbrella | Competitor | High | N/A | Theme 11 map — SpaceX sets the price over the whole sector | Falcon 9/Transporter price cuts; Starship reaching cadence collapses medium-lift pricing before Neutron matures |
| Launch-site/range capacity & licenses | Regulatory/infra | High | Low-medium | LC-1 private site + Wallops | FAA licensing delays, NZ regulatory shifts, range congestion |
| Government demand (NASA/SDA/NRO/allied) | Customer | High | Low | SDA prime, HASTE | Appropriations politics; program cancellations |
| Specialty inputs (metal powder, carbon fiber, solar substrates incl. germanium) | Supplier | Medium | Medium | SolAero supply chain | Input-cost or export-control shocks |
| Battery/electric-pump supply chain (Electron) | Supplier | Medium | Medium | Rutherford cycle design | Cell supply/qualification issues |

### Current Bottleneck
Neutron execution — factory throughput, Archimedes qualification, and first flight. If demand doubled tomorrow: Electron manufacturing could rate-limit first (the AM cell paces engine output at ten per mission — the 24h print claim is the mitigation), then launch-window/range capacity; Neutron demand cannot be served at all until the vehicle flies. The bottleneck is partly moat: nobody else has a flight-proven AM small-engine line to scale from.

## 7. Flywheel

```text
Launch cadence rises (Electron/HASTE)
  ↓
AM engine line and composite shop learn by volume (10 engines/mission)
  ↓
Reliability record + falling unit effort → better pricing, more wins
  ↓
Space Systems sells components/buses into the same customer base
  ↓
Vertical integration deepens (acquisitions fold in), backlog grows
  ↓
Scale + flight heritage fund and de-risk Neutron/Archimedes
  ↓
Bigger vehicle reuses the same production system → cadence rises again
```

## 8. Reverse Flywheel

```text
Neutron slips or fails, or equity window closes
  ↓
Cash burn (−$322M FCF) must be cut — R&D and capex retrench
  ↓
Scale-up story breaks; multiple derates; ATM issuance dilutes harder at lower prices
  ↓
Talent retention (SBC value) weakens; cadence and quality slip
  ↓
Launch failures or delays feed back into customer confidence
  ↓
Company shrinks back to a components supplier under the SpaceX umbrella
```

## 9. Control and Decision Rights

- **Voting control / share classes:** single class of common stock (SPAC-era structure — no dual-class founder shield, unlike PLTR). **⚠ verify** in DEF 14A (2026-04-06) that no class changes accompanied the 2025 holding-company reorganization (EDGAR registrant renamed "Rocket Lab Corp" from Rocket Lab USA — **⚠ verify** mechanics).
- **Top holders (active vs. passive):** 13D/A history through Dec 2024 indicates concentrated early/VC-era holders still amending positions — identify filers and current stakes when read; index/passive complex present. **⚠ verify.**
- **Insider alignment:** founder-CEO-chairman Peter Beck remains the largest individual holder (**⚠ verify** current % in proxy). June–July 2026 Form 4/144 cadence plus a Form 3 (2026-06-05, same date as a 5.02 8-K — likely a new officer/director) — **⚠ verify** 10b5-1 footnotes before reading sales as signal.
- **Bank / lender influence:** minimal tagged debt ($1.7M LT); Feb 2024 $355M converts **⚠ verify** outstanding status — if converted during the 2025 run-up, the balance sheet is effectively unlevered and lenders have no lever.
- **Board structure:** **⚠ verify** committee composition, classified-board status in proxy; two 5.02 8-Ks in 2026 (03-30, 06-05) unexplained.
- **Who can force, stop, delay, finance, or veto a major strategic move?** Beck leads strategy with a large but non-controlling stake; the real veto sits with the equity market — the company must keep selling shares to finish Neutron, so the shareholder register and the share price effectively gate the strategy.

## 10. Simplest Bull / Bear Case

### Bull (what improves the machine)
The AM production system transfers: Archimedes qualifies and Neutron flies, putting Rocket Lab under the SpaceX price umbrella as the only other reusable medium-lift provider while defense constellation demand ([[Space Domain Awareness]], [[Fiscal Scarcity Rearmament]]) fills Space Systems backlog; gross margin (already 26.6% → 34.4%) keeps climbing with cadence and mix; the $829M raised at strength turns out to have bought the scale-up without ever needing a desperate raise.

### Bear (what damages or replaces the machine)
Neutron consumes cash past the runway (~2.6 years at FY2025 burn, and burn is accelerating) while first flight slips; the equity window closes on a derating and dilution compounds at lower prices; Starship-era pricing crushes medium-lift economics before Neutron earns a return; launch stays structurally thin-margin and Space Systems growth proves mostly acquired (goodwill +190%), leaving an unprofitable conglomerate of parts businesses.

### Evidence Still Needed
1. FY2025 10-K: segment revenue/margin split, backlog composition and definition, AM/manufacturing risk-factor language, Neutron milestone discussion.
2. FY2025 10-K debt note: status of the 2029 converts; resolve the $1.7M long-term-debt tag against known issuance.
3. Statement of equity + 424B5s: decompose the +7.0% share growth into ATM issuance vs acquisition stock vs SBC ([[13_Company_Intel/Findings/2026-08-02 - RKLB - Unregistered share issuance (8-K Item 3.02)|finding]]).
4. DEF 14A: Beck stake, comp metrics (are executives paid on Neutron milestones, margin, or share price?), say-on-pay result (8-K 2026-05-21, Item 5.07).
5. Q1 2026 10-Q (filed 2026-05-07): sequential inventory, deferred revenue, burn rate.

---

# Part B — Filing Baseline and Evolution

## 11. Evolution Timeline

| Period | Simplest Accurate Description | What Changed? | Evidence | +/−/Mixed | Evolution Score |
|---|---|---|---|---|---|
| Founding (2006–2017) | NZ rocket startup chasing cheap, frequent small launch | Electron developed around two unconventional choices: 3D-printed engines and electric pumps | Company history; S-4/SPAC docs | + | — |
| Public listing (Aug 2021, SPAC) | Small-launch operator with a components sideline | Vector Acquisition merger; acquisition spree begins (Sinclair, ASI, PSC) | 2021-era filings, 424B3s (2022) in baseline | Mixed (SPAC-era heritage, cash injected) | — |
| Five years ago (2021–2022) | Launch company diversifying into space systems | SolAero (solar cells) folded in; Photon spacecraft; Neutron announced | FY2021/FY2022 10-Ks | + | — |
| Prior year (FY2024) | Two-segment space company, components-led revenue | $355M converts issued; SDA prime execution; HASTE cadence; Neutron in build | FY2024 10-K, 10-K/A (2025-04-30 — cause **⚠ verify**) | + | — |
| Current (FY2025) | Vertically integrated launch + space-systems prime, pre-Neutron | Revenue +38% to $601.8M, GM 34.4%; goodwill +190% (Mynaric/Geost announced); cash $829M via serial equity; corporate rename to Rocket Lab Corp | FY2025 10-K + XBRL pull | Mixed (scale + dilution) | 37/50 (Neutron scale-up) |
| Emerging next state | End-to-end space company: build, launch, operate | Neutron first flight; constellation prime ladder; possible applications/services layer (**⚠ verify** management framing in 10-K/calls) | 8-K stream, next 10-Qs | ? | — |

```text
Launch startup (Electron)
        ↓
Small-launch operator (product becomes platform: the AM line, not the rocket, is the asset)
        ↓
Launch + merchant components supplier (acquisition ladder)
        ↓
Integrated space-systems prime (SDA-class constellation contracts)
        ↓
(unproven) Reusable medium-lift + end-to-end space company
```

The §2 test: the description's economics genuinely changed — customer mix shifted toward multi-year government primes, capital needs exploded (capex +133%), and the core capability (AM engine production) is being re-applied rather than abandoned. This is capability reuse, not narrative drift — but the economic-quality dimension of the change is still unfunded by operations.

## 12. Filing Baseline

- **Latest baseline pull:** [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Baseline_RKLB]]
- **10-K reviewed:** FY2025 10-K filed 2026-02-26 — inventory only; contents **⚠ to read** (segments, backlog, AM risk factors, debt note, Neutron milestones queued). 10-K/A (2025-04-30, amending FY2024) — most likely routine Part III incorporation, but confirm; a restatement would be a §7.3 hard stop in the health review.
- **10-Qs reviewed:** Q1 2026 (filed 2026-05-07) — **⚠ to read**; FY2025 quarters inventoried.
- **8-K timeline:**

| Date | Item / Event | Meaning | Next Step |
|---|---|---|---|
| 2026-02-26 | 2.02 — FY2025 earnings | Routine | Compare exhibit vs 10-K |
| 2026-03-12 | 5.08, 8.01 | Annual-meeting/nomination mechanics + unspecified event | Read 8.01 body |
| 2026-03-17 | 8.01, 9.01 (+ 424B5 same day) | Equity offering announced | Size, use of proceeds |
| 2026-03-30 | 5.02, 9.01 | Officer/director change | Who and why — §7.3 check |
| 2026-04-14 | **3.02**, 7.01, 8.01, 9.01 | **Unregistered equity issuance** — flagged `watch` in pull | [[13_Company_Intel/Findings/2026-08-02 - RKLB - Unregistered share issuance (8-K Item 3.02)|Finding logged]] — likely acquisition stock consideration; verify |
| 2026-05-07 | 2.02, 9.01 — Q1 2026 earnings | Routine | Read vs 10-Q |
| 2026-05-08 | 8.01, 9.01 (+ 424B7 same day) | Resale registration for selling holders | Whose shares — links to 3.02? |
| 2026-05-20 | 8.01, 9.01 (+ 424B5 same day) | Another offering/takedown | Cumulative 2026 issuance tally |
| 2026-05-21 | 5.07 | Annual-meeting vote results (meeting 2026-05-20) | Say-on-pay dissent level |
| 2026-06-05 | 5.02 | Officer/director change (Form 3 filed same window) | Identity; CFO/controller would be §7.3 |
| 2026-06-29 | **1.01**, 7.01, 9.01 | Material definitive agreement | Read exhibit — could be a major contract win or financing |

- **Proxy (DEF 14A):** filed 2026-04-06 (meeting 2026-05-20); two DEFA14A supplements (2026-04-06, 2026-05-12 — a supplement eight days before the meeting suggests a contested item, **⚠ verify**) — board, comp metrics, Beck stake **⚠ to read**.
- **Insider filings (3/4/5, 144):** cluster of Form 4s late May–early June 2026 (post-vest sales pattern), Form 3 2026-06-05 (new insider), Form 4 + 144 early July — confirm 10b5-1 footnotes before treating as signal.
- **13D / 13G:** 13D/A amendments through 2024-12-05 — concentrated holders actively amending; 13G flow 2024. Identify filers. **⚠ to read.**
- **13F ownership trend:** not pulled (paid tier); revisit.
- **Registration statements / offerings:** S-3ASR (2025-03-11) with five prospectus supplements since — 424B5 2025-03-11, 2025-05-30, 2025-09-15, 2026-03-17, 2026-05-20 (primary) and 424B7 2025-08-12, 2026-05-08 (resale). **The offering trail is the single most informative disclosure pattern in the baseline: it is how a −$322M-FCF company tripled its cash.**
- **Material exhibits opened:** none yet.

## 13. Financial Skeleton

Source: [[05_Data_Pulls/Edgar/2026-08-02_EDGAR_Facts_RKLB]] (XBRL, FY2025 vs FY2024)

| Metric | Current | Prior | Direction | Explanation | Concern |
|---|---:|---:|---|---|---|
| Revenue | $601.8M | $436.2M | ↑ 38.0% | Space Systems primes + launch cadence/price; organic vs acquired split unknown (goodwill +190%) | Acquisition masking — verify segment/acquisition notes |
| Gross margin | 34.4% | 26.6% | ↑ +7.8pp | Mix + launch economics improving — the first income-statement evidence the AM cost thesis is real | Durability through Neutron ramp |
| Operating margin | −38.0% | −43.5% | ↑ (less bad) | Loss widened in dollars (−$228.8M) as R&D +55% outran gross-profit gains | By design — but must inflect post-Neutron |
| Operating cash flow | −$165.5M | −$48.9M | ↓ 3.4× worse | Working capital (inventory +$39M) + deferred revenue drawdown −$21M on top of losses | Burn accelerating into first flight |
| Capex | $156.3M | $67.1M | ↑ 132.9% | Neutron factory/launch complex build | Return entirely contingent on program success |
| Free cash flow | −$321.8M | −$116.0M | ↓ | The machine consumed ~$0.53 per revenue dollar | Runway ~2.6y at FY2025 burn; burn still rising |
| Receivables | $39.0M | $36.4M | ↑ 7.0% | −31pp vs revenue growth — collections clean | None |
| Inventory | $158.4M | $119.1M | ↑ 33.0% | +9.7pp vs COGS — build ahead of launch/backlog (benign) or demand slip (negative) | 🟡 routed in health review |
| Deferred revenue (current) | $195.4M | $216.2M | ↓ 9.6% | Milestone recognition drawing down prepayments faster than new bookings replenish? | Needs contract-liability + backlog note |
| Debt | $1.7M LT tagged | $44.0M | ↓ | Tag almost certainly excludes the Feb 2024 $355M converts — coverage gap, not deleveraging | Resolve in debt note |
| SBC | $71.1M | $56.8M | ↑ 25.1% | 11.8% of revenue, ratio *falling* from 13.0% | Red band but decelerating — see review |
| Diluted shares | 530.7M | 495.9M | ↑ 7.0% | Mostly primary issuance (ATM + acquisition stock), not SBC | The price of the build — must slow post-Neutron |

Interpretation: the skeleton is a coherent pre-FCF builder — every red line (burn, capex, dilution) is the same decision viewed from a different statement, and the one line that had to improve for the thesis to survive (gross margin) improved materially. The two lines that don't fit the clean story are deferred revenue shrinking and goodwill tripling.

## 14. Scores

Rubrics: [[04_Reference/EDGAR_Company_Deconstruction_Framework]] §12. Initial pass from XBRL + filing inventory; re-score after the 10-K/proxy read.

| Score | Value | Max | Notes |
|---|---:|---:|---|
| Company clarity | 19 | 25 | Simple, stable two-segment description; losses reconcile honestly to cash burn; docked for acquisition-blurred comparability and unread segment detail |
| Economic quality | 16 | 35 | Vertical integration and government demand are real credits; capped by price-taking under the SpaceX umbrella, heavy capital intensity, negative returns, pre-FCF fragility |
| Governance and control | 21 | 35 | Single share class + large founder stake are genuine credits vs peers; docked for unread proxy, unexplained 5.02s, and strategy gated by continuous equity issuance |
| Disclosure integrity | 22 | 35 | Mishaps disclosed openly, launch-by-launch visibility, stable segments; docked for XBRL tag gaps (converts/interest), non-GAAP reliance, and no AM unit-cost disclosure |
| Evolution (Neutron scale-up) | 37 | 50 | Core reinforcement 5, capability reuse 5, customer fit 4, flywheel 4, moat 4, optionality 5 — dragged by economic quality 2 (cash-consuming, return unproven), reversibility 2 (hard to exit), complexity 3, disclosure 3 |

## 15. Findings Log

```dataview
TABLE date, classification, thesis_impact, machine_effect
FROM "13_Company_Intel/Findings"
WHERE ticker = this.ticker
SORT date DESC
```

## 16. Thesis and Monitoring Triggers

### What Is Already Reflected in the Price?
A +44.9% 12-month run (vs ARKX +19.8%) into a still-pre-FCF company says the market is already paying for a successful Neutron debut and continued Space Systems primes — the AM scale-up succeeding is substantially in the price; it failing is not.

### What Would Break the Thesis?
Archimedes/Neutron qualification failure or serial slippage; the equity window closing before FCF break-even; gross margin reversing (would falsify the AM cost-advantage claim); Starship-era pricing arriving before Neutron earns a return.

### What Would Confirm the Thesis?
Neutron first flight and re-flight; launch gross margin continuing to climb with cadence; inventory divergence closing as built hardware converts to revenue; dilution decelerating below ~3%/yr once heavy capex passes; SDA-class prime awards repeating.

### Monitoring Triggers (observable, not vibes)
1. Neutron first-flight outcome and any schedule language change (8-K stream / next 10-Q MD&A).
2. Consolidated gross margin < 30% in any FY2026 10-Q (AM cost thesis check).
3. Inventory divergence vs COGS > +10pp for two consecutive quarters *without* matching backlog growth.
4. New 424B5 takedown at a price below the prior one (financing on worsening terms).
5. Diluted shares +>5% YoY again in FY2026 despite the $829M cushion.
6. Deferred revenue falling again while revenue grows (bookings not replenishing).
7. AM/manufacturing risk-factor wording moving hypothetical → actual ("we have experienced defects in additively manufactured components…").
8. 8-K 2026-06-29 Item 1.01 exhibit contents; any new 13D or 13D/A amendment.

## 17. Next Research Queue

1. Read FY2025 10-K: segment split and margins, backlog definition/composition, AM and Neutron risk factors, debt note (converts status), acquisition footnote (Mynaric/Geost consideration and PPA).
2. Read DEF 14A 2026-04-06 + DEFA14As: Beck stake, comp metrics (Neutron-milestone-linked?), say-on-pay tally (8-K 2026-05-21).
3. Read Q1 2026 10-Q: sequential inventory/deferred revenue/burn; Neutron status language.
4. Resolve the Item 3.02 finding (unregistered issuance → 424B7 resale chain) and decompose FY2025–26 dilution.
5. Identify 13D/A filers (Dec 2024) and the two 2026 5.02 departures/appointments; read 8-K 2026-06-29 Item 1.01 exhibit.

## 18. Source Log

| Date Reviewed | Filing | Period / Event Date | Why It Matters | Key Sections | Open Questions |
|---|---|---|---|---|---|
| 2026-08-02 | XBRL companyfacts pull | FY2025 vs FY2024 | Financial skeleton | All | Converts tag gap, deferred revenue drawdown, goodwill composition |
| 2026-08-02 | Submissions baseline pull | through 2026-08-02 | Filing inventory | Offering trail, 8-K items 3.02/1.01, insider cadence, 13D/A history | 10-K/proxy/10-Q contents unread |
| 2026-08-02 | Health markers pull | FY2025 | §5 bands | 🔴 dilution +7.0%, 🔴 SBC 11.8%, 🟡 inventory +9.7pp | Routed in [[13_Company_Intel/Reviews/2026-08-02 - RKLB - Health Review]] |
