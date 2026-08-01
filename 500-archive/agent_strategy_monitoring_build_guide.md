# AI Agent Strategy Monitoring Build Guide

## Purpose

Build a daily monitoring system where specialized agents pull market, macro, options, fundamental, auction, and crowding data, then check whether strategy markers are met before a streamlined trading research report is produced.

This system is not designed to auto-trade. It is designed to create a disciplined research workflow that prevents one signal, one headline, or one excited goblin from driving a decision without review.

## Core Principle

Every strategy setup must pass through:

1. Daily data pull
2. Agent-specific marker checks
3. Cross-agent review
4. Orchestrator validation
5. Final streamlined report
6. Human decision

No setup should be promoted to the final report unless the marker checklist shows which conditions are met, missing, conflicting, or invalidated.

---

# 1. System Architecture

## 1.1 Agent Roles

Use a multi-agent structure with one orchestrator and several specialist agents.

| Agent | Primary Responsibility |
|---|---|
| Orchestrator Agent | Coordinates all agents, resolves conflicts, assigns regime label, approves final report |
| Data Pull Agent | Pulls market, fundamentals, options, macro, and news data from APIs |
| Regime Agent | Classifies current market environment |
| Macro Agent | Reviews rates, dollar, oil, gold, credit, volatility, financial stress |
| Strategy Agent | Checks strategy-specific markers across trend, momentum, mean reversion, PEAD, value/quality, carry, volatility, pairs, macro event, structural flow |
| Auction Agent | Reviews Volume Profile, TPO, VWAP, anchored VWAP, VAH, VAL, POC, HVN, LVN |
| Options Agent | Reviews implied volatility, expected move, options liquidity, open interest, strategy fit |
| Crowding Agent | Reviews concentration, ETF flow, narrative crowding, gamma/open interest clustering, AI/model monoculture risk |
| Risk Agent | Reviews position sizing, invalidation level, liquidity, max loss, event risk |
| Report Agent | Produces final clean report only after orchestrator approval |

## 1.2 Daily Flow

```text
START
  ↓
Data Pull Agent gathers all daily data
  ↓
Specialist agents check markers independently
  ↓
Each agent returns:
  - PASS / WATCH / FAIL / CONFLICT
  - supporting data
  - missing data
  - confidence score
  ↓
Orchestrator reviews conflicts and assigns regime
  ↓
Strategy Agent ranks possible setups
  ↓
Risk Agent applies hard vetoes
  ↓
Report Agent creates streamlined report
  ↓
Human reviews and decides
END
```

---

# 2. Data Sources

## 2.1 Required Sources

| Data Type | Source Examples |
|---|---|
| Equity prices and volume | FMP API |
| Intraday bars | FMP API |
| Fundamentals | FMP API |
| Earnings calendar and earnings surprises | FMP API |
| Analyst estimates/revisions | FMP API if available by plan |
| Options chain and liquidity | **TBD** — no options data source configured. Manual Fidelity review required until a provider is chosen. |
| Macro data | FRED, OFR, Treasury, BLS, EIA, Fed |
| Volatility data | Cboe, FMP if available, broker data |
| News/catalysts | FMP news, SEC filings, company IR, official sources |
| ETF/sector context | FMP, ETF issuer pages, market data provider |
| Financial stress | OFR Financial Stress Index, Fed reports |
| Commodity data | EIA, CME, FRED, FMP where available |

## 2.2 Minimum Daily Pull

The system should pull:

| Category | Required Fields |
|---|---|
| Price | Open, high, low, close, previous close |
| Volume | Daily volume, 20-day avg volume, relative volume |
| Intraday | 1m/5m/15m bars where available |
| Trend | 20/50/100/200-day moving averages |
| Momentum | 1m/3m/6m/12m returns |
| Auction | VWAP, anchored VWAP, Volume Profile, TPO approximation |
| Fundamentals | Revenue, EPS, operating cash flow, free cash flow, debt, margins |
| Earnings | Last earnings date, surprise, guidance notes if available |
| Options | IV, IV rank if available, volume, open interest, bid/ask spread, expected move |
| Macro | VIX, rates, dollar, oil, gold, credit proxies, FSI |
| News | Major headlines, filings, earnings, analyst changes |
| Crowding | sector concentration, ETF movement, OI clusters, narrative frequency if available |

