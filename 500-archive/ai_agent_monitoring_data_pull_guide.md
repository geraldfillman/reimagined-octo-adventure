# AI Agent Monitoring and Data Pull Instruction Guide

**Created:** 2026-05-01  
**Purpose:** Instructions for setting up a monitoring and data-pull system that helps an AI agent evaluate the frameworks discussed in the chat: auction-market structure, Volume Profile, TPO, VWAP, timing windows, strategy-to-edge classification, PEAD/anomalies, pairs, macro volatility, cash-flow quality, AI crowding risk, and options strategy mapping.

> This system is designed for **research, monitoring, alerting, and decision support only**. It should not place trades automatically. Keep brokerage execution manual through Fidelity or another broker. The agent should inform, rank, summarize, and journal. The human decides.

---

## 1. System Principles

### Core Rules

1. **Read-only first.** No automated trading, no broker-write permissions, no unattended orders.
2. **Human-in-the-loop.** Every alert should produce a thesis card, not a trade command.
3. **Separate signal from action.** A signal means “review this,” not “trade this.”
4. **Tag edge type.** Every idea must say whether it is behavioral, risk premium, structural, information, execution, statistical, or crowding-related.
5. **Require invalidation.** No setup is complete without a condition that proves it wrong.
6. **Log everything.** Alerts, signals, decisions, non-decisions, and outcomes should be journaled.
7. **Prefer liquid instruments.** Avoid strategies whose edge disappears into spreads, slippage, or options illiquidity.
8. **Detect crowding.** The agent should explicitly ask whether too many participants may be seeing the same signal.

---

## 2. Data Sources

### Primary Data Sources

| Source | Role | Notes |
|---|---|---|
| **FMP API** | Prices, intraday candles, fundamentals, financial statements, earnings, profiles, quotes, market data | Main system feed for watchlists, indicators, anomaly screens, cash-flow quality, and auction approximations. |
| **Fidelity Active Trader Pro** | Manual execution, option chain, depth of book, time & sales, order ticket | Use manually. Do not automate unless official API permissions exist. |
| **FRED API** | Macro data: rates, inflation, unemployment, spreads, dollar-related series, recession indicators | Good for macro regime dashboard. |
| **OFR Financial Stress Index** | Daily stress regime signal | Useful for liquidity/risk-on/risk-off classification. |
| **Cboe / Options Industry Council** | VIX, options education, volatility products, options references | Good for volatility framework and warnings. |
| **CME Group** | Futures, commodities, rates, spreads, education | Useful for macro/commodity research even if not trading futures. |
| **SEC / FINRA / CFTC** | Rules, investor alerts, complex product risks, day-trading/margin/futures education | Safety and compliance reference layer. |
| **Firm research/blogs** | Macro/factor/strategy framing | AQR, BlackRock, JPM, PIMCO, Vanguard, Research Affiliates, GMO, Robeco, Bridgewater, Man, Two Sigma, etc. |
| **News/OSINT feeds** | Event and macro context | Use reputable sources; record source and timestamp. |

### Official Documentation Links to Verify

- FMP developer docs: `https://site.financialmodelingprep.com/developer/docs`
- FMP batch quote docs: `https://site.financialmodelingprep.com/developer/docs/stable/batch-quote`
- FMP historical market data: `https://site.financialmodelingprep.com/datasets/market-data-historic`
- FRED API docs: `https://fred.stlouisfed.org/docs/api/fred/`
- FRED series observations: `https://fred.stlouisfed.org/docs/api/fred/series_observations.html`
- OFR Financial Stress Index: `https://www.financialresearch.gov/financial-stress-index/`
- Fidelity ATP Directed Trade help: `https://www.fidelity.com/products/atbt/help/ActiveTraderTools_Trade_Help.html`
- Fidelity ATP option chain help: `https://www.fidelity.com/products/atbt/help/ActiveTraderTools_Option_Chain_Help.html`
- Cboe VIX products: `https://www.cboe.com/tradable-products/vix/`
- SEC/FINRA warnings on volatility-linked products: `https://www.sec.gov/` and `https://www.finra.org/`

---

## 3. Architecture

### Recommended Components

