# Big Money vs Retail Positioning Agent Instructions

**Purpose:**  
Build and maintain an agent-driven research workflow that tracks where large institutions, funds, banks, sovereign/country funds, asset managers, hedge funds, and retail traders appear to be allocating capital. The goal is not to “copy big money,” but to detect **positioning divergence, crowding, accumulation, distribution, and regime change signals**.

**Core principle:**  
Treat all positioning data as imperfect footprints. Some sources are delayed, some are estimated, some are aggregated, and some only reveal partial exposure. The agent should never present a signal as certainty. It should classify each finding by source quality, freshness, and confidence.

---

## 1. Agent Mission

The agent’s job is to produce a recurring **Big Money vs Retail Positioning Report** that answers:

1. Where are institutions increasing or decreasing exposure?
2. Where are retail traders showing enthusiasm, panic, leverage, or abandonment?
3. Where are institutions and retail positioned on opposite sides?
4. Where is capital crowding into the same trade?
5. Where are macro funds, sovereign/country funds, commercials, and leveraged traders signaling regime shifts?
6. Which setups are actionable, watchlist-worthy, or too noisy?
7. How does the signal align with existing strategies inside the research vault?

---

## 2. Required Strategy Vault Alignment

Before producing a final signal, the agent must check the local strategy vault and align the finding with existing frameworks.

### Vault Alignment Instructions

For every flagged opportunity, the agent must search the vault for related strategy notes, including but not limited to:

- `Macro Regime Framework`
- `Chokepoint Convergence Strategy`
- `Options Risk and Position Sizing`
- `PEAD and Market Anomalies`
- `Crowding and AI Bot Risk`
- `Commodity Ladder Strategy`
- `Kalshi / Prediction Market Strategy`
- `Cash-Flow Quality Giants`
- `Retail vs Institutional Flow`
- `Should I Be Trading Dashboard`
- `Daily Market Intelligence Report`
- `Volatility Mispricing Framework`
- `Event-Driven and Supply Chain Stress Signals`

If the agent finds a matching strategy, it must include:

```md
## Vault Strategy Alignment

**Matched Strategy:**  
[Name of existing strategy note]

**Why this signal belongs here:**  
[Explain the connection]

**Strategy role:**  
- Entry signal
- Confirmation signal
- Risk warning
- Regime filter
- Position sizing input
- Exit / reduce exposure signal
- Watchlist-only signal

**Vault update needed:**  
Yes / No

**Suggested vault note update:**  
[Short note or bullet to add]
```

If no matching strategy exists, the agent must recommend whether a new vault note should be created.

```md
## Vault Strategy Alignment

**Matched Strategy:**  
None found.

**Recommendation:**  
Create a new vault note titled: `[Suggested Strategy Name]`

**Reason:**  
[Explain why this signal does not fit cleanly into existing frameworks]
```

---

## 3. Data Categories to Track

The agent should separate data into four major groups.

---

### A. Institutional Equity Positioning

Track large manager activity in public equities.

Primary sources:

- SEC Form 13F
- Schedule 13D and 13G filings
- Form 4 insider filings
- Fund holdings disclosures
- ETF and mutual fund portfolio holdings
- Fund flow data
- Large block trades, where available

Key questions:

- Which stocks or sectors are seeing repeated accumulation?
- Are multiple respected funds buying the same names?
- Are institutions reducing exposure while retail enthusiasm rises?
- Are activist investors taking positions?
- Are insiders buying or selling alongside institutional flows?
- Is ownership already crowded?

Signals to extract:

```md
- New institutional position
- Increased institutional position
- Reduced institutional position
- Fully exited position
- Activist stake
- Insider alignment
- Sector concentration
- Fund crowding
- Quality accumulation
- Defensive rotation
- Risk-on rotation
```

Important limitation:

13F data is delayed and does not reveal the full hedge structure. A fund may appear long while hedging through options, swaps, futures, or short positions not visible in the same filing.

---

### B. Macro, Futures, Commodity, and Sovereign Positioning

Track macro capital flows and large trader behavior.

Primary sources:

- CFTC Commitments of Traders reports
- Treasury International Capital data
- Treasury auction demand
- Sovereign wealth fund disclosures
- Central bank reserve trends
- Commodity inventory reports
- ETF flows into commodities, bonds, gold, energy, and currencies
- Futures curve shape
- Open interest and volume trends

Key questions:

- Are commercial hedgers positioned differently from speculators?
- Are leveraged funds crowded on one side?
- Are foreign holders buying or selling U.S. Treasuries?
- Are sovereign funds rotating by region, sector, or asset class?
- Are commodities showing physical-market stress?
- Are futures curves signaling shortage, oversupply, or panic hedging?

Signals to extract:

```md
- Commercial hedger extreme
- Leveraged fund crowding
- Asset manager rotation
- Sovereign accumulation
- Sovereign reduction
- Treasury demand stress
- Commodity backwardation
- Commodity contango
- Inventory drawdown
- Inventory glut
- Open interest expansion
- Open interest collapse
```

---

### C. Retail Positioning

Track retail trader behavior and speculative crowding.

Primary sources:

