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
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BEARISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.36
synthesis_mode: "deterministic"
agent_count: 7
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
tags: ["agent-analysis", "market", "nrg"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 36%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 36% confidence. Drivers: sentiment. Risks: risk, price. 3 neutral layer(s).
- **Top drivers**: sentiment
- **Top risks**: risk, price, microstructure

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 57% | 60ms | NRG closed at 156.49. 7d -6.7%, 30d 2.6%. RSI 48.3, MACD negative. |
| risk | BEARISH | 45% | 307ms | Risk read: 30d vol 51.4%, max drawdown -23.3%, 30d return 2.6%. |
| sentiment | BULLISH | 62% | 436ms | 20 headline(s): 4 positive, 1 negative, net score 5. |
| microstructure | BEARISH | 31% | 739ms | Volume ratio 0.19x, price change -2.4%, short/float N/A. |
| macro | NEUTRAL | 25% | 3296ms | Macro backdrop: VIX N/A, curve N/A, HY spread N/A. |
| fundamentals | NEUTRAL | 26% | 2204ms | Revenue growth 9.2%, net margin 2.8%, trailing FCF 766.0M. |
| prediction_market | NEUTRAL | 12% | 434ms | No relevant prediction markets found for "AI Power Infrastructure". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 57%
- **Summary**: NRG closed at 156.49. 7d -6.7%, 30d 2.6%. RSI 48.3, MACD negative.
- **Evidence**:
  - Close vs SMA50: below
  - Close vs SMA200: below
  - MACD crossover: negative

```json
{
  "api_symbol": "NRG",
  "bars": 260,
  "close": 156.49,
  "change_7d_pct": -6.7,
  "change_30d_pct": 2.63,
  "sma20": 158.562,
  "sma50": 160.342,
  "sma200": 159.7561,
  "ema21": 158.1085,
  "rsi14": 48.34,
  "macd": 0.1695,
  "macd_signal": 0.6107,
  "macd_crossover": "negative",
  "bollinger_position": 0.432
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 45%
- **Summary**: Risk read: 30d vol 51.4%, max drawdown -23.3%, 30d return 2.6%.
- **Evidence**:
  - Max drawdown: -23.3%
  - 30d realized volatility: 51.4%
  - Sharpe-like score: 0.11
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.5141,
  "realized_vol_90d": 0.4814,
  "max_drawdown_pct": -23.26,
  "atr14": null,
  "change_30d_pct": 2.63,
  "sharpe_like_90d": 0.11,
  "beta": 1.338,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 62%
- **Summary**: 20 headline(s): 4 positive, 1 negative, net score 5.
- **Evidence**:
  - NRG Energy, Inc. Announces Early Results of Cash Tender Offer and Consent Solicitation
  - Here's Why NRG Energy (NRG) is a Strong Growth Stock
  - Cwm LLC Has $4.51 Million Stake in NRG Energy, Inc. $NRG
  - NRG Energy Inc (NRG) Stock Down 4.7% but Still Overvalued -- GF Score: 81/100
  - NRG Energy, Inc. Announces Quarterly Dividend

```json
{
  "headline_count": 20,
  "positive_count": 4,
  "negative_count": 1,
  "net_score": 5,
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
- **Summary**: Volume ratio 0.19x, price change -2.4%, short/float N/A.
- **Evidence**:
  - Volume: 512.3K vs avg 2.7M
  - Market cap: 33.5B
  - Short percent float: N/A
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 156.26,
  "change_pct": -2.43,
  "volume": 512298,
  "avg_volume": 2742324,
  "volume_ratio": 0.19,
  "market_cap": 33526676820,
  "beta": 1.338,
  "short_pct_float": null
}
```

## Macro Agent

- **Signal**: NEUTRAL
- **Confidence**: 25%
- **Summary**: Macro backdrop: VIX N/A, curve N/A, HY spread N/A.
- **Evidence**:
  - Fed funds: 3.6%
  - 10Y-2Y: N/A
  - VIX: N/A
  - HY spread: N/A
- **Warnings**:
  - T10Y2Y unavailable: Failed after 2 attempts: Server error 500: Internal Server Error
  - VIXCLS unavailable: Failed after 2 attempts: Server error 500: Internal Server Error
  - BAMLH0A0HYM2 unavailable: Failed after 2 attempts: Server error 500: Internal Server Error

```json
{
  "DFF": {
    "date": "2026-04-24",
    "value": 3.64
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
  "market_cap": 33526676820,
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