---

# 3. Marker Status Definitions

Every agent must mark each condition using the same vocabulary.

| Status | Meaning |
|---|---|
| PASS | Marker clearly supports the setup |
| WATCH | Marker is partially supportive or developing |
| FAIL | Marker contradicts the setup |
| CONFLICT | Marker conflicts with another major signal |
| MISSING | Required data was unavailable |
| STALE | Data is older than allowed threshold |
| VETO | Risk condition blocks setup regardless of other positives |

## 3.1 Confidence Scale

Each agent must assign confidence from 0 to 3.

| Score | Meaning |
|---:|---|
| 0 | No confidence or missing data |
| 1 | Weak confidence |
| 2 | Moderate confidence |
| 3 | Strong confidence |

---

# 4. Regime Agent

## 4.1 Purpose

Classify the current market environment before any strategy is evaluated. A strategy that works in a trend regime may fail in a liquidity shock.

## 4.2 Regime Labels

| Regime | Description |
|---|---|
| Risk-On Trend | Equity trend strong, breadth supportive, credit stable, volatility contained |
| Range / Chop | Indexes rotating around value, weak follow-through, mixed breadth |
| Earnings-Driven | Individual company reactions dominate market behavior |
| Inflation / Oil Shock | Oil, commodities, rates, or inflation expectations dominate |
| Growth Scare | Equities weak, credit weak, defensive assets stronger |
| Liquidity Stress | Spreads widen, volatility jumps, credit weakens, market depth fragile |
| Volatility Compression | Realized and implied volatility compressed before catalyst |
| Volatility Spike | IV and realized volatility elevated after shock |
| Crowded Factor Unwind | Momentum/quality/AI/mega-cap leaders selling together |
| Policy Intervention | Fed/government/geopolitical intervention alters prior assumptions |

## 4.3 Regime Markers

| Marker | PASS Condition |
|---|---|
| Equity trend | SPY/QQQ above rising 50/200-day averages |
| Breadth | More stocks/sectors confirming index move |
| Credit | HYG/LQD stable or improving |
| Rates | Rate move supports current equity regime |
| Dollar | Dollar move not pressuring risk assets unless thesis requires it |
| Oil | Oil move not creating inflation shock unless thesis requires it |
| Volatility | VIX and realized volatility consistent with strategy type |
| Financial stress | OFR/Fed stress indicators stable or improving |
| Cross-asset confirmation | Rates, credit, oil, gold, dollar tell same story |
| Liquidity | Spreads and volume support normal execution |

## 4.4 Regime Output

```json
{
  "regime_label": "Risk-On Trend",
  "confidence": 2,
  "supporting_markers": ["SPY above 50/200 DMA", "credit stable", "VIX contained"],
  "conflicting_markers": ["breadth weakening"],
  "strategy_bias": ["momentum", "trend", "relative strength"],
  "strategies_to_reduce": ["short volatility if IV too low", "aggressive mean reversion shorts"]
}
```

---

# 5. Strategy Marker Playbooks

Each strategy family must have a confluence checklist. The Strategy Agent should not say "valid setup" unless enough independent markers align.

## 5.1 Trend Following

### Strategy Question

Is price moving persistently, and is the market accepting the move?

### Required Markers

| Marker | Bullish PASS | Bearish PASS |
|---|---|---|
| Price structure | Higher highs/higher lows | Lower highs/lower lows |
| Moving averages | Price above rising 20/50/200 DMA | Price below falling 20/50/200 DMA |
| Relative strength | Outperforming SPY and sector | Underperforming SPY and sector |
| Volume | Breakout on rising relative volume | Breakdown on rising relative volume |
| Auction | Acceptance above VAH/new value higher | Acceptance below VAL/new value lower |
| Anchored VWAP | Above catalyst/low anchored VWAP | Below catalyst/high anchored VWAP |
| Breadth | Peer/sector confirmation | Peer/sector weakness |
| Options liquidity | Tight spreads, usable volume/OI | Tight spreads, usable volume/OI |
| Invalidation | Clear trailing level | Clear reclaim level |

