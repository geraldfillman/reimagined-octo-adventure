---
title: "NRG Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "NRG"
asset_type: "stock"
thesis_name: "AI Power Infrastructure"
related_theses: ["[[AI Power Infrastructure]]"]
date_pulled: "2026-04-28"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.26
synthesis_mode: "deterministic"
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "nrg"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 26%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 26% confidence. Drivers: sentiment, macro. Risks: risk, price. 2 neutral layer(s).
- **Top drivers**: sentiment, macro
- **Top risks**: risk, price, microstructure

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 57% | 2016ms | NRG closed at 155.93. 7d -7.0%, 30d 2.3%. RSI 47.8, MACD negative. |
| risk | BEARISH | 45% | 2190ms | Risk read: 30d vol 51.6%, max drawdown -23.3%, 30d return 2.3%. |
| sentiment | BULLISH | 70% | 1041ms | 20 headline(s): 5 positive, 1 negative, net score 6. |
| microstructure | BEARISH | 31% | 1690ms | Volume ratio 0.23x, price change -2.7%, short/float N/A. |
| macro | BULLISH | 36% | 1234ms | Macro backdrop: VIX 18.02, curve 0.57, HY spread 2.9%. |
| fundamentals | NEUTRAL | 26% | 1347ms | Revenue growth 9.2%, net margin 2.8%, trailing FCF 766.0M. |
| prediction_market | NEUTRAL | 12% | 446ms | No relevant prediction markets found for "AI Power Infrastructure". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 57%
- **Summary**: NRG closed at 155.93. 7d -7.0%, 30d 2.3%. RSI 47.8, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: below
  - MACD crossover: negative

```json
{
  "api_symbol": "NRG",
  "bars": 260,
  "close": 155.93,
  "change_7d_pct": -7.04,
  "change_30d_pct": 2.26,
  "sma20": 158.534,
  "sma50": 160.3308,
  "sma200": 159.7533,
  "ema21": 158.0575,
  "rsi14": 47.81,
  "macd": 0.1248,
  "macd_signal": 0.6017,
  "macd_crossover": "negative",
  "bollinger_position": 0.415
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 45%
- **Summary**: Risk read: 30d vol 51.6%, max drawdown -23.3%, 30d return 2.3%.
- **Evidence**:
  - Max drawdown: -23.3%
  - 30d realized volatility: 51.6%
  - Sharpe-like score: 0.09
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5156,
  "realized_vol_90d": 0.4819,
  "max_drawdown_pct": -23.26,
  "atr14": null,
  "change_30d_pct": 2.26,
  "sharpe_like_90d": 0.09,
  "beta": 1.338,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 70%
- **Summary**: 20 headline(s): 5 positive, 1 negative, net score 6.
- **Evidence**:
  - NRG Energy, Inc. Announces Early Results of Cash Tender Offer and Consent Solicitation
  - Here's Why NRG Energy (NRG) is a Strong Growth Stock
  - Cwm LLC Has $4.51 Million Stake in NRG Energy, Inc. $NRG
  - NRG Energy Inc (NRG) Stock Down 4.7% but Still Overvalued -- GF Score: 81/100
  - NRG Energy, Inc. Announces Quarterly Dividend

```json
{
  "headline_count": 20,
  "positive_count": 5,
  "negative_count": 1,
  "net_score": 6,
  "sample_headlines": [
    "NRG Energy, Inc. Announces Early Results of Cash Tender Offer and Consent Solicitation",
    "Here's Why NRG Energy (NRG) is a Strong Growth Stock",
    "Cwm LLC Has $4.51 Million Stake in NRG Energy, Inc. $NRG",
    "NRG Energy Inc (NRG) Stock Down 4.7% but Still Overvalued -- GF Score: 81/100",
    "NRG Energy, Inc. Announces Quarterly Dividend"
  ]
}
```

## Microstructure Agent

- **Signal**: BEARISH
- **Confidence**: 31%
- **Summary**: Volume ratio 0.23x, price change -2.7%, short/float N/A.
- **Evidence**:
  - Volume: 633.0K vs avg 2.7M
  - Market cap: 33.4B
  - Short percent float: N/A
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 155.875,
  "change_pct": -2.67,
  "volume": 633045,
  "avg_volume": 2742324,
  "volume_ratio": 0.23,
  "market_cap": 33444072375,
  "beta": 1.338,
  "short_pct_float": null
}
```

## Macro Agent

- **Signal**: BULLISH
- **Confidence**: 36%
- **Summary**: Macro backdrop: VIX 18.02, curve 0.57, HY spread 2.9%.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: 0.6%
  - VIX: 18.02
  - HY spread: 2.9%

```json
{
  "DFF": {
    "date": "2026-04-24",
    "value": 3.64
  },
  "T10Y2Y": {
    "date": "2026-04-27",
    "value": 0.57
  },
  "VIXCLS": {
    "date": "2026-04-27",
    "value": 18.02
  },
  "BAMLH0A0HYM2": {
    "date": "2026-04-24",
    "value": 2.86
  }
}
```

## Fundamentals Agent

- **Signal**: NEUTRAL
- **Confidence**: 26%
- **Summary**: Revenue growth 9.2%, net margin 2.8%, trailing FCF 766.0M.
- **Evidence**:
  - Sector: Utilities
  - Revenue growth: 9.2%
  - Net cash: -12.0B

```json
{
  "company_name": "NRG Energy, Inc.",
  "sector": "Utilities",
  "industry": "Independent Power Producers",
  "market_cap": 33444072375,
  "revenue_growth_pct": 9.17,
  "gross_margin_pct": 21.85,
  "net_margin_pct": 2.81,
  "trailing_fcf": 766000000,
  "cash": 4738000000,
  "total_debt": 16766000000,
  "net_cash": -12028000000
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "AI Power Infrastructure".

```json
{
  "query": "AI Power Infrastructure",
  "market_count": 0,
  "live_enabled": false
}
```

## Source

- **System**: native vault agent puller, no LangChain
- **Agents requested**: price, risk, sentiment, microstructure, macro, fundamentals, prediction-market
- **Prediction markets live API enabled**: false
- **LLM provider**: none
- **Auto-pulled**: 2026-04-28
