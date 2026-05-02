# Options Trading Agent Implementation Guide

## Purpose

Build an AI-assisted options trading analysis project that helps evaluate, size, document, and monitor defined options strategies available at the user's current trading approval tier.

This project is **not** an autonomous trading bot by default. The agent should provide structured analysis, risk calculations, trade plans, alerts, and decision support. Any live order execution should be disabled unless explicitly added later with human approval gates.

## Supported Strategy Set

The agent may only analyze and generate plans for the following option strategies:

1. Buy-writes
2. Sell covered calls
3. Roll covered calls
4. Buy calls
5. Buy puts
6. Sell cash-covered puts
7. Long straddles
8. Long strangles

The agent must reject or flag unsupported strategies, including naked calls, naked puts, credit spreads, debit spreads, iron condors, ratio spreads, butterflies, calendars, diagonals, synthetic stock, and 0DTE strategies unless manually enabled in a future version.

---

# Core Principles

## Primary Objective

The system should answer five questions before any trade is considered:

1. What is the trade thesis?
2. What is the maximum possible loss?
3. What is the break-even price or prices?
4. What is the correct position size based on account risk?
5. What are the entry, exit, and invalidation rules?

## Safety Rules

The agent must never recommend a position that exceeds the user's configured risk limit.

The agent must always show:

- Maximum loss
- Maximum profit, if capped or calculable
- Break-even price or prices
- Estimated capital required
- Position size
- Implied volatility context
- Liquidity checks
- Exit plan
- Assignment risk, where relevant

The agent should treat every trade as a risk-defined business decision, not a prediction carnival.

---

# Project Structure

Recommended repository layout:

```text
/options-agent
  README.md
  .env.example
  config/
    risk_config.yaml
    strategy_rules.yaml
    broker_limits.yaml
  data/
    sample_option_chain.json
    sample_positions.json
  docs/
    strategy_playbook.md
    risk_model.md
    journal_schema.md
  src/
    main.py
    agent/
      planner.py
      prompts.py
      validators.py
      trade_review.py
    data/
      market_data.py
      option_chain.py
      positions.py
      volatility.py
    strategies/
      buy_write.py
      covered_call.py
      roll_covered_call.py
      long_call.py
      long_put.py
      cash_secured_put.py
      long_straddle.py
      long_strangle.py
    risk/
      sizing.py
      breakeven.py
      max_loss.py
      greeks.py
      liquidity.py
      assignment.py
    journal/
      trade_journal.py
      metrics.py
    alerts/
      price_alerts.py
      expiration_alerts.py
      risk_alerts.py
  tests/
    test_position_sizing.py
    test_breakevens.py
    test_strategy_validation.py
    test_risk_limits.py
```

---

# Required Configuration

Create `config/risk_config.yaml`:

```yaml
account:
  account_value: 10000
  max_risk_per_trade_pct: 1.0
  max_total_options_risk_pct: 10.0
  max_single_symbol_exposure_pct: 5.0
  allow_margin: false

position_sizing:
  default_contract_multiplier: 100
  round_down_contracts: true
  minimum_cash_buffer_pct: 10.0

liquidity:
  max_bid_ask_spread_pct: 10.0
  min_open_interest: 100
  min_volume: 10

expiration:
  avoid_new_long_options_inside_days_to_expiration: 14
  warning_days_to_expiration: 21
  covered_call_roll_check_days: 10

risk_controls:
  require_human_confirmation: true
  allow_live_order_execution: false
  block_unsupported_strategies: true
```

Create `config/strategy_rules.yaml`:

```yaml
allowed_strategies:
  - buy_write
  - covered_call
  - roll_covered_call
  - long_call
  - long_put
  - cash_secured_put
  - long_straddle
  - long_strangle

unsupported_strategies:
  - naked_call
  - naked_put
  - credit_spread
  - debit_spread
  - iron_condor
  - iron_fly
  - calendar
  - diagonal
  - butterfly
  - ratio_spread
  - synthetic
  - short_straddle
  - short_strangle
```

---

# Data Inputs

The agent should support these inputs:

## Market Data

Required:

- Underlying ticker
- Current stock price
- Daily price change
- Volume
- 20-day moving average
- 50-day moving average
- 200-day moving average
- Support and resistance levels, if available
- Upcoming earnings date
- Upcoming dividends
- Major scheduled events, if available

## Options Chain Data

Required for each contract:

- Ticker
- Expiration date
- Strike
- Option type: call or put
- Bid
- Ask
- Mid price
- Last price
- Volume
- Open interest
- Implied volatility
- Delta
- Gamma
- Theta
- Vega

## Account and Position Data

Required:

- Account value
- Available cash
- Existing stock positions
- Existing option positions
- Cost basis for owned shares
- Current unrealized gain/loss
- Current buying power

---

# Universal Risk Calculations

## Contract Multiplier

Most U.S. equity options use a 100-share multiplier.

```text
contract_value = option_price * 100 * contracts
```

## Maximum Risk Per Trade

```text
max_trade_risk = account_value * max_risk_per_trade_pct
```

Example:

```text
account_value = 10000
max_risk_per_trade_pct = 1%
max_trade_risk = 100
```

## Position Size

```text
contracts = floor(max_trade_risk / max_loss_per_contract)
```

The agent must round down. If the result is zero, the agent must say the trade does not fit the risk model.

## Liquidity Check

```text
bid_ask_spread_pct = (ask - bid) / mid_price
```

Flag the trade if:

- Bid/ask spread is too wide
- Open interest is too low
- Volume is too low
- Contract is near expiration with poor liquidity

---

# Strategy Modules

## 1. Buy-Write

A buy-write means buying 100 shares of stock and selling one covered call against those shares at the same time.

### Use Case

Use when the outlook is neutral to moderately bullish and the user is willing to sell the shares at the call strike.

### Required Inputs

- Stock price
- Number of shares to buy
- Call strike
- Call premium
- Expiration date
- Dividend date, if any

### Calculations

```text
net_cost_basis = stock_price - call_premium
max_profit_per_share = call_strike - net_cost_basis
max_profit_total = max_profit_per_share * 100 * contracts
break_even = stock_price - call_premium
capital_required = stock_price * 100 * contracts
```

### Risk

Downside risk remains substantial because the user owns the shares.

```text
max_loss_approx = net_cost_basis * 100 * contracts
```

### Entry Conditions

Prefer:

- Stock near support
- Implied volatility elevated enough to make call premium attractive
- User is comfortable owning the shares
- Call strike is near a realistic upside target

### Exit Conditions

Consider exiting or adjusting when:

- Stock reaches or exceeds short call strike
- Covered call reaches 50% to 80% of max profit
- Thesis changes
- Earnings or dividend assignment risk increases

### Agent Output

The agent should produce:

- Net cost basis
- Maximum capped profit
- Break-even
- Assignment risk
- Downside stock risk
- Suggested exit or roll trigger

---

## 2. Sell Covered Calls

A covered call means selling a call option against shares the user already owns.

### Use Case

Use when the user owns at least 100 shares and expects neutral to moderate upside movement.

### Required Inputs

- Current shares owned
- Share cost basis
- Current stock price
- Call strike
- Call premium
- Expiration

### Eligibility Rule

```text
contracts_allowed = floor(shares_owned / 100)
```

The agent must not suggest selling more calls than the number of covered 100-share lots.

### Calculations

```text
premium_received = call_premium * 100 * contracts
adjusted_cost_basis = share_cost_basis - call_premium
break_even = adjusted_cost_basis
max_profit_if_assigned = (call_strike - share_cost_basis + call_premium) * 100 * contracts
```

### Entry Conditions

Prefer:

- Stock has rallied into resistance
- User is willing to sell shares at the strike
- Implied volatility is elevated
- Strike is above cost basis, unless intentionally managing a losing position

### Exit Conditions

Consider closing when:

- 50% to 80% of premium has been captured
- Stock price breaks out strongly above the short call
- User no longer wants assignment risk
- Ex-dividend date creates early assignment risk

### Assignment Risk

Flag higher assignment risk when:

- Call is in the money
- Extrinsic value is low
- Ex-dividend date is near
- Expiration is close

---

## 3. Roll Covered Calls

Rolling a covered call means closing the current short call and opening another covered call, usually at a later expiration and/or different strike.