### Regime Fit

| Regime | Fit |
|---|---|
| Risk-On Trend | Strong |
| Range / Chop | Weak |
| Liquidity Stress | Weak unless defensive/downtrend |
| Crowded Factor Unwind | Caution |

### Vetoes

- Repeated failed breakouts
- Price returns to POC after every move
- Sector divergence
- Spread/liquidity too poor
- Major event within holding window that invalidates trend logic

## 5.2 Momentum / Relative Strength

### Strategy Question

Are winners still attracting capital?

### Required Markers

| Marker | PASS Condition |
|---|---|
| Relative strength | Asset outperforming benchmark and sector |
| Momentum | Positive 3m/6m/12m momentum |
| Earnings/revisions | Upward earnings revision or positive catalyst |
| Volume | Abnormal volume confirms move |
| Auction | Acceptance above prior value |
| Anchored VWAP | Price above event anchored VWAP |
| Breadth | Peers and sector confirm |
| Crowding | Not dangerously crowded or late-stage |
| Valuation context | Valuation not absurdly detached from cash flow |
| Risk | Loss of relative strength or anchored VWAP defined as invalidation |

### Vetoes

- Good news stops moving price higher
- Credit weakens while high-beta leaders rally
- Narrow leadership with collapsing breadth
- Same ticker dominates all narratives/watchlists
- Options IV already pricing heroic move

## 5.3 Mean Reversion

### Strategy Question

Has price moved too far from value, and is exhaustion/rejection visible?

### Required Markers

| Marker | PASS Condition |
|---|---|
| Stretch | Price far from VWAP, POC, moving average, or pair mean |
| Auction | Failed breakout/breakdown and return into value |
| Volume | Climax volume followed by no follow-through |
| Catalyst | News does not permanently impair asset |
| Volatility | Vol elevated but stabilizing |
| Relative strength | Asset stabilizing vs sector/market |
| Fundamentals | Business can survive shock |
| Liquidity | Spreads not exploding |
| Risk | Invalidation beyond failed auction extreme |

### Vetoes

- Price accepts lower value and POC migrates lower
- Fundamental impairment
- Liquidity crisis
- Negative revisions accelerate
- Mean reversion attempted against strong macro trend

## 5.4 PEAD / Earnings Drift / Analyst Revisions

### Strategy Question

Did the market underreact to earnings information?

### Required Bullish Markers

| Marker | PASS Condition |
|---|---|
| Earnings surprise | Positive EPS/revenue surprise |
| Guidance | Raised or constructive guidance |
| Revisions | Analyst estimates move upward |
| Quality | Operating cash flow supports earnings |
| Accruals | Low accrual risk |
| Price reaction | Gap holds or advances after report |
| Anchored VWAP | Price above earnings anchored VWAP |
| Auction | Builds value above prior VAH or POC |
| Sector | Peer/sector confirmation |
| Options | IV crush does not break selected structure |

### Required Bearish Markers

| Marker | PASS Condition |
|---|---|
| Earnings surprise | Negative surprise |
| Guidance | Guidance cut or demand warning |
| Revisions | Estimates move downward |
| Quality | Cash conversion weak |
| Price reaction | Failed bounce or gap down holds |
| Anchored VWAP | Price below earnings anchored VWAP |
| Auction | Value builds below prior VAL |
| Sector | Peer weakness confirms |

### Vetoes

- Beat sold aggressively and stays below anchored VWAP
- Macro dominates individual earnings
- One-time accounting item drives surprise
- Options premium too expensive for directional thesis

## 5.5 Value / Quality / Cash-Flow Quality

### Strategy Question

Is the company underpriced relative to durable cash generation?

### Required Markers

| Marker | PASS Condition |
|---|---|
| Operating cash flow | Durable and recurring |
| Free cash flow | Strong FCF and FCF margin |
| Cash conversion | OCF tracks/exceeds net income |
| Capital intensity | Capex manageable relative to cash generation |
| Margins | Stable or expanding |
| ROIC/ROE | High and durable |
| Balance sheet | Manageable leverage, strong interest coverage |
| Revenue durability | Subscription, membership, repeat demand, toll-road, ecosystem |
| Valuation | Reasonable vs history and peers |
| Revisions | Stable or improving |
| Auction | Pullback holds major value area/anchored VWAP |
| Crowding | Quality not priced as invincible |

