# AGENT.md — Company Reality Check

**Version:** 0.1  
**Status:** Build specification  
**Application type:** Human-in-the-loop public-company research and trade-structure workspace  
**Primary user:** An individual investor or research team that wants plain-language, auditable company analysis before moving into valuation, financial modeling, options, bonds, or technical timing  
**Default mode:** Educational research, not personalized financial advice

---

## 1. Mission

Build an application that turns a public company into a structured, understandable, evidence-based research project.

The application must help the user answer three separate questions:

1. **Is this a strong company?**
2. **Is the current stock price reasonable relative to what the market already expects?**
3. **Is there a sensible, limited-risk way to express the thesis?**

The application must not collapse those questions into a single score. A strong business may be an unattractive stock at an excessive price. A weak business may still offer a temporary catalyst or momentum trade. A correct long-term thesis may still fail as a short-dated option.

The application should feel like a guided investigation rather than an automated stock picker.

---

## 2. Core product principles

### 2.1 Plain English comes first

Every company must first be explained in language that a child or first-time investor can understand. Advanced analysis remains available, but no technical section should be required to understand the company’s basic business model.

### 2.2 Every technical term must be explainable

Any financial, investing, accounting, options, bond, market-structure, or business-strategy term that may be unfamiliar must have a tooltip.

The tooltip requirement applies to:

- Page labels
- Section headings
- Chart labels
- Table headers
- Form fields
- Generated analysis
- Metric cards
- Option and bond calculations
- Status labels
- Acronyms
- Agent-generated terminology

An acronym may not appear without either:

- Its full name written first, or
- A tooltip linked to an approved glossary definition

### 2.3 Price is a set of expectations

The application must explain what the market appears to expect at the current stock price. It should not treat “the stock is expensive” or “the stock is cheap” as sufficient analysis.

### 2.4 Capability is not automatically a moat

A **capability** is something useful the company has built, learned, accumulated, or gained access to.

A **moat** is a measurable economic advantage that is:

- Proven
- Self-reinforcing or perpetuating
- Durable against competition

The application must distinguish:

- Marketing claim
- Demonstrated capability
- Emerging moat or moat trajectory
- Proven moat
- Eroding moat

### 2.5 Claims must be auditable

Every factual statement must link to a source. Every calculated metric must show its formula and inputs. Every inference must be labeled as an inference.

### 2.6 Humans own assumptions and decisions

The agent may gather evidence, propose interpretations, calculate scenarios, and highlight conflicts. The human must approve important assumptions, red-flag thresholds, and final conclusions.

### 2.7 “No position” is a valid output

The application must never force a trade recommendation. It should explicitly support:

- Deep dive
- Watch for proof
- Long-term watchlist
- Momentum trade only
- Event-driven trade only
- Good company, unattractive price
- Weak company, potentially asymmetric trade
- Insufficient evidence
- Pass
- No position

### 2.8 Red flags are written before the next event

The user and agent must define thesis-breaking metrics before earnings, regulatory decisions, product launches, or other catalysts. This reduces the temptation to rationalize bad news afterward.

### 2.9 Freshness is visible

Current prices, option chains, bond quotes, analyst estimates, and technical indicators must always show a timestamp. Stale data must be labeled clearly and may not be presented as current.

---

## 3. Collaboration model

### 3.1 Human responsibilities

The human user is responsible for:

- Selecting the company and security
- Defining the intended holding period
- Identifying whether the goal is investment, trade, hedge, income, or education
- Declaring current exposure and maximum acceptable loss
- Reviewing and correcting the plain-language explanation
- Approving assumptions used in valuation scenarios
- Approving the moat classification
- Selecting the most important catalysts and risks
- Setting or approving red-flag thresholds
- Confirming brokerage permissions and instrument constraints
- Making the final decision
- Recording what evidence would change the decision

### 3.2 Agent responsibilities

The agent is responsible for:

- Resolving the correct company, ticker, exchange, and security
- Gathering and organizing primary sources
- Extracting revenue, profit, cash-flow, balance-sheet, and operating metrics
- Drafting a child-friendly explanation
- Identifying the actual economic engine
- Comparing the company with peers and its own history
- Estimating the expectations implied by the current valuation
- Separating capabilities from proven moats
- Identifying likely catalysts, threats, and leading indicators
- Determining whether fundamentals, momentum, or narrative appear to be driving the price
- Selecting the appropriate financial-analysis module
- Drafting red-flag thresholds for human approval
- Calculating option or bond scenarios when current data are available
- Drafting the final one-page company card
- Monitoring approved metrics and marking research stale
- Surfacing uncertainty, conflicting evidence, missing data, and unsupported claims

### 3.3 System responsibilities

The application is responsible for:

- Preserving source provenance
- Versioning every research run
- Recording human edits and overrides
- Managing glossary terms and tooltips
- Enforcing accessibility
- Preventing unsupported claims from being marked “verified”
- Marking stale data
- Separating reported facts, management guidance, market estimates, and agent inference
- Keeping an audit trail of assumptions and changes

---

## 4. Research task states

Every module and individual task must use one of the following states:

- **Not started:** No work has begun.
- **Queued:** Waiting for an agent or human action.
- **Researching:** The agent is gathering evidence.
- **Draft ready:** The agent has produced an initial result.
- **Needs human input:** A missing assumption or judgment prevents completion.
- **Needs verification:** A factual conflict, weak source, or calculation issue remains.
- **Human approved:** The user has reviewed and accepted the result.
- **Locked:** The result is part of a completed research snapshot.
- **Stale:** New financial results, market data, guidance, or material events may have invalidated the result.
- **Archived:** The result is retained for historical comparison but is no longer active.

A research run cannot receive a final verdict while a required module remains in **Needs human input**, **Needs verification**, or **Stale** status.

---

## 5. Application workflow

The default workflow is:

1. Research intake
2. Child-friendly company overview
3. Real economic engine
4. Current valuation and embedded expectations
5. Capability and moat analysis
6. Future capabilities already priced into the stock
7. Unexpected growth and downside map
8. Fundamentals versus momentum and “stock vibes”
9. Financial deep dive
10. Red-flag dashboard
11. Instrument and limited-risk structure
12. Technical timing
13. One-page decision card
14. Ongoing monitoring and re-underwriting

The user may pause after any stage. The agent should recommend the next useful stage, but it must not skip a required human approval gate.

---

# 6. Module specifications

## Module 0 — Research intake and baseline questions

### Goal

Define exactly what is being analyzed, why it is being analyzed, and what would make the work useful.

### Required human inputs

- Company name or ticker
- Intended holding period:
  - Days
  - Weeks
  - Months
  - One to three years
  - More than three years
- Purpose:
  - Long-term investment
  - Earnings trade
  - Event-driven trade
  - Momentum trade
  - Hedge
  - Income
  - Credit or bond research
  - Education only
- Current position, if any
- Maximum capital at risk
- Maximum acceptable loss
- Allowed instruments:
  - Shares
  - Exchange-traded fund
  - Options
  - Corporate bonds
  - Convertible bonds
  - No trade instruments
- User confidence in the thesis:
  - No thesis yet
  - Early idea
  - Moderate conviction
  - Strong conviction
- Known catalyst or concern
- Any restricted sectors or instruments

### Agent tasks

- Resolve the correct company, ticker, exchange, share class, and currency.
- Identify whether the company is:
  - Mature compounder
  - Cyclical company
  - Turnaround
  - Regulated business
  - Capital-intensive infrastructure company
  - High-growth profitable company
  - Pre-profit innovation company
  - Pre-revenue company
  - Binary biotechnology company
  - Real-estate investment trust
  - Financial institution
  - Commodity producer
- Gather the latest annual report, quarterly report, earnings release, investor presentation, and relevant debt filings.
- Record the current price, market capitalization, enterprise value, latest reporting date, and next known catalyst.
- Identify missing information that requires human clarification.
- Ask the baseline questions below.

### Baseline questions

1. What must be true for this company to succeed?
2. What must be true for the stock to outperform from the current price?
3. What is the market already assuming?
4. What is the most fragile part of the thesis?
5. What evidence would make the user change their mind?
6. Would the company still seem attractive if the price chart were hidden?
7. Would the stock still seem attractive if the exciting future product were assigned no value?
8. Is the user interested in the business, the stock, the catalyst, or the price trend?
9. Is the expected return large enough to justify the uncertainty?
10. Is “no position” currently the most rational answer?

### Output

A **Research Brief** containing:

- Security identity
- Research objective
- Holding period
- Risk constraints
- Company type
- Required analysis modules
- Known catalyst
- Known thesis
- Known thesis-breaker
- Data freshness status
- Missing information
- Human approval status

### Completion gate

