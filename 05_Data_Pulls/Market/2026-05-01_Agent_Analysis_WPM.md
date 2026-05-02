---
title: "WPM Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "WPM"
asset_type: "stock"
thesis_name: "Dalio Style All-Weather Hard Assets"
related_theses: ["[[Dalio Style All-Weather Hard Assets]]"]
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.14
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.96
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.68
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "wpm"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 14%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 14% confidence. Agent entropy is diffuse (0.96). Drivers: fundamentals, macro. Risks: risk, price. 5 neutral layer(s).
- **Top drivers**: fundamentals, macro, sentiment
- **Top risks**: risk, price

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.96)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 46%, bearish 30%, neutral 24%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.68)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 37% | 54ms | WPM closed at 125.84. 7d -13.0%, 30d 3.8%. RSI 37.5, MACD negative. |
| risk | BEARISH | 54% | 307ms | Risk read: 30d vol 48.8%, max drawdown -30.8%, 30d return 3.8%. |
| sentiment | BULLISH | 46% | 436ms | 12 headline(s): 3 positive, 0 negative, net score 3. |
| microstructure | NEUTRAL | 24% | 923ms | Volume ratio 0.69x, price change -0.5%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 99ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 60% | 2025ms | Revenue growth 83.3%, net margin 63.6%, trailing FCF 934.6M. |
| auction | NEUTRAL | 22% | 2308ms | Auction state: balance. at POC 125.62. Session bars: 390. |
| pair | NEUTRAL | 5% | 0ms | WPM is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 2463ms | No recent earnings within 90 days for WPM. |
| prediction_market | NEUTRAL | 12% | 278ms | No relevant prediction markets found for "Dalio Style All-Weather Hard Assets". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 37%
- **Summary**: WPM closed at 125.84. 7d -13.0%, 30d 3.8%. RSI 37.5, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: above
  - MACD crossover: negative

```json
{
  "api_symbol": "WPM",
  "bars": 260,
  "close": 125.84,
  "change_7d_pct": -13.05,
  "change_30d_pct": 3.79,
  "sma20": 139.651,
  "sma50": 140.2458,
  "sma200": 118.3213,
  "ema21": 136.2552,
  "rsi14": 37.48,
  "macd": -2.4435,
  "macd_signal": -0.1429,
  "macd_crossover": "negative",
  "bollinger_position": 0.061
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 54%
- **Summary**: Risk read: 30d vol 48.8%, max drawdown -30.8%, 30d return 3.8%.
- **Evidence**:
  - Max drawdown: -30.8%
  - 30d realized volatility: 48.8%
  - Sharpe-like score: 0.54
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.488,
  "realized_vol_90d": 0.5447,
  "max_drawdown_pct": -30.84,
  "atr14": null,
  "change_30d_pct": 3.79,
  "sharpe_like_90d": 0.54,
  "beta": 1.218,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 46%
- **Summary**: 12 headline(s): 3 positive, 0 negative, net score 3.
- **Evidence**:
  - Wheaton Precious Metals Corp. (WPM) Reports Next Week: Wall Street Expects Earnings Growth
  - Global X Silver ETF Outperforms Sprott Gold ETF in 1 Year Return
  - SIL vs. GDX: Silver Miners Outpaced Gold Miners in 2025. Will It Last?
  - SSRM vs. WPM: Which Stock Is the Better Value Option?
  - Here's Why Wheaton Precious Metals Corp. (WPM) is a Strong Momentum Stock

```json
{
  "headline_count": 12,
  "positive_count": 3,
  "negative_count": 0,
  "net_score": 3,
  "sample_headlines": [
    "Wheaton Precious Metals Corp. (WPM) Reports Next Week: Wall Street Expects Earnings Growth",
    "Global X Silver ETF Outperforms Sprott Gold ETF in 1 Year Return",
    "SIL vs. GDX: Silver Miners Outpaced Gold Miners in 2025. Will It Last?",
    "SSRM vs. WPM: Which Stock Is the Better Value Option?",
    "Here's Why Wheaton Precious Metals Corp. (WPM) is a Strong Momentum Stock"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.69x, price change -0.5%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 1.7M vs avg 2.5M
  - Market cap: 57.1B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.68) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 125.84,
  "change_pct": -0.49,
  "volume": 1716177,
  "avg_volume": 2486588,
  "volume_ratio": 0.69,
  "market_cap": 57138601840,
  "beta": 1.218,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.68,
  "order_flow_entropy_level": "mixed",
  "order_flow_entropy_transitions": 119,
  "order_flow_entropy_method": "15-state sign-volume transition entropy over 1-minute bars",
  "order_flow_entropy_read": "Mid-range transition entropy: order flow structure is present but not strong enough to stand alone."
}
```

## Macro Agent

- **Signal**: BULLISH
- **Confidence**: 36%
- **Summary**: Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: 0.5%
  - VIX: 16.89
  - HY spread: 2.8%

```json
{
  "DFF": {
    "date": "2026-04-30",
    "value": 3.64
  },
  "T10Y2Y": {
    "date": "2026-04-30",
    "value": 0.52
  },
  "VIXCLS": {
    "date": "2026-04-30",
    "value": 16.89
  },
  "BAMLH0A0HYM2": {
    "date": "2026-04-30",
    "value": 2.83
  }
}
```

## Fundamentals Agent

- **Signal**: BULLISH
- **Confidence**: 60%
- **Summary**: Revenue growth 83.3%, net margin 63.6%, trailing FCF 934.6M.
- **Evidence**:
  - Sector: Basic Materials
  - Revenue growth: 83.3%
  - Net cash: 1.1B

```json
{
  "company_name": "Wheaton Precious Metals Corp.",
  "sector": "Basic Materials",
  "industry": "Gold",
  "market_cap": 57138601840,
  "revenue_growth_pct": 83.33,
  "gross_margin_pct": 72.17,
  "net_margin_pct": 63.58,
  "trailing_fcf": 934558387,
  "cash": 1151493633,
  "total_debt": 7890613,
  "net_cash": 1143603020,
  "cfq_score": 3.15,
  "cfq_label": "acceptable",
  "cfq_factors": {
    "ocf_durability": 4,
    "fcf_conversion": 2,
    "fcf_margin": 4,
    "capital_intensity": 0,
    "pricing_power": 4,
    "balance_sheet": 5,
    "share_count_quality": 3,
    "margin_stability": 3
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. at POC 125.62. Session bars: 390.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 125.6174, VAH: 127.1321, VAL: 125.6174
  - TPO POC: 126.1223
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 125.84,
  "poc": 125.6174,
  "vah": 127.1321,
  "val": 125.6174,
  "tpo_poc": 126.1223,
  "avwap": null,
  "avwap_anchor": "2026-04-01",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-05-01",
  "session_bar_count": 390,
  "daily_bar_count": 22
}
```

## Pair Agent

- **Signal**: NEUTRAL
- **Confidence**: 5%
- **Summary**: WPM is not in any configured pair watchlist.

```json
{
  "symbol": "WPM",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for WPM.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "WPM",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "Dalio Style All-Weather Hard Assets".

```json
{
  "query": "Dalio Style All-Weather Hard Assets",
  "market_count": 0,
  "live_enabled": false
}
```

## Source

- **System**: native vault agent puller, no LangChain
- **Agents requested**: price, risk, sentiment, microstructure, macro, fundamentals, auction, pair, pead, prediction-market
- **Prediction markets live API enabled**: false
- **LLM provider**: none
- **Auto-pulled**: 2026-05-01
