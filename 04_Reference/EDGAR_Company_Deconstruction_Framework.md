---
title: "EDGAR Company Deconstruction & Intelligence Framework"
type: reference
version: "1.0"
status: Working Research Playbook
last_updated: 2026-08-01
tags: [reference, edgar, company-intel, playbook]
---

> [!info] Vault integration
> This playbook is operationalized in this vault: dossiers and findings live in `13_Company_Intel/`, templates in `03_Templates/`, the operator surface is [[00_Dashboard/Company Intel Board]], and filing baselines come from the `edgar` CLI group. Start at [[000-moc/moc-company-intel]].


# EDGAR Company Deconstruction & Intelligence Framework

## Purpose

This framework is designed to answer five connected questions:

1. **What is this company at its simplest?**
2. **How does the company turn inputs into cash?**
3. **How has that basic business machine changed over time?**
4. **What do SEC filings reveal that management presentations may not emphasize?**
5. **When a new fact appears, what could it mean and where should the investigation go next?**

The process begins with a plain-language description that a child could understand. It then builds upward through revenue, costs, assets, dependencies, governance, ownership, financial statements, footnotes, and event filings. Every finding should either strengthen the existing company model, weaken it, or force the model to be rewritten.

The objective is not to read every page with equal attention. The objective is to identify **what changed, why it matters, whether it alters the business machine, and what evidence should be checked next**.

---

# 1. The Integrated Research Loop

```text
Explain the company simply
        â†“
Map how it makes money
        â†“
Identify assets, dependencies, bottlenecks, and control
        â†“
Build the flywheel and reverse flywheel
        â†“
Establish a filing-based baseline
        â†“
Scan new filings for changes and anomalies
        â†“
Route each finding to the next document or dataset
        â†“
Update the companyâ€™s bare-bones description
        â†“
Classify the change as strengthening, weakening, or transforming
        â†“
Update the investment thesis and monitoring triggers
```

A useful research report should always preserve two views at once:

- **The simple view:** What the company fundamentally does.
- **The evidence view:** Which filings, exhibits, financial lines, ownership records, and governance disclosures support that description.

---

# 2. Start With the Bare-Bones Company

## 2.1 Level 0 â€” Explain It to a Ten-Year-Old

Write one sentence with no investor language, promotional language, or technical buzzwords.

Examples:

- **NVIDIA:** Designs computer chips and software that help computers create graphics and run artificial intelligence.
- **Microsoft:** Sells software subscriptions and rents computing power through large data centers.
- **Amazon:** Sells and delivers products, connects outside sellers with buyers, and rents computing infrastructure.
- **Meta:** Attracts attention through social applications and sells advertisers access to that attention.
- **Visa:** Operates a network that carries payment instructions and charges fees when money moves.
- **Costco:** Buys large quantities of goods, sells them at low markups, and charges customers for memberships.
- **Eli Lilly:** Discovers, tests, manufactures, and sells medicines.

### The test

A good one-sentence description identifies:

- What is sold.
- Who pays.
- What the company must repeatedly do.
- Why the customer uses it.

A weak description repeats management language:

> â€œA leading AI-enabled digital transformation platform.â€

A stronger description states the actual transaction:

> â€œThe company sells software that helps factories monitor machines and charges recurring subscription fees.â€

---

## 2.2 Level 1 â€” The Universal Company Machine

Every company can be reduced to the same basic system:

```text
Capital
  â†“
Acquire inputs
  â†“
Transform, organize, or distribute those inputs
  â†“
Deliver something customers value
  â†“
Collect cash
  â†“
Pay operating and financing costs
  â†“
Reinvest, distribute, or retain the remaining cash
  â†“
Repeat
```

For each company, fill in the machine:

| Element | Research Question |
|---|---|
| Capital | Where did the money originally come from, and where does new capital come from now? |
| Inputs | Labor, inventory, chips, energy, data, patents, buildings, licenses, content, customer deposits, or financing? |
| Transformation | What does the company actually do to the inputs? |
| Output | What product, service, access, convenience, risk transfer, or infrastructure is delivered? |
| Customer | Who makes the purchasing decision and who ultimately pays? |
| Collection | Subscription, transaction fee, product sale, advertising, interest spread, licensing, rent, usage, or reimbursement? |
| Reinvestment | Where must cash be spent to preserve or expand the machine? |
| Distribution | Buybacks, dividends, debt repayment, acquisitions, or owner distributions? |

---

## 2.3 Level 2 â€” Revenue Engine

Do not stop at â€œrevenue grew.â€ Identify exactly how money enters the company.

For every revenue stream, record:

- Product or service.
- Customer.
- Pricing method.
- Contract length.
- Recurring or transactional nature.
- Volume driver.
- Price driver.
- Gross margin profile.
- Growth rate.
- Customer concentration.
- Geographic concentration.
- Cyclicality.
- Cancellation or renewal terms.
- Whether the revenue is reported directly or hidden inside a larger segment.

### Revenue engine template

| Revenue Stream | Who Pays? | Why Do They Pay? | Pricing Unit | Recurring? | Margin | Growth Driver | Main Risk |
|---|---|---|---|---|---|---|---|
| Stream 1 |  |  |  |  |  |  |  |
| Stream 2 |  |  |  |  |  |  |  |
| Stream 3 |  |  |  |  |  |  |  |

### Questions that expose the real engine

- Is the customer buying the product, financing, convenience, access, status, compliance, or reduced risk?
- Does reported revenue represent end demand, channel inventory, bookings, billings, or accounting recognition?
- Is growth coming from more customers, higher prices, greater usage, acquisitions, currency, or accounting changes?
- Which revenue stream funds the others?
- Which stream has the highest incremental margin?
- Which stream would disappear first in a recession?
- Which stream gives the company strategic leverage even if it is currently low margin?

---

## 2.4 Level 3 â€” Cost Engine

Map where cash leaves the machine.

Common cost categories include:

- Employees and stock-based compensation.
- Inventory and raw materials.
- Contract manufacturing.
- Energy and data-center operation.
- Research and development.
- Sales commissions.
- Marketing and customer acquisition.
- Shipping and logistics.
- Rent and leases.
- Warranty and service obligations.
- Regulatory compliance.
- Legal expenses.
- Interest.
- Taxes.
- Capital expenditures.
- Content acquisition.
- Insurance and loss reserves.

### Cost engine template

| Cost | Fixed, Variable, or Step-Fixed? | What Drives It? | Can It Be Passed to Customers? | Strategic or Wasteful? | Filing Location |
|---|---|---|---|---|---|
| Cost 1 |  |  |  |  |  |
| Cost 2 |  |  |  |  |  |

### Questions

- What cost rises before revenue appears?
- What cost rises only after a sale?
- Which cost is essential to the moat?
- Which cost is disguising underinvestment?
- Which costs are capitalized instead of expensed?
- Does management call a recurring cost â€œone-timeâ€?
- Are layoffs improving efficiency or damaging the capability that produces future growth?

---

## 2.5 Level 4 â€” Assets and Capabilities

Separate **assets** from **capabilities**.

An asset is something the company owns or controls. A capability is something the company can repeatedly do well.

### Possible assets

- Factories.
- Data centers.
- Distribution centers.
- Patents.
- Spectrum.
- Mineral rights.
- Drug approvals.
- Customer contracts.
- Software code.
- Data.
- Brand.
- Licenses.
- Cash.
- Installed equipment.
- Retail locations.
- Supplier agreements.

### Possible capabilities

- Designing advanced chips.
- Training and retaining specialized employees.
- Shipping millions of packages reliably.
- Obtaining regulatory approvals.
- Pricing insurance risk.
- Cross-selling financial products.
- Integrating acquisitions.
- Operating a developer ecosystem.
- Maintaining exceptionally low unit costs.
- Reinvesting capital at high returns.

### Asset-capability test

For each important asset, ask:

1. Can a competitor buy the same asset?
2. Can the competitor operate it as effectively?
3. How long would replication take?
4. Does the asset improve with use?
5. Is the asset valuable without the companyâ€™s people, processes, software, or customer network?

A company may possess expensive assets without possessing a moat. The moat often resides in the capability to combine those assets better than competitors.

---

## 2.6 Level 5 â€” Customers and Value Exchange

Identify all participants in the transaction.

The user, buyer, payer, beneficiary, distributor, and regulator may be different entities.

Example:

```text
Employee uses software
        â†“
Department selects software
        â†“
Chief information officer approves contract
        â†“
Company pays subscription
        â†“
Regulator or customer may indirectly require the capability
```

### Customer questions

- Who uses the product?
- Who chooses it?
- Who signs the contract?
- Who pays?
- Who can cancel?
- Who absorbs a price increase?
- Who bears the switching cost?
- Who has bargaining power?
- Is the customer concentrated, fragmented, regulated, or financially stressed?