```text
market-agent/
  config/
    watchlists.yaml
    strategy_thresholds.yaml
    macro_series.yaml
    alert_rules.yaml
  data/
    raw/
    processed/
    database.sqlite
  notebooks/
    exploratory_research.ipynb
    anomaly_tests.ipynb
    pair_research.ipynb
  src/
    fmp_client.py
    fred_client.py
    macro_client.py
    transforms.py
    auction_features.py
    anomaly_features.py
    pair_features.py
    quality_features.py
    options_manual.py
    crowding_features.py
    scoring.py
    alerts.py
    journal.py
    reports.py
  reports/
    daily_market_brief.md
    weekly_strategy_review.md
    ticker_cards/
  prompts/
    daily_scan_prompt.md
    ticker_brief_prompt.md
    macro_event_prompt.md
    post_trade_review_prompt.md
  tests/
    test_transforms.py
    test_scoring.py
```

### Flow

```text
Data Pull
  -> Clean/Normalize
  -> Feature Calculation
  -> Strategy Classification
  -> Score/Rank
  -> Alert Generation
  -> AI Thesis Card
  -> Human Review
  -> Manual Fidelity Execution, if any
  -> Journal Outcome
  -> Weekly Review
```

---

## 4. Watchlists

### Core ETF/Macro Watchlist

```yaml
indexes:
  - SPY
  - QQQ
  - IWM
  - DIA

sectors:
  - XLK
  - XLE
  - XLF
  - KRE
  - XLY
  - XLP
  - XLU
  - XLI
  - SMH
  - XBI

rates_credit:
  - TLT
  - IEF
  - SHY
  - HYG
  - LQD
  - TIP

commodities_safe_haven:
  - GLD
  - SLV
  - USO
  - UNG
  - UUP

volatility:
  - VIX_REFERENCE_ONLY
```

### Pair Watchlist

```yaml
index_pairs:
  - [SPY, QQQ]
  - [SPY, IWM]
  - [QQQ, IWM]

sector_pairs:
  - [XLY, XLP]
  - [XLE, XLK]
  - [XLF, KRE]
  - [XLU, XLK]

credit_rate_pairs:
  - [HYG, LQD]
  - [TLT, IEF]

commodity_pairs:
  - [GLD, SLV]
  - [USO, XLE]

equity_pairs:
  - [KO, PEP]
  - [V, MA]
  - [HD, LOW]
  - [XOM, CVX]
  - [JPM, BAC]
  - [COST, WMT]
```

### Cash-Flow Quality Watchlist

```yaml
cash_flow_quality:
  digital_payment_rails:
    - V
    - MA
  data_indices_ratings:
    - SPGI
    - MCO
    - MSCI
    - FDS
    - FICO
  software_workflow:
    - MSFT
    - ADBE
    - INTU
    - ADP
    - PAYX
    - NOW
    - ORCL
  consumer_habit:
    - AAPL
    - COST
    - MCD
    - KO
    - PEP
    - PG
  market_infrastructure:
    - CME
    - ICE
    - NDAQ
  capital_allocator:
    - BRK.B
  powerful_but_headline_sensitive:
    - META
    - AMZN
    - NVDA
    - AVGO
    - UNH
    - ACN
```

---

## 5. Database Schema

Use SQLite or Postgres. Start simple.

### `prices_daily`

| Column | Type | Notes |
|---|---|---|
| symbol | text | Ticker |
| date | date | Trading date |
| open | real | Daily open |
| high | real | Daily high |
| low | real | Daily low |
| close | real | Daily close |
| adj_close | real | Adjusted close if available |
| volume | integer | Daily volume |
| vwap | real | If source provides |
| source | text | FMP, etc. |
| pulled_at | datetime | Data timestamp |

### `prices_intraday`

| Column | Type |
|---|---|
| symbol | text |
| datetime | datetime |
| interval | text |
| open | real |
| high | real |
| low | real |
| close | real |
| volume | integer |
| source | text |
| pulled_at | datetime |

### `fundamentals_quarterly`

| Column | Type |
|---|---|
| symbol | text |
| fiscal_period | text |
| fiscal_date | date |
| revenue | real |
| gross_profit | real |
| operating_income | real |
| net_income | real |
| operating_cash_flow | real |
| capital_expenditures | real |
| free_cash_flow | real |
| total_assets | real |
| total_debt | real |
| shares_outstanding | real |

### `earnings_events`

| Column | Type |
|---|---|
| symbol | text |
| earnings_date | date |
| eps_actual | real |
| eps_estimate | real |
| eps_surprise_pct | real |
| revenue_actual | real |
| revenue_estimate | real |
| revenue_surprise_pct | real |
| post_1d_return | real |
| post_5d_return | real |
| post_20d_return | real |
| anchored_vwap_status | text |

### `auction_features`

