import { runTimedAgent } from './schemas.mjs';
import { runFundamentalsAgent } from './fundamentals-agent.mjs';
import { runMacroAgent } from './macro-agent.mjs';
import { runMicrostructureAgent } from './microstructure-agent.mjs';
import { runPredictionMarketAgent } from './prediction-market-agent.mjs';
import { runPriceAgent } from './price-agent.mjs';
import { runRiskAgent } from './risk-agent.mjs';
import { runSentimentAgent } from './sentiment-agent.mjs';

export const DEFAULT_AGENT_NAMES = Object.freeze([
  'price',
  'risk',
  'sentiment',
  'microstructure',
  'macro',
  'fundamentals',
  'prediction-market',
]);

const AGENT_REGISTRY = Object.freeze({
  price: runPriceAgent,
  risk: runRiskAgent,
  sentiment: runSentimentAgent,
  microstructure: runMicrostructureAgent,
  macro: runMacroAgent,
  fundamentals: runFundamentalsAgent,
  'prediction-market': runPredictionMarketAgent,
  prediction_market: runPredictionMarketAgent,
  prediction: runPredictionMarketAgent,
});

export function resolveAgentNames(value) {
  if (!value) return [...DEFAULT_AGENT_NAMES];
  const names = String(value)
    .split(',')
    .map(name => name.trim().toLowerCase().replace(/_/g, '-'))
    .filter(Boolean);
  return names.length ? [...new Set(names)] : [...DEFAULT_AGENT_NAMES];
}

export async function runAgentsInParallel(state, agentNames = DEFAULT_AGENT_NAMES) {
  const selected = agentNames.map(name => {
    const fn = AGENT_REGISTRY[name] || AGENT_REGISTRY[name.replace(/-/g, '_')];
    if (!fn) throw new Error(`Unknown agent "${name}". Available: ${Object.keys(AGENT_REGISTRY).join(', ')}`);
    return { name, fn };
  });

  return Promise.all(selected.map(({ name, fn }) => runTimedAgent(normalizeAgentName(name), () => fn(state))));
}

function normalizeAgentName(name) {
  return name === 'prediction-market' ? 'prediction_market' : name;
}