- FINRA margin debt
- Retail order flow datasets, if available
- Nasdaq retail flow products, if available
- Broker sentiment surveys
- Put/call ratios
- OCC options volume and open interest
- 0DTE activity
- Small-lot trading activity
- Reddit, X, Stocktwits, YouTube, TikTok, and Google Trends
- App-store brokerage ranking spikes
- Meme-stock watchlists

Key questions:

- Is retail buying aggressively?
- Is retail panic-selling?
- Is leverage increasing?
- Is call-buying extreme?
- Are short-dated options dominating activity?
- Are social mentions rising faster than fundamentals?
- Is retail ignoring an institutional accumulation setup?

Signals to extract:

```md
- Retail euphoria
- Retail panic
- Retail abandonment
- Retail dip-buying
- Retail leverage expansion
- Retail leverage contraction
- 0DTE crowding
- Meme acceleration
- Social sentiment spike
- Retail call-buying extreme
- Retail put-buying extreme
```

---

### D. Cross-Market Divergence

This is the agent’s highest-value layer.

The agent should flag cases where institutional, retail, macro, and options signals disagree.

Important divergence types:

```md
1. Institutional accumulation + retail neglect
2. Institutional selling + retail euphoria
3. Commercial hedger positioning opposite leveraged funds
4. Sovereign buying + domestic investor selling
5. Retail panic + insider/institutional buying
6. Retail call frenzy + weakening breadth
7. Retail put panic + improving institutional demand
8. ETF outflows + price strength
9. ETF inflows + price weakness
10. Options volume spike + no confirmation in underlying shares
```

---

## 4. Signal Confidence Rules

Every signal must receive a confidence rating.

### Confidence Levels

```md
High Confidence:
- Multiple independent sources agree
- Data is recent enough for the strategy
- Signal matches price behavior
- Signal aligns with macro regime
- Vault strategy match is clear

Medium Confidence:
- Two or more sources partially agree
- Data has some delay
- Price confirmation is incomplete
- Signal may still be useful as a watchlist item

Low Confidence:
- Single-source signal
- Social-only or flow-only signal
- Data is stale
- Price action contradicts the signal
- No clear vault strategy fit
```

The agent must avoid acting on low-confidence signals unless they are included as watchlist-only items.

---

## 5. Positioning Signal Score

Each asset, sector, commodity, or theme should receive a score from **-10 to +10**.

Positive scores indicate institutional or high-quality accumulation relative to retail expectations.

Negative scores indicate institutional distribution, crowding risk, or retail-driven excess.

### Scoring Model

| Category | Range | Description |
|---|---:|---|
| Institutional accumulation | -2 to +2 | Are large managers adding or reducing? |
| Retail sentiment | -2 to +2 | Is retail fearful, euphoric, or absent? |
| Macro/futures positioning | -2 to +2 | Are COT, rates, FX, commodities supportive? |
| Options confirmation | -1 to +1 | Does options flow confirm or warn? |
| Price/volume confirmation | -1 to +1 | Does price action support the signal? |
| Vault strategy alignment | -2 to +2 | Does this fit a tested framework? |

### Interpretation

```md
+8 to +10:
Strong institutional accumulation / retail divergence signal.
May qualify for deeper research or strategy activation.

+5 to +7:
Strong watchlist candidate.
Requires confirmation from price, macro, or options.

+2 to +4:
Interesting but incomplete.
Monitor only.

-1 to +1:
No edge.
Avoid forcing a trade.

-2 to -4:
Weak or conflicting setup.
Watch for reversal or noise.

-5 to -7:
Crowding or distribution risk.
Avoid new exposure unless strategy specifically benefits from reversal.

-8 to -10:
Extreme danger / exit-liquidity risk.
Retail may be chasing after institutions have already moved.
```

---

## 6. Strategy Classification

Each flagged signal must be classified into one of the following strategy roles.

```md
- Accumulation Setup
- Distribution Warning
- Crowding Risk
- Contrarian Reversal Setup
- Macro Rotation Signal
- Commodity Stress Signal
- Sovereign Flow Signal
- Retail Mania Signal
- Retail Panic Signal
- Options Volatility Signal
- Event-Driven Setup
- Watchlist Only
```

---

## 7. Agent Workflow

The agent should follow this recurring workflow.

### Step 1: Pull Data

Collect the latest available data from:

```md
- SEC 13F filings
- SEC 13D / 13G filings
- Form 4 insider filings
- N-PORT fund holdings
- ETF and mutual fund flows
- CFTC COT reports
- Treasury TIC data
- Treasury auctions
- OCC options data
- Put/call ratios
- FINRA margin debt
- Retail sentiment and social chatter
- Google Trends
- Sector ETF flows
- Commodity inventory reports
- Futures open interest
```

### Step 2: Normalize Data

Convert all observations into standard fields:

```md
Asset:
Ticker / Market:
Sector / Theme:
Signal Type:
Source:
Date of Data:
Date Retrieved:
Freshness:
Observed Flow:
Estimated Direction:
Institutional Bias:
Retail Bias:
Macro Bias:
Options Bias:
Confidence:
Vault Strategy Match:
```

### Step 3: Compare Big Money vs Retail

For each asset or theme, classify the relationship:

```md
- Institutions buying / retail buying
- Institutions buying / retail selling
- Institutions buying / retail ignoring
- Institutions selling / retail buying
- Institutions selling / retail selling
- Institutions neutral / retail euphoric
- Institutions neutral / retail panicked
- No clear signal
```

