---
title: Agent Pull System Implementation Plan
type: playbook
tags: [playbook, agents, data-pulls, market, fmp, llm, no-langchain]
playbook_id: agent-pull-system-plan
run_command: "node run.mjs pull agent-analyst --symbol SPY"
data_sources:
  - "[[Financial Modeling Prep]]"
  - "[[NewsAPI]]"
  - "[[FRED API]]"
  - "[[CBOE_Options]]"
  - "[[Kalshi]]"
  - "[[Polymarket]]"
last_updated: 2026-04-28
---

# Agent Pull System Implementation Plan

Summary:
- Implement the screenshot system as a native vault puller, not as a LangChain or LangGraph app.
- Use the existing Node CLI, FMP Premium backbone, NewsAPI, FRED, CBOE/VIX context, markdown note writer, KB mirror, validator, and dashboard conventions.
- Model the agent architecture as fan-out/fan-in: specialist agents run concurrently, return structured signals, and a synthesis step writes one vault-native pull note.
- Keep each agent deterministic in data collection and lightweight in interpretation. The LLM never fetches data and never writes files.

Implementation status:
- 2026-04-28: Initial native puller implemented at `scripts/pullers/agent-analyst.mjs`.
- 2026-04-28: Added price, risk, sentiment, microstructure, macro, fundamentals, prediction-market, deterministic synthesis, optional direct JSON LLM synthesis, and focused unit tests.
- 2026-04-28: Prediction-market live API lookup is read-only and disabled by default.

## Screenshot Model To Preserve

The screenshots describe a parallel stock and crypto analyst with:

| Layer | Screenshot behavior | Vault adaptation |
| --- | --- | --- |
| Orchestrator | One input fans out to multiple agents | `scripts/pullers/agent-analyst.mjs` calls agent modules with `Promise.allSettled()` |
| Shared state | LangGraph state object with appended agent results | Plain JS `AgentRunState` object; agents return immutable `AgentSignal` records |
| Price agent | RSI, MACD, Bollinger, 7-day trend | FMP daily price history plus local technical indicator helpers |
| Sentiment agent | Recent headlines and positive/negative read | NewsAPI plus FMP stock news, with keyword fallback if LLM is off |
| On-chain/microstructure agent | CoinGecko for crypto, market activity for stocks | Optional CoinGecko for crypto; FMP quote/profile/float/volume/short-interest for equities |
| Macro agent | FRED, DXY, Fed funds, yield curve, Fear and Greed | FRED rates/liquidity, CBOE VIX context, macro bridge notes, optional external fear/greed client |
| Risk agent | Volatility, drawdown, VIX, Sharpe | FMP price history, ATR, realized volatility, max drawdown, beta, short interest, CBOE VIX |
| Prediction market agent | Not in original screenshots | Optional Kalshi/Polymarket event-pricing context, adapted from `jon-becker/prediction-market-analysis` schemas and ideas |
| Synthesis agent | Reads all specialist results and makes final call | Direct HTTP LLM client or deterministic weighted synthesis; writes vault note |

## Prediction Market Repo Safety Review

Reference repository:
- `https://github.com/jon-becker/prediction-market-analysis`

Safety read:
- The repository is MIT licensed, so reuse is compatible if attribution is preserved.
- It is useful as a data-model and research reference: Kalshi and Polymarket market/trade schemas, parquet conventions, DuckDB analysis patterns, and indexer organization.
- Do not run `make setup` as part of the vault pull system. It downloads a roughly 36 GiB archive from external storage and extracts it locally.
- Do not run the repo's shell setup scripts from the vault automation. The install script can invoke OS package managers, and that is too broad for a normal puller.
- Do not vendor the full Python project into `scripts/`. Its dependency set includes blockchain, cryptography, plotting, parquet, and API SDK packages that are much heavier than this agent needs.
- Safe integration path: copy concepts, schemas, and selected MIT-licensed helper logic only after review; otherwise write a thin Node client around public market endpoints and local parquet/JSON snapshots.