---

## 2.7 Level 6 â€” Dependencies

List what the company cannot function without.

| Dependency Type | Examples |
|---|---|
| Supplier | Foundry, cloud provider, raw materials, contract manufacturer |
| Customer | One major buyer, government program, distributor, pharmacy benefit manager |
| Technology | Operating system, application programming interface, chip architecture, network standard |
| Infrastructure | Electric grid, ports, rail, logistics, spectrum, payment rails |
| Talent | Key scientists, engineers, sales force, portfolio managers |
| Regulation | Drug approval, banking charter, rate case, export license |
| Financing | Revolver, warehouse facility, securitization, deposits, bond market |
| Geography | Taiwan, China, Gulf Coast, one manufacturing campus |
| Platform | App store, search engine, cloud marketplace, social network |
| Commodity | Oil, natural gas, copper, electricity, memory chips |

### Dependency questions

- Which dependency can stop revenue immediately?
- Which dependency can compress margins slowly?
- Which dependency is replaceable?
- Which dependency is controlled by a competitor?
- Which dependency appears in contracts or debt covenants?
- Which dependency is discussed more urgently in the newest filing?

---

## 2.8 Level 7 â€” Bottlenecks and Constraints

Ask:

> If demand doubled tomorrow, what would break first?

Possible answers:

- Manufacturing capacity.
- Power.
- Sales staff.
- Regulatory approval.
- Installation crews.
- Inventory.
- Customer financing.
- Supplier capacity.
- Working capital.
- Data-center networking.
- Distribution.
- Management attention.

A bottleneck can be either:

- **A growth constraint:** The company cannot satisfy available demand.
- **A moat:** Competitors face an even harder version of the same constraint.
- **A hidden cost:** Growth requires much more capital than revenue headlines imply.
- **A catalyst:** New capacity removes the constraint and changes earnings power.

---

## 2.9 Level 8 â€” Flywheel

A flywheel is a self-reinforcing loop.

### Example: marketplace

```text
More buyers
   â†“
More sellers
   â†“
Broader selection
   â†“
Better prices and convenience
   â†“
More buyers
```

### Example: AI computing platform

```text
Better hardware
   â†“
More developers
   â†“
More software and models optimized for the platform
   â†“
More customer adoption
   â†“
More revenue and data
   â†“
More research and development
   â†“
Better hardware and software
```

### Flywheel test

- Does each step cause the next?
- Is the loop measurable?
- Is it company-specific?
- Does scale improve economics or only increase size?
- Can a competitor interrupt one step?
- Does the flywheel work in a downturn?
- Is management investing in the loop or extracting from it?

---

## 2.10 Level 9 â€” Reverse Flywheel

Every flywheel should be reversed.

```text
Product delays
   â†“
Customers test alternatives
   â†“
Developers support competing platforms
   â†“
Customer switching becomes easier
   â†“
Revenue growth slows
   â†“
Research budget becomes harder to sustain
   â†“
Product advantage narrows
```

The reverse flywheel is often more useful for risk analysis because it identifies the sequence through which a strong company can become weaker.

---

## 2.11 Level 10 â€” Control and Decision Rights

The economic machine may be simple while control is complex.

Identify:

- Founder voting control.
- Dual-class or super-voting shares.
- Top institutional holders.
- Active blockholders.
- Passive index ownership.
- Private-equity influence.
- Bank lending relationships.
- Board independence.
- Committee leadership.
- Debt covenant restrictions.
- Joint-venture rights.
- Government approval rights.
- Major customer leverage.

### Core question

> Who can force, stop, delay, finance, or veto a major strategic move?

Equity ownership alone may not answer this. A bank with a small equity stake may exert influence through credit facilities, covenants, underwriting, or refinancing access. A passive fund may not direct operations, but its proxy vote can decide an activist contest.

---

# 3. The Bare-Bones Company Card

Complete this before reading analyst opinions.

```markdown
## Company Card

**Company:**
**Ticker:**
**Date:**
**Fiscal year-end:**
**SEC CIK:**

### One-Sentence Description
[What the company sells, who pays, and why.]

### The Machine
- Inputs:
- Transformation:
- Output:
- Customer:
- Collection method:
- Required reinvestment:
- Owner distributions:

### Revenue Engine
1.
2.
3.

### Cost Engine
1.
2.
3.

### Critical Assets
1.
2.
3.

### Reusable Capabilities
1.
2.
3.

### Dependencies
1.
2.
3.

### Current Bottleneck
[What limits the company today?]

### Flywheel
[Step-by-step positive loop.]

### Reverse Flywheel
[Step-by-step deterioration loop.]

### Control
[Who can force, stop, or redirect major decisions?]

### Simplest Bull Case
[What improves the machine?]

### Simplest Bear Case
[What damages or replaces the machine?]

### Evidence Still Needed
- 
- 
- 
```

---

# 4. How the Bare-Bones Description Evolves

The one-sentence description should not remain frozen. It should change when the economic engine changes.

## 4.1 Evolution Timeline

| Period | Simplest Accurate Description | What Changed? | Evidence | Positive, Negative, or Mixed? |
|---|---|---|---|---|
| Founding |  |  |  |  |
| IPO |  |  |  |  |
| Five years ago |  |  |  |  |
| Prior year |  |  |  |  |
| Current |  |  |  |  |
| Emerging next state |  |  |  |  |

### Example structure

```text
Graphics hardware designer
        â†“
Gaming computing company
        â†“
General-purpose accelerated computing platform
        â†“
AI infrastructure and software ecosystem
```

The important question is not whether the description sounds more impressive. It is whether the companyâ€™s economics, customers, assets, capital needs, and dependencies actually changed.

---

## 4.2 Positive Adaptation

A company is adapting positively when a new activity:

- Strengthens the original customer relationship.
- Uses an existing capability in a new market.
- Increases recurring revenue.
- Improves switching costs.
- Expands the network effect.
- Lowers unit costs.
- Raises returns on incremental capital.
- Diversifies without destroying focus.
- Creates valuable optionality.
- Reduces a critical dependency.
- Converts a product into a platform.
- Turns a cost center into a revenue stream.

### Positive evolution path

```text
Strong core product
        â†“
Adjacent product
        â†“
Shared customer and distribution
        â†“
Reusable capability
        â†“
Platform or ecosystem
        â†“
Higher switching costs
        â†“
More recurring cash flow
        â†“
Greater reinvestment capacity
```

---

## 4.3 Negative Adaptation

A company is adapting negatively when a new activity:

- Does not share customers, capabilities, or distribution with the core.
- Requires continual acquisitions to maintain growth.
- Adds debt without durable earnings power.
- Conceals core deterioration.
- Creates organizational complexity faster than value.
- Diverts capital from the strongest business.
- Increases regulatory or geopolitical exposure.
- Weakens customer trust.
- Expands management compensation without improving owner outcomes.
- Turns a high-return model into a capital-intensive one.
- Produces revenue growth but deteriorating cash conversion.
- Makes the company harder to describe because the strategy is incoherent.

### Negative evolution path

```text
Maturing core
        â†“
Growth pressure
        â†“
Unrelated acquisition
        â†“
More segments and reporting complexity
        â†“
Integration costs and debt
        â†“
Weak accountability
        â†“
Impairments and restructuring
        â†“
Asset sales or strategic retreat
```

---

## 4.4 Transformation Versus Distraction

Use the following tests for every major initiative, acquisition, or new segment.

| Test | Question |
|---|---|
| Core | Does this improve the original product or customer outcome? |
| Customer | Is it sold to the same customer or through the same relationship? |
| Capability | Does it reuse something the company already does unusually well? |
| Flywheel | Does it accelerate an existing reinforcing loop? |
| Moat | Does it make replication or switching harder? |
| Economics | Does it improve margins, cash conversion, or returns on capital? |
| Complexity | How much organizational complexity does it add? |
| Capital | How much additional capital must be committed before returns appear? |
| Optionality | Does it create realistic future paths or merely a story? |
| Reversibility | Can the company exit without damaging the core? |
| Accountability | Can investors separately measure the initiative? |
| Evidence | Which filing data would prove success or failure? |

---

## 4.5 Evolution Score

Score each dimension from 0 to 5.

| Dimension | 0 | 5 |
|---|---|---|
| Core reinforcement | Unrelated | Directly strengthens core |
| Capability reuse | Entirely new capability | Uses a proven capability |
| Customer fit | Different customer and channel | Same customer relationship |
| Flywheel contribution | Interrupts the loop | Accelerates the loop |
| Moat contribution | Makes imitation easier | Expands switching costs or scale advantage |
| Economic quality | Consumes cash with unclear return | Improves durable free cash flow |
| Complexity burden | Severe complexity | Simplifies or is easily integrated |
| Optionality | Promotional only | Creates several credible future paths |
| Reversibility | Expensive or impossible to exit | Can be scaled down cleanly |
| Disclosure quality | Opaque | Separately measurable and clearly disclosed |