### Step 4: Score the Setup

Use the scoring model from Section 5.

### Step 5: Search and Align With Vault

Before final output, search the vault and determine whether the signal belongs to an existing strategy.

### Step 6: Create Final Report

Generate a clean markdown report using the template in Section 8.

---

## 8. Final Report Template

```md
# Big Money vs Retail Positioning Report

**Date:** YYYY-MM-DD  
**Agent:** [Agent Name]  
**Market Regime:** [Risk-on / Risk-off / Neutral / Volatile / Defensive / Unknown]  
**Confidence of Overall Report:** High / Medium / Low  

---

## Executive Summary

[3-6 bullet summary of the most important findings]

---

## Top Divergence Signals

| Rank | Asset / Theme | Institutional Bias | Retail Bias | Score | Confidence | Strategy Role |
|---:|---|---|---|---:|---|---|
| 1 |  |  |  |  |  |  |
| 2 |  |  |  |  |  |  |
| 3 |  |  |  |  |  |  |

---

## Signal Deep Dives

### 1. [Asset / Theme Name]

**Signal Type:**  
[Accumulation / Distribution / Crowding / Contrarian / Macro Rotation]

**What big money appears to be doing:**  
[Summary]

**What retail appears to be doing:**  
[Summary]

**Why this matters:**  
[Interpretation]

**Evidence:**  
- [Source 1]
- [Source 2]
- [Source 3]

**Score:**  
[Score from -10 to +10]

**Confidence:**  
[High / Medium / Low]

**Risks and counterarguments:**  
- [Risk 1]
- [Risk 2]
- [Risk 3]

---

## Vault Strategy Alignment

**Matched Strategy:**  
[Existing vault note]

**Why this signal belongs here:**  
[Explanation]

**Strategy role:**  
[Entry / confirmation / risk warning / regime filter / watchlist]

**Vault update needed:**  
Yes / No

**Suggested vault note update:**  
[Short addition]

---

## Action Classification

This signal is classified as:

- [ ] Actionable now
- [ ] Needs confirmation
- [ ] Watchlist only
- [ ] Avoid / crowded
- [ ] Exit-risk warning

---

## Monitoring Triggers

The agent should continue monitoring for:

- [Trigger 1]
- [Trigger 2]
- [Trigger 3]

---

## Final Recommendation

[Plain-English conclusion]
```

---

## 9. Watchlist Output Template

The agent should maintain a running watchlist.

```md
# Big Money vs Retail Watchlist

| Asset / Theme | Current Signal | Score | Confidence | Strategy Match | Next Trigger | Status |
|---|---|---:|---|---|---|---|
|  |  |  |  |  |  |  |
```

Status options:

```md
- Active research
- Watchlist
- Strategy candidate
- Crowded risk
- Avoid
- Needs new vault note
- Archived
```

---

## 10. Red Flags

The agent must flag these conditions clearly.

```md
- Retail euphoric while institutions reduce exposure
- 0DTE call activity spikes without underlying accumulation
- Social attention rises after price has already moved sharply
- Leverage rises while breadth weakens
- Multiple funds crowd into the same trade late
- COT leveraged funds reach extreme positioning
- Commercial hedgers are aggressively opposite speculators
- ETF inflows surge into weakening price action
- Insider selling aligns with institutional reduction
- Macro regime contradicts the trade thesis
```

---

## 11. Action Rules

The agent must not recommend action from positioning alone.

A signal can only become actionable if at least three of the following are present:

```md
- Institutional positioning supports the thesis
- Retail positioning creates useful divergence
- Macro regime supports the thesis
- Price and volume confirm the thesis
- Options flow confirms rather than contradicts
- Vault strategy match is strong
- Risk/reward can be clearly defined
- Exit conditions are defined
```

If fewer than three are present, classify the signal as **watchlist only**.

---

## 12. Risk Notes

The agent must include the following reminders when generating reports:

```md
- 13F data is delayed and incomplete.
- Fund holdings do not reveal full hedging.
- Retail flow data is often estimated.
- Options flow does not always reveal buyer intent.
- Sovereign fund reporting is inconsistent.
- COT categories are useful but broad.
- Crowded trades can continue longer than expected.
- Contrarian signals require timing confirmation.
- Positioning is not the same thing as valuation.
- A good signal is not automatically a good trade.
```

---

## 13. Suggested File Structure

If building this into a research system, use the following structure:

```txt
/vault
  /strategies
    macro-regime-framework.md
    chokepoint-convergence-strategy.md
    options-risk-position-sizing.md
    pead-market-anomalies.md
    crowding-ai-bot-risk.md
    commodity-ladder-strategy.md
    big-money-vs-retail-positioning.md

  /data-sources
    sec-13f.md
    sec-13d-13g.md
    sec-nport.md
    cftc-cot.md
    treasury-tic.md
    finra-margin-debt.md
    occ-options-data.md
    retail-sentiment.md

  /reports
    daily-market-intelligence/
    weekly-positioning-reports/
    monthly-regime-reviews/

  /watchlists
    institutional-accumulation.md
    retail-crowding.md
    commodity-stress.md
    macro-rotation.md
```

---

## 14. Agent Checklist