Conclusion:
- Safe to add as an optional, read-only prediction-market agent.
- Not safe to add as an automatic dependency install, dataset download, or opaque subprocess in the daily routine.

## Core Decision

Build this in Node, inside the current pull system.

Do not add:
- `langchain`
- `langgraph`
- `yfinance`
- `streamlit`
- a separate Python project

Use:
- Native `fetch()` through `scripts/lib/fetcher.mjs`
- Existing `scripts/lib/fmp-client.mjs`
- Existing `scripts/lib/markdown.mjs`
- Existing `.env` loading through `scripts/lib/config.mjs`
- `Promise.allSettled()` for parallel execution
- Direct OpenAI-compatible HTTP calls for synthesis, if an LLM key is configured

## Target CLI Surface

Primary commands:

```powershell
node run.mjs pull agent-analyst --symbol SPY
node run.mjs pull agent-analyst --symbol AAPL
node run.mjs pull agent-analyst --symbol BTC --asset crypto
node run.mjs pull agent-analyst --thesis "Housing Supply Correction"
node run.mjs pull agent-analyst --all-thesis --limit 25
```

Useful controls:

```powershell
node run.mjs pull agent-analyst --symbol NVDA --agents price,sentiment,macro,risk
node run.mjs pull agent-analyst --symbol SPY --skip-llm
node run.mjs pull agent-analyst --symbol SPY --json
node run.mjs pull agent-analyst --symbol SPY --dry-run
```

The `pull` group needs no router change because `routePull()` dynamically imports `scripts/pullers/<subcommand>.mjs`.

## File Plan

```text
scripts/
  pullers/
    agent-analyst.mjs             # CLI puller and orchestrator
  agents/
    marketmind/
      index.mjs                   # agent registry and shared exports
      schemas.mjs                 # AgentSignal and AgentRunState validators
      scoring.mjs                 # verdict/status aggregation helpers
      price-agent.mjs             # FMP price indicators
      sentiment-agent.mjs         # NewsAPI/FMP headlines
      microstructure-agent.mjs    # FMP market activity; optional CoinGecko
      macro-agent.mjs             # FRED/CBOE/macro bridge context
      risk-agent.mjs              # volatility, drawdown, beta, short interest
      fundamentals-agent.mjs      # FMP ratios, metrics, quality/valuation
      prediction-market-agent.mjs # Kalshi/Polymarket event probability context
      synthesis-agent.mjs         # direct LLM or deterministic synthesis
  lib/
    llm-client.mjs                # direct provider client, no LangChain
    technical-indicators.mjs      # RSI, MACD, Bollinger, ATR, SMA, EMA
    coingecko-client.mjs          # optional no-key crypto market client
    prediction-market-client.mjs  # read-only Kalshi/Polymarket search/snapshot client
```

Optional documentation and source notes:

```text
01_Data_Sources/Market_Data/CoinGecko.md
01_Data_Sources/Prediction_Markets/Kalshi.md
01_Data_Sources/Prediction_Markets/Polymarket.md
04_Reference/Prediction Market Agent.md
01_Data_Sources/Developer_Code/Groq API.md
04_Reference/Pull_System_Guide.md       # add command examples after implementation
00_Dashboard/Agent Analyst.md           # Dataview dashboard after first notes exist
```

## Data Model

Use one consistent return shape for all agents:

```js
{
  agent: "price",
  signal: "BULLISH" | "BEARISH" | "NEUTRAL",
  confidence: 0.0,
  summary: "One concise sentence.",
  raw_data: {},
  evidence: [],
  warnings: [],
  duration_ms: 0
}
```

The orchestrator state:

```js
{
  run_id: "2026-04-28_SPY",
  symbol: "SPY",
  asset_type: "stock",
  thesis: null,
  started_at: "...",
  agent_signals: [],
  final_verdict: null,
  final_confidence: null,
  final_reasoning: null,
  signal_status: "clear"
}
```

Important rule: agents do not write notes. Only the orchestrator writes to disk after all results are gathered.

## Agent Responsibilities

### 1. Price Agent