### Vetoes

- FCF deteriorating
- Debt/refinancing risk rising
- Regulatory or legal risk threatens business model
- Valuation assumes perfection
- Good business but bad entry price

## 5.6 Carry

### Strategy Question

Am I being paid enough to hold this exposure?

### Required Markers

| Marker | PASS Condition |
|---|---|
| Carry source | Yield, dividend, roll yield, option premium, spread |
| Volatility | Realized volatility contained |
| Trend | Position not fighting strong adverse trend |
| Macro | Rates/currency/inflation supportive |
| Liquidity | Exit liquidity strong |
| Crowding | Carry trade not dangerously crowded |
| Drawdown test | Position can survive historical stress |
| Correlation | Does not become highly correlated with risk assets in crisis |
| Risk | Stop, hedge, or drawdown cap defined |

### Vetoes

- Volatility spike
- Credit stress
- Liquidity deterioration
- Crowded unwind
- Carry income too small for tail risk

## 5.7 Volatility Selling / Options Income

### Strategy Question

Is implied volatility high enough to compensate for the risk?

### Covered Call Markers

> **TBD — Options chain data source not configured.** IV and Liquidity markers require live options data. Use manual Fidelity review until a provider is integrated.

| Marker | PASS Condition |
|---|---|
| Underlying | Shares already owned |
| Strike | Strike is acceptable sale price |
| Auction | Price near VAH/HVN/resistance |
| IV | **TBD** — Premium attractive vs normal (manual Fidelity check) |
| Trend | Upside slowing or stalling |
| Catalyst | No uncontrolled upside catalyst unless acceptable |
| Liquidity | **TBD** — Tight spreads, good OI/volume (manual Fidelity check) |
| Risk | Opportunity cost and downside share risk accepted |

### Cash-Secured Put Markers

> **TBD — Options chain data source not configured.** IV and Liquidity markers require live options data. Use manual Fidelity review until a provider is integrated.

| Marker | PASS Condition |
|---|---|
| Ownership | Willing to own shares at strike |
| Strike | Strike below support/value zone |
| Auction | Price near VAL/HVN/support and stabilizing |
| IV | **TBD** — Premium attractive vs normal (manual Fidelity check) |
| Fundamentals | Underlying passes quality screen |
| Catalyst | Event risk understood |
| Liquidity | **TBD** — Tight spreads, good OI/volume (manual Fidelity check) |
| Risk | Assignment and downside risk accepted |

### Vetoes

- Selling premium before unresolved binary event without intention
- Illiquid options
- Strike chosen only for premium, not thesis
- Underlying fails quality/liquidity screen
- IV high because realized risk may be even higher

## 5.8 Long Volatility / Tail Risk / Macro Vol

### Strategy Question

Is the market underpricing the size of a possible move?

### Required Markers

| Marker | PASS Condition |
|---|---|
| Event | Clear catalyst exists |
| IV vs realized | IV not already excessive |
| Term structure | Near-term vol not fully panicked |
| Price compression | Range/coiling before event |
| Macro stress | Cross-asset divergence or stress building |
| Liquidity | Options tradeable |
| Payoff | Convex payoff, max loss known |
| Timing | Expiration covers catalyst |
| Exit | Profit-taking and stop rules defined |
| Sizing | Premium loss budgeted |

### Vetoes

- IV already exploded
- Expiration too short for thesis
- Event outcome not likely to move selected asset
- Bid/ask spread too wide
- Oversized premium bet

## 5.9 Pairs / Relative Value

### Strategy Question

Is one asset unusually rich or cheap relative to a related asset?

### Required Markers

| Marker | PASS Condition |
|---|---|
| Economic link | Clear relationship between assets |
| Statistical link | Rolling correlation/cointegration stable |
| Spread stretch | Z-score meaningful |
| Hedge ratio | Updated and sensible |
| Catalyst | Reason for convergence or continuation |
| Regime | Macro supports pair logic |
| Liquidity | Both legs tradeable |
| Idiosyncratic risk | No hidden single-name landmine |
| Auction | Cheap leg stabilizing or rich leg rejecting |
| Risk | Relationship-break rule defined |