Before publishing any report, the agent must check:

```md
- [ ] Data source dates are listed
- [ ] Signal freshness is labeled
- [ ] Institutional and retail signals are separated
- [ ] Confidence score is included
- [ ] Positioning score is included
- [ ] Risks and counterarguments are included
- [ ] Vault strategy alignment is completed
- [ ] Action classification is included
- [ ] Monitoring triggers are included
- [ ] No signal is presented as certainty
```

---

## 15. Example Mini Signal

```md
### Example: Energy Sector Accumulation vs Retail Neglect

**Signal Type:**  
Institutional accumulation / retail neglect

**What big money appears to be doing:**  
Several large funds have increased exposure to integrated energy and oilfield services names.

**What retail appears to be doing:**  
Retail attention remains concentrated in AI, mega-cap tech, and short-dated index options.

**Why this matters:**  
This may suggest quiet institutional rotation into cash-flowing commodity-linked businesses before broader retail attention returns.

**Score:**  
+6

**Confidence:**  
Medium

**Vault Strategy Alignment:**  
Matched Strategy: Chokepoint Convergence Strategy

**Strategy role:**  
Watchlist and macro confirmation signal

**Monitoring Triggers:**  
- Crude inventory drawdowns
- Energy ETF inflows
- COT commercial positioning shift
- Price breakout above sector moving averages
- Retail search interest rising from low base

**Action Classification:**  
Needs confirmation
```

---

## 16. Final Operating Rule

The agent should behave like a cautious market cartographer.

Do not chase the loudest signal.  
Do not trust one data source.  
Do not confuse delayed disclosure with current conviction.  
Do not treat retail as always wrong or institutions as always right.  

The edge comes from finding **disagreement, timing, confirmation, and fit with an existing strategy framework**.

---

## 17. Big Money Firm and Archetype Markers

The agent must tag major firms by **archetype** before interpreting their market activity. Do not treat every large firm the same. A 13F from a concentrated activist fund means something very different from ETF flows at BlackRock, a COT signal from leveraged funds, or liquidity behavior from Jane Street.

Each detected firm should receive one or more of the following markers:

```md
- MULTI_STRATEGY_PLATFORM
- QUANT_SYSTEMATIC
- MARKET_MAKER_PROP
- ACTIVIST_EVENT_DRIVEN
- DEEP_VALUE_DISTRESSED
- PASSIVE_INDEX_GIANT
- LONG_ONLY_ACTIVE_MANAGER
- PRIVATE_EQUITY_PRIVATE_CREDIT
- BANK_DEALER
- SOVEREIGN_COUNTRY_FUND
- MACRO_FUND
- COMMODITY_SPECIALIST
- OPTIONS_VOLATILITY_SPECIALIST
```

When a firm appears in data, news, filings, fund-flow analysis, or market commentary, the agent should ask:

```md
1. What archetype is this firm?
2. What footprint would this type of firm realistically leave?
3. Is this firm investing, hedging, market making, lending, creating liquidity, or pressuring management?
4. Which data source best captures this firm’s behavior?
5. Does the signal represent conviction, liquidity provision, passive flow, or noise?
```

---

### A. Multi-Strategy Platform Markers

These firms often run many independent teams or “pods.” Their positioning can reflect short-term relative value, fundamental equity, macro, credit, commodities, and systematic strategies all at once. Avoid assuming one single house view.

| Firm | Marker | Typical Focus Points | Best Tracking Sources | Interpretation Rule |
|---|---|---|---|---|
| Citadel | MULTI_STRATEGY_PLATFORM | Equities, macro, credit, commodities, quant, relative value | 13F, hiring, sector exposure, fund commentary | Treat as multi-engine capital allocation, not one simple directional bet |
| Millennium Management | MULTI_STRATEGY_PLATFORM | Pod-based equity, fixed income, macro, commodities, relative value | 13F, sector changes, PM hiring, crowded trade reports | Watch for crowded pod trades and rapid capital rotation |
| Point72 | MULTI_STRATEGY_PLATFORM | Long/short equity, macro, systematic, private credit, venture | 13F, sector concentration, Cubist/systematic signals | Separate discretionary equity exposure from systematic activity |
| Balyasny Asset Management | MULTI_STRATEGY_PLATFORM | Equity long/short, macro, commodities, systematic, arbitrage | 13F, sector rotation, hiring, macro exposure | Useful as a pod-platform crowding marker |
| D. E. Shaw | MULTI_STRATEGY_PLATFORM / QUANT_SYSTEMATIC | Quantamental, systematic, discretionary, credit, macro | 13F, factor exposure, research themes | Interpret as blended quantitative and discretionary positioning |
| ExodusPoint | MULTI_STRATEGY_PLATFORM | Multi-manager equities, macro, fixed income, relative value | 13F, hiring, strategy expansion | Watch for pod-style exposure and crowded factor overlap |

Signal use:

```md
- Good for: crowding detection, sector rotation, hedge fund consensus
- Weak for: precise directional intent
- Risk: visible holdings may be hedged elsewhere
```

---

### B. Quant and Systematic Firm Markers

These firms often trade from data, models, statistical relationships, factors, trend, or market microstructure. Their public filings are usually breadcrumbs, not the full machine.