Inputs:
- FMP daily prices through `fetchDailyPrices()`
- 90 to 250 bars, depending on requested depth

Computes:
- Current close
- 7-day and 30-day change
- RSI 14
- MACD line/signal/crossover
- Bollinger position
- SMA 20/50/200

Output:
- Directional price signal
- Confidence based on agreement between trend, momentum, and mean-reversion readings
- Raw indicator table for the final note

Implementation note:
- Extract technical helpers instead of importing private functions from `pullers/fmp.mjs`.

### 2. Sentiment Agent

Inputs:
- NewsAPI recent headlines
- FMP stock news for symbol-specific headlines

Computes:
- Headline count
- Source count
- Recent positive/negative headline score
- Top sample headlines

Output:
- Sentiment signal and concise summary

Fallback:
- If the LLM key is missing, use a transparent keyword score so the run still completes.

### 3. Microstructure Agent

For stocks:
- FMP quote/profile
- Volume vs average volume
- Beta
- Market cap
- Short interest if available
- Float data if available

For crypto:
- Optional CoinGecko market data
- Rank, 24h and 7d change, volume/market cap ratio, ATH drawdown

Output:
- Market activity signal, focused on confirmation or stress in trading behavior.

### 4. Macro Agent

Inputs:
- FRED rates and liquidity series
- Existing macro bridge note where available
- CBOE VIX pull or latest local VIX context

Computes:
- Fed funds level
- 10Y-2Y curve state
- VIX regime
- Liquidity/credit stress context
- Risk-on/risk-off read for the asset type

Output:
- Macro backdrop signal.

### 5. Risk Agent

Inputs:
- FMP price history
- FMP profile/quote
- Optional short interest
- VIX context

Computes:
- Realized volatility
- Max drawdown
- ATR 14
- Sharpe-like return/volatility score
- Downside trend stress

Output:
- Risk signal. A bearish risk result should affect `signal_status` more strongly than a bullish result.

### 6. Fundamentals Agent

Inputs:
- FMP profile
- FMP ratios/key metrics cache where available
- Income statement, cash flow, balance sheet helpers from `fmp-client.mjs`

Computes:
- Valuation stretch
- Revenue direction
- Free cash flow quality
- Balance sheet risk
- Analyst target context if already cached

Output:
- Fundamental support or contradiction signal.

### 7. Prediction Market Agent

Purpose:
- Add crowd-implied probability context from prediction markets when it is relevant to a symbol, thesis, macro event, election/regulatory catalyst, crypto event, rate path, or commodity/geopolitical shock.

Reference:
- Use `jon-becker/prediction-market-analysis` as a schema and analysis-pattern reference.
- Preserve MIT attribution if any source logic is copied.
- Prefer native vault clients over vendoring the full repo.

Inputs:
- Kalshi market metadata and pricing where accessible through public or configured APIs.
- Polymarket market metadata, outcome prices, volume, liquidity, active/closed state, and end dates.
- Optional local parquet snapshots if the user separately downloads the repo dataset outside the daily routine.
- Thesis keywords, core entities, catalysts, macro regimes, and symbol aliases.

Computes:
- Relevant open prediction markets for the target symbol/thesis.
- Current implied probability and bid/ask spread.
- 24h probability movement where available.
- Volume/liquidity/open-interest quality.
- Event horizon and whether the market resolves inside the thesis timeframe.
- Crowd signal direction versus the existing thesis stance.

Output:
- `BULLISH`, `BEARISH`, or `NEUTRAL` only when market relevance and liquidity pass thresholds.
- `raw_data` should include market title, venue, URL/slug, implied probability, volume, liquidity, close date, and match reason.
- `warnings` should flag thin markets, ambiguous market matching, stale snapshots, and markets that are entertainment/sports-only noise.

Matching rules:
- For symbol analysis, match company aliases, ticker, CEO/product names, regulatory catalysts, and sector event terms.
- For thesis analysis, use `core_entities`, `supporting_regimes`, and catalyst fields from thesis frontmatter.
- Do not let broad political or sports markets influence equity thesis output unless explicitly linked to the thesis.

