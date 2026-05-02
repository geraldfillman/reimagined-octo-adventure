/**
 * vault-process-canvas.mjs
 *
 * Generates 00_Dashboard/Vault Process Flow.canvas — a directed-graph
 * Canvas showing how every script, lib module, data pull, and agent
 * connects in the My_Data vault.
 *
 * Run: node scripts/pullers/vault-process-canvas.mjs
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { getVaultRoot } from '../lib/config.mjs';

// ─── Layout constants ────────────────────────────────────────────────────────

const COL_W = 900;   // standard node width
const COL_GAP = 60;  // gap between columns
const NODE_H = 700;  // standard node height
const LABEL_H = 70;  // section label height
const LAYER_GAP = 90; // vertical gap between layers

const colX = (i) => i * (COL_W + COL_GAP);
const TOTAL_W = colX(6); // 6 columns → 5700px

// y-origin for each layer (label + nodes)
const LAYERS = {
  title:    0,
  srcLabel: 80,
  src:      80 + LABEL_H,
  libLabel: 80 + LABEL_H + NODE_H + LAYER_GAP,
  lib:      80 + LABEL_H + NODE_H + LAYER_GAP + LABEL_H,
  pullLabel: 80 + LABEL_H + NODE_H + LAYER_GAP + LABEL_H + NODE_H + LAYER_GAP,
  pull:      80 + LABEL_H + NODE_H + LAYER_GAP + LABEL_H + NODE_H + LAYER_GAP + LABEL_H,
};
// MarketMind starts after pull layer
LAYERS.mmLabel = LAYERS.pull + NODE_H + LAYER_GAP;
LAYERS.mm      = LAYERS.mmLabel + LABEL_H;
// Outputs start after MarketMind
LAYERS.outLabel = LAYERS.mm + NODE_H + LAYER_GAP;
LAYERS.out      = LAYERS.outLabel + LABEL_H;
// Domain agents start after outputs
LAYERS.agtLabel = LAYERS.out + NODE_H + LAYER_GAP;
LAYERS.agt      = LAYERS.agtLabel + LABEL_H;

// ─── Node helpers ────────────────────────────────────────────────────────────

let _edgeSeq = 0;
const edgeId = () => `e${String(++_edgeSeq).padStart(3, '0')}`;

function textNode(id, col, layer, text, color, overrides = {}) {
  return {
    id,
    type: 'text',
    text,
    x: colX(col),
    y: LAYERS[layer],
    width: overrides.width ?? COL_W,
    height: overrides.height ?? NODE_H,
    ...(color ? { color } : {}),
    ...overrides,
  };
}

function labelNode(id, layer, text, color) {
  return {
    id,
    type: 'text',
    text,
    x: 0,
    y: LAYERS[layer],
    width: TOTAL_W,
    height: LABEL_H,
    color,
  };
}

function fileNode(id, col, layer, file, overrides = {}) {
  return {
    id,
    type: 'file',
    file,
    x: colX(col),
    y: LAYERS[layer],
    width: overrides.width ?? COL_W,
    height: overrides.height ?? NODE_H,
    ...overrides,
  };
}

function edge(from, to, label) {
  return {
    id: edgeId(),
    fromNode: from,
    fromSide: 'bottom',
    toNode: to,
    toSide: 'top',
    ...(label ? { label } : {}),
  };
}

// ─── Nodes ───────────────────────────────────────────────────────────────────

const nodes = [

  // ── Title ──────────────────────────────────────────────────────────────────
  {
    id: 'title',
    type: 'text',
    text: '# VAULT PROCESS FLOW — Scripts × Lib Modules × Agents × Data Pulls',
    x: 0,
    y: LAYERS.title,
    width: TOTAL_W,
    height: LABEL_H,
    color: '4',
  },

  // ── Layer 1: External Data Sources ─────────────────────────────────────────
  labelNode('lbl_src', 'srcLabel', '# EXTERNAL DATA SOURCES', '3'),

  textNode('src_market', 0, 'src',
    '## Financial Modeling Prep (FMP)\n\n' +
    '- Daily OHLCV bars (260–420 days)\n' +
    '- Intraday 1-min bars\n' +
    '- Company profile, float, short interest\n' +
    '- Income statement, cash flow, balance sheet\n' +
    '- Stock news headlines\n' +
    '- Insider trades, institutional ownership\n' +
    '- TTM ratios, analyst estimates\n\n' +
    '**Key:** `FINANCIAL_MODELING_PREP_API_KEY`',
    '3'),

  textNode('src_macro', 1, 'src',
    '## FRED + CBOE\n\n' +
    '**FRED** (St. Louis Fed)\n' +
    '- Federal funds rate\n' +
    '- 10Y–2Y yield curve spread\n' +
    '- VIX (CBOE Volatility Index)\n' +
    '- HY credit spreads\n\n' +
    '**CBOE** (CSV endpoint)\n' +
    '- Daily put/call ratio\n' +
    '- Skew index\n' +
    '- VIX term structure\n\n' +
    '**Key:** `FRED_API_KEY`',
    '3'),

  textNode('src_sec', 2, 'src',
    '## SEC EDGAR\n\n' +
    '*(No API key required)*\n\n' +
    '- Company facts (XBRL)\n' +
    '- Annual / quarterly filings\n' +
    '  (10-K, 10-Q, 8-K)\n' +
    '- S-3 shelf registrations\n' +
    '- Form 4 insider filings\n' +
    '- Full-text EFTS search\n' +
    '- Ticker ↔ CIK mapping\n\n' +
    'Accessed via `edgar.mjs` +\n' +
    '`cik-map.mjs`',
    '3'),

  textNode('src_bio', 3, 'src',
    '## Biotech & Research APIs\n\n' +
    '**openFDA**\n' +
    '- Drug approvals, adverse events\n' +
    '- Recalls and enforcement\n\n' +
    '**ClinicalTrials.gov** *(no key)*\n' +
    '- Trial registrations\n' +
    '- Phase, status, enrollment\n\n' +
    '**NCBI PubMed** *(no key)*\n' +
    '- Scientific literature search\n\n' +
    '**Key:** `FDA_OPEN_DATA_API_KEY`',
    '3'),

  textNode('src_news', 4, 'src',
    '## News & Research APIs\n\n' +
    '**NewsAPI**\n' +
    '- Breaking headline search\n' +
    '- Keyword + source filtering\n\n' +
    '**arXiv** *(no key)*\n' +
    '- Preprint paper search\n' +
    '- Atom feed query\n\n' +
    '**OpenAlex** *(no key)*\n' +
    '- Academic research graph\n\n' +
    '**OSINT feeds**\n' +
    '- Reddit (pushshift / native)\n' +
    '- Telegram channels\n' +
    '- OpenCorporates\n\n' +
    '**Key:** `NEWSAPI_API_KEY`',
    '3'),

  textNode('src_gov', 5, 'src',
    '## Government & Energy APIs\n\n' +
    '**EIA** (Energy Information Admin)\n' +
    '- Electricity generation / demand\n' +
    '- Natural gas, petroleum\n\n' +
    '**BEA** (Bureau of Economic Analysis)\n' +
    '- GDP, personal income\n\n' +
    '**SAM.gov** — federal contracts\n\n' +
    '**FPDS** — procurement data\n\n' +
    '**OpenFEMA** *(no key)*\n' +
    '- Disaster declarations\n\n' +
    '**Keys:** `EIA_API_KEY`, `BEA_API_KEY`,\n' +
    '`SAM_GOV_API_KEY`',
    '3'),

  // ── Layer 2: Lib Modules ────────────────────────────────────────────────────
  labelNode('lbl_lib', 'libLabel', '# LIB MODULES  (`scripts/lib/`)', '6'),

  textNode('lib_fmp', 0, 'lib',
    '## fmp-client.mjs\n\n' +
    'FMP REST wrapper\n\n' +
    '**Exports**\n' +
    '- `getHistoricalPrices(sym, days)`\n' +
    '- `getIntradayBars(sym, interval)`\n' +
    '- `getProfile(sym)` — float, mktcap\n' +
    '- `getFinancials(sym)` — IS/CF/BS\n' +
    '- `getStockNews(sym, limit)`\n' +
    '- `getShortInterest(sym)`\n' +
    '- `getInsiderTrades(sym)`\n' +
    '- `getTTMRatios(sym)`\n\n' +
    'Used by: price, risk, fund, sent,\n' +
    'micro agents + most pullers',
    '6'),

  textNode('lib_edgar', 1, 'lib',
    '## edgar.mjs + cik-map.mjs\n\n' +
    '`edgar.mjs`\n' +
    '- `getCompanyFacts(cik)`\n' +
    '- `getFilings(cik, forms)`\n' +
    '- `getShelfCapacity(cik)` — S-3 math\n' +
    '- Full-text EFTS search wrapper\n\n' +
    '`cik-map.mjs`\n' +
    '- Ticker → CIK lookup\n' +
    '- Cached bulk company tickers JSON\n\n' +
    '`dilution-rules.mjs`\n' +
    '- Shelf capacity math\n' +
    '- Overhang % calculation\n' +
    '- Alert threshold logic',
    '6'),

  textNode('lib_fetch', 2, 'lib',
    '## fetcher.mjs + bars.mjs\n\n' +
    '`fetcher.mjs`\n' +
    '- `fetchJSON(url, opts)` — retry + timeout\n' +
    '- `fetchAll(tasks)` — concurrent map\n' +
    '- Rate-limit aware (configurable)\n\n' +
    '`bars.mjs`\n' +
    '- OHLCV normalization\n' +
    '- ATR14 calculation\n' +
    '- Relative volume computation\n\n' +
    '`markdown.mjs`\n' +
    '- Note builder (headers, tables)\n' +
    '- Frontmatter injection\n\n' +
    '`obsidian-cli.mjs`\n' +
    '- Set frontmatter properties via\n' +
    '  Obsidian Local REST API',
    '6'),

  textNode('lib_llm', 3, 'lib',
    '## llm-client.mjs\n\n' +
    'Claude API integration\n\n' +
    '**Exports**\n' +
    '- `chatJSON(system, user)` —\n' +
    '  returns parsed JSON from Claude\n' +
    '- JSON-mode enforcement via\n' +
    '  system prompt contract\n' +
    '- Model: claude-sonnet-4-6\n\n' +
    'Used exclusively by\n' +
    '`synthesis-agent.mjs` to produce\n' +
    'the final BULLISH / BEARISH /\n' +
    'NEUTRAL verdict + status tier',
    '6'),

  textNode('lib_config', 4, 'lib',
    '## config.mjs + system libs\n\n' +
    '`config.mjs`\n' +
    '- `.env` loader (dotenv)\n' +
    '- `getVaultRoot()` — vault path\n' +
    '- `getPullsDir()` — `05_Data_Pulls/`\n' +
    '- `getSignalsDir()` — `06_Signals/`\n' +
    '- `getApiKey(sourceId)` — key registry\n\n' +
    '`sector-map.mjs`\n' +
    '- Ticker → sector/industry\n\n' +
    '`schema.mjs`\n' +
    '- Zod schemas for pull frontmatter\n\n' +
    '`kb-bridge.mjs`\n' +
    '- Knowledge base integration shim',
    '6'),

  textNode('lib_mm', 5, 'lib',
    '## MarketMind signal libs\n\n' +
    '`entropy.mjs`\n' +
    '- Shannon entropy over OHLCV bins\n' +
    '- Normalized 0–1 score\n' +
    '- `sessionEntropy(bars)` export\n\n' +
    '`scoring.mjs`\n' +
    '- Deterministic weighted sum of\n' +
    '  7 agent confidence scores\n' +
    '- Weights from `config/scoring-weights.json`\n\n' +
    '`schemas.mjs`\n' +
    '- Signal object shape:\n' +
    '  `{ confidence, direction, summary, raw_data }`\n\n' +
    '`utils.mjs`\n' +
    '- Formatting helpers, verdict labels',
    '6'),

  // ── Layer 3: Puller Scripts ─────────────────────────────────────────────────
  labelNode('lbl_pull', 'pullLabel', '# PULLER SCRIPTS  (`scripts/pullers/`)', '5'),

  textNode('pull_market', 0, 'pull',
    '## Market Pullers\n\n' +
    '`orb-entropy.mjs`\n' +
    'ORB trade sheet — 9:35 AM daily\n' +
    'Builds 5-min open-range candle,\n' +
    'applies entropy + gap + VWAP filters\n\n' +
    '`rel-vol-screen.mjs`\n' +
    'Top 20 by relative volume (9:00 AM)\n\n' +
    '`entropy-compression-scan.mjs`\n' +
    '~774-symbol nightly scan;\n' +
    'flags sustained compression ≤ 0.50\n\n' +
    '`backtest-orb-eod.mjs`\n' +
    'End-of-day ORB strategy backtest\n\n' +
    '`earnings-entropy.mjs`\n' +
    'Intraday entropy before earnings\n\n' +
    '`outcome-review.mjs`\n' +
    'Reviews recent signal outcomes',
    '5'),

  textNode('pull_fund', 1, 'pull',
    '## Fundamentals Pullers\n\n' +
    '`dilution-monitor.mjs`\n' +
    'Batch shelf capacity scan;\n' +
    'tracks ATM overhang + dilution risk;\n' +
    'writes `06_Signals/` notes directly\n\n' +
    '`dd-report.mjs`\n' +
    'One-click due diligence —\n' +
    'IPO, ownership, float, filings\n\n' +
    '`capital-raise.mjs`\n' +
    'Daily offerings sweep (S-3, S-1)\n\n' +
    '`disclosure-reality.mjs`\n' +
    'Ranks EDGAR filings by materiality\n\n' +
    '`company-risk-scan.mjs`\n' +
    'Fundamental + regulatory +\n' +
    'sentiment risk events',
    '5'),

  textNode('pull_macro', 2, 'pull',
    '## Macro Pullers\n\n' +
    '`fred.mjs`\n' +
    'FRED series snapshot:\n' +
    'Fed funds, 10Y-2Y, VIX proxy,\n' +
    'HY spreads, unemployment\n\n' +
    '`eia.mjs`\n' +
    'Energy: weekly petroleum,\n' +
    'electricity demand, NG storage\n\n' +
    '`bea.mjs`\n' +
    'GDP, personal income,\n' +
    'PCE deflator\n\n' +
    '`cboe.mjs`\n' +
    'Daily put/call ratio, skew,\n' +
    'VIX term structure snapshot',
    '5'),

  textNode('pull_bio', 3, 'pull',
    '## Biotech & Research Pullers\n\n' +
    '`fda.mjs`\n' +
    'Drug approvals (PDUFA dates),\n' +
    'adverse events, recalls\n\n' +
    '`arxiv.mjs`\n' +
    'Preprint search by keyword;\n' +
    'returns abstracts + metadata\n\n' +
    '`clinicaltrials.mjs`\n' +
    'Trial registrations by drug /\n' +
    'sponsor; phase + status\n\n' +
    '`pubmed.mjs`\n' +
    'NCBI literature search;\n' +
    'returns citations + abstracts',
    '5'),

  textNode('pull_osint', 4, 'pull',
    '## OSINT & Media Pullers\n\n' +
    '`newsapi.mjs`\n' +
    'Keyword headline sweep;\n' +
    'sentiment tagging\n\n' +
    '`reddit.mjs`\n' +
    'Subreddit scanner (pushshift /\n' +
    'native API); tracks mentions\n\n' +
    '`telegram.mjs`\n' +
    'Channel monitor via\n' +
    'Telegram MTProto\n\n' +
    '`opensecrets.mjs`\n' +
    'Political contribution\n' +
    'and lobbying data\n\n' +
    '`signal-tracker.mjs`\n' +
    'Reads `06_Signals/` and\n' +
    'surfaces active alerts',
    '5'),

  textNode('pull_gov', 5, 'pull',
    '## Government & Energy Pullers\n\n' +
    '`sam.mjs`\n' +
    'SAM.gov contract awards\n' +
    'and debarment records\n\n' +
    '`fpds.mjs`\n' +
    'Federal procurement data;\n' +
    'contractor spend by agency\n\n' +
    '`fema.mjs`\n' +
    'OpenFEMA disaster declarations\n' +
    '+ individual assistance data\n\n' +
    '`convergence-scan.mjs`\n' +
    'Reads alert/critical notes\n' +
    'across all domains; fires\n' +
    '`06_Signals/` convergence note\n' +
    'when 3+ domains flag same thesis',
    '5'),

  // ── Layer 4: MarketMind Agent Pipeline ─────────────────────────────────────
  labelNode('lbl_mm', 'mmLabel', '# MARKETMIND AGENT PIPELINE  (`scripts/agents/marketmind/`)', '4'),

  textNode('mm_agents', 0, 'mm',
    '## Specialist Agents — parallel execution\n' +
    'Each produces `{ confidence: 0–1, direction, summary, raw_data }`\n\n' +
    '| Agent | Script | Data Source | Signal Focus |\n' +
    '| --- | --- | --- | --- |\n' +
    '| Price | `price-agent.mjs` | FMP 260–420 bars | SMA, EMA, MACD, RSI, Bollinger |\n' +
    '| Risk | `risk-agent.mjs` | FMP price + profile | Volatility, max drawdown, Sharpe |\n' +
    '| Fundamentals | `fundamentals-agent.mjs` | FMP IS/CF/BS | Margins, growth, debt load |\n' +
    '| Sentiment | `sentiment-agent.mjs` | FMP news + NewsAPI | Keyword bullish/bearish scoring |\n' +
    '| Macro | `macro-agent.mjs` | FRED | Yield curve, VIX, HY spreads |\n' +
    '| Microstructure | `microstructure-agent.mjs` | FMP 1-min bars | Entropy, float, positioning |\n' +
    '| Prediction Market | `prediction-market-agent.mjs` | Event APIs | Corporate event consensus |',
    '4',
    { width: colX(4) - COL_GAP }),  // spans first 4 columns

  textNode('mm_synth', 4, 'mm',
    '## synthesis-agent.mjs\n\n' +
    '**Claude LLM** (JSON-mode)\n\n' +
    'Reads all 7 confidence scores\n' +
    '+ deterministic weighted sum\n' +
    'from `scoring.mjs`\n\n' +
    '↓\n\n' +
    '**BULLISH / BEARISH / NEUTRAL**\n\n' +
    'status tier:\n' +
    '`clear` · `watch` · `alert` · `critical`\n\n' +
    'Returns structured JSON verdict',
    '1'),

  textNode('mm_orch', 5, 'mm',
    '## agent-analyst.mjs\n\n' +
    'Orchestrator\n\n' +
    'Runs all 8 agents in parallel\n' +
    'for a given symbol/thesis\n\n' +
    'Writes pull note:\n' +
    '`05_Data_Pulls/\n' +
    ' YYYY-MM-DD_\n' +
    ' Agent_Analysis_{sym}.md`\n\n' +
    'Also feeds:\n' +
    '`convergence-scan.mjs`\n' +
    'which reads alert/critical\n' +
    'notes for multi-domain signals',
    '1'),

  // ── Layer 5: Data Pull Outputs ──────────────────────────────────────────────
  labelNode('lbl_out', 'outLabel', '# DATA PULL OUTPUTS  (`05_Data_Pulls/`  ·  `06_Signals/`)', '2'),

  textNode('out_market', 0, 'out',
    '## 05_Data_Pulls/Market/\n\n' +
    'Timestamped markdown notes:\n\n' +
    '- `YYYY-MM-DD_ORB_Entropy_Screen.md`\n' +
    '- `YYYY-MM-DD_FMP_RelVol_Screen.md`\n' +
    '- `YYYY-MM-DD_Entropy_Compression_Scan.md`\n' +
    '- `YYYY-MM-DD_Entropy_Backtest_*.md`\n' +
    '- `YYYY-MM-DD_Agent_Analysis_{sym}.md`\n\n' +
    'Frontmatter includes:\n' +
    '`domain`, `signal_status`, `signals[]`,\n' +
    '`agent_owner`, `date_pulled`',
    '2'),

  textNode('out_fund', 1, 'out',
    '## 05_Data_Pulls/Fundamentals/\n\n' +
    'Timestamped markdown notes:\n\n' +
    '- `YYYY-MM-DD_Dilution_Monitor.md`\n' +
    '- `YYYY-MM-DD_DD_Report_{sym}.md`\n' +
    '- `YYYY-MM-DD_Capital_Raise.md`\n' +
    '- `YYYY-MM-DD_Disclosure_Reality.md`\n\n' +
    'Also writes per-ticker signal notes\n' +
    'directly to `06_Signals/` when\n' +
    'dilution thresholds are breached',
    '2'),

  textNode('out_macro', 2, 'out',
    '## 05_Data_Pulls/Macro/\n\n' +
    'Timestamped markdown notes:\n\n' +
    '- `YYYY-MM-DD_FRED_Snapshot.md`\n' +
    '- `YYYY-MM-DD_EIA_Weekly.md`\n' +
    '- `YYYY-MM-DD_BEA_GDP.md`\n' +
    '- `YYYY-MM-DD_CBOE_Options.md`\n\n' +
    '**Also feeds:**\n' +
    '05_Data_Pulls/Energy/\n' +
    '05_Data_Pulls/Government/',
    '2'),

  textNode('out_backtest', 3, 'out',
    '## 05_Data_Pulls/Backtest/\n\n' +
    'Timestamped markdown notes:\n\n' +
    '- `YYYY-MM-DD_ORB_EOD_Backtest.md`\n\n' +
    '- Strategy performance tables\n' +
    '- Parameter sweep results\n' +
    '- Equity curve data',
    '2'),

  textNode('out_bio', 4, 'out',
    '## 05_Data_Pulls/Biotech/ + Research/\n\n' +
    '`Biotech/`\n' +
    '- FDA approval / PDUFA watches\n' +
    '- Clinical trial updates\n' +
    '- Adverse event flags\n\n' +
    '`Research/`\n' +
    '- arXiv preprint sweeps\n' +
    '- PubMed literature alerts\n\n' +
    '**Also:**\n' +
    '05_Data_Pulls/News/\n' +
    '05_Data_Pulls/OSINT/',
    '2'),

  textNode('out_signals', 5, 'out',
    '## 06_Signals/\n\n' +
    'Discrete signal notes — written when\n' +
    'confidence exceeds threshold:\n\n' +
    '`YYYY-MM-DD_DILUTION_{SYM}.md`\n' +
    '`YYYY-MM-DD_Convergence.md`\n' +
    '`YYYY-MM-DD_AGENT_{SYM}.md`\n\n' +
    '**Status tiers:**\n' +
    '`critical` — immediate attention\n' +
    '`alert` — monitor closely\n' +
    '`watch` — track progression\n' +
    '`clear` — resolved / no action\n\n' +
    'Read by: Orchestrator Agent,\n' +
    'Signal Board, convergence-scan',
    '2'),

  // ── Layer 6: Domain Agents & Dashboards ────────────────────────────────────
  labelNode('lbl_agt', 'agtLabel', '# VAULT DOMAIN AGENTS  (`16_Agents/`)  ·  DASHBOARDS  (`00_Dashboard/`)', '1'),

  fileNode('agt_orch', 0, 'agt', '16_Agents/Orchestrator Agent/README.md'),
  fileNode('agt_mkt',  1, 'agt', '16_Agents/Market Agent/README.md'),
  fileNode('agt_mac',  2, 'agt', '16_Agents/Macro Agent/README.md'),
  fileNode('agt_fun',  3, 'agt', '16_Agents/Fundamentals Agent/README.md'),
  fileNode('agt_bio',  4, 'agt', '16_Agents/Biotech Agent/README.md'),
  fileNode('dash_acc', 5, 'agt', '16_Agents/Agent Command Center.md', { color: '1' }),

];

// ─── Edges ───────────────────────────────────────────────────────────────────

const edges = [

  // External APIs → Lib clients
  edge('src_market', 'lib_fmp'),
  edge('src_macro',  'lib_fetch'),
  edge('src_sec',    'lib_edgar'),
  edge('src_bio',    'lib_fetch'),
  edge('src_news',   'lib_fetch'),
  edge('src_gov',    'lib_fetch'),

  // Lib → Pullers
  edge('lib_fmp',    'pull_market'),
  edge('lib_fmp',    'pull_fund'),
  edge('lib_edgar',  'pull_fund'),
  edge('lib_fetch',  'pull_macro'),
  edge('lib_fetch',  'pull_bio'),
  edge('lib_fetch',  'pull_osint'),
  edge('lib_fetch',  'pull_gov'),

  // Lib → MarketMind
  edge('lib_fmp',    'mm_agents', 'prices + fundamentals'),
  edge('lib_fetch',  'mm_agents', 'FRED macro'),
  edge('lib_mm',     'mm_agents', 'entropy + scoring'),
  edge('lib_llm',    'mm_synth',  'Claude API'),

  // MarketMind internal flow
  edge('mm_agents',  'mm_synth',  '7 signals'),
  edge('mm_synth',   'mm_orch',   'verdict'),

  // Pullers → Outputs
  edge('pull_market', 'out_market'),
  edge('pull_fund',   'out_fund'),
  edge('pull_fund',   'out_signals', 'dilution alerts'),
  edge('pull_macro',  'out_macro'),
  edge('pull_bio',    'out_bio'),
  edge('pull_market', 'out_backtest', 'backtest'),

  // MarketMind → Outputs
  edge('mm_orch',     'out_market',  'agent analysis notes'),
  edge('mm_orch',     'out_signals', 'alert/critical signals'),

  // Outputs → Domain Agents
  edge('out_market',  'agt_mkt'),
  edge('out_fund',    'agt_fun'),
  edge('out_macro',   'agt_mac'),
  edge('out_bio',     'agt_bio'),
  edge('out_signals', 'agt_orch'),

  // Orchestrator → Command Center
  edge('agt_orch',    'dash_acc', 'routed intelligence'),

];

// ─── Write Canvas ─────────────────────────────────────────────────────────────

const outPath = resolve(getVaultRoot(), '00_Dashboard', 'Vault Process Flow.canvas');
const canvas = { nodes, edges };
writeFileSync(outPath, JSON.stringify(canvas, null, '\t'), 'utf8');
console.log(`Written: ${outPath}`);
console.log(`  ${nodes.length} nodes, ${edges.length} edges`);