### Use Case

Use when a covered call is challenged, near expiration, or has already captured most of its premium.

### Required Inputs

Current call:

- Short call strike
- Expiration
- Current option price to close
- Original premium received

New call:

- New strike
- New expiration
- Premium received

### Calculations

```text
cost_to_close = current_call_ask * 100 * contracts
new_premium = new_call_bid * 100 * contracts
net_roll_credit_or_debit = new_premium - cost_to_close
```

If positive, it is a net credit roll. If negative, it is a net debit roll.

### Roll Types

#### Roll Up and Out

Use when the stock has moved higher and the user wants more upside room.

#### Roll Out Same Strike

Use when the user wants more time and more premium but is still comfortable selling at the same strike.

#### Roll Down and Out

Use cautiously. This creates more premium but caps upside at a lower strike.

### Roll Evaluation

The agent should evaluate:

- Net credit or debit
- New break-even
- Additional time added
- Additional upside created or removed
- Assignment risk reduced or increased
- Whether rolling improves the trade or only delays accepting a loss

### Exit Conditions

Recommend not rolling if:

- The user wants to sell the shares anyway
- The roll requires paying too much debit
- The new strike is below the user's acceptable sale price
- The position thesis is broken

---

## 4. Buy Calls

A long call is a bullish directional trade with defined risk.

### Use Case

Use when the user expects a strong upward move before expiration.

### Required Inputs

- Strike
- Premium
- Expiration
- Current stock price
- Target stock price
- Implied volatility
- Delta
- Theta

### Calculations

```text
max_loss = premium * 100 * contracts
break_even = strike + premium
intrinsic_value_at_target = max(0, target_price - strike)
estimated_profit_at_target = (intrinsic_value_at_target - premium) * 100 * contracts
```

### Entry Conditions

Prefer:

- Breakout above resistance
- Strong trend
- High relative strength
- Implied volatility not excessively inflated
- Enough time until expiration

### Exit Conditions

Consider exiting when:

- Option gains 50% to 100%
- Stock reaches target
- Thesis is invalidated
- Option loses 30% to 50%
- Time decay accelerates near expiration

### Risk Warnings

The agent should warn when:

- Break-even is unrealistic
- Expiration is too close
- Implied volatility is high
- Bid/ask spread is wide
- The option is far out of the money with low delta

---

## 5. Buy Puts

A long put is a bearish directional trade with defined risk.

### Use Case

Use when the user expects a strong downward move before expiration.

### Required Inputs

- Strike
- Premium
- Expiration
- Current stock price
- Target stock price
- Implied volatility
- Delta
- Theta

### Calculations

```text
max_loss = premium * 100 * contracts
break_even = strike - premium
intrinsic_value_at_target = max(0, strike - target_price)
estimated_profit_at_target = (intrinsic_value_at_target - premium) * 100 * contracts
```

### Entry Conditions

Prefer:

- Break below support
- Failed rally
- Weak trend
- Weak sector confirmation
- Implied volatility not already inflated

### Exit Conditions

Consider exiting when:

- Option gains 50% to 100%
- Stock reaches downside target
- Stock reclaims broken support
- Option loses 30% to 50%
- Time decay becomes too aggressive

---

## 6. Sell Cash-Covered Puts

A cash-covered put means selling a put while holding enough cash to buy 100 shares at the strike if assigned.

### Use Case

Use when the user is willing to buy the stock at the strike price.

### Required Inputs

- Current stock price
- Put strike
- Put premium
- Expiration
- Available cash
- User's desired ownership price

### Eligibility Rule

```text
cash_required = strike * 100 * contracts
contracts_allowed = floor(available_cash / (strike * 100))
```

The agent must not suggest more contracts than the user's available cash can secure.

### Calculations

```text
premium_received = put_premium * 100 * contracts
break_even = put_strike - put_premium
max_profit = premium_received
assignment_cost = put_strike * 100 * contracts
net_stock_cost_if_assigned = break_even * 100 * contracts
```

### Risk

The main risk is being assigned shares that continue falling.

```text
max_loss_approx = break_even * 100 * contracts
```

### Entry Conditions

Prefer:

- Stock the user is willing to own
- Strike near or below support
- Implied volatility elevated
- Premium compensates for risk
- No dangerous near-term catalyst unless intentional

### Exit Conditions

Consider closing when:

- 50% to 80% of premium has been captured
- Stock breaks support with momentum
- User no longer wants to own the shares
- Earnings risk changes the thesis

### Agent Warning

The agent must include this warning:

> Do not sell cash-covered puts unless you are willing and able to buy the shares at the strike price.

---

## 7. Long Straddles

A long straddle means buying a call and a put at the same strike and expiration.

### Use Case

Use when the user expects a large move but is unsure of direction.

### Required Inputs

- Call strike
- Put strike
- Call premium
- Put premium
- Expiration
- Current stock price
- Expected move
- Upcoming catalyst

### Eligibility Rule

For a true straddle:

```text
call_strike == put_strike
same_expiration == true
```

### Calculations

```text
total_premium = call_premium + put_premium
max_loss = total_premium * 100 * contracts
upper_break_even = strike + total_premium
lower_break_even = strike - total_premium
```

### Entry Conditions

Prefer:

- Implied volatility is low relative to expected movement
- Large catalyst is expected
- Price is coiled in a tight range
- User expects realized volatility to exceed implied volatility

### Exit Conditions

Consider exiting when:

- One side gains enough to cover most or all of total premium
- Stock makes the expected move
- Implied volatility expands before event
- Implied volatility crush becomes likely after event
- Trade loses 30% to 50% of premium

### Risk Warning

Straddles can lose money even when the trader is directionally right if the move is too small or too slow.

---

## 8. Long Strangles

A long strangle means buying an out-of-the-money call and an out-of-the-money put with the same expiration.

### Use Case

Use when the user expects a large move but wants a cheaper alternative to a straddle.

### Required Inputs

- Call strike
- Put strike
- Call premium
- Put premium
- Expiration
- Current stock price
- Expected move

### Eligibility Rule

For a typical long strangle:

```text
put_strike < current_stock_price < call_strike
same_expiration == true
```

### Calculations

```text
total_premium = call_premium + put_premium
max_loss = total_premium * 100 * contracts
upper_break_even = call_strike + total_premium
lower_break_even = put_strike - total_premium
```

### Entry Conditions

Prefer:

- Low implied volatility
- Large expected move
- Strong upcoming catalyst
- Enough time for movement
- Liquid contracts on both legs

### Exit Conditions

Consider exiting when:

- One leg appreciates enough to cover total premium
- Combined position gains 50% to 100%
- Catalyst passes and IV crush begins
- Price remains trapped between strikes
- Time decay accelerates

---

# Entry Decision Engine

The agent should assign a trade setup score from 0 to 100.

Suggested scoring model:

```yaml
scoring:
  thesis_quality: 20
  risk_reward: 20
  liquidity: 15
  volatility_context: 15
  technical_setup: 15
  event_risk: 10
  account_fit: 5
```

## Score Interpretation

```text
80-100: Strong candidate for review
65-79: Acceptable but requires caution
50-64: Weak or incomplete setup
Below 50: Reject or wait
```

The agent should never treat score alone as permission to trade.

---

# Exit Decision Engine

The agent should monitor open positions and produce one of these actions:

1. Hold
2. Take partial profit
3. Close for profit
4. Close for loss
5. Roll, if covered call only
6. Prepare for assignment
7. No action, but alert user

## Universal Exit Triggers

Profit-based:

```text
long_options_profit_target = 50% to 100%
covered_call_profit_capture = 50% to 80%
cash_secured_put_profit_capture = 50% to 80%
straddle_strangle_profit_target = 50% to 100%
```

Loss-based:

```text
long_options_loss_limit = 30% to 50% of premium
straddle_strangle_loss_limit = 30% to 50% of total premium
covered_call_loss_is_stock_based = evaluate underlying thesis
cash_secured_put_loss_is_assignment_based = evaluate willingness to own
```

Time-based:

```text
warn_inside_21_DTE = true
avoid_new_long_options_inside_14_DTE = true
review_short_options_inside_10_DTE = true
```

Thesis-based:

The agent must recommend closing or reducing risk when the original trade thesis is invalidated.