| Column | Type |
|---|---|
| symbol | text |
| as_of | date |
| anchor | text |
| profile_start | datetime |
| profile_end | datetime |
| volume_poc | real |
| tpo_poc | real |
| vah | real |
| val | real |
| current_location | text |
| anchored_vwap | real |
| distance_to_avwap_pct | real |
| auction_state | text |

### `pair_metrics`

| Column | Type |
|---|---|
| pair_id | text |
| symbol_a | text |
| symbol_b | text |
| as_of | date |
| ratio | real |
| ratio_z_20 | real |
| ratio_z_60 | real |
| ratio_z_120 | real |
| corr_60 | real |
| corr_120 | real |
| beta_120 | real |
| half_life | real |
| status | text |

### `strategy_scores`

| Column | Type |
|---|---|
| symbol_or_pair | text |
| as_of | date |
| edge_type | text |
| strategy_family | text |
| score | real |
| confidence | real |
| evidence | text |
| risk_flags | text |
| suggested_review | text |

### `alerts`

| Column | Type |
|---|---|
| alert_id | text |
| created_at | datetime |
| symbol_or_pair | text |
| severity | text |
| alert_type | text |
| message | text |
| data_snapshot | text |
| reviewed | boolean |
| decision | text |

### `trade_journal`

| Column | Type |
|---|---|
| journal_id | text |
| date | date |
| symbol | text |
| strategy_family | text |
| edge_type | text |
| thesis | text |
| signal | text |
| entry_plan | text |
| invalidation | text |
| max_loss | real |
| action_taken | text |
| outcome | text |
| lessons | text |

---

## 6. Data Pull Schedule

### Daily Schedule

| Time | Task |
|---|---|
| **6:30-8:00 AM ET** | Pull macro, futures/proxy moves, premarket quotes if available, news/event calendar. |
| **8:25-8:45 AM ET** | Flag major macro releases: CPI, jobs, PPI, FOMC, GDP, oil inventories. |
| **9:30-9:45 AM ET** | Observe opening range; avoid noisy auto-alert spam. |
| **9:45-11:00 AM ET** | Intraday auction scan: VWAP reclaim/fail, opening range break, relative volume, gap behavior. |
| **11:30 AM-2:00 PM ET** | Lower-frequency monitoring only; flag exceptional moves. |
| **2:00-3:30 PM ET** | Continuation/reversal scan. |
| **3:30-4:15 PM ET** | Closing flow notes, end-of-day quotes, daily feature updates. |
| **After close** | Full scoring, reports, watchlist updates, journal prompts. |

### Weekly Schedule

| Day | Task |
|---|---|
| Friday after close | Weekly strategy review, pair stability report, macro regime update. |
| Sunday | Next-week event calendar, earnings list, macro event risk map. |
| Monthly | Rebalance research watchlists, review crowding, review strategy performance. |

---

## 7. Feature Calculations

### Relative Volume

```text
relative_volume = current_volume / average_volume_same_period_or_20d
```

Use both:

- Daily relative volume: today’s volume vs 20-day average.
- Intraday relative volume: current intraday cumulative volume vs average cumulative volume at same time.

### Anchored VWAP

For bars after an anchor event:

```text
anchored_vwap = sum(price_i * volume_i) / sum(volume_i)
```

Use typical price:

```text
typical_price = (high + low + close) / 3
```

Anchors:

- Earnings date
- Gap date
- Breakout date
- Major low/high
- Fed/CPI/jobs date
- Commodity shock date

### Volume Profile Approximation From Intraday Candles

Because intraday bars do not show tick-level volume-at-price, use an approximation:

1. Pull 1-min or 5-min OHLCV bars.
2. Create price bins.
3. For each candle, distribute volume across bins between low and high.
4. Sum volume by bin.
5. Highest-volume bin = Volume POC.
6. Expand around POC until approximately 70% of volume captured = value area.
7. Upper boundary = VAH; lower boundary = VAL.

Pseudo-code:

```python
def approximate_volume_profile(bars, bin_size):
    # bars columns: high, low, close, volume
    min_price = bars["low"].min()
    max_price = bars["high"].max()
    bins = create_price_bins(min_price, max_price, bin_size)
    volume_by_bin = {b: 0 for b in bins}

    for _, row in bars.iterrows():
        touched = [b for b in bins if row["low"] <= b <= row["high"]]
        if not touched:
            continue
        allocation = row["volume"] / len(touched)
        for b in touched:
            volume_by_bin[b] += allocation

    return volume_by_bin
```