### Interpretation

- **41â€“50:** Strong positive evolution.
- **31â€“40:** Promising, but execution must be monitored.
- **21â€“30:** Mixed transformation; evidence is incomplete.
- **11â€“20:** Complexity may be outrunning economic value.
- **0â€“10:** Likely strategic drift or value destruction.

The score is not a valuation model. It forces the researcher to state why a strategic change strengthens or weakens the company.

---

# 5. Establish the Filing Baseline

A company should be understood from primary filings before secondary commentary is allowed to dominate the thesis.

## Recommended baseline package

1. Latest annual report on Form 10-K.
2. Prior two annual reports for comparison.
3. Latest two or three quarterly reports on Form 10-Q.
4. All material Form 8-K filings since the latest 10-K.
5. Latest definitive proxy statement, usually DEF 14A.
6. Recent Forms 3, 4, and 5 for insiders.
7. Recent Schedule 13D and 13G filings and amendments.
8. Relevant institutional manager Form 13F filings.
9. Registration statements and offering prospectuses.
10. Material contracts and other exhibits.
11. Original S-1 or other registration statement when historical context matters.
12. Foreign issuer equivalents when applicable, such as Form 20-F and Form 6-K.

---

# 6. EDGAR Document Map

## 6.1 Form 10-K â€” The Master Annual Document

The 10-K establishes the annual baseline.

### What to extract

- Business model.
- Products and services.
- Reportable segments.
- Customer and geographic mix.
- Competition.
- Regulation.
- Employees and human capital.
- Intellectual property.
- Supply chain.
- Properties.
- Risk factors.
- Cybersecurity oversight and incidents where disclosed.
- Legal proceedings.
- Managementâ€™s Discussion and Analysis.
- Financial statements.
- Accounting policies.
- Footnotes.
- Controls and procedures.
- Auditor opinion.
- Exhibits and subsidiaries.

### What to compare across years

- Added or removed products.
- Segment reorganizations.
- Risk-factor wording.
- Customer or supplier concentration.
- Capital expenditure commitments.
- Revenue-recognition policies.
- Useful lives and depreciation assumptions.
- Restructuring language.
- Litigation reserves.
- Share count.
- Stock-based compensation.
- Debt and covenant language.
- Goodwill and intangible assets.
- Non-GAAP reconciliation changes.
- Managementâ€™s explanation of the same metric.

### What changes may mean

| Change | Possible Meaning | Next Step |
|---|---|---|
| A new segment appears | Real strategic expansion, acquisition integration, or reporting change | Read segment footnote, acquisition exhibits, and prior 8-Ks |
| A segment disappears | Sale, internal reorganization, or reduced transparency | Read discontinued-operations note and historical segment data |
| Risk language becomes more specific | Management has identified a more immediate exposure | Search 8-Ks, litigation, competitor filings, and earnings calls |
| Capital commitments rise | Capacity expansion, AI infrastructure buildout, or cost inflation | Read property, lease, purchase obligation, and debt notes |
| Useful lives are extended | Better asset longevity or slower depreciation expense | Compare capex, maintenance needs, and auditor commentary |
| â€œMaterial weaknessâ€ appears | Financial-control problem | Read controls section, auditor report, remediation plan, and 8-Ks |
| Goodwill rises sharply | Acquisition-driven growth | Read purchase-price allocation and future impairment assumptions |

---

## 6.2 Managementâ€™s Discussion and Analysis â€” Managementâ€™s Explanation Layer

MD&A connects the financial statements to managementâ€™s narrative.

### Look for

- Volume versus price.
- Mix shifts.
- Currency effects.
- Acquisition contributions.
- Margin drivers.
- Working-capital changes.
- Liquidity.
- Capital allocation.
- Known trends and uncertainties.
- Contractual commitments.
- Guidance assumptions.
- Metrics introduced, modified, or discontinued.

### Questions

- Does management explain a change with numbers or adjectives?
- Did the explanation change from the prior quarter?
- Is growth organic?
- Is margin improvement operational or accounting-driven?
- What negative metric receives the least discussion?
- What positive metric is emphasized despite weak cash flow?
- What does management stop reporting?

### Routing examples

```text
Revenue acceleration
    â†“
Price, volume, mix, acquisition, currency, or accounting?
    â†“
Segment footnote
    â†“
Customer concentration
    â†“
Receivables and cash collection
    â†“
Competitor filings
```

```text
Margin decline
    â†“
Temporary input cost or structural pricing pressure?
    â†“
Cost-of-revenue detail
    â†“
Inventory and purchase commitments
    â†“
Pricing commentary
    â†“
Competitor margins
```

---

## 6.3 Risk Factors â€” The Change-Detection Section

Do not read risk factors only once. Compare versions.

### Mark risks that are

- New.
- Removed.
- Reworded.
- Moved earlier.
- Made more specific.
- Expanded substantially.
- Changed from hypothetical to actual.
- Linked to a named geography, supplier, customer, law, or technology.
- Repeated in an 8-K or legal proceeding.

### Language progression to watch

```text
â€œWe may experienceâ€¦â€
        â†“
â€œWe have experiencedâ€¦â€
        â†“
â€œWe are experiencingâ€¦â€
        â†“
â€œThis has materially affectedâ€¦â€
```

That progression can indicate a risk moving from theoretical to realized.

### Next steps after a new risk

- Search recent 8-Ks.
- Inspect the relevant footnote.
- Search competitor filings for the same risk.
- Check customer or supplier filings.
- Review material contracts.
- Check legal proceedings and regulatory disclosures.
- Determine whether insurance, reserves, or hedges exist.
- Update the dependency map and reverse flywheel.

---

## 6.4 Financial Statements â€” The Accounting Skeleton

### Income statement

Look for:

- Revenue growth.
- Gross margin.
- Operating leverage.
- Research and development.
- Sales and marketing.
- Restructuring.
- Interest expense.
- Tax-rate changes.
- Share count.
- Segment profitability.

### Balance sheet

Look for:

- Cash and restricted cash.
- Receivables.
- Inventory.
- Contract assets.
- Deferred revenue.
- Goodwill.
- Intangible assets.
- Capitalized costs.
- Debt.
- Lease liabilities.
- Customer deposits.
- Pension obligations.
- â€œOther assetsâ€ and â€œother liabilities.â€

### Cash-flow statement

Look for:

- Cash from operations versus net income.
- Working-capital contribution.
- Capital expenditures.
- Capitalized software.
- Acquisitions.
- Asset sales.
- Buybacks.
- Dividends.
- Debt issuance and repayment.
- Stock-option exercises.
- Supplier-finance activity where disclosed.

### Core reconciliation

```text
Reported earnings
        â†“
Non-cash adjustments
        â†“
Working-capital movement
        â†“
Operating cash flow
        â†“
Required capital expenditure
        â†“
Economic free cash flow
        â†“
Buybacks, dividends, debt repayment, or acquisitions
```

---

## 6.5 Footnotes â€” Where Important Detail Often Lives

Never treat footnotes as optional.

High-value footnotes include:

- Revenue recognition.
- Segment reporting.
- Customer concentration.
- Inventory.
- Acquisitions.
- Goodwill and impairments.
- Debt.
- Leases.
- Commitments and contingencies.
- Legal reserves.
- Taxes.
- Stock-based compensation.
- Pensions.
- Derivatives.
- Fair-value measurements.
- Related-party transactions.
- Variable-interest entities.
- Supplier finance.
- Warranties.
- Restructuring.
- Subsequent events.

### Footnote test

For every unusually large balance-sheet or cash-flow change, locate the footnote that explains it. If no clear explanation exists, mark it as an unresolved question.

---

## 6.6 Form 10-Q â€” The Quarterly Change Document

Use the 10-Q to test whether the annual company model remains accurate.

### Compare

- Sequential quarter.
- Same quarter last year.
- Latest 10-K.
- Prior guidance.
- Managementâ€™s prior explanation.

### High-signal quarterly changes

- Inventory growing faster than sales.
- Receivables growing faster than revenue.
- Deferred revenue slowing.
- Backlog cancellation language.
- Capex changes.
- Debt drawdowns.
- Margin compression.
- New restructuring.
- New litigation.
- Customer concentration.
- Segment reorganization.
- Reduced disclosure.
- Control deficiencies.
- Updated risk factors.

### Quarterly output

After every 10-Q, rewrite the one-sentence description only if the economic machine has materially changed. Otherwise, update the supporting details and monitoring triggers.

---

## 6.7 Form 8-K â€” The Event Router

Form 8-K reports many material events between periodic reports.

### High-value event categories