The human must approve the company identity, objective, time horizon, and risk constraints before the agent begins instrument analysis.

---

## Module 1 — Child-friendly company overview

### Goal

Explain the company so that a ten-year-old can understand what it does and why anyone pays it.

### Agent tasks

Answer:

1. What does the company make or do?
2. Who gives the company money?
3. What does the customer receive?
4. Why does the customer choose this company?
5. Does the customer pay once or repeatedly?
6. What does it cost the company to provide the product?
7. How does revenue become profit and cash?
8. What would customers miss if the company disappeared?
9. What is the simplest real-world analogy?
10. What is the blunt positive description?
11. What is the blunt negative description?

### Required writing rules

- Maximum five short paragraphs in the default view
- Target a fifth- to seventh-grade reading level
- No unexplained acronyms
- No management slogans
- No phrases such as “total addressable market,” “ecosystem,” “platform,” “AI-enabled,” or “digital transformation” without a tooltip and plain-language translation
- Use a concrete example whenever possible
- Separate what the company does today from what it hopes to do later

### Required output template

> **What it does:** This company helps **[customer]** do **[job]**.  
> **How it gets paid:** It earns money when **[payment event]** happens.  
> **Why customers choose it:** Customers use it because **[advantage]**.  
> **Biggest strength:** **[strength]**.  
> **Biggest dependency:** **[dependency]**.

### Human tasks

- Confirm that the explanation is accurate.
- Mark any sentence that still feels promotional or confusing.
- Approve the analogy.
- Select one of three reading modes:
  - Kids
  - Standard
  - Analyst

### Completion gate

A user in **Kids** mode must be able to answer:

- What does the company sell?
- Who pays it?
- Why do customers choose it?

---

## Module 2 — The real economic engine

### Goal

Identify what actually generates revenue, profit, and cash rather than relying on the company’s public story.

### Agent tasks

Determine:

1. Largest revenue segment
2. Largest profit segment
3. Most heavily promoted future segment
4. Whether those three are the same
5. Revenue type:
   - Recurring
   - Transactional
   - Project-based
   - Usage-based
   - Advertising
   - Membership
   - Licensing
   - Consumables
   - One-time product sale
6. Customer concentration
7. Product concentration
8. Geographic concentration
9. Growth source:
   - More customers
   - Higher prices
   - More usage
   - New products
   - Acquisitions
   - Currency
   - Temporary shortage
   - Government support
10. Profit quality
11. Cash conversion
12. Capital required to sustain growth
13. Dilution required to fund operations
14. Largest dependency outside management’s control

### Required output

> **This is actually a [business type] powered by [economic engine], not merely a [popular narrative] company.**

The section must also include:

- Revenue bridge
- Profit bridge
- Cash-flow bridge
- Customer concentration card
- Product concentration card
- Capital-intensity label
- Recurring-revenue label
- Economic-engine confidence level

### Human tasks

- Approve the economic-engine sentence.
- Identify any business segment the agent may be underweighting.
- Confirm whether one-time or temporary benefits should be excluded.

### Completion gate

The agent must identify the largest revenue source, largest profit source, and largest future narrative separately.

---

## Module 3 — Why is the stock valued at this price?

### Goal

Translate the current stock price into the growth, margin, market-share, and execution assumptions investors appear to be making.

### Agent tasks

1. Record:
   - Share price
   - Market capitalization
   - Enterprise value
   - Net cash or net debt
   - Share count
2. Select valuation methods appropriate to the business:
   - Price-to-earnings
   - Enterprise-value-to-sales
   - Enterprise-value-to-earnings before interest, taxes, depreciation, and amortization
   - Free-cash-flow yield
   - Price-to-book
   - Funds from operations
   - Dividend yield
   - Net asset value
   - Sum-of-the-parts
   - Discounted cash flow
   - Reverse discounted cash flow
3. Compare valuation with:
   - Company history
   - Direct competitors
   - Sector
   - Broad market
4. Identify the premium the market may be paying for:
   - Growth
   - Stability
   - Scarcity
   - Brand
   - Management
   - Regulation
   - Momentum
   - Future product
5. Estimate what must happen for the stock to justify the current price.
6. Separate expected earnings growth from valuation-multiple expansion.
7. Test:
   - Meets expectations
   - Modest upside surprise
   - Major upside surprise
   - One-year roadmap delay
   - Three-year roadmap delay
   - Future product assigned zero value
8. Avoid false precision. Use ranges when inputs are uncertain.

### Human tasks

- Approve the peer group.
- Approve the base, bull, and bear assumptions.
- Override any unrealistic terminal growth or margin assumption.
- Decide whether the market is pricing:
  - Current business
  - Reasonable growth
  - Future moat
  - Moonshot
  - Narrative

### Required output

> At the current price, the market appears to assume **[growth]**, **[future margin or market share]**, and successful execution of **[future capability]**. The stock likely requires **[specific result]** to outperform rather than merely avoid falling.

### Completion gate

The output must state what the business must achieve for the current stock price to make sense.

---

## Module 4 — Capability and moat analysis

### Goal

Determine whether the company has a useful capability, an emerging moat, a proven moat, or an eroding moat.

### Definitions

- **Capability:** A useful asset, process, relationship, skill, resource, or system that allows a company to operate more effectively.
- **Moat:** A proven, perpetuating, and durable unit-economic advantage over competitors.
- **Moat trajectory:** Evidence that a capability is beginning to produce a defensible and strengthening economic advantage.

### Capability categories

The agent may identify one or more of the following:

- Demand-side scale
- Supply-side scale
- Purchasing power
- Manufacturing complexity
- Process speed
- Process efficiency
- Risk aggregation
- Brand
- Customer trust
- Installed base
- Switching costs
- System of record
- Proprietary data
- Data network effect
- User network effect
- Marketplace network effect
- Local network effect
- Platform dynamics
- Standards or protocol control
- Patents or intellectual property
- Regulatory protection
- Access to scarce resources
- Distribution reach
- Cost of capital advantage
- Organizational design
- Specialized talent or institutional knowledge

### Three moat tests

#### Test A — Proven

- Does the advantage appear in retention, margins, pricing, returns on capital, market share, or unit economics?
- Is it visible over multiple periods?
- Are customers behaving as if the advantage matters?
- Does the company outperform relevant competitors?
- Is there evidence beyond management language?

#### Test B — Perpetuating

- Does each new customer strengthen the company?
- Does scale lower cost?
- Does use generate valuable data?
- Does the installed base create recurring revenue?
- Do partners or developers make the system more useful?
- Does success make future customer acquisition easier?
- Do returns improve as the company grows?

#### Test C — Durable

- Can a well-funded competitor reproduce the advantage?
- How long would reproduction take?
- Can customers switch easily?
- Can technology make the advantage irrelevant?
- Does regulation protect or threaten it?
- Does the company control the scarce resource?
- Is the advantage strengthening, stable, or weakening?
- Can management damage it through poor pricing, quality, or customer treatment?

### Classification

Each claimed moat receives one status:

- Claim
- Capability
- Moat trajectory
- Proven moat
- Eroding moat
- No moat identified

### Required output

For each capability:

- Capability name
- Plain-language explanation
- Evidence
- Counterevidence
- Proven score
- Perpetuating score
- Durable score
- Confidence
- Current status
- What would upgrade the status
- What would downgrade the status

### Human tasks

- Approve or change the status.
- Select the one capability that matters most.
- Identify whether the stock price already assumes the capability will become a moat.

### Completion gate

No capability may be labeled a proven moat without measurable evidence and a direct comparison with competitors.

---

## Module 5 — Is the future already built into the price?

### Goal

Separate the value of today’s business from logical extensions and speculative future products.

### Required buckets

#### A. Current engine

What produces revenue, profit, and cash now?

Questions:

- Is it growing?
- Is it profitable?
- How durable is it?
- Could it support the current valuation by itself?
- Can it fund future projects without excessive debt or dilution?

#### B. Logical extension

What adjacent opportunity uses capabilities the company already has?

Questions:

- Are current customers asking for it?
- Does it use the same distribution, data, brand, manufacturing, or installed base?
- Does it improve or weaken margins?
- Is it commercially proven?
- Is the market already treating it as successful?

#### C. Moonshot

What future product or market has limited commercial proof?

Questions:

- What technical milestones remain?
- What regulatory milestones remain?
- What manufacturing capacity is required?
- How much capital is required?
- When could meaningful revenue begin?
- What probability of success appears embedded in the price?
- What is the stock worth if the project is delayed?
- What is the stock worth if the project fails?
- Is the same future capability being counted in more than one valuation narrative?

### Agent tasks

