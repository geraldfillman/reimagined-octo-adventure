---
type: position-structure-ledger
parent: "[[Market Positioning Ledger]]"
cadence: continuous
created: 2026-06-02
last_reviewed: 2026-06-03
last_reset: 2026-06-03
reset_reason: phase-d-regime-bootstrap
tags:
  - positioning
  - position-structure
  - options
  - trade-expression
---

# Market Positioning Ledger — Positions

Detailed position structure for every Gate≥2 row in [[Market Positioning Ledger]].

Every block must carry: **Position Reasoning · Direction · Purpose · Instrument · Structure · Entry · Stop / Invalidation · Targets · Max Loss · Max Profit · Reward:Risk · Breakeven · Sizing · Hold Window · Conviction · Correlation · Exit Plan · Catalyst Calendar.**

If the structure uses **options**, all five tags are mandatory: **Direction Exposure · Protection · Income · Volatility Stance · Defined Risk.**

Position state defaults to **flat** unless explicitly noted, per [[AGENTS|AGENTS.md]] §Strategy Expression Rules. Action labels: `Observe`, `Prepare`, `Triggered`, `Invalidated`.

---

## Active Position Blocks

## liquidity-friction-tail-hedge

> Parent row: [[Market Positioning Ledger#Active Ledger|Liquidity Friction Tail Hedge]] · Gate 2 · Stance: Prepare

**Position Reasoning.** The macro stress score is low and credit is currently clear, but the confluence scan repeatedly keeps FRED Liquidity Pull rows on watchlist and SKEW is elevated while VIX remains compressed. That combination favors a defined-risk hedge candidate rather than a bearish index call: wait for evidence that liquidity watch signals are transmitting into vol or credit before paying for protection.

| Field | Value |
|---|---|
| Action Label | Prepare |
| Position State | Flat |
| Direction Tag | Downside |
| Purpose Tag | Protection |
| Instrument | SPY or QQQ put spread, 30-45 DTE, strikes selected only after manual options review |
| Structure | Defined-risk debit put spread sized as portfolio insurance; no short uncovered options |
| Entry | Prepare a fresh entry only if VIX closes above 18.5 or VIX3M-VIX slope compresses below +2.0 while SKEW remains above 140 and credit/liquidity notes stay watch or worse. |
| Stop / Invalidation | Stand aside if VIX remains below 17, VIX3M-VIX stays above +3.0, and credit stress remains clear for three consecutive S6 reviews. |
| Target 1 | First review target is a volatility impulse: VIX above 20 or SPY/QQQ break below the prior value-area low. |
| Target 2 | Second review target is confirmed transmission: credit or funding stress joins the liquidity watchlist. |
| Max Loss | Premium paid for the debit spread; cap at a small predefined hedge budget after manual options review. |
| Max Profit | Spread width minus debit paid. |
| Reward:Risk | Only acceptable if quoted spread offers at least 2:1 payoff to target_1 after manual liquidity check. |
| Breakeven | Long put strike minus net debit. |
| Sizing | Hedge candidate only; maximum 0.25R until Phase 1 calibration exists. |
| Hold Window | 30-45 calendar days, reviewed at each S6 close. |
| Conviction | OOOoo |
| Correlation | Negatively correlated to broad equity beta; avoid duplicating other downside hedges. |
| Exit Plan | Exit half if target_1 fires; exit remainder if target_2 fails to confirm within five trading days or invalidation triggers. |
| Catalyst Calendar | Near-term macro/liquidity updates, credit spread checks, and daily VIX/SKEW refreshes. |

**Option-Tag Stack:**

| Tag | Value |
|---|---|
| Direction Exposure | Downside |
| Protection | Yes (put spread hedge) |
| Income | No |
| Volatility Stance | Long vol |
| Defined Risk | Yes (debit spread) |

---

## hard-assets-dollar-debasement-watch

> Parent row: [[Market Positioning Ledger#Active Ledger|Hard Assets Debasement Watch]] · Gate 1 · Stance: Observe

**Position Reasoning.** The macro bridge shows a modestly softer dollar proxy and the opportunity viewpoint layer flags Dollar Debasement Hard Money as positive conviction momentum. Gold is down slightly on the latest snapshot, so the signal is not triggered; it belongs as an Observe row waiting for price and confirmation rather than an entry candidate.

| Field | Value |
|---|---|
| Action Label | Observe |
| Position State | Flat |
| Direction Tag | Upside |
| Purpose Tag | Directional |
| Instrument | GLD, gold futures, or gold-miner basket after independent confirmation |
| Structure | No position structure yet; watch for spot gold reclaim and dollar weakness confirmation before defining instrument. |
| Entry | Prepare a fresh entry only if XAUUSD reclaims the prior snapshot level near 4488 and the DXY proxy continues lower in the next macro bridge pull. |
| Stop / Invalidation | Stand aside if XAUUSD breaks below the latest pull level of 4476.31 while the DXY proxy rises back above 119.03. |
| Target 1 | Gate 1 to 2 review if hard-asset momentum confirms across macro bridge and SourceWatch. |
| Target 2 | Gate 2 to 3 only if price confirmation and independent macro/narrative confirmation align. |
| Max Loss | Not applicable until promoted; define before any Gate 2 structure. |
| Max Profit | Not applicable until promoted. |
| Reward:Risk | Not applicable until promoted. |
| Breakeven | Not applicable until promoted. |
| Sizing | Observation only; no size. |
| Hold Window | Two S6 reviews or until next macro bridge refresh confirms/invalidates. |
| Conviction | OOooo |
| Correlation | Could overlap with dollar-short and commodity-long expressions; avoid duplicate hard-asset exposure. |
| Exit Plan | Remove or leave at Gate 1 if confirmation is absent after two fresh macro bridge pulls. |
| Catalyst Calendar | Next macro bridge pull, dollar proxy update, and SourceWatch hard-asset headlines. |

**Option-Tag Stack:**

| Tag | Value |
|---|---|
| Direction Exposure | Upside |
| Protection | No |
| Income | No |
| Volatility Stance | Vega-neutral |
| Defined Risk | No (watch-only, no trade structure) |

---

## energy-shock-oil-watch

> Parent row: [[Market Positioning Ledger#Active Ledger|Energy Shock Oil Watch]] · Gate 1 · Stance: Prepare

**Position Reasoning.** SourceWatch captured a fresh oil/geopolitical headline while USO remains balanced in the auction scan. That is an early catalyst watch rather than a confirmed breakout: the row should monitor whether geopolitical risk turns into price movement, inflation impulse, or cross-asset stress.

| Field | Value |
|---|---|
| Action Label | Prepare |
| Position State | Flat |
| Direction Tag | Upside |
| Purpose Tag | Directional |
| Instrument | USO, XLE, crude futures, or a defined-risk call spread after confirmation |
| Structure | Watch-only until USO breaks value-area high with volume or a second independent source confirms supply disruption. |
| Entry | Prepare a fresh entry if USO closes above the auction value-area high near 137.18 with relative-volume confirmation or if a second independent source confirms material supply disruption. |
| Stop / Invalidation | Stand aside if USO stays inside the 134.73-137.18 value area and follow-up sources do not confirm supply disruption. |
| Target 1 | Gate 2 review if USO breaks value-area high with confirmation. |
| Target 2 | Gate 3 review only if energy move transmits into inflation/rates or equity sector leadership. |
| Max Loss | Not applicable until promoted; define spread debit or futures stop before Gate 2. |
| Max Profit | Not applicable until promoted. |
| Reward:Risk | Not applicable until promoted. |
| Breakeven | Not applicable until promoted. |
| Sizing | Observation/preparation only; no size. |
| Hold Window | One week or until the headline is either confirmed by price/action or archived. |
| Conviction | OOooo |
| Correlation | Correlates with inflation impulse, energy equities, and potential risk-off shock; avoid pairing with unconfirmed broad beta longs. |
| Exit Plan | Archive if follow-up sources fade and USO remains balanced; promote only with price and source confirmation. |
| Catalyst Calendar | Next SourceWatch energy scan, USO auction scan, and macro-volatility refresh. |

**Option-Tag Stack:**

| Tag | Value |
|---|---|
| Direction Exposure | Upside |
| Protection | No |
| Income | No |
| Volatility Stance | Long vol |
| Defined Risk | Yes if promoted via call spread; currently watch-only |

---

## quality-software-dispersion

> Parent row: [[Market Positioning Ledger#Active Ledger|Quality Software Dispersion]] · Gate 2 · Stance: Prepare

**Position Reasoning.** The cash-flow quality scan identifies high-quality software/workflow names while the ORB screen shows tactical dispersion, including INTU as a short candidate despite high CFQ. In a low-stress, balanced-auction regime, this is not a broad software fade; it is a dispersion watch where quality and intraday tape disagree and require confirmation.

| Field | Value |
|---|---|
| Action Label | Prepare |
| Position State | Flat |
| Direction Tag | Neutral |
| Purpose Tag | Directional |
| Instrument | Pair-style watch: long high-CFQ software basket versus short confirmed weak tactical setup, or single-name defined-risk expression after options review |
| Structure | Prepare a fresh entry only after manual liquidity and event checks; use defined-risk options or small equity pair, no uncovered short options. |
| Entry | Gate 3 only if a high-CFQ name confirms relative strength while a tactical short candidate such as INTU remains below its ORB trigger/invalidates quality support through price. |
| Stop / Invalidation | Stand aside if auction structure remains balanced and the tactical short candidate reclaims its ORB/VWAP levels or if breadth broadens in software. |
| Target 1 | Initial target is relative performance spread widening over one to five sessions. |
| Target 2 | Second target is confirmation from follow-up confluence scan or filing/earnings catalyst. |
| Max Loss | Define as pair stop or option debit; cap at 0.25R until liquidity checks are complete. |
| Max Profit | Depends on selected expression; require at least 1.5:1 to first target before activation. |
| Reward:Risk | Minimum 1.5:1 to target_1 after final instrument selection. |
| Breakeven | Expression-specific; must be written before promotion above Gate 2. |
| Sizing | Tactical watch candidate; maximum 0.25R if promoted. |
| Hold Window | One to five trading days after trigger confirmation. |
| Conviction | OOOoo |
| Correlation | Designed to reduce broad market beta, but can still load on software factor and growth duration. |
| Exit Plan | Exit if relative spread fails to widen within two sessions after trigger or if market breadth expansion overwhelms dispersion. |
| Catalyst Calendar | Next ORB/entropy scan, options review, and any software earnings or filing updates. |

**Option-Tag Stack:**

| Tag | Value |
|---|---|
| Direction Exposure | Neutral |
| Protection | Yes if expressed as defined-risk options |
| Income | No |
| Volatility Stance | Vega-neutral |
| Defined Risk | Yes (spread or capped pair risk) |

---


---

## Template — Add a New Position Block

Copy and rename to match the parent ledger row slug.

```markdown
## <slug-matching-ledger-row>

> Parent row: [[Market Positioning Ledger#Active Ledger|<Row Name>]] · Gate <n> · Stance: <stance>

**Position Reasoning.** <1 paragraph: why this thesis, why now, why this structure over the alternatives.>

| Field | Value |
|---|---|
| Action Label | Observe / Prepare / Triggered / Invalidated |
| Position State | Flat / Open / Pending-trigger / Closed |
| Direction Tag | Upside / Downside / Neutral / Volatility |
| Purpose Tag | Directional / Protection / Income / Volatility / Defined-Risk / Hedge |
| Instrument | <underlying + expiry + strikes> |
| Structure | <leg-by-leg, debit/credit> |
| Entry | <trigger condition + price + required confirmation> |
| Stop / Invalidation | <hard stop or thesis-invalidation level, volume/close qualifier> |
| Target 1 | <level + meaning> |
| Target 2 | <level + meaning> |
| Max Loss | <$ defined> |
| Max Profit | <$ capped or "open"> |
| Reward:Risk | <ratio at T1 / T2> |
| Breakeven | <level + sigma> |
| Sizing | <unit + tactical / core> |
| Hold Window | <weeks, expiry-fit> |
| Conviction | ●○○○○ to ●●●●● |
| Correlation | <e.g. "X-SPY 20d +0.84 — not a diversifier"> |
| Exit Plan | <profit-take rule + roll/close + early-exit conditions> |
| Catalyst Calendar | <hard dates governing theta/IV> |

**Option-Tag Stack** (required if structure uses options):

| Tag | Value |
|---|---|
| Direction Exposure | Upside / Downside / Neutral |
| Protection | Yes (protective put, collar, OTM hedge) / No |
| Income | Yes (covered call, CSP, credit spread) / No |
| Volatility Stance | Long vol / Short vol / Vega-neutral |
| Defined Risk | Yes (debit/credit spread, fly, condor) / No (naked, futures) |
```

## Closed / Outcome Section

When a position closes, move its block here with an outcome label per [[Market Positioning Ledger#Outcome Labels]] and a one-line P&L line. Keep the structure block intact for monthly playback.

_None yet._