### TPO Profile Approximation

1. Use same price bins.
2. For each candle, mark every bin touched.
3. Add 1 count for each touched bin per interval.
4. Highest-count bin = TPO POC.

```python
def approximate_tpo_profile(bars, bin_size):
    bins = create_price_bins(bars["low"].min(), bars["high"].max(), bin_size)
    tpo_counts = {b: 0 for b in bins}

    for _, row in bars.iterrows():
        for b in bins:
            if row["low"] <= b <= row["high"]:
                tpo_counts[b] += 1

    return tpo_counts
```

### Auction State Classification

| Condition | Auction state |
|---|---|
| Current price inside VAH/VAL and near POC | Balance |
| Price above VAH and holding above anchored VWAP | Bullish acceptance |
| Price below VAL and below anchored VWAP | Bearish acceptance |
| Price breaks above VAH then closes back inside value | Failed upside auction |
| Price breaks below VAL then reclaims value | Failed downside auction |
| POC/value area migrates higher over multiple sessions | Value migration higher |
| POC/value area migrates lower over multiple sessions | Value migration lower |
| Price moving through LVN with high relative volume | Imbalance / fast terrain |

### Pair Metrics

```text
ratio = price_A / price_B
z_score = (ratio - rolling_mean(ratio, window)) / rolling_std(ratio, window)
```

Track:

- ratio_z_20
- ratio_z_60
- ratio_z_120
- rolling correlation 60/120
- beta/hedge ratio
- half-life
- pair status: stable, stretched, trending, broken

### Cash-Flow Quality Score

Score each 0-5:

| Factor | Calculation idea |
|---|---|
| OCF durability | 3-5 year OCF growth/stability |
| FCF conversion | FCF / net income |
| FCF margin | FCF / revenue |
| Capital intensity | Capex / revenue |
| Recurring revenue | Manual/company classification |
| Pricing power | Gross margin stability + revenue growth |
| Balance sheet | Net debt / EBITDA, interest coverage |
| Shareholder quality | Share count trend, buybacks funded by FCF |
| Margin stability | Operating margin trend |
| Narrative fragility | Manual risk tag |

Composite:

```text
cash_flow_quality_score =
  0.15 * ocf_durability +
  0.15 * fcf_conversion +
  0.10 * fcf_margin +
  0.10 * capital_intensity_inverse +
  0.10 * recurring_revenue +
  0.10 * pricing_power +
  0.10 * balance_sheet +
  0.05 * share_count_quality +
  0.10 * margin_stability +
  0.05 * low_narrative_fragility
```

### PEAD / Earnings Drift Feature

Flag a PEAD-style candidate when:

```text
earnings_surprise_positive = eps_surprise_pct > threshold
post_event_acceptance = current_price > anchored_vwap_from_earnings
price_not_overextended = distance_from_avwap < max_threshold
quality_filter = cash_flow_quality_score >= threshold
revision_filter = analyst_revisions >= 0 if available
```

Potential labels:

- `positive_drift_candidate`
- `negative_drift_candidate`
- `failed_positive_surprise`
- `overreaction_watch`
- `needs_manual_transcript_review`

### Crowding Risk Score

Score 0-5:

| Factor | Signal |
|---|---|
| Narrative crowding | High media/social/news frequency |
| ETF flow crowding | Large sector/ETF flow if available |
| Options crowding | OI concentrated at obvious strikes |
| Factor crowding | Name appears in many momentum/quality/growth screens |
| Market concentration | Top-heavy leadership |
| Short-interest crowding | High short interest + viral attention |
| Liquidity fragility | Spread widening, low depth, high gap risk |
| Agent monoculture risk | Same ticker likely surfaced by common screens/prompts |
| Exit risk | Low volume relative to position size |
| Valuation crowding | High multiple plus universal optimism |

Composite:

```text
crowding_risk_score = average(factors)
```

Interpretation:

| Score | Meaning |
|---|---|
| 0-1 | Low obvious crowding |
| 2 | Normal crowding |
| 3 | Monitor |
| 4 | High crowding; entry requires stronger confirmation |
| 5 | Exit-door risk; avoid or size very small |

---

## 8. Strategy Modules

### Module A: Auction Entry Monitor

Inputs:

- Intraday candles
- Volume Profile
- TPO Profile
- VWAP/anchored VWAP
- Relative volume
- Prior day/week value areas

Outputs:

- Balance
- Breakout acceptance
- Failed auction
- Value migration
- LVN fast-terrain warning
- HVN support/resistance decision zone

