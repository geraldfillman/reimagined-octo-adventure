---
node_type: "company_intel"
company: "Palantir Technologies Inc."
ticker: "PLTR"
cik: "0001321655"
sector: "Services-Prepackaged Software"
fiscal_year_end: "12-31"
research_status: "Baseline"
confidence: "Medium"
overall_state: "yellow"
one_liner: "Palantir sells software platforms that plug into an institution's data and run its operations and decisions, charging governments and large companies recurring subscription and usage fees."
last_updated: "2026-08-01"
clarity_score: 21
economic_quality_score: 27
governance_score: 21
disclosure_score: 25
evolution_score: 42
core_entities: ["[[PLTR]]"]
related_theses: ["[[Defense AI Autonomous Warfare]]", "[[AI Power Defense Stack]]", "[[Fiscal Scarcity Rearmament]]"]
tags: [company-intel]
---

# Palantir Technologies Inc. — Company Dossier

> Method: [[04_Reference/EDGAR_Company_Deconstruction_Framework]] · Board: [[00_Dashboard/Company Intel Board]]
> `research_status`: Scaffold → Card → **Baseline** → Active → Archived
> Evidence base: [[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Baseline_PLTR]] · [[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Facts_PLTR]]
> Items marked **⚠ verify** are not yet confirmed against the FY2025 10-K / 2026 proxy — do not treat as evidenced.

---

# Part A — Bare-Bones Company Card

## 1. Simplest Description

### One Sentence (explain it to a ten-year-old)
Palantir builds software that helps governments and big companies gather all their scattered information in one place and use it to run their operations, and charges them large recurring fees.

### One Paragraph
Palantir takes an institution's messy, siloed data (inputs), integrates it into a common model of the organization — an "ontology" — and deploys applications on top (Gotham for defense/intel, Foundry for enterprises, AIP for AI/LLM workflows, delivered via its Apollo infrastructure). The output is operational decision software embedded in how the customer actually runs (targeting workflows, supply chains, hospital operations). Customers are US and allied government agencies and large enterprises; they pay multi-year subscription and usage fees. Almost no physical capital is required (FY2025 capex: $33.9M on $4.5B revenue) — reinvestment is engineers and deployment capacity.

### What Would Disappear If the Company Disappeared?
The connective layer between institutional data and day-to-day operational decisions at defense/intel agencies and large enterprises — workflows that would otherwise take years of internal integration work to rebuild.

## 2. The Company Machine

- **Capital source:** VC-funded 2003–2020 (Founders Fund et al.); direct listing 2020 (S-1 in baseline); now self-funding — FY2025 FCF $2.1B, zero long-term debt since 2021 (XBRL).
- **Inputs:** software + forward-deployed engineers, hyperscaler cloud capacity, security accreditations/clearances, access to customer data.
- **Transformation:** integrates siloed data into an ontology; deploys decision applications and AI workflows on top.
- **Output:** operational software platforms (Gotham, Foundry, AIP) delivered and updated via Apollo.
- **Customer / user / payer:** government program offices (defense, intel, allied governments) and enterprise C-suites; operators use it daily, agencies/corporates pay.
- **Collection method:** multi-year subscription contracts plus usage/consumption expansion; government IDIQ-style vehicles.
- **Required reinvestment:** R&D ($557.7M FY2025) and deployment/sales headcount; trivial physical capex.
- **Owner distributions:** no dividend; buyback authorization exists — **⚠ verify** actual repurchase amounts vs. SBC issuance in the FY2025 cash-flow statement.

## 3. Revenue Engine