- Build a scenario tree.
- Estimate the portion of the thesis supported by the current engine.
- Identify the valuation dependence on logical extensions.
- Identify the valuation dependence on moonshots.
- Calculate a no-moonshot scenario.
- Label every probability as:
  - Market-implied
  - Management estimate
  - Analyst estimate
  - Human assumption
  - Agent inference

### Required output

> The current business supports **[low/moderate/most]** of the thesis. The logical extension contributes **[low/moderate/high]** dependence. The remaining upside depends on **[moonshot]**, which is **[unproven/partially proven/commercially validated]**.

### Human tasks

- Approve scenario probabilities.
- Decide whether the expected return depends too heavily on an unproven future.
- Identify which milestone would move a future product from moonshot to logical extension.

### Completion gate

The application must show what happens when the most exciting future project is assigned zero value.

---

## Module 6 — Unexpected growth and unexpected damage

### Goal

Identify events that could produce a result meaningfully different from what the market already expects.

### Agent tasks

Generate a candidate list of upside and downside developments, then rank them by:

- Probability
- Timing
- Financial impact
- Market awareness
- Leading-indicator quality
- Management control
- Reversibility

### Required fields for every catalyst or risk

- Event
- Direction
- Plain-language explanation
- Probability:
  - Low
  - Moderate
  - High
- Timing:
  - Current quarter
  - Next two quarters
  - One year
  - More than one year
  - Unknown
- Primary financial effect:
  - Revenue
  - Gross margin
  - Operating margin
  - Free cash flow
  - Balance sheet
  - Valuation multiple
- Estimated impact range
- Leading indicator
- Market awareness:
  - Widely expected
  - Partly expected
  - Underappreciated
- Company control:
  - High
  - Partial
  - Low
- Evidence
- Counterargument
- Confidence

### Upside candidate library

- New product adoption exceeds expectations
- Capacity constraint resolves
- Competitor fails or retreats
- Market-share gain
- Better pricing
- Higher-margin product mix
- Recurring revenue expands
- Regulatory approval
- Loss-making division reaches break-even
- Operating leverage
- Cross-selling improves
- Input, energy, or financing costs fall
- Buyback meaningfully reduces share count
- Ignored segment becomes valuable
- Acquisition outperforms
- Shortage lasts longer than expected
- Government contract becomes recurring
- New reimbursement or insurance coverage
- Customer concentration declines
- International expansion succeeds

### Downside candidate library

- Demand slows
- Pricing weakens
- Competitor gains share
- Customer concentration becomes harmful
- Critical supplier fails
- Inventory builds
- Capital spending rises without revenue
- Roadmap delay
- Regulation changes
- Reimbursement weakens
- Safety, quality, or warranty problem
- Debt refinancing becomes expensive
- Dilution accelerates
- Backlog is cancelled or delayed
- Working capital consumes cash
- Customer builds an internal alternative
- Technology becomes obsolete
- Management changes key metrics
- Adjusted earnings diverge from cash flow
- Product cannibalization
- Key employee or leadership loss

### Human tasks

- Select the three most important upside developments.
- Select the three most important downside developments.
- Remove low-impact noise.
- Mark which risk is most likely to be underestimated.

### Completion gate

The final list must contain no more than three primary upside surprises and three primary downside surprises.

---

## Module 7 — Fundamentals, catalyst, momentum, or “stock vibes”?

### Goal

Determine what is currently driving the share price and whether a deeper financial investigation is likely to produce a useful edge.

### Agent tasks

Evaluate:

1. Changes in revenue estimates
2. Changes in earnings estimates
3. Changes in free-cash-flow estimates
4. Valuation-multiple expansion or contraction
5. Company guidance changes
6. Operating-metric confirmation
7. Sector and thematic flows
8. Short interest and short covering
9. Option activity
10. Social and media attention
11. Relative performance
12. Insider buying or selling
13. Share issuance or buybacks
14. Evidence of customer demand
15. Evidence of product-market fit
16. Whether the stock chart is being used as the main proof of business quality

### Vibes warning signs

- The rising stock price is the main evidence of success.
- The thesis begins with a huge future market rather than customer economics.
- Future products receive more attention than current customers.
- Revenue or cash-flow estimates remain flat while valuation rises.
- Management repeatedly changes the metrics it highlights.
- Adjusted earnings improve while dilution, debt, or cash burn worsens.
- Nonbinding agreements are treated as guaranteed revenue.
- Backlog is discussed without timing, margins, or cancellation terms.
- Popularity is confused with customer captivity.
- Competitors are dismissed without evidence.
- A chart pattern is treated as proof of a moat.
- The next milestone is always several years away.

### Classification

Select one:

- Fundamentals-led investment
- Fundamentals plus momentum
- Catalyst trade
- Momentum trade
- Narrative speculation
- Credit improvement thesis
- No research edge
- Insufficient evidence

### Required output

- Primary price driver
- Secondary price driver
- Evidence supporting the classification
- Evidence against the classification
- Whether a financial deep dive is warranted
- The next piece of evidence needed

### Human tasks

- Confirm whether the user is comfortable owning a momentum-led position.
- Decide whether the company deserves a full financial model.
- State whether the thesis would survive a major change in market sentiment.

### Completion gate

The application must classify the current opportunity before moving into instrument selection.

---

## Module 8 — Financial deep dive

### Goal

Test whether the company’s story is supported by its financial statements and operating metrics.

### Universal questions

1. What drove revenue growth over three to five years?
2. Are gross margins improving?
3. Are operating margins improving?
4. Does operating income convert into cash?
5. How much capital expenditure is required?
6. What is the return on invested capital?
7. Is debt growing faster than operating cash flow?
8. When does debt mature?
9. Can the company comfortably cover interest?
10. Is the share count increasing?
11. How much stock-based compensation is issued?
12. Are acquisitions masking weak organic growth?
13. Is working capital consuming cash?
14. Which segment produces the profit?
15. Is management allocating capital well?
16. Are buybacks reducing shares or only offsetting compensation?
17. What happens in a recession or industry downturn?
18. What does the company look like in a realistic bear case?
19. Are reported earnings supported by free cash flow?
20. Are one-time benefits being treated as recurring?

### Dynamic financial modules

The agent must select one or more business-specific modules. The human may override the selection.

#### Advertising platform module

Track:

- Active users
- Engagement
- Advertising impressions
- Price per advertisement
- Advertiser count
- Advertiser concentration
- Conversion quality
- Measurement quality
- Capital expenditure
- Data-center depreciation
- Free cash flow after infrastructure spending
- Privacy and regulatory restrictions

#### Membership and subscription retail module

Track:

- Paid members
- Renewal rate
- Comparable sales
- Customer traffic
- Average transaction size
- Membership-fee revenue
- Executive or premium membership penetration
- New-location economics
- Inventory
- Shrink
- Gross margins
- Customer price perception

#### Pharmaceutical and biotechnology module

Track:

- Prescription or patient growth
- Market share
- Net realized price after rebates
- Reimbursement
- Manufacturing capacity
- Safety
- Tolerability
- Patent life
- Clinical-trial milestones
- Regulatory decisions
- Cash runway
- Dilution risk
- Product concentration
- Pipeline diversification
- Treatment discontinuation

#### Semiconductor and AI infrastructure module

Track:

- Unit demand
- Average selling price
- Gross margin
- Inventory
- Customer concentration
- Capacity commitments
- Customer capital spending
- Product-generation transitions
- Customer-designed alternatives
- Export restrictions
- Power availability
- Customer return on infrastructure spending

#### Industrial and infrastructure module

Track:

- Orders
- Book-to-bill ratio
- Backlog
- Cancellation provisions
- Backlog conversion
- Project margins
- Working capital
- Warranty costs
- Manufacturing capacity
- Service revenue
- Customer financing
- Input costs
- Project delays

#### Pre-revenue innovation module

Track:

- Cash
- Marketable securities
- Quarterly cash burn
- Cash runway
- Time to next milestone
- Capital needed to reach milestone
- Binding versus nonbinding agreements
- Technical milestones
- Regulatory milestones
- Manufacturing readiness
- Partner dependence
- Expected dilution
- Management timeline changes

#### Financial institution module

Track:

- Net interest income
- Net interest margin
- Deposit growth
- Deposit cost
- Loan growth
- Credit losses
- Nonperforming assets
- Capital ratios
- Liquidity
- Fee revenue
- Trading revenue
- Regulatory exposure
- Duration mismatch

#### Real-estate investment trust module

Track:

- Funds from operations
- Adjusted funds from operations
- Occupancy
- Same-property growth
- Lease duration
- Tenant concentration
- Development pipeline
- Debt maturity
- Interest cost
- Dividend coverage
- Net asset value
- Capitalization rate
- External financing need

#### Utility module

Track:

- Rate-base growth
- Allowed return on equity
- Regulatory decisions
- Capital expenditure
- Customer growth
- Power demand
- Fuel adjustment mechanisms
- Debt
- Interest coverage
- Project execution
- Storm and weather exposure
- Dividend coverage

#### Commodity producer module

Track:

- Production volume
- Realized selling price
- Unit production cost
- Reserve life
- Ore grade or resource quality
- Capital expenditure
- Hedging
- Geographic concentration
- Political risk
- Environmental liabilities
- Balance-sheet resilience
- Break-even commodity price

### Required output

- Three- to five-year financial summary
- Segment summary
- Cash-flow quality score
- Balance-sheet resilience score
- Dilution score
- Capital-intensity score
- Financial trend labels
- Base, bull, and bear financial cases
- Key unknowns
- Financial confidence level

### Human tasks

- Approve normalization adjustments.
- Reject aggressive “adjusted” metrics that do not reflect economic reality.
- Approve the financial module and peer set.
- Decide whether the financial evidence strengthens or weakens the thesis.

### Completion gate

The application must reconcile reported profit with cash flow and explain any major difference.

---

## Module 9 — Red-flag dashboard

### Goal

Predefine the measurable developments that require immediate attention or complete re-underwriting.

### Rules

- Every company receives three to five thesis-critical indicators.
- Thresholds must be set before the next major catalyst whenever possible.
- A red condition does not automatically mean “sell.”
- A red condition means the previous thesis may no longer be trusted.
- The application must distinguish one-quarter noise from structural deterioration.
- Red flags must attack the reason for owning the company, not simply reflect ordinary volatility.

### Required fields

- Metric or event
- Plain-language explanation
- Why it matters
- Current value
- Baseline
- Green threshold
- Yellow threshold
- Red threshold
- Measurement frequency
- Source
- Leading or lagging indicator
- Human-approved response:
  - Continue monitoring
  - Investigate
  - Pause new capital
  - Reduce exposure
  - Hedge
  - Re-underwrite
  - Exit under predefined rule
- Human approval date

### Example: Meta

Potential critical indicators:

- Advertising revenue growth
- Advertising pricing and impressions
- User engagement
- Capital expenditure relative to free cash flow
- Reality Labs losses
- Regulatory restrictions on targeting or measurement

The most dangerous combination is weakening advertising economics while infrastructure spending continues to rise.

### Example: Costco

Potential critical indicators:

- U.S. and Canada renewal rate
- Global renewal rate
- Paid-member growth
- Comparable traffic
- Membership-fee growth
- Price gap relative to competitors
- New-warehouse member acquisition

The key danger is sustained renewal weakness across core markets rather than a minor temporary fluctuation.

### Example: Eli Lilly

Potential critical indicators:

- Glucagon-like peptide-1 market share
- Prescription or patient growth
- Net realized price
- Reimbursement
- Manufacturing capacity
- Safety or tolerability
- Next-generation product delays
- Non-glucagon-like peptide-1 pipeline progress

The most dangerous combination is loss of current market share and delays in the future product roadmap.

### Agent tasks

- Propose thresholds based on history, guidance, peer data, and thesis sensitivity.
- Explain why each threshold matters.
- Identify whether the metric is leading or lagging.
- Alert the user when a threshold is crossed.
- Never change a human-approved threshold silently.

### Human tasks

- Approve the indicators.
- Approve the thresholds.
- Approve the planned response.
- Record any threshold change and the reason.

### Completion gate

At least one red flag must be capable of invalidating the thesis rather than merely causing temporary concern.

---

## Module 10 — Instrument and limited-risk structure

### Goal

Explore whether shares, an exchange-traded fund, options, or bonds can express the thesis while matching the user’s time horizon and risk limit.

### Guardrails

- This module is educational and analytical.
- The application must not imply that options are simply cheaper shares.
- Current option-chain or bond data must include a timestamp.
- Stale or illiquid instruments must be labeled.
- The full premium of a purchased option may be lost.
- A short option may create assignment obligations.
- A corporate bond provides credit exposure, not unlimited equity upside.
- A convertible bond may combine credit and equity sensitivity, but conversion terms and call provisions matter.
- “No instrument is attractive” is a valid conclusion.

### Required human inputs

- Maximum capital at risk
- Maximum acceptable loss
- Desired holding period
- Desired upside exposure
- Need for income
- Existing share position
- Brokerage permissions
- Willingness to accept assignment
- Liquidity requirements
- Tax considerations, if supplied by the user
- Whether capped upside is acceptable

### Instruments to evaluate

#### Shares

Use when:

- The thesis is long term.
- Timing is uncertain.
- The user wants indefinite holding time.
- The position can be sized small enough to tolerate volatility.

#### Sector or thematic exchange-traded fund

Use when:

- The industry thesis is stronger than the single-company thesis.
- Company-specific execution risk is high.
- The user wants diversified exposure.

#### Long call

Use when:

- Timing is reasonably defined.
- Upside may be large.
- The user accepts complete premium loss.
- Implied volatility is not prohibitively expensive.

#### Bull call spread

Use when:

- The thesis has a realistic price target.
- The user wants to reduce premium cost.
- Capped upside is acceptable.

#### Collar

Use when:

- The user already owns shares.
- Downside protection matters.
- The user accepts capped upside.

#### Cash-secured put

Use when:

- The user genuinely wants to own shares at the effective purchase price.
- The user has sufficient cash for assignment.
- The user understands that capital efficiency may be limited.

#### Corporate bond

Use when:

- Credit quality may improve.
- Contractual income is more important than unlimited equity upside.
- The user understands interest-rate, credit, liquidity, and call risk.

#### Convertible bond

Use when:

- The user wants debt characteristics with possible equity participation.
- The conversion price, conversion ratio, maturity, seniority, call provision, and liquidity are understood.

### Agent calculations for options

- Underlying price
- Expiration
- Days to expiration
- Strike
- Premium
- Contract multiplier
- Maximum loss
- Maximum profit
- Break-even
- Delta
- Gamma
- Theta
- Vega
- Implied volatility
- Implied move
- Bid-ask spread
- Open interest
- Trading volume
- Early-assignment risk
- Event dates before expiration
- Scenario value at multiple stock prices and dates

### Agent calculations for bonds

- Price
- Face value
- Coupon
- Maturity
- Yield to maturity
- Yield to worst
- Current yield
- Duration
- Credit rating
- Credit spread
- Seniority
- Call provisions
- Conversion terms, when applicable
- Liquidity
- Recovery considerations
- Debt maturity context
- Interest coverage
- Scenario under:
  - Credit improvement
  - Credit deterioration
  - Falling rates
  - Rising rates
  - Equity upside for a convertible

### Required output

- Two or three structures to investigate
- One “no position” comparison
- Maximum capital at risk
- Maximum loss
- Break-even
- Required timing
- Primary failure mode
- Liquidity warning
- Data timestamp
- Human decision field

### Human tasks

- Confirm the position fits the maximum loss.
- Confirm the expiration allows enough time.
- Confirm the user would accept assignment where relevant.
- Decide whether the instrument adds complexity without improving the thesis.
- Approve or reject each candidate structure.

### Completion gate

No option or bond structure may be labeled suitable without current data, a defined maximum loss, and a time-horizon match.

---

## Module 11 — Technical timing

### Goal

Use price behavior to help with entry, exit, and risk placement after the fundamental thesis is understood.

### Agent tasks

Evaluate:

- Long-term trend
- Intermediate trend
- Relative strength versus sector
- Relative strength versus broad market
- Trading volume
- Earnings gaps
- Prior high-volume price areas
- Distance from major moving averages
- Implied move
- Implied volatility
- Volatility skew
- Open interest
- Short interest
- Crowding
- Potential support and resistance
- Proposed invalidation level

### Rules

- Technical analysis may help answer when to enter.
- Technical analysis may not establish a moat.
- A rising chart may not be used as proof of financial quality.
- The agent must distinguish a fundamental thesis-breaker from a trading stop.
- Any support, resistance, or trend interpretation must be labeled as probabilistic.

### Required output

- Trend classification
- Relative-strength classification
- Momentum confirmation or contradiction
- Entry zones
- Invalidation zone
- Expected volatility
- Event risk
- Position-size implication

### Human tasks

- Set the actual entry and invalidation level.
- Confirm whether the position is an investment or trade.
- Decide whether technical weakness changes timing or the underlying thesis.

### Completion gate

The user must be able to distinguish the price level that invalidates the trade from the evidence that invalidates the company thesis.

---

## Module 12 — One-page decision card

### Goal

Compress the entire research process into a consistent, reviewable decision record.

### Required fields

**Company:**  
**Ticker:**  
**Exchange:**  
**Analysis date and time:**  
**Current price timestamp:**  
**Investment horizon:**  
**Research objective:**  
**Company type:**  

