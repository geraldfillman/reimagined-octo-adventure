---
title: "Agent Analysis Strategy Rollup"
source: "Agent Analyst"
agent_owner: "Research Agent"
agent_scope: "pull"
analysis_scope: "strategy"
date_pulled: "2026-04-30"
domain: "market"
data_type: "agent_analysis_rollup"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH", "AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_PRICE_BULLISH", "AGENT_RISK_BULLISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH", "AGENT_PRICE_BULLISH", "AGENT_RISK_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH", "AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BEARISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH", "AGENT_PRICE_BEARISH", "AGENT_RISK_BEARISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH", "AGENT_PRICE_BULLISH", "AGENT_SENTIMENT_BULLISH", "AGENT_MICROSTRUCTURE_BULLISH", "AGENT_MACRO_BULLISH", "AGENT_FUNDAMENTALS_BULLISH", "QCPM_STRATEGY_TACTICAL_CNC","QCPM_STRATEGY_PRIME_HLT","QCPM_STRATEGY_PRIME_VRSK","QCPM_STRATEGY_PRIME_ODFL","QCPM_STRATEGY_PRIME_GD","QCPM_STRATEGY_PRIME_TW","QCPM_STRATEGY_TACTICAL_QCOM","QCPM_STRATEGY_TACTICAL_IAU","QCPM_STRATEGY_TACTICAL_VTR","QCPM_STRATEGY_TACTICAL_V","QCPM_STRATEGY_TACTICAL_MA","QCPM_STRATEGY_TACTICAL_HUM"]
thesis_count: 7
symbol_count: 28
kelly_method: half-kelly
combined_sources: ["agent-analysis", "qcpm", "orb"]
agent_names: ["price", "risk", "sentiment", "microstructure", "macro", "fundamentals", "prediction-market"]
entropy_levels: ["mixed", "diffuse", "ordered"]
tags: ["agent-analysis", "strategy-rollup", "market"]
---

## Rollup

| Symbol | Verdict | Confidence | Entropy | Status | Note |
| --- | --- | --- | --- | --- | --- |
| AAPL | BULLISH | 55% | mixed (0.53) | watch | [[05_Data_Pulls/Market/2026-04-30_Agent_Analysis_AAPL]] |
| AXP | NEUTRAL | 23% | diffuse (0.99) | clear | [[05_Data_Pulls/Market/2026-04-30_Agent_Analysis_AXP]] |
| BRK_B | NEUTRAL | 21% | mixed (0.56) | clear | [[05_Data_Pulls/Market/2026-04-30_Agent_Analysis_BRK_B]] |
| KO | BULLISH | 69% | ordered (0.36) | watch | [[05_Data_Pulls/Market/2026-04-30_Agent_Analysis_KO]] |
| GOLD | NEUTRAL | 22% | diffuse (0.93) | clear | [[05_Data_Pulls/Market/2026-04-30_Agent_Analysis_GOLD]] |
| NEM | NEUTRAL | 16% | diffuse (0.77) | clear | [[05_Data_Pulls/Market/2026-04-30_Agent_Analysis_NEM]] |
| WPM | NEUTRAL | 15% | diffuse (0.91) | clear | [[05_Data_Pulls/Market/2026-04-30_Agent_Analysis_WPM]] |
| XOM | BULLISH | 48% | ordered (0.48) | watch | [[05_Data_Pulls/Market/2026-04-30_Agent_Analysis_XOM]] |

## Source

- **System**: native vault agent puller, no LangChain
- **Strategies matched**: Buffett Style Quality Compounders, Dalio Style All-Weather Hard Assets, Druckenmiller Style Secular Trend Leaders, Graham Style Deep Value Re-Rating, Lynch Style GARP Leaders, Simons Style Quant Momentum Breadth, SPY QQQ Entropy Expansion Monitor
- **Auto-pulled**: 2026-04-30

---

## Combined Universe

> Sources: **[A]** Agent Analysis · **[Q]** QCPM Strategy Search · **[O]** ORB Entropy Screen. Sorted by Half-Kelly descending. Kelly formula: f\* = p − (1−p)/b where p = win probability, b = reward/risk ratio.