### Pair Type Tag

Each pair must be tagged as:

- Mean-Reverting Pair
- Relative Momentum Pair
- Macro Regime Pair
- Commodity Spread Pair
- Credit Stress Pair
- Defensive/Risk-On Pair

### Vetoes

- Correlation collapse
- Structural business change
- One leg has major company-specific event
- Spread widened for valid permanent reason
- Liquidity too poor in one leg

## 5.10 Macro Event / Scenario Trading

### Strategy Question

Which liquid market best expresses the complex shock?

### Required Markers

| Marker | PASS Condition |
|---|---|
| Event definition | Specific event, not vague fear |
| Transmission map | Direct and second-order effects defined |
| Proxy quality | Liquid and directly related |
| Scenario tree | Threat, partial shock, full shock, resolution |
| Market confirmation | Related assets confirm |
| Auction | Proxy accepts move, not just headline spike |
| Options pricing | Expected move not excessive |
| Cross-asset confirmation | Oil/rates/dollar/gold/credit align |
| Policy risk | Intervention considered |
| Risk | Position small or convex when uncertainty high |

### Vetoes

- Event too vague
- Proxy too indirect
- Options already price extreme move
- No cross-asset confirmation
- Trade depends on predicting too many dominoes

## 5.11 Structural Flow

### Strategy Question

Is mechanical buying/selling likely to affect price?

### Required Markers

| Marker | PASS Condition |
|---|---|
| Known flow | Index rebalance, ETF flow, OPEX, buyback window |
| Size | Flow large relative to average volume |
| Timing | Calendar known |
| Confirmation | Volume/order imbalance appears |
| Auction | Price accepts flow direction |
| Crowding | Not universally front-run |
| Liquidity | Good enough to trade, not so deep effect is diluted |
| Options | OI/gamma levels relevant |
| Exit | Flow effect exit defined |
| Risk | Flow failure rule defined |

### Vetoes

- Macro shock overwhelms flow
- Flow already priced
- Crowding/front-running obvious
- No observable confirmation

## 5.12 Auction / Volume Profile / TPO Execution

### Strategy Question

Where is price accepted, rejected, or repricing?

### Required Markers

| Marker | PASS Condition |
|---|---|
| Value location | Price relative to VAH, VAL, POC known |
| Volume nodes | HVN/LVN zones identified |
| TPO | Time acceptance measured |
| Anchored VWAP | Event VWAP calculated |
| Acceptance | Time/volume builds beyond level |
| Rejection | Probe fails and returns into value |
| Relative volume | Participation confirms |
| Catalyst | Reason for movement known |
| Liquidity | Spread/depth acceptable |
| Invalidation | Clear reclaim/loss level |

### Vetoes

- Old profile used after major regime shock
- Price in LVN with no plan
- Entry depends only on one candle pattern
- Liquidity/spreads poor

---

# 6. Crowding Agent

## 6.1 Purpose

Detect when too many participants, models, ETFs, bots, or narratives may be concentrated in the same trade.

## 6.2 Crowding Markers

| Marker | Warning Condition |
|---|---|
| Narrative concentration | Same tickers dominate news/social/research |
| Factor concentration | Momentum/quality/AI leaders overlap heavily |
| ETF concentration | Heavy flows into same sectors/themes |
| Options clustering | Huge OI at obvious strikes |
| Gamma risk | Price near large options hedging levels |
| Liquidity mismatch | Position size high relative to volume |
| Model monoculture | Same public signals/templates likely used |
| Good news failure | Positive news no longer lifts price |
| Exit door risk | Support/stop/VWAP levels obvious to many traders |

## 6.3 Crowding Output

```json
{
  "crowding_score": 2,
  "crowding_label": "Moderate",
  "warnings": ["narrative concentration", "large options OI near current price"],
  "impact": "cap setup score and require tighter invalidation"
}
```

---

# 7. Risk Agent

## 7.1 Hard Veto Conditions

The Risk Agent may block any setup regardless of other scores.