---

# AI Agent Prompt Template

Use this as the main system or developer instruction for the trading assistant agent:

```text
You are an options trading analysis agent. Your role is to evaluate trades, calculate risk, size positions, identify entry and exit conditions, and produce clear trade plans.

You are not allowed to place trades unless live execution is explicitly enabled and confirmed by the user.

You may only analyze these strategies:
- Buy-writes
- Covered calls
- Covered call rolls
- Long calls
- Long puts
- Cash-covered puts
- Long straddles
- Long strangles

For every trade idea, you must calculate:
- Strategy type
- Thesis
- Maximum loss
- Maximum profit, if calculable
- Break-even price or prices
- Capital required
- Position size based on account risk
- Liquidity quality
- Implied volatility context
- Entry trigger
- Exit trigger
- Assignment risk, if applicable
- Reasons to reject the trade

If a trade exceeds account risk limits, reject it.
If the strategy is unsupported, reject it.
If data is missing, ask for the missing data or mark the analysis as incomplete.
Do not use vague recommendations. Every output must include numbers, conditions, and a clear action label.
```

---

# Trade Plan Output Format

Every analyzed trade should return this structure:

```markdown
## Trade Review: [Ticker] [Strategy]

### Summary
- Action: Watch / Enter / Reject / Close / Roll
- Strategy: 
- Thesis: 
- Confidence Score: 

### Market Context
- Current Price: 
- Trend: 
- Support: 
- Resistance: 
- Upcoming Events: 

### Option Contract Details
- Expiration: 
- Strike(s): 
- Premium: 
- Delta: 
- IV: 
- Bid/Ask: 
- Volume: 
- Open Interest: 

### Risk Calculations
- Max Loss: 
- Max Profit: 
- Break-even: 
- Capital Required: 
- Recommended Contracts: 
- Account Risk %: 

### Entry Plan
- Entry Trigger: 
- Invalid Entry Conditions: 

### Exit Plan
- Profit Target: 
- Stop/Loss Trigger: 
- Time-Based Exit: 
- Thesis Invalidated If: 

### Assignment Risk
- Applies: Yes/No
- Notes: 

### Final Decision
- Decision: 
- Reason: 
```

---

# Trade Journal Schema

Create a persistent trade journal using JSON, CSV, SQLite, or Postgres.

Minimum fields:

```yaml
trade_id:
date_opened:
date_closed:
ticker:
strategy:
thesis:
entry_price_underlying:
exit_price_underlying:
expiration:
strike_calls:
strike_puts:
premium_paid:
premium_received:
contracts:
max_loss:
max_profit:
break_even:
entry_reason:
exit_reason:
planned_exit:
actual_exit:
pnl_dollars:
pnl_percent:
rule_followed: true/false
mistake_tag:
notes:
```

## Mistake Tags

Use standardized tags:

```yaml
mistake_tags:
  - oversized_position
  - ignored_exit_plan
  - chased_entry
  - earnings_iv_crush
  - poor_liquidity
  - wrong_strategy_for_iv
  - held_too_close_to_expiration
  - assignment_unplanned
  - thesis_unclear
  - emotional_trade
```

---

# Backtesting and Review Metrics

The agent should calculate monthly performance metrics:

```text
win_rate = winning_trades / total_trades
average_win = total_profit_from_winners / winning_trades
average_loss = total_loss_from_losers / losing_trades
expectancy = (win_rate * average_win) - (loss_rate * average_loss)
profit_factor = gross_profit / gross_loss
```

Also track:

- Best strategy by expectancy
- Worst strategy by expectancy
- Average days held
- Average planned risk vs actual loss
- Number of rule violations
- PnL by ticker
- PnL by strategy
- PnL by market condition

---

# Implementation Tasks for Coding Agent

## Phase 1: Risk Calculator

Build core calculators for:

- Long call max loss and break-even
- Long put max loss and break-even
- Covered call break-even and max assignment profit
- Cash-secured put break-even and assignment cost
- Buy-write net basis and capped upside
- Long straddle break-evens
- Long strangle break-evens
- Position sizing by account risk

Acceptance criteria:

- All formulas have unit tests
- Contracts always round down
- Trades that exceed risk limits are rejected
- Unsupported strategies are rejected