| Symbol | QCPM Dir | ORB Dir | Verdict | Entropy | f\* | ½f\* | Class | Sources | Aligned |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| KO | — | — | BULLISH | 0.36 | 0.53 | 0.27 | — | [A] | — |
| AAPL | — | — | BULLISH | 0.53 | 0.33 | 0.16 | — | [A] | — |
| IAU | SHORT | SHORT | — | 0.62 | 0.29 | 0.15 | tactical | [Q][O] | ✓ |
| QCOM | LONG | SHORT | — | 0.67 | 0.26 | 0.13 | tactical | [Q][O] | ✗ |
| VRSK | LONG | LONG | — | 0.67 | 0.25 | 0.13 | prime | [Q][O] | ✓ |
| ODFL | SHORT | LONG | — | 0.68 | 0.25 | 0.13 | prime | [Q][O] | ✗ |
| GD | SHORT | SHORT | — | 0.65 | 0.25 | 0.13 | prime | [Q][O] | ✓ |
| TW | LONG | SHORT | — | 0.67 | 0.25 | 0.13 | prime | [Q][O] | ✗ |
| VTR | SHORT | LONG | — | 0.71 | 0.25 | 0.13 | tactical | [Q][O] | ✗ |
| MA | SHORT | SHORT | — | 0.63 | 0.25 | 0.13 | tactical | [Q][O] | ✓ |
| HUM | SHORT | SHORT | — | 0.65 | 0.25 | 0.13 | tactical | [Q][O] | ✓ |
| TER | — | LONG | — | 0.67 | 0.25 | 0.13 | — | [O] | — |
| SOFI | — | LONG | — | 0.64 | 0.25 | 0.13 | — | [O] | — |
| IWR | — | LONG | — | 0.64 | 0.25 | 0.13 | — | [O] | — |
| FTAI | — | LONG | — | 0.64 | 0.25 | 0.13 | — | [O] | — |
| HOOD | — | LONG | — | 0.66 | 0.25 | 0.13 | — | [O] | — |
| XOM | — | — | BULLISH | 0.48 | 0.22 | 0.11 | — | [A] | — |
| CNC | LONG | SHORT | — | 0.64 | 0.22 | 0.11 | tactical | [Q][O] | ✗ |
| V | LONG | SHORT | — | 0.64 | 0.22 | 0.11 | tactical | [Q][O] | ✗ |
| BIIB | LONG | SHORT | — | 0.61 | 0.21 | 0.10 | watch | [Q][O] | ✗ |
| HLT | SHORT | LONG | — | 0.66 | 0.20 | 0.10 | prime | [Q][O] | ✗ |
| SBUX | LONG | SHORT | — | 0.61 | 0.18 | 0.09 | watch | [Q][O] | ✗ |
| GEHC | SHORT | LONG | — | 0.63 | 0.15 | 0.08 | watch | [Q][O] | ✗ |
| AXP | — | — | NEUTRAL | 0.99 | ⊘ | ⊘ | — | [A] | — |
| GOLD | — | — | NEUTRAL | 0.93 | ⊘ | ⊘ | — | [A] | — |
| BRK_B | — | — | NEUTRAL | 0.56 | ⊘ | ⊘ | — | [A] | — |
| NEM | — | — | NEUTRAL | 0.77 | ⊘ | ⊘ | — | [A] | — |
| WPM | — | — | NEUTRAL | 0.91 | ⊘ | ⊘ | — | [A] | — |

---

## Short-Term Positioning

> **Horizon**: Intraday to 5 days. **Source**: ORB Entropy Screen (direction), QCPM (probability). Kelly p derived from QCPM Dir Acc% where available; 0.50 baseline otherwise. Use ORB direction — ignore QCPM direction conflict for intraday plays.

