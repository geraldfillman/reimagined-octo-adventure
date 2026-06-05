// LLM provider router. Same interface as llm-client.chatJson, but tries the
// local Claude Code CLI first (uses your desktop sign-in — no API tokens).
// Falls back to the HTTP API only if the CLI isn't on PATH or you force it.
//
// Provider selection precedence (highest wins):
//   1. opts.prefer  ('claude-code' | 'api' | 'auto' | 'none')
//   2. env LLM_PREFER (same values)
//   3. 'auto' — claude-code if available, else api, else skipped
//
// Output shape matches llm-client.chatJson:
//   { ok: true, provider, model, data }
//   { ok: false, skipped: true, reason } when no provider available
//   { ok: false, error } on hard failure

import { spawn } from 'node:child_process';
import { chatJson as apiChatJson, safeParseJson } from './llm-client.mjs';

const CLAUDE_BIN = 'claude';
let _claudeAvailable = null;

export async function chatJson(opts = {}) {
  const { messages, model, temperature, maxTokens, prefer } = opts;
  const choice = await chooseProvider(prefer);

  if (choice === 'none') {
    return { ok: false, skipped: true, reason: 'No LLM provider available (no claude CLI, no API key).' };
  }
  if (choice === 'claude-code') {
    return invokeClaudeCode({ messages });
  }
  if (choice === 'api') {
    return apiChatJson({ messages, model, temperature, maxTokens });
  }
  return { ok: false, skipped: true, reason: `Unknown provider choice: ${choice}` };
}

export async function detectClaudeCli() {
  if (_claudeAvailable !== null) return _claudeAvailable;
  _claudeAvailable = await new Promise(res => {
    const cmd = process.platform === 'win32' ? 'where' : 'which';
    const child = spawn(cmd, [CLAUDE_BIN], { stdio: 'ignore', shell: false });
    child.on('close', code => res(code === 0));
    child.on('error', () => res(false));
  });
  return _claudeAvailable;
}

export function detectApiKey() {
  return Boolean(
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.GROQ_API_KEY ||
    process.env.OPENROUTER_API_KEY,
  );
}

async function chooseProvider(prefer) {
  const want = String(prefer || process.env.LLM_PREFER || 'auto').toLowerCase();
  if (want === 'none') return 'none';
  const claudeOk = await detectClaudeCli();
  const apiOk = detectApiKey();

  if (want === 'claude-code') return claudeOk ? 'claude-code' : (apiOk ? 'api' : 'none');
  if (want === 'api')         return apiOk    ? 'api'         : (claudeOk ? 'claude-code' : 'none');
  // 'auto'
  if (claudeOk) return 'claude-code';
  if (apiOk)    return 'api';
  return 'none';
}

function invokeClaudeCode({ messages }) {
  const prompt = flattenMessages(messages);

  return new Promise(resolve => {
    // shell:true on Windows so .cmd/.bat shims resolve; safe here because
    // we only spawn the literal CLAUDE_BIN, no user input concatenated.
    const child = spawn(CLAUDE_BIN, ['-p'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    });

    let stdout = '', stderr = '';
    let settled = false;
    const settle = (v) => { if (!settled) { settled = true; resolve(v); } };

    const timeout = setTimeout(() => {
      try { child.kill(); } catch { /* ignore */ }
      settle({ ok: false, error: 'claude-code timeout (90s)' });
    }, 90_000);

    child.stdout.on('data', d => { stdout += d.toString(); });
    child.stderr.on('data', d => { stderr += d.toString(); });

    child.on('close', code => {
      clearTimeout(timeout);
      if (code !== 0) {
        const note = (stderr.split('\n').find(l => l.trim()) || `exit=${code}`).slice(0, 240);
        return settle({ ok: false, error: `claude-code: ${note}` });
      }
      try {
        const data = safeParseJson(stdout);
        settle({ ok: true, provider: 'claude-code', model: 'claude-code', data });
      } catch (err) {
        settle({ ok: false, error: `claude-code parse: ${err.message.slice(0, 200)}` });
      }
    });

    child.on('error', err => {
      clearTimeout(timeout);
      settle({ ok: false, error: `claude-code spawn: ${err.message}` });
    });

    child.stdin.end(prompt);
  });
}

function flattenMessages(messages) {
  // Claude Code's -p mode reads a single prompt from stdin. Prefix system
  // messages with a tag so they're treated as constraints, not user input.
  return messages.map(m => {
    if (m.role === 'system') return `[System Instructions]\n${m.content}`;
    if (m.role === 'assistant') return `[Prior Assistant]\n${m.content}`;
    return m.content;
  }).join('\n\n');
}
