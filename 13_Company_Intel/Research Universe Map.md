---
title: "Company Intel — Research Universe Map"
type: "reference"
last_updated: "2026-08-02"
tags: [company-intel, universe-map]
---

# Research Universe Map

Thematic connection layer for the Company Intel universe. Each theme is anchored on a covered dossier company and maps the companies **upstream, downstream, peer, and macro-linked** to it — so a finding in one name routes to the names it should be checked against.

> **Legend:** ✅ dossier exists (`13_Company_Intel/Companies/`) · 🎯 promotion candidate (scaffold next) · ⚪ watch-only (map edge, no dossier planned)
> **Promotion pipeline:** map edge → `edgar scaffold --ticker X` → `edgar baseline` + `edgar facts` → `edgar health --review`
> Wikilinked tickers have entity notes in `08_Entities/Stocks/`; plain-bold tickers need an entity note created at promotion.

---

## 1. AI Compute Value Chain

Anchor: [[NVDA]] ✅ — the chain that designs, fabricates, powers, and monetizes accelerated compute. [[META]] ✅ and [[AMZN]] ✅ sit here twice: as hyperscaler customers (capex payers) and as models for whether AI capex earns returns (their §16 reviews already flag exactly this).

| Company | Role in chain | Tier | Why connected |
|---|---|---|---|
| **TSM** | Sole leading-edge foundry | 🎯 | NVDA's single manufacturing dependency; the §14 bottleneck question in physical form |
| **ASML** | Litho monopoly upstream of TSM | 🎯 | One layer deeper on the same dependency |
| **AVGO** | Custom ASICs + networking | 🎯 | The "hyperscalers design their own" bear case on NVDA, quantified |
| **MU** | HBM memory | ⚪ | Memory content per accelerator; inventory-cycle tell |
| **AMD** | Merchant accelerator peer | ⚪ | Pricing/share check on NVDA margins |
| **VRT** | Power & cooling for DCs | 🎯 | Where the DC buildout's physical constraint shows first |
| [[MSFT]] / [[GOOGL]] | Hyperscaler customers | ⚪ | Demand reality-check for NVDA revenue quality |
| [[EQIX]] | Data-center REIT | ⚪ | Rent/occupancy = third-party read on DC demand |