| Symbol | Dir | Entry | Stop | 2R Target | f\* | ½f\* | Tier | Entropy | Conviction |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IAU | SHORT | 87.08 | 87.23 | 86.79 | 0.29 | 0.15 | active | 0.62 | MEDIUM |
| QCOM | SHORT | 164.87 | 165.42 | 163.76 | 0.26 | 0.13 | active | 0.67 | MEDIUM |
| ODFL | LONG | 212.75 | 211.96 | 214.34 | 0.25 | 0.13 | prime | 0.68 | HIGH |
| TW | SHORT | 115.79 | 116.17 | 115.04 | 0.25 | 0.13 | prime | 0.67 | HIGH |
| TER | LONG | 335.83 | 333.80 | 339.91 | 0.25 | 0.13 | prime | 0.67 | HIGH |
| SOFI | LONG | 15.82 | 15.72 | 16.01 | 0.25 | 0.13 | prime | 0.64 | HIGH |
| IWR | LONG | 103.04 | 102.92 | 103.27 | 0.25 | 0.13 | prime | 0.64 | HIGH |
| HOOD | LONG | 72.22 | 71.69 | 73.28 | 0.25 | 0.13 | active | 0.66 | MEDIUM |
| FTAI | LONG | 246.68 | 245.16 | 249.73 | 0.25 | 0.13 | active | 0.64 | MEDIUM |
| HUM | SHORT | 241.60 | 242.51 | 239.78 | 0.25 | 0.13 | active | 0.65 | MEDIUM |
| MA | SHORT | 500.18 | 501.26 | 498.01 | 0.25 | 0.13 | active | 0.63 | MEDIUM |
| VTR | LONG | 88.16 | 87.95 | 88.57 | 0.25 | 0.13 | active | 0.71 | MEDIUM |
| GD | SHORT | 338.56 | 339.49 | 336.70 | 0.25 | 0.13 | active | 0.65 | MEDIUM |
| VRSK | LONG | 187.20 | 186.61 | 188.39 | 0.25 | 0.13 | active | 0.67 | MEDIUM |
| CNC | SHORT | 53.22 | 53.43 | 52.81 | 0.22 | 0.11 | prime | 0.64 | MEDIUM |
| V | SHORT | 329.23 | 329.96 | 327.76 | 0.22 | 0.11 | prime | 0.64 | MEDIUM |
| BIIB | SHORT | 192.50 | 193.09 | 191.32 | 0.21 | 0.10 | active | 0.61 | MEDIUM |
| HLT | LONG | 321.42 | 320.67 | 322.91 | 0.20 | 0.10 | prime | 0.66 | MEDIUM |
| SBUX | SHORT | 104.19 | 104.43 | 103.71 | 0.18 | 0.09 | active | 0.61 | LOW |
| GEHC | LONG | 60.26 | 60.02 | 60.74 | 0.15 | 0.08 | active | 0.63 | LOW |

---

## Long-Term Positioning

> **Horizon**: Weeks to months. **Source**: QCPM Prime class + Agent Analysis. Direction from QCPM candidate screen or Agent Analysis verdict. p from QCPM Dir Acc% or Agent Analysis confidence.

