---
title: "Qlib Scores — Space Domain Awareness (2026-04-01)"
source: "Qlib"
date_pulled: "2026-04-25"
domain: "quant"
data_type: "factor_scores"
frequency: "daily"
signal_status: "watch"
signals: ["FACTOR_AVOID", "FACTOR_AVOID"]
tags: ["qlib", "factor-scores", "space_domain_awareness"]
universe: "Space Domain Awareness"
ticker_count: 6
scoring_date: "2026-04-01"
qlib_schema_version: 2
universe_size: 6
alert_count: 2
top_ticker: "ASTS"
top_score: 100.0
strong_buy_count: 3
buy_count: 0
watch_count: 0
avoid_count: 2
top_factor: "IMIN60"
top_factor_weight: -0.2102
---

## Ranked Watchlist

| Rank | Ticker | Score | Signal     | IMIN60 | IMAX60 | IMXD60 | CNTD60  | CNTP60 |
| ---- | ------ | ----- | ---------- | ------ | ------ | ------ | ------- | ------ |
| 1    | ASTS   | 100.0 | STRONG_BUY | 0.1333 | 0.1333 | 0.0000 | 0.1000  | 0.5167 |
| 2    | BKSY   | 100.0 | STRONG_BUY | 0.1333 | 0.1333 | 0.0000 | 0.1000  | 0.5167 |
| 3    | SPIR   | 82.4  | STRONG_BUY | 0.1333 | 0.1333 | 0.0000 | 0.1000  | 0.5000 |
| 4    | RKLB   | 47.1  | NEUTRAL    | 0.1333 | 0.1333 | 0.0000 | 0.0333  | 0.4833 |
| 5    | PL     | 23.5  | AVOID      | 0.1333 | 0.1333 | 0.0000 | -0.0667 | 0.4333 |
| 6    | MNTS   | 0.0   | AVOID      | 0.1333 | 0.1333 | 0.0000 | -0.3333 | 0.3000 |

## Alerts