| Firm | Marker | Typical Focus Points | Best Tracking Sources | Interpretation Rule |
|---|---|---|---|---|
| Renaissance Technologies | QUANT_SYSTEMATIC | Statistical trading, mathematical signals, short-horizon patterns | 13F, factor exposure, turnover clues | Do not overread individual holdings |
| Two Sigma | QUANT_SYSTEMATIC | Machine learning, alternative data, systematic equities, macro signals | 13F, hiring, factor behavior | Treat as model-driven exposure |
| AQR | QUANT_SYSTEMATIC | Value, momentum, carry, quality, defensive, trend | Factor performance, fund commentary, holdings | Useful for factor regime tracking |
| Man AHL | QUANT_SYSTEMATIC / MACRO_FUND | Trend following, managed futures, systematic macro | COT, futures trends, CTA indices | Track trend and managed futures regimes |
| Winton | QUANT_SYSTEMATIC | Trend following, statistical futures, cross-asset models | CTA performance, futures trends | Watch cross-asset trend strength |
| XTX Markets | QUANT_SYSTEMATIC / MARKET_MAKER_PROP | FX, equities, commodities, systematic electronic liquidity | FX volume, venue data, market structure | More liquidity/microstructure than long-term investing |

Signal use:

```md
- Good for: factor regimes, trend strength, systematic crowding
- Weak for: individual stock conviction
- Risk: public holdings may be residual exposure, not thesis exposure
```

---

### C. Market Maker and Prop Trading Markers

These firms are often liquidity providers. They may trade enormous volume without expressing a long-term investment view. Their activity may reflect spread capture, hedging, ETF creation/redemption, volatility pricing, or exchange mechanics.

| Firm | Marker | Typical Focus Points | Best Tracking Sources | Interpretation Rule |
|---|---|---|---|---|
| Citadel Securities | MARKET_MAKER_PROP | Equities, options, ETFs, retail order flow, institutional liquidity | Market share, PFOF reports, options volume | Do not treat liquidity provision as directional conviction |
| Jane Street | MARKET_MAKER_PROP | ETFs, bonds, options, commodities, crypto, arbitrage | ETF flow, creation/redemption, bond ETF stress | Strong marker for ETF and arbitrage mechanics |
| Jump Trading | MARKET_MAKER_PROP | Futures, crypto, low-latency trading, market structure | Futures volume, crypto venues, exchange data | Speed/liquidity signal, not necessarily thesis signal |
| Hudson River Trading | MARKET_MAKER_PROP | Automated multi-asset liquidity, equities/options | Venue share, liquidity data, hiring | Market structure marker |
| SIG / Susquehanna | MARKET_MAKER_PROP / OPTIONS_VOLATILITY_SPECIALIST | Options, ETFs, derivatives, prediction markets | Options volume, OI, block trades, vol surfaces | Useful for volatility and derivatives context |
| Optiver | MARKET_MAKER_PROP / OPTIONS_VOLATILITY_SPECIALIST | Index options, volatility, liquidity provision | SPX options, vol regimes, market-making data | Strong options liquidity marker |
| IMC Trading | MARKET_MAKER_PROP | ETFs, options, equities, global venues | ETF flow, options liquidity, LMM roles | ETF/options liquidity marker |
| DRW | MARKET_MAKER_PROP / COMMODITY_SPECIALIST | Commodities, crypto, fixed income, ETFs, FICC options | Futures/options data, crypto, commodities | Liquidity and relative value marker |
| Tower Research | MARKET_MAKER_PROP | HFT, electronic trading, low-latency arbitrage | Venue data, market structure | Latency/microstructure marker |
| Five Rings | MARKET_MAKER_PROP / OPTIONS_VOLATILITY_SPECIALIST | Quant trading, options, arbitrage | Hiring, market chatter, limited public data | Treat as opaque; avoid unsupported claims |
| Headlands Technologies | MARKET_MAKER_PROP / COMMODITY_SPECIALIST | Futures, electronic market making, niche markets | Futures volume, venue data | Liquidity/microstructure marker |

Signal use:

```md
- Good for: liquidity stress, ETF mechanics, volatility pricing, market structure
- Weak for: long-term investment intent
- Risk: market-making volume can look like conviction but may be hedged instantly
```

---

### D. Activist and Event-Driven Markers

These firms are often easier to track because they leave public filings, letters, campaigns, and ownership thresholds. Their activity may signal corporate change, restructuring, capital return, board pressure, or breakup potential.

| Firm | Marker | Typical Focus Points | Best Tracking Sources | Interpretation Rule |
|---|---|---|---|---|
| Elliott Management | ACTIVIST_EVENT_DRIVEN / DEEP_VALUE_DISTRESSED | Activism, distressed debt, restructurings, strategic reviews | 13D/G, public letters, proxy fights, credit stress | High-impact catalyst marker |
| Pershing Square | ACTIVIST_EVENT_DRIVEN | Concentrated large-cap activist/value positions | 13F, investor letters, presentations | Strong conviction, concentrated thesis marker |
| Third Point | ACTIVIST_EVENT_DRIVEN | Event-driven equity, corporate credit, structured credit, venture | Letters, 13F, 13D/G | Opportunistic catalyst marker |
| Icahn Enterprises / Carl Icahn | ACTIVIST_EVENT_DRIVEN | Board pressure, asset sales, governance, capital returns | 13D/G, public campaigns | Old-school activist pressure marker |
| Trian Partners | ACTIVIST_EVENT_DRIVEN | Consumer, industrials, operational improvement, board influence | 13D/G, proxy campaigns | Constructive activist marker |
| Starboard Value | ACTIVIST_EVENT_DRIVEN | Operational improvement, margin expansion, board seats | 13D/G, activist decks | Margin-improvement catalyst marker |
| ValueAct Capital | ACTIVIST_EVENT_DRIVEN | Collaborative activism, governance, long-term value | 13D/G, board involvement | Lower-noise activist marker |