| Stream | Who Pays? | Why Do They Pay? | Pricing Unit | Recurring? | Margin | Growth Driver | Main Risk |
|---|---|---|---|---|---|---|---|
| Government (Gotham/AIP) | US DoD, intel community, allied governments | Mission software that works in classified environments; few substitutes | Multi-year contracts, usage tiers | Yes (renewal + expansion) | High (82.4% blended GM) | Rearmament budgets, software-defined warfare | Appropriations politics, program cancellations |
| Commercial (Foundry/AIP) | Large enterprises, growing US mid-market | Data → operations integration; AIP turns LLM pilots into production | Subscription + consumption | Yes | High | AIP bootcamp motion, US commercial adoption | LLM-native competition, macro IT budgets |

- FY2025 government/commercial split and US-commercial growth rate: **⚠ verify** in FY2025 10-K segment footnote (baseline link).
- Which stream funds the others? Government historically funded the commercial build-out.
- Highest incremental margin: commercial usage expansion on existing deployments.
- First to disappear in a recession: new commercial logos; government base is stickier.

## 4. Cost Engine

| Cost | Fixed / Variable / Step-Fixed | Driver | Passable to Customers? | Strategic or Wasteful? | Filing Location |
|---|---|---|---|---|---|
| Cost of revenue (cloud hosting, deployment personnel) | Mostly variable | Deployments, usage | Partly (priced in) | Strategic | 10-K cost of revenue note |
| Sales & marketing (incl. forward-deployed pilots/bootcamps) | Step-fixed | Logo acquisition motion | No | Strategic — this *is* the moat-building motion | Income statement |
| R&D ($557.7M FY2025, +9.8% — falling as % of revenue) | Step-fixed | Platform velocity | No | Strategic; watch for underinvestment | Income statement |
| Stock-based compensation ($684.0M FY2025, ~15% of revenue, flat y/y) | Step-fixed | Retention/hiring | No — real owner cost via dilution | Mixed — excluded from adjusted metrics | SBC footnote |
| G&A | Step-fixed | Scale | No | Neutral | Income statement |

- Cost that rises before revenue: bootcamps/pilots (S&M) — deliberately.
- Costs capitalized instead of expensed: minimal (capex $33.9M) — clean.
- Recurring cost management calls "one-time": none evident in XBRL pass; **⚠ verify** non-GAAP exclusions history (§12.4 concern — SBC exclusion is large and permanent).

## 5. Assets and Capabilities

### Critical Assets
1. Ontology/platform codebase (Gotham, Foundry, AIP, Apollo) — two decades of institutional-data plumbing.
2. Security accreditations and cleared footprint (FedRAMP, IL5/IL6-class environments) — years to replicate.
3. Net-cash balance sheet: $1.4B cash + short-term investments (**⚠ verify** marketable-securities line; cash alone fell 32% y/y) and no debt.

### Reusable Capabilities
1. Forward-deployed engineering — landing inside messy institutions and shipping working software fast.
2. AIP bootcamp go-to-market — compressing enterprise sales cycles into days-long working prototypes.
3. Operating in classified/regulated environments — a capability, not just a certificate.

### Assets That Look Valuable but May Be Replicable
1. LLM orchestration features per se — the models are commodities; the ontology integration is the defensible part.
2. Brand mystique — helps with defense, cuts both ways commercially (Europe/privacy).

## 6. Dependencies and Bottlenecks

| Dependency | Type | Importance | Replaceability | Evidence | Trigger |
|---|---|---|---|---|---|
| Hyperscaler cloud (AWS/Azure) | Supplier/Infrastructure | High | Medium (multi-cloud by design) | 10-K supplier discussion **⚠ verify** current terms | Hosting cost spikes, hyperscalers competing directly |
| US government appropriations | Customer/Regulation | High | Low | Government segment share | CR/shutdown delays, program cuts |
| Cleared engineering talent | Talent | High | Low | Human-capital disclosure | Attrition spike, SBC cuts |
| AI compute availability (via clouds) | Commodity | Medium | Medium | — | AIP delivery cost inflation |
| European data/privacy regimes | Regulation | Medium | — | Risk factors | Adverse rulings on gov/health contracts |