Fallback:
- If no relevant markets are found, return `NEUTRAL` with low confidence and a "no relevant prediction markets found" summary.
- If external APIs fail, read the latest local prediction-market pull notes before returning a failed-agent neutral record.

## Synthesis Without LangChain

Create `scripts/lib/llm-client.mjs` with:
- `chatJson({ model, messages, schemaName })`
- Provider selected by env, defaulting to direct Groq if `GROQ_API_KEY` exists
- OpenAI-compatible endpoint support so providers can be swapped without framework code
- `safeParseJson()` that strips fenced JSON and validates required fields

Suggested env vars:

```text
AGENT_LLM_PROVIDER=groq
AGENT_LLM_MODEL=llama-3.3-70b-versatile
GROQ_API_KEY=...
```

The synthesis prompt should receive only structured agent outputs and must return:

```json
{
  "final_verdict": "BULLISH",
  "final_confidence": 0.72,
  "signal_status": "watch",
  "reasoning": "Price and fundamentals support the view, but macro risk is mixed.",
  "top_drivers": ["price", "fundamentals"],
  "top_risks": ["macro"],
  "follow_up_actions": ["Refresh earnings calendar", "Check latest SEC filings"]
}
```

If no LLM key is configured, use deterministic synthesis:
- Convert bullish to +1, neutral to 0, bearish to -1.
- Weight risk and macro more heavily for downside alerts.
- Penalize high disagreement.
- Map absolute weighted confidence to `clear`, `watch`, `alert`, or `critical`.

## Signal Status Mapping

Keep `final_verdict` separate from vault `signal_status`.

| Situation | signal_status |
| --- | --- |
| Low-confidence or mixed result | `clear` |
| Directional but not urgent | `watch` |
| Strong bullish opportunity or strong bearish warning | `alert` |
| High-confidence bearish risk cluster, thesis invalidation risk, or severe drawdown/risk stress | `critical` |

This preserves the vault convention that `signal_status` means operator attention, not simply bullishness.

## Pull Note Output

Write one note per symbol or thesis target:

```text
05_Data_Pulls/Market/YYYY-MM-DD_Agent_Analysis_SPY.md
```

Frontmatter:

```yaml
title: "SPY Agent Analysis"
source: "Agent Analyst"
symbol: "SPY"
asset_type: "stock"
date_pulled: "2026-04-28"
domain: "market"
data_type: "agent_analysis"
frequency: "on-demand"
signal_status: "watch"
signals: ["AGENT_PRICE_BULLISH", "AGENT_MACRO_NEUTRAL"]
final_verdict: "BULLISH"
final_confidence: 0.72
agent_count: 6
failed_agent_count: 0
tags: ["agent-analysis", "market", "spy"]
```

Sections:
- Verdict
- Agent Signal Matrix
- Top Drivers
- Top Risks
- Agent Details
- Raw Data Snapshot
- Source Links / Related Pulls

Because `writeNote()` already mirrors `05_Data_Pulls/` notes to KB raw, this automatically enters the KB pipeline.

## Integration Points

### Pull System

Add `scripts/pullers/agent-analyst.mjs`. No router changes are required.

### Thesis System

For `--thesis`:
- Use `loadThesisWatchlists()` to resolve symbols.
- Run the analyst per symbol with a configurable concurrency limit.
- Write one symbol note plus an optional thesis rollup note.
- Add `related_theses` frontmatter links.

Future machine-managed thesis fields:
- `agent_last_run`
- `agent_primary_verdict`
- `agent_primary_confidence`
- `agent_bearish_count`
- `agent_attention_status`

### Full Picture Reports

After symbol notes are stable:
- Extend `thesis-full-picture.mjs` to read latest `agent_analysis` notes.
- Add an "Agent Read" row to structural/tactical synthesis.

### Dashboard

Phase two dashboard addition:
- New panel: Agent Analyst
- Shows latest symbol, verdict, confidence, signal status, failed agents, and note link.
- Add `/api/agent-analysis` to `scripts/dashboard/server.mjs`.