**Kid-level explanation:**  
Five sentences or fewer.

**Actual economic engine:**  
The product, customer, and transaction producing most of the economics.

**Why the stock has this valuation:**  
The growth, margin, market-share, and future-product assumptions embedded in the price.

**Capability and moat status:**  
Claim, capability, moat trajectory, proven moat, eroding moat, or no moat identified.

**What is already priced in:**  
Current engine, logical extension, and moonshot.

**Most underappreciated upside:**  
One measurable development.

**Most dangerous downside:**  
One measurable development.

**Primary thesis-breaker:**  
One event or threshold requiring immediate re-underwriting.

**Fundamentals or vibes:**  
Fundamentals-led, fundamentals plus momentum, catalyst trade, momentum trade, narrative speculation, credit thesis, no research edge, or insufficient evidence.

**Financial module used:**  
Selected business-specific module.

**Instrument to investigate:**  
Shares, exchange-traded fund, option structure, corporate bond, convertible bond, or no position.

**Maximum modeled loss:**  
Amount and percentage.

**Next proof point:**  
The next earnings metric, operational milestone, regulatory event, or technical milestone.

**Verdict:**  
Deep dive, watch for proof, long-term watchlist, trade only, good company but unattractive price, weak company but asymmetric trade, insufficient evidence, pass, or no position.

**Confidence:**  
High, medium, or low.

**Known unknowns:**  
The most important missing evidence.

### Required abbreviated prospectuses

#### Blunt negative prospectus

Explain why the company may be a poor business, an overvalued stock, or an unattractive risk.

#### Blunt positive prospectus

Explain why customers may continue paying, why competitors may struggle to replace the company, and why the market opportunity may be larger or more durable than the negative case assumes.

### Human tasks

- Edit both prospectuses.
- Approve the final verdict.
- State what evidence would reverse the verdict.
- Lock the research snapshot.

---

## Module 13 — Monitoring and re-underwriting

### Goal

Keep the thesis current and make changes visible.

### Agent tasks

Monitor:

- Earnings releases
- Annual and quarterly filings
- Guidance changes
- Investor presentations
- Product milestones
- Regulatory decisions
- Clinical-trial results
- Customer announcements
- Debt issuance and maturity changes
- Share issuance and buybacks
- Insider transactions
- Red-flag thresholds
- Option expiration
- Bond call or maturity dates
- Material price movement
- New competitor evidence

### Staleness rules

A module becomes stale when:

- A new quarterly or annual filing is released.
- Guidance changes materially.
- A major catalyst occurs.
- A red-flag threshold is crossed.
- A key valuation input changes beyond a human-approved range.
- Option-chain or bond data exceed the allowed freshness window.
- A major acquisition, divestiture, financing, or regulatory event occurs.
- The user changes the holding period or risk budget.

### Required output

- What changed
- Why it matters
- Which modules are stale
- Which assumptions are affected
- Whether the thesis is stronger, weaker, or unchanged
- Whether a human review is required
- New source links
- Version comparison

### Human tasks

- Review material changes.
- Approve threshold changes.
- Reconfirm or change the verdict.
- Record why the conclusion changed.

---

# 7. Human approval gates

## Gate H0 — Scope approval

Required before research begins:

- Correct security
- Objective
- Time horizon
- Risk limit

## Gate H1 — Business understanding approval

Required before valuation:

- Kid-level explanation
- Economic-engine sentence
- Current versus future product distinction

## Gate H2 — Valuation assumption approval

Required before scenario conclusions:

- Peer group
- Growth range
- Margin range
- Share-count assumptions
- Capital needs
- Terminal assumptions

## Gate H3 — Moat and future-value approval

Required before final grading:

- Capability classification
- Moat status
- Current engine
- Logical extension
- Moonshot dependence

## Gate H4 — Risk approval

Required before instrument research:

- Three primary downside risks
- Red-flag metrics
- Green, yellow, and red thresholds
- Planned response

## Gate H5 — Instrument and verdict approval

Required before locking the decision card:

- Maximum loss
- Time horizon
- Instrument complexity
- Liquidity
- Final verdict
- Reversal evidence

---

# 8. Tooltip and glossary system

## 8.1 Non-negotiable tooltip rule

Every term that may require financial, accounting, investing, options, bond, market, or strategy knowledge must connect to a tooltip.

A tooltip is required when:

- The term is an acronym.
- The term has a specialized financial meaning.
- The term is easily misunderstood.
- The term uses a formula.
- The term changes meaning by company type.
- The term is central to a decision.
- The agent introduces a new technical phrase.
- A child-friendly reader may not understand the label.

A tooltip is usually not required for ordinary words such as “customer,” “price,” “product,” or “employee” unless the term has a specialized meaning in context.

## 8.2 Tooltip content template

Each tooltip should contain:

1. **Plain definition:** One or two sentences.
2. **Why it matters:** One sentence connecting the term to the analysis.
3. **Common mistake:** Optional one-sentence warning.
4. **Formula:** Optional and hidden behind an expand control.
5. **Example:** Optional and company-specific.
6. **Source:** Required for regulated, legal, or methodology-specific definitions.

Default tooltip length: 20 to 60 words.

Tooltips should not become miniature essays. A “Learn more” link may open the full glossary entry.

## 8.3 Reading modes

### Kids mode

- Simplest definition
- Concrete analogy
- No formula unless requested
- Acronyms expanded automatically

### Standard mode

- Plain definition
- Why it matters
- Common mistake

### Analyst mode

- Precise definition
- Formula
- Input source
- Calculation method
- Limitations

## 8.4 Interaction requirements

Tooltips must work with:

- Mouse hover
- Keyboard focus
- Touch or tap
- Screen readers

Implementation requirements:

- Use a visible information icon or dotted underline.
- Add an accessible label.
- Support `aria-describedby`.
- Keep the tooltip open while keyboard focus remains inside.
- Allow Escape to close.
- Do not rely on color alone.
- Do not place essential information only inside a tooltip.
- Avoid nested tooltips.
- Show only one tooltip at a time on mobile.
- Provide a glossary drawer for all terms on the page.
- Allow the user to pin a tooltip.
- Preserve tooltip availability in exported HTML.
- For PDF or Markdown export, convert the first use of a term into a footnote or glossary link.

## 8.5 Agent-generated term policy

When the agent introduces a term that is not in the glossary:

1. The system checks aliases and abbreviations.
2. If no match exists, the agent must create a draft glossary entry.
3. The entry receives **Needs verification** status.
4. The term may appear with the draft tooltip but must be visibly marked as unverified.
5. A human or glossary-review process approves the entry.
6. Approved aliases are added so future mentions resolve correctly.

The agent may not introduce an unexplained acronym.

## 8.6 Glossary data model

```ts
type GlossaryTerm = {
  id: string;
  term: string;
  aliases: string[];
  category:
    | "company"
    | "accounting"
    | "valuation"
    | "moat"
    | "risk"
    | "technical"
    | "options"
    | "bonds"
    | "market-structure"
    | "biotechnology"
    | "industry-specific";
  kidsDefinition: string;
  standardDefinition: string;
  analystDefinition?: string;
  whyItMatters: string;
  commonMistake?: string;
  formula?: string;
  example?: string;
  sourceUrl?: string;
  status: "draft" | "verified" | "retired";
  reviewedAt?: string;
};
```

---

# 9. Seed glossary

This is a minimum starting registry. The system must expand it as new industries and instruments are added.

## Company and accounting terms

