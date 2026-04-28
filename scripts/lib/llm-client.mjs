/**
 * llm-client.mjs - Direct OpenAI-compatible JSON chat client.
 *
 * No LangChain, no provider SDK. This is intentionally tiny and optional.
 */

import { fetchWithRetry } from './fetcher.mjs';

export async function chatJson({ messages, model, provider, temperature = 0.1, maxTokens = 700 } = {}) {
  const config = resolveProviderConfig({ provider, model });
  if (!config) {
    return { ok: false, skipped: true, reason: 'No LLM provider key configured.' };
  }

  const response = await fetchWithRetry(config.url, {
    method: 'POST',
    timeout: 30_000,
    retries: 2,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: {
      model: config.model,
      messages,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    },
  });

  if (!response.ok) {
    throw new Error(`LLM HTTP ${response.status}: ${JSON.stringify(response.data).slice(0, 240)}`);
  }

  const content = response.data?.choices?.[0]?.message?.content;
  return { ok: true, provider: config.provider, model: config.model, data: safeParseJson(content) };
}

export function safeParseJson(content) {
  const text = String(content || '').trim();
  if (!text) throw new Error('LLM response was empty.');

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : text;
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    throw new Error('LLM response was not valid JSON.');
  }
}

function resolveProviderConfig({ provider, model }) {
  const selected = String(provider || process.env.AGENT_LLM_PROVIDER || '').toLowerCase();
  const explicitBaseUrl = process.env.AGENT_LLM_BASE_URL;
  const explicitKey = process.env.AGENT_LLM_API_KEY;
  const explicitModel = model || process.env.AGENT_LLM_MODEL;

  if (explicitBaseUrl && explicitKey && explicitModel) {
    return {
      provider: selected || 'custom',
      url: `${explicitBaseUrl.replace(/\/$/, '')}/chat/completions`,
      apiKey: explicitKey,
      model: explicitModel,
    };
  }

  if ((selected === 'groq' || (!selected && process.env.GROQ_API_KEY)) && process.env.GROQ_API_KEY) {
    return {
      provider: 'groq',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      apiKey: process.env.GROQ_API_KEY,
      model: explicitModel || 'llama-3.3-70b-versatile',
    };
  }

  if ((selected === 'openai' || (!selected && process.env.OPENAI_API_KEY)) && process.env.OPENAI_API_KEY && explicitModel) {
    return {
      provider: 'openai',
      url: 'https://api.openai.com/v1/chat/completions',
      apiKey: process.env.OPENAI_API_KEY,
      model: explicitModel,
    };
  }

  return null;
}