- Material definitive agreement.
- Termination of an agreement.
- Acquisition or disposal.
- Results of operations.
- Creation of debt or off-balance-sheet obligations.
- Restructuring or exit activity.
- Material impairment.
- Delisting notice.
- Unregistered securities issuance.
- Changes to shareholder rights.
- Auditor change.
- Financial statements that can no longer be relied upon.
- Director or executive changes.
- Compensation changes.
- Charter or bylaw amendments.
- Shareholder vote results.
- Regulation FD disclosure.
- Cybersecurity incidents where required.
- Exhibits.

### How to read an 8-K

1. Identify the item number and event date.
2. Separate the filed statement from an attached press release.
3. Open every relevant exhibit.
4. Determine whether the event changes revenue, costs, assets, dependencies, control, or financing.
5. Search earlier filings for the first hint of the event.
6. Search later filings for financial consequences.
7. Update the evolution timeline.

### Example routing

```text
CFO resignation
    â†“
Was it immediate or planned?
    â†“
Was a reason provided?
    â†“
Any auditor change, control weakness, restatement, or delayed filing?
    â†“
Recent insider sales?
    â†“
Debt covenant pressure?
    â†“
Board or audit committee changes?
```

---

## 6.8 DEF 14A â€” Governance, Incentives, and Control

The definitive proxy statement is the primary governance document.

### Extract

- Board members.
- Skills and biographies.
- Independence.
- Committee assignments.
- Director tenure.
- Meeting attendance.
- Chair and CEO structure.
- Executive compensation.
- Performance metrics.
- Equity awards.
- Change-in-control terms.
- Insider ownership.
- Beneficial owners.
- Related-party transactions.
- Auditor fees.
- Shareholder proposals.
- Voting standards.
- Anti-takeover provisions.
- Say-on-pay results and engagement discussion.

### Governance questions

- Who actually controls the board?
- Are the directors independent in substance, not only by definition?
- Do directors have relevant operating expertise?
- Is compensation tied to revenue, adjusted earnings, cash flow, returns on capital, or share price?
- Can management reach targets through acquisitions or buybacks?
- Are metrics changed after poor performance?
- Does pay rise despite deteriorating owner economics?
- Are related-party transactions material?
- Are directors buying shares with their own cash?
- Is shareholder dissent increasing?

### Board intelligence without public minutes

Board meeting minutes are generally not public for ordinary corporations. Infer board priorities through:

- Committee charters.
- Proxy disclosures.
- Director appointments and resignations.
- Compensation-plan changes.
- 8-K announcements.
- Capital-allocation authorizations.
- Related-party disclosures.
- Shareholder voting results.
- Litigation exhibits.
- Bankruptcy records.
- Merger materials.
- Regulatory enforcement records.

---

## 6.9 Forms 3, 4, and 5 â€” Insider Ownership and Transactions

### Form 3

Initial ownership report when a person becomes an insider.

### Form 4

Most changes in beneficial ownership by directors, officers, and qualifying holders.

### Form 5

Certain transactions that were eligible for deferred annual reporting or were not reported earlier.

### Do not ask only whether insiders bought or sold

Ask:

- Who transacted?
- Was it the CEO, CFO, operating executive, founder, or director?
- Was the transaction open-market, an option exercise, a grant, a gift, a tax withholding, or a prearranged sale?
- How large was it relative to the personâ€™s remaining holdings and compensation?
- Did several insiders transact together?
- Did the transaction occur before or after a major event?
- Is the pattern recurring?
- Does the footnote identify a trading plan?
- Did ownership increase economically, or only because of an award?

### Possible signals

| Pattern | Possible Interpretation | Next Step |
|---|---|---|
| CFO open-market purchase | Confidence in near-term financial condition, though not proof | Compare size, valuation, guidance, and other insider behavior |
| Several directors buy after a decline | Coordinated confidence or governance signaling | Check meeting timing, 8-Ks, and company-specific catalyst |
| Founder sells a small regular amount | Diversification or planned liquidity | Read footnotes and compare with remaining stake |
| Large discretionary sale before bad news | Potential concern, but timing and plan matter | Check trading-plan disclosure, event chronology, and enforcement records |
| Option exercise followed by sale | Often compensation-related | Separate exercise economics from discretionary sale |
| Insider gifts shares | Estate or charitable planning may be involved | Read transaction codes and footnotes |

---

## 6.10 Schedule 13D and 13G â€” Significant Beneficial Ownership

A holder crossing a reportable beneficial-ownership threshold may file Schedule 13D or 13G, depending on status and intent.

### Schedule 13D

Often associated with active or potentially influential ownership.

Look for:

- Purpose of the transaction.
- Financing source.
- Board-seat requests.
- Strategic review.
- Capital return.
- Sale process.
- Merger proposal.
- Governance changes.
- Communications with management.
- Agreements among investors.
- Amendments showing position changes.

### Schedule 13G

Often used by passive investors or qualifying institutions, but â€œpassiveâ€ should not be interpreted as irrelevant.

Look for:

- Holder identity.
- Ownership percentage.
- Filing category.
- Changes in position.
- Amendments.
- Whether multiple related entities share voting or dispositive power.

### Routing

```text
New 13D
   â†“
Read â€œPurpose of Transactionâ€
   â†“
Identify requested change
   â†“
Read investor letters and exhibits
   â†“
Check board structure and voting rules
   â†“
Map support needed from passive holders
   â†“
Watch DEFA14A, proxy materials, and vote results
```

---

## 6.11 Form 13F â€” Institutional Holdings

Form 13F is filed by qualifying institutional investment managers, not by the operating company itself.

### Uses

- Identify which managers report owning a security.
- Track position additions, reductions, and exits.
- Compare concentration.
- Classify likely investment style.
- Identify crowded ownership.
- Find managers worth researching through letters or commentary.

### Limitations

- Reporting is delayed.
- It generally does not reveal the full economic position.
- Shorts are not disclosed as short positions.
- Derivatives, swaps, and hedges may be incomplete or absent.
- Manager-level data may combine different strategies.
- Passive and active ownership should not be treated as equivalent.
- A reported holding does not prove influence over management.

### Better questions

- Which active managers are accumulating?
- Which stable, long-horizon holders are present?
- Is ownership increasingly passive?
- Is the stock crowded among similar growth or momentum funds?
- Are new holders likely fundamental, event-driven, quantitative, or index-based?
- Is there little incremental institutional buying capacity left?
- Is ownership broadening after a business-model improvement?

---

## 6.12 Registration Statements and Prospectuses

### S-1 or F-1

Useful for:

- Original company story.
- Founders.
- Early investors.
- Share classes.
- Customer concentration.
- Historical risks.
- Unit economics.
- Use of proceeds.
- Lockups.
- Related-party transactions.
- Pre-IPO financial history.

### S-3 or F-3

Often used for shelf registration and future securities offerings.

Possible implications:

- Future equity issuance.
- Debt issuance.
- At-the-market program.
- Secondary selling by existing holders.
- Capital flexibility.
- Potential dilution.

### Prospectus supplements, including 424B filings

Inspect:

- Security type.
- Number of shares or principal amount.
- Primary versus secondary sale.
- Use of proceeds.
- Underwriters.
- Conversion terms.
- Warrants.
- Discounts and fees.
- Selling shareholders.
- Lockups.
- Dilution table.
- Risk factors specific to the offering.

### Routing

```text
New shelf registration
    â†“
Does the company need capital or only flexibility?
    â†“
Cash runway and debt maturities
    â†“
Capex and acquisition plans
    â†“
ATM or follow-on prospectus
    â†“
Actual issuance and share-count change
```

---

## 6.13 Form 144 â€” Proposed Sales of Restricted or Control Securities

Use Form 144 as an early signal of possible insider or affiliate sales.

Questions:

- Who proposes to sell?
- How much relative to holdings?
- Is it part of a recurring pattern?
- Does it follow an exercise or vesting event?
- Does a later Form 4 confirm the sale?
- Does the filing coincide with a financing, lockup expiration, or strategic event?

A proposed sale is not always a completed sale. Confirm through later filings.

---

## 6.14 Form SD â€” Specialized Disclosure

Form SD can provide supply-chain or specialized-disclosure information relevant to certain industries.

Potential research uses include:

- Conflict-minerals processes.
- Resource-extraction disclosures where applicable.
- Supply-chain due diligence.
- Geographic sourcing dependencies.
- Compliance procedures.

Route meaningful findings into the dependency and geopolitical-risk maps.

---

## 6.15 Foreign Issuer Forms

### Form 20-F

Annual report for many foreign private issuers.

### Form 6-K

Periodic or event information furnished by many foreign private issuers.

### Form 40-F

Annual report used by certain eligible Canadian issuers.

The research logic remains the same, but disclosure timing, accounting standards, governance structure, and home-country requirements may differ.

---

## 6.16 Tender Offers, Mergers, and Control Events

High-value forms and materials can include:

- Schedule TO.
- Schedule 14D-9.
- Preliminary and definitive merger proxies.
- DEFA14A additional proxy materials.
- Written communications related to transactions.
- Fairness opinions included in transaction materials.
- Background-of-the-merger narratives.

These documents can reveal:

- Negotiation history.
- Board alternatives.
- Conflicts.
- Competing offers.
- Management incentives.
- Valuation ranges.
- Financing conditions.
- Reasons a board accepted or rejected a proposal.

---

## 6.17 Exhibits â€” Often the Highest-Signal Material

Do not stop at the filing body. Open the exhibits.

Important exhibits include:

- Credit agreements.
- Employment agreements.
- Acquisition agreements.
- Customer or supplier agreements.
- Licensing agreements.
- Joint-venture agreements.
- Restructuring plans.
- Severance arrangements.
- Investor presentations.
- Press releases.
- Bylaws and charter amendments.
- Debt indentures.
- Guarantee agreements.
- Equity-compensation plans.

### Exhibit questions

- What obligations are binding?
- Which terms are omitted or redacted?
- Are there minimum purchases?
- Termination rights?
- Exclusivity?
- Change-in-control provisions?
- Pricing resets?
- Financial covenants?
- Collateral?
- Customer concentration?
- Earn-outs?
- Noncompete clauses?
- Board nomination rights?

---

# 7. How to Scan EDGAR Efficiently

## 7.1 Before Opening a Filing

Record:

- Filing form.
- Filing date.
- Period covered.
- Event date if different.
- Amendment status.
- Accession number or source link.
- Whether the filing incorporates another document by reference.
- Relevant exhibits.
- Prior comparable filing.

### Source log

| Date Reviewed | Filing | Period/Event Date | Why It Matters | Key Pages/Sections | Open Questions |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

---

## 7.2 Three-Pass Reading Method

### Pass 1 â€” Orientation

Spend a few minutes identifying:

- What the document is.
- What period or event it covers.
- Whether it is amended.
- What changed since the prior filing.
- Which sections and exhibits matter.

### Pass 2 â€” High-Signal Scan

Search for terms related to:

#### Financial stress

- covenant
- waiver
- default
- liquidity
- going concern
- impairment
- restructuring
- delayed
- restatement
- non-reliance
- material weakness
- substantial doubt
- refinancing
- maturity
- collateral
- guarantee

#### Demand and revenue quality

- cancellation
- backlog
- bookings
- deferred revenue
- contract asset
- return
- rebate
- concession
- discount
- concentration
- renewal
- churn
- volume
- price
- mix
- channel
- distributor

#### Operations and supply chain

- supplier
- foundry
- capacity
- shortage
- lead time
- inventory
- purchase commitment
- minimum purchase
- sole source
- logistics
- power
- data center
- export
- tariff

#### Governance and control

- related party
- beneficial ownership
- voting power
- controlled company
- director resignation
- special committee
- activist
- proxy
- change in control
- indemnification

#### Accounting and disclosure

- estimate
- judgment
- useful life
- capitalization
- recognition
- fair value
- variable interest entity
- non-GAAP
- reclassification
- segment
- subsequent event

#### Legal and regulatory

- subpoena
- investigation
- inquiry
- litigation
- settlement
- consent decree
- patent
- antitrust
- privacy
- cybersecurity
- breach
- remediation

#### Capital allocation

- repurchase
- dividend
- offering
- dilution
- convertible
- warrant
- acquisition
- divestiture
- goodwill
- earn-out
- strategic review

### Pass 3 â€” Reconciliation

Tie the narrative to the statements.

- Does the revenue explanation match the segment data?
- Does â€œstrong demandâ€ match inventory, receivables, backlog, and cash collection?
- Does â€œdisciplined spendingâ€ match operating expenses and stock compensation?
- Does â€œreturning capitalâ€ exceed actual free cash flow?
- Does â€œdeleveragingâ€ reflect debt repayment or merely cash accumulation?
- Does â€œorganic growthâ€ exclude acquisitions consistently?
- Does a â€œone-timeâ€ expense recur?

---

## 7.3 Read in This Order

For a new company:

1. One-sentence company description.
2. 10-K business section.
3. Segment footnote.
4. Revenue-recognition footnote.
5. MD&A.
6. Cash-flow statement.
7. Balance sheet.
8. Debt and commitments footnotes.
9. Risk factors.
10. Proxy statement.
11. Recent 8-Ks.
12. Recent 10-Qs.
13. Insider and ownership filings.
14. Material exhibits.
15. Original S-1 for historical evolution.

For a quarterly update:

1. Earnings 8-K and exhibits.
2. New 10-Q.
3. Changed risk factors.
4. MD&A changes.
5. Financial-statement changes.
6. Footnotes.
7. New debt, offering, insider, ownership, or governance filings.
8. Update the company card and evolution timeline.

---

## 7.4 Compare, Do Not Merely Read

The highest-value technique is version comparison.

Compare:

- Current 10-K versus prior 10-K.
- Current 10-Q versus prior-year quarter.
- Current 10-Q versus immediately prior quarter.
- Current risk factors versus prior risks.
- Current proxy versus prior proxy.
- Current compensation metrics versus prior metrics.
- Current debt agreement versus prior agreement.
- Current segment definitions versus prior definitions.
- Current insider pattern versus historical behavior.
- Current ownership structure versus four to eight prior quarters.

### What to flag

- New sentences.
- Deleted sentences.
- Changed qualifiers.
- Numbers replaced by vague language.
- Risks changed from hypothetical to actual.
- Metrics no longer disclosed.
- Segments merged.
- Definitions altered.
- Footnotes expanded.
- Exhibits amended.
- Management changes in the same area where financial reporting becomes less clear.

---

## 7.5 Classify Every Finding

Use one of these labels:

- **Strengthens core.**
- **Weakens core.**
- **Expands adjacent capability.**
- **Creates a new business engine.**
- **Improves moat.**
- **Reduces dependency.**
- **Adds dependency.**
- **Improves economics.**
- **Reduces cash quality.**
- **Increases complexity.**
- **Changes control.**
- **Raises financing risk.**
- **Raises disclosure risk.**
- **Unresolved.**

Then record:

```markdown
### Finding
[What changed?]

### Evidence
[Exact filing, section, table, note, or exhibit.]

### Possible Benign Explanation
[Reasonable non-negative interpretation.]

### Possible Negative Explanation
[Reasonable risk interpretation.]

### Effect on the Company Machine
[Revenue, cost, asset, dependency, bottleneck, flywheel, control, or financing.]

### Next Evidence Needed
1.
2.
3.

### Thesis Impact
[No change / monitor / positive revision / negative revision / thesis broken.]
```

---

# 8. Finding â†’ Meaning â†’ Next Investigation

## 8.1 Revenue and Demand

| Finding | Possible Benign Meaning | Possible Negative Meaning | Go Next |
|---|---|---|---|
| Revenue rises rapidly | Strong demand, pricing, new product | Acquisition effect, channel stuffing, favorable timing | Segment note, organic-growth bridge, receivables, cash flow |
| Revenue rises but cash collection lags | Contract timing | Aggressive recognition or weaker customers | Receivables aging, allowance, contract assets, CFO |
| Deferred revenue rises | Strong prepaid demand | Longer billing cycles masking slower bookings | Billings, remaining obligations, renewal rates |
| Backlog rises | Future demand visibility | Nonbinding orders or extended delivery times | Cancellation terms, conversion history, customer concentration |
| Customer concentration rises | Major strategic win | Bargaining power and single-customer risk | Concentration footnote, contract exhibit, customer filing |
| Price increases drive growth | Pricing power | Volume may be weakening | Unit volume, churn, competitor pricing |
| Volume drives growth | Adoption and share gain | Discounting or low-quality sales | Gross margin, promotion, returns, receivables |
| Management stops reporting a demand metric | Metric may no longer be central | Deterioration or reduced transparency | Prior definitions, transcript, competitor disclosure |

---

## 8.2 Margins and Costs

| Finding | Possible Benign Meaning | Possible Negative Meaning | Go Next |
|---|---|---|---|
| Gross margin falls | Product launch, temporary input cost | Pricing pressure or mix deterioration | Product mix, inventory, supplier contracts |
| Gross margin rises | Scale, pricing, better mix | Underinvestment or accounting change | R&D, warranty, capitalization policies |
| Operating expense rises faster than sales | Investment for growth | Weak cost control | Hiring, SBC, new facilities, segment profitability |
| Layoffs reduce expense | Efficiency improvement | Demand problem or capability loss | Restructuring note, hiring trends, product roadmap |
| â€œOne-timeâ€ charges recur | Ongoing transformation | Normal costs excluded from adjusted earnings | Multi-year reconciliation |
| Warranty reserve rises | Conservative provisioning | Product quality issue | Warranty footnote, returns, legal claims |
| R&D falls as a percent of sales | Scale leverage | Moat underinvestment | Product cadence, patent activity, competitor R&D |