Alert examples:

```yaml
auction_alerts:
  breakout_acceptance:
    condition: "price > vah and price > anchored_vwap and relative_volume > 1.5"
    message: "Price is above value and holding above anchored VWAP with participation."
  failed_upside_auction:
    condition: "price_crossed_above_vah_today and current_price < vah"
    message: "Upside auction failed; higher prices rejected."
  val_reclaim:
    condition: "price_crossed_below_val_today and current_price > val"
    message: "Failed downside auction; lower prices rejected."
```

### Module B: Momentum / Relative Strength Monitor

Inputs:

- 20/50/200-day moving averages
- 3/6/12-month returns
- Sector relative strength
- Pair ratios

Outputs:

- Trend aligned
- Momentum leader
- Relative strength improving
- Potential crowded momentum warning

Alert examples:

```yaml
momentum_alerts:
  leader_confirmation:
    condition: "return_3m_rank > 80 and price > sma_50 and sma_50 > sma_200"
    message: "Momentum leader with trend alignment."
  leadership_break:
    condition: "price < sma_50 and relative_strength_20d < 0"
    message: "Leadership may be weakening."
```

### Module C: Mean Reversion / Pair Monitor

Inputs:

- Pair z-scores
- Rolling correlation
- Volume Profile
- Catalyst filter
- Macro regime

Outputs:

- Mean reversion candidate
- Relative trend candidate
- Broken relationship warning

Alert examples:

```yaml
pair_alerts:
  stretched_stable_pair:
    condition: "abs(z_60) > 2 and corr_120 > 0.65"
    message: "Pair spread stretched while relationship remains stable."
  relationship_break:
    condition: "corr_120 < 0.35 or beta_shift > threshold"
    message: "Pair relationship may be broken; do not assume reversion."
```

### Module D: PEAD / Anomaly Monitor

Inputs:

- Earnings surprise
- Post-earnings returns
- Anchored VWAP from earnings
- Cash-flow quality
- Revisions if available
- Volume/relative volume

Outputs:

- Positive drift candidate
- Failed earnings reaction
- Quality earnings drift
- Value trap warning

Alert examples:

```yaml
pead_alerts:
  quality_positive_drift:
    condition: "eps_surprise_pct > 5 and price > earnings_avwap and cash_flow_quality_score >= 4"
    message: "Positive surprise with auction acceptance and quality support."
  failed_earnings_beat:
    condition: "eps_surprise_pct > 5 and price < earnings_avwap and post_5d_return < 0"
    message: "Positive surprise failed to hold; market may reject the beat."
```

### Module E: Macro Volatility Monitor

Inputs:

- FRED macro series
- OFR stress index
- SPY/QQQ/IWM
- TLT/IEF/SHY
- HYG/LQD
- GLD/SLV
- USO/XLE
- VIX reference if available
- Event calendar

Outputs:

- Calm expansion
- Inflation shock
- Growth scare
- Liquidity stress
- Geopolitical/commodity shock
- Credit stress

Alert examples:

```yaml
macro_alerts:
  credit_stress:
    condition: "HYG_LQD_ratio < rolling_low_60 and OFR_FSI > 0"
    message: "Credit stress rising; reduce confidence in risk-on equity signals."
  oil_shock_watch:
    condition: "USO_return_5d > 8 and XLE_relative_strength > 0"
    message: "Oil shock channel active; review energy, transports, inflation-sensitive assets."
  liquidity_stress:
    condition: "OFR_FSI > 1 and SPY_below_50d and HYG_LQD_weak"
    message: "Liquidity/risk stress regime; avoid short-vol complacency."
```

### Module F: Options Strategy Mapper

Inputs:

- Underlying view
- Auction location
- IV/expected move if available
- Options liquidity from Fidelity manual review
- User permissions
- Position ownership status

Outputs:

| Condition | Possible Tier I strategy |
|---|---|
| Own shares, price near VAH/HVN resistance, willing to sell | Covered call |
| Want to own shares lower, price near VAL/HVN support, premium acceptable | Cash-secured put |
| Bullish breakout accepted above value | Shares or long call |
| Bearish rejection/failure | Long put |
| Big event, direction unclear, expected move underpriced | Long straddle/strangle |
| Price chopping around POC | Usually avoid directional options |

Manual Fidelity checklist:

- Bid/ask spread acceptable?
- Open interest acceptable?
- Volume acceptable?
- Strike near logical auction level?
- Expiration matches thesis?
- Max loss acceptable?
- Assignment acceptable for CSP/covered call?
- Earnings/dividend dates checked?

