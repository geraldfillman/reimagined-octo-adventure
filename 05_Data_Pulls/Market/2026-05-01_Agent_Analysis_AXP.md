---
title: "AXP Agent Analysis"
source: "Agent Analyst"
agent_owner: "Market Agent"
agent_scope: "pull"
symbol: "AXP"
asset_type: "stock"
thesis_name: "Buffett Style Quality Compounders"
related_theses: ["[[Buffett Style Quality Compounders]]"]
date_pulled: "2026-05-01"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "clear"
signals: ["AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH"]
final_verdict: "NEUTRAL"
final_confidence: 0.15
synthesis_mode: "deterministic"
entropy_level: "diffuse"
entropy_score: 0.98
entropy_dominant_signal: "bullish"
microstructure_entropy_level: "mixed"
microstructure_entropy_score: 0.66
agent_count: 10
failed_agent_count: 0
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "auction", "pair", "pead", "prediction-market"]
tags: ["agent-analysis", "market", "axp"]
---

## Verdict

- **Final verdict**: NEUTRAL
- **Final confidence**: 15%
- **Attention status**: clear
- **Synthesis mode**: deterministic
- **Reasoning**: Deterministic synthesis is neutral at 15% confidence. Agent entropy is diffuse (0.98). Drivers: fundamentals, macro. Risks: risk, price. 5 neutral layer(s).
- **Top drivers**: fundamentals, macro, sentiment
- **Top risks**: risk, price

## Entropy Levels

- **Orchestrator entropy**: diffuse (0.98)
- **Dominant signal bucket**: bullish
- **Distribution**: bullish 42%, bearish 32%, neutral 26%
- **Interpretation**: High agent entropy: specialist reads are dispersed, so the orchestrator should prioritize reconciliation.
- **Microstructure entropy**: mixed (0.66)
- **Microstructure read**: Mid-range transition entropy: order flow structure is present but not strong enough to stand alone.
- **Paper linkage**: Low entropy is treated as magnitude/attention compression, not directional certainty.

## Agent Signal Matrix

| Agent | Signal | Confidence | Runtime | Summary |
| --- | --- | --- | --- | --- |
| price | BEARISH | 45% | 175ms | AXP closed at 319.64. 7d -4.0%, 30d 8.4%. RSI 51.4, MACD negative. |
| risk | BEARISH | 46% | 338ms | Risk read: 30d vol 25.5%, max drawdown -24.1%, 30d return 8.4%. |
| sentiment | BULLISH | 38% | 448ms | 12 headline(s): 2 positive, 0 negative, net score 2. |
| microstructure | NEUTRAL | 24% | 1087ms | Volume ratio 0.57x, price change -1.1%, short/float N/A, entropy mixed. |
| macro | BULLISH | 36% | 221ms | Macro backdrop: VIX 16.89, curve 0.52, HY spread 2.8%. |
| fundamentals | BULLISH | 44% | 1360ms | Revenue growth 8.4%, net margin 13.5%, trailing FCF 25.6B. |
| auction | NEUTRAL | 22% | 1654ms | Auction state: balance. below VAL 320.13. Session bars: 390. |
| pair | NEUTRAL | 5% | 9ms | AXP is not in any configured pair watchlist. |
| pead | NEUTRAL | 10% | 1795ms | No recent earnings within 90 days for AXP. |
| prediction_market | NEUTRAL | 12% | 156ms | No relevant prediction markets found for "Buffett Style Quality Compounders". |

## Follow Up Actions

- Review bearish layers before increasing exposure.
- Check drawdown, volatility, and position sizing.
- Resolve agent disagreement before changing conviction.

## Price Agent

- **Signal**: BEARISH
- **Confidence**: 45%
- **Summary**: AXP closed at 319.64. 7d -4.0%, 30d 8.4%. RSI 51.4, MACD negative.
- **Evidence**:
  - Close vs SMA50: above
  - Close vs SMA200: below
  - MACD crossover: negative

```json
{
  "api_symbol": "AXP",
  "bars": 260,
  "close": 319.64,
  "change_7d_pct": -3.98,
  "change_30d_pct": 8.38,
  "sma20": 320.7965,
  "sma50": 312.1378,
  "sma200": 336.0413,
  "ema21": 318.6285,
  "rsi14": 51.38,
  "macd": 1.9234,
  "macd_signal": 2.557,
  "macd_crossover": "negative",
  "bollinger_position": 0.462
}
```

## Risk Agent