| Veto | Description |
|---|---|
| No invalidation | Setup has no clear wrong point |
| Poor liquidity | Spreads too wide or volume too low |
| Oversized exposure | Loss exceeds allowed budget |
| Binary event | Uncontrolled event risk not priced into plan |
| Data missing | Required data unavailable |
| Stale data | Data too old for decision |
| Strategy-regime mismatch | Strategy does not fit current regime |
| Crowding extreme | Exit risk too high |
| Options mismatch | Option structure does not match thesis |
| Thesis unclear | Setup cannot name its edge type |

## 7.2 Position Risk Fields

Every setup must include:

```json
{
  "max_loss": "",
  "position_size_rule": "",
  "invalidation_level": "",
  "target_zone": "",
  "time_horizon": "",
  "event_risk": "",
  "liquidity_notes": "",
  "option_assignment_risk": "",
  "theta_decay_risk": "",
  "crowding_exit_risk": ""
}
```

---

# 8. Scoring Model

## 8.1 Setup Score

Each setup is scored 0 to 30.

| Category | Score |
|---|---:|
| Regime alignment | 0-3 |
| Macro alignment | 0-3 |
| Strategy-specific signal | 0-3 |
| Catalyst/fundamental support | 0-3 |
| Auction confirmation | 0-3 |
| Volume/participation | 0-3 |
| Liquidity/execution quality | 0-3 |
| Options/volatility fit | 0-3 |
| Crowding risk inverse score | 0-3 |
| Risk/reward and invalidation | 0-3 |

## 8.2 Score Interpretation

| Total | Action |
|---:|---|
| 0-12 | No trade |
| 13-18 | Watchlist only |
| 19-23 | Small/limited-risk expression |
| 24-27 | Valid setup |
| 28-30 | Strong setup, still size responsibly |

## 8.3 Regime Shock Rule

If a sudden regime change is detected, cap all setup scores at 18 until one full review cycle confirms the new environment.

---

# 9. Orchestrator Review Process

## 9.1 Orchestrator Tasks

The Orchestrator must:

1. Confirm all required data pulls completed.
2. Confirm all specialist agents returned marker statuses.
3. Identify conflicting markers.
4. Assign final regime label.
5. Apply risk vetoes.
6. Cap scores during regime shock.
7. Approve or reject each setup for final report.
8. Ensure each promoted setup names:
   - edge type
   - strategy family
   - signal evidence
   - trade expression
   - invalidation
   - risk notes

## 9.2 Conflict Resolution

When agents disagree, the Orchestrator should apply this hierarchy:

1. Risk vetoes override everything
2. Regime mismatch overrides strategy signal
3. Liquidity/execution failure blocks trade expression
4. Fundamental impairment overrides mean reversion
5. Options pricing mismatch blocks options trade
6. Auction confirmation improves timing but does not replace thesis

## 9.3 Orchestrator Output

```json
{
  "date": "YYYY-MM-DD",
  "regime": "Range / Chop",
  "approved_setups": [],
  "watchlist_setups": [],
  "rejected_setups": [],
  "risk_vetoes": [],
  "missing_data": [],
  "summary": ""
}
```

---

# 10. Final Streamlined Report

The Report Agent may only generate the final report after Orchestrator approval.

## 10.1 Report Sections

```markdown
# Daily Market Strategy Report

## 1. Regime Summary
- Regime:
- Confidence:
- Key confirming markers:
- Key conflicts:

## 2. Macro Dashboard
- Rates:
- Dollar:
- Oil:
- Gold:
- Credit:
- Volatility:
- Financial stress:

## 3. Approved Setups
### Ticker / Pair / Asset
- Strategy:
- Edge Type:
- Setup Score:
- Marker Status:
- Thesis:
- Auction Location:
- Options/Fidelity Notes:
- Invalidation:
- Risk Notes:
- Agent Review Summary:

## 4. Watchlist Setups
- Setup:
- Missing markers:
- Required confirmation:

## 5. Rejected / Vetoed Setups
- Setup:
- Reason:
- Veto source:

## 6. Crowding and Flow Warnings
- Concentrated trades:
- Options/gamma risks:
- ETF/sector flows:

## 7. Action Summary
- No-trade conditions:
- Alerts to set:
- Human review notes:
```

---

# 11. Daily Agent Checklists