| Symbol | Dir   | Verdict | Confidence | f\*  | ½f\* | Strategy                        | Class | Entropy | Note                                     |
| ------ | ----- | ------- | ---------- | ---- | ---- | ------------------------------- | ----- | ------- | ---------------------------------------- |
| KO     | LONG  | BULLISH | 69%        | 0.53 | 0.27 | Lynch GARP / Buffett Compounder | —     | 0.36    |                                          |
| AAPL   | LONG  | BULLISH | 55%        | 0.33 | 0.16 | Buffett Compounder              | —     | 0.53    |                                          |
| VRSK   | LONG  | —       | —          | 0.25 | 0.13 | QCPM Prime                      | prime | 0.67    |                                          |
| ODFL   | SHORT | —       | —          | 0.25 | 0.13 | QCPM Prime                      | prime | 0.68    | Dir conflict w/ ORB — use QCPM for swing |
| GD     | SHORT | —       | —          | 0.25 | 0.13 | QCPM Prime                      | prime | 0.65    |                                          |
| TW     | LONG  | —       | —          | 0.25 | 0.13 | QCPM Prime                      | prime | 0.67    | Dir conflict w/ ORB — use QCPM for swing |
| XOM    | LONG  | BULLISH | 48%        | 0.22 | 0.11 | Dalio All-Weather               | —     | 0.48    |                                          |
| HLT    | SHORT | —       | —          | 0.20 | 0.10 | QCPM Prime                      | prime | 0.66    | Dir conflict w/ ORB — use QCPM for swing |
| AXP    | HOLD  | NEUTRAL | 23%        | ⊘    | ⊘    | Buffett Compounder              | —     | 0.99    | Negative edge — vol play only            |
| GOLD   | HOLD  | NEUTRAL | 22%        | ⊘    | ⊘    | Dalio Hard Asset                | —     | 0.93    | Negative edge — vol play only            |
| BRK_B  | HOLD  | NEUTRAL | 21%        | ⊘    | ⊘    | Buffett Compounder              | —     | 0.56    | Negative edge — vol play only            |
| NEM    | HOLD  | NEUTRAL | 16%        | ⊘    | ⊘    | Dalio Hard Asset                | —     | 0.77    | Negative edge — vol play only            |
| WPM    | HOLD  | NEUTRAL | 15%        | ⊘    | ⊘    | Dalio Hard Asset                | —     | 0.91    | Negative edge — vol play only            |

---

## Options Layer

> Strategies restricted to: buy-writes, sell covered calls, roll covered calls, buy calls/puts, sell cash-covered puts, long straddles/strangles. No naked positions, spreads, or 0DTE. No dollar amounts — position size expressed via ½f\* Kelly fraction of portfolio.
>
> **Break-even logic**: CSP break-even = strike − premium received; long put break-even = entry − premium paid; straddle break-even = strike ± total premium paid.