### Daily Routine

Do not add to the default daily routine immediately.

Rollout sequence:
1. Manual on-demand only.
2. Weekly run for high-priority theses.
3. Optional daily flag: `powershell scripts/daily-routine.ps1 -IncludeAgentAnalyst`.

## Implementation Phases

### Phase 1 - Skeleton And Deterministic Run

Deliver:
- `agent-analyst.mjs`
- schemas, scoring, price agent, risk agent
- deterministic synthesis
- note output

Acceptance checks:

```powershell
node run.mjs pull agent-analyst --symbol SPY --skip-llm
node run.mjs system validate
```

### Phase 2 - Data Breadth

Deliver:
- sentiment agent
- macro agent
- microstructure agent
- fundamentals agent
- prediction market agent in read-only mode
- source notes for any new sources used

Acceptance checks:

```powershell
node run.mjs pull agent-analyst --symbol AAPL --skip-llm
node run.mjs pull agent-analyst --symbol BTC --asset crypto --skip-llm
node run.mjs pull agent-analyst --thesis "Housing Supply Correction" --agents prediction-market --skip-llm
node run.mjs system validate
```

### Phase 3 - Direct LLM Synthesis

Deliver:
- `llm-client.mjs`
- direct Groq/OpenAI-compatible JSON chat call
- safe JSON parser and schema validation
- deterministic fallback on parse or provider failure

Acceptance checks:

```powershell
node run.mjs pull agent-analyst --symbol SPY
node run.mjs pull agent-analyst --symbol SPY --skip-llm
node run.mjs system validate
```

### Phase 4 - Thesis And Batch Runs

Deliver:
- `--thesis`
- `--all-thesis`
- concurrency limits
- thesis rollup note
- optional scorecard fields only after manual review

Acceptance checks:

```powershell
node run.mjs pull agent-analyst --thesis "Housing Supply Correction" --skip-llm
node run.mjs pull agent-analyst --all-thesis --limit 5 --skip-llm
node run.mjs system validate
```

### Phase 5 - Operator Surface

Deliver:
- Agent Analyst dashboard note or dashboard panel
- Pull System Guide update
- optional `daily-routine.ps1 -IncludeAgentAnalyst`

Acceptance checks:

```powershell
node run.mjs system dashboard
```

Then inspect the dashboard panel at `http://localhost:3737`.

## Testing Plan

Add focused tests:

```text
scripts/tests/agent-technical-indicators.test.mjs
scripts/tests/agent-scoring.test.mjs
scripts/tests/agent-schema.test.mjs
scripts/tests/agent-synthesis-fallback.test.mjs
```

Test cases:
- RSI/MACD/Bollinger calculations on fixture bars
- `Promise.allSettled()` failure produces a neutral failed-agent record
- deterministic synthesis maps mixed results to `clear` or `watch`
- risk-heavy bearish cluster maps to `alert` or `critical`
- generated frontmatter satisfies pull-note schema
- LLM malformed JSON falls back without aborting the whole pull

## Risk Controls

- No agent writes files directly.
- No LLM output is accepted without JSON validation.
- Every API agent has a timeout and neutral fallback.
- Batch thesis mode has concurrency limits.
- New LLM and crypto sources are optional, not required for the deterministic core.
- Prediction-market integration is read-only by default.
- The Becker repo is not run as an opaque subprocess in the daily workflow.
- The 36 GiB public dataset is never downloaded automatically; it must be an explicit one-off setup task if used.
- Shell setup scripts and OS package installs from external repos are not part of puller execution.
- The first release should not update thesis scorecards automatically.
- The system should label results as research synthesis, not trade instructions.

## Recommended First Implementation Slice

Build the smallest useful version first:

1. `technical-indicators.mjs`
2. `price-agent.mjs`
3. `risk-agent.mjs`
4. `scoring.mjs`
5. `agent-analyst.mjs`
6. markdown note output

That gives a working no-LangChain parallel agent puller using existing FMP data before adding LLM synthesis, crypto, or dashboard work.