### Current Bottleneck
Deployment and go-to-market capacity, not demand or capital: converting AIP pilots/bootcamps into production contracts at scale. Partner/channel expansion is the release valve. This bottleneck is partly a **moat** — competitors face a harder version (no cleared, forward-deployed bench).

### If Demand Doubled, What Breaks First?
Implementation talent (forward-deployed engineers), then government contracting-vehicle capacity. Not capital, not compute, not manufacturing.

## 7. Flywheel

```text
AIP bootcamps produce working prototypes in days
  ↓
Fast conversion to production contracts
  ↓
Ontology embeds deeper into customer operations
  ↓
Switching costs and usage expansion rise (NDR)
  ↓
Reference customers and case studies accumulate
  ↓
More bootcamps, cheaper customer acquisition
```

## 8. Reverse Flywheel

```text
LLM tooling commoditizes; rivals and in-house stacks replicate use cases
  ↓
Pilots stall at proof-of-concept; conversion rates fall
  ↓
Usage expansion (NDR) decelerates; growth slows
  ↓
SBC-heavy compensation gets harder to sustain as stock derates
  ↓
Deployment talent attrition; delivery quality slips
  ↓
Churn rises; government base becomes the only defensible core
```

## 9. Control and Decision Rights

- **Voting control / share classes:** Three-plus-one class structure — Class A (1 vote), Class B (10 votes), and **Class F founder shares** whose variable votes keep founders Karp, Thiel, and Cohen at just under 50% of total voting power *regardless of economic ownership*, so long as they meet minimum holding thresholds. This is the defining governance fact. Current percentages: **⚠ verify** in DEF 14A filed 2026-04-24 (baseline link).
- **Top holders:** Passive index complex (S&P 500 member since 2023); 13G filers only — **no 13D on file** (baseline: ownership section, all 13G/A).
- **Insider alignment:** Founders hold large economic stakes; steady Form 4 / 144 plan-sale cadence June–July 2026 (baseline) — **⚠ verify** 10b5-1 footnotes before reading as signal.
- **Bank / lender influence:** None — no debt, no revolver dependence evident (long-term debt $0 since 2021).
- **Board structure:** Founder-controlled in substance regardless of formal independence; **⚠ verify** committee composition in proxy.
- **Who can force, stop, delay, finance, or veto a major strategic move?** The three founders, effectively no one else. Minority holders are along for the ride; activists have no lever (hence no 13Ds).

## 10. Simplest Bull / Bear Case

### Bull (what improves the machine)
AIP converts the enterprise-AI experimentation wave into production deployments on Palantir's ontology; usage compounds at 82% gross margin with operating margin already tripled (10.8% → 31.6% in one year); government rearmament ([[Fiscal Scarcity Rearmament]], [[Defense AI Autonomous Warfare]]) grows the sticky base; $2.1B FCF self-funds everything.

### Bear (what damages or replaces the machine)
LLM-native competitors and hyperscalers replicate the use cases cheaper; commercial growth proves shallower than the AI-pilot hype; government concentration meets budget politics; ~5%/yr dilution grinds on; any derating breaks the SBC-retention loop. (Valuation risk sits on top of all of this but is a thesis question, not a machine question.)

### Evidence Still Needed
1. FY2025 10-K: government vs. commercial split, US-commercial growth, customer concentration footnote.
2. FY2025 10-K: receivables aging/allowance — receivables +81% vs revenue +56% ([[13_Company_Intel/Findings/2026-08-01 - PLTR - Receivables outpace revenue|finding]]).
3. Balance sheet: where the cash went — cash -32% despite $2.1B FCF ([[13_Company_Intel/Findings/2026-08-01 - PLTR - Cash down despite record FCF|finding]]).
4. DEF 14A (2026-04-24): founder voting %, comp metrics, say-on-pay result.
5. Q1 2026 10-Q (filed 2026-05-05): sequential deferred revenue/RPO trend.

---

# Part B — Filing Baseline and Evolution

