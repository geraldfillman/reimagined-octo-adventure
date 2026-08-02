---
title: "Corporate Health, Integrity & Market-Behavior Framework"
type: "reference"
version: "1.0"
adopted: "2026-08-02"
tags: [reference, company-intel, health-review]
---

# Corporate Health, Integrity & Market-Behavior Framework

**Purpose:** Evaluate whether a company is economically healthy, operationally improving, responsibly governed, fairly distributing value, and being accurately understood by the market.

> **Vault integration:** Reviews live in `13_Company_Intel/Reviews/` (one dated note per review, from [[03_Templates/Health_Review]]). Quantitative markers are computed by `node run.mjs edgar health --ticker X` (§5 bands from XBRL + §9 relative performance from Yahoo). Operator surface: [[00_Dashboard/Health Review Board]]. Map: [[000-moc/moc-company-intel]]. Companion method: [[04_Reference/EDGAR_Company_Deconstruction_Framework]] builds the machine model this framework scores.

---

## 1. The central idea

A company can report excellent results while weakening its future. It can also report poor results while building something durable.

This framework separates three questions that are often incorrectly blended together:

1. **Is the business producing good financial outcomes?**
2. **Is management using a sound, honest, and repeatable process?**
3. **Is the stock market rewarding or punishing the company right now?**

The three answers can disagree for years.

> **Good process does not guarantee a good short-term outcome, and a good short-term outcome does not prove a good process.**

A complete company review should therefore distinguish:

- financial health;
- operational health;
- customer and employee outcomes;
- accounting quality;
- governance and integrity;
- capital allocation;
- shareholder distributions and dilution;
- stock-price behavior;
- and the gap between market perception and underlying reality.

This is not a morality score disguised as an investment score. A well-intentioned company can still destroy capital through poor execution, and a highly profitable company can remain economically powerful despite serious misconduct. The objective is to identify both realities rather than letting one erase the other.

---

## 2. Start with the barebones company