| Symbol | Dir Signal | Strategy | Strike Guidance | Expiry | Max Loss | Break-even Logic | f\* | ½f\* | Assignment Risk | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| KO | LONG | Sell cash-secured puts → covered call if assigned | 1 strike OTM put (below support) | 30–45 DTE | Strike − premium received (if assigned) | Strike − premium received (CSP) | 0.53 | 0.27 | Moderate if in the money near expiry |  |
| AAPL | LONG | Sell cash-secured puts → covered call if assigned | 1 strike OTM put (below support) | 30–45 DTE | Strike − premium received (if assigned) | Strike − premium received (CSP) | 0.33 | 0.16 | Moderate if in the money near expiry |  |
| IAU | SHORT | Buy puts | 1 strike OTM put (near entry) | 7–21 DTE | Premium paid (defined risk) | Entry − premium paid | 0.29 | 0.15 | — |  |
| QCOM | CONFLICT | Long straddle (direction conflict — bet on move, not direction) | ATM straddle or 1–2 strikes wide strangle | 7–21 DTE | Both legs combined premium paid | Strike ± total debit paid | 0.26 | 0.13 | — | QCPM=LONG, ORB=SHORT |
| VRSK | LONG | Sell cash-secured puts → covered call if assigned | 1 strike OTM put (below support) | 7–21 DTE | Strike − premium received (if assigned) | Strike − premium received (CSP) | 0.25 | 0.13 | Moderate if in the money near expiry |  |
| ODFL | CONFLICT | Long straddle (direction conflict — bet on move, not direction) | ATM straddle or 1–2 strikes wide strangle | 7–14 DTE (intraday confirm) or 21–30 DTE swing | Both legs combined premium paid | Strike ± total debit paid | 0.25 | 0.13 | Moderate if in the money near expiry | QCPM=SHORT, ORB=LONG |
| GD | SHORT | Buy puts | 1 strike OTM put (near entry) | 7–21 DTE | Premium paid (defined risk) | Entry − premium paid | 0.25 | 0.13 | — |  |
| TW | CONFLICT | Long straddle (direction conflict — bet on move, not direction) | ATM straddle or 1–2 strikes wide strangle | 7–14 DTE (intraday confirm) or 21–30 DTE swing | Both legs combined premium paid | Strike ± total debit paid | 0.25 | 0.13 | — | QCPM=LONG, ORB=SHORT |
| VTR | CONFLICT | Long straddle (direction conflict — bet on move, not direction) | ATM straddle or 1–2 strikes wide strangle | 7–21 DTE | Both legs combined premium paid | Strike ± total debit paid | 0.25 | 0.13 | Moderate if in the money near expiry | QCPM=SHORT, ORB=LONG |
| MA | SHORT | Buy puts | 1 strike OTM put (near entry) | 7–21 DTE | Premium paid (defined risk) | Entry − premium paid | 0.25 | 0.13 | — |  |
| HUM | SHORT | Buy puts | 1 strike OTM put (near entry) | 7–21 DTE | Premium paid (defined risk) | Entry − premium paid | 0.25 | 0.13 | — |  |
| TER | LONG | Sell cash-secured puts → covered call if assigned | 1 strike OTM put (below support) | 7–14 DTE (intraday confirm) or 21–30 DTE swing | Strike − premium received (if assigned) | Strike − premium received (CSP) | 0.25 | 0.13 | Moderate if in the money near expiry |  |
| SOFI | LONG | Sell cash-secured puts → covered call if assigned | 1 strike OTM put (below support) | 7–14 DTE (intraday confirm) or 21–30 DTE swing | Strike − premium received (if assigned) | Strike − premium received (CSP) | 0.25 | 0.13 | Moderate if in the money near expiry |  |
| IWR | LONG | Sell cash-secured puts → covered call if assigned | 1 strike OTM put (below support) | 7–14 DTE (intraday confirm) or 21–30 DTE swing | Strike − premium received (if assigned) | Strike − premium received (CSP) | 0.25 | 0.13 | Moderate if in the money near expiry |  |
| FTAI | LONG | Sell cash-secured puts → covered call if assigned | 1 strike OTM put (below support) | 7–21 DTE | Strike − premium received (if assigned) | Strike − premium received (CSP) | 0.25 | 0.13 | Moderate if in the money near expiry |  |
| HOOD | LONG | Sell cash-secured puts → covered call if assigned | 1 strike OTM put (below support) | 7–21 DTE | Strike − premium received (if assigned) | Strike − premium received (CSP) | 0.25 | 0.13 | Moderate if in the money near expiry |  |
| XOM | LONG | Sell cash-secured puts → covered call if assigned | 1 strike OTM put (below support) | 30–45 DTE | Strike − premium received (if assigned) | Strike − premium received (CSP) | 0.22 | 0.11 | Moderate if in the money near expiry |  |
| CNC | CONFLICT | Long straddle (direction conflict — bet on move, not direction) | ATM straddle or 1–2 strikes wide strangle | 7–14 DTE (intraday confirm) or 21–30 DTE swing | Both legs combined premium paid | Strike ± total debit paid | 0.22 | 0.11 | — | QCPM=LONG, ORB=SHORT |
| V | CONFLICT | Long straddle (direction conflict — bet on move, not direction) | ATM straddle or 1–2 strikes wide strangle | 7–14 DTE (intraday confirm) or 21–30 DTE swing | Both legs combined premium paid | Strike ± total debit paid | 0.22 | 0.11 | — | QCPM=LONG, ORB=SHORT |
| BIIB | CONFLICT | Long straddle (direction conflict — bet on move, not direction) | ATM straddle or 1–2 strikes wide strangle | 7–21 DTE | Both legs combined premium paid | Strike ± total debit paid | 0.21 | 0.10 | — | QCPM=LONG, ORB=SHORT |
| HLT | CONFLICT | Long straddle (direction conflict — bet on move, not direction) | ATM straddle or 1–2 strikes wide strangle | 7–14 DTE (intraday confirm) or 21–30 DTE swing | Both legs combined premium paid | Strike ± total debit paid | 0.20 | 0.10 | Moderate if in the money near expiry | QCPM=SHORT, ORB=LONG |
| SBUX | CONFLICT | Long straddle (direction conflict — bet on move, not direction) | ATM straddle or 1–2 strikes wide strangle | 7–21 DTE | Both legs combined premium paid | Strike ± total debit paid | 0.18 | 0.09 | — | QCPM=LONG, ORB=SHORT |
| GEHC | CONFLICT | Long straddle (direction conflict — bet on move, not direction) | ATM straddle or 1–2 strikes wide strangle | 7–21 DTE | Both legs combined premium paid | Strike ± total debit paid | 0.15 | 0.08 | Moderate if in the money near expiry | QCPM=SHORT, ORB=LONG |
| AXP | NEUTRAL | Long strangle (vol play — no directional edge) | — | 30–45 DTE | — | — | ⊘ | ⊘ | — | Entropy vol play only; size small |
| GOLD | NEUTRAL | Long strangle (vol play — no directional edge) | — | 30–45 DTE | — | — | ⊘ | ⊘ | — | Entropy vol play only; size small |
| BRK_B | NEUTRAL | ⊘ no edge — skip | — | 30–45 DTE | — | — | ⊘ | ⊘ | — |  |
| NEM | NEUTRAL | Long strangle (vol play — no directional edge) | — | 30–45 DTE | — | — | ⊘ | ⊘ | — | Entropy vol play only; size small |
| WPM | NEUTRAL | Long strangle (vol play — no directional edge) | — | 30–45 DTE | — | — | ⊘ | ⊘ | — | Entropy vol play only; size small |