## 11. Evolution Timeline

| Period | Simplest Accurate Description | What Changed? | Evidence | +/−/Mixed | Evolution Score |
|---|---|---|---|---|---|
| Founding (2003–2019) | Government data-integration software house (Gotham) | Built in classified world, consulting-heavy delivery | S-1 (2020, baseline) | + | — |
| IPO (2020) | "Software that builds data infrastructure for institutions" — gov + early commercial | Direct listing; dual/founder-class structure locked in | S-1/424B4 | Mixed (governance) | — |
| Five years ago (2021) | Data platform company pushing commercial (Foundry) | SPAC-linked investment revenue (later unwound); productization | FY2021 10-K | Mixed | — |
| Prior years (2023–2024) | Profitable data + AI platform | GAAP profitability, S&P 500 entry, AIP launch | FY2023/FY2024 10-K | + | — |
| Current (FY2025) | AI operations platform for institutions | Op margin 31.6%, revenue +56%, FCF $2.1B | FY2025 10-K + XBRL pull | + | 42/50 (AIP) |
| Emerging next state | Usage-metered AI operating layer, partner-distributed | Channel/partner motion, FedStart-style onboarding | **⚠ verify** in FY2025 10-K / calls | ? | — |

```text
Government data integrator
        ↓
Data platform company (gov + commercial)
        ↓
Profitable software platform
        ↓
AI operations platform (AIP era)
```

## 12. Filing Baseline

- **Latest baseline pull:** [[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Baseline_PLTR]] (47 filings)
- **10-K reviewed:** FY2025 10-K filed 2026-02-17 — inventory only; contents **⚠ to read** (segment, concentration, receivables notes queued)
- **10-Qs reviewed:** Q1 2026 filed 2026-05-05 — **⚠ to read**
- **8-K timeline:**

| Date | Item / Event | Meaning | Next Step |
|---|---|---|---|
| 2026-05-04 | 2.02/7.01/9.01 — Q1 2026 earnings | Routine | Read exhibit vs. 10-Q |
| 2026-06-09 | 5.07 — annual-meeting vote results | Routine | Check say-on-pay dissent level |

- **Proxy (DEF 14A):** filed 2026-04-24 — **⚠ to read** (founder voting %, comp metrics, related parties)
- **Insider filings (3/4/5, 144):** steady Form 4 + 144 cadence June–July 2026; pattern consistent with plan sales — confirm 10b5-1 footnotes
- **13D / 13G:** 13G/A filers only, latest 2024-11; no activist positions
- **13F ownership trend:** not pulled (FMP 13F endpoints are paid-tier; revisit if upgraded)
- **Registration statements / offerings:** S-3ASR shelf (2024-08-06) on file — flexibility, no issuance observed in pull; original S-1/424B4 (2020) preserved for history
- **Material exhibits opened:** none yet

## 13. Financial Skeleton

Source: [[05_Data_Pulls/Edgar/2026-08-01_EDGAR_Facts_PLTR]] (XBRL, FY2025 vs FY2024)

| Metric | Current | Prior | Direction | Explanation | Concern |
|---|---:|---:|---|---|---|
| Revenue | $4.5B | $2.9B | ↑ 56.2% | AIP-era acceleration | Sustainability of rate |
| Gross margin | 82.4% | 80.2% | ↑ | Software economics intact | — |
| Operating margin | 31.6% | 10.8% | ↑↑ | Massive operating leverage | Is S&M underfeeding future growth? |
| Operating cash flow | $2.1B | $1.2B | ↑ 85.0% | Converts well (131% of NI) | — |
| Capex | $33.9M | $12.6M | ↑ | Still trivial vs revenue | — |
| Free cash flow | $2.1B | $1.1B | ↑ | Self-funding | — |
| Receivables | $1.0B | $575M | ↑ 81.2% | **Outpacing revenue** | → finding logged |
| Inventory | n/a | n/a | — | Software company | — |
| Deferred revenue (current) | $409M | $260M | ↑ 57.5% | Tracks revenue growth | — |
| Cash & equivalents | $1.4B | $2.1B | ↓ 32.2% | **Despite record FCF** | → finding logged |
| Debt | $0 | $0 | — | Debt-free since 2021 | — |
| SBC | $684M | $692M | → | ~15% of revenue, flat | Real owner cost; excluded from adj. metrics |
| Diluted shares | 2.6B | 2.5B | ↑ 4.7% | Dilution continues | Buyback not offsetting |