Signal use:

```md
- Good for: catalyst tracking, event-driven setups, management pressure
- Weak for: broad market regime calls
- Risk: activist campaigns can fail, take years, or be priced in immediately
```

---

### E. Deep Value and Distressed Markers

These firms often appear when assets are hated, complex, credit-stressed, or misunderstood. Their involvement can mark forced selling, restructuring, bankruptcy, or asymmetric value.

| Firm | Marker | Typical Focus Points | Best Tracking Sources | Interpretation Rule |
|---|---|---|---|---|
| Baupost Group | DEEP_VALUE_DISTRESSED | Margin of safety, distressed debt, complex securities, cash patience | 13F, credit stress, distressed cycles | Patient value marker, not necessarily near-term catalyst |
| Oaktree Capital | DEEP_VALUE_DISTRESSED / PRIVATE_EQUITY_PRIVATE_CREDIT | Distressed debt, high yield, special situations | Credit spreads, default cycles, fund commentary | Excellent credit stress thermometer |
| Appaloosa | DEEP_VALUE_DISTRESSED / MACRO_FUND | Distressed debt, cyclical equity, macro inflection | 13F, financials, semis, credit spreads | Macro-cyclical inflection marker |
| Centerbridge | DEEP_VALUE_DISTRESSED / PRIVATE_EQUITY_PRIVATE_CREDIT | Distressed, private equity, credit, restructuring | Credit markets, restructurings, private transactions | Special situations marker |
| Silver Point Capital | DEEP_VALUE_DISTRESSED | Distressed credit, loans, restructurings | Bankruptcy filings, credit stress | Distressed credit marker |

Signal use:

```md
- Good for: forced-selling opportunities, credit cycle turns, restructuring themes
- Weak for: timing short-term equity entries
- Risk: distressed can get more distressed
```

---

### F. Passive Index Giant Markers

These firms are capital-flow weather systems. Their activity is often driven by index rules, retirement flows, ETF creations/redemptions, and allocation trends rather than security-level conviction.

| Firm | Marker | Typical Focus Points | Best Tracking Sources | Interpretation Rule |
|---|---|---|---|---|
| BlackRock / iShares | PASSIVE_INDEX_GIANT | ETFs, index exposure, factor ETFs, active ETFs, alternatives | ETF flows, iShares holdings, sector flows | Track as flow gravity, not single-stock conviction |
| Vanguard | PASSIVE_INDEX_GIANT | Low-cost index funds, retirement allocation, long-term portfolios | Fund flows, index holdings, retirement flows | Broad market allocation marker |
| State Street Global Advisors | PASSIVE_INDEX_GIANT | SPDR ETFs, institutional index exposure, sector ETFs | SPY flows, sector ETF flows | Strong ETF-sector flow marker |
| Invesco | PASSIVE_INDEX_GIANT | QQQ, factor ETFs, thematic ETFs | ETF flows, QQQ exposure | Tech/growth ETF flow marker |
| Schwab Asset Management | PASSIVE_INDEX_GIANT | Low-cost ETFs, index funds, retail allocation | ETF flows, brokerage allocation | Retail-adjacent passive flow marker |

Signal use:

```md
- Good for: sector flows, index gravity, passive crowding, retirement allocation
- Weak for: intentional stock-picking signals
- Risk: passive flows can overpower fundamentals temporarily
```

---

### G. Long-Only Active Manager Markers

These firms are useful for fundamental accumulation and long-term institutional conviction. Their holdings can matter when multiple long-only managers converge on the same sector or quality theme.

| Firm | Marker | Typical Focus Points | Best Tracking Sources | Interpretation Rule |
|---|---|---|---|---|
| Fidelity | LONG_ONLY_ACTIVE_MANAGER | Active equity, brokerage, retirement, research-driven stock picking | N-PORT, fund holdings, 13F | Useful for active fundamental accumulation |
| Capital Group / American Funds | LONG_ONLY_ACTIVE_MANAGER | Long-term fundamental research, multi-manager portfolios | N-PORT, fund commentary, holdings | Slow-moving high-conviction marker |
| T. Rowe Price | LONG_ONLY_ACTIVE_MANAGER | Growth, value, retirement, active equity | N-PORT, 13F, fund holdings | Growth/value institutional conviction marker |
| Wellington Management | LONG_ONLY_ACTIVE_MANAGER | Fundamental equity, fixed income, multi-asset | 13F, fund holdings, institutional commentary | Broad institutional research marker |
| Dodge & Cox | LONG_ONLY_ACTIVE_MANAGER | Value, contrarian, long-term fundamentals | Fund holdings, N-PORT | Long-term value marker |
| Harris Associates / Oakmark | LONG_ONLY_ACTIVE_MANAGER | Value-oriented active equity | Fund holdings, commentary | Contrarian quality/value marker |