---

## 8.3 Working Capital

| Finding | Possible Benign Meaning | Possible Negative Meaning | Go Next |
|---|---|---|---|
| Receivables rise faster than sales | Large quarter-end shipments | Slower collections or aggressive sales terms | DSO, allowance, customer mix |
| Inventory rises faster than sales | Capacity build or launch preparation | Demand slowdown or obsolete stock | Inventory categories, write-downs, channel data |
| Payables rise sharply | Better supplier terms | Cash conservation or supplier stress | Supplier-finance note, cash flow, contract terms |
| Contract assets rise | Milestone-based growth | Revenue recognized before billing | Revenue policy, collection timeline |
| Customer deposits fall | Delivery conversion | Weak new orders | Bookings, backlog, cancellations |

---

## 8.4 Capital Expenditure and AI Infrastructure

| Finding | Possible Benign Meaning | Possible Negative Meaning | Go Next |
|---|---|---|---|
| Capex rises sharply | Capacity for high-return demand | Overbuilding or lower future returns | Purchase commitments, utilization, depreciation, power agreements |
| Data-center leases increase | Flexible expansion | Long-duration fixed costs | Lease terms, minimum payments, customer commitments |
| Depreciation rises more slowly than capex | New assets not yet in service | Useful-life assumptions may be aggressive | Asset roll-forward, useful lives, construction in progress |
| Power commitments rise | Secured strategic capacity | Fixed cost if demand disappoints | Utility contracts, locations, capacity ramp |
| AI spending is described broadly | Early optionality | Promotional spending without measurable returns | Segment data, revenue attribution, capex returns, customer contracts |

---

## 8.5 Acquisitions, Goodwill, and Intangibles

| Finding | Possible Benign Meaning | Possible Negative Meaning | Go Next |
|---|---|---|---|
| Goodwill rises | Strategic acquisition | Overpayment | Purchase-price allocation, synergies, earn-outs |
| Intangibles rise | Acquired technology or contracts | Growth purchased rather than built | Amortization, retention, organic growth |
| Frequent â€œsmallâ€ acquisitions | Capability acquisition | Roll-up dependence | Aggregate cash spent, acquired revenue, integration charges |
| Impairment | Honest reset | Prior capital-allocation failure | Original acquisition thesis, segment performance |
| Earn-out liability changes | Acquired business outperforming | Valuation-estimate volatility | Earn-out terms and acquired KPIs |

---

## 8.6 Debt, Liquidity, and Financing

| Finding | Possible Benign Meaning | Possible Negative Meaning | Go Next |
|---|---|---|---|
| New debt | Acquisition, capex, refinancing | Cash burn or shareholder distribution funded by debt | Credit agreement, maturities, use of proceeds |
| Revolver draw | Temporary working capital | Liquidity stress | Cash forecast, covenant terms, subsequent repayment |
| Covenant amendment | Proactive flexibility | Deteriorating compliance | Original covenant, waiver cost, lender protections |
| Convertible issuance | Lower coupon and growth capital | Future dilution and hedging pressure | Conversion price, capped call, maturity |
| Shelf registration | Capital flexibility | Anticipated dilution | Cash runway, prospectus supplements |
| Interest expense rises faster than debt | Rate reset or mix change | Refinancing problem | Debt footnote, variable-rate exposure |
| Buybacks continue while debt rises | Capital optimization | Financial engineering | Free cash flow, SBC offset, leverage targets |

---

## 8.7 Stock-Based Compensation, Buybacks, and Dilution

| Finding | Possible Benign Meaning | Possible Negative Meaning | Go Next |
|---|---|---|---|
| SBC rises | Hiring and retention | Economic cost hidden by adjusted metrics | Diluted shares, grant terms, employee count |
| Buybacks rise | Undervaluation and excess cash | Offset dilution or support EPS | Net share count, average repurchase price |
| Shares outstanding remain flat despite large buybacks | Employee issuance offset | Owners receive little net reduction | SBC note and cash spent |
| Secondary offering | Holder liquidity | Insider or sponsor exit | Selling shareholder, remaining stake |
| ATM program | Flexible financing | Repeated dilution | Actual issuance and cash use |
| Warrants are modified | Financing cleanup | Hidden dilution | Exercise price, anti-dilution terms |

---

## 8.8 Governance and Leadership

| Finding | Possible Benign Meaning | Possible Negative Meaning | Go Next |
|---|---|---|---|
| CEO leaves | Planned succession | Strategic or operational problem | 8-K, compensation terms, board timeline |
| CFO leaves | Retirement or new role | Reporting, liquidity, or forecast concern | Auditor, controls, restatement, debt |
| Several directors leave | Refreshment | Governance dispute | Committee changes, 8-K wording, activist activity |
| New director has specialized expertise | Capability upgrade | Cosmetic appointment | Committee role, prior relationships |
| CEO becomes chair | Unified leadership | Weaker oversight | Lead independent director powers |
| Compensation metric changes | Better alignment | Target reset after underperformance | Prior proxy, realized pay, vote results |
| Say-on-pay dissent rises | Shareholder concern | Broader governance instability | Engagement response and next proxy |
| Related-party transaction expands | Strategic relationship | Conflict of interest | Approval process, pricing, independent review |

---

## 8.9 Accounting and Controls

| Finding | Possible Benign Meaning | Possible Negative Meaning | Go Next |
|---|---|---|---|
| Auditor changes | Normal tender | Accounting disagreement | 8-K Item 4.01, prior auditor letter |
| Material weakness | Identified and remediable gap | Unreliable reporting risk | Scope, affected accounts, remediation |
| Restatement | Correction and transparency | Aggressive accounting or weak controls | Non-reliance 8-K, auditor, executive changes |
| Useful lives extended | Better durability | Earnings boosted through lower depreciation | Asset replacement and capex |
| Segment definitions change | Strategy evolution | Reduced comparability | Historical recast and management incentives |
| Non-GAAP exclusions expand | Real transformation costs | Normal expenses removed | Multi-year recurring exclusions |
| Critical estimate sensitivity rises | Honest disclosure | Earnings vulnerable to assumptions | Scenario table and underlying drivers |

---

## 8.10 Legal, Regulatory, and Cybersecurity

| Finding | Possible Benign Meaning | Possible Negative Meaning | Go Next |
|---|---|---|---|
| New investigation | Routine inquiry | Enforcement or business-model risk | Legal note, regulator records, 8-K |
| Legal reserve rises | Conservative settlement preparation | Greater expected loss | Contingency range, cash impact |
| Cyber incident | Contained event | Operational, legal, or trust damage | Incident 8-K, remediation, insurance |
| Patent litigation | Normal industry dispute | Product injunction or royalty burden | Claims, affected product, license options |
| New regulation | Compliance opportunity | Cost or revenue restriction | Segment exposure, competitor response |
| Export restriction expands | Manageable product redesign | Lost market and inventory risk | Geography, licenses, write-downs |

---

## 8.11 Ownership and Market Structure

| Finding | Possible Benign Meaning | Possible Negative Meaning | Go Next |
|---|---|---|---|
| Institutional ownership rises | Discovery and sponsorship | Crowding and benchmark dependence | Active/passive split, turnover |
| Institutional ownership falls | Profit-taking | Thesis deterioration or forced selling | Manager filings, company events |
| New 13D | Monitoring and value catalyst | Conflict or disruptive battle | Purpose section, proxy rules |
| Founder control persists | Long-term alignment | Minority shareholder risk | Voting rights, related parties |
| Passive ownership dominates | Stable benchmark demand | Limited discretionary buyer base | Index weights, voting behavior |
| Low institutional ownership | Underfollowed opportunity | Weak liquidity or governance | Analyst coverage, insider alignment |
| Short interest rises | Hedging or skepticism | Fundamental concern or squeeze setup | Borrow cost, catalyst, filings |

---

# 9. Investigation Trees

## 9.1 Unexpected Executive Departure

```text
Executive departure
        â†“
Immediate or planned?
        â†“
Reason disclosed?
        â†“
Temporary or permanent replacement?
        â†“
Compensation or severance agreement?
        â†“
Recent operational miss?
        â†“
Auditor, control, covenant, legal, or customer issue?
        â†“
Recent insider transactions?
        â†“
Does the departure affect a critical capability?
        â†“
Update control map and reverse flywheel
```

---

## 9.2 Inventory Rises Faster Than Sales

```text
Inventory increase
        â†“
Raw material, work in process, or finished goods?
        â†“
New product launch or capacity build?
        â†“
Lead times and purchase commitments?
        â†“
Customer orders and cancellations?
        â†“
Channel inventory?
        â†“
Write-down or obsolescence reserve?
        â†“
Gross-margin trend?
        â†“
Competitor inventory?
        â†“
Does the bottleneck improve or has demand weakened?
```