---

## 9. Scoring Framework

### Score Categories

| Category | Weight |
|---|---:|
| Edge clarity | 15 |
| Strategy fit | 10 |
| Auction confirmation | 15 |
| Volume/participation | 10 |
| Trend/regime alignment | 10 |
| Fundamental/cash-flow quality | 10 |
| Catalyst/event support | 10 |
| Liquidity/execution quality | 10 |
| Crowding risk adjustment | -10 to 0 |
| Defined risk/invalidation | 10 |

### Example Score Output

```json
{
  "symbol": "MSFT",
  "as_of": "YYYY-MM-DD",
  "edge_type": ["information", "execution", "behavioral"],
  "strategy_family": "quality earnings drift",
  "score": 78,
  "confidence": 0.64,
  "evidence": [
    "positive earnings surprise",
    "price above earnings anchored VWAP",
    "cash flow quality score above threshold",
    "relative volume above normal"
  ],
  "risk_flags": [
    "AI capex narrative sensitivity",
    "valuation not cheap",
    "crowding score elevated"
  ],
  "suggested_review": "Review manually. Consider shares/long call only if options spread is acceptable and price holds above AVWAP."
}
```

---

## 10. AI Agent Prompts

### Daily Scan Prompt

```markdown
You are a market research assistant. Use today's processed data to create a decision-support briefing.

For each alert:
1. Identify the edge type.
2. Identify the strategy family.
3. Summarize the signal.
4. Explain what could invalidate the setup.
5. Identify liquidity/execution concerns.
6. Note whether the idea appears crowded.
7. Suggest manual review actions only. Do not recommend automatic trading.

Output sections:
- Market regime
- Top auction alerts
- Top anomaly/PEAD alerts
- Top pair/relative-value alerts
- Macro volatility watch
- Cash-flow-quality watchlist changes
- Options review candidates
- No-trade warnings
```

### Ticker Brief Prompt

```markdown
Create a one-page research card for {{symbol}}.

Include:
- Business/cash-flow quality snapshot
- Current price location versus trend
- Volume Profile/TPO/VWAP status
- Earnings/event context
- Strategy family tags
- Edge type tags
- Crowding risk
- Options liquidity review checklist for Fidelity
- Bull/base/bear scenario
- Invalidation criteria
- Journal note template

Do not provide a final trade instruction. Provide a research decision card.
```

### Macro Event Prompt

```markdown
Analyze the macro event: {{event}}.

Build a transmission map:
1. First-order effects
2. Second-order effects
3. Third-order effects
4. Liquid proxies
5. Pair/relative-value expressions
6. Options/volatility expressions
7. Data to monitor
8. What would confirm the scenario
9. What would invalidate it
10. Crowding risks

End with a watchlist and alert rules.
```

### Post-Trade / Post-Alert Review Prompt

```markdown
Review this alert/trade idea after outcome data is available.

Assess:
- Was the edge type correctly identified?
- Did the strategy family fit the regime?
- Did auction confirmation help or fail?
- Was the entry/exit timing reasonable?
- Were spreads/slippage acceptable?
- Did crowding matter?
- What should be changed in the signal rules?
```

---

## 11. Implementation Sketch

### Environment Variables

```bash
FMP_API_KEY="your_key_here"
FRED_API_KEY="your_key_here"
DATABASE_URL="sqlite:///data/database.sqlite"
```

### Minimal Python Client Sketch

```python
import os
import requests
import pandas as pd

FMP_API_KEY = os.getenv("FMP_API_KEY")
FMP_BASE = "https://financialmodelingprep.com/stable"

def fmp_get(path, params=None):
    params = params or {}
    params["apikey"] = FMP_API_KEY
    url = f"{FMP_BASE}/{path}"
    response = requests.get(url, params=params, timeout=30)
    response.raise_for_status()
    return response.json()

def get_batch_quote(symbols):
    # Verify current FMP endpoint path in official docs before production use.
    symbol_str = ",".join(symbols)
    return fmp_get("batch-quote", {"symbols": symbol_str})

def get_historical_price(symbol, from_date=None, to_date=None):
    params = {}
    if from_date:
        params["from"] = from_date
    if to_date:
        params["to"] = to_date
    return fmp_get(f"historical-price-eod/full/{symbol}", params)

def get_intraday(symbol, interval="5min", from_date=None, to_date=None):
    # Endpoint naming varies by FMP plan/version. Verify in docs.
    params = {"interval": interval}
    if from_date:
        params["from"] = from_date
    if to_date:
        params["to"] = to_date
    return fmp_get(f"historical-chart/{interval}/{symbol}", params)
```