Signal use:

```md
- Good for: fundamental accumulation, quality/value/growth rotation
- Weak for: short-term timing
- Risk: positions may be slow to change and slow to work
```

---

### H. Private Equity, Private Credit, and Real Asset Markers

These firms matter because they shape credit availability, real estate, infrastructure, energy transition, insurance capital, private markets, and take-private activity. Their signals often show up outside traditional equity screens.

| Firm | Marker | Typical Focus Points | Best Tracking Sources | Interpretation Rule |
|---|---|---|---|---|
| Blackstone | PRIVATE_EQUITY_PRIVATE_CREDIT | Private equity, real estate, private credit, infrastructure, secondaries | Earnings, deal flow, real estate credit, fundraising | Alternative asset cycle marker |
| KKR | PRIVATE_EQUITY_PRIVATE_CREDIT | PE, credit, infrastructure, real estate, insurance | Deal flow, credit funds, infrastructure themes | Broad private market allocation marker |
| Apollo | PRIVATE_EQUITY_PRIVATE_CREDIT | Private credit, asset-backed finance, insurance capital, PE | Credit spreads, Athene flows, direct lending | Private credit and insurance-capital marker |
| Brookfield | PRIVATE_EQUITY_PRIVATE_CREDIT | Infrastructure, renewable power, real estate, credit, PE | Infrastructure deals, energy transition, data centers | Real asset and infrastructure marker |
| Carlyle | PRIVATE_EQUITY_PRIVATE_CREDIT | Buyouts, defense, government services, credit, secondaries | Deal flow, defense exposure, credit funds | Buyout and policy-linked marker |
| Ares Management | PRIVATE_EQUITY_PRIVATE_CREDIT | Direct lending, credit, real estate, secondaries | Private credit flows, middle-market lending | Private credit demand marker |
| TPG | PRIVATE_EQUITY_PRIVATE_CREDIT | Growth equity, healthcare, technology, impact | IPO market, growth equity valuations | Growth/private market risk marker |
| Warburg Pincus | PRIVATE_EQUITY_PRIVATE_CREDIT | Growth investing, technology, healthcare, financial services | Private deals, IPO pipeline | Growth equity marker |

Signal use:

```md
- Good for: credit cycle, real assets, take-private potential, infrastructure themes
- Weak for: immediate public equity signals
- Risk: private-market marks can lag public-market reality
```

---

### I. Bank and Dealer Markers

Banks and dealers shape markets through lending, underwriting, derivatives, prime brokerage, structured products, and balance sheet constraints. They may not be taking a clean investment view. They may be facilitating client flow.

| Firm | Marker | Typical Focus Points | Best Tracking Sources | Interpretation Rule |
|---|---|---|---|---|
| JPMorgan | BANK_DEALER | Rates, credit, equities, corporate lending, prime brokerage, macro research | Dealer positioning, research, credit conditions, Treasury markets | Treat as flow/intermediation plus research signal |
| Goldman Sachs | BANK_DEALER | Equities, derivatives, M&A, prime brokerage, structured products | Hedge fund flow notes, derivatives exposure, deal activity | Strong hedge fund and derivatives flow marker |
| Morgan Stanley | BANK_DEALER | Wealth, institutional securities, prime brokerage, equity derivatives | Wealth allocation, hedge fund leverage, equity derivatives | Wealth-flow plus prime-broker marker |
| Bank of America | BANK_DEALER | Credit, rates, equities, consumer data, fund manager surveys | Fund manager survey, card data, credit spreads | Useful sentiment and credit risk marker |
| Barclays | BANK_DEALER | Rates, credit, structured products, macro | Rates vol, credit issuance, structured products | Fixed income dealer marker |
| UBS | BANK_DEALER | Global wealth, structured products, investment banking | Wealth allocation, structured product issuance | Global wealth-flow marker |
| Deutsche Bank | BANK_DEALER | Rates, FX, credit, European macro | FX/rates research, European credit | European macro/dealer marker |
| BNP Paribas | BANK_DEALER | Rates, equity derivatives, European banking, structured products | Derivatives notes, Europe flows | Equity derivatives and rates marker |

Signal use:

```md
- Good for: flow context, derivatives exposure, lending conditions, client positioning
- Weak for: pure house conviction
- Risk: research views may conflict with actual client facilitation
```

---

### J. Sovereign and Country Fund Markers

Sovereign funds, central banks, and country-linked investors can drive long-term flows in Treasuries, equities, infrastructure, energy, technology, and strategic assets. Reporting quality varies widely.