| Term | Default tooltip |
|---|---|
| Revenue | Money the company receives from selling products or services before most expenses are subtracted. Revenue growth is useful only when the sales can eventually produce profit and cash. |
| Gross profit | Revenue minus the direct cost of producing the product or service. It shows how much money remains to pay operating expenses. |
| Gross margin | Gross profit divided by revenue. It shows how much of each sales dollar remains after direct production costs. |
| Operating income | Profit from the company’s core operations after operating expenses but before interest and taxes. |
| Operating margin | Operating income divided by revenue. It shows how efficiently the core business converts sales into operating profit. |
| Net income | Profit remaining after operating expenses, interest, taxes, and other gains or losses. It may differ significantly from cash generated. |
| Earnings per share | Net income allocated to each diluted share. It can rise because profit grows or because the share count falls. |
| Free cash flow | Cash generated by operations after capital spending. It approximates the cash available for debt repayment, buybacks, dividends, acquisitions, or reinvestment. |
| Capital expenditure | Money spent on long-lived assets such as factories, data centers, equipment, or property. High capital spending can support growth but consumes cash today. |
| Working capital | Short-term operating assets minus short-term operating liabilities. Changes in inventory, receivables, and payables can create or consume cash. |
| Stock-based compensation | Shares or share-linked awards used to pay employees. It is a real economic cost because it can dilute existing shareholders. |
| Dilution | A reduction in an existing shareholder’s ownership percentage caused by the issuance of additional shares. |
| Cash burn | The amount of cash a company consumes during a period. It is especially important for unprofitable or pre-revenue companies. |
| Cash runway | The estimated time before a company may need more capital, based on current cash and expected cash burn. |
| Return on invested capital | A measure of how effectively the company converts invested capital into operating profit. It helps test whether growth creates value. |
| Customer concentration | The percentage of revenue dependent on a small number of customers. High concentration can create negotiating and cancellation risk. |
| Recurring revenue | Revenue that is expected to repeat through subscriptions, contracts, usage, service, or consumables. It may be more predictable than one-time sales. |
| Backlog | Contracted or expected future work not yet recognized as revenue. Backlog is not the same as cash and may include cancellation or timing risk. |
| Book-to-bill ratio | New orders divided by recognized revenue during the same period. A ratio above one may suggest demand is growing, but order quality still matters. |
| Unit economics | The revenue, cost, and profit associated with one customer, product, transaction, or unit. |
| Customer acquisition cost | The average sales and marketing cost required to acquire a new customer. |
| Lifetime value | The estimated economic value a customer generates over the full relationship. It depends heavily on retention and margin assumptions. |
| Willingness to pay | The maximum amount a customer is prepared to pay for a product or service. Strong willingness to pay may support pricing power. |

## Strategy and moat terms

| Term | Default tooltip |
|---|---|
| Capability | A useful asset, process, relationship, skill, or system that helps a company operate more effectively. A capability is not automatically a moat. |
| Moat | A proven, self-reinforcing, and durable economic advantage over competitors. It should appear in measurable outcomes such as retention, margins, pricing, or returns on capital. |
| Moat trajectory | Evidence that a capability is beginning to create a strengthening and defensible economic advantage. |
| Network effect | A product becomes more valuable as more users, customers, suppliers, or developers join it. Not every growing user base creates a real network effect. |
| Switching cost | The money, time, risk, training, or disruption a customer faces when changing providers. |
| Economy of scale | A cost or distribution advantage created as the company becomes larger. Scale is useful only when the advantage persists rather than creating equal complexity. |
| System of record | The main system where an organization stores or manages critical information. Replacing it can be costly and disruptive. |
| Intellectual property | Legally protected inventions, designs, software, data, or creative work. Protection strength and commercial usefulness vary. |
| Pricing power | The ability to raise prices without losing an unacceptable amount of demand. |
| Customer captivity | Conditions that make customers likely to remain, such as habit, trust, switching costs, network effects, or integration. |
| Resource captivity | Control over a scarce asset, process, license, patent, supply relationship, or cost structure that competitors cannot easily reproduce. |
| Current engine | The business that produces revenue, profit, or cash today. |
| Logical extension | A new product or market that uses capabilities the company already possesses. |
| Moonshot | A potentially large future product or market with substantial technical, regulatory, commercial, or financing uncertainty. |
| Priced in | An expectation already reflected in the current stock price. Good news may not raise the stock if investors already expected it. |
| Thesis | The specific reason an investment or trade is expected to work. |
| Thesis-breaker | Evidence that attacks the main reason for owning the security and requires the thesis to be rebuilt. |
| Catalyst | An event that may cause investors to change their expectations, such as earnings, approval, launch, contract, or financing. |
| Leading indicator | A measure that may change before the final financial result becomes visible. |
| Lagging indicator | A measure that confirms something after much of the underlying change has already occurred. |

## Valuation terms

| Term | Default tooltip |
|---|---|
| Market capitalization | Share price multiplied by diluted shares outstanding. It estimates the market value of the company’s equity. |
| Enterprise value | Market capitalization plus debt and other claims, minus cash. It approximates the value of the entire operating business. |
| Price-to-earnings ratio | Share price divided by earnings per share. It shows how much investors pay for each dollar of current or expected earnings. |
| Enterprise-value-to-sales | Enterprise value divided by revenue. It is often used for businesses with limited current profit, but it ignores cost structure. |
| Enterprise-value-to-EBITDA | Enterprise value divided by earnings before interest, taxes, depreciation, and amortization. It can help compare operations but may understate capital needs. |
| Free-cash-flow yield | Free cash flow divided by market value. It shows the cash generated relative to the price investors are paying. |
| Price-to-book ratio | Market value divided by accounting book value. It is more useful for some banks, insurers, and asset-heavy companies than for most software companies. |
| Discounted cash flow | A valuation method that estimates today’s value of future cash flows after adjusting for time and risk. Small assumption changes can create large valuation changes. |
| Reverse discounted cash flow | A valuation method that starts with the current stock price and estimates what future growth and margins are required to justify it. |
| Terminal value | The estimated value of cash flows beyond the explicit forecast period. It often represents a large portion of a discounted-cash-flow valuation. |
| Multiple expansion | A stock rises because investors are willing to pay more for each dollar of earnings, sales, or cash flow, not only because fundamentals improved. |
| Margin of safety | The difference between estimated value and purchase price intended to protect against mistakes or unexpected events. |
| Sum-of-the-parts | A valuation that estimates each business segment separately and then combines them. |
| Net asset value | The estimated value of assets minus liabilities. It is commonly used for real estate, investment companies, and asset-heavy businesses. |

## Risk and market terms

| Term | Default tooltip |
|---|---|
| Volatility | The amount and speed of price movement. High volatility can create opportunity but also increases the chance of large losses. |
| Implied volatility | The level of future price movement reflected in option prices. It affects option premiums and may differ from what actually occurs. |
| Realized volatility | The price movement that actually occurred over a past period. |
| Relative strength | A comparison of one security’s performance with another security, sector, or index. |
| Short interest | Shares sold short but not yet repurchased. High short interest can create squeeze potential but may also signal serious skepticism. |
| Liquidity | How easily a security can be bought or sold without causing a large price change. |
| Bid-ask spread | The difference between the highest current bid and lowest current asking price. A wide spread increases trading cost. |
| Guidance | Management’s forecast or expected range for future business results. Guidance is an estimate, not a guarantee. |
| Consensus estimate | The aggregated forecast of analysts covering a company. The stock may react to the difference between results and consensus rather than to absolute growth. |
| Scenario analysis | Testing how results change under different assumptions rather than relying on one forecast. |
| Invalidation level | A price or evidence threshold that makes the proposed trade setup no longer attractive. It is not always the same as a thesis-breaker. |

## Options terms

| Term | Default tooltip |
|---|---|
| Call option | A contract giving the buyer the right, but not the obligation, to buy the underlying security at a set strike price before or at expiration. |
| Put option | A contract giving the buyer the right, but not the obligation, to sell the underlying security at a set strike price before or at expiration. |
| Strike price | The price at which the option holder may buy or sell the underlying security. |
| Expiration | The date after which an option no longer exists. A correct thesis can still lose money if it occurs after expiration. |
| Premium | The price paid or received for an option. A purchased option can lose the full premium. |
| Break-even | The underlying price at expiration where the option structure produces neither profit nor loss, excluding fees and taxes. |
| Delta | An estimate of how much an option’s price may change for a one-dollar move in the underlying security, all else equal. |
| Gamma | An estimate of how quickly an option’s delta changes as the underlying price moves. |
| Theta | An estimate of how much option value may decline as time passes, all else equal. |
| Vega | An estimate of how much an option’s price may change when implied volatility changes. |
| Open interest | The number of option contracts that remain open. It can help indicate liquidity but does not guarantee it. |
| Assignment | The obligation created when an option seller is required to buy or sell the underlying security under the contract terms. |
| Exercise | The option holder’s use of the contractual right to buy or sell the underlying security. |
| Bull call spread | Buying a call and selling a higher-strike call with the same expiration. It lowers cost but caps maximum upside. |
| Collar | Holding shares, buying a protective put, and selling a call. It limits downside and usually caps upside. |
| Cash-secured put | Selling a put while reserving enough cash to buy the shares if assigned. It is appropriate only when the user genuinely wants the shares. |
| Implied move | The approximate price movement suggested by option prices over a specified period. It is not a prediction or guaranteed range. |

## Bond terms

