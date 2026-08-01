---
title: "GEV Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "GEV"
asset_type: "stock"
thesis_name: "AI Power Defense Stack"
related_theses: ["[[AI Power Defense Stack]]"]
date_pulled: "2026-06-23"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.27
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.88
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.68
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "gev"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 27%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 27% confidence. Agent entropy is diffuse (0.88). Drivers: price, fundamentals. Risks: risk. 6 neutral layer(s).
- **Top drivers**: price, fundamentals, macro
- **Top risks**: risk

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.88)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 54%, bearish 13%, neutral 33%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.68)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BULLISH | 83% | 969ms | GEV closed at 1055.6. 7d 16.4%, 30d 1.5%. RSI 56.1, MACD positive. |
| risk | BEARISH | 39% | 231ms | Risk read: 30d vol 51.8%, max drawdown -24.6%, 30d return 1.5%. |
| sentiment | NEUTRAL | 22% | 632ms | 20 headline(s): 1 positive, 1 negative, net score 0. |
| microstructure | NEUTRAL | 27% | 378ms | Volume ratio 0.89x, price change -6.3%, short/float N/A, entropy mixed. |
| macro | BULLISH | 31% | 877ms | Macro backdrop: VIX 17.28, curve 0.27, HY spread 2.6%. |
| fundamentals | BULLISH | 48% | 185ms | Revenue growth 8.9%, net margin 12.8%, trailing FCF 10.9B. |
| auction | NEUTRAL | 22% | 346ms | Auction state: balance. inside value 1042.33–1067.63. Session bars: 245. |
| pair | NEUTRAL | 5% | 13ms | GEV is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 161ms | No recent earnings within 90 days for GEV. |
| prediction_market | NEUTRAL | 12% | 60ms | No relevant prediction markets found for "AI Power Defense Stack". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BULLISH
- **Confidence**: 83%
- **Summary**: GEV closed at 1055.6. 7d 16.4%, 30d 1.5%. RSI 56.1, MACD positive.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: above
  - MACD crossover: positive

```json
{
  "api_symbol": "GEV",
  "bars": 260,
  "close": 1055.6,
  "change_7d_pct": 16.41,
  "change_30d_pct": 1.49,
  "sma20": 985.7465,
  "sma50": 1026.788,
  "sma200": 777.6711,
  "ema21": 1007.7335,
  "rsi14": 56.1,
  "macd": 12.9212,
  "macd_signal": -6.6124,
  "macd_crossover": "positive",
  "bollinger_position": 0.762
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 39%
- **Summary**: Risk read: 30d vol 51.8%, max drawdown -24.6%, 30d return 1.5%.
- **Evidence**:
  - Max drawdown: -24.6%
  - 30d realized volatility: 51.8%
  - Sharpe-like score: 1.63
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5184,
  "realized_vol_90d": 0.5044,
  "max_drawdown_pct": -24.57,
  "atr14": null,
  "change_30d_pct": 1.49,
  "sharpe_like_90d": 1.63,
  "beta": 1.045,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: 20 headline(s): 1 positive, 1 negative, net score 0.
- **Evidence**:
  - Chip Bloodbath Hits Nasdaq 100 As South Korea Plunges: Stock Market Today
  - Fund manager names 3 non-AI stocks to own as Intel, AMD sink amid broader tech rout
  - Is GE Vernova Inc. (GEV) Outperforming Other Oils-Energy Stocks This Year?
  - Is It Worth Investing in GE Vernova (GEV) Based on Wall Street's Bullish Views?
  - Chevron and Microsoft Partner on Landmark Texas AI Power Project

```json
{
  "headline_count": 20,
  "positive_count": 1,
  "negative_count": 1,
  "net_score": 0,
  "sample_headlines": [
    "Chip Bloodbath Hits Nasdaq 100 As South Korea Plunges: Stock Market Today",
    "Fund manager names 3 non-AI stocks to own as Intel, AMD sink amid broader tech rout",
    "Is GE Vernova Inc. (GEV) Outperforming Other Oils-Energy Stocks This Year?",
    "Is It Worth Investing in GE Vernova (GEV) Based on Wall Street's Bullish Views?",
    "Chevron and Microsoft Partner on Landmark Texas AI Power Project"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 27%
- **Summary**: Volume ratio 0.89x, price change -6.3%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 2.4M vs avg 2.7M
  - Market cap: 284.0B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.68) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 1056.69,
  "change_pct": -6.29,
  "volume": 2372372,
  "avg_volume": 2679375,
  "volume_ratio": 0.89,
  "market_cap": 283953736800,
  "beta": 1.045,
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
- **Confidence**: 31%
- **Summary**: Macro backdrop: VIX 17.28, curve 0.27, HY spread 2.6%.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: 0.3%
  - VIX: 17.28
  - HY spread: 2.6%

```json
{
  "DFF": {
    "date": "2026-06-19",
    "value": 3.63
  },
  "T10Y2Y": {
    "date": "2026-06-22",
    "value": 0.27
  },
  "VIXCLS": {
    "date": "2026-06-22",
    "value": 17.28
  },
  "BAMLH0A0HYM2": {
    "date": "2026-06-22",
    "value": 2.65
  }
}
```

## Fundamentals Agent

- **Signal**: BULLISH
- **Confidence**: 48%
- **Summary**: Revenue growth 8.9%, net margin 12.8%, trailing FCF 10.9B.
- **Evidence**:
  - Sector: Utilities
  - Revenue growth: 8.9%
  - Net cash: 7.3B

```json
{
  "company_name": "GE Vernova Inc.",
  "sector": "Utilities",
  "industry": "Renewable Utilities",
  "market_cap": 283953736800,
  "revenue_growth_pct": 8.94,
  "gross_margin_pct": 19.79,
  "net_margin_pct": 12.83,
  "trailing_fcf": 10863000000,
  "cash": 10172000000,
  "total_debt": 2857000000,
  "net_cash": 7315000000,
  "cfq_score": 3.88,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 3.25,
    "fcf_conversion": 5,
    "fcf_margin": 4,
    "capital_intensity": 4,
    "pricing_power": 3.5,
    "balance_sheet": 5,
    "share_count_quality": 4,
    "margin_stability": 1.5
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. inside value 1042.33–1067.63. Session bars: 245.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 1050.7629, VAH: 1067.6348, VAL: 1042.327
  - TPO POC: 1050.7629
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-05-24, bars: 20).

```json
{
  "auction_state": "balance",
  "current_price": 1056.69,
  "poc": 1050.7629,
  "vah": 1067.6348,
  "val": 1042.327,
  "tpo_poc": 1050.7629,
  "avwap": null,
  "avwap_anchor": "2026-05-24",
  "avwap_dist_pct": null,
  "relative_volume": null,
  "session_date": "2026-06-23",
  "session_bar_count": 245,
  "daily_bar_count": 20
}
```

## Pair Agent

- **Signal**: NEUTRAL
- **Confidence**: 5%
- **Summary**: GEV is not in any configured pair watchlist.

```json
{
  "symbol": "GEV",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for GEV.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "GEV",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "AI Power Defense Stack".

```json
{
  "query": "AI Power Defense Stack",
  "market_count": 0,
  "live_enabled": false
}
```

## Source

- **System**: native vault agent puller, no LangChain
- **Agents requested**: price, risk, sentiment, microstructure, macro, fundamentals, auction, pair, pead, prediction-market
- **Prediction markets live API enabled**: false
- **LLM provider**: none
- **Auto-pulled**: 2026-06-23