---

## Directional Plays

> Reference prices from ORB screen entries (2026-04-30); KO from user-provided live price. Strike = first standard increment above (call) or below (put) reference price. **2R target** = ref ± 2×ATR14 — exit the option when position value doubles. **Risk ratio** = defined-risk 1:2 minimum for single legs; strangle needs ≥ combined-premium move on either side to hit 1:2. Recommended DTE: 30–45 for Agent Analysis symbols; 7–21 for ORB intraday setups. CSP columns retained in Options Layer above for reference.

| Symbol | Ref Price | Primary Dir | Bullish Leg (Buy Call) | Bearish Leg (Buy Put) | Strangle | 2R ↑ | 2R ↓ | Risk Ratio | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| KO | $78.56 | LONG | Buy $79 call ★ | Buy $78 put (hedge) | Buy $79 call + $78 put | $80.56 | $76.56 | 1:2 | Call primary; put = hedge only |
| AAPL | live price | LONG | Buy 1st call above live price | Buy 1st put below live price | 1st call above + 1st put below | live + 2×ATR | live − 2×ATR | 1:2 | Bullish leg primary; bearish = hedge only |
| XOM | live price | LONG | Buy 1st call above live price | Buy 1st put below live price | 1st call above + 1st put below | live + 2×ATR | live − 2×ATR | 1:2 | Bullish leg primary; bearish = hedge only |
| AXP | live price | NEUTRAL | — | Buy 1st put below live price | 1st call above + 1st put below | live + 2×ATR | live − 2×ATR | 1:2 | Vol play — entropy driven; no directional edge |
| BRK_B | live price | NEUTRAL | — | Buy 1st put below live price | 1st call above + 1st put below | live + 2×ATR | live − 2×ATR | 1:2 | Vol play — entropy driven; no directional edge |
| GOLD | live price | NEUTRAL | — | Buy 1st put below live price | 1st call above + 1st put below | live + 2×ATR | live − 2×ATR | 1:2 | Vol play — entropy driven; no directional edge |
| NEM | live price | NEUTRAL | — | Buy 1st put below live price | 1st call above + 1st put below | live + 2×ATR | live − 2×ATR | 1:2 | Vol play — entropy driven; no directional edge |
| WPM | live price | NEUTRAL | — | Buy 1st put below live price | 1st call above + 1st put below | live + 2×ATR | live − 2×ATR | 1:2 | Vol play — entropy driven; no directional edge |
| CNC | $53.22 | CONFLICT | Buy $54 call | Buy $53 put | Buy $54 call + $53 put | $57.34 | $49.10 | 1:2 | Conflict: both legs equal weight — strangle preferred |
| HLT | $321.42 | CONFLICT | Buy $322.50 call | Buy $320 put | Buy $322.50 call + $320 put | $336.36 | $306.48 | 1:2 | Conflict: both legs equal weight — strangle preferred |
| VRSK | $187.2 | LONG | Buy $188 call ★ | Buy $187 put (hedge) | Buy $188 call + $187 put | $199.08 | $175.32 | 1:2 | Call primary; put = hedge only |
| ODFL | $212.75 | CONFLICT | Buy $215 call | Buy $212.50 put | Buy $215 call + $212.50 put | $228.63 | $196.87 | 1:2 | Conflict: both legs equal weight — strangle preferred |
| GD | $338.56 | SHORT | Buy $340 call (hedge) | Buy $337.50 put ★ | Buy $340 call + $337.50 put | $357.20 | $319.92 | 1:2 | Put primary; call = hedge only |
| TW | $115.79 | CONFLICT | Buy $116 call | Buy $115 put | Buy $116 call + $115 put | $123.33 | $108.25 | 1:2 | Conflict: both legs equal weight — strangle preferred |
| QCOM | $164.87 | CONFLICT | Buy $165 call | Buy $164 put | Buy $165 call + $164 put | $175.87 | $153.87 | 1:2 | Conflict: both legs equal weight — strangle preferred |
| IAU | $87.08 | SHORT | Buy $88 call (hedge) | Buy $87 put ★ | Buy $88 call + $87 put | $90.02 | $84.14 | 1:2 | Put primary; call = hedge only |
| VTR | $88.16 | CONFLICT | Buy $89 call | Buy $88 put | Buy $89 call + $88 put | $92.28 | $84.04 | 1:2 | Conflict: both legs equal weight — strangle preferred |
| V | $329.23 | CONFLICT | Buy $330 call | Buy $327.50 put | Buy $330 call + $327.50 put | $343.89 | $314.57 | 1:2 | Conflict: both legs equal weight — strangle preferred |
| MA | $500.18 | CONFLICT | Buy $505 call | Buy $500 put | Buy $505 call + $500 put | $521.82 | $478.54 | 1:2 | Conflict: both legs equal weight — strangle preferred |
| HUM | $241.6 | SHORT | Buy $242.50 call (hedge) | Buy $240 put ★ | Buy $242.50 call + $240 put | $259.78 | $223.42 | 1:2 | Put primary; call = hedge only |
| BIIB | $192.5 | CONFLICT | Buy $193 call | Buy $192 put | Buy $193 call + $192 put | $204.26 | $180.74 | 1:2 | Conflict: both legs equal weight — strangle preferred |
| GEHC | $60.26 | CONFLICT | Buy $61 call | Buy $60 put | Buy $61 call + $60 put | $65.08 | $55.44 | 1:2 | Conflict: both legs equal weight — strangle preferred |
| SBUX | $104.19 | CONFLICT | Buy $105 call | Buy $104 put | Buy $105 call + $104 put | $109.03 | $99.35 | 1:2 | Conflict: both legs equal weight — strangle preferred |
| TER | $335.83 | LONG | Buy $337.50 call ★ | Buy $335 put (hedge) | Buy $337.50 call + $335 put | $376.53 | $295.13 | 1:2 | Call primary; put = hedge only |
| SOFI | $15.82 | LONG | Buy $16 call ★ | Buy $15.50 put (hedge) | Buy $16 call + $15.50 put | $17.76 | $13.88 | 1:2 | Call primary; put = hedge only |
| IWR | $103.04 | LONG | Buy $104 call ★ | Buy $103 put (hedge) | Buy $104 call + $103 put | $105.36 | $100.72 | 1:2 | Call primary; put = hedge only |
| FTAI | $246.68 | LONG | Buy $247.50 call ★ | Buy $245 put (hedge) | Buy $247.50 call + $245 put | $277.14 | $216.22 | 1:2 | Call primary; put = hedge only |
| HOOD | $72.22 | LONG | Buy $73 call ★ | Buy $72 put (hedge) | Buy $73 call + $72 put | $82.86 | $61.58 | 1:2 | Call primary; put = hedge only |