### FRED Client Sketch

```python
FRED_API_KEY = os.getenv("FRED_API_KEY")
FRED_BASE = "https://api.stlouisfed.org/fred"

def fred_series_observations(series_id, observation_start=None):
    params = {
        "series_id": series_id,
        "api_key": FRED_API_KEY,
        "file_type": "json"
    }
    if observation_start:
        params["observation_start"] = observation_start

    response = requests.get(
        f"{FRED_BASE}/series/observations",
        params=params,
        timeout=30
    )
    response.raise_for_status()
    return response.json()["observations"]
```

### Feature Engine Sketch

```python
def rolling_zscore(series, window):
    mean = series.rolling(window).mean()
    std = series.rolling(window).std()
    return (series - mean) / std

def relative_volume(current_volume, avg_volume):
    if avg_volume == 0:
        return None
    return current_volume / avg_volume

def simple_moving_average(series, window):
    return series.rolling(window).mean()

def classify_trend(close):
    sma_50 = simple_moving_average(close, 50)
    sma_200 = simple_moving_average(close, 200)
    if close.iloc[-1] > sma_50.iloc[-1] > sma_200.iloc[-1]:
        return "uptrend"
    if close.iloc[-1] < sma_50.iloc[-1] < sma_200.iloc[-1]:
        return "downtrend"
    return "mixed"
```

---

## 12. Alert Format

Every alert should look like this:

```markdown
# Alert: {{symbol_or_pair}}

**Time:** {{timestamp}}  
**Alert type:** {{alert_type}}  
**Edge type:** {{edge_type}}  
**Strategy family:** {{strategy_family}}  
**Score:** {{score}} / 100  
**Confidence:** {{confidence}}

## Signal
{{signal_summary}}

## Evidence
- {{evidence_1}}
- {{evidence_2}}
- {{evidence_3}}

## Auction / Location
- Price vs POC:
- Price vs VAH/VAL:
- Price vs anchored VWAP:
- Relative volume:

## Risk Flags
- {{risk_flag_1}}
- {{risk_flag_2}}

## Crowding Check
{{crowding_summary}}

## Manual Fidelity Review
- Options chain liquidity:
- Bid/ask spread:
- Open interest:
- Volume:
- Assignment risk:
- Event/dividend risk:

## Invalidation
{{what_would_prove_this_wrong}}

## Suggested Human Action
Review / Watch / Ignore / Journal / Manual broker check.
No automated trade.
```

---

## 13. Safety Rails

### Hard Restrictions

- The agent must not place trades.
- The agent must not store broker passwords.
- The agent must not bypass broker approval levels.
- The agent must not recommend strategies outside approved permissions without labeling them as research-only.
- The agent must not size trades without user-defined portfolio/risk parameters.
- The agent must not call illiquid options “high opportunity” without spread and open-interest warnings.
- The agent must mark all volatility-linked ETPs as complex/risky and not long-term default holdings.

### Risk Warnings to Bake Into Alerts

- Wide bid/ask spread
- Low option volume/open interest
- Earnings/dividend before expiration
- High IV with potential vol crush
- Crowded narrative
- Price extended far from anchored VWAP
- Pair correlation breaking
- Macro event within 24 hours
- Low liquidity / low dollar volume
- Strategy edge not validated

---

## 14. Build Plan

### Phase 1: Read-Only Market Dashboard

**Goal:** Pull FMP prices, build watchlists, compute trend/relative volume.

Deliverables:

- Daily prices
- Quotes
- SMA 20/50/200
- 3/6/12-month returns
- Relative volume
- Daily markdown brief

Acceptance criteria:

- Data pulls without manual intervention.
- Missing data is logged.
- Watchlist report generates daily.

### Phase 2: Auction Feature Engine

**Goal:** Build Volume Profile, TPO approximation, VWAP/anchored VWAP.

Deliverables:

- Intraday candle pulls
- Volume Profile approximation
- TPO approximation
- Anchored VWAP by event
- Auction state labels

Acceptance criteria:

- For at least 20 tickers, system outputs POC, VAH, VAL, AVWAP, and auction state.

### Phase 3: Strategy-to-Edge Classifier

**Goal:** Tag alerts by edge type and strategy family.

Deliverables:

- Edge taxonomy
- Strategy scoring
- Alert format
- Journal template

Acceptance criteria:

- Every alert includes edge type, strategy family, evidence, invalidation, and risk flags.

### Phase 4: Anomaly and Cash-Flow Quality Engine

**Goal:** Add PEAD, earnings drift, accrual/cash-flow quality, quality/profitability.

Deliverables:

- Earnings surprise tracker
- Post-earnings anchored VWAP
- Cash-flow quality score
- Accrual/asset growth/share-count filters

Acceptance criteria:

- System identifies positive/negative earnings drift candidates and quality/value traps.

### Phase 5: Pair / Relative-Value Engine

**Goal:** Track pair ratios, z-scores, correlations, relationship breaks.

Deliverables:

- Pair watchlist
- Ratio/z-score dashboard
- Pair status labels: stable, stretched, trending, broken

Acceptance criteria:

- Pair alert includes z-score, correlation, relationship status, and macro context.

### Phase 6: Macro Volatility Engine

**Goal:** Track macro regime, stress, credit/rates/commodity channels.

Deliverables:

- FRED/OFR data pulls
- Macro proxy dashboard
- Event calendar
- Shock transmission maps

Acceptance criteria:

- Daily report classifies regime and flags macro-volatility channels.

### Phase 7: Options Review Assistant

**Goal:** Convert setup into a Fidelity manual review checklist.

Deliverables:

- Tier I strategy mapper
- Options checklist
- Manual data entry fields for bid/ask/OI/volume/IV

Acceptance criteria:

- No trade recommendation appears without liquidity/spread/assignment/max-loss checklist.

### Phase 8: Review and Learning Loop

**Goal:** Journal outcomes and refine thresholds.

Deliverables:

- Alert outcome tracking
- Weekly review report
- False positive/false negative notes
- Strategy decay/crowding notes

Acceptance criteria:

- Every alert can be reviewed 5/20/60 days later.

---

## 15. Example Strategy Cards

### Example: Quality Earnings Drift

```yaml
name: quality_earnings_drift
edge_type:
  - behavioral
  - information
strategy_family:
  - PEAD
  - quality
required_signals:
  - positive_eps_surprise
  - positive_revenue_surprise_or_guidance
  - price_above_earnings_anchored_vwap
  - cash_flow_quality_score_above_4
  - relative_volume_above_1_5
risk_flags:
  - valuation_extreme
  - high_crowding_score
  - failed_vwap_reclaim
  - options_spreads_wide
possible_expressions:
  - shares
  - long_call
  - cash_secured_put_if_want_to_own_lower
```

### Example: Pair Mean Reversion

```yaml
name: pair_mean_reversion
edge_type:
  - statistical
  - behavioral
strategy_family:
  - pairs
  - relative_value
required_signals:
  - abs(pair_z_60) > 2
  - rolling_corr_120 > 0.65
  - no_major_relationship_breaking_catalyst
  - auction_rejection_at_extreme
risk_flags:
  - correlation_break
  - fundamental_divergence
  - low_liquidity
  - regime_shift
possible_expressions:
  - relative_watch
  - overweight_stronger_leg
  - options_on_one_leg
  - research_only_if_shorting_not_available
```

### Example: Macro Oil Shock

```yaml
name: oil_geopolitical_shock
edge_type:
  - information
  - structural
  - volatility
strategy_family:
  - macro_volatility
  - event_driven
  - relative_value
monitor:
  - USO
  - XLE
  - GLD
  - UUP
  - TLT
  - HYG
  - LQD
  - airlines
  - transports
confirmations:
  - oil_proxy_breaks_above_value_and_holds
  - energy_relative_strength_positive
  - credit_not_breaking_or_breaking_depending_scenario
  - options_expected_move_not_extreme
risk_flags:
  - headline_whipsaw
  - oil_spike_already_priced
  - demand_destruction
  - wide_options_spreads
```

---

## 16. Final Operating Model

The agent should answer these questions every day:

1. What regime are we in?
2. Which edge types are active?
3. Which strategy families are most appropriate?
4. What assets/pairs are showing signals?
5. Is price at a meaningful auction location?
6. Is there a catalyst?
7. Is the trade expression liquid and allowed?
8. Is the idea crowded?
9. What proves the thesis wrong?
10. Should this be reviewed, ignored, or journaled?

The best version of the system is not an “AI trader.” It is a little goblin librarian with a clipboard, guarding you from vague ideas, bad fills, crowded exits, and strategy soup.