- **WATCH** PL: PL: composite score 23.5 (rank #5) in bottom quartile — avoid or reduce exposure
- **WATCH** MNTS: MNTS: composite score 0.0 (rank #6) in bottom quartile — avoid or reduce exposure

## Factor Weights

| Factor | IC Weight |
| --- | --- |
| IMIN60 | -0.2102 |
| IMAX60 | 0.1349 |
| IMXD60 | 0.1087 |
| CNTD60 | 0.0679 |
| CNTP60 | 0.0675 |

## Detailed Interpretation

This score note ranks the six tradable names in the [[Space Domain Awareness]] thesis universe against each other. It is not a broad-market recommendation engine; it is a relative ranking inside the thesis basket using the latest available Qlib factor data.

### Setup Used

- **Universe source:** `core_entities` from [[Space Domain Awareness]]
- **Tradable universe:** `ASTS`, `BKSY`, `MNTS`, `PL`, `RKLB`, `SPIR`
- **Score date:** 2026-04-01
- **Note generated:** 2026-04-25
- **Top factor:** `IMIN60`
- **Top factor weight:** `-0.2102`
- **Signal status:** `watch`

The score date being earlier than the note generation date means this run used the local Qlib market cache available to the pipeline, not necessarily fresh market data through 2026-04-25. Treat the ranking as a valid workflow output, but refresh the local market cache before using it as a live trading input.

### What The Ranking Means

| Group | Tickers | Interpretation |
| --- | --- | --- |
| Strong relative rank | `ASTS`, `BKSY`, `SPIR` | These ranked best within the six-name space basket on the selected factor mix. They are the quant-preferred names for further thesis review. |
| Middle rank | `RKLB` | RKLB is not rejected by the model, but it did not show enough factor support to rank with the leaders. This matters because RKLB is the thesis's primary symbol. |
| Weak relative rank | `PL`, `MNTS` | These triggered bottom-quartile `FACTOR_AVOID` watch signals. They deserve tighter review before adding or maintaining exposure. |

### Ticker-Level Read

- **ASTS:** Highest possible composite score. The model is saying ASTS has the strongest current factor profile in the basket, but this should still be checked against execution risk, funding risk, and satellite deployment milestones.
- **BKSY:** Also scored at the top of the basket. This supports monitoring BKSY as a potentially stronger tactical expression of the SDA/ISR angle.
- **SPIR:** Strong rank but below ASTS and BKSY. The factor profile is supportive, though not the strongest.
- **RKLB:** Neutral score. This is a useful warning because RKLB is structurally central to the thesis, but the quant layer is not currently giving it leadership status.
- **PL:** Avoid/watch. The model flags PL as a bottom-quartile name despite its strategic role in commercial imagery and ISR data.
- **MNTS:** Avoid/watch and weakest score. The model is strongly rejecting MNTS on the current factor mix.

### Factor Read

The factor report for this run identified `IMIN60` as the top factor with an IC weight of `-0.2102`. In practical terms:

- The strongest factor relationship in this small universe is inverse, not straightforward momentum confirmation.
- The model is using a narrow set of technical relationships, so the output should be treated as a ranking aid rather than a standalone signal.
- Because the universe has only six tickers, factor rankings can be unstable; a single volatile name can distort the apparent signal.

### Backtest Context

The companion backtest note [[2026-04-25_Qlib_Backtest_alpha158_lgbm_Space_Domain_Awareness]] weakens confidence in acting aggressively on this score ranking:

- **Sharpe:** `-0.4429`
- **Annual return:** `-46.82%`
- **Max drawdown:** `-68.16%`
- **Win rate:** `47.28%`
- **Test window:** 2025-01-20 to 2026-04-25

That means the default strategy did not work well for this universe in the tested period. The ranking can still help identify current relative strength and weakness, but it should not be treated as proof that the factor model is profitable for the space basket.

### Practical Action Frame

- Use `ASTS`, `BKSY`, and `SPIR` as the first names to review for tactical strength.
- Keep `RKLB` as the structural anchor only if catalyst and fundamental evidence remain strong; the quant layer is currently neutral, not confirming.
- Treat `PL` and `MNTS` as watchlist risk items until their scores improve or non-quant evidence clearly offsets the model warning.
- Re-run after refreshing the Qlib cache if the goal is a live decision rather than a vault workflow update.
- Do not size purely from this score note; combine it with FMP fundamentals, technical risk, earnings/catalyst timing, contract evidence, and thesis invalidation checks.

### Useful Follow-Up Commands

```powershell
node scripts/run.mjs quant universe --thesis "Space Domain Awareness"
node scripts/run.mjs quant refresh --thesis "Space Domain Awareness" --with-backtest
node scripts/run.mjs quant sim --thesis "Space Domain Awareness" --summary-only --ascii
node scripts/run.mjs quant sim --thesis "Space Domain Awareness" --phase score --ticker RKLB --timings --ascii
node scripts/run.mjs quant sim --thesis "Space Domain Awareness" --phase score --ticker PL --timings --ascii
```

## Cross-Thesis Extension

This test can be extended to every thesis basket with:

```powershell
node scripts/run.mjs quant refresh --all
```

That command keeps each thesis as a separate universe. It does not merge all tickers into the Space Domain Awareness basket, which is the right default because each thesis has a different factor context, risk profile, and liquidity mix.

### 2026-04-25 Multi-Thesis Run

The cross-thesis run completed for 22 of 24 thesis universes. It generated factor and score notes for the successful theses and wrote signal notes where thresholds fired.

| Thesis Universe | Top Ticker | Top Score | Status | Alerts | Strong Buys | Avoids |
| --- | --- | ---: | --- | ---: | ---: | ---: |
| AI Power Defense Stack | MSFT | 100.0 | watch | 1 | 2 | 1 |
| AI Power Infrastructure | GEV | 100.0 | watch | 3 | 1 | 3 |
| Alzheimer's Disease Modification | ACAD | 50.0 | alert | 1 | 0 | 0 |
| Antimicrobial Resistance Pipeline | JNJ | 100.0 | watch | 2 | 2 | 2 |
| Biosecurity Compute Convergence | AMZN | 50.0 | clear | 0 | 0 | 0 |
| Defense AI & Autonomous Warfare | PLTR | 100.0 | watch | 3 | 5 | 3 |
| Dollar Debasement & Hard Money | MSTR | 100.0 | watch | 1 | 2 | 1 |
| Drone & Autonomous Systems Revolution | KTOS | 100.0 | watch | 2 | 5 | 2 |
| Fiscal Scarcity Rearmament | LMT | 50.0 | clear | 0 | 0 | 0 |
| Gene Editing & CRISPR Therapeutics | BEAM | 50.0 | clear | 0 | 0 | 0 |
| GLP-1 Metabolic Disease Revolution | LLY | 100.0 | watch | 2 | 2 | 1 |
| Grid Equipment Bottleneck | ETN | 50.0 | clear | 0 | 0 | 0 |
| Grid-Scale Battery Storage | ENVX | 50.0 | clear | 0 | 0 | 0 |
| Housing Supply Correction | TOL | 100.0 | watch | 2 | 1 | 2 |
| Humanoid Robotics | AI | 50.0 | clear | 0 | 0 | 0 |
| Hypersonic Weapons & Advanced Defense Systems | LHX | 50.0 | clear | 0 | 0 | 0 |
| Longevity & Aging Biology | UNTY | 50.0 | clear | 0 | 0 | 0 |
| Nuclear Renaissance & Small Modular Reactors | CEG | 100.0 | watch | 1 | 3 | 1 |
| Psychedelic Mental Health Revolution | JNJ | 100.0 | watch | 3 | 3 | 3 |
| Quantum Computing | GOOGL | 50.0 | clear | 0 | 0 | 0 |
| Semiconductor Sovereignty & CHIPS Act | AMAT | 100.0 | watch | 2 | 3 | 2 |
| Space Domain Awareness & Commercial Space | ASTS | 100.0 | watch | 2 | 3 | 2 |

### Failed Universes

Two thesis universes did not produce usable Alpha158 output in this run:

| Thesis Universe | Reason |
| --- | --- |
| Bioengineered Food Systems | Qlib returned no Alpha158 data for `ADM`, `CTVA`, `FMC`, `IFF`, `TMO`, `TSN` in the configured date range. |
| Capital Raise Survivors / Small-Cap Inflection Basket | Most tickers were missing from the local Qlib data store; only `NKTR` remained, and Alpha158 returned no usable data for it. |

### Cross-Thesis Read

- The highest-alert baskets were `AI Power Infrastructure`, `Defense AI & Autonomous Warfare`, and `Psychedelic Mental Health Revolution`, each with three alerts.
- Several two-stock or thin universes returned `clear` with 50.0 top scores. Those are not strong confirmations; they usually mean the cross-sectional ranking has too little breadth to be useful.
- `Space Domain Awareness & Commercial Space` remained consistent with this note: `ASTS` led, while `PL` and `MNTS` stayed in avoid/watch territory.
- The same stale-cache caveat applies across the run: score notes were generated on 2026-04-25, but their `scoring_date` remained 2026-04-01.

### Better Next Test

For a cleaner cross-thesis comparison, run the same command after refreshing the local Qlib market cache. Then add backtests only for the short list of theses that matter most:

```powershell
node scripts/run.mjs quant refresh --all
node scripts/run.mjs quant refresh --thesis "Space Domain Awareness" --with-backtest
node scripts/run.mjs quant refresh --thesis "Defense AI & Autonomous Warfare" --with-backtest
node scripts/run.mjs quant refresh --thesis "AI Power Infrastructure" --with-backtest
```
