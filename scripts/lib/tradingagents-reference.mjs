/**
 * tradingagents-reference.mjs - Metadata for the optional TradingAgents fork.
 *
 * This is attribution/reference metadata only. Do not import TradingAgents code
 * at runtime, spawn its CLI, or require its Python environment from vault scripts.
 */

export const TRADINGAGENTS_REFERENCE = Object.freeze({
  repository: 'https://github.com/TauricResearch/TradingAgents',
  reviewed_ref: 'main',
  reviewed_commit: '7e9e7b83c7fcc18d941300b253c6ed24d985788d',
  license: 'Apache-2.0',
  reviewed_on: '2026-05-02',
  reviewed_files: [
    'README.md',
    'LICENSE',
    'tradingagents/graph/setup.py',
    'tradingagents/graph/trading_graph.py',
    'tradingagents/graph/conditional_logic.py',
    'tradingagents/graph/propagation.py',
    'tradingagents/agents/utils/agent_states.py',
    'tradingagents/agents/schemas.py',
    'tradingagents/agents/researchers/bull_researcher.py',
    'tradingagents/agents/researchers/bear_researcher.py',
    'tradingagents/agents/managers/research_manager.py',
    'tradingagents/agents/managers/portfolio_manager.py',
    'tradingagents/agents/risk_mgmt/aggressive_debator.py',
    'tradingagents/agents/risk_mgmt/conservative_debator.py',
    'tradingagents/agents/risk_mgmt/neutral_debator.py',
    'tradingagents/agents/trader/trader.py',
  ],
  runtime_dependency_allowed: false,
});