## 11.1 Data Pull Agent Checklist

- [ ] Pull daily OHLCV
- [ ] Pull intraday bars
- [ ] Pull sector/ETF data
- [ ] Pull fundamentals
- [ ] Pull earnings calendar and surprise data
- [ ] Pull analyst revision data if available
- [ ] Pull macro indicators
- [ ] Pull volatility indicators
- [ ] Pull options data or request manual Fidelity review (**TBD** — no options data source configured)
- [ ] Pull news/catalyst data
- [ ] Validate timestamps
- [ ] Flag missing/stale data

## 11.2 Regime Agent Checklist

- [ ] Classify equity trend
- [ ] Check breadth
- [ ] Check credit
- [ ] Check rates
- [ ] Check dollar
- [ ] Check oil
- [ ] Check gold
- [ ] Check volatility
- [ ] Check financial stress
- [ ] Assign regime label
- [ ] Recommend favored/reduced strategies

## 11.3 Strategy Agent Checklist

- [ ] Evaluate trend setups
- [ ] Evaluate momentum setups
- [ ] Evaluate mean reversion setups
- [ ] Evaluate PEAD/earnings drift setups
- [ ] Evaluate value/quality setups
- [ ] Evaluate carry setups
- [ ] Evaluate volatility selling setups
- [ ] Evaluate long volatility setups
- [ ] Evaluate pairs/relative value setups
- [ ] Evaluate macro event setups
- [ ] Evaluate structural flow setups
- [ ] Tag edge type for each setup

## 11.4 Auction Agent Checklist

- [ ] Calculate Volume Profile
- [ ] Calculate TPO approximation
- [ ] Identify VAH/VAL/POC
- [ ] Identify HVNs/LVNs
- [ ] Calculate VWAP
- [ ] Calculate anchored VWAPs
- [ ] Flag acceptance/rejection
- [ ] Rebuild profiles after major shocks
- [ ] Provide entry/exit decision zones

## 11.5 Options Agent Checklist

> **TBD — No options chain data source configured.** All items below require manual Fidelity review until a provider (e.g. Tradier, Polygon.io options, or CBOE data feed) is integrated. The confluence scorer marks Dimension 8 as `MISSING` with score 0 until this is resolved. Practical scoring ceiling is 27/30.

- [ ] Check option chain liquidity (**TBD** — manual Fidelity review)
- [ ] Check bid/ask spread (**TBD** — manual Fidelity review)
- [ ] Check volume/open interest (**TBD** — manual Fidelity review)
- [ ] Check IV/IV rank if available (**TBD** — manual Fidelity review)
- [ ] Estimate expected move (**TBD** — manual Fidelity review)
- [ ] Match strategy to Tier I permissions
- [ ] Flag assignment risk
- [ ] Flag theta decay risk
- [ ] Reject illiquid structures

## 11.6 Crowding Agent Checklist

- [ ] Check narrative concentration
- [ ] Check sector/ETF concentration
- [ ] Check factor crowding
- [ ] Check options OI/gamma clusters
- [ ] Check good-news/bad-price-action behavior
- [ ] Check exit-door risk
- [ ] Assign crowding score
- [ ] Recommend score cap if needed

## 11.7 Risk Agent Checklist

- [ ] Confirm invalidation level
- [ ] Confirm max loss
- [ ] Confirm position size rule
- [ ] Confirm liquidity
- [ ] Confirm options risks
- [ ] Confirm event risks
- [ ] Apply vetoes
- [ ] Confirm setup can name edge type
- [ ] Confirm setup fits regime

---

# 12. Data Model

## 12.1 Setup Object

```json
{
  "id": "ticker_strategy_date",
  "ticker_or_pair": "",
  "asset_type": "",
  "strategy_family": "",
  "edge_type": "",
  "regime_label": "",
  "setup_score": 0,
  "marker_status": {
    "regime": "",
    "macro": "",
    "strategy": "",
    "auction": "",
    "options": "",
    "crowding": "",
    "risk": ""
  },
  "supporting_markers": [],
  "conflicting_markers": [],
  "missing_data": [],
  "vetoes": [],
  "trade_expression": "",
  "invalidation_level": "",
  "time_horizon": "",
  "max_loss": "",
  "notes": ""
}
```