## Phase 2: Strategy Analyzer

Build one analyzer per strategy.

Each analyzer should return:

- Trade summary
- Risk calculations
- Liquidity score
- Entry quality score
- Exit plan
- Warning flags
- Final action label

Acceptance criteria:

- Every allowed strategy has its own analyzer
- Analyzer output matches the trade plan format
- Missing data is clearly flagged

## Phase 3: Data Integration

Connect to market and option-chain data.

Potential data providers:

- Broker API
- Polygon.io
- Tradier
- Alpaca
- Interactive Brokers
- Yahoo Finance for limited prototyping only

Acceptance criteria:

- Option chain can be fetched by ticker and expiration
- Current positions can be loaded manually or through broker integration
- Data freshness timestamp is displayed
- Stale data is rejected or warned

## Phase 4: Position Monitor

Build a monitor for open positions.

Monitor should check:

- Current PnL
- Distance to break-even
- Distance to strike
- Days to expiration
- Assignment risk
- Profit target reached
- Loss threshold reached
- Roll opportunity for covered calls

Acceptance criteria:

- Alerts are generated for profit target, loss threshold, expiration risk, and assignment risk
- Covered call rolls are evaluated with net credit/debit
- Long options are flagged when theta/time decay risk increases

## Phase 5: Trade Journal

Build journal storage and review dashboards.

Acceptance criteria:

- Every trade plan can be saved before entry
- Closing notes can be added
- PnL and expectancy are calculated
- Rule violations are tracked
- Monthly review summary can be generated

---

# Guardrails

## Hard Rejections

Reject trade if:

- Strategy is unsupported
- Position size exceeds risk limit
- Bid/ask spread is too wide
- Open interest is below minimum
- Required cash is unavailable
- Covered call is not actually covered
- Cash-covered put is not cash secured
- Break-even requires unrealistic price movement
- Earnings/event risk is present but not acknowledged

## Soft Warnings

Warn user if:

- Option expires soon
- IV is unusually high for long options
- IV is unusually low for premium-selling strategies
- Delta is very low
- Trade has poor reward/risk
- User is concentrating too much in one ticker
- Assignment would create unwanted exposure

---

# Example Agent Workflow

```text
User: Analyze selling a cash-covered put on XYZ at the $50 strike for $1.20 premium, expiring in 35 days. Account value is $10,000 and available cash is $6,000.

Agent:
1. Validate strategy: cash-covered put is allowed.
2. Check cash requirement: $50 * 100 = $5,000 per contract.
3. Confirm one contract is allowed by available cash.
4. Calculate premium: $1.20 * 100 = $120.
5. Calculate break-even: $50 - $1.20 = $48.80.
6. Estimate max downside exposure: $4,880 if stock went to zero after assignment.
7. Compare with user willingness to own shares.
8. Check liquidity and IV.
9. Produce trade plan.
10. Recommend Enter / Watch / Reject.
```

---

# Suggested User Interface

A simple dashboard should include:

## Trade Builder

- Ticker input
- Strategy dropdown
- Expiration selector
- Strike selector
- Premium input or live quote
- Account risk setting
- Calculate button

## Risk Panel

- Max loss
- Max profit
- Break-even
- Capital required
- Recommended contracts
- Risk as percent of account

## Strategy Fit Panel

- Bullish/bearish/neutral fit
- IV fit
- Liquidity score
- Event risk
- Assignment risk

## Position Monitor

- Open trades
- PnL
- Days to expiration
- Distance to strike
- Suggested action

## Journal

- Trade notes
- Thesis
- Entry reason
- Exit reason
- Mistake tags
- Performance metrics

---

# Final Implementation Rule

The agent should be boring, strict, and repeatable.

It should not try to predict the market with theatrical confidence. Its job is to prevent oversized trades, bad structures, unclear exits, and accidental assignment disasters.

The ideal output is not “this trade will win.”

The ideal output is:

```text
This trade fits your rules, risks $X, breaks even at $Y, should be entered only if Z happens, and should be exited if A, B, or C occurs.
```

That is the entire magic trick: turn option trading from fog and fireworks into arithmetic, rules, and review.