Before using ratios or governance scores, reduce the company to its simplest economic form. (This is the same discipline as the dossier's Company Card — reuse Part A of the [[03_Templates/Company_Dossier]] rather than rewriting it.)

### Barebones description

Complete this sentence:

> **The company buys or controls `[inputs]`, transforms or organizes them through `[process]`, sells `[output]` to `[customer]`, and keeps the difference after `[major costs]`.**

Examples:

- A semiconductor designer pays engineers to design chips, hires foundries to manufacture them, licenses software around them, and sells computing capability to device makers and data-center operators.
- A retailer buys inventory, places it near customers, prices it above landed cost, and keeps the spread after labor, rent, shrinkage, logistics, and overhead.
- A bank gathers deposits and wholesale funding, lends or invests the money, earns a spread and fees, and absorbs credit, liquidity, operating, and regulatory costs.
- A software company pays to build and support code, sells access repeatedly, and keeps subscription revenue after infrastructure, sales, service, and development costs.

### Why this matters

Every marker in the rest of the framework should connect back to the company machine.

A rising metric is only good when it strengthens the machine. Revenue can rise because the company is:

- attracting more customers;
- increasing customer value;
- raising prices because the product is stronger;
- acquiring businesses;
- borrowing demand from the future;
- loosening credit standards;
- stuffing channels;
- or recognizing revenue aggressively.

Those paths produce the same headline but very different companies.

### Barebones evolution test

Update the one-sentence description annually and after major acquisitions, divestitures, or strategic shifts.

| Change in the description | Potential positive meaning | Potential negative meaning |
|---|---|---|
| One product becomes a platform | Reusable capabilities and network effects | Dependence on a single ecosystem |
| Direct sales become recurring subscriptions | Greater visibility and retention | Customers are locked into rising fees |
| Manufacturing moves in-house | Supply security and margin capture | Capital intensity and execution risk |
| Company expands into adjacent markets | Reuses distribution, brand, or technology | Complexity creep and managerial distraction |
| Revenue shifts toward services | More recurring, higher-margin economics | Underinvestment in the underlying product |
| Company becomes simpler after divestitures | Strategic focus and clearer accountability | Selling assets to cover financial weakness |
| More revenue comes from one customer | Strong validation and scale | Bargaining power and concentration risk |
| More profit comes from financing or accounting items | Useful capital-market capability | Core operating deterioration hidden by non-core income |

The most important question is:

> **Is the company becoming a stronger version of its core machine, or is it becoming harder to understand because the core is weakening?**

---

## 3. The four independent dimensions

### Dimension A — Financial health

Can the company survive, self-fund, and earn adequate returns on the capital entrusted to it?

### Dimension B — Operational health

Are products, customers, employees, supply chains, and productive capabilities actually improving?

### Dimension C — Stewardship and integrity

Does management communicate honestly, respect customers and counterparties, allocate capital rationally, and accept accountability?

### Dimension D — Market perception

Is the stock reflecting improvement, ignoring it, or rewarding deterioration?

These produce several useful states:

| Company reality | Market response | Typical interpretation |
|---|---|---|
| Healthy process and healthy results | Stock rewarded | Potential compounder; valuation remains decisive |
| Healthy process and weak current results | Stock punished | Investment phase, cyclical trough, or failed execution |
| Weak process and strong current results | Stock rewarded | Fragile success, extraction, accounting risk, or temporary monopoly economics |
| Weak process and weak results | Stock punished | Deteriorating business, restructuring case, or value trap |
| Improving process before results improve | Stock unchanged | Possible early turnaround |
| Results improve before process improves | Stock rises rapidly | Possible temporary recovery or financial engineering |

---

## 4. Marker hierarchy: what must be true first

Do not begin with valuation. First establish whether the company is investable enough to value.

### Level 1 — Survival

The company should have enough liquidity, access to capital, and operating resilience to reach the next stage of its strategy.

Primary markers: cash and available credit; debt maturities; interest burden; covenant headroom; cash burn and runway; working-capital requirements; pension, legal, environmental, or warranty obligations; dependence on a single financing source; going-concern language.

### Level 2 — Economic validity

The core product or service should create enough customer value to support attractive unit economics.

Primary markers: gross margin or contribution margin; customer retention; price realization; volume growth; customer-acquisition cost; lifetime value; product returns and warranty costs; repeat purchases; capacity utilization.

### Level 3 — Repeatability

The company should be able to reproduce growth without consuming an ever-larger amount of capital for each incremental dollar of revenue.

Primary markers: incremental margins; free-cash-flow conversion; sales efficiency; inventory and receivables behavior; recurring revenue; renewal rates; return on new stores, plants, acquisitions, or data centers.

### Level 4 — Stewardship

Management should use the cash and capabilities produced by the business responsibly.

Primary markers: return on invested capital; acquisition discipline; balance-sheet conservatism; research and maintenance spending; buyback valuation; dividends versus reinvestment needs; dilution; executive compensation; treatment of customers, employees, regulators, and minority shareholders.

### Level 5 — Market recognition

Only after the first four levels should the research process ask whether the stock is cheap, expensive, under-owned, over-owned, accumulating, or distributing.

---

## 5. Quantitative screening bands

The levels below are **investigation bands, not universal laws**. They work best for established non-financial companies and must be adjusted for sector, cyclicality, accounting model, and company maturity.

> `edgar health` computes the ratio-based markers in §5.3–§5.7 from XBRL companyfacts and classifies each into `constructive` / `investigate` / `concern` / `n/a (data gap)`. Bank and REIT filers are detected via the industry skeleton profiles and the §5.5 leverage bands are suppressed (see §14). Markers the filing data cannot support are left explicitly blank — never estimated.

### 5.1 Growth quality

| Marker | Generally constructive | Investigate | Serious concern |
|---|---:|---:|---:|
| Organic revenue growth | Positive and at least keeping pace with the market | Growth below peers or inflation | Repeated contraction without deliberate exit from low-quality revenue |
| Revenue concentration | No customer above 10% | One customer above 10% | One customer above 20% or concentration rising rapidly |
| Recurring or repeat revenue | Stable or increasing | Flat while acquisition costs rise | Falling retention masked by new-customer spending |
| Price versus volume | Balanced contribution | Growth mostly from price | Price increases paired with falling units, churn, complaints, or weaker mix |
| Acquisition contribution | Clearly separated from organic growth | Acquisitions regularly required to meet targets | Core declines while reported revenue rises through deals |

Questions to ask:

- Is growth coming from more users, more units, higher prices, acquisitions, currency, or accounting changes?
- Does the company disclose the components consistently?
- Is growth profitable after the full cost of customer acquisition, support, capital, and stock compensation?

### 5.2 Margin quality

| Marker | Generally constructive | Investigate | Serious concern |
|---|---|---|---|
| Gross margin | Stable or rising through product strength and scale | Temporary compression from a documented investment | Persistent decline alongside competition, discounting, or adverse mix |
| Operating margin | Improving with revenue scale | Flat because of deliberate R&D or capacity investment | Improved mainly through cuts to maintenance, controls, service, or necessary R&D |
| Incremental operating margin | Positive and understandable | Volatile due to launch or capacity cycle | Revenue rises but operating profit repeatedly falls |
| Adjusted versus GAAP margin | Small, stable reconciliation | Growing exclusions | "One-time" exclusions recur every year or remove ordinary costs |

Do not treat every margin decline as bad. Ask what was purchased with the lost margin. A useful classification:

1. **Maintenance spending:** required to preserve current economics.
2. **Growth investment:** likely to create future revenue or capabilities.
3. **Repair spending:** corrects prior neglect or failure.
4. **Waste:** spending that produces no durable capability.

### 5.3 Cash conversion and earnings quality

For a mature company, compare free cash flow with net income over a full cycle rather than one quarter.

| Marker | Generally constructive | Investigate | Serious concern |
|---|---:|---:|---:|
| Five-year cumulative FCF / cumulative net income | Above 80% | 50%–80% | Below 50% without a clear growth-capex explanation |
| Operating cash flow trend | Tracks or exceeds earnings | Lags due to temporary working capital | Earnings rise while operating cash stagnates or falls repeatedly |
| Receivables growth versus revenue | Similar or slower | 5–10 percentage points faster | Persistently more than 10 points faster or allowance declines despite slower collections |
| Inventory growth versus sales | Similar or supported by backlog | Temporary build ahead of launch or supply risk | Persistent excess, discounting, obsolescence, or falling turns |
| Capitalized costs | Stable and policy-consistent | Increasing capitalization | Costs moved from the income statement to the balance sheet without better economics |

Useful formulas:

```text
FCF conversion        = Free cash flow / Net income
Cash realization      = Operating cash flow / EBITDA
Receivable divergence = Receivables growth - Revenue growth
Inventory divergence  = Inventory growth - Cost-of-sales growth
```

### 5.4 Returns on capital

The core question is not whether the company grows. It is whether each additional dollar invested creates more than one dollar of value.

| Marker | Generally constructive | Investigate | Serious concern |
|---|---:|---:|---:|
| ROIC spread over estimated cost of capital | Above 5 percentage points | 0–5 points | Negative for several years without a credible investment phase |
| Trend in ROIC | Stable or rising | Cyclical decline | Falling despite acquisitions, buybacks, or rapid revenue growth |
| Incremental ROIC | New investments improve economics | Mixed results | Growth consumes capital while returns fall |
| Goodwill and acquired intangibles | Supported by acquired cash flow | Large relative to equity | Repeated impairments or deals require optimistic adjustments |

ROIC should be reconstructed rather than accepted from a data service when acquisitions, leases, excess cash, or large intangible assets materially affect the calculation.

### 5.5 Balance-sheet resilience

| Marker | Generally comfortable | Watch | High risk |
|---|---:|---:|---:|
| Net debt / EBITDA | Below 2x | 2x–3.5x | Above 4x, especially in a cyclical or shrinking business |
| EBIT / interest expense | Above 5x | 2x–5x | Below 2x |
| Near-term maturities | Covered by cash and normal FCF | Requires refinancing | Depends on favorable markets, asset sales, or covenant relief |
| Fixed versus floating debt | Well matched to cash flows | Material repricing exposure | Floating-rate burden rises while earnings weaken |
| Off-balance-sheet obligations | Clearly disclosed and manageable | Large leases, guarantees, or purchase commitments | Obligations obscure effective leverage or constrain strategy |

These bands do **not** apply directly to banks, insurers, REITs, utilities, or project-finance vehicles (see §14).

### 5.6 Share-based compensation and dilution

| Marker | Low concern | Meaningful | High concern |
|---|---:|---:|---:|
| Annual diluted-share growth | Below 1% | 1%–3% | Above 3% repeatedly |
| Stock compensation / revenue | Below 5% | 5%–10% | Above 10%, especially without strong cash economics |
| Gross buybacks versus net share count | Net shares decline | Buybacks roughly offset grants | Large buyback headlines while share count still rises |
| Executive grants | Long vesting and performance conditions | Primarily time-based | Repriced, accelerated, or protected from poor performance |

A buyback is not a shareholder return when it merely purchases shares issued to employees and executives.

### 5.7 Distributions to shareholders

"Distribution" can refer to dividends and buybacks, or to technical selling pressure in the stock. This section covers the first meaning; market distribution appears in §9.

| Marker | Generally constructive | Investigate | Serious concern |
|---|---:|---:|---:|
| Dividend / FCF | 30%–60% for many mature companies | 60%–80% | Above 100% repeatedly |
| Buyback timing | Repurchases accelerate below conservative value estimates | Mechanical repurchases at all prices | Debt-funded buybacks near valuation peaks |
| Net shareholder yield | Dividends plus net buybacks are positive and funded by FCF | Returns exceed FCF temporarily | Distributions funded by asset sales, debt, underinvestment, or supplier stretching |
| Reinvestment versus distribution | High-return projects funded first | Mixed priorities | Company distributes cash while maintenance, safety, pensions, or core systems are neglected |

The right payout level depends on opportunity cost. A company earning high incremental returns should usually reinvest more than a mature business with limited growth opportunities.

---

## 6. Operational markers: what a company should and should not be doing

### 6.1 Customer health

A healthy company should:

- solve a real problem at an acceptable total cost;
- measure retention, repeat usage, complaints, returns, and service quality;
- protect customer data and product safety;
- disclose material service failures;
- make pricing understandable;
- and avoid designing incentives that profit primarily from customer confusion or inability to exit.

Warning signs:

- revenue rises while active users, units, or retention fall;
- cancellation becomes deliberately difficult;
- complaints rise faster than customers;
- refund, return, chargeback, warranty, or legal reserves rise;
- product safety problems are described as isolated despite repeated events;
- aggressive cross-selling is rewarded without measuring customer benefit;
- the company depends on breakage, overdraft, penalties, auto-renewal inertia, or opaque fees more than management admits.

### 6.2 Employee and organizational health

A healthy company should:

- retain critical technical and operating talent;
- maintain safe staffing and equipment;
- promote capable employees internally;
- protect reporting and whistleblower channels;
- align incentives with quality, safety, and long-term customer value;
- and distinguish a one-time restructuring from chronic understaffing.

Warning signs:

- repeated layoffs followed by rehiring for the same roles;
- simultaneous departures of finance, legal, audit, security, or operations leaders;
- sales targets that can only be met through customer harm or accounting pressure;
- safety incidents accompanied by production pressure;
- key-person dependence without succession planning;
- employee turnover concealed by contractor growth;
- restructuring charges every year;
- a culture in which bad news travels slowly upward.

### 6.3 Product, innovation, and maintenance

A healthy company should:

- fund maintenance before distributing excess cash;
- separate research spending from ordinary product upkeep;
- test whether new products reach commercial scale;
- retire unsuccessful projects deliberately;
- and invest in capabilities that can be reused.

Warning signs:

- R&D is cut to meet quarterly targets while competitors accelerate;
- maintenance capex is routinely below depreciation without a clear explanation;
- product roadmaps are announced but repeatedly delayed;
- patent counts rise while product revenue does not;
- acquisitions substitute for internal capability building;
- the company launches many pilots but scales few;
- safety, cybersecurity, or quality-control spending is treated as discretionary.

### 6.4 Suppliers and counterparties

A healthy company should:

- understand supplier concentration;
- pay counterparties according to agreed terms;
- maintain alternate sources for critical inputs;
- disclose material related-party relationships;
- and avoid improving cash flow merely by imposing unsustainable terms on suppliers.

Warning signs:

- accounts payable grows much faster than cost of sales;
- suppliers require prepayment or credit insurance;
- one geography or supplier controls a critical bottleneck;
- the company records revenue through entities it funds or controls;
- vendor-financing arrangements obscure debt or demand;
- rebates, concessions, or channel incentives become essential to reported growth.

---

## 7. Governance and integrity markers

### 7.1 Good stewardship indicators

- Management explains errors before being forced to do so.
- Guidance ranges acknowledge uncertainty rather than creating false precision.
- Compensation uses multi-year performance and meaningful downside.
- The board has relevant expertise and enough independence to challenge management.
- Acquisitions are evaluated against clear return thresholds.
- Failed initiatives are closed rather than repeatedly relabeled.
- Non-GAAP metrics reconcile cleanly and remain consistent.
- The company distinguishes organic growth from acquisition, price, currency, and accounting effects.
- Insider ownership is meaningful but does not eliminate accountability.
- The company does not treat legal compliance as the full definition of responsible conduct.

### 7.2 Governance warning signs

- CEO and chair roles are combined without a strong lead independent director.
- Directors have long tenure but little relevant expertise or ownership.
- Related-party transactions are economically important.
- Compensation rises despite weak relative returns, falling ROIC, or customer harm.
- Performance targets are adjusted after the fact.
- The board grants retention awards immediately after poor execution.
- Management changes definitions whenever a KPI deteriorates.
- The auditor, CFO, controller, chief legal officer, or audit-committee chair departs unexpectedly.
- A material weakness persists for more than one reporting cycle.
- The company uses confidentiality, arbitration, or non-disparagement primarily to suppress valid complaints.

### 7.3 Hard-stop events requiring a fresh thesis

These do not automatically make a stock uninvestable, but they should suspend ordinary scoring until understood (they drive the `red_flag_override` field in the review note):

- auditor resignation or dismissal tied to disagreement;
- restatement involving revenue, cash, related parties, reserves, or executive misconduct;
- SEC, DOJ, or major regulator allegation of fraud or deliberate customer harm;
- going-concern warning;
- missed debt payment or covenant breach;
- unexplained CFO/controller departure near a filing deadline;
- undisclosed related-party financing;
- material cyberattack accompanied by delayed disclosure;
- evidence that management knew a product was unsafe and continued distribution;
- repeated failures to file reports on time.

---

## 8. Accounting markers: the difference between legal presentation and economic reality

### Companies generally should

- use stable accounting policies;
- reconcile non-GAAP measures consistently;
- disclose assumptions behind reserves and valuations;
- recognize revenue when economic performance is substantially complete;
- expense ordinary operating costs;
- and explain changes in estimates.

### Companies generally should not

- classify recurring costs as one-time;
- change segment definitions to obscure deterioration;
- capitalize ordinary operating costs merely to improve earnings;
- use acquisition accounting to reset recurring expenses;
- recognize revenue through financed, controlled, or economically dependent customers without clear disclosure;
- reduce reserves simply to meet earnings;
- present gross revenue when the company is economically an agent;
- or emphasize adjusted EBITDA while ignoring interest, dilution, maintenance capex, and working-capital needs.

### Accounting divergence table

| Finding | Possible meaning | Next document or calculation |
|---|---|---|
| Revenue rises, operating cash falls | Collections weaken, working-capital build, or aggressive recognition | 10-Q cash-flow statement, receivable note, allowance roll-forward |
| EPS rises, share count rises | Per-share gains may rely on adjustments or buybacks failing to offset dilution | Statement of equity, Form 4, proxy compensation tables |
| EBITDA rises, FCF falls | Capex, working capital, cash taxes, or restructuring consumes economics | Cash-flow statement and capex commitments |
| Gross margin rises, customer complaints rise | Pricing, lower service, warranty deferral, or mix shift | Warranty reserve, returns, regulator and customer data |
| "One-time" charges recur | The adjusted metric may be the real recurring presentation | Five-year reconciliation of exclusions |
| Tax rate falls sharply | Geographic mix, credits, valuation allowance, or aggressive tax structure | Tax footnote and uncertain tax positions |
| Goodwill rises faster than equity | Acquisition dependence and impairment risk | Purchase-price allocation and segment cash flows |
| Other assets or other income become material | Core weakness may be moving into opaque lines | Footnotes, exhibits, and XBRL detail |

---

## 9. Stock performance and market-distribution markers

Stock behavior is evidence about expectations and ownership, not proof of business quality.

### 9.1 Market confirmation

Generally constructive signals:

- the stock outperforms its sector and broad market over multiple horizons;
- earnings estimates and free-cash-flow expectations rise with price;
- breakouts occur on materially higher volume;
- pullbacks occur on lower volume;
- the stock remains above a rising long-term moving average;
- new institutional ownership appears after fundamental improvement;
- management purchases stock in the open market during periods of controversy or weakness.

Potential warning signals:

- the stock rises while consensus earnings and cash estimates fall;
- repeated high-volume declines occur after apparently positive news;
- the stock cannot hold gains after earnings beats;
- price appreciation is concentrated in multiple expansion rather than operating improvement;
- insiders, venture funds, or private-equity sponsors sell heavily while public enthusiasm rises;
- a shrinking float, options activity, or short squeeze creates price gains disconnected from economics.

### 9.2 Practical comparison bands

These are prompts, not automatic trading rules.

| Marker | Investigative threshold |
|---|---|
| Relative performance | Underperformance of roughly 20% or more versus the sector over 12 months deserves a specific explanation |
| Drawdown | A drawdown materially larger than the company's normal cycle or peer group may signal a changed thesis |
| Short interest | Above roughly 10% of float suggests meaningful disagreement; check borrow cost, days to cover, and catalyst risk |
| Institutional concentration | Very high top-ten ownership can stabilize the register but increase crowded-exit risk |
| Volume distribution | Several above-average-volume declines within a few weeks may indicate institutional selling |
| Estimate-price divergence | Rising price with falling estimates often means multiple expansion, positioning, or narrative—not improving fundamentals |
| Price-fundamental divergence | Falling price with improving estimates and cash flow may indicate temporary forced selling, valuation compression, or an undisclosed risk |

### 9.3 Accumulation versus distribution

**Accumulation** means larger investors appear to be building positions. Common clues include repeated high-volume advances, strong closes, relative strength, and rising ownership disclosures.

**Distribution** means larger investors appear to be reducing exposure. Common clues include high-volume declines, failed rallies, weak closes, insider or sponsor sales, and falling active ownership.

Neither can be proven from a single chart. Confirm with:

- Forms 4 and 144;
- Schedule 13D and 13G amendments;
- 13F history;
- secondary offerings;
- share-count changes;
- fund letters;
- index additions or removals;
- and securities-lending data where available.

### 9.4 Price-based reconsideration triggers (vault extension)

Every scored review carries a price band in frontmatter (`price_at_review`, `reconsider_price_low`, `reconsider_price_high`), written by `node run.mjs edgar triggers --set` and checked against current prices with `node run.mjs edgar triggers`.

> **A breached band is an investigation prompt, never a trade signal** (§9.2). Breaching the low band is the §9.2 drawdown prompt: something the review didn't price is happening — re-run the §17 loop and write a fresh dated review. Breaching the high band is the §13 Pattern C prompt: quality may now be fully paid for — re-check valuation vs conservative economics (§16.C).

Defaults are mechanical — low = review price −20% (the §9.2 threshold), high = +25% — and **should be overridden** with valuation-informed levels wherever the researcher has a view: set the band where the §16.C "valuation versus conservative economics" judgment would actually change, and note the reasoning in §13 of the review.

---

## 10. Good-faith action can lose money

"Good faith" in this framework means that an action plausibly prioritizes customer safety, long-term capability, resilience, or honest disclosure even though it imposes a near-term cost. It does not certify that every part of the company is ethical or that the investment will succeed.

### 10.1 Johnson & Johnson and the 1982 Tylenol response

Following the 1982 tampering incidents, the company's response included a major product withdrawal and actions designed to protect customers and restore trust. The response imposed substantial immediate cost and disruption, yet became a widely studied example of placing public safety ahead of preserving near-term sales.[^jnj]

**What the market could have seen:** lost product, recall costs, uncertainty, and damaged brand value.

**What a process-based review would ask:**

- Did management move before the full financial cost was known?
- Was customer protection prioritized over minimizing liability?
- Did the company redesign packaging and controls to reduce recurrence?
- Did trust and operating capability improve after the crisis?

**Lesson:** A costly response can preserve a franchise better than a defensive response that protects one quarter's earnings.

### 10.2 CVS ending tobacco sales

CVS stopped selling tobacco products in its pharmacies in 2014, voluntarily removing a revenue source because it conflicted with the company's healthcare positioning.[^cvs]

**Potential positive interpretation:** strategic consistency, customer-health alignment, and stronger long-term brand credibility.

**Potential negative interpretation:** foregone sales, lost associated basket purchases, and the risk that competitors retain the economics.

**Lesson:** A responsible choice can be economically costly and still fail to produce an immediate stock reward. The analytical question is whether the sacrifice strengthens the company's core identity enough to compensate for the lost cash flow.

### 10.3 Amazon's early investment period

Amazon reported major losses and invested heavily in systems, telecommunications infrastructure, transaction processing, selection, and logistics during its early development.[^amazon]

This is primarily a **long-term process example**, not a moral endorsement.

**What the market could have seen:** losses, financing risk, dilution, and uncertain scale economics.

**What the process could have been building:** reusable infrastructure, customer trust, selection, fulfillment capability, marketplace liquidity, and future operating leverage.

**Lesson:** Losses are constructive only when they purchase identifiable capabilities that later improve unit economics. "Investing for growth" is not sufficient evidence by itself.

### 10.4 When good faith still fails

Responsible behavior does not rescue a weak business model. A company can pay employees well, disclose honestly, protect customers, invest patiently — and still lose money because demand is insufficient, technology fails, costs cannot scale, or competitors execute better.

Therefore:

> **Integrity may reduce hidden risk, but it does not create product-market fit or acceptable returns on capital.**

---

## 11. Bad-faith behavior can support revenue and stock prices for years

For this section, "bad faith" is reserved for conduct supported by formal findings, settlements, admissions, or detailed enforcement allegations—not merely an unpopular strategy.

### 11.1 Enron

Enron presented growth and profitability while using misleading disclosures, complex structures, and accounting practices that obscured its economic condition. SEC materials document numerous enforcement actions and allegations involving false statements and distorted financial reporting.[^enron]

**Why performance could persist:** reported numbers appeared strong; complexity discouraged verification; analysts and lenders relied on management's framing; rising stock supported financing and confidence; problems could be shifted across entities or reporting periods.

**Lesson:** Revenue growth, sophisticated financial structures, prestigious counterparties, and a rising stock do not independently validate cash economics.

### 11.2 Luckin Coffee

The SEC alleged that Luckin fabricated more than $300 million in retail sales and altered expenses, databases, accounting records, and bank records to conceal the activity.[^luckin]

**Why apparent growth could persist:** fabricated transactions imitated real customer activity; rapid store expansion made extraordinary growth seem plausible; investors accepted growth metrics before cash and control systems were fully tested.

**Lesson:** When the valuation depends on a small number of operating KPIs, independently reconcile those KPIs with cash, taxes, unit counts, suppliers, and customer behavior.

### 11.3 Wells Fargo sales practices

The U.S. Department of Justice described widespread sales-practices misconduct involving millions of accounts or financial products opened without customer authorization. The bank remained a large, profitable institution while harmful incentives operated for years.[^wells]

**Why financial performance could continue:** the misconduct was embedded in a broader profitable franchise; sales metrics rewarded activity before customer harm was fully recognized; legal, remediation, reputational, and control costs arrived later; scale can allow a company to absorb penalties without immediate insolvency.

**Lesson:** Profitability does not prove that the process producing a KPI is legitimate. Incentive design is an operating risk.

### 11.4 Valeant Pharmaceuticals

The SEC found improper revenue recognition and misleading disclosures related to Valeant, now Bausch Health, and highlighted the material impact of revenue associated with a sharp price increase on an acquired drug.[^valeant]

**Why the stock and reported results could look strong:** acquisitions added revenue quickly; price increases produced immediate earnings; non-GAAP metrics emphasized adjusted performance; leverage magnified equity returns while confidence held.

**Lesson:** A company can convert customer or market power into impressive financial results while increasing regulatory, political, reputational, refinancing, and durability risk.

---

## 12. Legal but potentially extractive behavior

Not every harmful pattern is illegal. Some strategies can create strong revenue and stock performance while transferring risk to customers, employees, suppliers, taxpayers, or future shareholders.

Examples requiring judgment:

- raising prices far above cost without improving the product;
- making cancellation or switching deliberately difficult;
- underinvesting in maintenance, safety, cybersecurity, or quality control;
- replacing durable employees with unstable labor purely to meet short-term margins;
- extending payment terms to suppliers to manufacture operating cash flow;
- issuing debt to repurchase overvalued shares;
- acquiring competitors primarily to reduce customer choice;
- designing compensation around a single metric vulnerable to gaming;
- relying on government guarantees while privatizing upside;
- monetizing customer data beyond reasonable expectations;
- selling products that are legal but inconsistent with the company's stated mission.

These may remain profitable for long periods because the costs are delayed, diffuse, difficult to measure, or borne by someone other than the company.

The investment question is not only whether the behavior is objectionable. It is:

> **When, how, and through which mechanism could the externalized cost return to the company?**

Possible return channels include regulation, litigation, employee turnover, customer churn, reputational damage, higher insurance, financing restrictions, political intervention, new competition, or loss of operating license.

---

## 13. Divergence patterns worth investigating

### Pattern A — Good process, bad stock

Possible causes: investment depresses current margins; a cyclical downturn hides operational improvement; the market doubts execution; valuation began too high; forced selling overwhelms fundamentals; benefits have a longer duration than investors tolerate.

Next questions:

- Are unit economics improving despite reported losses?
- Is cash burn declining per unit of growth?
- Are customers staying?
- Is the balance sheet strong enough to finish the plan?
- What specific milestone converts investment into cash flow?

### Pattern B — Bad process, good stock

Possible causes: accounting recognition leads cash reality; prices rise because of scarcity or market power; leverage and buybacks amplify EPS; a narrative attracts passive and momentum flows; misconduct has not yet been detected; costs are externalized or deferred.

Next questions:

- Does cash confirm earnings?
- Are customers, units, or retention confirming revenue?
- Are reserves, legal costs, complaints, or employee turnover rising?
- Are insiders selling?
- Has the company changed KPI definitions?
- What must remain hidden or favorable for the valuation to hold?

### Pattern C — Good company, bad investment

A high-quality company can be a poor investment when: the stock price assumes decades of flawless execution; future margins are already embedded in valuation; ownership is crowded; the company must invest heavily merely to maintain its position; or the market overestimates the duration of the moat.

### Pattern D — Troubled company, good trade

A weak company can produce a strong stock return when: bankruptcy risk falls; refinancing succeeds; expectations were extremely low; a short squeeze occurs; an asset sale reveals hidden value; or cyclical earnings rebound.

A good trade does not transform the company into a good steward.

---

## 14. Sector-specific modifications

> The `edgar health` command detects bank and REIT filers via the industry skeleton profiles (`scripts/lib/skeleton-profiles.mjs`) and suppresses the §5.5 leverage bands for them. The sector emphases below are review guidance for the human pass.

### Banks

Do not use ordinary net-debt ratios. Emphasize: CET1 capital; tangible common equity; deposit composition and cost; uninsured deposits; liquidity sources; net interest margin; nonperforming loans; net charge-offs; allowance coverage; commercial real-estate or industry concentration; regulatory consent orders; incentive systems and customer complaints.

### Insurers

Emphasize: combined ratio; reserve development; catastrophe exposure; reinsurance quality; investment-portfolio duration and credit; regulatory capital; policy retention and pricing adequacy.

### REITs

Emphasize: FFO and AFFO rather than net income alone; occupancy; same-property NOI; tenant concentration; lease expirations; rent coverage; recurring maintenance capex; net debt/EBITDAre; secured versus unsecured debt; payout against AFFO.

### Utilities and infrastructure

Higher leverage may be normal. Emphasize: regulated returns; allowed rate base; capital plan execution; customer affordability; storm, wildfire, nuclear, and environmental liabilities; regulatory relationships; financing needs; project completion and cost recovery.

### Biotechnology

Traditional earnings markers may be meaningless before commercialization. Emphasize: cash runway; burn relative to milestones; clinical design and endpoints; probability-adjusted pipeline value; manufacturing readiness; licensing terms; patent life; dilution schedule; insider and specialist-fund ownership; safety disclosures.

### SaaS and cloud software

Emphasize: net revenue retention; gross retention; remaining performance obligations; billings and deferred revenue; gross margin; sales efficiency; customer-acquisition payback; Rule of 40 as a rough—not definitive—screen; stock compensation; net dilution; cloud-infrastructure commitments; customer concentration.

### Semiconductors and AI infrastructure

Emphasize: end-demand versus channel inventory; design wins and qualification cycles; foundry, packaging, memory, and equipment bottlenecks; customer prepayments and commitments; hyperscaler concentration; inventory days; gross-margin sensitivity to mix; capex intensity; export controls; power availability; software ecosystem and developer adoption; maintenance versus growth capex in data centers.

### Consumer and retail

Emphasize: traffic versus ticket; unit volume versus price; same-store sales; inventory turns; shrink; promotions; loyalty and renewal; labor productivity; store-level returns; private-label penetration; complaint and return rates.

### Industrials

Emphasize: organic orders; backlog quality; book-to-bill; cancellation rates; working capital; warranty reserves; aftermarket mix; capacity utilization; supplier health; project overruns; pension and environmental obligations.

### Energy and mining

Emphasize: reserve life and replacement; production decline rates; lifting or operating costs; sustaining versus growth capex; realized prices and hedges; reclamation liabilities; jurisdiction; water, safety, and environmental performance; royalties and transport constraints; returns at mid-cycle commodity prices rather than spot prices alone.

---

## 15. EDGAR routing: what each finding should send you to next

> Findings surfaced during a health review should be logged as [[03_Templates/Intel_Finding]] notes and routed with this table (which extends the deconstruction framework's §8 routing).

| Initial finding | Primary EDGAR destination | Follow-up |
|---|---|---|
| Revenue quality concern | 10-K/10-Q revenue note and MD&A | Receivables, contract assets, customer concentration, cash flow |
| Rising exclusions | Earnings 8-K exhibits and 10-K non-GAAP reconciliation | Build five-year exclusion history |
| CFO or auditor change | 8-K Items 4.01 and 5.02 | Proxy, audit fees, prior material weaknesses, Form 4 |
| Customer or supplier dependence | 10-K risk factors and concentration notes | Material-contract exhibits and competitor filings |
| Debt-funded buyback | 10-Q cash flow, debt note, and 8-K authorization | Share count, maturity schedule, interest sensitivity |
| Large acquisition | 8-K, S-4 if applicable, and acquisition footnote | Purchase-price allocation, synergy promises, goodwill, earnouts |
| Dilution | Statement of equity, proxy compensation, S-3, 424B | Net share count and grant vesting |
| Insider selling | Forms 4 and 144 | 10b5-1 plans, ownership table, upcoming lockups |
| Activist involvement | Schedule 13D | Exhibits, letters, proxy contest, board response |
| Passive or concentrated ownership | Schedule 13G and 13F history | Voting policies and index membership |
| Safety or legal issue | 8-K, risk factors, legal-proceedings note | Regulator orders, reserves, insurance, board oversight |
| Persistent restructuring | MD&A and restructuring footnote | Headcount, locations, asset impairments, recurring exclusions |
| Material weakness | 10-K controls section and auditor report | Remediation timetable, responsible systems, executive changes |
| New capital raise | S-3, prospectus supplement, 424B | Use of proceeds, selling holders, dilution, covenant needs |
| Related-party concern | DEF 14A and footnotes | Director relationships, beneficial ownership, exhibits |

---

## 16. A 100-point scoring model

The score organizes evidence; it should never replace the written thesis. Copy the three sub-scores and total into the review note's frontmatter.

### A. Economic health — 40 points

| Category | Points |
|---|---:|
| Revenue and demand quality | 0–8 |
| Unit economics and margins | 0–8 |
| Cash conversion and earnings quality | 0–8 |
| Balance-sheet resilience | 0–8 |
| Returns on capital and reinvestment | 0–8 |

### B. Stewardship and integrity — 40 points

| Category | Points |
|---|---:|
| Accounting transparency | 0–8 |
| Capital allocation and distributions | 0–8 |
| Governance and compensation | 0–8 |
| Customer, employee, safety, and supplier treatment | 0–8 |
| Strategic consistency and accountability | 0–8 |

### C. Market confirmation — 20 points

| Category | Points |
|---|---:|
| Relative price and earnings-estimate behavior | 0–5 |
| Accumulation, distribution, and ownership change | 0–5 |
| Valuation versus conservative economics | 0–5 |
| Catalyst and expectation asymmetry | 0–5 |

### Interpretation bands

| Total | Interpretation |
|---:|---|
| 85–100 | Strong process and economics; investigate valuation and hidden concentration risks |
| 70–84 | Generally healthy with identifiable weaknesses |
| 55–69 | Mixed; thesis depends on specific repairs or underappreciated strengths |
| 40–54 | Fragile; require a clear catalyst, margin of safety, and risk controls |
| Below 40 | Avoid ordinary long-term ownership unless the thesis is a special situation |

### Red-flag override

A documented fraud allegation, going-concern warning, auditor dispute, major restatement, covenant breach, or unresolved safety failure should cap the provisional rating until the event is investigated (§7.3). A mathematically high score should never neutralize a potentially existential governance event. Set `red_flag_override: true` and list the events in `red_flags` — the [[00_Dashboard/Health Review Board]] surfaces overrides first regardless of score.

---

## 17. Quarterly review process

### Step 1 — Re-state the company in one sentence

Has the barebones machine changed? (Check against the dossier's `one_liner`.)

### Step 2 — Separate reported growth

Break revenue into: unit or customer growth; price; mix; acquisitions; currency; accounting or presentation changes.

### Step 3 — Reconcile earnings to cash

Track: net income; operating cash flow; free cash flow; working-capital movements; stock compensation; restructuring; acquisitions and asset sales. (`edgar health` pre-computes the §5.3 ratios.)

### Step 4 — Review operational evidence

Track the sector-specific operating markers (§14) that prove the business is strengthening or weakening.

### Step 5 — Review stewardship

Ask: What did management do with cash? What risk did management reduce or increase? Did the company admit errors? Did compensation or dilution change? Were customers, employees, or suppliers asked to absorb hidden costs?

### Step 6 — Review the stock and ownership

Compare: price reaction; volume; estimate revisions; insider activity; active and passive ownership; short interest; secondary offerings and buybacks.

### Step 7 — Write the divergence sentence

Use this format (copy into the review note):

> **The company's operating process is `[improving/stable/deteriorating]`, reported results are `[improving/stable/deteriorating]`, and the market is pricing `[more/less/about the same]` future success because `[reason]`.**

### Step 8 — Define the next falsifiable checkpoint

Examples: inventory must fall below a specified level; customer retention must stabilize; free cash flow must turn positive; a new plant must reach a utilization target; net leverage must fall; a material weakness must be remediated; dilution must slow; a new product must produce independently disclosed revenue.

Copy into `next_checkpoint` / `next_checkpoint_date` frontmatter — the board surfaces overdue checkpoints.

---

## 18. Company review template

Use [[03_Templates/Health_Review]] — one dated note per review in `13_Company_Intel/Reviews/`, filename `YYYY-MM-DD - TICKER - Health Review.md`.

---

## 19. Final principles

1. **Revenue is not virtue.** It can come from value creation, scarcity, confusion, coercive switching costs, accounting, acquisition, or customer harm.
2. **Losses are not automatically investment.** Identify the capability purchased and the milestone that converts it to cash.
3. **A rising stock is not an audit opinion.** Price can validate expectations, positioning, or liquidity without validating the business.
4. **A falling stock is not proof of failure.** It can reflect valuation compression, forced selling, or a long investment horizon.
5. **Good intentions do not excuse weak economics.** Integrity lowers hidden-risk probability but cannot replace demand or execution.
6. **Profitability does not excuse weak integrity.** Misconduct can remain economically productive until consequences arrive.
7. **Distributions must be netted against dilution and underinvestment.** Gross buybacks and dividends can overstate shareholder benefit.
8. **The most valuable signal is often a divergence.** Investigate when process, results, and price point in different directions.
9. **Always route an observation to a source.** Every red flag should send the researcher to an EDGAR section, exhibit, regulator record, or operational dataset.
10. **Return to the barebones company.** The final question is whether the company is becoming a stronger, more durable version of the simple machine that creates value—or a more complicated vehicle for hiding deterioration.

---

## Selected primary-source references

[^jnj]: Johnson & Johnson, "Company Timeline," including its account of the company's response to the 1982 Tylenol tampering incidents: https://www.jnj.com/our-heritage/timeline

[^cvs]: CVS Health, "CVS Health's commitment to a tobacco-free future," documenting the 2014 decision to stop selling tobacco products in CVS Pharmacy stores: https://www.cvshealth.com/campaigns/quitting-tobacco.html

[^amazon]: Amazon.com, Inc., Form 10-K for the year ended December 31, 2001, and Form 10-Q for the period ended June 30, 2001: https://www.sec.gov/Archives/edgar/data/1018724/000103221002000059/d10k405.htm and https://www.sec.gov/Archives/edgar/data/1018724/000103221001500866/d10q.htm

[^enron]: U.S. Securities and Exchange Commission, "Spotlight on Enron," collection of enforcement actions and related materials: https://www.sec.gov/spotlight/enron.htm

[^luckin]: U.S. Securities and Exchange Commission, "Luckin Coffee Agrees to Pay $180 Million Penalty to Settle Accounting Fraud Charges," December 16, 2020: https://www.sec.gov/newsroom/press-releases/2020-319

[^wells]: U.S. Department of Justice, "Wells Fargo Agrees to Pay $3 Billion to Resolve Criminal and Civil Investigations into Sales Practices," February 21, 2020: https://www.justice.gov/archives/opa/pr/wells-fargo-agrees-pay-3-billion-resolve-criminal-and-civil-investigations-sales-practices

[^valeant]: U.S. Securities and Exchange Commission, "Pharmaceutical Company and Former Executives Charged With Misleading Financial Disclosures," July 31, 2020: https://www.sec.gov/newsroom/press-releases/2020-169