| Term | Default tooltip |
|---|---|
| Corporate bond | A loan made by investors to a company. The company promises interest payments and repayment of principal, subject to credit risk. |
| Face value | The amount the bond issuer generally promises to repay at maturity. |
| Coupon | The contractual interest payment stated as a percentage of face value. |
| Current yield | Annual coupon income divided by the bond’s current market price. It does not include gains or losses at maturity. |
| Yield to maturity | The estimated annual return if the bond is held to maturity and payments occur as promised. |
| Yield to worst | The lowest estimated yield among permitted repayment scenarios, such as an early call or maturity. |
| Duration | A measure of how sensitive a bond’s price may be to changes in interest rates. |
| Credit spread | The extra yield a corporate bond offers over a lower-risk benchmark to compensate for credit and liquidity risk. |
| Seniority | The bond’s priority for payment relative to other obligations if the company experiences financial distress. |
| Callable bond | A bond the issuer may repay before maturity under specified terms. An early call can limit the investor’s upside. |
| Convertible bond | A bond that may convert into company shares under specified terms. It combines credit risk with possible equity participation. |
| Default | Failure to make a required payment or satisfy another material debt obligation. |

---

# 10. Agent orchestration

The application should use one orchestrator and specialized workers. The implementation may use separate model calls or one model with strict task boundaries.

## 10.1 Orchestrator

Responsibilities:

- Create the task graph.
- Enforce module order and human gates.
- Route work to specialized agents.
- Merge results.
- Detect conflicts.
- Prevent unsupported claims from entering verified output.
- Mark stale modules.
- Produce the final decision card.

## 10.2 Source and evidence agent

Responsibilities:

- Find primary documents.
- Extract relevant sections.
- Record publication and reporting dates.
- Build claim-to-source links.
- Flag conflicting values.
- Distinguish current, historical, and estimated figures.

Must return:

```json
{
  "claims": [],
  "sources": [],
  "conflicts": [],
  "missingEvidence": [],
  "freshness": {}
}
```

## 10.3 Plain-language explanation agent

Responsibilities:

- Draft Kids, Standard, and Analyst explanations.
- Remove promotional wording.
- Identify jargon.
- Request or create glossary entries.
- Produce positive and negative abbreviated prospectuses.

## 10.4 Business-model agent

Responsibilities:

- Identify customer, product, payment event, cost structure, recurring revenue, concentration, and economic engine.
- Separate current engine from public narrative.

## 10.5 Valuation agent

Responsibilities:

- Select appropriate valuation methods.
- Build historical and peer comparisons.
- Perform scenario and reverse-valuation analysis.
- Show formulas, assumptions, and uncertainty.
- Never use one valuation method for every company type.

## 10.6 Capability and moat agent

Responsibilities:

- Identify capabilities.
- Apply the proven, perpetuating, and durable tests.
- Locate measurable evidence and counterevidence.
- Classify the moat status.
- Identify what the stock price appears to assume.

## 10.7 Catalyst and risk agent

Responsibilities:

- Generate upside and downside candidates.
- Rank by probability, timing, impact, awareness, and controllability.
- Propose leading indicators.
- Propose red-flag thresholds for human approval.

## 10.8 Financial analysis agent

Responsibilities:

- Select the appropriate company module.
- Normalize financial statements.
- Reconcile earnings and cash flow.
- Identify dilution, debt, working-capital, and capital-allocation issues.
- Build base, bull, and bear cases.

## 10.9 Instrument agent

Responsibilities:

- Analyze shares, funds, options, and bonds only when allowed.
- Validate data freshness.
- Calculate maximum loss, break-even, return profile, Greeks, yield, duration, and liquidity.
- Produce structures to investigate rather than an automatic trade command.
- Include “no position” in every comparison set.

## 10.10 Technical timing agent

Responsibilities:

- Evaluate trend, relative strength, volume, volatility, and potential invalidation.
- Keep technical interpretation separate from fundamental evidence.

## 10.11 Monitoring agent

Responsibilities:

- Watch approved metrics and catalysts.
- Mark stale research.
- Compare new evidence with prior assumptions.
- Trigger human review when thresholds are crossed.

## 10.12 Synthesis agent

Responsibilities:

- Produce the one-page decision card.
- Preserve uncertainty and dissent.
- Never average conflicting category grades into one misleading score.
- Show the strongest positive case, strongest negative case, and most important unknown.

---

# 11. Evidence and source policy

## 11.1 Source priority

Use sources in this order whenever available:

1. Securities regulator filings
2. Company investor-relations filings and earnings materials
3. Government or industry regulator data
4. Exchange or official market data
5. Credit documents and prospectuses
6. Peer-company filings
7. Reputable industry research
8. Analyst estimates
9. News reporting
10. Social, forum, or promotional content

Lower-priority sources may provide leads but may not override higher-quality primary evidence without a documented reason.

## 11.2 Claim types

Every claim must be labeled:

- **Reported fact**
- **Management guidance**
- **Consensus estimate**
- **Human assumption**
- **Agent inference**
- **Unverified claim**

## 11.3 Evidence confidence

Use:

- **High:** Direct primary source and internally consistent.
- **Medium:** Reliable secondary source, estimate, or minor unresolved ambiguity.
- **Low:** Inference, incomplete data, nonbinding agreement, promotional language, or unresolved conflict.

## 11.4 Calculation policy

- Show formulas.
- Show source values.
- Show dates.
- Use diluted share count when appropriate.
- Reconcile fiscal and calendar periods.
- Identify currency conversion.
- Avoid mixing generally accepted accounting principles and adjusted figures without labeling.
- Avoid false precision.
- Use ranges for uncertain assumptions.
- Preserve a calculation audit trail.

## 11.5 Freshness policy

Suggested defaults:

- Share price: stale after 15 minutes during market hours
- Option chain: stale after 15 minutes during market hours
- Bond quote: stale according to vendor timestamp; clearly label when indicative
- Analyst estimates: stale after earnings or guidance change
- Financial statements: stale when a newer filing is available
- Technical indicators: stale after the next market session
- Company overview: review after a major acquisition, divestiture, or strategic change
- Moat analysis: review after material customer, competitor, regulatory, or margin evidence

The user may change these defaults.

---

# 12. Grading framework

Do not generate a single composite score by default.

Grade each category separately:

| Category | Grade |
|---|---|
| Business clarity | A–F |
| Financial quality | A–F |
| Capability evidence | A–F |
| Moat durability | A–F |
| Valuation support | A–F |
| Upside surprise potential | A–F |
| Downside visibility | A–F |
| Management credibility | A–F |
| Instrument suitability | A–F |
| Evidence confidence | High / Medium / Low |

Then assign direct labels:

- **Business:** Strong, mixed, or weak
- **Moat:** Claimed, capability, emerging, proven, eroding, or absent
- **Price:** Cheap, reasonable, full, or fantasy
- **Driver:** Fundamental, hybrid, catalyst, momentum, narrative, or credit
- **Action:** Deep dive, watch, trade, pass, or no position

Every grade must include:

- Evidence
- Counterevidence
- Confidence
- What would upgrade it
- What would downgrade it

---

# 13. Data model

The implementation may adapt the schema, but these entities are required.

```ts
type Company = {
  id: string;
  legalName: string;
  ticker: string;
  exchange: string;
  currency: string;
  sector?: string;
  industry?: string;
  companyType: string[];
};

type ResearchRun = {
  id: string;
  companyId: string;
  createdAt: string;
  asOf: string;
  objective: string;
  horizon: string;
  status: string;
  currentModule: string;
  dataFreshness: "current" | "partially-stale" | "stale";
  verdict?: string;
  confidence?: "high" | "medium" | "low";
};

type Source = {
  id: string;
  title: string;
  publisher: string;
  url?: string;
  documentType: string;
  publicationDate?: string;
  reportingPeriod?: string;
  retrievedAt: string;
  sourcePriority: number;
};

type Claim = {
  id: string;
  researchRunId: string;
  text: string;
  claimType:
    | "reported-fact"
    | "management-guidance"
    | "consensus-estimate"
    | "human-assumption"
    | "agent-inference"
    | "unverified";
  sourceIds: string[];
  confidence: "high" | "medium" | "low";
  status: "draft" | "verified" | "disputed" | "retired";
};

type Metric = {
  id: string;
  name: string;
  value: number | string;
  unit?: string;
  period?: string;
  sourceIds: string[];
  formula?: string;
  inputs?: Record<string, number | string>;
  freshness?: string;
  glossaryTermId?: string;
};

type Assumption = {
  id: string;
  name: string;
  value: number | string;
  range?: [number, number];
  owner: "human" | "agent" | "market-implied" | "management" | "consensus";
  approvedByHuman: boolean;
  changedAt: string;
  changeReason?: string;
};

type CapabilityAssessment = {
  id: string;
  capability: string;
  plainExplanation: string;
  evidenceClaimIds: string[];
  counterEvidenceClaimIds: string[];
  provenScore: number;
  perpetuatingScore: number;
  durableScore: number;
  status:
    | "claim"
    | "capability"
    | "moat-trajectory"
    | "proven-moat"
    | "eroding-moat"
    | "no-moat";
  confidence: "high" | "medium" | "low";
  humanApproved: boolean;
};

type Catalyst = {
  id: string;
  direction: "upside" | "downside";
  event: string;
  explanation: string;
  probability: "low" | "moderate" | "high";
  timing: string;
  financialEffect: string[];
  impactRange?: string;
  leadingIndicator?: string;
  marketAwareness: "widely-expected" | "partly-expected" | "underappreciated";
  companyControl: "high" | "partial" | "low";
  confidence: "high" | "medium" | "low";
};

type RedFlag = {
  id: string;
  metricName: string;
  explanation: string;
  thesisConnection: string;
  currentValue?: string;
  baseline?: string;
  greenThreshold: string;
  yellowThreshold: string;
  redThreshold: string;
  frequency: string;
  plannedResponse: string;
  humanApproved: boolean;
  approvedAt?: string;
};

type InstrumentScenario = {
  id: string;
  instrumentType:
    | "shares"
    | "etf"
    | "long-call"
    | "bull-call-spread"
    | "collar"
    | "cash-secured-put"
    | "corporate-bond"
    | "convertible-bond"
    | "no-position";
  dataAsOf: string;
  capitalRequired: number;
  maximumLoss?: number;
  maximumProfit?: number | string;
  breakEven?: number | string;
  timeRequirement?: string;
  liquidityStatus?: string;
  keyFailureMode: string;
  assumptions: string[];
  humanDecision?: "approve" | "reject" | "watch";
};

type DecisionCard = {
  id: string;
  researchRunId: string;
  kidExplanation: string;
  economicEngine: string;
  valuationExpectations: string;
  moatStatus: string;
  pricedInSummary: string;
  topUpside: string;
  topDownside: string;
  thesisBreaker: string;
  driverClassification: string;
  instrumentToInvestigate: string;
  nextProofPoint: string;
  verdict: string;
  confidence: string;
  knownUnknowns: string[];
  negativeProspectus: string;
  positiveProspectus: string;
};
```