**Theses:** [[AI Power Infrastructure]] · [[Semiconductor Sovereignty CHIPS Act]]
**Macro:** [[Geopolitical Escalation]] (export controls are the chain's policy risk); [[Rate Hike Cycle]] pressures the long-duration capex math.
**Cross-check:** NVDA's 🔴 inventory divergence should be read against MU/TSM inventory days and hyperscaler capex guidance — same cycle, three vantage points.

## 2. Data-Center Power & Grid Buildout

Anchors: NEE ✅ (regulated + renewables) and [[CAT]] ✅ (reciprocating gensets are now DC baseload bridge power — the two dossiers connect here).

| Company | Role | Tier | Why connected |
|---|---|---|---|
| [[VST]] / [[CEG]] / [[NRG]] | Merchant/IPP power sellers | ⚪ | The unregulated way to own the same MW scarcity NEE owns regulated |
| [[GEV]] | Turbines + grid equipment | ⚪ | Order book = leading indicator for NEE/CAT demand |
| [[ETN]] / [[HUBB]] / [[POWL]] / [[WCC]] | Electrical equipment | ⚪ | [[Grid Equipment Bottleneck]] thesis constituents |
| [[PWR]] / [[MTZ]] / [[MYRG]] / [[STRL]] | Grid/DC contractors | ⚪ | Backlog = construction-side confirmation |
| **CMI** | Genset peer to CAT | ⚪ | Splits the CAT DC story from the mining/construction story |
| [[AMSC]] / [[BW]] | Grid tech small caps | ⚪ | High-beta expressions of the same theme |

**Theses:** [[AI Power Infrastructure]] · [[Grid Equipment Bottleneck]] · [[Nuclear Renaissance SMRs]] · [[Grid-Scale Battery Storage]]
**Macro:** [[Rate Cut Cycle]] relieves NEE's 6.07x-leverage financing model; [[Inflationary Boom]] favors the whole chain.

## 3. GLP-1 / Metabolic Platform

Anchor: [[LLY]] ✅ — the +49.8pp inventory build is a bet on this entire chain's demand.

| Company | Role | Tier | Why connected |
|---|---|---|---|
| **NVO** | Duopoly peer | 🎯 | The direct read on pricing discipline vs share war — LLY's inventory question is unanswerable without it |
| **WST** | Injectable components | 🎯 | Sells to both duopolists; volume tell without pricing risk |
| **MCK** | Distribution | ⚪ | Channel inventory check on LLY's receivables divergence |
| **HIMS** | Compounding/telehealth | ⚪ | The §12 extraction-risk vector (off-brand demand capture) |
| [[JNJ]] / [[MRK]] / [[PFE]] / [[ABBV]] | Big-pharma peers | ⚪ | Patent-cliff capital-allocation contrast to LLY's single-franchise concentration |

**Theses:** [[GLP-1 Metabolic Disease Revolution]] (direct)
**Macro:** demand-inelastic ([[Recession]]-resilient revenue) but politically exposed (drug-pricing intervention is the §12 return channel); dollar-sensitive international book.

## 4. Gov-Tech & Defense Software

Anchor: [[PLTR]] ✅ — software-defined defense, where the §5.6 SBC/dilution pattern is endemic.

| Company                               | Role                            | Tier | Why connected                                                                |
| ------------------------------------- | ------------------------------- | ---- | ---------------------------------------------------------------------------- |
| [[LMT]] / [[NOC]] / [[RTX]] / [[LHX]] | Hardware primes                 | ⚪    | Budget-share contest: software eats platform budgets or doesn't              |
| [[KTOS]] / [[AVAV]] / [[TXT]]         | Autonomy/drones                 | ⚪    | [[Defense AI Autonomous Warfare]] constituents; PLTR's TITAN/Maven adjacency |
| **AXON**                              | Public-safety software+hardware | 🎯   | The best SBC/valuation/net-retention comp for PLTR outside defense           |
| **BAH** / **LDOS**                    | Services incumbents             | ⚪    | The margin-structure contrast PLTR claims to disrupt                         |
| [[ESLT]] / [[TDY]]                    | Sensors/international           | ⚪    | Rearmament breadth check                                                     |

**Theses:** [[Defense AI Autonomous Warfare]] · [[Fiscal Scarcity Rearmament]] · [[AI Power Defense Stack]]
**Macro:** [[Geopolitical Escalation]] is the demand regime; fiscal cycles set the ceiling.

## 5. Logistics Rails & E-Commerce Physical Layer

Anchors: [[AMZN]] ✅ (demand side) and [[PLD]] ✅ (landlord side) — the same warehouse economy from opposite sides of the lease.

| Company | Role | Tier | Why connected |
|---|---|---|---|
| **UPS** | Parcel network | 🎯 | Volume/pricing tell for e-commerce physical flow; AMZN insourcing risk quantified |
| **ODFL** | LTL freight | 🎯 | The cleanest freight-cycle indicator — leads [[Recession]] regime shifts |
| **FDX** / **GXO** | Parcel peer / contract logistics | ⚪ | Confirmation edges |
| [[EQIX]] / [[WELL]] | REIT contrast set | ⚪ | Cap-rate sensitivity comparison for PLD's multiple |
| [[DHI]] / [[LEN]] | Homebuilders | ⚪ | Same rate-transmission channel as PLD; [[Housing Supply Correction]] anchor names |

**Theses:** [[Housing Supply Correction]] (rate-transmission cousin)
**Macro:** [[Rate Cut Cycle]] is PLD's multiple unlock; freight volumes (ODFL) lead [[Recession]] calls by ~2 quarters.

## 6. Consumer Cash-Flow Defensives

Anchor: [[COST]] ✅ — membership-fee economics as the quality benchmark.

| Company | Role | Tier | Why connected |
|---|---|---|---|
| **WMT** | Scale peer + ads/membership flywheel | 🎯 | The only comparable flywheel; trade-down share contest with COST |
| **BJ** | Warehouse-club clone | ⚪ | Model validation at lower quality |
| **TGT** | Execution contrast | ⚪ | What the same macro does to a weaker machine |
| [[KO]] / [[PG]] / [[BRBR]] | Staples pricing power | ⚪ | §5.1 price-vs-volume discipline comparisons |

**Macro:** [[Recession]] / [[Stagflation]] resilience (trade-down beneficiary); watch §5.1 price-vs-volume mix — the framework's first growth-quality question is *the* staples question.

## 7. Financial Plumbing & Rate Transmission

Anchor: [[JPM]] ✅ — the deposit-spread-fee machine at full scale.

| Company | Role | Tier | Why connected |
|---|---|---|---|
| **BAC** | Rate-sensitivity contrast | 🎯 | Larger held-to-maturity drag — same regime, different balance-sheet posture |
| [[GS]] | Capital-markets pure-play | ⚪ | Fee-cycle read on JPM's IB segment |
| [[V]] / **MA** | Payment rails | ⚪ | Fee-not-spread: the financial machine without credit or duration risk |
| **SCHW** | Deposit-beta case study | ⚪ | What [[Rate Hike Cycle]] does to sticky-deposit assumptions |
| **BX** / **APO** | Private credit | ⚪ | Where bank CRE/leveraged risk migrated — JPM's §12 shadow-competition question |
| [[COIN]] / [[AXP]] / [[BRK_B]] | Adjacent financials | ⚪ | Risk-appetite and consumer-credit tells |

**Macro:** [[Rate Cut Cycle]] compresses NIM but relieves credit and duration; [[Recession]] flips the provision line (JPM's next checkpoint is exactly this — provisions ≤ ~1.2% of loans, due 2026-08-10).

## 8. Hydrocarbon Cash Machines

Anchor: [[XOM]] ✅ — the 73%-of-FCF dividend question repeats across the sector.

| Company | Role | Tier | Why connected |
|---|---|---|---|
| [[CVX]] | Supermajor peer | ⚪ | Same payout-at-mid-cycle test, different portfolio |
| **COP** | E&P discipline benchmark | 🎯 | Cleanest variable-dividend capital-return contrast to XOM's fixed payout |
| [[SLB]] | Services | ⚪ | Upstream capex cycle read |
| [[OXY]] | Levered E&P | ⚪ | What XOM looks like without the balance sheet |
| **VLO** / **MPC** | Refining | ⚪ | Crack-spread tell on the downstream segment |
| **KMI** / **ET** | Midstream tolls | ⚪ | The fee-based contrast inside the same molecule flow |

**Theses:** adjacent to [[Dollar Debasement Hard Money]] (with [[FCX]], [[NEM]], [[GOLD]], [[WPM]])
**Macro:** [[Inflationary Boom]] / [[Stagflation]] hedge; [[Geopolitical Escalation]] supply-shock beneficiary — the portfolio's main negative-correlation block.

## 9. Industrial Cycle Tells

Anchor: [[CAT]] ✅ — Pattern C name (earnings falling, stock rewarded); these edges test which side is right.

| Company | Role | Tier | Why connected |
|---|---|---|---|
| **DE** | Ag-cycle twin | 🎯 | Same dealer-channel + captive-finance model in a different end market — isolates what's CAT vs what's cycle |
| **URI** | Equipment rental | 🎯 | Rental utilization = the capex canary that leads CAT orders |
| **CMI** | Engines/gensets | ⚪ | Shares the DC-power kicker (theme 2 crossover) |
| **PCAR** | Trucks | ⚪ | Freight-linked industrial demand (theme 5 crossover) |
| [[ETN]] | Electrical industrial | ⚪ | The secular-vs-cyclical industrial contrast |

**Macro:** [[Recession]] leads through dealer inventories; China/commodity capex links to [[FCX]].

## 10. Precision Materials & Gases

Anchor: [[LIN]] ✅ — the only clean §5 sheet in the universe; edges test whether that's structural.

| Company | Role | Tier | Why connected |
|---|---|---|---|
| **APD** | Direct peer | 🎯 | Same industry, weaker capital-allocation record (activist episode) — the natural experiment proving LIN's §16.B score is management, not just industry structure |
| **SHW** / **ECL** | Specialty pricing-power peers | ⚪ | Quality-compounder comparison set |
| [[FCX]] / [[NEM]] | Upstream materials macro | ⚪ | The cyclical contrast LIN's take-or-pay contracts dampen |

**Macro:** industrial-production-linked but contract-dampened; hydrogen capex is the [[Inflationary Boom]] optionality.

---

## Cross-cutting macro reaction table

How the twelve anchors sort under each regime — the fastest way to sanity-check a regime call against company-level evidence:

| Regime | Helped | Hurt | Transmission to watch |
|---|---|---|---|
| [[Rate Cut Cycle]] | [[PLD]], NEE, [[PLTR]]/[[NVDA]]/[[META]] (duration), [[DHI]]/[[LEN]] | [[JPM]] (NIM) | Cap rates (PLD), utility financing cost (NEE), growth multiples |
| [[Rate Hike Cycle]] | [[JPM]] (NIM, to a point) | NEE (6.07x leverage), [[PLD]], long-duration tech | Deposit beta, refinancing walls |
| [[Inflationary Boom]] | [[XOM]], [[LIN]], [[CAT]], grid chain | [[COST]] margins (lagged pricing) | Realized prices vs unit volumes (§5.1) |
| [[Stagflation]] | [[XOM]], [[COST]] (trade-down) | [[CAT]], [[AMZN]] discretionary, [[JPM]] credit | Freight volumes (ODFL edge), provisions |
| [[Recession]] | [[COST]], [[LLY]] (inelastic) | [[CAT]], [[JPM]], [[AMZN]], [[PLD]] rents | Dealer/channel inventory, charge-offs, occupancy |
| [[Geopolitical Escalation]] | [[PLTR]], defense edges, [[XOM]] | [[NVDA]]/TSM chain (export controls, Taiwan) | Export-control 8-Ks, defense budget lines |
| [[Goldilocks]] / [[Risk-On]] | [[NVDA]], [[META]], [[PLTR]], [[AMZN]] | hedged/defensive names lag | Multiple expansion vs estimate revisions (§9.2) |

## Promotion queue

Ranked by edge coverage (one promotion illuminates the most existing dossiers):

1. **TSM** — NVDA's manufacturing spine + Geopolitical Escalation pivot (themes 1, 4)
2. **NVO** — LLY's inventory question is half-unanswerable without it (theme 3)
3. **WMT** — COST's only true flywheel peer + recession trade-down contest (theme 6)
4. **BAC** — makes JPM's balance-sheet posture legible by contrast (theme 7)
5. **DE** — isolates CAT-specific vs cycle-wide deterioration (theme 9)
6. **AVGO** — the custom-silicon bear case on NVDA (theme 1)
7. **APD** — the management-quality control group for LIN (theme 10)
8. **VRT** — physical bottleneck of themes 1+2 in one ticker
9. **URI** — the industrial-cycle canary (theme 9, macro table)
10. **AXON** — PLTR's honest SBC/retention comp (theme 4)

```powershell
# promote (from My_Data\scripts):
node run.mjs edgar scaffold --ticker TSM
node run.mjs edgar baseline --ticker TSM
node run.mjs edgar facts --ticker TSM
node run.mjs edgar health --ticker TSM --benchmark SMH --review
```

## Hygiene

- **NEE has no entity note** in `08_Entities/Stocks/` despite having a dossier — create one and link the dossier's `core_entities` to it.
- On each promotion: create the entity note, set `related_entities` to this map's theme neighbors, and add the dossier's `core_entities` wikilink — that's what makes the graph traversable.
- Revisit this map quarterly with the §17 review cycle: an edge that never gets cross-checked is dead weight; prune it.