| Entity | Marker | Typical Focus Points | Best Tracking Sources | Interpretation Rule |
|---|---|---|---|---|
| Norges Bank Investment Management | SOVEREIGN_COUNTRY_FUND | Global equities, bonds, real estate, renewable infrastructure | Public holdings database, annual reports | Transparent sovereign allocation marker |
| ADIA | SOVEREIGN_COUNTRY_FUND | Global diversified assets, private equity, real estate, infrastructure | Annual reports, deal flow | Large but less transparent allocation marker |
| Mubadala | SOVEREIGN_COUNTRY_FUND | Technology, energy, aerospace, healthcare, global investments | Deal announcements, annual reports | Strategic industrial investment marker |
| Qatar Investment Authority | SOVEREIGN_COUNTRY_FUND | Real estate, public equities, private markets, strategic stakes | Deal flow, public disclosures | Strategic global asset marker |
| Saudi PIF | SOVEREIGN_COUNTRY_FUND | Domestic transformation, global equities, sports, tech, infrastructure | Public filings, deal announcements | Policy-linked sovereign strategy marker |
| GIC | SOVEREIGN_COUNTRY_FUND | Global equities, real estate, private equity, infrastructure | Annual reports, deal flow | Long-horizon diversified marker |
| Temasek | SOVEREIGN_COUNTRY_FUND | Asia, financials, technology, healthcare, sustainability | Annual reports, portfolio updates | Asia-linked strategic equity marker |
| SAFE / China reserve entities | SOVEREIGN_COUNTRY_FUND | FX reserves, Treasuries, strategic state-linked capital | TIC data, reserve data, policy signals | Macro reserve and geopolitics marker |

Signal use:

```md
- Good for: long-term capital flows, strategic sectors, country-level allocation
- Weak for: short-term trading signals
- Risk: opacity, policy motives, and delayed reporting
```

---

## 18. Firm Marker Output Template

Whenever the agent references a major firm, include the following mini-block.

```md
### Firm Marker: [Firm Name]

**Archetype Marker:**  
[MULTI_STRATEGY_PLATFORM / MARKET_MAKER_PROP / etc.]

**Likely Market Role:**  
[Investor / liquidity provider / dealer / lender / activist / passive allocator / sovereign allocator]

**Primary Footprint:**  
[13F / 13D / N-PORT / ETF flows / COT / dealer notes / options volume / credit spreads / deal flow]

**Signal Strength:**  
High / Medium / Low

**Interpretation:**  
[What this firm’s activity likely means]

**Do Not Overread:**  
[What the data does not prove]
```

---

## 19. Firm Marker Scoring Adjustment

The agent should adjust confidence based on firm type.

| Firm Type | Confidence Boost | Confidence Penalty |
|---|---:|---:|
| Activist with 13D filing | +2 | 0 |
| Concentrated long-only manager increasing position | +1 | 0 |
| Multiple long-only managers accumulating same sector | +2 | 0 |
| Multi-strategy platform 13F position | +1 | -1 if likely hedged |
| Quant/systematic 13F position | 0 | -1 if interpreting as thesis |
| Market maker activity | 0 | -2 if treated as directional |
| Passive ETF flow | +1 for flow strength | -1 for stock-specific intent |
| Bank/dealer research note | 0 | -1 if no flow data confirms |
| Private equity deal activity | +1 | -1 if public-market link is weak |
| Sovereign fund disclosure | +1 | -1 if stale or opaque |

The agent should apply the adjustment to the **Confidence** field, not automatically to the trade score.

---

## 20. Example Firm Marker Use

```md
### Firm Marker: Elliott Management

**Archetype Marker:**  
ACTIVIST_EVENT_DRIVEN / DEEP_VALUE_DISTRESSED

**Likely Market Role:**  
Activist investor and event-driven catalyst seeker

**Primary Footprint:**  
13D filings, 13G filings, public letters, proxy campaigns, restructuring news

**Signal Strength:**  
High when confirmed by 13D or public campaign

**Interpretation:**  
A position may indicate potential corporate pressure, board changes, asset sales, restructuring, buybacks, or strategic review.

**Do Not Overread:**  
An activist position does not guarantee success, timing, or positive returns.
```

```md
### Firm Marker: Jane Street

**Archetype Marker:**  
MARKET_MAKER_PROP

**Likely Market Role:**  
Liquidity provider, ETF arbitrageur, market maker

**Primary Footprint:**  
ETF creation/redemption data, market structure data, bond ETF liquidity, options activity

**Signal Strength:**  
Medium for liquidity conditions; low for long-term direction

**Interpretation:**  
Activity may reveal market structure stress, ETF dislocations, or arbitrage pressure.

**Do Not Overread:**  
Jane Street activity should not be interpreted as a traditional long-term investment thesis.
```

```md
### Firm Marker: BlackRock / iShares

**Archetype Marker:**  
PASSIVE_INDEX_GIANT

**Likely Market Role:**  
ETF sponsor, index allocator, institutional asset manager

**Primary Footprint:**  
ETF flows, fund holdings, creations/redemptions, sector ETF flows

**Signal Strength:**  
High for flow gravity; low for stock-picking intent

**Interpretation:**  
Large inflows or outflows may indicate passive allocation pressure, sector rotation, or index-driven demand.

**Do Not Overread:**  
ETF flows do not prove that BlackRock has a discretionary view on every underlying holding.
```

---

## 21. Firm Marker Checklist

Before using any firm as evidence, the agent must check:

```md
- [ ] Firm archetype identified
- [ ] Market role identified
- [ ] Correct footprint source selected
- [ ] Signal freshness checked
- [ ] Directional intent separated from liquidity/passive/dealer activity
- [ ] Confidence adjusted based on firm type
- [ ] Vault strategy alignment completed
- [ ] Overread risk stated clearly
```