---

# 14. User interface

## 14.1 Home dashboard

Show:

- Companies in progress
- Companies needing human input
- Stale research
- Red-flag alerts
- Upcoming catalysts
- Option expirations
- Bond maturity or call dates
- Recently completed decision cards
- Watchlist changes

## 14.2 Company workspace

Recommended tabs:

1. Overview
2. Economic engine
3. Price expectations
4. Capabilities and moat
5. Future priced in
6. Catalysts and threats
7. Financials
8. Red flags
9. Instruments
10. Technical timing
11. Decision card
12. Sources and audit trail

## 14.3 Persistent side panel

Include:

- Agent task queue
- Human approvals
- Open questions
- Source drawer
- Glossary drawer
- Current reading mode
- Data freshness
- Confidence
- Research status

## 14.4 Evidence interaction

Every factual paragraph must support:

- “Show sources”
- “Show calculation”
- “Why the agent thinks this”
- “Show counterargument”
- “Mark incorrect”
- “Add human note”
- “Request deeper research”

## 14.5 Comparison view

Allow comparison of up to five companies across:

- Kid-level business model
- Economic engine
- Moat status
- Valuation expectations
- Current versus future dependence
- Financial quality
- Red flags
- Fundamental versus momentum classification
- Instrument suitability
- Confidence

Do not compare incompatible valuation metrics without a warning.

## 14.6 Reading modes

- **Kids:** Plain language, analogies, minimal metrics
- **Standard:** Core analysis and tooltips
- **Analyst:** Full financial statements, formulas, scenarios, sources, and audit trail

---

# 15. Agent response contract

Every agent response must include:

```json
{
  "summary": "",
  "plainLanguageSummary": "",
  "facts": [],
  "inferences": [],
  "assumptions": [],
  "unknowns": [],
  "conflicts": [],
  "sources": [],
  "glossaryTermsUsed": [],
  "confidence": "high | medium | low",
  "requiresHumanInput": false,
  "humanQuestions": [],
  "nextRecommendedTask": ""
}
```

Additional rules:

- Facts without sources remain drafts.
- Inferences must cite the supporting facts.
- Assumptions must identify their owner.
- Unknowns must not be silently converted into assumptions.
- Conflicting evidence must be shown rather than averaged away.
- Every generated technical term must map to the glossary.
- The agent must not hide a weak confidence rating inside polished prose.

---

# 16. Error handling and safety rules

The system must stop or downgrade confidence when:

- The ticker maps to multiple securities.
- The company recently changed its reporting structure.
- The latest filing is unavailable.
- Market data are stale.
- Option liquidity is insufficient.
- Bond pricing is only indicative.
- Financial periods are inconsistent.
- Share count cannot be reconciled.
- A metric uses an adjusted definition that changed over time.
- The source is promotional or nonbinding.
- A clinical, legal, regulatory, or credit claim lacks primary evidence.
- A valuation requires implausible assumptions.
- A company is pre-revenue and the user treats backlog or agreements as recognized revenue.
- The maximum loss cannot be calculated.
- The user’s time horizon does not match the instrument.

The application should say exactly what failed and which conclusion is affected.

---

# 17. Minimum viable product

## Phase 1 — Understand the company

Build:

- Company intake
- Source collection
- Kid-level overview
- Economic engine
- Positive and negative abbreviated prospectuses
- Tooltip and glossary system
- Human approval gates
- Markdown and JSON export

## Phase 2 — Price and moat

Add:

- Valuation comparison
- Reverse valuation
- Capability and moat analysis
- Current engine, logical extension, and moonshot
- Catalyst and risk map
- Fundamentals-versus-vibes classification
- Company comparison

## Phase 3 — Financials and monitoring

Add:

- Dynamic company modules
- Financial statement normalization
- Red-flag dashboard
- Earnings updates
- Staleness logic
- Version comparison
- Alerts

## Phase 4 — Instruments

Add:

- Option-chain analysis
- Bond analysis
- Scenario calculators
- Position-risk cards
- Brokerage-permission input
- No-position comparison
- Expiration and maturity monitoring

## Phase 5 — Portfolio and collaboration

Add:

- Portfolio context
- Exposure overlap
- Team comments
- Assigned human reviews
- Research templates by sector
- Shared glossary governance
- Research history and decision journal

---

# 18. Acceptance criteria

The application is complete enough for release when:

1. A user can enter a ticker and receive a sourced child-friendly explanation.
2. The application identifies the company’s real economic engine.
3. The application explains what appears to be embedded in the current valuation.
4. Capabilities and moats are classified separately.
5. The no-moonshot scenario is visible.
6. The user selects three upside and three downside developments.
7. The application classifies the stock as fundamentals-led, hybrid, catalyst, momentum, narrative, credit, or insufficient evidence.
8. The correct financial module is applied.
9. The user can create three to five red-flag thresholds.
10. Every technical term has a tooltip or glossary entry.
11. Tooltips work by hover, keyboard, touch, and screen reader.
12. Every factual claim has a source.
13. Every calculation shows inputs and formulas.
14. The application visibly distinguishes facts, guidance, estimates, assumptions, and inferences.
15. Stale data are clearly marked.
16. The instrument module shows maximum loss and time dependence.
17. “No position” is always available.
18. A final decision card can be exported.
19. Human edits and approvals remain in the audit trail.
20. A new filing can mark affected modules stale and trigger re-underwriting.

---

# 19. Definition and methodology references

The capability and moat framework in this specification is adapted from the following research concepts:

- Equal Ventures, **“What is a ‘Moat’ and why does it matter?”** The article defines moats around proven, perpetuating, and permanent unit-economic advantages.
- Equal Ventures, **“Companies Build ‘Capabilities’ Before They Build ‘Moats’.”** The article distinguishes underlying capabilities from the economic advantages those capabilities may eventually produce.

The application should preserve that distinction throughout the workflow: a company may possess an impressive capability without yet demonstrating a durable moat.

---

# 20. Final build instruction for the coding agent

Build this as a human-in-the-loop research system, not an autonomous stock recommender.

The application should make difficult concepts understandable without removing their complexity. It should allow the agent to perform the repetitive work—collecting filings, extracting metrics, calculating scenarios, drafting explanations, and monitoring changes—while requiring the human to own assumptions, red-flag thresholds, and decisions.

The quality standard is not “the agent produced a confident answer.”

The quality standard is:

- The user understands the business.
- The user can see what the stock price assumes.
- The user knows which capabilities are real and which moats remain unproven.
- The user knows what could produce unexpected upside.
- The user knows what could break the thesis.
- The user can distinguish fundamentals from momentum.
- The user can evaluate a limited-risk instrument without hiding timing, liquidity, or maximum-loss risk.
- Every unfamiliar term is clear at the moment it appears.
- Every important claim can be traced to evidence.
- The user can rationally choose to research further, wait, trade, invest, hedge, or do nothing.