---

## 9.3 New Debt

```text
Debt issued
        â†“
Use of proceeds?
        â†“
Refinancing, acquisition, capex, buyback, or liquidity?
        â†“
Fixed or variable rate?
        â†“
Maturity and amortization?
        â†“
Covenants, collateral, and guarantees?
        â†“
Cash-flow coverage?
        â†“
What bank or lender gains influence?
        â†“
Does financing strengthen the machine or increase fragility?
```

---

## 9.4 Acquisition

```text
Acquisition announced
        â†“
What is being acquired: customer, capability, asset, talent, or revenue?
        â†“
Same customer and distribution?
        â†“
Purchase price and financing?
        â†“
Goodwill and intangibles?
        â†“
Synergy assumptions?
        â†“
Integration costs?
        â†“
Earn-out?
        â†“
Management incentives?
        â†“
Does the one-sentence description change?
        â†“
Score positive evolution versus complexity
```

---

## 9.5 AI Strategy Expansion

```text
Management announces AI initiative
        â†“
What is the actual product or cost?
        â†“
Who pays?
        â†“
Is revenue separately measurable?
        â†“
Does it reuse data, distribution, infrastructure, or customer relationships?
        â†“
What capex, power, talent, and supplier dependencies are added?
        â†“
Does it improve the existing flywheel?
        â†“
What metric would disprove the strategy?
        â†“
Is the company becoming an AI business or merely adding AI features?
```

---

## 9.6 Risk Factor Changes From Hypothetical to Actual

```text
Risk wording changes
        â†“
Identify exact deleted and added language
        â†“
Find first date the issue appeared
        â†“
Search 8-Ks and footnotes
        â†“
Quantify revenue, cost, asset, or legal exposure
        â†“
Check customer, supplier, and competitor filings
        â†“
Assess insurance, reserve, hedge, or alternative supplier
        â†“
Update dependency map and bear case
```

---

## 9.7 Large Shareholder Appears

```text
New 13D or 13G
        â†“
Who is the holder?
        â†“
Active, passive, institutional, founder, strategic, or activist?
        â†“
How was the position financed?
        â†“
Purpose and requested actions?
        â†“
Voting rights and board structure?
        â†“
Support required from other holders?
        â†“
Potential catalyst and potential conflict?
        â†“
Monitor amendments, proxy filings, and vote results
```

---

# 10. Integrated Quarterly Workflow

## Step 1 â€” Preserve the Prior Baseline

Before reading the newest filing, save:

- Prior one-sentence description.
- Prior company machine.
- Prior revenue and cost map.
- Prior bottleneck.
- Prior flywheel.
- Prior key risks.
- Prior thesis.
- Prior monitoring triggers.

This prevents the newest management narrative from rewriting history.

---

## Step 2 â€” Process Event Filings First

Review material 8-Ks since the prior report.

Classify each event by whether it affects:

- Revenue.
- Cost.
- Asset.
- Capability.
- Dependency.
- Bottleneck.
- Control.
- Financing.
- Disclosure quality.
- Evolution path.

---

## Step 3 â€” Scan the New 10-Q

Extract:

- Revenue by segment.
- Price, volume, mix, currency, and acquisition effects.
- Gross and operating margin.
- Working capital.
- Cash generation.
- Capex.
- Debt.
- Share count.
- Stock compensation.
- New risks.
- Updated legal matters.
- New commitments.

---

## Step 4 â€” Compare Language

Highlight:

- New words.
- Removed metrics.
- New caveats.
- Changed definitions.
- Risks now described as actual.
- New reliance on adjusted figures.
- Segment changes.
- Less-specific explanations.

---

## Step 5 â€” Reconcile the Story

Test managementâ€™s claims against:

- Cash flow.
- Receivables.
- Inventory.
- Deferred revenue.
- Backlog.
- Customer concentration.
- Capital commitments.
- Employee and compensation changes.
- Competitor disclosures.

---

## Step 6 â€” Update the Bare-Bones Description

Use one of four outcomes:

1. **No change:** The machine is the same; only speed changed.
2. **Strengthened:** The company performs the same core function more effectively.
3. **Expanded:** A credible adjacent engine is emerging.
4. **Transformed:** The primary customer, product, economics, or capability has changed.
5. **Degraded:** The original engine is weakening or being obscured by complexity.

---

## Step 7 â€” Update the Evolution Score

Score each material initiative and record which evidence would improve or reduce the score next quarter.

---

## Step 8 â€” Update Monitoring Triggers

A trigger should be observable.

Weak trigger:

> â€œAI demand should remain strong.â€

Better triggers:

- Segment growth falls below a defined threshold.
- Capex grows faster than related revenue for a defined period.
- Customer concentration exceeds a chosen level.
- Gross margin falls despite favorable mix.
- Deferred revenue or backlog conversion deteriorates.
- Net share count rises despite buybacks.
- Debt is issued to fund recurring operating cash burn.
- A risk changes from hypothetical to actual.
- A critical executive or director departs.
- A major holder files a 13D amendment.

---

# 11. Annual Deep-Dive Workflow

## 11.1 Rebuild the Company From Scratch

Once per year, ignore the prior polished narrative and reconstruct:

- One-sentence description.
- Revenue engine.
- Cost engine.
- Assets.
- Capabilities.
- Customers.
- Dependencies.
- Bottleneck.
- Flywheel.
- Reverse flywheel.
- Control map.

Then compare the new reconstruction with the prior year.

---

## 11.2 Compare Three Years of Filings

Track:

- Segment changes.
- Risk-factor evolution.
- Revenue mix.
- Margin structure.
- Cash conversion.
- Capital intensity.
- Acquisitions.
- Goodwill.
- Debt.
- Stock compensation.
- Net share count.
- Insider ownership.
- Board composition.
- Compensation metrics.
- Auditor and control disclosures.
- Major holder changes.

---

## 11.3 Read the Proxy as an Operating Document

Ask whether management is financially rewarded for:

- Growing revenue.
- Growing adjusted earnings.
- Growing free cash flow.
- Improving returns on capital.
- Increasing market share.
- Reaching product milestones.
- Raising the stock price.
- Completing acquisitions.
- Achieving safety, quality, or customer goals.

Then ask which undesirable behavior each metric could encourage.

Example:

```text
Compensation heavily rewards revenue growth
        â†“
Management can acquire revenue
        â†“
Acquisitions increase goodwill and debt
        â†“
Adjusted earnings exclude integration costs
        â†“
Revenue target is met while owner economics weaken
```

---

# 12. Research Scoring System

Use scoring to organize judgment, not replace it.

## 12.1 Company Clarity Score

| Dimension | 0 | 5 |
|---|---|---|
| Simple description | Cannot describe coherently | Clear and stable |
| Revenue visibility | Opaque | Highly understandable |
| Cost visibility | Opaque | Clearly linked to operations |
| Segment transparency | Constantly changing | Consistent and useful |
| Cash reconciliation | Earnings do not convert | Strong, explainable conversion |

---

## 12.2 Economic Quality Score

| Dimension | 0 | 5 |
|---|---|---|
| Recurrence | One-time or highly cyclical | Durable recurring demand |
| Pricing power | Price taker | Strong pricing power |
| Capital intensity | Constant heavy reinvestment | Low incremental capital need |
| Customer power | Highly concentrated buyer | Fragmented customers |
| Supplier power | Sole-source dependency | Diversified or controlled inputs |
| Returns on capital | Below cost of capital | Persistently high |
| Balance-sheet resilience | Fragile | Strong |

---

## 12.3 Governance and Control Score

| Dimension | 0 | 5 |
|---|---|---|
| Board independence | Captured | Credibly independent |
| Incentive alignment | Rewards size or adjusted metrics only | Rewards durable owner outcomes |
| Insider alignment | Low economic stake | Meaningful economic exposure |
| Minority protection | Weak | Strong |
| Related-party controls | Opaque | Clear and independently reviewed |
| Shareholder responsiveness | Ignores dissent | Engages and changes |
| Lender dependence | Financing controls strategy | Flexible financing base |

---

## 12.4 Disclosure Integrity Score

| Dimension | 0 | 5 |
|---|---|---|
| Metric consistency | Definitions constantly change | Stable definitions |
| Risk specificity | Boilerplate | Specific and decision-useful |
| Footnote clarity | Material items obscured | Clear |
| Non-GAAP discipline | Recurring exclusions | Limited and reconciled |
| Segment transparency | Aggregated strategically | Economically meaningful |
| Error history | Restatements or weaknesses | Strong controls |
| Event disclosure | Delayed or incomplete | Prompt and detailed |

---

## 12.5 Overall Research State