## 12.2 Agent Result Object

```json
{
  "agent_name": "",
  "timestamp": "",
  "status": "PASS/WATCH/FAIL/CONFLICT/MISSING/VETO",
  "confidence": 0,
  "markers_met": [],
  "markers_failed": [],
  "conflicts": [],
  "missing_data": [],
  "recommendation": "",
  "notes": ""
}
```

---

# 13. Alert System

## 13.1 Alerts to Generate

| Alert Type | Trigger |
|---|---|
| Regime shift | Regime label changes |
| Volatility spike | VIX/realized vol exceeds threshold |
| Credit stress | HYG/LQD weakens materially |
| Oil shock | Oil exceeds daily/weekly move threshold |
| Dollar shock | Dollar breaks major level |
| Earnings drift | Post-earnings price holds above/below anchored VWAP |
| Auction breakout | Price accepts above VAH |
| Auction breakdown | Price accepts below VAL |
| Failed auction | Price leaves value and snaps back |
| Crowding | Crowding score high |
| Options risk | IV spike, spread too wide, OI cluster |
| Data failure | Pull missing/stale |

## 13.2 Alert Severity

| Severity | Meaning |
|---|---|
| LOW | Informational |
| MEDIUM | Watchlist update |
| HIGH | Requires Orchestrator review |
| CRITICAL | Freeze new setups until reviewed |

---

# 14. Implementation Notes

## 14.1 Suggested Repo Structure

```text
strategy-monitor/
  README.md
  .env.example
  config/
    tickers.yml
    strategy_weights.yml
    thresholds.yml
    data_sources.yml
  data/
    raw/
    processed/
    reports/
  agents/
    orchestrator.py
    data_pull_agent.py
    regime_agent.py
    macro_agent.py
    strategy_agent.py
    auction_agent.py
    options_agent.py
    crowding_agent.py
    risk_agent.py
    report_agent.py
  indicators/
    volume_profile.py
    tpo_profile.py
    vwap.py
    anchored_vwap.py
    momentum.py
    pair_stats.py
    options_metrics.py
    macro_metrics.py
  tests/
    test_data_pull.py
    test_scoring.py
    test_vetoes.py
  notebooks/
    research/
  reports/
```

## 14.2 Environment Variables

```text
FMP_API_KEY=
FRED_API_KEY=
NEWS_API_KEY=
OFR_DATA_URL=
REPORT_OUTPUT_DIR=
TIMEZONE=America/New_York
```

## 14.3 Scheduling

Run at minimum:

| Time | Task |
|---|---|
| Pre-market | Macro/regime scan, news, earnings, futures/proxies |
| 10:00 AM ET | Opening auction update |
| 12:00 PM ET | Midday check |
| 3:30 PM ET | Closing flow/check |
| After close | Full daily report and journal update |

For longer-term investing only, a single after-close pull may be enough. For options and event-volatility setups, intraday checkpoints matter more.

---

# 15. Human Review Rules

The system should never state "buy" or "sell" as an instruction.

Use:

- Approved for human review
- Watchlist
- Rejected
- Vetoed
- Needs manual Fidelity review
- No trade

The human reviewer must confirm:

- account suitability
- tax impact
- options permissions
- position sizing
- emotional state
- current open positions
- real-time bid/ask spreads

---

# 16. Acceptance Criteria

The build is complete when:

- [ ] Daily data pull works
- [ ] All agents return standardized marker statuses
- [ ] Orchestrator can apply score caps and vetoes
- [ ] Regime changes trigger alerts
- [ ] Each strategy has marker checklist
- [ ] Each setup names edge type and strategy family
- [ ] Final report is generated only after agent review
- [ ] Missing/stale data is clearly flagged
- [ ] No setup reaches final report without invalidation level
- [ ] System logs all decisions for review

---

# 17. Final Operating Rule

The system exists to prevent this failure:

> A single attractive chart, headline, or AI-generated idea becomes a trade without regime, risk, liquidity, and confluence review.

The system should enforce this better rule:

> No setup is actionable until the regime, strategy, auction, options, crowding, and risk agents have all checked their markers and the orchestrator has approved it for human review.