## 14. Scores

Rubrics: [[04_Reference/EDGAR_Company_Deconstruction_Framework]] §12. Initial pass from XBRL + filing inventory; re-score after 10-K/proxy read.

| Score | Value | Max | Notes |
|---|---:|---:|---|
| Company clarity | 21 | 25 | Simple stable description; cash reconciles (OCF 131% of NI); segment detail pending |
| Economic quality | 27 | 35 | Recurring, capital-light, net cash; docked for customer (gov) power and hyperscaler dependency |
| Governance and control | 21 | 35 | Class F structure caps minority influence by design; no lender dependence; insider stakes real |
| Disclosure integrity | 25 | 35 | Clean error history; docked for SBC-heavy non-GAAP framing and no AIP revenue attribution |
| Evolution (AIP initiative) | 42 | 50 | Strong positive evolution; weakest dimension is disclosure — AIP is not separately measurable |

## 15. Findings Log

```dataview
TABLE date, classification, thesis_impact, machine_effect
FROM "13_Company_Intel/Findings"
WHERE ticker = this.ticker
SORT date DESC
```

## 16. Thesis and Monitoring Triggers

### What Is Already Reflected in the Price?
Sustained hypergrowth and margin durability — the machine's quality is not a secret. (Quantify against multiples in the thesis layer, not here.)

### What Would Break the Thesis?
Commercial growth decelerating toward government-only growth; NDR compression; SBC/dilution grinding while the stock derates (reverse flywheel ignition).

### What Would Confirm the Thesis?
US commercial sustaining >40% growth with rising margins for several more quarters; receivables normalizing vs revenue; AIP-attributable expansion becoming visible in RPO/deferred revenue.

### Monitoring Triggers (observable, not vibes)
1. Revenue growth < 30% y/y for two consecutive 10-Qs
2. Receivables again growing > 15pp faster than revenue in the next two 10-Qs
3. SBC > 20% of revenue, or diluted shares +5% y/y despite buybacks
4. Deferred revenue + RPO growth falling below revenue growth for two quarters
5. Customer-concentration footnote: top-20 share rising
6. Risk-factor language on government budgets or AI regulation moving "may" → "has"
7. Founder Form 4 cluster outside 10b5-1 plans, or any Class B/F structural change
8. Any new 13D (would itself be news given the voting structure)

## 17. Next Research Queue

1. Read FY2025 10-K: segment footnote, customer concentration, receivables aging, RPO
2. Read DEF 14A 2026-04-24: founder voting %, comp metrics, say-on-pay result (cross-check 8-K 5.07 vote counts)
3. Read Q1 2026 10-Q: sequential receivables + deferred revenue
4. Reconcile buybacks vs. SBC issuance in FY2025 cash-flow statement
5. Resolve both open findings; re-score and consider `overall_state` green if resolved benignly

## 18. Source Log

| Date Reviewed | Filing | Period / Event Date | Why It Matters | Key Sections | Open Questions |
|---|---|---|---|---|---|
| 2026-08-01 | XBRL companyfacts pull | FY2025 vs FY2024 | Financial skeleton | All | Receivables, cash mix |
| 2026-08-01 | Submissions baseline pull | through 2026-07-24 | Filing inventory | 8-K window, insider cadence, 13G-only ownership | Proxy + 10-K contents unread |