- **Signal**: BEARISH
- **Confidence**: 46%
- **Summary**: Risk read: 30d vol 25.5%, max drawdown -24.1%, 30d return 8.4%.
- **Evidence**:
  - Max drawdown: -24.1%
  - 30d realized volatility: 25.5%
  - Sharpe-like score: -1.38
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "bars": 260,
  "realized_vol_30d": 0.2552,
  "realized_vol_90d": 0.2995,
  "max_drawdown_pct": -24.06,
  "atr14": null,
  "change_30d_pct": 8.38,
  "sharpe_like_90d": -1.38,
  "beta": 1.133,
  "days_to_cover": null
}
```

## Sentiment Agent

- **Signal**: BULLISH
- **Confidence**: 38%
- **Summary**: 12 headline(s): 2 positive, 0 negative, net score 2.
- **Evidence**:
  - Set It and Forget It: 3 Monster Stocks Worth Holding Through Whatever Comes Next
  - JAMES BEARD FOUNDATION® ANNOUNCES MULTI-YEAR PARTNERSHIP WITH AMERICAN EXPRESS AND RESY, BEGINNING WITH PRESENTING SPONSORSHIP OF THE 2026 JAMES BEARD AWARDS® CEREMONIES
  - Synchrony Expands Partnership with Lowe's as New Issuer of Co-Brand Credit Card for Home Improvement Professionals
  - Is Trending Stock American Express Company (AXP) a Buy Now?
  - U.S. Consumer American Express® Gold Card Introduces New and Enhanced Benefits as Part of 60th Anniversary Celebration

```json
{
  "headline_count": 12,
  "positive_count": 2,
  "negative_count": 0,
  "net_score": 2,
  "sample_headlines": [
    "Set It and Forget It: 3 Monster Stocks Worth Holding Through Whatever Comes Next",
    "JAMES BEARD FOUNDATION® ANNOUNCES MULTI-YEAR PARTNERSHIP WITH AMERICAN EXPRESS AND RESY, BEGINNING WITH PRESENTING SPONSORSHIP OF THE 2026 JAMES BEARD AWARDS® CEREMONIES",
    "Synchrony Expands Partnership with Lowe's as New Issuer of Co-Brand Credit Card for Home Improvement Professionals",
    "Is Trending Stock American Express Company (AXP) a Buy Now?",
    "U.S. Consumer American Express® Gold Card Introduces New and Enhanced Benefits as Part of 60th Anniversary Celebration"
  ]
}
```

## Microstructure Agent

- **Signal**: NEUTRAL
- **Confidence**: 24%
- **Summary**: Volume ratio 0.57x, price change -1.1%, short/float N/A, entropy mixed.
- **Evidence**:
  - Volume: 2.1M vs avg 3.7M
  - Market cap: 218.1B
  - Short percent float: N/A
  - Order-flow entropy: mixed (0.66) from 119 transitions
- **Warnings**:
  - Short interest unavailable: HTTP 404: []

```json
{
  "price": 319.64,
  "change_pct": -1.06,
  "volume": 2107408,
  "avg_volume": 3686818,
  "volume_ratio": 0.57,
  "market_cap": 218098824241,
  "beta": 1.133,
  "short_pct_float": null,
  "order_flow_entropy_score": 0.66,
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
- **Confidence**: 44%
- **Summary**: Revenue growth 8.4%, net margin 13.5%, trailing FCF 25.6B.
- **Evidence**:
  - Sector: Financial Services
  - Revenue growth: 8.4%
  - Net cash: -6.7B

```json
{
  "company_name": "American Express Company",
  "sector": "Financial Services",
  "industry": "Financial - Credit Services",
  "market_cap": 218098824241,
  "revenue_growth_pct": 8.44,
  "gross_margin_pct": 83.23,
  "net_margin_pct": 13.46,
  "trailing_fcf": 25639000000,
  "cash": 53757000000,
  "total_debt": 60442000000,
  "net_cash": -6685000000,
  "cfq_score": 3.98,
  "cfq_label": "high",
  "cfq_factors": {
    "ocf_durability": 3,
    "fcf_conversion": 5,
    "fcf_margin": 4,
    "capital_intensity": 4,
    "pricing_power": 4,
    "balance_sheet": 4,
    "share_count_quality": 5,
    "margin_stability": 3
  }
}
```

## Auction Agent

- **Signal**: NEUTRAL
- **Confidence**: 22%
- **Summary**: Auction state: balance. below VAL 320.13. Session bars: 390.
- **Evidence**:
  - Auction state: balance
  - VP — POC: 321.4235, VAH: 322.7124, VAL: 320.1345
  - TPO POC: 322.0679
  - AVWAP unavailable
  - Volume ratio N/A
- **Warnings**:
  - Anchored VWAP unavailable (anchor: 2026-04-01, bars: 22).

```json
{
  "auction_state": "balance",
  "current_price": 319.64,
  "poc": 321.4235,
  "vah": 322.7124,
  "val": 320.1345,
  "tpo_poc": 322.0679,
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
- **Summary**: AXP is not in any configured pair watchlist.

```json
{
  "symbol": "AXP",
  "pairs_checked": 17
}
```

## Pead Agent

- **Signal**: NEUTRAL
- **Confidence**: 10%
- **Summary**: No recent earnings within 90 days for AXP.
- **Warnings**:
  - Earnings history unavailable: HTTP 404: []

```json
{
  "symbol": "AXP",
  "earnings_in_window": 0
}
```

## Prediction Market Agent

- **Signal**: NEUTRAL
- **Confidence**: 12%
- **Summary**: No relevant prediction markets found for "Buffett Style Quality Compounders".

```json
{
  "query": "Buffett Style Quality Compounders",
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