- **Green:** The business machine is clear, improving, and supported by filings.
- **Yellow:** The thesis remains plausible, but one or more dependencies, disclosures, or initiatives require proof.
- **Orange:** The simple description is changing faster than evidence supports, or financial quality is weakening.
- **Red:** Managementâ€™s narrative conflicts with filings, the core engine is deteriorating, or control and financing risks can overwhelm minority owners.

---

# 13. Full Company Dossier Template

```markdown
---
company:
ticker:
cik:
sector:
industry:
fiscal_year_end:
last_updated:
research_status:
confidence:
overall_state: green | yellow | orange | red
---

# [Company Name]

## 1. Simplest Description

### One Sentence
[Explain the business to a ten-year-old.]

### One Paragraph
[Explain the inputs, transformation, output, customer, and payment.]

### What Would Disappear If the Company Disappeared?
[Identify the real function, not the brand.]

---

## 2. Company Machine

### Inputs
- 

### Transformation
- 

### Outputs
- 

### Customers, Users, and Payers
- 

### Collection Method
- 

### Required Reinvestment
- 

### Owner Distributions
- 

---

## 3. Revenue Engine

| Stream | Customer | Pricing | Recurring? | Margin | Growth Driver | Risk |
|---|---|---|---|---|---|---|
| | | | | | | |

---

## 4. Cost Engine

| Cost | Fixed/Variable | Driver | Strategic? | Risk |
|---|---|---|---|---|
| | | | | |

---

## 5. Assets and Capabilities

### Critical Assets
- 

### Reusable Capabilities
- 

### Assets That Look Valuable but May Be Replicable
- 

---

## 6. Dependencies and Bottlenecks

| Dependency | Importance | Replaceability | Evidence | Trigger |
|---|---|---|---|---|
| | | | | |

### Current Bottleneck
[ ]

### If Demand Doubled, What Breaks First?
[ ]

---

## 7. Flywheel

```text
Step 1
  â†“
Step 2
  â†“
Step 3
  â†“
Step 1 strengthens
```

## 8. Reverse Flywheel

```text
Weakness
  â†“
Customer response
  â†“
Economic deterioration
  â†“
Reduced reinvestment
  â†“
Wider weakness
```

---

## 9. Control and Ownership

### Voting Control
- 

### Top Holders
- 

### Active Versus Passive Influence
- 

### Insider Alignment
- 

### Bank and Lender Influence
- 

### Board Structure
- 

### Who Can Force or Stop a Strategic Move?
- 

---

## 10. Evolution Timeline

| Period | Simplest Description | Evidence | Change Type | Score |
|---|---|---|---|---|
| | | | | |

### Positive Evolution
- 

### Negative Evolution
- 

### Emerging Next State
- 

---

## 11. Filing Baseline

### 10-K
- Filing date:
- Period:
- Key findings:
- Changed risks:
- Key footnotes:
- Controls:
- Auditor:

### 10-Q
- Filing date:
- Period:
- Key changes:

### 8-K Timeline
| Date | Item/Event | Meaning | Next Step |
|---|---|---|---|
| | | | |

### Proxy
- Board:
- Compensation:
- Ownership:
- Related parties:
- Vote concerns:

### Insider Filings
- 

### 13D/13G
- 

### 13F Ownership Trends
- 

### Offerings and Registration Statements
- 

### Material Exhibits
- 

---

## 12. Financial Skeleton

| Metric | Current | Prior | Direction | Explanation | Concern |
|---|---:|---:|---|---|---|
| Revenue | | | | | |
| Gross margin | | | | | |
| Operating margin | | | | | |
| Operating cash flow | | | | | |
| Capex | | | | | |
| Free cash flow | | | | | |
| Receivables | | | | | |
| Inventory | | | | | |
| Deferred revenue | | | | | |
| Debt | | | | | |
| SBC | | | | | |
| Diluted shares | | | | | |

---

## 13. Findings and Routes

### Finding 1
- Evidence:
- Benign interpretation:
- Negative interpretation:
- Effect on machine:
- Next documents:
- Trigger:
- Thesis impact:

### Finding 2
- Evidence:
- Benign interpretation:
- Negative interpretation:
- Effect on machine:
- Next documents:
- Trigger:
- Thesis impact:

---

## 14. Thesis

### Simplest Bull Case
[ ]

### Simplest Bear Case
[ ]

### What Is Already Reflected in the Price?
[ ]

### Unexpected Upside
[ ]

### Unexpected Downside
[ ]

### What Would Break the Thesis?
[ ]

### What Would Confirm the Thesis?
[ ]

---

## 15. Next Research Queue

1.
2.
3.
4.
5.

---

## 16. Source Log

| Source | Filing/Document Date | Section | Claim Supported | Reliability |
|---|---|---|---|---|
| | | | | |
```

---

# 14. Starter Large-Cap Research Universe

This list gives the process an AI-heavy starting point while preserving at least one company from each major sector.

| Sector | Initial Company | Bare-Bones Research Angle |
|---|---|---|
| Information Technology | NVIDIA or Microsoft | AI compute, software ecosystem, data-center capital cycle |
| Communication Services | Meta Platforms or Alphabet | Attention, advertising, AI distribution, founder voting control |
| Consumer Discretionary | Amazon | Commerce, logistics, cloud infrastructure, advertising |
| Consumer Staples | Costco | Membership economics, low-markup retail, renewal durability |
| Health Care | Eli Lilly | Drug discovery, manufacturing capacity, patent and reimbursement risk |
| Financials | JPMorgan Chase | Deposits, credit creation, fee businesses, regulation, capital requirements |
| Industrials | Caterpillar or GE Aerospace | Equipment cycles, installed base, service revenue, supply chain |
| Energy | Exxon Mobil | Commodity production, refining, capital discipline, geopolitical exposure |
| Utilities | NextEra Energy | Regulated returns, power demand, financing, generation mix |
| Materials | Linde or Sherwin-Williams | Industrial-gas contracts or branded coatings and distribution |
| Real Estate | Prologis | Logistics-property rent, development, financing, tenant demand |

For each company, begin with the exact same template. Sector-specific complexity should be added only after the common company machine is clear.

---

# 15. Common Research Errors

## Error 1 â€” Treating the Story as the Business

â€œAI company,â€ â€œplatform,â€ â€œecosystem,â€ and â€œdigital transformationâ€ are classifications, not complete descriptions.

Corrective action:

- Identify the actual product.
- Identify the payer.
- Identify the pricing unit.
- Identify the required capital.
- Identify what changes in the financial statements when demand rises.

---

## Error 2 â€” Reading One Filing in Isolation

A disclosure may look unimportant until compared with the prior version.

Corrective action:

- Compare wording.
- Preserve prior definitions.
- Track deleted metrics.
- Build a timeline.

---

## Error 3 â€” Treating 13F as Real-Time or Complete Ownership

Corrective action:

- Record the reporting delay.
- Separate reported long holdings from total economic exposure.
- Classify active versus passive.
- Use 13D, 13G, proxy ownership tables, and insider filings alongside 13F.

---

## Error 4 â€” Treating All Insider Sales as Bearish

Corrective action:

- Read transaction codes and footnotes.
- Separate grants, exercises, tax withholding, gifts, plans, and open-market transactions.
- Compare the sale with remaining ownership.

---

## Error 5 â€” Ignoring Exhibits

Corrective action:

- Open credit agreements, merger agreements, employment contracts, and offering documents.
- Search for termination, covenant, exclusivity, minimum purchase, collateral, and change-in-control terms.

---

## Error 6 â€” Accepting Adjusted Metrics Without Reconciliation

Corrective action:

- Track exclusions over several years.
- Identify recurring â€œone-timeâ€ items.
- Reconcile adjusted earnings to cash and diluted share count.

---

## Error 7 â€” Mistaking Growth for Positive Evolution

Revenue can grow while the company becomes weaker.

Corrective action:

- Measure cash conversion.
- Measure capital intensity.
- Measure customer and supplier power.
- Measure complexity.
- Measure whether the core flywheel is stronger.

---

## Error 8 â€” Failing to Rewrite the Company Description

If the company changes but the description does not, the research model becomes stale.

Corrective action:

- Revisit the one-sentence description after every major acquisition, segment change, capital program, regulatory shift, or new revenue engine.

---

# 16. Final Research Principle

The full process can be reduced to one discipline:

> **Describe the company simply, prove the description with filings, detect what changed, and follow every meaningful change to the next source until the economic consequence is understood.**

The companyâ€™s story may become more complicated over time. The research should become more preciseâ€”not more confusing.

A high-quality final conclusion should state:

1. What the company is now.
2. What it used to be.
3. What it may be becoming.
4. Which filings prove the change.
5. Whether the change strengthens or weakens the revenue engine, cost structure, capabilities, dependencies, governance, and cash generation.
6. What future disclosure would confirm or disprove the conclusion.
